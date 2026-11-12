<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  DatePicker,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Select,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getAllocatedList,
  getEndWorkSheets,
  getMesInputQuantityList,
  pushIwipConDat,
  sendMesInputQuantity,
  updateAllocQty,
  updateIfwms113Qty,
} from '#/api';
import { $t } from '#/locales';

// ========== 上方查询区域（获取已完成工单下拉选项） ==========
const queryParams = ref<any>({
  // 工序默认混合水
  processType: 1,
  // 指示日期默认当前日期
  planDateStart: dayjs().format('YYYY-MM-DD'),
  productCode: '',
});

/** 工序：1 混合水，2 混合mix，6 无重力搅拌 */
const processTypeOptions = [
  { label: $t('mesInputQuantitySummary.processTypeMixedWater'), value: 1 },
  { label: $t('mesInputQuantitySummary.processTypeMixedMix'), value: 2 },
  {
    label: $t('mesInputQuantitySummary.processTypeGravityFree'),
    value: 6,
  },
];

/** 已完成工单下拉选项（中间表格 toolbar-actions 中使用） */
const workSheetOptions = ref<{ label: string; value: number }[]>([]);

/**
 * 查询已完成工单列表，用于中间表格的工单下拉选项。
 */
function handleSearch() {
  getEndWorkSheets({
    processType: queryParams.value.processType,
    planDateStart: queryParams.value.planDateStart || undefined,
    productCode: queryParams.value.productCode || undefined,
  }).then((res: any) => {
    workSheetOptions.value = (res ?? []).map((item: any) => ({
      label: item.workSheetCode,
      value: item.id,
    }));
    // 查询后清空当前选择（选项可能已变化）
    handleWorkSheetChange();
  });
}

function handleReset() {
  queryParams.value = {
    processType: 1,
    planDateStart: dayjs().format('YYYY-MM-DD'),
    productCode: '',
  };
  handleSearch();
}

// ========== 中间表格：物料投入数据（allocQty 可编辑，单选） ==========
/** 当前选中的工单 id（工单下拉联动中间表格数据） */
const selectedWorkSheetId = ref<number | undefined>(undefined);

/** allocQty 修改过的行（保存时只提交这些行） */
const modifiedAllocRows = new Map<number, any>();

const summaryGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  radioConfig: { highlight: true },
  columns: [
    { type: 'radio', width: 50, title: '', fixed: 'left' },
    {
      title: $t('mesInputQuantitySummary.orddat'),
      field: 'orddat',
      minWidth: 110,
    },
    {
      title: $t('mesInputQuantitySummary.wareky'),
      field: 'wareky',
      minWidth: 100,
    },
    {
      title: $t('mesInputQuantitySummary.skukey'),
      field: 'skukey',
      minWidth: 110,
    },
    {
      title: $t('mesInputQuantitySummary.qtyord'),
      field: 'qtyord',
      minWidth: 110,
    },
    {
      title: $t('mesInputQuantitySummary.uomkey'),
      field: 'uomkey',
      minWidth: 80,
    },
    {
      title: $t('mesInputQuantitySummary.swerks'),
      field: 'swerks',
      minWidth: 110,
    },
    {
      title: $t('mesInputQuantitySummary.slgort'),
      field: 'slgort',
      minWidth: 110,
    },
    {
      title: $t('mesInputQuantitySummary.gift'),
      field: 'gift',
      minWidth: 130,
    },
    {
      title: $t('mesInputQuantitySummary.orderCs'),
      field: 'orderCs',
      minWidth: 110,
    },
    {
      title: $t('mesInputQuantitySummary.trnuid'),
      field: 'trnuid',
      minWidth: 140,
    },
    {
      title: $t('mesInputQuantitySummary.matnr'),
      field: 'matnr',
      minWidth: 130,
    },
    {
      title: $t('mesInputQuantitySummary.allocQty'),
      field: 'allocQty',
      minWidth: 120,
      slots: { default: 'allocQtyEdit' },
      fixed: 'right',
    },
  ],
  height: 360,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        return await querySummary({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  rowConfig: { keyField: 'ifseq' },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const summaryGridEvents: VxeGridListeners<any> = {
  radioChange: () => {
    // 中间表格单选变动后，按物料编码刷新下方已分配数据表格
    refreshAllocated();
  },
};

const [SummaryGrid, summaryGridApi] = useVbenVxeGrid({
  gridEvents: summaryGridEvents,
  gridOptions: summaryGridOptions,
});

/**
 * 查询当前选中工单的物料投入数据（分页），allocQty 可编辑。
 */
function querySummary({ pageNum, pageSize }: any) {
  if (selectedWorkSheetId.value == null) {
    return Promise.resolve({ items: [], total: 0 });
  }
  return new Promise((resolve) => {
    getMesInputQuantityList({
      workSheetId: selectedWorkSheetId.value,
      pageNum,
      pageSize,
    })
      .then(({ total, list }: any) => {
        resolve({
          total: total || 0,
          items: list || [],
        });
      })
      .catch(() => {
        resolve({ total: 0, items: [] });
      });
  });
}

/**
 * 工单下拉变动：清空中间表格选中与修改记录，同时刷新两个表格：
 * 中间按新工单查询，下方按实时单选行（已清空）查询为空数据。
 * @param {any} workSheetId - 选中的工单 id。
 * @returns {void} 无返回值。
 * @since 2026-11-11 00:00:00
 */
function handleWorkSheetChange(workSheetId?: number) {
  selectedWorkSheetId.value = workSheetId ?? undefined;
  modifiedAllocRows.clear();
  summaryGridApi.grid?.clearRadioRow();
  summaryGridApi.reload();
  allocatedGridApi.reload();
}

/**
 * allocQty 修改记录：标记该行已修改，保存时只提交修改过的行。
 * @param {any} row - 修改的行数据。
 * @returns {void} 无返回值。
 * @since 2026-11-11 00:00:00
 */
function handleAllocQtyChange(row: any) {
  if (row?.ifseq != null) {
    modifiedAllocRows.set(row.ifseq, row);
  }
}

/**
 * 保存 allocQty 修改：只提交修改过的行，成功后刷新中间表格。
 * @returns {void} 无返回值。
 * @throws 接口失败时由统一错误处理层提示，此处不额外捕获。
 * @since 2026-11-11 00:00:00
 */
function handleSaveAllocQty() {
  const items = [...modifiedAllocRows.values()].map((row: any) => ({
    ifseq: row.ifseq,
    allocQty: row.allocQty,
  }));
  if (items.length === 0) {
    message.warning($t('mesInputQuantitySummary.noChange'));
    return;
  }
  updateAllocQty(items).then(() => {
    message.success($t('mesInputQuantitySummary.saveSuccess'));
    modifiedAllocRows.clear();
    summaryGridApi.reload();
    allocatedGridApi.reload();
  });
}

/**
 * SAP可用性检查：按当前选中工单调用。
 * @returns {void} 无返回值。
 * @throws 接口失败时由统一错误处理层提示，此处不额外捕获。
 * @since 2026-11-11 00:00:00
 */
function handleSapCheck() {
  if (selectedWorkSheetId.value == null) {
    message.warning($t('mesInputQuantitySummary.selectWorkSheetFirst'));
    return;
  }
  pushIwipConDat(selectedWorkSheetId.value).then(() => {
    message.success($t('mesInputQuantitySummary.checkSuccess'));
    summaryGridApi.reload();
  });
}

// ========== 下方表格：已分配数据（qtyord 可编辑，多选发送） ==========
/** qtyord 修改过的行（保存时只提交这些行） */
const modifiedQtyRows = new Map<number, any>();

const allocatedGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: { trigger: 'row', highlight: true },
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    {
      title: $t('mesInputQuantitySummary.orddat'),
      field: 'orddat',
      minWidth: 110,
    },
    {
      title: $t('mesInputQuantitySummary.wareky'),
      field: 'wareky',
      minWidth: 100,
    },
    {
      title: $t('mesInputQuantitySummary.skukey'),
      field: 'skukey',
      minWidth: 110,
    },
    {
      title: $t('mesInputQuantitySummary.uomkey'),
      field: 'uomkey',
      minWidth: 80,
    },
    {
      title: $t('mesInputQuantitySummary.swerks'),
      field: 'swerks',
      minWidth: 110,
    },
    {
      title: $t('mesInputQuantitySummary.slgort'),
      field: 'slgort',
      minWidth: 110,
    },
    {
      title: $t('mesInputQuantitySummary.gift'),
      field: 'gift',
      minWidth: 130,
    },
    {
      title: $t('mesInputQuantitySummary.orderCs'),
      field: 'orderCs',
      minWidth: 110,
    },
    {
      title: $t('mesInputQuantitySummary.trnuid'),
      field: 'trnuid',
      minWidth: 140,
    },
    {
      title: $t('mesInputQuantitySummary.matnr'),
      field: 'matnr',
      minWidth: 130,
    },
    {
      title: $t('mesInputQuantitySummary.sflag'),
      field: 'sflag',
      minWidth: 110,
    },
    {
      title: $t('mesInputQuantitySummary.ifProcessFlag'),
      field: 'ifProcessFlag',
      minWidth: 110,
    },
    {
      title: $t('mesInputQuantitySummary.qtyord'),
      field: 'qtyord',
      minWidth: 120,
      slots: { default: 'qtyordEdit' },
      fixed: 'right',
    },
  ],
  height: 300,
  // 物料可用性为 E（错误）的行标红
  rowClassName: ({ row }: any) =>
    String(row?.sflag) === 'E' ? 'sflag-error-row' : '',
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryAllocated();
      },
    },
  },
  rowConfig: { keyField: 'ifseq' },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [AllocatedGrid, allocatedGridApi] = useVbenVxeGrid({
  gridOptions: allocatedGridOptions,
});

