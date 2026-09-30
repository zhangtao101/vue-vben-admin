<script lang="ts" setup>
/**
 * [INPUT]: 依赖 #/api (listStaffRegisterRecords/saveStaffRegisterRecords/
 *         deleteStaffRegisterRecords/listTeamGroups/listSubProductionLines/
 *         listWordListByParentCode)、#/util (queryAuth)、#/locales ($t)
 * [OUTPUT]: 对外提供 productionLineStaffRegister 页面组件，提供产线人员登记记录的
 *           条件查询、表格行内手动编辑、新增行、批量保存与删除功能
 * [POS]: 属于基础信息(baseInfo)模块的产线人员登记页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-09-29 00:00:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, ref } from 'vue';
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
  Input,
  InputNumber,
  message,
  Modal,
  RangePicker,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteStaffRegisterRecords,
  listStaffRegisterRecords,
  listSubProductionLines,
  listTeamGroups,
  listWordListByParentCode,
  saveStaffRegisterRecords,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// region 常量
/** 班别字典父级编号 */
const SHIFT_PARENT_CODE = 'CLASSTYPE';
/** 状态：启用 */
const STATUS_ENABLED = 1;
/** 状态：停用 */
const STATUS_DISABLED = -1;
/** 字典/基础数据默认拉取条数 */
const OPTION_PAGE_SIZE = 500;

/** 状态选项（1启用、-1停用） */
const statusOptions = [
  { label: $t('baseInfo.statusEnabled'), value: STATUS_ENABLED },
  { label: $t('baseInfo.statusDisabled'), value: STATUS_DISABLED },
];

/** 日期格式 */
const DATE_FORMAT = 'YYYY-MM-DD';
/** 时间格式 */
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
// endregion

// region 路由与权限
const route = useRoute();
const author = ref<string[]>([]);

/** 是否具备编辑（新增行/保存）权限 */
const canEdit = computed(
  () => author.value.includes('新增') || author.value.includes('编辑'),
);

/** 是否具备删除权限 */
const canDelete = computed(() => author.value.includes('删除'));
// endregion

// region 查询条件
/** 作业日期范围（RangePicker 绑定值） */
const workDateRange = ref<[any, any] | undefined>();

const queryParams = ref({
  endDate: undefined as string | undefined,
  groupCode: undefined as string | undefined,
  pageNum: 1,
  pageSize: 10,
  shiftCode: undefined as string | undefined,
  startDate: undefined as string | undefined,
  subLineCode: undefined as string | undefined,
});
// endregion

// region 下拉选项
/** 班组选项 */
const groupOptions = ref<any[]>([]);
/** 子产线选项 */
const subLineOptions = ref<any[]>([]);
/** 班别选项 */
const shiftOptions = ref<{ label: string; value: string }[]>([]);
// endregion

// region 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: { highlight: true },
  columns: [
    { type: 'checkbox', width: 50 },
    { type: 'seq', title: $t('baseInfo.serialNumber'), width: 60 },
    {
      field: 'workDate',
      minWidth: 160,
      slots: { default: 'workDate' },
      title: $t('baseInfo.workDate'),
    },
    {
      field: 'startTime',
      minWidth: 200,
      slots: { default: 'startTime' },
      title: $t('baseInfo.startTime'),
    },
    {
      field: 'endTime',
      minWidth: 200,
      slots: { default: 'endTime' },
      title: $t('baseInfo.endTime'),
    },
    {
      field: 'shiftCode',
      minWidth: 140,
      slots: { default: 'shiftCode' },
      title: $t('baseInfo.shift'),
    },
    {
      field: 'groupCode',
      minWidth: 160,
      slots: { default: 'groupCode' },
      title: $t('baseInfo.groupName'),
    },
    {
      field: 'groupNumber',
      minWidth: 130,
      slots: { default: 'groupNumber' },
      title: $t('baseInfo.groupNumber'),
    },
    {
      field: 'subLineCode',
      minWidth: 160,
      slots: { default: 'subLineCode' },
      title: $t('baseInfo.subProductionLine'),
    },
    {
      field: 'status',
      minWidth: 120,
      slots: { default: 'status' },
      title: $t('baseInfo.status'),
    },
    {
      field: 'remark',
      minWidth: 180,
      slots: { default: 'remark' },
      title: $t('baseInfo.remark'),
    },
    {
      field: 'action',
      fixed: 'right',
      minWidth: 90,
      slots: { default: 'action' },
      title: $t('baseInfo.action'),
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
  },
  proxyConfig: {
    ajax: {
      query: ({ page }) => {
        return listStaffRegisterRecords({
          ...buildParams(),
          pageNum: page?.currentPage,
          pageSize: page?.pageSize,
        }).then((response) => ({
          total: response.total || 0,
          items: response.results || [],
        }));
      },
    },
  },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {
  checkboxAll: updateSelection,
  checkboxChange: updateSelection,
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });
// endregion

