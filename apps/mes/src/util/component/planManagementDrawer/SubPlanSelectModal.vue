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
import { ref } from 'vue';

import {
  Button,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Radio,
  RadioGroup,
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

// 查询参数
const queryParams = ref<any>({
  planCode: '',
  productCode: '',
  productName: '',
  isFinish: '2',
  isPlanWork: '2',
});

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50 },
    { field: 'planCode', title: '计划号', minWidth: 80 },
    { field: 'subPlanCode', title: '部件计划号', minWidth: 105 },
    { field: 'subProductCode', title: '部件编号', minWidth: 95 },
    {
      field: 'subProductName',
      title: '部件名称',
      minWidth: 200,
      showOverflow: true,
    },
    { field: 'finishNumber', title: '完工数', minWidth: 60 },
    { field: 'orderNumber', title: '订单数量', minWidth: 95 },
    { field: 'planNumber', title: '计划数量', minWidth: 95 },
    { field: 'unarrangedNumber', title: '生产未排数', minWidth: 95 },
    { field: 'unFinishNumber', title: '生产未完数', minWidth: 95 },
    { field: 'singleDosage', title: '单件用量', minWidth: 100 },
    { field: 'subPlanNumber', title: '部件计划数量', minWidth: 125 },
    { field: 'planDateStart', title: '计划开始时间', minWidth: 105 },
    { field: 'planType', title: '计划类别', minWidth: 95 },
    { field: 'orderDate', title: '订单日期', minWidth: 110 },
    { field: 'deliverDate', title: '交货日期', minWidth: 110 },
    { field: 'productCode', title: '产品编号' },
    {
      field: 'productName',
      title: '产品名称',
      minWidth: 200,
      showOverflow: true,
    },
    { field: 'materialTypeName', title: '材料类别' },
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
      processType: 1,
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
    message.warning('请勾选要引用的数据');
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
    isFinish: '2',
    isPlanWork: '2',
  };
  show.value = true;
  gridApi.reload();
}

defineExpose({ open });
</script>

<template>
  <Modal
    v-model:open="show"
    title="产品选择"
    width="80%"
    :destroy-on-close="true"
    :footer="null"
  >
    <!-- 搜索区域 -->
    <Form layout="inline" style="margin-bottom: 8px">
      <FormItem label="计划号" style="margin-bottom: 8px">
        <Input v-model:value="queryParams.planCode" placeholder="请输入计划号" />
      </FormItem>
      <FormItem label="产品编号" style="margin-bottom: 8px">
        <Input v-model:value="queryParams.productCode" placeholder="请输入产品编号" />
      </FormItem>
      <FormItem label="产品名称" style="margin-bottom: 8px">
        <Input v-model:value="queryParams.productName" placeholder="请输入产品名称" />
      </FormItem>
      <FormItem label="是否完成" style="margin-bottom: 8px">
        <RadioGroup v-model:value="queryParams.isFinish">
          <Radio value="1">已完成</Radio>
          <Radio value="2">未完成</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="是否计划安排" style="margin-bottom: 8px">
        <RadioGroup v-model:value="queryParams.isPlanWork">
          <Radio value="1">已安排</Radio>
          <Radio value="2">未安排</Radio>
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
