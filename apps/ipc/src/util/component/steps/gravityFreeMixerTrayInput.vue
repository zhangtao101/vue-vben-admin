<script setup lang="ts">
import { onMounted, ref } from 'vue';

import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  FormItem,
  Input,
  message,
  Radio,
  Row,
  Space,
} from 'ant-design-vue';

import {
  useVbenVxeGrid,
  type VxeGridListeners,
  type VxeGridProps,
} from '#/adapter/vxe-table';
import {
  palletLoading,
  selectByWorkSheetId,
  selectPalletInfo,
  selectWorkSheet,
} from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'GravityFreeMixerTrayInput',
});

/**
 * 无重力搅拌托盘投入（工序 type=122）
 * 页面布局：查询条件 -> 工单列表 -> 左栏批次LOT列表 / 右栏装载列表（托盘号输入 + 卸载/装载）
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
  startTime: undefined,
  lineCode: undefined,
  workSheetCode: undefined,
  state: undefined,
});

/** 工单状态单选：undefined全部 1确定 2进行 3完成 */
const statusOptions = [
  { label: $t('gravityFreeMixerTrayInput.statusAll'), value: undefined },
  { label: $t('gravityFreeMixerTrayInput.statusConfirmed'), value: 1 },
  { label: $t('gravityFreeMixerTrayInput.statusInProgress'), value: 2 },
  { label: $t('gravityFreeMixerTrayInput.statusCompleted'), value: 3 },
];

function handleQuery() {
  gridApi.reload();
}

function handleReset() {
  queryParams.value = {
    startTime: undefined,
    lineCode: undefined,
    workSheetCode: undefined,
    state: undefined,
  };
  gridApi.reload();
}
// endregion

// region 工单列表
/** 选中的工单 */
const selectedWorkSheet = ref<any>(null);

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  height: 300,
  stripe: true,
  radioConfig: { trigger: 'row', highlight: true },
  pagerConfig: {
    enabled: true,
    pageSize: 20,
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
  columns: [
    { type: 'radio', width: 60 },
    {
      field: 'workSheetCode',
      title: $t('gravityFreeMixerTrayInput.workSheetCode'),
      minWidth: 120,
    },
    {
      field: 'productCode',
      title: $t('gravityFreeMixerTrayInput.productCode'),
      minWidth: 110,
    },
    {
      field: 'productName',
      title: $t('gravityFreeMixerTrayInput.productName'),
      minWidth: 160,
    },
    {
      field: 'planDateStart',
      title: $t('gravityFreeMixerTrayInput.planDateStart'),
      minWidth: 120,
    },
    {
      field: 'lineName',
      title: $t('gravityFreeMixerTrayInput.lineName'),
      minWidth: 100,
    },
    {
      field: 'indicateBatch',
      title: $t('gravityFreeMixerTrayInput.indicateBatch'),
      minWidth: 100,
    },
    {
      field: 'remainBatch',
      title: $t('gravityFreeMixerTrayInput.remainBatch'),
      minWidth: 100,
    },
  ],
  proxyConfig: {
    ajax: {
      query: queryWorkSheetList,
    },
  },
};

const gridEvents: VxeGridListeners<any> = {
  radioChange: handleWorksheetRadioChange,
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/** 工单展示：processType 固定为 6（无重力搅拌），state 为状态单选（1确定 2进行 3完成） */
async function queryWorkSheetList({ page }: any) {
  try {
    const res = await selectWorkSheet({
      pageNum: page.currentPage,
      pageSize: page.pageSize,
      lineCode: queryParams.value.lineCode,
      startTime: queryParams.value.startTime,
      processType: 6,
      workSheetCode: queryParams.value.workSheetCode,
      state: queryParams.value.state,
    });
    return { total: res.total || 0, items: res.list || [] };
  } catch {
    message.error($t('gravityFreeMixerTrayInput.workSheetListLoadFailed'));
    return { total: 0, items: [] };
  }
}

function handleWorksheetRadioChange({ row }: any) {
  selectedWorkSheet.value = row;
  // 切换工单时清空扫描添加的装载列表
  loadList.value = [];
  loadGridApi.grid.loadData([]);
  lotGridApi.reload();
}
// endregion

// region 批次LOT列表（左栏）
const lotGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  height: 360,
  stripe: true,
  columns: [
    {
      field: 'lotCode',
      title: $t('gravityFreeMixerTrayInput.lotCode'),
      minWidth: 100,
    },
    {
      field: 'fullLabel',
      title: $t('gravityFreeMixerTrayInput.fullLabel'),
      minWidth: 140,
    },
    {
      field: 'looseLabel',
      title: $t('gravityFreeMixerTrayInput.looseLabel'),
      minWidth: 140,
    },
    {
      field: 'looseUse',
      title: $t('gravityFreeMixerTrayInput.looseUse'),
      width: 120,
      slots: { default: 'useCell' },
    },
    {
      field: 'fullUse',
      title: $t('gravityFreeMixerTrayInput.fullUse'),
      width: 120,
      slots: { default: 'useCell' },
    },
  ],
  pagerConfig: { enabled: false },
  toolbarConfig: {
    custom: true,
    refresh: false,
    zoom: true,
  },
  proxyConfig: {
    ajax: {
      query: queryLotList,
    },
  },
};

