<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

/**
 * [INPUT]: 依赖 #/api (smtSubPlanSearch)、#/locales ($t)
 * [OUTPUT]: 对外提供 SubPlanSelectModal 弹窗组件，通过 defineExpose({ open }) 暴露 open 方法，
 *           通过 emit('confirm') 返回选中的子计划记录
 * [POS]: 属于 planManagement 模块的子计划选择弹窗子组件，被 WorkSheetDrawer 引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-06-18 10:43:00
 */
import { computed, nextTick, ref } from 'vue';

import {
  Button,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Radio,
  RadioGroup,
  Select,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { smtSubPlanSearch } from '#/api';
import { $t } from '#/locales';

defineOptions({ name: 'SubPlanSelectModal' });

const emit = defineEmits<{
  confirm: [records: any[]];
}>();

// 弹窗状态
const show = ref(false);
// 已选行数据
const selectedRows = ref<any[]>([]);

// 工单类别下拉选项
const processTypeOptions = computed(() => [
  { value: 1, label: $t('SMTmanagement.processTypeSMT') },
  { value: 2, label: $t('SMTmanagement.processTypePlugin') },
  { value: 3, label: $t('SMTmanagement.processTypeRepair') },
]);

// 查询参数
const queryParams = ref<any>({
  planCode: '',
  productCode: '',
  productName: '',
  processType: 1,
  isFinish: '2',
  isPlanWork: '2',
});

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50 },
    { field: 'planCode', title: $t('SMTmanagement.planNumber'), minWidth: 150 },
    { field: 'subPlanCode', title: $t('SMTmanagement.subPlanCode'), minWidth: 150 },
    { field: 'subProductCode', title: $t('SMTmanagement.subProductCode'), minWidth: 150 },
    {
      field: 'subProductName',
      title: $t('SMTmanagement.subProductName'),
      minWidth: 200,
      showOverflow: true,
    },
    { field: 'finishNumber', title: $t('SMTmanagement.finishNumber'), minWidth: 60 },
    { field: 'orderNumber', title: $t('SMTmanagement.orderNumber'), minWidth: 95 },
    { field: 'planNumber', title: $t('SMTmanagement.planQuantity'), minWidth: 95 },
    { field: 'unarrangedNumber', title: $t('SMTmanagement.produceUnarrangedNumber'), minWidth: 95 },
    { field: 'unFinishNumber', title: $t('SMTmanagement.produceNotFinishNumber'), minWidth: 95 },
    { field: 'singleDosage', title: $t('SMTmanagement.singleDosage'), minWidth: 100 },
    { field: 'subPlanNumber', title: $t('SMTmanagement.subPlanNumber'), minWidth: 125 },
    { field: 'planDateStart', title: $t('SMTmanagement.planDateStart'), minWidth: 105 },
    { field: 'planType', title: $t('SMTmanagement.planType'), minWidth: 95 },
    { field: 'orderDate', title: $t('SMTmanagement.orderDate'), minWidth: 110 },
    { field: 'deliverDate', title: $t('SMTmanagement.deliverDate'), minWidth: 110 },
    { field: 'productCode', title: $t('SMTmanagement.productNumber'), minWidth: 110 },
    {
      field: 'productName',
      title: $t('SMTmanagement.productName'),
      minWidth: 200,
      showOverflow: true,
    },
    { field: 'materialTypeName', title: $t('SMTmanagement.materialTypeName') },
  ],
  height: 500,
  stripe: true,
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        return await loadData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
};

const gridEvents: VxeGridListeners<any> = {
  checkboxChange: () => {
    selectedRows.value = gridApi.grid.getCheckboxRecords();
  },
  checkboxAll: () => {
    selectedRows.value = gridApi.grid.getCheckboxRecords();
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

function loadData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    smtSubPlanSearch({
      ...queryParams.value,
      pageNum: page,
      pageSize,
    })
      .then((res: any) => {
        const list = res?.list || res?.results || [];
        const total = res?.total ?? 0;
        resolve({ total, items: list });
      })
      .catch((error: any) => reject(error));
  });
}

/**
 * 确认选择
 */
function handleConfirm() {
  if (selectedRows.value.length === 0) {
    message.warning($t('SMTmanagement.pleaseSelectData'));
    return;
  }
  emit('confirm', selectedRows.value);
  show.value = false;
}

function open() {
  selectedRows.value = [];
  queryParams.value = {
    planCode: '',
    productCode: '',
    productName: '',
    processType: 1,
    isFinish: '2',
    isPlanWork: '2',
  };
  show.value = true;
  nextTick(() => {
    gridApi.reload();
  });
}

defineExpose({ open, queryParams });
</script>

<template>
  <Modal
    v-model:open="show"
    :title="$t('SMTmanagement.subPlanSelectTitle')"
    width="80%"
    :destroy-on-close="true"
    :footer="null"
  >
    <!-- 搜索区域 -->
    <Form layout="inline" style="margin-bottom: 8px">
      <FormItem :label="$t('SMTmanagement.planNumber')" style="margin-bottom: 8px">
        <Input v-model:value="queryParams.planCode" :placeholder="$t('SMTmanagement.inputPlanCode')" />
      </FormItem>
      <FormItem :label="$t('SMTmanagement.productNumber')" style="margin-bottom: 8px">
        <Input v-model:value="queryParams.productCode" :placeholder="$t('SMTmanagement.inputProductCode')" />
      </FormItem>
      <FormItem :label="$t('SMTmanagement.productName')" style="margin-bottom: 8px">
        <Input v-model:value="queryParams.productName" :placeholder="$t('SMTmanagement.inputProductName')" />
      </FormItem>
      <FormItem :label="$t('SMTmanagement.processType')" style="margin-bottom: 8px">
        <Select
          v-model:value="queryParams.processType"
          :options="processTypeOptions"
          :placeholder="$t('SMTmanagement.selectPlaceholder')"
          style="width: 150px"
        />
      </FormItem>
      <FormItem :label="$t('SMTmanagement.isFinish')" style="margin-bottom: 8px">
        <RadioGroup v-model:value="queryParams.isFinish">
          <Radio value="1">{{ $t('SMTmanagement.finished') }}</Radio>
          <Radio value="2">{{ $t('SMTmanagement.unfinished') }}</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem :label="$t('SMTmanagement.isPlanWork')" style="margin-bottom: 8px">
        <RadioGroup v-model:value="queryParams.isPlanWork">
          <Radio value="1">{{ $t('SMTmanagement.arranged') }}</Radio>
          <Radio value="2">{{ $t('SMTmanagement.unarranged') }}</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem style="margin-bottom: 8px">
        <Button type="primary" @click="() => gridApi.reload()">
          {{ $t('common.search') }}
        </Button>
      </FormItem>
    </Form>

    <!-- 表格 -->
    <Grid />

    <!-- 底部按钮 -->
    <Space style="justify-content: flex-end; width: 100%; margin-top: 16px">
      <Button @click="show = false">{{ $t('common.cancel') }}</Button>
      <Button type="primary" @click="handleConfirm">{{ $t('common.confirm') }}</Button>
    </Space>
  </Modal>
</template>
