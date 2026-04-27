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
  Select,
  Space,
} from 'ant-design-vue';

import {
  createFaultTree,
  updateFaultTree,
} from '#/api/equipManagement/equipmentFailure.service';
import { $t } from '#/locales';

defineOptions({
  name: 'EquipmentFailureDrawer',
});

const props = withDefaults(defineProps<Props>(), {
  open: false,
  row: null,
  parentId: undefined,
  parentName: undefined,
  faultLevelOptions: () => [],
  equipmentGroupOptions: () => [],
});

const emit = defineEmits<{
  reloadTree: [];
  success: [];
  'update:open': [value: boolean];
}>();

// ========== Props & Emits ==========
interface Props {
  open?: boolean;
  row?: any;
  parentId?: string;
  parentName?: string;
  faultLevelOptions?: any[];
  equipmentGroupOptions?: any[];
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
    ? $t('repair.equipmentFailure.drawerEditTitle')
    : $t('repair.equipmentFailure.drawerAddTitle'),
);

// ========== 表单数据 ==========
const formData = ref({
  equipmentGroup: '',
  faultCode: '',
  faultName: '',
  faultLevelCode: undefined as string | undefined,
  faultDescription: '',
  solution: '',
  sortOrder: undefined as number | undefined,
  parentId: undefined as string | undefined,
});

// ========== 重置表单 ==========
function resetForm() {
  formData.value = {
    equipmentGroup: '',
    faultCode: '',
    faultName: '',
    faultLevelCode: undefined,
    faultDescription: '',
    solution: '',
    sortOrder: undefined,
    parentId: props.parentId,
  };
}

// ========== 监听 row 变化，自动填充表单 ==========
watch(
  () => props.row,
  (newRow) => {
    if (newRow?.id) {
      formData.value = {
        equipmentGroup: newRow.equipmentGroup || '',
        faultCode: newRow.faultCode || '',
        faultName: newRow.faultName || '',
        faultLevelCode: newRow.faultLevelCode || undefined,
        faultDescription: newRow.faultDescription || '',
        solution: newRow.solution || '',
        sortOrder: newRow.sortOrder,
        parentId: props.parentId,
      };
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

// ========== 监听抽屉打开，重置表单 ==========
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && !props.row?.id) {
      resetForm();
    }
  },
);

// ========== 表单验证规则 ==========
const rules: Record<string, any[]> = {
  equipmentGroup: [
    {
      required: true,
      message: `请选择${$t('repair.equipmentFailure.equipmentGroupCode')}`,
    },
  ],
  faultCode: [
    {
      required: true,
      message: `请输入${$t('repair.equipmentFailure.faultCode')}`,
    },
  ],
  faultName: [
    {
      required: true,
      message: `请输入${$t('repair.equipmentFailure.faultName')}`,
    },
  ],
  faultLevelCode: [
    {
      required: true,
      message: `请选择${$t('repair.repairBasicConfig.faultLevel')}`,
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
      const api = props.row?.id ? updateFaultTree : createFaultTree;
      const params: any = {
        ...formData.value,
        ...(props.row?.id ? { id: props.row.id } : {}),
      };
      api(params).then(() => {
        message.success($t('common.successfulOperation'));
        emit('success');
        emit('reloadTree');
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
      <FormItem label="父节点">
        <Input :value="props.parentName || props.parentId" disabled />
      </FormItem>

      <FormItem
        :label="$t('repair.equipmentFailure.equipmentGroupCode')"
        name="equipmentGroup"
      >
        <Select
          v-model:value="formData.equipmentGroup"
          placeholder="请选择"
          :options="equipmentGroupOptions"
          show-search
          :filter-option="
            (input: string, option: any) =>
              option.label.toLowerCase().includes(input.toLowerCase())
          "
        />
      </FormItem>

      <FormItem
        :label="$t('repair.equipmentFailure.faultCode')"
        name="faultCode"
      >
        <Input v-model:value="formData.faultCode" placeholder="请输入" />
      </FormItem>

      <FormItem
        :label="$t('repair.equipmentFailure.faultName')"
        name="faultName"
      >
        <Input v-model:value="formData.faultName" placeholder="请输入" />
      </FormItem>

      <FormItem
        :label="$t('repair.repairBasicConfig.faultLevel')"
        name="faultLevelCode"
      >
        <Select
          v-model:value="formData.faultLevelCode"
          placeholder="请选择"
          :options="
            faultLevelOptions?.filter((item) => item.value !== undefined) || []
          "
        />
      </FormItem>

      <FormItem :label="$t('repair.equipmentFailure.faultDescription')">
        <Input.TextArea
          v-model:value="formData.faultDescription"
          :rows="3"
          placeholder="请输入"
        />
      </FormItem>

      <FormItem :label="$t('repair.equipmentFailure.solution')">
        <Input.TextArea
          v-model:value="formData.solution"
          :rows="3"
          placeholder="请输入"
        />
      </FormItem>

      <FormItem :label="$t('repair.repairBasicConfig.sortOrder')">
        <InputNumber
          v-model:value="formData.sortOrder"
          :min="0"
          placeholder="请输入"
          class="!w-full"
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
