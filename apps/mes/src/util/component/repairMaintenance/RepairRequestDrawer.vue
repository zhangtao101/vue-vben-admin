<script lang="ts" setup>
import type { SaveRepairRequestParams } from '#/api';

/**
 * [INPUT]: 依赖 ant-design-vue、repairRequest.service API、equipmentInfo.service API
 * [OUTPUT]: 对外提供报修单申请抽屉组件，含保存、提交功能
 * [POS]: 维修维护模块 的报修单申请抽屉
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-14 08:52:00
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
  Select,
  Space,
} from 'ant-design-vue';

import {
  getRepairRequestById,
  saveRepairRequest,
  submitRepairRequest,
} from '#/api';
import { fuzzyQueryOfEquipmentNumber } from '#/api/equipManagement/equipMaintenance.service';
import { getRepairBasicConfigList } from '#/api/equipManagement/repairBasicConfig.service';
import { $t } from '#/locales';

// ========== Props & Emits ==========
/** 抽屉可见性 */
interface Props {
  visible: boolean;
  /** 编辑时的报修单ID，不传则表示新增 */
  editId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  editId: undefined,
});

/** 事件发射 */
const emit = defineEmits<{
  success: [];
  'update:visible': [value: boolean];
}>();

/** 是否为编辑模式 */
const isEdit = computed(() => !!props.editId);

// ========== 抽屉状态 ==========
/** 抽屉可见性 */
const drawerVisible = ref(props.visible);

/** 监听 props.visible 变化 */
watch(
  () => props.visible,
  (val) => {
    drawerVisible.value = val;
    if (val) {
      // 打开抽屉时加载数据
      loadData();
    }
  },
);

/** 监听抽屉可见性变化 */
watch(drawerVisible, (val) => {
  emit('update:visible', val);
});

/** 表单引用 */
const formRef = ref<any>();

/** 抽屉加载状态 */
const loading = ref(false);

// ========== 表单数据 ==========
/** 报修单表单数据 */
const formData = ref({
  equipmentCode: '',
  equipmentName: undefined as string | undefined,
  repairType: '',
  urgentLevel: 'NORMAL',
  repairContent: '',
  faultName: undefined as string | undefined,
  relatedTaskId: undefined as number | undefined,
  acceptPeriod: 60,
});

// ========== 表单验证规则 ==========
/** 表单验证规则 */
const rules: Record<string, any[]> = {
  equipmentCode: [
    {
      required: true,
      message: $t('repair.repairRequest.equipmentCodeRequired'),
    },
  ],
  repairType: [
    { required: true, message: $t('repair.repairRequest.repairTypeRequired') },
  ],
  urgentLevel: [
    { required: true, message: $t('repair.repairRequest.urgentLevelRequired') },
  ],
  repairContent: [
    {
      required: true,
      message: $t('repair.repairRequest.repairContentRequired'),
    },
  ],
  acceptPeriod: [
    {
      required: true,
      message: $t('repair.repairRequest.acceptPeriodRequired'),
    },
  ],
};

// ========== 下拉选项 ==========
/** 报修类型选项 */
const repairTypeOptions = [
  { label: '应急维修', value: 'EMERGENCY' },
  { label: '安灯呼叫', value: 'ANDON' },
  { label: '预防性维护', value: 'PREVENTIVE' },
  { label: '点巡检', value: 'INSPECTION' },
  { label: '保养报修', value: 'MAINTENANCE' },
  { label: '日常生产报修', value: 'DAILY' },
  { label: '其他', value: 'OTHER' },
];

/** 紧急程度选项 */
const urgentLevelOptions = ref<{ label: string; value: string }[]>([]);

/** 设备列表选项 */
const equipmentOptions = ref<
  { equipmentName?: string; label: string; value: string }[]
>([]);

// ========== 初始化下拉选项 ==========
/**
 * 初始化下拉选项数据。
 * @returns {void} 无返回值。
 * @since 2026-05-14 08:52:00
 */
