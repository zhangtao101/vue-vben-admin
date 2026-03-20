<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  DatePicker,
  Form,
  FormItem,
  Input,
  message,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  exportMaterialOutputList,
  fetchMaterialOutputList,
} from '#/api';
import { queryAuth } from '#/util';

// 权限
const route = useRoute();
const author = ref<string[]>([]);

// 查询参数
const queryParams = ref<any>({
  formCode: '',
  operateDateStart: '',
  operateDateEnd: '',
  materialName: '',
  materialCode: '',
  enterOut: -1,
});

const dateRange = ref<any>(null);

// 选中的行
const selectedRows = ref<any[]>([]);
const selectedIds = ref<string[]>([]);

// 更新选中状态
function updateSelection() {
  const records = gridApi.grid?.getCheckboxRecords() || [];
  selectedRows.value = records;
  selectedIds.value = records.map((item: any) => item.id);
}

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns: [
    { type: 'checkbox', width: 50 },
    {
      field: 'outWarehouseFormCode',
      title: $t('storeManagement.materialOutputList.outputFormCode'),
      width: 130,
    },
    {
      field: 'itemOrder',
      title: $t('storeManagement.materialInputList.itemOrder'),
      width: 60,
    },
    {
      field: 'operateDate',
      title: $t('storeManagement.materialOutputList.outputDate'),
      width: 100,
    },
    { field: 'materialCode', title: $t('storeManagement.labelPrint.materialCode'), width: 120 },
    { field: 'materialName', title: $t('storeManagement.labelPrint.materialName'), minWidth: 200 },
    { field: 'unit', title: $t('storeManagement.labelPrint.unit'), width: 60 },
    {
      field: 'number',
      title: $t('storeManagement.materialOutputList.outputNumber'),
      width: 100,
    },
    {
      field: 'planCode',
      title: $t('storeManagement.materialOutputList.planCode'),
      width: 120,
    },
    {
      field: 'storesRequisitionFormCode',
      title: $t('storeManagement.materialOutputList.storesRequisitionFormCode'),
      width: 150,
    },
    {
      field: 'applyOrgName',
      title: $t('storeManagement.materialOutputList.applyOrgName'),
      width: 100,
    },
    {
      field: 'storeRequisitionUsername',
      title: $t('storeManagement.materialOutputList.storeRequisitionUsername'),
      width: 80,
    },
    {
      field: 'enterOut',
      title: $t('storeManagement.materialOutputList.outputCategory'),
      width: 100,
      slots: { default: 'enterOut' },
    },
    {
      field: 'oldLabelCode',
      title: $t('storeManagement.materialOutputList.oldLabelCode'),
      width: 150,
    },
    {
      field: 'labelCode',
      title: $t('storeManagement.materialOutputList.outputLabelCode'),
      width: 150,
    },
    {
      field: 'logicalWarehouseName',
      title: $t('storeManagement.materialOutputList.outputWarehouse'),
      width: 100,
    },
    {
      field: 'wareLocationName',
      title: $t('storeManagement.materialOutputList.outputLocation'),
      width: 100,
    },
    { field: 'manufacturerName', title: $t('storeManagement.labelPrint.manufacturerName'), minWidth: 150 },
    {
      field: 'validDate',
      title: $t('storeManagement.materialOutputList.validDate'),
      width: 90,
    },
    {
      field: 'batchCode',
      title: $t('storeManagement.materialOutputList.batchCode'),
      width: 130,
    },
    {
      field: 'produceDate',
      title: $t('storeManagement.materialOutputList.produceDate'),
      width: 100,
    },
    {
      field: 'contractCode',
      title: $t('storeManagement.materialOutputList.contractCode'),
      width: 100,
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 50,
    pageSizes: [10, 20, 50, 100],
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
  rowConfig: {
    keyField: 'id',
  },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/**
 * 查询数据
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams.value,
      pageNum: page,
      pageSize,
    };

    fetchMaterialOutputList(params)
      .then(({ total, results }: any) => {
        resolve({
          total,
          items: results,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// 日期范围变化
function handleDateChange(_dates: any, dateStrings: [string, string]) {
  if (dateStrings && dateStrings[0] && dateStrings[1]) {
    queryParams.value.operateDateStart = dateStrings[0];
    queryParams.value.operateDateEnd = dateStrings[1];
  } else {
    queryParams.value.operateDateStart = '';
    queryParams.value.operateDateEnd = '';
  }
}

// 查询
function handleQuery() {
  gridApi.reload();
}

// 打印
function handlePrint() {
  updateSelection();
  if (selectedIds.value.length === 0) {
    message.warning($t('storeManagement.materialOutputList.selectData'));
    return;
  }
  // 检查是否为同一供应厂商
  const manufacturers = selectedRows.value.map((item) => item.manufacturerName);
  const uniqueManufacturers = [...new Set(manufacturers)];
  if (uniqueManufacturers.length > 1) {
    message.warning($t('storeManagement.materialInputList.sameManufacturer'));
    return;
  }
  // 暂未完成
  message.warning('打印功能暂未完成');
}

// 导出
function handleExport() {
  exportMaterialOutputList(queryParams.value).then((res: any) => {
    if (res) {
      window.location.href = res;
    }
  });
}

// 获取出库类别文本
function getEnterOutText(enterOut: number) {
  const resultMap: Record<number, string> = {
    1: $t('storeManagement.materialInputList.input'),
    2: $t('storeManagement.materialInputList.returnWarehouse'),
    3: $t('storeManagement.materialInputList.defectiveReturn'),
    4: $t('storeManagement.materialInputList.returnGoods'),
    '-1': $t('storeManagement.materialInputList.output'),
  };
  return resultMap[enterOut] || '';
}

// 初始化
onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});
</script>

<template>
  <Page>
    <!-- 搜索 -->
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem :label="$t('storeManagement.materialOutputList.outputFormCode')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.formCode"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem :label="$t('storeManagement.materialOutputList.outputDate')" style="margin-bottom: 1em">
          <DatePicker.RangePicker
            v-model:value="dateRange"
            style="width: 240px"
            @change="handleDateChange"
          />
        </FormItem>
        <FormItem :label="$t('storeManagement.inspectionSlip.materialName')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.materialName"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem :label="$t('storeManagement.inspectionSlip.materialCode')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.materialCode"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="handleQuery">{{ $t('common.search') }}</Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <Space>
            <Button v-if="author.includes('打印')" type="primary" @click="handlePrint">
              {{ $t('common.print') }}
            </Button>
            <Button type="primary" @click="handleExport">
              {{ $t('common.export') }}
            </Button>
          </Space>
        </template>
        <template #enterOut="{ row }">
          {{ getEnterOutText(row.enterOut) }}
        </template>
      </Grid>
    </Card>
  </Page>
</template>
