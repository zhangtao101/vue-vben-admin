<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Select,
  Space,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { cancelCartInput, queryCartList } from '#/api';
import { $t } from '#/locales';
import CartLock from '#/util/component/steps/cartLock.vue';

/**
 * 工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
defineProps({
  functionId: { type: Number, default: 0 },
  workstationCode: { type: String, default: '' },
  /** 工序编号，由外部传入 */
  processCode: { type: String, default: '' },
});

// region 1. 查询条件（参数与后台 queryCartList 对齐）
const queryForm = reactive<any>({
  cartType: '',
  cartCode: '',
  lotId: '',
  loadFlag: undefined,
  // 默认只查未删除台车
  deleteFlag: '-1',
});

const loadFlagOptions = [
  { label: $t('cartLabelIssue.loaded'), value: '1' },
  { label: $t('cartLabelIssue.unloaded'), value: '-1' },
];

const deleteFlagOptions = [
  { label: $t('cartLabelIssue.notDeleted'), value: '-1' },
  { label: $t('cartLabelIssue.deleted'), value: '1' },
];
// endregion

// region 2. 表格（数据来自后台 queryCartList 接口，字段与返回 results 对齐）
/** 锁定标记编码 → 多语言文本 */
function getLockFlagText(lockFlag: null | string | undefined) {
  const lockFlagMap: Record<string, string> = {
    CLEANING: $t('cartLabelIssue.lockCleaning'),
    REPAIR: $t('cartLabelIssue.lockRepair'),
    'CLEAN END': $t('cartLabelIssue.lockCleanEnd'),
    'REPAIR END': $t('cartLabelIssue.lockRepairEnd'),
  };
  return lockFlag
    ? (lockFlagMap[lockFlag] ?? lockFlag)
    : $t('cartLabelIssue.lockNone');
}

/**
 * 加载台车列表：携带查询条件与分页参数调用 queryCartList
 * @param param0 page 分页信息（由表格 proxy 提供）
 * @returns { total, items } 供表格渲染
 */
function queryCartPage({ page }: any) {
  const params = {
    ...queryForm,
    pageNum: page.currentPage,
    pageSize: page.pageSize,
  };
  return queryCartList(params)
    .then((res: any) => {
      const { total = 0, results = [] } = res ?? {};
      return { total, items: results };
    })
    .catch(() => ({ total: 0, items: [] }));
}

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    {
      field: 'cartCode',
      title: $t('cartLabelIssue.colCartCode'),
      minWidth: 140,
    },
    {
      field: 'cartName',
      title: $t('cartLabelIssue.colCartName'),
      minWidth: 150,
    },
    {
      field: 'catTypeName',
      title: $t('cartLabelIssue.colCatTypeName'),
      minWidth: 130,
    },
    { field: 'lotId', title: $t('cartLabelIssue.colLotId'), minWidth: 200 },
    {
      field: 'maxLoadQuantity',
      title: $t('cartLabelIssue.colMaxLoadQty'),
      minWidth: 120,
    },
    {
      field: 'quantity',
      title: $t('cartLabelIssue.colQuantity'),
      minWidth: 100,
    },
    {
      field: 'loadFlag',
      title: $t('cartLabelIssue.colLoadFlag'),
      minWidth: 100,
      slots: { default: 'loadFlag' },
    },
    {
      field: 'lockFlag',
      title: $t('cartLabelIssue.colLockFlag'),
      minWidth: 130,
      slots: { default: 'lockFlag' },
    },
    {
      field: 'deleteFlag',
      title: $t('cartLabelIssue.colDeleteFlag'),
      minWidth: 110,
      slots: { default: 'deleteFlag' },
    },
    {
      field: 'action',
      title: $t('cartLabelIssue.colAction'),
      minWidth: 240,
      fixed: 'right',
      slots: { default: 'action' },
    },
  ],
  height: 420,
  pagerConfig: { enabled: true, pageSize: 20, pageSizes: [10, 20, 50, 100] },
  proxyConfig: {
    ajax: {
      query: queryCartPage,
    },
  },
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
// endregion

// region 3. 查询与功能按钮
/** 触发表格重新查询（携带当前查询条件） */
function handleQuery() {
  gridApi.reload();
}

function handleReset() {
  queryForm.cartType = '';
  queryForm.cartCode = '';
  queryForm.lotId = '';
  queryForm.loadFlag = undefined;
  queryForm.deleteFlag = '-1';
  handleQuery();
}

function handlePrint() {
  const selected: any[] = gridApi.grid.getCheckboxRecords();
  if (selected.length === 0) {
    message.warning($t('cartLabelIssue.plsSelectRow'));
    return;
  }
  // TODO: 调用打印接口（多选台车标签打印）
  message.success($t('cartLabelIssue.printSuccess'));
}

function handleEmptyCartIssue() {
  // TODO: 空台车发行接口
  message.success($t('cartLabelIssue.emptyIssueSuccess'));
}

function handleCartIssue() {
  // TODO: 台车发行接口
  message.success($t('cartLabelIssue.issueSuccess'));
}
// endregion

// region 4. 操作列：锁定 / 删除 / 解锁
/** 当前操作的台车行（锁定/解锁抽屉带入回显） */
const currentCartRow = ref<any>(null);

/** 抽屉显隐 */
const lockDrawerVisible = ref(false);
/** 抽屉操作模式：lock 锁定 / unlock 解锁 */
const drawerMode = ref<'lock' | 'unlock'>('lock');

