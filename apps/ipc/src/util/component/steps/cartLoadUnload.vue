<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import {
  Button,
  Col,
  Form,
  FormItem,
  Input,
  message,
  Row,
  Select,
  Space,
  Switch,
} from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { $t } from '#/locales';

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
  { label: $t('cartLoadUnload.loaded'), value: '1' },
  { label: $t('cartLoadUnload.unloaded'), value: '0' },
];
// endregion

// region 2.1 左侧台车列表（假数据，接口就绪后替换为接口返回）
const cartData = reactive<any[]>([
  {
    cartCode: 'CART-001',
    cartName: '台车1',
    cartType: 'A',
    isLoaded: '是',
    lotId: 'LOT-001',
    qty: 100,
  },
  {
    cartCode: 'CART-002',
    cartName: '台车2',
    cartType: 'B',
    isLoaded: '否',
    lotId: 'LOT-002',
    qty: 0,
  },
]);

const cartGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { field: 'cartCode', title: $t('cartLoadUnload.colCartCode'), minWidth: 130 },
    { field: 'cartName', title: $t('cartLoadUnload.colCartName'), minWidth: 130 },
    { field: 'cartType', title: $t('cartLoadUnload.colCartType'), minWidth: 110 },
    { field: 'isLoaded', title: $t('cartLoadUnload.colIsLoaded'), minWidth: 100 },
    { field: 'lotId', title: $t('cartLoadUnload.colLotId'), minWidth: 130 },
    { field: 'qty', title: $t('cartLoadUnload.colQty'), minWidth: 90 },
  ],
  data: cartData,
  height: 340,
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [CartGrid] = useVbenVxeGrid({ gridOptions: cartGridOptions });
// endregion

// region 2.2 右侧装载信息表单
const loadForm = reactive<any>({
  lotId: '',
  productCode: '',
  productName: '',
  sapSerialNo: '',
  productionDate: '',
  expiryDate: '',
  qty: 0,
  loader: '',
  operator: '',
});

function handleLotidQuery() {
  if (!loadForm.lotId) {
    // 清空其他字段
    loadForm.productCode = '';
    loadForm.productName = '';
    loadForm.sapSerialNo = '';
    loadForm.productionDate = '';
    loadForm.expiryDate = '';
    loadForm.qty = 0;
    loadForm.loader = '';
    loadForm.operator = '';
    return;
  }
  // TODO: 接口就绪后替换为真实查询（按 LOTID 带出装载信息）
  // fetchLoadInfo({ lotId: loadForm.lotId }).then((res) => { ... });
}
// endregion

// region 3. 底部按钮
const printOption = ref<string>('1');
const printOptionList = [
  { label: $t('cartLoadUnload.printOpt1'), value: '1' },
  { label: $t('cartLoadUnload.printOpt2'), value: '2' },
];
const labelSwitch = ref(false);

function handleInit() {
  // TODO: 初始化接口
  message.success($t('cartLoadUnload.initSuccess'));
}

function handleLoad() {
  // TODO: 装载接口
  message.success($t('cartLoadUnload.loadSuccess'));
}

function handleUnload() {
  // TODO: 卸货接口
  message.success($t('cartLoadUnload.unloadSuccess'));
}
// endregion

// region 4. 查询
function handleQuery() {
  // TODO: 接口就绪后替换为真实查询（按台车类型/代码/名称/装载状态过滤台车列表）
  // const params: any = { ...queryForm };
  // fetchCartList(params).then((res) => { ... });
}

