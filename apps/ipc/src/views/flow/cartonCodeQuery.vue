<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button, Card, Form, FormItem, Input, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getStorageDetailByCode } from '#/api/flow/cartonCodeQuery.service';
import { queryAuth } from '#/util';

/**
 * 箱码查询组件
 * 用于通过箱码查询库存明细信息
 * 主要功能：输入箱码查询物料详情、展示库存数据
 */

// region 表格配置

// VXE表格配置对象，定义了库存明细表格的结构和行为
const gridOptions: VxeGridProps<any> = {
  align: 'center', // 表格内容居中对齐
  border: true, // 显示表格边框
  columns: [
    { field: 'materialCode', title: '料号', minWidth: 150 }, // 物料的唯一编码
    { field: 'materialName', title: '物料名称', minWidth: 150 }, // 物料的描述性名称
    { field: 'materialDescriptionId', title: '物料特征ID', minWidth: 150 }, // 物料特征的标识ID
    { field: 'materialDescription', title: '物料特征', minWidth: 150 }, // 物料的详细特征描述
    { field: 'number', title: '数量', minWidth: 150 }, // 库存数量
    { field: 'unit', title: '单位', minWidth: 100 }, // 物料计量单位
    { field: 'manufacturerName', title: '供应商名称', minWidth: 150 }, // 物料供应商
    { field: 'batchCode', title: '批次号', minWidth: 150 }, // 物料批次
    { field: 'worksheetCode', title: '工单号', minWidth: 150 }, // 关联的工单单号
    { field: 'warehouseAreaCode', title: '储位', minWidth: 150 }, // 物料存储位置
  ],
  height: 500, // 表格固定高度
  stripe: true, // 显示斑马纹效果，提高可读性
  sortConfig: {
    multiple: true, // 启用多列排序功能
  },
  // 数据代理配置，处理表格数据的异步加载
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryData(); // 使用自定义查询函数获取数据
      },
    },
  },
  toolbarConfig: {
    custom: true, // 允许自定义列显示
    refresh: true, // 显示刷新按钮
    zoom: true, // 显示缩放按钮
  },
};

// 使用VXE表格适配器创建表格组件和API对象
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// 查询参数对象，存储当前查询条件
const queryParams = ref<any>({});

/**
 * 查询表格数据
 * 根据箱码查询对应的库存明细信息
 * @returns Promise 返回符合VXE表格数据格式的Promise对象
 */
function queryData() {
  return new Promise((resolve, reject) => {
    // 检查是否存在有效的箱码参数
    if (queryParams.value.packingCode) {
      getStorageDetailByCode(queryParams.value)
        .then((data: any) => {
          // 将接口返回的数据转换为VXE表格组件需要的标准格式
          resolve({
            total: data?.length || 0, // 数据总条数
            items: data || [], // 实际数据数组
          });
        })
        .catch((error) => {
          reject(error); // 请求失败时抛出错误，由表格组件处理
        });
    } else {
      resolve({
        total: 0,
        items: [],
      });
    }
  });
}

/**
 * 查询按钮点击事件
 * 刷新表格数据以显示最新查询结果
 */
function handleSearch() {
  gridApi.reload();
}

// endregion

// region 初始化

const route = useRoute(); // 路由信息对象
const author = ref<string[]>([]); // 当前页面按钮权限列表

onMounted(() => {
  // 查询当前页面的按钮权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// endregion
</script>

<!--
  箱码查询组件模板
  包含查询表单区域和数据表格区域
-->
<template>
  <Page>
    <!-- 查询表单区域，用于输入箱码 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 箱码输入框，支持回车键触发查询 -->
        <FormItem
          :label="$t('cartonCodeQuery.boxCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.packingCode"
            :placeholder="$t('cartonCodeQuery.pleaseEnterBoxCode')"
            allow-clear
            @keyup.enter="handleSearch"
          />
        </FormItem>

        <!-- 查询按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="handleSearch"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 数据表格区域，显示查询到的库存明细 -->
    <Card class="mb-8">
      <Grid />
    </Card>
  </Page>
</template>

<!-- 组件样式：使用Tailwind CSS类进行样式控制，暂无自定义样式规则 -->
<style scoped lang="scss">
/* 暂无自定义样式 */
</style>
