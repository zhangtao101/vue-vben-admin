<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { Col, Row, Spin } from 'ant-design-vue';

import { listHCByCodeScan } from '#/api';
import useWebSocket from '#/util/websocket-util';

/**
 * 定义组件的 props，用于接收父组件传递的数据
 */
const props = defineProps({
  // 工步id，用于标识具体的工步，默认为 0
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID，用于标识具体的工序，默认为 0
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号，用于标识具体的工单，默认为空字符串
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号，用于标识具体的设备，默认为空字符串
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心，用于标识具体的工作中心，默认为空字符串
  workstationCode: {
    type: String,
    default: '',
  },
  // 展示类型，用于控制页面展示的内容，默认为 0
  showTypeNumber: {
    type: Number,
    default: 0,
  },
});

/**
 * 获取标签的 class，用于统一标签的样式
 * @returns {string} 标签的 class 字符串
 */
function getLabelClass() {
  return 'mr-4 inline-block w-48 p-2 text-right';
}

/**
 * 获取值的 class，用于统一值显示区域的样式
 * @returns {string} 值显示区域的 class 字符串
 */
function getValueClass() {
  return 'inline-block border p-2 text-center w-72';
}

/**
 * 存储从接口获取的详情数据，初始化为空数组
 */
const details = ref<any>([]);
/**
 * 控制加载状态的响应式变量，为 true 时显示加载动画
 */
const spinning = ref<any>(false);

/**
 * 查询资源验证状态
 * 该函数会发起异步请求获取数据，并更新详情数据和加载状态
 */
function queryData() {
  // 开始加载，显示加载动画
  spinning.value = true;
  // 调用 API 接口获取数据
  listHCByCodeScan({
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
  })
    .then((data) => {
      // 将获取到的数据赋值给详情数据
      details.value = data;
    })
    .finally(() => {
      // 无论请求成功或失败，都结束加载，隐藏加载动画
      spinning.value = false;
    });
}

// region websocket
/**
 * 初始化 WebSocket 连接，并传入消息处理函数和配置参数
 */
useWebSocket(readMessage, {
  workstationCode: props.workstationCode,
  equipCode: props.equipCode,
  worksheetCode: props.worksheetCode,
  bindingId: props.bindingId,
  functionId: props.functionId,
  webSocketType: 5,
});

/**
 * 处理 WebSocket 接收到的消息
 * 当接收到消息时，调用 queryData 函数重新查询资源验证状态
 */
function readMessage() {
  queryData();
}
// endregion
/**
 * 组件挂载后执行的钩子函数，会在组件挂载完成后调用 queryData 函数获取数据
 */
onMounted(() => {
  queryData();
});
</script>

<template>
  <!-- 根据 spinning 的值显示加载动画 -->
  <Spin :spinning="spinning">
    <!-- 定义一个行布局 -->
    <Row>
      <!-- 定义一个列，占 24 格，顶部有 10px 的内边距 -->
      <Col :span="24" class="pt-10">
        <!-- region 工单编号 -->
        <!-- 显示工单编号的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 显示工单编号标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.workOrderNumber') }}：
          </span>
          <!-- 显示工单编号的值，无值时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.worksheetCode || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- region 产品名称 -->
        <!-- 显示产品名称的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 显示产品名称标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.productName') }}：
          </span>
          <!-- 显示产品名称的值，无值时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.productName || $t('productionOperation.none') }}
          </span>
        </div>
      </Col>
      <!-- 定义一个列，占 24 格，顶部有 10px 的内边距 -->
      <Col :span="24" class="pt-10">
        <!-- region 单件SN码 -->
        <!-- 显示单件 SN 码的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 显示单件 SN 码标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.singlePieceSNCode') }}：
          </span>
          <!-- 显示单件 SN 码的值，无值时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.snCode || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- region 测试结果 -->
        <!-- 显示测试结果的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 显示测试结果标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.testResult') }}：
          </span>
          <!-- 显示测试结果的值，无值时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.defectFlagName || $t('productionOperation.none') }}
          </span>
        </div>
      </Col>
      <!-- 定义一个列，占 24 格，顶部有 10px 的内边距 -->
      <Col :span="24" class="pt-10">
        <!-- region 已生产数量 -->
        <!-- 显示已生产数量的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 显示已生产数量标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.producedQuantity') }}：
          </span>
          <!-- 显示已生产数量的值，无值时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.totalNumber || $t('productionOperation.none') }}
          </span>
        </div>
      </Col>
    </Row>
  </Spin>
</template>

<style scoped>
/* 作用域样式，仅对当前组件生效 */
</style>
