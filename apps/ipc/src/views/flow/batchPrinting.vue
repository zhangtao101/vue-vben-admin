<script setup lang="ts">
import { ref } from 'vue';
import { hiprint } from 'vue-plugin-hiprint';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Form,
  FormItem,
  InputNumber,
  RadioGroup,
} from 'ant-design-vue';

import { batchCodeCreate, queryPrintTemplateDetails } from '#/api';
import { createDmImage } from '#/util';

/**
 * 面数信息
 */
const numberOfFacesOptions = [
  {
    label: '单面',
    value: 1,
  },
  {
    label: '双面',
    value: 2,
  },
];
/**
 * 打印类型
 */
const printType = [
  {
    label: '外箱码',
    value: 1,
  },
  {
    label: '货架码',
    value: 2,
  },
];
/**
 * 批量打印信息
 */
const printMessage = ref({
  type: 1,
  number: 0,
  labelType: 1,
});

/**
 * 批量打印
 */
function print() {
  Promise.all([
    queryPrintTemplateDetails('箱码打印'),
    batchCodeCreate(printMessage.value),
  ]).then(([printRes, codeRes]: any) => {
    try {
      const templateRef = JSON.parse(printRes.printData);
      const hiprintTemplate = new hiprint.PrintTemplate({
        template: templateRef,
      });
      const arr: any = [];
      codeRes.forEach(({ qrcode }: any) => {
        arr.push({
          qrcode,
          dmCode: createDmImage(qrcode),
        });
      });
      hiprintTemplate.print(arr, { leftOffset: -1, topOffset: -1 });
      printMessage.value = {
        type: 1,
        number: 0,
        labelType: 1,
      };
    } catch {
      console.error('模板解析失败');
    }
  });
}
</script>

<template>
  <Page>
    <Card>
      <Form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <!-- 面数 -->
        <FormItem :label="$t('ioBillOperation.numberOfFaces')">
          <RadioGroup
            v-model:value="printMessage.type"
            :options="numberOfFacesOptions"
          />
        </FormItem>
        <!-- 标签类型 -->
        <FormItem :label="$t('ioBillOperation.labelType')">
          <RadioGroup
            v-model:value="printMessage.labelType"
            :options="printType"
          />
        </FormItem>
        <!-- 数量 -->
        <FormItem :label="$t('ioBillOperation.number')">
          <InputNumber v-model:value="printMessage.number" class="w-48" />
        </FormItem>
        <!-- 数量 -->
        <FormItem :wrapper-col="{ offset: 6, span: 10 }">
          <Button @click="print" type="primary" class="w-full">
            {{ $t('common.batchPrinting') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
  </Page>
</template>

<style scoped></style>
