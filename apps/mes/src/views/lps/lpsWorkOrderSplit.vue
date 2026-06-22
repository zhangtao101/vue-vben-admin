<!--
 * [AUTHOR]: CodeBuddy
 * [FUNC]: 工单拆分 - 测试用页面，支持主工单查询、子工单查看与拆分操作。
 * [INPUT]: 无外部 API 依赖，使用本地 mock 数据。
 * [DATA]: 2026-06-22 14:42:00
 * [MODIFY]: 初始版本
 * [TIME]: 2026-06-22 14:42:00
-->
<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, nextTick, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

// region 模拟数据
const idCounter = ref<number>(200);

function genChildId() {
  idCounter.value += 1;
  return idCounter.value;
}

/** 子工单 mock 数据 */
function createMockChildren(wo: string, ppo: string, so: string) {
  idCounter.value += 2;
  return [
    {
      id: idCounter.value - 1,
      wo: `${wo}-1`,
      ppo,
      so: `${so}-1`,
      quantity: 30,
      deliveryDate: '2026-07-10',
    },
    {
      id: idCounter.value,
      wo: `${wo}-2`,
      ppo,
      so: `${so}-2`,
      quantity: 70,
      deliveryDate: '2026-07-20',
    },
  ];
}

/** 主列表 mock 数据 */
const masterData = ref<any[]>([
  {
    id: 1,
    wo: 'WO202607001',
    ppo: 'PPO2406001',
    so: 'SO2406001',
    quantity: 100,
    deliveryDate: '2026-07-20',
  },
  {
    id: 2,
    wo: 'WO202607002',
    ppo: 'PPO2406002',
    so: 'SO2406002',
    quantity: 200,
    deliveryDate: '2026-07-25',
  },
  {
    id: 3,
    wo: 'WO202607003',
    ppo: 'PPO2406003',
    so: 'SO2406003',
    quantity: 150,
    deliveryDate: '2026-07-30',
  },
  {
    id: 4,
    wo: 'WO202607004',
    ppo: 'PPO2406004',
    so: 'SO2406004',
    quantity: 80,
    deliveryDate: '2026-08-05',
  },
  {
    id: 5,
    wo: 'WO202607005',
    ppo: 'PPO2406005',
    so: 'SO2406005',
    quantity: 300,
    deliveryDate: '2026-08-10',
  },
]);

// 初始化所有行的子工单数据
masterData.value.forEach((row) => {
  row.children = createMockChildren(row.wo, row.ppo, row.so);
});
// endregion

// region 假SO下拉选项
const fakeSoOptions = ref<{ label: string; value: string }[]>(
  Array.from({ length: 20 }, (_, i) => {
    const n = i + 1;
    return {
      label: `SO2406${String(n).padStart(3, '0')}`,
      value: `SO2406${String(n).padStart(3, '0')}`,
    };
  }),
);
// endregion

// region 查询参数
const queryParams = ref<any>({
  wo: '',
  ppo: '',
  so: '',
});
// endregion

// region 表格查询
function handleQuery() {
  return new Promise((resolve) => {
    let filtered = [...masterData.value];

    if (queryParams.value.wo) {
      filtered = filtered.filter((item) =>
        item.wo.toLowerCase().includes(queryParams.value.wo.toLowerCase()),
      );
    }
    if (queryParams.value.ppo) {
      filtered = filtered.filter((item) =>
        item.ppo.toLowerCase().includes(queryParams.value.ppo.toLowerCase()),
      );
    }
    if (queryParams.value.so) {
      filtered = filtered.filter((item) =>
        item.so.toLowerCase().includes(queryParams.value.so.toLowerCase()),
      );
    }

    resolve({
      total: filtered.length,
      items: filtered.map((row) => ({
        ...row,
        subWorkOrderQty: row.children ? row.children.length : 0,
      })),
    });
  });
}
// endregion

