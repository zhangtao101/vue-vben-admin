<!--
  基础表格组件 (BasicTblae)
  功能：基于VXE Table封装的通用数据表格组件
  特性：
  - 支持分页查询和服务器端数据加载
  - 提供自定义工具栏和操作列插槽
  - 内置排序、刷新、缩放等基础功能
  - 支持斑马纹样式和自定义列配置
  - 完整的生命周期管理和事件通知机制
-->
<script lang="ts" setup>
import type { PropType } from 'vue';

import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onBeforeUnmount, onMounted } from 'vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

/**
 * 组件Props定义
 * 定义组件对外暴露的配置属性
 */
const props = defineProps({
  // 查询数据的方法
  // 用于从服务器获取表格数据的异步函数
  // 参数：{page, pageSize} - 分页信息
  // 返回：Promise<{total, items}> - 包含总数和数据列表的对象
  queryData: {
    type: Function as PropType<(...arg: any) => Promise<any>>,
    default: () => () => Promise.resolve({}),
    required: false,
  },
  // 表格列配置项
  // 定义表格显示的列信息，包括标题、字段、宽度等
  columns: {
    type: Array as PropType<any[]>,
    default: () => [],
    required: false,
  },
  // 是否分页
  // 控制是否显示分页器和启用分页查询功能
  isPages: {
    type: Boolean,
    default: true, // 默认启用分页
  },
});

/**
 * 组件事件定义
 * 定义组件向父组件发射的事件
 */
const emit = defineEmits([
  'initializationComplete', // 表格初始化完成事件，参数：gridApi
  'destroy', // 组件销毁事件
]);

/**
 * VXE表格配置项
 * 定义表格的基础配置、分页配置、代理配置和工具栏配置
 */
const gridOptions: VxeGridProps<any> = {
  // 基础样式配置
  align: 'center', // 表格内容居中对齐
  border: true, // 显示表格边框线
  columns: props.columns, // 动态绑定列配置项
  height: 500, // 固定表格高度（像素）
  stripe: true, // 启用斑马纹效果，提高可读性

  // 排序配置
  sortConfig: {
    multiple: true, // 允许同时按多个列进行排序
  },

  // 分页器配置
  pagerConfig: {
    enabled: props.isPages, // 根据props动态启用/禁用分页
  },

  // 代理配置 - 处理服务器端数据加载
  proxyConfig: {
    ajax: {
      /**
       * 查询数据函数
       * 在分页、排序、筛选时自动调用
       * @param {object} params - VXE Table提供的分页参数
       * @param {object} params.page - 分页信息对象
       * @param {number} params.page.currentPage - 当前页码
       * @param {number} params.page.pageSize - 每页数据条数
       * @returns {Promise} 返回Promise对象，包含分页数据
       */
      query: async ({ page }) => {
        // 调用父组件提供的查询函数，传递分页参数
        return await props.queryData({
          page: page.currentPage, // 当前页码
          pageSize: page.pageSize, // 每页条数
        });
      },
    },
  },

  // 工具栏配置
  toolbarConfig: {
    custom: true, // 显示自定义列配置按钮
    refresh: true, // 显示刷新按钮
    zoom: true, // 显示全屏/还原缩放按钮
  },
};

/**
 * 表格事件监听器配置
 * 定义表格的交互事件处理函数
 * 当前为空对象，可根据需要扩展具体事件处理
 */
const gridEvents: VxeGridListeners<any> = {};

/**
 * 创建表格组件实例
 * 使用Vben框架的useVbenVxeGrid组合式函数创建表格
 * @param {object} options - 表格配置选项
 * @param {object} options.gridEvents - 事件监听配置
 * @param {object} options.gridOptions - 表格基础配置
 * @returns {Array} 返回[Grid组件, gridApi实例]
 */
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 组件挂载后的生命周期钩子
 * 在DOM渲染完成后发射初始化完成事件
 */
onMounted(() => {
  // 向父组件发射初始化完成事件，传递gridApi实例
  // 父组件可以通过gridApi控制表格的重载、刷新等操作
  emit('initializationComplete', gridApi);
});

/**
 * 组件销毁前的生命周期钩子
 * 清理资源并通知父组件
 */
onBeforeUnmount(() => {
  // 向父组件发射销毁事件，便于父组件进行相关清理工作
  emit('destroy', '');
});
</script>

<template>
  <div>
    <!-- VXE表格主体组件 -->
    <Grid>
      <!-- 工具栏自定义插槽 -->
      <!-- 允许父组件在工具栏区域插入自定义工具按钮或控件 -->
      <template #toolbar-tools>
        <slot name="toolbar-tools"></slot>
      </template>

      <!-- 操作列插槽 -->
      <!-- 为每一行数据提供操作按钮插槽，父组件可以自定义每行的操作按钮 -->
      <template #action="{ row }">
        <!-- 将行数据row传递给插槽，父组件可以访问当前行的所有数据 -->
        <slot name="action" :row="row"></slot>
      </template>
    </Grid>
  </div>
</template>

<style scoped></style>
