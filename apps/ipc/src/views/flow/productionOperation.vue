<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';
import {
  IconifyIcon,
  MdiChevronDown,
  MdiChevronUp,
  MdiEyeOutline,
} from '@vben/icons';
import { $t } from '@vben/locales';

import { DownOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Col,
  Drawer,
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
  Space,
  Spin,
  Table,
  Tooltip,
  Transfer,
} from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { Enum } from 'enum-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  allClientUserDown,
  getSheetProces,
  getUserList,
  listUserUpInfo,
  obtainTheListOfProcessEquipment,
  obtainTheWorkOrderList,
  sheetReady,
  sheetWorking,
  userDown,
  userUp,
  workstationListAcquisition,
} from '#/api';
import OperationalMatters from '#/util/component/operationalMatters.vue';
import StepExecution from '#/util/component/stepExecution.vue';
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
      selectedWorkstation.value = data[0].workstationCode; // 取第一个工作站的编码作为默认值
    }
    queryProcessEquipment(); // 触发关联的工艺设备查询
  });
}

/**
 * 选中的工作站改变, 查询工艺设备列表
 */
/**
 * 工作站选择变更处理
 * 当用户切换工作站时触发，用于：
 * 1. 清空当前工艺设备选择
 * 2. 重新加载工艺设备列表
 * 3. 刷新关联的工单数据
 */
