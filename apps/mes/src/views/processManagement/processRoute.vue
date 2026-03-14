<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { IconParkSolidError, MdiSearch, MdiSuccess } from '@vben/icons';
import { $t } from '@vben/locales';
import { useAccessStore } from '@vben/stores';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Space,
  Switch,
  Tooltip,
  Upload,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteScadaProcessRoute,
  exportScadaProcessRouteList,
  queryProcessRouteList,
  routeAudit,
  updateProcessRouteUse,
} from '#/api';
import { queryAuth } from '#/util';
import ProcessRouteDetailPage from '#/util/component/processManagement/processRouteDetailPage.vue';
import ProcessRouteEditDrawer from '#/util/component/processManagement/ProcessRouteEditDrawer.vue';
import ProductBindDrawer from '#/util/component/processManagement/ProductBindDrawer.vue';

// region 表格

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'routeCode', title: '工艺路线编号', minWidth: 150 },
    { field: 'routeName', title: '工艺路线名称', minWidth: 150 },
    { field: 'routeTypeName', title: '工艺路线类型', minWidth: 100 },
    { field: 'version', title: '版本', minWidth: 100 },
    { field: 'isEnable', title: '是否启用', minWidth: 80 },
    { field: 'isDefault', title: '是否默认', minWidth: 80 },
    { field: 'remark', title: '备注', minWidth: 100 },
    { field: 'createTime', title: '创建时间', minWidth: 150 },
    { field: 'updateTime', title: '更新时间', minWidth: 150 },
    { field: 'updateUsername', title: '更新人', minWidth: 100 },
    {
      field: 'state',
      slots: { default: 'status' },
      title: '状态',
      minWidth: 100,
      fixed: 'right',
    },
    {
      title: '操作',
      minWidth: 300,
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
    refresh: true,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// 查询参数
const queryParams = ref<any>({});

function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams.value,
      pageNum: page,
      pageSize,
    };
    queryProcessRouteList(params)
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

// endregion

// region 导出和导入

function handleExport() {
  const params = {
    ...queryParams.value,
  };
  exportScadaProcessRouteList(params).then((res: any) => {
    window.location.href = res;
  });
}

function handleUploadChange(info: any) {
  if (info.file.status === 'done') {
    message.success('上传成功');
    gridApi.reload();
  } else if (info.file.status === 'error') {
    message.error('文件上传失败');
  }
}

function beforeUpload(file: any) {
  const isExcel =
    file.type === 'application/vnd.ms-excel' ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (!isExcel) {
    message.error('只能上传 Excel 文件');
  }
  return isExcel;
}

// endregion

// region 状态切换

function handleStateChange(row: any) {
  const params = {
    auditState: '',
    routeId: row.id,
  };
  updateProcessRouteUse(params)
    .then(() => {
      message.success($t('common.successfulOperation'));
    })
    .finally(() => {
      gridApi.reload();
    });
}

// endregion

// region 审核

function handleAudit(row: any, isPass: boolean) {
  const title = isPass ? '是否确认通过该条数据?' : '是否确认不通过该条数据?';
  const statusCode = isPass ? 2 : 3;

  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'primary',
    onOk() {
      submitAudit(row.id, statusCode);
    },
    title,
  });
}

function submitAudit(id: number, status: number) {
  routeAudit({
    auditState: status,
    routeId: id,
  }).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

// endregion

// region 工艺路线查看 / 编辑
const processRouteDetailPageRef = ref();

function handleViewRouteDetail(id: string, isUpdate: boolean) {
  processRouteDetailPageRef.value.openDrawer(id, isUpdate);
}

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
      confirmDelete(row.id);
    },
    title: '是否确认删除该条数据?',
  });
}

