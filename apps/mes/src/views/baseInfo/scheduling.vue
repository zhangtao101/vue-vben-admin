<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { GanttChart } from 'jordium-gantt-vue3';

import 'jordium-gantt-vue3/dist/assets/jordium-gantt-vue3.css';

// 任务数据
const tasks = ref([
  {
    id: 1,
    name: '项目启动',
    startDate: '2026-03-01',
    endDate: '2026-03-10',
    progress: 100,
  },
  {
    id: 2,
    name: '需求分析',
    startDate: '2026-03-11',
    endDate: '2026-03-20',
    progress: 80,
    predecessor: [1],
    // isEditable: false,
  },
  {
    id: 3,
    name: '系统设计',
    startDate: '2026-03-21',
    endDate: '2026-04-05',
    progress: 50,
    predecessor: [2],
    isEditable: false,
  },
]);
// 资源数据数组（资源计划视图使用）
const resources: any[] = [
  {
    id: 'dev-001',
    name: '张三',
    type: 'developer',
    avatar: '/avatars/zhangsan.jpg',
    department: '研发部',
    skills: ['Vue', 'TypeScript', 'Node.js'],
    capacity: 85, // 整体负载水平
    color: '#409eff',
    tasks: [
      {
        id: 1,
        name: '任务A',
        startDate: '2026-03-10',
        endDate: '2026-03-15',
        resources: [{ id: 'dev-001', capacity: 40 }], // 占用40%
      },
      {
        id: 2,
        name: '任务B',
        startDate: '2026-03-10',
        endDate: '2026-03-20',
        resources: [{ id: 'dev-001', capacity: 40 }], // 占用40%
      },
      {
        id: 3,
        name: '任务C',
        startDate: '2026-03-12',
        endDate: '2026-03-18',
        resources: [{ id: 'dev-001', capacity: 30 }], // 占用30%
      },
      // 注意：如果两个任务时间重叠，张三在2月5-8日的总占用率为100%（60%+40%），临界值
    ],
  },
  {
    id: 'dev-002',
    name: '李四',
    type: 'developer',
    avatar: '/avatars/lisi.jpg',
    department: '研发部',
    skills: ['React', 'TypeScript'],
    tasks: [],
  },
];

