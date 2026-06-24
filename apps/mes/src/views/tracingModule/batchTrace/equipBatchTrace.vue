<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  DatePicker,
  Form,
  FormItem,
  Input,
  message,
  Select,
  Space,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  exportEquipBatchList,
  getEquipBatchDetailList,
  getEquipNameAndCode,
  getProcessCodeAndName,
} from '#/api/tracingModule/equipBatchTrace.service';
import { $t } from '#/locales';

// ========== 日期默认值 ==========
const today = new Date();
const endDefault = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

// ========== 查询参数 ==========
const queryParams = ref<any>({
  startTime: dayjs(today).format('YYYY-MM-DD'),
  endTime: dayjs(endDefault).format('YYYY-MM-DD'),
  produceWorkshop: undefined,
  proceCode: undefined,
  controlPointName: undefined,
  productCode: '',
});

// ========== 是否已搜索 ==========
const searched = ref(false);

// ========== 车间选项 ==========
const workshopOptions = [
  { label: 'SMT车间', value: 1 },
  { label: 'DIP车间', value: 2 },
];

// ========== 工序/设备下拉 ==========
const processOptions = ref<any[]>([]);
const equipNameOptions = ref<any[]>([]);

// ========== 车间变化 ==========
function handleWorkshopChange() {
  processOptions.value = [];
  equipNameOptions.value = [];
  queryParams.value.proceCode = undefined;
  queryParams.value.controlPointName = undefined;
  if (queryParams.value.produceWorkshop) {
    getProcessCodeAndName(queryParams.value.produceWorkshop).then((res: any) => {
      processOptions.value = res || [];
    });
  }
}

// ========== 工序变化 ==========
function handleProcessChange() {
  equipNameOptions.value = [];
  queryParams.value.controlPointName = undefined;
  if (queryParams.value.proceCode) {
    getEquipNameAndCode(queryParams.value.proceCode).then((res: any) => {
      equipNameOptions.value = res || [];
    });
  }
}

// ========== 日期格式化辅助 ==========
function formatQueryDate(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return dayjs(value).format('YYYY-MM-DD');
}

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 60, title: $t('tracingModule.productTrace.seq') },
    { field: 'qrcode', title: $t('tracingModule.equipBatchTrace.qrcode'), minWidth: 180 },
    { field: 'number', title: $t('tracingModule.equipBatchTrace.number'), minWidth: 80 },
    { field: 'productName', title: $t('tracingModule.productTrace.productName'), minWidth: 200, showOverflow: true },
    { field: 'productCode', title: $t('tracingModule.productTrace.productCode'), minWidth: 120 },
    { field: 'partName', title: $t('tracingModule.equipBatchTrace.partName'), minWidth: 200, showOverflow: true },
    { field: 'partCode', title: $t('tracingModule.equipBatchTrace.partCode'), minWidth: 150 },
    { field: 'lineName', title: $t('tracingModule.equipBatchTrace.lineName'), minWidth: 130 },
    { field: 'opTime', title: $t('tracingModule.productTrace.productionTime'), minWidth: 135 },
    { field: 'planCode', title: $t('tracingModule.productTrace.planCode'), minWidth: 120 },
    { field: 'packingTime', title: $t('tracingModule.productTrace.packingTime'), minWidth: 135 },
    { field: 'packingCode', title: $t('tracingModule.productTrace.packingCode'), minWidth: 180 },
    { field: 'outTime', title: $t('tracingModule.equipBatchTrace.outTime'), minWidth: 135 },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50],
    total: 0,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
    autoLoad: false,
  },
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// ========== 数据查询 ==========
function queryData({ pageNum, pageSize }: { pageNum: number; pageSize: number }) {
  return new Promise((resolve) => {
    if (!searched.value) {
      resolve({ total: 0, items: [] });
      return;
    }

    const params = {
      startTime: formatQueryDate(queryParams.value.startTime),
      endTime: formatQueryDate(queryParams.value.endTime),
      produceWorkshop: queryParams.value.produceWorkshop,
      proceCode: queryParams.value.proceCode,
      controlPointName: queryParams.value.controlPointName,
      productCode: queryParams.value.productCode,
      pageNum,
      pageSize,
    };

    getEquipBatchDetailList(params)
      .then((res: any) => {
        resolve({
          total: res?.total || 0,
          items: res?.list || [],
        });
      })
      .catch(() => {
        resolve({ total: 0, items: [] });
      });
  });
}

// ========== 必填校验 ==========
function validateRequired(): boolean {
  if (!queryParams.value.startTime) {
    message.warning(
      $t('tracingModule.equipBatchTrace.startTime') +
        $t('tracingModule.equipBatchTrace.validationRequired'),
    );
    return false;
  }
  if (!queryParams.value.endTime) {
    message.warning(
      $t('tracingModule.equipBatchTrace.endTime') +
        $t('tracingModule.equipBatchTrace.validationRequired'),
    );
    return false;
  }
  if (!queryParams.value.produceWorkshop) {
    message.warning(
      $t('tracingModule.equipBatchTrace.produceWorkshop') +
        $t('tracingModule.equipBatchTrace.validationRequired'),
    );
    return false;
  }
  if (!queryParams.value.proceCode) {
    message.warning(
      $t('tracingModule.equipBatchTrace.proceCode') +
        $t('tracingModule.equipBatchTrace.validationRequired'),
    );
    return false;
  }
  if (!queryParams.value.controlPointName) {
    message.warning(
      $t('tracingModule.equipBatchTrace.controlPointName') +
        $t('tracingModule.equipBatchTrace.validationRequired'),
    );
    return false;
  }
  return true;
}

