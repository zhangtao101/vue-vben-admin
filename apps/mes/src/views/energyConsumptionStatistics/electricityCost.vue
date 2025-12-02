<!--
  电费统计分析页面
  功能：用于分析和显示电力费用相关数据，包括分时段电价统计和费用分析
  特性：
  - 支持尖峰平谷四时段电费分析
  - 提供电费占比饼图和费用趋势柱状图
  - 包含分时电价信息展示和用电成本优化建议
  - 集成新手引导功能，帮助用户了解页面功能
  - 支持图表和表格两种数据展示方式
-->
<script lang="ts" setup>
import type { TourProps } from 'ant-design-vue';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Chart } from '@antv/g2';
import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  Form,
  FormItem,
  RadioGroup,
  RangePicker,
  Row,
  Segmented,
  Statistic,
  Tag,
  Tour,
} from 'ant-design-vue';

import BasicTblae from '#/util/component/basicTblae.vue';

// region 查询数据模块
/**
 * 查询参数配置
 * 用于存储和传递查询条件到后端API
 */
const queryParams = ref({
  // 查询时间范围 - 用户选择的时间段
  searchTime: [] as any,
  // 时间粒度 - 支持小时、日、月、年四种维度
  timeGranularity: 'DAY',
});

/**
 * 时间粒度选项列表
 * 提供不同时间维度的数据聚合选项
 */
const timeGranularityList = ref([
  {
    label: $t('energyConsumption.energyConsumptionStatistics.hourS'), // 小时粒度
    value: 'HOUR',
  },
  {
    label: $t('energyConsumption.energyConsumptionStatistics.day'), // 日粒度
    value: 'DAY',
  },
  {
    label: $t('energyConsumption.energyConsumptionStatistics.month'), // 月粒度
    value: 'MONTH',
  },
  {
    label: $t('energyConsumption.energyConsumptionStatistics.year'), // 年粒度
    value: 'YEAR',
  },
]);

/**
 * 分时电价信息配置
 * 存储不同时段的电价标准，用于成本分析和费用计算
 * 电价从高到低：尖时段 > 峰时段 > 平时段 > 谷时段
 */
const electricityRateInformation = ref<any>({
  // 总电费/平均电价
  totalElectricityCharge: {
    electrovalence: 1.2, // 平均电价：1.2元/kWh
  },
  // 尖时段电费（通常是用电高峰时段，电价最高）
  peakPeriod: {
    electrovalence: 2, // 尖时段电价：2.0元/kWh
  },
  // 峰时段电费（高峰时段，电价较高）
  peakHour: {
    electrovalence: 1, // 峰时段电价：1.0元/kWh
  },
  // 平时段电费（正常时段，标准电价）
  normalPeriodCharge: {
    electrovalence: 1, // 平时段电价：1.0元/kWh
  },
  // 谷时段电费（低谷时段，电价最低，鼓励用电）
  valleyInterval: {
    electrovalence: 0.5, // 谷时段电价：0.5元/kWh
  },
});

/**
 * 获取电费类型的中文描述
 * @param {string} key - 电费类型的键名
 * @returns {string} 对应的中文描述文本
 *
 * 支持的电费类型：
 * - normalPeriodCharge: 平时段电费
 * - peakHour: 峰时段电费
 * - peakPeriod: 尖时段电费
 * - totalElectricityCharge: 总电费/平均电费
 * - valleyInterval: 谷时段电费
 */
function getADescriptionOfTheTariffInChinese(key: any): string {
  switch (key) {
    case 'normalPeriodCharge': {
      // 平时段电费 - 正常工作时间的电费
      return $t(
        'energyConsumption.energyConsumptionStatistics.normalPeriodCharge',
      );
    }
    case 'peakHour': {
      // 峰时段电费 - 高峰时段的电费
      return $t(
        'energyConsumption.energyConsumptionStatistics.electricityBillDuringPeakHours',
      );
    }
    case 'peakPeriod': {
      // 尖时段电费 - 用电最高峰时段的电费
      return $t('energyConsumption.energyConsumptionStatistics.peakCharge');
    }
    case 'totalElectricityCharge': {
      // 总电费 - 所有时段电费的总和
      return $t(
        'energyConsumption.energyConsumptionStatistics.totalElectricityCharge',
      );
    }
    case 'valleyInterval': {
      // 谷时段电费 - 低谷时段的电费
      return $t('energyConsumption.energyConsumptionStatistics.valleyCharge');
    }
    default: {
      // 未定义的类型 - 兜底处理
      return $t('energyConsumption.energyConsumptionStatistics.undefinedType');
    }
  }
}

