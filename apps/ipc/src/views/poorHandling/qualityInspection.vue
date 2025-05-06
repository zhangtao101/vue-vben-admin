<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { IconifyIcon, IconParkSolidError, MdiSuccess } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Row,
  Segmented,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  applyTask,
  getAllFinishQcForm,
  getAllFinishQcFormCount,
  getAllQcForm,
  getAllQcFormCount,
  getCheckCounts,
  getQualityPendingTasks,
  getQualityPendingTasksCount,
  taskAudit,
} from '#/api';
import InspectionTaskFilling from '#/util/component/inspectionTaskFilling.vue';

// region 上方事项

// 上方事项列表
const items = ref([
  {
    value: '1',
    payload: {
      label: '首检',
      count: 2,
    },
  },
  {
    value: '2',
    payload: {
      label: '巡检',
      count: 11,
    },
  },
  {
    value: '3',
    payload: {
      label: '末检',
      count: 4,
    },
  },
]);
// 当前选中的事项
const checkedItem = ref<any>('1');

/**
 * 数量初始化
 */
function itemInit() {
  items.value.forEach((item) => {
    getCheckCounts({
      checkType: item.value,
    }).then((data) => {
      item.payload.count = data;
      if (item.value === '1') {
        queryStatisticsOfTheNumberOfClaimedItems();
      }
    });
  });
}

/**
 * 获取颜色
 * @param payload
 */
function getColor(payload: any) {
  if (payload.count === 0) {
    return 'lime';
  } else if (payload.count < 3) {
    return 'blue';
  } else if (payload.count >= 10) {
    return 'red';
  } else if (payload.count >= 3) {
    return 'yellow';
  }
  return 'green';
}

// endregion

// region 领取数量统计

const statisticsOfTheNumberOfClaimedItems = ref([
  {
    value: '1',
    payload: {
      label: $t('andon.waitingToBeClaimed'),
      count: 0,
    },
  },
  {
    value: '2',
    payload: {
      label: $t('andon.toBeProcessed'),
      count: 0,
    },
  },
  {
    value: '3',
    payload: {
      label: $t('andon.completed'),
    },
  },
]);

const checkedType = ref('1');

function queryStatisticsOfTheNumberOfClaimedItems() {
  const ob = Promise.all([
    getQualityPendingTasksCount({
      checkType: checkedItem.value,
    }),
    getAllQcFormCount({
      checkType: checkedItem.value,
    }),
    getAllFinishQcFormCount({
      checkType: checkedItem.value,
    }),
  ]);
  ob.then(([count1, count2, count3]) => {
    statisticsOfTheNumberOfClaimedItems.value[0]!.payload.count = count1;
    statisticsOfTheNumberOfClaimedItems.value[1]!.payload.count = count2;
    statisticsOfTheNumberOfClaimedItems.value[2]!.payload.count = count3;
  });
}

// endregion

// region 工作站查询信息

// 查询条件
const queryParams = ref<any>({
  productionLineId: '',
  processId: '',
  checkedType: 0,
});

// endregion

// region 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      title: '序号',
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    {
      field: 'qcFormCode',
      title: '质检表单单号',
      minWidth: 150,
    },
    {
      field: 'recordCode',
      title: '任务编号',
      minWidth: 150,
    },
    {
      field: 'worksheetCode',
      title: '工单编号',
      minWidth: 200,
    },
    {
      field: 'productCode',
      title: '产品编号',
      minWidth: 150,
    },
    {
      field: 'productName',
      title: '产品名称',
      minWidth: 150,
    },
    {
      field: 'processName',
      title: '当前工序',
      minWidth: 150,
    },
    {
      field: 'equipName',
      title: '作业位置',
      minWidth: 150,
    },
    {
      field: 'operateUserName',
      title: '任务类型',
      minWidth: 150,
    },
    {
      field: 'operateTime',
      title: '任务产生时间',
      minWidth: 150,
    },
    {
      field: 'checkTime',
      title: '任务执行时间',
      minWidth: 150,
    },
    {
      field: 'operateUser',
      title: '任务创建人',
      minWidth: 150,
    },
    {
      title: '操作',
      minWidth: 150,
      slots: {
        default: 'action',
      },
      fixed: 'right',
    },
  ],
  height: 400,
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

