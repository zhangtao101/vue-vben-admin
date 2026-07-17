<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Checkbox,
  Col,
  DirectoryTree,
  Form,
  FormItem,
  Image,
  Input,
  message,
  Modal,
  Row,
  Space,
  Tabs,
  Tooltip,
  Upload,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteBomItem,
  downloadProductBomTemplate,
  getBomDetailList,
  getBomDetailTree,
  getProductBomList,
  getProductBomTypeTree,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import BomItemDrawer from '#/util/component/productBom/BomItemDrawer.vue';
import ProductBomEditDrawer from '#/util/component/productBom/ProductBomEditDrawer.vue';


// 路由信息
const route = useRoute();

// region 表格操作

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    { field: 'bomTypeName', title: $t('baseInfo.bomCategory'), minWidth: 80 },
    { field: 'productTypeName', title: $t('baseInfo.productCategory'), minWidth: 80 },
    { field: 'productCode', title: $t('baseInfo.productCode'), minWidth: 100 },
    { field: 'productName', title: $t('baseInfo.productName'), minWidth: 100 },
    {
      field: 'imagePath',
      minWidth: 80,
      slots: { default: 'imagePath' },
      title: $t('baseInfo.productImage'),
    },
    {
      field: 'isLock',
      title: $t('baseInfo.locked'),
      minWidth: 100,
      slots: { default: 'selectedState' },
    },
    {
      field: 'isAudit',
      title: $t('baseInfo.audit'),
      slots: { default: 'selectedState' },
      minWidth: 100,
    },
    {
      field: 'isHalf',
      title: $t('baseInfo.semiFinished'),
      slots: { default: 'selectedState' },
      minWidth: 100,
    },
    { field: 'materialCode', title: $t('baseInfo.materialCode'), minWidth: 100 },
    { field: 'remark', title: $t('baseInfo.remarkDescription'), minWidth: 100 },
    { field: 'sourceProduct', title: $t('baseInfo.sourceProduct'), minWidth: 100 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('baseInfo.action'),
      minWidth: 200,
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

// 当前选中的节点
const selectedKey = ref<any>(undefined);

// endregion

// region 数据查询

// 查询参数
const queryParams = ref({
  // 类别编号
  productCode: '',
  // 类别名称
  productName: '',
  // BOM类别编号
  bomTypeCode: '',
});

/**
 * 查询数据
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = queryParams.value;
    params.bomTypeCode = selectedKey.value && selectedKey.value.typeCode ? selectedKey.value.typeCode : '';
    // 调用 listStations API函数，传递查询参数和分页信息
    getProductBomList({
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
const treeData = ref<any[]>([]);

/**
 * 查询类别树
 */
function queryAllCategoryTree() {
  // 调用 getProductBomTypeTree API函数，获取菜单列表
  getProductBomTypeTree().then((data) => {
    // 检查返回的数据是否存在且长度大于0
    if (data) {
      // 如果数据有效，更新treeData，添加"全部"节点
      treeData.value = [
        {
          typeCode: '',
          typeName: $t('page.common.all'),
          children: data,
        },
      ];
    }
  });
}

/**
 * 处理树形控件选中事件
 * @param {any} _selectedKeys - 当前选中的节点键值
 * @param {object} info - 包含节点和选中状态的对象
 * @param {object} info.node - 当前操作的节点对象
 * @param {boolean} info.selected - 节点的选中状态
 */
function selectedTree(_selectedKeys: any, { node, selected }: any) {
  if (node.typeName === $t('page.common.all')) {
    selectedKey.value = '';
    queryParams.value.bomTypeCode = '';
  } else {
    selectedKey.value = selected && node.typeLevel < 3 ? node : undefined;
  }
  gridApi.reload();
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 查看 BOM 详情

const detailModalVisible = ref(false);
const bomCode = ref('');
const productCode = ref('');
const activeTabKey = ref('first');

// 设计BOM表格数据
const designGridData = reactive<any[]>([]);
// 多级展开表格数据
const expandGridData = reactive<any[]>([]);

// 设计BOM表格配置
const designGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 60 },
    {
      field: 'isLowerestLevel',
      title: $t('baseInfo.lastLevel'),
      width: 80,
      slots: { default: 'isLowerestLevel' },
    },
    { field: 'orderNumber', title: $t('baseInfo.orderNumber'), width: 80 },
    { field: 'materialTypeName', title: $t('baseInfo.materialCategory'), minWidth: 120 },
    { field: 'materialCode', title: $t('baseInfo.materialCode'), minWidth: 120 },
    { field: 'materialName', title: $t('baseInfo.partOrMaterialName'), minWidth: 200 },
    { field: 'codeNumber', title: $t('baseInfo.codeName'), width: 100 },
    { field: 'perDosage', title: $t('baseInfo.perDosage'), width: 100 },
    { field: 'perQuantity', title: $t('baseInfo.perQuantity'), width: 100 },
    { field: 'singleDosage', title: $t('baseInfo.singleDosage'), width: 100 },
    { field: 'unit', title: $t('baseInfo.unit'), width: 80 },
    { field: 'conversionFaction', title: $t('baseInfo.conversionFaction'), width: 100 },
    { field: 'auxiliaryDoage', title: $t('baseInfo.auxiliaryDoage'), width: 100 },
    { field: 'auxiliaryUnit', title: $t('baseInfo.auxiliaryUnit'), width: 100 },
    { field: 'productCode', title: $t('baseInfo.productCode'), width: 120 },
    { field: 'supplier', title: $t('baseInfo.supplier'), width: 120 },
    { field: 'useProcess', title: $t('baseInfo.useProcess'), width: 120 },
    { field: 'remark', title: $t('baseInfo.remarkDescription'), minWidth: 150 },
    {
      field: 'action',
      title: $t('baseInfo.action'),
      fixed: 'right',
      slots: { default: 'itemAction' },
      width: 140,
    },
  ],
  height: 500,
  data: designGridData,
  pagerConfig: {
    enabled: false,
  },
};

