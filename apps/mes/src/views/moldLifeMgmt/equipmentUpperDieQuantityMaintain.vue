<script lang="ts" setup>
/**
 * [INPUT]: 依赖 equipmentUpperDieQuantityMaintain.service.ts、moldBase.service.ts 中的 API
 * [OUTPUT]: 对外提供设备上模数量配置维护页面组件
 * [POS]: 模具全生命周期 的设备上模数量配置维护页面
 * [PROTOCOL]: 变更时更新此头部
 * [TIME]: 2026-09-07 00:00:00
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
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addEquipCategoryLimit,
  deleteEquipCategoryLimit,
  getEquipCategoryLimitPage,
  getMoldCategoryList,
  updateEquipCategoryLimit,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// region 常量与状态

/** 权限码列表：新增/编辑/删除 */
const author = ref<string[]>([]);
/** 路由实例：用于获取菜单编码 */
const route = useRoute();

/** 模具类别下拉选项（仅启用类别，value 为类别ID） */
const categoryOptions = ref<any[]>([]);

/** 查询参数 */
const queryParams = ref<any>({
  equipmentCode: '',
  categoryId: undefined,
});

/** 抽屉显示状态 */
const drawerVisible = ref(false);
/** 抽屉标题 */
const drawerTitle = ref('');
/** 当前编辑/新增的表单数据 */
const currentRow = ref<any>({});
/** 抽屉提交 loading */
const drawerLoading = ref(false);
/** 抽屉内表单实例 */
const editForm = ref();

/** 表单验证规则 */
const editRules = ref<any>({
  equipmentCode: [
    {
      required: true,
      message: $t('equipmentUpperDieQuantityMaintain.equipmentCodeRequired'),
      trigger: 'change',
    },
  ],
  categoryId: [
    {
      required: true,
      message: $t('equipmentUpperDieQuantityMaintain.categoryRequired'),
      trigger: 'change',
    },
  ],
  maxOnMachine: [
    {
      required: true,
      message: $t('equipmentUpperDieQuantityMaintain.maxOnMachineRequired'),
      trigger: 'change',
    },
  ],
});

// endregion

// region 表格配置

/** 表格列：序号、设备编码、类别编码、模具类别、最大在机模具数、操作 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      type: 'seq',
      width: 60,
      title: $t('equipmentUpperDieQuantityMaintain.sequence'),
    },
    {
      field: 'equipmentCode',
      minWidth: 150,
      title: $t('equipmentUpperDieQuantityMaintain.equipmentCode'),
    },
    {
      field: 'categoryCode',
      minWidth: 120,
      title: $t('equipmentUpperDieQuantityMaintain.categoryCode'),
    },
    {
      field: 'categoryName',
      minWidth: 150,
      title: $t('equipmentUpperDieQuantityMaintain.categoryName'),
    },
    {
      field: 'maxOnMachine',
      minWidth: 140,
      title: $t('equipmentUpperDieQuantityMaintain.maxOnMachine'),
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('common.action'),
      width: 140,
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

// region 数据查询

/**
 * 分页查询配置列表
 * @param params 分页参数
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

    getEquipCategoryLimitPage(params)
      .then(({ total, results }: any) => {
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

/** 重置查询条件并刷新 */
function handleReset() {
  queryParams.value = {
    equipmentCode: '',
    categoryId: undefined,
  };
  gridApi.reload();
}

// endregion

// region 模具类别下拉

/** 加载启用状态的模具类别作为下拉选项 */
function loadCategoryOptions() {
  getMoldCategoryList({ status: 'ACTIVE' }).then((res: any[]) => {
    categoryOptions.value = (res || []).map((item: any) => ({
      label: item.categoryName,
      value: item.id,
    }));
  });
}

// endregion

// region 新增/编辑/删除

/**
 * 打开新增抽屉
 */
function handleAdd() {
  currentRow.value = {
    equipmentCode: '',
    categoryId: undefined,
    maxOnMachine: undefined,
  };
  drawerTitle.value = $t('equipmentUpperDieQuantityMaintain.addTitle');
  drawerVisible.value = true;
}

/**
 * 打开编辑抽屉（仅允许修改最大在机模具数）
 * @param row 行数据
 */
