<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { Button, Col, Row, Select, Spin } from 'ant-design-vue';

import { listByCodeScan } from '#/api';

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
 * 获取标签的class
 */
function getLabelClass() {
  return 'mr-4 inline-block w-48 p-2 text-right';
}

/**
 * 获取值的class
 */
function getValueClass() {
  return 'inline-block border p-2 text-center w-72';
}
/**
 * 工单列表
 */
const workOrderList = ref<any>([]);
/**
 * 选中的工单
 */
const theSelectedWorkOrder = ref<any>('');
/**
 * 加载中
 */
const spinning = ref<any>(false);

/**
 * 查询资源验证状态
 * @function
 * @async
 * @description 获取当前工位的资源校验状态数据，包含以下流程：
 * 1. 开启加载状态指示
 * 2. 从组件props中获取上下文参数
 * 3. 调用资源验证状态查询接口
 * 4. 存储接口返回数据
 * 5. 始终关闭加载状态指示
 *
 * @throws {Error} 需要调用者补充异常处理逻辑
 *
 * @example
 * // 典型调用流程
 * try {
 *   await queryData();
 * } catch (error) {
 *   // 待补充的错误处理
 * }
 *
 * @see {@link listByCodeScan} 使用的API接口
 * @see {@link props} 参数来源：工步ID/工序ID/工单编号等上下文参数
 */
function queryData() {
  spinning.value = true;
  listByCodeScan({
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
  })
    .then((_data) => {
      workOrderList.value = [];
    })
    .finally(() => {
      spinning.value = false;
    });
}

onMounted(() => {
  queryData();
});
</script>

<template>
  <Spin :spinning="spinning">
    <Row>
      <Col :span="24" class="pt-10">
        <!-- region 工单编号 -->
        <div class="mb-4 mr-8 inline-block">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.workOrderNumber') }}：
          </span>
          <span :class="getValueClass()" class="border-0">
            <Select
              class="w-full"
              v-model:value="theSelectedWorkOrder"
              :options="workOrderList"
            />
          </span>
        </div>
        <!-- region 产品名称 -->
        <div class="mb-4 mr-8 inline-block">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.productName') }}：
          </span>
          <span :class="getValueClass()">
            {{ $t('productionOperation.none') }}
          </span>
        </div>
      </Col>
    </Row>
    <Row>
      <Col :span="8" offset="8">
        <!-- 工序进站 -->
        <Button type="primary" class="w-full">
          {{ $t('common.processEntryIntoTheStation') }}
        </Button>
      </Col>
    </Row>
  </Spin>
</template>

<style scoped></style>
