<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

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
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  cancelJudgeQualityInspection,
  exportQualityInspection,
  fetchQualityInspectionList,
} from '#/api';
import { queryAuth } from '#/util';
import BatchJudgeDrawer from '#/util/component/inQualityInspectio/BatchJudgeDrawer.vue';
import PrintDrawer from '#/util/component/inQualityInspectio/PrintDrawer.vue';
import QualityJudgeDrawer from '#/util/component/inQualityInspectio/QualityJudgeDrawer.vue';
import ToCheckReasonDrawer from '#/util/component/inQualityInspectio/ToCheckReasonDrawer.vue';
import QualityJudgeDetail from '#/util/component/materialInspectionSlip/QualityJudgeDetail.vue';

// 权限
const route = useRoute();
const author = ref<string[]>([]);
const permissions = computed(() => ({
  judge: author.value.includes('质检判定'),
  batchJudge: author.value.includes('批量判定'),
  noJudgeReason: author.value.includes('待判原因'),
  cancelJudge: author.value.includes('取消判定'),
  judgeDetail: author.value.includes('质检判定详情'),
  print: author.value.includes('打印'),
  export: author.value.includes('导出'),
}));

// 查询参数
const queryParams = ref<any>({
  formCode: '',
  sendDateStart: '',
  sendDateEnd: '',
  materialName: '',
  materialCode: '',
  manufacturerName: '',
  toCheckReason: '',
  statusList: ['1', '5', '2', '25', '3', '6', '36'],
  order: 2,
});

const dateRange = ref<any>(null);

// 状态选项
const statusOptions = [
  { label: $t('storeManagement.inspectionSlip.pendingInspection'), value: '1' },
  { label: $t('storeManagement.inspectionSlip.pendingReturn'), value: '5' },
  { label: $t('storeManagement.inspectionSlip.pendingWarehouse'), value: '2' },
  { label: $t('storeManagement.inspectionSlip.pendingReturnWarehouse'), value: '25' },
  { label: $t('storeManagement.inspectionSlip.warehoused'), value: '3' },
  { label: $t('storeManagement.inspectionSlip.returned'), value: '6' },
  { label: $t('storeManagement.inspectionSlip.warehousedReturned'), value: '36' },
];

// 选中的行
const selectedRows = ref<any[]>([]);
const selectedIds = ref<string[]>([]);

// 更新选中状态
function updateSelection() {
  const records = gridApi.grid?.getCheckboxRecords() || [];
  selectedRows.value = records;
  selectedIds.value = records.map((item: any) => item.id);
}

// 质检判定弹窗
const judgeVisible = ref(false);
const judgeFormId = ref<string>('');

// 批量判定弹窗
const batchJudgeVisible = ref(false);

// 待判原因弹窗
const toCheckReasonVisible = ref(false);

// 质检判定详情弹窗
const judgeDetailVisible = ref(false);

