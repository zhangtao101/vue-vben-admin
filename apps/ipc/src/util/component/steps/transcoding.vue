<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Col,
  Input,
  List,
  ListItem,
  message,
  Modal,
  Row,
  Spin,
  Tooltip,
} from 'ant-design-vue';

import {
  checkCodeBinding,
  handleMaulSncode,
  listByCodeScan,
  listHCByCodeScan,
  snCodeBinding,
  snCodeBindingCallBack,
} from '#/api';
import ScanTheCode from '#/util/component/scanTheCode.vue';

/**
 * 定义组件的 props，用于接收父组件传递的数据
 */
const props = defineProps({
  // 工步id，用于标识具体的工步，默认为 0
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID，用于标识具体的工序，默认为 0
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号，用于标识具体的工单，默认为空字符串
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号，用于标识具体的设备，默认为空字符串
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心，用于标识具体的工作中心，默认为空字符串
  workstationCode: {
    type: String,
    default: '',
  },
  // 显示类型，用于控制页面展示的内容，默认为 0
  showTypeNumber: {
    type: Number,
    default: 0,
  },
});

/**
 * 获取标签的 class，用于统一标签的样式
 * @returns {string} 标签的 class 字符串
 */
function getLabelClass() {
  return 'inline-block w-full border p-2 text-center';
}

// region 绑码
/**
 * 存储源码的响应式变量，初始值为空字符串
 */
const sourceCode = ref('');
/**
 * 源码输入框的引用，用于操作输入框的 DOM 元素
 */
const sourceCodeRef = ref();
/**
 * 存储转码的响应式变量，初始值为空字符串
 */
const transcoding = ref('');
/**
 * 转码输入框的引用，用于操作输入框的 DOM 元素
 */
const transcodingRef = ref();
/**
 * 存储错误信息的响应式变量，初始值为空字符串
 */
const errorMessage = ref('');

/**
 * 当源码输入框的值发生变化或按下回车键时触发的函数
 * 功能：根据显示类型验证源码，并进行绑码操作
 * 流程：
 * 1. 若显示类型为 30，调用 API 验证源码
 * 2. 根据验证结果显示错误信息或进行绑码
 * 3. 验证通过后聚焦到转码输入框
 * 4. 非 30 类型时直接进行绑码并聚焦转码输入框
 */
function sourceCodeChange() {
  if (props.showTypeNumber === 30) {
    // 调用 API 验证源码
    handleMaulSncode({
      workstationCode: props.workstationCode,
      equipCode: props.equipCode,
      worksheetCode: props.worksheetCode,
      bindingId: props.bindingId,
      functionId: props.functionId,
      snCode: sourceCode.value,
    })
      .then((data) => {
        // 根据验证结果设置错误信息
        errorMessage.value = data.error === '通过' ? '' : data.error;
        if (errorMessage.value) {
          // 验证失败，显示错误信息
          message.error(errorMessage.value);
        } else {
          // 验证通过，进行绑码操作并聚焦转码输入框
          bindCode();
          transcodingRef.value.focus();
        }
      })
      .finally(() => {
        // 无论验证结果如何，结束加载状态
        spinning.value = false;
      });
  } else {
    // 非 30 类型，直接进行绑码操作并聚焦转码输入框
    bindCode();
    transcodingRef.value.focus();
  }
}

/**
 * 当转码输入框的值发生变化或按下回车键时触发的函数
 * 功能：进行绑码操作并聚焦到源码输入框
 */
function transcodingChange() {
  // 进行绑码操作
  bindCode();
  // 聚焦到源码输入框
  sourceCodeRef.value.focus();
}

/**
 * 执行绑码操作的函数
 * 功能：当源码和转码都存在时，调用 add 函数添加绑定记录
 */
function bindCode() {
  if (sourceCode.value && transcoding.value) {
    // 源码和转码都存在，调用 add 函数
    add();
  }
}
// endregion

