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
  createSubProductionLine,
  deleteSubProductionLine,
  listProductionLines,
  listSubProductionLines,
  updateSubProductionLine,
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
    { field: 'lineName', title: $t('baseInfo.productionLine'), minWidth: 150 },
    { field: 'subLineCode', title: $t('baseInfo.subLineCode'), minWidth: 150 },
    { field: 'subLineName', title: $t('baseInfo.subLineName'), minWidth: 150 },
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
        return listSubProductionLines({
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
  lineId: undefined as number | undefined,
  subLineCode: undefined as string | undefined,
  subLineName: undefined as string | undefined,
  pageNum: 1,
  pageSize: 10,
});

// endregion

// region 字典数据
const productionLineList = ref<any[]>([]);

// endregion

// region 抽屉/弹框
const showEditDrawer = ref(false);
const editMode = ref(false);
const formRef = ref();

const formData = ref({
  id: undefined as number | undefined,
  lineId: undefined as number | undefined,
  subLineCode: '',
  subLineName: '',
});

const rules: any = {
  lineId: [
    { required: true, message: $t('baseInfo.selectProductionLine'), trigger: 'change' },
  ],
  subLineCode: [
    { required: true, message: $t('baseInfo.inputSubLineCode'), trigger: 'blur' },
  ],
  subLineName: [
    { required: true, message: $t('baseInfo.inputSubLineName'), trigger: 'blur' },
  ],
};

// endregion

// region 权限
const author = ref<string[]>([]);

onMounted(() => {
  loadProductionLineList();
  loadAuthor();
});

/**
 * 加载产线列表
 */
function loadProductionLineList() {
  listProductionLines({}).then((response) => {
    productionLineList.value = response.list || [];
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
    lineId: undefined,
    subLineCode: undefined,
    subLineName: undefined,
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
    lineId: undefined,
    subLineCode: '',
    subLineName: '',
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
    lineId: row.lineId,
    subLineCode: row.subLineCode,
    subLineName: row.subLineName,
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
      deleteSubProductionLine(row.id).then(() => {
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
    const { id, lineId, subLineCode, subLineName } = formData.value;
    if (editMode.value) {
      updateSubProductionLine({ id: id!, lineId: lineId!, subLineCode, subLineName }).then(
        () => {
          message.success($t('baseInfo.updateSuccess'));
          handleClose();
          gridApi.reload();
        },
      );
    } else {
      createSubProductionLine({ lineId: lineId!, subLineCode, subLineName }).then(() => {
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
    lineId: undefined,
    subLineCode: '',
    subLineName: '',
  };
  formRef.value?.resetFields();
}
</script>

<template>
  <Page>
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem :label="$t('baseInfo.productionLine')">
          <Select
            v-model:value="queryParams.lineId"
            allow-clear
            :placeholder="$t('baseInfo.selectProductionLine')"
            style="width: 200px"
          >
            <SelectOption
              v-for="item in productionLineList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.lineName }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem :label="$t('baseInfo.subLineCode')">
          <Input
            v-model:value="queryParams.subLineCode"
            allow-clear
            :placeholder="$t('baseInfo.inputSubLineCode')"
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.subLineName')">
          <Input
            v-model:value="queryParams.subLineName"
            allow-clear
            :placeholder="$t('baseInfo.inputSubLineName')"
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
        <FormItem :label="$t('baseInfo.productionLine')" name="lineId">
          <Select
            v-model:value="formData.lineId"
            allow-clear
            :placeholder="$t('baseInfo.selectProductionLine')"
            style="width: 100%"
          >
            <SelectOption
              v-for="item in productionLineList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.lineName }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem :label="$t('baseInfo.subLineCode')" name="subLineCode">
          <Input
            v-model:value="formData.subLineCode"
            :max-length="50"
            :placeholder="$t('baseInfo.inputSubLineCode')"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.subLineName')" name="subLineName">
          <Input
            v-model:value="formData.subLineName"
            :max-length="50"
            :placeholder="$t('baseInfo.inputSubLineName')"
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
