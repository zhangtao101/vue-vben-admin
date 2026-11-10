<script setup lang="ts">
/**
 * [INPUT]: 依赖 #/api 的 getPlanWorkSheet/palletizTransfer/searchSubLinePairsByProcessType/selectLineByWorkSheetId/updateStae 接口、#/store 的 usePackagingProgressStore（已选工单持久化）、#/locales 国际化、ant-design-vue 组件、PackagingMaterialDrawer 包装材料加载/卸载抽屉、SopImageDrawer SOP 图像抽屉、packagingProgressPanel 左右两栏面板子组件。
 * [OUTPUT]: 对外提供 packagingProgress 包装工序步骤组件（步骤组件标准入参 functionId/bindingId/worksheetCode/equipCode/workstationCode/processType）。
 * [POS]: 属于包装工序步骤组件，负责按工序类型加载左右子产线配对（左栏子产线可选、右栏取配对的 subBLine 字段）、左右两栏各自绑定子产线与工单选择（面板展示由 packagingProgressPanel 子组件渲染）、选中工单的本地持久化与再次进入时的自动恢复、工作开始/结束控制、喷码传输弹窗与 SOP 图像查看。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-11-09 00:00:00
 */
import type { Rule } from 'ant-design-vue/es/form';

import type { PackagingPanelKey } from '#/store';

import { computed, onMounted, reactive, ref } from 'vue';

import {
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
} from 'ant-design-vue';

import {
  getPlanWorkSheet,
  palletizTransfer,
  searchSubLinePairsByProcessType,
  selectLineByWorkSheetId,
  updateStae,
} from '#/api';
import { $t } from '#/locales';
import { usePackagingProgressStore } from '#/store';
import { queryWorkAuth } from '#/util';
import SopImageDrawer from '#/util/component/drawers/SopImageDrawer.vue';
import PackagingMaterialDrawer from '#/util/component/PackagingMaterialDrawer.vue';

import PackagingProgressPanel from './packagingProgressPanel.vue';

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

// region 按钮权限：作业平台开始/结束作业
/** 作业平台按钮权限菜单编码 */
const WORK_AUTH_MENU_CODE = 'JM_001';
/** 开始作业按钮权限名称 */
const AUTH_WORK_START = '开始';
/** 结束作业按钮权限名称 */
const AUTH_WORK_END = '结束';

/** 当前用户拥有的作业平台按钮权限名称集合 */
const workAuthNames = ref<string[]>([]);

/**
 * 判断当前用户是否拥有指定按钮权限。
 * @param {string} buttonName - 按钮权限名称
 * @returns {boolean} 拥有返回 true，否则返回 false
 * @throws 不主动抛出异常
 * @since 2026-10-15 00:00:00
 */
function hasWorkAuth(buttonName: string) {
  return workAuthNames.value.includes(buttonName);
}
// endregion

// region 1. 子产线 / 工单
/** 左栏子产线下拉选项（接口获取，左栏可切换） */
const subLineOptions = ref<{ label: string; value: string }[]>([]);
/** 左右子产线配对列表（subLineCode 左边子产线、subBLineCode 右边子产线） */
const subLineList = ref<any[]>([]);
/** 右栏子产线下拉选项（单条，随左栏选择联动，仅用于回显） */
const rightSubLineOptions = ref<{ label: string; value: string }[]>([]);
/** 左栏工单下拉选项（按左栏绑定的子产线查询） */
const leftWorkOrderOptions = ref<
  { label: string; state: any; value: number }[]
>([]);
/** 右栏工单下拉选项（按右栏绑定的子产线查询） */
const rightWorkOrderOptions = ref<
  { label: string; state: any; value: number }[]
>([]);
/** 右栏工单是否可自选：左栏查询返回两条（由左栏带出）时禁止自选 */
const rightWorkOrderSelectable = ref(true);
/** 工单对应的子产线/产线原始数据，作为喷码传输弹窗的子产线下拉选项来源 */
const lineList = ref<any[]>([]);

/** 工单状态指示灯：state 为 2 时绿色，其余（含未选中/未开始）灰色 */
const WORK_ORDER_RUNNING_STATE = '2';

/**
 * 判断工单状态值是否为「运行中」（state === 2）。
 * @param {any} state - 工单状态值，兼容数字与字符串。
 * @returns {boolean} 为 1 返回 true，否则返回 false。
 * @throws 不主动抛出异常。
 * @since 2026-09-21 00:00:00
 */
