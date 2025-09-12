<script lang="ts" setup>
import type { PropType } from 'vue';

import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onBeforeUnmount, onMounted } from 'vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

const props = defineProps({
  // 查询数据的方法
  queryData: {
    type: Function as PropType<(...arg: any) => Promise<any>>,
    default: () => () => Promise.resolve({}),
    required: false,
  },
  // 表格列配置项
  columns: {
    type: Array as PropType<any[]>,
    default: () => [],
    required: false,
  },
  // 是否分页
  isPages: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['initializationComplete', 'destroy']);

// 表格配置项
const gridOptions: VxeGridProps<any> = {
  align: 'center', // 表格内容居中
  border: true, // 显示边框
  columns: props.columns, // 表格列配置项,
  height: 500, // 表格高度
  stripe: true, // 启用斑马纹
  sortConfig: {
    multiple: true, // 允许多列排序
  },
  pagerConfig: {
    enabled: props.isPages,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await props.queryData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true, // 自定义工具栏
    refresh: true, // 刷新按钮
    zoom: true, // 缩放按钮
  },
};

// 表格事件监听
const gridEvents: VxeGridListeners<any> = {};

// 使用表格组件
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

onMounted(() => {
  emit('initializationComplete', gridApi);
});
onBeforeUnmount(() => {
  emit('destroy', '');
});
</script>

<template>
  <div>
    <Grid>
      <template #toolbar-tools>
        <slot name="toolbar-tools"></slot>
      </template>
    </Grid>
  </div>
</template>

<style scoped></style>
