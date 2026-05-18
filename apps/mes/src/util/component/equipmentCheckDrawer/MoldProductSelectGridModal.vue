<script lang="ts" setup>
/**
 * [INPUT]: 依赖 moldArchiveMgmt.service.ts 中的 getErpProductList 接口、ant-design-vue、#/locales
 * [OUTPUT]: 对外提供 MoldProductSelectGridModal 组件，用于选择产品
 * [POS]: 设备管理模块 的模具档案产品选择弹窗组件，被 MoldProductSelectModal.vue 引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-18 13:32:00
 */

import { nextTick, ref, watch } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  Modal,
  Space,
} from 'ant-design-vue';

import { $t } from '#/locales';

import MoldProductGridTable from './MoldProductGridTable.vue';

// ========== Props & Emits ==========

interface Emits {
  (e: 'confirm', product: any): void;
}

defineOptions({
  name: 'MoldProductSelectGridModal',
});

const emit = defineEmits<Emits>();

// ========== 状态 ==========

const modalVisible = ref(false);

/** 查询参数 */
const queryParams = ref({
  productCode: '',
  productName: '',
});

/** 表格引用 */
const gridTableRef = ref<InstanceType<typeof MoldProductGridTable> | null>(
  null,
);

// ========== 监听 ==========

watch(
  () => modalVisible.value,
  (val) => {
    if (val) {
      resetForm();
      // 延迟加载列表，确保 DOM 已渲染
      nextTick(() => {
        gridTableRef.value?.loadData(queryParams.value);
      });
    }
  },
);

// ========== 方法 ==========

/**
 * 重置表单数据。
 */
function resetForm() {
  queryParams.value = {
    productCode: '',
    productName: '',
  };
}

/**
 * 打开弹窗。
 */
function open() {
  modalVisible.value = true;
}

/**
 * 搜索产品。
 */
function handleSearch() {
  gridTableRef.value?.loadData(queryParams.value);
}

/**
 * 重置搜索。
 */
function handleReset() {
  queryParams.value = {
    productCode: '',
    productName: '',
  };
  handleSearch();
}

/**
 * 选择产品（由子组件调用）。
 */
function handleSelectProduct(record: any) {
  emit('confirm', record);
  modalVisible.value = false;
}

/**
 * 关闭弹窗。
 */
function handleClose() {
  modalVisible.value = false;
}

// ========== 暴露方法 ==========

defineExpose({
  open,
});
</script>

<template>
  <Modal
    v-model:open="modalVisible"
    :title="$t('moldArchiveMgmt.selectProduct')"
    :width="800"
    :footer="null"
    :destroy-on-close="true"
    @cancel="handleClose"
  >
    <!-- 产品搜索区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <FormItem
          :label="$t('moldArchiveMgmt.productCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.productCode"
            :placeholder="$t('moldArchiveMgmt.productCodePlaceholder')"
            allow-clear
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem
          :label="$t('moldArchiveMgmt.productName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.productName"
            :placeholder="$t('moldArchiveMgmt.productNamePlaceholder')"
            allow-clear
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Space>
            <Button type="primary" @click="handleSearch">
              <Icon icon="mdi:magnify" class="inline-block align-middle" />
              {{ $t('common.search') }}
            </Button>
            <Button @click="handleReset">
              <Icon icon="mdi:refresh" class="inline-block align-middle" />
              {{ $t('common.reset') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>

    <!-- 产品列表 - VXE Grid -->
    <div>
      <MoldProductGridTable ref="gridTableRef" @select="handleSelectProduct" />
    </div>
  </Modal>
</template>
