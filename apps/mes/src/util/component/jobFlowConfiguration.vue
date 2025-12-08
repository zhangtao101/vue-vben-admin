<script setup lang="ts">
import { h, ref, watch } from 'vue';

import { MdiAdd } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  CheckboxGroup,
  Drawer,
  Form,
  FormItem,
  FormItemRest,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Switch,
} from 'ant-design-vue';

/**
 * 工艺流程配置组件
 * 用于配置制造执行系统中不同工序的操作规则和参数设置
 * 支持多种操作类型：工序过程、投料、领料、入库、流转、工艺配制采集、工艺过程采集、能源采集、报工作业
 */

// 使用 defineProps 方法定义组件的属性
const defaultProps = defineProps({
  details: {
    default: () => [],
    required: false,
    type: Array<Object>,
  },
  /**
   * 定义一个名为 isOpen 的 prop。
   * 这个 prop 表示组件是否处于打开状态，是一个布尔类型的值。
   *
   * @property {boolean} isOpen - 表示组件的打开状态。
   * @property {boolean} isOpen.required - 标记为必传属性，组件在使用时必须提供这个 prop。
   * @property {string} isOpen.type - 指定 prop 的类型为 Boolean。
   */
  isOpen: {
    required: true, // 表示 isOpen 是一个必需的 prop。
    type: Boolean, // 指定 isOpen 的类型为 Boolean。
  },
  /**
   * 定义一个名为 isShowStatus 的 prop。
   * 这个 prop 表示是否显示状态，是一个布尔类型的值，并且有一个默认值 false。
   *
   * @property {boolean} isShowStatus - 表示是否显示状态。
   * @property {boolean} isShowStatus.default - 提供一个默认值，当没有提供这个 prop 时使用。
   * @property {string} isShowStatus.type - 指定 prop 的类型为 Boolean。
   */
  isShowStatus: {
    default: () => false, // 提供一个默认值，当没有提供这个 prop 时使用
    type: Boolean, // 指定 isShowStatus 的类型为 Boolean
  },
  /**
   * 定义一个名为 parentId 的 prop。
   * 这个 prop 表示组件所属的父级 ID，是一个数字类型的值。
   *
   * @property {number} parentId - 表示组件的父级 ID。
   * @property {boolean} parentId.required - 标记为必传属性，组件在使用时必须提供这个 prop。
   * @property {string} parentId.type - 指定 prop 的类型为 Number。
   */
  parentId: {
    required: true, // 表示 parentId 是一个必需的 prop。
    type: Number, // 指定 parentId 的类型为 Number。
  },
});

// 引入Vue.js中的defineEmits函数，用于定义组件可以发射的事件
const defaultEmits = defineEmits([
  /**
   * 定义一个名为 'update:isOpen' 的事件。
   * 这个事件用于通知父组件 `isOpen` prop 的值已经改变。
   *
   * @event update:isOpen - 当组件的内部状态 `isOpen` 发生变化时，会触发这个事件。
   *                       父组件可以监听这个事件，并根据需要更新其对应的 prop。
   */
  'update:isOpen',

  /**
   * 定义一个名为 'changed' 的事件。
   * 用于通知父组件组件内部发生了某种变化。
   */
  'changed',
]);

// 抽屉是否打开
const drawerOpen = ref(false);