async function initOptions() {
  // 获取紧急程度
  const urgentRes = await getRepairBasicConfigList({
    configType: 'URGENT_LEVEL',
    status: 'ACTIVE',
  });
  urgentLevelOptions.value = ((urgentRes || []) as any[]).map((item: any) => ({
    label: item.configName,
    value: item.configCode,
  }));
}

/**
 * 加载报修单数据（编辑模式）。
 * @returns {void} 无返回值。
 * @since 2026-05-14 10:30:00
 */
async function loadData() {
  if (!props.editId) {
    // 新增模式，重置表单
    handleReset();
    return;
  }
  // 编辑模式，加载数据
  try {
    loading.value = true;
    const data: any = await getRepairRequestById(props.editId);
    formData.value = {
      equipmentCode: data.equipmentCode || '',
      equipmentName: data.equipmentName,
      repairType: data.repairType || '',
      urgentLevel: data.urgentLevel || 'NORMAL',
      repairContent: data.repairContent || '',
      faultName: data.faultName,
      relatedTaskId: data.relatedTaskId ?? undefined,
      acceptPeriod: data.acceptPeriod || 60,
    };
  } finally {
    loading.value = false;
  }
}

/**
 * 搜索设备列表。
 * @param {string} value - 搜索关键词
 * @returns {void} 无返回值。
 * @since 2026-05-14 08:52:00
 */
function searchEquipment(value: string) {
  if (!value || value.length < 2) {
    equipmentOptions.value = [];
    return;
  }
  fuzzyQueryOfEquipmentNumber({ equipmentCode: value }).then((res: any) => {
    equipmentOptions.value = ((res || []) as any[]).map((item: any) => ({
      label: `${item.equipmentCode} - ${item.equipmentName}`,
      value: item.equipmentCode,
      equipmentName: item.equipmentName,
    }));
  });
}

/** 选中的设备名称 */
const selectedEquipmentName = computed(() => {
  const selected = equipmentOptions.value.find(
    (item) => item.value === formData.value.equipmentCode,
  );
  if (formData.value.equipmentName) {
    return formData.value.equipmentName;
  }
  return selected?.equipmentName || '';
});

/**
 * 设备选择变化处理。
 * @param {any} value - 选中的设备编码
 * @returns {void} 无返回值。
 * @since 2026-05-14 08:52:00
 */
function handleEquipmentChange(value: any) {
  const selected = equipmentOptions.value.find((item) => item.value === value);
  formData.value.equipmentName = selected?.equipmentName || undefined;
}

// ========== 操作 ==========
/**
 * 关闭抽屉。
 * @returns {void} 无返回值。
 * @since 2026-05-14 08:52:00
 */
function handleClose() {
  drawerVisible.value = false;
}

/**
 * 重置表单。
 * @returns {void} 无返回值。
 * @since 2026-05-14 08:52:00
 */
function handleReset() {
  formData.value = {
    equipmentCode: '',
    equipmentName: undefined,
    repairType: '',
    urgentLevel: 'NORMAL',
    repairContent: '',
    faultName: undefined,
    relatedTaskId: undefined,
    acceptPeriod: 60,
  };
  formRef.value?.resetFields();
}

/**
 * 保存草稿。
 * @returns {void} 无返回值。
 * @since 2026-05-14 08:52:00
 */
async function handleSave() {
  try {
    await formRef.value.validateFields();
    loading.value = true;
    const params: SaveRepairRequestParams = {
      id: props.editId,
      equipmentCode: formData.value.equipmentCode,
      equipmentName: formData.value.equipmentName,
      repairType: formData.value.repairType,
      urgentLevel: formData.value.urgentLevel,
      repairContent: formData.value.repairContent,
      faultName: formData.value.faultName,
      relatedTaskId: formData.value.relatedTaskId,
      acceptPeriod: formData.value.acceptPeriod,
    };
    saveRepairRequest(params)
      .then(() => {
        message.success($t('common.successfulOperation'));
        handleClose();
        emit('success');
        handleReset();
      })
      .finally(() => {
        loading.value = false;
      });
  } catch {
    // 验证失败
  }
}

/**
 * 提交报修单。
 * @returns {void} 无返回值。
 * @since 2026-05-14 08:52:00
 */
