<script setup lang="ts">
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';
import { useVbenVxeGrid } from '@vben/plugins/vxe-table';

import {
  Button,
  Calendar,
  Col,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  RadioGroup,
  RangePicker,
  Row,
  Space,
  Spin,
  Tooltip,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  addAdditionalRule,
  deleteAdditionalRule,
  getAdditionalRuleDetail,
  queryAdditionalRules,
  updateAdditionalRule,
} from '#/api';

// region 显示详情

const detailsDrawer = ref(false);
const details = ref<any>({});
/**
 * 查询详情
 */
function showDetails(row: any) {
  detailsDrawer.value = true;
  details.value = {
    ...row,
  };
}

/**
 * 关闭详情抽屉
 */
function detailsClose() {
  showCalendar.value = false;
  detailsDrawer.value = false;
  details.value = {};
}

function getADayOff(time: any) {
  if (isException(time)) {
    return 'bg-yellow-500 text-white';
  }
  switch (time.day()) {
    case 0: {
      return details.value.sunday === 1 ? 'bg-cyan-500 text-white' : '';
    }
    case 1: {
      return details.value.monday === 1 ? 'bg-cyan-500 text-white' : '';
    }
    case 2: {
      return details.value.tuesday === 1 ? 'bg-cyan-500 text-white' : '';
    }
    case 3: {
      return details.value.wednesday === 1 ? 'bg-cyan-500 text-white' : '';
    }
    case 4: {
      return details.value.thursday === 1 ? 'bg-cyan-500 text-white' : '';
    }
    case 5: {
      return details.value.friday === 1 ? 'bg-cyan-500 text-white' : '';
    }
    case 6: {
      return details.value.saturday === 1 ? 'bg-cyan-500 text-white' : '';
    }
    default: {
      return '';
    }
  }
}

function isException(time: any) {
  const arr = gridApi.grid?.getTableData().tableData || [];
  for (const item of arr) {
    if (item.isWork === 1) {
      const res = time.isBetween(
        dayjs(item.startDate, 'YYYY-MM-DD'),
        dayjs(item.endDate, 'YYYY-MM-DD'),
        'day',
        '[]',
      );
      if (res) {
        return true;
      }
    }
  }
  return false;
}

// endregion

// region 表格操作
// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'ruleCode', title: '规则编号', minWidth: 150 },
    { field: 'ruleName', title: '规则名称', minWidth: 150 },
    { field: 'startDate', title: '开始日期', minWidth: 150 },
    { field: 'endDate', title: '结束日期', minWidth: 150 },
    { field: 'uTime', title: '修改时间', minWidth: 150 },
    { field: 'uName', title: '操作人', minWidth: 150 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 220,
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
          page: page?.currentPage,
          pageSize: page?.pageSize,
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

/**
 * 删除行
 * @param row
 */
function delRow(row: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消删除!');
    },
    onOk() {
      deleteAdditionalRule({
        id: row.id,
      })
        .then(() => {
          // 显示操作成功的提示信息
          message.success($t('common.successfulOperation'));
          gridApi.query();
        })
        .catch((error) => {
          // 显示操作失败的提示信息
          message.error($t('common.operationFailure'));
          message.error(error.msg); // 显示操作失败的提示信息
        });
    },
    title: '是否确认删除该条数据?',
  });
}

// endregion

// region 新增/编辑
const form = ref();
// 新增/编辑弹窗是否显示
const showEditDialog = ref(false);
// 新增/编辑对象
const editItem = ref<any>({});
// 工作日选项
const workDayOptions = ref<any>([
  { label: $t('basic.factoryCalendar.workDay'), value: 2 },
  { label: $t('basic.factoryCalendar.nonWorkDay'), value: 1 },
]);
// 新增/编辑规则
const editRules = ref<any>({
  staCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  time: [{ message: '此项为必填项', required: true, trigger: 'change' }],
});
/**
 * 显示编辑抽屉
 * @param isCreate 是否是新增
 * @param row 当前行数据(isCreate为false时才会有)
 */
function showEdit(isCreate: boolean, row?: any) {
  showEditDialog.value = true;
  if (isCreate) {
    editItem.value = {};
  } else {
    editItem.value = {};
    getAdditionalRuleDetail({
      id: row.id,
    }).then((data: any) => {
      editItem.value = data;
      editItem.value.time = [
        dayjs(editItem.value.startDate, 'YYYY-MM-DD'),
        dayjs(editItem.value.endDate, 'YYYY-MM-DD'),
      ];
    });
  }
}

/**
 * 关闭抽屉
 */
function close() {
  showEditDialog.value = false;
  editItem.value = {};
}

// 上传状态
const submitLoading = ref(false);
/**
 * 提交
 */
function submit() {
  const params = {
    ...editItem.value,
    calendarId: details.value.id,
  };
  if (params.time) {
    params.startDate = params.time[0].format('YYYY-MM-DD');
    params.endDate = params.time[1].format('YYYY-MM-DD');
    delete params.time;
  }
  /**
   * 使用 form.value.validate() 方法验证表单。
   * 这个方法返回一个 Promise 对象，我们使用 then 方法来处理验证通过的情况。
   */
  form.value.validate().then(() => {
    submitLoading.value = true;
    const ob = editItem.value.id
      ? updateAdditionalRule(params)
      : addAdditionalRule(params);
    ob.then(() => {
      // 显示操作成功的提示信息
      message.success($t('common.successfulOperation'));
      gridApi.query();
      close();
    }).finally(() => {
      submitLoading.value = false;
    });
  });
}
// endregion