const setting = ref({
  viewMode: 'task', // 视图模式：'task' 任务计划视图 | 'resource' 资源计划视图
  showToolbar: true, // 是否显示工具栏
  useDefaultDrawer: true, // 是否使用内置任务编辑抽屉（TaskDrawer）
  useDefaultMilestoneDialog: true, // 是否使用内置里程碑编辑对话框（MilestoneDialog）
  autoSortByStartDate: false, // 是否根据开始时间自动排序任务
  allowDragAndResize: true, // 是否允许拖拽和调整任务/里程碑大小
  enableTaskRowMove: false, // 是否允许拖拽和摆放TaskRow
  enableTaskListContextMenu: false, // 是否启用 TaskList（TaskRow）右键菜单功能。为 true 时：未声明 task-list-context-menu 插槽则使用内置菜单，声明了插槽则使用自定义菜单；为 false 时右键菜单完全禁用
  enableTaskBarContextMenu: false, // 是否启用 TaskBar 右键菜单功能。为 true 时：未声明 task-bar-context-menu 插槽则使用内置菜单，声明了插槽则使用自定义菜单；为 false 时右键菜单完全禁用
  assigneeOptions: [
    {
      label: '张三',
      value: 'dev-001',
    },
  ], // 任务编辑抽屉中负责人下拉菜单的选项列表
  locale: 'zh-CN', // 语言设置（响应式）。设置后组件内部语言将跟随变化
  theme: 'light', // 主题模式（响应式）。设置后组件主题将跟随变化
  timeScale: 'week', // 时间刻度（响应式）。设置后时间线刻度将跟随变化
  fullscreen: false, // 全屏状态控制（响应式）。设置后组件全屏状态将跟随变化
  expandAll: true, // 展开/收起所有任务（响应式）。设置后所有任务的展开状态将跟随变化
  enableLinkAnchor: true, // 是否开启Taskbar的关系线锚点
  pendingTaskBackgroundColor: '#409eff', // 待处理任务的TaskBar背景色。支持十六进制颜色值（如 '#409eff'）。优先级：高于系统默认，低于 Task 对象的 barColor 属性
  delayTaskBackgroundColor: '#f56c6c', // 已逾期任务的TaskBar背景色。支持十六进制颜色值（如 '#f56c6c'）。优先级：高于系统默认，低于 Task 对象的 barColor 属性
  completeTaskBackgroundColor: '#909399', // 已完成任务的TaskBar背景色。支持十六进制颜色值（如 '#909399'）。优先级：高于系统默认，低于 Task 对象的 barColor 属性
  ongoingTaskBackgroundColor: '#e6a23c', // 进行中任务的TaskBar背景色。支持十六进制颜色值（如 '#e6a23c'）。优先级：高于系统默认，低于 Task 对象的 barColor 属性
  showActualTaskbar: false, // 是否显示实际TaskBar（在计划TaskBar下方显示实际执行进度）
  enableTaskbarTooltip: true, // 是否启用TaskBar悬停提示框（鼠标悬停显示任务详情）
  enableMilestoneTooltip: true, // 是否启用里程碑悬停提示框（鼠标悬停显示里程碑名称和日期）
  showConflicts: true, // 是否显示资源冲突可视化层（资源视图下显示斜纹背景标识超载区域）
  showTaskbarTab: true, // 是否显示TaskBar上的资源Tab标签（资源视图下TaskBar的资源分配标签）
  enableTaskListCollapsible: true, // 是否允许折叠/展开 TaskList 面板。false 时强制隐藏 TaskList、SplitterBar 及折叠按钮，Timeline 独占全宽
  taskListVisible: true, // 控制 TaskList 的显隐状态（响应式）。仅在 enableTaskListCollapsible=true 时有效
  enableTaskDrawerAutoClose: true, // 是否允许 TaskDrawer 自动关闭（外总点击或按 Esc 时自动关闭）。设为 false 时禁用自动关闭，仅可通过内部按钮手动关闭
});
// 工具栏配置
const toolbarConfig: any = {
  showAddTask: true, // 显示添加任务按钮
  showAddMilestone: false, // 显示添加里程碑按钮
  showTodayLocate: true, // 显示定位到今天按钮
  showExportCsv: false, // 显示导出CSV按钮
  showExportPdf: false, // 显示导出PDF按钮
  showLanguage: false, // 显示语言切换按钮
  showTheme: false, // 显示主题切换按钮
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
  defaultTimeScale: 'day', // 默认选中周视图
  showExpandCollapse: true, // 显示展开/折叠按钮
};
</script>

<template>
  <Page>
    <GanttChart
      :tasks="tasks"
      :resources="resources"
      :toolbar-config="toolbarConfig"
      :view-mode="setting.viewMode"
      :show-toolbar="setting.showToolbar"
      :use-default-drawer="setting.useDefaultDrawer"
      :use-default-milestone-dialog="setting.useDefaultMilestoneDialog"
      :auto-sort-by-start-date="setting.autoSortByStartDate"
      :allow-drag-and-resize="setting.allowDragAndResize"
      :enable-task-row-move="setting.enableTaskRowMove"
      :enable-task-list-context-menu="setting.enableTaskListContextMenu"
      :enable-task-bar-context-menu="setting.enableTaskBarContextMenu"
      :assignee-options="setting.assigneeOptions"
      :locale="setting.locale"
      :theme="setting.theme"
      :time-scale="setting.timeScale"
      :fullscreen="setting.fullscreen"
      :expand-all="setting.expandAll"
      :enable-link-anchor="setting.enableLinkAnchor"
      :pending-task-background-color="setting.pendingTaskBackgroundColor"
      :delay-task-background-color="setting.delayTaskBackgroundColor"
      :complete-task-background-color="setting.completeTaskBackgroundColor"
      :ongoing-task-background-color="setting.ongoingTaskBackgroundColor"
      :show-actual-taskbar="setting.showActualTaskbar"
      :enable-taskbar-tooltip="setting.enableTaskbarTooltip"
      :enable-milestone-tooltip="setting.enableMilestoneTooltip"
      :show-conflicts="setting.showConflicts"
      :show-taskbar-tab="setting.showTaskbarTab"
      :enable-task-list-collapsible="setting.enableTaskListCollapsible"
      :task-list-visible="setting.taskListVisible"
      :enable-task-drawer-auto-close="setting.enableTaskDrawerAutoClose"
    />
  </Page>
</template>

<style scoped lang="scss">
:deep(.drawer-timer) {
  display: none !important;
}
</style>
