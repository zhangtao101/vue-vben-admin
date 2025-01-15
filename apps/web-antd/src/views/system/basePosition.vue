<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import {
  MaterialSymbolsDeleteOutline,
  MaterialSymbolsSearch,
  MingcuteEditLine,
} from '@vben/icons';
import { $t } from '@vben/locales';

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
  Switch,
  Textarea,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addStation,
  deleteStation,
  getMenusWeb,
  listStations,
  queryStationStage,
  queryStationType,
  updateStation,
} from '#/api';

// 路由信息
const route = useRoute();

// region 表格操作
// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'staCode', title: '岗位编码', minWidth: 150 },
    { field: 'staName', title: '岗位名称', minWidth: 150 },
    { field: 'staType', title: '岗位类别', minWidth: 150 },
    { field: 'staLevel', title: '岗位等级', minWidth: 150 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 220,
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
          page: page?.currentPage,
          pageSize: page?.pageSize,
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

/**
 * 删除行
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
      deleteStation(row.id)
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

// endregion

// region 新增/编辑
const form = ref();
// 新增/编辑弹窗是否显示
const showEditDialog = ref(false);
// 新增/编辑对象
const editItem = ref<any>({});
// 新增/编辑规则
const editRules = ref<any>({
  staCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  staName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
});
/**
 * 显示编辑抽屉
 * @param isCreate 是否是新增
 * @param row 当前行数据(isCreate为false时才会有)
 */
function showEdit(isCreate: boolean, row?: any) {
  editItem.value = isCreate ? {} : row;
  showEditDialog.value = true;
}

/**
 * 关闭抽屉
 */
function close() {
  showEditDialog.value = false;
  editItem.value = {};
}

// 上传状态
const submitLoading = ref(false);
/**
 * 提交
 */
function submit() {
  /**
   * 使用 form.value.validate() 方法验证表单。
   * 这个方法返回一个 Promise 对象，我们使用 then 方法来处理验证通过的情况。
   */
  form.value.validate().then(() => {
    submitLoading.value = true;
    const ob = editItem.value.id
      ? updateStation(editItem.value)
      : addStation(editItem.value);
    ob.then(() => {
      // 显示操作成功的提示信息
      message.success($t('common.successfulOperation'));
      gridApi.query();
      close();
    }).finally(() => {
      submitLoading.value = false;
    });
  });
}
// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 岗位编码
  staCode: '',
  // 岗位名称
  staName: '',
});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 调用 listStations API函数，传递查询参数和分页信息
    listStations({
      ...queryParams.value, // 展开queryParams.value中的所有查询参数
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ total, list }) => {
        // 成功获取数据后，更新数据列表和总条数
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

/**
 * 查询权限
 * 这个函数用于查询当前页面的权限设置，并将权限名称存储在响应式引用author中。
 */
function queryAuth() {
  // 调用getMenusWeb API函数，传递menuCode和type参数
  getMenusWeb({
    menuCode: route.meta.code as string, // 从路由元信息中获取menuCode，并确保其为字符串类型
    type: 'web', // 指定查询的类型为'web'
  }).then((data) => {
    // 检查返回的数据是否存在且不为空数组
    if (!data || data.length === 0) return;

    // 遍历返回的数据
    for (const item of data) {
      // 将每个权限项的buttonName添加到author数组中
      author.value.push(item.buttonName);
    }
  });
}

// 监听权限变化, 变更按钮的显示情况
watch(author.value, () => {
  // 当 author.value 包含 '新增' 时，设置 addButton.value 为 true，表示允许新增
  addButton.value = author.value.includes('新增');
  // 当 author.value 包含 '编辑' 时，设置 editButton.value 为 true，表示允许编辑
  editButton.value = author.value.includes('编辑');
  // 当 author.value 包含 '删除' 时，设置 delButton.value 为 true，表示允许删除
  delButton.value = author.value.includes('删除');
});

// endregion

// region 等级及类别查询
// 岗位类别
const jobType = ref<any>([]);
// 岗位等级
const jobLevel = ref<any>([]);
/**
 * 查询部门类别
 */
function queryType() {
  queryStationType().then((res) => {
    jobType.value = [];
    res.forEach((res: any) => {
      jobType.value.push({
        label: res.wordName,
        value: res.wordName,
      });
    });
  });
}

/**
 * 查询部门级别
 */
function queryLevel() {
  queryStationStage().then((res) => {
    jobLevel.value = [];
    res.forEach((res: any) => {
      jobLevel.value.push({
        label: res.wordName,
        value: res.wordName,
      });
    });
  });
}
// endregion

// region 初始化

onMounted(() => {
  // 查询权限
  queryAuth();
  queryType();
  queryLevel();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 岗位编码 -->
        <FormItem
          :label="$t('basePosition.jobCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.staCode" />
        </FormItem>

        <!-- 岗位名称 -->
        <FormItem
          :label="$t('basePosition.jobName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.staName" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MaterialSymbolsSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="() => gridApi.reload()"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->
    <!-- region 表格 -->
    <Card class="mb-8">
      <Grid>
        <template #toolbar-tools>
          <!-- 新增按钮 -->
          <Button type="primary" @click="showEdit(true)">
            {{ $t('common.add') }}
          </Button>
        </template>
        <template #state="{ row }">
          <div v-if="row.state === 3">已弃用</div>
          <div v-else>
            <Switch
              v-model:checked="row.state"
              :checked-value="1"
              :un-checked-value="2"
              checked-children="启用"
              un-checked-children="停用"
            />
          </div>
        </template>
        <template #action="{ row }">
          <!-- 编辑按钮 -->
          <Tooltip>
            <template #title>{{ $t('common.edit') }}</template>
            <Button
              :icon="h(MingcuteEditLine, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="showEdit(false, row)"
            />
          </Tooltip>

          <!-- 删除数据 -->
          <Tooltip>
            <template #title>{{ $t('common.delete') }}</template>
            <Button
              :icon="
                h(MaterialSymbolsDeleteOutline, {
                  class: 'inline-block size-6',
                })
              "
              danger
              type="link"
              @click="delRow(row)"
            />
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
    <Drawer
      v-model:open="showEditDialog"
      :footer-style="{ textAlign: 'right' }"
      :width="500"
      placement="right"
      title="信息编辑"
      @close="close"
    >
      <Form
        :label-col="{ span: 8 }"
        :model="editItem"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        name="editMessageForm"
        ref="form"
      >
        <!-- 岗位编码 -->
        <FormItem :label="$t('basePosition.jobCode')" name="staCode">
          <Input v-model:value="editItem.staCode" />
        </FormItem>
        <!-- 岗位名称 -->
        <FormItem :label="$t('basePosition.jobName')" name="staName">
          <Input v-model:value="editItem.staName" />
        </FormItem>
        <!-- 岗位类别 -->
        <FormItem :label="$t('basePosition.jobType')" name="staType">
          <Select
            v-model:value="editItem.staType"
            :options="jobType"
            allow-clear
            class="w-full"
          />
        </FormItem>
        <!-- 岗位等级 -->
        <FormItem :label="$t('basePosition.jobLevel')" name="staLevel">
          <Select
            v-model:value="editItem.staLevel"
            :options="jobLevel"
            allow-clear
            class="w-full"
          />
        </FormItem>
        <!-- 工作目标 -->
        <FormItem :label="$t('basePosition.workObjective')" name="workGoal">
          <Textarea v-model:value="editItem.workGoal" />
        </FormItem>
        <!-- 备注 -->
        <FormItem :label="$t('basePosition.remark')" name="discription">
          <Textarea v-model:value="editItem.discription" />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="close">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="submit" :loading="submitLoading">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
