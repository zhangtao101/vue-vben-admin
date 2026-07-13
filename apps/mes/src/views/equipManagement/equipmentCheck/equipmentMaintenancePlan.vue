<script lang="ts" setup>
/**
 * [INPUT]: 依赖 @vben/common-ui 的 Page 组件
 * [OUTPUT]: 对外提供设备保养计划页面
 * [POS]: 设备管理模块 的设备保养计划页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-25 09:24:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type { MaintenancePlan } from '#/api';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

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
  Upload,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteMaintenancePlan,
  disableMaintenancePlan,
  enableMaintenancePlan,
  getMaintenancePlanPage,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import EquipmentMaintenancePlanDrawer from '#/util/component/equipmentCheckDrawer/EquipmentMaintenancePlanDrawer.vue';

defineOptions({
  name: 'EquipmentMaintenancePlan',
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
  status: undefined as string | undefined,
});

// ========== 下拉选项 ==========
const planTypeOptions = [
  {
    label: $t('equipmentMaintenancePlan.planTypeOptions.REGULAR'),
    value: 'REGULAR',
  },
  {
    label: $t('equipmentMaintenancePlan.planTypeOptions.CONDITIONAL'),
    value: 'CONDITIONAL',
  },
];

const statusOptions = [
  {
    label: $t('equipmentMaintenancePlan.statusOptions.ACTIVE'),
    value: 'ACTIVE',
  },
  {
    label: $t('equipmentMaintenancePlan.statusOptions.DISABLED'),
    value: 'DISABLED',
  },
];

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 60, title: $t('basic.laborHourEvaluation.sequence') },
    {
      field: 'planCode',
      title: $t('equipmentMaintenancePlan.planCode'),
      minWidth: 150,
    },
    {
      field: 'planName',
      title: $t('equipmentMaintenancePlan.planName'),
      minWidth: 160,
    },
    {
      field: 'schemeName',
      title: $t('equipmentMaintenancePlan.schemeName'),
      minWidth: 160,
    },
    {
      field: 'planType',
      title: $t('equipmentMaintenancePlan.planType'),
      minWidth: 120,
      slots: { default: 'planType' },
    },
    {
      field: 'equipmentCount',
      title: $t('equipmentMaintenancePlan.equipmentCount'),
      width: 100,
    },
    {
      field: 'frequencyValue',
      title: $t('equipmentMaintenancePlan.frequency'),
      minWidth: 120,
      slots: { default: 'frequency' },
    },
    {
      field: 'firstExecuteTime',
      title: $t('equipmentMaintenancePlan.firstExecuteTime'),
      minWidth: 160,
    },
    {
      field: 'status',
      title: $t('equipmentMaintenancePlan.status'),
      minWidth: 100,
      slots: { default: 'status' },
      fixed: 'right',
    },
    {
      field: 'action',
      title: $t('common.operation'),
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

    getMaintenancePlanPage(params)
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

// ========== 导入 ==========
const accessStore = useAccessStore();
const importFile = ref<any>([]);

function getImportUrl() {
  return `/ht/${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/import/maintenance-plan`;
}

function handleImportChange(info: any) {
  const { file } = info;
  if (file.status === 'done') {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
    importFile.value = [];
  } else if (file.status === 'error') {
    message.error($t('common.operationFailure'));
  }
}

// ========== 重置 ==========
function handleReset() {
  queryParams.value = {
    keyword: '',
    planType: undefined,
    status: undefined,
  };
  gridApi.reload();
}

// ========== 抽屉控制 ==========
const planDrawerRef = ref();

// ========== 打开抽屉 ==========
function handleAdd() {
  planDrawerRef.value.open('add');
}

function handleEdit(row: MaintenancePlan) {
  planDrawerRef.value.open('edit', row);
}

function handleView(row: MaintenancePlan) {
  planDrawerRef.value.open('view', row);
}

// ========== 删除 ==========
function handleDelete(row: MaintenancePlan) {
  Modal.confirm({
    title: $t('common.prompt'),
    content: $t('equipmentMaintenancePlan.confirmDelete'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    okButtonProps: { danger: true },
    onOk() {
      return new Promise((resolve) => {
        if (row.id) {
          deleteMaintenancePlan(row.id)
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
function handleStatusChange(row: MaintenancePlan) {
  const api =
    row.status === 'ACTIVE' ? disableMaintenancePlan : enableMaintenancePlan;
  if (row.id) {
    api(row.id).then(() => {
      message.success($t('common.successfulOperation'));
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
function formatFrequency(row: MaintenancePlan) {
  return `${row.frequencyValue || ''} ${formatUnit(row.frequencyUnit)}`;
}

function formatUnit(unit?: string) {
  const unitMap: Record<string, string> = {
    DAY: $t('equipmentMaintenancePlan.frequencyUnitOptions.DAY'),
    WEEK: $t('equipmentMaintenancePlan.frequencyUnitOptions.WEEK'),
    MONTH: $t('equipmentMaintenancePlan.frequencyUnitOptions.MONTH'),
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
          :label="$t('equipmentMaintenancePlan.planName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.keyword"
            :placeholder="$t('equipmentMaintenancePlan.keywordPlaceholder')"
            allow-clear
            style="width: 200px"
          />
        </FormItem>

        <FormItem
          :label="$t('equipmentMaintenancePlan.planType')"
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
          :label="$t('equipmentMaintenancePlan.status')"
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
          <Button type="primary" @click="gridApi.reload()">{{
            $t('common.query')
          }}</Button>
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
          <Upload
            v-if="author.includes('新增')"
            v-model:file-list="importFile"
            name="files"
            accept=".xlsx,.xls"
            :multiple="false"
            :action="getImportUrl()"
            :headers="{ Authorization: `${accessStore.accessToken}` }"
            :show-upload-list="false"
            @change="handleImportChange"
            class="ml-4!"
          >
            <Button>
              <Icon
                icon="mdi:cloud-upload"
                class="inline-block align-middle text-xl text-[#5085ff]"
              />
              {{ $t('common.import') }}
            </Button>
          </Upload>
        </template>

        <!-- 保养类型插槽 -->
        <template #planType="{ row }">
          <Tag :color="row.planType === 'REGULAR' ? 'processing' : 'warning'">
            {{
              row.planType === 'REGULAR'
                ? $t('equipmentMaintenancePlan.planTypeOptions.REGULAR')
                : $t('equipmentMaintenancePlan.planTypeOptions.CONDITIONAL')
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
            :checked-text="$t('equipmentMaintenancePlan.statusOptions.ACTIVE')"
            :un-checked-text="
              $t('equipmentMaintenancePlan.statusOptions.DISABLED')
            "
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
    <EquipmentMaintenancePlanDrawer
      ref="planDrawerRef"
      @refresh="gridApi.reload()"
    />
  </Page>
</template>
