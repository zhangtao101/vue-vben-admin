<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { hiprint } from 'vue-plugin-hiprint';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { queryPrintTemplateDetails, savePrintTemplate } from '#/api';
// 组合式函数 hooks
import { usePaper } from '#/assets/hooks/use-paper';
import { useZoom } from '#/assets/hooks/use-zoom';
import { provider } from '#/assets/provider';
// 工具
import { newHiprintPrintTemplate } from '#/assets/utils/template-helper';

const TEMPLATE_KEY = 'print-template'; // 存储模板对象的 key
const {
  paperTypes,
  curPaperType,
  paperPopVisible,
  paperWidth,
  paperHeight,
  showPaperPop,
  setPaper,
  setPaperOther,
} = usePaper(TEMPLATE_KEY);
const { scaleValue, changeScale } = useZoom(TEMPLATE_KEY);

// 初始化 provider
hiprint.init({
  providers: [provider()],
});

/**
 * 构建左侧可拖拽元素
 * 注意: 可拖拽元素必须在 hiprint.init() 之后调用
 * 调用之前 可以先 console.log($("#hiprint-printTemplate")) 看看是否有该 dom
 */
const buildLeftElement = () => {
  // ----- providerModule1 -----

  $('#provider-container1').empty(); // 先清空, 避免重复构建

  hiprint.PrintElementTypeManager.build(
    $('#provider-container1'),
    'providerModule2',
  );
};
/**
 * 构建设计器
 * 注意: 必须要在 onMounted 中去构建
 * 因为都是把元素挂载到对应容器中, 必须要先找到该容器
 */
let hiprintTemplate: any;
// ref 创建的模板json
const templateRef = ref({});
const buildDesigner = () => {
  $('#hiprint-printTemplate').empty(); // 先清空, 避免重复构建
  // 注意事项: 模板json(object)
  // templateRef.value = {};
  // 如果使用 vue ref创建的模板json, 需要使用 .value 获取 (确保内部能够使用 object.key 拿到对应数据就行)
  hiprintTemplate = newHiprintPrintTemplate(TEMPLATE_KEY, {
    template: templateRef.value, // 模板json(object)
    settingContainer: '#PrintElementOptionSetting', // 元素参数容器
  });
  // 构建 并填充到 容器中
  hiprintTemplate.design('#hiprint-printTemplate');
  // console.log(hiprintTemplate);
};

/**
 * 浏览器打印
 */
const print = () => {
  // 参数: 打印时设置 左偏移量，上偏移量
  const options = { leftOffset: -1, topOffset: -1 };
  // 扩展
  const ext = {
    callback: () => {
      // console.log('浏览器打印窗口已打开');
    },
  };
  // 调用浏览器打印
  hiprintTemplate.print(
    {
      test1: {},
    },
    options,
    ext,
  );
};

// ----------------- 模板对象 api 部分 -----------------
/**
 * 旋转纸张
 */
const rotatePaper = () => {
  hiprintTemplate.rotatePaper();
};
/**
 * 清空所有元素
 */
const clearPaper = () => {
  hiprintTemplate.clear();
};

const route = useRoute();
const details = ref<any>(undefined);
/**
 * 查询打印模板详情
 */
function queryDetails() {
  if (route.query?.printCode) {
    queryPrintTemplateDetails(route.query?.printCode).then((res) => {
      if (res.printData) {
        templateRef.value = JSON.parse(res.printData);
      }
      details.value = { ...res };
      buildDesigner();
    });
  } else {
    buildDesigner();
  }
}

/**
 * 导出模板 json
 * 必须确保 hiprintTemplate 已成功创建
 */
const exportJson = () => {
  const json = hiprintTemplate.getJson();
  // message.info(json);
  details.value.printData = JSON.stringify(json);
  savePrintTemplate(details.value).then(() => {
    message.success($t('common.successfulOperation'));
    setTimeout(() => {
      window.close();
    }, 1200);
  });
};

/**
 * 这里必须要在 onMounted 中去构建 左侧可拖拽元素 或者 设计器
 * 因为都是把元素挂载到对应容器中, 必须要先找到该容器
 */
onMounted(() => {
  buildLeftElement();
  queryDetails();
});
</script>

