<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  RadioGroup,
  Row,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  queryScadaProductTraceDetailList,
  queryScadaProductTraceList,
  updateScadaProductTraceDetail,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

/**
 * 产品追溯设置组件
 * 用于制造执行系统中的产品追溯配置管理
 * 主要功能：
 * 1. 工艺路线的增删改查管理
 * 2. 工艺路线追溯详情的查看和编辑
 * 3. 追溯节点展示配置（追溯展示、详情信息展示、工艺参数展示、质检信息展示）
 * 4. 支持权限控制和国际化
 * 业务逻辑：通过配置工艺路线的各个环节，实现产品全生命周期追溯管理
 */

// 获取当前路由信息，用于权限查询
const route = useRoute();

// region 主表格配置和操作

// 主表格配置对象，用于展示工艺路线列表
const gridOptions: VxeGridProps<any> = {
  align: 'center', // 表格内容居中对齐
  border: true, // 显示表格边框
  columns: [
    { title: '序号', type: 'seq', width: 50 }, // 自动序号列
    { field: 'routeCode', title: '工艺路线编号', minWidth: 105 }, // 工艺路线的唯一标识
    { field: 'routeName', title: '工艺路线名称', minWidth: 105 }, // 工艺路线的显示名称
    { field: 'routeTypeName', title: '工艺路线类型', minWidth: 105 }, // 工艺路线的分类类型
    {
      field: 'action',
      fixed: 'right', // 操作列固定在右侧
      slots: { default: 'action' }, // 使用插槽自定义操作按钮
      title: '操作',
      width: 220, // 操作列宽度
    },
  ],
  height: 500, // 表格固定高度
  stripe: true, // 显示斑马纹效果，提高可读性
  sortConfig: {
    multiple: true, // 启用多列排序功能
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        // 使用异步查询函数获取表格数据
        return await queryData({
          page: page.currentPage, // 当前页码
          pageSize: page.pageSize, // 每页条数
        });
      },
    },
  },
  toolbarConfig: {
    custom: true, // 允许自定义列显示
    refresh: true, // 显示刷新按钮
    zoom: true, // 显示缩放按钮
  },
};

// 主表格事件监听器配置
const gridEvents: VxeGridListeners<any> = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

// 创建主表格组件和API对象
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });
// endregion

// region 追溯详情表格配置

// 追溯详情表格配置对象，用于展示工艺路线的详细信息
const detailsGridOptions: VxeGridProps<any> = {
  align: 'center', // 表格内容居中对齐
  border: true, // 显示表格边框
  columns: [
    { title: '序号', type: 'seq', width: 50 }, // 自动序号列
    { field: 'processCode', title: '过程编码', minWidth: 105 }, // 工艺过程的唯一标识
    { field: 'processName', title: '过程名称', minWidth: 105 }, // 工艺过程的显示名称
    { field: 'opTime', title: '操作时间', minWidth: 160 }, // 过程操作的时间记录
    { field: 'opUserName', title: '操作人', minWidth: 80 }, // 执行操作的人员姓名
    {
      field: 'isTrace',
      title: '追溯节点展示',
      minWidth: 120, // 追溯节点是否展示的状态
      slots: { default: 'isTrace' }, // 使用插槽自定义显示内容
    },
    {
      field: 'action',
      fixed: 'right', // 操作列固定在右侧
      slots: { default: 'action' }, // 使用插槽自定义操作按钮
      title: '操作',
      width: 220, // 操作列宽度
    },
  ],
  height: 500, // 表格固定高度
  stripe: true, // 显示斑马纹效果，提高可读性
  sortConfig: {
    multiple: true, // 启用多列排序功能
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        // 使用异步查询函数获取追溯详情数据
        return await queryDetails({
          page: page.currentPage, // 当前页码
          pageSize: page.pageSize, // 每页条数
        });
      },
    },
  },
  toolbarConfig: {
    custom: true, // 允许自定义列显示
    refresh: true, // 显示刷新按钮
    zoom: true, // 显示缩放按钮
  },
};

// 创建追溯详情表格组件和API对象
const [DetailsGrid, detailsGridApi] = useVbenVxeGrid({
  gridOptions: detailsGridOptions,
});

/**
 * 查询追溯详情数据
 * 根据工艺路线ID查询该路线下的所有工艺过程详情
 * @param page 页码
 * @param pageSize 每页条数
 * @returns Promise 返回符合VXE表格数据格式的Promise对象
 */
function queryDetails({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    queryScadaProductTraceDetailList({
      pageNum: page, // 当前页码
      pageSize, // 每页条数
      routeId: checkedRow.value.id, // 工艺路线ID
    }).then(({ total, list }) => {
      // 处理接口返回的Promise，获取总条数和数据列表
      resolve({
        total, // 数据总条数
        items: list, // 实际数据数组
      });
    });
  });
}
// endregion

