<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Col,
  Drawer,
  message,
  Modal,
  Row,
  Switch,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getAllEquipList,
  getWorksheetListByWorkstationCode,
  sendListProduct,
  sendProduct,
} from '#/api';

const props = defineProps({
  // 工作站信息
  workstationInfo: {
    type: Object,
    default: () => ({}),
  },
  // 工单ID
  workOrderId: {
    type: String,
    default: '',
  },
  // 改派ID
  sendId: {
    type: String,
    default: '',
  },
  // 是否显示操作页面
  show: {
    type: Boolean,
    default: true,
  },
  // 是否活跃
  isActive: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['close']);
// region 已派工单列表

// 已派工单表格配置

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
      field: 'workSheetCode',
      title: '工单编号',
      minWidth: 200,
    },
    {
      field: 'productName',
      title: '产品编号',
      minWidth: 200,
    },
    {
      field: 'productCode',
      title: '产品编号',
      minWidth: 200,
    },
    {
      field: 'customerName',
      title: '客户名称',
      minWidth: 200,
    },
    {
      field: 'cLass',
      title: '作业区域',
      minWidth: 200,
    },
    {
      field: 'planDateStart',
      title: '预计开始时间',
      minWidth: 200,
    },
    {
      field: 'sideNo',
      title: '预计结束时间',
      minWidth: 200,
    },
  ],
  height: 370,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  pagerConfig: {
    enabled: false,
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

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/**
 * 查询工作站已派工单列表
 * 功能：根据工作站编码获取已派发的工单数据
 * 流程：
 * 1. 从父组件属性中获取工作站设备编码
 * 2. 调用工作站工单列表接口获取数据
 * 3. 转换接口数据结构适配前端表格
 *
 * 接口说明：
 * getWorksheetListByWorkstationCode - 工作站工单查询接口，接收参数：
 *   - workstationCode: 工作站设备编码（来自父组件 workstationInfo.equipCode）
 *
 * 数据结构：
 * - workSheetCode: 工单编号
 * - productName: 产品名称
 * - productCode: 产品编号
 * - customerName: 客户名称
 * - planDateStart: 预计开始时间
 */
function queryData() {
  return new Promise((resolve, reject) => {
    getWorksheetListByWorkstationCode({
      workstationCode: props.workstationInfo.equipCode, // 从父组件获取工作站编码
    })
      .then((data) => {
        resolve({
          total: data.length, // 总记录数（未分页）
          items: data, // 工单列表数据
        });
      })
      .catch((error) => {
        reject(error); // 异常传递
      });
  });
}
// 显示工单列表抽屉
const showWorkOrderListDrawer = ref(false);

/**
 * 打开已派工单列表面板
 * 功能：显示当前工作站已派发的工单列表
 * 流程：
 * 1. 刷新工单列表数据
 * 2. 打开抽屉组件显示列表
 *
 * @param _row - 预留参数，当前未使用（保持与事件触发参数的兼容性）
 */
function displaysTheWorkOrderColumnTable(_row: any) {
  gridApi.reload(); // 重新加载工单列表数据
  showWorkOrderListDrawer.value = true; // 控制工单列表抽屉显示状态
}

/**
 * 关闭已派工单列表面板
 * 功能：隐藏当前工作站工单列表的抽屉组件
 * 操作：
 * 1. 更新抽屉显示状态为隐藏
 */
function closeTheWorkOrderList() {
  showWorkOrderListDrawer.value = false; // 控制工单列表抽屉的显示状态
}
// endregion

// region 作业站分配
// 作业站分配表格配置
const jobStationAssignmentGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      field: 'assignment',
      title: '指派',
      type: 'checkbox',
      minWidth: 50,
    },
    {
      field: 'allowForAdjustment',
      title: '允许调整',
      minWidth: 120,
      slots: { default: 'allowForAdjustment' },
    },
    {
      field: 'equipmentName',
      title: '设备名称',
      minWidth: 200,
    },
    {
      field: 'model',
      title: '设备型号',
      minWidth: 200,
    },
    {
      field: 'worksheetNumber',
      title: '已派工单数量',
      minWidth: 120,
    },
    {
      field: 'affiliatedProcess',
      title: '所属工序',
      minWidth: 120,
      slots: { default: 'affiliatedProcess' },
    },
    {
      field: 'capacityRate',
      title: '设备负荷',
      minWidth: 120,
    },
    {
      field: 'location',
      title: '设备位置',
      minWidth: 120,
    },
  ],
  height: 350,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryJobData();
      },
    },
  },
  pagerConfig: {
    enabled: false,
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const [JobGrid, jobGridApi] = useVbenVxeGrid({
  gridOptions: jobStationAssignmentGridOptions,
});

/**
 * 查询作业站设备列表数据
 * 功能：根据工作站编码获取关联设备资源信息
 * 流程：
 * 1. 从父组件属性中获取工作站设备编码
 * 2. 调用设备列表接口获取数据
 * 3. 转换接口数据结构适配前端表格
 *
 * 接口说明：
 * getAllEquipList - 设备资源查询接口，接收参数：
 *   - workstationCode: 工作站设备编码（来自父组件 workstationInfo.equipCode）
 *
 * 数据结构：
 * - equipmentName: 设备名称
 * - model: 设备型号
 * - worksheetNumber: 已派工单数量
 * - capacityRate: 设备负荷率
 * - location: 设备位置
 */
function queryJobData() {
  return new Promise((resolve, reject) => {
    getAllEquipList({
      workstationCode: props.workstationInfo.equipCode, // 从父组件获取工作站编码
    })
      .then((data) => {
        resolve({
          total: data.length, // 总设备数量（未分页）
          items: data, // 设备列表数据
        });
      })
      .catch((error) => {
        reject(error); // 异常传递
      });
  });
}
// 显示工单列表抽屉
const showJobDrawer = ref(false);

/**
 * 打开作业站分配面板
 * 功能：显示设备资源分配界面
 * 流程：
 * 1. 重新加载作业站设备列表数据
 * 2. 打开作业站分配抽屉组件
 *
 * 使用场景：当用户需要查看或分配工作站设备资源时触发
 */
function showJobDrawerFun() {
  jobGridApi.reload(); // 刷新设备列表数据
  showJobDrawer.value = true; // 打开作业站分配抽屉
}

/**
 * 关闭已派工单列表面板
 */
function closeJobDrawer() {
  showJobDrawer.value = false;
}
// 提交加载状态
const submitLoading = ref(false);

/**
 * 提交设备资源分配
 * 功能：执行设备资源的批量派发操作
 * 流程：
 * 1. 弹出确认对话框进行二次确认
 * 2. 确认后组装提交参数：
 *   - 工单ID
 *   - 改派ID（如果存在）
 *   - 选中的设备列表（包含设备编码和调整标志）
 * 3. 调用批量派发接口提交数据
 * 4. 成功时：
 *   - 显示操作成功提示
 *   - 关闭分配抽屉
 *   - 通知父组件更新
 * 5. 无论成功失败都重置提交状态
 *
 * 接口说明：
 * sendListProduct - 批量设备派发接口，接收参数：
 *   - id: 当前工单ID
 *   - sendId: 改派ID（可选）
 *   - equipCodeList: 设备编码列表（包含equipCode和isUpdateFlag）
 */
function submit() {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消操作!');
    },
    onOk() {
      const params: any = {
        id: props.workOrderId,
        equipCodeList: [],
      };
      // 处理改派场景参数
      if (props.sendId) {
        params.sendId = props.sendId;
      }
      // 遍历选中的设备记录
      jobGridApi.grid.getCheckboxRecords().forEach((item: any) => {
        params.equipCodeList.push({
          equipCode: item.equipmentCode,
          isUpdateFlag: item.allowForAdjustment ? 1 : 2, // 转换开关状态为接口标识
        });
      });
      submitLoading.value = true;
      sendListProduct(params)
        .then(() => {
          message.success($t('common.successfulOperation'));
          closeJobDrawer();
          emit('close'); // 通知父组件关闭弹窗
        })
        .finally(() => {
          submitLoading.value = false; // 重置加载状态
        });
    },
    title: '是否确认派发?',
  });
}

