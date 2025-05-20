<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button, Col, Empty, Row, Spin } from 'ant-design-vue';

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
  return 'inline-block w-64 border p-2 text-center';
}

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
 * 详情
 */
const details = ref<any>(undefined);
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
    .then((data) => {
      details.value = data;
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
    <Row v-if="details">
      <Col :span="showTypeNumber >= 20 && showTypeNumber <= 23 ? 24 : 12">
        <!-- region 单件SN码 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('singlePieceSNCode')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.singlePieceSNCode') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.snCode || $t('productionOperation.none') }}
          </span>
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
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('workOrderNumber')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.workOrderNumber') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.worksheetCode || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 设备联锁 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('equipmentInterlocking')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.equipmentInterlocking') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.error || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 加工状态 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('processingStatus')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.processingStatus') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.workingStateName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 已生产数量 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('producedQuantity')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.producedQuantity') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.totalNumber || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 已检测数量 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('detectedQuantity')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.detectedQuantity') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.totalNumber || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 外观检验 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('appearanceInspection')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.appearanceInspection') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.defectFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 检验结论 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('testConclusion')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.testConclusion') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.defectFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
      </Col>
      <Col :span="12" v-if="showTypeNumber >= 20 && showTypeNumber <= 23">
        <!-- region 资源校验 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('resourceVerification')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.resourceVerification') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.readyFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 工序校验 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('processVerification')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.processVerification') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.readyFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 工单绑定 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('workOrderBinding')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.workOrderBinding') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.readyFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 参数判异 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('parameterDiscrimination')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.parameterDiscrimination') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.readyFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 参数绑定 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('parameterBinding')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.parameterBinding') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.readyFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 设备联锁 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('equipmentInterlockingR')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.equipmentInterlocking') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.readyFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
      </Col>
    </Row>
    <Empty v-else />
  </Spin>
</template>

<style scoped></style>
