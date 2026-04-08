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
    id: props.data.functionId,
    functionTypeName: props.data.functionTypeName,
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

  <div class="approve-node">
    <div class="approve-content">
      <Icon icon="mdi:checkbox-marked-circle-outline" class="approve-icon" />
      <span>{{ data.label }}</span>
    </div>
  </div>

  <!-- 左侧输入 -->
  <Handle type="target" :position="Position.Left" />
  <!-- 右侧输出 -->
  <Handle type="source" :position="Position.Right" id="output" />
</template>

<style lang="scss" scoped>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.approve-node {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgb(24 144 255 / 40%);

  .approve-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    color: #fff;
    text-align: center;

    .approve-icon {
      font-size: 20px;
    }
  }
}
</style>
