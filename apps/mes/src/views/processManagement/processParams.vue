<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import {
  IconifyIcon,
  IconParkSolidError,
  MdiEditOutline,
  MdiEyeOutline,
  MdiImportExport,
  MdiLightDelete,
  MdiSearch,
  MdiSuccess,
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
  List,
  ListItem,
  message,
  Modal,
  Select,
  SelectOption,
  Space,
  Spin,
  Switch,
  Table,
  Tooltip,
  Upload,
} from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { debounce } from 'lodash-es';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addProcessParam,
  deleteProcessParam,
  getCSDetail,
  getMBDetail,
  getProceByName,
  processParamAudit,
  processParamTempChange,
  processParamUpdateUse,
  queryProcessParam,
  updateProcessParam,
} from '#/api';
import { queryAuth } from '#/util';
// 路由信息
const route = useRoute();

// region 表格

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'tempCode', title: '模板编号', minWidth: 150 },
    { field: 'tempName', title: '模板名称', minWidth: 220 },
    {
      field: 'tempType',
      title: '模板类型',
      minWidth: 150,
      slots: { default: 'tempType' },
    },
    { field: 'proceCode', title: '工序', minWidth: 200 },
    {
      field: 'state',
      title: '状态',
      minWidth: 150,
      slots: { default: 'state' },
    },
    { field: 'auditStateName', title: '审核状态', minWidth: 150 },
    {
      field: 'operation',
      fixed: 'right',
      slots: { default: 'operation' },
      title: '操作',
      minWidth: 350,
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
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

const gridEvents: any = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 查询参数
const queryParams = ref<any>({});

/**
 * queryData - 负责根据当前的查询参数、分页信息和日期范围，从后端服务查询数据。
 * 该函数会更新表格的加载状态，并在查询完成后更新数据列表和总条数。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 构建查询参数对象，包含所有查询参数、当前页码和每页显示的数据条数。
    const params = {
      // 展开 queryParams.value 对象，包含所有查询参数。
      ...queryParams.value,
      // 设置当前页码。
      pageNum: page,
      // 设置每页显示的数据条数。
      pageSize,
    };

    // 调用 searchWorksheetNoWater 函数查询数据。
    queryProcessParam(params)
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

// region 新增/编辑
// 编辑form表单
const editForm = ref();
// 编辑抽屉是否显示
const showEditDrawer = ref(false);
// 编辑的对象
const editItem = ref<any>({});
// form表单规则验证
const editRules = ref<any>({
  proceCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  tempCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  tempName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  tempType: [{ message: '此项为必填项', required: true, trigger: 'change' }],
});

// 详情表格头部
const detailHeader = ref<any>([
  {
    dataIndex: 'step',
    ellipsis: true,
    title: '#',
    width: 60,
  },
  {
    dataIndex: 'paramName',
    ellipsis: true,
    title: '参数名称',
    width: 120,
  },
  {
    dataIndex: 'paramType',
    ellipsis: true,
    title: '参数类型',
    width: 120,
    slots: { default: 'paramType' },
  },
  {
    dataIndex: 'paramInitValue',
    ellipsis: true,
    title: '参数默认值',
    width: 120,
  },
  {
    dataIndex: 'paramThreshold',
    ellipsis: true,
    title: '阈值范围',
    width: 120,
  },
  {
    dataIndex: 'description',
    ellipsis: true,
    title: '参数说明',
    width: 120,
  },
  {
    dataIndex: 'operation',
    ellipsis: true,
    title: '操作',
    width: 180,
  },
]);
// 表格滚动信息配置
const workStationDetailScroll = ref({
  scrollToFirstRowOnChange: true,
  y: 350,
});
// 参数详情
const detailList = ref<any>([]);
// 是否处于变更状态
const isAlter = ref(false);
// 是否处于查看状态
const isShowStatus = ref(false);
// 是否处于日志查看状态
const isLog = ref(false);

/**
 * 编辑表格中的一行数据。
 * @param row 可选参数，表示要编辑的行对象。如果未提供，则表示新建一行数据。
 * @param alter 可选参数，表示要编辑的行是否处于变更状态。
 */
function editRow(row?: any, alter?: boolean) {
  if (isLog.value) {
    getCSDetail({
      tempCodeVersion: `${row.tempCode}${row.version}`,
    }).then(({ list }: any) => {
      detailList.value = list;
      showEditDrawer.value = true;
    });
  } else {
    // 如果提供了row参数，则将row对象的浅拷贝赋值给editItem，否则设置为空对象。
    editItem.value = row ? { ...row } : {};

    // 如果提供了row参数，则将row.params数组的深拷贝赋值给detailList，否则设置为空数组。
    detailList.value = row ? [...row.params] : [];
    // 设置 isAlter.value 为 alter 参数的值，或者默认为 false。
    isAlter.value = alter || false;

    // 显示编辑抽屉（或编辑面板）。
    showEditDrawer.value = true;
  }
}

/**
 * 新增一行
 */
function addRow() {
  detailList.value.push({
    key: Date.now(),
  });
}

/**
 * 删除详细信息条目的函数。
 * 这个函数用于在用户确认后从工作站详细信息数组中删除指定索引位置的条目。
 *
 * @param {number} index - 要删除条目的索引位置。
 */
function delRow(index: number) {
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
      detailList.value.splice(index, 1);
    },
    /**
     * 设置对话框的标题为 '是否确认删除该条数据?'。
     */
    title: '是否确认删除该条数据?',
  });
}

