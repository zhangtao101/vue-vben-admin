<script setup lang="ts">
import { onMounted, reactive } from 'vue';

import {
  Button,
  DatePicker,
  Descriptions,
  DescriptionsItem,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  queryDefectRecord,
  saveDefectRecord,
  selectDefectByPallet,
  transferDefectRecords,
} from '#/api';
import { $t } from '#/locales';

/**
 * 工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
defineProps({
  functionId: { type: Number, default: 0 },
  bindingId: { type: Number, default: 0 },
  worksheetCode: { type: String, default: '' },
  equipCode: { type: String, default: '' },
  workstationCode: { type: String, default: '' },
});

const { RangePicker } = DatePicker;

// region 1. 查询条件
const transferStatusOptions = [
  { label: $t('defectRegistration.transferred'), value: 1 },
  { label: $t('defectRegistration.notTransferred'), value: 2 },
];

const queryForm = reactive<any>({
  defectDate: undefined,
  trayNo: '',
  transferred: undefined,
});
// endregion

// region 2. 不良列表（接口分页查询）
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    {
      field: 'produceDate',
      title: $t('defectRegistration.colDefectDate'),
      minWidth: 140,
    },
    {
      field: 'palletLabel',
      title: $t('defectRegistration.colTrayNo'),
      minWidth: 120,
    },
    {
      field: 'scrapQty',
      title: $t('defectRegistration.colScrapQty'),
      minWidth: 140,
    },
    {
      field: 'reworkQty',
      title: $t('defectRegistration.colReworkQty'),
      minWidth: 140,
    },
    {
      field: 'isTransfer',
      title: $t('defectRegistration.colTransferred'),
      minWidth: 120,
      formatter: ({ cellValue }) =>
        cellValue === 1
          ? $t('defectRegistration.transferred')
          : $t('defectRegistration.notTransferred'),
    },
  ],
  height: 360,
  rowConfig: { keyField: 'id', isHover: true },
  stripe: true,
  pagerConfig: { enabled: true, pageSize: 20 },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
  proxyConfig: {
    ajax: {
      query: queryDefectList,
    },
  },
};

/** 点击表格行（勾选列除外）切换选中状态，支持多选后传输 */
const gridEvents: any = {
  cellClick: ({ row, column }: any) => {
    if (column.type === 'checkbox') return;
    gridApi.grid.toggleCheckboxRow(row);
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/** 分页查询不良品记录 */
function queryDefectList({ page }: any) {
  const { defectDate, trayNo, transferred } = queryForm;
  const [startTime, endTime] = defectDate ?? [];
  const params: any = {
    endTime,
    isTransfer: transferred,
    pageNum: page.currentPage,
    pageSize: page.pageSize,
    palletLabel: trayNo || undefined,
    startTime,
  };
  return queryDefectRecord(params).then((res: any) => ({
    total: res?.total || 0,
    items: res?.list || [],
  }));
}

function handleQuery() {
  gridApi.reload();
}

function handleReset() {
  queryForm.defectDate = undefined;
  queryForm.trayNo = '';
  queryForm.transferred = undefined;
  gridApi.reload();
}
// endregion

// region 3. 登记表单（托盘号带出下列参数，废弃/返工数量为手动输入）
const halalTypeOptions = [
  { label: $t('defectRegistration.halalYes'), value: 'halal' },
  { label: $t('defectRegistration.halalNo'), value: 'nonHalal' },
];

const customerTypeOptions = [
  { label: $t('defectRegistration.customerAgent'), value: 'agent' },
  { label: $t('defectRegistration.customerDirect'), value: 'direct' },
];

/** 清真类型值转显示文本 */
function halalTypeLabel(val?: string) {
  return halalTypeOptions.find((o) => o.value === val)?.label ?? (val || '-');
}

/** 客户类型值转显示文本 */
function customerTypeLabel(val?: string) {
  return customerTypeOptions.find((o) => o.value === val)?.label ?? (val || '-');
}

const form = reactive<any>({});

/** 清空托盘带出参数（保留托盘号输入框本身） */
function resetTrayInfo() {
  Object.assign(form, {
    palletLabel: form.palletLabel,
  });
}

/** 输入托盘号后根据接口带出相关参数 */
function fetchTrayInfo(palletLabel: string) {
  if (!palletLabel) {
    resetTrayInfo();
    return;
  }
  selectDefectByPallet(palletLabel).then((result: any) => {
    if (!result?.id) {
      resetTrayInfo();
      return;
    }
    // 等价于 { ...form, ...result }：整体展开合并，同时保留 reactive 响应式
    Object.assign(form, result);
    message.success($t('defectRegistration.fetchInfoSuccess'));
  });
}

function handleTrayNoChange() {
  fetchTrayInfo(form.palletLabel);
}

/** 重置表单（清空所有字段） */
function resetForm() {
  resetTrayInfo();
  form.palletLabel = '';
  form.scrapQty = undefined;
  form.reworkQty = undefined;
}

/** 构建保存/传输提交数据 */
function buildSubmitData() {
  return {
    custName: form.custName,
    custType: form.custType,
    lotCode: form.lotCode,
    palletLabel: form.palletLabel,
    produceDate: form.produceDate,
    reworkQty: form.reworkQty,
    scrapQty: form.scrapQty,
    stackQty: form.stackQty,
    type: form.type,
    validDate: form.validDate,
    workSheetCode: form.workSheetCode,
  };
}

/** 保存不良品记录（登记未传输） */
function handleSave() {
  if (!form.palletLabel) {
    message.warning($t('defectRegistration.plsFillRequired'));
    return;
  }
  if (form.scrapQty == null || form.reworkQty == null) {
    message.warning($t('defectRegistration.plsFillQty'));
    return;
  }
  saveDefectRecord({ ...buildSubmitData(), isTransfer: 2 }).then(() => {
    message.success($t('defectRegistration.saveSuccess'));
    resetForm();
    gridApi.reload();
  });
}

/** 传输所选不良品记录（需先勾选不良列表中的记录） */
function handleTransfer() {
  const records: any[] = gridApi.grid.getCheckboxRecords();
  if (records.length === 0) {
    message.warning($t('defectRegistration.plsSelectRecord'));
    return;
  }
  transferDefectRecords({
    ids: records.map((record: any) => String(record.id)),
    state: 1,
  }).then(() => {
    message.success($t('defectRegistration.transferSuccess'));
    gridApi.reload();
  });
}
// endregion

onMounted(() => {
  gridApi.reload();
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="text-lg font-bold">{{ $t('defectRegistration.title') }}</div>

    <!-- 1. 查询条件 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <Form
        layout="inline"
        :model="queryForm"
        class="flex flex-wrap items-end gap-2"
      >
        <Form.Item :label="$t('defectRegistration.defectRegDate')">
          <RangePicker
            v-model:value="queryForm.defectDate"
            value-format="YYYY-MM-DD"
            class="w-64!"
            :placeholder="[
              $t('defectRegistration.defectRegDatePlaceholder'),
              $t('defectRegistration.defectRegDatePlaceholder'),
            ]"
          />
        </Form.Item>
        <Form.Item :label="$t('defectRegistration.trayNo')">
          <Input
            v-model:value="queryForm.trayNo"
            :placeholder="$t('defectRegistration.trayNoPlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('defectRegistration.transferStatus')">
          <Select
            v-model:value="queryForm.transferred"
            :options="transferStatusOptions"
            :placeholder="$t('defectRegistration.transferStatusPlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" @click="handleQuery">
              {{ $t('common.query') }}
            </Button>
            <Button @click="handleReset">{{ $t('common.reset') }}</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>

    <!-- 2. 不良列表 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-2 font-bold">{{ $t('defectRegistration.defectList') }}</div>
      <Grid>
        <template #toolbar-tools></template>
      </Grid>
    </div>

    <!-- 3. 登记表单（每行 4 格：托盘号独占一行，物料代码/清真类型各占 1 格，其余各占 2 格） -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-3 font-bold">{{ $t('defectRegistration.entryForm') }}</div>
      <Descriptions bordered :column="4" size="small">
        <DescriptionsItem :label="$t('defectRegistration.trayNo')" :span="4">
          <Input
            v-model:value="form.palletLabel"
            :placeholder="$t('defectRegistration.trayNoPlaceholder')"
            allow-clear
            @press-enter="handleTrayNoChange"
          />
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('defectRegistration.materialProductCode')"
          :span="2"
        >
          {{ form.productCode ? `${form.productCode}__${form.productName}` : '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('defectRegistration.halalType')" :span="1">
          {{ halalTypeLabel(form.type) }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('defectRegistration.stackQty')" :span="1">
          {{ form.stackQty ?? '-' }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('defectRegistration.prodInstrSerial')"
          :span="2"
        >
          {{ form.lotCode || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('defectRegistration.mesWorkOrder')" :span="2">
          {{ form.workSheetCode || '-' }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('defectRegistration.productionDate')"
          :span="2"
        >
          {{ form.produceDate || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('defectRegistration.validity')" :span="2">
          {{ form.validDate || '-' }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('defectRegistration.customerType')"
          :span="2"
        >
          {{ customerTypeLabel(form.custType) }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('defectRegistration.customerName')" :span="2">
          {{ form.custName || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('defectRegistration.scrapQty')" :span="2">
          <InputNumber
            v-model:value="form.scrapQty"
            class="w-full!"
            :min="0"
            :placeholder="$t('defectRegistration.scrapQty')"
          />
        </DescriptionsItem>
        <DescriptionsItem :label="$t('defectRegistration.reworkQty')" :span="2">
          <InputNumber
            v-model:value="form.reworkQty"
            class="w-full!"
            :min="0"
            :placeholder="$t('defectRegistration.reworkQty')"
          />
        </DescriptionsItem>
      </Descriptions>
      <div class="flex justify-end gap-2 mt-4!">
        <Button @click="handleTransfer">
          {{ $t('defectRegistration.transfer') }}
        </Button>
        <Button type="primary" @click="handleSave">
          {{ $t('defectRegistration.save') }}
        </Button>
      </div>
    </div>
  </div>
</template>
