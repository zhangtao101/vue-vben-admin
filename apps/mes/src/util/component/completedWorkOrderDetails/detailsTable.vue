<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';

import { MdiSearch } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button, Form, FormItem, RangePicker } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getExcelInStorageDetail,
  getExcelParamDetail,
  getExcelPathKLDetail,
  getExcelPathNHDetail,
  getExcelPathReportDetail,
  getExcelYJDetail,
  getInStorageDetail,
  getKLDetail,
  getNHDetail,
  getParamDetail,
  getReportDetail,
  getYJDetail,
} from '#/api';

const props = defineProps({
  // 显示类型
  type: {
    type: String,
    default: '1',
  },
  // 工单编号
  worksheetCode: {
    type: String,
    default: '',
  },
  // 工作站编号
  workstationCode: {
    type: String,
    default: '',
  },
});
// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const cloumns: any = {
  '1': [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    {
      field: 'workSheetCode',
      title: $t('completedWorkOrderDetails.worksheetCode'),
      minWidth: 200,
    },
    {
      field: 'catchCode',
      title: $t('completedWorkOrderDetails.catchCode'),
      minWidth: 150,
    },
    {
      field: 'type',
      title: $t('completedWorkOrderDetails.catchMode'),
      minWidth: 150,
    },
    {
      field: 'energyEquipCode',
      title: $t('completedWorkOrderDetails.energyEquipCode'),
      minWidth: 150,
    },
    {
      field: 'energyEquipName',
      title: $t('completedWorkOrderDetails.energyEquipName'),
      minWidth: 150,
    },
    {
      field: 'startTime',
      title: $t('completedWorkOrderDetails.catchStartTime'),
      minWidth: 150,
    },
    {
      field: 'startValue',
      title: $t('completedWorkOrderDetails.catchStartValue'),
      minWidth: 150,
    },
    {
      field: 'endTime',
      title: $t('completedWorkOrderDetails.catchEndTime'),
      minWidth: 150,
    },
    {
      field: 'endValue',
      title: $t('completedWorkOrderDetails.catchEndValue'),
      minWidth: 150,
    },
    {
      field: 'energyValue',
      title: $t('completedWorkOrderDetails.energyValue'),
      minWidth: 150,
    },
    {
      field: 'catchUser',
      title: $t('completedWorkOrderDetails.catchUser'),
      minWidth: 150,
    },
    {
      field: 'reason',
      title: $t('completedWorkOrderDetails.reason'),
      minWidth: 150,
    },
    {
      field: 'remark',
      title: $t('completedWorkOrderDetails.remark'),
      minWidth: 150,
    },
    {
      field: 'errorName',
      title: $t('completedWorkOrderDetails.errorName'),
      minWidth: 150,
    },
  ],
  '2': [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    {
      field: 'worksheetCode',
      title: $t('completedWorkOrderDetails.worksheetNo'),
      minWidth: 200,
    },
    {
      field: 'workstationCode',
      title: $t('completedWorkOrderDetails.workstationCode'),
      minWidth: 150,
    },
    {
      field: 'workstationName',
      title: $t('completedWorkOrderDetails.workstationName'),
      minWidth: 150,
    },
    {
      field: 'reportCode',
      title: $t('completedWorkOrderDetails.reportCode'),
      minWidth: 150,
    },
    {
      field: 'processCode',
      title: $t('completedWorkOrderDetails.processCode'),
      minWidth: 150,
    },
    {
      field: 'processName',
      title: $t('completedWorkOrderDetails.processName'),
      minWidth: 150,
    },
    {
      field: 'productCode',
      title: $t('completedWorkOrderDetails.productCode'),
      minWidth: 150,
    },
    {
      field: 'productName',
      title: $t('completedWorkOrderDetails.productName'),
      minWidth: 150,
    },
    {
      field: 'reportUser',
      title: $t('completedWorkOrderDetails.reportUser'),
      minWidth: 150,
    },
    {
      field: 'reportTime',
      title: $t('completedWorkOrderDetails.reportTime'),
      minWidth: 150,
    },
    // { field: 'dlValue', title: '电能耗(KWH)', minWidth: 150 },
    // { field: 'trqValue', title: '天然气能耗(M3)', minWidth: 150 },
    // { field: 'jlqValue', title: '焦炉气能耗(M3)', minWidth: 150 },
    // { field: 'smjValue', title: '水煤浆能耗（KG）', minWidth: 150 },
    {
      field: 'personTime',
      title: $t('completedWorkOrderDetails.personTime'),
      minWidth: 150,
    },
    {
      field: 'equipTime',
      title: $t('completedWorkOrderDetails.equipTime'),
      minWidth: 150,
    },
    {
      field: 'reportNumber',
      title: $t('completedWorkOrderDetails.reportNumber'),
      minWidth: 150,
    },
    {
      field: 'qualityNumber',
      title: $t('completedWorkOrderDetails.qualityNumber'),
      minWidth: 150,
    },
    {
      field: 'unqualityNumber',
      title: $t('completedWorkOrderDetails.unqualityNumber'),
      minWidth: 150,
    },
    {
      field: 'unit',
      title: $t('completedWorkOrderDetails.unit'),
      minWidth: 150,
    },
    {
      field: 'costCenterCode',
      title: $t('completedWorkOrderDetails.costCenterCode'),
      minWidth: 150,
    },
  ],
  '3': [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    {
      field: 'worksheetCode',
      title: $t('completedWorkOrderDetails.worksheetNo'),
      minWidth: 200,
    },
    {
      field: 'code',
      title: $t('completedWorkOrderDetails.feedingCode'),
      minWidth: 150,
    },
    {
      field: 'materialCode',
      title: $t('completedWorkOrderDetails.materialCode'),
      minWidth: 150,
    },
    {
      field: 'materialName',
      title: $t('completedWorkOrderDetails.materialName'),
      minWidth: 150,
    },
    {
      field: 'batchCode',
      title: $t('completedWorkOrderDetails.batchCode'),
      minWidth: 150,
    },
    {
      field: 'feedNumer',
      title: $t('completedWorkOrderDetails.feedNumber'),
      minWidth: 150,
    },
    {
      field: 'unFeedNumber',
      title: $t('completedWorkOrderDetails.unFeedNumber'),
      minWidth: 150,
    },
    {
      field: 'unit',
      title: $t('completedWorkOrderDetails.unit'),
      minWidth: 150,
    },
    {
      field: 'warehouseCode',
      title: $t('completedWorkOrderDetails.warehouseCode'),
      minWidth: 150,
    },
    {
      field: 'workstationCode',
      title: $t('completedWorkOrderDetails.workstationCode'),
      minWidth: 150,
    },
    {
      field: 'workstationName',
      title: $t('completedWorkOrderDetails.workstationName'),
      minWidth: 150,
    },
    {
      field: 'feedUser',
      title: $t('completedWorkOrderDetails.feedUser'),
      minWidth: 150,
    },
    {
      field: 'feedTime',
      title: $t('completedWorkOrderDetails.feedTime'),
      minWidth: 150,
    },
    {
      field: 'btlRemark',
      title: $t('completedWorkOrderDetails.btlRemark'),
      minWidth: 150,
    },
  ],
  '4': [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    {
      field: 'code',
      title: $t('completedWorkOrderDetails.inStorageCode'),
      minWidth: 200,
    },
    {
      field: 'worksheetCode',
      title: $t('completedWorkOrderDetails.worksheetNo'),
      minWidth: 150,
    },
    {
      field: 'productCode',
      title: $t('completedWorkOrderDetails.productCode'),
      minWidth: 150,
    },
    {
      field: 'productName',
      title: $t('completedWorkOrderDetails.productName'),
      minWidth: 150,
    },
    {
      field: 'batchCode',
      title: $t('completedWorkOrderDetails.batchCode'),
      minWidth: 150,
    },
    {
      field: 'warehouseCode',
      title: $t('completedWorkOrderDetails.warehouseCode'),
      minWidth: 150,
    },
    {
      field: 'stockNumber',
      title: $t('completedWorkOrderDetails.stockNumber'),
      minWidth: 150,
    },
    {
      field: 'unit',
      title: $t('completedWorkOrderDetails.unit'),
      minWidth: 150,
    },
    {
      field: 'opUser',
      title: $t('completedWorkOrderDetails.inStorageUser'),
      minWidth: 150,
    },
    {
      field: 'opTime',
      title: $t('completedWorkOrderDetails.inStorageTime'),
      minWidth: 150,
    },
  ],
  '5': [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    {
      field: 'worksheetCode',
      title: $t('completedWorkOrderDetails.worksheetNo'),
      minWidth: 200,
    },
    {
      field: 'processCode',
      title: $t('completedWorkOrderDetails.processCode'),
      minWidth: 150,
    },
    {
      field: 'processName',
      title: $t('completedWorkOrderDetails.processName'),
      minWidth: 150,
    },
    {
      field: 'productCode',
      title: $t('completedWorkOrderDetails.productCode'),
      minWidth: 150,
    },
    {
      field: 'productName',
      title: $t('completedWorkOrderDetails.productName'),
      minWidth: 150,
    },
    {
      field: 'taskCode',
      title: $t('completedWorkOrderDetails.taskCode'),
      minWidth: 150,
    },
    {
      field: 'tempCode',
      title: $t('completedWorkOrderDetails.tempCode'),
      minWidth: 150,
    },
    {
      field: 'paramName',
      title: $t('completedWorkOrderDetails.paramName'),
      minWidth: 150,
    },
    {
      field: 'judgeRequirement',
      title: $t('completedWorkOrderDetails.judgeRequirement'),
      minWidth: 150,
    },
    {
      field: 'standardNum',
      title: $t('completedWorkOrderDetails.standardNum'),
      minWidth: 150,
    },
    {
      field: 'actParamValue',
      title: $t('completedWorkOrderDetails.actParamValue'),
      minWidth: 150,
    },
    {
      field: 'maxNum',
      title: $t('completedWorkOrderDetails.maxNum'),
      minWidth: 150,
    },
    {
      field: 'paramValue',
      title: $t('completedWorkOrderDetails.paramValue'),
      minWidth: 150,
    },
    {
      field: 'catchUser',
      title: $t('completedWorkOrderDetails.catchUser'),
      minWidth: 150,
    },
    {
      field: 'catchTime',
      title: $t('completedWorkOrderDetails.catchTime'),
      minWidth: 150,
    },
  ],
  '6': [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    {
      field: 'worksheetCode',
      title: $t('completedWorkOrderDetails.worksheetNo'),
      minWidth: 200,
    },
    {
      field: 'productCode',
      title: $t('completedWorkOrderDetails.productCode'),
      minWidth: 150,
    },
    {
      field: 'productName',
      title: $t('completedWorkOrderDetails.productName'),
      minWidth: 150,
    },
    {
      field: 'processCode',
      title: $t('completedWorkOrderDetails.processCode'),
      minWidth: 150,
    },
    {
      field: 'processName',
      title: $t('completedWorkOrderDetails.processName'),
      minWidth: 150,
    },
    {
      field: 'materialCode',
      title: $t('completedWorkOrderDetails.materialCode'),
      minWidth: 150,
    },
    {
      field: 'materialName',
      title: $t('completedWorkOrderDetails.materialName'),
      minWidth: 150,
    },
    {
      field: 'formEquipCode',
      title: $t('completedWorkOrderDetails.formEquipCode'),
      minWidth: 150,
    },
    {
      field: 'destEquipCode',
      title: $t('completedWorkOrderDetails.destEquipCode'),
      minWidth: 150,
    },
    {
      field: 'opUser',
      title: $t('completedWorkOrderDetails.opUser'),
      minWidth: 150,
    },
    {
      field: 'opTime',
      title: $t('completedWorkOrderDetails.opTime'),
      minWidth: 150,
    },
  ],
};

