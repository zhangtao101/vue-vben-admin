<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';
import { useAccessStore } from '@vben/stores';

import { PlusOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Textarea,
  Tooltip,
  Upload,
} from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { debounce } from 'lodash-es';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  abnormalFilling,
  andonSign,
  anomalyDetermination,
  draftBoxRecordQuery,
  fetchAndonPendingList,
  fuzzyQueryOfEquipmentNumber,
  problemHandling,
  queryAndonCompletedList,
  queryAndonPendingList,
  queryAndonPendingPickList,
  queryErrorType,
  queryTheListOfAndonPendingProcessing,
  taskCollection,
} from '#/api';

const props = defineProps({
  showType: {
    type: String,
    default: '1',
  },
});

const accessStore = useAccessStore();
// region 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      title: '序号',
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    {
      field: 'andonCode',
      title: '任务编号',
      minWidth: 200,
    },
    {
      field: 'workorderCode',
      title: '工单编号',
      minWidth: 200,
    },
    {
      field: 'product',
      title: '产品名称',
      minWidth: 200,
    },
    {
      field: 'process',
      title: '工序',
      minWidth: 200,
    },
    {
      field: 'equipCode',
      title: '关联设备',
      minWidth: 200,
    },
    {
      field: 'createUser',
      title: '呼叫人员',
      minWidth: 200,
    },
    {
      field: 'exigency',
      title: '问题等级',
      minWidth: 200,
      slots: { default: 'exigency' },
    },
    {
      field: 'createTime',
      title: '任务判定时间',
      minWidth: 200,
    },
    {
      field: 'source',
      title: '任务来源',
      minWidth: 200,
      slots: { default: 'source' },
    },
    {
      title: '操作',
      minWidth: 200,
      slots: {
        default: 'action',
      },
      fixed: 'right',
      visible: props.showType !== '3' && props.showType !== '5',
    },
  ],
  maxHeight: 400,
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

const gridEvents: any = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

const queryParams = ref<any>({});
/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params: any = {
      ...queryParams.value,
      pageNum: page,
      pageSize,
    };
    let ob: any;
    switch (props.showType) {
      // 待领取
      case '1': {
        ob = queryAndonPendingPickList(params);
        break;
      }
      // 查询安灯待处理列表
      case '2': {
        ob = fetchAndonPendingList(params);
        break;
      }
      // 已完成
      case '3': {
        ob = queryAndonCompletedList(params);
        break;
      }
      // 问题待判定页面显示数据
      case '4': {
        ob = queryTheListOfAndonPendingProcessing(params);
        break;
      }
      // 查询安灯待判定完成列表
      case '5': {
        ob = queryAndonPendingList(params);
        break;
      }
      // 查询草稿箱
      case '7': {
        params.place = 3;
        ob = draftBoxRecordQuery(params);
        break;
      }
    }
    ob.then(({ total, list }: any) => {
      // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
      resolve({
        total,
        items: list,
      });
    });
  });
}

/**
 * 获取问题等级文本描述
 * @param exigency 等级
 */
function getExigencyText(exigency: number) {
  switch (exigency) {
    case 1: {
      return '紧急';
    }
    case 2: {
      return '急';
    }
    case 3: {
      return '一般';
    }
    default: {
      return '暂未定义';
    }
  }
}

/**
 * 获取任务来源文本描述
 * @param source 任务来源
 */
function getSourceText(source: number) {
  switch (source) {
    case 1: {
      return '人工呼叫';
    }
    case 2: {
      return '规则触发';
    }
    default: {
      return '暂未定义';
    }
  }
}
// endregion

// region 签到
// 签到抽屉是否显示
const signInDrawerDisplay = ref(false);

// 签到表单
const signInForm = ref<any>({});
// 签到表单数据
const signInFormState = ref<any>({});
// 编辑的签到对象
const theSignInObjectOfTheEditor = ref<any>({});

/**
 * 显示签到抽屉
 */
function showTheSignInDrawer(row: any) {
  signInDrawerDisplay.value = true;
  theSignInObjectOfTheEditor.value = row;
}

/**
 * 关闭签到抽屉
 */
function closeTheSignInDrawer() {
  signInDrawerDisplay.value = false;
  signInForm.value.resetFields();
  theSignInObjectOfTheEditor.value = {};
}

/**
 * 签到表单提交
 */
