<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue 的抽屉、表单、选择器组件，以及 createSparePart、getSparePartById、searchBaseConfig、updateSparePart API
 * [OUTPUT]: 对外提供备件抽屉组件
 * [POS]: 维修维护模块 的备件管理抽屉，支持新增/编辑/查看备件信息
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-20 16:16:00
 */
import { computed, onMounted, ref, watch } from 'vue';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Select,
  SelectOption,
  Space,
} from 'ant-design-vue';

import {
  createSparePart,
  getSparePartById,
  searchBaseConfig,
  updateSparePart,
} from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'SparePartDrawer',
});

const props = withDefaults(defineProps<Props>(), {
  open: false,
  mode: 'add',
  row: null,
});

const emit = defineEmits<{
  success: [];
  'update:open': [value: boolean];
}>();

// ========== Props & Emits ==========
interface Props {
  open?: boolean;
  mode?: 'add' | 'edit' | 'view';
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
const drawerTitle = computed(() => {
  if (props.mode === 'view') {
    return $t('repair.sparePart.detailTitle');
  }
  return props.row?.id
    ? $t('repair.sparePart.editTitle')
    : $t('repair.sparePart.addTitle');
});

// ========== 是否可编辑 ==========
const isEditable = computed(() => props.mode !== 'view');

// ========== 下拉选项 ==========
const spareTypeOptions = ref<any[]>([]);
const equipmentGroupOptions = ref<any[]>([]);

/**
 * 加载备件类型和设备组下拉选项。
 * @returns {void} 无返回值
 * @throws {Error} 调用 searchBaseConfig 接口失败时抛出
 * @since 2026-04-20 16:16:00
 */
function loadOptions() {
  searchBaseConfig({ configType: 'SPARE_TYPE' }).then((res: any[]) => {
    spareTypeOptions.value = (res || []).map((item: any) => ({
      label: item.configName,
      value: item.configCode,
    }));
  });
  searchBaseConfig({ configType: 'EQUIPMENT_GROUP' }).then((res: any[]) => {
    equipmentGroupOptions.value = (res || []).map((item: any) => ({
      label: item.configName,
      value: item.configCode,
    }));
  });
}

onMounted(() => {
  loadOptions();
});

// ========== 下拉过滤方法 ==========
/**
 * 下拉选项过滤方法，支持拼音首字母搜索。
 * @param {string} input - 用户输入的搜索关键字
 * @param {any} option - 下拉选项对象
 * @returns {boolean} 是否匹配
 * @since 2026-04-20 16:16:00
 */
function filterOption(input: string, option: any) {
  return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
}

// ========== 表单数据 ==========
const formData = ref({
  spareCode: '',
  spareName: '',
  spareType: undefined as string | undefined,
  spareModel: '',
  equipmentGroup: undefined as string | undefined,
});

// ========== 重置表单 ==========
/**
 * 重置表单数据为默认值。
 * @returns {void} 无返回值
 * @since 2026-04-20 16:16:00
 */
function resetForm() {
  formData.value = {
    spareCode: '',
    spareName: '',
    spareType: undefined,
    spareModel: '',
    equipmentGroup: undefined,
  };
}

// ========== 监听 row 变化，自动填充表单 ==========
watch(
  () => props.row,
  (newRow) => {
    if (newRow?.id) {
      formData.value = { ...newRow };
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

// ========== 监听抽屉打开，加载详情 ==========
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (props.row?.id) {
        // 查看模式：调用接口获取详情
        getSparePartById(props.row.id).then((res: any) => {
          formData.value = { ...res };
        });
      } else if (!props.row?.id) {
        resetForm();
      }
    }
  },
);

// ========== 表单验证规则 ==========
const rules: Record<string, any[]> = {
  spareCode: [
    {
      required: true,
      message: `请输入${$t('repair.sparePart.spareCode')}`,
    },
  ],
  spareName: [
    {
      required: true,
      message: `请输入${$t('repair.sparePart.spareName')}`,
    },
  ],
};

const formRef = ref<any>();

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
 * 提交表单数据，包含表单验证、创建或更新备件信息。
 * @returns {void} 无返回值，成功后触发 success 事件
 * @throws {Error} 表单验证失败时不提交
 * @since 2026-04-20 16:16:00
 */
function handleSubmit() {
  formRef.value
    .validate()
    .then(() => {
      const api = props.row?.id ? updateSparePart : createSparePart;
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
    width="600"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <Form
      ref="formRef"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
      :model="formData"
      :rules="isEditable ? rules : {}"
    >
      <FormItem :label="$t('repair.sparePart.spareCode')" name="spareCode">
        <Input
          v-model:value="formData.spareCode"
          :placeholder="`请输入${$t('repair.sparePart.spareCode')}`"
          :disabled="!isEditable || !!props.row?.id"
        />
      </FormItem>

      <FormItem :label="$t('repair.sparePart.spareName')" name="spareName">
        <Input
          v-model:value="formData.spareName"
          :placeholder="`请输入${$t('repair.sparePart.spareName')}`"
          :disabled="!isEditable"
        />
      </FormItem>

      <FormItem :label="$t('repair.sparePart.spareType')">
        <Select
          v-model:value="formData.spareType"
          :placeholder="`请选择${$t('repair.sparePart.spareType')}`"
          :disabled="!isEditable"
          allow-clear
          show-search
          :filter-option="filterOption"
        >
          <SelectOption
            v-for="item in spareTypeOptions"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          >
            {{ item.label }}
          </SelectOption>
        </Select>
      </FormItem>

      <FormItem :label="$t('repair.sparePart.spareModel')">
        <Input
          v-model:value="formData.spareModel"
          :placeholder="`请输入${$t('repair.sparePart.spareModel')}`"
          :disabled="!isEditable"
        />
      </FormItem>

      <FormItem :label="$t('repair.sparePart.equipmentGroup')">
        <Select
          v-model:value="formData.equipmentGroup"
          :placeholder="`请选择${$t('repair.sparePart.equipmentGroup')}`"
          :disabled="!isEditable"
          allow-clear
          show-search
          :filter-option="filterOption"
        >
          <SelectOption
            v-for="item in equipmentGroupOptions"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          >
            {{ item.label }}
          </SelectOption>
        </Select>
      </FormItem>
    </Form>

    <template #footer>
      <div class="flex justify-end">
        <Space>
          <Button @click="handleClose">{{ $t('common.cancel') }}</Button>
          <Button v-if="isEditable" type="primary" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </div>
    </template>
  </Drawer>
</template>
