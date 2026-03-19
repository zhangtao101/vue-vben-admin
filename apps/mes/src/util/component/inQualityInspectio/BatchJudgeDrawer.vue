<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Select,
  SelectOption,
  Space,
} from 'ant-design-vue';

import { batchJudgeQualityInspection } from '#/api';

const props = defineProps<{
  ids: string[];
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

// 表单数据
const formData = ref({
  checkResult: undefined as number | undefined,
  judgeTime: '',
  checkUsername: '',
});

// 质检结论选项
const checkResultOptions = [
  { value: 1, label: $t('storeManagement.inspectionSlip.qualified') },
  { value: 2, label: $t('storeManagement.inspectionSlip.unqualified') },
  { value: 3, label: $t('storeManagement.inspectionSlip.concessionAccept') },
  { value: 4, label: $t('storeManagement.inspectionSlip.emergencyRelease') },
];

// 提交
function handleSubmit() {
  if (!formData.value.checkResult) {
    message.warning($t('storeManagement.inspectionSlip.selectCheckResult'));
    return;
  }

  batchJudgeQualityInspection(
    String(formData.value.checkResult),
    props.ids,
  ).then(() => {
    message.success($t('common.successfulOperation'));
    visible.value = false;
    emit('success');
  });
}

// 监听弹窗打开
watch(visible, (val) => {
  if (val) {
    // 设置默认日期
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    formData.value.judgeTime = `${year}-${month}-${day}`;

    // 获取当前用户名（这里暂时留空，需要从全局状态获取）
    formData.value.checkUsername = '';
    formData.value.checkResult = undefined;
  }
});
</script>

<template>
  <Drawer
    v-model:open="visible"
    :title="$t('storeManagement.inspectionSlip.batchJudge')"
    :footer-style="{ textAlign: 'right' }"
    width="500"
  >
    <Form layout="vertical">
      <FormItem :label="$t('storeManagement.inspectionSlip.checkResult')" required>
        <Select
          v-model:value="formData.checkResult"
          :placeholder="$t('common.pleaseSelect')"
          style="width: 100%"
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
      <FormItem :label="$t('storeManagement.inspectionSlip.judgeTime')">
        <Input v-model:value="formData.judgeTime" disabled />
      </FormItem>
      <FormItem :label="$t('storeManagement.inspectionSlip.checkUsername')">
        <Input v-model:value="formData.checkUsername" disabled />
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <Button @click="visible = false">{{ $t('common.cancel') }}</Button>
        <Button type="primary" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
