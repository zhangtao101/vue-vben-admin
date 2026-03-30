<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  RangePicker,
  Select,
  Space,
  TabPane,
  Tabs,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
// region 缺口计算

// 缺口计算参数
const gapCalculationParams = ref<any>({});

/**
 * 车间信息下拉选项
 */
const workshopOptions = ref<any>([
  { label: 'SMT车间', value: 'SMT' },
  { label: '组装车间', value: 'ASSEMBLY' },
  { label: '包装车间', value: 'PACKAGING' },
  { label: '测试车间', value: 'TEST' },
]);

/**
 * 缺口计算函数
 */
function handleGapCalculation() {
  console.log('缺口计算参数:', gapCalculationParams.value);
  // TODO: 调用缺口计算接口
}

// endregion

// region 查询数据

/**
 * 查询参数
 */
const queryParams = ref<any>({});

/**
 * 查询函数
 */
function handleQuery() {
  console.log('查询参数:', queryParams.value);
  // TODO: 调用查询接口
  return new Promise((resolve) => {
    // 模拟假数据
    resolve({
      total: 10,
      items: [
        {
          index: 1,
          internalTransferNo: 'NZ20260301001',
          productCode: 'PCB-A001',
          productName: 'PCB主板A型',
          gapQuantity: 500,
          defaultResource: 'SMT-01',
          requireTime: '2026-03-31 10:00:00',
        },
        {
          index: 2,
          internalTransferNo: 'NZ20260301002',
          productCode: 'PCB-A002',
          productName: 'PCB主板B型',
          gapQuantity: 300,
          defaultResource: 'SMT-02',
          requireTime: '2026-03-31 14:00:00',
        },
        {
          index: 3,
          internalTransferNo: 'NZ20260301003',
          productCode: 'PCB-B001',
          productName: 'PCB控制板A型',
          gapQuantity: 800,
          defaultResource: 'ASSEMBLY-01',
          requireTime: '2026-04-01 09:00:00',
        },
        {
          index: 4,
          internalTransferNo: 'NZ20260301004',
          productCode: 'PCB-B002',
          productName: 'PCB控制板B型',
          gapQuantity: 450,
          defaultResource: 'ASSEMBLY-02',
          requireTime: '2026-04-01 13:00:00',
        },
        {
          index: 5,
          internalTransferNo: 'NZ20260301005',
          productCode: 'PCB-C001',
          productName: 'PCB电源板A型',
          gapQuantity: 600,
          defaultResource: 'PACKAGING-01',
          requireTime: '2026-04-02 10:00:00',
        },
        {
          index: 6,
          internalTransferNo: 'NZ20260301006',
          productCode: 'PCB-C002',
          productName: 'PCB电源板B型',
          gapQuantity: 350,
          defaultResource: 'PACKAGING-02',
          requireTime: '2026-04-02 15:00:00',
        },
        {
          index: 7,
          internalTransferNo: 'NZ20260301007',
          productCode: 'PCB-D001',
          productName: 'PCB显示板A型',
          gapQuantity: 200,
          defaultResource: 'TEST-01',
          requireTime: '2026-04-03 11:00:00',
        },
        {
          index: 8,
          internalTransferNo: 'NZ20260301008',
          productCode: 'PCB-D002',
          productName: 'PCB显示板B型',
          gapQuantity: 550,
          defaultResource: 'TEST-02',
          requireTime: '2026-04-03 16:00:00',
        },
        {
          index: 9,
          internalTransferNo: 'NZ20260301009',
          productCode: 'PCB-E001',
          productName: 'PCB接口板A型',
          gapQuantity: 700,
          defaultResource: 'SMT-03',
          requireTime: '2026-04-04 09:00:00',
        },
        {
          index: 10,
          internalTransferNo: 'NZ20260301010',
          productCode: 'PCB-E002',
          productName: 'PCB接口板B型',
          gapQuantity: 400,
          defaultResource: 'ASSEMBLY-03',
          requireTime: '2026-04-04 14:00:00',
        },
      ],
    });
  });
}

