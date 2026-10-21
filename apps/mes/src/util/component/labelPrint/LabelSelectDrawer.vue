<script lang="ts" setup>
/**
 * [INPUT]: 依赖 #/api (fetchLabelDetailList)、#/locales ($t)
 * [OUTPUT]: 对外暴露 open(selectedRow?) 方法，选中后通过 emit('select', row) 返回单条标签数据
 * [POS]: 属于 labelPrint 模块的标签选择抽屉，供其他模块（如线边仓任务维护）选择标签使用
 * [PROTOCOL]: 变更时更新此头部
 * [TIME]: 2026-10-21 10:00:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, reactive, ref } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  FormItem,
  Input,
  message,
  Row,
  Space,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { fetchLabelDetailList } from '#/api';
import { $t } from '#/locales';

defineOptions({ name: 'LabelSelectDrawer' });

const emit = defineEmits<{
  select: [row: any];
}>();

// region 状态定义

// 抽屉是否显示，由 open 方法控制
const show = ref(false);

// 已选中行，用于数据加载完成后恢复单选状态
const selectedRow = ref<any>(null);

// 查询参数
const queryParams = reactive({
  materialCode: undefined as string | undefined,
  materialName: undefined as string | undefined,
  manufacturerName: undefined as string | undefined,
  recordDateStart: undefined as string | undefined,
  recordDateEnd: undefined as string | undefined,
  inspectionDateStart: undefined as string | undefined,
  inspectionDateEnd: undefined as string | undefined,
});

// 任务类型：1=上架，-1=下架；由 open 传入，决定标签状态范围
const taskType = ref<number>(1);

// 上架可取：3=已入库、4=已出库
const ON_SHELF_STATUS = ['3', '4'];
// 下架可取：3=已入库
const OFF_SHELF_STATUS = ['3'];

// 生成日期区间
const queryDateRange = ref<[string, string] | undefined>(undefined);
// 送检日期区间
const inspectionDateRange = ref<[string, string] | undefined>(undefined);

// 状态文案映射
const statusMap: Record<number, string> = {
  1: $t('storeManagement.labelPrint.pendingInspection'),
  2: $t('storeManagement.labelPrint.pendingWarehouse'),
  3: $t('storeManagement.labelPrint.warehoused'),
  4: $t('storeManagement.labelPrint.outOfStock'),
  5: $t('storeManagement.labelPrint.pendingReturn'),
  6: $t('storeManagement.labelPrint.returned'),
  7: $t('storeManagement.labelPrint.inTransfer'),
  8: $t('storeManagement.labelPrint.pendingReturnWarehouse'),
};

// 状态颜色映射
const statusColorMap: Record<number, string> = {
  1: 'orange',
  2: 'blue',
  3: 'green',
  4: 'cyan',
  5: 'red',
  6: 'default',
  7: 'purple',
  8: 'magenta',
};

// endregion

// region 表格配置

// 单选列 + 与标签查询保持一致的列定义
const columns: any[] = [
  { type: 'radio', width: 55 },
  {
    field: 'printTimes',
    title: $t('storeManagement.labelPrint.printTimes'),
    minWidth: 80,
  },
  {
    field: 'status',
    title: $t('storeManagement.labelPrint.status'),
    minWidth: 80,
    slots: { default: 'status' },
  },
  {
    field: 'createDate',
    title: $t('storeManagement.labelPrint.createDate'),
    minWidth: 120,
  },
  {
    field: 'labelCode',
    title: $t('storeManagement.labelPrint.labelCode'),
    minWidth: 180,
  },
  {
    field: 'materialCode',
    title: $t('storeManagement.labelPrint.materialCode'),
    minWidth: 120,
  },
  {
    field: 'materialName',
    title: $t('storeManagement.labelPrint.materialName'),
    minWidth: 200,
  },
  { field: 'unit', title: $t('storeManagement.labelPrint.unit'), minWidth: 80 },
  {
    field: 'labelNumber',
    title: $t('storeManagement.labelPrint.labelNumber'),
    minWidth: 100,
  },
  {
    field: 'packageNumber',
    title: $t('storeManagement.labelPrint.packageNumber'),
    minWidth: 100,
  },
  {
    field: 'toEnterNumber',
    title: $t('storeManagement.labelPrint.toEnterNumber'),
    minWidth: 100,
  },
  {
    field: 'toRejectNumber',
    title: $t('storeManagement.labelPrint.toRejectNumber'),
    minWidth: 100,
  },
  {
    field: 'enterWarehouseNumber',
    title: $t('storeManagement.labelPrint.enterWarehouseNumber'),
    minWidth: 100,
  },
  {
    field: 'rejectNumber',
    title: $t('storeManagement.labelPrint.rejectNumber'),
    minWidth: 100,
  },
  {
    field: 'purchasePlanCode',
    title: $t('storeManagement.labelPrint.purchasePlanCode'),
    minWidth: 120,
  },
  {
    field: 'contractCode',
    title: $t('storeManagement.labelPrint.contractCode'),
    minWidth: 120,
  },
  {
    field: 'formType',
    title: $t('storeManagement.labelPrint.formType'),
    minWidth: 100,
  },
  {
    field: 'manufacturerName',
    title: $t('storeManagement.labelPrint.manufacturerName'),
    minWidth: 150,
  },
  {
    field: 'produceDate',
    title: $t('storeManagement.labelPrint.produceDate'),
    minWidth: 120,
  },
  {
    field: 'validDate',
    title: $t('storeManagement.labelPrint.validDate'),
    minWidth: 120,
  },
  {
    field: 'batchCode',
    title: $t('storeManagement.labelPrint.batchCode'),
    minWidth: 180,
  },
];

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns,
  height: 400,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryList({
          page: page?.currentPage,
          pageSize: page?.pageSize,
        });
      },
    },
  },
  // 单选配置：点击整行即可选中，选中行高亮
  radioConfig: {
    highlight: true,
    trigger: 'row',
  },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    custom: false,
    refresh: false,
    zoom: false,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// endregion

// region 方法定义

/**
 * 取当前任务类型对应的标签状态列表
 * @returns {string[]} 上架返回已入库、已出库；下架返回待入库
 * @since 2026-10-21 10:00:00
 */
