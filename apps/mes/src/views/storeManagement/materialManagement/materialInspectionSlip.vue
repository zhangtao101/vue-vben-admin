<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Radio,
  RadioGroup,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteInspectionSlip,
  exportInspectionSlip,
  fetchInspectionSlipList,
  rejectInspectionSlip,
  sendInspectionSlip,
  suspendInspectionSlip,
  updateUrgent,
} from '#/api';
import { queryAuth } from '#/util';
import InspectionSlipForm from '#/util/component/materialInspectionSlip/InspectionSlipForm.vue';
import QualityJudgeDetail from '#/util/component/materialInspectionSlip/QualityJudgeDetail.vue';
import ReturnPrintDialog from '#/util/component/materialInspectionSlip/ReturnPrintDialog.vue';

// 权限
const route = useRoute();
const author = ref<string[]>([]);
const permissions = computed(() => ({
  add: author.value.includes('新增'),
  edit: author.value.includes('编辑'),
  delete: author.value.includes('删除'),
  suspend: author.value.includes('中止'),
  return: author.value.includes('退货'),
  judge: author.value.includes('质检判定详情'),
  export: author.value.includes('导出'),
  returnPrint: author.value.includes('退货打印'),
  urgent: author.value.includes('加急'),
  issue: author.value.includes('签发'),
}));

// 查询参数
const queryParams = ref<any>({
  formCodeStart: '',
  formCodeEnd: '',
  sendDateStart: '',
  sendDateEnd: '',
  materialName: '',
  materialCode: '',
  finishStatus: '2',
  statusList: ['1', '5', '2', '3', '25', '6', '26', '36'],
  order: 1,
});

const dateRange = ref<any>(null);

// 状态选项
const statusOptions = [
  { label: $t('storeManagement.inspectionSlip.pendingInspection'), value: '1' },
  { label: $t('storeManagement.inspectionSlip.pendingReturn'), value: '5' },
  { label: $t('storeManagement.inspectionSlip.pendingWarehouse'), value: '2' },
  { label: $t('storeManagement.inspectionSlip.warehoused'), value: '3' },
  {
    label: $t('storeManagement.inspectionSlip.pendingReturnWarehouse'),
    value: '25',
  },
  { label: $t('storeManagement.inspectionSlip.returned'), value: '6' },
  { label: $t('storeManagement.inspectionSlip.pendingReturned'), value: '26' },
  {
    label: $t('storeManagement.inspectionSlip.warehousedReturned'),
    value: '36',
  },
];

// 选中的行
const selectedRows = ref<any[]>([]);
const selectedIds = ref<any[]>([]);

// 更新选中状态
function updateSelection() {
  const records = gridApi.grid?.getCheckboxRecords() || [];
  selectedRows.value = records;
  selectedIds.value = records.map((item: any) => item.id);
}

// 表单弹窗
const formVisible = ref(false);
const formStatus = ref<'create' | 'update'>('create');
const formRow = ref<any>(null);

// 中止弹窗
const suspendVisible = ref(false);

// 质检判定详情弹窗
const judgeVisible = ref(false);

// 退货打印弹窗
const returnPrintVisible = ref(false);

