<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
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
  Select,
  Space,
  Switch,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteAttrType,
  insertAttrType,
  selectAttrTypeList,
  updateAttrType,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// 属性标记选项 1业务填报 2数采关联 3外部引用 4逻辑计算
const attributeFlagOptions = [
  { label: $t('stepAttrCategoryMaintain.businessFill'), value: 1 },
  { label: $t('stepAttrCategoryMaintain.dataCollection'), value: 2 },
  { label: $t('stepAttrCategoryMaintain.externalReference'), value: 3 },
  { label: $t('stepAttrCategoryMaintain.logicCalculation'), value: 4 },
];

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    {
      field: 'functionAttributeType',
      title: $t('stepAttrCategoryMaintain.functionAttributeType'),
      minWidth: 150,
    },
    {
      field: 'functionAttributeTypeName',
      title: $t('stepAttrCategoryMaintain.functionAttributeTypeName'),
      minWidth: 150,
    },
    {
      field: 'attributeFlag',
      slots: { default: 'attributeFlag' },
      title: $t('stepAttrCategoryMaintain.attributeFlag'),
      minWidth: 120,
    },
    {
      field: 'iseUse',
      slots: { default: 'iseUse' },
      title: $t('stepAttrCategoryMaintain.iseUse'),
      minWidth: 100,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('page.common.action'),
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
  functionAttributeType: [
    { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
  ],
  functionAttributeTypeName: [
    { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
  ],
  attributeFlag: [
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
  checkedRow.value = row ? { ...row } : { iseUse: 1 };
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
      deleteAttrType(row.id).then(() => {
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
  updateAttrType({ id: row.id, iseUse: checked })
    .then(() => {
      // 显示操作成功的提示信息
      message.success($t('common.successfulOperation'));
      // 刷新表格数据
      gridApi.query();
    })
    .catch(() => {
      // 接口失败时回滚状态
      row.iseUse = checked === 1 ? -1 : 1;
    });
}

/**
 * 表单提交
 */
function submit() {
  editForm.value.validate().then(() => {
    const ob = checkedRow.value.id
      ? updateAttrType(checkedRow.value)
      : insertAttrType(checkedRow.value);
    ob.then(() => {
      // 刷新表格数据
      gridApi.query();
      message.success($t('common.successfulOperation'));
      onClose();
    });
  });
}

// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 属性类别编号
  functionAttributeType: '',
  // 属性类别名称
  functionAttributeTypeName: '',
  // 属性标记
  attributeFlag: undefined as number | undefined,
});

/**
 * 查询数据
 * 向服务器发送请求，获取属性类别列表数据，并更新前端的数据显示和分页信息。
 * @param page 页码
 * @param pageSize 每页展示条数
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    selectAttrTypeList({
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
 * 根据属性标记值获取对应文本
 * @param flag 属性标记 1业务填报 2数采关联 3外部引用 4逻辑计算
 */
function attributeFlagText(flag: number) {
  return (
    attributeFlagOptions.find((item) => item.value === flag)?.label ?? '-'
  );
}

/**
 * 根据属性标记值获取Tag颜色
 * @param flag 属性标记 1业务填报 2数采关联 3外部引用 4逻辑计算
 */
function attributeFlagColor(flag: number) {
  switch (flag) {
    case 1: {
      return 'green';
    }
    case 2: {
      return 'blue';
    }
    case 3: {
      return 'orange';
    }
    case 4: {
      return 'purple';
    }
    default: {
      return 'default';
    }
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
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 属性类别编号 -->
        <FormItem
          :label="$t('stepAttrCategoryMaintain.functionAttributeType')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.functionAttributeType"
            :placeholder="$t('stepAttrCategoryMaintain.placeholderInput')"
          />
        </FormItem>

        <!-- 属性类别名称 -->
        <FormItem
          :label="$t('stepAttrCategoryMaintain.functionAttributeTypeName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.functionAttributeTypeName"
            :placeholder="$t('stepAttrCategoryMaintain.placeholderInput')"
          />
        </FormItem>

        <!-- 属性标记 -->
        <FormItem
          :label="$t('stepAttrCategoryMaintain.attributeFlag')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.attributeFlag"
            :allow-clear="true"
            :options="attributeFlagOptions"
            :placeholder="$t('stepAttrCategoryMaintain.placeholderSelect')"
            style="width: 160px"
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
        <template #toolbar-tools>
          <!-- 新增按钮 -->
          <Button v-if="author.includes('新增')" type="primary" @click="editRow()">
            {{ $t('common.add') }}
          </Button>
        </template>
        <template #attributeFlag="{ row }">
          <Tag :color="attributeFlagColor(row.attributeFlag)">
            {{ attributeFlagText(row.attributeFlag) }}
          </Tag>
        </template>
        <template #iseUse="{ row }">
          <Switch
            v-model:checked="row.iseUse"
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
              v-if="author.includes('编辑')"
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
              v-if="author.includes('删除')"
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
      :title="$t('stepAttrCategoryMaintain.viewInfo')"
    >
      <Descriptions
        :column="1"
        bordered
        :title="$t('stepAttrCategoryMaintain.viewInfo')"
      >
        <DescriptionsItem :label="$t('stepAttrCategoryMaintain.functionAttributeType')">
          {{ checkedRow.functionAttributeType }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('stepAttrCategoryMaintain.functionAttributeTypeName')">
          {{ checkedRow.functionAttributeTypeName }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('stepAttrCategoryMaintain.attributeFlag')">
          <Tag :color="attributeFlagColor(checkedRow.attributeFlag)">
            {{ attributeFlagText(checkedRow.attributeFlag) }}
          </Tag>
        </DescriptionsItem>
        <DescriptionsItem :label="$t('stepAttrCategoryMaintain.iseUse')">
          <Tag :color="checkedRow.iseUse === 1 ? 'green' : 'red'">
            {{ checkedRow.iseUse === 1 ? $t('common.enable') : $t('common.stopUsing') }}
          </Tag>
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
      :title="checkedRow.id ? $t('stepAttrCategoryMaintain.editInfo') : $t('stepAttrCategoryMaintain.addInfo')"
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
        <!-- 属性类别编号 -->
        <FormItem
          :label="$t('stepAttrCategoryMaintain.functionAttributeType')"
          name="functionAttributeType"
        >
          <Input
            v-model:value="checkedRow.functionAttributeType"
            :placeholder="$t('stepAttrCategoryMaintain.placeholderInput')"
          />
        </FormItem>
        <!-- 属性类别名称 -->
        <FormItem
          :label="$t('stepAttrCategoryMaintain.functionAttributeTypeName')"
          name="functionAttributeTypeName"
        >
          <Input
            v-model:value="checkedRow.functionAttributeTypeName"
            :placeholder="$t('stepAttrCategoryMaintain.placeholderInput')"
          />
        </FormItem>
        <!-- 属性标记 -->
        <FormItem
          :label="$t('stepAttrCategoryMaintain.attributeFlag')"
          name="attributeFlag"
        >
          <Select
            v-model:value="checkedRow.attributeFlag"
            :options="attributeFlagOptions"
            :placeholder="$t('stepAttrCategoryMaintain.placeholderSelect')"
          />
        </FormItem>
        <!-- 启停用 -->
        <FormItem :label="$t('stepAttrCategoryMaintain.iseUse')" name="iseUse">
          <Switch
            v-model:checked="checkedRow.iseUse"
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
  </Page>
</template>

<style scoped></style>
