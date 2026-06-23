<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue、vxe-table、repairBasicConfig.service API
 * [OUTPUT]: 对外提供维修基础配置页面组件，含配置列表、新增/编辑/删除、启用禁用功能
 * [POS]: 维修维护模块 的基础配置页面，管理维修类型、故障等级、设备组、紧急程度等配置
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-06-16 09:53:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Form,
  FormItem,
  message,
  Modal,
  Select,
  Space,
  Switch,
  Tooltip,
  Upload,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchDeleteRepairBasicConfig,
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
  { label: $t('repair.repairBasicConfig.faultType'), value: 'FAULT_TYPE' },
  {
    label: $t('repair.repairBasicConfig.equipFaultCause'),
    value: 'EQUIP_FAULT_CAUSE',
  },
  {
    label: $t('repair.repairBasicConfig.repairPauseReason'),
    value: 'REPAIR_PAUSE_REASON',
  },
  {
    label: $t('repair.repairBasicConfig.equipmentOeeReason'),
    value: 'EQUIPMENT_OEE_REASON',
  },
  { label: $t('repair.repairBasicConfig.oeeReason'), value: 'OEE_REASON' },
  {
    label: $t('repair.repairBasicConfig.moldMaintenanceItem'),
    value: 'MOLD_MAINTENANCE_ITEM',
  },
  {
    label: $t('repair.repairBasicConfig.moldAbnormalReason'),
    value: 'MOLD_ABNORMAL_REASON',
  },
];

