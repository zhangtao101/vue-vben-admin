<script setup lang="ts">
import { h, ref, watch } from 'vue';

import { MaterialSymbolsLightAdd } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  CheckboxGroup,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Switch,
} from 'ant-design-vue';

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

// 操作类型, 不需要响应式
const typeOfOperation: {
  // 操作类型中文名
  label: string;
  rules: {
    // 规则中文名
    label: string;
    // 下拉列表选项
    options?: {
      label: string;
      value: string;
    }[];
    // 显示条件
    show?: string;
    /**
     * 规则类型
     * 1: 开关
     * 2: 数值输入
     * 3: 文本输入
     * 4: 阈值校验加阈值设定
     * 5: 下拉选项
     * 6: 多选框
     */
    type: number;
  }[];
  // 操作类型值
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
// 操作详情
const operationDetails = ref<any[]>([]);

/**
 * 查询并设置流程详情的函数。
 * 这个函数通过调用 queryProcessSetDetailById 函数来获取与 parentId 相关的流程设置详情，
 * 然后根据获取到的数据更新组件的状态。
 */
function queryProcessSetDetail() {
  if (defaultProps.details && defaultProps.details.length > 0) {
    for (const item of defaultProps.details as any[]) {
      /**
       * 遍历 typeOfOperation 数组，这个数组可能包含了不同的操作类型。
       * 对于每个操作类型，检查当前流程设置项的 opType 是否与之匹配。
       */
      typeOfOperation.forEach((i: any) => {
        if (item.opType === i.value) {
          /**
           * 如果匹配，解析 item 的 ruleData 属性，这个属性可能是一个 JSON 字符串，
           * 并将其结果赋值给 item 的 rules 属性。
           */
          item.rules = JSON.parse(item.ruleData);
          /**
           * 同时，将当前操作类型的规则赋值给 item 的 rulePending 属性。
           */
          item.rulePending = i.rules;
        }
      });
    }
    operationDetails.value = [...defaultProps.details];
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
 * 关闭组件的函数。
 * 这个函数用于关闭组件，并通知父组件更新相关的状态。
 */
function close() {
  /**
   * 将 drawerOpen 的值设置为 false。
   * drawerOpen 可能是一个响应式变量，用于控制组件的显示状态。
   * 当设置为 false 时，组件会被隐藏。
   */
  drawerOpen.value = false;

  /**
   * 使用 defaultEmits 发射一个名为 'update:isOpen' 的事件。
   * 这个事件用于通知父组件 `isOpen` 属性应该更新为 false。
   * 父组件可以监听这个事件，并根据需要更新其对应的 `isOpen` prop。
   *
   * @param {boolean} false - 发射事件时传递的值，表示 isOpen 应该设置为 false。
   */
  defaultEmits('update:isOpen', false);
}

/**
 * 使用 Vue.js 的 watch 函数来观察 defaultProps.isOpen 的变化。
 * 当 isOpen 的值变化时，这个观察者会根据新的值来执行相应的操作。
 *
 * @param {Function} source - 一个返回需要观察的源的函数，这里是 defaultProps.isOpen。
 * @param {Function} callback - 当观察到的源变化时，会调用这个回调函数。
 */
watch(
  () => defaultProps.isOpen, // 观察的源是 defaultProps.isOpen。
  (val) => {
    // 回调函数接受一个参数 val，它是 defaultProps.isOpen 的新值。
    /**
     * 如果 val 为 true 且 defaultProps.parentId 存在，
     * 则执行以下操作：
     */
    if (val && defaultProps.parentId) {
      queryProcessSetDetail(); // 调用 queryProcessSetDetail 函数来查询流程设置详情。
      drawerOpen.value = true; // 将 drawerOpen 的值设置为 true，打开抽屉组件。
    } else {
      close(); // 如果 val 为 false 或 defaultProps.parentId 不存在，调用 close 函数来关闭抽屉组件。
    }
  },
);

// endregion

// region 表单
// 表单对象
const form = ref();
/**
 * 设置规则的方法，用于根据当前选择的规则更新父级对象的规则设置。
 *
 * @param {any} parentLevel - 父级对象，包含了规则待处理列表和最终的规则列表。
 * @returns {Function} - 返回一个函数，该函数接受当前选择的对象，并根据其规则更新父级对象。
 */
function setRules(parentLevel: any) {
  // 返回一个函数，这个函数将被调用来更新父级对象的规则。
  return (currentlySelected: any) => {
    /**
     * 将当前选择的规则赋值给父级对象的规则待处理列表。
     * 这个步骤是为了准备将这些规则应用到父级对象上。
     */
    parentLevel.rulePending = currentlySelected.rules;

    /**
     * 清空父级对象的规则列表，为新的规则设置做准备。
     * 每次设置新规则前都需要清空旧的规则，以避免规则累积。
     */
    parentLevel.rules = [];

    /**
     * 遍历规则待处理列表，对每一条规则进行处理。
     * 这一步是为了将待处理的规则转换为父级对象能够识别和应用的格式。
     */
    parentLevel.rulePending.forEach((rule: any) => {
      // 定义一个临时对象，用于存储转换后的规则参数。
      const param: any = {};

      /**
       * 根据规则的类型，设置对应的参数值。
       * 规则的类型决定了参数的值和格式。
       */
      switch (rule.type) {
        case 1: {
          // 如果规则类型为1，设置对应的标签值为true。
          param[rule.label] = true;
          break;
        }
        case 2: {
          // 如果规则类型为2，设置对应的标签值为0。
          param[rule.label] = 0;
          break;
        }
        case 3: {
          // 如果规则类型为3，设置对应的标签值为一个空字符串。
          param[rule.label] = '';
          break;
        }
        case 4: {
          // 如果规则类型为4，设置对应的标签值为true，并添加一个范围标签，其值为0。
          param[rule.label] = true;
          param[`${rule.label}范围`] = 0;
          break;
        }
        case 5: {
          // 如果规则类型为5，设置对应的标签值为一个空字符串。
          param[rule.label] = '';
          break;
        }
        case 6: {
          // 如果规则类型为6，设置对应的标签值为一个空数组。
          param[rule.label] = [];
          break;
        }
      }

      /**
       * 将转换后的规则参数添加到父级对象的规则列表中。
       * 这样，每一条待处理的规则都被转换成了父级对象可以理解和应用的规则。
       */
      parentLevel.rules.push(param);
    });
  };
}

/**
 * 提交表单的函数。
 * 这个函数用于处理表单的提交操作，包括验证表单、构建提交参数、
 * 执行添加或编辑流程设置的操作，并在操作完成后关闭抽屉并显示相应的提示信息。
 */
function submit() {
  /**
   * 使用 form.value.validate() 方法验证表单。
   * 这个方法返回一个 Promise 对象，我们使用 then 方法来处理验证通过的情况。
   */
  form.value.validate().then(() => {
    /**
     * 校验通过后的操作。
     */
    // 构建提交参数。
    const details: any = [];

    /**
     * 遍历 operationDetails.value 数组，构建每个流程设置项的提交参数。
     */
    for (const item of operationDetails.value) {
      details.push({
        opType: item.opType, // 操作类型。
        ruleData: JSON.stringify(item.rules), // 将规则对象转换为 JSON 字符串。
      });
    }
    defaultEmits('changed', details);
    close();
  });
}

// endregion
</script>

<template>
  <Drawer
    v-model:open="drawerOpen"
    :footer-style="{ textAlign: 'right' }"
    :width="600"
    placement="right"
    title="操作详情配置"
    @close="close"
  >
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
      <template v-for="(item, index) of operationDetails" :key="index">
        <div class="mb-4 rounded-xl border-2 p-4 shadow-lg shadow-blue-200">
          <FormItem
            :name="[index, 'opType']"
            :rules="{
              required: true,
              message: '该项为必填项',
            }"
            label="操作类型"
          >
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
          <template v-if="item.rulePending && item.rulePending.length > 0">
            <FormItem
              v-for="(rule, i) of item.rulePending"
              :key="i"
              :label="rule.label"
              :name="['rules', index, rule.label]"
            >
              <template v-if="rule.type === 1">
                <Switch
                  v-model:checked="item.rules[i][rule.label]"
                  checked-children="开"
                  un-checked-children="关"
                />
              </template>
              <template v-else-if="rule.type === 2">
                <InputNumber v-model:value="item.rules[i][rule.label]" />
              </template>
              <template v-else-if="rule.type === 3">
                <Input v-model:value="item.rules[i][rule.label]" />
              </template>
              <template v-else-if="rule.type === 4">
                <Space>
                  <Switch
                    v-model:checked="item.rules[i][rule.label]"
                    checked-children="开"
                    un-checked-children="关"
                  />
                  <InputNumber
                    v-model:value="item.rules[i][`${rule.label}范围`]"
                  />
                </Space>
              </template>
              <template v-else-if="rule.type === 5">
                <Select
                  v-model:value="item.rules[i][rule.label]"
                  :options="rule.options"
                  class="w-full"
                />
              </template>
              <template v-else-if="rule.type === 6">
                <CheckboxGroup
                  v-model:value="item.rules[i][rule.label]"
                  :options="rule.options"
                />
              </template>
            </FormItem>
          </template>

          <FormItem v-if="!isShowStatus" :wrapper-col="{ offset: 6, span: 18 }">
            <Popconfirm
              :cancel-text="$t('common.cancel')"
              :ok-text="$t('common.confirm')"
              :title="$t('widgets.deletionConfirmation')"
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
    <Button
      v-if="!isShowStatus"
      :icon="h(MaterialSymbolsLightAdd, { class: 'inline-block size-6' })"
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

    <template #footer>
      <Space>
        <!-- 取消 -->
        <Button @click="close">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认 -->
        <Button type="primary" @click="submit">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped></style>
