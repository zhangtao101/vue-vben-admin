<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue、vxe-table、repairProcessConfig.service API
 * [OUTPUT]: 对外提供维修流程配置页面组件，含流程配置列表、新增/编辑/删除、启用禁用功能
 * [POS]: 维修维护模块 的维修流程配置页面，管理维修流程配置模板
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-12 12:52:00
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
  Input,
  message,
  Modal,
  Select,
  Space,
  Switch,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteFlowConfig,
  disableFlowConfig,
  enableFlowConfig,
  getFlowConfigList,
  searchBaseConfig,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import StepConfigDrawer from '#/util/component/repairMaintenance/StepConfigDrawer.vue';

// ========== 查询参数 ==========
/** 流程配置查询参数 */
const queryParams = ref({
  keyword: '',
  equipmentGroup: undefined as string | undefined,
  status: undefined as string | undefined,
});

// ========== 设备分组选项 ==========
/** 设备分组下拉选项列表 */
const equipmentGroupOptions = ref<{ label: string; value: string }[]>([]);

/**
 * 初始化设备分组下拉选项。
 * @returns {void} 无返回值。
 * @since 2026-05-13 10:20:00
 */
async function initEquipmentGroupOptions() {
  const res = await searchBaseConfig({ configType: 'EQUIPMENT_GROUP' });
  equipmentGroupOptions.value = [
    { label: '全部', value: '' },
    ...((res || []) as any[]).map((item) => ({
      label: item.configName,
      value: item.configCode,
    })),
  ];
}

// ========== 状态下拉选项 ==========
/** 状态下拉选项列表 */
const statusOptions = [
  { label: $t('repair.repairProcessConfig.all'), value: '' },
  { label: $t('repair.repairProcessConfig.enabled'), value: 'ENABLED' },
  { label: $t('repair.repairProcessConfig.disabled'), value: 'DISABLED' },
];

// ========== 抽屉控制 ==========
/** 新增/编辑抽屉显示状态 */
const drawerVisible = ref(false);
/** 当前操作的行数据，null 表示新增 */
const currentRow = ref<any>(null);

/**
 * 打开新增/编辑抽屉。
 * @param {any} [row] - 可选，要编辑的行数据；不传则表示新增。
 * @returns {void} 无返回值。
 * @since 2026-05-12 12:52:00
 */
function openDrawer(row?: any) {
  currentRow.value = row;
  drawerVisible.value = true;
}

/**
 * 抽屉操作成功回调，刷新表格数据。
 * @returns {void} 无返回值。
 * @since 2026-05-12 12:52:00
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
      field: 'configName',
      title: $t('repair.repairProcessConfig.configName'),
      minWidth: 180,
    },
    {
      field: 'configCode',
      title: $t('repair.repairProcessConfig.configCode'),
      minWidth: 150,
    },
    {
      field: 'equipmentGroup',
      title: $t('repair.repairProcessConfig.equipmentGroup'),
      minWidth: 120,
      slots: { default: 'equipmentGroup' },
    },
    // {
    //   field: 'stepCount',
    //   title: $t('repair.repairProcessConfig.stepCount'),
    //   minWidth: 100,
    // },
    // {
    //   field: 'noticeRuleCount',
    //   title: $t('repair.repairProcessConfig.noticeRuleCount'),
    //   minWidth: 120,
    // },
    {
      field: 'status',
      title: $t('common.status'),
      minWidth: 100,
      slots: { default: 'status' },
    },
    // {
    //   field: 'remark',
    //   title: $t('repair.repairProcessConfig.remark'),
    //   minWidth: 150,
    //   showOverflow: true,
    // },
    {
      field: 'action',
      title: $t('common.action'),
      width: 150,
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

/** VXE Grid 事件监听配置 */
const gridEvents: VxeGridListeners<any> = {};

/** VXE Grid 组件实例及 API */
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 查询流程配置列表数据。
 * @returns {Promise<{ total: number; items: any[] }>} 包含总数和数据列表的 Promise。
 * @since 2026-05-12 12:52:00
 */