// region 主表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 60, title: $t('basic.laborHourEvaluation.sequence') },
    {
      field: 'wo',
      title: $t('basic.workOrderSplit.wo'),
      minWidth: 140,
    },
    {
      field: 'ppo',
      title: $t('basic.workOrderSplit.ppo'),
      minWidth: 140,
    },
    {
      field: 'so',
      title: $t('basic.workOrderSplit.so'),
      minWidth: 140,
    },
    {
      field: 'quantity',
      title: $t('basic.workOrderSplit.quantity'),
      width: 100,
    },
    {
      field: 'subWorkOrderQty',
      title: $t('basic.workOrderSplit.subWorkOrderQty'),
      width: 120,
      slots: { default: 'subWorkOrderQty' },
    },
    {
      field: 'deliveryDate',
      title: $t('basic.workOrderSplit.deliveryDate'),
      width: 120,
      formatter: ({ cellValue }: any) =>
        cellValue ? dayjs(cellValue).format('YYYY-MM-DD') : '',
    },
    {
      field: 'action',
      title: $t('basic.workOrderSplit.operation'),
      width: 100,
      fixed: 'right',
      slots: { default: 'action' },
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await handleQuery();
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
// endregion

// region 子工单抽屉
const subDrawerVisible = ref(false);
const currentMainRow = ref<any>(null);

/** 子工单列表（用于抽屉内表格） */
const subWorkOrderList = ref<any[]>([]);

/**
 * 点击子工单数量，打开子工单抽屉。
 * @param {any} row - 行数据。
 * @since 2026-06-22 14:42:00
 */
function handleSubWorkOrderClick(row: any) {
  currentMainRow.value = row;
  // 深拷贝 children 避免直接修改源数据
  subWorkOrderList.value = (row.children || []).map((child: any) => ({
    ...child,
  }));
  subDrawerVisible.value = true;
  // 等待抽屉渲染完成后刷新子表格数据
  nextTick(() => {
    subGridApi.reload();
  });
}
// endregion

// region 工单拆分抽屉
const splitDrawerVisible = ref(false);
const currentSplitMainRow = ref<any>(null);
const splitCount = ref<number | undefined>(undefined);
const splitRowList = ref<any[]>([]);

/** 最大可拆分数量 = 当前行的子工单数量 */
const maxSplitCount = computed(() => {
  if (!currentSplitMainRow.value) return 0;
  return currentSplitMainRow.value.subWorkOrderQty || 0;
});

/**
 * 主表格点击拆分，打开拆分抽屉。
 * @param {any} row - 主工单行数据。
 * @since 2026-06-22 15:43:00
 */
function handleMainSplit(row: any) {
  currentSplitMainRow.value = row;
  splitCount.value = undefined;
  splitRowList.value = [];
  splitDrawerVisible.value = true;
}

/**
 * 根据拆分数量生成空行数据。
 * @since 2026-06-22 15:43:00
 */
function handleGenerateSplitRows() {
  const count = splitCount.value;
  if (!count || count <= 0) {
    Modal.warning({ title: '提示', content: '请输入有效的拆分数量' });
    return;
  }
  if (count > maxSplitCount.value) {
    Modal.warning({ title: '提示', content: `拆分数量不能超过 ${maxSplitCount.value}` });
    return;
  }

  const mainRow = currentSplitMainRow.value;
  if (!mainRow) return;

  const rows: any[] = [];
  for (let i = 0; i < count; i++) {
    rows.push({
      id: genChildId(),
      wo: `${mainRow.wo}-S${i + 1}`,
      ppo: mainRow.ppo,
      so: '',
      quantity: undefined,
      deliveryDate: undefined,
    });
  }
  splitRowList.value = rows;
  nextTick(() => {
    splitGridApi.reload();
  });
}
// endregion

// region 绑定SO抽屉
const bindDrawerVisible = ref(false);
/** 绑定目标：'sub' 为子工单列表，{ type:'split'; index:number } 为拆分行 */
const bindTarget = ref<{ index: number; type: 'split' }>({ index: -1, type: 'split' });
const bindSo = ref<string | undefined>(undefined);
const bindLoading = ref(false);
const bindResult = ref<null | { deliveryDate: string; quantity: number }>(null);

/** 可供选择的SO选项（排除已存在于子工单列表中的） */
const availableSoOptions = computed(() => {
  return fakeSoOptions.value.filter(
    (opt) => !subWorkOrderList.value.some((item: any) => item.so === opt.value),
  );
});

/**
 * 模拟根据SO号查询后台获取数量和交期。
 * @param {string} so - SO号。
 * @returns {Promise<{ quantity: number; deliveryDate: string }>} 查询结果。
 * @since 2026-06-22 15:25:00
 */
function mockQuerySo(so: string): Promise<{ deliveryDate: string; quantity: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const hash = [...so].reduce((acc, c) => acc + c.codePointAt(0)!, 0);
      resolve({
        quantity: 20 + (hash % 80),
        deliveryDate: `2026-0${7 + (hash % 5)}-${String(10 + (hash % 20)).padStart(2, '0')}`,
      });
    }, 300);
  });
}

