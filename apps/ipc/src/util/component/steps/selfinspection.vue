<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';

import { message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { equipmentMonitoringQuery } from '#/api';

import { $t } from '../../../../../../packages/locales/src';

/**
 * 定义组件的 props，用于接收父组件传递的数据
 */
const props = defineProps({
  // 工步id，用于标识具体的工步，默认为 0
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID，用于标识具体的工序，默认为 0
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号，用于标识具体的工单，默认为空字符串
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号，用于标识具体的设备，默认为空字符串
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心，用于标识具体的工作中心，默认为空字符串
  workstationCode: {
    type: String,
    default: '',
  },
});

// region 作业信息
/**
 * 表格配置选项，用于定义 VxeGrid 表格的各项属性
 */
const gridOptions: VxeGridProps<any> = {
  // 表格内容居中对齐
  align: 'center',
  // 显示表格边框
  border: true,
  // 表格列配置
  columns: [
    {
      // 列标题
      title: '序号',
      // 列类型为序号列
      type: 'seq',
      // 列字段名
      field: 'seq',
      // 列宽度
      width: 50,
    },
    {
      field: '1',
      title: '产品SN',
      // 列最小宽度
      minWidth: 120,
    },
    {
      field: '2',
      title: '检验项目',
      minWidth: 120,
    },
    {
      field: '3',
      title: '检验标准',
      minWidth: 120,
    },
    {
      field: '4',
      title: '检验设备',
      minWidth: 120,
    },
    {
      field: '5',
      title: '检验数量',
      minWidth: 120,
    },
    {
      field: '6',
      title: '不良数量',
      minWidth: 120,
    },
    {
      field: '7',
      title: '检验结果',
      minWidth: 120,
    },
    {
      field: '8',
      title: '备注',
      minWidth: 200,
    },
  ],
  // 表格高度
  height: 400,
  // 显示斑马纹
  stripe: true,
  // 排序配置，支持多列排序
  sortConfig: {
    multiple: true,
  },
  // 代理配置，用于异步查询数据
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  // 工具栏配置
  toolbarConfig: {
    // 显示自定义按钮
    custom: true,
    // 不显示导入按钮
    // import: true,
    // 不显示导出按钮
    // export: true,
    // 显示刷新按钮
    refresh: true,
    // 显示缩放按钮
    zoom: true,
  },
};

/**
 * 表格事件配置对象，定义表格的各种事件处理函数
 */
const gridEvents: any = {
  /**
   * 单选框状态改变时触发的事件处理函数
   * @param row - 包含选中行数据的对象
   */
  radioChange: ({ row }: any) => {
    // 显示选中行信息的提示消息
    message.info(`radioChange: ${row}`);
  },
};

/**
 * 初始化 VxeGrid 组件和 API
 * @type {[typeof Grid, any]} - 包含 Grid 组件和 gridApi 的数组
 */
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// region 查询数据
/**
 * 查询参数，用于存储查询设备监控数据的相关条件
 */
const queryParams = ref<any>({
  // 查询时间，初始化为空数组
  searchTime: [] as any,
  // 产品编码，初始化为空字符串
  productCode: '',
  // 产品批号，初始化为空字符串
  lineName: '',
});

/**
 * 查询设备监控数据
 * 功能：获取设备监控信息并处理分页展示
 * 流程：
 * 1. 构建请求参数（从props获取设备/工单标识）
 * 2. 调用设备监控查询接口
 * 3. 转换接口返回数据适配表格分页格式
 *
 * @param {object} param - 包含分页信息的对象
 * @param {number} param.page - 当前页码
 * @param {number} param.pageSize - 每页数据量
 * @returns {Promise<{total: number, items: any[]}>} - 包含总数据量和当前页数据的 Promise
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 构建请求参数对象
    const params: any = {
      workstationCode: props.workstationCode,
      equipCode: props.equipCode,
      worksheetCode: props.worksheetCode,
      bindingId: props.bindingId,
      functionId: props.functionId,
    };
    // 调用设备监控查询接口
    equipmentMonitoringQuery({
      ...params,
      pageNum: page, // 当前页码
      pageSize, // 每页数量
    })
      .then(({ total, list }) => {
        // 解析接口返回数据，返回适配表格分页格式的数据
        resolve({
          total,
          items: list,
        });
      })
      .catch((error) => {
        // 捕获接口调用错误并拒绝 Promise
        reject(error);
      });
  });
}

/**
 * 重置查询条件并刷新表格
 * 功能：清空查询参数并重新加载数据
 * 流程：
 * 1. 重置查询参数为空对象
 * 2. 触发表格重新加载数据
 */
function reload() {
  // 重置查询参数
  queryParams.value = {};
  // 触发表格重新加载数据
  gridApi.reload();
}

// endregion

/**
 * 组件挂载后执行的钩子函数，会在组件挂载完成后调用 reload 函数获取数据
 */
onMounted(() => {
  reload();
});
</script>

<template>
  <!-- 渲染 VxeGrid 组件 -->
  <Grid>
    <!-- 定义表格工具栏的操作按钮 -->
    <template #toolbar-actions>
      <!-- 取消填写按钮 -->
      <Button type="primary" danger>
        {{ $t('productionOperation.cancelTheFilling') }}
      </Button>
      <!-- 任务暂停按钮 -->
      <Button type="primary">
        {{ $t('productionOperation.taskSuspended') }}
      </Button>
      <!-- 任务完成按钮 -->
      <Button type="primary">
        {{ $t('productionOperation.taskCompleted') }}
      </Button>
    </template>
  </Grid>
</template>

<style scoped>
/* 作用域样式，仅对当前组件生效 */
</style>