/**
 * 删除指定的流程数据。
 * @param row 要删除的流程数据对象。
 */
function delProcess(row: any) {
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
     * 如果用户点击确认按钮，调用 deleteProcessParam 函数删除指定的流程参数，并更新数据。
     */
    onOk() {
      deleteProcessParam(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
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
  detailList.value = [];
  editItem.value = {};
  showEditDrawer.value = false;
  isShowStatus.value = false;
  isLog.value = false;
}

/**
 * 表单提交
 */
function submit() {
  if (isShowStatus.value) {
    onClose();
    return;
  }
  /**
   * 使用 editForm.value.validate() 方法验证表单。
   * 这个方法返回一个 Promise 对象，我们使用 then 方法来处理验证通过的情况。
   */
  editForm.value.validate().then(() => {
    /**
     * 构建提交参数，开始时复制 editItem.value 对象的所有属性。
     */
    const params = { ...editItem.value };
    const codes = params.proceCode.split(' ');
    if (codes.length > 1) {
      params.proceCode = codes[0];
    }
    /**
     * 如果 detailList.value 数组存在，遍历该数组。
     */
    if (detailList.value) {
      params.params = [...detailList.value];
    }
    let ob: any;

    // 判断是否为变更操作
    if (isAlter.value) {
      ob = processParamTempChange(params);
    } else {
      if (params.id) {
        params.auditState = 1;
      }
      /**
       * 根据 params 对象中是否有 id 属性来决定是编辑还是添加工作站。
       */
      ob = params.id ? updateProcessParam(params) : addProcessParam(params);
    }

    /**
     * 处理提交操作的结果。
     */
    ob.then(() => {
      /**
       * 如果提交成功，首先重新查询数据以更新列表。
       */
      gridApi.reload();
      /**
       * 显示操作成功的提示信息。
       * 使用 $t 函数获取本地化的文本。
       */
      message.success($t('common.successfulOperation'));
      /**
       * 关闭编辑抽屉。
       */
      onClose();
    });
  });
}

// region 工序选项
const proceOptions = ref<any>([]);
// 是否正在添加
const addLoading = ref(false);

// 定义一个名为fetchProcessOptions的函数，它是一个debounce函数，用于限制函数的执行频率。
const fetchProcessOptions = debounce((val: string) => {
  // 当函数被触发时，首先将addLoading的值设置为true，表示开始加载数据。
  addLoading.value = true;

  // 调用getProceByName函数，传入参数val，该函数可能用于根据名称获取流程信息。
  getProceByName(val)
    .then((res) => {
      // 当获取到结果后，遍历结果数组。
      res.forEach((item: any) => {
        // 将每个流程信息项添加到proceOptions数组中，每个项包含流程名称和代码。
        proceOptions.value.push({
          label: item.processName, // 流程名称作为标签
          value: item.processCode, // 流程代码作为值
        });
      });
    })
    .finally(() => {
      // 不管成功还是失败，最终都将addLoading的值设置为false，表示加载结束。
      addLoading.value = false;
    });
}, 500); // 设置debounce的延迟时间为500毫秒。

/**
 * 处理搜索操作的函数。
 * @param val 搜索框中的输入值。
 */
function handleSearch(val: string) {
  // 检查输入值val是否非空。
  if (val) {
    // 如果val非空，则调用fetchProcessOptions函数来获取与val相关的流程选项。
    fetchProcessOptions(val);
  }
}

// endregion

// endregion

// region 日志查询
// 是否显示日志抽屉
const showLogDrawer = ref(false);
// 日志加载状态
const logLoading = ref(false);
const queryParamsLog = ref<any>({
  tempCode: '',
  startTime: '',
  endTime: '',
  searchTime: [],
});
// 日志列表
const logs = ref<any>([]);

/**
 * 显示日志抽屉
 */
function showLog(tempCode: string) {
  showLogDrawer.value = true;
  queryParamsLog.value.tempCode = tempCode;
  queryLog();
}

/**
 * 查询日志
 */
function queryLog() {
  const params = {
    ...queryParamsLog.value,
  };
  if (params.searchTime && params.searchTime.length > 0) {
    params.startTime = params.searchTime[0].format('YYYY-MM-DD HH:mm:ss');
    params.endTime = params.searchTime[1].format('YYYY-MM-DD HH:mm:ss');
  }
  logLoading.value = true;
  getMBDetail(params)
    .then(({ list }: any) => {
      logs.value = list;
    })
    .finally(() => {
      logLoading.value = false;
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
      processParamUpdateUse({
        id: row.id, // 配置项的唯一标识符
        state: row.state, // 配置项的新状态
      }).then(() => {
        // 请求成功后，显示成功消息提示
        message.success($t('common.successfulOperation'));
        // 重新查询数据，以更新界面上的信息
        gridApi.reload();
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
// 变更按钮是否显示
const alterButton = ref(false);

// 监听权限变化, 变更按钮的显示情况
watch(
  () => author.value,
  () => {
    // 当 author.value 包含 '新增' 时，设置 addButton.value 为 true，表示允许新增
    addButton.value = author.value.includes('新增');
    // 当 author.value 包含 '编辑' 时，设置 editButton.value 为 true，表示允许编辑
    editButton.value = author.value.includes('编辑');
    // 当 author.value 包含 '删除' 时，设置 delButton.value 为 true，表示允许删除
    delButton.value = author.value.includes('删除');
    // 当 author.value 包含 '审核' 时，设置 delButton.value 为 true，表示允许审核
    examineButton.value = author.value.includes('审核');
    // 当 author.value 包含 '变更' 时，设置 delButton.value 为 true，表示允许变更
    alterButton.value = author.value.includes('变更');
  },
);

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
  processParamAudit({
    auditState: status, // 设置审核状态
    id, // 唯一标识符
  }).then(() => {
    /**
     * 请求成功后，显示成功消息提示。
     * 使用 $t 函数获取国际化的 'common.successfulOperation' 消息。
     */
    message.success($t('common.successfulOperation'));
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
  `/ht/${import.meta.env.VITE_GLOB_MES_MAIN}/process/param/uploadExcel`,
);
// 文件列表
const fileList = ref<any>([]);

function handleChange(info: any) {
  if (info.file.status === 'done') {
    gridApi.reload();
    message.success(`文件上传成功!`);
  } else if (info.file.status === 'error') {
    message.error(`文件上传失败`);
  }
}

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
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 模板编号 -->
        <FormItem
          :label="$t('processManagement.processParams.proceName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.proceName" />
        </FormItem>

        <!-- 模板名称 -->
        <FormItem
          :label="$t('processManagement.processParams.templateName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.tempName" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="
              () => {
                gridApi.reload();
              }
            "
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->
    <!-- region 表格 -->
    <Card class="mb-8">
      <Grid>
        <template #toolbar-tools>
          <Space>
            <!-- 新增按钮 -->
            <Button v-if="addButton" type="primary" @click="editRow()">
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
          </Space>
        </template>

        <template #paramType="{ row }">
          <span>{{
            row.paramType === 1
              ? '数值型'
              : row.paramType === 2
                ? '判断型'
                : '未定义'
          }}</span>
        </template>
        <template #tempType="{ row }">
          {{
            row.tempType === 1
              ? '参数设置模板'
              : row.tempType === 2
                ? '参数采集模板'
                : '参数阈值模板'
          }}
        </template>
        <template #state="{ row }">
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
        <template #operation="{ row }">
          <!-- 查看按钮 -->
          <Tooltip>
            <template #title>{{ $t('common.view') }}</template>
            <Button
              :icon="h(MdiEyeOutline, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="
                isShowStatus = true;
                editRow(row);
              "
            />
          </Tooltip>
          <!-- 查看日志按钮 -->
          <Tooltip>
            <template #title>{{ $t('common.viewLog') }}</template>
            <Button class="mr-4" type="link" @click="showLog(row.tempCode)">
              <IconifyIcon
                icon="mdi:file-eye-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 编辑按钮 -->
          <Tooltip v-if="row.auditState !== 2 && editButton">
            <template #title>{{ $t('common.edit') }}</template>
            <Button
              :icon="h(MdiEditOutline, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="editRow(row)"
            />
          </Tooltip>
          <!-- 变更 -->
          <Tooltip
            v-if="row.auditState === 2 && row.state !== 1 && alterButton"
          >
            <template #title>{{ $t('common.alter') }}</template>
            <Button
              :icon="h(MdiImportExport, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="editRow(row, true)"
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
                h(MdiLightDelete, {
                  class: 'inline-block size-6',
                })
              "
              danger
              type="link"
              @click="delProcess(row)"
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
      :height="600"
      placement="top"
      title="信息编辑"
      @close="onClose()"
      class="z-auto"
    >
      <Form
        ref="editForm"
        :model="editItem"
        :rules="editRules"
        autocomplete="off"
        layout="inline"
        name="editMessageForm"
      >
        <!-- 模板编号 -->
        <FormItem
          :label="$t('processManagement.processParams.templateNumber')"
          name="tempCode"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="editItem.tempCode" :disabled="isShowStatus" />
        </FormItem>
        <!-- 模板名称 -->
        <FormItem
          :label="$t('processManagement.processParams.templateName')"
          name="tempName"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="editItem.tempName" :disabled="isShowStatus" />
        </FormItem>
        <!-- 模板类型 -->
        <FormItem
          :label="$t('processManagement.processParams.templateType')"
          name="tempType"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="editItem.tempType"
            :disabled="isShowStatus"
            style="width: 180px !important"
          >
            <SelectOption :value="1">参数设置模板</SelectOption>
            <SelectOption :value="2">参数采集模板</SelectOption>
            <SelectOption :value="3">参数阈值模板</SelectOption>
          </Select>
        </FormItem>
        <!-- 所属工序 -->
        <FormItem
          :label="$t('processManagement.processParams.subordinateProcess')"
          name="proceCode"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="editItem.proceCode"
            :default-active-first-option="false"
            :filter-option="false"
            :not-found-content="null"
            :options="proceOptions"
            :show-arrow="false"
            show-search
            style="width: 180px !important"
            @search="handleSearch"
          />
        </FormItem>
      </Form>

      <!-- 添加 -->
      <Button v-if="!isShowStatus" class="mb-4" type="primary" @click="addRow">
        {{ $t('common.add') }}
      </Button>
      <Table
        :columns="detailHeader"
        :data-source="detailList"
        :scroll="workStationDetailScroll"
        bordered
      >
        <template #bodyCell="{ column, index, record }">
          <template v-if="column.dataIndex === 'step'">
            <span>{{ index + 1 }}</span>
          </template>

          <template v-else-if="column.dataIndex === 'operation'">
            <!-- 删除数据 -->
            <Tooltip v-if="!isShowStatus">
              <template #title>{{ $t('common.delete') }}</template>
              <Button
                :icon="
                  h(MdiLightDelete, {
                    class: 'inline-block size-6',
                  })
                "
                danger
                type="link"
                @click="delRow(index)"
              />
            </Tooltip>
          </template>

          <template v-else>
            <div class="editable-cell">
              <Select
                v-if="column.dataIndex === 'paramType'"
                v-model:value="record[column.dataIndex as any]"
                :disabled="isShowStatus"
                class="w-3/4"
              >
                <SelectOption :value="1">数值型</SelectOption>
                <SelectOption :value="2">判断型</SelectOption>
              </Select>
              <Input
                v-else
                v-model:value="record[column.dataIndex as any]"
                :disabled="isShowStatus"
                class="w-3/4"
              />
            </div>
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

    <!-- region 日志 抽屉 -->
    <Drawer
      v-model:open="showLogDrawer"
      :footer-style="{ textAlign: 'right' }"
      :height="500"
      placement="top"
      title="日志查看"
      @close="onClose()"
    >
      <Spin :spinning="logLoading">
        <List :data-source="logs">
          <template #renderItem="{ item }">
            <ListItem>
              <template #actions>
                <Button
                  type="link"
                  @click="
                    () => {
                      isShowStatus = true;
                      isLog = true;
                      editRow(item);
                    }
                  "
                >
                  {{ $t('common.view') }}
                </Button>
              </template>
              {{ item.tempName }}({{ item.tempCode }})__{{ item.version }}
              ---
              {{ item.opUser }}({{ item.opTime }})
            </ListItem>
          </template>
        </List>
      </Spin>
    </Drawer>
  </Page>
</template>

<style scoped></style>
