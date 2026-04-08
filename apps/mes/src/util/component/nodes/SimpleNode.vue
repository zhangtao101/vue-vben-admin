<script setup>
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import { Handle, Position } from '@vue-flow/core';
import { NodeToolbar } from '@vue-flow/node-toolbar';
import { Button, Tooltip } from 'ant-design-vue';

const props = defineProps(['id', 'data', 'hideOptions']);
const emit = defineEmits(['delNode']);

/**
 * 删除节点
 */
function handleDelete() {
  emit('delNode', {
    id: props.id,
  });
}
</script>

<template>
  <NodeToolbar :position="data.toolbarPosition" v-if="!hideOptions">
    <Tooltip>
      <template #title>{{ $t('common.delete') }}</template>
      <Button type="link" @click="handleDelete()" danger>
        <Icon icon="mdi:delete-outline" class="text-xl" />
      </Button>
    </Tooltip>
  </NodeToolbar>

  <div>
    {{ data.label }}
  </div>

  <Handle type="target" :position="Position.Left" v-if="id !== 'start'" />
  <Handle type="source" :position="Position.Right" v-if="id !== 'end'" />
</template>

<style lang="scss" scoped>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
</style>
