<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import {
  MdiChevronDown,
  MdiChevronUp,
  MdiEyeOutline,
  MdiHome,
} from '@vben/icons';
import { $t } from '@vben/locales';

import { DownOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Input,
  Menu,
  MenuItem,
  message,
  Modal,
  RadioButton,
  RadioGroup,
  Row,
  Select,
  Timeline,
  TimelineItem,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  allClientUserDown,
  getSheetProces,
  listUserUpInfo,
  obtainTheListOfProcessEquipment,
  obtainTheWorkOrderList,
  sheetWorking,
  userDown,
  userUp,
  workstationListAcquisition,
} from '#/api';
import OperationalMatters from '#/util/component/operationalMatters.vue';
import StepExecution from '#/util/component/stepExecution.vue';

// region 工作站查询信息
// 工作站列表
const listOfProductionLines = ref([]);
// 当前选中的工作站
const selectedWorkstation = ref();

/**
 * 查询工作站列表
 */
function queryListOfProductionLines() {
  workstationListAcquisition().then((data) => {
    listOfProductionLines.value = data;
    if (!selectedWorkstation.value) {
      selectedWorkstation.value = data[0].workstationCode;
      queryProcessEquipment();
    }
  });
}

/**
 * 选中的工作站改变, 查询工艺设备列表
 */
function selectedWorkstationChange() {
  queryProcessEquipment();
}

// 艺设备列表
const listOfProcesses = ref([]);
// 选中的工艺设备
const theSelectedProcessEquipment = ref();

/**
 * 查询工艺设备列表
 */
