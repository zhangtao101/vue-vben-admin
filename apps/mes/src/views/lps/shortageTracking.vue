<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  DatePicker,
  Form,
  FormItem,
  Select,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

// 上方查询条件
const queryForm = ref<any>({
  materialGroup: undefined,
  dateRange: undefined,
});

// 表格显示控制
const bottomTableShow = ref(false);

const materialGroups = ref([
  { label: '包装', value: '包装' },
  { label: '组装', value: '组装' },
  { label: '测试', value: '测试' },
]);

const handleSearch = () => {
  console.log('搜索:', queryForm.value);
  middleGridRef?.reload();
  bottomTableShow.value = true;

  // 先更新列配置
  generateBottomColumns();
  setTimeout(() => {
    bottomGridRef?.reload();
  }, 100);
};

const handleReset = () => {
  queryForm.value = {
    materialGroup: undefined,
    dateRange: undefined,
  };
  bottomTableShow.value = false;
};

/**
 * 中间表格数据加载
 */
function handleMiddleTableQuery(_params: any) {
  return new Promise((resolve) => {
    // TODO: 调用实际接口
    // const params = {
    //   page,
    //   pageSize,
    //   ...queryForm.value,
    // };
    // return shortageTrackingApi.getShortageList(params)
    //   .then(({ total, list }) => {
    //     resolve({ total, items: list });
    //   });

    // 模拟数据
    setTimeout(() => {
      const mockData: any[] = [];
      for (let i = 1; i <= 10; i++) {
        mockData.push({
          productNo: `MTL-${String(i).padStart(4, '0')}`,
          totalDemand: 1000 + i * 100,
          stock: 500 + i * 50,
          pendingIn: 200 + i * 20,
          totalShortage: 300 + i * 30,
          totalReply: 150 + i * 15,
        });
      }

      resolve({
        total: 10,
        items: mockData,
      });
    }, 300);
  });
}

