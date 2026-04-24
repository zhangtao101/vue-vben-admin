<script lang="ts" setup>
/**
 * 点检计划抽屉组件
 */
import type { Rule } from 'ant-design-vue/es/form';

import type { InspectionPlan } from '#/api';

import { computed, ref, watch } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  DatePicker,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Select,
  SelectOption,
  Space,
  Textarea,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  createInspectionPlan,
  getInspectionPlanById,
  getInspectionSchemeList,
  updateInspectionPlan,
} from '#/api';
import { $t } from '#/locales';

import EquipCheckPlanEquipmentDrawer from './EquipCheckPlanEquipmentDrawer.vue';
import EquipCheckPlanItemDrawer from './EquipCheckPlanItemDrawer.vue';

interface Props {
  visible: boolean;
  mode: 'add' | 'edit' | 'view';
  row?: InspectionPlan | null;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'refresh'): void;
}

defineOptions({
  name: 'EquipCheckPlanDrawer',
});

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  mode: 'add',
  row: null,
});

const emit = defineEmits<Emits>();

// ========== 状态 ==========
const loading = ref(false);
const submitting = ref(false);
const fetching = ref(false);
const searchKeyword = ref('');

// ========== 表单数据 ==========
const formData = ref<any>({
  planName: '',
  schemeId: '',
  firstExecuteTime: undefined,
  frequencyValue: 1,
  frequencyUnit: 'DAY',
  effectiveDate: undefined,
  endDate: undefined,
  status: 'ACTIVE',
  remark: '',
});

// ========== 方案下拉选项 ==========
const schemeOptions = ref<Array<{ label: string; value: number }>>([]);
const selectedSchemeName = ref('');

// ========== 查看抽屉状态 ==========
const equipmentDrawerVisible = ref(false);
const itemDrawerVisible = ref(false);

// ========== 下拉选项 ==========
const frequencyUnitOptions = [
  { label: $t('equipCheckPlan.frequencyUnitOptions.DAY'), value: 'DAY' },
  { label: $t('equipCheckPlan.frequencyUnitOptions.WEEK'), value: 'WEEK' },
  { label: $t('equipCheckPlan.frequencyUnitOptions.MONTH'), value: 'MONTH' },
];

const statusOptions = [
  { label: $t('equipCheckPlan.statusOptions.ACTIVE'), value: 'ACTIVE' },
  { label: $t('equipCheckPlan.statusOptions.DISABLED'), value: 'DISABLED' },
];

// ========== 表单验证 ==========
const formRef = ref();

const rules: Record<string, Rule[]> = {
  planName: [
    { required: true, message: `请输入${$t('equipCheckPlan.planName')}` },
  ],
  schemeId: [
    { required: true, message: `请选择${$t('equipCheckPlan.schemeName')}` },
  ],
  firstExecuteTime: [
    {
      required: true,
      message: `请选择${$t('equipCheckPlan.firstExecuteTime')}`,
    },
  ],
  effectiveDate: [
    { required: true, message: `请选择${$t('equipCheckPlan.effectiveDate')}` },
  ],
};

// ========== 监听 ==========
watch(
  () => props.visible,
  (val) => {
    if (val) {
      loadSchemeOptions('');
      if (props.mode === 'view' || props.mode === 'edit') {
        loadDetail();
      } else {
        resetForm();
      }
    }
  },
);

// ========== 加载方案列表（远程搜索） ==========
let searchTimer: null | ReturnType<typeof setTimeout> = null;

function loadSchemeOptions(keyword: string) {
  fetching.value = true;
  getInspectionSchemeList({ keyword })
    .then((res: any) => {
      schemeOptions.value = res.map((item: any) => ({
        label: item.schemeName,
        value: item.id,
      }));
    })
    .finally(() => {
      fetching.value = false;
    });
}

// ========== 方案搜索 ==========
function handleSchemeSearch(value: string) {
  searchKeyword.value = value;
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  searchTimer = setTimeout(() => {
    loadSchemeOptions(value);
  }, 300);
}

// ========== 方案选择变化 ==========
function handleSchemeChange(value: any) {
  const found = schemeOptions.value.find((item) => item.value === value);
  selectedSchemeName.value = found?.label || '';
}