// region 查询数据
const showCalendar = ref(false);
/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 调用 getPlantCalendarList API函数，传递查询参数和分页信息
    queryAdditionalRules({
      calendarId: details.value.id,
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ total, list }) => {
        // 成功获取数据后，更新数据列表和总条数
        resolve({
          total,
          items: list,
        });
      })
      .catch((error) => {
        reject(error);
      })
      .finally(() => {
        setTimeout(() => {
          showCalendar.value = true;
        }, 500);
      });
  });
}

// endregion

/**
 * 暴露 query 方法供父组件调用
 */
defineExpose({
  open: showDetails,
});
</script>

<template>
  <Drawer
    v-model:open="detailsDrawer"
    :footer-style="{ textAlign: 'right' }"
    height="100%"
    placement="top"
    title="信息详情"
    @close="detailsClose"
  >
    <!-- 日历名称 -->
    <FormItem :label="$t('basic.factoryCalendar.calendarName')" name="calendarName">
      <Input v-model:value="details.calendarName" readonly />
    </FormItem>
    <!-- 所属组织 -->
    <FormItem
      :label="$t('basic.factoryCalendar.affiliation')"
      name="organizationName"
    >
      <Input v-model:value="details.organizationName" readonly />
    </FormItem>
    <Row>
      <Col :span="4">
        <div>
          <span class="text-lg font-bold">
            {{ $t('basic.factoryCalendar.legend') }}
          </span>
          <span
            class="m-4 block h-8 border bg-cyan-500 px-4 text-center leading-[200%] text-white"
          >
            {{ $t('basic.factoryCalendar.nonWorkDay') }}
          </span>
          <span class="m-4 block h-8 border px-4 text-center leading-[200%]">
            {{ $t('basic.factoryCalendar.workDay') }}
          </span>
          <span
            class="mx-4 block h-8 border bg-yellow-500 px-4 text-center leading-[200%] text-white"
          >
            {{ $t('basic.factoryCalendar.exception') }}
          </span>
        </div>
      </Col>
      <Col :span="20">
        <Spin :spinning="!showCalendar">
          <Calendar v-if="showCalendar">
            <template #dateFullCellRender="{ current }">
              <div class="h-24 p-4">
                <span
                  class="inline-block h-8 w-8 rounded-full text-center leading-[200%]"
                  :class="getADayOff(current)"
                >
                  {{ current.date() }}
                </span>
              </div>
            </template>
          </Calendar>
        </Spin>
      </Col>
    </Row>
    <Grid v-if="detailsDrawer">
      <template #toolbar-tools>
        <!-- 新增按钮 -->
        <Button type="primary" @click="showEdit(true)">
          {{ $t('common.add') }}
        </Button>
      </template>
      <template #action="{ row }">
        <!-- 编辑按钮 -->
        <Tooltip>
          <template #title>{{ $t('common.edit') }}</template>
          <Button class="mr-4" type="link" @click="showEdit(false, row)">
            <template #icon>
              <IconifyIcon
                icon="mdi:edit-outline"
                class="inline-block align-middle text-2xl"
              />
            </template>
          </Button>
        </Tooltip>

        <!-- 删除数据 -->
        <Tooltip>
          <template #title>{{ $t('common.delete') }}</template>
          <Button danger type="link" @click="delRow(row)">
            <template #icon>
              <IconifyIcon
                icon="mdi-light:delete"
                class="inline-block align-middle text-2xl"
              />
            </template>
          </Button>
        </Tooltip>
      </template>
    </Grid>
  </Drawer>

  <!-- region 新增 / 编辑 -->
  <Drawer
    v-model:open="showEditDialog"
    :footer-style="{ textAlign: 'right' }"
    :width="500"
    placement="right"
    title="信息编辑"
    @close="close"
  >
    <Form
      :label-col="{ span: 8 }"
      :model="editItem"
      :rules="editRules"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
      name="editMessageForm"
      ref="form"
    >
      <!-- 规则编号 -->
      <FormItem :label="$t('basic.factoryCalendar.ruleCode')" name="ruleCode">
        <Input v-model:value="editItem.ruleCode" disabled />
      </FormItem>
      <!-- 特殊规则名称 -->
      <FormItem :label="$t('basic.factoryCalendar.ruleName')" name="ruleName">
        <Input v-model:value="editItem.ruleName" />
      </FormItem>
      <!-- 特殊规则日期 -->
      <FormItem :label="$t('basic.factoryCalendar.time')" name="time">
        <RangePicker v-model:value="editItem.time" />
      </FormItem>
      <!-- 工作周设定 -->
      <FormItem :label="$t('basic.factoryCalendar.workWeekSetting')" name="startDay">
        <RadioGroup v-model:value="editItem.isWork" :options="workDayOptions" />
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <!-- 取消 -->
        <Button @click="close">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认 -->
        <Button type="primary" @click="submit" :loading="submitLoading">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
  <!-- endregion -->
</template>

<style scoped></style>
