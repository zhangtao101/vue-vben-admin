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

function submit() {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger', // 表示危险操作
    title: '是否确认提交数据?',
    onCancel() {
      // 取消操作处理
      message.warning('已取消!');
    },

    onOk() {
      // 确认操作处理
      sendEquip({
        ...details.value,
        worksheetCode: props.worksheetCode,
      })
        .then(() => {
          message.success($t('common.successfulOperation'));
          queryData();
          details.value = {
            isUpdateFlag: 2,
          };
        })
        .catch((error) => {
          message.error($t('common.operationFailure')); // 通用错误提示
          message.error(error.msg); // 显示接口返回的具体错误信息
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
