<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Col,
  DatePicker,
  DropdownButton,
  Form,
  Input,
  Menu,
  MenuItem,
  message,
  Modal,
  Row,
  Space,
  TabPane,
  Tabs,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  queueAddBatch,
  queueDelete,
  queueSearch,
  queueTransfer,
  searchSubLine,
  selectTranseLot,
} from '#/api';
import { $t } from '#/locales';

defineOptions({ name: 'MixedWaterFailedTransfer' });

/**
 * 工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
const props = defineProps({
  functionId: { type: Number, default: 0 },
  workstationCode: { type: String, default: '' },
  /** 工序：由外部传入，混合水暂时固定为 1 */
  processType: { type: Number, default: 1 },
  /** 工序编号，由外部传入 */
  processCode: { type: String, default: '' },
});

const { RangePicker } = DatePicker;

// region 查询条件
// 指示日期默认当前日期起、后 3 个月止
const DEFAULT_DATE_RANGE = () => [dayjs(), dayjs().add(3, 'month')];

const queryParams = ref<any>({
  indicateDateRange: DEFAULT_DATE_RANGE(),
  worksheetCode: '',
  materialProductCode: '',
});

/** 组装左右两表共用的查询参数 */
function buildQueryParams() {
  return {
    startTime: queryParams.value.indicateDateRange?.[0]?.format('YYYY-MM-DD'),
    endTime: queryParams.value.indicateDateRange?.[1]?.format('YYYY-MM-DD'),
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

// endregion
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

// region 左表：可传输工单列表
/** 左表加载方法：selectTranseLot 分页查询 */
async function queryLeftList({ page }: any) {
  try {
    const params = buildQueryParams();
    const res = await selectTranseLot({
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
        .filter((lotId: any) => lotId !== null && lotId !== undefined),
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
  rowClassName: 'ipc-grid-row',
  headerRowClassName: 'ipc-grid-header-row',
  align: 'center',
  border: true,
  columns: [
    {
      field: 'createTime',
      title: $t('mixedWaterFailedTransfer.indicateDate'),
      minWidth: 160,
    },
    {
      field: 'lotCode',
      // lotCode 实为工单号
      title: $t('mixedWaterFailedTransfer.worksheetCode'),
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
    {
      field: 'operation',
      title: $t('mixedWaterFailedTransfer.operation'),
      minWidth: 110,
      fixed: 'right',
      slots: { default: 'moveIn' },
    },
  ],
  height: 500,
  pagerConfig: { enabled: true, pageSize: 20 },
  proxyConfig: {
    ajax: {
      query: queryLeftList,
    },
  },
  stripe: true,
  toolbarConfig: { custom: false, refresh: false, zoom: false },
};

const [LeftGrid, leftGridApi] = useVbenVxeGrid({
  gridOptions: leftGridOptions,
});
// endregion

// region 右表：已选队列列表（多出 顺序 字段）
/** 已选列表最大条目数 */
const MAX_SELECTED_COUNT = 5;
/** 队列状态值说明：1未开始（无背景色）/ 2失败（红）/ 3成功（黄）/ 4完成（绿） */
const STATE_ROW_CLASS_MAP: Record<string, string> = {
  '2': 'row-state-failed',
  '3': 'row-state-success',
  '4': 'row-state-finished',
};

/**
 * 右表行背景色：按行的 state 字段返回对应样式类
 * @param row 当前行数据，取其中的 state 字段判断状态
 * @returns 状态对应的样式类名，1未开始及其它未知状态返回空字符串（保持默认无色）
 */
function getStateRowClass({ row }: any) {
  return `ipc-grid-row ${STATE_ROW_CLASS_MAP[String(row?.state)] ?? ''}`;
}

/** 右表实际数据补足到固定 5 行（不足的以空行占位） */
function padRightList(list: any[] = []) {
  const display = [...(list ?? [])];
  while (display.length < MAX_SELECTED_COUNT) {
    display.push({});
  }
  return display.slice(0, MAX_SELECTED_COUNT);
}

/** 右表加载方法：queueSearch 查询，按 seqNo 放置行位并补足到固定 5 行 */
async function queryRightList() {
  try {
    const res = await queueSearch(buildQueryParams());
    // seqNo 表示行位（seqNo=3 → 第三行，即使前面没有数据），
    // 固定 5 个槽位，无数据的位置补空占位行
    const slots = padRightList([]);
    for (const row of res?.list ?? []) {
      const seq = Number(row?.seqNo);
      if (seq >= 1 && seq <= MAX_SELECTED_COUNT) {
        slots[seq - 1] = row;
      } else {
        // 无有效 seqNo 的行顺次放入第一个空位
        const idx = slots.findIndex((r: any) => isEmptyRightRow(r));
        if (idx >= 0) {
          row.seqNo = idx + 1;
          slots[idx] = row;
        }
      }
    }
    rightData.value = slots;
    return { total: MAX_SELECTED_COUNT, items: slots };
  } catch {
    message.error($t('mixedWaterFailedTransfer.loadFailed'));
    return { total: MAX_SELECTED_COUNT, items: padRightList([]) };
  }
}

const rightGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      type: 'seq',
      title: 'SEQ_NO',
      minWidth: 90,
    },
    {
      field: 'createTime',
      title: $t('mixedWaterFailedTransfer.indicateDate'),
      minWidth: 160,
    },
    {
      field: 'lotCode',
      // lotCode 实为工单号
      title: $t('mixedWaterFailedTransfer.worksheetCode'),
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
    {
      field: 'operation',
      title: $t('mixedWaterFailedTransfer.operation'),
      minWidth: 110,
      fixed: 'right',
      slots: { default: 'moveOut' },
    },
  ],
  height: 500,
  // 固定 5 行展示，不分页
  pagerConfig: { enabled: false },
  proxyConfig: {
    ajax: {
      query: queryRightList,
    },
  },
  // 行背景色随 state 变化，优先级高于斑马纹
  rowClassName: getStateRowClass,
  headerRowClassName: 'ipc-grid-header-row',
  stripe: true,
  toolbarConfig: { custom: false, refresh: false, zoom: false },
};

const [RightGrid, rightGridApi] = useVbenVxeGrid({
  gridOptions: rightGridOptions,
});
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
    // 重置后指示日期回到默认（当前日期起、后 3 个月止）
    indicateDateRange: DEFAULT_DATE_RANGE(),
    worksheetCode: '',
    materialProductCode: '',
  };
  reloadTables();
}

/**
 * 判断右表行是否为空占位行（无任何有效数据）
 * @param row 右表行数据
 * @returns 空占位行返回 true
 */
function isEmptyRightRow(row: any) {
  return !row?.lotId && !row?.lotCode;
}

/**
 * 移入：将左表当前行直接替换到右表的指定位置（=>1 ~ =>5 对应第 1~5 条）。
 * 目标位置已有数据时弹出确认框，用户确认后替换；替换后该行从左表当前页移除
 * （重新查询时会按右表队列自动过滤）。
 * @param row 左表当前行
 * @param pos 目标位置（1~5）
 */
function handleMoveIn(row: any, pos: any) {
  const position = Number(pos);
  if (!row?.id) {
    return;
  }
  const doReplace = () => {
    const newRow = {
      ...row,
      lotId: row.id,
      id: undefined,
      seqNo: position,
    };
    const actual = [...(rightData.value ?? [])];
    // 目标位置若超出当前实际数据长度，先用空占位行补齐再替换
    while (actual.length < position - 1) {
      actual.push({});
    }
    actual[position - 1] = newRow;
    rightData.value = actual;
    rightGridApi.grid.loadData(padRightList(actual));
    // 从左表当前页移除该行
    leftGridApi.grid.loadData(
      (leftGridApi.grid.getTableData().fullData ?? []).filter(
        (item: any) => (item.id ?? item.lotId) !== row.id,
      ),
    );
  };
  const target = rightData.value?.[position - 1];
  // 目标位置为空占位行时直接替换，否则需用户确认
  if (isEmptyRightRow(target)) {
    doReplace();
    return;
  }
  Modal.confirm({
    content: $t('mixedWaterFailedTransfer.replaceConfirm'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    okType: 'danger',
    onOk: doReplace,
  });
}

/**
 * 移出：清除右表当前行数据并移回左表。
 * 有 id 的行（已保存的队列记录）调用删除接口删除；无 id 的行（仅前端添加）直接移除。
 * 移出后右表该行变为空占位行（固定 5 行不变）。
 * @param row 右表当前行
 */
function handleMoveOut(row: any) {
  if (isEmptyRightRow(row)) {
    return;
  }
  if (row.id !== null && row.id !== undefined) {
    // 已保存的队列记录：调用删除接口
    queueDelete([row.id])
      .then(async () => {
        message.success($t('mixedWaterFailedTransfer.deleteSuccess'));
        await rightGridApi.reload();
        leftGridApi.reload();
      })
      .catch(() => {
        message.error($t('mixedWaterFailedTransfer.deleteFailed'));
      });
    return;
  }
  // 未保存的临时行：将该槽位置为空占位（保持后续行行位不变）
  rightData.value = (rightData.value ?? []).map((item: any) =>
    (item.id ?? item.lotId) === (row.id ?? row.lotId) ? {} : item,
  );
  rightGridApi.grid.loadData(padRightList(rightData.value));
  leftGridApi.reload();
}

// 保存右侧队列（调用后端保存队列接口）
function handleSave() {
  // 过滤右表空占位行后再提交
  const rows: any[] = (rightData.value ?? []).filter(
    (row: any) => !isEmptyRightRow(row),
  );
  if (rows.length === 0) {
    message.warning($t('mixedWaterFailedTransfer.plsSelectRight'));
    return;
  }
  const line = lineTabs.value.find((l) => l.key === activeLine.value);

  const data = rows.map((row) => ({
    id: row.id,
    lineName: line.label,
    lineCode: line.key,
    lotCode: row.lotCode ?? '',
    lotId: row.lotId,
    processType: props.processType,
    productCode: row.productCode ?? '',
    productName: row.productName ?? '',
    seqNo: row.seqNo,
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

/**
 * 设备传输：将右表中不为空的数据提交传输接口，成功后刷新左右两表。
 * @returns {void} 无返回值。
 * @since 2026-11-17
 */
function handleDeviceTransfer() {
  // 过滤右表空占位行后再提交
  const rows: any[] = (rightData.value ?? []).filter(
    (row: any) => !isEmptyRightRow(row),
  );
  if (rows.length === 0) {
    message.warning($t('mixedWaterFailedTransfer.plsSelectRight'));
    return;
  }
  const line = lineTabs.value.find((l) => l.key === activeLine.value);
  const data = rows.map((row) => ({
    id: row.id,
    lineName: line?.label ?? '',
    lineCode: line?.key ?? '',
    lotCode: row.lotCode ?? '',
    lotId: row.lotId,
    processType: props.processType,
    productCode: row.productCode ?? '',
    productName: row.productName ?? '',
    seqNo: row.seqNo,
  }));
  queueTransfer(data)
    .then(async () => {
      message.success($t('mixedWaterFailedTransfer.transferSuccess'));
      await rightGridApi.reload();
      leftGridApi.reload();
    })
    .catch(() => {
      message.error($t('mixedWaterFailedTransfer.transferFailed'));
    });
}
// endregion

onMounted(() => {
  // 产线查询仅页面加载时执行一次
  loadLineTabs();
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 查询条件 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <Form layout="inline" class="flex-wrap items-end gap-2">
        <Form.Item :label="$t('mixedWaterFailedTransfer.indicateDate')">
          <RangePicker v-model:value="queryParams.indicateDateRange" />
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
        <TabPane v-for="tab in lineTabs" :key="tab.key" :tab="tab.label" />
      </Tabs>

      <Row :gutter="16" class="items-stretch">
        <!-- 左：待传输列表（操作列：移入组合按钮） -->
        <Col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
          <div class="mb-2 font-bold">
            {{ $t('mixedWaterFailedTransfer.pendingList') }}
          </div>
          <LeftGrid>
            <template #toolbar-tools></template>
            <template #moveIn="{ row }">
              <!-- 组合按钮：自带下尖括号图标，主按钮无点击功能，子按钮 =>1~=>5 对应右表第 1~5 条位置 -->
              <DropdownButton size="small" type="primary">
                {{ $t('mixedWaterFailedTransfer.moveIn') }}
                <template #overlay>
                  <Menu @click="({ key }: any) => handleMoveIn(row, key)">
                    <MenuItem v-for="n in 5" :key="n">
                      <Icon
                        icon="mdi:arrow-right-bottom"
                        class="mr-1 inline-block align-middle"
                      />
                      {{ n }}
                    </MenuItem>
                  </Menu>
                </template>
              </DropdownButton>
            </template>
          </LeftGrid>
        </Col>

        <!-- 右：已选队列（固定 5 行，操作列：移出） -->
        <Col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
          <div class="mb-2 font-bold">
            {{ $t('mixedWaterFailedTransfer.selectedList') }}
          </div>
          <RightGrid>
            <template #toolbar-tools></template>
            <template #moveOut="{ row }">
              <Button
                v-if="!isEmptyRightRow(row)"
                size="small"
                danger
                @click="handleMoveOut(row)"
              >
                {{ $t('mixedWaterFailedTransfer.moveOut') }}
              </Button>
            </template>
          </RightGrid>
        </Col>
      </Row>

      <!-- 底部：保存 / 设备传输，右对齐 -->
      <div class="mt-3 flex justify-end gap-2">
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

<style scoped>
/* 队列状态行背景色（需覆盖斑马纹，故使用 !important） */
:deep(.row-state-failed),
:deep(.row-state-failed) > td {
  background-color: rgb(255 77 79 / 25%) !important;
}

:deep(.row-state-success),
:deep(.row-state-success) > td {
  background-color: rgb(250 204 21 / 35%) !important;
}

:deep(.row-state-finished),
:deep(.row-state-finished) > td {
  background-color: rgb(82 196 26 / 25%) !important;
}
</style>
