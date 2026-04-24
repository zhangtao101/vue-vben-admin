<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref, watch } from 'vue';

import { Drawer } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getInspectionSchemeById } from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'EquipCheckPlanItemDrawer',
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
      title: $t('equipmentSpotCheckScheme.checkItemCode'),
      minWidth: 120,
    },
    {
      field: 'itemName',
      title: $t('equipmentSpotCheckScheme.checkItemName'),
      minWidth: 150,
    },
    {
      field: 'itemStandard',
      title: $t('equipmentSpotCheckScheme.itemStandard'),
      minWidth: 180,
    },
    {
      field: 'itemRequirement',
      title: $t('equipmentSpotCheckScheme.itemRequirement'),
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
  getInspectionSchemeById(Number(props.schemeId))
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
        ? `${$t('equipCheckPlan.viewItem')} - ${schemeName}`
        : $t('equipCheckPlan.viewItem')
    "
    width="800"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div v-if="loading" class="flex items-center justify-center p-8">
      <span>加载中...</span>
    </div>
    <Grid v-else />
  </Drawer>
</template>
