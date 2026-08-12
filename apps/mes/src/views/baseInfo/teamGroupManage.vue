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
  createTeamGroup,
  deleteTeamGroup,
  listSubProductionLines,
  listTeamGroups,
  updateTeamGroup,
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
    { field: 'subLineName', title: $t('baseInfo.subProductionLine'), minWidth: 150 },
    { field: 'groupCode', title: $t('baseInfo.groupCode'), minWidth: 150 },
    { field: 'groupName', title: $t('baseInfo.groupName'), minWidth: 150 },
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
        return listTeamGroups({
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
  subLineId: undefined as number | undefined,
  groupCode: undefined as string | undefined,
  groupName: undefined as string | undefined,
  pageNum: 1,
  pageSize: 10,
});

// endregion

// region 字典数据
const subLineList = ref<any[]>([]);

// endregion

// region 抽屉/弹框
const showEditDrawer = ref(false);
const editMode = ref(false);
const formRef = ref();

const formData = ref({
  groupCode: '',
  groupName: '',
  id: undefined as number | undefined,
  remark: '',
  subLineId: undefined as number | undefined,
});

const rules: any = {
  subLineId: [
    { required: true, message: $t('baseInfo.selectSubProductionLine'), trigger: 'change', asyncValidator: (rule, value, callback) => {
      return new Promise((resolve, reject) => {
        if (value) {
          resolve('too young');  // reject with error message
        } else {
          resolve('');
        }
      });
    },
    }
  ],
  groupCode: [
    { required: true, message: $t('baseInfo.inputGroupCode'), trigger: 'blur' },
  ],
  groupName: [
    { required: true, message: $t('baseInfo.inputGroupName'), trigger: 'blur' },
  ],
};

// endregion

// region 权限
const author = ref<string[]>([]);

onMounted(() => {
  loadSubLineList();
  loadAuthor();
});

/**
 * 加载子产线列表
 */
function loadSubLineList() {
  listSubProductionLines({}).then((response) => {
    subLineList.value = response.list || [];
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
    subLineId: undefined,
    groupCode: undefined,
    groupName: undefined,
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
    groupCode: '',
    groupName: '',
    id: undefined,
    remark: '',
    subLineId: undefined,
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
    groupCode: row.groupCode,
    groupName: row.groupName,
    id: row.id,
    remark: row.remark || '',
    subLineId: row.subLineId,
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
      deleteTeamGroup(row.id).then(() => {
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
    const { id, subLineId, groupCode, groupName, remark } = formData.value;
    if (editMode.value) {
      updateTeamGroup({ id: id!, subLineId: subLineId!, groupCode, groupName, remark }).then(
        () => {
          message.success($t('baseInfo.updateSuccess'));
          handleClose();
          gridApi.reload();
        },
      );
    } else {
      createTeamGroup({ subLineId: subLineId!, groupCode, groupName, remark }).then(() => {
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
    groupCode: '',
    groupName: '',
    id: undefined,
    remark: '',
    subLineId: undefined,
  };
  formRef.value?.resetFields();
}
</script>

<template>
  <Page>
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem :label="$t('baseInfo.subProductionLine')">
          <Select
            v-model:value="queryParams.subLineId"
            allow-clear
            :placeholder="$t('baseInfo.selectSubProductionLine')"
            style="width: 200px"
          >
            <SelectOption
              v-for="item in subLineList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.subLineName }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem :label="$t('baseInfo.groupCode')">
          <Input
            v-model:value="queryParams.groupCode"
            allow-clear
            :placeholder="$t('baseInfo.inputGroupCode')"
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.groupName')">
          <Input
            v-model:value="queryParams.groupName"
            allow-clear
            :placeholder="$t('baseInfo.inputGroupName')"
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
        <FormItem :label="$t('baseInfo.subProductionLine')" name="subLineId">
          <Select
            v-model:value="formData.subLineId"
            allow-clear
            :placeholder="$t('baseInfo.selectSubProductionLine')"
            style="width: 100%"
          >
            <SelectOption
              v-for="item in subLineList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.subLineName }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem :label="$t('baseInfo.groupCode')" name="groupCode">
          <Input
            v-model:value="formData.groupCode"
            :max-length="50"
            :placeholder="$t('baseInfo.inputGroupCode')"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.groupName')" name="groupName">
          <Input
            v-model:value="formData.groupName"
            :max-length="50"
            :placeholder="$t('baseInfo.inputGroupName')"
          />
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
