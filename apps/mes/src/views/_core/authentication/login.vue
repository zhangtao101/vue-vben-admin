<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, onMounted, ref } from 'vue';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { getUserAuthorFlagApi, testUserAuthorApi } from '#/api';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();

/** 当前是否已通过授权认证（接口返回 1 已认证，-1 未认证） */
const authorized = ref(false);
/** 认证码提交中的加载状态 */
const authorizing = ref(false);

const formSchema = computed((): VbenFormSchema[] => {
  // 未认证时仅展示认证码输入框
  if (!authorized.value) {
    return [
      {
        component: 'VbenInput',
        componentProps: {
          placeholder: $t('authentication.authorCodeTip'),
        },
        fieldName: 'authorCode',
        label: $t('authentication.authorCode'),
        rules: z.string().min(1, {
          message: $t('authentication.authorCodeTip'),
        }),
      },
    ];
  }

  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      dependencies: {
        triggerFields: ['selectAccount'],
      },
      fieldName: 'loginName',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
    // {
    //   component: markRaw(SliderCaptcha),
    //   fieldName: 'captcha',
    //   rules: z.boolean().refine((value) => value, {
    //     message: $t('authentication.verifyRequiredTip'),
    //   }),
    // },
  ];
});

/**
 * 查询当前系统的授权认证状态并更新表单展示
 * @returns 是否已认证
 */
function fetchAuthorFlag(): Promise<boolean> {
  return getUserAuthorFlagApi()
    .then((flag) => {
      authorized.value = Number(flag) === 1;
      return authorized.value;
    })
    .catch(() => {
      // 接口业务码非 200（如未校验返回 402）时统一视为未认证
      authorized.value = false;
      return false;
    });
}

/**
 * 表单提交处理：未认证时提交认证码，已认证时执行登录
 * @param values 表单数据
 */
function handleSubmit(values: Recordable<any>) {
  if (!authorized.value) {
    authorizing.value = true;
    testUserAuthorApi(values.authorCode)
      .then(() => fetchAuthorFlag())
      .then((isAuthorized) => {
        if (isAuthorized) {
          message.success($t('authentication.authorizeSuccess'));
        } else {
          message.error($t('authentication.authorizeFailed'));
        }
      })
      .catch((error: Error) => {
        message.error(error?.message || $t('authentication.authorizeFailed'));
      })
      .finally(() => {
        authorizing.value = false;
      });
    return;
  }

  authStore.authLogin(values);
}

// 页面加载完成后获取认证状态，未认证时展示认证码输入
onMounted(() => {
  fetchAuthorFlag();
});
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authorized ? authStore.loginLoading : authorizing"
    :show-forget-password="false"
    :show-code-login="false"
    :show-qrcode-login="false"
    :show-third-party-login="false"
    :show-register="false"
    :show-remember-me="authorized"
    :submit-button-text="authorized ? '' : $t('authentication.authorize')"
    :sub-title="
      authorized ? '' : $t('authentication.systemAuthorizationSubtitle')
    "
    :title="authorized ? '' : $t('authentication.systemAuthorization')"
    @submit="handleSubmit"
  />
</template>
