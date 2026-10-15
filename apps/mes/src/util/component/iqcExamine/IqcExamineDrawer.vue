<script lang="ts" setup>
import { ref, watch } from 'vue';
import { hiprint } from 'vue-plugin-hiprint';

import { $t } from '@vben/locales';

import {
  Button,
  Checkbox,
  CheckboxGroup,
  Col,
  Descriptions,
  DescriptionsItem,
  Divider,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Radio,
  RadioGroup,
  Row,
  Select,
  Space,
  Table,
  Textarea,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { auditIqc, fetchIqcDetail, queryPrintTemplateDetails } from '#/api';

// Props
interface Props {
  visible?: boolean;
  id?: any;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  success: [];
  'update:visible': [value: boolean];
}>();

// 审核状态
const auditStatus = ref<number>(-1);

// 抽屉可见性
const drawerVisible = ref(false);

// 表单数据
const formData = ref<any>({
  judgeTime: '',
  manufacturerName: '',
  materialCode: '',
  materialName: '',
  receiveNumber: '',
  qualifiedNumber: '',
  notQualifiedNumber: '',
  checkNumber: '',
  checkResult: '',
  remark: '',
  sendFormCode: '',
  sendDate: '',
  detailList: [],
  itemResults: [],
  iqcFlaw: {
    isOther: 1,
    fatalFlaw: '',
    seriousFlaw: '',
    minorFlaw: '',
    samplePlan: '',
    remark: '',
    sampleStandard: [],
  },
});

// 检验项默认数据
const defaultItemResults = [
  {
    itemCodeName: '包装',
    itemCode: 1,
    checkResult: '',
    judgeResult: '合格',
    flawResult: '',
  },
  {
    itemCodeName: '外观',
    itemCode: 2,
    checkResult: '',
    judgeResult: '合格',
    flawResult: '',
  },
  {
    itemCodeName: '尺寸',
    itemCode: 3,
    checkResult: '',
    judgeResult: '合格',
    flawResult: '',
  },
  {
    itemCodeName: '性能',
    itemCode: 4,
    checkResult: '',
    judgeResult: '合格',
    flawResult: '',
  },
];

// 抽样标准选择
const checkList = ref<any[]>([]);

// IQC 检验报告打印模板编号
const PRINT_TEMPLATE_CODE = 'IQC质检报告';

// 打印中状态
const printing = ref(false);

// 抽样检验计划选项值
const SAMPLE_PLAN_VALUES = [1, 2, 3, 4];

// 抽检依据和标准选项值
const SAMPLE_STANDARD_VALUES = [1, 2, 3];

// 质检结论选项
const checkResultOptions = [
  { value: 1, label: $t('storeManagement.inspectionSlip.qualified') },
  { value: 2, label: $t('storeManagement.inspectionSlip.unqualified') },
  { value: 3, label: $t('storeManagement.inspectionSlip.concessionAccept') },
  { value: 4, label: $t('storeManagement.inspectionSlip.emergencyRelease') },
];

// 检验判定选项
const judgeOptions = [
  { value: 1, label: $t('storeManagement.ipcReport.qualified') },
  { value: 0, label: $t('storeManagement.ipcReport.unqualified') },
];

// 受损程度选项
const flawOptions = [
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

// 详情表格列
const detailColumns = [
  {
    title: $t('storeManagement.labelPrint.materialCode'),
    dataIndex: 'materialCode',
    width: 100,
  },
  {
    title: $t('storeManagement.labelPrint.materialName'),
    dataIndex: 'materialName',
    width: 120,
  },
  {
    title: $t('storeManagement.labelPrint.unit'),
    dataIndex: 'unit',
    width: 60,
  },
  {
    title: $t('storeManagement.iqcExamine.checkNumber'),
    dataIndex: 'checkNumber',
    width: 80,
  },
  {
    title: $t('storeManagement.iqcExamine.labelCode'),
    dataIndex: 'labelCode',
    width: 120,
  },
  {
    title: $t('storeManagement.labelPrint.manufacturerName'),
    dataIndex: 'manufacturerName',
    width: 140,
  },
  {
    title: $t('storeManagement.iqcExamine.batchCode'),
    dataIndex: 'batchCode',
    width: 120,
  },
  {
    title: $t('storeManagement.labelPrint.contractCode'),
    dataIndex: 'contractCode',
    width: 160,
  },
  {
    title: $t('storeManagement.iqcExamine.qualifiedNumber'),
    dataIndex: 'qualifiedNumber',
    width: 120,
  },
  {
    title: $t('storeManagement.iqcExamine.notQualifiedNumber'),
    dataIndex: 'notQualifiedNumber',
    width: 100,
  },
];

// 检验项表格列
const itemColumns = [
  {
    title: $t('storeManagement.iqcExamine.itemCodeName'),
    dataIndex: 'itemCodeName',
    width: 80,
  },
  {
    title: $t('storeManagement.iqcExamine.checkResult'),
    dataIndex: 'checkResult',
    width: 350,
  },
  {
    title: $t('storeManagement.iqcExamine.judgeResult'),
    dataIndex: 'judgeResult',
    width: 100,
  },
  {
    title: $t('storeManagement.iqcExamine.flawResult'),
    dataIndex: 'flawResult',
    width: 100,
  },
];

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    drawerVisible.value = val;
    if (val && props.id) {
      loadDetail();
    }
  },
);

