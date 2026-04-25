<script lang="ts" setup>
/**
 * 设备保养方案-保养项选择抽屉
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
// 在表格数据加载完成后，恢复已选中的行
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
function handleQuery() {
  gridApi.reload();
}

// ========== 重置 ==========
function handleReset() {
  queryParams.value = {
    checkItemCode: '',
    checkItemName: '',
  };
  gridApi.reload();
}

// ========== 确认选择 ==========
function handleConfirm() {
  const selectedRecords = (gridApi as any).grid.getCheckboxRecords();
  emit('select', selectedRecords);
  handleClose();
}

// ========== 关闭抽屉 ==========
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
