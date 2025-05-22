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
      field: 'sendStateName',
      title: '工单状态',
      minWidth: 150,
    },
    {
      field: 'modelTypeName',
      title: '工单模式',
      minWidth: 200,
    },
    {
      field: 'planStartDate',
      title: '预计开始时间',
      minWidth: 150,
    },
    {
      field: 'planEndDate',
      title: '预计结束时间',
      minWidth: 150,
    },
    {
      title: '操作',
      minWidth: 180,
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
// 历史进站最后一次的下标
const historicalEntryIndex = ref(-1);

/**
 * 查询工单管理列表数据
 * 功能：获取分页工单数据并处理不同模型类型参数
 * 流程：
 * 1. 合并父组件传递的查询参数
 * 2. 处理自动模式下的分页类型参数
 * 3. 调用工单管理列表接口获取数据
 * 4. 更新全局数据长度状态
 * 5. 返回表格组件需要的分页数据结构
 *
 * 接口说明：
 * obtainTheWorkOrderManagementList - 工单管理列表接口，接收参数：
 *   - ...props.queryParams: 父组件传递的查询条件
 *   - pageNum: 当前页码
 *   - pageSize: 每页数据量
 *   - pagetype: 当modelType=2时附加的分页类型参数
 *
 * 数据结构处理：
 * - 自动模式(modelType=2)下添加pagetype参数区分自动/工单总列表
 * - dataLength: 存储当前页数据量用于控制上下移按钮状态
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params: any = {
      ...props.queryParams,
      pagetype: workOrderType.value,
    };

    obtainTheWorkOrderManagementList({
      ...params, // 合并所有查询条件
      pageNum: page, // 接口当前页码
      pageSize, // 接口每页数据量
    })
      .then(({ total, list }) => {
        historicalEntryIndex.value = -1;
        if (list && list.length > 0) {
          for (const [i, element] of list.entries()) {
            if (element.historyId) {
              historicalEntryIndex.value = i;
            } else {
              break; // 中断循环
            }
          }
        }
        dataLength.value = list.length; // 更新当前页数据量
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
 * 处理工单进站操作
 * 功能：执行工单进站操作并进行二次确认
 * 流程：
 * 1. 弹出确认对话框提示用户确认进站
 * 2. 确认后调用进站接口提交工单ID
 * 3. 操作成功时刷新表格数据并显示成功提示
 *
 * 接口说明：
 * inputSheet - 工单进站接口，接收参数：
 *   - id: 当前工单唯一标识（来自行数据row.id）
 *
 * 注意事项：
 * - 使用ant-design的Modal组件实现操作确认
 * - 成功提示使用国际化处理的多语言文本
 * - 标题及取消提示暂为中文硬编码，需根据需求国际化
 */
function inputSheetCode() {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消进站!');
    },
    onOk() {
      const ids: string[] = [];
      gridApi.grid.getTableData().tableData.forEach((item: any) => {
        if (!item.historyId) {
          ids.push(item.sendId);
        }
      });
      inputSheetBatch({
        ids,
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
 * 处理工单删除操作
 * 功能：执行工单删除操作并进行二次确认
 * 流程：
 * 1. 弹出确认对话框提示用户确认删除
 * 2. 确认后调用删除接口提交工单ID
 * 3. 操作成功时刷新表格数据并显示提示
 *
 * 接口说明：
 * deleteWorksheet - 工单删除接口，接收参数：
 *   - id: 当前工单唯一标识（来自行数据row.id）
 *
 * 注意事项：
 * - 使用ant-design的Modal组件实现操作确认
 * - 成功提示使用国际化处理的多语言文本
 * - 删除操作不可逆，需确保二次确认的必要性
 * - 标题及取消提示暂为中文硬编码，需根据需求国际化
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
 * 工单模式
 */
const modelType = ref(1);
/**
 * 显示移入对话框
 */
const showIn = ref(false);
/**
 * 移入数据
 */
const inItem = ref<any>({});
/**
 * 处理工单移入操作
 *
 * 功能：执行工单移入操作并进行二次确认，支持选择手动/自动模式
 *
 * 流程：
 * 1. 初始化模式类型为手动（modelType.value = 1）
 * 2. 弹出带模式选择框的确认对话框
 * 3. 用户可选择手动或自动模式
 * 4. 确认后调用移入接口提交工单ID和模式类型
 * 5. 操作成功时刷新表格数据并显示国际化成功提示
 * 6. 取消操作时显示取消提示
 *
 *
 * @throws {Error} 当接口调用失败时抛出异常
 *
 * 接口说明：
 * moveIn - 工单移入接口
 * @param {object} params 接口参数
 * @param {string} params.id - 工单ID（来自row.id）
 * @param {number} params.modelType - 模式类型（1:手动 2:自动）
 *
 * 组件配置：
 * - 使用ant-design的Modal.confirm创建确认对话框
 * - 对话框内容包含RadioGroup单选组件：
 *   - Radio选项1: value=1 显示"手动"
 *   - Radio选项2: value=2 显示"自动"
 * - 对话框标题固定为中文"是否确认移入?"
 *
 * 注意事项：
 * - 模式选择值通过v-model绑定到modelType响应式变量
 * - 成功提示使用$t('common.successfulOperation')实现国际化
 * - 操作完成后通过gridApi.reload()刷新表格数据
 * - 对话框取消文本和确认文本使用中文硬编码
 */
function moveInFun() {
  moveIn({
    id: inItem.value.id,
    modelType: modelType.value,
  }).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
    showIn.value = false;
  });
}
/**
 * 处理工单移出操作
 * 功能：执行工单移出操作并进行二次确认
 * 流程：
 * 1. 弹出确认对话框提示用户确认移出
 * 2. 确认后调用移出接口提交工单信息
 * 3. 操作成功时刷新表格数据并显示提示
 *
 * 接口说明：
 * moveOut - 工单移出接口，接收参数：
 *   - id: 当前工单唯一标识（来自行数据row.id）
 *   - worksheetCode: 工单编号（来自行数据row.worksheetCode）
 *
 * 注意事项：
 * - 使用ant-design的Modal组件实现操作确认
 * - 成功提示使用国际化处理的多语言文本
 * - 移出操作通常用于将工单从当前列表中移除
 * - 需同时提交工单ID和编号确保接口准确性
 * - 标题及取消提示暂为中文硬编码，需根据需求国际化
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
        equipCode: row.equipCode,
      }).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
    title: '是否确认移出?',
  });
}

/**
 * 处理工单顺序调整
 * 功能：实现工单在列表中的上下位置交换
 * 流程：
 * 1. 获取当前表格完整数据
 * 2. 根据方向计算目标位置索引
 * 3. 构建交换顺序的接口参数
 * 4. 调用顺序调整接口提交数据
 * 5. 操作成功后刷新表格数据
 *
 * @param index - 当前操作行索引
 * @param direction - 移动方向 ('up'上移/'down'下移)
 *
 * 接口说明：
 * moveUpAndDown - 顺序调整接口，接收参数：
 *   - Array<{id:工单ID, orderNo:新序号}>
 *   需要同时提交交换位置的两个工单信息：
 *   - 当前工单ID + 目标位置工单的orderNo
 *   - 目标工单ID + 当前工单的orderNo
 *
 * 注意事项：
 * - 移动范围已在模板中校验(rowIndex > 0 和 rowIndex < dataLength -1)
 * - 使用$t实现操作成功的国际化提示
 * - 接口需要成对提交两个工单的新序号才能实现位置交换
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
 * 处理工单改派操作
 * 功能：初始化改派数据并触发改派界面
 * 流程：
 * 1. 缓存当前行工单数据至响应式对象
 * 2. 调用设备资源子组件的抽屉展示方法
 *
 * @param row - 当前操作行数据，包含工单完整信息
 *
 * 组件说明：
 * equipmentResourcesRef - 设备资源子组件引用，提供改派界面交互能力
 *
 * 注意事项：
 * - 改派操作需要设备资源子组件协同完成
 * - 改派完成后会触发@close事件并刷新表格数据
 * - 使用对象展开运算符(...)实现数据解构传递
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
      <template #toolbar-tools>
        <Button
          type="primary"
          @click="inputSheetCode()"
          v-if="workOrderType === '1'"
        >
          {{ $t('workOrderEntry.pullIn') }}
        </Button>
      </template>
      <template #toolbar-actions>
        <RadioGroup
          v-model:value="workOrderType"
          button-style="solid"
          @change="() => gridApi.reload()"
        >
          <RadioButton value="1">待执行列表</RadioButton>
          <RadioButton value="2">工单总列表</RadioButton>
        </RadioGroup>
      </template>
      <template #action="{ row, rowIndex }">
        <!-- 进站 ="{ row }"-->
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
        <!-- 恢复 -->
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
        <!-- 移入 -->
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
        <!-- 移出 -->
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
        <!-- 上移 -->
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
        <!-- 下移 -->
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
        <!-- 删除 -->
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

  <EquipmentResources
    ref="equipmentResourcesRef"
    :workstation-info="{ equipCode: queryParams.workstationCode }"
    :work-order-id="`${reassignmentItem.id}`"
    :send-id="`${reassignmentItem.id}`"
    :show="false"
    @close="reassignmentClose"
  />

  <Modal v-model:open="showIn" title="是否确认移入?" @ok="moveInFun">
    <RadioGroup v-model:value="modelType">
      <Radio :value="1">手动</Radio>
      <Radio :value="2">自动</Radio>
    </RadioGroup>
  </Modal>
</template>

<style scoped></style>
