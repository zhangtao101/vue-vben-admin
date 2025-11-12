<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import { Button, Card, Form, FormItem, Input, Select } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  exportQualityCheckStandard,
  queryMeasureMethodList,
  queryQualityCheckStandard,
} from '#/api';

// region 表格

/**
 * 表格配置项
 * 定义了质检标准表格的列信息、高度、排序等配置
 */
const gridOptions: VxeGridProps<any> = {
  align: 'center', // 内容居中对齐
  border: true, // 显示表格边框

  rowConfig: {
    drag: true, // 允许行拖拽
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'standardTypeName', title: '标准类型', minWidth: 80 },
    { field: 'productCode', title: '产品编号', minWidth: 200 },
    { field: 'itemCode', title: '质检项编号', minWidth: 150 },
    { field: 'produceName', title: '所属工序', minWidth: 150 },
    { field: 'itemName', title: '质检项名称', minWidth: 150 },
    { field: 'measureMethodName', title: '测量方法', minWidth: 100 },
    { field: 'measureMethodType', title: '测量类型', minWidth: 100 },
    { field: 'judgeDescription', title: '判定要求', minWidth: 150 },
    { field: 'numberType', title: '数值类型', minWidth: 80 },
    { field: 'standardValue', title: '标准值', minWidth: 80 },
    { field: 'upperTolerance', title: '上公差', minWidth: 80 },
    { field: 'lowerTolerance', title: '下公差', minWidth: 80 },
    { field: 'unit', title: '单位', minWidth: 80 },
  ],
  height: 500, // 表格高度
  stripe: true, // 启用斑马纹
  sortConfig: {
    multiple: true, // 允许多列排序
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        return await queryData({
          // 调用查询数据方法
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true, // 使用自定义工具栏
    refresh: true, // 显示刷新按钮
    zoom: true, // 显示缩放按钮
  },
};
/**
 * 创建表格实例和API
 */
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/**
 * 查询参数对象
 * 用于存储用户输入的搜索条件
 */
const queryParams = ref<any>({});

/**
 * 查询数据函数
 * 根据当前的查询参数、分页信息，从后端服务查询质检标准数据
 * @param {object} params - 查询参数对象
 * @param {number} params.page - 当前页码
 * @param {number} params.pageSize - 每页显示条数
 * @returns {Promise<object>} 返回包含总条数和数据列表的Promise对象
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 构建查询参数对象，合并用户输入的查询条件和分页信息
    const params = {
      ...queryParams.value,
      pageNum: page, // 当前页码
      pageSize, // 每页显示条数
    };

    // 如果标准类型为-1（全部），则删除该参数，避免影响后端查询
    if (params.standardType === -1) {
      delete params.standardType;
    }

    // 调用API查询数据
    queryQualityCheckStandard(params)
      .then(({ total, results }) => {
        // 成功时解析Promise，返回总条数和数据列表
        resolve({
          total,
          items: results,
        });
      })
      .catch((error) => {
        // 失败时拒绝Promise
        reject(error);
      });
  });
}

// endregion

// region 查询度量方法列表

/**
 * 度量方法列表数据
 * 用于在搜索表单中提供可选的测量方法
 */
const listOfMeasurementMethods = ref<any[]>([]);

/**
 * 查询度量方法列表
 * 从后端获取所有可用的测量方法，并转换为Select组件需要的格式
 */
function queryTheListOfMeasurementMethods() {
  queryMeasureMethodList().then(({ results }) => {
    listOfMeasurementMethods.value = results.map((item: any) => ({
      label: item.measureMethodName, // 显示文本
      value: item.measureMethodName, // 实际值
    }));
  });
}

// endregion

// region 导出

/**
 * 导出质检标准数据
 * 根据当前查询条件，导出符合条件的质检标准数据
 */
function exportFile() {
  const params: any = { ...queryParams.value }; // 复制当前查询参数
  exportQualityCheckStandard(params).then((data) => {
    window.open(data); // 打开下载链接
  });
}

// endregion

/**
 * 生命周期钩子：组件挂载时执行
 * 初始化度量方法列表数据
 */
// 注意：当前模板中引用了showEdit和delRow函数，但脚本部分并未定义这些函数
// 这可能是一个功能缺失或错误，在实际使用时可能会导致运行时错误

/**
 * 组件挂载完成后调用
 * 初始化度量方法列表数据
 */
onMounted(() => {
  queryTheListOfMeasurementMethods();
});
</script>

<template>
  <Page>
    <!-- 搜索区域卡片 -->
    <Card class="mb-8">
      <!-- 查询表单 -->
      <Form :model="queryParams" layout="inline">
        <!-- 产品编号输入框 -->
        <FormItem
          :label="
            $t('qualityModule.qualityCheck.qualityBaseSet.standardItem.code')
          "
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productCode" />
        </FormItem>
        <!-- 所属工序输入框 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.formQualityCheckItem.process',
            )
          "
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.produceName" />
        </FormItem>
        <!-- 质检项编号输入框 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckDetail.code',
            )
          "
        >
          <Input v-model:value="queryParams.itemCode" />
        </FormItem>
        <!-- 质检项名称输入框 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckDetail.name',
            )
          "
        >
          <Input v-model:value="queryParams.itemName" />
        </FormItem>
        <!-- 度量方法选择器 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.standardItem.measureMethod',
            )
          "
        >
          <Select
            v-model:value="queryParams.measureMethodName"
            :options="listOfMeasurementMethods"
            allow-clear
            class="!w-48"
          />
        </FormItem>
        <!-- 搜索按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="() => gridApi.reload()">
            <Icon icon="mdi:search" class="inline-block align-middle text-xl" />
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域卡片 -->
    <Card>
      <!-- 渲染质检标准表格组件 -->
      <Grid>
        <template #toolbar-tools>
          <!-- 导出按钮 -->
          <Button type="primary" @click="exportFile()">
            {{ $t('common.export') }}
          </Button>
        </template>
      </Grid>
    </Card>
  </Page>
</template>

<style scoped></style>
