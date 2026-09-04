<script setup lang="ts">
/**
 * [INPUT]: 依赖 vxe-table 适配器（VxeGridProps/useVbenVxeGrid）、#/api 的 getPlanWorkSheet/searchSubLine/searchWeightRecord/selectLineByWorkSheetId 接口、#/locales 国际化、ant-design-vue 组件，以及 PackagingMaterialDrawer 包装材料加载/卸载抽屉。
 * [OUTPUT]: 对外提供 packagingProgress 包装工序步骤组件（步骤组件标准入参 functionId/bindingId/worksheetCode/equipCode/workstationCode/processType）。
 * [POS]: 属于包装工序步骤组件，负责子产线/工单查询、左右两栏工单信息展示、称重记录列表与工作开始/结束控制。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-09-02 00:00:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, reactive, ref } from 'vue';

import {
  Button,
  Col,
  Form,
  FormItem,
  Input,
  message,
  Row,
  Select,
  Textarea,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getPlanWorkSheet,
  searchSubLine,
  searchWeightRecord,
  selectLineByWorkSheetId,
} from '#/api';
import { $t } from '#/locales';
import PackagingMaterialDrawer from '#/util/component/PackagingMaterialDrawer.vue';

/**
 * 工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
const props = defineProps({
  functionId: { type: Number, default: 0 },
  workstationCode: { type: String, default: '' },
  /** 工序：由外部传入 */
  processType: { type: Number, default: 4 },
  /** 工序编号，由外部传入 */
  processCode: { type: String, default: '' },
});

// region 1. 查询条件：子产线 / 工单
// 查询表单：子产线编码 + 工单 id
const form = reactive<any>({
  subLine: undefined,
  workOrder: undefined,
});

/** 子产线下拉选项（接口获取） */
const subLineOptions = ref<{ label: string; value: string }[]>([]);
/** 工单下拉选项（根据子产线查询） */
const workOrderOptions = ref<{ label: string; value: number }[]>([]);

/**
 * 加载子产线下拉选项，仅页面加载时执行一次。
 * @returns {Promise<void>} 无返回值，加载完成后回填 subLineOptions。
 * @throws 接口失败时由统一错误处理层提示，此处不额外捕获。
 * @since 2026-09-02 00:00:00
 */
function loadSubLines() {
  return searchSubLine({ processType: props.processType }).then((res: any) => {
    const list = res?.list ?? [];
    subLineOptions.value = list.map((item: any) => ({
      label: `${item.subLineCode}(${item.subLineName})`,
      value: item.subLineCode,
    }));
  });
}

/**
 * 根据当前子产线加载工单下拉选项。
 * @returns {Promise<void>} 无返回值，子产线为空时清空选项，否则回填 workOrderOptions。
 * @throws 接口失败时由统一错误处理层提示，此处不额外捕获。
 * @since 2026-09-02 00:00:00
 */
function loadWorkOrders() {
  const subLineCode = form.subLine;
  if (!subLineCode) {
    workOrderOptions.value = [];
    return Promise.resolve();
  }
  return getPlanWorkSheet(subLineCode).then((res: any) => {
    workOrderOptions.value = (res ?? []).map((item: any) => ({
      label: item.workSheetCode,
      value: item.id,
    }));
  });
}

/**
 * 子产线变更处理：清空已选工单、重置面板并重新加载工单下拉。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function handleSubLineChange() {
  form.workOrder = undefined;
  resetPanels();
  loadWorkOrders();
}

/**
 * 工单选择处理：查询对应产线信息填充左右两栏面板，并加载称重记录。
 * @param {number} workSheetId - 选中的工单 id，空值时重置面板。
 * @returns {void} 无返回值。
 * @throws 接口失败时由统一错误处理层提示，此处不额外捕获。
 * @since 2026-09-02 00:00:00
 */
function handleWorkOrderChange(workSheetId: any) {
  if (!workSheetId) {
    resetPanels();
    return;
  }
  selectLineByWorkSheetId(workSheetId).then((res: any) => {
    const lines = res ?? [];
    fillPanel(leftPanel, lines[0]);
    fillPanel(rightPanel, lines[1]);
    loadMaterials();
  });
}
// endregion

