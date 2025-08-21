<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { Col, Row, Spin } from 'ant-design-vue';

import { listHCByCodeScan } from '#/api';
import useWebSocket from '#/util/websocket-util';

/**
 * 定义组件的 props
 */
const props = defineProps({
  // 工步id
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心
  workstationCode: {
    type: String,
    default: '',
  },
  // 展示类型
  showTypeNumber: {
    type: Number,
    default: 0,
  },
});

/**
 * 获取标签的 class
 * @returns 标签的 class 字符串
 */
function getLabelClass() {
  return 'mr-4 inline-block w-48 p-2 text-right';
}

/**
 * 获取值的 class
 * @returns 值的 class 字符串
 */
function getValueClass(isResult: boolean = false, errorMessage?: number) {
  let css = '';
  if (isResult) {
    css =
      errorMessage === 1 ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
  }
  return `inline-block border p-2 text-center w-72 ${css}`;
}

/**
 * 详情数据，用于存储查询结果
 */
const details = ref<any>([{}, {}]);
const totalNumber = ref<any>(0);

/**
 * 加载状态，用于控制加载动画的显示
 */
const spinning = ref(false);

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData() {
  // 定义请求参数
  const params: any = {
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
  };
  // 调用 API 查询数据
  listHCByCodeScan(params).then(({ stationList, totalNumber: n }) => {
    details.value = stationList || [{}, {}];
    totalNumber.value = n;
  });
}

// endregion

// region websocket
// 初始化 WebSocket 连接，并传入消息处理函数和配置参数
const { close: websocketClose } = useWebSocket(readMessage, {
  workstationCode: props.workstationCode,
  equipCode: props.equipCode,
  worksheetCode: props.worksheetCode,
  bindingId: props.bindingId,
  functionId: props.functionId,
  webSocketType: 5,
});

/**
 * 处理 WebSocket 接收到的消息
 */
function readMessage() {
  queryData();
}
// endregion

// 组件挂载后执行的钩子函数
onMounted(() => {
  queryData();
});

onBeforeUnmount(() => {
  websocketClose();
});
</script>

<template>
  <Spin :spinning="spinning">
    <Row v-if="[39].includes(showTypeNumber)">
      <Col span="24">
        <!-- 显示工单编号的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 工单编号 -->
          <span :class="getLabelClass()" class="w-48">
            {{ $t('productionOperation.workOrderNumberInExecution') }}：
          </span>
          <!-- 显示工单编号的值，无结果时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.proceWorksheetCode || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- 显示产品编号的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 产品编号 -->
          <span :class="getLabelClass()" class="w-48">
            {{ $t('productionOperation.productNumberInExecution') }}：
          </span>
          <!-- 显示产品编号的值，无结果时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.procePorductCode || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- 显示产品名称的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 产品名称 -->
          <span :class="getLabelClass()" class="w-48">
            {{ $t('productionOperation.productNameInExecution') }}：
          </span>
          <!-- 显示产品名称的值，无结果时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.proceProdutName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- 显示产品名称的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 产品名称 -->
          <span :class="getLabelClass()" class="w-48">
            {{ $t('productionOperation.productModelInExecution') }}：
          </span>
          <!-- 显示产品名称的值，无结果时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.proceProductModel || $t('productionOperation.none') }}
          </span>
        </div>
      </Col>
    </Row>
    <Row>
      <Col
        :span="12"
        class="pt-10"
        v-for="item of details"
        :key="item.produceWorkshopCode"
      >
        <!-- region 工位编号 -->
        <!-- 根据展示类型显示工位编号输入框和扫码组件 -->
        <div
          class="mb-4 mr-8 flex"
          v-if="[32, 33, 39].includes(showTypeNumber)"
        >
          <!-- 显示工位编号标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.workstationNumber') }}：
          </span>
          <span :class="getValueClass()">
            {{ item.produceWorkshopCode }}
          </span>
        </div>
        <!-- endregion -->
        <!-- region 单件SN码 -->
        <!-- 显示单件 SN 码输入框和扫码组件 -->
        <div class="mb-4 mr-8 flex items-center">
          <!-- 显示单件 SN 码标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.singlePieceSNCode') }}：
          </span>
          <span :class="getValueClass()">
            {{ item.qcCode }}
          </span>
        </div>
        <!-- endregion -->
        <!-- region 校验结果 -->
        <!-- 显示校验结果 -->
        <div class="mb-4 mr-8 flex">
          <!-- 显示校验结果标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.verificationResult') }}：
          </span>
          <!-- 显示校验结果值，无结果时显示默认提示 -->
          <span :class="getValueClass(true, item?.checkResult)">
            {{ item?.error || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion -->
        <!-- region 工单编号 -->
        <!-- 根据展示类型显示工单编号 -->
        <div class="mb-4 mr-8 flex">
          <!-- 显示工单编号标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.workOrderNumber') }}：
          </span>
          <!-- 显示工单编号值，无结果时显示默认提示 -->
          <span :class="getValueClass()">
            {{ item?.partPlanCode || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion -->
        <!-- region 测试结果 -->
        <!-- 根据展示类型显示测试结果 -->
        <div class="mb-4 mr-8 flex">
          <!-- 显示测试结果标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.testResult') }}：
          </span>
          <!-- 显示测试结果值，无结果时显示默认提示 -->
          <span :class="getValueClass(true, item?.checkResult)">
            {{ item?.defectResultName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion -->
        <!-- region 已生产数量 -->
        <!-- 显示已生产数量 -->
        <div class="mb-4 mr-8 flex">
          <!-- 显示已生产数量标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.producedQuantity') }}：
          </span>
          <!-- 显示已生产数量值，无结果时显示默认提示 -->
          <span :class="getValueClass()">
            {{ totalNumber || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion -->
      </Col>
    </Row>
  </Spin>
</template>

<style scoped></style>
