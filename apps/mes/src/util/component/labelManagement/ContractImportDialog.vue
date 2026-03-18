<script lang="ts" setup>
/**
 * 采购合同导入对话框组件
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { fetchContractList, fetchToReceivePlanList } from '#/api';

// Props
const props = defineProps<{
  open: boolean;
}>();

// Emits
const emit = defineEmits<{
  confirm: [contracts: any[]];
  'update:open': [value: boolean];
}>();

// 查询参数
const queryParams = reactive({
  code: undefined as string | undefined,
  materialCode: undefined as string | undefined,
  materialName: undefined as string | undefined,
  pageNum: 1,
  pageSize: 10,
});

// 选择数据
const contractSelection = ref<any[]>([]);

// 表格列配置
const gridColumns: any[] = [
  { type: 'checkbox', width: 55 },
  {
    field: 'contractCode',
    title: $t('storeManagement.labelPrint.billCode'),
    width: 120,
  },
  {
    field: 'manufacturerName',
    title: $t('storeManagement.labelPrint.manufacturerName'),
    width: 200,
    showOverflow: 'tooltip',
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
  {
    field: 'unPackageNumber',
    title: $t('storeManagement.labelPrint.unPackageNumber'),
    width: 100,
    slots: { default: 'unPackageNumber' },
  },
  {
    field: 'nowPackageNumber',
    title: $t('storeManagement.labelPrint.nowPackageNumber'),
    width: 130,
    slots: { default: 'nowPackageNumber' },
  },
  {
    field: 'lableNumber',
    title: $t('storeManagement.labelPrint.labelCount'),
    width: 100,
    slots: { default: 'lableNumber' },
  },
  {
    field: 'packageNumber',
    title: $t('storeManagement.labelPrint.packageNumber'),
    width: 100,
  },
  {
    field: 'purchaseDate',
    title: $t('storeManagement.labelPrint.billDate'),
    width: 100,
    slots: { default: 'purchaseDate' },
  },
  {
    field: 'deliveryDate',
    title: $t('storeManagement.labelPrint.deliveryDate'),
    width: 100,
    slots: { default: 'deliveryDate' },
  },
  {
    field: 'formType',
    title: $t('storeManagement.labelPrint.formType'),
    width: 100,
  },
  { field: 'unit', title: $t('storeManagement.labelPrint.unit'), width: 80 },
  {
    field: 'originalPackageNumber',
    title: $t('storeManagement.labelPrint.packageNumber'),
    width: 100,
  },
  {
    field: 'purchasePlanCode',
    title: $t('storeManagement.labelPrint.purchasePlanCode'),
    width: 120,
  },
  {
    field: 'remark',
    title: $t('storeManagement.labelPrint.remark'),
    width: 150,
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
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryContractList({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  showOverflow: 'tooltip',
  stripe: true,
};

// 表格事件
const gridEvents = {
  checkboxChange: () => {
    contractSelection.value = gridApi.grid.getCheckboxRecords();
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 监听打开状态
watch(
  () => props.open,
  (val) => {
    if (val) {
      contractSelection.value = [];
      gridApi.reload();
    }
  },
);

/**
 * 查询采购合同列表
 */
function queryContractList({ page, pageSize }: any) {
  return new Promise((resolve) => {
    fetchContractList({
      ...queryParams,
      pageNum: page,
      pageSize,
    }).then(({ total, results }: any) => {
      const list = (results || []).map((item: any) => ({
        ...item,
        formType: '采购合同',
        nowPackageNumber: '',
        lableNumber: null,
        packageNumber: '',
      }));
      resolve({
        total,
        items: list,
      });
    });
  });
}

/**
 * 采购合同查询
 */
function handleQuery() {
  gridApi.reload();
}

/**
 * 本次包装数变化
 */
function handlePackageNumberChange(row: any) {
  row.lableNumber = null;
  row.packageNumber = '';
}

/**
 * 标签个数变化 - 计算包装数量
 */
function handleLabelNumberChange(row: any, index: number) {
  const tableData = gridApi.grid.getTableData().tableData;
  tableData[index].packageNumber = '';
  const reg1 = /^$|^\d{1,9}(\.\d{1,4})?$/g;
  const reg2 = /^[1-9][0-9]*$/g;
  if (reg1.test(row.nowPackageNumber) && reg2.test(row.lableNumber)) {
    const num = row.nowPackageNumber / row.lableNumber;
    tableData[index].packageNumber = Number.isInteger(num)
      ? num
      : Number(num).toFixed(4);
  }
}

/**
 * 确定导入
 */
function handleOk() {
  const selection = gridApi.grid.getCheckboxRecords();
  if (selection.length === 0) {
    message.warning($t('storeManagement.labelPrint.selectData'));
    return;
  }

  const emptyItems = selection.filter((item: any) => !item.packageNumber);
  if (emptyItems.length > 0) {
    message.warning($t('storeManagement.labelPrint.inputPackageAndLabel'));
    return;
  }

  // 检查欠料信息
  selection.forEach((element: any) => {
    fetchToReceivePlanList(element.materialCode).then((msg: any) => {
      if (msg) message.info(msg);
    });
  });

  emit('confirm', selection);
  handleClose();
}

/**
 * 关闭对话框
 */
function handleClose() {
  emit('update:open', false);
}
</script>

<template>
  <Modal
    :open="open"
    :title="$t('storeManagement.labelPrint.contractImport')"
    width="90%"
    @ok="handleOk"
    @cancel="handleClose"
  >
    <Form layout="inline" class="mb-4">
      <FormItem :label="$t('storeManagement.labelPrint.billCode')">
        <Input
          v-model:value="queryParams.code"
          :placeholder="
            $t('common.pleaseEnter') + $t('storeManagement.labelPrint.billCode')
          "
          style="width: 150px"
        />
      </FormItem>
      <FormItem :label="$t('storeManagement.labelPrint.materialCode')">
        <Input
          v-model:value="queryParams.materialCode"
          :placeholder="
            $t('common.pleaseEnter') +
            $t('storeManagement.labelPrint.materialCode')
          "
          style="width: 150px"
        />
      </FormItem>
      <FormItem :label="$t('storeManagement.labelPrint.materialName')">
        <Input
          v-model:value="queryParams.materialName"
          :placeholder="
            $t('common.pleaseEnter') +
            $t('storeManagement.labelPrint.materialName')
          "
          style="width: 150px"
        />
      </FormItem>
      <FormItem>
        <Button type="primary" @click="handleQuery">
{{
          $t('common.search')
        }}
</Button>
      </FormItem>
    </Form>

    <Grid>
      <template #unPackageNumber="{ row }">
        {{ row.purchaseNumber - row.existLabelNumber }}
      </template>
      <template #nowPackageNumber="{ row }">
        <InputNumber
          v-model:value="row.nowPackageNumber"
          :min="0"
          :precision="4"
          @change="handlePackageNumberChange(row)"
        />
      </template>
      <template #lableNumber="{ row, $rowIndex }">
        <InputNumber
          v-model:value="row.lableNumber"
          :min="1"
          :precision="0"
          @change="handleLabelNumberChange(row, $rowIndex)"
        />
      </template>
      <template #purchaseDate="{ row }">
        {{ row.purchaseDate?.slice(0, 10) || '' }}
      </template>
      <template #deliveryDate="{ row }">
        {{ row.deliveryDate?.slice(0, 10) || '' }}
      </template>
    </Grid>
  </Modal>
</template>
