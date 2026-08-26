<script setup lang="ts">
import { ref } from 'vue';

import {
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Row,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  addCartWeight,
  deleteCartWeight,
  searchCartWeight,
  selectCartWeight,
  selectPalletAllInfo,
  updateStae,
} from '#/api';
import { $t } from '#/locales';

import ReIssueDrawer from '../drawers/ReIssueDrawer.vue';

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

// region 查询条件
const queryParams = ref<any>({
  palletLabel: '',
});

function handleQuery() {
  const label = queryParams.value.palletLabel.trim();
  if (!label) {
    message.warning($t('gravityFreeMixerWork.plsInputPalletLabel'));
    return;
  }
  Promise.all([selectPalletAllInfo(label), searchCartWeight(label)])
    .then(([info, weightList]: any) => {
      // 工单信息
      workSheetInfo.value = {
        lineName: info?.lineName ?? '',
        workSheetCode: info?.workSheetCode ?? '',
        productName: info?.productName ?? '',
        operator: info?.createUser ?? '',
        remark: info?.remark ?? '',
        indicateWeight: info?.workSheetPlanNumber,
        goodWeight: info?.workSheetFinishNumber,
        remainWeight: info?.diffNum,
      };
      // 推车信息（推车重量由用户扫码推车代码后实时获取）
      const totalWeight = info?.totalQty;
      const unit = info?.unit;
      cartInfo.value = {
        palletLabel: info?.palletLabel ?? '',
        lotId: info?.lotId ?? '',
        lotCode: info?.lotCode ?? '',
        cartCode: cartInfo.value.cartCode,
        cartWeight: cartInfo.value.cartWeight,
        totalWeight,
        manualTotalWeight: 0,
        unit,
        workWeight: undefined,
      };
      // LOT 分割信息
      splitList.value = (Array.isArray(weightList) ? weightList : []).map(
        (item: any) => ({
          id: item.id,
          lotId: info?.lotId ?? '',
          lotCode: info?.lotCode ?? '',
          lotIdNum: item.lotId,
          cartCode: item.cartCode,
          qty: item.qty,
          unit: item.unit,
          handleTime: formatTime(item.createTime),
        }),
      );
      // 回填单位（取最新一条记录）
      if (!cartInfo.value.unit && splitList.value.length > 0) {
        cartInfo.value.unit = splitList.value[0].unit || '';
      }
      splitGridApi.grid.loadData([...splitList.value]);
    })
    .catch(() => {
      message.error($t('gravityFreeMixerWork.queryFailed'));
    });
}

function handleReset() {
  queryParams.value = { palletLabel: '' };
}

/** 格式化后端返回的时间 */
function formatTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** 数值格式化：保留两位小数，空值显示占位符 */
function formatNumber(value?: number | string) {
  if (value == null || value === '') return '-';
  const num = Number(value);
  return Number.isNaN(num) ? '-' : num.toFixed(2);
}
// endregion

// region 工单信息
const workSheetInfo = ref<any>({
  lineName: '',
  workSheetCode: '',
  productName: '',
  operator: '',
  remark: '',
  indicateWeight: undefined,
  goodWeight: undefined,
  remainWeight: undefined,
});

/** 底部指标项 */
const weightIndicators = [
  {
    key: 'indicateWeight',
    label: $t('gravityFreeMixerWork.indicateWeight'),
    cls: 'text-blue-600',
  },
  {
    key: 'goodWeight',
    label: $t('gravityFreeMixerWork.goodWeight'),
    cls: 'text-green-600',
  },
  {
    key: 'remainWeight',
    label: $t('gravityFreeMixerWork.remainWeight'),
    cls: 'text-orange-600',
  },
];
// endregion

// region 推车信息
const cartInfo = ref<any>({
  palletLabel: '',
  lotId: '',
  lotCode: '',
  cartCode: '',
  cartWeight: undefined,
  totalWeight: undefined,
  manualTotalWeight: undefined,
  workWeight: undefined,
  unit: '',
});

/** 手动总重量修改后，联动重算作业重量（作业重量 = 手动总重量 - 推车重量） */
function handleTotalWeightChange() {
  const total = Number(cartInfo.value.manualTotalWeight);
  const cart = cartInfo.value.cartWeight;
  const cartNum = cart != null && cart !== '' ? Number(cart) : Number.NaN;
  cartInfo.value.workWeight =
    !Number.isNaN(total) && !Number.isNaN(cartNum)
      ? total - cartNum
      : undefined;
}

