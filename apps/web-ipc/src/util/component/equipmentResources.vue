<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button, Col, Drawer, Row } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

// region 已派工单列表

// 已派工单表格配置

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      title: '序号',
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    {
      field: 'worksCenterCode',
      title: '工单编号',
      minWidth: 200,
    },
    {
      field: 'worksCenterName',
      title: '产品编号',
      minWidth: 200,
    },
    {
      field: 'day',
      title: '客户名称',
      minWidth: 200,
    },
    {
      field: 'cLass',
      title: '作业区域',
      minWidth: 200,
    },
    {
      field: '1',
      title: '预计开始时间',
      minWidth: 200,
    },
    {
      field: '2',
      title: '预计结束时间',
      minWidth: 200,
    },
  ],
  height: 400,
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

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params: any = {};
    if (params.searchTime && params.searchTime.length === 2) {
      params.startTime = params.searchTime[0].format('YYYY-MM-DD');
      params.endTime = params.searchTime[1].format('YYYY-MM-DD');
      params.searchTime = undefined;
    }
    resolve({
      total: page * pageSize,
      items: [{}],
    });
    /* queryYXStopDayMXStatistics({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ statisticsDtos: { total, list }, ...p }) => {
        collect.value = p;
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total,
          items: list,
        });
      })
      .catch((error) => {
        reject(error);
      });*/
  });
}
// 显示工单列表抽屉
const showWorkOrderListDrawer = ref(false);
/**
 * 显示已派工单列表面板
 * @param _row
 */
function displaysTheWorkOrderColumnTable(_row: any) {
  gridApi.reload();
  showWorkOrderListDrawer.value = true;
}
/**
 * 关闭已派工单列表面板
 */
function closeTheWorkOrderList() {
  showWorkOrderListDrawer.value = false;
}
// endregion

// region 作业站分配
// 作业站分配表格配置
const jobStationAssignmentGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      field: 'worksCenterCode',
      title: '设备编号',
      type: 'checkbox',
      minWidth: 200,
    },
    {
      field: 'worksCenterName',
      title: '设备名称',
      minWidth: 200,
    },
    {
      field: 'day',
      title: '设备型号',
      minWidth: 200,
    },
    {
      field: 'cLass',
      title: '已派工单数量',
      minWidth: 200,
    },
    {
      field: '1',
      title: '设备负荷',
      minWidth: 200,
    },
    {
      field: '2',
      title: '设备位置',
      minWidth: 200,
    },
  ],
  height: 400,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryJobData({
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

const [JobGrid, jobGridApi] = useVbenVxeGrid({
  gridOptions: jobStationAssignmentGridOptions,
});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryJobData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params: any = {};
    if (params.searchTime && params.searchTime.length === 2) {
      params.startTime = params.searchTime[0].format('YYYY-MM-DD');
      params.endTime = params.searchTime[1].format('YYYY-MM-DD');
      params.searchTime = undefined;
    }
    resolve({
      total: page * pageSize,
      items: [{}],
    });
    /* queryYXStopDayMXStatistics({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ statisticsDtos: { total, list }, ...p }) => {
        collect.value = p;
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total,
          items: list,
        });
      })
      .catch((error) => {
        reject(error);
      });*/
  });
}
// 显示工单列表抽屉
const showJobDrawer = ref(false);
/**
 * 显示已派工单列表面板
 * @param _row
 */
function showJobDrawerFun(_row: any) {
  jobGridApi.reload();
  showJobDrawer.value = true;
}
/**
 * 关闭已派工单列表面板
 */
function closeJobDrawer() {
  showJobDrawer.value = false;
}
// endregion
</script>

<template>
  <!-- region 工位 -->
  <div class="m-4 inline-block h-32 w-64 rounded-lg border border-gray-200">
    <div
      class="rounded-t-lg bg-cyan-500 pb-1 pt-1 text-center text-xl text-white"
    >
      <IconifyIcon
        icon="mdi:account-box-multiple"
        class="inline-block align-middle text-xl"
      />
      XXX流水线工作中心
    </div>
    <Row class="h-[92px]">
      <Col
        span="12"
        class="cursor-pointer border-r-2 text-center"
        @click="displaysTheWorkOrderColumnTable({})"
      >
        <div class="mb-2 mt-3 text-base font-black">
          {{ $t('dispatchHomework.jobGroup') }}
        </div>
        <div>{{ $t('dispatchHomework.aWorkOrderHasBeenSent') }}: XX</div>
      </Col>
      <Col
        span="12"
        class="cursor-pointer border-r-2 text-center"
        @click="showJobDrawerFun({})"
      >
        <div class="mb-2 mt-3 text-base font-black">
          {{ $t('dispatchHomework.operatingStation') }}
        </div>
        <div>{{ $t('dispatchHomework.aWorkOrderHasBeenSent') }}: XX</div>
      </Col>
    </Row>
  </div>
  <!-- endregion -->

  <!-- region 已派工列表 -->
  <Drawer
    v-model:open="showWorkOrderListDrawer"
    :footer-style="{ textAlign: 'right' }"
    :height="500"
    placement="top"
    :title="$t('dispatchHomework.sentOut')"
    @close="closeTheWorkOrderList"
  >
    <Grid />

    <template #footer>
      <Button danger type="primary" @click="closeTheWorkOrderList" class="mr-4">
        {{ $t('common.cancel') }}
      </Button>
      <Button type="primary" @click="closeTheWorkOrderList">
        {{ $t('common.confirmedDistribution') }}
      </Button>
    </template>
  </Drawer>
  <!-- endregion -->

  <!-- region 作业站分配 -->
  <Drawer
    v-model:open="showJobDrawer"
    :footer-style="{ textAlign: 'right' }"
    :height="500"
    placement="top"
    :title="$t('dispatchHomework.sentOut')"
    @close="closeJobDrawer"
  >
    <JobGrid />
    <template #footer>
      <Button danger type="primary" @click="closeJobDrawer" class="mr-4">
        {{ $t('common.cancel') }}
      </Button>
      <Button type="primary" @click="closeJobDrawer">
        {{ $t('common.confirmedDistribution') }}
      </Button>
    </template>
  </Drawer>
  <!-- endregion -->
</template>

<style scoped></style>
