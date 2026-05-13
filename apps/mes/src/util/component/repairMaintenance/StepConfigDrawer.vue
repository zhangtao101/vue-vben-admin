<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue 的抽屉、表单组件
 * [OUTPUT]: 对外提供步骤配置抽屉组件
 * [POS]: 维修流程配置抽屉的子抽屉，用于新增/编辑流程步骤
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-13 08:38:00
 */

import { computed, onMounted, ref, watch } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Col,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  SelectOption,
  Space,
  Switch,
} from 'ant-design-vue';

import { getFlowConfigById, getHandlerOptions, saveFlowConfig, searchBaseConfig } from '#/api';
import type { FlowStep, HandlerOptions } from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'StepConfigDrawer',
});

const props = withDefaults(defineProps<Props>(), {
  open: false,
  step: null,
  stepIndex: -1,
  flowConfigId: null,
});

const emit = defineEmits<{
  success: [step: FlowStep, index: number];
  'update:open': [value: boolean];
}>();

// ========== Props & Emits ==========
interface Props {
  open?: boolean;
  step?: FlowStep | null;
  stepIndex?: number;
  flowConfigId?: null | number | string; // 维修流程配置ID，用于查询详情
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

// ========== 监听抽屉打开，加载流程配置详情 ==========
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && props.flowConfigId) {
      // 编辑模式：加载详情
      getFlowConfigById(props.flowConfigId as number).then((data: any) => {
        stepForm.value = {
          ...data,
        };
      });
    }
  },
);

// ========== 抽屉标题 ==========
const drawerTitle = computed(() =>
  props.step?.configName
    ? $t('repair.repairProcessConfig.stepEditTitle')
    : $t('repair.repairProcessConfig.stepAddTitle'),
);

// ========== 处理人选项 ==========
const handlerOptions = ref<HandlerOptions>({
  handlerUsers: [],
});

/**
 * 获取处理人选项数据。
 * @returns {Promise<void>} 无返回值。
 * @since 2026-05-13 08:38:00
 */
function fetchHandlerOptions() {
  getHandlerOptions().then((data) => {
    handlerOptions.value = data || { handlerUsers: [] };
  });
}

// ========== 通用设备组选项 ==========
const equipmentGroupOptions = ref<{ label: string; value: string }[]>([]);

/**
 * 加载通用设备组选项。
 * @returns {void} 无返回值。
 * @since 2026-05-13 08:54:00
 */
function loadEquipmentGroupOptions() {
  searchBaseConfig({ configType: 'EQUIPMENT_GROUP' }).then((res: any[]) => {
    equipmentGroupOptions.value = (res || []).map((item: any) => ({
      label: item.configName,
      value: item.configCode,
    }));
  });
}

// ========== 步骤表单数据 ==========
const stepForm = ref<Partial<FlowStep>>({
  configCode: '',
  configName: '',
  equipmentGroup: undefined as string | undefined,
  steps: [],
});

// ========== 步骤配置方法 ==========
/**
 * 新增步骤。
 * @returns {void} 无返回值。
 * @since 2026-05-13 09:29:00
 */
function handleAddRuleConfig() {
  if (!stepForm.value.steps) {
    stepForm.value.steps = [];
  }
  stepForm.value.steps.push({
    handlerUsers: '',
    allowClose: false,
    timeoutRules: [],
  });
}

/**
 * 删除步骤。
 * @param {number} index - 要删除的步骤索引
 * @returns {void} 无返回值。
 * @since 2026-05-13 09:29:00
 */
