<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref, watch } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { fetchInspectionSlipList } from '#/api';

// Props
const props = defineProps<{
  visible: boolean;
}>();

// Emits
const emit = defineEmits<{
  confirm: [data: any];
  'update:visible': [value: boolean];
}>();

// 查询参数
const queryParams = ref<any>({
  formCode: '',
  sendDateStart: '',
  sendDateEnd: '',
  materialName: '',
  materialCode: '',
  manufacturerName: '',
  statusList: [], // 待入状态
  finishStatus: '2', // 全部
  order: 1,
  opType: 2,
});

const dateRange = ref<any>(null);

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns: [
    { type: 'radio', width: 50 },
    {
      field: 'materialCode',
      title: $t('storeManagement.labelPrint.materialCode'),
      width: 120,
    },
    {
      field: 'materialName',
      title: $t('storeManagement.labelPrint.materialName'),
      minWidth: 200,
    },
    {
      field: 'labelCode',
      title: $t('storeManagement.labelPrint.labelCode'),
      width: 150,
    },
    {
      field: 'packageNumber',
      title: $t('storeManagement.labelPrint.packageNumber'),
      width: 100,
    },
    {
      field: 'manufacturerName',
      title: $t('storeManagement.labelPrint.manufacturerName'),
      minWidth: 200,
    },
    {
      field: 'pasDescribe',
      title: $t('storeManagement.ipcReport.passDescribe'),
      width: 140,
    },
    {
      field: 'formCode',
      title: $t('storeManagement.labelPrint.formCode'),
      width: 140,
    },
    {
      field: 'sendDate',
      title: $t('storeManagement.inspectionSlip.sendDate'),
      width: 100,
    },
    {
      field: 'sendUsername',
      title: $t('storeManagement.inspectionSlip.sendUsername'),
      width: 80,
    },
    { field: 'unit', title: $t('storeManagement.labelPrint.unit'), width: 60 },
    {
      field: 'contractCode',
      title: $t('storeManagement.labelPrint.contractCode'),
      width: 100,
    },
    {
      field: 'validDate',
      title: $t('storeManagement.labelPrint.validDate'),
      width: 100,
    },
    {
      field: 'batchCode',
      title: $t('storeManagement.ipcReport.batchCode'),
      width: 130,
    },
    {
      field: 'produceDate',
      title: $t('storeManagement.labelPrint.produceDate'),
      width: 100,
    },
  ],
  height: 400,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  rowConfig: {
    keyField: 'id',
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
 * 查询数据
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams.value,
      pageNum: page,
      pageSize,
    };

    fetchInspectionSlipList(params)
      .then(({ total, results }: any) => {
        resolve({
          total,
          items: results,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// 日期范围变化
function handleDateChange(_dates: any, dateStrings: [string, string]) {
  if (dateStrings && dateStrings[0] && dateStrings[1]) {
    queryParams.value.sendDateStart = dateStrings[0];
    queryParams.value.sendDateEnd = dateStrings[1];
  } else {
    queryParams.value.sendDateStart = '';
    queryParams.value.sendDateEnd = '';
  }
}

// 查询
function handleQuery() {
  gridApi.reload();
}

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    if (val) {
      gridApi.reload();
    }
  },
);

// 关闭抽屉
function handleClose() {
  emit('update:visible', false);
}

// 确认
function handleConfirm() {
  const row = gridApi.grid?.getRadioRecord();
  if (!row) {
    message.warning($t('storeManagement.ipcReport.selectData'));
    return;
  }
  emit('confirm', row);
  handleClose();
}
</script>

<template>
  <Drawer
    :open="visible"
    :title="$t('storeManagement.labelPrint.materialCode')"
    :width="1200"
    @close="handleClose"
  >
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem
          :label="$t('storeManagement.labelPrint.formCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.formCode"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.inspectionSlip.sendDate')"
          style="margin-bottom: 1em"
        >
          <DatePicker.RangePicker
            v-model:value="dateRange"
            style="width: 240px"
            @change="handleDateChange"
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.inspectionSlip.materialName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.materialName"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.inspectionSlip.materialCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.materialCode"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.labelPrint.manufacturerName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.manufacturerName"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="handleQuery">
{{
            $t('common.search')
          }}
</Button>
        </FormItem>
      </Form>
    </Card>

    <Grid />

    <template #footer>
      <Space style="float: right">
        <Button type="primary" @click="handleConfirm">
{{
          $t('common.confirm')
        }}
</Button>
        <Button @click="handleClose">{{ $t('common.cancel') }}</Button>
      </Space>
    </template>
  </Drawer>
</template>
