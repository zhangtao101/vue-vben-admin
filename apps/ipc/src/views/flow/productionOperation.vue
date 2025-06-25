<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';
import { IconifyIcon, MdiChevronDown, MdiChevronUp } from '@vben/icons';
import { $t } from '@vben/locales';

import { DownOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Col,
  Dropdown,
  InputNumber,
  Menu,
  MenuItem,
  message,
  Modal,
  RadioButton,
  RadioGroup,
  Row,
  Select,
  Spin,
  Tooltip,
} from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { Enum } from 'enum-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getSheetProces,
  obtainTheListOfProcessEquipment,
  obtainTheWorkOrderList,
  sheetReady,
  sheetWorking,
  workstationListAcquisition,
} from '#/api';
import InterlockingConfiguration from '#/util/component/interlockingConfiguration.vue';
import OperationalMatters from '#/util/component/operationalMatters.vue';
import PersonnelOperation from '#/util/component/personnelOperation.vue';
import StepExecution from '#/util/component/stepExecution.vue';
import useWebSocket from '#/util/websocket-util';
// region 图标
const iconEnum: any = Enum({
  SOP查看: {
    label: 'SOP查看',
    value: 'mdi:eye-outline',
  },
  安灯: {
    label: '安灯',
    value: 'mdi:alarm-light',
  },
  质量检验: {
    label: '质量检验',
    value: 'mdi:quality-medium',
  },
  工序过程操作: {
    label: '工序过程操作',
    value: 'fluent-mdl2:processing-run',
  },
  资源指派: {
    label: '资源指派',
    value: 'mdi:resize',
  },
});
// endregion
// region 工作站查询信息
// 工作站列表
const listOfProductionLines = ref([]);
// 当前选中的工作站
const selectedWorkstation = ref();

/**
 * 查询工作站列表
 * 1. 调用工作站列表获取接口
 * 2. 设置默认选中第一个工作站
 * 3. 触发工艺设备列表查询
 */
function queryListOfProductionLines() {
  workstationListAcquisition().then((data) => {
    listOfProductionLines.value = data; // 更新工作站列表数据
    // 初始化默认选中项：当未选择工作站时，自动选中第一个工作站
    if (selectedWorkstation.value === undefined) {
      // 取第一个工作站的编码作为默认值
      selectedWorkstation.value = data[0].workstationCode;
    }
    // 触发关联的工艺设备查询
    queryProcessEquipment();
  });
}

/**
 * 工作站选择变更处理
 * 当用户切换工作站时触发，用于：
 * 1. 清空当前工艺设备选择
 * 2. 重新加载工艺设备列表
 * 3. 刷新关联的工单数据
 */
function selectedWorkstationChange() {
  // 触发工艺设备查询流程
  queryProcessEquipment();
}

// 艺设备列表
const listOfProcesses = ref([]);
// 选中的工艺设备
const theSelectedProcessEquipment = ref();

/**
 * 查询工艺设备列表
 * 1. 清空当前选择的工艺设备
 * 2. 调用接口获取指定工作站的设备列表
 * 3. 更新工艺设备数据并触发工单查询
 */
function queryProcessEquipment() {
  // 重置当前选择的设备
  theSelectedProcessEquipment.value = undefined;
  // 调用接口获取指定工作站的设备列表
  obtainTheListOfProcessEquipment({
    // 使用当前选中的工作站编码
    workstationCode: selectedWorkstation.value,
  }).then((data) => {
    // 更新工艺设备列表数据
    listOfProcesses.value = data;
    // 保持设备选择为空状态
    theSelectedProcessEquipment.value = undefined;
    // 触发工单数据重新加载
    query();
  });
}
// endregion

// region 全局操作
// 设备联锁配置ref对象
const interlockingConfigurationRef = ref();

/**
 * 显示设备联锁配置
 */
function showInterlockingConfiguration() {
  interlockingConfigurationRef.value.open();
}

// endregion

// region 作业信息

// region 收缩
// 作业信息是否收缩
const jobInformationContraction = ref(false);

