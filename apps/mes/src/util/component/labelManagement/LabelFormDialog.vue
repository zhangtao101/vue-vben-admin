<script lang="ts" setup>
/**
 * 标签新增/编辑对话框组件
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';

/* eslint-disable perfectionist/sort-imports */

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Col,
  DatePicker,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Row,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createLabelRecord,
  fetchLabelRecordDetail,
  updateLabelRecord,
  uploadLabelExcel,
} from '#/api';

import ContractImportDialog from './ContractImportDialog.vue';
import MaterialSelectDialog from './MaterialSelectDialog.vue';

// Props
const props = defineProps<{
  open: boolean;
  recordId?: null | string;
}>();

// Emits
const emit = defineEmits<{
  success: [];
  'update:open': [value: boolean];
}>();

// 对话框状态
const dialogStatus = ref<'create' | 'update'>('create');
const importVisible = ref(false);
const saveLoading = ref(false);

// 采购合同导入
const contractDialogVisible = ref(false);

// 选择物料
const materialDialogVisible = ref(false);
const currentMaterialIndex = ref<number>(-1);

// 表单数据
const formData = reactive({
  id: null as null | string,
  recordCode: '',
  recordDate: '',
  operatorName: '',
  expressCode: '',
  remark: '',
  labelList: [] as any[],
});

// 表格列配置
const gridColumns: any[] = [
  {
    field: 'labelType',
    title: $t('storeManagement.labelPrint.labelType'),
    width: 80,
    slots: { default: 'labelType' },
  },
  {
    field: 'labelCode',
    title: $t('storeManagement.labelPrint.labelCode'),
    width: 180,
  },
  {
    field: 'materialCode',
    title: $t('storeManagement.labelPrint.materialCode'),
    width: 120,
  },
  {
    field: 'materialName',
    title: $t('storeManagement.labelPrint.materialName'),
    width: 300,
    slots: { default: 'materialName' },
  },
  { field: 'unit', title: $t('storeManagement.labelPrint.unit'), width: 80 },
  {
    field: 'labelNumber',
    title: $t('storeManagement.labelPrint.labelNumber'),
    width: 80,
  },
  {
    field: 'packageNumber',
    title: $t('storeManagement.labelPrint.packageNumber'),
    width: 120,
    slots: { default: 'packageNumber', footer: 'footerPackageNumber' },
  },
  {
    field: 'purchasePlanCode',
    title: $t('storeManagement.labelPrint.purchasePlanCode'),
    width: 120,
    slots: { default: 'purchasePlanCode' },
  },
  {
    field: 'contractCode',
    title: $t('storeManagement.labelPrint.billCode'),
    width: 120,
  },
  {
    field: 'formType',
    title: $t('storeManagement.labelPrint.formType'),
    width: 100,
  },
  {
    field: 'manufacturerName',
    title: $t('storeManagement.labelPrint.manufacturerName'),
    width: 150,
    showOverflow: 'tooltip',
  },
  {
    field: 'produceDate',
    title: $t('storeManagement.labelPrint.produceDate'),
    width: 140,
    slots: { default: 'produceDate' },
  },
  {
    field: 'validDate',
    title: $t('storeManagement.labelPrint.validDate'),
    width: 140,
    slots: { default: 'validDate' },
  },
  {
    field: 'batchCode',
    title: $t('storeManagement.labelPrint.batchCode'),
    width: 150,
    slots: { default: 'batchCode' },
  },
  {
    field: 'action',
    title: $t('common.operation'),
    width: 80,
    fixed: 'right',
    slots: { default: 'action' },
  },
];

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: gridColumns,
  footerData: [{ labelType: $t('storeManagement.labelPrint.total') }],
  height: 300,
  mergeFooterItems: [{ row: 0, col: 0, rowspan: 1, colspan: 1 }],
  showFooter: true,
  showOverflow: 'tooltip',
  stripe: true,
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// 监听表单数据变化，同步到表格
watch(
  () => formData.labelList,
  (val) => {
    if (gridApi.grid && gridApi.grid.loadData) {
      gridApi.grid.loadData(val);
    }
  },
  { deep: true, flush: 'post' },
);

// 监听打开状态
watch(
  () => props.open,
  (val) => {
    if (val) {
      if (props.recordId) {
        loadDetail();
      } else {
        resetFormData();
        dialogStatus.value = 'create';
      }
    }
  },
);

/**
 * 加载详情
 */
function loadDetail() {
  if (!props.recordId) return;
  fetchLabelRecordDetail(props.recordId)
    .then((data: any) => {
      Object.assign(formData, data);
      formData.labelList.forEach((item: any) => {
        if (item.contractDetailId) {
          item.addDisabled = true;
          item.deleteDisabled = item.status === 1;
        } else {
          item.addDisabled = item.status !== 1;
          item.deleteDisabled = item.status !== 1;
        }
      });
      dialogStatus.value = 'update';
    })
    .catch((error: any) => {
      message.error(
        error.message || $t('storeManagement.labelPrint.getDetailFailed'),
      );
    });
}

