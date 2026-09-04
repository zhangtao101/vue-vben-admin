<script setup lang="ts">
/**
 * [INPUT]: 依赖 vxe-table 适配器（VxeGridProps/useVbenVxeGrid）、#/api 的 searchWorkSheetList/getProductionBomList/checkTagCode/listFeedBySheet 接口，以及 EquipmentSelectDrawer 设备选择抽屉。
 * [OUTPUT]: 对外提供 MaterialLoadingDrawer 材料加载抽屉组件（defineExpose({ open })）。
 * [POS]: 属于包装材料模块的材料加载业务组件，自上而下依次为：工单查询区 → 工单列表 → BOM 列表 + 加载列表。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-09-03 00:00:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { EquipSelectItem } from '#/api';

import { reactive, ref } from 'vue';

import {
  Button,
  Col,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  RangePicker,
  Row,
  Select,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  checkTagCode,
  getProductionBomList,
  listFeedBySheet,
  searchSubLineByProcessCode,
  searchWorkSheetList,
} from '#/api';
import { $t } from '#/locales';
import EquipmentSelectDrawer from '#/util/component/drawers/EquipmentSelectDrawer.vue';

defineOptions({
  name: 'MaterialLoadingDrawer',
});

// ========== 抽屉控制（defineExpose({ open }) 模式） ==========
const show = ref(false);
/** 子产线 ID：open(lineId) 传入，作为工单查询固定条件 */
const lineIdRef = ref<number>();

// ========== 工单查询条件（上方查询区域） ==========
const query = reactive({
  planDateRange: [] as any,
  workSheetCode: '',
});

// ========== 当前选中（联动核心） ==========
/** 当前选中的工单行 */
const currentWorkSheet = ref<any>(null);
/** 当前选中的 BOM 行 */
const currentBom = ref<any>(null);

/** 获取 BOM 行主键（接口返回字段可能是 id 或 productionBomId） */
function getBomId(row: any) {
  return row?.id ?? row?.productionBomId;
}

// ========== 右栏加载表单（子产线代码 / 设备代码 / 标签ID） ==========
const feedQuery = reactive<any>({
  subLineCode: '',
  deviceCode: '',
  tagId: '',
});

/** 设备选择抽屉 ref 与已选设备（恢复选中用） */
const equipmentDrawerRef = ref();
const selectedEquipments = ref<EquipSelectItem[]>([]);

/**
 * 打开设备选择抽屉，并传入已选设备用于恢复选中状态（单选模式）
 * @returns 无返回值
 * @since 2026-09-03
 */
function handleOpenEquipmentSelect() {
  equipmentDrawerRef.value?.open(selectedEquipments.value, true);
}

/**
 * 设备选择回调：保存已选设备并回填设备代码
 * @param rows 设备选择抽屉返回的已选设备列表
 * @returns 无返回值
 * @since 2026-09-03
 */
function handleEquipmentSelect(rows: EquipSelectItem[]) {
  selectedEquipments.value = rows || [];
  feedQuery.deviceCode = rows?.[0]?.equipmentCode ?? '';
}

// ========== 子产线下拉（右栏加载表单） ==========
/** 工序编码：open(processCode) 传入，用于加载子产线下拉选项 */
const processCodeRef = ref('');
/** 子产线下拉选项（label 子产线编码(名称)、value 子产线编码、id 子产线ID） */
const subLineOptions = ref<Array<{ id: any; label: string; value: string }>>(
  [],
);

/**
 * 加载子产线下拉数据：根据工序编码获取子产线列表
 * @returns 无返回值
 * @since 2026-09-03
 */
function loadSubLineOptions() {
  if (!processCodeRef.value) {
    subLineOptions.value = [];
    return;
  }
  return searchSubLineByProcessCode(processCodeRef.value).then((res: any) => {
    const list = res ?? [];
    subLineOptions.value = list.map((item: any) => ({
      label: `${item.subLineCode}(${item.subLineName})`,
      value: item.subLineCode,
      id: item.id,
    }));
  });
}

