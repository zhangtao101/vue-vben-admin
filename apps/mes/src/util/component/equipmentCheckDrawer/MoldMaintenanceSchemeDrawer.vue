<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、dayjs、@iconify/vue、#/api（保养方案相关接口）、#/locales
 * [OUTPUT]: 对外提供 MoldMaintenanceSchemeDrawer 组件，支持新增/编辑/查看模具保养方案
 * [POS]: 设备点检管理模块 的 模具保养方案抽屉组件，被 moldMaintenanceScheme.vue 引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-06-16 09:25:00
 */
import type { MoldMaintenanceScheme } from '#/api/equipManagement/moldMaintenanceScheme.service';

import { computed, ref, watch } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Row,
  Select,
  SelectOption,
  Space,
  Spin,
  Switch,
  Textarea,
} from 'ant-design-vue';

import {
  createMoldMaintenanceScheme,
  getMoldBaseByCode,
  getMoldCategoryList,
  getMoldMaintenanceSchemeById,
  updateMoldMaintenanceScheme,
} from '#/api';
import { $t } from '#/locales';

import MoldMaintenanceItemSelectDrawer from './MoldMaintenanceItemSelectDrawer.vue';
import MoldSelectDrawer from './MoldSelectDrawer.vue';

/** Props 定义：visible(抽屉可见性)、mode(新增/编辑/查看)、row(编辑/查看时传入的行数据) */
interface Props {
  visible: boolean;
  mode: 'add' | 'edit' | 'view';
  row?: MoldMaintenanceScheme | null;
}

/** Emits 定义：update:visible(抽屉关闭)、refresh(刷新列表) */
interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'refresh'): void;
}

defineOptions({
  name: 'MoldMaintenanceSchemeDrawer',
});

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  mode: 'add',
  row: null,
});

const emit = defineEmits<Emits>();

// ========== 状态 ==========
/** 页面加载状态，控制 Spin 组件 */
const loading = ref(false);
/** 提交按钮 loading 状态 */
const submitting = ref(false);
/** 模具类别下拉加载状态 */
const fetching = ref(false);

// ========== 模具类别下拉选项 ==========
/** 模具类别下拉选项列表 */
const moldCategoryOptions = ref<Array<{ label: string; value: string }>>([]);
/** 搜索防抖定时器 */
let searchTimer: null | ReturnType<typeof setTimeout> = null;

// ========== 模具选择 ==========
/** 模具选择子抽屉可见性 */
const moldDrawerVisible = ref(false);
/** 已选中的模具列表 */
const selectedMolds = ref<any[]>([]);

// ========== 表单数据 ==========
/** 表单组件引用，用于提交时调用 validate */
const formRef = ref<any>();
/** 表单数据，包含方案基本信息、模具编码和保养项明细 */
const formData = ref<any>({
  schemeCode: '',
  schemeName: '',
  planType: 'REGULAR',
  isStopMachine: false,
  moldCategoryName: '',
  moldCodes: '',
  status: 'ACTIVE',
  remark: '',
  details: [],
});

// ========== 下拉选项 ==========
/** 计划类型选项：定期保养、视情保养 */
const planTypeOptions = [
  {
    label: $t('moldMaintenanceScheme.planTypeOptions.REGULAR'),
    value: 'REGULAR',
  },
  {
    label: $t('moldMaintenanceScheme.planTypeOptions.CONDITIONAL'),
    value: 'CONDITIONAL',
  },
];

/** 状态选项：启用、禁用 */
const statusOptions = [
  {
    label: $t('moldMaintenanceScheme.statusOptions.ACTIVE'),
    value: 'ACTIVE',
  },
  {
    label: $t('moldMaintenanceScheme.statusOptions.DISABLED'),
    value: 'DISABLED',
  },
];

// ========== 监听 ==========
/** 监听抽屉打开/关闭，打开时加载数据，关闭时清空状态 */
watch(
  () => props.visible,
  (val) => {
    if (val) {
      loadMoldCategoryOptions('');
      if (props.mode === 'view' || props.mode === 'edit') {
        loadDetail();
      } else {
        resetForm();
      }
    } else {
      // 关闭抽屉时清空表单数据和已选项，避免下次打开残留数据
      formData.value = {
        schemeCode: '',
        schemeName: '',
        planType: 'REGULAR',
        isStopMachine: false,
        moldCategoryName: '',
        moldCodes: '',
        status: 'ACTIVE',
        remark: '',
        details: [],
      };
      selectedMolds.value = [];
      maintenanceItemDrawerVisible.value = false;
      moldDrawerVisible.value = false;
    }
  },
);

