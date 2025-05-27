<script setup lang="ts">
import { ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  CheckboxGroup,
  Drawer,
  Form,
  FormItem,
  message,
  RadioGroup,
  Select,
  Space,
  Transfer,
} from 'ant-design-vue';

import {
  getUserList,
  listUserUpInfo,
  obtainTheListOfProcessEquipment,
  userDown,
  userUp,
  workstationListAcquisition,
} from '#/api';

// region 人员操作
// 人员操作是否显示
const whetherPersonnelOperationsAreDisplayed = ref(false);
// 当前编辑的人员操作信息
const editedInformation = ref<any>({});
// 人员操作类型
// 1: 上工 2: 下工
const personnelOperationType = ref(0);
// 用户列表
const userList = ref<any>([]);
// 已上工的工号列表
const jobNumberThatHasAlreadyStartedWorking = ref<any>([]);
// 过滤
const filterOption = (inputValue: string, option: any) => {
  return option.label.includes(inputValue);
};
/**
 * 查询全部用户
 */
function queryAllUser() {
  getUserList().then((data) => {
    userList.value = [];
    data.forEach((item: any) => {
      userList.value.push({
        title: `${item.userName}___${item.workNumber}`,
        key: item.workNumber,
      });
    });
  });
}

/**
 * 查询上工人员
 */
function searchForStaffOnSite() {
  jobNumberThatHasAlreadyStartedWorking.value = [];
  if (
    !editedInformation.value.equipCode ||
    editedInformation.value.equipCode.length === 0
  ) {
    if (personnelOperationType.value === 2) {
      userList.value = [];
    }
    return;
  }
  listUserUpInfo({
    clientCodes: editedInformation.value.equipCode,
  }).then((data) => {
    data.forEach((item: any) => {
      userList.value.push({
        title: `${item.perName}___${item.workNumber}`,
        key: item.workNumber,
      });
      jobNumberThatHasAlreadyStartedWorking.value.push(item.workNumber);
    });
  });
}

/**
 * 显示人员操作
 */
function displayPersonnelOperation(type: number) {
  queryListOfProductionLines();
  whetherPersonnelOperationsAreDisplayed.value = true;
  personnelOperationType.value = type;
  switch (type) {
    case 1: {
      queryAllUser();
      whetherPersonnelOperationsAreDisplayed.value = true;
      break;
    }
    case 2: {
      userList.value = [];
      whetherPersonnelOperationsAreDisplayed.value = true;
      break;
    }
  }
}

/**
 * 关闭人员操作
 */
function shutDownPersonnelOperations() {
  whetherPersonnelOperationsAreDisplayed.value = false;
  editedInformation.value = {};
  jobNumberThatHasAlreadyStartedWorking.value = [];
  userList.value = [];
}

/**
 * 获取下工人员
 */
function getTheStaff() {
  const difference = userList.value.filter(
    (item1: any) =>
      !jobNumberThatHasAlreadyStartedWorking.value.includes(item1.key),
  );
  const keys: any = [];
  difference.forEach((item: any) => {
    keys.push(item.key);
  });
  return keys;
}

/**
 * 表单对象
 */
const formRef = ref<any>();
/**
 * 人员操作提交
 */
function personnelOperationSubmission() {
  formRef.value.validate().then(() => {
    const params = {
      clientCodes: editedInformation.value.equipCode,
      workNumbers:
        personnelOperationType.value === 1
          ? jobNumberThatHasAlreadyStartedWorking.value
          : getTheStaff(),
    };
    const ob =
      personnelOperationType.value === 1 ? userUp(params) : userDown(params);
    ob.then(() => {
      message.success($t('common.successfulOperation'));
      shutDownPersonnelOperations();
    });
  });
}

// endregion

// region 工作站查询
// 工作站列表
const listOfProductionLines = ref<any>([]);
/**
 * 查询工作站列表
 * 1. 调用工作站列表获取接口
 * 2. 设置默认选中第一个工作站
 * 3. 触发工艺设备列表查询
 */
