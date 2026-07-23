<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  RangePicker,
  Select,
  Space,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  mergeWorkSheet,
  mergeWorksheetListPoOrderByWorksheetCode,
  mergeWorksheetUnbinding,
  planWorksheetSearch,
} from '#/api';
import { $t } from '#/locales';

const props = defineProps<{ processType: number }>();

// region 查询条件
const queryParams = ref({
  workSheetCode: '',
});
const dateRange = ref<any>(null);

function handleSearch() {
  gridApi.query();
}

function handleReset() {
  queryParams.value = { workSheetCode: '' };
  dateRange.value = null;
  gridApi.query();
}

// endregion

// region 主表格
const gridOptions: VxeGridProps<any> = {
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    { type: 'seq', width: 50, title: $t('page.common.serialNumber') },
    { field: 'workSheetCode', title: $t('workSheetBind.workSheetCode'), minWidth: 140, showOverflow: true },
    { field: 'planCode', title: $t('workSheetBind.planCode'), minWidth: 140, showOverflow: true },
    { field: 'productName', title: $t('workSheetBind.productName'), minWidth: 200, showOverflow: true },
    { field: 'productCode', title: $t('workSheetBind.productCode'), minWidth: 150, showOverflow: true },
    { field: 'subPlanCode', title: $t('workSheetBind.subPlanCode'), minWidth: 140, showOverflow: true },
    { field: 'lineName', title: $t('workSheetBind.lineName'), minWidth: 100, showOverflow: true },
    { field: 'planDateStart', title: $t('workSheetBind.planDateStart'), minWidth: 120 },
    { field: 'planDateStop', title: $t('workSheetBind.planDateStop'), minWidth: 120 },
    { field: 'workSheetPlanNumber', title: $t('workSheetBind.workSheetPlanNumber'), minWidth: 100 },
    { field: 'workSheetFinishNumber', title: $t('workSheetBind.workSheetFinishNumber'), minWidth: 100 },
    { field: 'produceNotFinishNumber', title: $t('workSheetBind.produceNotFinishNumber'), minWidth: 100 },
    { field: 'status', title: $t('workSheetBind.status'), minWidth: 80 },
  ],
  height: 500,
  checkboxConfig: {
    highlight: true,
  },
  pagerConfig: {
    pageSize: 20,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        const params: any = {
          workSheetCode: queryParams.value.workSheetCode || undefined,
          processType: props.processType,
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          isAsc: 1,
        };
        if (dateRange.value && dateRange.value.length === 2) {
          params.planDateStart = dayjs(dateRange.value[0]).format('YYYY-MM-DD');
          params.planDateEnd = dayjs(dateRange.value[1]).format('YYYY-MM-DD');
        }
        const data = await planWorksheetSearch(params);
        return {
          items: data.results || [],
          total: data.total || 0,
        };
      },
    },
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {
  checkboxChange: ({ records }: any) => {
    if (!records || records.length === 0) {
      selectedWsCodes.value = '';
      detailList.value = [];
      detailGridApi.setGridOptions({ data: [] });
      return;
    }
    const wsCodes = records
      .map((item: any) => item.workSheetCode)
      .filter(Boolean)
      .join(',');
    if (!wsCodes) {
      detailList.value = [];
      detailGridApi.setGridOptions({ data: [] });
      return;
    }
    selectedWsCodes.value = wsCodes;
    poOrderLoading.value = true;
    mergeWorksheetListPoOrderByWorksheetCode({ worksheetCodes: wsCodes })
      .then((data: any) => {
        detailList.value = Array.isArray(data) ? data : (data?.data || []);
        detailGridApi.setGridOptions({ data: detailList.value });
      })
      .catch(() => {
        detailList.value = [];
        detailGridApi.setGridOptions({ data: [] });
      })
      .finally(() => {
        poOrderLoading.value = false;
      });
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents,
  gridOptions,
});
// endregion

// region PO-SO绑定清单（表格下方）
const detailList = ref<any[]>([]);
const selectedWsCodes = ref('');
const poOrderLoading = ref(false);

const unbindModalVisible = ref(false);
const unbindWsCode = ref('');
const unbindWsCodeOptions = computed(() => {
  const set = new Set<string>();
  detailList.value.forEach((row: any) => {
    if (row.worksheetCode) {
      set.add(row.worksheetCode);
    }
  });
  return [...set].map((code) => ({ label: code, value: code }));
});

const detailGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    { type: 'seq', width: 50, title: $t('page.common.serialNumber') },
    { field: 'worksheetCode', title: $t('workSheetBind.workSheetCode'), minWidth: 140, showOverflow: true },
    { field: 'processName', title: $t('workSheetBind.processType'), minWidth: 80 },
    { field: 'poOrderCode', title: $t('workSheetBind.poOrderCode'), minWidth: 160, showOverflow: true },
    { field: 'productCode', title: $t('workSheetBind.detailProductCode'), minWidth: 150, showOverflow: true },
    { field: 'productName', title: $t('workSheetBind.productName'), minWidth: 200, showOverflow: true },
    { field: 'soOrderCode', title: $t('workSheetBind.soOrderCode'), minWidth: 160, showOverflow: true },
    { field: 'deliveryDate', title: $t('workSheetBind.deliveryDate'), minWidth: 120 },
    { field: 'poOrderNumber', title: $t('workSheetBind.poOrderNumber'), minWidth: 100 },
    { field: 'soOrderNumber', title: $t('workSheetBind.soOrderNumber'), minWidth: 100 },
  ],
  height: 300,
  stripe: true,
  checkboxConfig: {
    highlight: true,
  },
  pagerConfig: {
    enabled: false,
  },
  toolbarConfig: {
    refresh: false,
    zoom: false,
  },
};

