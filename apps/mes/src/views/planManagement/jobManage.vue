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
  Form,
  FormItem,
  Input,
  message,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  planJobInfoDetail,
  planJobInfoPage,
  planJobInfoSplit,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      title: $t('page.common.serialNumber'),
      type: 'seq',
      width: 50,
      minWidth: 50,
    },
    {
      field: 'jobCode',
      title: $t('jobManage.jobCode'),
      minWidth: 140,
      showOverflow: true,
    },
    {
      field: 'jobNumber',
      title: $t('jobManage.jobNumber'),
      minWidth: 100,
    },
    {
      field: 'jobStartDate',
      title: $t('jobManage.jobStartDate'),
      minWidth: 140,
    },
    {
      field: 'jobEndDate',
      title: $t('jobManage.jobEndDate'),
      minWidth: 140,
    },
    {
      field: 'classType',
      title: $t('jobManage.classType'),
      minWidth: 80,
    },
    {
      field: 'specialLevel',
      title: $t('jobManage.specialLevel'),
      minWidth: 80,
    },
    {
      field: 'lineCode',
      title: $t('jobManage.lineCode'),
      minWidth: 100,
    },
    {
      field: 'lineName',
      title: $t('jobManage.lineName'),
      minWidth: 100,
      showOverflow: true,
    },
    {
      field: 'productCode',
      title: $t('jobManage.productCode'),
      minWidth: 150,
      showOverflow: true,
    },
    {
      field: 'productName',
      title: $t('jobManage.productName'),
      minWidth: 200,
      showOverflow: true,
    },
    {
      field: 'unit',
      title: $t('jobManage.unit'),
      minWidth: 60,
    },
    {
      field: 'jobQuality',
      title: $t('jobManage.jobQuality'),
      minWidth: 80,
    },
    {
      field: 'jobUnquality',
      title: $t('jobManage.jobUnquality'),
      minWidth: 80,
    },
    {
      field: 'status',
      title: $t('jobManage.status'),
      minWidth: 80,
      slots: { default: 'statusSlot' },
    },
    {
      field: 'remarks',
      title: $t('jobManage.remarks'),
      minWidth: 100,
      showOverflow: true,
    },
    {
      field: 'action',
      title: $t('baseInfo.action'),
      fixed: 'right',
      minWidth: 160,
      slots: { default: 'action' },
    },
  ],
  height: 500,
  stripe: true,
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
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// endregion

// region 查询数据
const queryParams = ref<any>({
  productCode: '',
  productName: '',
  JobCode: '',
});

/**
 * 查询JOB单据列表数据。
 * @param {object} options - 分页参数
 * @param {number} options.page - 当前页码
 * @param {number} options.pageSize - 每页显示条数
 * @since 2026-07-23
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    planJobInfoPage({
      ...queryParams.value,
      pageNum: page,
      pageSize,
    })
      .then(({ total, list }) => {
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

// region PO-SO详情（表格下方展示）
const poSoLoading = ref(false);
const poSoList = ref<any[]>([]);
const currentJobCode = ref('');

// PO-SO详情表格配置（VxeTable）
const poSoGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { field: 'jobCode', title: $t('jobManage.jobCode'), minWidth: 140, showOverflow: true },
    { field: 'productCode', title: $t('jobManage.productCode'), minWidth: 150, showOverflow: true },
    { field: 'productName', title: $t('jobManage.productName'), minWidth: 200, showOverflow: true },
    { field: 'poOrderCode', title: $t('jobManage.poOrderCode'), minWidth: 140, showOverflow: true },
    { field: 'poOrderNumber', title: $t('jobManage.poOrderNumber'), minWidth: 100 },
    { field: 'soOrderCode', title: $t('jobManage.soOrderCode'), minWidth: 160, showOverflow: true },
    { field: 'soOrderNumber', title: $t('jobManage.soOrderNumber'), minWidth: 100 },
    { field: 'soSeq', title: $t('jobManage.soSeq'), minWidth: 80 },
    { field: 'poDeliveryDate', title: $t('jobManage.poDeliveryDate'), minWidth: 120, showOverflow: true },
    { field: 'soDeliveryDate', title: $t('jobManage.soDeliveryDate'), minWidth: 120, showOverflow: true },
  ],
  height: 300,
  stripe: true,
  toolbarConfig: {
    refresh: false,
    zoom: false,
  },
};

const poSoGridEvents: VxeGridListeners<any> = {};

const [PoSoGrid, poSoGridApi] = useVbenVxeGrid({
  gridEvents: poSoGridEvents,
  gridOptions: poSoGridOptions,
});

/**
 * 查看JOB绑定的PO-SO单据清单，在表格下方展示。
 * @param {object} row - 当前行数据
 * @since 2026-07-23
 */
