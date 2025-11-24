<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { message } from 'ant-design-vue';
import * as echarts from 'echarts';

import { queryDeviceThingsModel, queryThingsModelHistory } from '#/api';
import topoUtil from '#/util/topo/topo_utils';

/* ---------- props ---------- */
const props = defineProps<{ detail: any }>();

/* ---------- 路由 & pinia ---------- */
const route = useRoute();

/* ---------- dom ---------- */
const chartView = ref<HTMLDivElement>();

/* ---------- 图表实例 ---------- */
let myChart: echarts.ECharts | null = null;

/* ---------- 本地副本 ---------- */
const width = ref(props.detail.style.position.w as number);
const height = ref(props.detail.style.position.h as number);
const foreColor = ref(props.detail.style.foreColor as string);

/* ---------- 表单 & 加载 ---------- */
const loading = ref(false);
const dialogVisible = ref(false);
const paramList = ref<any[]>([]);
const paramNameList = ref<any[]>([]);
const checkList = ref<string[]>([]);

/* ---------- 图表配置 ---------- */
const option = ref<any>({
  title: { text: '' },
  tooltip: { trigger: 'axis' },
  legend: { textStyle: { color: foreColor.value }, data: [] },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  toolbox: { feature: { saveAsImage: {} } },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [] as string[],
    axisLabel: {
      formatter: (param: string) => param.split(' ')[1],
    },
  },
  yAxis: { type: 'value' },
  series: [] as any[],
});

/* ---------- 轮询定时器 ---------- */
let timer: null | number = null;

/* ---------- 1. 尺寸变化 -> 重绘 ---------- */
watch([width, height], () => {
  nextTick(() => myChart?.resize({ width: width.value, height: height.value }));
});

/* ---------- 2. 颜色变化 -> 重绘 ---------- */
watch(foreColor, () => {
  option.value.legend.textStyle.color = foreColor.value;
  myChart?.setOption(option.value);
});

/* ---------- 双击绑定变量 ---------- */
function handleDblclick() {
  getParam();
  dialogVisible.value = true;
}

function handleClick() {
  getChartsData();
}

/* ---------- 获取设备物模型 ---------- */
function getParam() {
  loading.value = true;
  const params = {
    pageNum: 1,
    pageSize: 999,
    scadaGuid: route.query.guid as string,
  };

  queryDeviceThingsModel(params)
    .then((res: any) => {
      if (res.code === 200) {
        paramList.value = res.rows;
        paramNameList.value = formatParamName(res.rows);
      }
      loading.value = false;
    })
    .catch(() => (loading.value = false));
}

/* ---------- 格式化属性数据 ---------- */
function formatParamName(list: any[]): any[] {
  const datas: any[] = [];
  list.forEach((item, i) => {
    if (i === 0 || !datas.some((d) => d.id === item.serialNumber)) {
      datas.push({
        id: item.serialNumber,
        name: item.deviceName,
        children: [
          { id: item.identifier, name: item.modelName, type: item.type },
        ],
      });
    } else {
      datas
        .find((d) => d.id === item.serialNumber)!
        .children.push({
          id: item.identifier,
          name: item.modelName,
          type: item.type,
        });
    }
  });
  return datas;
}

/* ---------- 获取历史数据 ---------- */
function getChartsData() {
  if (checkList.value.length === 0) return;

  const serialNumber = checkList.value[0]!.split('-')[0];
  const diff = checkList.value.find((item) => !item.startsWith(serialNumber!));
  if (diff) {
    message.error('请选择同一个设备的属性！');
    return;
  }

  const identifiers = checkList.value.map((item) => ({
    identifier: item.split('-')[1],
    type: item.split('-')[2],
  }));

  const query = {
    serialNumber,
    beginTime: topoUtil.getTime(8),
    endTime: topoUtil.getNowTime(),
    thingsModelList: identifiers,
  };

  queryThingsModelHistory(query).then((res: any) => {
    if (res.code === 200) {
      const modelIdens = Object.keys(res.data || {}) as string[];
      if (modelIdens.length === 0) {
        message.warning('暂无数据！');
        return;
      }

      const lData = modelIdens.map(
        (id) => paramList.value.find((p) => p.identifier === id)?.modelName,
      );
      const xData = res.data[modelIdens[0]!].map((item: any) => item.time);
      const yData = modelIdens.map((id) => ({
        name: paramList.value.find((p) => p.identifier === id)?.modelName,
        data: res.data[id].map((v: any) => v.value),
      }));

      /* 更新本地副本 */
      const db = props.detail.dataBind as any;
      db.lData = lData;
      db.xData = xData;
      db.yData = yData;

      setChartDatas(lData, xData, yData);
      nextTick(() => myChart?.setOption(option.value));
      dialogVisible.value = false;
    }
  });
}

/* ---------- 组装 echarts 数据 ---------- */
function setChartDatas(lData: string[], xData: string[], yData: any[]) {
  option.value.legend.data = lData;
  option.value.xAxis.data = xData;
  option.value.series = yData.map((item) => {
    const chartType = props.detail.type as string;
    if (chartType === 'chart-line-step') {
      return {
        name: item.name,
        type: 'line',
        stack: 'Total',
        step: 'start',
        data: item.data,
        itemStyle: {},
      };
    }
    if (chartType === 'chart-line') {
      return {
        name: item.name,
        type: 'line',
        stack: 'Total',
        data: item.data,
        itemStyle: {},
      };
    }
    return {
      name: item.name,
      type: 'bar',
      stack: 'Total',
      barWidth: 17,
      data: item.data,
      itemStyle: {},
    };
  });
}

/* ---------- 初始化图表 ---------- */
onMounted(() => {
  if (!chartView.value) return;
  myChart = echarts.init(chartView.value);

  const db = props.detail.dataBind as any;
  if (db.lData?.length && db.xData?.length && db.yData?.length) {
    setChartDatas(db.lData, db.xData, db.yData);
    myChart.setOption(option.value);
  }

  timer = window.setInterval(getChartsData, 60_000);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
  myChart?.dispose();
});
</script>

<template>
  <div>
    <div v-show="false">{{ height }}{{ width }}{{ foreColor }}</div>
    <div
      ref="chartView"
      class="view-chart"
      :id="props.detail.identifier"
      v-show="(props.detail.dataBind.lData as any[])?.length > 0"
      @dblclick="handleDblclick"
    ></div>
    <div
      v-show="(props.detail.dataBind.lData as any[])?.length === 0"
      :style="{
        width: `${width}px`,
        height: `${height}px`,
        textAlign: 'center',
        lineHeight: `${height}px`,
        fontSize: '30px',
        color: '#368a42',
      }"
      @dblclick="handleDblclick"
    >
      双击绑定变量
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="变量绑定"
      width="40%"
      append-to-body
    >
      <div v-loading="loading" style="min-height: 400px">
        <div style="margin: 0 15px 15px; color: red">
          多属性对比时，多个属性上报时间需一样！
        </div>
        <el-form label-width="85px">
          <el-form-item
            v-for="item in paramNameList"
            :key="item.id"
            :label="item.name"
          >
            <el-checkbox-group v-model="checkList">
              <el-checkbox
                v-for="chil in item.children"
                :key="`${item.id}-${chil.id}`"
                :label="`${item.id}-${chil.id}-${chil.type}`"
              >
                {{ chil.name }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关 闭</el-button>
        <el-button type="primary" @click="handleClick">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss">
.view-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-align: center;
}
</style>