// 多级展开表格配置
const expandGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 60 },
    {
      field: 'isLowerestLevel',
      title: $t('baseInfo.lastLevel'),
      width: 80,
      slots: { default: 'isLowerestLevel' },
    },
    { field: 'orderNumber', title: $t('baseInfo.orderNumber'), width: 80 },
    { field: 'materialTypeName', title: $t('baseInfo.materialCategory'), minWidth: 120 },
    { field: 'materialCode', title: $t('baseInfo.materialCode'), minWidth: 120 },
    { field: 'materialName', title: $t('baseInfo.partOrMaterialName'), minWidth: 200 },
    { field: 'codeNumber', title: $t('baseInfo.codeName'), width: 100 },
    { field: 'perDosage', title: $t('baseInfo.perDosage'), width: 100 },
    { field: 'perQuantity', title: $t('baseInfo.perQuantity'), width: 100 },
    { field: 'singleDosage', title: $t('baseInfo.singleDosage'), width: 100 },
    { field: 'unit', title: $t('baseInfo.unit'), width: 80 },
    { field: 'conversionFaction', title: $t('baseInfo.conversionFaction'), width: 100 },
    { field: 'auxiliaryDoage', title: $t('baseInfo.auxiliaryDoage'), width: 100 },
    { field: 'auxiliaryUnit', title: $t('baseInfo.auxiliaryUnit'), width: 100 },
    { field: 'productCode', title: $t('baseInfo.productCode'), width: 120 },
    { field: 'supplier', title: $t('baseInfo.supplier'), width: 120 },
    { field: 'useProcess', title: $t('baseInfo.useProcess'), width: 120 },
    { field: 'remark', title: $t('baseInfo.remarkDescription'), minWidth: 150 },
  ],
  height: 500,
  data: expandGridData,
  rowConfig: {
    isCurrent: true,
    isHover: true,
  },
  pagerConfig: {
    enabled: false,
  },
};

const [DesignGrid] = useVbenVxeGrid({ gridOptions: designGridOptions });
const [ExpandGrid] = useVbenVxeGrid({ gridOptions: expandGridOptions });

