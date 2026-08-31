<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Row,
  Space,
  TabPane,
  Tabs,
} from 'ant-design-vue';

import {
  useVbenVxeGrid,
  type VxeGridProps,
} from '#/adapter/vxe-table';
import {
  queueAddBatch,
  queueDelete,
  queueSearch,
  searchSubLine,
  selectNoTranseLot,
} from '#/api';
import { $t } from '#/locales';

defineOptions({ name: 'MixedWaterFailedTransfer' });

/**
 * 工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
const props = defineProps({
  functionId: { type: Number, default: 0 },
  bindingId: { type: Number, default: 0 },
  worksheetCode: { type: String, default: '' },
  equipCode: { type: String, default: '' },
  workstationCode: { type: String, default: '' },
  /** 工序：由外部传入，混合水暂时固定为 1 */
  processType: { type: Number, default: 1 },
});

const { RangePicker } = DatePicker;

// region 查询条件
const queryParams = ref<any>({
  indicateDateRange: [],
  worksheetCode: '',
  materialProductCode: '',
});

/** 组装左右两表共用的查询参数 */
function buildQueryParams() {
  return {
    startTime: queryParams.value.indicateDateRange?.[0],
    endTime: queryParams.value.indicateDateRange?.[1],
    lineCode: activeLine.value || undefined,
    productCode: queryParams.value.materialProductCode,
    workSheetCode: queryParams.value.worksheetCode,
    processType: props.processType,
  };
}

/** 右表数据源：与右表加载/移动同步维护，供左表过滤已入队列的 lot */
const rightData = ref<any[]>([]);
// endregion

// region 产线 tabs（页面加载时查询一次）
const lineTabs = ref<any[]>([]);
const activeLine = ref<string>('');
/** 产线查询完成后再渲染表格区域，避免在 lineCode 为空时提前加载 */
const lineTabsLoaded = ref(false);

// 布局判断：xs/sm/md（< lg，约 < 992px）下列子列堆叠为上下排列，
// 此时“左移/右移”实际是“上移/下移”，箭头需切换为 ↓ / ↑
const isStacked = ref(false);
function updateLayout() {
  isStacked.value = window.innerWidth < 992;
}

/** 加载产线 tabs：仅页面加载时执行一次 */
function loadLineTabs() {
  return searchSubLine({ processType: props.processType })
    .then((res: any) => {
      const list = res?.list ?? [];
      lineTabs.value = list.map((item: any) => ({
        key: item.subLineCode,
        label: item.subLineName,
      }));
      if (lineTabs.value.length > 0) {
        activeLine.value = lineTabs.value[0].key;
      }
    })
    .catch(() => {
      message.error($t('mixedWaterFailedTransfer.subLineLoadFailed'));
    })
    .finally(() => {
      lineTabsLoaded.value = true;
    });
}
// endregion

// region 左表：待传输列表（可进行托盘变更的 lot）
/** 左表加载方法：selectNoTranseLot 分页查询 */
async function queryLeftList({ page }: any) {
  try {
    const params = buildQueryParams();
    delete params.lineCode;
    const res = await selectNoTranseLot({
      ...params,
      pageNum: page.currentPage,
      pageSize: page.pageSize,
    });
    // 过滤已在右表（队列）中的 lot：
    // 右表行的 id 可能为 null（从左侧移入、尚未保存的临时行），
    // 但 lotId 一定有值，故统一用「左表行 id === 右表行 lotId」关联
    const rightLotIds = new Set(
      (rightData.value ?? [])
        .map((r: any) => r.lotId)
        .filter((lotId: any) => lotId != null),
    );
    const filtered = (res?.list ?? []).filter(
      (row: any) => !rightLotIds.has(row.id),
    );
    return { total: res?.total || 0, items: filtered };
  } catch {
    message.error($t('mixedWaterFailedTransfer.loadFailed'));
    return { total: 0, items: [] };
  }
}

const leftGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    {
      field: 'lotCode',
      title: $t('mixedWaterFailedTransfer.lotCode'),
      minWidth: 170,
    },
    {
      field: 'priority',
      title: $t('mixedWaterFailedTransfer.priority'),
      minWidth: 80,
    },
    {
      field: 'productCode',
      title: $t('mixedWaterFailedTransfer.productCode'),
      minWidth: 120,
    },
    {
      field: 'productName',
      title: $t('mixedWaterFailedTransfer.productName'),
      minWidth: 140,
    },
  ],
  height: 360,
  pagerConfig: { enabled: true, pageSize: 20 },
  proxyConfig: {
    ajax: {
      query: queryLeftList,
    },
  },
  stripe: true,
  checkboxConfig: { highlight: true, range: true },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [LeftGrid, leftGridApi] = useVbenVxeGrid({ gridOptions: leftGridOptions });
