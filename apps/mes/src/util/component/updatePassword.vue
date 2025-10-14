<script setup lang="ts">
import { ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Space,
} from 'ant-design-vue';

import { getUserInfoApi, updatePassword } from '#/api';

// region 抽屉基本操作
const showDrawer = ref(false);

function openDrawer() {
  queryBasicMessage();
  showDrawer.value = true;
}

function closeDrawer() {
  showDrawer.value = false;
}

// endregion

// region 表单操作
const formRef = ref();
const formState = ref<any>({});

function queryBasicMessage() {
  getUserInfoApi().then(({ id, userName }: any) => {
    formState.value = {
      id,
      userName,
    };
  });
}

function submit() {
  formRef.value.validate().then(() => {
    updatePassword(formState.value).then(() => {
      message.success($t('common.successfulOperation'));
      closeDrawer();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });
  });
}

/**
 * 密码长度校验
 * @param _rule 校验规则
 * @param value 校验值
 */
function lengthCheck(_rule: any, value: string) {
  if (value) {
    if (value.length < 8) {
      return Promise.reject($t('ui.formRules.minLength', ['密码', '8']));
    }
    if (value.length > 20) {
      return Promise.reject($t('ui.formRules.maxLength', ['密码', '20']));
    }
  }
  return Promise.resolve();
}

/**
 * 密码校验
 * @param _rule 校验规则
 * @param value 校验值
 */
function passwordCheck(_rule: any, value: string) {
  if (value && value !== formState.value.password) {
    return Promise.reject($t('ui.formRules.passwordNotSame'));
  }
  return Promise.resolve();
}
// endregion

// region 暴露方法

// 暴露 open 方法，供父组件调用
defineExpose({
  open: openDrawer,
});

// endregion
</script>

<template>
  <Drawer
    :title="$t('ui.widgets.updatePassWord')"
    v-model:open="showDrawer"
    placement="right"
    :width="400"
    :footer-style="{ textAlign: 'right' }"
    @close="closeDrawer"
  >
    <Form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
    >
      <!-- 用户名 -->
      <FormItem :label="$t('sysUser.username')">
        <Input v-model:value="formState.userName" readonly />
      </FormItem>
      <!-- 旧密码 -->
      <FormItem
        :label="$t('sysUser.oldPassword')"
        :rules="[{ required: true, message: $t('ui.formRules.required') }]"
        name="oldPassword"
      >
        <Input type="password" v-model:value="formState.oldPassword" />
      </FormItem>
      <!-- 新密码 -->
      <FormItem
        :label="$t('sysUser.newPassword')"
        :rules="[
          { required: true, message: $t('ui.formRules.required') },
          { validator: lengthCheck, trigger: 'change' },
        ]"
        name="password"
      >
        <Input type="password" v-model:value="formState.password" />
      </FormItem>
      <!-- 确认密码 -->
      <FormItem
        :label="$t('sysUser.confirmPassword')"
        :rules="[
          { required: true, message: $t('ui.formRules.required') },
          { validator: lengthCheck, trigger: 'change' },
          { validator: passwordCheck, trigger: 'change' },
        ]"
        name="passwordOk"
      >
        <Input type="password" v-model:value="formState.passwordOk" />
      </FormItem>
    </Form>
    <!-- 抽屉底部操作按钮 -->
    <template #footer>
      <!-- 按钮组，包含取消和确认按钮 -->
      <Space>
        <!-- 取消按钮，点击后关闭人员操作抽屉 -->
        <Button @click="closeDrawer()">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认按钮，点击后提交人员操作信息 -->
        <Button type="primary" @click="submit()">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped></style>
