<script setup>
import { onMounted, ref } from 'vue';

import { Position } from '@vue-flow/core';

import { queryNodes } from '#/api';

import useDragAndDrop from './useDnD';

const { onDragStart } = useDragAndDrop();

const nodes = ref([]);
function queryNode() {
  queryNodes().then((data) => {
    nodes.value = [];
    data.forEach((item) => {
      nodes.value.push({
        ...item,
        data: {
          type: `${item.value}`,
          label: item.label,
          toolbarPosition: Position.Top,
        },
      });
    });
  });
}

onMounted(() => {
  queryNode();
});
</script>

<template>
  <aside
    class="overflow-y-auto border-r-[1px] border-solid border-white bg-[#10b981bf] px-[10px] py-[15px] font-[700] text-white shadow-md"
  >
    <div class="mb-4 text-xl">节点列表</div>

    <div class="grid grid-cols-2 gap-4 font-[500]">
      <div
        class="cursor-grab border-2 border-solid p-2 text-center shadow-md"
        :draggable="true"
        @dragstart="
          onDragStart($event, 'menu', {
            id: 'start',
            data: {
              type: 'start',
              label: '开始',
              toolbarPosition: Position.Top,
            },
          })
        "
      >
        开始
      </div>

      <div
        class="cursor-grab border-2 border-solid p-2 text-center shadow-md"
        :draggable="true"
        @dragstart="
          onDragStart($event, 'menu', {
            id: 'end',
            data: { type: 'end', label: '结束', toolbarPosition: Position.Top },
          })
        "
      >
        结束
      </div>

      <hr class="col-span-2" />

      <div class="col-span-2 grid grid-cols-2 gap-4">
        <div
          class="cursor-grab border-2 border-solid p-2 text-center shadow-md"
          :draggable="true"
          @dragstart="onDragStart($event, 'menu', item)"
          v-for="item of nodes"
          :key="item.value"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
  </aside>
</template>

<style lang="scss"></style>
