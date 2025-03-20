<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';

import { MdiSearch } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Checkbox,
  Col,
  Form,
  FormItem,
  Input,
  Row,
  Tree,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  materialTypeGetByMaterialCodeAndName,
  materialTypeGetTree,
} from '#/api';

const props = defineProps({
  applyOrgCode: {
    type: String,
    required: true,
  },
});
// 事件定义
const defaultEmits = defineEmits(['changed']);

// region 树菜单数据查询
// 树菜单数据
const treeData = ref<any>([]);
// 树菜单字段自定义
const fieldNames = ref({
  children: 'children',
  title: 'typeName',
});

function queryTree() {
  materialTypeGetTree().then((data) => {
    treeData.value = [data];
  });
}

// endregion

// region 数据查询
// 查询条件
const queryParams = ref<any>({});

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { type: 'radio', width: 60 },
    {
      field: 'isQualityTest',
      slots: { default: 'selectedState' },
      title: '质检',
      minWidth: 80,
    },
    {
      field: 'isHalf',
      slots: { default: 'selectedState' },
      title: '半成品',
      minWidth: 80,
    },
    { field: 'materialCode', title: '材料编号', minWidth: 150 },
    { field: 'materialName', title: '材料名称', minWidth: 250 },
    { field: 'unit', title: '单位', minWidth: 150 },
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
  scrollY: {
    enabled: true,
    gt: 30,
  },
  scrollX: {
    enabled: true,
    gt: 0,
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: any = {
  radioChange: () => {
    RadioChange();
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

function RadioChange() {
  defaultEmits('changed', gridApi.grid.getRadioRecord());
}

/**
 * 查询物料列表
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve) => {
    materialTypeGetByMaterialCodeAndName({
      ...queryParams.value,
      orgCode: props.applyOrgCode,
      pageNum: page,
      pageSize,
    }).then(({ total, results }) => {
      resolve({
        total,
        items: results,
      });
    });
  });
}

// endregion

// 初始化
function init() {
  queryTree();
}

onMounted(() => {
  init();
});
</script>

<template>
  <Row :gutter="20">
    <Col span="6">
      <Tree
        :tree-data="treeData"
        :field-names="fieldNames"
        class="h-full pt-4"
      />
    </Col>
    <Col span="18">
      <Form :model="queryParams" layout="inline">
        <!-- 材料名称 -->
        <FormItem
          :label="$t('storesRequisition.materialName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialName" />
        </FormItem>
        <!-- 材料编号 -->
        <FormItem
          :label="$t('storesRequisition.materialNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialCode" />
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

      <Grid>
        <template #selectedState="{ row, column }">
          <Checkbox v-model:checked="row[column.field]" disabled />
        </template>
      </Grid>
    </Col>
  </Row>
</template>

<style scoped></style>
