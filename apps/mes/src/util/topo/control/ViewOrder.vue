<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, onUnmounted, ref, shallowRef } from 'vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

// region props
const props = defineProps<{ detail: any; editMode?: boolean }>();
// endregion

// region 表格

const config = ref<any>({
  header: [], // 表头数据
  data: [], // 表数据
  rowNum: 10, // 表行数
  headerBGC: '#00BAFF', // 表头背景色
  oddRowBGC: '#003B51', // 奇数行背景色
  evenRowBGC: '#0A2732', // 偶数行背景色
  waitTime: 2000, // 轮播时间间隔
  headerHeight: 35, // 表头高度
  columnWidth: [60], // 列宽度
  align: ['center'], // 对齐方式
  index: true, // 行号
  indexHeader: '序号', // 行号表头
  carousel: 'single', // 轮播方式'single'|'page'
  hoverPause: true, // 悬停停止轮播
});

const Grid = shallowRef<any>();
let gridApi: any;
const queryDataInterval = ref<any>();
/**
 *  配置信息初始化
 */
function configInit() {
  config.value.header = [];
  if (props.detail.style.index) {
    config.value.header.push({ title: '序号', type: 'seq', width: 50 });
  }
  const widths = props.detail.style.columnWidth.split(',') ?? [];
  for (let i = 0; i < props.detail.style.header.length; i++) {
    const item = props.detail.style.header[i];
    config.value.header.push({
      title: item,
      field: item,
      minWidth: widths[i] ?? 120,
    });
  }

  const gridOptions: VxeGridProps<any> = {
    columns: config.value.header,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async () => {
          return await queryData();
        },
      },
    },
    scrollbarConfig: {
      x: {
        visible: 'hidden',
      },
      y: {
        visible: 'hidden',
      },
    },
    height: '100%',
    rowConfig: {
      isHover: true,
    },
  };
  [Grid.value, gridApi] = useVbenVxeGrid({ gridOptions, gridEvents });

  queryDataInterval.value = setInterval(() => {
    gridApi?.reload();
  }, 1000 * 60);
}
// 事件配置
const gridEvents: any = {
  dataChange: () => {
    // 数据加载后启动
    startRollEvent();
  },
};

const autoTime = ref<any>();
function startRollEvent() {
  autoTime.value = setTimeout(() => {
    const g = gridApi.grid;
    g.scrollTo({
      top: g.scrollTop + 1,
    });
    startRollEvent();
  }, 100);
}

/**
 * 查询数据
 */
function queryData() {
  return new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve({
        total: 20,
        items: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
      });
    }, 1000);
  });
}

// endregion

onMounted(() => {
  configInit();
});

onUnmounted(() => {
  clearInterval(queryDataInterval.value);
});
</script>

<template>
  <div :key="123" class="h-full">
    <template v-if="Grid">
      <Grid />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
