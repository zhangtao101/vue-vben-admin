<script setup lang="ts">
/**
 * [INPUT]: 依赖 #/api 的 getRemainingFeedEquipListByCode 获取投料设备列表、getRemainingFeedListByCode 获取余料数据、materialDown 提交下料
 * [OUTPUT]: 对外提供余料下料表格组件，包含投料设备选择、余料列表展示、下料数量输入、批量提交功能
 * [POS]: 工步执行子组件，type=52 时由 stepExecution.vue 渲染
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-09-11 10:00:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onBeforeUnmount, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { Button, InputNumber, message, Modal, Select, Spin } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getRemainingFeedEquipListByCode,
  getRemainingFeedListByCode,
  materialDown,
} from '#/api';
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

// region 投料设备选择
// 当前选中的投料设备编号，作为余料明细查询的 equipCode 参数
const selectedEquipCode = ref<string>('');
// 投料设备下拉选项列表，数据来源：getRemainingFeedEquipListByCode
const equipList = ref<any[]>([]);
// 投料设备下拉加载中状态
const equipFetching = ref(false);

/**
 * 根据工单编号获取对应的投料设备列表。
 * 工单编号为空时清空列表与选中值，请求成功后默认不自动选中设备。
 * @returns {void} 无返回值，结果写入 equipList。
 * @since 2026-09-11 10:00:00
 */
function queryEquipList() {
  if (!props.worksheetCode) {
    equipList.value = [];
    selectedEquipCode.value = '';
    return;
  }
  equipFetching.value = true;
  getRemainingFeedEquipListByCode({ worksheetCode: props.worksheetCode })
    .then((data: any) => {
      equipList.value = data || [];
      selectedEquipCode.value = '';
    })
    .finally(() => {
      equipFetching.value = false;
    });
}

/**
 * 设备选择变化回调：选择值变动后重新查询余料明细列表。
 * @returns {void} 无返回值，直接触发 gridApi.query()。
 * @since 2026-09-11 10:00:00
 */
function equipCodeChange() {
  gridApi.query();
}

// 工单编号变化时重新拉取投料设备列表
watch(
  () => props.worksheetCode,
  () => {
    queryEquipList();
  },
  { immediate: true },
);
// endregion

// region 表格配置
// VXE Grid 配置：展示余料列表，包含工单号、料号、物料名称、标签号、料站编号、投料人、上料时间、可下料数量、下料数量
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: $t('productionOperation.seq'), type: 'seq', width: 50 },
    {
      field: 'worksheetCode',
      title: $t('productionOperation.workOrderCode'),
      minWidth: 150,
    },
    {
      field: 'materialCode',
      title: $t('productionOperation.materialCode'),
      minWidth: 120,
    },
    {
      field: 'materialName',
      title: $t('productionOperation.materialName'),
      minWidth: 120,
    },
    {
      field: 'materialPlateCode',
      title: $t('productionOperation.materialPlateCode'),
      minWidth: 140,
    },
    {
      field: 'materialStationCode',
      title: $t('productionOperation.materialStationCode'),
      width: 100,
    },
    {
      field: 'feedUser',
      title: $t('productionOperation.feedUser'),
      width: 120,
    },
    {
      field: 'feedTime',
      title: $t('productionOperation.feedTime'),
      width: 160,
    },
    {
      field: 'number',
      title: $t('productionOperation.availableDownNumber'),
      fixed: 'right',
      width: 110,
    },
    {
      field: '_downNumber',
      slots: { default: 'downNumber' },
      fixed: 'right',
      title: $t('productionOperation.downNumber'),
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
 * 未选中投料设备时直接返回空数据，不发起请求。
 * @returns {Promise<{ total: number; items: any[] }>} 返回 total（记录总数）与 items（含 _downNumber 的余料列表）。
 * @throws 当接口请求失败时，Promise 被 reject 原始错误。
 * @since 2026-06-01 09:10:00
 */
function queryData() {
  return new Promise((resolve, reject) => {
    // 未选择投料设备时，直接返回空列表
    if (!selectedEquipCode.value) {
      resolve({
        total: 0,
        items: [],
      });
      return;
    }
    getRemainingFeedListByCode({
      workstationCode: props.workstationCode,
      worksheetCode: props.worksheetCode,
      bindingId: props.bindingId,
      functionId: props.functionId,
      equipCode: selectedEquipCode.value,
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
    message.warning($t('productionOperation.pleaseInputDownNumber'));
    return;
  }

  // 校验下料数量不超过可下料数量
  const invalidRow = tableData.find((row: any) => row._downNumber > row.number);
  if (invalidRow) {
    message.warning(
      $t('productionOperation.downNumberExceedAvailable', {
        name: invalidRow.materialName,
        number: invalidRow.number,
      }),
    );
    return;
  }

  Modal.confirm({
    title: $t('productionOperation.confirmDown'),
    content: $t('productionOperation.confirmDownContent', {
      count: downList.length,
    }),
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
    <!-- 工具栏左侧：投料设备选择，数据来源为扫码输入工单获取的投料设备列表 -->
    <template #toolbar-actions>
      <span class="mr-2">{{ $t('productionOperation.deviceSelection') }}</span>
      <Select
        v-model:value="selectedEquipCode"
        show-search
        allow-clear
        :placeholder="$t('productionOperation.selectFeedingEquipment')"
        style="width: 200px"
        :field-names="{ label: 'equipmentName', value: 'equipmentCode' }"
        :not-found-content="equipFetching ? undefined : null"
        :options="equipList"
        @change="equipCodeChange"
      >
        <template v-if="equipFetching" #notFoundContent>
          <Spin size="small" />
        </template>
      </Select>
    </template>
    <template #toolbar-tools>
      <Button type="primary" :loading="submitting" @click="submitAllDown">
        {{ $t('productionOperation.down') }}
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
