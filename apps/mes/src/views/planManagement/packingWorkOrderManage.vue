<script lang="ts" setup>
/**
 * [INPUT]: 依赖 #/api (queryWorkSheetList/searchParentSubLine/exportWorkSheetList/
 *         deleteWorkSheet/confirmWorkSheet/cancelConfirmWorkSheet/saveWorkSheet/
 *         listWordListByParentCode)、#/util (queryAuth)、#/locales ($t)、
 *         planManagementDrawer 目录组件 (LinePersonPlanDrawer/LowerWorkOrderDrawer)
 * [OUTPUT]: 对外提供 packingWorkOrderManage 页面组件，提供包装工单查询、行内编辑保存、
 *           确认/取消确认/删除/Excel导出、各产线人员计划登录与下层工单生成入口
 * [POS]: 属于计划管理(planManagement)模块的包装工单管理主页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-09-24 10:00:00
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
  DatePicker,
  Form,
  FormItem,
  message,
  Modal,
  RangePicker,
  Select,
  Space,
  Spin,
} from 'ant-design-vue';
import dayjs from 'dayjs';
// eslint-disable-next-line n/no-extraneous-import
import { debounce } from 'lodash-es';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  cancelConfirmWorkSheet,
  confirmWorkSheet,
  deleteWorkSheet,
  exportWorkSheetList,
  listWordListByParentCode,
  queryWorkSheetList,
  saveWorkSheet,
  searchParentSubLine,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

import LinePersonPlanDrawer from '../../util/component/planManagementDrawer/LinePersonPlanDrawer.vue';
import LowerWorkOrderDrawer from '../../util/component/planManagementDrawer/LowerWorkOrderDrawer.vue';

/** 单别：包装工单 */
const PROCESS_TYPE = 4;
/** 班别字典父级编号 */
const SHIFT_PARENT_CODE = 'CLASSTYPE';

/** 作业状态选项（1-生成、2-确定、3-进行、4-完成、5-截止） */
const statusOptions = [
  { label: $t('packingWorkOrderManage.statusGenerated'), value: 1 },
  { label: $t('packingWorkOrderManage.statusConfirmed'), value: 2 },
  { label: $t('packingWorkOrderManage.statusRunning'), value: 3 },
  { label: $t('packingWorkOrderManage.statusFinished'), value: 4 },
  { label: $t('packingWorkOrderManage.statusClosed'), value: 5 },
];

// region 权限
const route = useRoute();
const author = ref<string[]>([]);

/**
 * 判断是否拥有指定操作权限（权限为空时默认放行）
 * @param {string} name 权限名称
 * @returns {boolean} 是否拥有权限
 * @since 2026-09-24
 */
function hasAuth(name: string) {
  return author.value.length === 0 || author.value.includes(name);
}
// endregion

// region 查询参数
const queryParams = ref<any>({
  // 作业日期范围
  workDateRange: [],
  // 产线（子产线编号）
  lineCode: undefined,
  // 品号
  productCode: undefined,
  // 班别
  shiftCode: undefined,
  // 作业状态（多选）
  status: [],
});
// endregion

// region 产线下拉（远程搜索 + 防抖）
const lineOptions = ref<{ label: string; value: string }[]>([]);
const lineLoading = ref(false);

const handleLineSearch = debounce((val: string) => {
  lineLoading.value = true;
  searchParentSubLine({
    lineName: val || undefined,
    pageNum: 1,
    pageSize: 20,
    processType: PROCESS_TYPE,
  })
    .then((res: any) => {
      const list = res?.list || [];
      lineOptions.value = list.map((item: any) => ({
        label: item.subLineName
          ? `${item.subLineCode}(${item.subLineName})`
          : item.subLineCode,
        value: item.subLineCode,
      }));
    })
    .finally(() => {
      lineLoading.value = false;
    });
}, 500);
// endregion

// region 品号下拉（远程搜索 + 防抖，接口待后续提供）
const productOptions = ref<{ label: string; value: string }[]>([]);
const productLoading = ref(false);

