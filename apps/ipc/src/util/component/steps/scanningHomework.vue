<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button, Col, Empty, Row, Spin } from 'ant-design-vue';

import { listByCodeScan } from '#/api';
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
  return 'mr-4 inline-block w-32 p-2 text-right';
}

/**
 * 获取值的 class，用于统一值显示区域的样式
 * @returns {string} 值显示区域的 class 字符串
 */
function getValueClass() {
  return 'inline-block w-48 border p-2 text-center';
}

/**
 * 定义不同展示类型对应的显示字段映射
 * 键为展示类型的编号，值为需要显示的字段数组
 */
const showType = ref<any>({
  20: [
    'singlePieceSNCode',
    'workOrderNumber',
    'processingStatus',
    'producedQuantity',
  ],
  21: [
    'singlePieceSNCode',
    'equipmentInterlocking',
    'processingStatus',
    'producedQuantity',
    'appearanceInspection',
  ],
  22: [
    'singlePieceSNCode',
    'workOrderNumber',
    'equipmentInterlocking',
    'processingStatus',
    'producedQuantity',
    'testConclusion',
  ],
  23: [
    'singlePieceSNCode',
    'equipmentInterlocking',
    'processingStatus',
    'producedQuantity',
  ],
  25: [
    'singlePieceSNCode',
    'workOrderNumber',
    'producedQuantity',
    'appearanceInspection',
    'resourceVerification',
    'workOrderBinding',
    'parameterDiscrimination',
    'parameterBinding',
  ],
  26: [
    'singlePieceSNCode',
    'workOrderNumber',
    'producedQuantity',
    'appearanceInspection',
    'resourceVerification',
    'processVerification',
    'parameterDiscrimination',
    'parameterBinding',
  ],
  27: [
    'singlePieceSNCode',
    'workOrderNumber',
    'producedQuantity',
    'resourceVerification',
    'workOrderBinding',
    'parameterDiscrimination',
    'parameterBinding',
  ],
  28: [
    'singlePieceSNCode',
    'workOrderNumber',
    'producedQuantity',
    'resourceVerification',
    'processVerification',
    'parameterDiscrimination',
    'parameterBinding',
    'equipmentInterlockingR',
  ],
});

/**
 * 存储从接口获取的详情数据，初始值为 undefined
 */