// region 选中行与编辑行
/** 勾选中的行 */
const selectedRows = ref<any[]>([]);
/** 被修改或新增的行（保存的数据来源） */
const dirtyRows = new Set<any>();
const modifiedRows = ref<any[]>([]);

/**
 * 同步表格勾选行
 */
function updateSelection() {
  selectedRows.value = gridApi.grid?.getCheckboxRecords() || [];
}

/**
 * 记录被修改的行
 * @param {any} row 行数据
 */
function handleFieldChange(row: any) {
  dirtyRows.add(row);
  modifiedRows.value = [...dirtyRows];
}

/**
 * 班别变更时同步班别名称
 * @param {any} row 行数据
 */
function handleShiftChange(row: any) {
  const target = shiftOptions.value.find(
    (item) => item.value === row.shiftCode,
  );
  row.shiftName = target?.label || '';
  handleFieldChange(row);
}

/**
 * 班组变更时同步班组名称，并联动子产线（子产线为空时）
 * @param {any} row 行数据
 */
function handleGroupChange(row: any) {
  const group = groupOptions.value.find(
    (item) => item.groupCode === row.groupCode,
  );
  row.groupName = group?.groupName || '';
  if (!row.subLineCode && group?.subLineId) {
    const subLine = subLineOptions.value.find(
      (item) => item.id === group.subLineId,
    );
    row.subLineCode = subLine?.subLineCode;
    row.subLineName = subLine?.subLineName || '';
  }
  handleFieldChange(row);
}

/**
 * 子产线变更时同步子产线名称
 * @param {any} row 行数据
 */
function handleSubLineChange(row: any) {
  const subLine = subLineOptions.value.find(
    (item) => item.subLineCode === row.subLineCode,
  );
  row.subLineName = subLine?.subLineName || '';
  handleFieldChange(row);
}
// endregion

// region 数据查询
/**
 * 组装查询参数（不含分页）
 * @returns 查询参数
 */
function buildParams() {
  const [start, end] = workDateRange.value || [];
  return {
    endDate: end ? dayjs(end).format(DATE_FORMAT) : undefined,
    groupCode: queryParams.value.groupCode || undefined,
    shiftCode: queryParams.value.shiftCode || undefined,
    startDate: start ? dayjs(start).format(DATE_FORMAT) : undefined,
    subLineCode: queryParams.value.subLineCode || undefined,
  };
}

/**
 * 查询
 */
function handleSearch() {
  queryParams.value.pageNum = 1;
  gridApi.reload();
}

/**
 * 重置
 */
function handleReset() {
  workDateRange.value = undefined;
  queryParams.value = {
    endDate: undefined,
    groupCode: undefined,
    pageNum: 1,
    pageSize: 10,
    shiftCode: undefined,
    startDate: undefined,
    subLineCode: undefined,
  };
  gridApi.reload();
}
// endregion

