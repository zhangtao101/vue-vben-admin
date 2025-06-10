<script setup lang="ts">
import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Drawer, Form, FormItem, Input } from 'ant-design-vue';

const isOpen = ref(false);

// region 编辑
const formState = ref<any>({});
// endregion

// region 暴露方法

const open = (_id: string) => {
  // console.log(id);
  isOpen.value = true;
  setTimeout(() => {
    // graphInit();
  }, 800);
};

defineExpose({
  open,
});

// endregion
</script>

<template>
  <!-- 签到 -->
  <Drawer
    v-model:open="isOpen"
    :footer-style="{ textAlign: 'right' }"
    height="100%"
    class="custom-class"
    placement="top"
    title="签到"
  >
    <Form :model="formState">
      <!-- 对象名称 -->
      <FormItem
        :label="$t('useEnergyThroughoutTheEntireSection.objectName')"
        style="margin-bottom: 1em"
      >
        <Input v-model:value="formState.processCode" />
      </FormItem>
    </Form>
  </Drawer>
</template>

<style scoped></style>
