/**
 * 运输监控组件
 * @description
 * 用于 AGV 运输监控演示，页面采用左右两栏布局：
 * - 左侧：运输任务清单表格，字段包括任务号、AGV小车ID、吨桶ID、起始点位、目标机台、任务状态、操作（监控查看按钮），并通过表格行颜色区分任务状态（未执行-白色、执行中-黄色、已完成-绿色）。
 * - 右侧：Canvas 绘制的现场布局图（库位网格 + AGV 小车 + 路径箭头），根据左侧表格选中的任务显示对应 AGV 位置。
 * 纯前端演示，无接口调用。
 * @since 2026-08-19 10:30:00
 */
<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { Button, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

defineOptions({ name: 'TransportMonitor' });

/**
 * 定义组件的 props，用于接收父组件传递的数据
 */
withDefaults(
  defineProps<{
    // 工序ID，用于标识具体的工序，默认为 0
    bindingId?: number;
    // 设备编号，用于标识具体的设备，默认为空字符串
    equipCode?: string;
    // 工步id，用于标识具体的工步，默认为 0
    functionId?: number;
    // 展示类型，用于控制页面展示的内容，默认为 0
    showTypeNumber?: number;
    // 工单编号，用于标识具体的工单，默认为空字符串
    worksheetCode?: string;
    // 工作中心，用于标识具体的工作中心，默认为空字符串
    workstationCode?: string;
  }>(),
  {
    functionId: 0,
    bindingId: 0,
    worksheetCode: '',
    equipCode: '',
    workstationCode: '',
    showTypeNumber: 0,
  },
);

// region 运输任务清单表格

/**
 * 运输任务演示数据
 * 功能：模拟 AGV 运输任务列表，用于演示运输监控流程
 * 字段说明：
 * - taskNo       任务号
 * - agvId        AGV小车ID
 * - tonBucketId  吨桶ID
 * - startPoint   起始点位
 * - targetPoint  目标机台
 * - agvX/agvY    AGV 在布局图中的坐标（百分比 0-100）
 * - taskStatus   任务状态 0-待下发 1-已下发 2-执行中 3-已完成
 */
const taskList = ref<any[]>([
  {
    taskNo: 'TR-20260819-001',
    agvId: 'AGV-01',
    tonBucketId: 'TB-1001',
    startPoint: 'A-01',
    targetPoint: 'B-03',
    agvX: 12,
    agvY: 88,
    taskStatus: 2,
  },
  {
    taskNo: 'TR-20260819-002',
    agvId: 'AGV-02',
    tonBucketId: 'TB-1002',
    startPoint: 'A-02',
    targetPoint: 'B-05',
    agvX: 78,
    agvY: 90,
    taskStatus: 1,
  },
  {
    taskNo: 'TR-20260819-003',
    agvId: 'AGV-03',
    tonBucketId: 'TB-1003',
    startPoint: 'A-03',
    targetPoint: 'B-07',
    agvX: 50,
    agvY: 50,
    taskStatus: 3,
  },
  {
    taskNo: 'TR-20260819-004',
    agvId: 'AGV-04',
    tonBucketId: 'TB-1004',
    startPoint: 'A-04',
    targetPoint: 'B-09',
    agvX: 30,
    agvY: 30,
    taskStatus: 0,
  },
  {
    taskNo: 'TR-20260819-005',
    agvId: 'AGV-05',
    tonBucketId: 'TB-1005',
    startPoint: 'A-05',
    targetPoint: 'B-11',
    agvX: 85,
    agvY: 50,
    taskStatus: 2,
  },
]);

/**
 * 当前选中的任务
 * 用于在右侧布局图高亮显示对应 AGV
 */
const selectedTask = ref<any>(taskList.value[0]);

/**
 * 任务状态文本
 * 功能：根据状态码返回对应的任务状态描述
 *
 * @param {number} status - 任务状态码（0-待下发 1-已下发 2-执行中 3-已完成）
 * @returns {string} 对应的任务状态文本
 */
function getTaskStatusText(status: number) {
  const statusMap: Record<number, string> = {
    0: '待下发',
    1: '已下发',
    2: '执行中',
    3: '已完成',
  };
  return statusMap[status] || '未知';
}

/**
 * 任务状态颜色
 * 功能：根据状态码返回对应的 Tag 颜色
 *
 * @param {number} status - 任务状态码
 * @returns {string} 对应的颜色标识（orange-待下发 blue-已下发 cyan-执行中 green-已完成）
 */
function getTaskStatusColor(status: number) {
  const colorMap: Record<number, string> = {
    0: 'orange',
    1: 'blue',
    2: 'cyan',
    3: 'green',
  };
  return colorMap[status] || 'default';
}

/**
 * 任务状态行颜色
 * 功能：根据任务状态码返回表格行对应的背景色类名
 *
 * @param {number} status - 任务状态码（0-待下发 1-已下发 2-执行中 3-已完成）
 * @returns {string} 行背景色类名（task-row-pending-白色 task-row-running-黄色 task-row-completed-绿色）
 */
function getTaskRowClass(status: number) {
  const classMap: Record<number, string> = {
    0: 'task-row-pending',
    1: 'task-row-pending',
    2: 'task-row-running',
    3: 'task-row-completed',
  };
  return classMap[status] || 'task-row-pending';
}

/**
 * 监控查看操作
 * 功能：模拟点击监控查看按钮，在右侧布局图定位到该任务对应的 AGV
 *
 * @param {any} row - 当前操作的任务行数据
 */
function viewMonitor(row: any) {
  selectedTask.value = row;
}

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      field: 'taskNo',
      title: '任务号',
      minWidth: 160,
    },
    {
      field: 'agvId',
      title: 'AGV小车ID',
      minWidth: 100,
    },
    {
      field: 'tonBucketId',
      title: '吨桶ID',
      minWidth: 90,
    },
    {
      field: 'startPoint',
      title: '起始点位',
      minWidth: 100,
    },
    {
      field: 'targetPoint',
      title: '目标机台',
      minWidth: 100,
    },
    {
      field: 'taskStatus',
      title: '任务状态',
      minWidth: 110,
      slots: { default: 'taskStatus' },
    },
    {
      title: '操作',
      minWidth: 100,
      slots: { default: 'action' },
      fixed: 'right',
    },
  ],
  rowClassName: ({ row }: any) => getTaskRowClass(row.taskStatus),
  data: taskList.value,
  height: 500,
  stripe: true,
  pagerConfig: {
    enabled: false,
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [Grid] = useVbenVxeGrid({ gridOptions });

// endregion
// region 右侧 Canvas 现场布局图

/**
 * Canvas 引用
 */
const canvasRef = ref<HTMLCanvasElement | null>(null);
/* 当前监听尺寸缓存，用于 resize 重绘 */
let resizeObserver: null | ResizeObserver = null;
/* AGV 小车动画定时器 */
let animationTimer: null | ReturnType<typeof setInterval> = null;
/* 场景几何信息缓存，供动画路径计算使用 */
let sceneGeometry: null | ReturnType<typeof getSceneGeometry> = null;

/**
 * Canvas 尺寸自适应
 * 根据 canvas 父容器的实际尺寸设置画布像素
 */
function resizeCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const parent = canvas.parentElement;
  if (!parent) return;
  const { width, height } = parent.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

/**
 * 绘制库位网格
 * 在画布左侧绘制 6 列 × 8 行的库位网格，含蓝色库位方块与青色库位号圆圈
 */
function drawLocations(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cols = 6;
  const rows = 8;
  const padding = 12;
  const gridWidth = w * 0.78 - padding;
  const gridHeight = h * 0.85;
  const startX = padding;
  const startY = (h - gridHeight) / 2;
  const cellW = gridWidth / cols;
  const cellH = gridHeight / rows;

  ctx.strokeStyle = '#e5b46a';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(startX - 2, startY - 2, gridWidth + 4, gridHeight + 4);
  ctx.setLineDash([]);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * cellW;
      const y = startY + r * cellH;
      // 库位方块
      ctx.fillStyle = '#5b8fc7';
      ctx.fillRect(x + cellW * 0.18, y + cellH * 0.22, cellW * 0.64, cellH * 0.36);
      ctx.strokeStyle = '#2f5f8a';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + cellW * 0.18, y + cellH * 0.22, cellW * 0.64, cellH * 0.36);
      // 库位下方三角形标记
      ctx.fillStyle = '#5b8fc7';
      ctx.beginPath();
      ctx.moveTo(x + cellW * 0.5, y + cellH * 0.86);
      ctx.lineTo(x + cellW * 0.4, y + cellH * 0.66);
      ctx.lineTo(x + cellW * 0.6, y + cellH * 0.66);
      ctx.closePath();
      ctx.fill();
    }
  }

  // 行通道：库位之间的青色横向连线 + 节点圆圈
  const channelYs = [1.5, 3.5, 5.5, 7.5];
  channelYs.forEach((rowIdx) => {
    const y = startY + rowIdx * cellH;
    for (let c = 0; c < cols; c++) {
      const x = startX + c * cellW + cellW * 0.5;
      ctx.beginPath();
      ctx.arc(x, y, cellW * 0.18, 0, Math.PI * 2);
      ctx.strokeStyle = '#5fc8d4';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    // 横向连线（延伸到右侧纵向通道，与 AGV 行走路径对齐）
    ctx.beginPath();
    ctx.moveTo(startX + cellW * 0.5, y);
    ctx.lineTo(w * 0.82, y);
    ctx.strokeStyle = '#5fc8d4';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

/**
 * 绘制右侧通道
 * 含纵向路径、节点圆圈和 AGV 小车
 */
function drawRightChannel(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const channelX = w * 0.82;
  const gridTop = (h - h * 0.85) / 2;
  const gridBottom = gridTop + h * 0.85;

  // 纵向路径
  ctx.beginPath();
  ctx.moveTo(channelX, gridTop);
  ctx.lineTo(channelX, gridBottom);
  ctx.strokeStyle = '#9aa0a6';
  ctx.lineWidth = 6;
  ctx.stroke();

  // 节点圆圈
  const nodeCount = 8;
  for (let i = 0; i < nodeCount; i++) {
    const y = gridTop + ((gridBottom - gridTop) * i) / (nodeCount - 1);
    ctx.beginPath();
    ctx.arc(channelX, y, 6, 0, Math.PI * 2);
    ctx.strokeStyle = '#5fc8d4';
    ctx.lineWidth = 2;
    ctx.stroke();
    // 节点上的双向箭头
    ctx.fillStyle = '#2f3b4a';
    ctx.beginPath();
    ctx.moveTo(channelX, y - 4);
    ctx.lineTo(channelX - 4, y - 10);
    ctx.lineTo(channelX + 4, y - 10);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(channelX, y + 4);
    ctx.lineTo(channelX - 4, y + 10);
    ctx.lineTo(channelX + 4, y + 10);
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * 绘制 AGV 小车
 * 在指定坐标位置绘制橙色 AGV 小车 + 蓝色导航条
 *
 * @param {CanvasRenderingContext2D} ctx - 画布上下文
 * @param {number} w - 画布宽度
 * @param {number} h - 画布高度
 * @param {number} xPercent - 横向位置百分比 0-100
 * @param {number} yPercent - 纵向位置百分比 0-100
 * @param {boolean} highlighted - 是否高亮显示
 */
function drawAgv(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  xPercent: number,
  yPercent: number,
  highlighted = false,
) {
  const padding = 12;
  const usableW = w - padding * 2;
  const usableH = h - padding * 2;
  const x = padding + (usableW * xPercent) / 100;
  const y = padding + (usableH * yPercent) / 100;
  const agvW = 60;
  const agvH = 36;

  // 高亮光晕
  if (highlighted) {
    ctx.beginPath();
    ctx.arc(x, y, agvW * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 153, 0, 0.25)';
    ctx.fill();
  }

  // 蓝色导航条（顶部）
  ctx.fillStyle = '#5fc8d4';
  ctx.fillRect(x - agvW / 2, y - agvH / 2, agvW, 6);
  ctx.strokeStyle = '#2f8a96';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - agvW / 2, y - agvH / 2, agvW, 6);

  // 橙色车身
  ctx.fillStyle = '#ff8b1a';
  ctx.beginPath();
  ctx.roundRect(x - agvW / 2, y - agvH / 2 + 6, agvW, agvH - 6, 4);
  ctx.fill();
  ctx.strokeStyle = '#b85a00';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 车窗
  ctx.fillStyle = '#d6efff';
  ctx.fillRect(x - agvW / 2 + 8, y - agvH / 2 + 10, agvW - 16, 8);
}

/**
 * 绘制选中任务标记
 * 在选中的 AGV 位置绘制高亮标记
 */
function drawSelectedMarker(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  xPercent: number,
  yPercent: number,
) {
  const padding = 12;
  const usableW = w - padding * 2;
  const usableH = h - padding * 2;
  const x = padding + (usableW * xPercent) / 100;
  const y = padding + (usableH * yPercent) / 100;

  ctx.beginPath();
  ctx.arc(x, y, 32, 0, Math.PI * 2);
  ctx.strokeStyle = '#ff4d4f';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * 计算场景几何信息（通道坐标）
 * 功能：根据画布尺寸计算库位网格与通道的坐标，供绘制与动画路径复用
 *
 * @param {number} w - 画布逻辑宽度
 * @param {number} h - 画布逻辑高度
 * @returns {object} 场景几何信息（含横向通道 y 坐标、通道左右端点 x、右侧纵向通道 x）
 */
function getSceneGeometry(w: number, h: number) {
  const padding = 12;
  const cols = 6;
  const rows = 8;
  const gridWidth = w * 0.78 - padding;
  const gridHeight = h * 0.85;
  const startX = padding;
  const startY = (h - gridHeight) / 2;
  const cellW = gridWidth / cols;
  const cellH = gridHeight / rows;
  // 横向空白通道（位于相邻两行库位之间）的 y 坐标
  const chYs = [1.5, 3.5, 5.5, 7.5].map((r) => startY + r * cellH);
  // 通道左端点
  const x1 = startX + cellW * 0.5;
  // 右侧纵向通道 x 坐标
  const vx = w * 0.82;
  return {
    padding,
    cols,
    rows,
    startX,
    startY,
    cellW,
    cellH,
    gridWidth,
    gridHeight,
    chYs,
    x1,
    vx,
    w,
    h,
  };
}

/**
 * 绘制完整布局
 * 主绘制入口：依次绘制背景、库位网格、右侧通道、所有 AGV、选中标记
 */
function drawScene() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;

  // 缓存场景几何信息供动画使用
  sceneGeometry = getSceneGeometry(w, h);

  // 背景
  ctx.fillStyle = '#f0e6d2';
  ctx.fillRect(0, 0, w, h);

  // 通道地坪
  ctx.fillStyle = '#d9c9a3';
  ctx.fillRect(w * 0.78, 0, w * 0.22, h);

  drawLocations(ctx, w, h);
  drawRightChannel(ctx, w, h);

  // 绘制所有 AGV
  taskList.value.forEach((task) => {
    const isSelected = selectedTask.value?.taskNo === task.taskNo;
    drawAgv(ctx, w, h, task.agvX, task.agvY, isSelected);
  });

  // 绘制选中标记
  if (selectedTask.value) {
    drawSelectedMarker(ctx, w, h, selectedTask.value.agvX, selectedTask.value.agvY);
  }
}

/**
 * 获取 AGV 沿通道路径的当前位置（百分比坐标）
 * 功能：计算任务 AGV 沿"横向空白通道 + 右侧纵向通道"闭环路径行走的当前坐标
 *
 * @param {any} task - 任务行数据（含 _trackIdx 轨道编号与 _pathProgress 路径进度）
 * @returns {object | null} 当前坐标（x/y 百分比）或 null（无几何信息时）
 */
function getPathPosition(task: any) {
  const geo = sceneGeometry;
  if (!geo) return null;
  const trackIdx = task._trackIdx ?? 0;
  const chTop = geo.chYs[trackIdx * 2];
  const chBottom = geo.chYs[trackIdx * 2 + 1];
  if (chTop === undefined || chBottom === undefined) return null;
  // 闭环路径：左端→右上（经横向通道）→右下（经纵向通道）→左端
  const path: Array<[number, number]> = [
    [geo.x1, chTop],
    [geo.vx, chTop],
    [geo.vx, chBottom],
    [geo.x1, chBottom],
  ];
  // 计算路径总长与各段长度
  let total = 0;
  const segLens: number[] = [];
  for (const [i, point] of path.entries()) {
    const next = path[i + 1];
    if (!next) break;
    const len = Math.hypot(next[0] - point[0], next[1] - point[1]);
    segLens.push(len);
    total += len;
  }
  if (total === 0) return null;
  // 推进路径进度（约 3 秒走完一圈）
  task._pathProgress = (task._pathProgress ?? 0) + 0.003;
  if (task._pathProgress >= 1) task._pathProgress -= 1;
  const targetDist = task._pathProgress * total;
  let acc = 0;
  for (const [i, segLen] of segLens.entries()) {
    if (acc + segLen >= targetDist) {
      const t = segLen === 0 ? 0 : (targetDist - acc) / segLen;
      const cur = path[i];
      const next = path[i + 1];
      if (!cur || !next) return null;
      const px = cur[0] + (next[0] - cur[0]) * t;
      const py = cur[1] + (next[1] - cur[1]) * t;
      const usableW = geo.w - geo.padding * 2;
      const usableH = geo.h - geo.padding * 2;
      return {
        x: ((px - geo.padding) / usableW) * 100,
        y: ((py - geo.padding) / usableH) * 100,
      };
    }
    acc += segLen;
  }
  return null;
}

/**
 * AGV 位置动画
 * 功能：模拟执行中的 AGV 小车沿空白通道行往返移动（演示动画）
 * 备注：仅"执行中"（taskStatus===2）的任务 AGV 会移动，按任务下标分配不同通道轨道避免重叠
 */
function startAnimation() {
  stopAnimation();
  animationTimer = setInterval(() => {
    taskList.value.forEach((task, idx) => {
      // 仅"执行中"的 AGV 沿空白通道行移动
      if (task.taskStatus !== 2) return;
      if (task._trackIdx === undefined) {
        // 按任务下标分配不同通道轨道（0/1 交替），并错开初始进度
        task._trackIdx = idx % 2;
        task._pathProgress = (idx * 0.25) % 1;
      }
      const pos = getPathPosition(task);
      if (pos) {
        task.agvX = pos.x;
        task.agvY = pos.y;
      }
    });
    drawScene();
  }, 100);
}

/**
 * 停止动画
 * 组件卸载时清理定时器
 */
function stopAnimation() {
  if (animationTimer) {
    clearInterval(animationTimer);
    animationTimer = null;
  }
}

// 监听选中任务变化，重新绘制
watch(selectedTask, () => {
  nextTick(() => drawScene());
});

onMounted(() => {
  nextTick(() => {
    resizeCanvas();
    drawScene();
    // 监听父容器尺寸变化实现自适应
    if (canvasRef.value?.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
        drawScene();
      });
      resizeObserver.observe(canvasRef.value.parentElement);
    }
    startAnimation();
  });
});

onBeforeUnmount(() => {
  stopAnimation();
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});

// endregion
</script>

<template>
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
    <!-- 左侧：运输任务清单列表 -->
    <div>
      <Grid>
        <template #taskStatus="{ row }">
          <Tag :color="getTaskStatusColor(row.taskStatus)">
            {{ getTaskStatusText(row.taskStatus) }}
          </Tag>
        </template>
        <template #action="{ row }">
          <Button
            type="primary"
            size="small"
            :disabled="row.taskStatus === 0 || row.taskStatus === 3"
            @click="viewMonitor(row)"
          >
            监控查看
          </Button>
        </template>
      </Grid>
    </div>
    <!-- 右侧：现场布局图 Canvas -->
    <div
      class="relative h-[560px] w-full overflow-hidden rounded-lg border border-gray-200 bg-[#f0e6d2]"
    >
      <canvas ref="canvasRef" class="block"></canvas>
      <!-- 当前选中任务信息 -->
      <div
        v-if="selectedTask"
        class="absolute left-2 top-2 rounded bg-white/85 px-3 py-2 text-xs shadow"
      >
        <div>
          任务号：<span class="font-medium">{{ selectedTask.taskNo }}</span>
        </div>
        <div>
          AGV：<span class="font-medium">{{ selectedTask.agvId }}</span>
        </div>
        <div>
          吨桶：<span class="font-medium">{{ selectedTask.tonBucketId }}</span>
        </div>
        <div>
          状态：<Tag :color="getTaskStatusColor(selectedTask.taskStatus)" class="ml-1">
            {{ getTaskStatusText(selectedTask.taskStatus) }}
          </Tag>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 未执行（待下发/已下发）：白色背景 */
:deep(.task-row-pending) {
  background-color: #ffffff;
}

/* 执行中：黄色背景 */
:deep(.task-row-running) {
  background-color: #fde047;
}

/* 已完成：绿色背景 */
:deep(.task-row-completed) {
  background-color: #bbf7d0;
}
</style>
