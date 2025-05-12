<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { IconifyIcon, IconParkSolidError, MdiSuccess } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  BadgeRibbon,
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
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
      count: 0,
    },
  },
  {
    value: '2',
    payload: {
      label: '巡检',
      count: 0,
    },
  },
  {
    value: '3',
    payload: {
      label: '末检',
      count: 0,
    },
  },
]);
// 当前选中的事项
const checkedItem = ref<any>('1');

/**
 * 初始化各检查类型任务数量
 * 功能：获取首检/巡检/末检的待处理任务数量
 * 流程：
 * 1. 遍历检查类型配置项
 * 2. 对每个检查类型发起数量查询请求
 * 3. 更新对应类型的任务计数显示
 * 4. 首检类型额外触发统计信息刷新
 *
 * 注意事项：
 * - 使用异步请求获取最新任务数量
 * - 首检类型初始化后会同步更新统计面板数据
 */
function itemInit() {
  items.value.forEach((item) => {
    getCheckCounts({
      checkType: item.value,
    }).then((data) => {
      item.payload.count = data; // 更新当前检查类型的任务计数
      if (item.value === '1') {
        // 首检类型需要刷新统计面板
        queryStatisticsOfTheNumberOfClaimedItems();
      }
    });
  });
}

/**
 * 获取任务数量对应的状态颜色
 * 功能：根据任务数量值返回对应的颜色标识
 * 颜色规则：
 * - 0 任务：绿色（lime）
 * - 1-2 任务：蓝色（blue）
 * - 3-9 任务：黄色（yellow）
 * - 10+ 任务：红色（red）
 *
 * @param payload - 包含任务数量(count)的对象
 * @returns 颜色名称字符串
 *
 * 实现逻辑：
 * 1. 按任务数量从高到低进行判断
 * 2. 优先级顺序：红 > 黄 > 蓝 > 绿
 */
