<script lang="ts" setup>
/**
 * 人时机时填报页面
 * 用于管理生产人员/机器工时填报数据。
 * 功能包括：按生产日期与组织架构分页查询、单条抽屉新增、表格行内编辑批量保存、批量删除、导出 Excel。
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
  Select,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deletePersonTimeReport,
  exportPersonTimeReport,
  getPersonTimeReportPageList,
  getProduceLineGroups,
  getProduceLines,
  getSubProduceLines,
  getWorkGroups,
  savePersonTimeReport,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import PersonTimeReportDrawer from '#/util/component/productionReport/PersonTimeReportDrawer.vue';

const route = useRoute();

// 权限控制
const author = ref<string[]>([]);

// 查询参数
const queryParams = ref({
  produceDate: '',
  produceLineGroupCode: '',
  produceLineCode: '',
  subProduceLineCode: '',
  workGroupCode: '',
});

// 组织架构 4 级联动下拉选项（工作区 -> 产线 -> 子产线 -> 班组）
const groupOptions = ref<any[]>([]);
const lineOptions = ref<any[]>([]);
const subLineOptions = ref<any[]>([]);
const workGroupOptions = ref<any[]>([]);

/**
 * 将接口返回的选项数组转换为 Select 可用的格式。
 * @param data - 接口返回的选项数组，元素包含 id、code、name。
 * @returns 返回 Select 选项数组，value 为 code、label 为 name。
 * @since 2026-08-13 00:00:00
 */
function toOptions(data: any[]) {
  return (data || []).map((item: any) => ({
    value: item.code,
    label: item.name,
    id: item.id,
  }));
}

/**
 * 加载工作区下拉选项。
 * @since 2026-08-13 00:00:00
 */
function loadGroupOptions() {
  return getProduceLineGroups().then((data: any[]) => {
    groupOptions.value = toOptions(data);
  });
}

/**
 * 工作区变化：同步查询参数，加载产线并清空下级选项。
 * @param value - 工作区编码。
 * @since 2026-08-13 00:00:00
 */
function handleGroupChange(value: any) {
  queryParams.value.produceLineGroupCode = value || '';
  queryParams.value.produceLineCode = '';
  queryParams.value.subProduceLineCode = '';
  queryParams.value.workGroupCode = '';
  lineOptions.value = [];
  subLineOptions.value = [];
  workGroupOptions.value = [];
  if (value) {
    getProduceLines({ produceLineGroupCode: value }).then((data: any[]) => {
      lineOptions.value = toOptions(data);
    });
  }
}

/**
 * 产线变化：同步查询参数，加载子产线并清空下级选项。
 * @param value - 产线编码。
 * @since 2026-08-13 00:00:00
 */
function handleLineChange(value: any) {
  queryParams.value.produceLineCode = value || '';
  queryParams.value.subProduceLineCode = '';
  queryParams.value.workGroupCode = '';
  subLineOptions.value = [];
  workGroupOptions.value = [];
  if (value) {
    getSubProduceLines({ produceLineCode: value }).then((data: any[]) => {
      subLineOptions.value = toOptions(data);
    });
  }
}

/**
 * 子产线变化：同步查询参数，加载班组并清空下级选项。
 * @param value - 子产线编码。
 * @since 2026-08-13 00:00:00
 */
function handleSubLineChange(value: any) {
  queryParams.value.subProduceLineCode = value || '';
  queryParams.value.workGroupCode = '';
  workGroupOptions.value = [];
  if (value) {
    getWorkGroups({ subProduceLineCode: value }).then((data: any[]) => {
      workGroupOptions.value = toOptions(data);
    });
  }
}

/**
 * 班组变化：同步查询参数。
 * @param value - 班组编码。
 * @since 2026-08-13 00:00:00
 */