// endregion

// region 右表：已选队列列表（多出 顺序 字段）
/** 右表加载方法：queueSearch 分页查询 */
async function queryRightList({ page }: any) {
  try {
    const res = await queueSearch({
      ...buildQueryParams(),
      pageNum: page.currentPage,
      pageSize: page.pageSize,
    });
    const list = res?.list ?? [];
    rightData.value = list;
    return { total: res?.total || 0, items: list };
  } catch {
    message.error($t('mixedWaterFailedTransfer.loadFailed'));
    return { total: 0, items: [] };
  }
}

const rightGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  rowConfig: {
    drag: true
  },
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    {
      type: 'seq',
      title: '#',
      minWidth: 80,
      dragSort: true,
    },
    {
      field: 'lotCode',
      title: $t('mixedWaterFailedTransfer.lotCode'),
      minWidth: 170,
    },
    {
      field: 'productCode',
      title: $t('mixedWaterFailedTransfer.productCode'),
      minWidth: 120,
    },
    {
      field: 'productName',
      title: $t('mixedWaterFailedTransfer.productName'),
      minWidth: 140,
    },
  ],
  height: 360,
  pagerConfig: { enabled: true, pageSize: 20 },
  proxyConfig: {
    ajax: {
      query: queryRightList,
    },
  },
  stripe: true,
  checkboxConfig: { highlight: true, range: true },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [RightGrid, rightGridApi] = useVbenVxeGrid({ gridOptions: rightGridOptions });
// endregion

// region 数据加载与转移
/** 同时刷新左右两表 */
function reloadTables() {
  leftGridApi.reload();
  rightGridApi.reload();
}

// 切换产线 tab：重新加载左右两表
function handleTabChange() {
  reloadTables();
}

function handleQuery() {
  reloadTables();
}

function handleReset() {
  queryParams.value = {
    indicateDateRange: [],
    worksheetCode: '',
    materialProductCode: '',
  };
  reloadTables();
}

// 选中行从左侧移到右侧
function handleMoveRight() {
  const records: any[] = leftGridApi.grid.getCheckboxRecords() as any[];
  if (!records || records.length === 0) {
    message.warning($t('mixedWaterFailedTransfer.plsSelectLeft'));
    return;
  }
  const newRows = records.map((record, index) => ({
    ...record,
    lotId: record.id,
    id: undefined,
    seqNo: (rightData.value?.length ?? 0) + index + 1,
  }));
  rightData.value = [...(rightData.value ?? []), ...newRows];
  rightGridApi.grid.loadData([...rightData.value]);
  const removeSet = new Set(records.map((r) => r.id ?? r.lotId));
  leftGridApi.grid.loadData(
    (leftGridApi.grid.getTableData().fullData ?? []).filter(
      (row: any) => !removeSet.has(row.id ?? row.lotId),
    ),
  );
}

// 选中行从右侧移回左侧
// 有 id 的行（已保存的队列记录）直接调用删除接口删除；无 id 的行（仅前端添加）直接移除。
// 之后重新加载左表，左表会自动过滤仍在右表队列中的 lot。
function handleMoveLeft() {
  const records: any[] = rightGridApi.grid.getCheckboxRecords() as any[];
  if (!records || records.length === 0) {
    message.warning($t('mixedWaterFailedTransfer.plsSelectRight'));
    return;
  }
  // 区分已保存（有 id）与未保存（无 id）的行
  const savedRecords = records.filter((r) => r.id != null);
  const tempRecords = records.filter((r) => r.id == null);

  // 无 id 的临时行直接从右表前端数据中移除
  if (tempRecords.length > 0) {
    const tempKeys = new Set(tempRecords.map((r) => r.id ?? r.lotId));
    rightData.value = (rightData.value ?? []).filter(
      (row: any) => !tempKeys.has(row.id ?? row.lotId),
    );
    rightGridApi.grid.loadData([...rightData.value]);
  }

  if (savedRecords.length > 0) {
    // 有 id：调用删除接口直接删除
    queueDelete(savedRecords.map((r) => r.id))
      .then(async () => {
        message.success($t('mixedWaterFailedTransfer.deleteSuccess'));
        await rightGridApi.reload();
        leftGridApi.reload();
      })
      .catch(() => {
        message.error($t('mixedWaterFailedTransfer.deleteFailed'));
      });
  } else {
    // 无 id：直接重新加载左边表格
    leftGridApi.reload();
  }
}