// 监听drawerVisible变化
watch(drawerVisible, (val) => {
  emit('update:visible', val);
});

// 加载详情
function loadDetail() {
  if (!props.id) {
    return;
  }
  fetchIqcDetail(props.id).then((res: any) => {
    formData.value = Object.assign({}, res);

    // 获取审核状态
    auditStatus.value = res.auditStatus || -1;

    // 处理iqcFlaw
    if (!formData.value.iqcFlaw) {
      formData.value.iqcFlaw = {
        isOther: 1,
        fatalFlaw: '',
        seriousFlaw: '',
        minorFlaw: '',
        samplePlan: '',
        remark: '',
        sampleStandard: [],
      };
    }

    // 处理检验项
    if (
      !formData.value.itemResults ||
      formData.value.itemResults.length === 0
    ) {
      formData.value.itemResults = [...defaultItemResults];
    }

    // 处理日期
    if (formData.value.judgeTime) {
      formData.value.judgeTime = formData.value.judgeTime.slice(0, 10);
    }
    if (formData.value.sendDate) {
      formData.value.sendDate = formData.value.sendDate.slice(0, 10);
    }

    // 处理抽样标准
    checkList.value = formData.value.iqcFlaw.sampleStandard || [];

    // 计算不合格数量
    formData.value.detailList = formData.value.detailList.map((item: any) => ({
      ...item,
      notQualifiedNumber:
        Number(item.checkNumber) - Number(item.qualifiedNumber || 0),
    }));
  });
}

// 通过
function handlePass() {
  if (!props.id) {
    return;
  }
  Modal.confirm({
    title: $t('common.prompt'),
    content: $t('storeManagement.iqcExamine.confirmPass'),
    onOk: () => {
      auditIqc({
        auditType: 2,
        id: props.id,
      }).then(() => {
        message.success($t('common.successfulOperation'));
        drawerVisible.value = false;
        emit('success');
      });
    },
  });
}

// 不通过
function handleNoPass() {
  if (!props.id) {
    return;
  }
  Modal.confirm({
    title: $t('common.prompt'),
    content: $t('storeManagement.iqcExamine.confirmNoPass'),
    onOk: () => {
      auditIqc({
        auditType: 3,
        id: props.id,
      }).then(() => {
        message.success($t('common.successfulOperation'));
        drawerVisible.value = false;
        emit('success');
      });
    },
  });
}

