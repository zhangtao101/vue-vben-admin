<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、dayjs、@iconify/vue、#/api（getMoldMaintenancePlanById、getMoldMaintenanceSchemeList、saveMoldMaintenancePlan）、#/locales、./MoldMaintenancePlanMoldDrawer.vue、./MoldMaintenancePlanItemDrawer.vue
 * [OUTPUT]: 对外提供 MoldMaintenancePlanDrawer 组件，支持新增/编辑/查看模具保养计划
 * [POS]: 设备点检管理模块 的 模具保养计划抽屉组件，被 moldMaintenancePlan.vue 引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-25 11:17:00
 */
import type {
  MoldMaintenancePlan,
  MoldMaintenancePlanDetail,
} from '#/api/equipManagement/moldMaintenancePlan.service';

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
  Spin,
  Textarea,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  getMoldMaintenancePlanById,
  getMoldMaintenanceSchemeList,
  saveMoldMaintenancePlan,
} from '#/api';
import { $t } from '#/locales';

import MoldMaintenancePlanItemDrawer from './MoldMaintenancePlanItemDrawer.vue';
import MoldMaintenancePlanMoldDrawer from './MoldMaintenancePlanMoldDrawer.vue';

interface Props {
  visible: boolean;
  mode: 'add' | 'edit' | 'view';
  row?: MoldMaintenancePlan | null;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'refresh'): void;
}

