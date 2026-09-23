<script setup lang="ts">
/**
 * [INPUT]: 依赖 vxe-table 适配器（VxeGridProps/useVbenVxeGrid）、#/api 的 getPlanWorkSheet/palletizTransfer/searchSubLine/searchWeightRecordList/selectLineByWorkSheetId 接口、#/locales 国际化、ant-design-vue 组件，以及 PackagingMaterialDrawer 包装材料加载/卸载抽屉。
 * [OUTPUT]: 对外提供 packagingProgress 包装工序步骤组件（步骤组件标准入参 functionId/bindingId/worksheetCode/equipCode/workstationCode/processType）。
 * [POS]: 属于包装工序步骤组件，负责子产线/工单查询、左右两栏工单信息展示、称重记录列表、工作开始/结束控制与喷码传输弹窗。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-09-21 00:00:00
 */
import type { Rule } from 'ant-design-vue/es/form';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, reactive, ref } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  CheckboxGroup,
  Col,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Radio,
  RadioGroup,
  Row,
  Select,
  Switch,
  Textarea,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getPlanWorkSheet,
  palletizTransfer,
  searchSubLine,
  searchWeightRecordList,
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
const workOrderOptions = ref<{ label: string; state: any; value: number }[]>(
  [],
);
/** 工单对应的子产线/产线原始数据，作为喷码传输弹窗的子产线下拉选项来源 */
const lineList = ref<any[]>([]);

/** 工单状态指示灯：state 为 1 时绿色，其余（含未选中/未开始）灰色 */
const WORK_ORDER_RUNNING_STATE = '1';

/**
 * 判断工单状态值是否为「运行中」（state === 1）。
 * @param {any} state - 工单状态值，兼容数字与字符串。
 * @returns {boolean} 为 1 返回 true，否则返回 false。
 * @throws 不主动抛出异常。
 * @since 2026-09-21 00:00:00
 */
function isRunningState(state: any) {
  return String(state) === WORK_ORDER_RUNNING_STATE;
}

/** 顶部查询区当前选中工单的状态值（取工单下拉原始数据） */
const selectedWorkOrderState = computed(() => {
  const hit = workOrderOptions.value.find(
    (item: any) => item.value === form.workOrder,
  );
  return hit?.state;
});

/**
 * 取面板工单的状态指示灯颜色类：state 为 1 显示绿色实心圆，否则灰色。
 * 面板数据来自 selectLineByWorkSheetId，取不到时回退到顶部选中工单的状态。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @returns {string} 圆点背景色类名（bg-green-500 / bg-gray-400）。
 * @throws 不主动抛出异常。
 * @since 2026-09-21 00:00:00
 */
function getStateDotClass(panel: any) {
  const state = panel?.form?.state ?? selectedWorkOrderState.value;
  return isRunningState(state) ? 'bg-green-500' : 'bg-gray-400';
}

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
      // 保留工单状态，供状态指示灯（state === 1 绿色）使用
      state: item.state,
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
    lineList.value = lines;
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
    /** 称重记录包装类型筛选（3单包/4多包/5料包），默认全选 */
    packTypes: [3, 4, 5] as number[],
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
  panel.packTypes = [3, 4, 5];
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
  // 清空子产线原始数据，避免传输弹窗残留上次的子产线选项
  lineList.value = [];
}
// endregion

// region 3. 加载称重记录列表
/** 包装类型多选选项：3 单包 / 4 多包 / 5 料包 */
const packTypeOptions = [
  { label: $t('packagingProgress.packTypeSingle'), value: 3 },
  { label: $t('packagingProgress.packTypeMulti'), value: 4 },
  { label: $t('packagingProgress.packTypeBag'), value: 5 },
];

/**
 * 生成称重记录查询函数：面板无工单 id 时返回空数据。
 * @param {object} panel - 目标面板（leftPanel/rightPanel），用于读取 form.id 与 packTypes 筛选。
 * @returns {function} 查询函数，供 vxe-grid proxyConfig 调用，返回 { items, total }。
 * @throws 接口失败时由统一错误处理层提示，此处不额外捕获。
 * @since 2026-09-08 00:00:00
 */
function createWeightQuery(panel: any) {
  return () => {
    if (!panel.form.id) {
      return Promise.resolve({ items: [], total: 0 });
    }
    const params: any = { id: panel.form.id };
    // 包装类型筛选：多选值转逗号分隔字符串（如 "3,4,5"），未选时不过滤
    const type = (panel.packTypes ?? []).join(',');
    if (type) {
      params.type = type;
    }
    return searchWeightRecordList(params).then((res: any) => {
      const list = res?.list ?? res ?? [];
      return { items: list, total: list.length };
    });
  };
}

