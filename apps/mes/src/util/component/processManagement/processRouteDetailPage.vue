<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Input,
  message,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getUserInfoApi,
  processSort,
  queryProcessRouteDetailList,
  queryRouterDetails,
} from '#/api';

// region 表格

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,

  rowConfig: {
    drag: true,
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'processCode', title: '过程编码', minWidth: 105, dragSort: true },
    { field: 'processName', title: '过程名称', minWidth: 150 },
    { field: 'processTypeName', title: '过程类型', minWidth: 95 },
    { field: 'turnTime', title: '流转时长（s）', minWidth: 120 },
    { field: 'opTime', title: '操作时间', minWidth: 150 },
    { field: 'opUserName', title: '操作人', minWidth: 80 },
    {
      title: '操作',
      minWidth: 300,
      fixed: 'right',
      slots: {
        default: 'action',
      },
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
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

const gridEvents: any = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
  rowDragend: () => {
    sort();
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

const queryParams = ref<any>({});
/**
 * queryData - 负责根据当前的查询参数、分页信息和日期范围，从后端服务查询数据。
 * 该函数会更新表格的加载状态，并在查询完成后更新数据列表和总条数。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 构建查询参数对象，包含所有查询参数、当前页码和每页显示的数据条数。
    const params = {
      ...queryParams.value,
      routeId: routerId.value,
      // 设置当前页码。
      pageNum: page,
      // 设置每页显示的数据条数。
      pageSize,
    };

    // 调用 searchWorksheetNoWater 函数查询数据。
    queryProcessRouteDetailList(params)
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

/**
 * 排序
 */
function sort() {
  const { tableData } = gridApi.grid.getTableData();
  const params: any = {
    list: [],
    opUser: userMessage.value.userName,
    opUserName: userMessage.value.perName,
  };
  tableData.forEach((item: any, index: number) => {
    params.list.push({
      ...item,
      orderNum: index + 1,
    });
  });
  processSort(params).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

// endregion

// region 抽屉基本操作
// 抽屉是否打开
const isOpen = ref(false);
// 工艺路线id
const routerId = ref('');
// 是否为编辑状态
const updateStatus = ref(false);

/**
 * 打开抽屉
 * @param id 工艺路线id
 * @param isUpdate 是否为更新操作
 */
function openDrawer(id: string, isUpdate: boolean) {
  isOpen.value = true;
  routerId.value = id;
  updateStatus.value = isUpdate;
  queryDetails(id);
  queryLoginUser();
}

function closeDrawer() {
  isOpen.value = false;
}
// endregion

// region 查询工艺路线详情
const details = ref<any>({});
/**
 * 查询工艺路线详情
 * @param id 工艺路线id
 */
function queryDetails(id: string) {
  queryRouterDetails(id).then((data) => {
    details.value = data;
  });
}

// endregion

// region 查询当前登录用户信息

const userMessage = ref<any>({});

function queryLoginUser() {
  getUserInfoApi().then((data: any) => {
    const { userName, perName } = data;
    userMessage.value = {
      userName,
      perName,
    };
  });
}

// endregion

// region 暴露方法

// 暴露 open 方法，供父组件调用
defineExpose({
  openDrawer,
});

// endregion
</script>

<template>
  <!-- 已派工单列表抽屉组件 -->
  <Drawer
    v-model:open="isOpen"
    height="80%"
    placement="top"
    :title="
      updateStatus
        ? $t('processManagement.processRoute.change')
        : $t('processManagement.processRoute.viewRouting')
    "
    @close="closeDrawer"
  >
    <div>
      <Descriptions :column="4" bordered>
        <DescriptionsItem
          :label="$t('processManagement.processRoute.processRouteNumber')"
        >
          {{ details.routeCode }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('processManagement.processRoute.routeType')"
        >
          {{ details.routeTypeName }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('processManagement.processRoute.processRouteName')"
        >
          {{ details.routeName }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('processManagement.processRoute.processName')"
        >
          <Input v-model:value="queryParams.processName" />
        </DescriptionsItem>
        <DescriptionsItem>
          <Button
            type="primary"
            @click="
              () => {
                gridApi.reload();
              }
            "
            class="float-right w-48"
          >
            {{ $t('common.search') }}
          </Button>
        </DescriptionsItem>
      </Descriptions>
    </div>

    <!-- 渲染已派工单表格组件 -->
    <Grid v-if="isOpen" />
  </Drawer>
</template>

<style scoped></style>
