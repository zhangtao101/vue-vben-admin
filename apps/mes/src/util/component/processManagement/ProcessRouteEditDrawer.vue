<script lang="ts" setup>
import { ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  RadioGroup,
  Select,
  Space,
} from 'ant-design-vue';

import {
  addProcessRoute,
  listWordListByParentCode,
  updateProcessRoute,
} from '#/api';

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const showDrawer = ref(false);
const editForm = ref();
const editItem = ref<any>({});
const editRules = ref<any>({
  routeCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  routeName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  routeType: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  remark: [{ message: '此项为必填项', required: false, trigger: 'change' }],
});

const routeTypeList = ref<any>([]);

function queryRouteType() {
  listWordListByParentCode('LXLB').then((data) => {
    routeTypeList.value = data.map((item: any) => ({
      label: item.wordName,
      value: item.orderNumber,
    }));
  });
}

function openDrawer(item: any = {}) {
  editItem.value = {
    ...item,
  };
  showDrawer.value = true;
  queryRouteType();
}

function closeDrawer() {
  editItem.value = {};
  showDrawer.value = false;
  emit('close');
}

function submit() {
  editForm.value.validate().then(() => {
    const params = {
      ...editItem.value,
    };
    const ob = params.id ? updateProcessRoute(params) : addProcessRoute(params);
    ob.then(() => {
      closeDrawer();
      message.success($t('common.successfulOperation'));
      emit('success');
    });
  });
}

defineExpose({
  closeDrawer,
  openDrawer,
});
</script>

<template>
  <Drawer
    v-model:open="showDrawer"
    :footer-style="{ textAlign: 'right' }"
    :width="600"
    placement="right"
    :title="$t('common.edit')"
    @close="closeDrawer()"
  >
    <Form
      ref="editForm"
      :model="editItem"
      :rules="editRules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
    >
      <!-- 工艺路线编号 -->
      <FormItem
        :label="$t('processManagement.processRoute.processRouteNumber')"
        name="routeCode"
        style="margin-bottom: 1em"
      >
        <Input v-model:value="editItem.routeCode" :disabled="!!editItem.id" />
      </FormItem>
      <!-- 工艺路线名称 -->
      <FormItem
        :label="$t('processManagement.processRoute.processRouteName')"
        name="routeName"
        style="margin-bottom: 1em"
      >
        <Input v-model:value="editItem.routeName" />
      </FormItem>
      <!-- 路线类型 -->
      <FormItem
        :label="$t('processManagement.processRoute.routeType')"
        name="routeType"
        style="margin-bottom: 1em"
      >
        <RadioGroup
          v-model:value="editItem.routeType"
          :options="routeTypeList"
          v-if="routeTypeList.length <= 3"
        />
        <Select
          v-model:value="editItem.routeType"
          :options="routeTypeList"
          v-else
        />
      </FormItem>
      <!-- 备注 -->
      <FormItem
        :label="$t('processManagement.processBase.remark')"
        name="remark"
        style="margin-bottom: 1em"
      >
        <Input v-model:value="editItem.remark" />
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <!-- 取消 -->
        <Button @click="closeDrawer">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认 -->
        <Button type="primary" @click="submit">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
