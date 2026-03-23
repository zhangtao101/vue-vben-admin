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

import { saveReturnRemarks } from '#/api';

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

// 退货备注
const remarks = ref('');

// 保存
function handleSave() {
  if (!remarks.value.trim()) {
    message.warning($t('common.pleaseEnter'));
    return;
  }

  saveReturnRemarks({
    idList: props.ids,
    remarks: remarks.value,
  }).then(() => {
    message.success($t('common.successfulOperation'));
    visible.value = false;
    emit('success');
  });
}

// 监听弹窗打开
watch(visible, (val) => {
  if (val) {
    remarks.value = '';
  }
});
</script>

<template>
  <Drawer
    v-model:open="visible"
    :title="$t('storeManagement.materialInputList.inputReturnRemark')"
    :footer-style="{ textAlign: 'right' }"
    width="500"
  >
    <Form layout="vertical">
      <FormItem
        :label="$t('storeManagement.materialInputList.inputReturnRemark')"
        required
      >
        <Input.TextArea
          v-model:value="remarks"
          :placeholder="$t('common.pleaseEnter')"
          :auto-size="{ minRows: 4, maxRows: 8 }"
        />
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <Button @click="visible = false">{{ $t('common.cancel') }}</Button>
        <Button type="primary" @click="handleSave">
          {{ $t('common.save') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
