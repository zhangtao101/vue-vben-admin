<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { IconifyIcon, MdiSearch } from '@vben/icons';
import { useAccessStore } from '@vben/stores';

import {
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Popconfirm,
  RangePicker,
  Row,
  Select,
  Space,
  Tooltip,
  Upload,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  downloadTemplateProducePlan,
  producePlanDelete,
  producePlanExport,
  producePlanSearch,
  producePlanUpdate,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50, minWidth: 50 },
    {
      field: 'customerName',
      title: '客户名称',
      minWidth: 100,
      showOverflow: true,
    },
    { field: 'orderDate', title: '订单日期', minWidth: 100 },
    { field: 'deliverDate', title: '交货日期', minWidth: 100 },
    { field: 'productCode', title: '产品编号', minWidth: 150 },
    {
      field: 'productName',
      title: '产品名称',
      minWidth: 200,
      showOverflow: true,
    },
    { field: 'orderNumber', title: '订单数量', minWidth: 100 },
    { field: 'planNumber', title: '计划数量', minWidth: 100 },
    { field: 'produceNotFinishNumber', title: '生产未完成数', minWidth: 125 },
    { field: 'planCode', title: '计划号', minWidth: 100 },
    { field: 'smtFinishNumber', title: 'SMT生产完成数', minWidth: 125 },
    { field: 'chajFinishNumber', title: '插件生产完成数', minWidth: 125 },
    { field: 'buhFinishNumber', title: '补焊生产完成数', minWidth: 125 },
    { field: 'zuzFinishNumber', title: '组装生产完成', minWidth: 125 },
    {
      field: 'sendMaterialDate',
      title: '发料日期',
      minWidth: 100,
      slots: { default: 'sendMaterialDateSlot' },
    },
    { field: 'planType', title: '计划类别', minWidth: 100 },
    { field: 'customerDemandInfo', title: '客户需求信息', minWidth: 125 },
    {
      field: 'stockMaterial',
      title: '库存物料',
      minWidth: 100,
      slots: { default: 'stockMaterialSlot' },
    },
    {
      field: 'materialStatus',
      title: '物料状态',
      minWidth: 100,
      slots: { default: 'materialStatusSlot' },
    },
    {
      field: 'materialRecoverDeliverDate',
      title: '物料回复交期',
      minWidth: 125,
    },
    {
      field: 'materialChangeDeliverDate',
      title: '物料变更交期',
      minWidth: 125,
    },
    { field: 'contractNumber', title: '合约号码', minWidth: 100 },
    { field: 'finishedStockNumber', title: '成品库存数', minWidth: 125 },
    { field: 'deliverProductsNumber', title: '已出货数', minWidth: 100 },
    {
      field: 'deliverProductsNotFinishNumber',
      title: '出货未完数',
      minWidth: 125,
    },
    {
      field: 'finishDeliverDateResponse',
      title: '成品交期回复',
      minWidth: 125,
      slots: { default: 'finishDeliverDateResponseSlot' },
    },
    {
      field: 'finishDeliverDateChange',
      title: '成品交期变更',
      minWidth: 125,
      slots: { default: 'finishDeliverDateChangeSlot' },
    },
    {
      field: 'planRemark',
      title: '计划备注',
      minWidth: 100,
      showOverflow: true,
    },
    { field: 'materialArriveNotTimely', title: '未及时到物料', minWidth: 120 },
    {
      field: 'isPersonFinish',
      title: '是否人工结案',
      minWidth: 120,
      slots: { default: 'isPersonFinishSlot' },
    },
    {
      field: 'action',
      title: '操作',
      fixed: 'right',
      minWidth: 150,
      slots: { default: 'action' },
    },
  ],
  height: 500,
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
    },
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// endregion

