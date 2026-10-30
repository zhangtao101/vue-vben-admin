<script lang="ts" setup>
/**
 * 生产物料需求清单页面
 * 用于管理生产物料需求清单的查询、行内编辑、新增、保存、传送、删除。
 * 功能包括：分页查询清单列表、行内编辑需求数量与请求日期、选中行复制新增、批量保存、批量传送。
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
  DatePicker,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  RangePicker,
  Select,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  exportMaterialRequirementExcel,
  queryMaterialRequirementList,
  saveMaterialRequirement,
  transferMaterialRequirement,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

const route = useRoute();

// 权限控制
const author = ref<string[]>([]);
const permissions = computed(() => ({
  add: author.value.includes('新增'),
  delete: author.value.includes('删除'),
  save: author.value.includes('保存'),
  transfer: author.value.includes('传送'),
}));

// ========== 查询条件 ==========
const queryParams = ref<any>({
  materialCode: '',
  searchTime: [],
  warehouseCode: '',
  worksheetCode: '',
  wmsStatus: undefined,
});

const wmsStatusOptions = [
  {
    label: $t('productionMaterialRequirementList.unTransferred'),
    value: -1,
  },
  { label: $t('productionMaterialRequirementList.transferred'), value: 1 },
];

/** 组装查询参数（传入分页参数时用于列表查询，不传时用于导出） */
function buildQueryParams(page?: any) {
  const params: any = {};
  if (page) {
    params.pageNum = page.currentPage;
    params.pageSize = page.pageSize;
  }
  const [startDate, endDate] = queryParams.value.searchTime ?? [];
  if (startDate) params.startDate = startDate.format('YYYY-MM-DD');
  if (endDate) params.endDate = endDate.format('YYYY-MM-DD');
  if (queryParams.value.warehouseCode) {
    params.warehouseCode = queryParams.value.warehouseCode;
  }
  if (queryParams.value.wmsStatus !== undefined) {
    params.wmsStatus = queryParams.value.wmsStatus;
  }
  if (queryParams.value.worksheetCode) {
    params.worksheetCode = queryParams.value.worksheetCode;
  }
  if (queryParams.value.materialCode) {
    params.materialCode = queryParams.value.materialCode;
  }
  return params;
}

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: { highlight: true },
  columns: [
    { type: 'checkbox', width: 50, fixed: 'left' },
    {
      type: 'seq',
      title: $t('productionMaterialRequirementList.sequence'),
      width: 50,
    },
    {
      title: $t('productionMaterialRequirementList.applyCode'),
      field: 'applyCode',
      minWidth: 180,
    },
    {
      title: $t('productionMaterialRequirementList.status'),
      field: 'statusDesc',
      minWidth: 100,
    },
    {
      title: $t('productionMaterialRequirementList.wmsStatusDesc'),
      field: 'wmsStatusDesc',
      minWidth: 120,
    },
    {
      title: $t('productionMaterialRequirementList.warehouseName'),
      field: 'warehouseName',
      minWidth: 120,
    },
    {
      title: $t('productionMaterialRequirementList.worksheetCode'),
      field: 'worksheetCode',
      minWidth: 160,
    },
    {
      title: $t('productionMaterialRequirementList.materialCode'),
      field: 'materialCode',
      minWidth: 110,
    },
    {
      title: $t('productionMaterialRequirementList.materialName'),
      field: 'materialName',
      minWidth: 180,
    },
    {
      title: $t('productionMaterialRequirementList.unit'),
      field: 'unit',
      minWidth: 80,
    },
    {
      title: $t('productionMaterialRequirementList.stockQuality'),
      field: 'stockQuality',
      minWidth: 100,
    },
    {
      title: $t('productionMaterialRequirementList.receiveNumber'),
      field: 'receiveNumber',
      minWidth: 110,
    },
    {
      title: $t('productionMaterialRequirementList.poOderCode'),
      field: 'poOderCode',
      minWidth: 140,
    },
    {
      title: $t('productionMaterialRequirementList.itemQty'),
      field: 'itemQty',
      minWidth: 130,
    },
    {
      title: $t('productionMaterialRequirementList.applyDate'),
      field: 'applyDate',
      minWidth: 180,
      slots: { default: 'applyDateEdit' },
      fixed: 'right',
    },
    {
      title: $t('productionMaterialRequirementList.applyNumber'),
      field: 'applyNumber',
      minWidth: 180,
      slots: { default: 'applyNumberEdit' },
      fixed: 'right',
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: ({ page }) => {
        return queryMaterialRequirementList(buildQueryParams(page)).then(
          (res: any) => {
            // 重新加载后清空上一轮选中记录
            selectedRows.value = [];
            return {
              items: res?.results || [],
              total: res?.total || 0,
            };
          },
        );
      },
    },
  },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {
  checkboxAll: () => {
    updateSelection();
  },
  checkboxChange: () => {
    updateSelection();
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// ========== 选中行 ==========
const selectedRows = ref<any[]>([]);

function updateSelection() {
  selectedRows.value = gridApi.grid?.getCheckboxRecords() || [];
}

// ========== 行内编辑 ==========
// 状态为 1（生成）的行才允许变更
function isEditable(row: any) {
  return Number(row?.status) === 1;
}

// 日期文本只取年月日
function formatDate(value: any) {
  return value ? String(value).slice(0, 10) : '';
}

// 出库请求号码末位序号加 1（如 14C012610290001-01 -> 14C012610290001-02）
function nextApplyCode(applyCode: string) {
  const code = String(applyCode ?? '');
  const index = code.lastIndexOf('-');
  if (index === -1) {
    return code;
  }
  const prefix = code.slice(0, index + 1);
  const suffix = code.slice(index + 1);
  if (!/^\d+$/.test(suffix)) {
    return code;
  }
  // 位数不足时左侧补 0，保持与原始位数一致
  const next = String(Number(suffix) + 1).padStart(suffix.length, '0');
  return `${prefix}${next}`;
}

// 新增：在选中行下方插入一行相同数据，id 置空，出库请求号码顺位 +1
function handleAdd() {
  if (selectedRows.value.length === 0) {
    message.warning($t('productionMaterialRequirementList.selectOneRow'));
    return;
  }
  if (selectedRows.value.length > 1) {
    message.warning($t('productionMaterialRequirementList.selectOnlyOneRow'));
    return;
  }
  const row = selectedRows.value[0];
  const newRow = {
    ...row,
    applyCode: nextApplyCode(row?.applyCode),
    status: 1,
    id: null,
    _X_ROW_KEY: undefined,
  };
  // 插入到选中行的下一行位置，选中行为最后一行时插到末尾
  const fullData: any[] = gridApi.grid?.getTableData()?.fullData || [];
  const rowIndex = fullData.findIndex((item: any) => item === row);
  const nextRow = rowIndex === -1 ? undefined : fullData[rowIndex + 1];
  gridApi.grid?.insertAt(newRow, nextRow ?? -1);
}

// 保存：仅保存勾选数据，且勾选数据状态必须全部为 1（生成）
function handleSave() {
  if (selectedRows.value.length === 0) {
    message.warning($t('productionMaterialRequirementList.selectData'));
    return;
  }
  if (selectedRows.value.some((row: any) => !isEditable(row))) {
    message.warning($t('productionMaterialRequirementList.saveOnlyEditable'));
    return;
  }
  const records = selectedRows.value.map((row: any) => ({
    ...row,
    id: row?.id ?? null,
  }));
  saveMaterialRequirement(records).then(() => {
    message.success($t('productionMaterialRequirementList.saveSuccess'));
    selectedRows.value = [];
    gridApi.reload();
  });
}

// 传送：按选中行 id 批量传送
function handleTransfer() {
  if (selectedRows.value.length === 0) {
    message.warning($t('productionMaterialRequirementList.selectData'));
    return;
  }
  const ids = selectedRows.value
    .map((row: any) => row?.id)
    .filter((id: any) => id !== null && id !== undefined);
  if (ids.length === 0) {
    message.warning($t('productionMaterialRequirementList.selectData'));
    return;
  }
  transferMaterialRequirement(ids).then(() => {
    message.success($t('productionMaterialRequirementList.transferSuccess'));
    selectedRows.value = [];
    gridApi.reload();
  });
}

// 删除：接口暂未提供，预留提示
function handleDelete() {
  if (selectedRows.value.length === 0) {
    message.warning($t('productionMaterialRequirementList.selectData'));
    return;
  }
  message.warning($t('productionMaterialRequirementList.deleteNotOpen'));
}

// 导出：按当前查询条件导出文件
function handleExport() {
  exportMaterialRequirementExcel(buildQueryParams()).then((url: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  });
}

function handleSearch() {
  gridApi.reload();
}

function handleReset() {
  queryParams.value = {
    materialCode: '',
    searchTime: [],
    warehouseCode: '',
    worksheetCode: '',
    wmsStatus: undefined,
  };
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
        <FormItem
          :label="$t('productionMaterialRequirementList.dateRange')"
          style="margin-bottom: 1em"
        >
          <RangePicker
            v-model:value="queryParams.searchTime"
            format="YYYY-MM-DD"
            class="w-60"
          />
        </FormItem>
        <FormItem
          :label="$t('productionMaterialRequirementList.warehouseCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.warehouseCode"
            :placeholder="
              $t('productionMaterialRequirementList.warehouseCodePlaceholder')
            "
            allow-clear
            class="w-40"
          />
        </FormItem>
        <FormItem
          :label="$t('productionMaterialRequirementList.wmsStatus')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.wmsStatus"
            :options="wmsStatusOptions"
            allow-clear
            class="w-40"
          />
        </FormItem>
        <FormItem
          :label="$t('productionMaterialRequirementList.worksheetCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.worksheetCode"
            :placeholder="
              $t('productionMaterialRequirementList.worksheetCodePlaceholder')
            "
            allow-clear
            class="w-40"
          />
        </FormItem>
        <FormItem
          :label="$t('productionMaterialRequirementList.materialCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.materialCode"
            :placeholder="
              $t('productionMaterialRequirementList.materialCodePlaceholder')
            "
            allow-clear
            class="w-40"
          />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Space>
            <Button type="primary" @click="handleSearch">
              {{ $t('productionMaterialRequirementList.search') }}
            </Button>
            <Button @click="handleReset">
              {{ $t('productionMaterialRequirementList.reset') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>

    <Card>
      <Grid>
        <template #toolbar-tools>
          <Space>
            <Button v-if="permissions.add" type="primary" @click="handleAdd">
              <Icon icon="mdi:plus" class="inline-block align-middle" />
              {{ $t('productionMaterialRequirementList.add') }}
            </Button>

            <Button
              v-if="permissions.save"
              type="primary"
              :disabled="selectedRows.length === 0"
              @click="handleSave"
            >
              <Icon icon="mdi:content-save" class="inline-block align-middle" />
              {{ $t('productionMaterialRequirementList.save') }}
            </Button>

            <Button
              v-if="permissions.transfer"
              type="primary"
              :disabled="selectedRows.length === 0"
              @click="handleTransfer"
            >
              <Icon icon="mdi:send-outline" class="inline-block align-middle" />
              {{ $t('productionMaterialRequirementList.transfer') }}
            </Button>

            <Button
              v-if="permissions.delete"
              danger
              :disabled="selectedRows.length === 0"
              @click="handleDelete"
            >
              <Icon
                icon="mdi:delete-outline"
                class="inline-block align-middle"
              />
              {{ $t('productionMaterialRequirementList.delete') }}
            </Button>

            <Button @click="handleExport">
              <Icon icon="mdi:export" class="inline-block align-middle" />
              {{ $t('productionMaterialRequirementList.export') }}
            </Button>
          </Space>
        </template>

        <!-- 行内编辑插槽：请求日期（状态为 1 生成才可编辑，其余显示为文本） -->
        <template #applyDateEdit="{ row }">
          <DatePicker
            v-if="isEditable(row)"
            v-model:value="row.applyDate"
            value-format="YYYY-MM-DD"
            class="w-40"
          />
          <span v-else>{{ formatDate(row.applyDate) }}</span>
        </template>

        <!-- 行内编辑插槽：需求数量（状态为 1 生成才可编辑，其余显示为文本） -->
        <template #applyNumberEdit="{ row }">
          <InputNumber
            v-if="isEditable(row)"
            v-model:value="row.applyNumber"
            :min="0"
            class="w-32"
          />
          <span v-else>{{ row.applyNumber }}</span>
        </template>
      </Grid>
    </Card>
  </Page>
</template>
