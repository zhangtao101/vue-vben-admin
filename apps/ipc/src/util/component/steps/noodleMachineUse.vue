<script setup lang="ts">
import { onMounted, ref } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  useVbenVxeGrid,
  type VxeGridListeners,
  type VxeGridProps,
} from '#/adapter/vxe-table';
import {
  addNoodleMachineUsage,
  deleteNoodleMachineUsage,
  listProductionLines,
  searchNoodleMachineUsage,
  updateNoodleMachineUsage,
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

// region 查询条件：生产日期(范围) / 面机类型 / 面机代码
const queryParams = ref<any>({
  productDateRange: [],
  type: undefined,
  machineCode: undefined,
});

// 下拉数据源
const machineTypeOptions = [
  { label: $t('noodleMachineUse.typeRolling'), value: 'rolling' },
  { label: $t('noodleMachineUse.typeCompound'), value: 'compound' },
  { label: $t('noodleMachineUse.typeCutting'), value: 'cutting' },
  { label: $t('noodleMachineUse.typeFrying'), value: 'frying' },
];

// 面机代码（暂为静态数据源，接口就绪后可替换）
const machineCodeOptions = [
  { label: 'M-001', value: 'M-001' },
  { label: 'M-002', value: 'M-002' },
  { label: 'M-003', value: 'M-003' },
];

// 产线下拉数据（接口加载）
const lineOptions = ref<any[]>([]);

// code -> name 映射，用于提交名称字段
const lineNameMap = new Map<string, string>();

/** 加载产线下拉数据（label 格式：编号(名称)） */
async function loadOptions() {
  try {
    const lineRes = await listProductionLines({ pageNum: 1, pageSize: 1000 });
    lineOptions.value = (lineRes?.list ?? []).map((item: any) => {
      lineNameMap.set(item.lineCode, item.lineName);
      return { label: `${item.lineCode}(${item.lineName})`, value: item.lineCode };
    });
  } catch {
    message.error($t('noodleMachineUse.optionsLoadFailed'));
  }
}
// endregion

// region 面机使用明细列表（接口分页查询）
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    ({ type: 'radio', width: 50, radioConfig: { trigger: 'row' } } as any),
    { field: 'equipCode', title: $t('noodleMachineUse.colEquipCode'), minWidth: 110 },
    {
      field: 'type',
      title: $t('noodleMachineUse.colType'),
      minWidth: 110,
      formatter: ({ cellValue }) =>
        machineTypeOptions.find((o) => o.value === cellValue)?.label || cellValue,
    },
    { field: 'lineCode', title: $t('noodleMachineUse.colLineCode'), minWidth: 110 },
    { field: 'lineName', title: $t('noodleMachineUse.colLineName'), minWidth: 130 },
    {
      field: 'productionDate',
      title: $t('noodleMachineUse.colProductionDate'),
      minWidth: 130,
      slots: { default: 'productionDateCell' },
    },
    { field: 'usageHours', title: $t('noodleMachineUse.colUsageHours'), minWidth: 100 },
    { field: 'remark', title: $t('noodleMachineUse.colRemark'), minWidth: 140 },
    {
      field: 'operation',
      title: $t('noodleMachineUse.operation'),
      width: 90,
      fixed: 'right',
      slots: { default: 'operationCell' },
    },
  ],
  height: 400,
  rowConfig: { keyField: 'id', isHover: true },
  radioConfig: { trigger: 'row', highlight: true },
  stripe: true,
  pagerConfig: { enabled: true, pageSize: 20 },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
  proxyConfig: {
    ajax: {
      query: queryUsageList,
    },
  },
};

/** 选中表格行后回填表单（有 id 即为修改模式） */
function fillFormByRow(row: any) {
  form.value = {
    id: row?.id,
    equipCode: row?.equipCode,
    type: row?.type,
    line: row?.lineCode,
    productionDate: formatDate(row?.productionDate),
    usageHours: row?.usageHours,
    remark: row?.remark ?? '',
  };
}

