<script lang="ts" setup>
/**
 * 人时机时填报新增抽屉
 * 用于新增一条人时机时填报数据：选择生产日期与组织架构（工作区/产线/子产线/班组），
 * 填写总工时、总人数、总人时后提交保存，提交时通过 [] 包裹调用批量保存接口。
 */
import { onMounted, ref } from 'vue';

import {
  Button,
  DatePicker,
  Drawer,
  Form,
  FormItem,
  InputNumber,
  message,
  Select,
  Space,
  Textarea,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  getProduceLineGroups,
  getProduceLines,
  getSubProduceLines,
  getWorkGroups,
  savePersonTimeReport,
} from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'PersonTimeReportDrawer',
});

// Emits
const emit = defineEmits<{
  refresh: [];
}>();

// 组织架构 4 级联动下拉选项（工作区 -> 产线 -> 子产线 -> 班组）
const groupOptions = ref<any[]>([]);
const lineOptions = ref<any[]>([]);
const subLineOptions = ref<any[]>([]);
const workGroupOptions = ref<any[]>([]);

const show = ref(false);
const formRef = ref<any>();

// 表单数据
const formData = ref<any>({
  produceDate: null,
  produceLineGroupCode: '',
  produceLineCode: '',
  subProduceLineCode: '',
  workGroupCode: '',
  subProduceLineId: null,
  totalTimeMinutes: null,
  totalPersons: null,
  totalPersonTimeMinutes: null,
  remark: '',
});

// 表单校验规则
const rules: Record<string, any> = {
  produceDate: [
    { required: true, message: $t('personTimeReport.requireProduceDate') },
  ],
  produceLineGroupCode: [
    { required: true, message: $t('personTimeReport.requireOrg') },
  ],
  produceLineCode: [
    { required: true, message: $t('personTimeReport.requireOrg') },
  ],
  subProduceLineCode: [
    { required: true, message: $t('personTimeReport.requireOrg') },
  ],
  workGroupCode: [
    { required: true, message: $t('personTimeReport.requireOrg') },
  ],
  totalTimeMinutes: [
    { required: true, message: $t('personTimeReport.requireTotalTime') },
  ],
  totalPersons: [
    { required: true, message: $t('personTimeReport.requirePersons') },
  ],
  totalPersonTimeMinutes: [
    { required: true, message: $t('personTimeReport.requirePersonTime') },
  ],
};

/**
 * 将接口返回的选项数组转换为 Select 可用的格式。
 * @param data - 接口返回的选项数组，元素包含 id、code、name。
 * @returns 返回 Select 选项数组，value 为 code、label 为 name。
 * @since 2026-08-13 00:00:00
 */
function toOptions(data: any[]) {
  return (data || []).map((item: any) => ({
    value: item.code,
    label: item.name,
    id: item.id,
  }));
}

/**
 * 加载工作区下拉选项。
 * @since 2026-08-13 00:00:00
 */
function loadGroupOptions() {
  return getProduceLineGroups().then((data: any[]) => {
    groupOptions.value = toOptions(data);
  });
}

/**
 * 工作区变化：同步表单编码，加载产线并清空下级选项。
 * @param value - 工作区编码。
 * @since 2026-08-13 00:00:00
 */
function handleGroupChange(value: any) {
  formData.value.produceLineGroupCode = value || '';
  formData.value.produceLineCode = '';
  formData.value.subProduceLineCode = '';
  formData.value.workGroupCode = '';
  formData.value.subProduceLineId = null;
  lineOptions.value = [];
  subLineOptions.value = [];
  workGroupOptions.value = [];
  if (value) {
    getProduceLines({ produceLineGroupCode: value }).then((data: any[]) => {
      lineOptions.value = toOptions(data);
    });
  }
}

/**
 * 产线变化：同步表单编码，加载子产线并清空下级选项。
 * @param value - 产线编码。
 * @since 2026-08-13 00:00:00
 */
function handleLineChange(value: any) {
  formData.value.produceLineCode = value || '';
  formData.value.subProduceLineCode = '';
  formData.value.workGroupCode = '';
  formData.value.subProduceLineId = null;
  subLineOptions.value = [];
  workGroupOptions.value = [];
  if (value) {
    getSubProduceLines({ produceLineCode: value }).then((data: any[]) => {
      subLineOptions.value = toOptions(data);
    });
  }
}

/**
 * 子产线变化：同步表单编码与子产线主键，加载班组并清空下级选项。
 * @param value - 子产线编码。
 * @since 2026-08-13 00:00:00
 */
function handleSubLineChange(value: any) {
  formData.value.subProduceLineCode = value || '';
  formData.value.workGroupCode = '';
  workGroupOptions.value = [];
  // 从子产线选项中反查子产线主键
  const subLine = subLineOptions.value.find(
    (item: any) => item.value === value,
  );
  formData.value.subProduceLineId = subLine?.id ?? null;
  if (value) {
    getWorkGroups({ subProduceLineCode: value }).then((data: any[]) => {
      workGroupOptions.value = toOptions(data);
    });
  }
}

