<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

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
} from 'ant-design-vue';

// region 图表初始化

const initChart = () => {
  const chart = new Chart({
    container: 'chart',
    autoFit: true,
    height: 500,
  });

  chart
    .sankey()
    .data({
      type: 'inline',
      value: {
        links: [
          {
            source: 'A',
            target: 'B',
            value: 1000,
          },
          {
            source: 'A',
            target: 'C',
            value: 1000,
          },
          {
            source: 'B',
            target: 'D',
            value: 1000,
          },
          {
            source: 'C',
            target: 'D',
            value: 1000,
          },
        ],
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

  setTimeout(() => {
    chart.clear();
    chart.sankey().data({
      type: 'inline',
      value: {
        links: [
          {
            source: 'A',
            target: 'B',
            value: 500,
          },
          {
            source: 'A',
            target: 'C',
            value: 600,
          },
          {
            source: 'B',
            target: 'D',
            value: 500,
          },
          {
            source: 'C',
            target: 'D',
            value: 500,
          },
        ],
      },
    });
    chart.render();
  }, 1000 * 5);
};

// endregion

// region 查询数据

// 查询参数
const queryParams = ref({
  searchTime: [] as any, // 查询时间范围
  processCode: '', // 工序编号
  workstationCode: '', // 工作站编号
  workstationName: '', // 工作站名称
  worksheetCode: '', // 工单号
  productCode: '', // 产品料号
  productName: '', // 产品名称
});
// 资源类型
const resourceType = ref(1);

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 * { page, pageSize }: any
 */
function queryData(): Promise<any> {
  return new Promise((resolve) => {
    const params: any = { ...queryParams.value };
    if (params.searchTime && params.searchTime.length === 2) {
      // 格式化时间范围
      params.startTime = params.searchTime[0].format('YYYY-MM-DD');
      params.endTime = params.searchTime[1].format('YYYY-MM-DD');
      params.searchTime = undefined;
    }
    // 返回模拟数据
    resolve({
      total: 0,
      items: [],
    });
    /* queryProductionDaily({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ total, list }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total,
          items: list,
        });
      })
      .catch((error) => {
        reject(error);
      });*/
  });
}

// endregion

onMounted(() => {
  initChart();
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
          <RangePicker v-model:value="queryParams.searchTime" />
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
      <RadioGroup v-model:value="resourceType" button-style="solid">
        <RadioButton :value="1">电能流向分析</RadioButton>
        <RadioButton :value="2">水流向分析</RadioButton>
      </RadioGroup>
      <div id="chart"></div>
    </Card>
  </Page>
</template>

<style scoped></style>
