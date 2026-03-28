<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref, watch } from 'vue';

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
  Space,
  Tree,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteInventoryItem,
  fetchInventoryItem,
  fetchInventoryMaterialTree,
  fetchMaterialStockList,
  importAllInventory,
  importInventoryItem,
  savePageData,
} from '#/api';

// Props
interface Props {
  visible?: boolean;
  status?: 'add' | 'edit';
  recordData?: any;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  success: [data: any];
  'update:visible': [value: boolean];
}>();

const importButtonVisible = ref(false);
const listQuery = ref({
  pageNum: 1,
  pageSize: 10,
  id: '',
  typeCode: '',
  type: '',
});
const treeData = ref<any[]>([]);
const treeLoading = ref(false);
const formData = ref<any>({
  formCode: '',
  inventoryTime: dayjs().format('YYYY-MM-DD'),
  inventoryDetailList: [],
  remark: '',
});

const innerGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: { highlight: true, reserve: true },
  columns: [
    { type: 'checkbox', width: 50 },
    { title: '序号', type: 'seq', width: 80 },
    { field: 'materialCode', title: '材料编号', minWidth: 120 },
    { field: 'materialName', title: '材料名称', minWidth: 200 },
    { field: 'unit', title: '单位', width: 80 },
    { field: 'labelCode', title: '条码编号', minWidth: 140 },
    { field: 'wareLocationName', title: '库位号', minWidth: 120 },
    { field: 'logicalHouseName', title: '所属仓库', minWidth: 120 },
    { field: 'stockQuality', title: '账面库存', minWidth: 110 },
    {
      field: 'realQuality',
      title: '实际库存',
      minWidth: 130,
      slots: { default: 'realQuality' },
      editRender: { name: 'Input' },
    },
    { field: 'profitLossQuality', title: '盈亏数量', minWidth: 110 },
  ],
  height: 450,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  showOverflow: 'tooltip',
  stripe: true,
};

const [InnerGrid, innerGridApi] = useVbenVxeGrid({
  gridOptions: innerGridOptions,
});

const materialDialogVisible = ref(false);
const materialTreeData = ref<any[]>([]);
const materialTreeLoading = ref(false);
const materialListQuery = ref({
  pageNum: 1,
  pageSize: 10,
  materialCode: '',
  materialName: '',
  typeCode: '',
  type: '',
});
const materialSelectedRows = ref<any[]>([]);

const materialGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: { highlight: true, reserve: true },
  columns: [
    { type: 'checkbox', width: 50 },
    { title: '序号', type: 'seq', width: 80 },
    { field: 'materialCode', title: '材料编号', minWidth: 120 },
    { field: 'materialName', title: '材料名称', minWidth: 200 },
    { field: 'unit', title: '单位', width: 80 },
    { field: 'labelCode', title: '条码编号', minWidth: 140 },
    { field: 'wareLocationName', title: '库位号', minWidth: 120 },
    { field: 'logicalHouseName', title: '所属仓库', minWidth: 120 },
    { field: 'stockQuality', title: '账面库存', minWidth: 120 },
  ],
  height: 400,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryMaterialData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  showOverflow: 'tooltip',
  stripe: true,
};

const [MaterialGrid, materialGridApi] = useVbenVxeGrid({
  gridOptions: materialGridOptions,
});

watch(
  () => props.visible,
  (val: boolean) => {
    if (val) {
      if (props.status === 'add') {
        resetForm();
      } else if (props.status === 'edit' && props.recordData?.id) {
        loadEditData();
      }
    }
  },
);

function resetForm() {
  formData.value = {
    formCode: '',
    inventoryTime: dayjs().format('YYYY-MM-DD'),
    inventoryDetailList: [],
    remark: '',
  };
  listQuery.value = {
    pageNum: 1,
    pageSize: 10,
    id: '',
    typeCode: '',
    type: '',
  };
  importButtonVisible.value = false;
}

function loadEditData() {
  listQuery.value.id = props.recordData.id;
  listQuery.value.pageNum = 1;
  loadMaterialTree();
  loadInventoryItem();
}

