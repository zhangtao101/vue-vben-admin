<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  RadioGroup,
  Row,
  Space,
  Spin,
  Textarea,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getLineProductCheck,
  mergeWorkSheet,
  searchProduceWorkSheetList,
  splitWorkSheet,
} from '#/api';
import EquipmentResources from '#/util/component/equipmentResources.vue';

const props = defineProps({
  type: {
    type: Number,
    default: 1,
  },
});
// region 工作站查询信息

// 查询条件

const queryParams = ref<any>({
  planCode: '',
  workSheetCode: '',
  productName: '',
});

// endregion
// region 作业信息
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      type: 'checkbox',
      width: 50,
    },
    { field: 'workSheetCode', title: '工单号', minWidth: 150 },
    { field: 'planDateStart', title: '计划时间', minWidth: 120 },
    { field: 'productCode', title: '产品编号', minWidth: 120 },
    { field: 'productName', title: '产品名称', minWidth: 280 },
    { field: 'lineName', title: '任务线别', minWidth: 120 },
    { field: 'subProductCode', title: '部件编号', minWidth: 120 },
    { field: 'subProductName', title: '部件名称', minWidth: 280 },
    { field: 'subPlanCode', title: '部件计划号', minWidth: 120 },
    { field: 'subPlanNumber', title: '部件计划数量', minWidth: 120 },
    { field: 'produceUnarrangedNumber', title: '生产未排数', minWidth: 120 },
    { field: 'produceNotFinishNumber', title: '生产未完数', minWidth: 120 },
    { field: 'workSheetPlanNumber', title: '工单计划数', minWidth: 120 },
    { field: 'workSheetFinishNumber', title: '工单完成数', minWidth: 120 },
    { field: 'planCode', title: '计划号', minWidth: 120 },
    { field: 'produceWorkshop', title: '生产车间', minWidth: 120 },
    { field: 'remark', title: '备注', minWidth: 120 },
  ],
  height: 400,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  radioConfig: {
    labelField: 'name',
    trigger: 'row',
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

// 当前选中表格行
const currentRow = ref<any>({});
// 表格事件
const gridEvents: any = {
  radioChange: ({ row }: any) => {
    currentRow.value = {
      ...row,
    };
    queryingDeviceInformation();
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// region 查询数据

/**
 * 查询数据
 * 这个函数用于：
 * 1. 构建包含时间查询参数的请求对象
 * 2. 调用生产工单列表接口获取分页数据
 * 3. 格式化返回数据适配vxe-table组件
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams.value };
    searchProduceWorkSheetList({
      ...params, // 合并所有查询条件
      pageNum: page, // 当前页码(从1开始)
      pageSize, // 每页数据条数
      type: props.type, // 组件传入的业务类型
    })
      .then(({ totalSize, list }) => {
        // 将接口返回数据转换为vxe-table要求的格式
        resolve({
          total: totalSize, // 总数据条数
          items: list, // 当前页数据列表
        });
      })
      .catch((error) => {
        reject(error); // 将错误传递给表格组件处理
      });
  });
}

/**
 * 重置查询条件
 * 1. 清空所有查询参数
 * 2. 触发表格数据重新加载
 * 3. 用于重置按钮点击后的清理操作
 */
function reload() {
  queryParams.value = {}; // 重置查询参数对象
  gridApi.reload(); // 调用表格API重新加载数据
}

// endregion

// region 资源指派
// 设备列表加载状态
const deviceListLoading = ref(false);
// 设备列表
const deviceList = ref<any>([]);
/**
 * 查询设备信息
 * @description
 * - 该函数用于根据当前选中的工单号和工艺类型查询设备信息。
 * - 在查询过程中，会显示加载状态，并在查询完成后更新设备列表。
 */
function queryingDeviceInformation() {
  // 设置加载状态为 true，表示正在查询设备信息
  deviceListLoading.value = true;

  // 调用 getLineProductCheck 函数查询设备信息
  // 传入当前选中的工单号（currentRow.value.id）和工艺类型（currentRow.value.processType）
  getLineProductCheck({
    worksheetCode: currentRow.value.id, // 当前选中的工单号
    type: currentRow.value.processType, // 当前选中的工艺类型
  })
    .then((data) => {
      // 查询成功后，将返回的设备信息存储到 deviceList 中
      deviceList.value = data;
    })
    .finally(() => {
      // 无论查询成功或失败，都设置加载状态为 false
      deviceListLoading.value = false;
    });
}

/**
 * 派工完成
 */
function completed() {
  gridApi.reload();
  deviceList.value = [];
  currentRow.value = {};
}

// endregion

// endregion

// region 底部操作
const exigency = ref([
  { label: '是', value: true },
  { label: '否', value: false },
]);
// 拆合单数据
const additional = ref({
  urgencyFlag: false,
  planWorkNumber: 0,
  quantityNotOffLine: 99_999,
  splitNumber: undefined,
  planStartDate: undefined,
  remark: '',
} as any);
// 是否显示拆合单操作栏
const showAdditional = ref(false);
// 操作状态 1: 拆单 2:合单
const status = ref(1);

/**
 * 拆单
 */
function openOrder() {
  // 获取当前选中的表格行
  const checkboxRecords = gridApi.grid.getCheckboxRecords();
  if (checkboxRecords.length === 1) {
    additional.value.id = checkboxRecords[0].id;
    additional.value.quantityNotOffLine =
      checkboxRecords[0].produceNotFinishNumber;
    showAdditional.value = true;
    status.value = 1;
  } else {
    message.error('请选择一条数据进行拆单!');
  }
}

/**
 * 合单
 */
function joiningOrders() {
  // 获取当前选中的表格行
  const checkboxRecords = gridApi.grid.getCheckboxRecords();
  additional.value.ids = [];
  if (checkboxRecords.length < 2) {
    message.error('请至少选择两条数据进行合单!');
  } else {
    const planCode = checkboxRecords[0].planCode;
    additional.value.quantityNotOffLine = 0;
    for (const item of checkboxRecords) {
      if (planCode !== item.planCode) {
        message.error('请确认选中的数据为同一的计划号!');
        return;
      }
      additional.value.quantityNotOffLine += item.produceNotFinishNumber;
      additional.value.ids.push(item.id);
    }
    showAdditional.value = true;
    additional.value.splitNumber = 1;
    additional.value.planWorkNumber = additional.value.quantityNotOffLine;
    status.value = 2;
  }
}

// 工单提交状态
const orderLoading = ref(false);

/**
 * 拆单/合单 提交
 */
function orderSubmit() {
  const params = { ...additional.value };
  params.planStartDate = dayjs(params.planStartDate).format(
    'YYYY-MM-DD HH:mm:ss',
  );
  params.urgencyFlag = params.urgencyFlag ? 1 : 2;
  orderLoading.value = true;
  (status.value === 1 ? splitWorkSheet(params) : mergeWorkSheet(params))
    .then(() => {
      showAdditional.value = false;
      additional.value = {
        urgencyFlag: false,
      };
      gridApi.reload();
    })
    .finally(() => {
      orderLoading.value = false;
    });
}

// endregion
</script>

<template>
  <!-- region 工作站查询信息 -->
  <Card class="mb-5">
    <Form layout="inline" :model="queryParams">
      <!--计划编号 -->
      <FormItem :label="$t('dispatchHomework.planNumber')">
        <Input v-model:value="queryParams.planCode" />
      </FormItem>
      <!--工单编码 -->
      <FormItem :label="$t('dispatchHomework.workOrderCoding')">
        <Input v-model:value="queryParams.workSheetCode" />
      </FormItem>
      <!--产品名称 -->
      <FormItem :label="$t('dispatchHomework.productName')">
        <Input v-model:value="queryParams.productName" />
      </FormItem>
      <FormItem>
        <Button type="primary" @click="gridApi.reload()" class="mr-4">
          {{ $t('common.search') }}
        </Button>
        <Button @click="reload()">
          {{ $t('common.reset') }}
        </Button>
      </FormItem>
    </Form>
  </Card>
  <!-- endregion -->

  <!-- region 表格内容 -->
  <Card class="mb-5">
    <Grid>
      <template #toolbar-tools>
        <Space>
          <Button type="primary" @click="openOrder">
            {{ $t('dispatchHomework.disassembly') }}
          </Button>
          <Button type="primary" @click="joiningOrders">
            {{ $t('dispatchHomework.consolidation') }}
          </Button>
        </Space>
      </template>
    </Grid>
  </Card>
  <!-- endregion -->

  <!-- region 资源指派 -->
  <Spin :spinning="deviceListLoading">
    <Card
      class="mb-5 min-h-40"
      :title="$t('dispatchHomework.resourceAssignment')"
      v-if="deviceList.length > 0"
    >
      <EquipmentResources
        :workstation-info="item"
        :work-order-id="`${currentRow.id}`"
        :is-active="currentRow.updateUsername === item.equipCode"
        v-for="item of deviceList"
        :key="item.equipCode"
        :show="true"
        @close="completed"
      />
    </Card>
  </Spin>
  <!-- endregion -->

  <Card v-if="showAdditional" class="mb-24">
    <Row :gutter="24">
      <Col :span="8">
        <!-- 紧急批 -->
        <FormItem :label="$t('dispatchHomework.urgentApproval')">
          <RadioGroup
            v-model:value="additional.urgencyFlag"
            :options="exigency"
          />
        </FormItem>
      </Col>
      <Col :span="8">
        <!-- 未下线数量 -->
        <FormItem
          :label="$t('dispatchHomework.theNumberOfUnofflineQuantities')"
        >
          {{ additional.quantityNotOffLine }}
        </FormItem>
      </Col>
      <Col :span="8">
        <!-- 下线数量 -->
        <FormItem :label="$t('dispatchHomework.numberOfDownlines')">
          <InputNumber
            v-model:value="additional.planWorkNumber"
            :disabled="status === 2"
            :max="additional.quantityNotOffLine"
            :min="0"
            placeholder="下线数量"
            class="w-full"
          />
        </FormItem>
      </Col>
    </Row>
    <Row :gutter="24">
      <Col :span="8">
        <!-- 开立批数 -->
        <FormItem
          :label="$t('dispatchHomework.theNumberOfBatchesIsEstablished')"
        >
          <InputNumber
            v-model:value="additional.splitNumber"
            :disabled="status === 2"
            :max="additional.quantityNotOffLine"
            :min="0"
            placeholder="开立批数"
            class="w-full"
          />
        </FormItem>
      </Col>
      <Col :span="8">
        <!-- 预计开立日 -->
        <FormItem :label="$t('dispatchHomework.expectedOpeningDate')">
          <DatePicker
            v-model:value="additional.planStartDate"
            placeholder="预计开立日"
            class="w-full"
          />
        </FormItem>
      </Col>
      <Col :span="8">
        <!-- 备注说明 -->
        <FormItem :label="$t('dispatchHomework.notes')">
          <Textarea
            v-model:value="additional.remark"
            placeholder="备注说明"
            class="w-full"
          />
        </FormItem>
      </Col>
    </Row>
    <Row>
      <Col :span="8" :offset="16">
        <Button
          :loading="orderLoading"
          class="w-full"
          type="primary"
          @click="orderSubmit"
        >
          {{ $t('common.confirm') }}
        </Button>
      </Col>
    </Row>
  </Card>
</template>

<style scoped></style>
