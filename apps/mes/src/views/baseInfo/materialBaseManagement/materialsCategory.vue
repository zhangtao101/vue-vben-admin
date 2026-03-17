<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
  Col,
  DirectoryTree,
  Form,
  FormItem,
  Input,
  Row,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { queryMaterialCategoryList, queryMaterialTree } from '#/api';
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
    { field: 'typeCode', title: '类别编号', minWidth: 100 },
    { field: 'typeName', title: '类别名称', minWidth: 100 },
    { field: 'typeLevel', title: '类别等级', minWidth: 100 },
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
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 当前选中的节点
const selectedKey = ref<any>(undefined);

// endregion

// region 数据查询

// 查询参数
const queryParams = ref({
  // 类别编号
  typeCode: '',
  // 类别名称
  typeName: '',
});

/**
 * 查询数据
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = queryParams.value;
    // 设置 selectedTypeCode
    if (selectedKey.value && selectedKey.value.typeCode !== undefined) {
      params.selectedTypeCode = selectedKey.value.typeCode;
    }
    // 调用 queryMaterialCategoryList API函数，传递查询参数和分页信息
    queryMaterialCategoryList({
      ...params,
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then((response: any) => {
        // 根据响应结构获取数据
        const data = response.data || response;
        // 成功获取数据后，更新数据列表和总条数
        resolve({
          total: data.total,
          items: data.results,
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
const treeData = ref<any[]>([
  {
    typeCode: '',
    typeName: '全部',
    childs: [],
  },
]);

/**
 * 查询物料类别树
 */
function queryAllMaterialTree() {
  // 调用 queryMaterialTree API函数，获取菜单列表
  queryMaterialTree().then((response: any) => {
    // 根据响应结构获取数据
    const data = response.data || response;
    console.log('物料类别树数据:', data);
    // 检查返回的数据是否存在且长度大于0
    if (data) {
      // 将数据赋值给根节点的childs
      treeData.value[0].childs = data;
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
function selectedTree(_selectedKeys: any, info: any) {
  const { node, selected } = info;
  // 选中的节点设置到selectedKey用于查询
  selectedKey.value = selected ? node : undefined;
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
  // 调用 queryAllMaterialTree 函数，用于获取类别数据
  queryAllMaterialTree();
});

// endregion
</script>

<template>
  <Page>
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 类别编号 -->
        <FormItem
          :label="$t('basic.productCategory.categoryNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.typeCode" />
        </FormItem>
        <!-- 类别名称 -->
        <FormItem
          :label="$t('basic.productCategory.categoryName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.typeName" />
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
            :default-expand-all="true"
            :field-names="{
              children: 'childs',
              title: 'typeName',
              key: 'typeCode',
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
          <Grid />
        </Card>
      </Col>
      <!-- endregion -->
    </Row>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