function loadMaterialTree() {
  treeLoading.value = true;
  fetchInventoryMaterialTree()
    .then((res: any) => {
      if (res) {
        treeData.value = [res];
      }
    })
    .catch(() => {
      message.error('加载物料树失败');
    })
    .finally(() => {
      treeLoading.value = false;
    });
}

function loadInventoryItem() {
  fetchInventoryItem(listQuery.value)
    .then((data: any) => {
      if (data?.data) {
        formData.value.inventoryDetailList = data.data.results || [];
        formData.value.remark = data.data.remark || '';
        if (props.status === 'edit' && data.data.id) {
          formData.value.id = data.data.id;
          formData.value.formCode = data.data.formCode;
          formData.value.inventoryTime = data.data.inventoryTime;
        }
      }
    })
    .catch(() => {
      message.error('加载盘点项失败');
    });
}

function queryData({ page, pageSize }: { page: number; pageSize: number }) {
  return new Promise<{ items: any[]; total: number }>((resolve, reject) => {
    if (props.status === 'add') {
      // 新增模式下延迟返回，避免 commitProxy 错误
      setTimeout(() => {
        resolve({ items: [], total: 0 });
      }, 0);
      return;
    }
    fetchInventoryItem({
      ...listQuery.value,
      pageNum: page,
      pageSize,
    })
      .then((data: any) => {
        resolve({
          items: data.data?.results ?? [],
          total: data.data?.total ?? 0,
        });
      })
      .catch(reject);
  });
}

function handleImportAll() {
  importButtonVisible.value = false;
  importAllInventory()
    .then(() => {
      message.success('导入成功');
      loadInventoryItem();
    })
    .catch(() => {
      message.error('导入失败');
    });
}

function handleChooseImport() {
  importButtonVisible.value = false;
  materialListQuery.value = {
    pageNum: 1,
    pageSize: 10,
    materialCode: '',
    materialName: '',
    typeCode: '',
    type: '',
  };
  materialTreeLoading.value = true;
  fetchInventoryMaterialTree()
    .then((res: any) => {
      if (res) {
        materialTreeData.value = [res];
      }
    })
    .catch(() => {
      message.error('加载物料树失败');
    })
    .finally(() => {
      materialTreeLoading.value = false;
    });
  materialGridApi.reload();
  materialDialogVisible.value = true;
}