// region 解绑
/**
 * 存储已转码列表的响应式变量，初始值为空数组
 */
const transcodedList = ref<any>([]);
/**
 * 存储总产量的响应式变量，初始值为 0
 */
const total = ref(0);
/**
 * 添加绑码记录的函数
 * 功能：调用 API 进行绑码操作，成功后刷新数据并清空输入框
 * 流程：
 * 1. 开启加载状态
 * 2. 调用 API 进行绑码
 * 3. 绑码成功后调用 queryData 刷新数据
 * 4. 清空源码和转码输入框
 * 5. 结束加载状态
 */
function add() {
  // 开启加载状态
  spinning.value = true;
  // 调用 API 进行绑码
  snCodeBinding({
    snCode: sourceCode.value,
    barcode: transcoding.value,
  })
    .then(() => {
      // 绑码成功，刷新数据
      queryData();
    })
    .finally(() => {
      // 无论绑码结果如何，结束加载状态
      spinning.value = false;
      // 清空源码和转码输入框
      sourceCode.value = '';
      transcoding.value = '';
    });
}

/**
 * 执行条码解绑操作的函数
 * 功能：弹出确认对话框，确认后调用 API 进行解绑操作，成功后刷新数据
 * @param {object} item - 要解绑的条码项，包含二维码和条形码信息
 */
function unbind(item: any) {
  // 弹出确认对话框
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      // 点击取消按钮，显示提示信息
      message.warning('已取消操作!');
    },
    onOk() {
      // 点击确认按钮，调用 API 进行解绑操作
      snCodeBindingCallBack({
        snCode: item.qrcode || item.qcCode,
        barcode: item.barcode,
      }).then(() => {
        // 解绑成功，显示成功提示信息并刷新数据
        message.success($t('common.successfulOperation'));
        queryData();
      });
    },
    title: '是否确认解除绑定?',
  });
}

/**
 * 执行条码绑定验证的函数
 * 功能：调用 API 验证条码有效性，验证通过后触发转码变更流程
 * @param {string} val - 待验证的原始条码（来自扫码枪输入或手动输入）
 */
function judgementOfWeight(val: string) {
  // 调用 API 验证条码有效性
  checkCodeBinding({
    code: val,
    worksheetCode: props.worksheetCode,
  }).then(() => {
    // 验证通过，触发转码变更流程
    transcodingChange();
  });
}
// endregion

/**
 * 控制加载状态的响应式变量，为 true 时显示加载动画
 */
const spinning = ref<any>(false);
/**
 * 详情
 */
const details = ref<any>({});

/**
 * 查询资源验证状态的函数
 * 功能：根据显示类型调用不同的 API 获取数据，并更新已转码列表和总产量
 * 流程：
 * 1. 开启加载状态
 * 2. 根据显示类型选择对应的 API 进行数据查询
 * 3. 根据查询结果更新已转码列表和总产量
 * 4. 结束加载状态
 */
function queryData() {
  // 开启加载状态
  spinning.value = true;
  const ob =
    props.showTypeNumber === 30
      ? // 显示类型为 30 时，调用 listHCByCodeScan API
        listHCByCodeScan({
          workstationCode: props.workstationCode,
          equipCode: props.equipCode,
          worksheetCode: props.worksheetCode,
          bindingId: props.bindingId,
          functionId: props.functionId,
        })
      : // 其他显示类型，调用 listByCodeScan API
        listByCodeScan({
          workstationCode: props.workstationCode,
          equipCode: props.equipCode,
          worksheetCode: props.worksheetCode,
          bindingId: props.bindingId,
          functionId: props.functionId,
        });

  ob.then((data: any) => {
    if (props.showTypeNumber === 15) {
      // 显示类型为 15 时，更新已转码列表和源码
      const { snCode, list } = data;
      transcodedList.value = list;
      sourceCode.value = snCode;
    } else if (props.showTypeNumber === 30) {
      // 显示类型为 30 时，更新已转码列表和总产量
      const { totalNumber, codeRecords, ...d } = data;
      details.value = d;
      transcodedList.value = codeRecords;
      total.value = totalNumber;
    }
  }).finally(() => {
    // 无论查询结果如何，结束加载状态
    spinning.value = false;
  });
}

