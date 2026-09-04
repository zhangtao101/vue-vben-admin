<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, reactive, ref } from 'vue';

import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Switch,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  cancelCartInput,
  cancelPerformance,
  getLoadingLotList,
  getProductionBomList,
  queryWorkSheetInfo,
  registerPerformance,
  searchSubLineByProcessCode,
  startOrEndWork,
} from '#/api';
import { $t } from '#/locales';
import MaterialLoadingDrawer from '#/util/component/drawers/MaterialLoadingDrawer.vue';
import WorkSheetSelectDrawer from '#/util/component/drawers/WorkSheetSelectDrawer.vue';

import WeightMeasureList from './weightMeasureList.vue';

/**
 * 工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
const props = defineProps({
  functionId: { type: Number, default: 0 },
  workstationCode: { type: String, default: '' },
  /** 工序编号，由外部传入 */
  processCode: { type: String, default: '' },
});

// region 1.1 左侧：工单信息表单
const lineOptions = ref<Array<{ id: any; label: string; value: string }>>([]);
const selectedId = ref<any>('');

/**
 * 加载产线（子产线）下拉数据：根据工序编码获取子产线列表
 * @returns 子产线列表（subLineCode 子产线编码、subLineName 子产线名称）
 * @since 2026-09-03
 */
function loadLineOptions() {
  if (!props.processCode) {
    lineOptions.value = [];
    return;
  }
  return searchSubLineByProcessCode(props.processCode).then((res: any) => {
    const list = res ?? [];
    lineOptions.value = list.map((item: any) => ({
      label: `${item.subLineCode}(${item.subLineName})`,
      value: item.subLineCode,
      id: item.id,
    }));
  });
}
function lineCodeChange(_value: any, item: any) {
  selectedId.value = item?.id ?? '';
  // 清除产线时同时清空已选工单，并刷新材料清单
  if (!item) {
    form.workSheetCode = '';
    materialGridApi.reload();
  }
}

const workSheetDrawerRef = ref<any>();

/**
 * 打开工单选择抽屉
 * 未选择产线时给出提示
 * @since 2026-09-03
 */
function handleSelectWorkSheet() {
  if (!selectedId.value) {
    message.warning($t('packagingOperation.plsSelectLine'));
    return;
  }
  workSheetDrawerRef.value?.open(selectedId.value);
}

/**
 * 选中工单后回填工单号，并调用接口查询工单详情
 * @param row 工单行数据
 * @returns 工单详情接口返回的 Promise
 * @since 2026-09-03
 */
function handleWorkSheetSelected(row: any) {
  form.workSheetCode = row?.workSheetCode ?? '';
  if (!form.workSheetCode) {
    return;
  }
  return queryWorkSheetInfo(form.workSheetCode).then((res: any) => {
    const info = res ?? {};
    // 产品信息：界面以 productName(productCode) 文本展示
    form.productCode = info.productCode;
    form.productName = info.productName;
    // 工单备注：界面以文本展示
    form.workOrderRemark = info.remark ?? '';
    // 测量总条数：右下角数量展示
    form.measureCount = info.measureCount ?? 0;
    // 指标赋值：测量总条数、生产数量、推车数量
    metrics.instructionQty = info.measureCount ?? 0;
    metrics.productionQty = info.finishNumber ?? 0;
    metrics.cartQty = info.cartCount ?? 0;
    // 刷新投入材料清单与推车列表
    materialGridApi.reload();
    gridApi.reload();
  });
}

const form = reactive<any>({
  lineCode: undefined,
  workSheetCode: '',
  productCode: undefined,
  productName: '',
  operator: '',
  workOrderRemark: '',
});
// endregion

// region 1.1 指标数（标题在上、数字在下）
const metrics = reactive<any>({
  instructionQty: 0,
  productionQty: 0,
  cartQty: 0,
});

const metricItems = [
  { key: 'instructionQty', title: $t('packagingOperation.instructionQty') },
  { key: 'productionQty', title: $t('packagingOperation.productionQty') },
  { key: 'cartQty', title: $t('packagingOperation.cartQty') },
];
// endregion

