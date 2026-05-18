<script lang="ts" setup>
/**
 * [INPUT]: 依赖 moldCategoryMgmt.service.ts、equipmentFailure.service.ts 中的 API
 * [OUTPUT]: 对外提供模具类别管理页面组件
 * [POS]: 设备管理模块 的模具类别管理页面，与 moldCategoryMgmt.service.ts 配合使用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-18 10:22:00
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
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteMoldCategoryById,
  disableMoldCategoryById,
  enableMoldCategoryById,
  getMoldCategoryPageList,
  saveMoldCategory,
  searchBaseConfig,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// region 常量定义

/** 状态选项：用于查询和显示启用/停用状态 */
const statusOptions = [
  { label: $t('moldCategoryMgmt.statusActive'), value: 'ACTIVE' },
  { label: $t('moldCategoryMgmt.statusDisabled'), value: 'DISABLED' },
];

/** 类别来源选项：客供(KG)和自制(ZZ) */
const sourceOptions = [
  { label: $t('moldCategoryMgmt.sourceKg'), value: 'KG' },
  { label: $t('moldCategoryMgmt.sourceZz'), value: 'ZZ' },
];

/** 恢复模式选项：百分比、固定值、手动、不恢复 */
const recoveryModeOptions = [
  { label: $t('moldCategoryMgmt.modePercent'), value: 'PERCENT' },
  { label: $t('moldCategoryMgmt.modeFixed'), value: 'FIXED' },
  { label: $t('moldCategoryMgmt.modeManual'), value: 'MANUAL' },
  { label: $t('moldCategoryMgmt.modeNone'), value: 'NONE' },
];

/** 设备组选项：从后端配置加载，非必填 */
const equipmentGroupOptions = ref<any[]>([]);

// endregion

// region 表格配置

/** 表格列配置：序号、编码、名称、来源、阈值、恢复模式、状态、操作 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: '序号' },
    {
      field: 'categoryCode',
      title: $t('moldCategoryMgmt.categoryCode'),
      minWidth: 120,
    },
    {
      field: 'categoryName',
      title: $t('moldCategoryMgmt.categoryName'),
      minWidth: 150,
    },
    {
      field: 'categorySource',
      title: $t('moldCategoryMgmt.categorySource'),
      minWidth: 120,
      slots: { default: 'categorySource' },
    },
    {
      field: 'warningThreshold',
      title: $t('moldCategoryMgmt.warningThreshold'),
      minWidth: 120,
    },
    {
      field: 'blockThreshold',
      title: $t('moldCategoryMgmt.blockThreshold'),
      minWidth: 120,
    },
    {
      field: 'recoveryMode',
      title: $t('moldCategoryMgmt.recoveryMode'),
      minWidth: 120,
      slots: { default: 'recoveryMode' },
    },
    {
      field: 'status',
      fixed: 'right',
      title: $t('moldCategoryMgmt.status'),
      minWidth: 80,
      slots: { default: 'status' },
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

// endregion

// region 查询参数

/** 查询参数：关键词模糊搜索、状态筛选、来源筛选 */
const queryParams = ref<any>({
  keyword: '',
  status: undefined,
  categorySource: undefined,
});

// endregion

// region 数据查询

/**
 * 分页查询模具类别列表。
 * @param {Object} params - 分页参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页条数
 * @returns {Promise<{total: number, items: any[]}>} 包含总数和数据列表的 Promise
 * @since 2026-05-18 10:22:00
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

    getMoldCategoryPageList(params)
      .then(({ total, results }) => {
        resolve({
          total: total || 0,
          items: results || [],
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

// endregion

// region 抽屉控制

/** 抽屉显示/隐藏状态 */
const drawerVisible = ref(false);
/** 抽屉标题：新增/编辑/详情 */
const drawerTitle = ref('');
/** 当前操作的行数据 */
const currentRow = ref<any>(null);
/** 是否为详情查看模式：详情模式下表单禁用 */
const isViewDetails = ref(false);
/** 表单实例引用 */
const editForm = ref();
/** 抽屉提交按钮 loading 状态 */
const drawerLoading = ref(false);

