<script setup lang="ts">
/**
 * 液位触发组件
 * @description
 * 用于液位触发作业演示，展示工单基本信息（Descriptions），
 * 并通过 Canvas 绘制桶模型实时展示当前液位，配合右侧表单完成液位警戒值修改
 * （纯前端演示，无接口调用）。
 * 页面从上到下布局：
 * 1. 基本信息显示（工单号、产品编号、产品名称、配方编号、配方名称）
 * 2. 下方左右两栏：左侧 Canvas 桶模型（表示液位多少），右侧表单（当前液位、设备编号、液位警戒当前值、液位警戒设定值、确认修改按钮）
 * 3. 当当前液位超出警戒值时，桶模型以红色警示显示（液体变红、警戒线变红并显示超出警示）
 * @since 2026-08-19 10:00:00
 */
import { nextTick, onMounted, reactive, ref, watch } from 'vue';

import {
  Button,
  Col,
  Descriptions,
  DescriptionsItem,
  Form,
  FormItem,
  Input,
  message,
  Row,
} from 'ant-design-vue';

defineOptions({ name: 'LiquidLevelTrigger' });

/**
 * 定义组件的 props，用于接收父组件传递的数据
 */
const props = defineProps({
  // 工步id，用于标识具体的工步，默认为 0
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID，用于标识具体的工序，默认为 0
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号，用于标识具体的工单，默认为空字符串
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号，用于标识具体的设备，默认为空字符串
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心，用于标识具体的工作中心，默认为空字符串
  workstationCode: {
    type: String,
    default: '',
  },
  // 产品编号，用于标识当前生产的产品，默认为空字符串
  productCode: {
    type: String,
    default: '',
  },
  // 产品名称，用于显示当前生产的产品名称，默认为空字符串
  productName: {
    type: String,
    default: '',
  },
});

// region 基本信息

/**
 * 基本信息演示数据
 * 功能：存储工单的基本信息（配方编号、配方名称为演示数据）
 * 字段说明：
 * - worksheetCode 工单号（取自 props）
 * - productCode   产品编号（取自 props）
 * - productName   产品名称（取自 props）
 * - formulaNo     配方编号
 * - formulaName   配方名称
 */
const basicInfo = reactive({
  worksheetCode: props.worksheetCode || 'WO-20260819-001',
  productCode: props.productCode || 'P-001',
  productName: props.productName || '示例产品',
  formulaNo: 'FORMULA-001',
  formulaName: '标准基础配方',
});

// endregion

// region 液位表单与桶模型

/**
 * 液位满量程（升），用于计算液位百分比
 */
const MAX_LEVEL = 1000;

/**
 * 液位表单数据
 * 功能：存储右侧表单的输入数据
 * 字段说明：
 * - currentLevel 当前液位
 * - equipCode    设备编号
 * - warnCurrent  液位警戒当前值
 * - warnTarget   液位警戒设定值
 */
const formData = reactive({
  currentLevel: 650,
  equipCode: props.equipCode || 'EQ-001',
  warnCurrent: 800,
  warnTarget: 850,
});

/**
 * Canvas 元素引用
 */
const canvasRef = ref<HTMLCanvasElement | null>(null);

/**
 * 绘制桶模型
 * 功能：在 Canvas 上绘制桶体与液位，液位高度随当前液位数值变化，
 * 同时绘制液位警戒线，当当前液位超出警戒值时以红色警示显示
 *
 * 流程：
 * 1. 获取 Canvas 上下文并清空画布
 * 2. 绘制桶体外框（超出警戒时边框变红）
 * 3. 根据当前液位计算液位高度，填充渐变色液体（超出警戒时为红色渐变）
 * 4. 绘制液位警戒线并标注警戒值
 * 5. 绘制液位虚线并标注当前液位百分比
 * 6. 超出警戒值时在桶体中央显示警示文字
 */