function handleReset() {
  queryForm.cartType = undefined;
  queryForm.cartCode = '';
  queryForm.cartName = '';
  queryForm.loadStatus = undefined;
  handleQuery();
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
      <FormItem :label="$t('cartLoadUnload.cartType')">
        <Select
          v-model:value="queryForm.cartType"
          :allow-clear="true"
          :options="cartTypeOptions"
          :placeholder="$t('cartLoadUnload.plsSelect')"
          style="width: 160px"
        />
      </FormItem>
      <FormItem :label="$t('cartLoadUnload.cartCode')">
        <Input
          v-model:value="queryForm.cartCode"
          :allow-clear="true"
          :placeholder="$t('cartLoadUnload.plsInput')"
          style="width: 160px"
        />
      </FormItem>
      <FormItem :label="$t('cartLoadUnload.cartName')">
        <Input
          v-model:value="queryForm.cartName"
          :allow-clear="true"
          :placeholder="$t('cartLoadUnload.plsInput')"
          style="width: 160px"
        />
      </FormItem>
      <FormItem :label="$t('cartLoadUnload.loadStatus')">
        <Select
          v-model:value="queryForm.loadStatus"
          :allow-clear="true"
          :options="loadStatusOptions"
          :placeholder="$t('cartLoadUnload.plsSelect')"
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

    <!-- 2. 左右两栏 -->
    <Row :gutter="16">
      <!-- 2.1 左侧：台车列表 -->
      <Col :span="12">
        <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
          <div class="mb-2 font-bold">
            {{ $t('cartLoadUnload.cartList') }}
          </div>
          <CartGrid />
        </div>
      </Col>

      <!-- 2.2 右侧：装载信息表单 -->
      <Col :span="12">
        <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
          <div class="mb-2 font-bold">
            {{ $t('cartLoadUnload.loadInfo') }}
          </div>
          <Form :model="loadForm" layout="vertical">
            <FormItem :label="$t('cartLoadUnload.lotId')">
              <Input
                v-model:value="loadForm.lotId"
                :placeholder="$t('cartLoadUnload.plsInputLotId')"
                @change="handleLotidQuery"
              />
            </FormItem>
            <Row :gutter="12">
              <Col :span="12">
                <FormItem :label="$t('cartLoadUnload.productCode')">
                  <Input v-model:value="loadForm.productCode" readonly />
                </FormItem>
              </Col>
              <Col :span="12">
                <FormItem :label="$t('cartLoadUnload.productName')">
                  <Input v-model:value="loadForm.productName" readonly />
                </FormItem>
              </Col>
              <Col :span="12">
                <FormItem :label="$t('cartLoadUnload.sapSerialNo')">
                  <Input v-model:value="loadForm.sapSerialNo" readonly />
                </FormItem>
              </Col>
              <Col :span="12">
                <FormItem :label="$t('cartLoadUnload.productionDate')">
                  <Input v-model:value="loadForm.productionDate" readonly />
                </FormItem>
              </Col>
              <Col :span="12">
                <FormItem :label="$t('cartLoadUnload.expiryDate')">
                  <Input v-model:value="loadForm.expiryDate" readonly />
                </FormItem>
              </Col>
              <Col :span="12">
                <FormItem :label="$t('cartLoadUnload.qty')">
                  <Input
                    :value="String(loadForm.qty)" readonly
                  />
                </FormItem>
              </Col>
              <Col :span="12">
                <FormItem :label="$t('cartLoadUnload.loader')">
                  <Input v-model:value="loadForm.loader" readonly />
                </FormItem>
              </Col>
              <Col :span="12">
                <FormItem :label="$t('cartLoadUnload.operator')">
                  <Input v-model:value="loadForm.operator" readonly />
                </FormItem>
              </Col>
            </Row>
          </Form>
        </div>
      </Col>
    </Row>

    <!-- 3. 底部按钮 -->
    <Row>
      <Col :span="12">
        <Space>
          <span>{{ $t('cartLoadUnload.printOption') }}</span>
          <Select
            v-model:value="printOption"
            :options="printOptionList"
            style="width: 200px"
          />
          <span>{{ $t('cartLoadUnload.labelOutput') }}</span>
          <Switch v-model:checked="labelSwitch" />
        </Space>
      </Col>
      <Col :span="12">
        <div class="flex justify-end">
          <Space>
            <Button @click="handleInit">{{ $t('cartLoadUnload.init') }}</Button>
            <Button type="primary" @click="handleLoad">{{ $t('cartLoadUnload.load') }}</Button>
            <Button @click="handleUnload">{{ $t('cartLoadUnload.unload') }}</Button>
          </Space>
        </div>
      </Col>
    </Row>
  </div>
</template>
