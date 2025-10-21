<script lang="ts" setup>
import type { TreeProps } from 'ant-design-vue';

import { computed, h, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
  Col,
  Form,
  FormItem,
  Input,
  Row,
  Table,
  Tree,
} from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { difference } from 'lodash-es';

import { $t } from '#/locales';

// region 查询数据
// 查询参数
const queryParams = ref({
  // 展示方式
  ruleDisplayMode: '',
  // 规则名称
  ruleName: '',
  // 所属类型
  type: '',
});

// endregion

// region 树形菜单操作
// 当前展开的节点
const expandedKeys = ref<string[]>([]);
// 当前选中的节点
const selectedKeys = ref<string[]>([]);
// 节点数据
const treeData = ref<TreeProps['treeData']>([{ key: '0', title: '全部' }]);

// 远程加载节点数据
function onLoadData(treeNode: any) {
  return new Promise<void>((resolve) => {
    if (treeNode.dataRef?.children) {
      resolve();
      return;
    }
    setTimeout(() => {
      treeNode.dataRef!.children = [
        { key: `${treeNode.eventKey}-0`, title: 'Child Node' },
        { key: `${treeNode.eventKey}-1`, title: 'Child Node' },
      ];
      treeData.value = [...treeData.value!];
      resolve();
    }, 1000);
  });
}

function handleExpand(keys: string[], { expanded, node }: any) {
  // node.parent add from 3.0.0-alpha.10
  const tempKeys = ((node.parent ? node.parent.children : treeData) || []).map(
    ({ key }: any) => key,
  );
  expandedKeys.value = expanded
    ? [...difference(keys, tempKeys), node.key]
    : keys;
}

// endregion

// region 表格操作

// 表格列名
const columns = ref([
  {
    dataIndex: 'step',
    ellipsis: true,
    title: '#',
    width: 60,
  },
  {
    dataIndex: 'typeCode',
    ellipsis: true,
    title: '类别编号',
    width: 120,
  },
  {
    dataIndex: 'typeName',
    ellipsis: true,
    title: '类别名称',
    width: 120,
  },
  {
    dataIndex: 'typeLevel',
    ellipsis: true,
    title: '类别等级',
    width: 120,
  },
] as any[]);
// 表格滚动信息配置
const scroll = ref({
  scrollToFirstRowOnChange: true,
  x: 1500,
  y: 350,
});

// 表格数据
const data = ref([
  {
    typeCode: '001',
    typeLevel: '一级',
    typeName: '类别A',
  },
  {
    typeCode: '002',
    typeLevel: '二级',
    typeName: '类别B',
  },
  {
    typeCode: '003',
    typeLevel: '三级',
    typeName: '类别C',
  },
  {
    typeCode: '004',
    typeLevel: '一级',
    typeName: '类别D',
  },
  {
    typeCode: '005',
    typeLevel: '二级',
    typeName: '类别E',
  },
]);

// 表格分页信息
const pagination = computed(() => ({
  current: 5,
  pageSize: 20,
  total: 200,
}));

/**
 * 分页信息改变事件
 */
function paginationChange(page: any) {
  pagination.value.current = page.current;
  pagination.value.pageSize = page.pageSize;
}

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 类别编号 -->
        <FormItem
          :label="$t('basic.productCategory.categoryNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.ruleName" />
        </FormItem>
        <!-- 类别名称 -->
        <FormItem
          :label="$t('basic.productCategory.categoryName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.ruleName" />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 主要内容显示区域 -->

    <Row :gutter="16">
      <!-- region 树形菜单 -->
      <Col :lg="6" :md="8" :sm="4" :xl="4" :xs="10">
        <Card class="min-h-96">
          <Tree
            v-model:expanded-keys="expandedKeys"
            v-model:selected-keys="selectedKeys"
            :load-data="onLoadData"
            :tree-data="treeData"
            @expand="handleExpand"
          />
        </Card>
      </Col>
      <!-- endregion -->
      <!-- region 表格主体 -->
      <Col :lg="18" :md="16" :sm="20" :xl="20" :xs="14">
        <Card>
          <Table
            :columns="columns"
            :data-source="data"
            :pagination="pagination"
            :scroll="scroll"
            bordered
            @change="paginationChange"
          >
            <template #bodyCell="{ column, index }">
              <template v-if="column.dataIndex === 'step'">
                <span>{{ index + 1 }}</span>
              </template>
            </template>
          </Table>
        </Card>
      </Col>
      <!-- endregion -->
    </Row>

    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
