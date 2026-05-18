<script lang="ts" setup>
/**
 * [INPUT]: 依赖 moldArchiveMgmt.service.ts 中的 getErpProductList 接口、ant-design-vue、#/locales
 * [OUTPUT]: 对外提供 MoldProductSelectDrawer 组件，用于选择产品并返回绑定信息
 * [POS]: 设备管理模块 的模具档案产品绑定抽屉组件，被 MoldArchiveDrawer.vue 引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-18 13:46:00
 */

import { ref } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Select,
} from 'ant-design-vue';

import { $t } from '#/locales';

import MoldProductSelectGridModal from './MoldProductSelectGridModal.vue';

// ========== Props & Emits ==========

interface Emits {
  (
    e: 'confirm',
    product: ProductBindItem,
    isEdit: boolean,
    editIndex?: null | number,
  ): void;
}

defineOptions({
  name: 'MoldProductSelectDrawer',
});

const emit = defineEmits<Emits>();

// ========== 状态 ==========

const drawerVisible = ref(false);

/** 是否为编辑模式 */
const isEditMode = ref(false);

/** 当前编辑的行索引 */
const currentEditIndex = ref<null | number>(null);

/** 绑定表单数据 */
const formData = ref<any>({
  productCode: '',
  productName: '',
  cavityCount: undefined,
  isPrimary: 0,
  remark: '',
});

/** 产品选择弹窗引用 */
const productGridModalRef = ref<InstanceType<
  typeof MoldProductSelectGridModal
> | null>(null);

// ========== 方法 ==========

/**
 * 打开抽屉（新增模式）。
 */
function open() {
  isEditMode.value = false;
  currentEditIndex.value = null;
  drawerVisible.value = true;
}

/**
 * 打开抽屉（编辑模式）。
 */
function openForEdit(data: ProductBindItem, index: number) {
  isEditMode.value = true;
  currentEditIndex.value = index;
  formData.value = {
    productCode: data.productCode,
    productName: data.productModel || '',
    cavityCount: data.cavityCount,
    isPrimary: data.isPrimary,
    remark: data.remark || '',
  };
  drawerVisible.value = true;
}

/**
 * 打开产品选择弹窗。
 */
function handleOpenProductSelect() {
  productGridModalRef.value?.open();
}

/**
 * 选择产品（由子组件调用）。
 */
function handleSelectProduct(record: any) {
  formData.value.productCode = record.productCode;
  formData.value.productName = record.productName;
}

/**
 * 确认选择。
 */
function handleConfirm() {
  if (!formData.value.productCode) {
    message.warning($t('moldArchiveMgmt.pleaseSelectProduct'));
    return;
  }

  const result: ProductBindItem = {
    productCode: formData.value.productCode,
    productModel: formData.value.productName,
    cavityCount: formData.value.cavityCount,
    isPrimary: formData.value.isPrimary,
    remark: formData.value.remark,
  };

  emit('confirm', result, isEditMode.value, currentEditIndex.value);
  drawerVisible.value = false;
}

/**
 * 关闭抽屉。
 */
function handleClose() {
  drawerVisible.value = false;
  // 重置表单
  formData.value = {
    productCode: '',
    productName: '',
    cavityCount: undefined,
    isPrimary: 0,
    remark: '',
  };
  isEditMode.value = false;
  currentEditIndex.value = null;
}

// ========== 类型定义 ==========

export interface ProductBindItem {
  productCode: string;
  productModel?: string;
  cavityCount?: number;
  isPrimary: number;
  remark?: string;
}

// ========== 暴露方法 ==========

defineExpose({
  open,
  openForEdit,
});
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :title="
      isEditMode
        ? $t('moldArchiveMgmt.editProductRelation')
        : $t('moldArchiveMgmt.addProductRelation')
    "
    :width="500"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <!-- 绑定表单 -->
    <Card>
      <Form :model="formData" layout="vertical">
        <FormItem :label="$t('moldArchiveMgmt.productCode')">
          <div class="flex gap-2">
            <Input
              v-model:value="formData.productCode"
              readonly
              style="flex: 1"
            />
            <Button type="primary" @click="handleOpenProductSelect">
              <Icon icon="mdi:magnify" class="inline-block align-middle" />
              {{ $t('moldArchiveMgmt.selectProduct') }}
            </Button>
          </div>
        </FormItem>
        <FormItem :label="$t('moldArchiveMgmt.productName')">
          <Input v-model:value="formData.productName" readonly />
        </FormItem>
        <FormItem :label="$t('moldArchiveMgmt.cavityCount')">
          <InputNumber
            v-model:value="formData.cavityCount"
            :min="0"
            style="width: 100%"
          />
        </FormItem>
        <FormItem :label="$t('moldArchiveMgmt.isPrimary')">
          <Select
            v-model:value="formData.isPrimary"
            :options="[
              { label: $t('moldArchiveMgmt.isPrimaryYes'), value: 1 },
              { label: $t('moldArchiveMgmt.isPrimaryNo'), value: 0 },
            ]"
          />
        </FormItem>
        <FormItem :label="$t('moldArchiveMgmt.remark')">
          <Input.TextArea v-model:value="formData.remark" :rows="2" />
        </FormItem>
      </Form>
    </Card>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button @click="handleClose">
          {{ $t('common.cancel') }}
        </Button>
        <Button type="primary" @click="handleConfirm">
          {{ $t('common.confirm') }}
        </Button>
      </div>
    </template>
  </Drawer>

  <!-- 产品选择弹窗 -->
  <MoldProductSelectGridModal
    ref="productGridModalRef"
    @confirm="handleSelectProduct"
  />
</template>
