<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { IconifyIcon, MdiSearch } from '@vben/icons';
import { useAccessStore } from '@vben/stores';

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
  Radio,
  RadioGroup,
  Row,
  Space,
  Textarea,
  Tooltip,
  Upload,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  downloadErpProductArchivesTemplate,
  queryCategoryTree,
  queryErpProductArchivesList,
  queryProductDetail,
  updateProduct,
} from '#/api';
import { $t } from '#/locales';
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
    {
      field: 'qualitySign',
      slots: { default: 'selectedState' },
      title: '质检',
      minWidth: 60,
    },
    {
      field: 'semifinishedProductSign',
      slots: { default: 'selectedState' },
      title: '半成品',
      minWidth: 60,
    },
    {
      field: 'planSign',
      slots: { default: 'selectedState' },
      title: '计划',
      minWidth: 60,
    },
    { field: 'productTypeName', title: '产品类别', minWidth: 80 },
    { field: 'productCode', title: '产品编号', minWidth: 150 },
    { field: 'productName', title: '产品名称', minWidth: 150 },
    {
      field: 'isSingleSide',
      slots: { default: 'isSingleSide' },
      title: '单/双面',
      minWidth: 100,
    },
    { field: 'unit', title: '计量单位', minWidth: 100 },
    { field: 'costomerGoodsCode', title: '客户货号', minWidth: 100 },
    { field: 'costomerTypeCode', title: '客户型号', minWidth: 100 },
    { field: 'produceType', title: '生产类型', minWidth: 100 },
    { field: 'workTime', title: '标准工时', minWidth: 100 },
    { field: 'packageNum', title: '包装数量', minWidth: 100 },
    { field: 'szie', title: '外箱尺寸', minWidth: 100 },
    { field: 'length', title: '*长', minWidth: 100 },
    { field: 'width', title: '*宽', minWidth: 100 },
    { field: 'height', title: '*高', minWidth: 100 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 160,
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
  // 产品编号
  productCode: '',
  // 产品名称
  productName: '',
});

/**
 * 查询数据
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = queryParams.value;
    if (selectedKey.value && selectedKey.value.code) {
      params.parentTypeCode = selectedKey.value.code;
    }
    // 调用 queryErpProductArchivesList API函数，传递查询参数和分页信息
    queryErpProductArchivesList({
      data: { ...params }, // 展开queryParams.value中的所有查询参数
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
  // 调用 queryCategoryTree API函数，获取菜单列表
  queryCategoryTree().then((data) => {
    // 检查返回的数据是否存在且长度大于0
    if (data) {
      // 如果数据有效，更新treeData
      treeData.value = [data];
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
  selectedKey.value = selected && node.orgLevel < 3 ? node : undefined;
  gridApi.reload();
}

// endregion

// region 编辑 / 查看

const editData = ref<any>({});
const editMessageForm = ref();
// 编辑对象表单验证规则
const editRules = ref({
  materialCode: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  feedNumber: [{ message: '此项为必填项', required: true, trigger: 'change' }],
} as any);
// 是否为编辑状态
const isEdit = ref(false);
// 是否显示编辑/查看抽屉
const isOpen = ref(false);

/**
 * 显示编辑/查看抽屉
 * @param row
 * @param edit
 */
function showEdit(row: any, edit = false) {
  queryProductDetail({
    productCode: row.productCode,
  }).then((data: any) => {
    isOpen.value = true;
    isEdit.value = edit;
    editData.value = data;
  });
}

function close() {
  isOpen.value = false;
  isEdit.value = false;
  editData.value = {};
}

function submit() {
  updateProduct(editData.value).then(() => {
    message.success($t('common.successfulOperation'));
    close();
    gridApi.reload();
  });
}
// endregion

// region 文件上传
const accessStore = useAccessStore();
// 文件上传头信息
const headers = ref<any>({
  Authorization: accessStore.accessToken,
});
// 上传路径
const action = ref<string>(
  `/ht/${import.meta.env.VITE_GLOB_MES_MAIN}/base/erpProductArchives/saveByExcel`,
);
// 文件列表
const fileList = ref<any>([]);

