<script lang="ts" setup>
import type { ProductBindItem } from './MoldProductSelectDrawer.vue';

/**
 * [INPUT]: 依赖 moldArchiveMgmt.service.ts 中的 API、moldCategoryMgmt.service.ts 类别接口、#/locales、#/api/antdv-vxe-grid
 * [OUTPUT]: 对外提供 MoldArchiveDrawer 组件，支持新增/编辑/查看模具档案
 * [POS]: 设备管理模块 的模具档案抽屉组件，被 moldArchiveMgmt.vue 引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-18 10:50:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, ref, watch } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Tabs,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getMoldArchiveDetail,
  getMoldCategorySelectList,
  getProductRelations,
  getSupplierList,
  saveMoldArchive,
} from '#/api';
import { $t } from '#/locales';

import MoldProductSelectDrawer from './MoldProductSelectDrawer.vue';

// ========== Props & Emits ==========

interface Props {
  visible?: boolean;
  mode?: 'add' | 'edit' | 'view';
  row?: any | null;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'refresh'): void;
}

defineOptions({
  name: 'MoldArchiveDrawer',
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
const drawerVisible = ref(props.visible);

/** 当前激活的 Tab Key */
const activeTabKey = ref('baseInfo');

/** 当前操作的行数据 */
const currentRow = ref<any>({});

/** 表单实例引用 */
const editForm = ref();

/** 产品绑定表格数据 */
const productRelationList = ref<any[]>([]);

/** 类别选项：从后端加载 */
const categoryOptions = ref<any[]>([]);

/** 供应商选项：远程接口加载 */
const supplierOptions = ref<any[]>([]);

// ========== 下拉选项 ==========

/** 寿命类型选项 */
const lifespanTypeOptions = [
  { label: $t('moldArchiveMgmt.lifespanTypeCount'), value: 'COUNT' },
  { label: $t('moldArchiveMgmt.lifespanTypeTime'), value: 'TIME' },
];

// ========== 产品选择抽屉 ==========

/** 产品选择抽屉引用 */
const productSelectDrawerRef = ref<InstanceType<
  typeof MoldProductSelectDrawer
> | null>(null);

// ========== 恢复模式选项 */
const recoveryModeOptions = [
  { label: $t('moldArchiveMgmt.modePercent'), value: 'PERCENT' },
  { label: $t('moldArchiveMgmt.modeFixed'), value: 'FIXED' },
  { label: $t('moldArchiveMgmt.modeManual'), value: 'MANUAL' },
  { label: $t('moldArchiveMgmt.modeNone'), value: 'NONE' },
];

// ========== 标题 ==========

const drawerTitle = computed(() => {
  switch (props.mode) {
    case 'add': {
      return $t('moldArchiveMgmt.addTitle');
    }
    case 'edit': {
      return $t('moldArchiveMgmt.editTitle');
    }
    case 'view': {
      return $t('moldArchiveMgmt.detailTitle');
    }
    default: {
      return '';
    }
  }
});

// ========== 监听 ==========

watch(
  () => props.visible,
  (val) => {
    drawerVisible.value = val;
    if (val) {
      initData();
    }
  },
);

watch(drawerVisible, (val) => {
  emit('update:visible', val);
  // 抽屉关闭时重置 Tab
  if (!val) {
    activeTabKey.value = 'baseInfo';
  }
});

/**
 * 监听 Tab 切换，仅在查看模式下且切换到产品绑定 Tab 时加载数据。
 */
watch(activeTabKey, (key) => {
  if (props.mode === 'view' && key === 'productBinding') {
    reloadProductGrid();
  }
});

// ========== 初始化 ==========

function initData() {
  loadCategoryOptions();
  loadSupplierOptions();

  if (props.mode === 'add') {
    resetFormData();
  } else if (props.mode === 'edit' || props.mode === 'view') {
    loadDetail();
  }
}

/**
 * 重置表单数据为默认值。
 */
