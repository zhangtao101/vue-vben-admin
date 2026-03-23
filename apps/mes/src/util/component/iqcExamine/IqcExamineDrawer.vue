<script lang="ts" setup>
import { ref, watch } from 'vue';

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

import { auditIqc, fetchIqcDetail } from '#/api';

// Props
interface Props {
  visible?: boolean;
  id?: string;
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

// 质检结论选项
const checkResultOptions = [
  { value: 1, label: $t('storeManagement.inspectionSlip.qualified') },
  { value: 2, label: $t('storeManagement.inspectionSlip.unqualified') },
  { value: 3, label: $t('storeManagement.inspectionSlip.concessionAccept') },
  { value: 4, label: $t('storeManagement.inspectionSlip.emergencyRelease') },
];

// 检验判定选项
const judgeOptions = [
  { value: 1, label: '合格' },
  { value: 0, label: '不合格' },
];

// 受损程度选项
const flawOptions = [
  { value: 1, label: '致命' },
  { value: 2, label: '严重' },
  { value: 3, label: '轻微' },
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

// 打印
function handlePrint() {
  message.info('打印功能暂未完成');
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
    <Form :model="formData" layout="vertical">
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
      <FormItem :label="$t('storeManagement.iqcExamine.sampleStandard')">
        <RadioGroup v-model:value="formData.iqcFlaw.isOther" disabled>
          <Radio :value="1">GB/T2828-2003 LEVEL II</Radio>
          <Radio :value="0">其他</Radio>
        </RadioGroup>
      </FormItem>

      <!-- GB/T2828-2003标准 -->
      <div v-if="formData.iqcFlaw.isOther === 1">
        <Row :gutter="16">
          <Col :span="24">
            <FormItem :label="$t('storeManagement.iqcExamine.fatalFlaw')">
              <RadioGroup v-model:value="formData.iqcFlaw.fatalFlaw" disabled>
                <Radio :value="1">0</Radio>
              </RadioGroup>
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col :span="24">
            <FormItem :label="$t('storeManagement.iqcExamine.seriousFlaw')">
              <RadioGroup v-model:value="formData.iqcFlaw.seriousFlaw" disabled>
                <Radio :value="1">0.2</Radio>
                <Radio :value="2">0.4</Radio>
                <Radio :value="3">0.65</Radio>
              </RadioGroup>
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col :span="24">
            <FormItem :label="$t('storeManagement.iqcExamine.minorFlaw')">
              <RadioGroup v-model:value="formData.iqcFlaw.minorFlaw" disabled>
                <Radio :value="1">1.0</Radio>
                <Radio :value="2">1.5</Radio>
                <Radio :value="3">2.5</Radio>
              </RadioGroup>
            </FormItem>
          </Col>
        </Row>
      </div>

      <!-- 其他标准 -->
      <div v-else>
        <FormItem :label="$t('storeManagement.iqcExamine.remark')">
          <Textarea
            v-model:value="formData.iqcFlaw.remark"
            :maxlength="100"
            disabled
          />
        </FormItem>
      </div>

      <!-- 抽样检验计划 -->
      <FormItem :label="$t('storeManagement.iqcExamine.samplePlan')">
        <RadioGroup v-model:value="formData.iqcFlaw.samplePlan" disabled>
          <Radio :value="1">正常</Radio>
          <Radio :value="2">加严</Radio>
          <Radio :value="3">放宽</Radio>
          <Radio :value="4">100%</Radio>
        </RadioGroup>
      </FormItem>

      <!-- 抽检依据和标准 -->
      <FormItem :label="$t('storeManagement.iqcExamine.checkStandard')">
        <CheckboxGroup v-model:value="checkList" disabled>
          <Checkbox :value="1">IQC抽样标准</Checkbox>
          <Checkbox :value="2">PAS</Checkbox>
          <Checkbox :value="3">样品</Checkbox>
        </CheckboxGroup>
      </FormItem>

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
        <Button @click="handlePrint">
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
