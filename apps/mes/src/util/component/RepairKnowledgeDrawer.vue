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
  createRepairKnowledge,
  getRepairKnowledgeById,
  searchBaseConfig,
  updateRepairKnowledge,
} from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'RepairKnowledgeDrawer',
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
    return $t('common.view');
  }
  return props.row?.id
    ? $t('repair.repairKnowledgeBase.editTitle')
    : $t('repair.repairKnowledgeBase.addTitle');
});

// ========== 是否可编辑 ==========
const isEditable = computed(() => props.mode !== 'view');

// ========== 设备组选项 ==========
const equipmentGroupOptions = ref<any[]>([]);

function loadEquipmentGroupOptions() {
  searchBaseConfig({ configType: 'EQUIPMENT_GROUP' }).then((res: any[]) => {
    equipmentGroupOptions.value = (res || []).map((item: any) => ({
      label: item.configName,
      value: item.configCode,
    }));
  });
}

onMounted(() => {
  loadEquipmentGroupOptions();
});

// ========== 表单数据 ==========
const formData = ref({
  pmCode: '',
  title: '',
  source: '',
  equipmentGroup: undefined as string | undefined,
  content: '',
});

// ========== 重置表单 ==========
function resetForm() {
  formData.value = {
    pmCode: '',
    title: '',
    source: '',
    equipmentGroup: undefined,
    content: '',
  };
}

// ========== 监听 row 变化，自动填充表单 ==========
watch(
  () => props.row,
  (newRow) => {
    if (newRow?.id) {
      formData.value = {
        pmCode: newRow.pmCode || '',
        title: newRow.title || '',
        source: newRow.source || '',
        equipmentGroup: newRow.equipmentGroup,
        content: newRow.content || '',
      };
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
        getRepairKnowledgeById(props.row.id).then((res: any) => {
          formData.value = {
            pmCode: res.pmCode || '',
            title: res.title || '',
            source: res.source || '',
            equipmentGroup: res.equipmentGroup,
            content: res.content || '',
          };
        });
      } else if (!props.row?.id) {
        resetForm();
      }
    }
  },
);

// ========== 表单验证规则 ==========
const rules: Record<string, any[]> = {
  title: [
    {
      required: true,
      message: `请输入${$t('repair.repairKnowledgeBase.titleField')}`,
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
      const api = props.row?.id ? updateRepairKnowledge : createRepairKnowledge;
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
      <FormItem :label="$t('repair.repairKnowledgeBase.pmCode')">
        <Input
          v-model:value="formData.pmCode"
          :placeholder="`请输入${$t('repair.repairKnowledgeBase.pmCode')}`"
          :disabled="!isEditable"
        />
      </FormItem>

      <FormItem
        :label="$t('repair.repairKnowledgeBase.titleField')"
        name="title"
      >
        <Input
          v-model:value="formData.title"
          :placeholder="`请输入${$t('repair.repairKnowledgeBase.titleField')}`"
          :disabled="!isEditable"
        />
      </FormItem>

      <FormItem :label="$t('repair.repairKnowledgeBase.source')">
        <Input
          v-model:value="formData.source"
          :placeholder="`请输入${$t('repair.repairKnowledgeBase.source')}`"
          :disabled="!isEditable"
        />
      </FormItem>

      <FormItem :label="$t('repair.repairKnowledgeBase.equipmentGroup')">
        <Select
          v-model:value="formData.equipmentGroup"
          :placeholder="`请选择${$t('repair.repairKnowledgeBase.equipmentGroup')}`"
          :disabled="!isEditable"
          allow-clear
        >
          <SelectOption
            v-for="item in equipmentGroupOptions"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </SelectOption>
        </Select>
      </FormItem>

      <FormItem :label="$t('repair.repairKnowledgeBase.content')">
        <Input.TextArea
          v-model:value="formData.content"
          :rows="4"
          :placeholder="`请输入${$t('repair.repairKnowledgeBase.content')}`"
          :disabled="!isEditable"
        />
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
