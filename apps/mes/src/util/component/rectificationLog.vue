<script setup lang="ts">
import { TabPane, Tabs } from 'ant-design-vue';

import { $t } from '#/locales';
import RectificationLogDetails from '#/util/component/rectificationLog-details.vue';

defineProps({
  logs: {
    type: Array<any>,
    default: () => [],
  },
});
</script>

<template>
  <Tabs>
    <TabPane
      v-for="(item, index) of logs"
      :key="index"
      :tab="`${item.rectificationDeadline || $t('hiddenDangerRectification.notRectified')}~${item.acceptanceTime || $t('hiddenDangerRectification.notAccepted')}`"
    >
      <RectificationLogDetails :details="item" />
    </TabPane>
  </Tabs>
</template>

<style scoped></style>
