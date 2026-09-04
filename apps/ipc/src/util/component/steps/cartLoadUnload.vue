<script setup lang="ts">
import { reactive, ref } from 'vue';

import {
  Button,
  Col,
  Descriptions,
  DescriptionsItem,
  Form,
  FormItem,
  Input,
  message,
  Row,
  Select,
  Space,
  Switch,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { cartLoad, cartUnload, queryCartList, queryLotDetail } from '#/api';
import { $t } from '#/locales';

/**
 * 工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
defineProps({
  functionId: { type: Number, default: 0 },
  workstationCode: { type: String, default: '' },
  /** 工序编号，由外部传入 */
  processCode: { type: String, default: '' },
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

// 装载状态取值与后台 loadFlag 对齐：1 已装载，-1 未装载
const loadStatusOptions = [
  { label: $t('cartLoadUnload.loaded'), value: '1' },
  { label: $t('cartLoadUnload.unloaded'), value: '-1' },
];
// endregion

// region 2.1 左侧台车列表（数据来自后台 queryCartList 接口，字段与返回 results 对齐）
/**
 * 加载台车列表：携带查询条件与分页参数调用 queryCartList
 * @param param0 page 分页信息（由表格 proxy 提供）
 * @returns { total, items } 供表格渲染
 */
function queryCartPage({ page }: any) {
  const params: any = {
    // 仅查询未删除的台车
    deleteFlag: '-1',
    // 装载状态：1 已装载，-1 未装载
    loadFlag: queryForm.loadStatus,
    pageNum: page.currentPage,
    pageSize: page.pageSize,
  };
  // 有值条件才参与过滤（后台无此参数则自动忽略）
  if (queryForm.cartType) {
    params.cartType = queryForm.cartType;
  }
  if (queryForm.cartCode) {
    params.cartCode = queryForm.cartCode;
  }
  if (queryForm.cartName) {
    params.cartName = queryForm.cartName;
  }
  return queryCartList(params)
    .then((res: any) => {
      const { total = 0, results = [] } = res ?? {};
      return { total, items: results };
    })
    .catch(() => ({ total: 0, items: [] }));
}

const cartGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50, title: '' },
    {
      field: 'cartCode',
      title: $t('cartLoadUnload.colCartCode'),
      minWidth: 80,
    },
    {
      field: 'cartName',
      title: $t('cartLoadUnload.colCartName'),
      minWidth: 100,
    },
    {
      field: 'catTypeName',
      title: $t('cartLoadUnload.colCartType'),
      minWidth: 100,
    },
    {
      field: 'loadFlag',
      title: $t('cartLoadUnload.colIsLoaded'),
      minWidth: 80,
      slots: { default: 'loadFlag' },
    },
    { field: 'lotId', title: $t('cartLoadUnload.colLotId'), minWidth: 250 },
    { field: 'quantity', title: $t('cartLoadUnload.colQty'), minWidth: 90 },
  ],
  height: 340,
  radioConfig: { highlight: true, trigger: 'row' },
  pagerConfig: { enabled: true, pageSize: 20, pageSizes: [10, 20, 50, 100] },
  proxyConfig: {
    ajax: {
      query: queryCartPage,
    },
  },
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [CartGrid, cartGridApi] = useVbenVxeGrid({
  gridOptions: cartGridOptions,
});
// endregion

// region 2.2 右侧装载信息（字段直接使用 queryLotDetail 接口返回键，不做自定义映射）
const loadForm = reactive<any>({});

/** 清空接口带出的展示字段（保留 lotId 输入值） */
function resetLoadInfo() {
  [
    'productCode',
    'productName',
    'sapSeq',
    'lotCreateTime',
    'validDate',
    'number',
    'equipCode',
    'opUser',
    'workSheetCode',
  ].forEach((key: string) => {
    delete loadForm[key];
  });
}

/** 按扫码输入的 LotId 查询批次详情，并带出装载信息 */
function handleLotidQuery() {
  const lotId = String(loadForm.lotId ?? '').trim();
  if (!lotId) {
    resetLoadInfo();
    return;
  }
  queryLotDetail({ lotId }).then((data: any) => {
    // 直接以接口返回对象整体展开赋值，后台字段即展示字段
    Object.assign(loadForm, data ?? {});
  });
}
// endregion

// region 3. 底部按钮
const printOption = ref<string>('1');
const printOptionList = [
  { label: $t('cartLoadUnload.printOpt1'), value: '1' },
  { label: $t('cartLoadUnload.printOpt2'), value: '2' },
];
const labelSwitch = ref(false);