/**
 * 一键签核函数
 */
function handleOneKeySign() {
  console.log('一键签核参数:', queryParams.value);
  // TODO: 调用一键签核接口
}

// endregion

// region 表格配置

/**
 * VXE表格配置
 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { field: 'index', title: $t('preOperation.sequence'), width: 80 },
    {
      field: 'internalTransferNo',
      title: $t('preOperation.internalTransferNo'),
      minWidth: 150,
    },
    {
      field: 'productCode',
      title: $t('preOperation.productCode'),
      minWidth: 150,
    },
    {
      field: 'productName',
      title: $t('preOperation.productName'),
      minWidth: 150,
    },
    {
      field: 'gapQuantity',
      title: $t('preOperation.gapQuantity'),
      minWidth: 120,
    },
    {
      field: 'defaultResource',
      title: $t('preOperation.defaultResource'),
      minWidth: 150,
    },
    {
      field: 'requireTime',
      title: $t('preOperation.requireTime'),
      minWidth: 150,
    },
    {
      field: 'action',
      title: $t('common.operation'),
      width: 200,
      fixed: 'right',
      slots: { default: 'action' },
    },
  ],
  height: 300,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  pagerConfig: {
    enabled: true,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await handleQuery();
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

const [Grid] = useVbenVxeGrid({ gridOptions });
/**
 * 移入操作
 */
function handleMoveIn(row: any) {
  console.log('移入:', row);
  // TODO: 调用移入接口
  // 添加到移入明细
  const newItem = {
    index: moveInDetailData.value.length + 1,
    internalTransferNo: row.internalTransferNo,
    gapQuantity: row.gapQuantity,
    requireTime: row.requireTime,
    productCode: row.productCode,
    productName: row.productName || row.productCode,
  };
  moveInDetailData.value.push(newItem);

  // 更新移入汇总
  updateMoveInSummary(row);

  // 刷新移入明细和汇总表格
  moveInDetailGridApi.reload();
  moveInSummaryGridApi.reload();
}

/**
 * 还原操作
 */
function handleRestore(row: any) {
  console.log('还原:', row);
  // TODO: 调用还原接口
}

/**
 * 签核操作
 */
function handleSign(row: any) {
  console.log('签核:', row);
  // TODO: 调用签核接口
}

// endregion

// region 移入明细表格

/**
 * 当前激活的标签页
 */
const activeTabKey = ref('detail');

/**
 * 移入明细表格配置
 */
const moveInDetailOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { field: 'index', title: $t('preOperation.sequence'), width: 80 },
    {
      field: 'internalTransferNo',
      title: $t('preOperation.internalTransferNo'),
      minWidth: 150,
    },
    {
      field: 'gapQuantity',
      title: $t('preOperation.gapQuantity'),
      minWidth: 120,
    },
    {
      field: 'requireTime',
      title: $t('preOperation.requireTime'),
      minWidth: 150,
    },
    {
      field: 'productCode',
      title: $t('preOperation.productCode'),
      minWidth: 150,
    },
    {
      field: 'productName',
      title: $t('preOperation.productName'),
      minWidth: 150,
    },
    {
      field: 'action',
      title: $t('common.operation'),
      width: 120,
      fixed: 'right',
      slots: { default: 'moveInAction' },
    },
  ],
  height: 300,
  stripe: true,
  pagerConfig: {
    enabled: true,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryMoveInDetail();
      },
    },
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [MoveInDetailGrid, moveInDetailGridApi] = useVbenVxeGrid({
  gridOptions: moveInDetailOptions,
});

/**
 * 移入明细数据
 */
const moveInDetailData = ref<any[]>([]);

/**
 * 查询移入明细数据
 */
function queryMoveInDetail() {
  return new Promise((resolve) => {
    resolve({
      total: moveInDetailData.value.length,
      items: moveInDetailData.value,
    });
  });
}

