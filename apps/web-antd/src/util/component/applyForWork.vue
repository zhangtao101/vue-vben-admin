<script setup lang="ts">
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, watch } from 'vue';

import { GrommetIconsUpdate } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Empty,
  InputNumber,
  message,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getWorkSheetFinishSituationDetailsByWorkCode,
  worksheetReportUpdate,
} from '#/api';

const prop = defineProps({
  workSheetCode: {
    type: String,
    default: () => '',
    required: true,
  },
  operation: {
    type: Boolean,
    default: () => false,
    required: true,
  },
});

// region 表格
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  editConfig: {
    trigger: 'click',
    mode: 'row',
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { type: 'expand', width: 80, slots: { content: 'expand_content' } },
    { field: 'reportCode', title: '报工单号', minWidth: 220 },
    { field: 'processCode', title: '工序编号', minWidth: 150 },
    { field: 'processName', title: '报工工序', minWidth: 150 },
    {
      field: 'dlValue',
      title: '能耗电量',
      editRender: {},
      slots: { edit: 'edit_dlValue' },
      minWidth: 150,
    },
    {
      field: 'trqValue',
      title: '能耗天然气',
      editRender: {},
      slots: { edit: 'edit_trqValue' },
      minWidth: 150,
    },
    {
      field: 'jlqValue',
      title: '能耗焦炉气',
      editRender: {},
      slots: { edit: 'edit_jlqValue' },
      minWidth: 150,
    },
    {
      field: 'smjValue',
      title: '能耗水煤浆',
      editRender: {},
      slots: { edit: 'edit_smjValue' },
      minWidth: 150,
    },
    { field: 'reportTime', title: '报工时间', minWidth: 200 },
    { field: 'reportUser', title: '报工人', minWidth: 150 },
    { field: 'workstationCode', title: '工作站编号', minWidth: 150 },
    { field: 'workstationName', title: '工作站名称', minWidth: 150 },
    { field: 'defectCode', title: '缺陷代码', minWidth: 150 },
    { field: 'productCode', title: '产品编号', minWidth: 150 },
    { field: 'productName', title: '产品名称', minWidth: 150 },
    { field: 'reportNumber', title: '报工总数', minWidth: 150 },
    { field: 'qualityNumber', title: '良品数', minWidth: 150 },
    { field: 'unqualityNumber', title: '废品数', minWidth: 150 },
    { field: 'waiteNumber', title: '等待处理数量', minWidth: 150 },
    {
      field: 'personTime',
      title: '人时',
      editRender: {},
      slots: { edit: 'edit_personTime' },
      minWidth: 150,
    },
    {
      field: 'equipTime',
      title: '机时',
      editRender: {},
      slots: { edit: 'edit_equipTime' },
      minWidth: 150,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 220,
    },
  ],
  height: 250,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return prop.workSheetCode
          ? await queryData({
              page: page.currentPage,
              pageSize: page.pageSize,
            })
          : Promise.resolve({
              total: 0,
              items: [],
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

// region 查询数据

/**
 * 从服务器查询工作站数据的函数。
 * 这个函数用于发送查询请求，并在成功获取数据后更新组件的状态。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      workSheetCode: prop.workSheetCode, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    };
    /**
     * 调用 queryWorkstation 函数，传入查询参数和分页信息。
     * 查询参数包括 queryParams.value 中的所有属性，以及当前页码和每页大小。
     */
    getWorkSheetFinishSituationDetailsByWorkCode(params)
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

// region 冲红

/**
 * 冲红
 * @param row
 */
function flushRed(row: any) {
  row.loading = true;
  worksheetReportUpdate(row)
    .then(() => {
      message.success($t('common.successfulOperation')); // 成功操作的提示信息（通过国际化处理）
    })
    .finally(() => {
      row.loading = false;
    });
}

// endregion

watch(
  () => prop.workSheetCode,
  () => {
    gridApi.reload();
  },
);
onMounted(() => {});
</script>

<template>
  <!-- region 表格主体 -->
  <Card class="mt-4" v-if="workSheetCode">
    <Grid>
      <template #edit_dlValue="{ row }">
        <InputNumber v-model:value="row.dlValue" :min="0" />
      </template>
      <template #edit_trqValue="{ row }">
        <InputNumber v-model:value="row.trqValue" :min="0" />
      </template>
      <template #edit_jlqValue="{ row }">
        <InputNumber v-model:value="row.jlqValue" :min="0" />
      </template>
      <template #edit_smjValue="{ row }">
        <InputNumber v-model:value="row.smjValue" :min="0" />
      </template>
      <template #edit_personTime="{ row }">
        <InputNumber v-model:value="row.personTime" :min="0" />
      </template>
      <template #edit_equipTime="{ row }">
        <InputNumber v-model:value="row.equipTime" :min="0" />
      </template>

      <template #expand_content="{ row }">
        <div v-if="row.details && row.details.length > 0">
          <Descriptions bordered v-for="item of row.details" :key="item.id">
            <DescriptionsItem label="报工总数">
              {{ item.reportNumber }}
            </DescriptionsItem>
            <DescriptionsItem label="良品数">
              {{ item.qualityNumber }}
            </DescriptionsItem>
            <DescriptionsItem label="废品数">
              {{ item.unqualityNumber }}
            </DescriptionsItem>
            <DescriptionsItem label="人时">
              <InputNumber v-model:value="item.personTime" :min="0" />
            </DescriptionsItem>
            <DescriptionsItem label="报工人">
              {{ item.reportPerson }}
            </DescriptionsItem>
          </Descriptions>
        </div>
        <Empty v-else description="暂无具体人员的报工数据" />
      </template>

      <template #action="{ row }">
        <!-- 编辑按钮 -->
        <Tooltip>
          <template #title>
            {{ $t('common.flushRed') }}
          </template>
          <Button
            :icon="h(GrommetIconsUpdate, { class: 'inline-block size-6' })"
            :loading="row.loading"
            class="mr-4"
            type="link"
            @click="flushRed(row)"
            v-if="operation"
          />
        </Tooltip>
      </template>
    </Grid>
  </Card>
  <!-- endregion -->
</template>

<style scoped></style>
