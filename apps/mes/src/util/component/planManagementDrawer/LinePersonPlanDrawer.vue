<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue (Drawer/Button)
 * [OUTPUT]: 对外提供 LinePersonPlanDrawer 抽屉组件，通过 defineExpose({ open }) 暴露 open 方法供父组件调用
 * [POS]: 属于 planManagement 包装工单管理页面的「各产线人员计划登录」抽屉子组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-09-24 10:00:00
 */
import { ref } from 'vue';

import { Button, Drawer } from 'ant-design-vue';

defineOptions({ name: 'LinePersonPlanDrawer' });

defineEmits<{
  refresh: [];
}>();

// region 状态管理
/** 抽屉显示状态 */
const show = ref(false);
/** 父级传入的已勾选工单行 */
const selectedRows = ref<any[]>([]);
// endregion

/**
 * 打开抽屉并接收父级传入的数据
 * @param {any[]} rows 父级表格已勾选的工单行数据
 * @since 2026-09-24
 */
function open(rows: any[] = []) {
  selectedRows.value = rows;
  show.value = true;
}

/**
 * 关闭抽屉
 * @since 2026-09-24
 */
function handleClose() {
  show.value = false;
}

defineExpose({ open });
// endregion
</script>

<template>
  <Drawer
    v-model:open="show"
    :footer-style="{ textAlign: 'right' }"
    :destroy-on-close="true"
    title="各产线人员计划登录"
    width="80%"
    @close="handleClose"
  >
    <!-- TODO: 各产线人员计划登录表单内容待补充 -->
    <div class="text-gray-500">功能待补充，已接收 {{ selectedRows.length }} 条工单数据</div>

    <template #footer>
      <Button @click="handleClose">关闭</Button>
    </template>
  </Drawer>
</template>