function queryProcessEquipment() {
  theSelectedProcessEquipment.value = undefined;
  obtainTheListOfProcessEquipment({
    workstationCode: selectedWorkstation.value,
  }).then((data) => {
    listOfProcesses.value = data;
    if (!theSelectedProcessEquipment.value) {
      theSelectedProcessEquipment.value = data[0].equipmentCode;
      query();
    }
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
  align: 'center',
  border: true,
  rowConfig: {
    isHover: true,
  },
  radioConfig: {
    labelField: 'worksheetCode',
    trigger: 'row',
  },
  columns: [
    {
      type: 'radio',
      title: '工单编号',
      minWidth: 220,
    },
    {
      field: 'worksheetCode',
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
      title: '报工类型说明',
      minWidth: 200,
    },
    {
      field: 'sendStateName',
      title: '工单状态',
      minWidth: 200,
      sortable: true,
    },
    {
      field: 'planNumber',
      title: '计划数量',
      minWidth: 200,
    },
    {
      field: 'personnelOperation',
      title: '人员操作',
      minWidth: 150,
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
const gridEvents: any = {
  radioChange: ({ newValue }: any) => {
    queryProcess(selectedWorkstation.value, newValue.worksheetCode);
  },
};
// gridApi
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 选中行
 * @param worksheetCode 工单号
 */
function setRadioByKey(worksheetCode: string = '') {
  setTimeout(() => {
    const { tableData } = gridApi.grid.getTableData();
    const row = worksheetCode
      ? tableData.find((item: any) => item.worksheetCode === worksheetCode)
      : tableData[0];
    gridApi.grid.setRadioRow(row);
    queryProcess(selectedWorkstation.value, row.worksheetCode);
  }, 500);
}

// region 查询数据

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData() {
  return new Promise((resolve, _reject) => {
    const params: any = {
      worksheetCode: '',
      equipCode: theSelectedProcessEquipment.value,
      workstationCode: selectedWorkstation.value,
    };

    obtainTheWorkOrderList(params)
      .then((data) => {
        if (data.length > 0) {
          setRadioByKey(data[0].worksheetCode);
        }
        resolve({
          total: data.length,
          items: data,
        });
      })
      .catch((error) => {
        _reject(error);
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

// region 人员操作
// 人员操作是否显示
const whetherPersonnelOperationsAreDisplayed = ref(false);
// 当前编辑的人员操作信息
const editedInformation = ref<any>();
// 人员操作类型
const personnelOperationType = ref(0);
// 人员工号
const employeeNumber = ref('');
/**
 * 显示人员操作
 * @param row
 * @param type 1: 上工 2: 下工 3: 一键下工
 */
function displayPersonnelOperation(row: any, type: number) {
  if (type === 3) {
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
  } else {
    whetherPersonnelOperationsAreDisplayed.value = true;
    editedInformation.value = row;
    personnelOperationType.value = type;
  }
}

/**
 * 关闭人员操作
 */
function shutDownPersonnelOperations() {
  whetherPersonnelOperationsAreDisplayed.value = false;
  editedInformation.value = {};
  personnelOperationType.value = 0;
  employeeNumber.value = '';
}

/**
 * 人员操作提交
 */
function personnelOperationSubmission() {
  const params = {
    id: editedInformation.value.id,
    workNumber: employeeNumber.value,
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
    const itemArr: any = [];
    data.forEach((item: any) => {
      item.operationTime = new Date(item.operationTime);
      itemArr.push(
        h(TimelineItem, {}, [
          h('p', {}, '上工'),
          h('p', {}, `${item.perName}___${item.opTime}`),
        ]),
      );
    });
    Modal.info({
      content: h(
        Timeline,
        {
          class: 'mt-4',
        },
        itemArr,
      ),
      okText: '关闭',
      title: '当前上工人员信息',
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
// 当前选中的工单
const theCurrentlySelectedWorkOrderNumber = ref('');

/**
 * 查询工艺路线
 * @param workstationCode 工作站编码
 * @param worksheetCode 工单编码
 */
function queryProcess(workstationCode: string, worksheetCode: string) {
  theCurrentlySelectedWorkOrderNumber.value = worksheetCode;
  getSheetProces({
    workstationCode,
    worksheetCode,
  }).then((data) => {
    processRouteList.value = data;
    checkedProcess.value = processRouteList.value[0].processCode;
    processChange(processRouteList.value[0]);
  });
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
 * @param item
 */
function processChange(item: any) {
  checkedProcess.value = item.processCode;
  listOfOperationItems.value = item.details;
  theSelectedOperation.value = item.details[0].id;
  ruleType.value = item.details[0].ruleType;
}

// endregion

onMounted(() => {
  queryListOfProductionLines();
});
</script>

<template>
  <Page>
    <!-- region 工作站查询信息 -->
    <Row class="mb-4">
      <Col :span="23" class="flex">
        <span class="border-l-4 border-sky-500 pl-4 text-2xl font-black">
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
        <span class="border-l-4 border-sky-500 pl-4 text-2xl font-black">
          {{ $t('productionOperation.jobInformation') }}
        </span>
      </Col>
      <Col :span="1">
        <MdiChevronDown
          class="float-right inline-block cursor-pointer text-2xl"
          v-if="jobInformationContraction"
          @click="jobInformationContractionChange"
        />
        <MdiChevronUp
          class="float-right inline-block cursor-pointer text-2xl"
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
                ...
                <DownOutlined class="ml-4 inline-block" />
              </Button>
            </Dropdown>
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
                  <MenuItem @click="workOrderOperation(row, 1)">
                    {{ $t('common.startWork') }}
                  </MenuItem>
                  <!-- 完工 -->
                  <MenuItem @click="workOrderOperation(row, 2)">
                    {{ $t('common.completed') }}
                  </MenuItem>
                  <!-- 暂停 -->
                  <MenuItem @click="workOrderOperation(row, 3)">
                    {{ $t('common.pause') }}
                  </MenuItem>
                  <!-- 强制下线 -->
                  <MenuItem @click="workOrderOperation(row, 5)">
                    {{ $t('common.forcedOffline') }}
                  </MenuItem>
                </Menu>
              </template>
              <Button type="link">
                ...
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
        <span class="border-l-4 border-sky-500 pl-4 text-2xl font-black">
          {{ $t('productionOperation.processRoute') }}
        </span>
      </Col>
      <Col :span="1">
        <MdiChevronDown
          class="float-right inline-block cursor-pointer text-2xl"
          v-if="processShrinkage"
          @click="processShrinkageChange"
        />
        <MdiChevronUp
          class="float-right inline-block cursor-pointer text-2xl"
          v-else
          @click="processShrinkageChange"
        />
      </Col>
    </Row>
    <Card class="mb-5" v-if="processShrinkage">
      <div class="mt-5">
        <Button
          v-for="item of processRouteList"
          :type="item.processCode !== checkedProcess ? 'default' : 'primary'"
          size="large"
          class="mr-4 w-32"
          :key="item.processCode"
          @click="processChange(item)"
        >
          {{ item.processName }}
        </Button>
      </div>
    </Card>
    <hr class="mb-4" />
    <!--- endregion -->

    <!--- region 操作事项  -->
    <Row class="mb-4">
      <Col :span="23" class="flex">
        <span class="mr-4 border-l-4 border-sky-500 pl-4 text-2xl font-black">
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
            <MdiHome class="inline-block text-xl" />
            {{ item.opTypeName }}
          </RadioButton>
        </RadioGroup>
      </Col>
      <Col :span="1">
        <MdiChevronDown
          class="float-right inline-block cursor-pointer text-2xl"
          v-if="operationEventShrinkage"
          @click="operationEventShrinkageChange"
        />
        <MdiChevronUp
          class="float-right inline-block cursor-pointer text-2xl"
          v-else
          @click="operationEventShrinkageChange"
        />
      </Col>
    </Row>
    <Card v-if="operationEventShrinkage" class="mb-5">
      <OperationalMatters
        :details-id="theSelectedOperation"
        :type="ruleType"
        :worksheet-code="theCurrentlySelectedWorkOrderNumber"
        v-if="theSelectedOperation && theCurrentlySelectedWorkOrderNumber"
      />
    </Card>
    <hr class="mb-4" />
    <!--- endregion -->

    <!--- region 工步执行  -->
    <Row class="mb-4">
      <Col :span="4">
        <span class="border-l-4 border-sky-500 pl-4 text-2xl font-black">
          {{ $t('productionOperation.workStepExecution') }}
        </span>
      </Col>
      <Col :span="1" :offset="19">
        <MdiChevronDown
          class="float-right inline-block cursor-pointer text-2xl"
          v-if="operationEventShrinkage"
          @click="operationEventShrinkageChange"
        />
        <MdiChevronUp
          class="float-right inline-block cursor-pointer text-2xl"
          v-else
          @click="operationEventShrinkageChange"
        />
      </Col>
    </Row>
    <Card class="mb-5 min-h-72">
      <StepExecution />
    </Card>
    <!-- endregion -->

    <Modal
      v-model:open="whetherPersonnelOperationsAreDisplayed"
      :title="
        personnelOperationType === 1
          ? $t('common.theUserGoesToWork')
          : $t('common.theUserIsOffWork')
      "
      :ok-button-props="{ disabled: !employeeNumber }"
      @ok="personnelOperationSubmission"
      @cancel="shutDownPersonnelOperations"
    >
      <Input v-model:value="employeeNumber" placeholder="请输入用户工号" />
    </Modal>
  </Page>
</template>

<style scoped lang="scss">
:deep(.ant-tabs-tab) {
  font-size: 18px;
}
</style>
