<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { $t } from '@vben/locales';
import { useAccessStore } from '@vben/stores';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Radio,
  RadioGroup,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Upload,
} from 'ant-design-vue';

import {
  createIpcReport,
  deleteIpcReportFile,
  fetchIpcReportDetail,
  fetchSendFormDetail,
  getCheckNumber,
  saveIpcReportFile,
  updateIpcReport,
} from '#/api';

import MaterialSelectDrawer from './MaterialSelectDrawer.vue';

// Props
const props = defineProps<{
  id: string;
  mode: 'create' | 'update' | 'view';
  visible: boolean;
}>();

// Emits
const emit = defineEmits<{
  success: [];
  'update:visible': [value: boolean];
}>();

// 表单数据
const formData = ref<any>({
  checkResult: undefined,
  judgeTime: '',
  receiveNumber: '',
  checkNumber: '',
  qualifiedNumber: '',
  notQualifiedNumber: '',
  manufacturerName: '',
  sendFormCode: '',
  materialCode: '',
  materialName: '',
  sendDate: '',
  remark: '',
  detailList: [],
  itemResults: [
    {
      itemCodeName: '包装',
      itemCode: 1,
      checkResult: '',
      judgeResult: 1,
      flawResult: '',
    },
    {
      itemCodeName: '外观',
      itemCode: 2,
      checkResult: '',
      judgeResult: 1,
      flawResult: '',
    },
    {
      itemCodeName: '尺寸',
      itemCode: 3,
      checkResult: '',
      judgeResult: 1,
      flawResult: '',
    },
    {
      itemCodeName: '性能',
      itemCode: 4,
      checkResult: '',
      judgeResult: 1,
      flawResult: '',
    },
  ],
  iqcFlaw: {
    isOther: 1,
    fatalFlaw: '',
    seriousFlaw: '',
    minorFlaw: '',
    samplePlan: '',
    remark: '',
    sampleStandard: [],
  },
  type: 1,
});

// 质检结论选项
const checkResultOptions = [
  { value: 1, label: $t('storeManagement.inspectionSlip.qualified') },
  { value: 2, label: $t('storeManagement.inspectionSlip.unqualified') },
  { value: 3, label: $t('storeManagement.inspectionSlip.concessionAccept') },
  { value: 4, label: $t('storeManagement.inspectionSlip.emergencyRelease') },
];

// 检验判定选项
const judgeResultOptions = [
  { value: 1, label: $t('storeManagement.ipcReport.qualified') },
  { value: 0, label: $t('storeManagement.ipcReport.unqualified') },
];

// 受损程度选项
const flawResultOptions = [
  { value: 1, label: $t('storeManagement.ipcReport.fatal') },
  { value: 2, label: $t('storeManagement.ipcReport.serious') },
  { value: 3, label: $t('storeManagement.ipcReport.minor') },
];

// 抽样检验计划选项
const samplePlanOptions = [
  { value: 1, label: $t('storeManagement.ipcReport.normal') },
  { value: 2, label: $t('storeManagement.ipcReport.tightened') },
  { value: 3, label: $t('storeManagement.ipcReport.reduced') },
  { value: 4, label: $t('storeManagement.ipcReport.full') },
];

// 是否显示标准选项
const showGbStandard = ref(true);

// 物料选择抽屉
const materialSelectVisible = ref(false);

// 加载状态
const loading = ref(false);

// 文件上传列表
const uploadFileList = ref<any[]>([]);

// 上传接口地址
const uploadAction = `/ht/${import.meta.env.VITE_GLOB_MES_FILE}/iqc/uploadFile`;

// Access store
const accessStore = useAccessStore();

// 标题
const title = computed(() => {
  switch (props.mode) {
    case 'create': {
      return $t('storeManagement.ipcReport.add');
    }
    case 'update': {
      return $t('common.edit');
    }
    case 'view': {
      return $t('common.view');
    }
    default: {
      return '';
    }
  }
});

// 是否只读
const readonly = computed(() => props.mode === 'view');

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.mode === 'create') {
        resetForm();
      } else if (props.id) {
        loadDetail();
      }
    }
  },
);