/**
 * 查询当前选中行（物料编码 trnuid）对应的已分配数据。
 * 实时从中间表格获取单选行，避免表格数据刷新后缓存值未同步。
 */
function queryAllocated() {
  console.log(555)
  const row: any = summaryGridApi.grid?.getRadioRecord() ?? null;
  if (selectedWorkSheetId.value == null) {
    return Promise.resolve({ items: [], total: 0 });
  }
  return new Promise((resolve) => {
    getAllocatedList({
      trnuid: row?.trnuid,
      workSheetId: selectedWorkSheetId.value,
    })
      .then((res: any) => {
        const list = res ?? [];
        resolve({ items: list, total: list.length });
      })
      .catch(() => {
        resolve({ items: [], total: 0 });
      });
  });
}

/** 刷新下方已分配表格并清除修改记录 */
function refreshAllocated() {
  modifiedQtyRows.clear();
  allocatedGridApi.reload();
}

/**
 * qtyord 修改记录：标记该行已修改，保存时只提交修改过的行。
 * @param {any} row - 修改的行数据。
 * @returns {void} 无返回值。
 * @since 2026-11-11 00:00:00
 */
function handleQtyChange(row: any) {
  if (row?.ifseq != null) {
    modifiedQtyRows.set(row.ifseq, row);
  }
}

/**
 * 保存 qtyord 修改：只提交修改过的行，成功后刷新下方表格。
 * @returns {void} 无返回值。
 * @throws 接口失败时由统一错误处理层提示，此处不额外捕获。
 * @since 2026-11-11 00:00:00
 */
function handleSaveQty() {
  const items = [...modifiedQtyRows.values()].map((row: any) => ({
    ifseq: row.ifseq,
    qtyord: row.qtyord,
  }));
  if (items.length === 0) {
    message.warning($t('mesInputQuantitySummary.noChange'));
    return;
  }
  updateIfwms113Qty(items).then(() => {
    message.success($t('mesInputQuantitySummary.saveSuccess'));
    modifiedQtyRows.clear();
    allocatedGridApi.reload();
    summaryGridApi.reload();
  });
}

/**
 * MES投入量发送：获取下方表格勾选行，校验全部 sflag 为 S 后批量发送。
 * @returns {void} 无返回值。
 * @throws 接口失败时由统一错误处理层提示，此处不额外捕获。
 * @since 2026-11-11 00:00:00
 */
