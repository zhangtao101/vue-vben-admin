<script setup lang="ts">
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import {
  GisLayerAltEdit,
  MaterialSymbolsDeleteOutline,
  MaterialSymbolsSearch,
  MingcuteEditLine,
} from '@vben/icons';
import { $t } from '@vben/locales';

import { Button, Card, Form, FormItem, Input, Tooltip } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { queryWorkstation } from '#/api';

// region 表格
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'name', title: 'Name', minWidth: 150 },
    { field: 'age', sortable: true, title: 'Age', minWidth: 150 },
    { field: 'nickname', title: 'Nickname', minWidth: 150 },
    { field: 'role', title: 'Role', minWidth: 150 },
    { field: 'address', showOverflow: true, title: 'Address', minWidth: 150 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 220,
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
const queryParams = ref<any>({
  workstationCode: '',
  workstationName: '',
});

/**
 * 从服务器查询工作站数据的函数。
 * 这个函数用于发送查询请求，并在成功获取数据后更新组件的状态。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    /**
     * 调用 queryWorkstation 函数，传入查询参数和分页信息。
     * 查询参数包括 queryParams.value 中的所有属性，以及当前页码和每页大小。
     */
    queryWorkstation({
      ...queryParams.value, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
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

// region 模板编辑

function showPrintTemplate(_row: any) {
  // 弹出窗口，不显示工具栏和菜单栏
  window.open(
    '/empty/printTemplate',
    '',
    'toolbar=no,menubar=no,resizable=yes,width=800,height=600',
  );
}

// endregion

onMounted(async () => {});
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 工作站编号 -->
        <FormItem
          :label="$t('workStationMaintenance.workStationNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.workstationCode" />
        </FormItem>
        <!-- 工作站名称 -->
        <FormItem
          :label="$t('workStationMaintenance.workstationName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.workstationName" />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MaterialSymbolsSearch, { class: 'inline-block mr-2' })"
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
          <!-- 新增按钮 -->
          <Button type="primary">
            {{ $t('common.add') }}
          </Button>
        </template>
        <template #action="{ row, index }">
          <!-- 编辑按钮 -->
          <Tooltip>
            <template #title>
              {{ $t('common.edit') }}
            </template>
            <Button
              :icon="h(MingcuteEditLine, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="showJobFlowConfiguration(row)"
            />
          </Tooltip>
          <!-- 模板编辑按钮 -->
          <Tooltip>
            <template #title>
              {{ $t('common.templateEdit') }}
            </template>
            <Button
              :icon="h(GisLayerAltEdit, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="showPrintTemplate(row)"
            />
          </Tooltip>

          <!-- 删除数据 -->
          <Tooltip>
            <template #title>{{ $t('common.delete') }}</template>
            <Button
              :icon="
                h(MaterialSymbolsDeleteOutline, {
                  class: 'inline-block size-6',
                })
              "
              danger
              type="link"
              @click="delWorkStationDetail(index)"
            />
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
