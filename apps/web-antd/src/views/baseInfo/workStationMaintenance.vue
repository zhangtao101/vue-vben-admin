<script setup lang="ts">
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import {
  HugeiconsMailSetting,
  IconParkSolidError,
  MaterialSymbolsDeleteOutline,
  MaterialSymbolsSearch,
  MdiSuccess,
  MingcuteEditLine,
  PhEyeLight,
  SaveOutline,
} from '@vben/icons';
import { $t } from '@vben/locales';
import { useAccessStore } from '@vben/stores';

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
  Table,
  Tooltip,
  Upload,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addWorkstation,
  delWorkstation,
  editWorkstation,
  getProceByParentId,
  getProceByType,
  queryWorkstation,
  workstationAudit,
  workstationUpdate,
} from '#/api';
import { queryAuth } from '#/util';
import EquipSelect from '#/util/component/equipSelect.vue';
import JobFlowConfiguration from '#/util/component/jobFlowConfiguration.vue';

// 路由信息
const route = useRoute();
// region 表格

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'workstationCode', title: '工作站编号', minWidth: 150 },
    { field: 'workstationName', title: '工作站名称', minWidth: 150 },
    { field: 'stationTypeName', title: '工作站类型', minWidth: 150 },
    { field: 'workstationIp', title: '工作站IP', minWidth: 150 },
    { field: 'auditStateName', title: '审核状态', minWidth: 150 },
    { field: 'auditTime', title: '审核时间', minWidth: 150 },
    { field: 'auditUser', title: '审核人', minWidth: 150 },
    {
      field: 'state',
      slots: { default: 'status' },
      title: '工作站状态',
      minWidth: 100,
    },
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

// 查询参数
const queryParams = ref<any>({
  workstationCode: '',
  workstationName: '',
});

/**
 * 从服务器查询工作站数据的函数。
 * @param {object} params - 查询参数，包含页码和每页大小。
 * @returns {Promise} - 包含总条数和数据列表的 Promise 对象。
 */
function queryData({ page, pageSize }) {
  return new Promise((resolve, reject) => {
    // 调用 queryWorkstation API 函数，传递查询参数和分页信息
    queryWorkstation({
      ...queryParams.value, // 展开 queryParams.value 中的所有查询参数
      pageNum: page, // 当前页码
      pageSize, // 每页显示的数据条数
    })
      .then(({ total, list }) => {
        // 成功获取数据后，更新数据列表和总条数
        resolve({
          total, // 总条数
          items: list, // 数据列表
        });
      })
      .catch((error) => {
        // 处理错误
        reject(error);
      });
  });
}

// endregion

// region 查看 / 编辑 / 新增 具体操作

// 当前选中的表格行
const checkedRow = ref<any>({});
// 是否显示查看详情抽屉
const showViewDrawer = ref(false);
// 是否显示编辑抽屉
const showEditDrawer = ref(false);

// 抽屉冲的form表单对象
const editForm = ref();
// form表单规则验证
const editRules = ref<any>({
  workstationCode: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  workstationName: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  workstationType: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
});

// 工作站类型
const workStationType = ref([
  {
    label: '工段工作站',
    value: 1,
  },
  {
    label: '工序工作站',
    value: 2,
  },
]);

// region 工作站明细
// 工作站明细列表
const workStationDetail = ref<any>([]);
// 工作站明细表头
const workStationDetailHeader = ref<any>([
  {
    dataIndex: 'step',
    ellipsis: true,
    title: '#',
    width: 30,
  },
  {
    dataIndex: 'processCode',
    ellipsis: true,
    title: '工序编号',
    width: 160,
  },
  {
    dataIndex: 'processName',
    ellipsis: true,
    title: '工序名称',
    width: 120,
  },
  {
    dataIndex: 'costCenterCode',
    ellipsis: true,
    title: '成本中心编号',
    width: 120,
  },
  {
    dataIndex: 'operation',
    ellipsis: true,
    fixed: 'right',
    title: '操作',
    width: 120,
  },
]);

