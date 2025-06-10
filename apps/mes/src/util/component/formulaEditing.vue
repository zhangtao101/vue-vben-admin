<script setup lang="ts">
import { h, nextTick, ref } from 'vue';

import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Background } from '@vue-flow/background';
// eslint-disable-next-line n/no-extraneous-import
import { Controls } from '@vue-flow/controls';
// eslint-disable-next-line n/no-extraneous-import
import { Panel, Position, useVueFlow, VueFlow } from '@vue-flow/core';
// eslint-disable-next-line n/no-extraneous-import
import { MiniMap } from '@vue-flow/minimap';
import { Button, Drawer, message, Modal, Select, Space } from 'ant-design-vue';

import NodeConfiguration from '#/util/component/nodeConfiguration.vue';
import ToolbarNode from '#/util/component/nodes/ToolbarNode.vue';
import { useLayout } from '#/util/useLayout';

// region 抽屉

const isOpen = ref(false);

function submit() {
  cleanAndCheckGraph();
  // console.log('submit!', cleanAndCheckGraph());
}

// endregion

// region 图表

const nodes = ref([
  {
    id: 'start',
    type: 'menu',
    data: { label: '开始', toolbarPosition: Position.Top },
    position: { x: 0, y: 0 },
  },
  {
    id: 'end',
    type: 'menu',
    data: { label: '结束', toolbarPosition: Position.Top },
    position: { x: 200, y: 0 },
  },
]);

const edges = ref([
  {
    id: 'estart->end',
    source: 'start',
    target: 'end',
    animated: true,
  },
]);

const { layout } = useLayout();

const { fitView, addEdges, removeNodes } = useVueFlow();

async function layoutGraph(direction: any) {
  nodes.value = layout(nodes.value, edges.value, direction);

  nextTick(() => {
    fitView();
  });
}

const changedType = ref<any>();
const typeOptions = ref<any>([
  {
    label: '节点1',
    value: '1',
  },
  {
    label: '节点2',
    value: '2',
  },
  {
    label: '节点3',
    value: '3',
  },
]);
function showCreate(data: any) {
  Modal.confirm({
    title: '请选择节点类型!',
    content: h(Select, {
      options: typeOptions.value,
      onChange(_value: any, item: any) {
        changedType.value = item;
      },
      class: 'w-full',
    }),
    okText: '确定',
    cancelText: '取消',
    onOk() {
      if (changedType.value) {
        const targetId = addNode();
        setTimeout(() => {
          onConnect({
            source: data.id,
            target: targetId,
            sourceHandle: null,
            targetHandle: null,
          });
        }, 100);
        setTimeout(() => {
          layoutGraph('LR');
        }, 300);
      } else {
        message.error('请选择节点类型!');
      }
    },
  });
}

/**
 * 删除节点
 * @param data
 */
function delNode(data: any) {
  removeNodes([data.id]);
  layoutGraph('LR');
}

/**
 * 新增节点
 */
function addNode() {
  const id = Date.now().toString();
  nodes.value.push({
    data: {
      label: changedType.value.label,
      toolbarPosition: Position.Top,
    },
    id,
    position: { x: 150, y: 50 },
    type: 'menu',
  });
  return id;
}

function onConnect(params: any) {
  params.animated = true;
  addEdges([params]);
}

function cleanAndCheckGraph(endNodeId = 'end') {
  // 1. 删除孤岛节点
  const connectedNodeIds = new Set();
  edges.value.forEach((edge) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  const cleanedNodes = nodes.value.filter((node) =>
    connectedNodeIds.has(node.id),
  );

  // 2. 构建邻接表
  const adj = new Map();
  cleanedNodes.forEach((node) => adj.set(node.id, []));
  edges.value.forEach((edge) => {
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
  const targetIds = new Set(edges.value.map((e) => e.target));
  const sourceNodes = cleanedNodes.filter((node) => !targetIds.has(node.id));

  const allPathsValid = sourceNodes.every((node) => dfs(node.id));

  return {
    cleanedNodes,
    allPathsLeadToEnd: allPathsValid,
  };
}

// endregion

// region 配方触发器及执行动作修改
const nodeConfigurationRef = ref();
function update(data: any) {
  nodeConfigurationRef.value.open(data.id);
}
// endregion

// region 暴露方法

const open = () => {
  isOpen.value = true;
  setTimeout(() => {
    // graphInit();
  }, 800);
};

defineExpose({
  open,
});

// endregion
</script>

<template>
  <Drawer
    v-model:open="isOpen"
    :title="$t('operationFormulaView.formulaEditing')"
    :footer-style="{ textAlign: 'right' }"
    width="100%"
  >
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      fit-view-on-init
      class="h-full w-full"
      :default-viewport="{ zoom: 1.5 }"
      :min-zoom="0.2"
      :max-zoom="4"
      :elements-selectable="true"
      :nodes-draggable="true"
      @connect="onConnect"
    >
      <template #node-menu="props">
        <ToolbarNode
          :id="props.id"
          :data="props.data"
          @show-create="showCreate"
          @del-node="delNode"
          @update="update"
        />
      </template>
      <Panel class="process-panel" position="top-right">
        <div class="layout-panel">
          <button
            title="set horizontal layout"
            @click="layoutGraph('LR')"
          ></button>
        </div>
      </Panel>
      <Background />
      <Controls />
      <MiniMap pannable zoomable />
    </VueFlow>

    <template #footer>
      <Space>
        <!-- 取消 -->
        <Button>
          {{ $t('common.cancel') }}
        </Button>
        <!-- 提交  -->
        <Button type="primary" @click="submit">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>

  <NodeConfiguration ref="nodeConfigurationRef" />
</template>

<style>
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
