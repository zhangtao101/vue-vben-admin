<script setup lang="ts">
import { ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button, Drawer, message, Space, Tooltip } from 'ant-design-vue';

import { handAddition, onLightCall } from '#/api';
import AndonCallComponent from '#/util/component/andon/andonCallComponent.vue';

defineProps({
  // 工步id
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心
  workstationCode: {
    type: String,
    default: '',
  },
  // 产品编号
  productCode: {
    type: String,
    default: '',
  },
  // 产品名称
  productName: {
    type: String,
    default: '',
  },
});

// region 显示安灯呼叫
// 安灯呼叫的类型
const andonCallType = ref(1);
// 显示安灯呼叫
const showAndon = ref(false);
// 安灯呼叫对象
const andonCall = ref();

/**
 * 显示安灯呼叫操作界面
 * 功能：根据操作类型初始化并显示安灯呼叫抽屉
 * 流程：
 * 1. 设置安灯操作类型标识
 * 2. 激活抽屉显示状态
 *
 * @param type - 操作类型标识
 *              1: 手工填报模式
 *              2: 安灯呼叫模式
 *
 * 注意事项：
 * - 与close函数配合管理抽屉生命周期
 * - 通过响应式变量控制抽屉显示状态
 * - 类型标识决定表单字段和接口调用方式
 */
function showAndonCall(type: number) {
  andonCallType.value = type;
  showAndon.value = true;
}

/**
 * 处理安灯呼叫表单提交
 * 功能：收集表单数据并提交至后台服务
 * 流程：
 * 1. 从表单组件获取当前输入数据
 * 2. 根据操作类型设置场所标识(place)
 *    - 手工填报模式(1) → place=2 (异常填报)
 *    - 安灯呼叫模式(2) → place=1 (常规呼叫)
 * 3. 调用手填接口提交数据
 * 4. 成功后关闭抽屉并提示操作结果
 *
 * 接口说明：
 * handAddition - 手工填报接口
 * 参数结构：
 * {
 *   ...表单字段,
 *   place: 场所标识
 * }
 *
 * 注意事项：
 * - 需确保andonCall组件已正确初始化
 * - 提交前未显式进行表单验证，依赖组件内部校验
 * - 使用国际化机制处理成功提示信息
 * - 接口调用为异步操作，需处理加载状态（当前未实现）
 * - 异常情况未处理，需补充catch逻辑
 */
function submit() {
  const params = andonCall.value.getValue();
  params.place = andonCallType.value === 1 ? 2 : 1;
  handAddition(params).then(() => {
    close();
    message.success($t('common.successfulOperation'));
  });
}

/**
 * 处理草稿保存及异常填报
 * 功能：将表单数据提交至后台进行暂存或异常记录
 * 流程：
 * 1. 从表单组件获取当前输入数据
 * 2. 调用安灯呼叫接口提交数据
 * 3. 成功后关闭抽屉并提示操作结果
 *
 * 接口说明：
 * onLightCall - 安灯呼叫接口，用于：
 *   - 异常事件上报
 *   - 临时保存处理进度
 *
 * 注意事项：
 * - 当前同时用于草稿保存和异常上报，需注意参数差异
 * - 提交前未显式进行表单验证，依赖组件内部校验
 * - 成功提示通过国际化机制实现多语言支持
 * - 未处理接口异常情况，需补充错误处理逻辑
 * - 与submit函数共享表单数据获取方式
 */
function saveDraft() {
  const params = andonCall.value.getValue();
  onLightCall(params).then(() => {
    close();
    message.success($t('common.successfulOperation'));
  });
}

/**
 * 关闭安灯呼叫
 */
function close() {
  showAndon.value = false;
  andonCallType.value = -1;
}
// endregion
</script>

<template>
  <div class="flex justify-evenly">
    <!-- 手填 -->
    <Tooltip :title="$t('andon.handFill')">
      <Button
        type="primary"
        shape="circle"
        class="!h-28 !w-28"
        @click="showAndonCall(1)"
      >
        <IconifyIcon
          icon="mdi:square-edit-outline"
          class="inline-block align-middle text-4xl"
        />
      </Button>
    </Tooltip>
    <!-- 安灯呼叫 -->
    <Tooltip :title="$t('andon.onLightCall')">
      <Button
        type="primary"
        shape="circle"
        class="!h-28 !w-28"
        @click="showAndonCall(2)"
      >
        <IconifyIcon
          icon="mdi:call-bell-outline"
          class="inline-block align-middle text-4xl"
        />
      </Button>
    </Tooltip>
  </div>
  <!-- 安灯呼叫 -->
  <Drawer
    :title="$t('andon.onLightCall')"
    v-model:open="showAndon"
    placement="top"
    :height="500"
    :footer-style="{ textAlign: 'right' }"
    @close="close"
  >
    <AndonCallComponent
      ref="andonCall"
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="functionId"
      :type="andonCallType"
      :place="andonCallType === 1 ? 2 : 1"
      :product-code="productCode"
      :product-name="productName"
      v-if="showAndon"
    />

    <template #footer>
      <Space>
        <!-- 取消 -->
        <Button @click="close">
          {{ $t('common.cancel') }}
        </Button>
        <template v-if="andonCallType === 1">
          <!-- 暂存 -->
          <Button type="primary" @click="saveDraft(3)">
            {{ $t('common.temporaryStorage') }}
          </Button>
        </template>
        <!-- 提交  -->
        <Button type="primary" @click="submit()">
          {{ $t('common.submit') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped></style>
