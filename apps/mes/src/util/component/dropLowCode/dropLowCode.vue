<script lang="ts" setup>
import { nextTick, ref } from 'vue';

import { Panel, useVueFlow, VueFlow } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';
import { message } from 'ant-design-vue';

import { getAvailableParamsDefinition } from '#/api';
import ApproveNode from '#/util/component/nodes/ApproveNode.vue';
import ConditionNode from '#/util/component/nodes/ConditionNode.vue';
import SimpleNode from '#/util/component/nodes/SimpleNode.vue';
import { useLayout } from '#/util/useLayout';

import useDragAndDrop from '../drop/useDnD';
import ApproveDrawer from './ApproveDrawer.vue';
import ConditionDrawer from './ConditionDrawer.vue';
import DropzoneBackground from './DropzoneBackground.vue';
import Sidebar from './Sidebar.vue';

const props = defineProps(['formula', 'matching', 'isRouter', 'isUpdate']);
const { addEdges, fitView, removeNodes, findNode } = useVueFlow();
const { layout } = useLayout();

const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop();

const nodes = ref([]);
const edges = ref([]);

// 条件编辑抽屉
const conditionDrawerVisible = ref(false);
const conditionDrawerData = ref<any>({
  params: [],
  conditions: [],
  logicType: 'and',
});
const currentEditingRow = ref<any>(null); // 当前正在编辑的行

// 审批配置抽屉
const approveDrawerVisible = ref(false);
const approveDrawerData = ref<any>({
  handlers: [],
  passVoteCount: 1,
});
const currentApproveNodeId = ref<null | string>(null); // 当前正在编辑的审批节点 ID

// region 节点操作

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

  await nextTick(() => {
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

  // 2. 从 edges 中计算 trueNext 和 falseNext，添加到判断节点的 data 中
  cleanedNodes.forEach((node: any) => {
    if (node.type === 'condition') {
      const outEdges = edges.value.filter(
        (edge: any) => edge.source === node.id,
      );
      const trueNextTargets: string[] = [];
      const falseNextTargets: string[] = [];
      outEdges.forEach((edge: any) => {
        if (edge.sourceHandle === 'yes') {
          trueNextTargets.push(edge.target);
        } else if (edge.sourceHandle === 'no') {
          falseNextTargets.push(edge.target);
        }
      });
      node.data.trueNext = trueNextTargets.join(',') || null;
      node.data.falseNext = falseNextTargets.join(',') || null;
    }
  });

  // 3. 构建邻接表
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

/**
 * 编辑按钮点击
 * @param row 工步数据
 */
function openOperationSettings(row: any): void {
  if (props.isRouter) {
    message.error('当前为路由模式');
    return;
  }

  // 获取上一级节点（连接到当前节点的节点）
  const previousEdgeIds = edges.value.filter(
    (edge: any) => edge.target === row.elId,
  );
  const previousNodes = previousEdgeIds
    .map((edge: any) => findNode(edge.source))
    .filter(Boolean);
  if (previousNodes.length === 0) {
    message.warning('当前节点没有上一级节点');
    return;
  }

  // 获取对应的节点ID（保存ID而不是引用）
  const targetNodeId = row.elId;

  // 获取 trueNext 和 falseNext（从 edges 中获取连接到当前节点"是/否"输出的目标节点）
  const outEdges = edges.value.filter(
    (edge: any) => edge.source === targetNodeId,
  );
  // 收集所有连接到"是"和"否"的目标节点 ID
  const trueNextIds: string[] = [];
  const falseNextIds: string[] = [];
  outEdges.forEach((edge: any) => {
    if (edge.sourceHandle === 'yes') {
      trueNextIds.push(edge.target);
    } else if (edge.sourceHandle === 'no') {
      falseNextIds.push(edge.target);
    }
  });

  // 保存当前编辑的节点ID
  currentEditingRow.value = { id: targetNodeId };

  // 获取上一级节点的 type，去重后拼接调用接口
  const functionTypes = [
    ...new Set(previousNodes.map((node: any) => node.data.type)),
  ].join(',');
  getAvailableParamsDefinition(functionTypes).then((res: any) => {
    // 每次从最新的 nodes 中查找节点
    const targetNode = findNode(targetNodeId);
    conditionDrawerData.value.params = res || [];
    // 初始化 conditions 和 logicType
    const existingConditions = targetNode?.data?.conditions;
    if (existingConditions?.conditions) {
      conditionDrawerData.value.conditions = existingConditions.conditions;
      conditionDrawerData.value.logicType = existingConditions.logic || 'and';
    } else {
      conditionDrawerData.value.conditions = [];
      conditionDrawerData.value.logicType = 'and';
    }
    // 初始化 trueNext 和 falseNext（显示节点 label，多个用逗号分隔）
    const getNodeLabels = (ids: string[]) => {
      if (ids.length === 0) return '';
      return ids.map((id) => findNode(id)?.data?.label || id).join('，');
    };
    conditionDrawerData.value.trueNext = getNodeLabels(trueNextIds) || '未连接';
    conditionDrawerData.value.falseNext =
      getNodeLabels(falseNextIds) || '未连接';
    conditionDrawerVisible.value = true;
  });
}

// 关闭条件编辑抽屉
function handleConditionDrawerClose() {
  conditionDrawerVisible.value = false;
  currentEditingRow.value = null;
}

// 保存条件配置
function handleConditionSave(data: any) {
  // 通过节点ID从最新的 nodes 中查找并更新
  const nodeId = currentEditingRow.value?.id;
  if (nodeId) {
    const node = findNode(nodeId);
    if (node) {
      node.data.conditions = {
        conditions: data.conditions,
        logic: data.logic,
      };
    }
  }
  // trueNext 和 falseNext 在 cleanAndCheckGraph 中从 edges 动态计算
  handleConditionDrawerClose();
}

// 打开审批设置
function openApproveSettings(row: any): void {
  if (props.isRouter) {
    message.error('当前为路由模式');
    return;
  }

  const nodeId = row.elId;
  const node = findNode(nodeId);
  if (!node) {
    message.error('节点不存在');
    return;
  }

  currentApproveNodeId.value = nodeId;
  // 初始化审批数据
  const approveData = node.data.approveConfig;
  approveDrawerData.value = {
    handlers: approveData?.handlers || [],
    passVoteCount: approveData?.passVoteCount || 1,
  };
  approveDrawerVisible.value = true;
}

// 关闭审批编辑抽屉
function handleApproveDrawerClose() {
  approveDrawerVisible.value = false;
  currentApproveNodeId.value = null;
}

// 保存审批配置
function handleApproveSave(data: any) {
  const nodeId = currentApproveNodeId.value;
  if (nodeId) {
    const node = findNode(nodeId);
    if (node) {
      node.data.approveConfig = {
        handlers: data.handlers,
        passVoteCount: data.passVoteCount,
      };
    }
  }
  handleApproveDrawerClose();
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
    nodes.value = details.filter((edge: any) => {
      const item = {
        ...edge,
      };
      // item.data.functionId = item.functionId;
      // item.data.functionTypeName = item.functionTypeName;
      return item;
    });
    edges.value = routes;
  },
  cleanAndCheckGraph,
});
// endregion
</script>

