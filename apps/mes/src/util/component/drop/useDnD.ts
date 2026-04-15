/**
 * 拖拽功能钩子
 *
 * 此文件提供了一个用于实现Vue Flow流程图的拖拽功能的钩子函数。
 * 主要功能包括：
 * 1. 处理节点的拖拽开始、拖拽过程、拖拽结束和放置事件
 * 2. 管理拖拽状态，如拖拽类型、是否正在拖拽、是否悬停在有效区域
 * 3. 提供拖拽节点的数据传递和位置计算
 * 4. 实现节点放置后的位置调整，使节点中心对齐鼠标位置
 *
 * 使用场景：
 * - 在流程图编辑器中，从工具栏拖拽节点到画布
 * - 支持自定义节点类型和节点数据
 */
import { ref, watch } from 'vue';

import { useVueFlow } from '@vue-flow/core';

// 用于生成唯一ID的计数器
let id = 0;

/**
 * 生成唯一ID
 * @returns {string} - 唯一ID字符串
 */
function getId() {
  return `dndnode_${id++}`;
}

/**
 * 生成兼容的 UUID
 * 兼容不支持 crypto.randomUUID 的浏览器和环境
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: 使用 Math.random 生成 UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replaceAll(/[xy]/g, (c) => {
    const r = Math.trunc(Math.random() * 16);
    const v = c === 'x' ? r : Math.trunc((r & 0x3) | 0x8);
    return v.toString(16);
  });
}

/**
 * 全局拖拽状态
 * 注意：在实际生产环境中，应避免在全局作用域创建ref，因为它们可能无法正确清理
 * @type {{draggedType: Ref<string|null>, isDragOver: Ref<boolean>, isDragging: Ref<boolean>, nodeData: Ref<any>}}
 */
const state = {
  /**
   * 正在拖拽的节点类型
   */
  draggedType: ref(null),
  /**
   * 是否悬停在有效放置区域
   */
  isDragOver: ref(false),
  /**
   * 是否正在拖拽
   */
  isDragging: ref(false),
  /**
   * 拖拽节点的数据
   */
  nodeData: ref({} as any),
};

/**
 * 拖拽功能钩子函数
 * @returns {Object} 拖拽相关的状态和方法
 */
export default function useDragAndDrop() {
  // 解构全局状态
  const { draggedType, isDragOver, isDragging, nodeData } = state;

  // 从Vue Flow获取必要的方法
  const { addNodes, screenToFlowCoordinate, onNodesInitialized, updateNode } =
    useVueFlow();

  // 监听拖拽状态变化，禁用/启用用户选择
  watch(isDragging, (dragging) => {
    document.body.style.userSelect = dragging ? 'none' : '';
  });

  /**
   * 处理拖拽开始事件
   * @param {DragEvent} event - 拖拽事件对象
   * @param {string} type - 拖拽的节点类型
   * @param {any} data - 拖拽的节点数据
   */
  function onDragStart(event: any, type: any, data: any) {
    // 设置拖拽数据和效果
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/vueflow', type);
      event.dataTransfer.effectAllowed = 'move';
    }

    // 更新拖拽状态
    draggedType.value = type;
    isDragging.value = true;
    nodeData.value = data ? { ...data } : {};

    // 添加拖拽结束事件监听器
    document.addEventListener('drop', onDragEnd);
  }

  /**
   * 处理拖拽悬停事件
   * @param {DragEvent} event - 拖拽事件对象
   */
  function onDragOver(event: any) {
    event.preventDefault();

    // 只有当有拖拽类型时才处理
    if (draggedType.value) {
      isDragOver.value = true;

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
    }
  }

  /**
   * 处理拖拽离开事件
   */
  function onDragLeave() {
    isDragOver.value = false;
  }

  /**
   * 处理拖拽结束事件
   */
  function onDragEnd() {
    // 重置拖拽状态
    isDragging.value = false;
    isDragOver.value = false;
    draggedType.value = null;
    // 移除拖拽结束事件监听器
    document.removeEventListener('drop', onDragEnd);
  }

  /**
   * 处理放置事件
   * @param {DragEvent} event - 拖拽事件对象
   */
  function onDrop(event: any) {
    // 计算放置位置（屏幕坐标转换为流程图坐标）
    const position = screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY,
    });

    // 生成节点ID
    const nodeId = getId();

    // 创建新节点对象
    const newNode: any = {
      id: nodeData.value.id || generateUUID(),
      type: draggedType.value,
      position,
      data: {
        ...nodeData.value.data,
      },
    };

    /**
     * 节点初始化后调整位置，使节点中心对齐鼠标位置
     *
     * 我们可以在回调中钩子事件，并且在调用后移除事件监听器
     */
    const { off } = onNodesInitialized(() => {
      updateNode(nodeId, (node) => ({
        position: {
          x: node.position.x - node.dimensions.width / 2,
          y: node.position.y - node.dimensions.height / 2,
        },
      }));

      // 移除事件监听器
      off();
    });

    // 添加新节点到流程图
    addNodes(newNode);
  }

  // 返回拖拽相关的状态和方法
  return {
    draggedType,
    isDragOver,
    isDragging,
    onDragStart,
    onDragLeave,
    onDragOver,
    onDrop,
  };
}
