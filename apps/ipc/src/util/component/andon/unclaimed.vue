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
import ScanTheCode from '#/util/component/scanTheCode.vue';

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
 * 分页查询安灯任务列表
 * 功能：根据任务状态类型查询不同列表数据
 * 流程：
 * 1. 合并查询参数和分页参数
 * 2. 根据showType匹配对应业务场景的接口
 * 3. 调用接口获取分页数据
 * 4. 转换接口返回数据结构适配前端表格
 *
 * @param page - 当前页码
 * @param pageSize - 每页数量
 *
 * 接口说明：
 * - case '1': queryAndonPendingPickList 待领取任务列表
 * - case '2': fetchAndonPendingList 待处理任务列表
 * - case '3': queryAndonCompletedList 已完成任务列表
 * - case '4': queryTheListOfAndonPendingProcessing 待判定任务列表
 * - case '5': queryAndonPendingList 待判定完成列表
 * - case '7': draftBoxRecordQuery 草稿箱记录（place=3）
 *
 * 注意事项：
 * - showType来自父组件传递的任务状态标识
 * - 返回数据需转换为{total, items}格式适配vxe-table
 * - 异常情况未处理，依赖接口正确返回数据结构
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
 * 转换紧急等级为文本描述
 * 功能：将数字形式的紧急程度转换为中文语义化表达
 *
 * @param exigency - 紧急等级数字代码
 *                1: 紧急
 *                2: 急
 *                3: 一般
 *
 * 数据映射关系：
 * - 1 → 紧急 (最高优先级)
 * - 2 → 急 (中等优先级)
 * - 3 → 一般 (普通优先级)
 *
 * 注意事项：
 * - 默认返回'暂未定义'处理未知的等级代码
 * - 等级定义需与后端服务保持一致
 * - 如需国际化，应改用$t实现多语言支持
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
 * 转换任务来源为文本描述
 * 功能：将数字编码的任务来源转换为可读的中文说明
 *
 * @param source - 任务来源数字代码
 *                1: 人工呼叫
 *                2: 规则触发
 *
 * 数据映射关系：
 * - 1 → 人工呼叫 (手动创建的任务)
 * - 2 → 规则触发 (系统自动生成的任务)
 *
 * 注意事项：
 * - 默认返回'暂未定义'处理未知的来源编码
 * - 编码定义需与工作流引擎保持一致
 * - 新增来源类型时需同步更新此映射关系
 * - 国际化场景应改用$t()实现多语言支持
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
 * 显示签到操作抽屉
 * 功能：打开签到表单抽屉并初始化编辑数据
 * 流程：
 * 1. 设置抽屉显示状态为true
 * 2. 保存当前行数据至编辑对象
 *
 * @param row - 当前表格行数据对象，包含以下字段：
 *   - id: 任务唯一标识
 *   - andonCode: 安灯任务编号
 *   - 其他任务相关字段
 *
 * 使用场景：
 * 在任务列表点击"签到"按钮时触发
 *
 * 注意事项：
 * - 操作前需确保row包含完整的任务信息
 * - 关联的抽屉组件需预先在模板中定义
 * - 关闭抽屉时会自动清空编辑对象
 */
function showTheSignInDrawer(row: any) {
  signInDrawerDisplay.value = true;
  theSignInObjectOfTheEditor.value = row;
}

/**
 * 关闭签到抽屉并重置状态
 * 功能：隐藏签到抽屉并清理表单数据
 * 流程：
 * 1. 设置抽屉显示状态为false
 * 2. 重置签到表单字段为初始值
 * 3. 清空当前编辑的任务对象
 *
 * 注意事项：
 * - 使用ant-design-vue表单实例的resetFields()方法重置表单
 * - 清空编辑对象避免数据残留影响下次打开
 * - 与showTheSignInDrawer配合构成完整的抽屉生命周期管理
 */