function isRunningState(state: any) {
  return String(state) === WORK_ORDER_RUNNING_STATE;
}

/**
 * 取面板工单选项引用。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @returns {object} 面板对应的工单下拉选项 ref（leftWorkOrderOptions/rightWorkOrderOptions）。
 * @throws 不主动抛出异常。
 * @since 2026-11-04 00:00:00
 */
function getWorkOrderOptionsRef(panel: any) {
  return panel === leftPanel ? leftWorkOrderOptions : rightWorkOrderOptions;
}

/**
 * 加载当前工序的左右子产线配对列表，仅页面加载时执行一次。
 * 调用 searchSubLinePairsByProcessType 按工序类型查询；
 * 无数据时提示当前工作站没有绑定子产线；
 * 默认绑定第一条配对（左栏取 subLine 字段，右栏取 subBLine 字段），
 * 工单下拉加载完成后，恢复上次选中的工单并重新查询相关信息。
 * @returns {Promise<void>} 无返回值，加载完成后回填 subLineList/subLineOptions 并绑定左右栏。
 * @throws 接口失败时由统一错误处理层提示，此处不额外捕获。
 * @since 2026-11-09 00:00:00
 */
function loadSubLines() {
  return searchSubLinePairsByProcessType(props.processType).then((res: any) => {
    const list = res ?? [];
    if (list.length === 0) {
      message.warning($t('packagingProgress.subLineNotBound'));
      return;
    }
    subLineList.value = list;
    // 左栏子产线可选，选项取每条配对的左边子产线
    subLineOptions.value = list.map((item: any) => ({
      label: `${item.subLineCode}(${item.subLineName})`,
      value: item.subLineCode,
    }));
    // 默认绑定第一条配对
    bindSubLinePair(list[0]);
    // 两栏工单下拉加载完成后，恢复上次选中的工单并重新查询相关信息
    return Promise.all([
      loadWorkOrdersForPanel(leftPanel),
      loadWorkOrdersForPanel(rightPanel),
    ]).then(() => {
      restorePanelSelections();
    });
  });
}

/**
 * 将一条左右子产线配对绑定到两栏：左栏取 subLine 字段，右栏取 subBLine 字段，
 * 同时生成右栏的单条回显选项。
 * @param {object} item - 配对行数据（subLineCode/subLineName/subBLineCode/subBLineName）。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-11-09 00:00:00
 */
function bindSubLinePair(item: any) {
  bindSubLineToPanel(leftPanel, item.subLineCode, item.subLineName);
  bindSubLineToPanel(rightPanel, item.subBLineCode, item.subBLineName);
  rightSubLineOptions.value = [
    {
      label: `${item.subBLineCode}(${item.subBLineName})`,
      value: item.subBLineCode,
    },
  ];
}

/**
 * 左栏子产线切换处理：按新选择的左边子产线找到配对行，
 * 重新绑定左右两栏（右栏随配对的 subBLine 字段联动），
 * 清空两栏面板与已保存的选中工单，并重新加载两栏工单下拉。
 * @param {any} val - 选中的左栏子产线编码。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-11-09 00:00:00
 */
function handleLeftSubLineChange(val: any) {
  if (!val) {
    return;
  }
  const item = subLineList.value.find((line: any) => line.subLineCode === val);
  if (!item) {
    return;
  }
  // 先重置面板再绑定配对，避免重置覆盖掉刚回填的子产线值
  resetPanel(leftPanel);
  resetPanel(rightPanel);
  clearPanelSelection(leftPanel);
  clearPanelSelection(rightPanel);
  bindSubLinePair(item);
  loadWorkOrdersForPanel(leftPanel);
  loadWorkOrdersForPanel(rightPanel);
}

/**
 * 将子产线绑定到面板：记录子产线编码用于工单查询与下拉回显。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @param {string} subLineCode - 子产线编码。
 * @param {string} _subLineName - 子产线名称（回显由下拉选项 label 提供，不写入表单值）。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-11-04 00:00:00
 */
function bindSubLineToPanel(
  panel: any,
  subLineCode: string,
  _subLineName?: string,
) {
  panel.subLineCode = subLineCode;
  panel.form.subLine = subLineCode;
}