function signInSubmission() {
  signInForm.value.validate().then(() => {
    const params = {
      ...signInFormState.value,
      andonId: theSignInObjectOfTheEditor.value.id,
    };
    andonSign(params).then(() => {
      message.success($t('common.successfulOperation'));
      closeTheSignInDrawer();
      gridApi.reload();
    });
  });
}
// endregion

// region 设备编号模糊查询
const listOfEquipmentNumbers = ref<any>([]);
const fetching = ref(false);

function listOfEquipmentNumbersSearch(val: string) {
  if (val) {
    fetching.value = true;
    fuzzyQueryOfEquipmentNumber({
      equipmentCode: val,
      pageNum: 1,
      pageSize: 200,
    })
      .then((data: any) => {
        listOfEquipmentNumbers.value = data;
      })
      .finally(() => {
        fetching.value = false;
      });
  }
}

/**
 * 防抖函数
 */
const listOfEquipmentNumbersSearchThrottling = debounce(
  (value: string) => listOfEquipmentNumbersSearch(value),
  500,
);

/**
 * 选择第一个
 * @param count 选择次数
 */
function choose(count: number = 0) {
  if (listOfEquipmentNumbers.value.length > 0) {
    const item = listOfEquipmentNumbers.value[0];
    signInFormState.value.equipCode = item.equipmentCode;
  } else {
    setTimeout(() => {
      choose(count + 1);
    }, 800);
  }
}
// endregion

// region 异常判定
// 异常判定抽屉是否显示
const anomalyDeterminationDrawer = ref(false);

// 异常判定表单
const anomalyDeterminationForm = ref<any>({});
// 异常判定数据
const anomalyDeterminationData = ref<any>({});
// 编辑的异常判定对象
const theObjectOfExceptionDeterminationForEditing = ref<any>({});
// 是否为异常填报
const isFillInTheForm = ref<boolean>(false);
// 是否为处理状态
const whetherItIsInTheProcessingState = ref<boolean>(false);
// 处理方式
const processingOptions = ref([
  {
    label: '任务完成关闭',
    value: 1,
  },
  {
    label: '提交上级',
    value: 2,
  },
  {
    label: '认为问题判定错误关闭问题',
    value: 3,
  },
  {
    label: '返回上一级',
    value: 4,
  },
]);

// region 文件上传

// 文件上传列表
const uploadFile = ref<any>([]);

function getUploadUrl() {
  return `/ht/${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/handle/upload`;
}

// endregion

/**
 * 显示异常判定抽屉
 */
function displayTheAnomalyDeterminationDrawer(
  row: any,
  fillInTheForm: boolean = false,
) {
  anomalyDeterminationDrawer.value = true;
  theObjectOfExceptionDeterminationForEditing.value = { ...row };
  isFillInTheForm.value = fillInTheForm;
}

/**
 * 关闭异常判定抽屉
 */
function closeTheAnomalyDeterminationDrawer() {
  anomalyDeterminationDrawer.value = false;
  isFillInTheForm.value = false;
  whetherItIsInTheProcessingState.value = false;
  anomalyDeterminationForm.value.resetFields();
  theObjectOfExceptionDeterminationForEditing.value = {};
  anomalyDeterminationData.value = {};
  uploadFile.value = [];
}

/**
 * 异常判定表单提交
 */
function exceptionDeterminationFormSubmission() {
  anomalyDeterminationForm.value.validate().then(() => {
    let ob: any;
    let filePath = '';
    if (uploadFile.value.length > 0) {
      filePath = uploadFile.value[0].response.data;
    }
    if (isFillInTheForm.value) {
      const params = {
        ...anomalyDeterminationData.value,
        id: theObjectOfExceptionDeterminationForEditing.value.id,
        andonCode: theObjectOfExceptionDeterminationForEditing.value.andonCode,
        photo: filePath,
      };

      ob = abnormalFilling(params);
    } else {
      const params = {
        ...anomalyDeterminationData.value,
        andonId: theSignInObjectOfTheEditor.value.id,
        photo: filePath,
        id: theObjectOfExceptionDeterminationForEditing.value.id,
        andonCode: theObjectOfExceptionDeterminationForEditing.value.andonCode,
      };
      ob = whetherItIsInTheProcessingState.value
        ? problemHandling(params)
        : anomalyDetermination(params);
    }
    ob.then(() => {
      message.success($t('common.successfulOperation'));
      closeTheAnomalyDeterminationDrawer();
      gridApi.reload();
    });
  });
}