function queryListOfProductionLines() {
  workstationListAcquisition().then((data) => {
    listOfProductionLines.value = []; // 更新工作站列表数据
    data.forEach((item: any) => {
      listOfProductionLines.value.push({
        label: `${item.workstationName}___${item.workstationCode}`,
        value: item.workstationCode,
      });
    });
    // 初始化默认选中项：当未选择工作站时，自动选中第一个工作站
    if (!editedInformation.value.workstationCode) {
      editedInformation.value.workstationCode = data[0].workstationCode; // 取第一个工作站的编码作为默认值
    }
    queryProcessEquipment(); // 触发关联的工艺设备查询
  });
}

// endregion
// region 设备查询

// 艺设备列表
const listOfProcesses = ref<any>([]);

/**
 * 查询工艺设备列表
 * 1. 清空当前选择的工艺设备
 * 2. 调用接口获取指定工作站的设备列表
 * 3. 更新工艺设备数据并触发工单查询
 */
function queryProcessEquipment() {
  obtainTheListOfProcessEquipment({
    workstationCode: editedInformation.value.workstationCode, // 使用当前选中的工作站编码
  }).then((data) => {
    listOfProcesses.value = []; // 更新工艺设备列表数据
    data.forEach((item: any) => {
      listOfProcesses.value.push({
        label: `${item.equipmentName}`,
        value: item.equipmentCode,
      });
    });
    editedInformation.value.equipCode = []; // 重置当前选择的设备
  });
}

// endregion

// region 暴露方法

defineExpose({
  open: displayPersonnelOperation,
});

// endregion
</script>

<template>
  <!-- region 用户上工 -->
  <Drawer
    v-model:open="whetherPersonnelOperationsAreDisplayed"
    :footer-style="{ textAlign: 'right' }"
    :height="400"
    placement="top"
    :title="$t('productionOperation.personnelTitle')"
    @close="shutDownPersonnelOperations"
  >
    <Form
      ref="formRef"
      :model="editedInformation"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
      autocomplete="off"
    >
      <FormItem
        :label="$t('productionOperation.workCenter')"
        :rules="[{ required: true, message: '该项为必填项' }]"
        name="workstationCode"
      >
        <RadioGroup
          v-model:value="editedInformation.workstationCode"
          :options="listOfProductionLines"
          @change="queryProcessEquipment"
          v-if="listOfProductionLines.length < 5"
        />
        <Select
          v-model:value="editedInformation.equipCode"
          mode="multiple"
          :options="listOfProductionLines"
          :filter-option="filterOption"
          @change="queryProcessEquipment"
          v-else
        />
      </FormItem>
      <FormItem
        :label="$t('productionOperation.equipment')"
        :rules="[{ required: true, message: '该项为必填项' }]"
        name="equipCode"
      >
        <CheckboxGroup
          v-model:value="editedInformation.equipCode"
          :options="listOfProcesses"
          v-if="listOfProcesses.length < 5"
        />
        <Select
          v-model:value="editedInformation.equipCode"
          mode="multiple"
          :options="listOfProcesses"
          :filter-option="filterOption"
          @change="searchForStaffOnSite"
          v-else
        />
      </FormItem>
    </Form>
    <Transfer
      v-model:target-keys="jobNumberThatHasAlreadyStartedWorking"
      :data-source="userList"
      show-search
      :filter-option="filterOption"
      :render="(item: any) => item.title"
      class="w-full justify-center"
      :list-style="{
        minWidth: '300px',
        width: '40%',
        height: '300px',
      }"
    />
    <template #footer>
      <Space>
        <!-- 取消 -->
        <Button @click="shutDownPersonnelOperations">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认 -->
        <Button type="primary" @click="personnelOperationSubmission">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
  <!-- endregion -->
</template>

<style scoped></style>
