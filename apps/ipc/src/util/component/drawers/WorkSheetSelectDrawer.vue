<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { reactive, ref } from 'vue';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  RangePicker,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { searchWorkSheetList } from '#/api';
import { $t } from '#/locales';

defineOptions({ name: 'WorkSheetSelectDrawer' });

// Emits：选中工单后回传完整工单数据
const emit = defineEmits<{
  select: [row: any];
}>();

// ========== 抽屉控制 ==========
// 抽屉内部可见性状态：由 open 方法控制
const show = ref(false);
/** 子产线 ID：由 open(lineId) 传入，作为查询固定条件 */
const lineIdRef = ref<number>();

// ========== 查询条件 ==========
const query = reactive({
  planDateRange: [] as any,
  workSheetCode: '',
});

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
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
    {
      field: 'status',
      title: $t('workSheetSelect.colStatus'),
      minWidth: 90,
      formatter: ({ cellValue }) => formatStatus(cellValue),
    },
  ],
  height: 420,
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
  rowConfig: { keyField: 'id' },
  showOverflow: 'tooltip',
  stripe: true,
};

const [WorkSheetGrid, workSheetGridApi] = useVbenVxeGrid({ gridOptions });

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
    lineId: lineIdRef.value,
    pageNum: page.currentPage,
    pageSize: page.pageSize,
  };
  if (query.planDateRange && query.planDateRange.length === 2) {
    params.planDateStart = query.planDateRange[0];
    params.planDateEnd = query.planDateRange[1];
  }
  if (query.workSheetCode) {
    params.workSheetCode = query.workSheetCode;
  }
  return searchWorkSheetList(params).then((res: any) => ({
    items: res?.results ?? [],
    total: res?.total ?? 0,
  }));
}

/**
 * 状态显示格式化
 * @param cellValue 状态值：-1 未开始、1 进行中、2 已完成
 * @returns 状态文案
 * @since 2026-09-03
 */
function formatStatus(cellValue: number) {
  if (cellValue === -1) {
    return $t('workSheetSelect.statusNotStarted');
  }
  if (cellValue === 1) {
    return $t('workSheetSelect.statusRunning');
  }
  if (cellValue === 2) {
    return $t('workSheetSelect.statusFinished');
  }
  return '-';
}

// ========== open 方法 ==========
/**
 * 打开工单选择抽屉，并重置查询条件后加载工单列表
 * @param lineId 子产线 ID（查询固定条件）
 * @since 2026-09-03
 */
function open(lineId: number) {
  lineIdRef.value = lineId;
  show.value = true;
  query.planDateRange = [];
  query.workSheetCode = '';
  setTimeout(() => {
    workSheetGridApi.reload();
  }, 200);
}

defineExpose({ open });

// ========== 查询 ==========
/**
 * 触发查询操作，刷新工单列表
 * @since 2026-09-03
 */
function handleQuery() {
  workSheetGridApi.reload();
}

// ========== 重置 ==========
/**
 * 重置查询参数并刷新工单列表
 * @since 2026-09-03
 */
function handleReset() {
  query.planDateRange = [];
  query.workSheetCode = '';
  workSheetGridApi.reload();
}

// ========== 关闭抽屉 ==========
/**
 * 关闭抽屉并清空查询条件，回到初始状态
 * @since 2026-09-03
 */
function handleClose() {
  show.value = false;
  query.planDateRange = [];
  query.workSheetCode = '';
}

// ========== 确认选中 ==========
/**
 * 确认选中工单，触发 select 事件回传工单数据并关闭抽屉
 * @since 2026-09-03
 */
function handleConfirm() {
  const selectedRow = workSheetGridApi.grid?.getRadioRecord();
  if (!selectedRow) {
    message.warning($t('workSheetSelect.plsSelect'));
    return;
  }
  emit('select', selectedRow);
  handleClose();
}
</script>

<template>
  <Drawer
    v-model:open="show"
    :title="$t('workSheetSelect.title')"
    width="900"
    :destroy-on-close="true"
    :footer-style="{ textAlign: 'right' }"
    @close="handleClose"
  >
    <!-- 查询区域 -->
    <Form layout="inline" class="mb-3 flex-wrap items-end gap-2">
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
          <Button @click="handleReset">{{ $t('common.reset') }}</Button>
        </Space>
      </FormItem>
    </Form>

    <!-- 工单表格 -->
    <WorkSheetGrid>
      <!-- 抽屉内使用 VxeTable 时必须保留的空插槽 -->
      <template #toolbar-tools></template>
    </WorkSheetGrid>

    <!-- 底部按钮 -->
    <template #footer>
      <Space>
        <Button @click="handleClose">{{ $t('common.cancel') }}</Button>
        <Button type="primary" @click="handleConfirm">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
