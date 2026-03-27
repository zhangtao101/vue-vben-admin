<script lang="ts" setup>
/**
 * 标签副本页面
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteLabelReplica,
  fetchLabelReplicaList,
  printLabel,
  setRecordPrint,
} from '#/api';
import { queryAuth } from '#/util';

// 查询参数
const queryParams = ref<any>({
  formCode: undefined,
  materialCode: undefined,
  printStatus: 2,
  outWarehouseDateStart: undefined,
  outWarehouseDateEnd: undefined,
});

// 日期范围
const dateRange = ref<any>(null);

// 单据类型
const formTypes = ref<string[]>([]);

// 打印状态选项
const printStatusOptions = [
  { value: 2, label: $t('storeManagement.labelPrint.printAll') },
  { value: 0, label: $t('storeManagement.labelPrint.notPrinted') },
  { value: 1, label: $t('storeManagement.labelPrint.printed') },
];

// 表格列配置
const gridColumns: any[] = [
  { type: 'seq', title: '序号', width: 60 },
  { type: 'checkbox', width: 55 },
  {
    field: 'isPrint',
    title: $t('common.print'),
    width: 60,
    slots: { default: 'isPrint' },
  },
  {
    field: 'printTimes',
    title: $t('storeManagement.labelPrint.printTimes'),
    width: 80,
  },
  {
    field: 'formType',
    title: $t('storeManagement.labelPrint.formType'),
    width: 80,
  },
  {
    field: 'typeName',
    title: $t('storeManagement.labelPrint.typeName'),
    width: 80,
  },
  {
    field: 'formCode',
    title: $t('storeManagement.labelPrint.formCode'),
    minWidth: 150,
  },
  {
    field: 'outWarehouseDate',
    title: $t('storeManagement.labelPrint.outWarehouseDate'),
    width: 100,
    slots: { default: 'outWarehouseDate' },
  },
  {
    field: 'transferDate',
    title: $t('storeManagement.labelPrint.transferDate'),
    width: 100,
    slots: { default: 'transferDate' },
  },
  {
    field: 'materialCode',
    title: $t('storeManagement.labelPrint.materialCode'),
    width: 100,
  },
  {
    field: 'materialName',
    title: $t('storeManagement.labelPrint.materialName'),
    minWidth: 150,
    showOverflow: 'tooltip',
  },
  { field: 'unit', title: $t('storeManagement.labelPrint.unit'), width: 60 },
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
    field: 'purchasePlanCode',
    title: $t('storeManagement.labelPrint.purchasePlanCode'),
    width: 100,
  },
  {
    field: 'workOrderCode',
    title: $t('storeManagement.labelPrint.workOrderCode'),
    width: 100,
  },
  {
    field: 'manufacturerName',
    title: $t('storeManagement.labelPrint.manufacturerName'),
    minWidth: 100,
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
    title: $t('common.operation'),
    width: 70,
    fixed: 'right',
    slots: { default: 'action' },
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
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 50,
    pageSizes: [10, 20, 50],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryLabelReplicaList({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/**
 * 查询标签副本列表
 */
function queryLabelReplicaList({ page, pageSize }: any) {
  return new Promise((resolve) => {
    fetchLabelReplicaList(
      {
        ...queryParams.value,
        pageNum: page,
        pageSize,
      },
      formTypes.value.join(','),
    ).then(({ total, results }: any) => {
      // 处理打印状态
      const data = (results || []).map((item: any) => ({
        ...item,
        isPrint: item.printTimes > 0,
      }));
      resolve({
        total,
        items: data,
      });
    });
  });
}

/**
 * 日期范围变化
 */
function handleDateChange(_dates: any, dateStrings: [string, string]) {
  if (dateStrings && dateStrings[0] && dateStrings[1]) {
    queryParams.value.outWarehouseDateStart = dateStrings[0];
    queryParams.value.outWarehouseDateEnd = dateStrings[1];
  } else {
    queryParams.value.outWarehouseDateStart = undefined;
    queryParams.value.outWarehouseDateEnd = undefined;
  }
}

/**
 * 查询
 */
function handleQuery() {
  gridApi.reload();
}

/**
 * 打印
 */
function handlePrint() {
  const selection = gridApi.grid.getCheckboxRecords();
  if (selection.length === 0) {
    message.warning($t('storeManagement.labelPrint.selectPrintLabel'));
    return;
  }

  const labelIdList = selection.map((item: any) => item.id);

  // 调用打印接口
  printLabel(labelIdList).then(() => {
    // 记录设为打印
    setRecordPrint(labelIdList).then(() => {
      message.success($t('storeManagement.labelPrint.printSuccess'));
      gridApi.reload();
    });
  });
}

/**
 * 删除
 */
function handleDelete(row: any) {
  Modal.confirm({
    title: $t('storeManagement.labelPrint.confirmDelete'),
    content: $t('storeManagement.labelPrint.confirmDeleteLabelById'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      deleteLabelReplica(row.id).then(() => {
        message.success($t('storeManagement.labelPrint.deleteSuccess'));
        gridApi.reload();
      });
    },
  });
}

// 权限
const route = useRoute();
const author = ref<string[]>([]);
onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});
</script>

<template>
  <Page>
    <!-- 搜索 -->
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem
          :label="$t('storeManagement.labelPrint.formCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.formCode"
            :placeholder="
              $t('common.pleaseEnter') +
              $t('storeManagement.labelPrint.formCode')
            "
            style="width: 180px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.labelPrint.outWarehouseDate')"
          style="margin-bottom: 1em"
        >
          <DatePicker.RangePicker
            v-model:value="dateRange"
            style="width: 240px"
            @change="handleDateChange"
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.labelPrint.printStatus')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.printStatus"
            :options="printStatusOptions"
            style="width: 120px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.labelPrint.materialCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.materialCode"
            :placeholder="
              $t('common.pleaseEnter') +
              $t('storeManagement.labelPrint.materialCode')
            "
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.labelPrint.formType')"
          style="margin-bottom: 1em"
        >
          <CheckboxGroup v-model:value="formTypes">
            <Checkbox value="1">
              {{ $t('storeManagement.labelPrint.outboundOrder') }}
            </Checkbox>
            <Checkbox value="2">
              {{ $t('storeManagement.labelPrint.transferOrder') }}
            </Checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="handleQuery"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格 -->
    <Card class="!mb-8">
      <Grid>
        <template #toolbar-tools>
          <Space v-if="author.includes('打印')">
            <Button type="primary" @click="handlePrint">
              {{ $t('common.print') }}
            </Button>
          </Space>
        </template>
        <template #isPrint="{ row }">
          <Checkbox :checked="row.isPrint" disabled />
        </template>
        <template #outWarehouseDate="{ row }">
          {{ row.outWarehouseDate?.slice(0, 10) || '' }}
        </template>
        <template #transferDate="{ row }">
          {{ row.transferDate?.slice(0, 10) || '' }}
        </template>
        <template #produceDate="{ row }">
          {{ row.produceDate?.slice(0, 10) || '' }}
        </template>
        <template #validDate="{ row }">
          {{ row.validDate?.slice(0, 10) || '' }}
        </template>
        <template #action="{ row }">
          <Tooltip v-if="author.includes('删除')">
            <template #title>
              {{ $t('common.delete') }}
            </template>
            <Button type="link" danger class="px-1" @click="handleDelete(row)">
              <Icon
                icon="mdi:delete-forever-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>
  </Page>
</template>
