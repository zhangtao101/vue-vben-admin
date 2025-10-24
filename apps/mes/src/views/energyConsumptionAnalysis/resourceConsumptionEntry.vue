<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  DatePicker,
  Form,
  FormItem,
  InputNumber,
  message,
  Select,
} from 'ant-design-vue';

import { energyInsert, gaugeDropDownBox } from '#/api';

const formsRef = ref();
const formData = ref<any>({
  energyList: [{}],
});

/**
 * 新增一行
 */
function addLine() {
  formData.value.energyList.push({});
}

/**
 * 删除一行
 * @param index 下标
 */
function deleteLine(index: number) {
  formData.value.energyList.splice(index, 1);
}

/**
 * 提交
 */
function submit() {
  formsRef.value.validate().then(() => {
    const params = {
      ...formData.value,
    };
    params.energyList.forEach((energy: any) => {
      energy.time = energy.updateTime.format('YYYY-MM');
    });
    energyInsert(params.energyList).then(() => {
      message.success($t('common.successfulOperation'));
      formData.value.energyList = [{}];
    });
  });
}

/**
 * 仪表类型
 */
const meterTypeOptions = ref<any>([
  {
    label: '水表',
    value: 2,
  },
  {
    label: '气表',
    value: 3,
  },
]);
// 过滤
const filterOption = (input: string, option: any) => {
  return `${option.value}&&${option.label}`
    .toLowerCase()
    .includes(input.toLowerCase());
};

function queryMeterData(row: any) {
  return (_param: any) => {
    gaugeDropDownBox({
      equipType: row.meterType,
      equipmentCode: '',
    }).then((res: any) => {
      row.equipmentOptions = [];
      res.forEach((item: any) => {
        row.equipmentOptions.push({
          label: `${item.equipmentName}(${item.equipmentCode})`,
          value: item.equipmentCode,
        });
      });
    });
  };
}
</script>

<template>
  <Page>
    <Card>
      <Form
        ref="formsRef"
        :model="formData"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <template v-for="(item, index) in formData.energyList" :key="index">
          <FormItem
            :name="['energyList', index, 'meterType']"
            :rules="{
              required: true,
              message: '该项为必填字段',
              trigger: 'change',
            }"
            :label="$t('energyConsumptionAnalysis.meterType')"
            class="mb-2"
          >
            <Select
              v-model:value="item.meterType"
              :options="meterTypeOptions"
              @change="
                () => {
                  item.equipmentCode = '';
                  queryMeterData(item)('');
                }
              "
              class="w-full"
            />
          </FormItem>
          <FormItem
            :name="['energyList', index, 'equipmentCode']"
            :rules="{
              required: true,
              message: '该项为必填字段',
              trigger: 'change',
            }"
            :label="$t('energyConsumptionAnalysis.deviceNumber')"
            class="mb-2"
          >
            <Select
              v-model:value="item.equipmentCode"
              :options="item.equipmentOptions"
              show-search
              :disabled="!item.meterType"
              :filter-option="filterOption"
              class="w-full"
            />
          </FormItem>
          <FormItem
            :name="['energyList', index, 'updateTime']"
            :rules="{
              required: true,
              message: '该项为必填字段',
              trigger: 'change',
            }"
            :label="$t('energyConsumptionAnalysis.collectTime')"
            class="mb-2"
          >
            <DatePicker
              v-model:value="item.updateTime"
              picker="month"
              :disabled="!item.meterType"
            />
          </FormItem>
          <FormItem
            :name="['energyList', index, 'value']"
            :rules="{
              required: true,
              message: '该项为必填字段',
              trigger: 'change',
            }"
            :label="$t('energyConsumptionAnalysis.energyConsumption')"
            class="mb-2"
          >
            <InputNumber
              v-model:value="item.value"
              :disabled="!item.meterType"
            />
          </FormItem>
          <FormItem :wrapper-col="{ span: 18, offset: 6 }">
            <Button class="w-48" danger @click="deleteLine(index)">
              <Icon
                icon="mdi-light:delete"
                class="inline-block align-top text-2xl"
              />
              {{ $t('common.delete') }}
            </Button>
          </FormItem>
          <hr class="mb-8" />
        </template>
        <FormItem :wrapper-col="{ span: 18, offset: 6 }">
          <Button class="w-48" @click="addLine">
            <Icon icon="mdi:add" class="inline-block align-top text-2xl" />
            {{ $t('common.add') }}
          </Button>
        </FormItem>
        <FormItem :wrapper-col="{ span: 18, offset: 6 }">
          <Button type="primary" class="w-48" @click="submit">
            {{ $t('common.submit') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
  </Page>
</template>

<style scoped></style>