// region 1.2 右侧：投入材料（表格）+ 零点/重量控制
/**
 * 加载投入材料（生产物料清单）表格数据：按当前工单号查询
 * 工单号为空时返回空列表
 * @returns 材料清单分页数据（materialCode 料号、materialName 物料名称、bomUseQuantity BOM用量、standardQuantity 标准用量、alreadyInputQuantity 已投入数量）
 * @since 2026-09-03
 */
function queryMaterialList() {
  if (!form.workSheetCode) {
    return Promise.resolve({ items: [], total: 0 });
  }
  return getProductionBomList(form.workSheetCode).then((res: any) => {
    const list = Array.isArray(res) ? res : [];
    return { items: list, total: list.length };
  });
}

const materialGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      field: 'materialName',
      title: $t('packagingOperation.materialProductName'),
      minWidth: 160,
    },
    {
      field: 'materialCode',
      title: $t('packagingOperation.materialProductCode'),
      minWidth: 160,
    },
  ],
  height: 250,
  proxyConfig: {
    ajax: {
      query: queryMaterialList,
    },
  },
  stripe: true,
};

const [MaterialGrid, materialGridApi] = useVbenVxeGrid({
  gridOptions: materialGridOptions,
});

const zeroOn = ref<boolean>(false);
const weight = ref<number | undefined>(undefined);

function handleZeroChange(val: any) {
  message.success(
    val ? $t('packagingOperation.zeroOn') : $t('packagingOperation.zeroOff'),
  );
}
// endregion

// region 2. 推车列表表格（查询条件 + 工具栏操作 + 多选）
const queryParams = reactive<any>({
  cartCode: '',
  qty: undefined,
});

/**
 * 加载推车（大车批次绑定记录）列表：按当前工单号查询
 * 工单号为空时返回空列表；该接口无分页，返回全部绑定记录
 * @returns 推车列表（cartCode 大车编号、cartBindWorkSheetTime 大车投入工单时间、state 状态：1 wait 待机、2 proc 生产）
 * @since 2026-09-03
 */
function queryCartList() {
  if (!form.workSheetCode) {
    return Promise.resolve({ items: [], total: 0 });
  }
  return getLoadingLotList(form.workSheetCode).then((res: any) => {
    const list = Array.isArray(res) ? res : [];
    return { items: list, total: list.length };
  });
}

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    {
      field: 'cartCode',
      title: $t('packagingOperation.colCartCode'),
      minWidth: 120,
    },
    {
      field: 'workSheetCode',
      title: $t('packagingOperation.colWorkOrder'),
      minWidth: 180,
    },
    {
      field: 'cartType',
      title: $t('packagingOperation.colCartType'),
      minWidth: 100,
    },
    {
      field: 'catTypeName',
      title: $t('packagingOperation.colCartTypeName'),
      minWidth: 140,
    },
    {
      field: 'lineCode',
      title: $t('packagingOperation.colLineCode'),
      minWidth: 120,
    },
    {
      field: 'lineName',
      title: $t('packagingOperation.colLineName'),
      minWidth: 140,
    },
    {
      field: 'productCode',
      title: $t('packagingOperation.colProductCode'),
      minWidth: 140,
    },
    {
      field: 'productName',
      title: $t('packagingOperation.colProductName'),
      minWidth: 160,
    },
    {
      field: 'quantity',
      title: $t('packagingOperation.colQty'),
      minWidth: 100,
    },
    {
      field: 'unit',
      title: $t('packagingOperation.colUnit'),
      minWidth: 80,
    },
    {
      field: 'lotId',
      title: $t('packagingOperation.colLotId'),
      minWidth: 200,
    },
    {
      field: 'lotBindCartTime',
      title: $t('packagingOperation.colLotBindTime'),
      minWidth: 180,
    },
    {
      field: 'cartBindWorkSheetTime',
      title: $t('packagingOperation.colLoadTime'),
      minWidth: 180,
    },
    {
      field: 'state',
      title: $t('packagingOperation.colStatus'),
      minWidth: 120,
      slots: { default: 'cartState' },
    },
  ],
  height: 270,
  proxyConfig: {
    ajax: {
      query: queryCartList,
    },
  },
  checkboxConfig: {
    trigger: 'row',
  },
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

