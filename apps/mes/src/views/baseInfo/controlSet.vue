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
  InputNumber,
  message,
  Modal,
  Select,
  SelectOption,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getProceByName } from '#/api';
import {
  createCheckPoint,
  deleteCheckPoint,
  queryCheckPointDetail,
  queryCheckPointList,
  queryEquipCodeByName,
  queryEquipmentByName,
  queryLineByProcessId,
  queryProcessCodeByName,
  updateCheckPoint,
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
      field: 'workshop',
      title: '所属车间',
      minWidth: 100,
      formatter: ({ cellValue }) => {
        return cellValue === 1 ? '装配车间' : '焊接车间';
      },
    },
    { field: 'checkPointCode', title: '测控点编号', minWidth: 100 },
    { field: 'checkPointName', title: '测控点名称', minWidth: 120 },
    { field: 'equipmentCode', title: '设备编号', minWidth: 100 },
    { field: 'equipmentName', title: '设备名称', minWidth: 100 },
    { field: 'processName', title: '工序名称', minWidth: 180 },
    { field: 'lineName', title: '生产线名称', minWidth: 100 },
    { field: 'ip', title: '测控点IP', minWidth: 100 },
    { field: 'port', title: '测控点端口号', minWidth: 120 },
    { field: 'macAddress', title: 'MAC地址', minWidth: 120 },
    { field: 'description', title: '测控点描述', minWidth: 120 },
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
        return queryCheckPointList({
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
  checkPointName: undefined as string | undefined,
  equipmentName: undefined as string | undefined,
  ipAddress: undefined as string | undefined,
  pageNum: 1,
  pageSize: 10,
  processName: undefined as string | undefined,
});

// endregion

// region 车间列表
const workshopList = ref([
  { id: 1, name: '装配车间' },
  { id: 2, name: '焊接车间' },
]);

// endregion

// region 字典数据
const equipmentNameList = ref<any[]>([]);
const equipCodeList = ref<any[]>([]);
const processNameList = ref<any[]>([]);
const processCodeList = ref<any[]>([]);
const prodLineList = ref<any[]>([]);

// endregion

// region 抽屉/弹框
const showEditDrawer = ref(false);
const editMode = ref(false);
const formRef = ref();
const selectLoading = ref(false);

const formData = ref({
  checkPointCode: '',
  checkPointName: '',
  description: '',
  equipmentCode: undefined,
  equipmentName: undefined,
  ip: '',
  lineId: undefined,
  lineName: undefined,
  macAddress: '',
  port: undefined,
  processCode: undefined,
  processId: undefined,
  processName: undefined,
  workshop: undefined,
});

