<script lang="ts" setup>
/**
 * [INPUT]: 依赖 @vben/common-ui 的 Page 组件
 * [OUTPUT]: 对外提供模具保养计划页面
 * [POS]: 设备管理模块 的模具保养计划页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-25 11:00:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type { MoldMaintenancePlan } from '#/api/equipManagement/moldMaintenancePlan.service';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

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
  deleteMoldMaintenancePlan,
  getMoldMaintenancePlanPage,
  updateMoldMaintenancePlanStatus,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import MoldMaintenancePlanDrawer from '#/util/component/equipmentCheckDrawer/MoldMaintenancePlanDrawer.vue';

defineOptions({
  name: 'MoldMaintenancePlan',
});

// ========== 路由和权限 ==========
const route = useRoute();

// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// ========== 查询参数 ==========
const queryParams = ref({
  keyword: '',
  planType: undefined as string | undefined,
  categoryName: undefined as string | undefined,
  status: undefined as string | undefined,
});

// ========== 下拉选项 ==========
const planTypeOptions = [
  {
    label: $t('moldMaintenancePlan.planTypeOptions.REGULAR'),
    value: 'REGULAR',
  },
  {
    label: $t('moldMaintenancePlan.planTypeOptions.CONDITIONAL'),
    value: 'CONDITIONAL',
  },
];

const statusOptions = [
  {
    label: $t('moldMaintenancePlan.statusOptions.ACTIVE'),
    value: 'ACTIVE',
  },
  {
    label: $t('moldMaintenancePlan.statusOptions.DISABLED'),
    value: 'DISABLED',
  },
];

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    {
      field: 'planName',
      title: $t('moldMaintenancePlan.planName'),
      minWidth: 160,
    },
    {
      field: 'schemeName',
      title: $t('moldMaintenancePlan.schemeName'),
      minWidth: 160,
    },
    {
      field: 'planType',
      title: $t('moldMaintenancePlan.planType'),
      minWidth: 120,
      slots: { default: 'planType' },
    },
    {
      field: 'equipmentGroup',
      title: $t('moldMaintenancePlan.equipmentGroup'),
      minWidth: 120,
    },
    {
      field: 'moldCount',
      title: $t('moldMaintenancePlan.moldCount'),
      width: 100,
    },
    {
      field: 'frequencyValue',
      title: $t('moldMaintenancePlan.frequency'),
      minWidth: 120,
      slots: { default: 'frequency' },
    },
    {
      field: 'firstExecuteTime',
      title: $t('moldMaintenancePlan.firstExecuteTime'),
      minWidth: 160,
    },
    {
      field: 'status',
      title: $t('moldMaintenancePlan.status'),
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
    const params: any = {
      ...queryParams.value,
      pageNum,
      pageSize,
    };

    getMoldMaintenancePlanPage(params)
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
    planType: undefined,
    categoryName: undefined,
    status: undefined,
  };
  gridApi.reload();
}

// ========== 抽屉控制 ==========
const drawerVisible = ref(false);
const drawerMode = ref<'add' | 'edit' | 'view'>('add');
const currentRow = ref<MoldMaintenancePlan | null>(null);

// ========== 打开抽屉 ==========
function handleAdd() {
  drawerMode.value = 'add';
  currentRow.value = null;
  drawerVisible.value = true;
}

function handleEdit(row: MoldMaintenancePlan) {
  drawerMode.value = 'edit';
  currentRow.value = row;
  drawerVisible.value = true;
}

function handleView(row: MoldMaintenancePlan) {
  drawerMode.value = 'view';
  currentRow.value = row;
  drawerVisible.value = true;
}

// ========== 删除 ==========
function handleDelete(row: MoldMaintenancePlan) {
  Modal.confirm({
    title: '提示',
    content: $t('moldMaintenancePlan.confirmDelete'),
    okText: '确认',
    cancelText: '取消',
    okButtonProps: { danger: true },
    onOk() {
      return new Promise((resolve) => {
        if (row.id) {
          deleteMoldMaintenancePlan(row.id)
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
function handleStatusChange(row: MoldMaintenancePlan) {
  const targetStatus = row.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
  if (row.id) {
    updateMoldMaintenancePlanStatus({ planId: row.id, status: targetStatus })
      .then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      })
      .catch(() => {
        // 失败后刷新恢复原状态
        gridApi.reload();
      });
  }
}

// ========== 页面加载 ==========
onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// ========== 频率格式化 ==========
function formatFrequency(row: MoldMaintenancePlan) {
  return `${row.frequencyValue || ''} ${formatUnit(row.frequencyUnit)}`;
}

function formatUnit(unit?: string) {
  const unitMap: Record<string, string> = {
    DAY: $t('moldMaintenancePlan.frequencyUnitOptions.DAY'),
    WEEK: $t('moldMaintenancePlan.frequencyUnitOptions.WEEK'),
    MONTH: $t('moldMaintenancePlan.frequencyUnitOptions.MONTH'),
  };
  return unit ? unitMap[unit] || unit : '';
}
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form layout="inline">
        <FormItem
          :label="$t('moldMaintenancePlan.planName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.keyword"
            :placeholder="$t('moldMaintenancePlan.keywordPlaceholder')"
            allow-clear
            style="width: 200px"
          />
        </FormItem>

        <FormItem
          :label="$t('moldMaintenancePlan.planType')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.planType"
            allow-clear
            style="width: 150px"
          >
            <SelectOption
              v-for="item in planTypeOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </SelectOption>
          </Select>
        </FormItem>

        <FormItem
          :label="$t('moldMaintenancePlan.equipmentGroup')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.categoryName"
            :placeholder="$t('moldMaintenancePlan.equipmentGroupPlaceholder')"
            allow-clear
            style="width: 150px"
          />
        </FormItem>

        <FormItem
          :label="$t('moldMaintenancePlan.status')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.status"
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
          <Button @click="handleReset">{{ $t('common.reset') }}</Button>
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="gridApi.reload()">
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <Button
            v-if="author.includes('新增')"
            type="primary"
            @click="handleAdd"
          >
            <Icon icon="mdi:plus" class="inline-block align-middle" />
            {{ $t('common.add') }}
          </Button>
        </template>

        <!-- 保养类型插槽 -->
        <template #planType="{ row }">
          <Tag :color="row.planType === 'REGULAR' ? 'processing' : 'warning'">
            {{
              row.planType === 'REGULAR'
                ? $t('moldMaintenancePlan.planTypeOptions.REGULAR')
                : $t('moldMaintenancePlan.planTypeOptions.CONDITIONAL')
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
            :checked-text="$t('moldMaintenancePlan.statusOptions.ACTIVE')"
            :un-checked-text="$t('moldMaintenancePlan.statusOptions.DISABLED')"
            size="small"
            :disabled="!author.includes('状态变更')"
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

            <Tooltip v-if="author.includes('编辑')">
              <template #title>{{ $t('common.edit') }}</template>
              <Button type="link" class="px-1" @click="handleEdit(row)">
                <Icon
                  icon="mdi:pencil-outline"
                  class="inline-block align-middle text-lg"
                />
              </Button>
            </Tooltip>

            <Tooltip v-if="author.includes('删除')">
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
    <MoldMaintenancePlanDrawer
      v-model:visible="drawerVisible"
      :mode="drawerMode"
      :row="currentRow"
      @refresh="gridApi.reload()"
    />
  </Page>
</template>
