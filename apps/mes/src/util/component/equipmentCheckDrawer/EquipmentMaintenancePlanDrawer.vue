<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、dayjs、@iconify/vue-iconify、#/api（createMaintenancePlan、getMaintenancePlanById、getMaintenanceSchemeList、updateMaintenancePlan）、#/locales、./EquipmentMaintenancePlanEquipmentDrawer.vue、./EquipmentMaintenancePlanItemDrawer.vue
 * [OUTPUT]: 对外提供 EquipmentMaintenancePlanDrawer 组件，支持新增/编辑/查看设备保养计划
 * [POS]: 设备点检管理模块 的 保养计划抽屉组件，被 equipmentMaintenancePlan.vue 引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-25 10:17:00
 */
import type { MaintenancePlan } from '#/api';

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
  createMaintenancePlan,
  getMaintenancePlanById,
  getMaintenanceSchemeList,
  updateMaintenancePlan,
} from '#/api';
import { $t } from '#/locales';

import EquipmentMaintenancePlanEquipmentDrawer from './EquipmentMaintenancePlanEquipmentDrawer.vue';
import EquipmentMaintenancePlanItemDrawer from './EquipmentMaintenancePlanItemDrawer.vue';

interface Props {
  visible: boolean;
  mode: 'add' | 'edit' | 'view';
  row?: MaintenancePlan | null;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'refresh'): void;
}

defineOptions({
  name: 'EquipmentMaintenancePlanDrawer',
});

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  mode: 'add',
  row: null,
});

const emit = defineEmits<Emits>();

// ========== 状态 ==========
// 加载状态：控制详情加载时的 Spin 显示
const loading = ref(false);
// 提交状态：防止重复提交，关联提交按钮 loading
const submitting = ref(false);
// 下拉搜索加载状态：用于显示 Select 的加载中提示
const fetching = ref(false);
// 方案搜索关键词：用于防抖搜索时保留输入值
const searchKeyword = ref('');

// ========== 表单数据 ==========
// 表单实例引用，用于表单验证
const formRef = ref<any>();
// 保养计划表单数据：包含计划名称、方案ID、首次执行时间、频率、有效期等
const formData = ref<any>({
  planName: '',
  schemeId: undefined,
  firstExecuteTime: '',
  frequencyValue: undefined,
  frequencyUnit: 'DAY',
  effectiveDate: '',
  endDate: '',
  status: 'ACTIVE',
  remark: '',
});

// ========== 方案下拉选项 ==========
// 方案下拉选项列表：包含 label（显示名称）和 value（方案ID）
const schemeOptions = ref<Array<{ label: string; value: number }>>([]);
// 已选方案名称：用于回显或查看模式显示
const selectedSchemeName = ref('');

// ========== 查看抽屉状态 ==========
// 绑定设备抽屉可见性：控制 EquipmentMaintenancePlanEquipmentDrawer 显示
const equipmentDrawerVisible = ref(false);
// 保养项抽屉可见性：控制 EquipmentMaintenancePlanItemDrawer 显示
const itemDrawerVisible = ref(false);

// ========== 下拉选项 ==========
// 频率单位选项：DAY-天、WEEK-周、MONTH-月
const frequencyUnitOptions = [
  {
    label: $t('equipmentMaintenancePlan.frequencyUnitOptions.DAY'),
    value: 'DAY',
  },
  {
    label: $t('equipmentMaintenancePlan.frequencyUnitOptions.WEEK'),
    value: 'WEEK',
  },
  {
    label: $t('equipmentMaintenancePlan.frequencyUnitOptions.MONTH'),
    value: 'MONTH',
  },
];

const statusOptions = [
  {
    label: $t('equipmentMaintenancePlan.statusOptions.ACTIVE'),
    value: 'ACTIVE',
  },
  {
    label: $t('equipmentMaintenancePlan.statusOptions.DISABLED'),
    value: 'DISABLED',
  },
];

// ========== 监听 ==========
// 监听抽屉可见性变化，打开时加载数据，新增时重置表单
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
// 搜索防抖定时器：300ms 防抖延迟，避免频繁请求
let searchTimer: null | ReturnType<typeof setTimeout> = null;