/**
 * 打开绑定SO抽屉（从拆分表格行）。
 * @param {any} _row - 拆分行数据。
 * @param {number} index - 拆分行索引。
 * @since 2026-06-22 15:43:00
 */
function handleSplitRowBind(_row: any, index: number) {
  bindTarget.value = { type: 'split', index };
  bindSo.value = undefined;
  bindResult.value = null;
  bindDrawerVisible.value = true;
}

/**
 * 选择SO后自动查询数量和交期。
 * @since 2026-06-22 15:43:00
 */
function handleQuerySo(value: any) {
  const soVal = value ? String(value) : '';
  if (!soVal) {
    bindResult.value = null;
    return;
  }
  bindLoading.value = true;
  mockQuerySo(soVal)
    .then((data) => {
      bindResult.value = data;
    })
    .finally(() => {
      bindLoading.value = false;
    });
}

/**
 * 确认绑定SO。
 * @since 2026-06-22 15:25:00
 */
function handleConfirmBind() {
  if (!bindResult.value || !bindSo.value) {
    Modal.warning({ title: '提示', content: '请先选择SO' });
    return;
  }

  const idx = bindTarget.value.index;
  if (idx >= 0 && idx < splitRowList.value.length) {
    splitRowList.value[idx].so = bindSo.value;
    splitRowList.value[idx].quantity = bindResult.value.quantity;
    splitRowList.value[idx].deliveryDate = bindResult.value.deliveryDate;
  }

  bindDrawerVisible.value = false;
  nextTick(() => {
    splitGridApi.reload();
  });
}
// endregion

// region 拆分表格配置
const splitGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 60, title: $t('basic.laborHourEvaluation.sequence') },
    {
      field: 'wo',
      title: $t('basic.workOrderSplit.wo'),
      minWidth: 140,
    },
    {
      field: 'ppo',
      title: $t('basic.workOrderSplit.ppo'),
      minWidth: 140,
    },
    {
      field: 'so',
      title: $t('basic.workOrderSplit.so'),
      minWidth: 140,
    },
    {
      field: 'quantity',
      title: $t('basic.workOrderSplit.quantity'),
      width: 100,
    },
    {
      field: 'deliveryDate',
      title: $t('basic.workOrderSplit.deliveryDate'),
      width: 120,
      formatter: ({ cellValue }: any) =>
        cellValue ? dayjs(cellValue).format('YYYY-MM-DD') : '',
    },
    {
      field: 'action',
      title: $t('basic.workOrderSplit.operation'),
      width: 100,
      fixed: 'right',
      slots: { default: 'action' },
    },
  ],
  height: 250,
  stripe: true,
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    autoLoad: false,
    ajax: {
      query: async () => {
        return {
          total: splitRowList.value.length,
          items: splitRowList.value,
        };
      },
    },
  },
};

const [SplitGrid, splitGridApi] = useVbenVxeGrid({ gridOptions: splitGridOptions });
// endregion

// region 子工单抽屉表格配置
const subGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 60, title: $t('basic.laborHourEvaluation.sequence') },
    {
      field: 'wo',
      title: $t('basic.workOrderSplit.wo'),
      minWidth: 140,
    },
    {
      field: 'ppo',
      title: $t('basic.workOrderSplit.ppo'),
      minWidth: 140,
    },
    {
      field: 'so',
      title: $t('basic.workOrderSplit.so'),
      minWidth: 140,
    },
    {
      field: 'quantity',
      title: $t('basic.workOrderSplit.quantity'),
      width: 100,
    },
    {
      field: 'deliveryDate',
      title: $t('basic.workOrderSplit.deliveryDate'),
      width: 120,
      formatter: ({ cellValue }: any) =>
        cellValue ? dayjs(cellValue).format('YYYY-MM-DD') : '',
    },
  ],
  height: 300,
  stripe: true,
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    autoLoad: false,
    ajax: {
      query: async () => {
        return {
          total: subWorkOrderList.value.length,
          items: subWorkOrderList.value,
        };
      },
    },
  },
};

const [SubGrid, subGridApi] = useVbenVxeGrid({ gridOptions: subGridOptions });

