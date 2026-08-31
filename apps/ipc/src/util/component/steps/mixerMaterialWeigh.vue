<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';

import {
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Row,
  Space,
} from 'ant-design-vue';

import {
  useVbenVxeGrid,
  type VxeGridListeners,
  type VxeGridProps,
} from '#/adapter/vxe-table';
import {
  addWeightRecord,
  issueWeightLabel,
  searchLot,
  searchWeightRecord,
  selectMaterialWeight,
} from '#/api';
import { $t } from '#/locales';

import ReIssueDrawer from '../drawers/ReIssueDrawer.vue';

defineOptions({
  name: 'MixerMaterialWeigh',
});

/**
 * 搅拌材料称重管理：工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
const props = defineProps({
  functionId: { type: Number, default: 0 },
  bindingId: { type: Number, default: 0 },
  worksheetCode: { type: String, default: '' },
  equipCode: { type: String, default: '' },
  workstationCode: { type: String, default: '' },
  /** 工序（搅拌机为 6，混合水为 1），由外部传入 */
  processType: { type: Number, default: 6 },
});

// region 顶部：查询条件

const queryParams = ref<any>({
  lineName: '',
  planDateStart: '',
});

/** 查询参数格式化：处理时间范围并剔除空值字段 */
function formatQueryParams() {
  const params: any = { ...queryParams.value };
  // 处理时间范围查询
  if (params.planDateRange && params.planDateRange.length === 2) {
    params.startTime = params.planDateRange[0];
    params.endTime = params.planDateRange[1];
  }
  delete params.planDateRange;
  // 剔除空值字段
  Object.keys(params).forEach((key) => {
    if (
      params[key] === undefined ||
      params[key] === '' ||
      params[key] === null
    ) {
      delete params[key];
    }
  });
  return params;
}

/** 查询工单列表 */
async function queryWorkSheetList({ page }: any) {
  const res = await searchLot({
    ...formatQueryParams(),
    processType: props.processType,
    page: page.currentPage,
    pageSize: page.pageSize,
  });
  return { total: res.total, items: res.list };
}

/** 工单列表 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50, title: '' },
    {
      field: 'lotCode',
      title: $t('mixerMaterialWeigh.lotCode'),
      minWidth: 120,
    },
    {
      field: 'productCode',
      title: $t('mixerMaterialWeigh.productCode'),
      minWidth: 110,
    },
    {
      field: 'productName',
      title: $t('mixerMaterialWeigh.productName'),
      minWidth: 130,
    },
    {
      field: 'lineName',
      title: $t('mixerMaterialWeigh.lineName'),
      minWidth: 100,
    },
    {
      field: 'weight',
      title: $t('mixerMaterialWeigh.weight'),
      minWidth: 100,
    },
    { field: 'unit', title: $t('mixerMaterialWeigh.unit'), minWidth: 80 },
    { field: 'batch', title: $t('mixerMaterialWeigh.batch'), minWidth: 90 },
  ],
  height: 280,
  stripe: true,
  radioConfig: { trigger: 'row', highlight: true },
  proxyConfig: {
    ajax: {
      query: queryWorkSheetList,
    },
  },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const gridEvents: VxeGridListeners<any> = {
  radioChange: ({ row }: any) => {
    selectedWorkSheet.value = row;
    // 选中工单后，重新加载左侧材料列表与右侧称重记录
    loadMaterialList();
    loadWeightRecords();
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

const selectedWorkSheet = ref<any>(null);

function handleQuery() {
  gridApi.reload();
}

function handleReset() {
  queryParams.value = { lineName: '', planDateStart: '' };
  gridApi.reload();
}
// endregion

// region 左栏：材料列表
/** 按选中工单查询材料列表（左侧材料列表与抽屉材料列表复用） */
async function queryMaterialList() {
  const ws = selectedWorkSheet.value;
  if (!ws) return { items: [] };
  try {
    const res = await selectMaterialWeight({
      workSheetId: ws.workWeekId,
      productCode: ws.productCode,
      batch: ws.batch,
      weight: ws.weight,
      lotId: ws.id,
    });
    return { items: Array.isArray(res) ? res : [] };
  } catch {
    message.error($t('mixerMaterialWeigh.loadFailed'));
    return { items: [] };
  }
}

const materialGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      field: 'materialName',
      title: $t('mixerMaterialWeigh.materialName'),
      minWidth: 120,
    },
    {
      field: 'materialCode',
      title: $t('mixerMaterialWeigh.materialCode'),
      minWidth: 110,
    },
    {
      field: 'productWt',
      title: $t('mixerMaterialWeigh.weight'),
      minWidth: 100,
    },
    {
      field: 'upperProductWt',
      title: $t('mixerMaterialWeigh.upperProductWt'),
      minWidth: 100,
    },
    {
      field: 'lowerProductWt',
      title: $t('mixerMaterialWeigh.lowerProductWt'),
      minWidth: 100,
    },
    { field: 'unit', title: $t('mixerMaterialWeigh.unit'), minWidth: 80 },
  ],
  height: 320,
  stripe: true,
  // 材料列表仅展示查询结果，不需要分页与手动查询
  pagerConfig: { enabled: false },
  proxyConfig: {
    ajax: {
      query: queryMaterialList,
    },
  },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const materialGridEvents: VxeGridListeners<any> = {
  cellClick: () => {
    // 点击材料行打开称重抽屉，材料信息通过扫码标签获取
    openWeighDrawer();
  },
};

const [Grid2, gridApi2] = useVbenVxeGrid({
  gridEvents: materialGridEvents,
  gridOptions: materialGridOptions,
});

function loadMaterialList() {
  // 通过 proxy 查询：未选中工单时返回空数据，有选中才调用接口
  gridApi2.reload();
}
// endregion

// region 右栏：保存的称重记录
/** 按选中工单查询称重记录 */
async function queryWeightRecordList() {
  const ws = selectedWorkSheet.value;
  if (!ws) return { items: [] };
  try {
    const res = await searchWeightRecord(String(ws.id));
    return { items: Array.isArray(res) ? res : [] };
  } catch {
    message.error($t('mixerMaterialWeigh.loadFailed'));
    return { items: [] };
  }
}

const recordGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      field: 'palletLabel',
      title: $t('mixerMaterialWeigh.palletLabel'),
      minWidth: 130,
    },
    {
      field: 'scanLabel',
      title: $t('mixerMaterialWeigh.scanLabel'),
      minWidth: 150,
    },
    {
      field: 'materialName',
      title: $t('mixerMaterialWeigh.materialName'),
      minWidth: 120,
    },
    {
      field: 'materialCode',
      title: $t('mixerMaterialWeigh.materialCode'),
      minWidth: 110,
    },
    {
      field: 'actualWt',
      title: $t('mixerMaterialWeigh.actualWt'),
      minWidth: 100,
    },
    { field: 'unit', title: $t('mixerMaterialWeigh.unit'), minWidth: 80 },
  ],
  height: 320,
  stripe: true,
  // 称重记录仅展示保存结果，不需要分页与手动查询
  pagerConfig: { enabled: false },
  proxyConfig: {
    ajax: {
      query: queryWeightRecordList,
    },
  },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [Grid3, gridApi3] = useVbenVxeGrid({ gridOptions: recordGridOptions });

function loadWeightRecords() {
  // 通过 proxy 查询：未选中工单时返回空数据，有选中才调用接口
  gridApi3.reload();
}
// endregion

// region 称重抽屉
const weighOpen = ref(false);
const submitting = ref(false);
const labelIdRef = ref();
const labelId = ref('');
/** 扫码标签解析出的材料编码（标签格式：材料编码|...） */
const scannedMaterialCode = ref('');
const currentMaterial = ref<any>(null);
const actualWt = ref<number>(0);
const packType = ref<number>(1);
/** 个数（加减重量按钮的累加次数） */
const count = ref<number>(0);

