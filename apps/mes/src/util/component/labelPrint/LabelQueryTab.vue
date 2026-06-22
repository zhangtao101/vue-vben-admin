<script lang="ts" setup>
/**
 * 标签查询 Tab 组件
 * [INPUT]: 依赖 #/api (fetchLabelDetailList/enterWarehouse/judgeReturn/exportLabelDetail)、#/locales ($t)
 * [OUTPUT]: 对外无 emit，自包含标签明细查询管理功能
 * [POS]: 属于 labelPrint 模块的子组件，被 labelPrint.vue 引用
 * [PROTOCOL]: 变更时更新此头部
 * [TIME]: 2026-06-22 13:56:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { reactive, ref } from 'vue';

/* eslint-disable perfectionist/sort-imports */
// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  DatePicker,
  Form,
  FormItem,
  Input,
  message,
  Select,
  SelectOption,
  Space,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
  enterWarehouse,
  exportLabelDetail,
  fetchLabelDetailList,
  judgeReturn,
  setRecordPrint,
} from '#/api';
import { $t } from '#/locales';

// region 表格配置
const labelQueryColumns: any[] = [
  { type: 'checkbox', width: 55 },
  {
    field: 'printTimes',
    title: $t('storeManagement.labelPrint.printTimes'),
    minWidth: 80,
  },
  {
    field: 'status',
    title: $t('storeManagement.labelPrint.status'),
    minWidth: 80,
    slots: { default: 'status' },
  },
  {
    field: 'createDate',
    title: $t('storeManagement.labelPrint.createDate'),
    minWidth: 120,
  },
  {
    field: 'labelCode',
    title: $t('storeManagement.labelPrint.labelCode'),
    minWidth: 180,
  },
  {
    field: 'materialCode',
    title: $t('storeManagement.labelPrint.materialCode'),
    minWidth: 120,
  },
  {
    field: 'materialName',
    title: $t('storeManagement.labelPrint.materialName'),
    minWidth: 200,
  },
  { field: 'unit', title: $t('storeManagement.labelPrint.unit'), minWidth: 80 },
  {
    field: 'labelNumber',
    title: $t('storeManagement.labelPrint.labelNumber'),
    minWidth: 100,
  },
  {
    field: 'packageNumber',
    title: $t('storeManagement.labelPrint.packageNumber'),
    minWidth: 100,
  },
  {
    field: 'toEnterNumber',
    title: $t('storeManagement.labelPrint.toEnterNumber'),
    minWidth: 100,
  },
  {
    field: 'toRejectNumber',
    title: $t('storeManagement.labelPrint.toRejectNumber'),
    minWidth: 100,
  },
  {
    field: 'enterWarehouseNumber',
    title: $t('storeManagement.labelPrint.enterWarehouseNumber'),
    minWidth: 100,
  },
  {
    field: 'rejectNumber',
    title: $t('storeManagement.labelPrint.rejectNumber'),
    minWidth: 100,
  },
  {
    field: 'purchasePlanCode',
    title: $t('storeManagement.labelPrint.purchasePlanCode'),
    minWidth: 120,
  },
  {
    field: 'contractCode',
    title: $t('storeManagement.labelPrint.contractCode'),
    minWidth: 120,
  },
  {
    field: 'formType',
    title: $t('storeManagement.labelPrint.formType'),
    minWidth: 100,
  },
  {
    field: 'manufacturerName',
    title: $t('storeManagement.labelPrint.manufacturerName'),
    minWidth: 150,
  },
  {
    field: 'produceDate',
    title: $t('storeManagement.labelPrint.produceDate'),
    minWidth: 120,
  },
  {
    field: 'validDate',
    title: $t('storeManagement.labelPrint.validDate'),
    minWidth: 120,
  },
  {
    field: 'batchCode',
    title: $t('storeManagement.labelPrint.batchCode'),
    minWidth: 180,
  },
];

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: labelQueryColumns,
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryList({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  showOverflow: 'tooltip',
  stripe: true,
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
// endregion

// region 状态定义
const queryParams = reactive({
  materialCode: undefined as string | undefined,
  materialName: undefined as string | undefined,
  manufacturerName: undefined as string | undefined,
  recordDateStart: undefined as string | undefined,
  recordDateEnd: undefined as string | undefined,
  inspectionDateStart: undefined as string | undefined,
  inspectionDateEnd: undefined as string | undefined,
  statusList: [] as string[],
  pageNum: 1,
  pageSize: 10,
});

const queryDateRange = ref<[string, string] | undefined>(undefined);
const inspectionDateRange = ref<[string, string] | undefined>(undefined);

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
// endregion

// region 方法定义
function queryList({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams,
      statusList: queryParams.statusList.join(','),
      pageNum: page,
      pageSize,
    };
    fetchLabelDetailList(params)
      .then(({ total, list }) => {
        resolve({ total, items: list });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function handleQuery() {
  if (queryDateRange.value && queryDateRange.value.length === 2) {
    queryParams.recordDateStart = queryDateRange.value[0];
    queryParams.recordDateEnd = queryDateRange.value[1];
  } else {
    queryParams.recordDateStart = undefined;
    queryParams.recordDateEnd = undefined;
  }
  if (inspectionDateRange.value && inspectionDateRange.value.length === 2) {
    queryParams.inspectionDateStart = inspectionDateRange.value[0];
    queryParams.inspectionDateEnd = inspectionDateRange.value[1];
  } else {
    queryParams.inspectionDateStart = undefined;
    queryParams.inspectionDateEnd = undefined;
  }
  gridApi.reload();
}

function handlePrint() {
  const selection = gridApi.grid.getCheckboxRecords();
  if (selection.length === 0) {
    message.warning($t('storeManagement.labelPrint.selectPrintRecord'));
    return;
  }
  const ids = selection.map((item: any) => item.id);
  setRecordPrint(ids)
    .then(() => {
      message.success($t('storeManagement.labelPrint.printSuccess'));
      gridApi.reload();
    })
    .catch((error: any) => {
      message.error(error.message || $t('common.operationFailed'));
    });
}

function handleEnterWarehouse() {
  const selection = gridApi.grid.getCheckboxRecords();
  if (selection.length === 0) {
    message.warning($t('storeManagement.labelPrint.selectLabel'));
    return;
  }
  const ids = selection.map((item: any) => item.id);
  enterWarehouse(ids)
    .then(() => {
      message.success($t('storeManagement.labelPrint.judgeSuccess'));
      gridApi.reload();
    })
    .catch((error: any) => {
      message.error(error.message || $t('common.operationFailed'));
    });
}

function handleJudgeReturn() {
  const selection = gridApi.grid.getCheckboxRecords();
  if (selection.length === 0) {
    message.warning($t('storeManagement.labelPrint.selectLabel'));
    return;
  }
  const ids = selection.map((item: any) => item.id);
  judgeReturn(ids)
    .then(() => {
      message.success($t('storeManagement.labelPrint.judgeSuccess'));
      gridApi.reload();
    })
    .catch((error: any) => {
      message.error(error.message || $t('common.operationFailed'));
    });
}

function handleExport() {
  const params = {
    ...queryParams,
    statusList: queryParams.statusList.join(','),
  };
  exportLabelDetail(params)
    .then((url: any) => {
      window.open(url);
    })
    .catch((error: any) => {
      message.error(error.message || $t('common.exportFailed'));
    });
}
// endregion
</script>

<template>
  <div>
    <Card>
      <Form layout="inline" class="!mb-4">
        <FormItem :label="$t('storeManagement.labelPrint.materialCode')">
          <Input
            v-model:value="queryParams.materialCode"
            :placeholder="
              $t('common.pleaseEnter') +
              $t('storeManagement.labelPrint.materialCode')
            "
            allow-clear
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
            allow-clear
            style="width: 150px"
          />
        </FormItem>
        <FormItem :label="$t('storeManagement.labelPrint.manufacturerName')">
          <Input
            v-model:value="queryParams.manufacturerName"
            :placeholder="
              $t('common.pleaseEnter') +
              $t('storeManagement.labelPrint.manufacturerName')
            "
            allow-clear
            style="width: 150px"
          />
        </FormItem>
        <FormItem :label="$t('storeManagement.labelPrint.createDate')">
          <DatePicker.RangePicker
            v-model:value="queryDateRange"
            style="width: 240px"
          />
        </FormItem>
        <FormItem :label="$t('storeManagement.labelPrint.inspectionDate')">
          <DatePicker.RangePicker
            v-model:value="inspectionDateRange"
            style="width: 240px"
          />
        </FormItem>
        <FormItem :label="$t('storeManagement.labelPrint.status')">
          <Select
            v-model:value="queryParams.statusList"
            mode="multiple"
            :placeholder="
              $t('common.pleaseSelect') +
              $t('storeManagement.labelPrint.status')
            "
            allow-clear
            style="width: 200px"
          >
            <SelectOption value="1">
              {{ $t('storeManagement.labelPrint.pendingInspection') }}
            </SelectOption>
            <SelectOption value="2">
              {{ $t('storeManagement.labelPrint.pendingWarehouse') }}
            </SelectOption>
            <SelectOption value="3">
              {{ $t('storeManagement.labelPrint.warehoused') }}
            </SelectOption>
            <SelectOption value="4">
              {{ $t('storeManagement.labelPrint.outOfStock') }}
            </SelectOption>
            <SelectOption value="5">
              {{ $t('storeManagement.labelPrint.pendingReturn') }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem>
          <Space>
            <Button type="primary" @click="handleQuery">
              <Icon icon="mdi:search" class="mr-1" />
              {{ $t('common.search') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>

    <Card class="!mt-4">
      <Space class="!mb-4">
        <Button type="primary" @click="handlePrint">
          {{ $t('common.print') }}
        </Button>
        <Button
          type="primary"
          danger
          @click="
            () =>
              message.warning(
                $t('storeManagement.labelPrint.selectDeleteLabel'),
              )
          "
        >
          {{ $t('common.delete') }}
        </Button>
        <Button type="primary" @click="handleEnterWarehouse">
          {{ $t('storeManagement.labelPrint.judgeWarehouse') }}
        </Button>
        <Button type="primary" @click="handleJudgeReturn">
          {{ $t('storeManagement.labelPrint.judgeReturnWarehouse') }}
        </Button>
        <Button type="primary" @click="handleExport">
          {{ $t('common.export') }}
        </Button>
      </Space>

      <Grid>
        <template #status="{ row }">
          <Tag :color="statusColorMap[row.status] || 'default'">
            {{ statusMap[row.status] || $t('common.unknown') }}
          </Tag>
        </template>
      </Grid>
    </Card>
  </div>
</template>