/**
 * 执行工单群发操作
 * 功能：将当前工单派发给整个工作站的所有设备
 * 流程：
 * 1. 弹出确认对话框进行风险提示
 * 2. 确认后调用群发接口提交参数：
 *   - equipCode: 工作站设备编码
 *   - id: 当前工单ID
 * 3. 成功时：
 *   - 显示国际化成功提示
 *   - 关闭作业站分配抽屉
 *   - 通知父组件更新界面
 *
 * 接口说明：
 * sendProduct - 工单群发接口，接收参数：
 *   - equipCode: 工作站设备编码（来自父组件 workstationInfo）
 *   - id: 当前处理的工单ID
 */
function massSending() {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消操作!');
    },
    onOk() {
      sendProduct({
        equipCode: props.workstationInfo.equipCode, // 当前工作站编码
        id: props.workOrderId, // 父组件传递的工单ID
      }).then(() => {
        message.success($t('common.successfulOperation'));
        closeJobDrawer(); // 关闭资源分配抽屉
        emit('close'); // 触发父组件关闭弹窗
      });
    },
    title: '是否确认派发?',
  });
}
// endregion

defineExpose({
  showJobDrawerFun,
});
</script>

<template>
  <!-- region 工位 -->
  <div
    class="m-4 inline-block h-32 w-64 rounded-lg border border-gray-200"
    v-if="workstationInfo && show"
  >
    <div
      class="cursor-pointer rounded-t-lg bg-cyan-500 pb-1 pt-1 text-center text-xl text-white"
      :class="isActive ? 'bg-cyan-500' : 'cursor-not-allowed bg-gray-300'"
      @click="displaysTheWorkOrderColumnTable({})"
    >
      <IconifyIcon
        icon="mdi:account-box-multiple"
        class="inline-block align-middle text-xl"
      />
      {{ workstationInfo.equipName }}
    </div>
    <Row class="h-[92px]">
      <Col
        span="12"
        class="cursor-pointer border-r-2 text-center hover:bg-amber-200"
        @click="massSending"
      >
        <div class="mb-2 mt-3 text-base font-black">
          {{ $t('dispatchHomework.jobGroup') }}
        </div>
        <div>
          {{ $t('dispatchHomework.aWorkOrderHasBeenSent') }}:
          {{ workstationInfo.worksheetNumber }}
        </div>
      </Col>
      <Col
        span="12"
        class="cursor-pointer border-r-2 text-center hover:bg-amber-200"
        @click="showJobDrawerFun()"
      >
        <div class="mb-2 mt-3 text-base font-black">
          {{ $t('dispatchHomework.operatingStation') }}
        </div>
        <div>
          {{ $t('dispatchHomework.aWorkOrderHasBeenSent') }}:
          {{ workstationInfo.equipsheetNumber }}
        </div>
      </Col>
    </Row>
  </div>
  <!-- endregion -->

  <!-- region 已派工列表 -->
  <Drawer
    v-model:open="showWorkOrderListDrawer"
    :height="500"
    placement="top"
    :title="$t('dispatchHomework.sentOut')"
    @close="closeTheWorkOrderList"
  >
    <Grid />
  </Drawer>
  <!-- endregion -->

  <!-- region 作业站分配 -->
  <Drawer
    v-model:open="showJobDrawer"
    :footer-style="{ textAlign: 'right' }"
    :height="500"
    placement="top"
    :title="$t('dispatchHomework.resourceAssignment')"
    @close="closeJobDrawer"
  >
    <JobGrid>
      <template #affiliatedProcess>
        {{ workstationInfo.equipName }}
      </template>
      <template #allowForAdjustment="{ row }">
        <Switch v-model:checked="row.allowForAdjustment" />
      </template>
    </JobGrid>
    <template #footer>
      <Button danger type="primary" @click="closeJobDrawer" class="mr-4">
        {{ $t('common.cancel') }}
      </Button>
      <Button type="primary" @click="submit" :loading="submitLoading">
        {{ $t('common.confirmedDistribution') }}
      </Button>
    </template>
  </Drawer>
  <!-- endregion -->
</template>

<style scoped></style>
