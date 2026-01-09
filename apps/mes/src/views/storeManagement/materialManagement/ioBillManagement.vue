<script lang="ts" setup>
/**
 * 出入库单据管理页面
 * 功能：管理物料的入库和出库单据，包括单据的增删改查、审核等操作
 *
 * 主要功能模块：
 * 1. 单据列表展示和查询
 * 2. 单据新增/编辑（包含明细信息）
 * 3. 单据审核（通过/不通过）
 * 4. 物料信息查询和选择
 * 5. 物料特征选择
 */

import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import {
  IconParkSolidError,
  MdiEditOutline,
  MdiEyeOutline,
  MdiLightDelete,
  MdiSearch,
  MdiSuccess,
} from '@vben/icons';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  RadioGroup,
  RangePicker,
  Row,
  Select,
  Space,
  Spin,
  Tooltip,
} from 'ant-design-vue';
import dayjs from 'dayjs';
// eslint-disable-next-line n/no-extraneous-import
import { debounce } from 'lodash-es';
import { JsonViewer } from 'vue3-json-viewer';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  inboundAndOutboundDocumentsAreAudited,
  inboundAndOutboundDocumentsAreDeleted,
  inboundAndOutboundDocumentsAreInserted,
  inboundAndOutboundDocumentsAreUpdated,
  inboundAndOutboundDocumentsAreViewed,
  materialFeatureGetByMaterialCodeWith,
  materialFeatureGetMaterialCodeList,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

import 'vue3-json-viewer/dist/vue3-json-viewer.css';

// 获取路由信息，用于权限查询
const route = useRoute();

// region 主表格配置和操作

/**
 * 主表格配置选项
 * 用于展示出入库单据列表，包含单据基本信息和操作按钮
 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'formCode', title: '单据编号', minWidth: 150 },
    { field: 'operateDate', title: '单据日期', minWidth: 150 },
    { field: 'operatorName', title: '创建人', minWidth: 150 },
    { field: 'enterOut', title: '单据类型', minWidth: 150 },
    { field: 'enterOutName', title: '单据类型说明', minWidth: 150 },
    { field: 'outType', title: '操作类型', minWidth: 150 },
    { field: 'outTypeName', title: '操作类型说明', minWidth: 150 },
    { field: 'formStateName', title: '单据执行状态', minWidth: 150 },
    { field: 'auditStateName', title: '审核状态', minWidth: 150 },
    { field: 'auditUser', title: '审核人', minWidth: 150 },
    { field: 'auditTime', title: '审核时间', minWidth: 150 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
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

/**
 * 主表格事件监听器
 * 目前暂无特殊事件处理
 */
const gridEvents: VxeGridListeners<any> = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

/**
 * 创建主表格实例和API
 */
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// region 查看 / 编辑 / 新增 具体操作

/**
 * 当前选中的表格行数据
 */
const checkedRow = ref<any>({});

/**
 * 是否显示查看详情抽屉
 */
const showViewDrawer = ref(false);

/**
 * 是否显示编辑抽屉
 */
const showEditDrawer = ref(false);

/**
 * 单据类型选项配置
 * 1-入库单，2-出库单
 */
const documentType = [
  { label: '入库单', value: 1 },
  { label: '出库单', value: -1 },
];

/**
 * 入库单操作类型选项
 * 1-正常入库，-1-退库
 */
const operateType1 = [
  { label: '正常入库', value: 1 },
  { label: '退库', value: -1 },
];

/**
 * 出库单操作类型选项
 * 1-正常出库，2-退货
 */
const operateType2 = [
  { label: '正常出库', value: 1 },
  { label: '退货', value: 2 },
];

/**
 * 编辑表单引用对象
 */
const editForm = ref();

/**
 * 表单验证规则
 */
const editRules = ref<any>({
  operateDate: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  enterType: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  outType: [{ message: '此项为必填项', required: true, trigger: 'change' }],
});

