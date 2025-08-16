<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onBeforeUnmount, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';
import { useVbenVxeGrid } from '@vben/plugins/vxe-table';

import {
  Button,
  Col,
  Input,
  message,
  Modal,
  Row,
  Spin,
  Tooltip,
} from 'ant-design-vue';

import {
  handleMaulSncode,
  hCHqCheckClear,
  listHCByCodeScan,
  mrlCheckResult,
  snCodeHcBinding,
  snCodeHcBindingCallBack,
} from '#/api';
import useWebSocket from '#/util/websocket-util';

/**
 * 定义组件的 props，用于接收父组件传递的数据
 */
const props = defineProps({
  // 工步id，用于标识具体的工步，默认为 0
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID，用于标识具体的工序，默认为 0
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号，用于标识具体的工单，默认为空字符串
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号，用于标识具体的设备，默认为空字符串
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心，用于标识具体的工作中心，默认为空字符串
  workstationCode: {
    type: String,
    default: '',
  },
  // 展示类型，用于控制页面展示的内容，默认为 0
  showTypeNumber: {
    type: Number,
    default: 0,
  },
});
// 单工位列表
const singleStationList = ref<any>([34, 35, 37]);
// 禁用扫码的工位列表
const disableScanningCodes = ref<any>([34, 37]);
// 多工位列表
const multiStationList = ref([27, 32, 33]);

/**
 * 获取标签的 class，用于统一标签的样式
 * @returns {string} 标签的 class 字符串
 */
function getLabelClass() {
  return 'mr-4 inline-block w-36 p-2 text-right';
}

/**
 * 获取值的 class
 * @returns 值的 class 字符串
 */
function getValueClass(isResult?: number) {
  let css = '';
  switch (isResult) {
    case -1: {
      css = 'bg-red-500 text-white';
      break;
    }
    case 1: {
      css = 'bg-green-500 text-[#444]';
      break;
    }
  }
  return `align-middle inline-block border rounded-xl p-2 text-center w-72 ${css}`;
}

// region 工位

/**
 * 工位号输入框的引用
 */
const stationNumberRef = ref();

/**
 * 存储从接口获取的详情数据，初始化为空对象
 */
const details = ref<any>({});
/**
 * SN 码输入框的引用
 */
const snCodeRef = ref();
// sn码
const snCode = ref('');
// 工位号
const stationNumber = ref('');
/**
 * 绑定 SN 码和工位号
 */
function bind() {
  // 当校验结果为 1 且工位号和 SN 码都存在时，进行绑定操作
  if (snCode.value && stationNumber.value) {
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
      // 重新加载表格数据
      reload();
    });
    setTimeout(() => {
      snCode.value = '';
      stationNumber.value = '';
      setTimeout(() => {
        // 聚焦到工位号输入框
        snCodeRef.value.focus();
      }, 200);
    }, 300);
  } else {
    // 工位号为空时，聚焦到工位号输入框
    if (!details.value.stationNumber) {
      stationNumberRef.value.focus();
    }
    // SN 码为空时，聚焦到 SN 码输入框
    else if (!details.value.snCode) {
      snCodeRef.value.focus();
    }
  }
}
// endregion

/**
 * 控制加载状态的响应式变量，为 true 时显示加载动画
 */
const spinning = ref<any>(false);

/**
 * 查询 SN 码信息
 * 该函数会发起异步请求处理手动输入的 SN 码，并更新详情数据和加载状态
 */