/**
 * 重置表单数据
 */
function resetFormData() {
  formData.id = null;
  formData.recordCode = '';
  formData.recordDate = '';
  formData.operatorName = '';
  formData.expressCode = '';
  formData.remark = '';
  formData.labelList = [];
}

/**
 * 保存标签记录
 */
function handleSubmit() {
  saveLoading.value = true;
  const submitData = { ...formData };
  const request =
    dialogStatus.value === 'create'
      ? createLabelRecord(submitData)
      : updateLabelRecord(submitData);

  request
    .then(() => {
      message.success(
        dialogStatus.value === 'create'
          ? $t('common.add') + $t('common.successfulOperation')
          : $t('common.edit') + $t('common.successfulOperation'),
      );
      emit('update:open', false);
      emit('success');
    })
    .catch((error: any) => {
      message.error(
        error.message || $t('storeManagement.labelPrint.saveFailed'),
      );
    })
    .finally(() => {
      saveLoading.value = false;
    });
}

/**
 * 显示导入选项
 */
function handleShowImport() {
  importVisible.value = true;
}

/**
 * 采购合同导入
 */
function handleContractImport() {
  importVisible.value = false;
  contractDialogVisible.value = true;
}

/**
 * 采购合同确定导入
 */
function handleContractConfirm(contracts: any[]) {
  contracts.forEach((element) => {
    const count = Number.parseInt(element.lableNumber, 10);
    for (let index = 0; index < count; index++) {
      formData.labelList.push({
        labelType: 1,
        labelNumber: 1,
        addDisabled: true,
        formType: element.formType,
        contractCode: element.contractCode,
        contractDetailId: element.contractDetailId,
        materialCode: element.materialCode,
        materialName: element.materialName,
        unit: element.unit,
        packageNumber: element.packageNumber,
        manufacturerName: element.manufacturerName,
        purchasePlanCode: element.purchasePlanCode,
      });
    }
  });
}

/**
 * Excel导入
 */
function handleExcelImport(e: any) {
  importVisible.value = false;
  const file = e.target.files[0];
  if (!file) return;

  const fileType = file.name.slice(file.name.lastIndexOf('.'));
  if (fileType !== '.xlsx' && fileType !== '.xls') {
    message.warning($t('storeManagement.labelPrint.invalidFileType'));
    return;
  }

  const param = new FormData();
  param.append('file', file, file.name);

  uploadLabelExcel(param)
    .then((list: any) => {
      const uploadList = (list || []).map((item: any) => ({
        ...item,
        labelType: 1,
        formType: '',
        labelNumber: 1,
        addDisabled: false,
      }));
      formData.labelList.push(...uploadList);
      message.success($t('storeManagement.labelPrint.uploadSuccess'));
    })
    .catch((error: any) => {
      message.error(
        error.message || $t('storeManagement.labelPrint.uploadFailed'),
      );
    });

  e.target.value = '';
}

/**
 * 增加一行
 */
function handleAddRow() {
  formData.labelList.push({
    labelType: 1,
    formType: '',
    labelNumber: 1,
    addDisabled: false,
    materialCode: '',
    materialName: '',
  });
}

/**
 * 清空表格
 */
function handleEmptyRow() {
  const hasNonEditable = formData.labelList.some((item) => item.status !== 1);
  if (hasNonEditable) {
    message.warning($t('storeManagement.labelPrint.nonEditableStatus'));
    return;
  }
  formData.labelList = [];
}

/**
 * 删除一行
 */
function handleDeleteRow(_row: any, index: number) {
  Modal.confirm({
    title: $t('storeManagement.labelPrint.confirmDelete'),
    content: $t('storeManagement.labelPrint.confirmDeleteRow'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      formData.labelList.splice(index, 1);
      message.success($t('storeManagement.labelPrint.deleteSuccess'));
    },
  });
}

/**
 * 选择物料
 */
function handleChooseMaterial(index: number) {
  currentMaterialIndex.value = index;
  materialDialogVisible.value = true;
}

/**
 * 确定选择物料
 */
function handleMaterialConfirm(material: any) {
  formData.labelList[currentMaterialIndex.value].materialCode =
    material.materialCode;
  formData.labelList[currentMaterialIndex.value].materialName =
    material.materialName;
  formData.labelList[currentMaterialIndex.value].unit = material.unit;
}

/**
 * 计算包装数量合计
 */
const packageNumberTotal = computed(() => {
  let total = 0;
  for (const item of formData.labelList) {
    const num = Number.parseFloat(item.packageNumber);
    if (!Number.isNaN(num)) {
      total += num;
    }
  }
  return total;
});

/**
 * 关闭对话框
 */
function handleClose() {
  emit('update:open', false);
}
</script>

