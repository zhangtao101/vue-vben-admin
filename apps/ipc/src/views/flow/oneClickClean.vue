<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Col,
  Form,
  FormItem,
  message,
  Row,
  Select,
  Spin,
  Statistic,
} from 'ant-design-vue';

import {
  oneClickCleaning,
  queryTheWorkCenter,
  workstationListAcquisition,
} from '#/api';

// region 查询数据
// 查询参数
const queryParams = ref({
  // 工作中心编号
  stationCode: '',
});
// 设备列表
const deviceList = ref<any[]>([]);
// 状态数
const statusSum = ref({
  count: 0,
  numberOfCompletions: 0,
  cleaning: 0,
  abnormal: 0,
});
let searchTimeoutId: any;
/**
 * 查询设备信息
 */
function queryData() {
  queryTheWorkCenter(queryParams.value).then((result) => {
    deviceList.value = result;
    totalCalculation();
    clearTimeout(searchTimeoutId);
    searchTimeoutId = setTimeout(() => queryData(), 1000 * 60);
  });
}

/**
 * 计算总数
 */
function totalCalculation() {
  statusSum.value = {
    count: deviceList.value.length,
    numberOfCompletions: 0,
    cleaning: 0,
    abnormal: 0,
  };

  for (const item of deviceList.value) {
    switch (item.cleanlinessFlag) {
      case 1: {
        statusSum.value.cleaning += 1;
        break;
      }
      case 2: {
        statusSum.value.cleaning += 1;
        break;
      }
      case 3: {
        statusSum.value.numberOfCompletions += 1;
        break;
      }
      case 4: {
        statusSum.value.abnormal += 1;
        break;
      }
    }
  }
}

/**
 * 获取卡片头部样式
 * @param item
 */
function getHeaderStyle(item: any) {
  switch (item.cleanlinessFlag) {
    case 1: {
      return {
        background: '#00bcff',
      };
    }
    case 2: {
      return {
        background: '#00bcff',
      };
    }
    case 3: {
      return {
        background: '#00ff2b',
      };
    }
    case 4: {
      return {
        color: 'white',
        background: '#ec4141',
      };
    }
    default: {
      return {};
    }
  }
}

/**
 * 开始清洗
 */
function startCleaning() {
  oneClickCleaning(queryParams.value).then(() => {
    message.success($t('workOrderEntry.startWashing'));
    queryData();
  });
}

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
      <Form
        :model="queryParams"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 24 }"
      >
        <!--工作中心 -->
        <FormItem :label="$t('workOrderEntry.workCenter')" class="!mb-4 w-full">
          <Select
            v-model:value="queryParams.stationCode"
            :options="listOfProductionLines"
            :filter-option="filterOption"
            show-search
            @change="queryData"
          />
        </FormItem>
        <FormItem :wrapper-col="{ offset: 4, span: 24 }">
          <Button
            type="primary"
            @click="startCleaning"
            class="w-full"
            :disabled="!queryParams.stationCode"
          >
            {{ $t('workOrderEntry.startWashing') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <Card class="mb-4">
      <Row :gutter="24">
        <Col :span="6">
          <Statistic
            :title="$t('workOrderEntry.total')"
            :value="statusSum.count"
          />
        </Col>
        <Col :span="6">
          <Statistic
            :title="$t('workOrderEntry.complete')"
            :value="statusSum.numberOfCompletions"
          />
        </Col>
        <Col :span="6">
          <Statistic
            :title="$t('workOrderEntry.cleaning')"
            :value="statusSum.cleaning"
          />
        </Col>
        <Col :span="6">
          <Statistic
            :title="$t('workOrderEntry.error')"
            :value="statusSum.abnormal"
          />
        </Col>
      </Row>
    </Card>
    <Card
      v-for="item of deviceList"
      v-memo="item.cleanlinessFlag"
      :key="item.equipCode"
      :title="item.equipCode"
      class="m-2 inline-block w-48"
      :head-style="getHeaderStyle(item)"
    >
      {{ item.cleanlinessFlagName }}
      <Spin v-if="[1, 2].includes(item.cleanlinessFlag)" />
      <Icon
        icon="mdi:check-underline"
        class="inline-block align-middle text-xl text-[#00ff2b]"
        v-if="item.cleanlinessFlag === 3"
      />
      <Icon
        icon="mdi:error-outline"
        class="inline-block align-middle text-xl text-red-500"
        v-if="item.cleanlinessFlag === 4"
      />
    </Card>
  </Page>
</template>

<style scoped></style>
