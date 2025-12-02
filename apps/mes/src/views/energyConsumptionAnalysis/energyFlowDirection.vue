<script lang="ts" setup>
/**
 * 能源流向分析页面
 * 功能：展示电能和水资源的流向分析，使用桑基图可视化能源流动路径
 *
 * 主要功能模块：
 * 1. 时间范围查询
 * 2. 能源类型切换（电能/水）
 * 3. 桑基图可视化展示
 * 4. 数据加载状态管理
 */

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Chart } from '@antv/g2';
import {
  Button,
  Card,
  Form,
  FormItem,
  RadioButton,
  RadioGroup,
  RangePicker,
  Spin,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { getEnergyFlowDL, getEnergyFlowWL } from '#/api';

// region 桑基图相关功能

/**
 * G2图表实例
 */
let chart: any;

/**
 * 初始化或更新桑基图
 * 使用G2的sankey图表类型展示能源流向数据
 *
 * @param chartData 桑基图数据，包含流向连接信息
 */
function initChart(chartData: any) {
  if (chart) {
    // 更新现有图表
    chart.clear();
    chart.sankey().data({
      type: 'inline',
      value: {
        links: chartData,
      },
    });
    chart.render();
  } else {
    // 创建新图表
    chart = new Chart({
      container: 'chart',
      autoFit: true,
      height: 500,
    });

    // 配置桑基图
    chart
      .sankey()
      .data({
        type: 'inline',
        value: {
          links: chartData,
        },
      })
      .layout({
        nodeAlign: 'center', // 节点对齐方式
        nodePadding: 0.03, // 节点间距
      })
      .style('labelSpacing', 3) // 标签间距
      .style('labelFontWeight', 'bold') // 标签字体粗细
      .style('nodeStrokeWidth', 1.2) // 节点边框宽度
      .style('linkFillOpacity', 0.4); // 连接线透明度

    chart.render();
  }
}

// endregion

// region 数据查询相关功能

/**
 * 查询参数
 */
const queryParams = ref({
  searchTime: [] as any, // 查询时间范围
});

/**
 * 资源类型
 * 1-电能，2-水
 */
const resourceType = ref(1);

/**
 * 图表显示状态
 * 用于控制加载动画
 */
const show = ref(false);
/**
 * 查询能源流向数据
 * 根据资源类型调用不同的接口，并更新桑基图显示
 */
function queryData() {
  const params: any = { ...queryParams.value };

  // 处理时间参数格式化
  if (params.searchTime && params.searchTime.length === 2) {
    // 根据资源类型选择不同的时间格式
    // 电能：按天，水：按月
    params.startTime = params.searchTime[0].format(
      resourceType.value === 1 ? 'YYYY-MM-DD' : 'YYYY-MM',
    );
    params.endTime = params.searchTime[1].format(
      resourceType.value === 1 ? 'YYYY-MM-DD' : 'YYYY-MM',
    );
    // 移除原始时间范围参数
    params.searchTime = undefined;
  }

  // 根据资源类型选择对应的接口
  const ob =
    resourceType.value === 1
      ? getEnergyFlowDL(params) // 电能流向
      : getEnergyFlowWL(params); // 水流向

  // 显示加载状态
  show.value = false;

  ob.then((data) => {
    show.value = true;
    // 过滤掉数值为0的数据项，只显示有流向的数据
    const arr = data.filter((item: any) => item.value > 0);
    initChart(arr);
  });
}

// endregion

/**
 * 页面挂载时初始化
 * 设置默认查询时间范围并加载数据
 */
onMounted(() => {
  // 设置默认查询时间范围：上个月至今
  const now = dayjs();
  queryParams.value.searchTime = [now.subtract(1, 'month'), now];

  // 自动查询默认数据
  queryData();
});
</script>

<template>
  <Page>
    <!-- region 查询条件区域 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 时间范围 -->
        <FormItem
          :label="$t('useEnergyThroughoutTheEntireSection.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker
            v-model:value="queryParams.searchTime"
            :picker="resourceType === 1 ? 'date' : 'month'"
          />
        </FormItem>

        <!-- 查询按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="queryData()"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 图表展示区域 -->
    <Card>
      <!-- 能源类型切换按钮组 -->
      <RadioGroup
        v-model:value="resourceType"
        button-style="solid"
        @change="queryData()"
      >
        <RadioButton :value="1">电能流向分析</RadioButton>
        <RadioButton :value="2">水流向分析</RadioButton>
      </RadioGroup>

      <!-- 图表容器，带加载状态 -->
      <Spin size="large" :spinning="!show">
        <div id="chart"></div>
      </Spin>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
