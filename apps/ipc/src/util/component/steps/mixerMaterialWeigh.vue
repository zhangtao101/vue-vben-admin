<script setup lang="ts">
import { ref } from 'vue';

import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Space,
} from 'ant-design-vue';

import {
  useVbenVxeGrid,
  type VxeGridListeners,
  type VxeGridProps,
} from '#/adapter/vxe-table';
import {
  issueWeightLabel,
  searchLot,
  searchWeightRecord,
  selectMaterialWeight,
} from '#/api';
import { $t } from '#/locales';
import MaterialWeighDrawer from '#/util/component/drawers/MaterialWeighDrawer.vue';

import ReIssueDrawer from '../drawers/ReIssueDrawer.vue';

defineOptions({
  name: 'MixerMaterialWeigh',
});

/**
 * 搅拌材料称重管理：工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
const props = defineProps({
  functionId: { type: Number, default: 0 },
  workstationCode: { type: String, default: '' },
  /** 工序（搅拌机为 6，混合水为 1），由外部传入 */
  processType: { type: Number, default: 6 },
  /** 工序编号，由外部传入 */
  processCode: { type: String, default: '' },
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
function queryMaterialList(): Promise<{ items: any[] }> {
  const ws = selectedWorkSheet.value;
  if (!ws) return Promise.resolve({ items: [] });
  return selectMaterialWeight({
    workSheetId: ws.workWeekId,
    productCode: ws.productCode,
    batch: ws.batch,
    weight: ws.weight,
    lotId: ws.id,
  })
    .then((res) => ({ items: Array.isArray(res) ? res : [] }))
    .catch(() => {
      message.error($t('mixerMaterialWeigh.loadFailed'));
      return { items: [] };
    });
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
  height: 250,
  stripe: true,
  // 材料列表仅展示查询结果，不需要分页与手动查询
  pagerConfig: { enabled: false },
  proxyConfig: {
    ajax: {
      query: queryMaterialList,
    },
  },
  toolbarConfig: { custom: false, refresh: false, zoom: false },
};

/** 称重抽屉实例 */
const weighDrawerRef = ref();

const materialGridEvents: VxeGridListeners<any> = {
  cellClick: () => {
    // 点击材料行打开称重抽屉，材料信息通过扫码标签获取
    weighDrawerRef.value?.open();
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
  height: 250,
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

// region 发行/重新发行
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
    <Card>
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
    <Card>
      <Grid>
        <!-- <template #toolbar-tools></template> -->
      </Grid>
    </Card>

    <!-- 下部：左右两栏 -->
    <Row :gutter="16">
      <Col :xs="24" :lg="12">
        <Card>
          <Grid2>
            <!-- <template #toolbar-tools>123</template> -->
          </Grid2>
        </Card>
      </Col>
      <Col :xs="24" :lg="12">
        <Card>
          <Grid3>
            <!-- <template #toolbar-tools></template> -->
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
    <MaterialWeighDrawer
      ref="weighDrawerRef"
      :work-sheet="selectedWorkSheet"
      @success="loadWeightRecords"
    />

    <!-- 重新发行抽屉 -->
    <ReIssueDrawer ref="reIssueDrawerRef" />
  </div>
</template>

<style scoped></style>
