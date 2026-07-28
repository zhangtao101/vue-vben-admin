<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Select,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { $t } from '#/locales';
import CartLock from '#/util/component/steps/cartLock.vue';
import CartUnlock from '#/util/component/steps/cartUnlock.vue';

/**
 * 工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
defineProps({
  functionId: { type: Number, default: 0 },
  bindingId: { type: Number, default: 0 },
  worksheetCode: { type: String, default: '' },
  equipCode: { type: String, default: '' },
  workstationCode: { type: String, default: '' },
});

// region 1. 查询条件
const queryForm = reactive<any>({
  cartType: undefined,
  cartCode: '',
  cartName: '',
  loadStatus: undefined,
});

const cartTypeOptions = [
  { label: 'A类台车', value: 'A' },
  { label: 'B类台车', value: 'B' },
];

const loadStatusOptions = [
  { label: $t('cartLabelIssue.loaded'), value: '1' },
  { label: $t('cartLabelIssue.unloaded'), value: '0' },
];
// endregion

// region 2. 表格数据（假数据，接口就绪后替换为接口返回）
const cartData = reactive<any[]>([
  {
    cartCode: 'CART-001',
    cartName: '台车1',
    cartType: 'A',
    lotId: 'LOT-001',
    maxLoadQty: 200,
    isLocked: '否',
    isDeleted: '否',
  },
  {
    cartCode: 'CART-002',
    cartName: '台车2',
    cartType: 'B',
    lotId: 'LOT-002',
    maxLoadQty: 200,
    isLocked: '是',
    isDeleted: '否',
  },
]);

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    { field: 'cartCode', title: $t('cartLabelIssue.colCartCode'), minWidth: 140 },
    { field: 'cartName', title: $t('cartLabelIssue.colCartName'), minWidth: 140 },
    { field: 'cartType', title: $t('cartLabelIssue.colCartType'), minWidth: 110 },
    { field: 'lotId', title: $t('cartLabelIssue.colLotId'), minWidth: 140 },
    { field: 'maxLoadQty', title: $t('cartLabelIssue.colMaxLoadQty'), minWidth: 120 },
    { field: 'isLocked', title: $t('cartLabelIssue.colIsLocked'), minWidth: 100 },
    { field: 'isDeleted', title: $t('cartLabelIssue.colIsDeleted'), minWidth: 100 },
    {
      field: 'action',
      title: $t('cartLabelIssue.colAction'),
      minWidth: 160,
      fixed: 'right',
      slots: { default: 'action' },
    },
  ],
  data: cartData,
  height: 420,
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
// endregion

// region 3. 查询与功能按钮
function handleQuery() {
  // TODO: 接口就绪后替换为真实查询（按台车类型/代码/名称/装载状态过滤）
  // const params: any = {
  //   workstationCode: props.workstationCode,
  //   functionId: props.functionId,
  //   bindingId: props.bindingId,
  //   worksheetCode: props.worksheetCode,
  //   equipCode: props.equipCode,
  //   ...queryForm,
  // };
  // fetchCartLabelList(params).then((res) => { ... });
}

function handleReset() {
  queryForm.cartType = undefined;
  queryForm.cartCode = '';
  queryForm.cartName = '';
  queryForm.loadStatus = undefined;
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

// region 4. 操作列：复用台车锁定 / 台车解锁组件（抽屉形式）
const lockDrawerVisible = ref(false);
function handleLockDelete() {
  lockDrawerVisible.value = true;
}

const unlockDrawerVisible = ref(false);
function handleUnlock() {
  unlockDrawerVisible.value = true;
}
// endregion

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- 1. 查询条件 -->
    <Form :model="queryForm" layout="inline">
      <FormItem :label="$t('cartLabelIssue.cartType')">
        <Select
          v-model:value="queryForm.cartType"
          :allow-clear="true"
          :options="cartTypeOptions"
          :placeholder="$t('cartLabelIssue.plsSelect')"
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
      <FormItem :label="$t('cartLabelIssue.cartName')">
        <Input
          v-model:value="queryForm.cartName"
          :allow-clear="true"
          :placeholder="$t('cartLabelIssue.plsInput')"
          style="width: 160px"
        />
      </FormItem>
      <FormItem :label="$t('cartLabelIssue.loadStatus')">
        <Select
          v-model:value="queryForm.loadStatus"
          :allow-clear="true"
          :options="loadStatusOptions"
          :placeholder="$t('cartLabelIssue.plsSelect')"
          style="width: 160px"
        />
      </FormItem>
      <FormItem>
        <Space>
          <Button type="primary" @click="handleQuery">{{ $t('common.query') }}</Button>
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
      <template #action>
        <Space>
          <Button type="link" @click="handleLockDelete">
            {{ $t('cartLabelIssue.opLockDelete') }}
          </Button>
          <Button type="link" @click="handleUnlock">
            {{ $t('cartLabelIssue.opUnlock') }}
          </Button>
        </Space>
      </template>
    </Grid>

    <!-- 锁定/删除 抽屉：复用台车锁定组件（原 type 116），从顶部弹出 -->
    <Drawer
      v-model:open="lockDrawerVisible"
      :title="$t('cartLabelIssue.lockTitle')"
      :height="500"
      placement="top"
    >
      <CartLock
        :workstation-code="workstationCode"
        :equip-code="equipCode"
        :worksheet-code="worksheetCode"
        :binding-id="bindingId"
        :function-id="functionId"
      />
    </Drawer>

    <!-- 解锁 抽屉：复用台车解锁组件（原 type 117），从顶部弹出 -->
    <Drawer
      v-model:open="unlockDrawerVisible"
      :title="$t('cartLabelIssue.unlockTitle')"
      :height="500"
      placement="top"
    >
      <CartUnlock
        :workstation-code="workstationCode"
        :equip-code="equipCode"
        :worksheet-code="worksheetCode"
        :binding-id="bindingId"
        :function-id="functionId"
      />
    </Drawer>
  </div>
</template>