// 表格滚动信息配置
const workStationDetailScroll = ref({
  scrollToFirstRowOnChange: true,
  y: 350,
});
// 工序详情加载状态
const workStationDetailLoading = ref(false);

// 联动的工序列表
const processList = ref<any[]>([]);
// 固定的工序列表
const procedureList = ref<any[]>([]);
// 工序列表加载状态
const processListLoading = ref(false);

/**
 * 根据工作站类型查询工序列表的函数。
 * 这个函数用于更新工序列表和插叙工序列表的状态。
 */
function queryProcessByType() {
  /**
   * 清空当前行对应的操作。
   * 将 checkedRow.value.correspondingOperation 设置为空字符串。
   */
  checkedRow.value.correspondingOperation = '';

  /**
   * 设置工序列表加载状态为 true。
   */
  processListLoading.value = true;

  /**
   * 调用 getProceByType 函数，传入工作站类型。
   * 这个函数返回一个 Promise 对象，我们使用 then 方法来处理成功的响应。
   */
  getProceByType(checkedRow.value.workstationType ?? 1)
    .then((data) => {
      /**
       * 如果响应数据存在，则处理数据。
       */
      if (!data) return;
      processList.value = []; // 清空当前的工序列表。
      /**
       * 遍历响应数据，并将每个工序项添加到工序列表中。
       * 每个工序项包含标签（processCode-processName）和值（id）。
       */
      for (const item of data) {
        processList.value.push({
          label: `${item.processCode}-${item.processName}`,
          value: item.id,
        });
      }
    })
    .finally(() => {
      /**
       * 不管查询成功还是失败，都设置工序列表加载状态为 false。
       */
      processListLoading.value = false;
    });

  /**
   * 查询插叙工序列表。
   * 这里硬编码了工作站类型为 2。
   */
  getProceByType(2)
    .then((data) => {
      /**
       * 如果响应数据存在，则处理数据。
       */
      if (!data) return;
      /**
       * 遍历响应数据，并将每个工序项添加到插叙工序列表中。
       * 每个工序项包含标签（processCode-processName）和值（processCode#@#processName#@#id）。
       */
      for (const item of data) {
        procedureList.value.push({
          label: `${item.processCode}-${item.processName}`,
          value: `${item.processCode}#@#${item.processName}#@#${item.id}`,
        });
      }
    })
    .finally(() => {
      /**
       * 不管查询成功还是失败，都设置工序列表加载状态为 false。
       */
      processListLoading.value = false;
    });
}

/**
 * 过滤选项的函数。
 * 这个函数用于确定给定的选项是否应该根据用户输入的字符串显示。
 *
 * @param {string} input - 用户输入的字符串，用于过滤选项。
 * @param {object} option - 单个选项对象，包含标签（label）等信息。
 * @returns {boolean} - 如果选项应该被显示，则返回 true；否则返回 false。
 */
function filterOption(input: string, option: any) {
  /**
   * 将选项的标签转换为小写，并检查是否包含用户输入的小写字符串。
   * 这个比较是大小写不敏感的，意味着它会匹配 "abc" 和 "ABC"。
   */
  return option.label.toLowerCase().includes(input.toLowerCase());
}

/**
 * 处理用户选择操作的函数。
 * 当用户从下拉列表中选择一个操作时，这个函数会被调用以更新行对象的属性。
 *
 * @param {object} row - 包含选中的工序信息的行对象。
 */
function selectOperation(row: any) {
  /**
   * 使用 split 方法将 selectedProcessCode 字符串按照 '#@#' 分隔符分割成数组。
   * 这个字符串格式可能是 "processCode#@#processName#@#id"。
   */
  const process = row.selectedProcessCode.split('#@#');

  /**
   * 从分割后的数组中提取工序代码，并赋值给 row 对象的 processCode 属性。
   */
  row.processCode = process[0];

  /**
   * 从分割后的数组中提取工序名称，并赋值给 row 对象的 processName 属性。
   */
  row.processName = process[1];

  /**
   * 从分割后的数组中提取工序 ID，并赋值给 row 对象的 id 属性。
   */
  row.id = process[2];

  /**
   * 设置 row 对象的 isProcessCodeEdit 属性为 false。
   * 这通常表示用户完成了编辑或者选择了一个选项后，编辑状态应该被关闭。
   */
  row.isProcessCodeEdit = false;
}

