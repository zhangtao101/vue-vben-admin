<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Calendar, Card, DatePicker, Descriptions, DescriptionsItem, Drawer, Form, FormItem, Input, Tabs, Tag } from 'ant-design-vue';
import dayjs from 'dayjs';

import { searchInspectionCalendar, searchMaintenanceCalendar } from '#/api';
import { $t } from '#/locales';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

/** 计划标签色板 */
const colorPalette = [
  'blue', 'green', 'orange', 'red', 'purple', 'cyan', 'magenta',
  'gold', 'lime', 'geekblue', 'volcano',
];

// ========== 查询参数 ==========
const queryParams = ref<Record<string, any>>({
  startDate: '',
  endDate: '',
  equipmentGroup: '',
  equipmentCode: '',
  operator: '',
});

/** 日期范围初始值：当前月1号 ~ 当前月末 */
const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([
  dayjs().startOf('month'),
  dayjs().endOf('month'),
]);

// ========== 查询结果数据 ==========
const calendarData = ref<any[]>([]);

/**
 * 按日期分组的事件数据，用于日历单元格渲染
 * @since 2026-08-03
 */
const eventsByDate = computed<Record<string, any[]>>(() => {
  const map: Record<string, any[]> = {};
  calendarData.value.forEach((item: any) => {
    const key = dayjs(item.firstExecuteTime).format('YYYY-MM-DD');
    if (!map[key]) {
      map[key] = [];
    }
    map[key].push(item);
  });
  return map;
});

/**
 * 计划颜色映射，每个 planCode 分配固定颜色
 * @since 2026-08-03
 */
const planColorMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {};
  calendarData.value.forEach((item: any) => {
    const key = item.planCode || item.planName;
    if (!map[key]) {
      map[key] = colorPalette[Object.keys(map).length % colorPalette.length] || 'blue';
    }
  });
  return map;
});

/**
 * 根据计划项获取对应颜色
 * @param item 计划数据项
 * @returns 颜色名
 * @since 2026-08-03
 */
function getPlanColor(item: any): string {
  return planColorMap.value[item.planCode || item.planName] || 'default';
}

/** 当前日历面板月 */
const calendarValue = ref(dayjs());

// ========== 当前激活的 Tab ==========
const activeTab = ref('inspection');

// ========== 数据查询 ==========
function handleSearch() {
  const api =
    activeTab.value === 'inspection'
      ? searchInspectionCalendar
      : searchMaintenanceCalendar;

  api(queryParams.value)
    .then(({ list }) => {
      calendarData.value = list || [];
    })
    .catch(() => {
      calendarData.value = [];
    });
}

// ========== 日期范围选择 ==========
function handleDateChange(_dates: any, dateStrings: string[]) {
  queryParams.value.startDate = dateStrings[0] || '';
  queryParams.value.endDate = dateStrings[1] || '';
}

// ========== Tab 切换 ==========
function handleTabChange() {
  handleSearch();
}

// ========== 重置 ==========
function handleReset() {
  dateRange.value = [dayjs().startOf('month'), dayjs().endOf('month')];
  queryParams.value = {
    startDate: dateRange.value[0].format('YYYY-MM-DD 00:00:00'),
    endDate: dateRange.value[1].format('YYYY-MM-DD 23:59:59'),
    equipmentGroup: '',
    equipmentCode: '',
    operator: '',
  };
  calendarData.value = [];
  handleSearch();
}

// ========== 详情抽屉 ==========
const detailVisible = ref(false);
const detailItem = ref<any>({});

/**
 * 详情字段配置
 * @since 2026-08-03
 */
const detailFields: { key: string; label: string }[] = [
  { key: 'planCode', label: 'planManagement.planCalendar.planCode' },
  { key: 'planName', label: 'planManagement.planCalendar.planName' },
  { key: 'equipmentGroup', label: 'planManagement.planCalendar.equipmentGroup' },
  { key: 'equipmentCode', label: 'planManagement.planCalendar.equipmentCode' },
  { key: 'firstExecuteTime', label: 'planManagement.planCalendar.firstExecuteTime' },
  { key: 'operator', label: 'planManagement.planCalendar.operator' },
];

