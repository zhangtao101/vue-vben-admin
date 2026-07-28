<script lang="ts" setup>
import { ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  message,
  Select,
  SelectOption,
  Space,
} from 'ant-design-vue';

import { useSectionStore } from '#/store';

defineOptions({
  name: 'SectionSetting',
});

const emit = defineEmits<{
  refresh: [];
}>();

const sectionStore = useSectionStore();

// 临时假数据，接口就绪后替换为接口返回
const fakeSections = [
  { sectionCode: 'SEC001', sectionName: '前段' },
  { sectionCode: 'SEC002', sectionName: '中段' },
  { sectionCode: 'SEC003', sectionName: '后段' },
  { sectionCode: 'SEC004', sectionName: '后段包装' },
];

const show = ref(false);
const submitting = ref(false);
const options = ref<{ label: string; value: string }[]>([]);
const selectedCode = ref<string>('');

function open() {
  show.value = true;
  selectedCode.value = sectionStore.sectionCode;
  options.value = fakeSections.map((item) => ({
    label: `${item.sectionName}__${item.sectionCode}`,
    value: item.sectionCode,
  }));
}

defineExpose({ open });

function handleSubmit() {
  if (!selectedCode.value) {
    message.warning($t('common.pleaseSelect'));
    return;
  }
  const item = fakeSections.find((i) => i.sectionCode === selectedCode.value);
  submitting.value = true;
  sectionStore.setSection(selectedCode.value, item?.sectionName ?? '');
  message.success($t('common.successfulOperation'));
  submitting.value = false;
  show.value = false;
  emit('refresh');
}

function handleClose() {
  show.value = false;
  submitting.value = false;
  selectedCode.value = '';
  options.value = [];
}
</script>

<template>
  <Drawer
    v-model:open="show"
    :title="$t('ui.widgets.sectionSetting')"
    :width="480"
    :destroy-on-close="true"
    :footer-style="{ textAlign: 'right' }"
    @close="handleClose"
  >
    <Form layout="vertical">
      <FormItem :label="$t('ui.widgets.sectionSetting')">
        <Select
          v-model:value="selectedCode"
          :placeholder="$t('common.pleaseSelect')"
          allow-clear
          show-search
          option-filter-prop="label"
        >
          <SelectOption v-for="opt in options" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </SelectOption>
        </Select>
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
