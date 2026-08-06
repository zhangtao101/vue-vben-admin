<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue、vxe-table 的组件
 * [OUTPUT]: 对外提供调试单据管理页面组件（含调试单CRUD、审核、调试任务管理）
 * [POS]: 设备管理模块 的调试单据管理页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-08-06 00:00:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import { Icon } from '@iconify/vue'; // eslint-disable-line n/no-extraneous-import
import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Select,
  Space,
  Tag,
  Textarea,
  Tooltip,
  Upload,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  approveCommOrder,
  deleteCommOrder,
  deleteCommTask,
  insertCommOrder,
  insertCommTask,
  selectCommOrderPage,
  selectCommTaskByOrderId,
  updateCommOrder,
  updateCommTask,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// ========== 路由与用户信息 ==========
const route = useRoute();

// ========== 查询参数 ==========
const queryParams = ref<any>({
  equipmentCode: '',
  orderNo: '',
  sourceCode: '',
});

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 60, title: $t('equip.sequence') },
    {
      field: 'orderNo',
      title: $t('equip.equipmentDebugDocumentManage.orderNo'),
      minWidth: 160,
    },
    {
      field: 'equipmentCode',
      title: $t('equip.equipmentNumber'),
      minWidth: 130,
    },
    {
      field: 'sourceCode',
      title: $t('equip.equipmentDebugDocumentManage.sourceCode'),
      minWidth: 160,
    },
    {
      field: 'approvalStatus',
      title: $t('equip.equipmentDebugDocumentManage.approvalStatus'),
      minWidth: 100,
      slots: { default: 'approvalStatus' },
    },
    {
      field: 'approvalTime',
      title: $t('equip.equipmentDebugDocumentManage.approvalTime'),
      minWidth: 160,
    },
    {
      field: 'creator',
      title: $t('equip.createdBy'),
      minWidth: 100,
    },
    {
      field: 'cTime',
      title: $t('equip.cTime'),
      minWidth: 160,
    },
    {
      field: 'updateTime',
      title: $t('equip.updateTime'),
      minWidth: 160,
    },
    {
      field: 'action',
      title: $t('equip.operation'),
      width: 300,
      fixed: 'right',
      slots: { default: 'action' },
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// ========== 数据查询 ==========
function queryData({ pageNum, pageSize }: { pageNum: number; pageSize: number }) {
  return new Promise((resolve) => {
    const params: any = {
      ...queryParams.value,
      pageNum,
      pageSize,
    };

    selectCommOrderPage(params)
      .then(({ total, list }: any) => {
        resolve({
          total: total || 0,
          items: list || [],
        });
      })
      .catch(() => {
        resolve({
          total: 0,
          items: [],
        });
      });
  });
}

// ========== 权限 ==========
const author = ref<string[]>([]);

// ========== 重置 ==========
function handleReset() {
  queryParams.value = {
    equipmentCode: '',
    orderNo: '',
    sourceCode: '',
  };
  gridApi.reload();
}

// ========== 调试单抽屉 ==========

// region 调试单新增/编辑抽屉

const orderDrawerVisible = ref(false);
const orderFormStatus = ref<'add' | 'edit'>('add');
const orderFormData = ref<any>({});
const orderFormRef = ref<any>();
const orderFormRules = ref({
  orderNo: [{ required: true, message: $t('equip.requiredField') }],
  equipmentCode: [{ required: true, message: $t('equip.requiredField') }],
  sourceCode: [{ required: true, message: $t('equip.requiredField') }],
});

function handleAdd() {
  orderFormStatus.value = 'add';
  orderFormData.value = {
    approvalStatus: -1,
    attachmentFiles: '{}',
  };
  orderDrawerVisible.value = true;
}

function handleEdit(row: any) {
  orderFormStatus.value = 'edit';
  orderFormData.value = { ...row };
  orderDrawerVisible.value = true;
}

function handleDeleteOrder(row: any) {
  Modal.confirm({
    title: $t('common.confirm'),
    content: $t('equip.equipmentDebugDocumentManage.confirmDelete'),
    okButtonProps: { danger: true },
    onOk() {
      deleteCommOrder({ id: row.id }).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
  });
}

function handleApprove(row: any) {
  Modal.confirm({
    title: $t('common.confirm'),
    content: $t('equip.equipmentDebugDocumentManage.confirmApprove'),
    onOk() {
      approveCommOrder({ id: row.id, approvalStatus: 1, orderNo: row.orderNo}).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
  });
}

function handleReject(row: any) {
  Modal.confirm({
    title: $t('common.confirm'),
    content: $t('equip.equipmentDebugDocumentManage.confirmReject'),
    okButtonProps: { danger: true },
    onOk() {
      approveCommOrder({ id: row.id, approvalStatus: 2, orderNo: row.orderNo }).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
  });
}

function handleOrderSubmit() {
  orderFormRef.value.validate().then(() => {
    const data = { ...orderFormData.value };
    const api = orderFormStatus.value === 'edit' ? updateCommOrder : insertCommOrder;
    api(data).then(() => {
      message.success($t('common.successfulOperation'));
      orderDrawerVisible.value = false;
      orderFormData.value = {};
      gridApi.reload();
    });
  });
}

function handleOrderClose() {
  orderDrawerVisible.value = false;
  orderFormData.value = {};
  orderFormRef.value?.resetFields();
}

// endregion

// ========== 调试任务列表 ==========

// region 调试任务列表抽屉

const taskDrawerVisible = ref(false);
const currentOrder = ref<any>(null);

const taskGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 60, title: $t('equip.sequence') },
    {
      field: 'taskStartTime',
      title: $t('equip.equipmentDebugDocumentManage.taskStartTime'),
      minWidth: 160,
    },
    {
      field: 'taskEndTime',
      title: $t('equip.equipmentDebugDocumentManage.taskEndTime'),
      minWidth: 160,
    },
    {
      field: 'taskResult',
      title: $t('equip.equipmentDebugDocumentManage.taskResult'),
      width: 100,
      slots: { default: 'taskResult' },
    },
    {
      field: 'taskExecutor',
      title: $t('equip.equipmentDebugDocumentManage.taskExecutor'),
      width: 100,
    },
    {
      field: 'taskFile',
      title: $t('equip.equipmentDebugDocumentManage.taskFile'),
      width: 100,
      slots: { default: 'taskFile' },
    },
    {
      field: 'remark',
      title: $t('equip.remark'),
      width: 140,
    },
    {
      field: 'cTime',
      title: $t('equip.cTime'),
      width: 160,
    },
    {
      field: 'action',
      title: $t('equip.operation'),
      width: 140,
      fixed: 'right',
      slots: { default: 'taskAction' },
    },
  ],
  height: 300,
  pagerConfig: { enabled: false },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryTaskData();
      },
    },
  },
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
   },
};

