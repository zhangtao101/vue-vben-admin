<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue-iconify、#/adapter/vxe-table、#/api（getEquipSelectList）、#/locales
 * [OUTPUT]: 对外提供 EquipmentSelectDrawer 组件，用于选择设备（支持多选）
 * [POS]: 设备点检管理模块 的 设备选择抽屉，被 EquipmentSpotCheckSchemeDrawer.vue、TallySchemeDrawer.vue 引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-25 10:17:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { EquipSelectItem } from '#/api';

import { ref, watch } from 'vue';

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

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getEquipSelectList } from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'EquipmentSelectDrawer',
});

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  selectedRows: () => [],
});

const emit = defineEmits<{
  select: [rows: EquipSelectItem[]];
  'update:visible': [value: boolean];
}>();

interface Props {
  visible: boolean;
  selectedRows?: EquipSelectItem[];
}

// 用于存储已选中的 equipmentCode，用于在表格加载后恢复选中状态
const selectedCodes = ref<string[]>([]);

// ========== 抽屉控制 ==========
// 抽屉内部可见性状态：与 props.visible 双向绑定
const drawerVisible = ref(props.visible);

// ========== 查询参数 ==========
// 设备查询参数：包含设备编码、设备名称、设备组编码
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
    { type: 'seq', width: 60, title: '序号' },
    {
      field: 'equipmentCode',
      title: $t('equipmentSpotCheckScheme.equipmentSelectDrawer.equipmentCode'),
      minWidth: 140,
    },
    {
      field: 'equipmentName',
      title: $t('equipmentSpotCheckScheme.equipmentSelectDrawer.equipmentName'),
      minWidth: 160,
    },
    {
      field: 'equipGroupCode',
      title: $t(
        'equipmentSpotCheckScheme.equipmentSelectDrawer.equipGroupCode',
      ),
      minWidth: 120,
    },
    {
      field: 'equipGroupName',
      title: $t(
        'equipmentSpotCheckScheme.equipmentSelectDrawer.equipGroupName',
      ),
      minWidth: 120,
    },
    {
      field: 'location',
      title: $t('equipmentSpotCheckScheme.equipmentSelectDrawer.location'),
      minWidth: 140,
    },
    {
      field: 'model',
      title: $t('equipmentSpotCheckScheme.equipmentSelectDrawer.model'),
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
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-04-25 10:17:00
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

// ========== 监听 props 变化 ==========
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
      // 保存已选的 equipmentCode 列表
      selectedCodes.value = (props.selectedRows || [])
        .map((row) => row.equipmentCode)
        .filter((code): code is string => !!code);
    }
  },
);

// 监听抽屉内部状态变化
watch(drawerVisible, (val) => {
  emit('update:visible', val);
});

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
    equipmentCode: '',
    equipmentName: '',
    equipGroupCode: '',
  };
  gridApi.reload();
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
}

// ========== 确认选择 ==========
/**
 * 确认选择，触发 emit 事件返回选中的设备列表并关闭抽屉。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function handleConfirm() {
  const selectedRecords = (gridApi as any).grid.getCheckboxRecords();
  emit('select', selectedRecords);
  handleClose();
}
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :title="$t('equipmentSpotCheckScheme.equipmentSelectDrawer.title')"
    width="900"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Row :gutter="16" align="middle">
        <Col :span="6">
          <FormItem
            :label="
              $t('equipmentSpotCheckScheme.equipmentSelectDrawer.equipmentCode')
            "
            class="!mb-0"
          >
            <Input
              v-model:value="queryParams.equipmentCode"
              :placeholder="
                $t(
                  'equipmentSpotCheckScheme.equipmentSelectDrawer.equipmentCodePlaceholder',
                )
              "
              allow-clear
              @press-enter="handleQuery"
            />
          </FormItem>
        </Col>
        <Col :span="6">
          <FormItem
            :label="
              $t('equipmentSpotCheckScheme.equipmentSelectDrawer.equipmentName')
            "
            class="!mb-0"
          >
            <Input
              v-model:value="queryParams.equipmentName"
              :placeholder="
                $t(
                  'equipmentSpotCheckScheme.equipmentSelectDrawer.equipmentNamePlaceholder',
                )
              "
              allow-clear
              @press-enter="handleQuery"
            />
          </FormItem>
        </Col>
        <Col :span="6">
          <FormItem
            :label="
              $t(
                'equipmentSpotCheckScheme.equipmentSelectDrawer.equipGroupCode',
              )
            "
            class="!mb-0"
          >
            <Input
              v-model:value="queryParams.equipGroupCode"
              :placeholder="
                $t(
                  'equipmentSpotCheckScheme.equipmentSelectDrawer.equipGroupCodePlaceholder',
                )
              "
              allow-clear
              @press-enter="handleQuery"
            />
          </FormItem>
        </Col>
        <Col :span="3">
          <Space>
            <Button @click="handleReset">重置</Button>
            <Button type="primary" @click="handleQuery">查询</Button>
          </Space>
        </Col>
      </Row>
    </Card>

    <!-- 表格区域 -->
    <div>
      <Grid />
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <Space class="w-full justify-end">
        <Button @click="handleClose">
          {{ $t('equipmentSpotCheckScheme.equipmentSelectDrawer.cancel') }}
        </Button>
        <Button type="primary" @click="handleConfirm">
          <Icon icon="mdi:check" class="inline-block align-middle" />
          {{ $t('equipmentSpotCheckScheme.equipmentSelectDrawer.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