function handleEdit(row: any) {
  currentRow.value = { ...row };
  // 编辑回显时若类别不在下拉选项中，补充展示当前类别
  if (
    row.categoryId !== undefined &&
    !categoryOptions.value.some((item) => item.value === row.categoryId)
  ) {
    categoryOptions.value = [
      ...categoryOptions.value,
      { label: row.categoryName, value: row.categoryId },
    ];
  }
  drawerTitle.value = $t('equipmentUpperDieQuantityMaintain.editTitle');
  drawerVisible.value = true;
}

/**
 * 关闭抽屉并清空表单
 */
function handleClose() {
  drawerVisible.value = false;
  currentRow.value = {};
}

/**
 * 提交新增/编辑
 */
function handleSubmit() {
  editForm.value.validate().then(() => {
    drawerLoading.value = true;
    const { id, equipmentCode, categoryId, maxOnMachine } = currentRow.value;
    const operation = id
      ? updateEquipCategoryLimit({ id, maxOnMachine })
      : addEquipCategoryLimit({ equipmentCode, categoryId, maxOnMachine });

    operation
      .then(() => {
        message.success($t('common.successfulOperation'));
        handleClose();
        gridApi.reload();
      })
      .finally(() => {
        drawerLoading.value = false;
      });
  });
}

/**
 * 删除配置（二次确认）
 * @param row 行数据
 */
function handleDelete(row: any) {
  Modal.confirm({
    cancelText: $t('common.cancel'),
    okText: $t('common.confirm'),
    okType: 'danger',
    onOk() {
      deleteEquipCategoryLimit(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
    title: $t('equipmentUpperDieQuantityMaintain.confirmDelete'),
  });
}

// endregion

// region 生命周期

onMounted(() => {
  // 加载按钮权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  // 加载启用状态的模具类别下拉
  loadCategoryOptions();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 设备编码 -->
        <FormItem
          :label="$t('equipmentUpperDieQuantityMaintain.equipmentCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.equipmentCode"
            :placeholder="
              $t('equipmentUpperDieQuantityMaintain.equipmentCodePlaceholder')
            "
            allow-clear
            style="width: 200px"
          />
        </FormItem>

        <!-- 模具类别 -->
        <FormItem
          :label="$t('equipmentUpperDieQuantityMaintain.category')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.categoryId"
            :options="categoryOptions"
            allow-clear
            :placeholder="
              $t('equipmentUpperDieQuantityMaintain.categoryPlaceholder')
            "
            style="width: 200px"
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
          <Button @click="handleReset">
            {{ $t('common.reset') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 表格区域 -->
    <Card>
      <Grid>
        <!-- 工具栏（必须保留，用于渲染新增按钮） -->
        <template #toolbar-tools>
          <Button
            v-if="author.includes('新增')"
            type="primary"
            @click="handleAdd"
          >
            {{ $t('common.add') }}
          </Button>
        </template>

        <!-- 操作插槽 -->
        <template #action="{ row }">
          <Space>
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
                  icon="mdi:delete-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- region 新增/编辑抽屉 -->
    <Drawer
      v-model:open="drawerVisible"
      :loading="drawerLoading"
      :title="drawerTitle"
      :width="500"
      :footer-style="{ textAlign: 'right' }"
      :destroy-on-close="true"
      @close="handleClose"
    >
      <Form
        ref="editForm"
        :label-col="{ span: 6 }"
        :model="currentRow"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
      >
        <!-- 设备编码（编辑时不可修改） -->
        <FormItem
          :label="$t('equipmentUpperDieQuantityMaintain.equipmentCode')"
          name="equipmentCode"
        >
          <Input
            v-model:value="currentRow.equipmentCode"
            :disabled="!!currentRow.id"
            :placeholder="
              $t('equipmentUpperDieQuantityMaintain.equipmentCodePlaceholder')
            "
          />
        </FormItem>

        <!-- 模具类别（编辑时不可修改） -->
        <FormItem
          :label="$t('equipmentUpperDieQuantityMaintain.category')"
          name="categoryId"
        >
          <Select
            v-model:value="currentRow.categoryId"
            :disabled="!!currentRow.id"
            :options="categoryOptions"
            :placeholder="
              $t('equipmentUpperDieQuantityMaintain.categoryPlaceholder')
            "
          />
        </FormItem>

        <!-- 最大在机模具数 -->
        <FormItem
          :label="$t('equipmentUpperDieQuantityMaintain.maxOnMachine')"
          name="maxOnMachine"
        >
          <InputNumber
            v-model:value="currentRow.maxOnMachine"
            :min="1"
            :precision="0"
            style="width: 100%"
          />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <Button @click="handleClose">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="primary" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
