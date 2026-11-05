import { ref } from 'vue';

import { defineStore } from 'pinia';

/** 本地持久化存储 key */
const STORAGE_KEY = 'ipc_packaging_progress_selection';

/** 面板标识：left=左栏，right=右栏 */
export type PackagingPanelKey = 'left' | 'right';

/** 面板已选工单信息 */
export interface PackagingPanelSelection {
  /** 工单 id（selectLineByWorkSheetId / updateStae 使用） */
  workSheetId: number | string;
  /** 工单号，用于下拉回显校验 */
  workSheetCode?: string;
  /** 面板绑定的子产线编码 */
  subLineCode?: string;
}

/** 工作站编码 → 左右两栏已选工单 */
type SelectionMap = Record<
  string,
  Partial<Record<PackagingPanelKey, PackagingPanelSelection>>
>;

/**
 * 从 localStorage 读取已保存的工单选择状态
 * @returns {SelectionMap} 已保存的工单选择映射，无数据或解析失败时返回空对象
 * @throws 不主动抛出异常
 * @since 2026-11-05 00:00:00
 */
function loadSelections(): SelectionMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as SelectionMap;
    }
  } catch {
    // 解析失败时忽略，返回空对象
  }
  return {};
}

export const usePackagingProgressStore = defineStore('packagingProgress', () => {
  /** 工作站 → 左右两栏已选工单（初始化时从本地存储恢复） */
  const selections = ref<SelectionMap>(loadSelections());

  /**
   * 持久化当前选择状态到 localStorage
   * @returns {void} 无返回值
   * @since 2026-11-05 00:00:00
   */
  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selections.value));
  }

  /**
   * 查询指定工作站下某个面板已选中的工单
   * @param {string} stationKey - 工作站标识（工作站编码，缺失时回退工序编码）
   * @param {PackagingPanelKey} panel - 面板标识（left/right）
   * @returns {PackagingPanelSelection | undefined} 已选工单信息，未选中时返回 undefined
   * @since 2026-11-05 00:00:00
   */
  function getSelection(stationKey: string, panel: PackagingPanelKey) {
    return selections.value[stationKey]?.[panel];
  }

  /**
   * 保存指定工作站下某个面板已选中的工单
   * @param {string} stationKey - 工作站标识
   * @param {PackagingPanelKey} panel - 面板标识（left/right）
   * @param {PackagingPanelSelection} selection - 已选工单信息
   * @returns {void} 无返回值，写入后立即持久化
   * @since 2026-11-05 00:00:00
   */
  function setSelection(
    stationKey: string,
    panel: PackagingPanelKey,
    selection: PackagingPanelSelection,
  ) {
    selections.value = {
      ...selections.value,
      [stationKey]: {
        ...(selections.value[stationKey] ?? {}),
        [panel]: { ...selection },
      },
    };
    persist();
  }

  /**
   * 清除指定工作站下某个面板的已选工单（面板清空或工单已失效时调用）
   * @param {string} stationKey - 工作站标识
   * @param {PackagingPanelKey} panel - 面板标识（left/right）
   * @returns {void} 无返回值，写入后立即持久化
   * @since 2026-11-05 00:00:00
   */
  function clearSelection(stationKey: string, panel: PackagingPanelKey) {
    const current = selections.value[stationKey];
    if (!current) {
      return;
    }
    // 重建工作站下的选择项，避免使用动态 delete
    const next: Partial<Record<PackagingPanelKey, PackagingPanelSelection>> = {};
    if (panel !== 'left' && current.left) {
      next.left = current.left;
    }
    if (panel !== 'right' && current.right) {
      next.right = current.right;
    }
    // 重建整体映射：无剩余选择项时移除该工作站
    const map: SelectionMap = {};
    Object.keys(selections.value).forEach((key) => {
      if (key !== stationKey) {
        map[key] = selections.value[key]!;
      } else if (next.left || next.right) {
        map[key] = next;
      }
    });
    selections.value = map;
    persist();
  }

  /**
   * 重置为初始状态（供 resetAllStores 统一调用）
   * @returns {void} 无返回值
   * @since 2026-11-05 00:00:00
   */
  function $reset() {
    selections.value = {};
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    selections,
    getSelection,
    setSelection,
    clearSelection,
    $reset,
  };
});