/**
 * 将选项字段展平为模板勾选框可绑定的布尔值
 * 例如选中 1.0（value=1）时生成 iqcFlaw_minorFlaw_1 = 1，
 * 同组其余选项（iqcFlaw_minorFlaw_2/3）为 0
 * @param {Record<string, any>} target 结果对象
 * @param {string} field 字段名（如 minorFlaw）
 * @param {any[]} values 该字段全部可选值
 * @param {any} current 当前值，数组表示多选（复选框组）
 * @param {string} prefix 键前缀，传空字符串表示不加前缀
 * @returns {void} 无返回值，结果写入 target
 * @since 2026-10-14 10:00:00
 */
function fillOptionFlags(
  target: Record<string, any>,
  field: string,
  values: any[],
  current: any,
  prefix = 'iqcFlaw',
) {
  const selected = Array.isArray(current)
    ? current.map((item: any) => String(item))
    : [String(current)];

  values.forEach((value: any) => {
    const key = prefix ? `${prefix}_${field}_${value}` : `${field}_${value}`;
    target[key] = selected.includes(String(value)) ? 1 : 0;
  });
}

/**
 * 组装 IQC 检验报告打印数据
 * 数据来源为当前 formData，选项类字段额外展平供模板勾选框绑定
 * @returns {Record<string, any>} 打印模板所需的数据对象
 * @since 2026-10-14 10:00:00
 */
function buildPrintData() {
  const data = formData.value || {};
  const flaw: any = data.iqcFlaw || {};
  const printData: Record<string, any> = {
    ...data,
    // 质检详情表格数据
    detailList: data.detailList || [],
    // 检验项表格数据
    itemResults: data.itemResults || [],
    // 抽样标准：国标/其他
    iqcFlaw_isOther: flaw.isOther,
    // 抽样标准描述（其他时填写的备注）
    iqcFlaw_remark: flaw.remark,
    // 致命/严重/轻微缺陷的选中数值
    iqcFlaw_fatalFlaw: flaw.fatalFlaw,
    iqcFlaw_seriousFlaw: flaw.seriousFlaw,
    iqcFlaw_minorFlaw: flaw.minorFlaw,
    // 打印时间
    printTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  };

  // 国标/其他（1 国标，0 其他）
  fillOptionFlags(printData, 'isOther', [1, 0], flaw.isOther);
  // 致命缺陷：0
  fillOptionFlags(printData, 'fatalFlaw', [1], flaw.fatalFlaw);
  // 严重缺陷：0.015 / 0.2 / 0.4 / 0.65
  fillOptionFlags(printData, 'seriousFlaw', [4, 1, 2, 3], flaw.seriousFlaw);
  // 轻微缺陷：1.0 / 1.5 / 2.5
  fillOptionFlags(printData, 'minorFlaw', [1, 2, 3], flaw.minorFlaw);
  // 抽样检验计划：正常 / 加严 / 放宽 / 100%
  fillOptionFlags(
    printData,
    'samplePlan',
    SAMPLE_PLAN_VALUES,
    flaw.samplePlan,
  );
  // 抽检依据和标准：IQC 抽样标准 / PAS / 样品（多选）
  fillOptionFlags(
    printData,
    'sampleStandard',
    SAMPLE_STANDARD_VALUES,
    flaw.sampleStandard || checkList.value,
  );
  // 质检结论：合格 / 不合格 / 让步接收 / 紧急放行（顶层字段，无 iqcFlaw 前缀）
  fillOptionFlags(
    printData,
    'checkResult',
    checkResultOptions.map((item: any) => item.value),
    data.checkResult,
    '',
  );

  return printData;
}

// 打印
function handlePrint() {
  printing.value = true;
  queryPrintTemplateDetails(PRINT_TEMPLATE_CODE)
    .then((res: any) => {
      const templateRef = JSON.parse(res.printData);
      const hiprintTemplate = new hiprint.PrintTemplate({
        template: templateRef,
      });
      hiprintTemplate.print(buildPrintData(), {
        leftOffset: -1,
        topOffset: -1,
      });
    })
    .catch(() => {
      message.error($t('storeManagement.iqcExamine.printTemplateFailed'));
    })
    .finally(() => {
      printing.value = false;
    });
}

