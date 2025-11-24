<script setup lang="ts">
/* -------------------------------------------  Imports  ------------------------------------------- */
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

import { requestClient } from '#/api/request';
import anhuiJson from '#/assets/echarts-map-json/province/anhui.json';
import aomenJson from '#/assets/echarts-map-json/province/aomen.json';
import beijingJson from '#/assets/echarts-map-json/province/beijing.json';
import chongqingJson from '#/assets/echarts-map-json/province/chongqing.json';
import fujianJson from '#/assets/echarts-map-json/province/fujian.json';
import gansuJson from '#/assets/echarts-map-json/province/gansu.json';
import guangdongJson from '#/assets/echarts-map-json/province/guangdong.json';
import guangxiJson from '#/assets/echarts-map-json/province/guangxi.json';
import guizhouJson from '#/assets/echarts-map-json/province/guizhou.json';
import hainanJson from '#/assets/echarts-map-json/province/hainan.json';
import hebeiJson from '#/assets/echarts-map-json/province/hebei.json';
import heilongjiangJson from '#/assets/echarts-map-json/province/heilongjiang.json';
/* 省级地图 JSON  */
import henanJson from '#/assets/echarts-map-json/province/henan.json';
import hubeiJson from '#/assets/echarts-map-json/province/hubei.json';
import hunanJson from '#/assets/echarts-map-json/province/hunan.json';
import jiangsuJson from '#/assets/echarts-map-json/province/jiangsu.json';
import jiangxiJson from '#/assets/echarts-map-json/province/jiangxi.json';
import jilinJson from '#/assets/echarts-map-json/province/jilin.json';
import liaoningJson from '#/assets/echarts-map-json/province/liaoning.json';
import neimengguJson from '#/assets/echarts-map-json/province/neimenggu.json';
import ningxiaJson from '#/assets/echarts-map-json/province/ningxia.json';
import qinghaiJson from '#/assets/echarts-map-json/province/qinghai.json';
import shandongJson from '#/assets/echarts-map-json/province/shandong.json';
import shanghaiJson from '#/assets/echarts-map-json/province/shanghai.json';
import shanxiJson from '#/assets/echarts-map-json/province/shanxi1.json';
import sichuanJson from '#/assets/echarts-map-json/province/sichuan.json';
import taiwanJson from '#/assets/echarts-map-json/province/taiwan.json';
import tianjinJson from '#/assets/echarts-map-json/province/tianjin.json';
import xianggangJson from '#/assets/echarts-map-json/province/xianggang.json';
import xinjiangJson from '#/assets/echarts-map-json/province/xinjiang.json';
import xizangJson from '#/assets/echarts-map-json/province/xizang.json';
import yunnanJson from '#/assets/echarts-map-json/province/yunnan.json';
import zhejiangJson from '#/assets/echarts-map-json/province/zhejiang.json';
import chartOption from '#/assets/topo-data/chart-option';
// import { useTopoStore } from '#/store';

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{ detail: any; editMode: boolean }>();

/* -------------------------------------------  Store  ------------------------------------------- */
// const topoStore = useTopoStore();

/* -------------------------------------------  DOM  ------------------------------------------- */
const xwin = ref<HTMLDivElement>();

/* -------------------------------------------  实例 & 定时器  ------------------------------------------- */
let echartInst: any = null;
let timer: any = null;

/* -------------------------------------------  地图 JSON 映射（只读）  ------------------------------------------- */
const provinceJsonMap: Record<string, any> = {
  河南: henanJson,
  湖南: hunanJson,
  安徽: anhuiJson,
  澳门: aomenJson,
  北京: beijingJson,
  重庆: chongqingJson,
  福建: fujianJson,
  甘肃: gansuJson,
  广东: guangdongJson,
  广西: guangxiJson,
  贵州: guizhouJson,
  海南: hainanJson,
  河北: hebeiJson,
  黑龙江: heilongjiangJson,
  湖北: hubeiJson,
  江苏: jiangsuJson,
  江西: jiangxiJson,
  吉林: jilinJson,
  辽宁: liaoningJson,
  内蒙古: neimengguJson,
  宁夏: ningxiaJson,
  青海: qinghaiJson,
  山东: shandongJson,
  上海: shanghaiJson,
  山西: shanxiJson,
  四川: sichuanJson,
  台湾: taiwanJson,
  天津: tianjinJson,
  香港: xianggangJson,
  新疆: xinjiangJson,
  西藏: xizangJson,
  云南: yunnanJson,
  浙江: zhejiangJson,
};

