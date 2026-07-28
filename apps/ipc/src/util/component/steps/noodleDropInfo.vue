<script setup lang="ts">
import { onMounted, ref } from 'vue';

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

// region 查询条件：生产日期(区域) / 制面产线 / 区域 / 等级
const queryParams = ref<any>({
  productDateRange: [],
  line: undefined,
  area: undefined,
  grade: undefined,
});

const lineOptions = [
  { label: $t('noodleDropInfo.line1'), value: 'L01' },
  { label: $t('noodleDropInfo.line2'), value: 'L02' },
  { label: $t('noodleDropInfo.line3'), value: 'L03' },
];

const areaOptions = [
  { label: $t('noodleDropInfo.areaA'), value: 'A' },
  { label: $t('noodleDropInfo.areaB'), value: 'B' },
  { label: $t('noodleDropInfo.areaC'), value: 'C' },
];

const gradeOptions = [
  { label: $t('noodleDropInfo.gradeA'), value: 'A' },
  { label: $t('noodleDropInfo.gradeB'), value: 'B' },
  { label: $t('noodleDropInfo.gradeC'), value: 'C' },
];
// endregion

// region 落面信息列表（假数据，接口就绪后替换为接口返回）
const fakeDrops: any[] = [
  {
    productDate: '2026-07-21',
    lineCode: 'L01',
    lineName: '制面一线',
    areaCode: 'A',
    areaName: '一区',
    grade: 'A',
    qty: 500,
    unit: 'kg',
    userId: 'U-001',
    userName: '操作员A',
    remark: '正常',
  },
  {
    productDate: '2026-07-21',
    lineCode: 'L02',
    lineName: '制面二线',
    areaCode: 'B',
    areaName: '二区',
    grade: 'B',
    qty: 320,
    unit: 'kg',
    userId: 'U-002',
    userName: '操作员B',
    remark: '',
  },
  {
    productDate: '2026-07-20',
    lineCode: 'L03',
    lineName: '制面三线',
    areaCode: 'C',
    areaName: '三区',
    grade: 'C',
    qty: 210,
    unit: 'kg',
    userId: 'U-001',
    userName: '操作员A',
    remark: '补录',
  },
];

const dropData = ref<any[]>([]);

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { field: 'productDate', title: $t('noodleDropInfo.colProductDate'), minWidth: 130 },
    { field: 'lineCode', title: $t('noodleDropInfo.colLineCode'), minWidth: 110 },
    { field: 'lineName', title: $t('noodleDropInfo.colLineName'), minWidth: 130 },
    { field: 'areaCode', title: $t('noodleDropInfo.colAreaCode'), minWidth: 100 },
    { field: 'areaName', title: $t('noodleDropInfo.colAreaName'), minWidth: 100 },
    { field: 'grade', title: $t('noodleDropInfo.colGrade'), minWidth: 90 },
    { field: 'qty', title: $t('noodleDropInfo.colQty'), minWidth: 100 },
    { field: 'unit', title: $t('noodleDropInfo.colUnit'), minWidth: 90 },
    { field: 'userId', title: $t('noodleDropInfo.colUserId'), minWidth: 110 },
    { field: 'userName', title: $t('noodleDropInfo.colUserName'), minWidth: 110 },
    { field: 'remark', title: $t('noodleDropInfo.colRemark'), minWidth: 140 },
  ],
  data: dropData.value,
  height: 400,
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

function loadDrops() {
  const { productDateRange, line, area, grade } = queryParams.value;
  const list = fakeDrops.filter((item) => {
    const m1 = !line || item.lineCode === line;
    const m2 = !area || item.areaCode === area;
    const m3 = !grade || item.grade === grade;
    const m4 =
      !productDateRange ||
      productDateRange.length !== 2 ||
      (item.productDate >= productDateRange[0] &&
        item.productDate <= productDateRange[1]);
    return m1 && m2 && m3 && m4;
  });
  dropData.value = list;
  gridApi.grid.loadData([...dropData.value]);
}

function handleQuery() {
  loadDrops();
}

function handleReset() {
  queryParams.value = {
    productDateRange: [],
    line: undefined,
    area: undefined,
    grade: undefined,
  };
  loadDrops();
}

function handleExport() {
  gridApi.grid.exportData({ type: 'csv', filename: 'noodleDropInfo' });
}
// endregion

// region 录入表单：生产日期 / 班别 / 制面产线 / 区域 / 等级 / 备注 / 重量
const currentUser = { id: 'U-001', name: '操作员A' };

const shiftOptions = [
  { label: $t('noodleDropInfo.shiftMorning'), value: 'M' },
  { label: $t('noodleDropInfo.shiftMiddle'), value: 'A' },
  { label: $t('noodleDropInfo.shiftNight'), value: 'N' },
];

const emptyForm = () => ({
  productDate: '',
  shift: undefined,
  line: undefined,
  area: undefined,
  grade: undefined,
  remark: '',
  weight: undefined,
});

const form = ref<any>(emptyForm());

function labelOf(options: any[], value: any) {
  return options.find((o) => o.value === value)?.label ?? value ?? '';
}

