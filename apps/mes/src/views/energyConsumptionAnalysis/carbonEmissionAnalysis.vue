<script lang="ts" setup>
/**
 * 碳排放分析页面
 * 功能：分析电能和燃气消耗产生的碳排放数据，支持参数导入和图表展示
 *
 * 主要功能模块：
 * 1. 数据查询条件设置（仪表类型、时间范围等）
 * 2. 碳排放数据图表展示
 * 3. 电网排放因子参数管理
 * 4. 燃气二氧化碳计算参数管理
 * 5. 统计数据展示
 */

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Chart } from '@antv/g2';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Empty,
  Form,
  FormItem,
  InputNumber,
  message,
  RadioButton,
  RadioGroup,
  RangePicker,
  Row,
  Select,
  Space,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  getCo2Data,
  getCo2YB,
  introductionOfGasCarbonDioxideCalculationParameter,
  introductionOfGridEmissionFactors,
} from '#/api';
import MyStatistic from '#/util/myStatistic.vue';

// region 数据查询相关功能

/**
 * 仪表类型选项
 * 1-电表，3-气表
 */
const type = [
  {
    label: '电表',
    value: 1,
  },
  {
    label: '气表',
    value: 3,
  },
];

/**
 * 查询参数
 * 默认选择电表类型，按月统计
 */
const queryParams = ref<any>({
  type: 1,
  timeType: 2,
});

/**
 * 时间选择器类型映射
 * 根据时间粒度设置选择器的picker类型
 */
const timeType: any = {
  2: 'month', // 月度
  3: 'year', // 年度
};

/**
 * 仪表分项名称列表
 * 用于选择具体的采集仪表
 */
const dataTypeList = ref<any>([]);

/**
 * 查询对应类型下的仪表分项名称
 * 根据选择的仪表类型获取可用的仪表列表
 */
function queryEquipTypeList() {
  getCo2YB({
    type: queryParams.value.type,
  }).then((data) => {
    dataTypeList.value = [];
    // 将返回的字符串数组转换为选项格式
    data.forEach((item: string) => {
      dataTypeList.value.push({
        label: item,
        value: item,
      });
    });
  });
}

// endregion

// region 图表相关功能

/**
 * G2图表实例
 */
let chart: any;

/**
 * 初始化或更新碳排放图表
 * 显示两条线：a线（实际值）和b线（对比值），超出部分用红点标记
 *
 * @param chartData 图表数据数组，包含x轴时间、a值、b值
 */
function chartInit(chartData: any = []) {
  // 计算超出点（a值大于b值的点）
  const exceedPoints = chartData
    .filter((d: any) => d.a > d.b)
    .map((d: any) => ({ x: d.x, y: d.a }));

  if (chart) {
    // 更新现有图表
    const lines = chart.getNodesByType('line');
    const pointsMark = chart.getNodesByType('point')[0];

    // 更新第一条线(a线) - 实际排放值
    lines[0].data(chartData);

    // 更新第二条线(b线) - 对比值
    lines[1].data(chartData);

    // 更新超出标记点
    pointsMark.data(exceedPoints);

    chart.options({
      data: chartData,
    });
  } else {
    // 创建新图表
    chart = new Chart({ container: 'container' });
    chart.options({
      type: 'view',
      autoFit: true,
      data: chartData,
      children: [
        {
          type: 'line',
          data: chartData,
          encode: {
            x: 'x',
            y: 'a', // 实际排放值
          },
          style: {
            stroke: '#1890ff',
            lineWidth: 2,
          },
        },
        {
          type: 'line',
          data: chartData,
          encode: {
            x: 'x',
            y: 'b', // 对比值
          },
          style: {
            stroke: '#f04864',
            lineWidth: 2,
          },
        },
        {
          type: 'point',
          data: exceedPoints,
          encode: {
            x: 'x',
            y: 'y',
          },
          style: {
            fill: 'red',
            r: 5,
            lineWidth: 2,
          },
        },
      ],
    });
  }

  chart.render();
}

/**
 * 时间格式化映射
 * 根据时间粒度设置不同的日期格式
 */
const formMat: any = {
  1: 'YYYY-MM-DD', // 日
  2: 'YYYY-MM', // 月
  3: 'YYYY', // 年
};

/**
 * 图表数据详情
 * 存储除了图表数据外的其他统计信息
 */