// 中间表格配置
const gridOptions = ref<any>({
  align: 'center',
  border: true,
  columns: [
    {
      field: 'seq',
      title: $t('basic.shortageTracking.sequence'),
      type: 'seq',
      width: 60,
    },
    {
      field: 'productNo',
      title: $t('basic.shortageTracking.productNo'),
      minWidth: 120,
    },
    {
      field: 'totalDemand',
      title: $t('basic.shortageTracking.totalDemand'),
      minWidth: 100,
    },
    {
      field: 'stock',
      title: $t('basic.shortageTracking.stock'),
      minWidth: 100,
    },
    {
      field: 'pendingIn',
      title: $t('basic.shortageTracking.pendingIn'),
      minWidth: 100,
    },
    {
      field: 'totalShortage',
      title: $t('basic.shortageTracking.totalShortage'),
      minWidth: 100,
    },
    {
      field: 'totalReply',
      title: $t('basic.shortageTracking.totalReply'),
      minWidth: 100,
    },
  ],
  height: 300,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
    pageSizes: [10, 20, 50],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        return await handleMiddleTableQuery({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
});

const [MiddleTable, middleGridRef] = useVbenVxeGrid({
  gridOptions: gridOptions.value,
});

const handleMaterialUpdate = () => {
  console.log('物料更新');
  middleGridRef?.reload();
};

/**
 * 下方表格数据加载
 */
function handleBottomTableQuery(_params: any) {
  // 生成表格数据
  const tableData = generateBottomData();

  return new Promise((resolve) => {
    // TODO: 调用实际接口
    // const params = {
    //   page,
    //   pageSize,
    //   ...queryForm.value,
    // };
    // return shortageTrackingApi.getShortageTimeDimension(params)
    //   .then(({ list }) => {
    //     resolve({ total: list.length, items: list });
    //   });

    resolve({
      total: tableData.length,
      items: tableData,
    });
  });
}

// 下方表格配置
const bottomGridOptions: any = {
  align: 'center',
  border: true,
  columns: [],
  height: 300,
  pagerConfig: {
    enabled: false,
    pageSize: 6,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        return await handleBottomTableQuery({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  showOverflow: 'tooltip',
  mergeCells: [
    { row: 0, col: 0, rowspan: 1, colspan: 2 },
    { row: 1, col: 0, rowspan: 1, colspan: 2 },
    { row: 2, col: 0, rowspan: 99, colspan: 1 },
  ],
  // spanMethod: ({ rowIndex, columnIndex }: any) => {
  //   // 第一列前两行合并（需求、欠料）
  //   if (columnIndex === 0 && (rowIndex === 0 || rowIndex === 1)) {
  //     return { rowspan: 1, colspan: 2 };
  //   }
  //   // 其他列的第一列和第二列合并
  //   if (columnIndex === 1 && rowIndex < 2) {
  //     return { rowspan: 0, colspan: 0 };
  //   }
  // },
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [BottomTable, bottomGridRef] = useVbenVxeGrid({
  gridOptions: bottomGridOptions,
});

function generateBottomColumns() {
  const dateRange = queryForm.value.dateRange;
  if (!dateRange || dateRange.length !== 2) {
    bottomGridOptions.columns = [
      { field: 'blank1', title: '', width: 100 },
      { field: 'blank2', title: '', width: 100 },
      { field: 'past', title: $t('basic.shortageTracking.past'), width: 120 },
    ];
    return;
  }

  const startDate = new Date(dateRange[0]);
  const endDate = new Date(dateRange[1]);
  const diffDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const columns = [
    { field: 'blank1', title: '', minWidth: 100 },
    { field: 'blank2', title: '', minWidth: 100 },
    { field: 'past', title: $t('basic.shortageTracking.past'), minWidth: 120 },
  ];

  for (let i = 0; i <= diffDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    columns.push({
      field: `day${i}`,
      title: currentDate.toISOString().split('T')[0] || '',
      minWidth: 120,
    });
  }

  bottomGridOptions.columns = columns;
  setTimeout(() => {
    bottomGridRef.grid.reloadColumn(columns);
  }, 0);
}

function generateBottomData() {
  const dateRange = queryForm.value.dateRange;
  if (!dateRange || dateRange.length !== 2) {
    return [
      { blank1: $t('basic.shortageTracking.demand'), blank2: '', past: '-' },
      { blank1: $t('basic.shortageTracking.shortage'), blank2: '', past: '-' },
      { blank1: $t('basic.shortageTracking.reply'), blank2: '', past: '-' },
      { blank1: $t('basic.shortageTracking.purchase'), blank2: '', past: '-' },
      { blank1: $t('basic.shortageTracking.supplier1'), blank2: '', past: '-' },
      { blank1: $t('basic.shortageTracking.supplier2'), blank2: '', past: '-' },
    ];
  }

  const startDate = new Date(dateRange[0]);
  const endDate = new Date(dateRange[1]);
  const diffDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const baseRow = {
    blank1: '',
    blank2: '',
    past: '-',
  };

  // 添加日期列
  for (let i = 0; i <= diffDays; i++) {
    (baseRow as any)[`day${i}`] = '-';
  }

  return [
    {
      ...baseRow,
      blank1: $t('basic.shortageTracking.demand'),
      blank2: '',
    },
    {
      ...baseRow,
      blank1: $t('basic.shortageTracking.shortage'),
      blank2: '',
    },
    {
      ...baseRow,
      blank1: $t('basic.shortageTracking.reply'),
      blank2: $t('basic.shortageTracking.purchase'),
    },
    {
      ...baseRow,
      blank1: $t('basic.shortageTracking.reply'),
      blank2: '供应商A',
    },
    {
      ...baseRow,
      blank1: $t('basic.shortageTracking.reply'),
      blank2: '供应商B',
    },
  ];
}
</script>

<template>
  <Page>
    <!-- 上方查询 Card -->
    <Card
      :title="$t('basic.shortageTracking.queryTitle')"
      style="margin-bottom: 16px"
    >
      <Form layout="inline">
        <FormItem :label="$t('basic.shortageTracking.materialGroup')">
          <Select
            v-model:value="queryForm.materialGroup"
            :placeholder="$t('basic.shortageTracking.selectMaterialGroup')"
            allow-clear
            style="width: 200px"
          >
            <Select.Option
              v-for="item in materialGroups"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </Select.Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('basic.shortageTracking.dateRange')">
          <DatePicker.RangePicker
            v-model:value="queryForm.dateRange"
            style="width: 300px"
          />
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSearch">
            {{ $t('basic.shortageTracking.search') }}
          </Button>
          <Button style="margin-left: 8px" @click="handleReset">
            {{ $t('basic.shortageTracking.reset') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 中间数据表格 Card -->
    <Card
      :title="$t('basic.shortageTracking.dataTableTitle')"
      style="margin-bottom: 16px"
    >
      <template #extra>
        <Button type="primary" @click="handleMaterialUpdate">
          {{ $t('basic.shortageTracking.materialUpdate') }}
        </Button>
      </template>
      <MiddleTable />
    </Card>

    <!-- 下方时间维度表格 Card -->
    <Card
      :title="$t('basic.shortageTracking.timeTableTitle')"
      v-if="bottomTableShow"
    >
      <BottomTable />
    </Card>
  </Page>
</template>

<style scoped></style>
