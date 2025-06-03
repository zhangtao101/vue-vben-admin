<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Empty,
  InputNumber,
  message,
  Modal,
  Spin,
} from 'ant-design-vue';

import { listByOutReport, outReport } from '#/api';

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
  return 'inline-block min-w-48 border p-2 text-center';
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
 * 查询报工数据
 * 该函数用于调用 `listByOutReport` 接口获取报工相关数据，并在查询过程中控制加载状态。
 * 当接口调用开始时，将 `spinning` 状态设置为 `true` 以显示加载状态；
 * 接口调用成功后，将返回的数据赋值给 `details` 响应式对象；
 * 无论接口调用成功或失败，最终都会将 `spinning` 状态设置为 `false` 以隐藏加载状态。
 */
function queryData() {
  // 设置加载状态为 true，显示加载动画
  spinning.value = true;
  // 调用 `listByOutReport` 接口，传递必要的参数
  listByOutReport({
    // 工作中心编号
    workstationCode: props.workstationCode,
    // 设备编号
    equipCode: props.equipCode,
    // 工单编号
    worksheetCode: props.worksheetCode,
    // 工序 ID
    bindingId: props.bindingId,
    // 工步 ID
    functionId: props.functionId,
  })
    // 接口调用成功后的处理逻辑
    .then((data) => {
      // 将接口返回的数据赋值给 `details` 响应式对象
      details.value = data;
    })
    // 无论接口调用成功或失败，都会执行的最终处理逻辑
    .finally(() => {
      // 设置加载状态为 false，隐藏加载动画
      spinning.value = false;
    });
}

/**
 * 提交报工操作
 * 该函数会弹出一个二次确认对话框，让用户确认是否执行报工操作。
 * 若用户确认，会调用 `outReport` 接口提交报工数据；若用户取消，则显示取消操作的提示信息。
 * 报工成功后，会显示成功提示信息，并重新查询报工数据以更新页面显示。
 */
function submit() {
  // 弹出二次确认对话框，让用户确认是否执行报工操作
  Modal.confirm({
    // 取消按钮的文本
    cancelText: '取消',
    // 确认按钮的文本
    okText: '确认',
    // 确认按钮的类型，设置为危险类型
    okType: 'danger',
    // 用户点击取消按钮时的回调函数
    onCancel() {
      // 显示取消操作的提示信息
      message.warning('已取消操作!');
    },
    // 用户点击确认按钮时的回调函数
    onOk() {
      // 调用 `outReport` 接口提交报工数据，将详情数据和工序 ID 作为参数传递
      outReport({ ...details.value, bindingId: props.bindingId }).then(() => {
        // 接口调用成功后，显示操作成功的提示信息
        message.success($t('common.successfulOperation'));
        // 重新查询报工数据，更新页面显示
        queryData();
      });
    },
    // 对话框的标题
    title: '是否确认报工操作?',
  });
}

onMounted(() => {
  queryData();
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
            {{ details.worksheetCode || $t('productionOperation.none') }}
          </span>
        </div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 产品名称 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.productName') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.productName || $t('productionOperation.none') }}
          </span>
        </div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 产品编号 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.productNumber') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.productCode || $t('productionOperation.none') }}
          </span>
        </div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 计划数量 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.plannedQuantity') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.planNumber || $t('productionOperation.none') }}
          </span>
        </div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 累计完成数量 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.cumulativeCompletedQuantity') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.finishNumber || $t('productionOperation.none') }}
          </span>
        </div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 累计不良数量 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.cumulativeNumberOfDefects') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.totalUnqualityNumber || $t('productionOperation.none') }}
          </span>
        </div>
      </div>
      <div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 良品数量 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.quantityOfGoodProducts') }}：
          </span>
          <InputNumber
            v-model:value="details.reportNumber"
            class="w-72"
            min="0"
          />
        </div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 不良品数量 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.quantityOfDefectiveProducts') }}：
          </span>
          <InputNumber
            v-model:value="details.unqualityNumber"
            class="w-72"
            min="0"
          />
        </div>
        <div class="mb-4 mr-8 inline-block">
          <Button type="primary" @click="submit">
            {{ $t('common.submit') }}
          </Button>
        </div>
      </div>
    </template>
    <Empty v-else />
  </Spin>
</template>

<style scoped></style>
