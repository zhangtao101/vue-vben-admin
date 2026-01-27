<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { workstationGetSetRecordFlag } from '#/api';
import ProductionOperationModalOne from '#/util/component/productionOperationModalOne.vue';
import ProductionOperationModalTwo from '#/util/component/productionOperationModalTwo.vue';

const details = ref<any>({});
function query() {
  workstationGetSetRecordFlag().then((data) => {
    details.value = data;
  });
}

onMounted(() => {
  query();
});
</script>

<template>
  <Page>
    <ProductionOperationModalOne v-if="details.pointType === 1" />
    <ProductionOperationModalTwo
      v-if="details.pointType === 2"
      :details="details"
    />
  </Page>
</template>

<style scoped lang="scss"></style>
