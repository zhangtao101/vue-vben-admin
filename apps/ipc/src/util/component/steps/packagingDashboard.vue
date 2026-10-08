<script setup lang="ts">
import type { PackagingDashboardItem } from '#/api';

/**
 * [INPUT]: 依赖 vue、ant-design-vue（Card/Col/Empty/Row/Spin）、#/api 的 getPackagingDashboard 接口、#/locales 国际化。
 * [OUTPUT]: 对外提供 PackagingDashboard 包装看板步骤组件（步骤组件标准入参 functionId/workstationCode/processCode）。
 * [POS]: 属于包装工序步骤组件，页面为四栏 Row 布局，每栏展示上下两条包装产线的名称与三个指标数，并按 stateA/stateB 渲染状态背景色。
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
/** 产线状态：正常生产（绿底白字） */
const STATE_RUNNING = 2;
/** 产线状态：未生产（浅灰底） */
const STATE_IDLE = 3;

/**
 * 取指定栏位的状态值
 * @param item 看板单条数据
 * @param position A 上栏 / B 下栏
 * @returns 状态数字，取不到时返回 NaN
 */
function getState(item: PackagingDashboardItem, position: 'A' | 'B') {
  return Number((item as any)?.[`state${position}`]);
}

/**
 * 根据状态取背景色类
 * @param item 看板单条数据
 * @param position A 上栏 / B 下栏
 * @returns 状态对应的背景色类，无匹配状态时返回空串
 */
function getStateBgClass(item: PackagingDashboardItem, position: 'A' | 'B') {
  const state = getState(item, position);
  if (state === STATE_RUNNING) return 'bg-green-500';
  if (state === STATE_IDLE) return 'bg-gray-100';
  return '';
}

/**
 * 判断是否正常生产（需用白字保证对比度）
 * @param item 看板单条数据
 * @param position A 上栏 / B 下栏
 * @returns 是否为正常生产状态
 */
function isTextWhite(item: PackagingDashboardItem, position: 'A' | 'B') {
  return getState(item, position) === STATE_RUNNING;
}

/**
 * 上下栏区块的完整样式类（有背景时圆角加内边距，无背景时保留原有分隔线）
 * @param item 看板单条数据
 * @param position A 上栏 / B 下栏
 * @param positionIndex 区块索引
 * @returns 样式类数组
 */
function getPositionClassList(
  item: PackagingDashboardItem,
  position: 'A' | 'B',
  positionIndex: number,
) {
  const bgClass = getStateBgClass(item, position);
  const classes = [bgClass, bgClass ? 'rounded-md px-3 pt-2 pb-3' : 'pb-3'];
  if (positionIndex < positions.length - 1) {
    classes.push('mb-3');
    if (!bgClass) classes.push('border-b border-gray-200');
  }
  return classes;
}

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
          <Card class="h-full" :body-style="{ padding: 0 }">
            <div
              v-for="(position, positionIndex) in positions"
              :key="position"
              :class="getPositionClassList(item, position, positionIndex)"
            >
              <!-- 产线名称 -->
              <div
                class="mb-3 truncate text-center ipc-fs-xl font-bold"
                :class="
                  isTextWhite(item, position) ? 'text-white' : 'text-primary'
                "
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
                    <div
                      class="truncate ipc-fs-xs"
                      :class="
                        isTextWhite(item, position)
                          ? 'text-white/80'
                          : 'text-gray-500'
                      "
                    >
                      {{ metric.label }}
                    </div>
                    <div
                      class="ipc-fs-xl font-bold"
                      :class="isTextWhite(item, position) ? 'text-white' : ''"
                    >
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