// 关闭
function handleClose() {
  drawerVisible.value = false;
}
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :title="$t('storeManagement.iqcExamine.view')"
    width="990px"
    :footer-style="{ textAlign: 'right' }"
  >
    <Form :model="formData">
      <!-- 质检信息 -->
      <Descriptions
        :title="$t('storeManagement.iqcExamine.qcInfo')"
        :column="3"
        bordered
        size="small"
      >
        <DescriptionsItem :label="$t('storeManagement.iqcExamine.checkResult')">
          <Select
            v-model:value="formData.checkResult"
            :options="checkResultOptions"
            style="width: 100%"
            disabled
          />
        </DescriptionsItem>
        <DescriptionsItem :label="$t('storeManagement.iqcExamine.judgeTime')">
          <Input v-model:value="formData.judgeTime" disabled />
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('storeManagement.iqcExamine.receiveNumber')"
        >
          <Input v-model:value="formData.receiveNumber" disabled />
        </DescriptionsItem>

        <DescriptionsItem :label="$t('storeManagement.iqcExamine.checkNumber')">
          <Input v-model:value="formData.checkNumber" disabled />
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('storeManagement.iqcExamine.qualifiedNumber')"
        >
          <Input v-model:value="formData.qualifiedNumber" disabled />
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('storeManagement.iqcExamine.notQualifiedNumber')"
        >
          <Input v-model:value="formData.notQualifiedNumber" disabled />
        </DescriptionsItem>

        <DescriptionsItem
          :label="$t('storeManagement.labelPrint.manufacturerName')"
        >
          <Input v-model:value="formData.manufacturerName" disabled />
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('storeManagement.iqcExamine.sendFormCode')"
        >
          <Input v-model:value="formData.sendFormCode" disabled />
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('storeManagement.labelPrint.materialCode')"
        >
          <Input v-model:value="formData.materialCode" disabled />
        </DescriptionsItem>

        <DescriptionsItem
          :label="$t('storeManagement.labelPrint.materialName')"
        >
          <Input v-model:value="formData.materialName" disabled />
        </DescriptionsItem>
        <DescriptionsItem :label="$t('storeManagement.iqcExamine.sendDate')">
          <Input v-model:value="formData.sendDate" disabled />
        </DescriptionsItem>
        <DescriptionsItem :label="$t('storeManagement.iqcExamine.remark')">
          <Textarea v-model:value="formData.remark" :maxlength="100" disabled />
        </DescriptionsItem>
      </Descriptions>

      <Divider />

      <!-- 质检详情 -->
      <Descriptions :title="$t('storeManagement.iqcExamine.qcDetail')" />
      <Table
        :columns="detailColumns"
        :data-source="formData.detailList"
        :pagination="false"
        size="small"
        bordered
        :scroll="{ x: 1200 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'batchCode'">
            <Input v-model:value="record.batchCode" size="small" disabled />
          </template>
          <template v-else-if="column.dataIndex === 'contractCode'">
            <Input v-model:value="record.contractCode" size="small" disabled />
          </template>
          <template v-else-if="column.dataIndex === 'qualifiedNumber'">
            <Input
              v-model:value="record.qualifiedNumber"
              size="small"
              disabled
            />
          </template>
          <template v-else-if="column.dataIndex === 'notQualifiedNumber'">
            {{
              Number(record.checkNumber) - Number(record.qualifiedNumber || 0)
            }}
          </template>
        </template>
      </Table>

      <Divider />

      <!-- 抽样标准 -->
      <div class="compact-form">
        <Row :gutter="16">
          <Col :span="24">
            <FormItem :label-col="{ span: 4 }" :wrapper-col="{ span: 20, offset: 4 }">
              <RadioGroup v-model:value="formData.iqcFlaw.isOther" disabled>
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

        <!-- GB/T2828-2003标准 -->
        <template v-if="formData.iqcFlaw.isOther === 1">
          <Row :gutter="16">
            <Col :span="24">
              <FormItem
                :label="$t('storeManagement.iqcExamine.fatalFlaw')"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <RadioGroup v-model:value="formData.iqcFlaw.fatalFlaw" disabled>
                  <Radio :value="1">0</Radio>
                </RadioGroup>
              </FormItem>
            </Col>
          </Row>
          <Row :gutter="16">
            <Col :span="24">
              <FormItem
                :label="$t('storeManagement.iqcExamine.seriousFlaw')"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <RadioGroup v-model:value="formData.iqcFlaw.seriousFlaw" disabled>
                  <Radio :value="4">0.015</Radio>
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
                :label="$t('storeManagement.iqcExamine.minorFlaw')"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <RadioGroup v-model:value="formData.iqcFlaw.minorFlaw" disabled>
                  <Radio :value="1">1.0</Radio>
                  <Radio :value="2">1.5</Radio>
                  <Radio :value="3">2.5</Radio>
                </RadioGroup>
              </FormItem>
            </Col>
          </Row>
        </template>

        <!-- 其他标准 -->
        <Row v-else :gutter="16">
          <Col :span="24">
            <FormItem
              :label="$t('storeManagement.iqcExamine.remark')"
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 20 }"
            >
              <Textarea
                v-model:value="formData.iqcFlaw.remark"
                :maxlength="100"
                :rows="3"
                disabled
              />
            </FormItem>
          </Col>
        </Row>

        <!-- 抽样检验计划 -->
        <Row :gutter="16">
          <Col :span="24">
            <FormItem
              :label="$t('storeManagement.iqcExamine.samplePlan')"
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 20 }"
            >
              <RadioGroup v-model:value="formData.iqcFlaw.samplePlan" disabled>
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

        <!-- 抽检依据和标准 -->
        <Row :gutter="16">
          <Col :span="24">
            <FormItem
              :label="$t('storeManagement.iqcExamine.checkStandard')"
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 20 }"
            >
              <CheckboxGroup v-model:value="checkList" disabled>
                <Checkbox :value="1">
                  {{ $t('storeManagement.ipcReport.iqcStandard') }}
                </Checkbox>
                <Checkbox :value="2">
                  {{ $t('storeManagement.ipcReport.pasStandard') }}
                </Checkbox>
                <Checkbox :value="3">
                  {{ $t('storeManagement.ipcReport.sample') }}
                </Checkbox>
              </CheckboxGroup>
            </FormItem>
          </Col>
        </Row>
      </div>

      <Divider />

      <!-- 检验项 -->
      <Descriptions :title="$t('storeManagement.iqcExamine.itemResults')" />
      <Table
        :columns="itemColumns"
        :data-source="formData.itemResults"
        :pagination="false"
        size="small"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'checkResult'">
            <Textarea
              v-model:value="record.checkResult"
              size="small"
              disabled
            />
          </template>
          <template v-else-if="column.dataIndex === 'judgeResult'">
            <Select
              v-model:value="record.judgeResult"
              :options="judgeOptions"
              size="small"
              style="width: 100%"
              disabled
            />
          </template>
          <template v-else-if="column.dataIndex === 'flawResult'">
            <Select
              v-model:value="record.flawResult"
              :options="flawOptions"
              size="small"
              style="width: 100%"
              disabled
            />
          </template>
        </template>
      </Table>
    </Form>

    <template #footer>
      <Space>
        <Button :loading="printing" @click="handlePrint">
          {{ $t('common.print') }}
        </Button>
        <Button v-if="auditStatus === 1" type="primary" @click="handlePass">
          {{ $t('storeManagement.iqcExamine.pass') }}
        </Button>
        <Button v-if="auditStatus === 1" type="primary" @click="handleNoPass">
          {{ $t('storeManagement.iqcExamine.noPass') }}
        </Button>
        <Button @click="handleClose">
          {{ $t('common.close') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped>
/* 抽样标准表单：收紧行高，缩小表单项上下间距 */
.compact-form :deep(.ant-form-item) {
  margin-bottom: 8px;
}

.compact-form :deep(.ant-form-item-control-input) {
  min-height: 24px;
}

.compact-form :deep(.ant-radio-wrapper),
.compact-form :deep(.ant-checkbox-wrapper) {
  line-height: 24px;
}
</style>