const gridEvents: any = {
  radioChange: ({ row }: any) => {
    message.info(`radioChange: ${row}`);
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// region 查询数据
// 查询参数
const jobInformationQueryConditions = ref({
  // 工单号
  worksheetCode: '',
  // 当前工序
  processCode: '',
  // 作业位置
  equipCode: '',
});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params: any = {
      ...jobInformationQueryConditions.value,
      checkType: checkedItem.value,
      pageSize,
      pageNum: page,
    };
    let ob: any;
    switch (checkedType.value) {
      case '1': {
        ob = getQualityPendingTasks(params);
        break;
      }
      case '2': {
        ob = getAllQcForm(params);
        break;
      }
      case '3': {
        ob = getAllFinishQcForm(params);
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
      _reject(error);
    });
  });
}

/**
 * 重置查询条件
 */
function reload() {
  queryParams.value = {};
  gridApi.reload();
}

function collect(row: any) {
  // 弹出确认框，询问用户是否确认删除该行数据
  Modal.confirm({
    // 取消按钮的文本
    cancelText: '取消',
    // 确认按钮的文本
    okText: '确认',
    // 确认按钮的类型（此处为危险操作，通常用于删除等不可逆操作）
    okType: 'danger',

    // 用户取消操作时触发的回调函数
    onCancel() {
      // 弹出警告提示，提示用户取消了操作
      message.warning('已取消!');
    },

    // 用户确认操作时触发的回调函数
    onOk() {
      // 调用删除按钮的操作，传递按钮的编码和类型参数
      applyTask({
        ...row,
        qcRecordId: row.id,
      })
        .then(() => {
          // 如果删除操作成功，显示操作成功的提示信息
          message.success($t('common.successfulOperation')); // 成功操作的提示信息（通过国际化处理）
          itemInit();
          queryStatisticsOfTheNumberOfClaimedItems();
          gridApi.reload();
        })
        .catch((error) => {
          // 如果删除操作失败，显示错误提示信息
          message.error($t('common.operationFailure')); // 操作失败的提示信息（通过国际化处理）

          // 显示具体的错误信息
          message.error(error.msg); // 显示从服务器返回的错误消息
        });
    },

    // 确认框的标题文本
    title: '是否确认领取该任务?',
  });
}

// endregion

// endregion

// region 检验任务填报
// 当前编辑的行
const editItem = ref<any>({});
// 显示抽屉
const showEdit = ref<any>(false);
// 是否为启动状态
const startStatus = ref<any>(false);

/**
 * 显示抽屉
 * @param row
 */
function showEditFun(row: any, isStart = false) {
  editItem.value = row;
  showEdit.value = true;
  startStatus.value = isStart;
}

/**
 * 关闭抽屉
 */
function close() {
  showEdit.value = false;
  editItem.value = {};
  startStatus.value = false;
}
// endregion

// region 审核

/**
 * 处理审核操作（通过或不通过）。
 * @param row 要处理的审核数据对象，包含需要审核的数据信息。
 * @param isPass 布尔值，指示是否通过审核。为 true 时表示通过审核，false 表示不通过审核。
 */
function handleAudit(row: any, isPass: boolean) {
  // 根据 isPass 的值设置对话框的标题和 audioFun 的状态码
  // 如果 isPass 为 true，表示审核通过，否则表示审核不通过
  const title = isPass ? '是否确认通过该条数据?' : '是否确认不通过该条数据?';
  const statusCode = isPass ? 2 : 3;

  // 调用 Modal.confirm 方法显示一个确认对话框，让用户确认是否执行审核操作
  Modal.confirm({
    /**
     * 设置取消按钮的文本为 '取消'。
     */
    cancelText: '取消',
    /**
     * 设置确认按钮的文本为 '确认'。
     */
    okText: '确认',
    /**
     * 设置确认按钮的类型为 'primary'，表示这是一个主要的操作。
     */
    okType: 'primary',
    /**
     * 定义确认操作的回调函数。
     * 如果用户点击确认按钮，调用 audioFun 函数处理审核逻辑。
     */
    onOk() {
      // 根据审核结果调用 audioFun 函数，传入 row.id 和状态码
      taskAudit({
        id: row.id,
        auditType: statusCode,
      }).then(() => {
        // 显示成功消息
        message.success($t('common.successfulOperation'));

        itemInit();
        queryStatisticsOfTheNumberOfClaimedItems();
        gridApi.reload();
      });
    },
    /**
     * 设置对话框的标题，根据 isPass 的值显示不同的提示。
     */
    title,
  });
}

// endregion

onMounted(() => {
  itemInit();
});
</script>