/**
 * 按面板绑定的子产线加载工单下拉选项。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @returns {Promise<void>} 无返回值，子产线为空时清空选项，否则回填对应工单选项。
 * @throws 接口失败时由统一错误处理层提示，此处不额外捕获。
 * @since 2026-11-04 00:00:00
 */
function loadWorkOrdersForPanel(panel: any) {
  const optionsRef = getWorkOrderOptionsRef(panel);
  const subLineCode = panel.subLineCode;
  if (!subLineCode) {
    optionsRef.value = [];
    return Promise.resolve();
  }
  return getPlanWorkSheet(subLineCode).then((res: any) => {
    optionsRef.value = (res ?? []).map((item: any) => ({
      label: item.workSheetCode,
      value: item.id,
      // 保留工单状态，供状态指示灯（state === 2 绿色）使用
      state: item.state,
    }));
  });
}

/**
 * 面板工单选择处理：查询单条产线信息填充对应面板，并加载称重记录。
 * 选中后 selectLineByWorkSheetId 返回该子产线的工单数据行。
 * 仅左栏需要判断：左栏工单只要变动，右栏先重置；接口返回两条时，
 * 第一条填充左栏、第二条带出填充右栏（右栏工单禁止自选）；仅返回一条时右栏保持重置且可自选。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @param {number} workSheetId - 选中的工单 id，空值时重置面板并恢复子产线回显。
 * @returns {void} 无返回值。
 * @throws 接口失败时由统一错误处理层提示，此处不额外捕获。
 * @since 2026-11-04 00:00:00
 */
function handlePanelWorkOrderChange(panel: any, workSheetId: any) {
  if (!workSheetId) {
    resetPanel(panel);
    // 恢复面板绑定的子产线回显
    panel.form.subLine = panel.subLineCode ?? '';
    // 清空工单选择时同步清除已保存的选中记录
    clearPanelSelection(panel);
    // 左栏清空工单时，右栏同步清空并恢复可自选
    if (panel === leftPanel) {
      resetPanel(rightPanel);
      rightPanel.form.subLine = rightPanel.subLineCode ?? '';
      clearPanelSelection(rightPanel);
      rightWorkOrderSelectable.value = true;
      loadMaterials();
    }
    return;
  }
  // 按面板绑定的子产线过滤，接口只返回该子产线的工单数据
  selectLineByWorkSheetId(workSheetId, panel.subLineCode).then((res: any) => {
    const lines = res ?? [];
    if (lines[0]) {
      lines[0].packTypes = Number(lines[0].packTypes);
      fillPanel(panel, lines[0]);
      addLineToLineList(lines[0]);
      loadMaterials();
      // 保存已选工单，供离开页面后再次进入时恢复
      savePanelSelection(panel, lines[0]);
    }
    if (panel !== leftPanel) {
      return;
    }
    // 左栏工单变动时右栏先重置并恢复可自选；返回第二条时带出填充右栏，
    // 同时右栏工单禁止自选
    resetPanel(rightPanel);
    rightPanel.form.subLine = rightPanel.subLineCode ?? '';
    clearPanelSelection(rightPanel);
    rightWorkOrderSelectable.value = true;
    if (lines[1]) {
      lines[1].packTypes = Number(lines[1].packTypes);
      fillPanel(rightPanel, lines[1]);
      addLineToLineList(lines[1]);
      savePanelSelection(rightPanel, lines[1]);
      rightWorkOrderSelectable.value = false;
    }
  });
}

/**
 * 将工单产线数据合并进喷码传输弹窗的子产线选项来源（按子产线编码去重）。
 * @param {object} line - selectLineByWorkSheetId 返回的产线行数据。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-11-04 00:00:00
 */
function addLineToLineList(line: any) {
  if (!line?.subLineCode) {
    return;
  }
  if (
    !lineList.value.some((item: any) => item.subLineCode === line.subLineCode)
  ) {
    lineList.value.push(line);
  }
}

/**
 * 重新加载指定面板的工单下拉与面板数据（开始作业成功后调用）。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-11-04 00:00:00
 */
