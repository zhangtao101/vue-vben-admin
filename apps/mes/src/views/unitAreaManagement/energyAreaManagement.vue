<script setup lang="ts">
import { h, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
// region 表格
// 表格列配置项
import { $t } from '@vben/locales';

import { Button, Card, Form, FormItem, RangePicker } from 'ant-design-vue';

import { getEnergyZoningList } from '#/api';
import BasicTblae from '#/util/component/basicTblae.vue';

const columns: any = [
  { title: '序号', type: 'seq', width: 50 }, // 自动生成序号列
  {
    field: 'partitionId',
    title: '分区 ID',
    minWidth: 150,
  },
  {
    field: 'partitionName',
    title: '分区名称',
    minWidth: 150,
  },
  {
    field: 'partitionJC',
    title: '分区简称',
    minWidth: 150,
  },
  {
    field: 'parentPartitionName',
    title: '上级分区',
    minWidth: 150,
  },
  {
    field: 'createTime',
    title: '创建时间',
    minWidth: 150,
  },
];

const queryParams = ref<any>({});
/**
 * 从服务器查询工作站数据的函数。
 * 这个函数用于发送查询请求，并在成功获取数据后更新组件的状态。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams.value };
    getEnergyZoningList({
      ...params, // 合并所有查询条件
      pageNum: page, // 当前页码(从1开始)
      pageSize, // 每页数据条数
    })
      .then(({ totalSize, list }) => {
        // 将接口返回数据转换为vxe-table要求的格式
        resolve({
          total: totalSize, // 总数据条数
          items: list, // 当前页数据列表
        });
      })
      .catch((error) => {
        reject(error); // 将错误传递给表格组件处理
      });
  });
}

// endregion
</script>

<template>
  <Page>
    <!-- region 查询条件 -->
    <Card class="mb-4">
      <Form :model="queryParams" layout="inline">
        <FormItem
          :label="$t('energyConsumptionStatistics.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.searchTime" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <Card>
      <!-- region 表格 -->
      <BasicTblae :columns="columns" :query-data="queryData" />
      <!-- endregion -->
    </Card>
  </Page>
</template>

<style scoped></style>
