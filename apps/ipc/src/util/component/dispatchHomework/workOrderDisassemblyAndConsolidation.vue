<script setup lang="ts">

import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref, watch } from 'vue';

import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  DescriptionsItem,
  Divider,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  RadioGroup,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Textarea,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getLineProductCheck,
  getMergeSplitWorkSheet,
  listPoOrderByWorksheetCode,
  listSoOrderByPoOrderCode,
  mergeWorkSheet,
  saveMergeWorkSheet,
  searchProduceWorkSheetList,
  splitWorkSheet,
} from '#/api';
import { getProcessTypeList } from '#/api/flow/dispatchHomework.service';
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
  processType: undefined,
});

// 工单单别列表
const processTypeList = ref<any>([]);

// 获取工单单别列表
function fetchProcessTypeList() {
  getProcessTypeList().then((res: any) => {
    processTypeList.value = res.data || [];
  });
}

// 组件挂载时初始化加载
onMounted(() => {
  fetchProcessTypeList();
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
    console.log(currentRow.value);
  },
  checkboxChange: ({ records }: any) => {
    if (!records || records.length === 0) {
      poOrderData.value = [];
      return;
    }
    const wsCodes = records
      .map((item: any) => item.workSheetCode)
      .filter(Boolean)
      .join(',');
    if (!wsCodes) {
      poOrderData.value = [];
      return;
    }
    poOrderLoading.value = true;
    listPoOrderByWorksheetCode({ worksheetCodes: wsCodes })
      .then((data: any) => {
        poOrderData.value = data || [];
      })
      .finally(() => {
        poOrderLoading.value = false;
      });
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// region PO订单数据回显
const poOrderData = ref<any[]>([]);
const poOrderLoading = ref(false);

const poOrderGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { field: 'orderCode', title: 'PO单号', minWidth: 120 },
    { field: 'seq', title: '行号', minWidth: 80 },
    { field: 'productCode', title: '产品编号', minWidth: 120 },
    { field: 'productName', title: '产品名称', minWidth: 200 },
    { field: 'orderNumber', title: '订单数量', minWidth: 100 },
    { field: 'deliveryDate', title: '交期', minWidth: 120 },
    { field: 'worksheetCode', title: '工单号', minWidth: 150 },
    { field: 'planCode', title: '计划号', minWidth: 120 },
  ],
  height: 300,
  stripe: true,
  toolbarConfig: {
    refresh: true,
    zoom: true,
  },
};
const [PoOrderGrid, poOrderGridApi] = useVbenVxeGrid({
  gridOptions: poOrderGridOptions,
});

// 监听poOrderData变化，更新表格数据
watch(poOrderData, (newData) => {
  console.log(poOrderGridApi.grid);
  setTimeout(() => {
    poOrderGridApi.grid.reloadData(newData);
  }, 500);
});
// endregion

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

// region 拆单重组抽屉
// 拆单顶部抽屉
const splitDrawerVisible = ref(false);
const splitDrawerLoading = ref(false);
const splitNumberInput = ref<number>(1);
const splitResultList = ref<any[]>([]);
const splitSaveLoading = ref(false);

// 拆分结果表格列定义
const splitColumns: any[] = [
  { title: '工单号', dataIndex: 'workSheetCode', key: 'workSheetCode', width: 160 },
  { title: '计划号', dataIndex: 'planCode', key: 'planCode', width: 120 },
  { title: '产品编号', dataIndex: 'productCode', key: 'productCode', width: 150 },
  { title: '产品名称', dataIndex: 'productName', key: 'productName', width: 200 },
  { title: '工单计划数', dataIndex: 'workSheetPlanNumber', key: 'workSheetPlanNumber', width: 100 },
  { title: '线别', dataIndex: 'lineName', key: 'lineName', width: 100 },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 120 },
  { title: '绑定状态', key: 'bindStatus', width: 100 },
  { title: '操作', key: 'action', width: 80, fixed: 'right' as any },
];