// 重置表单
function resetForm() {
  formData.value = {
    checkResult: undefined,
    judgeTime: '',
    receiveNumber: '',
    checkNumber: '',
    qualifiedNumber: '',
    notQualifiedNumber: '',
    manufacturerName: '',
    sendFormCode: '',
    materialCode: '',
    materialName: '',
    sendDate: '',
    remark: '',
    detailList: [],
    itemResults: [
      {
        itemCodeName: '包装',
        itemCode: 1,
        checkResult: '',
        judgeResult: 1,
        flawResult: '',
      },
      {
        itemCodeName: '外观',
        itemCode: 2,
        checkResult: '',
        judgeResult: 1,
        flawResult: '',
      },
      {
        itemCodeName: '尺寸',
        itemCode: 3,
        checkResult: '',
        judgeResult: 1,
        flawResult: '',
      },
      {
        itemCodeName: '性能',
        itemCode: 4,
        checkResult: '',
        judgeResult: 1,
        flawResult: '',
      },
    ],
    iqcFlaw: {
      isOther: 1,
      fatalFlaw: '',
      seriousFlaw: '',
      minorFlaw: '',
      samplePlan: '',
      remark: '',
      sampleStandard: [],
    },
    type: 1,
  };
  uploadFileList.value = [];
}

