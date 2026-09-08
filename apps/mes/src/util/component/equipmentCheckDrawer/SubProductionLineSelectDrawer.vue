<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue、#/adapter/vxe-table、#/api（listSubProductionLines）、#/locales
 * [OUTPUT]: 对外提供 SubProductionLineSelectDrawer 组件，用于选择子产线（单选）
 * [POS]: 设备管理模块 的 子产线选择抽屉，被 equipManagement/equipRecord.vue 引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-09-08 10:00:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type { SubProductionLineItem } from '#/api';

import { ref } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { listSubProductionLines } from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'SubProductionLineSelectDrawer',
});

const emit = defineEmits<{
  select: [row: SubProductionLineItem];
}>();

// ========== 抽屉控制 ==========
// 抽屉内部可见性状态
const show = ref(false);

// ========== 选中数据 ==========
// 当前选中的子产线
const selectedRow = ref<any>(null);
// 已选子产线 id，用于数据加载后回显单选状态
const selectedId = ref<number | undefined>(undefined);

// ========== 查询参数 ==========
// 子产线查询参数：包含子产线编号、子产线名称
const queryParams = ref({
  subLineCode: '',
  subLineName: '',
});

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 60 },
    { type: 'seq', width: 60, title: $t('equip.sequence') },
    {
      field: 'subLineCode',
      title: $t('equip.subLineSelectDrawer.subLineCode'),
      minWidth: 140,
    },
    {
      field: 'subLineName',
      title: $t('equip.subLineSelectDrawer.subLineName'),
      minWidth: 160,
    },
  ],
  height: 400,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  radioConfig: { trigger: 'row', highlight: true },
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
  },
};

// ========== 表格事件 ==========
const gridEvents: VxeGridListeners<any> = {
  radioChange: ({ row }: any) => {
    selectedRow.value = row || null;
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// ========== 数据查询 ==========
/**
 * 查询子产线分页数据。
 * @param {object} params - 包含 pageNum 和 pageSize 的分页参数。
 * @param {number} params.pageNum - 当前页码。
 * @param {number} params.pageSize - 每页条数。
 * @returns {Promise<{total: number, items: any[]}>} 返回包含总数和数据列表的 Promise。
 * @throws 查询异常时返回空数据。
 * @since 2026-09-08 10:00:00
 */
function queryData({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) {
  return new Promise((resolve) => {
    const params = {
      ...queryParams.value,
      pageNum,
      pageSize,
    };

    listSubProductionLines(params)
      .then((res: any) => {
        resolve({
          total: res?.total || 0,
          items: res?.list || [],
        });
        // 数据加载完成后回显已选中的子产线
        setTimeout(() => {
          restoreSelectedRow();
        }, 100);
      })
      .catch(() => {
        resolve({
          total: 0,
          items: [],
        });
      });
  });
}

/**
 * 数据加载完成后，根据已选子产线 id 回显单选状态。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-09-08 10:00:00
 */
function restoreSelectedRow() {
  if (!selectedId.value) return;
  const grid = (gridApi as any).grid;
  if (!grid) return;
  const matchedRow = grid
    .getData()
    .find((item: any) => item.id === selectedId.value);
  if (matchedRow) {
    grid.setRadioRow(matchedRow, true);
    selectedRow.value = matchedRow;
  }
}

// ========== 打开抽屉 ==========
/**
 * 打开抽屉。
 * @param {object} [currentRow] - 当前正在编辑的行数据，存在 subLineId 时用于回显选中状态。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-09-08 10:00:00
 */
function open(currentRow?: any) {
  show.value = true;
  selectedRow.value = null;
  selectedId.value = currentRow?.subLineId;
  queryParams.value = {
    subLineCode: '',
    subLineName: '',
  };
}

/**
 * 关闭抽屉，清空所有状态回到初始值。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-09-08 10:00:00
 */
function handleClose() {
  show.value = false;
  selectedRow.value = null;
  selectedId.value = undefined;
  queryParams.value = {
    subLineCode: '',
    subLineName: '',
  };
}

defineExpose({ open });

// ========== 查询 ==========
/**
 * 触发查询操作，刷新表格数据。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-09-08 10:00:00
 */
function handleQuery() {
  gridApi.reload();
}

// ========== 重置 ==========
/**
 * 重置查询参数并刷新表格。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-09-08 10:00:00
 */
function handleReset() {
  queryParams.value = {
    subLineCode: '',
    subLineName: '',
  };
  gridApi.reload();
}

// ========== 确认选择 ==========
/**
 * 确认选择，触发 select 事件返回选中的子产线并关闭抽屉。
 * 选中行以表格实时的单选记录为准，避免切换查询条件后残留上一次的选择结果。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-09-08 10:00:00
 */
function handleConfirm() {
  const radioRecord = (gridApi as any).grid?.getRadioRecord();
  selectedRow.value = radioRecord || null;
  if (!selectedRow.value) {
    message.warning($t('equip.pleaseSelectSubLine'));
    return;
  }
  emit('select', selectedRow.value);
  handleClose();
}
</script>

<template>
  <Drawer
    v-model:open="show"
    :title="$t('equip.subLineSelectDrawer.title')"
    width="900"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form layout="inline" class="flex flex-wrap items-end gap-2">
        <FormItem
          :label="$t('equip.subLineSelectDrawer.subLineCode')"
          class="!mb-0"
        >
          <Input
            v-model:value="queryParams.subLineCode"
            :placeholder="
              $t('equip.subLineSelectDrawer.subLineCodePlaceholder')
            "
            allow-clear
            @press-enter="handleQuery"
          />
        </FormItem>
        <FormItem
          :label="$t('equip.subLineSelectDrawer.subLineName')"
          class="!mb-0"
        >
          <Input
            v-model:value="queryParams.subLineName"
            :placeholder="
              $t('equip.subLineSelectDrawer.subLineNamePlaceholder')
            "
            allow-clear
            @press-enter="handleQuery"
          />
        </FormItem>
        <FormItem class="!mb-0">
          <Space>
            <Button @click="handleReset">
              {{ $t('equip.subLineSelectDrawer.reset') }}
            </Button>
            <Button type="primary" @click="handleQuery">
              {{ $t('equip.subLineSelectDrawer.query') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <div>
      <Grid>
        <template #toolbar-tools></template>
      </Grid>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <Space class="w-full justify-end">
        <Button @click="handleClose">
          {{ $t('equip.subLineSelectDrawer.cancel') }}
        </Button>
        <Button type="primary" @click="handleConfirm">
          <Icon icon="mdi:check" class="inline-block align-middle" />
          {{ $t('equip.subLineSelectDrawer.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
