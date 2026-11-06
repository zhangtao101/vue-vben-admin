<script setup lang="ts">
/**
 * [INPUT]: 依赖 vxe-table 适配器（VxeGridProps/useVbenVxeGrid）、#/api 的 getPlanWorkSheet/palletizTransfer/searchSubLineByProcessCode/searchWeightRecordList/selectLineByWorkSheetId 接口、#/store 的 usePackagingProgressStore（已选工单持久化）、#/locales 国际化、ant-design-vue 组件，以及 PackagingMaterialDrawer 包装材料加载/卸载抽屉、SopImageDrawer SOP 图像抽屉。
 * [OUTPUT]: 对外提供 packagingProgress 包装工序步骤组件（步骤组件标准入参 functionId/bindingId/worksheetCode/equipCode/workstationCode/processType）。
 * [POS]: 属于包装工序步骤组件，负责按工序编码加载子产线（parentId 有值）、左右两栏各自绑定子产线与工单选择、选中工单的本地持久化与再次进入时的自动恢复、称重记录列表、工作开始/结束控制、喷码传输弹窗与 SOP 图像查看。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-11-05 00:00:00
 */
import type { Rule } from 'ant-design-vue/es/form';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { PackagingPanelKey } from '#/store';

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
  searchSubLineByProcessCode,
  searchWeightRecordList,
  selectLineByWorkSheetId,
  updateStae,
} from '#/api';
import { $t } from '#/locales';
import { usePackagingProgressStore } from '#/store';
import { queryWorkAuth } from '#/util';
import SopImageDrawer from '#/util/component/drawers/SopImageDrawer.vue';
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
/** 子产线下拉选项（接口获取，parentId 有值的工作站绑定子产线） */
const subLineOptions = ref<{ label: string; value: string }[]>([]);
/** 绑定到当前工作站的子产线原始列表（parentId 有值），决定左右两栏展示 */
const subLineList = ref<any[]>([]);
/** 左栏工单下拉选项（按左栏绑定的子产线查询） */
const leftWorkOrderOptions = ref<
  { label: string; state: any; value: number }[]
>([]);
/** 右栏工单下拉选项（按右栏绑定的子产线查询） */
const rightWorkOrderOptions = ref<
  { label: string; state: any; value: number }[]
>([]);
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
 * 取面板对应的工单下拉选项引用。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @returns {object} 面板对应的工单下拉选项 ref（leftWorkOrderOptions/rightWorkOrderOptions）。
 * @throws 不主动抛出异常。
 * @since 2026-11-04 00:00:00
 */
function getWorkOrderOptionsRef(panel: any) {
  return panel === leftPanel ? leftWorkOrderOptions : rightWorkOrderOptions;
}

/**
 * 取面板工单的状态指示灯颜色类：state 为 2 显示绿色实心圆，否则灰色。
 * 状态取自面板数据（selectLineByWorkSheetId 返回的工单 state）。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @returns {string} 圆点背景色类名（bg-green-500 / bg-gray-400）。
 * @throws 不主动抛出异常。
 * @since 2026-09-21 00:00:00
 */
function getStateDotClass(panel: any) {
  return isRunningState(panel?.form?.state) ? 'bg-green-500' : 'bg-gray-400';
}

/**
 * 加载绑定到当前工作站的子产线列表并分配到左右两栏，仅页面加载时执行一次。
 * 调用 searchSubLineByProcessCode 按工序编码查询，过滤 parentId 无值的子产线；
 * 全部无值时提示当前工作站没有绑定子产线；
 * 工单下拉加载完成后，恢复上次选中的工单并重新查询相关信息。
 * @returns {Promise<void>} 无返回值，加载完成后回填 subLineList/subLineOptions 并绑定左右栏。
 * @throws 接口失败时由统一错误处理层提示，此处不额外捕获。
 * @since 2026-11-04 00:00:00
 */
function loadSubLines() {
  return searchSubLineByProcessCode(props.processCode).then((res: any) => {
    const list = (res ?? []).filter(
      (item: any) =>
        item.parentId !== undefined &&
        item.parentId !== null &&
        item.parentId !== '',
    );
    if (list.length === 0) {
      message.warning($t('packagingProgress.subLineNotBound'));
      return;
    }
    subLineList.value = list;
    subLineOptions.value = list.map((item: any) => ({
      label: `${item.subLineCode}(${item.subLineName})`,
      value: item.subLineCode,
    }));
    // 第一个子产线绑定左栏
    bindSubLineToPanel(leftPanel, list[0]);
    const tasks: Promise<any>[] = [loadWorkOrdersForPanel(leftPanel)];
    // 存在第二个子产线时绑定右栏
    if (list[1]) {
      bindSubLineToPanel(rightPanel, list[1]);
      tasks.push(loadWorkOrdersForPanel(rightPanel));
    }
    // 工单下拉加载完成后，恢复上次选中的工单并重新查询相关信息
    return Promise.all(tasks).then(() => {
      restorePanelSelections();
    });
  });
}