/** 计算进度条基准（上限/下限/当前重量的最大值，留出余量） */
const displayMax = computed(() => {
  const upper = Number(currentMaterial.value?.upperProductWt) || 0;
  const lower = Number(currentMaterial.value?.lowerProductWt) || 0;
  const maxVal = Math.max(upper, lower, actualWt.value) * 1.2;
  return maxVal > 0 ? maxVal : 1;
});

const fillPercent = computed(() => {
  const w = Number(actualWt.value) || 0;
  return Math.min(100, (w / displayMax.value) * 100);
});

const lowerPercent = computed(() => {
  const lower = Number(currentMaterial.value?.lowerProductWt) || 0;
  return Math.min(100, (lower / displayMax.value) * 100);
});

const upperPercent = computed(() => {
  const upper = Number(currentMaterial.value?.upperProductWt) || 0;
  return Math.min(100, (upper / displayMax.value) * 100);
});

/** 实时重量是否在上下限范围内 */
const inRange = computed(() => {
  const w = Number(actualWt.value) || 0;
  const upper = currentMaterial.value?.upperProductWt;
  const lower = currentMaterial.value?.lowerProductWt;
  const hasUpper = upper !== null && upper !== undefined && upper !== '';
  const hasLower = lower !== null && lower !== undefined && lower !== '';
  if (!hasUpper && !hasLower) return true;
  if (hasLower && w < Number(lower)) return false;
  if (hasUpper && w > Number(upper)) return false;
  return true;
});

/** 抽屉内材料列表：与扫码标签匹配的行显示为黄色，已称重（称重重量有值）的行显示为绿色 */
const drawerGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      field: 'materialName',
      title: $t('mixerMaterialWeigh.materialName'),
      minWidth: 120,
    },
    {
      field: 'materialCode',
      title: $t('mixerMaterialWeigh.materialCode'),
      minWidth: 110,
    },
    {
      field: 'productWt',
      title: $t('mixerMaterialWeigh.weight'),
      minWidth: 100,
    },
    {
      field: 'upperProductWt',
      title: $t('mixerMaterialWeigh.upperProductWt'),
      minWidth: 100,
    },
    {
      field: 'lowerProductWt',
      title: $t('mixerMaterialWeigh.lowerProductWt'),
      minWidth: 100,
    },
    { field: 'unit', title: $t('mixerMaterialWeigh.unit'), minWidth: 80 },
    {
      field: 'actualWt',
      title: $t('mixerMaterialWeigh.actualWt'),
      minWidth: 100,
    },
  ],
  height: 220,
  stripe: false,
  // 与扫码标签材料编码匹配的行显示为黄色，已称重（称重重量有值）的行显示为绿色
  rowClassName: ({ row }: any) => {
    if (row.materialCode === scannedMaterialCode.value) return 'bg-yellow-500';
    return row.actualWt ? 'bg-green-500/15' : '';
  },
  // 材料列表仅展示查询结果，不需要分页与手动查询
  pagerConfig: { enabled: false },
  proxyConfig: {
    ajax: {
      query: queryMaterialList,
    },
  },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [Grid4, gridApi4] = useVbenVxeGrid({
  gridOptions: drawerGridOptions,
});

function openWeighDrawer() {
  currentMaterial.value = null;
  scannedMaterialCode.value = '';
  labelId.value = '';
  actualWt.value = 0;
  count.value = 0;
  packType.value = 1;
  weighOpen.value = true;
  nextTick(() => {
    // 通过 proxy 重新查询材料列表
    gridApi4.grid?.commitProxy?.('query');
    labelIdRef.value?.focus();
  });
}

/** 清空称重重量：将抽屉内材料列表的称重重量（actualWt）一栏全部清空 */
function handleClearWeighWeight() {
  const rows = gridApi4.grid?.getTableData?.().fullData || [];
  rows.forEach((row: any) => {
    row.actualWt = undefined;
  });
  // 刷新表格显示（不触发重新查询，避免接口数据覆盖已清空的值）
  // gridApi4.grid?.refreshData();
}