function handleWorkGroupChange(value: any) {
  queryParams.value.workGroupCode = value || '';
}

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: { highlight: true, reserve: true },
  columns: [
    { type: 'checkbox', width: 50 },
    {
      title: $t('personTimeReport.produceDate'),
      field: 'produceDate',
      minWidth: 120,
    },
    {
      title: $t('personTimeReport.produceLineGroup'),
      field: 'produceLineGroupName',
      minWidth: 120,
    },
    {
      title: $t('personTimeReport.produceLine'),
      field: 'produceLineName',
      minWidth: 120,
    },
    {
      title: $t('personTimeReport.subProduceLine'),
      field: 'subProduceLineName',
      minWidth: 120,
    },
    {
      title: $t('personTimeReport.workGroup'),
      field: 'workGroupName',
      minWidth: 120,
    },
    {
      title: $t('personTimeReport.totalTimeMinutes'),
      field: 'totalTimeMinutes',
      minWidth: 140,
      slots: { default: 'totalTimeMinutesEdit' },
    },
    {
      title: $t('personTimeReport.totalPersons'),
      field: 'totalPersons',
      minWidth: 120,
      slots: { default: 'totalPersonsEdit' },
    },
    {
      title: $t('personTimeReport.totalPersonTimeMinutes'),
      field: 'totalPersonTimeMinutes',
      minWidth: 160,
      slots: { default: 'totalPersonTimeMinutesEdit' },
    },
    {
      title: $t('personTimeReport.remark'),
      field: 'remark',
      minWidth: 150,
      slots: { default: 'remarkEdit' },
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: ({ page }) => {
        const params = {
          ...queryParams.value,
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        };
        return getPersonTimeReportPageList(params).then((res: any) => {
          // 重新加载后清空上一轮变动记录
          modifiedMap.value.clear();
          return {
            items: res.results || [],
            total: res.total || 0,
          };
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  showOverflow: 'tooltip',
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

const drawerRef = ref<InstanceType<typeof PersonTimeReportDrawer>>();

// 选中的行
const selectedRows = ref<any[]>([]);
const selectedIds = computed(() =>
  selectedRows.value.map((row: any) => row.id),
);

/**
 * 更新选中行数据（勾选/全选变化时调用）。
 * @since 2026-08-13 00:00:00
 */
function updateSelection() {
  selectedRows.value = gridApi.grid?.getCheckboxRecords() || [];
}

// 行内编辑：记录被修改的行（只要发生编辑变动即记录，含改回原值）
const modifiedMap = ref(new Map<number, any>());
const modifiedRows = computed(() => [...modifiedMap.value.values()]);

/**
 * 行内编辑变化：记录被修改的行；总工时或总人数变化时自动计算总人时。
 * @param row - 被修改的表格行数据。
 * @param field - 发生变化的字段名（可选）。
 * @since 2026-08-13 00:00:00
 */
function handleFieldChange(row: any, field?: string) {
  // 总工时或总人数变化时，自动计算总人时 = 总工时 × 总人数
  if (field === 'totalTimeMinutes' || field === 'totalPersons') {
    row.totalPersonTimeMinutes =
      row.totalTimeMinutes != null && row.totalPersons != null
        ? Number(row.totalTimeMinutes) * Number(row.totalPersons)
        : null;
  }
  const next = new Map(modifiedMap.value);
  next.set(row.id, { ...row });
  modifiedMap.value = next;
}

/**
 * 按当前查询条件重新加载列表。
 * @since 2026-08-13 00:00:00
 */
function handleQuery() {
  gridApi.reload();
}

/**
 * 重置查询条件并重新加载列表。
 * @since 2026-08-13 00:00:00
 */
function handleReset() {
  queryParams.value = {
    produceDate: '',
    produceLineGroupCode: '',
    produceLineCode: '',
    subProduceLineCode: '',
    workGroupCode: '',
  };
  lineOptions.value = [];
  subLineOptions.value = [];
  workGroupOptions.value = [];
  gridApi.reload();
}

/**
 * 生产日期变化：同步查询参数。
 * @param _date - 日期对象（未使用）。
 * @param dateString - 格式化后的日期字符串。
 * @since 2026-08-13 00:00:00
 */
function handleDateChange(_date: any, dateString: string) {
  queryParams.value.produceDate = dateString || '';
}

/**
 * 新增：打开新增抽屉。
 * @since 2026-08-13 00:00:00
 */
function handleAdd() {
  drawerRef.value?.open();
}

/**
 * 批量保存：提交所有被修改的行。
 * @since 2026-08-13 00:00:00
 */
function handleSave() {
  if (modifiedRows.value.length === 0) {
    message.warning($t('personTimeReport.noModifiedData'));
    return;
  }
  savePersonTimeReport(modifiedRows.value)
    .then(() => {
      message.success($t('personTimeReport.saveSuccess'));
      modifiedMap.value.clear();
      gridApi.reload();
    })
    .catch(() => {
      message.warning($t('personTimeReport.operationFailed'));
    });
}

/**
 * 批量删除：需先勾选数据，弹出确认框后调用删除接口。
 * @since 2026-08-13 00:00:00
 */
function handleBatchDelete() {
  if (selectedRows.value.length === 0) {
    message.warning($t('personTimeReport.selectData'));
    return;
  }
  Modal.confirm({
    title: $t('personTimeReport.prompt'),
    content: $t('personTimeReport.batchDeleteConfirm'),
    onOk: () => {
      deletePersonTimeReport(selectedIds.value)
        .then(() => {
          message.success($t('personTimeReport.deleteSuccess'));
          selectedRows.value = [];
          gridApi.reload();
        })
        .catch(() => {
          message.warning($t('personTimeReport.operationFailed'));
        });
    },
  });
}

/**
 * 导出：接口返回文件下载地址，直接跳转下载。
 * @since 2026-08-13 00:00:00
 */
function handleExport() {
  exportPersonTimeReport(queryParams.value).then((res: string) => {
    if (res) {
      window.location.href = res;
    }
  });
}

/**
 * 抽屉保存成功后的回调：重新加载列表。
 * @since 2026-08-13 00:00:00
 */
function handleDrawerSuccess() {
  gridApi.reload();
}

onMounted(() => {
  queryAuth(route.meta.code as string).then((data: string[]) => {
    author.value = data || [];
  });
  // 预加载工作区下拉选项
  loadGroupOptions();
});
</script>

<template>
  <Page>
    <!-- 搜索 -->
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem
          :label="$t('personTimeReport.produceDate')"
          style="margin-bottom: 1em"
        >
          <DatePicker
            :placeholder="$t('personTimeReport.inputProduceDate')"
            style="width: 150px"
            allow-clear
            @change="handleDateChange"
          />
        </FormItem>
        <FormItem
          :label="$t('personTimeReport.produceLineGroup')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.produceLineGroupCode"
            :options="groupOptions"
            :placeholder="$t('personTimeReport.produceLineGroup')"
            style="width: 150px"
            allow-clear
            @change="handleGroupChange"
          />
        </FormItem>
        <FormItem
          :label="$t('personTimeReport.produceLine')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.produceLineCode"
            :options="lineOptions"
            :placeholder="$t('personTimeReport.produceLine')"
            style="width: 150px"
            allow-clear
            @change="handleLineChange"
          />
        </FormItem>
        <FormItem
          :label="$t('personTimeReport.subProduceLine')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.subProduceLineCode"
            :options="subLineOptions"
            :placeholder="$t('personTimeReport.subProduceLine')"
            style="width: 150px"
            allow-clear
            @change="handleSubLineChange"
          />
        </FormItem>
        <FormItem
          :label="$t('personTimeReport.workGroup')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.workGroupCode"
            :options="workGroupOptions"
            :placeholder="$t('personTimeReport.workGroup')"
            style="width: 150px"
            allow-clear
            @change="handleWorkGroupChange"
          />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="handleQuery">
            {{ $t('personTimeReport.search') }}
          </Button>
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button @click="handleReset">
            {{ $t('personTimeReport.reset') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <Space>
            <Button
              v-if="author.includes('新增')"
              type="primary"
              @click="handleAdd"
            >
              <Icon icon="mdi:plus" class="inline-block align-middle" />
              {{ $t('personTimeReport.add') }}
            </Button>

            <Button
              v-if="author.includes('保存')"
              type="primary"
              :disabled="modifiedRows.length === 0"
              @click="handleSave"
            >
              <Icon icon="mdi:content-save" class="inline-block align-middle" />
              {{ $t('personTimeReport.save') }}
            </Button>

            <Button
              v-if="author.includes('删除')"
              danger
              :disabled="selectedRows.length === 0"
              @click="handleBatchDelete"
            >
              <Icon
                icon="mdi:delete-outline"
                class="inline-block align-middle"
              />
              {{ $t('personTimeReport.delete') }}
            </Button>

            <Button
              v-if="author.includes('导出')"
              type="primary"
              @click="handleExport"
            >
              <Icon
                icon="mdi:export-variant"
                class="inline-block align-middle"
              />
              {{ $t('personTimeReport.export') }}
            </Button>
          </Space>
        </template>

        <!-- 行内编辑插槽：总工时(分钟) -->
        <template #totalTimeMinutesEdit="{ row }">
          <InputNumber
            v-model:value="row.totalTimeMinutes"
            :min="0"
            :precision="0"
            :disabled="!author.includes('保存')"
            style="width: 100%"
            @change="handleFieldChange(row, 'totalTimeMinutes')"
          />
        </template>

        <!-- 行内编辑插槽：总人数 -->
        <template #totalPersonsEdit="{ row }">
          <InputNumber
            v-model:value="row.totalPersons"
            :min="0"
            :precision="0"
            :disabled="!author.includes('保存')"
            style="width: 100%"
            @change="handleFieldChange(row, 'totalPersons')"
          />
        </template>

        <!-- 行内编辑插槽：总人时(人·分钟)，由总工时 × 总人数自动计算，不可编辑 -->
        <template #totalPersonTimeMinutesEdit="{ row }">
          <InputNumber
            v-model:value="row.totalPersonTimeMinutes"
            :min="0"
            :precision="0"
            disabled
            style="width: 100%"
          />
        </template>

        <!-- 行内编辑插槽：备注 -->
        <template #remarkEdit="{ row }">
          <Input
            v-model:value="row.remark"
            :maxlength="200"
            :disabled="!author.includes('保存')"
            @change="handleFieldChange(row)"
          />
        </template>
      </Grid>
    </Card>

    <PersonTimeReportDrawer ref="drawerRef" @refresh="handleDrawerSuccess" />
  </Page>
</template>