/** 表单验证规则：必填项校验 */
const editRules = ref<any>({
  categoryCode: [
    {
      required: true,
      message: $t('moldCategoryMgmt.categoryCodeRequired'),
      trigger: 'change',
    },
  ],
  categoryName: [
    {
      required: true,
      message: $t('moldCategoryMgmt.categoryNameRequired'),
      trigger: 'change',
    },
  ],
  categorySource: [
    {
      required: true,
      message: $t('moldCategoryMgmt.categorySourceRequired'),
      trigger: 'change',
    },
  ],
  warningThreshold: [
    {
      required: true,
      message: $t('moldCategoryMgmt.warningThresholdRequired'),
      trigger: 'change',
    },
  ],
  blockThreshold: [
    {
      required: true,
      message: $t('moldCategoryMgmt.blockThresholdRequired'),
      trigger: 'change',
    },
  ],
  recoveryMode: [
    {
      required: true,
      message: $t('moldCategoryMgmt.recoveryModeRequired'),
      trigger: 'change',
    },
  ],
});

/**
 * 重置表单数据为默认值。
 * @since 2026-05-18 10:22:00
 */
function resetFormData() {
  currentRow.value = {
    categoryCode: '',
    categoryName: '',
    categorySource: undefined,
    equipmentGroup: '',
    warningThreshold: undefined,
    blockThreshold: undefined,
    recoveryMode: undefined,
    recoveryPercent: undefined,
    recoveryFixed: undefined,
    advanceDays: undefined,
  };
}

/**
 * 打开新增抽屉，清空表单数据。
 * @since 2026-05-18 10:22:00
 */
function handleAdd() {
  resetFormData();
  drawerTitle.value = $t('moldCategoryMgmt.addTitle');
  isViewDetails.value = false;
  drawerVisible.value = true;
}

/**
 * 打开编辑抽屉，填充当前行数据。
 * @param {any} row - 当前操作的行数据对象
 * @since 2026-05-18 10:22:00
 */
function handleEdit(row: any) {
  currentRow.value = { ...row };
  drawerTitle.value = $t('moldCategoryMgmt.editTitle');
  isViewDetails.value = false;
  drawerVisible.value = true;
}

/**
 * 打开详情抽屉，填充当前行数据并禁用表单。
 * @param {any} row - 当前操作的行数据对象
 * @since 2026-05-18 10:22:00
 */
function handleView(row: any) {
  currentRow.value = { ...row };
  drawerTitle.value = $t('moldCategoryMgmt.detailTitle');
  isViewDetails.value = true;
  drawerVisible.value = true;
}

/**
 * 关闭抽屉，重置状态。
 * @since 2026-05-18 10:22:00
 */
function handleClose() {
  drawerVisible.value = false;
  currentRow.value = {};
  isViewDetails.value = false;
}

/**
 * 提交表单，校验通过后保存数据。
 * @returns {Promise<void>} 无返回值，成功后刷新表格
 * @throws {ValidationError} 表单校验失败时抛出
 * @since 2026-05-18 10:22:00
 */
function handleSubmit() {
  editForm.value.validate().then(() => {
    drawerLoading.value = true;
    const params = { ...currentRow.value };
    // 移除多余字段
    // delete params.id;
    // delete params.status;
    // delete params.cTime;
    // delete params.cUser;

    saveMoldCategory(params)
      .then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.query();
        handleClose();
      })
      .finally(() => {
        drawerLoading.value = false;
      });
  });
}

// endregion

// region 状态操作

/**
 * 启用模具类别，确认后调用 API。
 * @param {any} row - 当前操作的行数据对象，需包含 id
 * @since 2026-05-18 10:22:00
 */
function handleEnable(row: any) {
  Modal.confirm({
    cancelText: $t('common.cancel'),
    okText: $t('common.confirm'),
    okType: 'primary',
    onOk() {
      enableMoldCategoryById(row.id).then(() => {
        message.success($t('moldCategoryMgmt.enableSuccess'));
        gridApi.query();
      });
    },
    title: $t('moldCategoryMgmt.confirmEnable'),
  });
}

/**
 * 停用模具类别，确认后调用 API。
 * @param {any} row - 当前操作的行数据对象，需包含 id
 * @since 2026-05-18 10:22:00
 */
function handleDisable(row: any) {
  Modal.confirm({
    cancelText: $t('common.cancel'),
    okText: $t('common.confirm'),
    okType: 'primary',
    onOk() {
      disableMoldCategoryById(row.id).then(() => {
        message.success($t('moldCategoryMgmt.disableSuccess'));
        gridApi.query();
      });
    },
    title: $t('moldCategoryMgmt.confirmDisable'),
  });
}

