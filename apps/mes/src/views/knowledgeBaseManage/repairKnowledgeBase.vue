<script lang="ts" setup>
/**
 * [INPUT]: 依赖 searchFaultKnowledge/getFaultKnowledgeDetail API，Ant Design Vue 组件
 * [OUTPUT]: 维修故障知识库检索页面，百度式搜索体验，支持结果列表和详情抽屉切换
 * [POS]: 知识库管理模块页面，路由路径对应 views/knowledgeBaseManage/repairKnowledgeBase.vue
 * [TIME]: 2026-08-06 09:00:00
 */
import { computed, ref } from 'vue';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Empty,
  Input,
  message,
  Pagination,
  Space,
  Spin,
  Tag,
  Timeline,
  TimelineItem,
  Tooltip,
} from 'ant-design-vue';

import {
  getFaultKnowledgeDetail,
  searchFaultKnowledge,
} from '#/api';
import { $t } from '#/locales';

// ========== 状态管理 ==========
const loading = ref(false);
const hasSearched = ref(false);
const keyword = ref('');
const resultList = ref<any[]>([]);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);

// ========== 检索 ==========
function handleSearch(page = 1) {
  const kw = keyword.value.trim();
  if (!kw) {
    message.warning($t('knowledgeBaseManage.repairSearch.keywordRequired'));
    return;
  }
  loading.value = true;
  pageNum.value = page;
  searchFaultKnowledge({ keyword: kw, pageNum: page, pageSize: pageSize.value })
    .then((data: any) => {
      hasSearched.value = true;
      resultList.value = data?.results || [];
      total.value = data?.total || 0;
    })
    .catch(() => {
      resultList.value = [];
      total.value = 0;
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleKeyup(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    handleSearch();
  }
}

function handlePageChange(page: number) {
  handleSearch(page);
}

// ========== 详情抽屉 ==========
const drawerVisible = ref(false);
const detailLoading = ref(false);
const detailData = ref<any>(null);
const currentIndex = ref(-1);

function openDetail(row: any, index: number) {
  currentIndex.value = index;
  detailData.value = null;
  drawerVisible.value = true;
  detailLoading.value = true;
  getFaultKnowledgeDetail({
    sourceType: row.sourceType,
    sourceId: row.sourceId,
  })
    .then((res: any) => {
      detailData.value = res?.data || res;
    })
    .catch(() => {
      detailData.value = null;
    })
    .finally(() => {
      detailLoading.value = false;
    });
}

// ========== 上下条切换 ==========
const hasPrev = computed(() => currentIndex.value > 0);
const hasNext = computed(() => currentIndex.value < resultList.value.length - 1);

function handlePrev() {
  if (!hasPrev.value) return;
  const newIndex = currentIndex.value - 1;
  const row = resultList.value[newIndex];
  if (row) openDetail(row, newIndex);
}

function handleNext() {
  if (!hasNext.value) return;
  const newIndex = currentIndex.value + 1;
  const row = resultList.value[newIndex];
  if (row) openDetail(row, newIndex);
}

// ========== 来源类型映射 ==========
function getSourceTypeTag(type: number) {
  if (type === 1) {
    return $t('knowledgeBaseManage.repairSearch.sourceRepairOrder');
  }
  if (type === 2) {
    return $t('knowledgeBaseManage.repairSearch.sourceKnowledgeBase');
  }
  return '';
}

function getSourceTypeColor(type: number) {
  if (type === 1) return 'blue';
  if (type === 2) return 'green';
  return 'default';
}

// ========== 状态映射 ==========

/**
 * 维修/知识状态文本
 * sourceType=1 维修来源，sourceType=2 知识来源
 */
function getStatusText(status: number, sourceType: number) {
  const p = 'knowledgeBaseManage.repairSearch.statusMap';
  if (sourceType === 1) {
    return $t(`${p}.repairStatus.${status}`) || $t(`${p}.unknown`);
  }
  if (sourceType === 2) {
    return $t(`${p}.knowledgeStatus.${status}`) || $t(`${p}.unknown`);
  }
  return $t(`${p}.unknown`);
}

function getStatusColor(status: number, sourceType: number) {
  if (sourceType === 1) {
    const colorMap: Record<number, string> = {
      1: 'orange',
      2: 'processing',
      3: 'warning',
      4: 'success',
      5: 'default',
    };
    return colorMap[status] || 'default';
  }
  return status === 1 ? 'success' : 'default';
}

/** 是否停机文本 */
function getDowntimeText(value: number) {
  const p = 'knowledgeBaseManage.repairSearch.statusMap';
  return value === 1 ? $t(`${p}.downtimeYes`) : $t(`${p}.downtimeNo`);
}

function getDowntimeColor(value: number) {
  return value === 1 ? 'red' : 'green';
}

// ========== 维修类型映射 ==========
function getRepairTypeText(type: number) {
  return (
    $t(`knowledgeBaseManage.repairSearch.statusMap.repairType.${type}`) ||
    $t('knowledgeBaseManage.repairSearch.statusMap.unknown')
  );
}

// ========== 维修结果映射 ==========
function getRepairResultText(result: number) {
  return (
    $t(`knowledgeBaseManage.repairSearch.statusMap.repairResult.${result}`) ||
    $t('knowledgeBaseManage.repairSearch.statusMap.unknown')
  );
}

// ========== 过程操作类型映射 ==========
function getActionTypeText(type: number) {
  return (
    $t(`knowledgeBaseManage.repairSearch.statusMap.actionType.${type}`) ||
    $t('knowledgeBaseManage.repairSearch.statusMap.unknown')
  );
}
</script>

<template>
  <Page>
    <div class="repair-knowledge-page">
      <!-- ========== 搜索区域 ========== -->
      <div
        class="search-wrapper"
        :class="{ 'search-wrapper--searched': hasSearched }"
      >
        <div class="search-content">
          <h1 class="search-title" v-if="!hasSearched">
            {{ $t('knowledgeBaseManage.repairSearch.title') }}
          </h1>
          <div class="search-input-group items-center">
            <Input
              v-model:value="keyword"
              size="large"
              :placeholder="$t('knowledgeBaseManage.repairSearch.searchPlaceholder')"
              allow-clear
              :class="{ 'search-input--large': !hasSearched }"
              @keyup="handleKeyup"
            >
              <template #prefix>
                <Icon icon="mdi:magnify" class="text-gray-400 text-lg" />
              </template>
            </Input>
            <Button
              type="primary"
              size="large"
              @click="handleSearch()"
              :loading="loading"
            >
              {{ $t('knowledgeBaseManage.repairSearch.search') }}
            </Button>
          </div>
          <p class="search-subtitle" v-if="!hasSearched && !loading">
            {{ $t('knowledgeBaseManage.repairSearch.subtitle') }}
          </p>
        </div>
      </div>

      <!-- ========== 加载状态 ========== -->
      <Spin :spinning="loading" v-if="hasSearched">
        <!-- ========== 搜索结果 ========== -->
        <div class="results-section" v-if="resultList.length > 0">
          <div class="results-header">
            <span class="results-count">
              {{
                $t('knowledgeBaseManage.repairSearch.resultCount', {
                  count: total,
                })
              }}
            </span>
          </div>

          <div class="results-list">
            <Card
              v-for="(item, index) in resultList"
              :key="`${item.sourceType}-${item.sourceId}`"
              class="result-card"
              hoverable
              @click="openDetail(item, index)"
            >
              <div class="result-card-header">
                <h3 class="result-title">{{ item.title }}</h3>
                <Tag :color="getSourceTypeColor(item.sourceType)">
                  {{ getSourceTypeTag(item.sourceType) }}
                </Tag>
              </div>
              <div class="result-fields">
                <div class="result-field" v-if="item.faultAnalysis">
                  <span class="result-field-label">
                    {{ $t('knowledgeBaseManage.repairSearch.faultAnalysis') }}：
                  </span>
                  <span class="result-field-value">{{ item.faultAnalysis }}</span>
                </div>
                <div class="result-field" v-if="item.solution">
                  <span class="result-field-label">
                    {{ $t('knowledgeBaseManage.repairSearch.solution') }}：
                  </span>
                  <span class="result-field-value">{{ item.solution }}</span>
                </div>
              </div>
            </Card>
          </div>

          <!-- 分页 -->
          <div class="results-pagination" v-if="total > pageSize">
            <Pagination
              :current="pageNum"
              :page-size="pageSize"
              :total="total"
              show-less-items
              @change="handlePageChange"
            />
          </div>
        </div>

        <!-- ========== 空结果 ========== -->
        <div class="results-empty" v-else-if="!loading && hasSearched">
          <Empty
            :description="$t('knowledgeBaseManage.repairSearch.noResult')"
          />
        </div>
      </Spin>

      <!-- ========== 初始空状态 ========== -->
      <div class="results-empty" v-if="!hasSearched && !loading">
        <Empty
          :description="$t('knowledgeBaseManage.repairSearch.noSearchYet')"
        />
      </div>
    </div>

    <!-- ========== 详情抽屉 ========== -->
    <Drawer
      v-model:open="drawerVisible"
      :title="detailData?.title || $t('knowledgeBaseManage.repairSearch.detailTitle')"
      width="700"
      :destroy-on-close="false"
    >
      <template #footer>
        <div class="drawer-footer">
          <Tooltip
            :title="
              hasPrev
                ? ''
                : $t('knowledgeBaseManage.repairSearch.noPrev')
            "
          >
            <Button :disabled="!hasPrev" @click="handlePrev">
              <Icon icon="mdi:chevron-left" />
              {{ $t('knowledgeBaseManage.repairSearch.prev') }}
            </Button>
          </Tooltip>
          <span class="drawer-footer__info">
            {{ currentIndex + 1 }} / {{ resultList.length }}
          </span>
          <Tooltip
            :title="
              hasNext
                ? ''
                : $t('knowledgeBaseManage.repairSearch.noNext')
            "
          >
            <Button :disabled="!hasNext" @click="handleNext">
              {{ $t('knowledgeBaseManage.repairSearch.next') }}
              <Icon icon="mdi:chevron-right" />
            </Button>
          </Tooltip>
        </div>
      </template>

      <Spin :spinning="detailLoading">
        <div class="detail-content" v-if="detailData">
          <!-- 故障分析与解决措施 -->
          <Card
            size="small"
            :title="$t('knowledgeBaseManage.repairSearch.faultAnalysis')"
            class="!mb-4"
            v-if="detailData.faultAnalysis"
          >
            <p class="detail-text">{{ detailData.faultAnalysis }}</p>
          </Card>

          <Card
            size="small"
            :title="$t('knowledgeBaseManage.repairSearch.solution')"
            class="!mb-4"
            v-if="detailData.solution"
          >
            <p class="detail-text">{{ detailData.solution }}</p>
          </Card>

          <!-- 来源标签 -->
          <div class="!mb-4">
            <Tag :color="getSourceTypeColor(detailData.sourceType)">
              {{ getSourceTypeTag(detailData.sourceType) }}
            </Tag>
          </div>

          <!-- sourceType=1 维修单详情 -->
          <template v-if="detailData.sourceType === 1">
            <Card size="small" :title="$t('knowledgeBaseManage.repairSearch.basicInfo')" class="!mb-4">
              <Descriptions :column="2" size="small" bordered>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.repairNo')">
                  {{ detailData.repairNo || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.requestNo')">
                  {{ detailData.requestNo || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.equipmentCode')">
                  {{ detailData.equipmentCode || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.equipmentName')">
                  {{ detailData.equipmentName || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.repairType')">
                  {{ getRepairTypeText(detailData.repairType) }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.downtime')">
                  <Tag :color="getDowntimeColor(detailData.isDowntime)">
                    {{ getDowntimeText(detailData.isDowntime) }}
                  </Tag>
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.repairStatus')">
                  <Tag :color="getStatusColor(detailData.status, 1)">
                    {{ getStatusText(detailData.status, 1) }}
                  </Tag>
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.reportBy')">
                  {{ detailData.reportBy || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.reportTime')">
                  {{ detailData.reportTime || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.repairBy')">
                  {{ detailData.repairBy || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.repairStartTime')">
                  {{ detailData.repairStartTime || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.repairEndTime')">
                  {{ detailData.repairEndTime || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.repairResult')">
                  {{ getRepairResultText(detailData.repairResult) }}
                </DescriptionsItem>
              </Descriptions>
            </Card>

            <Card size="small" :title="$t('knowledgeBaseManage.repairSearch.detailContent')" class="!mb-4">
              <Descriptions :column="2" size="small" bordered>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.faultName')" :span="2">
                  {{ detailData.faultName || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.repairItem')" :span="2">
                  {{ detailData.repairItem || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.repairContent')" :span="2">
                  {{ detailData.repairContent || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.faultCause')" :span="2">
                  {{ detailData.faultCause || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.repairPlan')" :span="2">
                  {{ detailData.repairPlan || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.repairProject')" :span="2">
                  {{ detailData.repairProject || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.improvePlan')" :span="2">
                  {{ detailData.improvePlan || '-' }}
                </DescriptionsItem>
              </Descriptions>
            </Card>

            <!-- 过程时间线 -->
            <Card
              size="small"
              :title="$t('knowledgeBaseManage.repairSearch.repairProcess')"
              class="!mb-4"
              v-if="
                detailData.processRecords &&
                detailData.processRecords.length > 0
              "
            >
              <Timeline>
                <TimelineItem
                  v-for="record in detailData.processRecords"
                  :key="record.id"
                >
                  <div class="timeline-item">
                    <div class="timeline-item__header">
                      <strong>{{ getActionTypeText(record.actionType) }}</strong>
                      <span class="timeline-item__time">{{
                        record.actionTime
                      }}</span>
                    </div>
                    <div v-if="record.operator">
                      {{ $t('knowledgeBaseManage.repairSearch.operatorText') }}：{{ record.operator }}
                    </div>
                    <div v-if="record.remark">
                      {{ $t('knowledgeBaseManage.repairSearch.remarkText') }}：{{ record.remark }}
                    </div>
                    <div class="timeline-item__status-change flex items-center">
                      <span v-if="record.beforeStatus !== null && record.beforeStatus !== undefined">
                        {{ getStatusText(record.beforeStatus, 1) }}
                      </span>
                      <Icon v-if="record.beforeStatus !== null && record.beforeStatus !== undefined" icon="mdi:arrow-right" class="mx-1" />
                      <span v-if="record.afterStatus !== null && record.afterStatus !== undefined">
                        {{ getStatusText(record.afterStatus, 1) }}
                      </span>
                    </div>
                  </div>
                </TimelineItem>
              </Timeline>
            </Card>
          </template>

          <!-- sourceType=2 知识库详情 -->
          <template v-if="detailData.sourceType === 2">
            <Card size="small" :title="$t('knowledgeBaseManage.repairSearch.basicInfo')" class="!mb-4">
              <Descriptions :column="2" size="small" bordered>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.knowledgeCode')">
                  {{ detailData.knowledgeCode || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.knowledgeSourceText')">
                  {{ detailData.knowledgeSource || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.repairStatus')">
                  <Tag :color="getStatusColor(detailData.status, 2)">
                    {{ getStatusText(detailData.status, 2) }}
                  </Tag>
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.tags')" :span="2">
                  <Space v-if="detailData.tags" wrap>
                    <Tag
                      v-for="tag in detailData.tags.split(',')"
                      :key="tag"
                      color="blue"
                    >
                      {{ tag.trim() }}
                    </Tag>
                  </Space>
                  <span v-else>-</span>
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.repairSearch.equipmentGroupText')" :span="2">
                  {{ detailData.equipmentGroup || '-' }}
                </DescriptionsItem>
              </Descriptions>
            </Card>

            <Card
              size="small"
              :title="$t('knowledgeBaseManage.repairSearch.knowledgeContent')"
              class="!mb-4"
              v-if="detailData.content"
            >
              <p class="detail-text">{{ detailData.content }}</p>
            </Card>
          </template>
        </div>
      </Spin>
    </Drawer>
  </Page>
</template>

<style lang="less" scoped>
.repair-knowledge-page {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 200px);
}

// ========== 搜索区域 ==========
.search-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 40px 20px;
  transition: all 0.3s ease;

  &--searched {
    flex: none;
    padding: 16px 0;
  }
}

.search-content {
  width: 100%;
  max-width: 640px;
  text-align: center;
}

.search-title {
  font-size: 32px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 32px;
  letter-spacing: 2px;
}

.search-subtitle {
  color: #999;
  margin-top: 24px;
  font-size: 14px;
}

.search-input-group {
  display: flex;
  gap: 12px;

  :deep(.ant-input-affix-wrapper) {
    flex: 1;
  }

  .search-input--large {
    :deep(.ant-input) {
      font-size: 16px;
      padding: 8px 12px;
    }
  }
}

// ========== 搜索结果 ==========
.results-section {
  max-width: 800px;
  margin: 0 auto;
}

.results-header {
  margin-bottom: 16px;
}

.results-count {
  font-size: 14px;
  color: #666;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-card {
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  :deep(.ant-card-body) {
    padding: 16px 20px;
  }
}

.result-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.result-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #1a0dab;
  line-height: 1.4;
}

.result-fields {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-field {
  display: flex;
  font-size: 13px;
  line-height: 1.6;
}

.result-field-label {
  color: #999;
  flex-shrink: 0;
}

.result-field-value {
  color: #555;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.results-pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.results-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 60px 0;
}

// ========== 详情抽屉 ==========
.detail-content {
  padding: 4px 0;
}

.detail-text {
  color: #333;
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.drawer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.drawer-footer__info {
  color: #999;
  font-size: 14px;
}

// ========== 时间线 ==========
.timeline-item {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  &__time {
    color: #999;
    font-size: 12px;
    margin-left: 12px;
  }

  &__status-change {
    margin-top: 4px;
    font-size: 12px;
    color: #666;
  }
}
</style>