/**
 * 作业信息收缩展开
 */
function jobInformationContractionChange() {
  jobInformationContraction.value = !jobInformationContraction.value;
}
// endregion

// region 表格

const gridOptions: VxeGridProps<any> = {
  align: 'center', // 设置所有列内容水平居中显示
  border: true, // 显示表格边框线
  rowConfig: {
    isHover: true, // 启用行悬停高亮效果
  },
  radioConfig: {
    trigger: 'row',
  },
  rowClassName: () => {
    return 'text-lg';
  },
  headerRowClassName: () => {
    return 'text-xl';
  },
  columns: [
    {
      type: 'radio',
      minWidth: 60,
    },
    {
      field: 'worksheetCode',
      title: '工单号',
      minWidth: 180,
    },
    {
      field: 'productCode',
      title: '产品编号',
      minWidth: 200,
    },
    {
      field: 'productName',
      title: '产品名称',
      minWidth: 200,
    },
    {
      field: 'opInTime',
      title: '进站时间',
      minWidth: 200,
    },
    {
      field: 'processCode',
      title: '工序编号',
      minWidth: 200,
    },
    {
      field: 'processName',
      title: '工序名称',
      minWidth: 200,
    },
    {
      field: 'finishRate',
      title: '工单进度',
      minWidth: 200,
    },
    {
      field: 'reportTypeName',
      title: '进站模式',
      minWidth: 120,
    },
    {
      field: 'sendStateName',
      title: '工单状态',
      minWidth: 120,
      sortable: true,
    },
    {
      field: 'readyStateName',
      title: '就绪状态',
      minWidth: 120,
      sortable: true,
    },
    {
      field: 'planNumber',
      title: '计划数量',
      minWidth: 120,
    },
    {
      field: 'workOrderOperation',
      title: '工单操作',
      minWidth: 120,
      slots: {
        default: 'workOrderOperation',
      },
      fixed: 'right',
    },
  ],
  height: 200,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  pagerConfig: {
    enabled: false,
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryData();
      },
    },
  },
};
// 选中的工单
const theSelectedWorkOrder = ref<any>({});
const gridEvents: any = {
  radioChange: ({ newValue }: any) => {
    theSelectedWorkOrder.value = newValue;
    processRouteList.value = [];
    theSelectedOperation.value = undefined;
    queryProcess(selectedWorkstation.value, newValue.worksheetCode);
  },
};
// gridApi
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 选中表格中的指定行
 * @param worksheetCode - 工单号（可选参数，默认为空字符串）
 * @description
 * - 如果提供了工单号，则在表格数据中查找对应的行并选中。
 * - 如果未提供工单号，则默认选中表格的第一行。
 * - 选中行后，更新选中的工单信息，并触发工艺路线查询。
 */
function setRadioByKey(worksheetCode: string = '') {
  // 延迟 500 毫秒执行，确保表格数据已经加载完成
  setTimeout(() => {
    // 获取表格数据
    const { tableData } = gridApi.grid.getTableData();
    // 根据工单号查找对应的行，如果未提供工单号，则默认选中第一行
    const row = worksheetCode
      ? tableData.find((item: any) => item.worksheetCode === worksheetCode) // 查找匹配工单号的行
      : tableData[0]; // 如果未提供工单号，则选中第一行
    // 设置表格的选中行
    gridApi.grid.setRadioRow(row);
    // 更新选中的工单信息
    theSelectedWorkOrder.value = row;
    // 根据选中的工单号查询工艺路线
    queryProcess(selectedWorkstation.value, row.worksheetCode);
  }, 500);
}

/**
 * 查询数据
 * 这个函数用于：
 * 1. 构建包含设备编码和工作站编码的查询参数
 * 2. 调用工单列表接口获取数据
 * 3. 自动选中首条工单记录
 * 4. 返回适配vxe-table的分页数据结构
 */
