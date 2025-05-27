<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

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

const props = defineProps({
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
  // 显示类型
  showTypeNumber: {
    type: Number,
    default: 0,
  },
});

/**
 * 获取标签的class
 */
function getLabelClass() {
  return 'inline-block w-full border p-2 text-center';
}

// region 绑码
// 源码
const sourceCode = ref('');
// 源码元素对象
const sourceCodeRef = ref();
// 转码
const transcoding = ref('');
// 转码元素对象
const transcodingRef = ref();
// 错误信息
const errorMessage = ref('');

/**
 * 源码改变
 */
function sourceCodeChange() {
  if (props.showTypeNumber === 30) {
    handleMaulSncode({
      workstationCode: props.workstationCode,
      equipCode: props.equipCode,
      worksheetCode: props.worksheetCode,
      bindingId: props.bindingId,
      functionId: props.functionId,
      snCode: sourceCode.value,
    })
      .then((data) => {
        errorMessage.value = data.error === '通过' ? '' : data.error;
        if (errorMessage.value) {
          message.error(errorMessage.value);
        } else {
          bindCode();
          transcodingRef.value.focus();
        }
      })
      .finally(() => {
        spinning.value = false;
      });
  } else {
    bindCode();
    transcodingRef.value.focus();
  }
}

/**
 * 转码改变
 */
function transcodingChange() {
  bindCode();
  sourceCodeRef.value.focus();
}

function bindCode() {
  if (sourceCode.value && transcoding.value) {
    add();
  }
}
// endregion

// region 解绑

/**
 * 已转码列表
 */
const transcodedList = ref<any>([]);
/**
 * 总产量
 */
const total = ref(0);

function add() {
  spinning.value = true;
  snCodeBinding({
    snCode: sourceCode.value,
    barcode: transcoding.value,
  })
    .then(() => {
      queryData();
      sourceCode.value = '';
      transcoding.value = '';
    })
    .finally(() => {
      spinning.value = false;
    });
}

/**
 * 执行条码解绑操作
 * @function
 * @description 解除绑定流程：
 * 1. 弹出二次确认对话框
 * 2. 确认后调用解绑接口
 * 3. 解绑成功刷新数据并提示
 *
 * @param {object} item - 要解绑的条码项
 * @param {string} item.qrcode - 二维码值
 * @param {string} item.barcode - 条形码值
 *
 * @example
 * // 在已绑定列表点击解绑按钮时触发
 * unbind({ qrcode: 'QR123', barcode: 'BR456' });
 *
 * @see {@link snCodeBindingCallBack} 使用的解绑接口
 * @see {@link queryData} 数据刷新方法
 */
function unbind(item: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消操作!');
    },
    onOk() {
      snCodeBindingCallBack({
        snCode: item.qrcode || item.qcCode,
        barcode: item.barcode,
      }).then(() => {
        message.success($t('common.successfulOperation'));
        queryData();
      });
    },
    title: '是否确认解除绑定?',
  });
}

/**
 * 执行条码绑定验证
 * @function
 * @async
 * @description 重量判定/条码验证流程：
 * 1. 调用绑定验证接口检查条码有效性
 * 2. 验证通过后触发转码变更流程
 *
 * @param {string} val - 待验证的原始条码（来自扫码枪输入或手动输入）
 *
 * @example
 * // 典型调用场景：扫码枪输入条码后
 * judgementOfWeight('SN123456789');
 *
 * @see {@link checkCodeBinding} 使用的验证接口
 * @see {@link transcodingChange} 验证通过后触发的转码方法
 */
function judgementOfWeight(val: string) {
  checkCodeBinding({
    code: val,
    worksheetCode: props.worksheetCode,
  }).then(() => {
    transcodingChange();
  });
}
// endregion

/**
 * 加载中
 */
const spinning = ref<any>(false);
/**
 * 查询资源验证状态
 * @function
 * @async
 * @description 获取当前工位的资源校验状态数据，包含以下流程：
 * 1. 开启加载状态指示
 * 2. 从组件props中获取上下文参数
 * 3. 调用资源验证状态查询接口
 * 4. 存储接口返回数据
 * 5. 始终关闭加载状态指示
 *
 * @throws {Error} 需要调用者补充异常处理逻辑
 *
 * @example
 * // 典型调用流程
 * try {
 *   await queryData();
 * } catch (error) {
 *   // 待补充的错误处理
 * }
 *
 * @see {@link listByCodeScan} 使用的API接口
 * @see {@link props} 参数来源：工步ID/工序ID/工单编号等上下文参数
 */
function queryData() {
  spinning.value = true;
  const ob =
    props.showTypeNumber === 30
      ? listHCByCodeScan({
          workstationCode: props.workstationCode,
          equipCode: props.equipCode,
          worksheetCode: props.worksheetCode,
          bindingId: props.bindingId,
          functionId: props.functionId,
        })
      : listByCodeScan({
          workstationCode: props.workstationCode,
          equipCode: props.equipCode,
          worksheetCode: props.worksheetCode,
          bindingId: props.bindingId,
          functionId: props.functionId,
        });

  ob.then((data: any) => {
    if (props.showTypeNumber === 15) {
      const { snCode, list } = data;
      transcodedList.value = list;
      sourceCode.value = snCode;
    } else if (props.showTypeNumber === 30) {
      const { totalNumber, codeRecords } = data;
      transcodedList.value = codeRecords;
      total.value = totalNumber;
    }
  }).finally(() => {
    spinning.value = false;
  });
}

onMounted(() => {
  queryData();
});
</script>

<template>
  <Spin :spinning="spinning">
    <Row>
      <Col :span="11">
        <Row class="h-full flex-col justify-evenly">
          <!-- 源码 -->
          <Row class="mb-8">
            <Col span="8" :class="getLabelClass()" class="border-0">
              {{ $t('productionOperation.sourceCode') }}
            </Col>
            <Col span="16" class="flex">
              <Input
                ref="sourceCodeRef"
                v-model:value="sourceCode"
                @keydown.enter="sourceCodeChange"
              />
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
          <!-- 转码 -->
          <Row>
            <Col span="8" :class="getLabelClass()" class="border-0">
              {{ $t('productionOperation.transcoding') }}
            </Col>
            <Col span="16" class="flex">
              <Input
                ref="transcodingRef"
                v-model:value="transcoding"
                @keydown.enter="transcodingChange"
              />
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
          <!-- 总产量 -->
          <Row>
            <Col
              span="8"
              :class="getLabelClass()"
              class="h-10 border-0"
              v-if="showTypeNumber === 30"
            >
              {{ $t('productionOperation.totalOutput') }}
            </Col>
            <Col span="16">
              <span :class="getLabelClass()">
                {{ total || 0 }}
              </span>
            </Col>
          </Row>
        </Row>
      </Col>
      <Col :span="12" :offset="1">
        <span class="text-xl font-black">{{
          $t('productionOperation.transcodedList')
        }}</span>
        <List
          bordered
          :data-source="transcodedList"
          class="h-[300px] overflow-y-auto"
        >
          <template #renderItem="{ item }">
            <ListItem>
              <span v-if="showTypeNumber === 15">
                {{ item.qrcode }} => {{ item.barcode }}
              </span>
              <span v-if="showTypeNumber === 30">
                {{ item.qcCode }} => {{ item.barcode }}
              </span>
              <span v-if="showTypeNumber === 30">
                {{ item.partName }}
              </span>
              <template #actions>
                <Tooltip :title="$t('productionOperation.unbind')">
                  <Button type="link" @click="unbind(item)">
                    <template #icon>
                      <IconifyIcon
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

<style scoped></style>
