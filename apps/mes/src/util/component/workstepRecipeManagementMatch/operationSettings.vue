<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';
import { useRoute } from 'vue-router';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  RadioButton,
  RadioGroup,
  Row,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteSRunSetting,
  insertFunctionOpinfo,
  listCatchTemplateDetail,
  performASetupQuery,
  runSettingAudit,
  runSettingUpdateStatus,
  updateFunctionOpinfo,
  updateOpList,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// region 表格

const gridOptions: VxeGridProps<any> = {
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'functionName', title: '工步名称', minWidth: 150 },
    { field: 'checkCycle', title: '检测周期（秒）', minWidth: 150 },
    { field: 'operatorType', title: '执行条件类型', minWidth: 150 },
    { field: 'operatorTypeName', title: '执行条件类型名称', minWidth: 150 },
    { field: 'stepType', title: '步骤类型', minWidth: 150 },
    { field: 'stepTypeName', title: '步骤类型名称', minWidth: 150 },
    { field: 'executeMode', title: '执行方式', minWidth: 150 },
    { field: 'executeModeName', title: '执行方式说明', minWidth: 150 },
    { field: 'executeDelay', title: '延时执行（秒）', minWidth: 150 },
    { field: 'hasAlert', title: '是否包含告警推送', minWidth: 150 },
    { field: 'stepFunctionId', title: '跳转工步ID', minWidth: 150 },
    { field: 'stepFunctionName', title: '跳转工步名称', minWidth: 150 },
    { field: 'auditResultName', title: '审核结果', minWidth: 150 },
    { field: 'auditTime', title: '审核时间', minWidth: 150 },
    { field: 'auditUser', title: '审核人', minWidth: 150 },
    {
      field: 'isUse',
      fixed: 'right',
      title: '状态',
      minWidth: 150,
      slots: { default: 'isUse' },
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 300,
    },
  ],
  data: [],
  pagerConfig: {
    enabled: false,
  },
  sortConfig: {
    multiple: true,
  },
};
const gridEvents: any = {
  rowDragend: () => {
    sort();
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions, gridEvents });

/**
 * 查询表格数据
 */
function queryTableData() {
  performASetupQuery({
    functionId: step.value.id,
  }).then((data) => {
    gridApi.grid.reloadData(data);
  });
}

function sort() {
  const { tableData } = gridApi.grid.getTableData();
  const params: any[] = [];
  tableData.forEach((item: any, index: number) => {
    params.push({
      id: item.id,
      orderNo: index + 1,
    });
  });
  updateOpList(params).then(() => {
    message.success($t('common.successfulOperation'));
    queryTableData();
  });
}

/**
 * 删除工步
 * @param id
 */
function deleteStep(id: string) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消!');
    },

    onOk() {
      deleteSRunSetting(id).then(() => {
        message.success($t('common.successfulOperation'));
        queryTableData();
      });
    },
    title: '是否确认删除?',
  });
}

// endregion

// region 抽屉基本操作

// 抽屉是否显示
const visible = ref(false);
// 配方
const formula = ref<any>({});
// 同步信息
const matching = ref<any>({});
// 工步信息
const step = ref<any>({});

/**
 * 打开抽屉
 */
function openDrawer(
  formulaMessage: any,
  matchingMessage: any,
  stepTypeMessage: any,
  listOfSteps: any,
) {
  // 赋值工步列表
  stepList.value = [];
  listOfSteps.forEach((item: any) => {
    stepList.value.push({
      label: item.functionTypeName,
      value: item.data.functionId,
    });
  });
  // 赋值配方
  formula.value = {
    ...formulaMessage,
  };
  // 赋值同步信息
  matching.value = {
    ...matchingMessage,
  };
  // 赋值工步信息
  step.value = {
    ...stepTypeMessage,
  };

  visible.value = true;
  queryTableData();
  queryTheProcessRecipe();
  queryAuthor();
}

/**
 * 关闭抽屉
 */
function closeDrawer() {
  visible.value = false;
  gridApi.grid.reloadData([]);
}
// endregion