const details = ref<any>({});

/**
 * 查询碳排放图表数据
 * 根据查询条件获取数据并更新图表
 */
function queryChartData() {
  const params: any = {
    ...queryParams.value,
    dayType: timeType[queryParams.value.timeType],
  };

  // 处理时间范围参数
  if (queryParams.value.searchTime) {
    params.startDay = params.searchTime[0].format(
      formMat[queryParams.value.timeType],
    );
    params.endDay = params.searchTime[1].format(
      formMat[queryParams.value.timeType],
    );
    delete params.searchTime;
  }

  // 调用接口获取数据
  getCo2Data(params).then(({ daycurrect, ...d }: any) => {
    // 保存图表外的详细信息
    details.value = d;

    // 如果有图表数据，延迟渲染图表（确保DOM已准备好）
    if (daycurrect && daycurrect.length > 0) {
      setTimeout(() => {
        chartInit(daycurrect);
      }, 200);
    }
  });
}

// endregion

// region 电网排放因子导入功能

/**
 * 是否显示电网排放因子导入抽屉
 */
const isShowGridEmissionFactorImportDrawer = ref(false);

/**
 * 电网排放因子导入表单数据
 */
const gridEmissionFactorImportFormState = ref<any>({});

/**
 * 电网排放因子导入表单引用
 */
const gridEmissionFactorImportFormRef = ref<any>({});

/**
 * 打开电网排放因子导入抽屉
 * 重置表单状态
 */
function showGridEmissionFactorImportDrawer() {
  isShowGridEmissionFactorImportDrawer.value = true;
  gridEmissionFactorImportFormState.value = {};
}

/**
 * 关闭电网排放因子导入抽屉
 * 清空表单数据
 */
function closeGridEmissionFactorImportDrawer() {
  isShowGridEmissionFactorImportDrawer.value = false;
  gridEmissionFactorImportFormState.value = {};
}

/**
 * 提交电网排放因子导入表单
 * 验证表单后调用接口保存数据
 */
function handleGridEmissionFactorImportSubmit() {
  gridEmissionFactorImportFormRef.value.validate().then((valid: boolean) => {
    if (valid) {
      const params: any = {
        ...gridEmissionFactorImportFormState.value,
      };

      // 格式化月份参数
      if (params.time) {
        params.time = params.time.format('YYYY-MM');
      }

      // 调用接口保存数据
      introductionOfGridEmissionFactors(params).then(() => {
        message.success($t('common.successfulOperation'));
        if (queryParams.value.equipmentCode) {
          closeGridEmissionFactorImportDrawer();
        }
      });
    }
  });
}

// endregion

// region 燃气二氧化碳计算参数导入功能

/**
 * 是否显示燃气二氧化碳计算参数导入抽屉
 */
const isShowGasCarbonDioxideCalculationParameterImportDrawer = ref(false);

/**
 * 燃气二氧化碳计算参数导入表单数据
 */
const gasCarbonDioxideCalculationParameterImportFormState = ref<any>({});

/**
 * 燃气二氧化碳计算参数导入表单引用
 */
const gasCarbonDioxideCalculationParameterImportFormRef = ref<any>({});

/**
 * 打开燃气二氧化碳计算参数导入抽屉
 * 重置表单状态
 */
function showGasCarbonDioxideCalculationParameterImportDrawer() {
  isShowGasCarbonDioxideCalculationParameterImportDrawer.value = true;
  gasCarbonDioxideCalculationParameterImportFormState.value = {};
}

/**
 * 关闭燃气二氧化碳计算参数导入抽屉
 * 清空表单数据
 */
function closeGasCarbonDioxideCalculationParameterImportDrawer() {
  isShowGasCarbonDioxideCalculationParameterImportDrawer.value = false;
  gasCarbonDioxideCalculationParameterImportFormState.value = {};
}

/**
 * 提交燃气二氧化碳计算参数导入表单
 * 验证表单后调用接口保存数据
 */
function handleGasCarbonDioxideCalculationParameterImportSubmit() {
  gasCarbonDioxideCalculationParameterImportFormRef.value
    .validate()
    .then((valid: boolean) => {
      if (valid) {
        const params: any = {
          ...gasCarbonDioxideCalculationParameterImportFormState.value,
        };

        // 格式化月份参数
        if (params.time) {
          params.time = params.time.format('YYYY-MM');
        }

        // 调用接口保存数据
        introductionOfGasCarbonDioxideCalculationParameter(params).then(() => {
          message.success($t('common.successfulOperation'));
          if (queryParams.value.equipmentCode) {
            closeGasCarbonDioxideCalculationParameterImportDrawer();
          }
        });
      }
    });
}
// endregion

