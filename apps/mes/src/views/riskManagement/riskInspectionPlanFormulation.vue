<script lang="ts" setup>
import type { Dayjs } from 'dayjs';

import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { IconifyIcon, MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
  Cascader,
  DatePicker,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  RadioButton,
  RadioGroup,
  Select,
  Space,
  Textarea,
  Tooltip,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addHiddenDangerInspectionPlan,
  areaList,
  listSysPerson,
  queryHiddenDangerInspectionPlan,
  queryHiddenDangerInspectionType,
  queryOrganizationTree,
  switchPlanStatus,
  updateHiddenDangerInspectionPlan,
} from '#/api';
import { $t } from '#/locales';
import { flattenTree, queryAuth } from '#/util';
import CalendarSelection from '#/util/component/calendarSelection.vue';

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'checkName', title: '专项检查名称', minWidth: 190 },
    { field: 'manager', title: '负责人', minWidth: 150 },
    { field: 'startTime', title: '开始时间', minWidth: 150 },
    { field: 'endTime', title: '结束时间', minWidth: 150 },
    { field: 'cycle', title: '间隔周期', minWidth: 150 },
    { field: 'checkType', title: '检查类别', minWidth: 150 },
    { field: 'calendarName', title: '日历名称', minWidth: 150 },
    { field: 'checkCriteria', title: '检查标准', minWidth: 150 },
    { field: 'areaCode', title: '巡检区域', minWidth: 150 },
    { field: 'area', title: '巡检项目', minWidth: 150 },
    { field: 'content', title: '巡检内容', minWidth: 150 },
    { field: 'timeType', title: '检查类别', minWidth: 150 },
    {
      field: 'isUse',
      fixed: 'right',
      slots: { default: 'isUse' },
      title: '计划是否开启',
      minWidth: 150,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 150,
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 查询参数
const queryParams = ref<any>({});
/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams.value };
    queryHiddenDangerInspectionPlan({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ total, list }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total,
          items: list || [{}],
        });
      })
      .catch((error) => {
        resolve({
          total: 0,
          items: [{}],
        });
        reject(error);
      });
  });
}

// endregion

// region 新增 / 编辑
/**
 * 计划类型
 */
const timeTypeOptions = [
  {
    label: '周期计划',
    value: 1,
  },
  {
    label: '专项巡检',
    value: 2,
  },
  {
    label: '日常巡检',
    value: 0,
  },
];
// 是否显示编辑
const showEdit = ref(false);
/**
 * 新增/编辑表单引用
 */
const formRef = ref<any>();
/**
 * 编辑对象
 */
const editItem = ref<any>({});
/**
 * 是否编辑用户
 */
const isUserEdit = ref(false);
/**
 * 提交加载中
 */
const submitLoading = ref(false);
/**
 * 提交
 */
function submit() {
  formRef.value.validate().then(() => {
    const ob = editItem.value.id
      ? updateHiddenDangerInspectionPlan(editItem.value)
      : addHiddenDangerInspectionPlan(editItem.value);
    submitLoading.value = true;
    ob.then(() => {
      message.success($t('common.successfulOperation'));
      gridApi.reload();
      editClose();
    }).finally(() => {
      submitLoading.value = false;
    });
  });
}

/**
 * 显示编辑
 * @param row 编辑对象 为空值表示新增
 */
function showEditFun(row?: any) {
  showEdit.value = true;
  editItem.value = row
    ? {
        ...row,
      }
    : {};
  if (editItem.value.startTime) {
    editItem.value.startTime = dayjs(editItem.value.startTime);
  }
  if (editItem.value.endTime) {
    editItem.value.endTime = dayjs(editItem.value.endTime);
  }
  if (editItem.value.manager) {
    editItem.value.userChenked = ['', editItem.value.manager];
  }
  isUserEdit.value = !row;
}

/**
 * 关闭抽屉
 */
function editClose() {
  showEdit.value = false;
  editItem.value = {};
  isUserEdit.value = false;
}

// 禁用时间-开始时间
const disabledDate = (current: Dayjs) => {
  // Can not select days before today and today
  return current && current < dayjs().subtract(1, 'day');
};
// 禁用时间-结束时间
const disabledDateEnd = (current: Dayjs) => {
  // Can not select days before today and today
  return (
    current &&
    (current < dayjs().subtract(1, 'day') ||
      (editItem.value.startTime && current < editItem.value.startTime))
  );
};

// endregion

// region 巡检类型

const inspectionTypeOptions = ref<any[]>([]);

/**
 * 查询巡检类型
 */
function queryInspectionType() {
  queryHiddenDangerInspectionType({
    pageNum: 1, // 当前页码。
    pageSize: 99_999, // 每页显示的数据条数。
  }).then(({ list }) => {
    inspectionTypeOptions.value = [];
    list.forEach((item: any) => {
      inspectionTypeOptions.value.push({
        label: item.checkType,
        value: item.checkType,
        checkCriteria: item.checkCriteria,
      });
    });
  });
}