/**
 * 查看 BOM 详情
 */
function handleDetail(row: any) {
  activeTabKey.value = 'first';
  detailModalVisible.value = true;
  bomCode.value = row.bomCode;
  productCode.value = row.productCode;

  // 默认加载设计 BOM
  loadDesignBom(row.bomCode);
}

/**
 * 加载设计 BOM
 */
function loadDesignBom(code: string) {
  getBomDetailList(code).then((res: any) => {
    const data = res || [];
    designGridData.splice(0, designGridData.length, ...data);
  });
}

/**
 * 加载多级展开 BOM
 */
function loadExpandBom(code: string) {
  getBomDetailTree(code).then((res: any) => {
    const data = res || [];
    expandGridData.splice(0, expandGridData.length, ...data);
  });
}

/**
 * Tab 切换事件
 */
function handleTabChange(key: number | string) {
  if (key === 'second') {
    loadExpandBom(bomCode.value);
  }
}

// region BOM 明细 新增 / 编辑 / 删除
const bomItemDrawerRef = ref();
const productBomEditRef = ref();

function handleAddItem() {
  bomItemDrawerRef.value.open('add', { productCode: productCode.value });
}

/**
 * 编辑产品 BOM 基本信息
 */
function handleEditBasic(row: any) {
  productBomEditRef.value.open(row);
}

function handleEditItem(row: any) {
  bomItemDrawerRef.value.open('edit', row);
}

function handleDeleteItem(row: any) {
  Modal.confirm({
    title: $t('basic.delete'),
    content: `${$t('basic.delete')}：${row.materialName || row.materialCode}`,
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () =>
      new Promise<void>((resolve, reject) => {
        deleteBomItem(row.id)
          .then(() => {
            message.success($t('common.successfulOperation'));
            loadDesignBom(bomCode.value);
            resolve();
          })
          .catch((error: any) => {
            message.error(error?.message || $t('common.operationFailed'));
            reject(error);
          });
      }),
  });
}
// endregion

// endregion

// region 文件导入 / 模板下载

const accessStore = useAccessStore();
// 上传请求头信息
const uploadHeaders = ref<any>({
  Authorization: accessStore.accessToken,
});
// 上传地址
const uploadAction = ref<string>(
  `/ht/${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/productbom/import`,
);
// 文件列表
const fileList = ref<any>([]);

/**
 * 处理文件上传状态变化
 * @param info - 包含文件上传信息的对象
 */
function handleUploadChange(info: any) {
  if (info.file.status === 'done') {
    // 上传成功，重新查询列表
    gridApi.reload();
    message.success($t('baseInfo.uploadSuccess'));
  } else if (info.file.status === 'error') {
    const errorMessage =
      info.file.response?.message || $t('baseInfo.uploadFailed');
    message.error(errorMessage);
  }
}

/**
 * 下载导入模板
 */
function downloadTemplate() {
  downloadProductBomTemplate().then((data: any) => {
    window.open(data);
  });
}

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
// todo 暂时做不下去了, 需要数据查看样式
// endregion
</script>

