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
  TabPane,
  Tabs,
} from 'ant-design-vue';

import { $t } from '#/locales';
import LossesInEachSection from '#/util/component/lossesInEachSection.vue';
import MonthlyDetailsOfPowderMaterials from '#/util/component/monthlyDetailsOfPowderMaterials.vue';
import SummaryTableOfSectionLosses from '#/util/component/summaryTableOfSectionLosses.vue';

// region 查询数据
// 查询参数
const queryParams = ref({
  // 查询时间
  searchTime: [] as any,
  // 工单号
  worksheetCode: '',
  // 产品编码
  productCode: '',
  // 产品名称
  materialName: '',
});

const activeKey = ref<string>('1');

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

        <!-- 工单号 -->
        <FormItem
          :label="$t('productionDaily.worksheetCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.worksheetCode" />
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
          :label="$t('productionDaily.productName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialName" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="() => {}"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 表格主体 -->
    <Card>
      <Tabs v-model:active-key="activeKey" type="card">
        <TabPane key="1" tab="各工段能耗">
          <LossesInEachSection :query-params="queryParams" />
        </TabPane>
        <TabPane key="2" tab="粉料分月明细">
          <MonthlyDetailsOfPowderMaterials :query-params="queryParams" />
        </TabPane>
        <TabPane key="3" tab="汇总">
          <SummaryTableOfSectionLosses :query-params="queryParams" />
        </TabPane>
      </Tabs>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