function reloadPanel(panel: any) {
  loadWorkOrdersForPanel(panel);
  if (panel.form.id) {
    selectLineByWorkSheetId(panel.form.id, panel.subLineCode).then(
      (res: any) => {
        const line = (res ?? [])[0];
        if (line) {
          fillPanel(panel, line);
          addLineToLineList(line);
        }
        loadMaterials();
      },
    );
  }
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
    /** 面板绑定的子产线编码（页面加载时按左右栏分配） */
    subLineCode: '',
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
    /** 称重记录包装类型筛选（3单包/4多包/5料包），默认全选 */
    packTypes: [3, 4, 5] as number[],
  });
}

// 左栏面板：完整可操作（工单信息、指标、材料列表）
const leftPanel = createPanel();
// 右栏面板：结构同左栏，仅底部三个按钮可操作
const rightPanel = createPanel();

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
  // 回填指标数：指示数量 / 生产数量 / 堆垛数量 / 各子产线生产数量
  panel.metrics.instructionQty = Number(line.targetQty ?? 0);
  panel.metrics.productionQty = Number(line.productionQty ?? 0);
  panel.metrics.stackQty = Number(line.palletizingQty ?? 0);
  panel.metrics.subLineProductionQty = Number(line.subLineProductionQtyA ?? 0);
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
  panel.packTypes = [3, 4, 5];
}

// endregion

// region 2.1 已选工单持久化（离开后再次进入时恢复）
const packagingProgressStore = usePackagingProgressStore();

/**
 * 取当前工作站的状态存储 key：优先工作站编码，缺失时回退工序编码
 * @returns {string} 存储 key
 * @throws 不主动抛出异常
 * @since 2026-11-05 00:00:00
 */
function getStationKey() {
  return props.workstationCode || props.processCode || 'default';
}

/**
 * 取面板标识（用于区分左右栏的持久化记录）
 * @param {object} panel - 目标面板（leftPanel/rightPanel）
 * @returns {PackagingPanelKey} left 或 right
 * @throws 不主动抛出异常
 * @since 2026-11-05 00:00:00
 */
function getPanelKey(panel: any): PackagingPanelKey {
  return panel === leftPanel ? 'left' : 'right';
}

/**
 * 保存面板当前选中的工单，供离开页面后再次进入时恢复
 * @param {object} panel - 目标面板（leftPanel/rightPanel）
 * @param {object} line - 工单产线数据（selectLineByWorkSheetId 返回行）
 * @returns {void} 无返回值
 * @throws 不主动抛出异常
 * @since 2026-11-05 00:00:00
 */
function savePanelSelection(panel: any, line: any) {
  const workSheetId = line?.id ?? panel?.form?.id;
  if (!workSheetId) {
    return;
  }
  packagingProgressStore.setSelection(getStationKey(), getPanelKey(panel), {
    workSheetId,
    workSheetCode: line?.workSheetCode ?? panel?.form?.workOrder ?? '',
    subLineCode: line?.subLineCode ?? panel?.subLineCode ?? '',
  });
}

/**
 * 清除面板已保存的工单记录（清空工单选择时调用）
 * @param {object} panel - 目标面板（leftPanel/rightPanel）
 * @returns {void} 无返回值
 * @throws 不主动抛出异常
 * @since 2026-11-05 00:00:00
 */
function clearPanelSelection(panel: any) {
  packagingProgressStore.clearSelection(getStationKey(), getPanelKey(panel));
}

/**
 * 恢复左右两栏上次选中的工单并重新查询工单信息、刷新称重记录。
 * 若上次左栏绑定的子产线与默认绑定不同，先按保存的子产线编码重新绑定配对
 * （右栏随配对联动），并重新加载两栏工单下拉后再恢复工单选中。
 * @returns {Promise<void>} 无返回值
 * @throws 不主动抛出异常
 * @since 2026-11-09 00:00:00
 */
function restorePanelSelections() {
  const leftSaved = packagingProgressStore.getSelection(
    getStationKey(),
    'left',
  );
  let tasks: Promise<any>[] = [];
  if (
    leftSaved?.subLineCode &&
    leftSaved.subLineCode !== leftPanel.subLineCode
  ) {
    const item = subLineList.value.find(
      (line: any) => line.subLineCode === leftSaved.subLineCode,
    );
    if (item) {
      bindSubLinePair(item);
      tasks = [
        loadWorkOrdersForPanel(leftPanel),
        loadWorkOrdersForPanel(rightPanel),
      ];
    }
  }
  return Promise.all(tasks).then(() => {
    restorePanelSelection(leftPanel);
    restorePanelSelection(rightPanel);
  });
}

