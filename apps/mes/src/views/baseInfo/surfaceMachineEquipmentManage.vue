<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiEditOutline, MdiLightDelete, MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Space,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addSurfaceMachine,
  deleteSurfaceMachine,
  listSurfaceMachines,
  updateSurfaceMachine,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格操作
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', title: $t('baseInfo.serialNumber'), width: 60 },
    { field: 'equipCode', title: $t('baseInfo.equipCode'), minWidth: 120 },
    { field: 'equipName', title: $t('baseInfo.equipName'), minWidth: 150 },
    { field: 'type', title: $t('baseInfo.type'), minWidth: 100 },
    {
      field: 'purchaseDate',
      title: $t('baseInfo.purchaseDate'),
      minWidth: 130,
    },
    {
      field: 'replaceCycleHours',
      title: $t('baseInfo.replaceCycleHours'),
      minWidth: 150,
    },
    {
      field: 'actualUsageHours',
      title: $t('baseInfo.actualUsageHours'),
      minWidth: 160,
    },
    {
      field: 'isDelete',
      title: $t('baseInfo.status'),
      minWidth: 100,
      slots: { default: 'isDelete' },
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('baseInfo.action'),
      minWidth: 120,
    },
  ],
  height: 500,
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
  proxyConfig: {
    ajax: {
      query: ({ page }) => {
        return listSurfaceMachines({
          ...queryParams.value,
          pageNum: page?.currentPage,
          pageSize: page?.pageSize,
        }).then((response) => ({
          total: response.total || 0,
          items: response.list || [],
        }));
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// endregion

// region 查询条件
const queryParams = ref({
  equipCode: undefined as string | undefined,
  type: undefined as string | undefined,
  pageNum: 1,
  pageSize: 10,
});

// endregion

// region 抽屉/弹框
const showEditDrawer = ref(false);
const editMode = ref(false);
const formRef = ref();

const formData = ref({
  equipCode: '',
  equipName: '',
  id: undefined as number | undefined,
  purchaseDate: undefined as string | undefined,
  replaceCycleHours: undefined as number | undefined,
  type: '',
});

const rules: any = {
  equipCode: [
    { required: true, message: $t('baseInfo.inputEquipCode'), trigger: 'blur' },
  ],
  equipName: [
    { required: true, message: $t('baseInfo.inputEquipName'), trigger: 'blur' },
  ],
  purchaseDate: [
    {
      required: true,
      message: $t('baseInfo.selectPurchaseDate'),
      trigger: 'change',
    },
  ],
  replaceCycleHours: [
    {
      required: true,
      message: $t('baseInfo.inputReplaceCycleHours'),
      trigger: 'blur',
    },
  ],
  type: [
    {
      required: true,
      message: $t('baseInfo.selectPlaceholder'),
      trigger: 'blur',
    },
  ],
};

// endregion

// region 权限
const author = ref<string[]>([]);

onMounted(() => {
  loadAuthor();
});

/**
 * 加载权限
 */
function loadAuthor() {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
}

/**
 * 查询
 */
function handleSearch() {
  queryParams.value.pageNum = 1;
  gridApi.reload();
}

/**
 * 重置
 */
function handleReset() {
  queryParams.value = {
    equipCode: undefined,
    type: undefined,
    pageNum: 1,
    pageSize: 10,
  };
  gridApi.reload();
}

/**
 * 新增
 */
function handleAdd() {
  editMode.value = false;
  formData.value = {
    equipCode: '',
    equipName: '',
    id: undefined,
    purchaseDate: undefined,
    replaceCycleHours: undefined,
    type: '',
  };
  showEditDrawer.value = true;
  formRef.value?.clearValidate();
}

/**
 * 编辑
 */
function handleEdit(row: any) {
  editMode.value = true;
  formData.value = {
    equipCode: row.equipCode,
    equipName: row.equipName,
    id: row.id,
    purchaseDate: row.purchaseDate,
    replaceCycleHours: row.replaceCycleHours,
    type: row.type,
  };
  showEditDrawer.value = true;
  formRef.value?.clearValidate();
}

/**
 * 删除
 */
function handleDelete(row: any) {
  Modal.confirm({
    title: $t('baseInfo.confirmTitle'),
    content: $t('baseInfo.confirmContent'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    okType: 'danger',
    onOk() {
      deleteSurfaceMachine(row.id).then(() => {
        message.success($t('baseInfo.deleteSuccess'));
        gridApi.reload();
      });
    },
  });
}

/**
 * 提交表单
 */
function handleSubmit() {
  formRef.value?.validate().then(() => {
    const { equipCode, equipName, id, purchaseDate, replaceCycleHours, type } =
      formData.value;
    const params = {
      equipCode,
      equipName,
      purchaseDate: purchaseDate ?? '',
      replaceCycleHours: replaceCycleHours ?? 0,
      type,
    };
    if (editMode.value) {
      updateSurfaceMachine({ id: id ?? 0, ...params }).then(() => {
        message.success($t('baseInfo.updateSuccess'));
        handleClose();
        gridApi.reload();
      });
    } else {
      addSurfaceMachine(params).then(() => {
        message.success($t('baseInfo.createSuccess'));
        handleClose();
        gridApi.reload();
      });
    }
  });
}

/**
 * 关闭抽屉
 */
function handleClose() {
  showEditDrawer.value = false;
  formData.value = {
    equipCode: '',
    equipName: '',
    id: undefined,
    purchaseDate: undefined,
    replaceCycleHours: undefined,
    type: '',
  };
  formRef.value?.resetFields();
}
</script>

<template>
  <Page>
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem :label="$t('baseInfo.equipCode')">
          <Input
            v-model:value="queryParams.equipCode"
            allow-clear
            :placeholder="$t('baseInfo.inputEquipCode')"
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.type')">
          <Input
            v-model:value="queryParams.type"
            allow-clear
            :placeholder="$t('baseInfo.selectPlaceholder')"
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            @click="handleSearch"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
        <FormItem>
          <Button @click="handleReset">
            {{ $t('common.reset') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <Card>
      <Grid>
        <template #toolbar-tools>
          <Button
            v-if="author.includes('新增')"
            type="primary"
            @click="handleAdd"
          >
            {{ $t('common.add') }}
          </Button>
        </template>

        <template #isDelete="{ row }">
          <Tag :color="row.isDelete === 1 ? 'success' : 'error'">
            {{
              row.isDelete === 1
                ? $t('baseInfo.notDeleted')
                : $t('baseInfo.deleted')
            }}
          </Tag>
        </template>

        <template #action="{ row }">
          <Space :size="8">
            <Tooltip v-if="author.includes('编辑')">
              <template #title>
                {{ $t('common.edit') }}
              </template>
              <Button
                :icon="h(MdiEditOutline, { class: 'inline-block size-6' })"
                type="link"
                @click="handleEdit(row)"
              />
            </Tooltip>
            <Tooltip v-if="author.includes('删除')">
              <template #title>
                {{ $t('common.delete') }}
              </template>
              <Button
                :icon="h(MdiLightDelete, { class: 'inline-block size-6' })"
                danger
                type="link"
                @click="handleDelete(row)"
              />
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 编辑抽屉 -->
    <Drawer
      v-model:open="showEditDrawer"
      :title="editMode ? $t('baseInfo.edit') : $t('baseInfo.add')"
      :width="680"
      :footer-style="{ textAlign: 'right' }"
    >
      <Form
        ref="formRef"
        :label-col="{ span: 6 }"
        :model="formData"
        :rules="rules"
        :wrapper-col="{ span: 18 }"
        autocomplete="off"
      >
        <FormItem :label="$t('baseInfo.equipCode')" name="equipCode">
          <Input
            v-model:value="formData.equipCode"
            :max-length="50"
            :placeholder="$t('baseInfo.inputEquipCode')"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.equipName')" name="equipName">
          <Input
            v-model:value="formData.equipName"
            :max-length="50"
            :placeholder="$t('baseInfo.inputEquipName')"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.type')" name="type">
          <Input
            v-model:value="formData.type"
            :max-length="50"
            :placeholder="$t('baseInfo.selectPlaceholder')"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.purchaseDate')" name="purchaseDate">
          <DatePicker
            v-model:value="formData.purchaseDate"
            value-format="YYYY-MM-DD"
            :placeholder="$t('baseInfo.selectPurchaseDate')"
            style="width: 100%"
          />
        </FormItem>
        <FormItem
          :label="$t('baseInfo.replaceCycleHours')"
          name="replaceCycleHours"
        >
          <InputNumber
            v-model:value="formData.replaceCycleHours"
            :min="0"
            :placeholder="$t('baseInfo.inputReplaceCycleHours')"
            style="width: 100%"
          />
        </FormItem>
      </Form>
      <template #footer>
        <Space>
          <Button @click="handleClose">{{ $t('common.cancel') }}</Button>
          <Button type="primary" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>
