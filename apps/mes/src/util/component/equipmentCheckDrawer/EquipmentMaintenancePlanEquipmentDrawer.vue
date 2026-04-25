<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、#/adapter/vxe-table、#/api（getMaintenanceSchemeById、queryScadaEquipLedgerByCode）、#/locales
 * [OUTPUT]: 对外提供 EquipmentMaintenancePlanEquipmentDrawer 组件，用于查看保养计划绑定的设备列表
 * [POS]: 设备点检管理模块 的 保养计划绑定设备查看抽屉，被 EquipmentMaintenancePlanDrawer.vue 引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-25 10:17:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref, watch } from 'vue';

import { Drawer, Spin } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getMaintenanceSchemeById,
  queryScadaEquipLedgerByCode,
} from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'EquipmentMaintenancePlanEquipmentDrawer',
});

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  schemeId: '',
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

interface Props {
  visible?: boolean;
  schemeId?: number | string;
}

// ========== 抽屉控制 ==========
// 抽屉内部可见性状态：与 props.visible 双向绑定
const drawerVisible = ref(props.visible);
// 加载状态：控制表格区域的 Spin 显示
const loading = ref(false);
// 方案名称：用于抽屉标题显示
const schemeName = ref('');

watch(
  () => props.visible,
  (val) => {
    drawerVisible.value = val;
    if (val) {
      loadData();
    }
  },
);

watch(drawerVisible, (val) => {
  emit('update:visible', val);
});

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    {
      field: 'equipmentCode',
      title: $t(
        'equipmentMaintenancePlan.bindEquipmentDrawer.equipmentCode',
      ),
      minWidth: 140,
    },
    {
      field: 'equipmentName',
      title: $t(
        'equipmentMaintenancePlan.bindEquipmentDrawer.equipmentName',
      ),
      minWidth: 160,
    },
    {
      field: 'equipGroupName',
      title: $t('equipmentMaintenancePlan.bindEquipmentDrawer.equipGroupName'),
      minWidth: 120,
    },
    {
      field: 'location',
      title: $t('equipmentMaintenancePlan.bindEquipmentDrawer.location'),
      minWidth: 140,
    },
  ],
  pagerConfig: {
    enabled: false,
  },
  height: 400,
  data: [],
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// ========== 加载数据 ==========
/**
 * 加载保养方案绑定的设备列表。根据方案ID获取设备编码列表，再逐个查询设备详情并渲染表格。
 * @returns {void} 无返回值，成功后更新 schemeName 和表格数据。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function loadData() {
  if (!props.schemeId) return;
  loading.value = true;
  getMaintenanceSchemeById(Number(props.schemeId))
    .then((res: any) => {
      schemeName.value = res?.schemeName || '';
      // 从 equipmentCodes 解析设备列表并查询详情
      const equipmentCodes = res?.equipmentCodes || '';
      const codes = equipmentCodes.split(',').filter(Boolean);
      if (codes.length > 0) {
        Promise.all(
          codes.map((code: string) => queryScadaEquipLedgerByCode(code)),
        ).then((results: any[]) => {
          const tableData = results
            .filter(Boolean)
            .map((r: any, index: number) => ({
              equipmentCode: r.equipmentCode,
              equipmentName: r.equipmentName,
              equipGroupName: r.equipGroupName,
              location: r.location || '-',
              _index: index + 1,
            }));
          gridApi.grid.reloadData(tableData);
        });
      } else {
        gridApi.grid.reloadData([]);
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

// ========== 关闭 ==========
/**
 * 关闭抽屉，通过 emit 触发父组件更新 visible 状态。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function handleClose() {
  drawerVisible.value = false;
}
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :title="
      schemeName
        ? `${$t('equipmentMaintenancePlan.bindEquipment')} - ${schemeName}`
        : $t('equipmentMaintenancePlan.bindEquipment')
    "
    width="800"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <Spin :spinning="loading" class="h-full">
      <Grid />
    </Spin>
  </Drawer>
</template>