const [LotGrid, lotGridApi] = useVbenVxeGrid({
  gridOptions: lotGridOptions,
});

/** 根据选中的工单查询所有批次 LOT */
async function queryLotList() {
  if (!selectedWorkSheet.value) {
    return { items: [] };
  }
  try {
    const res = await selectByWorkSheetId(selectedWorkSheet.value.id);
    return { items: Array.isArray(res) ? res : [] };
  } catch {
    message.error($t('gravityFreeMixerTrayInput.lotListLoadFailed'));
    return { items: [] };
  }
}

// endregion

// region 装载列表（右栏）
const inputPalletLabel = ref('');
const submitting = ref(false);
/** 扫描托盘添加的装载记录 */
const loadList = ref<any[]>([]);

function packTypeFormatter({ cellValue }: any) {
  return Number(cellValue) === 1
    ? $t('gravityFreeMixerTrayInput.paperBag')
    : $t('gravityFreeMixerTrayInput.loose');
}

const loadGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  height: 360,
  stripe: true,
  checkboxConfig: { highlight: true, range: true },
  columns: [
    { type: 'checkbox', width: 60 },
    {
      field: 'lotCode',
      title: $t('gravityFreeMixerTrayInput.lotCode'),
      minWidth: 100,
    },
    {
      field: 'palletLabel',
      title: $t('gravityFreeMixerTrayInput.palletLabel'),
      minWidth: 140,
    },
    {
      field: 'packType',
      title: $t('gravityFreeMixerTrayInput.packType'),
      width: 100,
      formatter: packTypeFormatter,
    },
  ],
  pagerConfig: { enabled: false },
  toolbarConfig: {
    custom: true,
    refresh: false,
    zoom: true,
  },
};

const [LoadGrid, loadGridApi] = useVbenVxeGrid({
  gridOptions: loadGridOptions,
});

/** 扫描托盘：先校验是否已在列表中，不存在则查询详情并添加到装载列表 */
async function handleScanPallet() {
  const pallet = inputPalletLabel.value.trim();
  if (!pallet) {
    message.warning($t('gravityFreeMixerTrayInput.plsInputPalletLabel'));
    return;
  }
  if (loadList.value.some((item) => item.palletLabel === pallet)) {
    message.warning($t('gravityFreeMixerTrayInput.palletExists'));
    return;
  }
  try {
    const info: any = await selectPalletInfo(pallet);
    loadList.value.push({
      lotId: info.lotId,
      lotCode: info.lotCode,
      palletLabel: pallet,
      packType: info.packType == null ? 1 : Number(info.packType),
    });
    loadGridApi.grid.loadData([...loadList.value]);
    inputPalletLabel.value = '';
  } catch {
    message.error($t('gravityFreeMixerTrayInput.palletQueryFailed'));
  }
}

/** 装载：对装载列表勾选的记录批量装载 */
async function handleLoad() {
  if (!selectedWorkSheet.value) {
    message.warning($t('gravityFreeMixerTrayInput.plsSelectWorkSheet'));
    return;
  }
  const records = loadGridApi.grid.getCheckboxRecords();
  if (!records?.length) {
    message.warning($t('gravityFreeMixerTrayInput.plsSelectLoadRecord'));
    return;
  }
  submitting.value = true;
  try {
    await palletLoading(
      records.map((record: any) => ({
        input: 1,
        lotId: record.lotId,
        packType: record.packType,
        palletLabel: record.palletLabel,
      })),
    );
    message.success($t('gravityFreeMixerTrayInput.loadSuccess'));
    loadGridApi.grid.loadData([...loadList.value]);
    lotGridApi.reload();
  } catch {
    message.error($t('gravityFreeMixerTrayInput.loadFailed'));
  } finally {
    submitting.value = false;
  }
}

