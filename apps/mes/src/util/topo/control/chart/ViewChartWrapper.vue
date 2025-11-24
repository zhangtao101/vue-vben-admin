<script lang="ts" setup>
/* --------------------------------------------------  Imports  -------------------------------------------------- */
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';

import { message } from 'ant-design-vue';
import * as echarts from 'echarts';

import { queryEchartById } from '#/api';
import { requestClient } from '#/api/request';
import chartOption from '#/assets/topo-data/chart-option';
// import {useTopoAnimation} from "#/util/topo/useTopoAnimation";

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{ detail: any; editMode: boolean }>();

/* -------------------------------------------  DOM  ------------------------------------------- */
const xwin = ref<HTMLDivElement>();

/* -------------------------------------------  图表实例 & 定时器  ------------------------------------------- */
let echartInst: echarts.ECharts | null = null;
let timer: null | number = null;

/* -------------------------------------------  本地副本（只读）  ------------------------------------------- */
const echartOption = ref(props.detail.dataBind.echartOption as string);
const echartRunTS = ref(props.detail.dataBind.echartRun as number);
const echartUrl = ref(props.detail.dataBind.echartUrl as string);
const echartSecond = ref((props.detail.dataBind.echartSecond || 60) as number);
const echartData = ref(props.detail.dataBind.echartData as string);

/* -------------------------------------------  动画能力  ------------------------------------------- */
// const { play, pause } = useTopoAnimation(props.detail, props.editMode);

/* -------------------------------------------  计算：运行标记  ------------------------------------------- */
const echartRunFlag = computed(() => {
  const opt = echartOption.value;
  const ts = echartRunTS.value;
  if (props.editMode && opt && ts > Date.now() - 10_000) return opt + ts;
  return '';
});

/* -------------------------------------------  副作用：运行图表  ------------------------------------------- */
watch(
  echartRunFlag,
  () => {
    nextTick(() => {
      if (!echartRunFlag.value) return;
      try {
        const funStr = chartOption.getFun(echartOption.value);
        // eslint-disable-next-line no-eval
        const fun = eval(`(${funStr})`);
        let data: any = {};
        if (echartData.value) {
          try {
            data = JSON.parse(echartData.value);
          } catch {
            message.warning('请输入正确的 JSON 数据');
          }
        }
        const option = fun(echarts, data);
        loadData(option);
        onResize();
        message.success('运行成功');
      } catch {
        message.warning('图表初始化失败，请检查代码视图！');
      }
    });
  },
  {
    immediate: true,
  },
);

/* -------------------------------------------  载入图表  ------------------------------------------- */
function loadData(option: any) {
  if (echartInst) echartInst.dispose();
  if (!xwin.value) return;
  echartInst = echarts.init(xwin.value);
  echartInst.setOption(option);
}

/* -------------------------------------------  尺寸调整  ------------------------------------------- */
function onResize() {
  echartInst?.resize();
}

/* -------------------------------------------  初始化图表  ------------------------------------------- */
function initEchart() {
  if (!echartOption.value) {
    echartOption.value = chartOption.getOption();
    const funStr = chartOption.getFun(echartOption.value);
    // eslint-disable-next-line no-eval
    const fun = eval(`(${funStr})`);
    let data: any = {};
    if (echartData.value) data = JSON.parse(echartData.value);
    const option = fun(echarts, data);
    loadData(option);
    nextTick(onResize);
    return;
  }

  /* 使用预制图表 ID */
  if (echartOption.value.includes('echartId-')) {
    const id = echartOption.value.split('-')[1];
    id && getEchartDataById(id);
    return;
  }

  /* 自定义代码 */
  const funStr = chartOption.getFun(echartOption.value);
  // eslint-disable-next-line no-eval
  const fun = eval(`(${funStr})`);
  let data: any = {};
  if (echartData.value) data = JSON.parse(echartData.value);
  const option = fun(echarts, data);
  loadData(option);
  nextTick(onResize);
}

/* -------------------------------------------  通过 ID 获取图表  ------------------------------------------- */
function getEchartDataById(id: string) {
  queryEchartById(id).then((res: any) => {
    if (res.code === 200) {
      const funStr = chartOption.getFun(res.data.echartData);
      // eslint-disable-next-line no-eval
      const fun = eval(`(${funStr})`);
      let data: any = {};
      if (echartData.value) data = JSON.parse(echartData.value);
      const option = fun(echarts, data);
      loadData(option);
      nextTick(onResize);
    }
  });
}

/* -------------------------------------------  远程数据轮询  ------------------------------------------- */
function getEchartData(url: string) {
  requestClient.get(url).then((res: any) => {
    echartData.value = JSON.stringify(res.data);
    initEchart();
  });
}

/* -------------------------------------------  生命周期  ------------------------------------------- */
onMounted(() => {
  if (props.editMode && echartUrl.value) {
    const ms = echartSecond.value * 1000;
    getEchartData(echartUrl.value);
    timer = window.setInterval(() => getEchartData(echartUrl.value), ms);
  } else {
    initEchart();
  }
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
  echartInst?.dispose();
});
</script>

<template>
  <div ref="xwin" class="view-chart-wrapper"></div>
</template>

<style lang="scss">
.view-chart-wrapper {
  width: 100%;
  height: 100%;
  padding: 10px;
}
</style>
