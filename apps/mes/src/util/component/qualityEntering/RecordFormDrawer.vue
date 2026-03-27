<script lang="ts" setup>
import { ref, watch } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  DatePicker,
  Divider,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Select,
  Space,
} from 'ant-design-vue';

import {
  createQcRecord,
  fetchQcEnableConfig,
  fetchQcRecordDetail,
  fetchWorksheetInfo,
  fetchWorksheetList,
  updateQcRecord,
} from '#/api';

// Props
interface Props {
  visible?: boolean;
  status?: 'create' | 'enter' | 'update' | 'view';
  recordData?: any;
  formData?: any;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  success: [];
  'update:visible': [value: boolean];
}>();

// 抽屉可见性
const drawerVisible = ref(false);

// 表单数据
const formRef = ref();
const recordFormData = ref<any>({
  qcFormCode: '',
  worksheetCode: '',
  subProductCode: '',
  productCode: '',
  productName: '',
  planCode: '',
  checkTime: '',
  sendNumber: undefined,
  preparationNumber: undefined,
});

// 工单编号列表
const worksheetList = ref<string[]>([]);

// 是否显示送检数量和抽检数量
const showNumberFields = ref(false);

// 表单规则
const rules: any = {
  checkTime: [
    { required: true, message: $t('common.pleaseSelect'), trigger: 'change' },
  ],
};

// 标题
const titleMap = {
  create: $t('common.add'),
  update: $t('common.edit'),
  view: $t('common.view'),
  enter: $t('qualityModule.qualityCheck.qualityEntering.enter'),
};

// 是否只读
const isReadonly = ref(false);

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    drawerVisible.value = val;
    if (val) {
      initForm();
    }
  },
);

// 监听drawerVisible变化
watch(drawerVisible, (val) => {
  emit('update:visible', val);
});

// 初始化表单
function initForm() {
  // 设置只读状态
  isReadonly.value = props.status === 'view';

  // 获取启用配置
  fetchQcEnableConfig({ qcFormCode: props.formData?.formCode }).then(
    (res: any) => {
      showNumberFields.value = res.sendNumberEnable === true;
    },
  );

  if (props.status === 'create') {
    // 新增
    recordFormData.value = {
      qcFormCode: props.formData?.formCode || '',
      worksheetCode: '',
      subProductCode: '',
      productCode: '',
      productName: '',
      planCode: '',
      checkTime: '',
      sendNumber: undefined,
      preparationNumber: undefined,
    };
    worksheetList.value = [];
  } else if (props.recordData) {
    // 编辑、查看、录入
    fetchQcRecordDetail(props.recordData.id).then((res: any) => {
      recordFormData.value = { ...res };
      if (recordFormData.value.worksheetCode) {
        worksheetList.value = [recordFormData.value.worksheetCode];
      }
    });
  }
}

// 搜索工单编号
function handleSearchWorksheet(query: string) {
  if (!query) {
    worksheetList.value = [];
    return;
  }
  fetchWorksheetList({ worksheetCode: query }).then((res: any) => {
    worksheetList.value = res || [];
  });
}

// 工单变化
function handleWorksheetChange(worksheetCode: any) {
  if (!worksheetCode) {
    recordFormData.value.subProductCode = '';
    recordFormData.value.productCode = '';
    recordFormData.value.productName = '';
    recordFormData.value.planCode = '';
    return;
  }
  fetchWorksheetInfo({ worksheetCode }).then((res: any) => {
    recordFormData.value.subProductCode = res.subProductCode || '';
    recordFormData.value.productCode = res.productCode || '';
    recordFormData.value.productName = res.productName || '';
    recordFormData.value.planCode = res.planCode || '';
  });
}

// 保存
function handleSave() {
  formRef.value?.validate().then(() => {
    const data = { ...recordFormData.value };

    if (props.status === 'create') {
      createQcRecord(data).then(() => {
        message.success($t('common.successfulOperation'));
        drawerVisible.value = false;
        emit('success');
      });
    } else if (props.status === 'update' || props.status === 'enter') {
      updateQcRecord(data).then(() => {
        message.success($t('common.successfulOperation'));
        drawerVisible.value = false;
        emit('success');
      });
    }
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
    :title="titleMap[status ?? 'create']"
    width="700px"
    :footer-style="{ textAlign: 'right' }"
  >
    <Form
      ref="formRef"
      :model="recordFormData"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <FormItem
        :label="$t('qualityModule.qualityCheck.qualityEntering.recordCode')"
      >
        <Input v-model:value="recordFormData.qcFormCode" disabled />
      </FormItem>

      <FormItem
        v-if="recordFormData?.productReference"
        :label="$t('qualityModule.qualityCheck.qualityEntering.worksheetCode')"
        required
      >
        <Select
          v-model:value="recordFormData.worksheetCode"
          :options="worksheetList.map((item) => ({ value: item, label: item }))"
          show-search
          :filter-option="false"
          :placeholder="$t('common.pleaseSelect')"
          :disabled="isReadonly"
          @search="handleSearchWorksheet"
          @change="handleWorksheetChange"
        />
      </FormItem>

      <FormItem
        :label="$t('qualityModule.qualityCheck.qualityEntering.subProductCode')"
      >
        <Input v-model:value="recordFormData.subProductCode" disabled />
      </FormItem>

      <FormItem
        :label="$t('qualityModule.qualityCheck.qualityEntering.productCode')"
      >
        <Input v-model:value="recordFormData.productCode" disabled />
      </FormItem>

      <FormItem
        :label="$t('qualityModule.qualityCheck.qualityEntering.productName')"
      >
        <Input v-model:value="recordFormData.productName" disabled />
      </FormItem>

      <FormItem
        :label="$t('qualityModule.qualityCheck.qualityEntering.planCode')"
      >
        <Input v-model:value="recordFormData.planCode" disabled />
      </FormItem>

      <FormItem
        :label="$t('qualityModule.qualityCheck.qualityEntering.checkTime')"
        name="checkTime"
      >
        <DatePicker
          v-model:value="recordFormData.checkTime"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
          :disabled="isReadonly"
        />
      </FormItem>

      <Divider v-if="showNumberFields" />

      <FormItem
        v-if="showNumberFields"
        :label="$t('qualityModule.qualityCheck.qualityEntering.sendNumber')"
      >
        <InputNumber
          v-model:value="recordFormData.sendNumber"
          :min="0"
          style="width: 100%"
          :disabled="isReadonly"
        />
      </FormItem>

      <FormItem
        v-if="showNumberFields"
        :label="
          $t('qualityModule.qualityCheck.qualityEntering.preparationNumber')
        "
      >
        <InputNumber
          v-model:value="recordFormData.preparationNumber"
          :min="0"
          style="width: 100%"
          disabled
        />
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <Button v-if="!isReadonly" type="primary" @click="handleSave">
          {{ $t('common.save') }}
        </Button>
        <Button @click="handleClose">
          {{ $t('common.close') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
