<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiEditOutline, MdiLightDelete, MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  RadioButton,
  RadioGroup,
  Space,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { createTray, deleteTray, listTrays, updateTray } from '#/api';
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
    { field: 'palletCode', title: $t('baseInfo.palletCode'), minWidth: 140 },
    { field: 'palletName', title: $t('baseInfo.palletName'), minWidth: 140 },
    {
      field: 'loadCapacity',
      title: $t('baseInfo.loadCapacity'),
      minWidth: 120,
    },
    {
      field: 'status',
      title: $t('baseInfo.status'),
      minWidth: 90,
      slots: { default: 'status' },
    },
    { field: 'remark', title: $t('baseInfo.remark'), minWidth: 140 },
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
        return listTrays({
          ...queryParams.value,
          pageNum: page?.currentPage,
          pageSize: page?.pageSize,
        }).then((response) => ({
          total: response.total || 0,
          items: response.results || [],
        }));
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// endregion

// region 查询条件
const queryParams = ref({
  palletCode: undefined as string | undefined,
  palletName: undefined as string | undefined,
  status: undefined as number | undefined,
  pageNum: 1,
  pageSize: 10,
});

// endregion

// region 抽屉/弹框
const showEditDrawer = ref(false);
const editMode = ref(false);
const formRef = ref();

const formData = ref({
  id: undefined as number | undefined,
  palletCode: '',
  palletName: '',
  loadCapacity: undefined as number | undefined,
  status: 1,
  remark: '',
});

const rules: any = {
  palletCode: [
    {
      required: true,
      message: $t('baseInfo.inputPalletCode'),
      trigger: 'blur',
    },
  ],
  palletName: [
    {
      required: true,
      message: $t('baseInfo.inputPalletName'),
      trigger: 'blur',
    },
  ],
  loadCapacity: [
    {
      required: true,
      message: $t('baseInfo.inputLoadCapacity'),
      trigger: 'blur',
    },
    {
      validator: (_rule: any, value: any) => {
        if (value === undefined || value === null || value === '') {
          return Promise.reject($t('baseInfo.inputLoadCapacity'));
        }
        if (Number(value) <= 0) {
          return Promise.reject($t('baseInfo.inputLoadCapacity'));
        }
        return Promise.resolve();
      },
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
    palletCode: undefined,
    palletName: undefined,
    status: undefined,
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
    id: undefined,
    palletCode: '',
    palletName: '',
    loadCapacity: undefined,
    status: 1,
    remark: '',
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
    id: row.id,
    palletCode: row.palletCode,
    palletName: row.palletName,
    loadCapacity: row.loadCapacity,
    status: row.status,
    remark: row.remark,
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
      deleteTray(row.id).then(() => {
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
    const { id, palletCode, palletName, loadCapacity, status, remark } =
      formData.value;
    if (editMode.value) {
      updateTray({
        id: id!,
        palletCode,
        palletName,
        loadCapacity: loadCapacity!,
        status,
        remark,
      }).then(() => {
        message.success($t('baseInfo.updateSuccess'));
        handleClose();
        gridApi.reload();
      });
    } else {
      createTray({
        palletCode,
        palletName,
        loadCapacity: loadCapacity!,
        status,
        remark,
      }).then(() => {
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
    id: undefined,
    palletCode: '',
    palletName: '',
    loadCapacity: undefined,
    status: 1,
    remark: '',
  };
  formRef.value?.resetFields();
}
</script>

<template>
  <Page>
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem :label="$t('baseInfo.palletCode')">
          <Input
            v-model:value="queryParams.palletCode"
            allow-clear
            :placeholder="$t('baseInfo.inputPalletCode')"
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.palletName')">
          <Input
            v-model:value="queryParams.palletName"
            allow-clear
            :placeholder="$t('baseInfo.inputPalletName')"
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.status')">
          <RadioGroup v-model:value="queryParams.status">
            <RadioButton :value="undefined">
              {{ $t('page.common.all') }}
            </RadioButton>
            <RadioButton :value="1">
              {{ $t('baseInfo.enable') }}
            </RadioButton>
            <RadioButton :value="0">
              {{ $t('baseInfo.disable') }}
            </RadioButton>
          </RadioGroup>
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

        <template #status="{ row }">
          <Tag :color="row.status === 1 ? 'success' : 'default'">
            {{
              row.status === 1 ? $t('baseInfo.enable') : $t('baseInfo.disable')
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

    <!-- 新增/编辑抽屉 -->
    <Drawer
      v-model:open="showEditDrawer"
      :title="editMode ? $t('baseInfo.edit') : $t('baseInfo.add')"
      :width="480"
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
        <FormItem :label="$t('baseInfo.palletCode')" name="palletCode">
          <Input
            v-model:value="formData.palletCode"
            :max-length="50"
            :placeholder="$t('baseInfo.inputPalletCode')"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.palletName')" name="palletName">
          <Input
            v-model:value="formData.palletName"
            :max-length="50"
            :placeholder="$t('baseInfo.inputPalletName')"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.loadCapacity')" name="loadCapacity">
          <InputNumber
            v-model:value="formData.loadCapacity"
            :min="0"
            :precision="2"
            style="width: 100%"
            :placeholder="$t('baseInfo.inputLoadCapacity')"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.status')" name="status">
          <RadioGroup v-model:value="formData.status">
            <RadioButton :value="1">
              {{ $t('baseInfo.enable') }}
            </RadioButton>
            <RadioButton :value="0">
              {{ $t('baseInfo.disable') }}
            </RadioButton>
          </RadioGroup>
        </FormItem>
        <FormItem :label="$t('baseInfo.remark')" name="remark">
          <Input
            v-model:value="formData.remark"
            :max-length="200"
            :placeholder="$t('baseInfo.inputRemark')"
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