/**
 * 查询工作站详细信息的函数。
 * 这个函数用于根据选中的操作查询工作站的详细信息，并更新组件的状态。
 */
function queryProcessDetails() {
  /**
   * 检查是否有对应的操作被选中。
   * 如果 checkedRow.value.correspondingOperation 为空，则直接返回，不执行查询。
   */
  if (!checkedRow.value.correspondingOperation) return;

  /**
   * 设置工作站详细信息的加载状态为 true。
   * 这通常用于显示加载指示器，告知用户数据正在加载中。
   */
  workStationDetailLoading.value = true;

  /**
   * 调用 getProceByParentId 函数，传入选中的操作 ID。
   * 这个函数返回一个 Promise 对象，我们使用 then 方法来处理成功的响应。
   */
  getProceByParentId(checkedRow.value.correspondingOperation)
    .then((data) => {
      data.forEach((item: any) => (item.isCostCenterCodeEdit = true));
      /**
       * 如果响应成功，将获取到的工作站详细信息赋值给 workStationDetail.value。
       * 这样，组件就可以使用这些信息进行渲染。
       */
      workStationDetail.value = data;
    })
    .finally(() => {
      /**
       * 不管查询成功还是失败，都设置工作站详细信息的加载状态为 false。
       * 这用于隐藏加载指示器，告知用户数据加载已完成。
       */
      workStationDetailLoading.value = false;
    });
}

/**
 * 向工作站详细信息列表中添加新条目的函数。
 * 这个函数用于在工作站详细信息数组中添加一个新的对象，
 * 该对象表示一个新的工作站详细信息条目，并初始化其编辑状态。
 */
function addWorkStationDetail() {
  /**
   * 使用 push 方法向 workStationDetail.value 数组中添加一个新的对象。
   * 这个新对象包含两个属性：isCostCenterCodeEdit 和 isProcessCodeEdit，
   * 它们都被初始化为 true，表示新添加的条目处于编辑状态。
   */
  workStationDetail.value.push({
    equipCodeList: [], // 设备编码列表，初始化为空数组。
    isCostCenterCodeEdit: true, // 成本中心代码编辑状态，初始化为 true。
    isProcessCodeEdit: true, // 工序代码编辑状态，初始化为 true。
  });
}

/**
 * 删除工作站详细信息条目的函数。
 * 这个函数用于在用户确认后从工作站详细信息数组中删除指定索引位置的条目。
 *
 * @param {number} index - 要删除条目的索引位置。
 */
function delWorkStationDetail(index: number) {
  /**
   * 调用 Modal.confirm 方法显示一个确认对话框。
   * 用户可以选择取消或确认删除操作。
   */
  Modal.confirm({
    /**
     * 设置取消按钮的文本为 '取消'。
     */
    cancelText: '取消',
    /**
     * 设置确认按钮的文本为 '确认'。
     */
    okText: '确认',
    /**
     * 设置确认按钮的类型为 'danger'，通常用于表示这是一个危险的操作。
     */
    okType: 'danger',
    /**
     * 定义取消操作的回调函数。
     * 如果用户点击取消按钮，显示一条警告消息。
     */
    onCancel() {
      message.warning('已取消删除!');
    },
    /**
     * 定义确认操作的回调函数。
     * 如果用户点击确认按钮，从 workStationDetail.value 数组中删除指定索引位置的条目。
     */
    onOk() {
      workStationDetail.value.splice(index, 1);
    },
    /**
     * 设置对话框的标题为 '是否确认删除该条数据?'。
     */
    title: '是否确认删除该条数据?',
  });
}

