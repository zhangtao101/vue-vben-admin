<script lang="ts" setup>
/**
 * [INPUT]: 依赖 @vben 基础组件、ant-design-vue 组件、#/api 的 batchManualResend/queryArrivalDetail/queryArrivalList 接口及 #/util 的 queryAuth 权限查询
 * [OUTPUT]: 对外提供到货单管理页面组件，支持列表查询、详情查看与批量手动回传
 * [POS]: 属于仓储管理（storeManagement）模块物料管理子模块的到货单管理页，文案对应 storeManagement.arrivalOrderManage 语言包
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-08-28 10:00:00
 */

import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  RangePicker,
  Select,
  Space,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { batchManualResend, queryArrivalDetail, queryArrivalList } from '#/api';
import { queryAuth } from '#/util';

// 当前用户操作权限集合，用于控制按钮显隐
const route = useRoute();
const author = ref<string[]>([]);

// 列表查询参数：送货单号/采购单号/回传状态/日期范围
const queryParams = ref<any>({
  deliveryNo: undefined,
  purchaseNo: undefined,
  syncStatus: undefined,
  times: undefined,
});

// 回传状态下拉选项
const syncStatusOptions = [
  {
    label: $t('storeManagement.arrivalOrderManage.syncStatusSync'),
    value: 0,
  },
  {
    label: $t('storeManagement.arrivalOrderManage.syncStatusSuccess'),
    value: 1,
  },
  {
    label: $t('storeManagement.arrivalOrderManage.syncStatusFail'),
    value: 2,
  },
];

// 表格勾选的到货单行数据
const selectedRows = ref<any[]>([]);

