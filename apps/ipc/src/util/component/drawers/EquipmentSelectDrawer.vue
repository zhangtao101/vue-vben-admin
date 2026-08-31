<script setup lang="ts">
import { ref } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Col,
  Drawer,
  FormItem,
  Input,
  Row,
  Space,
} from 'ant-design-vue';

import {
  useVbenVxeGrid,
  type VxeGridProps,
} from '#/adapter/vxe-table';
import { type EquipSelectItem, getEquipSelectList } from '#/api';
import { $t } from '#/locales';

defineOptions({ name: 'EquipmentSelectDrawer' });

// Emits
const emit = defineEmits<{
  select: [rows: EquipSelectItem[]];
}>();

// ========== 抽屉控制 ==========
// 抽屉内部可见性状态：由 open 方法控制
const show = ref(false);

// ========== 已选状态 ==========
// 已选中的 equipmentCode 列表，用于数据加载完成后恢复选中状态
const selectedCodes = ref<string[]>([]);

// ========== 查询参数 ==========
// 设备查询参数：包含设备编码、设备名称、设备分组编码
const queryParams = ref({
  equipmentCode: '',
  equipmentName: '',
  equipGroupCode: '',
});

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 60 },
    { type: 'seq', width: 60, title: $t('equipmentSelect.sequence') },
    {
      field: 'equipmentCode',
      title: $t('equipmentSelect.equipmentCode'),
      minWidth: 140,
    },
    {
      field: 'equipmentName',
      title: $t('equipmentSelect.equipmentName'),
      minWidth: 160,
    },
    {
      field: 'equipGroupCode',
      title: $t('equipmentSelect.equipGroupCode'),
      minWidth: 120,
    },
    {
      field: 'equipGroupName',
      title: $t('equipmentSelect.equipGroupName'),
      minWidth: 120,
    },
    {
      field: 'location',
      title: $t('equipmentSelect.location'),
      minWidth: 140,
    },
    {
      field: 'model',
      title: $t('equipmentSelect.model'),
      minWidth: 120,
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
 * @since 2026-08-31
 */
function handleGridLoadEvent() {
  if (selectedCodes.value.length > 0) {
    const grid = (gridApi as any).grid;
    if (grid) {
      const tableData = grid.getData();
      tableData.forEach((row: EquipSelectItem) => {
        if (
          row.equipmentCode &&
          selectedCodes.value.includes(row.equipmentCode)
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
 * 查询设备列表数据。
 * @param params 包含 pageNum 和 pageSize 的分页参数
 * @returns 返回包含总数和数据列表的 Promise
 * @since 2026-08-31
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

    getEquipSelectList(params)
      .then((res: any) => {
        resolve({
          total: res.total || 0,
          items: res.list || [],
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

// ========== open 方法 ==========
/**
 * 打开抽屉。
 * @param selectedRows 已选中的设备行数据，用于打开后恢复选中状态（可选）
 * @since 2026-08-31
 */
function open(selectedRows?: EquipSelectItem[]) {
  show.value = true;
  // 清空表格选中状态
  const grid = (gridApi as any).grid;
  if (grid && grid.clearCheckboxRow) {
    grid.clearCheckboxRow();
  }
  // 保存已选的 equipmentCode 列表，用于恢复选中
  selectedCodes.value = (selectedRows || [])
    .map((row) => row.equipmentCode)
    .filter((code): code is string => !!code);
}

defineExpose({ open });

// ========== 查询 ==========
/**
 * 触发查询操作，刷新表格数据。
 * @since 2026-08-31
 */
function handleQuery() {
  gridApi.reload();
}

// ========== 重置 ==========
/**
 * 重置查询参数并刷新表格。
 * @since 2026-08-31
 */
function handleReset() {
  queryParams.value = {
    equipmentCode: '',
    equipmentName: '',
    equipGroupCode: '',
  };
  gridApi.reload();
}

// ========== 关闭抽屉 ==========
/**
 * 关闭抽屉并清空所有状态，回到初始状态。
 * @since 2026-08-31
 */
function handleClose() {
  show.value = false;
  // 关闭时清空所有可变状态，避免下次打开残留旧值
  selectedCodes.value = [];
  queryParams.value = {
    equipmentCode: '',
    equipmentName: '',
    equipGroupCode: '',
  };
}

// ========== 确认选择 ==========
/**
 * 确认选择，触发 emit 事件返回选中的设备列表并关闭抽屉。
 * @since 2026-08-31
 */
function handleConfirm() {
  const selectedRecords = (gridApi as any).grid.getCheckboxRecords();
  emit('select', selectedRecords);
  handleClose();
}
</script>

<template>
  <Drawer
    v-model:open="show"
    :title="$t('equipmentSelect.title')"
    width="900"
    :destroy-on-close="true"
    :footer-style="{ textAlign: 'right' }"
    @close="handleClose"
  >
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Row :gutter="16" align="middle">
        <Col :span="6">
          <FormItem
            :label="$t('equipmentSelect.equipmentCode')"
            class="!mb-0"
          >
            <Input
              v-model:value="queryParams.equipmentCode"
              :placeholder="$t('equipmentSelect.equipmentCodePlaceholder')"
              allow-clear
              @press-enter="handleQuery"
            />
          </FormItem>
        </Col>
        <Col :span="6">
          <FormItem
            :label="$t('equipmentSelect.equipmentName')"
            class="!mb-0"
          >
            <Input
              v-model:value="queryParams.equipmentName"
              :placeholder="$t('equipmentSelect.equipmentNamePlaceholder')"
              allow-clear
              @press-enter="handleQuery"
            />
          </FormItem>
        </Col>
        <Col :span="6">
          <FormItem
            :label="$t('equipmentSelect.equipGroupCode')"
            class="!mb-0"
          >
            <Input
              v-model:value="queryParams.equipGroupCode"
              :placeholder="$t('equipmentSelect.equipGroupCodePlaceholder')"
              allow-clear
              @press-enter="handleQuery"
            />
          </FormItem>
        </Col>
        <Col :span="3">
          <Space>
            <Button @click="handleReset">{{ $t('common.reset') }}</Button>
            <Button type="primary" @click="handleQuery">
              {{ $t('common.query') }}
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>

    <!-- 表格区域 -->
    <div>
      <Grid>
        <!-- 必须保留：抽屉内使用 VxeTable 时所需插槽 -->
        <template #toolbar-tools></template>
      </Grid>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <Space class="w-full justify-end">
        <Button @click="handleClose">
          {{ $t('equipmentSelect.cancel') }}
        </Button>
        <Button type="primary" @click="handleConfirm">
          <Icon icon="mdi:check" class="inline-block align-middle" />
          {{ $t('equipmentSelect.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
