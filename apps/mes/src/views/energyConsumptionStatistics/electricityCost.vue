<script lang="ts" setup>
import type { TourProps } from 'ant-design-vue';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Chart } from '@antv/g2';
import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  Form,
  FormItem,
  RadioGroup,
  RangePicker,
  Row,
  Segmented,
  Statistic,
  Tag,
  Tour,
} from 'ant-design-vue';

import BasicTblae from '#/util/component/basicTblae.vue';

// region 查询数据
// 查询参数
const queryParams = ref({
  // 查询时间
  searchTime: [] as any,
  // 时间粒度
  timeGranularity: 'DAY',
});
// 时间粒度列表
const timeGranularityList = ref([
  {
    label: $t('energyConsumption.energyConsumptionStatistics.hourS'),
    value: 'HOUR',
  },
  {
    label: $t('energyConsumption.energyConsumptionStatistics.day'),
    value: 'DAY',
  },
  {
    label: $t('energyConsumption.energyConsumptionStatistics.month'),
    value: 'MONTH',
  },
  {
    label: $t('energyConsumption.energyConsumptionStatistics.year'),
    value: 'YEAR',
  },
]);
// 电费信息
const electricityRateInformation = ref<any>({
  // 总电费
  totalElectricityCharge: {
    electrovalence: 1.2,
  },
  // 尖时段电费
  peakPeriod: {
    electrovalence: 2,
  },
  // 峰时段电费
  peakHour: {
    electrovalence: 1,
  },
  // 平时段电费
  normalPeriodCharge: {
    electrovalence: 1,
  },
  // 谷时段电费
  valleyInterval: {
    electrovalence: 0.5,
  },
});

/**
 * 获取电费的中文描述
 * @param key 电费的key
 * @returns 电费的中文描述
 */
function getADescriptionOfTheTariffInChinese(key: any): string {
  switch (key) {
    case 'normalPeriodCharge': {
      // 平时段电费
      return $t(
        'energyConsumption.energyConsumptionStatistics.normalPeriodCharge',
      );
    }
    case 'peakHour': {
      // 峰时段电费
      return $t(
        'energyConsumption.energyConsumptionStatistics.electricityBillDuringPeakHours',
      );
    }
    case 'peakPeriod': {
      // 尖时段电费
      return $t('energyConsumption.energyConsumptionStatistics.peakCharge');
    }
    case 'totalElectricityCharge': {
      // 总电费
      return $t(
        'energyConsumption.energyConsumptionStatistics.totalElectricityCharge',
      );
    }
    case 'valleyInterval': {
      // 谷时段电费
      return $t('energyConsumption.energyConsumptionStatistics.valleyCharge');
    }
    default: {
      // 未定义的类型
      return $t('energyConsumption.energyConsumptionStatistics.undefinedType');
    }
  }
}

/**
 * 获取电价的中文描述
 * @param key 电价的key
 * @returns 电价的中文描述
 */
function obtainTheChineseDescriptionOfTheElectricityPrice(key: any): string {
  switch (key) {
    case 'totalElectricityCharge': {
      // 平均电价
      return $t(
        'energyConsumption.energyConsumptionStatistics.averageElectricityPrice',
      );
    }
    default: {
      // 电价
      return $t(
        'energyConsumption.energyConsumptionStatistics.electricityPrice',
      );
    }
  }
}
// endregion

// region 显示类型
// 显示类型
const showType = ref([
  // 图表
  {
    label: $t('energyConsumption.energyConsumptionStatistics.chart'),
    value: 'chart',
  },
  // 表格
  {
    label: $t('energyConsumption.energyConsumptionStatistics.table'),
    value: 'table',
  },
]);
// 当前选中的显示类型
const selectShowType = ref('chart');

// endregion

// region 图表

// region 电费分析
// 用于存储电费分析图表实例
let electricityRateAnalysisChart: any;
// 电费分析图表数据
const electricityRateAnalysisChartData = ref<any>([
  { item: '尖电费', count: 40, percent: 0.4 },
  { item: '峰电费', count: 21, percent: 0.21 },
  { item: '平电费', count: 17, percent: 0.17 },
  { item: '谷电费', count: 13, percent: 0.13 },
]);

/**
 * 创建能耗占比分析图表
 */
function createAnAnalyticalEnergyShareChart() {
  if (electricityRateAnalysisChart) {
    // 绑定数据并渲染图表
    electricityRateAnalysisChart.data(electricityRateAnalysisChartData.value);
  } else {
    electricityRateAnalysisChart = new Chart({
      container: 'electricityRateAnalysis',
    });

    electricityRateAnalysisChart.options({
      type: 'view',
      autoFit: true,
      height: 400,
      coordinate: { type: 'theta', outerRadius: 0.8, innerRadius: 0.5 },
      children: [
        {
          type: 'interval',
          data: electricityRateAnalysisChartData.value,
          encode: { y: 'percent', color: 'item' },
          transform: [{ type: 'stackY' }],
          scale: {
            color: {
              type: 'ordinal',
              range: ['#df273e', '#ff8447', '#f3d025', '#6ec71f'],
            },
          },
          legend: {
            color: { position: 'bottom', layout: { justifyContent: 'center' } },
          },
          labels: [
            {
              position: 'outside',
              text: (data: any) => `${data.percent * 100}%`,
            },
          ],
          tooltip: {
            items: [
              (data: any) => ({
                name: data.item,
                value: `${data.percent * 100}%`,
              }),
            ],
          },
        },
        {
          type: 'text',
          style: {
            text: '各时段占比',
            x: '50%',
            y: '50%',
            fontSize: 34,
            fill: '#8c8c8c',
            textAlign: 'center',
          },
        },
      ],
    });
  }

  electricityRateAnalysisChart.render();
}

