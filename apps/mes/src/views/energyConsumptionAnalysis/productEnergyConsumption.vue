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
  DatePicker,
  Form,
  FormItem,
  RadioButton,
  RadioGroup,
  Select,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  getDayItemizedEnergy,
  getItemizedList,
  getMonthItemizedEnergy,
  getYearItemizedEnergy,
} from '#/api';
import BasicTblae from '#/util/component/basicTblae.vue';

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

// region 查询数据

// 查询参数
const queryParams = ref<any>({
  timeType: 1,
});
// 时间选择器类型
const timeType: any = {
  1: 'date',
  2: 'month',
  3: 'year',
};

// 分项名称
const dataTypeList = ref<any>([]);

/**
 * 查询分项名称
 */
function queryDataTypeList() {
  getItemizedList().then((data) => {
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
  if (chart) {
    chart.options({
      data: chartData,
    });
  } else {
    chart = new Chart({ container: 'container' });
    chart.options({
      type: 'interval',
      autoFit: true,
      data: chartData,
      encode: { x: '时间', y: '能耗(kWh)', color: 'name' },
      transform: [{ type: 'stackY' }],
      interaction: { elementHighlight: { background: true } },
    });
  }

  chart.render();
}

function queryChartData() {
  const params: any = {
    itemizedName: queryParams.value.itemizedName,
  };
  let ob: any;
  switch (queryParams.value.timeType) {
    case 1: {
      params.day = queryParams.value.searchTime.format('YYYY-MM-DD');
      ob = getDayItemizedEnergy(params);
      break;
    }
    case 2: {
      params.month = queryParams.value.searchTime.format('YYYY-MM');
      ob = getMonthItemizedEnergy(params);
      break;
    }
    case 3: {
      params.year = queryParams.value.searchTime.format('YYYY');
      ob = getYearItemizedEnergy(params);
      break;
    }
  }
  ob.then((data: any) => {
    const chartData: any[] = [];
    if (queryParams.value.timeType === 1) {
      data.forEach((item: any) => {
        chartData.push({
          时间: item.time,
          '能耗(kWh)': item.value,
          name: item.systemName,
        });
      });
    } else {
      data.forEach((item: any) => {
        chartData.push(
          {
            时间: item.time,
            '能耗(kWh)': item.peakValue,
            name: '尖时段电量',
          },
          {
            时间: item.time,
            '能耗(kWh)': item.spikeValue,
            name: '峰时段电量',
          },
          {
            时间: item.time,
            '能耗(kWh)': item.flatValue,
            name: '平时段电量',
          },
          {
            时间: item.time,
            '能耗(kWh)': item.valleyValue,
            name: '谷时段电量',
          },
        );
      });
    }
    if (chartData && chartData.length > 0) {
      chartInit(chartData);
    }
  });
}

// endregion

// region 表格-日
// 表格列配置项
const columnsDay: any = [
  {
    field: 'subarea',
    title: '单元分区',
    minWidth: 150,
  },
  {
    field: 'systemName',
    title: '分项系统名称',
    minWidth: 150,
  },
  {
    field: 'value',
    title: '用电量（kWh）',
    minWidth: 150,
  },
  {
    field: 'time',
    title: '时间',
    minWidth: 150,
  },
];
/**
 * 从服务器查询工作站数据的函数。
 * 这个函数用于发送查询请求，并在成功获取数据后更新组件的状态。
 */
function queryData() {
  return new Promise((resolve, _reject) => {
    const params: any = {
      itemizedName: queryParams.value.itemizedName,
    };
    let ob: any;
    switch (queryParams.value.timeType) {
      case 1: {
        params.day = queryParams.value.searchTime.format('YYYY-MM-DD');
        ob = getDayItemizedEnergy(params);
        break;
      }
      case 2: {
        params.month = queryParams.value.searchTime.format('YYYY-MM');
        ob = getMonthItemizedEnergy(params);
        break;
      }
      case 3: {
        params.year = queryParams.value.searchTime.format('YYYY');
        ob = getYearItemizedEnergy(params);
        break;
      }
    }
    ob.then((data: any) => {
      resolve({
        total: data.length,
        items: data,
      });
    });
  });
}

// endregion
// region 表格-月/年
// 表格列配置项
const columnsOther: any = [
  {
    field: 'subarea',
    title: '单元分区',
    minWidth: 150,
  },
  {
    field: 'systemName',
    title: '分项系统名称',
    minWidth: 150,
  },
  {
    field: 'peakValue',
    title: '尖时段电量',
    minWidth: 150,
  },
  {
    field: 'spikeValue',
    title: '峰时段电量（kwh）',
    minWidth: 150,
  },
  {
    field: 'flatValue',
    title: '平时段电量（kwh）',
    minWidth: 150,
  },
  {
    field: 'valleyValue',
    title: '谷时段电量（kwh）',
    minWidth: 150,
  },
  {
    field: 'value',
    title: '总电量',
    minWidth: 150,
  },
  {
    field: 'time',
    title: '时间',
    minWidth: 150,
  },
];

// endregion

// region 生命周期
onMounted(() => {
  queryParams.value.searchTime = dayjs();
  queryDataTypeList();
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
          :label="$t('electricityConsumptionData.sectionName')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.itemizedName"
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
            <!-- 日 -->
            <RadioButton :value="1">
              {{ $t('electricityConsumptionData.day') }}
            </RadioButton>

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

    <!-- region 显示类型 -->
    <RadioGroup
      v-model:value="selectShowType"
      option-type="button"
      :options="showType"
    />
    <!-- endregion -->
    <!-- region 主要内容 -->
    <Card class="mb-4 mt-4">
      <div id="container" v-show="'chart' === selectShowType"></div>
      <template v-if="'table' === selectShowType">
        <!-- region 表格-日 -->
        <BasicTblae
          :columns="columnsDay"
          :query-data="queryData"
          :is-pages="false"
          v-if="queryParams.timeType === 1"
        />
        <!-- endregion -->
        <!-- region 表格-月/年 -->
        <BasicTblae
          :columns="columnsOther"
          :query-data="queryData"
          :is-pages="false"
          v-else
        />
        <!-- endregion -->
      </template>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