<template>
  <Page>
    <div class="flex-col">
      <div class="flex-row justify-center" style="margin-bottom: 10px">
        <!-- 纸张大小 A3、A4 等 -->
        <div class="paper">
          <template v-for="(value, type) in paperTypes" :key="type">
            <button
              :class="curPaperType === type ? 'api' : 'info'"
              @click="setPaper(type, value)"
            >
              {{ type }}
            </button>
          </template>
          <!-- 自定义纸张 -->
          <button
            :class="'other' === curPaperType ? 'api' : 'info'"
            class="auto"
            @click="showPaperPop"
          >
            自定义纸张
          </button>
          <div class="popover">
            <div class="popover-content flex-col" v-show="paperPopVisible">
              <div style="font-size: 16px; font-weight: bold">
                设置纸张宽高(mm)
              </div>
              <div class="mt-10 flex-row">
                <input
                  class="input"
                  :value="paperWidth"
                  type="number"
                  placeholder="宽(mm)"
                />
                <span class="ml-10 mr-10">x</span>
                <input
                  class="input"
                  :value="paperHeight"
                  type="number"
                  placeholder="高(mm)"
                />
              </div>
              <button
                class="primary circle-10"
                style="margin-top: 6px"
                @click.stop="setPaperOther"
              >
                确定
              </button>
            </div>
          </div>
        </div>
        <!-- 缩放 -->
        <div class="align-center ml-10 flex-row">
          <button class="info circle-10" @click="changeScale(false)">
            <i class="iconfont sv-zoom-out"></i>
          </button>
          <div style="width: 40px; margin: 0 4px">
            {{ (scaleValue * 100).toFixed(0) }}%
          </div>
          <button class="info circle-10" @click="changeScale(true)">
            <i class="iconfont sv-zoom-in"></i>
          </button>
        </div>
        <button class="api circle-10 ml-10" @click.stop="rotatePaper">
          <i class="iconfont sv-rotate"></i>
          旋转纸张(宽高互换)
        </button>
        <button class="api circle-10 ml-10" @click.stop="clearPaper">
          <i class="iconfont sv-clear"></i>
          清空纸张
        </button>
        <button class="api circle-10 ml-10" @click.stop="exportJson">
          <i class="iconfont sv-export"></i>
          保存模板
        </button>
        <button class="secondary circle-10 ml-10" @click.stop="print">
          <i class="iconfont sv-printer"></i>
          打印预览
        </button>
      </div>
      <div class="flex-row" style="height: 87vh">
        <div class="flex-2 left flex-col">
          <div class="title">组件列表</div>
          <!-- provider1 的容器; 加上 class "rect-printElement-types" 使用默认样式 -->
          <!-- 当然可以 重写 或者 自定义样式 -->
          <div
            id="provider-container1"
            class="rect-printElement-types container"
          ></div>
        </div>
        <div class="flex-5 center">
          <!-- 设计器的 容器 -->
          <div id="hiprint-printTemplate"></div>
        </div>
        <div class="flex-2 right">
          <!-- 元素参数的 容器 -->
          <div id="PrintElementOptionSetting"></div>
        </div>
      </div>
    </div>
  </Page>
</template>

<style scoped lang="scss">
@import '/css/iconfont.css';

// flex
@mixin flex-row {
  display: flex;
}

@mixin flex-col {
  display: flex;
  flex-direction: column;
}

@mixin flex-wrap {
  flex-wrap: wrap;
}

@mixin align-center {
  align-items: center;
}

@mixin justify-center {
  justify-content: center;
}

@mixin flex($value) {
  flex: $value;
}

@mixin margin($side, $size) {
  margin-#{$side}: $size;
}

// 定义全局样式
body {
  margin: 0;
}

