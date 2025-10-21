<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
  Checkbox,
  Col,
  DirectoryTree,
  Form,
  FormItem,
  Input,
  Row,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getBomTypeTree, getProductBomList } from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格操作

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'bomTypeName', title: 'BOM类别', minWidth: 80 },
    { field: 'productTypeName', title: '产品类别', minWidth: 80 },
    { field: 'productCode', title: '产品编号', minWidth: 100 },
    { field: 'productName', title: '产品名称', minWidth: 100 },
    {
      field: 'isLock',
      title: '锁定',
      minWidth: 100,
      slots: { default: 'selectedState' },
    },
    {
      field: 'isAudit',
      title: '审核',
      slots: { default: 'selectedState' },
      minWidth: 100,
    },
    {
      field: 'isHalf',
      title: '半成品',
      slots: { default: 'selectedState' },
      minWidth: 100,
    },
    { field: 'materialCode', title: '材料编号', minWidth: 100 },
    { field: 'remark', title: '备注说明', minWidth: 100 },
    { field: 'sourceProduct', title: '来源产品', minWidth: 100 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 120,
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
          page: page?.currentPage,
          pageSize: page?.pageSize,
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

// 当前选中的节点
const selectedKey = ref<any>(undefined);

// endregion

// region 数据查询

// 查询参数
const queryParams = ref({
  // 类别编号
  productCode: '',
  // 类别名称
  productName: '',
});

/**
 * 查询数据
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = queryParams.value;
    if (selectedKey.value && selectedKey.value.code) {
      params.bomTypeCode = selectedKey.value.code;
    }
    // 调用 listStations API函数，传递查询参数和分页信息
    getProductBomList({
      ...params, // 展开queryParams.value中的所有查询参数
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ total, list }) => {
        // 成功获取数据后，更新数据列表和总条数
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

// region 树形菜单操作

// 当前展开的节点
const expandedKeys = ref<string[]>([]);
// 当前选中的节点
const selectedKeys = ref<string[]>([]);
// 节点数据
const treeData = ref<any[]>([]);

/**
 * 查询类别树
 */
function queryAllCategoryTree() {
  // 调用 getBomTypeTree API函数，获取菜单列表
  getBomTypeTree().then((data) => {
    // 检查返回的数据是否存在且长度大于0
    if (data) {
      // 如果数据有效，更新treeData
      treeData.value = [data];
    }
  });
}

/**
 * 处理树形控件选中事件
 * @param {any} _selectedKeys - 当前选中的节点键值
 * @param {object} info - 包含节点和选中状态的对象
 * @param {object} info.node - 当前操作的节点对象
 * @param {boolean} info.selected - 节点的选中状态
 */
function selectedTree(_selectedKeys: any, { node, selected }: any) {
  selectedKey.value = selected && node.orgLevel < 3 ? node : undefined;
  gridApi.reload();
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 初始化

// 当组件挂载到DOM上后，立即执行的函数
onMounted(() => {
  // 调用queryAuth函数，用于获取用户权限信息
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  // 调用 queryAllCategoryTree 函数，用于获取类别数据
  queryAllCategoryTree();
});
// todo 暂时做不下去了, 需要数据查看样式
// endregion
</script>

<template>
  <Page>
    <Space direction="vertical" style="width: 100%">
      <Card>
        <Form :model="queryParams" layout="inline">
          <!-- 类别编号 -->
          <FormItem
            :label="$t('basic.productBom.productNumber')"
            style="margin-bottom: 1em"
          >
            <Input v-model:value="queryParams.productCode" />
          </FormItem>
          <!-- 类别名称 -->
          <FormItem
            :label="$t('basic.productBom.productName')"
            style="margin-bottom: 1em"
          >
            <Input v-model:value="queryParams.productName" />
          </FormItem>

          <FormItem>
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
      <!-- region 主要内容显示区域 -->
      <Row :gutter="16">
        <!-- region 树形菜单 -->
        <Col :lg="6" :md="8" :sm="8" :xl="8" :xs="8">
          <Card class="h-[60vh] overflow-y-auto">
            <DirectoryTree
              v-model:expanded-keys="expandedKeys"
              v-model:selected-keys="selectedKeys"
              :auto-expand-parent="true"
              :field-names="{
                children: 'children',
                title: 'orgFullName',
                key: 'orgCode',
              }"
              :tree-data="treeData"
              @select="selectedTree"
            />
          </Card>
        </Col>
        <!-- endregion -->

        <!-- region 表格主体 -->
        <Col :lg="16" :md="16" :sm="16" :xl="16" :xs="16">
          <Card class="h-[60vh] overflow-y-auto">
            <Grid>
              <template #selectedState="{ row, column }">
                <Checkbox v-model:checked="row[column.field]" disabled />
              </template>
            </Grid>
          </Card>
        </Col>
        <!-- endregion -->
      </Row>
      <!-- endregion -->
    </Space>
  </Page>
</template>

<style scoped></style>