/**
 * 移出操作
 */
function handleMoveOut(row: any) {
  console.log('移出:', row);
  // TODO: 调用移出接口
  // 从数据中移除
  const index = moveInDetailData.value.findIndex(
    (item) => item.index === row.index,
  );
  if (index !== -1) {
    moveInDetailData.value.splice(index, 1);
  }

  // 移出后需要从汇总中减去对应的缺口数量
  if (moveInSummaryData.value.length > 0) {
    moveInSummaryData.value[0].gapQuantity -= row.gapQuantity;
  }

  // 刷新移入明细和汇总表格
  moveInDetailGridApi.reload();
  moveInSummaryGridApi.reload();
}

// endregion

// region 移入汇总表格

/**
 * 移入汇总表格配置
 */
const moveInSummaryOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { field: 'index', title: $t('preOperation.sequence'), width: 80 },
    {
      field: 'internalTransferNo',
      title: $t('preOperation.internalTransferNo'),
      minWidth: 150,
    },
    {
      field: 'gapQuantity',
      title: $t('preOperation.gapQuantity'),
      minWidth: 120,
    },
    {
      field: 'requireTime',
      title: $t('preOperation.requireTime'),
      minWidth: 150,
    },
    {
      field: 'productCode',
      title: $t('preOperation.productCode'),
      minWidth: 150,
    },
    {
      field: 'productName',
      title: $t('preOperation.productName'),
      minWidth: 150,
    },
    {
      field: 'action',
      title: $t('common.operation'),
      width: 120,
      fixed: 'right',
      slots: { default: 'summaryAction' },
    },
  ],
  height: 300,
  stripe: true,
  pagerConfig: {
    enabled: true,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryMoveInSummary();
      },
    },
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [MoveInSummaryGrid, moveInSummaryGridApi] = useVbenVxeGrid({
  gridOptions: moveInSummaryOptions,
});

/**
 * 移入汇总数据
 */
const moveInSummaryData = ref<any[]>([]);

/**
 * 查询移入汇总数据
 */
function queryMoveInSummary() {
  return new Promise((resolve) => {
    resolve({
      total: moveInSummaryData.value.length,
      items: moveInSummaryData.value,
    });
  });
}

/**
 * 更新移入汇总
 */
function updateMoveInSummary(row: any) {
  // 汇总表格中只会有一条数据，除了缺口数量是合并的，其余字段都是取得第一条数据
  if (moveInSummaryData.value.length === 0) {
    // 第一条数据，直接添加
    moveInSummaryData.value.push({
      index: 1,
      internalTransferNo: row.internalTransferNo,
      gapQuantity: row.gapQuantity,
      requireTime: row.requireTime,
      productCode: row.productCode,
      productName: row.productName || row.productCode,
    });
  } else {
    // 后续数据，只合并缺口数量
    moveInSummaryData.value[0].gapQuantity += row.gapQuantity;
  }
}

// endregion
</script>

