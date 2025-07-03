<script setup lang="ts">
import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Drawer } from 'ant-design-vue';

const showDrawer = ref(false);

const editItem = ref<any>({});

/**
 * 显示抽屉
 * @param row
 */
function show(row: any) {
  editItem.value = row;
  showDrawer.value = true;
}

/**
 * 关闭抽屉
 */
function close() {
  showDrawer.value = false;
  editItem.value = {};
}

// region 暴露方法，供父组件调用
defineExpose({
  show,
});
// endregion
</script>

<template>
  <Drawer
    v-model:open="showDrawer"
    :footer-style="{ textAlign: 'right' }"
    height="80%"
    placement="top"
    :title="$t('dispatchHomework.resourceAssignment')"
    @close="close"
  >
    123
  </Drawer>
</template>

<style scoped></style>
