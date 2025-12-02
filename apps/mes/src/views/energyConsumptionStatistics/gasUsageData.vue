<!--
  用气量数据统计分析页面
  功能：用于分析和显示天然气等气体能源的消耗数据
  特性：
  - 支持月度和年度两种时间维度的数据分析
  - 提供多设备用气量对比图表
  - 支持气表设备选择和时间范围查询
  - 集成图表和表格两种数据展示方式
  - 自动加载设备列表并选择默认设备
-->
<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Chart } from '@antv/g2';
import {
  Button,
  Card,
  Col,
  Form,
  FormItem,
  RadioButton,
  RadioGroup,
  RangePicker,
  Row,
  Select,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  gaugeDropDownBox,
  getMonthGasUseDataList,
  getYearGasUseDataList,
} from '#/api';
import BasicTblae from '#/util/component/basicTblae.vue';

// region 查询数据模块
/**
 * 查询参数配置
 * 包含时间类型和设备代码等查询条件
 */
const queryParams = ref<any>({
  timeType: 1, // 默认时间类型：1-月度，2-年度
});
// endregion

// region 图表模块
/**
 * 用气量趋势图表对象
 * 使用AntV G2创建的多设备用气量对比线图
 */
let lineChart: any;

/**
 * 初始化或更新用气量趋势图表
 * @param {Array} chartData - 图表数据数组，包含时间、用气量和设备名称
 *
 * 图表特性：
 * - 支持多设备用气量对比展示
 * - 每条线代表一个设备的用气量趋势
 * - Y轴从0开始，显示用气量数值
 * - 数据点采用白色填充，不显示tooltip避免干扰
 */
function chartInit(chartData: any) {
  if (lineChart) {
    // 图表已存在，更新数据
    lineChart.options({
      data: chartData,
    });
  } else {
    // 首次创建图表
    lineChart = new Chart({ container: 'lineChart' });
    lineChart.options({
      type: 'view', // 图表类型为视图容器
      autoFit: true, // 自动适应容器大小
      data: chartData, // 绑定图表数据
      encode: {
        x: 'time', // X轴映射到时间字段
        y: 'gasUse', // Y轴映射到用气量数值
        color: 'meterName', // 颜色映射到设备名称
      },
      scale: {
        x: { range: [0, 1] }, // X轴范围设置
        y: { domainMin: 0, nice: true }, // Y轴从0开始，优化刻度
      },
      children: [
        {
          type: 'line', // 折线图类型
          labels: [
            {
              // 数据标签配置
              text: 'gasUse', // 显示用气量数值
              style: { dx: -10, dy: -12 }, // 标签偏移位置
            },
          ],
        },
        {
          type: 'point', // 数据点
          style: { fill: 'white' }, // 白色填充
          tooltip: false, // 禁用数据点tooltip，避免与线段tooltip冲突
        },
      ],
      axis: {
        y: {
          title: '用气量', // Y轴标题
          grid: null, // 隐藏网格线，突出数据趋势
          labelFormatter: (d: any) => `${d}`, // Y轴标签格式化
        },
      },
    });
  }

  // 渲染图表到页面
  lineChart.render();
}

/**
 * 查询并处理图表数据
 * 根据时间类型选择对应的API接口，获取用气量数据并渲染图表
 *
 * 处理流程：
 * 1. 复制基础查询参数
 * 2. 处理时间范围参数格式化
 * 3. 根据时间类型选择API接口
 * 4. 获取数据后初始化图表
 */