/** 输入/扫码推车代码后，调用接口获取小车重量并联动重算作业重量 */
async function handleCartCodeChange() {
  const code = (cartInfo.value.cartCode || '').trim();
  if (!code) {
    cartInfo.value.cartWeight = undefined;
    handleTotalWeightChange();
    return;
  }
  try {
    const res: any = await selectCartWeight(code);
    const weight = Number(res);
    cartInfo.value.cartWeight = Number.isNaN(weight) ? undefined : weight;
  } catch {
    message.error($t('gravityFreeMixerWork.cartWeightQueryFailed'));
    cartInfo.value.cartWeight = undefined;
  }
  handleTotalWeightChange();
}
// endregion

// region LOT分割信息
const splitList = ref<any[]>([]);

const splitGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  height: 300,
  stripe: true,
  checkboxConfig: { highlight: true, range: true },
  columns: [
    { type: 'checkbox', width: 60 },
    { field: 'lotId', title: $t('gravityFreeMixerWork.lotId'), minWidth: 120 },
    {
      field: 'cartCode',
      title: $t('gravityFreeMixerWork.cartCode'),
      minWidth: 120,
    },
    { field: 'qty', title: $t('gravityFreeMixerWork.qty'), minWidth: 100 },
    { field: 'unit', title: $t('gravityFreeMixerWork.unit'), minWidth: 80 },
    {
      field: 'handleTime',
      title: $t('gravityFreeMixerWork.handleTime'),
      minWidth: 160,
    },
  ],
  data: splitList.value,
  pagerConfig: { enabled: false },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [SplitGrid, splitGridApi] = useVbenVxeGrid({
  gridOptions: splitGridOptions,
});
// endregion

