<script lang="ts" setup>
/**
 * [INPUT]: 依赖 moldArchiveMgmt.service.ts 中的 API、moldCategoryMgmt.service.ts 类别接口、SMTPlantAdd.service.ts 工序接口
 * [OUTPUT]: 对外提供模具档案管理页面组件
 * [POS]: 设备管理模块 的模具档案管理页面，与 moldArchiveMgmt.service.ts 配合使用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-18 10:31:00
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
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteMoldArchiveById,
  getMoldArchivePageList,
  getMoldCategorySelectList,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import MoldArchiveDrawer from '#/util/component/equipmentCheckDrawer/MoldArchiveDrawer.vue';

// region 常量定义

/** 状态选项：启用/停用 */
const statusOptions = [
  { label: $t('moldArchiveMgmt.statusActive'), value: 'ACTIVE' },
  { label: $t('moldArchiveMgmt.statusDisabled'), value: 'DISABLED' },
];

/** 类别选项：从后端加载 */
const categoryOptions = ref<any[]>([]);

// endregion

// region 表格配置

/** 表格列配置：模具编码、名称、类别、位置、寿命信息、状态、操作 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: '序号' },
    { field: 'moldCode', title: $t('moldArchiveMgmt.moldCode'), minWidth: 200 },
    { field: 'moldName', title: $t('moldArchiveMgmt.moldName'), minWidth: 150 },
    {
      field: 'moldGroupName',
      title: $t('moldArchiveMgmt.moldGroupName'),
      minWidth: 120,
    },
    { field: 'location', title: $t('moldArchiveMgmt.location'), minWidth: 120 },
    {
      field: 'totalLifespan',
      title: $t('moldArchiveMgmt.totalLifespan'),
      minWidth: 100,
    },
    {
      field: 'usedCount',
      title: $t('moldArchiveMgmt.usedCount'),
      minWidth: 100,
    },
    {
      field: 'remainingLifespan',
      title: $t('moldArchiveMgmt.remainingLifespan'),
      minWidth: 100,
    },
    {
      field: 'usagePercent',
      title: $t('moldArchiveMgmt.usagePercent'),
      minWidth: 100,
      slots: { default: 'usagePercent' },
    },
    {
      field: 'currentStatus',
      title: $t('moldArchiveMgmt.currentStatus'),
      minWidth: 100,
      slots: { default: 'currentStatus' },
    },
    {
      field: 'status',
      fixed: 'right',
      title: $t('moldArchiveMgmt.status'),
      minWidth: 80,
      slots: { default: 'status' },
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 250,
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

// endregion

// region 查询参数

/** 查询参数：关键词、状态、类别 */
const queryParams = ref<any>({
  keyword: '',
  status: undefined,
  categoryId: undefined,
});

// endregion

// region 数据查询

/**
 * 分页查询模具档案列表。
 * @param {Object} params - 分页参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页条数
 * @returns {Promise<{total: number, items: any[]}>} 包含总数和数据列表的 Promise
 * @since 2026-05-18 10:31:00
 */
