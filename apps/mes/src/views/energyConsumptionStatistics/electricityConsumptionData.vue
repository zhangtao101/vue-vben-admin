<!--
  用电量数据统计分析页面
  功能：用于分析和显示电力消耗相关数据，包括用电量、有功电量、无功电量等
  支持多时间粒度（小时、日、月、年）的数据查询和可视化展示
  提供图表和表格两种数据展示方式，支持电表设备选择
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
  getDayYBList,
  getHourYBList,
  getMonthYBList,
  getYearYBList,
} from '#/api';
import BasicTblae from '#/util/component/basicTblae.vue';

// region 图表模块
/**
 * 用电量趋势图表对象
 * 使用AntV G2图表库创建的多指标线图
 */
let lineChart: any;

/**
 * 初始化或更新用电量趋势图表
 * @param {Array} chartData - 图表数据数组，包含时间、数值和类型信息
 *
 * 支持三种电量指标的多线展示：
 * - 用电量：总用电量统计
 * - 有功电量：有效功消耗电量
 * - 无功电量：无功功率消耗电量
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
      inset: 20, // 图表内边距
      data: chartData, // 绑定图表数据
      encode: {
        x: 'time', // X轴映射到时间字段
        y: 'value', // Y轴映射到电量数值
        color: 'type', // 颜色映射到电量类型
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
              text: 'value', // 显示数值
              style: { dx: -10, dy: -12 }, // 标签偏移位置
            },
          ],
          encode: { shape: 'smooth' }, // 平滑曲线样式
        },
        {
          type: 'point', // 数据点
          style: { fill: 'white' }, // 白色填充
          tooltip: false, // 禁用数据点tooltip
        },
      ],
      axis: {
        y: {
          title: '电量（kWh）', // Y轴标题
          grid: null, // 隐藏网格线
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
 * 从后端获取电量数据，转换为图表所需格式并渲染
 *
 * 数据转换逻辑：
 * 1. 将原始数据转换为多系列图表数据
 * 2. 分别处理用电量、有功电量、无功电量三个指标
 * 3. 按时间顺序展示三种电量的变化趋势
 */
function queryChartData() {
  getRequest().then(({ list }: any) => {
    const chartData: any = [];
    // 将原始数据转换为图表所需的多系列格式
    list.forEach((item: any) => {
      chartData.push(
        {
          time: item.time,
          value: item.value,
          type: '用电量', // 总用电量数据系列
        },
        {
          time: item.time,
          value: item.activePower,
          type: '有功电量', // 有功电量数据系列
        },
        {
          time: item.time,
          value: item.reactivePower,
          type: '无功电量', // 无功电量数据系列
        },
      );
    });
    // 使用转换后的数据初始化图表
    chartInit(chartData);
  });
}
// endregion

// region 表格模块
/**
 * 表格列配置项
 * 定义用电量数据表格的显示列信息
 */
const columns: any = [
  { title: '序号', type: 'seq', width: 50 }, // 自动生成序号列
  {
    field: 'equipmentCode',
    title: '仪表编号', // 电表设备唯一标识
    minWidth: 150,
  },
  {
    field: 'equipmentName',
    title: '仪表名称', // 电表设备名称
    minWidth: 150,
  },
  {
    field: 'value',
    title: '用电量（kWh）', // 总用电量数值
    minWidth: 150,
  },
  {
    field: 'activePower',
    title: '有功电量（kWh）', // 有效功消耗电量
    minWidth: 150,
  },
  {
    field: 'reactivePower',
    title: '无功电量（kWh）', // 无功功率消耗电量
    minWidth: 150,
  },
  {
    field: 'powerFactor',
    title: '实际功率因数', // 电能质量指标
    minWidth: 150,
  },
  {
    field: 'time',
    title: '日期', // 数据记录时间
    minWidth: 150,
  },
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
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    // 调用统一的请求函数获取分页数据
    getRequest({ page, pageSize }).then(({ list, total }: any) => {
      resolve({
        total, // 总数据条数
        items: list, // 当前页数据列表
      });
    });
  });
}

// endregion

// region API请求模块
/**
 * 查询参数配置
 * 包含时间类型、设备代码等查询条件
 */
const queryParams = ref<any>({
  timeType: 1, // 默认时间粒度：1-小时，2-日，3-月，4-年
  equipmentCode: '', // 默认设备代码（初始化后会被填充）
});

/**
 * 时间类型与日期选择器类型映射
 * 用于动态配置RangePicker组件的选择器类型
 */
const timeTypeList = ref<any>({
  2: 'date', // 日粒度使用日期选择器
  3: 'month', // 月粒度使用月份选择器
  4: 'year', // 年粒度使用年份选择器
});

/**
 * 时间格式化映射表
 * 根据不同的时间粒度定义对应的时间格式
 */
