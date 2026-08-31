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
  addNoodleSpillRecord,
  deleteNoodleSpillRecord,
  listProductionLines,
  searchAreas,
  searchGrades,
  searchNoodleSpillRecord,
  updatePlanQueue,
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

// region 查询条件：生产日期(区域) / 制面产线 / 区域 / 等级
const queryParams = ref<any>({
  productDateRange: [],
  line: undefined,
  area: undefined,
  grade: undefined,
});

// 下拉数据源（接口加载）
const lineOptions = ref<any[]>([]);
const areaOptions = ref<any[]>([]);
const gradeOptions = ref<any[]>([]);

// code -> name 映射，用于提交名称字段
const lineNameMap = new Map<string, string>();
const areaNameMap = new Map<string, string>();
const gradeNameMap = new Map<string, string>();

/** 加载产线/区域/等级下拉数据（label 格式：编号(名称)） */
async function loadOptions() {
  try {
    const [lineRes, areaRes, gradeRes] = await Promise.all([
      listProductionLines({ pageNum: 1, pageSize: 1000 }),
      searchAreas(),
      searchGrades(),
    ]);
    lineOptions.value = (lineRes?.list ?? []).map((item: any) => {
      lineNameMap.set(item.lineCode, item.lineName);
      return { label: `${item.lineCode}(${item.lineName})`, value: item.lineCode };
    });
    areaOptions.value = (areaRes?.list ?? []).map((item: any) => {
      areaNameMap.set(item.areaCode, item.areaName);
      return { label: `${item.areaCode}(${item.areaName})`, value: item.areaCode };
    });
    gradeOptions.value = (gradeRes?.list ?? []).map((item: any) => {
      gradeNameMap.set(item.gradeCode, item.gradeName);
      return { label: `${item.gradeCode}(${item.gradeName})`, value: item.gradeCode };
    });
  } catch {
    message.error($t('noodleDropInfo.optionsLoadFailed'));
  }
}
// endregion

// region 落面信息列表（接口分页查询）
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    ({ type: 'radio', width: 50, radioConfig: { trigger: 'row' } } as any),
    {
      field: 'productionDate',
      title: $t('noodleDropInfo.colProductDate'),
      minWidth: 130,
      slots: { default: 'productionDateCell' },
    },
    { field: 'lineCode', title: $t('noodleDropInfo.colLineCode'), minWidth: 110 },
    { field: 'lineName', title: $t('noodleDropInfo.colLineName'), minWidth: 130 },
    { field: 'areaCode', title: $t('noodleDropInfo.colAreaCode'), minWidth: 100 },
    { field: 'areaName', title: $t('noodleDropInfo.colAreaName'), minWidth: 100 },
    { field: 'gradeCode', title: $t('noodleDropInfo.colGrade'), minWidth: 90 },
    { field: 'quantity', title: $t('noodleDropInfo.colQty'), minWidth: 100 },
    { field: 'unit', title: $t('noodleDropInfo.colUnit'), minWidth: 90 },
    { field: 'userCode', title: $t('noodleDropInfo.colUserId'), minWidth: 110 },
    { field: 'userName', title: $t('noodleDropInfo.colUserName'), minWidth: 110 },
    { field: 'remark', title: $t('noodleDropInfo.colRemark'), minWidth: 140 },
    {
      field: 'operation',
      title: $t('noodleDropInfo.operation'),
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
      query: queryDropList,
    },
  },
};