// region 编辑
// 编辑抽屉是否显示
const settingDrawer = ref(false);
// 编辑的对象
const editItem = ref<any>({});
// 表单对象
const editForm = ref<any>();
// 是否是编辑状态
const isEdit = ref(false);
/**
 * 打开编辑抽屉
 */
function showSettingDrawer(row: any = {}, editStatus = false) {
  settingDrawer.value = true;
  isEdit.value = editStatus;
  /* eslint-disable unicorn/prefer-structured-clone */
  editItem.value = row.functionName
    ? JSON.parse(JSON.stringify(row))
    : {
        ...row,
        functionName: step.value.functionTypeName,
        functionId: step.value.id,
      };
  /* eslint-enable unicorn/prefer-structured-clone */
}

/**
 * 关闭编辑抽屉
 */
function closeSettingDrawer() {
  settingDrawer.value = false;
}

function settingSubmit() {
  editForm.value.validate().then(() => {
    const params = {
      ...editItem.value,
    };
    (params.id
      ? updateFunctionOpinfo(params)
      : insertFunctionOpinfo(params)
    ).then(() => {
      message.success($t('common.successfulOperation'));
      queryTableData();
      // 关闭抽屉
      closeSettingDrawer();
    });
  });
}

// endregion

// region 审核

/**
 * 处理质检任务审核操作
 * 功能：执行任务审核的二次确认及状态更新
 * 流程：
 * 1. 根据审核类型设置对话框标题和状态码
 *   - 通过：状态码2，标题"是否确认通过..."
 *   - 不通过：状态码3，标题"是否确认不通过..."
 * 2. 弹出确认对话框获取用户确认
 * 3. 确认后调用审核接口提交审核结果
 * 4. 成功时：
 *   - 刷新顶部检查类型计数
 *   - 更新统计面板数据
 *   - 重新加载任务列表
 *
 * @param row - 当前审核任务数据，包含任务ID等必要字段
 * @param isPass - 审核结果标识，true表示通过，false表示不通过
 *
 * 接口说明：
 * taskAudit - 任务审核接口，接收任务ID和审核类型参数
 */
function handleAudit(row: any, isPass: boolean) {
  const title = isPass ? '是否确认通过该条数据?' : '是否确认不通过该条数据?';
  const statusCode = isPass ? 1 : 2;

  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'primary',
    title,

    onOk() {
      runSettingAudit({
        id: row.id,
        auditResult: statusCode,
      }).then(() => {
        message.success($t('common.successfulOperation'));
        queryTableData(); // 刷新任务列表
      });
    },
  });
}

// endregion

// region 选项列表

// 执行条件列表
const executionCondition = [
  {
    label: '与',
    value: 1,
  },
  {
    label: '或',
    value: 2,
  },
  {
    label: '非',
    value: 3,
  },
];
// 步骤类型
const stepType = [
  {
    label: '自动执行步骤',
    value: 1,
  },
  {
    label: '人工判定步骤',
    value: 2,
  },
];

// 执行方式
const executeMode = [
  {
    label: '顺序执行',
    value: 1,
  },
  {
    label: '同时执行',
    value: 2,
  },
];
// 执行方式
const hasAlert = [
  {
    label: '包含',
    value: 1,
  },
  {
    label: '不包含',
    value: 2,
  },
];
// 工序列表
const stepList = ref<any>([]);
// 触发源
const triggerSource = [
  {
    label: '设备触发',
    value: 1,
  },
  {
    label: '定时触发',
    value: 2,
  },
  {
    label: '产品触发',
    value: 3,
  },
  {
    label: '告警执行',
    value: 4,
  },
];

// 脚本用途
const scriptUse = [
  {
    label: '数据流',
    value: 1,
  },
  {
    label: '触发器',
    value: 2,
  },
  {
    label: '执行动作',
    value: 3,
  },
];
// 表达式
const expression = [
  {
    label: '>',
    value: '>',
  },
  {
    label: '>=',
    value: '>=',
  },
  {
    label: '=',
    value: '=',
  },
  {
    label: '<',
    value: '<',
  },
  {
    label: '<=',
    value: '<=',
  },
];

// endregion

// region 工序配方
// 工序配方
const processFormulation = ref<any>([]);
// 选中的配方id
const selectedTemplateId = ref<any>();
// 点位信息
const pointInfo = ref<any>([]);