function queryChartData() {
  // 复制查询参数，避免直接修改原始对象
  const params: any = {
    ...queryParams.value,
  };

  // 处理时间范围参数格式化
  if (queryParams.value.searchTime) {
    // 根据时间类型选择对应的时间格式
    // 月度数据使用 YYYY-MM 格式（如：2024-01）
    // 年度数据使用 YYYY 格式（如：2024）
    params.startTime = queryParams.value.searchTime[0].format(
      params.timeType === 1 ? 'YYYY-MM' : 'YYYY',
    );
    params.endTime = queryParams.value.searchTime[1].format(
      params.timeType === 1 ? 'YYYY-MM' : 'YYYY',
    );
    // 删除原始时间范围参数，避免API调用错误
    delete params.searchTime;
  }

  // 根据时间类型选择对应的API接口
  let ob: any;
  switch (params.timeType) {
    case 1: {
      // 月度用气量数据
      ob = getMonthGasUseDataList(params);
      break;
    }
    case 2: {
      // 年度用气量数据
      ob = getYearGasUseDataList(params);
      break;
    }
  }

  // 获取数据并渲染图表
  ob.then(({ list }: any) => {
    chartInit(list);
  });
}
// endregion

// region 表格模块
/**
 * 表格列配置项
 * 定义用气量数据表格的显示列信息
 */
const columns: any = [
  { title: '序号', type: 'seq', width: 50 }, // 自动生成序号列
  { field: 'meterCode', title: '设备编号', minWidth: 150 }, // 气表设备唯一标识
  { field: 'meterName', title: '设备名称', minWidth: 150 }, // 气表设备名称
  { field: 'gasUse', title: '用气量', minWidth: 150 }, // 气体消耗量
  { field: 'time', title: '日期', minWidth: 150 }, // 数据记录时间
];

/**
 * 表格API对象
 * 用于控制表格的重载、刷新等操作
 */
let gridApi: any;

/**
 * 表格数据查询函数
 * @param {object} params - 查询参数
 * @param {number} params.page - 当前页码
 * @param {number} params.pageSize - 每页数据条数
 * @returns {Promise} 返回包含分页数据的Promise对象
 *
 * 该函数与图表数据查询共享相同的API接口，确保数据一致性
 * 支持分页查询和时间范围筛选
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    // 构建查询参数，包含分页信息
    const params: any = {
      ...queryParams.value, // 继承基础查询参数
      pageSize, // 每页数据条数
      pageNum: page, // 当前页码
    };

    // 处理时间范围参数格式化（与图表查询保持一致）
    if (queryParams.value.searchTime) {
      // 根据时间类型选择对应的时间格式
      params.startTime = queryParams.value.searchTime[0].format(
        params.timeType === 1 ? 'YYYY-MM' : 'YYYY',
      );
      params.endTime = queryParams.value.searchTime[1].format(
        params.timeType === 1 ? 'YYYY-MM' : 'YYYY',
      );
      // 删除原始时间范围参数
      delete params.searchTime;
    }

    // 根据时间类型选择对应的API接口
    let ob: any;
    switch (params.timeType) {
      case 1: {
        // 月度用气量数据
        ob = getMonthGasUseDataList(params);
        break;
      }
      case 2: {
        // 年度用气量数据
        ob = getYearGasUseDataList(params);
        break;
      }
    }

    // 获取分页数据并返回
    ob.then(({ list, total }: any) => {
      resolve({
        total, // 总数据条数
        items: list, // 当前页数据列表
      });
    });
  });
}

// endregion

// region 气表设备查询模块
/**
 * 下拉选择器过滤函数
 * 支持按设备名称和设备编号进行模糊搜索
 * @param {string} input - 用户输入的搜索关键词
 * @param {object} option - 选项对象
 * @returns {boolean} 是否匹配搜索条件
 */
const filterOption = (input: string, option: any) => {
  // 同时搜索设备编号和设备名称，提高搜索效率
  return `${option.value}&&${option.label}`
    .toLowerCase()
    .includes(input.toLowerCase());
};

/**
 * 气表设备选项列表
 * 存储从后端获取的气表设备信息，用于下拉选择器
 */
const equipmentOptions = ref<any>([]);

