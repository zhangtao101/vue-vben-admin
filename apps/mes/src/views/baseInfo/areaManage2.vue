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
  Select,
  SelectOption,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addAreaManage2,
  deleteAreaManage2,
  listArea2LineGroups,
  listAreaManage2,
  updateAreaManage2,
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
    { field: 'areaCode', title: $t('baseInfo.areaCode'), minWidth: 120 },
    { field: 'areaName', title: $t('baseInfo.areaName'), minWidth: 150 },
    {
      field: 'lineGroupName',
      title: $t('baseInfo.areaLineGroup'),
      minWidth: 150,
    },
    { field: 'remark', title: $t('baseInfo.remark'), minWidth: 150 },
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
        return listAreaManage2({
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
  areaCode: undefined as string | undefined,
  lineGroupName: undefined as string | undefined,
  pageNum: 1,
  pageSize: 10,
});

// endregion

// region 字典数据
const lineGroupList = ref<any[]>([]);

// endregion

// region 抽屉/弹框
const showEditDrawer = ref(false);
const editMode = ref(false);
const formRef = ref();

const formData = ref({
  areaCode: '',
  areaName: '',
  id: undefined as number | undefined,
  lineGroupId: undefined as number | undefined,
  remark: '',
});

const rules: any = {
  areaCode: [
    { required: true, message: $t('baseInfo.inputAreaCode'), trigger: 'blur' },
  ],
  areaName: [
    { required: true, message: $t('baseInfo.inputAreaName'), trigger: 'blur' },
  ],
  lineGroupId: [
    {
      required: true,
      message: $t('baseInfo.selectAreaLineGroup'),
      trigger: 'change',
    },
  ],
};

// endregion

// region 权限
const author = ref<string[]>([]);

onMounted(() => {
  loadLineGroupList();
  loadAuthor();
});

/**
 * 加载产线组下拉列表
 */
function loadLineGroupList() {
  listArea2LineGroups().then((response) => {
    lineGroupList.value = response.list || [];
  });
}

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
    areaCode: undefined,
    lineGroupName: undefined,
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
    areaCode: '',
    areaName: '',
    id: undefined,
    lineGroupId: undefined,
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
    areaCode: row.areaCode,
    areaName: row.areaName,
    id: row.id,
    lineGroupId: row.lineGroupId,
    remark: row.remark || '',
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
      deleteAreaManage2(row.id).then(() => {
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
    const { areaCode, areaName, id, lineGroupId, remark } = formData.value;
    const params = {
      areaCode,
      areaName,
      lineGroupId: lineGroupId ?? 0,
      remark,
    };
    if (editMode.value) {
      updateAreaManage2({ id: id ?? 0, ...params }).then(() => {
        message.success($t('baseInfo.updateSuccess'));
        handleClose();
        gridApi.reload();
      });
    } else {
      addAreaManage2(params).then(() => {
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
    areaCode: '',
    areaName: '',
    id: undefined,
    lineGroupId: undefined,
    remark: '',
  };
  formRef.value?.resetFields();
}
</script>

<template>
  <Page>
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem :label="$t('baseInfo.areaCode')">
          <Input
            v-model:value="queryParams.areaCode"
            allow-clear
            :placeholder="$t('baseInfo.inputAreaCode')"
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.areaLineGroup')">
          <Input
            v-model:value="queryParams.lineGroupName"
            allow-clear
            :placeholder="$t('baseInfo.selectAreaLineGroup')"
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
        <FormItem :label="$t('baseInfo.areaCode')" name="areaCode">
          <Input
            v-model:value="formData.areaCode"
            :max-length="50"
            :placeholder="$t('baseInfo.inputAreaCode')"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.areaName')" name="areaName">
          <Input
            v-model:value="formData.areaName"
            :max-length="50"
            :placeholder="$t('baseInfo.inputAreaName')"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.areaLineGroup')" name="lineGroupId">
          <Select
            v-model:value="formData.lineGroupId"
            allow-clear
            :placeholder="$t('baseInfo.selectAreaLineGroup')"
            style="width: 100%"
          >
            <SelectOption
              v-for="item in lineGroupList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.lineGroupName }}
            </SelectOption>
          </Select>
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
