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
  message,
  Modal,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { addLevel, deleteLevel, listLevels, updateLevel } from '#/api';
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
    { field: 'gradeCode', title: $t('baseInfo.gradeCode'), minWidth: 150 },
    { field: 'gradeName', title: $t('baseInfo.gradeName'), minWidth: 150 },
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
        return listLevels({
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
  gradeCode: undefined as string | undefined,
  pageNum: 1,
  pageSize: 10,
});

// endregion

// region 抽屉/弹框
const showEditDrawer = ref(false);
const editMode = ref(false);
const formRef = ref();

const formData = ref({
  gradeCode: '',
  gradeName: '',
  id: undefined as number | undefined,
});

const rules: any = {
  gradeCode: [
    { required: true, message: $t('baseInfo.inputGradeCode'), trigger: 'blur' },
  ],
  gradeName: [
    { required: true, message: $t('baseInfo.inputGradeName'), trigger: 'blur' },
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
    gradeCode: undefined,
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
    gradeCode: '',
    gradeName: '',
    id: undefined,
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
    gradeCode: row.gradeCode,
    gradeName: row.gradeName,
    id: row.id,
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
      deleteLevel(row.id).then(() => {
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
    const { gradeCode, gradeName, id } = formData.value;
    const params = {
      gradeCode,
      gradeName,
    };
    if (editMode.value) {
      updateLevel({ id: id ?? 0, ...params }).then(() => {
        message.success($t('baseInfo.updateSuccess'));
        handleClose();
        gridApi.reload();
      });
    } else {
      addLevel(params).then(() => {
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
    gradeCode: '',
    gradeName: '',
    id: undefined,
  };
  formRef.value?.resetFields();
}
</script>

<template>
  <Page>
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem :label="$t('baseInfo.gradeCode')">
          <Input
            v-model:value="queryParams.gradeCode"
            allow-clear
            :placeholder="$t('baseInfo.inputGradeCode')"
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
        <FormItem :label="$t('baseInfo.gradeCode')" name="gradeCode">
          <Input
            v-model:value="formData.gradeCode"
            :max-length="50"
            :placeholder="$t('baseInfo.inputGradeCode')"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.gradeName')" name="gradeName">
          <Input
            v-model:value="formData.gradeName"
            :max-length="50"
            :placeholder="$t('baseInfo.inputGradeName')"
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
