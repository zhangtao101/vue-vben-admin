<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onBeforeUnmount, onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Col,
  Input,
  InputNumber,
  message,
  Radio,
  RadioGroup,
  Row,
  Spin,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { equipcatchLock, listByOutReport, outReport } from '#/api';
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

const emit = defineEmits(['complete']);

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
  return 'inline-block border p-2 text-center w-72 align-middle';
}
/**
 * 详情
 */
const details = ref<any>({
  classType: 1,
  equipTime: 0,
  personTime: 0,
  manualReview: 0,
  manualReviewOfDefects: 0,
  differenceQuantity: 0,
  poorQuantityOfDifferences: 0,
  reportNumber: 0,
  unqualityNumber: 0,
});
/**
 * 加载中
 */
const spinning = ref<any>(false);

const gridOptions: VxeGridProps<any> = {
  editConfig: {
    mode: 'cell',
    trigger: 'click',
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'productReporting', title: '产品报工', minWidth: 120 },
    { field: 'reportedQuantity', title: '已报数量', minWidth: 120 },
    { field: 'unreportedQuantity', title: '未报数量', minWidth: 120 },
    {
      field: 'machineCollection',
      title: '机器采集',
      minWidth: 120,
      slots: {
        default: 'machineCollection_text',
      },
    },
    {
      field: 'manualReview',
      title: '人工复核',
      minWidth: 120,
      editRender: {},
      slots: {
        edit: 'manualReview',
        default: 'manualReview_text',
      },
    },
    {
      field: 'differenceQuantity',
      title: '差异数量',
      minWidth: 120,
      slots: {
        default: 'differenceQuantity_text',
      },
    },
    {
      field: 'numberOfJobApplications',
      title: '报工数量',
      minWidth: 120,
      editRender: {},
      slots: {
        edit: 'numberOfJobApplications',
        default: 'numberOfJobApplications_text',
      },
    },
  ],
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryData();
      },
    },
  },
  rowConfig: {
    isHover: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/**
 * 查询报工数据并构造表格数据
 * 1. 根据组件props参数构造请求参数
 * 2. 调用报工列表接口获取原始数据
 * 3. 处理接口返回数据，组装良品/不良品两行表格数据
 * 4. 返回符合vxe-grid要求的{total, items: any[]}数据结构
 *
 * @returns {Promise<{total: number, items: any[]}>}
 *   total - 表格数据总条数
 *   items - 表格行数据数组，包含良品/不良品两个对象
 */
function queryData() {
  return new Promise((resolve, _reject) => {
    // 构造请求参数对象，从组件的props中获取必要信息
    const params: any = {
      // 工作中心编号
      workstationCode: props.workstationCode,
      // 设备编号
      equipCode: props.equipCode,
      // 工单编号
      worksheetCode: props.worksheetCode,
      // 工序ID
      bindingId: props.bindingId,
      // 工步id
      functionId: props.functionId,
    };

    // 调用报工列表接口，传入构造好的请求参数
    listByOutReport(params).then((data: any) => {
      // 合并接口返回的数据到details响应式对象中
      // 同时更新人工复核和设备采集的良品、不良品数量
      details.value = {
        ...details.value,
        ...data,
        // 良品的人工复核数量初始化为设备采集的良品数量
        manualReview: data.equipQualityNumber,
        // 不良品的人工复核数量初始化为设备采集的不良品数量
        manualReviewOfDefects: data.equipUnqualityNumber,
      };

      // 如果接收到WebSocket传来的数值信息
      if (numericalValue.value) {
        // 重新计算良品的人工复核数量和设备采集的良品数量
        details.value.manualReview =
          numericalValue.value.endNumber - numericalValue.value.initNumber;
        details.value.equipQualityNumber =
          numericalValue.value.endNumber - numericalValue.value.initNumber;
      }

      // 初始化表格数据数组
      const arr = [];
      // 如果接口返回了有效数据
      if (data) {
        // 向表格数据数组中添加良品数量的相关信息
        arr.push(
          {
            // 报工类型为良品数量
            productReporting: '良品数量',
            // 已报数量
            reportedQuantity: data.finishNumber,
            // 未报数量
            unreportedQuantity: data.planNumber - data.finishNumber,
            // 机器采集的良品数量
            machineCollection: data.equipQualityNumber,
          },
          // 向表格数据数组中添加不良品数量的相关信息
          {
            // 报工类型为不良品数量
            productReporting: '不良品数量',
            // 已报的不良品数量
            reportedQuantity: data.totalUnqualityNumber,
            // 不良品未报数量无意义，用斜杠表示
            unreportedQuantity: '/',
            // 机器采集的不良品数量
            machineCollection: data.equipUnqualityNumber,
          },
        );
      }
      // 解析Promise，返回表格数据的总条数和具体的行数据
      resolve({ total: arr.length, items: arr });
    });
  });
}

/**
 * 提交报工信息
 * 该函数用于调用 outReport 接口提交报工信息，提交成功后会执行一系列后续操作，
 * 包括显示成功消息、重置详情数据、重新连接 WebSocket 以及刷新表格数据。
 */
function submit() {
  // 调用 outReport 接口提交报工信息，将 details 数据、bindingId、functionId 和 outType 作为参数传递
  outReport({
    ...details.value,
    bindingId: props.bindingId,
    functionId: props.functionId,
    outType: details.value.outFlag,
  }).then(() => {
    // 若接口调用成功，显示成功消息
    message.success($t('common.successfulOperation'));
    // 重置详情数据为初始值
    details.value = {
      // 班别，默认值为 1
      classType: 1,
      // 机时，默认值为 0
      equipTime: 0,
      // 人时，默认值为 0
      personTime: 0,
      // 良品的人工复核数量，默认值为 0
      manualReview: 0,
      // 不良品的人工复核数量，默认值为 0
      manualReviewOfDefects: 0,
      // 差异数量，默认值为 0
      differenceQuantity: 0,
      // 不良品差异数量，默认值为 0
      poorQuantityOfDifferences: 0,
      // 报工数量，默认值为 0
      reportNumber: 0,
      // 不良品数量，默认值为 0
      unqualityNumber: 0,
    };
    // 重新连接 WebSocket
    connect();
    // 刷新表格数据
    gridApi.reload();
    emit('complete');
  });
}

// region websocket

const { close, connect } = useWebSocket(readMessage, {
  workstationCode: props.workstationCode,
  equipCode: props.equipCode,
  worksheetCode: props.worksheetCode,
  bindingId: props.bindingId,
  functionId: props.functionId,
  webSocketType: 5,
});

const numericalValue = ref<any>({
  endNumber: 0,
  initNumber: 0,
});

/**
 * WebSocket消息处理回调
 * 功能：解析WebSocket推送的消息，并更新详情数据中的人工复核数量和设备采集的良品数量。
 * 流程：
 * 1. 尝试将接收到的原始消息字符串解析为JSON对象。
 * 2. 若解析成功，更新 `numericalValue` 响应式引用。
 * 3. 根据解析后的数据更新 `details` 响应式对象中的人工复核数量和设备采集的良品数量。
 *
 * @param message - WebSocket推送的原始消息字符串。
 *
 * 注意事项：
 * - 当前未处理JSON解析异常，建议增加try-catch逻辑以增强健壮性。
 * - 会直接覆盖 `numericalValue` 原有的状态数据，需确保消息数据结构一致性。
 * - 依赖父级作用域中的 `details` 和 `numericalValue` 响应式引用。
 */
function readMessage(message: string) {
  // 尝试反序列化WebSocket消息，将字符串转换为JSON对象
  try {
    numericalValue.value = JSON.parse(message);
    // 计算并更新良品的人工复核数量，计算公式为期末数值减去期初数值
    details.value.manualReview =
      numericalValue.value.endNumber - numericalValue.value.initNumber;
    // 计算并更新设备采集的良品数量，计算公式为期末数值减去期初数值
    details.value.equipQualityNumber =
      numericalValue.value.endNumber - numericalValue.value.initNumber;
  } catch (error) {
    // 若解析失败，可在此处添加错误处理逻辑，例如打印错误信息
    console.error('WebSocket消息解析失败:', error);
  }
}

/**
 * 执行报工锁定操作
 * 该函数会将报工状态标记为锁定，并调用 `equipcatchLock` 接口进行报工锁定。
 * 当接口调用成功后，关闭 WebSocket 连接并显示成功消息。
 */
function lock() {
  // 将报工状态标记为锁定，设置 outFlag 为 1
  details.value.outFlag = 1;
  // 调用 `equipcatchLock` 接口进行报工锁定操作，传递必要的参数
  equipcatchLock({
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
    // 期初数值
    initNumber: numericalValue.value.initNumber || 0,
    // 期末数值
    endNumber: numericalValue.value.endNumber || 0,
  }).then(() => {
    // 报工锁定操作成功后，关闭 WebSocket 连接
    close();
    // 显示操作成功的消息
    message.success($t('common.successfulOperation'));
  });
}
// endregion

onMounted(() => {});
onBeforeUnmount(() => {
  close();
});
</script>

<template>
  <Spin :spinning="spinning">
    <Row>
      <Col :span="24" class="pt-5">
        <!-- region 工单编号 -->
        <div class="mb-4 mr-8 inline-block">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.workOrderNumber') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.worksheetCode || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- region 产品名称 -->
        <div class="mb-4 mr-8 inline-block">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.productName') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.productName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- region 计划数量 -->
        <div class="mb-4 mr-8 inline-block">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.plannedQuantity') }}：
          </span>
          <span :class="getValueClass()">
            {{ details.planNumber || $t('productionOperation.none') }}
          </span>
        </div>
      </Col>
      <Col :span="24" class="pt-5">
        <!-- region 人时 -->
        <div class="mb-4 mr-8 inline-block">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.whenPeopleArePresent') }}：
          </span>
          <span :class="getValueClass()" class="border-0 align-middle">
            <InputNumber
              v-model:value="details.personTime"
              :min="0"
              class="!w-full"
              addon-after="H"
            />
          </span>
        </div>
        <!-- region 机时 -->
        <div class="mb-4 mr-8 inline-block">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.whenTheMachineIsAvailable') }}：
          </span>
          <span :class="getValueClass()" class="border-0 align-middle">
            <InputNumber
              v-model:value="details.equipTime"
              :min="0"
              class="!w-full"
              addon-after="H"
            />
          </span>
        </div>
        <!-- region 班别 -->
        <div class="mb-4 mr-8 inline-block">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.classPlease') }}：
          </span>
          <span :class="getValueClass()" class="border-0 align-middle">
            <RadioGroup v-model:value="details.classType">
              <Radio :value="1">{{ $t('productionOperation.dayShift') }}</Radio>
              <Radio :value="2">{{
                $t('productionOperation.nightShift')
              }}</Radio>
            </RadioGroup>
          </span>
        </div>
      </Col>
    </Row>
    <Row class="border">
      <Col :span="24">
        <!-- region 实时数采 -->
        <div class="mb-4 inline-block">
          <span :class="getLabelClass()" class="font-black">
            {{ $t('productionOperation.realTimeDataAcquisition') }}：
          </span>
        </div>
      </Col>
      <Col :span="24" class="pt-5">
        <!-- endregion -->
        <div class="inline-block">
          <!-- region 期初数值 -->
          <div class="mb-4 mr-8 inline-block">
            <span :class="getLabelClass()">
              {{ $t('productionOperation.initialValue') }}：
            </span>
            <span :class="getValueClass()">
              {{ numericalValue.initNumber || 0 }}
            </span>
          </div>
          <!-- endregion -->
          <!-- region 期末数值 -->
          <div class="mb-4 mr-8 inline-block">
            <span :class="getLabelClass()">
              {{ $t('productionOperation.endOfTermValue') }}：
            </span>
            <span :class="getValueClass()">
              {{ numericalValue.endNumber || 0 }}
            </span>
          </div>
          <!-- endregion -->
          <!-- region 报工锁定 -->
          <Button type="primary" @click="lock">
            {{ $t('productionOperation.workReportingLock') }}
          </Button>
          <!-- endregion -->
        </div>
      </Col>
    </Row>
    <Grid>
      <!-- 人工复核 -->
      <template #manualReview="{ rowIndex }">
        <Input v-model:value="details.manualReview" v-if="rowIndex === 0" />
        <Input v-model:value="details.manualReviewOfDefects" v-else />
      </template>
      <template #manualReview_text="{ rowIndex }">
        {{
          rowIndex === 0 ? details.manualReview : details.manualReviewOfDefects
        }}
      </template>
      <template #machineCollection_text="{ rowIndex }">
        {{
          rowIndex === 0
            ? details.equipQualityNumber
            : details.equipUnqualityNumber
        }}
      </template>
      <!-- 差异数量 -->
      <template #differenceQuantity_text="{ rowIndex }">
        {{
          rowIndex === 0
            ? details.equipQualityNumber - details.manualReview
            : details.equipUnqualityNumber - details.manualReviewOfDefects
        }}
      </template>
      <!-- 报工数量 -->
      <template #numberOfJobApplications="{ rowIndex }">
        <InputNumber
          v-model:value="details.reportNumber"
          :min="0"
          v-if="rowIndex === 0"
        />
        <InputNumber v-model:value="details.unqualityNumber" :min="0" v-else />
      </template>
      <template #numberOfJobApplications_text="{ rowIndex }">
        {{ rowIndex === 0 ? details.reportNumber : details.unqualityNumber }}
      </template>
    </Grid>
    <Row>
      <Col :span="8" offset="8">
        <!-- 工序报工 -->
        <Button
          type="primary"
          class="w-full"
          @click="submit()"
          v-if="showTypeNumber === 38"
        >
          {{ $t('common.processReporting') }}
        </Button>
      </Col>
    </Row>
    <Row :gutter="24">
      <Col :span="8" offset="4">
        <!-- 完工出站 -->
        <Button
          type="primary"
          class="w-full"
          @click="submit()"
          v-if="showTypeNumber === 31 && [1, 4].includes(details.outFlag)"
        >
          {{ $t('productionOperation.outbound') }}
        </Button>
      </Col>
      <Col :span="8">
        <!-- 暂停出站 -->
        <Button
          type="primary"
          class="w-full"
          @click="submit()"
          v-if="showTypeNumber === 31 && [2, 4].includes(details.outFlag)"
        >
          {{ $t('productionOperation.suspendExit') }}
        </Button>
      </Col>
    </Row>
  </Spin>
</template>

<style scoped></style>