// ========== 加载详情 ==========
function loadDetail() {
  if (!props.row?.id) return;
  loading.value = true;
  getInspectionPlanById(props.row.id)
    .then((res: any) => {
      const data = res || {};
      formData.value = {
        planName: data.planName || '',
        schemeId: data.schemeId || '',
        firstExecuteTime: data.firstExecuteTime
          ? dayjs(data.firstExecuteTime)
          : '',
        frequencyValue: data.frequencyValue || 1,
        frequencyUnit: data.frequencyUnit || 'DAY',
        effectiveDate: data.effectiveDate ? dayjs(data.effectiveDate) : '',
        endDate: data.endDate ? dayjs(data.endDate) : '',
        status: data.status || 'ACTIVE',
        remark: data.remark || '',
      };
      selectedSchemeName.value = data.schemeName || '';
      // 编辑时加载当前方案的搜索结果
      loadSchemeOptions(data.schemeName || '');
    })
    .finally(() => {
      loading.value = false;
    });
}

// ========== 重置表单 ==========
function resetForm() {
  formData.value = {
    planName: '',
    schemeId: '',
    firstExecuteTime: undefined,
    frequencyValue: 1,
    frequencyUnit: 'DAY',
    effectiveDate: undefined,
    endDate: '',
    status: 'ACTIVE',
    remark: '',
  };
}

// ========== 提交 ==========
function handleSubmit() {
  formRef.value
    ?.validate()
    .then(() => {
      submitting.value = true;
      const api =
        props.mode === 'edit' && props.row?.id
          ? updateInspectionPlan
          : createInspectionPlan;

      const params = {
        ...formData.value,
        firstExecuteTime:
          formData.value.firstExecuteTime?.format('YYYY-MM-DD HH:mm:ss') || '',
        effectiveDate:
          formData.value.effectiveDate?.format('YYYY-MM-DD 00:00:00') || '',
        endDate: formData.value.endDate?.format('YYYY-MM-DD 23:59:59') || '',
        ...(props.mode === 'edit' ? { id: props.row?.id } : {}),
      };

      api(params as any)
        .then(() => {
          message.success($t('common.successfulOperation'));
          emit('update:visible', false);
          emit('refresh');
        })
        .finally(() => {
          submitting.value = false;
        });
    })
    .catch(() => {
      // 验证失败
    });
}

// ========== 关闭 ==========
function handleClose() {
  emit('update:visible', false);
}

// ========== 格式化频率 ==========
function formatFrequency(row: any) {
  const value = row.frequencyValue || '';
  const unit = $t(`equipCheckPlan.frequencyUnitOptions.${row.frequencyUnit}`);
  return `${value} ${unit}`;
}

// ========== 标题 ==========
const drawerTitle = computed(() => {
  const titles: Record<string, string> = {
    add: $t('equipCheckPlan.addTitle'),
    edit: $t('equipCheckPlan.editTitle'),
    view: $t('equipCheckPlan.viewTitle'),
  };
  return titles[props.mode] || '';
});
</script>