/** 选中表格行后回填表单（有 id 即为修改模式） */
function fillFormByRow(row: any) {
  form.value = {
    id: row?.id,
    productDate: formatDate(row?.productionDate),
    shift: row?.shift,
    line: row?.lineCode,
    area: row?.areaCode,
    grade: row?.gradeCode,
    remark: row?.remark ?? '',
    weight: row?.quantity,
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

/** 分页查询落面记录 */
async function queryDropList({ page }: any) {
  try {
    const { productDateRange, line, area, grade } = queryParams.value;
    const params: any = {
      pageNum: page.currentPage,
      pageSize: page.pageSize,
      lineCode: line,
      areaCode: area,
      gradeCode: grade,
    };
    if (productDateRange?.length === 2) {
      params.startTime = productDateRange[0];
      params.endTime = productDateRange[1];
    }
    const res = await searchNoodleSpillRecord(params);
    return { total: res?.total || 0, items: res?.list || [] };
  } catch {
    message.error($t('noodleDropInfo.listLoadFailed'));
    return { items: [] };
  }
}

function handleQuery() {
  gridApi.reload();
}

function handleReset() {
  queryParams.value = {
    productDateRange: [],
    line: undefined,
    area: undefined,
    grade: undefined,
  };
  form.value = emptyForm();
  gridApi.grid?.clearRadioRow();
  gridApi.reload();
}

function handleExport() {
  gridApi.grid.exportData({ type: 'csv', filename: 'noodleDropInfo' });
}

/** 删除指定落面记录（二次确认后执行） */
function handleRowDelete(row: any) {
  if (row?.id == null) {
    return;
  }
  Modal.confirm({
    title: $t('noodleDropInfo.deleteConfirmTitle'),
    content: $t('noodleDropInfo.deleteConfirmContent'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: async () => {
      try {
        await deleteNoodleSpillRecord(row.id);
        message.success($t('noodleDropInfo.deleteSuccess'));
        form.value = emptyForm();
        gridApi.grid?.clearRadioRow();
        gridApi.reload();
      } catch {
        message.error($t('noodleDropInfo.deleteFailed'));
      }
    },
  });
}
// endregion

// region 录入表单：生产日期 / 班别 / 制面产线 / 区域 / 等级 / 备注 / 重量
const currentUser = { code: 'U-001', name: '操作员A' };

const shiftOptions = [
  { label: $t('noodleDropInfo.shiftDay'), value: 1 },
  { label: $t('noodleDropInfo.shiftNight'), value: 2 },
];

const emptyForm = () => ({
  id: undefined,
  productDate: '',
  shift: undefined,
  line: undefined,
  area: undefined,
  grade: undefined,
  remark: '',
  weight: undefined,
});

const form = ref<any>(emptyForm());

function buildRecord() {
  const f = form.value;
  const record: any = {
    productionDate: f.productDate,
    lineCode: f.line,
    lineName: lineNameMap.get(f.line) ?? f.line ?? '',
    areaCode: f.area,
    areaName: areaNameMap.get(f.area) ?? f.area ?? '',
    gradeCode: f.grade,
    gradeName: gradeNameMap.get(f.grade) ?? f.grade ?? '',
    quantity: f.weight,
    unit: 'kg',
    shift: f.shift,
    userCode: currentUser.code,
    userName: currentUser.name,
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
    !f.productDate ||
    !f.line ||
    !f.area ||
    !f.grade ||
    f.weight === undefined ||
    f.weight === null
  ) {
    message.warning($t('noodleDropInfo.plsFillRequired'));
    return;
  }
  const isUpdate = f.id != null;
  try {
    const saveApi = isUpdate ? updatePlanQueue : addNoodleSpillRecord;
    await saveApi(buildRecord());
    message.success($t('noodleDropInfo.saveSuccess'));
    gridApi.reload();
    gridApi.grid?.clearRadioRow();
  } catch {
    message.error($t('noodleDropInfo.saveFailed'));
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
    <div class="text-lg font-bold">{{ $t('noodleDropInfo.title') }}</div>

    <!-- 1. 查询条件 -->
    <Card :title="$t('noodleDropInfo.queryCondition')">
      <Form layout="inline" class="flex flex-wrap gap-2">
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
    </Card>

    <!-- 2. 落面信息列表 -->
    <Card :title="$t('noodleDropInfo.dropList')">
      <Grid>
        <template #toolbar-tools>
          <Button size="small" @click="handleExport">
            {{ $t('noodleDropInfo.export') }}
          </Button>
        </template>
        <template #productionDateCell="{ row }">
          {{ formatDate(row.productionDate) }}
        </template>
        <template #operationCell="{ row }">
          <Tooltip>
            <template #title>{{ $t('noodleDropInfo.delete') }}</template>
            <Button type="link" danger class="px-1" @click="handleRowDelete(row)">
              <Icon icon="mdi:delete-outline" class="inline-block align-middle text-lg" />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>

    <!-- 3. 录入表单 + 4. 右对齐按钮 -->
    <Card :title="$t('noodleDropInfo.entryForm')">
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
        <Button @click="handleFormReset">
          {{ $t('common.reset') }}
        </Button>
        <Button type="primary" @click="addRecord">
          {{ $t('noodleDropInfo.save') }}
        </Button>
      </div>
    </Card>
  </div>
</template>
