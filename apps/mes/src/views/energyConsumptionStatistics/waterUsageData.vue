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
  Form,
  FormItem,
  Input,
  RadioButton,
  RadioGroup,
  RangePicker,
  Row,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  getMonthWaterUsageDataList,
  getYearWaterUsageDataList,
} from '#/api/energyConsumptionStatistics';
import BasicTblae from '#/util/component/basicTblae.vue';

// region 查询数据

// 查询参数
const queryParams = ref<any>({
  timeType: 1,
});
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

function chartInit(chartData: any) {
  if (lineChart) {
    lineChart.options({
      data: chartData,
    });
  } else {
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
  }
  lineChart.render();
}

function queryChartData() {
  const params: any = {
    ...queryParams.value,
  };
  if (queryParams.value.searchTime) {
    params.startTime = queryParams.value.searchTime[0].format(
      params.timeType === 1 ? 'YYYY-MM-DD' : 'YYYY-MM',
    );
    params.endTime = queryParams.value.searchTime[1].format(
      params.timeType === 1 ? 'YYYY-MM-DD' : 'YYYY-MM',
    );
    delete params.searchTime;
  }
  let ob: any;
  switch (params.timeType) {
    case 1: {
      ob = getMonthWaterUsageDataList(params);
      break;
    }
    case 2: {
      ob = getYearWaterUsageDataList(params);
      break;
    }
  }
  ob.then((data: any) => {
    chartInit(data);
  });
}
// endregion

// region 表格
// 表格列配置项
const columns: any = [
  { title: '序号', type: 'seq', width: 50 }, // 自动生成序号列
  { field: 'meterCode', title: '设备编号', minWidth: 150 },
  { field: 'meterName', title: '设备名称', minWidth: 150 },
  { field: 'waterUsage', title: '用水量', minWidth: 150 },
  { field: 'time', title: '日期', minWidth: 150 },
];
let gridApi: any;
/**
 * 从服务器查询工作站数据的函数。
 * 这个函数用于发送查询请求，并在成功获取数据后更新组件的状态。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params: any = {
      ...queryParams.value,
    };
    if (queryParams.value.searchTime) {
      params.startTime = queryParams.value.searchTime[0].format(
        params.timeType === 1 ? 'YYYY-MM' : 'YYYY',
      );
      params.endTime = queryParams.value.searchTime[1].format(
        params.timeType === 1 ? 'YYYY-MM' : 'YYYY',
      );
      delete params.searchTime;
    }
    let ob: any;
    switch (params.timeType) {
      case 1: {
        ob = getMonthWaterUsageDataList(params);
        break;
      }
      case 2: {
        ob = getYearWaterUsageDataList(params);
        break;
      }
    }
    ob.then((data: any) => {
      chartInit(data);
    });
    resolve({
      total: page * pageSize,
      items: [],
    });
  });
}

// endregion

// region 生命周期
onMounted(() => {
  const now = dayjs();
  queryParams.value.searchTime = [now.subtract(1, 'month'), now];
  queryChartData();
});
</script>

<template>
  <Page>
    <!-- region 查询条件 -->
    <Card class="mb-4 mt-4">
      <Form :model="queryParams" layout="inline">
        <!-- 数据类型 -->
        <FormItem
          :label="$t('energyConsumptionAnalysis.deviceNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.meterCode" />
        </FormItem>
        <!-- 时间粒度 -->
        <FormItem
          :label="$t('electricityConsumptionData.timeGranularity')"
          style="margin-bottom: 1em"
        >
          <RadioGroup v-model:value="queryParams.timeType" button-style="solid">
            <!-- 月 -->
            <RadioButton :value="1">
              {{ $t('electricityConsumptionData.month') }}
            </RadioButton>

            <!-- 年 -->
            <RadioButton :value="2">
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
        <Col span="12" class="h-full">
          <div id="lineChart"></div>
        </Col>
        <Col span="12">
          <!-- region 表格 -->
          <BasicTblae
            :columns="columns"
            :is-pages="false"
            :query-data="queryData"
            @initialization-complete="(args) => (gridApi = args)"
          />
          <!-- endregion -->
        </Col>
      </Row>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
