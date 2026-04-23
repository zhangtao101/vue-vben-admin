<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、VXE Grid、@iconify/vue，以及 listResource、insertResource、updateResource、deleteResource API
 * [OUTPUT]: 对外提供资源管理页面组件
 * [POS]: 系统管理模块 的资源管理列表页面，支持资源的增删改查
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-22 10:06:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Drawer,
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
  deleteResource,
  insertResource,
  listResource,
  listSysPerson,
  openBiScreen,
  openReport,
  updateResource,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// AccessToken
const accessStore = useAccessStore();

// ========== 权限控制 ==========
const author = ref<string[]>([]);
const addButton = ref(false);
const editButton = ref(false);
const delButton = ref(false);

watch(
  () => author.value,
  () => {
    addButton.value = author.value.includes('新增');
    editButton.value = author.value.includes('编辑');
    delButton.value = author.value.includes('删除');
  },
);

// ========== 查询参数 ==========
const queryParams = ref<any>({
  name: '',
});

// ========== 表格配置 ==========
/**
 * 格式化租户显示文本
 * @param {any} row - 行数据
 * @returns {string} 租户显示文本
 */
function formatTenantCell(row: any) {
  const tenants = row.tenants || [];
  if (tenants.length === 0) return '-';
  return tenants
    .map((t: any) => `${t.tenantCode} - ${t.tenantName}`)
    .join('；');
}

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    { field: 'name', title: $t('system.resourceMgmt.name'), minWidth: 150 },
    { field: 'alink', title: $t('system.resourceMgmt.alink'), minWidth: 200 },
    {
      field: 'tenants',
      title: $t('system.resourceMgmt.tenant'),
      minWidth: 200,
      slots: { default: 'tenant' },
    },
    {
      field: 'createBy',
      title: $t('system.resourceMgmt.createBy'),
      minWidth: 100,
    },
    {
      field: 'createTime',
      title: $t('system.resourceMgmt.createTime'),
      minWidth: 160,
    },
    {
      field: 'action',
      title: $t('common.action'),
      width: 120,
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
/**
 * 查询资源列表数据
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页条数
 * @returns {Promise<{total: number, items: any[]}>} 分页数据
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

    listResource(params)
      .then(({ total, list }) => {
        resolve({
          total: total || 0,
          items: list || [],
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

// ========== 查询 ==========
/**
 * 执行查询操作
 */
function handleQuery() {
  gridApi.reload();
}

// ========== 重置 ==========
/**
 * 重置查询条件
 */
function handleReset() {
  queryParams.value = {
    name: '',
  };
  gridApi.reload();
}

// ========== 抽屉控制 ==========
const drawerVisible = ref(false);
const drawerMode = ref<'add' | 'edit'>('add');
const currentRow = ref<any>(null);
const formRef = ref<any>();

/**
 * 打开新增抽屉
 */
function handleAdd() {
  drawerMode.value = 'add';
  currentRow.value = null;
  drawerVisible.value = true;
}

/**
 * 打开编辑抽屉
 * @param {any} row - 当前行数据
 */
function handleEdit(row: any) {
  drawerMode.value = 'edit';
  currentRow.value = { ...row };
  drawerVisible.value = true;
}

/**
 * 关闭抽屉
 */
function handleClose() {
  drawerVisible.value = false;
  currentRow.value = null;
}

/**
 * 删除资源
 * @param {any} row - 当前行数据
 */
function handleDelete(row: any) {
  Modal.confirm({
    title: '确认删除该数据吗？',
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消删除');
    },
    onOk() {
      deleteResource(row.id)
        .then(() => {
          message.success($t('common.successfulOperation'));
          gridApi.reload();
        })
        .catch(() => {
          message.error($t('common.operationFailure'));
        });
    },
  });
}

// ========== 表单数据 ==========
const formData = ref({
  name: '',
  alink: '',
  selectedTenants: [] as string[],
  tenants: [] as { tenantCode: string; tenantName: string }[],
});

// ========== 用户下拉选项（远程搜索） ==========
const tenantOptions = ref<any[]>([]);

/**
 * 远程搜索用户列表
 * @param {string} keyword - 搜索关键字
 */
function searchTenant(keyword: string) {
  // 保留已选中的选项
  const selectedValues = formData.value.selectedTenants;
  if (!keyword) {
    // 无关键字时，只保留已选中的选项
    tenantOptions.value = tenantOptions.value.filter((item) =>
      selectedValues.includes(item.value),
    );
    return;
  }
  listSysPerson({ perName: keyword, pageNum: 1, pageSize: 50 }).then(
    (res: any) => {
      const list = res.list || res || [];
      const searchResults = list.map((item: any) => ({
        label: `${item.workNumber} - ${item.perName}`,
        value: item.workNumber,
        tenantName: item.perName,
      }));
      // 合并已选中选项和新搜索结果，去重
      const existingValues = new Set(
        tenantOptions.value.map((item) => item.value),
      );
      const mergedOptions = [...tenantOptions.value];
      searchResults.forEach((item: any) => {
        if (!existingValues.has(item.value)) {
          mergedOptions.push(item);
        }
      });
      tenantOptions.value = mergedOptions;
    },
  );
}

/**
 * 用户选择变更时自动构建 tenants 数组
 * @param {any} values - 选择的用户编号数组
 */
function onTenantChange(values: any) {
  formData.value.tenants = values.map((code: string) => {
    const option = tenantOptions.value.find((item) => item.value === code);
    return {
      tenantCode: code,
      tenantName: option?.tenantName || '',
    };
  });
}

// ========== 数据报表 ==========
/**
 * 打开数据报表
 */
function handleOpenReport() {
  const token = accessStore.accessToken;
  openReport({ token }).then((res: any) => {
    if (res) {
      window.open(res, '_blank');
    }
  });
}