// 绑定右侧抽屉
const bindDrawerVisible = ref(false);
const bindDrawerLoading = ref(false);
const currentBindRow = ref<any>({});
const poSoData = ref<{ poDetails: any[]; soDetails: any[] }>({
  poDetails: [],
  soDetails: [],
});
const bindForm = ref({
  poOrderCode: undefined as string | undefined,
  soOrderCode: undefined as string | undefined,
  deliveryDate: undefined as string | undefined,
  poOrderNumber: 0,
  soOrderNumber: 0,
  productCode: '',
  productName: '',
});

// 绑定数据存储 (key: workSheetCode, value: choseDetail[])
const bindingsMap = ref<Record<string, any[]>>({});

/**
 * 拆单-打开拆单抽屉
 */
function openOrder() {
  const checkboxRecords = gridApi.grid.getCheckboxRecords();
  if (checkboxRecords.length !== 1) {
    message.error('请选择一条数据进行拆单!');
    return;
  }
  currentRow.value = checkboxRecords[0];
  splitNumberInput.value = 1;
  splitResultList.value = [];
  bindingsMap.value = {};
  splitDrawerVisible.value = true;
}

/**
 * 拆单-执行拆分
 */
function executeSplit() {
  if (!splitNumberInput.value || splitNumberInput.value < 1) {
    message.error('请输入有效的拆分批数!');
    return;
  }
  splitDrawerLoading.value = true;
  getMergeSplitWorkSheet({
    id: currentRow.value.id,
    splitNumber: splitNumberInput.value,
  })
    .then((data: any) => {
      splitResultList.value = (data || []).map((item: any) => ({
        ...item,
        _bound: false,
      }));
    })
    .finally(() => {
      splitDrawerLoading.value = false;
    });
}

/**
 * 拆单-打开绑定抽屉
 */
function openBindDrawer(row: any) {
  currentBindRow.value = row;
  bindForm.value = {
    poOrderCode: undefined,
    soOrderCode: undefined,
    deliveryDate: undefined,
    poOrderNumber: 0,
    soOrderNumber: 0,
    productCode: row.productCode || '',
    productName: row.productName || '',
  };

  bindDrawerLoading.value = true;
  const wsCodes = currentRow.value.workSheetCode;
  listSoOrderByPoOrderCode({ worksheetCodes: wsCodes })
    .then((data: any) => {
      poSoData.value = data || { poDetails: [], soDetails: [] };
      bindDrawerVisible.value = true;
    })
    .finally(() => {
      bindDrawerLoading.value = false;
    });
}

/**
 * 拆单-PO单号选择变化
 */
function onPoSelect(value: any) {
  const po = poSoData.value.poDetails.find(
    (item: any) => item.orderCode === String(value),
  );
  if (po) {
    bindForm.value.poOrderNumber = po.orderNumber;
  }
}

/**
 * 拆单-SO单号选择变化
 */
function onSoSelect(value: any) {
  const so = poSoData.value.soDetails.find(
    (item: any) => item.orderCode === String(value),
  );
  if (so) {
    bindForm.value.soOrderNumber = so.orderNumber;
    bindForm.value.productCode = so.productCode || '';
    bindForm.value.productName = so.productName || '';
  }
}

/**
 * 拆单-确认绑定
 */
