<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Descriptions,
  DescriptionsItem,
  Divider,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  RangePicker,
  Space,
} from 'ant-design-vue';

import {
  useVbenVxeGrid,
  type VxeGridListeners,
  type VxeGridProps,
} from '#/adapter/vxe-table';
import { selectNoTranseLot, selectPalletLabelInfo, updatePallet } from '#/api';

defineOptions({ name: 'PalletChangeDrawer' });

/** 关闭事件：供调用方在抽屉关闭后刷新列表 */
const emit = defineEmits<{ closed: [] }>();

/** 抽屉显隐 */
const show = ref(false);

/** 工序（默认搅拌机 6，可由调用方通过 open 传入覆盖） */
const processType = ref<number>(6);

// region 托盘信息：按托盘号查询，Descriptions 展示
const queryPalletLabel = ref('');
/** 托盘信息 */
const palletInfo = ref<any>(null);

/** 查询托盘信息 */
async function handleQueryPallet() {
  if (!queryPalletLabel.value) {
    message.warning($t('palletChange.plsInputPalletLabel'));
    return;
  }
  try {
    palletInfo.value = await selectPalletLabelInfo(queryPalletLabel.value);
    // 查询到托盘信息后，自动加载可变更的 lot 列表
    selectedLot.value = null;
    handleQuery();
  } catch {
    message.error($t('palletChange.palletQueryFailed'));
  }
}
// endregion

// region 批次LOT列表：时间范围 + 产品代码 + 产线代码，单选
const queryParams = reactive({
  planDateRange: [] as any,
  startTime: undefined as string | undefined,
  endTime: undefined as string | undefined,
  productCode: undefined as string | undefined,
  lineCode: undefined as string | undefined,
});

/** 查询参数格式化：拆出时间范围并剔除空值 */
function formatQueryParams() {
  const params: any = { ...queryParams };
  // 处理时间范围查询
  if (params.planDateRange && params.planDateRange.length === 2) {
    params.startTime = params.planDateRange[0];
    params.endTime = params.planDateRange[1];
  }
  delete params.planDateRange;
  // 剔除空值字段
  Object.keys(params).forEach((key) => {
    if (
      params[key] === undefined ||
      params[key] === '' ||
      params[key] === null
    ) {
      delete params[key];
    }
  });
  return params;
}

/** 当前选中的 lot 行（点击行即可选中） */
const selectedLot = ref<any>(null);

const lotGridEvents: VxeGridListeners<any> = {
  radioChange: ({ row }) => {
    selectedLot.value = row;
  },
};

const lotGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50, title: '', fixed: 'left' },
    { field: 'lotCode', title: $t('palletChange.lotCodeColumn'), minWidth: 180 },
    { field: 'lineName', title: $t('palletChange.lineName'), minWidth: 120 },
    { field: 'lineCode', title: $t('palletChange.lineCode'), minWidth: 100 },
    { field: 'productName', title: $t('palletChange.productName'), minWidth: 140 },
    { field: 'productCode', title: $t('palletChange.productCode'), minWidth: 120 },
    { field: 'unit', title: $t('palletChange.unit'), minWidth: 80 },
    { field: 'batch', title: $t('palletChange.batch'), minWidth: 100 },
    { field: 'priority', title: $t('palletChange.priority'), minWidth: 100 },
  ],
  height: 380,
  stripe: true,
  radioConfig: {
    highlight: true,
    trigger: 'row',
  },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
  proxyConfig: {
    ajax: {
      query: queryLotList,
    },
  },
};

const [LotGrid, lotGridApi] = useVbenVxeGrid({
  gridEvents: lotGridEvents,
  gridOptions: lotGridOptions,
});

/** 查询可以进行托盘变更的 lot */
async function queryLotList({ page }: any) {
  // 需要用到托盘信息的 batch，未查询到托盘信息时直接返回空数据
  const batch = palletInfo.value?.batch;
  if (!batch) {
    return { total: 0, items: [] };
  }
  const params: any = {
    ...formatQueryParams(),
    processType: processType.value,
    batch,
    pageNum: page.currentPage,
    pageSize: page.pageSize,
  };
  const res = await selectNoTranseLot(params);
  return { total: res.total, items: res.list };
}

function handleQuery() {
  lotGridApi.reload();
}

function handleReset() {
  queryParams.planDateRange = [];
  queryParams.startTime = undefined;
  queryParams.endTime = undefined;
  queryParams.productCode = undefined;
  queryParams.lineCode = undefined;
  handleQuery();
}
// endregion