function resetFormData() {
  currentRow.value = {
    moldCode: '',
    moldName: '',
    categoryId: undefined,
    processId: undefined,
    stepId: undefined,
    location: '',
    supplierCode: '',
    supplierName: undefined,
    lifespanType: 'COUNT',
    totalLifespan: undefined,
    totalLifespanTime: undefined,
    standardCapacity: undefined,
    warningThreshold: undefined,
    blockThreshold: undefined,
    recoveryMode: undefined,
    recoveryPercent: undefined,
    recoveryFixed: undefined,
    advanceDays: undefined,
  };
  productRelationList.value = [];
  reloadProductGrid();
}

/**
 * 加载详情数据。
 */
function loadDetail() {
  loading.value = true;

  // 查看模式下只加载基础信息，产品绑定数据在 Tab 切换时懒加载
  if (props.mode === 'view') {
    getMoldArchiveDetail(props.row.id)
      .then((detailRes) => {
        currentRow.value = { ...detailRes };
        productRelationList.value = currentRow.value.productRelations;
      })
      .finally(() => {
        loading.value = false;
      });
  } else {
    Promise.all([
      getMoldArchiveDetail(props.row.id),
      getProductRelations(props.row.id),
    ])
      .then(([detailRes, prodRes]) => {
        currentRow.value = { ...detailRes };
        productRelationList.value = prodRes || [];
        reloadProductGrid();
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

/**
 * 加载模具类别选项。
 */
function loadCategoryOptions() {
  getMoldCategorySelectList({ status: 'ACTIVE' }).then((res: any[]) => {
    categoryOptions.value = (res || []).map((item: any) => ({
      label: item.categoryName,
      value: item.id,
    }));
  });
}

/**
 * 加载供应商选项（远程接口）。
 */
function loadSupplierOptions(keyword: string = '') {
  getSupplierList(keyword).then((res: any[]) => {
    supplierOptions.value = (res || []).map((item: any) => ({
      label: item.customerName,
      value: item.customerCode,
    }));
  });
}

/**
 * 供应商选择变化。
 */
function handleSupplierChange(value: any) {
  currentRow.value.supplierCode = value;
  const selected = supplierOptions.value.find((item) => item.value === value);
  currentRow.value.supplierName = selected?.label || '';
}

// ========== 辅助方法 ==========

/**
 * 根据寿命类型值获取对应的显示标签。
 */
function getLifespanTypeLabel(type: string) {
  const option = lifespanTypeOptions.find((item) => item.value === type);
  return option ? option.label : type;
}

/**
 * 根据恢复模式值获取对应的显示标签。
 */
function getRecoveryModeLabel(mode: string) {
  const option = recoveryModeOptions.find((item) => item.value === mode);
  return option ? option.label : mode;
}

/**
 * 判断是否显示恢复百分比或固定值输入框。
 */
function showRecoveryField(mode: string) {
  return mode === 'PERCENT' || mode === 'FIXED';
}

/**
 * 获取使用占比对应的颜色。
 */
function getUsagePercentColor(row: any) {
  const percent = row.usagePercent || 0;
  const block = row.blockThreshold || 100;
  const warning = row.warningThreshold || 100;

  if (percent >= block) {
    return 'red';
  } else if (percent >= warning) {
    return 'orange';
  }
  return 'green';
}

// ========== 产品绑定表格 ==========

/** 产品绑定表格列配置 */
const productColumn: any[] = [
  { type: 'seq', width: 50, title: '序号' },
  {
    field: 'productCode',
    title: $t('moldArchiveMgmt.productCode'),
    minWidth: 120,
  },
  {
    field: 'productModel',
    title: $t('moldArchiveMgmt.productModel'),
    minWidth: 120,
  },
  {
    field: 'cavityCount',
    title: $t('moldArchiveMgmt.cavityCount'),
    width: 100,
  },
  {
    field: 'isPrimary',
    title: $t('moldArchiveMgmt.isPrimary'),
    width: 100,
    slots: { default: 'isPrimary' },
  },
  {
    field: 'remark',
    title: $t('moldArchiveMgmt.remark'),
    minWidth: 120,
  },
  {
    field: 'action',
    title: '操作',
    fixed: 'right',
    width: 150,
    slots: { default: 'productAction' },
  },
];

/** 产品绑定表格配置 */
const productGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: productColumn,
  data: [],
  height: 200,
  pagerConfig: {
    enabled: false,
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

/** 查看模式下的表格配置（只读） */
const viewProductGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: productColumn.filter((col) => col.field !== 'action'),
  data: [],
  height: 300,
  pagerConfig: {
    enabled: false,
  },
  toolbarConfig: {
    custom: false,
    refresh: false,
    zoom: false,
  },
};

// 编辑模式使用 ProductGrid
const [ProductGrid, productGridApi] = useVbenVxeGrid({
  gridOptions: productGridOptions,
});

// 查看模式使用 ViewProductGrid（只读，无工具栏）
const [ViewProductGrid, viewProductGridApi] = useVbenVxeGrid({
  gridOptions: viewProductGridOptions,
});

/**
 * 刷新产品绑定表格数据（延迟 200ms）。
 */
function reloadProductGrid() {
  setTimeout(() => {
    if (props.mode === 'view') {
      viewProductGridApi.grid.loadData(productRelationList.value);
    } else {
      productGridApi.grid.loadData(productRelationList.value);
    }
  }, 200);
}

/**
 * 添加产品绑定行：打开产品选择抽屉。
 */
function handleAddProduct() {
  productSelectDrawerRef.value?.open();
}

/**
 * 确认添加/编辑产品绑定。
 * @param product - 选中的产品信息
 * @param isEdit - 是否为编辑模式
 * @param editIndex - 编辑时的行索引
 */
function handleProductConfirm(
  product: ProductBindItem,
  isEdit: boolean,
  editIndex?: null | number,
) {
  if (isEdit && editIndex !== undefined && editIndex !== null) {
    // 编辑模式：更新指定行
    productRelationList.value[editIndex] = { ...product };
  } else {
    // 新增模式：添加到列表
    productRelationList.value.push({ ...product });
  }
  reloadProductGrid();
}

/**
 * 编辑产品绑定行：打开产品选择抽屉并带入当前数据。
 */
function handleEditProduct(index: number) {
  productSelectDrawerRef.value?.openForEdit(
    productRelationList.value[index],
    index,
  );
}

/**
 * 删除产品绑定行（带二次确认）。
 */
function handleDeleteProduct(index: number) {
  Modal.confirm({
    title: $t('moldArchiveMgmt.confirmDeleteTitle'),
    content: $t('moldArchiveMgmt.confirmDeleteProductContent'),
    okText: '确认',
    cancelText: '取消',
    onOk() {
      productRelationList.value.splice(index, 1);
      reloadProductGrid();
    },
  });
}

// ========== 表单验证 ==========

const editRules = ref<any>({
  moldCode: [
    {
      required: true,
      message: $t('moldArchiveMgmt.moldCodeRequired'),
      trigger: 'change',
    },
  ],
  moldName: [
    {
      required: true,
      message: $t('moldArchiveMgmt.moldNameRequired'),
      trigger: 'change',
    },
  ],
});

// ========== 提交 ==========

/**
 * 关闭抽屉，重置状态。
 */
function handleClose() {
  drawerVisible.value = false;
}

/**
 * 提交表单，校验通过后保存数据。
 */
function handleSubmit() {
  editForm.value.validate().then(() => {
    submitting.value = true;
    const params = {
      ...currentRow.value,
      productRelations: productRelationList.value,
    };

    saveMoldArchive(params)
      .then(() => {
        message.success($t('common.successfulOperation'));
        emit('refresh');
        handleClose();
      })
      .finally(() => {
        submitting.value = false;
      });
  });
}
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :loading="loading"
    :title="drawerTitle"
    :width="700"
    :footer-style="{ textAlign: 'right' }"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <!-- 详情模式：使用描述列表展示 -->
    <template v-if="mode === 'view'">
      <Tabs v-model:active-key="activeTabKey">
        <Tabs.TabPane
          key="baseInfo"
          :tab="$t('moldArchiveMgmt.detail.baseInfo')"
        >
          <Descriptions :column="2" bordered size="small">
            <DescriptionsItem :label="$t('moldArchiveMgmt.moldCode')">
              {{ currentRow?.moldCode }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('moldArchiveMgmt.moldName')">
              {{ currentRow?.moldName }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('moldArchiveMgmt.moldGroupName')">
              {{ currentRow?.moldGroupName || '-' }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('moldArchiveMgmt.location')">
              {{ currentRow?.location || '-' }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('moldArchiveMgmt.supplierName')">
              {{ currentRow?.supplierName || '-' }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('moldArchiveMgmt.lifespanType')">
              {{ getLifespanTypeLabel(currentRow?.lifespanType) }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('moldArchiveMgmt.currentStatus')">
              {{ currentRow?.currentStatusName || '-' }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('moldArchiveMgmt.currentWorkOrderNo')">
              {{ currentRow?.currentWorkOrderNo || '-' }}
            </DescriptionsItem>
            <DescriptionsItem
              :label="$t('moldArchiveMgmt.currentEquipmentCode')"
            >
              {{ currentRow?.currentEquipmentCode || '-' }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('moldArchiveMgmt.installTime')">
              {{ currentRow?.installTime || '-' }}
            </DescriptionsItem>
          </Descriptions>
        </Tabs.TabPane>

        <Tabs.TabPane
          key="lifespanInfo"
          :tab="$t('moldArchiveMgmt.detail.lifespanInfo')"
        >
          <Descriptions :column="2" bordered size="small">
            <DescriptionsItem :label="$t('moldArchiveMgmt.totalLifespan')">
              {{ currentRow?.totalLifespan || '-' }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('moldArchiveMgmt.usedCount')">
              {{ currentRow?.usedCount || '-' }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('moldArchiveMgmt.remainingLifespan')">
              {{ currentRow?.remainingLifespan || '-' }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('moldArchiveMgmt.usagePercent')">
              <Tag :color="getUsagePercentColor(currentRow)">
                {{ currentRow?.usagePercent }}%
              </Tag>
            </DescriptionsItem>
            <DescriptionsItem :label="$t('moldArchiveMgmt.warningThreshold')">
              {{ currentRow?.warningThreshold }}%
            </DescriptionsItem>
            <DescriptionsItem :label="$t('moldArchiveMgmt.blockThreshold')">
              {{ currentRow?.blockThreshold }}%
            </DescriptionsItem>
            <DescriptionsItem :label="$t('moldArchiveMgmt.recoveryMode')">
              {{ getRecoveryModeLabel(currentRow?.recoveryMode) }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('moldArchiveMgmt.standardCapacity')">
              {{ currentRow?.standardCapacity || '-' }}
            </DescriptionsItem>
          </Descriptions>
        </Tabs.TabPane>

        <Tabs.TabPane
          key="productBinding"
          :tab="$t('moldArchiveMgmt.detail.productBinding')"
        >
          <ViewProductGrid>
            <template #isPrimary="{ row }">
              <Tag>
                {{
                  row.isPrimary === 1
                    ? $t('moldArchiveMgmt.isPrimaryYes')
                    : $t('moldArchiveMgmt.isPrimaryNo')
                }}
              </Tag>
            </template>
          </ViewProductGrid>
        </Tabs.TabPane>
      </Tabs>
    </template>

    <!-- 新增/编辑模式：使用表单 -->
    <template v-else>
      <Form
        ref="editForm"
        :label-col="{ span: 6 }"
        :model="currentRow"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
      >
        <!-- 模具编码 -->
        <FormItem :label="$t('moldArchiveMgmt.moldCode')" name="moldCode">
          <Input v-model:value="currentRow.moldCode" />
        </FormItem>

        <!-- 模具名称 -->
        <FormItem :label="$t('moldArchiveMgmt.moldName')" name="moldName">
          <Input v-model:value="currentRow.moldName" />
        </FormItem>

        <!-- 模具类别 -->
        <FormItem :label="$t('moldArchiveMgmt.categoryId')">
          <Select
            v-model:value="currentRow.categoryId"
            :options="categoryOptions"
            allow-clear
            :placeholder="$t('moldArchiveMgmt.categoryPlaceholder')"
          />
        </FormItem>

        <!-- 存放位置 -->
        <FormItem :label="$t('moldArchiveMgmt.location')">
          <Input v-model:value="currentRow.location" />
        </FormItem>

        <!-- 供应商 -->
        <FormItem :label="$t('moldArchiveMgmt.supplierName')">
          <Select
            v-model:value="currentRow.supplierCode"
            :options="supplierOptions"
            allow-clear
            show-search
            :filter-option="false"
            placeholder="请输入供应商名称搜索"
            @change="handleSupplierChange"
          />
        </FormItem>

        <!-- 寿命类型 -->
        <FormItem :label="$t('moldArchiveMgmt.lifespanType')">
          <Select
            v-model:value="currentRow.lifespanType"
            :options="lifespanTypeOptions"
          />
        </FormItem>

        <!-- 总寿命 -->
        <FormItem :label="$t('moldArchiveMgmt.totalLifespan')">
          <InputNumber
            v-model:value="currentRow.totalLifespan"
            :min="0"
            style="width: 100%"
          />
        </FormItem>

        <!-- 预警阈值 -->
        <FormItem :label="$t('moldArchiveMgmt.warningThreshold')">
          <InputNumber
            v-model:value="currentRow.warningThreshold"
            :max="100"
            :min="0"
            style="width: 100%"
          />
        </FormItem>

        <!-- 拦截阈值 -->
        <FormItem :label="$t('moldArchiveMgmt.blockThreshold')">
          <InputNumber
            v-model:value="currentRow.blockThreshold"
            :max="100"
            :min="0"
            style="width: 100%"
          />
        </FormItem>

        <!-- 恢复模式 -->
        <FormItem :label="$t('moldArchiveMgmt.recoveryMode')">
          <Select
            v-model:value="currentRow.recoveryMode"
            :options="recoveryModeOptions"
            allow-clear
            placeholder="请选择恢复模式"
          />
        </FormItem>

        <!-- 恢复百分比 -->
        <FormItem
          v-if="
            showRecoveryField(currentRow?.recoveryMode) &&
            currentRow?.recoveryMode === 'PERCENT'
          "
          :label="$t('moldArchiveMgmt.recoveryPercent')"
        >
          <InputNumber
            v-model:value="currentRow.recoveryPercent"
            :max="100"
            :min="0"
            style="width: 100%"
          />
        </FormItem>

        <!-- 恢复固定值 -->
        <FormItem
          v-if="
            showRecoveryField(currentRow?.recoveryMode) &&
            currentRow?.recoveryMode === 'FIXED'
          "
          :label="$t('moldArchiveMgmt.recoveryFixed')"
        >
          <InputNumber
            v-model:value="currentRow.recoveryFixed"
            :min="0"
            style="width: 100%"
          />
        </FormItem>

        <!-- 标准产能 -->
        <FormItem :label="$t('moldArchiveMgmt.standardCapacity')">
          <InputNumber
            v-model:value="currentRow.standardCapacity"
            :min="0"
            style="width: 100%"
          />
        </FormItem>
      </Form>

      <!-- 产品绑定区域 -->
      <div class="mt-4">
        <div class="flex items-center justify-between mb-2">
          <span class="font-medium">{{
            $t('moldArchiveMgmt.productRelation')
          }}</span>
          <Button size="small" type="primary" @click="handleAddProduct">
            <Icon icon="mdi:plus" class="inline-block align-middle" />
            {{ $t('common.add') }}
          </Button>
        </div>
        <ProductGrid>
          <template #isPrimary="{ row }">
            <Tag>
              {{
                row.isPrimary === 1
                  ? $t('moldArchiveMgmt.isPrimaryYes')
                  : $t('moldArchiveMgmt.isPrimaryNo')
              }}
            </Tag>
          </template>
          <template #productAction="{ rowIndex }">
            <Button
              type="link"
              size="small"
              @click="handleEditProduct(rowIndex)"
            >
              <Icon icon="mdi-pencil" class="inline-block align-middle" />
            </Button>
            <Button
              type="link"
              danger
              size="small"
              @click="handleDeleteProduct(rowIndex)"
            >
              <Icon
                icon="mdi-light:delete"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </template>
        </ProductGrid>
      </div>
    </template>

    <template #footer>
      <Space>
        <Button @click="handleClose">
          {{ $t('common.cancel') }}
        </Button>
        <Button
          v-if="mode !== 'view'"
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
        >
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>

  <!-- 产品选择抽屉 -->
  <MoldProductSelectDrawer
    ref="productSelectDrawerRef"
    @confirm="handleProductConfirm"
  />
</template>