function handleDeleteRuleConfig(index: number) {
  Modal.confirm({
    title: $t('repair.repairProcessConfig.confirmDeleteStep'),
    content: $t('repair.repairProcessConfig.confirmDeleteStepContent'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    okType: 'danger',
    onOk() {
      stepForm.value.steps?.splice(index, 1);
    },
  });
}

/**
 * 上移步骤。
 * @param {number} index - 要上移的步骤索引
 * @returns {void} 无返回值。
 * @since 2026-05-13 09:33:00
 */
function handleMoveUp(index: number) {
  if (index <= 0 || !stepForm.value.steps) return;
  const configs = stepForm.value.steps;
  [configs[index - 1], configs[index]] = [
    configs[index] as any,
    configs[index - 1] as any,
  ];
}

/**
 * 下移步骤。
 * @param {number} index - 要下移的步骤索引
 * @returns {void} 无返回值。
 * @since 2026-05-13 09:33:00
 */
function handleMoveDown(index: number) {
  if (!stepForm.value.steps || index >= stepForm.value.steps.length - 1) return;
  const configs = stepForm.value.steps;
  [configs[index], configs[index + 1]] = [
    configs[index + 1] as any,
    configs[index] as any,
  ];
}

/**
 * 新增超时规则。
 * @param {number} ruleConfigIndex - 步骤的索引
 * @returns {void} 无返回值。
 * @since 2026-05-13 09:29:00
 */
function handleAddTimeoutRule(ruleConfigIndex: number) {
  const ruleConfig = stepForm.value.steps?.[ruleConfigIndex];
  if (ruleConfig) {
    if (!ruleConfig.timeoutRules) {
      ruleConfig.timeoutRules = [];
    }
    ruleConfig.timeoutRules.push({
      timeoutMinutes: 0,
      timeoutHandlerUser: '',
      canComplete: false,
    });
  }
}

/**
 * 删除超时规则。
 * @param {number} ruleConfigIndex - 步骤的索引
 * @param {number} timeoutRuleIndex - 超时规则的索引
 * @returns {void} 无返回值。
 * @since 2026-05-13 09:29:00
 */
function handleDeleteTimeoutRule(
  ruleConfigIndex: number,
  timeoutRuleIndex: number,
) {
  Modal.confirm({
    title: $t('repair.repairProcessConfig.confirmDeleteTimeoutRule'),
    content: $t('repair.repairProcessConfig.confirmDeleteTimeoutRuleContent'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    okType: 'danger',
    onOk() {
      const ruleConfig = stepForm.value.steps?.[ruleConfigIndex];
      ruleConfig?.timeoutRules?.splice(timeoutRuleIndex, 1);
    },
  });
}

/**
 * 重置步骤表单数据。
 * @returns {void} 无返回值。
 * @since 2026-05-13 08:38:00
 */
function resetStepForm() {
  stepForm.value = {
    configCode: '',
    configName: '',
    equipmentGroup: undefined,
    steps: [],
  };
}

// ========== 监听 step 变化，自动填充表单 ==========
watch(
  () => props.step,
  (newStep) => {
    if (newStep?.configName) {
      stepForm.value = { ...newStep };
    } else {
      resetStepForm();
    }
  },
  { immediate: true },
);

// ========== 表单验证规则 ==========
const rules: Record<string, any[]> = {
  configCode: [
    {
      required: true,
      message: `请输入${$t('repair.repairProcessConfig.configCode')}`,
    },
  ],
  configName: [
    {
      required: true,
      message: `请输入${$t('repair.repairProcessConfig.configName')}`,
    },
  ],
  handlerUsers: [
    {
      required: true,
      message: `请选择${$t('repair.repairProcessConfig.handlerUsers')}`,
    },
  ],
};

const formRef = ref<any>();

// ========== 关闭抽屉 ==========
/**
 * 关闭抽屉并重置表单。
 * @returns {void} 无返回值。
 * @since 2026-05-13 08:38:00
 */
function handleClose() {
  drawerVisible.value = false;
  resetStepForm();
}

// ========== 提交表单 ==========
/**
 * 提交步骤表单数据。
 * @returns {void} 无返回值，成功后触发 success 事件。
 * @since 2026-05-13 08:38:00
 */
function handleSubmit() {
  formRef.value
    .validate()
    .then(() => {
      // 为每个步骤添加 stepOrder，从 1 开始
      if (stepForm.value.steps) {
        stepForm.value.steps.forEach((step: any, index) => {
          step.stepOrder = index + 1;
        });
      }

      const params: any = {
        ...stepForm.value,
        id: props.flowConfigId,
      };
      saveFlowConfig(params)
        .then(() => {
          message.success($t('common.successfulOperation'));
          emit('success', stepForm.value as FlowStep, props.stepIndex);
          handleClose();
        })
        .catch(() => {
          message.error($t('common.operationFailed'));
        });
    })
    .catch(() => {
      // 验证失败
    });
}

// ========== 组件挂载时获取处理人选项 ==========
onMounted(() => {
  fetchHandlerOptions();
  loadEquipmentGroupOptions();
});
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :title="drawerTitle"
    height="80%"
    placement="top"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <Form
      ref="formRef"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
      :model="stepForm"
      :rules="rules"
    >
      <div class="font-medium mb-2 mt-4 text-xl font-bold">
        {{ $t('repair.repairProcessConfig.basicConfigTitle') }}
      </div>

      <Row :gutter="16">
        <Col :span="12">
          <FormItem
            :label="$t('repair.repairProcessConfig.configCode')"
            name="configCode"
          >
            <Input
              v-model:value="stepForm.configCode"
              :placeholder="`请输入${$t('repair.repairProcessConfig.configCode')}`"
            />
          </FormItem>
        </Col>
        <Col :span="12">
          <FormItem
            :label="$t('repair.repairProcessConfig.configName')"
            name="configName"
          >
            <Input
              v-model:value="stepForm.configName"
              :placeholder="`请输入${$t('repair.repairProcessConfig.configName')}`"
            />
          </FormItem>
        </Col>
      </Row>

      <!-- 关联设备区域 -->
      <div class="font-medium mb-2 mt-4 text-xl font-bold">
        {{ $t('repair.repairProcessConfig.relatedEquipmentTitle') }}
      </div>

      <Row :gutter="16">
        <Col :span="12">
          <FormItem :label="$t('repair.repairProcessConfig.equipmentGroup')">
            <Select
              v-model:value="stepForm.equipmentGroup"
              :placeholder="`请选择${$t('repair.repairProcessConfig.equipmentGroup')}`"
              allow-clear
              :options="equipmentGroupOptions"
            />
          </FormItem>
        </Col>
      </Row>

      <!-- 步骤配置列表 -->
      <div class="font-medium mb-2 mt-4 text-xl font-bold">
        {{ $t('repair.repairProcessConfig.stepConfigs') }}
      </div>

      <div class="mb-4">
        <Button type="primary" @click="handleAddRuleConfig">
          <Icon icon="mdi:plus" class="inline-block align-middle" />
          {{ $t('repair.repairProcessConfig.addStep') }}
        </Button>
      </div>

      <div v-if="stepForm.steps && stepForm.steps.length > 0">
        <div
          v-for="(ruleConfig, ruleConfigIndex) in stepForm.steps"
          :key="ruleConfigIndex"
          class="rule-config-item mb-4"
        >
          <div class="rule-config-header">
            <Space>
              <Button
                type="link"
                :disabled="ruleConfigIndex <= 0"
                @click="handleMoveUp(ruleConfigIndex)"
              >
                <Icon icon="mdi:arrow-up" class="inline-block text-xl" />
              </Button>
              <Button
                type="link"
                :disabled="ruleConfigIndex >= stepForm.steps.length - 1"
                @click="handleMoveDown(ruleConfigIndex)"
              >
                <Icon icon="mdi:arrow-down" class="inline-block text-xl" />
              </Button>
            </Space>
            <span class="font-medium ml-2"
              >{{ $t('repair.repairProcessConfig.step') }}
              {{ ruleConfigIndex + 1 }}</span
            >
            <Button
              type="link"
              danger
              @click="handleDeleteRuleConfig(ruleConfigIndex)"
            >
              <Icon icon="mdi:delete-outline" class="inline-block text-xl" />
            </Button>
          </div>

          <!-- 第一层：处理人和允许关闭 -->
          <Row :gutter="16" class="mb-4">
            <Col :span="12">
              <FormItem
                :label="$t('repair.repairProcessConfig.handlerUsers')"
                :name="['steps', ruleConfigIndex, 'handlerUsers']"
              >
                <Select
                  v-model:value="ruleConfig.handlerUsers"
                  allow-clear
                  :placeholder="`请选择${$t('repair.repairProcessConfig.handlerUsers')}`"
                >
                  <SelectOption
                    v-for="user in handlerOptions.handlerUsers"
                    :key="user.value"
                    :value="user.value"
                  >
                    {{ user.label }}
                  </SelectOption>
                </Select>
              </FormItem>
            </Col>
            <Col :span="12">
              <FormItem
                :label="$t('repair.repairProcessConfig.allowClose')"
                :name="['steps', ruleConfigIndex, 'allowClose']"
              >
                <Switch v-model:checked="ruleConfig.allowClose" />
              </FormItem>
            </Col>
          </Row>

          <!-- 第二层：超时规则列表 -->
          <div class="timeout-rules-section">
            <div class="font-medium mb-2 text-base">
              {{ $t('repair.repairProcessConfig.timeoutRules') }}
            </div>

            <div class="mb-4">
              <Button
                size="small"
                @click="handleAddTimeoutRule(ruleConfigIndex)"
              >
                <Icon icon="mdi:plus" class="inline-block align-middle" />
                {{ $t('repair.repairProcessConfig.addTimeoutRule') }}
              </Button>
            </div>

            <div
              v-if="
                ruleConfig.timeoutRules && ruleConfig.timeoutRules.length > 0
              "
            >
              <Row
                v-for="(
                  timeoutRule, timeoutRuleIndex
                ) in ruleConfig.timeoutRules"
                :key="timeoutRuleIndex"
                :gutter="16"
                class="timeout-rule-item mb-3"
              >
                <Col :span="12">
                  <FormItem
                    :label="$t('repair.repairProcessConfig.timeoutMinutes')"
                  >
                    <InputNumber
                      v-model:value="timeoutRule.timeoutMinutes"
                      :min="1"
                      class="!w-full"
                      :placeholder="`${$t('repair.repairProcessConfig.timeoutMinutes')}`"
                    />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem
                    :label="$t('repair.repairProcessConfig.timeoutHandlerUser')"
                  >
                    <Select
                      v-model:value="timeoutRule.timeoutHandlerUser"
                      allow-clear
                      :placeholder="`请选择${$t('repair.repairProcessConfig.timeoutHandlerUser')}`"
                    >
                      <SelectOption
                        v-for="user in handlerOptions.handlerUsers"
                        :key="user.value"
                        :value="user.value"
                      >
                        {{ user.label }}
                      </SelectOption>
                    </Select>
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem
                    :label="$t('repair.repairProcessConfig.canComplete')"
                  >
                    <Switch v-model:checked="timeoutRule.canComplete" />
                  </FormItem>
                </Col>
                <Col :span="12" class="flex items-end justify-center pb-6">
                  <Button
                    type="link"
                    danger
                    @click="
                      handleDeleteTimeoutRule(ruleConfigIndex, timeoutRuleIndex)
                    "
                    class="float-right"
                  >
                    <Icon
                      icon="mdi:delete-outline"
                      class="inline-block text-xl"
                    />
                  </Button>
                </Col>
              </Row>
            </div>

            <div v-else class="text-gray-400 text-center py-4">
              {{ $t('repair.repairProcessConfig.noTimeoutRules') }}
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-gray-400 text-center py-8">
        {{ $t('repair.repairProcessConfig.noRuleConfigs') }}
      </div>
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

<style scoped>
.rule-config-item {
  padding: 16px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}

.rule-config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.timeout-rules-section {
  padding: 12px;
  background: #fff;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
}

.timeout-rule-item {
  padding: 12px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}
</style>
