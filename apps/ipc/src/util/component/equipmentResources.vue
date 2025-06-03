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

/**
 * 定义组件的 props，用于接收父组件传递的数据
 */
const props = defineProps({
  // 工作站信息，包含工作站的各种属性
  workstationInfo: {
    type: Object,
    default: () => ({}),
  },
  // 工单ID，用于唯一标识工单
  workOrderId: {
    type: String,
    default: '',
  },
  // 改派ID，用于工单改派操作时的标识
  sendId: {
    type: String,
    default: '',
  },
  // 是否显示操作页面，控制组件的显示状态
  show: {
    type: Boolean,
    default: true,
  },
  // 是否活跃，用于控制组件的交互状态
  isActive: {
    type: Boolean,
    default: false,
  },
});
// 定义事件发射器，用于触发 'close' 事件通知父组件
const emit = defineEmits(['close']);
// region 已派工单列表

// 已派工单表格配置

/**
 * 已派工单表格的配置选项，用于定义表格的列、样式、分页等信息
 */
const gridOptions: VxeGridProps<any> = {
  // 表格内容居中对齐
  align: 'center',
  // 显示表格边框
  border: true,
  // 表格列配置
  columns: [
    {
      // 列标题为序号
      title: '序号',
      // 列类型为序号列，自动生成序号
      type: 'seq',
      // 列对应的字段名
      field: 'seq',
      // 列宽度
      width: 50,
    },
    {
      field: 'workSheetCode',
      title: '工单编号',
      // 列最小宽度
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
  // 表格高度
  height: 370,
  // 显示斑马纹
  stripe: true,
  // 排序配置，支持多列排序
  sortConfig: {
    multiple: true,
  },
  // 分页配置，禁用分页
  pagerConfig: {
    enabled: false,
  },
  // 代理配置，用于异步查询数据
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryData();
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

// 初始化 VxeGrid 组件和 API
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/**
 * 查询工作站已派工单列表
 * 该函数会发起异步请求获取工作站的已派工单数据，并将数据适配到表格所需的格式
 * @returns {Promise<{ total: number, items: any[] }>} 包含总数据量和当前页数据的 Promise
 */
function queryData() {
  return new Promise((resolve, reject) => {
    // 调用 API 接口获取工作站的已派工单列表
    getWorksheetListByWorkstationCode({
      workstationCode: props.workstationInfo.equipCode, // 从父组件获取工作站编码
    })
      .then((data) => {
        // 将接口返回的数据适配到表格所需的格式
        resolve({
          total: data.length, // 总数据量
          items: data, // 当前页数据
        });
      })
      .catch((error) => {
        // 捕获接口调用错误并拒绝 Promise
        reject(error);
      });
  });
}
// 控制已派工单列表抽屉的显示状态
const showWorkOrderListDrawer = ref(false);

/**
 * 打开已派工单列表面板
 * 该函数会刷新已派工单列表数据，并显示已派工单列表抽屉
 * @param {any} _row 预留参数，当前未使用
 */
function displaysTheWorkOrderColumnTable(_row: any) {
  // 刷新已派工单列表数据
  gridApi.reload();
  // 显示已派工单列表抽屉
  showWorkOrderListDrawer.value = true;
}

/**
 * 关闭已派工单列表面板
 * 该函数会隐藏已派工单列表抽屉
 */
function closeTheWorkOrderList() {
  // 隐藏已派工单列表抽屉
  showWorkOrderListDrawer.value = false;
}
// endregion

// region 作业站分配
// 作业站分配表格配置
/**
 * 作业站分配表格的配置选项，用于定义表格的列、样式、分页等信息
 */
const jobStationAssignmentGridOptions: VxeGridProps<any> = {
  // 表格内容居中对齐
  align: 'center',
  // 显示表格边框
  border: true,
  // 表格列配置
  columns: [
    {
      field: 'assignment',
      title: '指派',
      // 列类型为复选框列
      type: 'checkbox',
      minWidth: 50,
    },
    {
      field: 'allowForAdjustment',
      title: '允许调整',
      minWidth: 120,
      // 使用自定义插槽渲染该列内容
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
      // 使用自定义插槽渲染该列内容
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
  // 表格高度
  height: 350,
  // 显示斑马纹
  stripe: true,
  // 排序配置，支持多列排序
  sortConfig: {
    multiple: true,
  },
  // 代理配置，用于异步查询数据
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryJobData();
      },
    },
  },
  // 分页配置，禁用分页
  pagerConfig: {
    enabled: false,
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

// 初始化作业站分配表格的 VxeGrid 组件和 API
const [JobGrid, jobGridApi] = useVbenVxeGrid({
  gridOptions: jobStationAssignmentGridOptions,
});

/**
 * 查询作业站设备列表数据
 * 该函数会发起异步请求获取作业站的设备列表数据，并将数据适配到表格所需的格式
 * @returns {Promise<{ total: number, items: any[] }>} 包含总数据量和当前页数据的 Promise
 */
function queryJobData() {
  return new Promise((resolve, reject) => {
    // 调用 API 接口获取作业站的设备列表
    getAllEquipList({
      workstationCode: props.workstationInfo.equipCode, // 从父组件获取工作站编码
    })
      .then((data) => {
        // 将接口返回的数据适配到表格所需的格式
        resolve({
          total: data.length, // 总数据量
          items: data, // 当前页数据
        });
      })
      .catch((error) => {
        // 捕获接口调用错误并拒绝 Promise
        reject(error);
      });
  });
}
// 控制作业站分配抽屉的显示状态
const showJobDrawer = ref(false);

/**
 * 打开作业站分配面板
 * 该函数会刷新作业站设备列表数据，并显示作业站分配抽屉
 */
function showJobDrawerFun() {
  // 刷新作业站设备列表数据
  jobGridApi.reload();
  // 显示作业站分配抽屉
  showJobDrawer.value = true;
}

/**
 * 关闭作业站分配面板
 * 该函数会隐藏作业站分配抽屉
 */
function closeJobDrawer() {
  // 隐藏作业站分配抽屉
  showJobDrawer.value = false;
}
// 控制提交按钮的加载状态
const submitLoading = ref(false);

/**
 * 提交设备资源分配
 * 该函数会弹出确认对话框，确认后将选中的设备资源分配信息提交到后端
 */
function submit() {
  // 弹出确认对话框
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      // 点击取消按钮，显示警告消息
      message.warning('已取消操作!');
    },
    onOk() {
      // 构建提交参数
      const params: any = {
        id: props.workOrderId,
        equipCodeList: [],
      };
      // 如果存在改派ID，将其添加到参数中
      if (props.sendId) {
        params.sendId = props.sendId;
      }
      // 遍历选中的设备记录，将设备编码和调整标志添加到参数中
      jobGridApi.grid.getCheckboxRecords().forEach((item: any) => {
        params.equipCodeList.push({
          equipCode: item.equipmentCode,
          // 根据是否允许调整转换为接口所需的标志
          isUpdateFlag: item.allowForAdjustment ? 1 : 2,
        });
      });
      // 设置提交按钮为加载状态
      submitLoading.value = true;
      // 调用 API 接口提交设备资源分配信息
      sendListProduct(params)
        .then(() => {
          // 显示成功消息
          message.success($t('common.successfulOperation'));
          // 关闭作业站分配抽屉
          closeJobDrawer();
          // 触发 'close' 事件通知父组件
          emit('close');
        })
        .finally(() => {
          // 无论提交结果如何，取消提交按钮的加载状态
          submitLoading.value = false;
        });
    },
    title: '是否确认派发?',
  });
}

/**
 * 执行工单群发操作
 * 该函数会弹出确认对话框，确认后将工单派发给整个工作站的所有设备
 */
function massSending() {
  // 弹出确认对话框
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      // 点击取消按钮，显示警告消息
      message.warning('已取消操作!');
    },
    onOk() {
      // 调用 API 接口执行工单群发操作
      sendProduct({
        equipCode: props.workstationInfo.equipCode, // 当前工作站编码
        id: props.workOrderId, // 父组件传递的工单ID
      }).then(() => {
        // 显示成功消息
        message.success($t('common.successfulOperation'));
        // 关闭作业站分配抽屉
        closeJobDrawer();
        // 触发 'close' 事件通知父组件
        emit('close');
      });
    },
    title: '是否确认派发?',
  });
}
// endregion