// 工序详情抽屉是否显示
const processDrawerDisplay = ref(false);
const parentId = ref(0);
// 表格当前选中行
const selectedRow = ref<any>({});
/**
 * 显示工序配置抽屉
 */
function showJobFlowConfiguration(row: any) {
  processDrawerDisplay.value = true;
  parentId.value = row.id;
  selectedRow.value = row;
}

// endregion
const isShowStatus = ref(false);
/**
 * 处理编辑行的函数。
 * 这个函数用于设置编辑状态，并显示编辑抽屉。
 *
 * @param {object} row - 可选参数，表示要编辑的行对象。
 * @param {object} isShow - 可选参数，表示是否处于查看状态。
 */
function editRow(row?: any, isShow?: boolean) {
  isShowStatus.value = isShow ?? false;
  /**
   * 如果传入了 row 参数，则更新 checkedRow.value 对象。
   * 使用了展开运算符 (...) 来复制 row 对象的所有属性，
   * 创建了 row 的一个浅拷贝，并赋值给 checkedRow.value。
   * 如果没有传入 row 参数，则 checkedRow.value 被设置为一个空对象。
   */
  checkedRow.value = row
    ? {
        ...row,
      }
    : {};

  /**
   * 如果传入了 row 参数，并且 row 包含 bindingdtos 数组，
   * 则更新 workStationDetail.value 数组为 row.bindingdtos 数组的副本。
   * 使用了扩展运算符 (...) 来创建数组的副本，避免直接修改原数组。
   */
  if (row) {
    workStationDetail.value = [...row.bindingdtos];
  }

  /**
   * 设置 showEditDrawer.value 为 true，显示编辑抽屉。
   * 这通常与一个响应式变量相关联，控制抽屉组件的显示与隐藏。
   */
  showEditDrawer.value = true;
}

/**
 * 删除特定行数据的函数。
 * 这个函数用于显示一个确认对话框，并在用户确认后删除指定的行数据。
 *
 * @param {object} row - 表示要删除的行对象。
 */
function delRow(row: any) {
  /**
   * 调用 Modal.confirm 方法显示一个确认对话框。
   * 用户可以选择取消或确认删除操作。
   */
  Modal.confirm({
    /**
     * 设置取消按钮的文本为 '取消'。
     */
    cancelText: '取消',
    /**
     * 设置确认按钮的文本为 '确认'。
     */
    okText: '确认',
    /**
     * 设置确认按钮的类型为 'danger'，通常用于表示这是一个危险的操作。
     */
    okType: 'danger',
    /**
     * 定义取消操作的回调函数。
     * 如果用户点击取消按钮，显示一条警告消息。
     */
    onCancel() {
      message.warning('已取消删除!');
    },
    /**
     * 定义确认操作的回调函数。
     * 如果用户点击确认按钮，调用 delWorkstation 函数删除工作站，并处理结果。
     */
    onOk() {
      /**
       * 调用 delWorkstation 函数，传入 row 对象的 id 属性。
       * 这个函数返回一个 Promise 对象，我们使用 then 方法来处理成功的响应。
       */
      delWorkstation(row.id)
        .then(() => {
          /**
           * 如果删除成功，显示操作成功的提示信息。
           * 使用 $t 函数获取本地化的文本。
           */
          message.success($t('common.successfulOperation'));

          gridApi.query();
        })
        .catch((error) => {
          /**
           * 如果删除失败，首先显示操作失败的通用提示信息。
           * 然后显示具体的错误信息，通常这些信息是从服务器返回的。
           */
          message.error($t('common.operationFailure'));
          message.error(error.msg); // 显示具体的错误信息。
        });
    },
    /**
     * 设置对话框的标题为 '是否确认删除该条数据?'。
     */
    title: '是否确认删除该条数据?',
  });
}

/**
 * 关闭编辑抽屉
 */
