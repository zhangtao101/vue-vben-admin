<script lang="ts" setup>
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

import {
  createRepairBasicConfig,
  updateRepairBasicConfig,
} from '#/api/equipManagement/repairBasicConfig.service';
import { $t } from '#/locales';

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
  open?: boolean;
  configType?: string;
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
const drawerTitle = computed(() =>
  props.row?.id
    ? $t('repair.repairBasicConfig.drawerEditTitle')
    : $t('repair.repairBasicConfig.drawerAddTitle'),
);

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
function resetForm(forceConfigType?: string) {
  formData.value = {
    configCode: '',
    configName: '',
    configType: forceConfigType || props.configType,
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
      resetForm(props.configType);
    }
  },
  { immediate: true },
);

// ========== 监听抽屉打开，重置表单 ==========
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && !props.row?.id) {
      resetForm(props.configType);
    }
  },
);

// ========== 表单验证规则 ==========
const rules: Record<string, any[]> = {
  configCode: [
    {
      required: true,
      message: `请输入${$t('repair.repairBasicConfig.configCode')}`,
    },
  ],
  configName: [
    {
      required: true,
      message: `请输入${$t('repair.repairBasicConfig.configName')}`,
    },
  ],
};

const formRef = ref<any>();

// ========== 配置类型映射 ==========
const configTypeMap: Record<string, string> = {
  REPAIR_TYPE: $t('repair.repairBasicConfig.repairType'),
  FAULT_LEVEL: $t('repair.repairBasicConfig.faultLevel'),
  EQUIPMENT_GROUP: $t('repair.repairBasicConfig.equipmentGroup'),
  URGENT_LEVEL: $t('repair.repairBasicConfig.urgentLevel'),
};

// ========== 是否显示维修组编码（仅设备分组时显示） ==========
const showRepairGroupCode = computed(
  () => props.configType === 'EQUIPMENT_GROUP',
);

// ========== 配置类型显示文本 ==========
const configTypeLabel = computed(
  () => configTypeMap[props.configType] || props.configType,
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
      const api = props.row?.id
        ? updateRepairBasicConfig
        : createRepairBasicConfig;
      const params: any = {
        ...formData.value,
        ...(props.row?.id ? { id: props.row.id } : {}),
      };
      api(params).then(() => {
        message.success($t('common.successfulOperation'));
        emit('success');
        handleClose();
      });
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
    <Form
      ref="formRef"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      :model="formData"
      :rules="rules"
    >
      <FormItem
        :label="$t('repair.repairBasicConfig.configCode')"
        name="configCode"
      >
        <Input
          v-model:value="formData.configCode"
          :placeholder="`请输入${$t('repair.repairBasicConfig.configCode')}`"
        />
      </FormItem>

      <FormItem
        :label="$t('repair.repairBasicConfig.configName')"
        name="configName"
      >
        <Input
          v-model:value="formData.configName"
          :placeholder="`请输入${$t('repair.repairBasicConfig.configName')}`"
        />
      </FormItem>

      <FormItem :label="$t('repair.repairBasicConfig.configType')">
        <Input :value="configTypeLabel" disabled />
      </FormItem>

      <FormItem
        v-if="showRepairGroupCode"
        :label="$t('repair.repairBasicConfig.repairGroupCode')"
      >
        <Input
          v-model:value="formData.repairGroupCode"
          :placeholder="`请输入${$t('repair.repairBasicConfig.repairGroupCode')}`"
        />
      </FormItem>

      <FormItem :label="$t('repair.repairBasicConfig.sortOrder')">
        <InputNumber
          v-model:value="formData.sortOrder"
          :min="0"
          :placeholder="`请输入${$t('repair.repairBasicConfig.sortOrder')}`"
          class="!w-full"
        />
      </FormItem>

      <FormItem :label="$t('repair.repairBasicConfig.remark')">
        <Input.TextArea
          v-model:value="formData.remark"
          :rows="3"
          :placeholder="`请输入${$t('repair.repairBasicConfig.remark')}`"
        />
      </FormItem>
    </Form>

    <template #footer>
      <div class="flex justify-end">
        <Space>
          <Button @click="handleClose">{{ $t('common.cancel') }}</Button>
          <Button type="primary" @click="handleSubmit">
{{
            $t('common.confirm')
          }}
</Button>
        </Space>
      </div>
    </template>
  </Drawer>
</template>
