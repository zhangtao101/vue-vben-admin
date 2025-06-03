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
  Radio,
  RadioButton,
  RadioGroup,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteWorksheet,
  inputSheetBatch,
  moveIn,
  moveOut,
  moveUpAndDown,
  obtainTheWorkOrderManagementList,
} from '#/api';
import EquipmentResources from '#/util/component/equipmentResources.vue';

/**
 * 定义组件的 props，接收父组件传递的查询参数
 */
const props = defineProps({
  // 查询参数对象，用于过滤工单管理列表数据
  queryParams: {
    type: Object,
    default: () => ({}),
  },
});

// region 作业信息
/**
 * 定义 VxeGrid 表格的配置选项
 */
const gridOptions: VxeGridProps<any> = {
  // 表格内容居中对齐
  align: 'center',
  // 显示表格边框
  border: true,
  // 表格列配置
  columns: [
    // 序号列
    {
      title: '序号',
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    // 工单编号列
    {
      field: 'worksheetCode',
      title: '工单编号',
      minWidth: 200,
    },
    // 产品编码列
    {
      field: 'productCode',
      title: '产品编码',
      minWidth: 200,
    },
    // 作业资源列
    {
      field: 'equipCode',
      title: '作业资源',
      minWidth: 200,
    },
    // 工单状态列
    {
      field: 'sendStateName',
      title: '工单状态',
      minWidth: 150,
    },
    // 工单模式列
    {
      field: 'modelTypeName',
      title: '工单模式',
      minWidth: 200,
    },
    // 预计开始时间列
    {
      field: 'planStartDate',
      title: '预计开始时间',
      minWidth: 150,
    },
    // 预计结束时间列
    {
      field: 'planEndDate',
      title: '预计结束时间',
      minWidth: 150,
    },
    // 操作列，固定在右侧
    {
      title: '操作',
      minWidth: 180,
      slots: {
        default: 'action',
      },
      fixed: 'right',
    },
  ],
  // 表格高度
  height: 400,
  // 显示条纹样式
  stripe: true,
  // 排序配置，支持多列排序
  sortConfig: {
    multiple: true,
  },
  // 代理配置，用于异步查询数据
  proxyConfig: {
    ajax: {
      // 分页查询数据
      query: async ({ page }) => {
        return await queryData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
      // 查询所有数据
      queryAll: async () => {
        return await queryData({
          page: 1,
          pageSize: 999_999_999,
        });
      },
    },
  },
  // 工具栏配置
  toolbarConfig: {
    // 自定义工具栏
    custom: true,
    // 注释掉导入功能
    // import: true,
    // 注释掉导出功能
    // export: true,
    // 显示刷新按钮
    refresh: true,
    // 显示缩放按钮
    zoom: true,
  },
};

/**
 * 定义 VxeGrid 表格的事件处理函数
 */
const gridEvents: any = {
  /**
   * 单选框改变事件处理函数
   * @param param0 - 包含当前选中行数据的对象
   */
  radioChange: ({ row }: any) => {
    message.info(`radioChange: ${row}`);
  },
};

/**
 * 初始化 VxeGrid 组件和 API
 */
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// endregion

// region 查询数据
/**
 * 工单列表类型，1 表示待执行列表，2 表示工单总列表
 */
const workOrderType = ref('2');
/**
 * 当前页数据长度
 */
const dataLength = ref(-1);
/**
 * 历史进站最后一次的下标
 */
const historicalEntryIndex = ref(-1);

/**
 * 查询工单管理列表数据
 * @param param0 - 包含分页信息的对象
 * @param param0.page - 当前页码
 * @param param0.pageSize - 每页数据量
 * @returns 包含总数据量和当前页数据的对象
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    // 合并查询参数
    const params: any = {
      ...props.queryParams,
      pagetype: workOrderType.value,
    };

    // 调用接口获取工单管理列表数据
    obtainTheWorkOrderManagementList({
      ...params, // 合并所有查询条件
      pageNum: page, // 接口当前页码
      pageSize, // 接口每页数据量
    })
      .then(({ total, list }) => {
        // 重置历史进站下标
        historicalEntryIndex.value = -1;
        if (list && list.length > 0) {
          // 查找历史进站最后一次的下标
          for (const [i, element] of list.entries()) {
            if (element.historyId) {
              historicalEntryIndex.value = i;
            } else {
              break; // 中断循环
            }
          }
        }
        // 更新当前页数据长度
        dataLength.value = list.length;
        resolve({
          total, // 总数据量
          items: list, // 当前页数据集合
        });
      })
      .catch(() => {
        resolve({
          total: 0, // 总数据量
          items: [], // 当前页数据集合
        });
      });
  });
}

// endregion

// region 进站

/**
 * 处理工单批量进站操作
 */
function inputSheetCode() {
  // 弹出确认对话框
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    // 取消操作回调
    onCancel() {
      message.warning('已取消进站!');
    },
    // 确认操作回调
    onOk() {
      const ids: string[] = [];
      // 筛选出没有历史进站记录的工单 ID
      gridApi.grid.getTableData().tableData.forEach((item: any) => {
        if (!item.historyId) {
          ids.push(item.sendId);
        }
      });
      // 调用批量进站接口
      inputSheetBatch({
        ids,
      }).then(() => {
        message.success($t('common.successfulOperation'));
        // 刷新表格数据
        gridApi.reload();
      });
    },
    title: '是否确认进站?',
  });
}

