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
  DirectoryTree,
  Form,
  FormItem,
  RadioButton,
  RadioGroup,
  RangePicker,
  Row,
  Select,
} from 'ant-design-vue';

import BasicTblae from '#/utils/component/basicTblae.vue';

/**
 * 显示类型
 */
const showType = ref(1);

// region 查询数据

// 查询参数
const queryParams = ref<any>({});
const dataTypeList = [
  {
    label: '有功功率',
    value: 1,
  },
  {
    label: '无功功率',
    value: 2,
  },
  {
    label: '视在功率',
    value: 3,
  },
  {
    label: '有功电量',
    value: 4,
  },
  {
    label: '无功电量',
    value: 5,
  },
  {
    label: '功率因数',
    value: 6,
  },
  {
    label: '电压/频率',
    value: 7,
  },
  {
    label: '电流频率',
    value: 8,
  },
  {
    label: '总用电曲线',
    value: 9,
  },
];
// endregion

// region 树形数据

// 树形数据
const treeData = ref<any>([
  {
    title: 'parent 0',
    key: '0-0',
    children: [
      {
        title: 'leaf 0-0',
        key: '0-0-0',
        isLeaf: true,
      },
      {
        title: 'leaf 0-1',
        key: '0-0-1',
        isLeaf: true,
      },
    ],
  },
  {
    title: 'parent 1',
    key: '0-1',
    children: [
      {
        title: 'leaf 1-0',
        key: '0-1-0',
        isLeaf: true,
      },
      {
        title: 'leaf 1-1',
        key: '0-1-1',
        isLeaf: true,
      },
    ],
  },
]);
// 展开的节点
const expandedKeys = ref<string[]>([]);
// 选中的节点
const selectedKeys = ref<string[]>([]);

// endregion

// region 图表
// 图表
let lineChart: any;
const data = [
  { month: 'Jan', city: 'Tokyo', temperature: 7 },
  { month: 'Jan', city: 'London', temperature: 3.9 },
  { month: 'Feb', city: 'Tokyo', temperature: 6.9 },
  { month: 'Feb', city: 'London', temperature: 4.2 },
  { month: 'Mar', city: 'Tokyo', temperature: 9.5 },
  { month: 'Mar', city: 'London', temperature: 5.7 },
  { month: 'Apr', city: 'Tokyo', temperature: 14.5 },
  { month: 'Apr', city: 'London', temperature: 8.5 },
  { month: 'May', city: 'Tokyo', temperature: 18.4 },
  { month: 'May', city: 'London', temperature: 11.9 },
  { month: 'Jun', city: 'Tokyo', temperature: 21.5 },
  { month: 'Jun', city: 'London', temperature: 15.2 },
  { month: 'Jul', city: 'Tokyo', temperature: 25.2 },
  { month: 'Jul', city: 'London', temperature: 17 },
  { month: 'Aug', city: 'Tokyo', temperature: 26.5 },
  { month: 'Aug', city: 'London', temperature: 16.6 },
  { month: 'Sep', city: 'Tokyo', temperature: 23.3 },
  { month: 'Sep', city: 'London', temperature: 14.2 },
  { month: 'Oct', city: 'Tokyo', temperature: 18.3 },
  { month: 'Oct', city: 'London', temperature: 10.3 },
  { month: 'Nov', city: 'Tokyo', temperature: 13.9 },
  { month: 'Nov', city: 'London', temperature: 6.6 },
  { month: 'Dec', city: 'Tokyo', temperature: 9.6 },
  { month: 'Dec', city: 'London', temperature: 4.8 },
];

function chartInit() {
  lineChart = new Chart({
    container: 'lineChart',
    autoFit: true,
    height: 500,
  });
  lineChart
    .data(data)
    .encode('x', 'month')
    .encode('y', 'temperature')
    .encode('color', 'city')
    .scale('x', {
      range: [0, 1],
    })
    .scale('y', {
      nice: true,
    })
    .axis('y', { labelFormatter: (d: any) => `${d}°C` });

  lineChart.line().encode('shape', 'smooth');

  lineChart.point().encode('shape', 'point').tooltip(false);

  lineChart.render();
}

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

// region 生命周期
onMounted(() => {
  chartInit();
});
</script>

<template>
  <Page>
    <RadioGroup v-model:value="showType" button-style="solid">
      <!-- 电能质量 -->
      <RadioButton :value="1">
        {{ $t('electricityConsumptionData.powerQuality') }}
      </RadioButton>

      <!-- 负荷曲线 -->
      <RadioButton :value="2">
        {{ $t('electricityConsumptionData.loadCurve') }}
      </RadioButton>
    </RadioGroup>
    <!-- region 查询条件 -->
    <Card class="mb-4 mt-4">
      <Form :model="queryParams" layout="inline">
        <!-- 数据类型 -->
        <FormItem
          :label="$t('electricityConsumptionData.dataType')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.searchTime"
            :options="dataTypeList"
            class="!w-36"
          />
        </FormItem>
        <!-- 时间粒度 -->
        <FormItem
          :label="$t('electricityConsumptionData.timeGranularity')"
          style="margin-bottom: 1em"
        >
          <RadioGroup v-model:value="queryParams.timeType" button-style="solid">
            <!-- 小时 -->
            <RadioButton :value="1">
              {{ $t('electricityConsumptionData.hourS') }}
            </RadioButton>

            <!-- 日 -->
            <RadioButton :value="2">
              {{ $t('electricityConsumptionData.day') }}
            </RadioButton>

            <!-- 月 -->
            <RadioButton :value="3">
              {{ $t('electricityConsumptionData.month') }}
            </RadioButton>

            <!-- 年 -->
            <RadioButton :value="4">
              {{ $t('electricityConsumptionData.years') }}
            </RadioButton>
          </RadioGroup>
        </FormItem>
        <!-- 时间范围 -->
        <FormItem
          :label="$t('useEnergyThroughoutTheEntireSection.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.searchTime" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="() => {}"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 主要内容 -->
    <Card class="mb-4 mt-4">
      <Row>
        <Col span="8" class="h-full">
          <DirectoryTree
            v-model:expanded-keys="expandedKeys"
            v-model:selected-keys="selectedKeys"
            :tree-data="treeData"
          />
        </Col>
        <Col span="16">
          <div id="lineChart"></div>
          <!-- region 表格 -->
          <BasicTblae :columns="columns" :query-data="queryData" />
          <!-- endregion -->
        </Col>
      </Row>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