function queryData() {
  return new Promise((resolve, _reject) => {
    const params: any = {
      worksheetCode: '', // 工单号（留空查询全部）
      equipCode: theSelectedProcessEquipment.value, // 当前选中的工艺设备编码
      workstationCode: selectedWorkstation.value, // 当前选择的工作站编码
    };

    obtainTheWorkOrderList(params)
      .then((data) => {
        // 当有数据时自动选中第一条记录
        if (data.length > 0) {
          // 根据工单号设置选中状态
          setRadioByKey(data[0].worksheetCode);
        }
        // 返回vxe-table要求的格式
        resolve({
          total: data.length, // 数据总条数
          items: data, // 当前页数据集合
        });
      })
      .catch((error) => {
        _reject(error); // 将错误传递给调用方
      });
  });
}

/**
 * 查询表格数据
 */
function query() {
  processRouteList.value = [];
  checkedProcess.value = -1;
  checkedProcessId.value = 0;
  theSelectedOperation.value = '';
  listOfOperationItems.value = [];

  gridApi.reload();
}

// region websocket
/**
 * 初始化 WebSocket 连接，并传入消息处理函数和配置参数
 */
useWebSocket(readMessageTable, {
  webSocketType: 2,
});

/**
 * 处理 WebSocket 接收到的消息
 * 当接收到消息时，调用 queryData 函数重新查询资源验证状态
 */
function readMessageTable() {
  query();
}
// endregion

// endregion

// endregion

// region 就绪操作

/**
 * 处理就绪状态变更的确认操作
 * @param row - 当前操作的行数据，包含工单详细信息
 * @param type - 操作类型 (1: 就绪 / 2: 撤回就绪)
 * @description 该函数用于：
 * 1. 显示确认对话框询问用户是否执行操作
 * 2. 当用户确认后调用 sheetReady 接口提交状态变更
 * 3. 操作成功后刷新表格数据并显示提示信息
 */
function ready(row: any, type: number) {
  Modal.confirm({
    cancelText: '取消', // 取消按钮文本
    okText: '确认', // 确认按钮文本
    okType: 'danger', // 确认按钮危险样式
    onCancel() {
      // 取消操作回调
      message.warning('已取消操作!');
    },
    onOk() {
      // 确认操作回调
      sheetReady({
        // 调用就绪状态接口
        id: row.id, // 工单ID来自当前行数据
        readyState: type, // 使用传入的操作类型
      }).then(() => {
        // 显示操作成功的提示信息
        message.success($t('common.successfulOperation'));
        gridApi.reload(); // 重新加载表格数据
      });
    },
    title: '是否确认该操作?', // 对话框标题
  });
}

// endregion

// region 人员操作
const personnelOperationRef = ref();
// endregion

// region 工单操作

/**
 * 工单操作
 * @param row
 * @param type 1: 开工 2: 完工 3: 暂停
 */
function workOrderOperation(row: any, type: number) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消操作!');
    },
    onOk() {
      sheetWorking({
        id: row.id,
        workingState: type,
      }).then(() => {
        // 显示操作成功的提示信息
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
    title: '是否确认该操作?',
  });
}

// endregion

// endregion

// region 工艺路线
// region 收缩
// 工艺路线是否收缩
const processShrinkage = ref(true);

/**
 * 作业信息收缩展开
 */
function processShrinkageChange() {
  processShrinkage.value = !processShrinkage.value;
}
// endregion
// 工艺路线列表
const processRouteList = ref<any>([]);
// 当前选中的工艺路线
const checkedProcess = ref(1);
// 当前选中的工艺路线ID
const checkedProcessId = ref(0);
// 当前选中的工单
const theCurrentlySelectedWorkOrderNumber = ref('');
// 工艺路线列表加载状态
const processRouteListLoading = ref(false);

/**
 * 查询工艺路线
 * @param workstationCode 工作站编码
 * @param worksheetCode 工单编码
 */
function queryProcess(workstationCode: string, worksheetCode: string) {
  theCurrentlySelectedWorkOrderNumber.value = worksheetCode;
  processRouteListLoading.value = true;
  getSheetProces({
    workstationCode,
    worksheetCode,
  })
    .then((data) => {
      processRouteList.value = data;
      checkedProcess.value = processRouteList.value[0].processCode;
      processChange(processRouteList.value[0]);
    })
    .finally(() => {
      processRouteListLoading.value = false;
    });
}