function getStatusList() {
  return taskType.value === 1 ? ON_SHELF_STATUS : OFF_SHELF_STATUS;
}

/**
 * 分页查询标签明细列表
 * @param {any} param 分页参数 { page, pageSize }
 * @returns {Promise<{ total: number; items: any[] }>} 分页结果
 * @since 2026-10-21 10:00:00
 */
function queryList({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams,
      statusList: getStatusList().join(','),
      pageNum: page,
      pageSize,
    };
    fetchLabelDetailList(params)
      .then(({ total, list }: any) => {
        resolve({ total: total || 0, items: list || [] });
        // 数据加载完成后恢复已选中的行
        restoreSelection();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 数据加载完成后按 id 恢复单选状态
 * @since 2026-10-21 10:00:00
 */
function restoreSelection() {
  if (!selectedRow.value) {
    return;
  }
  setTimeout(() => {
    const grid: any = (gridApi as any).grid;
    if (!grid) {
      return;
    }
    const target = (grid.getData() || []).find(
      (item: any) => item.id === selectedRow.value?.id,
    );
    if (target && grid.setRadioRow) {
      grid.setRadioRow(target);
    }
  }, 100);
}

/**
 * 查询：将日期区间写入查询参数后刷新表格
 * @since 2026-10-21 10:00:00
 */
function handleQuery() {
  queryParams.recordDateStart = queryDateRange.value?.[0];
  queryParams.recordDateEnd = queryDateRange.value?.[1];
  queryParams.inspectionDateStart = inspectionDateRange.value?.[0];
  queryParams.inspectionDateEnd = inspectionDateRange.value?.[1];
  gridApi.reload();
}

/**
 * 重置查询条件并刷新表格
 * @since 2026-10-21 10:00:00
 */
function handleReset() {
  resetQuery();
  gridApi.reload();
}

/**
 * 清空查询条件（不触发查询），供关闭抽屉时复位
 * @since 2026-10-21 10:00:00
 */
function resetQuery() {
  queryParams.materialCode = undefined;
  queryParams.materialName = undefined;
  queryParams.manufacturerName = undefined;
  queryParams.recordDateStart = undefined;
  queryParams.recordDateEnd = undefined;
  queryParams.inspectionDateStart = undefined;
  queryParams.inspectionDateEnd = undefined;
  queryDateRange.value = undefined;
  inspectionDateRange.value = undefined;
}

/**
 * 确认选择：未选择时提示，选中后抛出选中行并关闭抽屉
 * @since 2026-10-21 10:00:00
 */
function handleConfirm() {
  const record = (gridApi as any).grid?.getRadioRecord?.();
  if (!record) {
    message.warning($t('storeManagement.labelPrint.selectLabelTip'));
    return;
  }
  emit('select', record);
  handleClose();
}

/**
 * 关闭抽屉并清空查询条件与选中状态
 * @since 2026-10-21 10:00:00
 */
function handleClose() {
  show.value = false;
  selectedRow.value = null;
  resetQuery();
  const grid: any = (gridApi as any).grid;
  if (grid && grid.clearRadioRow) {
    grid.clearRadioRow();
  }
}

/**
 * 打开抽屉
 * @param {any} row 已选中的标签行，用于打开后恢复选中状态（可选）
 * @param {number} type 任务类型：1=上架（查已入库、已出库），-1=下架（查待入库），默认上架
 * @since 2026-10-21 10:00:00
 */
function open(row?: any, type: number = 1) {
  taskType.value = type;
  selectedRow.value = row || null;
  // 抽屉内容随打开重新挂载，表格会自动按默认条件查询，无需手动 reload
  show.value = true;
}

defineExpose({ open });

// endregion
</script>

<template>
  <Drawer
    v-model:open="show"
    :footer-style="{ textAlign: 'right' }"
    :title="$t('storeManagement.labelPrint.selectLabelTitle')"
    :width="1100"
    destroy-on-close
    placement="right"
    @close="handleClose"
  >
    <!-- region 查询 -->
    <Card :body-style="{ padding: '4px' }" class="!mb-4">
      <Row :gutter="16" align="middle">
        <Col :span="6">
          <FormItem
            :label="$t('storeManagement.labelPrint.materialCode')"
            class="!mb-0"
          >
            <Input
              v-model:value="queryParams.materialCode"
              :placeholder="
                $t('common.pleaseEnter') +
                $t('storeManagement.labelPrint.materialCode')
              "
              allow-clear
              @press-enter="handleQuery"
            />
          </FormItem>
        </Col>
        <Col :span="6">
          <FormItem
            :label="$t('storeManagement.labelPrint.materialName')"
            class="!mb-0"
          >
            <Input
              v-model:value="queryParams.materialName"
              :placeholder="
                $t('common.pleaseEnter') +
                $t('storeManagement.labelPrint.materialName')
              "
              allow-clear
              @press-enter="handleQuery"
            />
          </FormItem>
        </Col>
        <Col :span="6">
          <FormItem
            :label="$t('storeManagement.labelPrint.manufacturerName')"
            class="!mb-0"
          >
            <Input
              v-model:value="queryParams.manufacturerName"
              :placeholder="
                $t('common.pleaseEnter') +
                $t('storeManagement.labelPrint.manufacturerName')
              "
              allow-clear
              @press-enter="handleQuery"
            />
          </FormItem>
        </Col>
        <Col :span="6">
          <FormItem
            :label="$t('storeManagement.labelPrint.createDate')"
            class="!mb-0"
          >
            <DatePicker.RangePicker
              v-model:value="queryDateRange"
              class="w-full"
              value-format="YYYY-MM-DD"
            />
          </FormItem>
        </Col>
        <Col :span="6">
          <FormItem
            :label="$t('storeManagement.labelPrint.inspectionDate')"
            class="!mb-0"
          >
            <DatePicker.RangePicker
              v-model:value="inspectionDateRange"
              class="w-full"
              value-format="YYYY-MM-DD"
            />
          </FormItem>
        </Col>
        <Col :span="18" class="!mt-3">
          <Space class="flex justify-end">
            <Button @click="handleReset">
              {{ $t('common.reset') }}
            </Button>
            <Button
              :icon="h(Icon, { icon: 'mdi:magnify', class: 'inline-block' })"
              type="primary"
              @click="handleQuery"
            >
              {{ $t('common.search') }}
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
    <!-- endregion -->

    <!-- region 表格 -->
    <Grid>
      <!-- 必须保留：抽屉内使用 VxeTable 时所需插槽 -->
      <template #toolbar-tools></template>
      <!-- 状态 -->
      <template #status="{ row }">
        <Tag :color="statusColorMap[row.status] || 'default'">
          {{ statusMap[row.status] || $t('common.unknown') }}
        </Tag>
      </template>
    </Grid>
    <!-- endregion -->

    <!-- region 底部按钮 -->
    <template #footer>
      <Space class="w-full justify-end">
        <Button @click="handleClose">
          {{ $t('common.cancel') }}
        </Button>
        <Button type="primary" @click="handleConfirm">
          <Icon icon="mdi:check" class="mr-1 inline-block align-middle" />
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
    <!-- endregion -->
  </Drawer>
</template>