function queryCode() {
  snCodeRef.value.blur();
  if (multiStationList.value.includes(props.showTypeNumber)) {
    // 聚焦到工位号输入框
    stationNumberRef.value.focus();
  }
  // 调用 API 处理手动输入的 SN 码
  handleMaulSncode({
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
    snCode: snCode.value,
  }).then(() => {
    message.success($t('common.successfulOperation'));
    if (!multiStationList.value.includes(props.showTypeNumber)) {
      // 聚焦到 SN 码输入框
      snCodeRef.value.focus();
    }
  });
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
    },
    {
      title: '工位编号',
      field: 'produceWorkshopCode',
      width: 100,
    },
    {
      field: 'qcCode',
      title: '单件SN',
      // 列最小宽度
      minWidth: 200,
    },
    {
      field: 'partPlanCode',
      title: '工单编号',
      minWidth: 200,
    },
    {
      field: 'partCode',
      title: '产品编号',
      minWidth: 200,
    },
    {
      field: 'partName',
      title: '产品名称',
      minWidth: 200,
    },
    {
      field: 'defectResultName',
      title: '测试结果',
      minWidth: 120,
    },
    {
      field: 'action',
      title: '操作',
      fixed: 'right',
      minWidth: 150,
      visible: multiStationList.value.includes(props.showTypeNumber),
      slots: {
        default: 'action',
      },
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
  rowStyle: ({ row }) => {
    if (row.errorFlag === -1) {
      return {
        backgroundColor: '#f5222d',
        color: '#fff',
      };
    }
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

/**
 * 解绑
 * @param row
 */
function unlink(row: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消解绑!');
    },
    onOk() {
      snCodeHcBindingCallBack({
        snCode: row.qcCode,
        bindingId: props.bindingId,
        worksheetCode: row.partPlanCode,
        stationNo: row.produceWorkshopCode,
      }).then(() => {
        message.success($t('common.successfulOperation'));
        reload();
      });
    },
    title: '是否确认解绑?',
  });
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
    listHCByCodeScan(params)
      .then(({ stationList, ...d }) => {
        details.value = d;
        // 当有代码记录或工位列表时
        if (stationList) {
          // 根据展示类型返回不同的数据和总数
          resolve({
            total: stationList.length,
            items: stationList,
          });
        } else {
          // 没有数据时，返回总数为 0 和空数组
          resolve({
            total: 0,
            items: [{}],
          });
        }
      })
      .catch(() => {
        resolve({
          total: 0,
          items: [],
        });
      });
  });
}

// endregion

// region 清空

function clear() {
  // 弹出确认对话框
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      // 点击取消按钮，显示警告消息
      message.warning('已取消操作!');
    },
    onOk() {
      spinning.value = true;
      hCHqCheckClear({
        workstationCode: props.workstationCode,
        equipCode: props.equipCode,
        worksheetCode: props.worksheetCode,
        bindingId: props.bindingId,
        functionId: props.functionId,
      })
        .then(() => {
          gridApi.reload();
        })
        .finally(() => {
          spinning.value = false;
        });
    },
    title: '是否确认操作?',
  });
}

// endregion

// region websocket
/**
 * 初始化 WebSocket 连接，并传入消息处理函数和配置参数
 */
const { close: websocketClose } = useWebSocket(readMessage, {
  workstationCode: props.workstationCode,
  equipCode: props.equipCode,
  worksheetCode: props.worksheetCode,
  bindingId: props.bindingId,
  functionId: props.functionId,
  webSocketType: 5,
});

/**
 * 处理 WebSocket 接收到的消息
 * 当接收到消息时，调用 queryData 函数重新查询资源验证状态
 */
function readMessage() {
  reload();
}
// endregion

// region 判定
// 判定加载状态
const judgementLoading = ref(false);
/**
 * 判定
 * @param row
 * @param result
 */
function judgement(row: any, result: -1 | 1 = -1) {
  // 弹出确认对话框
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      // 点击取消按钮，显示警告消息
      message.warning('已取消操作!');
    },
    onOk() {
      judgementLoading.value = true;
      mrlCheckResult({
        ...row,
        checkResult: result,
        ...props,
      })
        .then(() => {
          message.success($t('common.successfulOperation'));
          reload();
        })
        .finally(() => {
          judgementLoading.value = false;
        });
    },
    title: '是否确认该操作?',
  });
}

// endregion

onBeforeUnmount(() => {
  websocketClose();
});
</script>