/** 扫码/输入标签后：解析材料编码并匹配表格行，匹配的行显示为黄色并回填材料信息 */
function handleLabelInput() {
  const code = labelId.value.split('|')[0]?.trim() || '';
  scannedMaterialCode.value = code;
  // 从抽屉表格当前数据中按材料编码匹配（数据已通过接口加载）
  const rows = gridApi4.grid?.getTableData?.().fullData || [];
  const matched = code ? rows.find((m) => m.materialCode === code) : undefined;
  if (matched) {
    currentMaterial.value = matched;
    actualWt.value = 0;
    count.value = 0;
    packType.value = 1;
  } else {
    currentMaterial.value = null;
  }
  // 重新渲染表格以更新黄色高亮
  gridApi4.grid?.commitProxy?.('query');
}

/** 抽屉重置：清空基本信息与实时称重信息，取消扫码高亮，回到初始状态 */
function handleDrawerReset() {
  labelId.value = '';
  scannedMaterialCode.value = '';
  actualWt.value = 0;
  count.value = 0;
  packType.value = 1;
  currentMaterial.value = null;
  // 通过 proxy 重新查询数据以清除高亮状态
  gridApi4.grid?.commitProxy?.('query');
}

/** 关闭抽屉：清空所有状态，回到初始状态 */
function handleClose() {
  weighOpen.value = false;
  currentMaterial.value = null;
  scannedMaterialCode.value = '';
  labelId.value = '';
  actualWt.value = 0;
  count.value = 0;
  packType.value = 1;
}

/** 增加一个单位重量：个数 +1，称重重量 = 个数 × 单包重量 */
function handleAddUnit() {
  const unitWt = Number(currentMaterial.value?.materialWt) || 0;
  count.value += 1;
  actualWt.value = count.value * unitWt;
}

/** 减少一个单位重量：个数 -1，称重重量 = 个数 × 单包重量 */
function handleMinusUnit() {
  if (count.value <= 0) return;
  count.value -= 1;
  const unitWt = Number(currentMaterial.value?.materialWt) || 0;
  actualWt.value = count.value * unitWt;
}

/** 保存称重记录 */
async function handleSubmit() {
  const ws = selectedWorkSheet.value;
  const mat = currentMaterial.value;
  if (!ws) {
    message.warning($t('mixerMaterialWeigh.plsSelectWorkSheet'));
    return;
  }
  if (!labelId.value || !mat) {
    message.warning($t('mixerMaterialWeigh.plsInputLabel'));
    return;
  }
  submitting.value = true;
  try {
    await addWeightRecord({
      actualWt: Number(actualWt.value) || 0,
      lotCode: ws.lotCode,
      lotId: ws.id,
      materialCode: mat.materialCode,
      materialName: mat.materialName,
      packType: packType.value,
      scanLabel: labelId.value,
      unit: mat.unit,
    });
    message.success($t('mixerMaterialWeigh.saveSuccess'));
    handleDrawerReset();
    loadWeightRecords();
  } catch {
    message.error($t('mixerMaterialWeigh.saveFailed'));
  } finally {
    submitting.value = false;
  }
}

/** 是否正在发行 */
const issuing = ref(false);

/** 重新发行抽屉实例 */
const reIssueDrawerRef = ref();

/** 重新发行称重标签：打开重新发行抽屉，并传入当前工序 */
function handleReIssue() {
  reIssueDrawerRef.value?.open(props.processType);
}

