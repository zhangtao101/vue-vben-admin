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
  deleteIpcReport,
  exportIpcReport,
  fetchIpcReportList,
  revokeIpcReport,
  submitIpcReport,
} from '#/api';
import { queryAuth } from '#/util';
import IpcReportDrawer from '#/util/component/ipcReport/IpcReportDrawer.vue';

// 权限
const route = useRoute();
const author = ref<string[]>([]);
const permissions = computed(() => ({
  add: author.value.includes('新增'),
  edit: author.value.includes('编辑'),
  delete: author.value.includes('删除'),
  submit: author.value.includes('提交'),
  revoke: author.value.includes('撤回'),
}));

// 查询参数
const queryParams = ref<any>({
  checkCode: '',
  startTime: '',
  endTime: '',
  materialName: '',
  materialCode: '',
  manufacturerName: '',
  checkResult: '',
});

const dateRange = ref<any>(null);

// 选中的行
const selectedRows = ref<any[]>([]);
const selectedIds = ref<string[]>([]);

// 质检结论选项
const checkResultOptions = [
  { value: 1, label: $t('storeManagement.inspectionSlip.qualified') },
  { value: 2, label: $t('storeManagement.inspectionSlip.unqualified') },
  { value: 3, label: $t('storeManagement.inspectionSlip.concessionAccept') },
  { value: 4, label: $t('storeManagement.inspectionSlip.emergencyRelease') },
];

// 更新选中状态
function updateSelection() {
  const records = gridApi.grid?.getCheckboxRecords() || [];
  selectedRows.value = records;
  selectedIds.value = records.map((item: any) => item.id);
}