/**
 * 处理
 * @param row
 */
function handle(row: any) {
  displayTheAnomalyDeterminationDrawer(row);
  whetherItIsInTheProcessingState.value = true;
}
// endregion

// region 任务领取

function taskCollectionFun(id: any) {
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
      taskCollection(id).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
    // 确认框的标题文本
    title: '是否确认领取任务?',
  });
}

// endregion

// region 暴露方法

const reload = () => {
  gridApi.reload();
};

defineExpose({
  reload,
});

// endregion

// region 异常列表
const errorTypes = ref<any>([]);
/**
 * 查询异常列表
 */
function queryError() {
  queryErrorType().then((data: any) => {
    errorTypes.value = data;
  });
}

/**
 * 搜索框过滤方法
 * @param input 输入值
 * @param option 选项
 */
const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};
// endregion

// region 异常填报

// endregion

onMounted(() => {
  queryError();
});
</script>
<template>
  <Form layout="inline" :model="queryParams" class="mb-4">
    <!--工单编号 -->
    <FormItem :label="$t('andon.workOrderNumber')" class="!mb-4">
      <Input v-model:value="queryParams.workorderCode" />
    </FormItem>
    <!--当前工序 -->
    <FormItem :label="$t('andon.currentOperation')" class="!mb-4">
      <Input v-model:value="queryParams.process" />
    </FormItem>
    <!--作业位置 -->
    <FormItem :label="$t('andon.jobPosition')" class="!mb-4">
      <Input v-model:value="queryParams.location" />
    </FormItem>
    <FormItem class="!mb-4">
      <Button type="primary" @click="gridApi.reload()" class="mr-4">
        {{ $t('common.search') }}
      </Button>
      <Button @click="reload()">
        {{ $t('common.reset') }}
      </Button>
    </FormItem>
  </Form>
  <Grid class="h-auto">
    <template #toolbar-tools> </template>
    <template #exigency="{ row }">
      {{ getExigencyText(row.exigency) }}
    </template>
    <template #source="{ row }">
      {{ getSourceText(row.exigency) }}
    </template>
    <template #action="{ row }">
      <!-- 任务领取 -->
      <Tooltip v-if="showType === '1' && row.collect !== 1">
        <template #title>
          {{ $t('andon.taskCollection') }}
        </template>
        <Button
          type="link"
          :icon="
            h(IconifyIcon, {
              icon: 'mdi:invoice-receive',
              class: 'inline-block text-2xl',
            })
          "
          @click="taskCollectionFun(row.id)"
        />
      </Tooltip>
      <!-- 签到 -->
      <Tooltip v-if="showType === '2' || showType === '4'">
        <template #title>
          {{ $t('andon.signIn') }}
        </template>
        <Button
          type="link"
          :icon="
            h(IconifyIcon, {
              icon: 'material-symbols:tv-signin-outline',
              class: 'inline-block text-2xl',
            })
          "
          @click="showTheSignInDrawer(row)"
        />
      </Tooltip>
      <!-- 处理 -->
      <Tooltip v-if="showType === '2'">
        <template #title>
          {{ $t('andon.handle') }}
        </template>
        <Button
          type="link"
          :icon="
            h(IconifyIcon, {
              icon: 'material-symbols:security-update-warning-outline-rounded',
              class: 'inline-block text-2xl',
            })
          "
          @click="handle(row)"
        />
      </Tooltip>
      <!-- 判定 -->
      <Tooltip v-if="showType === '4'">
        <template #title>
          {{ $t('andon.judge') }}
        </template>
        <Button
          type="link"
          :icon="
            h(IconifyIcon, {
              icon: 'mdi:file-alert',
              class: 'inline-block text-2xl',
            })
          "
          @click="displayTheAnomalyDeterminationDrawer(row)"
        />
      </Tooltip>
      <!-- 异常填报 -->
      <Tooltip v-if="showType === '7'">
        <template #title>
          {{ $t('common.abnormalFilling') }}
        </template>
        <Button
          type="link"
          :icon="
            h(IconifyIcon, {
              icon: 'mdi:error-outline',
              class: 'inline-block text-2xl',
            })
          "
          @click="displayTheAnomalyDeterminationDrawer(row, true)"
        />
      </Tooltip>
    </template>
  </Grid>
  <!-- 签到 -->
  <Drawer
    v-model:open="signInDrawerDisplay"
    :footer-style="{ textAlign: 'right' }"
    :width="600"
    class="custom-class"
    placement="right"
    title="签到"
  >
    <Form
      ref="signInForm"
      :model="signInFormState"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <!-- 设备编号 -->
      <FormItem
        :label="$t('andon.equipmentNumber')"
        :rules="[{ required: true, message: $t('andon.required') }]"
        style="margin-bottom: 1em"
        name="equipCode"
      >
        <Select
          v-model:value="signInFormState.equipCode"
          show-search
          placeholder="input search text"
          style="width: 200px"
          :default-active-first-option="false"
          :show-arrow="false"
          :filter-option="false"
          :field-names="{ label: 'equipmentName', value: 'equipmentCode' }"
          :not-found-content="fetching ? undefined : null"
          :options="listOfEquipmentNumbers"
          @search="listOfEquipmentNumbersSearchThrottling"
          @keydown.enter="choose()"
          class="!w-full"
        >
          <template v-if="fetching" #notFoundContent>
            <Spin size="small" />
          </template>
        </Select>
      </FormItem>
      <!-- 人员工号 -->
      <FormItem
        :label="$t('andon.employeeNumber')"
        :rules="[{ required: true, message: $t('andon.required') }]"
        style="margin-bottom: 1em"
        name="userCode"
      >
        <Input v-model:value="signInFormState.userCode" />
      </FormItem>
    </Form>
    <template #footer>
      <Space>
        <!-- 取消 -->
        <Button @click="closeTheSignInDrawer">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 提交  -->
        <Button type="primary" @click="signInSubmission()">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
  <!-- 判定  / 异常填报 / 问题处理-->
  <Drawer
    v-model:open="anomalyDeterminationDrawer"
    :footer-style="{ textAlign: 'right' }"
    :width="600"
    class="custom-class"
    placement="right"
    :title="
      isFillInTheForm
        ? '异常填报'
        : whetherItIsInTheProcessingState
          ? '问题处理'
          : '问题判定'
    "
    @close="closeTheAnomalyDeterminationDrawer"
  >
    <Form
      ref="anomalyDeterminationForm"
      :model="anomalyDeterminationData"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <!-- 异常类型 -->
      <FormItem
        :label="$t('andon.exceptionType')"
        :rules="[{ required: true, message: $t('andon.required') }]"
        style="margin-bottom: 1em"
        name="andonErrorCode"
      >
        <Select
          v-model:value="anomalyDeterminationData.andonErrorCode"
          show-search
          style="width: 300px"
          :options="errorTypes"
          :filter-option="filterOption"
        />
      </FormItem>
      <!-- 详细描述 -->
      <FormItem
        :label="$t('andon.detailedDescription')"
        :rules="[{ required: true, message: $t('andon.required') }]"
        style="margin-bottom: 1em"
        name="handleData"
      >
        <Textarea v-model:value="anomalyDeterminationData.handleData" />
      </FormItem>
      <!-- 处理结果 -->
      <FormItem
        :label="$t('andon.processingResult')"
        :rules="[{ required: true, message: $t('andon.required') }]"
        style="margin-bottom: 1em"
        name="closeType"
        v-if="whetherItIsInTheProcessingState"
      >
        <Select
          v-model:value="anomalyDeterminationData.closeType"
          style="width: 300px"
          :options="processingOptions"
        />
      </FormItem>
      <!-- 异常图片 -->
      <FormItem
        :label="$t('andon.abnormalPicture')"
        style="margin-bottom: 1em"
        name="photo"
      >
        <Upload
          v-model:file-list="uploadFile"
          :action="getUploadUrl()"
          list-type="picture-card"
          name="photo"
          :headers="{ Authorization: `${accessStore.accessToken}` }"
        >
          <div v-if="uploadFile.length === 0">
            <PlusOutlined />
            <div style="margin-top: 8px">Upload</div>
          </div>
        </Upload>
      </FormItem>
    </Form>
    <template #footer>
      <Space>
        <!-- 取消 -->
        <Button @click="closeTheAnomalyDeterminationDrawer">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 提交  -->
        <Button type="primary" @click="exceptionDeterminationFormSubmission()">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
<style lang="scss" scoped></style>
