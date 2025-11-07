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
  RadioGroup,
  Select,
  Space,
  Switch,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addProcessRoute,
  listWordListByParentCode,
  queryProcessRouteList,
  updateProcessRoute,
  updateProcessRouteUse,
} from '#/api';
import { queryAuth } from '#/util';
import ProcessRouteDetailPage from '#/util/component/processManagement/processRouteDetailPage.vue';

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

    // 调用 searchWorksheetNoWater 函数查询数据。
    queryProcessRouteList(params)
      .then(({ total, list }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
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

// region 新增/编辑 抽屉

// 编辑form表单
const editForm = ref();
// 编辑抽屉是否显示
const showEditDrawer = ref(false);
// 编辑的对象
const editItem = ref<any>({});
// form表单规则验证
const editRules = ref<any>({
  routeCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  routeName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  routeType: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  remark: [{ message: '此项为必填项', required: false, trigger: 'change' }],
});

/**
 * 显示编辑抽屉
 * @param item
 */
function showEditDrawerFn(item: any) {
  editItem.value = {
    ...item,
  };
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
    message.success($t('common.successfulOperation'));
    const params = {
      ...editItem.value,
    };
    const ob = params.id ? updateProcessRoute(params) : addProcessRoute(params);
    ob.then(() => {
      closeEditDrawer();
      message.success($t('common.successfulOperation'));
      gridApi.reload();
    });
  });
}

// endregion

// region 状态切换

/**
 * changeState - 处理状态切换事件，根据用户操作更新数据状态。
 * @param row - 当前行数据对象，包含状态信息。
 */
function changeState(row: any) {
  // 构建更新参数对象，包含状态值和行 ID。
  const params = {
    auditState: '',
    routeId: row.id,
  };

  // 调用 updateWorkstation 函数更新数据状态。
  updateProcessRouteUse(params)
    .then(() => {
      message.success($t('common.successfulOperation'));
    })
    .finally(() => {
      gridApi.reload();
    });
}

// endregion

// region 查询路线类型字典表
const routeTypeList = ref<any>([]);
function queryRouteType() {
  listWordListByParentCode('LXLB').then((data) => {
    routeTypeList.value = data.map((item: any) => ({
      label: item.wordName,
      value: item.orderNumber,
    }));
  });
}

// endregion

// region 工艺路线查看 / 编辑
const processRouteDetailPageRef = ref();

/**
 * 显示工艺路线查看 / 编辑抽屉
 * @param id 工艺路线ID
 * @param isUpdate 是否为编辑模式
 */
function showRouteDetailPage(id: string, isUpdate: boolean) {
  processRouteDetailPageRef.value.openDrawer(id, isUpdate);
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
  queryRouteType();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 模板编号 -->
        <FormItem
          :label="$t('processManagement.processParams.proceName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.proceName" />
        </FormItem>

        <!-- 模板名称 -->
        <FormItem
          :label="$t('processManagement.processParams.templateName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.tempName" />
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
        <template #status="{ row }">
          <div v-if="row.state === 3">已弃用</div>
          <div v-else>
            <Switch
              v-model:checked="row.useState"
              :checked-value="1"
              :un-checked-value="2"
              checked-children="启用"
              un-checked-children="停用"
              @change="changeState(row)"
            />
          </div>
        </template>
        <template #action="{ row }">
          <!-- 查看工艺路线 -->
          <Tooltip>
            <template #title>
              {{ $t('processManagement.processRoute.viewRouting') }}
            </template>
            <Button
              type="link"
              @click="showRouteDetailPage(row.id, false)"
              class="px-1"
            >
              <Icon icon="mdi:eye" class="inline-block align-middle text-2xl" />
            </Button>
          </Tooltip>
          <!-- 编辑基础信息 -->
          <Tooltip>
            <template #title>
              {{ $t('processManagement.processRoute.editTheBasicInformation') }}
            </template>
            <Button type="link" @click="showEditDrawerFn(row)" class="px-1">
              <Icon
                icon="mdi:edit-box-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 绑定产品型号 -->
          <Tooltip>
            <template #title>
              {{ $t('processManagement.processRoute.bindProductModel') }}
            </template>
            <Button type="link" @click="pullIn(row)" class="px-1">
              <Icon
                icon="mdi:attachment"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 审核 -->
          <Tooltip>
            <template #title>
              {{ $t('processManagement.processRoute.audit') }}
            </template>
            <Button type="link" @click="pullIn(row)" class="px-1">
              <Icon
                icon="mdi:checkbox-multiple-marked-circle-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 变更 -->
          <Tooltip>
            <template #title>
              {{ $t('processManagement.processRoute.change') }}
            </template>
            <Button
              type="link"
              @click="showRouteDetailPage(row.id, true)"
              class="px-1"
            >
              <Icon
                icon="mdi:update"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 日志查看 -->
          <Tooltip>
            <template #title>
              {{ $t('processManagement.processRoute.logView') }}
            </template>
            <Button type="link" @click="pullIn(row)" class="px-1">
              <Icon
                icon="mdi:file-document-box-search-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 删除 -->
          <Tooltip>
            <template #title>
              {{ $t('processManagement.processRoute.delete') }}
            </template>
            <Button type="link" @click="pullIn(row)" danger class="px-1">
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
        <!-- 工艺路线编号 -->
        <FormItem
          :label="$t('processManagement.processRoute.processRouteNumber')"
          name="routeCode"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="editItem.routeCode" :disabled="!!editItem.id" />
        </FormItem>
        <!-- 工艺路线名称 -->
        <FormItem
          :label="$t('processManagement.processRoute.processRouteName')"
          name="routeName"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="editItem.routeName" />
        </FormItem>
        <!-- 路线类型 -->
        <FormItem
          :label="$t('processManagement.processRoute.routeType')"
          name="routeType"
          style="margin-bottom: 1em"
        >
          <RadioGroup
            v-model:value="editItem.routeType"
            :options="routeTypeList"
            v-if="routeTypeList.length <= 3"
          />
          <Select
            v-model:value="editItem.routeType"
            :options="routeTypeList"
            v-else
          />
        </FormItem>
        <!-- 备注 -->
        <FormItem
          :label="$t('processManagement.processBase.remark')"
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

    <ProcessRouteDetailPage ref="processRouteDetailPageRef" />
  </Page>
</template>

<style scoped></style>
