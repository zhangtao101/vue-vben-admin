<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, ref } from 'vue';

import { IconifyIcon, MdiLightDelete } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  message,
  Modal,
  RadioButton,
  RadioGroup,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteWorksheet,
  inputSheet,
  moveIn,
  moveOut,
  moveUpAndDown,
  obtainTheWorkOrderManagementList,
} from '#/api';
import EquipmentResources from '#/util/component/equipmentResources.vue';

const props = defineProps({
  queryParams: {
    type: Object,
    default: () => ({}),
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
      minWidth: 200,
    },
    {
      field: 'productCode',
      title: '产品编码',
      minWidth: 200,
    },
    {
      field: 'equipCode',
      title: '作业资源',
      minWidth: 200,
    },
    {
      field: 'sendState',
      title: '工单状态',
      minWidth: 200,
      slots: { default: 'sendState' },
    },
    {
      field: 'planStartDate',
      title: '预计开始时间',
      minWidth: 200,
    },
    {
      field: 'planEndDate',
      title: '预计结束时间',
      minWidth: 200,
    },
    {
      title: '操作',
      minWidth: 200,
      slots: {
        default: 'action',
      },
      fixed: 'right',
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
      queryAll: async () => {
        return await queryData({
          page: 1,
          pageSize: 999_999_999,
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

// endregion

// region 查询数据
// 工单列表类型
const workOrderType = ref('2');
// 数据长度
const dataLength = ref(-1);

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = {
      ...props.queryParams,
    };
    if (props.queryParams.modelType === '2') {
      params.pagetype = workOrderType.value;
    }
    obtainTheWorkOrderManagementList({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ total, list }) => {
        dataLength.value = list.length;
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
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
 * 获取状态文本
 * @param status 状态
 * @returns 状态文本
 */
function getStatusText(status: number) {
  switch (status) {
    case 0: {
      return '未开工';
    }
    case 1: {
      return '已开工';
    }
    case 3: {
      return '暂停下线';
    }
  }
}

// endregion

// region 进站

function inputSheetCode(row: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消进站!');
    },
    onOk() {
      inputSheet({
        id: row.id,
      }).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
    title: '是否确认进站?',
  });
}

// endregion
// region 删除
/**
 * 删除
 * @param row
 */
function delSheetCode(row: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消删除!');
    },
    onOk() {
      deleteWorksheet(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
    title: '是否确认删除?',
  });
}
// endregion
// region 移入&移出&上下移
/**
 * 移入
 * @param row
 */
function moveInFun(row: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消移入!');
    },
    onOk() {
      moveIn({
        id: row.id,
      }).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
    title: '是否确认移入?',
  });
}
/**
 * 移出
 * @param row
 */
function moveOutFun(row: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消移出!');
    },
    onOk() {
      moveOut({
        id: row.id,
        worksheetCode: row.worksheetCode,
      }).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
    title: '是否确认移出?',
  });
}

/**
 * 上下移
 * @param index 当前行索引
 * @param direction 方向
 */
function sorting(index: number, direction: 'down' | 'up') {
  const data = gridApi.grid.getTableData();
  let targetIndex = 0;
  switch (direction) {
    case 'down': {
      targetIndex = index + 1;
      break;
    }
    case 'up': {
      targetIndex = index - 1;
      break;
    }
  }

  moveUpAndDown([
    {
      id: data.tableData[index].id,
      orderNo: data.tableData[targetIndex].orderNo,
    },
    {
      id: data.tableData[targetIndex].id,
      orderNo: data.tableData[index].orderNo,
    },
  ]).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}
// endregion

// region 改派
// 当前改派的工单
const reassignmentItem = ref<any>({});
// 改派子组件对象
const equipmentResourcesRef = ref<any>();
/**
 * 改派
 * @param row
 */
function reassignment(row: any) {
  reassignmentItem.value = {
    ...row,
  };
  equipmentResourcesRef.value.showJobDrawerFun();
}

/**
 * 关闭改派
 */
function reassignmentClose() {
  reassignmentItem.value = {};
  gridApi.reload();
}

// region 暴露方法

const query = () => {
  gridApi.reload();
};

defineExpose({
  query,
});

// endregion
</script>