<template>
  <Page id="page">
    <Card class="mb-5 text-center">
      <Segmented
        v-model:value="checkedItem"
        :options="items"
        @change="
          () => {
            queryStatisticsOfTheNumberOfClaimedItems();
            gridApi.reload();
          }
        "
      >
        <template #label="{ payload = {} }">
          <Badge
            :count="payload.count || 0"
            class="mr-4 mt-4 p-2"
            :color="getColor(payload)"
            show-zero
          >
            <div>{{ payload.label }}</div>
          </Badge>
        </template>
      </Segmented>
    </Card>
    <Row class="mb-4">
      <Col :span="4">
        <span class="border-l-4 border-sky-500 pl-4 text-2xl font-black">
          {{ $t('qualityInspection.toDoTask') }}
        </span>
      </Col>
      <Col :span="16">
        <Segmented
          v-model:value="checkedType"
          :options="statisticsOfTheNumberOfClaimedItems"
          @change="() => gridApi.reload()"
        >
          <template #label="{ payload = {} }">
            <Badge
              :count="payload.count || 0"
              class="mr-4 mt-4 p-2"
              :color="getColor(payload)"
              show-zero
            >
              <div>{{ payload.label }}</div>
            </Badge>
          </template>
        </Segmented>
      </Col>
    </Row>
    <Card>
      <Form layout="inline" :model="queryParams">
        <!--工单编号 -->
        <FormItem
          :label="$t('qualityInspection.workOrderNumber')"
          class="!mb-4"
        >
          <Input v-model:value="jobInformationQueryConditions.worksheetCode" />
        </FormItem>
        <!--当前工序 -->
        <FormItem
          :label="$t('qualityInspection.currentOperation')"
          class="!mb-4"
        >
          <Input v-model:value="jobInformationQueryConditions.processCode" />
        </FormItem>
        <!--作业位置 -->
        <FormItem :label="$t('qualityInspection.jobPosition')" class="!mb-4">
          <Input v-model:value="jobInformationQueryConditions.equipCode" />
        </FormItem>
        <FormItem class="!mb-4">
          <Button type="primary" @click="gridApi.reload()" class="mr-4">
            {{ $t('common.search') }}
          </Button>
          <Button @click="reload()">
            {{ $t('common.reset') }}
          </Button>
        </FormItem>
      </Form>

      <Grid class="mt-4">
        <template #toolbar-tools> </template>
        <template #action="{ row }">
          <!-- 领取 -->
          <Tooltip v-if="checkedType === '1'">
            <template #title>{{ $t('common.collect') }}</template>
            <Button
              type="link"
              :icon="
                h(IconifyIcon, {
                  icon: 'mdi:hand-extended-outline',
                  class: 'inline-block text-2xl',
                })
              "
              @click="collect(row)"
            />
          </Tooltip>
          <!-- 开始 -->
          <Tooltip v-if="checkedType === '2' && row.taskState === 1">
            <template #title>{{ $t('common.start') }}</template>
            <Button
              type="link"
              :icon="
                h(IconifyIcon, {
                  icon: 'mdi:play-outline',
                  class: 'inline-block text-2xl',
                })
              "
              @click="showEditFun(row, true)"
            />
          </Tooltip>
          <!-- 继续 -->
          <Tooltip v-if="checkedType === '2' && row.taskState === 2">
            <template #title>{{ $t('common.continue') }}</template>
            <Button
              type="link"
              :icon="
                h(IconifyIcon, {
                  icon: 'mdi:play-pause',
                  class: 'inline-block text-2xl',
                })
              "
              @click="showEditFun(row, false)"
            />
          </Tooltip>

          <!-- 审核通过 -->
          <Tooltip v-if="checkedType === '2' && row.taskState === 4">
            <template #title>{{ $t('common.pass') }}</template>
            <Button
              :icon="h(MdiSuccess, { class: 'inline-block size-6' })"
              :loading="row.loading"
              class="mr-4"
              type="link"
              @click="handleAudit(row, true)"
            />
          </Tooltip>

          <!-- 审核不通过 -->
          <Tooltip v-if="checkedType === '2' && row.taskState === 4">
            <template #title>{{ $t('common.noPass') }}</template>
            <Button
              :icon="
                h(IconParkSolidError, {
                  class: 'inline-block size-6 text-red-600',
                })
              "
              :loading="row.loading"
              class="mr-4"
              type="link"
              @click="handleAudit(row, false)"
            />
          </Tooltip>
        </template>
      </Grid>
    </Card>

    <!-- 检验任务填报  -->
    <Drawer
      :title="$t('qualityInspection.inspectionTaskFilling')"
      v-model:open="showEdit"
      placement="top"
      :height="500"
      @close="close"
    >
      <InspectionTaskFilling
        :record-code="editItem.recordCode"
        :is-start="startStatus"
        :record-id="editItem.id"
        @close="
          () => {
            gridApi.reload();
            close();
          }
        "
        v-if="showEdit"
      />
    </Drawer>
  </Page>
</template>

<style scoped lang="scss"></style>
