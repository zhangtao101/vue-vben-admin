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
  Empty,
  Form,
  FormItem,
  RadioButton,
  RadioGroup,
  Row,
  Select,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { gaugeDropDownBox, getCo2Data } from '#/api';
import MyStatistic from '#/util/myStatistic.vue';

// region 数据查询相关功能

/**
 * 仪表类型选项
 * 1-企业净购入电力隐含碳排放，3-化石燃料燃烧碳排放
 */
const type = [
  {
    label: '企业净购入电力隐含碳排放',
    value: 1,
  },
  {
    label: '化石燃料燃烧碳排放',
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
  gaugeDropDownBox({
    equipType: queryParams.value.type,
    equipmentCode: '',
  }).then((data) => {
    dataTypeList.value = [];
    // 将返回的字符串数组转换为选项格式
    data.forEach((item: any) => {
      dataTypeList.value.push({
        label: `${item.equipmentName}(${item.equipmentCode})`,
        value: item.equipmentCode,
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
    .filter((d: any) => d.currentValue > d.lastValue)
    .map((d: any) => ({ time: d.time, currentValue: d.currentValue }));

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
      axis: {
        x: {
          title: false, // 隐藏X轴标题
        },
        y: {
          title: false, // 隐藏Y轴标题
        },
      },
      children: [
        {
          type: 'line',
          data: chartData,
          encode: {
            x: 'time',
            y: 'currentValue',
            shape: 'smooth',
          },
          style: {
            stroke: '#1890ff',
            lineWidth: 2,
          },
          tooltip: {
            title: '时间',
            items: [
              { channel: 'y', name: '当期排放值', valueFormatter: '.0f' },
            ],
          },
        },
        {
          type: 'line',
          data: chartData,
          encode: {
            x: 'time',
            y: 'lastValue',
            shape: 'smooth',
          },
          style: {
            stroke: '#52c41a',
            lineWidth: 2,
          },
          tooltip: {
            title: '时间',
            items: [
              { channel: 'y', name: '上期排放值', valueFormatter: '.0f' },
            ],
          },
        },
        {
          type: 'point',
          data: exceedPoints,
          encode: {
            x: 'time',
            y: 'currentValue',
          },
          style: {
            fill: 'red',
            r: 8,
            lineWidth: 0,
          },
          tooltip: false,
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
    params.startDay = params.searchTime.format(
      formMat[queryParams.value.timeType],
    );
    params.endDay = params.searchTime.format(
      formMat[queryParams.value.timeType],
    );
    delete params.searchTime;
  }

  // 调用接口获取数据
  getCo2Data(params).then(({ daycurrect, ...d }: any) => {
    // 保存图表外的详细信息
    details.value = d;

    // 延迟渲染图表（确保DOM已准备好）, 没有则清空
    setTimeout(() => {
      chartInit(daycurrect || []);
    }, 200);
  });
}

const filterOption = (input: string, option: any) => {
  return (
    option.value.toLowerCase().includes(input.toLowerCase()) ||
    option.label.toLowerCase().includes(input.toLowerCase())
  );
};

// endregion

// region 页面生命周期

/**
 * 页面挂载时初始化数据
 * 设置默认时间范围并查询仪表列表
 */
onMounted(() => {
  // 设置默认查询时间范围：上个月至今
  const now = dayjs();
  queryParams.value.searchTime = now;

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
            @change="queryEquipTypeList"
          />
        </FormItem>
        <!-- 碳排放区域编号 -->
        <FormItem
          :label="
            $t(
              'energyConsumption.energyConsumptionCollectionDetails.regionNumber',
            )
          "
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.equipmentCode"
            :options="dataTypeList"
            class="!w-56"
            @change="queryChartData()"
            show-search
            :filter-option="filterOption"
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
          <DatePicker
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
      <Empty v-if="!(details.sumcurrent >= 0)" />
      <template v-else>
        <Row>
          <Col :span="12" class="mb-8">
            <MyStatistic
              :title="
                $t(
                  'energyConsumption.energyConsumptionAnalysis.currentEmission',
                )
              "
              :percent="
                details.sumLastcurrent
                  ? ((details.sumcurrent - details.sumLastcurrent) /
                      details.sumLastcurrent) *
                    100
                  : 0
              "
              :value="details.sumcurrent"
            />
          </Col>
          <Col :span="12">
            <MyStatistic
              :title="
                $t(
                  'energyConsumption.energyConsumptionAnalysis.previousEmission',
                )
              "
              :value="details.sumLastcurrent"
            />
          </Col>
        </Row>
        <div id="container"></div>
      </template>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
