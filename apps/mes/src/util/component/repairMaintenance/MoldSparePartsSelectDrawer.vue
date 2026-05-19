<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、vxe-table、sparePartsManagement.service、equipGroup.service API
 * [OUTPUT]: 对外提供模具配件选择抽屉组件，含配件列表查询、多选功能
 * [POS]: 模具管理模块 的模具配件选择抽屉
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-19 13:34:00
 */

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { SparePart } from '#/api/equipManagement/sparePartsManagement.service';

import { ref, watch } from 'vue';

import { Button, Drawer, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getGroupByEquipCode } from '#/api/equipManagement/equipGroup.service';
import { getSparePartList } from '#/api/equipManagement/sparePartsManagement.service';
import { $t } from '#/locales';

// Props
const props = defineProps<{
  moldCode?: string;
  selectedRows?: SparePart[];
  visible: boolean;
}>();

// Emits
const emit = defineEmits<{
  confirm: [data: SparePart[]];
  'update:visible': [value: boolean];
}>();

// 设备群组
const equipmentGroup = ref<string | undefined>(undefined);
const selectedRecords = ref<SparePart[]>([]);

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns: [
    { type: 'checkbox', width: 50 },
    { field: 'spareCode', title: $t('repair.sparePart.spareCode'), width: 120 },
    {
      field: 'spareName',
      title: $t('repair.sparePart.spareName'),
      minWidth: 180,
    },
    {
      field: 'spareModel',
      title: $t('repair.sparePart.spareModel'),
      minWidth: 150,
    },
    { field: 'unit', title: $t('repair.sparePart.unit'), width: 80 },
    {
      field: 'currentStock',
      title: $t('repair.sparePart.currentStock'),
      width: 100,
    },
  ],
  height: 450,
  pagerConfig: {
    enabled: true,
    pageSize: 50,
    pageSizes: [50, 100, 200],
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryData();
      },
    },
  },
  rowConfig: {
    keyField: 'id',
  },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/**
 * 查询配件数据列表。
 * @returns {Promise<{items: any[]; total: number}>} 配件列表数据
 * @throws 请求失败时拒绝 Promise
 * @since 2026-05-19 13:34:00
 */
function queryData() {
  return new Promise((resolve, reject) => {
    getSparePartList({ equipmentGroup: equipmentGroup.value, status: 'NORMAL' })
      .then((data) => {
        resolve({ items: data || [], total: (data as any[])?.length || 0 });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 初始化配件选择数据，根据模具编码获取设备群组并加载配件列表。
 * @returns {void} 无返回值
 * @since 2026-05-19 13:34:00
 */
function initData() {
  selectedRecords.value = props.selectedRows ? [...props.selectedRows] : [];
  if (props.moldCode) {
    // 使用 moldCode 获取设备群组
    getGroupByEquipCode(props.moldCode)
      .then((groupData) => {
        equipmentGroup.value = groupData?.configCode;
        gridApi.reload();
      })
      .catch(() => {
        equipmentGroup.value = undefined;
        gridApi.reload();
      });
  } else {
    equipmentGroup.value = undefined;
    gridApi.reload();
  }
}

/**
 * 监听抽屉可见性变化，打开时初始化数据。
 * @returns {void} 无返回值
 * @since 2026-05-19 13:34:00
 */
watch(
  () => props.visible,
  (val) => {
    if (val) {
      initData();
    }
  },
);

/**
 * 关闭配件选择抽屉。
 * @returns {void} 无返回值
 * @since 2026-05-19 13:34:00
 */
function handleClose() {
  emit('update:visible', false);
}

/**
 * 确认选择配件，触发 confirm 事件并关闭抽屉。
 * @returns {void} 无返回值
 * @since 2026-05-19 13:34:00
 */
function handleConfirm() {
  const records = gridApi.grid?.getCheckboxRecords() || [];
  emit('confirm', records);
  handleClose();
}
</script>

<template>
  <Drawer
    :open="visible"
    :title="$t('repair.sparePartsSelect.title')"
    :width="800"
    @close="handleClose"
  >
    <Grid />

    <template #footer>
      <Space style="float: right">
        <Button type="primary" @click="handleConfirm">
          {{ $t('repair.sparePartsSelect.confirm') }}
        </Button>
        <Button @click="handleClose">
          {{ $t('repair.sparePartsSelect.cancel') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
