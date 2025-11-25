<script setup lang="ts">
/* -------------------------------------------  Imports  ------------------------------------------- */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import * as echarts from 'echarts';

import { useTopoStore } from '#/store';

import 'echarts-liquidfill'; // 水球图扩展

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{ detail: any; editMode?: boolean }>();

/* -------------------------------------------  Store  ------------------------------------------- */
const topoStore = useTopoStore();
const mqttData = computed(() => topoStore.mqttData as any);

/* -------------------------------------------  DOM  ------------------------------------------- */
const chartView = ref<HTMLDivElement>();

/* -------------------------------------------  图表实例  ------------------------------------------- */
let myChart: echarts.ECharts | null = null;

/* -------------------------------------------  本地副本（只读父级）  ------------------------------------------- */
const width = ref(props.detail.style.position.w as number);
const height = ref(props.detail.style.position.h as number);
const waterColor = ref(props.detail.style.waterColor as string);
const waterShape = ref(props.detail.style.waterShape as string);
const waterFontSize = ref(props.detail.style.waterFontSize as number);
const waterBorderWidth = ref(props.detail.style.waterBorderWidth as number);
const waterBorderColor = ref(props.detail.style.waterBorderColor as string);
const waterBackColor = ref(props.detail.style.waterBackColor as string);

/* -------------------------------------------  计算：实时液位值  ------------------------------------------- */
const paramValue = ref(0);
const chartsValue = computed(() => {
  const db = props.detail.dataBind as any;
  if (
    db.identifier &&
    mqttData.value &&
    mqttData.value.serialNumber === db.serialNumber
  ) {
    const msg = (mqttData.value.message as any[]).find(
      (m) => m.id === db.identifier,
    );
    if (msg) {
      const v = Number(msg.value);
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      paramValue.value = Number.isNaN(v) ? 0 : v;
    }
  }
  return db.paramValue;
});

/* -------------------------------------------  计算：水球图配置  ------------------------------------------- */
const option = computed(() => {
  const waterData = paramValue.value / 100;
  return {
    series: [
      {
        type: 'liquidFill' as const,
        label: {
          formatter: (p: any) => `${Math.round(p.value * 100)}%`,
          fontSize: waterFontSize.value,
          position: ['50%', '50%'] as [string, string],
        },
        color: [waterColor.value],
        tooltip: { show: true },
        backgroundStyle: {
          borderWidth: waterBorderWidth.value,
          borderColor: waterBorderColor.value,
          color: waterBackColor.value,
        },
        data: [waterData],
        shape: waterShape.value,
        outline: { show: false },
        animationDuration: 0,
        animationDurationUpdate: 2000,
        animationEasingUpdate: 'cubicOut',
        amplitude: 5,
        period: () => 2000, // 波浪周期
      },
    ],
  };
});

/* -------------------------------------------  监听配置变化 → 刷新图表  ------------------------------------------- */
watch(
  option,
  (newOpt) => {
    if (myChart) {
      myChart.setOption(newOpt);
    } else {
      initChart();
    }
  },
  { deep: true },
);

/* -------------------------------------------  初始化图表  ------------------------------------------- */
function initChart() {
  if (!chartView.value) return;
  myChart = echarts.init(chartView.value);
  myChart.setOption(option.value);
}

/* -------------------------------------------  生命周期  ------------------------------------------- */
onMounted(() => initChart());
onBeforeUnmount(() => myChart?.dispose());
</script>

<template>
  <div>
    <div
      class="view-chart-water"
      ref="chartView"
      :id="props.detail.identifier"
    ></div>
    <div v-show="false">
      {{ chartsValue }}{{ width }}{{ height }}{{ waterColor }}{{ waterShape }}
    </div>
  </div>
</template>

<style lang="scss">
.view-chart-water {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-align: center;
}
</style>