/**
 * 查询工序配方
 */
function queryTheProcessRecipe() {
  listCatchTemplateDetail({
    equipCode: formula.value.equipCode,
  }).then((data: any) => {
    processFormulation.value = [
      {
        label: `${data.templateName}(${data.templateCode})`,
        value: data.proceTemplateId,
      },
    ];
    selectedTemplateId.value = data.proceTemplateId;
    pointInfo.value = [];
    data.details.forEach((item: any) => {
      pointInfo.value.push({
        label: `${item.name}(${item.expression})`,
        value: item.expression,
        name: item.name,
        templateCatchId: item.templateCatchId,
      });
    });
  });
}

// endregion

// region 状态切换
/**
 * 切换状态
 * @param row
 */
function updateStatus(row: any) {
  runSettingUpdateStatus(row)
    .then(() => {
      message.success($t('common.successfulOperation'));
    })
    .finally(() => {
      queryTableData();
    });
}

// endregion

// region 条件设置
/**
 * 添加行
 */
function addRow() {
  if (!editItem.value.opdetails) {
    editItem.value.opdetails = [];
  }
  editItem.value.opdetails.push({
    proceTemplateId: selectedTemplateId.value,
  });
}

/**
 * 删除行
 * @param index
 */
function removeRow(index: number) {
  editItem.value.opdetails.splice(index, 1);
}

// endregion

// region 权限
const author = ref<string[]>([]);
// 路由信息
const route = useRoute();

function queryAuthor() {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
}
// endregion

// region 暴露方法

// 暴露 open 方法，供父组件调用
defineExpose({
  open: openDrawer,
});

// endregion
</script>

