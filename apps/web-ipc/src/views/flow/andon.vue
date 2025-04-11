<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { IconifyIcon, MdiHome } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  RadioButton,
  RadioGroup,
  TabPane,
  Tabs,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

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

// region 查询数据
// 查询条件
const queryParams = ref<any>({
  productionLineId: '',
  processId: '',
  checkedType: '1',
});

function tabsChange(key: any) {
  queryParams.value.checkedType = key;
  gridApi.reload();
}

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params: any = { ...queryParams.value };
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
    <Card class="mb-4">
      <Tabs
        :value="queryParams.checkedType"
        @change="tabsChange"
        class="w-4/5 pl-8"
      >
        <TabPane key="1">
          <template #tab>
            <MdiHome class="inline-block" />
            <!-- 待领取 -->
            {{ $t('andon.waitingToBeClaimed') }}
          </template>
        </TabPane>
        <TabPane key="2">
          <template #tab>
            <MdiHome class="inline-block" />
            <!-- 待处理 -->
            {{ $t('andon.toBeProcessed') }}
          </template>
        </TabPane>
        <TabPane key="3">
          <template #tab>
            <MdiHome class="inline-block" />
            <!-- 已完成 -->
            {{ $t('andon.completed') }}
          </template>
        </TabPane>
      </Tabs>
    </Card>
    <Card>
      <Form layout="inline" :model="queryParams">
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
        <!--当前状态 -->
        <FormItem :label="$t('andon.currentState')" class="!mb-4">
          <RadioGroup
            v-model:value="queryParams.checkedType"
            button-style="solid"
          >
            <!-- 全部 -->
            <RadioButton :value="0">
              {{ $t('andon.all') }}
            </RadioButton>
            <!-- 待领取 -->
            <RadioButton :value="1">
              {{ $t('andon.waitingToBeClaimed') }}
            </RadioButton>
            <!-- 待处理 -->
            <RadioButton :value="2">
              {{ $t('andon.toBeProcessed') }}
            </RadioButton>
            <!-- 已完成 -->
            <RadioButton :value="3">
              {{ $t('andon.completed') }}
            </RadioButton>
          </RadioGroup>
        </FormItem>
        <FormItem class="!mb-4">
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
          <!-- 出站 ="{ row }" -->
          <Tooltip>
            <template #title>{{ $t('workOrderEntry.outbound') }}</template>
            <Button
              type="link"
              :icon="
                h(IconifyIcon, {
                  icon: 'mdi:output',
                  class: 'inline-block text-2xl',
                })
              "
            />
          </Tooltip>
          <!-- 下线 -->
          <Tooltip>
            <template #title>{{ $t('workOrderEntry.downline') }}</template>
            <Button
              type="link"
              :icon="
                h(IconifyIcon, {
                  icon: 'mdi:cloud-download-outline',
                  class: 'inline-block text-2xl',
                })
              "
            />
          </Tooltip>
        </template>
      </Grid>
    </Card>
  </Page>
</template>

<style scoped lang="scss"></style>
