<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Card, Form, FormItem, Select } from 'ant-design-vue';

// region 工作站查询信息
// 产线列表
const listOfProductionLines = ref([
  {
    label: 'XXX产线',
    value: '1',
  },
]);

// 工艺列表
const listOfProcesses = ref([
  {
    label: '分切',
    value: '1',
  },
]);

// 查询条件
const queryParams = ref({
  productionLineId: '',
  processId: '',
});

// endregion
</script>

<template>
  <Page>
    <Card>
      <Form layout="lnline" :model="queryParams">
        <FormItem
          :label="$t('productionOperation.productionOrderNumber')"
          class="m-0 border-l-4 border-sky-500 pl-4"
        >
          <Select
            :model:value="queryParams.productionLineId"
            :options="listOfProductionLines"
            class="mr-4 !w-64"
          />
          <Select
            :model:value="queryParams.processId"
            :options="listOfProcesses"
            class="!w-64"
          />
        </FormItem>
      </Form>
    </Card>
  </Page>
</template>

<style scoped></style>