/**
 * 获取电价标签的中文描述
 * @param {string} key - 电价类型的键名
 * @returns {string} 对应的中文描述文本
 *
 * 用于在Tag标签中显示电价类型：
 * - totalElectricityCharge: 平均电价
 * - 其他: 电价（通用标签）
 */
function obtainTheChineseDescriptionOfTheElectricityPrice(key: any): string {
  switch (key) {
    case 'totalElectricityCharge': {
      // 平均电价 - 总电费除以总用电量
      return $t(
        'energyConsumption.energyConsumptionStatistics.averageElectricityPrice',
      );
    }
    default: {
      // 电价 - 通用电价标签
      return $t(
        'energyConsumption.energyConsumptionStatistics.electricityPrice',
      );
    }
  }
}
// endregion

// region 显示类型模块
/**
 * 数据展示方式选项
 * 支持图表和表格两种数据展示模式
 */
const showType = ref([
  // 图表展示模式 - 使用G2图表进行可视化分析
  {
    label: $t('energyConsumption.energyConsumptionStatistics.chart'),
    value: 'chart',
  },
  // 表格展示模式 - 使用VXE表格进行详细数据展示
  {
    label: $t('energyConsumption.energyConsumptionStatistics.table'),
    value: 'table',
  },
]);

/**
 * 当前选中的显示类型
 * 默认显示图表模式，用户可通过单选按钮切换
 */
const selectShowType = ref('chart');

// endregion

// region 图表模块

// region 电费分析子模块
/**
 * 电费分析图表实例
 * 使用AntV G2创建的环形饼图，展示各时段电费占比
 */
let electricityRateAnalysisChart: any;

/**
 * 电费分析图表数据
 * 存储各时段电费的占比信息
 * 注意：当前为模拟数据，实际使用时需要替换为真实的业务数据
 */
const electricityRateAnalysisChartData = ref<any>([
  { item: '尖电费', count: 40, percent: 0.4 }, // 尖时段电费占40%
  { item: '峰电费', count: 21, percent: 0.21 }, // 峰时段电费占21%
  { item: '平电费', count: 17, percent: 0.17 }, // 平时段电费占17%
  { item: '谷电费', count: 13, percent: 0.13 }, // 谷时段电费占13%
]);

/**
 * 创建电费占比分析环形饼图
 * 展示尖峰平谷各时段电费在总电费中的占比分布
 *
 * 图表特性：
 * - 环形饼图设计，中心显示标题
 * - 外环展示各时段占比百分比
 * - 底部图例说明各时段类型
 * - 鼠标悬停显示详细占比信息
 * - 颜色从红到绿表示电价从高到低
 */
function createAnAnalyticalEnergyShareChart() {
  if (electricityRateAnalysisChart) {
    // 图表已存在，更新数据
    electricityRateAnalysisChart.data(electricityRateAnalysisChartData.value);
  } else {
    // 首次创建图表
    electricityRateAnalysisChart = new Chart({
      container: 'electricityRateAnalysis',
    });

    electricityRateAnalysisChart.options({
      type: 'view', // 视图容器类型
      autoFit: true, // 自适应容器大小
      height: 400, // 图表高度
      // 环形坐标系配置
      coordinate: { type: 'theta', outerRadius: 0.8, innerRadius: 0.5 },
      children: [
        {
          type: 'interval', // 区间图类型（饼图基础）
          data: electricityRateAnalysisChartData.value,
          encode: {
            y: 'percent', // Y轴映射到百分比
            color: 'item', // 颜色映射到时段类型
          },
          transform: [{ type: 'stackY' }], // Y轴堆叠变换
          scale: {
            color: {
              type: 'ordinal', // 离散颜色映射
              // 颜色从高到低：红->橙->黄->绿
              range: ['#df273e', '#ff8447', '#f3d025', '#6ec71f'],
            },
          },
          legend: {
            color: {
              position: 'bottom', // 图例位置
              layout: { justifyContent: 'center' }, // 图例居中对齐
            },
          },
          labels: [
            {
              position: 'outside', // 标签位置：外部
              text: (data: any) => `${data.percent * 100}%`, // 显示百分比
            },
          ],
          tooltip: {
            items: [
              (data: any) => ({
                name: data.item, // 显示时段名称
                value: `${data.percent * 100}%`, // 显示占比百分比
              }),
            ],
          },
        },
        {
          type: 'text', // 中心文本
          style: {
            text: '各时段占比', // 中心标题
            x: '50%', // 水平居中
            y: '50%', // 垂直居中
            fontSize: 34, // 字体大小
            fill: '#8c8c8c', // 灰色文字
            textAlign: 'center', // 文字对齐
          },
        },
      ],
    });
  }

  // 渲染图表到页面
  electricityRateAnalysisChart.render();
}

