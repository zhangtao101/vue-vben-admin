<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onBeforeUnmount, onMounted } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button, message, Modal, Tooltip } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { inReport, listByInReport } from '#/api';
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
  // 展示类型
  showTypeNumber: {
    type: Number,
    default: 0,
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
      field: 'worksheetCode',
      title: '工单编号',
      minWidth: 150,
    },
    {
      field: 'productCode',
      title: '产品编号',
      minWidth: 120,
    },
    {
      field: 'productName',
      title: '产品名称',
      minWidth: 120,
    },
    {
      field: 'planNumber',
      title: '计划数量',
      minWidth: 120,
    },
    {
      field: 'startTime',
      title: '开工时间',
      minWidth: 120,
    },
    {
      title: '操作',
      minWidth: 120,
      fixed: 'right',
      slots: {
        default: 'action',
      },
    },
  ],
  height: 400,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryData();
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

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData() {
  return new Promise((resolve, _reject) => {
    const params: any = {
      bindingId: props.bindingId,
      workstationCode: props.workstationCode,
    };
    listByInReport({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
    })
      .then((data) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total: data.length,
          items: data,
        });
      })
      .catch((error) => {
        _reject(error);
      });
  });
}

/**
 * 重置查询条件
 */
function reload() {
  gridApi.reload();
}

/**
 * 进站
 * @param row
 */
function pullIn(row: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',

    onCancel() {
      message.warning('已取消!');
    },

    onOk() {
      inReport({
        workstationCode: props.workstationCode,
        worksheetCode: row.worksheetCode,
        bindingId: props.bindingId,
      }).then(() => {
        message.success($t('common.successfulOperation'));
        reload();
      });
    },
    title: '是否确认进站?',
  });
}

// endregion

// region websocket
/**
 * 初始化 WebSocket 连接，并传入消息处理函数和配置参数
 */
const { close: websocketClose } = useWebSocket(readMessage, {
  workstationCode: props.workstationCode,
  equipCode: props.equipCode,
  worksheetCode: props.worksheetCode,
  bindingId: props.bindingId,
  functionId: props.functionId,
  webSocketType: 5,
});

/**
 * 处理 WebSocket 接收到的消息
 * 当接收到消息时，调用 queryData 函数重新查询资源验证状态
 */
function readMessage() {
  reload();
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
  <Grid>
    <template #action="{ row }">
      <!-- 进站 -->
      <Tooltip>
        <template #title>{{ $t('workOrderEntry.pullIn') }}</template>
        <Button type="link" @click="pullIn(row)">
          <IconifyIcon
            icon="mdi:login-variant"
            class="inline-block align-middle text-2xl"
          />
        </Button>
      </Tooltip>
    </template>
  </Grid>
</template>

<style scoped></style>