// region 打开 / 关闭 / 变更
/** 打开抽屉：可选传入工序，覆盖默认工序 */
function open(processTypeValue?: number) {
  if (processTypeValue !== undefined) {
    processType.value = processTypeValue;
  }
  queryPalletLabel.value = '';
  palletInfo.value = null;
  selectedLot.value = null;
  queryParams.planDateRange = [];
  queryParams.startTime = undefined;
  queryParams.endTime = undefined;
  queryParams.productCode = undefined;
  queryParams.lineCode = undefined;
  show.value = true;
  nextTick(() => {
    lotGridApi.reload();
  });
}

/** 托盘变更：提交托盘 id 与选中的 lot id */
async function handleChange() {
  if (!palletInfo.value?.id) {
    message.warning($t('palletChange.plsInputPalletLabel'));
    return;
  }
  if (!selectedLot.value?.id) {
    message.warning($t('palletChange.plsSelectLot'));
    return;
  }
  try {
    await updatePallet({
      id: palletInfo.value.id,
      lotId: selectedLot.value.id,
      palletLabel: palletInfo.value.palletLabel,
    });
    message.success($t('palletChange.changeSuccess'));
    handleClose();
  } catch {
    message.error($t('palletChange.changeFailed'));
  }
}

function handleClose() {
  show.value = false;
  selectedLot.value = null;
  lotGridApi.grid?.clearRadioRow?.();
  emit('closed');
}

defineExpose({ open });
// endregion
</script>

<template>
  <Drawer
    v-model:open="show"
    :title="$t('palletChange.title')"
    placement="top"
    height="75%"
    :closable="false"
    :mask-closable="false"
  >
    <!-- 托盘信息区域：查询条件为托盘号，下方 Descriptions 展示 -->
    <div class="mb-4">
      <div class="mb-2 border-l-4 border-blue-500 pl-2 text-base font-semibold">
        {{ $t('palletChange.palletInfo') }}
      </div>
      <div class="mb-2 flex items-center gap-2">
        <Input
          v-model:value="queryPalletLabel"
          class="w-56"
          :placeholder="$t('palletChange.palletLabelPlaceholder')"
          allow-clear
          @press-enter="handleQueryPallet"
        />
        <Button type="primary" @click="handleQueryPallet">
          {{ $t('common.query') }}
        </Button>
      </div>
      <Descriptions bordered :column="4" size="small">
        <DescriptionsItem :label="$t('palletChange.palletLabel')">
          {{ palletInfo?.palletLabel || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('palletChange.workSheetCode')">
          {{ palletInfo?.workSheetCode || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('palletChange.lotCode')">
          {{ palletInfo?.lotCode || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('palletChange.productCode')">
          {{ palletInfo?.productCode || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('palletChange.productName')">
          {{ palletInfo?.productName || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('palletChange.createTime')">
          {{ palletInfo?.createTime || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('palletChange.lineCode')">
          {{ palletInfo?.lineCode || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('palletChange.lineName')">
          {{ palletInfo?.lineName || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('palletChange.batch')">
          {{ palletInfo?.batch ?? '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('palletChange.unit')">
          {{ palletInfo?.unit || '-' }}
        </DescriptionsItem>
      </Descriptions>
    </div>

    <Divider class="my-4" />

    <!-- 批次LOT列表区域 -->
    <div>
      <div
        class="mb-2 border-l-4 border-blue-500 pl-2 text-base font-semibold"
      >
        {{ $t('palletChange.lotList') }}
      </div>
      <Form layout="inline" class="mb-3 flex-wrap items-end gap-2">
        <FormItem :label="$t('palletChange.planDateRange')">
          <RangePicker
            v-model:value="queryParams.planDateRange"
            value-format="YYYY-MM-DD"
            :placeholder="[
              $t('palletChange.planDatePlaceholder'),
              $t('palletChange.planDatePlaceholder'),
            ]"
          />
        </FormItem>
        <FormItem :label="$t('palletChange.productCode')">
          <Input
            v-model:value="queryParams.productCode"
            allow-clear
            class="w-40"
            @press-enter="handleQuery"
          />
        </FormItem>
        <FormItem :label="$t('palletChange.lineCode')">
          <Input
            v-model:value="queryParams.lineCode"
            allow-clear
            class="w-40"
            @press-enter="handleQuery"
          />
        </FormItem>
        <FormItem>
          <Space>
            <Button type="primary" @click="handleQuery">
              {{ $t('common.query') }}
            </Button>
            <Button @click="handleReset">{{ $t('common.reset') }}</Button>
          </Space>
        </FormItem>
      </Form>
      <LotGrid />
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex justify-end">
        <Space>
          <Button type="primary" @click="handleChange">
            {{ $t('palletChange.change') }}
          </Button>
          <Button @click="handleClose">{{ $t('common.cancel') }}</Button>
        </Space>
      </div>
    </template>
  </Drawer>
</template>
