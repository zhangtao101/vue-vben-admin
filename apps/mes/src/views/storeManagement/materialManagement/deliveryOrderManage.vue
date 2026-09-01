<script lang="ts" setup>
/**
 * [INPUT]: 依赖 @vben 基础组件、ant-design-vue 组件、#/api 的 batchConfirmReceipt/queryDeliveryDetail/queryDeliveryList 接口及 #/util 的 queryAuth 权限查询
 * [OUTPUT]: 对外提供送货单管理页面组件，支持列表查询、详情查看与批量确认收货
 * [POS]: 属于仓储管理（storeManagement）模块物料管理子模块的送货单管理页，文案对应 storeManagement.deliveryOrderManage 语言包
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
  Modal,
  RangePicker,
  Select,
  Space,
  Tag,
  Textarea,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchConfirmReceipt,
  queryDeliveryDetail,
  queryDeliveryList,
} from '#/api';
import { queryAuth } from '#/util';

// 当前用户操作权限集合，用于控制按钮显隐
const route = useRoute();
const author = ref<string[]>([]);

// 列表查询参数：送货单号/物料编号/日期范围/到货状态
const queryParams = ref<any>({
  deliveryNo: undefined,
  itemNo: undefined,
  times: undefined,
  arrivalState: undefined,
});

// 到货状态下拉选项
const arrivalStateOptions = [
  {
    label: $t('storeManagement.deliveryOrderManage.arrivalStateGenerated'),
    value: '1',
  },
  {
    label: $t('storeManagement.deliveryOrderManage.arrivalStateNotGenerated'),
    value: '2',
  },
];

// 表格勾选的送货单行数据
const selectedRows = ref<any[]>([]);

// 送货单主表格配置（列定义、分页、代理查询等）
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: {
    highlight: true,
    reserve: true,
    checkMethod: ({ row }) => {
      return row.arrivalState !== 1;
    },
  },
  columns: [
    { type: 'checkbox', width: 50, fixed: 'left' },
    {
      type: 'seq',
      title: $t('storeManagement.deliveryOrderManage.seq'),
      width: 60,
    },
    {
      field: 'deliveryNo',
      title: $t('storeManagement.deliveryOrderManage.deliveryNo'),
      width: 150,
    },
    {
      field: 'supplierNo',
      title: $t('storeManagement.deliveryOrderManage.supplierNo'),
      width: 120,
    },
    {
      field: 'supplierName',
      title: $t('storeManagement.deliveryOrderManage.supplierName'),
      width: 160,
    },
    {
      field: 'deliveryDate',
      title: $t('storeManagement.deliveryOrderManage.deliveryDate'),
      width: 110,
    },
    {
      field: 'createTime',
      title: $t('storeManagement.deliveryOrderManage.createTime'),
      width: 110,
    },
    {
      field: 'arrivalNo',
      title: $t('storeManagement.deliveryOrderManage.arrivalNo'),
      width: 150,
    },
    {
      field: 'arrivalStateName',
      title: $t('storeManagement.deliveryOrderManage.arrivalStateName'),
      width: 120,
      slots: { default: 'arrivalStateName' },
    },
    {
      field: 'purchaseNos',
      title: $t('storeManagement.deliveryOrderManage.purchaseNos'),
      width: 150,
    },
    {
      field: 'remarks',
      title: $t('storeManagement.deliveryOrderManage.remarks'),
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
    keyField: 'deliveryNo',
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
 * 查询送货单列表，供表格代理分页加载使用。
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
      params.startDeliveryDate = params.times[0].format('YYYYMMDD');
      params.endDeliveryDate = params.times[1].format('YYYYMMDD');
      params.times = undefined;
    }
    queryDeliveryList({
      ...params,
      pageNum: page,
      pageSize,
    })
      .then(({ total, results }: any) => {
        resolve({
          total: total || 0,
          items: results || [],
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
  queryParams.value.itemNo = undefined;
  queryParams.value.times = undefined;
  queryParams.value.arrivalState = undefined;
  handleQuery();
}

// 确认收货弹窗状态：可见性/提交中/收货备注
const confirmVisible = ref(false);
const confirmLoading = ref(false);
const receiveRemark = ref('');

/**
 * 打开确认收货弹窗（需先勾选数据）。
 * @returns {void} 无返回值，未勾选时给出警告提示。
 * @since 2026-08-28 10:00:00
 */