// ========== 搜索 ==========
function handleSearch() {
  if (!validateRequired()) return;
  searched.value = true;
  gridApi.reload();
}

// ========== 重置 ==========
function handleReset() {
  queryParams.value = {
    startTime: dayjs(today).format('YYYY-MM-DD'),
    endTime: dayjs(endDefault).format('YYYY-MM-DD'),
    produceWorkshop: undefined,
    proceCode: undefined,
    controlPointName: undefined,
    productCode: '',
  };
  processOptions.value = [];
  equipNameOptions.value = [];
  searched.value = false;
  gridApi.reload();
}

// ========== 导出 ==========
function handleExport() {
  if (!validateRequired()) return;

  const params = {
    startTime: formatQueryDate(queryParams.value.startTime),
    endTime: formatQueryDate(queryParams.value.endTime),
    produceWorkshop: queryParams.value.produceWorkshop,
    proceCode: queryParams.value.proceCode,
    controlPointName: queryParams.value.controlPointName,
    productCode: queryParams.value.productCode,
  };

  exportEquipBatchList(params)
    .then((res: any) => {
      const blob = new Blob([res]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'equip_batch_trace.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
}

// ========== 结束日期禁用逻辑 ==========
const disabledEndDate = (current: any) => {
  if (!queryParams.value.startTime) return false;
  const startDate = dayjs(queryParams.value.startTime);
  return current && current.isBefore(startDate, 'day');
};
</script>

<template>
  <Page>
    <!-- 标题 -->
    <Card class="!mb-4" :title="$t('tracingModule.equipBatchTrace.title')">
      <Form :model="queryParams" layout="inline">
        <!-- 开始日期 -->
        <FormItem
          :label="$t('tracingModule.equipBatchTrace.startTime')"
          :required="true"
          style="margin-bottom: 1em"
        >
          <DatePicker
            v-model:value="queryParams.startTime"
            :placeholder="$t('tracingModule.equipBatchTrace.datePlaceholder')"
            value-format="YYYY-MM-DD"
            style="width: 180px"
          />
        </FormItem>

        <!-- 结束日期 -->
        <FormItem
          :label="$t('tracingModule.equipBatchTrace.endTime')"
          :required="true"
          style="margin-bottom: 1em"
        >
          <DatePicker
            v-model:value="queryParams.endTime"
            :placeholder="$t('tracingModule.equipBatchTrace.datePlaceholder')"
            :disabled-date="disabledEndDate"
            value-format="YYYY-MM-DD"
            style="width: 180px"
          />
        </FormItem>

        <!-- 所属车间 -->
        <FormItem
          :label="$t('tracingModule.equipBatchTrace.produceWorkshop')"
          :required="true"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.produceWorkshop"
            :placeholder="$t('tracingModule.equipBatchTrace.workshopPlaceholder')"
            allow-clear
            :options="workshopOptions"
            @change="handleWorkshopChange"
            style="width: 180px"
          />
        </FormItem>

        <!-- 所属工序 -->
        <FormItem
          :label="$t('tracingModule.equipBatchTrace.proceCode')"
          :required="true"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.proceCode"
            :placeholder="$t('tracingModule.equipBatchTrace.processPlaceholder')"
            allow-clear
            :options="processOptions.map((p: any) => ({ label: p.proceName, value: p.proceCode }))"
            @change="handleProcessChange"
            style="width: 180px"
          />
        </FormItem>

        <!-- 设备名称 -->
        <FormItem
          :label="$t('tracingModule.equipBatchTrace.controlPointName')"
          :required="true"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.controlPointName"
            :placeholder="$t('tracingModule.equipBatchTrace.equipPlaceholder')"
            allow-clear
            :options="equipNameOptions.map((e: any) => ({ label: e.controlPointName, value: e.controlPointName }))"
            style="width: 180px"
          />
        </FormItem>

        <!-- 产品编号 -->
        <FormItem :label="$t('tracingModule.productTrace.productCode')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.productCode"
            :placeholder="$t('tracingModule.equipBatchTrace.productCodePlaceholder')"
            allow-clear
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </FormItem>

        <!-- 查询/重置 -->
        <FormItem style="margin-bottom: 1em">
          <Space>
            <Button type="primary" @click="handleSearch">
              <Icon icon="mdi:magnify" class="mr-1" />
              {{ $t('tracingModule.productTrace.search') }}
            </Button>
            <Button @click="handleReset">
              <Icon icon="mdi:refresh" class="mr-1" />
              {{ $t('common.reset') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card v-if="searched">
      <template #title>
        <div class="flex items-center justify-between">
          <span>{{ $t('tracingModule.equipBatchTrace.productList') }}</span>
          <Button type="primary" size="small" @click="handleExport">
            <Icon icon="mdi:export" class="mr-1" />
            {{ $t('tracingModule.equipBatchTrace.export') }}
          </Button>
        </div>
      </template>
      <Grid />
    </Card>
  </Page>
</template>

<style scoped></style>