// region 页面生命周期

/**
 * 页面挂载时初始化数据
 * 设置默认时间范围并查询仪表列表
 */
onMounted(() => {
  // 设置默认查询时间范围：上个月至今
  const now = dayjs();
  queryParams.value.searchTime = [now.subtract(1, 'month'), now];

  // 查询默认仪表类型的仪表列表
  queryEquipTypeList();

  // 暂时注释掉自动查询图表，需要用户手动选择仪表后查询
  // queryChartData();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 查询条件区域 -->
    <Card class="mb-4 mt-4">
      <Form :model="queryParams" layout="inline">
        <!-- 仪表类型 -->
        <FormItem
          :label="$t('energyConsumption.energyConsumptionAnalysis.meterType')"
          style="margin-bottom: 1em"
        >
          <RadioGroup
            v-model:value="queryParams.type"
            :options="type"
            class="!w-36"
            @change="queryEquipTypeList"
          />
        </FormItem>
        <!-- 采集仪表编号 -->
        <FormItem
          :label="
            $t(
              'energyConsumption.energyConsumptionCollectionDetails.collectTheInstrumentNumber',
            )
          "
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.equipmentCode"
            :options="dataTypeList"
            class="!w-36"
            @change="queryChartData()"
          />
        </FormItem>
        <!-- 时间粒度 -->
        <FormItem
          :label="$t('electricityConsumptionData.timeGranularity')"
          style="margin-bottom: 1em"
        >
          <RadioGroup v-model:value="queryParams.timeType" button-style="solid">
            <!-- 月 -->
            <RadioButton :value="2">
              {{ $t('electricityConsumptionData.month') }}
            </RadioButton>

            <!-- 年 -->
            <RadioButton :value="3">
              {{ $t('electricityConsumptionData.years') }}
            </RadioButton>
          </RadioGroup>
        </FormItem>
        <!-- 时间范围 -->
        <FormItem
          :label="$t('useEnergyThroughoutTheEntireSection.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker
            v-model:value="queryParams.searchTime"
            :picker="timeType[queryParams.timeType]"
          />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            :disabled="!queryParams.equipmentCode"
            @click="
              () => {
                queryChartData();
              }
            "
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->
    <!-- region 主要内容区域 -->
    <Card class="mb-4 mt-4">
      <div>
        <Space>
          <!-- 电网排放因子导入 -->
          <Button type="primary" @click="showGridEmissionFactorImportDrawer">
            {{
              $t(
                'energyConsumption.carbonEmissionAnalysis.gridEmissionFactorImport',
              )
            }}
          </Button>
          <!-- 燃气二氧化碳计算参数导入 -->
          <Button
            type="primary"
            @click="showGasCarbonDioxideCalculationParameterImportDrawer"
          >
            {{
              $t(
                'energyConsumption.carbonEmissionAnalysis.gasCarbonDioxideCalculationParameterImport',
              )
            }}
          </Button>
        </Space>
      </div>
      <Empty v-if="!details.currentValue" />
      <template v-else>
        <Row>
          <Col :span="12">
            <MyStatistic
              :title="
                $t(
                  'energyConsumption.energyConsumptionAnalysis.currentEmission',
                )
              "
              :percent="20"
              value="39,500"
              trend="down"
            />
          </Col>
          <Col :span="12">
            <MyStatistic
              :title="
                $t(
                  'energyConsumption.energyConsumptionAnalysis.currentEmission',
                )
              "
              :percent="20"
              value="39,500"
              trend="down"
            />
          </Col>
        </Row>
        <div id="container"></div>
      </template>
    </Card>
    <!-- endregion -->
    <!-- region 电网排放因子导入抽屉 -->
    <Drawer
      v-model:open="isShowGridEmissionFactorImportDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="600"
      class="custom-class"
      placement="right"
      :title="
        $t('energyConsumption.carbonEmissionAnalysis.gridEmissionFactorImport')
      "
      @close="closeGridEmissionFactorImportDrawer"
    >
      <Form
        ref="gridEmissionFactorImportFormRef"
        :model="gridEmissionFactorImportFormState"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
      >
        <!-- 排放因子 -->
        <FormItem
          :label="
            $t('energyConsumption.carbonEmissionAnalysis.emissionFactors')
          "
          :rules="[{ required: true, message: $t('ui.formRules.required') }]"
          style="margin-bottom: 1em"
          name="value"
        >
          <InputNumber
            v-model:value="gridEmissionFactorImportFormState.value"
            class="w-full"
          />
        </FormItem>
        <!-- 月份 -->
        <FormItem
          :label="$t('energyConsumption.carbonEmissionAnalysis.month')"
          :rules="[{ required: true, message: $t('ui.formRules.required') }]"
          style="margin-bottom: 1em"
          name="time"
        >
          <DatePicker
            v-model:value="gridEmissionFactorImportFormState.time"
            picker="month"
          />
        </FormItem>
      </Form>

      <!-- 抽屉底部操作按钮 -->
      <template #footer>
        <!-- 按钮组，包含取消和确认按钮 -->
        <Space>
          <!-- 取消按钮，点击后关闭人员操作抽屉 -->
          <Button @click="closeGridEmissionFactorImportDrawer">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认按钮，点击后提交人员操作信息 -->
          <Button type="primary" @click="handleGridEmissionFactorImportSubmit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->
    <!-- region 燃气二氧化碳计算参数导入抽屉 -->
    <Drawer
      v-model:open="isShowGasCarbonDioxideCalculationParameterImportDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="600"
      class="custom-class"
      placement="right"
      :title="
        $t(
          'energyConsumption.energyConsumptionCollectionDetails.collectTheInstrumentNumber',
        )
      "
      @close="closeGasCarbonDioxideCalculationParameterImportDrawer"
    >
      <Form
        ref="gasCarbonDioxideCalculationParameterImportFormRef"
        :model="gasCarbonDioxideCalculationParameterImportFormState"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
      >
        <!-- 低位发热量 -->
        <FormItem
          :label="$t('energyConsumption.carbonEmissionAnalysis.lowHeatContent')"
          :rules="[{ required: true, message: $t('ui.formRules.required') }]"
          style="margin-bottom: 1em"
          name="dwfr"
        >
          <InputNumber
            v-model:value="
              gasCarbonDioxideCalculationParameterImportFormState.dwfr
            "
            class="w-full"
          />
        </FormItem>
        <!-- 单位热值含碳量 -->
        <FormItem
          :label="
            $t(
              'energyConsumption.carbonEmissionAnalysis.unitHeatContentCarbonDioxideContent',
            )
          "
          :rules="[{ required: true, message: $t('ui.formRules.required') }]"
          style="margin-bottom: 1em"
          name="dwrl"
        >
          <InputNumber
            v-model:value="
              gasCarbonDioxideCalculationParameterImportFormState.dwrl
            "
            class="w-full"
          />
        </FormItem>
        <!-- 碳氧化率 -->
        <FormItem
          :label="
            $t(
              'energyConsumption.carbonEmissionAnalysis.carbonDioxideOxidationRate',
            )
          "
          :rules="[{ required: true, message: $t('ui.formRules.required') }]"
          style="margin-bottom: 1em"
          name="chl"
        >
          <InputNumber
            v-model:value="
              gasCarbonDioxideCalculationParameterImportFormState.chl
            "
            class="w-full"
          />
        </FormItem>
        <!-- 月份 -->
        <FormItem
          :label="$t('energyConsumption.carbonEmissionAnalysis.month')"
          :rules="[{ required: true, message: $t('ui.formRules.required') }]"
          style="margin-bottom: 1em"
          name="time"
        >
          <DatePicker
            v-model:value="
              gasCarbonDioxideCalculationParameterImportFormState.time
            "
            picker="month"
          />
        </FormItem>
      </Form>
      <!-- 抽屉底部操作按钮 -->
      <template #footer>
        <!-- 按钮组，包含取消和确认按钮 -->
        <Space>
          <!-- 取消按钮，点击后关闭人员操作抽屉 -->
          <Button
            @click="closeGasCarbonDioxideCalculationParameterImportDrawer"
          >
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认按钮，点击后提交人员操作信息 -->
          <Button
            type="primary"
            @click="handleGasCarbonDioxideCalculationParameterImportSubmit"
          >
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