// ========== ① 工单列表表格（中部，单选） ==========
const workSheetGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50, title: '' },
    {
      field: 'workSheetCode',
      title: $t('workSheetSelect.colWorkSheetCode'),
      minWidth: 170,
    },
    {
      field: 'productName',
      title: $t('workSheetSelect.colProductName'),
      minWidth: 180,
    },
    {
      field: 'productCode',
      title: $t('workSheetSelect.colProductCode'),
      minWidth: 100,
    },
    {
      field: 'planDateStart',
      title: $t('workSheetSelect.colPlanDateStart'),
      minWidth: 110,
    },
    {
      field: 'planDateStop',
      title: $t('workSheetSelect.colPlanDateStop'),
      minWidth: 110,
    },
    {
      field: 'workSheetPlanNumber',
      title: $t('workSheetSelect.colPlanNumber'),
      minWidth: 100,
    },
    {
      field: 'workSheetFinishNumber',
      title: $t('workSheetSelect.colFinishNumber'),
      minWidth: 100,
    },
  ],
  height: 220,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: queryWorkSheetList,
    },
  },
  radioConfig: {
    highlight: true,
    trigger: 'row',
  },
  rowConfig: { keyField: 'workSheetCode' },
  showOverflow: 'tooltip',
  stripe: true,
};

const [WorkSheetGrid, workSheetGridApi] = useVbenVxeGrid({
  gridOptions: workSheetGridOptions,
});

/**
 * 工单表格单选变化事件：切换当前工单并联动刷新 BOM 与加载列表
 * @param row 新选中的工单行
 * @returns 无返回值
 * @since 2026-09-03
 */
function handleWorkSheetChange(row: any) {
  const workSheetCode = row?.workSheetCode;
  if (!workSheetCode) {
    return;
  }
  // 幂等：自动选中与单选事件可能重复触发，同一工单直接返回
  if (currentWorkSheet.value?.workSheetCode === workSheetCode) {
    return;
  }
  currentWorkSheet.value = row;
  // 重置 BOM 选中并刷新 BOM 列表（列表加载后自动选中第一条）
  currentBom.value = null;
  bomGridApi.reload();
}

const workSheetGridEvents: any = {
  radioChange: ({ row }: any) => {
    handleWorkSheetChange(row);
  },
};

/**
 * 查询工单列表：lineId 固定为传入的子产线 ID，isAsc 固定 -1（倒序）
 * @param page 分页信息
 * @param page.currentPage 当前页码
 * @param page.pageSize 每页条数
 * @returns 分页工单列表（items 工单数组、total 总数）
 * @since 2026-09-03
 */
function queryWorkSheetList({ page }: any) {
  const params: any = {
    isAsc: -1,
    pageNum: page.currentPage,
    pageSize: page.pageSize,
  };
  if (lineIdRef.value) {
    params.lineId = lineIdRef.value;
  }
  if (query.planDateRange && query.planDateRange.length === 2) {
    params.planDateStart = query.planDateRange[0];
    params.planDateEnd = query.planDateRange[1];
  }
  if (query.workSheetCode) {
    params.workSheetCode = query.workSheetCode;
  }
  return searchWorkSheetList(params).then((res: any) => {
    const list = res?.results ?? [];
    // 列表有数据且当前选中不在本页时，默认选中第一条并触发联动
    if (list.length > 0) {
      autoSelectWorkSheet(list);
    } else {
      // 无数据时清空选中引用，并刷新下两列表格为空
      currentWorkSheet.value = null;
      currentBom.value = null;
      bomGridApi.reload();
    }
    return { items: list, total: res?.total ?? 0 };
  });
}

/**
 * 工单列表自动选中第一条（数据渲染后执行，手动触发联动兜底）
 * @param list 工单列表
 * @returns 无返回值
 * @since 2026-09-03
 */
function autoSelectWorkSheet(list: any[]) {
  setTimeout(() => {
    const grid = workSheetGridApi.grid;
    if (!grid) {
      return;
    }
    const current = grid.getRadioRecord();
    const hit = list.some(
      (item: any) => item?.workSheetCode === current?.workSheetCode,
    );
    if (!hit) {
      grid.setRadioRow(list[0]);
      // setRadioRow 触发 radioChange 时 handleWorkSheetChange 会被再次调用，内部有幂等处理
      handleWorkSheetChange(list[0]);
    }
  }, 100);
}

