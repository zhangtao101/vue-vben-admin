<script lang="ts" setup>
/**
 * 标签明细抽屉组件
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref, watch } from 'vue';
import { hiprint } from 'vue-plugin-hiprint';

import { $t } from '@vben/locales';

import {
  Button,
  Drawer,
  message,
  Modal,
  Radio,
  RadioGroup,
  Space,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteLabelDetail,
  enterWarehouse,
  fetchLabelRecordDetail,
  fetchLabelTemplate,
  judgeReturn,
  printLabel,
  queryPrintTemplateDetails,
} from '#/api';

// Props
const props = defineProps<{
  open: boolean;
  recordId: null | string;
}>();

// Emits
const emit = defineEmits<{
  refresh: [];
  'update:open': [value: boolean];
}>();

// 状态映射
const statusMap: Record<number, string> = {
  1: $t('storeManagement.labelPrint.pendingInspection'),
  2: $t('storeManagement.labelPrint.pendingWarehouse'),
  3: $t('storeManagement.labelPrint.warehoused'),
  4: $t('storeManagement.labelPrint.outOfStock'),
  5: $t('storeManagement.labelPrint.pendingReturn'),
  6: $t('storeManagement.labelPrint.returned'),
  7: $t('storeManagement.labelPrint.inTransfer'),
  8: $t('storeManagement.labelPrint.pendingReturnWarehouse'),
};

const statusColorMap: Record<number, string> = {
  1: 'orange',
  2: 'blue',
  3: 'green',
  4: 'cyan',
  5: 'red',
  6: 'default',
  7: 'purple',
  8: 'magenta',
};

// 表格列配置
const gridColumns: any[] = [
  { type: 'checkbox', width: 55 },
  {
    field: 'printTimes',
    title: $t('storeManagement.labelPrint.printTimes'),
    width: 80,
  },
  {
    field: 'status',
    title: $t('storeManagement.labelPrint.status'),
    width: 80,
    slots: { default: 'status' },
  },
  {
    field: 'createDate',
    title: $t('storeManagement.labelPrint.createDate'),
    width: 100,
    slots: { default: 'createDate' },
  },
  {
    field: 'labelCode',
    title: $t('storeManagement.labelPrint.labelCode'),
    width: 180,
  },
  {
    field: 'materialCode',
    title: $t('storeManagement.labelPrint.materialCode'),
    width: 120,
  },
  {
    field: 'materialName',
    title: $t('storeManagement.labelPrint.materialName'),
    width: 200,
    showOverflow: 'tooltip',
  },
  { field: 'unit', title: $t('storeManagement.labelPrint.unit'), width: 80 },
  {
    field: 'labelNumber',
    title: $t('storeManagement.labelPrint.labelNumber'),
    width: 80,
  },
  {
    field: 'packageNumber',
    title: $t('storeManagement.labelPrint.packageNumber'),
    width: 80,
  },
  {
    field: 'toEnterNumber',
    title: $t('storeManagement.labelPrint.toEnterNumber'),
    width: 80,
  },
  {
    field: 'toRejectNumber',
    title: $t('storeManagement.labelPrint.toRejectNumber'),
    width: 80,
  },
  {
    field: 'enterWarehouseNumber',
    title: $t('storeManagement.labelPrint.enterWarehouseNumber'),
    width: 80,
  },
  {
    field: 'rejectNumber',
    title: $t('storeManagement.labelPrint.rejectNumber'),
    width: 80,
  },
  {
    field: 'purchasePlanCode',
    title: $t('storeManagement.labelPrint.purchasePlanCode'),
    width: 120,
  },
  {
    field: 'contractCode',
    title: $t('storeManagement.labelPrint.contractCode'),
    width: 120,
  },
  {
    field: 'formType',
    title: $t('storeManagement.labelPrint.formType'),
    width: 100,
  },
  {
    field: 'manufacturerName',
    title: $t('storeManagement.labelPrint.manufacturerName'),
    width: 150,
    showOverflow: 'tooltip',
  },
  {
    field: 'produceDate',
    title: $t('storeManagement.labelPrint.produceDate'),
    width: 100,
    slots: { default: 'produceDate' },
  },
  {
    field: 'validDate',
    title: $t('storeManagement.labelPrint.validDate'),
    width: 100,
    slots: { default: 'validDate' },
  },
  {
    field: 'batchCode',
    title: $t('storeManagement.labelPrint.batchCode'),
    width: 180,
  },
];

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns: gridColumns,
  height: 400,
  showOverflow: 'tooltip',
  stripe: true,
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// 打印模板选项（值为模板名称，展示国际化）
const printTemplates = [
  {
    label: $t('storeManagement.labelPrint.finishedProductTemplate'),
    value: '成品条码打印标签',
  },
  {
    label: $t('storeManagement.labelPrint.workOrderTemplate'),
    value: '随工单打印标签',
  },
  {
    label: $t('storeManagement.labelPrint.materialLabelCardTemplate'),
    value: '物料标签卡打印标签',
  },
];

// 打印弹窗状态
const printModalVisible = ref(false);
const selectedTemplate = ref(printTemplates[0]?.value || '');
const printIds = ref<string[]>([]);

// 监听打开状态，加载数据
watch(
  () => props.open,
  (val) => {
    if (val && props.recordId) {
      loadLabelDetail();
    }
  },
);

/**
 * 加载标签明细
 */
function loadLabelDetail() {
  if (!props.recordId) return;
  fetchLabelRecordDetail(props.recordId)
    .then((data: any) => {
      gridApi.grid.loadData(data.labelList || []);
    })
    .catch((error: any) => {
      message.error(
        error.message || $t('storeManagement.labelPrint.getDetailFailed'),
      );
    });
}

