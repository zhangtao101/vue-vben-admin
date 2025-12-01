<script setup lang="ts">
/* -------------------------------------------  Imports  ------------------------------------------- */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import { ScrollBoard } from '@kjgl77/datav-vue3';

import { queryScadaAlertLogList, queryScadaDictsByType } from '#/api'; // 按项目实际路径调整

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{ detail: any; editMode?: boolean }>();

/* -------------------------------------------  字典  ------------------------------------------- */
const dictAlertLevel = ref<any>([]);
const dictProcessStatus = ref<any>([]);
function queryDict() {
  Promise.all([
    queryScadaDictsByType('iot_alert_level'),
    queryScadaDictsByType('iot_process_status'),
  ]).then((result) => {
    dictAlertLevel.value = result[0];
    dictProcessStatus.value = result[1];
  });
}

/* -------------------------------------------  本地状态  ------------------------------------------- */
const key = ref(Date.now());
const timer = ref<null | number>(null);

/* -------------------------------------------  计算：滚动板配置  ------------------------------------------- */
const boardConfig = computed(() => ({
  rowNum: props.detail.style.rowNum,
  data: tableData.value || [],
  header: props.detail.style.header,
  headerBGC: props.detail.style.headerBGC,
  oddRowBGC: props.detail.style.oddRowBGC,
  evenRowBGC: props.detail.style.evenRowBGC,
  waitTime: props.detail.style.waitTime,
  headerHeight: props.detail.style.headerHeight,
  columnWidth: props.detail.style.columnWidth.split(','),
  align: props.detail.style.align,
  index: props.detail.style.index,
  indexHeader: props.detail.style.indexHeader,
  carousel: props.detail.style.carousel,
}));

const wrapperStyle = computed(() => ({
  width: `${props.detail.style.position.w}px`,
  height: `${props.detail.style.position.h}px`,
  color: props.detail.style.foreColor,
}));

/* -------------------------------------------  工具：获取字典标签  ------------------------------------------- */
function getSpecifiedElement(dict: any[], val: number | string): string {
  const obj = dict.find((item) => item.value === val);
  if (!obj || obj.raw.listClass === 'default' || !obj.raw.listClass)
    return obj?.label || '';
  return `<span style="color:${getColor(obj.raw.listClass)};">${obj.label}</span>`;
}

function getColor(type: string): string {
  const map: Record<string, string> = {
    primary: '#1890ff',
    success: '#13ce66',
    warning: '#ffba00',
    danger: '#ff4949',
  };
  return map[type] || '#000';
}

/* -------------------------------------------  加载告警列表  ------------------------------------------- */
const tableData = ref<any>([]);
function loadData() {
  queryScadaAlertLogList({ pageNum: 1, pageSize: 9999 }).then((res: any) => {
    if (res.code !== 200) return;
    const data: string[][] = [];
    res.rows.forEach((item: any) => {
      data.push([
        item.createTime,
        item.alertName,
        item.deviceName,
        getSpecifiedElement(dictAlertLevel.value, item.alertLevel),
        getSpecifiedElement(dictProcessStatus.value, item.status),
      ]);
    });
    /* 只改本地副本，不直接改 props */
    tableData.value = data;
    key.value = Date.now();
  });
}

/* -------------------------------------------  生命周期  ------------------------------------------- */
onMounted(() => {
  loadData();
  queryDict();
  timer.value = window.setInterval(loadData, 60_000 * 5);
});

onBeforeUnmount(() => {
  if (timer.value) clearInterval(timer.value);
});
</script>

<template>
  <div :key="key">
    <ScrollBoard :config="boardConfig" :style="wrapperStyle" />
  </div>
</template>

<style lang="scss" scoped></style>