/**
 * 处理文件上传状态变化的函数。
 * @param info - 包含文件上传信息的对象。
 */
function handleChange(info: any) {
  // 检查文件是否上传成功
  if (info.file.status === 'done') {
    // 重新查询数据，更新列表
    gridApi.reload();
    // 显示成功消息
    message.success('文件上传成功!');
  } else if (info.file.status === 'error') {
    // 获取错误信息，如果存在则显示，否则显示通用错误消息
    const errorMessage = info.file.response?.message || '文件上传失败';
    // 显示错误消息
    message.error(errorMessage);
  }
}

// endregion

// region 模板下载

function downloadTemplate() {
  downloadErpProductArchivesTemplate().then((data) => {
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
    <Space direction="vertical" style="width: 100%">
      <Card>
        <Form :model="queryParams" layout="inline">
          <!-- 产品编号 -->
          <FormItem
            :label="$t('productInform.productNumber')"
            style="margin-bottom: 1em"
          >
            <Input v-model:value="queryParams.productCode" />
          </FormItem>
          <!-- 产品名称 -->
          <FormItem
            :label="$t('productInform.productName')"
            style="margin-bottom: 1em"
          >
            <Input v-model:value="queryParams.productName" />
          </FormItem>

          <FormItem>
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
      <!-- region 主要内容显示区域 -->
      <Row :gutter="16">
        <!-- region 树形菜单 -->
        <Col :lg="8" :md="8" :sm="6" :xl="6" :xs="8">
          <Card class="h-[60vh] overflow-y-auto">
            <DirectoryTree
              v-model:expanded-keys="expandedKeys"
              v-model:selected-keys="selectedKeys"
              :auto-expand-parent="true"
              :field-names="{
                children: 'children',
                title: 'orgFullName',
                key: 'orgCode',
              }"
              :tree-data="treeData"
              @select="selectedTree"
            />
          </Card>
        </Col>
        <!-- endregion -->

        <!-- region 表格主体 -->
        <Col :lg="16" :md="16" :sm="16" :xl="18" :xs="16">
          <Card class="h-[60vh] overflow-y-auto">
            <!-- 导入 -->
            <!-- 导入按钮 -->
            <Upload
              v-model:file-list="fileList"
              :action="action"
              :headers="headers"
              :show-upload-list="false"
              name="file"
              @change="handleChange"
            >
              <Button type="primary">
                {{ $t('common.import') }}
              </Button>
            </Upload>

            <!-- 模板下载 -->
            <Button class="ml-4" type="primary" @click="downloadTemplate">
              {{ $t('common.templateDownload') }}
            </Button>
            <Grid>
              <template #selectedState="{ row, column }">
                <Checkbox v-model:checked="row[column.field]" disabled />
              </template>
              <template #isSingleSide="{ row }">
                {{ row.isSingleSide === 1 ? '单面' : '双面' }}
              </template>
              <template #action="{ row }">
                <!-- 编辑按钮 -->
                <Tooltip>
                  <template #title>
                    {{ $t('common.edit') }}
                  </template>
                  <Button @click="showEdit(row, true)" class="mr-2" type="link">
                    <IconifyIcon
                      icon="mdi:edit-outline"
                      class="inline-block size-6"
                    />
                  </Button>
                </Tooltip>
                <!-- 查看 -->
                <Tooltip>
                  <template #title>
                    {{ $t('common.edit') }}
                  </template>
                  <Button @click="showEdit(row)" class="mr-2" type="link">
                    <IconifyIcon icon="mdi:eye" class="inline-block size-6" />
                  </Button>
                </Tooltip>
              </template>
            </Grid>
          </Card>
        </Col>
        <!-- endregion -->
      </Row>
      <!-- endregion -->
    </Space>
    <!-- 编辑 -->
    <Drawer
      v-model:open="isOpen"
      :footer-style="{ textAlign: 'right' }"
      :width="800"
      class="custom-class"
      placement="right"
      :title="isEdit ? $t('common.edit') : $t('common.view')"
    >
      <Form
        :label-col="{ span: 6 }"
        :model="editData"
        :rules="editRules"
        :wrapper-col="{ span: 18 }"
        autocomplete="off"
        ref="editMessageForm"
      >
        <!-- 产品编号 -->
        <FormItem :label="$t('productInform.productNumber')" name="productCode">
          <Input v-model:value="editData.productCode" :disabled="!isEdit" />
        </FormItem>
        <!-- 产品名称 -->
        <FormItem :label="$t('productInform.productName')" name="productName">
          <Input v-model:value="editData.productName" :disabled="!isEdit" />
        </FormItem>
        <!-- 单/双面 -->
        <FormItem :label="$t('productInform.surface')" name="isSingleSide">
          <RadioGroup v-model:value="editData.isSingleSide" :disabled="!isEdit">
            <Radio :value="1">单面</Radio>
            <Radio :value="2">双面</Radio>
          </RadioGroup>
        </FormItem>
        <!-- 计量单位 -->
        <FormItem :label="$t('productInform.unitOfMeasurement')" name="unit">
          <Input v-model:value="editData.unit" :disabled="!isEdit" />
        </FormItem>
        <!-- 产品类别 -->
        <FormItem
          :label="$t('productInform.productCategory')"
          name="productTypeName"
        >
          <Input v-model:value="editData.productTypeName" :disabled="!isEdit" />
        </FormItem>
        <!-- 客户货号 -->
        <FormItem
          :label="$t('productInform.customerItemNumber')"
          name="costomerGoodsCode"
        >
          <Input
            v-model:value="editData.costomerGoodsCode"
            :disabled="!isEdit"
          />
        </FormItem>
        <!-- 客户型号 -->
        <FormItem
          :label="$t('productInform.customerModel')"
          name="costomerTypeCode"
        >
          <Input
            v-model:value="editData.costomerTypeCode"
            :disabled="!isEdit"
          />
        </FormItem>
        <!-- 生产类型 -->
        <FormItem
          :label="$t('productInform.productionType')"
          name="produceType"
        >
          <Input
            v-model:value="editData.produceType"
            :disabled="!isEdit"
            class="mr-4"
          >
            <template #addonAfter>
              <!-- 计划标记 -->
              <Checkbox v-model:checked="editData.planSign" :disabled="!isEdit">
                {{ $t('productInform.planMarking') }}
              </Checkbox>
            </template>
          </Input>
        </FormItem>
        <!-- 标准工时 -->
        <FormItem
          :label="$t('productInform.standardWorkingHours')"
          name="customerModel"
        >
          <Input
            v-model:value="editData.customerModel"
            :disabled="!isEdit"
            class="mr-4"
          >
            <template #addonAfter>
              <!-- 产量/小时*人数 -->
              {{ $t('productInform.remarksOnWorkingHours') }}
            </template>
          </Input>
        </FormItem>
        <!-- 标记 -->
        <FormItem :label="$t('productInform.mark')">
          <!-- 质检标记 -->
          <Checkbox
            v-model:checked="editData.qualitySign"
            class="mb-2"
            :disabled="!isEdit"
          >
            {{ $t('productInform.qualityInspectionMark') }}
          </Checkbox>
          <!-- SMT工序 -->
          <Checkbox v-model:checked="editData.smtProcess" :disabled="!isEdit">
            {{ $t('productInform.smtProcess') }}
          </Checkbox>
          <!-- 插件工序 -->
          <Checkbox
            v-model:checked="editData.pluginProcess"
            :disabled="!isEdit"
          >
            {{ $t('productInform.plugInProcess') }}
          </Checkbox>
          <!-- 补焊工序 -->
          <Checkbox
            v-model:checked="editData.repairWeldingProcess"
            :disabled="!isEdit"
          >
            {{ $t('productInform.repairWeldingProcess') }}
          </Checkbox>
          <!-- 组装工序 -->
          <Checkbox
            v-model:checked="editData.assemblyProcess"
            :disabled="!isEdit"
          >
            {{ $t('productInform.assemblyProcess') }}
          </Checkbox>
        </FormItem>
        <!-- 包装数量 -->
        <FormItem
          :label="$t('productInform.packagingQuantity')"
          name="customerModel"
        >
          <Input v-model:value="editData.customerModel" :disabled="!isEdit" />
        </FormItem>
        <!-- 外箱尺寸 -->
        <FormItem :label="$t('productInform.outerBoxSize')">
          <InputNumber v-model:value="editData.szie" :disabled="!isEdit" />
          <span class="ml-1 mr-1 align-middle">
            {{ $t('productInform.cubicMeter') }} =
          </span>
          <!-- 长 -->
          <span class="ml-1 mr-1 align-middle">{{
            $t('productInform.long')
          }}</span>
          <InputNumber v-model:value="editData.length" :disabled="!isEdit" />
          <!-- 宽 -->
          <span class="ml-1 mr-1 align-middle">
            * {{ $t('productInform.wide') }}
          </span>
          <InputNumber v-model:value="editData.width" :disabled="!isEdit" />
          <!-- 高 -->
          <span class="ml-1 mr-1 align-middle">
            * {{ $t('productInform.high') }}
          </span>
          <InputNumber v-model:value="editData.height" :disabled="!isEdit" />
          <span class="ml-1 mr-1 align-middle">{{
            $t('productInform.centimeter')
          }}</span>
        </FormItem>
        <!-- 放宽率 -->
        <FormItem
          :label="$t('productInform.relaxationRate')"
          name="relaxationRate"
        >
          <InputNumber
            v-model:value="editData.relaxationRate"
            :disabled="!isEdit"
          >
            <template #addonAfter> % </template>
          </InputNumber>
        </FormItem>
        <!-- 标准小时产能 -->
        <FormItem
          :label="$t('productInform.standardHourlyProductionCapacity')"
          name="standardHourlyCapacity"
        >
          <Input
            v-model:value="editData.standardHourlyCapacity"
            :disabled="!isEdit"
          />
        </FormItem>
        <!-- 产品描述 -->
        <FormItem
          :label="$t('productInform.productDescription')"
          name="produceDescription"
        >
          <Textarea
            v-model:value="editData.produceDescription"
            :disabled="!isEdit"
          />
        </FormItem>
        <!-- 打印信息 -->
        <span class="mb-4 ml-16 block text-2xl">{{
          $t('productInform.printInformation')
        }}</span>
        <!-- 刻印机程序号 -->
        <FormItem
          :label="$t('productInform.engravingMachineProgramNumber')"
          name="printProgramNo"
        >
          <Input v-model:value="editData.printProgramNo" :disabled="!isEdit" />
        </FormItem>
        <!-- 刻印机B面程序号 -->
        <FormItem
          :label="$t('productInform.programNumberOnSideBOfTheEngravingMachine')"
          name="printProgramNob"
        >
          <Input v-model:value="editData.printProgramNob" :disabled="!isEdit" />
        </FormItem>
        <!-- 扫码点数量 -->
        <FormItem
          :label="$t('productInform.theNumberOfScanningPoints')"
          name="barcodePrintNumber"
        >
          <Input
            v-model:value="editData.barcodePrintNumber"
            :disabled="!isEdit"
          />
        </FormItem>
        <!-- 拼版数量 -->
        <FormItem
          :label="$t('productInform.theNumberOfPanels')"
          name="makeupNumber"
        >
          <Input v-model:value="editData.makeupNumber" :disabled="!isEdit" />
        </FormItem>
      </Form>

      <template #footer v-if="isEdit">
        <Space>
          <!-- 取消 -->
          <Button @click="isOpen = false">
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