function getSelectedRows(): any[] {
  return gridApi.grid.getCheckboxRecords();
}

function handleCartDelete() {
  const rows = getSelectedRows();
  if (rows.length === 0) {
    message.warning($t('packagingOperation.plsSelectRow'));
    return;
  }
  const workSheetCode = form.workSheetCode;
  return Promise.all(
    rows.map((row: any) =>
      cancelCartInput({ cartCode: row.cartCode, workSheetCode }),
    ),
  ).then(() => {
    message.success($t('packagingOperation.cartDeleteSuccess'));
    gridApi.reload();
  });
}

function handleLabelIssue() {
  const rows = getSelectedRows();
  if (rows.length === 0) {
    message.warning($t('packagingOperation.plsSelectRow'));
    return;
  }
  message.success($t('packagingOperation.labelIssueSuccess'));
}

function handlePerformanceCancel() {
  const rows = getSelectedRows();
  if (rows.length === 0) {
    message.warning($t('packagingOperation.plsSelectRow'));
    return;
  }
  return Promise.all(
    rows.map((row: any) =>
      cancelPerformance({ cartCode: row.cartCode, lotId: row.lotId }),
    ),
  ).then(() => {
    message.success($t('packagingOperation.performanceCancelSuccess'));
    gridApi.reload();
  });
}

function handlePerformanceRegister() {
  // 1. 校验工具栏表单录入的推车代码与数量
  const cartCode = queryParams.cartCode.trim();
  const quantity = queryParams.qty;
  if (!cartCode) {
    message.warning($t('packagingOperation.plsInputCartCode'));
    return;
  }
  if (quantity === undefined || quantity === null || quantity <= 0) {
    message.warning($t('packagingOperation.plsInputQty'));
    return;
  }
  // 2. 调用大车业绩注册接口
  return registerPerformance({
    cartCode,
    quantity,
    workSheetCode: form.workSheetCode,
  }).then(() => {
    message.success($t('packagingOperation.performanceRegisterSuccess'));
    // 3. 注册成功后清空输入框并重新查询推车列表
    queryParams.cartCode = '';
    queryParams.qty = undefined;
    gridApi.reload();
  });
}
// endregion

// region 3. 底部：连接设置（预留）/ 按钮：材料装载 / 开始 / 结束
const connectModalVisible = ref(false);
const selectedPrinter = ref<string | undefined>(undefined);

function openConnectModal() {
  connectModalVisible.value = true;
}

function handleConnectOk() {
  connectModalVisible.value = false;
}

function handleConnectCancel() {
  connectModalVisible.value = false;
}

const workStatus = ref<'idle' | 'running'>('idle');

const materialDrawerRef = ref<any>();

function handleMaterialLoad() {
  materialDrawerRef.value?.open({
    lineId: selectedId.value,
    workSheetCode: form.workSheetCode,
    subLineCode: form.lineCode,
    processCode: props.processCode,
  });
}

/** 测量记录抽屉是否可见（点击指标数打开） */
const measureDrawerVisible = ref(false);

/**
 * 打开测量记录抽屉：展示当前选中子产线的重量测量记录
 * @returns 无返回值
 * @since 2026-09-04
 */
function openMeasureDrawer() {
  measureDrawerVisible.value = true;
}

function handleStart() {
  if (workStatus.value === 'running') {
    message.warning($t('packagingOperation.alreadyRunning'));
    return;
  }
  // 调用工单开始接口
  return startOrEndWork({
    workSheetCode: form.workSheetCode,
    status: 1,
  }).then(() => {
    workStatus.value = 'running';
    message.success($t('packagingOperation.startSuccess'));
    gridApi.reload();
  });
}

function handleEnd() {
  if (workStatus.value === 'idle') {
    message.warning($t('packagingOperation.notStarted'));
    return;
  }
  // 调用工单结束接口
  return startOrEndWork({
    workSheetCode: form.workSheetCode,
    status: 2,
  }).then(() => {
    workStatus.value = 'idle';
    message.success($t('packagingOperation.endSuccess'));
    gridApi.reload();
  });
}
// endregion

onMounted(() => {
  loadLineOptions();
});
</script>