/**
 * 品号远程搜索
 * TODO: 品号下拉接口由后续步骤提供，接口就绪后在此处调用并填充 productOptions
 * @param {string} val 搜索关键字
 * @since 2026-09-24
 */
const handleProductSearch = debounce((_val: string) => {
  productLoading.value = false;
  productOptions.value = [];
}, 500);
// endregion

// region 班别下拉（页面初始化即查询）
const shiftOptions = ref<{ label: string; value: string }[]>([]);

/**
 * 加载班别字典（CLASSTYPE）
 * @since 2026-09-24
 */
function loadShiftOptions() {
  listWordListByParentCode(SHIFT_PARENT_CODE).then((res: any) => {
    const list = Array.isArray(res) ? res : [];
    shiftOptions.value = list.map((item: any) => ({
      label: item.wordName,
      value: item.wordCode,
    }));
  });
}
// endregion

// region 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: { highlight: true, reserve: true },
  rowConfig: { keyField: 'id' },
  columns: [
    { type: 'checkbox', width: 50, fixed: 'left' },
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    {
      field: 'workSheetCode',
      title: $t('packingWorkOrderManage.workSheetCode'),
      minWidth: 170,
    },
    {
      field: 'workDate',
      title: $t('packingWorkOrderManage.workDate'),
      minWidth: 150,
      slots: { default: 'workDateEdit' },
    },
    {
      field: 'shiftCode',
      title: $t('packingWorkOrderManage.shift'),
      minWidth: 130,
      slots: { default: 'shiftEdit' },
    },
    {
      field: 'priority',
      title: $t('packingWorkOrderManage.priority'),
      minWidth: 90,
    },
    {
      field: 'lineCode',
      title: $t('packingWorkOrderManage.subLineCode'),
      minWidth: 130,
    },
    {
      field: 'lineName',
      title: $t('packingWorkOrderManage.subLineName'),
      minWidth: 140,
    },
    {
      field: 'productCode',
      title: $t('packingWorkOrderManage.productCode'),
      minWidth: 120,
    },
    {
      field: 'productName',
      title: $t('packingWorkOrderManage.productName'),
      minWidth: 160,
    },
    {
      field: 'planQty',
      title: $t('packingWorkOrderManage.planQty'),
      minWidth: 100,
    },
    { field: 'unit', title: $t('packingWorkOrderManage.unit'), minWidth: 80 },
    {
      field: 'goodQty',
      title: $t('packingWorkOrderManage.goodQty'),
      minWidth: 100,
    },
    {
      field: 'defectQty',
      title: $t('packingWorkOrderManage.defectQty'),
      minWidth: 100,
    },
    {
      field: 'statusDesc',
      title: $t('packingWorkOrderManage.status'),
      minWidth: 100,
    },
    {
      field: 'indicateBatch',
      title: $t('packingWorkOrderManage.indicateBatch'),
      minWidth: 110,
    },
    {
      field: 'perBatchQty',
      title: $t('packingWorkOrderManage.perBatchQty'),
      minWidth: 140,
    },
    {
      field: 'goodBatch',
      title: $t('packingWorkOrderManage.goodBatch'),
      minWidth: 110,
    },
    {
      field: 'defectBatch',
      title: $t('packingWorkOrderManage.defectBatch'),
      minWidth: 110,
    },
    { field: 'remark', title: $t('packingWorkOrderManage.remark'), minWidth: 160 },
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

const gridEvents: VxeGridListeners<any> = {
  checkboxChange: () => {
    updateSelection();
  },
  checkboxAll: () => {
    updateSelection();
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });
// endregion

// region 数据查询
/**
 * 组装查询参数（含作业日期范围转换）
 * @param {number} pageNum 页码
 * @param {number} pageSize 每页条数
 * @returns {Record<string, any>} 接口入参
 * @since 2026-09-24
 */
function buildParams(pageNum: number, pageSize: number) {
  const [start, end] = queryParams.value.workDateRange || [];
  const statusList: number[] = queryParams.value.status || [];
  return {
    pageNum,
    pageSize,
    processType: PROCESS_TYPE,
    workDateStart: start ? dayjs(start).format('YYYY-MM-DD') : undefined,
    workDateEnd: end ? dayjs(end).format('YYYY-MM-DD') : undefined,
    lineCode: queryParams.value.lineCode || undefined,
    productCode: queryParams.value.productCode || undefined,
    shiftCode: queryParams.value.shiftCode || undefined,
    status: statusList.length > 0 ? statusList : undefined,
  };
}

/**
 * 查询工单列表
 * @param {object} params 分页参数
 * @param {number} params.pageNum 页码
 * @param {number} params.pageSize 每页条数
 * @returns {Promise<{ items: any[]; total: number }>} 分页数据
 * @since 2026-09-24
 */
function queryData({ pageNum, pageSize }: { pageNum: number; pageSize: number }) {
  return new Promise((resolve) => {
    queryWorkSheetList(buildParams(pageNum, pageSize))
      .then((res: any) => {
        resolve({
          total: res?.total || 0,
          items: res?.results || [],
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

/**
 * 重置查询条件
 * @since 2026-09-24
 */
function handleReset() {
  queryParams.value = {
    workDateRange: [],
    lineCode: undefined,
    productCode: undefined,
    shiftCode: undefined,
    status: [],
  };
  gridApi.reload();
}
// endregion

// region 选中行管理
const selectedRows = ref<any[]>([]);

/**
 * 同步表格勾选行（单选/全选均触发）
 * @since 2026-09-24
 */
function updateSelection() {
  selectedRows.value = gridApi.grid?.getCheckboxRecords() || [];
}
// endregion

// region 行内编辑与保存
/** 以工单ID为key记录被修改的行 */
const modifiedMap = new Map<number, any>();
const modifiedRows = ref<any[]>([]);

/**
 * 记录被修改的行
 * @param {any} row 工单行数据
 * @since 2026-09-24
 */
function handleFieldChange(row: any) {
  if (!row?.id) return;
  modifiedMap.set(row.id, { ...row });
  modifiedRows.value = Array.from(modifiedMap.values());
}

/**
 * 班别修改时同步班别名称并记录修改
 * @param {any} row 工单行数据
 * @since 2026-09-24
 */
function handleShiftChange(row: any) {
  const target = shiftOptions.value.find(
    (item) => item.value === row.shiftCode,
  );
  row.shiftName = target?.label || row.shiftName;
  handleFieldChange(row);
}

/**
 * 保存修改过的工单（作业日期、班别）
 * @since 2026-09-24
 */
function handleSave() {
  if (modifiedRows.value.length === 0) {
    message.warning($t('packingWorkOrderManage.noModifiedData'));
    return;
  }
  const data = modifiedRows.value.map((row: any) => ({
    id: row.id,
    shiftCode: row.shiftCode || '',
    shiftName: row.shiftName || '',
    workDate: row.workDate || '',
  }));
  saveWorkSheet(data)
    .then(() => {
      message.success($t('packingWorkOrderManage.operationSuccess'));
      modifiedMap.clear();
      modifiedRows.value = [];
      gridApi.reload();
    })
    .catch((error: any) => {
      message.error(error?.message || $t('packingWorkOrderManage.operationFailed'));
    });
}
// endregion

// region 工具栏操作
/**
 * Excel导出工单列表
 * @since 2026-09-24
 */
function handleExport() {
  const { lineCode, productCode, shiftCode, workDateEnd, workDateStart } =
    buildParams(1, 20);
  exportWorkSheetList({
    processType: PROCESS_TYPE,
    lineCode,
    productCode,
    shiftCode,
    workDateEnd,
    workDateStart,
  })
    .then((url: any) => {
      if (url) {
        window.open(url, '_blank');
      }
    })
    .catch(() => {
      message.error($t('packingWorkOrderManage.exportFailed'));
    });
}

/**
 * 批量删除工单
 * @since 2026-09-24
 */
function handleDelete() {
  if (selectedRows.value.length === 0) {
    message.warning($t('packingWorkOrderManage.selectDataFirst'));
    return;
  }
  Modal.confirm({
    title: $t('common.prompt'),
    content: $t('packingWorkOrderManage.deleteConfirm'),
    onOk: () => {
      return deleteWorkSheet(selectedRows.value.map((row: any) => row.id)).then(
        () => {
          message.success($t('packingWorkOrderManage.operationSuccess'));
          selectedRows.value = [];
          gridApi.reload();
        },
      );
    },
  });
}

/**
 * 工单确认
 * @since 2026-09-24
 */
function handleConfirm() {
  if (selectedRows.value.length === 0) {
    message.warning($t('packingWorkOrderManage.selectDataFirst'));
    return;
  }
  Modal.confirm({
    title: $t('common.prompt'),
    content: $t('packingWorkOrderManage.confirmWorkSheetTip'),
    onOk: () => {
      return confirmWorkSheet(selectedRows.value.map((row: any) => row.id)).then(
        () => {
          message.success($t('packingWorkOrderManage.operationSuccess'));
          selectedRows.value = [];
          gridApi.reload();
        },
      );
    },
  });
}

/**
 * 工单取消确认
 * @since 2026-09-24
 */
function handleCancelConfirm() {
  if (selectedRows.value.length === 0) {
    message.warning($t('packingWorkOrderManage.selectDataFirst'));
    return;
  }
  Modal.confirm({
    title: $t('common.prompt'),
    content: $t('packingWorkOrderManage.cancelConfirmWorkSheetTip'),
    onOk: () => {
      return cancelConfirmWorkSheet(
        selectedRows.value.map((row: any) => row.id),
      ).then(() => {
        message.success($t('packingWorkOrderManage.operationSuccess'));
        selectedRows.value = [];
        gridApi.reload();
      });
    },
  });
}
// endregion

// region 抽屉
const linePersonPlanDrawerRef = ref();
const lowerWorkOrderDrawerRef = ref();

/**
 * 打开各产线人员计划登录抽屉
 * @since 2026-09-24
 */
function handleLinePersonPlan() {
  linePersonPlanDrawerRef.value?.open(selectedRows.value);
}

/**
 * 打开下层工单生成抽屉
 * @since 2026-09-24
 */
function handleGenerateLowerWorkSheet() {
  lowerWorkOrderDrawerRef.value?.open(selectedRows.value);
}
// endregion

// region 初始化
onMounted(() => {
  if (route.meta.code) {
    queryAuth(route.meta.code as string).then((data) => {
      author.value = data;
    });
  }
  loadShiftOptions();
  handleLineSearch('');
});
// endregion
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 作业日期 -->
        <FormItem
          :label="$t('packingWorkOrderManage.workDate')"
          style="margin-bottom: 1em"
        >
          <RangePicker
            v-model:value="queryParams.workDateRange"
            :placeholder="[
              $t('packingWorkOrderManage.workDatePlaceholder'),
              $t('packingWorkOrderManage.workDatePlaceholder'),
            ]"
          />
        </FormItem>

        <!-- 产线 -->
        <FormItem
          :label="$t('packingWorkOrderManage.line')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.lineCode"
            :placeholder="$t('packingWorkOrderManage.linePlaceholder')"
            :options="lineOptions"
            :filter-option="false"
            :not-found-content="lineLoading ? undefined : null"
            :default-active-first-option="false"
            :style="{ minWidth: '220px' }"
            allow-clear
            show-search
            @search="handleLineSearch"
          >
            <template v-if="lineLoading" #notFoundContent>
              <Spin size="small" />
            </template>
          </Select>
        </FormItem>

        <!-- 品号 -->
        <FormItem
          :label="$t('packingWorkOrderManage.productCode')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.productCode"
            :placeholder="$t('packingWorkOrderManage.productCodePlaceholder')"
            :options="productOptions"
            :filter-option="false"
            :not-found-content="productLoading ? undefined : null"
            :default-active-first-option="false"
            :style="{ minWidth: '220px' }"
            allow-clear
            show-search
            @search="handleProductSearch"
          >
            <template v-if="productLoading" #notFoundContent>
              <Spin size="small" />
            </template>
          </Select>
        </FormItem>

        <!-- 班别 -->
        <FormItem
          :label="$t('packingWorkOrderManage.shift')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.shiftCode"
            :placeholder="$t('packingWorkOrderManage.shiftPlaceholder')"
            :options="shiftOptions"
            :style="{ minWidth: '160px' }"
            allow-clear
          />
        </FormItem>

        <!-- 作业状态 -->
        <FormItem
          :label="$t('packingWorkOrderManage.workStatus')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.status"
            :placeholder="$t('packingWorkOrderManage.workStatusPlaceholder')"
            :options="statusOptions"
            :max-tag-count="2"
            :style="{ minWidth: '220px' }"
            allow-clear
            mode="multiple"
          />
        </FormItem>

        <!-- 重置 -->
        <FormItem style="margin-bottom: 1em">
          <Button @click="handleReset">
            {{ $t('common.reset') }}
          </Button>
        </FormItem>

        <!-- 查询 -->
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="gridApi.reload()">
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid>
        <!-- 工具栏左侧操作按钮 -->
        <template #toolbar-actions>
          <Space>
            <Button type="primary" @click="handleLinePersonPlan">
              {{ $t('packingWorkOrderManage.linePersonPlan') }}
            </Button>
            <Button
              v-if="hasAuth('下层工单生成')"
              type="primary"
              @click="handleGenerateLowerWorkSheet"
            >
              {{ $t('packingWorkOrderManage.generateLowerWorkSheet') }}
            </Button>
          </Space>
        </template>

        <!-- 工具栏右侧操作按钮 -->
        <template #toolbar-tools>
          <Space>
            <Button v-if="hasAuth('导出')" @click="handleExport">
              <Icon icon="mdi:file-excel" class="inline-block align-middle" />
              {{ $t('packingWorkOrderManage.excelExport') }}
            </Button>
            <Button
              v-if="hasAuth('删除')"
              danger
              :disabled="selectedRows.length === 0"
              @click="handleDelete"
            >
              <Icon icon="mdi:delete-outline" class="inline-block align-middle" />
              {{ $t('packingWorkOrderManage.delete') }}
            </Button>
            <Button
              v-if="hasAuth('取消确认')"
              :disabled="selectedRows.length === 0"
              @click="handleCancelConfirm"
            >
              <Icon
                icon="mdi:close-circle-outline"
                class="inline-block align-middle"
              />
              {{ $t('packingWorkOrderManage.cancelConfirm') }}
            </Button>
            <Button
              v-if="hasAuth('确认')"
              type="primary"
              :disabled="selectedRows.length === 0"
              @click="handleConfirm"
            >
              <Icon
                icon="mdi:check-circle-outline"
                class="inline-block align-middle"
              />
              {{ $t('packingWorkOrderManage.confirm') }}
            </Button>
            <Button
              v-if="hasAuth('保存')"
              type="primary"
              :disabled="modifiedRows.length === 0"
              @click="handleSave"
            >
              <Icon icon="mdi:content-save" class="inline-block align-middle" />
              {{ $t('packingWorkOrderManage.save') }}
            </Button>
          </Space>
        </template>

        <!-- 作业日期（行内编辑） -->
        <template #workDateEdit="{ row }">
          <DatePicker
            v-model:value="row.workDate"
            value-format="YYYY-MM-DD"
            class="!w-full"
            @change="handleFieldChange(row)"
          />
        </template>

        <!-- 班别（行内编辑） -->
        <template #shiftEdit="{ row }">
          <Select
            v-model:value="row.shiftCode"
            :options="shiftOptions"
            :placeholder="$t('packingWorkOrderManage.shiftPlaceholder')"
            class="!w-full"
            allow-clear
            @change="handleShiftChange(row)"
          />
        </template>
      </Grid>
    </Card>

    <!-- 各产线人员计划登录抽屉 -->
    <LinePersonPlanDrawer
      ref="linePersonPlanDrawerRef"
      @refresh="() => gridApi.reload()"
    />
    <!-- 下层工单生成抽屉 -->
    <LowerWorkOrderDrawer
      ref="lowerWorkOrderDrawerRef"
      @refresh="() => gridApi.reload()"
    />
  </Page>
</template>
