<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { IconifyIcon, MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Popconfirm,
  Select,
  Space,
  Textarea,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addHiddenDangerInspectionType,
  areaList,
  deleteHiddenDangerInspectionType,
  getInspectionTypeNamelist,
  queryDictionaryByCode,
  queryHiddenDangerInspectionType,
  updateHiddenDangerInspectionType,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'checkType', title: '风险分类', minWidth: 190 },
    { field: 'checkItem', title: '巡检项目', minWidth: 190 },
    { field: 'checkCriteria', title: '检查标准', minWidth: 150 },
    { field: 'area', title: '检查区域', minWidth: 150 },
    { field: 'areaCode', title: '区域编码', minWidth: 150 },
    { field: 'createUser', title: '提交人', minWidth: 150 },
    { field: 'createTime', title: '提交时间', minWidth: 150 },
    { field: 'updateTime', title: '更新时间', minWidth: 150 },
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

// 查询参数
const queryParams = ref<any>({});
/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams.value };
    queryHiddenDangerInspectionType({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
      type: 2, // 隐患页面type=1，风险页面type=2
    })
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

// endregion\

// region 新增 / 编辑
// 是否显示编辑
const showEdit = ref(false);
/**
 * 新增/编辑表单引用
 */
const formRef = ref<any>();
/**
 * 编辑对象
 */
const editItem = ref<any>({});
/**
 * 提交加载中
 */
const submitLoading = ref(false);
/**
 * 提交
 */
function submit() {
  formRef.value.validate().then(() => {
    const params = {
      ...editItem.value,
      type: 2,
    };
    const ob = params.id
      ? updateHiddenDangerInspectionType(params)
      : addHiddenDangerInspectionType(params);
    submitLoading.value = true;
    ob.then(() => {
      message.success($t('common.successfulOperation'));
      gridApi.reload();
      editClose();
    }).finally(() => {
      submitLoading.value = false;
    });
  });
}

/**
 * 显示编辑
 * @param row 编辑对象 为空值表示新增
 */
function showEditFun(row?: any) {
  showEdit.value = true;
  editItem.value = row ? { ...row } : {};
}

/**
 * 关闭抽屉
 */
function editClose() {
  showEdit.value = false;
  editItem.value = {};
}

/**
 * 删除
 * @param row
 */
function delItem(row: any) {
  deleteHiddenDangerInspectionType(row.id).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

// endregion

// region 区域类型

const areaOptions = ref<any[]>([]);

/**
 * 查询区域
 */
function queryArea() {
  areaList({
    pageNum: 1, // 当前页码。
    pageSize: 99_999, // 每页显示的数据条数。
  }).then(({ list }) => {
    areaOptions.value = [];
    list.forEach((item: any) => {
      areaOptions.value.push({
        label: item.areaName,
        value: item.areaCode,
      });
    });
  });
}

/**
 * 地区变更
 * @param _v
 * @param item
 */
function areaChange(_v: any, item: any) {
  editItem.value.areaCode = item.value;
  editItem.value.area = item.label;
}

// 过滤
const filterOption = (input: string, option: any) => {
  return [option.label.toLowerCase(), option.value.toLowerCase()].includes(
    input.toLowerCase(),
  );
};
// endregion

// region 风险分类

// 检查类别选项
const checkTypeOptions = ref<any[]>([]);

/**
 * 根据父级字典编号查询数据
 */
function queryDataByParCode() {
  // 根据选中的菜单代码查询字典数据
  queryDictionaryByCode({
    pageNum: 1, // 当前页码
    pageSize: 9999, // 每页显示的条数
    parCode: 'RISKTYPE', // 父级编码
  }).then(({ list }: any) => {
    checkTypeOptions.value = [];
    list.forEach((item: any) => {
      checkTypeOptions.value.push({
        label: item.wordName,
        value: item.wordName,
      });
    });
  });
}

// endregion

// region 权限查询

// 路由信息
const route = useRoute();
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 巡检项目查询
const checkItemOptions = ref<any[]>([]);
function queryCheckItem() {
  getInspectionTypeNamelist({
    type: 2, // 隐患1 ，风险2
  }).then((data) => {
    checkItemOptions.value = [];
    data.forEach((i: any) => {
      checkItemOptions.value.push({
        label: i,
        value: i,
      });
    });
  });
}

// endregion

// region 初始化

onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  queryArea();
  queryDataByParCode();
  queryCheckItem();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 检查类别 -->
        <FormItem
          :label="$t('hiddenDangerInspectionStandard.riskClassification')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.checkType"
            :options="checkTypeOptions"
            allow-clear
            class="!w-48"
          />
        </FormItem>
        <!-- 巡检项目 -->
        <FormItem
          :label="$t('hiddenDangerInspectionStandard.checkItem')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.checkItem"
            :options="checkItemOptions"
            allow-clear
            class="!w-48"
          />
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
        <template #toolbar-actions>
          <Button
            type="primary"
            @click="showEditFun()"
            v-if="author.includes('新增')"
          >
            {{ $t('common.create') }}
          </Button>
        </template>

        <template #action="{ row }">
          <!-- 编辑 -->
          <Tooltip v-if="author.includes('编辑')">
            <template #title>{{ $t('common.edit') }}</template>
            <Button type="link" @click="showEditFun(row)">
              <IconifyIcon
                icon="mdi:edit-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 删除 -->
          <Tooltip v-if="author.includes('删除')">
            <template #title>{{ $t('common.delete') }}</template>
            <Popconfirm
              :cancel-text="$t('common.cancel')"
              :ok-text="$t('common.confirm')"
              :title="$t('ui.widgets.deletionConfirmation')"
              @confirm="delItem(row)"
            >
              <Button danger type="link">
                <IconifyIcon
                  icon="mdi-light:delete"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Popconfirm>
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <Drawer
      v-model:open="showEdit"
      :footer-style="{ textAlign: 'right' }"
      width="500"
      placement="right"
      :title="$t('common.edit')"
      @close="editClose"
    >
      <Form
        ref="formRef"
        :model="editItem"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <!-- 风险分类 -->
        <FormItem
          :label="$t('hiddenDangerInspectionStandard.riskClassification')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="checkType"
        >
          <Select
            v-model:value="editItem.checkType"
            :options="checkTypeOptions"
          />
        </FormItem>
        <!-- 工作站选择表单项，验证是否选择 -->
        <FormItem
          :label="$t('hiddenDangerInspectionStandard.checkItem')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="checkItem"
        >
          <Input v-model:value="editItem.checkItem" />
        </FormItem>
        <!-- 检查标准 -->
        <FormItem
          :label="$t('hiddenDangerInspectionStandard.checkCriteria')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="checkCriteria"
        >
          <Textarea v-model:value="editItem.checkCriteria" />
        </FormItem>

        <!-- 巡检区域 -->
        <FormItem
          :label="$t('hiddenDangerInspectionPlan.inspectionArea')"
          style="margin-bottom: 1em"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="areaCode"
        >
          <Select
            v-model:value="editItem.areaCode"
            :options="areaOptions"
            show-search
            class="w-full"
            :filter-option="filterOption"
            @change="areaChange"
          />
        </FormItem>
      </Form>
      <!-- 抽屉底部操作按钮 -->
      <template #footer>
        <!-- 按钮组，包含取消和确认按钮 -->
        <Space>
          <!-- 取消按钮，点击后关闭人员操作抽屉 -->
          <Button @click="editClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认按钮，点击后提交人员操作信息 -->
          <Button type="primary" @click="submit" :loading="submitLoading">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
