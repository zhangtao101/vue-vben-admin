<script lang="ts" setup>
/**
 * 变更任务管理页面
 * 用于管理工艺参数模板和工艺路线的变更任务
 * 功能包括：查询变更任务列表、查看变更详情、执行变更操作
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Select,
  SelectOption,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { changeUse, queryChange, queryChangeDetail } from '#/api';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 主表格配置

/**
 * 主表格配置选项
 * 显示变更任务列表，包含变更任务编号、变更类型、变更前后版本、状态等字段
 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'changeCode', title: '变更任务编号', minWidth: 120 },
    { field: 'changeTypeName', title: '变更类型', minWidth: 120 },
    { field: 'changeBeforeVersion', title: '变更前版本', minWidth: 120 },
    { field: 'changeAfterVersion', title: '变更后版本', minWidth: 120 },
    { field: 'stateName', title: '变更任务状态', minWidth: 120 },
    { field: 'changeTime', title: '变更时间', minWidth: 120 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 100,
    },
  ],
  height: '500px',
  stripe: true,
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        return await queryChangeListData({
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

/**
 * 主表格事件
 */
const gridEvents: VxeGridListeners<any> = {};

/**
 * 主表格实例和 API
 */
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// endregion

// region 查询参数

/**
 * 查询参数
 * 包含变更任务编号、变更类型等筛选条件
 */
const queryParams = ref<any>({
  changeCode: '',
  changeType: '',
});

/**
 * 查询变更任务列表数据
 * @param page 当前页码
 * @param pageSize 每页条数
 * @returns Promise 包含列表和总数的对象
 */
function queryChangeListData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams.value,
      pageNum: page,
      pageSize,
    };
    queryChange(params)
      .then(({ list, total }: any) => {
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

/**
 * 处理查询操作
 * 重置页码并重新加载表格数据
 */
function handleSearch() {
  gridApi.reload();
}

// endregion

// region 详情抽屉

/**
 * 对话框显示状态
 */
const detailsVisible = ref<boolean>(false);
/**
 * 详情数据
 */
const editItem = ref<any>({});
/**
 * 选中的行
 */
const selectedRow = ref<any[]>([]);

// endregion

// region 详情表格配置

/**
 * 详情表格列配置
 */
const detailsColumns = ref<any[]>([]);

/**
 * 详情表格配置选项
 * 显示变更详情列表，支持复选框选择
 */
const detailsGridOptions = computed<VxeGridProps<any>>(() => ({
  align: 'center',
  border: true,
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns: detailsColumns.value,
  data: [],
  height: 350,
  pagerConfig: {
    enabled: false,
  },
  stripe: true,
}));

/**
 * 详情表格事件
 * 处理复选框变化和全选事件
 */
const detailsGridEvents: VxeGridListeners<any> = {
  checkboxChange: ({ checked, row }) => {
    if (checked) {
      const exists = selectedRow.value.some((r) => r.id === row.id);
      if (!exists) {
        selectedRow.value.push(row.id);
      }
    } else {
      selectedRow.value = selectedRow.value.filter((r) => r !== row.id);
    }
  },
  checkboxAll: ({ checked, records }) => {
    selectedRow.value = checked ? records.map((r: any) => r.id) : [];
  },
};

/**
 * 详情表格实例和 API
 */
const [DetailsGrid, detailsGridApi] = useVbenVxeGrid({
  gridEvents: detailsGridEvents,
  gridOptions: detailsGridOptions.value,
});

/**
 * 工艺路线变更表格列配置
 */
const changeOfProcessRoute = [
  {
    field: 'productCode',
    title: '绑定产品编号',
    width: 120,
  },
  {
    field: 'productName',
    title: '绑定产品名称',
    width: 120,
  },
];

/**
 * 工艺参数模板变更表格列配置
 */
const processParameterTemplate = [
  {
    field: 'routeCode',
    title: '对应工艺路线编号',
    width: 180,
  },
  {
    field: 'routeName',
    title: '对应工艺路线名称',
    width: 180,
  },
];

/**
 * 公共表格头配置
 */
const tableHeaders = [
  {
    field: 'useVersion',
    title: '更新后的版本号',
    width: 160,
  },
  {
    field: 'nowVersion',
    title: '当前对应使用的版本',
    width: 160,
  },
  {
    field: 'useStateName',
    title: '应用状态',
    width: 120,
  },
];

// endregion

// region 详情/变更操作

/**
 * 显示详情
 * @param row 行数据
 */
function showDetails(row: any) {
  editItem.value = { ...row };
  detailsVisible.value = true;
  selectedRow.value = [];
  // 根据变更类型设置表格列
  const columns =
    editItem.value.changeType === 1
      ? [...processParameterTemplate, ...tableHeaders]
      : [...changeOfProcessRoute, ...tableHeaders];
  detailsColumns.value = columns;
  queryChangeDetail(editItem.value.id || 1)
    .then((d) => {
      detailsGridApi.grid.reloadData(d);
    })
    .catch(() => {
      detailsGridApi.grid.reloadData([]);
    });
}

/**
 * 关闭抽屉
 */
function closeDetails() {
  editItem.value = {};
  detailsVisible.value = false;
  detailsGridApi.grid.reloadData([]);
  selectedRow.value = [];
}

/**
 * 提交变更操作
 */
function submitChange() {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消变更!');
    },
    onOk() {
      if (selectedRow.value.length > 0) {
        changeUse({
          bindingIds: selectedRow.value,
          changeRecordId: editItem.value.id,
        })
          .then(() => {
            message.success($t('common.successfulOperation'));
            gridApi.reload();
            closeDetails();
          })
          .catch((error: any) => {
            message.error($t('common.operationFailure'));
            message.error(error.msg);
          });
      } else {
        message.error('至少选择一条数据!');
      }
    },
    title: '是否确认变更?',
  });
}

