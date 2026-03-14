<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref, watch } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Checkbox,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Space,
  Table,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addProductRoute,
  deleteProductRoute,
  exportProductRouteList,
  queryProductList,
  queryProductRouteDetail,
  queryProductRouteList,
  updateProductRoute,
} from '#/api';

interface Props {
  author: string[];
}

defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

const showDrawer = ref(false);
const currentRoute = ref<any>({});
const queryParams = ref({
  routeCode: '',
  productCode: '',
});

// 产品选择弹窗相关
const showProductSelectModal = ref(false);
const productFormRef = ref();
const productFormData = ref<any>({});
const productSelectQuery = ref({
  productCode: '',
  productName: '',
});
const productList = ref<any[]>([]);
const selectedProduct = ref<any>(null);
const productPagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 产品绑定表格配置
const productGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'routeCode', title: '工艺路线编号', minWidth: 150 },
    { field: 'routeName', title: '工艺路线名称', minWidth: 150 },
    { field: 'productCode', title: '产品编号', minWidth: 150 },
    { field: 'productName', title: '产品名称', minWidth: 200 },
    { field: 'opTime', title: '操作时间', minWidth: 150 },
    { field: 'opUserName', title: '操作人', minWidth: 100 },
    {
      title: '操作',
      minWidth: 200,
      slots: { default: 'productAction' },
    },
  ],
  height: 400,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        return await queryProductRouteData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
};

const [ProductGrid, productGridApi] = useVbenVxeGrid({
  gridOptions: productGridOptions,
});

