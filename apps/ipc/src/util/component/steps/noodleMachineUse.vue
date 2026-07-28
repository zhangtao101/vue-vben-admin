<script setup lang="ts">
import { onMounted, reactive } from 'vue';

import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
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

// region 1. 查询条件
const { RangePicker } = DatePicker;

const machineTypeOptions = [
  { label: $t('noodleMachineUse.typeRolling'), value: 'rolling' },
  { label: $t('noodleMachineUse.typeCompound'), value: 'compound' },
  { label: $t('noodleMachineUse.typeCutting'), value: 'cutting' },
  { label: $t('noodleMachineUse.typeFrying'), value: 'frying' },
];

const machineCodeOptions = [
  { label: 'M-001', value: 'M-001' },
  { label: 'M-002', value: 'M-002' },
  { label: 'M-003', value: 'M-003' },
];

const lineOptions = [
  { label: $t('noodleMachineUse.line1'), value: 'L01' },
  { label: $t('noodleMachineUse.line2'), value: 'L02' },
  { label: $t('noodleMachineUse.line3'), value: 'L03' },
];

const queryForm = reactive<any>({
  productDate: undefined,
  machineType: undefined,
  machineCode: undefined,
});

function handleQuery() {
  // TODO: 接口就绪后替换为真实查询
}

function handleReset() {
  queryForm.productDate = undefined;
  queryForm.machineType = undefined;
  queryForm.machineCode = undefined;
}
// endregion

// region 2. 面机使用明细列表（假数据，接口就绪后替换为接口返回）
const fakeList: any[] = [
  {
    machineCode: 'M-001',
    machineType: 'rolling',
    lineCode: 'L01',
    productDate: '2026-07-21',
    useTime: 4,
    remark: '',
  },
  {
    machineCode: 'M-002',
    machineType: 'frying',
    lineCode: 'L02',
    productDate: '2026-07-21',
    useTime: 6,
    remark: 'test',
  },
];

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      field: 'machineCode',
      title: $t('noodleMachineUse.colMachineCode'),
      minWidth: 120,
    },
    {
      field: 'machineType',
      title: $t('noodleMachineUse.colMachineType'),
      minWidth: 120,
      formatter: ({ cellValue }) =>
        machineTypeOptions.find((o) => o.value === cellValue)?.label || cellValue,
    },
    {
      field: 'lineCode',
      title: $t('noodleMachineUse.colLineCode'),
      minWidth: 120,
      formatter: ({ cellValue }) =>
        lineOptions.find((o) => o.value === cellValue)?.label || cellValue,
    },
    {
      field: 'productDate',
      title: $t('noodleMachineUse.colProductDate'),
      minWidth: 140,
    },
    { field: 'useTime', title: $t('noodleMachineUse.colUseTime'), minWidth: 120 },
    { field: 'remark', title: $t('noodleMachineUse.colRemark'), minWidth: 160 },
  ],
  data: fakeList,
  height: 360,
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
// endregion

// region 3. 录入表单（垂直堆叠，不使用 Row/Col）
const form = reactive<any>({
  machineCode: undefined,
  lineCode: undefined,
  productDate: undefined,
  useTime: undefined,
  remark: '',
});

function handleDelete() {
  form.machineCode = undefined;
  form.lineCode = undefined;
  form.productDate = undefined;
  form.useTime = undefined;
  form.remark = '';
}

function handleSave() {
  if (
    !form.machineCode ||
    !form.lineCode ||
    !form.productDate ||
    form.useTime == null
  ) {
    message.warning($t('noodleMachineUse.plsFillRequired'));
    return;
  }
  fakeList.unshift({ ...form });
  gridApi.grid.loadData([...fakeList]);
  message.success($t('noodleMachineUse.saveSuccess'));
}
// endregion

onMounted(() => {});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="text-lg font-bold">{{ $t('noodleMachineUse.title') }}</div>

    <!-- 1. 查询条件 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <Form layout="vertical" :model="queryForm">
        <Row :gutter="16">
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <Form.Item :label="$t('noodleMachineUse.productDate')">
              <RangePicker
                v-model:value="queryForm.productDate"
                class="w-full"
                :placeholder="[
                  $t('noodleMachineUse.productDatePlaceholder'),
                  $t('noodleMachineUse.productDatePlaceholder'),
                ]"
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <Form.Item :label="$t('noodleMachineUse.machineType')">
              <Select
                v-model:value="queryForm.machineType"
                :options="machineTypeOptions"
                :placeholder="$t('noodleMachineUse.machineTypePlaceholder')"
                allow-clear
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <Form.Item :label="$t('noodleMachineUse.machineCode')">
              <Select
                v-model:value="queryForm.machineCode"
                :options="machineCodeOptions"
                :placeholder="$t('noodleMachineUse.machineCodePlaceholder')"
                allow-clear
                show-search
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="24" :md="24" :lg="6" class="flex items-end">
            <Space>
              <Button type="primary" @click="handleQuery">
                {{ $t('common.query') }}
              </Button>
              <Button @click="handleReset">{{ $t('common.reset') }}</Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </div>

    <!-- 2. 面机使用明细列表 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-2 font-bold">{{ $t('noodleMachineUse.usageList') }}</div>
      <Grid>
        <template #toolbar-tools></template>
      </Grid>
    </div>

    <!-- 3. 录入表单 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-3 font-bold">{{ $t('noodleMachineUse.entryForm') }}</div>
      <Form layout="vertical" :model="form">
        <Form.Item :label="$t('noodleMachineUse.machineCode')">
          <Select
            v-model:value="form.machineCode"
            :options="machineCodeOptions"
            :placeholder="$t('noodleMachineUse.machineCodePlaceholder')"
            allow-clear
            show-search
          />
        </Form.Item>
        <Form.Item :label="$t('noodleMachineUse.lineCode')">
          <Select
            v-model:value="form.lineCode"
            :options="lineOptions"
            :placeholder="$t('noodleMachineUse.linePlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('noodleMachineUse.productDate')">
          <DatePicker
            v-model:value="form.productDate"
            value-format="YYYY-MM-DD"
            class="w-full"
            :placeholder="$t('noodleMachineUse.productDatePlaceholder')"
          />
        </Form.Item>
        <Form.Item :label="$t('noodleMachineUse.useTime')">
          <InputNumber
            v-model:value="form.useTime"
            class="w-full"
            :min="0"
            :placeholder="$t('noodleMachineUse.useTimePlaceholder')"
          />
        </Form.Item>
        <Form.Item :label="$t('noodleMachineUse.remark')">
          <Input
            v-model:value="form.remark"
            :placeholder="$t('noodleMachineUse.remarkPlaceholder')"
            allow-clear
          />
        </Form.Item>
      </Form>
      <div class="flex justify-end gap-2">
        <Button @click="handleDelete">{{ $t('noodleMachineUse.delete') }}</Button>
        <Button type="primary" @click="handleSave">
          {{ $t('noodleMachineUse.save') }}
        </Button>
      </div>
    </div>
  </div>
</template>
