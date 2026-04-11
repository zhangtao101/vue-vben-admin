<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Form,
  FormItem,
  RadioButton,
  RadioGroup,
  Space,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
// import {
//   completeRepair,
//   getMyRepairTasksByStatus,
//   startRepair,
// } from '#/api/equipManagement/repairRequest.service';

// ========== 查询参数 ==========
const queryParams = ref({
  status: 'PENDING',
});

// ========== 下拉选项 ==========
const statusOptions = [
  { label: '待处理', value: 'PENDING' },
  { label: '进行中', value: 'PROCESSING' },
  { label: '已完成', value: 'COMPLETED' },
];

// ========== 状态变更事件 ==========
function onStatusChange() {
  gridApi.reload();
}

// ========== 状态映射 ==========
const statusColorMap: Record<string, string> = {
  PENDING: 'warning',
  PROCESSING: 'processing',
  COMPLETED: 'success',
};

const statusLabelMap: Record<string, string> = {
  PENDING: '待处理',
  PROCESSING: '进行中',
  COMPLETED: '已完成',
};

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: '序号' },
    { field: 'requestNo', title: '报修单号', minWidth: 150 },
    { field: 'equipmentCode', title: '设备编码', minWidth: 120 },
    {
      field: 'repairContent',
      title: '故障描述',
      minWidth: 200,
      showOverflow: true,
    },
    { field: 'reportTime', title: '报修时间', minWidth: 160 },
    {
      field: 'status',
      title: '状态',
      minWidth: 100,
      slots: { default: 'status' },
    },
    {
      field: 'action',
      title: '操作',
      width: 150,
      slots: { default: 'action' },
    },
  ],
  height: 500,
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
    export: true,
    // import: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// ========== 数据查询（接口预留） ==========
function queryData({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) {
  return new Promise((resolve) => {
    // TODO: 接口预留 getMyRepairTasksByStatus
    console.log('查询维修任务列表, params:', {
      ...queryParams.value,
      pageNum,
      pageSize,
    });

    resolve({
      total: 0,
      items: [],
    });
  });
}

// ========== 操作 ==========
// 开始维修（接口预留）
function handleStartRepair(row: any) {
  // TODO: 接口预留 startRepair({ requestId: row.id || row.requestId })
  console.log('开始维修, requestId:', row.id || row.requestId);
  gridApi.reload();
}

// 完成维修（接口预留）
function handleCompleteRepair(row: any) {
  // TODO: 接口预留 completeRepair({ requestId: row.id || row.requestId })
  console.log('完成维修, requestId:', row.id || row.requestId);
  gridApi.reload();
}

// 判断操作按钮
function getActionType(status: string) {
  if (status === 'PENDING') {
    return 'start';
  }
  if (status === 'PROCESSING') {
    return 'complete';
  }
  return null;
}
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <FormItem label="任务状态" style="margin-bottom: 0">
          <RadioGroup
            v-model:value="queryParams.status"
            @change="onStatusChange"
          >
            <RadioButton
              v-for="item in statusOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </RadioButton>
          </RadioGroup>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid>
        <template #toolbar-tools> </template>
        <template #status="{ row }">
          <Tag :color="statusColorMap[row.status]">
            {{ statusLabelMap[row.status] || row.status || '-' }}
          </Tag>
        </template>
        <template #action="{ row }">
          <Space>
            <template v-if="getActionType(row.status) === 'start'">
              <Tooltip>
                <template #title>开始维修</template>
                <Button
                  type="link"
                  @click="handleStartRepair(row)"
                  class="px-1"
                >
                  <Icon
                    icon="mdi:play-circle-outline"
                    class="inline-block align-middle text-2xl text-blue-500"
                  />
                </Button>
              </Tooltip>
            </template>
            <template v-else-if="getActionType(row.status) === 'complete'">
              <Tooltip>
                <template #title>完成维修</template>
                <Button
                  type="link"
                  @click="handleCompleteRepair(row)"
                  class="px-1"
                >
                  <Icon
                    icon="mdi:check-circle-outline"
                    class="inline-block align-middle text-2xl text-green-500"
                  />
                </Button>
              </Tooltip>
            </template>
            <template v-else>
              <span class="text-gray-400">-</span>
            </template>
          </Space>
        </template>
      </Grid>
    </Card>
  </Page>
</template>

<style scoped></style>
