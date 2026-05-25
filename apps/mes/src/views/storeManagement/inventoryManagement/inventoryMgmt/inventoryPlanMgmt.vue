<script lang="ts" setup>
/**
 * [INPUT]: 依赖 inventoryPlanMgmt.service.ts 中的 API
 * [OUTPUT]: 对外提供盘点计划管理页面组件
 * [POS]: 库存管理模块 的盘点计划管理页面，与 inventoryPlanMgmt.service.ts 配合使用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-22 09:31:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Switch,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteInventoryPlan,
  fetchInventoryPlanList,
  fetchStocktakingMaterialList,
  fetchWarehouseList,
  insertInventoryPlan,
  toggleInventoryPlanStatus,
  updateInventoryPlan,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// ========== 下拉选项 ==========

/** 盘点类型选项 */
const stocktakingTypeOptions = [
  { label: $t('inventoryPlanMgmt.fullInventory'), value: 2 },
  { label: $t('inventoryPlanMgmt.drawing'), value: 1 },
];

/** 盘点周期类型选项 */
const cycleTypeOptions = [
  { label: $t('inventoryPlanMgmt.monthly'), value: 1 },
  { label: $t('inventoryPlanMgmt.yearly'), value: 2 },
];

/** 执行时间选项 */
const executeTimeOptions = [
  { label: $t('inventoryPlanMgmt.thisPeriod'), value: 1 },
  { label: $t('inventoryPlanMgmt.nextPeriod'), value: 2 },
];

/** 仓库列表选项 */
const warehouseOptions = ref<{ label: string; value: string }[]>([]);

/** 物料选项（编辑抽屉中使用） */
const materialOptions = ref<{ label: string; value: string }[]>([]);