function buildRecord() {
  const f = form.value;
  return {
    productDate: f.productDate,
    lineCode: f.line,
    lineName: labelOf(lineOptions, f.line),
    areaCode: f.area,
    areaName: labelOf(areaOptions, f.area),
    grade: labelOf(gradeOptions, f.grade),
    qty: f.weight,
    unit: 'kg',
    userId: currentUser.id,
    userName: currentUser.name,
    remark: f.remark,
  };
}

function addRecord(resetAfter: boolean) {
  const f = form.value;
  if (!f.productDate || !f.line || f.weight === undefined || f.weight === null) {
    message.warning($t('noodleDropInfo.plsFillRequired'));
    return;
  }
  dropData.value.unshift(buildRecord());
  gridApi.grid.loadData([...dropData.value]);
  message.success(
    $t(resetAfter ? 'noodleDropInfo.registerSuccess' : 'noodleDropInfo.saveSuccess'),
  );
  if (resetAfter) {
    form.value = emptyForm();
  }
}

function handleSave() {
  addRecord(false);
}

function handleRegister() {
  addRecord(true);
}

function handleDelete() {
  form.value = emptyForm();
}
// endregion

onMounted(() => {
  loadDrops();
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="text-lg font-bold">{{ $t('noodleDropInfo.title') }}</div>

    <!-- 1. 查询条件 + 2. 落面信息列表 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <Form layout="inline" class="mb-3 flex-wrap items-end gap-2">
        <Form.Item :label="$t('noodleDropInfo.productDate')">
          <RangePicker
            v-model:value="queryParams.productDateRange"
            value-format="YYYY-MM-DD"
          />
        </Form.Item>
        <Form.Item :label="$t('noodleDropInfo.line')">
          <Select
            v-model:value="queryParams.line"
            :options="lineOptions"
            :placeholder="$t('noodleDropInfo.linePlaceholder')"
            allow-clear
            style="width: 160px"
          />
        </Form.Item>
        <Form.Item :label="$t('noodleDropInfo.area')">
          <Select
            v-model:value="queryParams.area"
            :options="areaOptions"
            :placeholder="$t('noodleDropInfo.areaPlaceholder')"
            allow-clear
            style="width: 140px"
          />
        </Form.Item>
        <Form.Item :label="$t('noodleDropInfo.grade')">
          <Select
            v-model:value="queryParams.grade"
            :options="gradeOptions"
            :placeholder="$t('noodleDropInfo.gradePlaceholder')"
            allow-clear
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

      <div class="mb-2 font-bold">{{ $t('noodleDropInfo.dropList') }}</div>
      <Grid>
        <template #toolbar-tools>
          <Button size="small" @click="handleExport">
            {{ $t('noodleDropInfo.export') }}
          </Button>
        </template>
      </Grid>
    </div>

    <!-- 3. 录入表单 + 4. 右对齐按钮 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-3 font-bold">{{ $t('noodleDropInfo.entryForm') }}</div>
      <Form layout="vertical" :model="form">
        <Row :gutter="16">
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <Form.Item :label="$t('noodleDropInfo.productDate')">
              <DatePicker
                v-model:value="form.productDate"
                value-format="YYYY-MM-DD"
                class="w-full"
                :placeholder="$t('noodleDropInfo.productDatePlaceholder')"
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <Form.Item :label="$t('noodleDropInfo.shift')">
              <Select
                v-model:value="form.shift"
                :options="shiftOptions"
                :placeholder="$t('noodleDropInfo.shiftPlaceholder')"
                allow-clear
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <Form.Item :label="$t('noodleDropInfo.line')">
              <Select
                v-model:value="form.line"
                :options="lineOptions"
                :placeholder="$t('noodleDropInfo.linePlaceholder')"
                allow-clear
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <Form.Item :label="$t('noodleDropInfo.area')">
              <Select
                v-model:value="form.area"
                :options="areaOptions"
                :placeholder="$t('noodleDropInfo.areaPlaceholder')"
                allow-clear
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <Form.Item :label="$t('noodleDropInfo.grade')">
              <Select
                v-model:value="form.grade"
                :options="gradeOptions"
                :placeholder="$t('noodleDropInfo.gradePlaceholder')"
                allow-clear
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <Form.Item :label="$t('noodleDropInfo.weight')">
              <InputNumber
                v-model:value="form.weight"
                class="w-full"
                :min="0"
                :placeholder="$t('noodleDropInfo.weightPlaceholder')"
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="24" :md="16" :lg="12">
            <Form.Item :label="$t('noodleDropInfo.remark')">
              <Input
                v-model:value="form.remark"
                :placeholder="$t('noodleDropInfo.remarkPlaceholder')"
                allow-clear
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <div class="mt-2 flex justify-end gap-2">
        <Button @click="handleDelete">
          {{ $t('noodleDropInfo.delete') }}
        </Button>
        <Button type="primary" @click="handleSave">
          {{ $t('noodleDropInfo.save') }}
        </Button>
        <Button type="primary" @click="handleRegister">
          {{ $t('noodleDropInfo.register') }}
        </Button>
      </div>
    </div>
  </div>
</template>