// endregion
// region 删除

/**
 * 处理工单删除操作
 * @param row - 当前要删除的工单行数据
 */
function delSheetCode(row: any) {
  // 弹出确认对话框
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    // 取消操作回调
    onCancel() {
      message.warning('已取消删除!');
    },
    // 确认操作回调
    onOk() {
      // 调用删除工单接口
      deleteWorksheet(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        // 刷新表格数据
        gridApi.reload();
      });
    },
    title: '是否确认删除?',
  });
}
// endregion
// region 移入&移出&上下移
/**
 * 工单模式，1 表示手动，2 表示自动
 */
const modelType = ref(1);
/**
 * 控制移入对话框是否显示
 */
const showIn = ref(false);
/**
 * 移入的工单数据
 */
const inItem = ref<any>({});

/**
 * 执行工单移入操作
 */
function moveInFun() {
  // 调用工单移入接口
  moveIn({
    id: inItem.value.id,
    modelType: modelType.value,
  }).then(() => {
    message.success($t('common.successfulOperation'));
    // 刷新表格数据
    gridApi.reload();
    // 关闭移入对话框
    showIn.value = false;
  });
}

/**
 * 处理工单移出操作
 * @param row - 当前要移出的工单行数据
 */
function moveOutFun(row: any) {
  // 弹出确认对话框
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    // 取消操作回调
    onCancel() {
      message.warning('已取消移出!');
    },
    // 确认操作回调
    onOk() {
      // 调用工单移出接口
      moveOut({
        id: row.id,
        worksheetCode: row.worksheetCode,
        equipCode: row.equipCode,
      }).then(() => {
        message.success($t('common.successfulOperation'));
        // 刷新表格数据
        gridApi.reload();
      });
    },
    title: '是否确认移出?',
  });
}

/**
 * 处理工单顺序调整
 * @param index - 当前操作行索引
 * @param direction - 移动方向，'down' 表示下移，'up' 表示上移
 */
function sorting(index: number, direction: 'down' | 'up') {
  // 获取表格数据
  const data = gridApi.grid.getTableData();
  let targetIndex = 0;
  // 根据移动方向计算目标索引
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

  // 调用顺序调整接口
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
    // 刷新表格数据
    gridApi.reload();
  });
}
// endregion

// region 改派
/**
 * 当前改派的工单数据
 */
const reassignmentItem = ref<any>({});
/**
 * 设备资源子组件引用
 */
const equipmentResourcesRef = ref<any>();

/**
 * 处理工单改派操作
 * @param row - 当前要改派的工单行数据
 */
function reassignment(row: any) {
  // 缓存当前工单数据
  reassignmentItem.value = {
    ...row,
  };
  // 调用设备资源子组件的展示方法
  equipmentResourcesRef.value.showJobDrawerFun();
}

/**
 * 关闭改派对话框并刷新表格数据
 */