// ========== ② BOM 列表表格（左栏，单选） ==========
const bomGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50, title: '' },
    {
      field: 'materialCode',
      title: $t('materialLoadingDrawer.colMaterialCode'),
      minWidth: 110,
    },
    {
      field: 'materialName',
      title: $t('materialLoadingDrawer.colMaterialName'),
      minWidth: 150,
    },
    {
      field: 'bomUseQuantity',
      title: $t('materialLoadingDrawer.colBomQty'),
      minWidth: 90,
    },
    {
      field: 'standardQuantity',
      title: $t('materialLoadingDrawer.colStandardQty'),
      minWidth: 90,
    },
    {
      field: 'alreadyInputQuantity',
      title: $t('materialLoadingDrawer.colInputQty'),
      minWidth: 100,
    },
  ],
  height: 370,
  proxyConfig: {
    ajax: {
      query: queryBomList,
    },
  },
  radioConfig: {
    highlight: true,
    trigger: 'row',
  },
  rowConfig: { keyField: 'materialCode' },
  showOverflow: 'tooltip',
  stripe: true,
};

const [BomGrid, bomGridApi] = useVbenVxeGrid({ gridOptions: bomGridOptions });

/**
 * BOM 表格单选变化事件：切换当前 BOM 并联动刷新加载列表
 * @param row 新选中的 BOM 行
 * @returns 无返回值
 * @since 2026-09-03
 */
function handleBomChange(row: any) {
  const bomId = getBomId(row);
  if (bomId === undefined || bomId === null) {
    return;
  }
  // 幂等：自动选中与单选事件可能重复触发，同一 BOM 直接返回
  if (getBomId(currentBom.value) === bomId) {
    return;
  }
  currentBom.value = row;
  feedGridApi.reload();
}

const bomGridEvents: any = {
  radioChange: ({ row }: any) => {
    handleBomChange(row);
  },
};

/**
 * 查询生产物料清单：按当前选中工单号查询
 * @returns 物料清单分页数据（materialCode 料号、materialName 物料名称、bomUseQuantity BOM用量、standardQuantity 标准用量、alreadyInputQuantity 已投入数量）
 * @since 2026-09-03
 */
function queryBomList() {
  const workSheetCode = currentWorkSheet.value?.workSheetCode;
  if (!workSheetCode) {
    return Promise.resolve({ items: [], total: 0 });
  }
  return getProductionBomList(workSheetCode).then((res: any) => {
    const list = Array.isArray(res) ? res : [];
    if (list.length > 0) {
      autoSelectBom(list);
    } else {
      // 无 BOM 数据时清空选中引用，并刷新加载列表（不带 materialCode 过滤）
      currentBom.value = null;
      feedGridApi.reload();
    }
    return { items: list, total: list.length };
  });
}

/**
 * BOM 列表自动选中第一条（数据渲染后执行，手动触发联动兜底）
 * @param list BOM 列表
 * @returns 无返回值
 * @since 2026-09-03
 */
function autoSelectBom(list: any[]) {
  setTimeout(() => {
    const grid = bomGridApi.grid;
    if (!grid) {
      return;
    }
    const current = grid.getRadioRecord();
    const hit = list.some(
      (item: any) => item?.materialCode === current?.materialCode,
    );
    if (!hit) {
      grid.setRadioRow(list[0]);
      // setRadioRow 触发 radioChange 时 handleBomChange 会被再次调用，内部有幂等处理
      handleBomChange(list[0]);
    }
  }, 100);
}

