<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { computed, h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createAccidents,
  queryOrganizationTree,
  queryTheListOfAccidents,
  updateAccidents,
} from '#/api';
import { $t } from '#/locales';
import { flattenTree, queryAuth } from '#/util';
import InitiateTheProcess from '#/util/component/accidentReporting/initiateTheProcess.vue';

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: $t('accidentManagement.serialNumber'), type: 'seq', width: 50 },
    { field: 'accidentCode', title: $t('accidentManagement.accidentCode'), minWidth: 190 },
    {
      field: 'type',
      title: $t('accidentManagement.accidentType'),
      minWidth: 150,
      slots: { default: 'type' },
    },
    { field: 'injuredUser', title: $t('accidentManagement.injuredEmployee'), minWidth: 150 },
    { field: 'worknumber', title: $t('accidentManagement.employeeID'), minWidth: 150 },
    { field: 'position', title: $t('accidentManagement.department'), minWidth: 150 },
    { field: 'time', title: $t('accidentManagement.occurrenceTime'), minWidth: 150 },
    { field: 'eventDescription', title: $t('accidentManagement.accidentDescription'), minWidth: 150 },
    { field: 'injuredPartList', title: $t('accidentManagement.injuredPart'), minWidth: 150 },
    { field: 'injuredDescription', title: $t('accidentManagement.descriptionOfInjuryCondition'), minWidth: 150 },
    { field: 'injuredTypeList', title: $t('accidentManagement.injuryTypeName'), minWidth: 150 },
    { field: 'manager', title: $t('accidentManagement.departmentSupervisor'), minWidth: 150 },
    { field: 'reason', title: $t('accidentManagement.accidentReason'), minWidth: 150 },
    { field: 'measures', title: $t('accidentManagement.rectificationMeasure'), minWidth: 150 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('accidentManagement.action'),
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
    if (params.createTime) {
      params.createTime = params.createTime.format('YYYY');
    }
    queryTheListOfAccidents({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
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

// endregion

// region 新增 / 编辑
// 是否显示编辑
const showEdit = ref(false);
// 新增/编辑组件引用
const initiateTheProcessRef = ref<any>();

/**
 * 提交
 */
function submit() {
  initiateTheProcessRef.value.formValidate((val: any) => {
    // 验证通过，执行提交操作
    const ob = val.id ? updateAccidents(val) : createAccidents(val);
    ob.then(() => {
      message.success($t('common.successfulOperation'));
      gridApi.reload();
      editClose();
    });
  });
}

/**
 * 显示编辑
 * @param row 编辑对象 为空值表示新增
 */
function showEditFun(row?: any) {
  showEdit.value = true;
  setTimeout(() => {
    initiateTheProcessRef.value.formInit(row || {});
  }, 200);
}

/**
 * 关闭抽屉
 */
function editClose() {
  showEdit.value = false;
}

// endregion

// region 事故类型

const accidentType = computed<any>(() => ({
  1: $t('accidentManagement.level1'),
  2: $t('accidentManagement.level2'),
  3: $t('accidentManagement.level3'),
  4: $t('accidentManagement.level4'),
}));

// endregion

// region 组织查询
// 组织数据
const treeData = ref<any>([]);
/**
 * 查询全部的组织树
 * 这个函数用于从服务器获取所有组织数据，并更新前端的树形数据结构。
 */
function queryAllOrganizations() {
  // 调用queryDictionaryTree API函数，获取菜单列表
  queryOrganizationTree().then((data) => {
    // 检查返回的数据是否存在且长度大于0
    if (data) {
      const arr = flattenTree(
        {
          children: [data],
        },
        'children',
      );
      treeData.value = [];
      arr.forEach((item: any) => {
        treeData.value.push({
          label: item.orgFullName,
          value: item.orgFullName,
          isLeaf: false,
        });
      });
    }
  });
}

// endregion

// region 权限查询

// 路由信息
const route = useRoute();
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 初始化

onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  queryAllOrganizations();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 岗位 -->
        <FormItem
          :label="$t('accidentManagement.department')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.position"
            :options="treeData"
            allow-clear
            class="!w-48"
          />
        </FormItem>
        <!-- 年份 -->
        <FormItem
          :label="$t('accidentManagement.year')"
          style="margin-bottom: 1em"
        >
          <DatePicker v-model:value="queryParams.createTime" picker="year" />
        </FormItem>
        <!-- 受伤人员 -->
        <FormItem
          :label="$t('accidentManagement.injuredEmployee')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.injuredUser" />
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

        <template #type="{ row }">
          {{ !row.type ? '' : accidentType[row.type] }}
        </template>
        <template #action="{ row }">
          <!-- 编辑 -->
          <Tooltip v-if="author.includes('编辑')">
            <template #title>{{ $t('common.edit') }}</template>
            <Button type="link" @click="showEditFun(row)">
              <Icon
                icon="mdi:edit-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <Drawer
      v-model:open="showEdit"
      :footer-style="{ textAlign: 'right' }"
      width="900"
      placement="right"
      :title="$t('common.edit')"
      @close="editClose"
    >
      <InitiateTheProcess ref="initiateTheProcessRef" />
      <!-- 抽屉底部操作按钮 -->
      <template #footer>
        <!-- 按钮组，包含取消和确认按钮 -->
        <Space>
          <!-- 取消按钮，点击后关闭人员操作抽屉 -->
          <Button @click="editClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认按钮，点击后提交人员操作信息 -->
          <Button type="primary" @click="submit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
