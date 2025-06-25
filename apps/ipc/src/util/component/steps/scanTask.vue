<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button, Col, Input, Row, Spin } from 'ant-design-vue';

import { handleMaulSncode, listHCByCodeScan } from '#/api';
import ScanTheCode from '#/util/component/scanTheCode.vue';
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
  return 'mr-4 inline-block w-36 p-2 text-right';
}

/**
 * 获取值的 class，用于统一值显示区域的样式
 * @returns {string} 值显示区域的 class 字符串
 */
function getValueClass() {
  return 'inline-block border p-2 text-center w-72';
}

/**
 * 存储从接口获取的详情数据，初始化为空对象
 */
const details = ref<any>({});
/**
 * 控制加载状态的响应式变量，为 true 时显示加载动画
 */
const spinning = ref<any>(false);
/**
 * 存储输入的 SN 码，初始值为空字符串
 */
const snCode = ref<any>('');

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
    snCode: snCode.value,
  })
    .then((data) => {
      // 将获取到的数据合并到详情数据中
      details.value = {
        ...details.value,
        ...data,
      };
      snCode.value = data.snCode;
    })
    .finally(() => {
      // 无论请求成功或失败，都结束加载，隐藏加载动画
      spinning.value = false;
    });
}

/**
 * 查询 SN 码信息
 * 该函数会发起异步请求处理手动输入的 SN 码，并更新详情数据和加载状态
 */
function queryCode() {
  // 调用 API 处理手动输入的 SN 码
  handleMaulSncode({
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
    snCode: snCode.value,
  })
    .then((data) => {
      // 定义需要更新的字段数组
      const keys = [
        'checkResult',
        'checkResultName',
        'snCode',
        'worksheetCode',
        'productCode',
        'productName',
        'error',
      ];
      // 遍历字段数组，将 API 返回的数据更新到详情数据中
      keys.forEach((key) => {
        details.value[key] = data[key];
      });
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
onBeforeUnmount(() => {
  websocketClose();
});
</script>

<template>
  <!-- 根据 spinning 的值显示加载动画 -->
  <Spin :spinning="spinning">
    <!-- 定义一个行布局 -->
    <Row>
      <!-- 定义一个列，占 24 格，顶部有 10px 的内边距 -->
      <Col :span="24" class="pt-10">
        <!-- region 单件SN码 -->
        <!-- 显示单件 SN 码输入框和扫码组件的容器 -->
        <div class="mb-4 mr-8 flex items-center">
          <!-- 显示单件 SN 码标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.singlePieceSNCode') }}：
          </span>
          <!-- 显示单件 SN 码输入框和扫码组件的区域 -->
          <span :class="getValueClass()" class="border-0 text-left">
            <!-- SN 码输入框，支持回车键查询，根据展示类型决定是否禁用 -->
            <Input
              v-model:value="snCode"
              class="w-[80%]"
              :disabled="showTypeNumber === 37"
              @keydown.enter="queryCode()"
            />
            <!-- 扫码组件，仅在展示类型为 35 时显示，扫码成功后将结果赋值给 SN 码并查询 -->
            <ScanTheCode
              v-if="showTypeNumber === 35"
              @scan-the-code="
                (val) => {
                  snCode = val;
                  queryCode();
                }
              "
            />
          </span>
          <!-- 根据校验结果显示不同的图标按钮 -->
          <Button
            type="link"
            :danger="details.checkResult === -1"
            v-if="details.checkResult"
          >
            <IconifyIcon
              :icon="
                details.checkResult === -1
                  ? 'mdi:error-outline'
                  : 'mdi:success-circle-outline'
              "
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </div>
        <!-- endregion -->
      </Col>
      <!-- 定义一个列，占 24 格 -->
      <Col :span="24">
        <!-- region 校验结果 -->
        <!-- 显示校验结果的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 显示校验结果标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.verificationResult') }}：
          </span>
          <!-- 显示校验结果的值，无结果时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.error || $t('productionOperation.none') }}
          </span>
          <!-- 当校验结果不为 '通过' 时显示锁定图标按钮 -->
          <Button type="link" v-if="details.error !== '通过'" danger>
            <IconifyIcon
              icon="mdi:lock-outline"
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </div>
        <!-- endregion -->
      </Col>
      <!-- 定义一个列，占 24 格 -->
      <Col :span="24">
        <!-- region 工单编号 -->
        <!-- 显示工单编号的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 显示工单编号标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.workOrderNumber') }}：
          </span>
          <!-- 显示工单编号的值，无结果时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.worksheetCode || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion -->
        <!-- region 产品名称 -->
        <!-- 显示产品名称的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 显示产品名称标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.productName') }}：
          </span>
          <!-- 显示产品名称的值，无结果时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.productName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion -->
        <!-- region 测试结果 -->
        <!-- 显示测试结果的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 显示测试结果标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.testResult') }}：
          </span>
          <!-- 显示测试结果的值，无结果时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.defectFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion -->
      </Col>
    </Row>
  </Spin>
</template>

<style scoped></style>