// 到货单主表格配置（列定义、分页、代理查询等）
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: {
    highlight: true,
    reserve: true,
    checkMethod: ({ row }) => {
      return row.syncStatus !== 1;
    },
  },
  columns: [
    { type: 'checkbox', width: 50, fixed: 'left' },
    {
      type: 'seq',
      title: $t('storeManagement.arrivalOrderManage.seq'),
      width: 60,
    },
    {
      field: 'arrivalNo',
      title: $t('storeManagement.arrivalOrderManage.arrivalNo'),
      width: 150,
    },
    {
      field: 'deliveryNo',
      title: $t('storeManagement.arrivalOrderManage.deliveryNo'),
      width: 150,
    },
    {
      field: 'docTypeNo',
      title: $t('storeManagement.arrivalOrderManage.docTypeNo'),
      width: 90,
    },
    {
      field: 'docDate',
      title: $t('storeManagement.arrivalOrderManage.docDate'),
      width: 110,
    },
    {
      field: 'plantNo',
      title: $t('storeManagement.arrivalOrderManage.plantNo'),
      width: 100,
    },
    {
      field: 'supplierNo',
      title: $t('storeManagement.arrivalOrderManage.supplierNo'),
      width: 110,
    },
    {
      field: 'remarks',
      title: $t('storeManagement.arrivalOrderManage.remarks'),
      width: 140,
    },
    {
      field: 'arrivedTotalQty',
      title: $t('storeManagement.arrivalOrderManage.arrivedTotalQty'),
      width: 100,
    },
    {
      field: 'arrivedTotalPackageQty',
      title: $t('storeManagement.arrivalOrderManage.arrivedTotalPackageQty'),
      width: 110,
    },
    {
      field: 'syncStatus',
      title: $t('storeManagement.arrivalOrderManage.syncStatus'),
      width: 90,
      slots: { default: 'syncStatus' },
    },
    {
      field: 'syncMsg',
      title: $t('storeManagement.arrivalOrderManage.syncMsg'),
      width: 180,
    },
    {
      field: 'createDate',
      title: $t('storeManagement.arrivalOrderManage.createDate'),
      width: 140,
    },
    {
      field: 'action',
      title: $t('common.operation'),
      width: 80,
      fixed: 'right',
      slots: { default: 'action' },
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
    pageSizes: [10, 20, 50, 100],
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
  rowConfig: {
    keyField: 'arrivalNo',
  },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

// 表格勾选事件：单选/全选变化时同步选中行
const gridEvents: VxeGridListeners<any> = {
  checkboxChange: () => updateSelection(),
  checkboxAll: () => updateSelection(),
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions, gridEvents });

/**
 * 查询到货单列表，供表格代理分页加载使用。
 * @param {object} query - 分页查询参数。
 * @param {number} query.page - 当前页码，从 1 开始。
 * @param {number} query.pageSize - 每页条数。
 * @returns {Promise<{ total: number; items: any[] }>} 返回总条数与当前页列表数据。
 * @throws {Error} 查询接口失败时以 reject 抛出原始错误。
 * @since 2026-08-28 10:00:00
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams.value };
    if (params.times) {
      params.startDate = params.times[0].format('YYYYMMDD');
      params.endDate = params.times[1].format('YYYYMMDD');
      params.times = undefined;
    }
    queryArrivalList({
      ...params,
      pageNum: page,
      pageSize,
    })
      .then((data: any) => {
        const results = data.results || [];
        const total = data.total ?? results.length;
        resolve({
          total,
          items: results,
        });
      })
      .catch((error: any) => {
        reject(error);
      });
  });
}

/**
 * 同步表格勾选记录到选中行集合。
 * @returns {void} 无返回值，直接更新 selectedRows。
 * @since 2026-08-28 10:00:00
 */
function updateSelection() {
  selectedRows.value = gridApi.grid?.getCheckboxRecords?.() || [];
}

/**
 * 触发查询：重新加载当前表格数据。
 * @returns {void} 无返回值。
 * @since 2026-08-28 10:00:00
 */
function handleQuery() {
  gridApi.reload();
}

/**
 * 重置查询条件并重新加载列表。
 * @returns {void} 无返回值。
 * @since 2026-08-28 10:00:00
 */
function handleReset() {
  queryParams.value.deliveryNo = undefined;
  queryParams.value.purchaseNo = undefined;
  queryParams.value.syncStatus = undefined;
  queryParams.value.times = undefined;
  handleQuery();
}

/**
 * 根据回传状态码返回对应的多语言文案。
 * @param {number} status - 回传状态：0 回传中、1 成功、2 失败。
 * @returns {string} 状态对应的文案，未知状态返回 '-'。
 * @since 2026-08-28 10:00:00
 */
function syncStatusText(status: number) {
  if (status === 0) {
    return $t('storeManagement.arrivalOrderManage.syncStatusSync');
  }
  if (status === 1) {
    return $t('storeManagement.arrivalOrderManage.syncStatusSuccess');
  }
  if (status === 2) {
    return $t('storeManagement.arrivalOrderManage.syncStatusFail');
  }
  return '-';
}

/**
 * 根据回传状态码返回对应的标签颜色。
 * @param {number} status - 回传状态：0 回传中、1 成功、2 失败。
 * @returns {string} 状态对应的 antd 标签颜色，未知状态返回 'default'。
 * @since 2026-08-28 10:00:00
 */
function syncStatusColor(status: number) {
  if (status === 0) {
    return 'blue';
  }
  if (status === 1) {
    return 'green';
  }
  if (status === 2) {
    return 'red';
  }
  return 'default';
}

// 手动回传加载状态
const resendLoading = ref(false);

/**
 * 批量手动回传选中的到货单（需先勾选数据）。
 * @returns {void} 无返回值，成功后刷新列表，失败时在内部捕获并提示错误。
 * @since 2026-08-28 10:00:00
 */
function handleManualResend() {
  if (selectedRows.value.length === 0) {
    message.warning($t('storeManagement.arrivalOrderManage.selectResendData'));
    return;
  }
  const arrivalNoList = selectedRows.value.map((item: any) => item.arrivalNo);
  resendLoading.value = true;
  batchManualResend({ arrivalNoList })
    .then(() => {
      message.success($t('common.successfulOperation'));
      handleQuery();
    })
    .catch((error: any) => {
      message.error(
        error.message || $t('storeManagement.arrivalOrderManage.resendFail'),
      );
    })
    .finally(() => {
      resendLoading.value = false;
    });
}

// 详情抽屉状态：可见性/加载中/详情数据
const detailVisible = ref(false);
const detailLoading = ref(false);
const detailData = ref<any>({});

// 到货明细列配置
const detailColumns = [
  {
    field: 'seq',
    title: $t('storeManagement.arrivalOrderManage.seq'),
    width: 60,
  },
  {
    field: 'itemNo',
    title: $t('storeManagement.arrivalOrderManage.itemNo'),
    width: 120,
  },
  {
    field: 'itemName',
    title: $t('storeManagement.arrivalOrderManage.itemName'),
    width: 180,
  },
  {
    field: 'itemSpec',
    title: $t('storeManagement.arrivalOrderManage.itemSpec'),
    width: 140,
  },
  {
    field: 'unit',
    title: $t('storeManagement.arrivalOrderManage.unit'),
    width: 80,
  },
  {
    field: 'arrivedQty',
    title: $t('storeManagement.arrivalOrderManage.arrivedQty'),
    width: 100,
  },
  {
    field: 'purchaseTypeNo',
    title: $t('storeManagement.arrivalOrderManage.purchaseTypeNo'),
    width: 100,
  },
  {
    field: 'purchaseNo',
    title: $t('storeManagement.arrivalOrderManage.purchaseNo'),
    width: 150,
  },
  {
    field: 'purchaseSeq',
    title: $t('storeManagement.arrivalOrderManage.purchaseSeq'),
    width: 90,
  },
  {
    field: 'warehouseNo',
    title: $t('storeManagement.arrivalOrderManage.warehouseNo'),
    width: 100,
  },
];

// 到货明细表格配置（无分页的小型只读表格）
const detailGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: detailColumns,
  height: 300,
  showOverflow: 'tooltip',
  size: 'small',
  pagerConfig: {
    enabled: false,
  },
};

