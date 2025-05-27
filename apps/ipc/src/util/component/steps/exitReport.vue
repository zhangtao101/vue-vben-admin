<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';

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
 * 4. 返回符合vxe-grid要求的{total, items}数据结构
 *
 * @returns {Promise<{total: number, items: any[]}>}
 *   total - 表格数据总条数
 *   items - 表格行数据数组，包含良品/不良品两个对象
 */
function queryData() {
  return new Promise((resolve, _reject) => {
    const params: any = {
      workstationCode: props.workstationCode,
      equipCode: props.equipCode,
      worksheetCode: props.worksheetCode,
      bindingId: props.bindingId,
      functionId: props.functionId,
    };

    listByOutReport(params).then((data: any) => {
      details.value = {
        ...details.value,
        ...data,
        manualReview: data.equipQualityNumber,
        manualReviewOfDefects: data.equipUnqualityNumber,
      };
      if (numericalValue.value) {
        details.value.manualReview =
          numericalValue.value.endNumber - numericalValue.value.initNumber;
        details.value.equipQualityNumber =
          numericalValue.value.endNumber - numericalValue.value.initNumber;
      }
      const arr = [];
      if (data) {
        arr.push(
          {
            productReporting: '良品数量',
            reportedQuantity: data.finishNumber,
            unreportedQuantity: data.planNumber - data.finishNumber,
            machineCollection: data.equipQualityNumber,
          },
          {
            productReporting: '不良品数量',
            reportedQuantity: data.totalUnqualityNumber,
            unreportedQuantity: '/',
            machineCollection: data.equipUnqualityNumber,
          },
        );
      }
      resolve({ total: arr.length, items: arr });
    });
  });
}

function submit() {
  outReport({
    ...details.value,
    bindingId: props.bindingId,
    functionId: props.functionId,
    outType: details.value.outFlag,
  }).then(() => {
    message.success($t('common.successfulOperation'));
    details.value = {
      classType: 1,
      equipTime: 0,
      personTime: 0,
      manualReview: 0,
      manualReviewOfDefects: 0,
      differenceQuantity: 0,
      poorQuantityOfDifferences: 0,
      reportNumber: 0,
      unqualityNumber: 0,
    };
    connect();
    gridApi.reload();
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

const numericalValue = ref<any>({});

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
  numericalValue.value = JSON.parse(message);
  details.value.manualReview =
    numericalValue.value.endNumber - numericalValue.value.initNumber;
  details.value.equipQualityNumber =
    numericalValue.value.endNumber - numericalValue.value.initNumber;
}

function lock() {
  details.value.outFlag = 1;
  equipcatchLock({
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
    initNumber: numericalValue.value.initNumber,
    endNumber: numericalValue.value.endNumber,
  }).then(() => {
    close();
    message.success($t('common.successfulOperation'));
  });
}
// endregion

onMounted(() => {});
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
      <Col :span="24" class="pt-5">
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
        <!-- 完工出站 -->
        <Button
          type="primary"
          class="w-full"
          @click="submit()"
          v-if="showTypeNumber === 31 && details.outFlag === 1"
        >
          {{ $t('workOrderEntry.outbound') }}
        </Button>
        <!-- 暂停出站 -->
        <Button
          type="primary"
          class="w-full"
          @click="submit()"
          v-if="showTypeNumber === 31 && details.outFlag === 2"
        >
          {{ $t('workOrderEntry.suspendExit') }}
        </Button>
      </Col>
    </Row>
  </Spin>
</template>

<style scoped></style>
