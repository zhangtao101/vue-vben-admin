<script lang="ts" setup>
// todo 打印功能等待调试
/**
 * 标签打印 Tab 组件
 * [INPUT]: 依赖 #/api (fetchLabelList/deleteLabelRecord/setRecordPrint)、#/locales ($t)
 * [OUTPUT]: 对外无 emit，自包含标签打印记录管理功能
 * [POS]: 属于 labelPrint 模块的子组件，被 labelPrint.vue 引用
 * [PROTOCOL]: 变更时更新此头部
 * [TIME]: 2026-06-22 13:56:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { reactive, ref } from 'vue';

/* eslint-disable perfectionist/sort-imports */
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
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { deleteLabelRecord, fetchLabelList, setRecordPrint } from '#/api';
import { $t } from '#/locales';

import LabelDetailDrawer from '../labelManagement/LabelDetailDrawer.vue';
import LabelFormDialog from '../labelManagement/LabelFormDialog.vue';

// region 表格配置
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

const gridOptions: VxeGridProps<any> = {
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
        return await queryList({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  showOverflow: 'tooltip',
  stripe: true,
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
// endregion

// region 状态定义
const queryParams = reactive({
  recordCode: undefined as string | undefined,
  recordDateStart: undefined as string | undefined,
  recordDateEnd: undefined as string | undefined,
  pageNum: 1,
  pageSize: 10,
});

const dateRange = ref<[string, string] | undefined>(undefined);

// 标签明细抽屉
const labelDetailVisible = ref(false);
const currentRecordId = ref<null | string>(null);

// 新增/编辑对话框
const formDialogVisible = ref(false);
const editRecordId = ref<null | string>(null);
// endregion

// region 方法定义
function queryList({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams,
      pageNum: page,
      pageSize,
    };
    fetchLabelList(params)
      .then(({ total, results }) => {
        resolve({ total, items: results });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function handleQuery() {
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.recordDateStart = dateRange.value[0];
    queryParams.recordDateEnd = dateRange.value[1];
  } else {
    queryParams.recordDateStart = undefined;
    queryParams.recordDateEnd = undefined;
  }
  gridApi.reload();
}

function handleViewDetail() {
  const selection = gridApi.grid.getCheckboxRecords();
  if (selection.length !== 1) {
    message.warning($t('storeManagement.labelPrint.selectRecord'));
    return;
  }
  currentRecordId.value = selection[0].id;
  labelDetailVisible.value = true;
}

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
          gridApi.reload();
        })
        .catch((error: any) => {
          message.error(error.message || $t('common.deleteFailed'));
        });
    },
  });
}

function handlePrint() {
  const selection = gridApi.grid.getCheckboxRecords();
  if (selection.length === 0) {
    message.warning($t('storeManagement.labelPrint.selectPrintRecord'));
    return;
  }
  const ids = selection.map((item: any) => item.id);
  setRecordPrint(ids)
    .then(() => {
      message.success($t('storeManagement.labelPrint.printSuccess'));
      gridApi.reload();
    })
    .catch((error: any) => {
      message.error(error.message || $t('common.operationFailed'));
    });
}

function handleCreate() {
  editRecordId.value = null;
  formDialogVisible.value = true;
}

function handleUpdate(row: any) {
  editRecordId.value = row.id;
  formDialogVisible.value = true;
}

function handleLabelDetailRefresh() {
  gridApi.reload();
}

function handleFormSuccess() {
  gridApi.reload();
}
// endregion
</script>

<template>
  <div>
    <Card class="!mb-4">
      <Form layout="inline">
        <FormItem :label="$t('storeManagement.labelPrint.recordCode')">
          <Input
            v-model:value="queryParams.recordCode"
            :placeholder="
              $t('common.pleaseEnter') +
              $t('storeManagement.labelPrint.recordCode')
            "
            allow-clear
            style="width: 200px"
          />
        </FormItem>
        <FormItem :label="$t('storeManagement.labelPrint.recordDate')">
          <DatePicker.RangePicker v-model:value="dateRange" style="width: 240px" />
        </FormItem>
        <FormItem>
          <Space>
            <Button type="primary" @click="handleQuery">
              <Icon icon="mdi:search" class="mr-1" />
              {{ $t('common.search') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>

    <Card class="!mt-4">
      <Space class="!mb-4">
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

      <Grid>
        <template #isPrint="{ row }">
          <input v-model="row.isPrint" type="checkbox" disabled />
        </template>
        <template #action="{ row }">
          <Tooltip>
            <template #title>{{ $t('common.edit') }}</template>
            <Button type="link" class="px-1" @click="handleUpdate(row)">
              <Icon
                icon="mdi:edit"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
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
      </Grid>
    </Card>

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
  </div>
</template>
