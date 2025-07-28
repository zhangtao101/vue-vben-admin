<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Card,
  Checkbox,
  CheckboxGroup,
  Col,
  DatePicker,
  Form,
  FormItem,
  Row,
  Textarea,
  UploadDragger,
} from 'ant-design-vue';

// 表单实例
const formRef = ref();
// 表单数据
const formState = ref<any>({});
// 文件列表
const fileList = ref<any>([]);

// 受伤部位
const injuredPart = ref([
  {
    label: '手',
    value: '手',
  },
  {
    label: '脚',
    value: '脚',
  },
  {
    label: '头',
    value: '头',
  },
  {
    label: '眼睛',
    value: '眼睛',
  },
  {
    label: '面部',
    value: '面部',
  },
  {
    label: '腰',
    value: '腰',
  },
  {
    label: '腿',
    value: '腿',
  },
  {
    label: '胳膊',
    value: '胳膊',
  },
  {
    label: '躯干',
    value: '躯干',
  },
  {
    label: '其他',
    value: '其他',
  },
]);
// 伤害类型
const injuryTypes = ref([
  {
    label: '机械伤害',
    value: '机械伤害',
  },
  {
    label: '化学伤害',
    value: '化学伤害',
  },
  {
    label: '物理伤害',
    value: '物理伤害',
  },
  {
    label: '生物伤害',
    value: '生物伤害',
  },
  {
    label: '电气伤害',
    value: '电气伤害',
  },
  {
    label: '运动伤害',
    value: '运动伤害',
  },
  {
    label: '热伤害及温度伤害',
    value: '热伤害及温度伤害',
  },
]);
</script>

<template>
  <Page>
    <Card>
      <Form
        ref="formRef"
        :model="formState"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <Row>
          <Col :span="12">
            <!-- 受伤员工-->
            <FormItem :label="$t('accidentReporting.injuredEmployee')">
              123
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 工号-->
            <FormItem :label="$t('accidentReporting.employeeID')">
              123
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="12">
            <!-- 部门-->
            <FormItem :label="$t('accidentReporting.department')">
              123
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 岗位-->
            <FormItem :label="$t('accidentReporting.position')"> 123 </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="12">
            <!-- 发生时间-->
            <FormItem :label="$t('accidentReporting.occurrenceTime')">
              <DatePicker show-time />
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 事件描述-->
            <FormItem :label="$t('accidentReporting.eventDescription')">
              <Textarea allow-clear />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="12">
            <!-- 受伤部位-->
            <FormItem :label="$t('accidentReporting.injuredPart')">
              <CheckboxGroup>
                <Checkbox
                  v-for="(item, index) of injuredPart"
                  :key="index"
                  :value="item.value"
                  class="mt-2 min-w-16"
                >
                  {{ item.label }}
                </Checkbox>
              </CheckboxGroup>
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 伤害类型-->
            <FormItem :label="$t('accidentReporting.injuryType')">
              <CheckboxGroup>
                <Checkbox
                  v-for="(item, index) of injuryTypes"
                  :key="index"
                  :value="item.value"
                  class="mt-2"
                >
                  {{ item.label }}
                </Checkbox>
              </CheckboxGroup>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="12">
            <!-- 受伤情况描述-->
            <FormItem
              :label="$t('accidentReporting.descriptionOfInjuryCondition')"
            >
              <Textarea allow-clear />
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 相关附件-->
            <FormItem :label="$t('accidentReporting.relatedAttachments')">
              <UploadDragger
                v-model:file-list="fileList"
                name="file"
                :multiple="true"
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              >
                <p class="ant-upload-drag-icon">
                  <IconifyIcon
                    icon="mdi:cloud-upload"
                    class="inline-block align-middle text-4xl text-[#5085ff]"
                  />
                </p>
                <p class="ant-upload-text">
                  {{ $t('accidentReporting.uploadAttachments') }}
                </p>
                <p class="ant-upload-hint">
                  {{ $t('accidentReporting.uploadAttachmentsHint') }}
                </p>
              </UploadDragger>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="12">
            <!-- 责任部门主管-->
            <FormItem :label="$t('accidentReporting.departmentSupervisor')">
              123
            </FormItem>
          </Col>
        </Row>
      </Form>
    </Card>
  </Page>
</template>

<style scoped></style>
