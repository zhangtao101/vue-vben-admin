<script setup lang="ts">
/* -------------------------------------------  Imports  ------------------------------------------- */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { ScrollBoard } from '@kjgl77/datav-vue3';
import { Spin } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestClient } from '#/api/request';
// import { useTopoStore } from '#/store';

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{ detail: any; editMode?: boolean }>();

/* -------------------------------------------  Store & Route  ------------------------------------------- */
const route = useRoute();
// const topoStore = useTopoStore();

/* -------------------------------------------  本地状态  ------------------------------------------- */
const loading = ref(false);
const key = ref(Date.now());
const realData = ref<any[]>([]);

/* -------------------------------------------  计算：表头变化触发器  ------------------------------------------- */
const headerChange = computed(() => props.detail.style.header as string[]);

/* -------------------------------------------  计算：滚动板配置  ------------------------------------------- */
const boardConfig = computed(() => ({
  rowNum: props.detail.style.rowNum,
  data: realData.value,
  header: props.detail.style.header,
  headerBGC: props.detail.style.headerBGC,
  oddRowBGC: props.detail.style.oddRowBGC,
  evenRowBGC: props.detail.style.evenRowBGC,
  waitTime: props.detail.style.waitTime,
  headerHeight: props.detail.style.headerHeight,
  columnWidth: props.detail.style.columnWidth.split(','),
  align: [] as string[],
  index: props.detail.style.index,
  indexHeader: props.detail.style.indexHeader,
  carousel: props.detail.style.carousel,
}));

const wrapperStyle = computed(() => ({
  width: `${props.detail.style.position.w}px`,
  height: `${props.detail.style.position.h}px`,
  color: props.detail.style.foreColor,
}));

const placeholderStyle = computed<any>(() => ({
  width: `${props.detail.style.position.w}px`,
  height: `${props.detail.style.position.h}px`,
  textAlign: 'center',
  lineHeight: `${props.detail.style.position.h}px`,
  fontSize: '30px',
  color: '#368a42',
}));

/* -------------------------------------------  工具：格式化时间  ------------------------------------------- */
function leaveTime(value: string): string {
  return dayjs(value).format('HH:mm');
}

/* -------------------------------------------  获取实时数据  ------------------------------------------- */
function getList() {
  if (headerChange.value.length === 0) return;
  loading.value = true;
  requestClient
    .get('prod-api/ghxx/bDeviceHistory/getRealDataList', {
      params: {
        ztGuid: route.query.guid,
        headListStr: headerChange.value.join(';'),
      },
    })
    .then((res: any) => {
      const tableList = res.data.data.tableList as any[][];
      const sdata: string[][] = [];
      tableList.forEach((row) => {
        const data: string[] = [];
        row.forEach((cell, idx) => {
          data.push(idx === 0 ? leaveTime(cell) : cell);
        });
        sdata.push(data);
      });
      realData.value = sdata;
      key.value = Date.now();
    })
    .finally(() => (loading.value = false));
}

/* -------------------------------------------  监听：表头变化  ------------------------------------------- */
watch(headerChange, getList);

/* -------------------------------------------  生命周期  ------------------------------------------- */
onMounted(() => {
  realData.value = []; // 清空旧数据
  getList();
  const timer = window.setInterval(getList, 60_000);
  onBeforeUnmount(() => clearInterval(timer));
});
</script>

<template>
  <Spin :spinning="loading">
    <ScrollBoard
      v-if="headerChange.length > 0"
      :config="boardConfig"
      :style="wrapperStyle"
    />
    <div v-else :style="placeholderStyle">请绑定变量</div>
  </Spin>
</template>

<style lang="scss" scoped></style>
