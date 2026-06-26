<script setup>
import { onMounted, ref } from 'vue';

import { Position } from '@vue-flow/core';

import { allProceLabel, queryNodes } from '#/api';

import useDragAndDrop from './useDnD';

const props = defineProps(['isRouter']);

const { onDragStart } = useDragAndDrop();

const nodes = ref([]);
function queryNode() {
  const ob = props.isRouter ? allProceLabel() : queryNodes();
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
</script>

<template>
  <aside
    class="overflow-y-auto border-r border-solid border-gray-200 bg-white px-3 py-4 font-bold text-gray-800 shadow-md dark:border-slate-600 dark:bg-gradient-to-b dark:from-slate-700 dark:to-slate-900 dark:text-white dark:shadow-xl"
  >
    <div class="mb-4 text-lg tracking-wide">节点列表</div>

    <div class="grid grid-cols-2 gap-3">
      <div
        class="cursor-grab rounded-lg border-2 border-emerald-300 bg-emerald-500 p-2 text-center font-semibold text-white shadow-lg transition hover:bg-emerald-600 hover:shadow-xl active:cursor-grabbing"
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
        class="cursor-grab rounded-lg border-2 border-rose-300 bg-rose-500 p-2 text-center font-semibold text-white shadow-lg transition hover:bg-rose-600 hover:shadow-xl active:cursor-grabbing"
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

      <hr class="col-span-2 border-gray-200 dark:border-slate-500" />

      <div class="col-span-2 grid grid-cols-2 gap-3">
        <div
          class="cursor-grab rounded-lg border-2 border-sky-300 bg-sky-500 p-2 text-center font-semibold text-white shadow-lg transition hover:bg-sky-600 hover:shadow-xl active:cursor-grabbing"
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
