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
import { excelPathPGStopHZStatistics, queryPGStopHZStatistics } from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      title: $t('page.common.serialNumber'),
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    {
      field: 'type',
      title: $t('productionDaily.Type'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'materialName',
      title: $t('productionDaily.NameProduct'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'productCode',
      title: $t('productionDaily.CodeProduct_1'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'lineName',
      title: $t('productionDaily.LineNo'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'mbnumber',
      title: $t('productionDaily.Output_1'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'pgnumber',
      title: $t('productionDaily.OutputPolish'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'stopTime',
      title: $t('productionDaily.StopTimeTotal'),
      minWidth: 200,
    },
    {
      title: $t('productionDaily.customNewProduct'),
      children: [
        {
          field: 'KDPXPDY',
          title: $t('productionDaily.colorMatchingSample'),
          minWidth: 150,
        },
        {
          field: 'KDPXPDYNH',
          title: $t('productionDaily.Energy_2'),
          minWidth: 150,
        },
      ],
    },
    {
      title: $t('productionDaily.preProductionSampleCheck'),
      children: [
        {
          field: 'CQDY',
          title: $t('productionDaily.preProductionSampleCheck'),
          minWidth: 150,
        },
        {
          field: 'CQDYNH',
          title: $t('productionDaily.Energy'),
          minWidth: 150,
        },
      ],
    },
    {
      title: $t('productionDaily.Shutdown'),
      children: [
        {
          field: 'gytcdb',
          title: $t('productionDaily.Pkg'),
          minWidth: 150,
        },
        {
          field: 'gytcpg',
          title: $t('productionDaily.Polish'),
          minWidth: 150,
        },
        {
          field: 'gytcsc',
          title: $t('productionDaily.Kiln'),
          minWidth: 150,
        },
        {
          field: 'gYTCSY',
          title: $t('productionDaily.Glaze_1'),
          minWidth: 150,
        },
        {
          field: 'gytcsy',
          title: $t('productionDaily.horizontalDrying'),
          minWidth: 150,
        },
        {
          field: 'gytccx',
          title: $t('productionDaily.forming'),
          minWidth: 150,
        },
        {
          field: 'gytcyl',
          title: $t('productionDaily.RawMaterial'),
          minWidth: 150,
        },
      ],
    },
    {
      title: $t('productionDaily.Shutdown_2'),
      children: [
        {
          field: 'sctcdb',
          title: $t('productionDaily.Pkg'),
          minWidth: 150,
        },
        {
          field: 'sctcpg',
          title: $t('productionDaily.Polish'),
          minWidth: 150,
        },
        {
          field: 'sctcsc',
          title: $t('productionDaily.Kiln'),
          minWidth: 150,
        },
        {
          field: 'sctcsy',
          title: $t('productionDaily.Glaze_1'),
          minWidth: 150,
        },
        {
          field: 'sctcwg',
          title: $t('productionDaily.horizontalDrying'),
          minWidth: 150,
        },
        {
          field: 'sctcyl',
          title: $t('productionDaily.RawMaterial'),
          minWidth: 150,
        },
        {
          field: 'sctccx',
          title: $t('productionDaily.forming'),
          minWidth: 150,
        },
      ],
    },
    {
      title: $t('productionDaily.Equipment'),
      children: [
        {
          field: 'sbgzdb',
          title: $t('productionDaily.Pkg'),
          minWidth: 150,
        },
        {
          field: 'sbgzpg',
          title: $t('productionDaily.Polish'),
          minWidth: 150,
        },
        {
          field: 'sbgzyl',
          title: $t('productionDaily.Kiln'),
          minWidth: 150,
        },
        {
          field: 'sbgzyx',
          title: $t('productionDaily.Glaze_1'),
          minWidth: 150,
        },
        {
          field: 'sbgzsg',
          title: $t('productionDaily.horizontalDrying'),
          minWidth: 150,
        },
        {
          field: 'sbgzfz',
          title: $t('productionDaily.RawMaterial'),
          minWidth: 150,
        },
        {
          field: 'sbgzcx',
          title: $t('productionDaily.forming'),
          minWidth: 150,
        },
      ],
    },
    { field: 'sczc', title: $t('productionDaily.Changeover'), minWidth: 200 },
    { field: 'cnxz', title: $t('productionDaily.CapacityLimit'), minWidth: 200 },
    { field: 'zrzh', title: $t('productionDaily.NaturalDisaster'), minWidth: 200 },
    { field: 'sbqx', title: $t('productionDaily.Equipment_1'), minWidth: 200 },
  ],
  footerData: [{}, {}],
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

/**
 * 获取物料类型的中文描述
 * @param state 物料类型编码编码
 */
function getMaterialTypeText(state: number) {
  switch (state) {
    case 1: {
      return $t('productionDaily.rawMaterial');
    }
    case 2: {
      return $t('productionDaily.brickBlank');
    }
    default: {
      return $t('productionDaily.undefinedType');
    }
  }
}

// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 查询时间
  searchTime: [] as any,
  // 线号
  lineName: '',
  // 产品编号
  productCode: '',
});

const collect = ref<any>({});
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
    queryPGStopHZStatistics({
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
      .catch(() => {
        resolve({
          total: 0,
          items: [],
        });
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
  excelPathPGStopHZStatistics(params).then((data) => {
    window.open(data);
  });
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
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 时间范围 -->
        <FormItem
          :label="$t('productionDaily.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.searchTime" />
        </FormItem>

        <!-- 线号 -->
        <FormItem
          :label="$t('productionDaily.wireNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.lineName" />
        </FormItem>

        <!-- 产品编码 -->
        <FormItem
          :label="$t('productionDaily.productCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productCode" />
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
        <template #materialType="{ row }">
          <span> {{ getMaterialTypeText(row.materialType) }} </span>
        </template>
        <template #footerData="{ rowIndex, columnIndex }">
          <div v-if="rowIndex === 0">
            <span v-if="columnIndex === 1">总产量</span>
            <span v-if="columnIndex === 2">{{ collect.znumber }}</span>
            <span v-if="columnIndex === 3">磨边总产量</span>
            <span v-if="columnIndex === 4">{{ collect.mBNumber }}</span>
            <span v-if="columnIndex === 5">抛光总产量</span>
            <span v-if="columnIndex === 6">{{ collect.pGNumber }}</span>
          </div>
          <div v-if="rowIndex === 1">
            <span v-if="columnIndex === 1">停机总时间</span>
            <span v-if="columnIndex === 2">{{ collect.stopTime }}</span>
            <span v-if="columnIndex === 3">磨边停机时间</span>
            <span v-if="columnIndex === 4">{{ collect.sumMBStopTime }}</span>
            <span v-if="columnIndex === 5">抛光停机时间</span>
            <span v-if="columnIndex === 6">{{ collect.sumPGStopTime }}</span>
          </div>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