/**
 * 打开详情抽屉
 * @param item 计划数据项
 * @since 2026-08-03
 */
function showDetail(item: any) {
  detailItem.value = item;
  detailVisible.value = true;
}

// ========== 页面初始化查询 ==========
onMounted(() => {
  handleReset();
});

</script>

<template>
  <Page>
    <!-- region 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 日期范围 -->
        <FormItem
          :label="$t('planManagement.planCalendar.selectDateRange')"
          style="margin-bottom: 1em"
        >
          <RangePicker
            v-model:value="dateRange"
            format="YYYY-MM-DD"
            :placeholder="[
              $t('planManagement.planCalendar.selectDateRange'),
              $t('planManagement.planCalendar.selectDateRange'),
            ]"
            @change="handleDateChange"
          />
        </FormItem>

        <!-- 设备组 -->
        <FormItem
          :label="$t('planManagement.planCalendar.equipmentGroup')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.equipmentGroup"
            allow-clear
          />
        </FormItem>

        <!-- 设备编号 -->
        <FormItem
          :label="$t('planManagement.planCalendar.equipmentCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.equipmentCode"
            allow-clear
          />
        </FormItem>

        <!-- 操作人 -->
        <FormItem
          :label="$t('planManagement.planCalendar.operator')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.operator"
            allow-clear
          />
        </FormItem>

        <!-- 重置按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button @click="handleReset">
            {{ $t('common.reset') }}
          </Button>
        </FormItem>

        <!-- 查询按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="handleSearch">
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region Tab -->
    <Card>
      <Tabs v-model:active-key="activeTab" @change="handleTabChange">
        <!-- 设备点检计划 Tab -->
        <TabPane
          key="inspection"
          :tab="$t('planManagement.planCalendar.equipmentInspectionPlan')"
        />
        <!-- 设备保养计划 Tab -->
        <TabPane
          key="maintenance"
          :tab="$t('planManagement.planCalendar.equipmentMaintenancePlan')"
        />
      </Tabs>
      <Calendar v-model:value="calendarValue" mode="month">
        <template #headerRender="{ value, onChange }">
          <div class="flex items-center justify-center gap-2 p-2">
            <Button size="small" @click="onChange(dayjs(value).subtract(1, 'year'))">
              &lt;&lt;
            </Button>
            <Button size="small" @click="onChange(dayjs(value).subtract(1, 'month'))">
              &lt;
            </Button>
            <span class="text-lg font-bold mx-4">
              {{ dayjs(value).format('YYYY-MM') }}
            </span>
            <Button size="small" @click="onChange(dayjs(value).add(1, 'month'))">
              &gt;
            </Button>
            <Button size="small" @click="onChange(dayjs(value).add(1, 'year'))">
              &gt;&gt;
            </Button>
          </div>
        </template>
        <template #dateCellRender="{ current }">
          <ul class="list-none !p-0 !m-0 flex flex-wrap gap-1">
            <li
              v-for="(item, idx) in eventsByDate[
                dayjs(current).format('YYYY-MM-DD')
              ]"
              :key="idx"
              :title="item.planName"
            >
              <Tag :color="getPlanColor(item)" class="m-1! cursor-pointer" @click="showDetail(item)">
                {{ item.planName }}
              </Tag>
            </li>
          </ul>
        </template>
      </Calendar>
    </Card>
    <!-- endregion -->

    <!-- region 详情抽屉 -->
    <Drawer
      v-model:open="detailVisible"
      :title="$t('planManagement.planCalendar.planDetail')"
      width="560"
    >
      <Descriptions bordered :column="1" size="small">
        <DescriptionsItem
          v-for="field in detailFields"
          :key="field.key"
          :label="$t(field.label)"
        >
          {{ detailItem[field.key] || '-' }}
        </DescriptionsItem>
      </Descriptions>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>
