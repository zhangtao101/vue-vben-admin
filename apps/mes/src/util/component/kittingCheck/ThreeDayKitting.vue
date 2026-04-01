<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  FormItem,
  Input,
  Row,
  Select,
  SelectOption,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import CapacityDetail from './CapacityDetail.vue';
import MaterialDetail from './MaterialDetail.vue';

// 查询表单
const formData = ref({
  planType: undefined as string | undefined,
  openDate: undefined as string | undefined,
  workOrderNo: '',
  productName: '',
});

// 表格显示控制
const tableShow = ref(false);

// 物料明细表格ref
const materialDetailRef = ref();

// 产能明细表格ref
const capacityDetailRef = ref();

// 计划类别选项
const planTypeOptions = [{ value: '1', label: '包装' }];

/**
 * 生成动态列
 * 根据开批日期生成3天的列
 */
function generateColumns() {
  const baseColumns: any[] = [
    { title: $t('basic.threeDayKitting.sequence'), type: 'seq', width: 50 },
    {
      field: 'workOrderNo',
      title: $t('basic.threeDayKitting.workOrderNo'),
      minWidth: 150,
    },
    {
      field: 'productName',
      title: $t('basic.threeDayKitting.productName'),
      minWidth: 180,
    },
    {
      field: 'workOrderQty',
      title: $t('basic.threeDayKitting.workOrderQty'),
      minWidth: 100,
    },
    {
      field: 'groupOrMachine',
      title: $t('basic.threeDayKitting.groupOrMachine'),
      minWidth: 120,
    },
    {
      field: 'workStation',
      title: $t('basic.threeDayKitting.workStation'),
      minWidth: 150,
    },
  ];

  // 根据开批日期生成3天的列
  if (formData.value.openDate) {
    const baseDate = new Date(formData.value.openDate);
    for (let i = 0; i < 3; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      baseColumns.push({
        field: `day${i}_date`,
        title: dateStr,
        minWidth: 150,
        children: [
          {
            field: `day${i}_schedule`,
            title: $t('basic.threeDayKitting.schedule'),
            minWidth: 60,
          },
          {
            field: `day${i}_hasGap`,
            title: $t('basic.threeDayKitting.hasGap'),
            minWidth: 80,
          },
          {
            field: `day${i}_isKitting`,
            title: $t('basic.threeDayKitting.isKitting'),
            minWidth: 80,
          },
          {
            field: `day${i}_kittingQty`,
            title: $t('basic.threeDayKitting.kittingQty'),
            minWidth: 80,
          },
          {
            field: `day${i}_openQty`,
            title: $t('basic.threeDayKitting.openQty'),
            minWidth: 80,
          },
          {
            field: `day${i}_notOpenQty`,
            title: $t('basic.threeDayKitting.notOpenQty'),
            minWidth: 80,
          },
        ],
      });
    }
  }

  return baseColumns;
}

