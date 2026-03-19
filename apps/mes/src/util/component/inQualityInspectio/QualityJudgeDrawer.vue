<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, ref, watch } from 'vue';

import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Select,
  SelectOption,
  Space,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { fetchQualityInspectionDetail, judgeQualityInspection } from '#/api';

const props = defineProps<{
  formId?: string;
  visible: boolean;
}>();

const emit = defineEmits<{
  success: [];
  'update:visible': [value: boolean];
}>();

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

// 送检信息
const inspectionInfo = ref<any>({});

// 质检信息
const qualityInfo = ref<any>({
  checkResult: undefined,
  checkRemark: '',
  qualifiedNumber: 0,
});

// 质检详情列表
const detailList = ref<any[]>([]);

// 质检结论选项
const checkResultOptions = [
  { value: 1, label: $t('storeManagement.inspectionSlip.qualified') },
  { value: 2, label: $t('storeManagement.inspectionSlip.unqualified') },
  { value: 3, label: $t('storeManagement.inspectionSlip.concessionAccept') },
  { value: 4, label: $t('storeManagement.inspectionSlip.emergencyRelease') },
];

// 计算不合格数量
const unqualifiedNumber = computed(() => {
  return (
    (qualityInfo.value.checkNumber || 0) -
    (qualityInfo.value.qualifiedNumber || 0)
  );
});

// 质检结论是否禁用合格数量输入
const isQualifiedDisabled = computed(() => {
  return qualityInfo.value.checkResult === 2;
});

// 表格列
const columns: VxeGridProps<any>['columns'] = [
  {
    field: 'materialCode',
    title: $t('storeManagement.labelPrint.materialCode'),
    width: 120,
  },
  {
    field: 'materialName',
    title: $t('storeManagement.labelPrint.materialName'),
    minWidth: 150,
  },
  { field: 'unit', title: $t('storeManagement.labelPrint.unit'), width: 60 },
  {
    field: 'sendNumber',
    title: $t('storeManagement.inspectionSlip.sendNumber'),
    width: 100,
  },
  {
    field: 'labelCode',
    title: $t('storeManagement.labelPrint.labelCode'),
    width: 150,
  },
  {
    field: 'manufacturerName',
    title: $t('storeManagement.labelPrint.manufacturerName'),
    minWidth: 150,
  },
  {
    field: 'batchCode',
    title: $t('storeManagement.labelPrint.batchCode'),
    width: 120,
  },
  {
    field: 'qualifiedNumber',
    title: $t('storeManagement.inspectionSlip.qualifiedNumber'),
    width: 100,
    slots: { default: 'qualifiedNumber' },
  },
  {
    field: 'unqualifiedNumber',
    title: $t('storeManagement.inspectionSlip.unqualifiedNumber'),
    width: 100,
    slots: { default: 'unqualifiedNumber' },
  },
];

