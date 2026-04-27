<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、#/adapter/vxe-table、#/api（getMoldMaintenanceSchemeById）、#/locales
 * [OUTPUT]: 对外提供 MoldMaintenancePlanMoldDrawer 组件，用于查看保养计划绑定的模具列表
 * [POS]: 设备点检管理模块 的 保养计划绑定模具查看抽屉，被 MoldMaintenancePlanDrawer.vue 引用
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
  name: 'MoldMaintenancePlanMoldDrawer',
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
      field: 'moldCode',
      title: $t('moldMaintenancePlan.moldDrawer.moldCode'),
      minWidth: 140,
    },
    {
      field: 'moldName',
      title: $t('moldMaintenancePlan.moldDrawer.moldName'),
      minWidth: 160,
    },
    {
      field: 'moldCategoryName',
      title: $t('moldMaintenancePlan.moldDrawer.moldCategoryName'),
      minWidth: 120,
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
      const moldCodes = res?.moldCodes || '';
      const codes = moldCodes.split(',').filter(Boolean);
      // 模拟模具列表数据
      const tableData = codes.map((code: string, index: number) => ({
        moldCode: code,
        moldName: code.replace('MOLD-', '模具-'),
        moldCategoryName: res?.moldCategoryName || '-',
        _index: index + 1,
      }));
      gridApi.grid.reloadData(tableData);
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
        ? `${$t('moldMaintenancePlan.bindMold')} - ${schemeName}`
        : $t('moldMaintenancePlan.bindMold')
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