<template>
  <Modal
    :open="open"
    :title="dialogStatus === 'create' ? $t('common.add') : $t('common.edit')"
    width="90%"
    :confirm-loading="saveLoading"
    @ok="handleSubmit"
    @cancel="handleClose"
  >
    <Form
      layout="horizontal"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
    >
      <Row :gutter="20">
        <Col :span="12">
          <FormItem :label="$t('storeManagement.labelPrint.recordCode')">
            <Input v-model:value="formData.recordCode" disabled />
          </FormItem>
        </Col>
        <Col :span="12">
          <FormItem :label="$t('storeManagement.labelPrint.recordDate')">
            <Input v-model:value="formData.recordDate" disabled />
          </FormItem>
        </Col>
      </Row>
      <Row :gutter="20">
        <Col :span="12">
          <FormItem :label="$t('storeManagement.labelPrint.operatorName')">
            <Input v-model:value="formData.operatorName" disabled />
          </FormItem>
        </Col>
        <Col :span="12">
          <FormItem :label="$t('storeManagement.labelPrint.expressCode')">
            <Input v-model:value="formData.expressCode" :maxlength="20" />
          </FormItem>
        </Col>
      </Row>
      <Row :gutter="20">
        <Col :span="24">
          <FormItem
            :label="$t('storeManagement.labelPrint.remark')"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 22 }"
          >
            <Input.TextArea v-model:value="formData.remark" :maxlength="50" />
          </FormItem>
        </Col>
      </Row>

      <Space class="mb-4">
        <Button type="primary" @click="handleShowImport">
          {{ $t('common.import') }}
        </Button>
        <Button type="primary" @click="handleAddRow">
          {{ $t('storeManagement.labelPrint.addRow') }}
        </Button>
        <Button type="primary" @click="handleEmptyRow">
          {{ $t('storeManagement.labelPrint.emptyRow') }}
        </Button>
        <a href="/static/downLoad/标签导入.xlsx" target="_blank">
          <Button type="primary">{{
            $t('storeManagement.labelPrint.excelDownload')
          }}</Button>
        </a>
      </Space>

      <!-- 导入选项 -->
      <div v-if="importVisible" class="mb-4 p-2 bg-gray-100">
        <Space>
          <Button type="primary" @click="handleContractImport">
            {{ $t('storeManagement.labelPrint.contractImport') }}
          </Button>
          <span class="ant-btn ant-btn-primary">
            {{ $t('storeManagement.labelPrint.excelImport') }}
            <input
              type="file"
              accept=".xls,.xlsx"
              style="
                position: absolute;
                top: 0;
                right: 0;
                font-size: 100px;
                opacity: 0;
              "
              @change="handleExcelImport"
            />
          </span>
        </Space>
      </div>

      <Grid>
        <template #labelType="{ row }">
          {{
            row.labelType === 1
              ? $t('storeManagement.labelPrint.materialLabel')
              : ''
          }}
        </template>
        <template #footerPackageNumber>
          {{ packageNumberTotal }}
        </template>
        <template #materialName="{ row, $rowIndex }">
          <Input v-model:value="row.materialName" disabled>
            <template #addonAfter>
              <Tooltip>
                <template #title>
                  {{ $t('storeManagement.labelPrint.chooseMaterial') }}
                </template>
                <Button
                  type="link"
                  class="px-1"
                  :disabled="row.addDisabled"
                  @click="handleChooseMaterial($rowIndex)"
                >
                  <Icon
                    icon="mdi:magnify"
                    class="inline-block align-middle text-lg"
                  />
                </Button>
              </Tooltip>
            </template>
          </Input>
        </template>
        <template #packageNumber="{ row }">
          <Input
            v-model:value="row.packageNumber"
            :disabled="row.addDisabled"
          />
        </template>
        <template #purchasePlanCode="{ row }">
          <Input
            v-model:value="row.purchasePlanCode"
            :disabled="row.addDisabled"
          />
        </template>
        <template #produceDate="{ row }">
          <DatePicker
            v-model:value="row.produceDate"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </template>
        <template #validDate="{ row }">
          <DatePicker
            v-model:value="row.validDate"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </template>
        <template #batchCode="{ row }">
          <Input v-model:value="row.batchCode" :maxlength="20" />
        </template>
        <template #action="{ row, $rowIndex }">
          <Tooltip>
            <template #title>{{ $t('common.delete') }}</template>
            <Button
              type="link"
              danger
              class="px-1"
              :disabled="row.deleteDisabled"
              @click="handleDeleteRow(row, $rowIndex)"
            >
              <Icon
                icon="mdi:delete-forever-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Form>

    <!-- 采购合同导入对话框 -->
    <ContractImportDialog
      v-model:open="contractDialogVisible"
      @confirm="handleContractConfirm"
    />

    <!-- 选择物料对话框 -->
    <MaterialSelectDialog
      v-model:open="materialDialogVisible"
      @confirm="handleMaterialConfirm"
    />
  </Modal>
</template>