/**
 * 打开编辑抽屉
 * 支持新增和编辑两种模式，编辑时加载已有数据
 * @param row 表格行数据，为空时为新增模式
 * @param isShow 是否为查看模式
 */
function editRow(row?: any, isShow = false) {
  checkedRow.value = row
    ? {
        id: row.id,
        enterType: row.enterOut,
        operateDate: dayjs(row.operateDate, 'YYYY-MM-DD'),
        outType: row.outType,
      }
    : {};
  showEditDrawer.value = true;
  showViewDrawer.value = isShow;
  // 延迟加载明细数据，确保表格已渲染完成
  setTimeout(() => {
    addGridApi.grid.loadData(row?.details || []);
  }, 500);
}

/**
 * 删除单据数据
 * 二次确认后调用删除接口
 * @param row 要删除的单据行数据
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
      inboundAndOutboundDocumentsAreDeleted({
        id: row.id,
      }).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.query();
      });
    },
    title: '是否确认删除该条数据?',
  });
}

/**
 * 关闭编辑抽屉
 * 清空表单数据并重置相关状态
 */
function onClose() {
  checkedRow.value = {};
  showViewDrawer.value = false;
  showEditDrawer.value = false;
  addGridApi.grid.loadData([]);
}

/**
 * 提交表单数据
 * 验证表单后提交单据基本信息和明细数据
 * 根据是否有ID判断是新增还是编辑操作
 */
function submit() {
  editForm.value.validate().then(() => {
    const params = {
      ...checkedRow.value,
    };
    // 格式化日期
    if (params.operateDate) {
      params.operateDate = params.operateDate.format('YYYY-MM-DD');
    }
    // 获取明细表格数据
    const { tableData } = addGridApi.grid.getTableData();
    params.insertDetailVms = tableData || [];

    // 根据ID判断新增或编辑
    const ob = params.id
      ? inboundAndOutboundDocumentsAreUpdated(params)
      : inboundAndOutboundDocumentsAreInserted(params);
    ob.then(() => {
      gridApi.query();
      message.success($t('common.successfulOperation'));
      onClose();
    });
  });
}

// endregion

// region 明细表格配置和操作

/**
 * 明细表格配置选项
 * 用于展示和编辑单据的物料明细信息
 */
const addGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'materialCode', title: '料号', minWidth: 150 },
    { field: 'materialName', title: '物料名称', minWidth: 150 },
    { field: 'materialDescriptionId', title: '物料特征ID', minWidth: 150 },
    { field: 'number', title: '数量', minWidth: 150 },
    { field: 'manufacturerName', title: '供应商名称', minWidth: 150 },
    { field: 'contractCode', title: '绑定单号', minWidth: 150 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 220,
    },
  ],
  pagerConfig: {
    enabled: false, // 明细表格不启用分页
  },
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: false, // 禁用刷新按钮
    zoom: true,
  },
};

/**
 * 明细表格事件监听器
 */
const addGridEvents: VxeGridListeners<any> = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

/**
 * 创建明细表格实例和API
 */
const [AddGrid, addGridApi] = useVbenVxeGrid({
  gridEvents: addGridEvents,
  gridOptions: addGridOptions,
});

/**
 * 向明细表格添加新行数据
 * @param data 要添加的行数据
 */
function addRow(data: any) {
  addGridApi.grid.insert(data);
}

// endregion

/**
 * 是否显示明细编辑抽屉
 */
const isShowTableDetails = ref(false);

/**
 * 明细表单数据对象
 */
const detailsState = ref<any>({});

/**
 * 明细表单引用对象
 */
const detailsRef = ref<any>();

/**
 * 明细表单验证规则
 */
const detailsRules = ref<any>({
  materialCode: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  materialDescriptionId: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  number: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  contractCode: [
    { message: '此项为必填项', required: false, trigger: 'change' },
  ],
});

/**
 * 打开明细编辑抽屉
 * 支持新增和编辑两种模式
 * @param row 要编辑的行数据，为空时为新增模式
 */
