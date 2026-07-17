<script lang="ts" setup>
import { ref } from 'vue';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Space,
  Textarea,
} from 'ant-design-vue';
import { type Rule } from 'ant-design-vue/es/form';

import { addBomItem, updateBomItem } from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'BomItemDrawer',
});

const emit = defineEmits<{
  refresh: [];
}>();

const show = ref(false);
const currentMode = ref<'add' | 'edit'>('add');
const submitting = ref(false);
const formRef = ref<any>();

function isEdit() {
  return currentMode.value === 'edit';
}

function buildEmpty(productCode?: string) {
  return {
    id: undefined,
    orderNumber: undefined,
    materialCode: '',
    materialName: '',
    codeNumber: '',
    perDosage: '',
    perQuantity: '',
    singleDosage: '',
    unit: '',
    conversionFaction: '',
    auxiliaryDoage: '',
    auxiliaryUnit: '',
    productCode: productCode || '',
    supplier: '',
    useProcess: '',
    remark: '',
  };
}

function open(mode: 'add' | 'edit', payload: any) {
  currentMode.value = mode;
  show.value = true;
  formData.value = mode === 'add' ? buildEmpty(payload?.productCode) : { ...buildEmpty(payload?.productCode), ...payload };
}

defineExpose({ open });

const formData = ref<any>(buildEmpty());

const rules: Record<string, Rule[]> = {
  orderNumber: [{ required: true, message: $t('baseInfo.orderNumber') }],
  materialCode: [{ required: true, message: $t('baseInfo.materialCode') }],
  materialName: [{ required: true, message: $t('baseInfo.partOrMaterialName') }],
  singleDosage: [{ required: true, message: $t('baseInfo.singleDosage') }],
};

function handleSubmit() {
  formRef.value
    .validate()
    .then(() => {
      submitting.value = true;
      const api = isEdit() ? updateBomItem : addBomItem;
      api(formData.value)
        .then(() => {
          message.success($t('common.successfulOperation'));
          show.value = false;
          emit('refresh');
        })
        .catch((error: any) => {
          message.error(error?.message || $t('common.operationFailed'));
        })
        .finally(() => {
          submitting.value = false;
        });
    })
    .catch(() => {});
}

function handleClose() {
  show.value = false;
  currentMode.value = 'add';
  submitting.value = false;
  formRef.value?.clearValidate?.();
  formData.value = buildEmpty();
}
</script>

<template>
  <Drawer
    v-model:open="show"
    :title="isEdit() ? $t('common.edit') : $t('common.add')"
    width="640"
    :destroy-on-close="true"
    :footer-style="{ textAlign: 'right' }"
    @close="handleClose"
  >
    <Form ref="formRef" :model="formData" :rules="rules" layout="vertical">
      <FormItem :label="$t('baseInfo.orderNumber')" name="orderNumber">
        <InputNumber
          v-model:value="formData.orderNumber"
          :min="0"
          :precision="0"
          :disabled="isEdit()"
          style="width: 100%"
        />
      </FormItem>
      <FormItem :label="$t('baseInfo.materialCode')" name="materialCode">
        <Input v-model:value="formData.materialCode" />
      </FormItem>
      <FormItem :label="$t('baseInfo.partOrMaterialName')" name="materialName">
        <Input v-model:value="formData.materialName" />
      </FormItem>
      <FormItem :label="$t('baseInfo.codeName')" name="codeNumber">
        <Input v-model:value="formData.codeNumber" />
      </FormItem>
      <FormItem :label="$t('baseInfo.perDosage')" name="perDosage">
        <Input v-model:value="formData.perDosage" />
      </FormItem>
      <FormItem :label="$t('baseInfo.perQuantity')" name="perQuantity">
        <Input v-model:value="formData.perQuantity" />
      </FormItem>
      <FormItem :label="$t('baseInfo.singleDosage')" name="singleDosage">
        <Input v-model:value="formData.singleDosage" />
      </FormItem>
      <FormItem :label="$t('baseInfo.unit')" name="unit">
        <Input v-model:value="formData.unit" />
      </FormItem>
      <FormItem :label="$t('baseInfo.conversionFaction')" name="conversionFaction">
        <Input v-model:value="formData.conversionFaction" />
      </FormItem>
      <FormItem :label="$t('baseInfo.auxiliaryDoage')" name="auxiliaryDoage">
        <Input v-model:value="formData.auxiliaryDoage" />
      </FormItem>
      <FormItem :label="$t('baseInfo.auxiliaryUnit')" name="auxiliaryUnit">
        <Input v-model:value="formData.auxiliaryUnit" />
      </FormItem>
      <FormItem :label="$t('baseInfo.productCode')" name="productCode">
        <Input v-model:value="formData.productCode" :disabled="isEdit()" />
      </FormItem>
      <FormItem :label="$t('baseInfo.supplier')" name="supplier">
        <Input v-model:value="formData.supplier" />
      </FormItem>
      <FormItem :label="$t('baseInfo.useProcess')" name="useProcess">
        <Input v-model:value="formData.useProcess" />
      </FormItem>
      <FormItem :label="$t('baseInfo.remarkDescription')" name="remark">
        <Textarea v-model:value="formData.remark" />
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
