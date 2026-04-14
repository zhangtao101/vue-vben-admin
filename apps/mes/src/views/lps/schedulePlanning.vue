<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Card } from 'ant-design-vue';
import { GanttChart } from 'jordium-gantt-vue3';

import 'jordium-gantt-vue3/dist/assets/jordium-gantt-vue3.css';

// 任务数据：从今天(2026-04-13)开始，每项工序3天
const tasks = ref([
  {
    id: 1,
    name: 'MO0001计划',
    type: 'story',
    assignee: '生产计划员A',
    startDate: '2026-04-13',
    endDate: '2026-04-22',
    progress: 0,
    collapsed: false,
    children: [
      {
        id: 11,
        name: '切削',
        startDate: '2026-04-13',
        endDate: '2026-04-15',
        progress: 0,
        assignee: '1#CNC',
        type: 'task',
        parentId: 1,
        level: 1,
      },
      {
        id: 12,
        name: '打磨',
        startDate: '2026-04-16',
        endDate: '2026-04-18',
        progress: 0,
        predecessor: [11],
        assignee: '1#磨床',
        type: 'task',
        parentId: 1,
        level: 1,
      },
      {
        id: 13,
        name: '组装',
        startDate: '2026-04-19',
        endDate: '2026-04-21',
        progress: 0,
        predecessor: [12],
        assignee: '组装组1',
        type: 'task',
        parentId: 1,
        level: 1,
      },
    ],
  },
  {
    id: 2,
    name: 'MO0002计划',
    type: 'story',
    assignee: '生产计划员A',
    startDate: '2026-04-13',
    endDate: '2026-04-22',
    progress: 0,
    collapsed: false,
    children: [
      {
        id: 21,
        name: '切削',
        startDate: '2026-04-13',
        endDate: '2026-04-15',
        progress: 0,
        assignee: '2#CNC',
        type: 'task',
        parentId: 2,
        level: 1,
      },
      {
        id: 22,
        name: '打磨',
        startDate: '2026-04-16',
        endDate: '2026-04-18',
        progress: 0,
        predecessor: [21],
        assignee: '2#磨床',
        type: 'task',
        parentId: 2,
        level: 1,
      },
      {
        id: 23,
        name: '组装',
        startDate: '2026-04-19',
        endDate: '2026-04-21',
        progress: 0,
        predecessor: [22],
        assignee: '组装组2',
        type: 'task',
        parentId: 2,
        level: 1,
      },
    ],
  },
]);

/**
 * 资源列表
 */