// region 2. 左右两栏面板
/**
 * 创建面板初始状态：含表单、指标数与工作状态。
 * @returns {object} 面板响应式状态对象。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function createPanel() {
  return reactive<any>({
    form: {
      workOrder: '',
      subLine: '',
      product: undefined,
      line: undefined,
      remark: '',
      inkjetCodeA: '',
      inkjetCodeB: '',
      inkjetCodeC: '',
    },
    metrics: {
      instructionQty: 0,
      productionQty: 0,
      stackQty: 0,
      subLineProductionQty: 0,
    },
    workStatus: 'idle',
  });
}

// 左栏面板：完整可操作（工单信息、指标、材料列表）
const leftPanel = createPanel();
// 右栏面板：结构同左栏，仅底部三个按钮可操作
const rightPanel = createPanel();

// 指标卡片配置：key 与 title，数值从面板 metrics 中取值
const metricItems = [
  { key: 'targetQty', title: $t('packagingProgress.instructionQty') },
  { key: 'productionQty', title: $t('packagingProgress.productionQty') },
  { key: 'palletizingQty', title: $t('packagingProgress.stackQty') },
  {
    key: 'subLineProductionQtyA',
    title: $t('packagingProgress.subLineProductionQty'),
  },
];

/** 喷码字段：第一个/第二个/第三个喷码 */
const inkjetItems = ['inkjetCodeA', 'inkjetCodeB', 'inkjetCodeC'];

/**
 * 用工单返回的一行数据填充面板表单。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @param {object} line - 产线/工单接口返回的行数据，为空时重置面板。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function fillPanel(panel: any, line: any) {
  if (!line) {
    resetPanel(panel);
    return;
  }
  // 展开全部字段，仅对字段名不一致的映射专门覆盖
  panel.form = {
    ...line,
    workOrder: line.workSheetCode ?? '',
    subLine: line.subLineCode ?? line.subLineName ?? '',
    product: line.productName ?? '',
    line: line.lineName ?? '',
    remark: line.remark ?? '',
  };
}

/**
 * 重置单个面板到初始状态（清空表单与指标，工作状态置为 idle）。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function resetPanel(panel: any) {
  // 整体重置 form，与 createPanel 初始结构保持一致（同时清掉展开后残留的字段）
  panel.form = {
    workOrder: '',
    subLine: '',
    product: undefined,
    line: undefined,
    remark: '',
    inkjetCodeA: '',
    inkjetCodeB: '',
    inkjetCodeC: '',
  };
  panel.metrics.instructionQty = 0;
  panel.metrics.productionQty = 0;
  panel.metrics.stackQty = 0;
  panel.metrics.subLineProductionQty = 0;
  panel.workStatus = 'idle';
}

/**
 * 重置左右两栏面板到初始状态。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function resetPanels() {
  resetPanel(leftPanel);
  resetPanel(rightPanel);
}
// endregion

// region 3. 加载称重记录列表
/**
 * 生成称重记录查询函数：面板无工单 id 时返回空数据。
 * @param {object} panel - 目标面板（leftPanel/rightPanel），用于读取 form.id。
 * @returns {function} 查询函数，供 vxe-grid proxyConfig 调用，返回 { items, total }。
 * @throws 接口失败时由统一错误处理层提示，此处不额外捕获。
 * @since 2026-09-02 00:00:00
 */
function createWeightQuery(panel: any) {
  return () => {
    if (!panel.form.id) {
      return Promise.resolve({ items: [], total: 0 });
    }
    return searchWeightRecord(panel.form.id).then((res: any) => {
      const list = res?.list ?? res ?? [];
      return { items: list, total: list.length };
    });
  };
}

// 称重记录网格基础配置：左右两栏共用，按面板查询函数差异化
const baseGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      field: 'materialName',
      title: $t('packagingProgress.colMaterialName'),
      minWidth: 160,
    },
    {
      field: 'actualWt',
      title: $t('packagingProgress.colLoadQty'),
      minWidth: 120,
    },
    { field: 'unit', title: $t('packagingProgress.colUnit'), minWidth: 90 },
    {
      field: 'palletLabel',
      title: $t('packagingProgress.colEquipmentName'),
      minWidth: 160,
    },
  ],
  height: 360,
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [LeftGrid, leftGridApi] = useVbenVxeGrid({
  gridOptions: {
    ...baseGridOptions,
    proxyConfig: {
      ajax: { query: createWeightQuery(leftPanel) },
    },
  },
});

/** 右栏表格：只读展示，不可操作 */
const [RightGrid, rightGridApi] = useVbenVxeGrid({
  gridOptions: {
    ...baseGridOptions,
    proxyConfig: {
      ajax: { query: createWeightQuery(rightPanel) },
    },
  },
});