// endregion

// region 电费用量
let electricityUsageChart: any;
// 电费用量图表数据 type: '谷电费'-谷电费 2-平电费 3-峰电费 4-尖电费
const electricityConsumptionChartData = ref<any>([
  {
    time: '12-01',
    value: 100,
    type: '谷电费',
  },
  {
    time: '12-01',
    value: 120,
    type: '平电费',
  },
  {
    time: '12-01',
    value: 110,
    type: '峰电费',
  },
  {
    time: '12-01',
    value: 130,
    type: '尖电费',
  },
  {
    time: '12-02',
    value: 105,
    type: '谷电费',
  },
  {
    time: '12-02',
    value: 125,
    type: '平电费',
  },
  {
    time: '12-02',
    value: 115,
    type: '峰电费',
  },
  {
    time: '12-02',
    value: 135,
    type: '尖电费',
  },
  {
    time: '12-03',
    value: 110,
    type: '谷电费',
  },
  {
    time: '12-03',
    value: 130,
    type: '平电费',
  },
  {
    time: '12-03',
    value: 120,
    type: '峰电费',
  },
  {
    time: '12-03',
    value: 140,
    type: '尖电费',
  },
  {
    time: '12-04',
    value: 115,
    type: '谷电费',
  },
  {
    time: '12-04',
    value: 135,
    type: '平电费',
  },
  {
    time: '12-04',
    value: 125,
    type: '峰电费',
  },
  {
    time: '12-04',
    value: 145,
    type: '尖电费',
  },
  {
    time: '12-05',
    value: 120,
    type: '谷电费',
  },
  {
    time: '12-05',
    value: 140,
    type: '平电费',
  },
  {
    time: '12-05',
    value: 130,
    type: '峰电费',
  },
  {
    time: '12-05',
    value: 150,
    type: '尖电费',
  },
]);
/**
 * 创建电费用量图表
 */
function createAChartOfElectricityUsage() {
  if (electricityUsageChart) {
    // 绑定数据并渲染图表
    electricityUsageChart.data(electricityConsumptionChartData.value);
  }
  electricityUsageChart = new Chart({ container: 'electricityConsumption' });

  electricityUsageChart.options({
    type: 'interval',
    autoFit: true,
    height: 440,
    data: electricityConsumptionChartData.value,
    encode: { x: 'time', y: 'value', color: 'type' },
    transform: [{ type: 'stackY' }, { type: 'sortX', by: 'y', reverse: true }],
    scale: {
      color: {
        type: 'ordinal',
        range: ['#6ec71f', '#f3d025', '#ff8447', '#df273e'],
      },
    },
    axis: {
      x: { labelSpacing: 4, labelTransform: 'rotate(90)', title: '时间' },
      y: { labelFormatter: '~s', title: '电费(元)' },
    },
    tooltip: {
      items: [
        (data: any) => ({
          name: data.type,
          value: `${data.value}元`,
        }),
      ],
    },
  });

  electricityUsageChart.render();
}

// endregion

// endregion

// region 表格
// 表格列配置项
const columns: any = [
  { title: '序号', type: 'seq', width: 50 }, // 自动生成序号列
  { field: 'worksheetCode1', title: '字段A', minWidth: 200 },
  { field: 'worksheetCode2', title: '字段B', minWidth: 200 },
  { field: 'worksheetCode3', title: '字段C', minWidth: 200 },
  { field: 'worksheetCode4', title: '字段D', minWidth: 200 },
  { field: 'worksheetCode5', title: '字段E', minWidth: 200 },
  { field: 'worksheetCode6', title: '字段F', minWidth: 200 },
  { field: 'worksheetCode7', title: '字段G', minWidth: 200 },
];
/**
 * 从服务器查询工作站数据的函数。
 * 这个函数用于发送查询请求，并在成功获取数据后更新组件的状态。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    resolve({
      total: page * pageSize,
      items: [],
    });
  });
}

// endregion

// region 指引
const ref1 = ref();
const ref2 = ref();
const ref3 = ref();
const ref4 = ref();
// 是否显示指引
const open = ref(true);
// 当前在第几步
const current = ref(0);
const steps: TourProps['steps'] = [
  {
    title: '查询',
    description: '在这个地方选择相应的查询条件进行查询.',
    target: () => ref1.value && ref1.value.$el,
  },
  {
    title: '基本信息显示',
    description: '在这个地方会显示查询到的用电信息总览.',
    target: () => ref2.value && ref2.value.$el,
  },
  {
    title: '显示切换',
    description: '在这里切换展示数据的形式.',
    target: () => ref3.value && ref3.value.$el,
  },
  {
    title: '数据展示',
    description: '在这里展示详细的数据, 以图表或者表格的形式.',
    target: () => ref4.value && ref4.value.$el,
  },
];

/**
 * 关闭指引, 在本地存储中标记为已打开过, 下次不再显示
 */