/**
 * 将子产线绑定到面板：记录子产线编码用于工单查询与下拉回显。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @param {object} subLine - 子产线原始数据（subLineCode/subLineName/parentId）。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-11-04 00:00:00
 */
function bindSubLineToPanel(panel: any, subLine: any) {
  panel.subLineCode = subLine.subLineCode;
  panel.form.subLine = subLine.subLineCode;
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
 * 选中后 selectLineByWorkSheetId 只返回一个元素的数组，取第一条填充当前面板。
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
    return;
  }
  // 按面板绑定的子产线过滤，接口只返回该子产线的单条工单数据
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
 * 面板是否已选中工单：底部操作按钮需先选择工单才可点击。
 * @param {object} panel - 目标面板（leftPanel/rightPanel）。
 * @returns {boolean} 已选中工单返回 true，否则 false。
 * @throws 不主动抛出异常。
 * @since 2026-10-08 00:00:00
 */
function isPanelReady(panel: any) {
  return !!(panel?.form?.workOrder || panel?.form?.id);
}

// 指标卡片配置：key 与 panel.metrics 字段一一对应
const metricItems = [
  { key: 'instructionQty', title: $t('packagingProgress.instructionQty') },
  { key: 'productionQty', title: $t('packagingProgress.productionQty') },
  { key: 'stackQty', title: $t('packagingProgress.stackQty') },
  {
    key: 'subLineProductionQty',
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
 * 恢复左右两栏上次选中的工单并重新查询工单信息、刷新称重记录
 * @returns {void} 无返回值
 * @throws 不主动抛出异常
 * @since 2026-11-05 00:00:00
 */
function restorePanelSelections() {
  restorePanelSelection(leftPanel);
  restorePanelSelection(rightPanel);
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
    const params: any = {
      workSheetId: panel.form.id,
      equipCode: panel.form.equipCode,
    };
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
  rowClassName: 'ipc-grid-row',
  headerRowClassName: 'ipc-grid-header-row',
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
  toolbarConfig: { custom: false, refresh: false, zoom: false },
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
  leftGridApi?.reload();
  rightGridApi?.reload();
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
      <!-- 左栏：完整可操作 -->
      <Col :xs="24" :md="12" class="mb-4 md:mb-0">
        <div class="flex flex-col gap-4">
          <!-- 1. 工单信息表单 -->
          <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
            <Form
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 20 }"
              :model="leftPanel.form"
            >
              <FormItem
                :label="$t('packagingProgress.workOrder')"
                class="mb-2!"
              >
                <div class="flex items-center gap-2">
                  <Select
                    v-model:value="leftPanel.form.id"
                    :options="leftWorkOrderOptions"
                    :placeholder="$t('packagingProgress.workOrderPlaceholder')"
                    allow-clear
                    class="flex-1"
                    @change="
                      (val: any) => handlePanelWorkOrderChange(leftPanel, val)
                    "
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
                        class="inline-block align-middle ipc-fs-lg"
                      />
                    </Button>
                  </Tooltip>
                  <!-- 工单状态指示灯：state === 2 绿色，其余灰色 -->
                  <span
                    class="size-3 shrink-0 rounded-full"
                    :class="getStateDotClass(leftPanel)"
                  ></span>
                </div>
              </FormItem>

              <FormItem :label="$t('packagingProgress.subLine')" class="mb-2!">
                <div class="flex items-center gap-2">
                  <Select
                    v-model:value="leftPanel.form.subLine"
                    :options="subLineOptions"
                    :placeholder="$t('packagingProgress.subLinePlaceholder')"
                    class="flex-1"
                    disabled
                  />
                  <!-- 工单状态指示灯：state === 2 绿色，其余灰色 -->
                  <span
                    class="size-3 shrink-0 rounded-full"
                    :class="getStateDotClass(leftPanel)"
                  ></span>
                </div>
              </FormItem>
              <FormItem :label="$t('packagingProgress.product')" class="mb-2!">
                <Input
                  v-model:value="leftPanel.form.product"
                  disabled
                />
              </FormItem>
              <FormItem :label="$t('packagingProgress.line')" class="mb-2!">
                <Input
                  v-model:value="leftPanel.form.line"
                  disabled
                />
              </FormItem>
              <FormItem
                :label="$t('packagingProgress.workOrderRemark')"
                class="mb-2!"
              >
                <Textarea
                  v-model:value="leftPanel.form.remark"
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
                        class="w-full truncate text-center ipc-fs-sm text-foreground"
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
                  <div class="ipc-fs-sm text-muted-foreground">
                    {{ item.title }}
                  </div>
                  <div class="mt-1 ipc-fs-2xl font-bold text-primary">
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
            <Button
              :disabled="!isPanelReady(leftPanel)"
              @click="handleMaterialLoad(leftPanel)"
            >
              {{ $t('packagingProgress.materialLoad') }}
            </Button>
            <Button
              :disabled="!isPanelReady(leftPanel)"
              @click="handleSopImage(leftPanel)"
            >
              {{ $t('packagingProgress.image') }}
            </Button>
            <Button
              v-if="hasWorkAuth(AUTH_WORK_START)"
              type="primary"
              :disabled="!isPanelReady(leftPanel)"
              :loading="workStartLoading"
              @click="handleWorkStart(leftPanel)"
            >
              {{ $t('packagingProgress.workStart') }}
            </Button>
            <Button
              v-if="hasWorkAuth(AUTH_WORK_END)"
              type="primary"
              danger
              :disabled="!isPanelReady(leftPanel)"
              :loading="workEndLoading"
              @click="handleWorkEnd(leftPanel)"
            >
              {{ $t('packagingProgress.workEnd') }}
            </Button>
          </div>
        </div>
      </Col>

      <!-- 右栏：始终展示，工单同样可选择（无数据时为空面板） -->
      <Col :xs="24" :md="12">
        <div class="flex flex-col gap-4">
          <!-- 1. 工单信息表单 -->
          <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
            <Form
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 20 }"
              :model="rightPanel.form"
            >
              <FormItem
                :label="$t('packagingProgress.workOrder')"
                class="mb-2!"
              >
                <div class="flex items-center gap-2">
                  <Select
                    v-model:value="rightPanel.form.id"
                    :options="rightWorkOrderOptions"
                    :placeholder="$t('packagingProgress.workOrderPlaceholder')"
                    allow-clear
                    class="flex-1"
                    @change="
                      (val: any) => handlePanelWorkOrderChange(rightPanel, val)
                    "
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
                        class="inline-block align-middle ipc-fs-lg"
                      />
                    </Button>
                  </Tooltip>
                  <!-- 工单状态指示灯：state === 2 绿色，其余灰色 -->
                  <span
                    class="size-3 shrink-0 rounded-full"
                    :class="getStateDotClass(rightPanel)"
                  ></span>
                </div>
              </FormItem>
              <FormItem :label="$t('packagingProgress.subLine')" class="mb-2!">
                <div class="flex items-center gap-2">
                  <Select
                    v-model:value="rightPanel.form.subLine"
                    :options="subLineOptions"
                    disabled
                    class="flex-1"
                  />
                  <!-- 工单状态指示灯：state === 2 绿色，其余灰色 -->
                  <span
                    class="size-3 shrink-0 rounded-full"
                    :class="getStateDotClass(rightPanel)"
                  ></span>
                </div>
              </FormItem>
              <FormItem :label="$t('packagingProgress.product')" class="mb-2!">
                <Input
                  v-model:value="rightPanel.form.product"
                  disabled
                />
              </FormItem>
              <FormItem :label="$t('packagingProgress.line')" class="mb-2!">
                <Input
                  v-model:value="rightPanel.form.line"
                  disabled
                />
              </FormItem>
              <FormItem
                :label="$t('packagingProgress.workOrderRemark')"
                class="mb-2!"
              >
                <Textarea
                  v-model:value="rightPanel.form.remark"
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
                        class="w-full truncate text-center ipc-fs-sm text-foreground"
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
                  <div class="ipc-fs-sm text-muted-foreground">
                    {{ item.title }}
                  </div>
                  <div class="mt-1 ipc-fs-2xl font-bold text-primary">
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
            <Button
              :disabled="!isPanelReady(rightPanel)"
              @click="handleMaterialLoad(rightPanel)"
            >
              {{ $t('packagingProgress.materialLoad') }}
            </Button>
            <Button
              :disabled="!isPanelReady(rightPanel)"
              @click="handleSopImage(rightPanel)"
            >
              {{ $t('packagingProgress.image') }}
            </Button>
            <Button
              v-if="hasWorkAuth(AUTH_WORK_START)"
              type="primary"
              :disabled="!isPanelReady(rightPanel)"
              :loading="workStartLoading"
              @click="handleWorkStart(rightPanel)"
            >
              {{ $t('packagingProgress.workStart') }}
            </Button>
            <Button
              v-if="hasWorkAuth(AUTH_WORK_END)"
              type="primary"
              danger
              :disabled="!isPanelReady(rightPanel)"
              :loading="workEndLoading"
              @click="handleWorkEnd(rightPanel)"
            >
              {{ $t('packagingProgress.workEnd') }}
            </Button>
          </div>
        </div>
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