function selectedWorkstationChange() {
  queryProcessEquipment(); // 触发工艺设备查询流程
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
  theSelectedProcessEquipment.value = undefined; // 重置当前选择的设备
  obtainTheListOfProcessEquipment({
    workstationCode: selectedWorkstation.value, // 使用当前选中的工作站编码
  }).then((data) => {
    listOfProcesses.value = data; // 更新工艺设备列表数据
    theSelectedProcessEquipment.value = undefined; // 保持设备选择为空状态
    query(); // 触发工单数据重新加载
  });
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
  columns: [
    {
      type: 'radio',
      minWidth: 60,
    },
    {
      field: 'worksheetCode',
      title: '工单号',
      minWidth: 200,
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
      field: 'personnelOperation',
      title: '人员操作',
      minWidth: 200,
      slots: {
        default: 'personnelOperation',
      },
      fixed: 'right',
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
    {
      field: 'readyOperation',
      title: '就绪操作',
      minWidth: 150,
      slots: {
        default: 'readyOperation',
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
          setRadioByKey(data[0].worksheetCode); // 根据工单号设置选中状态
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
  gridApi.reload();
}

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
// 人员操作是否显示
const whetherPersonnelOperationsAreDisplayed = ref(false);
// 当前编辑的人员操作信息
const editedInformation = ref<any>();
// 人员操作类型
// 1: 上工 2: 下工
const personnelOperationType = ref(0);
// 用户列表
const userList = ref<any>([]);
// 已上工的工号列表
const jobNumberThatHasAlreadyStartedWorking = ref<any>([]);
// 过滤
const filterOption = (inputValue: string, option: any) => {
  return option.title.includes(inputValue);
};
/**
 * 查询全部用户
 */
function queryAllUser() {
  getUserList().then((data) => {
    userList.value = [];
    data.forEach((item: any) => {
      userList.value.push({
        title: `${item.userName}___${item.workNumber}`,
        key: item.workNumber,
      });
    });
  });
}

/**
 * 查询上工人员
 */
function searchForStaffOnSite() {
  listUserUpInfo({
    clientCode: editedInformation.value.equipCode,
  }).then((data) => {
    data.forEach((item: any) => {
      userList.value.push({
        title: `${item.perName}___${item.workNumber}`,
        key: item.workNumber,
      });
      jobNumberThatHasAlreadyStartedWorking.value.push(item.workNumber);
    });
  });
}
/**
 * 显示人员操作
 * @param row
 * @param type 1: 上工 2: 下工 3: 一键下工
 */
function displayPersonnelOperation(row: any, type: number) {
  editedInformation.value = row;
  personnelOperationType.value = type;
  switch (type) {
    case 1: {
      queryAllUser();
      searchForStaffOnSite();
      whetherPersonnelOperationsAreDisplayed.value = true;
      break;
    }
    case 2: {
      searchForStaffOnSite();
      whetherPersonnelOperationsAreDisplayed.value = true;
      break;
    }
    case 3: {
      Modal.confirm({
        cancelText: '取消',
        okText: '确认',
        okType: 'danger',
        onCancel() {
          message.warning('已取消操作!');
        },
        onOk() {
          allClientUserDown({
            id: row.id,
          }).then(() => {
            // 显示操作成功的提示信息
            message.success($t('common.successfulOperation'));
            gridApi.reload();
          });
        },
        title: '是否确认一键下工?',
      });
      break;
    }
  }
}

/**
 * 关闭人员操作
 */
function shutDownPersonnelOperations() {
  whetherPersonnelOperationsAreDisplayed.value = false;
  editedInformation.value = {};
  jobNumberThatHasAlreadyStartedWorking.value = [];
  userList.value = [];
}

/**
 * 获取下工人员
 */
function getTheStaff() {
  const difference = userList.value.filter(
    (item1: any) =>
      !jobNumberThatHasAlreadyStartedWorking.value.includes(item1.key),
  );
  const keys: any = [];
  difference.forEach((item: any) => {
    keys.push(item.key);
  });
  return keys;
}

/**
 * 人员操作提交
 */
function personnelOperationSubmission() {
  const params = {
    id: editedInformation.value.id,
    workNumbers:
      personnelOperationType.value === 1
        ? jobNumberThatHasAlreadyStartedWorking.value
        : getTheStaff(),
  };
  const ob =
    personnelOperationType.value === 1 ? userUp(params) : userDown(params);
  ob.then(() => {
    message.success($t('common.successfulOperation'));
    shutDownPersonnelOperations();
    gridApi.reload();
  });
}

/**
 * 显示人员操作记录详情
 * @param row
 */
function displayPersonnelDetails(row: any) {
  listUserUpInfo({
    clientCode: row.equipCode,
  }).then((data) => {
    const columns = [
      {
        title: '人员姓名',
        dataIndex: 'perName',
        key: 'perName',
        width: 150,
      },
      {
        title: '工号',
        dataIndex: 'workNumber',
        key: 'workNumber',
        width: 150,
      },
      {
        title: '上工时间',
        dataIndex: 'opTime',
        key: 'opTime',
        width: 150,
      },
    ];
    Modal.info({
      content: h(Table, {
        class: 'mr-8',
        dataSource: data,
        columns,
        bordered: true,
        pagination: false,
      }),
      okText: '关闭',
      title: '当前上工人员信息',
      width: '80%',
    });
  });
}
// endregion

// region 工单操作

/**
 * 工单操作
 * @param row
 * @param type 1: 上工 2: 下工 3: 一键下工
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
const zoomSize = ref(80);

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
});
</script>

<template>
  <Page>
    <div class="fixed right-[20px] top-[110px] z-[999]">
      <InputNumber
        v-model:value="zoomSize"
        :min="50"
        :max="200"
        :formatter="(value: any) => `${value}%`"
        :parser="(value: any) => value.replace('%', '')"
        @change="zoom"
      />
    </div>
    <div ref="page" class="w-full">
      <!-- region 工作站查询信息 -->
      <Row class="mb-4">
        <Col :span="23" class="flex">
          <span class="border-l-4 border-sky-500 pl-4 text-xl font-black">
            {{ $t('productionOperation.homeworkStation') }}
          </span>

          <div class="w-4/5 pl-4">
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

            <!--          <RadioGroup
              v-model:value="queryParams.test"
              button-style="solid"
              class="float-right"
            >
              <RadioButton value="a">Hangzhou</RadioButton>
              <RadioButton value="1">1</RadioButton>
              <RadioButton value="2">2</RadioButton>
            </RadioGroup>-->
          </div>
        </Col>
      </Row>
      <hr class="mb-4" />
      <!-- endregion -->

      <!--- region 作业信息 -->
      <Row class="mb-4">
        <Col :span="23" class="flex">
          <span class="border-l-4 border-sky-500 pl-4 text-xl font-black">
            {{ $t('productionOperation.jobInformation') }}
          </span>
        </Col>
        <Col :span="1">
          <MdiChevronDown
            class="float-right inline-block cursor-pointer text-xl"
            v-if="!jobInformationContraction"
            @click="jobInformationContractionChange"
          />
          <MdiChevronUp
            class="float-right inline-block cursor-pointer text-xl"
            v-else
            @click="jobInformationContractionChange"
          />
        </Col>
      </Row>
      <Card class="mb-5" v-if="!jobInformationContraction">
        <Grid>
          <template #toolbar-tools> </template>
          <template #personnelOperation="{ row }">
            <!-- 查看按钮 -->
            <Tooltip>
              <template #title>{{ $t('common.view') }}</template>
              <Button
                :icon="h(MdiEyeOutline, { class: 'inline-block size-6' })"
                type="link"
                @click="displayPersonnelDetails(row)"
              />
            </Tooltip>
            <!-- 更多操作 -->
            <Tooltip>
              <template #title>{{ $t('common.more') }}</template>
              <Dropdown>
                <template #overlay>
                  <Menu>
                    <!-- 上工 -->
                    <MenuItem @click="displayPersonnelOperation(row, 1)">
                      {{ $t('common.theUserGoesToWork') }}
                    </MenuItem>
                    <!-- 下工 -->
                    <MenuItem @click="displayPersonnelOperation(row, 2)">
                      {{ $t('common.theUserIsOffWork') }}
                    </MenuItem>
                    <!-- 一键下工 -->
                    <MenuItem @click="displayPersonnelOperation(row, 3)">
                      {{ $t('common.oneClickWork') }}
                    </MenuItem>
                  </Menu>
                </template>
                <Button type="link">
                  更多操作
                  <DownOutlined class="ml-4 inline-block" />
                </Button>
              </Dropdown>
            </Tooltip>
          </template>
          <template #readyOperation="{ row }">
            <!-- 就绪按钮 -->
            <Tooltip v-if="row.readyState === 0">
              <template #title>{{ $t('common.beInOrder') }}</template>
              <Button type="link" @click="ready(row, 1)">
                <IconifyIcon
                  icon="mdi:timer-sand-complete"
                  class="inline-block size-6"
                />
              </Button>
            </Tooltip>
            <!-- 就绪撤回 -->
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
          <template #workOrderOperation="{ row }">
            <!-- 更多操作 -->
            <Tooltip>
              <template #title>{{ $t('common.more') }}</template>
              <Dropdown>
                <template #overlay>
                  <Menu>
                    <!-- 开工 -->
                    <MenuItem
                      @click="workOrderOperation(row, 1)"
                      :disabled="row.sendState === 4"
                    >
                      {{ $t('common.startWork') }}
                    </MenuItem>
                    <!-- 完工 -->
                    <MenuItem
                      @click="workOrderOperation(row, 2)"
                      :disabled="row.sendState === 2"
                    >
                      {{ $t('common.completed') }}
                    </MenuItem>
                    <!-- 暂停 -->
                    <MenuItem
                      @click="workOrderOperation(row, 3)"
                      :disabled="row.sendState === 3"
                    >
                      {{ $t('common.pause') }}
                    </MenuItem>
                    <!-- 强制下线 -->
                    <MenuItem
                      @click="workOrderOperation(row, 5)"
                      :disabled="row.sendState === 5"
                    >
                      {{ $t('common.forcedOffline') }}
                    </MenuItem>
                  </Menu>
                </template>
                <Button type="link">
                  更多操作
                  <DownOutlined class="ml-4 inline-block" />
                </Button>
              </Dropdown>
            </Tooltip>
          </template>
        </Grid>
      </Card>
      <hr class="mb-4" />
      <!--- endregion -->

      <!--- region 工艺路线 -->
      <Row class="mb-4">
        <Col :span="23" class="flex">
          <span class="border-l-4 border-sky-500 pl-4 text-xl font-black">
            {{ $t('productionOperation.processRoute') }}
          </span>
        </Col>
        <Col :span="1">
          <MdiChevronDown
            class="float-right inline-block cursor-pointer text-xl"
            v-if="!processShrinkage"
            @click="processShrinkageChange"
          />
          <MdiChevronUp
            class="float-right inline-block cursor-pointer text-xl"
            v-else
            @click="processShrinkageChange"
          />
        </Col>
      </Row>
      <Spin :spinning="processRouteListLoading">
        <Card class="mb-5" v-if="processShrinkage">
          <div class="mt-5">
            <Button
              v-for="item of processRouteList"
              :type="
                item.processCode !== checkedProcess ? 'default' : 'primary'
              "
              size="large"
              class="mr-4 w-32"
              :key="item.processCode"
              @click="processChange(item)"
            >
              {{ item.processName }}
            </Button>
          </div>
        </Card>
      </Spin>
      <hr class="mb-4" />
      <!--- endregion -->

      <!--- region 操作事项  -->
      <Row class="mb-4">
        <Col :span="23" class="flex">
          <span class="mr-4 border-l-4 border-sky-500 pl-4 text-xl font-black">
            {{ $t('productionOperation.operationalMatters') }}
          </span>

          <RadioGroup
            v-model:value="theSelectedOperation"
            button-style="solid"
            class="float-right"
          >
            <RadioButton
              :value="item.id"
              v-for="item of listOfOperationItems"
              :key="item.id"
            >
              <IconifyIcon
                :icon="iconEnum[item.opTypeName]"
                class="inline-block text-xl"
              />
              {{ item.opTypeName }}
            </RadioButton>
          </RadioGroup>
        </Col>
        <Col :span="1">
          <MdiChevronDown
            class="float-right inline-block cursor-pointer text-xl"
            v-if="!operationEventShrinkage"
            @click="operationEventShrinkageChange"
          />
          <MdiChevronUp
            class="float-right inline-block cursor-pointer text-xl"
            v-else
            @click="operationEventShrinkageChange"
          />
        </Col>
      </Row>
      <Card v-if="operationEventShrinkage" class="mb-5">
        <OperationalMatters
          :details-id="theSelectedOperation"
          :type="1"
          :worksheet-code="theCurrentlySelectedWorkOrderNumber"
          @current-change="workStepConversion"
          v-if="theSelectedOperation && theCurrentlySelectedWorkOrderNumber"
        />
      </Card>
      <hr class="mb-4" />
      <!--- endregion -->

      <!--- region 工步执行  -->
      <Row class="mb-4">
        <Col :span="4">
          <span class="border-l-4 border-sky-500 pl-4 text-xl font-black">
            {{ $t('productionOperation.workStepExecution') }}
          </span>
        </Col>
        <Col :span="1" :offset="19">
          <MdiChevronDown
            class="float-right inline-block cursor-pointer text-xl"
            v-if="!workStepExecutionContraction"
            @click="workStepExecutionContractionChange"
          />
          <MdiChevronUp
            class="float-right inline-block cursor-pointer text-xl"
            v-else
            @click="workStepExecutionContractionChange"
          />
        </Col>
      </Row>
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

    <!-- region 用户上工 -->
    <Drawer
      v-model:open="whetherPersonnelOperationsAreDisplayed"
      :footer-style="{ textAlign: 'right' }"
      :height="500"
      placement="top"
      title="人员上/下工"
      @close="shutDownPersonnelOperations"
    >
      {{ jobNumberThatHasAlreadyStartedWorking }}
      <Transfer
        v-model:target-keys="jobNumberThatHasAlreadyStartedWorking"
        :data-source="userList"
        show-search
        :filter-option="filterOption"
        :render="(item: any) => item.title"
        class="w-full justify-center"
        :list-style="{
          minWidth: '300px',
          width: '40%',
          height: '300px',
        }"
      />
      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="shutDownPersonnelOperations">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="personnelOperationSubmission">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped lang="scss">
:deep(.ant-tabs-tab) {
  font-size: 18px;
}
</style>
