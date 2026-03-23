<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  message,
  Modal,
  Space,
  TabPane,
  Tabs,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteMaterialInventory,
  exportMaterialInventory,
  fetchMaterialInventoryDetail,
  fetchMaterialInventoryList,
  fetchMaterialInventoryProfitLossDetail,
  issueMaterialInventory,
  profitLossMaterialInventory,
  unIssueMaterialInventory,
} from '#/api';
import { queryAuth } from '#/util';
import MaterialInventoryDrawer from '#/util/component/storeManagement/MaterialInventoryDrawer.vue';

const emit = defineEmits<{
  success: [];
}>();
const route = useRoute();
const author = ref<string[]>([]);
const permissions = computed(() => ({
  add: author.value.includes('新增'),
  delete: author.value.includes('删除'),
  edit: author.value.includes('编辑'),
  export: author.value.includes('导出'),
  issue: author.value.includes('签发'),
  profitLoss: author.value.includes('转盈亏单'),
  unIssue: author.value.includes('取消签发'),
}));

const selectedRows = ref<any[]>([]);
const selectedIds = computed(() =>
  selectedRows.value.map((item: any) => item.id),
);
const currentRow = ref<any>(null);
const detailTab = ref<'inventory' | 'profitLoss'>('inventory');
const drawerVisible = ref(false);
const drawerStatus = ref<'add' | 'edit'>('add');
const currentEditRow = ref<any>(null);

const mainGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: { highlight: true, reserve: true },
  columns: [
    { type: 'checkbox', width: 50 },
    {
      field: 'formCode',
      minWidth: 150,
      title: $t('storeManagement.materialInventory.formCode'),
    },
    {
      field: 'inventoryTime',
      minWidth: 120,
      slots: { default: 'inventoryTime' },
      title: $t('storeManagement.materialInventory.inventoryDate'),
    },
    {
      field: 'remark',
      minWidth: 200,
      title: $t('storeManagement.materialInventory.remark'),
    },
    {
      field: 'operateUserName',
      minWidth: 110,
      title: $t('storeManagement.materialInventory.operatorName'),
    },
    {
      field: 'operateTime',
      minWidth: 120,
      slots: { default: 'operateTime' },
      title: $t('storeManagement.materialInventory.operateDate'),
    },
  ],
  height: 340,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
    pageSizes: [10, 20, 50],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryMainData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  rowConfig: {
    isCurrent: true,
    keyField: 'id',
  },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const detailGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      field: 'materialCode',
      minWidth: 120,
      title: $t('storeManagement.materialInventory.materialCode'),
    },
    {
      field: 'materialName',
      minWidth: 200,
      title: $t('storeManagement.materialInventory.materialName'),
    },
    {
      field: 'unit',
      width: 80,
      title: $t('storeManagement.materialInventory.unit'),
    },
    {
      field: 'labelCode',
      minWidth: 140,
      title: $t('storeManagement.materialInventory.labelCode'),
    },
    {
      field: 'wareLocationName',
      minWidth: 120,
      title: $t('storeManagement.materialInventory.wareLocation'),
    },
    {
      field: 'logicalHouseName',
      minWidth: 120,
      title: $t('storeManagement.materialInventory.logicalWarehouse'),
    },
    {
      field: 'stockQuality',
      minWidth: 110,
      title: $t('storeManagement.materialInventory.stockQty'),
    },
    {
      field: 'realQuality',
      minWidth: 110,
      title: $t('storeManagement.materialInventory.realQty'),
    },
    {
      field: 'profitLossQuality',
      minWidth: 110,
      title: $t('storeManagement.materialInventory.profitLossQty'),
    },
    {
      field: 'operateUserName',
      minWidth: 110,
      title: $t('storeManagement.materialInventory.operatorName'),
    },
    {
      field: 'operateTime',
      minWidth: 120,
      slots: { default: 'detailOperateTime' },
      title: $t('storeManagement.materialInventory.operateDate'),
    },
  ],
  height: 420,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryDetailData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  showOverflow: 'tooltip',
  stripe: true,
};

const mainGridEvents: VxeGridListeners<any> = {
  checkboxChange: () => {
    updateSelection();
  },
  currentRowChange: ({ row }: { row: any }) => {
    handleCurrentChange({ row });
  },
};

const detailGridEvents: VxeGridListeners<any> = {};

const [MainGrid, mainGridApi] = useVbenVxeGrid({
  gridEvents: mainGridEvents,
  gridOptions: mainGridOptions,
});
const [DetailGrid, detailGridApi] = useVbenVxeGrid({
  gridEvents: detailGridEvents,
  gridOptions: detailGridOptions,
});

function formatDateOnly(value: null | string | undefined) {
  if (!value) return '';
  return value.length > 10 ? value.slice(0, 10) : value;
}

function updateSelection() {
  selectedRows.value = mainGridApi.grid?.getCheckboxRecords() || [];
}

function clearSelectionAndDetail() {
  selectedRows.value = [];
  currentRow.value = null;
  detailGridApi.setGridOptions({
    data: [],
  });
}

function queryMainData({ page, pageSize }: { page: number; pageSize: number }) {
  return new Promise<{ items: any[]; total: number }>((resolve, reject) => {
    fetchMaterialInventoryList({ pageNum: page, pageSize })
      .then((data: any) => {
        resolve({
          items: data?.results ?? [],
          total: data?.total ?? 0,
        });
      })
      .catch(reject);
  });
}