/**
 * 加载保养方案下拉列表，支持关键字过滤。
 * @param {string} keyword - 搜索关键字，用于过滤方案名称。
 * @returns {void} 无返回值，结果更新到 schemeOptions。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function loadSchemeOptions(keyword: string) {
  fetching.value = true;
  getMaintenanceSchemeList({ keyword })
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
/**
 * 处理方案搜索输入，300ms 防抖后调用加载接口。
 * @param {string} value - 用户输入的搜索关键词。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
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
/**
 * 处理方案下拉选择变化，同步保存选中的方案名称。
 * @param {any} value - 选中的方案ID。
 * @returns {void} 无返回值，结果更新到 selectedSchemeName。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function handleSchemeChange(value: any) {
  const found = schemeOptions.value.find((item) => item.value === value);
  selectedSchemeName.value = found?.label || '';
}

// ========== 加载详情 ==========
/**
 * 加载保养计划详情数据，填充表单用于编辑或查看。
 * @returns {void} 无返回值，成功后更新 formData 和 selectedSchemeName。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function loadDetail() {
  if (!props.row?.id) return;
  loading.value = true;
  getMaintenancePlanById(props.row.id)
    .then((res: any) => {
      const data = res || {};
      formData.value = {
        planName: data.planName || '',
        schemeId: data.schemeId || '',
        firstExecuteTime: data.firstExecuteTime
          ? dayjs(data.firstExecuteTime)
          : '',
        frequencyValue: data.frequencyValue || '',
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
/**
 * 重置表单数据为默认值，用于新增模式下清空表单。
 * @returns {void} 无返回值，结果更新到 formData。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function resetForm() {
  formData.value = {
    planName: '',
    schemeId: undefined,
    firstExecuteTime: '',
    frequencyValue: '',
    frequencyUnit: 'DAY',
    effectiveDate: '',
    endDate: '',
    status: 'ACTIVE',
    remark: '',
  };
}

// ========== 提交 ==========
/**
 * 提交表单，包含前置校验与错误捕获。根据 mode 调用新增或更新接口。
 * @returns {void} 无返回值，成功后关闭抽屉并刷新列表。
 * @throws {Error} 表单校验失败时不抛出异常。
 * @since 2026-04-25 10:17:00
 */