function queryData({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams.value,
      pageNum,
      pageSize,
    };
    getFlowConfigList(params)
      .then(({ results, count }: any) => {
        const list = Array.isArray(results) ? results : [];
        resolve({
          total: count,
          items: list,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// ========== 操作 ==========
/**
 * 处理编辑按钮点击，打开编辑抽屉。
 * @param {any} row - 要编辑的行数据。
 * @returns {void} 无返回值。
 * @since 2026-05-12 12:52:00
 */
function handleEdit(row: any) {
  openDrawer(row);
}

/**
 * 处理删除按钮点击，弹出确认框后执行删除。
 * @param {any} row - 要删除的行数据，需包含 id 和 configName。
 * @returns {void} 无返回值，删除成功后显示提示并刷新数据。
 * @since 2026-05-12 12:52:00
 */
function handleDelete(row: any) {
  Modal.confirm({
    title: $t('repair.repairProcessConfig.confirmDelete'),
    content: $t('repair.repairProcessConfig.deleteMessage', {
      name: row.configName,
    }),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      deleteFlowConfig(row.id)
        .then(() => {
          message.success($t('common.successfulOperation'));
          gridApi.reload();
        })
        .catch(() => {
          message.error($t('common.operationFailed'));
        });
    },
  });
}

/**
 * 处理状态切换按钮点击，启用或禁用配置。
 * @param {any} row - 要切换状态的行数据，需包含 id 和 status。
 * @returns {void} 无返回值，切换成功后显示提示并刷新数据。
 * @since 2026-05-12 12:52:00
 */
function handleStatusChange(row: any) {
  const api = row.status === 'ENABLED' ? disableFlowConfig : enableFlowConfig;
  api(row.id)
    .then(() => {
      message.success($t('common.successfulOperation'));
      gridApi.reload();
    })
    .catch(() => {
      message.error($t('common.operationFailed'));
    });
}

/**
 * 处理新增按钮点击，打开新增抽屉。
 * @returns {void} 无返回值。
 * @since 2026-05-12 12:52:00
 */
function handleAdd() {
  openDrawer();
}

/**
 * 处理重置按钮点击，重置查询参数并刷新表格。
 * @returns {void} 无返回值。
 * @since 2026-05-12 12:52:00
 */
function handleReset() {
  queryParams.value = {
    keyword: '',
    equipmentGroup: undefined,
    status: undefined,
  };
  gridApi.reload();
}

// ========== 权限 ==========
/** 当前路由实例，用于获取权限码 */
const route = useRoute();
/** 按钮权限列表 */
const author = ref<string[]>([]);

/**
 * 组件挂载时执行初始化。
 * @returns {void} 无返回值。
 * @since 2026-05-12 12:52:00
 */
onMounted(async () => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  await initEquipmentGroupOptions();
});

/**
 * 设备分组格式化显示。
 * @param {string} value - 设备分组编码
 * @returns {string} 设备分组中文名称
 * @since 2026-05-12 12:52:00
 */
function formatEquipmentGroup(value: string) {
  const map: Record<string, string> = {
    LINE_A: 'A线',
    LINE_B: 'B线',
    LINE_C: 'C线',
    ALL: '全部',
  };
  return map[value] || value || '-';
}
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 配置名称 -->
        <FormItem
          :label="$t('repair.repairProcessConfig.configName')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.keyword"
            :placeholder="
              $t('repair.repairProcessConfig.configNamePlaceholder')
            "
            allow-clear
            style="width: 180px"
          />
        </FormItem>

        <!-- 设备分组 -->
        <FormItem
          :label="$t('repair.repairProcessConfig.equipmentGroup')"
          style="margin-bottom: 0"
        >
          <Select
            v-model:value="queryParams.equipmentGroup"
            :placeholder="
              $t('repair.repairProcessConfig.equipmentGroupPlaceholder')
            "
            allow-clear
            style="width: 150px"
            :options="equipmentGroupOptions"
          />
        </FormItem>

        <!-- 状态 -->
        <FormItem :label="$t('common.status')" style="margin-bottom: 0">
          <Select
            v-model:value="queryParams.status"
            :placeholder="$t('repair.repairProcessConfig.statusPlaceholder')"
            allow-clear
            style="width: 120px"
            :options="statusOptions"
          />
        </FormItem>

        <!-- 重置按钮 -->
        <FormItem style="margin-bottom: 0">
          <Button @click="handleReset">
            {{ $t('common.reset') }}
          </Button>
        </FormItem>

        <!-- 查询按钮 -->
        <FormItem style="margin-bottom: 0">
          <Button type="primary" @click="gridApi.reload()">
            {{ $t('common.search') }}
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
            <Icon icon="mdi:plus" class="inline-block align-middle" />
            {{ $t('common.add') }}
          </Button>
        </template>
        <template #equipmentGroup="{ row }">
          {{ formatEquipmentGroup(row.equipmentGroup) }}
        </template>
        <template #status="{ row }">
          <Switch
            :disabled="!author.includes('状态变更')"
            :checked="row.status === 'ENABLED'"
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
    <StepConfigDrawer
      v-model:open="drawerVisible"
      :flow-config-id="currentRow?.id"
      @success="onDrawerSuccess"
    />
  </Page>
</template>

<style scoped></style>