// 当前工步
const currentWorkingStep = ref<any>();
/**
 * 工艺路线切换
 * @param val
 */
function workStepConversion(val: any) {
  currentWorkingStep.value = {
    ...val,
  };
}

// region websocket
/**
 * 初始化 WebSocket 连接，并传入消息处理函数和配置参数
 */
const { close: websocketClose } = useWebSocket(readMessage, {
  webSocketType: 3,
});

/**
 * 处理 WebSocket 接收到的消息
 * 当接收到消息时，调用 queryData 函数重新查询资源验证状态
 */
function readMessage() {
  queryProcess(
    selectedWorkstation.value,
    theSelectedWorkOrder.value.worksheetCode,
  );
}
// endregion
// endregion

// region 操作事项
// region 收缩
// 操作事项是否收缩
const operationEventShrinkage = ref(true);

/**
 * 作业信息收缩展开
 */
function operationEventShrinkageChange() {
  operationEventShrinkage.value = !operationEventShrinkage.value;
}
// endregion
// 选中的操作事项
const theSelectedOperation = ref<any>('');
// 操作事项列表
const listOfOperationItems = ref<any>([]);
// 类型 1: 有序 2: 无序
const ruleType = ref<any>([]);

/**
 * 工艺路线切换
 * @param item - 当前选中的工艺路线项，包含工艺路线的详细信息
 */
function processChange(item: any) {
  // 更新当前选中的工艺路线代码
  checkedProcess.value = item.processCode;

  // 更新当前选中的工艺路线绑定 ID
  checkedProcessId.value = item.bindingId;

  // 更新操作项列表，使用当前工艺路线的详细操作步骤
  listOfOperationItems.value = item.details;

  // 默认选中当前工艺路线的第一个操作项
  theSelectedOperation.value = item.details[0].id;

  // 更新当前选中操作项的规则类型
  ruleType.value = item.details[0].ruleType;
}

// endregion

// region 工步执行
// region 收缩
// 工步执行是否收缩（true: 折叠状态，false: 展开状态）
const workStepExecutionContraction = ref(true);

/**
 * 切换工步执行区域展开/折叠状态
 * 通过取反当前收缩状态值实现展开折叠切换
 */
function workStepExecutionContractionChange() {
  workStepExecutionContraction.value = !workStepExecutionContraction.value;
}
// endregion

// endregion

// region 页面缩放
// 定义一个响应式变量，用于存储当前的缩放比例，默认值为 80（表示 80% 的缩放比例）
const zoomSize = ref(100);

// 定义一个响应式变量，用于存储需要缩放的页面对象（DOM 元素）
const page = ref();

/**
 * 设置页面的缩放比例
 * @param size - 缩放比例值（百分比形式，如 80 表示 80%）
 * @description
 * - 该函数通过修改页面对象的 `style.zoom` 属性来实现缩放效果。
 * - `size` 参数是一个数字，表示缩放比例的百分比值。
 */
function zoom(size: any) {
  // 将缩放比例值设置到页面对象的 `style.zoom` 属性中，格式为百分比字符串
  page.value.style.zoom = `${size}%`;
}

watch(theSelectedOperation, () => {
  currentWorkingStep.value = {};
});
// endregion

// 在组件挂载完成后执行的操作
onMounted(() => {
  // 查询生产线列表
  queryListOfProductionLines();
  // 根据当前的缩放比例值（zoomSize.value）设置页面的缩放
  zoom(zoomSize.value);
});

// 在组件卸载前执行的操作
onBeforeUnmount(() => {
  // 将页面缩放比例重置为 100%，确保组件卸载后页面恢复默认缩放比例
  zoom(100);
  websocketClose();
});
</script>

