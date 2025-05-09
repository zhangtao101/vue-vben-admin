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
 * 显示安灯呼叫
 * @param type 1: 手填 2: 安灯呼叫
 */
function showAndonCall(type: number) {
  andonCallType.value = type;
  showAndon.value = true;
}

/**
 * 提交安灯呼叫
 */
function submit() {
  const params = andonCall.value.getValue();
  params.place = andonCallType.value === 1 ? 2 : 1;
  handAddition(params).then(() => {
    close();
    message.success($t('common.successfulOperation')); // 成功操作的提示信息（通过国际化处理）
  });
}
/**
 * 保存草稿 / 异常填报
 */
function saveDraft() {
  const params = andonCall.value.getValue();
  onLightCall(params).then(() => {
    close();
    message.success($t('common.successfulOperation')); // 成功操作的提示信息（通过国际化处理）
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
