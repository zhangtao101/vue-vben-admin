<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  RadioGroup,
  Row,
  Space,
  Tooltip,
  Tree,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteWareArea,
  insertWareArea,
  queryScadaLogicalWarehouseTree,
  queryScadaPhysicalWarehouseTree, queryScadaWarehouseStockByLocation,
  queryWareArea,
  queryWareAreaById,
  updateWareArea,
} from '#/api';
import { queryAuth } from '#/util';

// region 表格

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'wareAreaCode', title: '库区编号', minWidth: 80 },
    { field: 'wareAreaName', title: '库区名称', minWidth: 80 },
    { field: 'warehouseName', title: '物理仓库', minWidth: 80 },
    { field: 'remark', title: '备注', minWidth: 80 },
    {
      title: '操作',
      minWidth: 150,
      fixed: 'right',
      slots: {
        default: 'action',
      },
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
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: any = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 查询参数
const queryParams = ref<any>({
  houseType: 2,
});

/**
 * queryData - 负责根据当前的查询参数、分页信息和日期范围，从后端服务查询数据。
 * 该函数会更新表格的加载状态，并在查询完成后更新数据列表和总条数。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 构建查询参数对象，包含所有查询参数、当前页码和每页显示的数据条数。
    const params = {
      // 展开 queryParams.value 对象，包含所有查询参数。
      ...queryParams.value,
      // 设置当前页码。
      pageNum: page,
      // 设置每页显示的数据条数。
      pageSize,
    };

    if (selectedNode.value) {
      Object.assign(params, selectedNode.value);
    }

    // 调用 queryScadaWarehouseStockByLocation 函数查询数据。
    queryScadaWarehouseStockByLocation(params)
      .then(({ total, results }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total,
          items: results,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// endregion

// region 新增/编辑 抽屉

// 编辑form表单
const editForm = ref();
// 编辑抽屉是否显示
const showEditDrawer = ref(false);
// 编辑的对象
const editItem = ref<any>({});
// form表单规则验证
const editRules = ref<any>({
  warehouseName: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
});

/**
 * 显示编辑抽屉
 * @param item
 */
function showEditDrawerFn(item?: any) {
  if (item) {
    queryWareAreaById(item.id).then((data) => {
      editItem.value = {
        ...data,
      };
    });
  } else {
    editItem.value = {
      isUse: 0,
      isTransit: 0,
    };
  }
  showEditDrawer.value = true;
}
/**
 * 关闭编辑抽屉
 */
function closeEditDrawer() {
  editItem.value = {};
  showEditDrawer.value = false;
}

function submit() {
  editForm.value.validate().then(() => {
    const params = {
      ...editItem.value,
    };
    const ob = params.id ? updateWareArea(params) : insertWareArea(params);
    ob.then(() => {
      closeEditDrawer();
      message.success($t('common.successfulOperation'));
      gridApi.reload();
    });
  });
}

// endregion

// region 删除

/**
 * 处理工单删除操作
 * @param row - 当前要删除的工单行数据
 */
function delPhysicalWarehouse(row: any) {
  // 弹出确认对话框
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    // 取消操作回调
    onCancel() {
      message.warning('已取消删除!');
    },
    // 确认操作回调
    onOk() {
      // 调用删除接口
      deleteWareArea(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        // 刷新表格数据
        gridApi.reload();
      });
    },
    title: '是否确认删除?',
  });
}
// endregion

// region 物理仓库/ 逻辑仓库查询查询
const types = [
  {
    label: $t('storeManagement.inventoryManagement.physicalWarehouse'),
    value: 2,
  },
  {
    label: $t('storeManagement.inventoryManagement.logicalRepositories'),
    value: 1,
  },
];
// 仓库列表
const repositoryList = ref<any>([]);
// 选中的key
const selectedKeys = ref<any>([]);
// 选中的节点信息
const selectedNode = ref<any>({});
/**
 * 查询所有物理仓库
 */
function queryPhysicalWarehouse() {
  const ob =
    queryParams.value.houseType === 2
      ? queryScadaPhysicalWarehouseTree()
      : queryScadaLogicalWarehouseTree();
  ob.then((data: any) => {
    repositoryList.value = data;
  });
}

