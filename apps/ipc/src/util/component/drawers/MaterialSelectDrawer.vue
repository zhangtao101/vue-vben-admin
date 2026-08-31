<script setup lang="ts">
import { ref } from 'vue';

import {
  Button,
  Drawer,
  FormItem,
  Input,
  message,
  Space,
} from 'ant-design-vue';

import {
  useVbenVxeGrid,
  type VxeGridProps,
} from '#/adapter/vxe-table';
import { searchMaterialList } from '#/api';
import { $t } from '#/locales';

defineOptions({ name: 'MaterialSelectDrawer' });

// Emits：选中物料后回传完整物料数据
const emit = defineEmits<{
  select: [material: any];
}>();

// ========== 抽屉控制 ==========
// 抽屉内部可见性状态：由 open 方法控制
const show = ref(false);

// ========== 查询参数 ==========
const query = ref({
  materialCode: '',
  materialName: '',
});

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50 },
    {
      field: 'materialCode',
      title: $t('materialSelect.materialCode'),
      minWidth: 140,
    },
    {
      field: 'materialName',
      title: $t('materialSelect.materialName'),
      minWidth: 180,
    },
  ],
  height: 400,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: ({ page }) => {
        const params = {
          ...query.value,
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        };
        return searchMaterialList(params).then((res: any) => ({
          items: res.results || [],
          total: res.total || 0,
        }));
      },
    },
  },
  radioConfig: {
    highlight: true,
    trigger: 'row',
  },
  rowConfig: { keyField: 'materialCode' },
  showOverflow: 'tooltip',
  stripe: true,
};

const [MaterialGrid, materialGridApi] = useVbenVxeGrid({ gridOptions });

// ========== open 方法 ==========
/**
 * 打开物料选择抽屉，并重置查询条件后加载物料列表。
 * @since 2026-08-31
 */
function open() {
  show.value = true;
  query.value = {
    materialCode: '',
    materialName: '',
  };
  materialGridApi.reload();
}

defineExpose({ open });

// ========== 查询 ==========
/**
 * 触发查询操作，刷新物料列表。
 * @since 2026-08-31
 */
function handleQuery() {
  materialGridApi.reload();
}

// ========== 重置 ==========
/**
 * 重置查询参数并刷新物料列表。
 * @since 2026-08-31
 */
function handleReset() {
  query.value = {
    materialCode: '',
    materialName: '',
  };
  materialGridApi.reload();
}

// ========== 关闭抽屉 ==========
/**
 * 关闭抽屉并清空查询条件，回到初始状态。
 * @since 2026-08-31
 */
function handleClose() {
  show.value = false;
  query.value = {
    materialCode: '',
    materialName: '',
  };
}

// ========== 确认选中 ==========
/**
 * 确认选中物料，触发 select 事件回传物料数据并关闭抽屉。
 * @since 2026-08-31
 */
function handleConfirm() {
  const selectedRow = materialGridApi.grid?.getRadioRecord();
  if (!selectedRow) {
    message.warning($t('materialSelect.plsSelect'));
    return;
  }
  emit('select', selectedRow);
  handleClose();
}
</script>

<template>
  <Drawer
    v-model:open="show"
    :title="$t('materialSelect.title')"
    width="700"
    :destroy-on-close="true"
    :footer-style="{ textAlign: 'right' }"
    @close="handleClose"
  >
    <!-- 查询区域 -->
    <Space class="!mb-4 flex-wrap">
      <FormItem
        :label="$t('materialSelect.materialCode')"
        class="!mb-0"
      >
        <Input
          v-model:value="query.materialCode"
          :placeholder="$t('materialSelect.materialCodePlaceholder')"
          allow-clear
          @press-enter="handleQuery"
        />
      </FormItem>
      <FormItem
        :label="$t('materialSelect.materialName')"
        class="!mb-0"
      >
        <Input
          v-model:value="query.materialName"
          :placeholder="$t('materialSelect.materialNamePlaceholder')"
          allow-clear
          @press-enter="handleQuery"
        />
      </FormItem>
      <Button type="primary" @click="handleQuery">
        {{ $t('common.query') }}
      </Button>
      <Button @click="handleReset">
        {{ $t('common.reset') }}
      </Button>
    </Space>

    <!-- 物料表格 -->
    <MaterialGrid>
      <!-- 必须保留：抽屉内使用 VxeTable 时所需插槽 -->
      <template #toolbar-tools></template>
    </MaterialGrid>

    <!-- 底部按钮 -->
    <template #footer>
      <Space>
        <Button @click="handleClose">
          {{ $t('common.cancel') }}
        </Button>
        <Button type="primary" @click="handleConfirm">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