// 加载详情
function loadDetail() {
  loading.value = true;
  fetchIpcReportDetail(props.id)
    .then((res: any) => {
      formData.value = res;
      showGbStandard.value = res.iqcFlaw?.isOther === 1;
      // 加载附件
      if (res.fileList && res.fileList.length > 0) {
        uploadFileList.value = res.fileList.map((item: any) => ({
          id: item.id,
          name: item.fileName,
          url: item.fileUrl,
          fileName: item.fileName,
        }));
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

// 选择物料
function handleSelectMaterial() {
  materialSelectVisible.value = true;
}

// 物料选择确认
function handleMaterialConfirm(data: any) {
  // 处理单选或多选的数据
  const selectedData = Array.isArray(data.selectedRows)
    ? data.selectedRows
    : [data];

  // 检查是否选择了多条记录,验证必须满足三个条件:
  // 1. 同一个送检单
  // 2. 同一个供应厂商
  // 3. 同一个材料编号
  if (selectedData.length > 1) {
    const firstRow = selectedData[0];
    const firstFormCode = firstRow.formCode.split('-')[0];

    for (let i = 1; i < selectedData.length; i++) {
      const row = selectedData[i];
      const currentFormCode = row.formCode.split('-')[0];

      if (
        currentFormCode !== firstFormCode ||
        row.manufacturerName !== firstRow.manufacturerName ||
        row.materialCode !== firstRow.materialCode
      ) {
        message.warning($t('storeManagement.ipcReport.sameMaterialWarning'));
        return;
      }
    }
  }

  // 先将receiveNumber初始化为0,后面累加
  formData.value.receiveNumber = 0;

  // 质检信息赋值 - 先赋值基础信息
  formData.value.manufacturerName = data.manufacturerName;
  formData.value.materialCode = data.materialCode;
  formData.value.materialName = data.materialName;
  formData.value.sendDate = data.sendDate;
  formData.value.sendFormCode = data.formCode.split('-')[0];
  formData.value.unit = data.unit;
  formData.value.checkResult = '';
  formData.value.qualifiedNumber = '';

  // 对选中的每一行进行处理
  selectedData.forEach((item: any) => {
    item.notQualifiedNumber =
      Number(item.checkNumber) - Number(item.qualifiedNumber);
  });

  // 根据送检单号获取详情数据，填充 detailList
  const params = {
    sendFormCode: data.formCode.split('-')[0],
    materialCode: data.materialCode,
    manufacturerName: data.manufacturerName,
  };

  fetchSendFormDetail(params).then((res: any) => {
    formData.value.detailList = res;

    // 累加送检数量
    for (let j = 0; j < formData.value.detailList.length; j++) {
      formData.value.receiveNumber += Number(
        formData.value.detailList[j].receiveNumber || 0,
      );
    }

    // 调用getCheckNumber接口获取抽检数量
    getCheckNumber(formData.value.receiveNumber).then((response: any) => {
      formData.value.checkNumber = response;
    });

    // 对detailList进行处理
    formData.value.detailList.forEach((item: any) => {
      item.notQualifiedNumber =
        Number(item.checkNumber) - Number(item.qualifiedNumber || 0);
      item.sendFormId = item.id;
      delete item.id;
    });

    // 判断是否是用户选中的记录,添加selected标识
    const result = formData.value.detailList.map((item: any) =>
      selectedData.some((item1: any) => item1.id === item.sendFormId)
        ? { ...item, selected: true }
        : { ...item, selected: false },
    );
    formData.value.detailList = result;

    // 将选中的记录排在前面
    formData.value.detailList.sort((a: any, b: any) => b.selected - a.selected);
  });

  // 不合格数量 = 送检数量 - 合格数量
  formData.value.notQualifiedNumber =
    Number(formData.value.receiveNumber) -
    Number(formData.value.qualifiedNumber || 0);
}

// 合格数量变化
function handleQualifiedNumberChange(value: number | string) {
  if (formData.value.checkNumber) {
    // 不合格数量 = 抽检数量 - 合格数量
    formData.value.notQualifiedNumber =
      Number(formData.value.checkNumber) - (Number(value) || 0);
  }
}

// 详情表格合格数量变化
function handleDetailQualifiedChange(record: any) {
  record.notQualifiedNumber =
    Number(record.checkNumber) - Number(record.qualifiedNumber || 0);
}

// 标准切换
function handleStandardChange(e: any) {
  showGbStandard.value = e.target.value === 1;
}

// 抽检依据和标准变化
function handleSampleStandardChange(checkedValues: any) {
  formData.value.iqcFlaw.sampleStandard = checkedValues;
}

// 关闭抽屉
function handleClose() {
  emit('update:visible', false);
}

// 文件上传成功
function handleUploadSuccess({ file, response }: any) {
  if (response.code === 200 && response.data) {
    uploadFileList.value.push({
      id: response.data.id,
      name: file.name,
      url: response.data.fileUrl,
      fileName: response.data.fileName,
    });
    message.success($t('common.successfulOperation'));
  } else {
    message.error(response.msg || $t('common.operationFailure'));
  }
}

// 文件上传失败
function handleUploadError() {
  message.error($t('common.operationFailure'));
}

// 删除文件
function handleDeleteFile(fileId: string) {
  deleteIpcReportFile(fileId).then(() => {
    uploadFileList.value = uploadFileList.value.filter(
      (item: any) => item.id !== fileId,
    );
    message.success($t('common.successfulOperation'));
  });
}

// 提交审核
function handleSubmit() {
  formData.value.type = 2;
  // 保存附件信息
  const fileParams = uploadFileList.value.map((item: any) => ({
    formId: props.mode === 'create' ? '' : props.id,
    filePath: item.fileName,
    fileUrl: item.url,
  }));

  if (fileParams.length > 0) {
    saveIpcReportFile(fileParams).then(() => {
      submitForm();
    });
  } else {
    submitForm();
  }
}

// 提交表单
function submitForm() {
  const api = props.mode === 'create' ? createIpcReport : updateIpcReport;
  api(formData.value).then(() => {
    message.success($t('common.successfulOperation'));
    emit('success');
    handleClose();
  });
}

// 保存（不提交审核）
function handleSave() {
  formData.value.type = 1;
  submitForm();
}

// 打印
function handlePrint() {
  message.warning('打印功能暂未完成');
}

// 质检详情表格列
const detailColumns: any[] = [
  {
    title: $t('storeManagement.labelPrint.materialCode'),
    dataIndex: 'materialCode',
    width: 120,
  },
  {
    title: $t('storeManagement.labelPrint.materialName'),
    dataIndex: 'materialName',
    width: 150,
  },
  {
    title: $t('storeManagement.labelPrint.unit'),
    dataIndex: 'unit',
    width: 60,
  },
  {
    title: $t('storeManagement.ipcReport.receiveNumber'),
    dataIndex: 'checkNumber',
    width: 100,
  },
  {
    title: $t('storeManagement.labelPrint.labelCode'),
    dataIndex: 'labelCode',
    width: 150,
  },
  {
    title: $t('storeManagement.labelPrint.manufacturerName'),
    dataIndex: 'manufacturerName',
    width: 150,
  },
  {
    title: $t('storeManagement.ipcReport.batchCode'),
    dataIndex: 'batchCode',
    width: 130,
  },
  {
    title: $t('storeManagement.labelPrint.contractCode'),
    dataIndex: 'contractCode',
    width: 120,
  },
  {
    title: $t('storeManagement.ipcReport.qualifiedNumber'),
    dataIndex: 'qualifiedNumber',
    width: 120,
  },
  {
    title: $t('storeManagement.ipcReport.notQualifiedNumber'),
    dataIndex: 'notQualifiedNumber',
    width: 120,
  },
];

// 检验项表格列
const itemColumns = [
  {
    title: $t('storeManagement.ipcReport.itemCodeName'),
    dataIndex: 'itemCodeName',
    width: 100,
  },
  {
    title: $t('storeManagement.ipcReport.itemCheckResult'),
    dataIndex: 'checkResult',
    width: 300,
  },
  {
    title: $t('storeManagement.ipcReport.judgeResult'),
    dataIndex: 'judgeResult',
    width: 120,
  },
  {
    title: $t('storeManagement.ipcReport.flawResult'),
    dataIndex: 'flawResult',
    width: 120,
  },
];
</script>

<template>
  <Drawer
    :open="visible"
    :title="title"
    :width="1000"
    @close="handleClose"
    :footer-style="{ textAlign: 'right' }"
  >
    <Spin :spinning="loading">
      <Divider orientation="left">
        {{ $t('storeManagement.ipcReport.iqcInfo') }}
      </Divider>
      <Form
        :model="formData"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <Row :gutter="16">
          <Col :span="8">
            <FormItem
              :label="$t('storeManagement.ipcReport.checkResult')"
              :required="!readonly"
            >
              <Select
                v-model:value="formData.checkResult"
                :placeholder="$t('common.pleaseSelect')"
                :options="checkResultOptions"
                :disabled="readonly"
              />
            </FormItem>
          </Col>
          <Col :span="8">
            <FormItem :label="$t('storeManagement.ipcReport.judgeTime')">
              <Input v-model:value="formData.judgeTime" disabled />
            </FormItem>
          </Col>
          <Col :span="8">
            <FormItem :label="$t('storeManagement.ipcReport.receiveNumber')">
              <Input v-model:value="formData.receiveNumber" disabled />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col :span="8">
            <FormItem :label="$t('storeManagement.ipcReport.checkNumber')">
              <InputNumber
                v-model:value="formData.checkNumber"
                :disabled="readonly"
                style="width: 100%"
              />
            </FormItem>
          </Col>
          <Col :span="8">
            <FormItem
              :label="$t('storeManagement.ipcReport.qualifiedNumber')"
              :required="!readonly"
            >
              <InputNumber
                v-model:value="formData.qualifiedNumber"
                :disabled="readonly"
                :max="formData.checkNumber"
                :min="0"
                style="width: 100%"
                @change="handleQualifiedNumberChange"
              />
            </FormItem>
          </Col>
          <Col :span="8">
            <FormItem
              :label="$t('storeManagement.ipcReport.notQualifiedNumber')"
            >
              <Input v-model:value="formData.notQualifiedNumber" disabled />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col :span="8">
            <FormItem
              :label="$t('storeManagement.labelPrint.manufacturerName')"
            >
              <Input v-model:value="formData.manufacturerName" disabled />
            </FormItem>
          </Col>
          <Col :span="8">
            <FormItem :label="$t('storeManagement.ipcReport.sendFormCode')">
              <Input v-model:value="formData.sendFormCode" disabled />
            </FormItem>
          </Col>
          <Col :span="8">
            <FormItem
              :label="$t('storeManagement.labelPrint.materialCode')"
              :required="!readonly && mode === 'create'"
            >
              <Input
                v-model:value="formData.materialCode"
                :disabled="readonly || mode !== 'create'"
              >
                <template v-if="!readonly && mode === 'create'" #suffix>
                  <Button
                    size="small"
                    type="primary"
                    @click="handleSelectMaterial"
                  >
                    {{ $t('storeManagement.labelPrint.choose') }}
                  </Button>
                </template>
              </Input>
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col :span="8">
            <FormItem :label="$t('storeManagement.labelPrint.materialName')">
              <Input v-model:value="formData.materialName" disabled />
            </FormItem>
          </Col>
          <Col :span="8">
            <FormItem :label="$t('storeManagement.ipcReport.sendDate')">
              <Input v-model:value="formData.sendDate" disabled />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col :span="24">
            <FormItem
              :label="$t('storeManagement.ipcReport.remark')"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 20 }"
            >
              <Input.TextArea
                v-model:value="formData.remark"
                :disabled="readonly"
                :maxlength="100"
                :rows="3"
              />
            </FormItem>
          </Col>
        </Row>
      </Form>

      <Divider orientation="left">
        {{ $t('storeManagement.ipcReport.iqcDetail') }}
      </Divider>
      <Table
        :columns="detailColumns"
        :data-source="formData.detailList"
        :pagination="false"
        size="small"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'qualifiedNumber'">
            <InputNumber
              v-model:value="record.qualifiedNumber"
              :max="record.checkNumber"
              :min="0"
              :disabled="readonly"
              style="width: 100%"
              @change="handleDetailQualifiedChange(record)"
            />
          </template>
          <template v-else-if="column.dataIndex === 'notQualifiedNumber'">
            {{
              Number(record.checkNumber) - Number(record.qualifiedNumber || 0)
            }}
          </template>
        </template>
      </Table>

      <Divider orientation="left">
        {{ $t('storeManagement.ipcReport.sampleStandard') }}
      </Divider>
      <Form
        :model="formData.iqcFlaw"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <Row :gutter="16">
          <Col :span="24">
            <FormItem :label-col="{ span: 2 }" :wrapper-col="{ span: 20 }">
              <RadioGroup
                v-model:value="formData.iqcFlaw.isOther"
                :disabled="readonly"
                @change="handleStandardChange"
              >
                <Radio :value="1">
                  {{ $t('storeManagement.ipcReport.gbStandard') }}
                </Radio>
                <Radio :value="0">
                  {{ $t('storeManagement.ipcReport.other') }}
                </Radio>
              </RadioGroup>
            </FormItem>
          </Col>
        </Row>
        <template v-if="showGbStandard">
          <Row :gutter="16">
            <Col :span="24">
              <FormItem
                :label="$t('storeManagement.ipcReport.fatalFlaw')"
                :label-col="{ span: 2 }"
                :wrapper-col="{ span: 20 }"
              >
                <RadioGroup
                  v-model:value="formData.iqcFlaw.fatalFlaw"
                  :disabled="readonly"
                >
                  <Radio :value="1">0</Radio>
                </RadioGroup>
              </FormItem>
            </Col>
          </Row>
          <Row :gutter="16">
            <Col :span="24">
              <FormItem
                :label="$t('storeManagement.ipcReport.seriousFlaw')"
                :label-col="{ span: 2 }"
                :wrapper-col="{ span: 20 }"
              >
                <RadioGroup
                  v-model:value="formData.iqcFlaw.seriousFlaw"
                  :disabled="readonly"
                >
                  <Radio :value="1">0.2</Radio>
                  <Radio :value="2">0.4</Radio>
                  <Radio :value="3">0.65</Radio>
                </RadioGroup>
              </FormItem>
            </Col>
          </Row>
          <Row :gutter="16">
            <Col :span="24">
              <FormItem
                :label="$t('storeManagement.ipcReport.minorFlaw')"
                :label-col="{ span: 2 }"
                :wrapper-col="{ span: 20 }"
              >
                <RadioGroup
                  v-model:value="formData.iqcFlaw.minorFlaw"
                  :disabled="readonly"
                >
                  <Radio :value="1">1.0</Radio>
                  <Radio :value="2">1.5</Radio>
                  <Radio :value="3">2.5</Radio>
                </RadioGroup>
              </FormItem>
            </Col>
          </Row>
        </template>
        <Row v-else :gutter="16">
          <Col :span="24">
            <FormItem :label-col="{ span: 2 }" :wrapper-col="{ span: 20 }">
              <Input.TextArea
                v-model:value="formData.iqcFlaw.remark"
                :disabled="readonly"
                :maxlength="100"
                :rows="3"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col :span="24">
            <FormItem
              :label="$t('storeManagement.ipcReport.samplePlan')"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 20 }"
            >
              <RadioGroup
                v-model:value="formData.iqcFlaw.samplePlan"
                :disabled="readonly"
              >
                <Radio
                  v-for="item in samplePlanOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </Radio>
              </RadioGroup>
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col :span="24">
            <FormItem
              :label="$t('storeManagement.ipcReport.sampleStandard')"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 20 }"
            >
              <Checkbox.Group
                v-model:value="formData.iqcFlaw.sampleStandard"
                :disabled="readonly"
                @change="handleSampleStandardChange"
              >
                <Checkbox :value="1">
                  {{ $t('storeManagement.ipcReport.iqcStandard') }}
                </Checkbox>
                <Checkbox :value="2">
                  {{ $t('storeManagement.ipcReport.pasStandard') }}
                </Checkbox>
                <Checkbox :value="3">
                  {{ $t('storeManagement.ipcReport.sample') }}
                </Checkbox>
              </Checkbox.Group>
            </FormItem>
          </Col>
        </Row>
      </Form>

      <Divider orientation="left">
        {{ $t('storeManagement.ipcReport.checkItem') }}
      </Divider>
      <Table
        :columns="itemColumns"
        :data-source="formData.itemResults"
        :pagination="false"
        size="small"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'checkResult'">
            <Input.TextArea
              v-model:value="record.checkResult"
              :disabled="readonly"
              :rows="2"
            />
          </template>
          <template v-else-if="column.dataIndex === 'judgeResult'">
            <Select
              v-model:value="record.judgeResult"
              :options="judgeResultOptions"
              :disabled="readonly"
              style="width: 100%"
            />
          </template>
          <template v-else-if="column.dataIndex === 'flawResult'">
            <Select
              v-model:value="record.flawResult"
              :options="flawResultOptions"
              :disabled="readonly"
              :placeholder="$t('common.pleaseSelect')"
              style="width: 100%"
              allow-clear
            />
          </template>
        </template>
      </Table>

      <Divider orientation="left">
        {{ $t('storeManagement.ipcReport.attachment') }}
      </Divider>
      <Upload
        v-model:file-list="uploadFileList"
        :action="uploadAction"
        :headers="{ Authorization: `${accessStore.accessToken}` }"
        :disabled="readonly"
        :max-count="10"
        multiple
        @success="handleUploadSuccess"
        @error="handleUploadError"
      >
        <Button :disabled="readonly">
          <template #icon>
            <Icon component="mdi:cloud-upload" />
          </template>
          {{ $t('common.upload') }}
        </Button>
      </Upload>

      <!-- 文件列表 -->
      <div v-if="uploadFileList.length > 0" class="!mt-4">
        <Table
          :columns="[
            { title: '文件名', dataIndex: 'name', width: 200 },
            {
              title: $t('common.operation'),
              dataIndex: 'operation',
              width: 100,
            },
          ]"
          :data-source="uploadFileList"
          :pagination="false"
          size="small"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <Button
                v-if="!readonly"
                type="link"
                danger
                size="small"
                @click="handleDeleteFile(record.id)"
              >
                <template #icon>
                  <Icon component="mdi:delete" />
                </template>
              </Button>
            </template>
          </template>
        </Table>
      </div>

      <!-- 物料选择抽屉 -->
      <MaterialSelectDrawer
        v-model:visible="materialSelectVisible"
        @confirm="handleMaterialConfirm"
      />
    </Spin>

    <template #footer>
      <Space>
        <Button v-if="mode === 'view'" type="primary" @click="handlePrint">
          {{ $t('common.print') }}
        </Button>
        <Button v-if="mode !== 'view'" type="primary" @click="handleSubmit">
          {{ $t('storeManagement.ipcReport.submitAudit') }}
        </Button>
        <Button v-if="mode !== 'view'" type="default" @click="handleSave">
          {{ $t('common.confirm') }}
        </Button>
        <Button v-if="mode !== 'view'" @click="resetForm">
          {{ $t('common.reset') }}
        </Button>
        <Button @click="handleClose">{{ $t('common.cancel') }}</Button>
      </Space>
    </template>
  </Drawer>
</template>