// 保存右侧队列（调用后端保存队列接口）
function handleSave() {
  const rightData: any[] = rightGridApi.grid.getTableData().fullData ?? [];
  if (rightData.length === 0) {
    message.warning($t('mixedWaterFailedTransfer.plsSelectRight'));
    return;
  }
  const line = lineTabs.value.find(l => l.key === activeLine.value);

  const data = rightData.map((row, index) => ({
    id: row.id,
    lineName: line.label,
    lineCode: line.code,
    lotCode: row.lotCode ?? '',
    lotId: row.lotId,
    processType: props.processType,
    productCode: row.productCode ?? '',
    productName: row.productName ?? '',
    seqNo: index + 1,
  }));
  queueAddBatch(data)
    .then(async () => {
      message.success($t('mixedWaterFailedTransfer.saveSuccess'));
      await rightGridApi.reload();
      leftGridApi.reload();
    })
    .catch(() => {
      message.error($t('mixedWaterFailedTransfer.saveFailed'));
    });
}

function handleDeviceTransfer() {
  message.success($t('mixedWaterFailedTransfer.transferSuccess'));
}
// endregion

onMounted(() => {
  updateLayout();
  window.addEventListener('resize', updateLayout);
  // 产线查询仅页面加载时执行一次
  loadLineTabs();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateLayout);
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- 查询条件 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <Form layout="inline" class="flex-wrap items-end gap-2">
        <Form.Item :label="$t('mixedWaterFailedTransfer.indicateDate')">
          <RangePicker
            v-model:value="queryParams.indicateDateRange"
            value-format="YYYY-MM-DD"
          />
        </Form.Item>
        <Form.Item :label="$t('mixedWaterFailedTransfer.worksheetCode')">
          <Input
            v-model:value="queryParams.worksheetCode"
            :placeholder="$t('mixedWaterFailedTransfer.worksheetPlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('mixedWaterFailedTransfer.materialProductCode')">
          <Input
            v-model:value="queryParams.materialProductCode"
            :placeholder="
              $t('mixedWaterFailedTransfer.materialProductCodePlaceholder')
            "
            allow-clear
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" @click="handleQuery">
              {{ $t('common.query') }}
            </Button>
            <Button @click="handleReset">
              {{ $t('common.reset') }}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>

    <!-- 产线 tabs + 左右转移区（产线查询完成后渲染） -->
    <div
      v-if="lineTabsLoaded"
      class="rounded-lg border border-border bg-card p-3 shadow-sm"
    >
      <Tabs v-model:active-key="activeLine" @change="handleTabChange">
        <TabPane
          v-for="tab in lineTabs"
          :key="tab.key"
          :tab="tab.label"
        />
      </Tabs>

      <Row :gutter="16" class="items-stretch">
        <!-- 左：待传输列表 -->
        <Col :xs="24" :sm="24" :md="24" :lg="11" :xl="11">
          <div class="mb-2 font-bold">
            {{ $t('mixedWaterFailedTransfer.pendingList') }}
          </div>
          <LeftGrid>
            <template #toolbar-tools></template>
          </LeftGrid>
        </Col>

        <!-- 中：上下排列的左右箭头 -->
        <Col
          :xs="24"
          :sm="24"
          :md="24"
          :lg="2"
          :xl="2"
          class="flex! justify-center"
          :class="{ 'flex-col ': !isStacked }"
        >
          <div class="flex items-center gap-3" :class="{ 'flex-col': !isStacked }">
            <Button
              shape="circle"
              type="primary"
              :title="$t('mixedWaterFailedTransfer.moveRight')"
              @click="handleMoveRight"
            >
              {{ isStacked ? '↓' : '→' }}
            </Button>
            <Button
              shape="circle"
              :title="$t('mixedWaterFailedTransfer.moveLeft')"
              @click="handleMoveLeft"
            >
              {{ isStacked ? '↑' : '←' }}
            </Button>
          </div>
        </Col>

        <!-- 右：已选列表 -->
        <Col :xs="24" :sm="24" :md="24" :lg="11" :xl="11">
          <div class="mb-2 font-bold">
            {{ $t('mixedWaterFailedTransfer.selectedList') }}
          </div>
          <RightGrid>
            <template #toolbar-tools></template>
          </RightGrid>
        </Col>
      </Row>

      <!-- 底部：删除 / 保存 / 设备传输，右对齐 -->
      <div class="mt-3 flex justify-end gap-2">
        <Button @click="handleMoveLeft">
          {{ $t('mixedWaterFailedTransfer.delete') }}
        </Button>
        <Button @click="handleSave">
          {{ $t('mixedWaterFailedTransfer.save') }}
        </Button>
        <Button type="primary" @click="handleDeviceTransfer">
          {{ $t('mixedWaterFailedTransfer.deviceTransfer') }}
        </Button>
      </div>
    </div>
  </div>
</template>
