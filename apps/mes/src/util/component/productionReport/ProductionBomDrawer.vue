<script lang="ts" setup>
/**
 * 生产BOM新增/编辑/查看抽屉
 * 使用单个表单形式编辑，提交时通过 [] 包裹调用批量接口。
 */
import { computed, ref, watch } from 'vue';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Space,
} from 'ant-design-vue';

import { insertProductBom } from '#/api';
import { $t } from '#/locales';
import MaterialSelect from '#/util/component/MaterialSelect.vue';

defineOptions({
  name: 'ProductionBomDrawer',
});

// Emits
const emit = defineEmits<{
  refresh: [];
}>();

// 内部状态
const show = ref(false);
const currentMode = ref<'create' | 'update' | 'view'>('create');

// 表单数据
const formData = ref<any>({
  workSheetId: undefined,
  code: '',
  productCode: '',
  productName: '',
  materialCode: '',
  materialName: '',
  perQuantity: '',
  baseQty: '',
  batchQty: '',
  measureError: '',
  auxiliaryUnit: '',
  unit: '',
});

// 表单校验规则：查看模式下清空，避免只读字段被校验
// baseQty 有值时，batchQty、measureError 必填
const rules = computed<Record<string, any>>(() => {
  if (currentMode.value === 'view') {
    return {};
  }
  const hasBaseQty = hasValue(formData.value.baseQty);
  return {
    materialCode: [
      { required: true, message: $t('productionBom.requireMaterial') },
    ],
    batchQty: hasBaseQty
      ? [
          {
            required: true,
            message: $t('productionBom.baseQtyRequiredBatchQty'),
          },
        ]
      : [],
    measureError: hasBaseQty
      ? [
          {
            required: true,
            message: $t('productionBom.baseQtyRequiredMeasureError'),
          },
        ]
      : [],
  };
});

// 判断字段是否有值
function hasValue(value: any) {
  return value !== '' && value !== null && value !== undefined;
}

// baseQty 变化时清除 batchQty、measureError 的历史校验状态，避免残留错误提示
watch(
  () => formData.value.baseQty,
  () => {
    formRef.value?.clearValidate(['batchQty', 'measureError']);
  },
);

const formRef = ref<any>();

// 根据传入行构建表单数据，新增时返回空对象；workSheetId 不展示，但提交时需要
function buildFormData(row?: any, workSheetId?: number) {
  if (!row?.id) {
    return {
      workSheetId,
      code: '',
      productCode: '',
      productName: '',
      materialCode: '',
      materialName: '',
      perQuantity: '',
      baseQty: '',
      batchQty: '',
      measureError: '',
      auxiliaryUnit: '',
      unit: '',
    };
  }
  return {
    id: row.id,
    workSheetId: row.workSheetId,
    code: row.code || '',
    productCode: row.productCode || '',
    productName: row.productName || '',
    materialCode: row.materialCode || '',
    materialName: row.materialName || '',
    perQuantity: row.perQuantity ?? '',
    baseQty: row.baseQty ?? '',
    batchQty: row.batchQty ?? '',
    measureError: row.measureError ?? '',
    auxiliaryUnit: row.auxiliaryUnit || '',
    unit: row.unit || '',
  };
}

function open(
  mode: 'create' | 'update' | 'view',
  row?: any,
  workSheetId?: number,
) {
  currentMode.value = mode;
  show.value = true;
  formData.value = buildFormData(row, workSheetId);
}

defineExpose({ open });

// 选中物料后回填表单
function handleSelectMaterial(material: any) {
  formData.value.materialCode = material.materialCode;
  formData.value.materialName = material.materialName;
  formData.value.auxiliaryUnit = material.auxiliaryUnit;
  formData.value.unit = material.unit;
}

function handleSubmit() {
  formRef.value
    .validate()
    .then(() => {
      const payload = { ...formData.value };
      // 新增与编辑统一走 insert 接口（后端按 id 区分新增/修改），单个形式编辑用 [] 包裹调用批量接口
      return insertProductBom([payload]);
    })
    .then(() => {
      message.success(
        currentMode.value === 'create'
          ? $t('productionBom.addSuccess')
          : $t('productionBom.editSuccess'),
      );
      show.value = false;
      emit('refresh');
    })
    .catch(() => {
      message.warning($t('productionBom.operationFailed'));
    });
}

function handleClose() {
  show.value = false;
}
</script>

<template>
  <Drawer
    v-model:open="show"
    :title="
      currentMode === 'create'
        ? $t('productionBom.addTitle')
        : currentMode === 'update'
          ? $t('productionBom.editTitle')
          : $t('productionBom.viewTitle')
    "
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
      <FormItem :label="$t('productionBom.code')">
        <Input
          v-model:value="formData.code"
          :disabled="currentMode === 'view'"
          :maxlength="50"
        />
      </FormItem>
      <FormItem :label="$t('productionBom.productCode')">
        <Input
          v-model:value="formData.productCode"
          :disabled="currentMode === 'view'"
          :maxlength="50"
        />
      </FormItem>
      <FormItem :label="$t('productionBom.productName')">
        <Input
          v-model:value="formData.productName"
          :disabled="currentMode === 'view'"
          :maxlength="50"
        />
      </FormItem>
      <FormItem :label="$t('productionBom.materialCode')" name="materialCode">
        <Space style="width: 100%">
          <Input
            v-model:value="formData.materialCode"
            :placeholder="$t('productionBom.inputMaterialCode')"
            disabled
            style="flex: 1"
          />
          <MaterialSelect
            :disabled="currentMode === 'view'"
            @select="handleSelectMaterial"
          />
        </Space>
      </FormItem>
      <FormItem :label="$t('productionBom.materialName')">
        <Input
          v-model:value="formData.materialName"
          :placeholder="$t('productionBom.inputMaterialName')"
          disabled
        />
      </FormItem>
      <FormItem :label="$t('productionBom.auxiliaryUnit')">
        <Input v-model:value="formData.auxiliaryUnit" disabled />
      </FormItem>
      <FormItem :label="$t('productionBom.unit')">
        <Input v-model:value="formData.unit" disabled />
      </FormItem>
      <FormItem :label="$t('productionBom.perQuantity')">
        <Input
          v-model:value="formData.perQuantity"
          :disabled="currentMode === 'view'"
          :maxlength="20"
        />
      </FormItem>
      <FormItem :label="$t('productionBom.baseQty')">
        <Input
          v-model:value="formData.baseQty"
          :disabled="currentMode === 'view'"
          :maxlength="20"
        />
      </FormItem>
      <FormItem :label="$t('productionBom.batchQty')" name="batchQty">
        <Input
          v-model:value="formData.batchQty"
          :disabled="currentMode === 'view'"
          :maxlength="20"
        />
      </FormItem>
      <FormItem :label="$t('productionBom.measureError')" name="measureError">
        <Input
          v-model:value="formData.measureError"
          :disabled="currentMode === 'view'"
          :maxlength="20"
        />
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <Button @click="handleClose">{{ $t('productionBom.cancel') }}</Button>
        <Button
          v-if="currentMode !== 'view'"
          type="primary"
          @click="handleSubmit"
        >
          {{ $t('productionBom.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