// region 功能按钮
/** 结束：二次确认后将当前托盘的工单更新为结束状态 */
function handleEnd() {
  const { totalWeight, lotId } = cartInfo.value;
  const indicateWeight = workSheetInfo.value.indicateWeight;
  if (!lotId) {
    message.warning($t('gravityFreeMixerWork.plsQueryFirst'));
    return;
  }
  // 校验：总重量不能小于指示数量
  if (
    totalWeight != null &&
    indicateWeight != null &&
    totalWeight < indicateWeight
  ) {
    message.warning($t('gravityFreeMixerWork.totalLessThanIndicate'));
    return;
  }
  Modal.confirm({
    title: $t('gravityFreeMixerWork.endConfirmTitle'),
    content: $t('gravityFreeMixerWork.endConfirmContent'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: async () => {
      try {
        await updateStae([lotId], 3);
        message.success($t('gravityFreeMixerWork.endSuccess'));
        handleQuery();
      } catch {
        message.error($t('gravityFreeMixerWork.endFailed'));
      }
    },
  });
}

/** 重新发行抽屉实例 */
const reIssueDrawerRef = ref();

/** 重新发行：打开重新发行抽屉 */
function handleReIssue() {
  reIssueDrawerRef.value?.open();
}

/** 业绩取消：删除表格中勾选的推车称重记录 */
async function handlePerformanceCancel() {
  const records = splitGridApi.grid.getCheckboxRecords();
  if (!records?.length) {
    message.warning($t('gravityFreeMixerWork.plsSelectRecord'));
    return;
  }
  try {
    await Promise.all(
      records.map((record: any) => deleteCartWeight(record.id)),
    );
    message.success($t('gravityFreeMixerWork.cancelSuccess'));
    handleQuery();
  } catch {
    message.error($t('gravityFreeMixerWork.cancelFailed'));
  }
}

/** 业绩注册：将当前推车作业重量提交为一条称重记录 */
async function handlePerformanceRegistration() {
  const info = cartInfo.value;
  if (!info.palletLabel) {
    message.warning($t('gravityFreeMixerWork.plsQueryFirst'));
    return;
  }
  if (!info.cartCode) {
    message.warning($t('gravityFreeMixerWork.plsInputCartCode'));
    return;
  }
  if (info.workWeight == null) {
    message.warning($t('gravityFreeMixerWork.noWorkWeight'));
    return;
  }
  try {
    await addCartWeight({
      cartCode: info.cartCode,
      lotCode: info.lotCode,
      lotId: info.lotId,
      palletLabel: info.palletLabel,
      qty: info.workWeight,
      unit: info.unit || 'KG',
    });
    message.success($t('gravityFreeMixerWork.registrationSuccess'));
    handleQuery();
  } catch {
    message.error($t('gravityFreeMixerWork.registrationFailed'));
  }
}
// endregion
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- 查询条件 -->
    <Card :title="$t('gravityFreeMixerWork.queryCondition')">
      <Form layout="inline" class="flex flex-wrap gap-2">
        <FormItem :label="$t('gravityFreeMixerWork.palletLabel')">
          <Input
            v-model:value="queryParams.palletLabel"
            class="w-56"
            :placeholder="$t('gravityFreeMixerWork.palletLabelPlaceholder')"
            allow-clear
            @press-enter="handleQuery"
          />
        </FormItem>
        <FormItem>
          <Space>
            <Button type="primary" @click="handleQuery">
              {{ $t('common.query') }}
            </Button>
            <Button @click="handleReset">
              {{ $t('common.reset') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>

    <!-- 工单信息 -->
    <Card :title="$t('gravityFreeMixerWork.workSheetInfo')">
      <Descriptions bordered :column="2" size="small">
        <DescriptionsItem :label="$t('gravityFreeMixerWork.lineName')">
          {{ workSheetInfo.lineName || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('gravityFreeMixerWork.workSheetCode')">
          {{ workSheetInfo.workSheetCode || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('gravityFreeMixerWork.productName')">
          {{ workSheetInfo.productName || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('gravityFreeMixerWork.operator')">
          {{ workSheetInfo.operator || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('gravityFreeMixerWork.remark')" :span="2">
          {{ workSheetInfo.remark || '-' }}
        </DescriptionsItem>
      </Descriptions>

      <!-- 底部指标 -->
      <div class="mt-4 flex items-center gap-10 border-t border-gray-100 pt-4">
        <div
          v-for="item in weightIndicators"
          :key="item.key"
          class="flex-1 text-center"
        >
          <div class="text-gray-500">
            {{ item.label }}
          </div>
          <div class="mt-1 text-2xl font-bold" :class="item.cls">
            {{ formatNumber(workSheetInfo[item.key]) }}
          </div>
        </div>
      </div>
    </Card>

    <!-- 左右两栏 -->
    <Row :gutter="16">
      <!-- 左栏：推车信息 -->
      <Col :span="12">
        <Card :title="$t('gravityFreeMixerWork.cartInfo')" class="h-full">
          <Descriptions bordered :column="1" size="small">
            <DescriptionsItem
              :label="$t('gravityFreeMixerWork.palletLabel')"
              :span="2"
            >
              {{ cartInfo.palletLabel || '-' }}
            </DescriptionsItem>
            <DescriptionsItem
              :label="$t('gravityFreeMixerWork.lotId')"
              :span="2"
            >
              {{ cartInfo.lotCode || '-' }}
            </DescriptionsItem>
            <DescriptionsItem
              :label="$t('gravityFreeMixerWork.cartCode')"
              :span="2"
            >
              <Input
                v-model:value="cartInfo.cartCode"
                class="w-56"
                allow-clear
                :placeholder="$t('gravityFreeMixerWork.cartCodePlaceholder')"
                @press-enter="handleCartCodeChange"
              />
            </DescriptionsItem>
            <DescriptionsItem :label="$t('gravityFreeMixerWork.cartWeight')">
              {{
                cartInfo.cartWeight != null
                  ? `${cartInfo.cartWeight} ${cartInfo.unit}`.trim()
                  : '-'
              }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('gravityFreeMixerWork.totalWeight')">
              <Input
                v-model:value="cartInfo.manualTotalWeight"
                class="w-40"
                allow-clear
                :placeholder="cartInfo.unit"
                @change="handleTotalWeightChange"
                @press-enter="handleTotalWeightChange"
              />
            </DescriptionsItem>
            <DescriptionsItem
              :label="$t('gravityFreeMixerWork.workWeight')"
              :span="2"
            >
              {{
                cartInfo.workWeight != null
                  ? `${cartInfo.workWeight} ${cartInfo.unit}`.trim()
                  : '-'
              }}
            </DescriptionsItem>
            <DescriptionsItem
              :label="$t('gravityFreeMixerWork.generateRatio')"
              :span="2"
            >
              {{
                cartInfo.totalWeight != null &&
                workSheetInfo.indicateWeight != null
                  ? `${cartInfo.totalWeight} ${cartInfo.unit}/${workSheetInfo.indicateWeight} ${cartInfo.unit}`
                  : '-'
              }}
            </DescriptionsItem>
          </Descriptions>
        </Card>
      </Col>

      <!-- 右栏：LOT分割信息 -->
      <Col :span="12">
        <Card :title="$t('gravityFreeMixerWork.lotSplitInfo')">
          <SplitGrid>
            <template #toolbar-tools></template>
          </SplitGrid>

          <!-- 功能按钮（预留） -->
          <Space class="mt-3 flex justify-end w-full">
            <Button @click="handleEnd">
              {{ $t('gravityFreeMixerWork.end') }}
            </Button>
            <Button @click="handleReIssue">
              {{ $t('gravityFreeMixerWork.reIssue') }}
            </Button>
            <Button danger @click="handlePerformanceCancel">
              {{ $t('gravityFreeMixerWork.performanceCancel') }}
            </Button>
            <Button type="primary" @click="handlePerformanceRegistration">
              {{ $t('gravityFreeMixerWork.performanceRegistration') }}
            </Button>
          </Space>
        </Card>
      </Col>
    </Row>

    <!-- 重新发行抽屉 -->
    <ReIssueDrawer ref="reIssueDrawerRef" />
  </div>
</template>
