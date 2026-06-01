<script setup lang="ts">
/**
 * [INPUT]: 依赖 #/api 的 getRemainingFeedListByCode、materialDown 接口获取余料数据并提交下料
 * [OUTPUT]: 对外提供余料下料表格组件，包含余料列表展示、下料数量输入、批量提交功能
 * [POS]: 工步执行子组件，type=52 时由 stepExecution.vue 渲染
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-06-01 09:10:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onBeforeUnmount, ref } from 'vue';

import { $t } from '@vben/locales';

import { Button, InputNumber, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getRemainingFeedListByCode, materialDown } from '#/api';
import useWebSocket from '#/util/websocket-util';

// region 组件 Props 定义
const props = defineProps({
  functionId: {
    type: Number,
    default: 0,
  },
  bindingId: {
    type: Number,
    default: 0,
  },
  worksheetCode: {
    type: String,
    default: '',
  },
  equipCode: {
    type: String,
    default: '',
  },
  workstationCode: {
    type: String,
    default: '',
  },
});

// region 表格配置
// VXE Grid 配置：展示余料列表，包含工单号、料号、物料名称、标签号、料站编号、投料人、上料时间、可下料数量、下料数量
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'worksheetCode',
      title: '工单号',
      minWidth: 150,
    },
    {
      field: 'materialCode',
      title: '料号',
      minWidth: 120,
    },
    {
      field: 'materialName',
      title: '物料名称',
      minWidth: 120,
    },
    {
      field: 'materialPlateCode',
      title: '标签号',
      minWidth: 140,
    },
    {
      field: 'materialStationCode',
      title: '料站编号',
      width: 100,
    },
    {
      field: 'feedUser',
      title: '投料人',
      width: 120,
    },
    {
      field: 'feedTime',
      title: '上料时间',
      width: 160,
    },
    {
      field: 'number',
      title: '可下料数量',
      fixed: 'right',
      width: 110,
    },
    {
      field: '_downNumber',
      slots: { default: 'downNumber' },
      fixed: 'right',
      title: '下料数量',
      width: 140,
    },
  ],
  data: [],
  height: 500,
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryData();
      },
    },
    page: false,
  },
  stripe: true,
  scrollY: {
    enabled: true,
    gt: 30,
  },
  scrollX: {
    enabled: true,
    gt: 0,
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

// VXE Grid 事件配置（当前无自定义事件）
const gridEvents: any = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });
// endregion

// region 数据加载
/**
 * 查询余料记录明细（不分页，加载全部），并为每条记录追加 _downNumber 字段用于下料数量输入。
 * @returns {Promise<{ total: number; items: any[] }>} 返回 total（记录总数）与 items（含 _downNumber 的余料列表）。
 * @throws 当接口请求失败时，Promise 被 reject 原始错误。
 * @since 2026-06-01 09:10:00
 */
function queryData() {
  return new Promise((resolve, reject) => {
    getRemainingFeedListByCode({
      workstationCode: props.workstationCode,
      worksheetCode: props.worksheetCode,
      bindingId: props.bindingId,
      functionId: props.functionId,
    })
      .then((data: any) => {
        const list = (data || []).map((item: any) => ({
          ...item,
          _downNumber: undefined as number | undefined,
        }));
        resolve({
          total: list.length,
          items: list,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}
// endregion

// region 统一下料
// 统一下料提交按钮 loading 状态
const submitting = ref(false);

/**
 * 收集所有填写了下料数量的行，进行参数校验后统一通过 Modal 确认提交。
 * - 校验：至少一条记录的下料数量 > 0，且所有下料数量不超过对应的可下料数量。
 * - 提交后刷新表格数据。
 * @returns {void} 无返回值，校验不通过时 message.warning 提示后提前返回。
 * @throws 当下料接口 materialDown 请求失败时，错误由接口层面处理。
 * @since 2026-06-01 09:10:00
 */
function submitAllDown() {
  const tableData = gridApi.grid.getTableData().tableData as any[];
  const downList = tableData
    .filter((row: any) => row._downNumber && row._downNumber > 0)
    .map((row: any) => ({
      materialPlateCode: row.materialPlateCode,
      downNumber: row._downNumber,
      materialCode: row.materialCode,
      materialName: row.materialName,
      workSheetCode: row.worksheetCode,
    }));

  if (downList.length === 0) {
    message.warning('请至少填写一个下料数量');
    return;
  }

  // 校验下料数量不超过可下料数量
  const invalidRow = tableData.find((row: any) => row._downNumber > row.number);
  if (invalidRow) {
    message.warning(
      `"${invalidRow.materialName}" 下料数量不能超过可下料数量(${invalidRow.number})`,
    );
    return;
  }

  Modal.confirm({
    title: '确认下料',
    content: `确认下料共 ${downList.length} 条记录吗？`,
    onOk: () => {
      submitting.value = true;
      materialDown(downList)
        .then(() => {
          message.success($t('common.successfulOperation'));
          gridApi.reload();
        })
        .finally(() => {
          submitting.value = false;
        });
    },
  });
}
// endregion

// region websocket
// WebSocket 连接实例：监听 workstationCode / equipCode / worksheetCode / bindingId / functionId，类型为 5
const { close: websocketClose } = useWebSocket(readMessage, {
  workstationCode: props.workstationCode,
  equipCode: props.equipCode,
  worksheetCode: props.worksheetCode,
  bindingId: props.bindingId,
  functionId: props.functionId,
  webSocketType: 5,
});

/**
 * WebSocket 消息回调：收到通知时刷新表格数据。
 * @param {string} _message - WebSocket 推送的消息内容（当前未使用，以下划线前缀标识）。
 * @returns {void} 无返回值，直接触发 gridApi.reload()。
 * @since 2026-06-01 09:10:00
 */
function readMessage(_message: string) {
  gridApi.reload();
}
// endregion

onBeforeUnmount(() => {
  websocketClose();
});
</script>

<template>
  <Grid>
    <template #toolbar-tools>
      <Button type="primary" :loading="submitting" @click="submitAllDown">
        下料
      </Button>
    </template>
    <template #downNumber="{ row }">
      <InputNumber
        v-model:value="row._downNumber"
        :max="row.number"
        :min="0"
        style="width: 100%"
      />
    </template>
  </Grid>
</template>

<style scoped></style>
