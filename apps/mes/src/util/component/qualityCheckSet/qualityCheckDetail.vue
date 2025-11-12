<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteQualityCheckDetail,
  insertQualityCheckDetail,
  queryQualityCheckDetail,
  queryQualityCheckDetailById,
  updateQualityCheckDetail,
} from '#/api';

// region 表格

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,

  rowConfig: {
    drag: true,
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'qcItemName', title: '质检项名称', minWidth: 100 },
    { field: 'qcItemCode', title: '质检项编号', minWidth: 100 },
    { field: 'detail', title: '质检明细', minWidth: 100 },
    { field: 'operateTime', title: '操作时间', minWidth: 150 },
    { field: 'operateUserName', title: '操作人', minWidth: 80 },
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

const queryParams = ref<any>({});
/**
 * queryData - 负责根据当前的查询参数、分页信息和日期范围，从后端服务查询数据。
 * 该函数会更新表格的加载状态，并在查询完成后更新数据列表和总条数。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 构建查询参数对象，包含所有查询参数、当前页码和每页显示的数据条数。
    const params = {
      ...queryParams.value,
      // 设置当前页码。
      pageNum: page,
      // 设置每页显示的数据条数。
      pageSize,
    };

    // 调用 queryQualityCheckDetail 函数查询数据。
    queryQualityCheckDetail(params)
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

// region 抽屉基本操作
// 抽屉是否打开
const isOpen = ref(false);
// 送检表单设置详情
const details = ref<any>({});

/**
 * 打开抽屉
 * @param row 详情
 */
function openDrawer(row: any) {
  isOpen.value = true;
  details.value = {
    ...row,
  };
  queryParams.value = {
    itemCode: details.value.itemCode,
  };
}

function closeDrawer() {
  isOpen.value = false;
}
// endregion

// region 模板基本信息编辑 / 新增
// 表单对象
const editForm = ref();
// 模板基本信息编辑抽屉是否显示
const showDrawer = ref(false);
// 编辑的模板基本信息
const editMessage = ref<any>({});
// 编辑的模板基本信息验证规则
const editRules = ref({
  detail: [{ message: '此项为必填项', required: true, trigger: 'change' }],
} as any);

/**
 * 显示编辑抽屉
 */
function showEdit(row?: any) {
  if (row) {
    queryQualityCheckDetailById(row.id).then((data) => {
      editMessage.value = {
        ...data,
      };
    });
  } else {
    editMessage.value = {
      qcItemCode: details.value.itemCode,
      qcItemName: details.value.itemName,
      detail: undefined,
    };
  }
  showDrawer.value = true;
}

/**
 * 表单提交
 */
function submit() {
  editForm.value.validate().then(() => {
    const params = {
      ...editMessage.value,
    };
    const ob = params.id
      ? updateQualityCheckDetail(params)
      : insertQualityCheckDetail(params);
    ob.then(() => {
      message.success($t('common.successfulOperation'));
      close();
      gridApi.reload();
    });
  });
}

function close() {
  editMessage.value = {};
  showDrawer.value = false;
}
// endregion

// region 删除

/**
 * 处理工单删除操作
 * @param row - 当前要删除的工单行数据
 */
function delRow(row: any) {
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
      deleteQualityCheckDetail(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        // 刷新表格数据
        gridApi.reload();
      });
    },
    title: '是否确认删除?',
  });
}
// endregion

// region 暴露方法

// 暴露 open 方法，供父组件调用
defineExpose({
  openDrawer,
});

// endregion
</script>

<template>
  <!-- 已派工单列表抽屉组件 -->
  <Drawer
    v-model:open="isOpen"
    height="80%"
    placement="bottom"
    :title="
      $t(
        'qualityModule.qualityCheck.qualityBaseSet.formQualityCheckItem.maintenance',
      )
    "
    @close="closeDrawer"
  >
    <!-- 渲染已派工单表格组件 -->
    <Grid v-if="isOpen">
      <template #toolbar-tools>
        <!-- 新增按钮 -->
        <Button type="primary" @click="showEdit()" class="mx-2">
          {{ $t('common.add') }}
        </Button>
      </template>
      <template #action="{ row }">
        <!-- 编辑 -->
        <Tooltip>
          <template #title>
            {{ $t('common.edit') }}
          </template>
          <Button type="link" @click="showEdit(row)" class="px-1">
            <Icon icon="mdi:edit" class="inline-block align-middle text-2xl" />
          </Button>
        </Tooltip>
        <!-- 删除 -->
        <Tooltip>
          <template #title>
            {{ $t('common.delete') }}
          </template>
          <Button type="link" @click="delRow(row)" danger class="px-1">
            <Icon
              icon="mdi:delete-forever-outline"
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </Tooltip>
      </template>
    </Grid>
  </Drawer>

  <!-- region 新增/编辑 -->
  <Drawer
    v-model:open="showDrawer"
    :footer-style="{ textAlign: 'right' }"
    :width="600"
    class="custom-class"
    placement="right"
    root-class-name="root-class-name"
    title="信息编辑"
  >
    <Form
      ref="editForm"
      :label-col="{ span: 8 }"
      :model="editMessage"
      :rules="editRules"
      :wrapper-col="{ span: 16 }"
      name="editMessageForm"
    >
      <!-- 质检项名称 -->
      <FormItem
        :label="
          $t(
            'qualityModule.qualityCheck.qualityBaseSet.qualityCheckDetail.name',
          )
        "
        name="qcItemName"
      >
        <Input v-model:value="editMessage.qcItemName" disabled />
      </FormItem>
      <!-- 质检项编号 -->
      <FormItem
        :label="
          $t(
            'qualityModule.qualityCheck.qualityBaseSet.qualityCheckDetail.code',
          )
        "
        name="qcItemCode"
      >
        <Input v-model:value="editMessage.qcItemCode" disabled />
      </FormItem>
      <!-- 质检项明细 -->
      <FormItem
        :label="
          $t(
            'qualityModule.qualityCheck.qualityBaseSet.qualityCheckDetail.details',
          )
        "
        name="detail"
      >
        <Input
          v-model:value="editMessage.detail"
          :placeholder="$t('ui.placeholder.input')"
        />
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <!-- 取消 -->
        <Button @click="close">
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
</template>

<style scoped></style>
