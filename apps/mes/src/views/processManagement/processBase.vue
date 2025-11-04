<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Checkbox,
  Col,
  DirectoryTree,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  RadioGroup,
  Row,
  Select,
  Space,
  Textarea,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createProcess,
  deleteProcess,
  exportProcess,
  getProcessTree,
  queryProcessDetail,
  queryProcessTable,
  updateProcess,
} from '#/api';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格操作

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'processCode', title: '过程编码', minWidth: 150 },
    { field: 'processName', title: '过程名称', minWidth: 200 },
    {
      field: 'isSpecial',
      title: '特殊过程',
      minWidth: 90,
      slots: { default: 'selectedState' },
    },
    {
      field: 'isKey',
      title: '关键过程',
      minWidth: 90,
      slots: { default: 'selectedState' },
    },
    {
      field: 'isPlan',
      title: '计划节点',
      minWidth: 90,
      slots: { default: 'selectedState' },
    },
    { field: 'experienceTime', title: '经验时间', minWidth: 90 },
    {
      field: 'isGeneral',
      title: '过程类型',
      minWidth: 90,
      slots: { default: 'selectedState' },
    },
    { field: 'parentProcessName', title: '父过程名称', minWidth: 90 },
    {
      field: 'isReport',
      title: '报工节点',
      minWidth: 90,
      slots: { default: 'selectedState' },
    },
    { field: 'createTime', title: '创建时间', minWidth: 150 },
    { field: 'updateTime', title: '操作时间', minWidth: 150 },
    { field: 'updateUsername', title: '操作人', minWidth: 90 },
    { field: 'remark', title: '备注', minWidth: 120 },
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

// endregion

// region 数据查询

// 查询参数
const queryParams = ref<any>({
  parentId: 0,
});

/**
 * 查询数据
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = {
      ...queryParams.value,
    };
    // 调用 listStations API函数，传递查询参数和分页信息
    queryProcessTable({
      ...params, // 展开queryParams.value中的所有查询参数
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ total, results }) => {
        // 成功获取数据后，更新数据列表和总条数
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

// region 树形菜单操作

// 当前展开的节点
const expandedKeys = ref<string[]>([]);
// 当前选中的节点
const selectedKeys = ref<string[]>([]);
// 节点数据
const treeData = ref<any[]>([
  {
    children: [],
    processName: '根节点',
    id: 0,
  },
]);

/**
 * 查询类别树
 */
function queryAllCategoryTree() {
  // 调用 getBomTypeTree API函数，获取菜单列表
  getProcessTree().then((data) => {
    // 检查返回的数据是否存在且长度大于0
    if (data) {
      // 如果数据有效，更新treeData
      treeData.value[0].children = [...data];
    }
  });
}

/**
 * 处理树形控件选中事件
 * @param {any} _selectedKeys - 当前选中的节点键值
 * @param {object} info - 包含节点和选中状态的对象
 * @param {object} info.node - 当前操作的节点对象
 */
function selectedTree(_selectedKeys: any, { node }: any) {
  queryParams.value.parentId = node.id;
  gridApi.reload();
}

/**
 * 处理父过程编码改变事件
 * @param _key
 * @param item
 */
function parentProcessCodeChange(_key: any, item: any) {
  editItem.value.parentProcessName = item.processName;
  editItem.value.parentId = item.id;
}

// endregion

// region 新增/ 编辑
// 抽屉可见性
const drawerVisible = ref<boolean>(false);
// 编辑对象
const editItem = ref<any>({});
// 表单对象
const formRef = ref();
// 工序过称类型列表
const processTypeOptions = [
  {
    value: true,
    label: '一般过程',
  },
  {
    value: false,
    label: '检验过程',
  },
];
// 操作类型
const overweightType = [
  {
    label: '是',
    value: true,
  },
  {
    label: '否',
    value: false,
  },
];

/**
 * 显示抽屉
 * @param row - 点击编辑按钮的行数据
 */
