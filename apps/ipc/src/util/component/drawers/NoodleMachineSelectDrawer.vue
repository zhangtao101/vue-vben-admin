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
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { searchNoodleMachineList } from '#/api';
import { $t } from '#/locales';

defineOptions({ name: 'NoodleMachineSelectDrawer' });

// Emits：选中面机后回传完整设备数据
const emit = defineEmits<{
  select: [row: any];
}>();

// ========== 抽屉控制 ==========
/** 抽屉内部可见性状态：由 open 方法控制 */
const show = ref(false);

// ========== 查询条件 ==========
const query = reactive({
  equipCode: '',
  type: '',
});

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50, title: '' },
    {
      field: 'equipCode',
      title: $t('noodleMachineSelect.colEquipCode'),
      minWidth: 120,
    },
    {
      field: 'equipName',
      title: $t('noodleMachineSelect.colEquipName'),
      minWidth: 180,
    },
    {
      field: 'type',
      title: $t('noodleMachineSelect.colType'),
      minWidth: 120,
    },
    {
      field: 'replaceCycleHours',
      title: $t('noodleMachineSelect.colReplaceCycle'),
      minWidth: 130,
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
      query: queryNoodleMachineList,
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

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/**
 * 分页查询面机设备列表
 * @param page 分页信息
 * @param page.currentPage 当前页码
 * @param page.pageSize 每页条数
 * @returns 分页面机列表（items 设备数组、total 总数）
 * @since 2026-09-08
 */
function queryNoodleMachineList({ page }: any) {
  const params: any = {
    pageNum: page.currentPage,
    pageSize: page.pageSize,
  };
  if (query.equipCode) {
    params.equipCode = query.equipCode;
  }
  if (query.type) {
    params.type = query.type;
  }
  return searchNoodleMachineList(params).then((res: any) => ({
    items: res?.list ?? [],
    total: res?.total ?? 0,
  }));
}

// ========== open 方法 ==========
/**
 * 打开面机选择抽屉，并重置查询条件后加载设备列表
 * @since 2026-09-08
 */
function open() {
  show.value = true;
  query.equipCode = '';
  query.type = '';
  setTimeout(() => {
    gridApi.reload();
  }, 200);
}

defineExpose({ open });

// ========== 查询 ==========
/**
 * 触发查询操作，刷新面机列表
 * @since 2026-09-08
 */
function handleQuery() {
  gridApi.reload();
}

// ========== 重置 ==========
/**
 * 重置查询参数并刷新面机列表
 * @since 2026-09-08
 */
function handleReset() {
  query.equipCode = '';
  query.type = '';
  gridApi.reload();
}

// ========== 关闭抽屉 ==========
/**
 * 关闭抽屉并清空查询条件，回到初始状态
 * @since 2026-09-08
 */
function handleClose() {
  show.value = false;
  query.equipCode = '';
  query.type = '';
}

// ========== 确认选中 ==========
/**
 * 确认选中面机，触发 select 事件回传设备数据并关闭抽屉
 * @since 2026-09-08
 */
function handleConfirm() {
  const selectedRow = gridApi.grid?.getRadioRecord();
  if (!selectedRow) {
    message.warning($t('noodleMachineSelect.plsSelect'));
    return;
  }
  emit('select', selectedRow);
  handleClose();
}
</script>

<template>
  <Drawer
    v-model:open="show"
    :title="$t('noodleMachineSelect.title')"
    width="800"
    :destroy-on-close="true"
    :footer-style="{ textAlign: 'right' }"
    @close="handleClose"
  >
    <!-- 查询区域 -->
    <Form layout="inline" class="mb-3 flex-wrap items-end gap-2">
      <FormItem :label="$t('noodleMachineSelect.equipCode')">
        <Input
          v-model:value="query.equipCode"
          :placeholder="$t('noodleMachineSelect.equipCodePlaceholder')"
          allow-clear
          class="w-44"
          @press-enter="handleQuery"
        />
      </FormItem>
      <FormItem :label="$t('noodleMachineSelect.type')">
        <Input
          v-model:value="query.type"
          :placeholder="$t('noodleMachineSelect.typePlaceholder')"
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

    <!-- 面机表格 -->
    <Grid>
      <!-- 抽屉内使用 VxeTable 时必须保留的空插槽 -->
      <template #toolbar-tools></template>
    </Grid>

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
