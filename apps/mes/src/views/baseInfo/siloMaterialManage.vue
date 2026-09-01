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
  message,
  Modal,
  Select,
  SelectOption,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addSiloMaterial,
  deleteSiloMaterial,
  listMaterialInfos,
  listSiloMaterials,
  updateSiloMaterial,
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
      field: 'materialCode',
      title: $t('baseInfo.materialCode'),
      minWidth: 120,
    },
    {
      field: 'materialName',
      title: $t('baseInfo.materialName'),
      minWidth: 150,
    },
    {
      field: 'purchaseDate',
      title: $t('baseInfo.purchaseDate'),
      minWidth: 130,
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
        return listSiloMaterials({
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
  equipName: undefined as string | undefined,
  pageNum: 1,
  pageSize: 10,
});

// endregion

// region 字典数据
const materialList = ref<any[]>([]);

// endregion

// region 抽屉/弹框
const showEditDrawer = ref(false);
const editMode = ref(false);
const formRef = ref();

const formData = ref({
  equipCode: '',
  equipName: '',
  id: undefined as number | undefined,
  materialCode: undefined as string | undefined,
  materialName: '',
  purchaseDate: undefined as string | undefined,
  type: '',
});

const rules: any = {
  equipCode: [
    { required: true, message: $t('baseInfo.inputEquipCode'), trigger: 'blur' },
  ],
  equipName: [
    { required: true, message: $t('baseInfo.inputEquipName'), trigger: 'blur' },
  ],
  materialCode: [
    {
      required: true,
      message: $t('baseInfo.selectMaterial'),
      trigger: 'change',
    },
  ],
  materialName: [
    { required: true, message: $t('baseInfo.selectMaterial'), trigger: 'blur' },
  ],
  purchaseDate: [
    {
      required: true,
      message: $t('baseInfo.selectPurchaseDate'),
      trigger: 'change',
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
  loadMaterialList();
  loadAuthor();
});

/**
 * 加载物料下拉列表
 */
function loadMaterialList() {
  listMaterialInfos({}).then((response) => {
    materialList.value = response.results || [];
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
    equipCode: undefined,
    equipName: undefined,
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
    materialCode: undefined,
    materialName: '',
    purchaseDate: undefined,
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
    materialCode: row.materialCode,
    materialName: row.materialName,
    purchaseDate: row.purchaseDate,
    type: row.type,
  };
  showEditDrawer.value = true;
  formRef.value?.clearValidate();
}

/**
 * 物料选择联动带出物料名称
 */
function handleMaterialChange(code: any) {
  const item = materialList.value.find((m) => m.materialCode === code);
  formData.value.materialName = item?.materialName || '';
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
      deleteSiloMaterial(row.id).then(() => {
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
    const {
      equipCode,
      equipName,
      id,
      materialCode,
      materialName,
      purchaseDate,
      type,
    } = formData.value;
    const params = {
      equipCode,
      equipName,
      materialCode: materialCode ?? '',
      materialName,
      purchaseDate: purchaseDate ?? '',
      type,
    };
    if (editMode.value) {
      updateSiloMaterial({ id: id ?? 0, ...params }).then(() => {
        message.success($t('baseInfo.updateSuccess'));
        handleClose();
        gridApi.reload();
      });
    } else {
      addSiloMaterial(params).then(() => {
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
    materialCode: undefined,
    materialName: '',
    purchaseDate: undefined,
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
        <FormItem :label="$t('baseInfo.equipName')">
          <Input
            v-model:value="queryParams.equipName"
            allow-clear
            :placeholder="$t('baseInfo.inputEquipName')"
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
        <FormItem :label="$t('baseInfo.materialCode')" name="materialCode">
          <Select
            v-model:value="formData.materialCode"
            allow-clear
            show-search
            :filter-option="
              (input: string, option: any) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
            "
            :placeholder="$t('baseInfo.selectMaterial')"
            style="width: 100%"
            @change="handleMaterialChange"
          >
            <SelectOption
              v-for="item in materialList"
              :key="item.materialCode"
              :value="item.materialCode"
              :label="`${item.materialCode} - ${item.materialName}`"
            >
              {{ item.materialCode }} - {{ item.materialName }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem :label="$t('baseInfo.materialName')" name="materialName">
          <Input
            v-model:value="formData.materialName"
            :max-length="100"
            disabled
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
