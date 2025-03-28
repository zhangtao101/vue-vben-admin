<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  message,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

// region 工作站查询信息

// 查询条件
const queryParams = ref<any>({
  productionLineId: '',
  processId: '',
});

// endregion

// region 作业信息
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  rowConfig: {
    drag: true,
  },
  columns: [
    {
      title: '序号',
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    {
      field: '1',
      title: '工单编号',
      minWidth: 200,
      dragSort: true,
    },
    {
      field: '2',
      title: '产品编码',
      minWidth: 200,
    },
    {
      field: '3',
      title: '作业资源',
      minWidth: 200,
    },
    {
      field: '4',
      title: '工单状态',
      minWidth: 200,
    },
    {
      field: '5',
      title: '预计开始时间',
      minWidth: 200,
    },
    {
      field: '6',
      title: '预计结束时间',
      minWidth: 200,
    },
    {
      title: '操作',
      minWidth: 200,
      slots: {
        default: 'action',
      },
      fixed: 'right',
    },
  ],
  height: 400,
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

const gridEvents: any = {
  radioChange: ({ row }) => {
    message.info(`radioChange: ${row}`);
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// region 查询数据
// 查询参数
const jobInformationQueryConditions = ref({
  // 查询时间
  searchTime: [] as any,
  // 产品编码
  productCode: '',
  // 产品批号
  lineName: '',
});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params: any = { ...jobInformationQueryConditions.value };
    if (params.searchTime && params.searchTime.length === 2) {
      params.startTime = params.searchTime[0].format('YYYY-MM-DD');
      params.endTime = params.searchTime[1].format('YYYY-MM-DD');
      params.searchTime = undefined;
    }
    resolve({
      total: page * pageSize,
      items: [{}, {}, {}],
    });
    /* queryYXStopDayMXStatistics({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ statisticsDtos: { total, list }, ...p }) => {
        collect.value = p;
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total,
          items: list,
        });
      })
      .catch((error) => {
        reject(error);
      });*/
  });
}

/**
 * 重置查询条件
 */
function reload() {
  queryParams.value = {};
  gridApi.reload();
}

// endregion

// endregion
</script>

<template>
  <Page id="page">
    <Card class="mb-5">
      <!--工作中心 -->
      <FormItem :label="$t('workOrderEntry.workCenter')">
        <Input />
      </FormItem>
    </Card>

    <!-- region 表格内容 -->
    <Card class="mb-5">
      <Form layout="inline" :model="queryParams">
        <!--工单编号 -->
        <FormItem :label="$t('workOrderEntry.workOrderNumber')">
          <Input />
        </FormItem>
        <!--物料编码 -->
        <FormItem :label="$t('workOrderEntry.materialCode')">
          <Input />
        </FormItem>
        <!--工单状态 -->
        <FormItem :label="$t('workOrderEntry.workOrderStatus')">
          <Input />
        </FormItem>
        <FormItem>
          <Button type="primary" @click="gridApi.reload()" class="mr-4">
            {{ $t('common.search') }}
          </Button>
          <Button @click="reload()">
            {{ $t('common.reset') }}
          </Button>
        </FormItem>
      </Form>
      <Grid class="mt-4">
        <template #toolbar-tools> </template>
        <template #action>
          <!-- 进站 ="{ row }"-->
          <Tooltip>
            <template #title>{{ $t('workOrderEntry.pullIn') }}</template>
            <Button
              type="link"
              :icon="
                h(IconifyIcon, {
                  icon: 'mdi:check-underline',
                  class: 'inline-block text-2xl',
                })
              "
            />
          </Tooltip>
          <!-- 恢复 -->
          <Tooltip>
            <template #title>{{ $t('workOrderEntry.recover') }}</template>
            <Button
              type="link"
              :icon="
                h(IconifyIcon, {
                  icon: 'mdi:battery-sync-outline',
                  class: 'inline-block text-2xl',
                })
              "
            />
          </Tooltip>
          <!-- 暂停 -->
          <Tooltip>
            <template #title>{{ $t('workOrderEntry.pause') }}</template>
            <Button
              type="link"
              :icon="
                h(IconifyIcon, {
                  icon: 'mdi:pause',
                  class: 'inline-block text-2xl',
                })
              "
            />
          </Tooltip>
          <!-- 改派 -->
          <Tooltip>
            <template #title>{{ $t('workOrderEntry.reassignment') }}</template>
            <Button
              type="link"
              :icon="
                h(IconifyIcon, {
                  icon: 'mdi:backup-restore',
                  class: 'inline-block text-2xl',
                })
              "
            />
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped lang="scss"></style>