// 表格行样式
const rowStyle = ({ row }: any) => {
  // 待退和待入/待退显示红色
  if (['5', '25'].includes(`${row.labelStatus}`)) {
    return { color: 'red' };
  }
  // 待入和已入显示绿色
  if (row.status === 2 || row.status === 3) {
    return { color: 'green' };
  }
  return {};
};

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
      field: 'labelStatus',
      title: $t('storeManagement.inspectionSlip.labelStatus'),
      width: 100,
      slots: { default: 'labelStatus' },
    },
    {
      field: 'sendDate',
      title: $t('storeManagement.inspectionSlip.sendDate'),
      width: 100,
    },
    {
      field: 'materialCode',
      title: $t('storeManagement.labelPrint.materialCode'),
      width: 120,
    },
    {
      field: 'materialName',
      title: $t('storeManagement.labelPrint.materialName'),
      minWidth: 150,
    },
    {
      field: 'sendNumber',
      title: $t('storeManagement.inspectionSlip.sendNumber'),
      width: 80,
    },
    {
      field: 'manufacturerName',
      title: $t('storeManagement.labelPrint.manufacturerName'),
      minWidth: 150,
    },
    {
      field: 'formCode',
      title: $t('storeManagement.labelPrint.formCode'),
      width: 130,
    },
    {
      field: 'enterWarehouseNumber',
      title: $t('storeManagement.inspectionSlip.enterWarehouseNumber'),
      width: 80,
    },
    {
      field: 'rejectNumber',
      title: $t('storeManagement.inspectionSlip.rejectNumber'),
      width: 80,
    },
    {
      field: 'checkRemark',
      title: $t('storeManagement.inspectionSlip.checkRemark'),
      width: 100,
    },
    {
      field: 'toCheckReason',
      title: $t('storeManagement.inspectionSlip.toCheckReason'),
      minWidth: 150,
    },
    {
      field: 'labelCode',
      title: $t('storeManagement.labelPrint.labelCode'),
      width: 150,
    },
    {
      field: 'packageNumber',
      title: $t('storeManagement.labelPrint.packageNumber'),
      width: 80,
    },
    {
      field: 'checkResult',
      title: $t('storeManagement.inspectionSlip.checkResult'),
      width: 100,
      slots: { default: 'checkResult' },
    },
    {
      field: 'formType',
      title: $t('storeManagement.labelPrint.formType'),
      width: 80,
    },
    {
      field: 'contractCode',
      title: $t('storeManagement.labelPrint.contractCode'),
      width: 120,
    },
    { field: 'unit', title: $t('storeManagement.labelPrint.unit'), width: 60 },
    {
      field: 'judgeTime',
      title: $t('storeManagement.inspectionSlip.judgeTime'),
      width: 100,
      slots: { default: 'judgeTime' },
    },
    {
      field: 'warehouseName',
      title: $t('storeManagement.inspectionSlip.warehouseName'),
      width: 100,
    },
    {
      field: 'wareLocationName',
      title: $t('storeManagement.inspectionSlip.wareLocationName'),
      width: 100,
    },
    {
      field: 'validDate',
      title: $t('storeManagement.labelPrint.validDate'),
      width: 100,
    },
    {
      field: 'batchCode',
      title: $t('storeManagement.labelPrint.batchCode'),
      width: 120,
    },
    {
      field: 'produceDate',
      title: $t('storeManagement.labelPrint.produceDate'),
      width: 100,
    },
    {
      field: 'sendOrgName',
      title: $t('storeManagement.inspectionSlip.sendOrgName'),
      width: 120,
    },
    {
      field: 'sendUsername',
      title: $t('storeManagement.inspectionSlip.sendUsername'),
      width: 100,
    },
    {
      field: 'remark',
      title: $t('storeManagement.labelPrint.remark'),
      width: 120,
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      slots: { default: 'action' },
    },
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
  rowStyle,
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

// 新增
function handleCreate() {
  formStatus.value = 'create';
  formRow.value = null;
  formVisible.value = true;
}

// 编辑
function handleEdit(row: any) {
  formStatus.value = 'update';
  formRow.value = row;
  formVisible.value = true;
}

// 删除
function handleDelete(row: any) {
  Modal.confirm({
    title: $t('storeManagement.labelPrint.confirmDelete'),
    content: $t('storeManagement.labelPrint.confirmDeleteRecord'),
    onOk: () => {
      deleteInspectionSlip(row.id).then(() => {
        message.success($t('storeManagement.labelPrint.deleteSuccess'));
        gridApi.reload();
      });
    },
  });
}