/**
 * 删除模具类别，确认后调用 API。
 * @param {any} row - 当前操作的行数据对象，需包含 id
 * @since 2026-05-18 10:22:00
 */
function handleDelete(row: any) {
  Modal.confirm({
    cancelText: $t('common.cancel'),
    okText: $t('common.confirm'),
    okType: 'danger',
    onOk() {
      deleteMoldCategoryById(row.id).then(() => {
        message.success($t('moldCategoryMgmt.deleteSuccess'));
        gridApi.query();
      });
    },
    title: $t('moldCategoryMgmt.confirmDelete'),
  });
}

// endregion

// region 辅助方法

/**
 * 根据类别来源值获取对应的显示标签。
 * @param {string} source - 类别来源值，如 'KG'、'ZZ'
 * @returns {string} 对应的国际化标签，未找到时返回原值
 * @since 2026-05-18 10:22:00
 */
function getSourceLabel(source: string) {
  const option = sourceOptions.find((item) => item.value === source);
  return option ? option.label : source;
}

/**
 * 根据恢复模式值获取对应的显示标签。
 * @param {string} mode - 恢复模式值，如 'PERCENT'、'FIXED'
 * @returns {string} 对应的国际化标签，未找到时返回原值
 * @since 2026-05-18 10:22:00
 */
function getRecoveryModeLabel(mode: string) {
  const option = recoveryModeOptions.find((item) => item.value === mode);
  return option ? option.label : mode;
}

/**
 * 判断是否显示恢复百分比或固定值输入框。
 * @param {string} mode - 恢复模式值
 * @returns {boolean} 当模式为 PERCENT 或 FIXED 时返回 true
 * @since 2026-05-18 10:22:00
 */
function showRecoveryField(mode: string) {
  return mode === 'PERCENT' || mode === 'FIXED';
}

// endregion

// region 权限控制

/** 用户权限列表：用于控制按钮显示和操作权限 */
const author = ref<string[]>([]);

/**
 * 从后端加载设备组配置选项。
 * @returns {Promise<void>} 无返回值，结果赋值给 equipmentGroupOptions
 * @since 2026-05-18 10:22:00
 */
function loadEquipmentGroupOptions() {
  searchBaseConfig({ configType: 'EQUIPMENT_GROUP' }).then((res: any[]) => {
    equipmentGroupOptions.value = (res || []).map((item: any) => ({
      label: item.configName,
      value: item.configCode,
    }));
  });
}

/**
 * 组件挂载时执行：加载用户权限和设备组选项。
 * @since 2026-05-18 10:22:00
 */
onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  loadEquipmentGroupOptions();
});

// endregion

