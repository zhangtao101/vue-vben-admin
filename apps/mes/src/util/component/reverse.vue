<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { MdiUpdate } from '@vben/icons';

import {
  Button,
  DatePicker,
  Descriptions,
  DescriptionsItem,
  Drawer,
  message,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  callbackInout,
  getAllInWarehouseList,
} from '#/api/productionReport/packagingAndInventoryReversal.service';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格操作

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
    { field: 'code', title: '入库单号', minWidth: 200 },
    { field: 'worksheetCode', title: '工单号', minWidth: 200 },
    { field: 'batchCode', title: '入库批次号', minWidth: 200 },
    { field: 'warehouseCode', title: '库位', minWidth: 200 },
    { field: 'number', title: '入库数量', minWidth: 200 },
    { field: 'packageNumber', title: '包装箱数', minWidth: 200 },
    { field: 'opTime', title: '入库时间', minWidth: 200 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 120,
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

// endregion

// region 冲销
// 是否显示
const isShow = ref(false);
// 当前编辑的数据
const editItem = ref<any>({});

function showEdit(row: any) {
  isShow.value = true;
  editItem.value = row;
}

/**
 * 关闭
 */
function close() {
  isShow.value = false;
  editItem.value = {};
}

/**
 * 冲销
 */
function chargeAgainst() {
  editItem.value.loading = true;
  callbackInout({
    recordId: editItem.value.id,
    callBackTime: editItem.value.callBackTime.format('YYYY-MM-DD HH:mm:ss'),
  }).then(() => {
    message.success($t('common.successfulOperation'));
    close();
    gridApi.reload();
  });
}

// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 工单号
  worksheetCode: '',
});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    getAllInWarehouseList({
      ...queryParams.value, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then((data) => {
        resolve({
          total: data.length,
          items: data,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 暴露方法
const showReverse = ref(false);
const editReverse = ref<any>({});

/**
 * 刷新表格数据
 */
const open = (row: any) => {
  showReverse.value = true;
  editReverse.value = row;
  queryParams.value.worksheetCode = row.worksheetCode;
  gridApi.reload();
};

function closeReverse() {
  showReverse.value = false;
  editReverse.value = {};
}

/**
 * 暴露 query 方法供父组件调用
 */
defineExpose({
  open,
});

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
  <Drawer
    v-model:open="showReverse"
    :footer-style="{ textAlign: 'right' }"
    height="70%"
    placement="top"
    :title="$t('common.chargeAgainst')"
    @close="closeReverse"
  >
    <!-- region 表格主体 -->
    <Grid>
      <template #action="{ row }">
        <!-- 冲红 -->
        <Tooltip>
          <template #title>
            {{ $t('common.chargeAgainst') }}
          </template>
          <Button
            :icon="h(MdiUpdate, { class: 'inline-block size-6' })"
            :loading="row.loading"
            class="mr-4"
            type="link"
            @click="showEdit(row)"
            v-if="author.includes('冲销')"
          />
        </Tooltip>
      </template>
    </Grid>
    <!-- endregion -->
  </Drawer>

  <!-- region 冲销-->
  <Drawer
    v-model:open="isShow"
    :footer-style="{ textAlign: 'right' }"
    :width="750"
    placement="right"
    :title="$t('common.chargeAgainst')"
    @close="close"
  >
    <Descriptions bordered :column="2" class="mb-8">
      <!-- 当前库存 -->
      <DescriptionsItem
        :span="2"
        :label="$t('packagingAndInventoryReversal.currentInventory')"
      >
        {{ editItem.stock }}
      </DescriptionsItem>
      <!-- 入库数量 -->
      <DescriptionsItem
        :label="
          $t(
            'packagingAndInventoryReversal.quantityOfGoodsEnteringTheWarehouse',
          )
        "
      >
        {{ editItem.number }}
        {{ editItem.unit }}
      </DescriptionsItem>
      <!-- 入库数量 -->
      <DescriptionsItem
        :label="
          $t(
            'packagingAndInventoryReversal.quantityOfGoodsEnteringTheWarehouse',
          )
        "
      >
        {{ editItem.transferNumber }}
        {{ editItem.transferUnit }}
      </DescriptionsItem>
      <!-- 入库批次 -->
      <DescriptionsItem
        :label="$t('packagingAndInventoryReversal.batchOfInboundGoods')"
      >
        {{ editItem.batchCode }}
      </DescriptionsItem>
      <!-- 入库库位 -->
      <DescriptionsItem
        :label="$t('packagingAndInventoryReversal.storageLocation')"
      >
        {{ editItem.code }}
      </DescriptionsItem>
      <!-- 入库时间 -->
      <DescriptionsItem
        :label="$t('packagingAndInventoryReversal.warehousingTime')"
      >
        {{ editItem.opTime }}
      </DescriptionsItem>
      <!-- 入库人 -->
      <DescriptionsItem
        :label="$t('packagingAndInventoryReversal.personEnteringTheWarehouse')"
      >
        {{ editItem.opUser }}
      </DescriptionsItem>
      <!-- 冲销时间 -->
      <DescriptionsItem
        :span="2"
        :label="$t('packagingAndInventoryReversal.writeOffTime')"
      >
        <DatePicker
          show-time
          :placeholder="$t('packagingAndInventoryReversal.writeOffTime')"
          v-model:value="editItem.callBackTime"
        />
      </DescriptionsItem>
    </Descriptions>

    <template #footer>
      <Space>
        <!-- 取消 -->
        <Button @click="close">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 提交  -->
        <Button
          type="primary"
          @click="chargeAgainst()"
          :loading="editItem.loading"
        >
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
  <!-- endregion -->
</template>

<style scoped></style>