// 子工单数据变化时刷新子表格
watch(
  subWorkOrderList,
  () => {
    subGridApi.reload();
  },
  { deep: true },
);
// endregion
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card>
      <Form :model="queryParams" layout="inline">
        <FormItem
          :label="$t('basic.workOrderSplit.wo')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.wo"
            :placeholder="$t('basic.workOrderSplit.pleaseInputWo')"
            allow-clear
            style="width: 180px"
          />
        </FormItem>
        <FormItem
          :label="$t('basic.workOrderSplit.ppo')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.ppo"
            :placeholder="$t('basic.workOrderSplit.pleaseInputPpo')"
            allow-clear
            style="width: 180px"
          />
        </FormItem>
        <FormItem
          :label="$t('basic.workOrderSplit.so')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.so"
            :placeholder="$t('basic.workOrderSplit.pleaseInputSo')"
            allow-clear
            style="width: 180px"
          />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="gridApi.reload()">
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card class="!mt-4">
      <Grid>
        <template #toolbar-tools></template>
        <!-- 子工单数量点击插槽 -->
        <template #subWorkOrderQty="{ row }">
          <a
            style="color: #1677ff; cursor: pointer"
            @click="handleSubWorkOrderClick(row)"
          >
            {{ row.subWorkOrderQty || 0 }}
          </a>
        </template>
        <!-- 操作列拆分按钮 -->
        <template #action="{ row }">
          <Tooltip :title="$t('basic.workOrderSplit.split')">
            <Button type="link" size="small" @click="handleMainSplit(row)">
              <Icon icon="mdi:call-split" class="inline-block align-middle text-2xl" />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>

    <!-- 子工单列表抽屉（上→下） -->
    <Drawer
      v-model:open="subDrawerVisible"
      :title="$t('basic.workOrderSplit.subWorkOrderList')"
      placement="top"
      height="450"
      :destroy-on-close="true"
    >
      <div style="padding: 0 24px">
        <SubGrid />
      </div>
    </Drawer>

    <!-- 工单拆分抽屉（上→下） -->
    <Drawer
      v-model:open="splitDrawerVisible"
      :title="$t('basic.workOrderSplit.splitWorkOrder')"
      placement="top"
      height="450"
      :destroy-on-close="true"
    >
      <div style="padding: 0 24px">
        <Space style="margin-bottom: 16px">
          <span>{{ $t('basic.workOrderSplit.splitCount') }}</span>
          <InputNumber
            v-model:value="splitCount"
            :min="1"
            :max="maxSplitCount"
            :placeholder="`最大: ${maxSplitCount}`"
            style="width: 200px"
          />
          <Button type="primary" @click="handleGenerateSplitRows">
            {{ $t('basic.workOrderSplit.generate') }}
          </Button>
        </Space>
        <SplitGrid v-if="splitRowList.length > 0">
          <template #action="{ row, rowIndex }">
            <Tooltip :title="$t('basic.workOrderSplit.bind')">
              <Button
                type="link"
                size="small"
                @click="handleSplitRowBind(row, rowIndex)"
              >
                <Icon icon="mdi:link-variant" class="inline-block align-middle text-2xl" />
              </Button>
            </Tooltip>
          </template>
        </SplitGrid>
      </div>
    </Drawer>

    <!-- 绑定SO抽屉 -->
    <Drawer
      v-model:open="bindDrawerVisible"
      :title="$t('basic.workOrderSplit.bindSo')"
      width="400"
      :destroy-on-close="true"
      :footer-style="{ textAlign: 'right' }"
    >
      <Form layout="vertical">
        <FormItem :label="$t('basic.workOrderSplit.so')">
          <Select
            v-model:value="bindSo"
            :placeholder="$t('basic.workOrderSplit.pleaseInputSo')"
            :options="availableSoOptions"
            :loading="bindLoading"
            allow-clear
            show-search
            style="width: 100%"
            @change="handleQuerySo"
          />
        </FormItem>
        <template v-if="bindResult">
          <FormItem :label="$t('basic.workOrderSplit.quantity')">
            <InputNumber
              :value="bindResult.quantity"
              disabled
              style="width: 100%"
            />
          </FormItem>
          <FormItem :label="$t('basic.workOrderSplit.deliveryDate')">
            <DatePicker
              :value="bindResult.deliveryDate"
              value-format="YYYY-MM-DD"
              disabled
              style="width: 100%"
            />
          </FormItem>
        </template>
      </Form>

      <template #footer>
        <Space>
          <Button @click="bindDrawerVisible = false">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="primary" :disabled="!bindResult" @click="handleConfirmBind">
            {{ $t('basic.workOrderSplit.confirmBind') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped>
/* 作用域样式 */
</style>