function openEditDrawer(row?: any) {
  isShowTableDetails.value = true;
  detailsState.value = row ? { ...row, isEdit: true } : {};

  // 如果是编辑模式且有物料编码，则查询对应的物料特征
  if (detailsState.value.materialCode) {
    queryMaterialCode(detailsState.value.materialCode);
  }
}

/**
 * 关闭明细编辑抽屉
 */
function closeEditDrawer() {
  isShowTableDetails.value = false;
  detailsState.value = {};
}

/**
 * 删除明细行数据
 * @param row 要删除的明细行数据
 */
function delDetails(row: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消删除!');
    },
    onOk() {
      addGridApi.grid.remove(row);
      message.success($t('common.successfulOperation'));
    },
    title: '是否确认删除该条数据?',
  });
}

/**
 * 提交明细表单数据
 * 根据是否为编辑模式，执行更新或新增操作
 */
function detailsSubmit() {
  detailsRef.value.validate().then(() => {
    if (detailsState.value.isEdit) {
      // 编辑模式：更新现有行数据
      const index = addGridApi.grid.getRowIndex(detailsState.value);
      const { tableData } = addGridApi.grid.getTableData();
      tableData[index] = {
        ...detailsState.value,
      };
      addGridApi.grid.loadData(tableData);
    } else {
      // 新增模式：添加新行
      addRow(detailsState.value);
    }
    closeEditDrawer();
  });
}

// region 物料号模糊查询相关功能

/**
 * 物料号列表数据
 */
const listOfMaterialNumbers = ref<any>([]);

/**
 * 查询加载状态
 */
const fetching = ref(false);

/**
 * 模糊查询物料号
 * 功能：根据输入值动态查询匹配的物料号列表
 * 流程：
 * 1. 校验输入值有效性（非空校验）
 * 2. 设置加载状态为true
 * 3. 调用模糊查询接口获取匹配结果
 * 4. 更新物料号列表数据
 * 5. 重置加载状态
 *
 * @param val - 用户输入的查询关键词
 *
 * 注意事项：
 * - 实际调用时通过防抖函数包装(500ms)
 * - 输入空值时不会触发查询
 * - 分页参数固定为查询最新/最相关结果
 * - 错误处理通过.finally确保加载状态重置
 */
function listOfMaterialNumbersSearch(val: string) {
  if (val) {
    fetching.value = true;
    materialFeatureGetMaterialCodeList({
      materialCode: val,
    })
      .then(({ results }: any) => {
        if (results.length > 0) {
          results.forEach((item: any) => {
            item.title = `${item.materialName}(${item.materialCode})`;
          });
          listOfMaterialNumbers.value = results;
        } else {
          listOfMaterialNumbers.value = [
            {
              title: '未查询到相关物料号',
              disabled: true,
            },
          ];
        }
      })
      .finally(() => {
        fetching.value = false;
      });
  }
}

/**
 * 物料号搜索防抖函数
 * 500ms延迟，避免频繁请求接口
 */
const listOfMaterialNumbersSearchThrottling = debounce(
  (value: string) => listOfMaterialNumbersSearch(value),
  500,
);

/**
 * 处理物料选择事件
 * 同步选中物料的编码和名称到表单，并查询对应的物料特征
 *
 * @param _value - 选中的物料编码值（未使用）
 * @param _item - 选中项完整数据，包含物料信息
 *   - materialCode: 物料编码
 *   - materialName: 物料名称
 */
function workorderCodeChange(_value: any, _item: any) {
  detailsState.value.materialCode = _item.materialCode;
  detailsState.value.materialName = _item.materialName;
  queryMaterialCode(detailsState.value.materialCode);
}

// endregion

// region 物料特征查询相关功能

/**
 * 物料特征列表数据
 */
const materialCharacteristics = ref<any[]>([]);

/**
 * 是否显示物料特征选择抽屉
 */
const isShowCharacteristics = ref(false);

/**
 * 根据物料编码查询物料特征信息
 * @param materialCode 物料编码
 */