<template>
  <div class="mt-2 flex h-[80%]" @drop="onDrop">
    <Sidebar :is-router="isRouter" v-if="isUpdate" />

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

      <Panel class="process-panel" position="top-right" v-if="isUpdate">
        <div class="layout-panel">
          <button title="set horizontal layout" @click="layoutGraph('LR')">
            整理
          </button>
          <button title="set horizontal layout" @click="clear()">清空</button>
        </div>
      </Panel>
      <template #node-condition="p">
        <!-- 判断节点 -->
        <ConditionNode
          :id="p.id"
          :data="p.data"
          @del-node="delNode"
          @update="openOperationSettings"
          :hide-options="!isUpdate"
        />
      </template>
      <template #node-approve="p">
        <!-- 审批节点 -->
        <ApproveNode
          :id="p.id"
          :data="p.data"
          @del-node="delNode"
          @update="openApproveSettings"
          :hide-options="!isUpdate"
        />
      </template>
      <template #node-menu="p">
        <!-- 普通节点（开始/结束/工步） -->
        <SimpleNode
          :id="p.id"
          :data="p.data"
          @del-node="delNode"
          :hide-options="!isUpdate"
        />
      </template>
      <MiniMap pannable zoomable />
    </VueFlow>

    <!-- 条件编辑抽屉 -->
    <ConditionDrawer
      v-model:open="conditionDrawerVisible"
      :data="conditionDrawerData"
      @close="handleConditionDrawerClose"
      @save="handleConditionSave"
    />

    <!-- 审批配置抽屉 -->
    <ApproveDrawer
      v-model:open="approveDrawerVisible"
      :data="approveDrawerData"
      @close="handleApproveDrawerClose"
      @save="handleApproveSave"
    />
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
