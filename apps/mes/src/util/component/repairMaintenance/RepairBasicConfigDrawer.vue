<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue 的抽屉、表单组件，以及 createRepairBasicConfig、updateRepairBasicConfig API
 * [OUTPUT]: 对外提供维修基础配置抽屉组件
 * [POS]: 维修维护模块 的维修基础配置抽屉，支持新增/编辑维修类型、故障等级、设备分组等配置
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-06-16 08:58:00
 */
import { computed, ref, watch } from 'vue';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
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
/** 组件 Props 定义：open(抽屉可见性)、configType(配置类型)、row(编辑行数据) */
interface Props {
  open?: boolean;
  configType?: string;
  row?: any;
}

// ========== 抽屉可见性 ==========
/** 抽屉本地可见性状态，与 props.open 双向同步 */
const drawerVisible = ref(props.open);

/** 监听 props.open 变更，同步更新本地抽屉可见性 */
watch(
  () => props.open,
  (val) => {
    drawerVisible.value = val;
  },
);

/** 监听本地抽屉可见性变更，向外 emit update:open 事件 */
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
  itemRequirement: '',
  itemStandard: '',
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
    itemRequirement: '',
    itemStandard: '',
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
/** 表单校验规则：configCode（必填）、configName（必填） */
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

/** 表单组件引用，用于调用 validate 方法 */
const formRef = ref<any>();

// ========== 配置类型映射 ==========
const configTypeMap: Record<string, string> = {
  REPAIR_TYPE: $t('repair.repairBasicConfig.repairType'),
  FAULT_LEVEL: $t('repair.repairBasicConfig.faultLevel'),
  EQUIPMENT_GROUP: $t('repair.repairBasicConfig.equipmentGroup'),
  URGENT_LEVEL: $t('repair.repairBasicConfig.urgentLevel'),
  FAULT_TYPE: $t('repair.repairBasicConfig.faultType'),
  EQUIP_FAULT_CAUSE: $t('repair.repairBasicConfig.equipFaultCause'),
  REPAIR_PAUSE_REASON: $t('repair.repairBasicConfig.repairPauseReason'),
  EQUIPMENT_OEE_REASON: $t('repair.repairBasicConfig.equipmentOeeReason'),
  OEE_REASON: $t('repair.repairBasicConfig.oeeReason'),
  MOLD_MAINTENANCE_ITEM: $t('repair.repairBasicConfig.moldMaintenanceItem'),
  MOLD_ABNORMAL_REASON: $t('repair.repairBasicConfig.moldAbnormalReason'),
};

// ========== 是否显示维修组编码（设备分组、设备稼动设定、稼动原因时显示） ==========
const showRepairGroupCode = computed(() =>
  ['EQUIPMENT_GROUP', 'EQUIPMENT_OEE_REASON', 'OEE_REASON'].includes(
    props.configType,
  ),
);

// ========== 是否显示保养要求/标准（模具保养项目时显示） ==========
const isMoldMaintenanceItem = computed(
  () => props.configType === 'MOLD_MAINTENANCE_ITEM',
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

      <FormItem
        v-if="isMoldMaintenanceItem"
        :label="$t('repair.repairBasicConfig.itemRequirement')"
      >
        <Input
          v-model:value="formData.itemRequirement"
          :placeholder="`请输入${$t('repair.repairBasicConfig.itemRequirement')}`"
        />
      </FormItem>

      <FormItem
        v-if="isMoldMaintenanceItem"
        :label="$t('repair.repairBasicConfig.itemStandard')"
      >
        <Input
          v-model:value="formData.itemStandard"
          :placeholder="`请输入${$t('repair.repairBasicConfig.itemStandard')}`"
        />
      </FormItem>

      <!-- <FormItem :label="$t('repair.repairBasicConfig.sortOrder')">
        <InputNumber
          v-model:value="formData.sortOrder"
          :min="0"
          :placeholder="`请输入${$t('repair.repairBasicConfig.sortOrder')}`"
          class="!w-full"
        />
      </FormItem> -->

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
