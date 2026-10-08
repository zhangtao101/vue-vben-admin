<script setup lang="ts">
import type { PackagingDashboardItem } from '#/api';

/**
 * [INPUT]: 依赖 vue、ant-design-vue（Card/Col/Empty/Row/Spin）、#/api 的 getPackagingDashboard 接口、#/locales 国际化。
 * [OUTPUT]: 对外提供 PackagingDashboard 包装看板步骤组件（步骤组件标准入参 functionId/workstationCode/processCode）。
 * [POS]: 属于包装工序步骤组件，页面为四栏 Row 布局，每栏展示上下两条包装产线的名称与三个指标数。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-10-08 00:00:00
 */
import { onMounted, ref } from 'vue';

import { Card, Col, Empty, Row, Spin } from 'ant-design-vue';

import { getPackagingDashboard } from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'PackagingDashboard',
});

/**
 * 工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
const props = defineProps({
  functionId: { type: Number, default: 0 },
  workstationCode: { type: String, default: '' },
  /** 工序编号，由外部传入 */
  processCode: { type: String, default: '' },
});

/** 加载状态 */
const loading = ref(false);
/** 看板数据列表 */
const dashboardList = ref<PackagingDashboardItem[]>([]);
/** 每栏（卡片）内的上下两部分标识：A 上栏 / B 下栏 */
const positions = ['A', 'B'] as const;

/**
 * 取指定栏位的产线名称
 * @param item 看板单条数据
 * @param position A 上栏 / B 下栏
 * @returns 产线名称，取不到时返回空串
 */
function getSubLineName(item: any, position: 'A' | 'B') {
  return item?.[`subLineName${position}`] ?? '';
}

/**
 * 取指定栏位的三个同行指标（上标题下内容）
 * @param item 看板单条数据
 * @param position A 上栏 / B 下栏
 * @returns 指标数组，含标题与展示值
 */
function getMetrics(item: any, position: 'A' | 'B') {
  return [
    {
      label: $t('packagingDashboard.feedInQty'),
      value: formatValue(item?.[`feedInQty${position}`]),
    },
    {
      label: $t('packagingDashboard.manualRejectQty'),
      value: formatValue(item?.[`manualRejectQty${position}`]),
    },
    {
      label: $t('packagingDashboard.sublineQty'),
      value: formatValue(item?.[`sublineQty${position}`]),
    },
  ];
}

/**
 * 格式化指标展示值
 * @param value 接口返回的指标值
 * @returns 空值返回 '-'，否则返回原值
 */
function formatValue(value: any) {
  return value === null || value === undefined || value === '' ? '-' : value;
}

/** 加载看板数据 */
function loadDashboard() {
  loading.value = true;
  getPackagingDashboard()
    .then((data: any) => {
      dashboardList.value = Array.isArray(data) ? data : [];
    })
    .finally(() => {
      loading.value = false;
    });
}

onMounted(() => {
  loadDashboard();
});
</script>

<template>
  <div class="p-4">
    <Spin :spinning="loading">
      <Empty
        v-if="dashboardList.length === 0"
        :description="$t('packagingDashboard.noData')"
      />
      <Row v-else :gutter="[16, 16]">
        <Col
          v-for="(item, index) in dashboardList"
          :key="index"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="8"
          :xl="8"
          :xxl="6"
        >
          <Card class="h-full">
            <div
              v-for="(position, positionIndex) in positions"
              :key="position"
              class="pb-3"
              :class="
                positionIndex < positions.length - 1
                  ? 'mb-3 border-b border-gray-200'
                  : ''
              "
            >
              <!-- 产线名称 -->
              <div
                class="mb-3 truncate text-center text-xl font-bold text-primary"
              >
                {{ getSubLineName(item, position) || '-' }}
              </div>
              <!-- 三个同行指标 -->
              <Row :gutter="8">
                <Col
                  v-for="metric in getMetrics(item, position)"
                  :key="metric.label"
                  :span="8"
                >
                  <div class="text-center">
                    <div class="truncate text-xs text-gray-500">
                      {{ metric.label }}
                    </div>
                    <div class="text-xl font-bold">
                      {{ metric.value }}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>
    </Spin>
  </div>
</template>

<style scoped>
/* 作用域样式，仅对当前组件生效 */
</style>
