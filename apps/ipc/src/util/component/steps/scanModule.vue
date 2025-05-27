<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button, Col, Input, message, Row } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { handleMaulSncode, listHCByCodeScan, snCodeHcBinding } from '#/api';
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
  return 'mr-4 inline-block w-48 p-2 text-right';
}

/**
 * 获取值的class
 */
function getValueClass() {
  return 'inline-block border p-2 text-center flex-1';
}
/**
 * 详情
 */
const details = ref<any>({});
/**
 * sn码
 */
const snCode = ref('');
/**
 * 工位号
 */
const stationNumber = ref('');
/**
 * 加载状态
 */
const spinning = ref(false);

const stationNumberRef = ref();
const snCodeRef = ref();

function queryCode() {
  spinning.value = true;
  handleMaulSncode({
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
    snCode: snCode.value,
  })
    .then((data) => {
      details.value.error = data.error;
      details.value.checkResult = data.checkResult;
      details.value.checkResultName = data.checkResultName;
      bind();
    })
    .finally(() => {
      spinning.value = false;
    });
}

function bind() {
  if (details.value.checkResult === 1 && stationNumber.value && snCode.value) {
    snCodeHcBinding({
      bindingId: props.bindingId,
      worksheetCode: props.worksheetCode,
      snCode: snCode.value,
      stationNo: stationNumber.value,
    }).then(() => {
      message.success($t('common.successfulOperation'));
      details.value = {};
      snCode.value = '';
      stationNumber.value = '';
      reload();
      stationNumberRef.value.focus();
    });
  } else {
    if (details.value.checkResult !== 1) {
      message.success($t('common.judgmentFailed'));
    } else if (!stationNumber.value) {
      stationNumberRef.value.focus();
    } else if (!snCode.value) {
      snCodeRef.value.focus();
    }
  }
}

// region 表格信息
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      title: '序号',
      type: 'seq',
      field: 'seq',
      width: 50,
      visible: props.showTypeNumber === 35,
    },
    {
      title: '工位编号',
      field: 'produceWorkshopCode',
      width: 100,
      visible: [32, 33].includes(props.showTypeNumber),
    },
    {
      field: 'qcCode',
      title: '单件SN',
      minWidth: 120,
    },
    {
      field: 'partPlanCode',
      title: '工单编号',
      minWidth: 120,
    },
    {
      field: 'partName',
      title: '产品名称',
      minWidth: 120,
    },
    {
      field: 'defectResultName',
      title: '测试结果',
      minWidth: 120,
      visible: props.showTypeNumber === 32,
    },
  ],
  height: 400,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryTableData();
      },
    },
  },
  toolbarConfig: {
    custom: false,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};
// gridApi
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

function reload() {
  gridApi.reload();
}
// region 查询数据

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryTableData() {
  return new Promise((resolve, _reject) => {
    const params: any = {
      workstationCode: props.workstationCode,
      equipCode: props.equipCode,
      worksheetCode: props.worksheetCode,
      bindingId: props.bindingId,
      functionId: props.functionId,
    };
    listHCByCodeScan(params).then(
      ({ codeRecords, stationList, totalNumber }) => {
        if (codeRecords || stationList) {
          details.value.total = totalNumber;
          resolve({
            total:
              props.showTypeNumber === 33
                ? codeRecords.length
                : stationList.length,
            items: props.showTypeNumber === 33 ? codeRecords : stationList,
          });
        } else {
          resolve({
            total: 0,
            items: [],
          });
        }
      },
    );
  });
}

// endregion

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
  gridApi.reload();
}
// endregion

onMounted(() => {});
</script>

<template>
  <Row>
    <Col :span="12" class="pt-10">
      <!-- region 单件SN码 -->
      <div class="mb-4 mr-8 flex items-center">
        <span :class="getLabelClass()">
          {{ $t('productionOperation.singlePieceSNCode') }}：
        </span>
        <span :class="getValueClass()" class="border-0">
          <Input
            ref="snCodeRef"
            v-model:value="snCode"
            class="w-[70%]"
            @keydown.enter="queryCode()"
            @focus="
              () => {
                snCode = '';
              }
            "
          />
          <ScanTheCode
            @scan-the-code="
              (val) => {
                snCode = val;
                queryCode();
              }
            "
          />
        </span>
        <Button type="link" :danger="details.checkResult === -1" v-if="details">
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
      <!-- region 校验结果 -->
      <div class="mb-4 mr-8 flex">
        <span :class="getLabelClass()">
          {{ $t('productionOperation.verificationResult') }}：
        </span>
        <span :class="getValueClass()">
          {{ details?.error || $t('productionOperation.none') }}
        </span>
      </div>
      <!-- endregion -->
      <!-- region 工位编号 -->
      <div class="mb-4 mr-8 flex" v-if="[32, 33].includes(showTypeNumber)">
        <span :class="getLabelClass()">
          {{ $t('productionOperation.workstationNumber') }}：
        </span>
        <span :class="getValueClass()" class="border-0">
          <Input
            ref="stationNumberRef"
            v-model:value="stationNumber"
            class="w-[70%]"
            @keydown.enter="bind()"
            @focus="
              () => {
                stationNumber = '';
              }
            "
          />
          <ScanTheCode
            @scan-the-code="
              (val) => {
                stationNumber = val;
                bind();
              }
            "
          />
        </span>
      </div>
      <!-- endregion -->
      <!-- region 测试结果 -->
      <div class="mb-4 mr-8 flex" v-if="showTypeNumber === 35">
        <span :class="getLabelClass()">
          {{ $t('productionOperation.testResult') }}：
        </span>
        <span :class="getValueClass()">
          {{ details?.productName || $t('productionOperation.none') }}
        </span>
      </div>
      <!-- endregion -->
      <!-- region 已生产数量 -->
      <div class="mb-4 mr-8 flex">
        <span :class="getLabelClass()">
          {{ $t('productionOperation.producedQuantity') }}：
        </span>
        <span :class="getValueClass()">
          {{ details?.total || $t('productionOperation.none') }}
        </span>
      </div>
      <!-- endregion -->
    </Col>
    <Col :span="12">
      <Grid />
    </Col>
  </Row>
</template>

<style scoped></style>
