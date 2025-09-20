<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';

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
import {
  excelPathYXStopDayMXStatistics,
  queryYXStopDayMXStatistics,
} from '#/api';
import { $t } from '#/locales';

const props = defineProps({
  // 父组件传递过来的参数
  kilnNumber: {
    type: String,
    default: '',
  },
});

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
      field: 'worksCenterCode',
      title: '工作中心代码',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'worksCenterName',
      title: '工作中心名称',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'day',
      title: '日期',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'cLass',
      title: '班次',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'worksheetType',
      title: '工单单别',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'worksheetCode',
      title: '工单单号',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'lineName',
      title: '产品批号',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'productCode',
      title: '产品编号',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'stopTime',
      title: '停窑时间',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'stopReason',
      title: '停窑原因',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'stopTrqValue',
      title: '停窑燃气(M3)',
      minWidth: 200,
      slots: { footer: 'footerData' },
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
  // 产品编码
  productCode: '',
  // 产品批号
  lineName: '',
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
    queryYXStopDayMXStatistics({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
      sCline: props.kilnNumber, // 从 props 中获取 kilnNumber 参数。
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
  params.sCline = props.kilnNumber;
  excelPathYXStopDayMXStatistics(params).then((data) => {
    window.open(data);
  });
}

// endregion

// region 详情
// 是否显示详情
const isShow = ref(false);
// 详情数据
const details = ref<any>(undefined);

/**
 * 显示详情
 * @param row
 */
function showDetails(row: any) {
  details.value = row;
  isShow.value = true;
}
// endregion

// region 初始化

onMounted(() => {});

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

        <!-- 产品编号 -->
        <FormItem
          :label="$t('productionDaily.productCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productCode" />
        </FormItem>

        <!-- 产品批号 -->
        <FormItem
          :label="$t('productionDaily.productLotNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.lineName" />
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
    <Card>
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
        <template #footerData="{ column }">
          <span> {{ collect[column.field] }} </span>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