function drawTank() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  // 清空画布
  ctx.clearRect(0, 0, w, h);

  // 桶体区域（四周留白）
  const pad = 24;
  const tankX = pad;
  const tankW = w - pad * 2;
  const tankTop = 36;
  const tankH = h - tankTop - 30;

  // 液位比例（限制在 0~1 之间）
  const level = Number(formData.currentLevel) || 0;
  const ratio = Math.min(Math.max(level / MAX_LEVEL, 0), 1);
  const liquidH = tankH * ratio;

  // 警戒值比例与是否超出警戒
  const warnLevel = Number(formData.warnCurrent) || 0;
  const warnRatio = Math.min(Math.max(warnLevel / MAX_LEVEL, 0), 1);
  const isOverWarn = warnLevel > 0 && level > warnLevel;

  // 绘制桶体外框（超出警戒时边框变红）
  ctx.strokeStyle = isOverWarn ? '#ef4444' : '#94a3b8';
  ctx.lineWidth = 3;
  ctx.strokeRect(tankX, tankTop, tankW, tankH);

  // 绘制液体（超出警戒时使用红色渐变，否则使用蓝色渐变）
  if (liquidH > 0) {
    const gradient = ctx.createLinearGradient(
      tankX,
      tankTop + tankH - liquidH,
      tankX,
      tankTop + tankH,
    );
    if (isOverWarn) {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
      gradient.addColorStop(1, 'rgba(248, 113, 113, 0.55)');
    } else {
      gradient.addColorStop(0, 'rgba(37, 99, 235, 0.85)');
      gradient.addColorStop(1, 'rgba(96, 165, 250, 0.55)');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(tankX, tankTop + tankH - liquidH, tankW, liquidH);
  }

  // 绘制液位警戒线（黄色正常，红色超警）
  const warnY = tankTop + tankH - tankH * warnRatio;
  if (warnLevel > 0) {
    ctx.strokeStyle = isOverWarn ? '#dc2626' : '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(tankX, warnY);
    ctx.lineTo(tankX + tankW, warnY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 标注警戒值
    ctx.fillStyle = isOverWarn ? '#dc2626' : '#f59e0b';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`警戒 ${warnLevel}L`, tankX + 4, warnY - 6);
  }

  // 绘制液位虚线（超出警戒时变红）
  if (liquidH > 0) {
    ctx.strokeStyle = isOverWarn ? '#dc2626' : '#2563eb';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(tankX, tankTop + tankH - liquidH);
    ctx.lineTo(tankX + tankW, tankTop + tankH - liquidH);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 标注液位百分比
  ctx.fillStyle = isOverWarn ? '#dc2626' : '#1e293b';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(
    `${Math.round(ratio * 100)}%`,
    w / 2,
    liquidH > 20 ? tankTop + tankH - liquidH - 10 : tankTop + tankH + 20,
  );

  // 超出警戒警示（桶体中央红色提示）
  if (isOverWarn) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.fillRect(tankX, tankTop, tankW, tankH);
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('超出警戒值!', w / 2, tankTop + tankH / 2);
  }

  // 顶部标注满量程
  ctx.font = '12px Arial';
  ctx.fillStyle = '#64748b';
  ctx.fillText(`满量程 ${MAX_LEVEL}L`, w / 2, tankTop - 8);
}

/**
 * 确认修改液位警戒值
 * 功能：将液位警戒设定值复制到液位警戒当前值（纯演示，无接口调用）
 *
 * 流程：
 * 1. 校验液位警戒设定值是否填写
 * 2. 将设定值赋值给当前值
 * 3. 提示修改成功
 */
function confirmModify() {
  if (!formData.warnTarget && formData.warnTarget !== 0) {
    message.warning('请输入液位警戒设定值');
    return;
  }
  formData.warnCurrent = formData.warnTarget;
  message.success('液位警戒值修改成功');
}

// 监听当前液位与警戒值变化，实时重绘桶模型
watch(
  () => [formData.currentLevel, formData.warnCurrent],
  () => {
    drawTank();
  },
);

// 组件挂载后绘制初始桶模型
onMounted(() => {
  nextTick(() => {
    drawTank();
  });
});

// endregion
</script>

<template>
  <div>
    <!-- 基本信息显示 -->
    <Descriptions
      title="基本信息"
      bordered
      :column="3"
      size="small"
      class="base-info"
    >
      <DescriptionsItem label="工单号">
        {{ basicInfo.worksheetCode }}
      </DescriptionsItem>
      <DescriptionsItem label="产品编号">
        {{ basicInfo.productCode }}
      </DescriptionsItem>
      <DescriptionsItem label="产品名称">
        {{ basicInfo.productName }}
      </DescriptionsItem>
      <DescriptionsItem label="配方编号">
        {{ basicInfo.formulaNo }}
      </DescriptionsItem>
      <DescriptionsItem label="配方名称">
        {{ basicInfo.formulaName }}
      </DescriptionsItem>
    </Descriptions>

    <!-- 下方左右两栏：Canvas 桶模型 + 液位表单 -->
    <div class="level-layout">
      <!-- 左侧：Canvas 桶模型 -->
      <div class="canvas-panel">
        <canvas
          ref="canvasRef"
          :width="240"
          :height="380"
          class="tank-canvas"
        ></canvas>
      </div>
      <!-- 右侧：液位表单 -->
      <div class="form-panel">
        <div class="form-title">液位设置</div>
        <Form layout="vertical" :model="formData">
          <Row :gutter="12">
            <Col :span="12">
              <FormItem label="当前液位">
                <Input
                  v-model:value="formData.currentLevel"
                  type="number"
                  placeholder="请输入当前液位"
                />
              </FormItem>
            </Col>
            <Col :span="12">
              <FormItem label="设备编号">
                <Input v-model:value="formData.equipCode" placeholder="请输入设备编号" />
              </FormItem>
            </Col>
          </Row>
          <Row :gutter="12">
            <Col :span="12">
              <FormItem label="液位警戒当前值">
                <Input
                  v-model:value="formData.warnCurrent"
                  type="number"
                  disabled
                />
              </FormItem>
            </Col>
            <Col :span="12">
              <FormItem label="液位警戒设定值">
                <Input
                  v-model:value="formData.warnTarget"
                  type="number"
                  placeholder="请输入设定值"
                />
              </FormItem>
            </Col>
          </Row>
          <Button type="primary" block @click="confirmModify">
            确认修改
          </Button>
        </Form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 基本信息区域底部留白 */
.base-info {
  margin-bottom: 16px;
}

/* 下方左右两栏布局 */
.level-layout {
  display: flex;
  gap: 16px;
  width: 100%;
}

/* 左侧 Canvas 桶模型容器 */
.canvas-panel {
  flex: 0 0 260px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f8fafc;
}

/* 桶模型画布 */
.tank-canvas {
  display: block;
}

/* 右侧表单容器：自适应宽度 */
.form-panel {
  flex: 1;
  min-width: 0;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #ffffff;
}

/* 表单标题 */
.form-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
}
</style>
