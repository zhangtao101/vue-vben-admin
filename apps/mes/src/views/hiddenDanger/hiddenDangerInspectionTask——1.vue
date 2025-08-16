<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { IconifyIcon, MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
  Cascader,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Popconfirm,
  RadioGroup,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  assigned,
  collect,
  lishi,
  list,
  listSysPerson,
  queryDetails,
  queryOrganizationTree,
  taskList,
  taskListEd,
  taskListWill,
} from '#/api';
import { $t } from '#/locales';
import { flattenTree, queryAuth } from '#/util';

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'checkCode', title: '检查编号', minWidth: 150 },
    { field: 'planCheckTime', title: '计划检查时间', minWidth: 150 },
    { field: 'checkType', title: '检查类别', minWidth: 150 },
    { field: 'checkCriteria', title: '检查标准', minWidth: 150 },
    { field: 'checkName', title: '专项检查名称', minWidth: 150 },
    { field: 'checkUser', title: '检查人', minWidth: 150 },
    { field: 'area', title: '检查区域', minWidth: 150 },
    { field: 'areaCode', title: '检查项目', minWidth: 150 },
    { field: 'content', title: '检查内容', minWidth: 150 },
    { field: 'result', title: '结果', minWidth: 150 },
    { field: 'remark', title: '备注', minWidth: 150 },
    { field: 'checkTime', title: '检查时间', minWidth: 150 },
    { field: 'photo', title: '照片', minWidth: 150 },
    { field: 'sign', title: '扫码', minWidth: 150 },
    {
      field: 'isReport',
      title: '是否上报隐患',
      minWidth: 150,
      slots: { default: 'status' },
    },
    {
      field: 'state',
      title: '是否完成巡检',
      minWidth: 150,
      slots: { default: 'status' },
    },
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
// 查询类型
const queryType = ref<any>(1);
// 类型列表
const typeList = [
  {
    label: $t('hiddenDangerInspectionTask.all'),
    value: 1,
  },
  {
    label: $t('hiddenDangerInspectionTask.completedToday'),
    value: 2,
  },
  {
    label: $t('hiddenDangerInspectionTask.itIsNotFinishedToday'),
    value: 3,
  },
  {
    label: $t('hiddenDangerInspectionTask.unspecified'),
    value: 4,
  },
  {
    label: $t('hiddenDangerInspectionTask.historicalMission'),
    value: 5,
  },
];
/**
 * 检查结果
 */
const checkTheResults = [
  {
    label: $t('hiddenDangerInspectionTask.all'),
    value: -1,
  },
  {
    label: $t('hiddenDangerInspectionTask.thereAreHiddenDangers'),
    value: 1,
  },
  {
    label: $t('hiddenDangerInspectionTask.thereAreNoHiddenDangers'),
    value: 0,
  },
];
/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = {
      ...queryParams.value,
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    };
    let ob: any;
    switch (queryType.value) {
      case 1: {
        ob = list(params);
        break;
      }
      case 2: {
        ob = taskListEd(params);
        break;
      }
      case 3: {
        ob = taskList(params);
        break;
      }
      case 4: {
        ob = taskListWill(params);
        break;
      }
      case 5: {
        ob = lishi(params);
        break;
      }
    }
    ob.then(({ total, list }: any) => {
      // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
      resolve({
        total,
        items: list,
      });
    }).catch((error: any) => {
      resolve({
        total: 0,
        items: [{ id: 1 }],
      });
      reject(error);
    });
  });
}

// endregion

// region 领取任务

/**
 * 领取任务
 * @param row 任务详情
 */
function claimTheTask(row: any) {
  collect({
    id: row.id,
  }).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

// endregion

// region 指派任务
// 指派的请求参数
const assignedParams = ref<any>({});
// 选中的用户
const userChecked = ref<any>([]);
// 是否显示指派任务的模态框
const showAssigned = ref(false);

/**
 * 指派任务提交
 */
function assignedSubmit() {
  assigned(assignedParams.value).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
    assignedCancel();
  });
}

/**
 * 指派任务取消
 */
function assignedCancel() {
  showAssigned.value = false;
  userChecked.value = [];
  assignedParams.value = {};
}

/**
 * 打开指派任务的模态框
 * @param row 任务详情
 */
function openAssigned(row: any) {
  assignedParams.value = {
    id: row.id,
  };
  showAssigned.value = true;
}

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
    assignedParams.value.assignedParams = user.perName;
    assignedParams.value.workNumber = user.workNumber;
  }
}

// endregion

// endregion

// region 显示详情 / 完成计划
// 是否为显示详情
const isShowDetails = ref(false);
// 是否显示
const openDetails = ref<any>(false);
// 详情
const details = ref<any>({});
// 详情加载中
const detailsLoading = ref(false);

/**
 * 显示详情
 * @param rowID 操作行id
 * @param isDetails 是否为详情
 */
function showDetails(rowID: any, isDetails = true) {
  openDetails.value = true;
  isShowDetails.value = isDetails;
  detailsLoading.value = true;
  queryDetails(rowID)
    .then((data) => {
      details.value = data;
    })
    .finally(() => {
      detailsLoading.value = false;
    });
}

/**
 * 详情抽屉关闭
 */