// 暴露 showJobDrawerFun 方法，供父组件调用
defineExpose({
  showJobDrawerFun,
});
</script>

<template>
  <!-- region 工位 -->
  <!-- 当工作站信息存在且 show 为 true 时显示工位组件 -->
  <div
    class="m-4 inline-block h-32 w-64 rounded-lg border border-gray-200"
    v-if="workstationInfo && show"
  >
    <!-- 点击该区域可打开已派工单列表抽屉 -->
    <div
      class="cursor-pointer rounded-t-lg bg-cyan-500 pb-1 pt-1 text-center text-xl text-white hover:bg-amber-200"
      :class="isActive ? 'bg-cyan-500' : 'cursor-not-allowed bg-gray-300'"
      @click="displaysTheWorkOrderColumnTable({})"
    >
      <!-- 显示工作站图标 -->
      <IconifyIcon
        icon="mdi:account-box-multiple"
        class="inline-block align-middle text-xl"
      />
      <!-- 显示工作站名称 -->
      {{ workstationInfo.equipName }}
    </div>
    <!-- 显示工单群发和作业站分配的相关信息 -->
    <Row class="h-[92px]">
      <!-- 点击该区域可执行工单群发操作 -->
      <Col
        span="12"
        class="cursor-pointer border-r-2 text-center hover:bg-amber-200"
        @click="massSending"
      >
        <div class="mb-2 mt-3 text-base font-black">
          <!-- 显示作业组标签 -->
          {{ $t('dispatchHomework.jobGroup') }}
        </div>
        <div>
          <!-- 显示已派工单数量 -->
          {{ $t('dispatchHomework.aWorkOrderHasBeenSent') }}:
          {{ workstationInfo.worksheetNumber }}
        </div>
      </Col>
      <!-- 点击该区域可打开作业站分配面板 -->
      <Col
        span="12"
        class="cursor-pointer border-r-2 text-center hover:bg-amber-200"
        @click="showJobDrawerFun()"
      >
        <div class="mb-2 mt-3 text-base font-black">
          <!-- 显示作业站标签 -->
          {{ $t('dispatchHomework.operatingStation') }}
        </div>
        <div>
          <!-- 显示已派工单数量 -->
          {{ $t('dispatchHomework.aWorkOrderHasBeenSent') }}:
          {{ workstationInfo.equipsheetNumber }}
        </div>
      </Col>
    </Row>
  </div>
  <!-- endregion -->

  <!-- region 已派工列表 -->
  <!-- 已派工单列表抽屉组件 -->
  <Drawer
    v-model:open="showWorkOrderListDrawer"
    height="80%"
    placement="top"
    :title="$t('dispatchHomework.sentOut')"
    @close="closeTheWorkOrderList"
  >
    <!-- 渲染已派工单表格组件 -->
    <Grid />
  </Drawer>
  <!-- endregion -->

  <!-- region 作业站分配 -->
  <!-- 作业站分配抽屉组件 -->
  <Drawer
    v-model:open="showJobDrawer"
    :footer-style="{ textAlign: 'right' }"
    height="80%"
    placement="top"
    :title="$t('dispatchHomework.resourceAssignment')"
    @close="closeJobDrawer"
  >
    <!-- 渲染作业站分配表格组件 -->
    <JobGrid>
      <!-- 自定义所属工序列的渲染内容 -->
      <template #affiliatedProcess>
        <!-- 显示工作站名称 -->
        {{ workstationInfo.equipName }}
      </template>
      <!-- 自定义允许调整列的渲染内容 -->
      <template #allowForAdjustment="{ row }">
        <!-- 显示开关组件，用于控制是否允许调整 -->
        <Switch v-model:checked="row.allowForAdjustment" />
      </template>
    </JobGrid>
    <!-- 定义抽屉的底部按钮 -->
    <template #footer>
      <!-- 取消按钮，点击后关闭作业站分配抽屉 -->
      <Button danger type="primary" @click="closeJobDrawer" class="mr-4">
        {{ $t('common.cancel') }}
      </Button>
      <!-- 确认分配按钮，点击后调用 submit 方法提交设备资源分配信息 -->
      <Button type="primary" @click="submit" :loading="submitLoading">
        {{ $t('common.confirmedDistribution') }}
      </Button>
    </template>
  </Drawer>
  <!-- endregion -->
</template>

<style scoped>
/* 作用域样式，仅对当前组件生效 */
</style>
