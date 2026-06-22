<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

/**
 * [INPUT]: 依赖 #/api (smtWorksheetCreate/smtWorksheetDetail/smtWorksheetUpdate/
 *         smtPlanSituation/smtAllLineList/smtWorkerTypeList)、
 *         #/locales ($t)、SubPlanSelectModal 组件
 * [OUTPUT]: 对外提供 WorkSheetDrawer 抽屉组件，通过 defineExpose({ open }) 暴露 open 方法供父组件调用
 * [POS]: 属于 planManagement 模块的工单新增/编辑/修改时间抽屉子组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-06-18 10:43:00
 */
import { computed, ref } from 'vue';

import {
  Button,
  DatePicker,
  Drawer,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Textarea,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  listWordListByParentCode,
  smtAllLineList,
  smtPlanSituation,
  smtWorksheetCreate,
  smtWorksheetDetail,
  smtWorksheetUpdate,
} from '#/api';
import { $t } from '#/locales';

import SubPlanSelectModal from './SubPlanSelectModal.vue';

defineOptions({ name: 'WorkSheetDrawer' });

const emit = defineEmits<{
  refresh: [];
}>();

// region 状态管理
const show = ref(false);
const currentMode = ref<'create' | 'timeChange' | 'update'>('create');
const saveLoading = ref(false);

// 线别列表
const lineOptions = ref<any[]>([]);
// 线别下拉选项（value 使用 label 匹配当前绑定逻辑）
const lineSelectOptions = computed(() =>
  lineOptions.value.map((item) => ({
    value: item.label,
    label: item.label,
  })),
);
// 工单类型列表
const workerTypeOptions = ref<any[]>([]);
// 工单类型下拉选项
const workerTypeSelectOptions = computed(() =>
  workerTypeOptions.value.map((item) => ({
    value: item.wordCode,
    label: item.wordName,
  })),
);

// 内部表格数据
const workSheetList = ref<any[]>([]);
// 已有的部件计划号列表（去重用）
const existingSubPlanCodes = ref<string[]>([]);

// 提示弹窗
const barDialogVisible = ref(false);
const oldNumber = ref<any>(null);

// 子计划选择弹窗 ref
const subPlanSelectRef = ref();
// endregion

// region 内部表格
const innerGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { field: 'planCode', title: '计划号', minWidth: 180, },
    {
      field: 'subProductName',
      title: '部件名称',
      minWidth: 180,
      showOverflow: true,
    },
    { field: 'subPlanCode', title: '部件计划号', minWidth: 100 },
    { field: 'subPlanNumber', title: '部件计划数量', minWidth: 120 },
    { field: 'produceUnarrangedNumber', title: '生产未排数', minWidth: 100 },
    { field: 'produceNotFinishNumber', title: '生产未完数', minWidth: 100 },
    {
      field: 'planDateStart',
      title: '计划时间',
      minWidth: 200,
      slots: { default: 'planDateStart' },
    },
    {
      field: 'workSheetPlanNumber',
      title: '工单计划数',
      minWidth: 100,
      slots: { default: 'workSheetPlanNumber' },
    },
    {
      field: 'lineName',
      title: '任务线别',
      minWidth: 200,
      slots: { default: 'lineName' },
    },
    {
      field: 'processTypeCode',
      title: '工单单别',
      minWidth: 200,
      slots: { default: 'processTypeCode' },
    },
    { field: 'productCode', title: '产品编号', minWidth: 180, },
    {
      field: 'productName',
      title: '产品名称',
      minWidth: 180,
      showOverflow: true,
    },
    { field: 'workSheetCode', title: '工单号', minWidth: 150 },
    { field: 'workSheetFinishNumber', title: '工单完成数', minWidth: 100 },
    { field: 'produceWorkshop', title: '生产车间', minWidth: 100 },
    {
      field: 'remark',
      title: '备注',
      minWidth: 180,
      slots: { default: 'remark' },
    },
    {
      field: 'action',
      title: '操作',
      fixed: 'right',
      slots: { default: 'action' },
    },
  ],
  height: 400,
  stripe: true,
  data: [],
};