<template>
  <Drawer
    :open="visible"
    :title="drawerTitle"
    width="800"
    :destroy-on-close="true"
    @update:open="(val) => emit('update:visible', val)"
  >
    <div v-if="loading" class="flex items-center justify-center p-8">
      加载中...
    </div>

    <div v-else-if="mode === 'view' && props.row">
      <Descriptions :column="2" bordered>
        <DescriptionsItem :label="$t('equipCheckPlan.planName')">
          {{ props.row.planName }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('equipCheckPlan.status')">
          {{
            props.row.status === 'ACTIVE'
              ? $t('equipCheckPlan.statusOptions.ACTIVE')
              : $t('equipCheckPlan.statusOptions.DISABLED')
          }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('equipCheckPlan.schemeName')" :span="2">
          {{ props.row.schemeName }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('equipCheckPlan.inspectionType')">
          {{
            props.row.inspectionType === 'INSPECTION'
              ? $t('equipCheckPlan.inspectionTypeOptions.INSPECTION')
              : $t('equipCheckPlan.inspectionTypeOptions.PATROL')
          }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('equipCheckPlan.equipmentGroup')">
          {{ props.row.equipmentGroup }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('equipCheckPlan.equipmentCount')">
          {{ props.row.equipmentCount }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('equipCheckPlan.equipmentCodes')"
          :span="2"
        >
          {{ props.row.equipmentCodes }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('equipCheckPlan.firstExecuteTime')">
          {{ props.row.firstExecuteTime }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('equipCheckPlan.frequencyValue')">
          {{ formatFrequency(props.row) }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('equipCheckPlan.effectiveDate')">
          {{ props.row.effectiveDate }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('equipCheckPlan.endDate')">
          {{ props.row.endDate }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('equipCheckPlan.remark')" :span="2">
          {{ props.row.remark }}
        </DescriptionsItem>
      </Descriptions>
    </div>

    <Form
      ref="formRef"
      v-else
      layout="vertical"
      :model="formData"
      :rules="rules"
    >
      <FormItem :label="$t('equipCheckPlan.planName')" name="planName">
        <Input
          v-model:value="formData.planName"
          :disabled="mode === 'view'"
          :placeholder="$t('equipCheckPlan.keywordPlaceholder')"
        />
      </FormItem>

      <FormItem :label="$t('equipCheckPlan.schemeName')" name="schemeId">
        <Select
          v-model:value="formData.schemeId"
          :disabled="mode === 'view'"
          :filter-option="false"
          :not-found-content="fetching ? '加载中...' : '无匹配结果'"
          show-search
          style="width: 100%"
          @search="handleSchemeSearch"
          @change="handleSchemeChange"
        >
          <SelectOption
            v-for="item in schemeOptions"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </SelectOption>
        </Select>
      </FormItem>

      <!-- 查看绑定设备和点检项按钮 -->
      <div v-if="formData.schemeId" class="mb-4 flex gap-2">
        <Button type="link" @click="equipmentDrawerVisible = true">
          <Icon
            icon="mdi:format-list-bulleted"
            class="inline-block align-middle"
          />
          {{ $t('equipCheckPlan.viewEquipment') }}
        </Button>
        <Button type="link" @click="itemDrawerVisible = true">
          <Icon
            icon="mdi:clipboard-check-outline"
            class="inline-block align-middle"
          />
          {{ $t('equipCheckPlan.viewItem') }}
        </Button>
      </div>

      <FormItem
        :label="$t('equipCheckPlan.firstExecuteTime')"
        name="firstExecuteTime"
      >
        <DatePicker
          v-model:value="formData.firstExecuteTime"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
      </FormItem>

      <div class="flex gap-4">
        <FormItem :label="$t('equipCheckPlan.frequencyValue')" class="flex-1">
          <Input v-model:value="formData.frequencyValue" type="number" />
        </FormItem>
        <FormItem :label="$t('equipCheckPlan.frequencyUnit')" class="flex-1">
          <Select v-model:value="formData.frequencyUnit">
            <SelectOption
              v-for="item in frequencyUnitOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </SelectOption>
          </Select>
        </FormItem>
      </div>

      <div class="flex gap-4">
        <FormItem
          :label="$t('equipCheckPlan.effectiveDate')"
          name="effectiveDate"
          class="flex-1"
        >
          <DatePicker
            v-model:value="formData.effectiveDate"
            format="YYYY-MM-DD"
            style="width: 100%"
          />
        </FormItem>
        <FormItem :label="$t('equipCheckPlan.endDate')" class="flex-1">
          <DatePicker
            v-model:value="formData.endDate"
            format="YYYY-MM-DD"
            style="width: 100%"
          />
        </FormItem>
      </div>

      <FormItem :label="$t('equipCheckPlan.status')">
        <Select v-model:value="formData.status">
          <SelectOption
            v-for="item in statusOptions"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </SelectOption>
        </Select>
      </FormItem>

      <FormItem :label="$t('equipCheckPlan.remark')">
        <Textarea v-model:value="formData.remark" :rows="3" />
      </FormItem>
    </Form>

    <!-- 底部按钮 -->
    <template v-if="mode !== 'view'" #footer>
      <Space class="w-full justify-end">
        <Button @click="handleClose">
          {{ $t('equipmentSpotCheckScheme.equipmentSelectDrawer.cancel') }}
        </Button>
        <Button type="primary" :loading="submitting" @click="handleSubmit">
          <Icon icon="mdi:check" class="inline-block align-middle" />
          {{ $t('equipmentSpotCheckScheme.equipmentSelectDrawer.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>

  <!-- 查看绑定设备抽屉 -->
  <EquipCheckPlanEquipmentDrawer
    v-model:visible="equipmentDrawerVisible"
    :scheme-id="formData.schemeId"
  />

  <!-- 查看点检项抽屉 -->
  <EquipCheckPlanItemDrawer
    v-model:visible="itemDrawerVisible"
    :scheme-id="formData.schemeId"
  />
</template>
