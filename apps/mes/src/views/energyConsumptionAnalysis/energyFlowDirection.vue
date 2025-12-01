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
  Form,
  FormItem,
  RadioButton,
  RadioGroup,
  RangePicker,
  Spin,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { getEnergyFlowDL, getEnergyFlowWL } from '#/api';

// region 图表初始化

let chart: any;

function initChart(chartData: any) {
  if (chart) {
    chart.clear();
    chart.sankey().data({
      type: 'inline',
      value: {
        links: chartData,
      },
    });
    chart.render();
  } else {
    chart = new Chart({
      container: 'chart',
      autoFit: true,
      height: 500,
    });

    chart
      .sankey()
      .data({
        type: 'inline',
        value: {
          links: chartData,
        },
      })
      .layout({
        nodeAlign: 'center',
        nodePadding: 0.03,
      })
      .style('labelSpacing', 3)
      .style('labelFontWeight', 'bold')
      .style('nodeStrokeWidth', 1.2)
      .style('linkFillOpacity', 0.4);

    chart.render();
  }
}

// endregion

// region 查询数据

// 查询参数
const queryParams = ref({
  searchTime: [] as any, // 查询时间范围
});
// 资源类型
const resourceType = ref(1);
const show = ref(false);
/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 * { page, pageSize }: any
 */
function queryData() {
  const params: any = { ...queryParams.value };
  if (params.searchTime && params.searchTime.length === 2) {
    // 格式化时间范围
    params.startTime = params.searchTime[0].format(
      resourceType.value === 1 ? 'YYYY-MM-DD' : 'YYYY-MM',
    );
    params.endTime = params.searchTime[1].format(
      resourceType.value === 1 ? 'YYYY-MM-DD' : 'YYYY-MM',
    );
    params.searchTime = undefined;
  }
  const ob =
    resourceType.value === 1
      ? getEnergyFlowDL({
          ...params, // 展开 queryParams.value 对象，包含所有查询参数。
        })
      : getEnergyFlowWL({
          ...params, // 展开 queryParams.value 对象，包含所有查询参数。
        });

  show.value = false;
  ob.then((data) => {
    show.value = true;
    const arr = data.filter((item: any) => item.value > 0);
    initChart(arr);
  });
}

// endregion

onMounted(() => {
  // 获取当前时间
  const now = dayjs();
  queryParams.value.searchTime = [now.subtract(1, 'month'), now];
  queryData();
});
</script>

<template>
  <Page>
    <!-- region 搜索 -->
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

    <Card>
      <RadioGroup
        v-model:value="resourceType"
        button-style="solid"
        @change="queryData()"
      >
        <RadioButton :value="1">电能流向分析</RadioButton>
        <RadioButton :value="2">水流向分析</RadioButton>
      </RadioGroup>
      <Spin size="large" :spinning="!show">
        <div id="chart"></div>
      </Spin>
    </Card>
  </Page>
</template>

<style scoped></style>
