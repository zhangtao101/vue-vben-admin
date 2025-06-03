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

/**
 * 定义组件的 props
 */
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
 * 获取标签的 class
 * @returns 标签的 class 字符串
 */
function getLabelClass() {
  return 'mr-4 inline-block w-48 p-2 text-right';
}

/**
 * 获取值的 class
 * @returns 值的 class 字符串
 */
function getValueClass() {
  return 'inline-block border p-2 text-center flex-1';
}

/**
 * 详情数据，用于存储查询结果
 */
const details = ref<any>({});
/**
 * 存储 SN 码
 */
const snCode = ref('');
/**
 * 存储工位号
 */
const stationNumber = ref('');
/**
 * 加载状态，用于控制加载动画的显示
 */
const spinning = ref(false);

/**
 * 工位号输入框的引用
 */
const stationNumberRef = ref();
/**
 * SN 码输入框的引用
 */
const snCodeRef = ref();

/**
 * 查询 SN 码信息
 */
function queryCode() {
  // 设置加载状态为 true，显示加载动画
  spinning.value = true;
  // 调用 API 处理手动输入的 SN 码
  handleMaulSncode({
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
    snCode: snCode.value,
  })
    .then((data) => {
      // 将 API 返回的错误信息、校验结果和结果名称存储到详情数据中
      details.value.error = data.error;
      details.value.checkResult = data.checkResult;
      details.value.checkResultName = data.checkResultName;
      // 调用绑定函数
      bind();
    })
    .finally(() => {
      // 无论请求成功或失败，都将加载状态设置为 false，隐藏加载动画
      spinning.value = false;
    });
}

/**
 * 绑定 SN 码和工位号
 */
function bind() {
  // 当校验结果为 1 且工位号和 SN 码都存在时，进行绑定操作
  if (details.value.checkResult === 1 && stationNumber.value && snCode.value) {
    // 调用 API 进行 SN 码和工位号的绑定
    snCodeHcBinding({
      bindingId: props.bindingId,
      worksheetCode: props.worksheetCode,
      snCode: snCode.value,
      stationNo: stationNumber.value,
    }).then(() => {
      // 绑定成功后，显示成功提示信息
      message.success($t('common.successfulOperation'));
      // 清空详情数据、SN 码和工位号
      details.value = {};
      snCode.value = '';
      stationNumber.value = '';
      // 重新加载表格数据
      reload();
      // 聚焦到工位号输入框
      stationNumberRef.value.focus();
    });
  } else {
    // 校验结果不为 1 时，显示判断失败提示信息
    if (details.value.checkResult !== 1) {
      message.success($t('common.judgmentFailed'));
    }
    // 工位号为空时，聚焦到工位号输入框
    else if (!stationNumber.value) {
      stationNumberRef.value.focus();
    }
    // SN 码为空时，聚焦到 SN 码输入框
    else if (!snCode.value) {
      snCodeRef.value.focus();
    }
  }
}

// region 表格信息
/**
 * 表格配置选项
 */
