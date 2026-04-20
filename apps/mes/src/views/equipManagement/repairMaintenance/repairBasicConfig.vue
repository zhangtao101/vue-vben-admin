<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue、vxe-table、repairBasicConfig.service API
 * [OUTPUT]: 对外提供维修基础配置页面组件，含配置列表、新增/编辑/删除、启用禁用功能
 * [POS]: 维修维护模块 的基础配置页面，管理维修类型、故障等级、设备组、紧急程度等配置
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-20 15:13:00
 */
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
import RepairBasicConfigDrawer from '#/util/component/repairMaintenance/RepairBasicConfigDrawer.vue';

// ========== 查询参数 ==========
/** 配置类型查询参数，默认查询维修类型 */
const queryParams = ref({
  configType: 'REPAIR_TYPE',
});

// ========== 维修类型选项 ==========
/** 配置类型下拉选项列表 */
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
/** 配置类型编码到中文名称的映射 */
const configTypeMap: Record<string, string> = {
  REPAIR_TYPE: $t('repair.repairBasicConfig.repairType'),
  FAULT_LEVEL: $t('repair.repairBasicConfig.faultLevel'),
  EQUIPMENT_GROUP: $t('repair.repairBasicConfig.equipmentGroup'),
  URGENT_LEVEL: $t('repair.repairBasicConfig.urgentLevel'),
};

/**
 * 格式化配置类型显示文本。
 * @param {string} value - 配置类型编码。
 * @returns {string} 配置类型中文名称，若未找到则返回原编码。
 * @since 2026-04-20 15:13:00
 */
function formatConfigType(value: string) {
  return configTypeMap[value] || value;
}

// ========== 抽屉控制 ==========
/** 新增/编辑抽屉显示状态 */
const drawerVisible = ref(false);
/** 当前操作的行数据，null 表示新增 */
const currentRow = ref<any>(null);

/**
 * 打开新增/编辑抽屉。
 * @param {any} [row] - 可选，要编辑的行数据；不传则表示新增。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:13:00
 */
function openDrawer(row?: any) {
  currentRow.value = row || null;
  drawerVisible.value = true;
}

/**
 * 抽屉操作成功回调，刷新表格数据。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:13:00
 */
function onDrawerSuccess() {
  gridApi.reload();
}

// ========== 表格配置 ==========
/** VXE Grid 表格配置对象 */
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

/** VXE Grid 事件监听配置 */
const gridEvents: VxeGridListeners<any> = {};

/** VXE Grid 组件实例及 API */
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 查询基础配置列表数据。
 * @returns {Promise<{ total: number; items: any[] }>} 包含总数和数据列表的 Promise。
 * @throws {Error} API 调用失败时拒绝 Promise。
 * @since 2026-04-20 15:13:00
 */
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

/**
 * 处理配置类型变更事件，刷新表格数据。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:13:00
 */
function onConfigTypeChange() {
  gridApi.reload();
}

// ========== 操作 ==========
/**
 * 处理编辑按钮点击，打开编辑抽屉。
 * @param {any} row - 要编辑的行数据。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:13:00
 */
function handleEdit(row: any) {
  openDrawer(row);
}

/**
 * 处理删除按钮点击，弹出确认框后执行删除。
 * @param {any} row - 要删除的行数据，需包含 id 和 configName。
 * @returns {void} 无返回值，删除成功后显示提示并刷新数据。
 * @throws {Error} 删除操作被取消时不抛出错误。
 * @since 2026-04-20 15:13:00
 */
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

/**
 * 处理状态切换按钮点击，启用或禁用配置。
 * @param {any} row - 要切换状态的行数据，需包含 id 和 status。
 * @returns {void} 无返回值，切换成功后显示提示并刷新数据。
 * @throws {Error} API 调用失败时显示错误提示。
 * @since 2026-04-20 15:13:00
 */
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

/**
 * 处理新增按钮点击，打开新增抽屉。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:13:00
 */
function handleAdd() {
  openDrawer();
}

// ========== 权限 ==========
/** 当前路由实例，用于获取权限码 */
const route = useRoute();
/** 按钮权限列表，如 ['新增', '编辑', '删除', '状态变更'] */
const author = ref<string[]>([]);

/**
 * 组件挂载时执行初始化。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:13:00
 */
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
