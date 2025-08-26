<script setup lang="ts">
import { $t } from '@vben/locales';

import { Descriptions, DescriptionsItem, Image, Tag } from 'ant-design-vue';

defineProps({
  details: {
    type: Object,
    default: () => {},
  },
});

/**
 * 获取文件名称
 * @param filePath 文件路径
 */
function getFileName(filePath: string) {
  const regex = /[^/]+$/;
  return filePath ? filePath.match(regex)![0] : '';
}

function getResultText(type: number) {
  if (type === 1) {
    return $t('hiddenDangerRectification.qualified');
  }
  if (type === 0) {
    return $t('hiddenDangerRectification.notQualified');
  }
  return $t('hiddenDangerInspectionTask.notAtTheMoment');
}
</script>

<template>
  <!-- region 隐患整改  todo 待修改-->
  <Descriptions
    :column="2"
    bordered
    :title="$t('hiddenDangerRectification.rectificationOfHiddenDangers')"
    class="mt-4"
  >
    <!-- 原因分析 -->
    <DescriptionsItem
      :label="$t('hiddenDangerRectification.causeAnalysis')"
      :span="2"
    >
      <Tag
        v-for="(item, index) of details.sourceList"
        :key="index"
        color="#108ee9"
      >
        {{ item }}
      </Tag>
    </DescriptionsItem>
    <!-- 原因分析 -->
    <DescriptionsItem :label="$t('hiddenDangerRectification.remark')" :span="2">
      {{ details?.remark || $t('hiddenDangerInspectionTask.notAtTheMoment') }}
    </DescriptionsItem>
    <!-- 整改措施 -->
    <DescriptionsItem
      :label="$t('hiddenDangerRectification.rectificationMeasures')"
      :span="2"
    >
      {{
        details?.rectificationMeasure ||
        $t('hiddenDangerInspectionTask.notAtTheMoment')
      }}
    </DescriptionsItem>
    <!-- 整改人 -->
    <DescriptionsItem :label="$t('hiddenDangerRectification.rectifier')">
      {{
        details?.rectificationUser ||
        $t('hiddenDangerInspectionTask.notAtTheMoment')
      }}
    </DescriptionsItem>
    <!-- 预计整改费用 -->
    <DescriptionsItem
      :label="$t('hiddenDangerRectification.estimatedRectificationCost')"
    >
      {{
        details?.rectificationCosts ||
        $t('hiddenDangerInspectionTask.notAtTheMoment')
      }}
    </DescriptionsItem>
    <!-- 整改期限 -->
    <DescriptionsItem
      :label="$t('hiddenDangerRectification.rectificationTerm')"
    >
      {{
        details?.rectificationDeadline ||
        $t('hiddenDangerInspectionTask.notAtTheMoment')
      }}
    </DescriptionsItem>
    <!-- 验证期限 -->
    <DescriptionsItem
      :label="$t('hiddenDangerRectification.verificationPeriod')"
    >
      {{
        details?.inspectionDeadline ||
        $t('hiddenDangerInspectionTask.notAtTheMoment')
      }}
    </DescriptionsItem>
    <!-- 整改方案附件 -->
    <DescriptionsItem
      :label="$t('hiddenDangerRectification.rectificationSchemeAttachment')"
    >
      <a
        v-for="(item, index) of details?.fileList"
        :key="index"
        :href="item"
        target="_blank"
        class="inline text-blue-500"
      >
        {{ getFileName(item) }}
      </a>
    </DescriptionsItem>
  </Descriptions>
  <!-- endregion -->

  <!-- region 隐患整改实施 -->
  <Descriptions
    :column="2"
    bordered
    :title="
      $t('hiddenDangerRectification.implementationOfHiddenDangerRectification')
    "
    class="mt-4"
  >
    <!-- 整改情况 -->
    <DescriptionsItem
      :label="$t('hiddenDangerRectification.rectificationSituation')"
      :span="2"
    >
      {{
        details?.rectificationStatus ||
        $t('hiddenDangerInspectionTask.notAtTheMoment')
      }}
    </DescriptionsItem>

    <!-- 实际整改日期 -->
    <DescriptionsItem
      :label="$t('hiddenDangerRectification.actualRectificationDate')"
    >
      {{
        details?.rectificationDate ||
        $t('hiddenDangerInspectionTask.notAtTheMoment')
      }}
    </DescriptionsItem>
    <!-- 实际整改费用 -->
    <DescriptionsItem
      :label="$t('hiddenDangerRectification.actualRectificationCost')"
    >
      {{
        details?.rectificationAmount ||
        $t('hiddenDangerInspectionTask.notAtTheMoment')
      }}
    </DescriptionsItem>
    <!-- 整改后照片 -->
    <DescriptionsItem
      :label="$t('hiddenDangerRectification.rectificationAfterPhoto')"
      :span="2"
    >
      <Image
        :src="item"
        v-for="(item, index) of details?.rectificationPhotoList"
        :key="index"
        :width="120"
        :height="120"
      />
    </DescriptionsItem>
    <!-- 整改后文件 -->
    <DescriptionsItem
      :label="$t('hiddenDangerRectification.rectificationAfterFile')"
      :span="2"
    >
      <a
        v-for="(item, index) of details?.rectificationFileList"
        :key="index"
        :href="item"
        target="_blank"
        class="inline text-blue-500"
      >
        {{ getFileName(item) }}
      </a>
    </DescriptionsItem>
  </Descriptions>
  <!-- endregion -->

  <!-- region 隐患整改验收 -->
  <Descriptions
    :column="2"
    bordered
    :title="
      $t('hiddenDangerRectification.hiddenDangerRectificationAndAcceptance')
    "
    class="mt-4"
  >
    <!-- 验收结果 -->
    <DescriptionsItem
      :label="$t('hiddenDangerRectification.results')"
      :span="2"
    >
      {{ getResultText(details?.isQualified) }}
    </DescriptionsItem>
    <!-- 验收人 -->
    <DescriptionsItem :label="$t('hiddenDangerRectification.acceptor')">
      {{
        details?.acceptanceUser ||
        $t('hiddenDangerInspectionTask.notAtTheMoment')
      }}
    </DescriptionsItem>
    <!-- 验收时间 -->
    <DescriptionsItem :label="$t('hiddenDangerRectification.acceptanceTime')">
      {{
        details?.acceptanceTime ||
        $t('hiddenDangerInspectionTask.notAtTheMoment')
      }}
    </DescriptionsItem>
    <!-- 详情 -->
    <DescriptionsItem
      :label="$t('hiddenDangerRectification.details')"
      :span="2"
    >
      {{ details?.detail || $t('hiddenDangerInspectionTask.notAtTheMoment') }}
    </DescriptionsItem>
  </Descriptions>
  <!-- endregion -->
</template>

<style scoped></style>