function handleLock(row: any) {
  currentCartRow.value = row;
  drawerMode.value = 'lock';
  lockDrawerVisible.value = true;
}

function handleUnlock(row: any) {
  currentCartRow.value = row;
  drawerMode.value = 'unlock';
  lockDrawerVisible.value = true;
}

/** 锁定/解锁成功：关闭抽屉并重新加载台车列表 */
function handleActionSuccess() {
  lockDrawerVisible.value = false;
  handleQuery();
}

/** 删除台车：弹出二次确认框，确认后调用大车删除接口并刷新列表 */
function handleDelete(row: any) {
  if (!row?.cartCode) {
    return;
  }
  Modal.confirm({
    title: $t('cartLabelIssue.deleteConfirmTitle'),
    content: $t('cartLabelIssue.deleteConfirmContent'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    okType: 'danger',
    onOk: () =>
      cancelCartInput({ cartCode: row.cartCode }).then(() => {
        message.success($t('cartLabelIssue.deleteSuccess'));
        handleQuery();
      }),
  });
}
// endregion

onMounted(() => {
  setTimeout(() => {
    handleQuery();
  }, 200);
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- 1. 查询条件 -->
    <Form :model="queryForm" layout="inline">
      <FormItem :label="$t('cartLabelIssue.cartType')">
        <Input
          v-model:value="queryForm.cartType"
          :allow-clear="true"
          :placeholder="$t('cartLabelIssue.plsInput')"
          style="width: 160px"
        />
      </FormItem>
      <FormItem :label="$t('cartLabelIssue.cartCode')">
        <Input
          v-model:value="queryForm.cartCode"
          :allow-clear="true"
          :placeholder="$t('cartLabelIssue.plsInput')"
          style="width: 160px"
        />
      </FormItem>
      <FormItem :label="$t('cartLabelIssue.lotId')">
        <Input
          v-model:value="queryForm.lotId"
          :allow-clear="true"
          :placeholder="$t('cartLabelIssue.plsInput')"
          style="width: 200px"
        />
      </FormItem>
      <FormItem :label="$t('cartLabelIssue.loadStatus')">
        <Select
          v-model:value="queryForm.loadFlag"
          :allow-clear="true"
          :options="loadFlagOptions"
          :placeholder="$t('cartLabelIssue.plsSelect')"
          style="width: 140px"
        />
      </FormItem>
      <FormItem :label="$t('cartLabelIssue.colDeleteFlag')">
        <Select
          v-model:value="queryForm.deleteFlag"
          :allow-clear="true"
          :options="deleteFlagOptions"
          :placeholder="$t('cartLabelIssue.plsSelect')"
          style="width: 140px"
        />
      </FormItem>
      <FormItem>
        <Space>
          <Button type="primary" @click="handleQuery">{{
            $t('common.query')
          }}</Button>
          <Button @click="handleReset">{{ $t('common.reset') }}</Button>
        </Space>
      </FormItem>
    </Form>

    <!-- 2. 表格（可多选打印） -->
    <Grid>
      <template #toolbar-tools>
        <Space>
          <Button @click="handlePrint">{{ $t('common.print') }}</Button>
          <Button @click="handleEmptyCartIssue">
            {{ $t('cartLabelIssue.emptyCartIssue') }}
          </Button>
          <Button type="primary" @click="handleCartIssue">
            {{ $t('cartLabelIssue.cartIssue') }}
          </Button>
        </Space>
      </template>
      <template #loadFlag="{ row }">
        <Tag :color="Number(row.loadFlag) === 1 ? 'success' : 'default'">
          {{
            Number(row.loadFlag) === 1
              ? $t('cartLabelIssue.loaded')
              : $t('cartLabelIssue.unloaded')
          }}
        </Tag>
      </template>
      <template #lockFlag="{ row }">
        <Tag :color="row.lockFlag ? 'warning' : 'default'">
          {{ getLockFlagText(row.lockFlag) }}
        </Tag>
      </template>
      <template #deleteFlag="{ row }">
        <Tag :color="Number(row.deleteFlag) === 1 ? 'error' : 'success'">
          {{
            Number(row.deleteFlag) === 1
              ? $t('cartLabelIssue.deleted')
              : $t('cartLabelIssue.notDeleted')
          }}
        </Tag>
      </template>
      <template #action="{ row }">
        <Space>
          <Button
            type="link"
            :disabled="!!row.lockFlag"
            @click="handleLock(row)"
          >
            {{ $t('cartLabelIssue.opLock') }}
          </Button>
          <Button
            type="link"
            :disabled="!row.lockFlag"
            @click="handleUnlock(row)"
          >
            {{ $t('cartLabelIssue.opUnlock') }}
          </Button>
          <Button type="link" @click="handleDelete(row)" danger>
            {{ $t('cartLabelIssue.opDelete') }}
          </Button>
        </Space>
      </template>
    </Grid>

    <!-- 锁定/解锁 抽屉：复用台车锁定组件（原 type 116），按 mode 区分锁定/解锁，从顶部弹出，带入当前行台车信息 -->
    <Drawer
      v-model:open="lockDrawerVisible"
      :title="
        drawerMode === 'lock'
          ? $t('cartLabelIssue.lockTitle')
          : $t('cartLabelIssue.unlockTitle')
      "
      height="100%"
      placement="top"
    >
      <CartLock
        :workstation-code="workstationCode"
        :function-id="functionId"
        :cart-row="currentCartRow"
        :mode="drawerMode"
        @success="handleActionSuccess"
        v-if="lockDrawerVisible"
      />
    </Drawer>
  </div>
</template>
