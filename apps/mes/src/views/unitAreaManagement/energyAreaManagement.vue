<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
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
  Space,
  Tooltip,
  Upload,
} from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { debounce } from 'lodash-es';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addEnergyZoningList,
  deleteEnergyZoning,
  getEnergyZoningList,
  getEnergyZoningPartitionID,
  getEnergyZoningPartitionName,
  getExcelPathEnergyZoningList,
  getTemplate,
  updateEnergyZoning,
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
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'partitionID',
      title: '分区 ID',
      minWidth: 150,
    },
    {
      field: 'partitionName',
      title: '分区名称',
      minWidth: 150,
    },
    {
      field: 'partitionJC',
      title: '分区简称',
      minWidth: 150,
    },
    {
      field: 'parentPartitionName',
      title: '上级分区',
      minWidth: 150,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 220,
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
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
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// region 查看 / 编辑 / 新增 具体操作

// 当前选中的表格行
const checkedRow = ref<any>({});
// 是否显示查看详情抽屉
const showViewDrawer = ref(false);
// 是否显示编辑抽屉
const showEditDrawer = ref(false);

// 抽屉冲的form表单对象
const editForm = ref();
// form表单规则验证
const editRules = ref<any>({
  partitionID: [
    {
      message: '此项为必填项',
      required: true,
      trigger: 'change',
    },
    {
      trigger: 'change',
      validator: (_rule: any, value: any) => {
        return new Promise((resolve, reject) => {
          partitionIDAntiShake(value, resolve, reject);
        });
      },
    },
  ],
  partitionName: [
    { message: '此项为必填项', required: true, trigger: 'change' },
    {
      trigger: 'change',
      validator: (_rule: any, value: any) => {
        return new Promise((resolve, reject) => {
          partitionNameAntiShake(value, resolve, reject);
        });
      },
    },
  ],
  partitionJC: [{ message: '此项为必填项', required: true, trigger: 'change' }],
});
/**
 * 用能分区ID防抖
 */
const partitionIDAntiShake = debounce(
  (value: string, resolve: any, reject: any) => {
    getEnergyZoningPartitionID({
      id: checkedRow.value?.id,
      partitionID: value,
    }).then((res) => {
      if (res) {
        resolve();
      } else {
        reject(new Error('该用能分区ID已存在'));
      }
    });
  },
  500,
);
/**
 * 用能分区名称防抖
 */
const partitionNameAntiShake = debounce(
  (value: string, resolve: any, reject: any) => {
    getEnergyZoningPartitionName({
      id: checkedRow.value?.id,
      partitionName: value,
    }).then((res) => {
      if (res) {
        resolve();
      } else {
        reject(new Error('该用能分区名称已存在'));
      }
    });
  },
  500,
);
/**
 * 显示是编辑抽屉
 * @param row 表格行数据
 */
function editRow(row?: any) {
  checkedRow.value = row
    ? {
        ...row,
      }
    : {};
  showEditDrawer.value = true;
}

/**
 * 删除数据
 * @param row
 */
function delRow(row: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消删除!');
    },
    onOk() {
      deleteEnergyZoning(row.id).then(() => {
        // 显示操作成功的提示信息
        message.success($t('common.successfulOperation'));
        gridApi.query();
      });
    },
    title: '是否确认删除该条数据?',
  });
}

/**
 * 关闭编辑抽屉
 */
function onClose() {
  checkedRow.value = {};
  showViewDrawer.value = false;
  showEditDrawer.value = false;
}

/**
 * 表单提交
 */
function submit() {
  editForm.value.validate().then(() => {
    const ob = checkedRow.value.id
      ? updateEnergyZoning(checkedRow.value)
      : addEnergyZoningList(checkedRow.value);
    ob.then(() => {
      // 查询数据
      gridApi.query();
      message.success($t('common.successfulOperation'));
      onClose();
    });
  });
}

// endregion

// endregion

// region 查询数据
// 查询参数
const queryParams = ref<any>({});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    /**
     * 调用 getEnergyZoningList 函数，传入查询参数和分页信息。
     * 查询参数包括 queryParams.value 中的所有属性，以及当前页码和每页大小。
     */
    getEnergyZoningList({
      ...queryParams.value, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    }).then(({ total, list }) => {
      // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
      resolve({
        total,
        items: list,
      });
    });
  });
}

// endregion

// region 模板下载

function downloadTemplate() {
  getTemplate().then((data: string) => {
    window.open(data, '_blank');
  });
}

// endregion
// region 导出
/**
 * 导出
 */