// 操作类型配置数据结构，包含工序流程中所有可能的操作类型及其规则配置
// 该数据为静态配置，不需要响应式处理
const typeOfOperation: {
  // 操作类型中文名称，用于界面显示
  label: string;
  // 该操作类型下的规则配置列表
  rules: {
    // 规则中文名称，用于界面显示
    label: string;
    // 下拉列表选项（当规则类型为5或6时使用）
    options?: {
      label: string; // 选项显示文本
      value: string; // 选项实际值
    }[];
    // 显示条件（可选）
    show?: string;
    /**
     * 规则类型枚举值，对应不同的表单控件类型
     * 1: 开关控件 (Switch) - 用于布尔值配置
     * 2: 数值输入 (InputNumber) - 用于数字类型配置
     * 3: 文本输入 (Input) - 用于字符串类型配置
     * 4: 阈值校验加阈值设定 (Switch + InputNumber) - 用于需要同时配置启用状态和阈值的规则
     * 5: 下拉选项 (Select) - 用于单选配置
     * 6: 多选框 (CheckboxGroup) - 用于多选配置
     */
    type: number;
  }[];
  // 操作类型的唯一标识值，用于后端存储和匹配
  value: number;
}[] = [
  {
    label: '工序过程操作',
    rules: [
      {
        label: '工序记录开停校验',
        type: 1,
      },
    ],
    value: 1,
  },
  {
    label: '投料操作',
    rules: [
      {
        label: '投料类别校验',
        type: 1,
      },
      {
        label: '投料阈值校验',
        type: 4,
      },
    ],
    value: 2,
  },
  {
    label: '领料操作',
    rules: [
      {
        label: '领料类别校验',
        type: 1,
      },
    ],
    value: 3,
  },
  {
    label: '入库操作',
    rules: [
      {
        label: '入库校验',
        type: 1,
      },
    ],
    value: 4,
  },
  {
    label: '流转操作',
    rules: [
      {
        label: '流转校验',
        type: 1,
      },
    ],
    value: 5,
  },
  {
    label: '工艺配制采集',
    rules: [
      {
        label: '配置校验',
        type: 1,
      },
      {
        label: '阈值校验',
        type: 4,
      },
    ],
    value: 6,
  },
  {
    label: '工艺过程采集',
    rules: [
      {
        label: '采集类型设置',
        options: [
          {
            label: '周期采集',
            value: '周期采集',
          },
          {
            label: '启停采集',
            value: '启停采集',
          },
        ],
        type: 5,
      },
      {
        label: '采集频次设置(分钟)',
        type: 2,
      },
      {
        label: '采集通知提醒',
        type: 1,
      },
    ],
    value: 7,
  },
  {
    label: '能源采集',
    rules: [
      {
        label: '采集类型设置',
        options: [
          {
            label: '周期采集',
            value: '周期采集',
          },
          {
            label: '启停采集',
            value: '启停采集',
          },
          {
            label: '班次采集',
            value: '班次采集',
          },
          // 则频次设置为班次的开始结束时
        ],
        type: 5,
      },
      {
        label: '采集频次设置(分钟)',
        type: 2,
      },
      {
        label: '采集通知提醒',
        type: 1,
      },
      {
        label: '采集对象',
        options: [
          {
            label: '电',
            value: '电',
          },
          {
            label: '天然气',
            value: '天然气',
          },
          {
            label: '水煤浆',
            value: '水煤浆',
          },
          {
            label: '焦炉气',
            value: '焦炉气',
          },
        ],
        type: 6,
      },
    ],
    value: 8,
  },
  {
    label: '报工作业',
    rules: [
      {
        label: '报工类型',
        options: [
          {
            label: '周期报工',
            value: '周期报工',
          },
          {
            label: '完工报工',
            value: '完工报工',
          },
          {
            label: '班次报工',
            value: '班次报工',
          },
        ],
        type: 5,
      },
      {
        label: '报工频次设置(分钟)',
        type: 2,
      },
      {
        label: '报工通知提醒',
        type: 1,
      },
      {
        label: '报工内容设置',
        options: [
          {
            label: '产品良品数',
            value: '产品良品数',
          },
          {
            label: '不良品数',
            value: '不良品数',
          },
          {
            label: '总数',
            value: '总数',
          },
          {
            label: '人时',
            value: '人时',
          },
          {
            label: '机时',
            value: '机时',
          },
        ],
        type: 6,
      },
    ],
    value: 9,
  },
];

// region 查询数据及初始化
// 操作详情列表，存储当前配置的所有操作类型及其规则数据
const operationDetails = ref<any[]>([]);

/**
 * 查询并设置流程详情的函数
 * 这个函数负责处理流程配置数据的初始化和转换
 * 主要功能：将传入的详情数据与预定义的操作类型进行匹配，并解析规则数据
 */
function queryProcessSetDetail() {
  // 检查是否有传入的详情数据
  if (defaultProps.details && defaultProps.details.length > 0) {
    // 遍历传入的详情数据
    for (const item of defaultProps.details as any[]) {
      /**
       * 遍历预定义的操作类型数组，寻找与当前项目匹配的操作类型
       * 通过 opType 字段进行匹配，找到对应的操作类型配置
       */
      typeOfOperation.forEach((i: any) => {
        if (item.opType === i.value) {
          /**
           * 解析存储的规则数据 JSON 字符串
           * ruleData 字段存储了之前保存的规则配置，需要转换为对象格式
           */
          item.rules = JSON.parse(item.ruleData);
          /**
           * 为当前项目设置待处理规则列表
           * rulePending 用于界面显示和编辑，包含该操作类型的所有可用规则
           */
          item.rulePending = i.rules;
        }
      });
    }
    // 将处理后的详情数据设置到响应式变量中
    operationDetails.value = [...defaultProps.details];
  } else {
    // 如果没有传入数据，初始化为空数组
    operationDetails.value = [];
  }
  /**
   * 调用 queryProcessSetDetailById 函数，传入 parentId 作为参数。
   * 这个函数返回一个 Promise 对象，我们使用 then 方法来处理成功的响应。
   */
  /* queryProcessSetDetailById(defaultProps.parentId).then((res) => {
    /!**
     * 如果响应结果存在且至少有一个元素，遍历这些元素。
     *!/
    if (res && res.length > 0) {
      for (const item of res) {
        /!**
         * 遍历 typeOfOperation 数组，这个数组可能包含了不同的操作类型。
         * 对于每个操作类型，检查当前流程设置项的 opType 是否与之匹配。
         *!/
        typeOfOperation.forEach((i: any) => {
          if (item.opType === i.value) {
            /!**
             * 如果匹配，解析 item 的 ruleData 属性，这个属性可能是一个 JSON 字符串，
             * 并将其结果赋值给 item 的 rules 属性。
             *!/
            item.rules = JSON.parse(item.ruleData);
            /!**
             * 同时，将当前操作类型的规则赋值给 item 的 rulePending 属性。
             *!/
            item.rulePending = i.rules;
          }
        });
      }
    }
    /!**
     * 最后，将响应结果赋值给 operationDetails，这个值可能是一个响应式变量，
     * 用于在组件中显示流程设置的详细信息。
     *!/
    operationDetails.value = res;
  });*/
}