// endregion

// region 电费用量子模块
/**
 * 电费用量图表实例
 * 使用AntV G2创建的堆叠柱状图，展示各时段电费用量的时间变化趋势
 */
let electricityUsageChart: any;

/**
 * 电费用量图表数据
 * 存储不同日期下各时段的电费用量数据
 * 数据结构：时间序列 + 四个时段（谷平峰尖）的堆叠数据
 * 注意：当前为模拟数据，实际使用时需要替换为真实的业务数据
 */
const electricityConsumptionChartData = ref<any>([
  // 12-01日数据
  {
    time: '12-01',
    value: 100,
    type: '谷电费', // 最低电价时段
  },
  {
    time: '12-01',
    value: 120,
    type: '平电费', // 标准电价时段
  },
  {
    time: '12-01',
    value: 110,
    type: '峰电费', // 高峰电价时段
  },
  {
    time: '12-01',
    value: 130,
    type: '尖电费', // 最高电价时段
  },
  // 12-02日数据（示例：各时段费用略有增长）
  {
    time: '12-02',
    value: 105,
    type: '谷电费',
  },
  {
    time: '12-02',
    value: 125,
    type: '平电费',
  },
  {
    time: '12-02',
    value: 115,
    type: '峰电费',
  },
  {
    time: '12-02',
    value: 135,
    type: '尖电费',
  },
  // 12-03日数据（继续增长趋势）
  {
    time: '12-03',
    value: 110,
    type: '谷电费',
  },
  {
    time: '12-03',
    value: 130,
    type: '平电费',
  },
  {
    time: '12-03',
    value: 120,
    type: '峰电费',
  },
  {
    time: '12-03',
    value: 140,
    type: '尖电费',
  },
  // 12-04日数据（进一步增长）
  {
    time: '12-04',
    value: 115,
    type: '谷电费',
  },
  {
    time: '12-04',
    value: 135,
    type: '平电费',
  },
  {
    time: '12-04',
    value: 125,
    type: '峰电费',
  },
  {
    time: '12-04',
    value: 145,
    type: '尖电费',
  },
  // 12-05日数据（最高值）
  {
    time: '12-05',
    value: 120,
    type: '谷电费',
  },
  {
    time: '12-05',
    value: 140,
    type: '平电费',
  },
  {
    time: '12-05',
    value: 130,
    type: '峰电费',
  },
  {
    time: '12-05',
    value: 150,
    type: '尖电费',
  },
]);

/**
 * 创建电费用量堆叠柱状图
 * 展示各时段电费用量随时间的变化趋势，通过堆叠方式显示总电费构成
 *
 * 图表特性：
 * - 堆叠柱状图设计，每个时间点的总高度表示总电费
 * - 颜色从绿到红表示电价从低到高
 * - X轴显示时间序列，Y轴显示电费金额
 * - 支持悬停提示显示具体时段费用
 * - X轴标签90度旋转，避免重叠
 */
function createAChartOfElectricityUsage() {
  if (electricityUsageChart) {
    // 图表已存在，更新数据
    electricityUsageChart.data(electricityConsumptionChartData.value);
  } else {
    // 首次创建图表
    electricityUsageChart = new Chart({ container: 'electricityConsumption' });
  }

  electricityUsageChart.options({
    type: 'interval', // 区间图类型（柱状图）
    autoFit: true, // 自适应容器大小
    height: 440, // 图表高度
    data: electricityConsumptionChartData.value,
    encode: {
      x: 'time', // X轴映射到时间
      y: 'value', // Y轴映射到电费值
      color: 'type', // 颜色映射到时段类型
    },
    // 数据变换：堆叠Y轴并按Y值排序X轴
    transform: [{ type: 'stackY' }, { type: 'sortX', by: 'y', reverse: true }],
    scale: {
      color: {
        type: 'ordinal', // 离散颜色映射
        // 颜色从低到高：绿->黄->橙->红
        range: ['#6ec71f', '#f3d025', '#ff8447', '#df273e'],
      },
    },
    axis: {
      x: {
        labelSpacing: 4, // X轴标签间距
        labelTransform: 'rotate(90)', // X轴标签90度旋转
        title: '时间', // X轴标题
      },
      y: {
        labelFormatter: '~s', // Y轴数值格式化（千分位）
        title: '电费(元)', // Y轴标题
      },
    },
    tooltip: {
      items: [
        (data: any) => ({
          name: data.type, // 显示时段类型
          value: `${data.value}元`, // 显示电费金额
        }),
      ],
    },
  });

  // 渲染图表到页面
  electricityUsageChart.render();
}

