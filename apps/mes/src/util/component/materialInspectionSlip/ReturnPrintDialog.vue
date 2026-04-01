<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { Button, Drawer, Table } from 'ant-design-vue';

import { returnPrintInspectionSlip } from '#/api';

const props = defineProps<{
  formIds: string[];
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

// 打印数据
const printData = ref<any>({
  printList: [],
  sendDate: '',
  manufacturerName: '',
  userName: '',
});

// 打印日期
const printDate = ref('');

// 表格列
const columns = [
  {
    title: $t('storeManagement.labelPrint.materialCode'),
    dataIndex: 'materialCode',
  },
  {
    title: $t('storeManagement.labelPrint.materialName'),
    dataIndex: 'materialName',
  },
  { title: $t('storeManagement.labelPrint.unit'), dataIndex: 'unit' },
  {
    title: $t('storeManagement.inspectionSlip.sendNumber'),
    dataIndex: 'sendNumber',
  },
  {
    title: $t('storeManagement.labelPrint.contractCode'),
    dataIndex: 'contractDetailCode',
  },
  {
    title: $t('storeManagement.inspectionSlip.checkRemark'),
    dataIndex: 'checkRemark',
  },
];

// 获取当前日期
function getCurrentDate() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 打印
function handlePrint() {
  window.print();
}

// 监听弹窗打开
watch(visible, (val) => {
  if (val && props.formIds.length > 0) {
    printDate.value = getCurrentDate();
    returnPrintInspectionSlip(props.formIds).then((res: any) => {
      printData.value = {
        printList: res.printList || [],
        sendDate: res.sendDate || '',
        manufacturerName: res.manufacturerName || '',
        userName: res.userName || '',
      };
    });
  }
});
</script>

<template>
  <Drawer
    v-model:open="visible"
    :title="$t('storeManagement.inspectionSlip.returnPrint')"
    :footer-style="{ textAlign: 'right' }"
    width="60%"
  >
    <div class="!mb-4">
      <Button type="primary" @click="visible = false">
        {{ $t('common.back') }}
      </Button>
      <Button type="primary" class="ml-2" @click="handlePrint">
        {{ $t('common.print') }}
      </Button>
    </div>

    <div class="p-4">
      <div
        class="text-center text-xl font-bold border-b border-gray-300 pb-2 mb-2"
      >
        嘉兴祺旺电子科技有限公司
      </div>
      <div
        class="text-center text-lg font-bold border-b border-gray-300 pb-2 !mb-4"
      >
        退货单
      </div>
      <div class="!mb-4">
        <span>供应厂商: {{ printData.manufacturerName }}</span>
        <span class="float-right">送检日期：{{ printData.sendDate }}</span>
      </div>
      <Table
        :columns="columns"
        :data-source="printData.printList"
        :pagination="false"
        row-key="id"
        bordered
      />
      <div class="!mt-4">
        <span>打印人：{{ printData.userName }}</span>
        <span class="ml-40">经手人：</span>
        <span class="float-right">打印日期：{{ printDate }}</span>
      </div>
    </div>
  </Drawer>
</template>

<style></style>
