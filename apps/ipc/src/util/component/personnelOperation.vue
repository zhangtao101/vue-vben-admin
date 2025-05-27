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
/**
 * 控制人员操作抽屉是否显示的响应式变量
 */
const whetherPersonnelOperationsAreDisplayed = ref(false);
/**
 * 存储当前编辑的人员操作信息的响应式变量
 */
const editedInformation = ref<any>({});
/**
 * 人员操作类型的响应式变量，1 表示上工，2 表示下工
 */
const personnelOperationType = ref(0);
/**
 * 存储用户列表的响应式变量
 */
const userList = ref<any>([]);
/**
 * 存储已上工的工号列表的响应式变量
 */
const jobNumberThatHasAlreadyStartedWorking = ref<any>([]);

/**
 * 过滤选项函数，用于在选择器中根据输入值过滤选项
 * @param inputValue - 用户输入的过滤值
 * @param option - 当前的选项对象
 * @returns {boolean} - 如果选项标签包含输入值则返回 true，否则返回 false
 */
const filterOption = (inputValue: string, option: any) => {
  return option.label.includes(inputValue);
};

/**
 * 查询全部用户列表
 * 调用 `getUserList` 接口获取所有用户信息，并将其格式化为选择器所需的格式存储在 `userList` 中
 */
function queryAllUser() {
  getUserList().then((data) => {
    // 清空用户列表
    userList.value = [];
    data.forEach((item: any) => {
      userList.value.push({
        // 显示用户名称和工号
        title: `${item.userName}___${item.workNumber}`,
        // 使用工号作为唯一标识
        key: item.workNumber,
      });
    });
  });
}

/**
 * 查询上工人员列表
 * 根据当前选择的设备编码调用 `listUserUpInfo` 接口获取已上工人员信息，并更新 `userList` 和 `jobNumberThatHasAlreadyStartedWorking`
 */
function searchForStaffOnSite() {
  // 清空已上工的工号列表
  jobNumberThatHasAlreadyStartedWorking.value = [];
  if (
    !editedInformation.value.equipCode ||
    editedInformation.value.equipCode.length === 0
  ) {
    if (personnelOperationType.value === 2) {
      // 下工操作且未选择设备时，清空用户列表
      userList.value = [];
    }
    return;
  }
  listUserUpInfo({
    // 传入当前选择的设备编码
    clientCodes: editedInformation.value.equipCode,
  }).then((data) => {
    data.forEach((item: any) => {
      userList.value.push({
        // 显示人员名称和工号
        title: `${item.perName}___${item.workNumber}`,
        // 使用工号作为唯一标识
        key: item.workNumber,
      });
      // 将已上工的工号添加到列表中
      jobNumberThatHasAlreadyStartedWorking.value.push(item.workNumber);
    });
  });
}

/**
 * 显示人员操作抽屉
 * 根据传入的操作类型（1 表示上工，2 表示下工）进行相应的初始化操作，并显示人员操作抽屉
 * @param type - 人员操作类型
 */
function displayPersonnelOperation(type: number) {
  // 查询工作站列表
  queryListOfProductionLines();
  // 显示人员操作抽屉
  whetherPersonnelOperationsAreDisplayed.value = true;
  // 设置人员操作类型
  personnelOperationType.value = type;
  switch (type) {
    case 1: {
      // 上工操作，查询全部用户列表
      queryAllUser();
      // 显示人员操作抽屉
      whetherPersonnelOperationsAreDisplayed.value = true;
      break;
    }
    case 2: {
      // 下工操作，清空用户列表
      userList.value = [];
      // 显示人员操作抽屉
      whetherPersonnelOperationsAreDisplayed.value = true;
      break;
    }
  }
}

/**
 * 关闭人员操作抽屉
 * 隐藏人员操作抽屉，并清空相关数据
 */
function shutDownPersonnelOperations() {
  // 隐藏人员操作抽屉
  whetherPersonnelOperationsAreDisplayed.value = false;
  // 清空当前编辑的人员操作信息
  editedInformation.value = {};
  // 清空已上工的工号列表
  jobNumberThatHasAlreadyStartedWorking.value = [];
  // 清空用户列表
  userList.value = [];
}

/**
 * 获取下工人员的工号列表
 * 计算用户列表中未在已上工工号列表中的工号，作为下工人员的工号列表
 * @returns {any[]} - 下工人员的工号列表
 */
function getTheStaff() {
  const difference = userList.value.filter(
    (item1: any) =>
      // 过滤出未在已上工工号列表中的用户
      !jobNumberThatHasAlreadyStartedWorking.value.includes(item1.key),
  );
  const keys: any = [];
  difference.forEach((item: any) => {
    // 将过滤出的用户工号添加到列表中
    keys.push(item.key);
  });
  return keys;
}

/**
 * 表单引用，用于验证表单数据
 */
const formRef = ref<any>();

/**
 * 人员操作提交
 * 验证表单数据，根据人员操作类型调用 `userUp` 或 `userDown` 接口进行上工或下工操作，操作成功后关闭人员操作抽屉
 */