// ========== ③ 加载列表表格（右栏下方） ==========
const feedGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      field: 'labelCode',
      title: $t('materialLoadingDrawer.colLabelCode'),
      minWidth: 140,
    },
    {
      field: 'materialCode',
      title: $t('materialLoadingDrawer.colMaterialCode'),
      minWidth: 120,
    },
    {
      field: 'materialName',
      title: $t('materialLoadingDrawer.colMaterialName'),
      minWidth: 160,
    },
    {
      field: 'feedNumber',
      title: $t('materialLoadingDrawer.colFeedNumber'),
      minWidth: 100,
    },
    {
      field: 'feedTime',
      title: $t('materialLoadingDrawer.colFeedTime'),
      minWidth: 160,
    },
  ],
  height: 220,
  proxyConfig: {
    ajax: {
      query: queryFeedList,
    },
  },
  showOverflow: 'tooltip',
  stripe: true,
};

const [FeedGrid, feedGridApi] = useVbenVxeGrid({
  gridOptions: feedGridOptions,
});

/**
 * 查询材料加载列表：materialCode 取当前选中 BOM 行的材料代码，workSheetCode 取当前选中工单
 * @returns 材料加载列表（labelCode 标签、materialCode 料号、materialName 物料名称、feedNumber 投入数量、feedTime 投入时间）
 * @since 2026-09-03
 */
function queryFeedList() {
  const workSheetCode = currentWorkSheet.value?.workSheetCode;
  if (!workSheetCode) {
    return Promise.resolve({ items: [], total: 0 });
  }
  const params: any = { workSheetCode };
  if (currentBom.value?.materialCode) {
    params.materialCode = currentBom.value.materialCode;
  }
  return listFeedBySheet(params).then((res: any) => {
    const list = Array.isArray(res) ? res : [];
    return { items: list, total: list.length };
  });
}

// ========== 扫码（标签ID） ==========
/**
 * 标签扫码：调用条码校验接口，成功后清空扫码内容并重新加载加载列表
 * @returns 无返回值，未扫描或未选中 BOM 时弹出警告
 * @since 2026-09-03
 */
function handleScan() {
  const tagCode = feedQuery.tagId?.trim();
  if (!tagCode) {
    message.warning($t('materialLoadingDrawer.scanEmpty'));
    return;
  }
  const productionBomId = getBomId(currentBom.value);
  if (productionBomId === undefined || productionBomId === null) {
    message.warning($t('materialLoadingDrawer.plsSelectBom'));
    return;
  }
  return checkTagCode({ productionBomId, tagCode }).then(() => {
    message.success($t('materialLoadingDrawer.scanSuccess'));
    // 清空扫码内容，便于连续扫码
    feedQuery.tagId = '';
    // 重新加载下方加载列表
    feedGridApi.reload();
  });
}

// ========== 查询 / 重置 ==========
/**
 * 触发工单列表查询
 * @returns 无返回值
 * @since 2026-09-03
 */
function handleQuery() {
  workSheetGridApi.reload();
}

/**
 * 重置工单查询条件并刷新工单列表
 * @returns 无返回值
 * @since 2026-09-03
 */
function handleReset() {
  query.planDateRange = [];
  query.workSheetCode = '';
  workSheetGridApi.reload();
}

// ========== open / 关闭 ==========
/**
 * 打开材料加载抽屉
 * @param context 可选上下文：lineId 子产线ID（工单查询条件）、workSheetCode 目标工单号、subLineCode 子产线代码、deviceCode 设备代码、processCode 工序编码（加载子产线下拉）
 * @returns 无返回值
 * @since 2026-09-03
 */
function open(context?: any) {
  console.log(context);
  lineIdRef.value = context?.lineId;
  processCodeRef.value = context?.processCode ?? '';
  query.planDateRange = [];
  query.workSheetCode = context?.workSheetCode ?? '';
  currentWorkSheet.value = null;
  currentBom.value = null;
  feedQuery.subLineCode = context?.subLineCode ?? '';
  feedQuery.deviceCode = context?.deviceCode ?? '';
  selectedEquipments.value = [];
  feedQuery.tagId = '';
  show.value = true;
  loadSubLineOptions();
  setTimeout(() => {
    workSheetGridApi.reload();
  }, 100);
}

/**
 * 关闭材料加载抽屉并清空所有状态，回到初始状态
 * @returns 无返回值
 * @since 2026-09-03
 */