// 打印弹窗
const printVisible = ref(false);

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns: [
    { type: 'checkbox', width: 50 },
    {
      field: 'isSuspend',
      title: $t('storeManagement.inspectionSlip.isSuspend'),
      width: 60,
      slots: { default: 'isSuspend' },
    },
    {
      field: 'printNum',
      title: $t('storeManagement.inspectionSlip.printNum'),
      width: 80,
    },
    {
      field: 'labelStatus',
      title: $t('storeManagement.inspectionSlip.labelStatus'),
      width: 100,
      slots: { default: 'labelStatus' },
    },
    { field: 'materialCode', title: $t('storeManagement.labelPrint.materialCode'), width: 120 },
    { field: 'materialName', title: $t('storeManagement.labelPrint.materialName'), minWidth: 150 },
    { field: 'unit', title: $t('storeManagement.labelPrint.unit'), width: 60 },
    { field: 'receiveNumber', title: $t('storeManagement.inspectionSlip.arrivalNumber'), width: 80 },
    { field: 'manufacturerName', title: $t('storeManagement.labelPrint.manufacturerName'), minWidth: 150 },
    {
      field: 'checkResult',
      title: $t('storeManagement.inspectionSlip.checkResult'),
      width: 100,
      slots: { default: 'checkResult' },
    },
    { field: 'pasDescribe', title: $t('storeManagement.inspectionSlip.pasDescribe'), width: 100 },
    { field: 'toCheckReason', title: $t('storeManagement.inspectionSlip.toCheckReason'), minWidth: 150 },
    { field: 'checkUsername', title: $t('storeManagement.inspectionSlip.checkUsername'), width: 100 },
    { field: 'judgeTime', title: $t('storeManagement.inspectionSlip.judgeTime'), width: 100, slots: { default: 'judgeTime' } },
    { field: 'formCode', title: $t('storeManagement.labelPrint.formCode'), width: 130 },
    { field: 'sendDate', title: $t('storeManagement.inspectionSlip.sendDate'), width: 100 },
    { field: 'sendOrgName', title: $t('storeManagement.inspectionSlip.sendOrgName'), width: 120 },
    { field: 'sendUsername', title: $t('storeManagement.inspectionSlip.sendUsername'), width: 100 },
    { field: 'labelCode', title: $t('storeManagement.labelPrint.labelCode'), width: 150 },
    { field: 'formType', title: $t('storeManagement.labelPrint.formType'), width: 80 },
    { field: 'contractCode', title: $t('storeManagement.labelPrint.contractCode'), width: 120 },
    { field: 'checkNumber', title: $t('storeManagement.inspectionSlip.checkNumber'), width: 80 },
    { field: 'enterWarehouseNumber', title: $t('storeManagement.inspectionSlip.enterWarehouseNumber'), width: 80 },
    { field: 'rejectNumber', title: $t('storeManagement.inspectionSlip.rejectNumber'), width: 80 },
    { field: 'checkRemark', title: $t('storeManagement.inspectionSlip.checkRemark'), width: 100 },
    { field: 'warehouseName', title: $t('storeManagement.inspectionSlip.warehouseName'), width: 100 },
    { field: 'wareLocationName', title: $t('storeManagement.inspectionSlip.wareLocationName'), width: 100 },
    { field: 'validDate', title: $t('storeManagement.labelPrint.validDate'), width: 100 },
    { field: 'batchCode', title: $t('storeManagement.labelPrint.batchCode'), width: 120 },
    { field: 'produceDate', title: $t('storeManagement.labelPrint.produceDate'), width: 100 },
    { field: 'remark', title: $t('storeManagement.labelPrint.remark'), width: 120 },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 50,
    pageSizes: [10, 20, 50, 100],
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

    fetchQualityInspectionList(params)
      .then(({ total, results }) => {
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

// 质检判定
function handleJudge() {
  updateSelection();
  if (selectedIds.value.length !== 1) {
    message.warning($t('storeManagement.inspectionSlip.selectOneRecord'));
    return;
  }
  judgeFormId.value = selectedIds.value[0] || '';
  judgeVisible.value = true;
}

// 批量判定
function handleBatchJudge() {
  updateSelection();
  if (selectedIds.value.length === 0) {
    message.warning($t('storeManagement.inspectionSlip.selectData'));
    return;
  }
  batchJudgeVisible.value = true;
}

// 待判原因
function handleToCheckReason() {
  updateSelection();
  if (selectedIds.value.length === 0) {
    message.warning($t('storeManagement.inspectionSlip.selectData'));
    return;
  }
  toCheckReasonVisible.value = true;
}

// 取消判定
function handleCancelJudge() {
  updateSelection();
  if (selectedIds.value.length === 0) {
    message.warning($t('storeManagement.inspectionSlip.selectData'));
    return;
  }
  Modal.confirm({
    title: $t('common.prompt'),
    content: $t('storeManagement.inspectionSlip.confirmCancelJudge'),
    onOk: () => {
      cancelJudgeQualityInspection(selectedIds.value).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
  });
}

// 质检判定详情
function handleJudgeDetail() {
  updateSelection();
  if (selectedIds.value.length !== 1) {
    message.warning($t('storeManagement.inspectionSlip.selectOneRecord'));
    return;
  }
  judgeDetailVisible.value = true;
}

// 打印
function handlePrint() {
  updateSelection();
  if (selectedIds.value.length === 0) {
    message.warning($t('storeManagement.inspectionSlip.selectData'));
    return;
  }
  printVisible.value = true;
}

// 导出
function handleExport() {
  exportQualityInspection(queryParams.value).then((res: any) => {
    if (res) {
      window.location.href = res;
    }
  });
}

// 获取状态文本
function getStatusText(status: number) {
  const statusMap: Record<number, string> = {
    1: $t('storeManagement.inspectionSlip.pendingInspection'),
    2: $t('storeManagement.inspectionSlip.pendingWarehouse'),
    3: $t('storeManagement.inspectionSlip.warehoused'),
    4: $t('storeManagement.labelPrint.outOfStock'),
    5: $t('storeManagement.inspectionSlip.pendingReturn'),
    25: $t('storeManagement.inspectionSlip.pendingReturnWarehouse'),
    6: $t('storeManagement.inspectionSlip.returned'),
    26: $t('storeManagement.inspectionSlip.pendingReturned'),
    36: $t('storeManagement.inspectionSlip.warehousedReturned'),
  };
  return statusMap[status] || '';
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

// 初始化
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
        <FormItem :label="$t('storeManagement.inspectionSlip.formCode')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.formCode"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem :label="$t('storeManagement.inspectionSlip.sendDate')" style="margin-bottom: 1em">
          <DatePicker.RangePicker
            v-model:value="dateRange"
            style="width: 240px"
            @change="handleDateChange"
          />
        </FormItem>
        <FormItem :label="$t('storeManagement.inspectionSlip.materialName')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.materialName"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem :label="$t('storeManagement.inspectionSlip.materialCode')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.materialCode"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem :label="$t('storeManagement.labelPrint.manufacturerName')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.manufacturerName"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem :label="$t('storeManagement.inspectionSlip.toCheckReason')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.toCheckReason"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem :label="$t('storeManagement.inspectionSlip.status')" style="margin-bottom: 1em">
          <CheckboxGroup v-model:value="queryParams.statusList">
            <Checkbox v-for="item in statusOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </Checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="handleQuery">{{ $t('common.search') }}</Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <Space>
            <Button v-if="permissions.judge" type="primary" @click="handleJudge">
              {{ $t('storeManagement.inspectionSlip.qualityJudge') }}
            </Button>
            <Button v-if="permissions.batchJudge" type="primary" @click="handleBatchJudge">
              {{ $t('storeManagement.inspectionSlip.batchJudge') }}
            </Button>
            <Button v-if="permissions.noJudgeReason" type="primary" @click="handleToCheckReason">
              {{ $t('storeManagement.inspectionSlip.noJudgeReason') }}
            </Button>
            <Button v-if="permissions.cancelJudge" type="primary" @click="handleCancelJudge">
              {{ $t('storeManagement.inspectionSlip.cancelJudge') }}
            </Button>
            <Button v-if="permissions.judgeDetail" type="primary" @click="handleJudgeDetail">
              {{ $t('storeManagement.inspectionSlip.qualityJudgeDetail') }}
            </Button>
            <Button v-if="permissions.print" type="primary" @click="handlePrint">
              {{ $t('common.print') }}
            </Button>
            <Button v-if="permissions.export" type="primary" @click="handleExport">
              {{ $t('common.export') }}
            </Button>
          </Space>
        </template>
        <template #isSuspend="{ row }">
          <Checkbox :checked="row.isSuspend" disabled />
        </template>
        <template #labelStatus="{ row }">
          {{ getStatusText(row.labelStatus) }}
        </template>
        <template #checkResult="{ row }">
          {{ getCheckResultText(row.checkResult) }}
        </template>
        <template #judgeTime="{ row }">
          {{ row.judgeTime?.slice(0, 10) || '' }}
        </template>
      </Grid>
    </Card>

    <!-- 质检判定 -->
    <QualityJudgeDrawer
      v-model:visible="judgeVisible"
      :form-id="judgeFormId"
      @success="gridApi.reload()"
    />

    <!-- 批量判定 -->
    <BatchJudgeDrawer
      v-model:visible="batchJudgeVisible"
      :ids="selectedIds"
      @success="gridApi.reload()"
    />

    <!-- 待判原因 -->
    <ToCheckReasonDrawer
      v-model:visible="toCheckReasonVisible"
      :ids="selectedIds"
      @success="gridApi.reload()"
    />

    <!-- 质检判定详情 -->
    <QualityJudgeDetail
      v-model:visible="judgeDetailVisible"
      :form-id="selectedIds[0]"
    />

    <!-- 打印 -->
    <PrintDrawer
      v-model:visible="printVisible"
      :ids="selectedIds"
    />
  </Page>
</template>
