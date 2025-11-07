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
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  RadioGroup,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deletePhysicalWarehouse,
  insertPhysicalWarehouse,
  queryPhysicalWarehouse,
  queryPhysicalWarehouseById,
  updatePhysicalWarehouse,
} from '#/api';
import { queryAuth } from '#/util';

// region 表格

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'warehouseCode', title: '仓库编号', minWidth: 120 },
    { field: 'warehouseName', title: '仓库名称', minWidth: 120 },
    {
      field: 'isUse',
      title: '是否启用',
      minWidth: 80,
      slots: { default: 'isUse' },
    },
    { field: 'warehouseLocation', title: '仓库位置', minWidth: 120 },
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
const queryParams = ref<any>({});

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

    // 调用 queryPhysicalWarehouse 函数查询数据。
    queryPhysicalWarehouse(params)
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
// 状态映射
const statusMap = [
  {
    label: '启用',
    value: 1,
  },
  {
    label: '停用',
    value: 0,
  },
];
// 是否为线边仓映射
const valueMap = [
  {
    label: '是',
    value: 1,
  },
  {
    label: '否',
    value: 0,
  },
];

/**
 * 显示编辑抽屉
 * @param item
 */
function showEditDrawerFn(item?: any) {
  if (item) {
    queryPhysicalWarehouseById(item.id).then((data) => {
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
    const ob = params.id
      ? updatePhysicalWarehouse(params)
      : insertPhysicalWarehouse(params);
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
      // 调用删除工单接口
      deletePhysicalWarehouse(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        // 刷新表格数据
        gridApi.reload();
      });
    },
    title: '是否确认删除?',
  });
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
          :label="$t('storeManagement.storeManage.storeCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.code" />
        </FormItem>

        <!-- 仓库名称 -->
        <FormItem
          :label="$t('storeManagement.storeManage.storeName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.name" />
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

    <Card class="mb-8">
      <Grid>
        <template #toolbar-tools>
          <Button type="primary" @click="showEditDrawerFn()">
            {{ $t('common.add') }}
          </Button>
        </template>
        <template #isUse="{ row }">
          {{ row.isUse === 1 ? $t('status.enable') : $t('status.forbidden') }}
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
        <!-- 仓库编码 -->
        <FormItem
          :label="$t('storeManagement.storeManage.storeCode')"
          name="warehouseCode"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="editItem.warehouseCode" :disabled="true" />
        </FormItem>
        <!-- 仓库名称 -->
        <FormItem
          :label="$t('storeManagement.storeManage.storeName')"
          name="warehouseName"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="editItem.warehouseName" />
        </FormItem>
        <!-- 状态 -->
        <FormItem
          :label="$t('storeManagement.physicalStore.status')"
          name="isUse"
          style="margin-bottom: 1em"
        >
          <RadioGroup v-model:value="editItem.isUse" :options="statusMap" />
        </FormItem>
        <!-- 是否为线边仓 -->
        <FormItem
          :label="$t('storeManagement.physicalStore.isLineWarehouse')"
          name="isTransit"
          style="margin-bottom: 1em"
        >
          <RadioGroup v-model:value="editItem.isTransit" :options="valueMap" />
        </FormItem>
        <!-- 仓库位置 -->
        <FormItem
          :label="$t('storeManagement.storeManage.storeLocation')"
          name="warehouseLocation"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="editItem.warehouseLocation" />
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

<style scoped></style>
