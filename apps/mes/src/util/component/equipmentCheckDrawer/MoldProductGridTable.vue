<script lang="ts" setup>
/**
 * [INPUT]: 依赖 moldArchiveMgmt.service.ts 中的 getErpProductList 接口、VXE Grid、#/locales
 * [OUTPUT]: 对外提供 MoldProductGridTable 组件，显示产品列表（单选）
 * [POS]: 设备管理模块 的产品列表组件，被 MoldProductSelectDrawer.vue 引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-18 11:04:00
 */

import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getErpProductList } from '#/api';
import { $t } from '#/locales';

// ========== Props & Emits ==========

interface Emits {
  (e: 'select', record: any): void;
}

defineOptions({
  name: 'MoldProductGridTable',
});

const emit = defineEmits<Emits>();

// ========== 状态 ==========

/** 当前选中的产品编码 */
const selectedProductCode = ref<string>('');

/** 查询参数（由父组件传入） */
const currentQueryParams = ref<any>({});

// ========== 表格配置 ==========

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50 },
    {
      field: 'productCode',
      title: $t('moldArchiveMgmt.productCode'),
      minWidth: 150,
    },
    {
      field: 'productName',
      title: $t('moldArchiveMgmt.productName'),
      minWidth: 200,
    },
  ],
  height: 300,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          productCode: currentQueryParams.value.productCode || undefined,
          productName: currentQueryParams.value.productName || undefined,
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  radioConfig: {
    trigger: 'row',
    reserve: true,
  },
  rowClassName: ({ row }) => {
    return selectedProductCode.value === row.productCode
      ? 'vxe-table--row-selected'
      : '';
  },
  stripe: true,
};

/** 表格事件 */
const gridEvents: VxeGridListeners<any> = {
  radioChange: ({ row }) => {
    selectedProductCode.value = row.productCode;
    emit('select', row);
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// ========== 方法 ==========

/**
 * 查询数据。
 */
async function queryData(params: any) {
  try {
    const res = await getErpProductList(params);
    return {
      total: res.total || 0,
      items: res.list || [],
    };
  } catch {
    return {
      total: 0,
      items: [],
    };
  }
}

/**
 * 加载数据。
 */
function loadData(queryParams: any) {
  currentQueryParams.value = queryParams;
  gridApi.reload();
}

// ========== 暴露方法 ==========

defineExpose({
  loadData,
});
</script>

<template>
  <Grid />
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

:deep(.vxe-table--row-selected) {
  background-color: #e6f7ff !important;
}
</style>
