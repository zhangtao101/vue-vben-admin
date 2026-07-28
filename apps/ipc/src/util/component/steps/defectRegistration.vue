<script setup lang="ts">
import { reactive, watch } from 'vue';

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

const { RangePicker } = DatePicker;

// region 1. 查询条件
const transferStatusOptions = [
  { label: $t('defectRegistration.transferred'), value: 'transferred' },
  { label: $t('defectRegistration.notTransferred'), value: 'notTransferred' },
];

const queryForm = reactive<any>({
  defectDate: undefined,
  trayNo: '',
  transferred: undefined,
});

function handleQuery() {
  // TODO: 接口就绪后替换为真实查询
}

function handleReset() {
  queryForm.defectDate = undefined;
  queryForm.trayNo = '';
  queryForm.transferred = undefined;
}
// endregion

// region 2. 不良列表（假数据，接口就绪后替换为接口返回）
const fakeList: any[] = [
  {
    defectDate: '2026-07-21',
    trayNo: 'T-001',
    scrapQty: 10,
    reworkQty: 5,
    transferred: false,
  },
  {
    defectDate: '2026-07-20',
    trayNo: 'T-002',
    scrapQty: 8,
    reworkQty: 0,
    transferred: true,
  },
];

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      field: 'defectDate',
      title: $t('defectRegistration.colDefectDate'),
      minWidth: 140,
    },
    { field: 'trayNo', title: $t('defectRegistration.colTrayNo'), minWidth: 120 },
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
      field: 'transferred',
      title: $t('defectRegistration.colTransferred'),
      minWidth: 120,
      formatter: ({ cellValue }) =>
        cellValue
          ? $t('defectRegistration.transferred')
          : $t('defectRegistration.notTransferred'),
    },
  ],
  data: fakeList,
  height: 360,
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
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

const form = reactive<any>({
  trayNo: '',
  materialProductCode: '',
  halalType: undefined,
  stackQty: undefined,
  prodInstrSerial: '',
  mesWorkOrder: '',
  productionDate: '',
  validity: '',
  customerType: undefined,
  customerName: '',
  scrapQty: undefined,
  reworkQty: undefined,
});

/** 输入托盘号后带出下列参数（接口就绪后替换为真实查询） */
function fetchTrayInfo(trayNo: string) {
  if (!trayNo) {
    form.materialProductCode = '';
    form.halalType = undefined;
    form.stackQty = undefined;
    form.prodInstrSerial = '';
    form.mesWorkOrder = '';
    form.productionDate = '';
    form.validity = '';
    form.customerType = undefined;
    form.customerName = '';
    return;
  }
  form.materialProductCode = 'P-001';
  form.halalType = 'halal';
  form.stackQty = 120;
  form.prodInstrSerial = 'SEQ-20260721-001';
  form.mesWorkOrder = 'WO-20260721-001';
  form.productionDate = '2026-07-21';
  form.validity = '2026-10-21';
  form.customerType = 'agent';
  form.customerName = 'ABC Trading';
  message.success($t('defectRegistration.fetchInfoSuccess'));
}

watch(
  () => form.trayNo,
  (val) => {
    fetchTrayInfo(val);
  },
);

/** 重置表单（保留清空所有字段） */
function resetForm() {
  form.trayNo = '';
  form.materialProductCode = '';
  form.halalType = undefined;
  form.stackQty = undefined;
  form.prodInstrSerial = '';
  form.mesWorkOrder = '';
  form.productionDate = '';
  form.validity = '';
  form.customerType = undefined;
  form.customerName = '';
  form.scrapQty = undefined;
  form.reworkQty = undefined;
}

/** 将表单数据写入不良列表 */
function appendToList(transferred: boolean) {
  fakeList.unshift({
    defectDate: form.productionDate || '2026-07-21',
    trayNo: form.trayNo,
    scrapQty: form.scrapQty,
    reworkQty: form.reworkQty,
    transferred,
  });
  gridApi.grid.loadData([...fakeList]);
}

function handleSave() {
  if (!form.trayNo) {
    message.warning($t('defectRegistration.plsFillRequired'));
    return;
  }
  if (form.scrapQty == null || form.reworkQty == null) {
    message.warning($t('defectRegistration.plsFillQty'));
    return;
  }
  appendToList(false);
  resetForm();
  message.success($t('defectRegistration.saveSuccess'));
}

