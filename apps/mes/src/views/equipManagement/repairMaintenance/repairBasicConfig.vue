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
  Form,
  FormItem,
  message,
  Modal,
  RadioButton,
  RadioGroup,
  Space,
  Switch,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteRepairBasicConfig,
  disableRepairBasicConfig,
  enableRepairBasicConfig,
  getRepairBasicConfigList,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import RepairBasicConfigDrawer from '#/util/component/RepairBasicConfigDrawer.vue';

// ========== 查询参数 ==========
const queryParams = ref({
  configType: 'REPAIR_TYPE',
});

// ========== 维修类型选项 ==========
const configTypeOptions = [
  { label: $t('repair.repairBasicConfig.repairType'), value: 'REPAIR_TYPE' },
  { label: $t('repair.repairBasicConfig.faultLevel'), value: 'FAULT_LEVEL' },
  {
    label: $t('repair.repairBasicConfig.equipmentGroup'),
    value: 'EQUIPMENT_GROUP',
  },
  { label: $t('repair.repairBasicConfig.urgentLevel'), value: 'URGENT_LEVEL' },
];

// ========== 维修类型映射 ==========
const configTypeMap: Record<string, string> = {
  REPAIR_TYPE: $t('repair.repairBasicConfig.repairType'),
  FAULT_LEVEL: $t('repair.repairBasicConfig.faultLevel'),
  EQUIPMENT_GROUP: $t('repair.repairBasicConfig.equipmentGroup'),
  URGENT_LEVEL: $t('repair.repairBasicConfig.urgentLevel'),
};

// ========== 格式化维修类型 ==========
function formatConfigType(value: string) {
  return configTypeMap[value] || value;
}

// ========== 抽屉控制 ==========
const drawerVisible = ref(false);
const currentRow = ref<any>(null);

function openDrawer(row?: any) {
  currentRow.value = row || null;
  drawerVisible.value = true;
}

function onDrawerSuccess() {
  gridApi.reload();
}

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: '序号' },
    {
      field: 'configCode',
      title: $t('repair.repairBasicConfig.configCode'),
      minWidth: 120,
    },
    {
      field: 'configName',
      title: $t('repair.repairBasicConfig.configName'),
      minWidth: 150,
    },
    {
      field: 'configType',
      title: $t('repair.repairBasicConfig.configType'),
      minWidth: 180,
      slots: { default: 'configType' },
    },
    {
      field: 'repairGroupCode',
      title: $t('repair.repairBasicConfig.repairGroupCode'),
      minWidth: 120,
    },
    {
      field: 'sortOrder',
      title: $t('repair.repairBasicConfig.sortOrder'),
      minWidth: 80,
    },
    {
      field: 'status',
      title: $t('common.status'),
      minWidth: 100,
      slots: { default: 'status' },
    },
    {
      field: 'action',
      title: $t('common.action'),
      width: 120,
      slots: { default: 'action' },
      fixed: 'right',
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryData();
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
function queryData() {
  return new Promise((resolve, reject) => {
    getRepairBasicConfigList(queryParams.value)
      .then((data) => {
        resolve({
          total: data.total || 0,
          items: data.items || data || [],
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// ========== 状态变更事件 ==========
function onConfigTypeChange() {
  gridApi.reload();
}

// ========== 操作 ==========
// 编辑
function handleEdit(row: any) {
  openDrawer(row);
}

// 删除
function handleDelete(row: any) {
  Modal.confirm({
    title: $t('repair.repairBasicConfig.confirmDelete'),
    content: $t('repair.repairBasicConfig.deleteMessage', {
      name: row.configName,
    }),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      deleteRepairBasicConfig(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
  });
}

// 状态切换
function handleStatusChange(row: any) {
  const api =
    row.status === 'ACTIVE'
      ? disableRepairBasicConfig
      : enableRepairBasicConfig;
  api(row.id).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

// 新增
function handleAdd() {
  openDrawer();
}

// ========== 权限 ==========
const route = useRoute();
const author = ref<string[]>([]);

onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <FormItem
          :label="$t('repair.repairBasicConfig.configType')"
          style="margin-bottom: 0"
        >
          <RadioGroup
            v-model:value="queryParams.configType"
            @change="onConfigTypeChange"
          >
            <RadioButton
              v-for="item in configTypeOptions"
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
        <template #configType="{ row }">
          {{ formatConfigType(row.configType) }}
        </template>
        <template #status="{ row }">
          <Switch
            :disabled="!author.includes('状态变更')"
            :checked="row.status === 'ACTIVE'"
            @change="() => handleStatusChange(row)"
          />
        </template>
        <template #action="{ row }">
          <Space>
            <Tooltip v-if="author.includes('编辑')">
              <template #title>{{ $t('common.edit') }}</template>
              <Button type="link" @click="handleEdit(row)" class="px-1">
                <Icon
                  icon="mdi:pencil-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="author.includes('删除')">
              <template #title>{{ $t('common.delete') }}</template>
              <Button
                type="link"
                danger
                @click="handleDelete(row)"
                class="px-1"
              >
                <Icon
                  icon="mdi:delete-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 新增/编辑抽屉 -->
    <RepairBasicConfigDrawer
      v-model:open="drawerVisible"
      :config-type="queryParams.configType"
      :row="currentRow"
      @success="onDrawerSuccess"
    />
  </Page>
</template>

<style scoped></style>