function viewPoSo(row: any) {
  currentJobCode.value = row.jobCode;
  poSoLoading.value = true;
  planJobInfoDetail({ jobCode: row.jobCode })
    .then((data: any) => {
      poSoList.value = Array.isArray(data) ? data : [];
      poSoGridApi.setGridOptions({ data: poSoList.value });
    })
    .catch(() => {
      poSoList.value = [];
      poSoGridApi.setGridOptions({ data: [] });
    })
    .finally(() => {
      poSoLoading.value = false;
    });
}

/**
 * 关闭PO-SO详情
 * @since 2026-07-23
 */
function closePoSo() {
  poSoList.value = [];
  currentJobCode.value = '';
  poSoGridApi.setGridOptions({ data: [] });
}

// endregion

// region 拆分JOB单
/**
 * JOB单拆分为工单
 * @param {object} row - 当前行数据
 * @since 2026-07-23
 */
function splitJob(row: any) {
  planJobInfoSplit({ jobCode: row.jobCode }).then((res: any) => {
    message.success(
      $t('jobManage.splitSuccess', { count: res.workSheetCount || res?.data?.workSheetCount || 0 }),
    );
    gridApi.reload();
  });
}

// endregion

// region 权限查询
const author = ref<string[]>([]);

// endregion

// region 初始化
onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});
// endregion
</script>

<template>
  <Page>
    <!-- region 搜索区域 -->
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 产品编号 -->
        <FormItem
          :label="$t('jobManage.productCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.productCode"
          />
        </FormItem>
        <!-- 产品名称 -->
        <FormItem
          :label="$t('jobManage.productName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.productName"
          />
        </FormItem>
        <!-- JOB单号 -->
        <FormItem
          :label="$t('jobManage.jobCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.JobCode"
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
        <template #toolbar-tools></template>
        <!-- 状态 -->
        <template #statusSlot="{ row }">
          <Tag v-if="row.status === -1" color="default">
            {{ $t('jobManage.statusUnexecuted') }}
          </Tag>
          <Tag v-else-if="row.status === 1" color="green">
            {{ $t('jobManage.statusGenerated') }}
          </Tag>
          <span v-else>{{ row.status }}</span>
        </template>
        <!-- 操作 -->
        <template #action="{ row }">
          <Space>
            <!-- 查看PO-SO -->
            <Tooltip>
              <template #title>{{ $t('jobManage.viewPoSo') }}</template>
              <Button
                v-if="author.includes('查看')"
                type="link"
                @click="viewPoSo(row)"
              >
                <Icon
                  icon="mdi:file-document-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <!-- 拆分 -->
            <Tooltip>
              <template #title>{{ $t('jobManage.split') }}</template>
              <Popconfirm
                v-if="author.includes('拆分') && row.status === -1"
                :cancel-text="$t('common.cancel')"
                :ok-text="$t('common.confirm')"
                :title="$t('jobManage.splitConfirm', { jobCode: row.jobCode })"
                @confirm="splitJob(row)"
              >
                <Button type="link">
                  <Icon
                    icon="mdi:file-document-plus"
                    class="inline-block align-middle text-2xl"
                  />
                </Button>
              </Popconfirm>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->



      <!-- PO-SO详情区域（表格下方） -->
      <Card
        v-if="currentJobCode"
        class="mt-4!"
      >
        <div class="mb-2 flex items-center justify-between">
          <span class="text-base font-semibold">
            {{ `${$t('jobManage.poSoList')} - ${currentJobCode}` }}
          </span>
          <Button
            size="small"
            @click="closePoSo"
          >
            {{ $t('jobManage.close') }}
          </Button>
        </div>
        <PoSoGrid>
          <template #toolbar-tools></template>
        </PoSoGrid>
      </Card>
  </Page>
</template>

<style scoped></style>
