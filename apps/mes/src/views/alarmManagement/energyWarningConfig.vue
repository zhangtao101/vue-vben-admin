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
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { listUser } from '#/api';
import {
  getAnEnergyWarning,
  resetConfig,
  useTheEnergyWarningConfiguration,
} from '#/api/alarmManagement';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'partitionName', title: '单元分区名称', minWidth: 190 },
    { field: 'equipmentCode', title: '仪表编号', minWidth: 150 },
    { field: 'equipmentName', title: '仪表名称', minWidth: 150 },
    { field: 'equipmentType', title: '仪表类型', minWidth: 150 },
    { field: 'waringDay', title: '日上限', minWidth: 150 },
    { field: 'waringMonth', title: '月上限', minWidth: 150 },
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
    getAnEnergyWarning({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ total, list }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total,
          items: list || [{}],
        });
      })
      .catch((error) => {
        resolve({
          total: 0,
          items: [{}],
        });
        reject(error);
      });
  });
}

// endregion

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
    };
    let level = 1;
    params.handleUser.forEach((item: any) => {
      item.level = level;
      level++;
    });
    submitLoading.value = true;
    useTheEnergyWarningConfiguration(editItem.value)
      .then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
        editClose();
      })
      .finally(() => {
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
  editItem.value = row ? JSON.parse(`${JSON.stringify(row)}`) : {};
  editItem.value.handleUser = editItem.value.handleUser || [];
}

/**
 * 新增用户
 */
function addUser() {
  editItem.value.handleUser.push({});
}

/**
 * 删除用户
 */
function delUser(index: number) {
  editItem.value.handleUser.splice(index, 1);
}

/**
 * 关闭抽屉
 */
function editClose() {
  showEdit.value = false;
  editItem.value = {};
}

// endregion

// region 用户查询

const userOptions = ref<any[]>([]);

/**
 * 查询用户
 */
function queryUser() {
  listUser({
    pageNum: 1, // 当前页码。
    pageSize: 99_999, // 每页显示的数据条数。
  }).then(({ list }) => {
    userOptions.value = [];
    list.forEach((item: any) => {
      userOptions.value.push({
        label: item.userName,
        value: item.userName,
      });
    });
  });
}

const filterOption = (input: string, option: any) => {
  return `${option.label.toLowerCase()}${option.value.toLowerCase()}`.includes(
    input.toLowerCase(),
  );
};

// endregion

// region 重置

function reset(row: any) {
  // 弹出确认对话框
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      // 点击取消按钮，显示警告消息
      message.warning('已取消操作!');
    },
    onOk() {
      // 调用 API 接口执行工单群发操作
      resetConfig({
        equipmentCode: row.equipmentCode, // 当前工作站编码
      }).then(() => {
        // 显示成功消息
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
    title: '是否确认重置配置?',
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

  queryUser();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 巡检项目 -->
        <FormItem
          :label="$t('alarmManagement.meterNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.equipmentCode" />
        </FormItem>
        <!-- 巡检项目 -->
        <FormItem
          :label="$t('alarmManagement.meterName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.equipmentName" />
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
        <template #action="{ row }">
          <!-- 编辑按钮 ="{ row }" -->
          <Tooltip v-if="author.includes('编辑')">
            <template #title>
              {{ $t('alarmManagement.configuration') }}
            </template>
            <Button type="link" @click="showEditFun(row)">
              <IconifyIcon
                icon="mdi:square-edit-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 编辑按钮 ="{ row }" -->
          <Tooltip v-if="author.includes('编辑')">
            <template #title>
              {{ $t('alarmManagement.reset') }}
            </template>
            <Button type="link" @click="reset(row)" danger>
              <IconifyIcon
                icon="carbon:renew"
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
      width="500"
      placement="right"
      :title="$t('alarmManagement.configuration')"
      @close="editClose"
    >
      <Form
        ref="formRef"
        :model="editItem"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <!-- 仪表编号 -->
        <FormItem
          :label="$t('alarmManagement.meterNumber')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="equipmentCode"
        >
          <Input v-model:value="editItem.equipmentCode" readonly />
        </FormItem>
        <!-- 日上限 -->
        <FormItem
          :label="$t('alarmManagement.dailyLimit')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="waringDay"
        >
          <InputNumber v-model:value="editItem.waringDay" />
        </FormItem>
        <!-- 月上限 -->
        <FormItem
          :label="$t('alarmManagement.monthlyLimit')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="waringMonth"
        >
          <InputNumber v-model:value="editItem.waringMonth" />
        </FormItem>
        <!-- 超时时间 -->
        <FormItem
          :label="$t('alarmManagement.timeout')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="outTime"
        >
          <InputNumber
            v-model:value="editItem.outTime"
            :addon-after="$t('alarmManagement.timeoutUnit')"
          />
        </FormItem>
        <!-- 处理人 -->
        <FormItem
          :label="$t('alarmManagement.handlers')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="handleUser"
        >
          <template v-for="(item, index) of editItem.handleUser" :key="index">
            <Select
              v-model:value="item.user"
              :options="userOptions"
              mode="multiple"
              show-search
              allow-clear
              :filter-option="filterOption"
              class="mb-4 !w-48"
            />
            <!-- 编辑按钮 ="{ row }" -->
            <Tooltip v-if="author.includes('编辑')">
              <template #title>
                {{ $t('common.delete') }}
              </template>
              <Button type="link" @click="delUser(index)" danger>
                <IconifyIcon
                  icon="mdi:delete"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
          </template>
          <Button class="w-full" type="dashed" @click="addUser">
            {{ $t('common.add') }}
          </Button>
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
