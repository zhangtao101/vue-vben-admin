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
    { title: '序号', type: 'seq', width: 50 },
    { field: 'workSheetCode', title: '工单', minWidth: 200 },
    { field: 'catchCode', title: '任务采集编号', minWidth: 150 },
    { field: 'type', title: '采集模式', minWidth: 150 },
    { field: 'energyEquipCode', title: '采集仪表编号', minWidth: 150 },
    { field: 'energyEquipName', title: '采集仪表名称', minWidth: 150 },
    { field: 'startTime', title: '采集开始时间', minWidth: 150 },
    { field: 'startValue', title: '采集开始读数', minWidth: 150 },
    { field: 'endTime', title: '采集结束时间', minWidth: 150 },
    { field: 'endValue', title: '采集结束读数', minWidth: 150 },
    { field: 'energyValue', title: '采集总能耗', minWidth: 150 },
    { field: 'catchUser', title: '采集人', minWidth: 150 },
    { field: 'reason', title: '原因', minWidth: 150 },
    { field: 'remark', title: '备注', minWidth: 150 },
    { field: 'errorName', title: '异常类型', minWidth: 150 },
  ],
  '2': [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'worksheetCode', title: '工单号', minWidth: 200 },
    { field: 'workstationCode', title: '工作站编号', minWidth: 150 },
    { field: 'workstationName', title: '工作站名称', minWidth: 150 },
    { field: 'reportCode', title: '报工单号', minWidth: 150 },
    { field: 'processCode', title: '工序编号', minWidth: 150 },
    { field: 'processName', title: '工序名称', minWidth: 150 },
    { field: 'productCode', title: '产品编号', minWidth: 150 },
    { field: 'productName', title: '产品名称', minWidth: 150 },
    { field: 'dIVValue', title: '电能耗', minWidth: 150 },
    { field: 'trqValue', title: '天然气能耗', minWidth: 150 },
    { field: 'jlqValue', title: '焦炉气能耗', minWidth: 150 },
    { field: 'smjValue', title: '水煤浆能耗', minWidth: 150 },
    { field: 'personTime', title: '人时', minWidth: 150 },
    { field: 'equipTime', title: '机时', minWidth: 150 },
    { field: 'reportNumber', title: '报工总数', minWidth: 150 },
    { field: 'qualityNumber', title: '良品数', minWidth: 150 },
    { field: 'unqualityNumber', title: '废品数', minWidth: 150 },
    { field: 'unit', title: '单位', minWidth: 150 },
    { field: 'costCenterCode', title: '成本中心编号', minWidth: 150 },
  ],
  '3': [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'worksheetCode', title: '工单号', minWidth: 200 },
    { field: 'code', title: '投料单号', minWidth: 150 },
    { field: 'materialCode', title: '物料编号', minWidth: 150 },
    { field: 'materialName', title: '物料名称', minWidth: 150 },
    { field: 'batchCode', title: '批次号', minWidth: 150 },
    { field: 'feedNumer', title: '投料数量', minWidth: 150 },
    { field: 'unFeedNumber', title: '盘盈数', minWidth: 150 },
    { field: 'unit', title: '单位', minWidth: 150 },
    { field: 'warehouseCode', title: '库位', minWidth: 150 },
    { field: 'workstationCode', title: '工作站编号', minWidth: 150 },
    { field: 'workstationName', title: '工作站名称', minWidth: 150 },
    { field: 'feedUser', title: '投料人', minWidth: 150 },
    { field: 'feedTime', title: '投料记录时间', minWidth: 150 },
  ],
  '4': [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'code', title: '入库单号', minWidth: 200 },
    { field: 'worksheetCode', title: '工单号', minWidth: 150 },
    { field: 'productCode', title: '产品编号', minWidth: 150 },
    { field: 'productName', title: '产品名称', minWidth: 150 },
    { field: 'batchCode', title: '批次号', minWidth: 150 },
    { field: 'warehouseCode', title: '库位', minWidth: 150 },
    { field: 'stockNumber', title: '库存', minWidth: 150 },
    { field: 'unit', title: '单位', minWidth: 150 },
    { field: 'opUser', title: '入库人', minWidth: 150 },
    { field: 'opTime', title: '入库时间', minWidth: 150 },
  ],
  '5': [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'worksheetCode', title: '工单号', minWidth: 200 },
    { field: 'processCode', title: '工序编号', minWidth: 150 },
    { field: 'processName', title: '工序名称', minWidth: 150 },
    { field: 'productCode', title: '产品编号', minWidth: 150 },
    { field: 'productName', title: '产品名称', minWidth: 150 },
    { field: 'taskCode', title: '任务号', minWidth: 150 },
    { field: 'tempCode', title: '模板编号', minWidth: 150 },
    { field: 'paramName', title: '参数名称', minWidth: 150 },
    { field: 'judgeRequirement', title: '参数说明', minWidth: 150 },
    { field: 'standardNum', title: '工艺标准', minWidth: 150 },
    { field: 'actParamValue', title: '设定值', minWidth: 150 },
    { field: 'maxNum', title: '阈值范围', minWidth: 150 },
    { field: 'paramValue', title: '参数数值', minWidth: 150 },
    { field: 'catchUser', title: '采集人', minWidth: 150 },
    { field: 'catchTime', title: '采集时间', minWidth: 150 },
  ],
  '6': [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'worksheetCode', title: '工单号', minWidth: 200 },
    { field: 'productCode', title: '产品编号', minWidth: 150 },
    { field: 'productName', title: '产品名称', minWidth: 150 },
    { field: 'processCode', title: '工序编号', minWidth: 150 },
    { field: 'processName', title: '工序名称', minWidth: 150 },
    { field: 'materialCode', title: '物料编号', minWidth: 150 },
    { field: 'materialName', title: '物料名称', minWidth: 150 },
    { field: 'formEquipCode', title: '来源库位', minWidth: 150 },
    { field: 'destEquipCode', title: '目标库位', minWidth: 150 },
    { field: 'opUser', title: '操作人', minWidth: 150 },
    { field: 'opTime', title: '操作时间', minWidth: 150 },
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
  <Form :model="queryParams" layout="inline" class="mb-8">
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
  <Grid class="mt-4" v-if="showTable">
    <template #toolbar-tools>
      <!-- 投料 -->
      <Button type="primary" @click="exportExcel()">
        {{ $t('common.export') }}
      </Button>
    </template>
  </Grid>
</template>

<style scoped></style>