function onClose() {
  checkedRow.value = {};
  workStationDetail.value = [];
  showViewDrawer.value = false;
  showEditDrawer.value = false;
  isShowStatus.value = false;
}

/**
 * 提交表单数据的函数。
 * 验证表单数据的有效性，构建提交参数，并处理提交结果。
 */
function submit() {
  // 如果显示状态，则关闭表单并终止函数执行
  if (isShowStatus.value) {
    onClose();
    return;
  }

  // 验证表单并构建提交参数
  editForm.value.validate().then(() => {
    // 复制 checkedRow.value 对象的所有属性作为提交参数
    const params = { ...checkedRow.value };
    // 初始化绑定 VM 数组
    params.bindingVMs = [];

    // 遍历工作站详情数组，构建绑定 VM 数组
    workStationDetail.value.forEach((item: any, index: number) => {
      if (!item.costCenterCode) {
        throw new Error($t('ui.fallback.costCenterError'));
      }
      params.bindingVMs.push({
        costCenterCode: item.costCenterCode,
        details: item.details || [],
        equipCodeList: item.equipCodeList || [],
        orderNo: index,
        processCode: item.processCode,
        processName: item.processName,
        workstationCode: params.workstationCode,
      });
    });

    // 将 bindingdtos 设置为 undefined
    params.bindingdtos = undefined;

    // 根据 params 对象中是否有 id 属性来决定是编辑还是添加工作站
    const operation = params.id ? editWorkstation : addWorkstation;
    // 执行操作并处理结果
    operation(params).then(() => {
      // 提交成功，更新数据列表并关闭编辑抽屉
      gridApi.query();
      message.success($t('common.successfulOperation'));
      onClose();
    });
  });
}

// endregion

// region 设备选择
// 设备选择抽屉是否显示
const equipDrawer = ref(false);
// 选中的设备列表
const equipCodeList = ref<string[]>([]);
/**
 * 显示设备选择的函数。
 * 这个函数通常用于打开一个设备选择对话框，让用户选择设备。
 */
function showEquipSelect(row: any) {
  equipCodeList.value = row.equipCodeList;
  selectedRow.value = row;
  equipDrawer.value = true;
}

/**
 * 处理装备代码变更的函数。
 * 当装备代码列表发生变化时，此函数会更新选中行的装备代码列表，并清空全局装备代码列表。
 *
 * @param {any} codeList - 新的装备代码列表。
 */
function equipCodeChange(codeList: any) {
  // 更新选中行的装备代码列表为传入的新列表
  selectedRow.value.equipCodeList = codeList;

  // 清空全局装备代码列表
  equipCodeList.value = [];
}

/**
 * 设备列表选择改变回调函数。
 * @param process
 */
