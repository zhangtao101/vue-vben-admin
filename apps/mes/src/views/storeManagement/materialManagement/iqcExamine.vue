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
import { batchAuditIqc, fetchIqcAuditList, revokeJudgeIqc } from '#/api';
import { queryAuth } from '#/util';
import IqcExamineDrawer from '#/util/component/iqcExamine/IqcExamineDrawer.vue';

// 权限
const route = useRoute();
const author = ref<string[]>([]);
const permissions = computed(() => ({
  pass: author.value.includes('通过'),
  noPass: author.value.includes('不通过'),
  cancel: author.value.includes('取消判定'),
  view: author.value.includes('查看'),
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
      title: $t('storeManagement.iqcExamine.auditStatus'),
      width: 100,
    },
    {
      field: 'checkResultText',
      title: $t('storeManagement.iqcExamine.checkResult'),
      width: 100,
    },
    {
      field: 'checkCode',
      title: $t('storeManagement.iqcExamine.checkCode'),
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
      title: $t('storeManagement.iqcExamine.receiveNumber'),
      width: 100,
    },
    {
      field: 'checkNumber',
      title: $t('storeManagement.iqcExamine.checkNumber'),
      width: 100,
    },
    {
      field: 'manufacturerName',
      title: $t('storeManagement.labelPrint.manufacturerName'),
      minWidth: 200,
    },
    {
      field: 'pasDescribe',
      title: $t('storeManagement.iqcExamine.pasDescribe'),
      width: 140,
    },
    {
      field: 'qcUser',
      title: $t('storeManagement.iqcExamine.qcUser'),
      width: 80,
    },
    {
      field: 'judgeTime',
      title: $t('storeManagement.iqcExamine.judgeTime'),
      width: 120,
    },
    {
      field: 'sendFormCode',
      title: $t('storeManagement.iqcExamine.sendFormCode'),
      width: 130,
    },
    {
      field: 'sendDate',
      title: $t('storeManagement.iqcExamine.sendDate'),
      width: 100,
    },
    {
      field: 'sendOrgName',
      title: $t('storeManagement.iqcExamine.sendOrgName'),
      width: 100,
    },
    {
      field: 'sendUserName',
      title: $t('storeManagement.iqcExamine.sendUserName'),
      width: 80,
    },
    {
      field: 'formType',
      title: $t('storeManagement.iqcExamine.formType'),
      width: 80,
    },
    {
      field: 'contractCode',
      title: $t('storeManagement.labelPrint.contractCode'),
      width: 100,
    },
    {
      field: 'remark',
      title: $t('storeManagement.iqcExamine.remark'),
      width: 120,
    },
    {
      field: 'action',
      title: $t('common.operation'),
      width: 80,
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

    fetchIqcAuditList(params)
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
          // 处理日期格式
          const judgeTime = item.judgeTime ? item.judgeTime.slice(0, 10) : '';
          const sendDate = item.sendDate ? item.sendDate.slice(0, 10) : '';

          return {
            ...item,
            checkResultText,
            judgeTime,
            sendDate,
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

// 查看
function handleView(row: any) {
  currentId.value = row.id;
  drawerVisible.value = true;
}

// 批量通过
function handlePass() {
  updateSelection();
  if (selectedIds.value.length === 0) {
    message.warning($t('storeManagement.iqcExamine.selectData'));
    return;
  }
  Modal.confirm({
    title: $t('common.prompt'),
    content: $t('storeManagement.iqcExamine.confirmPass'),
    onOk: () => {
      const data = selectedRows.value.map((item) => ({
        ...item,
        auditType: 2,
      }));
      batchAuditIqc(data).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
  });
}

// 批量不通过
function handleNoPass() {
  updateSelection();
  if (selectedIds.value.length === 0) {
    message.warning($t('storeManagement.iqcExamine.selectData'));
    return;
  }
  Modal.confirm({
    title: $t('common.prompt'),
    content: $t('storeManagement.iqcExamine.confirmNoPass'),
    onOk: () => {
      const data = selectedRows.value.map((item) => ({
        ...item,
        auditType: 3,
      }));
      batchAuditIqc(data).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
  });
}

// 取消判定
function handleCancel() {
  updateSelection();
  if (selectedIds.value.length === 0) {
    message.warning($t('storeManagement.iqcExamine.selectData'));
    return;
  }
  Modal.confirm({
    title: $t('common.prompt'),
    content: $t('storeManagement.iqcExamine.confirmCancel'),
    onOk: () => {
      revokeJudgeIqc(selectedIds.value).then(() => {
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
          :label="$t('storeManagement.iqcExamine.checkCode')"
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
          :label="$t('storeManagement.iqcExamine.judgeTime')"
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
          :label="$t('storeManagement.iqcExamine.checkResult')"
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
            <Button v-if="permissions.pass" type="primary" @click="handlePass">
              {{ $t('storeManagement.iqcExamine.pass') }}
            </Button>
            <Button
              v-if="permissions.noPass"
              type="primary"
              @click="handleNoPass"
            >
              {{ $t('storeManagement.iqcExamine.noPass') }}
            </Button>
            <Button
              v-if="permissions.cancel"
              type="primary"
              @click="handleCancel"
            >
              {{ $t('storeManagement.iqcExamine.cancel') }}
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
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 查看抽屉 -->
    <IqcExamineDrawer
      v-model:visible="drawerVisible"
      :id="currentId"
      @success="gridApi.reload()"
    />
  </Page>
</template>