// ========== 加载模具类别列表 ==========
/**
 * 加载模具类别下拉选项（支持关键词搜索）。
 * @param {string} keyword - 搜索关键词，空字符串表示加载全部。
 * @returns {void} 无返回值，结果写入 moldCategoryOptions。
 * @since 2026-06-16 09:25:00
 */
function loadMoldCategoryOptions(keyword: string) {
  fetching.value = true;
  getMoldCategoryList({ keyword })
    .then((res: any) => {
      moldCategoryOptions.value = (res || []).map((item: any) => ({
        label: item.categoryName,
        value: item.categoryName,
      }));
    })
    .finally(() => {
      fetching.value = false;
    });
}

/**
 * 模具类别搜索（300ms 防抖）。
 * @param {string} value - 搜索输入值。
 * @returns {void} 无返回值。
 * @since 2026-06-16 09:25:00
 */
function handleCategorySearch(value: string) {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  searchTimer = setTimeout(() => {
    loadMoldCategoryOptions(value);
  }, 300);
}

// ========== 模具选择 ==========
/**
 * 打开模具选择子抽屉。
 * @returns {void} 无返回值。
 * @since 2026-06-16 09:25:00
 */
function openMoldDrawer() {
  moldDrawerVisible.value = true;
}

/**
 * 处理模具选择回调，更新已选模具列表和表单 moldCodes 字段。
 * @param {any[]} molds - 选中的模具数组，每项含 moldCode、moldName 等字段。
 * @returns {void} 无返回值。
 * @since 2026-06-16 09:25:00
 */
function handleMoldSelect(molds: any[]) {
  selectedMolds.value = molds;
  formData.value.moldCodes = (molds || []).map((m) => m.moldCode).join(',');
}

/**
 * 从已选模具列表中移除指定项，并同步更新表单 moldCodes。
 * @param {number} index - 要移除的模具在列表中的索引。
 * @returns {void} 无返回值。
 * @since 2026-06-16 09:25:00
 */
function removeMold(index: number) {
  selectedMolds.value.splice(index, 1);
  formData.value.moldCodes = (selectedMolds.value || [])
    .map((m) => m.moldCode)
    .join(',');
}

// ========== 保养项选择抽屉 ==========
/** 保养项选择抽屉可见性 */
const maintenanceItemDrawerVisible = ref(false);

/** 已选中的保养项列表，用于传递到选择抽屉回显 */
const selectedMaintenanceItems = ref<any[]>([]);

/**
 * 打开保养项选择抽屉。
 * 同步当前表单中的保养项到已选项列表，然后打开抽屉。
 * @returns {void} 无返回值。
 * @since 2026-06-16 09:05:00
 */
function openMaintenanceItemDrawer() {
  selectedMaintenanceItems.value =
    formData.value.details?.map((item: any) => ({
      itemCode: item.itemCode,
      itemName: item.itemName,
    })) || [];
  maintenanceItemDrawerVisible.value = true;
}

/**
 * 处理保养项选择回调。
 * 将选择的保养项列表直接覆盖到表单明细中，自动生成序号。
 * @param {any[]} items - 选择的保养项数组，每项包含 configCode 和 configName。
 * @returns {void} 无返回值，直接替换 formData.value.details。
 * @since 2026-06-16 09:05:00
 */
function handleMaintenanceItemSelect(items: any[]) {
  const newDetails = items.map((item, index) => ({
    sequenceNo: index + 1,
    itemCode: item.configCode || item.checkItemCode || item.itemCode || '',
    itemName: item.configName || item.checkItemName || item.itemName || '',
    itemRequirement: item.itemRequirement || '',
    itemStandard: item.itemStandard || '',
  }));
  formData.value.details = newDetails;
}

// ========== 加载详情 ==========
/**
 * 加载模具保养方案详情（编辑/查看模式）。
 * 获取方案基本信息后，根据 moldCodes 逐条查询模具详情填充 selectedMolds。
 * @returns {void} 无返回值，结果写入 formData 和 selectedMolds。
 * @since 2026-06-16 09:25:00
 */
