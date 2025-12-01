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
  getDayYBList,
  getHourYBList,
  getMonthYBList,
  getYearYBList,
} from '#/api';
import BasicTblae from '#/util/component/basicTblae.vue';

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
      inset: 20,
      data: chartData,
      encode: { x: 'time', y: 'value', color: 'type' },
      scale: { x: { range: [0, 1] }, y: { domainMin: 0, nice: true } },
      children: [
        {
          type: 'line',
          labels: [{ text: 'value', style: { dx: -10, dy: -12 } }],
          encode: { shape: 'smooth' },
        },
        { type: 'point', style: { fill: 'white' }, tooltip: false },
      ],
      axis: {
        y: {
          title: '电量（kWh）',
          grid: null,
          labelFormatter: (d: any) => `${d}`,
        },
      },
    });
  }

  lineChart.render();
}

function queryChartData() {
  getRequest().then(({ list }: any) => {
    const chartData: any = [];
    list.forEach((item: any) => {
      chartData.push(
        {
          time: item.time,
          value: item.value,
          type: '用电量',
        },
        {
          time: item.time,
          value: item.activePower,
          type: '有功电量',
        },
        {
          time: item.time,
          value: item.reactivePower,
          type: '无功电量',
        },
      );
    });
    chartInit(chartData);
  });
}
// endregion

// region 表格
// 表格列配置项
const columns: any = [
  { title: '序号', type: 'seq', width: 50 }, // 自动生成序号列
  {
    field: 'equipmentCode',
    title: '仪表编号',
    minWidth: 150,
  },
  {
    field: 'equipmentName',
    title: '仪表名称',
    minWidth: 150,
  },
  {
    field: 'value',
    title: '用电量（kWh）',
    minWidth: 150,
  },
  {
    field: 'activePower',
    title: '有功电量（kWh）',
    minWidth: 150,
  },
  {
    field: 'reactivePower',
    title: '无功电量（kWh）',
    minWidth: 150,
  },
  {
    field: 'powerFactor',
    title: '实际功率因数',
    minWidth: 150,
  },
  {
    field: 'time',
    title: '日期',
    minWidth: 150,
  },
];
let gridApi: any;
/**
 * 从服务器查询工作站数据的函数。
 * 这个函数用于发送查询请求，并在成功获取数据后更新组件的状态。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    getRequest({ page, pageSize }).then(({ list, total }: any) => {
      resolve({
        total,
        items: list,
      });
    });
  });
}

// endregion

// region 获取请求
// 查询参数
const queryParams = ref<any>({
  timeType: 1,
  equipmentCode: '',
});
// 类型列表
const timeTypeList = ref<any>({
  2: 'date',
  3: 'month',
  4: 'year',
});
// 格式化列表
const timeFormatList = ref<any>({
  1: 'YYYY-MM-DD HH',
  2: 'YYYY-MM-DD',
  3: 'YYYY-MM',
  4: 'YYYY',
});

function getRequest(pageMessage?: any) {
  const params = {
    ...queryParams.value,
  };
  if (pageMessage) {
    const { page, pageSize } = pageMessage;
    params.pageSize = pageSize;
    params.pageNum = page;
  }
  if (params.searchTime && params.searchTime.length > 0) {
    params.startTime = params.searchTime[0].format(
      timeFormatList.value[params.timeType],
    );
    params.endTime = params.searchTime[1].format(
      timeFormatList.value[params.timeType],
    );
    delete params.searchTime;
  }
  let ob: any;
  switch (queryParams.value.timeType) {
    case 1: {
      ob = getHourYBList(params);
      break;
    }
    case 2: {
      ob = getDayYBList(params);
      break;
    }
    case 3: {
      ob = getMonthYBList(params);
      break;
    }
    case 4: {
      ob = getYearYBList(params);
      break;
    }
  }
  return ob;
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
    equipType: 1, // 电表 1, 水表 2, 气表 3
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
      queryParams.value.equipmentCode = equipmentOptions.value[0].value;
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
            v-model:value="queryParams.equipmentCode"
            :options="equipmentOptions"
            show-search
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
          <RangePicker
            v-model:value="queryParams.searchTime"
            :picker="timeTypeList[queryParams.timeType]"
            :show-time="queryParams.timeType === 1 ? { format: 'HH' } : false"
            :format="queryParams.timeType === 1 ? 'YYYY-MM-DD HH' : ''"
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
