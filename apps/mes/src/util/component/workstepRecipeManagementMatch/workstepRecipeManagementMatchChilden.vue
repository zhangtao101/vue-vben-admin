<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { IconifyIcon } from '@vben/icons';

import { Button, Drawer, Tooltip } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { bindStepQuery } from '#/api';
import { $t } from '#/locales';

// region 表格

const gridOptions: VxeGridProps<any> = {
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'functionName', title: '工步名称', minWidth: 150 },
    { field: 'checkCycle', title: '检测周期（秒）', minWidth: 150 },
    { field: 'operatorType', title: '执行条件类型', minWidth: 150 },
    { field: 'operatorTypeName', title: '执行条件类型名称', minWidth: 150 },
    { field: 'stepType', title: '步骤类型', minWidth: 150 },
    { field: 'stepTypeName', title: '步骤类型名称', minWidth: 150 },
    { field: 'executeMode', title: '执行方式', minWidth: 150 },
    { field: 'executeModeName', title: '执行方式说明', minWidth: 150 },
    { field: 'executeDelay', title: '延时执行（秒）', minWidth: 150 },
    { field: 'hasAlert', title: '是否包含告警推送', minWidth: 150 },
    { field: 'stepFunctionId', title: '跳转工步ID', minWidth: 150 },
    { field: 'stepFunctionName', title: '跳转工步名称', minWidth: 150 },
    { field: 'isUse', title: '启停用', minWidth: 150 },
    { field: 'auditResult', title: '审核结果', minWidth: 150 },
    { field: 'auditResultName', title: '审核结果说明', minWidth: 150 },
    { field: 'auditTime', title: '审核时间', minWidth: 150 },
    { field: 'auditUser', title: '审核人', minWidth: 150 },
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
const gridEvents: any = {
  rowDragend: () => {
    // { newRow, oldRow, dragPos }: any
    // console.log(
    //   `拖拽完成，被拖拽行：${oldRow.name} 目标行：${newRow.name} 目标位置：${dragPos}`,
    // );
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions, gridEvents });

// endregion

// endregion 抽屉基本操作
// 抽屉是否显示
const visible = ref(false);

/**
 * 打开抽屉
 */
function openDrawer(formulaMessage: any, _matchingMessage: any) {
  bindStepQuery({
    equipCode: formulaMessage.equipCode,
    processCode: formulaMessage.processCode,
    functionType: formulaMessage.opType,
    workstationCode: formulaMessage.workstationCode,
    equipTypeCode: formulaMessage.formulaCode,
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
        <!-- 编辑按钮 -->
        <Tooltip>
          <template #title>{{ $t('common.bind') }}</template>
          <Button type="link" @click="editRow(row)">
            <IconifyIcon
              icon="mdi:link-variant"
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </Tooltip>
      </template>
    </Grid>
  </Drawer>
</template>

<style scoped></style>