const gridOptions: VxeGridProps<any> = {
  // 表格内容居中对齐
  align: 'center',
  // 显示表格边框
  border: true,
  // 表格列配置
  columns: [
    {
      // 列标题
      title: '序号',
      // 列类型为序号列
      type: 'seq',
      // 列字段名
      field: 'seq',
      // 列宽度
      width: 50,
      // 根据展示类型决定是否显示该列
      visible: props.showTypeNumber === 35,
    },
    {
      title: '工位编号',
      field: 'produceWorkshopCode',
      width: 100,
      // 根据展示类型决定是否显示该列
      visible: [32, 33].includes(props.showTypeNumber),
    },
    {
      field: 'qcCode',
      title: '单件SN',
      // 列最小宽度
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
      // 根据展示类型决定是否显示该列
      visible: props.showTypeNumber === 32,
    },
  ],
  // 表格高度
  height: 400,
  // 显示斑马纹
  stripe: true,
  // 排序配置，支持多列排序
  sortConfig: {
    multiple: true,
  },
  // 代理配置，用于异步查询数据
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryTableData();
      },
    },
  },
  // 工具栏配置
  toolbarConfig: {
    // 不显示自定义按钮
    custom: false,
    // 不显示导入按钮
    // import: true,
    // 不显示导出按钮
    // export: true,
    // 显示刷新按钮
    refresh: true,
    // 显示缩放按钮
    zoom: true,
  },
};
// 初始化 VxeGrid 组件和 API
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/**
 * 重新加载表格数据
 */
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
    // 定义请求参数
    const params: any = {
      workstationCode: props.workstationCode,
      equipCode: props.equipCode,
      worksheetCode: props.worksheetCode,
      bindingId: props.bindingId,
      functionId: props.functionId,
    };
    // 调用 API 查询数据
    listHCByCodeScan(params).then(
      ({ codeRecords, stationList, totalNumber }) => {
        // 当有代码记录或工位列表时
        if (codeRecords || stationList) {
          // 将总数量存储到详情数据中
          details.value.total = totalNumber;
          // 根据展示类型返回不同的数据和总数
          resolve({
            total:
              props.showTypeNumber === 33
                ? codeRecords.length
                : stationList.length,
            items: props.showTypeNumber === 33 ? codeRecords : stationList,
          });
        } else {
          // 没有数据时，返回总数为 0 和空数组
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
// 初始化 WebSocket 连接，并传入消息处理函数和配置参数
useWebSocket(readMessage, {
  workstationCode: props.workstationCode,
  equipCode: props.equipCode,
  worksheetCode: props.worksheetCode,
  bindingId: props.bindingId,
  functionId: props.functionId,
  webSocketType: 5,
});

/**
 * 处理 WebSocket 接收到的消息
 */
function readMessage() {
  // 当接收到消息时，重新加载表格数据
  gridApi.reload();
}
// endregion

// 组件挂载后执行的钩子函数
onMounted(() => {});
</script>

<template>
  <Row>
    <Col :span="12" class="pt-10">
      <!-- region 单件SN码 -->
      <!-- 显示单件 SN 码输入框和扫码组件 -->
      <div class="mb-4 mr-8 flex items-center">
        <!-- 显示单件 SN 码标签 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.singlePieceSNCode') }}：
        </span>
        <span :class="getValueClass()" class="border-0">
          <!-- SN 码输入框，支持回车键查询，聚焦时清空输入 -->
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
          <!-- 扫码组件，扫码成功后将结果赋值给 SN 码并查询 -->
          <ScanTheCode
            @scan-the-code="
              (val) => {
                snCode = val;
                queryCode();
              }
            "
          />
        </span>
        <!-- 根据校验结果显示不同的图标 -->
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
      <!-- 显示校验结果 -->
      <div class="mb-4 mr-8 flex">
        <!-- 显示校验结果标签 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.verificationResult') }}：
        </span>
        <!-- 显示校验结果值，无结果时显示默认提示 -->
        <span :class="getValueClass()">
          {{ details?.error || $t('productionOperation.none') }}
        </span>
      </div>
      <!-- endregion -->
      <!-- region 工位编号 -->
      <!-- 根据展示类型显示工位编号输入框和扫码组件 -->
      <div class="mb-4 mr-8 flex" v-if="[32, 33].includes(showTypeNumber)">
        <!-- 显示工位编号标签 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.workstationNumber') }}：
        </span>
        <span :class="getValueClass()" class="border-0">
          <!-- 工位编号输入框，支持回车键绑定，聚焦时清空输入 -->
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
          <!-- 扫码组件，扫码成功后将结果赋值给工位编号并绑定 -->
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
      <!-- 根据展示类型显示测试结果 -->
      <div class="mb-4 mr-8 flex" v-if="showTypeNumber === 35">
        <!-- 显示测试结果标签 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.testResult') }}：
        </span>
        <!-- 显示测试结果值，无结果时显示默认提示 -->
        <span :class="getValueClass()">
          {{ details?.productName || $t('productionOperation.none') }}
        </span>
      </div>
      <!-- endregion -->
      <!-- region 已生产数量 -->
      <!-- 显示已生产数量 -->
      <div class="mb-4 mr-8 flex">
        <!-- 显示已生产数量标签 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.producedQuantity') }}：
        </span>
        <!-- 显示已生产数量值，无结果时显示默认提示 -->
        <span :class="getValueClass()">
          {{ details?.total || $t('productionOperation.none') }}
        </span>
      </div>
      <!-- endregion -->
    </Col>
    <Col :span="12">
      <!-- 显示表格组件 -->
      <Grid />
    </Col>
  </Row>
</template>

<style scoped></style>
