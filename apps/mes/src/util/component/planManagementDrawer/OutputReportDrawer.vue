<script lang="ts" setup>
import { ref } from 'vue';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  InputNumber,
  message,
  Space,
} from 'ant-design-vue';

import { worksheetOutputUpdateBatch } from '#/api';
import { $t } from '#/locales';

defineOptions({ name: 'OutputReportDrawer' });

const emit = defineEmits<{
  refresh: [];
}>();

const show = ref(false);
const loading = ref(false);
const editRow = ref<any>({});

const formData = ref({
  goodQty: 0,
  defectQty: 0,
  remainQty: 0,
});

/**
 * 打开结束上报抽屉
 * @param row 工单行数据
 * @since 2026-08-11
 */
function open(row: any) {
  editRow.value = row;

  formData.value = {
    goodQty: Number(row.goodQty || 0),
    defectQty: Number(row.defectQty || 0),
    remainQty: Number(row.remainQty || 0),
  };

  show.value = true;
}

/**
 * 关闭抽屉，重置所有状态
 * @since 2026-08-11
 */
function handleClose() {
  show.value = false;
  editRow.value = {};
  formData.value = { goodQty: 0, defectQty: 0, remainQty: 0 };
}

/**
 * 提交结束上报
 * @since 2026-08-11
 */
function handleSubmit() {
  loading.value = true;

  const params: any = {
    defectQty: formData.value.defectQty,
    goodQty: formData.value.goodQty,
    remainQty: formData.value.remainQty,
    id: editRow.value.id,
  };

  worksheetOutputUpdateBatch(params)
    .then(() => {
      message.success($t('common.successfulOperation'));
      show.value = false;
      emit('refresh');
    })
    .finally(() => {
      loading.value = false;
    });
}

defineExpose({ open });
</script>

<template>
  <Drawer
    v-model:open="show"
    :title="$t('SMTmanagement.outputReport')"
    :width="480"
    :mask-closable="false"
    :destroy-on-close="true"
    :footer-style="{ textAlign: 'right' }"
    @close="handleClose"
  >
    <div class="mb-4 text-gray-500">
      {{ $t('SMTmanagement.workOrderNumber') }}：{{ editRow.workSheetCode }}
    </div>

    <Form layout="vertical" :model="formData">
      <FormItem :label="$t('SMTmanagement.goodQty')" name="goodQty">
        <InputNumber
          v-model:value="formData.goodQty"
          :min="0"
          style="width: 100%"
        />
      </FormItem>
      <FormItem :label="$t('SMTmanagement.defectQty')" name="defectQty">
        <InputNumber
          v-model:value="formData.defectQty"
          :min="0"
          style="width: 100%"
        />
      </FormItem>
      <FormItem :label="$t('SMTmanagement.remainQty')" name="remainQty">
        <InputNumber
          v-model:value="formData.remainQty"
          :min="0"
          style="width: 100%"
        />
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <Button @click="handleClose">{{ $t('common.cancel') }}</Button>
        <Button type="primary" :loading="loading" @click="handleSubmit">
          {{ $t('common.save') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
