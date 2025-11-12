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
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteDefectCodeSet,
  exportDefectCodeSet,
  getProceByName,
  insertDefectCodeSet,
  listWordListByParentCode,
  queryDefectCodeSet,
  queryDefectCodeSetById,
  updateDefectCodeSet,
} from '#/api';
import { queryAuth } from '#/util';

// region 表格

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'defectCode', title: '不良代码', minWidth: 90 },
    { field: 'defectName', title: '不良名称', minWidth: 90 },
    { field: 'responseProcessName', title: '责任工序名称', minWidth: 100 },
    { field: 'responseProcessCode', title: '责任工序编码', minWidth: 100 },
    { field: 'responseWorkshopName', title: '责任车间', minWidth: 80 },
    { field: 'createTime', title: '操作时间', minWidth: 150 },
    { field: 'createUserName', title: '操作人', minWidth: 80 },
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

    // 调用 queryDefectCodeSet 函数查询数据。
    queryDefectCodeSet(params)
      .then(({ total, results }) => {
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
  defectCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  defectName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  responseProcessCode: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  responseWorkshopCode: [
    { message: '此项为必填项', required: false, trigger: 'change' },
  ],
});

/**
 * 显示编辑抽屉
 * @param item
 */
function showEditDrawerFn(item?: any) {
  if (item) {
    queryDefectCodeSetById(item.id).then((data) => {
      editItem.value = {
        ...data,
      };
    });
    queryResponseProcess(item.responseProcessName);
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
      ? updateDefectCodeSet(params)
      : insertDefectCodeSet(params);
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
      deleteDefectCodeSet(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        // 刷新表格数据
        gridApi.reload();
      });
    },
    title: '是否确认删除?',
  });
}
// endregion

// region 查询责任工序
// 责任工序列表
const responseProcessList = ref<any>([]);

/**
 * 查询责任工序列表
 * @param value 工序名称
 */
function queryResponseProcess(value: string) {
  if (value) {
    getProceByName(value).then((data) => {
      responseProcessList.value = data.map((item: any) => {
        return {
          label: `${item.processName}__(${item.processCode})`,
          value: item.processCode,
          name: item.processName,
        };
      });
      responseProcessList.value.push({
        id: 0,
        label: '其他工序__(00000000)',
        value: '00000000',
        name: '其他工序',
      });
    });
  }
}

/**
 * 响应工序改变事件
 * @param _value
 * @param item
 */
function responseProcessChange(_value: any, item: any) {
  editItem.value.responseProcessName = item.name;
}

// endregion

// region 导出

function exportFile() {
  const params: any = { ...queryParams.value };
  exportDefectCodeSet(params).then((data) => {
    window.open(data);
  });
}

// endregion

// region 查询责任车间
// 责任车间列表
const responseWorkshopList = ref<any>([]);

/**
 * 查询责任车间列表
 */
function queryResponseWorkshop() {
  listWordListByParentCode('WORKSHOP').then((data) => {
    responseWorkshopList.value = data.map((item: any) => {
      return {
        label: item.wordName,
        value: item.wordCode,
      };
    });
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
  queryResponseWorkshop();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 不良名称 -->
        <FormItem
          :label="$t('qualityModule.defectCodeSet.defectName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.defectName" />
        </FormItem>

        <!-- 不良代码 -->
        <FormItem
          :label="$t('qualityModule.defectCodeSet.defectCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.defectCode" />
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
          <Button
            type="primary"
            @click="showEditDrawerFn()"
            class="mx-2"
            v-if="author.includes('新增')"
          >
            {{ $t('common.add') }}
          </Button>

          <!-- 导出按钮 -->
          <Button
            type="primary"
            @click="exportFile()"
            v-if="author.includes('导出')"
          >
            {{ $t('common.export') }}
          </Button>
        </template>
        <template #action="{ row }">
          <!-- 编辑 -->
          <Tooltip v-if="author.includes('编辑')">
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
          <Tooltip v-if="author.includes('删除')">
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
        <!-- 不良代码 -->
        <FormItem
          :label="$t('qualityModule.defectCodeSet.defectCode')"
          name="defectCode"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="editItem.defectCode"
            :disabled="!!editItem.id"
          />
        </FormItem>
        <!-- 不良名称 -->
        <FormItem
          :label="$t('qualityModule.defectCodeSet.defectName')"
          name="defectName"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="editItem.defectName" />
        </FormItem>
        <!-- 责任工序 -->
        <FormItem
          :label="$t('qualityModule.defectCodeSet.responsibleProcess')"
          name="responseProcessCode"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="editItem.responseProcessCode"
            :options="responseProcessList"
            show-search
            :default-active-first-option="false"
            :show-arrow="false"
            :filter-option="false"
            :not-found-content="null"
            @search="queryResponseProcess"
            @change="responseProcessChange"
          />
        </FormItem>
        <!-- 责任车间 -->
        <FormItem
          :label="$t('qualityModule.defectCodeSet.responsibleWorkshop')"
          name="responseWorkshopCode"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="editItem.responseWorkshopCode"
            :options="responseWorkshopList"
          />
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