/** 路由实例：用于获取路由元信息中的权限编码 */
const route = useRoute();
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 关键词搜索 -->
        <FormItem
          :label="$t('moldCategoryMgmt.keyword')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.keyword"
            :placeholder="$t('moldCategoryMgmt.keywordPlaceholder')"
            allow-clear
            style="width: 200px"
          />
        </FormItem>

        <!-- 状态筛选 -->
        <FormItem
          :label="$t('moldCategoryMgmt.status')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.status"
            :options="statusOptions"
            allow-clear
            placeholder="请选择状态"
            style="width: 120px"
          />
        </FormItem>

        <!-- 类别来源筛选 -->
        <FormItem
          :label="$t('moldCategoryMgmt.categorySource')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.categorySource"
            :options="sourceOptions"
            allow-clear
            placeholder="请选择来源"
            style="width: 120px"
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
                  keyword: '',
                  status: undefined,
                  categorySource: undefined,
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
        <!-- 工具栏 -->
        <template #toolbar-tools>
          <Button
            v-if="author.includes('新增')"
            type="primary"
            @click="handleAdd"
          >
            {{ $t('common.add') }}
          </Button>
        </template>

        <!-- 类别来源插槽 -->
        <template #categorySource="{ row }">
          <Tag>{{ getSourceLabel(row.categorySource) }}</Tag>
        </template>

        <!-- 恢复模式插槽 -->
        <template #recoveryMode="{ row }">
          <Tag>{{ getRecoveryModeLabel(row.recoveryMode) }}</Tag>
        </template>

        <!-- 状态插槽 -->
        <template #status="{ row }">
          <Switch
            :disabled="!author.includes('状态变更')"
            :checked="row.status === 'ACTIVE'"
            checked-children="启用"
            un-checked-children="停用"
            @change="
              () =>
                row.status === 'ACTIVE' ? handleDisable(row) : handleEnable(row)
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
      :width="500"
      :footer-style="{ textAlign: 'right' }"
      :destroy-on-close="true"
      @close="handleClose"
    >
      <Form
        ref="editForm"
        :label-col="{ span: 6 }"
        :model="currentRow"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
      >
        <!-- 类别编码 -->
        <FormItem
          :label="$t('moldCategoryMgmt.categoryCode')"
          name="categoryCode"
        >
          <Input
            v-model:value="currentRow.categoryCode"
            :disabled="isViewDetails"
          />
        </FormItem>

        <!-- 类别名称 -->
        <FormItem
          :label="$t('moldCategoryMgmt.categoryName')"
          name="categoryName"
        >
          <Input
            v-model:value="currentRow.categoryName"
            :disabled="isViewDetails"
          />
        </FormItem>

        <!-- 类别来源 -->
        <FormItem
          :label="$t('moldCategoryMgmt.categorySource')"
          name="categorySource"
        >
          <Select
            v-model:value="currentRow.categorySource"
            :disabled="isViewDetails"
            :options="sourceOptions"
            placeholder="请选择类别来源"
          />
        </FormItem>

        <!-- 适用设备组 -->
        <FormItem :label="$t('moldCategoryMgmt.equipmentGroup')">
          <Select
            v-model:value="currentRow.equipmentGroup"
            :disabled="isViewDetails"
            :options="equipmentGroupOptions"
            allow-clear
            placeholder="请选择设备组"
          />
        </FormItem>

        <!-- 预警阈值 -->
        <FormItem
          :label="$t('moldCategoryMgmt.warningThreshold')"
          name="warningThreshold"
        >
          <InputNumber
            v-model:value="currentRow.warningThreshold"
            :disabled="isViewDetails"
            :max="100"
            :min="0"
            style="width: 100%"
          />
        </FormItem>

        <!-- 拦截阈值 -->
        <FormItem
          :label="$t('moldCategoryMgmt.blockThreshold')"
          name="blockThreshold"
        >
          <InputNumber
            v-model:value="currentRow.blockThreshold"
            :disabled="isViewDetails"
            :max="100"
            :min="0"
            style="width: 100%"
          />
        </FormItem>

        <!-- 恢复模式 -->
        <FormItem
          :label="$t('moldCategoryMgmt.recoveryMode')"
          name="recoveryMode"
        >
          <Select
            v-model:value="currentRow.recoveryMode"
            :disabled="isViewDetails"
            :options="recoveryModeOptions"
            placeholder="请选择恢复模式"
          />
        </FormItem>

        <!-- 恢复百分比 -->
        <FormItem
          v-if="
            showRecoveryField(currentRow?.recoveryMode) &&
            currentRow?.recoveryMode === 'PERCENT'
          "
          :label="$t('moldCategoryMgmt.recoveryPercent')"
        >
          <InputNumber
            v-model:value="currentRow.recoveryPercent"
            :disabled="isViewDetails"
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
          :label="$t('moldCategoryMgmt.recoveryFixed')"
        >
          <InputNumber
            v-model:value="currentRow.recoveryFixed"
            :disabled="isViewDetails"
            :min="0"
            style="width: 100%"
          />
        </FormItem>

        <!-- 提前预警天数 -->
        <FormItem :label="$t('moldCategoryMgmt.advanceDays')">
          <InputNumber
            v-model:value="currentRow.advanceDays"
            :disabled="isViewDetails"
            :min="0"
            style="width: 100%"
          />
        </FormItem>

        <!-- 创建时间(详情页显示) -->
        <FormItem
          v-if="isViewDetails"
          :label="$t('moldCategoryMgmt.createTime')"
        >
          <Input v-model:value="currentRow.cTime" disabled />
        </FormItem>

        <!-- 创建人(详情页显示) -->
        <FormItem
          v-if="isViewDetails"
          :label="$t('moldCategoryMgmt.createUser')"
        >
          <Input v-model:value="currentRow.cUser" disabled />
        </FormItem>
      </Form>

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
