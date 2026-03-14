<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  RadioGroup,
  Select,
  Space,
  TimeRangePicker,
  Tooltip,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addPlantCalendar,
  deletePlantCalendar,
  getPlantCalendarDetail,
  getPlantCalendarList,
  queryOrganization,
  updatePlantCalendar,
} from '#/api';
import { queryAuth } from '#/util';
import CalendarException from '#/util/component/calendarException.vue';

// 路由信息
const route = useRoute();

// region 表格操作
// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'calendarName', title: '日历名称', minWidth: 150 },
    { field: 'organizationName', title: '组织名称', minWidth: 150 },
    { field: 'cTime', title: '创建时间', minWidth: 150 },
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
      deletePlantCalendar({
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
// 日期列表
const dayArr = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];
// 工作日选项
const workDayOptions = ref<any>([
  { label: $t('basic.factoryCalendar.workDay'), value: 2 },
  { label: $t('basic.factoryCalendar.nonWorkDay'), value: 1 },
]);
// 新增/编辑规则
const editRules = ref<any>({
  staCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  staName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
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
    // 赋初始值
    dayArr.forEach((item) => {
      editItem.value[item] = '1';
    });
  } else {
    editItem.value = {};
    getPlantCalendarDetail({
      id: row.id,
    }).then((data: any) => {
      editItem.value = data;
      for (const item of dayArr) {
        switch (item) {
          case 'friday': {
            if (editItem.value.startTime6) {
              editItem.value[`${item}_time`] = [
                dayjs(editItem.value.startTime6, 'HH:mm:ss'),
                dayjs(editItem.value.endTime6, 'HH:mm:ss'),
              ];
            }
            break;
          }
          case 'monday': {
            if (editItem.value.startTime2) {
              editItem.value[`${item}_time`] = [
                dayjs(editItem.value.startTime2, 'HH:mm:ss'),
                dayjs(editItem.value.endTime2, 'HH:mm:ss'),
              ];
            }
            break;
          }
          case 'saturday': {
            if (editItem.value.startTime7) {
              editItem.value[`${item}_time`] = [
                dayjs(editItem.value.startTime7, 'HH:mm:ss'),
                dayjs(editItem.value.endTime7, 'HH:mm:ss'),
              ];
            }
            break;
          }
          case 'sunday': {
            if (editItem.value.startTime1) {
              editItem.value[`${item}_time`] = [
                dayjs(editItem.value.startTime1, 'HH:mm:ss'),
                dayjs(editItem.value.endTime1, 'HH:mm:ss'),
              ];
            }
            break;
          }
          case 'thursday': {
            if (editItem.value.startTime5) {
              editItem.value[`${item}_time`] = [
                dayjs(editItem.value.startTime5, 'HH:mm:ss'),
                dayjs(editItem.value.endTime5, 'HH:mm:ss'),
              ];
            }
            break;
          }
          case 'tuesday': {
            if (editItem.value.startTime3) {
              editItem.value[`${item}_time`] = [
                dayjs(editItem.value.startTime3, 'HH:mm:ss'),
                dayjs(editItem.value.endTime3, 'HH:mm:ss'),
              ];
            }
            break;
          }
          case 'wednesday': {
            if (editItem.value.startTime4) {
              editItem.value[`${item}_time`] = [
                dayjs(editItem.value.startTime4, 'HH:mm:ss'),
                dayjs(editItem.value.endTime4, 'HH:mm:ss'),
              ];
            }
            break;
          }
        }
      }
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
  /**
   * 使用 form.value.validate() 方法验证表单。
   * 这个方法返回一个 Promise 对象，我们使用 then 方法来处理验证通过的情况。
   */
  form.value.validate().then(() => {
    submitLoading.value = true;
    const params = {
      ...editItem.value,
    };
    for (const item of dayArr) {
      const day = params[item];
      const time = params[`${item}_time`];
      if (day === 2 && time && time.length === 2) {
        switch (item) {
          case 'friday': {
            params.startTime6 = time[0].format('HH:mm:ss');
            params.endTime6 = time[1].format('HH:mm:ss');
            break;
          }
          case 'monday': {
            params.startTime2 = time[0].format('HH:mm:ss');
            params.endTime2 = time[1].format('HH:mm:ss');
            break;
          }
          case 'saturday': {
            params.startTime7 = time[0].format('HH:mm:ss');
            params.endTime7 = time[1].format('HH:mm:ss');
            break;
          }
          case 'sunday': {
            params.startTime1 = time[0].format('HH:mm:ss');
            params.endTime1 = time[1].format('HH:mm:ss');
            break;
          }
          case 'thursday': {
            params.startTime5 = time[0].format('HH:mm:ss');
            params.endTime5 = time[1].format('HH:mm:ss');
            break;
          }
          case 'tuesday': {
            params.startTime3 = time[0].format('HH:mm:ss');
            params.endTime3 = time[1].format('HH:mm:ss');
            break;
          }
          case 'wednesday': {
            params.startTime4 = time[0].format('HH:mm:ss');
            params.endTime4 = time[1].format('HH:mm:ss');
            break;
          }
        }
      }
    }
    const ob = params.id
      ? updatePlantCalendar(params)
      : addPlantCalendar(params);
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

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 调用 getPlantCalendarList API函数，传递查询参数和分页信息
    getPlantCalendarList({
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
      });
  });
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 查询组织
const orgs = ref<any[]>([]);
/**
 * 查询组织
 */
function queryOrg() {
  queryOrganization({
    pageNum: 1,
    pageSize: 999_999,
  }).then(({ list }) => {
    orgs.value = [];
    list.forEach((item: any) => {
      orgs.value.push({
        label: `${item.orgFullName}(${item.orgCode})`,
        value: item.orgCode,
      });
    });
  });
}

/**
 * 组织选择器改变事件
 * @param _value 组织选择器的值
 * @param item 组织选择器选中的项
 */
function orgChange(_value: any, item: any) {
  editItem.value.organizationName = item.label;
  editItem.value.organizationCode = item.value;
}

/**
 * 筛选选项
 * @param input 输入值
 * @param option 选项
 * @returns 是否匹配
 */
const filterOption = (input: string, option: any) => {
  return `${option.value}&&${option.label}`
    .toLowerCase()
    .includes(input.toLowerCase());
};

// endregion

// region 查看详情

const calendarExceptionRef = ref();

/**
 * 显示详情
 * @param row
 */
function showDetails(row: any) {
  calendarExceptionRef.value.open(row);
}
// endregion

// region 初始化

onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  queryOrg();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 表格 -->
    <Card class="mb-8">
      <Grid>
        <template #toolbar-tools>
          <!-- 新增按钮 -->
          <Button type="primary" @click="showEdit(true)">
            {{ $t('common.add') }}
          </Button>
        </template>
        <template #action="{ row }">
          <!-- 查看按钮 -->
          <Tooltip>
            <template #title>{{ $t('common.view') }}</template>
            <Button class="mr-4" type="link" @click="showDetails(row)">
              <template #icon>
                <Icon
                  icon="mdi:eye-outline"
                  class="inline-block align-middle text-2xl"
                />
              </template>
            </Button>
          </Tooltip>
          <!-- 编辑按钮 -->
          <Tooltip v-if="author.includes('编辑')">
            <template #title>{{ $t('common.edit') }}</template>
            <Button class="mr-4" type="link" @click="showEdit(false, row)">
              <template #icon>
                <Icon
                  icon="mdi:edit-outline"
                  class="inline-block align-middle text-2xl"
                />
              </template>
            </Button>
          </Tooltip>

          <!-- 删除数据 -->
          <Tooltip v-if="author.includes('删除')">
            <template #title>{{ $t('common.delete') }}</template>
            <Button danger type="link" @click="delRow(row)">
              <template #icon>
                <Icon
                  icon="mdi-light:delete"
                  class="inline-block align-middle text-2xl"
                />
              </template>
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

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
        <!-- 日历名称 -->
        <FormItem
          :label="$t('basic.factoryCalendar.calendarName')"
          name="calendarName"
        >
          <Input v-model:value="editItem.calendarName" />
        </FormItem>
        <!-- 所属组织 -->
        <FormItem
          :label="$t('basic.factoryCalendar.affiliation')"
          name="organizationName"
        >
          <Select
            v-model:value="editItem.organizationName"
            show-search
            :filter-option="filterOption"
            :options="orgs"
            @change="orgChange"
          />
        </FormItem>
        <!-- 工作周设定 -->
        <FormItem
          :label="$t('basic.factoryCalendar.workWeekSetting')"
          name="startDay"
        >
          <!-- 周日 - 周六 -->
          <FormItem
            :label="$t(`basic.factoryCalendar.${item}`)"
            v-for="item of dayArr"
            :key="item"
          >
            <RadioGroup
              v-model:value="editItem[item]"
              :options="workDayOptions"
              class="mt-1"
            />
            <TimeRangePicker
              v-model:value="editItem[`${item}_time`]"
              class="mt-4"
              v-if="editItem[item] === 2"
            />
          </FormItem>
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

    <!-- 特殊规则及查看详情 -->
    <CalendarException ref="calendarExceptionRef" />
  </Page>
</template>

<style scoped></style>