function reassignmentClose() {
  // 清空改派工单数据
  reassignmentItem.value = {};
  // 刷新表格数据
  gridApi.reload();
}

// region 暴露方法

/**
 * 刷新表格数据
 */
const query = () => {
  gridApi.reload();
};

/**
 * 暴露 query 方法供父组件调用
 */
defineExpose({
  query,
});

// endregion
</script>

<template>
  <!-- region 表格内容 -->
  <!-- 卡片组件，用于包裹表格 -->
  <Card class="mb-5">
    <!-- 渲染 VxeGrid 表格 -->
    <Grid class="mt-4">
      <!-- 自定义工具栏工具 -->
      <template #toolbar-tools>
        <!-- 当工单列表类型为待执行列表时，显示进站按钮 -->
        <Button
          type="primary"
          @click="inputSheetCode()"
          v-if="workOrderType === '1'"
        >
          {{ $t('workOrderEntry.pullIn') }}
        </Button>
      </template>
      <!-- 自定义工具栏操作 -->
      <template #toolbar-actions>
        <!-- 单选按钮组，用于切换工单列表类型 -->
        <RadioGroup
          v-model:value="workOrderType"
          button-style="solid"
          @change="() => gridApi.reload()"
        >
          <RadioButton value="1">待执行列表</RadioButton>
          <RadioButton value="2">工单总列表</RadioButton>
        </RadioGroup>
      </template>
      <!-- 操作列自定义插槽 -->
      <template #action="{ row, rowIndex }">
        <!-- 注释掉的进站按钮 -->
        <!--        <Tooltip v-if="row.sendState !== 3">
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
        </Tooltip>-->
        <!-- 恢复按钮 -->
        <Tooltip v-if="row.sendState === 3">
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
        <!-- 注释掉的暂停按钮 -->
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
        <!-- 改派按钮，当工单列表类型为工单总列表时显示 -->
        <Tooltip v-if="workOrderType === '2'">
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
        <!-- 移入按钮，当工单列表类型为工单总列表时显示 -->
        <Tooltip v-if="workOrderType === '2'">
          <template #title>{{ $t('workOrderEntry.moveIn') }}</template>
          <Button
            type="link"
            :icon="
              h(IconifyIcon, {
                icon: 'mdi:login-variant',
                class: 'inline-block text-2xl',
              })
            "
            @click="
              () => {
                inItem = row;
                showIn = true;
                modelType = 1;
              }
            "
          />
        </Tooltip>
        <!-- 移出按钮，当工单列表类型为待执行列表且行索引大于历史进站下标时显示 -->
        <Tooltip
          v-if="workOrderType === '1' && rowIndex > historicalEntryIndex"
        >
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
        <!-- 上移按钮，当工单列表类型为待执行列表且行索引大于历史进站下标加 1 时显示 -->
        <Tooltip
          v-if="workOrderType === '1' && rowIndex > historicalEntryIndex + 1"
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
        <!-- 下移按钮，当工单列表类型为待执行列表且行索引小于数据长度减 1 且大于历史进站下标时显示 -->
        <Tooltip
          v-if="
            workOrderType === '1' &&
            rowIndex < dataLength - 1 &&
            rowIndex > historicalEntryIndex
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
        <!-- 删除按钮，当工单列表类型为工单总列表时显示 -->
        <Tooltip v-if="workOrderType === '2'">
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

  <!-- 设备资源子组件，用于工单改派 -->
  <EquipmentResources
    ref="equipmentResourcesRef"
    :workstation-info="{ equipCode: queryParams.workstationCode }"
    :work-order-id="`${reassignmentItem.id}`"
    :send-id="`${reassignmentItem.id}`"
    :show="false"
    @close="reassignmentClose"
  />

  <!-- 移入确认对话框 -->
  <Modal v-model:open="showIn" title="是否确认移入?" @ok="moveInFun">
    <!-- 单选按钮组，用于选择工单移入模式 -->
    <RadioGroup v-model:value="modelType">
      <Radio :value="1">手动</Radio>
      <Radio :value="2">自动</Radio>
    </RadioGroup>
  </Modal>
</template>

<style scoped>
/* 作用域样式，仅对当前组件生效 */
</style>
