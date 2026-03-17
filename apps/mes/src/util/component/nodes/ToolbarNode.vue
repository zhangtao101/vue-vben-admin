<script setup>
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import { Handle, Position } from '@vue-flow/core';
import { NodeToolbar } from '@vue-flow/node-toolbar';
import { Button, Tooltip } from 'ant-design-vue';

const props = defineProps(['id', 'data', 'hideOptions']);
const emit = defineEmits(['showCreate', 'delNode', 'update', 'bind']);
// const { updateNodeData } = useVueFlow();
// region 类型选择

// function showCreate() {
//   emit('showCreate', {
//     id: props.id,
//   });
// }
/**
 * 删除
 */
function delNode() {
  emit('delNode', {
    id: props.id,
  });
}

/**
 * 修改
 */
function update() {
  emit('update', {
    elId: props.id,
    id: props.data.functionId,
    functionTypeName: props.data.functionTypeName,
  });
}

/**
 * 绑定
 */
function bind() {
  emit('bind', {
    elId: props.id,
    id: props.data.functionId,
    functionTypeName: props.data.functionTypeName,
  });
}

// endregion
</script>

<template>
  <NodeToolbar :position="data.toolbarPosition" v-if="!hideOptions">
    <!--
    <Tooltip>
      <template #title>{{ $t('common.add') }}</template>
      <Button type="link" @click="showCreate()">
        <Icon icon="mdi:add" class="text-xl" />
      </Button>
    </Tooltip>-->
    <Tooltip v-if="!['start', 'end'].includes(id)">
      <template #title>{{ $t('common.edit') }}</template>
      <Button type="link" @click="update()">
        <Icon icon="mdi:pencil" class="text-xl" />
      </Button>
    </Tooltip>
    <Tooltip
      v-if="
        data.turnTime >= 0 &&
        data.routeDetailId &&
        !['start', 'end'].includes(id)
      "
    >
      <template #title>{{ $t('common.bind') }}</template>
      <Button type="link" @click="bind()">
        <Icon icon="mdi:link-variant" class="text-xl" />
      </Button>
    </Tooltip>
    <Tooltip>
      <template #title>{{ $t('common.delete') }}</template>
      <Button type="link" @click="delNode()" danger>
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
<style scoped lang="scss">
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
</style>
