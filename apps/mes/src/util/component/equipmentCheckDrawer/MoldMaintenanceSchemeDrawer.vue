<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、dayjs、@iconify/vue、#/api（保养方案相关接口）、#/locales
 * [OUTPUT]: 对外提供 MoldMaintenanceSchemeDrawer 组件，支持新增/编辑/查看模具保养方案
 * [POS]: 设备点检管理模块 的 模具保养方案抽屉组件，被 moldMaintenanceScheme.vue 引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-25 15:40:00
 */
import type {
  MoldMaintenanceItem,
  MoldMaintenanceScheme,
} from '#/api/equipManagement/moldMaintenanceScheme.service';

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

import MoldSelectDrawer from './MoldSelectDrawer.vue';

interface Props {
  visible: boolean;
  mode: 'add' | 'edit' | 'view';
  row?: MoldMaintenanceScheme | null;
}

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
const loading = ref(false);
const submitting = ref(false);
const fetching = ref(false);

// ========== 模具类别下拉选项 ==========
const moldCategoryOptions = ref<Array<{ label: string; value: string }>>([]);
let searchTimer: null | ReturnType<typeof setTimeout> = null;

// ========== 模具选择 ==========
const moldDrawerVisible = ref(false);
const selectedMolds = ref<any[]>([]);

// ========== 表单数据 ==========
const formRef = ref<any>();
const formData = ref<any>({
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
    }
  },
);

// ========== 加载模具类别列表 ==========
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

function handleCategorySearch(value: string) {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  searchTimer = setTimeout(() => {
    loadMoldCategoryOptions(value);
  }, 300);
}

// ========== 模具选择 ==========
function openMoldDrawer() {
  moldDrawerVisible.value = true;
}

function handleMoldSelect(molds: any[]) {
  selectedMolds.value = molds;
  formData.value.moldCodes = (molds || []).map((m) => m.moldCode).join(',');
}

function removeMold(index: number) {
  selectedMolds.value.splice(index, 1);
  formData.value.moldCodes = (selectedMolds.value || [])
    .map((m) => m.moldCode)
    .join(',');
}

