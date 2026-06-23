<script lang="ts" setup>
/**
 * [INPUT]: 依赖 #/api (smtWorksheetSearch/smtWorksheetDelete/smtWorksheetExport/
 *         smtDownloadTemplate/smtAllLineList)、
 *         #/util (queryAuth)、#/locales ($t)、
 *         planManagementDrawer 目录组件 (WorkSheetDrawer/BarcodePrintModal)
 * [OUTPUT]: 对外提供 SMTmanagement 页面组件，提供工单管理 CRUD、导出、上传、打印、条码打印等功能
 * [POS]: 属于计划管理(planManagement)模块的 SMT 工单列表主页面，通过路由 /planManagement/SMTmanagement 访问
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-06-18 10:43:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
import { useAccessStore } from '@vben/stores';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  message,
  Popconfirm,
  RangePicker,
  Select,
  Space,
  Tooltip,
  Upload,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  smtAllLineList,
  smtDownloadTemplate,
  smtWorksheetDelete,
  smtWorksheetExport,
  smtWorksheetSearch,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

import WorkSheetDrawer from '../../util/component/planManagementDrawer/WorkSheetDrawer.vue';

// 路由信息
const route = useRoute();
const accessStore = useAccessStore();

// region 权限
const author = ref<string[]>([]);
// endregion

// region 线别下拉
const lineOptions = ref<any[]>([]);

function loadLineOptions() {
  smtAllLineList(1).then((res: any) => {
    lineOptions.value = (Array.isArray(res) ? res : []).map((item: any) => ({
      value: item.id,
      label: item.lineName,
    }));
  });
}
// endregion

// region 查询参数
const queryParams = ref<any>({
  workSheetCode: '',
  plannedTime: [],
  planCode: '',
  productCode: '',
  productName: '',
  lineId: undefined,
});

const isAsc = ref<boolean>(false);
// endregion

// region 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50, minWidth: 50 },
    {
      field: 'workSheetCode',
      title: $t('SMTmanagement.workOrderNumber'),
      minWidth: 150,
    },
    {
      field: 'planDateStart',
      title: $t('SMTmanagement.plannedTime'),
      minWidth: 130,
    },
    { field: 'planCode', title: $t('SMTmanagement.planNumber'), minWidth: 150 },
    {
      field: 'lineName',
      title: $t('SMTmanagement.taskLine'),
      minWidth: 110,
    },
    {
      field: 'subProductName',
      title: $t('SMTmanagement.subProductName'),
      minWidth: 200,
      showOverflow: true,
    },
    { field: 'sideNo', title: $t('SMTmanagement.sideNo'), minWidth: 100 },
    {
      field: 'workSheetPlanNumber',
      title: $t('SMTmanagement.workSheetPlanNumber'),
      minWidth: 110,
    },
    {
      field: 'workSheetFinishNumber',
      title: $t('SMTmanagement.workSheetFinishNumber'),
      minWidth: 110,
    },
    {
      field: 'productName',
      title: $t('SMTmanagement.productName'),
      minWidth: 200,
      showOverflow: true,
    },
    {
      field: 'subPlanNumber',
      title: $t('SMTmanagement.subPlanNumber'),
      minWidth: 110,
    },
    {
      field: 'productCode',
      title: $t('SMTmanagement.productNumber'),
      minWidth: 100,
    },
    {
      field: 'worksheetCodea',
      title: $t('SMTmanagement.worksheetCodea'),
      minWidth: 110,
    },
    {
      field: 'subProductCode',
      title: $t('SMTmanagement.subProductCode'),
      minWidth: 150,
    },
    {
      field: 'subPlanCode',
      title: $t('SMTmanagement.subPlanCode'),
      minWidth: 150,
    },
    {
      field: 'produceUnarrangedNumber',
      title: $t('SMTmanagement.produceUnarrangedNumber'),
      minWidth: 110,
    },
    {
      field: 'produceNotFinishNumber',
      title: $t('SMTmanagement.produceNotFinishNumber'),
      minWidth: 110,
    },
    {
      field: 'produceWorkshop',
      title: $t('SMTmanagement.produceWorkshop'),
      minWidth: 100,
    },
    { field: 'remark', title: $t('SMTmanagement.remark'), minWidth: 100 },
    {
      field: 'updateUsername',
      title: $t('SMTmanagement.updateUsername'),
      minWidth: 100,
    },
    {
      field: 'updateTime',
      title: $t('SMTmanagement.updateTime'),
      minWidth: 150,
      slots: { default: 'updateTimeSlot' },
    },
    {
      field: 'action',
      title: $t('common.action'),
      fixed: 'right',
      minWidth: 280,
      slots: { default: 'action' },
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: { multiple: true },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        return await queryData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {
  sortChange: ({ sortList }: any) => {
    if (sortList && sortList.length > 0) {
      isAsc.value = sortList[0].order === 'asc';
      gridApi.reload();
    }
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });
// endregion

// region 查询数据
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = {
      ...queryParams.value,
      processType: 1,
      isAsc: isAsc.value ? 1 : 2,
    };
    // 处理日期范围
    if (params.plannedTime && params.plannedTime.length === 2) {
      params.planDateStart = dayjs(params.plannedTime[0]).format('YYYY-MM-DD');
      params.planDateEnd = dayjs(params.plannedTime[1]).format('YYYY-MM-DD');
    }
    delete params.plannedTime;

    smtWorksheetSearch({
      ...params,
      pageNum: page,
      pageSize,
    })
      .then((res: any) => {
        resolve({
          total: res?.total ?? 0,
          items: res?.results ?? res?.list ?? [],
        });
      })
      .catch((error: any) => reject(error));
  });
}
// endregion

// region 导出
function handleExport() {
  const params: any = { ...queryParams.value, processType: 1, isAsc: isAsc.value ? 1 : 2 };
  if (params.plannedTime && params.plannedTime.length === 2) {
    params.planDateStart = dayjs(params.plannedTime[0]).format('YYYY-MM-DD');
    params.planDateEnd = dayjs(params.plannedTime[1]).format('YYYY-MM-DD');
  }
  delete params.plannedTime;
  smtWorksheetExport({ ...params, pageNum: 1, pageSize: 1_040_000 }).then((res: any) => {
    if (res) window.open(res, '_blank');
  });
}
// endregion

// region 模板下载
function handleDownloadTemplate() {
  smtDownloadTemplate().then((res: any) => {
    if (res) window.open(res, '_blank');
  });
}
// endregion

// region 上传
const headers = ref<any>({
  Authorization: accessStore.accessToken,
});
const action = ref<string>(
  `/ht/${import.meta.env.VITE_GLOB_MES_MAIN}/plan/worksheet/saveByExcel`,
);
const fileList = ref<any>([]);

function handleUploadChange(info: any) {
  if (info.file.status === 'done') {
    gridApi.reload();
    message.success($t('page.common.uploadSuccess'));
  } else if (info.file.status === 'error') {
    const errorMessage = info.file.response?.message || $t('planManagement.uploadFailed');
    message.error(errorMessage);
  }
}
// endregion

// region 正序/反序
function handleAsc() {
  isAsc.value = true;
  gridApi.reload();
}
function handleDesc() {
  isAsc.value = false;
  gridApi.reload();
}
// endregion

// region 新增/编辑/修改时间
const workSheetDrawerRef = ref();

function handleCreate() {
  workSheetDrawerRef.value.open('create');
}

function handleUpdate(row: any) {
  workSheetDrawerRef.value.open('update', row);
}

function handleTimeChange(row: any) {
  workSheetDrawerRef.value.open('timeChange', row);
}
// endregion

// region 删除
function handleDelete(row: any) {
  smtWorksheetDelete(row.id).then(() => {
    message.success($t('SMTmanagement.deleteSuccess'));
    gridApi.reload();
  });
}
// endregion

// region 条码打印
function handleBarcodePrint(_row: any) {
  message.info($t('planManagement.printNotReady'));
}
// endregion

// region 打印
function handlePrint() {
  message.info($t('planManagement.printNotReady'));
}
// endregion

// region 初始化
onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  loadLineOptions();
});
// endregion
</script>

<template>
  <Page>
    <!-- 搜索区域 -->
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem :label="$t('SMTmanagement.workOrderNumber')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.workSheetCode" />
        </FormItem>
        <FormItem :label="$t('SMTmanagement.plannedTime')" style="margin-bottom: 1em">
          <RangePicker v-model:value="queryParams.plannedTime" />
        </FormItem>
        <FormItem :label="$t('SMTmanagement.planNumber')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.planCode" />
        </FormItem>
        <FormItem :label="$t('SMTmanagement.productNumber')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.productCode" />
        </FormItem>
        <FormItem :label="$t('SMTmanagement.productName')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.productName" />
        </FormItem>
        <FormItem :label="$t('SMTmanagement.taskLine')" style="margin-bottom: 1em">
          <Select
            v-model:value="queryParams.lineId"
            :options="lineOptions"
            :placeholder="$t('baseInfo.selectPlaceholder')"
            allow-clear
            style="width: 180px"
          />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="() => gridApi.reload()"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid>
        <template #toolbar-actions>
          <Space>
            <!-- 新增 -->
            <Button
              v-if="author.includes('新增')"
              type="primary"
              @click="handleCreate"
            >
              {{ $t('common.add') }}
            </Button>
            <!-- 导出 -->
            <Button
              v-if="author.includes('导出')"
              type="primary"
              @click="handleExport"
            >
              {{ $t('common.export') }}
            </Button>
            <!-- 打印 -->
            <Button
              v-if="author.includes('打印')"
              type="primary"
              @click="handlePrint"
            >
              {{ $t('SMTmanagement.print') }}
            </Button>
            <!-- 正序 -->
            <Button type="primary" @click="handleAsc">
              {{ $t('SMTmanagement.ascending') }}
            </Button>
            <!-- 反序 -->
            <Button type="primary" @click="handleDesc">
              {{ $t('SMTmanagement.descending') }}
            </Button>
            <!-- 上传 -->
            <Upload
              v-if="author.includes('编辑')"
              v-model:file-list="fileList"
              :action="action"
              :headers="headers"
              :show-upload-list="false"
              name="file"
              @change="handleUploadChange"
            >
              <Button type="primary">
                {{ $t('SMTmanagement.upload') }}
              </Button>
            </Upload>
            <!-- 模板下载 -->
            <Button
              v-if="author.includes('编辑')"
              type="primary"
              @click="handleDownloadTemplate"
            >
              {{ $t('SMTmanagement.templateDownload') }}
            </Button>
          </Space>
        </template>

        <!-- 操作时间 -->
        <template #updateTimeSlot="{ row }">
          <span>{{ row.updateTime == null ? row.createTime : row.updateTime }}</span>
        </template>

        <!-- 操作列 -->
        <template #action="{ row }">
          <!-- 编辑 -->
          <Tooltip v-if="author.includes('编辑')">
            <template #title>{{ $t('common.edit') }}</template>
            <Button type="link" @click="handleUpdate(row)">
              <Icon
                icon="mdi:edit-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 删除 -->
          <Tooltip v-if="author.includes('删除')">
            <template #title>{{ $t('common.delete') }}</template>
            <Popconfirm
              :cancel-text="$t('common.cancel')"
              :ok-text="$t('common.confirm')"
              :title="$t('SMTmanagement.deleteConfirm')"
              @confirm="handleDelete(row)"
            >
              <Button danger type="link">
                <Icon
                  icon="mdi-light:delete"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Popconfirm>
          </Tooltip>
          <!-- 条码打印 -->
          <Tooltip v-if="author.includes('条码打印')">
            <template #title>{{ $t('SMTmanagement.barcodePrint') }}</template>
            <Button type="link" @click="handleBarcodePrint(row)">
              <Icon
                icon="mdi:printer"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 修改时间 -->
          <Tooltip v-if="author.includes('修改时间')">
            <template #title>{{ $t('SMTmanagement.changeTime') }}</template>
            <Button type="link" @click="handleTimeChange(row)">
              <Icon
                icon="mdi:calendar-clock"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>

    <!-- 工单抽屉 -->
    <WorkSheetDrawer ref="workSheetDrawerRef" @refresh="() => gridApi.reload()" />
  </Page>
</template>


