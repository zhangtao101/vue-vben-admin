<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { IconifyIcon, MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  InputSearch,
  message,
  Radio,
  RadioGroup,
  RangePicker,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { bindingRoute, getRouteList, queryWorksheetState } from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'worksheetCode', title: '工单号', minWidth: 190 },
    { field: 'workstationCode', title: '工作站编号', minWidth: 150 },
    { field: 'productCode', title: '产品编号', minWidth: 150 },
    { field: 'productName', title: '产品名称', minWidth: 150 },
    { field: 'planDateStart', title: '计划开始时间', minWidth: 150 },
    { field: 'workSheetPlanNumber', title: '工单计划数', minWidth: 150 },
    {
      field: 'workSheetFinishNumber',
      title: '工单完成数（入库数量）',
      minWidth: 180,
    },
    { field: 'planDateEnd', title: '预计完成时间', minWidth: 150 },
    { field: 'unit', title: '单位', minWidth: 150 },
    {
      field: 'state',
      fixed: 'right',
      slots: { default: 'workOrderStatus' },
      title: '工单状态',
      minWidth: 150,
    },
    {
      field: 'reportState',
      fixed: 'right',
      slots: { default: 'reportTheWorkStatus' },
      title: '工单报工状态',
      minWidth: 150,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 150,
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
          page: page.currentPage,
          pageSize: page.pageSize,
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

/**
 * 获取状态的中文描述
 * @param state 状态编码
 */
function getStatusText(state: number) {
  switch (state) {
    case -1: {
      return '未生产';
    }
    case 1: {
      return '生产中';
    }
    case 2: {
      return '完工下线';
    }
    case 3: {
      return '暂停下线';
    }
    default: {
      return '未定义的状态';
    }
  }
}
/**
 * 获取报工状态的中文描述
 * @param state 状态编码
 */
function getReportStateText(state: number) {
  switch (state) {
    case 1: {
      return '未报工';
    }
    case 2: {
      return '已报工';
    }
    default: {
      return '未定义的状态';
    }
  }
}

// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 查询时间
  searchTime: [] as any,
  // 产品编号
  productCode: '',
  // 产品名称
  productName: '',
  // 工单号
  worksheetCode: '',
  // 类型
  workstationType: 1,
  // 工单状态
  state: '',
  // 工单报工状态
  reportState: '',
});

// 工作站类别
const workstationTypes = ref([
  {
    label: '制浆/制粉/制色',
    value: 1,
  },
  {
    label: '成型',
    value: 2,
  },
  {
    label: '窑炉（卧干、烧成）',
    value: 3,
  },
  {
    label: '制釉',
    value: 4,
  },
  {
    label: '施釉',
    value: 5,
  },
  {
    label: '抛光（抛光、打包、复选）',
    value: 6,
  },
]);
/**
 * 状态类型
 */
const statusTypes = ref([
  {
    label: '未生产',
    value: -1,
  },
  {
    label: '生产中',
    value: 1,
  },
  {
    label: '完工下线',
    value: 2,
  },
  {
    label: '暂停下线',
    value: 3,
  },
]);
/**
 * 报工状态类型
 */
