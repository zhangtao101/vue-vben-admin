<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiChevronDown, MdiChevronUp } from '@vben/icons';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Col,
  FloatButton,
  InputNumber,
  Popover,
  Row,
} from 'ant-design-vue';

defineProps({
  theCurrentlySelectedWorkOrderNumber: {
    type: String,
    default: '',
  },
});
// region 作业信息收缩
// 作业信息是否收缩
const jobInformationContraction = ref(true);

/**
 * 作业信息收缩展开
 */
function jobInformationContractionChange() {
  jobInformationContraction.value = !jobInformationContraction.value;
}
// endregion

// region 工艺路线 收缩
// 工艺路线是否收缩
const processShrinkage = ref(true);

/**
 * 作业信息收缩展开
 */
function processShrinkageChange() {
  processShrinkage.value = !processShrinkage.value;
}
// endregion

// region 操作事项收缩
// 操作事项是否收缩
const operationEventShrinkage = ref(true);

/**
 * 作业信息收缩展开
 */
function operationEventShrinkageChange() {
  operationEventShrinkage.value = !operationEventShrinkage.value;
}
// endregion

// region 页面缩放
// 定义一个响应式变量，用于存储当前的缩放比例，默认值为 80（表示 80% 的缩放比例）
const zoomSize = ref(100);
// 是否显示输入框
const isZoom = ref(false);

// 定义一个响应式变量，用于存储需要缩放的页面对象（DOM 元素）
const page = ref();

/**
 * 设置页面的缩放比例
 * @param size - 缩放比例值（百分比形式，如 80 表示 80%）
 * @description
 * - 该函数通过修改页面对象的 `style.zoom` 属性来实现缩放效果。
 * - `size` 参数是一个数字，表示缩放比例的百分比值。
 */