function handleSubmit() {
  formRef.value
    .validate()
    .then(() => {
      submitting.value = true;
      const api =
        props.mode === 'edit' && props.row?.id
          ? updateMaintenancePlan
          : createMaintenancePlan;

      const params: any = {
        ...formData.value,
        firstExecuteTime:
          formData.value.firstExecuteTime?.format('YYYY-MM-DD HH:mm:ss') || '',
        effectiveDate:
          formData.value.effectiveDate?.format('YYYY-MM-DD 00:00:00') || '',
        endDate: formData.value.endDate?.format('YYYY-MM-DD 23:59:59') || '',
        ...(props.mode === 'edit' ? { id: props.row?.id } : {}),
      };

      api(params)
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
/**
 * 关闭抽屉，通过 emit 触发父组件更新 visible 状态。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function handleClose() {
  emit('update:visible', false);
}

// ========== 格式化频率 ==========
/**
 * 格式化保养频率显示，将数值和单位组合为可读字符串。
 * @param {any} row - 包含 frequencyValue 和 frequencyUnit 的行数据对象。
 * @returns {string} 格式化的频率字符串，如 "3 天"。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function formatFrequency(row: any) {
  const value = row.frequencyValue || '';
  const unit = $t(`equipmentMaintenancePlan.frequencyUnitOptions.${row.frequencyUnit}`);
  return `${value} ${unit}`;
}

// ========== 标题 ==========
// 抽屉标题：根据 mode 动态切换"新增保养计划"、"编辑保养计划"、"保养计划详情"
const drawerTitle = computed(() => {
  const titles: Record<string, string> = {
    add: $t('equipmentMaintenancePlan.addTitle'),
    edit: $t('equipmentMaintenancePlan.editTitle'),
    view: $t('equipmentMaintenancePlan.viewTitle'),
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
    <Spin :spinning="loading">
      <div v-if="mode === 'view' && props.row">
        <Descriptions :column="2" bordered>
          <DescriptionsItem :label="$t('equipmentMaintenancePlan.planName')">
            {{ props.row.planName }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('equipmentMaintenancePlan.status')">
            {{
              props.row.status === 'ACTIVE'
                ? $t('equipmentMaintenancePlan.statusOptions.ACTIVE')
                : $t('equipmentMaintenancePlan.statusOptions.DISABLED')
            }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('equipmentMaintenancePlan.schemeName')" :span="2">
            {{ props.row.schemeName }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('equipmentMaintenancePlan.equipmentCount')">
            {{ props.row.equipmentCount }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('equipmentMaintenancePlan.frequencyValue')">
            {{ formatFrequency(props.row) }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('equipmentMaintenancePlan.firstExecuteTime')">
            {{ props.row.firstExecuteTime }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('equipmentMaintenancePlan.effectiveDate')">
            {{ props.row.effectiveDate }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('equipmentMaintenancePlan.endDate')">
            {{ props.row.endDate }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('equipmentMaintenancePlan.remark')" :span="2">
            {{ props.row.remark }}
          </DescriptionsItem>
        </Descriptions>

        <!-- 查看模式下显示查看按钮 -->
        <div class="mt-4 flex gap-2">
          <Button type="primary" @click="equipmentDrawerVisible = true">
            <Icon
              icon="mdi:format-list-bulleted"
              class="inline-block align-middle"
            />
            {{ $t('equipmentMaintenancePlan.bindEquipment') }}
          </Button>
          <Button type="primary" @click="itemDrawerVisible = true">
            <Icon
              icon="mdi:clipboard-check-outline"
              class="inline-block align-middle"
            />
            {{ $t('equipmentMaintenancePlan.maintenanceItem') }}
          </Button>
        </div>
      </div>

      <Form
        v-else
        ref="formRef"
        layout="vertical"
        :model="formData"
      >
      <FormItem :label="$t('equipmentMaintenancePlan.planName')" name="planName">
        <Input
          v-model:value="formData.planName"
          :disabled="mode === 'view'"
          :placeholder="$t('equipmentMaintenancePlan.keywordPlaceholder')"
        />
      </FormItem>

      <FormItem :label="$t('equipmentMaintenancePlan.schemeName')" name="schemeId">
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

      <!-- 查看绑定设备和保养项按钮 -->
      <div v-if="formData.schemeId" class="mb-4 flex gap-2">
        <Button type="link" @click="equipmentDrawerVisible = true">
          <Icon
            icon="mdi:format-list-bulleted"
            class="inline-block align-middle"
          />
          {{ $t('equipmentMaintenancePlan.bindEquipment') }}
        </Button>
        <Button type="link" @click="itemDrawerVisible = true">
          <Icon
            icon="mdi:clipboard-check-outline"
            class="inline-block align-middle"
          />
          {{ $t('equipmentMaintenancePlan.maintenanceItem') }}
        </Button>
      </div>

      <FormItem
        :label="$t('equipmentMaintenancePlan.firstExecuteTime')"
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
          :label="$t('equipmentMaintenancePlan.frequencyValue')"
          class="flex-1"
        >
          <Input v-model:value="formData.frequencyValue" type="number" />
        </FormItem>
        <FormItem :label="$t('equipmentMaintenancePlan.frequencyUnit')" class="flex-1">
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
          :label="$t('equipmentMaintenancePlan.effectiveDate')"
          class="flex-1"
        >
          <DatePicker
            v-model:value="formData.effectiveDate"
            format="YYYY-MM-DD"
            style="width: 100%"
          />
        </FormItem>
        <FormItem :label="$t('equipmentMaintenancePlan.endDate')" class="flex-1">
          <DatePicker
            v-model:value="formData.endDate"
            format="YYYY-MM-DD"
            style="width: 100%"
          />
        </FormItem>
      </div>

      <FormItem :label="$t('equipmentMaintenancePlan.status')">
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

      <FormItem :label="$t('equipmentMaintenancePlan.remark')">
        <Textarea v-model:value="formData.remark" :rows="3" />
      </FormItem>
      </Form>
    </Spin>

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
  <EquipmentMaintenancePlanEquipmentDrawer
    v-model:visible="equipmentDrawerVisible"
    :scheme-id="formData.schemeId"
  />

  <!-- 查看保养项抽屉 -->
  <EquipmentMaintenancePlanItemDrawer
    v-model:visible="itemDrawerVisible"
    :scheme-id="formData.schemeId"
  />
</template>
