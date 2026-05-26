<script lang="ts" setup>
import { ref, watch } from 'vue';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Select,
  SelectOption,
  Space,
} from 'ant-design-vue';

import { queryMSDInfo, saveMSDInfo } from '#/api';
import { $t } from '#/locales';

defineOptions({ name: 'MSDDrawer' });

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  materialCode: '',
  materialName: '',
  hasPermission: false,
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'refresh'): void;
}>();

interface Props {
  visible: boolean;
  materialCode: string;
  materialName: string;
  /** 是否有新增/修改 MSD 的权限 */
  hasPermission: boolean;
}

const drawerVisible = ref(props.visible);

watch(
  () => props.visible,
  (val) => {
    drawerVisible.value = val;
    if (val && props.materialCode) {
      loadMSDInfo();
    }
  },
);

watch(drawerVisible, (val) => {
  emit('update:visible', val);
});

const formRef = ref();
const loading = ref(false);

const formData = ref<{
  checkCycle: number | undefined;
  id: null | number;
  materialCode: string;
  msdLevel: number | undefined;
}>({
  id: null,
  materialCode: '',
  msdLevel: undefined,
  checkCycle: undefined,
});

/** 是否为编辑模式（已有 MSD 数据） */
const isEdit = ref(false);

/** MSD 等级选项 */
const msdLevelOptions = [1, 2, 3].map((n) => ({
  label: `Level ${n}`,
  value: n,
}));

/**
 * 加载 MSD 信息
 */
function loadMSDInfo() {
  loading.value = true;
  queryMSDInfo({ materialCode: props.materialCode })
    .then((res: any) => {
      const data = res.data || res;
      if (data && data.id) {
        formData.value = {
          id: data.id,
          materialCode: data.materialCode || props.materialCode,
          msdLevel: data.msdLevel,
          checkCycle: data.checkCycle,
        };
        isEdit.value = true;
      } else {
        formData.value = {
          id: null,
          materialCode: props.materialCode,
          msdLevel: undefined,
          checkCycle: undefined,
        };
        isEdit.value = false;
      }
    })
    .catch(() => {
      formData.value = {
        id: null,
        materialCode: props.materialCode,
        msdLevel: undefined,
        checkCycle: undefined,
      };
      isEdit.value = false;
    })
    .finally(() => {
      loading.value = false;
    });
}

/**
 * 提交表单——保存 MSD 信息
 */
function handleSubmit() {
  saveMSDInfo({
    id: formData.value.id,
    materialCode: props.materialCode,
    msdLevel: formData.value.msdLevel as number,
    checkCycle: formData.value.checkCycle as number,
  }).then(() => {
    message.success($t('basic.bomManagement.msd.saveSuccess'));
    drawerVisible.value = false;
    emit('refresh');
  });
}

/**
 * 关闭抽屉
 */
function handleClose() {
  drawerVisible.value = false;
  formRef.value?.resetFields();
}
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :title="$t('basic.bomManagement.msd.title')"
    :width="500"
    :destroy-on-close="true"
    :footer-style="{ textAlign: 'right' }"
    @close="handleClose"
  >
    <Form
      ref="formRef"
      :label-col="{ span: 8 }"
      :model="formData"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
      layout="horizontal"
    >
      <!-- 料号 -->
      <FormItem
        :label="$t('basic.bomManagement.msd.materialCode')"
        name="materialCode"
      >
        <Input v-model:value="formData.materialCode" disabled />
      </FormItem>

      <!-- 物料名称 -->
      <FormItem
        :label="$t('basic.bomManagement.materialName')"
        name="materialName"
      >
        <Input :value="props.materialName" disabled />
      </FormItem>

      <!-- MSD 等级 -->
      <FormItem :label="$t('basic.bomManagement.msd.msdLevel')" name="msdLevel">
        <Select
          v-model:value="formData.msdLevel"
          :disabled="!hasPermission"
          :placeholder="$t('basic.bomManagement.msd.selectMsdLevel')"
          allow-clear
        >
          <SelectOption
            v-for="opt in msdLevelOptions"
            :key="opt.value"
            :value="opt.value"
            :label="opt.label"
          />
        </Select>
      </FormItem>

      <!-- 检测周期（单位月） -->
      <FormItem
        :label="$t('basic.bomManagement.msd.checkCycle')"
        name="checkCycle"
      >
        <InputNumber
          v-model:value="formData.checkCycle"
          :disabled="!hasPermission"
          :min="1"
          :max="120"
          style="width: 100%"
        />
      </FormItem>
    </Form>

    <!-- 底部按钮 -->
    <template #footer>
      <Space>
        <Button @click="handleClose">
          {{ $t('common.cancel') }}
        </Button>
        <Button
          v-if="hasPermission"
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