function confirmDelete(id: number) {
  deleteScadaProcessRoute(id).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

// endregion

// region 抽屉组件引用

const editDrawerRef = ref();
const productBindDrawerRef = ref();

function openEditDrawer(item: any = {}) {
  editDrawerRef.value?.openDrawer(item);
}

function openProductBindDrawer(row: any) {
  productBindDrawerRef.value?.openDrawer(row);
}

// endregion

// region 初始化

const accessStore = useAccessStore();
const route = useRoute();
const author = ref<string[]>([]);

// 上传接口地址
const uploadAction = `${import.meta.env.VITE_GLOB_MES_MAIN}/process/route/uploadExcel`;

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
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 工艺路线名称 -->
        <FormItem
          :label="$t('processManagement.processRoute.processRouteName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.routeName" />
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

    <Card class="mb-8">
      <Grid>
        <template #toolbar-tools>
          <Space>
            <!-- 新增按钮 -->
            <Button
              v-if="author.includes('新增')"
              type="primary"
              @click="openEditDrawer()"
            >
              {{ $t('common.add') }}
            </Button>
            <!-- 导出按钮 -->
            <Button
              v-if="author.includes('导出')"
              type="primary"
              @click="handleExport"
            >
              导出
            </Button>
            <!-- 上传按钮 -->
            <Upload
              v-if="author.includes('新增') && false"
              :action="uploadAction"
              :headers="{ Authorization: `${accessStore.accessToken}` }"
              :show-upload-list="false"
              name="file"
              :before-upload="beforeUpload"
              @change="handleUploadChange"
            >
              <Button type="primary">点击上传</Button>
            </Upload>
          </Space>
        </template>
        <template #status="{ row }">
          <div v-if="row.state === 3">已弃用</div>
          <div v-else>
            <Switch
              v-model:checked="row.useState"
              :checked-value="1"
              :un-checked-value="2"
              :disabled="!author.includes('启停变更')"
              checked-children="启用"
              un-checked-children="停用"
              @change="handleStateChange(row)"
            />
          </div>
        </template>
        <template #action="{ row }">
          <!-- 查看工艺路线 -->
          <Tooltip v-if="author.includes('查看工艺路线')">
            <template #title>
              {{ $t('processManagement.processRoute.viewRouting') }}
            </template>
            <Button
              type="link"
              @click="handleViewRouteDetail(row.id, false)"
              class="px-1"
            >
              <Icon icon="mdi:eye" class="inline-block align-middle text-2xl" />
            </Button>
          </Tooltip>
          <!-- 编辑基础信息 -->
          <Tooltip v-if="author.includes('编辑基本信息')">
            <template #title>
              {{ $t('processManagement.processRoute.editTheBasicInformation') }}
            </template>
            <Button type="link" @click="openEditDrawer(row)" class="px-1">
              <Icon
                icon="mdi:edit-box-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 绑定产品型号 -->
          <Tooltip v-if="author.includes('绑定产品型号')">
            <template #title>
              {{ $t('processManagement.processRoute.bindProductModel') }}
            </template>
            <Button
              type="link"
              @click="openProductBindDrawer(row)"
              class="px-1"
            >
              <Icon
                icon="mdi:attachment"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 审核通过 -->
          <Tooltip v-if="row.auditState === 1 && author.includes('审核')">
            <template #title>{{ $t('common.pass') }}</template>
            <Button
              :icon="h(MdiSuccess, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="handleAudit(row, true)"
            />
          </Tooltip>

          <!-- 审核不通过 -->
          <Tooltip v-if="row.auditState === 1 && author.includes('审核')">
            <template #title>{{ $t('common.noPass') }}</template>
            <Button
              :icon="
                h(IconParkSolidError, {
                  class: 'inline-block size-6 text-red-600',
                })
              "
              class="mr-4"
              type="link"
              @click="handleAudit(row, false)"
            />
          </Tooltip>
          <!-- 变更 -->
          <Tooltip v-if="author.includes('变更')">
            <template #title>
              {{ $t('processManagement.processRoute.change') }}
            </template>
            <Button
              type="link"
              @click="handleViewRouteDetail(row.id, true)"
              class="px-1"
            >
              <Icon
                icon="mdi:update"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 删除 -->
          <Tooltip v-if="author.includes('删除')">
            <template #title>
              {{ $t('processManagement.processRoute.delete') }}
            </template>
            <Button type="link" @click="handleDelete(row)" danger class="px-1">
              <Icon
                icon="mdi:delete-forever-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>

    <!-- 编辑抽屉 -->
    <ProcessRouteEditDrawer ref="editDrawerRef" @success="gridApi.reload()" />

    <!-- 产品绑定抽屉 -->
    <ProductBindDrawer ref="productBindDrawerRef" :author="author" />

    <!-- 工艺路线详情页面 -->
    <ProcessRouteDetailPage ref="processRouteDetailPageRef" />
  </Page>
</template>

<style scoped></style>
