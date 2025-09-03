<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { hiprint } from 'vue-plugin-hiprint';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import {
  MdiEditOutline,
  MdiEyeOutline,
  MdiLightDelete,
  MdiSearch,
} from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Col,
  DatePicker,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  RadioGroup,
  RangePicker,
  Row,
  Select,
  Space,
  Tooltip,
  TreeSelect,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  listWarehouseCodeByOrgCode,
  offlineSideWarehouseTransferAndIssuance,
  queryOrganizationTree,
  queryPrintTemplateDetails,
  queryStoreRequisition,
  queryStoreRequisitionDetail,
  storeRequisitionDelete,
  storeRequisitionInsert,
  storeRequisitionLock,
  storeRequisitionSuspend,
  storeRequisitionUpdate,
  warehouseRecordWarehouseRecordStoreNumber,
  wholeOrderDelete,
} from '#/api';
import {
  MATERIAL_REQUISITION_STATUS_TYPE,
  queryAuth,
  TYPE_OF_MATERIAL_REQUISITION_PROGRESS,
} from '#/util';
import MaterialSelection from '#/util/component/materialSelection.vue';

// 路由信息
const route = useRoute();
// region 表格

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { type: 'checkbox', width: 60 },
    {
      field: 'isFinish',
      slots: { default: 'selectedState' },
      title: '完成',
      minWidth: 50,
    },
    {
      field: 'isSuspend',
      slots: { default: 'selectedState' },
      title: '中止',
      minWidth: 50,
    },
    {
      field: 'isSign',
      slots: { default: 'selectedState' },
      title: '签发',
      minWidth: 50,
    },
    {
      field: 'isLock',
      slots: { default: 'selectedState' },
      title: '锁定',
      minWidth: 50,
    },
    { field: 'applyCode', title: '申请编号', minWidth: 150 },
    { field: 'applyDate', title: '申请日期', minWidth: 150 },
    { field: 'requireDate', title: '需求日期', minWidth: 150 },
    { field: 'applyTypeName', title: '申请类别', minWidth: 150 },
    { field: 'materialCode', title: '材料编号', minWidth: 150 },
    { field: 'materialName', title: '材料名称', minWidth: 250 },
    { field: 'unit', title: '单位', minWidth: 150 },
    {
      field: 'applyNumber',
      title: '申请数量',
      minWidth: 150,
    },
    { field: 'receiveNumber', title: '实际发料数量', minWidth: 150 },
    { field: 'unclaimedQuantity', title: '未领数量', minWidth: 150 },
    { field: 'remark', title: '备注说明', minWidth: 250 },
    { field: 'planCode', title: '计划号', minWidth: 150 },
    { field: 'username', title: '所属用户', minWidth: 150 },
    { field: 'applyOrgName', title: '申请部门', minWidth: 150 },
    { field: 'dutyOrgName', title: '责任部门', minWidth: 150 },
    { field: 'lockPerson', title: '锁定人', minWidth: 150 },
    { field: 'lockTime', title: '锁定时间', minWidth: 150 },
    { field: 'signPersonName', title: '签发人', minWidth: 150 },
    { field: 'signTime', title: '签发时间', minWidth: 150 },
    { field: 'suspendPersonName', title: '中止人', minWidth: 150 },
    { field: 'suspendTime', title: '中止时间', minWidth: 150 },
    { field: 'operatorName', title: '操作人', minWidth: 150 },
    { field: 'operateTime', title: '操作时间', minWidth: 150 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 250,
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
  scrollY: {
    enabled: true,
    gt: 30,
  },
  scrollX: {
    enabled: true,
    gt: 0,
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// 查询参数
const queryParams = ref<any>({
  workstationCode: '',
  workstationName: '',
});

/**
 * 从服务器查询工作站数据的函数。
 * @param {object} page - 查询参数，页码
 * @param {object} pageSize - 查询参数，每页大小
 * @returns {Promise} - 包含总条数和数据列表的 Promise 对象。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams.value, // 展开 queryParams.value 中的所有查询参数
      pageNum: page, // 当前页码
      pageSize, // 每页显示的数据条数
    };

    if (params.times) {
      params.applyDateStart = params.times[0].format('YYYY-MM-DD');
      params.applyDateEnd = params.times[1].format('YYYY-MM-DD');
      params.times = undefined;
    }
    params.applyType = 20;

    // 调用 queryWorkstation API 函数，传递查询参数和分页信息
    queryStoreRequisition(params)
      .then(({ total, results }) => {
        results.forEach((item: any) => {
          item.unclaimedQuantity = item.applyNumber - item.receiveNumber;
        });
        // 成功获取数据后，更新数据列表和总条数
        resolve({
          total, // 总条数
          items: results, // 数据列表
        });
      })
      .catch((error) => {
        // 处理错误
        reject(error);
      });
  });
}

/**
 * 删除
 * @param row 行对象
 */
function delRow(row?: any) {
  // 弹出确认框，询问用户是否确认删除该行数据
  Modal.confirm({
    // 取消按钮的文本
    cancelText: '取消',
    // 确认按钮的文本
    okText: '确认',
    // 确认按钮的类型（此处为危险操作，通常用于删除等不可逆操作）
    okType: 'danger',

    // 用户取消操作时触发的回调函数
    onCancel() {
      // 弹出警告提示，提示用户取消了删除操作
      message.warning('已取消删除!');
    },

    // 用户确认操作时触发的回调函数
    onOk() {
      // 调用删除按钮的操作，传递按钮的编码和类型参数
      storeRequisitionDelete(row.id)
        .then(() => {
          // 如果删除操作成功，显示操作成功的提示信息
          message.success($t('common.successfulOperation')); // 成功操作的提示信息（通过国际化处理）

          gridApi.query();
        })
        .catch((error) => {
          // 如果删除操作失败，显示错误提示信息
          message.error($t('common.operationFailure')); // 操作失败的提示信息（通过国际化处理）

          // 显示具体的错误信息
          message.error(error.msg); // 显示从服务器返回的错误消息
        });
    },

    // 确认框的标题文本
    title: '是否确认删除该条数据?',
  });
}

// endregion

// region 新增/编辑/删除
// 是否显示编辑抽屉
const showEditDrawer = ref(false);
// 当前编辑对象
const editMessage = ref<any>({});
// 当前编辑对象校验规则
const editRules = ref<any>([]);
// 是否为只读状态
const isReadOnly = ref(false);

// 新增/编辑表格配置
const addOrUpdateGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'applyTypeName',
      slots: { default: 'applyTypeName' },
      title: '申请类别',
      minWidth: 200,
    },
    {
      field: 'materialCode',
      title: '材料编号',
      minWidth: 150,
    },
    {
      field: 'applyCode',
      slots: { default: 'materialName' },
      title: '材料名称',
      minWidth: 350,
    },
    { field: 'unit', title: '单位', minWidth: 150 },
    {
      field: 'applyNumber',
      slots: { default: 'applyNumberStorage' },
      title: '申请数量',
      minWidth: 150,
    },
    {
      field: 'planCode',
      slots: { default: 'planCode' },
      title: '工单号',
      minWidth: 200,
    },
    { field: 'storeNumber', title: '库存数量', minWidth: 250 },
    {
      field: 'receiveNumber',
      slots: { default: 'receiveNumber' },
      title: '实际发料数量',
      minWidth: 150,
    },
    {
      field: 'remarkArr1',
      slots: { default: 'storageLocation' },
      title: '库位',
      minWidth: 150,
    },
    {
      field: 'remarkArr2',
      slots: { default: 'actualStorage' },
      title: '储位',
      minWidth: 150,
    },
    {
      field: 'remarkArr3',
      slots: { default: 'batchNumber' },
      title: '批次号',
      minWidth: 150,
    },
    {
      field: 'remarkArr4',
      slots: { default: 'moistureContent' },
      title: '含水率',
      minWidth: 150,
    },
    {
      slots: { default: 'lineSideWarehouseLocation' },
      title: '线边仓库位',
      minWidth: 150,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 120,
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryDetails();
      },
    },
  },
  scrollY: {
    enabled: true,
    gt: 30,
  },
  scrollX: {
    enabled: true,
    gt: 0,
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};
// 新增/编辑 表格对象及api
const [addOrUpdateGrid, addOrUpdateGridApi] = useVbenVxeGrid({
  gridOptions: addOrUpdateGridOptions,
});

