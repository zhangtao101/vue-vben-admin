<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button, Form, FormItem, Input, Tooltip } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

const props = defineProps({
  // 这里定义组件的 props
  queryParams: {
    type: Object,
    default: () => ({}),
  },
});

// region 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      title: '序号',
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    {
      field: '1',
      title: '任务编号',
      minWidth: 200,
    },
    {
      field: '2',
      title: '工单编号',
      minWidth: 200,
    },
    {
      field: '3',
      title: '产品名称',
      minWidth: 200,
    },
    {
      field: '5',
      title: '当前工序',
      minWidth: 200,
    },
    {
      field: '4',
      title: '作业位置',
      minWidth: 200,
    },
    {
      field: '4',
      title: '任务产生时间',
      minWidth: 200,
    },
    {
      field: '4',
      title: '任务类型',
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

const gridEvents: any = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params: any = { ...props.queryParams };
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

// endregion

// region 暴露方法

const reload = () => {
  gridApi.reload();
};

defineExpose({
  reload,
});

// endregion
</script>
<template>
  <Form layout="inline" :model="queryParams" class="mb-4">
    <!--工单编号 -->
    <FormItem :label="$t('andon.workOrderNumber')" class="!mb-4">
      <Input />
    </FormItem>
    <!--当前工序 -->
    <FormItem :label="$t('andon.currentOperation')" class="!mb-4">
      <Input />
    </FormItem>
    <!--作业位置 -->
    <FormItem :label="$t('andon.jobPosition')" class="!mb-4">
      <Input />
    </FormItem>
    <FormItem class="!mb-4">
      <Button type="primary" @click="query" class="mr-4">
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
      <!-- 任务领取 -->
      <Tooltip>
        <template #title>
          {{ $t('andon.taskCollection') }}
        </template>
        <Button
          type="link"
          :icon="
            h(IconifyIcon, {
              icon: 'mdi:invoice-receive',
              class: 'inline-block text-2xl',
            })
          "
        />
      </Tooltip>
    </template>
  </Grid>
</template>
<style lang="scss" scoped></style>
