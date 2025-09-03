<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';
import { useAccessStore } from '@vben/stores';

import {
  Cascader,
  Checkbox,
  CheckboxGroup,
  Col,
  DatePicker,
  Form,
  FormItem,
  Row,
  Select,
  Textarea,
  UploadDragger,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { listSysPerson, queryOrganizationTree } from '#/api';
import { flattenTree } from '#/util';

// 表单实例
const formRef = ref();
// 表单数据
const formState = ref<any>({});
// 时间禁用
const disabledDate = (current: any) => {
  // Can not select days before today and today
  return current && current > dayjs().endOf('day');
};
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

// region 组织查询
// 组织数据
const treeData = ref<any>([]);
/**
 * 查询全部的组织树
 * 这个函数用于从服务器获取所有组织数据，并更新前端的树形数据结构。
 */
function queryAllOrganizations() {
  // 调用queryDictionaryTree API函数，获取菜单列表
  queryOrganizationTree().then((data) => {
    // 检查返回的数据是否存在且长度大于0
    if (data) {
      const arr = flattenTree(
        {
          children: [data],
        },
        'children',
      );
      treeData.value = [];
      arr.forEach((item: any) => {
        treeData.value.push({
          label: item.orgFullName,
          value: item.orgCode,
          isLeaf: false,
        });
      });
    }
  });
}

// endregion

// region 用户查询

function userSearch(selectedOptions: any) {
  const targetOption = selectedOptions[selectedOptions.length - 1];
  targetOption.loading = true;

  listSysPerson({
    orgCode: targetOption.value,
    pageNum: 1, // 当前页码。
    pageSize: 25, // 每页显示的数据条数。
  })
    .then(({ list }) => {
      list.forEach((item: any) => {
        item.label = item.perName;
        item.value = item.perName;
      });
      targetOption.children = list;
    })
    .finally(() => {
      targetOption.loading = false;
    });
}

function userChange(_val: any, item: any) {
  if (item.length === 2) {
    const user = item[1];
    formState.value.injuredUser = user.perName;
    formState.value.worknumber = user.workNumber;
    // formState.value.depatment = user.orgName;
    formState.value.position = user.stationName;
  } else {
    formState.value.userChenked = [];
  }
}

// endregion

// region 文件上传
const accessStore = useAccessStore();
// 文件上传列表
const uploadFile = ref<any>([]);

function getUploadUrl() {
  return `/ht/${import.meta.env.VITE_GLOB_MES_MAIN}/accident/register/upload`;
}

// endregion

// region 事故类型

const accidentType = ref([
  {
    label: '特别重大事故',
    value: 1,
  },
  {
    label: '重大事故',
    value: 2,
  },
  {
    label: '较大事故',
    value: 3,
  },
  {
    label: '一般事故',
    value: 4,
  },
]);

// endregion

// region 暴露方法
/**
 * 初始化表单数据
 * @param row
 */
function formInit(row: any) {
  if (row.time) {
    row.time = dayjs(row.time);
  }
  if (row.fileList) {
    uploadFile.value = [];
    row.fileList.forEach((item: any) => {
      if (!item) return;
      const regex = /[^/]+$/;
      const fileName = item.match(regex)[0];
      uploadFile.value.push({
        url: item,
        status: 'done',
        name: fileName,
      });
    });
  }

  if (row.manager) {
    row.managerChecked = ['', row.manager];
  }

  formState.value = {
    ...row,
  };
}

/**
 * 字段校验
 * @param callback
 */
function formValidate(callback: Function) {
  formRef.value.validate().then(() => {
    const params = {
      ...formState.value,
    };
    params.time = params.time.format('YYYY-MM-DD HH:mm:ss');
    if (params.managerChecked && params.managerChecked.length === 2) {
      params.manager = params.managerChecked[1];
    }
    params.fileList = [];

    uploadFile.value.forEach((item: any) => {
      const url = item.response ? item.response.data : item.url;
      params.fileList.push(url);
    });
    callback(params);
  });
}

/**
 * 暴露方法供父组件调用
 */
defineExpose({
  formInit,
  formValidate,
});

// endregion

onMounted(() => {
  queryAllOrganizations();
});
</script>

<template>
  <Form
    ref="formRef"
    :model="formState"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 18 }"
  >
    <Row>
      <Col :span="12">
        <!-- 员工选择-->
        <FormItem :label="$t('accidentManagement.employeeChoice')">
          <Cascader
            v-model:value="formState.userChenked"
            :options="treeData"
            :load-data="userSearch"
            @change="userChange"
            placeholder="选择受伤的员工"
            change-on-select
          />
        </FormItem>
      </Col>
    </Row>
    <Row>
      <Col :span="12">
        <!-- 受伤员工选择-->
        <FormItem
          :label="$t('accidentManagement.injuredEmployee')"
          :rules="[{ required: true, message: $t('ui.formRules.required') }]"
          name="injuredUser"
        >
          {{ formState.injuredUser }}
        </FormItem>
      </Col>
      <Col :span="12">
        <!-- 工号-->
        <FormItem :label="$t('accidentManagement.employeeID')">
          {{ formState.worknumber }}
        </FormItem>
      </Col>
    </Row>
    <Row>
      <!--      <Col :span="12">
        &lt;!&ndash; 部门&ndash;&gt;
        <FormItem :label="$t('accidentManagement.department')">
          {{ formState.depatment }}
        </FormItem>
      </Col>-->
      <Col :span="12">
        <!-- 岗位-->
        <FormItem :label="$t('accidentManagement.position')">
          {{ formState.position }}
        </FormItem>
      </Col>
    </Row>
    <Row>
      <Col :span="12">
        <!-- 发生时间-->
        <FormItem
          :label="$t('accidentManagement.occurrenceTime')"
          :rules="[{ required: true, message: $t('ui.formRules.required') }]"
          name="time"
        >
          <DatePicker
            show-time
            v-model:value="formState.time"
            :disabled-date="disabledDate"
          />
        </FormItem>
      </Col>
      <Col :span="12">
        <!-- 事件描述-->
        <FormItem
          :label="$t('accidentManagement.eventDescription')"
          :rules="[{ required: true, message: $t('ui.formRules.required') }]"
          name="eventDescription"
        >
          <Textarea allow-clear v-model:value="formState.eventDescription" />
        </FormItem>
      </Col>
      <Col :span="12">
        <!-- 事故类型-->
        <FormItem
          :label="$t('accidentManagement.accidentType')"
          :rules="[{ required: true, message: $t('ui.formRules.required') }]"
          name="type"
        >
          <Select v-model:value="formState.type" :options="accidentType" />
        </FormItem>
      </Col>
    </Row>
    <Row>
      <Col :span="12">
        <!-- 受伤部位-->
        <FormItem
          :label="$t('accidentManagement.injuredPart')"
          :rules="[{ required: true, message: $t('ui.formRules.required') }]"
          name="injuredPartList"
        >
          <CheckboxGroup v-model:value="formState.injuredPartList">
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
        <FormItem :label="$t('accidentManagement.injuryType')">
          <CheckboxGroup v-model:value="formState.injuredTypeList">
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
          :label="$t('accidentManagement.descriptionOfInjuryCondition')"
        >
          <Textarea allow-clear v-model:value="formState.injuredDescription" />
        </FormItem>
      </Col>
      <Col :span="12">
        <!-- 相关附件-->
        <FormItem :label="$t('accidentManagement.relatedAttachments')">
          <UploadDragger
            v-model:file-list="uploadFile"
            name="file"
            :multiple="true"
            :action="getUploadUrl()"
            :headers="{ Authorization: `${accessStore.accessToken}` }"
          >
            <p class="ant-upload-drag-icon">
              <IconifyIcon
                icon="mdi:cloud-upload"
                class="inline-block align-middle text-4xl text-[#5085ff]"
              />
            </p>
            <p class="ant-upload-text">
              {{ $t('accidentManagement.uploadAttachments') }}
            </p>
            <p class="ant-upload-hint">
              {{ $t('accidentManagement.uploadAttachmentsHint') }}
            </p>
          </UploadDragger>
        </FormItem>
      </Col>
    </Row>
    <Row>
      <Col :span="12">
        <!-- 责任部门主管-->
        <FormItem
          :label="$t('accidentManagement.departmentSupervisor')"
          :rules="[{ required: true, message: $t('ui.formRules.required') }]"
          name="managerChecked"
        >
          <Cascader
            v-model:value="formState.managerChecked"
            :options="treeData"
            :load-data="userSearch"
            change-on-select
          />
        </FormItem>
      </Col>
    </Row>
    <Row>
      <Col :span="12">
        <!-- 事故原因-->
        <FormItem :label="$t('accidentManagement.accidentReason')">
          <Textarea allow-clear v-model:value="formState.reason" />
        </FormItem>
      </Col>
      <Col :span="12">
        <!-- 整改措施-->
        <FormItem :label="$t('accidentManagement.rectificationMeasure')">
          <Textarea allow-clear v-model:value="formState.measures" />
        </FormItem>
      </Col>
    </Row>
  </Form>
</template>

<style scoped></style>
