<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  RangePicker,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { excelPathYLDay, queryYLDayStatistics } from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import KilnDetails from '#/util/component/kilnDetails.vue';

// 路由信息
const route = useRoute();

// region 表格操作

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
      title: '窑号',
      minWidth: 200,
      slots: { default: 'kilnNumber' },
    },
    {
      title: '停机非生产',
      children: [
        {
          title: '大修',
          children: [
            {
              field: '2',
              title: '时间',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
            {
              field: '2',
              title: '燃气',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
          ],
        },
        {
          title: '放假(升降温)',
          children: [
            {
              field: '2',
              title: '时间',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
            {
              field: '2',
              title: '燃气',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
          ],
        },
        {
          title: '不可抗拒(雷电/限电/限气)',
          children: [
            {
              field: '2',
              title: '时间',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
            {
              field: '2',
              title: '燃气',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
          ],
        },
        {
          title: '小计',
          children: [
            {
              field: '2',
              title: '时间',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
            {
              field: '2',
              title: '燃气',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
          ],
        },
      ],
    },
    {
      title: '空烧时间',
      children: [
        {
          title: '转产',
          children: [
            {
              title: '定额',
              children: [
                {
                  field: '2',
                  title: '时间',
                  minWidth: 150,
                  slots: { footer: 'footerData' },
                },
                {
                  field: '2',
                  title: '燃气',
                  minWidth: 150,
                  slots: { footer: 'footerData' },
                },
              ],
            },
            {
              title: '实际',
              children: [
                {
                  field: '2',
                  title: '时间',
                  minWidth: 150,
                  slots: { footer: 'footerData' },
                },
                {
                  field: '2',
                  title: '燃气',
                  minWidth: 150,
                  slots: { footer: 'footerData' },
                },
              ],
            },
          ],
        },
        {
          title: '新品实验研发n',
          children: [
            {
              field: '2',
              title: '时间',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
            {
              field: '2',
              title: '燃气',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
          ],
        },
        {
          title: '工艺调整',
          children: [
            {
              field: '2',
              title: '时间',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
            {
              field: '2',
              title: '燃气',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
          ],
        },
        {
          title: '故障空烧',
          children: [
            {
              title: '粉制',
              children: [
                {
                  field: '2',
                  title: '时间',
                  minWidth: 150,
                  slots: { footer: 'footerData' },
                },
                {
                  field: '2',
                  title: '燃气',
                  minWidth: 150,
                  slots: { footer: 'footerData' },
                },
              ],
            },
            {
              title: '成型',
              children: [
                {
                  field: '2',
                  title: '时间',
                  minWidth: 150,
                  slots: { footer: 'footerData' },
                },
                {
                  field: '2',
                  title: '燃气',
                  minWidth: 150,
                  slots: { footer: 'footerData' },
                },
              ],
            },
            {
              title: '烧干',
              children: [
                {
                  field: '2',
                  title: '时间',
                  minWidth: 150,
                  slots: { footer: 'footerData' },
                },
                {
                  field: '2',
                  title: '燃气',
                  minWidth: 150,
                  slots: { footer: 'footerData' },
                },
              ],
            },
            {
              title: '窑炉',
              children: [
                {
                  field: '2',
                  title: '时间',
                  minWidth: 150,
                  slots: { footer: 'footerData' },
                },
                {
                  field: '2',
                  title: '燃气',
                  minWidth: 150,
                  slots: { footer: 'footerData' },
                },
              ],
            },
            {
              title: '釉线',
              children: [
                {
                  field: '2',
                  title: '时间',
                  minWidth: 150,
                  slots: { footer: 'footerData' },
                },
                {
                  field: '2',
                  title: '燃气',
                  minWidth: 150,
                  slots: { footer: 'footerData' },
                },
              ],
            },
          ],
        },
        {
          title: '模具/粉车维修',
          children: [
            {
              field: '2',
              title: '时间',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
            {
              field: '2',
              title: '燃气',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
          ],
        },
        {
          title: '责任',
          children: [
            {
              title: '粉制(混料/断料)',
              children: [
                {
                  field: '2',
                  title: '时间',
                  minWidth: 150,
                  slots: { footer: 'footerData' },
                },
                {
                  field: '2',
                  title: '燃气',
                  minWidth: 150,
                  slots: { footer: 'footerData' },
                },
              ],
            },
            {
              title: '亚光(操作调整)',
              children: [
                {
                  field: '2',
                  title: '时间',
                  minWidth: 150,
                  slots: { footer: 'footerData' },
                },
                {
                  field: '2',
                  title: '燃气',
                  minWidth: 150,
                  slots: { footer: 'footerData' },
                },
              ],
            },
          ],
        },
        {
          title: '小计',
          children: [
            {
              field: '2',
              title: '时间',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
            {
              field: '2',
              title: '燃气',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
          ],
        },
      ],
    },
    {
      title: '合计',
      children: [
        {
          field: '2',
          title: '时间',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: '2',
          title: '燃气',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
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

const gridEvents: VxeGridListeners<any> = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 查询时间
  searchTime: [] as any,
  // 工单号
  worksheetCode: '',
  // 产品编码
  productCode: '',
  // 产品名称
  materialName: '',
});

// 汇总数据
const collect = ref<any>({});
/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams.value };
    if (params.searchTime && params.searchTime.length === 2) {
      params.startTime = params.searchTime[0].format('YYYY-MM-DD');
      params.endTime = params.searchTime[1].format('YYYY-MM-DD');
      params.searchTime = undefined;
    }
    resolve({
      total: 1,
      items: [
        {
          kilnNumber: '123',
        },
      ],
    });
    queryYLDayStatistics({
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
      });
  });
}

// endregion

// region 文件下载

function downloadTemplate() {
  const params: any = { ...queryParams.value };
  if (params.searchTime && params.searchTime.length === 2) {
    params.startTime = params.searchTime[0].format('YYYY-MM-DD');
    params.endTime = params.searchTime[1].format('YYYY-MM-DD');
    params.searchTime = undefined;
  }
  excelPathYLDay(params).then((data) => {
    window.open(data);
  });
}

// endregion

// region 详情
// 是否显示详情
const isShow = ref(false);
// 详情数据
const details = ref<any>({});

/**
 * 显示详情
 * @param row
 */
function showDetails(row: any) {
  details.value = row;
  isShow.value = true;
}
// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 初始化

onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 时间范围 -->
        <FormItem
          :label="$t('productionDaily.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.searchTime" />
        </FormItem>

        <!-- 工单号 -->
        <FormItem
          :label="$t('productionDaily.worksheetCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.worksheetCode" />
        </FormItem>

        <!-- 产品编号 -->
        <FormItem
          :label="$t('productionDaily.productCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productCode" />
        </FormItem>

        <!-- 产品名称 -->
        <FormItem
          :label="$t('productionDaily.productName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialName" />
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

    <!-- region 表格主体 -->
    <Card class="mb-8">
      <Grid>
        <template #toolbar-tools>
          <!-- 导出按钮 -->
          <Button type="primary" @click="downloadTemplate()">
            {{ $t('common.export') }}
          </Button>
        </template>
        <template #kilnNumber="{ row }">
          <Button type="link" @click="showDetails(row)">
            {{ row.kilnNumber }}
          </Button>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
    <Card :title="$t('productionDaily.dailyDetails')" v-if="isShow">
      <KilnDetails :kiln-number="details.kilnNumber" />
    </Card>
  </Page>
</template>

<style scoped></style>