function queryMaterialCode(materialCode: string) {
  if (materialCode) {
    materialFeatureGetByMaterialCodeWith({
      materialCode,
    })
      .then(({ list }: any) => {
        // 解析特征描述JSON数据
        list.forEach((item: any) => {
          item.description = item.description
            ? JSON.parse(item.description)
            : {};
        });
        materialCharacteristics.value = list;
      })
      .finally(() => {
        fetching.value = false;
      });
  }
}

/**
 * 选择物料特征
 * 将选中的特征ID设置到表单中
 * @param materialDescriptionId 物料特征ID
 */
function selectMaterialCharacteristics(materialDescriptionId: number) {
  detailsState.value.materialDescriptionId = materialDescriptionId;
}
// endregion

// region 主列表查询相关功能

/**
 * 主表格查询参数
 * 默认查询全部类型（-99）
 */
const queryParams = ref<any>({
  enterOut: -99,
});

/**
 * 单据类型筛选选项
 * 用于顶部搜索栏的类型筛选
 */
const outType = [
  {
    label: '全部',
    value: -99,
  },
  {
    label: '入库',
    value: 1,
  },
  {
    label: '出库',
    value: -1,
  },
];

/**
 * 主表格数据查询函数
 * 根据查询参数获取分页数据
 * @param page 当前页码
 * @param pageSize 每页显示数量
 * @returns Promise 返回分页数据
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params: any = {
      ...queryParams.value, // 展开所有查询参数
      pageNum: page, // 当前页码
      pageSize, // 每页显示的数据条数
    };

    // 处理单据类型：全部时不传该参数
    if (params.enterOut === -99) {
      delete params.enterOut;
    }

    // 处理时间范围查询
    if (params.searchTime && params.searchTime.length === 2) {
      params.operateDateStart = params.searchTime[0].format(
        'YYYY-MM-DD 00:00:00',
      );
      params.operateDateEnd = params.searchTime[1].format(
        'YYYY-MM-DD 23:59:59',
      );
    }

    // 调用接口获取数据
    inboundAndOutboundDocumentsAreViewed(params).then(({ total, results }) => {
      resolve({
        total,
        items: results,
      });
    });
  });
}

// endregion

// region 单据审核相关功能

/**
 * 处理单据审核操作
 * 二次确认后执行审核（通过/不通过）
 *
 * @param row 当前审核的单据数据
 * @param isPass 审核结果：true-通过，false-不通过
 */
function handleAudit(row: any, isPass: boolean) {
  const title = isPass ? '是否确认通过该条数据?' : '是否确认不通过该条数据?';
  const statusCode = isPass ? 1 : 2; // 1-通过，2-不通过

  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'primary',
    title,

    onOk() {
      // 调用审核接口
      inboundAndOutboundDocumentsAreAudited({
        formId: row.id,
        auditState: statusCode,
      }).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload(); // 刷新列表
      });
    },
  });
}

// endregion

// region 权限控制

/**
 * 当前页面按钮权限列表
 * 根据权限控制按钮显示/隐藏
 */
const author = ref<string[]>([]);

// endregion

// region 页面初始化

/**
 * 页面挂载时执行初始化操作
 * 主要是获取用户权限信息
 */