/**
 * 显示编辑抽屉
 * @param row 行对象
 * @param readOnly 当前是否只读
 */
function editRow(row?: any, readOnly = false) {
  editMessage.value = row ? { ...row } : {};
  isReadOnly.value = readOnly;
  showEditDrawer.value = true;
  editMessage.value.requireDate = null;
  queryLineSideWarehouseLocation();
  if (addOrUpdateGridApi) {
    addOrUpdateGridApi.reload();
  }
}

/**
 * 查询详情
 */
function queryDetails() {
  return new Promise((resolve, _reject) => {
    if (editMessage.value.id) {
      queryStoreRequisitionDetail(editMessage.value.id).then((response) => {
        const respData: any = { ...response };
        // 定义要复制的字段数组
        const fieldsToCopy = [
          'applyCode',
          'applyDate',
          'requireDate',
          'username',
          'userId',
          'applyOrgCode',
          'applyOrgName',
          'dutyOrgCode',
          'dutyOrgName',
          'materialCode',
          'materialName',
        ];
        editMessage.value = {};
        // 遍历每个字段并复制到a
        fieldsToCopy.forEach((key: string) => {
          editMessage.value[key] = respData[key];
        });
        if (respData.requireDate) {
          editMessage.value.requireDate = dayjs(
            respData.requireDate,
            'YYYY-MM-DD',
          );
        }
        editMessage.value.id = respData.storesRequisitionId;
        respData.remarkArr = respData.remark ? respData.remark.split(',') : [];

        resolve({
          total: response.total,
          items: [respData],
        });
      });
    } else {
      resolve({
        total: 0,
        items: [],
      });
    }
  });
}