function getColor(payload: any) {
  if (payload.count === 0) {
    return 'lime'; // 无任务状态
  } else if (payload.count < 3) {
    return 'blue'; // 低量任务
  } else if (payload.count >= 10) {
    return 'red'; // 紧急状态（任务积压）
  } else if (payload.count >= 3) {
    return 'yellow'; // 警告状态
  }
  return 'green'; // 默认安全色
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

/**
 * 查询任务统计面板数据
 * 功能：获取并更新三类任务状态的数量统计
 * 流程：
 * 1. 并行请求三种任务类型数量：
 *    - 待领取任务数
 *    - 处理中任务数
 *    - 已完成任务数
 * 2. 更新统计面板显示数据
 * 3. 触发表格数据刷新
 *
 * 接口说明：
 * - getQualityPendingTasksCount：待领取任务计数
 * - getAllQcFormCount：处理中任务计数
 * - getAllFinishQcFormCount：已完成任务计数
 */
function queryStatisticsOfTheNumberOfClaimedItems() {
  // 并行发起三个统计接口请求
  const ob = Promise.all([
    getQualityPendingTasksCount({ checkType: checkedItem.value }),
    getAllQcFormCount({ checkType: checkedItem.value }),
    getAllFinishQcFormCount({ checkType: checkedItem.value }),
  ]);

  ob.then(([count1, count2, count3]) => {
    // 更新统计面板数据
    statisticsOfTheNumberOfClaimedItems.value[0]!.payload.count = count1; // 待领取
    statisticsOfTheNumberOfClaimedItems.value[1]!.payload.count = count2; // 处理中
    statisticsOfTheNumberOfClaimedItems.value[2]!.payload.count = count3; // 已完成

    query(); // 刷新主表格数据
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

/**
 * 查询数据
 */
function query() {
  gridApi.reload();
}

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
 * 分页查询质检任务数据
 * 功能：根据任务状态类型获取对应分页列表
 * 流程：
 * 1. 合并基础查询参数（工单/工序/位置）
 * 2. 根据当前选中状态类型切换数据源：
 *    - 待领取任务（1）
 *    - 处理中任务（2）
 *    - 已完成任务（3）
 * 3. 转换接口数据结构适配前端表格
 *
 * 接口说明：
 * - getQualityPendingTasks：待领取任务接口
 * - getAllQcForm：处理中任务接口
 * - getAllFinishQcForm：已完成任务接口
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    // 构造请求参数
    const params: any = {
      ...jobInformationQueryConditions.value,
      checkType: checkedItem.value, // 当前检查类型（首检/巡检/末检）
      pageSize, // 分页大小
      pageNum: page, // 当前页码
    };

    // 根据任务状态类型选择接口
    let ob: any;
    switch (checkedType.value) {
      case '1': {
        // 待领取任务
        ob = getQualityPendingTasks(params);
        break;
      }
      case '2': {
        // 处理中任务
        ob = getAllQcForm(params);
        break;
      }
      case '3': {
        // 已完成任务
        ob = getAllFinishQcForm(params);
        break;
      }
    }

    // 处理接口响应
    ob.then(({ total, list }: any) => {
      resolve({
        total, // 总记录数
        items: list, // 当前页数据
      });
    }).catch((error: any) => {
      _reject(error); // 异常传递
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

/**
 * 处理质检任务领取操作
 * 功能：执行任务领取的二次确认及后续操作
 * 流程：
 * 1. 弹出确认对话框进行领取确认
 * 2. 确认后调用任务领取接口
 * 3. 成功时：
 *    - 刷新顶部统计数据
 *    - 刷新统计面板数据
 *    - 重新加载表格数据
 * 4. 失败时显示具体错误信息
 *
 * @param row - 当前操作行数据，包含任务ID等必要字段
 *
 * 接口说明：
 * applyTask - 任务领取接口，接收任务ID(qcRecordId)和当前行数据
 */
function collect(row: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    title: '是否确认领取该任务?',

    onCancel() {
      message.warning('已取消!');
    },

    onOk() {
      applyTask({
        ...row,
        qcRecordId: row.id, // 将任务ID映射到接口需要的字段
      })
        .then(() => {
          message.success($t('common.successfulOperation'));
          itemInit(); // 刷新顶部检查类型计数
          queryStatisticsOfTheNumberOfClaimedItems(); // 更新统计面板
          gridApi.reload(); // 刷新任务列表
        })
        .catch((error) => {
          message.error($t('common.operationFailure'));
          message.error(error.msg); // 显示接口返回的具体错误
        });
    },
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
 * 打开质检任务填报抽屉
 * 功能：初始化并显示检验任务填报界面
 * 流程：
 * 1. 保存当前任务数据至编辑对象
 * 2. 控制抽屉组件显示状态
 * 3. 设置任务启动模式（开始/继续）
 *
 * @param row - 当前操作行数据，包含任务详情
 * @param isStart - 是否为启动模式：
 *   - true: 新任务启动
 *   - false: 继续现有任务
 */
function showEditFun(row: any, isStart = false) {
  editItem.value = row; // 存储当前任务数据
  showEdit.value = true; // 显示抽屉组件
  startStatus.value = isStart; // 设置任务启动状态标识
}

/**
 * 关闭任务填报抽屉
 * 功能：重置检验任务填报相关状态
 * 流程：
 * 1. 隐藏抽屉组件
 * 2. 清空当前编辑的任务数据
 * 3. 重置任务启动状态标识
 */
function close() {
  showEdit.value = false; // 控制抽屉关闭
  editItem.value = {}; // 清空当前编辑数据
  startStatus.value = false; // 重置启动状态
}

// endregion

// region 审核

/**
 * 处理质检任务审核操作
 * 功能：执行任务审核的二次确认及状态更新
 * 流程：
 * 1. 根据审核类型设置对话框标题和状态码
 *   - 通过：状态码2，标题"是否确认通过..."
 *   - 不通过：状态码3，标题"是否确认不通过..."
 * 2. 弹出确认对话框获取用户确认
 * 3. 确认后调用审核接口提交审核结果
 * 4. 成功时：
 *   - 刷新顶部检查类型计数
 *   - 更新统计面板数据
 *   - 重新加载任务列表
 *
 * @param row - 当前审核任务数据，包含任务ID等必要字段
 * @param isPass - 审核结果标识，true表示通过，false表示不通过
 *
 * 接口说明：
 * taskAudit - 任务审核接口，接收任务ID和审核类型参数
 */
function handleAudit(row: any, isPass: boolean) {
  const title = isPass ? '是否确认通过该条数据?' : '是否确认不通过该条数据?';
  const statusCode = isPass ? 2 : 3;

  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'primary',
    title,

    onOk() {
      taskAudit({
        id: row.id,
        auditType: statusCode,
      }).then(() => {
        message.success($t('common.successfulOperation'));
        itemInit(); // 刷新检查类型任务计数
        queryStatisticsOfTheNumberOfClaimedItems(); // 更新统计面板
        gridApi.reload(); // 刷新任务列表
      });
    },
  });
}

// endregion

onMounted(() => {
  itemInit();
});
</script>

<template>
  <Page id="page">
    <div class="mb-5 flex justify-center text-center">
      <BadgeRibbon
        :text="item.payload.count"
        :color="getColor(item.payload)"
        v-for="item of items"
        :key="item.value"
        @click="
          () => {
            checkedItem = item.value;
            queryStatisticsOfTheNumberOfClaimedItems();
          }
        "
      >
        <Card
          :title="item.payload.label"
          class="ml-8 w-48 cursor-pointer hover:bg-sky-500/20"
          :class="checkedItem === item.value ? 'bg-blue-500' : ''"
        />
      </BadgeRibbon>
    </div>
    <hr class="mb-2" />
    <div class="mb-4 flex">
      <span
        class="border-l-4 border-sky-500 pl-4 text-2xl font-black leading-[4rem]"
      >
        {{ $t('qualityInspection.toDoTask') }}
      </span>
      <div class="flex text-center">
        <BadgeRibbon
          :text="item.payload.count"
          :color="getColor(item.payload)"
          v-for="item of statisticsOfTheNumberOfClaimedItems"
          :key="item.value"
          @click="
            () => {
              checkedType = item.value;
              gridApi.reload();
            }
          "
        >
          <Card
            :title="item.payload.label"
            class="ml-8 w-36 cursor-pointer hover:bg-sky-500/20"
            :class="checkedType === item.value ? 'bg-blue-500' : ''"
          />
        </BadgeRibbon>
      </div>
    </div>
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

<style scoped lang="scss">
:deep(.bg-blue-500) {
  .ant-card-head-title {
    color: #fff;
  }
}
</style>
