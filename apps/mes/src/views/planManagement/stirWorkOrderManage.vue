<script lang="ts" setup>
/**
 * [INPUT]: 依赖 #/util/component/planManagementDrawer (WorkSheetManage)
 * [OUTPUT]: 对外提供 stirWorkOrderManage 页面组件，以单别 2（搅拌工单）渲染工单管理公共组件
 * [POS]: 属于计划管理(planManagement)模块的搅拌工单管理主页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-09-29 00:00:00
 */
import WorkSheetManage from '../../util/component/planManagementDrawer/WorkSheetManage.vue';

/** 单别：搅拌工单 */
const PROCESS_TYPE = 2;
</script>

<template>
  <WorkSheetManage :process-type="PROCESS_TYPE" />
</template>
