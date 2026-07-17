<script lang="ts" setup>
import { ref } from 'vue';

import {
  Button,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  InputNumber,
  message,
  Space,
} from 'ant-design-vue';
import { type Rule } from 'ant-design-vue/es/form';

import { smtWorksheetReport } from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'WorkSheetReportDrawer',
});

const emit = defineEmits<{
  refresh: [];
}>();

const STATUS = {
  NOT_STARTED: 1, // 未开始
  IN_PROGRESS: 2, // 开始 / 正在进行中
  COMPLETED: 3, // 完成
  PAUSED: 4, // 暂停
};

const show = ref(false);
const currentMode = ref<'redFlush' | 'report'>('report');
const submitting = ref(false);
const formRef = ref<any>();
const currentRow = ref<any>({});

const formData = ref<any>({
  bindingId: undefined,
  qualityNumber: undefined,
  unqualityNumber: undefined,
  personTime: undefined,
  equipTime: undefined,
  reportFlag: 1,
});

// 冲红时数量可为正负，报工时数量不允许为负
function isRedFlush() {
  return currentMode.value === 'redFlush';
}

function getStatusLabel(status: any) {
  switch (status) {
    case STATUS.COMPLETED: {
      return $t('SMTPlantAdd.statusCompleted');
    }
    case STATUS.IN_PROGRESS: {
      return $t('SMTPlantAdd.statusInProgress');
    }
    case STATUS.NOT_STARTED: {
      return $t('SMTPlantAdd.statusNotStarted');
    }
    case STATUS.PAUSED: {
      return $t('SMTPlantAdd.statusPaused');
    }
    default: {
      return '';
    }
  }
}

function open(mode: 'redFlush' | 'report', row: any) {
  currentMode.value = mode;
  currentRow.value = row ?? {};
  show.value = true;
  formData.value = {
    bindingId: row?.id,
    qualityNumber: undefined,
    unqualityNumber: undefined,
    personTime: undefined,
    equipTime: undefined,
    reportFlag: mode === 'report' ? 1 : 2,
  };
}

defineExpose({ open });

const rules: Record<string, Rule[]> = {
  qualityNumber: [
    { required: true, message: $t('SMTPlantAdd.pleaseInputQuantity') },
  ],
  unqualityNumber: [
    { required: true, message: $t('SMTPlantAdd.pleaseInputQuantity') },
  ],
  personTime: [{ required: true, message: $t('SMTPlantAdd.pleaseInput') }],
  equipTime: [{ required: true, message: $t('SMTPlantAdd.pleaseInput') }],
};

async function handleSubmit() {
  try {
    await formRef.value.validate();
  } catch {
    return;
  }
  submitting.value = true;
  smtWorksheetReport(formData.value)
    .then(() => {
      message.success($t('SMTPlantAdd.saveSuccess'));
      show.value = false;
      emit('refresh');
    })
    .catch((error: any) => {
      message.error(error?.message || $t('SMTPlantAdd.saveFailed'));
    })
    .finally(() => {
      submitting.value = false;
    });
}

function handleClose() {
  show.value = false;
  currentMode.value = 'report';
  submitting.value = false;
  formRef.value?.clearValidate?.();
  formData.value = {
    bindingId: undefined,
    qualityNumber: undefined,
    unqualityNumber: undefined,
    personTime: undefined,
    equipTime: undefined,
    reportFlag: 1,
  };
}
</script>

<template>
  <Drawer
    v-model:open="show"
    :title="
      isRedFlush() ? $t('SMTPlantAdd.redFlushTitle') : $t('SMTPlantAdd.reportTitle')
    "
    width="700"
    :destroy-on-close="true"
    :footer-style="{ textAlign: 'right' }"
    @close="handleClose"
  >
    <Descriptions bordered :column="2" size="small">
      <DescriptionsItem :label="$t('SMTmanagement.workOrderNumber')">
        {{ currentRow.workSheetCode }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('SMTmanagement.plannedTime')">
        {{ currentRow.planDateStart }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('SMTmanagement.planDateStop')">
        {{ currentRow.planDateStop }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('SMTmanagement.planNumber')">
        {{ currentRow.planCode }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('SMTmanagement.productName')">
        {{ currentRow.productName }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('SMTmanagement.productNumber')">
        {{ currentRow.productCode }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('SMTPlantAdd.status')">
        {{ getStatusLabel(currentRow.status) }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('SMTmanagement.remark')">
        {{ currentRow.remark }}
      </DescriptionsItem>
    </Descriptions>

    <div class="!mt-6 font-bold">
      {{ isRedFlush() ? $t('SMTPlantAdd.redFlushTitle') : $t('SMTPlantAdd.reportTitle') }}
    </div>

    <Form
      ref="formRef"
      :model="formData"
      :rules="rules"
      class="!mt-2"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
    >
      <FormItem :label="$t('SMTPlantAdd.qualityNumber')" name="qualityNumber">
        <InputNumber
          v-model:value="formData.qualityNumber"
          :min="isRedFlush() ? undefined : 0"
          :precision="0"
          style="width: 100%"
        />
      </FormItem>
      <FormItem :label="$t('SMTPlantAdd.unqualityNumber')" name="unqualityNumber">
        <InputNumber
          v-model:value="formData.unqualityNumber"
          :min="isRedFlush() ? undefined : 0"
          :precision="0"
          style="width: 100%"
        />
      </FormItem>
      <FormItem :label="$t('SMTPlantAdd.personTime')" name="personTime">
        <InputNumber
          v-model:value="formData.personTime"
          :min="0"
          :precision="2"
          style="width: 100%"
        />
      </FormItem>
      <FormItem :label="$t('SMTPlantAdd.equipTime')" name="equipTime">
        <InputNumber
          v-model:value="formData.equipTime"
          :min="0"
          :precision="2"
          style="width: 100%"
        />
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <Button @click="handleClose">{{ $t('common.cancel') }}</Button>
        <Button type="primary" :loading="submitting" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