/** 卸载：对勾选的装载记录批量卸载 */
async function handleUnload() {
  if (!selectedWorkSheet.value) {
    message.warning($t('gravityFreeMixerTrayInput.plsSelectWorkSheet'));
    return;
  }
  const records = loadGridApi.grid.getCheckboxRecords();
  if (!records?.length) {
    message.warning($t('gravityFreeMixerTrayInput.plsSelectLoadRecord'));
    return;
  }
  submitting.value = true;
  try {
    await palletLoading(
      records.map((record: any) => ({
        input: 2,
        lotId: record.lotId,
        packType: record.packType,
        palletLabel: record.palletLabel,
      })),
    );
    message.success($t('gravityFreeMixerTrayInput.unloadSuccess'));
    // 从本地列表移除已卸载的记录
    const removedSet = new Set(records);
    loadList.value = loadList.value.filter((item) => !removedSet.has(item));
    loadGridApi.grid.loadData([...loadList.value]);
    lotGridApi.reload();
  } catch {
    message.error($t('gravityFreeMixerTrayInput.unloadFailed'));
  } finally {
    submitting.value = false;
  }
}
// endregion

onMounted(() => {
  gridApi.reload();
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- 查询条件 -->
    <Card :title="$t('gravityFreeMixerTrayInput.queryCondition')">
      <Form layout="inline" class="flex flex-wrap gap-2">
        <FormItem :label="$t('gravityFreeMixerTrayInput.indicateDate')">
          <DatePicker
            v-model:value="queryParams.startTime"
            value-format="YYYY-MM-DD"
            :placeholder="
              $t('gravityFreeMixerTrayInput.indicateDatePlaceholder')
            "
            allow-clear
          />
        </FormItem>
        <FormItem :label="$t('gravityFreeMixerTrayInput.lineCode')">
          <Input
            v-model:value="queryParams.lineCode"
            :placeholder="$t('gravityFreeMixerTrayInput.lineCodePlaceholder')"
            allow-clear
          />
        </FormItem>
        <FormItem :label="$t('gravityFreeMixerTrayInput.workSheetCode')">
          <Input
            v-model:value="queryParams.workSheetCode"
            :placeholder="
              $t('gravityFreeMixerTrayInput.workSheetCodePlaceholder')
            "
            allow-clear
          />
        </FormItem>
        <FormItem :label="$t('gravityFreeMixerTrayInput.indicateStatus')">
          <Radio.Group v-model:value="queryParams.state">
            <Radio
              v-for="item in statusOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </Radio>
          </Radio.Group>
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

    <!-- 工单列表 -->
    <Card :title="$t('gravityFreeMixerTrayInput.workSheetList')">
      <Grid>
        <template #toolbar-tools></template>
      </Grid>
    </Card>

    <!-- 左栏批次LOT列表 / 右栏装载列表 -->
    <Row :gutter="16">
      <Col :xs="24" :lg="12">
        <Card :title="$t('gravityFreeMixerTrayInput.lotList')">
          <LotGrid>
            <template #toolbar-tools></template>
            <template #useCell="{ row, column }">
              <Checkbox :checked="Number(row[column.field]) === 1" disabled />
            </template>
          </LotGrid>
        </Card>
      </Col>
      <Col :xs="24" :lg="12">
        <Card :title="$t('gravityFreeMixerTrayInput.loadList')">
          <div class="mb-3 flex flex-wrap items-center gap-2">
            <Input
              v-model:value="inputPalletLabel"
              class="w-56"
              :placeholder="
                $t('gravityFreeMixerTrayInput.palletLabelPlaceholder')
              "
              allow-clear
              @press-enter="handleScanPallet"
            />
          </div>
          <LoadGrid>
            <template #toolbar-tools></template>
          </LoadGrid>
          <div class="mt-3 flex justify-end gap-2">
            <Button :loading="submitting" @click="handleUnload">
              {{ $t('gravityFreeMixerTrayInput.unload') }}
            </Button>
            <Button type="primary" :loading="submitting" @click="handleLoad">
              {{ $t('gravityFreeMixerTrayInput.load') }}
            </Button>
          </div>
        </Card>
      </Col>
    </Row>
  </div>
</template>