/**
 * 删除详情
 * @param row
 */
function delDetailRow(row: any) {
  // 弹出确认框，询问用户是否确认删除该行数据
  Modal.confirm({
    // 取消按钮的文本
    cancelText: '取消',
    // 确认按钮的文本
    okText: '确认',
    // 确认按钮的类型（此处为危险操作，通常用于删除等不可逆操作）
    okType: 'danger',

    // 用户取消操作时触发的回调函数
    onCancel() {
      // 弹出警告提示，提示用户取消了删除操作
      message.warning('已取消删除!');
    },

    // 用户确认操作时触发的回调函数
    onOk() {
      addOrUpdateGridApi.grid.remove(row);
      message.success('删除成功!');
    },

    // 确认框的标题文本
    title: '是否确认删除该条数据?',
  });
}

/**
 * 新增一行
 */
function addRow() {
  addOrUpdateGridApi.grid.insert({
    applyType: 20,
    applyTypeName: '线边仓调拨',
    remarkArr: [],
  });
}

// 提交的加载状态
const submitLoading = ref(false);
/**
 * 提交
 */
function submit() {
  const tableData = addOrUpdateGridApi.grid.getTableData().tableData;
  tableData.forEach((row: any) => {
    if (!row.materialCode) {
      message.error('请先维护具体的材料!');
      return false;
    }
    row.remark = row.remarkArr.join(',');
  });

  const params: any = {
    ...editMessage.value,
    detailList: [...tableData],
  };
  if (params.requireDate) {
    params.requireDate = params.requireDate.format('YYYY-MM-DD');
  }
  if (!params.receiveNumberList) {
    params.receiveNumberList = [];
  }

  submitLoading.value = true;
  const ob: any = editMessage.value.id
    ? storeRequisitionUpdate(params)
    : storeRequisitionInsert(params);
  ob.then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.query();
    close();
  }).finally(() => {
    submitLoading.value = false;
  });
}

/**
 * 关闭抽屉
 */
function close() {
  showEditDrawer.value = false;
  addOrUpdateGridApi.grid.remove();
  editMessage.value = {};
}

// endregion

// region 线边仓查询
// 线边仓列表
const listOfLineSideWarehouses = ref<any>([]);
/**
 * 查询线边仓
 */
function queryLineSideWarehouseLocation() {
  listWarehouseCodeByOrgCode(editMessage.value.applyOrgCode).then(
    (data: any) => {
      listOfLineSideWarehouses.value = [];
      data.forEach((line: any) => {
        listOfLineSideWarehouses.value.push({
          label: line.equipmentName,
          value: line.equipmentCode,
        });
      });
    },
  );
}

// endregion

// region 材料选择
// 是否显示材料选择抽屉
const selectMaterialDrawer = ref(false);
// 当前编辑需要选择的行对象
const selectMaterialMessage = ref<any>({});
// 物料选择的加载状态
const selectMaterialLoading = ref<any>(false);
// 选中的物料
const selectedMaterial = ref<any>({});
/**
 * 显示
 * @param row
 */
