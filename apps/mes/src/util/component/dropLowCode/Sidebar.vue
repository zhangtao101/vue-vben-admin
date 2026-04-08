<script setup>
import { onMounted, ref } from 'vue';

import { Position } from '@vue-flow/core';

import { listOpFunctionTypeDefinition } from '#/api';

import useDragAndDrop from '../drop/useDnD';

const props = defineProps(['isRouter']);

const { onDragStart } = useDragAndDrop();

const nodes = ref([]);

function queryNode() {
  const ob = listOpFunctionTypeDefinition();
  ob.then((data) => {
    nodes.value = [];
    data.forEach((item) => {
      const data = {
        type: `${item.value}`,
        label: item.label,
        toolbarPosition: Position.Top,
        processType: 1,
      };
      if (props.isRouter) {
        Object.assign(data, {
          turnTime: 0,
        });
      }
      nodes.value.push({
        ...item,
        data,
      });
    });
  });
}

onMounted(() => {
  queryNode();
});

// 节点配置列表
// 开始/结束节点
const flowNodes = [
  {
    id: 'start',
    label: '开始',
    type: 'start',
    nodeType: 'simple',
  },
  {
    id: 'end',
    label: '结束',
    type: 'end',
    nodeType: 'simple',
  },
];

// 判断节点
const conditionNode = {
  label: '判断',
  type: 'condition',
  nodeType: 'condition',
};

// 审批节点
const approveNode = {
  label: '审批',
  type: 'approve',
  nodeType: 'approve',
};
</script>

<template>
  <aside class="node-sidebar">
    <div class="sidebar-header">
      <span>节点列表</span>
    </div>

    <div class="sidebar-content">
      <!-- 流程节点 -->
      <div class="section-title">流程节点</div>
      <div class="node-grid">
        <div
          v-for="item in flowNodes"
          :key="item.id"
          :class="
            item.id === 'start' ? 'node-card node-start' : 'node-card node-end'
          "
          draggable="true"
          @dragstart="
            onDragStart($event, 'menu', {
              id: item.id,
              data: {
                type: item.type,
                label: item.label,
                toolbarPosition: Position.Top,
              },
            })
          "
        >
          <span class="node-label">{{ item.label }}</span>
        </div>
      </div>

      <!-- 判断节点 -->
      <div class="section-title">判断节点</div>
      <div class="node-grid">
        <div
          class="node-card node-condition"
          draggable="true"
          @dragstart="
            onDragStart($event, conditionNode.type, {
              data: {
                type: conditionNode.type,
                label: conditionNode.label,
                toolbarPosition: Position.Top,
              },
            })
          "
        >
          <span class="node-label">{{ conditionNode.label }}</span>
        </div>
      </div>

      <!-- 审批节点 -->
      <div class="section-title">审批节点</div>
      <div class="node-grid">
        <div
          class="node-card node-approve"
          draggable="true"
          @dragstart="
            onDragStart($event, approveNode.type, {
              data: {
                type: approveNode.type,
                label: approveNode.label,
                toolbarPosition: Position.Top,
              },
            })
          "
        >
          <span class="node-label">{{ approveNode.label }}</span>
        </div>
      </div>

      <!-- 工步节点列表 -->
      <div class="section-title">工步节点</div>
      <div class="node-grid">
        <div
          v-for="item of nodes"
          :key="item.value"
          class="node-card node-step"
          draggable="true"
          @dragstart="onDragStart($event, 'menu', item)"
        >
          <span class="node-label">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.node-sidebar {
  display: flex;
  flex-direction: column;
  width: 260px;
  height: 100%;
  overflow: hidden;
  background: #fff;
  border-right: 1px solid #e8e8e8;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
}

.sidebar-content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2px;
  }
}

.section-title {
  padding-bottom: 6px;
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  border-bottom: 1px solid #f0f0f0;
}

.node-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
}

.node-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  font-size: 12px;
  color: #333;
  cursor: grab;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: #fff;
    background: #1890ff;
    border-color: #1890ff;
  }

  &:active {
    cursor: grabbing;
  }
}

.node-start {
  color: #52c41a;
  background: #f6ffed;
  border-color: #b7eb8f;

  &:hover {
    background: #52c41a;
    border-color: #52c41a;
  }
}

.node-end {
  color: #fa541c;
  background: #fff2e8;
  border-color: #ffbb96;

  &:hover {
    background: #fa541c;
    border-color: #fa541c;
  }
}

.node-condition {
  color: #faad14;
  background: #fffbe6;
  border-color: #ffe58f;

  &:hover {
    background: #faad14;
    border-color: #faad14;
  }
}

.node-approve {
  color: #1890ff;
  background: #e6f7ff;
  border-color: #91d5ff;

  &:hover {
    background: #1890ff;
    border-color: #1890ff;
  }
}
</style>