// ========== 维修类型映射 ==========
/** 配置类型编码到中文名称的映射 */
const configTypeMap: Record<string, string> = {
  REPAIR_TYPE: $t('repair.repairBasicConfig.repairType'),
  FAULT_LEVEL: $t('repair.repairBasicConfig.faultLevel'),
  EQUIPMENT_GROUP: $t('repair.repairBasicConfig.equipmentGroup'),
  URGENT_LEVEL: $t('repair.repairBasicConfig.urgentLevel'),
  FAULT_TYPE: $t('repair.repairBasicConfig.faultType'),
  EQUIP_FAULT_CAUSE: $t('repair.repairBasicConfig.equipFaultCause'),
  REPAIR_PAUSE_REASON: $t('repair.repairBasicConfig.repairPauseReason'),
  EQUIPMENT_OEE_REASON: $t('repair.repairBasicConfig.equipmentOeeReason'),
  OEE_REASON: $t('repair.repairBasicConfig.oeeReason'),
  MOLD_MAINTENANCE_ITEM: $t('repair.repairBasicConfig.moldMaintenanceItem'),
  MOLD_ABNORMAL_REASON: $t('repair.repairBasicConfig.moldAbnormalReason'),
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
  currentRow.value = row ? { ...row } : null;
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
/** 是否显示模具保养项目专用列 */
const isMoldMaintenanceItem = computed(
  () => queryParams.value.configType === 'MOLD_MAINTENANCE_ITEM',
);

/** VXE Grid 表格配置对象 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50 },
    { type: 'seq', width: 50, title: $t('basic.laborHourEvaluation.sequence') },
    {
      field: 'configCode',
      title: $t('repair.repairBasicConfig.configCode'),
      minWidth: 180,
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
      field: 'itemRequirement',
      title: $t('repair.repairBasicConfig.itemRequirement'),
      minWidth: 150,
    },
    {
      field: 'itemStandard',
      title: $t('repair.repairBasicConfig.itemStandard'),
      minWidth: 150,
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
      width: 160,
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

// ========== 模具保养项目列显隐控制 ==========
watch(
  isMoldMaintenanceItem,
  (visible) => {
    setTimeout(() => {
      const grid = gridApi.grid as any;
      if (!grid?.showColumn || !grid?.hideColumn) return;
      const fields = ['itemRequirement', 'itemStandard'];
      fields.forEach((field) => {
        visible ? grid.showColumn(field) : grid.hideColumn(field);
      });
    }, 200)
  },
  { immediate: true },
);

// ========== 导入 ==========
/** 权限存储实例，用于获取 accessToken 作为上传请求头 */
const accessStore = useAccessStore();
/** 导入文件列表绑定值，用于 Upload 组件的 v-model */
const importFile = ref<any>([]);

/** 支持导入功能的配置类型 */
const importConfigTypes = new Set([
  'EQUIP_FAULT_CAUSE',
  'EQUIPMENT_GROUP',
  'EQUIPMENT_OEE_REASON',
  'FAULT_TYPE',
  'MOLD_ABNORMAL_REASON',
  'MOLD_MAINTENANCE_ITEM',
  'OEE_REASON',
  'REPAIR_PAUSE_REASON',
]);

/** 当前选中类型是否支持导入 */
const showImportButton = computed(() =>
  importConfigTypes.has(queryParams.value.configType),
);

/**
 * 获取导入上传的接口地址。
 * @returns {string} 基础配置导入的 API URL。
 * @since 2026-06-16 08:58:00
 */
function getImportUrl() {
  return `/ht/${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/import/base-config`;
}

/**
 * 处理文件导入状态变更，成功时刷新表格，失败时提示错误。
 * @param {any} info - Upload 组件的 change 事件参数，包含 file 对象。
 * @returns {void} 无返回值。
 * @since 2026-06-16 08:58:00
 */
function handleImportChange(info: any) {
  const { file } = info;
  if (file.status === 'done') {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
    importFile.value = [];
  } else if (file.status === 'error') {
    message.error($t('common.operationFailure'));
  }
}

// ========== 操作 ==========
/**
 * 处理批量删除按钮点击，获取选中行后弹出确认框执行批量删除。
 * @returns {void} 无返回值，删除成功后显示提示并刷新数据；失败时显示错误提示。
 * @throws {Error} 批量删除 API 调用失败时捕获并显示错误提示，不向上抛出。
 * @since 2026-06-16 09:47:00
 */
function handleBatchDelete() {
  const selectedRows = (gridApi.grid as any)?.getCheckboxRecords() || [];
  if (selectedRows.length === 0) {
    message.warning($t('repair.repairBasicConfig.selectRowsFirst'));
    return;
  }
  Modal.confirm({
    title: $t('repair.repairBasicConfig.confirmBatchDelete'),
    content: $t('repair.repairBasicConfig.batchDeleteMessage', {
      count: selectedRows.length,
    }),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      batchDeleteRepairBasicConfig(selectedRows.map((row: any) => row.id))
        .then(() => {
          message.success($t('common.successfulOperation'));
          gridApi.reload();
        })
        .catch(() => {
          message.error($t('common.operationFailure'));
        });
    },
  });
}

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
          <Select
            v-model:value="queryParams.configType"
            :options="configTypeOptions"
            style="width: 200px"
            @change="onConfigTypeChange"
          />
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
          <Button
            v-if="author.includes('删除')"
            danger
            @click="handleBatchDelete"
            class="ml-4!"
          >
            <Icon
              icon="mdi:delete-outline"
              class="inline-block align-middle"
            />
            {{ $t('common.batchDelete') }}
          </Button>
          <Upload
            v-if="author.includes('新增') && showImportButton"
            v-model:file-list="importFile"
            name="files"
            accept=".xlsx,.xls"
            :multiple="false"
            :action="getImportUrl()"
            :headers="{ Authorization: `${accessStore.accessToken}` }"
            :data="{ configType: queryParams.configType }"
            :show-upload-list="false"
            @change="handleImportChange"
            class="ml-4!"
          >
            <Button>
              <Icon
                icon="mdi:cloud-upload"
                class="inline-block align-middle text-xl text-[#5085ff]"
              />
              {{ $t('common.import') }}
            </Button>
          </Upload>
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