// region 主表格操作功能

// 当前选中的工艺路线表格行数据
const checkedRow = ref<any>({});
// 编辑抽屉的显示状态控制
const showEditDrawer = ref(false);
// 是否显示详情区域的标志（此组件中似乎未使用）
const isShowDetails = ref(false);

/**
 * 打开编辑抽屉，用于新增或编辑工艺路线
 * @param row 表格行数据，为空时表示新增模式，有值时表示编辑模式
 */
function editRow(row?: any) {
  // 设置选中的行数据，深拷贝避免引用问题
  checkedRow.value = row
    ? {
        ...row, // 扩展运算符复制行数据
      }
    : {}; // 空对象表示新增模式
  showEditDrawer.value = true; // 显示编辑抽屉
}

/**
 * 关闭编辑抽屉
 * 清空选中数据并隐藏抽屉
 */
function onClose() {
  checkedRow.value = {}; // 清空选中的行数据
  showEditDrawer.value = false; // 隐藏编辑抽屉
  isShowDetails.value = false; // 重置详情显示状态
}

// endregion

// region 追溯配置管理功能

// 追溯配置表单的引用，用于表单验证
const editForm = ref();
// 当前选中的追溯详情行数据
const checkedDetailsRow = ref<any>({});
// 追溯配置抽屉的显示状态控制
const isShow = ref(false);

// 是/否选项配置，用于单选组件
const options = [
  {
    label: '是', // 显示文本
    value: 1, // 实际值：是
  },
  {
    label: '否', // 显示文本
    value: 2, // 实际值：否
  },
];

/**
 * 显示追溯配置界面
 * 打开右侧抽屉，配置当前工艺过程的追溯展示选项
 * @param row 追溯详情表格行数据
 */
function displayPresentationConfiguration(row: any) {
  isShow.value = true; // 显示配置抽屉
  checkedDetailsRow.value = {
    ...row, // 深拷贝行数据，避免引用问题
  };
}

/**
 * 关闭追溯配置界面
 * 清空选中数据并隐藏抽屉
 */
function closePresentationConfiguration() {
  isShow.value = false; // 隐藏配置抽屉
  checkedDetailsRow.value = {}; // 清空选中的详情行数据
}

/**
 * 提交追溯配置
 * 验证表单后更新追溯详情的展示配置
 * 业务逻辑：当追溯节点选择"否"时，关联设置其他选项也为"否"
 */
function presentationConfigurationSubmit() {
  editForm.value.validate().then(() => {
    // 构建提交参数，包含所有配置项
    const params = {
      ...checkedDetailsRow.value,
    };

    // 业务逻辑：如果追溯节点不展示，则其他选项也不展示
    if (params.isTrace === 2) {
      // 选择"否"
      params.isParam = 2; // 工艺参数不展示
      params.isDetail = 2; // 详情信息不展示
      params.isQcCheck = 2; // 质检信息不展示
    }

    // 调用更新接口保存配置
    updateScadaProductTraceDetail(params).then(() => {
      detailsGridApi.query(); // 刷新追溯详情表格
      message.success($t('common.successfulOperation')); // 显示成功提示
      closePresentationConfiguration(); // 关闭配置界面
    });
  });
}
// endregion

// region 主表格数据查询功能

// 主表格查询参数对象，存储用户输入的搜索条件
const queryParams = ref<any>({});

/**
 * 查询工艺路线列表数据
 * 这个函数用于向服务器发送请求，获取工艺路线列表数据，并更新前端的显示和分页信息
 * @param page 页码
 * @param pageSize 每页条数
 * @returns Promise 返回符合VXE表格数据格式的Promise对象
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    // 合并查询参数，包含用户输入的搜索条件
    const params = {
      ...queryParams.value, // 展开查询参数对象，包含工艺路线名称等搜索条件
    };

    // 调用接口查询工艺路线列表
    queryScadaProductTraceList({
      pageNum: page, // 当前页码
      pageSize, // 每页条数
      ...params, // 其他查询参数
    }).then(({ total, list }) => {
      // 处理接口返回的Promise，获取总条数和数据列表
      resolve({
        total, // 数据总条数，用于分页计算
        items: list, // 实际数据数组
      });
    });
  });
}

// endregion

// region 权限管理

// 当前页面的按钮权限列表，控制各种操作的显示
const author = ref<string[]>([]);

// endregion

// region 组件初始化

/**
 * 组件挂载后的初始化操作
 * 主要用于查询当前页面的操作权限
 */
onMounted(() => {
  // 根据路由元数据中的权限代码查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data; // 设置权限列表，用于控制按钮显示
  });
});

