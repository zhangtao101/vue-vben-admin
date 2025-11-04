<script lang="ts" setup>
import type { TreeProps } from 'ant-design-vue';

import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch, MdiTrayUpload } from '@vben/icons';
import { useAccessStore } from '@vben/stores';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Row,
  Space,
  TabPane,
  Tabs,
  Tooltip,
  Tree,
  UploadDragger,
} from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { difference } from 'lodash-es';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  materialUpDownSafe,
  queryMaterialInfoById,
  queryMaterialInfoDetail,
  queryMaterialInfoList,
  queryMaterialInfoProductReferences,
  updateNameToLabelAndIQC,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'isQualityTest',
      title: '质检',
      minWidth: 80,
      slots: { default: 'selectedState' },
    },
    {
      field: 'isContract',
      title: '合同',
      minWidth: 80,
      slots: { default: 'selectedState' },
    },
    {
      field: 'isHalf',
      title: '半成品',
      minWidth: 80,
      slots: { default: 'selectedState' },
    },
    {
      field: 'isZeroStock',
      title: '零库存',
      minWidth: 80,
      slots: { default: 'selectedState' },
    },
    { field: 'materialTypeCode', title: '材料类别', minWidth: 80 },
    { field: 'materialCode', title: '材料编号', minWidth: 150 },
    { field: 'materialDrawingCode', title: '材料图号', minWidth: 150 },
    { field: 'materialName', title: '材料名称', minWidth: 200 },
    { field: 'unit', title: '单位', minWidth: 100 },
    { field: 'minPackNumber', title: '最小包装数', minWidth: 90 },
    { field: 'safeLevel', title: '安全量', minWidth: 80 },
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

// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 材料编号
  materialCode: '',
  // 材料名称
  materialName: '',
});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    /**
     * 调用 queryMaterialInfoList 函数，传入查询参数和分页信息。
     * 查询参数包括 queryParams.value 中的所有属性，以及当前页码和每页大小。
     */
    queryMaterialInfoList({
      ...queryParams.value, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ total, results }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
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
const treeData = ref<TreeProps['treeData']>([{ key: '0', title: '全部' }]);

// 远程加载节点数据
function onLoadData(treeNode: any) {
  return new Promise<void>((resolve) => {
    if (treeNode.dataRef?.children) {
      resolve();
      return;
    }
    setTimeout(() => {
      treeNode.dataRef!.children = [
        { key: `${treeNode.eventKey}-0`, title: 'Child Node' },
        { key: `${treeNode.eventKey}-1`, title: 'Child Node' },
      ];
      treeData.value = [...treeData.value!];
      resolve();
    }, 1000);
  });
}

function handleExpand(keys: any[], { expanded, node }: any) {
  // node.parent add from 3.0.0-alpha.10
  const tempKeys = ((node.parent ? node.parent.children : treeData) || []).map(
    ({ key }: any) => key,
  );
  expandedKeys.value = expanded
    ? [...difference(keys, tempKeys), node.key]
    : keys;
}

// endregion

// region 新增 / 编辑

// 抽屉是否显示
const showEditDrawer = ref(false);
// 编辑对象数据
const editMessage = ref({} as any);
// 编辑对象表单验证规则
const editRules = ref({
  downSafe: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  materialCode: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  materialName: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  upSafe: [{ message: '此项为必填项', required: true, trigger: 'change' }],
} as any);

/**
 * 显示编辑抽屉
 * @param row
 */
function showEdit(row: any) {
  showEditDrawer.value = true;
  queryMaterialInfoById({
    id: row.id,
  }).then((res) => {
    editMessage.value = {
      ...res,
    };
  });
}

// 关闭模态框
function onClose() {
  showEditDrawer.value = false;
}
// 表单对象
const editFormRef = ref();

/**
 * 提交表单
 */
function submitForm() {
  editFormRef.value?.validate().then(() => {
    materialUpDownSafe(editMessage.value).then(() => {
      message.success('修改成功');
      onClose();
      gridApi.reload();
    });
  });
}

// endregion

// region 更新物料标签描述

function updateDes(row: any) {
  updateNameToLabelAndIQC(row.materialCode).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

// endregion

// region 维护pas

// 抽屉是否显示
const showPasDrawer = ref(false);
// 编辑对象数据
const editPasMessage = ref({} as any);
// 编辑对象表单验证规则
const editPasRules = ref({
  downSafe: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  materialCode: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  materialName: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  upSafe: [{ message: '此项为必填项', required: true, trigger: 'change' }],
} as any);

/**
 * 显示编辑抽屉
 * @param row
 */
function showPas(row: any) {
  showPasDrawer.value = true;
  editPasMessage.value = row;
}

// 关闭模态框
function PasClose() {
  showEditDrawer.value = false;
}

// endregion

// 文件上传列表
const accessStore = useAccessStore();
// 文件上传列表
const uploadFile = ref<any>([]);

function getUploadUrl() {
  return `/ht/${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/handle/upload`;
}

// endregion

// region 查看

// 抽屉是否显示
const showEyeDrawer = ref(false);
// 当前活跃的标签页
const activeKey = ref('1');

const eeyeGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'productCode',
      title: '产品编号',
      minWidth: 120,
    },
    {
      field: 'productName',
      title: '产品名称',
      minWidth: 120,
    },
    {
      field: 'useNumber',
      title: '使用材料数',
      minWidth: 120,
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  // 分页配置，禁用分页
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryEyeData();
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

const [EyeGrid] = useVbenVxeGrid({ gridOptions: eeyeGridOptions });

const eyeQueryParams = ref({
  materialCode: '',
});
function queryEyeData() {
  return new Promise((resolve, reject) => {
    /**
     * 调用 queryMaterialInfoList 函数，传入查询参数和分页信息。
     * 查询参数包括 queryParams.value 中的所有属性，以及当前页码和每页大小。
     */
    queryMaterialInfoProductReferences(eyeQueryParams.value.materialCode)
      .then((data: any) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total: data.length,
          items: data,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

const remark = ref('');
/**
 * 查询物料描述
 */
function queryDes() {
  queryMaterialInfoDetail(eyeQueryParams.value.materialCode).then(
    (data: any) => {
      remark.value = data || '';
    },
  );
}

/**
 * 显示抽屉
 * @param row
 */
function showEye(row: any) {
  showEyeDrawer.value = true;
  eyeQueryParams.value.materialCode = row.materialCode;
  queryDes();
}

/**
 * 关闭抽屉
 */
function eyeClose() {
  showEditDrawer.value = false;
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);
// endregion

// region 初始化
// 路由信息
const route = useRoute();
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
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 材料编号 -->
        <FormItem
          :label="$t('basic.bomManagement.materialCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialCode" />
        </FormItem>
        <!-- 材料名称 -->
        <FormItem
          :label="$t('basic.bomManagement.materialName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialName" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="gridApi.reload()"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 主要内容显示区域 -->

    <Row :gutter="16">
      <!-- region 树形菜单 -->
      <Col :lg="6" :md="8" :sm="4" :xl="4" :xs="10">
        <Card class="min-h-96">
          <Tree
            v-model:expanded-keys="expandedKeys"
            v-model:selected-keys="selectedKeys"
            :load-data="onLoadData"
            :tree-data="treeData"
            @expand="handleExpand"
          />
        </Card>
      </Col>
      <!-- endregion -->
      <!-- region 表格主体 -->
      <Col :lg="18" :md="16" :sm="20" :xl="20" :xs="14">
        <Card>
          <Grid>
            <template #action="{ row }">
              <!-- 编辑按钮 -->
              <Tooltip>
                <template #title>{{ $t('common.edit') }}</template>
                <Button
                  :icon="
                    h(Icon, {
                      icon: 'mdi:edit-outline',
                      class: 'inline-block size-6',
                    })
                  "
                  class="mx-1"
                  type="link"
                  @click="showEdit(row)"
                />
              </Tooltip>

              <!-- 维护PAS按钮 -->
              <Tooltip>
                <template #title>
                  {{ $t('common.maintenancePAS') }}
                </template>
                <Button
                  :icon="
                    h(Icon, {
                      icon: 'mdi-light:settings',
                      class: 'inline-block size-6',
                    })
                  "
                  class="mx-1"
                  type="link"
                  @click="showPas(record)"
                />
              </Tooltip>
              <!-- 更新物料标签描述按钮 -->
              <Tooltip>
                <template #title>
                  {{ $t('common.updatedMaterialLabelDescription') }}
                </template>
                <Button
                  :icon="
                    h(Icon, {
                      icon: 'mdi:update',
                      class: 'inline-block size-6',
                    })
                  "
                  class="mx-1"
                  type="link"
                  @click="updateDes(row)"
                />
              </Tooltip>

              <!-- 查看 -->
              <Tooltip>
                <template #title>{{ $t('common.view') }}</template>
                <Button
                  type="link"
                  :icon="
                    h(Icon, {
                      icon: 'mdi:eye',
                      class: 'inline-block text-2xl',
                    })
                  "
                  class="mx-1"
                  @click="showEye(row)"
                />
              </Tooltip>

              <!-- 删除按钮 -->
              <Tooltip>
                <template #title>{{ $t('common.delete') }}</template>
                <Button
                  :icon="
                    h(Icon, {
                      icon: 'mdi-light:delete',
                      class: 'inline-block size-6',
                    })
                  "
                  class="mx-1"
                  danger
                  type="link"
                />
              </Tooltip>
            </template>
            <template #selectedState="{ row, column }">
              <Checkbox v-model:checked="row[column.field]" disabled />
            </template>
          </Grid>
        </Card>
      </Col>
      <!-- endregion -->
    </Row>

    <!-- endregion -->

    <!-- region 编辑 -->
    <Drawer
      v-model:open="showEditDrawer"
      :footer-style="{ textAlign: 'right' }"
      :title="$t('common.edit')"
      :width="600"
      class="custom-class"
      placement="right"
      root-class-name="root-class-name"
      style="color: red"
    >
      <Form
        :label-col="{ span: 8 }"
        :model="editMessage"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        ref="editFormRef"
      >
        <!-- 材料编号 -->
        <FormItem
          :label="$t('basic.bomManagement.materialCode')"
          name="materialCode"
        >
          <Input v-model:value="editMessage.materialCode" disabled />
        </FormItem>
        <!-- 材料名称 -->
        <FormItem
          :label="$t('basic.bomManagement.materialName')"
          name="materialName"
        >
          <Input v-model:value="editMessage.materialName" disabled />
        </FormItem>
        <!-- 安全量上限 -->
        <FormItem
          :label="$t('basic.bomManagement.materialsInform.upSafe')"
          name="upSafe"
        >
          <InputNumber v-model:value="editMessage.upSafe" :min="0" />
        </FormItem>
        <!-- 安全量下限 -->
        <FormItem
          :label="$t('basic.bomManagement.materialsInform.downSafe')"
          name="downSafe"
        >
          <InputNumber v-model:value="editMessage.downSafe" :max="0" />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="onClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="submitForm">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->

    <!-- region PAS维护 -->
    <Drawer
      v-model:open="showPasDrawer"
      :footer-style="{ textAlign: 'right' }"
      :title="$t('common.maintenancePAS')"
      :width="600"
      class="custom-class"
      placement="right"
      root-class-name="root-class-name"
    >
      <Form
        :label-col="{ span: 8 }"
        :model="editPasMessage"
        :rules="editPasRules"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        name="editMessageForm"
      >
        <!-- 材料编号 -->
        <FormItem
          :label="$t('basic.bomManagement.materialCode')"
          name="materialCode"
        >
          <Input v-model:value="editMessage.materialCode" disabled />
        </FormItem>
        <!-- 材料名称 -->
        <FormItem
          :label="$t('basic.bomManagement.materialName')"
          name="materialName"
        >
          <Input v-model:value="editMessage.materialName" disabled />
        </FormItem>
        <!-- 文件描述 -->
        <FormItem
          :label="$t('basic.bomManagement.materialsInform.pasDescribe')"
          name="pas_describe"
        >
          <Input v-model:value="editMessage.pas_describe" />
        </FormItem>
        <!-- 文件 -->
        <FormItem
          :label="$t('basic.bomManagement.materialsInform.files')"
          name="files"
        >
          <UploadDragger
            v-model:file-list="uploadFile"
            :action="getUploadUrl()"
            :headers="{ Authorization: `${accessStore.accessToken}` }"
            name="photo"
          >
            <div class="flex justify-center">
              <MdiTrayUpload class="size-16" />
            </div>
            <p class="ant-upload-text">
              {{ $t('ui.widgets.file.tips') }}
            </p>
            <p class="ant-upload-hint">
              {{ $t('ui.widgets.file.tips1') }}
            </p>
          </UploadDragger>
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="PasClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="PasClose">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->

    <!-- region 查看详情 -->
    <Drawer
      v-model:open="showEyeDrawer"
      :footer-style="{ textAlign: 'right' }"
      :height="600"
      :title="$t('common.view')"
      class="custom-class"
      placement="top"
      root-class-name="root-class-name"
    >
      <Tabs v-model:active-key="activeKey">
        <TabPane
          key="1"
          :tab="$t('basic.bomManagement.materialsInform.productReference')"
        >
          <EyeGrid v-if="activeKey === '1'" />
        </TabPane>
        <TabPane
          key="3"
          :tab="$t('basic.bomManagement.materialsInform.productDescription')"
        >
          {{ remark }}
        </TabPane>
      </Tabs>
      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="eyeClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="eyeClose">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