function handleConfirmReceipt() {
  if (selectedRows.value.length === 0) {
    message.warning(
      $t('storeManagement.deliveryOrderManage.selectConfirmData'),
    );
    return;
  }
  receiveRemark.value = '';
  confirmVisible.value = true;
}

/**
 * 执行批量确认收货，成功后刷新列表并关闭弹窗。
 * @returns {void} 无返回值，接口失败时在内部捕获并提示错误。
 * @since 2026-08-28 10:00:00
 */
function doConfirmReceipt() {
  const selectList = selectedRows.value.map((item: any) => ({
    ent: item.ent,
    site: item.site,
    deliveryNo: item.deliveryNo,
  }));
  confirmLoading.value = true;
  batchConfirmReceipt({ selectList, receiveRemark: receiveRemark.value })
    .then(() => {
      message.success($t('common.successfulOperation'));
      confirmVisible.value = false;
      handleQuery();
    })
    .catch((error: any) => {
      message.error(
        error.message || $t('storeManagement.deliveryOrderManage.confirmFail'),
      );
    })
    .finally(() => {
      confirmLoading.value = false;
    });
}

// 详情抽屉状态：可见性/加载中/详情数据
const detailVisible = ref(false);
const detailLoading = ref(false);
const detailData = ref<any>({});

// 送货明细列配置
const detailColumns = [
  {
    field: 'deliverySeq',
    title: $t('storeManagement.deliveryOrderManage.seq'),
    width: 80,
  },
  {
    field: 'purchaseNo',
    title: $t('storeManagement.deliveryOrderManage.purchaseNo'),
    width: 150,
  },
  {
    field: 'itemNo',
    title: $t('storeManagement.deliveryOrderManage.itemNo'),
    width: 120,
  },
  {
    field: 'itemName',
    title: $t('storeManagement.deliveryOrderManage.itemName'),
    width: 180,
  },
  {
    field: 'itemSpec',
    title: $t('storeManagement.deliveryOrderManage.itemSpec'),
    width: 140,
  },
  {
    field: 'unitNo',
    title: $t('storeManagement.deliveryOrderManage.unitNo'),
    width: 80,
  },
  {
    field: 'deliveryQty',
    title: $t('storeManagement.deliveryOrderManage.deliveryQty'),
    width: 100,
  },
  {
    field: 'receiptQty',
    title: $t('storeManagement.deliveryOrderManage.receiptQty'),
    width: 100,
  },
  {
    field: 'lotNo',
    title: $t('storeManagement.deliveryOrderManage.lotNo'),
    width: 120,
  },
  {
    field: 'warehouseNo',
    title: $t('storeManagement.deliveryOrderManage.warehouseNo'),
    width: 100,
  },
];

// 送货明细表格配置（无分页的小型只读表格）
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
 * 查看送货单详情（含送货明细），异步加载到详情抽屉。
 * @param {object} row - 表格行数据，需包含 deliveryNo/ent/site 字段。
 * @returns {void} 无返回值。
 * @since 2026-08-28 10:00:00
 */