const taskGridEvents: VxeGridListeners<any> = {};

const [TaskGrid, taskGridApi] = useVbenVxeGrid({ gridEvents: taskGridEvents, gridOptions: taskGridOptions });

// ========== 调试任务查询 ==========
function queryTaskData() {
  return new Promise((resolve) => {
    const orderId = currentOrder.value?.id;
    if (!orderId) {
      resolve({ total: 0, items: [] });
      return;
    }
    selectCommTaskByOrderId({ orderId })
      .then((data) => {
        const list = Array.isArray(data) ? data : (data ? [data] : []);
        resolve({ total: list.length, items: list });
      })
      .catch(() => {
        resolve({ total: 0, items: [] });
      });
  });
}

function handleTaskManage(row: any) {
  currentOrder.value = row;
  taskDrawerVisible.value = true;
  taskGridApi.reload();
}

function handleDeleteTask(row: any) {
  Modal.confirm({
    title: $t('common.confirm'),
    content: $t('equip.equipmentDebugDocumentManage.confirmDelete'),
    okButtonProps: { danger: true },
    onOk() {
      deleteCommTask({ id: row.id }).then(() => {
        message.success($t('common.successfulOperation'));
        taskGridApi.reload();
      });
    },
  });
}

function handleTaskDrawerClose() {
  taskDrawerVisible.value = false;
  currentOrder.value = null;
}

// endregion

// ========== 调试任务表单抽屉 ==========

// region 调试任务新增/编辑抽屉

