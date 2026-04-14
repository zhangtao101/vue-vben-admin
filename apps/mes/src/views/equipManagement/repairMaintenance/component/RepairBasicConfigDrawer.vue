<script lang="ts" setup>
import type { Rule } from 'ant-design-vue/es/form';

import { computed, ref, watch } from 'vue';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Space,
} from 'ant-design-vue';

defineOptions({
  name: 'RepairBasicConfigDrawer',
});

const props = withDefaults(defineProps<Props>(), {
  open: false,
  configType: 'REPAIR_TYPE',
  row: null,
});

const emit = defineEmits<{
  success: [];
  'update:open': [value: boolean];
}>();

// ========== Props & Emits ==========
interface Props {
  open: boolean;
  configType: string;
  row?: any;
}

// ========== 抽屉可见性 ==========
const drawerVisible = ref(props.open);

watch(
  () => props.open,
  (val) => {
    drawerVisible.value = val;
  },
);

watch(drawerVisible, (val) => {
  emit('update:open', val);
});

// ========== 抽屉标题 ==========
const drawerTitle = computed(() => (props.row?.id ? '编辑配置' : '新增配置'));

// ========== 表单数据 ==========
const formData = ref({
  configCode: '',
  configName: '',
  configType: '',
  repairGroupCode: '',
  sortOrder: undefined as number | undefined,
  remark: '',
});

// ========== 重置表单 ==========
function resetForm() {
  formData.value = {
    configCode: '',
    configName: '',
    configType: props.configType,
    repairGroupCode: '',
    sortOrder: undefined,
    remark: '',
  };
}

// ========== 监听 row 变化，自动填充表单 ==========
watch(
  () => props.row,
  (newRow) => {
    if (newRow?.id) {
      formData.value = {
        configCode: newRow.configCode || '',
        configName: newRow.configName || '',
        configType: newRow.configType || '',
        repairGroupCode: newRow.repairGroupCode || '',
        sortOrder: newRow.sortOrder,
        remark: newRow.remark || '',
      };
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

// ========== 表单验证规则 ==========
const rules: Record<string, Rule[]> = {
  configCode: [{ required: true, message: '请输入配置编码' }],
  configName: [{ required: true, message: '请输入配置名称' }],
};

const formRef = ref<any>();

// ========== 是否显示维修组编码（仅设备分组时显示） ==========
const showRepairGroupCode = computed(
  () => props.configType === 'EQUIPMENT_GROUP',
);

// ========== 关闭抽屉 ==========
function handleClose() {
  drawerVisible.value = false;
  resetForm();
}

// ========== 提交表单 ==========
function handleSubmit() {
  formRef.value
    .validate()
    .then(() => {
      // TODO: 接口预留
      message.success('保存成功');
      emit('success');
      handleClose();
    })
    .catch(() => {
      // 验证失败
    });
}
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :title="drawerTitle"
    width="500"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <Form ref="formRef" :model="formData" :rules="rules" layout="vertical">
      <FormItem label="配置编码" name="configCode">
        <Input
          v-model:value="formData.configCode"
          placeholder="请输入配置编码"
        />
      </FormItem>

      <FormItem label="配置名称" name="configName">
        <Input
          v-model:value="formData.configName"
          placeholder="请输入配置名称"
        />
      </FormItem>

      <FormItem v-if="showRepairGroupCode" label="维修组编码">
        <Input
          v-model:value="formData.repairGroupCode"
          placeholder="请输入维修组编码"
        />
      </FormItem>

      <FormItem label="排序号">
        <InputNumber
          v-model:value="formData.sortOrder"
          :min="0"
          placeholder="请输入排序号"
          class="!w-full"
        />
      </FormItem>

      <FormItem label="备注">
        <Input.TextArea
          v-model:value="formData.remark"
          :rows="3"
          placeholder="请输入备注"
        />
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <Button @click="handleClose">取消</Button>
        <Button type="primary" @click="handleSubmit">确定</Button>
      </Space>
    </template>
  </Drawer>
</template>