function handleClose() {
  show.value = false;
  lineIdRef.value = undefined;
  processCodeRef.value = '';
  subLineOptions.value = [];
  query.planDateRange = [];
  query.workSheetCode = '';
  currentWorkSheet.value = null;
  currentBom.value = null;
  feedQuery.subLineCode = '';
  feedQuery.deviceCode = '';
  feedQuery.tagId = '';
  selectedEquipments.value = [];
}

defineExpose({ open });
</script>

<template>
  <Drawer
    v-model:open="show"
    placement="top"
    height="100%"
    :title="$t('materialLoadingDrawer.title')"
    :destroy-on-close="true"
    :footer-style="{ textAlign: 'right' }"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4">
      <!-- ① 查询区域（上）：工单查询条件 -->
      <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
        <Form layout="inline" class="flex-wrap items-end gap-2">
          <FormItem :label="$t('workSheetSelect.planDateRange')">
            <RangePicker
              v-model:value="query.planDateRange"
              value-format="YYYY-MM-DD"
              :placeholder="[
                $t('workSheetSelect.planDateStart'),
                $t('workSheetSelect.planDateEnd'),
              ]"
            />
          </FormItem>
          <FormItem :label="$t('workSheetSelect.workOrder')">
            <Input
              v-model:value="query.workSheetCode"
              :placeholder="$t('workSheetSelect.workOrderPlaceholder')"
              allow-clear
              class="w-44"
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
      </div>

      <!-- ② 工单列表（中）：单选，有数据默认选中第一条并触发联动 -->
      <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
        <div class="font-bold">
          {{ $t('materialLoadingDrawer.workSheetList') }}
        </div>
        <WorkSheetGrid :grid-events="workSheetGridEvents" />
      </div>

      <!-- ③ 下半部分：Row 两栏布局 -->
      <Row :gutter="16">
        <!-- ③.1 左栏：BOM 列表（单选，默认选中第一条） -->
        <Col :xs="24" :lg="12">
          <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
            <div class="mb-2 font-bold">
              {{ $t('materialLoadingDrawer.bomList') }}
            </div>
            <BomGrid :grid-events="bomGridEvents">
              <template #toolbar-tools></template>
            </BomGrid>
          </div>
        </Col>

        <!-- ③.2 右栏：加载列表（上方表单 + 下方表格） -->
        <Col :xs="24" :lg="12">
          <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
            <div class="mb-2 font-bold">
              {{ $t('materialLoadingDrawer.feedList') }}
            </div>
            <Form
              :model="feedQuery"
              class="mb-2"
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 20 }"
            >
              <FormItem
                :label="$t('materialLoadingDrawer.subLineCode')"
                class="mb-2!"
              >
                <Select
                  v-model:value="feedQuery.subLineCode"
                  :options="subLineOptions"
                  :placeholder="$t('materialLoadingDrawer.subLineCode')"
                  allow-clear
                  class="w-full"
                />
              </FormItem>
              <FormItem
                :label="$t('materialLoadingDrawer.deviceCode')"
                class="mb-2!"
              >
                <div class="flex gap-2">
                  <Input
                    v-model:value="feedQuery.deviceCode"
                    :placeholder="
                      $t('materialLoadingDrawer.deviceCodePlaceholder')
                    "
                    disabled
                  />
                  <Button @click="handleOpenEquipmentSelect">
                    {{ $t('materialLoadingDrawer.select') }}
                  </Button>
                </div>
              </FormItem>
              <FormItem
                :label="$t('materialLoadingDrawer.tagId')"
                class="mb-2!"
              >
                <Input
                  v-model:value="feedQuery.tagId"
                  :placeholder="$t('materialLoadingDrawer.tagIdPlaceholder')"
                  allow-clear
                  @press-enter="handleScan"
                />
              </FormItem>
            </Form>
            <FeedGrid>
              <template #toolbar-tools></template>
            </FeedGrid>
          </div>
        </Col>
      </Row>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <Button @click="handleClose">
          {{ $t('materialLoadingDrawer.close') }}
        </Button>
      </div>
    </template>
  </Drawer>

  <!-- 设备选择抽屉 -->
  <EquipmentSelectDrawer
    ref="equipmentDrawerRef"
    @select="handleEquipmentSelect"
  />
</template>
