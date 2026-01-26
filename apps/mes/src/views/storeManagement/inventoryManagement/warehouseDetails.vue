<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  FormItem,
  Input,
  RangePicker,
  Row,
  Tree,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  queryScadaLogicalWarehouseTree,
  queryScadaPhysicalWarehouseTree,
  queryScadaWarehouseStockByLocation,
  queryScadaWarehouseStockDetail,
} from '#/api';
import { queryAuth } from '#/util';

// region 上方表格（库存汇总）

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'isQualityTest',
      title: '质检',
      minWidth: 50,
      slots: { default: 'status' },
    },
    {
      field: 'isContract',
      title: '合同',
      minWidth: 50,
      slots: { default: 'status' },
    },
    {
      field: 'isHalf',
      title: '半成品',
      minWidth: 80,
      slots: { default: 'status' },
    },
    {
      field: 'isZeroStock',
      title: '零库存',
      minWidth: 80,
      slots: { default: 'status' },
    },
    { field: 'materialTypeCode', title: '材料类别', minWidth: 80 },
    { field: 'materialCode', title: '材料编号', minWidth: 80 },
    { field: 'materialDrawingCode', title: '材料图号', minWidth: 80 },
    { field: 'materialName', title: '材料名称', minWidth: 200 },
    { field: 'unit', title: '单位', minWidth: 80 },
    { field: 'stockQuality', title: '库存数量', minWidth: 80 },
    { field: 'minPackNumber', title: '最小包装数', minWidth: 100 },
    { field: 'safeLevel', title: '安全量', minWidth: 80 },
  ],
  rowConfig: {
    isCurrent: true,
    isHover: true,
  },
  height: 300,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        return await queryData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true,
    refresh: false,
    zoom: true,
  },
};

// 当前选中的行数据
const selectedRow = ref<any>({});