// endregion

// region 权限

/**
 * 权限列表
 */
const author = ref<string[]>([]);

// endregion

/**
 * 组件挂载时执行
 * 查询权限列表
 */
onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// endregion
</script>

<template>
  <Page class="bg-background-deep">
    <!-- region 搜索 -->
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 变更任务编号 -->
        <FormItem
          :label="$t('changeOperation.changeOperationNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.changeCode" />
        </FormItem>
        <!-- 变更类型 -->
        <FormItem
          :label="$t('changeOperation.changeOperationType')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.changeType"
            style="width: 180px !important"
          >
            <SelectOption :value="1">工艺参数模板变更</SelectOption>
            <SelectOption :value="2">工艺路线变更</SelectOption>
          </Select>
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="handleSearch">
            <Icon icon="mdi:magnify" class="mr-2" />
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <Card>
      <div>
        <Grid>
        <template #action="{ row }">
          <Button type="link" class="!p-1" @click="showDetails(row)">
            <Icon icon="mdi:eye" class="text-xl" />
          </Button>
        </template>
      </Grid>
      </div>
    </Card>

    <!-- 详情抽屉 -->
    <Drawer
      v-model:open="detailsVisible"
      :footer-style="{ textAlign: 'right' }"
      :width="800"
      title="详情"
      @close="closeDetails"
    >
      <Descriptions :column="2" bordered>
        <DescriptionsItem label="变更编号">
          {{ editItem.changeCode }}
        </DescriptionsItem>
        <DescriptionsItem label="变更类型">
          {{ editItem.changeTypeName }}
        </DescriptionsItem>
        <DescriptionsItem label="变更前版本">
          {{ editItem.changeBeforeVersion }}
        </DescriptionsItem>
        <DescriptionsItem label="当前版本">
          {{ editItem.changeAfterVersion }}
        </DescriptionsItem>
      </Descriptions>

      <div class="mt-8">
        <DetailsGrid />
      </div>

      <template #footer>
        <Space>
          <Button @click="closeDetails">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="primary" @click="submitChange">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
