<script setup>
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import { Handle, Position } from '@vue-flow/core';
import { NodeToolbar } from '@vue-flow/node-toolbar';
import { Button, Tooltip } from 'ant-design-vue';

const props = defineProps(['id', 'data', 'hideOptions']);
const emit = defineEmits(['delNode', 'update']);

/**
 * 删除节点
 */
function handleDelete() {
  emit('delNode', {
    id: props.id,
  });
}

/**
 * 编辑节点
 */
function handleEdit() {
  emit('update', {
    elId: props.id,
    data: props.data,
  });
}
</script>

<template>
  <NodeToolbar :position="data.toolbarPosition" v-if="!hideOptions">
    <Tooltip>
      <template #title>{{ $t('common.edit') }}</template>
      <Button type="link" @click="handleEdit()">
        <Icon icon="mdi:pencil" class="text-xl" />
      </Button>
    </Tooltip>
    <Tooltip>
      <template #title>{{ $t('common.delete') }}</template>
      <Button type="link" @click="handleDelete()" danger>
        <Icon icon="mdi:delete-outline" class="text-xl" />
      </Button>
    </Tooltip>
  </NodeToolbar>

  <div class="condition-node">
    <div class="condition-content">
      {{ data.label }}
    </div>
  </div>

  <!-- 左侧输入 -->
  <Handle type="target" :position="Position.Left" />

  <!-- 上方输出 - 通过（绿色） -->
  <div class="handle-label handle-yes">
    <span>是</span>
  </div>
  <Handle
    type="source"
    :position="Position.Top"
    :style="{ left: '50%', backgroundColor: '#52c41a', borderColor: '#52c41a' }"
    id="yes"
  />

  <!-- 下方输出 - 不通过（红色） -->
  <div class="handle-label handle-no">
    <span>否</span>
  </div>
  <Handle
    type="source"
    :position="Position.Bottom"
    :style="{ left: '50%', backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }"
    id="no"
  />
</template>

<style lang="scss" scoped>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.condition-node {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #faad14, #d48806);
  border: none;
  transform: rotate(45deg);

  .condition-content {
    font-size: 12px;
    font-weight: 500;
    color: #fff;
    white-space: nowrap;
    transform: rotate(-45deg);
  }
}

:deep(.vue-flow__node) {
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.handle-label {
  position: absolute;
  z-index: 1;
  font-size: 12px;
  font-weight: 500;

  &.handle-yes {
    top: -22px;
    left: 50%;
    color: #52c41a;
    transform: translateX(-50%);
  }

  &.handle-no {
    bottom: -22px;
    left: 50%;
    color: #ff4d4f;
    transform: translateX(-50%);
  }
}
</style>
