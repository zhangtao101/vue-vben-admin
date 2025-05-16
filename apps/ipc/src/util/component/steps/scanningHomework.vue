<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { Col, Row, Spin } from 'ant-design-vue';

import { queryOfResourceVerificationStatus } from '#/api';

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
  return 'mr-4 inline-block w-48 border p-2 text-center';
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
    'appearanceInspection',
    'testConclusion',
  ],
  23: [
    'singlePieceSNCode',
    'workOrderNumber',
    'detectedQuantity',
    'testConclusion',
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
const details = ref<any>({});
/**
 * 加载中
 */
const spinning = ref<any>(false);

/**
 * 查询资源验证状态
 * 功能：获取当前工位的资源校验状态数据
 * 流程：
 * 1. 开启加载状态指示
 * 2. 构造包含工位、设备等上下文参数的请求对象
 * 3. 调用资源验证状态查询接口
 * 4. 存储返回数据到响应式对象
 * 5. 始终关闭加载状态指示
 *
 * 接口参数说明：
 * queryOfResourceVerificationStatus - 资源验证状态查询接口
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
  queryOfResourceVerificationStatus({
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
    <Row>
      <Col :span="showTypeNumber >= 20 && showTypeNumber <= 23 ? 24 : 12">
        <!-- region 单件SN码 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('singlePieceSNCode')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.singlePieceSNCode') }}
          </span>
          <span :class="getValueClass()">
            {{ details.readyFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 工单编号 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('workOrderNumber')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.workOrderNumber') }}
          </span>
          <span :class="getValueClass()">
            {{ details.readyFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 设备联锁 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('equipmentInterlocking')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.equipmentInterlocking') }}
          </span>
          <span :class="getValueClass()">
            {{ details.readyFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 加工状态 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('processingStatus')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.processingStatus') }}
          </span>
          <span :class="getValueClass()">
            {{ details.readyFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 已生产数量 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('producedQuantity')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.producedQuantity') }}
          </span>
          <span :class="getValueClass()">
            {{ details.readyFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 已检测数量 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('detectedQuantity')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.detectedQuantity') }}
          </span>
          <span :class="getValueClass()">
            {{ details.readyFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 外观检验 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('appearanceInspection')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.appearanceInspection') }}
          </span>
          <span :class="getValueClass()">
            {{ details.readyFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 检验结论 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="showType[showTypeNumber].includes('testConclusion')"
        >
          <span :class="getLabelClass()">
            {{ $t('productionOperation.testConclusion') }}
          </span>
          <span :class="getValueClass()">
            {{ details.readyFlagName || $t('productionOperation.none') }}
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
            {{ $t('productionOperation.resourceVerification') }}
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
            {{ $t('productionOperation.processVerification') }}
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
            {{ $t('productionOperation.workOrderBinding') }}
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
            {{ $t('productionOperation.parameterDiscrimination') }}
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
            {{ $t('productionOperation.parameterBinding') }}
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
            {{ $t('productionOperation.equipmentInterlocking') }}
          </span>
          <span :class="getValueClass()">
            {{ details.readyFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
      </Col>
    </Row>
  </Spin>
</template>

<style scoped></style>