const [InnerGrid, innerGridApi] = useVbenVxeGrid({ gridOptions: innerGridOptions });
// endregion

// region 初始化数据
function loadLineOptions() {
  smtAllLineList(1).then((res: any) => {
    lineOptions.value = (Array.isArray(res) ? res : []).map((item: any) => ({
      value: item.id,
      label: item.lineName,
      workshopName: item.workshopName,
    }));
  });
}

function loadWorkerTypeOptions() {
  listWordListByParentCode('GDLX').then((res: any) => {
    workerTypeOptions.value = Array.isArray(res) ? res : [];
  });
}

loadLineOptions();
loadWorkerTypeOptions();
// endregion

// region 任务线别变更
function handleLineChange(index: number, value: string) {
  const item = lineOptions.value.find((opt) => opt.label === value);
  if (item) {
    workSheetList.value[index].lineId = item.value;
    workSheetList.value[index].produceWorkshop = item.workshopName;
  }
}
// endregion

// region 工单计划数校验
function handlePlanNumberChange(row: any) {
  if (row.produceUnarrangedNumber < row.workSheetPlanNumber) {
    barDialogVisible.value = true;
    oldNumber.value = row.produceUnarrangedNumber;
  }
}

function handleBarConfirm() {
  barDialogVisible.value = false;
}

function handleBarCancel() {
  barDialogVisible.value = false;
  workSheetList.value.forEach((item: any) => {
    if (oldNumber.value === item.produceUnarrangedNumber) {
      item.workSheetPlanNumber = '';
    }
  });
}
// endregion

// region 删除行
function deleteRow(index: number) {
  workSheetList.value.splice(index, 1);
  existingSubPlanCodes.value.splice(index, 1);
  innerGridApi.reload(workSheetList.value);
}
// endregion

// region 选择子计划
function handleChoosePlan() {
  subPlanSelectRef.value.open();
}

function handleSubPlanConfirm(records: any[]) {
  console.log(records);
  const newCodes = records.map((r: any) => r.subPlanCode);
  existingSubPlanCodes.value.push(...newCodes);
  smtPlanSituation({
    partPlanCodeList: newCodes.join(','),
    processType: subPlanSelectRef.value.queryParams.processType,
    num: workSheetList.value.length,
  })
    .then((res: any) => {
      if (Array.isArray(res)) {
        res.forEach((item: any) => {
          workSheetList.value.push(item);
        });
      }
      innerGridApi.grid.reloadData(workSheetList.value);
    })
    .catch(() => {
      message.error('获取计划情况失败');
    });
}
// endregion

// region 加载详情（编辑/修改时间）
function loadDetail(id: string) {
  smtWorksheetDetail(id).then((data: any) => {
    if (data) {
      workSheetList.value = [data];
      existingSubPlanCodes.value = [data.subPlanCode];
      console.log(workSheetList.value);
      innerGridApi.grid.reloadData(workSheetList.value);
    }
  });
}
// endregion

// region 提交
function handleSubmit() {
  if (workSheetList.value.length === 0) {
    message.warning('请选择计划号');
    return;
  }

  if (currentMode.value === 'create') {
    saveLoading.value = true;
    smtWorksheetCreate(workSheetList.value)
      .then(() => {
        message.success($t('common.successfulOperation'));
        show.value = false;
        emit('refresh');
      })
      .finally(() => {
        saveLoading.value = false;
      });
  } else {
    const item = workSheetList.value[0];
    const params: any = {
      id: item.id,
      lineId: item.lineId,
      lineName: item.lineName,
      planDateStart: item.planDateStart,
      remark: item.remark,
      workSheetPlanNumber: item.workSheetPlanNumber,
      worksheetCodea: item.worksheetCodea,
      subPlanCode: item.subPlanCode,
    };
    // 编辑模式下也需要传工单单别
    if (currentMode.value === 'update') {
      params.processTypeCode = item.processTypeCode;
    }
    saveLoading.value = true;
    smtWorksheetUpdate(params)
      .then(() => {
        message.success($t('common.successfulOperation'));
        show.value = false;
        emit('refresh');
      })
      .finally(() => {
        saveLoading.value = false;
      });
  }
}
// endregion

