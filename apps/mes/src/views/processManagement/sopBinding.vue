<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

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
  SelectOption,
  Space,
  Tooltip,
  Upload,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addSopBinding,
  deleteSopBinding,
  queryRouteDetailList,
  queryRouteListByProduct,
  querySopBindingList,
  updateSopBinding,
} from '#/api';
import { queryProductList } from '#/api/processManagement/processRoute.service';
import { queryAuth } from '#/util';

// region 表格配置

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'productCode', title: '产品编号', minWidth: 100 },
    { field: 'productName', title: '产品名称', minWidth: 80 },
    { field: 'routeCode', title: '路线编号', minWidth: 100 },
    { field: 'routeName', title: '路线名称', minWidth: 120 },
    { field: 'processName', title: '对应工序', minWidth: 120 },
    { field: 'fileName', title: 'SOP图纸名称', minWidth: 100 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 150,
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        return await queryData({
          page: page.currentPage,
          pageSize: page.pageSize,
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

// region 查询参数

const queryParams = ref<any>({
  pageNum: 1,
  pageSize: 10,
});

function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams.value,
      pageNum: page,
      pageSize,
    };
    querySopBindingList(params)
      .then(({ list, total }: any) => {
        resolve({
          total,
          items: list,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function handleSearch() {
  queryParams.value.pageNum = 1;
  gridApi.reload();
}

// endregion

// region 新增/编辑

const dialogVisible = ref<boolean>(false);
const dialogStatus = ref<string>('create');
const formData = ref<any>({});
const formRef = ref();
const productList = ref<any[]>([]);
const routeList = ref<any[]>([]);
const routeDetailList = ref<any[]>([]);
const selectedRows = ref<any[]>([]);
const fileList = ref<any>({});
const rules: any = {
  productCode: [
    { required: true, message: '请选择产品型号', trigger: 'change' },
  ],
  productName: [
    { required: true, message: '产品名称为必填项', trigger: 'blur' },
  ],
  routeCode: [{ required: true, message: '请选择路线编号', trigger: 'change' }],
  routeName: [{ required: true, message: '路线名称为必填项', trigger: 'blur' }],
};

function openCreateDialog() {
  dialogStatus.value = 'create';
  formData.value = {};
  routeDetailList.value = [];
  selectedRows.value = [];
  fileList.value = {};
  dialogVisible.value = true;
  loadProductList();
}

function openEditDialog(row: any) {
  dialogStatus.value = 'update';
  formData.value = { ...row };
  const editRow = { ...row };
  // 解析文件列表
  if (editRow.fileIds) {
    try {
      editRow.fileList = JSON.parse(editRow.fileIds);
    } catch {
      editRow.fileList = editRow.fileIds;
    }
  }
  routeDetailList.value = [editRow];
  selectedRows.value = [];
  fileList.value = {};
  dialogVisible.value = true;
  loadProductList();
  // 加载产品的路线列表
  queryRouteListByProduct({
    productCode: row.productCode,
    pageSize: 9999,
    pageNum: 1,
  }).then(({ list }: any) => {
    routeList.value = list;
    routeDetailGridApi.grid.reloadData(routeDetailList.value);
  });
}

function closeDialog() {
  dialogVisible.value = false;
  formData.value = {};
  routeDetailList.value = [];
  selectedRows.value = [];
  fileList.value = {};
  routeDetailGridApi.grid.reloadData([]);
}

function handleProductChange(val: any) {
  const product = productList.value.find((item) => item.productCode === val);
  if (product) {
    formData.value.productName = product.productName;
  }
  queryRouteListByProduct({
    productCode: val,
    pageSize: 9999,
    pageNum: 1,
  }).then(({ list }: any) => {
    routeList.value = list;
    routeDetailList.value = [];
  });
}

function handleRouteChange(val: any) {
  const route = routeList.value.find((item) => item.routeCode === val);
  if (route) {
    formData.value.routeName = route.routeName;
    queryRouteDetailList({
      pageNum: 1,
      pageSize: 999,
      productRouteId: route.id,
      type: 1,
    }).then(({ list }: any) => {
      routeDetailList.value = list.map((item: any) => {
        if (item.fileIds) {
          try {
            item.fileList = JSON.parse(item.fileIds);
          } catch {
            item.fileList = item.fileIds;
          }
        }
        return item;
      });
      routeDetailGridApi.grid.reloadData(routeDetailList.value);
    });
  }
}

function handleSubmit() {
  formRef.value.validate().then(() => {
    const params: any[] = [];
    console.log(selectedRows.value);
    selectedRows.value.forEach((item: any) => {
      const p: any = {
        productRouteDetailId:
          dialogStatus.value === 'update' ? item.productRouteDetailId : item.id,
        fileIds: item.fileIds || [],
      };
      params.push(p);
    });

    const ob =
      dialogStatus.value === 'update'
        ? updateSopBinding({ ...params[0], id: formData.value.id })
        : addSopBinding(params);

    ob.then(() => {
      message.success('操作成功');
      closeDialog();
      gridApi.reload();
    });
  });
}

function handleDetailFileChange(row: any) {
  return (info: any) => {
    if (!fileList.value) {
      fileList.value = {};
    }
    if (!fileList.value[row.id]) {
      fileList.value[row.id] = [];
    }
    fileList.value[row.id] = [...info.fileList];
    const shouldReload =
      info.file.status === 'done' && info.file.response?.code === 200;
    if (shouldReload) {
      const fileId = info.file.response?.data;
      const fileName = info.file.name;
      row.fileIds = [...(row.fileIds || []), fileId];
      row.fileList = row.fileList || [];
      row.fileList.push({ fileId, fileName });
      routeDetailGridApi.reload(routeDetailList.value);
    } else if (info.file.status === 'removed') {
      // 文件被删除时，同步更新 fileIds 和 fileList
      const removedIndex = row.fileList.findIndex(
        (file: any) => file.fileName === info.file.name,
      );
      if (removedIndex !== -1) {
        row.fileIds.splice(removedIndex, 1);
        row.fileList.splice(removedIndex, 1);
        routeDetailGridApi.reload(routeDetailList.value);
      }
    }
  };
}

// endregion

// region 工艺路线明细表格配置

const routeDetailGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: {
    checkMethod: () => true,
    highlight: true,
    reserve: false,
  },
  cellConfig: {
    height: 120,
  },
  columns: [
    { type: 'checkbox', width: 50 },
    { field: 'processName', title: '工序名称', minWidth: 120 },
    { field: 'processCode', title: '工序编号', minWidth: 100 },
    {
      field: 'fileName',
      title: '文件名称',
      minWidth: 150,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'detailAction' },
      title: '操作',
      minWidth: 80,
    },
  ],
  autoResize: true,
  pagerConfig: {
    enabled: false,
  },
  height: 400,
  data: [],
  stripe: true,
};

const routeDetailGridEvents: VxeGridListeners<any> = {
  checkboxChange: ({ checked, row }) => {
    if (checked) {
      const exists = selectedRows.value.some((r) => r.id === row.id);
      if (!exists) {
        selectedRows.value.push(row);
      }
    } else {
      selectedRows.value = selectedRows.value.filter((r) => r.id !== row.id);
    }
  },
  checkboxAll: ({ checked, records }) => {
    selectedRows.value = checked ? [...records] : [];
  },
};

const [RouteDetailGrid, routeDetailGridApi] = useVbenVxeGrid({
  gridEvents: routeDetailGridEvents,
  gridOptions: routeDetailGridOptions,
});

// endregion

// region 删除

function handleDelete(row: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消删除!');
    },
    onOk() {
      deleteSopBinding(row.id).then(() => {
        message.success('删除成功');
        gridApi.reload();
      });
    },
    title: '该操作不可撤销，请确认！',
  });
}

// endregion

// region 初始化

const accessStore = useAccessStore();
const route = useRoute();
const author = ref<string[]>([]);

const fileUploadUrl = `/ht/${import.meta.env.VITE_GLOB_MES_MAIN}/process/productSop/fileUpload`;

function loadProductList() {
  queryProductList(1, 9999, {
    productCode: '',
    productName: '',
    isRoute: 2,
  }).then(({ list }: any) => {
    productList.value = list;
  });
}

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
        <FormItem label="产品型号">
          <Input
            v-model:value="queryParams.productCode"
            placeholder="请输入产品型号"
            allow-clear
          />
        </FormItem>
        <FormItem label="产品名称">
          <Input
            v-model:value="queryParams.productName"
            placeholder="请输入产品名称"
            allow-clear
          />
        </FormItem>
        <FormItem label="路线编号">
          <Input
            v-model:value="queryParams.routeCode"
            placeholder="请输入路线编号"
            allow-clear
          />
        </FormItem>
        <FormItem label="路线名称">
          <Input
            v-model:value="queryParams.routeName"
            placeholder="请输入路线名称"
            allow-clear
          />
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSearch">
            <Icon icon="mdi:magnify" class="mr-2" />
            查询
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <Card>
      <Grid>
        <template #toolbar-tools>
          <Space>
            <Button
              v-if="author.includes('新增')"
              type="primary"
              @click="openCreateDialog"
            >
              <Icon icon="mdi:plus" class="mr-2" />
              新增
            </Button>
          </Space>
        </template>
        <template #action="{ row }">
          <Button
            v-if="author.includes('编辑')"
            type="link"
            class="!p-1"
            @click="openEditDialog(row)"
          >
            <Icon icon="mdi:pencil" class="text-xl" />
          </Button>
          <Button
            v-if="author.includes('删除')"
            type="link"
            danger
            class="!p-1"
            @click="handleDelete(row)"
          >
            <Icon icon="mdi:delete" class="text-xl" />
          </Button>
        </template>
      </Grid>
    </Card>

    <!-- 新增/编辑抽屉 -->
    <Drawer
      v-model:open="dialogVisible"
      :title="dialogStatus === 'create' ? '新增' : '编辑'"
      width="60%"
      @close="closeDialog"
      :footer-style="{ textAlign: 'right' }"
    >
      <Form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
        <FormItem label="产品型号" name="productCode">
          <Select
            v-model:value="formData.productCode"
            allow-clear
            filterable
            placeholder="请选择产品型号"
            :disabled="dialogStatus === 'update'"
            @change="handleProductChange"
          >
            <SelectOption
              v-for="item in productList"
              :key="item.id"
              :value="item.productCode"
            >
              {{ item.productName }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem label="路线编号" name="routeCode">
          <Select
            v-model:value="formData.routeCode"
            allow-clear
            placeholder="请选择路线编号"
            :disabled="dialogStatus === 'update'"
            @change="handleRouteChange"
          >
            <SelectOption
              v-for="item in routeList"
              :key="item.id"
              :value="item.routeCode"
            >
              {{ item.routeName }}
            </SelectOption>
          </Select>
        </FormItem>
      </Form>

      <div>
        <!-- 工艺路线明细表格 -->
        <RouteDetailGrid>
          <template #detailAction="{ row }">
            <Tooltip title="绑定文件">
              <Upload
                :action="fileUploadUrl"
                :headers="{ Authorization: accessStore.accessToken || '' }"
                :multiple="true"
                :show-upload-list="true"
                @change="handleDetailFileChange(row)($event)"
              >
                <Button type="link" class="!p-1">
                  <Icon icon="mdi:upload" class="text-xl" />
                </Button>
              </Upload>
            </Tooltip>
          </template>
        </RouteDetailGrid>
      </div>

      <template #footer>
        <Space>
          <Button
            type="primary"
            :disabled="selectedRows.length === 0"
            @click="handleSubmit"
          >
            保存
          </Button>
          <Button @click="closeDialog">取消</Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