async function handleSubmit() {
  try {
    await formRef.value.validateFields();
    loading.value = true;
    const params: SaveRepairRequestParams = {
      id: props.editId,
      equipmentCode: formData.value.equipmentCode,
      equipmentName: formData.value.equipmentName,
      repairType: formData.value.repairType,
      urgentLevel: formData.value.urgentLevel,
      repairContent: formData.value.repairContent,
      faultName: formData.value.faultName,
      relatedTaskId: formData.value.relatedTaskId,
      acceptPeriod: formData.value.acceptPeriod,
    };
    submitRepairRequest(params)
      .then(() => {
        message.success($t('common.successfulOperation'));
        handleClose();
        emit('success');
        handleReset();
      })
      .finally(() => {
        loading.value = false;
      });
  } catch {
    // 验证失败
  }
}

// ========== 初始化 ==========
initOptions();
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :title="
      isEdit
        ? $t('repair.repairRequest.editTitle')
        : $t('repair.repairRequest.title')
    "
    width="600"
    :destroy-on-close="true"
    :footer-style="{ textAlign: 'right' }"
    @close="handleClose"
  >
    <Form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <!-- 设备编码 -->
      <FormItem
        :label="$t('repair.repairOrder.equipmentCode')"
        name="equipmentCode"
      >
        <Select
          v-model:value="formData.equipmentCode"
          show-search
          :placeholder="$t('repair.repairRequest.equipmentCodePlaceholder')"
          :default-active-first-option="false"
          :show-arrow="false"
          :filter-option="false"
          :not-found-content="null"
          :options="equipmentOptions"
          @search="searchEquipment"
          @change="handleEquipmentChange"
        />
      </FormItem>

      <!-- 设备名称 -->
      <FormItem :label="$t('repair.repairOrder.equipmentName')">
        <Input :value="selectedEquipmentName" disabled />
      </FormItem>

      <!-- 报修类型 -->
      <FormItem :label="$t('repair.repairOrder.repairType')" name="repairType">
        <Select
          v-model:value="formData.repairType"
          :placeholder="$t('repair.repairRequest.repairTypePlaceholder')"
          :options="repairTypeOptions"
        />
      </FormItem>

      <!-- 紧急程度 -->
      <FormItem
        :label="$t('repair.repairOrder.urgentLevel')"
        name="urgentLevel"
      >
        <Select
          v-model:value="formData.urgentLevel"
          :placeholder="$t('repair.repairRequest.urgentLevelPlaceholder')"
          :options="urgentLevelOptions"
        />
      </FormItem>

      <!-- 故障现象 -->
      <FormItem :label="$t('repair.repairOrder.faultName')" name="faultName">
        <Input
          v-model:value="formData.faultName"
          :placeholder="$t('repair.repairRequest.faultNamePlaceholder')"
          :maxlength="100"
          show-count
        />
      </FormItem>

      <!-- 维修内容 -->
      <FormItem
        :label="$t('repair.repairRequest.repairContent')"
        name="repairContent"
      >
        <Input.TextArea
          v-model:value="formData.repairContent"
          :placeholder="$t('repair.repairRequest.repairContentPlaceholder')"
          :rows="4"
          :maxlength="500"
          show-count
        />
      </FormItem>

      <!-- 接收时限 -->
      <FormItem
        :label="$t('repair.repairRequest.acceptPeriod')"
        name="acceptPeriod"
      >
        <InputNumber
          v-model:value="formData.acceptPeriod"
          :min="1"
          :max="9999"
          style="width: 100%"
          :addon-after="$t('repair.repairRequest.minutes')"
        />
      </FormItem>
    </Form>

    <!-- 底部按钮插槽 -->
    <template #footer>
      <Space>
        <Button @click="handleClose">
          {{ $t('common.cancel') }}
        </Button>
        <Button @click="handleReset">
          {{ $t('common.reset') }}
        </Button>
        <Button :loading="loading" @click="handleSave">
          {{ $t('common.save') }}
        </Button>
        <Button type="primary" :loading="loading" @click="handleSubmit">
          {{ $t('common.submit') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