defineOptions({
  name: 'MoldMaintenancePlanDrawer',
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
const formRef = ref<any>();
const formData = ref<any>({
  planName: '',
  schemeId: undefined,
  planType: 'REGULAR',
  firstExecuteTime: '',
  frequencyValue: undefined,
  frequencyUnit: 'DAY',
  conditionDimension: 'LIFESPAN',
  compareOperator: 'LT',
  triggerValue: undefined,
  triggerUnit: '%',
  effectiveDate: '',
  endDate: '',
  status: 'ACTIVE',
  remark: '',
});

// ========== 方案下拉选项 ==========
const schemeOptions = ref<Array<{ label: string; value: number }>>([]);
const selectedSchemeName = ref('');

// ========== 查看抽屉状态 ==========
const moldDrawerVisible = ref(false);
const itemDrawerVisible = ref(false);

// ========== 下拉选项 ==========
const planTypeOptions = [
  {
    label: $t('moldMaintenancePlan.planTypeOptions.REGULAR'),
    value: 'REGULAR',
  },
  {
    label: $t('moldMaintenancePlan.planTypeOptions.CONDITIONAL'),
    value: 'CONDITIONAL',
  },
];

const frequencyUnitOptions = [
  {
    label: $t('moldMaintenancePlan.frequencyUnitOptions.DAY'),
    value: 'DAY',
  },
  {
    label: $t('moldMaintenancePlan.frequencyUnitOptions.WEEK'),
    value: 'WEEK',
  },
  {
    label: $t('moldMaintenancePlan.frequencyUnitOptions.MONTH'),
    value: 'MONTH',
  },
];

const conditionDimensionOptions = [
  {
    label: $t('moldMaintenancePlan.conditionDimensionOptions.LIFESPAN'),
    value: 'LIFESPAN',
  },
  {
    label: $t('moldMaintenancePlan.conditionDimensionOptions.USE_COUNT'),
    value: 'USE_COUNT',
  },
];

const compareOperatorOptions = [
  {
    label: $t('moldMaintenancePlan.compareOperatorOptions.LT'),
    value: 'LT',
  },
  {
    label: $t('moldMaintenancePlan.compareOperatorOptions.LTE'),
    value: 'LTE',
  },
];

const statusOptions = [
  {
    label: $t('moldMaintenancePlan.statusOptions.ACTIVE'),
    value: 'ACTIVE',
  },
  {
    label: $t('moldMaintenancePlan.statusOptions.DISABLED'),
    value: 'DISABLED',
  },
];

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

// 标记方案列表是否已加载
let schemeOptionsLoaded = false;

// ========== 加载方案列表 ==========
let searchTimer: null | ReturnType<typeof setTimeout> = null;

function loadSchemeOptions(keyword: string) {
  // 如果 keyword 为空且已加载过，则不重复加载
  if (!keyword && schemeOptionsLoaded) {
    return;
  }
  fetching.value = true;
  getMoldMaintenanceSchemeList({ keyword })
    .then((res: any) => {
      schemeOptions.value = res.map((item: any) => ({
        label: item.schemeName,
        value: item.id,
      }));
      if (!keyword) {
        schemeOptionsLoaded = true;
      }
    })
    .finally(() => {
      fetching.value = false;
    });
}

function handleSchemeSearch(value: string) {
  searchKeyword.value = value;
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  searchTimer = setTimeout(() => {
    loadSchemeOptions(value);
  }, 300);
}

function handleSchemeChange(value: any) {
  const found = schemeOptions.value.find((item) => item.value === value);
  selectedSchemeName.value = found?.label || '';
}

// ========== 加载详情 ==========
function loadDetail() {
  if (!props.row?.id) return;
  loading.value = true;
  getMoldMaintenancePlanById(props.row.id)
    .then((res: MoldMaintenancePlanDetail) => {
      formData.value = {
        planName: res.planName || '',
        schemeId: res.schemeId || '',
        planType: res.planType || 'REGULAR',
        firstExecuteTime: res.firstExecuteTime
          ? dayjs(res.firstExecuteTime)
          : '',
        frequencyValue: res.frequencyValue || '',
        frequencyUnit: res.frequencyUnit || 'DAY',
        conditionDimension: res.conditionDimension || 'LIFESPAN',
        compareOperator: res.compareOperator || 'LT',
        triggerValue: res.triggerValue || '',
        triggerUnit: res.triggerUnit || '%',
        effectiveDate: res.effectiveDate ? dayjs(res.effectiveDate) : '',
        endDate: res.endDate ? dayjs(res.endDate) : '',
        status: res.status || 'ACTIVE',
        remark: res.remark || '',
      };
      selectedSchemeName.value = res.schemeName || '';
    })
    .finally(() => {
      loading.value = false;
    });
}

// ========== 重置表单 ==========
function resetForm() {
  formData.value = {
    planName: '',
    schemeId: undefined,
    planType: 'REGULAR',
    firstExecuteTime: '',
    frequencyValue: '',
    frequencyUnit: 'DAY',
    conditionDimension: 'LIFESPAN',
    compareOperator: 'LT',
    triggerValue: '',
    triggerUnit: '%',
    effectiveDate: '',
    endDate: '',
    status: 'ACTIVE',
    remark: '',
  };
}

// ========== 提交 ==========
function handleSubmit() {
  formRef.value
    .validate()
    .then(() => {
      submitting.value = true;
      const params: any = {
        plan: {
          planName: formData.value.planName,
          schemeId: formData.value.schemeId,
          planType: formData.value.planType,
          firstExecuteTime:
            formData.value.firstExecuteTime?.format('YYYY-MM-DD HH:mm:ss') ||
            '',
          frequencyValue: formData.value.frequencyValue || undefined,
          frequencyUnit: formData.value.frequencyUnit,
          conditionDimension:
            formData.value.planType === 'CONDITIONAL'
              ? formData.value.conditionDimension
              : undefined,
          compareOperator:
            formData.value.planType === 'CONDITIONAL'
              ? formData.value.compareOperator
              : undefined,
          triggerValue:
            formData.value.planType === 'CONDITIONAL'
              ? formData.value.triggerValue
              : undefined,
          triggerUnit:
            formData.value.planType === 'CONDITIONAL'
              ? formData.value.triggerUnit
              : undefined,
          effectiveDate:
            formData.value.effectiveDate?.format('YYYY-MM-DD 00:00:00') || '',
          endDate: formData.value.endDate?.format('YYYY-MM-DD 23:59:59') || '',
          status: formData.value.status,
        },
        details: [],
      };

      if (props.mode === 'edit' && props.row?.id) {
        params.plan.id = props.row.id;
      }

      saveMoldMaintenancePlan(params)
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

// ========== 格式化 ==========
function formatFrequency(row: any) {
  const value = row.frequencyValue || '';
  const unit = $t(
    `moldMaintenancePlan.frequencyUnitOptions.${row.frequencyUnit}`,
  );
  return `${value} ${unit}`;
}

function formatCondition(row: any) {
  if (row.planType !== 'CONDITIONAL') return '-';
  const dimension = $t(
    `moldMaintenancePlan.conditionDimensionOptions.${row.conditionDimension}`,
  );
  const operator = $t(
    `moldMaintenancePlan.compareOperatorOptions.${row.compareOperator}`,
  );
  return `${operator} ${row.triggerValue}${row.triggerUnit} ${dimension}`;
}

// ========== 标题 ==========
const drawerTitle = computed(() => {
  const titles: Record<string, string> = {
    add: $t('moldMaintenancePlan.addTitle'),
    edit: $t('moldMaintenancePlan.editTitle'),
    view: $t('moldMaintenancePlan.viewTitle'),
  };
  return titles[props.mode] || '';
});

// ========== 详情数据 ==========
const detailData = computed(() => {
  if (props.mode !== 'view' || !props.row) return null;
  return props.row;
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
    <Spin :spinning="loading">
      <!-- 查看模式 -->
      <div v-if="mode === 'view' && detailData">
        <Descriptions :column="2" bordered>
          <DescriptionsItem :label="$t('moldMaintenancePlan.planName')">
            {{ detailData.planName }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('moldMaintenancePlan.status')">
            {{
              detailData.status === 'ACTIVE'
                ? $t('moldMaintenancePlan.statusOptions.ACTIVE')
                : $t('moldMaintenancePlan.statusOptions.DISABLED')
            }}
          </DescriptionsItem>
          <DescriptionsItem
            :label="$t('moldMaintenancePlan.schemeName')"
            :span="2"
          >
            {{ detailData.schemeName }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('moldMaintenancePlan.planType')">
            {{
              detailData.planType === 'REGULAR'
                ? $t('moldMaintenancePlan.planTypeOptions.REGULAR')
                : $t('moldMaintenancePlan.planTypeOptions.CONDITIONAL')
            }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('moldMaintenancePlan.equipmentGroup')">
            {{ detailData.equipmentGroup || '-' }}
          </DescriptionsItem>
          <DescriptionsItem
            v-if="detailData.planType === 'REGULAR'"
            :label="$t('moldMaintenancePlan.frequency')"
          >
            {{ formatFrequency(detailData) }}
          </DescriptionsItem>
          <DescriptionsItem
            v-if="detailData.planType === 'CONDITIONAL'"
            :label="$t('moldMaintenancePlan.conditionTrigger')"
          >
            {{ formatCondition(detailData) }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('moldMaintenancePlan.firstExecuteTime')">
            {{ detailData.firstExecuteTime || '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('moldMaintenancePlan.effectiveDate')">
            {{ detailData.effectiveDate }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('moldMaintenancePlan.endDate')">
            {{ detailData.endDate || '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('moldMaintenancePlan.remark')" :span="2">
            {{ detailData.remark || '-' }}
          </DescriptionsItem>
        </Descriptions>

        <!-- 查看模式下显示查看按钮 -->
        <div class="mt-4 flex gap-2">
          <Button type="primary" @click="moldDrawerVisible = true">
            <Icon
              icon="mdi:format-list-bulleted"
              class="inline-block align-middle"
            />
            {{ $t('moldMaintenancePlan.bindMold') }}
          </Button>
          <Button type="primary" @click="itemDrawerVisible = true">
            <Icon
              icon="mdi:clipboard-check-outline"
              class="inline-block align-middle"
            />
            {{ $t('moldMaintenancePlan.maintenanceItem') }}
          </Button>
        </div>
      </div>

      <!-- 新增/编辑模式 -->
      <Form v-else ref="formRef" layout="vertical" :model="formData">
        <FormItem :label="$t('moldMaintenancePlan.planName')" name="planName">
          <Input
            v-model:value="formData.planName"
            :placeholder="$t('moldMaintenancePlan.keywordPlaceholder')"
          />
        </FormItem>

        <FormItem :label="$t('moldMaintenancePlan.schemeName')" name="schemeId">
          <Select
            v-model:value="formData.schemeId"
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

          <div class="mt-4 flex gap-2" v-if="formData.schemeId">
            <Button type="link" @click="moldDrawerVisible = true">
              <Icon
                icon="mdi:format-list-bulleted"
                class="inline-block align-middle"
              />
              {{ $t('moldMaintenancePlan.bindMold') }}
            </Button>
            <Button type="link" @click="itemDrawerVisible = true">
              <Icon
                icon="mdi:clipboard-check-outline"
                class="inline-block align-middle"
              />
              {{ $t('moldMaintenancePlan.maintenanceItem') }}
            </Button>
          </div>
        </FormItem>

        <FormItem :label="$t('moldMaintenancePlan.planType')">
          <Select v-model:value="formData.planType">
            <SelectOption
              v-for="item in planTypeOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </SelectOption>
          </Select>
        </FormItem>

        <!-- 定期保养参数 -->
        <template v-if="formData.planType === 'REGULAR'">
          <FormItem
            :label="$t('moldMaintenancePlan.firstExecuteTime')"
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
            <FormItem
              :label="$t('moldMaintenancePlan.frequencyValue')"
              class="flex-1"
            >
              <Input v-model:value="formData.frequencyValue" type="number" />
            </FormItem>
            <FormItem
              :label="$t('moldMaintenancePlan.frequencyUnit')"
              class="flex-1"
            >
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
        </template>

        <!-- 条件保养参数 -->
        <template v-if="formData.planType === 'CONDITIONAL'">
          <div class="flex gap-4">
            <FormItem
              :label="$t('moldMaintenancePlan.conditionDimension')"
              class="flex-1"
            >
              <Select v-model:value="formData.conditionDimension">
                <SelectOption
                  v-for="item in conditionDimensionOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </SelectOption>
              </Select>
            </FormItem>
            <FormItem
              :label="$t('moldMaintenancePlan.compareOperator')"
              class="flex-1"
            >
              <Select v-model:value="formData.compareOperator">
                <SelectOption
                  v-for="item in compareOperatorOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </SelectOption>
              </Select>
            </FormItem>
            <FormItem
              :label="$t('moldMaintenancePlan.triggerValue')"
              class="flex-1"
            >
              <Input v-model:value="formData.triggerValue" type="number" />
            </FormItem>
          </div>
        </template>

        <div class="flex gap-4">
          <FormItem
            :label="$t('moldMaintenancePlan.effectiveDate')"
            class="flex-1"
          >
            <DatePicker
              v-model:value="formData.effectiveDate"
              format="YYYY-MM-DD"
              style="width: 100%"
            />
          </FormItem>
          <FormItem :label="$t('moldMaintenancePlan.endDate')" class="flex-1">
            <DatePicker
              v-model:value="formData.endDate"
              format="YYYY-MM-DD"
              style="width: 100%"
            />
          </FormItem>
        </div>

        <FormItem :label="$t('moldMaintenancePlan.status')">
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

        <FormItem :label="$t('moldMaintenancePlan.remark')">
          <Textarea v-model:value="formData.remark" :rows="3" />
        </FormItem>
      </Form>
    </Spin>

    <!-- 底部按钮 -->
    <template v-if="mode !== 'view'" #footer>
      <Space class="w-full justify-end">
        <Button @click="handleClose">
          {{ $t('common.cancel') }}
        </Button>
        <Button type="primary" :loading="submitting" @click="handleSubmit">
          <Icon icon="mdi:check" class="inline-block align-middle" />
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>

  <!-- 查看绑定模具抽屉 -->
  <MoldMaintenancePlanMoldDrawer
    v-model:visible="moldDrawerVisible"
    :scheme-id="formData.schemeId"
  />

  <!-- 查看保养项抽屉 -->
  <MoldMaintenancePlanItemDrawer
    v-model:visible="itemDrawerVisible"
    :scheme-id="formData.schemeId"
  />
</template>