function showSelectMaterial(row: any) {
  selectMaterialDrawer.value = true;
  selectMaterialMessage.value = row;
}

/**
 * 选择材料改变
 * @param material 材料
 */
function materialChange(material: any) {
  selectedMaterial.value = material;
}

/**
 * 选择物料, 并查询数量
 */
function selectedMaterialFun() {
  warehouseRecordWarehouseRecordStoreNumber(
    selectedMaterial.value.materialCode,
  ).then((data: any) => {
    // 定义要复制的字段数组
    const fieldsToCopy = ['materialCode', 'materialName', 'unit'];
    // 遍历每个字段并复制到a
    fieldsToCopy.forEach((key: string) => {
      selectMaterialMessage.value[key] = selectedMaterial.value[key];
    });
    selectMaterialMessage.value.storeNumber = data;
    if (selectMaterialMessage.value.applyType === 18) {
      selectMaterialMessage.value.unit = '片';
    }
    selectMaterialClose();
  });
}

/**
 * 物料选择抽屉关闭
 */
function selectMaterialClose() {
  selectMaterialDrawer.value = false;
  selectMaterialLoading.value = false;
  selectMaterialMessage.value = {};
}

// endregion

// region 表格上方操作
/**
 * 获取选中的id
 */
function getIds() {
  const selectedRows = gridApi.grid.getCheckboxRecords();
  if (selectedRows.length > 0) {
    return selectedRows.map((item: any) => item.id);
  } else {
    message.warning('请至少选中一条数据进行操作!');
    return [];
  }
}

/**
 * 锁定
 */
function lock(bol = false) {
  const ids = getIds();
  if (ids.length > 0) {
    storeRequisitionLock(ids, bol).then(() => {
      message.success($t('common.successfulOperation'));
      gridApi.query();
    });
  }
}
/**
 * 签发
 */
function signAndIssue(bol = false) {
  const ids = getIds();
  if (ids.length > 0) {
    offlineSideWarehouseTransferAndIssuance(ids, bol).then(() => {
      message.success($t('common.successfulOperation'));
      gridApi.query();
    });
  }
}

/**
 * 中止
 */
function abort() {
  const ids = getIds();
  if (ids.length > 0) {
    storeRequisitionSuspend(ids).then(() => {
      message.success($t('common.successfulOperation'));
    });
  }
}

/**
 * 取消中止
 */
function storeRequisitionCancelSuspend() {
  const ids = getIds();
  if (ids.length > 0) {
    storeRequisitionSuspend(ids).then(() => {
      message.success($t('common.successfulOperation'));
    });
  }
}

/**
 * 打印
 */
function printFile() {
  // 当前选中的数据
  const selectedRows = gridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请至少选择一条数据!');
    return;
  }

  // 当前选中的申请编号
  let applyCode = '';
  // 当前选中的申请编号是否一致, 如果不一致就不进行打印并提示错误信息
  let accord = true;
  // 是否是半成品申请
  let semiFinishedProduct = false;
  selectedRows.forEach((row: any) => {
    if (applyCode) {
      if (row.applyCode !== applyCode) {
        accord = false;
        return false;
      }
    } else {
      applyCode = row.applyCode;
      semiFinishedProduct = row.applyType === 18;
    }
  });
  if (accord) {
    // 打印数据包装
    let data: any;
    let ob: any;
    if (semiFinishedProduct) {
      selectedRows.forEach((row: any) => {
        row.lv = 'P';
      });
      data = {
        time: dayjs().format('YYYY年MM月DD日'),
        materialRequisitionNumber: selectedRows[0].applyCode,
        semiFinishedProduct: selectedRows,
      };
      ob = queryPrintTemplateDetails('semiFinishedProductPrinting');
    } else {
      selectedRows.forEach((row: any) => {
        if (row.remark) {
          const arr = row.remark.split(',');
          row.storageLocation = arr[1];
          row.lot = arr[2];
        }
      });
      data = {
        time: dayjs().format('YYYY年MM月DD日'),
        applyOrgCode: selectedRows[0].applyOrgCode,
        materialRequisitionNumber: selectedRows[0].applyCode,
        applyOrgName: selectedRows[0].applyOrgName,
        materialRequisition: selectedRows,
      };
      ob = queryPrintTemplateDetails('applyTemplate');
    }

    // 打印模板获取
    ob.then((res: any) => {
      try {
        const templateRef = JSON.parse(res.printData);
        const hiprintTemplate = new hiprint.PrintTemplate({
          template: templateRef,
        });
        hiprintTemplate.print(data, { leftOffset: -1, topOffset: -1 });
      } catch {
        console.error('模板解析失败');
      }
    });
  } else {
    message.warning('请选择同一单的数据进行打印!');
  }
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 部门查询