// 表格行切换事件
const gridEvents: any = {
  currentRowChange: ({ row }: any) => {
    selectedRow.value = { ...row };
    gridBottomApi.reload();
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 查询参数
const queryParams = ref<any>({
  houseType: 2,
});

/**
 * 查询上方表格数据
 * @param page - 当前页码
 * @param pageSize - 每页条数
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams.value,
      pageNum: page,
      pageSize,
    };

    // 处理日期范围
    if (params.searchTime && params.searchTime.length === 2) {
      params.startTime = params.searchTime[0].format('YYYY-MM-DD');
      params.endTime = params.searchTime[1].format('YYYY-MM-DD');
      params.searchTime = undefined;
    }

    // 添加选中的树节点参数
    if (selectedNode.value) {
      Object.assign(params, selectedNode.value);
    }

    queryScadaWarehouseStockByLocation(params)
      .then(({ total, results }) => {
        resolve({ total, items: results });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// endregion

// region 下方表格（库存明细）

const gridBottomOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'storageCode', title: '所在储位', minWidth: 100 },
    { field: 'wareHouse', title: '所在仓库', minWidth: 100 },
    { field: 'wareArea', title: '所在库区', minWidth: 120 },
    { field: 'wareLocation', title: '所在库位', minWidth: 80 },
    { field: 'labelCode', title: '条码编号', minWidth: 150 },
    { field: 'checkResult', title: '质检结论', minWidth: 100 },
    { field: 'stockQuality', title: '库存数', minWidth: 100 },
    { field: 'manufacturerName', title: '供应厂商', minWidth: 100 },
    { field: 'validDate', title: '有效期', minWidth: 90 },
    { field: 'batchCode', title: '供应商批次号', minWidth: 120 },
    { field: 'produceDate', title: '制造日期', minWidth: 90 },
    { field: 'contractCode', title: '单据号', minWidth: 100 },
  ],
  height: 300,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        return await queryBottomData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [GridBottom, gridBottomApi] = useVbenVxeGrid({
  gridOptions: gridBottomOptions,
});

/**
 * 查询下方表格数据（基于上方表格选中的行）
 * @param page - 当前页码
 * @param pageSize - 每页条数
 */
function queryBottomData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 未选中行时返回空数据
    if (!selectedRow.value?.materialCode) {
      resolve({ total: 0, items: [] });
      return;
    }

    const params = {
      materialCode: selectedRow.value.materialCode,
      batchCode: queryParams.value.batchCode,
      pageNum: page,
      pageSize,
    };

    if (selectedNode.value) {
      Object.assign(params, selectedNode.value);
    }

    queryScadaWarehouseStockDetail(params)
      .then(({ total, results }) => {
        resolve({ total, items: results });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// endregion

// region 仓库树查询

// 仓库类型选项
// const types = [
//   {
//     label: $t('storeManagement.inventoryManagement.physicalWarehouse'),
//     value: 2,
//   },
//   {
//     label: $t('storeManagement.inventoryManagement.logicalRepositories'),
//     value: 1,
//   },
// ];

// 仓库树相关
const repositoryList = ref<any>([]);
const selectedKeys = ref<any>([]);
const selectedNode = ref<any>({});

/**
 * 查询仓库树数据
 */
function queryPhysicalWarehouse() {
  const ob =
    queryParams.value.houseType === 2
      ? queryScadaPhysicalWarehouseTree()
      : queryScadaLogicalWarehouseTree();
  ob.then((data: any) => {
    repositoryList.value = data;
  });
}

/**
 * 树节点选择变更
 * @param _key - 选中的key
 * @param info - 节点信息
 */
function selectChange(_key: any, { node: { type, id }, selected }: any) {
  selectedNode.value = selected ? { type, id } : {};
  selectedRow.value = {};
  gridApi.reload();
  gridBottomApi.reload();
}

// endregion

// region 初始化

const route = useRoute();
const author = ref<string[]>([]);

onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  queryPhysicalWarehouse();
});

// endregion
</script>

<template>
  <Page>
    <!-- 搜索表单 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 材料编号 -->
        <FormItem
          :label="$t('storeManagement.inventoryManagement.materialNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialCode" />
        </FormItem>
        <!-- 材料名称 -->
        <FormItem
          :label="$t('storeManagement.inventoryManagement.materialName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialName" />
        </FormItem>
        <!-- 供应商批次号 -->
        <FormItem
          :label="$t('storeManagement.inventoryManagement.vendorLotNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.batchCode" />
        </FormItem>
        <!-- 单号 -->
        <FormItem
          :label="$t('storeManagement.inventoryManagement.number')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.worksheetCode" />
        </FormItem>
        <!-- 期间库存时间分区 -->
        <FormItem
          :label="
            $t(
              'storeManagement.inventoryManagement.periodInventoryTimePartition',
            )
          "
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.searchTime" />
        </FormItem>

        <!-- 仓库类型 -->
        <!--        <FormItem
          :label="$t('storeManagement.inventoryManagement.warehouseType')"
          style="margin-bottom: 1em"
        >
          <RadioGroup
            v-model:value="queryParams.houseType"
            :options="types"
            @change="queryPhysicalWarehouse"
          />
        </FormItem>-->

        <!-- 搜索按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="
              () => {
                selectedRow = {};
                gridApi.reload();
                gridBottomApi.reload();
              }
            "
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 主内容区域 -->
    <Row :gutter="24">
      <!-- 左侧仓库树 -->
      <Col :span="6">
        <Card class="mb-8">
          <Tree
            v-model:selected-keys="selectedKeys"
            @select="selectChange"
            :tree-data="repositoryList"
            :field-names="{ children: 'children', title: 'name' }"
          />
        </Card>
      </Col>

      <!-- 右侧表格区域 -->
      <Col :span="18">
        <!-- 上方库存汇总表格 -->
        <Card class="mb-8">
          <Grid>
            <template #status="{ row, column }">
              <Checkbox v-model:checked="row[column.field]" disabled />
            </template>
          </Grid>
        </Card>

        <!-- 下方库存明细表格 -->
        <Card class="mb-8">
          <GridBottom />
        </Card>
      </Col>
    </Row>
  </Page>
</template>

<style scoped lang="scss">
/* 暂无自定义样式 */
</style>
