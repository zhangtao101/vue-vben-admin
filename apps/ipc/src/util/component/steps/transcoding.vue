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

import ScanTheCode from '#/util/component/scanTheCode.vue';

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
});

/**
 * 获取标签的class
 */
function getLabelClass() {
  return 'inline-block w-full border p-2 text-center';
}

/**
 * 加载中
 */
const spinning = ref<any>(false);
// region 绑码
// 源码
const sourceCode = ref('');
// 源码元素对象
const sourceCodeRef = ref();
// 转码
const transcoding = ref('');
// 转码元素对象
const transcodingRef = ref();

/**
 * 源码改变
 */
function sourceCodeChange() {
  bindCode();
  transcodingRef.value.focus();
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

function add() {
  transcodedList.value.push({
    text: `${sourceCode.value} ==> ${transcoding.value}`,
  });
  sourceCode.value = '';
  transcoding.value = '';
}

function unbind(index: number) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消操作!');
    },
    onOk() {
      transcodedList.value.splice(index, 1);
      message.success($t('common.successfulOperation'));
    },
    title: '是否确认解除绑定?',
  });
}
// endregion

onMounted(() => {});
</script>

<template>
  <Spin :spinning="spinning">
    <Row>
      <Col :span="11">
        <Row class="h-full flex-col justify-evenly">
          <!-- 源码 -->
          <Row class="mb-8">
            <Col span="8" :class="getLabelClass()">
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
                    sourceCodeChange();
                  }
                "
              />
            </Col>
          </Row>
          <!-- 转码 -->
          <Row>
            <Col span="8" :class="getLabelClass()">
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
                    transcodingChange();
                  }
                "
              />
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
          <template #renderItem="{ item, index }">
            <ListItem>
              {{ item.text }}
              <template #actions>
                <Tooltip :title="$t('productionOperation.unbind')">
                  <Button type="link" @click="unbind(index)">
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