// region 行操作
/**
 * 构造新增的空行
 * @returns 新行数据
 */
function createEmptyRow() {
  return {
    id: null,
    endTime: '',
    groupCode: undefined,
    groupName: '',
    groupNumber: 0,
    remark: '',
    shiftCode: undefined,
    shiftName: '',
    startTime: '',
    status: STATUS_ENABLED,
    subLineCode: undefined,
    subLineName: '',
    workDate: dayjs().format(DATE_FORMAT),
  };
}

/**
 * 新增行（追加到表格末尾并标记为待保存）
 */
function handleAddRow() {
  const row = createEmptyRow();
  gridApi.grid?.insertAt(row, -1);
  handleFieldChange(row);
}

/**
 * 校验待保存的行
 * @param {any} row 行数据
 * @returns 错误提示，为空表示通过
 */
function validateRow(row: any) {
  if (!row.workDate) return $t('baseInfo.selectWorkDate');
  if (!row.shiftCode) return $t('baseInfo.selectShift');
  if (!row.groupCode) return $t('baseInfo.selectGroup');
  if (!row.subLineCode) return $t('baseInfo.selectSubProductionLine');
  return '';
}

/**
 * 保存新增与修改的记录
 */
function handleSave() {
  const rows = modifiedRows.value.filter((row) =>
    gridApi.grid?.getTableData().tableData.includes(row),
  );
  if (rows.length === 0) {
    message.warning($t('baseInfo.noChangesToSave'));
    return;
  }
  for (const row of rows) {
    const error = validateRow(row);
    if (error) {
      message.warning(error);
      return;
    }
  }
  const records = rows.map((row: any) => ({
    endTime: row.endTime || '',
    groupCode: row.groupCode || '',
    groupName: row.groupName || '',
    groupNumber: row.groupNumber ?? 0,
    id: row.id ?? null,
    remark: row.remark || '',
    shiftCode: row.shiftCode || '',
    shiftName: row.shiftName || '',
    startTime: row.startTime || '',
    status: row.status ?? STATUS_ENABLED,
    subLineCode: row.subLineCode || '',
    subLineName: row.subLineName || '',
    workDate: row.workDate || '',
  }));
  saveStaffRegisterRecords(records)
    .then(() => {
      message.success($t('baseInfo.saveSuccess'));
      dirtyRows.clear();
      modifiedRows.value = [];
      selectedRows.value = [];
      gridApi.reload();
    })
    .catch((error: any) => {
      message.error(error?.message || $t('baseInfo.saveFailed'));
    });
}

/**
 * 批量删除选中记录（未保存的新行直接从表格移除）
 */
function handleDeleteSelected() {
  const selected = selectedRows.value;
  if (selected.length === 0) {
    message.warning($t('baseInfo.pleaseSelectRecords'));
    return;
  }
  Modal.confirm({
    cancelText: $t('common.cancel'),
    content: $t('baseInfo.confirmContent'),
    okText: $t('common.confirm'),
    okType: 'danger',
    title: $t('baseInfo.confirmTitle'),
    onOk() {
      const savedIds = selected
        .filter((row: any) => row.id)
        .map((row: any) => row.id);
      const newRows = selected.filter((row: any) => !row.id);
      const request =
        savedIds.length > 0
          ? deleteStaffRegisterRecords(savedIds)
          : Promise.resolve();
      return request.then(() => {
        if (newRows.length > 0) {
          gridApi.grid?.remove(newRows);
        }
        newRows.forEach((row: any) => dirtyRows.delete(row));
        modifiedRows.value = [...dirtyRows];
        message.success($t('baseInfo.deleteSuccess'));
        selectedRows.value = [];
        gridApi.reload();
      });
    },
  });
}

/**
 * 删除单行
 * @param {any} row 行数据
 */
