<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Col,
  Form,
  FormItem,
  Input,
  Row,
  Select,
} from 'ant-design-vue';

import { inReportByScanCode } from '#/api';
import OperationalMatters from '#/util/component/operationalMatters.vue';
import StepExecution from '#/util/component/stepExecution.vue';
import ExitReport from "#/util/component/steps/exitReport.vue";
// endregion

const props = defineProps(['details']);

// region 进站
// 参数
const pitStopParameters = ref<any>({});
// 设备列表
const options = computed(() => {
  return props.details.equipCodes.map((item: string) => {
    return {
      label: item,
      value: item,
    };
  });
});

const isPush = ref(false);
const ispitStop = ref(false);
/**
 * 进站
 */
function pitStop() {
  const params = {
    ...pitStopParameters.value,
    workstationCode: props.details.workstationCode,
    bindingId: props.details.bindingId,
    functionId: props.details.functionId,
  };
  isPush.value = true;
  inReportByScanCode(params)
    .then(() => {
      ispitStop.value = true;
    })
    .finally(() => {
      isPush.value = false;
    });
}

// endregion

// region 工步

// 当前工步
const currentWorkingStep = ref<any>();
/**
 * 工步切换
 * @param val
 */
function workStepConversion(val: any) {
  currentWorkingStep.value = {
    ...val,
  };
}

// endregion

// region 操作全屏
// 是否全屏
const isItFullScreen = ref(false);
/**
 * 全屏显示组件
 */
function fullScreen() {
  const el: any = document.querySelector('#stepExecution');
  if (el) {
    if (el.requestFullscreen) {
      // 检查并调用标准的退出全屏方法
      if (isItFullScreen.value) (document as any).exitFullscreen();
      else el.requestFullscreen();
    } else if (el.mozRequestFullScreen) {
      // Firefox特定方法
      if (isItFullScreen.value) (document as any).mozCancelFullScreen();
      else el.mozRequestFullScreen();
    } else if (el.webkitRequestFullscreen) {
      // Chrome、Safari等WebKit内核浏览器特定方法
      if (isItFullScreen.value) (document as any).webkitExitFullscreen();
      else el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
      // IE/Edge特定方法
      if (isItFullScreen.value) (document as any).msExitFullscreen();
      else el.msRequestFullscreen();
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Safari/Chrome
    document.addEventListener('mozfullscreenchange', handleFullscreenChange); // Firefox
    document.addEventListener('MSFullscreenChange', handleFullscreenChange); // IE
  }
}

// 监听全屏变化事件
function handleFullscreenChange() {
  isItFullScreen.value = !!document.fullscreenElement;
  if (!isItFullScreen.value) {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener(
      'webkitfullscreenchange',
      handleFullscreenChange,
    );
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
  }
}
// endregion

// region 重置

function reset() {
  pitStopParameters.value.worksheetCode = '';
  ispitStop.value = false;
}

// endregion

// 在组件挂载完成后执行的操作
onMounted(() => {
  if (
    props.details.equipCodes.length > 0 &&
    !pitStopParameters.value.equipCode
  ) {
    pitStopParameters.value.equipCode = props.details.equipCodes[0] || '';
  }
});
</script>

<template>
  <Page>
    <Card v-if="!ispitStop">
      <Form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <!--工单编号 -->
        <FormItem :label="$t('productionOperation.workOrderNumber')">
          <Input v-model:value="pitStopParameters.worksheetCode" />
        </FormItem>
        <!--设备编号 -->
        <FormItem :label="$t('productionOperation.equipmentNumber')">
          <Select
            v-model:value="pitStopParameters.equipCode"
            :options="options"
          />
        </FormItem>
        <!--进站 -->
        <FormItem :wrapper-col="{ span: 18, offset: 6 }">
          <Button
            class="w-full"
            type="primary"
            @click="pitStop"
            :loading="isPush"
          >
            {{ $t('common.confirm') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <template v-else>
      <!--- region 操作事项  -->
      <!-- 行容器，用于布局操作事项标题和操作事项选择器 -->
      <Row class="mb-4">
        <!-- 列容器，占据 23 格宽度，显示操作事项标题和选择器 -->
        <Col :span="24">
          <!-- 显示操作事项标题，带有蓝色边框 -->
          <span class="mr-4 border-l-4 border-sky-500 pl-4 text-xl font-black">
            {{ $t('productionOperation.operationalMatters') }}
          </span>

          <Button type="primary" @click="reset">
            {{ $t('common.reset') }}
          </Button>
        </Col>
      </Row>
      <!-- 卡片容器，当操作事项收缩时显示操作事项组件 -->
      <Card class="mb-5">
        <OperationalMatters
          :details-id="details.opDetailId"
          :type="1"
          :worksheet-code="pitStopParameters.worksheetCode"
          :current-index="1"
          @current-change="workStepConversion"
          v-if="details.opDetailId"
        />
      </Card>
      <!-- 分割线 -->
      <hr class="mb-4" />
      <!--- endregion -->
      <!-- 卡片容器，当工步执行收缩时显示工步执行组件 -->

      <div
        id="stepExecution"
        class="bg-[#f1f3f6]"
        :class="{
          'h-full overflow-y-auto pb-8': isItFullScreen,
        }"
      >
        <Card class="mb-5 min-h-72">
          <!-- 全屏按钮 -->
          <Button
            type="link"
            @click="fullScreen()"
            class="absolute right-0 top-0"
          >
            <Icon
              :icon="isItFullScreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'"
              class="inline-block align-middle text-4xl"
            />
          </Button>
          <StepExecution
            :workstation-code="details.workstationCode"
            :equip-code="details.equipCode"
            :worksheet-code="pitStopParameters.worksheetCode"
            :product-code="details.productCode"
            :product-name="details.productName"
            :binding-id="details.bindingId"
            :step="currentWorkingStep"
            @complete="reset"
            v-if="currentWorkingStep"
          />
        </Card>
      </div>
    </template>
  </Page>
</template>

<style scoped lang="scss">
:deep(.ant-tabs-tab) {
  font-size: 18px;
}

.anomaly {
  animation: alarm 1s infinite;
}

@keyframes alarm {
  0%,
  100% {
    border-color: transparent;
  }

  50% {
    border-color: red;
  }
}

@keyframes rotate {
  100% {
    transform: rotate(1turn);
  }
}
</style>
