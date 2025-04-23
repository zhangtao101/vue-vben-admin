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
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData() {
  return new Promise((resolve, reject) => {
    getWorksheetListByWorkstationCode({
      workstationCode: props.workstationInfo.equipCode,
    })
      .then((data) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total: data.length,
          items: data,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}
// 显示工单列表抽屉
const showWorkOrderListDrawer = ref(false);
/**
 * 显示已派工单列表面板
 * @param _row
 */
function displaysTheWorkOrderColumnTable(_row: any) {
  gridApi.reload();
  showWorkOrderListDrawer.value = true;
}
/**
 * 关闭已派工单列表面板
 */
function closeTheWorkOrderList() {
  showWorkOrderListDrawer.value = false;
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
      minWidth: 120,
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
      minWidth: 120,
    },
    {
      field: 'model',
      title: '设备型号',
      minWidth: 120,
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
  height: 400,
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
 * 查询数据
 */
function queryJobData() {
  return new Promise((resolve, reject) => {
    getAllEquipList({
      workstationCode: props.workstationInfo.equipCode,
    })
      .then((data) => {
        resolve({
          total: data.length,
          items: data,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}
// 显示工单列表抽屉
const showJobDrawer = ref(false);
/**
 * 显示已派工单列表面板
 */
function showJobDrawerFun() {
  jobGridApi.reload();
  showJobDrawer.value = true;
}
/**
 * 关闭已派工单列表面板
 */
function closeJobDrawer() {
  showJobDrawer.value = false;
}

/**
 * 提交
 */
function submit() {
  Modal.confirm({
    // 取消按钮的文本
    cancelText: '取消',
    // 确认按钮的文本
    okText: '确认',
    // 确认按钮的类型（此处为危险操作，通常用于删除等不可逆操作）
    okType: 'danger',

    // 用户取消操作时触发的回调函数
    onCancel() {
      // 弹出警告提示，提示用户取消了删除操作
      message.warning('已取消操作!');
    },

    // 用户确认操作时触发的回调函数
    onOk() {
      const params: any = {
        id: props.workOrderId,
        equipCodeList: [],
      };
      if (props.sendId) {
        params.sendId = props.sendId;
      }
      jobGridApi.grid.getCheckboxRecords().forEach((item: any) => {
        params.equipCodeList.push({
          equipCode: item.equipmentCode,
          isUpdateFlag: item.allowForAdjustment ? 1 : 2,
        });
      });
      sendListProduct(params).then(() => {
        message.success($t('common.successfulOperation')); // 成功操作的提示信息（通过国际化处理）
        closeJobDrawer();
        emit('close');
      });
    },

    // 确认框的标题文本
    title: '是否确认派发?',
  });
}

/**
 * 群发
 */
function massSending() {
  Modal.confirm({
    // 取消按钮的文本
    cancelText: '取消',
    // 确认按钮的文本
    okText: '确认',
    // 确认按钮的类型（此处为危险操作，通常用于删除等不可逆操作）
    okType: 'danger',

    // 用户取消操作时触发的回调函数
    onCancel() {
      // 弹出警告提示，提示用户取消了删除操作
      message.warning('已取消操作!');
    },

    // 用户确认操作时触发的回调函数
    onOk() {
      sendProduct({
        equipCode: props.workstationInfo.equipCode,
        id: props.workOrderId,
      }).then(() => {
        message.success($t('common.successfulOperation')); // 成功操作的提示信息（通过国际化处理）
        closeJobDrawer();
        emit('close');
      });
    },

    // 确认框的标题文本
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
        class="cursor-pointer border-r-2 text-center"
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
        class="cursor-pointer border-r-2 text-center"
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
      <Button type="primary" @click="submit">
        {{ $t('common.confirmedDistribution') }}
      </Button>
    </template>
  </Drawer>
  <!-- endregion -->
</template>

<style scoped></style>
