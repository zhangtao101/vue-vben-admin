<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Card } from 'ant-design-vue';
import { GanttChart } from 'jordium-gantt-vue3';

import 'jordium-gantt-vue3/dist/assets/jordium-gantt-vue3.css';

const tasks = ref([
  {
    id: 1,
    name: '项目启动',
    startDate: '2025-01-01',
    endDate: '2025-01-10',
    progress: 100,
  },
  {
    id: 2,
    name: '需求分析',
    startDate: '2025-01-11',
    endDate: '2025-01-20',
    progress: 80,
    predecessor: [1],
  },
  {
    id: 3,
    name: '系统设计',
    startDate: '2025-01-21',
    endDate: '2025-02-05',
    progress: 50,
    predecessor: [2],
  },
  {
    id: 1_769_477_603_200,
    name: 'teset',
    type: 'story',
    assignee: '',
    startDate: '2026-01-16',
    endDate: '2026-02-07',
    actualStartDate: '',
    actualEndDate: '',
    predecessor: [],
    estimatedHours: 0,
    actualHours: 0,
    progress: 0,
    description: '',
    isTimerRunning: false,
    timerElapsedTime: 0,
    children: [
      {
        id: 1_769_477_627_369,
        name: '345',
        type: 'task',
        assignee: '',
        startDate: '2026-01-16',
        endDate: '2026-02-07',
        actualStartDate: '',
        actualEndDate: '',
        predecessor: [],
        estimatedHours: 0,
        actualHours: 0,
        progress: 0,
        description: '',
        parentId: 1_769_477_603_200,
        isTimerRunning: false,
        timerElapsedTime: 0,
        collapsed: false,
        level: 1,
      },
    ],
    collapsed: false,
  },
]);
/**
 * 工具栏配置
 */
const toolbarConfig: any = {
  showAddTask: true, // 显示添加任务按钮
  showAddMilestone: false, // 显示添加里程碑按钮
  showTodayLocate: true, // 显示定位到今天按钮
  showExportCsv: true, // 显示导出CSV按钮
  showExportPdf: true, // 显示导出PDF按钮
  showLanguage: false, // 显示语言切换按钮
  showTheme: true, // 显示主题切换按钮
  showFullscreen: true, // 显示全屏按钮
  showTimeScale: true, // 显示时间刻度按钮组
  timeScaleDimensions: [
    // 显示所有时间刻度维度
    'hour',
    'day',
    'week',
    'month',
    'quarter',
    'year',
  ],
  defaultTimeScale: 'week', // 默认选中周视图
  showExpandCollapse: true, // 显示展开/折叠按钮
};
/**
 * 语言配置
 */
const customMessages = {
  'zh-CN': {
    // 任务列表相关
    assignee: '分配设备',
  },
};
</script>

<template>
  <Page>
    <Card>
      <GanttChart
        :tasks="tasks"
        :enable-task-row-move="true"
        :toolbar-config="toolbarConfig"
        :locale-messages="customMessages"
      />
      {{ tasks }}
    </Card>
  </Page>
</template>

<style scoped></style>
