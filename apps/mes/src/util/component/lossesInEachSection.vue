<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { excelPathLossRatesPerSection, queryLossRatesPerSection } from '#/api';
import { $t } from '#/locales';

const props = defineProps({
  queryParams: {
    type: Object,
    default: () => ({}),
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
    { field: 'month', title: '月份', minWidth: 150 },
    { field: 'ylLine', title: '窑线', minWidth: 150 },
    {
      title: '粉料段',
      children: [
        {
          title: '原料 → 粉料',
          children: [
            {
              field: 'feedNumber',
              title: '投入泥料量T',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
            {
              field: 'outNumber',
              title: '产出粉料量T',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
            {
              field: 'flLossRate',
              title: '损耗%',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
          ],
        },
      ],
    },
    {
      title: '配送段',
      children: [
        {
          title: '粉料 → 砖坯',
          children: [
            {
              field: 'feesFlNumber',
              title: '投入粉料量T',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
            {
              field: 'outZP',
              title: '产出砖坯量T',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
            {
              field: 'lossRate',
              title: '损耗%',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
          ],
        },
      ],
    },
    {
      title: '窑炉',
      children: [
        {
          title: '砖坯 → 中间库或成品库',
          children: [
            {
              field: 'pressQuantity',
              title: '压制量（平方米）',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
            {
              field: 'inStorageNumber',
              title: '窑炉入中间库（平方米）',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
            {
              field: 'ylLossRate',
              title: '损耗%',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
          ],
        },
      ],
    },
    {
      title: '抛光',
      children: [
        {
          title: '中间库 → 成品库',
          children: [
            {
              field: 'pginStorageNumber',
              title: '中间库素砖（平方米）',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
            {
              field: 'outStorageNumber',
              title: '成品库入库（平方米）',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
            {
              field: 'pgLossRate',
              title: '损耗%',
              minWidth: 150,
              slots: { footer: 'footerData' },
            },
          ],
        },
      ],
    },
    {
      title: 'P等品比率',
      children: [
        {
          field: 'pgtotalInStorageNumber',
          title: '总入库量（平方米）',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'pinStorageNumber',
          title: 'P等入库量（平方米）',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'plossRate',
          title: 'P等比率',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
  ],
  footerData: [{ seq: '合计' }],
  mergeFooterItems: [{ row: 0, col: 0, rowspan: 1, colspan: 3 }],
  height: 500,
  stripe: true,
  showFooter: true,
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

// 汇总数据
const collect = ref<any>({});
/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...props.queryParams };
    if (params.searchTime && params.searchTime.length === 2) {
      params.startTime = params.searchTime[0].format('YYYY-MM-DD');
      params.endTime = params.searchTime[1].format('YYYY-MM-DD');
      params.searchTime = undefined;
    }
    queryLossRatesPerSection({
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
  const params: any = { ...props.queryParams };
  if (params.searchTime && params.searchTime.length === 2) {
    params.startTime = params.searchTime[0].format('YYYY-MM-DD');
    params.endTime = params.searchTime[1].format('YYYY-MM-DD');
    params.searchTime = undefined;
  }
  excelPathLossRatesPerSection(params).then((data) => {
    window.open(data);
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

// region 初始化

onMounted(() => {});

// endregion
</script>

<template>
  <Page>
    <!-- region 表格主体 -->
    <Grid>
      <template #toolbar-tools>
        <!-- 导出按钮 -->
        <Button type="primary" @click="downloadTemplate()">
          {{ $t('common.export') }}
        </Button>
      </template>
      <template #footerData="{ column }">
        <span> {{ collect[column.field] }} </span>
      </template>
    </Grid>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
