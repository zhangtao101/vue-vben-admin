<script lang="ts" setup>
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
function handleClose() {
  drawerVisible.value = false;
  resetForm();
}

// ========== 提交表单 ==========
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
