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
      so,
      quantity: 30,
      deliveryDate: '2026-07-10',
    },
    {
      id: idCounter.value,
      wo: `${wo}-2`,
      ppo,
      so,
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
const splitForm = ref<any>({
  quantity: undefined,
  deliveryDate: undefined,
});

/** 当前可拆分的最大数量（主工单数量 - 子工单数量总和） */
const maxSplitQty = computed(() => {
  if (!currentMainRow.value) return 0;
  const childrenTotal = (currentMainRow.value.children || []).reduce(
    (sum: number, child: any) => sum + (child.quantity || 0),
    0,
  );
  return currentMainRow.value.quantity - childrenTotal;
});

/**
 * 主表格点击拆分，打开拆分抽屉。
 * @param {any} row - 主工单行数据。
 * @since 2026-06-22 14:42:00
 */
function handleMainSplit(row: any) {
  currentMainRow.value = row;
  splitForm.value = {
    quantity: undefined,
    deliveryDate: undefined,
  };
  splitDrawerVisible.value = true;
}

/**
 * 确认拆分：从主工单拆分出新的子工单。
 * @since 2026-06-22 14:42:00
 */
function handleConfirmSplit() {
  const { quantity, deliveryDate } = splitForm.value;

  if (!quantity || quantity <= 0) {
    Modal.warning({ title: '提示', content: '请输入有效的拆分数量' });
    return;
  }
  if (quantity > maxSplitQty.value) {
    Modal.warning({
      title: '提示',
      content: `拆分数量不能超过 ${maxSplitQty.value}`,
    });
    return;
  }
  if (!deliveryDate) {
    Modal.warning({ title: '提示', content: '请选择新交期' });
    return;
  }

  const mainRow = currentMainRow.value;
  if (!mainRow) return;

  // 减少主工单数量
  mainRow.quantity = mainRow.quantity - quantity;

  // 新增子工单
  const newChild = {
    id: genChildId(),
    wo: mainRow.wo,
    ppo: mainRow.ppo,
    so: mainRow.so,
    quantity,
    deliveryDate,
  };
  if (!mainRow.children) {
    mainRow.children = [];
  }
  mainRow.children.push(newChild);

  splitDrawerVisible.value = false;
  // 刷新主表格
  gridApi.reload();
}
// endregion

// region 子工单编辑/删除
const editDrawerVisible = ref(false);
const editForm = ref<any>({
  quantity: undefined,
  deliveryDate: undefined,
});
const currentChildRow = ref<any>(null);
const currentChildIndex = ref<number>(-1);

/**
 * 删除子工单。
 * @param {number} index - 子工单索引。
 * @since 2026-06-22 14:42:00
 */
function handleDeleteChild(index: number) {
  Modal.confirm({
    title: '提示',
    content: '确定删除该子工单？',
    onOk: () => {
      subWorkOrderList.value.splice(index, 1);
      // 同步更新 masterData
      if (currentMainRow.value) {
        currentMainRow.value.children = subWorkOrderList.value.map((item: any) => ({
          ...item,
        }));
      }
      nextTick(() => {
        subGridApi.reload();
        gridApi.reload();
      });
    },
  });
}

/**
 * 打开编辑子工单抽屉。
 * @param {any} row - 子工单行数据。
 * @param {number} index - 行索引。
 * @since 2026-06-22 14:42:00
 */
function handleEditChild(row: any, index: number) {
  currentChildRow.value = row;
  currentChildIndex.value = index;
  editForm.value = {
    quantity: row.quantity,
    deliveryDate: row.deliveryDate,
  };
  editDrawerVisible.value = true;
}

/**
 * 确认编辑子工单。
 * @since 2026-06-22 14:42:00
 */
function handleConfirmEdit() {
  const { quantity, deliveryDate } = editForm.value;

  if (!quantity || quantity <= 0) {
    Modal.warning({ title: '提示', content: '请输入有效的数量' });
    return;
  }
  if (!deliveryDate) {
    Modal.warning({ title: '提示', content: '请选择交期' });
    return;
  }

  const idx = currentChildIndex.value;
  if (idx < 0) return;

  subWorkOrderList.value[idx].quantity = quantity;
  subWorkOrderList.value[idx].deliveryDate = deliveryDate;

  // 同步更新 masterData
  if (currentMainRow.value) {
    currentMainRow.value.children = subWorkOrderList.value.map((item: any) => ({
      ...item,
    }));
  }

  editDrawerVisible.value = false;
  nextTick(() => {
    subGridApi.reload();
    gridApi.reload();
  });
}
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
    {
      field: 'action',
      title: $t('basic.workOrderSplit.operation'),
      width: 140,
      fixed: 'right',
      slots: { default: 'action' },
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
        <SubGrid>
          <template #action="{ row, rowIndex }">
            <Space>
              <Tooltip :title="$t('basic.workOrderSplit.edit')">
                <Button
                  type="link"
                  size="small"
                  @click="handleEditChild(row, rowIndex)"
                >
                  <Icon icon="mdi:edit-outline" class="inline-block align-middle text-2xl" />
                </Button>
              </Tooltip>
              <Tooltip :title="$t('basic.workOrderSplit.delete')">
                <Button
                  type="link"
                  size="small"
                  danger
                  @click="handleDeleteChild(rowIndex)"
                >
                  <Icon icon="mdi-light:delete" class="inline-block align-middle text-2xl" />
                </Button>
              </Tooltip>
            </Space>
          </template>
        </SubGrid>
      </div>
    </Drawer>

    <!-- 拆分修改抽屉 -->
    <Drawer
      v-model:open="splitDrawerVisible"
      :title="$t('basic.workOrderSplit.splitWorkOrder')"
      width="400"
      :destroy-on-close="true"
      :footer-style="{ textAlign: 'right' }"
    >
      <Form layout="vertical">
        <FormItem :label="$t('basic.workOrderSplit.quantity')">
          <InputNumber
            v-model:value="splitForm.quantity"
            :min="1"
            :max="maxSplitQty"
            :placeholder="`最大: ${maxSplitQty}`"
            style="width: 100%"
          />
        </FormItem>
        <FormItem :label="$t('basic.workOrderSplit.newDeliveryDate')">
          <DatePicker
            v-model:value="splitForm.deliveryDate"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <Button @click="splitDrawerVisible = false">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="primary" @click="handleConfirmSplit">
            {{ $t('basic.workOrderSplit.confirmSplit') }}
          </Button>
        </Space>
      </template>
    </Drawer>

    <!-- 编辑子工单抽屉 -->
    <Drawer
      v-model:open="editDrawerVisible"
      :title="$t('basic.workOrderSplit.editSubWorkOrder')"
      width="400"
      :destroy-on-close="true"
      :footer-style="{ textAlign: 'right' }"
    >
      <Form layout="vertical">
        <FormItem :label="$t('basic.workOrderSplit.quantity')">
          <InputNumber
            v-model:value="editForm.quantity"
            :min="1"
            style="width: 100%"
          />
        </FormItem>
        <FormItem :label="$t('basic.workOrderSplit.deliveryDate')">
          <DatePicker
            v-model:value="editForm.deliveryDate"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <Button @click="editDrawerVisible = false">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="primary" @click="handleConfirmEdit">
            {{ $t('common.save') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped>
/* 作用域样式 */
</style>
