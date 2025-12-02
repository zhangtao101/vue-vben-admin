<script lang="ts" setup>
/**
 * 力调电费分析页面
 * 功能：用于分析和显示电力调整费用和功率因数相关数据
 * 包括无功罚款统计、功率因数KPI展示以及图表和表格两种数据展示方式
 */

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

// endregion

// region 显示类型模块
/**
 * 数据展示方式选项
 * 支持图表和表格两种数据展示模式
 */
const showType = ref([
  // 图表展示模式 - 使用G2图表进行可视化
  {
    label: $t('energyConsumption.energyConsumptionStatistics.chart'),
    value: 'chart',
  },
  // 表格展示模式 - 使用VXE表格进行数据展示
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

// region 表格模块
/**
 * 表格列配置项
 * 定义表格显示的列信息和格式
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

// region 图表模块
/**
 * 功率因数图表对象
 * 使用AntV G2图表库创建的多指标趋势图表
 */
let powerFactorDiagram: any;

/**
 * 功率因数图表数据
 * 包含时间序列和多个指标数据的模拟数据集
 * 注意：当前为模拟数据，实际使用时需要替换为真实的业务数据
 */
const powerFactorDiagramData = ref([
  { time: '10:10', call: 4, waiting: 2, people: 2, mock: 3 },
  { time: '10:15', call: 2, waiting: 6, people: 3, mock: 4 },
  { time: '10:20', call: 13, waiting: 2, people: 5, mock: 1 },
  { time: '10:25', call: 9, waiting: 9, people: 1, mock: 2 },
  { time: '10:30', call: 5, waiting: 2, people: 3, mock: 5 },
  { time: '10:35', call: 8, waiting: 2, people: 1, mock: 3 },
  { time: '10:40', call: 13, waiting: 1, people: 2, mock: 2 },
]);

/**
 * 初始化功率因数图表
 * 创建包含多条折线的复合图表，展示功率因数、无功罚款等多个指标的趋势变化
 */
function powerFactorDiagramInit() {
  // 创建图表实例，绑定到DOM容器
  powerFactorDiagram = new Chart({ container: 'powerFactorDiagram' });

  // 配置图表选项和数据映射
  powerFactorDiagram.options({
    type: 'view', // 图表类型为视图容器
    autoFit: true, // 自动适应容器大小
    data: powerFactorDiagramData.value, // 绑定图表数据
    children: [
      // 第一条折线 - 模拟数据1
      {
        type: 'line',
        encode: {
          x: 'time', // X轴映射到时间字段
          y: 'mock', // Y轴映射到mock数值
          color: () => 'mock', // 颜色标识
          series: () => 'mock', // 系列标识
        },
        scale: { y: { nice: true } }, // Y轴优化刻度显示
        axis: { y: { title: null } }, // 隐藏Y轴标题
      },
      // 第二条折线 - 人员数据
      {
        type: 'line',
        encode: {
          x: 'time', // X轴映射到时间字段
          y: 'people', // Y轴映射到人员数值
          color: () => 'people', // 颜色标识
        },
        scale: { series: { independent: true } }, // 独立系列缩放
      },
      // 第三条折线 - 呼叫数据（右侧Y轴）
      {
        type: 'line',
        encode: {
          x: 'time', // X轴映射到时间字段
          y: 'call', // Y轴映射到呼叫数值
          color: () => 'call', // 颜色标识
          series: () => 'call', // 系列标识
        },
        scale: { y: { key: '2' } }, // 使用第二Y轴
        axis: { y: { position: 'right', grid: null, title: null } }, // 右侧Y轴配置
      },
    ],
  });

  // 渲染图表到页面
  powerFactorDiagram.render();
}
// endregion

// region 生命周期初始化
/**
 * 组件挂载后的初始化操作
 * 在组件DOM渲染完成后初始化图表组件
 */
onMounted(() => {
  // 初始化功率因数图表
  powerFactorDiagramInit();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 查询条件区域 -->
    <!-- 力调电费查询条件卡片 -->
    <Card
      :title="
        $t(
          'energyConsumption.energyConsumptionStatistics.powerRegulationCharge',
        )
      "
      class="mb-4"
    >
      <Form :model="queryParams" layout="inline">
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

    <!-- region 基本信息统计区域 -->
    <Card>
      <!-- region 电费相关统计信息 -->
      <Flex class="mb-4">
        <!--region 无功罚款统计卡片 -->
        <div class="flex-1 border-2 p-4">
          <Row>
            <Col span="24" offset="1" class="text-center">
              <span class="text-2xl text-lg font-semibold">
                {{
                  $t(
                    'energyConsumption.energyConsumptionStatistics.reactivePowerPenalty',
                  )
                }}
              </span>
            </Col>
          </Row>
          <Row class="mt-4" :gutter="24">
            <Col :span="8" class="text-center">
              <!-- 年累计无功罚款金额 -->
              <Statistic
                :title="
                  $t(
                    'energyConsumption.energyConsumptionStatistics.annualAccumulation',
                  )
                "
                :value="444"
              />
            </Col>
            <Col :span="8" class="text-center">
              <!-- 最高无功罚款金额 -->
              <Statistic
                :title="
                  $t(
                    'energyConsumption.energyConsumptionStatistics.maximumValue',
                  )
                "
                :value="111"
              />
            </Col>
            <Col :span="8" class="text-center">
              <!-- 月均无功罚款金额 -->
              <Statistic
                :title="
                  $t(
                    'energyConsumption.energyConsumptionStatistics.monthlyAverage',
                  )
                "
                :value="111"
              />
            </Col>
          </Row>
        </div>
        <!-- endregion -->
        <!--region 功率因数统计卡片 -->
        <div class="flex-1 border-2 p-4">
          <Row>
            <Col span="24" offset="1" class="text-center">
              <span class="text-2xl text-lg font-semibold">
                {{
                  $t(
                    'energyConsumption.energyConsumptionStatistics.powerFactor',
                  )
                }}
              </span>
            </Col>
          </Row>
          <Row class="mt-4" :gutter="24">
            <Col :span="8" class="text-center">
              <!-- 功率因数KPI值 -->
              <Statistic
                :title="
                  $t(
                    'energyConsumption.energyConsumptionStatistics.powerFactorKPI',
                  )
                "
                :value="444"
              />
            </Col>
            <Col :span="8" class="text-center">
              <!-- 功率因数最大值 -->
              <Statistic
                :title="
                  $t(
                    'energyConsumption.energyConsumptionStatistics.theMaximumValueTakesNoUnits',
                  )
                "
                :value="111"
              />
            </Col>
            <Col :span="8" class="text-center">
              <!-- 功率因数最小值 -->
              <Statistic
                :title="
                  $t(
                    'energyConsumption.energyConsumptionStatistics.minimumValueWithoutUnits',
                  )
                "
                :value="111"
              />
            </Col>
          </Row>
        </div>
        <!-- endregion -->
      </Flex>
      <!-- endregion -->
      <!-- region 数据展示类型选择区域 -->
      <Row>
        <Col span="12">
          <!-- 显示类型切换按钮组 -->
          <RadioGroup
            v-model:value="selectShowType"
            option-type="button"
            :options="showType"
          />
        </Col>
        <Col span="12">
          <!-- 提示信息 - 功率因数优化建议 -->
          <Alert
            message="提示：合理的无功补偿，提高功率因数，可以避免罚款，降低电能损耗，改善电能质量。"
            type="warning"
            show-icon
          />
        </Col>
      </Row>
      <!-- endregion -->

      <!-- region 图表展示区域 -->
      <Row :gutter="10" class="mt-4" v-show="selectShowType === 'chart'">
        <Col :span="24">
          <!-- 力调电费/功率因数趋势图表 -->
          <Card
            :title="
              $t(
                'energyConsumption.energyConsumptionStatistics.powerAdjustmentChargePowerFactor',
              )
            "
          >
            <!-- 图表容器 - G2图表将在此渲染 -->
            <div id="powerFactorDiagram"></div>
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
  </Page>
</template>

<style scoped></style>