function closeTheSignInDrawer() {
  signInDrawerDisplay.value = false;
  signInForm.value.resetFields();
  theSignInObjectOfTheEditor.value = {};
}

/**
 * 处理签到表单提交
 * 功能：验证并提交签到数据，完成安灯任务签到流程
 * 流程：
 * 1. 执行表单字段校验
 * 2. 构造接口请求参数：
 *   - 合并表单数据
 *   - 携带当前编辑任务的ID（andonId）
 * 3. 调用安灯签到接口提交数据
 * 4. 处理提交结果：
 *   - 显示成功提示
 *   - 关闭签到抽屉
 *   - 刷新任务列表数据
 *
 * 接口说明：
 * andonSign - 安灯任务签到接口
 * 参数结构：
 * {
 *   ...表单字段,
 *   andonId: 当前任务ID
 * }
 *
 * 注意事项：
 * - 依赖ant-design-vue的Form组件校验规则
 * - 接口调用为异步操作，需处理加载状态（当前未实现）
 * - 成功后自动重置表单和刷新列表保证数据一致性
 * - 异常情况未处理，需补充catch逻辑
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

/**
 * 设备编号模糊查询
 * 功能：根据输入内容实时查询匹配的设备编号列表
 * 流程：
 * 1. 校验输入值有效性（非空校验）
 * 2. 设置加载状态为true
 * 3. 调用模糊查询接口获取设备列表
 * 4. 更新设备编号列表数据
 * 5. 无论成功失败都关闭加载状态
 *
 * @param val - 用户输入的设备编号关键字
 *
 * 接口说明：
 * fuzzyQueryOfEquipmentNumber - 设备编号模糊查询接口
 * 固定参数：
 *   pageNum: 1      // 固定查询第一页
 *   pageSize: 200    // 每页200条数据
 *
 * 注意事项：
 * - 输入内容为空时不触发查询
 * - 实际调用时使用了防抖处理（500ms）
 * - 接口返回数据直接赋值给响应式列表
 * - 最终需要清除加载状态(fetching)
 */
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
 * 自动选择首条设备记录
 * 功能：在模糊查询结果中自动选择首个设备编号
 * 流程：
 * 1. 检查设备列表是否存在数据
 * 2. 存在数据时选取首条记录的设备编码
 * 3. 无数据时启动延时递归重试机制
 *
 * @param count - 递归调用计数器，默认值0
 *              用于防止无限重试（最大重试次数未显式限制）
 *
 * 注意事项：
 * - 依赖防抖函数确保接口数据已返回
 * - 800ms延时等待符合模糊查询的防抖时间设置
 * - 当持续无数据返回时会形成递归调用链
 * - 实际使用时应考虑增加最大重试次数限制
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
 * 显示异常判定操作抽屉
 * 功能：打开异常判定表单抽屉并初始化编辑数据
 * 流程：
 * 1. 设置异常判定抽屉显示状态为true
 * 2. 深拷贝当前行数据至编辑对象
 * 3. 设置异常填报模式标识
 *
 * @param row - 当前表格行数据对象，包含以下字段：
 *   - id: 异常唯一标识
 *   - andonCode: 关联安灯编号
 *   - 其他异常相关字段
 * @param fillInTheForm - 操作模式标识
 *              true: 异常填报模式
 *              false: 常规判定模式（默认）
 *
 * 注意事项：
 * - 使用对象展开运算符(...)实现浅拷贝，需注意嵌套对象的引用问题
 * - 与closeTheAnomalyDeterminationDrawer构成完整的抽屉生命周期管理
 * - 不同模式下表单字段和接口调用会有差异
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
 * 关闭异常判定抽屉并重置状态
 * 功能：隐藏异常判定抽屉并清理所有关联数据
 * 流程：
 * 1. 设置抽屉显示状态为false
 * 2. 重置异常填报模式标识
 * 3. 重置处理状态标识
 * 4. 重置异常判定表单字段
 * 5. 清空当前编辑的异常对象
 * 6. 清空异常判定表单数据
 * 7. 清空已上传文件列表
 *
 * 注意事项：
 * - 需要同时重置表单实例和响应式数据保证状态完全清除
 * - 清空上传文件列表避免残留显示
 * - 与displayTheAnomalyDeterminationDrawer配合管理抽屉生命周期
 * - 重置顺序遵循从界面状态到数据状态的清理逻辑
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
 * 处理异常判定表单提交
 * 功能：验证并提交异常判定/处理/填报数据
 * 流程：
 * 1. 执行表单字段校验
 * 2. 获取上传文件路径（如果存在）
 * 3. 根据操作模式构造不同请求参数：
 *   - 异常填报模式：携带异常ID和安灯编号
 *   - 常规模式：根据处理状态调用不同接口（问题处理/异常判定）
 * 4. 调用对应接口提交数据
 * 5. 处理提交结果：
 *   - 显示成功提示
 *   - 关闭异常判定抽屉
 *   - 刷新任务列表数据
 *
 * 接口说明：
 * - abnormalFilling       异常填报接口
 * - anomalyDetermination  异常判定接口
 * - problemHandling      问题处理接口
 *
 * 注意事项：
 * - 表单验证失败时不会执行提交
 * - 文件上传为非必填项，但上传后会自动携带路径
 * - 不同模式参数结构有差异需特别注意
 * - 成功后自动清理状态保证数据一致性
 * - 异常情况未处理，需补充catch逻辑
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