// ========== 加载详情 ==========
function loadDetail() {
  if (!props.row?.id) return;
  loading.value = true;
  getMoldMaintenanceSchemeById(props.row.id)
    .then((res: any) => {
      formData.value = {
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
function resetForm() {
  formData.value = {
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

// ========== 手动添加保养项 ==========
function addDetailItem() {
  const newItem: MoldMaintenanceItem = {
    sequenceNo: formData.value.details.length + 1,
    itemCode: '',
    itemName: '',
    itemRequirement: '',
    itemStandard: '',
  };
  formData.value.details.push(newItem);
}

// ========== 删除保养项 ==========
function removeDetailItem(index: number) {
  formData.value.details.splice(index, 1);
  // 重新编号
  formData.value.details.forEach((item: any, idx: number) => {
    item.sequenceNo = idx + 1;
  });
}

// ========== 提交 ==========
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
function handleClose() {
  emit('update:visible', false);
}

// ========== 标题 ==========
const drawerTitle = computed(() => {
  const titles: Record<string, string> = {
    add: $t('moldMaintenanceScheme.addTitle'),
    edit: $t('moldMaintenanceScheme.editTitle'),
    view: $t('moldMaintenanceScheme.viewTitle'),
  };
  return titles[props.mode] || '';
});

// ========== 详情数据 ==========
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
          <Col :span="12">
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
          <Col :span="12">
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
        <div
          v-if="selectedMolds.length > 0"
          class="mb-4 p-3 border border-gray-200 rounded bg-gray-50"
        >
          <Row
            :gutter="8"
            align="middle"
            class="pb-2 mb-2 border-b border-gray-200"
          >
            <Col :span="8">
              <span class="font-medium">{{
                $t('moldMaintenanceScheme.moldSelectDrawer.moldCode')
              }}</span>
            </Col>
            <Col :span="8">
              <span class="font-medium">{{
                $t('moldMaintenanceScheme.moldSelectDrawer.moldName')
              }}</span>
            </Col>
            <Col :span="7">
              <span class="font-medium">{{
                $t('moldMaintenanceScheme.moldSelectDrawer.moldCategoryName')
              }}</span>
            </Col>
            <Col :span="1" />
          </Row>
          <div
            v-for="(item, index) in selectedMolds"
            :key="item.moldCode"
            class="mb-2 last:mb-0"
          >
            <Row :gutter="8" align="middle">
              <Col :span="8">
                <span>{{ item.moldCode }}</span>
              </Col>
              <Col :span="8">
                <span>{{ item.moldName || '-' }}</span>
              </Col>
              <Col :span="7">
                <span>{{ item.moldCategoryName || '-' }}</span>
              </Col>
              <Col :span="1">
                <Button
                  type="link"
                  danger
                  size="small"
                  @click="removeMold(index)"
                >
                  <Icon icon="mdi:delete" />
                </Button>
              </Col>
            </Row>
          </div>
        </div>

        <FormItem :label="$t('moldMaintenanceScheme.remark')">
          <Textarea v-model:value="formData.remark" :rows="2" />
        </FormItem>

        <!-- 保养项列表 -->
        <div class="mt-4">
          <h4 class="mb-2 font-medium">
            {{ $t('moldMaintenanceScheme.maintenanceItems') }}
          </h4>

          <!-- 表头 -->
          <Row
            :gutter="8"
            type="flex"
            justify="center"
            align="middle"
            class="pb-2 mb-2 border-b border-gray-200"
          >
            <Col :span="2" class="text-center">
              <span class="font-medium">{{
                $t('moldMaintenanceScheme.itemDrawer.sequenceNo')
              }}</span>
            </Col>
            <Col :span="4" class="text-center">
              <span class="font-medium">{{
                $t('moldMaintenanceScheme.itemDrawer.itemCode')
              }}</span>
            </Col>
            <Col :span="4" class="text-center">
              <span class="font-medium">{{
                $t('moldMaintenanceScheme.itemDrawer.itemName')
              }}</span>
            </Col>
            <Col :span="8" class="text-center">
              <span class="font-medium">{{
                $t('moldMaintenanceScheme.itemDrawer.itemRequirement')
              }}</span>
            </Col>
            <Col :span="4" class="text-center">
              <span class="font-medium">{{
                $t('moldMaintenanceScheme.itemDrawer.itemStandard')
              }}</span>
            </Col>
            <Col :span="2" />
          </Row>

          <!-- 数据行 -->
          <div
            v-for="(item, index) in formData.details"
            :key="index"
            class="mb-2 pb-2 border-b border-dashed border-gray-200 last:mb-0 last:pb-0 last:border-b-0"
          >
            <Row :gutter="8" align="middle">
              <Col :span="2">
                <span>{{ (index as number) + 1 }}</span>
              </Col>
              <Col :span="4">
                <Input v-model:value="item.itemCode" size="small" />
              </Col>
              <Col :span="4">
                <Input v-model:value="item.itemName" size="small" />
              </Col>
              <Col :span="8">
                <Input
                  v-model:value="item.itemRequirement"
                  :placeholder="
                    $t(
                      'moldMaintenanceScheme.itemDrawer.itemRequirementPlaceholder',
                    )
                  "
                  size="small"
                />
              </Col>
              <Col :span="4">
                <Input
                  v-model:value="item.itemStandard"
                  :placeholder="
                    $t(
                      'moldMaintenanceScheme.itemDrawer.itemStandardPlaceholder',
                    )
                  "
                  size="small"
                />
              </Col>
              <Col :span="2">
                <Button
                  type="link"
                  danger
                  size="small"
                  @click="removeDetailItem(index as number)"
                >
                  <Icon icon="mdi:delete" />
                </Button>
              </Col>
            </Row>
          </div>

          <Button type="dashed" block @click="addDetailItem" class="mt-2">
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
