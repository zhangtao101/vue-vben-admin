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
  Form,
  FormItem,
  Input,
  message,
  Modal,
  RangePicker,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteProductBom,
  getProductBomPageList,
  getWorkSheetByBom,
  insertProductBom,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import ProductionBomDrawer from '#/util//component/productionReport/ProductionBomDrawer.vue';
import MaterialSelect from '#/util/component/MaterialSelect.vue';

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
    {
      title: $t('productionBom.code'),
      field: 'code',
      minWidth: 120,
      slots: { default: 'codeEdit' },
    },
    {
      title: $t('productionBom.productCode'),
      field: 'productCode',
      minWidth: 120,
      slots: { default: 'productCodeEdit' },
    },
    {
      title: $t('productionBom.productName'),
      field: 'productName',
      minWidth: 150,
      slots: { default: 'productNameEdit' },
    },
    {
      title: $t('productionBom.materialCode'),
      field: 'materialCode',
      minWidth: 180,
      slots: { default: 'materialCodeEdit' },
    },
    {
      title: $t('productionBom.materialName'),
      field: 'materialName',
      minWidth: 150,
      slots: { default: 'materialNameEdit' },
    },
    {
      title: $t('productionBom.perQuantity'),
      field: 'perQuantity',
      minWidth: 100,
      slots: { default: 'perQuantityEdit' },
    },
    {
      title: $t('productionBom.baseQty'),
      field: 'baseQty',
      minWidth: 100,
      slots: { default: 'baseQtyEdit' },
    },
    {
      title: $t('productionBom.batchQty'),
      field: 'batchQty',
      minWidth: 100,
      slots: { default: 'batchQtyEdit' },
    },
    {
      title: $t('productionBom.measureError'),
      field: 'measureError',
      minWidth: 100,
      slots: { default: 'measureErrorEdit' },
    },
    {
      title: $t('productionBom.auxiliaryUnit'),
      field: 'auxiliaryUnit',
      minWidth: 100,
    },
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
        const params: any = {
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        };
        if (selectedWorkSheetId.value) {
          params.workSheetId = selectedWorkSheetId.value;
        }
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

// ========== 工单查询表格 ==========
// 当前选中的工单 id，用于联动下方 BOM 表格按工单过滤
const selectedWorkSheetId = ref<number>();

const workSheetQuery = ref<any>({
  lineName: '',
  productName: '',
  workSheetCode: '',
  searchTime: [],
});

const workSheetGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50 },
    {
      title: $t('productionBom.workSheetCode'),
      field: 'workSheetCode',
      minWidth: 140,
    },
    {
      title: $t('productionBom.productCode'),
      field: 'productCode',
      minWidth: 120,
    },
    {
      title: $t('productionBom.productName'),
      field: 'productName',
      minWidth: 150,
    },
    {
      title: $t('productionBom.planDateStart'),
      field: 'planDateStart',
      minWidth: 120,
    },
    {
      title: $t('productionBom.workSheetPlanNumber'),
      field: 'workSheetPlanNumber',
      minWidth: 110,
    },
    {
      title: $t('productionBom.lineName'),
      field: 'lineName',
      minWidth: 120,
    },
    {
      title: $t('productionBom.worksheetCodea'),
      field: 'worksheetCodea',
      minWidth: 140,
    },
    {
      title: $t('productionBom.priority'),
      field: 'priority',
      minWidth: 90,
    },
    {
      title: $t('productionBom.indicateBatch'),
      field: 'indicateBatch',
      minWidth: 110,
    },
  ],
  height: 300,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: ({ page }) => {
        const params: any = {
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        };
        const query = workSheetQuery.value;
        if (query.lineName) params.lineName = query.lineName;
        if (query.productName) params.productName = query.productName;
        if (query.workSheetCode) params.workSheetCode = query.workSheetCode;
        const [startTime, endTime] = query.searchTime ?? [];
        if (startTime) params.startTime = startTime.format('YYYY-MM-DD');
        if (endTime) params.endTime = endTime.format('YYYY-MM-DD');
        return getWorkSheetByBom(params).then((res: any) => ({
          items: res.list || [],
          total: res.total || 0,
        }));
      },
    },
  },
  radioConfig: {
    highlight: true,
    trigger: 'row',
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

const workSheetGridEvents: VxeGridListeners<any> = {
  // 选中工单后联动刷新下方 BOM 表格
  radioChange: ({ row }: any) => {
    selectedWorkSheetId.value = row?.id;
    gridApi.reload();
  },
};

const [WorkSheetGrid, workSheetGridApi] = useVbenVxeGrid({
  gridEvents: workSheetGridEvents,
  gridOptions: workSheetGridOptions,
});

// 清空工单选择并刷新下方 BOM 表格
function clearWorkSheetSelection() {
  selectedWorkSheetId.value = undefined;
  workSheetGridApi.grid?.clearRadioRow?.();
  gridApi.reload();
}

// 工单查询
function handleWorkSheetSearch() {
  workSheetGridApi.reload();
}

// 工单查询条件重置
function handleWorkSheetReset() {
  workSheetQuery.value = {
    lineName: '',
    productName: '',
    workSheetCode: '',
    searchTime: [],
  };
  clearWorkSheetSelection();
  workSheetGridApi.reload();
}

const drawerRef = ref<InstanceType<typeof ProductionBomDrawer>>();

// 选中的行
const selectedRows = ref<any[]>([]);
const selectedIds = computed(() =>
  selectedRows.value.map((row: any) => row.id),
);

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

// 选中物料后回填到当前编辑行
function handleSelectMaterial(row: any, material: any) {
  if (!row) {
    return;
  }
  row.materialCode = material.materialCode;
  row.materialName = material.materialName;
  row.auxiliaryUnit = material.auxiliaryUnit;
  row.unit = material.unit;
  handleFieldChange(row);
}

// 判断字段是否有值
function hasValue(value: any) {
  return value !== '' && value !== null && value !== undefined;
}

// 批量保存：提交所有被修改的行（[] 包裹）
// baseQty 有值时，batchQty、measureError 必填
function handleSave() {
  if (modifiedRows.value.length === 0) {
    message.warning($t('productionBom.noModifiedData'));
    return;
  }
  for (const row of modifiedRows.value) {
    if (hasValue(row.baseQty)) {
      if (!hasValue(row.batchQty)) {
        message.warning($t('productionBom.baseQtyRequiredBatchQty'));
        return;
      }
      if (!hasValue(row.measureError)) {
        message.warning($t('productionBom.baseQtyRequiredMeasureError'));
        return;
      }
    }
  }
  insertProductBom(modifiedRows.value)
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
  if (!selectedWorkSheetId.value) {
    message.warning($t('productionBom.selectWorkSheet'));
    return;
  }
  drawerRef.value?.open('create', undefined, selectedWorkSheetId.value);
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
    <Card class="mb-4!">
      <Form layout="inline">
        <FormItem :label="$t('productionBom.lineName')">
          <Input
            v-model:value="workSheetQuery.lineName"
            allow-clear
            class="w-40"
          />
        </FormItem>
        <FormItem :label="$t('productionBom.productName')">
          <Input
            v-model:value="workSheetQuery.productName"
            allow-clear
            class="w-40"
          />
        </FormItem>
        <FormItem :label="$t('productionBom.workSheetCode')">
          <Input
            v-model:value="workSheetQuery.workSheetCode"
            allow-clear
            class="w-40"
          />
        </FormItem>
        <FormItem :label="$t('productionBom.dateRange')">
          <RangePicker
            v-model:value="workSheetQuery.searchTime"
            format="YYYY-MM-DD"
            class="w-60"
          />
        </FormItem>
        <FormItem>
          <Space>
            <Button type="primary" @click="handleWorkSheetSearch">
              {{ $t('productionBom.search') }}
            </Button>
            <Button @click="handleWorkSheetReset">
              {{ $t('productionBom.reset') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>
    <!-- 工单查询表格 -->
    <Card class="!mb-8">
      <WorkSheetGrid>
        <template #toolbar-tools>
          <span class="font-medium">
            {{ $t('productionBom.workSheetTableTitle') }}
          </span>
        </template>
      </WorkSheetGrid>
    </Card>

    <!-- 生产 BOM 表格 -->
    <Card class="!mb-8">
      <Grid>
        <!-- 操作按钮都在 toolbar-tools 插槽，表格内部没有操作栏 -->
        <template #toolbar-tools>
          <Space>
            <Button v-if="permissions.add" type="primary" @click="handleAdd">
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
              <Icon
                icon="mdi:delete-outline"
                class="inline-block align-middle"
              />
              {{ $t('productionBom.delete') }}
            </Button>
          </Space>
        </template>

        <!-- 行内编辑插槽：清单标号 -->
        <template #codeEdit="{ row }">
          <Input v-model:value="row.code" @change="handleFieldChange(row)" />
        </template>

        <!-- 行内编辑插槽：母品项编号 -->
        <template #productCodeEdit="{ row }">
          <Input
            v-model:value="row.productCode"
            @change="handleFieldChange(row)"
          />
        </template>

        <!-- 行内编辑插槽：母品项名称 -->
        <template #productNameEdit="{ row }">
          <Input
            v-model:value="row.productName"
            @change="handleFieldChange(row)"
          />
        </template>

        <!-- 行内编辑插槽：子品项编号（禁用手输，通过按钮选择） -->
        <template #materialCodeEdit="{ row }">
          <Space style="width: 100%">
            <Input v-model:value="row.materialCode" disabled style="flex: 1" />
            <MaterialSelect
              @select="(material: any) => handleSelectMaterial(row, material)"
            />
          </Space>
        </template>

        <!-- 行内编辑插槽：子品项名称 -->
        <template #materialNameEdit="{ row }">
          <Input
            v-model:value="row.materialName"
            @change="handleFieldChange(row)"
          />
        </template>

        <!-- 行内编辑插槽：数量 -->
        <template #perQuantityEdit="{ row }">
          <Input
            v-model:value="row.perQuantity"
            @change="handleFieldChange(row)"
          />
        </template>

        <!-- 行内编辑插槽：基准数量 -->
        <template #baseQtyEdit="{ row }">
          <Input v-model:value="row.baseQty" @change="handleFieldChange(row)" />
        </template>

        <!-- 行内编辑插槽：单批次数量 -->
        <template #batchQtyEdit="{ row }">
          <Input
            v-model:value="row.batchQty"
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