/**
 * 处理任务领取确认操作
 * 功能：通过确认弹窗完成安灯任务的领取流程
 * 流程：
 * 1. 弹出确认对话框询问用户
 * 2. 用户取消时显示取消提示
 * 3. 用户确认后调用任务领取接口
 * 4. 成功后刷新任务列表数据
 *
 * @param id - 需要领取的任务唯一标识
 *
 * 接口说明：
 * taskCollection - 任务领取接口，接收任务ID作为参数
 *
 * 注意事项：
 * - 使用ant-design-vue的Modal.confirm组件实现二次确认
 * - 确认按钮使用危险类型强调操作重要性
 * - 成功操作后通过gridApi.reload()刷新表格数据
 * - 标题和按钮文本尚未国际化，需根据项目要求调整
 */
function taskCollectionFun(id: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消删除!');
    },
    onOk() {
      taskCollection(id).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
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
 * 搜索框选项过滤方法
 * 功能：实现选择器组件的自定义搜索过滤逻辑
 *
 * @param input - 用户输入的搜索关键词
 * @param option - 待匹配的选项对象，需包含label属性
 *
 * 实现逻辑：
 * 1. 将输入值和选项标签统一转换为小写
 * 2. 检查选项标签是否包含输入关键词
 *
 * 注意事项：
 * - 匹配过程大小写不敏感
 * - 依赖选项对象的label属性进行匹配
 * - 适用于ant-design-vue选择器的filter-option属性
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
      <div class="flex">
        <Input v-model:value="queryParams.workorderCode" />
        <ScanTheCode
          @scan-the-code="
            (val) => {
              queryParams.workorderCode = val;
            }
          "
        />
      </div>
    </FormItem>
    <!--当前工序 -->
    <FormItem :label="$t('andon.currentOperation')" class="!mb-4">
      <div class="flex">
        <Input v-model:value="queryParams.process" />
        <ScanTheCode
          @scan-the-code="
            (val) => {
              queryParams.process = val;
            }
          "
        />
      </div>
    </FormItem>
    <!--作业位置 -->
    <FormItem :label="$t('andon.jobPosition')" class="!mb-4">
      <div class="flex">
        <Input v-model:value="queryParams.location" />
        <ScanTheCode
          @scan-the-code="
            (val) => {
              queryParams.location = val;
            }
          "
        />
      </div>
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
