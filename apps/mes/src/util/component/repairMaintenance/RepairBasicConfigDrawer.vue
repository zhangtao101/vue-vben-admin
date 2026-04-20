<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue 的抽屉、表单组件，以及 createRepairBasicConfig、updateRepairBasicConfig API
 * [OUTPUT]: 对外提供维修基础配置抽屉组件
 * [POS]: 维修维护模块 的维修基础配置抽屉，支持新增/编辑维修类型、故障等级、设备分组等配置
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-20 16:16:00
 */
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
/**
 * 重置表单数据为默认值，可指定配置类型。
 * @param {string} [forceConfigType] - 强制设置的配置类型，默认使用 props.configType
 * @returns {void} 无返回值
 * @since 2026-04-20 16:16:00
 */
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
      formData.value = { ...newRow };
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
/**
 * 关闭抽屉并重置表单。
 * @returns {void} 无返回值
 * @since 2026-04-20 16:16:00
 */
function handleClose() {
  drawerVisible.value = false;
  resetForm();
}

// ========== 提交表单 ==========
/**
 * 提交表单数据，包含表单验证、创建或更新维修基础配置。
 * @returns {void} 无返回值，成功后触发 success 事件
 * @throws {Error} 表单验证失败时不提交
 * @since 2026-04-20 16:16:00
 */
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
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </div>
    </template>
  </Drawer>
</template>