/**
 * 选择变更
 * @param _key 选中的key
 * @param type 选中节点的type
 * @param id 选中节点的id
 */
function selectChange(_key: any, { node: { type, id }, selected }: any) {
  selectedNode.value = selected
    ? {
        type,
        id,
      }
    : {};
  if (selected) {
    gridApi.reload();
  }
}

// endregion

// region 初始化
// 路由信息
const route = useRoute();
// 当前页面按钮权限列表
const author = ref<string[]>([]);
onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  queryPhysicalWarehouse();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 仓库编码 -->
        <FormItem
          :label="$t('storeManagement.storeBlock.wareAreaCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.code" />
        </FormItem>

        <!-- 仓库名称 -->
        <FormItem
          :label="$t('storeManagement.storeBlock.wareAreaName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.name" />
        </FormItem>

        <!-- 物理仓库 -->
        <FormItem
          :label="$t('storeManagement.inventoryManagement.warehouseType')"
          style="margin-bottom: 1em"
        >
          <RadioGroup
            v-model:value="queryParams.houseType"
            :options="types"
            @change="queryPhysicalWarehouse"
          />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="
              () => {
                gridApi.reload();
              }
            "
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->
    <Row :gutter="24">
      <Col :span="6">
        <Card class="mb-8">
          <Tree
            v-model:selected-keys="selectedKeys"
            @select="selectChange"
            :tree-data="repositoryList"
            :field-names="{ children: 'children', title: 'name' }"
          />
        </Card>
      </Col>
      <Col :span="18">
        <Card class="mb-8">
          <Grid>
            <template #toolbar-tools>
              <Button type="primary" @click="showEditDrawerFn()">
                {{ $t('common.add') }}
              </Button>
            </template>
            <template #isUse="{ row }">
              {{
                row.isUse === 1 ? $t('status.enable') : $t('status.forbidden')
              }}
            </template>
            <template #action="{ row }">
              <!-- 编辑 -->
              <Tooltip>
                <template #title>
                  {{ $t('common.edit') }}
                </template>
                <Button type="link" @click="showEditDrawerFn(row)" class="px-1">
                  <Icon
                    icon="mdi:edit"
                    class="inline-block align-middle text-2xl"
                  />
                </Button>
              </Tooltip>

              <!-- 删除 -->
              <Tooltip>
                <template #title>
                  {{ $t('common.delete') }}
                </template>
                <Button
                  type="link"
                  @click="delPhysicalWarehouse(row)"
                  danger
                  class="px-1"
                >
                  <Icon
                    icon="mdi:delete-forever-outline"
                    class="inline-block align-middle text-2xl"
                  />
                </Button>
              </Tooltip>
            </template>
          </Grid>
        </Card>
      </Col>
    </Row>

    <!-- region 新增/编辑 抽屉 -->
    <Drawer
      v-model:open="showEditDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="600"
      placement="right"
      :title="$t('common.edit')"
      @close="closeEditDrawer()"
      class="z-auto"
    >
      <Form
        ref="editForm"
        :model="editItem"
        :rules="editRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <!-- 库区编号 -->
        <FormItem
          :label="$t('storeManagement.storeBlock.wareAreaCode')"
          name="wareAreaCode"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="editItem.wareAreaCode" :disabled="true" />
        </FormItem>
        <!-- 库区名称 -->
        <FormItem
          :label="$t('storeManagement.storeBlock.wareAreaName')"
          name="wareAreaName"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="editItem.wareAreaName" />
        </FormItem>
        <!-- 物理仓库 -->
        <FormItem
          :label="$t('storeManagement.storeBlock.physicalWarehouse')"
          name="warehouseId"
          style="margin-bottom: 1em"
        >
          <!--          <Select-->
          <!--            v-model:value="editItem.warehouseId"-->
          <!--            :options="physicalWarehouse"-->
          <!--          />-->
        </FormItem>
        <!-- 备注 -->
        <FormItem
          :label="$t('storeManagement.storeManage.storeRemark')"
          name="remark"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="editItem.remark" />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="closeEditDrawer">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="submit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped lang="scss">
.test {
  label {
    display: inline-block;
    margin: 1em 0;
  }
}
</style>
