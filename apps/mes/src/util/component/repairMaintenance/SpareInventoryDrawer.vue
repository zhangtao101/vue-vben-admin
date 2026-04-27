<script lang="ts" setup>
import { ref } from 'vue';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  InputNumber,
  Space,
} from 'ant-design-vue';

import {
  adjustStock,
  getStockById,
} from '#/api/equipManagement/sparePartsInventoryMgmt.service';
import { $t } from '#/locales';
import { message } from '#/preferences';

// ========== Props & Emits ==========
const props = defineProps<{
  open: boolean;
  row?: any;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'success'): void;
}>();

// ========== 数据 ==========
const loading = ref(false);
const formData = ref({
  spareCode: '',
  spareName: '',
  spareModel: '',
  stockQuantity: 0,
  adjustQuantity: 0,
});

// ========== 监听 open 变化，加载数据 ==========
const handleOpenChange = (open: boolean) => {
  emit('update:open', open);
  if (open && props.row?.id) {
    // 编辑模式，加载详情
    getStockById(props.row.id).then((data: any) => {
      formData.value = {
        spareCode: data.spareCode || '',
        spareName: data.spareName || '',
        spareModel: data.spareModel || '',
        stockQuantity: data.stockQuantity || 0,
        adjustQuantity: data.stockQuantity || 0,
      };
    });
  } else if (open && props.row) {
    // 直接使用 row 数据
    formData.value = {
      spareCode: props.row.spareCode || '',
      spareName: props.row.spareName || '',
      spareModel: props.row.spareModel || '',
      stockQuantity: props.row.stockQuantity || 0,
      adjustQuantity: props.row.stockQuantity || 0,
    };
  }
};

// ========== 提交 ==========
function handleSubmit() {
  if (!props.row?.id) {
    return;
  }
  loading.value = true;
  adjustStock({
    id: props.row.id,
    quantity: formData.value.adjustQuantity,
  })
    .then(() => {
      message.success($t('common.successfulOperation'));
      emit('success');
      emit('update:open', false);
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>

<template>
  <Drawer
    :open="props.open"
    :title="$t('repair.spareInventory.adjustTitle')"
    width="500"
    :destroy-on-close="true"
    @open-change="handleOpenChange"
  >
    <Form :model="formData" layout="vertical">
      <FormItem :label="$t('repair.spareInventory.spareCode')">
        <InputNumber :value="formData.spareCode" disabled style="width: 100%" />
      </FormItem>
      <FormItem :label="$t('repair.spareInventory.spareName')">
        <InputNumber :value="formData.spareName" disabled style="width: 100%" />
      </FormItem>
      <FormItem :label="$t('repair.spareInventory.spareModel')">
        <InputNumber
          :value="formData.spareModel"
          disabled
          style="width: 100%"
        />
      </FormItem>
      <FormItem :label="$t('repair.spareInventory.stockQuantity')">
        <InputNumber
          :value="formData.stockQuantity"
          disabled
          style="width: 100%"
        />
      </FormItem>
      <FormItem :label="$t('repair.spareInventory.adjustQuantity')">
        <InputNumber
          v-model:value="formData.adjustQuantity"
          :min="0"
          style="width: 100%"
        />
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <Button @click="emit('update:open', false)">
          {{ $t('common.cancel') }}
        </Button>
        <Button type="primary" :loading="loading" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped></style>
