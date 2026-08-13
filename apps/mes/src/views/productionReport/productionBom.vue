<script lang="ts" setup>
/**
 * 生产BOM页面
 * 用于管理生产BOM的查询、行内编辑、新增、批量保存、批量删除。
 * 功能包括：分页查询生产BOM列表、单条抽屉新增、表格行内编辑后批量保存、批量删除。
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Input,
  message,
  Modal,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteProductBom,
  getProductBomPageList,
  updateProductBom,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import ProductionBomDrawer from '#/util//component/productionReport/ProductionBomDrawer.vue';

const route = useRoute();

// 权限控制
const author = ref<string[]>([]);
const permissions = computed(() => ({
  add: author.value.includes('新增'),
  edit: author.value.includes('编辑'),
  delete: author.value.includes('删除'),
}));

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: { highlight: true, reserve: true },
  columns: [
    { type: 'checkbox', width: 50 },
    { title: $t('productionBom.code'), field: 'code', minWidth: 120 },
    { title: $t('productionBom.planCode'), field: 'planCode', minWidth: 120 },
    { title: $t('productionBom.parentCode'), field: 'parentCode', minWidth: 120 },
    { title: $t('productionBom.materialCode'), field: 'materialCode', minWidth: 120 },
    { title: $t('productionBom.materialName'), field: 'materialName', minWidth: 150 },
    {
      title: $t('productionBom.materialDosage'),
      field: 'materialDosage',
      minWidth: 100,
      slots: { default: 'materialDosageEdit' },
    },
    {
      title: $t('productionBom.perDosage'),
      field: 'perDosage',
      minWidth: 100,
      slots: { default: 'perDosageEdit' },
    },
    {
      title: $t('productionBom.measureError'),
      field: 'measureError',
      minWidth: 100,
      slots: { default: 'measureErrorEdit' },
    },
    { title: $t('productionBom.auxiliaryUnit'), field: 'auxiliaryUnit', minWidth: 100 },
    { title: $t('productionBom.unit'), field: 'unit', minWidth: 100 },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: ({ page }) => {
        const params = {
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        };
        return getProductBomPageList(params).then((res: any) => {
          // 重新加载后清空上一轮变动记录
          modifiedMap.value.clear();
          return {
            items: res.list || [],
            total: res.total || 0,
          };
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {
  checkboxChange: () => {
    updateSelection();
  },
  checkboxAll: () => {
    updateSelection();
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

const drawerRef = ref<InstanceType<typeof ProductionBomDrawer>>();

// 选中的行
const selectedRows = ref<any[]>([]);
const selectedIds = computed(() => selectedRows.value.map((row: any) => row.id));

function updateSelection() {
  selectedRows.value = gridApi.grid?.getCheckboxRecords() || [];
}

// 行内编辑：记录被修改的行（只要发生编辑变动即记录，含改回原值）
// 用 ref 包裹 Map 使其成为响应式，computed 才能正确追踪 .values() 变化
const modifiedMap = ref(new Map<number, any>());
const modifiedRows = computed(() => [...modifiedMap.value.values()]);

function handleFieldChange(row: any) {
  const next = new Map(modifiedMap.value);
  next.set(row.id, { ...row });
  modifiedMap.value = next;
}

// 批量保存：提交所有被修改的行（[] 包裹）
function handleSave() {
  if (modifiedRows.value.length === 0) {
    message.warning($t('productionBom.noModifiedData'));
    return;
  }
  updateProductBom(modifiedRows.value)
    .then(() => {
      message.success($t('productionBom.saveSuccess'));
      modifiedMap.value.clear();
      gridApi.reload();
    })
    .catch(() => {
      message.warning($t('productionBom.operationFailed'));
    });
}

function handleAdd() {
  drawerRef.value?.open('create');
}

// 批量删除：需先勾选数据
function handleBatchDelete() {
  if (selectedRows.value.length === 0) {
    message.warning($t('productionBom.selectData'));
    return;
  }
  Modal.confirm({
    title: $t('productionBom.prompt'),
    content: $t('productionBom.batchDeleteConfirm'),
    onOk: () => {
      deleteProductBom(selectedIds.value)
        .then(() => {
          message.success($t('productionBom.deleteSuccess'));
          selectedRows.value = [];
          gridApi.reload();
        })
        .catch(() => {
          message.warning($t('productionBom.operationFailed'));
        });
    },
  });
}

function handleDrawerSuccess() {
  gridApi.reload();
}

onMounted(() => {
  queryAuth(route.meta.code as string).then((data: string[]) => {
    author.value = data || [];
  });
});
</script>

<template>
  <Page>
    <Card class="!mb-8">
      <Grid>
        <!-- 操作按钮都在 toolbar-tools 插槽，表格内部没有操作栏 -->
        <template #toolbar-tools>
          <Space>
            <Button
              v-if="permissions.add"
              type="primary"
              @click="handleAdd"
            >
              <Icon icon="mdi:plus" class="inline-block align-middle" />
              {{ $t('productionBom.add') }}
            </Button>

            <Button
              v-if="permissions.edit"
              type="primary"
              :disabled="modifiedRows.length === 0"
              @click="handleSave"
            >
              <Icon icon="mdi:content-save" class="inline-block align-middle" />
              {{ $t('productionBom.save') }}
            </Button>

            <Button
              v-if="permissions.delete"
              danger
              :disabled="selectedRows.length === 0"
              @click="handleBatchDelete"
            >
              <Icon icon="mdi:delete-outline" class="inline-block align-middle" />
              {{ $t('productionBom.delete') }}
            </Button>
          </Space>
        </template>

        <!-- 行内编辑插槽：数量 -->
        <template #materialDosageEdit="{ row }">
          <Input
            v-model:value="row.materialDosage"
            @change="handleFieldChange(row)"
          />
        </template>

        <!-- 行内编辑插槽：基准数量 -->
        <template #perDosageEdit="{ row }">
          <Input
            v-model:value="row.perDosage"
            @change="handleFieldChange(row)"
          />
        </template>

        <!-- 行内编辑插槽：测量误差 -->
        <template #measureErrorEdit="{ row }">
          <Input
            v-model:value="row.measureError"
            @change="handleFieldChange(row)"
          />
        </template>
      </Grid>
    </Card>

    <ProductionBomDrawer ref="drawerRef" @refresh="handleDrawerSuccess" />
  </Page>
</template>
