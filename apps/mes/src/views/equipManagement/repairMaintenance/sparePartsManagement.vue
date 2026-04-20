<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue、vxe-table、sparePart.service API
 * [OUTPUT]: 对外提供备件管理页面组件，含备件列表、新增/编辑/删除、查看详情功能
 * [POS]: 维修维护模块 的备件管理页面，管理备件基础信息
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
  Input,
  message,
  Modal,
  Select,
  SelectOption,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteSparePart, getSparePartPage, searchBaseConfig } from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import SparePartDrawer from '#/util/component/repairMaintenance/SparePartDrawer.vue';

// ========== 权限 ==========
/** 当前路由实例，用于获取权限码 */
const route = useRoute();
/** 按钮权限列表，如 ['新增', '编辑', '删除'] */
const author = ref<string[]>([]);

// ========== 备件类型选项 ==========
/** 备件类型下拉选项列表 */
const spareTypeOptions = ref<any[]>([]);

/**
 * 加载备件类型选项。
 * @returns {Promise<void>} 无返回值，数据直接赋值给 spareTypeOptions。
 * @throws {Error} API 调用失败时抛出错误。
 * @since 2026-04-20 15:13:00
 */
function loadSpareTypeOptions() {
  searchBaseConfig({ configType: 'SPARE_TYPE' }).then((res: any[]) => {
    spareTypeOptions.value = (res || []).map((item: any) => ({
      label: item.configName,
      value: item.configCode,
    }));
  });
}

/**
 * 组件挂载时执行初始化。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:13:00
 */
onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  loadSpareTypeOptions();
});

// ========== 查询参数 ==========
/** 备件列表查询参数，包含备件编码、名称、类型、设备组 */
const queryParams = ref<any>({
  spareCode: undefined,
  spareName: undefined,
  spareType: undefined,
  equipmentGroup: undefined,
});

// ========== 表格配置 ==========
/** VXE Grid 表格配置对象 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    {
      field: 'spareCode',
      title: $t('repair.sparePart.spareCode'),
      minWidth: 120,
    },
    {
      field: 'spareName',
      title: $t('repair.sparePart.spareName'),
      minWidth: 150,
    },
    {
      field: 'spareModel',
      title: $t('repair.sparePart.spareModel'),
      minWidth: 120,
    },
    {
      field: 'spareTypeName',
      title: $t('repair.sparePart.spareType'),
      minWidth: 100,
    },
    {
      field: 'equipmentGroup',
      title: $t('repair.sparePart.equipmentGroup'),
      minWidth: 120,
    },
    {
      field: 'action',
      title: $t('common.action'),
      width: 220,
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

/** VXE Grid 事件监听配置 */
const gridEvents: VxeGridListeners<any> = {};

/** VXE Grid 组件实例及 API */
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 查询备件列表数据。
 * @param {{ currentPage: number; pageSize: number }} [page] - 可选，分页参数。
 * @returns {Promise<{ total: number; items: any[] }>} 包含总数和数据列表的 Promise。
 * @throws {Error} API 调用失败时拒绝 Promise。
 * @since 2026-04-20 15:13:00
 */
function queryData(page?: { currentPage: number; pageSize: number }) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams.value,
      pageNum: page?.currentPage || 1,
      pageSize: page?.pageSize || 20,
    };
    getSparePartPage(params)
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

/**
 * 处理查询按钮点击，刷新表格数据。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:13:00
 */
function handleQuery() {
  gridApi.reload();
}

/**
 * 处理重置按钮点击，清空查询条件并刷新表格。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:13:00
 */
function handleReset() {
  queryParams.value = {
    spareCode: undefined,
    spareName: undefined,
    spareType: undefined,
    equipmentGroup: undefined,
  };
  gridApi.reload();
}

// ========== 抽屉控制 ==========
/** 抽屉显示状态 */
const drawerVisible = ref(false);
/** 抽屉模式：add-新增，edit-编辑，view-查看 */
const drawerMode = ref<'add' | 'edit' | 'view'>('add');
/** 当前操作的行数据 */
const currentRow = ref<any>(null);

/**
 * 打开抽屉。
 * @param {any} [row] - 可选，要操作的数据行；不传则表示新增。
 * @param {'add' | 'edit' | 'view'} [mode='add'] - 抽屉模式：add新增，edit编辑，view查看。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:13:00
 */
function openDrawer(row?: any, mode: 'add' | 'edit' | 'view' = 'add') {
  currentRow.value = row || null;
  drawerMode.value = mode;
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

// ========== 操作 ==========
/**
 * 处理新增按钮点击，打开新增抽屉。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:13:00
 */
function handleAdd() {
  openDrawer(null, 'add');
}

/**
 * 处理查看详情按钮点击，打开查看抽屉。
 * @param {any} row - 要查看的行数据。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:13:00
 */
function handleDetail(row: any) {
  openDrawer(row, 'view');
}

/**
 * 处理编辑按钮点击，打开编辑抽屉。
 * @param {any} row - 要编辑的行数据。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:13:00
 */
function handleEdit(row: any) {
  openDrawer(row, 'edit');
}

/**
 * 处理删除按钮点击，弹出确认框后执行删除。
 * @param {any} row - 要删除的行数据，需包含 id 和 spareName。
 * @returns {void} 无返回值，删除成功后显示提示并刷新数据。
 * @throws {Error} 删除操作被取消时不抛出错误。
 * @since 2026-04-20 15:13:00
 */
function handleDelete(row: any) {
  Modal.confirm({
    title: $t('repair.sparePart.confirmDelete'),
    content: `确定要删除备件「${row.spareName}」吗？`,
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      deleteSparePart(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
  });
}
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 备件编码 -->
        <FormItem
          :label="$t('repair.sparePart.spareCode')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.spareCode"
            :placeholder="`请输入${$t('repair.sparePart.spareCode')}`"
            allow-clear
            style="width: 160px"
          />
        </FormItem>

        <!-- 备件名称 -->
        <FormItem
          :label="$t('repair.sparePart.spareName')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.spareName"
            :placeholder="`请输入${$t('repair.sparePart.spareName')}`"
            allow-clear
            style="width: 160px"
          />
        </FormItem>

        <!-- 备件类型 -->
        <FormItem
          :label="$t('repair.sparePart.spareType')"
          style="margin-bottom: 0"
        >
          <Select
            v-model:value="queryParams.spareType"
            :placeholder="`请选择${$t('repair.sparePart.spareType')}`"
            allow-clear
            style="width: 160px"
          >
            <SelectOption
              v-for="item in spareTypeOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </SelectOption>
          </Select>
        </FormItem>

        <!-- 适用设备组 -->
        <FormItem
          :label="$t('repair.sparePart.equipmentGroup')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.equipmentGroup"
            :placeholder="`请输入${$t('repair.sparePart.equipmentGroup')}`"
            allow-clear
            style="width: 160px"
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
            <Tooltip v-if="author.includes('编辑')">
              <template #title>{{ $t('common.edit') }}</template>
              <Button type="link" @click="handleEdit(row)">
                <Icon
                  icon="mdi:pencil-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="author.includes('删除')">
              <template #title>{{ $t('common.delete') }}</template>
              <Button type="link" danger @click="handleDelete(row)">
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
    <SparePartDrawer
      v-model:open="drawerVisible"
      :row="currentRow"
      :mode="drawerMode"
      @success="onDrawerSuccess"
    />
  </Page>
</template>

<style scoped></style>
