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
  Space,
} from 'ant-design-vue';

import { setToCheckReason } from '#/api';

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

// 待判原因
const toCheckReason = ref('');

// 提交
function handleSubmit() {
  if (!toCheckReason.value.trim()) {
    message.warning($t('storeManagement.inspectionSlip.inputToCheckReason'));
    return;
  }

  setToCheckReason({
    formIdList: props.ids,
    toCheckReason: toCheckReason.value,
  }).then(() => {
    message.success($t('common.successfulOperation'));
    visible.value = false;
    emit('success');
  });
}

// 监听弹窗打开
watch(visible, (val) => {
  if (val) {
    toCheckReason.value = '';
  }
});
</script>

<template>
  <Drawer
    v-model:open="visible"
    :title="$t('storeManagement.inspectionSlip.noJudgeReason')"
    :footer-style="{ textAlign: 'right' }"
    width="500"
  >
    <Form layout="vertical">
      <FormItem
        :label="$t('storeManagement.inspectionSlip.toCheckReason')"
        required
      >
        <Input.TextArea
          v-model:value="toCheckReason"
          :placeholder="$t('common.pleaseEnter')"
          :auto-size="{ minRows: 4, maxRows: 8 }"
        />
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
