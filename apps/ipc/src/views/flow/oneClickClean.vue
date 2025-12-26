<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button, Card, Form, FormItem, Input, Select } from 'ant-design-vue';

import { workstationListAcquisition } from '#/api';
import ScanTheCode from '#/util/component/scanTheCode.vue';

// region 查询数据
// 查询参数
const queryParams = ref({
  // 工作中心编号
  workstationCode: '',
  // 模式选择( 1手动  2自动)
  modelType: '1',
  // 产品编号
  productCode: '',
  // 工单号
  worksheetCode: '',
  // 工单派发状态
  sendState: '',
});

// endregion

// region 工作中心查询
const listOfProductionLines = ref<any>([]);

/**
 * 查询工作站列表
 * 功能：获取工作站列表并格式化为选择器选项
 * 步骤：
 * 1. 调用工作站列表接口获取原始数据
 * 2. 清空现有工作站列表
 * 3. 遍历接口返回数据，格式化为选择器需要的{value, label}格式
 * 4. 将格式化后的数据存入响应式列表
 */
function queryListOfProductionLines() {
  workstationListAcquisition().then((data) => {
    listOfProductionLines.value = []; // 清空当前列表
    data.forEach((item: any) => {
      // 构造选择器选项对象
      listOfProductionLines.value.push({
        value: item.workstationCode, // 选项值使用工作站编码
        label: `${item.workstationName}__${item.workstationCode}`, // 显示名称拼接名称和编码
      });
    });
  });
}
const filterOption = (input: string, option: any) => {
  return `${option.value}&&${option.label}`
    .toLowerCase()
    .includes(input.toLowerCase());
};

// endregion

onMounted(() => {
  queryListOfProductionLines();
});
</script>

<template>
  <Page>
    <Card class="mb-4">
      <Form :model="queryParams">
        <!--工作中心 -->
        <FormItem :label="$t('workOrderEntry.workCenter')" class="!mb-4 w-full">
          <Select
            v-model:value="queryParams.workstationCode"
            :options="listOfProductionLines"
            :filter-option="filterOption"
            show-search
          />
          <ScanTheCode
            @scan-the-code="
              (val) => {
                queryParams.workstationCode = val;
                gridApi.reload();
              }
            "
          />
        </FormItem>
        <!--工单编号 -->
        <FormItem :label="$t('workOrderEntry.workOrderNumber')">
          <Input v-model:value="queryParams.worksheetCode" />
        </FormItem>
        <!--产品编号 -->
        <FormItem :label="$t('workOrderEntry.productCode')">
          <Input v-model:value="queryParams.productCode" />
        </FormItem>
        <FormItem>
          <Button type="primary" @click="gridApi.reload()" class="mr-4">
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
  </Page>
</template>

<style scoped></style>