/**
 * 包装类型筛选变化后重新加载对应面板的称重记录列表。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @param {object} gridApi - 面板对应表格的 api（leftGridApi/rightGridApi）。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-09-08 00:00:00
 */
function handlePackTypeChange(panel: any, gridApi: any) {
  if (!panel.form.id) {
    return;
  }
  gridApi.reload();
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
  height: 260,
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

// region 5. 喷码传输弹窗（子产线 / 工单 / 包装类型 / 是否初始化）
/** 传输弹窗显示状态 */
const transferVisible = ref(false);
/** 传输表单实例，用于提交前校验 */
const transferFormRef = ref<any>();
/** 传输提交中状态，控制弹窗确认按钮 loading */
const transferSubmitting = ref(false);
/** 传输表单数据：isInit 为开关布尔值，提交时转换为 1（是）/ 2（否） */
const transferForm = ref<any>({
  subLineCode: undefined,
  workSheetCode: '',
  /** 包装类型：单包 1 / 多包 2 / 箱包 3 / 全部 4 */
  type: 1,
  isInit: false,
});

/** 传输弹窗子产线下拉选项：取自工单对应子产线接口数据，并携带计划开始时间 */
const transferSubLineOptions = computed(() =>
  (lineList.value ?? []).map((line: any) => ({
    label: `${line.lineCode}(${line.lineName})`,
    value: line.lineCode,
    planDateStart: line.planDateStart,
  })),
);

/** 当前选中子产线对应的计划开始时间，以文本形式展示在工单号后面 */
const selectedPlanDateStart = computed(() => {
  const hit = transferSubLineOptions.value.find(
    (item: any) => item.value === transferForm.value.subLineCode,
  );
  return hit?.planDateStart ?? '';
});

/** 传输表单校验规则 */
const transferRules: Record<string, Rule[]> = {
  subLineCode: [
    {
      required: true,
      message: $t('common.pleaseSelect'),
      trigger: 'change',
    },
  ],
  workSheetCode: [
    {
      required: true,
      message: $t('common.pleaseEnter'),
      trigger: 'change',
    },
  ],
  type: [
    {
      required: true,
      message: $t('common.pleaseSelect'),
      trigger: 'change',
    },
  ],
};

/**
 * 取面板工单号，取不到时回退到顶部下拉选中工单的工单号。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @returns {string} 工单号，均取不到时返回空字符串。
 * @throws 不主动抛出异常。
 * @since 2026-09-21 00:00:00
 */
function resolveWorkSheetCode(panel: any) {
  if (panel?.form?.workSheetCode) {
    return panel.form.workSheetCode;
  }
  const hit = workOrderOptions.value.find(
    (item: any) => item.value === form.workOrder,
  );
  return hit?.label ?? '';
}

/**
 * 打开喷码传输弹窗：工单号由当前面板带入，子产线默认选中当前面板的子产线。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @returns {void} 无返回值，未选择工单时提示并中断。
 * @throws 不主动抛出异常。
 * @since 2026-09-21 00:00:00
 */
function openTransfer(panel: any) {
  const workSheetCode = resolveWorkSheetCode(panel);
  if (!workSheetCode) {
    message.warning($t('packagingProgress.workOrderNotSelected'));
    return;
  }
  transferForm.value = {
    subLineCode: undefined,
    workSheetCode,
    type: 1,
    isInit: false,
  };
  transferVisible.value = true;
}

/**
 * 关闭喷码传输弹窗并清空全部状态，保证下次打开为初始状态。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-09-21 00:00:00
 */
function handleTransferClose() {
  transferVisible.value = false;
  transferSubmitting.value = false;
  transferForm.value = {
    subLineCode: undefined,
    workSheetCode: '',
    type: 1,
    isInit: false,
  };
}

/**
 * 提交喷码传输：校验通过后调用 palletizTransfer。
 * isInit 为 true 提交 1、false 提交 2。
 * @returns {void} 无返回值。
 * @throws 校验失败时静默返回；接口失败时提示错误信息。
 * @since 2026-09-21 00:00:00
 */
function handleTransferSubmit() {
  transferFormRef.value
    ?.validate()
    .then(() => {
      transferSubmitting.value = true;
      palletizTransfer({
        isInit: transferForm.value.isInit ? 1 : 2,
        subLineCode: transferForm.value.subLineCode,
        type: transferForm.value.type,
        workSheetCode: transferForm.value.workSheetCode,
      })
        .then(() => {
          message.success($t('common.successfulOperation'));
          handleTransferClose();
        })
        .catch(() => {
          message.error($t('common.operationFailure'));
        })
        .finally(() => {
          transferSubmitting.value = false;
        });
    })
    .catch(() => {
      // 校验失败时由表单自身提示，无需额外处理
    });
}
// endregion

onMounted(() => {
  loadMaterials();
  loadSubLines();
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- 左右两栏布局 -->
    <Row :gutter="16" class="items-stretch">
      <!-- 左栏：完整可操作 -->
      <Col :xs="24" :md="12" class="mb-4 md:mb-0">
        <div class="flex flex-col gap-4">
          <!-- 1. 工单信息表单 -->
          <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
            <Form
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 20 }"
              :model="form"
            >
              <FormItem :label="$t('packagingProgress.subLine')" class="mb-2!">
                <div class="flex items-center gap-2">
                  <Select
                    v-model:value="form.subLine"
                    :options="subLineOptions"
                    :placeholder="$t('packagingProgress.subLinePlaceholder')"
                    allow-clear
                    class="flex-1"
                    @change="handleSubLineChange"
                  />
                  <!-- 工单状态指示灯：state === 1 绿色，其余灰色 -->
                  <span
                    class="size-3 shrink-0 rounded-full"
                    :class="getStateDotClass(leftPanel)"
                  ></span>
                </div>
              </FormItem>
              <FormItem
                :label="$t('packagingProgress.workOrder')"
                class="mb-2!"
              >
                <div class="flex items-center gap-2">
                  <Select
                    v-model:value="form.workOrder"
                    :options="workOrderOptions"
                    :placeholder="$t('packagingProgress.workOrderPlaceholder')"
                    allow-clear
                    class="flex-1"
                    @change="handleWorkOrderChange"
                  />
                  <!-- 喷码传输：弹窗选择子产线/区域代码/是否初始化后提交 -->
                  <Tooltip :title="$t('packagingProgress.inkjetTransfer')">
                    <Button
                      type="primary"
                      shape="circle"
                      class="shrink-0"
                      @click="openTransfer(leftPanel)"
                    >
                      <Icon
                        icon="mdi:transfer-right"
                        class="inline-block align-middle text-lg"
                      />
                    </Button>
                  </Tooltip>
                  <!-- 工单状态指示灯：state === 1 绿色，其余灰色 -->
                  <span
                    class="size-3 shrink-0 rounded-full"
                    :class="getStateDotClass(leftPanel)"
                  ></span>
                </div>
              </FormItem>
              <FormItem :label="$t('packagingProgress.product')" class="mb-2!">
                <Input
                  v-model:value="leftPanel.form.product"
                  :placeholder="$t('packagingProgress.productPlaceholder')"
                  disabled
                />
              </FormItem>
              <FormItem :label="$t('packagingProgress.line')" class="mb-2!">
                <Input
                  v-model:value="leftPanel.form.line"
                  :placeholder="$t('packagingProgress.linePlaceholder')"
                  disabled
                />
              </FormItem>
              <FormItem
                :label="$t('packagingProgress.workOrderRemark')"
                class="mb-2!"
              >
                <Textarea
                  v-model:value="leftPanel.form.remark"
                  :placeholder="$t('packagingProgress.remarkPlaceholder')"
                  allow-clear
                  disabled
                />
              </FormItem>
              <FormItem
                :label="$t('packagingProgress.printCode')"
                class="mb-2!"
              >
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
            <!-- <div class="mb-2 font-bold">
              {{ $t('packagingProgress.materialList') }}
            </div> -->
            <LeftGrid>
              <template #toolbar-tools>
                <CheckboxGroup
                  v-model:value="leftPanel.packTypes"
                  :options="packTypeOptions"
                  @change="handlePackTypeChange(leftPanel, leftGridApi)"
                />
              </template>
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
            <Form
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 20 }"
              :model="rightPanel.form"
            >
              <FormItem :label="$t('packagingProgress.subLine')" class="mb-2!">
                <div class="flex items-center gap-2">
                  <Select
                    v-model:value="rightPanel.form.subLine"
                    :options="subLineOptions"
                    :placeholder="$t('packagingProgress.subLinePlaceholder')"
                    disabled
                    class="flex-1"
                  />
                  <!-- 工单状态指示灯：state === 1 绿色，其余灰色 -->
                  <span
                    class="size-3 shrink-0 rounded-full"
                    :class="getStateDotClass(rightPanel)"
                  ></span>
                </div>
              </FormItem>
              <FormItem
                :label="$t('packagingProgress.workOrder')"
                class="mb-2!"
              >
                <div class="flex items-center gap-2">
                  <Input
                    v-model:value="rightPanel.form.workOrder"
                    :placeholder="$t('packagingProgress.workOrderPlaceholder')"
                    disabled
                    class="flex-1"
                  />
                  <!-- 喷码传输：弹窗选择子产线/区域代码/是否初始化后提交 -->
                  <Tooltip :title="$t('packagingProgress.inkjetTransfer')">
                    <Button
                      type="primary"
                      shape="circle"
                      class="shrink-0"
                      @click="openTransfer(rightPanel)"
                    >
                      <Icon
                        icon="mdi:transfer-right"
                        class="inline-block align-middle text-lg"
                      />
                    </Button>
                  </Tooltip>
                  <!-- 工单状态指示灯：state === 1 绿色，其余灰色 -->
                  <span
                    class="size-3 shrink-0 rounded-full"
                    :class="getStateDotClass(rightPanel)"
                  ></span>
                </div>
              </FormItem>
              <FormItem :label="$t('packagingProgress.product')" class="mb-2!">
                <Input
                  v-model:value="rightPanel.form.product"
                  :placeholder="$t('packagingProgress.productPlaceholder')"
                  disabled
                />
              </FormItem>
              <FormItem :label="$t('packagingProgress.line')" class="mb-2!">
                <Input
                  v-model:value="rightPanel.form.line"
                  :placeholder="$t('packagingProgress.linePlaceholder')"
                  disabled
                />
              </FormItem>
              <FormItem
                :label="$t('packagingProgress.workOrderRemark')"
                class="mb-2!"
              >
                <Textarea
                  v-model:value="rightPanel.form.remark"
                  :placeholder="$t('packagingProgress.remarkPlaceholder')"
                  disabled
                />
              </FormItem>
              <FormItem
                :label="$t('packagingProgress.printCode')"
                class="mb-2!"
              >
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
            <!-- <div class="mb-2 font-bold">
              {{ $t('packagingProgress.materialList') }}
            </div> -->
            <RightGrid>
              <template #toolbar-tools>
                <CheckboxGroup
                  v-model:value="rightPanel.packTypes"
                  :options="packTypeOptions"
                  @change="handlePackTypeChange(rightPanel, rightGridApi)"
                />
              </template>
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

    <!-- 6. 喷码传输弹窗 -->
    <Modal
      v-model:open="transferVisible"
      :title="$t('packagingProgress.inkjetTransfer')"
      :ok-text="$t('common.confirm')"
      :cancel-text="$t('common.cancel')"
      :confirm-loading="transferSubmitting"
      :destroy-on-close="true"
      @ok="handleTransferSubmit"
      @cancel="handleTransferClose"
    >
      <Form
        ref="transferFormRef"
        :model="transferForm"
        :rules="transferRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <FormItem :label="$t('packagingProgress.subLine')" name="subLineCode">
          <Select
            v-model:value="transferForm.subLineCode"
            :options="transferSubLineOptions"
            :placeholder="$t('packagingProgress.subLinePlaceholder')"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('packagingProgress.workOrder')"
          name="workSheetCode"
        >
          <div class="flex items-center gap-2">
            <Input
              v-model:value="transferForm.workSheetCode"
              :placeholder="$t('packagingProgress.workOrderPlaceholder')"
              disabled
              class="flex-1"
            />
            <!-- 子产线对应的计划开始时间，文本展示 -->
            <span class="shrink-0 text-sm text-muted-foreground">
              {{ selectedPlanDateStart }}
            </span>
          </div>
        </FormItem>
        <FormItem :label="$t('packagingProgress.packType')" name="type">
          <RadioGroup v-model:value="transferForm.type">
            <Radio :value="1">
              {{ $t('packagingProgress.packTypeSingle') }}
            </Radio>
            <Radio :value="2">
              {{ $t('packagingProgress.packTypeMulti') }}
            </Radio>
            <Radio :value="3">
              {{ $t('packagingProgress.packTypeBox') }}
            </Radio>
            <Radio :value="4">
              {{ $t('packagingProgress.packTypeAll') }}
            </Radio>
          </RadioGroup>
        </FormItem>
        <FormItem :label="$t('packagingProgress.isInit')" name="isInit">
          <Switch v-model:checked="transferForm.isInit" />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