<template>
  <!-- 根据 spinning 的值显示加载动画 -->
  <Spin :spinning="spinning">
    <!-- 定义一个行布局 -->
    <Row>
      <Col span="24">
        <!-- 显示工单编号的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 工单编号 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.workOrderNumber') }}：
          </span>
          <!-- 显示工单编号的值，无结果时显示默认提示 -->
          <span :class="getValueClass()" class="border-0">
            {{ details.proceWorksheetCode || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- 显示产品编号的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 产品编号 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.productNumber') }}：
          </span>
          <!-- 显示产品编号的值，无结果时显示默认提示 -->
          <span :class="getValueClass()" class="border-0">
            {{ details.procePorductCode || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- 显示产品名称的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 产品名称 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.productName') }}：
          </span>
          <!-- 显示产品名称的值，无结果时显示默认提示 -->
          <span :class="getValueClass()" class="border-0">
            {{ details.proceProdutName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- 显示产品名称的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 产品名称 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.productName') }}：
          </span>
          <!-- 显示产品名称的值，无结果时显示默认提示 -->
          <span :class="getValueClass()" class="border-0">
            {{ details.proceProductModel || $t('productionOperation.none') }}
          </span>
        </div>
      </Col>
    </Row>
    <Row>
      <!-- 定义一个列，占 24 格 -->
      <Col :span="24">
        <!-- region SN扫码 -->
        <!-- 显示工单编号的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 显示工SN码标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.snCode') }}：
          </span>
          <!-- 显示工单编号的值，无结果时显示默认提示 -->
          <span :class="getValueClass()" class="border-0">
            <!-- SN 码输入框，支持回车键查询，根据展示类型决定是否禁用 -->
            <Input
              ref="snCodeRef"
              v-model:value="snCode"
              :disabled="disableScanningCodes.includes(showTypeNumber)"
              @keydown.enter="
                () => {
                  queryCode();
                }
              "
              @focus="
                () => {
                  snCode = '';
                }
              "
            />
          </span>
        </div>
        <!-- endregion -->
        <!-- region 工位扫码 -->
        <!-- 显示工位扫码的容器 -->
        <div
          class="mb-4 mr-8 inline-block"
          v-if="multiStationList.includes(showTypeNumber)"
        >
          <!-- 显示工SN码标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.workstationNumber') }}：
          </span>
          <!-- 显示工单编号的值，无结果时显示默认提示 -->
          <span :class="getValueClass()" class="border-0">
            <!-- 工位编号输入框，支持回车键绑定，聚焦时清空输入  多工位时显示 -->
            <Input
              ref="stationNumberRef"
              v-model:value="stationNumber"
              :disabled="showTypeNumber === 39"
              @keydown.enter="bind()"
              @focus="
                () => {
                  stationNumber = '';
                }
              "
            />
          </span>
        </div>
        <!-- endregion -->
      </Col>
      <!-- 定义一个列，占 24 格 -->
      <Col :span="24">
        <!-- region 工单编号 -->
        <!-- 显示工单编号的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 显示工单编号标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.workOrderNumber') }}：
          </span>
          <!-- 显示工单编号的值，无结果时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.worksheetCode || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion -->
        <!-- region 产品名称 -->
        <!-- 显示产品名称的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 显示产品名称标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.productName') }}：
          </span>
          <!-- 显示产品名称的值，无结果时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.productName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion -->

        <!-- region 已生产数量 -->
        <!-- 显示已生产数量 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 显示已生产数量标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.producedQuantity') }}：
          </span>
          <!-- 显示已生产数量值，无结果时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details?.totalNumber || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion -->
      </Col>

      <!-- 定义一个列，占 24 格 -->
      <Col :span="24">
        <!-- region SN扫码 -->
        <!-- 显示工单编号的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 显示工SN码标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.snCode') }}：
          </span>
          <!-- 显示工单编号的值，无结果时显示默认提示 -->
          <span :class="getValueClass()">
            {{ details.snCode || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion -->
        <!-- region 工位扫码 -->
        <!-- 显示工位扫码的容器 -->
        <div class="mb-4 mr-8 inline-block">
          <!-- 显示工SN码标签 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.workstationNumber') }}：
          </span>
          <!-- 显示工单编号的值，无结果时显示默认提示 -->
          <span :class="getValueClass()">
            <!-- 多工位时显示 -->
            <span v-if="multiStationList.includes(showTypeNumber)">
              {{ details.stationNo || $t('productionOperation.none') }}
            </span>
            <!-- 单工位时显示 -->
            <span v-if="singleStationList.includes(showTypeNumber)"> 1# </span>
            <span v-else> {{ $t('productionOperation.none') }} </span>
          </span>
        </div>
        <!-- endregion -->

        <!-- 定义一个列，占 24 格 -->
        <Col :span="24">
          <!-- region  SN校验 -->
          <!-- 显示 SN校验的容器 -->
          <div class="mb-4 mr-8 inline-block">
            <!-- 显示 SN校验 标签 -->
            <span :class="getLabelClass()">
              {{ $t('productionOperation.snVerification') }}：
            </span>
            <!-- 显示SN校验的值，无结果时显示默认提示 -->
            <span :class="getValueClass(details.checkResult)">
              {{ details.error || $t('productionOperation.none') }}
            </span>
          </div>
          <!-- endregion -->
          <!-- region 产品名称 -->
          <!-- 显示 工位校验 的容器 -->
          <div class="mb-4 mr-8 inline-block">
            <!-- 显示工位校验标签 -->
            <span :class="getLabelClass()">
              {{ $t('productionOperation.workstationVerification') }}：
            </span>
            <!-- 显示工位校验的值，无结果时显示默认提示 -->
            <span :class="getValueClass(details.stationCheckResult)">
              {{ details.stationError || $t('productionOperation.none') }}
            </span>
          </div>
          <!-- endregion -->

          <!-- region 设备联锁 -->
          <!-- 显示设备联锁 -->
          <div class="mb-4 mr-8 inline-block">
            <!-- 显示设备联锁标签 -->
            <span :class="getLabelClass()">
              {{ $t('productionOperation.equipmentInterlocking') }}：
            </span>
            <!-- 显示设备联锁，无结果时显示默认提示 -->
            <span :class="getValueClass(details.errorType)">
              {{ details?.errorFlagName || $t('productionOperation.none') }}
            </span>
          </div>
          <!-- endregion -->
        </Col>
      </Col>
    </Row>
    <Grid>
      <template #toolbar-actions>
        <Button type="primary" @click="clear()">
          {{ $t('common.clear') }}
        </Button>
      </template>
      <template #action="{ row }">
        <!-- 解绑 -->
        <Tooltip v-if="[32, 33].includes(showTypeNumber)">
          <template #title>{{ $t('productionOperation.unbind') }}</template>
          <Button type="link" @click="unlink(row)">
            <IconifyIcon
              icon="carbon:unlink"
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </Tooltip>
        <!-- 合格 -->
        <Tooltip v-if="[27].includes(showTypeNumber)">
          <template #title>{{ $t('productionOperation.qualified') }}</template>
          <Button
            type="link"
            @click="judgement(row, 1)"
            :loading="judgementLoading"
          >
            <IconifyIcon
              icon="mdi:check"
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </Tooltip>
        <!-- 不合格 -->
        <Tooltip v-if="[27].includes(showTypeNumber)">
          <template #title>
            {{ $t('productionOperation.unqualified') }}
          </template>
          <Button
            type="link"
            @click="judgement(row)"
            :loading="judgementLoading"
            :disabled="row.errorFlag !== 1 && row.defectResult !== 0"
          >
            <IconifyIcon
              icon="mdi:times"
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </Tooltip>
      </template>
    </Grid>
  </Spin>
</template>

<style scoped></style>
