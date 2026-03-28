<script lang="ts" setup>
import type { TreeProps } from 'ant-design-vue';

import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
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
  Upload,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  downloadMaterialsTemplate,
  materialUpDownSafe,
  queryMaterialInfoById,
  queryMaterialInfoDetail,
  queryMaterialInfoList,
  queryMaterialInfoProductReferences,
  queryMaterialTree,
  queryPasFile,
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
  // 材料类别
  materialTypeCode: '',
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
      .then((response: any) => {
        // 处理返回数据
        const data = response.data || response;
        resolve({
          total: data.total || 0,
          items: data.results || [],
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// endregion

// region 树形菜单操作
// 当前选中的节点
const selectedKeys = ref<string[]>([]);
// 节点数据
const treeData = ref<TreeProps['treeData']>([
  { key: '', typeCode: '', typeName: '全部', childs: [] },
]);

// 树字段配置
const treeFieldNames = {
  children: 'childs',
  key: 'typeCode',
  title: 'typeName',
};

/**
 * 加载树数据
 */
function loadTreeData() {
  queryMaterialTree().then((response) => {
    const data = (response as any).data || response;
    if (Array.isArray(data) && data.length > 0 && treeData.value?.[0]) {
      treeData.value[0].childs = data;
    }
  });
}

/**
 * 树节点选择事件
 */
function handleSelect(keys: (number | string)[], _info: any) {
  if (keys.length > 0) {
    queryParams.value.materialTypeCode = keys[0]?.toString() || '';
    gridApi.reload();
  }
}

// endregion

// region 新增 / 编辑

// 抽屉是否显示
const showEditDrawer = ref(false);
// 编辑对象数据
const editMessage = ref({} as any);
// 编辑对象表单验证规则
const editRules = ref({
  downSafe: [{ message: '此项为必填项', required: false, trigger: 'change' }],
  materialCode: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  materialName: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  upSafe: [{ message: '此项为必填项', required: false, trigger: 'change' }],
} as any);

/**
 * 显示编辑抽屉
 * @param row
 */
function showEdit(row: any) {
  showEditDrawer.value = true;
  queryMaterialInfoById({
    id: row.id,
  }).then((res: any) => {
    const data = res.data || res;
    editMessage.value = {
      ...data,
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
// 文件上传列表
const uploadFile = ref<any>([]);
const pasFormRef = ref();

/**
 * 显示编辑抽屉
 * @param row
 */
function showPas(row: any) {
  const params = {
    materialCode: row.materialCode,
  };
  queryPasFile(params).then((response) => {
    if (!response) {
      editPasMessage.value = {
        materialCode: row.materialCode,
        materialName: row.materialName,
        pas_describe: '',
      };
      uploadFile.value = [];
      showPasDrawer.value = true;
      return;
    }
    const data = (response as any).data || response;
    if (!data || data === null) {
      editPasMessage.value = {
        materialCode: row.materialCode,
        materialName: row.materialName,
        pas_describe: '',
      };
    } else {
      editPasMessage.value = Object.assign({}, data);
      editPasMessage.value.materialCode = row.materialCode;
      editPasMessage.value.materialName = row.materialName;
    }
    uploadFile.value = [];
    if (editPasMessage.value.filenames) {
      for (const item of editPasMessage.value.filenames) {
        uploadFile.value = [
          ...uploadFile.value,
          {
            name: item,
            path: '',
          },
        ];
      }
    }
    showPasDrawer.value = true;
  });
}

/**
 * 关闭模态框
 */
function pasClose() {
  showPasDrawer.value = false;
  editPasMessage.value = {} as any;
  uploadFile.value = [];
  pasFormRef.value?.clearValidate();
}

/**
 * 提交PAS表单
 */
function submitPasForm() {
  pasFormRef.value?.validate().then(() => {
    // TODO: 实现PAS文件上传逻辑
    message.success('保存成功');
    pasClose();
    gridApi.reload();
  });
}

// endregion

// region 查看

// 抽屉是否显示
const showEyeDrawer = ref(false);
// 当前活跃的标签页
const activeKey = ref('1');

const eyeGridOptions: VxeGridProps<any> = {
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
    refresh: true,
    zoom: true,
  },
};

const [EyeGrid] = useVbenVxeGrid({ gridOptions: eyeGridOptions });

const eyeQueryParams = ref({
  materialCode: '',
});

function queryEyeData() {
  return new Promise((resolve, reject) => {
    /**
     * 调用 queryMaterialInfoProductReferences 函数查询产品引用
     */
    queryMaterialInfoProductReferences(eyeQueryParams.value.materialCode)
      .then((response: any) => {
        const data = response.data || response;
        resolve({
          total: data.length || 0,
          items: data || [],
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
    (response: any) => {
      const data = response.data || response;
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
  showEyeDrawer.value = false;
  activeKey.value = '1';
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);
// endregion

// region 初始化
// 路由信息
const route = useRoute();
// 权限store
const accessStore = useAccessStore();

onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  // 加载树数据
  loadTreeData();
});

// endregion

// region 文件上传和模板下载

// 上传接口地址
const uploadAction = `/ht/${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/saveByExcel`;

function handleUploadSuccess() {
  message.success('上传成功');
  gridApi.reload();
}

function handleUploadError() {
  message.error('上传失败');
}

function downloadTemplate() {
  downloadMaterialsTemplate().then((response: any) => {
    const data = response.data || response;
    if (data) {
      window.location.href = data;
    }
  });
}

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="!mb-8">
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
            v-model:selected-keys="selectedKeys"
            :field-names="treeFieldNames"
            :tree-data="treeData"
            @select="handleSelect"
          />
        </Card>
      </Col>
      <!-- endregion -->
      <!-- region 表格主体 -->
      <Col :lg="18" :md="16" :sm="20" :xl="20" :xs="14">
        <Card>
          <!-- 操作按钮区域 -->
          <Row class="!mb-4" :gutter="8">
            <Col>
              <Upload
                v-if="author.includes('编辑')"
                :action="uploadAction"
                :headers="{ Authorization: `${accessStore.accessToken}` }"
                :multiple="true"
                :show-file-list="false"
                name="file"
                @success="handleUploadSuccess"
                @error="handleUploadError"
              >
                <Button type="primary">点击上传</Button>
              </Upload>
            </Col>
            <Col>
              <Button
                v-if="author.includes('编辑')"
                type="primary"
                @click="downloadTemplate"
              >
                模板下载
              </Button>
            </Col>
          </Row>
          <Grid>
            <template #action="{ row }">
              <!-- 编辑按钮 -->
              <Tooltip v-if="author.includes('编辑')">
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
              <Tooltip v-if="author.includes('维护PAS')">
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
                  @click="showPas(row)"
                />
              </Tooltip>

              <!-- 更新物料标签描述按钮 -->
              <Tooltip v-if="author.includes('更新物料标签描述')">
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
              <Tooltip v-if="author.includes('查看')">
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
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        name="editMessageForm"
        ref="pasFormRef"
      >
        <!-- 材料编号 -->
        <FormItem
          :label="$t('basic.bomManagement.materialCode')"
          name="materialCode"
        >
          <Input v-model:value="editPasMessage.materialCode" disabled />
        </FormItem>
        <!-- 材料名称 -->
        <FormItem
          :label="$t('basic.bomManagement.materialName')"
          name="materialName"
        >
          <Input v-model:value="editPasMessage.materialName" disabled />
        </FormItem>
        <!-- 文件描述 -->
        <FormItem
          :label="$t('basic.bomManagement.materialsInform.pasDescribe')"
          name="pas_describe"
        >
          <Input v-model:value="editPasMessage.pas_describe" />
        </FormItem>
        <!-- 文件 -->
        <FormItem
          :label="$t('basic.bomManagement.materialsInform.files')"
          name="files"
        >
          <Upload
            v-model:file-list="uploadFile"
            :action="uploadAction"
            :headers="{ Authorization: `${accessStore.accessToken}` }"
            :max-count="10"
            multiple
          >
            <Button type="primary">选择文件</Button>
          </Upload>
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="pasClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="submitPasForm">
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
          <!-- 关闭 -->
          <Button @click="eyeClose">
            {{ $t('common.close') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
