<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
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
import {
  bindingRoute,
  getRouteList,
  listWorkstationType,
  listYfWorksheetState,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    { field: 'worksheetCode', title: $t('selectionOfRDProcessRoute.workOrderNumber'), minWidth: 190 },
    { field: 'workstationCode', title: $t('selectionOfRDProcessRoute.workstationCode'), minWidth: 150 },
    { field: 'routeName', title: $t('selectionOfRDProcessRoute.routeName'), minWidth: 150 },
    { field: 'routeCode', title: $t('selectionOfRDProcessRoute.routeCode'), minWidth: 150 },
    { field: 'productCode', title: $t('selectionOfRDProcessRoute.productCode'), minWidth: 150 },
    { field: 'productName', title: $t('selectionOfRDProcessRoute.productName'), minWidth: 150 },
    { field: 'planDateStart', title: $t('selectionOfRDProcessRoute.planStartTime'), minWidth: 150 },
    { field: 'workSheetPlanNumber', title: $t('selectionOfRDProcessRoute.planQuantity'), minWidth: 150 },
    {
      field: 'workSheetFinishNumber',
      title: $t('selectionOfRDProcessRoute.completedQuantity'),
      minWidth: 180,
    },
    { field: 'planDateEnd', title: $t('selectionOfRDProcessRoute.estimatedCompletionTime'), minWidth: 150 },
    { field: 'unit', title: $t('selectionOfRDProcessRoute.unit'), minWidth: 150 },
    {
      field: 'state',
      fixed: 'right',
      slots: { default: 'workOrderStatus' },
      title: $t('selectionOfRDProcessRoute.workOrderStatus'),
      minWidth: 150,
    },
    {
      field: 'reportState',
      fixed: 'right',
      slots: { default: 'reportTheWorkStatus' },
      title: $t('selectionOfRDProcessRoute.workOrderReportStatus'),
      minWidth: 150,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('selectionOfRDProcessRoute.operation'),
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
      return $t('selectionOfRDProcessRoute.notProduced');
    }
    case 1: {
      return $t('selectionOfRDProcessRoute.inProduction');
    }
    case 2: {
      return $t('selectionOfRDProcessRoute.completedOffline');
    }
    case 3: {
      return $t('selectionOfRDProcessRoute.pausedOffline');
    }
    default: {
      return $t('selectionOfRDProcessRoute.undefinedStatus');
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
      return $t('selectionOfRDProcessRoute.notReported');
    }
    case 2: {
      return $t('selectionOfRDProcessRoute.reported');
    }
    default: {
      return $t('selectionOfRDProcessRoute.undefinedStatus');
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
const workstationTypes = ref<any>([]);
// 查询工作站类别
function queryType() {
  listWorkstationType().then((data) => {
    workstationTypes.value = data;
    queryParams.value.workstationType = data[0].value;
    gridApi.reload();
  });
}

/**
 * 状态类型
 */
const statusTypes = ref([
  {
    label: $t('selectionOfRDProcessRoute.notProduced'),
    value: -1,
  },
  {
    label: $t('selectionOfRDProcessRoute.inProduction'),
    value: 1,
  },
  {
    label: $t('selectionOfRDProcessRoute.completedOffline'),
    value: 2,
  },
  {
    label: $t('selectionOfRDProcessRoute.pausedOffline'),
    value: 3,
  },
]);
/**
 * 报工状态类型
 */
const reportStatusTypes = ref([
  {
    label: $t('selectionOfRDProcessRoute.notReported'),
    value: 1,
  },
  {
    label: $t('selectionOfRDProcessRoute.reported'),
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
    if (params.workstationType) {
      listYfWorksheetState({
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
    } else {
      resolve({
        total: 0,
        items: [],
      });
    }
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
  selectedRoute.value = editItem.value.routeCode;
  isOpen.value = true;
  queryProcessRoute();
}

/**
 * 关闭抽屉
 */
function close() {
  editItem.value = {};
  isOpen.value = false;
  selectedRoute.value = undefined;
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

  queryType();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="!mb-8">
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
          <!-- 工艺路线选择 -->
          <Tooltip v-if="author.includes('路线选择')">
            <template #title>
              {{ $t('selectionOfRDProcessRoute.selectionOfProcessRoute') }}
            </template>
            <Button type="link" @click="showDrawer(row)">
              <Icon
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
        :placeholder="$t('selectionOfRDProcessRoute.enterKeyword')"
        :enter-button="$t('selectionOfRDProcessRoute.search')"
        :loading="searchLoading"
        @search="queryProcessRoute"
      />
      <div class="!mt-4 max-h-[80%] overflow-y-auto">
        <RadioGroup v-model:value="selectedRoute">
          <Radio
            v-for="(item, index) of routeList"
            :style="radioStyle"
            :value="item.routeCode"
            :key="index"
          >
            {{ item.routeName }}__
            {{ item.routeCode }}
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
