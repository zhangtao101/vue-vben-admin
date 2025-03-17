<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MaterialSymbolsSearch } from '@vben/icons';
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
} from 'ant-design-vue';

import BasicTblae from '#/utils/component/basicTblae.vue';

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
    label: $t('energyConsumptionStatistics.hourS'),
    value: 'HOUR',
  },
  {
    label: $t('energyConsumptionStatistics.day'),
    value: 'DAY',
  },
  {
    label: $t('energyConsumptionStatistics.month'),
    value: 'MONTH',
  },
  {
    label: $t('energyConsumptionStatistics.year'),
    value: 'YEAR',
  },
]);

// endregion

// region 显示类型
// 显示类型
const showType = ref([
  // 图表
  {
    label: $t('energyConsumptionStatistics.chart'),
    value: 'chart',
  },
  // 表格
  {
    label: $t('energyConsumptionStatistics.table'),
    value: 'table',
  },
]);
// 当前选中的显示类型
const selectShowType = ref('chart');

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

// region 图表
// 功率因数图表对象
let powerFactorDiagram: any;
// 功率因数图表数据
const powerFactorDiagramData = ref([
  { time: '10:10', call: 4, waiting: 2, people: 2, mock: 3 },
  { time: '10:15', call: 2, waiting: 6, people: 3, mock: 4 },
  { time: '10:20', call: 13, waiting: 2, people: 5, mock: 1 },
  { time: '10:25', call: 9, waiting: 9, people: 1, mock: 2 },
  { time: '10:30', call: 5, waiting: 2, people: 3, mock: 5 },
  { time: '10:35', call: 8, waiting: 2, people: 1, mock: 3 },
  { time: '10:40', call: 13, waiting: 1, people: 2, mock: 2 },
]);

function powerFactorDiagramInit() {
  powerFactorDiagram = new Chart({ container: 'powerFactorDiagram' });

  powerFactorDiagram.options({
    type: 'view',
    autoFit: true,
    data: powerFactorDiagramData.value,
    children: [
      {
        type: 'line',
        encode: {
          x: 'time',
          y: 'mock',
          color: () => 'mock',
          series: () => 'mock',
        },
        scale: { y: { nice: true } },
        axis: { y: { title: null } },
      },
      {
        type: 'line',
        encode: {
          x: 'time',
          y: 'people',
          color: () => 'people',
        },
        scale: { series: { independent: true } },
      },
      {
        type: 'line',
        encode: {
          x: 'time',
          y: 'call',
          color: () => 'call',
          series: () => 'call',
        },
        scale: { y: { key: '2' } },
        axis: { y: { position: 'right', grid: null, title: null } },
      },
    ],
  });

  powerFactorDiagram.render();
}
// endregion

// region 初始化

onMounted(() => {
  powerFactorDiagramInit();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 查询条件 -->
    <Card
      :title="$t('energyConsumptionStatistics.powerRegulationCharge')"
      class="mb-4"
    >
      <Form :model="queryParams" layout="inline">
        <!-- 时间范围 -->
        <FormItem
          :label="$t('energyConsumptionStatistics.timeGranularity')"
          style="margin-bottom: 1em"
        >
          <Segmented
            v-model:value="queryParams.timeGranularity"
            :options="timeGranularityList"
          />
        </FormItem>
        <!-- 时间范围 -->
        <FormItem
          :label="$t('energyConsumptionStatistics.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.searchTime" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MaterialSymbolsSearch, { class: 'inline-block mr-2' })"
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
      <Flex class="mb-4">
        <!--region 无功罚款 -->
        <div class="flex-1 border-2 p-4">
          <Row>
            <Col span="24" offset="1" class="text-center">
              <span class="text-2xl text-lg font-semibold">
                {{ $t('energyConsumptionStatistics.reactivePowerPenalty') }}
              </span>
            </Col>
          </Row>
          <Row class="mt-4" :gutter="24">
            <Col :span="8" class="text-center">
              <!-- 年累计(元) -->
              <Statistic
                :title="$t('energyConsumptionStatistics.annualAccumulation')"
                :value="444"
              />
            </Col>
            <Col :span="8" class="text-center">
              <!-- 最大值(元) -->
              <Statistic
                :title="$t('energyConsumptionStatistics.maximumValue')"
                :value="111"
              />
            </Col>
            <Col :span="8" class="text-center">
              <!-- 每月平均(元) -->
              <Statistic
                :title="$t('energyConsumptionStatistics.monthlyAverage')"
                :value="111"
              />
            </Col>
          </Row>
        </div>
        <!-- endregion -->
        <!--region 功率因数 -->
        <div class="flex-1 border-2 p-4">
          <Row>
            <Col span="24" offset="1" class="text-center">
              <span class="text-2xl text-lg font-semibold">
                {{ $t('energyConsumptionStatistics.powerFactor') }}
              </span>
            </Col>
          </Row>
          <Row class="mt-4" :gutter="24">
            <Col :span="8" class="text-center">
              <!-- 功率因数KPI -->
              <Statistic
                :title="$t('energyConsumptionStatistics.powerFactorKPI')"
                :value="444"
              />
            </Col>
            <Col :span="8" class="text-center">
              <!-- 最大值 -->
              <Statistic
                :title="
                  $t('energyConsumptionStatistics.theMaximumValueTakesNoUnits')
                "
                :value="111"
              />
            </Col>
            <Col :span="8" class="text-center">
              <!-- 最小值 -->
              <Statistic
                :title="
                  $t('energyConsumptionStatistics.minimumValueWithoutUnits')
                "
                :value="111"
              />
            </Col>
          </Row>
        </div>
        <!-- endregion -->
      </Flex>
      <!-- endregion -->
      <!-- region 显示类型 -->
      <Row>
        <Col span="12">
          <RadioGroup
            v-model:value="selectShowType"
            option-type="button"
            :options="showType"
          />
        </Col>
        <Col span="12">
          <Alert
            message="提示：合理的无功补偿，提高功率因数，可以避免罚款，降低电能损耗，改善电能质量。"
            type="warning"
            show-icon
          />
        </Col>
      </Row>
      <!-- endregion -->

      <!-- region 图表 -->
      <Row :gutter="10" class="mt-4" v-show="selectShowType === 'chart'">
        <Col :span="24">
          <!-- 力调电费/功率因数 -->
          <Card
            :title="
              $t('energyConsumptionStatistics.powerAdjustmentChargePowerFactor')
            "
          >
            <div id="powerFactorDiagram"></div>
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
  </Page>
</template>

<style scoped></style>