const columns = ref<any[]>(generateColumns());

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: columns.value,
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
    pageSizes: [10, 20, 50],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await handleTableQuery({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    refresh: true,
    zoom: true,
    custom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/**
 * 表格查询
 */
function handleTableQuery(_params: any) {
  return new Promise((resolve) => {
    // TODO: 调用实际接口
    // const params = {
    //   page,
    //   pageSize,
    //   ...formData.value,
    // };
    // return kittingCheckApi.getThreeDayKitting(params)
    //   .then(({ total, list }) => {
    //     resolve({ total, items: list });
    //   });

    // 模拟数据
    setTimeout(() => {
      const mockData: any[] = [];
      for (let i = 1; i <= 10; i++) {
        const row: any = {
          workOrderNo: `WO202603${String(i).padStart(3, '0')}`,
          productName: `SMT主板${String.fromCodePoint(65 + (i % 5))}`,
          workOrderQty: 100 + i * 10,
          groupOrMachine: `小组${(i % 3) + 1}`,
          workStation: `SMT-A${(i % 4) + 1}`,
        };

        // 生成3天的数据
        for (let day = 0; day < 3; day++) {
          const isSchedule = Math.random() > 0.3;
          row[`day${day}_schedule`] = isSchedule ? $t('status.yes') : '-';
          row[`day${day}_hasGap`] =
            Math.random() > 0.5 ? $t('status.yes') : $t('status.no');
          row[`day${day}_isKitting`] =
            Math.random() > 0.3 ? $t('status.yes') : $t('status.no');
          row[`day${day}_kittingQty`] = isSchedule
            ? Math.floor(Math.random() * 100) + 50
            : 0;
          row[`day${day}_openQty`] = isSchedule
            ? Math.floor(Math.random() * 80) + 20
            : 0;
          row[`day${day}_notOpenQty`] = isSchedule
            ? Math.floor(Math.random() * 30)
            : 0;
        }

        mockData.push(row);
      }

      resolve({
        total: 10,
        items: mockData,
      });
    }, 300);
  });
}

/**
 * 查询
 */
function handleSearch() {
  if (!formData.value.openDate) {
    return;
  }
  tableShow.value = true;
  columns.value = generateColumns();
  gridApi.grid.loadColumn(columns.value);
  gridApi.reload();

  // 同时刷新物料明细和产能明细
  materialDetailRef.value?.reload();
  capacityDetailRef.value?.reload();
}

/**
 * 齐套计算
 */
function handleKittingCalc() {
  console.log('齐套计算');
  // TODO: 调用齐套计算接口
}

/**
 * 一键开批
 */
function handleBatchOpen() {
  console.log('一键开批');
  // TODO: 调用一键开批接口
}
</script>

<template>
  <div>
    <Card class="!mb-4">
      <Form layout="inline">
        <FormItem :label="$t('basic.threeDayKitting.planType')">
          <Select
            v-model:value="formData.planType"
            :placeholder="$t('basic.threeDayKitting.pleaseSelectPlanType')"
            allow-clear
            style="width: 120px"
          >
            <SelectOption
              v-for="item in planTypeOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem :label="$t('basic.threeDayKitting.openDate')">
          <DatePicker
            v-model:value="formData.openDate"
            :placeholder="$t('basic.threeDayKitting.pleaseSelectOpenDate')"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 150px"
          />
        </FormItem>
        <FormItem :label="$t('basic.threeDayKitting.workOrderNo')">
          <Input
            v-model:value="formData.workOrderNo"
            :placeholder="$t('basic.threeDayKitting.pleaseInputWorkOrderNo')"
            allow-clear
            style="width: 150px"
          />
        </FormItem>
        <FormItem :label="$t('basic.threeDayKitting.productName')">
          <Input
            v-model:value="formData.productName"
            :placeholder="$t('basic.threeDayKitting.pleaseInputProductName')"
            allow-clear
            style="width: 150px"
          />
        </FormItem>
        <FormItem>
          <Space>
            <Button
              type="primary"
              :disabled="!formData.openDate"
              @click="handleSearch"
            >
              {{ $t('basic.threeDayKitting.query') }}
            </Button>
            <Button
              type="primary"
              :disabled="!formData.openDate"
              @click="handleKittingCalc"
            >
              {{ $t('basic.threeDayKitting.kittingCalc') }}
            </Button>
            <Button
              type="primary"
              :disabled="!formData.openDate"
              @click="handleBatchOpen"
            >
              {{ $t('basic.threeDayKitting.batchOpen') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>

    <Card v-show="tableShow">
      <Grid />
    </Card>

    <!-- 物料明细和产能明细 -->
    <Row v-show="tableShow" :gutter="16" class="!mt-4">
      <Col :span="12">
        <MaterialDetail ref="materialDetailRef" />
      </Col>
      <Col :span="12">
        <CapacityDetail
          ref="capacityDetailRef"
          :open-date="formData.openDate"
        />
      </Col>
    </Row>
  </div>
</template>

<style scoped></style>