/**
 * 关闭抽屉组件的函数
 * 执行关闭操作并通知父组件更新状态
 */
function close() {
  // 关闭内部抽屉状态
  drawerOpen.value = false;

  // 向父组件发送更新事件，同步 isOpen 状态为 false
  // 使用 v-model:isOpen 双向绑定的标准方式
  defaultEmits('update:isOpen', false);
}

/**
 * 监听 isOpen 属性变化的观察者
 * 根据父组件传入的 isOpen 状态控制抽屉的显示和数据加载
 */
watch(
  () => defaultProps.isOpen, // 监听源的函数，返回要观察的 props.isOpen
  (val) => {
    // val 是 isOpen 的新值
    if (val && defaultProps.parentId) {
      // 当抽屉需要打开且存在有效的 parentId 时
      queryProcessSetDetail(); // 加载并处理流程配置详情数据
      drawerOpen.value = true; // 打开内部抽屉状态
    } else {
      // 当抽屉需要关闭或缺少必要参数时
      close(); // 执行关闭操作
    }
  },
);

// endregion

// region 表单
// 表单引用，用于表单验证操作
const form = ref();

/**
 * 设置规则的高阶函数
 * 用于根据选择的操作类型动态配置对应的规则参数
 *
 * @param {any} parentLevel - 父级操作对象，包含规则待处理列表和最终规则列表
 * @returns {Function} - 返回一个函数，该函数接受当前选择的操作类型对象并更新规则配置
 */
function setRules(parentLevel: any) {
  // 返回一个闭包函数，用于处理选择操作类型后的规则设置
  return (currentlySelected: any) => {
    // 将选中操作类型的规则模板设置为父级对象的待处理规则
    parentLevel.rulePending = currentlySelected.rules;

    // 清空现有规则列表，为新的规则配置做准备
    parentLevel.rules = [];

    // 遍历待处理规则，为每条规则生成对应的参数对象
    parentLevel.rulePending.forEach((rule: any) => {
      // 创建规则参数对象，用于存储该规则的配置值
      const param: any = {};

      /**
       * 根据规则类型设置默认值
       * 不同类型的规则对应不同的表单控件和默认值
       */
      switch (rule.type) {
        case 1: {
          // 开关控件：默认开启状态
          param[rule.label] = true;
          break;
        }
        case 2: {
          // 数值输入：默认值为0
          param[rule.label] = 0;
          break;
        }
        case 3: {
          // 文本输入：默认为空字符串
          param[rule.label] = '';
          break;
        }
        case 4: {
          // 阈值校验：包含开关和范围两个参数
          param[rule.label] = true; // 校验开关默认开启
          param[`${rule.label}范围`] = 0; // 阈值范围默认为0
          break;
        }
        case 5: {
          // 下拉选择：默认为空字符串
          param[rule.label] = '';
          break;
        }
        case 6: {
          // 多选框：默认为空数组
          param[rule.label] = [];
          break;
        }
      }

      // 将生成的规则参数添加到规则列表中
      parentLevel.rules.push(param);
    });
  };
}

/**
 * 提交表单数据并保存配置
 * 执行表单验证、数据格式化、事件发送和组件关闭等操作
 */
function submit() {
  // 执行表单验证，验证通过后处理提交逻辑
  form.value.validate().then(() => {
    // 构建提交的详情数据数组
    const details: any = [];

    // 遍历所有操作详情，格式化为提交所需的格式
    for (const item of operationDetails.value) {
      details.push({
        opType: item.opType, // 操作类型标识
        ruleData: JSON.stringify(item.rules), // 将规则对象序列化为JSON字符串存储
      });
    }

    // 向父组件发送配置变更事件，传递格式化后的详情数据
    defaultEmits('changed', details);

    // 关闭抽屉组件
    close();
  });
}