function zoom(size: any) {
  // 将缩放比例值设置到页面对象的 `style.zoom` 属性中，格式为百分比字符串
  page.value.style.zoom = `${size}%`;
  localStorage.setItem('zoomSize', size);
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

// 在组件挂载完成后执行的操作
onMounted(() => {
  const zoomSizeStr = localStorage.getItem('zoomSize');
  zoomSize.value = zoomSizeStr ? Number.parseInt(zoomSizeStr, 10) : 100;
  // 根据当前的缩放比例值（zoomSize.value）设置页面的缩放
  zoom(zoomSize.value);
});

// 在组件卸载前执行的操作
onBeforeUnmount(() => {
  // 将页面缩放比例重置为 100%，确保组件卸载后页面恢复默认缩放比例
  zoom(100);
});
</script>

<template>
  <!-- 页面容器组件 -->
  <Page>
    <!-- 固定在页面右上角的缩放控件 -->
    <div class="fixed right-[20px] top-[110px] z-[999]">
      <!-- 输入数字组件，用于调整页面缩放比例 -->

      <Popover
        v-model:open="isZoom"
        title="缩放比例"
        trigger="click"
        placement="topRight"
      >
        <template #content>
          <InputNumber
            v-model:value="zoomSize"
            :min="50"
            :max="200"
            addon-after="%"
            @change="zoom"
          />
        </template>

        <FloatButton
          type="primary"
          shape="circle"
          :style="{ right: '24px', bottom: '100px' }"
          @click="isZoom = true"
        >
          <template #icon>
            <Icon icon="mdi:image-size-select-small" class="text-xl" />
          </template>
        </FloatButton>
      </Popover>
    </div>
    <!-- 页面主体内容容器，引用 page 用于缩放操作 -->
    <div ref="page" class="w-full">
      <slot name="workstation"></slot>
      <!--- region 作业信息 -->
      <!-- 行容器，用于布局作业信息标题和收缩按钮 -->
      <Row class="mb-4">
        <!-- 列容器，占据 23 格宽度，显示作业信息标题 -->
        <Col :span="24">
          <span class="border-l-4 border-sky-500 pl-4 text-xl font-black">
            {{ $t('productionOperation.jobInformation') }}
          </span>

          <Button
            type="link"
            @click="jobInformationContractionChange"
            class="float-right"
          >
            <!-- 展开按钮 -->
            <MdiChevronDown
              v-if="!jobInformationContraction"
              class="float-right inline-block cursor-pointer text-4xl"
            />

            <!-- 收缩按钮 -->
            <MdiChevronUp
              v-else
              class="float-right inline-block cursor-pointer text-4xl"
            />
          </Button>
        </Col>
      </Row>
      <!-- 卡片容器，当作业信息未收缩时显示 -->
      <Card class="mb-5" v-if="jobInformationContraction">
        <slot name="jobInformationC"></slot>
      </Card>
      <!-- 分割线 -->
      <hr class="mb-4" />
      <!--- endregion -->

      <!--- region 工艺路线 -->
      <!-- 行容器，用于布局工艺路线标题和收缩按钮 -->
      <Row class="mb-4">
        <!-- 列容器，占据 23 格宽度，显示工艺路线标题 -->
        <Col :span="24">
          <span class="border-l-4 border-sky-500 pl-4 text-xl font-black">
            {{ $t('productionOperation.processRoute') }}
          </span>

          <!-- 展开按钮 -->
          <Button
            type="link"
            @click="processShrinkageChange"
            class="float-right"
          >
            <!-- 展开按钮 -->
            <MdiChevronDown
              v-if="!processShrinkage"
              class="float-right inline-block cursor-pointer text-4xl"
            />
            <!-- 收缩按钮 -->
            <MdiChevronUp
              v-else
              class="float-right inline-block cursor-pointer text-4xl"
            />
          </Button>
        </Col>
      </Row>
      <!-- 卡片容器，当工艺路线收缩时显示 -->
      <Card class="mb-5" v-if="processShrinkage">
        <slot name="processRouteC"></slot>
      </Card>
      <!-- 分割线 -->
      <hr class="mb-4" />
      <!--- endregion -->

      <!--- region 操作事项  -->
      <!-- 行容器，用于布局操作事项标题和操作事项选择器 -->
      <Row class="mb-4">
        <!-- 列容器，占据 23 格宽度，显示操作事项标题和选择器 -->
        <Col :span="24">
          <!-- 显示操作事项标题，带有蓝色边框 -->
          <span class="mr-4 border-l-4 border-sky-500 pl-4 text-xl font-black">
            {{ $t('productionOperation.operationalMatters') }}
          </span>
          <!-- 操作事项选择器，使用单选按钮组 -->
          <slot name="operationalMattersC"></slot>

          <!-- 展开按钮 -->
          <Button
            type="link"
            @click="operationEventShrinkageChange"
            class="float-right"
          >
            <!-- 展开按钮 -->
            <MdiChevronDown
              v-if="!operationEventShrinkage"
              class="float-right inline-block cursor-pointer text-4xl"
            />
            <!-- 收缩按钮 -->
            <MdiChevronUp
              v-else
              class="float-right inline-block cursor-pointer text-4xl"
            />
          </Button>
        </Col>
      </Row>
      <!-- 卡片容器，当操作事项收缩时显示操作事项组件 -->
      <Card v-if="operationEventShrinkage" class="mb-5">
        <slot name="operationEventC"></slot>
      </Card>
      <!-- 分割线 -->
      <hr class="mb-4" />
      <!--- endregion -->

      <!--- region 工步执行  -->
      <!-- 行容器，用于布局工步执行标题和收缩按钮 -->
      <div
        id="stepExecution"
        class="bg-[#f1f3f6]"
        :class="{
          'h-full overflow-y-auto pb-8': isItFullScreen,
        }"
      >
        <Row class="mb-4">
          <!-- 列容器，占据 4 格宽度，显示工步执行标题 -->
          <Col :span="24">
            <span class="border-l-4 border-sky-500 pl-4 text-xl font-black">
              {{ $t('productionOperation.workStepExecution') }}
              ___
              {{ theCurrentlySelectedWorkOrderNumber || '' }}
            </span>

            <!-- 全屏按钮 -->
            <Button
              type="link"
              @click="fullScreen()"
              class="absolute right-0 top-0"
            >
              <Icon
                :icon="
                  isItFullScreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'
                "
                class="inline-block align-middle text-4xl"
              />
            </Button>
          </Col>
        </Row>
        <!-- 卡片容器，当工步执行收缩时显示工步执行组件 -->
        <Card class="mb-5 min-h-72">
          <slot name="stepExecutionC"></slot>
        </Card>
      </div>
      <!-- endregion -->
    </div>
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

.rainbow {
  position: relative;
  z-index: 0;
  width: 400px;
  height: 300px;
  padding: 2rem;
  overflow: hidden;
  border-radius: 10px;

  &::before {
    position: absolute;
    top: -50%;
    left: -50%;
    z-index: -2;
    width: 200%;
    height: 200%;
    content: '';
    background-color: #399953;
    background-image:
      linear-gradient(#399953, #399953), linear-gradient(#fbb300, #fbb300),
      linear-gradient(#d53e33, #d53e33), linear-gradient(#377af5, #377af5);
    background-repeat: no-repeat;
    background-position:
      0 0,
      100% 0,
      100% 100%,
      0 100%;
    background-size:
      50% 50%,
      50% 50%;
    animation: rotate 4s linear infinite;
  }

  &::after {
    position: absolute;
    top: 6px;
    left: 6px;
    z-index: -1;
    width: calc(100% - 12px);
    height: calc(100% - 12px);
    content: '';
    background: white;
    border-radius: 5px;
    opacity: 1;
  }
}
</style>
