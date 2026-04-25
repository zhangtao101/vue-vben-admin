<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、#/adapter/vxe-table、#/api（getInspectionSchemeById）、#/locales
 * [OUTPUT]: 对外提供 EquipCheckPlanItemDrawer 组件，用于查看点检计划关联的点检项列表
 * [POS]: 设备点检管理模块 的 点检计划点检项查看抽屉，被 EquipCheckPlanDrawer.vue 引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-25 10:17:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref, watch } from 'vue';

import { Drawer, Spin } from 'ant-design-vue';

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
/**
 * 加载点检方案关联的点检项列表。
 * @returns {void} 无返回值，成功后更新 schemeName 和表格数据。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
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
        ? `${$t('equipCheckPlan.viewItem')} - ${schemeName}`
        : $t('equipCheckPlan.viewItem')
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