function handleDeleteRow(row: any) {
  const doDelete = () => {
    if (!row.id) {
      gridApi.grid?.remove(row);
      dirtyRows.delete(row);
      modifiedRows.value = [...dirtyRows];
      return;
    }
    deleteStaffRegisterRecords([row.id]).then(() => {
      message.success($t('baseInfo.deleteSuccess'));
      dirtyRows.delete(row);
      modifiedRows.value = [...dirtyRows];
      gridApi.reload();
    });
  };
  if (!row.id) {
    doDelete();
    return;
  }
  Modal.confirm({
    cancelText: $t('common.cancel'),
    content: $t('baseInfo.confirmContent'),
    okText: $t('common.confirm'),
    okType: 'danger',
    title: $t('baseInfo.confirmTitle'),
    onOk: doDelete,
  });
}
// endregion

// region 初始化
/**
 * 加载班组选项
 */
function loadGroupOptions() {
  listTeamGroups({ pageNum: 1, pageSize: OPTION_PAGE_SIZE }).then(
    (response) => {
      groupOptions.value = response.list || [];
    },
  );
}

/**
 * 加载子产线选项
 */
function loadSubLineOptions() {
  listSubProductionLines({ pageNum: 1, pageSize: OPTION_PAGE_SIZE }).then(
    (response) => {
      subLineOptions.value = response.list || [];
    },
  );
}

/**
 * 加载班别字典（CLASSTYPE）
 */
function loadShiftOptions() {
  listWordListByParentCode(SHIFT_PARENT_CODE).then((response: any) => {
    const list = Array.isArray(response) ? response : [];
    shiftOptions.value = list.map((item: any) => ({
      label: item.wordName,
      value: item.wordCode,
    }));
  });
}

/**
 * 加载按钮权限
 */
function loadAuthor() {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
}

onMounted(() => {
  loadGroupOptions();
  loadSubLineOptions();
  loadShiftOptions();
  loadAuthor();
});
// endregion
</script>