const taskFormDrawerVisible = ref(false);
const taskFormStatus = ref<'add' | 'edit'>('add');
const taskFormData = ref<any>({});
const taskFormRef = ref<any>();
const taskFormRules = ref({
  taskStartTime: [{ required: true, message: $t('equip.requiredField') }],
  taskEndTime: [{ required: true, message: $t('equip.requiredField') }],
  taskResult: [{ required: true, message: $t('equip.requiredField') }],
  taskExecutor: [{ required: true, message: $t('equip.requiredField') }],
});

const taskResultOptions = [
  { label: $t('equip.equipmentDebugDocumentManage.commissioningComplete'), value: '1' },
  { label: $t('equip.equipmentDebugDocumentManage.commissioningInProgress'), value: '-1' },
];

// ========== 文件上传 ==========
const uploadTaskFileList = ref<any[]>([]);
const accessStore = useAccessStore();

function getUploadUrl() {
  return `/ht/${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/common/file/uploadFile`;
}

function handleTaskFileChange(info: any) {
  switch (info.file.status) {
    case 'done': {
      const url = info.file.response?.data || '';
      taskFormData.value.taskFile = url;

      break;
    }
    case 'error': {
      message.error($t('equip.uploadFailed'));

      break;
    }
    case 'removed': {
      taskFormData.value.taskFile = '';

      break;
    }
    // No default
  }
}

function handleAddTask() {
  taskFormStatus.value = 'add';
  taskFormData.value = {
    debugOrderNo: currentOrder.value.orderNo,
    debugOrderType: '1',
    orderId: currentOrder.value.id,
  };
  uploadTaskFileList.value = [];
  taskFormDrawerVisible.value = true;
}

function handleEditTask(row: any) {
  taskFormStatus.value = 'edit';
  taskFormData.value = { ...row };
  uploadTaskFileList.value = [];
  if (row.taskFile) {
    const fileName = row.fileName || row.taskFile.match(/[^/]+$/)?.[0] || '';
    uploadTaskFileList.value.push({
      url: row.taskFile,
      status: 'done',
      name: fileName,
    });
  }
  taskFormDrawerVisible.value = true;
}

function handleTaskSubmit() {
  taskFormRef.value.validate().then(() => {
    const data = { ...taskFormData.value };
    const api = taskFormStatus.value === 'edit' ? updateCommTask : insertCommTask;
    api(data).then(() => {
      message.success($t('common.successfulOperation'));
      taskFormDrawerVisible.value = false;
      taskGridApi.reload();
    });
  });
}

function handleTaskFormClose() {
  taskFormDrawerVisible.value = false;
  taskFormData.value = {};
  uploadTaskFileList.value = [];
  taskFormRef.value?.resetFields();
}

// endregion

// region 初始化

onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// endregion
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 设备编号 -->
        <FormItem :label="$t('equip.equipmentNumber')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.equipmentCode"
            :placeholder="$t('equip.pleaseEnterEquipmentNumber')"
            allow-clear
            style="width: 220px"
          />
        </FormItem>

        <!-- 调试单号 -->
        <FormItem :label="$t('equip.equipmentDebugDocumentManage.orderNo')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.orderNo"
            :placeholder="$t('equip.equipmentDebugDocumentManage.pleaseEnterOrderNo')"
            allow-clear
            style="width: 220px"
          />
        </FormItem>

        <!-- 采购单号 -->
        <FormItem :label="$t('equip.equipmentDebugDocumentManage.sourceCode')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.sourceCode"
            :placeholder="$t('equip.equipmentDebugDocumentManage.pleaseEnterSourceCode')"
            allow-clear
            style="width: 220px"
          />
        </FormItem>

        <!-- 重置 -->
        <FormItem style="margin-bottom: 1em">
          <Button @click="handleReset">
            {{ $t('equip.reset') }}
          </Button>
        </FormItem>

        <!-- 查询 -->
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="gridApi.reload()">
            {{ $t('equip.query') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <Button
            v-if="author.includes('新增')"
            type="primary"
            @click="handleAdd"
          >
            <Icon icon="mdi:plus" class="inline-block align-middle text-lg" />
            {{ $t('equip.add') }}
          </Button>
        </template>

        <!-- 审核状态 -->
        <template #approvalStatus="{ row }">
          <Tag v-if="row.approvalStatus === 1" color="success">
            {{ $t('equip.equipmentDebugDocumentManage.approved') }}
          </Tag>
          <Tag v-else-if="row.approvalStatus === 2" color="error">
            {{ $t('equip.equipmentDebugDocumentManage.rejected') }}
          </Tag>
          <Tag v-else color="warning">
            {{ $t('equip.equipmentDebugDocumentManage.unapproved') }}
          </Tag>
        </template>

        <!-- 操作 -->
        <template #action="{ row }">
          <Tooltip>
            <template #title>{{ $t('equip.edit') }}</template>
            <Button
              v-if="author.includes('编辑') || author.includes('修改')"
              type="link"
              @click="handleEdit(row)"
              class="px-1"
            >
              <Icon icon="mdi:pencil-outline" class="inline-block align-middle text-2xl" />
            </Button>
          </Tooltip>
          <Tooltip>
            <template #title>{{ $t('equip.equipmentDebugDocumentManage.approve') }}</template>
            <Button
              v-if="(author.includes('审核') || author.includes('确认')) && row.approvalStatus === -1"
              type="link"
              @click="handleApprove(row)"
              class="px-1"
            >
              <Icon icon="mdi:check-circle-outline" class="inline-block align-middle text-2xl" />
            </Button>
          </Tooltip>
          <Tooltip>
            <template #title>{{ $t('equip.equipmentDebugDocumentManage.reject') }}</template>
            <Button
              v-if="(author.includes('审核') || author.includes('确认')) && row.approvalStatus === -1"
              type="link"
              danger
              @click="handleReject(row)"
              class="px-1"
            >
              <Icon icon="mdi:close-circle-outline" class="inline-block align-middle text-2xl" />
            </Button>
          </Tooltip>
          <Tooltip>
            <template #title>{{ $t('equip.equipmentDebugDocumentManage.debugTask') }}</template>
            <Button
              v-if="author.includes('填报')"
              type="link"
              @click="handleTaskManage(row)"
              class="px-1"
            >
              <Icon icon="mdi:clipboard-list-outline" class="inline-block align-middle text-2xl" />
            </Button>
          </Tooltip>
          <Tooltip>
            <template #title>{{ $t('common.delete') }}</template>
            <Button
              v-if="author.includes('删除')"
              type="link"
              danger
              @click="handleDeleteOrder(row)"
              class="px-1"
            >
              <Icon icon="mdi:delete-outline" class="inline-block align-middle text-2xl" />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>

    <!-- 调试单新增/编辑抽屉 -->
    <Drawer
      v-model:open="orderDrawerVisible"
      :title="orderFormStatus === 'add' ? $t('equip.equipmentDebugDocumentManage.addTitle') : $t('equip.equipmentDebugDocumentManage.editTitle')"
      width="600"
      :destroy-on-close="true"
      :footer-style="{ textAlign: 'right' }"
    >
      <Form
        ref="orderFormRef"
        :model="orderFormData"
        :rules="orderFormRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <FormItem
          :label="$t('equip.equipmentDebugDocumentManage.orderNo')"
          name="orderNo"
        >
          <Input
            v-model:value="orderFormData.orderNo"
            :maxlength="50"
          />
        </FormItem>
        <FormItem
          :label="$t('equip.equipmentNumber')"
          name="equipmentCode"
        >
          <Input
            v-model:value="orderFormData.equipmentCode"
            :maxlength="50"
          />
        </FormItem>
        <FormItem
          :label="$t('equip.equipmentDebugDocumentManage.sourceCode')"
          name="sourceCode"
        >
          <Input
            v-model:value="orderFormData.sourceCode"
            :maxlength="50"
          />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <Button @click="handleOrderClose">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="primary" @click="handleOrderSubmit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>

    <!-- 调试任务管理抽屉 -->
    <Drawer
      v-model:open="taskDrawerVisible"
      :title="`${$t('equip.equipmentDebugDocumentManage.taskList')} - ${currentOrder?.orderNo || ''}`"
      width="1000"
      :destroy-on-close="true"
      :footer-style="{ textAlign: 'right' }"
    >
      <div>
        <TaskGrid>
          <template #toolbar-tools>
            <Button
              v-if="author.includes('新增')"
              type="primary"
              @click="handleAddTask"
            >
              <Icon icon="mdi:plus" class="inline-block align-middle text-lg" />
              {{ $t('equip.equipmentDebugDocumentManage.addTask') }}
            </Button>
          </template>
          <template #taskFile="{ row }">
            <a
              v-if="row.taskFile"
              :href="row.taskFile"
              target="_blank"
              class="text-blue-500"
            >
              {{ row.taskFile.split('/').pop() || row.taskFile }}
            </a>
            <span v-else>-</span>
          </template>
          <template #taskResult="{ row }">
            <Tag :color="row.taskResult === '1' ? 'success' : 'processing'">
              {{ row.taskResult === '1' ? $t('equip.equipmentDebugDocumentManage.commissioningComplete') : $t('equip.equipmentDebugDocumentManage.commissioningInProgress') }}
            </Tag>
          </template>

          <template #taskAction="{ row }">
            <Space>
              <Tooltip>
                <template #title>{{ $t('equip.equipmentDebugDocumentManage.editTask') }}</template>
                <Button type="link" @click="handleEditTask(row)" class="px-1">
                  <Icon icon="mdi:pencil-outline" class="inline-block align-middle text-lg" />
                </Button>
              </Tooltip>
              <Tooltip>
                <template #title>{{ $t('equip.equipmentDebugDocumentManage.deleteTask') }}</template>
                <Button type="link" danger @click="handleDeleteTask(row)" class="px-1">
                  <Icon icon="mdi:delete-outline" class="inline-block align-middle text-lg" />
                </Button>
              </Tooltip>
            </Space>
          </template>
        </TaskGrid>
      </div>

      <template #footer>
        <Button @click="handleTaskDrawerClose">
          {{ $t('common.cancel') }}
        </Button>
      </template>
    </Drawer>

    <!-- 调试任务新增/编辑抽屉 -->
    <Drawer
      v-model:open="taskFormDrawerVisible"
      :title="taskFormStatus === 'add' ? $t('equip.equipmentDebugDocumentManage.addTask') : $t('equip.equipmentDebugDocumentManage.editTask')"
      width="600"
      :destroy-on-close="true"
      :footer-style="{ textAlign: 'right' }"
    >
      <Form
        ref="taskFormRef"
        :model="taskFormData"
        :rules="taskFormRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <FormItem
          :label="$t('equip.equipmentDebugDocumentManage.taskStartTime')"
          name="taskStartTime"
        >
          <DatePicker
            v-model:value="taskFormData.taskStartTime"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </FormItem>
        <FormItem
          :label="$t('equip.equipmentDebugDocumentManage.taskEndTime')"
          name="taskEndTime"
        >
          <DatePicker
            v-model:value="taskFormData.taskEndTime"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </FormItem>
        <FormItem
          :label="$t('equip.equipmentDebugDocumentManage.taskResult')"
          name="taskResult"
        >
          <Select
            v-model:value="taskFormData.taskResult"
            :options="taskResultOptions"
            style="width: 100%"
          />
        </FormItem>
        <FormItem
          :label="$t('equip.equipmentDebugDocumentManage.taskExecutor')"
          name="taskExecutor"
        >
          <Input
            v-model:value="taskFormData.taskExecutor"
            :maxlength="30"
          />
        </FormItem>
        <FormItem
          :label="$t('equip.equipmentDebugDocumentManage.taskFile')"
          name="taskFile"
        >
          <Upload
            v-model:file-list="uploadTaskFileList"
            :action="getUploadUrl()"
            :headers="{ Authorization: `${accessStore.accessToken}` }"
            :max-count="1"
            name="file"
            @change="handleTaskFileChange"
          >
            <Button type="primary">
              {{ $t('common.upload') }}
            </Button>
          </Upload>
        </FormItem>
        <FormItem
          v-if="false"
          :label="$t('equip.equipmentDebugDocumentManage.fileName')"
          name="fileName"
        >
          <Input
            v-model:value="taskFormData.fileName"
            :maxlength="50"
          />
        </FormItem>
        <FormItem
          :label="$t('equip.remark')"
          name="remark"
        >
          <Textarea
            v-model:value="taskFormData.remark"
            :maxlength="200"
            :rows="3"
          />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <Button @click="handleTaskFormClose">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="primary" @click="handleTaskSubmit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>