// 加急
function handleUrgent(row: any) {
  updateUrgent(row.id).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

// 中止
function handleSuspend() {
  updateSelection();
  if (selectedIds.value.length === 0) {
    message.warning($t('storeManagement.inspectionSlip.selectData'));
    return;
  }
  suspendVisible.value = true;
}

function confirmSuspend() {
  suspendInspectionSlip(selectedIds.value).then(() => {
    message.success($t('common.successfulOperation'));
    suspendVisible.value = false;
    gridApi.reload();
  });
}

// 退货
function handleReturn() {
  updateSelection();
  if (selectedIds.value.length !== 1) {
    message.warning($t('storeManagement.inspectionSlip.selectOneRecord'));
    return;
  }
  Modal.confirm({
    title: $t('common.prompt'),
    content: $t('storeManagement.inspectionSlip.confirmReturn'),
    onOk: () => {
      const id = selectedIds.value[0];
      if (!id) return;
      rejectInspectionSlip(id).then(() => {
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
  judgeVisible.value = true;
}

// 导出
function handleExport() {
  exportInspectionSlip(queryParams.value).then((res: any) => {
    if (res) {
      window.location.href = res;
    }
  });
}

// 退货打印
function handleReturnPrint() {
  updateSelection();
  if (selectedIds.value.length === 0) {
    message.warning($t('storeManagement.inspectionSlip.selectData'));
    return;
  }
  returnPrintVisible.value = true;
}

// 签发
function handleIssue() {
  updateSelection();
  if (selectedIds.value.length === 0) {
    message.warning($t('storeManagement.inspectionSlip.selectData'));
    return;
  }
  sendInspectionSlip(selectedIds.value).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
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

// 表单保存成功
function handleFormSuccess() {
  formVisible.value = false;
  gridApi.reload();
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
        <FormItem
          :label="$t('storeManagement.inspectionSlip.formCodeStart')"
          style="margin-bottom: 1em"
        >
          <Space>
            <Input
              v-model:value="queryParams.formCodeStart"
              :placeholder="$t('common.pleaseEnter')"
              style="width: 150px"
              allow-clear
            />
            <span>--</span>
            <Input
              v-model:value="queryParams.formCodeEnd"
              :placeholder="$t('common.pleaseEnter')"
              style="width: 150px"
              allow-clear
            />
          </Space>
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
          :label="$t('storeManagement.inspectionSlip.status')"
          style="margin-bottom: 1em"
        >
          <CheckboxGroup v-model:value="queryParams.statusList">
            <Checkbox
              v-for="item in statusOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </Checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem
          :label="$t('storeManagement.inspectionSlip.finishStatus')"
          style="margin-bottom: 1em"
        >
          <RadioGroup v-model:value="queryParams.finishStatus">
            <Radio value="2">
              {{ $t('storeManagement.inspectionSlip.all') }}
            </Radio>
            <Radio value="0">
              {{ $t('storeManagement.inspectionSlip.inProgress') }}
            </Radio>
            <Radio value="1">
              {{ $t('storeManagement.inspectionSlip.completed') }}
            </Radio>
          </RadioGroup>
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="handleQuery">
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <Space>
            <Button v-if="permissions.add" type="primary" @click="handleCreate">
              {{ $t('common.add') }}
            </Button>
            <Button
              v-if="permissions.suspend"
              type="primary"
              @click="handleSuspend"
            >
              {{ $t('storeManagement.inspectionSlip.suspend') }}
            </Button>
            <Button
              v-if="permissions.return"
              type="primary"
              @click="handleReturn"
            >
              {{ $t('storeManagement.inspectionSlip.returnGoods') }}
            </Button>
            <Button
              v-if="permissions.judge"
              type="primary"
              @click="handleJudgeDetail"
            >
              {{ $t('storeManagement.inspectionSlip.qualityJudgeDetail') }}
            </Button>
            <Button
              v-if="permissions.export"
              type="primary"
              @click="handleExport"
            >
              {{ $t('common.export') }}
            </Button>
            <Button
              v-if="permissions.returnPrint"
              type="primary"
              @click="handleReturnPrint"
            >
              {{ $t('storeManagement.inspectionSlip.returnPrint') }}
            </Button>
            <Button
              v-if="permissions.issue"
              type="primary"
              @click="handleIssue"
            >
              {{ $t('storeManagement.inspectionSlip.issue') }}
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
        <template #action="{ row }">
          <Space>
            <Tooltip v-if="permissions.edit">
              <template #title>{{ $t('common.edit') }}</template>
              <Button type="link" class="px-1" @click="handleEdit(row)">
                <Icon
                  icon="mdi:pencil-outline"
                  class="inline-block align-middle text-xl"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="permissions.delete">
              <template #title>{{ $t('common.delete') }}</template>
              <Button
                type="link"
                danger
                class="px-1"
                @click="handleDelete(row)"
              >
                <Icon
                  icon="mdi:delete-forever-outline"
                  class="inline-block align-middle text-xl"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="permissions.urgent && row.status !== 3">
              <template #title>
                {{ $t('storeManagement.inspectionSlip.urgent') }}
              </template>
              <Button
                type="link"
                danger
                class="px-1"
                @click="handleUrgent(row)"
              >
                <Icon
                  icon="mdi:send-outline"
                  class="inline-block align-middle text-xl"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 新增/编辑弹窗 -->
    <InspectionSlipForm
      v-model:visible="formVisible"
      :status="formStatus"
      :row="formRow"
      @success="handleFormSuccess"
    />

    <!-- 质检判定详情 -->
    <QualityJudgeDetail
      v-model:visible="judgeVisible"
      :form-id="selectedIds[0]"
    />

    <!-- 退货打印 -->
    <ReturnPrintDialog
      v-model:visible="returnPrintVisible"
      :form-ids="selectedIds"
    />

    <!-- 中止确认抽屉 -->
    <Drawer
      v-model:open="suspendVisible"
      :title="$t('common.prompt')"
      :footer-style="{ textAlign: 'right' }"
      width="400"
    >
      <p class="mb-4">
        {{ $t('storeManagement.inspectionSlip.confirmSuspend') }}
      </p>
      <template #footer>
        <Space>
          <Button @click="suspendVisible = false">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="primary" @click="confirmSuspend">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>