/**
 * 组织树
 */
const orgTreeDate = ref<any>([]);

/**
 * 查询部门
 */
function queryOrg() {
  queryOrganizationTree().then((data) => {
    // 检查返回的数据是否存在且长度大于0
    if (data) {
      // 如果数据有效，更新treeData
      orgTreeDate.value = [data];
    }
  });
}

// endregion

// region 整单删除
// 是否显示整单删除
const deleteTheEntireDisplay = ref(false);
// 单号
const oddNumber = ref('');

function del() {
  // 弹出确认框，询问用户是否确认删除该行数据
  Modal.confirm({
    // 取消按钮的文本
    cancelText: '取消',
    // 确认按钮的文本
    okText: '确认',
    // 确认按钮的类型（此处为危险操作，通常用于删除等不可逆操作）
    okType: 'danger',

    // 用户取消操作时触发的回调函数
    onCancel() {
      // 弹出警告提示，提示用户取消了删除操作
      message.warning('已取消删除!');
    },

    // 用户确认操作时触发的回调函数
    onOk() {
      // 调用删除按钮的操作，传递按钮的编码和类型参数
      wholeOrderDelete(oddNumber.value)
        .then(() => {
          // 如果删除操作成功，显示操作成功的提示信息
          message.success($t('common.successfulOperation')); // 成功操作的提示信息（通过国际化处理）

          gridApi.query();
        })
        .catch((error) => {
          // 如果删除操作失败，显示错误提示信息
          message.error($t('common.operationFailure')); // 操作失败的提示信息（通过国际化处理）

          // 显示具体的错误信息
          message.error(error.msg); // 显示从服务器返回的错误消息
        });
    },

    // 确认框的标题文本
    title: '是否确认删除该条数据?',
  });
}

// endregion

onMounted(async () => {
  try {
    queryAuth(route.meta.code as string).then((data) => {
      author.value = data;
    });
    queryOrg();
  } catch {
    // 统一处理错误
    message.error('数据加载失败，请重试');
  }
});
</script>