const selectedDetailRows = ref<any[]>([]);
const detailGridEvents: VxeGridListeners<any> = {
  checkboxChange: ({ records }: any) => {
    selectedDetailRows.value = records || [];
  },
};

const [DetailGrid, detailGridApi] = useVbenVxeGrid({
  gridEvents: detailGridEvents,
  gridOptions: detailGridOptions,
});

/**
 * 关闭PO-SO绑定清单
 * @since 2026-07-23
 */
function closeBind() {
  selectedWsCodes.value = '';
  detailList.value = [];
  detailGridApi.setGridOptions({ data: [] });
}

/**
 * 打开解绑弹窗
 * @since 2026-07-23
 */
function openUnbindModal() {
  unbindWsCode.value = '';
  unbindModalVisible.value = true;
}

/**
 * 解绑工单（解除PO-SO绑定）：弹窗中选择工单号后执行
 * @since 2026-07-23
 */
function handleUnbindConfirm() {
  if (!unbindWsCode.value) {
    return;
  }
  mergeWorksheetUnbinding({ worksheetCode: unbindWsCode.value })
    .then(() => {
      message.success($t('workSheetBind.unbindSuccess'));
      unbindModalVisible.value = false;
      gridApi.query();
      if (selectedWsCodes.value) {
        mergeWorksheetListPoOrderByWorksheetCode({ worksheetCodes: selectedWsCodes.value })
          .then((data: any) => {
            detailList.value = Array.isArray(data) ? data : (data?.data || []);
            detailGridApi.setGridOptions({ data: detailList.value });
          });
      }
    });
}

/**
 * 拆单重组保存：将勾选的明细按工单号分组后提交
 * @since 2026-07-23
 */
function handleMergeSave() {
  if (selectedDetailRows.value.length === 0) {
    return;
  }
  const params = {
    processType: props.processType,
    choseDetails: selectedDetailRows.value,
  };
  mergeWorkSheet(params)
    .then(() => {
      message.success($t('workSheetBind.mergeSuccess'));
      selectedDetailRows.value = [];
      gridApi.query();
      if (selectedWsCodes.value) {
        mergeWorksheetListPoOrderByWorksheetCode({ worksheetCodes: selectedWsCodes.value })
          .then((data: any) => {
            detailList.value = Array.isArray(data) ? data : (data?.data || []);
            detailGridApi.setGridOptions({ data: detailList.value });
          });
      }
    });
}
// endregion
</script>

<template>
  <Page>
    <!-- region 查询表单 -->
    <Card>
      <Form
        :model="queryParams"
        layout="inline"
      >
        <!-- 工单号 -->
        <FormItem :label="$t('workSheetBind.workSheetCode')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.workSheetCode" />
        </FormItem>
        <!-- 计划日期 -->
        <FormItem :label="$t('workSheetBind.planDate')" style="margin-bottom: 1em">
          <RangePicker v-model:value="dateRange" />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Space>
            <Button type="primary" @click="handleSearch">
              {{ $t('common.search') }}
            </Button>
            <Button @click="handleReset">{{ $t('common.reset') }}</Button>
          </Space>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 表格主体 -->
    <Card class="mt-4!">
      <Grid>
        <template #toolbar-tools></template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- PO-SO绑定清单（表格下方） -->
      <Card
        v-if="selectedWsCodes"
        class="mt-4!"
        :loading="poOrderLoading"
        :title="$t('workSheetBind.poSoBindList')"
      >
        <template #extra>
          <Space>
            <Button
              size="small"
              @click="closeBind"
            >
              {{ $t('workSheetBind.close') }}
            </Button>
          </Space>
        </template>

        <DetailGrid>
          <template #toolbar-tools>
            <Space>
              <Button
                type="primary"
                :disabled="selectedDetailRows.length === 0"
                @click="handleMergeSave"
              >
                {{ $t('workSheetBind.mergeSave') }}
              </Button>
              <Button
                danger
                :disabled="detailList.length === 0"
                @click="openUnbindModal"
              >
                {{ $t('workSheetBind.unbind') }}
              </Button>
            </Space>
          </template>
        </DetailGrid>

        <Modal
          v-model:open="unbindModalVisible"
          :title="$t('workSheetBind.unbind')"
          :ok-text="$t('common.confirm')"
          :cancel-text="$t('common.cancel')"
          @ok="handleUnbindConfirm"
        >
          <Form layout="vertical">
            <FormItem :label="$t('workSheetBind.workSheetCode')">
              <Select
                v-model:value="unbindWsCode"
                :options="unbindWsCodeOptions"
                :placeholder="$t('workSheetBind.pleaseSelectWorkSheet')"
                show-search
              />
            </FormItem>
          </Form>
        </Modal>
      </Card>
  </Page>
</template>
