<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';

import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  RangePicker,
  Table,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  excelPathSyYlMaterialStatistics,
  getSyYlMaterialStatistics,
} from '#/api';
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
      title: '序号',
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    {
      field: 'worksheetCode',
      title: '工单号',
      minWidth: 200,
    },
    {
      field: 'productCode',
      title: '产品编号',
      minWidth: 150,
    },
    {
      field: 'productName',
      title: '产品名称',
      minWidth: 150,
    },
    {
      field: 'batchCode',
      title: '生产批号',
      minWidth: 150,
    },
    {
      field: 'inNumber',
      title: '装载量 M²',
      minWidth: 150,
    },
    {
      field: 'outNumber',
      title: '出窑量 M²',
      minWidth: 150,
    },
    {
      field: 'perUseNumber',
      title: '理论总单耗 KG/M²',
      minWidth: 150,
    },
    {
      field: 'inTotalUseNumber',
      title: '理论装载总用量 KG',
      minWidth: 150,
    },
    {
      field: 'outTotalUseNumber',
      title: '理论出窑总用量 KG',
      minWidth: 150,
    },
    {
      field: 'totalUseNumber',
      title: '实际总用量 KG',
      minWidth: 150,
    },
    {
      field: 'wasteInRate',
      title: '实际损耗率（装载量）',
      minWidth: 150,
    },
    {
      field: 'wasteOutRate',
      title: '实际损耗率（出窑量）',
      minWidth: 150,
    },
    {
      field: 'action',
      title: '操作',
      minWidth: 150,
      fixed: 'right',
      slots: {
        default: 'action',
      },
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
  //  工序编号
  processCode: '',
  // 工作站编号
  workstationCode: '',
  // 工单号
  worksheetCode: '',
  // 产品料号
  productCode: '',
});
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
    getSyYlMaterialStatistics({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ list, total }) => {
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

// region 查看详情
const details = ref<any>({});
// 是否显示抽屉
const showDrawer = ref(false);
const columns = [
  {
    title: '物料编号',
    dataIndex: 'materialCode',
    key: 'materialCode',
  },
  {
    title: '物料名称',
    dataIndex: 'materialName',
    key: 'materialName',
  },
  {
    title: '配方编号',
    dataIndex: 'productCode',
    key: 'productCode',
  },
  {
    title: '理论单耗(KG/M2)',
    dataIndex: 'perUseNumber',
    key: 'perUseNumber',
  },
  {
    title: '理论用量(KG)',
    dataIndex: 'standardUseNumber',
    key: 'standardUseNumber',
  },
  {
    title: '实际用量(KG)',
    dataIndex: 'useNumber',
    key: 'useNumber',
  },
  {
    title: '实际损耗',
    dataIndex: 'wasteRate',
    key: 'wasteRate',
  },
];

/**
 * 查看详情
 * @param row 表格行数据
 */
function showDetails(row: any) {
  if (row.mateiralDtos && row.mateiralDtos.length > 0) {
    details.value = [...row.mateiralDtos];
    showDrawer.value = true;
  } else {
    message.warning('暂无详情');
  }
}

/**
 * 关闭抽屉
 */
function close() {
  showDrawer.value = false;
  details.value = [];
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
  excelPathSyYlMaterialStatistics(params).then((data) => {
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
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 时间范围 -->
        <FormItem
          :label="$t('productionDaily.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.searchTime" />
        </FormItem>
        <!-- 工序编号 -->
        <FormItem
          :label="$t('productionDaily.processCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.processCode" />
        </FormItem>

        <!-- 工作站编号 -->
        <FormItem
          :label="$t('productionDaily.workstationCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.workstationCode" />
        </FormItem>

        <!-- 工单号 -->
        <FormItem
          :label="$t('productionDaily.worksheetCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.worksheetCode" />
        </FormItem>

        <!-- 产品料号 -->
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
        <template #action="{ row }">
          <!-- 查看 -->
          <Tooltip>
            <template #title>
              {{ $t('common.view') }}
            </template>
            <Button type="link" @click="showDetails(row)">
              <Icon
                icon="mdi:eye"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <Drawer
      v-model:open="showDrawer"
      height="80%"
      class="custom-class"
      placement="top"
      :title="$t('common.view')"
      @close="close"
    >
      <Table
        :columns="columns"
        :data-source="details"
        bordered
        :pagination="false"
        :scroll="{ y: 400 }"
      />
    </Drawer>
  </Page>
</template>

<style scoped></style>
