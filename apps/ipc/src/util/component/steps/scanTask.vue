<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button, Col, Input, Row, Spin } from 'ant-design-vue';

import { handleMaulSncode, listHCByCodeScan } from '#/api';
import ScanTheCode from '#/util/component/scanTheCode.vue';
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
  return 'mr-4 inline-block w-36 p-2 text-right';
}

/**
 * 获取值的class
 */
function getValueClass() {
  return 'inline-block border p-2 text-center w-72';
}
/**
 * 详情
 */
const details = ref<any>({});
/**
 * 加载中
 */
const spinning = ref<any>(false);
/**
 * sn码
 */
const snCode = ref<any>('');

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
  listHCByCodeScan({
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
    snCode: snCode.value,
  })
    .then((data) => {
      details.value = {
        ...details.value,
        ...data,
      };
    })
    .finally(() => {
      spinning.value = false;
    });
}
function queryCode() {
  handleMaulSncode({
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
    snCode: snCode.value,
  })
    .then((data) => {
      const keys = [
        'checkResult',
        'checkResultName',
        'snCode',
        'worksheetCode',
        'productCode',
        'productName',
        'error',
      ];
      keys.forEach((key) => {
        details.value[key] = data[key];
      });
    })
    .finally(() => {
      spinning.value = false;
    });
}

// region websocket

useWebSocket(readMessage, {
  workstationCode: props.workstationCode,
  equipCode: props.equipCode,
  worksheetCode: props.worksheetCode,
  bindingId: props.bindingId,
  functionId: props.functionId,
  webSocketType: 5,
});
function readMessage() {
  queryData();
}
// endregion

onMounted(() => {
  queryData();
});
</script>

<template>
  <Spin :spinning="spinning">
    <Row>
      <Col :span="24" class="pt-10">
        <!-- region 单件SN码 -->
        <div class="mb-4 mr-8 flex items-center">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.singlePieceSNCode') }}：
          </span>
          <span :class="getValueClass()" class="border-0">
            <Input
              v-model:value="snCode"
              class="w-[80%]"
              :disabled="showTypeNumber === 37"
              @keydown.enter="queryCode()"
            />
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
      <Col :span="24">
        <!-- region 校验结果 -->
        <div class="mb-4 mr-8 inline-block">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.verificationResult') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.error || $t('productionOperation.none') }}
          </span>
          <Button type="link" v-if="details.error !== '通过'" danger>
            <IconifyIcon
              icon="mdi:lock-outline"
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </div>
        <!-- endregion -->
      </Col>
      <Col :span="24">
        <!-- region 工单编号 -->
        <div class="mb-4 mr-8 inline-block">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.workOrderNumber') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.worksheetCode || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion -->
        <!-- region 产品名称 -->
        <div class="mb-4 mr-8 inline-block">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.productName') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.productName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion -->
        <!-- region 测试结果 -->
        <div class="mb-4 mr-8 inline-block">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.testResult') }}：
          </span>
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
