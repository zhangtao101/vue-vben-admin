<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, ref } from 'vue';
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
import { exportMaterialInputList, fetchMaterialInputList } from '#/api';
import { queryAuth } from '#/util';
import ReturnRemarkDrawer from '#/util/component/materialInputList/ReturnRemarkDrawer.vue';

// 权限
const route = useRoute();
const author = ref<string[]>([]);
const permissions = computed(() => ({
  print: author.value.includes('打印'),
  returnRemark: author.value.includes('退货备注'),
}));

// 查询参数
const queryParams = ref<any>({
  formCode: '',
  operateDateStart: '',
  operateDateEnd: '',
  materialName: '',
  materialCode: '',
  enterOut: 1,
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

// 退货备注弹窗
const returnRemarkVisible = ref(false);

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
      field: 'enterWarehouseFormCode',
      title: $t('storeManagement.materialInputList.inputFormCode'),
      width: 130,
    },
    {
      field: 'itemOrder',
      title: $t('storeManagement.materialInputList.itemOrder'),
      width: 80,
    },
    {
      field: 'operateDate',
      title: $t('storeManagement.materialInputList.inputDate'),
      width: 170,
    },
    {
      field: 'materialCode',
      title: $t('storeManagement.labelPrint.materialCode'),
      width: 120,
    },
    {
      field: 'materialName',
      title: $t('storeManagement.labelPrint.materialName'),
      minWidth: 150,
    },
    { field: 'unit', title: $t('storeManagement.labelPrint.unit'), width: 60 },
    {
      field: 'packageNumber',
      title: $t('storeManagement.materialInputList.packageNumber'),
      width: 140,
    },
    {
      field: 'number',
      title: $t('storeManagement.materialInputList.inputNumber'),
      width: 140,
    },
    {
      field: 'manufacturerName',
      title: $t('storeManagement.labelPrint.manufacturerName'),
      minWidth: 150,
    },
    {
      field: 'labelCode',
      title: $t('storeManagement.labelPrint.labelCode'),
      width: 150,
    },
    {
      field: 'enterOut',
      title: $t('storeManagement.materialInputList.inputCategory'),
      width: 100,
      slots: { default: 'enterOut' },
    },
    {
      field: 'logicalWarehouseName',
      title: $t('storeManagement.materialInputList.logicalWarehouse'),
      width: 120,
    },
    {
      field: 'warehouseName',
      title: $t('storeManagement.materialInputList.inputWarehouse'),
      width: 100,
    },
    {
      field: 'wareAreaName',
      title: $t('storeManagement.materialInputList.inputArea'),
      width: 120,
    },
    {
      field: 'wareLocationName',
      title: $t('storeManagement.materialInputList.inputLocation'),
      width: 100,
    },
    {
      field: 'checkResultName',
      title: $t('storeManagement.inspectionSlip.checkResult'),
      width: 100,
    },
    {
      field: 'remarks',
      title: $t('storeManagement.materialInputList.returnRemark'),
      width: 120,
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

    fetchMaterialInputList(params)
      .then(({ total, results }: any) => {
        // 处理质检结论
        const list = results.map((item: any) => {
          let checkResultName = '';
          switch (item.checkResult) {
            case 1: {
              checkResultName = $t('storeManagement.inspectionSlip.qualified');
              break;
            }
            case 2: {
              checkResultName = $t(
                'storeManagement.inspectionSlip.unqualified',
              );
              break;
            }
            case 3: {
              checkResultName = $t(
                'storeManagement.inspectionSlip.concessionAccept',
              );
              break;
            }
            case 4: {
              checkResultName = $t(
                'storeManagement.inspectionSlip.emergencyRelease',
              );
              break;
            }
          }
          return {
            ...item,
            checkResultName,
          };
        });

        resolve({
          total,
          items: list,
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
    message.warning($t('storeManagement.materialInputList.selectPrintData'));
    return;
  }
  // 暂未完成
  message.warning('打印功能暂未完成');
}

// 导出
function handleExport() {
  exportMaterialInputList(queryParams.value).then((res: any) => {
    if (res) {
      window.location.href = res;
    }
  });
}

// 退货备注
function handleReturnRemark() {
  updateSelection();
  if (selectedIds.value.length === 0) {
    message.warning($t('storeManagement.materialInputList.selectDataToPrint'));
    return;
  }
  returnRemarkVisible.value = true;
}

// 获取入库类别文本
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
        <FormItem
          :label="$t('storeManagement.materialInputList.inputFormCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.formCode"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.materialInputList.inputDate')"
          style="margin-bottom: 1em"
        >
          <DatePicker.RangePicker
            v-model:value="dateRange"
            style="width: 240px"
            @change="handleDateChange"
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.inspectionSlip.materialName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.materialName"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.inspectionSlip.materialCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.materialCode"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="handleQuery">
{{
            $t('common.search')
          }}
</Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <Space>
            <Button
              v-if="permissions.print"
              type="primary"
              @click="handlePrint"
            >
              {{ $t('common.print') }}
            </Button>
            <Button type="primary" @click="handleExport">
              {{ $t('common.export') }}
            </Button>
            <Button
              v-if="permissions.returnRemark"
              type="primary"
              @click="handleReturnRemark"
            >
              {{ $t('storeManagement.materialInputList.inputReturnRemark') }}
            </Button>
          </Space>
        </template>
        <template #enterOut="{ row }">
          {{ getEnterOutText(row.enterOut) }}
        </template>
      </Grid>
    </Card>

    <!-- 退货备注 -->
    <ReturnRemarkDrawer
      v-model:visible="returnRemarkVisible"
      :ids="selectedIds"
      @success="gridApi.reload()"
    />
  </Page>
</template>