const details = ref<any>(undefined);
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
  listByCodeScan({
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
// 初始化 WebSocket 连接，并传入消息处理函数和配置参数
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
 */
function readMessage() {
  // 当接收到消息时，重新加载表格数据
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
    <!-- 当详情数据存在时显示内容 -->
    <Row v-if="details">
      <!-- 根据展示类型设置列的宽度 -->
      <Col :span="showTypeNumber >= 20 && showTypeNumber <= 23 ? 24 : 12">
        <!-- region 单件SN码 -->
        <!-- 根据展示类型决定是否显示单件 SN 码区域 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('singlePieceSNCode')"
        >
          <!-- 显示单件 SN 码标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.singlePieceSNCode') }}：
          </span>
          <!-- 显示单件 SN 码的值，无值时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.snCode || $t('productionOperation.none') }}
          </span>
          <!-- 根据校验结果显示不同的图标 -->
          <Button type="link" :danger="details.checkResult === -1">
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
        <!-- endregion-->
        <!-- region 工单编号 -->
        <!-- 根据展示类型决定是否显示工单编号区域 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('workOrderNumber')"
        >
          <!-- 显示工单编号标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.workOrderNumber') }}：
          </span>
          <!-- 显示工单编号的值，无值时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.worksheetCode || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 设备联锁 -->
        <!-- 根据展示类型决定是否显示设备联锁区域 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('equipmentInterlocking')"
        >
          <!-- 显示设备联锁标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.equipmentInterlocking') }}：
          </span>
          <!-- 显示设备联锁的值，无值时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.error || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 加工状态 -->
        <!-- 根据展示类型决定是否显示加工状态区域 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('processingStatus')"
        >
          <!-- 显示加工状态标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.processingStatus') }}：
          </span>
          <!-- 显示加工状态的值，无值时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.workingStateName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 已生产数量 -->
        <!-- 根据展示类型决定是否显示已生产数量区域 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('producedQuantity')"
        >
          <!-- 显示已生产数量标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.producedQuantity') }}：
          </span>
          <!-- 显示已生产数量的值，无值时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.totalNumber || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 已检测数量 -->
        <!-- 根据展示类型决定是否显示已检测数量区域 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('detectedQuantity')"
        >
          <!-- 显示已检测数量标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.detectedQuantity') }}：
          </span>
          <!-- 显示已检测数量的值，无值时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.totalNumber || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 外观检验 -->
        <!-- 根据展示类型决定是否显示外观检验区域 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('appearanceInspection')"
        >
          <!-- 显示外观检验标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.appearanceInspection') }}：
          </span>
          <!-- 显示外观检验的值，无值时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.defectFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 检验结论 -->
        <!-- 根据展示类型决定是否显示检验结论区域 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('testConclusion')"
        >
          <!-- 显示检验结论标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.testConclusion') }}：
          </span>
          <!-- 显示检验结论的值，无值时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.defectFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
      </Col>
      <!-- 当展示类型在 20 到 23 之间时显示第二列 -->
      <Col :span="12" v-if="showTypeNumber >= 23">
        <!-- region 资源校验 -->
        <!-- 根据展示类型决定是否显示资源校验区域 -->
        <div
          class="mb-4"
          v-if="showType[showTypeNumber].includes('resourceVerification')"
        >
          <!-- 显示资源校验标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.resourceVerification') }}：
          </span>
          <!-- 显示资源校验的值，无值时显示默认提示 -->
          <span class="inline-bloc align-middle text-xl">
            <IconifyIcon
              v-if="details.equipCheckFlag || details.equipCheckFlag === 0"
              :icon="
                details.equipCheckFlag === -1
                  ? 'mdi:error-outline'
                  : 'mdi:success-circle-outline'
              "
              :class="{
                'text-red-500': details.equipCheckFlag === -1,
                'text-green-500': details.equipCheckFlag === 1,
                'text-yellow-300': details.equipCheckFlag === 0,
              }"
              class="inline-block align-text-bottom text-2xl"
            />
            {{ details.equipCheckFlagName }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 工序校验 -->
        <!-- 根据展示类型决定是否显示工序校验区域 -->
        <div
          class="mb-4"
          v-if="showType[showTypeNumber].includes('processVerification')"
        >
          <!-- 显示工序校验标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.processVerification') }}：
          </span>
          <!-- 显示工序校验的值，无值时显示默认提示 -->
          <span class="inline-bloc align-middle text-xl">
            <IconifyIcon
              v-if="details.processCheck || details.processCheck === 0"
              :icon="
                details.processCheck === -1
                  ? 'mdi:error-outline'
                  : 'mdi:success-circle-outline'
              "
              :class="{
                'text-red-500': details.processCheck === -1,
                'text-green-500': details.processCheck === 1,
                'text-yellow-300': details.processCheck === 0,
              }"
              class="inline-block align-text-bottom text-2xl"
            />
            {{ details.processCheckName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 工单绑定 -->
        <!-- 根据展示类型决定是否显示工单绑定区域 -->
        <div
          class="mb-4"
          v-if="showType[showTypeNumber].includes('workOrderBinding')"
        >
          <!-- 显示工单绑定标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.workOrderBinding') }}：
          </span>
          <!-- 显示工单绑定的值，无值时显示默认提示 -->
          <span class="inline-bloc align-middle text-xl">
            <IconifyIcon
              v-if="details.readyFlag || details.readyFlag === 0"
              :icon="
                details.readyFlag === -1
                  ? 'mdi:error-outline'
                  : 'mdi:success-circle-outline'
              "
              :class="{
                'text-red-500': details.readyFlag === -1,
                'text-green-500': details.readyFlag === 1,
                'text-yellow-300': details.readyFlag === 0,
              }"
              class="inline-block align-text-bottom text-2xl"
            />
            {{ details.readyFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 参数判异 -->
        <!-- 根据展示类型决定是否显示参数判异区域 -->
        <div
          class="mb-4"
          v-if="showType[showTypeNumber].includes('parameterDiscrimination')"
        >
          <!-- 显示参数判异标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.parameterDiscrimination') }}：
          </span>
          <!-- 显示参数判异的值，无值时显示默认提示 -->
          <span class="inline-bloc align-middle text-xl">
            <IconifyIcon
              v-if="details.paramCheckFlag || details.paramCheckFlag === 0"
              :icon="
                details.paramCheckFlag === -1
                  ? 'mdi:error-outline'
                  : 'mdi:success-circle-outline'
              "
              :class="{
                'text-red-500': details.paramCheckFlag === -1,
                'text-green-500': details.paramCheckFlag === 1,
                'text-yellow-300': details.paramCheckFlag === 0,
              }"
              class="inline-block align-text-bottom text-2xl"
            />
            {{ details.paramCheckFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 参数绑定 -->
        <!-- 根据展示类型决定是否显示参数绑定区域 -->
        <div
          class="mb-4"
          v-if="showType[showTypeNumber].includes('parameterBinding')"
        >
          <!-- 显示参数绑定标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.parameterBinding') }}：
          </span>
          <!-- 显示参数绑定的值，无值时显示默认提示 -->
          <span class="inline-bloc align-middle text-xl">
            <IconifyIcon
              v-if="details.paramBinding || details.paramBinding === 0"
              :icon="
                details.paramBinding === -1
                  ? 'mdi:error-outline'
                  : 'mdi:success-circle-outline'
              "
              :class="{
                'text-red-500': details.paramBinding === -1,
                'text-green-500': details.paramBinding === 1,
                'text-yellow-300': details.paramBinding === 0,
              }"
              class="inline-block align-text-bottom text-2xl"
            />
            {{ details.paramBindingName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 设备联锁 -->
        <!-- 根据展示类型决定是否显示设备联锁区域 -->
        <div
          class="mb-4"
          v-if="showType[showTypeNumber].includes('equipmentInterlockingR')"
        >
          <!-- 显示设备联锁标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.equipmentInterlocking') }}：
          </span>
          <!-- 显示设备联锁标签 -->
          <span class="inline-bloc align-middle text-xl">
            <IconifyIcon
              v-if="details.errorFlag || details.errorFlag === 0"
              :icon="
                details.errorFlag === -1
                  ? 'mdi:error-outline'
                  : 'mdi:success-circle-outline'
              "
              :class="{
                'text-red-500': details.errorFlag === -1,
                'text-green-500': details.errorFlag === 1,
                'text-yellow-300': details.errorFlag === 0,
              }"
              class="inline-block align-text-bottom text-2xl"
            />
            {{ details.errorFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
      </Col>
    </Row>
    <!-- 当详情数据不存在时显示空状态提示 -->
    <Empty v-else />
  </Spin>
</template>

<style scoped></style>
