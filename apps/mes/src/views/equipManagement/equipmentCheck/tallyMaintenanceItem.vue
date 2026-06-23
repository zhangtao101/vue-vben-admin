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
  { label: $t('equip.tallyMaintenanceItem.numericType'), value: 1 },
  { label: $t('equip.tallyMaintenanceItem.textType'), value: 2 },
];

// 通用专用选项
const isSpecialOptions = [
  { label: $t('equip.tallyMaintenanceItem.universal'), value: 1 },
  { label: $t('equip.tallyMaintenanceItem.dedicated'), value: 2 },
];

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: $t('basic.laborHourEvaluation.sequence') },
    { field: 'checkItemCode', title: $t('equip.tallyMaintenanceItem.checkItemCode'), minWidth: 120 },
    { field: 'checkItemName', title: $t('equip.tallyMaintenanceItem.checkItemName'), minWidth: 120 },
    { field: 'itemDescription', title: $t('equip.tallyMaintenanceItem.itemDescription'), minWidth: 140 },
    { field: 'itemTypeName', title: $t('equip.tallyMaintenanceItem.itemType'), minWidth: 100 },
    { field: 'equipName', title: $t('equip.tallyMaintenanceItem.equipName'), minWidth: 120 },
    { field: 'dailyTagName', title: $t('equip.tallyMaintenanceItem.dailyTag'), minWidth: 80 },
    { field: 'maintenanceTagName', title: $t('equip.tallyMaintenanceItem.maintenanceTag'), minWidth: 80 },
    { field: 'isUseName', title: $t('equip.tallyMaintenanceItem.isUse'), minWidth: 90 },
    { field: 'isSpecialName', title: $t('equip.tallyMaintenanceItem.isSpecial'), minWidth: 80 },
    {
      field: 'action',
      title: $t('equip.operation'),
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
    title: $t('common.prompt'),
    content: $t('equip.tallyMaintenanceItem.confirmDelete'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
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
    { required: true, message: $t('equip.requiredField'), trigger: 'change' },
  ],
  checkItemName: [
    { required: true, message: $t('equip.requiredField'), trigger: 'change' },
  ],
  itemDescription: [
    { required: true, message: $t('equip.requiredField'), trigger: 'change' },
  ],
  itemType: [{ required: true, message: $t('equip.requiredField'), trigger: 'change' }],
  isSpecial: [{ required: true, message: $t('equip.requiredField'), trigger: 'change' }],
  equipName: [{ required: false, message: $t('equip.requiredField'), trigger: 'change' }],
  dailyTag: [{ required: true, message: $t('equip.requiredField'), trigger: 'change' }],
  maintenanceTag: [
    { required: true, message: $t('equip.requiredField'), trigger: 'change' },
  ],
  isUse: [{ required: true, message: $t('equip.requiredField'), trigger: 'change' }],
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
        message.warning($t('equip.tallyMaintenanceItem.selectEquipment'));
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
        <FormItem :label="$t('equip.tallyMaintenanceItem.equipName')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.equipName"
            :placeholder="$t('equip.tallyMaintenanceItem.enterEquipName')"
            allow-clear
            style="width: 180px"
          />
        </FormItem>
        <FormItem :label="$t('equip.tallyMaintenanceItem.checkItemName')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.checkItemName"
            :placeholder="$t('equip.tallyMaintenanceItem.enterCheckItemName')"
            allow-clear
            style="width: 180px"
          />
        </FormItem>
        <FormItem :label="$t('equip.tallyMaintenanceItem.checkItemCode')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.checkItemCode"
            :placeholder="$t('equip.tallyMaintenanceItem.enterCheckItemCode')"
            allow-clear
            style="width: 180px"
          />
        </FormItem>
        <FormItem :label="$t('equip.tallyMaintenanceItem.itemType')" style="margin-bottom: 1em">
          <Select
            v-model:value="queryParams.itemType"
            :placeholder="$t('equip.tallyMaintenanceItem.pleaseSelect')"
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
            {{ $t('common.add') }}
          </Button>
        </template>

        <template #action="{ row }">
          <Space>
            <Tooltip>
              <template #title>{{ $t('common.edit') }}</template>
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
              <template #title>{{ $t('common.delete') }}</template>
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
      :title="drawerMode === 'add' ? $t('equip.tallyMaintenanceItem.addTitle') : $t('equip.tallyMaintenanceItem.editTitle')"
      width="600"
      :destroy-on-close="true"
      :footer-style="{ textAlign: 'right' }"
    >
      <Form ref="formRef" :model="formData" :rules="rules" layout="vertical">
        <!-- 点检项编号 -->
        <FormItem :label="`${$t('equip.tallyMaintenanceItem.checkItemCode') }：`" name="checkItemCode">
          <Input
            v-model:value="formData.checkItemCode"
            :maxlength="64"
            :disabled="drawerMode === 'edit'"
            :placeholder="$t('equip.tallyMaintenanceItem.enterCheckItemCode')"
          />
        </FormItem>
        <!-- 点检项名称 -->
        <FormItem :label="`${$t('equip.tallyMaintenanceItem.checkItemName') }：`" name="checkItemName">
          <Input
            v-model:value="formData.checkItemName"
            :maxlength="64"
            :placeholder="$t('equip.tallyMaintenanceItem.enterCheckItemName')"
          />
        </FormItem>
        <!-- 点检项说明 -->
        <FormItem :label="`${$t('equip.tallyMaintenanceItem.itemDescription') }：`" name="itemDescription">
          <Input
            v-model:value="formData.itemDescription"
            :maxlength="64"
            :placeholder="$t('equip.tallyMaintenanceItem.enterItemDescription')"
          />
        </FormItem>
        <!-- 点检项类型 -->
        <FormItem :label="`${$t('equip.tallyMaintenanceItem.itemType') }：`" name="itemType">
          <Select
            v-model:value="formData.itemType"
            :placeholder="$t('equip.tallyMaintenanceItem.pleaseSelect')"
            :options="itemTypeOptions"
          />
        </FormItem>
        <!-- 通用专用 -->
        <FormItem :label="`${$t('equip.tallyMaintenanceItem.isSpecial') }：`" name="isSpecial">
          <Select
            v-model:value="formData.isSpecial"
            :placeholder="$t('equip.tallyMaintenanceItem.pleaseSelect')"
            :options="isSpecialOptions"
          />
        </FormItem>
        <!-- 设备名称 -->
        <FormItem :label="`${$t('equip.tallyMaintenanceItem.equipName') }：`" name="equipName">
          <Select
            v-model:value="formData.equipMessage"
            show-search
            :filter-option="false"
            :placeholder="$t('equip.tallyMaintenanceItem.keywordSearch')"
            :loading="equipLoading"
            :options="equipOptions"
            :disabled="formData.isSpecial === 1"
            allow-clear
            @search="remoteSearchEquip"
            @change="handleEquipChange"
          />
        </FormItem>
        <!-- 日常标记 -->
        <FormItem :label="`${$t('equip.tallyMaintenanceItem.dailyTag') }：`" name="dailyTag">
          <RadioGroup v-model:value="formData.dailyTag">
            <Radio :value="1">{{ $t('equip.tallyMaintenanceItem.yes') }}</Radio>
            <Radio :value="2">{{ $t('equip.tallyMaintenanceItem.no') }}</Radio>
          </RadioGroup>
        </FormItem>
        <!-- 保养标记 -->
        <FormItem :label="`${$t('equip.tallyMaintenanceItem.maintenanceTag') }：`" name="maintenanceTag">
          <RadioGroup v-model:value="formData.maintenanceTag">
            <Radio :value="1">{{ $t('equip.tallyMaintenanceItem.yes') }}</Radio>
            <Radio :value="2">{{ $t('equip.tallyMaintenanceItem.no') }}</Radio>
          </RadioGroup>
        </FormItem>
        <!-- 启停用标记 -->
        <FormItem :label="`${$t('equip.tallyMaintenanceItem.isUse') }：`" name="isUse">
          <RadioGroup v-model:value="formData.isUse">
            <Radio :value="1">{{ $t('equip.tallyMaintenanceItem.enableRadio') }}</Radio>
            <Radio :value="2">{{ $t('equip.tallyMaintenanceItem.disableRadio') }}</Radio>
          </RadioGroup>
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <Button @click="drawerVisible = false">{{ $t('common.cancel') }}</Button>
          <Button type="primary" :loading="drawerLoading" @click="handleSubmit">
            {{ $t('equip.tallyMaintenanceItem.save') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
