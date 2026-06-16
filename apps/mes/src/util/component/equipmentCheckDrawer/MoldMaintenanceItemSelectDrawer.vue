<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue、#/adapter/vxe-table、#/api（getRepairBasicConfigList）、#/locales
 * [OUTPUT]: 对外提供 MoldMaintenanceItemSelectDrawer 组件，用于选择模具保养项（支持多选）
 * [POS]: 设备点检管理模块 的 模具保养项选择抽屉，被 MoldMaintenanceSchemeDrawer.vue 引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-06-16 09:25:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref, watch } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import { Button, Drawer, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getRepairBasicConfigList } from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'MoldMaintenanceItemSelectDrawer',
});

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  selectedRows: () => [],
});

const emit = defineEmits<{
  select: [items: any[]];
  'update:visible': [value: boolean];
}>();

/** Props 定义：visible(抽屉可见性)、selectedRows(已选项列表, 含 itemCode) */
interface Props {
  visible?: boolean;
  selectedRows?: any[];
}

// ========== 抽屉控制 ==========
/** 抽屉内部可见性状态：与 props.visible 双向绑定 */
const drawerVisible = ref(props.visible);

/** 已选中的 itemCode 列表，用于表格加载后恢复选中状态 */
const selectedCodes = ref<string[]>([]);

/** 监听 props.visible 变更，打开时同步已选 itemCode 列表并加载数据 */
watch(
  () => props.visible,
  (val) => {
    drawerVisible.value = val;
    if (val) {
      // 清空选中状态
      const grid = gridApi.grid as any;
      if (grid?.clearCheckboxRow) {
        grid.clearCheckboxRow();
      }
      // 保存已选的 itemCode 列表
      selectedCodes.value = (props.selectedRows || [])
        .map((row: any) => row.itemCode)
        .filter((code: any): code is string => !!code);
      // 加载数据
      gridApi.reload();
    }
  },
);

/** 监听本地抽屉可见性变更，向外 emit update:visible 事件 */
watch(drawerVisible, (val) => {
  emit('update:visible', val);
});

// ========== 表格配置 ==========
/** VXE Grid 表格配置：复选框多选、序号、保养项编码/名称/要求/标准列 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 60 },
    { type: 'seq', width: 60, title: '序号' },
    {
      field: 'configCode',
      title: $t('moldMaintenanceScheme.itemDrawer.itemCode'),
      minWidth: 120,
    },
    {
      field: 'configName',
      title: $t('moldMaintenanceScheme.itemDrawer.itemName'),
      minWidth: 150,
    },
    {
      field: 'itemRequirement',
      title: $t('moldMaintenanceScheme.itemDrawer.itemRequirement'),
      minWidth: 150,
    },
    {
      field: 'itemStandard',
      title: $t('moldMaintenanceScheme.itemDrawer.itemStandard'),
      minWidth: 150,
    },
  ],
  height: 400,
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryData();
      },
    },
  },
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
  },
};

/** Grid 表格组件与 API 实例，gridApi 用于 reload/getCheckboxRecords 等操作 */
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents: {}, gridOptions });

// ========== 数据查询 ==========
/**
 * 查询模具保养项列表（仅 ACTIVE 状态）。
 * 调用 getRepairBasicConfigList API，固定 configType=MOLD_MAINTENANCE_ITEM、status=ACTIVE。
 * @returns {Promise<{total: number, items: any[]}>} 包含总数和过滤后数据列表的 Promise。
 * @since 2026-06-16 09:05:00
 */
function queryData() {
  return new Promise((resolve) => {
    getRepairBasicConfigList({
      configType: 'MOLD_MAINTENANCE_ITEM',
      status: 'ACTIVE',
    })
      .then((data: any) => {
        const allItems = data?.items || data || [];
        resolve({
          total: allItems.length,
          items: allItems,
        });
        // 数据加载完成后恢复选中状态
        setTimeout(() => {
          restoreCheckboxSelection();
        }, 100);
      })
      .catch(() => {
        resolve({ total: 0, items: [] });
      });
  });
}

// ========== 恢复选中状态 ==========
/**
 * 表格数据加载完成后，根据 selectedCodes 恢复复选框选中状态。
 * @returns {void} 无返回值。
 * @since 2026-06-16 09:05:00
 */
function restoreCheckboxSelection() {
  if (selectedCodes.value.length === 0) return;
  const grid = gridApi.grid as any;
  if (!grid) return;
  const tableData = grid.getData();
  tableData.forEach((row: any) => {
    if (row.configCode && selectedCodes.value.includes(row.configCode)) {
      grid.setCheckboxRow(row, true);
    }
  });
}

// ========== 确认选择 ==========
/**
 * 确认选择，将选中的保养项通过 emit 传递给父组件并关闭抽屉。
 * @returns {void} 无返回值。
 * @since 2026-06-16 09:05:00
 */
function handleConfirm() {
  const selectedRecords = gridApi.grid.getCheckboxRecords();
  emit('select', selectedRecords);
  handleClose();
}

// ========== 关闭抽屉 ==========
/** 关闭抽屉 */
function handleClose() {
  drawerVisible.value = false;
  emit('update:visible', false);
}
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :title="$t('moldMaintenanceScheme.itemDrawer.selectTitle')"
    width="800"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <!-- 表格区域 -->
    <div>
      <Grid />
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <Space class="drawer-footer">
        <Button @click="handleClose">{{ $t('common.cancel') }}</Button>
        <Button type="primary" @click="handleConfirm">
          <Icon icon="mdi:check" class="inline-block align-middle" />
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped>
.drawer-footer {
  justify-content: flex-end;
  width: 100%;
}
</style>
