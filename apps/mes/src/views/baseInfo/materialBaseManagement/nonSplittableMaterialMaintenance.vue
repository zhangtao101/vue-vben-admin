<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

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
  Radio,
  RadioGroup,
  Space,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createMaterialDescription,
  deleteMaterialDescription,
  queryMaterialDescriptionList,
  updateMaterialDescription,
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
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    {
      field: 'materialCode',
      title: $t('baseInfo.materialCode'),
      minWidth: 150,
    },
    {
      field: 'description',
      title: $t('baseInfo.materialFeature'),
      minWidth: 250,
    },
    {
      field: 'inseparable',
      title: $t('baseInfo.inseparable'),
      minWidth: 120,
      slots: { default: 'inseparable' },
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('baseInfo.action'),
      width: 120,
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  pagerConfig: {
    enabled: true,
    pageSize: 20,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          page: page?.currentPage,
          pageSize: page?.pageSize,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// endregion

// region 数据查询

// 查询参数
const queryParams = ref({
  // 材料编号
  materialCode: '',
  // 物料特征
  description: '',
});

/**
 * 查询数据
 * 调用分页查询接口，返回表格所需的数据列表与总条数
 * @param {any} params 分页参数（page 当前页码，pageSize 每页条数）
 * @returns {Promise<any>} 表格数据 promise
 * @since 2026-10-19 10:00:00
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    queryMaterialDescriptionList({
      ...queryParams.value,
      pageNum: page,
      pageSize,
    })
      .then((response: any) => {
        const data = response.data || response;
        resolve({
          total: data.total || 0,
          items: data.results || [],
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// endregion

// region 新增 / 编辑

// 抽屉是否显示
const showEditDrawer = ref(false);
// 是否编辑（false 为新增）
const isEdit = ref(false);
// 表单数据
const formData = ref<any>({
  id: undefined,
  materialCode: '',
  description: '',
  // 1=不可拆分料，0=可拆分料
  inseparable: 1,
});
// 表单校验规则
const formRules = ref<any>({
  materialCode: [
    { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
  ],
});
// 表单对象
const formRef = ref();

/**
 * 打开新增抽屉
 * @since 2026-10-19 10:00:00
 */
function handleAdd() {
  isEdit.value = false;
  formData.value = {
    id: undefined,
    materialCode: '',
    description: '',
    inseparable: 1,
  };
  showEditDrawer.value = true;
  formRef.value?.clearValidate();
}

/**
 * 打开编辑抽屉
 * @param {any} row 当前行数据
 * @since 2026-10-19 10:00:00
 */
function handleEdit(row: any) {
  isEdit.value = true;
  formData.value = {
    id: row.id,
    materialCode: row.materialCode,
    description: row.description,
    // 历史数据无该字段时默认按不可拆分料回显
    inseparable: row.inseparable === undefined ? 1 : Number(row.inseparable),
  };
  showEditDrawer.value = true;
  formRef.value?.clearValidate();
}

/**
 * 关闭抽屉
 * @since 2026-10-19 10:00:00
 */
function onClose() {
  showEditDrawer.value = false;
}

/**
 * 提交表单（新增 / 修改）
 * 后端保存成功后返回 null，前端重新查询列表
 * @since 2026-10-19 10:00:00
 */
function submitForm() {
  formRef.value?.validate().then(() => {
    const params = {
      id: formData.value.id,
      materialCode: formData.value.materialCode,
      description: formData.value.description,
      inseparable: formData.value.inseparable,
    };
    const request = isEdit.value
      ? updateMaterialDescription(params)
      : createMaterialDescription({
          materialCode: params.materialCode,
          description: params.description,
          inseparable: params.inseparable,
        });
    request.then(() => {
      message.success(
        isEdit.value
          ? $t('baseInfo.modifySuccess')
          : $t('baseInfo.createSuccess'),
      );
      onClose();
      gridApi.reload();
    });
  });
}

// endregion

// region 删除

/**
 * 删除不可拆分料
 * @param {any} row 当前行数据
 * @since 2026-10-19 10:00:00
 */
function handleDelete(row: any) {
  Modal.confirm({
    title: $t('common.prompt'),
    content: $t('baseInfo.confirmDelete'),
    onOk: () => {
      deleteMaterialDescription(row.id).then(() => {
        message.success($t('baseInfo.deleteSuccess'));
        gridApi.reload();
      });
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
    <!-- region 搜索 -->
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 材料编号 -->
        <FormItem
          :label="$t('baseInfo.materialCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialCode" />
        </FormItem>
        <!-- 物料特征 -->
        <FormItem
          :label="$t('baseInfo.materialFeature')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.description" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="gridApi.reload()"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 表格主体 -->
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
        <template #inseparable="{ row }">
          <Tag :color="Number(row.inseparable) === 1 ? 'red' : 'green'">
            {{
              Number(row.inseparable) === 1
                ? $t('baseInfo.inseparableYes')
                : $t('baseInfo.inseparableNo')
            }}
          </Tag>
        </template>
        <template #action="{ row }">
          <Space>
            <!-- 编辑 -->
            <Tooltip v-if="author.includes('编辑')">
              <template #title>{{ $t('common.edit') }}</template>
              <Button
                :icon="
                  h(Icon, {
                    icon: 'mdi:pencil-outline',
                    class: 'inline-block size-6',
                  })
                "
                class="mx-1"
                type="link"
                @click="handleEdit(row)"
              />
            </Tooltip>

            <!-- 删除 -->
            <Tooltip v-if="author.includes('删除')">
              <template #title>{{ $t('common.delete') }}</template>
              <Button
                :icon="
                  h(Icon, {
                    icon: 'mdi:delete-outline',
                    class: 'inline-block size-6',
                  })
                "
                class="mx-1"
                danger
                type="link"
                @click="handleDelete(row)"
              />
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- region 新增 / 编辑 -->
    <Drawer
      v-model:open="showEditDrawer"
      :footer-style="{ textAlign: 'right' }"
      :title="isEdit ? $t('common.edit') : $t('common.add')"
      :width="600"
      placement="right"
    >
      <Form
        ref="formRef"
        :label-col="{ span: 8 }"
        :model="formData"
        :rules="formRules"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
      >
        <!-- 材料编号 -->
        <FormItem :label="$t('baseInfo.materialCode')" name="materialCode">
          <Input
            v-model:value="formData.materialCode"
            :maxlength="255"
            :placeholder="$t('baseInfo.inputPlaceholder')"
          />
        </FormItem>
        <!-- 物料特征 -->
        <FormItem :label="$t('baseInfo.materialFeature')" name="description">
          <Input
            v-model:value="formData.description"
            :maxlength="255"
            :placeholder="$t('baseInfo.inputPlaceholder')"
          />
        </FormItem>
        <!-- 不可拆分标识 -->
        <FormItem :label="$t('baseInfo.inseparable')" name="inseparable">
          <RadioGroup v-model:value="formData.inseparable">
            <Radio :value="1">{{ $t('baseInfo.inseparableYes') }}</Radio>
            <Radio :value="0">{{ $t('baseInfo.inseparableNo') }}</Radio>
          </RadioGroup>
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="onClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="submitForm">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