// scrollbar
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-corner {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-thumb {
  background: purple
    linear-gradient(
      45deg,
      rgb(255 255 255 / 20%) 25%,
      transparent 25%,
      transparent 50%,
      rgb(255 255 255 / 20%) 50%,
      rgb(255 255 255 / 20%) 75%,
      transparent 75%,
      transparent
    );
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: purple;
}

.flex-row {
  @include flex-row;
}

.flex-col {
  @include flex-col;
}

.flex-wrap {
  @include flex-wrap;
}

.align-center {
  @include align-center;
}

.justify-center {
  @include justify-center;
}

.flex-1 {
  @include flex(1);
}

.flex-2 {
  @include flex(2);
}

.flex-3 {
  @include flex(3);
}

.flex-4 {
  @include flex(4);
}

.flex-5 {
  @include flex(5);
}

.ml-10 {
  @include margin(left, 10px);
}

.mr-10 {
  @include margin(right, 10px);
}

.mt-10 {
  @include margin(top, 10px);
}

.mb-10 {
  @include margin(bottom, 10px);
}

// button 样式
button {
  min-width: 40px;
  padding: 10px;
  color: white;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  border-width: 0;
  opacity: 0.9;

  &:hover {
    opacity: 1;
  }

  i {
    font-size: 16px !important;
  }

  &.circle,
  &.circle-4 {
    border-radius: 4px !important;
  }

  &.circle-10 {
    border-radius: 10px !important;
  }

  &.primary {
    background: purple;
  }

  &.info {
    color: #000;
    background: none;

    &:hover {
      color: purple;
      border-color: purple;
    }
  }

  &.secondary {
    background: #1976d2;
  }

  &.warning {
    background: #d32f2f;
  }
}

// modal
.modal {
  padding: 0;
  margin: 0;

  .mask {
    position: fixed;
    inset: 0;
    z-index: 1000;
    height: 100%;
    background-color: #00000073;
  }

  .wrap {
    position: fixed;
    inset: 0;
    z-index: 1000;
    overflow: auto;
    outline: 0;
    background-color: #00000073;

    .box {
      position: relative;
      z-index: 1001;
      width: 40%;
      margin: 10% auto;
      background: #fff;
      border-radius: 4px;
      box-shadow: 0 5px 10px rgb(0 0 0 / 20%);
      transition: all 0.3s ease;

      .modal-box__header {
        padding: 10px 14px;
        border-bottom: 1px solid #e9e9e9;
      }

      .modal-box__footer {
        text-align: end;

        button {
          min-width: 100px;

          &:not(:last-child) {
            margin-right: 10px;
          }
        }
      }
    }
  }
}

// 自定义 provider 构建样式
.custom-style-types {
  .hiprint-printElement-type {
    display: block;
    padding: 0;
    list-style: none;

    > li {
      > .title {
        clear: both;
        display: block;
        padding: 4px 0;
        color: rgb(0 58 230);
      }

      > ul {
        display: block;
        padding: 0;
        list-style: none;

        > li {
          float: left;
          display: block;
          width: 50%;
          max-width: 100px;

          > a {
            box-sizing: border-box;
            display: inline-block;
            width: 95%;
            max-width: 100px;
            padding: 12px 6px;
            margin-right: 5px;
            margin-bottom: 7px;
            color: #1296db;
            text-align: center;
            text-decoration: none;
            background: #fff;
            border: 1px solid #ddd;
            border: 1px solid rgb(0 0 0 / 20%);
            border-radius: 4px;
            box-shadow: 0 1px 0 0 rgb(0 0 0 / 15%);
          }
        }
      }
    }
  }
}

// api按钮
.api {
  background: #00acc1;
}

// 自动宽度样式
.auto {
  width: auto !important;
}

// 纸张样式
.paper {
  margin-right: 10px;

  button {
    &:not(.auto) {
      width: 60px !important;
    }

    + button {
      margin-left: -1px;
    }

    &:first-child:last-child {
      border-radius: 4px;
    }

    &:first-child:not(:last-child) {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }

    &:last-child:not(:first-child) {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }
  }
}

// popover样式
.popover {
  position: absolute;
  z-index: 10;
  margin-top: 10px;

  .popover-content {
    padding: 10px 14px;
    background: white;
    border-radius: 4px;
    box-shadow: 2px 2px 2px 4px rgb(128 0 128 / 20%);
  }

  .input {
    height: 24px;
    padding: 2px 4px;

    &:hover {
      border-color: rgb(245 155 241);
      border-radius: 4px;
    }
  }
}

// 区域样式
.left {
  overflow: auto;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 2px 2px 2px 0 rgb(128 0 128 / 20%);

  .container {
    height: 100%;
    padding: 0 10%;
    overflow: auto;
  }
}

.center {
  padding: 20px;
  margin: 0 10px;
  overflow: auto;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 2px 2px 2px 0 rgb(128 0 128 / 20%);
}

.right {
  padding: 10px 0;
  overflow: auto;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 2px 2px 2px 0 rgb(128 0 128 / 20%);
}

// 左侧拖拽元素样式
.title {
  margin: 4px 0 4px 10px;
  font-size: 16px;
  font-weight: 500;
}

.ep-draggable-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 30px;
  min-height: 60px;
  padding: 4px 10px;
  margin: 10px 8px 4px;
  background: white;
  border-radius: 4px;
  box-shadow: 2px 2px 2px 2px rgb(171 171 171 / 20%);

  .item {
    .iconfont {
      font-size: 1.5rem;
    }

    span {
      font-size: 14px;
    }
  }
}

// 深度选择器
:deep(.obliqueLine) {
  background: #fff
    url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwMCUiIHkyPSIxMDAlIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')
    no-repeat 100% center;
}

:deep(.text-right) {
  text-align: right;
}

:deep(.text-center) {
  text-align: center;
} // 字体样式
</style>