function inspectionTypeChange(_val: any, item: any) {
  editItem.value.checkCriteria = item.checkCriteria;
}

const filterOption = (input: string, option: any) => {
  return [option.label.toLowerCase(), option.value.toLowerCase()].includes(
    input.toLowerCase(),
  );
};

// endregion

// region 区域类型

const areaOptions = ref<any[]>([
  {
    label: '1',
    value: 2,
  },
]);

/**
 * 查询巡检类型
 */
function queryArea() {
  areaList({
    pageNum: 1, // 当前页码。
    pageSize: 99_999, // 每页显示的数据条数。
  }).then(({ list }) => {
    areaOptions.value = [];
    list.forEach((item: any) => {
      areaOptions.value.push({
        label: item.areaName,
        value: item.areaCode,
      });
    });
  });
}

/**
 * 地区变更
 * @param _v
 * @param item
 */
function areaChange(_v: any, item: any) {
  editItem.value.areaCode = item.value;
  editItem.value.area = item.label;
}

// endregion

// region 组织查询
// 组织数据
const treeData = ref<any>([]);
/**
 * 查询全部的组织树
 * 这个函数用于从服务器获取所有组织数据，并更新前端的树形数据结构。
 */
function queryAllOrganizations() {
  // 调用queryDictionaryTree API函数，获取菜单列表
  queryOrganizationTree().then((data) => {
    // 检查返回的数据是否存在且长度大于0
    if (data) {
      const arr = flattenTree(
        {
          children: [data],
        },
        'children',
      );
      treeData.value = [];
      arr.forEach((item: any) => {
        treeData.value.push({
          label: item.orgFullName,
          value: item.orgCode,
          isLeaf: false,
        });
      });
    }
  });
}

// endregion

// region 用户查询

function userSearch(selectedOptions: any) {
  const targetOption = selectedOptions[selectedOptions.length - 1];
  targetOption.loading = true;

  listSysPerson({
    orgCode: targetOption.value,
    pageNum: 1, // 当前页码。
    pageSize: 25, // 每页显示的数据条数。
  })
    .then(({ list }) => {
      list.forEach((item: any) => {
        item.label = item.perName;
        item.value = item.perName;
      });
      targetOption.children = list;
    })
    .finally(() => {
      targetOption.loading = false;
    });
}

function userChange(_val: any, item: any) {
  if (item.length === 2) {
    const user = item[1];
    editItem.value.manager = user.perName;
    editItem.value.managerId = user.id;
  }
}

// endregion

// region 日历操作
// 是否打开日历抽屉
const calendarOpen = ref(false);
// 日历引用
const calendarSelectionRef = ref<any>();

/**
 * 打开日历抽屉
 */
function showCalendar() {
  calendarOpen.value = true;
}

/**
 * 关闭日历抽屉
 */
function closeCalendar() {
  calendarOpen.value = false;
}

/**
 * 设置日历相关信息
 */
function setCalendar() {
  const calendar = calendarSelectionRef.value.getValue();
  editItem.value.calendarName = calendar.calendarName;
  editItem.value.calendarId = calendar.id;
  closeCalendar();
}
// endregion

// region 更新状态