// 表格配置
const gridOptions: VxeGridProps<any> = {
  border: true,
  columns,
  height: 300,
  data: [],
  showOverflow: 'tooltip',
  pagerConfig: {
    enabled: false,
  },
  stripe: true,
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// 质检结论变化
function handleCheckResultChange(value: any) {
  const numValue = Number(value);
  if (numValue === 2) {
    // 不合格
    qualityInfo.value.qualifiedNumber = 0;
    detailList.value.forEach((item) => {
      item.qualifiedNumber = 0;
    });
  } else if (numValue === 1 || numValue === 3 || numValue === 4) {
    // 合格/让步接收/紧急放行
    qualityInfo.value.qualifiedNumber = qualityInfo.value.checkNumber || 0;
    detailList.value.forEach((item) => {
      item.qualifiedNumber = item.sendNumber;
    });
  }
  if (gridApi.grid) {
    gridApi.grid.reloadData(detailList.value);
  }
}

// 合格数量变化
function handleQualifiedNumberChange(value: any) {
  const numValue = Number(value);
  detailList.value.forEach((item) => {
    item.qualifiedNumber = numValue;
  });
  if (gridApi.grid) {
    gridApi.grid.reloadData(detailList.value);
  }
}

// 保存
function handleSave() {
  if (!qualityInfo.value.checkResult) {
    message.warning($t('storeManagement.inspectionSlip.selectCheckResult'));
    return;
  }

  // 构建提交数据
  const labelList = detailList.value.map((item) => ({
    id: item.id,
    qualifiedNumber: Number(item.qualifiedNumber) || 0,
  }));

  const data = {
    id: props.formId,
    checkResult: qualityInfo.value.checkResult,
    remark: inspectionInfo.value.remark,
    checkRemark: qualityInfo.value.checkRemark,
    labelList,
    labelId: labelList[0]?.id,
  };

  judgeQualityInspection(data).then(() => {
    message.success($t('common.successfulOperation'));
    visible.value = false;
    emit('success');
  });
}

// 监听弹窗打开
watch(visible, (val) => {
  if (val && props.formId) {
    fetchQualityInspectionDetail(props.formId).then((res: any) => {
      inspectionInfo.value = {
        formCode: res.formCode,
        sendDate: res.sendDate,
        remark: res.remark,
      };
      qualityInfo.value = {
        checkResult: res.checkResult,
        checkRemark: res.checkRemark,
        checkNumber: res.checkNumber,
        receiveNumber: res.receiveNumber,
        qualifiedNumber: res.qualifiedNumber || res.checkNumber,
        judgeTime: res.judgeTime
          ? res.judgeTime.substring(0, 10)
          : new Date().toISOString().substring(0, 10),
      };
      detailList.value = res.labelList || [];
      if (gridApi.grid) {
        gridApi.grid.reloadData(detailList.value);
      }
    });
  }
});
</script>

<template>
  <Drawer
    v-model:open="visible"
    :title="$t('storeManagement.inspectionSlip.qualityJudge')"
    :footer-style="{ textAlign: 'right' }"
    width="85%"
    class="quality-judge-drawer"
  >
    <!-- 送检信息 -->
    <Card class="!mb-6">
      <template #title>
        <div class="flex items-center">
          <Icon
            icon="mdi:file-document-outline"
            class="text-xl mr-2 text-blue-500"
          />
          <span>{{ $t('storeManagement.inspectionSlip.inspectionInfo') }}</span>
        </div>
      </template>
      <Form layout="inline" class="info-form">
        <FormItem
          :label="$t('storeManagement.labelPrint.formCode')"
          class="form-item-half"
        >
          <Input v-model:value="inspectionInfo.formCode" disabled />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.inspectionSlip.sendDate')"
          class="form-item-half"
        >
          <Input v-model:value="inspectionInfo.sendDate" disabled />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.labelPrint.remark')"
          class="form-item-full"
        >
          <Input.TextArea
            v-model:value="inspectionInfo.remark"
            :auto-size="{ minRows: 2, maxRows: 4 }"
          />
        </FormItem>
      </Form>
    </Card>

    <!-- 质检信息 -->
    <Card class="!mb-6">
      <template #title>
        <div class="flex items-center">
          <Icon
            icon="mdi:clipboard-check-outline"
            class="text-xl mr-2 text-green-500"
          />
          <span>{{ $t('storeManagement.inspectionSlip.qualityInfo') }}</span>
        </div>
      </template>
      <Form layout="inline" class="info-form">
        <FormItem
          :label="$t('storeManagement.inspectionSlip.checkResult')"
          class="form-item-third"
        >
          <Select
            v-model:value="qualityInfo.checkResult"
            :placeholder="$t('common.pleaseSelect')"
            style="width: 100%"
            @change="handleCheckResultChange"
          >
            <SelectOption
              v-for="item in checkResultOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem
          :label="$t('storeManagement.inspectionSlip.judgeTime')"
          class="form-item-third"
        >
          <Input v-model:value="qualityInfo.judgeTime" disabled />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.inspectionSlip.arrivalNumber')"
          class="form-item-third"
        >
          <Input v-model:value="qualityInfo.receiveNumber" disabled />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.inspectionSlip.checkNumber')"
          class="form-item-third"
        >
          <Input v-model:value="qualityInfo.checkNumber" disabled />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.inspectionSlip.qualifiedNumber')"
          class="form-item-third"
        >
          <InputNumber
            v-model:value="qualityInfo.qualifiedNumber"
            :min="0"
            :max="qualityInfo.checkNumber"
            :disabled="isQualifiedDisabled"
            style="width: 100%"
            @change="handleQualifiedNumberChange"
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.inspectionSlip.unqualifiedNumber')"
          class="form-item-third"
        >
          <Tag :color="unqualifiedNumber > 0 ? 'error' : 'success'">
            {{ unqualifiedNumber }}
          </Tag>
        </FormItem>
        <FormItem
          :label="$t('storeManagement.inspectionSlip.checkRemark')"
          class="form-item-full"
        >
          <Input.TextArea
            v-model:value="qualityInfo.checkRemark"
            :auto-size="{ minRows: 2, maxRows: 4 }"
          />
        </FormItem>
      </Form>
    </Card>

    <!-- 质检详情 -->
    <Card>
      <template #title>
        <div class="flex items-center">
          <Icon icon="mdi:table-large" class="text-xl mr-2 text-purple-500" />
          <span>{{ $t('storeManagement.inspectionSlip.qualityDetail') }}</span>
        </div>
      </template>
      <Grid>
        <template #qualifiedNumber="{ row }">
          <InputNumber
            v-model:value="row.qualifiedNumber"
            :min="0"
            :max="row.sendNumber"
            :disabled="isQualifiedDisabled"
            size="small"
            style="width: 80px"
          />
        </template>
        <template #unqualifiedNumber="{ row }">
          <span
            :style="{
              color: row.sendNumber - row.qualifiedNumber > 0 ? '#ff4d4f' : '#52c41a',
              fontWeight: 'bold',
            }"
          >
            {{ row.sendNumber - (row.qualifiedNumber || 0) }}
          </span>
        </template>
      </Grid>
    </Card>

    <template #footer>
      <Space>
        <Button @click="visible = false">{{ $t('common.cancel') }}</Button>
        <Button type="primary" @click="handleSave">{{ $t('common.save') }}</Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped>
.quality-judge-drawer :deep(.ant-drawer-body) {
  padding: 24px;
  overflow-y: auto;
}

.info-form {
  width: 100%;
}

.form-item-half {
  width: 49%;
  margin-right: 2%;
  margin-bottom: 16px;
}

.form-item-third {
  width: 32%;
  margin-right: 1%;
  margin-bottom: 16px;
}

.form-item-full {
  width: 100%;
  margin-bottom: 16px;
}

.info-form :deep(.ant-form-item-label) {
  width: 100px;
  text-align: right;
}
</style>