function exportFile() {
  getExcelPathEnergyZoningList().then((data: any) => {
    window.open(data, '_blank');
  });
}
// endregion

// region 文件上传
const accessStore = useAccessStore();
// 文件上传头信息
const headers = ref<any>({
  Authorization: accessStore.accessToken,
});
// 上传路径
const action = ref<string>(
  `/ht/${import.meta.env.VITE_GLOB_MES_ENERGY}/energyZoning/upload`,
);
// 文件列表
const fileList = ref<any>([]);

/**
 * 处理文件上传状态变化的函数。
 * @param info - 包含文件上传信息的对象。
 */
function handleChange(info: any) {
  // 检查文件是否上传成功
  if (info.file.status === 'done') {
    // 重新查询数据，更新列表
    gridApi.reload();
    // 显示成功消息
    message.success('文件上传成功!');
  } else if (info.file.status === 'error') {
    // 获取错误信息，如果存在则显示，否则显示通用错误消息
    const errorMessage = info.file.response?.message || '文件上传失败';
    // 显示错误消息
    message.error(errorMessage);
  }
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 初始化

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
        <!-- 分区ID -->
        <FormItem
          :label="$t('unitAreaManagement.partitionID')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.partitionID" />
        </FormItem>

        <!-- 分区名称 -->
        <FormItem
          :label="$t('unitAreaManagement.partitionName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.partitionName" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="() => gridApi.reload()"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 表格主体 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <!-- 新增按钮 -->
          <Button
            v-if="author.includes('新增')"
            type="primary"
            @click="editRow()"
          >
            {{ $t('common.add') }}
          </Button>
          <!-- 模板下载按钮 -->
          <Button
            v-if="author.includes('导出')"
            type="primary"
            @click="exportFile()"
            class="ml-4"
          >
            {{ $t('common.export') }}
          </Button>
          <!-- 模板下载按钮 -->
          <Button
            v-if="author.includes('导入')"
            type="primary"
            @click="downloadTemplate()"
            class="ml-4"
          >
            {{ $t('common.templateDownload') }}
          </Button>
          <!-- 导入按钮 -->
          <Upload
            v-if="author.includes('导入')"
            v-model:file-list="fileList"
            :action="action"
            :headers="headers"
            :show-upload-list="false"
            name="file"
            @change="handleChange"
            class="ml-4"
          >
            <Button type="primary">
              {{ $t('common.import') }}
            </Button>
          </Upload>
        </template>
        <template #action="{ row }">
          <!-- 编辑按钮 -->
          <Tooltip>
            <template #title>{{ $t('common.edit') }}</template>
            <Button
              type="link"
              @click="editRow(row)"
              v-if="author.includes('编辑')"
            >
              <Icon
                icon="mdi:edit-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 新增子分区 -->
          <Tooltip>
            <template #title>{{ $t('unitAreaManagement.add') }}</template>
            <Button
              type="link"
              @click="
                editRow({
                  parentId: row.id,
                  parentPartitionName: row.partitionName,
                })
              "
              v-if="author.includes('编辑')"
            >
              <Icon
                icon="mdi:add-circle-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>

          <!-- 删除数据 -->
          <Tooltip>
            <template #title>{{ $t('common.delete') }}</template>
            <Button
              type="link"
              @click="delRow(row)"
              v-if="author.includes('删除')"
              danger
            >
              <Icon
                icon="mdi-light:delete"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- region 新增/编辑 抽屉 -->
    <Drawer
      v-model:open="showEditDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="400"
      class="custom-class"
      placement="right"
      title="信息编辑"
    >
      <Form
        ref="editForm"
        :label-col="{ span: 8 }"
        :model="checkedRow"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
      >
        <!-- 分区ID -->
        <FormItem
          :label="$t('unitAreaManagement.partitionID')"
          name="partitionID"
        >
          <Input v-model:value="checkedRow.partitionID" />
        </FormItem>
        <!-- 分区名称 -->
        <FormItem
          :label="$t('unitAreaManagement.partitionName')"
          name="partitionName"
        >
          <Input v-model:value="checkedRow.partitionName" />
        </FormItem>
        <!-- 分区简称 -->
        <FormItem
          :label="$t('unitAreaManagement.partitionAbbreviation')"
          name="partitionJC"
        >
          <Input v-model:value="checkedRow.partitionJC" />
        </FormItem>
        <!-- 父级名称 -->
        <FormItem
          :label="$t('unitAreaManagement.parentName')"
          name="parentPartitionName"
        >
          {{ checkedRow.parentPartitionName }}
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="onClose">
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