function queryDetailData({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  return new Promise<{ items: any[]; total: number }>((resolve, reject) => {
    if (!currentRow.value?.id) {
      resolve({ items: [], total: 0 });
      return;
    }
    const params = {
      id: currentRow.value.id,
      pageNum: page,
      pageSize,
    };
    const request =
      detailTab.value === 'inventory'
        ? fetchMaterialInventoryDetail(params)
        : fetchMaterialInventoryProfitLossDetail(params);
    request
      .then((data: any) => {
        resolve({
          items: data?.results ?? [],
          total: data?.total ?? 0,
        });
      })
      .catch(reject);
  });
}

function handleCurrentChange({ row }: { row: any }) {
  currentRow.value = row;
  detailGridApi.reload();
}

function handleAdd() {
  drawerStatus.value = 'add';
  drawerVisible.value = true;
}

function handleEdit() {
  if (selectedIds.value.length !== 1) {
    message.warning($t('storeManagement.materialInventory.selectOneData'));
    return;
  }
  const selectedRow = selectedRows.value[0];
  if (selectedRow.profitLoss) {
    message.warning('该盘点单已转盈亏单，不能编辑');
    return;
  }
  currentEditRow.value = selectedRow;
  drawerStatus.value = 'edit';
  drawerVisible.value = true;
}

function handleDelete() {
  if (selectedIds.value.length === 0) {
    message.warning($t('storeManagement.materialInventory.selectData'));
    return;
  }
  Modal.confirm({
    title: '提示',
    content: '是否确定删除?',
    onOk: () => {
      deleteMaterialInventory(selectedIds.value)
        .then(() => {
          message.success('删除成功');
          clearSelectionAndDetail();
          mainGridApi.reload();
        })
        .catch(() => {
          message.warning('操作失败');
        });
    },
  });
}

function issueByType(type: 'issue' | 'profitLoss' | 'unIssue') {
  if (selectedIds.value.length === 0) {
    message.warning($t('storeManagement.materialInventory.selectData'));
    return;
  }
  const confirmText = {
    issue: '确认是否签发!',
    profitLoss: '确认转盈亏单!',
    unIssue: '确认是否取消签发!',
  };
  const requestMap = {
    issue: issueMaterialInventory,
    profitLoss: profitLossMaterialInventory,
    unIssue: unIssueMaterialInventory,
  };
  Modal.confirm({
    title: '提示',
    content: confirmText[type],
    onOk: () => {
      requestMap[type](selectedIds.value)
        .then(() => {
          message.success('操作成功');
          clearSelectionAndDetail();
          mainGridApi.reload();
        })
        .catch(() => {
          message.warning('操作失败');
        });
    },
  });
}

function handleExport() {
  if (selectedIds.value.length !== 1) {
    message.warning($t('storeManagement.materialInventory.selectOneData'));
    return;
  }
  exportMaterialInventory(selectedIds.value[0])
    .then((url: string) => {
      if (url) {
        window.open(url, '_blank');
      }
    })
    .catch(() => {
      message.warning('操作失败');
    });
}

onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

watch(detailTab, () => {
  detailGridApi.reload();
});
</script>

<template>
  <Page>
    <Card class="!mb-8">
      <Space>
        <Button v-if="permissions.add" type="primary" @click="handleAdd">
          {{ $t('common.add') }}
        </Button>
        <Button v-if="permissions.edit" type="primary" @click="handleEdit">
          {{ $t('common.edit') }}
        </Button>
        <Button v-if="permissions.delete" danger @click="handleDelete">
          {{ $t('common.delete') }}
        </Button>
        <Button
          v-if="permissions.issue"
          type="primary"
          @click="issueByType('issue')"
        >
          {{ $t('storeManagement.materialInventory.issue') }}
        </Button>
        <Button
          v-if="permissions.unIssue"
          type="primary"
          @click="issueByType('unIssue')"
        >
          {{ $t('storeManagement.materialInventory.cancelIssue') }}
        </Button>
        <Button
          v-if="permissions.profitLoss"
          type="primary"
          @click="issueByType('profitLoss')"
        >
          {{ $t('storeManagement.materialInventory.toProfitLoss') }}
        </Button>
        <Button v-if="permissions.export" type="primary" @click="handleExport">
          {{ $t('common.export') }}
        </Button>
      </Space>
    </Card>

    <Card class="!mb-8">
      <MainGrid>
        <template #inventoryTime="{ row }">
          {{ formatDateOnly(row.inventoryTime) }}
        </template>
        <template #operateTime="{ row }">
          {{ formatDateOnly(row.operateTime) }}
        </template>
      </MainGrid>
    </Card>

    <Card v-if="currentRow">
      <Tabs v-model:active-key="detailTab">
        <TabPane
          key="inventory"
          :tab="$t('storeManagement.materialInventory.inventoryDetail')"
        >
          <DetailGrid>
            <template #detailOperateTime="{ row }">
              {{ formatDateOnly(row.operateTime) }}
            </template>
          </DetailGrid>
        </TabPane>
        <TabPane
          key="profitLoss"
          :tab="$t('storeManagement.materialInventory.profitLossDetail')"
        >
          <DetailGrid>
            <template #detailOperateTime="{ row }">
              {{ formatDateOnly(row.operateTime) }}
            </template>
          </DetailGrid>
        </TabPane>
      </Tabs>
    </Card>

    <!-- 新增/编辑Drawer -->
    <MaterialInventoryDrawer
      :visible="drawerVisible"
      :status="drawerStatus"
      :record-data="currentEditRow"
      @success="() => emit('success')"
      @update:visible="(val: boolean) => (drawerVisible = val)"
    />
  </Page>
</template>
