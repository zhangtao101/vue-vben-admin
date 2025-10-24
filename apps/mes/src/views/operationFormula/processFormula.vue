<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import { Button, Card, Form, FormItem, Input, Tooltip } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

// region 工艺配方

const gridOptions: VxeGridProps<any> = {
  align: 'center', // 设置所有列内容水平居中显示
  border: true, // 显示表格边框线
  rowConfig: {
    isHover: true, // 启用行悬停高亮效果
  },
  radioConfig: {
    trigger: 'row',
  },
  columns: [
    {
      type: 'radio',
      minWidth: 60,
    },
    {
      field: 'productCode',
      title: '所属工序',
      minWidth: 200,
    },
    {
      field: 'productName',
      title: '设备名称',
      minWidth: 200,
    },
    {
      field: 'opInTime',
      title: '设备编号',
      minWidth: 200,
    },
    {
      field: 'processName',
      title: '配方名称',
      minWidth: 200,
    },
    {
      field: 'finishRate',
      title: '配方编号',
      minWidth: 200,
    },
    {
      field: 'version',
      title: '版本',
      minWidth: 120,
    },
  ],
  height: 200,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  pagerConfig: {
    enabled: false,
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
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
};
// 选中的工单
const selectedRow = ref<any>({});
const gridEvents: any = {
  radioChange: ({ newValue }: any) => {
    selectedRow.value = newValue;
  },
};
// gridApi
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

const queryParams = ref<any>({});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    // const params: any = { ...queryParams.value };
    resolve({
      total: page * pageSize,
      items: [{}, {}, {}],
    });
    /* queryYXStopDayMXStatistics({
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
      });*/
  });
}

// endregion
// region 配方绑定

const formulaGridOptions: VxeGridProps<any> = {
  align: 'center', // 设置所有列内容水平居中显示
  border: true, // 显示表格边框线
  rowConfig: {
    isHover: true, // 启用行悬停高亮效果
  },
  columns: [
    { title: '序号', type: 'seq', minWidth: 50 },
    {
      field: 'productCode',
      title: '产品编号',
      minWidth: 200,
    },
    {
      field: 'productName',
      title: '产品名称',
      minWidth: 200,
    },
    {
      field: 'opInTime',
      title: '工艺路线',
      minWidth: 200,
    },
    {
      field: 'processName',
      title: '工序名称',
      minWidth: 200,
    },
    {
      field: 'finishRate',
      title: '配方名称',
      minWidth: 200,
    },
    {
      field: '111',
      title: '配方编号',
      minWidth: 200,
    },
    {
      field: 'version',
      title: '版本',
      minWidth: 120,
    },
    {
      slots: { default: 'action' },
      title: '操作',
      minWidth: 180,
      fixed: 'right',
    },
  ],
  height: 200,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  pagerConfig: {
    enabled: false,
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryFormulaData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
};
// gridApi
const [FormulaGrid, formulaGridApi] = useVbenVxeGrid({
  gridOptions: formulaGridOptions,
});

const formulaQueryParams = ref<any>({});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryFormulaData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    // const params: any = { ...queryParams.value };
    resolve({
      total: page * pageSize,
      items: [{}, {}, {}],
    });
    /* queryYXStopDayMXStatistics({
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
      });*/
  });
}

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 配方名称 -->
        <FormItem
          :label="$t('processFormula.formulaName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.username" />
        </FormItem>

        <!-- 所属工序 -->
        <FormItem
          :label="$t('processFormula.affiliatedProcess')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.perName" />
        </FormItem>
        <!-- 配方编号 -->
        <FormItem
          :label="$t('processFormula.formulaNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.perName" />
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
      <Grid />
    </Card>
    <!-- endregion -->
    <!-- region 表格主体 -->
    <Card class="mb-8">
      <Form :model="formulaQueryParams" layout="inline">
        <!-- 配方名称 -->
        <FormItem
          :label="$t('processFormula.productName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="formulaQueryParams.username" />
        </FormItem>

        <!-- 所属工序 -->
        <FormItem
          :label="$t('processFormula.processRoute')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="formulaQueryParams.perName" />
        </FormItem>
        <!-- 配方编号 -->
        <FormItem
          :label="$t('processFormula.processName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="formulaQueryParams.perName" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="() => formulaGridApi.reload()"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
      <FormulaGrid>
        <!-- ="{ row }" -->
        <template #action>
          <!-- 启用 -->
          <Tooltip>
            <template #title>{{ $t('common.enable') }}</template>
            <Button type="link">
              <Icon
                icon="mdi:play"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 停用 -->
          <Tooltip>
            <template #title>{{ $t('common.stopUsing') }}</template>
            <Button type="link">
              <Icon
                icon="mdi:pause"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 解绑 -->
          <Tooltip>
            <template #title>{{ $t('common.unbind') }}</template>
            <Button type="link">
              <Icon
                icon="carbon:unlink"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
      </FormulaGrid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