/**
 * 重新加载左右两栏的称重记录列表。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function loadMaterials() {
  leftGridApi.reload();
  rightGridApi.reload();
}
// endregion

// region 4. 按钮：材料加载 / 工作开始 / 工作结束
// 包装材料加载/卸载抽屉引用（PackagingMaterialDrawer）
const materialDrawerRef = ref();

/**
 * 打开材料加载抽屉，透传面板表单数据。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function handleMaterialLoad(panel: any) {
  materialDrawerRef.value.open(panel?.form);
}

/**
 * 开始工作：将面板工作状态置为 running，已开始则提示。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @returns {void} 无返回值，成功后弹出成功提示。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function handleWorkStart(panel: any) {
  if (panel.workStatus === 'running') {
    message.warning($t('packagingProgress.alreadyRunning'));
    return;
  }
  panel.workStatus = 'running';
  message.success($t('packagingProgress.startSuccess'));
}

/**
 * 结束工作：将面板工作状态置为 idle，未开始则提示。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @returns {void} 无返回值，成功后弹出成功提示。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function handleWorkEnd(panel: any) {
  if (panel.workStatus === 'idle') {
    message.warning($t('packagingProgress.notStarted'));
    return;
  }
  panel.workStatus = 'idle';
  message.success($t('packagingProgress.endSuccess'));
}
// endregion

onMounted(() => {
  loadMaterials();
  loadSubLines();
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="text-lg font-bold">{{ $t('packagingProgress.title') }}</div>

    <!-- 左右两栏布局 -->
    <Row :gutter="16" class="items-stretch">
      <!-- 左栏：完整可操作 -->
      <Col :xs="24" :md="12" class="mb-4 md:mb-0">
        <div class="flex flex-col gap-4">
          <!-- 1. 工单信息表单 -->
          <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
            <div class="mb-3 font-bold">
              {{ $t('packagingProgress.formTitle') }}
            </div>
            <Form
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 20 }"
              :model="form"
            >
              <FormItem :label="$t('packagingProgress.subLine')">
                <Select
                  v-model:value="form.subLine"
                  :options="subLineOptions"
                  :placeholder="$t('packagingProgress.subLinePlaceholder')"
                  allow-clear
                  @change="handleSubLineChange"
                />
              </FormItem>
              <FormItem :label="$t('packagingProgress.workOrder')">
                <Select
                  v-model:value="form.workOrder"
                  :options="workOrderOptions"
                  :placeholder="$t('packagingProgress.workOrderPlaceholder')"
                  allow-clear
                  @change="handleWorkOrderChange"
                />
              </FormItem>
              <FormItem :label="$t('packagingProgress.product')">
                <Input
                  v-model:value="leftPanel.form.product"
                  :placeholder="$t('packagingProgress.productPlaceholder')"
                  disabled
                />
              </FormItem>
              <FormItem :label="$t('packagingProgress.line')">
                <Input
                  v-model:value="leftPanel.form.line"
                  :placeholder="$t('packagingProgress.linePlaceholder')"
                  disabled
                />
              </FormItem>
              <FormItem :label="$t('packagingProgress.workOrderRemark')">
                <Textarea
                  v-model:value="leftPanel.form.remark"
                  :placeholder="$t('packagingProgress.remarkPlaceholder')"
                  allow-clear
                  disabled
                />
              </FormItem>
              <FormItem :label="$t('packagingProgress.printCode')">
                <Row :gutter="16">
                  <Col
                    v-for="key in inkjetItems"
                    :key="key"
                    :xs="8"
                    :md="8"
                    class="mb-3"
                  >
                    <div
                      class="flex h-full w-full items-center justify-center rounded-md border border-border bg-muted/40 px-2 py-4"
                    >
                      <div
                        class="w-full truncate text-center text-sm text-foreground"
                      >
                        {{ leftPanel.form[key] || '-' }}
                      </div>
                    </div>
                  </Col>
                </Row>
              </FormItem>
            </Form>
          </div>

          <!-- 2. 指标数：标题在上、数字在下 -->
          <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
            <div class="mb-3 font-bold">
              {{ $t('packagingProgress.metrics') }}
            </div>
            <Row :gutter="16">
              <Col
                v-for="item in metricItems"
                :key="item.key"
                :xs="12"
                :sm="12"
                :md="6"
                class="mb-3"
              >
                <div
                  class="flex h-full flex-col items-center justify-center rounded-md border border-border bg-muted/40 py-4"
                >
                  <div class="text-sm text-muted-foreground">
                    {{ item.title }}
                  </div>
                  <div class="mt-1 text-2xl font-bold text-primary">
                    {{ leftPanel.metrics[item.key] || 0 }}
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          <!-- 3. 加载材料列表 -->
          <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
            <div class="mb-2 font-bold">
              {{ $t('packagingProgress.materialList') }}
            </div>
            <LeftGrid>
              <template #toolbar-tools></template>
            </LeftGrid>
          </div>

          <!-- 4. 右对齐按钮 -->
          <div class="flex justify-end gap-2">
            <Button @click="handleMaterialLoad(leftPanel)">
              {{ $t('packagingProgress.materialLoad') }}
            </Button>
            <Button type="primary" @click="handleWorkStart(leftPanel)">
              {{ $t('packagingProgress.workStart') }}
            </Button>
            <Button type="primary" danger @click="handleWorkEnd(leftPanel)">
              {{ $t('packagingProgress.workEnd') }}
            </Button>
          </div>
        </div>
      </Col>

      <!-- 右栏：复制结构，仅底部三个按钮可操作 -->
      <Col :xs="24" :md="12">
        <div class="flex flex-col gap-4">
          <!-- 1. 工单信息表单（只读） -->
          <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
            <div class="mb-3 font-bold">
              {{ $t('packagingProgress.formTitle') }}
            </div>
            <Form
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 20 }"
              :model="rightPanel.form"
            >
              <FormItem :label="$t('packagingProgress.subLine')">
                <Select
                  v-model:value="rightPanel.form.subLine"
                  :options="subLineOptions"
                  :placeholder="$t('packagingProgress.subLinePlaceholder')"
                  disabled
                />
              </FormItem>
              <FormItem :label="$t('packagingProgress.workOrder')">
                <Input
                  v-model:value="rightPanel.form.workOrder"
                  :placeholder="$t('packagingProgress.workOrderPlaceholder')"
                  disabled
                />
              </FormItem>
              <FormItem :label="$t('packagingProgress.product')">
                <Input
                  v-model:value="rightPanel.form.product"
                  :placeholder="$t('packagingProgress.productPlaceholder')"
                  disabled
                />
              </FormItem>
              <FormItem :label="$t('packagingProgress.line')">
                <Input
                  v-model:value="rightPanel.form.line"
                  :placeholder="$t('packagingProgress.linePlaceholder')"
                  disabled
                />
              </FormItem>
              <FormItem :label="$t('packagingProgress.workOrderRemark')">
                <Textarea
                  v-model:value="rightPanel.form.remark"
                  :placeholder="$t('packagingProgress.remarkPlaceholder')"
                  disabled
                />
              </FormItem>
              <FormItem :label="$t('packagingProgress.printCode')">
                <Row :gutter="16">
                  <Col
                    v-for="key in inkjetItems"
                    :key="key"
                    :xs="8"
                    :md="8"
                    class="mb-3"
                  >
                    <div
                      class="flex h-full w-full items-center justify-center rounded-md border border-border bg-muted/40 px-2 py-4"
                    >
                      <div
                        class="w-full truncate text-center text-sm text-foreground"
                      >
                        {{ rightPanel.form[key] || '-' }}
                      </div>
                    </div>
                  </Col>
                </Row>
              </FormItem>
            </Form>
          </div>

          <!-- 2. 指标数：标题在上、数字在下 -->
          <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
            <div class="mb-3 font-bold">
              {{ $t('packagingProgress.metrics') }}
            </div>
            <Row :gutter="16">
              <Col
                v-for="item in metricItems"
                :key="item.key"
                :xs="12"
                :sm="12"
                :md="6"
                class="mb-3"
              >
                <div
                  class="flex h-full flex-col items-center justify-center rounded-md border border-border bg-muted/40 py-4"
                >
                  <div class="text-sm text-muted-foreground">
                    {{ item.title }}
                  </div>
                  <div class="mt-1 text-2xl font-bold text-primary">
                    {{ rightPanel.metrics[item.key] || 0 }}
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          <!-- 3. 加载材料列表（只读，禁止交互） -->
          <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
            <div class="mb-2 font-bold">
              {{ $t('packagingProgress.materialList') }}
            </div>
            <RightGrid>
              <template #toolbar-tools></template>
            </RightGrid>
          </div>

          <!-- 4. 右对齐按钮（可操作） -->
          <div class="flex justify-end gap-2">
            <Button @click="handleMaterialLoad(rightPanel)">
              {{ $t('packagingProgress.materialLoad') }}
            </Button>
            <Button type="primary" @click="handleWorkStart(rightPanel)">
              {{ $t('packagingProgress.workStart') }}
            </Button>
            <Button type="primary" danger @click="handleWorkEnd(rightPanel)">
              {{ $t('packagingProgress.workEnd') }}
            </Button>
          </div>
        </div>
      </Col>
    </Row>

    <!-- 5. 包装材料加载/卸载抽屉（公共组件） -->
    <PackagingMaterialDrawer ref="materialDrawerRef" @refresh="loadMaterials" />
  </div>
</template>