/** 初始化：将查询条件、装载信息、打印选项等回归初始状态并刷新列表 */
function handleInit() {
  handleReset();
  loadForm.lotId = '';
  resetLoadInfo();
  printOption.value = '1';
  labelSwitch.value = false;
}

/** 装载：需在左侧单选台车，并扫码 LOT 查询出批次信息 */
function handleLoad() {
  const selectedCart: any = cartGridApi.grid.getRadioRecord();
  if (!selectedCart?.cartCode) {
    message.warning($t('cartLoadUnload.plsSelectCart'));
    return;
  }
  if (!loadForm.lotId) {
    message.warning($t('cartLoadUnload.plsInputLotId'));
    return;
  }
  if (!loadForm.workSheetCode || loadForm.number == null) {
    message.warning($t('cartLoadUnload.plsQueryLot'));
    return;
  }
  cartLoad({
    cartCode: selectedCart.cartCode,
    lotId: loadForm.lotId,
    number: loadForm.number,
    worksheetCode: loadForm.workSheetCode,
  }).then(() => {
    message.success($t('cartLoadUnload.loadSuccess'));
    // 装载成功后刷新台车列表并清空批次信息
    loadForm.lotId = '';
    resetLoadInfo();
    handleQuery();
  });
}

/** 卸货：需在左侧单选台车 */
function handleUnload() {
  const selectedCart: any = cartGridApi.grid.getRadioRecord();
  if (!selectedCart?.cartCode) {
    message.warning($t('cartLoadUnload.plsSelectCart'));
    return;
  }
  cartUnload({ cartCode: selectedCart.cartCode }).then(() => {
    message.success($t('cartLoadUnload.unloadSuccess'));
    handleQuery();
  });
}
// endregion

// region 4. 查询
/** 触发表格重新查询（携带当前查询条件） */
function handleQuery() {
  cartGridApi.reload();
}

function handleReset() {
  queryForm.cartType = undefined;
  queryForm.cartCode = '';
  queryForm.cartName = '';
  queryForm.loadStatus = undefined;
  handleQuery();
}
// endregion
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
          <Button type="primary" @click="handleQuery">{{
            $t('common.query')
          }}</Button>
          <Button @click="handleReset">{{ $t('common.reset') }}</Button>
        </Space>
      </FormItem>
    </Form>

    <!-- 2. 左右两栏 -->
    <Row :gutter="16">
      <!-- 2.1 左侧：台车列表 -->
      <Col :span="16">
        <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
          <div class="mb-2 font-bold">
            {{ $t('cartLoadUnload.cartList') }}
          </div>
          <CartGrid>
            <template #loadFlag="{ row }">
              <Tag :color="Number(row.loadFlag) === 1 ? 'success' : 'default'">
                {{
                  Number(row.loadFlag) === 1
                    ? $t('cartLoadUnload.loaded')
                    : $t('cartLoadUnload.unloaded')
                }}
              </Tag>
            </template>
          </CartGrid>
        </div>
      </Col>

      <!-- 2.2 右侧：装载信息表单 -->
      <Col :span="8">
        <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
          <div class="mb-2 font-bold">
            {{ $t('cartLoadUnload.loadInfo') }}
          </div>
          <!-- lotId 支持扫码输入，独占一行 -->
          <Descriptions :column="1" bordered size="small">
            <DescriptionsItem :label="$t('cartLoadUnload.lotId')" :span="1">
              <Input
                v-model:value="loadForm.lotId"
                allow-clear
                :placeholder="$t('cartLoadUnload.plsInputLotId')"
                @press-enter="handleLotidQuery"
              />
            </DescriptionsItem>
            <DescriptionsItem :label="$t('cartLoadUnload.productCode')">
              {{ loadForm.productCode || '-' }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('cartLoadUnload.productName')">
              {{ loadForm.productName || '-' }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('cartLoadUnload.sapSerialNo')">
              {{ loadForm.sapSeq || '-' }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('cartLoadUnload.productionDate')">
              {{ loadForm.lotCreateTime || '-' }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('cartLoadUnload.expiryDate')">
              {{ loadForm.validDate || '-' }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('cartLoadUnload.qty')">
              {{ loadForm.number ?? '-' }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('cartLoadUnload.loader')">
              {{ loadForm.equipCode || '-' }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('cartLoadUnload.operator')">
              {{ loadForm.opUser || '-' }}
            </DescriptionsItem>
          </Descriptions>
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
            <Button type="primary" @click="handleLoad">{{
              $t('cartLoadUnload.load')
            }}</Button>
            <Button @click="handleUnload">{{
              $t('cartLoadUnload.unload')
            }}</Button>
          </Space>
        </div>
      </Col>
    </Row>
  </div>
</template>
