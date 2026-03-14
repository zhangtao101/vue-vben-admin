<script setup lang="ts">
import { ref } from 'vue';

import {
  Button,
  Descriptions,
  DescriptionsItem,
  Drawer,
  message,
  Space,
} from 'ant-design-vue';

import { insertOpFunctionRoute, listOpFunctionSetRoute } from '#/api';
import { $t } from '#/locales';
import Drop from '#/util/component/drop/drop.vue';

// region 抽屉基本操作

// 抽屉是否显示
const visible = ref(false);
// 配方
const formula = ref<any>({});
// 同步信息
const matching = ref<any>({});

/**
 * 打开抽屉
 */
function openDrawer(formulaMessage: any, matchingMessage: any) {
  // 赋值配方
  formula.value = formulaMessage;
  // 赋值同步信息
  matching.value = matchingMessage;
  // 读取流程图
  read();
  visible.value = true;
}

/**
 * 关闭抽屉
 */
function closeDrawer() {
  visible.value = false;
}
// endregion

// region 保存
const dropRef = ref();

/**
 * 保存路线
 */
function save() {
  /**
   * allPathsLeadToEnd: 是否合规
   * cleanedNodes: 清理后的节点
   * edges: 连接线
   */
  const { allPathsLeadToEnd, cleanedNodes, edges } =
    dropRef.value.cleanAndCheckGraph();
  if (allPathsLeadToEnd && cleanedNodes.length > 0) {
    const params = {
      opDetailId: matching.value.id,
      equipTypeCode: formula.value.formulaCode,
      routes: edges,
      details: cleanedNodes,
    };
    insertOpFunctionRoute(params).then(() => {
      message.success($t('common.successfulOperation'));
      dropRef.value.setData([], []);
      closeDrawer();
    });
  } else {
    message.error('请确保至少有一条完整的路线(开始 => xxx => 结束)!');
  }
}
// endregion

// region 读取
function read() {
  listOpFunctionSetRoute(matching.value.id).then(({ details, routes }: any) => {
    dropRef.value.setData(routes, details);
  });
}
// endregion

// region 暴露方法

// 暴露 open 方法，供父组件调用
defineExpose({
  open: openDrawer,
});

// endregion
</script>

<template>
  <Drawer
    v-model:open="visible"
    height="100%"
    placement="top"
    :title="$t('common.bind')"
    @close="closeDrawer()"
    :footer-style="{ textAlign: 'right' }"
  >
    <!-- 基本信息 -->
    <Descriptions :column="5" bordered>
      <!-- 设备编号 -->
      <DescriptionsItem :label="$t('operationFormula.equipmentNumber')">
        {{ formula.equipCode }}
      </DescriptionsItem>
      <!-- 设备名称 -->
      <DescriptionsItem :label="$t('operationFormula.equipmentName')">
        {{ formula.equipName }}
      </DescriptionsItem>
      <!-- 工序名称 -->
      <DescriptionsItem :label="$t('operationFormula.processName')">
        {{ formula.processName }}
      </DescriptionsItem>
      <!-- 配方编号 -->
      <DescriptionsItem :label="$t('operationFormula.formulaNumber')">
        {{ formula.formulaCode }}
      </DescriptionsItem>
      <!-- 配方名称 -->
      <DescriptionsItem :label="$t('operationFormula.formulaName')">
        {{ formula.formulaName }}
      </DescriptionsItem>
      <!-- 版本号 -->
      <DescriptionsItem :label="$t('operationFormula.versionNumber')">
        {{ formula.version }}
      </DescriptionsItem>
      <!-- 工作站编号 -->
      <DescriptionsItem :label="$t('operationFormula.workstationNumber')">
        {{ matching.workstationCode }}
      </DescriptionsItem>
      <!-- 工作站名称 -->
      <DescriptionsItem :label="$t('operationFormula.workstationName')">
        {{ matching.workstationName }}
      </DescriptionsItem>
      <!-- 作业类型 -->
      <DescriptionsItem :label="$t('operationFormula.operationType')">
        {{ matching.opTypeName }}
      </DescriptionsItem>
    </Descriptions>
    <Drop ref="dropRef" :formula="formula" :matching="matching" />

    <!-- 抽屉底部操作按钮 -->
    <template #footer>
      <!-- 按钮组，包含取消和确认按钮 -->
      <Space>
        <!-- 取消按钮，点击后关闭人员操作抽屉 -->
        <Button @click="closeDrawer()">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认按钮，点击后提交人员操作信息 -->
        <Button type="primary" @click="save()">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped></style>
