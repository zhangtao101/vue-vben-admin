<script setup lang="ts">
import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Button, FormItem, Select } from 'ant-design-vue';

const props = defineProps({
  parent: {
    type: Object,
    required: true,
  },
  equipmentOptions: {
    type: Array<any>,
    required: true,
  },
  equipmentChange: {
    type: Function,
    required: true,
  },
  addAMeter: {
    type: Function,
    required: true,
  },
  removeFun: {
    type: Function,
    required: true,
  },
});

const rule = ref<any>({
  required: true,
  trigger: 'change',
  validator: (_rule: any, _value: any) => {
    return props.parent.equipmentCode
      ? Promise.resolve()
      : Promise.reject(new Error('请选择电表编号76543'));
  },
});
</script>

<template>
  <template v-if="parent">
    <!-- 电表编号 -->
    <FormItem
      :label="$t('unitAreaManagement.meterNumber')"
      name="equipmentCode"
      :class="`pl-${4 * (parent.level - 1 || 0)}`"
      :rules="rule"
    >
      <Select
        :value="parent.equipmentCode"
        :options="equipmentOptions"
        @change="(val, i) => equipmentChange(parent)(val, i)"
        class="w-full"
      />
      <Button
        @click="addAMeter(parent)"
        v-if="parent.level < 3"
        class="mr-4 mt-4"
      >
        {{ $t('unitAreaManagement.addSublevel') }}
      </Button>
      <Button
        danger
        @click="removeFun('key', parent.key)"
        class="mr-4 mt-4"
        v-if="parent.level > 1"
      >
        {{ $t('common.delete') }}
      </Button>
    </FormItem>
    <MeterSelection
      v-for="(item, index) in parent.child"
      :key="index"
      :parent="item"
      :equipment-options="equipmentOptions"
      :equipment-change="equipmentChange"
      :add-a-meter="addAMeter"
      :remove-fun="removeFun"
    />
  </template>
</template>

<style scoped></style>