// endregion
</script>

<!--
  产品追溯设置组件模板
  包含搜索表单区域、主表格区域、编辑抽屉和追溯配置抽屉
-->
<template>
  <Page>
    <!-- 搜索表单区域，用于工艺路线名称筛选 -->
    <Card class="mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 工艺路线名称输入框 -->
        <FormItem
          :label="$t('tracingModule.productTraceSet.routingName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.routeName" />
        </FormItem>

        <!-- 搜索按钮 -->
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

    <!-- 主表格区域，显示工艺路线列表 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <!-- 新增工艺路线按钮，需要新增权限 -->
          <Button
            v-if="author.includes('新增')"
            type="primary"
            @click="editRow()"
          >
            {{ $t('common.add') }}
          </Button>
        </template>
        <template #action="{ row }">
          <!-- 编辑工艺路线按钮 -->
          <Tooltip>
            <template #title>{{ $t('common.edit') }}</template>
            <Button type="link" @click="editRow(row)">
              <Icon
                icon="mdi:edit-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>

    <!-- 工艺路线编辑抽屉，用于显示工艺路线的基本信息和追溯详情 -->
    <Drawer
      v-model:open="showEditDrawer"
      :footer-style="{ textAlign: 'right' }"
      height="80%"
      class="custom-class"
      placement="top"
      title="信息编辑"
      @close="onClose"
    >
      <!-- 工艺路线基本信息展示区域 -->
      <Row>
        <Col :span="8">
          <!-- 工艺路线编号显示（只读） -->
          <FormItem :label="$t('tracingModule.productTraceSet.routingNo')">
            {{ checkedRow.routeCode }}
          </FormItem>
        </Col>
        <Col :span="8">
          <!-- 工艺路线名称显示（只读） -->
          <FormItem :label="$t('tracingModule.productTraceSet.routingName')">
            {{ checkedRow.routeName }}
          </FormItem>
        </Col>
      </Row>
      <!-- 追溯详情表格区域 -->
      <div>
        <DetailsGrid v-if="showEditDrawer">
          <template #isTrace="{ row }">
            <!-- 追溯节点展示状态转换 -->
            {{ row.isTrace === 1 ? $t('status.yes') : $t('status.no') }}
          </template>
          <template #action="{ row }">
            <!-- 配置追溯展示按钮 -->
            <Tooltip>
              <template #title>{{ $t('common.edit') }}</template>
              <Button
                type="link"
                @click="displayPresentationConfiguration(row)"
              >
                <Icon
                  icon="mdi:edit-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
          </template>
        </DetailsGrid>
      </div>
    </Drawer>

    <!-- 追溯配置抽屉，用于配置工艺过程的展示选项 -->
    <Drawer
      v-model:open="isShow"
      :footer-style="{ textAlign: 'right' }"
      :width="400"
      class="custom-class"
      placement="right"
      title="信息编辑"
      @close="closePresentationConfiguration"
    >
      <Form
        ref="editForm"
        :label-col="{ span: 8 }"
        :model="checkedDetailsRow"
        :wrapper-col="{ span: 16 }"
      >
        <!-- 追溯节点展示配置 -->
        <FormItem
          :label="$t('tracingModule.productTraceSet.traceShow')"
          name="isTrace"
        >
          <RadioGroup
            v-model:value="checkedDetailsRow.isTrace"
            :options="options"
          />
        </FormItem>
        <!-- 详情信息展示配置 -->
        <FormItem
          :label="$t('tracingModule.productTraceSet.detailInfoShow')"
          name="isDetail"
        >
          <RadioGroup
            v-model:value="checkedDetailsRow.isDetail"
            :options="options"
          />
        </FormItem>
        <!-- 工艺参数信息展示配置 -->
        <FormItem
          :label="$t('tracingModule.productTraceSet.processParameterInfoShow')"
          name="isParam"
        >
          <RadioGroup
            v-model:value="checkedDetailsRow.isParam"
            :options="options"
          />
        </FormItem>
        <!-- 质检信息展示配置 -->
        <FormItem
          :label="
            $t(
              'tracingModule.productTraceSet.qualityInspectionInformationDisplay',
            )
          "
          name="isQcCheck"
        >
          <RadioGroup
            v-model:value="checkedDetailsRow.isQcCheck"
            :options="options"
          />
        </FormItem>
      </Form>
      <template #footer>
        <Space>
          <!-- 取消按钮：关闭抽屉且不保存 -->
          <Button @click="closePresentationConfiguration">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认按钮：验证表单并提交配置 -->
          <Button type="primary" @click="presentationConfigurationSubmit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<!-- 组件样式：当前使用Tailwind CSS类进行样式控制，暂无自定义样式规则 -->
<style scoped></style>