<template>
  <Page>
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 作业日期 -->
        <FormItem :label="$t('baseInfo.workDate')">
          <RangePicker
            v-model:value="workDateRange"
            :placeholder="[
              $t('baseInfo.selectWorkDate'),
              $t('baseInfo.selectWorkDate'),
            ]"
            style="width: 240px"
          />
        </FormItem>
        <!-- 班组 -->
        <FormItem :label="$t('baseInfo.groupName')">
          <Select
            v-model:value="queryParams.groupCode"
            :field-names="{ label: 'groupName', value: 'groupCode' }"
            :options="groupOptions"
            :placeholder="$t('baseInfo.selectGroup')"
            allow-clear
            show-search
            style="width: 200px"
          />
        </FormItem>
        <!-- 子产线 -->
        <FormItem :label="$t('baseInfo.subProductionLine')">
          <Select
            v-model:value="queryParams.subLineCode"
            :field-names="{ label: 'subLineName', value: 'subLineCode' }"
            :options="subLineOptions"
            :placeholder="$t('baseInfo.selectSubProductionLine')"
            allow-clear
            show-search
            style="width: 200px"
          />
        </FormItem>
        <!-- 班别 -->
        <FormItem :label="$t('baseInfo.shift')">
          <Select
            v-model:value="queryParams.shiftCode"
            :options="shiftOptions"
            :placeholder="$t('baseInfo.selectShift')"
            allow-clear
            style="width: 200px"
          />
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSearch">
            <Icon
              icon="mdi:magnify"
              class="inline-block align-middle mr-1 text-lg"
            />
            {{ $t('common.search') }}
          </Button>
        </FormItem>
        <FormItem>
          <Button @click="handleReset">
            {{ $t('common.reset') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <Card>
      <Grid>
        <template #toolbar-tools>
          <Space>
            <Button v-if="canEdit" type="primary" @click="handleAddRow">
              <Icon icon="mdi:plus" class="inline-block align-middle mr-1" />
              {{ $t('baseInfo.addRow') }}
            </Button>
            <Button v-if="canEdit" @click="handleSave">
              <Icon
                icon="mdi:content-save-outline"
                class="inline-block align-middle mr-1"
              />
              {{ $t('baseInfo.save') }}
            </Button>
            <Button
              v-if="canDelete"
              danger
              :disabled="selectedRows.length === 0"
              @click="handleDeleteSelected"
            >
              <Icon
                icon="mdi:delete-outline"
                class="inline-block align-middle mr-1"
              />
              {{ $t('common.delete') }}
            </Button>
          </Space>
        </template>

        <!-- 作业日期 -->
        <template #workDate="{ row }">
          <DatePicker
            v-model:value="row.workDate"
            :placeholder="$t('baseInfo.selectWorkDate')"
            :value-format="DATE_FORMAT"
            class="!w-full"
            @change="handleFieldChange(row)"
          />
        </template>

        <!-- 作业开始时间 -->
        <template #startTime="{ row }">
          <DatePicker
            v-model:value="row.startTime"
            :format="TIME_FORMAT"
            :placeholder="$t('baseInfo.selectStartTime')"
            :value-format="TIME_FORMAT"
            class="!w-full"
            show-time
            @change="handleFieldChange(row)"
          />
        </template>

        <!-- 作业结束时间 -->
        <template #endTime="{ row }">
          <DatePicker
            v-model:value="row.endTime"
            :format="TIME_FORMAT"
            :placeholder="$t('baseInfo.selectEndTime')"
            :value-format="TIME_FORMAT"
            class="!w-full"
            show-time
            @change="handleFieldChange(row)"
          />
        </template>

        <!-- 班别 -->
        <template #shiftCode="{ row }">
          <Select
            v-model:value="row.shiftCode"
            :options="shiftOptions"
            :placeholder="$t('baseInfo.selectShift')"
            allow-clear
            class="!w-full"
            @change="handleShiftChange(row)"
          />
        </template>

        <!-- 班组 -->
        <template #groupCode="{ row }">
          <Select
            v-model:value="row.groupCode"
            :field-names="{ label: 'groupName', value: 'groupCode' }"
            :options="groupOptions"
            :placeholder="$t('baseInfo.selectGroup')"
            allow-clear
            class="!w-full"
            show-search
            @change="handleGroupChange(row)"
          />
        </template>

        <!-- 班组人员数量 -->
        <template #groupNumber="{ row }">
          <InputNumber
            v-model:value="row.groupNumber"
            :min="0"
            :precision="0"
            class="!w-full"
            @change="handleFieldChange(row)"
          />
        </template>

        <!-- 子产线 -->
        <template #subLineCode="{ row }">
          <Select
            v-model:value="row.subLineCode"
            :field-names="{ label: 'subLineName', value: 'subLineCode' }"
            :options="subLineOptions"
            :placeholder="$t('baseInfo.selectSubProductionLine')"
            allow-clear
            class="!w-full"
            show-search
            @change="handleSubLineChange(row)"
          />
        </template>

        <!-- 状态 -->
        <template #status="{ row }">
          <Select
            v-model:value="row.status"
            :options="statusOptions"
            :placeholder="$t('baseInfo.selectStatus')"
            class="!w-full"
            @change="handleFieldChange(row)"
          />
        </template>

        <!-- 备注 -->
        <template #remark="{ row }">
          <Input
            v-model:value="row.remark"
            :max-length="200"
            :placeholder="$t('baseInfo.inputRemark')"
            @change="handleFieldChange(row)"
          />
        </template>

        <!-- 操作 -->
        <template #action="{ row }">
          <Tooltip v-if="canDelete">
            <template #title>
              {{ $t('common.delete') }}
            </template>
            <Button danger type="link" @click="handleDeleteRow(row)">
              <Icon
                icon="mdi:delete-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>
  </Page>
</template>
