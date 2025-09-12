<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

import { Button, Card, Form, FormItem, Input } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { queryWorksheetActuallyOcurredDetails } from '#/api';
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
      field: 'workstationCode',
      title: '工作站编号',
      minWidth: 150,
    },
    {
      field: 'workstationName',
      title: '工作站名称',
      minWidth: 150,
    },
    {
      field: 'productName',
      title: '产品名称',
      minWidth: 150,
    },
    {
      field: 'worksheetPlanNumber',
      title: '工单计划数',
      minWidth: 150,
    },
    {
      field: 'worksheetFinishNumber',
      title: '工单完工数',
      minWidth: 150,
    },
    {
      field: 'materialCode',
      title: '物料编号',
      minWidth: 150,
    },
    {
      field: 'materialName',
      title: '物料名称',
      minWidth: 200,
    },
    {
      field: 'feedNumber',
      title: '实际投入量',
      minWidth: 150,
    },
    {
      field: 'standardNumber',
      title: '标准应发量',
      minWidth: 150,
    },
    {
      field: 'unit',
      title: '单位',
      minWidth: 150,
    },
  ],
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
      return '原料';
    }
    case 2: {
      return '砖坯';
    }
    default: {
      return '未定义的类型';
    }
  }
}

// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 工单号
  worksheetCode: '',
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
    queryWorksheetActuallyOcurredDetails({
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

// region 文件下载

// function downloadTemplate() {
//   const params: any = { ...queryParams.value };
//   if (params.searchTime && params.searchTime.length === 2) {
//     params.startTime = params.searchTime[0].format('YYYY-MM-DD');
//     params.endTime = params.searchTime[1].format('YYYY-MM-DD');
//     params.searchTime = undefined;
//   }
//   excelPathYLDay(params).then((data) => {
//     window.open(data);
//   });
// }

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
        <!-- 工单号 -->
        <FormItem
          :label="$t('productionDaily.worksheetCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.worksheetCode" />
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
        <!--        <template #toolbar-tools>
          &lt;!&ndash; 导出按钮 &ndash;&gt;
          <Button type="primary" @click="downloadTemplate()">
            {{ $t('common.export') }}
          </Button>
        </template>-->
        <template #materialType="{ row }">
          <span> {{ getMaterialTypeText(row.materialType) }} </span>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
