<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue-iconify、#/api（createInspectionScheme、getInspectionSchemeById、queryScadaEquipLedgerByCode、searchBaseConfig、updateInspectionScheme）、#/locales、./EquipCheckItemSelectDrawer.vue、./EquipmentSelectDrawer.vue
 * [OUTPUT]: 对外提供 EquipmentSpotCheckSchemeDrawer 组件，支持新增/编辑/查看设备点检方案
 * [POS]: 设备点检管理模块 的 点检方案抽屉组件，被点检方案管理页面引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-25 10:17:00
 */
import type { InspectionScheme, InspectionSchemeSubmit } from '#/api';

import { ref, watch } from 'vue';

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
  Textarea,
} from 'ant-design-vue';

import {
  createInspectionScheme,
  getInspectionSchemeById,
  queryScadaEquipLedgerByCode,
  searchBaseConfig,
  updateInspectionScheme,
} from '#/api';
import { $t } from '#/locales';

import EquipCheckItemSelectDrawer from './EquipCheckItemSelectDrawer.vue';
import EquipmentSelectDrawer from './EquipmentSelectDrawer.vue';

defineOptions({
  name: 'EquipmentSpotCheckSchemeDrawer',
});

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  mode: 'add',
  row: null,
});

// Emits
const emit = defineEmits<{
  refresh: [];
  'update:visible': [value: boolean];
}>();

// Props 定义
interface Props {
  visible: boolean;
  mode: 'add' | 'edit' | 'view';
  row?: InspectionScheme | null;
}

// ========== 抽屉控制 ==========
// 抽屉内部可见性状态：与 props.visible 双向绑定
const drawerVisible = ref(props.visible);

// 监听 props 变化
watch(
  () => props.visible,
  (val) => {
    drawerVisible.value = val;
  },
);

// 监听抽屉内部状态变化
watch(drawerVisible, (val) => {
  emit('update:visible', val);
});

// ========== 下拉选项 ==========
// 点检类型选项：INSPECTION-点检、PATROL-巡检
const inspectionTypeOptions = [
  {
    label: $t('equipmentSpotCheckScheme.inspectionTypeInspection'),
    value: 'INSPECTION',
  },
  {
    label: $t('equipmentSpotCheckScheme.inspectionTypePatrol'),
    value: 'PATROL',
  },
];

const statusOptions = [
  { label: $t('equipmentSpotCheckScheme.statusActive'), value: 'ACTIVE' },
  { label: $t('equipmentSpotCheckScheme.statusDisabled'), value: 'DISABLED' },
];

// ========== 设备组下拉选项 ==========
// 设备组下拉选项列表：从基础配置接口获取
const equipmentGroupOptions = ref<any[]>([]);

