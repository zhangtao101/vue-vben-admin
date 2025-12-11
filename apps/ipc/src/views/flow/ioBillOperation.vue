<script setup lang="ts">
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  RadioGroup,
  RangePicker,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { formStartEnout, listTodoFormEnout } from '#/api';
import { $t } from '#/locales';
import OperationDetails from '#/util/component/operationDetails.vue';

import 'vue3-json-viewer/dist/vue3-json-viewer.css';

// region 表格

/**
 * 主表格配置选项
 * 用于展示出入库单据列表，包含单据基本信息和操作按钮
 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'formCode', title: '单据编号', minWidth: 150 },
    { field: 'operateDate', title: '单据日期', minWidth: 150 },
    { field: 'enterOutName', title: '单据类型', minWidth: 150 },
    { field: 'outTypeName', title: '操作类型', minWidth: 150 },
    { field: 'auditStateName', title: '执行状态', minWidth: 150 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 300,
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
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

/**
 * 主表格事件监听器
 * 目前暂无特殊事件处理
 */
const gridEvents: VxeGridListeners<any> = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

/**
 * 创建主表格实例和API
 */
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// endregion
// region 主列表查询相关功能

/**
 * 主表格查询参数
 * 默认查询全部类型（-99）
 */
const queryParams = ref<any>({
  enterOut: -99,
});

/**
 * 单据类型筛选选项
 * 用于顶部搜索栏的类型筛选
 */
const outType = [
  {
    label: '全部',
    value: -99,
  },
  {
    label: '入库',
    value: 1,
  },
  {
    label: '出库',
    value: -1,
  },
];

/**
 * 主表格数据查询函数
 * 根据查询参数获取分页数据
 * @param page 当前页码
 * @param pageSize 每页显示数量
 * @returns Promise 返回分页数据
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params: any = {
      ...queryParams.value, // 展开所有查询参数
      pageNum: page, // 当前页码
      pageSize, // 每页显示的数据条数
    };

    // 处理单据类型：全部时不传该参数
    if (params.enterOut === -99) {
      delete params.enterOut;
    }

    // 处理时间范围查询
    if (params.searchTime && params.searchTime.length === 2) {
      params.operateDateStart = params.searchTime[0].format(
        'YYYY-MM-DD 00:00:00',
      );
      params.operateDateEnd = params.searchTime[1].format(
        'YYYY-MM-DD 23:59:59',
      );
    }

    // 调用接口获取数据
    listTodoFormEnout(params).then(({ total, list }) => {
      resolve({
        total,
        items: list,
      });
    });
  });
}

// endregion

// region 查看详情 / 开始作业
const operationDetailsRef = ref();

function viewRow(row: any, showOptions = false) {
  operationDetailsRef.value.openDrawer(row, showOptions);
}

function startJob(row: any, auto = false) {
  formStartEnout({
    formCode: row.formCode,
    opFuncationType: auto ? 1 : 2,
  }).then(() => {
    operationDetailsRef.value.openDrawer(row, !auto);
  });
}

// endregion
</script>

<template>
  <Page>
    <!-- region 顶部搜索区域 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 单据编号 -->
        <FormItem
          :label="$t('ioBillOperation.ioBillCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.formCode" />
        </FormItem>

        <!-- 单据类型 -->
        <FormItem
          :label="$t('ioBillOperation.ioBillType')"
          style="margin-bottom: 1em"
        >
          <RadioGroup v-model:value="queryParams.enterOut" :options="outType" />
        </FormItem>

        <!-- 物料编码 -->
        <FormItem
          :label="$t('ioBillOperation.materialCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialCode" />
        </FormItem>

        <!-- 物料名称 -->
        <FormItem
          :label="$t('ioBillOperation.materialName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialName" />
        </FormItem>
        <!-- 时间范围 -->
        <FormItem
          :label="$t('useEnergyThroughoutTheEntireSection.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.searchTime" />
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
    <!-- endregion -->

    <!-- region 主表格区域 -->
    <Card>
      <Grid>
        <template #action="{ row }">
          <!-- 查看详情 -->
          <Tooltip>
            <template #title>{{ $t('common.view') }}</template>
            <Button type="link" @click="viewRow(row)">
              <Icon icon="mdi:eye" class="inline-block align-middle text-2xl" />
            </Button>
          </Tooltip>
          <!-- 自动开工 -->
          <Tooltip v-if="[-1, 1].includes(row.formState) && row.taskType !== 2">
            <template #title>
              {{ $t('ioBillOperation.automatedJobs') }}
            </template>
            <Button type="link" @click="startJob(row, true)">
              <Icon
                icon="mdi:autorenew"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 手动开工 -->
          <Tooltip v-if="[-1, 1].includes(row.formState) && row.taskType !== 1">
            <template #title>{{ $t('ioBillOperation.manualJobs') }}</template>
            <Button type="link" @click="startJob(row, false)">
              <Icon
                icon="mdi:hand-double-tap"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- region 操作详情抽屉 -->
    <OperationDetails
      ref="operationDetailsRef"
      @close="() => gridApi.reload()"
    />
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
