<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

import { Button, Card, Form, FormItem, Input } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  abnormalFeedingApprovalHistory, excelPathAbnormalFeedingApprovalHistory,
  excelPathYLStopHZStatistics,
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
      field: 'checkCode',
      title: '物料投料校验异常编号',
      minWidth: 150,
    },
    {
      field: 'worksheetCode',
      title: '工单号',
      minWidth: 150,
    },
    {
      field: 'productName',
      title: '产品名称',
      minWidth: 150,
    },
    {
      field: 'materialCode',
      title: '料号',
      minWidth: 150,
    },
    {
      field: 'materialName',
      title: '物料名称',
      minWidth: 150,
    },
    {
      field: 'useNumber',
      title: '投入量',
      minWidth: 150,
    },
    {
      field: 'standardNumber',
      title: '标准用量上限',
      minWidth: 150,
    },
    {
      field: 'createTime',
      title: '创建时间',
      minWidth: 150,
    },
    {
      field: 'remark',
      title: '备注',
      minWidth: 150,
    },
    {
      field: 'auditstateName',
      title: '审核状态名称',
      minWidth: 150,
    },
    {
      field: 'auditUser',
      title: '审核人',
      minWidth: 150,
    },
    {
      field: 'auditTime',
      title: '审核时间',
      minWidth: 150,
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  // 分页配置，禁用分页
  pagerConfig: {
    enabled: false,
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
  // 物料编号
  materialCode: '',
  // 物料名称
  materialName: '',
  // 产品名称
  productName: '',
});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = {
      ...queryParams.value,
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    };
    if (params.searchTime && params.searchTime.length === 2) {
      params.startTime = params.searchTime[0].format('YYYY-MM-DD');
      params.endTime = params.searchTime[1].format('YYYY-MM-DD');
      params.searchTime = undefined;
    }
    abnormalFeedingApprovalHistory(params)
      .then(({ total, list }) => {
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

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 文件下载

function downloadTemplate() {
  const params: any = { ...queryParams.value };
  excelPathAbnormalFeedingApprovalHistory(params).then((data) => {
    window.open(data);
  });
}

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
        <!-- 物料编号 -->
        <FormItem
          :label="$t('productionDaily.itemNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialCode" />
        </FormItem>
        <!-- 物料名称 -->
        <FormItem
          :label="$t('productionDaily.itemName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialName" />
        </FormItem>
        <!-- 产品名称 -->
        <FormItem
          :label="$t('productionDaily.productName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productName" />
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
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