<template>
  <Drawer
    v-model:open="visible"
    height="80%"
    placement="bottom"
    :title="$t('operationFormula.runSetting')"
    @close="closeDrawer()"
  >
    <!-- 基本信息 -->
    <Descriptions :column="5" bordered>
      <!-- 设备编号 -->
      <DescriptionsItem :label="$t('operationFormula.equipmentNumber')">
        {{ formula.equipCode }}
      </DescriptionsItem>
      <!-- 设备名称 -->
      <DescriptionsItem :label="$t('operationFormula.equipmentName')">
        {{ formula.equipName }}
      </DescriptionsItem>
      <!-- 工序名称 -->
      <DescriptionsItem :label="$t('operationFormula.processName')">
        {{ formula.processName }}
      </DescriptionsItem>
      <!-- 配方编号 -->
      <DescriptionsItem :label="$t('operationFormula.formulaNumber')">
        {{ formula.formulaCode }}
      </DescriptionsItem>
      <!-- 配方名称 -->
      <DescriptionsItem :label="$t('operationFormula.formulaName')">
        {{ formula.formulaName }}
      </DescriptionsItem>
      <!-- 版本号 -->
      <DescriptionsItem :label="$t('operationFormula.versionNumber')">
        {{ formula.version }}
      </DescriptionsItem>
      <!-- 工作站编号 -->
      <DescriptionsItem :label="$t('operationFormula.workstationNumber')">
        {{ matching.workstationCode }}
      </DescriptionsItem>
      <!-- 工作站名称 -->
      <DescriptionsItem :label="$t('operationFormula.workstationName')">
        {{ matching.workstationName }}
      </DescriptionsItem>
      <!-- 作业类型 -->
      <DescriptionsItem :label="$t('operationFormula.operationType')">
        {{ matching.opTypeName }}
      </DescriptionsItem>
      <!-- 工步类型 -->
      <DescriptionsItem :label="$t('operationFormula.workStepType')">
        {{ step.functionTypeName }}
      </DescriptionsItem>
    </Descriptions>
    <Button class="my-4" type="primary" @click="showSettingDrawer({}, true)">
      {{ $t('common.add') }}
    </Button>
    <Grid>
      <template #isUse="{ row }">
        <RadioGroup
          v-model:value="row.isUse"
          @change="updateStatus(row)"
          :disabled="!author.includes('状态变更') || row.auditResult !== 1"
        >
          <RadioButton :value="1">
            {{ $t('status.enable') }}
          </RadioButton>
          <RadioButton :value="-1">
            {{ $t('status.forbidden') }}
          </RadioButton>
        </RadioGroup>
      </template>
      <template #action="{ row }">
        <!-- 查看按钮 -->
        <Tooltip>
          <template #title>{{ $t('common.view') }}</template>
          <Button type="link" @click="showSettingDrawer(row, false)">
            <Icon icon="mdi:eye" class="inline-block align-middle text-2xl" />
          </Button>
        </Tooltip>
        <!-- 编辑按钮 -->
        <Tooltip v-if="author.includes('编辑')">
          <template #title>{{ $t('common.edit') }}</template>
          <Button type="link" @click="showSettingDrawer(row, true)">
            <Icon
              icon="mdi:edit-outline"
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </Tooltip>

        <!-- 审核通过 -->
        <Tooltip v-if="row.auditResult === -1 && author.includes('审核')">
          <template #title>{{ $t('common.pass') }}</template>
          <Button
            :loading="row.loading"
            type="link"
            @click="handleAudit(row, true)"
          >
            <Icon
              icon="mdi:success"
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </Tooltip>

        <!-- 审核不通过 -->
        <Tooltip v-if="row.auditResult === -1 && author.includes('审核')">
          <template #title>{{ $t('common.noPass') }}</template>
          <Button
            :loading="row.loading"
            type="link"
            @click="handleAudit(row, false)"
          >
            <Icon
              icon="icon-park-solid:error"
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </Tooltip>

        <!-- 删除数据 -->
        <Tooltip v-if="author.includes('删除')">
          <template #title>{{ $t('common.delete') }}</template>
          <Button danger type="link" @click="deleteStep(row.id)">
            <Icon
              icon="mdi-light:delete"
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </Tooltip>
      </template>
    </Grid>
  </Drawer>

  <Drawer
    v-model:open="settingDrawer"
    :width="850"
    placement="right"
    :title="isEdit ? $t('common.edit') : $t('common.view')"
    :footer-style="{ textAlign: 'right' }"
    @close="closeSettingDrawer()"
  >
    <Form
      ref="editForm"
      :label-col="{ span: 6 }"
      :model="editItem"
      :wrapper-col="{ span: 18 }"
    >
      <fieldset :disabled="!isEdit">
        <Row>
          <Col :span="12">
            <!-- 工步类型 -->
            <FormItem
              :label="$t('operationFormula.workStepType')"
              :rules="[{ required: true, message: '该项为必填项' }]"
              name="functionName"
            >
              <Input v-model:value="editItem.functionName" readonly />
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 执行条件 -->
            <FormItem
              :label="$t('operationFormula.executionCondition')"
              :rules="[{ required: true, message: '该项为必填项' }]"
              name="operatorType"
            >
              <RadioGroup
                v-model:value="editItem.operatorType"
                :options="executionCondition"
              />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="12">
            <!-- 步骤类型 -->
            <FormItem
              :label="$t('operationFormula.stepType')"
              :rules="[{ required: true, message: '该项为必填项' }]"
              name="stepType"
            >
              <RadioGroup
                v-model:value="editItem.stepType"
                :options="stepType"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 执行方式 -->
            <FormItem
              :label="$t('operationFormula.executionMode')"
              :rules="[{ required: true, message: '该项为必填项' }]"
              name="executeMode"
            >
              <RadioGroup
                v-model:value="editItem.executeMode"
                :options="executeMode"
              />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="12">
            <!-- 延时执行 -->
            <FormItem
              :label="$t('operationFormula.delayExecution')"
              :rules="[{ required: true, message: '该项为必填项' }]"
              name="executeDelay"
            >
              <InputNumber
                v-model:value="editItem.executeDelay"
                addon-after="S"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 检测周期 -->
            <FormItem
              :label="$t('operationFormula.detectCycle')"
              :rules="[{ required: true, message: '该项为必填项' }]"
              name="checkCycle"
            >
              <InputNumber
                v-model:value="editItem.checkCycle"
                addon-after="S"
              />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="12">
            <!-- 告警推送 -->
            <FormItem
              :label="$t('operationFormula.alarmPush')"
              :rules="[{ required: true, message: '该项为必填项' }]"
              name="hasAlert"
            >
              <RadioGroup
                v-model:value="editItem.hasAlert"
                :options="hasAlert"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 跳转工步 -->
            <FormItem
              :label="$t('operationFormula.jumpStep')"
              :rules="[{ required: true, message: '该项为必填项' }]"
              name="stepFunctionId"
            >
              <Select
                v-model:value="editItem.stepFunctionId"
                :options="stepList"
                :disabled="!isEdit && stepList.length <= 1"
              />
            </FormItem>
          </Col>
        </Row>
        <div class="rounded-lg bg-[#c9facd] p-4">
          <span class="text-lg font-bold">{{
            $t('operationFormula.conditionSetting')
          }}</span>
          <div
            class="my-4 rounded-lg bg-[#92e9df] p-4"
            v-for="(item, index) of editItem.opdetails"
            :key="index"
          >
            <Row>
              <Col :span="12">
                <!-- 触发源 -->
                <FormItem
                  :label="$t('operationFormula.triggerSource')"
                  :rules="[{ required: true, message: '该项为必填项' }]"
                  :name="['opdetails', index, 'source']"
                >
                  <Select
                    v-model:value="item.source"
                    :options="triggerSource"
                    :disabled="!isEdit"
                    allow-clear
                  />
                </FormItem>
              </Col>
              <Col :span="12">
                <!-- 脚本用途 -->
                <FormItem
                  :label="$t('operationFormula.scriptPurpose')"
                  :rules="[{ required: true, message: '该项为必填项' }]"
                  :name="['opdetails', index, 'scriptPurpose']"
                >
                  <Select
                    v-model:value="item.scriptPurpose"
                    :options="scriptUse"
                    :disabled="!isEdit"
                    allow-clear
                  />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col :span="12">
                <!-- 工序配方 -->
                <FormItem
                  :label="$t('operationFormula.processFormulation')"
                  :rules="[{ required: true, message: '该项为必填项' }]"
                  :name="['opdetails', index, 'proceTemplateId']"
                >
                  <Select
                    v-model:value="item.proceTemplateId"
                    :options="processFormulation"
                    disabled
                  />
                </FormItem>
              </Col>
              <Col :span="12">
                <!-- 点位设置 -->
                <FormItem
                  :label="$t('operationFormula.pointSetting')"
                  :rules="[{ required: true, message: '该项为必填项' }]"
                  :name="['opdetails', index, 'expression']"
                >
                  <Select
                    v-model:value="item.expression"
                    :options="pointInfo"
                    :disabled="!isEdit"
                    allow-clear
                  />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col :span="12">
                <!-- 表达式 -->
                <FormItem
                  :label="$t('operationFormula.expression')"
                  :rules="[{ required: true, message: '该项为必填项' }]"
                  :name="['opdetails', index, 'cronExpression']"
                >
                  <RadioGroup
                    v-model:value="item.cronExpression"
                    :options="expression"
                  />
                </FormItem>
              </Col>
              <Col :span="12">
                <!-- 参数数值 -->
                <FormItem
                  :label="$t('operationFormula.parameterValue')"
                  :rules="[{ required: true, message: '该项为必填项' }]"
                  :name="['opdetails', index, 'setValue']"
                >
                  <Input v-model:value="item.setValue" />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col :span="12" :offset="12">
                <!-- 删除按钮 -->
                <Button
                  type="primary"
                  danger
                  @click="removeRow(index)"
                  class="w-full"
                  v-if="isEdit"
                >
                  {{ $t('common.delete') }}
                </Button>
              </Col>
            </Row>
          </div>

          <Button type="primary" class="w-full" @click="addRow()" v-if="isEdit">
            {{ $t('common.add') }}
          </Button>
        </div>
      </fieldset>
    </Form>

    <!-- 抽屉底部操作按钮 -->
    <template #footer>
      <!-- 按钮组，包含取消和确认按钮 -->
      <Space>
        <!-- 取消按钮，点击后关闭人员操作抽屉 -->
        <Button @click="closeSettingDrawer">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认按钮，点击后提交人员操作信息 -->
        <Button type="primary" @click="settingSubmit()" v-if="isEdit">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped></style>