const rules: any = {
  checkPointCode: [
    { required: true, message: '请输入测控点编号', trigger: 'blur' },
  ],
  checkPointName: [
    { required: true, message: '请输入测控点名称', trigger: 'blur' },
  ],
  ip: [
    { required: true, message: '请输入测控点IP', trigger: 'blur' },
    {
      pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
      message: '请输入有效的IP地址',
      trigger: 'blur',
    },
  ],
  port: [
    { required: true, message: '请输入测控点端口号', trigger: 'blur' },
    {
      type: 'number',
      min: 1,
      max: 65_535,
      message: '端口号范围应为1-65535',
      trigger: 'blur',
    },
  ],
  workshop: [{ required: true, message: '请选择所属车间', trigger: 'change' }],
  processName: [
    { required: true, message: '请选择工序名称', trigger: 'change' },
  ],
  processCode: [
    { required: true, message: '请选择工序编码', trigger: 'change' },
  ],
  lineName: [],
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
 * 新增
 */
function handleAdd() {
  editMode.value = false;
  formData.value = {
    checkPointCode: '',
    checkPointName: '',
    description: '',
    equipmentCode: undefined,
    equipmentName: undefined,
    ip: '',
    lineId: undefined,
    lineName: undefined,
    macAddress: '',
    port: undefined,
    processCode: undefined,
    processId: undefined,
    processName: undefined,
    workshop: undefined,
  };
  equipmentNameList.value = [];
  equipCodeList.value = [];
  processNameList.value = [];
  processCodeList.value = [];
  prodLineList.value = [];
  showEditDrawer.value = true;
  formRef.value?.clearValidate();
}

/**
 * 编辑
 */
function handleEdit(row: any) {
  editMode.value = true;
  equipmentNameList.value = [];
  equipCodeList.value = [];
  processNameList.value = [];
  processCodeList.value = [];
  prodLineList.value = [];
  queryCheckPointDetail(row.id).then((response) => {
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
      deleteCheckPoint(row.id).then(() => {
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
      updateCheckPoint(formData.value).then(() => {
        message.success('更新成功');
        handleCancel();
        gridApi.reload();
      });
    } else {
      createCheckPoint(formData.value).then(() => {
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

/**
 * 设备名称模糊查询
 */
function handleEquipmentNameSearch(value: string) {
  if (value) {
    selectLoading.value = true;
    queryEquipmentByName(value).then((response) => {
      equipmentNameList.value = response;
      selectLoading.value = false;
    });
  } else {
    equipmentNameList.value = [];
  }
}

/**
 * 设备名称变化
 */
function handleEquipmentNameChange() {
  equipCodeList.value = [];
  if (formData.value.equipmentName) {
    queryEquipCodeByName(formData.value.equipmentName).then((response) => {
      equipCodeList.value = response;
    });
  }
}

/**
 * 设备编号变化
 */
function handleEquipCodeChange() {
  if (formData.value.equipmentCode == '') {
    handleEquipmentNameChange();
  }
}

/**
 * 工序名称模糊查询
 */
function handleProcessNameSearch(value: string) {
  if (value && value !== '') {
    selectLoading.value = true;
    getProceByName(value).then((response) => {
      processNameList.value = response;
      selectLoading.value = false;
    });
  } else {
    processNameList.value = [];
  }
}

/**
 * 工序名称改变
 */
function handleProcessNameChange() {
  processCodeList.value = [];
  prodLineList.value = [];
  formData.value.processCode = undefined;
  formData.value.lineId = undefined;
  formData.value.lineName = undefined;
  if (formData.value.processName) {
    queryProcessCodeByName(formData.value.processName).then((response) => {
      processCodeList.value = response;
    });
  }
}

/**
 * 工序编码变化
 */
function handleProcessCodeChange() {
  formData.value.processId = undefined;
  if (formData.value.processCode == '') {
    handleProcessNameChange();
  }
  processCodeList.value.forEach((item) => {
    if (item.processCode == formData.value.processCode) {
      formData.value.processId = item.id;
    }
  });
  handleGetProdLine();
}

/**
 * 根据工序ID查询生产线
 */
function handleGetProdLine() {
  if (formData.value.processId) {
    queryLineByProcessId(formData.value.processId).then((response) => {
      prodLineList.value = response;
    });
  }
}

/**
 * 生产线变化
 */
function handleLineNameChange() {
  formData.value.lineId = undefined;
  if (formData.value.lineName == '') {
    handleGetProdLine();
  }
  prodLineList.value.forEach((item) => {
    if (item.lineName == formData.value.lineName) {
      formData.value.lineId = item.id;
    }
  });
}
</script>

<template>
  <Page>
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem label="测控点名称">
          <Input
            v-model:value="queryParams.checkPointName"
            :max-length="32"
            placeholder="请输入测控点名称"
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem label="设备名称">
          <Input
            v-model:value="queryParams.equipmentName"
            :max-length="32"
            placeholder="请输入设备名称"
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem label="工序名称">
          <Input
            v-model:value="queryParams.processName"
            :max-length="32"
            placeholder="请输入工序名称"
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem label="IP地址">
          <Input
            v-model:value="queryParams.ipAddress"
            :max-length="15"
            placeholder="请输入IP地址"
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

    <!-- 编辑抽屉 -->
    <Drawer
      v-model:open="showEditDrawer"
      :title="editMode ? '编辑' : '新增'"
      :width="800"
      :footer-style="{ textAlign: 'right' }"
    >
      <Form
        ref="formRef"
        :label-col="{ span: 8 }"
        :model="formData"
        :rules="rules"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
      >
        <FormItem label="测控点名称" name="checkPointName">
          <Input v-model:value="formData.checkPointName" :max-length="32" />
        </FormItem>
        <FormItem label="测控点编号" name="checkPointCode">
          <Input
            v-model:value="formData.checkPointCode"
            :max-length="32"
            :disabled="editMode"
          />
        </FormItem>
        <FormItem label="测控点IP" name="ip">
          <Input v-model:value="formData.ip" :max-length="15" />
        </FormItem>
        <FormItem label="测控点端口号" name="port">
          <InputNumber v-model:value="formData.port" style="width: 100%" />
        </FormItem>
        <FormItem label="MAC地址" name="macAddress">
          <Input v-model:value="formData.macAddress" :max-length="50" />
        </FormItem>
        <FormItem label="所属车间" name="workshop">
          <Select
            v-model:value="formData.workshop"
            allow-clear
            placeholder="请选择"
            style="width: 100%"
          >
            <SelectOption
              v-for="item in workshopList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem label="设备名称" name="equipmentName">
          <Select
            v-model:value="formData.equipmentName"
            allow-clear
            filterable
            placeholder="请输入"
            @search="handleEquipmentNameSearch"
            @change="handleEquipmentNameChange"
            :loading="selectLoading"
            show-search
            style="width: 100%"
          >
            <SelectOption
              v-for="item in equipmentNameList"
              :key="item.code"
              :value="item.name"
            >
              {{ item.name }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem label="设备编号" name="equipmentCode">
          <Select
            v-model:value="formData.equipmentCode"
            allow-clear
            placeholder="请选择"
            style="width: 100%"
            @change="handleEquipCodeChange"
          >
            <SelectOption
              v-for="item in equipCodeList"
              :key="item"
              :value="item"
            >
              {{ item }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem label="工序名称" name="processName">
          <Select
            v-model:value="formData.processName"
            allow-clear
            filterable
            placeholder="请输入"
            @search="handleProcessNameSearch"
            @change="handleProcessNameChange"
            :loading="selectLoading"
            show-search
            style="width: 100%"
          >
            <SelectOption
              v-for="item in processNameList"
              :key="item.id"
              :value="item.processName"
            >
              {{ item.processName }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem label="工序编码" name="processCode">
          <Select
            v-model:value="formData.processCode"
            allow-clear
            placeholder="请选择"
            style="width: 100%"
            @change="handleProcessCodeChange"
          >
            <SelectOption
              v-for="item in processCodeList"
              :key="item.id"
              :value="item.processCode"
            >
              {{ item.processCode }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem label="生产线名称" name="lineName">
          <Select
            v-model:value="formData.lineName"
            allow-clear
            placeholder="请选择"
            style="width: 100%"
            @change="handleLineNameChange"
          >
            <SelectOption
              v-for="item in prodLineList"
              :key="item.id"
              :value="item.lineName"
            >
              {{ item.lineName }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem label="测控点描述" name="description">
          <Input.TextArea
            v-model:value="formData.description"
            :max-length="256"
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
    </Drawer>
  </Page>
</template>
