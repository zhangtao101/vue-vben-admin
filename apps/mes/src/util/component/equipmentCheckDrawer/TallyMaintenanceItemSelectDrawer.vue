<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue-iconify、#/adapter/vxe-table、#/api（getEquipCheckItemList）、#/locales
 * [OUTPUT]: 对外提供 TallyMaintenanceItemSelectDrawer 组件，用于选择保养项（支持多选，maintenanceTag=1）
 * [POS]: 设备点检管理模块 的 保养项选择抽屉，被 TallySchemeDrawer.vue 引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-25 10:17:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref, watch } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getEquipCheckItemList } from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'TallyMaintenanceItemSelectDrawer',
});

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  selectedRows: () => [],
});

const emit = defineEmits<{
  select: [items: any[]];
  'update:visible': [value: boolean];
}>();

interface Props {
  visible?: boolean;
  selectedRows?: any[];
}

// ========== 抽屉控制 ==========
// 抽屉内部可见性状态：与 props.visible 双向绑定
const drawerVisible = ref(props.visible);

// 用于存储已选中的 checkItemCode，用于在表格加载后恢复选中状态
const selectedCodes = ref<string[]>([]);

// 监听 props 变化
watch(
  () => props.visible,
  (val) => {
    drawerVisible.value = val;
    if (val) {
      // 清空选中状态
      const grid = (gridApi as any).grid;
      if (grid && grid.clearCheckboxRow) {
        grid.clearCheckboxRow();
      }
      // 保存已选的 checkItemCode 列表
      selectedCodes.value = (props.selectedRows || [])
        .map((row: any) => row.checkItemCode)
        .filter((code: any): code is string => !!code);
    }
  },
);

// 监听抽屉内部状态变化
watch(drawerVisible, (val) => {
  emit('update:visible', val);
});

// ========== 查询参数 ==========
// 保养项查询参数：包含点检项编码和名称
const queryParams = ref({
  checkItemCode: '',
  checkItemName: '',
});

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 60 },
    { type: 'seq', width: 60, title: '序号' },
    {
      field: 'checkItemCode',
      title: $t('equipmentSpotCheckScheme.checkItemCode'),
      minWidth: 120,
    },
    {
      field: 'checkItemName',
      title: $t('equipmentSpotCheckScheme.checkItemName'),
      minWidth: 150,
    },
    {
      field: 'itemTypeName',
      title: $t('equipmentSpotCheckScheme.itemType'),
      minWidth: 100,
    },
    {
      field: 'isSpecialName',
      title: $t('equipmentSpotCheckScheme.isSpecial'),
      minWidth: 100,
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
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
  },
};

// ========== 监听表格事件 ==========
/**
 * 表格数据加载完成后恢复已选中的行。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function handleGridLoadEvent() {
  if (selectedCodes.value.length > 0) {
    const grid = (gridApi as any).grid;
    if (grid) {
      const tableData = grid.getData();
      tableData.forEach((row: any) => {
        if (
          row.checkItemCode &&
          selectedCodes.value.includes(row.checkItemCode)
        ) {
          grid.setCheckboxRow(row, true);
        }
      });
    }
  }
}

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents: {}, gridOptions });

// ========== 数据查询 ==========
/**
 * 查询保养项列表数据（maintenanceTag=1）。
 * @param {object} params - 包含 pageNum 和 pageSize 的分页参数。
 * @param {number} params.pageNum - 当前页码。
 * @param {number} params.pageSize - 每页条数。
 * @returns {Promise<{total: number, items: any[]}>} 返回包含总数和数据列表的 Promise。
 * @throws 查询异常时返回空数据。
 * @since 2026-04-25 10:17:00
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
      maintenanceTag: 1, // 保养项
      pageNum,
      pageSize,
    };

    getEquipCheckItemList(params)
      .then((res: any) => {
        resolve({
          total: res?.total || 0,
          items: res?.results || [],
        });
        // 数据加载完成后恢复选中状态
        setTimeout(() => {
          handleGridLoadEvent();
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

// ========== 查询 ==========
/**
 * 触发查询操作，刷新表格数据。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function handleQuery() {
  gridApi.reload();
}

// ========== 重置 ==========
/**
 * 重置查询参数并刷新表格。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function handleReset() {
  queryParams.value = {
    checkItemCode: '',
    checkItemName: '',
  };
  gridApi.reload();
}

// ========== 确认选择 ==========
/**
 * 确认选择，触发 emit 事件返回选中的保养项列表并关闭抽屉。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function handleConfirm() {
  const selectedRecords = (gridApi as any).grid.getCheckboxRecords();
  emit('select', selectedRecords);
  handleClose();
}

// ========== 关闭抽屉 ==========
/**
 * 关闭抽屉，通过 emit 触发父组件更新 visible 状态。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function handleClose() {
  drawerVisible.value = false;
  emit('update:visible', false);
}
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :title="$t('tallyScheme.selectMaintenanceItem')"
    width="800"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form layout="inline">
        <FormItem
          :label="$t('equipmentSpotCheckScheme.checkItemCode')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.checkItemCode"
            :placeholder="
              $t('equipmentSpotCheckScheme.checkItemCodePlaceholder')
            "
            allow-clear
            style="width: 150px"
          />
        </FormItem>

        <FormItem
          :label="$t('equipmentSpotCheckScheme.checkItemName')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.checkItemName"
            :placeholder="
              $t('equipmentSpotCheckScheme.checkItemNamePlaceholder')
            "
            allow-clear
            style="width: 150px"
          />
        </FormItem>

        <FormItem style="margin-bottom: 0">
          <Button @click="handleReset">重置</Button>
        </FormItem>

        <FormItem style="margin-bottom: 0">
          <Button type="primary" @click="handleQuery">查询</Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Grid />

    <!-- 底部按钮 -->
    <template #footer>
      <Space class="drawer-footer">
        <Button @click="handleClose">取消</Button>
        <Button type="primary" @click="handleConfirm">
          <Icon icon="mdi:check" class="inline-block align-middle" />
          确认
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped>
.drawer-footer {
  justify-content: flex-end;
  width: 100%;
}
</style>