function handleSend() {
  const rows: any[] = allocatedGridApi.grid?.getCheckboxRecords() ?? [];
  if (rows.length === 0) {
    message.warning($t('mesInputQuantitySummary.selectRowsFirst'));
    return;
  }
  // 仅物料可用性 sflag 为 S 的数据允许发送
  if (rows.some((row) => String(row.sflag) !== 'S')) {
    message.warning($t('mesInputQuantitySummary.onlySflagS'));
    return;
  }
  const ids = rows.map((row) => row.ifseq);
  sendMesInputQuantity(ids).then(() => {
    message.success($t('mesInputQuantitySummary.sendSuccess'));
    allocatedGridApi.grid?.clearCheckboxRow();
    allocatedGridApi.reload();
  });
}
</script>

<template>
  <Page>
    <!-- 1. 查询区域（获取已完成工单下拉选项） -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <FormItem
          :label="$t('mesInputQuantitySummary.processType')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.processType"
            :options="processTypeOptions"
            :placeholder="$t('mesInputQuantitySummary.processTypePlaceholder')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('mesInputQuantitySummary.planDateStart')"
          style="margin-bottom: 1em"
        >
          <DatePicker
            v-model:value="queryParams.planDateStart"
            :placeholder="
              $t('mesInputQuantitySummary.planDateStartPlaceholder')
            "
            style="width: 150px"
            value-format="YYYY-MM-DD"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('mesInputQuantitySummary.productCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.productCode"
            :placeholder="$t('mesInputQuantitySummary.productCodePlaceholder')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button @click="handleReset">
            {{ $t('mesInputQuantitySummary.reset') }}
          </Button>
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="handleSearch">
            {{ $t('mesInputQuantitySummary.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 2. 物料投入数据（工单下拉联动，allocQty 可编辑保存，单选联动下方表格） -->
    <Card :body-style="{ padding: '4px' }">
      <SummaryGrid>
        <template #toolbar-actions>
          <span class="mr-2">{{ $t('mesInputQuantitySummary.workSheet') }}</span>
          <Select
            v-model:value="selectedWorkSheetId"
            :options="workSheetOptions"
            :placeholder="$t('mesInputQuantitySummary.workSheetPlaceholder')"
            style="width: 220px"
            allow-clear
            @change="(val: any) => handleWorkSheetChange(val)"
          />
        </template>
        <template #toolbar-tools>
          <Button type="primary" @click="handleSaveAllocQty">
            {{ $t('mesInputQuantitySummary.save') }}
          </Button>
          <Button type="primary" @click="handleSapCheck" class="ml-4!">
            {{ $t('mesInputQuantitySummary.sapCheck') }}
          </Button>
        </template>
        <!-- allocQty（预估差值）可编辑 -->
        <template #allocQtyEdit="{ row }">
          <InputNumber
            v-model:value="row.allocQty"
            size="small"
            class="w-full"
            @change="() => handleAllocQtyChange(row)"
          />
        </template>
      </SummaryGrid>
    </Card>

    <!-- 3. 已分配数据（随中间表格单选/工单变动刷新，qtyord 可编辑保存） -->
    <Card class="mt-4!" :body-style="{ padding: '4px' }">
      <AllocatedGrid>
        <template #toolbar-tools>
          <Button type="primary" @click="handleSaveQty">
            {{ $t('mesInputQuantitySummary.save') }}
          </Button>
          <Button type="primary" @click="handleSend" class="ml-4!">
            {{ $t('mesInputQuantitySummary.send') }}
          </Button>
        </template>
        <!-- qtyord（投料量）可编辑 -->
        <template #qtyordEdit="{ row }">
          <InputNumber
            v-model:value="row.qtyord"
            size="small"
            class="w-full"
            @change="() => handleQtyChange(row)"
          />
        </template>
      </AllocatedGrid>
    </Card>
  </Page>
</template>

<style scoped>
/* 物料可用性 sflag 为 E 的行显示红色背景 */
:deep(.sflag-error-row) {
  background-color: rgb(255 77 79 / 25%) !important;
}
</style>