function personnelOperationSubmission() {
  formRef.value.validate().then(() => {
    const params = {
      // 传入当前选择的设备编码
      clientCodes: editedInformation.value.equipCode,
      // 根据操作类型选择上工工号列表或下工工号列表
      workNumbers:
        personnelOperationType.value === 1
          ? jobNumberThatHasAlreadyStartedWorking.value
          : getTheStaff(),
    };
    const ob =
      personnelOperationType.value === 1
        ? // 上工操作调用 userUp 接口
          userUp(params)
        : // 下工操作调用 userDown 接口
          userDown(params);
    ob.then(() => {
      // 显示操作成功消息
      message.success($t('common.successfulOperation'));
      // 关闭人员操作抽屉
      shutDownPersonnelOperations();
    });
  });
}

// endregion

// region 工作站查询
/**
 * 存储工作站列表的响应式变量
 */
const listOfProductionLines = ref<any>([]);

/**
 * 查询工作站列表
 * 调用 `workstationListAcquisition` 接口获取工作站列表，并将其格式化为选择器所需的格式存储在 `listOfProductionLines` 中，同时设置默认选中的工作站并触发工艺设备列表查询
 */
function queryListOfProductionLines() {
  workstationListAcquisition().then((data) => {
    // 清空工作站列表
    listOfProductionLines.value = [];
    data.forEach((item: any) => {
      listOfProductionLines.value.push({
        // 显示工作站名称和编码
        label: `${item.workstationName}___${item.workstationCode}`,
        // 使用工作站编码作为值
        value: item.workstationCode,
      });
    });
    // 初始化默认选中项：当未选择工作站时，自动选中第一个工作站
    if (!editedInformation.value.workstationCode) {
      // 取第一个工作站的编码作为默认值
      editedInformation.value.workstationCode = data[0].workstationCode;
    }
    // 触发关联的工艺设备查询
    queryProcessEquipment();
  });
}

// endregion
// region 设备查询

/**
 * 存储工艺设备列表的响应式变量
 */
const listOfProcesses = ref<any>([]);

/**
 * 查询工艺设备列表
 * 根据当前选择的工作站编码调用 `obtainTheListOfProcessEquipment` 接口获取工艺设备列表，并将其格式化为选择器所需的格式存储在 `listOfProcesses` 中，同时重置当前选择的设备
 */
function queryProcessEquipment() {
  obtainTheListOfProcessEquipment({
    // 使用当前选中的工作站编码
    workstationCode: editedInformation.value.workstationCode,
  }).then((data) => {
    // 清空工艺设备列表
    listOfProcesses.value = [];
    data.forEach((item: any) => {
      listOfProcesses.value.push({
        // 显示设备名称
        label: `${item.equipmentName}`,
        // 使用设备编码作为值
        value: item.equipmentCode,
      });
    });
    // 重置当前选择的设备
    editedInformation.value.equipCode = [];
  });
}

// endregion

// region 暴露方法

/**
 * 暴露 `displayPersonnelOperation` 方法，供父组件调用以显示人员操作抽屉
 */
defineExpose({
  open: displayPersonnelOperation,
});

// endregion
</script>

<template>
  <!-- region 用户上工 -->
  <!-- 人员操作抽屉组件，根据 `whetherPersonnelOperationsAreDisplayed` 控制显示状态 -->
  <Drawer
    v-model:open="whetherPersonnelOperationsAreDisplayed"
    :footer-style="{ textAlign: 'right' }"
    :height="400"
    placement="top"
    :title="$t('productionOperation.personnelTitle')"
    @close="shutDownPersonnelOperations"
  >
    <!-- 人员操作表单组件，用于输入工作站和设备信息 -->
    <Form
      ref="formRef"
      :model="editedInformation"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
      autocomplete="off"
    >
      <!-- 工作站选择表单项，验证是否选择 -->
      <FormItem
        :label="$t('productionOperation.workCenter')"
        :rules="[{ required: true, message: '该项为必填项' }]"
        name="workstationCode"
      >
        <!-- 当工作站列表数量小于 5 时，使用单选框组选择 -->
        <RadioGroup
          v-model:value="editedInformation.workstationCode"
          :options="listOfProductionLines"
          @change="queryProcessEquipment"
          v-if="listOfProductionLines.length < 5"
        />
        <!-- 当工作站列表数量大于等于 5 时，使用多选选择器 -->
        <Select
          v-model:value="editedInformation.equipCode"
          mode="multiple"
          :options="listOfProductionLines"
          :filter-option="filterOption"
          @change="queryProcessEquipment"
          v-else
        />
      </FormItem>
      <!-- 设备选择表单项，验证是否选择 -->
      <FormItem
        :label="$t('productionOperation.equipment')"
        :rules="[{ required: true, message: '该项为必填项' }]"
        name="equipCode"
      >
        <!-- 当工艺设备列表数量小于 5 时，使用复选框组选择 -->
        <CheckboxGroup
          v-model:value="editedInformation.equipCode"
          :options="listOfProcesses"
          v-if="listOfProcesses.length < 5"
        />
        <!-- 当工艺设备列表数量大于等于 5 时，使用多选选择器 -->
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
    <!-- 人员转移组件，用于选择上工或下工的人员 -->
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
    <!-- 抽屉底部操作按钮 -->
    <template #footer>
      <!-- 按钮组，包含取消和确认按钮 -->
      <Space>
        <!-- 取消按钮，点击后关闭人员操作抽屉 -->
        <Button @click="shutDownPersonnelOperations">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认按钮，点击后提交人员操作信息 -->
        <Button type="primary" @click="personnelOperationSubmission">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
  <!-- endregion -->
</template>

<style scoped></style>
