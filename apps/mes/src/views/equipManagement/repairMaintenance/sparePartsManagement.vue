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
  Select,
  SelectOption,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteSparePart,
  getSparePartPage,
  searchBaseConfig,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import SparePartDrawer from '#/util/component/SparePartDrawer.vue';

// ========== 权限 ==========
const route = useRoute();
const author = ref<string[]>([]);

// ========== 备件类型选项 ==========
const spareTypeOptions = ref<any[]>([]);

function loadSpareTypeOptions() {
  searchBaseConfig({ configType: 'SPARE_TYPE' }).then((res: any[]) => {
    spareTypeOptions.value = (res || []).map((item: any) => ({
      label: item.configName,
      value: item.configCode,
    }));
  });
}

onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  loadSpareTypeOptions();
});

// ========== 查询参数 ==========
const queryParams = ref<any>({
  spareCode: undefined,
  spareName: undefined,
  spareType: undefined,
  equipmentGroup: undefined,
});

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    {
      field: 'spareCode',
      title: $t('repair.sparePart.spareCode'),
      minWidth: 120,
    },
    {
      field: 'spareName',
      title: $t('repair.sparePart.spareName'),
      minWidth: 150,
    },
    {
      field: 'spareModel',
      title: $t('repair.sparePart.spareModel'),
      minWidth: 120,
    },
    {
      field: 'spareTypeName',
      title: $t('repair.sparePart.spareType'),
      minWidth: 100,
    },
    {
      field: 'equipmentGroup',
      title: $t('repair.sparePart.equipmentGroup'),
      minWidth: 120,
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
    getSparePartPage(params)
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
    spareCode: undefined,
    spareName: undefined,
    spareType: undefined,
    equipmentGroup: undefined,
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

// 删除
function handleDelete(row: any) {
  Modal.confirm({
    title: $t('repair.sparePart.confirmDelete'),
    content: `确定要删除备件「${row.spareName}」吗？`,
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      deleteSparePart(row.id).then(() => {
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
        <!-- 备件编码 -->
        <FormItem
          :label="$t('repair.sparePart.spareCode')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.spareCode"
            :placeholder="`请输入${$t('repair.sparePart.spareCode')}`"
            allow-clear
            style="width: 160px"
          />
        </FormItem>

        <!-- 备件名称 -->
        <FormItem
          :label="$t('repair.sparePart.spareName')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.spareName"
            :placeholder="`请输入${$t('repair.sparePart.spareName')}`"
            allow-clear
            style="width: 160px"
          />
        </FormItem>

        <!-- 备件类型 -->
        <FormItem
          :label="$t('repair.sparePart.spareType')"
          style="margin-bottom: 0"
        >
          <Select
            v-model:value="queryParams.spareType"
            :placeholder="`请选择${$t('repair.sparePart.spareType')}`"
            allow-clear
            style="width: 160px"
          >
            <SelectOption
              v-for="item in spareTypeOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </SelectOption>
          </Select>
        </FormItem>

        <!-- 适用设备组 -->
        <FormItem
          :label="$t('repair.sparePart.equipmentGroup')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.equipmentGroup"
            :placeholder="`请输入${$t('repair.sparePart.equipmentGroup')}`"
            allow-clear
            style="width: 160px"
          />
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
    <SparePartDrawer
      v-model:open="drawerVisible"
      :row="currentRow"
      :mode="drawerMode"
      @success="onDrawerSuccess"
    />
  </Page>
</template>

<style scoped></style>
