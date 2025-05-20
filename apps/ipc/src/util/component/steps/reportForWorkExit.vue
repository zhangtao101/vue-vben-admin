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
  return 'mr-4 inline-block w-48 p-2 text-center';
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
 * 查询工序出站信息
 * 功能：获取当前工序的出站状态数据
 * 流程：
 * 1. 开启加载状态指示
 * 2. 构造包含工位、设备等上下文参数的请求对象
 * 3. 调用工序出站信息查询接口
 * 4. 存储返回数据到响应式对象
 * 5. 始终关闭加载状态指示
 *
 * 接口参数说明：
 * listByOutReport - 工序出站信息查询接口
 * {
 *   workstationCode: 工作站编码,
 *   equipCode: 设备编码,
 *   worksheetCode: 工单编号,
 *   bindingId: 工序绑定ID,
 *   functionId: 工步ID
 * }
 *
 * 注意事项：
 * - 使用spinning控制加载状态指示器
 * - 依赖props传入的工位/设备/工单等上下文参数
 * - 接口返回数据直接存储到details响应式对象
 * - 当前未处理接口异常情况，需补充错误处理逻辑
 * - 使用finally确保无论成功失败都会关闭加载状态
 */
function queryData() {
  spinning.value = true;
  listByOutReport({
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
 * 提交报工操作
 * @function
 * @description 报工流程：
 * 1. 弹出二次确认对话框
 * 2. 确认后调用报工接口提交当前详情数据
 * 3. 操作成功显示国际化提示
 *
 * @example
 * // 点击提交按钮时触发
 * submit();
 *
 * @see {@link outReport} 使用的报工接口
 * @see {@link details} 报工数据来源：包含工单/产品/数量等信息
 */
function submit() {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消操作!');
    },
    onOk() {
      outReport({ ...details.value, bindingId: props.bindingId }).then(() => {
        message.success($t('common.successfulOperation'));
        queryData();
      });
    },
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
