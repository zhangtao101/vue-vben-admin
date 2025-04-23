<script setup lang="ts">
import { ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button, Drawer, message, Space, Tooltip } from 'ant-design-vue';

import { handAddition, onLightCall } from '#/api';
import AndonCallComponent from '#/util/component/andon/andonCallComponent.vue';

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
  // todo 设定 place 手填: 1 呼叫:2 草稿:3
}

/**
 * 提交安灯呼叫
 */
function submit() {
  const params = andonCall.value.getValue();
  params.place = 1;
  handAddition(params).then(() => {
    close();
    message.success($t('common.successfulOperation')); // 成功操作的提示信息（通过国际化处理）
  });
}
/**
 * 保存草稿 / 异常填报
 */
function saveDraft(place: 2 | 3) {
  const params = andonCall.value.getValue();
  params.place = place;
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
    <AndonCallComponent ref="andonCall" :type="andonCallType" />

    <template #footer>
      <Space>
        <!-- 取消 -->
        <Button @click="close">
          {{ $t('common.cancel') }}
        </Button>
        <template v-if="andonCallType === 1">
          <!-- 异常填报 -->
          <Button type="primary" @click="saveDraft(2)">
            {{ $t('common.abnormalFilling') }}
          </Button>
          <!-- 草稿箱 -->
          <Button type="primary" @click="saveDraft(3)">
            {{ $t('common.drafts') }}
          </Button>
        </template>
        <template v-if="andonCallType === 2">
          <!-- 呼叫  -->
          <Button type="primary" @click="submit()">
            {{ $t('common.callOut') }}
          </Button>
        </template>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped></style>
