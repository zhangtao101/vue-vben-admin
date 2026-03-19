<script lang="ts" setup>
/**
 * 材料批次导入页面
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Space,
  Tooltip,
  Upload,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteLabelById,
  fetchMaterialBatchList,
  printLabel,
  uploadMaterialExcel,
} from '#/api';

// 查询参数
const queryParams = reactive({
  materialCode: undefined as string | undefined,
  materialName: undefined as string | undefined,
  locationName: undefined as string | undefined,
});

// 打印相关
const labelPrintList = ref<any[]>([]);
const labelIdList = ref<string[]>([]);

// 表格列配置
const gridColumns: any[] = [
  { type: 'checkbox', width: 55 },
  {
    field: 'printTimes',
    title: $t('storeManagement.labelPrint.printTimes'),
    width: 80,
  },
  {
    field: 'labelCode',
    title: $t('storeManagement.labelPrint.labelCode'),
    minWidth: 180,
  },
  {
    field: 'materialCode',
    title: $t('storeManagement.labelPrint.materialCode'),
    width: 120,
  },
  {
    field: 'materialName',
    title: $t('storeManagement.labelPrint.materialName'),
    minWidth: 200,
    showOverflow: 'tooltip',
  },
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
    field: 'locationName',
    title: $t('storeManagement.labelPrint.locationName'),
    width: 100,
  },
  {
    field: 'warehouseName',
    title: $t('storeManagement.labelPrint.warehouseName'),
    width: 100,
  },
  {
    field: 'logicalWarehouseName',
    title: $t('storeManagement.labelPrint.logicalWarehouseName'),
    width: 120,
  },
  {
    field: 'enterWarehouseTime',
    title: $t('storeManagement.labelPrint.enterWarehouseTime'),
    width: 100,
    slots: { default: 'enterWarehouseTime' },
  },
  { field: 'unit', title: $t('storeManagement.labelPrint.unit'), width: 80 },
  {
    field: 'purchasePlanCode',
    title: $t('storeManagement.labelPrint.purchasePlanCode'),
    width: 100,
  },
  {
    field: 'formType',
    title: $t('storeManagement.labelPrint.formType'),
    width: 80,
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
    field: 'batchCode',
    title: $t('storeManagement.labelPrint.batchCode'),
    width: 120,
  },
  {
    title: $t('common.operation'),
    width: 100,
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
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryMaterialBatchList({
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
 * 查询材料批次列表
 */
function queryMaterialBatchList({ page, pageSize }: any) {
  return new Promise((resolve) => {
    fetchMaterialBatchList({
      ...queryParams,
      pageNum: page,
      pageSize,
    }).then(({ total, results }: any) => {
      resolve({
        total,
        items: results || [],
      });
    });
  });
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

  labelPrintList.value = selection;
  labelIdList.value = selection.map((item: any) => item.id);

  // 调用打印接口更新打印次数
  printLabel(labelIdList.value).then(() => {
    message.success($t('storeManagement.labelPrint.printSuccess'));
    gridApi.reload();
  });
}

/**
 * Excel导入
 */
function handleExcelImport(options: any) {
  const { file } = options;
  if (!file) return;

  const fileType = file.name.slice(file.name.lastIndexOf('.'));
  if (fileType !== '.xlsx' && fileType !== '.xls') {
    message.warning($t('storeManagement.labelPrint.invalidFileType'));
    return;
  }

  const param = new FormData();
  param.append('file', file, file.name);

  uploadMaterialExcel(param).then(() => {
    message.success($t('storeManagement.labelPrint.uploadSuccess'));
    gridApi.reload();
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
      deleteLabelById(row.id).then(() => {
        message.success($t('storeManagement.labelPrint.deleteSuccess'));
        gridApi.reload();
      });
    },
  });
}
</script>

<template>
  <Page>
    <!-- 搜索 -->
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
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
          :label="$t('storeManagement.labelPrint.materialName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.materialName"
            :placeholder="
              $t('common.pleaseEnter') +
              $t('storeManagement.labelPrint.materialName')
            "
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.labelPrint.locationName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.locationName"
            :placeholder="
              $t('common.pleaseEnter') +
              $t('storeManagement.labelPrint.locationName')
            "
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="handleQuery">
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格 -->
    <Card class="!mb-8">
      <Grid>
        <template #toolbar-tools>
          <Space>
            <a href="/static/downLoad/材料导入模板.xlsx" target="_blank">
              <Button type="primary">{{
                $t('storeManagement.labelPrint.templateDownload')
              }}</Button>
            </a>
            <Upload
              :show-upload-list="false"
              accept=".xls,.xlsx"
              :custom-request="handleExcelImport"
            >
              <Button type="primary">{{ $t('common.import') }}</Button>
            </Upload>
            <Button type="primary" @click="handlePrint">
              {{ $t('common.print') }}
            </Button>
          </Space>
        </template>
        <template #enterWarehouseTime="{ row }">
          {{ row.enterWarehouseTime?.slice(0, 10) || '' }}
        </template>
        <template #produceDate="{ row }">
          {{ row.produceDate?.slice(0, 10) || '' }}
        </template>
        <template #validDate="{ row }">
          {{ row.validDate?.slice(0, 10) || '' }}
        </template>
        <template #action="{ row }">
          <Tooltip>
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