<template>
  <Card class="!mb-4">
    <Form :model="gapCalculationParams" layout="inline">
      <!-- 车间信息 -->
      <FormItem :label="$t('preOperation.workshopInfo')">
        <Select
          v-model:value="gapCalculationParams.workshopInfo"
          :placeholder="$t('preOperation.selectWorkshop')"
          :options="workshopOptions"
          style="width: 200px"
        />
      </FormItem>

      <!-- 缺口计算时间 -->
      <FormItem :label="$t('preOperation.gapCalculationTime')">
        <RangePicker
          v-model:value="gapCalculationParams.calculationTime"
          format="YYYY-MM-DD"
          style="width: 300px"
        />
      </FormItem>

      <!-- 缺口计算按钮 -->
      <FormItem>
        <Button type="primary" @click="handleGapCalculation">
          {{ $t('preOperation.gapCalculation') }}
        </Button>
      </FormItem>
    </Form>
  </Card>
  <Card class="!mb-4">
    <Form :model="queryParams" layout="inline">
      <!-- 工单编号 -->
      <FormItem :label="$t('preOperation.workOrderCode')">
        <Input
          v-model:value="queryParams.workOrderCode"
          :placeholder="$t('preOperation.inputWorkOrderCode')"
          style="width: 200px"
        />
      </FormItem>

      <!-- 内转单号 -->
      <FormItem :label="$t('preOperation.internalTransferNo')">
        <Input
          v-model:value="queryParams.internalTransferNo"
          :placeholder="$t('preOperation.inputInternalTransferNo')"
          style="width: 200px"
        />
      </FormItem>

      <!-- 产品名称 -->
      <FormItem :label="$t('preOperation.productName')">
        <Input
          v-model:value="queryParams.productName"
          :placeholder="$t('preOperation.inputProductName')"
          style="width: 200px"
        />
      </FormItem>

      <!-- 查询按钮 -->
      <FormItem>
        <Button type="primary" @click="handleQuery">
          {{ $t('common.search') }}
        </Button>
      </FormItem>

      <!-- 一键签核按钮 -->
      <FormItem>
        <Button @click="handleOneKeySign">
          {{ $t('preOperation.oneKeySign') }}
        </Button>
      </FormItem>
    </Form>
  </Card>
  <Card>
    <Grid>
      <template #toolbar-actions>
        <!-- 可以在这里添加工具栏按钮 -->
      </template>
      <template #action="{ row }">
        <Space>
          <Tooltip :title="$t('preOperation.moveIn')">
            <Button type="link" size="small" @click="handleMoveIn(row)">
              <template #icon>
                <Icon
                  icon="mdi:login-variant"
                  class="inline-block align-middle text-2xl"
                />
              </template>
            </Button>
          </Tooltip>
          <Tooltip :title="$t('preOperation.restore')">
            <Button type="link" size="small" @click="handleRestore(row)">
              <template #icon>
                <Icon
                  icon="mdi:restore"
                  class="inline-block align-middle text-2xl"
                />
              </template>
            </Button>
          </Tooltip>
          <Tooltip :title="$t('preOperation.sign')">
            <Button type="link" size="small" @click="handleSign(row)">
              <template #icon>
                <Icon
                  icon="mdi:check-circle-outline"
                  class="inline-block align-middle text-2xl"
                />
              </template>
            </Button>
          </Tooltip>
        </Space>
      </template>
    </Grid>
  </Card>
  <!-- 移入明细和汇总表格 -->
  <Card class="!mt-4">
    <Tabs v-model:active-key="activeTabKey">
      <TabPane key="detail" :tab="$t('preOperation.moveInDetail')">
        <MoveInDetailGrid>
          <template #toolbar-actions>
            <!-- 可以在这里添加工具栏按钮 -->
          </template>
          <template #moveInAction="{ row }">
            <Space>
              <Tooltip :title="$t('preOperation.moveOut')">
                <Button type="link" size="small" @click="handleMoveOut(row)">
                  <template #icon>
                    <Icon
                      icon="mdi:logout-variant"
                      class="inline-block align-middle text-2xl"
                    />
                  </template>
                </Button>
              </Tooltip>
            </Space>
          </template>
        </MoveInDetailGrid>
      </TabPane>
      <TabPane key="summary" :tab="$t('preOperation.moveInSummary')">
        <MoveInSummaryGrid>
          <template #toolbar-actions>
            <!-- 可以在这里添加工具栏按钮 -->
          </template>
          <template #summaryAction>
            <Space>
              <Tooltip :title="$t('preOperation.confirm')">
                <Button type="link" size="small">
                  <template #icon>
                    <Icon
                      icon="mdi:check"
                      class="inline-block align-middle text-2xl"
                    />
                  </template>
                </Button>
              </Tooltip>
            </Space>
          </template>
        </MoveInSummaryGrid>
      </TabPane>
    </Tabs>
  </Card>
</template>

<style scoped>
/* 作用域样式，仅对当前组件生效 */
</style>
