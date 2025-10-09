<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  RadioGroup,
  Row,
} from 'ant-design-vue';

import { getWorkshopCalendars } from '#/api';

/**
 * 日历选项
 */
const options = ref<any>([
  {
    id: 1,
    label: 'test',
    value: 1,
    calendarName: '6666',
    organizationCode: '',
    organizationName: '',
    monday: 2,
    tuesday: 2,
    wednesday: 2,
    thursday: 2,
    friday: 1,
    saturday: 1,
    sunday: 1,
    cName: '',
    cTime: null,
    uName: '',
    uTime: null,
    startTime1: null,
    endTime1: null,
    startTime2: null,
    endTime2: null,
    startTime3: null,
    endTime3: null,
    startTime4: null,
    endTime4: null,
    startTime5: null,
    endTime5: null,
    startTime6: null,
    endTime6: null,
    dates: null,
  },
]);

/**
 * 选中的日历id
 */
const selectedValue = ref<any>('');

/**
 * 查询日历数据
 */
function queryData() {
  getWorkshopCalendars({
    pageNum: 1,
    pageSize: 99_999,
  }).then(({ list }) => {
    if (list && list.length > 0) {
      options.value = [];
      list.forEach((item: any) => {
        options.value.push({
          ...item,
          label: item.calendarName,
          value: item.id,
        });
      });
    }
  });
}

/**
 * 日历详情
 */
const details = ref<any>();
/**
 * 显示详情
 */
function change() {
  options.value.forEach((item: any) => {
    if (item.id === selectedValue.value) {
      details.value = {
        ...item,
      };
    }
  });
}

/**
 * 获取文本描述
 * @param code
 */
function getStatusText(code: number) {
  switch (code) {
    case 1: {
      return $t('hiddenDangerInspectionPlan.restDays');
    }
    case 2: {
      return $t('hiddenDangerInspectionPlan.workday');
    }
  }
}

// region 暴露方法

defineExpose({
  getValue: () => {
    return details.value;
  },
});

// endregion

onMounted(() => {
  queryData();
});
</script>

<template>
  <Row :gutter="10">
    <Col :span="12">
      <Card class="h-full overflow-auto">
        <RadioGroup
          v-model:value="selectedValue"
          :options="options"
          @change="change"
        />
      </Card>
    </Col>
    <Col :span="12">
      <Card class="h-full overflow-auto">
        <Descriptions bordered :column="1" v-if="details">
          <DescriptionsItem :label="$t('hiddenDangerInspectionPlan.monday')">
            {{ getStatusText(details.monday) }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('hiddenDangerInspectionPlan.tuesday')">
            {{ getStatusText(details.tuesday) }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('hiddenDangerInspectionPlan.wednesday')">
            {{ getStatusText(details.wednesday) }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('hiddenDangerInspectionPlan.thursday')">
            {{ getStatusText(details.thursday) }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('hiddenDangerInspectionPlan.friday')">
            {{ getStatusText(details.friday) }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('hiddenDangerInspectionPlan.saturday')">
            {{ getStatusText(details.saturday) }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('hiddenDangerInspectionPlan.sunday')">
            {{ getStatusText(details.sunday) }}
          </DescriptionsItem>
        </Descriptions>
      </Card>
    </Col>
  </Row>
</template>

<style scoped></style>
