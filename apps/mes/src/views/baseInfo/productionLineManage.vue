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
  createProductionLine,
  deleteProductionLine,
  listProductionAreas,
  listProductionLines,
  updateProductionLine,
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
    { field: 'groupId', title: $t('baseInfo.productionArea'), minWidth: 150 },
    { field: 'lineCode', title: $t('baseInfo.lineCode'), minWidth: 150 },
    { field: 'lineName', title: $t('baseInfo.lineName'), minWidth: 150 },
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
        return listProductionLines({
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
  groupId: undefined as number | undefined,
  lineCode: undefined as string | undefined,
  lineName: undefined as string | undefined,
  pageNum: 1,
  pageSize: 10,
});

// endregion

// region 字典数据
const productionAreaList = ref<any[]>([]);

// endregion

// region 抽屉/弹框
const showEditDrawer = ref(false);
const editMode = ref(false);
const formRef = ref();

const formData = ref({
  groupId: undefined as number | undefined,
  id: undefined as number | undefined,
  lineCode: '',
  lineName: '',
});

const rules: any = {
  groupId: [
    { required: true, message: $t('baseInfo.selectProductionArea'), trigger: 'change' },
  ],
  lineCode: [
    { required: true, message: $t('baseInfo.inputLineCode'), trigger: 'blur' },
  ],
  lineName: [
    { required: true, message: $t('baseInfo.inputLineName'), trigger: 'blur' },
  ],
};

// endregion

// region 权限
const author = ref<string[]>([]);

onMounted(() => {
  loadProductionAreaList();
  loadAuthor();
});

/**
 * 加载生产区列表
 */
function loadProductionAreaList() {
  listProductionAreas({}).then((response) => {
    productionAreaList.value = response.list || [];
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
    groupId: undefined,
    lineCode: undefined,
    lineName: undefined,
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
    groupId: undefined,
    id: undefined,
    lineCode: '',
    lineName: '',
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
    groupId: row.groupId,
    id: row.id,
    lineCode: row.lineCode,
    lineName: row.lineName,
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
      deleteProductionLine(row.id).then(() => {
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
    const { id, groupId, lineCode, lineName } = formData.value;
    if (editMode.value) {
      updateProductionLine({ id: id!, groupId: groupId!, lineCode, lineName }).then(() => {
        message.success($t('baseInfo.updateSuccess'));
        handleClose();
        gridApi.reload();
      });
    } else {
      createProductionLine({ groupId: groupId!, lineCode, lineName }).then(() => {
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
    groupId: undefined,
    id: undefined,
    lineCode: '',
    lineName: '',
  };
  formRef.value?.resetFields();
}
</script>

<template>
  <Page>
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem :label="$t('baseInfo.productionArea')">
          <Select
            v-model:value="queryParams.groupId"
            allow-clear
            :placeholder="$t('baseInfo.selectProductionArea')"
            style="width: 200px"
          >
            <SelectOption
              v-for="item in productionAreaList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.lineGroupName }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem :label="$t('baseInfo.lineCode')">
          <Input
            v-model:value="queryParams.lineCode"
            allow-clear
            :placeholder="$t('baseInfo.inputLineCode')"
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.lineName')">
          <Input
            v-model:value="queryParams.lineName"
            allow-clear
            :placeholder="$t('baseInfo.inputLineName')"
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
        <FormItem :label="$t('baseInfo.productionArea')" name="groupId">
          <Select
            v-model:value="formData.groupId"
            allow-clear
            :placeholder="$t('baseInfo.selectProductionArea')"
            style="width: 100%"
          >
            <SelectOption
              v-for="item in productionAreaList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.lineGroupName }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem :label="$t('baseInfo.lineCode')" name="lineCode">
          <Input
            v-model:value="formData.lineCode"
            :max-length="50"
            :placeholder="$t('baseInfo.inputLineCode')"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.lineName')" name="lineName">
          <Input
            v-model:value="formData.lineName"
            :max-length="50"
            :placeholder="$t('baseInfo.inputLineName')"
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