function queryProductRouteData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams.value,
      pageNum: page,
      pageSize,
    };
    queryProductRouteList(params)
      .then(({ total, list }) => {
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

function openDrawer(row: any) {
  currentRoute.value = row;
  queryParams.value.routeCode = row.routeCode;
  showDrawer.value = true;
  productGridApi?.reload();
}

function closeDrawer() {
  showDrawer.value = false;
  currentRoute.value = {};
  queryParams.value = { routeCode: '', productCode: '' };
  emit('close');
}

function exportProductRoute() {
  const params = {
    routeCode: currentRoute.value.routeCode,
    productCode: queryParams.value.productCode,
  };
  exportProductRouteList(params).then((res: any) => {
    window.location.href = res;
  });
}

function showAddProductBind() {
  productFormData.value = {
    routeCode: currentRoute.value.routeCode,
    routeName: currentRoute.value.routeName,
    productCode: undefined,
    productName: undefined,
  };
  showProductSelectModal.value = true;
}

function showEditProductBind(row: any) {
  queryProductRouteDetail(row.id).then((res: any) => {
    productFormData.value = { ...res };
    showProductSelectModal.value = true;
  });
}

function saveProductBind() {
  productFormRef.value.validate().then(() => {
    const params = {
      ...productFormData.value,
    };
    const api = params.id ? updateProductRoute : addProductRoute;
    api(params).then(() => {
      message.success('操作成功');
      showProductSelectModal.value = false;
      productGridApi?.reload();
    });
  });
}

function deleteProductBind(row: any) {
  Modal.confirm({
    title: '是否确认删除该条数据?',
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      deleteProductRoute(row.id).then(() => {
        message.success('操作成功');
        productGridApi?.reload();
      });
    },
  });
}

function copyProductBind(row: any) {
  productFormData.value = {
    routeCode: row.routeCode,
    routeName: row.routeName,
    productRouteId: row.id,
    productCode: undefined,
    productName: undefined,
  };
  showProductSelectModal.value = true;
}

function loadProductList() {
  const params = {
    productCode: productSelectQuery.value.productCode,
    productName: productSelectQuery.value.productName,
    isRoute: 1,
  };
  queryProductList(
    productPagination.value.pageNum,
    productPagination.value.pageSize,
    params,
  ).then((res: any) => {
    productList.value = res.list.map((item: any) => ({
      ...item,
      key: item.id || item.productCode,
      semifinishedProductSign: item.semifinishedProductSign === 1,
    }));
    productPagination.value.total = res.total;
    // 重置选中状态
    if (selectedProduct.value) {
      const exists = productList.value.find(
        (p: any) =>
          p.id === selectedProduct.value.id ||
          p.productCode === selectedProduct.value.productCode,
      );
      if (!exists) {
        selectedProduct.value = null;
        productFormData.value.productName = undefined;
        productFormData.value.productCode = undefined;
      }
    }
  });
}

function selectProduct(row: any) {
  selectedProduct.value = { ...row, key: row.key };
  productFormData.value.productName = row.productName;
  productFormData.value.productCode = row.productCode;
}

function searchProduct() {
  productPagination.value.pageNum = 1;
  loadProductList();
}

watch(showDrawer, (val) => {
  if (val) {
    loadProductList();
  }
});

watch(showProductSelectModal, (val) => {
  if (val) {
    productSelectQuery.value.productCode = '';
    productSelectQuery.value.productName = '';
    productPagination.value.pageNum = 1;
    productPagination.value.pageSize = 10;
    selectedProduct.value = null;
    loadProductList();
  }
});

defineExpose({
  closeDrawer,
  openDrawer,
});
</script>

<template>
  <Drawer
    v-model:open="showDrawer"
    :footer-style="{ textAlign: 'right' }"
    :width="1200"
    placement="right"
    title="产品绑定"
    @close="closeDrawer()"
  >
    <Card class="mb-4">
      <Form :model="queryParams" layout="inline">
        <FormItem label="产品编号" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.productCode"
            @press-enter="productGridApi?.reload()"
          />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="productGridApi?.reload()">
            查询
          </Button>
          <Button
            class="ml-2"
            type="primary"
            @click="showAddProductBind"
            v-if="author.includes('绑定产品型号')"
          >
            新增
          </Button>
          <Button class="ml-2" type="primary" @click="exportProductRoute">
            导出
          </Button>
          <Button class="ml-2" @click="closeDrawer"> 返回 </Button>
        </FormItem>
      </Form>
    </Card>

    <ProductGrid>
      <template #productAction="{ row }">
        <!-- 复制 -->
        <Tooltip v-if="author.includes('绑定产品型号')">
          <template #title>复制</template>
          <Button type="link" @click="copyProductBind(row)">
            <Icon
              icon="mdi:content-copy"
              class="inline-block align-middle text-xl"
            />
          </Button>
        </Tooltip>
        <!-- 编辑 -->
        <Tooltip v-if="author.includes('绑定产品型号')">
          <template #title>编辑</template>
          <Button type="link" @click="showEditProductBind(row)">
            <Icon
              icon="mdi:edit-box-outline"
              class="inline-block align-middle text-xl"
            />
          </Button>
        </Tooltip>
        <!-- 删除 -->
        <Tooltip v-if="author.includes('绑定产品型号')">
          <template #title>删除</template>
          <Button type="link" danger @click="deleteProductBind(row)">
            <Icon
              icon="mdi:delete-forever-outline"
              class="inline-block align-middle text-xl"
            />
          </Button>
        </Tooltip>
      </template>
    </ProductGrid>

    <!-- 产品选择弹窗 -->
    <Modal
      v-model:open="showProductSelectModal"
      title="产品选择"
      :footer-style="{ textAlign: 'right' }"
      width="900px"
    >
      <!-- 产品绑定表单 -->
      <Card class="mb-4">
        <Form ref="productFormRef" :model="productFormData" layout="inline">
          <FormItem label="工艺路线编号" style="margin-bottom: 1em">
            <Input v-model:value="productFormData.routeCode" readonly />
          </FormItem>
          <FormItem label="工艺路线名称" style="margin-bottom: 1em">
            <Input v-model:value="productFormData.routeName" readonly />
          </FormItem>
          <FormItem label="产品编号" style="margin-bottom: 1em">
            <Input v-model:value="productFormData.productCode" readonly />
          </FormItem>
          <FormItem label="产品名称" style="margin-bottom: 1em">
            <Input v-model:value="productFormData.productName" readonly />
          </FormItem>
        </Form>
      </Card>

      <Card class="mb-4">
        <Form :model="productSelectQuery" layout="inline">
          <FormItem label="产品编号" style="margin-bottom: 1em">
            <Input
              v-model:value="productSelectQuery.productCode"
              @press-enter="searchProduct"
            />
          </FormItem>
          <FormItem label="产品名称" style="margin-bottom: 1em">
            <Input
              v-model:value="productSelectQuery.productName"
              @press-enter="searchProduct"
            />
          </FormItem>
          <FormItem style="margin-bottom: 1em">
            <Button type="primary" @click="searchProduct">查询</Button>
          </FormItem>
        </Form>
      </Card>

      <Table
        :columns="[
          { title: '半成品', dataIndex: 'semifinishedProductSign', width: 80 },
          { title: '产品类别', dataIndex: 'productTypeName', width: 120 },
          { title: '产品编号', dataIndex: 'productCode', width: 120 },
          { title: '产品名称', dataIndex: 'productName', width: 200 },
          { title: '单/双面', dataIndex: 'isSingleSide', width: 100 },
        ]"
        :data-source="productList"
        :pagination="{
          current: productPagination.pageNum,
          pageSize: productPagination.pageSize,
          total: productPagination.total,
          onChange: (page) => {
            productPagination.pageNum = page;
            loadProductList();
          },
          onShowSizeChange: (_, size) => {
            productPagination.pageSize = size;
            loadProductList();
          },
        }"
        :row-selection="{
          type: 'radio',
          selectedRowKeys: selectedProduct ? [selectedProduct.key] : [],
          onChange: (_, selectedRows) => {
            if (selectedRows.length > 0) {
              selectProduct(selectedRows[0]);
            }
          },
        }"
        :scroll="{ y: 300 }"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'semifinishedProductSign'">
            <Checkbox
              v-model:checked="record.semifinishedProductSign"
              disabled
            />
          </template>
          <template v-if="column.dataIndex === 'isSingleSide'">
            <span v-if="record.isSingleSide === 1">单面</span>
            <span v-else-if="record.isSingleSide === 2">双面</span>
          </template>
        </template>
      </Table>

      <template #footer>
        <Space>
          <Button @click="showProductSelectModal = false">取消</Button>
          <Button type="primary" @click="saveProductBind">保存</Button>
        </Space>
      </template>
    </Modal>
  </Drawer>
</template>
