<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, reactive, ref } from 'vue';
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
  Select,
  Space,
  Switch,
  Tag,
  Textarea,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createProductGroup,
  deleteProductGroup,
  listProductGroups,
  updateProductGroup,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格配置

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    { field: 'productGroupCode', title: $t('baseInfo.productGroupCode'), minWidth: 130 },
    { field: 'productGroupName', title: $t('baseInfo.productGroupName'), minWidth: 130 },
    { field: 'description', title: $t('baseInfo.description'), minWidth: 160 },
    {
      field: 'status',
      slots: { default: 'status' },
      title: $t('baseInfo.status'),
      minWidth: 100,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('baseInfo.action'),
      minWidth: 140,
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: { multiple: true },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
  proxyConfig: {
    ajax: {
      query: ({ page }) => {
        return queryData({
          page: page?.currentPage ?? 1,
          pageSize: page?.pageSize ?? 10,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// endregion

// region 数据查询

// 查询参数
const queryParams = reactive({
  productGroupCode: '',
  productGroupName: '',
  status: undefined as number | undefined,
});

// 状态选项
const statusOptions = [
  { value: undefined, label: $t('page.common.all') },
  { value: 1, label: $t('baseInfo.enable') },
  { value: 0, label: $t('baseInfo.disable') },
];

/**
 * 重置查询条件
 */
function handleReset() {
  queryParams.productGroupCode = '';
  queryParams.productGroupName = '';
  queryParams.status = undefined;
  gridApi.reload();
}

/**
 * 查询数据
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams };
    // 未选择状态时不传参
    if (params.status === undefined) {
      delete params.status;
    }
    params.pageNum = page;
    params.pageSize = pageSize;

    listProductGroups(params)
      .then((data: any) => {
        resolve({
          total: data?.total ?? 0,
          items: data?.results ?? [],
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// endregion

// region 新增 / 编辑抽屉

const editData = ref<any>({});
// 是否为新增/编辑状态
const isEdit = ref(false);
// 是否显示抽屉
const isOpen = ref(false);
// 是否为新增模式（新增时标题为"新增"，编辑时标题为"编辑"）
const isAdd = ref(false);

/**
 * 显示编辑/新增抽屉
 * @param row 当前行数据，新增时传 null
 * @param addOrEdit true=新增，false=编辑
 */
function showEdit(row: any | null, addOrEdit: boolean) {
  isAdd.value = addOrEdit;
  isEdit.value = true;
  editData.value = row
    ? { ...row }
    : {
        productGroupCode: '',
        productGroupName: '',
        description: '',
        status: 1,
      };
  isOpen.value = true;
}

function close() {
  isOpen.value = false;
  isEdit.value = false;
  editData.value = {};
}

/**
 * 提交表单
 */
function submit() {
  if (!editData.value.productGroupCode) {
    message.warning($t('baseInfo.inputProductGroupCode'));
    return;
  }
  if (!editData.value.productGroupName) {
    message.warning($t('baseInfo.inputProductGroupName'));
    return;
  }

  const action = isAdd.value
    ? createProductGroup(editData.value)
    : updateProductGroup(editData.value);

  action
    .then(() => {
      message.success(
        isAdd.value ? $t('baseInfo.createSuccess') : $t('baseInfo.modifySuccess'),
      );
      close();
      gridApi.reload();
    })
    .catch((error) => {
      message.error(error?.msg || $t('common.operationFailure'));
    });
}

// endregion

// region 删除

/**
 * 删除产品组
 * @param row 当前行数据
 */
function handleDelete(row: any) {
  Modal.confirm({
    title: $t('baseInfo.confirmTitle'),
    content: $t('baseInfo.confirmDelete'),
    onOk: () => {
      deleteProductGroup({ id: row.id })
        .then(() => {
          message.success($t('baseInfo.deleteSuccess'));
          gridApi.reload();
        })
        .catch((error) => {
          message.error(error?.msg || $t('common.operationFailure'));
        });
    },
    onCancel: () => {
      message.info($t('baseInfo.cancelPrompt'));
    },
  });
}

// endregion

// region 权限查询

// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 初始化

onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// endregion
</script>

<template>
  <Page>
    <!-- region 查询区 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 产品组编码 -->
        <FormItem
          :label="$t('baseInfo.productGroupCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.productGroupCode"
            :placeholder="$t('baseInfo.inputProductGroupCode')"
          />
        </FormItem>
        <!-- 产品组名称 -->
        <FormItem
          :label="$t('baseInfo.productGroupName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.productGroupName"
            :placeholder="$t('baseInfo.inputProductGroupName')"
          />
        </FormItem>
        <!-- 状态 -->
        <FormItem :label="$t('baseInfo.status')" style="margin-bottom: 1em">
          <Select
            v-model:value="queryParams.status"
            :options="statusOptions"
            style="width: 140px"
          />
        </FormItem>

        <FormItem>
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="() => gridApi.reload()"
          >
            {{ $t('common.search') }}
          </Button>
          <Button class="ml-2" @click="handleReset">
            <template #icon>
              <Icon icon="mdi:refresh" />
            </template>
            {{ $t('common.reset') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 表格区 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <Button
            v-if="author.includes('新增')"
            type="primary"
            @click="showEdit(null, true)"
          >
            <template #icon>
              <Icon icon="mdi:plus" />
            </template>
            {{ $t('common.add') }}
          </Button>
        </template>
        <template #status="{ row }">
          <Tag :color="row.status === 1 ? 'green' : 'red'">
            {{ row.status === 1 ? $t('baseInfo.enable') : $t('baseInfo.disable') }}
          </Tag>
        </template>
        <template #action="{ row }">
          <!-- 编辑按钮 -->
          <Tooltip v-if="author.includes('编辑')">
            <template #title>
              {{ $t('common.edit') }}
            </template>
            <Button class="mr-2" type="link" @click="showEdit(row, false)">
              <Icon icon="mdi:edit-outline" class="inline-block size-6" />
            </Button>
          </Tooltip>
          <!-- 删除按钮 -->
          <Tooltip v-if="author.includes('删除')">
            <template #title>
              {{ $t('common.delete') }}
            </template>
            <Button class="mr-2" type="link" @click="handleDelete(row)" danger>
              <Icon icon="mdi:delete-outline" class="inline-block size-6" />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- region 新增/编辑抽屉 -->
    <Drawer
      v-model:open="isOpen"
      :footer-style="{ textAlign: 'right' }"
      :title="isAdd ? $t('baseInfo.add') : $t('baseInfo.edit')"
      :width="560"
      class="custom-class"
      placement="right"
    >
      <Form
        :label-col="{ span: 5 }"
        :model="editData"
        :wrapper-col="{ span: 19 }"
        autocomplete="off"
      >
        <!-- 产品组编码 -->
        <FormItem
          :label="$t('baseInfo.productGroupCode')"
          name="productGroupCode"
        >
          <Input
            v-model:value="editData.productGroupCode"
            :placeholder="$t('baseInfo.inputProductGroupCode')"
            :disabled="!isAdd"
          />
        </FormItem>
        <!-- 产品组名称 -->
        <FormItem
          :label="$t('baseInfo.productGroupName')"
          name="productGroupName"
        >
          <Input
            v-model:value="editData.productGroupName"
            :placeholder="$t('baseInfo.inputProductGroupName')"
          />
        </FormItem>
        <!-- 产品组说明 -->
        <FormItem :label="$t('baseInfo.description')" name="description">
          <Textarea
            v-model:value="editData.description"
            :placeholder="$t('baseInfo.inputPlaceholder')"
            :rows="3"
          />
        </FormItem>
        <!-- 状态 -->
        <FormItem :label="$t('baseInfo.status')" name="status">
          <Switch
            :checked="editData.status === 1"
            :checked-children="$t('baseInfo.enable')"
            :un-checked-children="$t('baseInfo.disable')"
            @change="(val: any) => (editData.status = val ? 1 : 0)"
          />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="close">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 提交 -->
          <Button type="primary" @click="submit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
