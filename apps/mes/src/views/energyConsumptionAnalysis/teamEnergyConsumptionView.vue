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
  Form,
  FormItem,
  RadioButton,
  RadioGroup,
  RangePicker,
  Select,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  getDayClassEnergy,
  getItemizedList,
  getMonthClassEnergy,
  getYearClassEnergy,
} from '#/api';
import BasicTblae from '#/util/component/basicTblae.vue';

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
      type: 'view',
      autoFit: true,
      data: chartData,
      children: [
        {
          type: 'line',
          encode: {
            x: 'time',
            y: 'dlValue',
            shape: 'smooth',
          },
          scale: { y: { independent: true } },
          axis: {
            y: { title: '用电量', grid: null },
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
/**
 * 查询图表数据
 */
function queryChartData() {
  const params: any = {
    itemizedName: queryParams.value.itemizedName,
  };
  if (queryParams.value.searchTime) {
    params.startTime = queryParams.value.searchTime[0].format(
      formMat[queryParams.value.timeType],
    );
    params.endTime = queryParams.value.searchTime[1].format(
      formMat[queryParams.value.timeType],
    );
  }
  let ob: any;
  switch (queryParams.value.timeType) {
    case 1: {
      ob = getDayClassEnergy(params);
      break;
    }
    case 2: {
      ob = getMonthClassEnergy(params);
      break;
    }
    case 3: {
      ob = getYearClassEnergy(params);
      break;
    }
  }
  ob.then(({ list }: any) => {
    const chartData: any[] = [];
    if (queryParams.value.timeType === 1) {
      list.forEach((item: any) => {
        chartData.push({
          time: item.time,
          dlValue: item.dlValue,
          slValue: 0,
        });
      });
    } else {
      list.forEach((item: any) => {
        chartData.push({
          time: item.time,
          dlValue: item.dlValue,
          slValue: item.slValue,
        });
      });
    }
    if (chartData && chartData.length > 0) {
      chartInit(chartData);
    }
  });
}

// endregion

// region 表格
// 表格列配置项-日
const columnsDay: any = [
  {
    field: 'classNumber',
    title: '班组编号',
    minWidth: 150,
  },
  {
    field: 'className',
    title: '班组名称',
    minWidth: 150,
  },
  {
    field: 'systemName',
    title: '用能单元分区',
    minWidth: 150,
  },
  {
    field: 'dlValue',
    title: '用电量',
    minWidth: 150,
  },
  {
    field: 'time',
    title: '时间',
    minWidth: 150,
  },
];
// 表格列配置项-月/年
const columnsOuther: any = [
  {
    field: 'classNumber',
    title: '班组编号',
    minWidth: 150,
  },
  {
    field: 'className',
    title: '班组名称',
    minWidth: 150,
  },
  {
    field: 'systemName',
    title: '用能单元分区',
    minWidth: 150,
  },
  {
    field: 'dValue',
    title: '用电量',
    minWidth: 150,
  },
  {
    field: 'slValue',
    title: '用水能',
    minWidth: 150,
  },
  {
    field: 'time',
    title: '时间',
    minWidth: 150,
  },
];
// 表格api
let gridApi: any;
/**
 * 从服务器查询工作站数据的函数。
 * 这个函数用于发送查询请求，并在成功获取数据后更新组件的状态。
 */
function queryData(_params: any) {
  return new Promise((resolve, _reject) => {
    const params: any = {
      className: queryParams.value.className,
    };
    if (queryParams.value.searchTime) {
      params.startTime = queryParams.value.searchTime[0].format(
        formMat[queryParams.value.timeType],
      );
      params.endTime = queryParams.value.searchTime[1].format(
        formMat[queryParams.value.timeType],
      );
    }
    let ob: any;
    switch (queryParams.value.timeType) {
      case 1: {
        ob = getDayClassEnergy(params);
        break;
      }
      case 2: {
        ob = getMonthClassEnergy(params);
        break;
      }
      case 3: {
        ob = getYearClassEnergy(params);
        break;
      }
    }
    ob.then(({ list }: any) => {
      resolve({
        total: list.length,
        items: list,
      });
    });
  });
}

// endregion

// region 生命周期
onMounted(() => {
  // 获取当前时间
  const now = dayjs();
  queryParams.value.searchTime = [now.subtract(1, 'month'), now];
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
          :label="$t('energyConsumptionAnalysis.teamName')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.className"
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
          <RangePicker
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
          @initialization-complete="(grid) => (gridApi = grid)"
        />
        <!-- endregion -->
        <!-- region 表格-月/年 -->
        <BasicTblae
          :columns="columnsOuther"
          :query-data="queryData"
          :is-pages="false"
          v-if="queryParams.timeType !== 1"
          @initialization-complete="(grid) => (gridApi = grid)"
        />
        <!-- endregion -->
      </template>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