/**
 * 打印（先选择打印模板）
 */
function handlePrint() {
  const selection = gridApi.grid.getCheckboxRecords();
  if (selection.length === 0) {
    message.warning($t('storeManagement.labelPrint.selectPrintLabel'));
    return;
  }
  printIds.value = selection.map((item: any) => item.id);
  selectedTemplate.value = printTemplates[0]?.value || '';
  printModalVisible.value = true;
}

/**
 * 执行打印
 */
function doPrint() {
  Promise.all([
    queryPrintTemplateDetails(selectedTemplate.value),
    fetchLabelTemplate(printIds.value),
  ])
    .then(([templateRes, dataRes]: any) => {
      try {
        const templateRef = JSON.parse(templateRes.printData);
        const hiprintTemplate = new hiprint.PrintTemplate({
          template: templateRef,
        });
        hiprintTemplate.print(dataRes || [], {
          leftOffset: -1,
          topOffset: -1,
        });
        printModalVisible.value = false;
        // 打印后更新打印状态
        printLabel(printIds.value).then(() => {
          message.success($t('storeManagement.labelPrint.printSuccess'));
          loadLabelDetail();
        });
      } catch {
        console.error('模板解析失败');
      }
    })
    .catch((error: any) => {
      message.error(error.message || $t('common.operationFailed'));
    });
}

/**
 * 删除
 */
function handleDelete() {
  const selection = gridApi.grid.getCheckboxRecords();
  if (selection.length === 0) {
    message.warning($t('storeManagement.labelPrint.selectDeleteLabel'));
    return;
  }
  Modal.confirm({
    title: $t('storeManagement.labelPrint.confirmDelete'),
    content: $t('storeManagement.labelPrint.confirmDeleteLabel'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      const ids = selection.map((item: any) => item.id);
      deleteLabelDetail(ids)
        .then(() => {
          message.success($t('storeManagement.labelPrint.deleteSuccess'));
          loadLabelDetail();
          emit('refresh');
        })
        .catch((error: any) => {
          message.error(error.message || $t('common.deleteFailed'));
        });
    },
  });
}

/**
 * 判定待入库
 */
function handleEnterWarehouse() {
  const selection = gridApi.grid.getCheckboxRecords();
  if (selection.length === 0) {
    message.warning($t('storeManagement.labelPrint.selectLabel'));
    return;
  }
  Modal.confirm({
    title: $t('storeManagement.labelPrint.confirmWarehouse'),
    content: $t('storeManagement.labelPrint.confirmWarehouseEntry'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      const ids = selection.map((item: any) => item.id);
      enterWarehouse(ids)
        .then(() => {
          message.success($t('storeManagement.labelPrint.judgeSuccess'));
          loadLabelDetail();
        })
        .catch((error: any) => {
          message.error(error.message || $t('common.operationFailed'));
        });
    },
  });
}

/**
 * 判定待退库
 */
function handleJudgeReturn() {
  const selection = gridApi.grid.getCheckboxRecords();
  if (selection.length === 0) {
    message.warning($t('storeManagement.labelPrint.selectLabel'));
    return;
  }
  Modal.confirm({
    title: $t('storeManagement.labelPrint.confirmWarehouse'),
    content: $t('storeManagement.labelPrint.confirmReturnWarehouse'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      const ids = selection.map((item: any) => item.id);
      judgeReturn(ids)
        .then(() => {
          message.success($t('storeManagement.labelPrint.judgeSuccess'));
          loadLabelDetail();
        })
        .catch((error: any) => {
          message.error(error.message || $t('common.operationFailed'));
        });
    },
  });
}

/**
 * 关闭抽屉
 */
function handleClose() {
  emit('update:open', false);
}
</script>

<template>
  <Drawer
    :open="open"
    :title="$t('storeManagement.labelPrint.labelDetail')"
    width="90%"
    :footer-style="{ textAlign: 'right' }"
    @close="handleClose"
  >
    <Space class="!mb-4">
      <Button type="primary" @click="handlePrint">
        {{ $t('common.print') }}
      </Button>
      <Button type="primary" danger @click="handleDelete">
        {{ $t('common.delete') }}
      </Button>
      <Button type="primary" @click="handleEnterWarehouse">
        {{ $t('storeManagement.labelPrint.judgeWarehouse') }}
      </Button>
      <Button type="primary" @click="handleJudgeReturn">
        {{ $t('storeManagement.labelPrint.judgeReturnWarehouse') }}
      </Button>
    </Space>
    <Grid>
      <template #status="{ row }">
        <Tag :color="statusColorMap[row.status] || 'default'">
          {{ statusMap[row.status] || $t('common.unknown') }}
        </Tag>
      </template>
      <template #createDate="{ row }">
        {{ row.createDate?.slice(0, 10) || '' }}
      </template>
      <template #produceDate="{ row }">
        {{ row.produceDate?.slice(0, 10) || '' }}
      </template>
      <template #validDate="{ row }">
        {{ row.validDate?.slice(0, 10) || '' }}
      </template>
    </Grid>
  </Drawer>
  <Modal
    v-model:open="printModalVisible"
    :title="$t('storeManagement.labelPrint.selectPrintTemplate')"
    :ok-text="$t('common.confirm')"
    :cancel-text="$t('common.cancel')"
    @ok="doPrint"
  >
    <RadioGroup v-model:value="selectedTemplate">
      <Radio
        v-for="item in printTemplates"
        :key="item.value"
        :value="item.value"
      >
        {{ item.label }}
      </Radio>
    </RadioGroup>
  </Modal>
</template>