<template>
  <div class="flex flex-col gap-4 p-2">
    <!-- 1. 上方左右两栏 -->
    <Row :gutter="16">
      <!-- 1.1 左侧：工单信息 + 指标 -->
      <Col :xs="24" :lg="12">
        <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
          <div class="mb-1 font-bold">
            {{ $t('packagingOperation.formTitle') }}
          </div>
          <Form
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
            :model="form"
          >
            <Form.Item :label="$t('packagingOperation.line')" class="mb-2!">
              <Select
                v-model:value="form.lineCode"
                :options="lineOptions"
                :placeholder="$t('packagingOperation.linePlaceholder')"
                @change="lineCodeChange"
                allow-clear
              />
            </Form.Item>
            <Form.Item
              :label="$t('packagingOperation.workOrder')"
              class="mb-2!"
            >
              <div class="flex w-full gap-2">
                <Input
                  v-model:value="form.workSheetCode"
                  :placeholder="$t('packagingOperation.workOrderPlaceholder')"
                  disabled
                  class="min-w-0 flex-1"
                />
                <Button @click="handleSelectWorkSheet">
                  {{ $t('packagingOperation.select') }}
                </Button>
              </div>
            </Form.Item>
            <Form.Item :label="$t('packagingOperation.product')" class="mb-2!">
              <div class="text-sm leading-8">
                {{
                  form.productCode
                    ? `${form.productName ?? ''}(${form.productCode})`
                    : '-'
                }}
              </div>
            </Form.Item>
            <Form.Item :label="$t('packagingOperation.operator')" class="mb-2!">
              <Input
                v-model:value="form.operator"
                :placeholder="$t('packagingOperation.operatorPlaceholder')"
                allow-clear
              />
            </Form.Item>
            <Form.Item
              :label="$t('packagingOperation.workOrderRemark')"
              class="mb-2!"
            >
              <div class="text-sm leading-8">
                {{ form.workOrderRemark || '-' }}
              </div>
            </Form.Item>
          </Form>

          <!-- 指标数：标题在上、数字在下 -->
          <div class="mt-1 rounded-md border border-border bg-muted/40 p-3">
            <Row :gutter="12">
              <Col
                v-for="item in metricItems"
                :key="item.key"
                :xs="8"
                class="mb-2"
              >
                <div
                  class="flex h-full flex-col items-center justify-center rounded-md border border-border bg-card py-3"
                >
                  <div class="text-sm text-muted-foreground">
                    {{ item.title }}
                  </div>
                  <div class="mt-1 text-2xl font-bold text-primary">
                    {{ metrics[item.key] }}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Col>

      <!-- 1.2 右侧：投入材料 + 零点/重量控制 -->
      <Col :xs="24" :lg="12">
        <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
          <div class="mb-1 font-bold">
            {{ $t('packagingOperation.materialTitle') }}
          </div>
          <MaterialGrid>
            <template #toolbar-tools></template>
          </MaterialGrid>

          <div class="mt-2 flex flex-col gap-2">
            <!-- 重量 / 数量：单独一行 -->
            <div class="flex items-center gap-2">
              <div>
                <!-- 零点开关：单独一行 -->
                <div class="flex items-center">
                  <span class="text-sm text-muted-foreground mr-4!">
                    {{ $t('packagingOperation.zeroSwitch') }}
                  </span>
                  <Switch :checked="zeroOn" @change="handleZeroChange" />
                </div>
                <span class="shrink-0 text-sm text-muted-foreground">
                  {{ $t('packagingOperation.weight') }}
                </span>
              </div>
              <div class="min-w-0 flex-1 text-right">
                <span class="text-4xl font-semibold text-primary">
                  {{ weight ?? 0 }}
                </span>
                <span class="ml-1 text-sm text-muted-foreground">G</span>
              </div>
              <div class="w-24 shrink-0 text-right">
                <span
                  class="inline-block cursor-pointer select-none text-4xl font-semibold text-primary transition-opacity hover:opacity-75"
                  @click="openMeasureDrawer"
                >
                  {{ form.measureCount ?? 0 }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Col>
    </Row>

    <!-- 2. 推车列表表格 -->
    <div class="rounded-lg border border-border bg-card p-2 shadow-sm">
      <div class="mb-1 font-bold">
        {{ $t('packagingOperation.tableTitle') }}
      </div>

      <Grid>
        <template #toolbar-actions>
          <Form :model="queryParams" class="flex flex-wrap items-center gap-2">
            <Form.Item :label="$t('packagingOperation.cartCode')" class="mb-0!">
              <Input
                v-model:value="queryParams.cartCode"
                :placeholder="$t('packagingOperation.cartCodePlaceholder')"
                allow-clear
                class="w-40"
              />
            </Form.Item>
            <Form.Item :label="$t('packagingOperation.qty')" class="mb-0!">
              <InputNumber
                v-model:value="queryParams.qty"
                :placeholder="$t('packagingOperation.qtyPlaceholder')"
                :min="0"
                class="w-32"
              />
            </Form.Item>
          </Form>
        </template>
        <template #toolbar-tools>
          <Button class="mr-2" @click="handleCartDelete">
            {{ $t('packagingOperation.cartDelete') }}
          </Button>
          <Button class="mr-2" @click="handleLabelIssue">
            {{ $t('packagingOperation.labelIssue') }}
          </Button>
          <Button class="mr-2" @click="handlePerformanceCancel">
            {{ $t('packagingOperation.performanceCancel') }}
          </Button>
          <Button type="primary" @click="handlePerformanceRegister">
            {{ $t('packagingOperation.performanceRegister') }}
          </Button>
        </template>
        <template #cartState="{ row }">
          {{
            Number(row?.state) === 2
              ? $t('packagingOperation.statusProducing')
              : $t('packagingOperation.statusWaiting')
          }}
        </template>
      </Grid>
    </div>

    <!-- 3. 底部：左连接设置（预留）/ 右按钮 -->
    <Row :gutter="16">
      <Col :xs="24" :lg="12">
        <Button @click="openConnectModal">
          {{ $t('packagingOperation.connectTitle') }}
        </Button>
      </Col>
      <Col
        :xs="24"
        :lg="12"
        class="flex items-end justify-end gap-2 text-right"
      >
        <Button @click="handleMaterialLoad" class="mr-2">
          {{ $t('packagingOperation.materialLoad') }}
        </Button>
        <Button type="primary" @click="handleStart" class="mr-2">
          {{ $t('packagingOperation.start') }}
        </Button>
        <Button type="primary" danger @click="handleEnd" class="mr-2">
          {{ $t('packagingOperation.end') }}
        </Button>
      </Col>
    </Row>

    <!-- 连接设置模态框（打印机选择，功能预留） -->
    <Modal
      v-model:open="connectModalVisible"
      :title="$t('packagingOperation.connectTitle')"
      @ok="handleConnectOk"
      @cancel="handleConnectCancel"
    >
      <div class="text-xs text-muted-foreground mb-3">
        {{ $t('packagingOperation.connectDesc') }}
      </div>
      <Form layout="vertical">
        <Form.Item :label="$t('packagingOperation.printer')">
          <Select
            v-model:value="selectedPrinter"
            :placeholder="$t('packagingOperation.printerPlaceholder')"
            allow-clear
          />
        </Form.Item>
      </Form>
    </Modal>

    <!-- 测量记录抽屉：点击指标数弹出，内嵌重量测量列表并初始选中当前子产线 -->
    <Drawer
      v-model:open="measureDrawerVisible"
      :title="$t('packagingOperation.measureRecordTitle')"
      :body-style="{ padding: 0 }"
      height="100%"
      destroy-on-close
      placement="top"
      :push="false"
    >
      <WeightMeasureList
        :function-id="props.functionId"
        :workstation-code="props.workstationCode"
        :process-code="props.processCode"
        :line-code="form.lineCode"
        v-if="measureDrawerVisible"
      />
    </Drawer>

    <!-- 材料加载抽屉（公共组件） -->
    <MaterialLoadingDrawer ref="materialDrawerRef" />

    <!-- 工单选择抽屉 -->
    <WorkSheetSelectDrawer
      ref="workSheetDrawerRef"
      @select="handleWorkSheetSelected"
    />
  </div>
</template>
