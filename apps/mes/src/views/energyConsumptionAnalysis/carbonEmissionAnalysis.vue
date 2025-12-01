<script lang="ts" setup>
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

// region 查询数据
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

// 查询参数
const queryParams = ref<any>({
  type: 1,
  timeType: 2,
});
// 时间选择器类型
const timeType: any = {
  2: 'month',
  3: 'year',
};

// 分项名称
const dataTypeList = ref<any>([]);

/**
 * 查询分项名称
 */
function queryEquipTypeList() {
  getCo2YB({
    type: queryParams.value.type,
  }).then((data) => {
    dataTypeList.value = [];
    data.forEach((item: string) => {
      dataTypeList.value.push({
        label: item,
        value: item,
      });
    });
  });
}

// endregion

// region 图表
// 图表
let chart: any;

/**
 * 图表初始化
 * @param chartData
 */
function chartInit(chartData: any = []) {
  const exceedPoints = chartData
    .filter((d: any) => d.a > d.b)
    .map((d: any) => ({ x: d.x, y: d.a }));
  if (chart) {
    const lines = chart.getNodesByType('line');
    const pointsMark = chart.getNodesByType('point')[0];
    // 更新第一条线(a线)
    lines[0].data(chartData);

    // 更新第二条线(b线)
    lines[1].data(chartData);

    // 更新超出点
    pointsMark.data(exceedPoints);

    chart.options({
      data: chartData,
    });
  } else {
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
            y: 'a',
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
            y: 'b',
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

const formMat: any = {
  1: 'YYYY-MM-DD',
  2: 'YYYY-MM',
  3: 'YYYY',
};

// 图表数据详情
const details = ref<any>({});
/**
 * 查询图表数据
 */
function queryChartData() {
  const params: any = {
    ...queryParams.value,
    dayType: timeType[queryParams.value.timeType],
  };
  if (queryParams.value.searchTime) {
    params.startDay = params.searchTime[0].format(
      formMat[queryParams.value.timeType],
    );
    params.endDay = params.searchTime[1].format(
      formMat[queryParams.value.timeType],
    );
    delete params.searchTime;
  }
  getCo2Data(params).then(({ daycurrect, ...d }: any) => {
    details.value = d;
    if (daycurrect && daycurrect.length > 0) {
      setTimeout(() => {
        chartInit(daycurrect);
      }, 200);
    }
  });
}

// endregion

// region 电网排放因子导入
// 电网排放因子导入抽屉是否显示
const isShowGridEmissionFactorImportDrawer = ref(false);
// 电网排放因子导入表单状态
const gridEmissionFactorImportFormState = ref<any>({});
// 电网排放因子导入表单引用
const gridEmissionFactorImportFormRef = ref<any>({});

/**
 * 显示电网排放因子导入抽屉
 */
function showGridEmissionFactorImportDrawer() {
  isShowGridEmissionFactorImportDrawer.value = true;
  gridEmissionFactorImportFormState.value = {};
}

/**
 * 关闭电网排放因子导入抽屉
 */
function closeGridEmissionFactorImportDrawer() {
  isShowGridEmissionFactorImportDrawer.value = false;
  gridEmissionFactorImportFormState.value = {};
}

/**
 * 处理电网排放因子导入表单提交
 */
function handleGridEmissionFactorImportSubmit() {
  gridEmissionFactorImportFormRef.value.validate().then((valid: boolean) => {
    if (valid) {
      const params: any = {
        ...gridEmissionFactorImportFormState.value,
      };
      if (params.time) {
        params.time = params.time.format('YYYY-MM');
      }
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

// region 燃气二氧化碳计算参数导入
// 电网排放因子导入抽屉是否显示
const isShowGasCarbonDioxideCalculationParameterImportDrawer = ref(false);
// 燃气二氧化碳计算参数导入表单状态
const gasCarbonDioxideCalculationParameterImportFormState = ref<any>({});
// 燃气二氧化碳计算参数导入表单引用
const gasCarbonDioxideCalculationParameterImportFormRef = ref<any>({});

/**
 * 显示电网排放因子导入抽屉
 */
function showGasCarbonDioxideCalculationParameterImportDrawer() {
  isShowGasCarbonDioxideCalculationParameterImportDrawer.value = true;
  gasCarbonDioxideCalculationParameterImportFormState.value = {};
}

/**
 * 关闭电网排放因子导入抽屉
 */
function closeGasCarbonDioxideCalculationParameterImportDrawer() {
  isShowGasCarbonDioxideCalculationParameterImportDrawer.value = false;
  gasCarbonDioxideCalculationParameterImportFormState.value = {};
}

/**
 * 处理电网排放因子导入表单提交
 */
function handleGasCarbonDioxideCalculationParameterImportSubmit() {
  gasCarbonDioxideCalculationParameterImportFormRef.value
    .validate()
    .then((valid: boolean) => {
      if (valid) {
        const params: any = {
          ...gasCarbonDioxideCalculationParameterImportFormState.value,
        };
        if (params.time) {
          params.time = params.time.format('YYYY-MM');
        }
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

// region 生命周期
onMounted(() => {
  // 获取当前时间
  const now = dayjs();
  queryParams.value.searchTime = [now.subtract(1, 'month'), now];
  queryEquipTypeList();
  // queryChartData();
});
// endregion
</script>

<template>
  <Page>
    <!-- region 查询条件 -->
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
    <!-- region 主要内容 -->
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
    <!-- region 电网排放因子 -->
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
    <!-- region 燃气二氧化碳计算参数导入 -->
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
