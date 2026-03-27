<script lang="ts" setup>
// todo 打印功能等待调试
/**
 * 标签打印管理页面
 * 包含两个标签页：标签打印、标签查询
 * 功能包括：标签记录管理、标签明细查看、打印等
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

/* eslint-disable perfectionist/sort-imports */

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  DatePicker,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Select,
  SelectOption,
  Space,
  TabPane,
  Tabs,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
  deleteLabelRecord,
  enterWarehouse,
  exportLabelDetail,
  fetchLabelDetailList,
  fetchLabelList,
  judgeReturn,
  setRecordPrint,
} from '#/api';

import LabelDetailDrawer from '#/util/component/labelManagement/LabelDetailDrawer.vue';
import LabelFormDialog from '#/util/component/labelManagement/LabelFormDialog.vue';

// region 标签打印表格配置

const labelPrintColumns: any[] = [
  { type: 'checkbox', width: 55 },
  {
    field: 'isPrint',
    title: $t('common.print'),
    width: 50,
    slots: { default: 'isPrint' },
  },
  {
    field: 'recordCode',
    title: $t('storeManagement.labelPrint.recordCode'),
    minWidth: 180,
  },
  {
    field: 'recordDate',
    title: $t('storeManagement.labelPrint.recordDate'),
    minWidth: 180,
  },
  {
    field: 'manufacturerName',
    title: $t('storeManagement.labelPrint.supplier'),
    minWidth: 150,
  },
  {
    field: 'remark',
    title: $t('storeManagement.labelPrint.remark'),
    minWidth: 150,
  },
  {
    field: 'operatorName',
    title: $t('storeManagement.labelPrint.operatorName'),
    minWidth: 100,
  },
  {
    title: $t('common.operation'),
    minWidth: 150,
    fixed: 'right',
    slots: { default: 'action' },
  },
];

const labelPrintGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: labelPrintColumns,
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryLabelPrintList({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  showOverflow: 'tooltip',
  stripe: true,
};

const [LabelPrintGrid, labelPrintGridApi] = useVbenVxeGrid({
  gridOptions: labelPrintGridOptions,
});

// endregion 标签打印表格配置

// region 标签查询表格配置

const labelQueryColumns: any[] = [
  { type: 'checkbox', width: 55 },
  {
    field: 'printTimes',
    title: $t('storeManagement.labelPrint.printTimes'),
    minWidth: 80,
  },
  {
    field: 'status',
    title: $t('storeManagement.labelPrint.status'),
    minWidth: 80,
    slots: { default: 'status' },
  },
  {
    field: 'createDate',
    title: $t('storeManagement.labelPrint.createDate'),
    minWidth: 120,
  },
  {
    field: 'labelCode',
    title: $t('storeManagement.labelPrint.labelCode'),
    minWidth: 180,
  },
  {
    field: 'materialCode',
    title: $t('storeManagement.labelPrint.materialCode'),
    minWidth: 120,
  },
  {
    field: 'materialName',
    title: $t('storeManagement.labelPrint.materialName'),
    minWidth: 200,
  },
  { field: 'unit', title: $t('storeManagement.labelPrint.unit'), minWidth: 80 },
  {
    field: 'labelNumber',
    title: $t('storeManagement.labelPrint.labelNumber'),
    minWidth: 100,
  },
  {
    field: 'packageNumber',
    title: $t('storeManagement.labelPrint.packageNumber'),
    minWidth: 100,
  },
  {
    field: 'toEnterNumber',
    title: $t('storeManagement.labelPrint.toEnterNumber'),
    minWidth: 100,
  },
  {
    field: 'toRejectNumber',
    title: $t('storeManagement.labelPrint.toRejectNumber'),
    minWidth: 100,
  },
  {
    field: 'enterWarehouseNumber',
    title: $t('storeManagement.labelPrint.enterWarehouseNumber'),
    minWidth: 100,
  },
  {
    field: 'rejectNumber',
    title: $t('storeManagement.labelPrint.rejectNumber'),
    minWidth: 100,
  },
  {
    field: 'purchasePlanCode',
    title: $t('storeManagement.labelPrint.purchasePlanCode'),
    minWidth: 120,
  },
  {
    field: 'contractCode',
    title: $t('storeManagement.labelPrint.contractCode'),
    minWidth: 120,
  },
  {
    field: 'formType',
    title: $t('storeManagement.labelPrint.formType'),
    minWidth: 100,
  },
  {
    field: 'manufacturerName',
    title: $t('storeManagement.labelPrint.manufacturerName'),
    minWidth: 150,
  },
  {
    field: 'produceDate',
    title: $t('storeManagement.labelPrint.produceDate'),
    minWidth: 120,
  },
  {
    field: 'validDate',
    title: $t('storeManagement.labelPrint.validDate'),
    minWidth: 120,
  },
  {
    field: 'batchCode',
    title: $t('storeManagement.labelPrint.batchCode'),
    minWidth: 180,
  },
];

const labelQueryGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: labelQueryColumns,
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryLabelDetailList({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  showOverflow: 'tooltip',
  stripe: true,
};

const [LabelQueryGrid, labelQueryGridApi] = useVbenVxeGrid({
  gridOptions: labelQueryGridOptions,
});

// endregion 标签查询表格配置

// region 状态定义

const activeTab = ref<string>('first');

// 标签打印查询参数
const printQueryParams = reactive({
  recordCode: undefined as string | undefined,
  recordDateStart: undefined as string | undefined,
  recordDateEnd: undefined as string | undefined,
  pageNum: 1,
  pageSize: 10,
});

// 标签查询参数
const labelQueryParams = reactive({
  materialCode: undefined as string | undefined,
  materialName: undefined as string | undefined,
  manufacturerName: undefined as string | undefined,
  recordDateStart: undefined as string | undefined,
  recordDateEnd: undefined as string | undefined,
  inspectionDateStart: undefined as string | undefined,
  inspectionDateEnd: undefined as string | undefined,
  statusList: [] as string[],
  pageNum: 1,
  pageSize: 10,
});

// 日期范围
const printDateRange = ref<[string, string] | undefined>(undefined);
const queryDateRange = ref<[string, string] | undefined>(undefined);
const inspectionDateRange = ref<[string, string] | undefined>(undefined);

// 状态映射
const statusMap: Record<number, string> = {
  1: $t('storeManagement.labelPrint.pendingInspection'),
  2: $t('storeManagement.labelPrint.pendingWarehouse'),
  3: $t('storeManagement.labelPrint.warehoused'),
  4: $t('storeManagement.labelPrint.outOfStock'),
  5: $t('storeManagement.labelPrint.pendingReturn'),
  6: $t('storeManagement.labelPrint.returned'),
  7: $t('storeManagement.labelPrint.inTransfer'),
  8: $t('storeManagement.labelPrint.pendingReturnWarehouse'),
};

const statusColorMap: Record<number, string> = {
  1: 'orange',
  2: 'blue',
  3: 'green',
  4: 'cyan',
  5: 'red',
  6: 'default',
  7: 'purple',
  8: 'magenta',
};

// 标签明细抽屉
const labelDetailVisible = ref(false);
const currentRecordId = ref<null | string>(null);

// 新增/编辑对话框
const formDialogVisible = ref(false);
const editRecordId = ref<null | string>(null);

// endregion 状态定义

// region 方法定义

/**
 * 查询标签打印列表
 */
function queryLabelPrintList({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      ...printQueryParams,
      pageNum: page,
      pageSize,
    };
    fetchLabelList(params)
      .then(({ total, results }) => {
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

/**
 * 查询标签明细列表
 */
function queryLabelDetailList({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      ...labelQueryParams,
      statusList: labelQueryParams.statusList.join(','),
      pageNum: page,
      pageSize,
    };
    fetchLabelDetailList(params)
      .then(({ total, results }) => {
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

/**
 * 标签打印查询
 */
function handlePrintQuery() {
  if (printDateRange.value && printDateRange.value.length === 2) {
    printQueryParams.recordDateStart = printDateRange.value[0];
    printQueryParams.recordDateEnd = printDateRange.value[1];
  } else {
    printQueryParams.recordDateStart = undefined;
    printQueryParams.recordDateEnd = undefined;
  }
  labelPrintGridApi.reload();
}

/**
 * 标签查询
 */
function handleLabelQuery() {
  if (queryDateRange.value && queryDateRange.value.length === 2) {
    labelQueryParams.recordDateStart = queryDateRange.value[0];
    labelQueryParams.recordDateEnd = queryDateRange.value[1];
  } else {
    labelQueryParams.recordDateStart = undefined;
    labelQueryParams.recordDateEnd = undefined;
  }
  if (inspectionDateRange.value && inspectionDateRange.value.length === 2) {
    labelQueryParams.inspectionDateStart = inspectionDateRange.value[0];
    labelQueryParams.inspectionDateEnd = inspectionDateRange.value[1];
  } else {
    labelQueryParams.inspectionDateStart = undefined;
    labelQueryParams.inspectionDateEnd = undefined;
  }
  labelQueryGridApi.reload();
}

/**
 * 查看标签明细
 */
function handleViewDetail() {
  const selection = labelPrintGridApi.grid.getCheckboxRecords();
  if (selection.length !== 1) {
    message.warning($t('storeManagement.labelPrint.selectRecord'));
    return;
  }
  currentRecordId.value = selection[0].id;
  labelDetailVisible.value = true;
}

/**
 * 删除标签记录
 */
function handleDeleteRecord(row: any) {
  Modal.confirm({
    title: $t('storeManagement.labelPrint.confirmDelete'),
    content: $t('storeManagement.labelPrint.confirmDeleteRecord'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      deleteLabelRecord(row.id)
        .then(() => {
          message.success($t('storeManagement.labelPrint.deleteSuccess'));
          labelPrintGridApi.reload();
        })
        .catch((error: any) => {
          message.error(error.message || $t('common.deleteFailed'));
        });
    },
  });
}

/**
 * 打印标签
 */
function handlePrint() {
  const selection = labelPrintGridApi.grid.getCheckboxRecords();
  if (selection.length === 0) {
    message.warning($t('storeManagement.labelPrint.selectPrintRecord'));
    return;
  }
  const ids = selection.map((item: any) => item.id);
  setRecordPrint(ids)
    .then(() => {
      message.success($t('storeManagement.labelPrint.printSuccess'));
      labelPrintGridApi.reload();
    })
    .catch((error: any) => {
      message.error(error.message || $t('common.operationFailed'));
    });
}

/**
 * 判定待入库
 */
function handleEnterWarehouse() {
  const selection = labelQueryGridApi.grid.getCheckboxRecords();
  if (selection.length === 0) {
    message.warning($t('storeManagement.labelPrint.selectLabel'));
    return;
  }
  const ids = selection.map((item: any) => item.id);
  enterWarehouse(ids)
    .then(() => {
      message.success($t('storeManagement.labelPrint.judgeSuccess'));
      labelQueryGridApi.reload();
    })
    .catch((error: any) => {
      message.error(error.message || $t('common.operationFailed'));
    });
}

/**
 * 判定待退库
 */
function handleJudgeReturn() {
  const selection = labelQueryGridApi.grid.getCheckboxRecords();
  if (selection.length === 0) {
    message.warning($t('storeManagement.labelPrint.selectLabel'));
    return;
  }
  const ids = selection.map((item: any) => item.id);
  judgeReturn(ids)
    .then(() => {
      message.success($t('storeManagement.labelPrint.judgeSuccess'));
      labelQueryGridApi.reload();
    })
    .catch((error: any) => {
      message.error(error.message || $t('common.operationFailed'));
    });
}

/**
 * 导出标签明细
 */
function handleExport() {
  const params = {
    ...labelQueryParams,
    statusList: labelQueryParams.statusList.join(','),
  };
  exportLabelDetail(params)
    .then((url: any) => {
      window.open(url);
    })
    .catch((error: any) => {
      message.error(error.message || $t('common.exportFailed'));
    });
}

/**
 * Tab 切换
 */
function handleTabChange(key: number | string) {
  activeTab.value = String(key);
}

/**
 * 新增标签记录
 */
function handleCreate() {
  editRecordId.value = null;
  formDialogVisible.value = true;
}

/**
 * 编辑标签记录
 */
function handleUpdate(row: any) {
  editRecordId.value = row.id;
  formDialogVisible.value = true;
}

/**
 * 标签明细刷新
 */
function handleLabelDetailRefresh() {
  labelPrintGridApi.reload();
}

/**
 * 表单保存成功
 */
function handleFormSuccess() {
  labelPrintGridApi.reload();
}

// endregion 方法定义

// region 生命周期

onMounted(() => {
  // 初始化数据
});

// endregion 生命周期
</script>

<template>
  <Page content-class="label-print-page">
    <Tabs v-model:active-key="activeTab" @change="handleTabChange">
      <!-- 标签打印标签页 -->
      <TabPane key="first" :tab="$t('storeManagement.labelPrint.labelPrint')">
        <Card class="!mb-4">
          <Form layout="inline">
            <FormItem :label="$t('storeManagement.labelPrint.recordCode')">
              <Input
                v-model:value="printQueryParams.recordCode"
                :placeholder="
                  $t('common.pleaseEnter') +
                  $t('storeManagement.labelPrint.recordCode')
                "
                allow-clear
                style="width: 200px"
              />
            </FormItem>
            <FormItem :label="$t('storeManagement.labelPrint.recordDate')">
              <DatePicker.RangePicker
                v-model:value="printDateRange"
                style="width: 240px"
              />
            </FormItem>
            <FormItem>
              <Space>
                <Button type="primary" @click="handlePrintQuery">
                  <Icon icon="mdi:search" class="mr-1" />
                  {{ $t('common.search') }}
                </Button>
              </Space>
            </FormItem>
          </Form>
        </Card>

        <Card class="mt-4">
          <Space class="mb-4">
            <Button type="primary" @click="handleCreate">
              <Icon icon="mdi:plus" class="mr-1" />
              {{ $t('common.add') }}
            </Button>
            <Button @click="handleViewDetail">
              {{ $t('storeManagement.labelPrint.labelDetail') }}
            </Button>
            <Button type="primary" @click="handlePrint">
              {{ $t('common.print') }}
            </Button>
          </Space>

          <LabelPrintGrid>
            <template #isPrint="{ row }">
              <input v-model="row.isPrint" type="checkbox" disabled />
            </template>
            <template #action="{ row }">
              <!-- 编辑 -->
              <Tooltip>
                <template #title>{{ $t('common.edit') }}</template>
                <Button type="link" class="px-1" @click="handleUpdate(row)">
                  <Icon
                    icon="mdi:edit"
                    class="inline-block align-middle text-2xl"
                  />
                </Button>
              </Tooltip>
              <!-- 删除 -->
              <Tooltip>
                <template #title>{{ $t('common.delete') }}</template>
                <Button
                  type="link"
                  danger
                  class="px-1"
                  @click="handleDeleteRecord(row)"
                >
                  <Icon
                    icon="mdi:delete-forever-outline"
                    class="inline-block align-middle text-2xl"
                  />
                </Button>
              </Tooltip>
            </template>
          </LabelPrintGrid>
        </Card>
      </TabPane>

      <!-- 标签查询标签页 -->
      <TabPane key="second" :tab="$t('storeManagement.labelPrint.labelQuery')">
        <Card>
          <Form layout="inline" class="mb-4">
            <FormItem :label="$t('storeManagement.labelPrint.materialCode')">
              <Input
                v-model:value="labelQueryParams.materialCode"
                :placeholder="
                  $t('common.pleaseEnter') +
                  $t('storeManagement.labelPrint.materialCode')
                "
                allow-clear
                style="width: 150px"
              />
            </FormItem>
            <FormItem :label="$t('storeManagement.labelPrint.materialName')">
              <Input
                v-model:value="labelQueryParams.materialName"
                :placeholder="
                  $t('common.pleaseEnter') +
                  $t('storeManagement.labelPrint.materialName')
                "
                allow-clear
                style="width: 150px"
              />
            </FormItem>
            <FormItem
              :label="$t('storeManagement.labelPrint.manufacturerName')"
            >
              <Input
                v-model:value="labelQueryParams.manufacturerName"
                :placeholder="
                  $t('common.pleaseEnter') +
                  $t('storeManagement.labelPrint.manufacturerName')
                "
                allow-clear
                style="width: 150px"
              />
            </FormItem>
            <FormItem :label="$t('storeManagement.labelPrint.createDate')">
              <DatePicker.RangePicker
                v-model:value="queryDateRange"
                style="width: 240px"
              />
            </FormItem>
            <FormItem :label="$t('storeManagement.labelPrint.inspectionDate')">
              <DatePicker.RangePicker
                v-model:value="inspectionDateRange"
                style="width: 240px"
              />
            </FormItem>
            <FormItem :label="$t('storeManagement.labelPrint.status')">
              <Select
                v-model:value="labelQueryParams.statusList"
                mode="multiple"
                :placeholder="
                  $t('common.pleaseSelect') +
                  $t('storeManagement.labelPrint.status')
                "
                allow-clear
                style="width: 200px"
              >
                <SelectOption value="1">
                  {{ $t('storeManagement.labelPrint.pendingInspection') }}
                </SelectOption>
                <SelectOption value="2">
                  {{ $t('storeManagement.labelPrint.pendingWarehouse') }}
                </SelectOption>
                <SelectOption value="3">
                  {{ $t('storeManagement.labelPrint.warehoused') }}
                </SelectOption>
                <SelectOption value="4">
                  {{ $t('storeManagement.labelPrint.outOfStock') }}
                </SelectOption>
                <SelectOption value="5">
                  {{ $t('storeManagement.labelPrint.pendingReturn') }}
                </SelectOption>
              </Select>
            </FormItem>
            <FormItem>
              <Space>
                <Button type="primary" @click="handleLabelQuery">
                  <Icon icon="mdi:search" class="mr-1" />
                  {{ $t('common.search') }}
                </Button>
              </Space>
            </FormItem>
          </Form>
        </Card>

        <Card class="mt-4">
          <Space class="mb-4">
            <Button type="primary" @click="handlePrint">
              {{ $t('common.print') }}
            </Button>
            <Button
              type="primary"
              danger
              @click="
                () =>
                  message.warning(
                    $t('storeManagement.labelPrint.selectDeleteLabel'),
                  )
              "
            >
              {{ $t('common.delete') }}
            </Button>
            <Button type="primary" @click="handleEnterWarehouse">
              {{ $t('storeManagement.labelPrint.judgeWarehouse') }}
            </Button>
            <Button type="primary" @click="handleJudgeReturn">
              {{ $t('storeManagement.labelPrint.judgeReturnWarehouse') }}
            </Button>
            <Button type="primary" @click="handleExport">
              {{ $t('common.export') }}
            </Button>
          </Space>

          <LabelQueryGrid>
            <template #status="{ row }">
              <Tag :color="statusColorMap[row.status] || 'default'">
                {{ statusMap[row.status] || $t('common.unknown') }}
              </Tag>
            </template>
          </LabelQueryGrid>
        </Card>
      </TabPane>
    </Tabs>

    <!-- 标签明细抽屉 -->
    <LabelDetailDrawer
      v-model:open="labelDetailVisible"
      :record-id="currentRecordId"
      @refresh="handleLabelDetailRefresh"
    />

    <!-- 新增/编辑对话框 -->
    <LabelFormDialog
      v-model:open="formDialogVisible"
      :record-id="editRecordId"
      @success="handleFormSuccess"
    />
  </Page>
</template>

<style scoped>
.label-print-page :deep(.vxe-grid) {
  font-size: 14px;
}
</style>
