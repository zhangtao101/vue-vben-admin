<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { Button, Empty, message, Spin } from 'ant-design-vue';

import { endOfFeeding, materialFeedingInformationQuerySlitting } from '#/api';
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
 * 查询分切物料投料信息
 * 功能：获取分切工序的物料投料数据
 * 流程：
 * 1. 开启加载状态指示
 * 2. 构造包含工位、设备等上下文参数的请求对象
 * 3. 调用分切物料信息查询接口
 * 4. 存储返回数据到响应式对象
 * 5. 始终关闭加载状态指示
 *
 * 接口参数说明：
 * materialFeedingInformationQuerySlitting - 分切物料信息查询接口
 * {
 *   workstationCode: 工作站编码,
 *   equipCode: 设备编码,
 *   worksheetCode: 工单编号,
 *   bindingId: 工序绑定ID,
 *   functionId: 工步ID,
 *   feedtype: 投料类型(固定值2)
 * }
 *
 * 注意事项：
 * - 使用spinning控制加载状态指示器
 * - feedtype参数固定为2表示分切类型
 * - 接口返回数据直接存储到details响应式对象
 * - 当前未处理接口异常情况，需补充错误处理逻辑
 */
function queryData() {
  spinning.value = true;
  materialFeedingInformationQuerySlitting({
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
    feedtype: 2,
  })
    .then((data) => {
      details.value = data;
    })
    .finally(() => {
      spinning.value = false;
    });
}

/**
 * 提交分切投料完成操作
 * 功能：确认并完成分切工序的物料投料流程
 * 流程：
 * 1. 组装工作站、设备等上下文参数
 * 2. 携带来自接口的下个模板编号(nextTemplateCode)
 * 3. 调用投料完成接口提交数据
 * 4. 成功后刷新当前状态数据并提示操作结果
 *
 * 接口参数结构：
 * endOfFeeding - 结束投料接口
 * {
 *   workstationCode: 工作站编码,
 *   equipCode: 设备编码,
 *   worksheetCode: 工单编号,
 *   bindingId: 工序绑定ID,
 *   functionId: 工步ID,
 *   nextTemplateCode: 后续模板编号（来自接口返回）
 * }
 *
 * 注意事项：
 * - nextTemplateCode必须来自最新查询的接口数据
 * - 操作成功后自动刷新当前状态数据
 * - 使用国际化机制处理成功提示信息
 * - 当前未处理接口异常情况，需补充错误处理逻辑
 */
function submit() {
  endOfFeeding({
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
    nextTemplateCode: details.value.nextTemplateCode,
  }).then(() => {
    message.success($t('common.successfulOperation'));
    queryData();
  });
}

// region websocket

useWebSocket(readMessage, {
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
            {{ $t('productionOperation.implementationStatus') }}
          </span>
          <span :class="getValueClass()">
            {{ details.lastFlagName || $t('productionOperation.none') }}
          </span>
        </div>
      </div>

      <div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 当前模式 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.currentMode') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.feedModelName || $t('productionOperation.none') }}
          </span>
        </div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 模式切换次数 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.modeSwitchingTimes') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.feedModelChangeCount || $t('productionOperation.none') }}
          </span>
        </div>
      </div>

      <div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 前设备投料 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.preEquipmentFeeding') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.lastFeedFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 前设备堵料设置 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.frontDevicePlugSetting') }}：
          </span>
          <span :class="getValueClass()">
            {{
              details.lastFeedWaiteFlagName || $t('productionOperation.none')
            }}
          </span>
        </div>
      </div>

      <div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 后级设备入料允许 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.feedIsAllowedForPostStageEquipment') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.nextFeedFlagName || $t('productionOperation.none') }}
          </span>
        </div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 后级设备工单 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.postEquipmentWorkOrder') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.nextWorksheetCode || $t('productionOperation.none') }}
          </span>
        </div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 后级设备状态 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.statusOfTheLastDevice') }}：
          </span>
          <span :class="getValueClass()">
            {{
              details.nextMachineStatusName || $t('productionOperation.none')
            }}
          </span>
        </div>
      </div>

      <div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 当前设备投料状态 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.currentDeviceFeedingStatus') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.machineStatusName || $t('productionOperation.none') }}
          </span>
        </div>
        <div class="mb-4 mr-8 inline-block">
          <Button type="primary" @click="submit">
            {{ $t('productionOperation.endOfFeeding') }}
          </Button>
        </div>
      </div>
    </template>
    <Empty v-else />
  </Spin>
</template>

<style scoped></style>
