<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiEditOutline, MdiLightDelete, MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
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
  createProductLine,
  deleteProductLine,
  listWordListByParentCode,
  queryProcessList,
  queryProductLineDetail,
  queryProductLineList,
  updateProductLine,
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
    {
      field: 'workshopName',
      title: '车间',
      minWidth: 100,
    },
    {
      field: 'lineName',
      title: '生产线名称',
      minWidth: 150,
    },
    {
      field: 'processName',
      title: '计划工序',
      minWidth: 120,
    },
    {
      field: 'lineTypeName',
      title: '生产线类型',
      minWidth: 120,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
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
        return queryProductLineList({
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
  lineName: undefined as string | undefined,
  lineType: undefined as string | undefined,
  pageNum: 1,
  pageSize: 10,
  workshop: undefined as string | undefined,
});

// endregion

// region 字典数据
const workshopList = ref<any[]>([]);
const lineTypeList = ref<any[]>([]);
const processList = ref<any[]>([]);

// endregion

// region 抽屉/弹框
const showEditDrawer = ref(false);
const editMode = ref(false);
const formRef = ref();

const formData = ref({
  lineName: '',
  lineType: undefined,
  processId: undefined,
  processName: '',
  workshop: undefined,
});

const rules = {
  lineName: [{ required: true, message: '请输入生产线名称', trigger: 'blur' }],
  lineType: [
    { required: true, message: '请选择生产线类型', trigger: 'change' },
  ],
  processId: [{ required: true, message: '请选择计划工序', trigger: 'change' }],
  workshop: [{ required: true, message: '请选择车间', trigger: 'change' }],
} as any;

// endregion

// region 权限
const author = ref<string[]>([]);

onMounted(() => {
  loadWorkshopList();
  loadLineTypeList();
  loadAuthor();
});

/**
 * 加载车间列表
 */
function loadWorkshopList() {
  listWordListByParentCode('WORKSHOP').then((response) => {
    workshopList.value = response;
  });
}

/**
 * 加载生产线类型列表
 */
function loadLineTypeList() {
  listWordListByParentCode('LINETYPE').then((response) => {
    lineTypeList.value = response;
  });
}

/**
 * 加载计划工序列表
 */
function loadProcessList() {
  queryProcessList({ plan: true }).then((response) => {
    processList.value = response;
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
 * 工序选择改变
 */
function handleProcessChange(value: any) {
  const selectedProcess = processList.value.find((item) => item.id === value);
  if (selectedProcess) {
    formData.value.processName = selectedProcess.processName;
  }
}

/**
 * 新增
 */
function handleAdd() {
  editMode.value = false;
  formData.value = {
    lineName: '',
    lineType: undefined,
    processId: undefined,
    processName: '',
    workshop: undefined,
  };
  loadProcessList();
  showEditDrawer.value = true;
  formRef.value?.clearValidate();
}

/**
 * 编辑
 */
function handleEdit(row: any) {
  editMode.value = true;
  loadProcessList();
  queryProductLineDetail(row.id).then((response) => {
    formData.value = response;
  });
  showEditDrawer.value = true;
  formRef.value?.clearValidate();
}

/**
 * 删除
 */
function handleDelete(row: any) {
  Modal.confirm({
    title: '提示',
    content: '该操作不可撤销，请确认！',
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      deleteProductLine(row.id).then(() => {
        message.success('删除成功!');
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
    if (editMode.value) {
      updateProductLine(formData.value).then(() => {
        message.success('更新成功');
        handleCancel();
        gridApi.reload();
      });
    } else {
      createProductLine(formData.value).then(() => {
        message.success('创建成功');
        handleCancel();
        gridApi.reload();
      });
    }
  });
}

/**
 * 取消
 */
function handleCancel() {
  showEditDrawer.value = false;
}
</script>

<template>
  <Page>
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem label="车间">
          <Select
            v-model:value="queryParams.workshop"
            allow-clear
            placeholder="请选择"
            style="width: 200px"
          >
            <SelectOption
              v-for="item in workshopList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.wordName }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem label="生产线类型">
          <Select
            v-model:value="queryParams.lineType"
            allow-clear
            placeholder="请选择"
            style="width: 200px"
          >
            <SelectOption
              v-for="item in lineTypeList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.wordName }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem label="生产线名称">
          <Input
            v-model:value="queryParams.lineName"
            :max-length="16"
            placeholder="请输入生产线名称"
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
      </Form>
    </Card>

    <Card class="h-[60vh] overflow-y-auto">
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

    <!-- 编辑弹框 -->
    <Modal
      v-model:open="showEditDrawer"
      :title="editMode ? '编辑' : '新增'"
      :width="600"
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
        <FormItem label="车间" name="workshop">
          <Select
            v-model:value="formData.workshop"
            allow-clear
            placeholder="请选择"
            :disabled="editMode"
            style="width: 100%"
          >
            <SelectOption
              v-for="item in workshopList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.wordName }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem label="生产线类型" name="lineType">
          <Select
            v-model:value="formData.lineType"
            allow-clear
            placeholder="请选择"
            :disabled="editMode"
            style="width: 100%"
          >
            <SelectOption
              v-for="item in lineTypeList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.wordName }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem label="计划工序" name="processId">
          <Select
            v-model:value="formData.processId"
            allow-clear
            placeholder="请选择"
            :disabled="editMode"
            style="width: 100%"
            @change="handleProcessChange"
          >
            <SelectOption
              v-for="item in processList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.processName }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem label="生产线名称" name="lineName">
          <Input
            v-model:value="formData.lineName"
            :max-length="16"
            placeholder="请输入生产线名称"
          />
        </FormItem>
      </Form>
      <template #footer>
        <Space>
          <Button @click="handleCancel">{{ $t('common.cancel') }}</Button>
          <Button type="primary" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Modal>
  </Page>
</template>