function queryMaterialData({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  return new Promise<{ items: any[]; total: number }>((resolve, reject) => {
    fetchMaterialStockList({
      ...materialListQuery.value,
      pageNum: page,
      pageSize,
    })
      .then((data: any) => {
        resolve({
          items: data?.results ?? [],
          total: data?.total ?? 0,
        });
      })
      .catch(reject);
  });
}

function handleImportMaterial() {
  if (materialSelectedRows.value.length === 0) {
    message.warning('请选择要导入的数据');
    return;
  }
  importInventoryItem(materialSelectedRows.value)
    .then(() => {
      message.success('导入成功');
      loadInventoryItem();
      materialDialogVisible.value = false;
    })
    .catch(() => {
      message.error('导入失败');
    });
}

function handleDeleteInnerRow() {
  if (materialSelectedRows.value.length === 0) {
    message.warning('请选择要删除的数据');
    return;
  }
  Modal.confirm({
    title: '提示',
    content: '是否确定删除?',
    onOk: () => {
      deleteInventoryItem(materialSelectedRows.value)
        .then(() => {
          message.success('删除成功');
          loadInventoryItem();
        })
        .catch(() => {
          message.error('删除失败');
        });
    },
  });
}

function handleSave() {
  const data = {
    ...formData.value,
    inventoryDetailList: formData.value.inventoryDetailList.map(
      (item: any) => ({
        ...item,
        realQuality: item.realQuality || 0,
        profitLossQuality:
          item.realQuality && item.stockQuality
            ? Number(item.realQuality) - Number(item.stockQuality)
            : '',
      }),
    ),
  };
  emit('success', data);
}

function handleDrawerClose() {
  savePageData({
    inventoryDetailList: formData.value.inventoryDetailList,
    pageNum: listQuery.value.pageNum,
  }).catch(() => {
    message.error('清除缓存失败');
  });
  emit('update:visible', false);
}

function handleMaterialDialogClose() {
  materialDialogVisible.value = false;
}
</script>

<template>
  <Drawer
    :open="props.visible"
    :title="props.status === 'add' ? '新增盘点单' : '编辑盘点单'"
    width="95%"
    :footer-style="{ textAlign: 'right' }"
    @close="handleDrawerClose"
  >
    <div v-if="props.status === 'edit'" class="!mb-4">
      <Space>
        <Button v-if="!importButtonVisible" @click="importButtonVisible = true">
          库存导入
        </Button>
        <Button
          v-if="importButtonVisible"
          type="primary"
          @click="handleImportAll"
        >
          全部导入
        </Button>
        <Button
          v-if="importButtonVisible"
          type="primary"
          @click="handleChooseImport"
        >
          选择导入
        </Button>
        <Button danger @click="handleDeleteInnerRow">删除</Button>
      </Space>
    </div>

    <Form :model="formData" label-width="100px">
      <div class="flex gap-8 !mb-4">
        <FormItem label="盘点单号：">
          <Input v-model:value="formData.formCode" disabled />
        </FormItem>
        <FormItem label="盘点日期：">
          <DatePicker
            v-model:value="formData.inventoryTime"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            style="width: 100%"
          />
        </FormItem>
        <FormItem label="备注说明：">
          <Input.TextArea v-model:value="formData.remark" :maxlength="30" />
        </FormItem>
      </div>
    </Form>

    <!-- 编辑模式显示物料树和表格 -->
    <div v-if="props.status === 'edit'" class="flex gap-4">
      <div
        v-if="props.status === 'edit'"
        class="w-64 border border-gray-200 p-2"
        style="max-height: 500px; overflow-y: auto"
      >
        <Tree
          :field-names="{ key: 'typeCode', title: 'typeName' }"
          :tree-data="treeData"
          :loading="treeLoading"
          @select="
            (_: any[], { node }: any) => {
              listQuery.typeCode = node.typeCode;
              listQuery.type = node.type;
              innerGridApi.reload();
            }
          "
        />
      </div>
      <div class="flex-1">
        <InnerGrid>
          <template #realQuality="{ row }">
            <Input
              v-model:value="row.realQuality"
              placeholder="数字和小数"
              @blur="
                () => {
                  if (row.realQuality && row.stockQuality) {
                    row.profitLossQuality =
                      Number(row.realQuality) - Number(row.stockQuality);
                  }
                }
              "
            />
          </template>
        </InnerGrid>
      </div>
    </div>

    <template #footer>
      <Button type="primary" @click="handleSave">保存</Button>
      <Button @click="handleDrawerClose">取消</Button>
    </template>
  </Drawer>

  <!-- 选择物料弹窗 -->
  <Drawer
    :open="materialDialogVisible"
    title="选择导入"
    width="90%"
    :footer-style="{ textAlign: 'right' }"
  >
    <div class="flex gap-4">
      <div
        class="w-64 border border-gray-200 p-2"
        style="max-height: 600px; overflow-y: auto"
      >
        <Tree
          :field-names="{ key: 'typeCode', title: 'typeName' }"
          :tree-data="materialTreeData"
          :loading="materialTreeLoading"
          @select="
            (_: any[], { node }: any) => {
              materialListQuery.typeCode = node.typeCode;
              materialListQuery.type = node.type;
              materialGridApi.reload();
            }
          "
        />
      </div>
      <div class="flex-1">
        <Card class="!mb-4">
          <Space>
            <Input
              v-model:value="materialListQuery.materialCode"
              placeholder="请输入材料编号"
              :maxlength="10"
              @press-enter="materialGridApi.reload"
            />
            <Input
              v-model:value="materialListQuery.materialName"
              placeholder="请输入材料名称"
              :maxlength="20"
              @press-enter="materialGridApi.reload"
            />
            <Button type="primary" @click="materialGridApi.reload">查询</Button>
          </Space>
        </Card>
        <MaterialGrid />
      </div>
    </div>
    <template #footer>
      <Button type="primary" @click="handleImportMaterial">确定</Button>
      <Button @click="handleMaterialDialogClose">取消</Button>
    </template>
  </Drawer>
</template>