// ========== 表格配置 ==========

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: '序号' },
    {
      field: 'stocktakingCode',
      title: $t('inventoryPlanMgmt.stocktakingCode'),
      minWidth: 150,
    },
    {
      field: 'stocktakingName',
      title: $t('inventoryPlanMgmt.stocktakingName'),
      minWidth: 150,
    },
    {
      field: 'stocktakingType',
      title: $t('inventoryPlanMgmt.stocktakingType'),
      width: 100,
      slots: { default: 'stocktakingType' },
    },
    {
      field: 'warehouseCode',
      title: $t('inventoryPlanMgmt.warehouseCode'),
      minWidth: 120,
      slots: { default: 'warehouseCode' },
    },
    {
      field: 'cycleType',
      title: $t('inventoryPlanMgmt.cycleType'),
      width: 120,
      slots: { default: 'cycleType' },
    },
    {
      field: 'cycle',
      title: $t('inventoryPlanMgmt.cycle'),
      width: 100,
    },
    {
      field: 'executeTime',
      title: $t('inventoryPlanMgmt.executeTime'),
      width: 120,
      slots: { default: 'executeTime' },
    },
    {
      field: 'isUse',
      fixed: 'right',
      title: $t('inventoryPlanMgmt.isUse'),
      width: 80,
      slots: { default: 'isUse' },
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 200,
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// ========== 查询参数 ==========

const queryParams = ref<any>({
  warehouseCode: undefined,
  stocktakingCode: '',
  stocktakingName: '',
  cycleType: undefined,
});

// ========== 数据查询 ==========

/**
 * 分页查询盘点计划列表。
 * @param {Object} params - 分页参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页条数
 * @returns {Promise<{total: number, items: any[]}>} 包含总数和数据列表的 Promise
 * @since 2026-05-22 09:31:00
 */
function queryData({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) {
  return new Promise((resolve) => {
    const params = {
      ...queryParams.value,
      pageNum,
      pageSize,
    };

    fetchInventoryPlanList(params)
      .then(({ total, list }) => {
        resolve({
          total: total || 0,
          items: list || [],
        });
      })
      .catch(() => {
        resolve({
          total: 0,
          items: [],
        });
      });
  });
}

// ========== 抽屉控制 ==========

const drawerVisible = ref(false);
const drawerTitle = ref('');
const currentRow = ref<any>(null);
const isViewDetails = ref(false);
const editForm = ref();
const drawerLoading = ref(false);

/** 表单验证规则 */
const editRules = ref<any>({
  stocktakingName: [
    {
      required: true,
      message: $t('inventoryPlanMgmt.stocktakingNameRequired'),
      trigger: 'change',
    },
  ],
  stocktakingType: [
    {
      required: true,
      message: $t('inventoryPlanMgmt.stocktakingTypeRequired'),
      trigger: 'change',
    },
  ],
  cycleType: [
    {
      required: true,
      message: $t('inventoryPlanMgmt.cycleTypeRequired'),
      trigger: 'change',
    },
  ],
  cycle: [
    {
      required: true,
      message: $t('inventoryPlanMgmt.cycleRequired'),
      trigger: 'change',
    },
  ],
});

/**
 * 重置表单数据为默认值。
 * @since 2026-05-22 09:31:00
 */
function resetFormData() {
  currentRow.value = {
    stocktakingName: '',
    stocktakingType: undefined,
    warehouseCodes: [],
    cycleType: undefined,
    cycle: undefined,
    executeTime: undefined,
    details: [],
  };
}

/**
 * 打开新增抽屉。
 * @since 2026-05-22 09:31:00
 */
function handleAdd() {
  resetFormData();
  drawerTitle.value = $t('inventoryPlanMgmt.addTitle');
  isViewDetails.value = false;
  drawerVisible.value = true;
}

/**
 * 打开编辑抽屉。
 * @param {any} row - 当前操作的行数据对象
 * @since 2026-05-22 09:31:00
 */
function handleEdit(row: any) {
  currentRow.value = {
    id: row.id,
    stocktakingName: row.stocktakingName,
    stocktakingType: row.stocktakingType,
    warehouseCodes: row.warehouseCode ? row.warehouseCode.split(',') : [],
    cycleType: row.cycleType,
    cycle: row.cycle,
    executeTime: row.executeTime,
    details: (row.details || []).map((item: any) => ({
      id: item.id,
      planId: item.planId,
      materialCode: item.materialCode,
    })),
    details_values: (row.details || []).map((item: any) => item.materialCode),
  };
  drawerTitle.value = $t('inventoryPlanMgmt.editTitle');
  isViewDetails.value = false;
  // 加载对应仓库的物料选项
  const params =
    currentRow.value.warehouseCodes?.length > 0
      ? currentRow.value.warehouseCodes
      : [];
  loadMaterialOptions(params);
  drawerVisible.value = true;
}

/**
 * 打开详情抽屉。
 * @param {any} row - 当前操作的行数据对象
 * @since 2026-05-22 09:31:00
 */
function handleView(row: any) {
  currentRow.value = { ...row };
  drawerTitle.value = $t('inventoryPlanMgmt.detailTitle');
  isViewDetails.value = true;
  drawerVisible.value = true;
}

/**
 * 关闭抽屉，重置状态。
 * @since 2026-05-22 09:31:00
 */
function handleClose() {
  drawerVisible.value = false;
  currentRow.value = {};
  isViewDetails.value = false;
}

/**
 * 提交表单，校验通过后保存数据。
 * @throws {ValidationError} 表单校验失败时抛出
 * @since 2026-05-22 09:31:00
 */
function handleSubmit() {
  editForm.value.validate().then(() => {
    drawerLoading.value = true;
    const row = currentRow.value;
    const params: any = {
      cycle: row.cycle,
      executeTime: row.executeTime ?? 1,
      cycleType: row.cycleType,
      details: row.details || [],
      stocktakingName: row.stocktakingName,
      stocktakingType: row.stocktakingType,
      warehouseCodes: row.warehouseCodes || [],
    };

    const apiCall = row.id
      ? updateInventoryPlan({ ...params, id: row.id })
      : insertInventoryPlan(params);

    apiCall
      .then(() => {
        message.success(
          row.id
            ? $t('inventoryPlanMgmt.updateSuccess')
            : $t('inventoryPlanMgmt.insertSuccess'),
        );
        gridApi.query();
        handleClose();
      })
      .finally(() => {
        drawerLoading.value = false;
      });
  });
}

// ========== 状态操作 ==========

/**
 * 启用盘点计划。
 * @param {any} row - 当前操作的行数据对象
 * @since 2026-05-22 09:31:00
 */
function handleEnable(row: any) {
  Modal.confirm({
    cancelText: $t('common.cancel'),
    okText: $t('common.confirm'),
    okType: 'primary',
    onOk() {
      toggleInventoryPlanStatus(row.id).then(() => {
        message.success($t('inventoryPlanMgmt.enableSuccess'));
        gridApi.query();
      });
    },
    title: $t('inventoryPlanMgmt.confirmEnable'),
  });
}

/**
 * 停用盘点计划。
 * @param {any} row - 当前操作的行数据对象
 * @since 2026-05-22 09:31:00
 */
function handleDisable(row: any) {
  Modal.confirm({
    cancelText: $t('common.cancel'),
    okText: $t('common.confirm'),
    okType: 'primary',
    onOk() {
      toggleInventoryPlanStatus(row.id).then(() => {
        message.success($t('inventoryPlanMgmt.disableSuccess'));
        gridApi.query();
      });
    },
    title: $t('inventoryPlanMgmt.confirmDisable'),
  });
}

/**
 * 删除盘点计划。
 * @param {any} row - 当前操作的行数据对象
 * @since 2026-05-22 09:31:00
 */
function handleDelete(row: any) {
  Modal.confirm({
    cancelText: $t('common.cancel'),
    okText: $t('common.confirm'),
    okType: 'danger',
    onOk() {
      deleteInventoryPlan(row.id).then(() => {
        message.success($t('inventoryPlanMgmt.deleteSuccess'));
        gridApi.query();
      });
    },
    title: $t('inventoryPlanMgmt.confirmDelete'),
  });
}

// ========== 辅助方法 ==========

/**
 * 根据盘点类型值获取显示标签。
 * @param {number} type - 盘点类型值
 * @returns {string} 对应的国际化标签
 * @since 2026-05-22 09:31:00
 */
function getStocktakingTypeLabel(type: number) {
  const option = stocktakingTypeOptions.find((item) => item.value === type);
  return option ? option.label : '-';
}

/**
 * 根据周期类型值获取显示标签。
 * @param {number} type - 周期类型值
 * @returns {string} 对应的国际化标签
 * @since 2026-05-22 09:31:00
 */
function getCycleTypeLabel(type: number) {
  const option = cycleTypeOptions.find((item) => item.value === type);
  return option ? option.label : '-';
}

/**
 * 根据执行时间值获取显示标签。
 * @param {number} time - 执行时间值
 * @returns {string} 对应的国际化标签
 * @since 2026-05-22 09:31:00
 */
function getExecuteTimeLabel(time: number) {
  const option = executeTimeOptions.find((item) => item.value === time);
  return option ? option.label : '-';
}

/**
 * 根据仓库编号获取仓库名称。
 * @param {string|null} code - 仓库编号
 * @returns {string} 仓库名称或"全仓库"
 * @since 2026-05-22 09:31:00
 */
function getWarehouseLabel(row: any) {
  if (!row.warehouseCode) return $t('inventoryPlanMgmt.allWarehouse');
  const arr: string[] = [];

  row.warehouseList.forEach((item: any) => {
    arr.push(item.warehouseName);
  });
  return arr.join(',');
}

/**
 * 加载仓库列表选项。
 * @since 2026-05-22 09:31:00
 */
function loadWarehouseOptions() {
  fetchWarehouseList().then((res) => {
    warehouseOptions.value = (res || []).map((item) => ({
      label: item.warehouseName,
      value: item.warehouseCode,
    }));
  });
}

/**
 * 根据仓库编号加载物料选项。
 * @param {string[]} warehouseCodeList - 仓库编号列表
 * @since 2026-05-22 09:31:00
 */
function loadMaterialOptions(warehouseCodeList: any) {
  fetchStocktakingMaterialList(warehouseCodeList).then((res) => {
    materialOptions.value = (res || []).map((item) => ({
      label: `${item.materialCode} - ${item.materialName}`,
      value: item.materialCode,
    }));
  });
}

/**
 * 盘点范围变更时重新加载物料选项。
 * @param {string[]} codes - 仓库编号列表
 * @since 2026-05-22 09:31:00
 */
function onWarehouseChange(codes: any) {
  currentRow.value.details = [];
  loadMaterialOptions(codes);
}

// ========== 权限控制 ==========

const author = ref<string[]>([]);
const route = useRoute();

/**
 * 组件挂载时执行：加载用户权限和仓库选项。
 * @since 2026-05-22 09:31:00
 */
onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  loadWarehouseOptions();
});
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 盘点范围 -->
        <FormItem
          :label="$t('inventoryPlanMgmt.warehouseCode')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.warehouseCode"
            :options="warehouseOptions"
            :placeholder="$t('inventoryPlanMgmt.warehouseCode')"
            allow-clear
            style="width: 160px"
          />
        </FormItem>

        <!-- 盘点计划编号 -->
        <FormItem
          :label="$t('inventoryPlanMgmt.stocktakingCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.stocktakingCode"
            :placeholder="$t('inventoryPlanMgmt.stocktakingCodePlaceholder')"
            allow-clear
            style="width: 180px"
          />
        </FormItem>

        <!-- 盘点计划名称 -->
        <FormItem
          :label="$t('inventoryPlanMgmt.stocktakingName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.stocktakingName"
            :placeholder="$t('inventoryPlanMgmt.stocktakingNamePlaceholder')"
            allow-clear
            style="width: 180px"
          />
        </FormItem>

        <!-- 盘点周期类型 -->
        <FormItem
          :label="$t('inventoryPlanMgmt.cycleType')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.cycleType"
            :options="cycleTypeOptions"
            :placeholder="$t('inventoryPlanMgmt.cycleType')"
            allow-clear
            style="width: 140px"
          />
        </FormItem>

        <!-- 查询按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="gridApi.reload()">
            {{ $t('common.search') }}
          </Button>
        </FormItem>

        <!-- 重置按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button
            @click="
              () => {
                queryParams = {
                  warehouseCode: undefined,
                  stocktakingCode: '',
                  stocktakingName: '',
                  cycleType: undefined,
                };
                gridApi.reload();
              }
            "
          >
            {{ $t('common.reset') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid>
        <!-- 工具栏：新增按钮 -->
        <template #toolbar-tools>
          <Button
            v-if="author.includes('新增')"
            type="primary"
            @click="handleAdd"
          >
            {{ $t('common.add') }}
          </Button>
        </template>

        <!-- 盘点类型插槽 -->
        <template #stocktakingType="{ row }">
          <Tag>{{ getStocktakingTypeLabel(row.stocktakingType) }}</Tag>
        </template>

        <!-- 盘点范围插槽 -->
        <template #warehouseCode="{ row }">
          <span>{{ getWarehouseLabel(row) }}</span>
        </template>

        <!-- 周期类型插槽 -->
        <template #cycleType="{ row }">
          <Tag>{{ getCycleTypeLabel(row.cycleType) }}</Tag>
        </template>

        <!-- 执行时间插槽 -->
        <template #executeTime="{ row }">
          <span>{{ getExecuteTimeLabel(row.executeTime) }}</span>
        </template>

        <!-- 起停用状态插槽 -->
        <template #isUse="{ row }">
          <Switch
            :disabled="!author.includes('状态变更')"
            :checked="row.isUse === 1"
            checked-children="启用"
            un-checked-children="停用"
            @change="
              () => (row.isUse === 1 ? handleDisable(row) : handleEnable(row))
            "
          />
        </template>

        <!-- 操作插槽 -->
        <template #action="{ row }">
          <Space>
            <!-- 查看详情 -->
            <Tooltip>
              <template #title>{{ $t('common.view') }}</template>
              <Button type="link" @click="handleView(row)">
                <Icon
                  icon="mdi:eye"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>

            <!-- 编辑 -->
            <Tooltip v-if="author.includes('编辑')">
              <template #title>{{ $t('common.edit') }}</template>
              <Button type="link" @click="handleEdit(row)">
                <Icon
                  icon="mdi:edit-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>

            <!-- 删除 -->
            <Tooltip v-if="author.includes('删除')">
              <template #title>{{ $t('common.delete') }}</template>
              <Button type="link" danger @click="handleDelete(row)">
                <Icon
                  icon="mdi-light:delete"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 新增/编辑/详情抽屉 -->
    <Drawer
      v-model:open="drawerVisible"
      :loading="drawerLoading"
      :title="drawerTitle"
      :width="600"
      :footer-style="{ textAlign: 'right' }"
      :destroy-on-close="true"
      @close="handleClose"
    >
      <!-- 详情模式：使用 Descriptions 描述列表展示 -->
      <template v-if="isViewDetails">
        <Descriptions :column="1" bordered size="small">
          <Descriptions.Item :label="$t('inventoryPlanMgmt.stocktakingCode')">
            {{ currentRow.stocktakingCode || '-' }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('inventoryPlanMgmt.stocktakingName')">
            {{ currentRow.stocktakingName || '-' }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('inventoryPlanMgmt.stocktakingType')">
            <Tag>{{ getStocktakingTypeLabel(currentRow.stocktakingType) }}</Tag>
          </Descriptions.Item>
          <Descriptions.Item :label="$t('inventoryPlanMgmt.warehouseCode')">
            <span>{{ getWarehouseLabel(currentRow) }}</span>
          </Descriptions.Item>
          <Descriptions.Item :label="$t('inventoryPlanMgmt.cycleType')">
            <Tag>{{ getCycleTypeLabel(currentRow.cycleType) }}</Tag>
          </Descriptions.Item>
          <Descriptions.Item :label="$t('inventoryPlanMgmt.cycle')">
            {{ currentRow.cycle || '-' }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('inventoryPlanMgmt.executeTime')">
            {{ getExecuteTimeLabel(currentRow.executeTime) }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('inventoryPlanMgmt.createTime')">
            {{ currentRow.createTime || '-' }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('inventoryPlanMgmt.details')">
            <template
              v-if="currentRow.details && currentRow.details.length > 0"
            >
              <Tag
                v-for="item in currentRow.details"
                :key="item.id || item.materialCode"
                class="mb-1"
              >
                {{ item.materialCode }}
              </Tag>
            </template>
            <span v-else>-</span>
          </Descriptions.Item>
        </Descriptions>
      </template>

      <!-- 新增/编辑模式：表单 -->
      <template v-else>
        <Form
          ref="editForm"
          :label-col="{ span: 6 }"
          :model="currentRow"
          :rules="editRules"
          :wrapper-col="{ span: 16 }"
        >
          <!-- 盘点计划名称 -->
          <FormItem
            :label="$t('inventoryPlanMgmt.stocktakingName')"
            name="stocktakingName"
          >
            <Input
              v-model:value="currentRow.stocktakingName"
              :placeholder="$t('inventoryPlanMgmt.stocktakingNamePlaceholder')"
            />
          </FormItem>

          <!-- 盘点类型 -->
          <FormItem
            :label="$t('inventoryPlanMgmt.stocktakingType')"
            name="stocktakingType"
          >
            <Select
              v-model:value="currentRow.stocktakingType"
              :options="stocktakingTypeOptions"
              :placeholder="$t('inventoryPlanMgmt.stocktakingType')"
            />
          </FormItem>

          <!-- 盘点范围（多选仓库） -->
          <FormItem :label="$t('inventoryPlanMgmt.warehouseCode')">
            <Select
              v-model:value="currentRow.warehouseCodes"
              :options="warehouseOptions"
              :placeholder="$t('inventoryPlanMgmt.warehouseCode')"
              mode="multiple"
              allow-clear
              @change="onWarehouseChange"
            />
          </FormItem>

          <!-- 物料选择 -->
          <FormItem :label="$t('inventoryPlanMgmt.materialCode')">
            <Select
              v-model:value="currentRow.details_values"
              :options="materialOptions"
              :placeholder="$t('inventoryPlanMgmt.selectMaterial')"
              mode="multiple"
              allow-clear
              :field-names="{ label: 'label', value: 'value' }"
              @change="
                (val: any) => {
                  currentRow.details = (val || []).map((v: string) => ({
                    materialCode: v,
                  }));
                }
              "
            />
          </FormItem>

          <!-- 盘点周期类型 -->
          <FormItem :label="$t('inventoryPlanMgmt.cycleType')" name="cycleType">
            <Select
              v-model:value="currentRow.cycleType"
              :options="cycleTypeOptions"
              :placeholder="$t('inventoryPlanMgmt.cycleType')"
            />
          </FormItem>

          <!-- 盘点周期 -->
          <FormItem :label="$t('inventoryPlanMgmt.cycle')" name="cycle">
            <InputNumber
              v-model:value="currentRow.cycle"
              :min="1"
              :max="31"
              style="width: 100%"
              :placeholder="
                currentRow.cycleType === 2
                  ? $t('inventoryPlanMgmt.cycleYearlyHint')
                  : $t('inventoryPlanMgmt.cycleMonthlyHint')
              "
            />
          </FormItem>

          <!-- 执行时间 -->
          <FormItem :label="$t('inventoryPlanMgmt.executeTime')">
            <Select
              v-model:value="currentRow.executeTime"
              :options="executeTimeOptions"
              :placeholder="$t('inventoryPlanMgmt.executeTime')"
            />
          </FormItem>
        </Form>
      </template>

      <template #footer>
        <Space>
          <Button @click="handleClose">
            {{ $t('common.cancel') }}
          </Button>
          <Button v-if="!isViewDetails" type="primary" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
