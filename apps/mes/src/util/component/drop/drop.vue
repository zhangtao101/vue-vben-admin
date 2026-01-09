<script lang="ts" setup>
import { nextTick, ref } from 'vue';

import { Panel, useVueFlow, VueFlow } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';

import { bindStepQuery } from '#/api';
import ToolbarNode from '#/util/component/nodes/ToolbarNode.vue';
import OperationSettings from '#/util/component/workstepRecipeManagementMatch/operationSettings.vue';
import { useLayout } from '#/util/useLayout';

import DropzoneBackground from './DropzoneBackground.vue';
import Sidebar from './Sidebar.vue';
import useDragAndDrop from './useDnD';

const props = defineProps(['formula', 'matching']);
const { addEdges, fitView, removeNodes } = useVueFlow();
const { layout } = useLayout();

const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop();

const nodes = ref([]);
const edges = ref([]);

// region 节点操作

/**
 * 删除节点
 * @param data
 */
function delNode(data: any) {
  removeNodes([data.id]);
  layoutGraph('LR');
}

/**
 * 添加动画效果
 * @param params
 */
function onConnect(params: any) {
  params.animated = true;
  addEdges([params]);
}

/**
 * 格式化布局
 * @param direction
 */
async function layoutGraph(direction: any) {
  nodes.value = layout(nodes.value, edges.value, direction);

  nextTick(() => {
    fitView();
  });
}

function clear() {
  nodes.value = [];
  edges.value = [];
}

/**
 * 清除孤岛元素, 判断结构是否完整
 * @param endNodeId
 */
function cleanAndCheckGraph(endNodeId = 'end') {
  // 1. 删除孤岛节点
  const connectedNodeIds = new Set();
  edges.value.forEach((edge: any) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  const cleanedNodes = nodes.value.filter((node: any) =>
    connectedNodeIds.has(node.id),
  );

  // 2. 构建邻接表
  const adj = new Map();
  cleanedNodes.forEach((node: any) => adj.set(node.id, []));
  edges.value.forEach((edge: any) => {
    if (adj.has(edge.source)) {
      adj.get(edge.source).push(edge.target);
    }
  });

  const visited = new Map();

  function dfs(nodeId: string, seen = new Set()) {
    if (nodeId === endNodeId) return true;
    if (seen.has(nodeId)) return false;
    if (adj.get(nodeId).length === 0) return false;

    if (visited.has(nodeId)) return visited.get(nodeId);

    seen.add(nodeId);
    const result = adj
      .get(nodeId)
      .every((next: any) => dfs(next, new Set(seen)));
    visited.set(nodeId, result);
    return result;
  }

  // 所有没有入边的节点
  const targetIds = new Set(edges.value.map((e: any) => e.target));
  const sourceNodes = cleanedNodes.filter(
    (node: any) => !targetIds.has(node.id),
  );

  const allPathsValid = sourceNodes.every((node: any) => dfs(node.id));

  return {
    cleanedNodes,
    allPathsLeadToEnd: allPathsValid,
    edges: edges.value,
  };
}

// endregion

// region 运行设置

const operationSettingRef = ref();

/**
 * 打开运行设置抽屉
 * @param row 工步数据
 */
function openOperationSettings(row: any): void {
  bindStepQuery({
    equipCode: props.formula.equipCode,
    processCode: props.formula.processCode,
    functionType: props.formula.opType,
    workstationCode: props.formula.workstationCode,
    equipTypeCode: props.formula.formulaCode,
    opType: props.matching.opType,
  }).then((data) => {
    operationSettingRef.value.open(props.formula, props.matching, row, data);
  });
}

// endregion

// 暴露 open 方法，供父组件调用
defineExpose({
  getData: () => {
    return {
      routes: edges.value,
      details: nodes.value,
    };
  },
  setData: (routes: any, details: any) => {
    const arr = details.filter((edge: any) => {
      const item = {
        ...edge,
      };
      item.data.functionId = item.functionId;
      item.data.functionTypeName = item.functionTypeName;
      return item;
    });
    nodes.value = arr;
    edges.value = routes;
  },
  cleanAndCheckGraph,
});
// endregion
</script>

<template>
  <div class="mt-2 flex h-[80%]" @drop="onDrop">
    <Sidebar />

    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @connect="onConnect"
      class="flex-1"
    >
      <DropzoneBackground
        :style="{
          backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',
          transition: 'background-color 0.2s ease',
        }"
      >
        <p v-if="isDragOver">放置</p>
      </DropzoneBackground>

      <Panel class="process-panel" position="top-right">
        <div class="layout-panel">
          <button title="set horizontal layout" @click="layoutGraph('LR')">
            整理
          </button>
          <button title="set horizontal layout" @click="clear()">清空</button>
        </div>
      </Panel>
      <template #node-menu="props">
        <ToolbarNode
          :id="props.id"
          :data="props.data"
          @del-node="delNode"
          @update="openOperationSettings"
        />
      </template>
      <MiniMap pannable zoomable />
    </VueFlow>

    <OperationSettings ref="operationSettingRef" />
  </div>
</template>
<style lang="scss">
@import '@vue-flow/core/dist/style.css';

/* this contains the default theme, these are optional styles */
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/minimap/dist/style.css';
@import '@vue-flow/controls/dist/style.css';

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.vue-flow__node-toolbar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 8px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgb(0 0 0 / 50%);
}

.vue-flow__node-toolbar button.selected {
  background: #2563eb;
}

.vue-flow__node-toolbar button:hover {
  background: #2563eb;
}

.vue-flow__node-menu {
  padding: 16px 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgb(0 0 0 / 20%);
}

.vue-flow__node-menu.selected {
  box-shadow: 0 0 0 2px #2563eb;
}

.layout-flow {
  width: 100%;
  height: 100%;
  background-color: #1a192b;
}

.process-panel,
.layout-panel {
  display: flex;
  gap: 10px;
}

.process-panel {
  display: flex;
  flex-direction: column;
  padding: 10px;
  border-radius: 8px;
}

.process-panel button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 16px;
  color: white;
  cursor: pointer;
  background-color: #4a5568;
  border: none;
  border-radius: 8px;
  box-shadow: 0 0 10px rgb(0 0 0 / 50%);
}

.checkbox-panel {
  display: flex;
  gap: 10px;
  align-items: center;
}

.process-panel button:hover,
.layout-panel button:hover {
  background-color: #2563eb;
  transition: background-color 0.2s;
}

.process-panel label {
  font-size: 12px;
  color: white;
}

.stop-btn svg {
  display: none;
}

.stop-btn:hover svg {
  display: block;
}

.stop-btn:hover .spinner {
  display: none;
}

.spinner {
  width: 10px;
  height: 10px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

[data-id='start'],
[data-id='end'] {
  color: white;
  background-color: #4a5568;
  border-radius: 8px;
}

/* these are necessary styles for vue flow */
</style>
