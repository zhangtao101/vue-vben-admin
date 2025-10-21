<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import {
  MdiEditOutline,
  MdiEyeOutline,
  MdiLightDelete,
  MdiSearch,
} from '@vben/icons';

import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Radio,
  RadioGroup,
  Select,
  Space,
  Switch,
  Textarea,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteUser,
  insertUser,
  listSysPerson,
  listUser,
  quXeryRoleManagementDropDown,
  updateArticle,
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
    { field: 'userName', title: '用户名', minWidth: 150 },
    { field: 'perName', title: '关联人员', minWidth: 150 },
    { field: 'workNumber', title: '工号', minWidth: 150 },
    {
      field: 'isEnable',
      slots: { default: 'status' },
      title: '状态',
      minWidth: 150,
    },
    {
      field: 'roleNames',
      slots: { default: 'roleNames' },
      title: '角色管理',
      minWidth: 150,
    },
    { field: 'discription', title: '用户描述', minWidth: 150 },
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
  isEnable: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  perName_workNumber: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  userName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
});

/**
 * 查看行详情
 * @param row 表格行数据
 */
function viewRow(row: any) {
  checkedRow.value = row;
  showViewDrawer.value = true;
}

/**
 * 显示是编辑抽屉
 * @param row 表格行数据
 */
function editRow(row?: any) {
  checkedRow.value = row
    ? {
        ...row,
        perName_workNumber: `${row.perName}&&${row.workNumber}`,
      }
    : {};
  showEditDrawer.value = true;

  // 查询管理人员数据, 防止第一次点击时没有数据
  handleSearch('');
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
      deleteUser(row.userCode)
        .then(() => {
          // 显示操作成功的提示信息
          message.success($t('common.successfulOperation'));
          gridApi.query();
        })
        .catch((error) => {
          // 显示操作失败的提示信息
          message.error($t('common.operationFailure'));
          message.error(error.msg); // 显示操作失败的提示信息
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
    const params = {
      ...checkedRow.value,
    };
    params.roleCode = params.roles ? params.roles.join(',') : null;
    const ob = params.id ? updateArticle(params) : insertUser(params);
    ob.then(() => {
      // 查询用户数据
      gridApi.query();
      message.success($t('common.successfulOperation'));
      onClose();
    }).catch((error) => {
      // 如果请求失败，显示操作失败的提示信息
      message.error($t('common.operationFailure')); // 显示通用的错误提示信息
      // 显示具体的错误信息
      message.error(error); // 显示从服务器返回的具体错误信息
    });
  });
}

// region 人员数据查询及绑定操作
// 人员数据
const personnelData = ref<any>([]);
// 定时器id
let personnelTimeout: any = null;

/**
 * 处理搜索操作
 * 当用户输入搜索值时，延迟触发搜索请求，以减少频繁的网络请求。
 * @param {string} value - 用户输入的搜索值
 */
function handleSearch(value: string) {
  // 如果之前有延迟搜索操作未完成，先清除
  if (personnelTimeout) {
    clearTimeout(personnelTimeout);
    personnelTimeout = null;
  }
  // 定义一个立即执行的匿名函数，用于执行搜索请求
  const fake = () => {
    // 调用listSysPerson API函数，传递搜索参数
    listSysPerson({
      pageNum: 1, // 设置请求的页码为第一页
      pageSize: 200, // 设置每页请求的数据条数
      perName: value, // 用户输入的搜索值，通常用于按姓名搜索
    })
      .then(({ list }) => {
        // 请求成功后，清空当前的搜索结果
        personnelData.value = [];
        // 遍历返回的搜索结果列表
        for (const item of list) {
          // 将每个搜索结果格式化后添加到personnelData数组中
          personnelData.value.push({
            label: `${item.orgName}_${item.perName}_${item.workNumber}`, // 显示的标签
            value: `${item.perName}&&${item.workNumber}`, // 实际的值
          });
        }
      })
      .catch((error) => {
        // 如果请求失败，显示操作失败的提示信息
        message.error($t('common.operationFailure')); // 显示通用的错误提示信息
        // 显示具体的错误信息
        message.error(error); // 显示从服务器返回的具体错误信息
      });
  };
  // 使用setTimeout延迟执行搜索请求，延迟时间为300毫秒
  personnelTimeout = setTimeout(fake, 300);
}

/**
 * 处理值改变事件
 * 当用户选择一个带有复合信息（如姓名-工号）的选项时，此函数会将该值拆分并更新相关数据。
 * @param {string} value - 用户选择的完整值，通常是一个由特定分隔符连接的字符串
 * @param {any} _option - 参数信息
 */
function handleChange(value: any, _option: any) {
  // 检查用户是否选择了一个值
  if (value) {
    // 使用'-'作为分隔符将字符串拆分成数组
    const params = value.split('&&');

    // 检查拆分后的数组是否有足够的元素
    if (params.length >= 2) {
      // 将拆分后的第一个元素（姓名）赋值给checkedRow对象的preName属性
      checkedRow.value.preName = params[0];
      // 将拆分后的第二个元素（工号）赋值给checkedRow对象的workNumber属性
      checkedRow.value.workNumber = params[1];
    }
  }
}
// endregion

// endregion

// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 关联人员
  perName: '',
  // 用户名
  userName: '',
});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    /**
     * 调用 listUser 函数，传入查询参数和分页信息。
     * 查询参数包括 queryParams.value 中的所有属性，以及当前页码和每页大小。
     */
    listUser({
      ...queryParams.value, // 展开 queryParams.value 对象，包含所有查询参数。
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

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);
// 新增按钮是否显示
const addButton = ref(false);
// 编辑按钮是否显示
const editButton = ref(false);
// 删除按钮是否显示
const delButton = ref(false);

// 监听权限变化, 变更按钮的显示情况
watch(
  () => author.value,
  () => {
    // 当 author.value 包含 '新增' 时，设置 addButton.value 为 true，表示允许新增
    addButton.value = author.value.includes('新增');
    // 当 author.value 包含 '编辑' 时，设置 editButton.value 为 true，表示允许编辑
    editButton.value = author.value.includes('编辑');
    // 当 author.value 包含 '删除' 时，设置 delButton.value 为 true，表示允许删除
    delButton.value = author.value.includes('删除');
  },
);

// endregion

// region 角色查询

const roleList = ref<any[]>([]);

/**
 * 查询角色数据
 */
function queryRoleData() {
  quXeryRoleManagementDropDown().then((data) => {
    roleList.value = [...data];
  });
}

// endregion

// region 初始化

onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  queryRoleData();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 用户名 -->
        <FormItem :label="$t('system.sysUser.username')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.userName" />
        </FormItem>

        <!-- 关联人员 -->
        <FormItem
          :label="$t('system.sysUser.associatedPersonnel')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.perName" />
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
          <Button v-if="addButton" type="primary" @click="editRow()">
            {{ $t('common.add') }}
          </Button>
        </template>
        <template #action="{ row }">
          <!-- 查看详情 -->
          <Tooltip>
            <template #title>{{ $t('common.view') }}</template>
            <Button
              :icon="h(MdiEyeOutline, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="viewRow(row)"
            />
          </Tooltip>
          <!-- 编辑按钮 -->
          <Tooltip>
            <template #title>{{ $t('common.edit') }}</template>
            <Button
              v-if="editButton"
              :icon="h(MdiEditOutline, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="editRow(row)"
            />
          </Tooltip>

          <!-- 删除数据 -->
          <Tooltip>
            <template #title>{{ $t('common.delete') }}</template>
            <Button
              v-if="delButton"
              :icon="
                h(MdiLightDelete, {
                  class: 'inline-block size-6',
                })
              "
              danger
              type="link"
              @click="delRow(row)"
            />
          </Tooltip>
        </template>
        <template #status="{ row }">
          <Switch
            v-model:checked="row.isEnable"
            :checked-children="$t('status.enable')"
            :checked-value="1"
            :un-checked-children="$t('status.forbidden')"
            disabled
          />
        </template>
        <template #roleNames="{ row }">
          <span>{{ row.roleNames.toString() }}</span>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- region 查看详情抽屉 -->
    <Drawer
      v-model:open="showViewDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="600"
      class="custom-class"
      placement="right"
      title="查看详情"
    >
      <Descriptions :column="2" bordered title="用户详情">
        <DescriptionsItem label="用户名">
          {{ checkedRow.userName }}
        </DescriptionsItem>
        <DescriptionsItem label="关联人员">
          {{ checkedRow.perName }}
        </DescriptionsItem>
        <DescriptionsItem label="工号">
          {{ checkedRow.workNumber }}
        </DescriptionsItem>
        <DescriptionsItem label="状态">
          {{ checkedRow.isEnable ? '启用' : '禁用' }}
        </DescriptionsItem>
        <DescriptionsItem label="用户描述">
          {{ checkedRow.discription }}
        </DescriptionsItem>
      </Descriptions>
    </Drawer>
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
        autocomplete="off"
        name="editMessageForm"
      >
        <!-- 用户名 -->
        <FormItem :label="$t('system.sysUser.username')" name="userName">
          <Input v-model:value="checkedRow.userName" />
        </FormItem>
        <!-- 关联人员 -->
        <FormItem
          :label="$t('system.sysUser.associatedPersonnel')"
          name="perName_workNumber"
        >
          <Select
            v-model:value="checkedRow.perName_workNumber"
            :default-active-first-option="false"
            :filter-option="false"
            :not-found-content="null"
            :options="personnelData"
            :show-arrow="false"
            placeholder="输入用户名进行查询"
            placement="bottomRight"
            show-search
            @change="handleChange"
            @search="handleSearch"
          />
        </FormItem>
        <!-- 角色 -->
        <FormItem :label="$t('system.sysUser.role')" name="roles">
          <Select
            v-model:value="checkedRow.roles"
            mode="multiple"
            :options="roleList"
            :field-names="{ label: 'name', value: 'code' }"
            placement="bottomRight"
            @change="handleChange"
          />
        </FormItem>
        <!-- 工号 -->
        <FormItem :label="$t('system.sysUser.workNumber')" name="workNumber">
          <Input v-model:value="checkedRow.workNumber" readonly />
        </FormItem>
        <!-- 状态 -->
        <FormItem :label="$t('system.sysUser.status')" name="isEnable">
          <RadioGroup v-model:value="checkedRow.isEnable">
            <Radio :value="1">启用</Radio>
            <Radio :value="0">禁用</Radio>
          </RadioGroup>
        </FormItem>

        <!-- 用户描述 -->
        <FormItem :label="$t('system.sysUser.description')" name="discription">
          <Textarea v-model:value="checkedRow.discription" />
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