function handleViewDetail(row: any) {
  detailData.value = {};
  detailVisible.value = true;
  detailLoading.value = true;
  setTimeout(() => {
    detailGridApi.grid.reloadData([]);
    queryDeliveryDetail(row.deliveryNo, {
      ent: row.ent,
      site: row.site,
    })
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
          :label="$t('storeManagement.deliveryOrderManage.deliveryNo')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.deliveryNo"
            :placeholder="
              $t('common.pleaseEnter') +
              $t('storeManagement.deliveryOrderManage.deliveryNo')
            "
            style="width: 150px"
            @keyup.enter="handleQuery"
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.deliveryOrderManage.itemNo')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.itemNo"
            :placeholder="
              $t('common.pleaseEnter') +
              $t('storeManagement.deliveryOrderManage.itemNo')
            "
            style="width: 150px"
            @keyup.enter="handleQuery"
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.deliveryOrderManage.timeRange')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.times" style="width: 230px" />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.deliveryOrderManage.arrivalState')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.arrivalState"
            :options="arrivalStateOptions"
            :placeholder="
              $t('storeManagement.deliveryOrderManage.arrivalState')
            "
            allow-clear
            style="width: 150px"
          />
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
              v-if="author.includes('收货')"
              type="primary"
              :disabled="selectedRows.length === 0"
              :loading="confirmLoading"
              @click="handleConfirmReceipt"
            >
              {{ $t('storeManagement.deliveryOrderManage.confirmReceipt') }}
            </Button>
          </Space>
        </template>
        <template #arrivalStateName="{ row }">
          <Tag :color="row.arrivalState === 1 ? 'green' : 'orange'">
            {{ row.arrivalStateName || '-' }}
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

    <!-- 确认收货弹窗 -->
    <Modal
      v-model:open="confirmVisible"
      :title="$t('storeManagement.deliveryOrderManage.confirmReceipt')"
      :confirm-loading="confirmLoading"
      @ok="doConfirmReceipt"
    >
      <Form layout="vertical">
        <FormItem
          :label="$t('storeManagement.deliveryOrderManage.receiveRemark')"
        >
          <Textarea
            v-model:value="receiveRemark"
            :rows="3"
            :placeholder="
              $t('storeManagement.deliveryOrderManage.receiveRemarkPlaceholder')
            "
          />
        </FormItem>
      </Form>
    </Modal>

    <!-- 详情抽屉 -->
    <Drawer
      v-model:open="detailVisible"
      :title="$t('storeManagement.deliveryOrderManage.detail')"
      :loading="detailLoading"
      width="960px"
    >
      <Descriptions :column="2" bordered size="small">
        <Descriptions.Item
          :label="$t('storeManagement.deliveryOrderManage.deliveryNo')"
        >
          {{ detailData.deliveryNo || '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.deliveryOrderManage.deliveryDate')"
        >
          {{ detailData.deliveryDate || '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.deliveryOrderManage.purchaseTypeName')"
        >
          {{ detailData.purchaseTypeName || '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.deliveryOrderManage.receiptAddress')"
        >
          {{ detailData.receiptAddress || '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.deliveryOrderManage.supplierNo')"
        >
          {{ detailData.supplierNo || '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.deliveryOrderManage.supplierName')"
        >
          {{ detailData.supplierName || '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.deliveryOrderManage.arrivalNo')"
        >
          {{ detailData.arrivalNo || '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.deliveryOrderManage.arrivalStateName')"
        >
          <Tag :color="detailData.arrivalState === 1 ? 'green' : 'orange'">
            {{ detailData.arrivalStateName || '-' }}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.deliveryOrderManage.receiptNo')"
        >
          {{ detailData.receiptNo || '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.deliveryOrderManage.courierNo')"
        >
          {{ detailData.courierNo || '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.deliveryOrderManage.expectedArrival')"
        >
          {{ detailData.expectedArrival || '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.deliveryOrderManage.expectedTime')"
        >
          {{ detailData.expectedTime || '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.deliveryOrderManage.printCount')"
        >
          {{ detailData.printCount ?? '-' }}
        </Descriptions.Item>
        <Descriptions.Item
          :label="$t('storeManagement.deliveryOrderManage.remarks')"
        >
          {{ detailData.remark || '-' }}
        </Descriptions.Item>
      </Descriptions>
      <div class="mb-2 mt-4 font-medium">
        {{ $t('storeManagement.deliveryOrderManage.bodyList') }}
      </div>
      <DetailGrid />
    </Drawer>
  </Page>
</template>
