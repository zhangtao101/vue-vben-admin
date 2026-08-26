<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
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
  Select,
  Space,
  Switch,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteRegisterRecord,
  insertRegisterRecord,
  selectRegisterRecordList,
  updateRegisterRecord,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import RegisterDetailDrawer from '#/util/component/registerCenter/RegisterDetailDrawer.vue';

// 路由信息
const route = useRoute();

// 登记类型选项 1API接口 2mqtt 3数据库 4url连接
const registerTypeOptions = [
  { color: 'green', label: $t('functionRegisterManage.api'), value: 1 },
  { color: 'cyan', label: $t('functionRegisterManage.mqtt'), value: 2 },
  { color: 'blue', label: $t('functionRegisterManage.database'), value: 3 },
  { color: 'orange', label: $t('functionRegisterManage.urlConnect'), value: 4 },
];

// 权限标记选项 1无权限校验 2指定权限校验
const registerFlagOptions = [
  { color: 'green', label: $t('functionRegisterManage.noAuth'), value: 1 },
  { color: 'orange', label: $t('functionRegisterManage.specifiedAuth'), value: 2 },
];

// 触发方式选项 1主动调用 2实时监听 3轮询读取 4修改推送
const registerTriggerOptions = [
  { color: 'blue', label: $t('functionRegisterManage.activeCall'), value: 1 },
  { color: 'green', label: $t('functionRegisterManage.realTimeMonitor'), value: 2 },
  { color: 'orange', label: $t('functionRegisterManage.pollRead'), value: 3 },
  { color: 'purple', label: $t('functionRegisterManage.modifyPush'), value: 4 },
];

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    {
      field: 'registerCode',
      title: $t('functionRegisterManage.registerCode'),
      minWidth: 150,
    },
    {
      field: 'registerType',
      slots: { default: 'registerType' },
      title: $t('functionRegisterManage.registerType'),
      minWidth: 110,
    },
    {
      field: 'registerFunctionType',
      slots: { default: 'registerFunctionType' },
      title: $t('functionRegisterManage.registerFunctionType'),
      minWidth: 150,
    },
    {
      field: 'registerFlag',
      slots: { default: 'registerFlag' },
      title: $t('functionRegisterManage.registerFlag'),
      minWidth: 120,
    },
    {
      field: 'registerTrigger',
      slots: { default: 'registerTrigger' },
      title: $t('functionRegisterManage.registerTrigger'),
      minWidth: 110,
    },
    {
      field: 'isUse',
      slots: { default: 'isUse' },
      title: $t('functionRegisterManage.isUse'),
      minWidth: 100,
    },
    {
      field: 'registerTime',
      title: $t('functionRegisterManage.registerTime'),
      minWidth: 160,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('page.common.action'),
      width: 300,
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

const gridEvents: VxeGridListeners<any> = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// region 查看 / 编辑 / 新增 具体操作

// 当前选中的表格行
const checkedRow = ref<any>({});
// 是否显示查看详情抽屉
const showViewDrawer = ref(false);
// 是否显示编辑抽屉
const showEditDrawer = ref(false);

// 抽屉中的form表单对象
const editForm = ref();
// form表单规则验证
const editRules = ref<any>({
  registerCode: [
    { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
  ],
  registerType: [
    { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
  ],
  registerFunctionType: [
    { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
  ],
  registerFlag: [
    { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
  ],
  registerTokenCode: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        // 指定权限校验时不允许为空
        if (checkedRow.value.registerFlag === 2 && !value) {
          callback($t('page.common.requiredField'));
        } else {
          callback();
        }
      },
      trigger: 'change',
    },
  ],
  registerTrigger: [
    { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
  ],
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
 * 显示编辑抽屉，无行数据时表示新增
 * @param row 表格行数据
 */
function editRow(row?: any) {
  // 新增时默认启用
  checkedRow.value = row ? { ...row } : { isUse: 1 };
  showEditDrawer.value = true;
}

/**
 * 删除数据
 * @param row 表格行数据
 */
function delRow(row: any) {
  Modal.confirm({
    cancelText: $t('common.cancel'),
    okText: $t('common.confirm'),
    okType: 'danger',
    onCancel() {
      message.warning($t('page.common.cancelDeletePrompt'));
    },
    onOk() {
      deleteRegisterRecord(row.id).then(() => {
        // 显示操作成功的提示信息
        message.success($t('common.successfulOperation'));
        gridApi.query();
      });
    },
    title: $t('page.common.confirmDeleteTitle'),
  });
}

/**
 * 关闭抽屉
 */
function onClose() {
  checkedRow.value = {};
  showViewDrawer.value = false;
  showEditDrawer.value = false;
}

/**
 * 修改启停用状态（表格中直接切换）
 * @param row 表格行数据
 * @param checked 切换后的状态值 1启用 -1停用
 */
function updateIseUse(row: any, checked: number) {
  updateRegisterRecord({ id: row.id, isUse: checked })
    .then(() => {
      // 显示操作成功的提示信息
      message.success($t('common.successfulOperation'));
      // 刷新表格数据
      gridApi.query();
    })
    .catch(() => {
      // 接口失败时回滚状态
      row.isUse = checked === 1 ? -1 : 1;
    });
}

/**
 * 表单提交
 */
function submit() {
  editForm.value.validate().then(() => {
    const ob = checkedRow.value.id
      ? updateRegisterRecord(checkedRow.value)
      : insertRegisterRecord(checkedRow.value);
    ob.then(() => {
      // 刷新表格数据
      gridApi.query();
      message.success($t('common.successfulOperation'));
      onClose();
    });
  });
}

// endregion

// region 登记明细 抽屉

// 登记明细抽屉组件实例
const detailDrawerRef = ref();

/**
 * 打开登记明细抽屉
 * @param row 表格行数据
 */
function showDetail(row: any) {
  detailDrawerRef.value.open(row);
}

// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 注册编号
  registerCode: '',
  // 工步类型编号
  registerFunctionType: '',
  // 登记类型
  registerType: undefined as number | undefined,
});

/**
 * 查询数据
 * 向服务器发送请求，获取功能登记列表数据，并更新前端的数据显示和分页信息。
 * @param page 页码
 * @param pageSize 每页展示条数
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    selectRegisterRecordList({
      ...queryParams.value,
      pageNum: page,
      pageSize,
    }).then(({ total, list }) => {
      resolve({
        total,
        items: list,
      });
    });
  });
}

/**
 * 根据选项值获取对应文本
 * @param options 选项列表
 * @param value 选项值
 */
function optionText(options: any[], value: any) {
  return options.find((item) => item.value === value)?.label ?? '-';
}

/**
 * 根据选项值获取Tag颜色
 * @param options 选项列表
 * @param value 选项值
 */
function optionColor(options: any[], value: any) {
  return options.find((item) => item.value === value)?.color ?? 'default';
}

/**
 * 组装登记工步展示文本（编号-名称）
 * @param row 表格行数据
 */
function registerFunctionTypeText(row: any) {
  return row.functionTypeName
    ? `${row.registerFunctionType}-${row.functionTypeName}`
    : row.registerFunctionType;
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
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 注册编号 -->
        <FormItem
          :label="$t('functionRegisterManage.registerCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.registerCode"
            :placeholder="$t('functionRegisterManage.placeholderInput')"
          />
        </FormItem>

        <!-- 工步类型编号 -->
        <FormItem
          :label="$t('functionRegisterManage.registerFunctionType')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.registerFunctionType"
            :placeholder="$t('functionRegisterManage.placeholderInput')"
          />
        </FormItem>

        <!-- 登记类型 -->
        <FormItem
          :label="$t('functionRegisterManage.registerType')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.registerType"
            :allow-clear="true"
            :options="registerTypeOptions"
            :placeholder="$t('functionRegisterManage.placeholderSelect')"
            style="width: 160px"
          />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="() => gridApi.reload()">
            <Icon icon="mdi:magnify" class="inline-block align-middle text-2xl" />
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
          <Button v-if="author.includes('新增')" type="primary" @click="editRow()">
            {{ $t('common.add') }}
          </Button>
        </template>
        <template #registerType="{ row }">
          <Tag :color="optionColor(registerTypeOptions, row.registerType)">
            {{ optionText(registerTypeOptions, row.registerType) }}
          </Tag>
        </template>
        <template #registerFunctionType="{ row }">
          {{ registerFunctionTypeText(row) }}
        </template>
        <template #registerFlag="{ row }">
          <Tag :color="optionColor(registerFlagOptions, row.registerFlag)">
            {{ optionText(registerFlagOptions, row.registerFlag) }}
          </Tag>
        </template>
        <template #registerTrigger="{ row }">
          <Tag :color="optionColor(registerTriggerOptions, row.registerTrigger)">
            {{ optionText(registerTriggerOptions, row.registerTrigger) }}
          </Tag>
        </template>
        <template #isUse="{ row }">
          <Switch
            v-model:checked="row.isUse"
            :checked-children="$t('common.enable')"
            :checked-value="1"
            :disabled="!author.includes('状态变更')"
            :un-checked-children="$t('common.stopUsing')"
            :un-checked-value="-1"
            @change="(checked: any) => updateIseUse(row, checked)"
          />
        </template>
        <template #action="{ row }">
          <!-- 查看详情 -->
          <Tooltip>
            <template #title>{{ $t('common.view') }}</template>
            <Button
              class="mr-4"
              type="link"
              @click="viewRow(row)"
            >
              <Icon icon="mdi:eye-outline" class="inline-block align-middle text-2xl" />
            </Button>
          </Tooltip>
          <!-- 登记明细按钮 -->
          <Tooltip>
            <template #title>{{ $t('functionRegisterManage.registerDetail') }}</template>
            <Button
              v-if="author.includes('编辑')"
              class="mr-4"
              type="link"
              @click="showDetail(row)"
            >
              <Icon
                icon="mdi:view-list-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 编辑按钮 -->
          <Tooltip>
            <template #title>{{ $t('common.edit') }}</template>
            <Button
              v-if="author.includes('编辑')"
              class="mr-4"
              type="link"
              @click="editRow(row)"
            >
              <Icon
                icon="mdi:edit-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>

          <!-- 删除数据 -->
          <Tooltip>
            <template #title>{{ $t('common.delete') }}</template>
            <Button
              v-if="author.includes('删除')"
              danger
              type="link"
              @click="delRow(row)"
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

    <!-- region 查看详情抽屉 -->
    <Drawer
      v-model:open="showViewDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="600"
      class="custom-class"
      placement="right"
      :title="$t('functionRegisterManage.viewInfo')"
    >
      <Descriptions
        :column="1"
        bordered
        :title="$t('functionRegisterManage.viewInfo')"
      >
        <DescriptionsItem :label="$t('functionRegisterManage.registerCode')">
          {{ checkedRow.registerCode }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('functionRegisterManage.registerType')">
          <Tag :color="optionColor(registerTypeOptions, checkedRow.registerType)">
            {{ optionText(registerTypeOptions, checkedRow.registerType) }}
          </Tag>
        </DescriptionsItem>
        <DescriptionsItem :label="$t('functionRegisterManage.registerFunctionType')">
          {{ registerFunctionTypeText(checkedRow) }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('functionRegisterManage.registerFlag')">
          <Tag :color="optionColor(registerFlagOptions, checkedRow.registerFlag)">
            {{ optionText(registerFlagOptions, checkedRow.registerFlag) }}
          </Tag>
        </DescriptionsItem>
        <DescriptionsItem :label="$t('functionRegisterManage.registerTokenCode')">
          {{ checkedRow.registerTokenCode }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('functionRegisterManage.registerTrigger')">
          <Tag :color="optionColor(registerTriggerOptions, checkedRow.registerTrigger)">
            {{ optionText(registerTriggerOptions, checkedRow.registerTrigger) }}
          </Tag>
        </DescriptionsItem>
        <DescriptionsItem :label="$t('functionRegisterManage.registerUser')">
          {{ checkedRow.registerUser }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('functionRegisterManage.isUse')">
          <Tag :color="checkedRow.isUse === 1 ? 'green' : 'red'">
            {{ checkedRow.isUse === 1 ? $t('common.enable') : $t('common.stopUsing') }}
          </Tag>
        </DescriptionsItem>
        <DescriptionsItem :label="$t('functionRegisterManage.registerTime')">
          {{ checkedRow.registerTime }}
        </DescriptionsItem>
      </Descriptions>
    </Drawer>
    <!-- endregion -->

    <!-- region 新增/编辑 抽屉 -->
    <Drawer
      v-model:open="showEditDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="500"
      class="custom-class"
      placement="right"
      :title="checkedRow.id ? $t('functionRegisterManage.editInfo') : $t('functionRegisterManage.addInfo')"
    >
      <Form
        ref="editForm"
        :label-col="{ span: 6 }"
        :model="checkedRow"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        name="editMessageForm"
      >
        <!-- 登记编号 -->
        <FormItem
          :label="$t('functionRegisterManage.registerCode')"
          name="registerCode"
        >
          <Input
            v-model:value="checkedRow.registerCode"
            :placeholder="$t('functionRegisterManage.placeholderInput')"
          />
        </FormItem>
        <!-- 登记类型 -->
        <FormItem
          :label="$t('functionRegisterManage.registerType')"
          name="registerType"
        >
          <Select
            v-model:value="checkedRow.registerType"
            :options="registerTypeOptions"
            :placeholder="$t('functionRegisterManage.placeholderSelect')"
          />
        </FormItem>
        <!-- 登记工步 -->
        <FormItem
          :label="$t('functionRegisterManage.registerFunctionType')"
          name="registerFunctionType"
        >
          <Input
            v-model:value="checkedRow.registerFunctionType"
            :placeholder="$t('functionRegisterManage.placeholderInput')"
          />
        </FormItem>
        <!-- 权限标记 -->
        <FormItem
          :label="$t('functionRegisterManage.registerFlag')"
          name="registerFlag"
        >
          <Select
            v-model:value="checkedRow.registerFlag"
            :options="registerFlagOptions"
            :placeholder="$t('functionRegisterManage.placeholderSelect')"
          />
        </FormItem>
        <!-- 指定权限编码 -->
        <FormItem
          :label="$t('functionRegisterManage.registerTokenCode')"
          name="registerTokenCode"
        >
          <Input
            v-model:value="checkedRow.registerTokenCode"
            :disabled="checkedRow.registerFlag !== 2"
            :placeholder="$t('functionRegisterManage.placeholderInput')"
          />
        </FormItem>
        <!-- 触发方式 -->
        <FormItem
          :label="$t('functionRegisterManage.registerTrigger')"
          name="registerTrigger"
        >
          <Select
            v-model:value="checkedRow.registerTrigger"
            :options="registerTriggerOptions"
            :placeholder="$t('functionRegisterManage.placeholderSelect')"
          />
        </FormItem>
        <!-- 启停用 -->
        <FormItem :label="$t('functionRegisterManage.isUse')" name="isUse">
          <Switch
            v-model:checked="checkedRow.isUse"
            :checked-children="$t('common.enable')"
            :checked-value="1"
            :un-checked-children="$t('common.stopUsing')"
            :un-checked-value="-1"
          />
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

    <!-- 登记明细抽屉（独立组件，按登记类型动态展示字段） -->
    <RegisterDetailDrawer ref="detailDrawerRef" :author="author" />
  </Page>
</template>

<style scoped></style>