/**
 * 班组变化：同步表单编码。
 * @param value - 班组编码。
 * @since 2026-08-13 00:00:00
 */
function handleWorkGroupChange(value: any) {
  formData.value.workGroupCode = value || '';
}

// 打开时预加载工作区下拉选项
onMounted(() => {
  loadGroupOptions();
});

/**
 * 打开抽屉并重置表单数据。
 * @since 2026-08-13 00:00:00
 */
function open() {
  show.value = true;
  formData.value = {
    produceDate: null,
    produceLineGroupCode: '',
    produceLineCode: '',
    subProduceLineCode: '',
    workGroupCode: '',
    subProduceLineId: null,
    totalTimeMinutes: null,
    totalPersons: null,
    totalPersonTimeMinutes: null,
    remark: '',
  };
  lineOptions.value = [];
  subLineOptions.value = [];
  workGroupOptions.value = [];
}

defineExpose({ open });

/**
 * 提交表单：校验通过后以单条数组调用批量保存接口。
 * @since 2026-08-13 00:00:00
 */
function handleSubmit() {
  formRef.value
    .validate()
    .then(() => {
      const payload: any = { ...formData.value };
      payload.produceDate = dayjs(payload.produceDate).format('YYYY-MM-DD');
      // 单条新增，提交时用 [] 包裹调用批量保存接口
      return savePersonTimeReport([payload]);
    })
    .then(() => {
      message.success($t('personTimeReport.addSuccess'));
      show.value = false;
      emit('refresh');
    })
    .catch(() => {
      message.warning($t('personTimeReport.operationFailed'));
    });
}

/**
 * 关闭抽屉。
 * @since 2026-08-13 00:00:00
 */
function handleClose() {
  show.value = false;
}
</script>

<template>
  <Drawer
    v-model:open="show"
    :title="$t('personTimeReport.addTitle')"
    width="600"
    :destroy-on-close="true"
    :footer-style="{ textAlign: 'right' }"
  >
    <Form
      ref="formRef"
      :label-col="{ span: 6 }"
      :model="formData"
      :rules="rules"
      :wrapper-col="{ span: 18 }"
      autocomplete="off"
      layout="horizontal"
    >
      <FormItem :label="$t('personTimeReport.produceDate')" name="produceDate">
        <DatePicker
          v-model:value="formData.produceDate"
          :placeholder="$t('personTimeReport.inputProduceDate')"
          style="width: 100%"
          allow-clear
        />
      </FormItem>
      <FormItem
        :label="$t('personTimeReport.produceLineGroup')"
        name="produceLineGroupCode"
      >
        <Select
          v-model:value="formData.produceLineGroupCode"
          :options="groupOptions"
          :placeholder="$t('personTimeReport.produceLineGroup')"
          style="width: 100%"
          allow-clear
          @change="handleGroupChange"
        />
      </FormItem>
      <FormItem
        :label="$t('personTimeReport.produceLine')"
        name="produceLineCode"
      >
        <Select
          v-model:value="formData.produceLineCode"
          :options="lineOptions"
          :placeholder="$t('personTimeReport.produceLine')"
          style="width: 100%"
          allow-clear
          @change="handleLineChange"
        />
      </FormItem>
      <FormItem
        :label="$t('personTimeReport.subProduceLine')"
        name="subProduceLineCode"
      >
        <Select
          v-model:value="formData.subProduceLineCode"
          :options="subLineOptions"
          :placeholder="$t('personTimeReport.subProduceLine')"
          style="width: 100%"
          allow-clear
          @change="handleSubLineChange"
        />
      </FormItem>
      <FormItem :label="$t('personTimeReport.workGroup')" name="workGroupCode">
        <Select
          v-model:value="formData.workGroupCode"
          :options="workGroupOptions"
          :placeholder="$t('personTimeReport.workGroup')"
          style="width: 100%"
          allow-clear
          @change="handleWorkGroupChange"
        />
      </FormItem>
      <FormItem
        :label="$t('personTimeReport.totalTimeMinutes')"
        name="totalTimeMinutes"
      >
        <InputNumber
          v-model:value="formData.totalTimeMinutes"
          :min="0"
          :precision="0"
          style="width: 100%"
        />
      </FormItem>
      <FormItem
        :label="$t('personTimeReport.totalPersons')"
        name="totalPersons"
      >
        <InputNumber
          v-model:value="formData.totalPersons"
          :min="0"
          :precision="0"
          style="width: 100%"
        />
      </FormItem>
      <FormItem
        :label="$t('personTimeReport.totalPersonTimeMinutes')"
        name="totalPersonTimeMinutes"
      >
        <InputNumber
          v-model:value="formData.totalPersonTimeMinutes"
          :min="0"
          :precision="0"
          style="width: 100%"
        />
      </FormItem>
      <FormItem :label="$t('personTimeReport.remark')">
        <Textarea v-model:value="formData.remark" :rows="3" :maxlength="200" />
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <Button @click="handleClose">
          {{ $t('personTimeReport.cancel') }}
        </Button>
        <Button type="primary" @click="handleSubmit">
          {{ $t('personTimeReport.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