<template>
  <!-- 页面容器组件 -->
  <Page>
    <!-- 固定在页面右上角的缩放控件 -->
    <div class="fixed right-[20px] top-[110px] z-[999]">
      <!-- 输入数字组件，用于调整页面缩放比例 -->
      <InputNumber
        v-model:value="zoomSize"
        :min="50"
        :max="200"
        :formatter="(value: any) => `${value}%`"
        :parser="(value: any) => value.replace('%', '')"
        @change="zoom"
      />
    </div>
    <!-- 页面主体内容容器，引用 page 用于缩放操作 -->
    <div ref="page" class="w-full">
      <!-- region 工作站查询信息 -->
      <!-- 行容器，用于布局工作站查询相关元素 -->
      <Row class="mb-4">
        <!-- 列容器，占据 23 格宽度 -->
        <Col :span="24" class="flex">
          <!-- 显示工作站标题，带有蓝色边框 -->
          <span
            class="h-8 w-36 border-l-4 border-sky-500 pl-4 text-xl font-black"
          >
            {{ $t('productionOperation.homeworkStation') }}
          </span>

          <!-- 包含工作站选择、设备选择和操作按钮的容器 -->
          <div class="w-full pl-4">
            <!-- 工作站选择下拉框 -->
            <Select
              v-model:value="selectedWorkstation"
              :options="listOfProductionLines"
              :field-names="{
                label: 'workstationName',
                value: 'workstationCode',
              }"
              @change="selectedWorkstationChange"
              class="mr-4 !w-64"
            />
            <!-- 工艺设备选择下拉框，允许清空选择 -->
            <Select
              v-model:value="theSelectedProcessEquipment"
              :options="listOfProcesses"
              :field-names="{
                label: 'equipmentName',
                value: 'equipmentCode',
              }"
              @change="query()"
              class="!w-64"
              allow-clear
            />
            <!-- 人员操作下拉菜单 -->
            <Dropdown>
              <!-- 下拉菜单内容 -->
              <template #overlay>
                <Menu>
                  <!-- 上工菜单项 -->
                  <MenuItem @click="personnelOperationRef.open(1)">
                    {{ $t('common.theUserGoesToWork') }}
                  </MenuItem>
                  <!-- 下工菜单项 -->
                  <MenuItem @click="personnelOperationRef.open(2)">
                    {{ $t('common.theUserIsOffWork') }}
                  </MenuItem>
                </Menu>
              </template>
              <!-- 下拉菜单触发按钮 -->
              <Button type="primary" class="ml-3 mr-3">
                {{ $t('productionOperation.personnelOperation') }}
                <DownOutlined class="ml-4 inline-block" />
              </Button>
            </Dropdown>
            <!-- 操作配置下拉菜单 -->
            <Dropdown>
              <!-- 下拉菜单内容 -->
              <template #overlay>
                <Menu>
                  <!-- 联锁配置菜单项 -->
                  <MenuItem @click="showInterlockingConfiguration()">
                    {{ $t('productionOperation.interlockConfiguration') }}
                  </MenuItem>
                  <!-- 全局清洗菜单项 -->
                  <MenuItem
                    @click="showInterlockingConfiguration()"
                    v-if="false"
                  >
                    {{ $t('productionOperation.globalCleaning') }}
                  </MenuItem>
                </Menu>
              </template>
              <!-- 下拉菜单触发按钮 -->
              <Button type="primary" class="ml-3 mr-3">
                {{ $t('productionOperation.allOperations') }}
                <DownOutlined class="ml-4 inline-block" />
              </Button>
            </Dropdown>
          </div>
        </Col>
      </Row>
      <!-- 分割线 -->
      <hr class="mb-4" />
      <!-- endregion -->

      <!--- region 作业信息 -->
      <!-- 行容器，用于布局作业信息标题和收缩按钮 -->
      <Row class="mb-4">
        <!-- 列容器，占据 23 格宽度，显示作业信息标题 -->
        <Col :span="23" class="flex">
          <span class="border-l-4 border-sky-500 pl-4 text-xl font-black">
            {{ $t('productionOperation.jobInformation') }}
          </span>
        </Col>
        <!-- 列容器，占据 1 格宽度，显示收缩/展开按钮 -->
        <Col :span="1">
          <!-- 展开按钮 -->
          <MdiChevronDown
            class="float-right inline-block cursor-pointer text-xl"
            v-if="!jobInformationContraction"
            @click="jobInformationContractionChange"
          />
          <!-- 收缩按钮 -->
          <MdiChevronUp
            class="float-right inline-block cursor-pointer text-xl"
            v-else
            @click="jobInformationContractionChange"
          />
        </Col>
      </Row>
      <!-- 卡片容器，当作业信息未收缩时显示 -->
      <Card class="mb-5" v-if="!jobInformationContraction">
        <!-- 表格组件 -->
        <Grid>
          <!-- 表格工具栏插槽，留空 -->
          <template #toolbar-tools> </template>
          <!-- 就绪操作插槽，根据工单就绪状态显示不同按钮 -->
          <template #readyOperation="{ row }">
            <!-- 就绪按钮，当工单未就绪时显示 -->
            <Tooltip v-if="row.readyState === 0">
              <template #title>{{ $t('common.beInOrder') }}</template>
              <Button type="link" @click="ready(row, 1)">
                <IconifyIcon
                  icon="mdi:timer-sand-complete"
                  class="inline-block size-6"
                />
              </Button>
            </Tooltip>
            <!-- 就绪撤回按钮，当工单已就绪时显示 -->
            <Tooltip v-if="row.readyState === 1">
              <template #title>{{ $t('common.readyToWithdraw') }}</template>
              <Button type="link" @click="ready(row, 2)">
                <IconifyIcon
                  icon="fluent-mdl2:return-to-session"
                  class="inline-block size-6"
                />
              </Button>
            </Tooltip>
          </template>
          <!-- 工单操作插槽，显示更多操作下拉菜单 -->
          <template #workOrderOperation="{ row }">
            <!-- 更多操作提示框 -->
            <Tooltip>
              <template #title>{{ $t('common.more') }}</template>
              <!-- 下拉菜单 -->
              <Dropdown>
                <!-- 下拉菜单内容 -->
                <template #overlay>
                  <Menu>
                    <!-- 开工菜单项，满足条件时可用 -->
                    <MenuItem
                      @click="workOrderOperation(row, 1)"
                      :disabled="row.sendState === 4"
                      v-if="
                        row.reportType === 1 &&
                        row.workButtonFlag === 1 &&
                        row.sendState === 1
                      "
                    >
                      {{ $t('common.startWork') }}
                    </MenuItem>
                    <!-- 就绪按钮菜单项，满足条件时显示 -->
                    <MenuItem
                      @click="ready(row, 1)"
                      v-if="row.workButtonFlag === 2 && row.readyState === 0"
                    >
                      {{ $t('common.beInOrder') }}
                    </MenuItem>
                    <!-- 就绪撤回菜单项，满足条件时显示 -->
                    <MenuItem
                      @click="ready(row, 2)"
                      v-if="row.workButtonFlag === 2 && row.readyState === 1"
                    >
                      {{ $t('common.readyToWithdraw') }}
                    </MenuItem>
                    <!-- 完工菜单项，满足条件时可用 -->
                    <MenuItem
                      @click="workOrderOperation(row, 2)"
                      :disabled="row.sendState === 2"
                      v-if="row.reportType === 1 && row.sendState !== 1"
                    >
                      {{ $t('common.completed') }}
                    </MenuItem>
                    <!-- 暂停菜单项，满足条件时可用 -->
                    <MenuItem
                      @click="workOrderOperation(row, 3)"
                      :disabled="row.sendState === 3"
                      v-if="row.sendState !== 1"
                    >
                      {{ $t('common.pause') }}
                    </MenuItem>
                    <!-- 强制下线菜单项，满足条件时可用 -->
                    <MenuItem
                      @click="workOrderOperation(row, 5)"
                      :disabled="row.sendState === 5"
                      v-if="row.sendState !== 1"
                    >
                      {{ $t('common.forcedOffline') }}
                    </MenuItem>
                  </Menu>
                </template>
                <!-- 下拉菜单触发按钮 -->
                <Button type="link">
                  更多操作
                  <DownOutlined class="ml-4 inline-block" />
                </Button>
              </Dropdown>
            </Tooltip>
          </template>
        </Grid>
      </Card>
      <!-- 分割线 -->
      <hr class="mb-4" />
      <!--- endregion -->

      <!--- region 工艺路线 -->
      <!-- 行容器，用于布局工艺路线标题和收缩按钮 -->
      <Row class="mb-4">
        <!-- 列容器，占据 23 格宽度，显示工艺路线标题 -->
        <Col :span="23" class="flex">
          <span class="border-l-4 border-sky-500 pl-4 text-xl font-black">
            {{ $t('productionOperation.processRoute') }}
          </span>
        </Col>
        <!-- 列容器，占据 1 格宽度，显示收缩/展开按钮 -->
        <Col :span="1">
          <!-- 展开按钮 -->
          <MdiChevronDown
            class="float-right inline-block cursor-pointer text-xl"
            v-if="!processShrinkage"
            @click="processShrinkageChange"
          />
          <!-- 收缩按钮 -->
          <MdiChevronUp
            class="float-right inline-block cursor-pointer text-xl"
            v-else
            @click="processShrinkageChange"
          />
        </Col>
      </Row>
      <!-- 加载状态组件，当工艺路线列表加载时显示加载动画 -->
      <Spin :spinning="processRouteListLoading">
        <!-- 卡片容器，当工艺路线收缩时显示 -->
        <Card class="mb-5" v-if="processShrinkage">
          <!-- 横向滚动容器，用于显示工艺路线项 -->
          <div class="w-full overflow-x-auto whitespace-nowrap">
            <!-- 循环渲染工艺路线项 -->
            <template v-for="item of processRouteList" :key="item.processCode">
              <!-- 单个工艺路线项容器 -->
              <div class="m-2 inline-block w-auto text-center">
                <!-- 工艺路线项主体，根据状态显示不同样式 -->
                <div
                  class="mb-2 cursor-pointer rounded-xl border p-2 pl-4 pr-4 hover:bg-pink-200 hover:text-black"
                  :class="{
                    // 'bg-sky-500 text-white': item.workingState === 1,
                    'bg-green-500 text-white':
                      item.workingState === 2 || item.workingState === 1,
                    'bg-gray-200': item.workingState === -1,
                    'bg-amber-500 text-white': item.workingState === 3,
                    'anomaly border-4':
                      item.errorFlag === 1 &&
                      item.processCode !== checkedProcess,
                    'border-4 border-sky-300 shadow-xl':
                      item.processCode === checkedProcess,
                  }"
                  @click="processChange(item)"
                >
                  <!-- 显示工艺路线名称 -->
                  <div class="font-black">{{ item.processName }}</div>
                </div>
                <!-- 显示当前工单信息，带有提示框 -->
                <div
                  class="w-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap font-black"
                  v-if="item.currentWorksheet"
                >
                  <Tooltip placement="topLeft" :title="item.currentWorksheet">
                    {{ item.currentWorksheet }}
                  </Tooltip>
                </div>
              </div>
            </template>
          </div>
        </Card>
      </Spin>
      <!-- 分割线 -->
      <hr class="mb-4" />
      <!--- endregion -->

      <!--- region 操作事项  -->
      <!-- 行容器，用于布局操作事项标题和操作事项选择器 -->
      <Row class="mb-4">
        <!-- 列容器，占据 23 格宽度，显示操作事项标题和选择器 -->
        <Col :span="23" class="flex">
          <!-- 显示操作事项标题，带有蓝色边框 -->
          <span class="mr-4 border-l-4 border-sky-500 pl-4 text-xl font-black">
            {{ $t('productionOperation.operationalMatters') }}
          </span>

          <!-- 操作事项选择器，使用单选按钮组 -->
          <RadioGroup
            v-model:value="theSelectedOperation"
            button-style="solid"
            class="float-right"
          >
            <!-- 循环渲染单选按钮 -->
            <RadioButton
              :value="item.id"
              v-for="item of listOfOperationItems"
              :key="item.id"
            >
              <!-- 显示操作事项图标 -->
              <IconifyIcon
                :icon="iconEnum[item.opTypeName]"
                class="inline-block text-xl"
              />
              <!-- 显示操作事项名称 -->
              {{ item.opTypeName }}
            </RadioButton>
          </RadioGroup>
        </Col>
        <!-- 列容器，占据 1 格宽度，显示收缩/展开按钮 -->
        <Col :span="1">
          <!-- 展开按钮 -->
          <MdiChevronDown
            class="float-right inline-block cursor-pointer text-xl"
            v-if="!operationEventShrinkage"
            @click="operationEventShrinkageChange"
          />
          <!-- 收缩按钮 -->
          <MdiChevronUp
            class="float-right inline-block cursor-pointer text-xl"
            v-else
            @click="operationEventShrinkageChange"
          />
        </Col>
      </Row>
      <!-- 卡片容器，当操作事项收缩时显示操作事项组件 -->
      <Card v-if="operationEventShrinkage" class="mb-5">
        <OperationalMatters
          :details-id="theSelectedOperation"
          :type="1"
          :worksheet-code="theCurrentlySelectedWorkOrderNumber"
          @current-change="workStepConversion"
          v-if="theSelectedOperation && theCurrentlySelectedWorkOrderNumber"
        />
      </Card>
      <!-- 分割线 -->
      <hr class="mb-4" />
      <!--- endregion -->

      <!--- region 工步执行  -->
      <!-- 行容器，用于布局工步执行标题和收缩按钮 -->
      <Row class="mb-4">
        <!-- 列容器，占据 4 格宽度，显示工步执行标题 -->
        <Col :span="4">
          <span class="border-l-4 border-sky-500 pl-4 text-xl font-black">
            {{ $t('productionOperation.workStepExecution') }}
          </span>
        </Col>
        <!-- 列容器，占据 1 格宽度，向右偏移 19 格，显示收缩/展开按钮 -->
        <Col :span="1" :offset="19">
          <!-- 展开按钮 -->
          <MdiChevronDown
            class="float-right inline-block cursor-pointer text-xl"
            v-if="!workStepExecutionContraction"
            @click="workStepExecutionContractionChange"
          />
          <!-- 收缩按钮 -->
          <MdiChevronUp
            class="float-right inline-block cursor-pointer text-xl"
            v-else
            @click="workStepExecutionContractionChange"
          />
        </Col>
      </Row>
      <!-- 卡片容器，当工步执行收缩时显示工步执行组件 -->
      <Card class="mb-5 min-h-72" v-if="workStepExecutionContraction">
        <StepExecution
          :workstation-code="selectedWorkstation"
          :equip-code="theSelectedProcessEquipment"
          :worksheet-code="theCurrentlySelectedWorkOrderNumber"
          :product-code="theSelectedWorkOrder.productCode"
          :product-name="theSelectedWorkOrder.productName"
          :binding-id="checkedProcessId"
          :step="currentWorkingStep"
          v-if="currentWorkingStep"
        />
      </Card>
      <!-- endregion -->
    </div>

    <!-- 人员操作组件，通过 ref 引用 -->
    <PersonnelOperation ref="personnelOperationRef" />

    <!-- 联锁配置组件，通过 ref 引用，并传递工作站编码 -->
    <InterlockingConfiguration
      ref="interlockingConfigurationRef"
      :workstation-code="selectedWorkstation"
    />
  </Page>
</template>

<style scoped lang="scss">
:deep(.ant-tabs-tab) {
  font-size: 18px;
}

.anomaly {
  animation: alarm 1s infinite;
}

@keyframes alarm {
  0%,
  100% {
    border-color: transparent;
  }

  50% {
    border-color: red;
  }
}
</style>
