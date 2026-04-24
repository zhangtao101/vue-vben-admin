<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref, watch } from 'vue';

import { Drawer, Spin } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getInspectionSchemeById, queryScadaEquipLedgerByCode } from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'EquipCheckPlanEquipmentDrawer',
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
      field: 'equipmentCode',
      title: $t('equipmentSpotCheckScheme.equipmentSelectDrawer.equipmentCode'),
      minWidth: 140,
    },
    {
      field: 'equipmentName',
      title: $t('equipmentSpotCheckScheme.equipmentSelectDrawer.equipmentName'),
      minWidth: 160,
    },
    {
      field: 'equipGroupName',
      title: $t(
        'equipmentSpotCheckScheme.equipmentSelectDrawer.equipGroupName',
      ),
      minWidth: 120,
    },
    {
      field: 'location',
      title: $t('equipmentSpotCheckScheme.equipmentSelectDrawer.location'),
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
function loadData() {
  if (!props.schemeId) return;
  loading.value = true;
  getInspectionSchemeById(Number(props.schemeId))
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
function handleClose() {
  drawerVisible.value = false;
}
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :title="
      schemeName
        ? `${$t('equipCheckPlan.viewEquipment')} - ${schemeName}`
        : $t('equipCheckPlan.viewEquipment')
    "
    width="800"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <Spin :spinning="loading">
      <Grid />
    </Spin>
  </Drawer>
</template>