/**
 * 恢复单个面板上次选中的工单：工单已不在当前子产线的可选项中时清除无效记录
 * @param {object} panel - 目标面板（leftPanel/rightPanel）
 * @returns {void} 无返回值
 * @throws 不主动抛出异常
 * @since 2026-11-05 00:00:00
 */
function restorePanelSelection(panel: any) {
  const panelKey = getPanelKey(panel);
  const saved = packagingProgressStore.getSelection(getStationKey(), panelKey);
  if (!saved?.workSheetId) {
    return;
  }
  const optionsRef = getWorkOrderOptionsRef(panel);
  const exists = optionsRef.value.some(
    (item: any) => item.value === saved.workSheetId,
  );
  if (!exists) {
    // 工单不在当前子产线的可选中范围内，清除无效记录
    packagingProgressStore.clearSelection(getStationKey(), panelKey);
    return;
  }
  // 回显下拉选中值后重新查询工单信息（含工单号、状态、指标等）
  panel.form.id = saved.workSheetId;
  handlePanelWorkOrderChange(panel, saved.workSheetId);
}
// endregion

// region 3. 加载称重记录列表
/** 包装类型多选选项：3 单包 / 4 多包 / 5 料包（透传给左右两栏面板子组件） */
const packTypeOptions = [
  { label: $t('packagingProgress.packTypeSingle'), value: 3 },
  { label: $t('packagingProgress.packTypeMulti'), value: 4 },
  { label: $t('packagingProgress.packTypeBag'), value: 5 },
];

// 左右两栏面板子组件引用（用于触发面板内称重记录列表重载）
const leftPanelRef = ref<InstanceType<typeof PackagingProgressPanel>>();
const rightPanelRef = ref<InstanceType<typeof PackagingProgressPanel>>();

/**
 * 重新加载左右两栏的称重记录列表（通过面板子组件暴露的 reload）。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function loadMaterials() {
  leftPanelRef.value?.reload();
  rightPanelRef.value?.reload();
}
// endregion

// region 4. 按钮：材料加载 / 工作开始 / 工作结束
// 包装材料加载/卸载抽屉引用（PackagingMaterialDrawer）
const materialDrawerRef = ref();
// SOP 图像抽屉引用（SopImageDrawer）
const sopImageDrawerRef = ref();

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
 * 打开 SOP 图像抽屉，按面板上的产品编码加载 SOP 图片。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-10-08 00:00:00
 */
function handleSopImage(panel: any) {
  sopImageDrawerRef.value.open(panel?.form?.productCode ?? '');
}

/** 开始工作请求中标记：防止重复点击 */
const workStartLoading = ref(false);
/** 结束工作请求中标记：防止重复点击 */
const workEndLoading = ref(false);

/**
 * 开始工作：调用状态更新接口将工单置为进行中（state 2），
 * 以工单 state 判断是否可开始，成功后重新查询面板数据刷新工单状态。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @returns {void} 无返回值，成功后弹出成功提示。
 * @throws 不主动抛出异常，失败时提示开始失败。
 * @since 2026-09-02 00:00:00
 */
function handleWorkStart(panel: any) {
  // 请求进行中时忽略重复点击
  if (workStartLoading.value) {
    return;
  }
  // 以工单 state 判断是否已在运行（state 为 2 时不可重复开始）
  if (isRunningState(panel.form?.state)) {
    message.warning($t('packagingProgress.alreadyRunning'));
    return;
  }
  if (!panel.form?.id) {
    message.warning($t('packagingProgress.workOrderNotSelected'));
    return;
  }
  workStartLoading.value = true;
  updateStae([panel.form.id], 2, props.processType, panel.form.equipCode)
    .then(() => {
      message.success($t('packagingProgress.startSuccess'));
      // 开始成功后重新查询工单下拉与面板数据，刷新工单状态与面板内容
      reloadPanel(panel);
    })
    .catch(() => {
      message.error($t('packagingProgress.startFailed'));
    })
    .finally(() => {
      workStartLoading.value = false;
    });
}

/**
 * 结束工作：调用状态更新接口将工单置为结束（state 3），
 * 以工单 state 判断是否在运行，成功后重新查询面板数据刷新工单状态。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @returns {void} 无返回值，成功后弹出成功提示。
 * @throws 不主动抛出异常，失败时提示结束失败。
 * @since 2026-09-02 00:00:00
 */