const resources = ref([
  // 切削设备
  {
    id: 'cnc-001',
    name: '1#CNC',
    type: 'equipment',
    department: '切削车间',
    skills: ['车削', '铣削'],
    capacity: 100,
    color: '#409eff',
    tasks: [
      {
        id: 11,
        name: 'MO0001-切削',
        startDate: '2026-04-13',
        endDate: '2026-04-15',
        progress: 0,
        resources: [{ id: 'cnc-001', capacity: 100 }],
      },
    ],
  },
  {
    id: 'cnc-002',
    name: '2#CNC',
    type: 'equipment',
    department: '切削车间',
    skills: ['车削', '铣削'],
    capacity: 100,
    color: '#67c23a',
    tasks: [
      {
        id: 21,
        name: 'MO0002-切削',
        startDate: '2026-04-13',
        endDate: '2026-04-15',
        progress: 0,
        resources: [{ id: 'cnc-002', capacity: 100 }],
      },
    ],
  },
  {
    id: 'cnc-003',
    name: '3#CNC',
    type: 'equipment',
    department: '切削车间',
    skills: ['车削', '铣削'],
    capacity: 100,
    color: '#e6a23c',
    tasks: [],
  },
  // 打磨设备
  {
    id: 'mill-001',
    name: '1#磨床',
    type: 'equipment',
    department: '打磨车间',
    skills: ['平面磨', '外圆磨'],
    capacity: 100,
    color: '#f56c6c',
    tasks: [
      {
        id: 12,
        name: 'MO0001-打磨',
        startDate: '2026-04-16',
        endDate: '2026-04-18',
        progress: 0,
        resources: [{ id: 'mill-001', capacity: 100 }],
      },
    ],
  },
  {
    id: 'mill-002',
    name: '2#磨床',
    type: 'equipment',
    department: '打磨车间',
    skills: ['平面磨', '外圆磨'],
    capacity: 100,
    color: '#909399',
    tasks: [
      {
        id: 22,
        name: 'MO0002-打磨',
        startDate: '2026-04-16',
        endDate: '2026-04-18',
        progress: 0,
        resources: [{ id: 'mill-002', capacity: 100 }],
      },
    ],
  },
  {
    id: 'mill-003',
    name: '3#磨床',
    type: 'equipment',
    department: '打磨车间',
    skills: ['平面磨', '外圆磨'],
    capacity: 100,
    color: '#b37feb',
    tasks: [],
  },
  // 组装人工资源
  {
    id: 'worker-001',
    name: '组装组1',
    type: 'worker',
    department: '组装车间',
    skills: ['组装', '调试'],
    capacity: 100,
    color: '#36cfc9',
    tasks: [
      {
        id: 13,
        name: 'MO0001-组装',
        startDate: '2026-04-19',
        endDate: '2026-04-21',
        progress: 0,
        resources: [{ id: 'worker-001', capacity: 100 }],
      },
    ],
  },
  {
    id: 'worker-002',
    name: '组装组2',
    type: 'worker',
    department: '组装车间',
    skills: ['组装', '调试'],
    capacity: 100,
    color: '#bae637',
    tasks: [
      {
        id: 23,
        name: 'MO0002-组装',
        startDate: '2026-04-19',
        endDate: '2026-04-21',
        progress: 0,
        resources: [{ id: 'worker-002', capacity: 100 }],
      },
    ],
  },
  // 人员资源
  {
    id: 'person-001',
    name: '张三',
    type: 'person',
    department: '生产部',
    skills: ['切削', '打磨', '组装'],
    capacity: 100,
    color: '#9254de',
    tasks: [
      {
        id: 13,
        name: 'MO0001-组装',
        startDate: '2026-04-19',
        endDate: '2026-04-21',
        progress: 0,
        resources: [{ id: 'person-001', capacity: 100 }],
      },
    ],
  },
  {
    id: 'person-002',
    name: '李四',
    type: 'person',
    department: '生产部',
    skills: ['切削', '打磨', '组装'],
    capacity: 100,
    color: '#f759ab',
    tasks: [
      {
        id: 23,
        name: 'MO0002-组装',
        startDate: '2026-04-19',
        endDate: '2026-04-21',
        progress: 0,
        resources: [{ id: 'person-002', capacity: 100 }],
      },
    ],
  },
  {
    id: 'person-003',
    name: '王五',
    type: 'person',
    department: '生产部',
    skills: ['切削', '打磨', '组装'],
    capacity: 100,
    color: '#73d13d',
    tasks: [],
  },
  {
    id: 'person-004',
    name: '赵六',
    type: 'person',
    department: '生产部',
    skills: ['切削', '打磨', '组装'],
    capacity: 100,
    color: '#597ef7',
    tasks: [],
  },
  {
    id: 'person-005',
    name: '钱七',
    type: 'person',
    department: '生产部',
    skills: ['切削', '打磨', '组装'],
    capacity: 100,
    color: '#ff7a45',
    tasks: [],
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
        :resources="resources"
        :enable-task-row-move="true"
        :toolbar-config="toolbarConfig"
        :locale-messages="customMessages"
        :enable-task-bar-context-menu="false"
        class="!h-[600px]"
      />
    </Card>
  </Page>
</template>

<style scoped></style>
