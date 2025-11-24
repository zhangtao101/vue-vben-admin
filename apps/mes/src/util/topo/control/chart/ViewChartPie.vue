<script setup lang="ts">
/* -------------------------------------------  Imports  ------------------------------------------- */
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import * as echarts from 'echarts';

import { queryDeviceStatistic } from '#/api';

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{ detail: any; editMode: boolean }>();

/* -------------------------------------------  Store  ------------------------------------------- */
// const topoStore = useTopoStore();

/* -------------------------------------------  DOM  ------------------------------------------- */
const chartView = ref<HTMLDivElement>();

/* -------------------------------------------  图表实例  ------------------------------------------- */
let myChart: echarts.ECharts | null = null;

/* -------------------------------------------  本地副本（只读父级，不赋值）  ------------------------------------------- */
const width = ref(props.detail.style.position.w as number);
const height = ref(props.detail.style.position.h as number);
const foreColor = ref(props.detail.style.foreColor as string);
const pieType = ref(props.detail.style.pieType as string);

/* -------------------------------------------  计算：尺寸变化触发重绘  ------------------------------------------- */
watch([width, height], () => {
  nextTick(() => myChart?.resize({ width: width.value, height: height.value }));
});

/* -------------------------------------------  计算：颜色变化触发重绘  ------------------------------------------- */
watch(foreColor, () => {
  nextTick(() => fetchStaticData());
});

/* -------------------------------------------  计算：刷新信号（值/类型/颜色）  ------------------------------------------- */
// const refreshSignal = computed(() => {
//   /* 拉取最新数据 */
//   nextTick(() => fetchStaticData());
//   return `${pieType.value}-${foreColor.value}`;
// });

/* -------------------------------------------  组装图表选项（设备状态）  ------------------------------------------- */
function getDeviceOption(curr: any): echarts.EChartsOption {
  return {
    color: ['#13ce66', '#909399', '#ff4949'],
    title: {
      text: '设备状态',
      left: 'center',
      textStyle: {
        fontFamily: 'Microsoft YaHei',
        fontStyle: 'normal',
        fontWeight: 'normal',
        color: foreColor.value,
      },
    },
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' },
    legend: {
      top: '10%',
      left: 'center',
      textStyle: { color: foreColor.value },
    },
    series: [
      {
        name: '网关设备',
        type: 'pie',
        radius: ['40%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 30, fontWeight: 'bold' } },
        labelLine: { show: false },
        data: [
          {
            value: curr.deviceOnlineCount,
            name: `在线 ${curr.deviceOnlineCount}`,
            label: { color: foreColor.value },
          },
          {
            value: curr.deviceOfflineCount,
            name: `离线 ${curr.deviceOfflineCount}`,
            label: { color: foreColor.value },
          },
          {
            value: curr.alertDeviceCount,
            name: `报警 ${curr.alertDeviceCount}`,
            label: { color: foreColor.value },
          },
        ],
      },
    ],
  };
}

/* -------------------------------------------  组装图表选项（报警状态）  ------------------------------------------- */
function getWarnOption(curr: any): echarts.EChartsOption {
  return {
    color: ['#13ce66', '#ff4949'],
    title: {
      text: '报警状态',
      left: 'center',
      textStyle: {
        fontFamily: 'Microsoft YaHei',
        fontStyle: 'normal',
        fontWeight: 'normal',
        color: foreColor.value,
      },
    },
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' },
    legend: {
      top: '10%',
      left: 'center',
      textStyle: { color: foreColor.value },
    },
    series: [
      {
        name: '网关设备',
        type: 'pie',
        radius: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 30, fontWeight: 'bold' } },
        labelLine: { show: false },
        data: [
          {
            value: curr.alertProcessedCount,
            name: `已处理 ${curr.alertProcessedCount}`,
            label: { color: foreColor.value },
          },
          {
            value: curr.alertNotProcessedCount,
            name: `未处理 ${curr.alertNotProcessedCount}`,
            label: { color: foreColor.value },
          },
        ],
      },
    ],
  };
}

/* -------------------------------------------  组装图表选项（工单状态）  ------------------------------------------- */
function getOrderOption(curr: any): echarts.EChartsOption {
  return {
    color: ['#2979ff', '#fa3534', '#ff9900'],
    title: {
      text: '工单状态',
      left: 'center',
      textStyle: {
        fontFamily: 'Microsoft YaHei',
        fontStyle: 'normal',
        fontWeight: 'normal',
        color: foreColor.value,
      },
    },
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' },
    legend: {
      top: '10%',
      left: 'center',
      textStyle: { color: foreColor.value },
    },
    series: [
      {
        name: '网关设备',
        type: 'pie',
        radius: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 30, fontWeight: 'bold' } },
        labelLine: { show: false },
        data: [
          {
            value: curr.orderRecordProcessedNum,
            name: `已巡检 ${curr.orderRecordProcessedNum}`,
            label: { color: foreColor.value },
          },
          {
            value: curr.orderRecordUntreatedNum,
            name: `未巡检 ${curr.orderRecordUntreatedNum}`,
            label: { color: foreColor.value },
          },
          {
            value: curr.orderRecordAbandonNum,
            name: `已废弃 ${curr.orderRecordAbandonNum}`,
            label: { color: foreColor.value },
          },
        ],
      },
    ],
  };
}

/* -------------------------------------------  拉取统计数据  ------------------------------------------- */
function fetchStaticData() {
  queryDeviceStatistic().then((res: any) => {
    if (res.code !== 200) return;
    const data = res.data;
    if (!myChart) return;
    if (pieType.value === '设备状态') {
      myChart.setOption(getDeviceOption(data));
    } else if (pieType.value === '报警状态') {
      myChart.setOption(getWarnOption(data));
    } else {
      myChart.setOption(getOrderOption(data));
    }
  });
}

/* -------------------------------------------  初始化  ------------------------------------------- */
onMounted(() => {
  if (!chartView.value) return;
  myChart = echarts.init(chartView.value);
  fetchStaticData();
  const timerInterval = window.setInterval(fetchStaticData, 60_000);
  onBeforeUnmount(() => clearInterval(timerInterval));
});

onBeforeUnmount(() => {
  myChart?.dispose();
});
</script>

<template>
  <div>
    <div
      ref="chartView"
      class="view-chart-pie"
      :id="props.detail.identifier"
    ></div>
  </div>
</template>

<style lang="scss">
.view-chart-pie {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  margin-top: 20px;
  text-align: center;
}
</style>