<template>
  <Page>
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 类别编号 -->
        <FormItem
          :label="$t('basic.productBom.code')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productCode" />
        </FormItem>
        <!-- 类别名称 -->
        <FormItem
          :label="$t('basic.productBom.name')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productName" />
        </FormItem>

        <FormItem>
          <Button type="primary" @click="() => gridApi.reload()">
            <Icon icon="mdi:search" class="inline-block mr-2" />
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- region 主要内容显示区域 -->
    <Row :gutter="16">
      <!-- region 树形菜单 -->
      <Col :lg="6" :md="8" :sm="8" :xl="8" :xs="8">
        <Card class="h-[60vh] overflow-y-auto">
          <DirectoryTree
            v-model:expanded-keys="expandedKeys"
            v-model:selected-keys="selectedKeys"
            :auto-expand-parent="false"
            :field-names="{
              children: 'children',
              title: 'typeName',
              key: 'typeCode',
            }"
            :tree-data="treeData"
            @select="selectedTree"
          />
        </Card>
      </Col>
      <!-- endregion -->

      <!-- region 表格主体 -->
      <Col :lg="16" :md="16" :sm="16" :xl="16" :xs="16">
        <Card class="h-[60vh] overflow-y-auto">
          <Grid>
            <template #toolbar-tools>
              <!-- 产品导入 -->
              <Upload
                v-model:file-list="fileList"
                :action="uploadAction"
                :headers="uploadHeaders"
                :show-upload-list="false"
                name="file"
                @change="handleUploadChange"
              >
                <Button type="primary">
                  {{ $t('common.import') }}
                </Button>
              </Upload>
              <!-- 模板下载 -->
              <Button class="ml-4" type="primary" @click="downloadTemplate">
                {{ $t('common.templateDownload') }}
              </Button>
            </template>
            <template #imagePath="{ row }">
              <Image
                v-if="row.imagePath"
                :src="row.imagePath"
                :width="60"
                fallback="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PC9zdmc+"
              />
              <span v-else>-</span>
            </template>
            <template #selectedState="{ row, column }">
              <Checkbox v-model:checked="row[column.field]" disabled />
            </template>
            <template #action="{ row }">
              <Tooltip>
                <template #title>{{ $t('basic.bomManagement.view') }}</template>
                <Button
                  v-if="author.includes('查看')"
                  type="link"
                  @click="handleDetail(row)"
                >
                  <Icon icon="mdi:eye-outline" class="inline-block size-6" />
                </Button>
              </Tooltip>
              <Tooltip>
                <template #title>{{ $t('common.edit') }}</template>
                <Button
                  v-if="author.includes('编辑')"
                  type="link"
                  @click="handleEditBasic(row)"
                >
                  <Icon icon="mdi:file-edit-outline" class="inline-block size-6" />
                </Button>
              </Tooltip>
            </template>
          </Grid>
        </Card>
      </Col>
      <!-- endregion -->
    </Row>
    <!-- endregion -->

    <!-- 查看 BOM 详情 -->
    <Modal
      v-model:open="detailModalVisible"
      :title="activeTabKey === 'first' ? $t('baseInfo.designBOM') : $t('baseInfo.multiLevelExpand')"
      width="90%"
      :footer="null"
    >
      <Tabs v-model:active-key="activeTabKey" @change="handleTabChange">
        <Tabs.TabPane key="first" :tab="$t('baseInfo.designBOM')">
          <DesignGrid>
            <template #toolbar-actions>
              <Button
                v-if="author.includes('新增')"
                type="primary"
                @click="handleAddItem"
              >
                {{ $t('common.add') }}
              </Button>
            </template>
            <template #isLowerestLevel="{ row }">
              <Checkbox :checked="row.isLowerestLevel" :disabled="true" />
            </template>
            <template #itemAction="{ row }">
              <Space>
                <Button
                  v-if="author.includes('编辑')"
                  type="link"
                  @click="handleEditItem(row)"
                >
                  {{ $t('common.edit') }}
                </Button>
                <Button
                  v-if="author.includes('删除')"
                  type="link"
                  danger
                  @click="handleDeleteItem(row)"
                >
                  {{ $t('basic.delete') }}
                </Button>
              </Space>
            </template>
          </DesignGrid>
        </Tabs.TabPane>
        <Tabs.TabPane key="second" :tab="$t('baseInfo.multiLevelExpand')">
          <ExpandGrid>
            <template #isLowerestLevel="{ row }">
              <Checkbox :checked="row.isLowerestLevel" :disabled="true" />
            </template>
          </ExpandGrid>
        </Tabs.TabPane>
      </Tabs>
      <div style="margin-top: 16px; text-align: right">
        <Button @click="detailModalVisible = false">{{ $t('common.cancel') }}</Button>
      </div>
    </Modal>

    <!-- BOM 明细新增 / 编辑抽屉 -->
    <BomItemDrawer ref="bomItemDrawerRef" @refresh="() => loadDesignBom(bomCode)" />
    <ProductBomEditDrawer ref="productBomEditRef" @refresh="() => gridApi.reload()" />
  </Page>
</template>

<style scoped></style>