function handleTransfer() {
  if (!form.trayNo) {
    message.warning($t('defectRegistration.plsFillRequired'));
    return;
  }
  if (form.scrapQty == null || form.reworkQty == null) {
    message.warning($t('defectRegistration.plsFillQty'));
    return;
  }
  appendToList(true);
  resetForm();
  message.success($t('defectRegistration.transferSuccess'));
}
// endregion
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="text-lg font-bold">{{ $t('defectRegistration.title') }}</div>

    <!-- 1. 查询条件 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <Form layout="vertical" :model="queryForm">
        <Row :gutter="16">
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <Form.Item :label="$t('defectRegistration.defectRegDate')">
              <RangePicker
                v-model:value="queryForm.defectDate"
                class="w-full"
                :placeholder="[
                  $t('defectRegistration.defectRegDatePlaceholder'),
                  $t('defectRegistration.defectRegDatePlaceholder'),
                ]"
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <Form.Item :label="$t('defectRegistration.trayNo')">
              <Input
                v-model:value="queryForm.trayNo"
                :placeholder="$t('defectRegistration.trayNoPlaceholder')"
                allow-clear
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <Form.Item :label="$t('defectRegistration.transferStatus')">
              <Select
                v-model:value="queryForm.transferred"
                :options="transferStatusOptions"
                :placeholder="$t('defectRegistration.transferStatusPlaceholder')"
                allow-clear
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

    <!-- 2. 不良列表 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-2 font-bold">{{ $t('defectRegistration.defectList') }}</div>
      <Grid>
        <template #toolbar-tools></template>
      </Grid>
    </div>

    <!-- 3. 登记表单 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-3 font-bold">{{ $t('defectRegistration.entryForm') }}</div>
      <Form layout="vertical" :model="form">
        <Row :gutter="16">
          <Col :xs="24" :sm="12" :md="8">
            <Form.Item :label="$t('defectRegistration.trayNo')">
              <Input
                v-model:value="form.trayNo"
                :placeholder="$t('defectRegistration.trayNoPlaceholder')"
                allow-clear
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8">
            <Form.Item :label="$t('defectRegistration.materialProductCode')">
              <Input v-model:value="form.materialProductCode" disabled />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8">
            <Form.Item :label="$t('defectRegistration.halalType')">
              <Select
                v-model:value="form.halalType"
                :options="halalTypeOptions"
                disabled
                allow-clear
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8">
            <Form.Item :label="$t('defectRegistration.stackQty')">
              <InputNumber v-model:value="form.stackQty" class="w-full" disabled />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8">
            <Form.Item :label="$t('defectRegistration.prodInstrSerial')">
              <Input v-model:value="form.prodInstrSerial" disabled />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8">
            <Form.Item :label="$t('defectRegistration.mesWorkOrder')">
              <Input v-model:value="form.mesWorkOrder" disabled />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8">
            <Form.Item :label="$t('defectRegistration.productionDate')">
              <Input v-model:value="form.productionDate" disabled />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8">
            <Form.Item :label="$t('defectRegistration.validity')">
              <Input v-model:value="form.validity" disabled />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8">
            <Form.Item :label="$t('defectRegistration.customerType')">
              <Select
                v-model:value="form.customerType"
                :options="customerTypeOptions"
                disabled
                allow-clear
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8">
            <Form.Item :label="$t('defectRegistration.customerName')">
              <Input v-model:value="form.customerName" disabled />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8">
            <Form.Item :label="$t('defectRegistration.scrapQty')">
              <InputNumber
                v-model:value="form.scrapQty"
                class="w-full"
                :min="0"
                :placeholder="$t('defectRegistration.scrapQty')"
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8">
            <Form.Item :label="$t('defectRegistration.reworkQty')">
              <InputNumber
                v-model:value="form.reworkQty"
                class="w-full"
                :min="0"
                :placeholder="$t('defectRegistration.reworkQty')"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <div class="flex justify-end gap-2">
        <Button @click="handleTransfer">{{ $t('defectRegistration.transfer') }}</Button>
        <Button type="primary" @click="handleSave">
          {{ $t('defectRegistration.save') }}
        </Button>
      </div>
    </div>
  </div>
</template>