// region 查询数据
// 查询参数
const queryParams = ref<any>({
  customerName: '',
  orderDate: [],
  deliveryDate: [],
  productCode: '',
  productName: '',
  planCode: '',
  orderDateStart: '',
  orderDateEnd: '',
  delverDateStart: '',
  delverDateEnd: '',
});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams.value };
    if (params.orderDate && params.orderDate.length === 2) {
      params.orderDateStart = params.orderDate[0].format('YYYY-MM-DD');
      params.orderDateEnd = params.orderDate[1].format('YYYY-MM-DD');
      params.orderDate = undefined;
    }
    if (params.deliveryDate && params.deliveryDate.length === 2) {
      params.delverDateStart = params.deliveryDate[0].format('YYYY-MM-DD');
      params.delverDateEnd = params.deliveryDate[1].format('YYYY-MM-DD');
      params.deliveryDate = undefined;
    }
    producePlanSearch({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ total, results }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total,
          items: results,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 导出文件
 */
function exportFile() {
  const params: any = { ...queryParams.value };
  if (params.orderDate && params.orderDate.length === 2) {
    params.orderDateStart = params.orderDate[0].format('YYYY-MM-DD');
    params.orderDateEnd = params.orderDate[1].format('YYYY-MM-DD');
    params.orderDate = undefined;
  }
  if (params.deliveryDate && params.deliveryDate.length === 2) {
    params.delverDateStart = params.deliveryDate[0].format('YYYY-MM-DD');
    params.delverDateEnd = params.deliveryDate[1].format('YYYY-MM-DD');
    params.deliveryDate = undefined;
  }
  producePlanExport({
    ...params, // 展开 queryParams.value 对象，包含所有查询参数。
  }).then((data) => {
    window.open(data, '_blank');
  });
}
/**
 * 下载模板
 */
function downloadTemplate() {
  downloadTemplateProducePlan().then((data) => {
    window.open(data, '_blank');
  });
}

// endregion

// region 文件上传
const accessStore = useAccessStore();
// 文件上传头信息
const headers = ref<any>({
  Authorization: accessStore.accessToken,
});
// 上传路径
const action = ref<string>(
  `/ht/${import.meta.env.VITE_GLOB_MES_MAIN}/plan/producePlan/saveByExcel`,
);
// 文件列表
const fileList = ref<any>([]);

/**
 * 处理文件上传状态变化的函数。
 * @param info - 包含文件上传信息的对象。
 */
function handleChange(info: any) {
  // 检查文件是否上传成功
  if (info.file.status === 'done') {
    // 重新查询数据，更新列表
    gridApi.reload();
    // 显示成功消息
    message.success('文件上传成功!');
  } else if (info.file.status === 'error') {
    // 获取错误信息，如果存在则显示，否则显示通用错误消息
    const errorMessage = info.file.response?.message || '文件上传失败';
    // 显示错误消息
    message.error(errorMessage);
  }
}

// endregion

// region 编辑
// 编辑数据
const editItem = ref<any>({});
const showEditDrawer = ref(false);
// 表单对象
const editForm = ref<any>();
// 表单验证规则
const rules = ref<any>({
  // 表单验证规则可根据需要添加
  sendMaterialDate: [
    { required: true, message: '请选择发料日期', trigger: 'change' },
  ],
  produceNotFinishNumber: [
    { required: true, message: '请输入生产未完成数', trigger: 'blur' },
    { type: 'number', message: '生产未完成数必须为数字值', trigger: 'blur' },
  ],
});
/**
 * 物料状态
 */
const wordTypes = [
  { wordName: '正常' },
  { wordName: '延迟' },
  { wordName: '短缺' },
  { wordName: '其他' },
];
/**
 * 编辑
 * @param row 编辑行
 */
function showEdit(row: any) {
  editItem.value = { ...row };
  showEditDrawer.value = true;
}

function close() {
  showEditDrawer.value = false;
  editItem.value = {};
}

/**
 * 提交
 */
function submit() {
  producePlanUpdate(editItem.value).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
    close();
  });
}
// endregion

// region 删除
/**
 * 删除
 * @param row 删除行
 */
function delItem(row: any) {
  producePlanDelete(row.id).then(() => {
    gridApi.reload();
  });
}
// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 初始化

onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 客户名称 -->
        <FormItem
          :label="$t('planFinish.customerName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.customerName" />
        </FormItem>
        <!-- 订单日期 -->
        <FormItem
          :label="$t('planFinish.orderDate')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.orderDate" />
        </FormItem>
        <!-- 交货日期 -->
        <FormItem
          :label="$t('planFinish.deliveryDate')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.deliveryDate" />
        </FormItem>
        <!-- 产品编号 -->
        <FormItem
          :label="$t('planFinish.productNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productCode" />
        </FormItem>

        <!-- 产品名称 -->
        <FormItem
          :label="$t('planFinish.productName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productName" />
        </FormItem>

        <!-- 计划号 -->
        <FormItem
          :label="$t('planFinish.planNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.planCode" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="() => gridApi.reload()"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 表格主体 -->
    <Card>
      <Grid>
        <template #toolbar-actions>
          <Space>
            <!-- 导出 -->
            <Button type="primary" @click="exportFile">
              {{ $t('common.export') }}
            </Button>
            <!-- 模板下载 -->
            <Button type="primary" @click="downloadTemplate">
              {{ $t('common.templateDownload') }}
            </Button>
            <!-- 导入按钮 -->
            <Upload
              v-model:file-list="fileList"
              :action="action"
              :headers="headers"
              :show-upload-list="false"
              name="file"
              @change="handleChange"
            >
              <Button type="primary">
                {{ $t('common.import') }}
              </Button>
            </Upload>
          </Space>
        </template>
        <!-- 发料日期 -->
        <template #sendMaterialDateSlot="{ row }">
          <span
            :class="{
              'text-red-500': row.receiveMaterialStatus === 0,
              'text-green-500': row.receiveMaterialStatus === 1,
              'text-gray-500': ![0, 1].includes(row.receiveMaterialStatus),
            }"
          >
            {{ row.sendMaterialDate }}
          </span>
        </template>
        <!-- 库存物料 -->
        <template #stockMaterialSlot="{ row }">
          <span>{{ row.stockMaterial ? '欠料' : '足料' }}</span>
        </template>
        <!-- 物料状态 -->
        <template #materialStatusSlot="{ row }">
          <span>{{ row.materialStatus ? '欠料' : '足料' }}</span>
        </template>
        <!-- 成品交期回复 -->
        <template #finishDeliverDateResponseSlot="{ row }">
          <span
            :class="{
              'text-blue-500': row.responseColor === 1,
            }"
          >
            {{ row.finishDeliverDateResponse }}
          </span>
        </template>
        <!-- 成品交期变更 -->
        <template #finishDeliverDateChangeSlot="{ row }">
          <span
            :class="{
              'text-blue-500': row.changeColor === 1,
            }"
          >
            {{ row.finishDeliverDateChange }}
          </span>
        </template>
        <!-- 是否人工结案 -->
        <template #isPersonFinishSlot="{ row }">
          <span>{{ row.isPersonFinish ? '是' : '否' }}</span>
        </template>
        <!-- 操作 -->
        <template #action="{ row }">
          <!-- 编辑 -->
          <Tooltip>
            <template #title>{{ $t('common.edit') }}</template>
            <Button type="link" @click="showEdit(row)">
              <IconifyIcon
                icon="mdi:edit-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 删除 -->
          <Tooltip>
            <template #title>{{ $t('common.delete') }}</template>
            <Popconfirm
              :cancel-text="$t('common.cancel')"
              :ok-text="$t('common.confirm')"
              :title="$t('ui.widgets.deletionConfirmation')"
              @confirm="delItem(row)"
            >
              <Button danger type="link">
                <IconifyIcon
                  icon="mdi-light:delete"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Popconfirm>
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <Drawer
      v-model:open="showEditDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="800"
      class="production-data-drawer"
      placement="right"
      root-class-name="production-root-class"
      :title="$t('common.edit')"
      @close="close"
    >
      <Form
        ref="editForm"
        :model="editItem"
        :rules="rules"
        :label-col="{ span: 10 }"
        :wrapper-col="{ span: 14 }"
      >
        <Row :gutter="20">
          <Col :span="11">
            <!-- 发料日期 -->
            <FormItem
              :label="$t('planFinish.materialDispatchDate')"
              prop="sendMaterialDate"
            >
              <DatePicker
                v-model:value="editItem.sendMaterialDate"
                type="date"
                style="width: 100%"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
              />
            </FormItem>
          </Col>
          <Col :span="11">
            <!-- 客户名称 -->
            <FormItem
              :label="$t('planFinish.customerName')"
              prop="customerName"
            >
              <Input v-model:value="editItem.customerName" readonly />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="20">
          <Col :span="11">
            <!-- 计划类别 -->
            <FormItem :label="$t('planFinish.planCategory')" prop="planType">
              <Input v-model:value="editItem.planType" readonly />
            </FormItem>
          </Col>
          <Col :span="11">
            <!-- 订单日期 -->
            <FormItem :label="$t('planFinish.orderDate')" prop="orderDate">
              <DatePicker
                v-model:value="editItem.orderDate"
                type="date"
                style="width: 100%"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                readonly
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="20">
          <Col :span="11">
            <!-- 交货日期 -->
            <FormItem :label="$t('planFinish.deliveryDate')" prop="deliverDate">
              <DatePicker
                v-model:value="editItem.deliverDate"
                type="date"
                style="width: 100%"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                readonly
              />
            </FormItem>
          </Col>
          <Col :span="11">
            <!-- 产品编号 -->
            <FormItem
              :label="$t('planFinish.productNumber')"
              prop="productCode"
            >
              <Input v-model:value="editItem.productCode" readonly />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="20">
          <Col :span="11">
            <!-- 产品名称 -->
            <FormItem :label="$t('planFinish.productName')" prop="productName">
              <Input v-model:value="editItem.productName" readonly />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="20">
          <Col :span="11">
            <!-- 订单数量 -->
            <FormItem
              :label="$t('planFinish.orderQuantity')"
              prop="orderNumber"
            >
              <InputNumber v-model:value="editItem.orderNumber" readonly />
            </FormItem>
          </Col>
          <Col :span="11">
            <!-- 计划数量 -->
            <FormItem
              :label="$t('planFinish.plannedQuantity')"
              prop="planNumber"
            >
              <InputNumber v-model:value="editItem.planNumber" readonly />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="20">
          <Col :span="11">
            <!-- SMT生产完成数 -->
            <FormItem
              :label="$t('planFinish.theNumberOfCompletedSMTProduction')"
              prop="smtFinishNumber"
            >
              <InputNumber v-model:value="editItem.smtFinishNumber" readonly />
            </FormItem>
          </Col>
          <Col :span="11">
            <!-- 插件生产完成数 -->
            <FormItem
              :label="$t('planFinish.theNumberOfCompletedPlugInProduction')"
              prop="chajFinishNumber"
            >
              <InputNumber v-model:value="editItem.chajFinishNumber" readonly />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="20">
          <Col :span="11">
            <!-- 补焊生产完成数 -->
            <FormItem
              :label="
                $t('planFinish.theNumberOfCompletedRepairWeldingProduction')
              "
              prop="buhFinishNumber"
            >
              <InputNumber v-model:value="editItem.buhFinishNumber" readonly />
            </FormItem>
          </Col>
          <Col :span="11">
            <!-- 组装生产完成数 -->
            <FormItem
              :label="$t('planFinish.completionNumberOfAssemblyAndProduction')"
              prop="zuzFinishNumber"
            >
              <InputNumber v-model:value="editItem.zuzFinishNumber" readonly />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="20">
          <Col :span="11">
            <!-- 生产未完成数 -->
            <FormItem
              :label="$t('planFinish.unfinishedProductionFigures')"
              prop="produceNotFinishNumber"
            >
              <InputNumber v-model:value="editItem.produceNotFinishNumber" />
            </FormItem>
          </Col>
          <Col :span="11">
            <!-- 计划号 -->
            <FormItem :label="$t('planFinish.planNumber')" prop="planCode">
              <Input v-model:value="editItem.planCode" readonly />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="20">
          <Col :span="11">
            <!-- 客户需求信息 -->
            <FormItem
              :label="$t('planFinish.customerDemandInformation')"
              prop="customerDemandInfo"
            >
              <Input
                v-model:value="editItem.customerDemandInfo"
                :maxlength="50"
              />
            </FormItem>
          </Col>
          <Col :span="11">
            <!-- 库存物料 -->
            <FormItem
              :label="$t('planFinish.inventoryMaterials')"
              prop="stockMaterial"
            >
              <span v-if="editItem.stockMaterial === true">足料</span>
              <span v-else>欠料</span>
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="20">
          <Col :span="11">
            <!-- 所缺物料 -->
            <FormItem
              :label="$t('planFinish.theMissingMaterials')"
              prop="lackMaterial"
            >
              <Input
                v-model:value="editItem.lackMaterial"
                readonly
                :maxlength="200"
              />
            </FormItem>
          </Col>
          <Col :span="11">
            <!-- 物料状态 -->
            <FormItem
              :label="$t('planFinish.materialStatus')"
              prop="materialStatus"
            >
              <Select
                v-model:value="editItem.materialStatus"
                placeholder="请选择"
                clearable
                style="width: 100%"
              >
                <Option
                  v-for="item in wordTypes"
                  :key="item.wordName"
                  :label="item.wordName"
                  :value="item.wordName"
                />
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="20">
          <Col :span="11">
            <!-- 物料回复交期 -->
            <FormItem
              :label="$t('planFinish.theDeliveryDateForMaterialReturn')"
              prop="materialRecoverDeliverDate"
            >
              <Input
                v-model:value="editItem.materialRecoverDeliverDate"
                :maxlength="20"
              />
            </FormItem>
          </Col>
          <Col :span="11">
            <!-- 物料变更交期 -->
            <FormItem
              :label="$t('planFinish.changeTheDeliveryDateOfTheMaterials')"
              prop="materialChangeDeliverDate"
            >
              <Input
                v-model:value="editItem.materialChangeDeliverDate"
                :maxlength="20"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="20">
          <Col :span="11">
            <!-- 合约号码 -->
            <FormItem
              :label="$t('planFinish.contractNumber')"
              prop="contractNumber"
            >
              <Input v-model:value="editItem.contractNumber" readonly />
            </FormItem>
          </Col>
          <Col :span="11">
            <!-- 成品库存数 -->
            <FormItem
              :label="$t('planFinish.inventoryOfFinishedProducts')"
              prop="finishedStockNumber"
            >
              <InputNumber v-model:value="editItem.finishedStockNumber" />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="20">
          <Col :span="11">
            <!-- 已出货数 -->
            <FormItem
              :label="$t('planFinish.shippedQuantity')"
              prop="deliverProductsNumber"
            >
              <InputNumber v-model:value="editItem.deliverProductsNumber" />
            </FormItem>
          </Col>
          <Col :span="11">
            <!-- 出货未完数 -->
            <FormItem
              :label="$t('planFinish.theShipmentHasNotBeenCompleted')"
              prop="deliverProductsNotFinishNumber"
            >
              <InputNumber
                v-model:value="editItem.deliverProductsNotFinishNumber"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="20">
          <Col :span="11">
            <!-- 成品交期回复 -->
            <FormItem
              :label="$t('planFinish.replyOnTheDeliveryDateOfFinishedProducts')"
              prop="finishDeliverDateResponse"
            >
              <Input
                v-model:value="editItem.finishDeliverDateResponse"
                :maxlength="30"
              />
            </FormItem>
          </Col>
          <Col :span="11">
            <!-- 成品交期变更 -->
            <FormItem
              :label="$t('planFinish.changeInDeliveryTimeOfFinishedProducts')"
              prop="finishDeliverDateChange"
            >
              <Input
                v-model:value="editItem.finishDeliverDateChange"
                :maxlength="30"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="20">
          <Col :span="11">
            <!-- 计划备注 -->
            <FormItem :label="$t('planFinish.planRemarks')" prop="planRemark">
              <Input v-model:value="editItem.planRemark" :maxlength="30" />
            </FormItem>
          </Col>
          <Col :span="11">
            <!-- 未及时到物料 -->
            <FormItem
              :label="$t('planFinish.theMaterialsDidNotArriveInTime')"
              prop="materialArriveNotTimely"
            >
              <Input
                v-model:value="editItem.materialArriveNotTimely"
                :maxlength="30"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="20">
          <Col :span="11">
            <!-- 是否人工结案 -->
            <FormItem
              :label="$t('planFinish.whetherTheCaseIsClosedManually')"
              prop="isPersonFinish"
            >
              <span v-if="editItem.isPersonFinish === true">{{
                $t('planFinish.yes')
              }}</span>
              <span v-else>{{ $t('planFinish.no') }}</span>
            </FormItem>
          </Col>
        </Row>
      </Form>

      <template #footer>
        <Space>
          <Button @click="close">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="primary" @click="submit">
            {{ $t('common.save') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