const reportStatusTypes = ref([
  {
    label: '未报工',
    value: 1,
  },
  {
    label: '已报工',
    value: 2,
  },
]);

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams.value };
    if (params.searchTime && params.searchTime.length === 2) {
      params.startTime = params.searchTime[0].format('YYYY-MM-DD');
      params.endTime = params.searchTime[1].format('YYYY-MM-DD');
      params.searchTime = undefined;
    }
    queryWorksheetState({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ total, list }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
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

// region 工艺路线绑定
// 工艺路线名称
const routeName = ref('');
// 工艺路线列表
const routeList = ref<any>([]);
// 当前选中的工艺路线
const selectedRoute = ref<any>();
// 查询状态
const searchLoading = ref(false);
// 单选样式
const radioStyle = reactive({
  display: 'flex',
  lineHeight: '30px',
});

/**
 * 查询工艺路线
 */
function queryProcessRoute() {
  searchLoading.value = true;
  getRouteList({
    pageNum: 1,
    pageSize: 500,
    routeName: routeName.value,
  })
    .then(({ list }) => {
      routeList.value = list;
    })
    .finally(() => {
      searchLoading.value = false;
    });
}

// 当前选中的行
const editItem = ref<any>({});
// 提交状态
const pullInLoading = ref<boolean>(false);
/**
 * 选择工艺路线
 */
function bindingProcessRoute() {
  pullInLoading.value = true;
  bindingRoute({
    worksheetCode: editItem.value.worksheetCode,
    routeCode: selectedRoute.value,
    workstationCode: editItem.value.workstationCode,
  })
    .then(() => {
      message.success($t('common.successfulOperation'));
      gridApi.reload();
      close();
    })
    .finally(() => {
      pullInLoading.value = false;
    });
}

const isOpen = ref(false);

/**
 * 打开抽屉
 * @param row 选中的行
 */
function showDrawer(row: any) {
  editItem.value = row;
  isOpen.value = true;
  queryProcessRoute();
}

/**
 * 关闭抽屉
 */
function close() {
  editItem.value = {};
  isOpen.value = false;
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 初始化

onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 类别 -->
        <FormItem
          :label="$t('workOrderStatusQuery.workstationType')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.workstationType"
            :options="workstationTypes"
            class="!w-64"
          />
        </FormItem>
        <!-- 产品编号 -->
        <FormItem
          :label="$t('workOrderStatusQuery.queryTime')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.searchTime" />
        </FormItem>
        <!-- 产品编号 -->
        <FormItem
          :label="$t('workOrderStatusQuery.productNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productCode" />
        </FormItem>

        <!-- 产品名称 -->
        <FormItem
          :label="$t('workOrderStatusQuery.productName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productName" />
        </FormItem>

        <!-- 工单号 -->
        <FormItem
          :label="$t('workOrderStatusQuery.workOrderNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.worksheetCode" />
        </FormItem>

        <!-- 工单状态 -->
        <FormItem
          :label="$t('workOrderStatusQuery.workOrderStatus')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.state"
            :options="statusTypes"
            class="!w-64"
            allow-clear
          />
        </FormItem>
        <!-- 工单报工状态 -->
        <FormItem
          :label="$t('workOrderStatusQuery.reportTheWorkStatus')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.reportState"
            :options="reportStatusTypes"
            class="!w-64"
            allow-clear
          />
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
    <Card>
      <Grid>
        <template #workOrderStatus="{ row }">
          <span> {{ getStatusText(row.state) }} </span>
        </template>
        <template #reportTheWorkStatus="{ row }">
          <span>{{ getReportStateText(row.reportState) }}</span>
        </template>
        <template #action="{ row }">
          <!-- 安灯评价 -->
          <Tooltip>
            <template #title>
              {{ $t('selectionOfRDProcessRoute.selectionOfProcessRoute') }}
            </template>
            <Button type="link" @click="showDrawer(row)">
              <IconifyIcon
                icon="mdi:source-branch-sync"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- 工艺路线选择 -->
    <Drawer
      v-model:open="isOpen"
      :footer-style="{ textAlign: 'right' }"
      :title="$t('selectionOfRDProcessRoute.selectionOfProcessRoute')"
      placement="right"
      @close="close"
    >
      <InputSearch
        v-model:value="routeName"
        placeholder="输入关键字进行查询"
        enter-button="查询"
        :loading="searchLoading"
        @search="queryProcessRoute"
      />
      <div class="mt-4 max-h-[80%] overflow-y-auto">
        <RadioGroup v-model:value="selectedRoute">
          <Radio
            v-for="(item, index) of routeList"
            :style="radioStyle"
            :value="item.routeCode"
            :key="index"
          >
            {{ item.routeName }}
          </Radio>
        </RadioGroup>
      </div>
      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="close">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button
            type="primary"
            @click="bindingProcessRoute()"
            :loading="pullInLoading"
          >
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