function closeGuide() {
  open.value = false;

  if (current.value === steps!.length - 1) {
    const guide_str = localStorage.getItem('guide');
    let guide: any;
    if (guide_str) {
      guide = JSON.parse(guide_str);
      guide.electricityCost = true;
    } else {
      guide = {
        electricityCost: true,
      };
    }
    localStorage.setItem('guide', JSON.stringify(guide));
  }
}

// endregion

onMounted(() => {
  const guide_str = localStorage.getItem('guide');
  if (guide_str) {
    const guide = JSON.parse(guide_str);
    if (guide.electricityCost) {
      open.value = false;
    }
  }
  // 初始化图表
  createAnAnalyticalEnergyShareChart();
  createAChartOfElectricityUsage();
});
</script>

<template>
  <Page>
    <!-- region 查询条件 -->
    <Card
      :title="
        $t('energyConsumption.energyConsumptionStatistics.wattHourCharge')
      "
      class="mb-4"
    >
      <Form :model="queryParams" layout="inline" ref="ref1">
        <!-- 时间范围 -->
        <FormItem
          :label="
            $t('energyConsumption.energyConsumptionStatistics.timeGranularity')
          "
          style="margin-bottom: 1em"
        >
          <Segmented
            v-model:value="queryParams.timeGranularity"
            :options="timeGranularityList"
          />
        </FormItem>
        <!-- 时间范围 -->
        <FormItem
          :label="$t('energyConsumption.energyConsumptionStatistics.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.searchTime" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->
    <!-- region 基本信息 -->
    <Card>
      <!-- region 电费基本信息 -->
      <Flex class="mb-4" ref="ref2">
        <div
          class="flex-1 border-2 p-4"
          v-for="(item, key) in electricityRateInformation"
          :key="key"
        >
          <Row>
            <Col span="24" offset="1">
              <span class="text-lg font-semibold">
                {{ getADescriptionOfTheTariffInChinese(key) }}
              </span>

              <Tag
                :bodered="false"
                color="processing"
                class="ml-8 align-text-bottom"
              >
                {{ obtainTheChineseDescriptionOfTheElectricityPrice(key) }}:
                {{ item.electrovalence }}元/kWh
              </Tag>
            </Col>
          </Row>
          <Row class="mt-4">
            <Col :span="8" :offset="2" class="text-center">
              <!-- 电费 -->
              <Statistic
                :title="
                  $t(
                    'energyConsumption.energyConsumptionStatistics.electricCharge',
                  )
                "
                :value="item.electrovalence"
              />
            </Col>
            <Col :span="8" :offset="2" class="text-center">
              <!-- 用电量 -->
              <Statistic
                :title="
                  $t(
                    'energyConsumptionStatistics.electricityConsumptionAndUnit',
                  )
                "
                :value="item.electrovalence"
              />
            </Col>
          </Row>
        </div>
      </Flex>
      <!-- endregion -->
      <!-- region 显示类型 -->
      <RadioGroup
        ref="ref3"
        v-model:value="selectShowType"
        option-type="button"
        :options="showType"
      />
      <!-- endregion -->

      <!-- region 图表 -->
      <Row
        ref="ref4"
        :gutter="10"
        class="mt-4"
        v-show="selectShowType === 'chart'"
      >
        <Col :span="10">
          <!-- 电费分析 -->
          <Card
            :title="
              $t(
                'energyConsumption.energyConsumptionStatistics.electricityRateAnalysis',
              )
            "
          >
            <Alert
              message="提示：避峰用谷，合理调配可以降低总用电费用。"
              type="warning"
              show-icon
            />
            <div id="electricityRateAnalysis"></div>
          </Card>
        </Col>
        <Col :span="14">
          <!-- 电费用量 -->
          <Card
            :title="
              $t(
                'energyConsumption.energyConsumptionStatistics.electricityConsumption',
              )
            "
          >
            <div id="electricityConsumption"></div>
          </Card>
        </Col>
      </Row>
      <!-- endregion -->
      <!-- region 表格 -->
      <BasicTblae
        :columns="columns"
        :query-data="queryData"
        v-if="selectShowType === 'table'"
      />
      <!-- endregion -->
    </Card>
    <!-- endregion -->
    <!-- 操作步骤 -->
    <Tour
      v-model:current="current"
      :steps="steps"
      :open="open"
      @close="closeGuide()"
    />
  </Page>
</template>

<style scoped></style>
