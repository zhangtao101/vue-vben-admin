<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  RangePicker,
} from 'ant-design-vue';

import { $t } from '#/locales';
import BatchReport from '#/util/component/vitrifiedBrickFactory/batchReport.vue';

// region 查询数据
// 查询参数
const queryParams = ref({
  // 查询时间
  searchTime: [] as any,
  // 产品编码
  productCode: '',
  // 产品批号
  lineName: '',
  // 工单号
  worksheetCode: '',
});

const activeKey = ref<string>('1');

const batchReportRef = ref<any>();
const detailedListRef = ref<any>();

function queryData() {
  switch (activeKey.value) {
    case '1': {
      batchReportRef.value.reload();
      break;
    }
    case '2': {
      detailedListRef.value.reload();
      break;
    }
  }
}
// endregion

// region 初始化

onMounted(() => {});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 时间范围 -->
        <FormItem
          :label="$t('productionDaily.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.searchTime" />
        </FormItem>

        <!-- 产品编号 -->
        <FormItem
          :label="$t('productionDaily.productCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productCode" />
        </FormItem>

        <!-- 产品名称 -->
        <FormItem
          :label="$t('productionDaily.productLotNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.lineName" />
        </FormItem>

        <!-- 工单号 -->
        <FormItem
          :label="$t('productionDaily.worksheetCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.worksheetCode" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="queryData"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 表格主体 -->
    <Card>
      <!--      <Tabs v-model:active-key="activeKey" type="card">
        <TabPane key="1" tab="批报">
          <BatchReport ref="detailedListRef" :query-params="queryParams" />
        </TabPane>
        <TabPane key="2" tab="明细表">
          <DetailedList ref="detailedList" :query-params="queryParams" />
        </TabPane>
      </Tabs>-->
      <BatchReport ref="batchReportRef" :query-params="queryParams" />
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
