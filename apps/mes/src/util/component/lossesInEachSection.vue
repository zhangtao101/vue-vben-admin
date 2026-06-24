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
      title: $t('component.serialNumber'),
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    { field: 'month', title: $t('component.month'), minWidth: 150 },
    { field: 'ylLine', title: $t('component.kilnLine'), minWidth: 150 },
    {
      title: $t('component.pulpingSection'),
      children: [
        {
          field: 'feedNumber',
          title: $t('component.slurryInputT'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'outjlnumber',
          title: $t('component.slurryOutputT'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'zjLossRate',
          title: $t('component.lossRate'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: $t('component.powderMakingSection'),
      children: [
        {
          field: 'injlnumber',
          title: $t('component.slurryInputToPowderT'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'outNumber',
          title: $t('component.powderOutputT'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'flLossRate',
          title: $t('component.lossRate'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: $t('component.distributionSection'),
      children: [
        {
          field: 'feesFlNumber',
          title: $t('component.powderInputT'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'outZP',
          title: $t('component.brickBlankOutputT'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'psLossRate',
          title: $t('component.lossRate'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: $t('component.forming'),
      children: [
        {
          field: 'pressQuantity',
          title: $t('component.pressingQuantity'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'outWg',
          title: $t('component.lyingOutput'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'cxLossRate',
          title: $t('component.lossRate'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: $t('component.glazing'),
      children: [
        {
          field: 'outWg',
          title: $t('component.lyingOutput'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'outyx',
          title: $t('component.lineOutput'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'syLossRate',
          title: $t('component.lossRate'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: $t('component.firing'),
      children: [
        {
          field: 'outyx',
          title: $t('component.lineOutput'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'inStorageNumber',
          title: $t('component.intermediateStorageIn'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'ylLossRate',
          title: $t('component.lossRate'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: $t('component.manufacturing'),
      children: [
        {
          field: 'pressQuantity',
          title: $t('component.pressingQuantity'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'inStorageNumber',
          title: $t('component.intermediateStorageIn'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'zzbLossRate',
          title: $t('component.lossRate'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: $t('component.polishing'),
      children: [
        {
          field: 'pginStorageNumber',
          title: $t('component.intermediateBrick'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'outStorageNumber',
          title: $t('component.finishedProductIn'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'pgLossRate',
          title: $t('component.lossRate'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: $t('component.pGradeRate'),
      children: [
        {
          field: 'pgtotalInStorageNumber',
          title: $t('component.totalInStorage'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'pinStorageNumber',
          title: $t('component.pGradeInStorage'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'plossRate',
          title: $t('component.pRate'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
  ],
  footerData: [{ seq: $t('component.total') }],
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
