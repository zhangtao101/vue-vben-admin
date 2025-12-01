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
  RadioButton,
  RadioGroup,
  RangePicker,
  Row,
  Select,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  gaugeDropDownBox,
  getMonthGasUseDataList,
  getYearGasUseDataList,
} from '#/api';
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

function chartInit(chartData: any) {
  if (lineChart) {
    lineChart.options({
      data: chartData,
    });
  } else {
    lineChart = new Chart({ container: 'lineChart' });
    lineChart.options({
      type: 'view',
      autoFit: true,
      data: chartData,
      encode: { x: 'time', y: 'gasUse', color: 'meterName' },
      scale: { x: { range: [0, 1] }, y: { domainMin: 0, nice: true } },
      children: [
        {
          type: 'line',
          labels: [{ text: 'gasUse', style: { dx: -10, dy: -12 } }],
        },
        { type: 'point', style: { fill: 'white' }, tooltip: false },
      ],
      axis: {
        y: { title: '用气量', grid: null, labelFormatter: (d: any) => `${d}` },
      },
    });
  }

  lineChart.render();
}

function queryChartData() {
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
      ob = getMonthGasUseDataList(params);
      break;
    }
    case 2: {
      ob = getYearGasUseDataList(params);
      break;
    }
  }
  ob.then(({ list }: any) => {
    chartInit(list);
  });
}
// endregion

// region 表格
// 表格列配置项
const columns: any = [
  { title: '序号', type: 'seq', width: 50 }, // 自动生成序号列
  { field: 'meterCode', title: '设备编号', minWidth: 150 },
  { field: 'meterName', title: '设备名称', minWidth: 150 },
  { field: 'gasUse', title: '用气量', minWidth: 150 },
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
      pageSize,
      pageNum: page,
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
        ob = getMonthGasUseDataList(params);
        break;
      }
      case 2: {
        ob = getYearGasUseDataList(params);
        break;
      }
    }
    ob.then(({ list, total }: any) => {
      resolve({
        total,
        items: list,
      });
    });
  });
}

// endregion

// region 电表查询

// 过滤
const filterOption = (input: string, option: any) => {
  return `${option.value}&&${option.label}`
    .toLowerCase()
    .includes(input.toLowerCase());
};
// 电表列表
const equipmentOptions = ref<any>([]);

function queryMeterData() {
  gaugeDropDownBox({
    equipType: 3, // 水表 2, 气表 3
    equipmentCode: '',
  }).then((res: any) => {
    equipmentOptions.value = [];
    res.forEach((item: any) => {
      equipmentOptions.value.push({
        label: `${item.equipmentName}(${item.equipmentCode})`,
        value: item.equipmentCode,
      });
    });
    if (equipmentOptions.value && equipmentOptions.value.length > 0) {
      queryParams.value.meterCode = equipmentOptions.value[0].value;
      queryChartData();
      setTimeout(() => {
        gridApi.reload();
      }, 200);
    }
  });
}

// endregion

// region 生命周期
onMounted(() => {
  const now = dayjs();
  queryParams.value.searchTime = [now.subtract(6, 'month'), now];
  queryChartData();
  queryMeterData();
});
</script>

<template>
  <Page>
    <!-- region 查询条件 -->
    <Card class="mb-4 mt-4">
      <Form :model="queryParams" layout="inline">
        <!-- 设备编号 -->
        <FormItem
          :label="
            $t('energyConsumption.energyConsumptionAnalysis.deviceNumber')
          "
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.meterCode"
            :options="equipmentOptions"
            show-search
            allow-clear
            :filter-option="filterOption"
            class="!w-48"
          />
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
          <RangePicker
            v-model:value="queryParams.searchTime"
            :picker="queryParams.timeType === 1 ? 'month' : 'year'"
          />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="
              () => {
                queryChartData();
                gridApi.reload();
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
      <Row>
        <Col span="12" class="h-full">
          <div id="lineChart"></div>
        </Col>
        <Col span="12">
          <!-- region 表格 -->
          <BasicTblae
            :columns="columns"
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