const [DetailGrid, detailGridApi] = useVbenVxeGrid({
  gridOptions: detailGridOptions,
});

/**
 * 查看到货单详情（含到货明细），异步加载到详情抽屉。
 * @param {object} row - 表格行数据，需包含 arrivalNo 字段。
 * @returns {void} 无返回值。
 * @since 2026-08-28 10:00:00
 */
function handleViewDetail(row: any) {
  detailData.value = {};
  detailVisible.value = true;
  detailLoading.value = true;
  setTimeout(() => {
    detailGridApi.grid.reloadData([]);
    queryArrivalDetail({ arrivalNo: row.arrivalNo })
      .then((data: any) => {
        detailData.value = data;
        detailGridApi.grid.reloadData(data.bodyList || []);
      })
      .finally(() => {
        detailLoading.value = false;
      });
  }, 200);
}

// 页面初始化：加载当前路由对应的操作权限
onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});
</script>

<template>
  <Page>
    <!-- 顶部搜索区域 -->
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem
          :label="$t('storeManagement.arrivalOrderManage.deliveryNo')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.deliveryNo"
            :placeholder="
              $t('common.pleaseEnter') +
              $t('storeManagement.arrivalOrderManage.deliveryNo')
            "
            style="width: 150px"
            @keyup.enter="handleQuery"
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.arrivalOrderManage.purchaseNo')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.purchaseNo"
            :placeholder="
              $t('common.pleaseEnter') +
              $t('storeManagement.arrivalOrderManage.purchaseNo')
            "
            style="width: 150px"
            @keyup.enter="handleQuery"
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.arrivalOrderManage.syncStatus')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.syncStatus"
            :options="syncStatusOptions"
            :placeholder="$t('storeManagement.arrivalOrderManage.syncStatus')"
            allow-clear
            style="width: 130px"
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.arrivalOrderManage.timeRange')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.times" style="width: 230px" />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Space>
            <Button type="primary" @click="handleQuery">
              {{ $t('common.search') }}
            </Button>
            <Button @click="handleReset">
              {{ $t('common.reset') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>

    <!-- 主表格区域 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <Space>
            <Button
              v-if="author.includes('回传')"
              type="primary"
              :disabled="selectedRows.length === 0"
              :loading="resendLoading"
              @click="handleManualResend"
            >
              {{ $t('storeManagement.arrivalOrderManage.manualResend') }}
            </Button>
          </Space>
        </template>
        <template #syncStatus="{ row }">
          <Tag :color="syncStatusColor(row.syncStatus)">
            {{ syncStatusText(row.syncStatus) }}
          </Tag>
        </template>
        <template #action="{ row }">
          <Tooltip>
            <template #title>{{ $t('common.view') }}</template>
            <Button type="link" class="px-1" @click="handleViewDetail(row)">
              <Icon
                icon="mdi:eye-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>

    <!-- 详情抽屉 -->
    <Drawer
      v-model:open="detailVisible"
      :title="$t('storeManagement.arrivalOrderManage.detail')"
      :loading="detailLoading"
      width="960px"
    >
      <Descriptions :column="2" bordered size="small">
        <Descriptions.Item
          :label="$t('storeManagement.arrivalOrderManage.arrivalNo')"
        >
          {{ detailData.arrivalNo || '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.arrivalOrderManage.deliveryNo')"
        >
          {{ detailData.deliveryNo || '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.arrivalOrderManage.docTypeNo')"
        >
          {{ detailData.docTypeNo || '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.arrivalOrderManage.docDate')"
        >
          {{ detailData.docDate || '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.arrivalOrderManage.plantNo')"
        >
          {{ detailData.plantNo || '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.arrivalOrderManage.supplierNo')"
        >
          {{ detailData.supplierNo || '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.arrivalOrderManage.arrivedTotalQty')"
        >
          {{ detailData.arrivedTotalQty ?? '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="
            $t('storeManagement.arrivalOrderManage.arrivedTotalPackageQty')
          "
        >
          {{ detailData.arrivedTotalPackageQty ?? '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.arrivalOrderManage.syncStatus')"
        >
          <Tag :color="syncStatusColor(detailData.syncStatus)">
            {{ syncStatusText(detailData.syncStatus) }}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.arrivalOrderManage.createDate')"
        >
          {{ detailData.createDate || '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.arrivalOrderManage.syncMsg')"
          :span="2"
        >
          {{ detailData.syncMsg || '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.arrivalOrderManage.remarks')"
          :span="2"
        >
          {{ detailData.remarks || '-' }}
        </Descriptions.Item>
      </Descriptions>
      <div class="mb-2 mt-4 font-medium">
        {{ $t('storeManagement.arrivalOrderManage.bodyList') }}
      </div>
      <DetailGrid />
    </Drawer>
  </Page>
</template>
