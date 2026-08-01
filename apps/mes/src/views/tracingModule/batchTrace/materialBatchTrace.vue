<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { nextTick, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Card, Drawer, Form, FormItem, Input, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  exportMaterialBatchList,
  getMaterialBatchDetailById,
  getMaterialBatchDetailList,
} from '#/api';
import { $t } from '#/locales';

// ========== 查询参数 ==========
const queryParams = ref<any>({
  labelCode: '',
  pageNum: 1,
  pageSize: 10,
});

// ========== 物料基本信息 ==========
const materialInfo = ref<any>({});

// ========== 数据展示控制 ==========
const showData = ref(false);
const loading = ref(false);

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: '序号' },
    {
      field: 'qrcode',
      title: $t('tracingModule.materialBatchTrace.qrcode'),
      minWidth: 180,
    },
    {
      field: 'number',
      title: $t('tracingModule.materialBatchTrace.number'),
      minWidth: 80,
    },
    {
      field: 'productName',
      title: $t('tracingModule.materialBatchTrace.productName'),
      minWidth: 200,
    },
    {
      field: 'productCode',
      title: $t('tracingModule.materialBatchTrace.productCode'),
      minWidth: 120,
    },
    {
      field: 'partName',
      title: $t('tracingModule.materialBatchTrace.partName'),
      minWidth: 200,
    },
    {
      field: 'partCode',
      title: $t('tracingModule.materialBatchTrace.partCode'),
      minWidth: 150,
    },
    {
      field: 'lineName',
      title: $t('tracingModule.materialBatchTrace.lineName'),
      minWidth: 130,
    },
    {
      field: 'opTime',
      title: $t('tracingModule.materialBatchTrace.productionTime'),
      minWidth: 135,
    },
    {
      field: 'planCode',
      title: $t('tracingModule.materialBatchTrace.planCode'),
      minWidth: 120,
    },
    {
      field: 'packingTime',
      title: $t('tracingModule.materialBatchTrace.packingTime'),
      minWidth: 135,
    },
    {
      field: 'packingCode',
      title: $t('tracingModule.materialBatchTrace.packingCode'),
      minWidth: 180,
    },
    {
      field: 'outTime',
      title: $t('tracingModule.materialBatchTrace.outTime'),
      minWidth: 135,
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryTableData({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// ========== 表格数据查询 ==========
function queryTableData({ pageNum, pageSize }: { pageNum: number; pageSize: number }) {
  return new Promise((resolve) => {
    const params = {
      labelCode: queryParams.value.labelCode,
      pageNum,
      pageSize,
    };

    getMaterialBatchDetailList(params)
      .then((res: any) => {
        materialInfo.value = {
          materialName: res?.materialName || '',
          materialCode: res?.materialCode || '',
          batchCode: res?.batchCode || '',
          manufacturerName: res?.manufacturerName || '',
          produceDate: res?.produceDate || '',
          sendFormCode: res?.sendFormCode || '',
          sendFormId: res?.sendFormId || '',
          sendDate: res?.sendDate || '',
        };

        const productList = res?.productList || {};

        resolve({
          total: productList.total || 0,
          items: productList.list || [],
        });
      })
      .catch(() => {
        materialInfo.value = {};
        resolve({
          total: 0,
          items: [],
        });
      });
  });
}

// ========== 查询 ==========
function handleSearch() {
  if (!queryParams.value.labelCode) {
    message.warning($t('tracingModule.materialBatchTrace.labelBarcodeEntryRequired'));
    return;
  }
  queryParams.value.pageNum = 1;
  loading.value = true;
  showData.value = true;
  nextTick(() => {
    gridApi.reload();
    loading.value = false;
  });
}

// ========== 导出 ==========
function handleExport() {
  if (!queryParams.value.labelCode) {
    message.warning($t('tracingModule.materialBatchTrace.labelBarcodeEntryRequired'));
    return;
  }

  const params = {
    labelCode: queryParams.value.labelCode,
  };

  exportMaterialBatchList(params)
    .then((res: any) => {
      const blob = new Blob([res], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${$t('tracingModule.materialBatchTrace.title')}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
}

// ========== 抽屉控制 ==========
const drawerVisible = ref(false);
const popData = ref<any>({ labelList: [] });

// 质检结论映射
const checkResultMap: Record<string, string> = {
  '1': 'tracingModule.productTrace.qualifyStatus',
  '2': 'tracingModule.productTrace.failStatus',
  '3': 'tracingModule.productTrace.concession',
  '4': 'tracingModule.productTrace.urgentRelease',
};

// ========== 查看详情 ==========
function handleDetail() {
  if (!materialInfo.value.sendFormId) return;

  getMaterialBatchDetailById(materialInfo.value.sendFormId)
    .then((res: any) => {
      const data = { ...res };
      data.unqualified =
        (data.checkNumber || 0) - (data.qualifiedNumber || 0);
      const i18nKey = checkResultMap[String(data.checkResult)] || '';
      data.checkResultText = i18nKey
        ? $t(i18nKey)
        : String(data.checkResult);
      popData.value = data || {};
    });
  drawerVisible.value = true;
}
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <div
        class="mb-2.5 text-xl font-extrabold
        leading-8"
      >
        {{ $t('tracingModule.materialBatchTrace.title') }}
      </div>
      <Form layout="inline" :model="queryParams">
        <!-- 物料条码 -->
        <FormItem
          :label="$t('tracingModule.materialBatchTrace.labelCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.labelCode"
            :placeholder="$t('tracingModule.materialBatchTrace.labelCodePlaceholder')"
            allow-clear
            @press-enter="handleSearch"
          />
        </FormItem>

        <!-- 查询按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="handleSearch">
            {{ $t('tracingModule.materialBatchTrace.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <template v-if="showData">
      <!-- 物料基本信息 -->
      <Card
        class="!mb-4"
        :title="$t('tracingModule.materialBatchTrace.materialBasicInfo')"
      >
        <div class="grid grid-cols-3 gap-4">
          <div>
            <span class="font-semibold">
              {{ $t('tracingModule.materialBatchTrace.materialName') }}：
            </span>
            <span>{{ materialInfo.materialName }}</span>
          </div>
          <div>
            <span class="font-semibold">
              {{ $t('tracingModule.materialBatchTrace.materialCode') }}：
            </span>
            <span>{{ materialInfo.materialCode }}</span>
          </div>
          <div>
            <span class="font-semibold">
              {{ $t('tracingModule.materialBatchTrace.batchCode') }}：
            </span>
            <span>{{ materialInfo.batchCode }}</span>
          </div>
          <div>
            <span class="font-semibold">
              {{ $t('tracingModule.materialBatchTrace.manufacturerName') }}：
            </span>
            <span>{{ materialInfo.manufacturerName }}</span>
          </div>
          <div>
            <span class="font-semibold">
              {{ $t('tracingModule.materialBatchTrace.produceDate') }}：
            </span>
            <span>{{
              materialInfo.produceDate
                ? materialInfo.produceDate.substring(0, 10)
                : ''
            }}</span>
          </div>
          <div></div>
          <div>
            <span class="font-semibold">
              {{ $t('tracingModule.materialBatchTrace.sendFormCode') }}：
            </span>
            <span class="cursor-pointer text-blue-500" @click="handleDetail">
              {{ materialInfo.sendFormCode }}
            </span>
          </div>
          <div>
            <span class="font-semibold">
              {{ $t('tracingModule.materialBatchTrace.sendDate') }}：
            </span>
            <span>{{
              materialInfo.sendDate
                ? materialInfo.sendDate.substring(0, 10)
                : ''
            }}</span>
          </div>
          <div class="flex justify-end">
            <Button type="primary" @click="handleExport">
              {{ $t('tracingModule.materialBatchTrace.export') }}
            </Button>
          </div>
        </div>
      </Card>

      <!-- 产品明细表 -->
      <Card :title="$t('tracingModule.materialBatchTrace.productList')">
        <Grid>
          <template #toolbar-tools></template>
        </Grid>
      </Card>
    </template>

    <!-- 质检判定详情抽屉 -->
    <Drawer
      v-model:open="drawerVisible"
      :title="$t('tracingModule.materialBatchTrace.inspectionJudgmentDetail')"
      width="90%"
      :destroy-on-close="true"
    >
      <div v-if="popData.formCode" class="px-2">
        <!-- 送检信息 -->
        <Card
          :title="$t('tracingModule.materialBatchTrace.inspectionInfo')"
          size="small"
          class="!mb-4"
        >
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="font-semibold">
                {{ $t('tracingModule.materialBatchTrace.sendFormCode') }}：
              </span>
              <span>{{ popData.formCode }}</span>
            </div>
            <div>
              <span class="font-semibold">
                {{ $t('tracingModule.materialBatchTrace.sendDate') }}：
              </span>
              <span>{{ popData.sendDate }}</span>
            </div>
          </div>
          <div class="mt-2">
            <span class="font-semibold">
              {{ $t('tracingModule.productTrace.sendRemark') }}：
            </span>
            <span>{{ popData.remark }}</span>
          </div>
        </Card>

        <!-- 质检信息 -->
        <Card
          :title="$t('tracingModule.materialBatchTrace.qcInfo')"
          size="small"
          class="!mb-4"
        >
          <div class="grid grid-cols-3 gap-4">
            <div>
              <span class="font-semibold">
                {{ $t('tracingModule.materialBatchTrace.checkResult') }}：
              </span>
              <span>{{ popData.checkResultText }}</span>
            </div>
            <div>
              <span class="font-semibold">
                {{ $t('tracingModule.materialBatchTrace.judgeTime') }}：
              </span>
              <span>{{ popData.judgeTime }}</span>
            </div>
            <div>
              <span class="font-semibold">
                {{ $t('tracingModule.materialBatchTrace.receiveNumber') }}：
              </span>
              <span>{{ popData.receiveNumber }}</span>
            </div>
            <div>
              <span class="font-semibold">
                {{ $t('tracingModule.materialBatchTrace.checkNumber') }}：
              </span>
              <span>{{ popData.checkNumber }}</span>
            </div>
            <div>
              <span class="font-semibold">
                {{ $t('tracingModule.materialBatchTrace.qualifiedNumber') }}：
              </span>
              <span>{{ popData.qualifiedNumber }}</span>
            </div>
            <div>
              <span class="font-semibold">
                {{ $t('tracingModule.materialBatchTrace.unqualified') }}：
              </span>
              <span>{{ popData.unqualified }}</span>
            </div>
          </div>
          <div class="mt-2">
            <span class="font-semibold">
              {{ $t('tracingModule.materialBatchTrace.checkRemark') }}：
            </span>
            <span>{{ popData.checkRemark }}</span>
          </div>
        </Card>

        <!-- 质检详情表格 -->
        <Card
          :title="$t('tracingModule.productTrace.qcDetail')"
          size="small"
        >
          <VxeGrid
            :data="popData.labelList || []"
            border
            align="center"
            stripe
            :height="300"
            :columns="[
              { field: 'materialCode', title: $t('tracingModule.materialBatchTrace.materialCode'), minWidth: 100 },
              { field: 'materialName', title: $t('tracingModule.materialBatchTrace.materialName'), minWidth: 200 },
              { field: 'unit', title: $t('tracingModule.materialBatchTrace.unit'), minWidth: 80 },
              { field: 'sendNumber', title: $t('tracingModule.materialBatchTrace.sendNumber'), minWidth: 100 },
              { field: 'labelCode', title: $t('tracingModule.materialBatchTrace.labelCode'), minWidth: 180 },
              { field: 'manufacturerName', title: $t('tracingModule.materialBatchTrace.manufacturerName'), minWidth: 150 },
              { field: 'batchCode', title: $t('tracingModule.materialBatchTrace.batchCode'), minWidth: 120 },
              { field: 'qualifiedNumber', title: $t('tracingModule.materialBatchTrace.qualifiedNumber'), minWidth: 100 },
              { field: 'unqualified', title: $t('tracingModule.materialBatchTrace.unqualified'), minWidth: 100, slots: { default: 'unqualified' } },
            ]"
          >
            <template #unqualified="{ row }">
              <span v-if="row.qualifiedNumber != null">
                {{ (row.sendNumber || 0) - (row.qualifiedNumber || 0) }}
              </span>
            </template>
          </VxeGrid>
        </Card>
      </div>

      <template #footer>
        <Button @click="drawerVisible = false">
          {{ $t('tracingModule.materialBatchTrace.close') }}
        </Button>
      </template>
    </Drawer>
  </Page>
</template>