// endregion

// endregion

// region 表格模块
/**
 * 表格列配置项
 * 定义电费数据表格的显示列信息
 */
const columns: any = [
  { title: '序号', type: 'seq', width: 50 }, // 自动生成序号列
  { field: 'worksheetCode1', title: '字段A', minWidth: 200 }, // 示例字段A
  { field: 'worksheetCode2', title: '字段B', minWidth: 200 }, // 示例字段B
  { field: 'worksheetCode3', title: '字段C', minWidth: 200 }, // 示例字段C
  { field: 'worksheetCode4', title: '字段D', minWidth: 200 }, // 示例字段D
  { field: 'worksheetCode5', title: '字段E', minWidth: 200 }, // 示例字段E
  { field: 'worksheetCode6', title: '字段F', minWidth: 200 }, // 示例字段F
  { field: 'worksheetCode7', title: '字段G', minWidth: 200 }, // 示例字段G
];

/**
 * 表格数据查询函数
 * @param {object} params - 查询参数
 * @param {number} params.page - 当前页码
 * @param {number} params.pageSize - 每页数据条数
 * @returns {Promise} 返回包含分页数据的Promise对象
 *
 * 注意：当前为模拟数据，实际使用时需要替换为真实的API调用
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    // 模拟后端API响应数据
    resolve({
      total: page * pageSize, // 模拟总数据量
      items: [], // 模拟数据列表（当前为空）
    });
  });
}

// endregion

// region 新手引导模块
/**
 * 页面元素引用对象
 * 用于定位新手引导的锚点元素
 */
const ref1 = ref(); // 查询条件区域引用
const ref2 = ref(); // 基本信息区域引用
const ref3 = ref(); // 显示切换区域引用
const ref4 = ref(); // 数据展示区域引用

/**
 * 新手引导控制状态
 */
const open = ref(true); // 是否显示引导
const current = ref(0); // 当前引导步骤（从0开始）

/**
 * 新手引导步骤配置
 * 定义引导的每个步骤和对应的目标元素
 */
const steps: TourProps['steps'] = [
  {
    title: '查询',
    description: '在这个地方选择相应的查询条件进行查询.',
    target: () => ref1.value && ref1.value.$el, // 目标：查询条件表单
  },
  {
    title: '基本信息显示',
    description: '在这个地方会显示查询到的用电信息总览.',
    target: () => ref2.value && ref2.value.$el, // 目标：电费信息统计卡片
  },
  {
    title: '显示切换',
    description: '在这里切换展示数据的形式.',
    target: () => ref3.value && ref3.value.$el, // 目标：图表/表格切换按钮
  },
  {
    title: '数据展示',
    description: '在这里展示详细的数据, 以图表或者表格的形式.',
    target: () => ref4.value && ref4.value.$el, // 目标：数据展示区域
  },
];

/**
 * 关闭新手引导功能
 * 将引导状态保存到本地存储，下次访问时不再显示
 *
 * 逻辑说明：
 * 1. 立即关闭当前引导显示
 * 2. 如果是最后一步，将完成状态保存到localStorage
 * 3. 支持多个页面的引导状态统一管理
 */
function closeGuide() {
  // 立即关闭引导显示
  open.value = false;

  // 只有在完成所有步骤后才标记为已看过
  if (current.value === steps!.length - 1) {
    // 从localStorage读取现有的引导状态
    const guide_str = localStorage.getItem('guide');
    let guide: any;

    if (guide_str) {
      // 解析现有引导数据
      guide = JSON.parse(guide_str);
      // 标记本页面引导已完成
      guide.electricityCost = true;
    } else {
      // 创建新的引导状态对象
      guide = {
        electricityCost: true,
      };
    }

    // 保存更新后的引导状态
    localStorage.setItem('guide', JSON.stringify(guide));
  }
}

// endregion

// region 生命周期初始化
/**
 * 组件挂载后的初始化操作
 * 在组件DOM渲染完成后执行页面初始化逻辑
 */
onMounted(() => {
  // 检查用户是否已经看过新手引导
  const guide_str = localStorage.getItem('guide');
  if (guide_str) {
    const guide = JSON.parse(guide_str);
    // 如果本页面引导已完成，则不显示引导
    if (guide.electricityCost) {
      open.value = false;
    }
  }

  // 初始化页面图表
  // 注意：实际项目中应该先查询数据再渲染图表
  createAnAnalyticalEnergyShareChart(); // 初始化电费占比环形图
  createAChartOfElectricityUsage(); // 初始化电费用量堆叠图
});
</script>

