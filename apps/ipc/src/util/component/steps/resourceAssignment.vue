<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Col,
  message,
  Modal,
  Radio,
  RadioGroup,
  Row,
  Select,
  Spin,
} from 'ant-design-vue';

import { listEquipSend, sendEquip } from '#/api';

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

/**
 * 详情
 */
const details = ref<any>({
  isUpdateFlag: 2,
});
/**
 * 设备列表
 */
const equipmentList = ref<any>([]);
/**
 * 异常类型
 */
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
  listEquipSend({
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
  })
    .then((data) => {
      equipmentList.value = data;
    })
    .finally(() => {
      spinning.value = false;
    });
}

/**
 * 提交资源分配数据
 * 该函数会弹出一个确认对话框，让用户确认是否提交资源分配数据。
 * 如果用户确认，会调用 `sendEquip` 接口提交数据；如果用户取消，则显示取消提示。
 * 提交成功后，会显示成功提示，重新查询数据并重置 `details` 对象；
 * 提交失败则会显示通用错误提示和接口返回的具体错误信息。
 */
function submit() {
  // 弹出确认对话框，让用户确认是否提交数据
  Modal.confirm({
    // 取消按钮的文本
    cancelText: '取消',
    // 确认按钮的文本
    okText: '确认',
    // 确认按钮的类型，设置为危险类型，表示该操作较为重要
    okType: 'danger',
    // 对话框的标题
    title: '是否确认提交数据?',
    // 用户点击取消按钮时的回调函数
    onCancel() {
      // 显示取消操作的提示信息
      message.warning('已取消!');
    },
    // 用户点击确认按钮时的回调函数
    onOk() {
      // 调用 `sendEquip` 接口提交资源分配数据，将 `details` 对象和工单编号作为参数传递
      sendEquip({
        ...details.value,
        worksheetCode: props.worksheetCode,
      })
        // 接口调用成功后的回调函数
        .then(() => {
          // 显示操作成功的提示信息
          message.success($t('common.successfulOperation'));
          // 重新查询资源验证状态数据
          queryData();
          // 重置 `details` 对象，将 `isUpdateFlag` 设置为 2
          details.value = {
            isUpdateFlag: 2,
          };
        });
    },
  });
}

onMounted(() => {
  queryData();
});
</script>

<template>
  <Spin :spinning="spinning">
    <Row>
      <Col :span="24">
        <!-- region 工单号 -->
        <div class="mb-4 mr-8 inline-block">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.currentWorkOrder') }}：
          </span>
          <span :class="getValueClass()">
            {{ props.worksheetCode || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion-->
        <!-- region 设备编号 -->
        <div class="mb-4 mr-8 inline-block">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.equipmentNumber') }}：
          </span>
          <span :class="getValueClass()">
            <Select
              v-model:value="details.equipCode"
              :options="equipmentList"
              :field-names="{
                label: 'equipmentName',
                value: 'equipmentCode',
              }"
              class="min-w-48"
            />
          </span>
        </div>
        <!-- endregion-->
        <!-- region 允许调整 -->
        <div class="mb-4 mr-8 inline-block">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.allowForAdjustment') }}：
          </span>
          <span :class="getValueClass()">
            <RadioGroup v-model:value="details.isUpdateFlag">
              <Radio :value="1">允许</Radio>
              <Radio :value="2">不允许</Radio>
            </RadioGroup>
          </span>
        </div>
        <!-- endregion-->
        <Button type="primary" @click="submit" :disabled="!details.equipCode">
          {{ $t('common.submit') }}
        </Button>
      </Col>
    </Row>
  </Spin>
</template>

<style scoped></style>
