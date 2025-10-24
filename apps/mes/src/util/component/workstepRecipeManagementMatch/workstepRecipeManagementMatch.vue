<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';

import { Button, Drawer, Tooltip } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { matching } from '#/api';
import { $t } from '#/locales';
import WorkstepRecipeManagementMatchChilden from '#/util/component/workstepRecipeManagementMatch/workstepRecipeManagementMatchChilden.vue';

// region 表格

const gridOptions: VxeGridProps<any> = {
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'workstationCode', title: '工作站编号', minWidth: 150 },
    { field: 'workstationName', title: '工作站名称', minWidth: 150 },
    { field: 'processName', title: '工序名称', minWidth: 150 },
    { field: 'opTypeName', title: '工序操作类型名称', minWidth: 150 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 220,
    },
  ],
  data: [],
  pagerConfig: {
    enabled: false,
  },
  sortConfig: {
    multiple: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// endregion

// endregion 抽屉基本操作
// 抽屉是否显示
const visible = ref(false);
// 配方信息
const formulaMessage = ref<any>();

/**
 * 打开抽屉
 */
function openDrawer(row: any) {
  formulaMessage.value = {
    ...row,
  };
  matching({
    id: row.id,
  }).then((data) => {
    gridApi.grid.reloadData(data);
  });
  visible.value = true;
}

/**
 * 关闭抽屉
 */
function closeDrawer() {
  visible.value = false;
  gridApi.grid.reloadData([]);
}
// endregion

// region 打开子抽屉
const workstepRecipeManagementMatchChildenRef = ref();

function openChildDrawer(matchingMessage: any) {
  workstepRecipeManagementMatchChildenRef.value.open(
    formulaMessage.value,
    matchingMessage,
  );
}

// endregion

// region 暴露方法

// 暴露 open 方法，供父组件调用
defineExpose({
  open: openDrawer,
});

// endregion
</script>

<template>
  <Drawer
    v-model:open="visible"
    height="80%"
    placement="bottom"
    :title="$t('common.match')"
    @close="closeDrawer()"
  >
    <Grid>
      <template #action="{ row }">
        <!-- 绑定按钮 -->
        <Tooltip>
          <template #title>{{ $t('common.bind') }}</template>
          <Button type="link" @click="openChildDrawer(row)">
            <Icon
              icon="mdi:link-variant"
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </Tooltip>
      </template>
    </Grid>
  </Drawer>
  <WorkstepRecipeManagementMatchChilden
    ref="workstepRecipeManagementMatchChildenRef"
  />
</template>

<style scoped></style>