function showDrawer(row: any) {
  drawerVisible.value = true;
  if (row.id) {
    queryProcessDetail(row.id).then((data) => {
      editItem.value = data;
    });
  } else {
    editItem.value = {};
  }
}

/**
 * 关闭抽屉
 */
function closeDrawer() {
  drawerVisible.value = false;
  editItem.value = {};
}

function submit() {
  formRef.value.validate().then(() => {
    const params = {
      ...editItem.value,
    };
    const ob = params.id ? updateProcess(params) : createProcess(params);
    ob.then(() => {
      message.success($t('common.successfulOperation'));
      gridApi.reload();
    });
  });
}

// endregion

// region 删除

function deleteRow(row: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消删除!');
    },
    onOk() {
      deleteProcess(row.id)
        .then(() => {
          // 显示操作成功的提示信息
          message.success($t('common.successfulOperation'));
          gridApi.query();
          queryAllCategoryTree();
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

// region 文件下载

function downloadTemplate() {
  exportProcess(queryParams.value.parentId || 0).then((data) => {
    window.open(data);
  });
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 初始化

// 当组件挂载到DOM上后，立即执行的函数
onMounted(() => {
  // 调用queryAuth函数，用于获取用户权限信息
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  // 调用 queryAllCategoryTree 函数，用于获取类别数据
  queryAllCategoryTree();
});
// endregion
</script>

<template>
  <Page>
    <!-- region 主要内容显示区域 -->
    <Row :gutter="16">
      <!-- region 树形菜单 -->
      <Col :lg="6" :md="8" :sm="8" :xl="5" :xs="4">
        <Card class="h-[70vh] overflow-y-auto">
          <DirectoryTree
            v-model:expanded-keys="expandedKeys"
            v-model:selected-keys="selectedKeys"
            :auto-expand-parent="true"
            :field-names="{
              children: 'children',
              title: 'processName',
              key: 'id',
            }"
            :tree-data="treeData"
            @select="selectedTree"
          />
        </Card>
      </Col>
      <!-- endregion -->

      <!-- region 表格主体 -->
      <Col :lg="16" :md="16" :sm="16" :xl="19" :xs="20">
        <Card class="h-[70vh] overflow-y-auto">
          <Grid>
            <template #toolbar-tools>
              <!-- 添加按钮 -->
              <Button type="primary" class="mr-4" @click="showDrawer({})">
                {{ $t('common.add') }}
              </Button>
              <!-- 导出按钮 -->
              <Button type="primary" @click="downloadTemplate()">
                {{ $t('common.export') }}
              </Button>
            </template>
            <template #selectedState="{ row, column }">
              <Checkbox v-model:checked="row[column.field]" disabled />
            </template>
            <template #action="{ row }">
              <!-- 编辑按钮 -->
              <Tooltip>
                <template #title>{{ $t('common.edit') }}</template>
                <Button type="link" @click="showDrawer(row)">
                  <Icon
                    icon="mdi:edit-outline"
                    class="inline-block align-middle text-2xl"
                  />
                </Button>
              </Tooltip>
              <!-- 删除数据 -->
              <Tooltip>
                <template #title>{{ $t('common.delete') }}</template>
                <Button danger type="link" @click="deleteRow(row)">
                  <Icon
                    icon="mdi-light:delete"
                    class="inline-block align-middle text-2xl"
                  />
                </Button>
              </Tooltip>
            </template>
          </Grid>
        </Card>
      </Col>
      <!-- endregion -->
    </Row>
    <!-- endregion -->
    <Drawer
      v-model:open="drawerVisible"
      :footer-style="{ textAlign: 'right' }"
      width="700"
      placement="right"
      :title="$t('common.edit')"
      @close="closeDrawer"
    >
      <Form
        ref="formRef"
        layout="inline"
        :model="editItem"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
        <Row class="my-2 w-full">
          <!-- 过称名称 -->
          <Col :span="12">
            <FormItem
              :label="$t('processManagement.processBase.processName')"
              :rules="[{ required: true, message: '该项为必填项' }]"
              name="processName"
            >
              <Input v-model:value="editItem.processName" class="w-full" />
            </FormItem>
          </Col>
          <!-- 过称编码 -->
          <Col :span="12">
            <FormItem
              :label="$t('processManagement.processBase.processCode')"
              :rules="[{ required: true, message: '该项为必填项' }]"
              name="processCode"
            >
              <Input v-model:value="editItem.processCode" class="w-full" />
            </FormItem>
          </Col>
        </Row>
        <Row class="my-2 w-full">
          <!-- 父过程 -->
          <Col :span="12">
            <FormItem
              :label="$t('processManagement.processBase.parentProcess')"
              :rules="[{ required: false, message: '该项为必填项' }]"
              name="parentProcessCode"
            >
              <Select
                v-model:value="editItem.parentProcessCode"
                class="w-full"
                :options="treeData[0].children"
                :field-names="{
                  label: 'processName',
                  value: 'processCode',
                }"
                @change="parentProcessCodeChange"
                :disabled="!!editItem.id"
              />
            </FormItem>
          </Col>
          <!-- 过称类型 -->
          <Col :span="12">
            <FormItem
              :label="$t('processManagement.processBase.processType')"
              :rules="[{ required: true, message: '该项为必填项' }]"
              name="isGeneral"
            >
              <RadioGroup
                v-model:value="editItem.isGeneral"
                class="w-full"
                :options="processTypeOptions"
              />
            </FormItem>
          </Col>
        </Row>
        <Row class="my-2 w-full">
          <!-- 报工节点 -->
          <Col :span="12">
            <FormItem
              :label="$t('processManagement.processBase.reportingNode')"
              :rules="[{ required: true, message: '该项为必填项' }]"
              name="isReport"
            >
              <RadioGroup
                v-model:value="editItem.isReport"
                class="w-full"
                :options="overweightType"
              />
            </FormItem>
          </Col>
          <!-- 经验时间 -->
          <Col :span="12">
            <FormItem
              :label="$t('processManagement.processBase.experienceTime')"
            >
              <InputNumber
                v-model:value="editItem.experienceTime"
                addon-after="秒(S)"
              />
            </FormItem>
          </Col>
        </Row>
        <Row class="my-2 w-full">
          <!-- 关键过称 -->
          <Col :span="12">
            <FormItem
              :label="$t('processManagement.processBase.criticalProcess')"
              :rules="[{ required: true, message: '该项为必填项' }]"
              name="isKey"
            >
              <RadioGroup
                v-model:value="editItem.isKey"
                class="w-full"
                :options="overweightType"
              />
            </FormItem>
          </Col>
          <!-- 特殊过称 -->
          <Col :span="12">
            <FormItem
              :label="$t('processManagement.processBase.specialProcess')"
              :rules="[{ required: true, message: '该项为必填项' }]"
              name="isSpecial"
            >
              <RadioGroup
                v-model:value="editItem.isSpecial"
                class="w-full"
                :options="overweightType"
              />
            </FormItem>
          </Col>
        </Row>
        <Row class="my-2 w-full">
          <!-- 计划节点 -->
          <Col :span="12">
            <FormItem
              :label="$t('processManagement.processBase.planNode')"
              :rules="[{ required: true, message: '该项为必填项' }]"
              name="isPlan"
            >
              <RadioGroup
                v-model:value="editItem.isPlan"
                class="w-full"
                :options="overweightType"
              />
            </FormItem>
          </Col>
          <!-- 备注 -->
          <Col :span="12">
            <FormItem :label="$t('processManagement.processBase.remark')">
              <Textarea v-model:value="editItem.remark" />
            </FormItem>
          </Col>
        </Row>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="closeDrawer">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 提交  -->
          <Button type="primary" @click="submit()">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
