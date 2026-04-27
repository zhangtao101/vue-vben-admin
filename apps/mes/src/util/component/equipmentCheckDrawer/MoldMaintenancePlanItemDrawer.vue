<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、#/adapter/vxe-table、#/api（getMoldMaintenanceSchemeById）、#/locales
 * [OUTPUT]: 对外提供 MoldMaintenancePlanItemDrawer 组件，用于查看保养计划关联的保养项列表
 * [POS]: 设备点检管理模块 的 保养计划保养项查看抽屉，被 MoldMaintenancePlanDrawer.vue 引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-25 11:17:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref, watch } from 'vue';

import { Drawer, Spin } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getMoldMaintenanceSchemeById } from '#/api/equipManagement/moldMaintenanceScheme.service';
import { $t } from '#/locales';

defineOptions({
  name: 'MoldMaintenancePlanItemDrawer',
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
const drawerVisible = ref(props.visible);
const loading = ref(false);
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
      field: 'itemCode',
      title: $t('moldMaintenancePlan.maintenanceItemDrawer.itemCode'),
      minWidth: 120,
    },
    {
      field: 'itemName',
      title: $t('moldMaintenancePlan.maintenanceItemDrawer.itemName'),
      minWidth: 150,
    },
    {
      field: 'itemStandard',
      title: $t('moldMaintenancePlan.maintenanceItemDrawer.itemStandard'),
      minWidth: 180,
    },
    {
      field: 'itemRequirement',
      title: $t('moldMaintenancePlan.maintenanceItemDrawer.itemRequirement'),
      minWidth: 150,
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
function loadData() {
  if (!props.schemeId) return;
  loading.value = true;
  getMoldMaintenanceSchemeById(Number(props.schemeId))
    .then((res: any) => {
      schemeName.value = res?.schemeName || '';
      setTimeout(() => {
        gridApi.grid.reloadData(res?.details || []);
      }, 100);
    })
    .finally(() => {
      loading.value = false;
    });
}

// ========== 关闭 ==========
function handleClose() {
  drawerVisible.value = false;
}
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :title="
      schemeName
        ? `${$t('moldMaintenancePlan.maintenanceItem')} - ${schemeName}`
        : $t('moldMaintenancePlan.maintenanceItem')
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
