<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Drawer,
  FloatButton,
  Space,
  Steps,
} from 'ant-design-vue';

import { listUserList } from '#/api';

const props = defineProps({
  theCurrentlySelectedWorkOrderNumber: {
    type: String,
    default: '',
  },
  checkedProcessName: {
    type: String,
    default: '',
  },
  // 工序ID，用于标识具体的工序，默认为 0
  bindingId: {
    type: Number,
    default: 0,
  },
});

// region 基本样式
const headStyle = {
  backgroundColor: '#5093e2',
  color: '#fff',
};

// endregion

// region 工单选择及其后续选择
// 工单选择抽屉
const workOrdersDrawer = ref(false);
/**
 * 显示抽屉
 */
function showWorkOrders(step: number = 1) {
  workOrdersDrawer.value = true;
  current.value = step;
}

/**
 * 关闭抽屉
 */
function closeWorkOrders() {
  workOrdersDrawer.value = false;
}

// endregion

// region 步骤
const steps = ref([
  {
    title: '前置作业',
  },
  {
    title: '工单操作',
  },
  {
    title: '工步操作',
  },
  {
    title: '工序选择',
  },
]);
const current = ref(0);

function nextStep() {
  if (current.value < steps.value.length - 1) {
    current.value++;
  }
}

function previousStep() {
  if (current.value > 0) {
    current.value--;
  }
}
// endregion

// region 暴露方法

// 暴露 open 方法，供父组件调用
defineExpose({
  closeDrawer: closeWorkOrders,
});

// endregion

// region 上工人员查询

const userList = ref('');
function queryUser() {
  listUserList({
    bindingId: props.bindingId,
    worksheetCode: props.theCurrentlySelectedWorkOrderNumber,
  }).then((data) => {
    userList.value = data.join(',');
  });
}

// endregion
watch(
  () => props.theCurrentlySelectedWorkOrderNumber,
  (newVal) => {
    if (newVal) {
      queryUser();
    }
  },
);
watch(
  () => props.bindingId,
  (newVal) => {
    if (newVal) {
      queryUser();
    }
  },
);

onMounted(() => {
  if (props.theCurrentlySelectedWorkOrderNumber === '') {
    showWorkOrders();
  }
  queryUser();
});
</script>

<template>
  <Card :head-style="headStyle">
    <template #title>
      <span class="text-xl font-black">
        {{ theCurrentlySelectedWorkOrderNumber || '' }}
        ___
        {{ checkedProcessName || '' }}
        ___ {{ userList }}
      </span>
    </template>
    <slot name="stepExecutionC"></slot>
  </Card>

  <FloatButton
    type="primary"
    shape="circle"
    :style="{ right: '24px', bottom: '200px' }"
    @click="showWorkOrders()"
  >
    <template #icon>
      <IconifyIcon icon="mdi:settings" class="text-xl" />
    </template>
  </FloatButton>

  <FloatButton
    type="primary"
    shape="circle"
    :style="{ right: '24px', bottom: '250px' }"
    @click="showWorkOrders(3)"
  >
    <template #icon>
      <IconifyIcon icon="mdi:file-find-outline" class="text-xl" />
    </template>
  </FloatButton>

  <Drawer
    v-model:open="workOrdersDrawer"
    height="100%"
    placement="top"
    :title="$t('dispatchHomework.sentOut')"
    :footer-style="{ textAlign: 'right' }"
    @close="closeWorkOrders()"
  >
    <Steps v-model:current="current" type="navigation" :items="steps" />
    <template v-if="current === 0">
      <slot name="workstation"></slot>
    </template>
    <template v-if="current === 1">
      <slot name="jobInformationC"></slot>
    </template>
    <template v-if="current === 2">
      <div>
        <slot name="processRouteC"></slot>
        <hr class="my-4" />
      </div>
    </template>
    <template v-if="current === 3">
      <div>
        <slot name="operationalMattersC"></slot>
        <hr class="my-4" />

        <slot name="operationEventC"></slot>
      </div>
    </template>

    <!-- 抽屉底部操作按钮 -->
    <template #footer>
      <!-- 按钮组，包含取消和确认按钮 -->
      <Space>
        <!-- 取消按钮，点击后关闭人员操作抽屉 -->
        <Button @click="previousStep">
          {{ $t('common.previousStep') }}
        </Button>
        <!-- 确认按钮，点击后提交人员操作信息 -->
        <Button
          type="primary"
          @click="nextStep"
          v-if="current < steps.length - 1"
        >
          {{ $t('common.nextStep') }}
        </Button>
        <!-- 确认按钮，点击后提交人员操作信息 -->
        <Button type="primary" @click="closeWorkOrders" v-else>
          {{ $t('common.view') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped></style>