const timeFormatList = ref<any>({
  1: 'YYYY-MM-DD HH', // 小时粒度格式：年-月-日 时
  2: 'YYYY-MM-DD', // 日粒度格式：年-月-日
  3: 'YYYY-MM', // 月粒度格式：年-月
  4: 'YYYY', // 年粒度格式：年
});

/**
 * 统一的API请求函数
 * 根据时间类型动态选择对应的API接口
 * @param {object} pageMessage - 分页参数（可选）
 * @returns {Promise} 返回对应API的Promise对象
 *
 * 功能特点：
 * 1. 支持分页和非分页两种请求模式
 * 2. 自动处理时间范围参数的格式化
 * 3. 根据时间类型动态调用不同的API接口
 * 4. 统一处理请求参数的转换和传递
 */
function getRequest(pageMessage?: any) {
  // 复制基础查询参数
  const params = {
    ...queryParams.value,
  };

  // 处理分页参数
  if (pageMessage) {
    const { page, pageSize } = pageMessage;
    params.pageSize = pageSize; // 设置每页条数
    params.pageNum = page; // 设置当前页码
  }

  // 处理时间范围参数
  if (params.searchTime && params.searchTime.length > 0) {
    // 根据时间粒度格式化开始时间
    params.startTime = params.searchTime[0].format(
      timeFormatList.value[params.timeType],
    );
    // 根据时间粒度格式化结束时间
    params.endTime = params.searchTime[1].format(
      timeFormatList.value[params.timeType],
    );
    // 删除原始时间范围参数，避免API调用错误
    delete params.searchTime;
  }

  // 根据时间类型选择对应的API接口
  let ob: any;
  switch (queryParams.value.timeType) {
    case 1: {
      // 小时粒度数据
      ob = getHourYBList(params);
      break;
    }
    case 2: {
      // 日粒度数据
      ob = getDayYBList(params);
      break;
    }
    case 3: {
      // 月粒度数据
      ob = getMonthYBList(params);
      break;
    }
    case 4: {
      // 年粒度数据
      ob = getYearYBList(params);
      break;
    }
  }

  return ob;
}

// endregion

// region 电表设备查询模块
/**
 * 下拉选择器过滤函数
 * 支持按设备名称和设备编号进行模糊搜索
 * @param {string} input - 用户输入的搜索关键词
 * @param {object} option - 选项对象
 * @returns {boolean} 是否匹配搜索条件
 */
const filterOption = (input: string, option: any) => {
  // 同时搜索设备编号和设备名称
  return `${option.value}&&${option.label}`
    .toLowerCase()
    .includes(input.toLowerCase());
};

/**
 * 电表设备选项列表
 * 存储从后端获取的电表设备信息，用于下拉选择器
 */
const equipmentOptions = ref<any>([]);

/**
 * 查询电表设备数据
 * 从后端获取所有电表设备信息，并初始化默认选择和数据展示
 *
 * 执行流程：
 * 1. 调用gaugeDropDownBox API获取电表列表（equipType: 1 表示电表）
 * 2. 将返回数据转换为下拉选择器所需格式
 * 3. 自动选择第一个设备作为默认选项
 * 4. 触发图表数据查询
 * 5. 延迟刷新表格数据，确保数据加载完成
 */
function queryMeterData() {
  gaugeDropDownBox({
    equipType: 1, // 设备类型：1-电表，2-水表，3-气表
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

    // 如果存在电表设备，自动选择第一个并加载数据
    if (equipmentOptions.value && equipmentOptions.value.length > 0) {
      queryParams.value.equipmentCode = equipmentOptions.value[0].value;
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
  // 查询电表设备数据并初始化页面
  queryMeterData();
});
</script>

<template>
  <Page>
    <!-- region 查询条件区域 -->
    <!-- 用电量数据查询条件卡片 -->
    <Card class="mb-4 mt-4">
      <Form :model="queryParams" layout="inline">
        <!-- 电表设备选择器 -->
        <FormItem
          :label="
            $t('energyConsumption.energyConsumptionAnalysis.deviceNumber')
          "
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.equipmentCode"
            :options="equipmentOptions"
            show-search
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
            <!-- 小时粒度 -->
            <RadioButton :value="1">
              {{ $t('electricityConsumptionData.hourS') }}
            </RadioButton>
            <!-- 日粒度 -->
            <RadioButton :value="2">
              {{ $t('electricityConsumptionData.day') }}
            </RadioButton>
            <!-- 月粒度 -->
            <RadioButton :value="3">
              {{ $t('electricityConsumptionData.month') }}
            </RadioButton>
            <!-- 年粒度 -->
            <RadioButton :value="4">
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
            :picker="timeTypeList[queryParams.timeType]"
            :show-time="queryParams.timeType === 1 ? { format: 'HH' } : false"
            :format="queryParams.timeType === 1 ? 'YYYY-MM-DD HH' : ''"
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
          <!-- 用电量趋势图表容器 -->
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
