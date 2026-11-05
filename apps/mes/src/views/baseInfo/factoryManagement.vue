<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

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
  RadioButton,
  RadioGroup,
  Space,
  Tag,
  Textarea,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createFactory,
  deleteFactory,
  listFactories,
  updateFactory,
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
    { field: 'factoryCode', title: $t('baseInfo.factoryCode'), minWidth: 150 },
    { field: 'factoryName', title: $t('baseInfo.factoryName'), minWidth: 180 },
    {
      field: 'status',
      title: $t('baseInfo.status'),
      minWidth: 100,
      slots: { default: 'status' },
    },
    { field: 'remark', title: $t('baseInfo.remark'), minWidth: 200 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('baseInfo.action'),
      minWidth: 150,
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
        return listFactories({
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
  factoryCode: undefined as string | undefined,
  factoryName: undefined as string | undefined,
  status: undefined as 0 | 1 | undefined,
  pageNum: 1,
  pageSize: 10,
});

const statusOptions = [
  { label: $t('baseInfo.statusEnabled'), value: 1 },
  { label: $t('baseInfo.statusDisabled'), value: 0 },
];

/** 查询区状态单选选项（含全部） */
const statusQueryOptions = [
  { label: $t('basic.all'), value: undefined },
  ...statusOptions,
];

// endregion

// region 抽屉/弹框
const showEditDrawer = ref(false);
const editMode = ref(false);
const formRef = ref();

const formData = ref({
  factoryCode: '',
  factoryName: '',
  id: undefined as number | undefined,
  remark: '',
  status: 1 as 0 | 1,
});

const rules: any = {
  factoryCode: [
    {
      required: true,
      message: $t('baseInfo.inputFactoryCode'),
      trigger: 'blur',
    },
  ],
  factoryName: [
    {
      required: true,
      message: $t('baseInfo.inputFactoryName'),
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

// endregion

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
    factoryCode: undefined,
    factoryName: undefined,
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
    factoryCode: '',
    factoryName: '',
    id: undefined,
    remark: '',
    status: 1,
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
    factoryCode: row.factoryCode,
    factoryName: row.factoryName,
    id: row.id,
    remark: row.remark || '',
    status: row.status,
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
      deleteFactory(row.id).then(() => {
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
    const { id, factoryCode, factoryName, status, remark } = formData.value;
    if (editMode.value) {
      updateFactory({
        id: id!,
        factoryCode,
        factoryName,
        status,
        remark,
      }).then(() => {
        message.success($t('baseInfo.updateSuccess'));
        handleClose();
        gridApi.reload();
      });
    } else {
      createFactory({
        factoryCode,
        factoryName,
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
    factoryCode: '',
    factoryName: '',
    id: undefined,
    remark: '',
    status: 1,
  };
  formRef.value?.resetFields();
}
</script>

<template>
  <Page>
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem :label="$t('baseInfo.factoryCode')">
          <Input
            v-model:value="queryParams.factoryCode"
            allow-clear
            :max-length="50"
            :placeholder="$t('baseInfo.inputFactoryCode')"
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.factoryName')">
          <Input
            v-model:value="queryParams.factoryName"
            allow-clear
            :max-length="100"
            :placeholder="$t('baseInfo.inputFactoryName')"
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.status')">
          <RadioGroup v-model:value="queryParams.status" button-style="solid">
            <RadioButton
              v-for="item in statusQueryOptions"
              :key="String(item.label)"
              :value="item.value"
            >
              {{ item.label }}
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
            {{ row.status === 1 ? $t('baseInfo.statusEnabled') : $t('baseInfo.statusDisabled') }}
          </Tag>
        </template>

        <template #action="{ row }">
          <Space :size="8">
            <Tooltip v-if="author.includes('编辑')">
              <template #title>
                {{ $t('common.edit') }}
              </template>
              <Button type="link" @click="handleEdit(row)">
                <Icon
                  icon="mdi:pencil-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="author.includes('删除')">
              <template #title>
                {{ $t('common.delete') }}
              </template>
              <Button danger type="link" @click="handleDelete(row)">
                <Icon
                  icon="mdi:delete-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
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
        <FormItem
          :label="$t('baseInfo.factoryCode')"
          :extra="editMode ? $t('baseInfo.factoryCodeNoEdit') : undefined"
          name="factoryCode"
        >
          <Input
            v-model:value="formData.factoryCode"
            :disabled="editMode"
            :max-length="50"
            :placeholder="$t('baseInfo.inputFactoryCode')"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.factoryName')" name="factoryName">
          <Input
            v-model:value="formData.factoryName"
            :max-length="100"
            :placeholder="$t('baseInfo.inputFactoryName')"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.status')" name="status">
          <RadioGroup v-model:value="formData.status" button-style="solid">
            <RadioButton
              v-for="item in statusOptions"
              :key="String(item.label)"
              :value="item.value"
            >
              {{ item.label }}
            </RadioButton>
          </RadioGroup>
        </FormItem>
        <FormItem :label="$t('baseInfo.remark')" name="remark">
          <Textarea
            v-model:value="formData.remark"
            :max-length="500"
            :rows="3"
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