<template>
  <Page class="bg-background-deep">
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 申请编号 -->
        <FormItem
          :label="$t('storesRequisition.applicationNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.applyCode" />
        </FormItem>
        <!-- 申请日期 -->
        <FormItem
          :label="$t('storesRequisition.applicationDate')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.times" />
        </FormItem>
        <!-- 材料名称 -->
        <FormItem
          :label="$t('storesRequisition.materialName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialName" />
        </FormItem>
        <!-- 材料编号 -->
        <FormItem
          :label="$t('storesRequisition.materialNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialCode" />
        </FormItem>
        <!-- 领料进度 -->
        <FormItem
          :label="$t('storesRequisition.materialRequisitionProgress')"
          style="margin-bottom: 1em"
        >
          <CheckboxGroup
            v-model:value="queryParams.progress"
            :options="TYPE_OF_MATERIAL_REQUISITION_PROGRESS"
          />
        </FormItem>
        <!-- 领料状态 -->
        <FormItem
          :label="$t('storesRequisition.materialRequisitionStatus')"
          style="margin-bottom: 1em !important"
        >
          <RadioGroup
            v-model:value="queryParams.complete"
            :options="MATERIAL_REQUISITION_STATUS_TYPE"
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
          <Space>
            <!-- 打印按钮 -->
            <Button type="primary" @click="printFile()">
              {{ $t('common.print') }}
            </Button>
            <!-- 新增按钮 -->
            <Button
              v-if="author.includes('新增')"
              type="primary"
              @click="editRow()"
            >
              {{ $t('common.add') }}
            </Button>
            <!-- 整单删除 -->
            <Button
              v-if="author.includes('锁定')"
              type="primary"
              danger
              @click="deleteTheEntireDisplay = true"
            >
              {{ $t('common.blockDeletion') }}
            </Button>
            <!-- 锁定按钮 -->
            <Button v-if="author.includes('锁定')" @click="lock(true)">
              {{ $t('common.lock') }}
            </Button>
            <!-- 签发按钮 -->
            <Button v-if="author.includes('签发')" @click="signAndIssue(true)">
              {{ $t('common.signAndIssue') }}
            </Button>
            <!-- 取消锁定按钮 -->
            <Button v-if="author.includes('取消锁定')" @click="lock()">
              {{ $t('common.unlock') }}
            </Button>
            <!-- 取消签发按钮 -->
            <Button v-if="author.includes('取消签发')" @click="signAndIssue()">
              {{ $t('common.cancelIssuance') }}
            </Button>
            <!-- 中止按钮 -->
            <Button v-if="author.includes('中止')" @click="abort()">
              {{ $t('common.abort') }}
            </Button>
            <!-- 取消中止按钮 -->
            <Button
              v-if="author.includes('中止')"
              @click="storeRequisitionCancelSuspend()"
            >
              {{ $t('common.cancelAbort') }}
            </Button>
            <!-- ERP单据按钮 暂时不需要-->
            <!--            <Button
              v-if="author.includes('ERP单据')"
              type="primary"
              @click="editRow()"
            >
              {{ $t('common.erpDocument') }}
            </Button>-->
            <!-- 导出按钮 -->
            <Button
              v-if="author.includes('导出')"
              type="primary"
              @click="editRow()"
            >
              {{ $t('common.export') }}
            </Button>
          </Space>
        </template>
        <template #selectedState="{ row, column }">
          <Checkbox v-model:checked="row[column.field]" disabled />
        </template>
        <template #action="{ row }">
          <!-- 查看按钮 -->
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
          <Tooltip v-if="author.includes('编辑')">
            <template #title>{{ $t('common.edit') }}</template>
            <Button
              :icon="h(MdiEditOutline, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="editRow(row)"
            />
          </Tooltip>

          <!-- 删除数据 -->
          <Tooltip v-if="author.includes('删除')">
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

    <!-- region 新增/编辑 -->
    <Drawer
      v-model:open="showEditDrawer"
      :footer-style="{ textAlign: 'right' }"
      :height="500"
      placement="top"
      root-class-name="root-class-name"
      title="信息编辑"
      @close="close"
    >
      <Form
        :label-col="{ span: 8 }"
        :model="editMessage"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        name="editMessageForm"
        layout="inline"
      >
        <Row>
          <Col :span="24" class="mb-4">
            <!--            <Button class="mr-4" type="primary">计划导入</Button>-->
            <Button type="primary" @click="addRow">增加</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <!-- 申请编号 -->
            <FormItem
              :label="$t('storesRequisition.applicationNumber')"
              name="applyCode"
            >
              <Input v-model:value="editMessage.applyCode" disabled />
            </FormItem>
          </Col>
          <Col>
            <!-- 申请日期 -->
            <FormItem
              :label="$t('storesRequisition.applicationDate')"
              name="applyDate"
            >
              <Input v-model:value="editMessage.applyDate" disabled />
            </FormItem>
          </Col>
          <Col>
            <!-- 需求日期 -->
            <FormItem
              :label="$t('storesRequisition.demandDate')"
              name="requireDate"
            >
              <DatePicker
                v-model:value="editMessage.requireDate"
                :disabled="isReadOnly"
                format="YYYY-MM-DD"
              />
            </FormItem>
          </Col>
          <Col>
            <!-- 所属用户 -->
            <FormItem
              :label="$t('storesRequisition.owningUser')"
              name="username"
            >
              <Input v-model:value="editMessage.username" disabled />
            </FormItem>
          </Col>
          <Col>
            <!-- 申请部门 -->
            <FormItem
              :label="$t('storesRequisition.applicationDepartment')"
              name="applyOrgCode"
            >
              <TreeSelect
                v-model:value="editMessage.applyOrgCode"
                allow-clear
                show-search
                tree-default-expand-all
                tree-node-filter-prop="orgFullName"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                :disabled="isReadOnly"
                :tree-data="orgTreeDate"
                :field-names="{
                  children: 'children',
                  label: 'orgFullName',
                  value: 'orgCode',
                }"
                @change="
                  (value: any, labels: any) => {
                    editMessage.applyOrgCode = value;
                    editMessage.applyOrgName = labels[0];
                    addOrUpdateGridApi.grid.remove();
                    queryLineSideWarehouseLocation();
                  }
                "
                class="!w-48"
              />
            </FormItem>
          </Col>
          <Col>
            <!-- 责任部门 -->
            <FormItem
              :label="$t('storesRequisition.responsibleDepartment')"
              name="dutyOrgCode"
            >
              <TreeSelect
                v-model:value="editMessage.dutyOrgCode"
                allow-clear
                show-search
                tree-default-expand-all
                tree-node-filter-prop="orgFullName"
                :dropdown-match-select-width="false"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                :disabled="isReadOnly"
                :tree-data="orgTreeDate"
                :field-names="{
                  children: 'children',
                  label: 'orgFullName',
                  value: 'orgCode',
                }"
                @change="
                  (value: any, labels: any) => {
                    editMessage.dutyOrgCode = value;
                    editMessage.dutyOrgName = labels[0];
                  }
                "
                class="!w-48"
              />
            </FormItem>
          </Col>
        </Row>
      </Form>

      <addOrUpdateGrid>
        <template #materialName="{ row }">
          <Input v-model:value="row.materialName" class="mr-1 w-48" readonly />
          <Button
            :disabled="!editMessage.applyOrgCode || !row.applyType"
            type="primary"
            @click="showSelectMaterial(row)"
          >
            选择
          </Button>
        </template>
        <!-- 申领数量 -->
        <template #applyNumberStorage="{ row }">
          <Input v-model:value="row.applyNumber" :disabled="isReadOnly" />
        </template>
        <!-- 申领类别 -->
        <template #applyTypeName="{ row }">
          {{ row.applyTypeName }}
        </template>
        <!-- 实际发料数量 -->
        <template #receiveNumber="{ row }">
          <Input v-model:value="row.receiveNumber" :disabled="isReadOnly" />
        </template>
        <!-- 计划号 -->
        <template #planCode="{ row }">
          <Input v-model:value="row.planCode" :disabled="isReadOnly" />
        </template>
        <template #storageLocation="{ row }">
          <Input v-model:value="row.remarkArr[0]" :disabled="isReadOnly" />
        </template>
        <template #actualStorage="{ row }">
          <Input v-model:value="row.remarkArr[1]" :disabled="isReadOnly" />
        </template>
        <template #batchNumber="{ row }">
          <Input v-model:value="row.remarkArr[2]" :disabled="isReadOnly" />
        </template>
        <template #moistureContent="{ row }">
          <Input v-model:value="row.remarkArr[3]" :disabled="isReadOnly" />
        </template>
        <!-- 线边仓库位 -->
        <template #lineSideWarehouseLocation="{ row }">
          <Select
            v-model:value="row.remarkArr[4]"
            allow-clear
            :dropdown-match-select-width="false"
            :options="listOfLineSideWarehouses"
            :disabled="isReadOnly"
            class="w-full"
          />
        </template>
        <template #action="{ row }">
          <!-- 删除数据 -->
          <Tooltip v-if="author.includes('删除')">
            <template #title>{{ $t('common.delete') }}</template>
            <Button
              :icon="
                h(MdiLightDelete, {
                  class: 'inline-block size-6',
                })
              "
              danger
              type="link"
              @click="delDetailRow(row)"
            />
          </Tooltip>
        </template>
      </addOrUpdateGrid>

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
    <!-- endregion -->

    <!-- region 材料选择 -->
    <Drawer
      v-model:open="selectMaterialDrawer"
      :footer-style="{ textAlign: 'right' }"
      :height="500"
      placement="top"
      root-class-name="root-class-name"
      title="材料选择"
    >
      <MaterialSelection
        :apply-org-code="editMessage.applyOrgCode"
        :apply-material-type="selectMaterialMessage.applyType"
        v-if="selectMaterialDrawer"
        @changed="materialChange"
      />

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="selectMaterialClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button
            type="primary"
            @click="selectedMaterialFun"
            :loading="selectMaterialLoading"
          >
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->

    <Modal
      :open="deleteTheEntireDisplay"
      title="整单删除"
      @ok="del"
      @cancel="deleteTheEntireDisplay = false"
    >
      <Input v-model:value="oddNumber" />
    </Modal>
  </Page>
</template>

<style scoped></style>
