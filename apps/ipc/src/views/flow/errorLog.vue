<script setup lang="ts">
import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Empty,
  Form,
  FormItem,
  Input,
  message,
  Modal,
} from 'ant-design-vue';

import { logClearCallBack, logGetErrorDetail, logUpdateTaskCode } from '#/api';
import { $t } from '#/locales';

import 'vue3-json-viewer/dist/vue3-json-viewer.css';

// region 主列表查询相关功能

/**
 * 主表格查询参数
 * 默认查询全部类型（-99）
 */
const queryParams = ref<any>({});
const details = ref<any>({});
/**
 * 主表格数据查询函数
 * 根据查询参数获取分页数据
 * @param page 当前页码
 * @param pageSize 每页显示数量
 * @returns Promise 返回分页数据
 */
function queryData() {
  const params: any = {
    ...queryParams.value, // 展开所有查询参数
  };
  if (params.boxcode) {
    // 调用接口获取数据
    logGetErrorDetail(params).then((data) => {
      details.value = data;
    });
  } else {
    details.value = undefined;
  }
}

// endregion

// region 任务号覆盖 / 传输线清空复位
/**
 * 任务号覆盖
 * @param row
 *
 * @param type
 */
function missionNumberOverride(type: number) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消!');
    },
    onOk() {
      const ob =
        type === 1
          ? logUpdateTaskCode({
              taskCode: details.value.taskCode,
            })
          : logClearCallBack({
              outcode: details.value.outcode,
            });
      ob.then(() => {
        message.success($t('common.successfulOperation'));
        queryData();
      });
    },
    title: '是否确认该操作?',
  });
}

// endregion

onMounted(() => {
  queryData();
});
</script>

<template>
  <Page>
    <!-- region 顶部搜索区域 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 箱码 -->
        <FormItem :label="$t('errorLog.code')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.boxcode"
            @keydown.enter="queryData"
          />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="queryData"
            :disabled="!queryParams.boxcode"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 主表格区域 -->
    <Card>
      <Descriptions bordered v-if="details">
        <DescriptionsItem :label="$t('errorLog.missionNumber')">
          {{ details.taskCode }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('errorLog.boxCode')">
          {{ details.packingCode }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('errorLog.transmissionLineNumber')">
          {{ details.outcode }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('errorLog.errorLogBreakdown')" :span="3">
          {{ details.logData }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('errorLog.operation')" :span="3">
          <!-- 任务号覆盖 -->
          <Button type="primary" @click="missionNumberOverride(1)" class="mx-1">
            {{ $t('errorLog.tip') }}
          </Button>
          <!-- 传输线清空复位 -->
          <Button type="primary" @click="missionNumberOverride(2)" class="mx-1">
            {{ $t('errorLog.clearTip') }}
          </Button>
        </DescriptionsItem>
      </Descriptions>
      <Empty v-else />
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