/**
 * 查询气表设备数据
 * 从后端获取所有气表设备信息，并初始化默认选择和数据展示
 *
 * 执行流程：
 * 1. 调用gaugeDropDownBox API获取气表列表（equipType: 3 表示气表）
 * 2. 将返回数据转换为下拉选择器所需格式
 * 3. 自动选择第一个设备作为默认选项
 * 4. 触发图表数据查询
 * 5. 延迟刷新表格数据，确保数据加载完成
 */
function queryMeterData() {
  gaugeDropDownBox({
    equipType: 3, // 设备类型：2-水表，3-气表
    equipmentCode: '', // 空字符串表示查询所有设备
  }).then((res: any) => {
    // 清空现有选项列表
    equipmentOptions.value = [];

    // 转换数据格式为下拉选择器所需格式
    res.forEach((item: any) => {
      equipmentOptions.value.push({
        label: `${item.equipmentName}(${item.equipmentCode})`, // 显示名称：设备名称(设备编号)
        value: item.equipmentCode, // 值：设备编号
      });
    });

    // 如果存在气表设备，自动选择第一个并加载数据
    if (equipmentOptions.value && equipmentOptions.value.length > 0) {
      queryParams.value.meterCode = equipmentOptions.value[0].value;
      // 查询并渲染图表数据
      queryChartData();
      // 延迟刷新表格，确保图表数据加载完成后再刷新表格
      setTimeout(() => {
        gridApi.reload();
      }, 200);
    }
  });
}

// endregion

// region 生命周期初始化
/**
 * 组件挂载后的初始化操作
 * 在组件DOM渲染完成后执行页面初始化逻辑
 */
onMounted(() => {
  const now = dayjs();
  // 设置默认时间范围：最近6个月到当前时间
  queryParams.value.searchTime = [now.subtract(6, 'month'), now];
  // 查询图表数据（使用默认设备）
  queryChartData();
  // 查询气表设备数据并初始化设备选择
  queryMeterData();
});
</script>

<template>
  <Page>
    <!-- region 查询条件区域 -->
    <!-- 用气量数据查询条件卡片 -->
    <Card class="mb-4 mt-4">
      <Form :model="queryParams" layout="inline">
        <!-- 气表设备选择器 -->
        <FormItem
          :label="
            $t('energyConsumption.energyConsumptionAnalysis.deviceNumber')
          "
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.meterCode"
            :options="equipmentOptions"
            show-search
            allow-clear
            :filter-option="filterOption"
            class="!w-48"
          />
        </FormItem>

        <!-- 时间粒度选择器 -->
        <FormItem
          :label="$t('electricityConsumptionData.timeGranularity')"
          style="margin-bottom: 1em"
        >
          <RadioGroup v-model:value="queryParams.timeType" button-style="solid">
            <!-- 月度粒度 -->
            <RadioButton :value="1">
              {{ $t('electricityConsumptionData.month') }}
            </RadioButton>

            <!-- 年度粒度 -->
            <RadioButton :value="2">
              {{ $t('electricityConsumptionData.years') }}
            </RadioButton>
          </RadioGroup>
        </FormItem>

        <!-- 时间范围选择器 -->
        <FormItem
          :label="$t('useEnergyThroughoutTheEntireSection.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker
            v-model:value="queryParams.searchTime"
            :picker="queryParams.timeType === 1 ? 'month' : 'year'"
          />
        </FormItem>

        <!-- 查询按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="
              () => {
                queryChartData(); // 查询图表数据
                gridApi.reload(); // 刷新表格数据
              }
            "
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 主要内容展示区域 -->
    <Card class="mb-4 mt-4">
      <Row>
        <!-- 图表展示区域 - 左侧占50%宽度 -->
        <Col span="12" class="h-full">
          <!-- 用气量趋势图表容器 -->
          <div id="lineChart"></div>
        </Col>

        <!-- 表格展示区域 - 右侧占50%宽度 -->
        <Col span="12">
          <!-- region 数据表格 -->
          <BasicTblae
            :columns="columns"
            :query-data="queryData"
            @initialization-complete="(args) => (gridApi = args)"
          />
          <!-- endregion -->
        </Col>
      </Row>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
