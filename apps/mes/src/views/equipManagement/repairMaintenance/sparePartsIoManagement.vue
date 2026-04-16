<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  DatePicker,
  Divider,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Radio,
  RadioGroup,
  Space,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchApproveSpareOrder,
  batchRejectSpareOrder,
  deleteSpareOrder,
  getSpareOrderPage,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import SpareOrderDrawer from '#/util/component/repairMaintenance/SpareOrderDrawer.vue';

// ========== 权限 ==========
const route = useRoute();
const author = ref<string[]>([]);

onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// ========== 查询参数 ==========
const queryParams = ref<any>({
  orderNo: undefined,
  orderType: undefined,
  status: undefined,
});

// 日期范围（用于绑定时间范围组件）
const queryDateRange = ref<[any, any]>([undefined, undefined]);

// ========== 单选选项 ==========
// 单据类型（选项少于4个，使用单选按钮组）
const orderTypeOptions = [
  { label: $t('repair.spareOrder.all'), value: undefined },
  { label: $t('repair.spareOrder.orderTypeIn'), value: 'IN' },
  { label: $t('repair.spareOrder.orderTypeOut'), value: 'OUT' },
];

// 审核状态（选项少于4个，使用单选按钮组）
const statusOptions = [
  { label: $t('repair.spareOrder.all'), value: undefined },
  { label: $t('repair.spareOrder.statusPending'), value: 'PENDING' },
  { label: $t('repair.spareOrder.statusApproved'), value: 'APPROVED' },
  { label: $t('repair.spareOrder.statusRejected'), value: 'REJECTED' },
];

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    {
      field: 'orderNo',
      title: $t('repair.spareOrder.orderNo'),
      minWidth: 180,
    },
    {
      field: 'orderName',
      title: $t('repair.spareOrder.orderName'),
      minWidth: 180,
    },
    {
      field: 'orderType',
      title: $t('repair.spareOrder.orderType'),
      width: 100,
      slots: { default: 'orderType' },
    },
    {
      field: 'orderDate',
      title: $t('repair.spareOrder.orderDate'),
      minWidth: 160,
    },
    {
      field: 'recipient',
      title: $t('repair.spareOrder.recipient'),
      minWidth: 120,
    },
    {
      field: 'status',
      title: $t('repair.spareOrder.status'),
      width: 120,
      slots: { default: 'status' },
    },
    {
      field: 'action',
      title: $t('common.action'),
      width: 300,
      slots: { default: 'action' },
      fixed: 'right',
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
        return await queryData(page);
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
function queryData(page?: { currentPage: number; pageSize: number }) {
  return new Promise((resolve, reject) => {
    const params = {
      orderNo: queryParams.value.orderNo,
      orderType: queryParams.value.orderType,
      status: queryParams.value.status,
      startDate: queryDateRange.value?.[0]?.format('YYYY-MM-DD'),
      endDate: queryDateRange.value?.[1]?.format('YYYY-MM-DD'),
      pageNum: page?.currentPage || 1,
      pageSize: page?.pageSize || 20,
    };
    getSpareOrderPage(params)
      .then((data) => {
        resolve({
          total: data.total || 0,
          items: data.results || data || [],
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// ========== 查询 ==========
function handleQuery() {
  gridApi.reload();
}

// ========== 重置 ==========
function handleReset() {
  queryParams.value = {
    orderNo: undefined,
    orderType: undefined,
    status: undefined,
  };
  queryDateRange.value = [undefined, undefined];
  gridApi.reload();
}

// ========== 抽屉控制 ==========
const drawerVisible = ref(false);
const drawerMode = ref<'add' | 'edit' | 'view'>('add');
const currentRow = ref<any>(null);

function openDrawer(row?: any, mode: 'add' | 'edit' | 'view' = 'add') {
  currentRow.value = row || null;
  drawerMode.value = mode;
  drawerVisible.value = true;
}

function onDrawerSuccess() {
  gridApi.reload();
}

// ========== 操作 ==========
// 查看详情
function handleDetail(row: any) {
  openDrawer(row, 'view');
}

// 编辑
function handleEdit(row: any) {
  openDrawer(row, 'edit');
}

// 删除
function handleDelete(row: any) {
  Modal.confirm({
    title: $t('repair.spareOrder.confirmDelete'),
    content: `确定要删除单据「${row.orderName}」吗？`,
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      deleteSpareOrder(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
  });
}

// 审核通过
function handleApprove(row: any) {
  Modal.confirm({
    title: $t('repair.spareOrder.approveConfirm'),
    content: `确定要审核通过单据「${row.orderName}」吗？`,
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      batchApproveSpareOrder([row.id]).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
  });
}

// 审核不通过
function handleReject(row: any) {
  Modal.confirm({
    title: $t('repair.spareOrder.rejectConfirm'),
    content: `确定要驳回单据「${row.orderName}」吗？`,
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      batchRejectSpareOrder([row.id]).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
  });
}

// 新增
function handleAdd() {
  openDrawer(null, 'add');
}

// ========== 状态颜色映射 ==========
const orderTypeColorMap: Record<string, string> = {
  IN: 'success',
  OUT: 'processing',
};

const statusColorMap: Record<string, string> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

// ========== 状态显示文本 ==========
function getOrderTypeText(type: string) {
  return type === 'IN'
    ? $t('repair.spareOrder.orderTypeIn')
    : $t('repair.spareOrder.orderTypeOut');
}

function getStatusText(status: string) {
  switch (status) {
    case 'APPROVED': {
      return $t('repair.spareOrder.statusApproved');
    }
    case 'PENDING': {
      return $t('repair.spareOrder.statusPending');
    }
    case 'REJECTED': {
      return $t('repair.spareOrder.statusRejected');
    }
    default: {
      return status;
    }
  }
}

// ========== 判断操作是否可用 ==========
function canEdit(row: any) {
  return row.status === 'PENDING' || row.status === 'REJECTED';
}

function canDelete(row: any) {
  return row.status === 'PENDING' || row.status === 'REJECTED';
}

function canApprove(row: any) {
  return row.status === 'PENDING';
}
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 单据编号 -->
        <FormItem
          :label="$t('repair.spareOrder.orderNo')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.orderNo"
            :placeholder="`请输入${$t('repair.spareOrder.orderNo')}`"
            allow-clear
            style="width: 160px"
          />
        </FormItem>

        <!-- 单据类型 -->
        <FormItem
          :label="$t('repair.spareOrder.orderType')"
          style="margin-bottom: 0"
        >
          <RadioGroup v-model:value="queryParams.orderType" button-style="solid">
            <Radio v-for="item in orderTypeOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </Radio>
          </RadioGroup>
        </FormItem>

        <!-- 审核状态 -->
        <FormItem
          :label="$t('repair.spareOrder.status')"
          style="margin-bottom: 0"
        >
          <RadioGroup v-model:value="queryParams.status" button-style="solid">
            <Radio v-for="item in statusOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </Radio>
          </RadioGroup>
        </FormItem>

        <!-- 日期范围 -->
        <FormItem :label="$t('repair.spareOrder.orderDate')" style="margin-bottom: 0">
          <DatePicker.RangePicker
            v-model:value="queryDateRange"
            format="YYYY-MM-DD"
            style="width: 260px"
          />
        </FormItem>

        <FormItem style="margin-bottom: 0">
          <Space>
            <Button @click="handleReset">{{ $t('common.reset') }}</Button>
            <Button type="primary" @click="handleQuery">
              <Icon icon="mdi:magnify" class="inline-block align-middle" />
              {{ $t('common.search') }}
            </Button>
          </Space>
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
            <Icon icon="mdi:plus" class="inline-block align-middle" />
            {{ $t('common.add') }}
          </Button>
        </template>

        <!-- 单据类型插槽 -->
        <template #orderType="{ row }">
          <Tag :color="orderTypeColorMap[row.orderType]">
            {{ getOrderTypeText(row.orderType) }}
          </Tag>
        </template>

        <!-- 状态插槽 -->
        <template #status="{ row }">
          <Tag :color="statusColorMap[row.status]">
            {{ getStatusText(row.status) }}
          </Tag>
        </template>

        <!-- 操作插槽 -->
        <template #action="{ row }">
          <Space :size="0">
            <Tooltip>
              <template #title>{{ $t('common.view') }}</template>
              <Button type="link" @click="handleDetail(row)">
                <Icon
                  icon="mdi:eye-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="author.includes('编辑') && canEdit(row)">
              <template #title>{{ $t('common.edit') }}</template>
              <Button type="link" @click="handleEdit(row)">
                <Icon
                  icon="mdi:pencil-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="author.includes('删除') && canDelete(row)">
              <template #title>{{ $t('common.delete') }}</template>
              <Button type="link" danger @click="handleDelete(row)">
                <Icon
                  icon="mdi:delete-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <Divider type="vertical" v-if="author.includes('审核') && canApprove(row)" />
            <Tooltip v-if="author.includes('审批') && canApprove(row)">
              <template #title>{{ $t('repair.spareOrder.approve') }}</template>
              <Button type="link" @click="handleApprove(row)">
                <Icon
                  icon="mdi:check-circle-outline"
                  class="inline-block align-middle text-2xl text-green-500"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="author.includes('审批') && canApprove(row)">
              <template #title>{{ $t('repair.spareOrder.reject') }}</template>
              <Button type="link" danger @click="handleReject(row)">
                <Icon
                  icon="mdi:close-circle-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 新增/编辑/查看抽屉 -->
    <SpareOrderDrawer
      v-model:open="drawerVisible"
      :row="currentRow"
      :mode="drawerMode"
      @success="onDrawerSuccess"
    />
  </Page>
</template>

<style scoped></style>
