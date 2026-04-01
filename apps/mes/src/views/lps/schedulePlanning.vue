<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Card } from 'ant-design-vue';
import { GanttChart } from 'jordium-gantt-vue3';

import 'jordium-gantt-vue3/dist/assets/jordium-gantt-vue3.css';

const tasks = ref([
  {
    id: 1,
    name: 'MES系统升级项目',
    type: 'story',
    assignee: '项目经理',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    progress: 0,
    collapsed: false,
    children: [
      {
        id: 2,
        name: '需求调研',
        startDate: '2026-04-01',
        endDate: '2026-04-10',
        progress: 100,
        assignee: '项目经理',
        type: 'task',
        parentId: 1,
        level: 1,
      },
      {
        id: 3,
        name: '需求分析',
        startDate: '2026-04-11',
        endDate: '2026-04-15',
        progress: 100,
        predecessor: [2],
        assignee: '产品经理',
        type: 'task',
        parentId: 1,
        level: 1,
      },
      {
        id: 4,
        name: '系统设计',
        startDate: '2026-04-16',
        endDate: '2026-04-25',
        progress: 100,
        predecessor: [3],
        assignee: '系统架构师',
        type: 'task',
        parentId: 1,
        level: 1,
      },
      {
        id: 5,
        name: 'UI设计',
        startDate: '2026-04-20',
        endDate: '2026-05-05',
        progress: 100,
        predecessor: [3],
        assignee: 'UI设计师',
        type: 'task',
        parentId: 1,
        level: 1,
      },
      {
        id: 6,
        name: '数据库设计',
        startDate: '2026-04-26',
        endDate: '2026-05-10',
        progress: 100,
        predecessor: [4],
        assignee: '数据库工程师',
        type: 'task',
        parentId: 1,
        level: 1,
      },
      {
        id: 7,
        name: '前端开发',
        startDate: '2026-05-06',
        endDate: '2026-05-25',
        progress: 80,
        predecessor: [5],
        assignee: '前端工程师',
        type: 'task',
        parentId: 1,
        level: 1,
      },
      {
        id: 8,
        name: '后端开发',
        startDate: '2026-05-11',
        endDate: '2026-05-30',
        progress: 70,
        predecessor: [4, 6],
        assignee: '后端工程师',
        type: 'task',
        parentId: 1,
        level: 1,
      },
      {
        id: 9,
        name: '接口开发',
        startDate: '2026-06-01',
        endDate: '2026-06-15',
        progress: 50,
        predecessor: [8],
        assignee: '全栈工程师',
        type: 'task',
        parentId: 1,
        level: 1,
      },
      {
        id: 10,
        name: '单元测试',
        startDate: '2026-06-10',
        endDate: '2026-06-20',
        progress: 30,
        predecessor: [7, 8],
        assignee: '测试工程师',
        type: 'task',
        parentId: 1,
        level: 1,
      },
      {
        id: 11,
        name: '集成测试',
        startDate: '2026-06-21',
        endDate: '2026-06-25',
        progress: 20,
        predecessor: [9, 10],
        assignee: '测试工程师',
        type: 'task',
        parentId: 1,
        level: 1,
      },
      {
        id: 12,
        name: '用户验收测试',
        startDate: '2026-06-26',
        endDate: '2026-06-28',
        progress: 0,
        predecessor: [11],
        assignee: '产品经理',
        type: 'task',
        parentId: 1,
        level: 1,
      },
      {
        id: 13,
        name: '部署上线',
        startDate: '2026-06-29',
        endDate: '2026-06-30',
        progress: 0,
        predecessor: [12],
        assignee: '运维工程师',
        type: 'task',
        parentId: 1,
        level: 1,
      },
      {
        id: 14,
        name: '项目验收',
        startDate: '2026-06-30',
        endDate: '2026-06-30',
        progress: 0,
        predecessor: [13],
        assignee: '项目经理',
        type: 'task',
        parentId: 1,
        level: 1,
      },
    ],
  },
]);

/**
 * 资源列表
 */