// ========== 数据大屏 ==========
/**
 * 打开数据大屏
 */
function handleOpenBiScreen() {
  const token = accessStore.accessToken;
  openBiScreen({ token }).then((res: any) => {
    if (res) {
      window.open(res, '_blank');
    }
  });
}

// ========== 表单验证规则 ==========
const rules: Record<string, any[]> = {
  name: [
    {
      required: true,
      message: `请输入${$t('system.resourceMgmt.name')}`,
      trigger: 'blur',
    },
  ],
  alink: [
    {
      required: true,
      message: `请输入${$t('system.resourceMgmt.alink')}`,
      trigger: 'blur',
    },
  ],
  selectedTenants: [
    {
      required: true,
      message: `请选择${$t('system.resourceMgmt.tenant')}`,
      trigger: 'change',
    },
  ],
};

// ========== 监听抽屉打开 ==========
watch(drawerVisible, (val) => {
  if (val) {
    if (drawerMode.value === 'edit' && currentRow.value) {
      // 编辑模式：从 tenants 数组构建 selectedTenants
      const tenants = currentRow.value.tenants || [];
      formData.value = {
        name: currentRow.value.name,
        alink: currentRow.value.alink,
        selectedTenants: tenants.map((t: any) => t.tenantCode),
        tenants: [...tenants],
      };
      // 预加载当前用户选项
      tenantOptions.value = tenants.map((t: any) => ({
        label: `${t.tenantCode} - ${t.tenantName}`,
        value: t.tenantCode,
        tenantName: t.tenantName,
      }));
    } else {
      // 新增模式
      formData.value = {
        name: '',
        alink: '',
        selectedTenants: [],
        tenants: [],
      };
    }
  }
});

/**
 * 提交表单
 */
function handleSubmit() {
  formRef.value
    .validate()
    .then(() => {
      const api = drawerMode.value === 'add' ? insertResource : updateResource;
      const params = {
        name: formData.value.name,
        alink: formData.value.alink,
        tenants: formData.value.tenants,
        ...(drawerMode.value === 'edit' ? { id: currentRow.value.id } : {}),
      };

      api(params)
        .then(() => {
          message.success($t('common.successfulOperation'));
          handleClose();
          gridApi.reload();
        })
        .catch(() => {
          message.error($t('common.operationFailure'));
        });
    })
    .catch(() => {
      // 验证失败
    });
}

// ========== 初始化 ==========
onMounted(() => {
  queryAuth(route.meta.code as string).then((data: any) => {
    author.value = data;
  });
});
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 资源名称 -->
        <FormItem
          :label="$t('system.resourceMgmt.name')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.name"
            :placeholder="`请输入${$t('system.resourceMgmt.name')}`"
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
        <!-- 工具栏按钮 -->
        <template #toolbar-tools>
          <Space>
            <Button @click="handleOpenReport">
              <Icon icon="mdi:chart-bar" class="inline-block align-middle" />
              数据报表
            </Button>
            <Button @click="handleOpenBiScreen">
              <Icon
                icon="mdi:television-classic"
                class="inline-block align-middle"
              />
              数据大屏
            </Button>
            <Button v-if="addButton" type="primary" @click="handleAdd">
              <Icon icon="mdi:plus" class="inline-block align-middle" />
              {{ $t('common.add') }}
            </Button>
          </Space>
        </template>

        <!-- 租户插槽 -->
        <template #tenant="{ row }">
          <span>{{ formatTenantCell(row) }}</span>
        </template>

        <!-- 操作插槽 -->
        <template #action="{ row }">
          <Space>
            <Tooltip>
              <template #title>{{ $t('common.edit') }}</template>
              <Button
                v-if="editButton"
                type="link"
                class="px-1"
                @click="handleEdit(row)"
              >
                <Icon
                  icon="mdi:pencil-outline"
                  class="inline-block align-middle text-lg"
                />
              </Button>
            </Tooltip>

            <Tooltip>
              <template #title>{{ $t('common.delete') }}</template>
              <Button
                v-if="delButton"
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

    <!-- 新增/编辑抽屉 -->
    <Drawer
      v-model:open="drawerVisible"
      :title="drawerMode === 'add' ? $t('common.add') : $t('common.edit')"
      width="500"
      :destroy-on-close="true"
      @close="handleClose"
    >
      <Form
        ref="formRef"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        :model="formData"
        :rules="rules"
      >
        <FormItem :label="$t('system.resourceMgmt.name')" name="name">
          <Input
            v-model:value="formData.name"
            :placeholder="`请输入${$t('system.resourceMgmt.name')}`"
          />
        </FormItem>

        <FormItem :label="$t('system.resourceMgmt.alink')" name="alink">
          <Input
            v-model:value="formData.alink"
            :placeholder="`请输入${$t('system.resourceMgmt.alink')}`"
          />
        </FormItem>

        <FormItem
          :label="$t('system.resourceMgmt.tenant')"
          name="selectedTenants"
        >
          <Select
            v-model:value="formData.selectedTenants"
            mode="multiple"
            show-search
            :placeholder="`请选择${$t('system.resourceMgmt.tenant')}`"
            :filter-option="false"
            :max-tag-count="2"
            allow-clear
            @search="searchTenant"
            @change="onTenantChange"
          >
            <SelectOption
              v-for="item in tenantOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </SelectOption>
          </Select>
        </FormItem>
      </Form>

      <template #footer>
        <div class="flex justify-end">
          <Space>
            <Button @click="handleClose">{{ $t('common.cancel') }}</Button>
            <Button type="primary" @click="handleSubmit">
              {{ $t('common.confirm') }}
            </Button>
          </Space>
        </div>
      </template>
    </Drawer>
  </Page>
</template>