function confirmBinding() {
  if (
    !bindForm.value.poOrderCode ||
    !bindForm.value.soOrderCode ||
    !bindForm.value.deliveryDate
  ) {
    message.error('请完善绑定信息：PO单号、SO单号、交期为必填项!');
    return;
  }

  const choseDetail: any = {
    deliveryDate: dayjs(bindForm.value.deliveryDate).format('YYYY-MM-DD'),
    poOrderCode: bindForm.value.poOrderCode,
    poOrderNumber: bindForm.value.poOrderNumber,
    processName: '',
    processType: currentBindRow.value.processType,
    productCode: bindForm.value.productCode,
    productName: bindForm.value.productName,
    soOrderCode: bindForm.value.soOrderCode,
    soOrderNumber: bindForm.value.soOrderNumber,
    worksheetCode: currentBindRow.value.workSheetCode,
  };

  const key = currentBindRow.value.workSheetCode;
  if (!bindingsMap.value[key]) {
    bindingsMap.value[key] = [];
  }
  // 检查是否已绑定相同PO+SO
  const exist = bindingsMap.value[key].find(
    (item: any) =>
      item.poOrderCode === choseDetail.poOrderCode &&
      item.soOrderCode === choseDetail.soOrderCode,
  );
  if (exist) {
    message.warning('该PO+SO组合已绑定，请勿重复绑定!');
    return;
  }
  bindingsMap.value[key].push(choseDetail);

  // 标记该行为已绑定
  const targetRow = splitResultList.value.find(
    (item: any) => item.workSheetCode === key,
  );
  if (targetRow) {
    targetRow._bound = true;
    targetRow._bindCount = bindingsMap.value[key].length;
  }

  bindDrawerVisible.value = false;
  message.success('绑定成功!');
}

/**
 * 拆单-保存拆分重组结果
 */
function saveSplitResult() {
  // 检查所有行是否都已绑定
  const unbound = splitResultList.value.filter((item: any) => !item._bound);
  if (unbound.length > 0) {
    message.error(`请为所有拆分结果绑定SOPO单号! 当前未绑定: ${unbound.map((r: any) => r.workSheetCode).join(', ')}`);
    return;
  }

  const params = splitResultList.value.map((row: any) => ({
    choseDetails: bindingsMap.value[row.workSheetCode] || [],
    worksheet: row,
  }));

  splitSaveLoading.value = true;
  saveMergeWorkSheet(params)
    .then(() => {
      message.success('保存成功!');
      splitDrawerVisible.value = false;
      gridApi.reload();
    })
    .finally(() => {
      splitSaveLoading.value = false;
    });
}

/**
 * 拆单-获取当前行的绑定信息文本
 */