const resources = ref([
  {
    id: 'dev-001',
    name: '张三',
    type: 'developer',
    department: '研发部',
    skills: ['Vue', 'TypeScript', 'Node.js'],
    capacity: 85, // 整体负载水平
    color: '#409eff',
    tasks: [
      {
        id: 2,
        name: '需求调研',
        startDate: '2026-04-01',
        endDate: '2026-04-10',
        progress: 100,
        resources: [{ id: 'dev-001', capacity: 50 }],
      },
      {
        id: 999,
        name: '需求调研2',
        startDate: '2026-04-02',
        endDate: '2026-04-15',
        progress: 100,
        resources: [{ id: 'dev-001', capacity: 50 }],
      },
      {
        id: 996,
        name: '需求调研2',
        startDate: '2026-04-03',
        endDate: '2026-04-05',
        progress: 100,
        resources: [{ id: 'dev-001', capacity: 50 }],
      },
      {
        id: 14,
        name: '项目验收',
        startDate: '2026-06-30',
        endDate: '2026-06-30',
        progress: 0,
        resources: [{ id: 'dev-001', capacity: 80 }],
      },
    ],
  },
  {
    id: 'dev-002',
    name: '李四',
    type: 'developer',
    department: '研发部',
    skills: ['需求分析', '产品设计', 'Axure'],
    capacity: 70, // 整体负载水平
    color: '#67c23a',
    tasks: [
      {
        id: 3,
        name: '需求分析',
        startDate: '2026-04-11',
        endDate: '2026-04-15',
        progress: 100,
        resources: [{ id: 'dev-002', capacity: 100 }],
      },
      {
        id: 12,
        name: '用户验收测试',
        startDate: '2026-06-26',
        endDate: '2026-06-28',
        progress: 0,
        resources: [{ id: 'dev-002', capacity: 90 }],
      },
    ],
  },
  {
    id: 'dev-003',
    name: '王五',
    type: 'developer',
    department: '研发部',
    skills: ['系统架构', '微服务', 'Docker', 'Kubernetes'],
    capacity: 90, // 整体负载水平
    color: '#e6a23c',
    tasks: [
      {
        id: 4,
        name: '系统设计',
        startDate: '2026-04-16',
        endDate: '2026-04-25',
        progress: 100,
        resources: [{ id: 'dev-003', capacity: 100 }],
      },
      {
        id: 8,
        name: '后端开发',
        startDate: '2026-05-11',
        endDate: '2026-05-30',
        progress: 70,
        resources: [
          { id: 'dev-003', capacity: 80 },
          { id: 'dev-004', capacity: 60 },
        ],
      },
    ],
  },
  {
    id: 'dev-004',
    name: '赵六',
    type: 'developer',
    department: '设计部',
    skills: ['UI设计', 'Figma', 'Sketch', 'Photoshop'],
    capacity: 75, // 整体负载水平
    color: '#f56c6c',
    tasks: [
      {
        id: 5,
        name: 'UI设计',
        startDate: '2026-04-20',
        endDate: '2026-05-05',
        progress: 100,
        resources: [{ id: 'dev-004', capacity: 100 }],
      },
    ],
  },
  {
    id: 'dev-005',
    name: '钱七',
    type: 'developer',
    department: '研发部',
    skills: ['MySQL', 'PostgreSQL', 'Redis', 'MongoDB'],
    capacity: 60, // 整体负载水平
    color: '#909399',
    tasks: [
      {
        id: 6,
        name: '数据库设计',
        startDate: '2026-04-26',
        endDate: '2026-05-10',
        progress: 100,
        resources: [{ id: 'dev-005', capacity: 100 }],
      },
    ],
  },
  {
    id: 'dev-006',
    name: '孙八',
    type: 'developer',
    department: '研发部',
    skills: ['Vue3', 'React', 'TypeScript', 'Vite'],
    capacity: 80, // 整体负载水平
    color: '#409eff',
    tasks: [
      {
        id: 7,
        name: '前端开发',
        startDate: '2026-05-06',
        endDate: '2026-05-25',
        progress: 80,
        resources: [{ id: 'dev-006', capacity: 100 }],
      },
      {
        id: 10,
        name: '单元测试',
        startDate: '2026-06-10',
        endDate: '2026-06-20',
        progress: 30,
        resources: [
          { id: 'dev-006', capacity: 50 },
          { id: 'dev-009', capacity: 50 },
        ],
      },
    ],
  },
  {
    id: 'dev-007',
    name: '周九',
    type: 'developer',
    department: '研发部',
    skills: ['Java', 'Spring Boot', 'MyBatis', 'Spring Cloud'],
    capacity: 85, // 整体负载水平
    color: '#67c23a',
    tasks: [
      {
        id: 8,
        name: '后端开发',
        startDate: '2026-05-11',
        endDate: '2026-05-30',
        progress: 70,
        resources: [
          { id: 'dev-003', capacity: 80 },
          { id: 'dev-007', capacity: 60 },
        ],
      },
    ],
  },
  {
    id: 'dev-008',
    name: '吴十',
    type: 'developer',
    department: '研发部',
    skills: ['Node.js', 'Python', 'Go', 'RESTful API'],
    capacity: 70, // 整体负载水平
    color: '#e6a23c',
    tasks: [
      {
        id: 9,
        name: '接口开发',
        startDate: '2026-06-01',
        endDate: '2026-06-15',
        progress: 50,
        resources: [{ id: 'dev-008', capacity: 100 }],
      },
    ],
  },
  {
    id: 'dev-009',
    name: '郑十一',
    type: 'developer',
    department: '测试部',
    skills: ['Jest', 'Cypress', 'Selenium', 'JMeter'],
    capacity: 75, // 整体负载水平
    color: '#f56c6c',
    tasks: [
      {
        id: 10,
        name: '单元测试',
        startDate: '2026-06-10',
        endDate: '2026-06-20',
        progress: 30,
        resources: [
          { id: 'dev-006', capacity: 50 },
          { id: 'dev-009', capacity: 50 },
        ],
      },
      {
        id: 11,
        name: '集成测试',
        startDate: '2026-06-21',
        endDate: '2026-06-25',
        progress: 20,
        resources: [{ id: 'dev-009', capacity: 100 }],
      },
    ],
  },
  {
    id: 'dev-010',
    name: '王十二',
    type: 'developer',
    department: '运维部',
    skills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Nginx'],
    capacity: 65, // 整体负载水平
    color: '#909399',
    tasks: [
      {
        id: 13,
        name: '部署上线',
        startDate: '2026-06-29',
        endDate: '2026-06-30',
        progress: 0,
        resources: [{ id: 'dev-010', capacity: 100 }],
      },
    ],
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