/** 表格事件：单选行后回填下方录入表单 */
const gridEvents: VxeGridListeners<any> = {
  radioChange: ({ row }: any) => {
    fillFormByRow(row);
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/** 格式化生产日期为 YYYY-MM-DD */
function formatDate(value?: string) {
  if (!value) return '';
  const d = dayjs(value);
  return d.isValid() ? d.format('YYYY-MM-DD') : '';
}

/** 分页查询面机使用明细 */
async function queryUsageList({ page }: any) {
  try {
    const { productDateRange, type, machineCode } = queryParams.value;
    const params: any = {
      pageNum: page.currentPage,
      pageSize: page.pageSize,
      type,
      equipCode: machineCode,
    };
    if (productDateRange?.length === 2) {
      params.startTime = productDateRange[0];
      params.endTime = productDateRange[1];
    }
    const res = await searchNoodleMachineUsage(params);
    return { total: res?.total || 0, items: res?.list || [] };
  } catch {
    message.error($t('noodleMachineUse.listLoadFailed'));
    return { items: [] };
  }
}

function handleQuery() {
  gridApi.reload();
}

function handleReset() {
  queryParams.value = {
    productDateRange: [],
    type: undefined,
    machineCode: undefined,
  };
  form.value = emptyForm();
  gridApi.grid?.clearRadioRow();
  gridApi.reload();
}

function handleExport() {
  gridApi.grid.exportData({ type: 'csv', filename: 'noodleMachineUse' });
}

/** 删除指定面机使用明细（二次确认后执行） */
function handleRowDelete(row: any) {
  if (row?.id == null) {
    return;
  }
  Modal.confirm({
    title: $t('noodleMachineUse.deleteConfirmTitle'),
    content: $t('noodleMachineUse.deleteConfirmContent'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: async () => {
      try {
        await deleteNoodleMachineUsage(row.id);
        message.success($t('noodleMachineUse.deleteSuccess'));
        form.value = emptyForm();
        gridApi.grid?.clearRadioRow();
        gridApi.reload();
      } catch {
        message.error($t('noodleMachineUse.deleteFailed'));
      }
    },
  });
}
// endregion

// region 录入表单：面机代码 / 面机类型 / 产线 / 生产日期 / 使用时长 / 备注
const emptyForm = () => ({
  id: undefined,
  equipCode: undefined,
  type: undefined,
  line: undefined,
  productionDate: '',
  usageHours: undefined,
  remark: '',
});

const form = ref<any>(emptyForm());

function buildRecord() {
  const f = form.value;
  const record: any = {
    equipCode: f.equipCode,
    type: f.type,
    lineCode: f.line,
    lineName: lineNameMap.get(f.line) ?? f.line ?? '',
    productionDate: f.productionDate,
    usageHours: f.usageHours,
    remark: f.remark,
  };
  // 有 id 说明是修改选中记录，提交时携带 id
  if (f.id != null) {
    record.id = f.id;
  }
  return record;
}

async function addRecord() {
  const f = form.value;
  if (
    !f.equipCode ||
    !f.type ||
    !f.line ||
    !f.productionDate ||
    f.usageHours === undefined ||
    f.usageHours === null
  ) {
    message.warning($t('noodleMachineUse.plsFillRequired'));
    return;
  }
  const isUpdate = f.id != null;
  try {
    const saveApi = isUpdate ? updateNoodleMachineUsage : addNoodleMachineUsage;
    await saveApi(buildRecord());
    message.success($t('noodleMachineUse.saveSuccess'));
    gridApi.reload();
    gridApi.grid?.clearRadioRow();
  } catch {
    message.error($t('noodleMachineUse.saveFailed'));
  }
}

function handleFormReset() {
  form.value = emptyForm();
  gridApi.grid?.clearRadioRow();
}
// endregion

onMounted(() => {
  gridApi.reload();
  loadOptions();
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="text-lg font-bold">{{ $t('noodleMachineUse.title') }}</div>

    <!-- 1. 查询条件 -->
    <Card :title="$t('noodleMachineUse.queryCondition')">
      <Form layout="inline" class="flex flex-wrap gap-2">
        <Form.Item :label="$t('noodleMachineUse.productDate')">
          <RangePicker
            v-model:value="queryParams.productDateRange"
            value-format="YYYY-MM-DD"
          />
        </Form.Item>
        <Form.Item :label="$t('noodleMachineUse.machineType')">
          <Select
            v-model:value="queryParams.type"
            :options="machineTypeOptions"
            :placeholder="$t('noodleMachineUse.machineTypePlaceholder')"
            allow-clear
            style="width: 160px"
          />
        </Form.Item>
        <Form.Item :label="$t('noodleMachineUse.machineCode')">
          <Select
            v-model:value="queryParams.machineCode"
            :options="machineCodeOptions"
            :placeholder="$t('noodleMachineUse.machineCodePlaceholder')"
            allow-clear
            show-search
            style="width: 140px"
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" @click="handleQuery">
              {{ $t('common.query') }}
            </Button>
            <Button @click="handleReset">
              {{ $t('common.reset') }}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>

    <!-- 2. 面机使用明细列表 -->
    <Card :title="$t('noodleMachineUse.usageList')">
      <Grid>
        <template #toolbar-tools>
          <Button size="small" @click="handleExport">
            {{ $t('noodleMachineUse.export') }}
          </Button>
        </template>
        <template #productionDateCell="{ row }">
          {{ formatDate(row.productionDate) }}
        </template>
        <template #operationCell="{ row }">
          <Tooltip>
            <template #title>{{ $t('noodleMachineUse.delete') }}</template>
            <Button type="link" danger class="px-1" @click="handleRowDelete(row)">
              <Icon icon="mdi:delete-outline" class="inline-block align-middle text-lg" />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>

    <!-- 3. 录入表单 + 右对齐按钮 -->
    <Card :title="$t('noodleMachineUse.entryForm')">
      <Form layout="vertical" :model="form">
        <Row :gutter="16">
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <Form.Item :label="$t('noodleMachineUse.machineCode')">
              <Select
                v-model:value="form.equipCode"
                :options="machineCodeOptions"
                :placeholder="$t('noodleMachineUse.machineCodePlaceholder')"
                allow-clear
                show-search
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <Form.Item :label="$t('noodleMachineUse.machineType')">
              <Select
                v-model:value="form.type"
                :options="machineTypeOptions"
                :placeholder="$t('noodleMachineUse.machineTypePlaceholder')"
                allow-clear
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <Form.Item :label="$t('noodleMachineUse.line')">
              <Select
                v-model:value="form.line"
                :options="lineOptions"
                :placeholder="$t('noodleMachineUse.linePlaceholder')"
                allow-clear
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <Form.Item :label="$t('noodleMachineUse.productDate')">
              <DatePicker
                v-model:value="form.productionDate"
                value-format="YYYY-MM-DD"
                class="w-full"
                :placeholder="$t('noodleMachineUse.productDatePlaceholder')"
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <Form.Item :label="$t('noodleMachineUse.usageHours')">
              <InputNumber
                v-model:value="form.usageHours"
                class="w-full"
                :min="0"
                :placeholder="$t('noodleMachineUse.usageHoursPlaceholder')"
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="24" :md="16" :lg="12">
            <Form.Item :label="$t('noodleMachineUse.remark')">
              <Input
                v-model:value="form.remark"
                :placeholder="$t('noodleMachineUse.remarkPlaceholder')"
                allow-clear
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <div class="mt-2 flex justify-end gap-2">
        <Button @click="handleFormReset">
          {{ $t('common.reset') }}
        </Button>
        <Button type="primary" @click="addRecord">
          {{ $t('noodleMachineUse.save') }}
        </Button>
      </div>
    </Card>
  </div>
</template>