/**
 * 加载设备组下拉选项。
 * @returns {void} 无返回值，结果更新到 equipmentGroupOptions。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function loadEquipmentGroupOptions() {
  searchBaseConfig({ configType: 'EQUIPMENT_GROUP' }).then((res: any[]) => {
    equipmentGroupOptions.value = (res || []).map((item: any) => ({
      label: item.configName,
      value: item.configCode,
    }));
  });
}

// ========== 表单数据 ==========
// 表单实例引用，用于表单验证
const formRef = ref<any>();
// 点检方案表单数据：包含方案名称、点检类型、设备组、设备编码、点检项明细等
const formData = ref<InspectionSchemeSubmit>({
  schemeName: '',
  inspectionType: 'INSPECTION',
  equipmentGroup: '',
  equipmentCodes: '',
  status: 'ACTIVE',
  remark: '',
  details: [],
});

const currentRow = ref<InspectionScheme | null>(null);

// ========== 表单验证规则 ==========
const rules: any = {
  schemeName: [
    {
      required: true,
      message: `请输入${$t('equipmentSpotCheckScheme.schemeName')}`,
      trigger: 'blur',
    },
  ],
  inspectionType: [
    {
      required: true,
      message: `请选择${$t('equipmentSpotCheckScheme.inspectionType')}`,
      trigger: 'change',
    },
  ],
  status: [
    {
      required: true,
      message: `请选择${$t('equipmentSpotCheckScheme.status')}`,
      trigger: 'change',
    },
  ],
  details: [
    {
      required: true,
      message: '请添加点巡检项',
      trigger: 'change',
      type: 'array',
      min: 1,
    },
  ],
};

// ========== 监听抽屉打开并加载数据 ==========
// 监听抽屉可见性变化，打开时根据 mode 加载数据或重置表单
watch(
  () => props.visible,
  (val) => {
    if (val) {
      // 加载设备组下拉选项
      loadEquipmentGroupOptions();
      if (props.mode === 'view' && props.row?.id) {
        // 查看模式：加载详情
        currentRow.value = props.row;
        getInspectionSchemeById(props.row.id).then((res: any) => {
          currentRow.value = res;
        });
      } else if (props.mode === 'edit' && props.row?.id) {
        // 编辑模式：加载详情并填充表单
        getInspectionSchemeById(props.row.id).then((res: any) => {
          const details = res.details || [];
          formData.value = {
            id: res.id,
            schemeName: res.schemeName,
            inspectionType: res.inspectionType,
            equipmentGroup: res.equipmentGroup || '',
            equipmentCodes: res.equipmentCodes || '',
            status: res.status,
            remark: res.remark || '',
            details,
          };
          // 加载已选设备
          if (res.equipmentCodes) {
            const codes = res.equipmentCodes.split(',').filter(Boolean);
            Promise.all(
              codes.map((code: string) => queryScadaEquipLedgerByCode(code)),
            ).then((results: any[]) => {
              selectedEquipments.value = results
                .filter(Boolean)
                .map((r: any) => ({
                  equipGroupCode: r.equipGroupCode,
                  equipGroupName: r.equipGroupName,
                  equipmentCode: r.equipmentCode,
                  equipmentName: r.equipmentName,
                  location: r.location,
                  model: r.model,
                  useDepartmentName: r.useDepartmentName,
                }));
            });
          }
        });
      } else {
        // 新增模式
        currentRow.value = null;
        selectedEquipments.value = [];
        formData.value = {
          schemeName: '',
          inspectionType: 'INSPECTION',
          equipmentGroup: '',
          equipmentCodes: '',
          status: 'ACTIVE',
          remark: '',
          details: [],
        };
      }
    }
  },
);

// ========== 关闭抽屉 ==========
/**
 * 关闭抽屉，通过 emit 触发父组件更新 visible 状态。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function handleClose() {
  drawerVisible.value = false;
}

// ========== 提交表单 ==========
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
      const api =
        props.mode === 'add' ? createInspectionScheme : updateInspectionScheme;

      api(formData.value).then(() => {
        message.success($t('common.successfulOperation'));
        handleClose();
        emit('refresh');
      });
    })
    .catch(() => {
      // 验证失败
    });
}

// ========== 点巡检项操作 ==========
/**
 * 删除指定索引的点巡检项，并重新排序序号。
 * @param {number} index - 要删除的项索引。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function removeDetailItem(index: number) {
  formData.value.details = formData.value.details.filter((_, i) => i !== index);
  // 重新排序
  formData.value.details = formData.value.details.map((item, i) => ({
    ...item,
    sequenceNo: i + 1,
  }));
}

// ========== 点检项选择抽屉 ==========
// 点检项选择抽屉可见性：控制 EquipCheckItemSelectDrawer 显示
const checkItemDrawerVisible = ref(false);

// 已选中的点检项列表（用于在抽屉中显示已选项）
const selectedCheckItems = ref<any[]>([]);

/**
 * 打开点检项选择抽屉，同步当前已选项。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function openCheckItemDrawer() {
  // 打开抽屉前，同步已选项到 selectedCheckItems
  selectedCheckItems.value =
    formData.value.details?.map((item) => ({
      checkItemCode: item.itemCode,
      checkItemName: item.itemName,
    })) || [];
  checkItemDrawerVisible.value = true;
}

/**
 * 处理点检项选择回调，重新生成 details 列表并覆盖现有选项。
 * @param {any[]} items - 选中的点检项数组。
 * @returns {void} 无返回值，结果更新到 formData.details。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function handleCheckItemSelect(items: any[]) {
  // 直接覆盖：重新生成 details 列表
  const newDetails = items.map((item, index) => ({
    sequenceNo: index + 1,
    itemCode: item.checkItemCode,
    itemName: item.checkItemName,
    itemRequirement: '',
    itemStandard: '',
  }));
  formData.value.details = newDetails;
}

// ========== 设备选择抽屉 ==========
// 设备选择抽屉可见性：控制 EquipmentSelectDrawer 显示
const equipmentDrawerVisible = ref(false);

// 已选中的设备列表
const selectedEquipments = ref<any[]>([]);

/**
 * 打开设备选择抽屉。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function openEquipmentDrawer() {
  equipmentDrawerVisible.value = true;
}

/**
 * 处理设备选择回调，更新已选设备列表和设备编码字段。
 * @param {any[]} equipments - 选中的设备数组。
 * @returns {void} 无返回值，结果更新到 selectedEquipments 和 formData.equipmentCodes。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function handleEquipmentSelect(equipments: any[]) {
  // 直接覆盖
  selectedEquipments.value = equipments;
  // 更新设备编码字段（逗号分隔）
  formData.value.equipmentCodes = (equipments || [])
    .map((e) => e.equipmentCode)
    .join(',');
}

/**
 * 移除指定索引的设备。
 * @param {number} index - 要移除的设备索引。
 * @returns {void} 无返回值。
 * @throws 无。
 * @since 2026-04-25 10:17:00
 */
