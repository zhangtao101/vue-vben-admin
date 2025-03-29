<script setup lang="ts">
import { ref } from 'vue';

import EquipmentCleaning from '#/util/component/steps/equipmentCleaning.vue';
import EquipmentOperationStatus from '#/util/component/steps/equipmentOperationStatus.vue';

const status = ref(2);
</script>

<template>
  <!-- 设备清洗 -->
  <EquipmentCleaning v-if="status === 1" />
  <!-- 设备运行状态 -->
  <EquipmentOperationStatus v-if="status === 2" />
</template>

<style scoped></style>
