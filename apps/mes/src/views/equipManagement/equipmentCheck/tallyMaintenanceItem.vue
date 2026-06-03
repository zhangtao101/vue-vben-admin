<script lang="ts" setup>
/**
 * [INPUT]: 依赖 #/api 的 tallyMaintenanceItem API 完成点检保养项增删改查，依赖 #/util/auth 的 queryAuth 获取按钮权限
 * [OUTPUT]: 对外提供点检保养项维护列表页面，包含分页查询、新增/编辑抽屉、删除确认
 * [POS]: 设备管理 > 设备点检 > 点检保养项维护页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-06-03 13:09:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

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
  Radio,
  RadioGroup,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createTallyMaintenanceItem,
  deleteTallyMaintenanceItem,
  getTallyEquipmentListByName,
  getTallyMaintenanceItemById,
  getTallyMaintenanceItemList,
  updateTallyMaintenanceItem,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util/auth';

// ========== 权限控制 ==========
const route = useRoute();
const author = ref<string[]>([]);

// ========== 查询参数 ==========
const queryParams = ref<any>({
  equipName: '',
  checkItemName: '',
  checkItemCode: '',
  itemType: undefined,
});

// 点检类型下拉选项
const itemTypeOptions = [
  { label: '数值型', value: 1 },
  { label: '文本型', value: 2 },
];

// 通用专用选项
const isSpecialOptions = [
  { label: '通用', value: 1 },
  { label: '专用', value: 2 },
];

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: '序号' },
    { field: 'checkItemCode', title: '点检项编号', minWidth: 120 },
    { field: 'checkItemName', title: '点检项名称', minWidth: 120 },
    { field: 'itemDescription', title: '点检项说明', minWidth: 140 },
    { field: 'itemTypeName', title: '点检项类型', minWidth: 100 },
    { field: 'equipName', title: '设备名称', minWidth: 120 },
    { field: 'dailyTagName', title: '日常标记', minWidth: 80 },
    { field: 'maintenanceTagName', title: '保养标记', minWidth: 80 },
    { field: 'isUseName', title: '启停用标记', minWidth: 90 },
    { field: 'isSpecialName', title: '通用专用', minWidth: 80 },
    {
      field: 'action',
      title: '操作',
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
  scrollY: {
    enabled: true,
    gt: 30,
  },
  scrollX: {
    enabled: true,
    gt: 0,
  },
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
    getTallyMaintenanceItemList(params)
      .then((data: any) => {
        resolve({
          total: data?.total || 0,
          items: data?.results || data?.list || [],
        });
      })
      .catch(() => {
        resolve({ total: 0, items: [] });
      });
  });
}

// ========== 重置 ==========
function handleReset() {
  queryParams.value = {
    equipName: '',
    checkItemName: '',
    checkItemCode: '',
    itemType: undefined,
  };
  gridApi.reload();
}

// ========== 删除 ==========
function handleDelete(row: any) {
  Modal.confirm({
    title: '提示',
    content: '确定要删除吗？',
    okText: '确认',
    cancelText: '取消',
    okButtonProps: { danger: true },
    onOk() {
      return new Promise((resolve) => {
        deleteTallyMaintenanceItem(row.id)
          .then(() => {
            message.success($t('common.successfulOperation'));
            gridApi.reload();
            resolve(true);
          })
          .catch(() => resolve(false));
      });
    },
  });
}

// ========== 抽屉控制 ==========
const drawerVisible = ref(false);
const drawerMode = ref<'add' | 'edit' | 'view'>('add');
const drawerLoading = ref(false);
const formRef = ref();

// 表单数据
const formData = ref<any>({
  checkItemCode: '',
  checkItemName: '',
  itemDescription: '',
  itemType: 1,
  isSpecial: 1,
  equipMessage: undefined,
  equipName: undefined,
  equipCode: undefined,
  equipTypeCode: undefined,
  dailyTag: 1,
  maintenanceTag: 1,
  isUse: 1,
});

// 表单校验规则
const rules: Record<string, any[]> = {
  checkItemCode: [
    { required: true, message: '此项为必填项', trigger: 'change' },
  ],
  checkItemName: [
    { required: true, message: '此项为必填项', trigger: 'change' },
  ],
  itemDescription: [
    { required: true, message: '此项为必填项', trigger: 'change' },
  ],
  itemType: [{ required: true, message: '此项为必填项', trigger: 'change' }],
  isSpecial: [
    { required: true, message: '此项为必填项', trigger: 'change' },
  ],
  equipName: [{ required: false, message: '此项为必填项', trigger: 'change' }],
  dailyTag: [
    { required: true, message: '此项为必填项', trigger: 'change' },
  ],
  maintenanceTag: [
    { required: true, message: '此项为必填项', trigger: 'change' },
  ],
  isUse: [{ required: true, message: '此项为必填项', trigger: 'change' }],
};

// 设备远程搜索
const equipOptions = ref<any[]>([]);
const equipLoading = ref(false);

function remoteSearchEquip(keyword: string) {
  if (!keyword) {
    equipOptions.value = [];
    return;
  }
  equipLoading.value = true;
  getTallyEquipmentListByName(keyword)
    .then((data: any) => {
      equipOptions.value = (data || []).map((item: any) => ({
        label: item.name,
        value: `${item.name}_${item.code}`,
      }));
    })
    .finally(() => {
      equipLoading.value = false;
    });
}

function handleEquipChange(value: any) {
  if (!value) {
    formData.value.equipName = undefined;
    formData.value.equipCode = undefined;
    formData.value.equipTypeCode = undefined;
    return;
  }
  const arr = value.split('_');
  formData.value.equipName = arr[0];
  formData.value.equipCode = arr[1];
  formData.value.equipTypeCode = arr[1];
}

// 新增
function handleAdd() {
  formData.value = {
    checkItemCode: '',
    checkItemName: '',
    itemDescription: '',
    itemType: 1,
    isSpecial: 1,
    equipMessage: undefined,
    equipName: undefined,
    equipCode: undefined,
    equipTypeCode: undefined,
    dailyTag: 1,
    maintenanceTag: 1,
    isUse: 1,
  };
  equipOptions.value = [];
  drawerMode.value = 'add';
  drawerVisible.value = true;
  formRef.value?.clearValidate();
}

// 编辑
function handleEdit(row: any) {
  getTallyMaintenanceItemById(row.id).then((data: any) => {
    const item = data || {};
    formData.value = {
      ...item,
      equipMessage: item.equipName
        ? `${item.equipName}_${item.equipCode || ''}`
        : undefined,
    };
    drawerMode.value = 'edit';
    drawerVisible.value = true;
    formRef.value?.clearValidate();
  });
}

// 监听通用专用切换，清空设备
watch(
  () => formData.value.isSpecial,
  (val) => {
    if (val === 1) {
      formData.value.equipMessage = undefined;
      formData.value.equipName = undefined;
      formData.value.equipCode = undefined;
      formData.value.equipTypeCode = undefined;
      equipOptions.value = [];
    }
  },
);

// 表单提交
function handleSubmit() {
  formRef.value?.validate().then(() => {
    if (formData.value.isSpecial === 1) {
      formData.value.equipName = undefined;
      formData.value.equipCode = undefined;
    } else {
      if (!formData.value.equipName || !formData.value.equipTypeCode) {
        message.warning('请选择具体的设备');
        return;
      }
    }

    drawerLoading.value = true;
    const apiCall =
      drawerMode.value === 'add'
        ? createTallyMaintenanceItem(formData.value)
        : updateTallyMaintenanceItem(formData.value);

    apiCall
      .then(() => {
        message.success($t('common.successfulOperation'));
        drawerVisible.value = false;
        gridApi.reload();
      })
      .finally(() => {
        drawerLoading.value = false;
      });
  });
}

// ========== 初始化 ==========
onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form layout="inline">
        <FormItem label="设备名称" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.equipName"
            placeholder="请输入设备名称"
            allow-clear
            style="width: 180px"
          />
        </FormItem>
        <FormItem label="点检项名称" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.checkItemName"
            placeholder="请输入点检项名称"
            allow-clear
            style="width: 180px"
          />
        </FormItem>
        <FormItem label="点检项编号" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.checkItemCode"
            placeholder="请输入点检项编号"
            allow-clear
            style="width: 180px"
          />
        </FormItem>
        <FormItem label="点检类型" style="margin-bottom: 1em">
          <Select
            v-model:value="queryParams.itemType"
            placeholder="请选择"
            allow-clear
            :options="itemTypeOptions"
            style="width: 160px"
          />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button @click="handleReset">
            {{ $t('common.reset') }}
          </Button>
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
            type="primary"
            v-if="author.includes('新增')"
            @click="handleAdd"
          >
            <Icon icon="mdi:plus" class="mr-1 inline-block align-middle" />
            新增
          </Button>
        </template>

        <template #action="{ row }">
          <Space>
            <Tooltip>
              <template #title>编辑</template>
              <Button
                type="link"
                v-if="author.includes('编辑')"
                @click="handleEdit(row)"
                class="px-1"
              >
                <Icon
                  icon="mdi:pencil-outline"
                  class="inline-block align-middle text-lg"
                />
              </Button>
            </Tooltip>
            <Tooltip>
              <template #title>删除</template>
              <Button
                type="link"
                danger
                v-if="author.includes('删除')"
                @click="handleDelete(row)"
                class="px-1"
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
      :title="drawerMode === 'add' ? '新增点检保养项' : '编辑点检保养项'"
      width="600"
      :destroy-on-close="true"
      :footer-style="{ textAlign: 'right' }"
    >
      <Form
        ref="formRef"
        :model="formData"
        :rules="rules"
        layout="vertical"
      >
        <!-- 点检项编号 -->
        <FormItem label="点检项编号：" name="checkItemCode">
          <Input
            v-model:value="formData.checkItemCode"
            :maxlength="64"
            :disabled="drawerMode === 'edit'"
            placeholder="请输入点检项编号"
          />
        </FormItem>
        <!-- 点检项名称 -->
        <FormItem label="点检项名称：" name="checkItemName">
          <Input
            v-model:value="formData.checkItemName"
            :maxlength="64"
            placeholder="请输入点检项名称"
          />
        </FormItem>
        <!-- 点检项说明 -->
        <FormItem label="点检项说明：" name="itemDescription">
          <Input
            v-model:value="formData.itemDescription"
            :maxlength="64"
            placeholder="请输入点检项说明"
          />
        </FormItem>
        <!-- 点检项类型 -->
        <FormItem label="点检项类型：" name="itemType">
          <Select
            v-model:value="formData.itemType"
            placeholder="请选择"
            :options="itemTypeOptions"
          />
        </FormItem>
        <!-- 通用专用 -->
        <FormItem label="通用专用：" name="isSpecial">
          <Select
            v-model:value="formData.isSpecial"
            placeholder="请选择"
            :options="isSpecialOptions"
          />
        </FormItem>
        <!-- 设备名称 -->
        <FormItem label="设备名称：" name="equipName">
          <Select
            v-model:value="formData.equipMessage"
            show-search
            :filter-option="false"
            placeholder="请输入关键词搜索"
            :loading="equipLoading"
            :options="equipOptions"
            :disabled="formData.isSpecial === 1"
            allow-clear
            @search="remoteSearchEquip"
            @change="handleEquipChange"
          />
        </FormItem>
        <!-- 日常标记 -->
        <FormItem label="日常标记：" name="dailyTag">
          <RadioGroup v-model:value="formData.dailyTag">
            <Radio :value="1">是</Radio>
            <Radio :value="2">否</Radio>
          </RadioGroup>
        </FormItem>
        <!-- 保养标记 -->
        <FormItem label="保养标记：" name="maintenanceTag">
          <RadioGroup v-model:value="formData.maintenanceTag">
            <Radio :value="1">是</Radio>
            <Radio :value="2">否</Radio>
          </RadioGroup>
        </FormItem>
        <!-- 启停用标记 -->
        <FormItem label="启停用标记：" name="isUse">
          <RadioGroup v-model:value="formData.isUse">
            <Radio :value="1">启用</Radio>
            <Radio :value="2">停用</Radio>
          </RadioGroup>
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <Button @click="drawerVisible = false">取消</Button>
          <Button type="primary" :loading="drawerLoading" @click="handleSubmit">
            保存
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