function detailsClose() {
  openDetails.value = false;
  isShowDetails.value = false;
  details.value = {};
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
  queryAllOrganizations();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 任务状态 -->
        <FormItem
          :label="$t('hiddenDangerInspectionTask.status')"
          style="margin-bottom: 1em"
          class="w-full"
        >
          <RadioGroup :options="typeList" v-model:value="queryType" />
        </FormItem>
        <!-- 检查结果 -->
        <FormItem
          :label="$t('hiddenDangerInspectionTask.InspectionResult')"
          style="margin-bottom: 1em"
          v-if="queryType === 1"
        >
          <RadioGroup
            :options="checkTheResults"
            v-model:value="queryParams.result"
          />
        </FormItem>
        <!-- 检查人 -->
        <FormItem
          :label="$t('hiddenDangerInspectionTask.inspector')"
          style="margin-bottom: 1em"
          v-if="queryType === 1"
        >
          <Input v-model:value="queryParams.checkUser" />
        </FormItem>
        <!-- 巡检区域 -->
        <FormItem
          :label="$t('hiddenDangerInspectionTask.InspectionArea')"
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
        <template #status="{ row, column }">
          {{
            row[column.field] === 0
              ? $t('hiddenDangerInspectionTask.toBeContinued')
              : $t('hiddenDangerInspectionTask.wasDone')
          }}
        </template>
        <template #action="{ row }">
          <!-- 查看 -->
          <Tooltip>
            <template #title>{{ $t('common.view') }}</template>
            <Button type="link" @click="showDetails(row.id)">
              <IconifyIcon
                icon="mdi:eye"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 完成任务 -->
          <Tooltip>
            <template #title>{{ $t('common.view') }}</template>
            <Button type="link" @click="showDetails(row.id, false)">
              <IconifyIcon
                icon="mdi:eye"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 指派 -->
          <Tooltip>
            <template #title>{{ $t('common.assign') }}</template>
            <Button type="link" @click="openAssigned(row)">
              <IconifyIcon
                icon="mdi:hand-coin-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 领取 -->
          <Tooltip>
            <template #title>{{ $t('common.receive') }}</template>
            <Popconfirm
              :cancel-text="$t('common.cancel')"
              :ok-text="$t('common.confirm')"
              :title="$t('ui.widgets.pickUpTips')"
              @confirm="claimTheTask(row)"
            >
              <Button type="link">
                <IconifyIcon
                  icon="mdi:book-multiple-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Popconfirm>
          </Tooltip>
          <!-- 删除 -->
          <Tooltip>
            <template #title>{{ $t('common.delete') }}</template>
            <Popconfirm
              :cancel-text="$t('common.cancel')"
              :ok-text="$t('common.confirm')"
              :title="$t('ui.widgets.deletionConfirmation')"
            >
              <!--
              @confirm="delItem(row)"           -->
              <Button danger type="link">
                <IconifyIcon
                  icon="mdi-light:delete"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Popconfirm>
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- region 详情 / 完成任务 -->
    <Drawer
      v-model:open="openDetails"
      :footer-style="{ textAlign: 'right' }"
      width="700"
      placement="right"
      :title="$t('common.edit')"
      @close="detailsClose"
    >
      <Descriptions :column="2" bordered>
        <!-- 检查编号 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.checkTheNumber')"
        >
          {{
            details.checkCode || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 计划检查时间 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.PlannedInspectionDate')"
        >
          {{
            details.planCheckTime ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 检查类别 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.InspectionCategory')"
        >
          {{
            details.checkType || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 检查标准 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.InspectionStandard')"
        >
          {{
            details.checkCriteria ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 专项检查名称 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.specialInspectionName')"
        >
          {{
            details.checkName || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 检查人 -->
        <DescriptionsItem :label="$t('hiddenDangerInspectionTask.checkUser')">
          {{
            details.checkUser || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 检查区域 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.InspectionArea')"
        >
          {{ details.area || $t('hiddenDangerInspectionTask.notAtTheMoment') }}
        </DescriptionsItem>
        <!-- 检查项目 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.InspectionItem')"
        >
          {{
            details.areaCode || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 检查内容 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.InspectionContent')"
        >
          {{
            details.content || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 检查结果 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.InspectionResult')"
        >
          {{
            details.result === 1
              ? $t('hiddenDangerInspectionTask.thereAreHiddenDangers')
              : $t('hiddenDangerInspectionTask.thereAreNoHiddenDangers')
          }}
        </DescriptionsItem>
        <!-- 备注 -->
        <DescriptionsItem :label="$t('hiddenDangerInspectionTask.Remarks')">
          {{
            details.remark || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 检查时间 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.InspectionTime')"
        >
          {{
            details.checkTime || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 照片 -->
        <DescriptionsItem :label="$t('hiddenDangerInspectionTask.Photo')">
          {{ details.photo || $t('hiddenDangerInspectionTask.notAtTheMoment') }}
        </DescriptionsItem>
        <!-- 是否上报隐患 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.ReportHiddenDanger')"
        >
          {{
            details.isReport === 1
              ? $t('hiddenDangerInspectionTask.wasDone')
              : $t('hiddenDangerInspectionTask.toBeContinued')
          }}
        </DescriptionsItem>
        <!-- 是否完成巡检 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.inspectionStatus')"
        >
          {{
            details.state === 1
              ? $t('hiddenDangerInspectionTask.wasDone')
              : $t('hiddenDangerInspectionTask.toBeContinued')
          }}
        </DescriptionsItem>
      </Descriptions>
    </Drawer>

    <!-- endregion -->

    <!-- region 指派 -->
    <Modal
      v-model:open="showAssigned"
      title="Basic Modal"
      @ok="assignedSubmit"
      @cancel="assignedCancel()"
      :ok-button-props="{
        disabled: !(userChecked && userChecked.length === 2),
      }"
    >
      <Cascader
        v-model:value="userChecked"
        :options="treeData"
        :load-data="userSearch"
        @change="userChange"
        change-on-select
        class="w-full"
      />
    </Modal>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
