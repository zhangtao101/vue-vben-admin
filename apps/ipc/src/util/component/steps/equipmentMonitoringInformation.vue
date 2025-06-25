<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onBeforeUnmount, onMounted, ref } from 'vue';

import { message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { equipmentMonitoringQuery } from '#/api';
import useWebSocket from '#/util/websocket-util';

const props = defineProps({
  // 工步id
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心
  workstationCode: {
    type: String,
    default: '',
  },
});

// region 作业信息
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      title: '序号',
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    {
      field: 'name',
      title: '数据名称',
      minWidth: 120,
    },
    {
      field: 'expression',
      title: '点位信息',
      minWidth: 120,
    },
    {
      field: 'dataTypeName',
      title: '数据类型',
      minWidth: 120,
    },
    {
      field: 'standardValue',
      title: '设置值',
      minWidth: 120,
    },
    {
      field: 'value',
      title: '当前值',
      minWidth: 120,
    },
    {
      field: 'maxValue',
      title: '上限阈值',
      minWidth: 120,
    },
    {
      field: 'minValue',
      title: '下限阈值',
      minWidth: 120,
    },
    {
      field: 'errorDescription',
      title: '报警',
      minWidth: 200,
    },
    {
      field: 'remark',
      title: '备注',
      minWidth: 200,
    },
  ],
  height: 400,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
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
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: any = {
  radioChange: ({ row }: any) => {
    message.info(`radioChange: ${row}`);
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// region 查询数据
// 查询参数
const queryParams = ref<any>({
  // 查询时间
  searchTime: [] as any,
  // 产品编码
  productCode: '',
  // 产品批号
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
 * @param page - 当前页码
 * @param pageSize - 每页数据量
 *
 * 接口说明：
 * equipmentMonitoringQuery - 设备监控数据查询接口
 * 固定参数：
 *   workstationCode: 工作中心编号
 *   equipCode: 设备编号
 *   worksheetCode: 工单编号
 *   bindingId: 工序ID
 *   functionId: 工步ID
 *
 * 注意事项：
 * - 依赖props传递设备/工单相关标识参数
 * - 返回数据需转换为{total, items}格式适配vxe-table
 * - 使用Promise实现异步数据流控制
 * - 错误处理通过reject传递至调用方
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = {
      workstationCode: props.workstationCode,
      equipCode: props.equipCode,
      worksheetCode: props.worksheetCode,
      bindingId: props.bindingId,
      functionId: props.functionId,
    };
    equipmentMonitoringQuery({
      ...params,
      pageNum: page, // 当前页码
      pageSize, // 每页数量
    })
      .then(({ total, list }) => {
        resolve({
          total,
          items: list,
        });
      })
      .catch((error) => {
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
 *
 * 注意事项：
 * - 会清空所有查询条件参数
 * - 通过gridApi.reload()实现表格数据刷新
 * - 通常在搜索条件重置或数据提交成功后调用
 */
function reload() {
  queryParams.value = {};
  gridApi.reload();
}

// endregion

// region websocket

const { close: websocketClose } = useWebSocket(readMessage, {
  workstationCode: props.workstationCode,
  equipCode: props.equipCode,
  worksheetCode: props.worksheetCode,
  bindingId: props.bindingId,
  functionId: props.functionId,
});

/**
 * WebSocket消息处理回调
 * 功能：解析并更新资源验证状态数据
 * 流程：
 * 1. 解析原始消息为JSON对象
 * 2. 验证数据有效性（非空检查）
 * 3. 更新响应式状态数据
 *
 * @param message - WebSocket推送的原始消息字符串
 *
 * 注意事项：
 * - 当前未处理JSON解析异常，需增加try-catch逻辑
 * - 会直接覆盖原有状态数据，需确保数据结构一致性
 * - 依赖父级作用域中的details响应式引用
 */
function readMessage(message: string) {
  // 反序列化WebSocket消息
  const data = JSON.parse(message);
  // 有效性检查后更新视图数据
  if (data) {
    gridApi.reload();
  }
}
// endregion

onMounted(() => {
  reload();
});
onBeforeUnmount(() => {
  websocketClose();
});
</script>

<template>
  <Grid />
</template>

<style scoped></style>
