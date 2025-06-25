<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { Button, Empty, message, Spin } from 'ant-design-vue';

import {
  equipmentCleaningInformation,
  manualCleaningOfTheEquipment,
  manuallyFinishTheCleaning,
} from '#/api';
import useWebSocket from '#/util/websocket-util';

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
});

/**
 * 获取标签的class
 */
function getLabelClass() {
  return 'mr-4 inline-block w-48 p-2 text-right';
}

/**
 * 获取值的class
 */
function getValueClass() {
  return 'inline-block w-48 border p-2 text-center';
}

/**
 * 详情
 */
const details = ref<any>(undefined);
/**
 * 加载中
 */
const spinning = ref<any>(false);

/**
 * 查询设备清洁信息
 * 功能：获取设备清洁相关数据并更新视图状态
 * 流程：
 * 1. 设置加载状态为true（显示加载动画）
 * 2. 调用设备清洁信息查询接口
 * 3. 接口返回后更新详情数据
 * 4. 无论成功失败都关闭加载状态
 *
 * 接口说明：
 * equipmentCleaningInformation - 设备清洁信息查询接口
 * 参数结构：
 * {
 *   workstationCode: 工作中心编号,
 *   equipCode: 设备编号,
 *   worksheetCode: 工单编号,
 *   bindingId: 工序ID,
 *   functionId: 工步ID
 * }
 *
 * 注意事项：
 * - 依赖props传递设备/工单相关标识参数
 * - 使用finally保证加载状态始终会被重置
 * - 直接更新响应式对象details实现视图自动更新
 * - 未处理接口异常情况，需根据业务需求补充错误处理
 */
function queryData() {
  spinning.value = true;
  equipmentCleaningInformation({
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
  })
    .then((data) => {
      details.value = data;
    })
    .finally(() => {
      spinning.value = false;
    });
}

/**
 * 处理设备清洁操作提交
 * 功能：根据操作类型执行设备重新清洁或人工完工操作
 * 流程：
 * 1. 构建基本请求参数（工作站/设备/工单信息）
 * 2. 根据操作类型选择对应接口：
 *   - true: 调用手动清洁设备接口
 *   - false: 调用人工完工接口
 * 3. 提交成功后刷新设备清洁信息
 *
 * @param bol - 操作类型标识
 *             true: 手动重新清洁
 *             false: 人工结束作业
 *
 * 接口说明：
 * - manualCleaningOfTheEquipment     手动清洁设备接口
 * - manuallyFinishTheCleaning       人工完工接口
 *
 * 注意事项：
 * - 参数包含nextTemplateCode用于指定后续工序模板
 * - 成功后会重新获取最新设备清洁状态
 * - 使用国际化机制处理成功提示信息
 * - 当前未处理接口异常情况，需补充错误处理逻辑
 * - 按钮状态需与details.cleanlinessFlag联动控制
 */
function submit(bol: boolean) {
  const params = {
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
    nextTemplateCode: details.value.nextTemplateCode,
  };
  const ob = bol
    ? manualCleaningOfTheEquipment(params)
    : manuallyFinishTheCleaning(params);
  ob.then(() => {
    message.success($t('common.successfulOperation'));
    queryData();
  });
}

// region websocket

const { close: websocketClose } = useWebSocket(readMessage, {
  workstationCode: props.workstationCode,
  equipCode: props.equipCode,
  worksheetCode: props.worksheetCode,
  bindingId: props.bindingId,
  functionId: props.functionId,
});

/**
 * WebSocket消息处理回调
 * 功能：解析并更新资源验证状态数据
 * 流程：
 * 1. 解析原始消息为JSON对象
 * 2. 验证数据有效性（非空检查）
 * 3. 更新响应式状态数据
 *
 * @param message - WebSocket推送的原始消息字符串
 *
 * 注意事项：
 * - 当前未处理JSON解析异常，需增加try-catch逻辑
 * - 会直接覆盖原有状态数据，需确保数据结构一致性
 * - 依赖父级作用域中的details响应式引用
 */
function readMessage(message: string) {
  // 反序列化WebSocket消息
  const data = JSON.parse(message);
  // 有效性检查后更新视图数据
  if (data) {
    details.value = data; // 直接替换整个状态对象
  }
}
// endregion

onMounted(() => {
  queryData();
});
onBeforeUnmount(() => {
  websocketClose();
});
</script>

<template>
  <Spin :spinning="spinning">
    <template v-if="details">
      <div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 当前工单 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.currentWorkOrder') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.currentJobId || $t('productionOperation.none') }}
          </span>
        </div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 产品名称 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.currentProductName') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.productName || $t('productionOperation.none') }}
          </span>
        </div>
      </div>
      <div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 前工步执行状况 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.implementationStatus') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.lastFlagName || $t('productionOperation.none') }}
          </span>
        </div>
      </div>

      <div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 清洁模式 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.cleaningMode') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.cleanModel === 1 ? '自动' : '手动' }}
          </span>
        </div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 清洁状态 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.cleanCondition') }}
          </span>
          <span :class="getValueClass()">
            {{ details.cleanlinessFlagName || $t('productionOperation.none') }}
          </span>
        </div>
      </div>
      <div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 清洁计时 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.cleaningTimer') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.setMinute || 0 }}分钟
          </span>
        </div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 清洁设置时长 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.cleaningSettingDuration') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.cleanMinute || 0 }}分钟
          </span>
        </div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 清洁超时 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.cleaningTimeout') }}：
          </span>
          <span :class="getValueClass()">
            {{
              details.overTimeFlag === 1
                ? $t('productionOperation.overtime')
                : $t('productionOperation.notTimeout')
            }}
          </span>
        </div>
        <div
          class="float-right mb-4 mr-8 inline-block"
          v-if="details.overTimeFlag === 1"
        >
          <!-- 超时时才会出现  v-if="details.overTimeFlag === 1" -->
          <Button
            type="primary"
            size="large"
            class="mr-4"
            @click="submit(true)"
            :disabled="[1, 2, 3].includes(details.cleanlinessFlag)"
          >
            {{ $t('productionOperation.manualRecleaning') }}
          </Button>
          <Button
            type="primary"
            size="large"
            danger
            @click="submit(false)"
            :disabled="![1, 2, 3].includes(details.cleanlinessFlag)"
          >
            {{ $t('productionOperation.manualEndJob') }}
          </Button>
        </div>
      </div>
    </template>
    <Empty v-else />
  </Spin>
</template>

<style scoped></style>