// 定义表格实例和 API
let Grid: any;
let gridApi: any;

const showTable = ref(false);

function tableInit() {
  gridOptions.columns = cloumns[props.type];
  [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
  showTable.value = true;
}

function reload() {
  if (gridApi) {
    gridApi.reload();
  }
}

/**
 * 查询参数
 */
const queryParams = ref<any>({});

/**
 * 查询数据
 * @param page 页码
 * @param pageSize 每页数据量
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = {
      worksheetCode: props.worksheetCode,
      workstationCode: props.workstationCode,
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    };
    if (
      queryParams.value.searchTime &&
      queryParams.value.searchTime.length === 2
    ) {
      params.startTime = queryParams.value.searchTime[0].format('YYYY-MM-DD');
      params.endTime = queryParams.value.searchTime[1].format('YYYY-MM-DD');
    }
    let ob: any;
    switch (props.type) {
      case '1': {
        ob = getNHDetail(params);
        break;
      }
      case '2': {
        ob = getReportDetail(params);
        break;
      }
      case '3': {
        ob = getKLDetail(params);
        break;
      }
      case '4': {
        ob = getInStorageDetail(params);
        break;
      }
      case '5': {
        ob = getParamDetail(params);
        break;
      }
      case '6': {
        ob = getYJDetail(params);
        break;
      }
    }

    ob.then(({ total, list }: any) => {
      // 将接口返回的数据适配到表格所需的格式
      resolve({
        total, // 总数据量
        items: list, // 当前页数据
      });
    }).catch((error: any) => {
      // 捕获接口调用错误并拒绝 Promise
      reject(error);
    });
  });
}
/**
 * 导出数据
 */
function exportExcel() {
  const params: any = {
    worksheetCode: props.worksheetCode,
    workstationCode: props.workstationCode,
  };
  if (
    queryParams.value.searchTime &&
    queryParams.value.searchTime.length === 2
  ) {
    params.startTime = queryParams.value.searchTime[0].format('YYYY-MM-DD');
    params.endTime = queryParams.value.searchTime[1].format('YYYY-MM-DD');
  }
  let ob: any;
  switch (props.type) {
    case '1': {
      ob = getExcelPathNHDetail(params);
      break;
    }
    case '2': {
      ob = getExcelPathReportDetail(params);
      break;
    }
    case '3': {
      ob = getExcelPathKLDetail(params);
      break;
    }
    case '4': {
      ob = getExcelInStorageDetail(params);
      break;
    }
    case '5': {
      ob = getExcelParamDetail(params);
      break;
    }
    case '6': {
      ob = getExcelYJDetail(params);
      break;
    }
  }

  ob.then((data: any) => {
    window.open(data, '_blank');
  });
}

// endregion

// region 暴露方法，供父组件调用
defineExpose({
  reload,
});
// endregion

onMounted(() => {
  tableInit();
});
</script>

<template>
  <Form :model="queryParams" layout="inline" class="!mb-8">
    <!-- 查询时间 -->
    <FormItem
      :label="$t('workOrderStatusQuery.queryTime')"
      style="margin-bottom: 1em"
    >
      <RangePicker v-model:value="queryParams.searchTime" />
    </FormItem>

    <FormItem style="margin-bottom: 1em">
      <Button
        :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
        type="primary"
        @click="reload"
      >
        {{ $t('common.search') }}
      </Button>
    </FormItem>
  </Form>
  <Grid class="!mt-4" v-if="showTable">
    <template #toolbar-tools>
      <!-- 投料 -->
      <Button type="primary" @click="exportExcel()">
        {{ $t('common.export') }}
      </Button>
    </template>
  </Grid>
</template>

<style scoped></style>