onMounted(() => {
  // 查询当前页面权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// endregion
</script>

<template>
  <Page>
    <!-- region 顶部搜索区域 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 单据编号 -->
        <FormItem
          :label="$t('storeManagement.ioBillManagement.ioBillCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.formCode" />
        </FormItem>

        <!-- 单据类型 -->
        <FormItem
          :label="$t('storeManagement.ioBillManagement.ioBillType')"
          style="margin-bottom: 1em"
        >
          <RadioGroup v-model:value="queryParams.enterOut" :options="outType" />
        </FormItem>

        <!-- 物料编码 -->
        <FormItem
          :label="$t('storeManagement.ioBillManagement.materialCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialCode" />
        </FormItem>

        <!-- 物料名称 -->
        <FormItem
          :label="$t('storeManagement.ioBillManagement.materialName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialName" />
        </FormItem>
        <!-- 时间范围 -->
        <FormItem
          :label="$t('useEnergyThroughoutTheEntireSection.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.searchTime" />
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

    <!-- region 主表格区域 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <!-- 新增按钮 -->
          <Button
            v-if="author.includes('新增')"
            type="primary"
            @click="editRow()"
          >
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
              @click="editRow(row, true)"
            />
          </Tooltip>
          <!-- 编辑按钮 -->
          <Tooltip v-if="row.auditState === -1 && author.includes('编辑')">
            <template #title>{{ $t('common.edit') }}</template>
            <Button
              :icon="h(MdiEditOutline, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="editRow(row)"
            />
          </Tooltip>

          <!-- 审核通过 -->
          <Tooltip v-if="row.auditState === -1 && author.includes('审核')">
            <template #title>{{ $t('common.pass') }}</template>
            <Button
              :icon="h(MdiSuccess, { class: 'inline-block size-6' })"
              :loading="row.loading"
              class="mr-4"
              type="link"
              @click="handleAudit(row, true)"
            />
          </Tooltip>

          <!-- 审核不通过 -->
          <Tooltip v-if="row.auditState === -1 && author.includes('审核')">
            <template #title>{{ $t('common.noPass') }}</template>
            <Button
              :icon="
                h(IconParkSolidError, {
                  class: 'inline-block size-6 text-red-600',
                })
              "
              class="mr-4"
              type="link"
              @click="handleAudit(row, false)"
            />
          </Tooltip>

          <!-- 删除数据 -->
          <Tooltip v-if="row.auditState === -1 && author.includes('删除')">
            <template #title>{{ $t('common.delete') }}</template>
            <Button
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

    <!-- region 单据新增/编辑抽屉 -->
    <Drawer
      v-model:open="showEditDrawer"
      :footer-style="{ textAlign: 'right' }"
      height="80%"
      class="custom-class"
      placement="top"
      title="基本信息"
      @close="onClose"
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
        <Row>
          <Col :span="12">
            <!-- 单据时间 -->
            <FormItem
              :label="$t('storeManagement.ioBillManagement.time')"
              name="operateDate"
            >
              <DatePicker
                v-model:value="checkedRow.operateDate"
                class="w-full"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 单据类型 -->
            <FormItem
              :label="$t('storeManagement.ioBillManagement.type')"
              name="enterType"
            >
              <RadioGroup
                v-model:value="checkedRow.enterType"
                :options="documentType"
                :disabled="!!checkedRow.id"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 操作类型 -->
            <FormItem
              :label="$t('storeManagement.ioBillManagement.opType')"
              name="outType"
            >
              <RadioGroup
                v-model:value="checkedRow.outType"
                :options="
                  checkedRow.enterType === 1 ? operateType1 : operateType2
                "
              />
            </FormItem>
          </Col>
          <Col :span="12" v-if="checkedRow.enterType === 1">
            <!-- 班次 -->
            <FormItem
              :label="$t('storeManagement.ioBillManagement.shifts')"
              name="classType"
            >
              <Input v-model:value="checkedRow.classType" />
            </FormItem>
          </Col>
          <Col :span="12" v-if="checkedRow.enterType === 1">
            <!-- 批号 -->
            <FormItem
              :label="$t('storeManagement.ioBillManagement.batch')"
              name="batchCode"
            >
              <Input v-model:value="checkedRow.batchCode" />
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div>
        <AddGrid>
          <!-- 表格工具栏工具区域，显示切换和添加按钮 -->
          <template #toolbar-tools>
            <!-- 添加按钮，点击后在表格中添加新行 -->
            <Button
              type="primary"
              class="mr-4"
              @click="openEditDrawer()"
              v-if="!showViewDrawer"
            >
              {{ $t('common.add') }}
            </Button>
          </template>
          <template #action="{ row }">
            <!-- 编辑按钮 -->
            <Tooltip>
              <template #title>{{ $t('common.edit') }}</template>
              <Button
                class="mr-4"
                type="link"
                @click="openEditDrawer(row)"
                v-if="!showViewDrawer"
              >
                <template #icon>
                  <Icon
                    icon="mdi:edit-outline"
                    class="inline-block align-middle text-2xl"
                  />
                </template>
              </Button>
            </Tooltip>

            <!-- 删除数据 -->
            <Tooltip>
              <template #title>{{ $t('common.delete') }}</template>
              <Button
                danger
                type="link"
                @click="delDetails(row)"
                v-if="!showViewDrawer"
              >
                <template #icon>
                  <Icon
                    icon="mdi-light:delete"
                    class="inline-block align-middle text-2xl"
                  />
                </template>
              </Button>
            </Tooltip>
          </template>
        </AddGrid>
      </div>

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

    <Drawer
      v-model:open="isShowTableDetails"
      :footer-style="{ textAlign: 'right' }"
      :width="500"
      class="custom-class"
      placement="right"
      title="信息编辑"
      @close="closeEditDrawer"
    >
      <Form
        ref="detailsRef"
        :label-col="{ span: 8 }"
        :model="detailsState"
        :rules="detailsRules"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        name="editMessageForm"
      >
        <!-- 物料编码 -->
        <FormItem
          :label="$t('storeManagement.ioBillManagement.materialCode')"
          name="materialCode"
        >
          <Select
            v-model:value="detailsState.materialCode"
            show-search
            :placeholder="$t('ui.formRules.selectRequired')"
            style="width: 200px"
            :default-active-first-option="false"
            :show-arrow="false"
            :filter-option="false"
            :field-names="{ label: 'title', value: 'materialCode' }"
            :not-found-content="fetching ? undefined : null"
            :options="listOfMaterialNumbers"
            @search="listOfMaterialNumbersSearchThrottling"
            @change="workorderCodeChange"
            class="!w-full"
          >
            <template v-if="fetching" #notFoundContent>
              <Spin size="small" />
            </template>
          </Select>
        </FormItem>
        <!-- 物料特征ID -->
        <FormItem
          :label="$t('storeManagement.ioBillManagement.materialFeatureId')"
          name="materialDescriptionId"
        >
          <Input
            v-model:value="detailsState.materialDescriptionId"
            class="mr-2 w-[70%]"
            readonly
          />
          <Button @click="isShowCharacteristics = true" type="primary">
            {{ $t('ui.widgets.search.select') }}
          </Button>
        </FormItem>
        <!-- 数量 -->
        <FormItem
          :label="$t('storeManagement.ioBillManagement.number')"
          name="number"
        >
          <InputNumber v-model:value="detailsState.number" />
        </FormItem>
        <!-- 供应商名称 -->
        <FormItem
          :label="$t('storeManagement.ioBillManagement.supplierName')"
          name="manufacturerName"
        >
          <Input v-model:value="detailsState.manufacturerName" />
        </FormItem>
        <!-- 绑定单号 -->
        <FormItem
          :label="$t('storeManagement.ioBillManagement.bindBillCode')"
          name="contractCode"
        >
          <Input v-model:value="detailsState.contractCode" />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="isShowCharacteristics = false">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="detailsSubmit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <Drawer
      v-model:open="isShowCharacteristics"
      :footer-style="{ textAlign: 'right' }"
      :width="400"
      class="custom-class"
      placement="right"
      title="特性选择"
    >
      <JsonViewer
        v-for="item of materialCharacteristics"
        :key="item.id"
        :memo="item.id"
        :value="item.description"
        class="mb-4"
        :class="{
          '!border-4 !border-green-500 shadow-lg':
            detailsState.materialDescriptionId === item.id,
        }"
        boxed
        sort
        theme="light"
        @click="selectMaterialCharacteristics(item.id)"
      />
    </Drawer>
  </Page>
</template>

<style scoped></style>