function updateStatus(row: any) {
  switchPlanStatus(row.id).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

// endregion

// region 权限查询

// 路由信息
const route = useRoute();
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 初始化

onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });

  queryInspectionType();
  queryArea();
  queryAllOrganizations();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 检查类别 -->
        <FormItem
          :label="$t('hiddenDangerInspectionPlan.inspectionCategory')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.checkType"
            :options="inspectionTypeOptions"
            show-search
            allow-clear
            class="!w-56"
            :filter-option="filterOption"
          />
        </FormItem>
        <!-- 巡检项目 -->
        <FormItem
          :label="$t('hiddenDangerInspectionPlan.inspectionItem')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.area" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="() => gridApi.reload()"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 表格主体 -->
    <Card>
      <Grid>
        <template #toolbar-actions>
          <Button
            type="primary"
            @click="showEditFun()"
            v-if="author.includes('新增')"
          >
            {{ $t('common.create') }}
          </Button>
        </template>

        <template #isUse="{ row }">
          <RadioGroup
            v-model:value="row.isUse"
            @change="updateStatus(row)"
            :disabled="!author.includes('状态变更')"
          >
            <RadioButton :value="1">
              {{ $t('status.enable') }}
            </RadioButton>
            <RadioButton :value="2">
              {{ $t('status.forbidden') }}
            </RadioButton>
          </RadioGroup>
        </template>
        <template #action="{ row }">
          <!-- 编辑按钮 ="{ row }" -->
          <Tooltip v-if="author.includes('编辑')">
            <template #title>
              {{ $t('common.edit') }}
            </template>
            <Button type="link" @click="showEditFun(row)">
              <IconifyIcon
                icon="mdi:square-edit-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <Drawer
      v-model:open="showEdit"
      :footer-style="{ textAlign: 'right' }"
      width="500"
      placement="right"
      :title="$t('common.edit')"
      @close="editClose"
    >
      <Form
        ref="formRef"
        :model="editItem"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <!-- 负责人 -->
        <FormItem
          :label="$t('hiddenDangerInspectionPlan.responsiblePerson')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="userChenked"
        >
          <Cascader
            v-model:value="editItem.userChenked"
            :options="treeData"
            :load-data="userSearch"
            @change="userChange"
            change-on-select
            v-if="isUserEdit"
          />
          <template v-else>
            {{ editItem.manager }}
            <!-- 编辑按钮 ="{ row }" -->
            <Tooltip>
              <template #title>
                {{ $t('common.edit') }}
              </template>
              <Button type="link" @click="isUserEdit = true">
                <IconifyIcon
                  icon="mdi:square-edit-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
          </template>
        </FormItem>

        <!-- 检查类别 -->
        <FormItem
          :label="$t('hiddenDangerInspectionPlan.inspectionCategory')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="editItem.checkType"
            :options="inspectionTypeOptions"
            show-search
            class="!w-56"
            :filter-option="filterOption"
            @change="inspectionTypeChange"
          />
        </FormItem>

        <!-- 检查标准 -->
        <FormItem
          :label="$t('hiddenDangerInspectionPlan.inspectionStandard')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="checkCriteria"
        >
          <Input v-model:value="editItem.checkCriteria" readonly />
        </FormItem>

        <!-- 巡检区域 -->
        <FormItem
          :label="$t('hiddenDangerInspectionPlan.inspectionArea')"
          style="margin-bottom: 1em"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="areaCode"
        >
          <Select
            v-model:value="editItem.areaCode"
            :options="areaOptions"
            show-search
            class="!w-56"
            :filter-option="filterOption"
            @change="areaChange"
          />
        </FormItem>

        <!-- 巡检内容 -->
        <FormItem
          :label="$t('hiddenDangerInspectionPlan.inspectionContent')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="content"
        >
          <Textarea v-model:value="editItem.content" />
        </FormItem>

        <!-- 巡检类型 -->
        <FormItem
          :label="$t('hiddenDangerInspectionPlan.inspectionType')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="timeType"
        >
          <RadioGroup
            v-model:value="editItem.timeType"
            :options="timeTypeOptions"
          />
        </FormItem>

        <!-- 开始时间 -->
        <FormItem
          :label="$t('hiddenDangerInspectionPlan.startTime')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="startTime"
          v-if="[0, 1, 2].includes(editItem.timeType)"
        >
          <DatePicker
            v-model:value="editItem.startTime"
            :disabled-date="disabledDate"
          />
        </FormItem>

        <!-- 结束时间 -->
        <FormItem
          :label="$t('hiddenDangerInspectionPlan.endTime')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="endTime"
          v-if="[1].includes(editItem.timeType)"
        >
          <DatePicker
            v-model:value="editItem.endTime"
            :disabled-date="disabledDateEnd"
          />
        </FormItem>

        <!-- 巡检周期 -->
        <FormItem
          :label="$t('hiddenDangerInspectionPlan.inspectionPeriod')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="cycle"
          v-if="[1].includes(editItem.timeType)"
        >
          <InputNumber
            v-model:value="editItem.cycle"
            :min="0"
            :addon-after="$t('hiddenDangerInspectionPlan.day')"
          />
        </FormItem>

        <!-- 专项检查名称 -->
        <FormItem
          :label="$t('hiddenDangerInspectionPlan.specialInspectionName')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="checkName"
          v-if="[2].includes(editItem.timeType)"
        >
          <Input v-model:value="editItem.checkName" />
        </FormItem>

        <!-- 日历名称 -->
        <FormItem
          :label="$t('hiddenDangerInspectionPlan.calendarName')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="calendarName"
          v-if="[0].includes(editItem.timeType)"
        >
          <Input v-model:value="editItem.calendarName" disabled>
            <template #addonAfter>
              <Button type="link" @click="showCalendar">
                {{ $t('ui.widgets.search.select') }}
              </Button>
            </template>
          </Input>
        </FormItem>
      </Form>
      <!-- 抽屉底部操作按钮 -->
      <template #footer>
        <!-- 按钮组，包含取消和确认按钮 -->
        <Space>
          <!-- 取消按钮，点击后关闭人员操作抽屉 -->
          <Button @click="editClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认按钮，点击后提交人员操作信息 -->
          <Button type="primary" @click="submit" :loading="submitLoading">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>

    <Drawer
      v-model:open="calendarOpen"
      :footer-style="{ textAlign: 'right' }"
      height="600"
      placement="top"
      :title="$t('common.edit')"
      @close="closeCalendar"
    >
      <CalendarSelection ref="calendarSelectionRef" v-if="calendarOpen" />

      <!-- 抽屉底部操作按钮 -->
      <template #footer>
        <!-- 按钮组，包含取消和确认按钮 -->
        <Space>
          <!-- 取消按钮，点击后关闭人员操作抽屉 -->
          <Button @click="closeCalendar">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认按钮，点击后提交人员操作信息 -->
          <Button type="primary" @click="setCalendar">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