/* -------------------------------------------  纯计算：运行标记  ------------------------------------------- */
const echartRunFlag = computed(() => {
  const opt = echartOption.value;
  const ts = echartRunTS.value;
  if (props.editMode && opt && ts > Date.now() - 10_000) return opt + ts;
  return '';
});

/* -------------------------------------------  纯计算：地图切换  ------------------------------------------- */
const mapChangeFlag = computed(() => {
  const addr = mapAddress.value;
  const url = mapUrl.value;
  return addr + url;
});

/* -------------------------------------------  本地副本  ------------------------------------------- */
const mapAddress = ref(props.detail.dataBind.mapAddress as string);
const mapUrl = ref(props.detail.dataBind.mapUrl as string);
const echartOption = ref(props.detail.dataBind.echartOption as string);
const echartRunTS = ref(props.detail.dataBind.echartRun as number);
const echartUrl = ref(props.detail.dataBind.echartUrl as string);
const echartSecond = ref((props.detail.dataBind.echartSecond || 60) as number);
const echartData = ref(props.detail.dataBind.echartData as string);
const mapJsons = ref<any>({});

/* -------------------------------------------  副作用：运行图表  ------------------------------------------- */
watch(
  echartRunFlag,
  () => {
    nextTick(() => {
      if (!echartRunFlag.value) return;
      try {
        const ok =
          mapAddress.value === '自定义' ? loadCustomMap() : loadProvinceMap();
        if (ok) message.success('运行成功');
      } catch {
        message.warning('图表初始化失败，请检查代码视图！');
      }
    });
  },
  { immediate: true },
);

/* -------------------------------------------  副作用：地图切换  ------------------------------------------- */
watch(mapChangeFlag, () => {
  nextTick(() => {
    try {
      mapAddress.value === '自定义' ? loadCustomMap() : loadProvinceMap();
    } catch {
      message.warning('图表初始化失败，请检查代码视图！');
    }
  });
});

/* -------------------------------------------  加载省级地图  ------------------------------------------- */
function loadProvinceMap(): boolean {
  const json = provinceJsonMap[mapAddress.value] || provinceJsonMap['河南'];
  return renderMap(json);
}

/* -------------------------------------------  加载自定义地图  ------------------------------------------- */
function loadCustomMap(): boolean {
  if (!mapUrl.value) return false;
  requestClient
    .get(mapUrl.value)
    .then((res: any) => {
      mapJsons.value = res.data;
      renderMap(res.data);
    })
    .catch(() => message.warning('请输入正确的 url!'));
  return true;
}

/* -------------------------------------------  渲染地图  ------------------------------------------- */
function renderMap(json: any): boolean {
  if (!json) return false;
  echarts.registerMap('mapJson', json);
  if (!xwin.value) return false;

  if (echartInst) echartInst.dispose();
  echartInst = echarts.init(xwin.value);

  if (!echartOption.value) echartOption.value = chartOption.getOptionMap();
  const funStr = chartOption.getFun(echartOption.value);
  // eslint-disable-next-line no-eval
  const fun = eval(`(${funStr})`);
  let data: any = {};
  if (echartData.value) {
    try {
      data = JSON.parse(echartData.value);
    } catch {
      message.warning('请输入正确的 JSON 数据');
      return false;
    }
  }
  const option = fun(echarts, data);
  echartInst.setOption(option);
  onResize();
  return true;
}

/* -------------------------------------------  尺寸调整  ------------------------------------------- */
function onResize() {
  echartInst?.resize();
}

/* -------------------------------------------  远程数据轮询  ------------------------------------------- */
function getEchartData(url: string) {
  requestClient.get(url).then((res: any) => {
    echartData.value = JSON.stringify(res.data);
    mapAddress.value === '自定义' ? loadCustomMap() : loadProvinceMap();
  });
}

/* -------------------------------------------  生命周期  ------------------------------------------- */
onMounted(() => {
  if (props.editMode && echartUrl.value) {
    const ms = echartSecond.value * 1000;
    getEchartData(echartUrl.value);
    timer = window.setInterval(() => getEchartData(echartUrl.value), ms);
  } else {
    mapAddress.value === '自定义' ? loadCustomMap() : loadProvinceMap();
  }
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
  echartInst?.dispose();
});
</script>

<template>
  <div ref="xwin" style="width: 100%; height: 100%"></div>
</template>