<template>
  <!-- region 表格内容 -->
  <Card class="mb-5">
    <Grid class="mt-4">
      <template #toolbar-actions>
        <RadioGroup
          v-model:value="workOrderType"
          button-style="solid"
          v-if="queryParams.modelType === '2'"
          @change="() => gridApi.reload()"
        >
          <RadioButton value="1">自动列表</RadioButton>
          <RadioButton value="2">工单总列表</RadioButton>
        </RadioGroup>
      </template>
      <template #sendState="{ row }">
        {{ getStatusText(row.sendState) }}
      </template>
      <template #action="{ row, rowIndex }">
        <!-- 进站 ="{ row }"-->
        <Tooltip v-if="queryParams.modelType === '1' && row.sendState !== 3">
          <template #title>{{ $t('workOrderEntry.pullIn') }}</template>
          <Button
            type="link"
            :icon="
              h(IconifyIcon, {
                icon: 'mdi:check-underline',
                class: 'inline-block text-2xl',
              })
            "
            @click="inputSheetCode(row)"
          />
        </Tooltip>
        <!-- 恢复 -->
        <Tooltip v-if="queryParams.modelType === '1' && row.sendState === 3">
          <template #title>{{ $t('workOrderEntry.recover') }}</template>
          <Button
            type="link"
            :icon="
              h(IconifyIcon, {
                icon: 'mdi:battery-sync-outline',
                class: 'inline-block text-2xl',
              })
            "
          />
        </Tooltip>
        <!-- 暂停 -->
        <!--        <Tooltip>
          <template #title>{{ $t('workOrderEntry.pause') }}</template>
          <Button
            type="link"
            :icon="
              h(IconifyIcon, {
                icon: 'mdi:pause',
                class: 'inline-block text-2xl',
              })
            "
          />
        </Tooltip>-->
        <!-- 改派 -->
        <Tooltip v-if="queryParams.modelType === '1' || workOrderType === '2'">
          <template #title>{{ $t('workOrderEntry.reassignment') }}</template>
          <Button
            type="link"
            :icon="
              h(IconifyIcon, {
                icon: 'mdi:backup-restore',
                class: 'inline-block text-2xl',
              })
            "
            @click="reassignment(row)"
          />
        </Tooltip>
        <!-- 移入 -->
        <Tooltip v-if="queryParams.modelType === '2' && workOrderType === '2'">
          <template #title>{{ $t('workOrderEntry.moveIn') }}</template>
          <Button
            type="link"
            :icon="
              h(IconifyIcon, {
                icon: 'mdi:login-variant',
                class: 'inline-block text-2xl',
              })
            "
            @click="moveInFun(row)"
          />
        </Tooltip>
        <!-- 移出 -->
        <Tooltip v-if="queryParams.modelType === '2' && workOrderType === '1'">
          <template #title>{{ $t('workOrderEntry.moveOut') }}</template>
          <Button
            type="link"
            :icon="
              h(IconifyIcon, {
                icon: 'mdi:logout',
                class: 'inline-block text-2xl',
              })
            "
            @click="moveOutFun(row)"
          />
        </Tooltip>
        <!-- 上移 -->
        <Tooltip
          v-if="
            queryParams.modelType === '2' &&
            workOrderType === '1' &&
            rowIndex > 0
          "
        >
          <template #title>{{ $t('workOrderEntry.moveUp') }}</template>
          <Button
            type="link"
            :icon="
              h(IconifyIcon, {
                icon: 'mdi:arrow-up-thin',
                class: 'inline-block text-2xl',
              })
            "
            @click="sorting(rowIndex, 'up')"
          />
        </Tooltip>
        <!-- 下移 -->
        <Tooltip
          v-if="
            queryParams.modelType === '2' &&
            workOrderType === '1' &&
            rowIndex < dataLength - 1
          "
        >
          <template #title>
            {{ $t('workOrderEntry.moveDown') }}
          </template>
          <Button
            type="link"
            :icon="
              h(IconifyIcon, {
                icon: 'mdi:arrow-down-thin',
                class: 'inline-block text-2xl',
              })
            "
            @click="sorting(rowIndex, 'down')"
          />
        </Tooltip>
        <!-- 删除 -->
        <Tooltip v-if="queryParams.modelType === '1' || workOrderType === '2'">
          <template #title>{{ $t('common.delete') }}</template>
          <Button
            type="link"
            danger
            :icon="
              h(MdiLightDelete, {
                class: 'inline-block text-2xl',
              })
            "
            @click="delSheetCode(row)"
          />
        </Tooltip>
      </template>
    </Grid>
  </Card>
  <!-- endregion -->

  <EquipmentResources
    ref="equipmentResourcesRef"
    :workstation-info="{ equipCode: queryParams.workstationCode }"
    :work-order-id="`${reassignmentItem.id}`"
    :send-id="`${reassignmentItem.id}`"
    :show="false"
    @close="reassignmentClose"
  />
</template>

<style scoped></style>
