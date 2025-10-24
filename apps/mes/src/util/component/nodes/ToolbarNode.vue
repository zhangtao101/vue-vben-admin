<script setup>
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import { Handle, Position } from '@vue-flow/core';
import { NodeToolbar } from '@vue-flow/node-toolbar';
import { Button, Tooltip } from 'ant-design-vue';

const props = defineProps(['id', 'data']);
const emit = defineEmits(['showCreate', 'delNode', 'update']);
// const { updateNodeData } = useVueFlow();
// region 类型选择

function showCreate() {
  emit('showCreate', {
    id: props.id,
  });
}
function delNode() {
  emit('delNode', {
    id: props.id,
  });
}
function update() {
  emit('update', {
    id: props.id,
  });
}

// endregion
</script>

<template>
  <NodeToolbar v-if="id !== 'end'" :position="data.toolbarPosition">
    <Tooltip v-if="id !== 'start'">
      <template #title>{{ $t('common.edit') }}</template>
      <Button type="link" @click="update()">
        <Icon icon="mdi:square-edit-outline" class="text-xl" />
      </Button>
    </Tooltip>
    <Tooltip>
      <template #title>{{ $t('common.add') }}</template>
      <Button type="link" @click="showCreate()">
        <Icon icon="mdi:add" class="text-xl" />
      </Button>
    </Tooltip>
    <Tooltip v-if="id !== 'start'">
      <template #title>{{ $t('common.delete') }}</template>
      <Button type="link" @click="delNode()">
        <Icon icon="mdi-light:delete" class="text-xl" />
      </Button>
    </Tooltip>
  </NodeToolbar>

  <div>
    {{ data.label }}
  </div>

  <Handle type="target" :position="Position.Left" v-if="id !== 'start'" />
  <Handle type="source" :position="Position.Right" v-if="id !== 'end'" />
</template>
<style scoped lang="scss">
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
</style>