function loadDetail() {
  if (!props.row?.id) return;
  loading.value = true;
  getMoldMaintenanceSchemeById(props.row.id)
    .then((res: any) => {
      formData.value = {
        schemeCode: res.schemeCode || '',
        schemeName: res.schemeName || '',
        planType: res.planType || 'REGULAR',
        isStopMachine: res.isStopMachine || false,
        moldCategoryName: res.moldCategoryName || '',
        moldCodes: res.moldCodes || '',
        status: res.status || 'ACTIVE',
        remark: res.remark || '',
        details: res.details || [],
      };
      // 加载已选模具详情
      if (res.moldCodes) {
        const moldCodeList = res.moldCodes.split(',').filter(Boolean);
        Promise.all(
          moldCodeList.map((code: string) =>
            getMoldBaseByCode(code.trim()).catch(() => null),
          ),
        ).then((results: any[]) => {
          selectedMolds.value = results.filter(Boolean).map((r: any) => ({
            moldCode: r.moldCode,
            moldName: r.moldName,
            moldCategoryName: r.moldGroupName,
          }));
        });
      } else {
        selectedMolds.value = [];
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

// ========== 重置表单 ==========
/**
 * 重置表单数据和已选模具为空（新增模式专用）。
 * @returns {void} 无返回值。
 * @since 2026-06-16 09:25:00
 */
function resetForm() {
  formData.value = {
    schemeCode: '',
    schemeName: '',
    planType: 'REGULAR',
    isStopMachine: false,
    moldCategoryName: '',
    moldCodes: '',
    status: 'ACTIVE',
    remark: '',
    details: [],
  };
  selectedMolds.value = [];
}

// ========== 删除保养项 ==========
/**
 * 删除指定索引的保养项并重新编号，确保序号连续性。
 * @param {number} index - 要删除的保养项索引。
 * @returns {void} 无返回值。
 * @since 2026-06-16 09:25:00
 */
function removeDetailItem(index: number) {
  formData.value.details.splice(index, 1);
  // 重新编号
  formData.value.details.forEach((item: any, idx: number) => {
    item.sequenceNo = idx + 1;
  });
}

// ========== 提交 ==========
/**
 * 提交表单（新增/编辑），包含前置校验。
 * 根据 mode 自动调用 create 或 update 接口。
 * @returns {void} 无返回值，成功后关闭抽屉并触发 refresh。
 * @since 2026-06-16 09:25:00
 */
function handleSubmit() {
  formRef.value
    .validate()
    .then(() => {
      submitting.value = true;
      const params = {
        ...formData.value,
        details: formData.value.details.map((item: any, index: number) => ({
          sequenceNo: Number(index) + 1,
          itemCode: item.itemCode,
          itemName: item.itemName,
          itemRequirement: item.itemRequirement,
          itemStandard: item.itemStandard,
        })),
      };

      let api;
      if (props.mode === 'edit' && props.row?.id) {
        params.id = props.row.id;
        api = updateMoldMaintenanceScheme(params as any);
      } else {
        api = createMoldMaintenanceScheme(params as any);
      }

      api
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
 * 关闭抽屉，触发 update:visible 事件。
 * @returns {void} 无返回值。
 * @since 2026-06-16 09:25:00
 */
function handleClose() {
  emit('update:visible', false);
}

// ========== 标题 ==========
/** 根据 mode 动态计算抽屉标题 */
const drawerTitle = computed(() => {
  const titles: Record<string, string> = {
    add: $t('moldMaintenanceScheme.addTitle'),
    edit: $t('moldMaintenanceScheme.editTitle'),
    view: $t('moldMaintenanceScheme.viewTitle'),
  };
  return titles[props.mode] || '';
});

// ========== 详情数据 ==========
/** 查看模式的详情展示数据，基于 formData 计算 */
const detailData = computed(() => {
  if (props.mode !== 'view' || !props.row) return null;
  return formData.value;
});
</script>

<template>
  <Drawer
    :open="visible"
    :title="drawerTitle"
    width="900"
    :destroy-on-close="true"
    @update:open="(val) => emit('update:visible', val)"
  >
    <Spin :spinning="loading">
      <!-- 查看模式 -->
      <div v-if="mode === 'view' && detailData">
        <Descriptions :column="2" bordered>
          <DescriptionsItem :label="$t('moldMaintenanceScheme.schemeCode')">
            {{ detailData.schemeCode || '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('moldMaintenanceScheme.schemeName')">
            {{ detailData.schemeName }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('moldMaintenanceScheme.status')">
            {{
              detailData.status === 'ACTIVE'
                ? $t('moldMaintenanceScheme.statusOptions.ACTIVE')
                : $t('moldMaintenanceScheme.statusOptions.DISABLED')
            }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('moldMaintenanceScheme.planType')">
            {{
              detailData.planType === 'REGULAR'
                ? $t('moldMaintenanceScheme.planTypeOptions.REGULAR')
                : $t('moldMaintenanceScheme.planTypeOptions.CONDITIONAL')
            }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('moldMaintenanceScheme.isStopMachine')">
            {{ detailData.isStopMachine ? '是' : '否' }}
          </DescriptionsItem>
          <DescriptionsItem
            :label="$t('moldMaintenanceScheme.moldCategoryName')"
          >
            {{ detailData.moldCategoryName || '-' }}
          </DescriptionsItem>
          <DescriptionsItem
            :label="$t('moldMaintenanceScheme.remark')"
            :span="2"
          >
            {{ detailData.remark || '-' }}
          </DescriptionsItem>
        </Descriptions>

        <!-- 保养项表格 -->
        <div class="mt-4">
          <h4 class="mb-2 font-medium">
            {{ $t('moldMaintenanceScheme.maintenanceItems') }}
          </h4>
          <table class="detail-table">
            <thead>
              <tr>
                <th class="text-center">序号</th>
                <th class="text-center">
                  {{ $t('moldMaintenanceScheme.itemDrawer.itemCode') }}
                </th>
                <th class="text-center">
                  {{ $t('moldMaintenanceScheme.itemDrawer.itemName') }}
                </th>
                <th class="text-center">
                  {{ $t('moldMaintenanceScheme.itemDrawer.itemRequirement') }}
                </th>
                <th class="text-center">
                  {{ $t('moldMaintenanceScheme.itemDrawer.itemStandard') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in detailData.details" :key="index">
                <td class="text-center">{{ Number(index) + 1 }}</td>
                <td class="text-center">{{ item.itemCode || '-' }}</td>
                <td class="text-center">{{ item.itemName || '-' }}</td>
                <td class="text-center">{{ item.itemRequirement || '-' }}</td>
                <td class="text-center">{{ item.itemStandard || '-' }}</td>
              </tr>
              <tr v-if="!detailData.details || detailData.details.length === 0">
                <td colspan="5" class="text-center text-gray-400">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 新增/编辑模式 -->
      <Form v-else ref="formRef" layout="vertical" :model="formData">
        <Row :gutter="16">
          <Col v-if="mode !== 'add'" :span="8">
            <FormItem :label="$t('moldMaintenanceScheme.schemeCode')">
              <Input v-model:value="formData.schemeCode" disabled />
            </FormItem>
          </Col>
          <Col :span="mode === 'add' ? 12 : 8">
            <FormItem
              :label="$t('moldMaintenanceScheme.schemeName')"
              name="schemeName"
            >
              <Input
                v-model:value="formData.schemeName"
                :disabled="mode === 'edit'"
                :placeholder="$t('moldMaintenanceScheme.keywordPlaceholder')"
              />
            </FormItem>
          </Col>
          <Col :span="mode === 'add' ? 12 : 8">
            <FormItem :label="$t('moldMaintenanceScheme.planType')">
              <Select
                v-model:value="formData.planType"
                :disabled="mode === 'edit'"
              >
                <SelectOption
                  v-for="item in planTypeOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </SelectOption>
              </Select>
            </FormItem>
          </Col>
        </Row>

        <Row :gutter="16">
          <Col :span="12">
            <FormItem :label="$t('moldMaintenanceScheme.moldCategoryName')">
              <Select
                v-model:value="formData.moldCategoryName"
                show-search
                :filter-option="false"
                :not-found-content="fetching ? '加载中...' : '无匹配结果'"
                :placeholder="
                  $t('moldMaintenanceScheme.moldCategoryPlaceholder')
                "
                @search="handleCategorySearch"
              >
                <SelectOption
                  v-for="item in moldCategoryOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </SelectOption>
              </Select>
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem :label="$t('moldMaintenanceScheme.status')">
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
          </Col>
        </Row>

        <Row :gutter="16">
          <Col :span="12">
            <FormItem :label="$t('moldMaintenanceScheme.isStopMachine')">
              <Switch v-model:checked="formData.isStopMachine" />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem
              :label="$t('moldMaintenanceScheme.moldSelectDrawer.title')"
            >
              <Button type="dashed" block @click="openMoldDrawer">
                <Icon icon="mdi:plus" class="inline-block align-middle" />
                {{ $t('moldMaintenanceScheme.moldSelectDrawer.selectMold') }}
              </Button>
            </FormItem>
          </Col>
        </Row>

        <!-- 已选模具展示区域 -->
        <div v-if="selectedMolds.length > 0" class="mb-4">
          <table class="detail-table">
            <thead>
              <tr>
                <th class="text-center">
                  {{ $t('moldMaintenanceScheme.moldSelectDrawer.moldCode') }}
                </th>
                <th class="text-center">
                  {{ $t('moldMaintenanceScheme.moldSelectDrawer.moldName') }}
                </th>
                <th class="text-center">
                  {{
                    $t(
                      'moldMaintenanceScheme.moldSelectDrawer.moldCategoryName',
                    )
                  }}
                </th>
                <th class="text-center">
                  {{ $t('common.action') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in selectedMolds" :key="item.moldCode">
                <td>{{ item.moldCode }}</td>
                <td>{{ item.moldName || '-' }}</td>
                <td>{{ item.moldCategoryName || '-' }}</td>
                <td class="text-center">
                  <Button
                    type="link"
                    danger
                    size="small"
                    @click="removeMold(index)"
                  >
                    <Icon icon="mdi:delete" />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <FormItem :label="$t('moldMaintenanceScheme.remark')">
          <Textarea v-model:value="formData.remark" :rows="2" />
        </FormItem>

        <!-- 保养项列表 -->
        <div class="mt-4">
          <h4 class="mb-2 font-medium">
            {{ $t('moldMaintenanceScheme.maintenanceItems') }}
          </h4>

          <table class="detail-table">
            <thead>
              <tr>
                <th class="text-center">
                  {{ $t('moldMaintenanceScheme.itemDrawer.sequenceNo') }}
                </th>
                <th class="text-center">
                  {{ $t('moldMaintenanceScheme.itemDrawer.itemCode') }}
                </th>
                <th class="text-center">
                  {{ $t('moldMaintenanceScheme.itemDrawer.itemName') }}
                </th>
                <th class="text-center">
                  {{ $t('moldMaintenanceScheme.itemDrawer.itemRequirement') }}
                </th>
                <th class="text-center">
                  {{ $t('moldMaintenanceScheme.itemDrawer.itemStandard') }}
                </th>
                <th class="text-center">
                  {{ $t('common.action') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in formData.details" :key="index">
                <td class="text-center">{{ (index as number) + 1 }}</td>
                <td>{{ item.itemCode }}</td>
                <td>{{ item.itemName }}</td>
                <td>
                  <Input
                    v-model:value="item.itemRequirement"
                    :placeholder="
                      $t(
                        'moldMaintenanceScheme.itemDrawer.itemRequirementPlaceholder',
                      )
                    "
                    size="small"
                  />
                </td>
                <td>
                  <Input
                    v-model:value="item.itemStandard"
                    :placeholder="
                      $t(
                        'moldMaintenanceScheme.itemDrawer.itemStandardPlaceholder',
                      )
                    "
                    size="small"
                  />
                </td>
                <td class="text-center">
                  <Button
                    type="link"
                    danger
                    size="small"
                    @click="removeDetailItem(index as number)"
                  >
                    <Icon icon="mdi:delete" />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>

          <Button
            type="dashed"
            block
            @click="openMaintenanceItemDrawer"
            class="mt-2"
          >
            <Icon icon="mdi:plus" class="inline-block align-middle" />
            {{ $t('moldMaintenanceScheme.itemDrawer.addItem') }}
          </Button>
        </div>
      </Form>
    </Spin>

    <!-- 底部按钮插槽 -->
    <template #footer>
      <Space class="w-full justify-end">
        <Button @click="handleClose">
          {{ mode === 'view' ? $t('common.close') : $t('common.cancel') }}
        </Button>
        <Button
          v-if="mode !== 'view'"
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
        >
          <Icon icon="mdi:check" class="inline-block align-middle" />
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>

  <!-- 模具选择抽屉 -->
  <MoldSelectDrawer
    v-model:visible="moldDrawerVisible"
    :selected-rows="selectedMolds"
    @select="handleMoldSelect"
  />

  <!-- 保养项选择抽屉 -->
  <MoldMaintenanceItemSelectDrawer
    v-model:visible="maintenanceItemDrawerVisible"
    :selected-rows="selectedMaintenanceItems"
    @select="handleMaintenanceItemSelect"
  />
</template>

<style scoped>
/* 查看模式详情表格样式 */
.detail-table {
  width: 100%;
  font-size: 14px;
  border-collapse: collapse;
}

.detail-table th,
.detail-table td {
  padding: 8px;
  border: 1px solid #d9d9d9;
}

.detail-table th {
  font-weight: 500;
  background-color: #fafafa;
}
</style>