function queryData({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) {
  return new Promise((resolve) => {
    const params = {
      ...queryParams.value,
      pageNum,
      pageSize,
    };

    getMoldArchivePageList(params)
      .then(({ total, results }) => {
        resolve({
          total: total || 0,
          items: results || [],
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

// endregion

// region 抽屉控制

/** 抽屉显示/隐藏状态 */
const drawerVisible = ref(false);

/** 抽屉模式：add-新增，edit-编辑，view-查看 */
const drawerMode = ref<'add' | 'edit' | 'view'>('add');

/** 当前操作的行数据 */
const currentRow = ref<any>(null);

/**
 * 打开新增抽屉。
 */
function handleAdd() {
  drawerMode.value = 'add';
  currentRow.value = null;
  drawerVisible.value = true;
}

/**
 * 打开编辑抽屉。
 * @param {any} row - 当前操作的行数据对象
 */
function handleEdit(row: any) {
  drawerMode.value = 'edit';
  currentRow.value = row;
  drawerVisible.value = true;
}

/**
 * 打开详情抽屉。
 * @param {any} row - 当前操作的行数据对象
 */
function handleView(row: any) {
  drawerMode.value = 'view';
  currentRow.value = row;
  drawerVisible.value = true;
}

// endregion

// region 状态操作

/**
 * 删除模具档案，确认后调用 API。
 * @param {any} row - 当前操作的行数据对象，需包含 id
 * @since 2026-05-18 10:31:00
 */
function handleDelete(row: any) {
  Modal.confirm({
    cancelText: $t('common.cancel'),
    okText: $t('common.confirm'),
    okType: 'danger',
    onOk() {
      deleteMoldArchiveById(row.id).then(() => {
        message.success($t('moldArchiveMgmt.deleteSuccess'));
        gridApi.query();
      });
    },
    title: $t('moldArchiveMgmt.confirmDelete'),
  });
}

// endregion

// region 辅助方法

/**
 * 根据当前状态值获取对应的显示标签。
 * @param {string} status - 当前状态值，如 'IN_STORAGE'、'IN_USE'
 * @returns {string} 对应的国际化标签，未找到时返回原值
 * @since 2026-05-18 10:31:00
 */
function getCurrentStatusLabel(status: string) {
  const currentStatusOptions = [
    {
      label: $t('moldArchiveMgmt.currentStatusInStorage'),
      value: 'IN_STORAGE',
    },
    { label: $t('moldArchiveMgmt.currentStatusInUse'), value: 'IN_USE' },
    {
      label: $t('moldArchiveMgmt.currentStatusMaintenance'),
      value: 'MAINTENANCE',
    },
  ];
  const option = currentStatusOptions.find((item) => item.value === status);
  return option ? option.label : status;
}

/**
 * 获取使用占比对应的颜色。
 * @param {any} row - 行数据，包含 usagePercent、warningThreshold、blockThreshold
 * @returns {string} 颜色值：红色-超过拦截阈值、橙色-超过预警阈值、绿色-正常
 * @since 2026-05-18 10:31:00
 */
function getUsagePercentColor(row: any) {
  const percent = row.usagePercent || 0;
  const block = row.blockThreshold || 100;
  const warning = row.warningThreshold || 100;

  if (percent >= block) {
    return 'red';
  } else if (percent >= warning) {
    return 'orange';
  }
  return 'green';
}

// endregion

// region 权限控制

/** 用户权限列表：用于控制按钮显示和操作权限 */
const author = ref<string[]>([]);

/** 路由实例：用于获取路由元信息中的权限编码 */
const route = useRoute();

/**
 * 组件挂载时执行：加载用户权限和下拉选项。
 * @since 2026-05-18 10:31:00
 */
onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// endregion

// region 消息提示

/**
 * 加载模具类别选项。
 * @since 2026-05-18 10:31:00
 */
function loadCategoryOptions() {
  getMoldCategorySelectList({ status: 'ACTIVE' }).then((res: any[]) => {
    categoryOptions.value = (res || []).map((item: any) => ({
      label: item.categoryName,
      value: item.id,
    }));
  });
}

onMounted(() => {
  loadCategoryOptions();
});

// endregion
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 关键词搜索 -->
        <FormItem
          :label="$t('moldArchiveMgmt.keyword')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.keyword"
            :placeholder="$t('moldArchiveMgmt.keywordPlaceholder')"
            allow-clear
            style="width: 200px"
          />
        </FormItem>

        <!-- 状态筛选 -->
        <FormItem
          :label="$t('moldArchiveMgmt.status')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.status"
            :options="statusOptions"
            allow-clear
            placeholder="请选择状态"
            style="width: 120px"
          />
        </FormItem>

        <!-- 类别筛选 -->
        <FormItem
          :label="$t('moldArchiveMgmt.categoryId')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.categoryId"
            :options="categoryOptions"
            allow-clear
            :placeholder="$t('moldArchiveMgmt.categoryPlaceholder')"
            style="width: 150px"
          />
        </FormItem>

        <!-- 查询按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="gridApi.reload()">
            {{ $t('common.search') }}
          </Button>
        </FormItem>

        <!-- 重置按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button
            @click="
              () => {
                queryParams = {
                  keyword: '',
                  status: undefined,
                  categoryId: undefined,
                };
                gridApi.reload();
              }
            "
          >
            {{ $t('common.reset') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid>
        <!-- 工具栏 -->
        <template #toolbar-tools>
          <Button
            v-if="author.includes('新增')"
            type="primary"
            @click="handleAdd"
          >
            {{ $t('common.add') }}
          </Button>
        </template>

        <!-- 使用占比插槽 -->
        <template #usagePercent="{ row }">
          <Tag :color="getUsagePercentColor(row)">
            {{ row.usagePercent }}%
          </Tag>
        </template>

        <!-- 当前状态插槽 -->
        <template #currentStatus="{ row }">
          <Tag v-if="row.currentStatus === 'IN_STORAGE'" color="blue">
            {{ getCurrentStatusLabel(row.currentStatus) }}
          </Tag>
          <Tag v-else-if="row.currentStatus === 'IN_USE'" color="green">
            {{ getCurrentStatusLabel(row.currentStatus) }}
          </Tag>
          <Tag v-else-if="row.currentStatus === 'MAINTENANCE'" color="orange">
            {{ getCurrentStatusLabel(row.currentStatus) }}
          </Tag>
          <Tag v-else>
            {{ row.currentStatusName || '-' }}
          </Tag>
        </template>

        <!-- 状态插槽 -->
        <template #status="{ row }">
          <Tag :color="row.status === 'ACTIVE' ? 'success' : 'default'">
            {{
              row.status === 'ACTIVE'
                ? $t('moldArchiveMgmt.statusActive')
                : $t('moldArchiveMgmt.statusDisabled')
            }}
          </Tag>
        </template>

        <!-- 操作插槽 -->
        <template #action="{ row }">
          <Space>
            <!-- 查看详情 -->
            <Tooltip>
              <template #title>{{ $t('common.view') }}</template>
              <Button type="link" @click="handleView(row)">
                <Icon
                  icon="mdi:eye"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>

            <!-- 编辑 -->
            <Tooltip v-if="author.includes('编辑')">
              <template #title>{{ $t('common.edit') }}</template>
              <Button type="link" @click="handleEdit(row)">
                <Icon
                  icon="mdi:edit-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>

            <!-- 删除 -->
            <Tooltip v-if="author.includes('删除')">
              <template #title>{{ $t('common.delete') }}</template>
              <Button type="link" danger @click="handleDelete(row)">
                <Icon
                  icon="mdi-light:delete"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 新增/编辑/详情抽屉 -->
    <MoldArchiveDrawer
      v-model:visible="drawerVisible"
      :mode="drawerMode"
      :row="currentRow"
      @refresh="gridApi.query()"
    />
  </Page>
</template>

<style scoped></style>