/**
 * 组件挂载后执行的钩子函数，会在组件挂载完成后调用 queryData 函数获取数据
 */
onMounted(() => {
  queryData();
});
</script>

<template>
  <!-- 根据 spinning 的值显示加载动画 -->
  <Spin :spinning="spinning">
    <!-- 定义一个行布局 -->
    <!--    <Row v-if="showTypeNumber === 30">
      <Col span="24">
        &lt;!&ndash; 显示工单编号的容器 &ndash;&gt;
        <div class="mb-4 mr-8 inline-block">
          &lt;!&ndash; 工单编号 &ndash;&gt;
          <span class="mr-4 inline-block w-48 p-2 text-right">
            {{ $t('productionOperation.workOrderNumberInExecution') }}：
          </span>
          &lt;!&ndash; 显示工单编号的值，无结果时显示默认提示 &ndash;&gt;
          <span :class="getValueClass()">
            {{ details.proceWorksheetCode || $t('productionOperation.none') }}
          </span>
        </div>
        &lt;!&ndash; 显示产品编号的容器 &ndash;&gt;
        <div class="mb-4 mr-8 inline-block">
          &lt;!&ndash; 产品编号 &ndash;&gt;
          <span class="mr-4 inline-block w-48 p-2 text-right">
            {{ $t('productionOperation.productNumberInExecution') }}：
          </span>
          &lt;!&ndash; 显示产品编号的值，无结果时显示默认提示 &ndash;&gt;
          <span :class="getValueClass()">
            {{ details.procePorductCode || $t('productionOperation.none') }}
          </span>
        </div>
        &lt;!&ndash; 显示产品名称的容器 &ndash;&gt;
        <div class="mb-4 mr-8 inline-block">
          &lt;!&ndash; 产品名称 &ndash;&gt;
          <span class="mr-4 inline-block w-48 p-2 text-right">
            {{ $t('productionOperation.productNameInExecution') }}：
          </span>
          &lt;!&ndash; 显示产品名称的值，无结果时显示默认提示 &ndash;&gt;
          <span :class="getValueClass()">
            {{ details.proceProdutName || $t('productionOperation.none') }}
          </span>
        </div>
        &lt;!&ndash; 显示产品名称的容器 &ndash;&gt;
        <div class="mb-4 mr-8 inline-block">
          &lt;!&ndash; 产品名称 &ndash;&gt;
          <span class="mr-4 inline-block w-48 p-2 text-right">
            {{ $t('productionOperation.productModelInExecution') }}：
          </span>
          &lt;!&ndash; 显示产品名称的值，无结果时显示默认提示 &ndash;&gt;
          <span :class="getValueClass()">
            {{ details.proceProductModel || $t('productionOperation.none') }}
          </span>
        </div>
      </Col>
    </Row>-->
    <!-- 定义一个行布局 -->
    <Row>
      <!-- 定义一个列，占 11 格 -->
      <Col :span="11">
        <!-- 定义一个行布局，垂直均匀分布内容 -->
        <Row class="h-full flex-col justify-evenly">
          <!-- region 源码 -->
          <!-- 显示源码输入框和扫码组件的容器 -->
          <Row class="mb-8">
            <!-- 显示源码标签的列 -->
            <Col span="8" :class="getLabelClass()" class="border-0">
              {{ $t('productionOperation.sourceCode') }}
            </Col>
            <!-- 显示源码输入框和扫码组件的列 -->
            <Col span="16" class="flex">
              <!-- 源码输入框，支持回车键触发 sourceCodeChange 函数 -->
              <Input
                ref="sourceCodeRef"
                v-model:value="sourceCode"
                @keydown.enter="sourceCodeChange"
                @focus="
                  () => {
                    sourceCode = '';
                  }
                "
              />
              <!-- 扫码组件，扫码成功后将结果赋值给源码并进行条码验证 -->
              <ScanTheCode
                @scan-the-code="
                  (val) => {
                    sourceCode = val;
                    judgementOfWeight(val);
                  }
                "
              />
            </Col>
          </Row>
          <!-- endregion -->
          <!-- region 转码 -->
          <!-- 显示转码输入框和扫码组件的容器 -->
          <Row>
            <!-- 显示转码标签的列 -->
            <Col span="8" :class="getLabelClass()" class="border-0">
              {{ $t('productionOperation.transcoding') }}
            </Col>
            <!-- 显示转码输入框和扫码组件的列 -->
            <Col span="16" class="flex">
              <!-- 转码输入框，支持回车键触发 transcodingChange 函数 -->
              <Input
                ref="transcodingRef"
                v-model:value="transcoding"
                @keydown.enter="transcodingChange"
                @focus="
                  () => {
                    transcoding = '';
                  }
                "
              />
              <!-- 扫码组件，扫码成功后将结果赋值给转码并进行条码验证 -->
              <ScanTheCode
                @scan-the-code="
                  (val) => {
                    transcoding = val;
                    judgementOfWeight(val);
                  }
                "
              />
            </Col>
          </Row>
          <!-- endregion -->
          <!-- region 总产量 -->
          <!-- 仅在显示类型为 30 时显示总产量的容器 -->
          <Row v-if="showTypeNumber === 30">
            <!-- 显示总产量标签的列 -->
            <Col span="8" :class="getLabelClass()" class="h-10 border-0">
              {{ $t('productionOperation.totalOutput') }}
            </Col>
            <!-- 显示总产量值的列 -->
            <Col span="16">
              <span :class="getLabelClass()">
                {{ total || 0 }}
              </span>
            </Col>
          </Row>
          <!-- endregion -->
        </Row>
      </Col>
      <!-- 定义一个列，占 12 格，偏移 1 格 -->
      <Col :span="12" :offset="1">
        <!-- 显示已转码列表标题 -->
        <span class="text-xl font-black">{{
          $t('productionOperation.transcodedList')
        }}</span>
        <!-- 显示已转码列表的组件 -->
        <List
          bordered
          :data-source="transcodedList"
          class="h-[300px] overflow-y-auto"
        >
          <!-- 定义列表项的渲染模板 -->
          <template #renderItem="{ item }">
            <ListItem>
              <!-- 根据显示类型显示不同的条码信息 -->
              <span v-if="showTypeNumber === 15" class="flex-1">
                {{ item.qrcode }} => {{ item.barcode }}
              </span>
              <span v-if="showTypeNumber === 30" class="flex-1">
                {{ item.qcCode }} => {{ item.barcode }}
              </span>
              <!-- 显示产品名称 -->
              <span v-if="showTypeNumber === 30">
                {{ item.partName }}
              </span>
              <!-- 定义列表项的操作按钮 -->
              <template #actions>
                <!-- 显示解绑按钮的提示信息 -->
                <Tooltip :title="$t('productionOperation.unbind')">
                  <!-- 解绑按钮，点击后调用 unbind 函数 -->
                  <Button type="link" @click="unbind(item)">
                    <template #icon>
                      <!-- 显示解绑图标 -->
                      <Icon
                        icon="carbon:unlink"
                        class="inline-block align-middle text-xl"
                      />
                    </template>
                  </Button>
                </Tooltip>
              </template>
            </ListItem>
          </template>
        </List>
      </Col>
    </Row>
  </Spin>
</template>

<style scoped>
/* 作用域样式，仅对当前组件生效 */
</style>
