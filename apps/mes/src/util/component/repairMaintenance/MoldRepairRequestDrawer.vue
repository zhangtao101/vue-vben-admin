<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、repairRequest.service API、moldArchiveMgmt.service API
 * [OUTPUT]: 对外提供模具报修单申请抽屉组件，含保存、提交功能
 * [POS]: 设备管理模块 的模具报修单申请抽屉
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-19 13:10:00
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
import { getMoldArchiveSelectList } from '#/api/equipManagement/moldArchiveMgmt.service';
import { getRepairBasicConfigList } from '#/api/equipManagement/repairBasicConfig.service';
import { $t } from '#/locales';

// ========== Props & Emits ==========
/** 抽屉可见性 */
interface Props {
  visible?: boolean;
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
  moldCode: '',
  moldName: undefined as string | undefined,
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
  moldCode: [
    {
      required: true,
      message: $t('repair.moldRepair.moldCodeRequired'),
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

/** 模具列表选项 */
const moldOptions = ref<{ label: string; moldName?: string; value: string }[]>(
  [],
);

// ========== 初始化下拉选项 ==========
/**
 * 初始化下拉选项数据。
 * @returns {void} 无返回值。
 * @since 2026-05-19 13:10:00
 */
function initOptions() {
  // 获取紧急程度
  getRepairBasicConfigList({
    configType: 'URGENT_LEVEL',
    status: 'ACTIVE',
  }).then((res: any) => {
    urgentLevelOptions.value = ((res || []) as any[]).map((item: any) => ({
      label: item.configName,
      value: item.configCode,
    }));
  });
}

/**
 * 加载报修单数据（编辑模式）。
 * @returns {void} 无返回值。
 * @since 2026-05-19 13:10:00
 */
function loadData() {
  if (!props.editId) {
    // 新增模式，重置表单
    handleReset();
    return;
  }
  // 编辑模式，加载数据
  loading.value = true;
  getRepairRequestById(props.editId)
    .then((data: any) => {
      formData.value = {
        moldCode: data.moldCode || data.equipmentCode || '',
        moldName: data.moldName || data.equipmentName,
        repairType: data.repairType || '',
        urgentLevel: data.urgentLevel || 'NORMAL',
        repairContent: data.repairContent || '',
        faultName: data.faultName,
        relatedTaskId: data.relatedTaskId ?? undefined,
        acceptPeriod: data.acceptPeriod || 60,
      };
    })
    .finally(() => {
      loading.value = false;
    });
}

/**
 * 搜索模具列表。
 * @param {string} value - 搜索关键词
 * @returns {void} 无返回值。
 * @since 2026-05-19 13:10:00
 */
function searchMold(value: string) {
  if (!value || value.length < 2) {
    moldOptions.value = [];
    return;
  }
  getMoldArchiveSelectList({ keyword: value }).then((res: any) => {
    moldOptions.value = ((res || []) as any[]).map((item: any) => ({
      label: `${item.moldCode} - ${item.moldName}`,
      value: item.moldCode,
      moldName: item.moldName,
    }));
  });
}

/** 选中的模具名称 */
const selectedMoldName = computed(() => {
  const selected = moldOptions.value.find(
    (item) => item.value === formData.value.moldCode,
  );
  if (formData.value.moldName) {
    return formData.value.moldName;
  }
  return selected?.moldName || '';
});

/**
 * 模具选择变化处理。
 * @param {any} value - 选中的模具编码
 * @returns {void} 无返回值。
 * @since 2026-05-19 13:10:00
 */
function handleMoldChange(value: any) {
  const selected = moldOptions.value.find((item) => item.value === value);
  formData.value.moldName = selected?.moldName || undefined;
}

// ========== 操作 ==========
/**
 * 关闭抽屉。
 * @returns {void} 无返回值。
 * @since 2026-05-19 13:10:00
 */
function handleClose() {
  drawerVisible.value = false;
}

/**
 * 重置表单。
 * @returns {void} 无返回值。
 * @since 2026-05-19 13:10:00
 */
function handleReset() {
  formData.value = {
    moldCode: '',
    moldName: undefined,
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
 * @since 2026-05-19 13:10:00
 */
function handleSave() {
  formRef.value
    .validateFields()
    .then(() => {
      loading.value = true;
      const params: any = {
        id: props.editId,
        equipmentCode: formData.value.moldCode,
        equipmentName: formData.value.moldName,
        repairType: formData.value.repairType,
        urgentLevel: formData.value.urgentLevel,
        repairContent: formData.value.repairContent,
        faultName: formData.value.faultName,
        relatedTaskId: formData.value.relatedTaskId,
        acceptPeriod: formData.value.acceptPeriod,
        // 模具报修单额外字段
        assetType: 'MOLD',
        moldCode: formData.value.moldCode,
        moldName: formData.value.moldName,
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
    })
    .catch(() => {
      // 验证失败
    });
}

/**
 * 提交报修单。
 * @returns {void} 无返回值。
 * @since 2026-05-19 13:10:00
 */
function handleSubmit() {
  formRef.value
    .validateFields()
    .then(() => {
      loading.value = true;
      const params: any = {
        id: props.editId,
        moldCode: formData.value.moldCode,
        moldName: formData.value.moldName,
        repairType: formData.value.repairType,
        urgentLevel: formData.value.urgentLevel,
        repairContent: formData.value.repairContent,
        faultName: formData.value.faultName,
        relatedTaskId: formData.value.relatedTaskId,
        acceptPeriod: formData.value.acceptPeriod,
        // 模具报修单额外字段
        assetType: 'MOLD',
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
    })
    .catch(() => {
      // 验证失败
    });
}

// ========== 初始化 ==========
initOptions();
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :title="
      isEdit ? $t('repair.moldRepair.editTitle') : $t('repair.moldRepair.title')
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
      <!-- 模具编码 -->
      <FormItem :label="$t('repair.moldRepair.moldCode')" name="moldCode">
        <Select
          v-model:value="formData.moldCode"
          show-search
          :placeholder="$t('repair.moldRepair.moldCodePlaceholder')"
          :default-active-first-option="false"
          :show-arrow="false"
          :filter-option="false"
          :not-found-content="null"
          :options="moldOptions"
          @search="searchMold"
          @change="handleMoldChange"
        />
      </FormItem>

      <!-- 模具名称 -->
      <FormItem :label="$t('repair.moldRepair.moldName')">
        <Input :value="selectedMoldName" disabled />
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
