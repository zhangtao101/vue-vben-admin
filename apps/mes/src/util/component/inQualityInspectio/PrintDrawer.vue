<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { Button, Drawer, Space, Table } from 'ant-design-vue';

import { printQualityInspection } from '#/api';

const props = defineProps<{
  ids: string[];
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
const printData = ref<any[]>([]);

// 打印人
const printUser = ref('');

// 打印日期
const printDate = ref('');

// 表格列
const columns = [
  {
    title: $t('storeManagement.labelPrint.manufacturerName'),
    dataIndex: 'manufacturerName',
    width: '15%',
  },
  {
    title: $t('storeManagement.labelPrint.materialCode'),
    dataIndex: 'materialCode',
    width: '15%',
  },
  {
    title: $t('storeManagement.labelPrint.materialName'),
    dataIndex: 'materialName',
    width: '20%',
  },
  {
    title: $t('storeManagement.inspectionSlip.sendNumber'),
    dataIndex: 'sendNumber',
    width: '10%',
  },
  {
    title: $t('storeManagement.inspectionSlip.materialDescription'),
    dataIndex: 'materialDescription',
    width: '15%',
  },
  {
    title: $t('storeManagement.inspectionSlip.checkResult'),
    dataIndex: 'checkResultText',
    width: '15%',
  },
];

// 打印
function handlePrint() {
  window.print();
}

// 获取质检结论文本
function getCheckResultText(result: number) {
  const resultMap: Record<number, string> = {
    1: $t('storeManagement.inspectionSlip.qualified'),
    2: $t('storeManagement.inspectionSlip.unqualified'),
    3: $t('storeManagement.inspectionSlip.concessionAccept'),
    4: $t('storeManagement.inspectionSlip.emergencyRelease'),
  };
  return resultMap[result] || '';
}

// 监听弹窗打开
watch(visible, (val) => {
  if (val && props.ids.length > 0) {
    // 设置打印日期
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    printDate.value = `${year}年${month}月${day}日`;

    // 获取打印数据
    printQualityInspection(props.ids).then((res: any) => {
      printData.value = (res.results || []).map((item: any) => ({
        ...item,
        checkResultText: getCheckResultText(item.checkResult),
      }));
    });
  }
});
</script>

<template>
  <Drawer
    v-model:open="visible"
    :title="$t('common.print')"
    :footer-style="{ textAlign: 'right' }"
    width="60%"
  >
    <div class="print-actions mb-4 no-print">
      <Button type="primary" @click="visible = false">
        {{ $t('common.back') }}
      </Button>
      <Button type="primary" class="ml-2" @click="handlePrint">
        {{ $t('common.print') }}
      </Button>
    </div>

    <div id="printArea" class="print-content">
      <div class="print-header">
        <div class="company-name">浙江正原科技有限公司</div>
        <div class="print-title">材料入库检验通知单</div>
      </div>

      <Table
        :columns="columns"
        :data-source="printData"
        :pagination="false"
        bordered
        size="small"
      />

      <div class="print-footer">
        <div class="footer-item">
          {{ $t('storeManagement.inspectionSlip.printUser') }}：{{ printUser }}
        </div>
        <div class="footer-item">
          {{ $t('storeManagement.inspectionSlip.handler') }}：
        </div>
        <div class="footer-item">
          {{ $t('storeManagement.inspectionSlip.printDate') }}：{{ printDate }}
        </div>
      </div>
    </div>

    <template #footer>
      <Space>
        <Button @click="visible = false">{{ $t('common.close') }}</Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }

  :deep(.ant-drawer-content) {
    overflow: visible !important;
  }
}

.print-content {
  padding: 20px;
}

.print-header {
  text-align: center;
  margin-bottom: 20px;
}

.company-name {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #333;
}

.print-title {
  font-size: 18px;
  margin-top: 8px;
}

.print-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 10px;
}

.footer-item {
  width: 30%;
}
</style>