// endregion
</script>

<!--
  工艺流程配置组件模板
  使用抽屉布局展示配置界面，支持动态添加、编辑和删除操作类型规则
-->
<template>
  <!-- 右侧抽屉容器，用于展示操作详情配置界面 -->
  <Drawer
    v-model:open="drawerOpen"
    :footer-style="{ textAlign: 'right' }"
    :width="600"
    placement="right"
    title="操作详情配置"
    @close="close"
  >
    <!-- 表单容器，用于配置各种操作类型和规则 -->
    <Form
      ref="form"
      :label-col="{
        span: 6,
      }"
      :model="operationDetails"
      :wrapper-col="{
        span: 18,
      }"
      name="dynamic_form_nest_item"
    >
      <!-- 动态渲染操作详情配置项 -->
      <template v-for="(item, index) of operationDetails" :key="index">
        <!-- 单个操作配置卡片容器，带阴影和圆角样式 -->
        <div class="mb-4 rounded-xl border-2 p-4 shadow-lg shadow-blue-200">
          <!-- 操作类型选择器 -->
          <FormItem
            :rules="{
              required: true,
              message: '该项为必填项',
            }"
            label="操作类型"
          >
            <!-- 下拉选择框，用于选择操作类型 -->
            <Select
              v-model:value="item.opType"
              :options="typeOfOperation"
              class="w-full"
              @change="
                (_value: any, currentlySelected: any) => {
                  setRules(item)(currentlySelected);
                }
              "
            />
          </FormItem>
          <!-- 规则配置区域：仅在有规则时显示 -->
          <template v-if="item.rulePending && item.rulePending.length > 0">
            <!-- 动态渲染每个规则项 -->
            <FormItem
              v-for="(rule, i) of item.rulePending"
              :key="i"
              :label="rule.label"
            >
              <!-- 规则类型1：开关控件 -->
              <template v-if="rule.type === 1">
                <Switch
                  v-model:checked="item.rules[i][rule.label]"
                  checked-children="开"
                  un-checked-children="关"
                />
              </template>
              <!-- 规则类型2：数值输入控件 -->
              <template v-else-if="rule.type === 2">
                <InputNumber v-model:value="item.rules[i][rule.label]" />
              </template>
              <!-- 规则类型3：文本输入控件 -->
              <template v-else-if="rule.type === 3">
                <Input v-model:value="item.rules[i][rule.label]" />
              </template>
              <!-- 规则类型4：开关+数值组合控件（阈值校验） -->
              <template v-else-if="rule.type === 4">
                <Space>
                  <Switch
                    v-model:checked="item.rules[i][rule.label]"
                    checked-children="开"
                    un-checked-children="关"
                  />
                  <FormItemRest>
                    <InputNumber
                      v-model:value="item.rules[i][`${rule.label}范围`]"
                    />
                  </FormItemRest>
                </Space>
              </template>
              <!-- 规则类型5：下拉选择控件 -->
              <template v-else-if="rule.type === 5">
                <Select
                  v-model:value="item.rules[i][rule.label]"
                  :options="rule.options"
                  class="w-full"
                />
              </template>
              <!-- 规则类型6：多选框控件 -->
              <template v-else-if="rule.type === 6">
                <CheckboxGroup
                  v-model:value="item.rules[i][rule.label]"
                  :options="rule.options"
                />
              </template>
            </FormItem>
          </template>

          <!-- 删除操作按钮（非查看状态时显示） -->
          <FormItem v-if="!isShowStatus" :wrapper-col="{ offset: 6, span: 18 }">
            <!-- 删除确认弹窗 -->
            <Popconfirm
              :cancel-text="$t('common.cancel')"
              :ok-text="$t('common.confirm')"
              :title="$t('ui.widgets.deletionConfirmation')"
              @confirm="
                () => {
                  operationDetails.splice(index, 1);
                }
              "
            >
              <Button class="w-full" danger type="primary"> 删除 </Button>
            </Popconfirm>
          </FormItem>
        </div>
      </template>
    </Form>

    <!-- 新增操作按钮（非查看状态时显示） -->
    <Button
      v-if="!isShowStatus"
      :icon="h(MdiAdd, { class: 'inline-block size-6' })"
      class="w-full"
      type="dashed"
      @click="
        () => {
          operationDetails.push({});
        }
      "
    >
      新增
    </Button>

    <!-- 抽屉底部操作按钮区域 -->
    <template #footer>
      <Space>
        <!-- 取消按钮：关闭抽屉并取消修改 -->
        <Button @click="close">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认按钮：验证表单并保存配置 -->
        <Button type="primary" @click="submit">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<!-- 组件样式：当前使用 scoped 样式，暂无自定义样式规则 -->
<style scoped></style>
