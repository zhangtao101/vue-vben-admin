<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

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
  RadioButton,
  RadioGroup,
  Space,
  Switch,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteRepairKnowledge,
  disableRepairKnowledge,
  enableRepairKnowledge,
  getRepairKnowledgePage,
} from '#/api/equipManagement/repairKnowledgeBase.service';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import RepairKnowledgeDrawer from '#/util/component/RepairKnowledgeDrawer.vue';

// ========== 权限 ==========
const route = useRoute();
const author = ref<string[]>([]);

onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// ========== 查询参数 ==========
const queryParams = ref<any>({
  pmCode: undefined,
  title: undefined,
  equipmentGroup: undefined,
  status: undefined,
});

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    {
      field: 'pmCode',
      title: $t('repair.repairKnowledgeBase.pmCode'),
      minWidth: 120,
    },
    {
      field: 'title',
      title: $t('repair.repairKnowledgeBase.titleField'),
      minWidth: 200,
    },
    {
      field: 'source',
      title: $t('repair.repairKnowledgeBase.source'),
      minWidth: 120,
    },
    {
      field: 'equipmentGroup',
      title: $t('repair.repairKnowledgeBase.equipmentGroup'),
      minWidth: 120,
    },
    {
      field: 'status',
      title: $t('repair.repairKnowledgeBase.status'),
      minWidth: 100,
      slots: { default: 'status' },
      fixed: 'right',
    },
    {
      field: 'createdBy',
      title: $t('repair.repairKnowledgeBase.createdBy'),
      minWidth: 100,
    },
    {
      field: 'updatedTime',
      title: $t('repair.repairKnowledgeBase.updatedTime'),
      minWidth: 170,
    },
    {
      field: 'action',
      title: $t('common.action'),
      width: 220,
      slots: { default: 'action' },
      fixed: 'right',
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
        return await queryData(page);
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
function queryData(page?: { currentPage: number; pageSize: number }) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams.value,
      pageNum: page?.currentPage || 1,
      pageSize: page?.pageSize || 20,
    };
    getRepairKnowledgePage(params)
      .then((data) => {
        resolve({
          total: data.total || 0,
          items: data.results || data || [],
        });
      })
      .catch((error) => {
        reject(error);
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
    pmCode: undefined,
    title: undefined,
    equipmentGroup: undefined,
    status: undefined,
  };
  gridApi.reload();
}

// ========== 抽屉控制 ==========
const drawerVisible = ref(false);
const drawerMode = ref<'add' | 'edit' | 'view'>('add');
const currentRow = ref<any>(null);

function openDrawer(row?: any, mode: 'add' | 'edit' | 'view' = 'add') {
  currentRow.value = row || null;
  drawerMode.value = mode;
  drawerVisible.value = true;
}

function onDrawerSuccess() {
  gridApi.reload();
}

// ========== 操作 ==========
// 新增
function handleAdd() {
  openDrawer(null, 'add');
}

// 查看详情
function handleDetail(row: any) {
  openDrawer(row, 'view');
}

// 编辑
function handleEdit(row: any) {
  openDrawer(row, 'edit');
}

// 启用/禁用
function handleToggleStatus(row: any) {
  const action =
    row.status === 'NORMAL' ? disableRepairKnowledge : enableRepairKnowledge;
  const actionText = row.status === 'NORMAL' ? '禁用' : '启用';

  Modal.confirm({
    title: `${actionText}确认`,
    content: `确定要${actionText}知识「${row.title}」吗？`,
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      action(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
  });
}

// 删除
function handleDelete(row: any) {
  Modal.confirm({
    title: $t('repair.equipmentFailure.confirmDelete'),
    content: `确定删除知识「${row.title}」吗？`,
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      deleteRepairKnowledge(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
  });
}
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 知识编码 -->
        <FormItem
          :label="$t('repair.repairKnowledgeBase.pmCode')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.pmCode"
            :placeholder="`请输入${$t('repair.repairKnowledgeBase.pmCode')}`"
            allow-clear
            style="width: 160px"
          />
        </FormItem>

        <!-- 标题 -->
        <FormItem
          :label="$t('repair.repairKnowledgeBase.title')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.title"
            :placeholder="`请输入${$t('repair.repairKnowledgeBase.title')}`"
            allow-clear
            style="width: 160px"
          />
        </FormItem>

        <!-- 设备组 -->
        <FormItem
          :label="$t('repair.repairKnowledgeBase.equipmentGroup')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.equipmentGroup"
            :placeholder="`请输入${$t('repair.repairKnowledgeBase.equipmentGroup')}`"
            allow-clear
            style="width: 160px"
          />
        </FormItem>

        <!-- 状态 -->
        <FormItem
          :label="$t('repair.repairKnowledgeBase.status')"
          style="margin-bottom: 0"
        >
          <RadioGroup v-model:value="queryParams.status">
            <RadioButton :value="undefined">
              {{ $t('repair.repairKnowledgeBase.all') }}
            </RadioButton>
            <RadioButton value="NORMAL">
              {{ $t('repair.repairKnowledgeBase.active') }}
            </RadioButton>
            <RadioButton value="DISABLED">
              {{ $t('repair.repairKnowledgeBase.disabled') }}
            </RadioButton>
          </RadioGroup>
        </FormItem>

        <FormItem style="margin-bottom: 0">
          <Space>
            <Button @click="handleReset">{{ $t('common.reset') }}</Button>
            <Button type="primary" @click="handleQuery">
              <Icon icon="mdi:magnify" class="inline-block align-middle" />
              {{ $t('common.search') }}
            </Button>
          </Space>
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

        <!-- 状态插槽 -->
        <template #status="{ row }">
          <Switch
            :checked="row.status === 'NORMAL'"
            :checked-text="$t('repair.repairKnowledgeBase.active')"
            :un-checked-text="$t('repair.repairKnowledgeBase.disabled')"
            @change="handleToggleStatus(row)"
          />
        </template>

        <!-- 操作插槽 -->
        <template #action="{ row }">
          <Space :size="0">
            <Tooltip>
              <template #title>{{ $t('common.view') }}</template>
              <Button type="link" @click="handleDetail(row)">
                <Icon
                  icon="mdi:eye-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="author.includes('编辑')">
              <template #title>{{ $t('common.edit') }}</template>
              <Button type="link" @click="handleEdit(row)">
                <Icon
                  icon="mdi:pencil-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="author.includes('删除')">
              <template #title>{{ $t('common.delete') }}</template>
              <Button type="link" danger @click="handleDelete(row)">
                <Icon
                  icon="mdi:delete-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 新增/编辑抽屉 -->
    <RepairKnowledgeDrawer
      v-model:open="drawerVisible"
      :row="currentRow"
      :mode="drawerMode"
      @success="onDrawerSuccess"
    />
  </Page>
</template>

<style scoped></style>