// 抽屉状态
const drawerVisible = ref(false);
const drawerMode = ref<'create' | 'update' | 'view'>('create');
const currentId = ref<string>('');

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
      field: 'auditStatusText',
      title: $t('storeManagement.ipcReport.auditStatus'),
      width: 100,
    },
    {
      field: 'checkResultText',
      title: $t('storeManagement.ipcReport.checkResult'),
      width: 100,
    },
    {
      field: 'checkCode',
      title: $t('storeManagement.ipcReport.checkCode'),
      width: 130,
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
    },
    { field: 'unit', title: $t('storeManagement.labelPrint.unit'), width: 60 },
    {
      field: 'receiveNumber',
      title: $t('storeManagement.ipcReport.receiveNumber'),
      width: 100,
    },
    {
      field: 'checkNumber',
      title: $t('storeManagement.ipcReport.checkNumber'),
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
      field: 'qcUser',
      title: $t('storeManagement.ipcReport.qcUser'),
      width: 80,
    },
    {
      field: 'judgeTime',
      title: $t('storeManagement.ipcReport.judgeTime'),
      width: 120,
    },
    {
      field: 'sendFormCode',
      title: $t('storeManagement.ipcReport.sendFormCode'),
      width: 130,
    },
    {
      field: 'sendDate',
      title: $t('storeManagement.ipcReport.sendDate'),
      width: 100,
    },
    {
      field: 'sendOrgName',
      title: $t('storeManagement.ipcReport.sendOrgName'),
      width: 100,
    },
    {
      field: 'sendUserName',
      title: $t('storeManagement.ipcReport.sendUserName'),
      width: 80,
    },
    {
      field: 'formType',
      title: $t('storeManagement.ipcReport.formType'),
      width: 80,
    },
    {
      field: 'contractCode',
      title: $t('storeManagement.labelPrint.contractCode'),
      width: 100,
    },
    {
      field: 'remark',
      title: $t('storeManagement.ipcReport.remark'),
      width: 120,
    },
    {
      field: 'action',
      title: $t('common.operation'),
      width: 150,
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

    fetchIpcReportList(params)
      .then(({ total, results }: any) => {
        // 处理质检结论文本
        const list = results.map((item: any) => {
          let checkResultText = '';
          switch (item.checkResult) {
            case 1: {
              checkResultText = $t('storeManagement.inspectionSlip.qualified');
              break;
            }
            case 2: {
              checkResultText = $t(
                'storeManagement.inspectionSlip.unqualified',
              );
              break;
            }
            case 3: {
              checkResultText = $t(
                'storeManagement.inspectionSlip.concessionAccept',
              );
              break;
            }
            case 4: {
              checkResultText = $t(
                'storeManagement.inspectionSlip.emergencyRelease',
              );
              break;
            }
          }
          return {
            ...item,
            checkResultText,
          };
        });

        resolve({
          total,
          items: list,
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
    queryParams.value.startTime = dateStrings[0];
    queryParams.value.endTime = dateStrings[1];
  } else {
    queryParams.value.startTime = '';
    queryParams.value.endTime = '';
  }
}

// 查询
function handleQuery() {
  gridApi.reload();
}

// 新增
function handleCreate() {
  drawerMode.value = 'create';
  currentId.value = '';
  drawerVisible.value = true;
}

// 编辑
function handleUpdate(row: any) {
  drawerMode.value = 'update';
  currentId.value = row.id;
  drawerVisible.value = true;
}

// 查看
function handleView(row: any) {
  drawerMode.value = 'view';
  currentId.value = row.id;
  drawerVisible.value = true;
}

// 删除
function handleDelete(row: any) {
  Modal.confirm({
    title: $t('common.prompt'),
    content: $t('storeManagement.labelPrint.confirmDeleteRecord'),
    onOk: () => {
      deleteIpcReport(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
  });
}

// 导出
function handleExport() {
  exportIpcReport(queryParams.value).then((res: any) => {
    if (res) {
      window.location.href = res;
    }
  });
}

// 提交
function handleSubmit() {
  updateSelection();
  if (selectedIds.value.length === 0) {
    message.warning($t('storeManagement.ipcReport.selectData'));
    return;
  }
  Modal.confirm({
    title: $t('common.prompt'),
    content: $t('storeManagement.ipcReport.confirmSubmit'),
    onOk: () => {
      submitIpcReport(selectedIds.value).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
  });
}

// 撤回
function handleRevoke() {
  updateSelection();
  if (selectedIds.value.length === 0) {
    message.warning($t('storeManagement.ipcReport.selectData'));
    return;
  }
  Modal.confirm({
    title: $t('common.prompt'),
    content: $t('storeManagement.ipcReport.confirmRevoke'),
    onOk: () => {
      revokeIpcReport(selectedIds.value).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
  });
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
          :label="$t('storeManagement.ipcReport.checkCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.checkCode"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.ipcReport.judgeTime')"
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
        <FormItem
          :label="$t('storeManagement.ipcReport.checkResult')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.checkResult"
            :placeholder="$t('common.pleaseSelect')"
            style="width: 150px"
            :options="checkResultOptions"
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
    <Card>
      <Grid>
        <template #toolbar-tools>
          <Space>
            <Button v-if="permissions.add" type="primary" @click="handleCreate">
              {{ $t('storeManagement.ipcReport.add') }}
            </Button>
            <Button type="primary" @click="handleExport">
              {{ $t('common.export') }}
            </Button>
            <Button
              v-if="permissions.submit"
              type="primary"
              @click="handleSubmit"
            >
              {{ $t('storeManagement.ipcReport.submit') }}
            </Button>
            <Button
              v-if="permissions.revoke"
              type="primary"
              @click="handleRevoke"
            >
              {{ $t('storeManagement.ipcReport.revoke') }}
            </Button>
          </Space>
        </template>
        <template #action="{ row }">
          <Space>
            <Tooltip>
              <template #title>{{ $t('common.view') }}</template>
              <Button type="link" class="px-1" @click="handleView(row)">
                <Icon
                  icon="mdi:eye-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="permissions.edit && !row.upButto">
              <template #title>{{ $t('common.edit') }}</template>
              <Button type="link" class="px-1" @click="handleUpdate(row)">
                <Icon
                  icon="mdi:edit"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="permissions.delete && !row.upButto">
              <template #title>{{ $t('common.delete') }}</template>
              <Button
                type="link"
                danger
                class="px-1"
                @click="handleDelete(row)"
              >
                <Icon
                  icon="mdi:delete-forever-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 新增/编辑/查看抽屉 -->
    <IpcReportDrawer
      v-model:visible="drawerVisible"
      :mode="drawerMode"
      :id="currentId"
      @success="gridApi.reload()"
    />
  </Page>
</template>