function handleWorkEnd(panel: any) {
  // 请求进行中时忽略重复点击
  if (workEndLoading.value) {
    return;
  }
  // 以工单 state 判断是否已开始（state 不为 2 时不可结束）
  if (!isRunningState(panel.form?.state)) {
    message.warning($t('packagingProgress.notStarted'));
    return;
  }
  if (!panel.form?.id) {
    message.warning($t('packagingProgress.workOrderNotSelected'));
    return;
  }
  workEndLoading.value = true;
  updateStae([panel.form.id], 3, props.processType, panel.form.equipCode)
    .then(() => {
      message.success($t('packagingProgress.endSuccess'));
      // 结束成功后重新查询工单下拉与面板数据，刷新工单状态与面板内容
      reloadPanel(panel);
    })
    .catch(() => {
      message.error($t('packagingProgress.endFailed'));
    })
    .finally(() => {
      workEndLoading.value = false;
    });
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
    label: `${line.subLineCode}(${line.subLineName})`,
    value: line.subLineCode,
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
 * 取面板工单号。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @returns {string} 工单号，取不到时返回空字符串。
 * @throws 不主动抛出异常。
 * @since 2026-09-21 00:00:00
 */
function resolveWorkSheetCode(panel: any) {
  return panel?.form?.workSheetCode ?? '';
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
    subLineCode: panel.form.subLineCode,
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
  // 查询当前用户在作业平台下的按钮权限
  queryWorkAuth(WORK_AUTH_MENU_CODE).then((names) => {
    workAuthNames.value = names;
  });
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 左右两栏布局 -->
    <Row :gutter="16" class="items-stretch">
      <!-- 左栏：完整可操作（面板展示由 PackagingProgressPanel 子组件渲染） -->
      <Col :xs="24" :md="12" class="mb-4 md:mb-0">
        <PackagingProgressPanel
          ref="leftPanelRef"
          :panel="leftPanel"
          :work-order-options="leftWorkOrderOptions"
          :sub-line-options="subLineOptions"
          :pack-type-options="packTypeOptions"
          :work-start-loading="workStartLoading"
          :work-end-loading="workEndLoading"
          :can-work-start="hasWorkAuth(AUTH_WORK_START)"
          :can-work-end="hasWorkAuth(AUTH_WORK_END)"
          sub-line-selectable
          @work-order-change="
            (val: any) => handlePanelWorkOrderChange(leftPanel, val)
          "
          @sub-line-change="handleLeftSubLineChange"
          @transfer="openTransfer(leftPanel)"
          @material-load="handleMaterialLoad(leftPanel)"
          @sop-image="handleSopImage(leftPanel)"
          @work-start="handleWorkStart(leftPanel)"
          @work-end="handleWorkEnd(leftPanel)"
        />
      </Col>

      <!-- 右栏：始终展示，工单同样可选择（无数据时为空面板，展示由子组件渲染） -->
      <Col :xs="24" :md="12">
        <PackagingProgressPanel
          ref="rightPanelRef"
          :panel="rightPanel"
          :work-order-options="rightWorkOrderOptions"
          :sub-line-options="rightSubLineOptions"
          :pack-type-options="packTypeOptions"
          :work-order-selectable="rightWorkOrderSelectable"
          :work-start-loading="workStartLoading"
          :work-end-loading="workEndLoading"
          :can-work-start="hasWorkAuth(AUTH_WORK_START)"
          :can-work-end="hasWorkAuth(AUTH_WORK_END)"
          @work-order-change="
            (val: any) => handlePanelWorkOrderChange(rightPanel, val)
          "
          @transfer="openTransfer(rightPanel)"
          @material-load="handleMaterialLoad(rightPanel)"
          @sop-image="handleSopImage(rightPanel)"
          @work-start="handleWorkStart(rightPanel)"
          @work-end="handleWorkEnd(rightPanel)"
        />
      </Col>
    </Row>

    <!-- 5. 包装材料加载/卸载抽屉（公共组件） -->
    <PackagingMaterialDrawer ref="materialDrawerRef" @refresh="loadMaterials" />

    <!-- 5.1 SOP 图像抽屉（按产品编码展示 SOP 图片） -->
    <SopImageDrawer ref="sopImageDrawerRef" />

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
            <span class="shrink-0 ipc-fs-sm text-muted-foreground">
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