<template>
  <Page>
    <!-- region 查询条件区域 -->
    <!-- 电费统计分析查询条件卡片 -->
    <Card
      :title="
        $t('energyConsumption.energyConsumptionStatistics.wattHourCharge')
      "
      class="mb-4"
    >
      <Form :model="queryParams" layout="inline" ref="ref1">
        <!-- 时间粒度选择器 -->
        <FormItem
          :label="
            $t('energyConsumption.energyConsumptionStatistics.timeGranularity')
          "
          style="margin-bottom: 1em"
        >
          <Segmented
            v-model:value="queryParams.timeGranularity"
            :options="timeGranularityList"
          />
        </FormItem>
        <!-- 时间范围选择器 -->
        <FormItem
          :label="$t('energyConsumption.energyConsumptionStatistics.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.searchTime" />
        </FormItem>

        <!-- 查询按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 电费信息统计区域 -->
    <Card>
      <!-- region 分时电价基本信息展示 -->
      <Flex class="mb-4" ref="ref2">
        <!-- 动态渲染各时段电价信息卡片 -->
        <div
          class="flex-1 border-2 p-4"
          v-for="(item, key) in electricityRateInformation"
          :key="key"
        >
          <!-- 时段标题和电价标签 -->
          <Row>
            <Col span="24" offset="1">
              <span class="text-lg font-semibold">
                <!-- 显示时段中文名称 -->
                {{ getADescriptionOfTheTariffInChinese(key) }}
              </span>

              <!-- 电价标签，显示当前时段的电价标准 -->
              <Tag
                :borded="false"
                color="processing"
                class="ml-8 align-text-bottom"
              >
                {{ obtainTheChineseDescriptionOfTheElectricityPrice(key) }}:
                {{ item.electrovalence }}元/kWh
              </Tag>
            </Col>
          </Row>
          <!-- 时段统计信息 -->
          <Row class="mt-4">
            <Col :span="8" :offset="2" class="text-center">
              <!-- 电费金额统计 -->
              <Statistic
                :title="
                  $t(
                    'energyConsumption.energyConsumptionStatistics.electricCharge',
                  )
                "
                :value="item.electrovalence"
              />
            </Col>
            <Col :span="8" :offset="2" class="text-center">
              <!-- 用电量统计 -->
              <Statistic
                :title="
                  $t(
                    'energyConsumption.energyConsumptionStatistics.electricityConsumptionAndUnit',
                  )
                "
                :value="item.electrovalence"
              />
            </Col>
          </Row>
        </div>
      </Flex>
      <!-- endregion -->

      <!-- region 数据展示类型选择 -->
      <RadioGroup
        ref="ref3"
        v-model:value="selectShowType"
        option-type="button"
        :options="showType"
      />
      <!-- endregion -->

      <!-- region 图表展示区域 -->
      <Row
        ref="ref4"
        :gutter="10"
        class="mt-4"
        v-show="selectShowType === 'chart'"
      >
        <!-- 电费占比分析图表 - 左侧占40%宽度 -->
        <Col :span="10">
          <Card
            :title="
              $t(
                'energyConsumption.energyConsumptionStatistics.electricityRateAnalysis',
              )
            "
          >
            <!-- 用电优化建议提示 -->
            <Alert
              message="提示：避峰用谷，合理调配可以降低总用电费用。"
              type="warning"
              show-icon
            />
            <!-- 环形饼图容器 -->
            <div id="electricityRateAnalysis"></div>
          </Card>
        </Col>

        <!-- 电费用量趋势图表 - 右侧占60%宽度 -->
        <Col :span="14">
          <Card
            :title="
              $t(
                'energyConsumption.energyConsumptionStatistics.electricityConsumption',
              )
            "
          >
            <!-- 堆叠柱状图容器 -->
            <div id="electricityConsumption"></div>
          </Card>
        </Col>
      </Row>
      <!-- endregion -->

      <!-- region 表格展示区域 -->
      <!-- 仅在选择表格显示模式时显示 -->
      <BasicTblae
        :columns="columns"
        :query-data="queryData"
        v-if="selectShowType === 'table'"
      />
      <!-- endregion -->
    </Card>
    <!-- endregion -->

    <!-- region 新手引导组件 -->
    <!-- 引导用户了解页面各功能区域的使用方法 -->
    <Tour
      v-model:current="current"
      :steps="steps"
      :open="open"
      @close="closeGuide()"
    />
  </Page>
</template>

<style scoped></style>