function processDrawerChange(process: any) {
  selectedRow.value.details = process;
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
  `/ht/${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/uploadExcel`,
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

// region 审核

/**
 * 处理审核操作（通过或不通过）。
 * @param row 要处理的审核数据对象，包含需要审核的数据信息。
 * @param isPass 布尔值，指示是否通过审核。为 true 时表示通过审核，false 表示不通过审核。
 */
function handleAudit(row: any, isPass: boolean) {
  // 根据 isPass 的值设置对话框的标题和 audioFun 的状态码
  // 如果 isPass 为 true，表示审核通过，否则表示审核不通过
  const title = isPass ? '是否确认通过该条数据?' : '是否确认不通过该条数据?';
  const statusCode = isPass ? 2 : 3;

  // 调用 Modal.confirm 方法显示一个确认对话框，让用户确认是否执行审核操作
  Modal.confirm({
    /**
     * 设置取消按钮的文本为 '取消'。
     */
    cancelText: '取消',
    /**
     * 设置确认按钮的文本为 '确认'。
     */
    okText: '确认',
    /**
     * 设置确认按钮的类型为 'primary'，表示这是一个主要的操作。
     */
    okType: 'primary',
    /**
     * 定义确认操作的回调函数。
     * 如果用户点击确认按钮，调用 audioFun 函数处理审核逻辑。
     */
    onOk() {
      // 根据审核结果调用 audioFun 函数，传入 row.id 和状态码
      audioFun(row.id, statusCode);
    },
    /**
     * 设置对话框的标题，根据 isPass 的值显示不同的提示。
     */
    title,
  });
}

/**
 * 处理审核状态更新。
 * @param id 唯一标识符。
 * @param status 审核状态码，表示审核结果。
 */
function audioFun(id: number, status: number) {
  /**
   * 调用 processParamAudit 函数，发送审核状态更新请求。
   * @param {object} params 包含审核状态和ID的参数对象。
   */
  workstationAudit({
    auditState: status, // 设置审核状态
    id, // 唯一标识符
  }).then(() => {
    /**
     * 请求成功后，显示成功消息提示。
     * 使用 $t 函数获取国际化的 'common.successfulOperation' 消息。
     */
    message.success($t('common.successfulOperation'));
    /**
     * 重新查询数据，以更新界面上的信息。
     */
    gridApi.query();
  });
}

// endregion

// region 状态变更
/**
 * 更改配置的状态，可以启用或停用配置。
 * @param row 包含配置信息的对象，至少包含 state 和 id 属性。
 */
function changeState(row: any) {
  // 根据 row.state 的值设置对话框的标题，确定是启用还是停用配置
  const title = row.state === 1 ? '是否确认启用该配置?' : '是否确认停用该配置?';

  // 调用 Modal.confirm 方法显示一个确认对话框，让用户确认是否更改配置状态
  Modal.confirm({
    /**
     * 设置取消按钮的文本为 '取消'。
     */
    cancelText: '取消',
    /**
     * 设置确认按钮的文本为 '确认'。
     */
    okText: '确认',
    /**
     * 设置确认按钮的类型为 'primary'，表示这是一个主要的操作。
     */
    okType: 'primary',
    /**
     * 定义取消操作的回调函数。
     * 如果用户点击取消按钮，切换 row.state 的值，并显示取消操作的警告消息。
     */
    onCancel() {
      // 切换状态值，1 切换到 2，2 切换到 1
      row.state = row.state === 1 ? 2 : 1;
      message.warning($t('common.cancelOperation'));
    },
    /**
     * 定义确认操作的回调函数。
     * 如果用户点击确认按钮，调用 processParamUpdateUse 函数更新配置状态，并在成功后刷新数据。
     */
    onOk() {
      // 发起更新配置状态的请求
      workstationUpdate({
        id: row.id, // 配置项的唯一标识符
        state: row.state, // 配置项的新状态
      }).then(() => {
        // 请求成功后，显示成功消息提示
        message.success($t('common.successfulOperation'));
        // 重新查询数据，以更新界面上的信息
        gridApi.query();
      });
    },
    // 使用前面定义的 title 作为对话框的标题
    title,
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
// 审核按钮是否显示
const examineButton = ref(false);

// 监听权限变化, 变更按钮的显示情况
watch(author.value, () => {
  // 当 author.value 包含 '新增' 时，设置 addButton.value 为 true，表示允许新增
  addButton.value = author.value.includes('新增');
  // 当 author.value 包含 '编辑' 时，设置 editButton.value 为 true，表示允许编辑
  editButton.value = author.value.includes('编辑');
  // 当 author.value 包含 '删除' 时，设置 delButton.value 为 true，表示允许删除
  delButton.value = author.value.includes('删除');
  // 当 author.value 包含 '审核' 时，设置 delButton.value 为 true，表示允许审核
  examineButton.value = author.value.includes('审核');
});

// endregion

onMounted(async () => {
  try {
    // 并行执行查询函数
    queryProcessByType();
    queryAuth(route.meta.code as string).then((data) => {
      author.value = data;
    });
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
        <!-- 工作站编号 -->
        <FormItem
          :label="$t('workStationMaintenance.workStationNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.workstationCode" />
        </FormItem>
        <!-- 工作站名称 -->
        <FormItem
          :label="$t('workStationMaintenance.workstationName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.workstationName" />
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

    <!-- region 表格主体 -->
    <Card>
      <div>
        <Space />
      </div>

      <Grid>
        <template #toolbar-tools>
          <!-- 新增按钮 -->
          <Button
            v-if="addButton"
            class="mr-4"
            type="primary"
            @click="editRow()"
          >
            {{ $t('common.add') }}
          </Button>
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
        </template>
        <template #status="{ row }">
          <div v-if="row.state === 3">已弃用</div>
          <div v-else>
            <Switch
              v-model:checked="row.state"
              :checked-value="1"
              :disabled="row.auditState !== 2 && editButton"
              :un-checked-value="2"
              checked-children="启用"
              un-checked-children="停用"
              @change="changeState(row)"
            />
          </div>
        </template>
        <template #action="{ row }">
          <!-- 查看按钮 -->
          <Tooltip>
            <template #title>{{ $t('common.view') }}</template>
            <Button
              :icon="h(PhEyeLight, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="editRow(row, true)"
            />
          </Tooltip>
          <!-- 编辑按钮 -->
          <Tooltip v-if="row.auditState !== 2 && editButton">
            <template #title>{{ $t('common.edit') }}</template>
            <Button
              :icon="h(MingcuteEditLine, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="editRow(row)"
            />
          </Tooltip>
          <!-- 审核通过 -->
          <Tooltip v-if="row.auditState === 1 && examineButton">
            <template #title>{{ $t('common.pass') }}</template>
            <Button
              :icon="h(MdiSuccess, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="handleAudit(row, true)"
            />
          </Tooltip>

          <!-- 审核不通过 -->
          <Tooltip v-if="row.auditState === 1 && examineButton">
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
          <Tooltip v-if="row.auditState !== 2 && delButton">
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

    <!-- region 新增/编辑 抽屉 -->
    <Drawer
      v-model:open="showEditDrawer"
      :footer-style="{ textAlign: 'right' }"
      :height="500"
      placement="top"
      title="信息编辑"
      @close="onClose()"
    >
      <Form
        ref="editForm"
        :model="checkedRow"
        :rules="editRules"
        autocomplete="off"
        layout="inline"
        name="editMessageForm"
      >
        <!-- 工作站编号 -->
        <FormItem
          :label="$t('workStationMaintenance.workStationNumber')"
          name="workstationCode"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="checkedRow.workstationCode"
            :disabled="isShowStatus"
          />
        </FormItem>
        <!-- 工作站名称 -->
        <FormItem
          :label="$t('workStationMaintenance.workstationName')"
          name="workstationName"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="checkedRow.workstationName"
            :disabled="isShowStatus"
          />
        </FormItem>
        <!-- 工作站IP -->
        <FormItem label="IP" name="workstationIp" style="margin-bottom: 1em">
          <Input
            v-model:value="checkedRow.workstationIp"
            :disabled="isShowStatus"
          />
        </FormItem>
        <!-- 工作站类型 -->
        <FormItem
          :label="$t('workStationMaintenance.workstationType')"
          class="mb-4 w-80"
          name="workstationType"
        >
          <Select
            v-model:value="checkedRow.workstationType"
            :disabled="isShowStatus"
            :options="workStationType"
            @change="queryProcessByType"
          />
        </FormItem>
        <!-- 对应工序 -->
        <FormItem
          :label="$t('workStationMaintenance.correspondingOperation')"
          class="mb-4 w-80"
        >
          <Select
            v-model:value="checkedRow.correspondingOperation"
            :disabled="isShowStatus"
            :filter-option="filterOption"
            :loading="processListLoading"
            :options="processList"
            show-search
            @change="queryProcessDetails"
          />
        </FormItem>
      </Form>

      <!-- 添加 -->
      <Button
        :disabled="isShowStatus"
        class="mb-4"
        type="primary"
        @click="addWorkStationDetail"
      >
        {{ $t('common.add') }}
      </Button>
      <Table
        :columns="workStationDetailHeader"
        :data-source="workStationDetail"
        :scroll="workStationDetailScroll"
        bordered
      >
        <template #bodyCell="{ column, index, record }">
          <template v-if="column.dataIndex === 'step'">
            <span>{{ index + 1 }}</span>
          </template>

          <template v-if="column.dataIndex === 'processCode'">
            <div class="editable-cell">
              <div v-if="record.isProcessCodeEdit && !isShowStatus">
                <Select
                  v-model:value="record.selectedProcessCode"
                  :options="procedureList"
                  class="w-3/4"
                />
                <Tooltip>
                  <template #title>{{ $t('common.save') }}</template>
                  <Button
                    :icon="h(SaveOutline, { class: 'inline-block size-6' })"
                    class="mr-4"
                    type="link"
                    @click="selectOperation(record)"
                  />
                </Tooltip>
              </div>
              <div v-else class="editable-cell-text-wrapper">
                {{ record.processCode }}
              </div>
            </div>
          </template>

          <!-- 成本中心 -->
          <template v-if="column.dataIndex === 'costCenterCode'">
            <div class="editable-cell">
              <div v-if="record.isCostCenterCodeEdit && !isShowStatus">
                <Input v-model:value="record.costCenterCode" class="w-3/4" />
                <Tooltip>
                  <template #title>{{ $t('common.save') }}</template>
                  <Button
                    :icon="h(SaveOutline, { class: 'inline-block size-6' })"
                    class="mr-4"
                    type="link"
                    @click="record.isCostCenterCodeEdit = false"
                  />
                </Tooltip>
              </div>
              <div v-else class="editable-cell-text-wrapper">
                {{ record.costCenterCode }}

                <!-- 编辑按钮 -->
                <Tooltip>
                  <template #title>
                    {{ $t('common.configurationDetails') }}
                  </template>
                  <Button
                    :disabled="!record.id"
                    :icon="
                      h(MingcuteEditLine, { class: 'inline-block size-6' })
                    "
                    class="mr-4"
                    type="link"
                    @click="record.isCostCenterCodeEdit = true"
                  />
                </Tooltip>
              </div>
            </div>
          </template>

          <template v-else-if="column.dataIndex === 'operation'">
            <!-- 编辑按钮 -->
            <Tooltip>
              <template #title>
                {{ $t('common.configurationDetails') }}
              </template>
              <Button
                :disabled="!record.id"
                :icon="h(MingcuteEditLine, { class: 'inline-block size-6' })"
                class="mr-4"
                type="link"
                @click="showJobFlowConfiguration(record)"
              />
            </Tooltip>
            <!-- 配置设备资源按钮 -->
            <Tooltip>
              <template #title>
                {{ $t('workStationMaintenance.configuringDeviceResources') }}
              </template>
              <Button
                :icon="
                  h(HugeiconsMailSetting, { class: 'inline-block size-6' })
                "
                class="mr-4"
                type="link"
                @click="showEquipSelect(record)"
              />
            </Tooltip>
            <!-- 删除数据 -->
            <Tooltip v-if="!isShowStatus">
              <template #title>{{ $t('common.delete') }}</template>
              <Button
                :icon="
                  h(MaterialSymbolsDeleteOutline, {
                    class: 'inline-block size-6',
                  })
                "
                danger
                type="link"
                @click="delWorkStationDetail(index)"
              />
            </Tooltip>
          </template>
        </template>
      </Table>

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
    <!-- 工序操作流程配置详情 -->
    <JobFlowConfiguration
      v-model:is-open="processDrawerDisplay"
      :details="selectedRow.details as any"
      :is-show-status="isShowStatus"
      :parent-id="parentId"
      @changed="processDrawerChange"
    />
    <EquipSelect
      v-model:is-open="equipDrawer"
      :equip-code-list="equipCodeList"
      :is-show-status="isShowStatus"
      @changed="equipCodeChange"
    />
  </Page>
</template>

<style scoped></style>