// region 关闭
function handleClose() {
  show.value = false;
}
// endregion

// region open 方法
const textMap: Record<string, string> = {
  create: '新增',
  update: '编辑',
  timeChange: '修改时间',
};

function open(mode: 'create' | 'timeChange' | 'update', row?: any) {
  currentMode.value = mode;
  workSheetList.value = [];
  existingSubPlanCodes.value = [];

  if (mode === 'create') {
    show.value = true;
  } else if (row?.id) {
    loadDetail(row.id);
    show.value = true;
  }
}

defineExpose({ open });
// endregion
</script>

<template>
  <Drawer
    v-model:open="show"
    :title="textMap[currentMode]"
    :footer-style="{ textAlign: 'right' }"
    width="90%"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <!-- 选择计划号按钮（仅新增模式） -->
    <Button
      v-if="currentMode === 'create'"
      type="primary"
      style="margin-bottom: 8px"
      @click="handleChoosePlan"
    >
      请选择计划号
    </Button>

    <!-- 内部表格 -->
    <InnerGrid>
      <!-- 计划时间 -->
      <template #planDateStart="{ row }">
        <DatePicker
          v-model:value="row.planDateStart"
          type="date"
          style="width: 160px"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :disabled-date="(current: any) => current < dayjs().subtract(1, 'day')"
        />
      </template>
      <!-- 工单计划数 -->
      <template #workSheetPlanNumber="{ row }">
        <InputNumber
          v-model:value="row.workSheetPlanNumber"
          :disabled="currentMode === 'timeChange'"
          style="width: 100%"
          @change="handlePlanNumberChange(row)"
        />
      </template>
      <!-- 任务线别 -->
      <template #lineName="{ row, rowIndex }">
        <Select
          v-model:value="row.lineName"
          :options="lineSelectOptions"
          :disabled="currentMode === 'timeChange'"
          placeholder="请选择"
          style="width: 100%"
          @change="(val: any) => handleLineChange(rowIndex, val)"
        />
      </template>
      <!-- 工单单别 -->
      <template #processTypeCode="{ row }">
        <Select
          v-model:value="row.processTypeCode"
          :options="workerTypeSelectOptions"
          :disabled="currentMode === 'timeChange'"
          placeholder="请选择"
          style="width: 100%"
        />
      </template>
      <!-- 备注 -->
      <template #remark="{ row }">
        <Textarea v-model:value="row.remark" />
      </template>
      <!-- 操作 -->
      <template #action="{ rowIndex }">
        <Button
          v-if="currentMode === 'create'"
          danger
          type="link"
          @click="deleteRow(rowIndex)"
        >
          删除
        </Button>
      </template>
    </InnerGrid>

    <template #footer>
      <Space>
        <Button @click="handleClose">{{ $t('common.cancel') }}</Button>
        <Button type="primary" :loading="saveLoading" @click="handleSubmit">
          {{ $t('common.save') }}
        </Button>
      </Space>
    </template>
  </Drawer>

  <!-- 工单计划数提示弹窗 -->
  <Modal
    v-model:open="barDialogVisible"
    title="提示"
    width="40%"
    @ok="handleBarConfirm"
    @cancel="handleBarCancel"
  >
    <span>未排数小于计划数，是否继续操作?</span>
  </Modal>

  <!-- 子计划选择弹窗 -->
  <SubPlanSelectModal ref="subPlanSelectRef" @confirm="handleSubPlanConfirm" />
</template>