function removeEquipment(index: number) {
  selectedEquipments.value.splice(index, 1);
  formData.value.equipmentCodes = (selectedEquipments.value || [])
    .map((e) => e.equipmentCode)
    .join(',');
}
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :title="
      mode === 'add'
        ? $t('equipmentSpotCheckScheme.addTitle')
        : mode === 'edit'
          ? $t('equipmentSpotCheckScheme.editTitle')
          : $t('equipmentSpotCheckScheme.detailTitle')
    "
    width="900"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <template v-if="mode === 'view' && currentRow">
      <!-- 查看模式 -->
      <Descriptions :column="2" bordered>
        <DescriptionsItem :label="$t('equipmentSpotCheckScheme.schemeName')">
          {{ currentRow.schemeName }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('equipmentSpotCheckScheme.inspectionType')"
        >
          {{
            currentRow.inspectionType === 'INSPECTION'
              ? $t('equipmentSpotCheckScheme.inspectionTypeInspection')
              : $t('equipmentSpotCheckScheme.inspectionTypePatrol')
          }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('equipmentSpotCheckScheme.equipmentGroup')"
        >
          {{ currentRow.equipmentGroup || '-' }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('equipmentSpotCheckScheme.equipmentCodes')"
        >
          {{ currentRow.equipmentCodes || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('equipmentSpotCheckScheme.status')">
          {{
            currentRow.status === 'ACTIVE'
              ? $t('equipmentSpotCheckScheme.statusActive')
              : $t('equipmentSpotCheckScheme.statusDisabled')
          }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('equipmentSpotCheckScheme.remark')"
          :span="2"
        >
          {{ currentRow.remark || '-' }}
        </DescriptionsItem>
      </Descriptions>

      <!-- 点巡检项明细 -->
      <div class="mt-4">
        <h4 class="mb-2 font-medium">
          {{ $t('equipmentSpotCheckScheme.item') }}
        </h4>
        <table class="detail-table">
          <thead>
            <tr>
              <th>{{ $t('equipmentSpotCheckScheme.sequenceNo') }}</th>
              <th>{{ $t('equipmentSpotCheckScheme.itemCode') }}</th>
              <th>{{ $t('equipmentSpotCheckScheme.itemName') }}</th>
              <th>{{ $t('equipmentSpotCheckScheme.itemRequirement') }}</th>
              <th>{{ $t('equipmentSpotCheckScheme.itemStandard') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in currentRow.details" :key="item.itemCode">
              <td>{{ item.sequenceNo }}</td>
              <td>{{ item.itemCode }}</td>
              <td>{{ item.itemName }}</td>
              <td>{{ item.itemRequirement }}</td>
              <td>{{ item.itemStandard }}</td>
            </tr>
            <tr v-if="!currentRow.details?.length">
              <td colspan="5" class="text-center">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-else>
      <!-- 新增/编辑模式 -->
      <Form ref="formRef" :model="formData" :rules="rules" layout="vertical">
        <Row :gutter="16">
          <Col :span="12">
            <FormItem
              :label="$t('equipmentSpotCheckScheme.schemeName')"
              name="schemeName"
            >
              <Input
                v-model:value="formData.schemeName"
                :placeholder="
                  $t('equipmentSpotCheckScheme.schemeNamePlaceholder')
                "
                :maxlength="100"
                show-count
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem
              :label="$t('equipmentSpotCheckScheme.inspectionType')"
              name="inspectionType"
            >
              <Select
                v-model:value="formData.inspectionType"
                :placeholder="
                  $t('equipmentSpotCheckScheme.inspectionTypePlaceholder')
                "
              >
                <SelectOption
                  v-for="item in inspectionTypeOptions"
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
            <FormItem :label="$t('equipmentSpotCheckScheme.equipmentGroup')">
              <Select
                v-model:value="formData.equipmentGroup"
                :placeholder="
                  $t('equipmentSpotCheckScheme.equipmentGroupPlaceholder')
                "
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
          </Col>
          <Col :span="12">
            <FormItem
              :label="
                $t('equipmentSpotCheckScheme.equipmentSelectDrawer.title')
              "
            >
              <Button type="dashed" block @click="openEquipmentDrawer">
                <Icon icon="mdi:plus" class="inline-block align-middle" />
                {{
                  $t(
                    'equipmentSpotCheckScheme.equipmentSelectDrawer.selectEquipment',
                  )
                }}
              </Button>
            </FormItem>
          </Col>
        </Row>

        <!-- 已选设备展示区域 -->
        <div
          v-if="selectedEquipments.length > 0"
          class="mb-4 p-3 border border-gray-200 rounded bg-gray-50"
        >
          <Row
            :gutter="8"
            align="middle"
            class="pb-2 mb-2 border-b border-gray-200"
          >
            <Col :span="6">
              <span class="font-medium">{{
                $t(
                  'equipmentSpotCheckScheme.equipmentSelectDrawer.equipmentCode',
                )
              }}</span>
            </Col>
            <Col :span="6">
              <span class="font-medium">{{
                $t(
                  'equipmentSpotCheckScheme.equipmentSelectDrawer.equipmentName',
                )
              }}</span>
            </Col>
            <Col :span="6">
              <span class="font-medium">{{
                $t(
                  'equipmentSpotCheckScheme.equipmentSelectDrawer.equipGroupName',
                )
              }}</span>
            </Col>
            <Col :span="5">
              <span class="font-medium">{{
                $t('equipmentSpotCheckScheme.equipmentSelectDrawer.location')
              }}</span>
            </Col>
            <Col :span="1" />
          </Row>
          <div
            v-for="(item, index) in selectedEquipments"
            :key="item.equipmentCode"
            class="mb-2 last:mb-0"
          >
            <Row :gutter="8" align="middle">
              <Col :span="6">
                <span>{{ item.equipmentCode }}</span>
              </Col>
              <Col :span="6">
                <span>{{ item.equipmentName }}</span>
              </Col>
              <Col :span="6">
                <span>{{ item.equipGroupName || '-' }}</span>
              </Col>
              <Col :span="5">
                <span>{{ item.location || '-' }}</span>
              </Col>
              <Col :span="1">
                <Button
                  type="link"
                  danger
                  size="small"
                  @click="removeEquipment(index)"
                >
                  <Icon icon="mdi:delete" />
                </Button>
              </Col>
            </Row>
          </div>
        </div>

        <Row :gutter="16">
          <Col :span="12">
            <FormItem
              :label="$t('equipmentSpotCheckScheme.status')"
              name="status"
            >
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
          <Col :span="12">
            <FormItem :label="$t('equipmentSpotCheckScheme.remark')">
              <Textarea
                v-model:value="formData.remark"
                :rows="2"
                :maxlength="500"
                show-count
              />
            </FormItem>
          </Col>
        </Row>

        <!-- 点巡检项 -->
        <div class="mb-4">
          <div class="mb-2 font-medium">
            {{ $t('equipmentSpotCheckScheme.item') }}
          </div>
          <div class="border border-gray-200 rounded p-3 bg-gray-50">
            <!-- 表头 -->
            <Row
              :gutter="8"
              align="middle"
              class="pb-2 mb-2 border-b border-gray-200"
            >
              <Col :span="4">
                <span class="font-medium">{{
                  $t('equipmentSpotCheckScheme.sequenceNo')
                }}</span>
              </Col>
              <Col :span="4">
                <span class="font-medium">{{
                  $t('equipmentSpotCheckScheme.itemCode')
                }}</span>
              </Col>
              <Col :span="4">
                <span class="font-medium">{{
                  $t('equipmentSpotCheckScheme.itemName')
                }}</span>
              </Col>
              <Col :span="8">
                <span class="font-medium">{{
                  $t('equipmentSpotCheckScheme.itemRequirement')
                }}</span>
              </Col>
              <Col :span="3">
                <span class="font-medium">{{
                  $t('equipmentSpotCheckScheme.itemStandard')
                }}</span>
              </Col>
              <Col :span="1" />
            </Row>
            <!-- 数据行 -->
            <div
              v-for="(item, index) in formData.details"
              :key="index"
              class="mb-2 pb-2 border-b border-dashed border-gray-200 last:mb-0 last:pb-0 last:border-b-0"
            >
              <Row :gutter="8" align="middle">
                <Col :span="4">
                  <span>{{ index + 1 }}</span>
                </Col>
                <Col :span="4">
                  <span>{{ item.itemCode || '-' }}</span>
                </Col>
                <Col :span="4">
                  <span>{{ item.itemName || '-' }}</span>
                </Col>
                <Col :span="8">
                  <Input
                    v-model:value="item.itemRequirement"
                    :placeholder="
                      $t('equipmentSpotCheckScheme.itemRequirementPlaceholder')
                    "
                  />
                </Col>
                <Col :span="3">
                  <Input
                    v-model:value="item.itemStandard"
                    :placeholder="
                      $t('equipmentSpotCheckScheme.itemStandardPlaceholder')
                    "
                  />
                </Col>
                <Col :span="1">
                  <Button
                    type="link"
                    danger
                    size="small"
                    @click="removeDetailItem(index)"
                  >
                    <Icon icon="mdi:delete" />
                  </Button>
                </Col>
              </Row>
            </div>

            <Button
              type="dashed"
              block
              @click="openCheckItemDrawer"
              class="mt-2"
            >
              <Icon icon="mdi:plus" class="inline-block align-middle" />
              {{ $t('equipmentSpotCheckScheme.addItem') }}
            </Button>
          </div>
        </div>
      </Form>
    </template>

    <!-- 底部按钮插槽 -->
    <template #footer>
      <Space class="w-full justify-end">
        <Button @click="handleClose">
          {{ mode === 'view' ? '关闭' : '取消' }}
        </Button>
        <Button v-if="mode !== 'view'" type="primary" @click="handleSubmit">
          确认
        </Button>
      </Space>
    </template>
  </Drawer>

  <!-- 点检项选择抽屉 -->
  <EquipCheckItemSelectDrawer
    v-model:visible="checkItemDrawerVisible"
    :selected-rows="selectedCheckItems"
    @select="handleCheckItemSelect"
  />

  <!-- 设备选择抽屉 -->
  <EquipmentSelectDrawer
    v-model:visible="equipmentDrawerVisible"
    :selected-rows="selectedEquipments"
    @select="handleEquipmentSelect"
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
  padding: 8px 12px;
  text-align: center;
  border: 1px solid #d9d9d9;
}

.detail-table th {
  font-weight: 500;
  background-color: #fafafa;
}

.text-center {
  text-align: center;
}
</style>