function getBindStatusText(row: any) {
  const list = bindingsMap.value[row.workSheetCode] || [];
  if (list.length === 0) return '未绑定';
  return `已绑定(${list.length})`;
}
// endregion

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
  <Card class="!mb-5">
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
      <!--工单单别 -->
      <FormItem :label="$t('dispatchHomework.processType')">
        <Select
          v-model:value="queryParams.processType"
          :placeholder="$t('dispatchHomework.pleaseSelectProcessType')"
          allow-clear
          class="w-40"
        >
          <Select.Option
            v-for="item in processTypeList"
            :key="item.processType"
            :value="item.processType"
          >
            {{ item.processTypeName }}
          </Select.Option>
        </Select>
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

  <!-- region PO订单回显 -->
  <Card v-show="poOrderData.length > 0" class="mb-5" title="PO订单回显">
    <Spin :spinning="poOrderLoading">
      <PoOrderGrid />
    </Spin>
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

  <!-- region 拆单重组-顶部抽屉 -->
  <Drawer
    v-model:open="splitDrawerVisible"
    placement="top"
    :height="540"
    title="拆单重组"
    @close="splitResultList = []"
  >
    <Form layout="inline" class="mb-4">
      <FormItem label="拆分批数">
        <InputNumber
          v-model:value="splitNumberInput"
          :min="1"
          :max="99"
          placeholder="请输入拆分批数"
        />
      </FormItem>
      <FormItem>
        <Button
          type="primary"
          :loading="splitDrawerLoading"
          @click="executeSplit"
        >
          拆分
        </Button>
      </FormItem>
    </Form>

    <Spin :spinning="splitDrawerLoading">
      <Table
        v-if="splitResultList.length > 0"
        :data-source="splitResultList"
        :columns="splitColumns"
        :pagination="false"
        :scroll="{ x: 1100 }"
        row-key="workSheetCode"
        size="small"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'bindStatus'">
            <span :style="{ color: record._bound ? '#52c41a' : '#ff4d4f' }">
              {{ getBindStatusText(record) }}
            </span>
          </template>
          <template v-if="column.key === 'action'">
            <Button
              type="link"
              size="small"
              title="绑定SOPO单号"
              :icon="h(Icon, { icon: 'mdi:link-variant' })"
              @click="openBindDrawer(record)"
            />
          </template>
        </template>
      </Table>
    </Spin>

    <div
      v-if="splitResultList.length > 0"
      class="mt-4 flex justify-end"
    >
      <Button
        type="primary"
        :loading="splitSaveLoading"
        @click="saveSplitResult"
      >
        保存
      </Button>
    </div>
  </Drawer>
  <!-- endregion -->

  <!-- region 绑定SOPO单号-右侧抽屉 -->
  <Drawer
    v-model:open="bindDrawerVisible"
    placement="right"
    title="绑定SOPO单号"
    :width="560"
    @close="poSoData = { poDetails: [], soDetails: [] }"
  >
    <Spin :spinning="bindDrawerLoading">
      <div class="mb-4">
        <Descriptions
          :column="2"
          size="small"
          bordered
        >
          <DescriptionsItem label="工单号">
            {{ currentBindRow.workSheetCode }}
          </DescriptionsItem>
          <DescriptionsItem label="产品编号">
            {{ currentBindRow.productCode }}
          </DescriptionsItem>
          <DescriptionsItem label="产品名称" :span="2">
            {{ currentBindRow.productName }}
          </DescriptionsItem>
          <DescriptionsItem label="计划号">
            {{ currentBindRow.planCode }}
          </DescriptionsItem>
          <DescriptionsItem label="工单计划数">
            {{ currentBindRow.workSheetPlanNumber }}
          </DescriptionsItem>
        </Descriptions>
      </div>

      <Divider />

      <Form
        :model="bindForm"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
        label-align="right"
      >
        <FormItem label="PO单号" required>
          <Select
            v-model:value="bindForm.poOrderCode"
            placeholder="请选择PO单号"
            show-search
            option-filter-prop="label"
            @change="onPoSelect"
          >
            <Select.Option
              v-for="item in poSoData.poDetails"
              :key="item.detailId"
              :value="item.orderCode"
              :label="item.orderCode"
            >
              {{ item.orderCode }} - {{ item.productName }}
            </Select.Option>
          </Select>
        </FormItem>
        <FormItem label="SO单号" required>
          <Select
            v-model:value="bindForm.soOrderCode"
            placeholder="请选择SO单号"
            show-search
            option-filter-prop="label"
            @change="onSoSelect"
          >
            <Select.Option
              v-for="item in poSoData.soDetails"
              :key="item.detailId"
              :value="item.orderCode"
              :label="item.orderCode"
            >
              {{ item.orderCode }}({{ item.seq }}) - {{ item.productName }}
            </Select.Option>
          </Select>
        </FormItem>
        <FormItem label="产品编号">
          <Input v-model:value="bindForm.productCode" disabled />
        </FormItem>
        <FormItem label="产品名称">
          <Input v-model:value="bindForm.productName" disabled />
        </FormItem>
        <FormItem label="PO数量">
          <InputNumber
            v-model:value="bindForm.poOrderNumber"
            disabled
            class="w-full"
          />
        </FormItem>
        <FormItem label="SO数量">
          <InputNumber
            v-model:value="bindForm.soOrderNumber"
            disabled
            class="w-full"
          />
        </FormItem>
        <FormItem label="交期" required>
          <DatePicker
            v-model:value="bindForm.deliveryDate"
            placeholder="请选择交期"
            class="w-full"
          />
        </FormItem>
      </Form>

      <div class="flex justify-end mt-4">
        <Button type="primary" @click="confirmBinding"> 确认绑定 </Button>
      </div>
    </Spin>
  </Drawer>
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