/** 发行称重标签：二次确认后调用发行接口 */
function handleIssue() {
  const ws = selectedWorkSheet.value;
  if (!ws) {
    message.warning($t('mixerMaterialWeigh.plsSelectWorkSheet'));
    return;
  }
  Modal.confirm({
    title: $t('mixerMaterialWeigh.issueConfirmTitle'),
    content: $t('mixerMaterialWeigh.issueConfirmContent'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: async () => {
      issuing.value = true;
      try {
        await issueWeightLabel(ws.id);
        message.success($t('mixerMaterialWeigh.issueSuccess'));
        loadWeightRecords();
      } catch {
        message.error($t('mixerMaterialWeigh.issueFailed'));
      } finally {
        issuing.value = false;
      }
    },
  });
}
// endregion
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- 顶部：查询条件 -->
    <Card :title="$t('mixerMaterialWeigh.queryCondition')">
      <Form layout="inline" class="mb-3 flex-wrap items-end gap-2">
        <Form.Item :label="$t('mixerMaterialWeigh.lineName')">
          <Input
            v-model:value="queryParams.lineName"
            :placeholder="$t('mixerMaterialWeigh.lineNamePlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('mixerMaterialWeigh.planDateStart')">
          <DatePicker
            v-model:value="queryParams.planDateStart"
            value-format="YYYY-MM-DD"
            :placeholder="$t('mixerMaterialWeigh.datePlaceholder')"
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

    <!-- 中部：工单列表（单选） -->
    <Card :title="$t('mixerMaterialWeigh.workSheetList')">
      <Grid>
        <template #toolbar-tools></template>
      </Grid>
    </Card>

    <!-- 下部：左右两栏 -->
    <Row :gutter="16">
      <Col :xs="24" :lg="12">
        <Card :title="$t('mixerMaterialWeigh.materialList')">
          <Grid2>
            <template #toolbar-tools></template>
          </Grid2>
        </Card>
      </Col>
      <Col :xs="24" :lg="12">
        <Card :title="$t('mixerMaterialWeigh.weighRecordList')">
          <Grid3>
            <template #toolbar-tools></template>
          </Grid3>
          <div class="mt-2 flex justify-end">
            <Space>
              <Button @click="handleReIssue">
                {{ $t('mixerMaterialWeigh.reIssue') }}
              </Button>
              <Button type="primary" :loading="issuing" @click="handleIssue">
                {{ $t('mixerMaterialWeigh.issue') }}
              </Button>
            </Space>
          </div>
        </Card>
      </Col>
    </Row>

    <!-- 称重抽屉：基本信息 → 实时称重信息 → 材料列表 -->
    <Drawer
      v-model:open="weighOpen"
      :title="$t('mixerMaterialWeigh.weigh')"
      placement="top"
      height="70%"
      :closable="false"
      :mask-closable="false"
      :footer-style="{ textAlign: 'right' }"
      @close="handleClose"
    >
      <div class="flex flex-col gap-4">
        <!-- 1. 基本信息 -->
        <div>
          <div class="mb-1 text-sm font-medium">
            {{ $t('mixerMaterialWeigh.labelId') }}
          </div>
          <Input
            ref="labelIdRef"
            v-model:value="labelId"
            :placeholder="$t('mixerMaterialWeigh.labelIdPlaceholder')"
            allow-clear
            @press-enter="handleLabelInput"
          />
          <Row :gutter="16" class="mt-3">
            <Col :xs="24" :md="18">
              <div class="mb-1 text-sm font-medium">
                {{ $t('mixerMaterialWeigh.materialCode') }}
              </div>
              <Space wrap align="center">
                <Input
                  :value="currentMaterial?.materialCode || ''"
                  class="!w-48"
                  disabled
                />
                <span class="text-sm">
                  {{ $t('mixerMaterialWeigh.materialName') }}：{{
                    currentMaterial?.materialName || '-'
                  }}
                </span>
                <span
                  class="rounded bg-primary px-2 py-1 text-base font-bold text-primary-foreground"
                >
                  {{ $t('mixerMaterialWeigh.standardWeight') }}：{{
                    currentMaterial?.productWt
                  }}
                  {{ currentMaterial?.unit }}
                </span>
              </Space>
            </Col>
            <Col :xs="24" :md="6">
              <div class="mb-1 text-sm font-medium">
                {{ $t('mixerMaterialWeigh.actualWt') }}
              </div>
              <InputNumber
                v-model:value="actualWt"
                :min="0"
                :precision="1"
                style="width: 180px"
                :disabled="packType === 1"
              />
            </Col>
          </Row>
        </div>

        <!-- 2. 实时称重信息：进度条全宽，称重方式与单包重量/个数/加减按钮左右两栏 -->
        <div>
          <div class="mb-1 text-sm font-medium">
            {{ $t('mixerMaterialWeigh.realWeight') }}
          </div>
          <div class="relative h-10 w-full overflow-hidden rounded bg-muted">
            <div
              class="absolute left-0 top-0 h-full transition-all"
              :class="inRange ? 'bg-success' : 'bg-destructive'"
              :style="{ width: `${fillPercent}%` }"
            ></div>
            <div
              class="absolute top-0 h-full w-0.5 bg-foreground"
              :style="{ left: `${lowerPercent}%` }"
            ></div>
            <div
              class="absolute top-0 h-full w-0.5 bg-foreground"
              :style="{ left: `${upperPercent}%` }"
            ></div>
            <div
              class="absolute inset-0 flex items-center justify-center text-sm font-bold"
            >
              {{ actualWt }} {{ currentMaterial?.unit }}
            </div>
          </div>
          <div class="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{{ $t('mixerMaterialWeigh.lowerProductWt') }}：{{
                currentMaterial?.lowerProductWt
              }}</span>
            <span>{{ $t('mixerMaterialWeigh.upperProductWt') }}：{{
                currentMaterial?.upperProductWt
              }}</span>
          </div>

          <!-- 称重方式 与 单包重量/个数/加减按钮 同一行左右两栏 -->
          <Row :gutter="16" class="mt-3">
            <Col :xs="24" :lg="12">
              <div class="mb-1 text-sm font-medium">
                {{ $t('mixerMaterialWeigh.packType') }}
              </div>
              <Radio.Group v-model:value="packType">
                <Radio :value="1">
                  {{ $t('mixerMaterialWeigh.paperBag') }}
                </Radio>
                <Radio :value="2">{{ $t('mixerMaterialWeigh.loose') }}</Radio>
              </Radio.Group>
            </Col>
            <Col v-if="packType === 1" :xs="24" :lg="12">
              <div class="flex flex-wrap items-end gap-x-6 gap-y-2">
                <div>
                  <div class="mb-1 text-sm text-muted-foreground">
                    {{ $t('mixerMaterialWeigh.unitWeight') }}
                  </div>
                  <div class="text-2xl font-bold text-primary">
                    {{ currentMaterial?.materialWt ?? '-' }}
                    {{ currentMaterial?.munit ?? '' }}
                  </div>
                </div>
                <div>
                  <div class="mb-1 text-sm text-muted-foreground">
                    {{ $t('mixerMaterialWeigh.count') }}
                  </div>
                  <div class="text-2xl font-bold">{{ count }}EA</div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <Button :disabled="!currentMaterial" @click="handleAddUnit">
                    +{{ currentMaterial?.materialWt }}
                    {{ currentMaterial?.munit }}
                  </Button>
                  <Button
                    :disabled="!currentMaterial || count <= 0"
                    @click="handleMinusUnit"
                  >
                    -{{ currentMaterial?.materialWt }}
                    {{ currentMaterial?.munit }}
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        <!-- 3. 材料列表（扫码匹配的行显示为黄色，已称重重量有值的行显示为绿色） -->
        <div>
          <div class="mb-1 text-sm font-medium">
            {{ $t('mixerMaterialWeigh.materialList') }}
          </div>
          <Grid4>
            <template #toolbar-tools>
              <Button type="primary" @click="handleClearWeighWeight">
                {{ $t('mixerMaterialWeigh.clearWeighWeight') }}
              </Button>
            </template>
          </Grid4>
        </div>
      </div>

      <!-- 底部按钮：重置 -> 保存 -> 取消 -->
      <template #footer>
        <Space>
          <Button @click="handleDrawerReset">
            {{ $t('common.reset') }}
          </Button>
          <Button type="primary" :loading="submitting" @click="handleSubmit">
            {{ $t('common.save') }}
          </Button>
          <Button @click="handleClose">
            {{ $t('common.cancel') }}
          </Button>
        </Space>
      </template>
    </Drawer>

    <!-- 重新发行抽屉 -->
    <ReIssueDrawer ref="reIssueDrawerRef" />
  </div>
</template>

<style scoped></style>
