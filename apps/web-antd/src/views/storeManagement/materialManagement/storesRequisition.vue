<script setup lang="ts">
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import {
  MaterialSymbolsDeleteOutline,
  MaterialSymbolsSearch,
  MingcuteEditLine,
  PhEyeLight,
} from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  RadioGroup,
  RangePicker,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { queryStoreRequisition, queryStoreRequisitionTyle } from '#/api';
import {
  MATERIAL_REQUISITION_STATUS_TYPE,
  queryAuth,
  TYPE_OF_MATERIAL_REQUISITION_PROGRESS,
} from '#/util';

// 路由信息
const route = useRoute();
// region 表格

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { type: 'checkbox', width: 60 },
    {
      field: 'isFinish',
      slots: { default: 'selectedState' },
      title: '完成',
      minWidth: 50,
    },
    {
      field: 'isSuspend',
      slots: { default: 'selectedState' },
      title: '中止',
      minWidth: 50,
    },
    {
      field: 'isSign',
      slots: { default: 'selectedState' },
      title: '签发',
      minWidth: 50,
    },
    {
      field: 'isLock',
      slots: { default: 'selectedState' },
      title: '锁定',
      minWidth: 50,
    },
    { field: 'applyCode', title: '申请编号', minWidth: 150 },
    { field: 'applyDate', title: '申请日期', minWidth: 150 },
    { field: 'requireDate', title: '需求日期', minWidth: 150 },
    { field: 'applyTypeName', title: '申请类别', minWidth: 150 },
    { field: 'materialCode', title: '材料编号', minWidth: 150 },
    { field: 'materialName', title: '材料名称', minWidth: 250 },
    { field: 'unit', title: '单位', minWidth: 150 },
    { field: 'applyNumber', title: '申请数量', minWidth: 150 },
    { field: 'receiveNumber', title: '已领数量', minWidth: 150 },
    { field: 'unclaimedQuantity', title: '未领数量', minWidth: 150 },
    { field: 'remark', title: '备注说明', minWidth: 250 },
    { field: 'planCode', title: '计划号', minWidth: 150 },
    { field: 'username', title: '所属用户', minWidth: 150 },
    { field: 'applyOrgName', title: '申请部门', minWidth: 150 },
    { field: 'dutyOrgName', title: '责任部门', minWidth: 150 },
    { field: 'lockPerson', title: '锁定人', minWidth: 150 },
    { field: 'lockTime', title: '锁定时间', minWidth: 150 },
    { field: 'signPersonName', title: '签发人', minWidth: 150 },
    { field: 'signTime', title: '签发时间', minWidth: 150 },
    { field: 'suspendPersonName', title: '中止人', minWidth: 150 },
    { field: 'suspendTime', title: '中止时间', minWidth: 150 },
    { field: 'operatorName', title: '操作人', minWidth: 150 },
    { field: 'operateTime', title: '操作时间', minWidth: 150 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 250,
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          page: page?.currentPage,
          pageSize: page?.pageSize,
        });
      },
    },
  },
  scrollY: {
    enabled: true,
    gt: 30,
  },
  scrollX: {
    enabled: true,
    gt: 0,
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 查询参数
const queryParams = ref<any>({
  workstationCode: '',
  workstationName: '',
});

/**
 * 从服务器查询工作站数据的函数。
 * @param {object} params - 查询参数，包含页码和每页大小。
 * @returns {Promise} - 包含总条数和数据列表的 Promise 对象。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams.value, // 展开 queryParams.value 中的所有查询参数
      pageNum: page, // 当前页码
      pageSize, // 每页显示的数据条数
    };

    if (params.times) {
      params.applyDateStart = params.times[0].format('YYYY-MM-DD');
      params.applyDateEnd = params.times[1].format('YYYY-MM-DD');
      params.times = undefined;
    }

    // 调用 queryWorkstation API 函数，传递查询参数和分页信息
    queryStoreRequisition(params)
      .then(({ total, results }) => {
        results.forEach((item: any) => {
          item.unclaimedQuantity = item.applyNumber - item.receiveNumber;
        });
        // 成功获取数据后，更新数据列表和总条数
        resolve({
          total, // 总条数
          items: results, // 数据列表
        });
      })
      .catch((error) => {
        // 处理错误
        reject(error);
      });
  });
}

// endregion

// region 新增/编辑/删除

function editRow(row?: any) {
  console.log(row);
}

function delRow(row?: any) {
  console.log(row);
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 申请类别查询
// 申请类别列表
const listOfApplicationCategories = ref<any>([]);

/**
 * 查询申请类别列表
 */
function queryApplicationCategories() {
  queryStoreRequisitionTyle().then((data) => {
    listOfApplicationCategories.value = [];
    data.forEach((item: any) => {
      listOfApplicationCategories.value.push({
        label: item.name,
        value: item.id,
      });
    });
  });
}

// endregion

onMounted(async () => {
  try {
    queryApplicationCategories();
    queryAuth(route.meta.code as string).then((data) => {
      author.value = data;
    });
  } catch {
    // 统一处理错误
    message.error('数据加载失败，请重试');
  }
});
</script>

<template>
  <Page class="bg-background-deep">
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 申请编号 -->
        <FormItem
          :label="$t('storesRequisition.applicationNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.applyCode" />
        </FormItem>
        <!-- 申请日期 -->
        <FormItem
          :label="$t('storesRequisition.applicationDate')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.times" />
        </FormItem>
        <!-- 材料名称 -->
        <FormItem
          :label="$t('storesRequisition.materialName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialName" />
        </FormItem>
        <!-- 材料编号 -->
        <FormItem
          :label="$t('storesRequisition.materialNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialCode" />
        </FormItem>
        <!-- 申请类别 -->
        <FormItem
          :label="$t('storesRequisition.categoryOfApplication')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.applyType"
            :options="listOfApplicationCategories"
            class="!w-48"
          />
        </FormItem>
        <!-- 领料进度 -->
        <FormItem
          :label="$t('storesRequisition.materialRequisitionProgress')"
          style="margin-bottom: 1em"
        >
          <CheckboxGroup
            v-model:value="queryParams.progress"
            :options="TYPE_OF_MATERIAL_REQUISITION_PROGRESS"
          />
        </FormItem>
        <!-- 领料状态 -->
        <FormItem
          :label="$t('storesRequisition.materialRequisitionStatus')"
          style="margin-bottom: 1em !important"
        >
          <RadioGroup
            v-model:value="queryParams.complete"
            :options="MATERIAL_REQUISITION_STATUS_TYPE"
          />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MaterialSymbolsSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="() => gridApi.reload()"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 表格主体 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <Space>
            <!-- 新增按钮 -->
            <Button
              v-if="author.includes('新增')"
              type="primary"
              @click="editRow()"
            >
              {{ $t('common.add') }}
            </Button>
            <!-- 锁定按钮 -->
            <Button
              v-if="author.includes('锁定')"
              type="primary"
              @click="editRow()"
            >
              {{ $t('common.lock') }}
            </Button>
            <!-- 签发按钮 -->
            <Button
              v-if="author.includes('签发')"
              type="primary"
              @click="editRow()"
            >
              {{ $t('common.signAndIssue') }}
            </Button>
            <!-- 取消锁定按钮 -->
            <Button
              v-if="author.includes('取消锁定')"
              type="primary"
              @click="editRow()"
            >
              {{ $t('common.unlock') }}
            </Button>
            <!-- 取消签发按钮 -->
            <Button
              v-if="author.includes('取消签发')"
              type="primary"
              @click="editRow()"
            >
              {{ $t('common.cancelIssuance') }}
            </Button>
            <!-- 中止按钮 -->
            <Button
              v-if="author.includes('中止')"
              type="primary"
              @click="editRow()"
            >
              {{ $t('common.abort') }}
            </Button>
            <!-- ERP单据按钮 -->
            <Button
              v-if="author.includes('ERP单据')"
              type="primary"
              @click="editRow()"
            >
              {{ $t('common.erpDocument') }}
            </Button>
            <!-- 24*28打印按钮 -->
            <Button
              v-if="author.includes('24*28打印')"
              type="primary"
              @click="editRow()"
            >
              24*28&nbsp;{{ $t('common.print') }}
            </Button>
            <!-- 24*14打印按钮 -->
            <Button
              v-if="author.includes('24*14打印')"
              type="primary"
              @click="editRow()"
            >
              24*14&nbsp;{{ $t('common.print') }}
            </Button>
            <!-- 导出按钮 -->
            <Button
              v-if="author.includes('导出')"
              type="primary"
              @click="editRow()"
            >
              {{ $t('common.export') }}
            </Button>
          </Space>
        </template>
        <template #selectedState="{ row, column }">
          <Checkbox v-model:checked="row[column.field]" disabled />
        </template>
        <template #action="{ row }">
          <!-- 查看按钮 -->
          <Tooltip>
            <template #title>{{ $t('common.view') }}</template>
            <Button
              :icon="h(PhEyeLight, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="editRow(row, true)"
            />
          </Tooltip>
          <!-- 编辑按钮 -->
          <Tooltip v-if="author.includes('编辑')">
            <template #title>{{ $t('common.edit') }}</template>
            <Button
              :icon="h(MingcuteEditLine, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="editRow(row)"
            />
          </Tooltip>

          <!-- 删除数据 -->
          <Tooltip v-if="author.includes('删除')">
            <template #title>{{ $t('common.delete') }}</template>
            <Button
              :icon="
                h(MaterialSymbolsDeleteOutline, {
                  class: 'inline-block size-6',
                })
              "
              danger
              type="link"
              @click="delRow(row)"
            />
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
