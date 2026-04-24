<script lang="ts" setup>
/**
 * [INPUT]: 依赖 @vben/common-ui 的 Page 组件
 * [OUTPUT]: 对外提供设备点检计划页面
 * [POS]: 设备管理模块 的设备点检计划页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-24 14:24:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type { InspectionPlan } from '#/api';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Select,
  SelectOption,
  Space,
  Switch,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteInspectionPlan,
  disableInspectionPlan,
  enableInspectionPlan,
  getInspectionPlanPage,
} from '#/api';
import { $t } from '#/locales';
import EquipCheckPlanDrawer from '#/util/component/equipmentCheckDrawer/EquipCheckPlanDrawer.vue';

defineOptions({
  name: 'EquipCheckPlan',
});

// ========== 查询参数 ==========
const queryParams = ref({
  keyword: '',
  inspectionType: undefined as string | undefined,
  status: undefined as string | undefined,
});

// ========== 下拉选项 ==========
const inspectionTypeOptions = [
  {
    label: $t('equipCheckPlan.inspectionTypeOptions.INSPECTION'),
    value: 'INSPECTION',
  },
  {
    label: $t('equipCheckPlan.inspectionTypeOptions.PATROL'),
    value: 'PATROL',
  },
];

const statusOptions = [
  { label: $t('equipCheckPlan.statusOptions.ACTIVE'), value: 'ACTIVE' },
  { label: $t('equipCheckPlan.statusOptions.DISABLED'), value: 'DISABLED' },
];

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    {
      field: 'planName',
      title: $t('equipCheckPlan.planName'),
      minWidth: 160,
    },
    {
      field: 'schemeName',
      title: $t('equipCheckPlan.schemeName'),
      minWidth: 140,
    },
    {
      field: 'inspectionType',
      title: $t('equipCheckPlan.inspectionType'),
      minWidth: 100,
      slots: { default: 'inspectionType' },
    },
    {
      field: 'equipmentGroup',
      title: $t('equipCheckPlan.equipmentGroup'),
      minWidth: 120,
    },
    {
      field: 'equipmentCount',
      title: $t('equipCheckPlan.equipmentCount'),
      width: 100,
    },
    {
      field: 'firstExecuteTime',
      title: $t('equipCheckPlan.firstExecuteTime'),
      minWidth: 160,
    },
    {
      field: 'frequency',
      title: $t('equipCheckPlan.frequencyValue'),
      minWidth: 100,
      slots: { default: 'frequency' },
    },
    {
      field: 'effectiveDate',
      title: $t('equipCheckPlan.effectiveDate'),
      width: 120,
    },
    {
      field: 'endDate',
      title: $t('equipCheckPlan.endDate'),
      width: 120,
    },
    {
      field: 'status',
      title: $t('equipCheckPlan.status'),
      minWidth: 100,
      slots: { default: 'status' },
      fixed: 'right',
    },
    {
      field: 'action',
      title: '操作',
      width: 180,
      fixed: 'right',
      slots: { default: 'action' },
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
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
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

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
      pageNum,
      pageSize,
    };

    getInspectionPlanPage(params)
      .then((res: any) => {
        resolve({
          total: res?.total || 0,
          items: res?.results || [],
        });
      })
      .catch(() => {
        resolve({
          total: 0,
          items: [],
        });
      });
  });
}

// ========== 重置 ==========
function handleReset() {
  queryParams.value = {
    keyword: '',
    inspectionType: undefined,
    status: undefined,
  };
  gridApi.reload();
}

// ========== 抽屉控制 ==========
const drawerVisible = ref(false);
const drawerMode = ref<'add' | 'edit' | 'view'>('add');
const currentRow = ref<InspectionPlan | null>(null);

// ========== 打开抽屉 ==========
function handleAdd() {
  drawerMode.value = 'add';
  currentRow.value = null;
  drawerVisible.value = true;
}

function handleEdit(row: InspectionPlan) {
  drawerMode.value = 'edit';
  currentRow.value = row;
  drawerVisible.value = true;
}

function handleView(row: InspectionPlan) {
  drawerMode.value = 'view';
  currentRow.value = row;
  drawerVisible.value = true;
}

// ========== 删除 ==========
function handleDelete(row: InspectionPlan) {
  Modal.confirm({
    title: '提示',
    content: $t('equipCheckPlan.confirmDelete'),
    okText: '确认',
    cancelText: '取消',
    okButtonProps: { danger: true },
    onOk() {
      return new Promise((resolve) => {
        if (row.id) {
          deleteInspectionPlan(row.id)
            .then(() => {
              message.success($t('common.successfulOperation'));
              gridApi.reload();
              resolve(true);
            })
            .catch(() => {
              resolve(false);
            });
        }
      });
    },
  });
}

// ========== 启用/停用 ==========
function handleStatusChange(row: InspectionPlan) {
  const api =
    row.status === 'ACTIVE' ? disableInspectionPlan : enableInspectionPlan;
  if (row.id) {
    api(row.id).then(() => {
      message.success($t('common.successfulOperation'));
      gridApi.reload();
    });
  }
}

// ========== 格式化频率 ==========
function formatFrequency(row: any) {
  const value = row.frequencyValue || '';
  const unit = $t(`equipCheckPlan.frequencyUnitOptions.${row.frequencyUnit}`);
  return `${value} ${unit}`;
}
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form layout="inline">
        <FormItem
          :label="$t('equipCheckPlan.keyword')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.keyword"
            :placeholder="$t('equipCheckPlan.keywordPlaceholder')"
            allow-clear
            style="width: 200px"
          />
        </FormItem>

        <FormItem
          :label="$t('equipCheckPlan.inspectionType')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.inspectionType"
            :placeholder="$t('equipCheckPlan.inspectionTypePlaceholder')"
            allow-clear
            style="width: 150px"
          >
            <SelectOption
              v-for="item in inspectionTypeOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </SelectOption>
          </Select>
        </FormItem>

        <FormItem
          :label="$t('equipCheckPlan.status')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.status"
            :placeholder="$t('equipCheckPlan.statusPlaceholder')"
            allow-clear
            style="width: 120px"
          >
            <SelectOption
              v-for="item in statusOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </SelectOption>
          </Select>
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button @click="handleReset">重置</Button>
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="gridApi.reload()">查询</Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <Button type="primary" @click="handleAdd">
            <Icon icon="mdi:plus" class="inline-block align-middle" />
            {{ $t('common.add') }}
          </Button>
        </template>

        <!-- 点巡检类型插槽 -->
        <template #inspectionType="{ row }">
          <Tag
            :color="
              row.inspectionType === 'INSPECTION' ? 'processing' : 'warning'
            "
          >
            {{
              row.inspectionType === 'INSPECTION'
                ? $t('equipCheckPlan.inspectionTypeOptions.INSPECTION')
                : $t('equipCheckPlan.inspectionTypeOptions.PATROL')
            }}
          </Tag>
        </template>

        <!-- 频率插槽 -->
        <template #frequency="{ row }">
          {{ formatFrequency(row) }}
        </template>

        <!-- 状态插槽 -->
        <template #status="{ row }">
          <Switch
            :checked="row.status === 'ACTIVE'"
            :checked-text="$t('equipCheckPlan.statusOptions.ACTIVE')"
            :un-checked-text="$t('equipCheckPlan.statusOptions.DISABLED')"
            size="small"
            @change="handleStatusChange(row)"
          />
        </template>

        <!-- 操作插槽 -->
        <template #action="{ row }">
          <Space>
            <Tooltip>
              <template #title>{{ $t('common.view') }}</template>
              <Button type="link" class="px-1" @click="handleView(row)">
                <Icon
                  icon="mdi:eye-outline"
                  class="inline-block align-middle text-lg"
                />
              </Button>
            </Tooltip>

            <Tooltip>
              <template #title>{{ $t('common.edit') }}</template>
              <Button type="link" class="px-1" @click="handleEdit(row)">
                <Icon
                  icon="mdi:pencil-outline"
                  class="inline-block align-middle text-lg"
                />
              </Button>
            </Tooltip>

            <Tooltip>
              <template #title>{{ $t('common.delete') }}</template>
              <Button
                type="link"
                danger
                class="px-1"
                @click="handleDelete(row)"
              >
                <Icon
                  icon="mdi:delete-outline"
                  class="inline-block align-middle text-lg"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 抽屉组件 -->
    <EquipCheckPlanDrawer
      v-model:visible="drawerVisible"
      :mode="drawerMode"
      :row="currentRow"
      @refresh="gridApi.reload()"
    />
  </Page>
</template>
