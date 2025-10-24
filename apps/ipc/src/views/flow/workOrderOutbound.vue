<script lang="ts" setup>
import type { Rule } from 'ant-design-vue/es/form';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  obtainTheListOfOutgoingWorkOrders,
  reportToWorkAndLeaveTheStation,
  workstationListAcquisition,
} from '#/api';
import ScanTheCode from '#/util/component/scanTheCode.vue';

// region 作业信息
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
      field: 'worksheetCode',
      title: '工单编号',
      minWidth: 200,
    },
    {
      field: 'productCode',
      title: '产品编码',
      minWidth: 200,
    },
    {
      field: 'productName',
      title: '产品名称',
      minWidth: 200,
    },
    {
      field: 'equipName',
      title: '作业资源',
      minWidth: 200,
    },
    {
      field: 'planStartDate',
      title: '实际开始时间',
      minWidth: 200,
    },
    {
      field: 'worksheetPlanNumber',
      title: '计划数量',
      minWidth: 200,
    },
    {
      field: 'sendStateName',
      title: '工单状态',
      minWidth: 200,
    },
    {
      title: '操作',
      minWidth: 200,
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

const gridEvents: any = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });
// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 工作中心编号
  workstationCode: '',
  // 模式选择( 1手动  2自动)
  modelType: '1',
  // 产品编号
  productCode: '',
  // 工单号
  worksheetCode: '',
  // 工单派发状态
  sendState: '',
});

/**
 * 查询数据
 * 功能：获取出站工单列表数据并处理分页
 * 步骤：
 * 1. 合并查询参数
 * 2. 校验工作中心编号是否存在
 * 3. 存在时调用接口获取分页数据
 * 4. 处理接口返回数据适配前端表格
 * 5. 无工作中心时返回空数据集
 *
 * @param {object} params 分页参数
 * @param {number} params.page 当前页码
 * @param {number} params.pageSize 每页数据量
 * @returns {Promise} 返回处理后的分页数据Promise
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 合并查询参数
    const params: any = { ...queryParams.value };

    // 仅当工作中心编号存在时发起请求
    if (params.workstationCode) {
      obtainTheListOfOutgoingWorkOrders({
        ...params, // 保留原有查询条件
        pageNum: page, // 接口需要的页码参数
        pageSize, // 接口需要的每页数量
      })
        .then(({ total, list }) => {
          // 将接口数据转换为表格组件需要的格式
          resolve({
            total, // 总记录数
            items: list, // 当前页数据
          });
        })
        .catch((error) => {
          reject(error); // 错误处理
        });
    } else {
      // 无工作中心时返回空数据集
      resolve({
        total: 0,
        items: [],
      });
    }
  });
}

// endregion

// region 报工信息
const reportForWorkGridOptions: VxeGridProps<any> = {
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
      field: 'processName',
      title: '工序名称',
      minWidth: 200,
    },
    {
      field: 'qualityNumber',
      title: '良品数量',
      minWidth: 100,
    },
    {
      field: 'unqualityNumber',
      title: '不良数量',
      minWidth: 100,
    },
    {
      field: 'personTime',
      title: '人时',
      minWidth: 100,
    },
    {
      field: 'equipTime',
      title: '机时',
      minWidth: 100,
    },
  ],
  data: [],
  height: 300,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  pagerConfig: {
    enabled: false,
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const [ReportForGrid, reportForgridApi] = useVbenVxeGrid({
  gridOptions: reportForWorkGridOptions,
});
// endregion

// region 下线
// 下线抽屉是否显示
const downlineDrawer = ref(false);
// 操作类型：2-完工出站，3-强制下线 4-暂停报工
const reportingTypeOfWork = ref(1);
// 选中行数据
const editItem = ref<any>({});
// 编辑的form表单数据
const formData = ref({
  qualityNumber: 0,
  unqualityNumber: 0,
  personTime: 0,
  equipTime: 0,
});
// 抽屉标题
const title = ref('');

/**
 * 显示下线抽屉
 * @param row 当前行数据
 * @param type 操作类型：2-完工出站，3-强制下线 4-暂停报工
 */
function show(row: any, type: number) {
  reportingTypeOfWork.value = type;
  editItem.value = row;
  downlineDrawer.value = true;
  setTimeout(() => {
    reportForgridApi.grid.loadData(row.reports);
  }, 200);
  switch (type) {
    case 2: {
      title.value = $t('workOrderEntry.outbound');
      break;
    }
    case 3: {
      title.value = $t('workOrderEntry.downline');
      break;
    }
    case 4: {
      title.value = $t('workOrderEntry.suspendWorkReporting');
      break;
    }
  }
}

/**
 * 关闭下线抽屉
 */
function close() {
  downlineDrawer.value = false;
  reportingTypeOfWork.value = -1;
  editItem.value = {};
  formData.value = {
    qualityNumber: 0,
    unqualityNumber: 0,
    personTime: 0,
    equipTime: 0,
  };
}

/**
 * 数值验证器
 * 功能：验证输入值是否为有效数字且非负数
 * @param _rule 表单验证规则对象（未使用）
 * @param value 待验证的数值
 * @returns 验证结果 Promise
 *
 * 验证逻辑：
 * 1. 检查是否为数字类型且非NaN
 * 2. 检查数值是否大于等于0
 */
function valueValidator(_rule: Rule, value: number) {
  // 类型检查：排除非数字类型和NaN值
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return Promise.reject(new Error('该项必须是数字'));
  }
  // 范围检查：必须为非负数
  return value >= 0
    ? Promise.resolve() // 验证通过
    : Promise.reject(new Error('该项为必填项')); // 验证失败
}

const formRef = ref();
/**
 * 提交表单数据
 * 功能：验证并提交工单出站/下线操作
 * 步骤：
 * 1. 执行表单验证
 * 2. 组装提交参数（包含表单数据、操作类型和工单ID）
 * 3. 调用工作站操作接口
 * 4. 处理操作成功后的界面反馈
 */
function submit() {
  // 执行Ant Design表单验证
  formRef.value.validate().then(() => {
    // 组装提交参数
    const params = {
      ...formData.value, // 表单数据（良品数、不良数等）
      opType: reportingTypeOfWork.value, // 操作类型：2-完工出站，3-强制下线 4-暂停报工
      id: editItem.value.id, // 当前工单ID
    };

    // 调用工作站操作接口
    reportToWorkAndLeaveTheStation(params).then(() => {
      // 显示操作成功提示
      message.success($t('common.successfulOperation'));
      // 关闭抽屉弹窗
      close();
      // 刷新表格数据
      gridApi.reload();
    });
  });
}

// endregion

// region 工作中心查询
const listOfProductionLines = ref<any>([]);

/**
 * 查询工作站列表
 * 功能：获取工作站列表并格式化为选择器选项
 * 步骤：
 * 1. 调用工作站列表接口获取原始数据
 * 2. 清空现有工作站列表
 * 3. 遍历接口返回数据，格式化为选择器需要的{value, label}格式
 * 4. 将格式化后的数据存入响应式列表
 */
function queryListOfProductionLines() {
  workstationListAcquisition().then((data) => {
    listOfProductionLines.value = []; // 清空当前列表
    data.forEach((item: any) => {
      // 构造选择器选项对象
      listOfProductionLines.value.push({
        value: item.workstationCode, // 选项值使用工作站编码
        label: `${item.workstationName}__${item.workstationCode}`, // 显示名称拼接名称和编码
      });
    });
  });
}
const filterOption = (input: string, option: any) => {
  return `${option.value}&&${option.label}`
    .toLowerCase()
    .includes(input.toLowerCase());
};

// endregion
onMounted(() => {
  queryListOfProductionLines();
});
</script>

<template>
  <Page id="page">
    <Card class="mb-4">
      <Form layout="inline" :model="queryParams">
        <!--工作中心 -->
        <FormItem :label="$t('workOrderEntry.workCenter')" class="!mb-4 w-full">
          <Select
            v-model:value="queryParams.workstationCode"
            :options="listOfProductionLines"
            :filter-option="filterOption"
            show-search
            class="mr-4 !w-[80%]"
            @change="() => gridApi.reload()"
          />
          <ScanTheCode
            @scan-the-code="
              (val) => {
                queryParams.workstationCode = val;
                gridApi.reload();
              }
            "
          />
        </FormItem>
        <!--工单编号 -->
        <FormItem :label="$t('workOrderEntry.workOrderNumber')">
          <Input v-model:value="queryParams.worksheetCode" />
        </FormItem>
        <!--产品编号 -->
        <FormItem :label="$t('workOrderEntry.productCode')">
          <Input v-model:value="queryParams.productCode" />
        </FormItem>
        <FormItem>
          <Button type="primary" @click="gridApi.reload()" class="mr-4">
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- region 表格内容 -->
    <Card class="mb-5">
      <Grid class="mt-4">
        <template #toolbar-tools> </template>
        <template #action="{ row }">
          <!-- 出站 ="{ row }"-->
          <Tooltip>
            <template #title>{{ $t('workOrderEntry.outbound') }}</template>
            <Button
              type="link"
              :icon="
                h(Icon, {
                  icon: 'mdi:output',
                  class: 'inline-block text-2xl',
                })
              "
              @click="show(row, 2)"
            />
          </Tooltip>
          <!-- 暂停报工-->
          <Tooltip>
            <template #title>
              {{ $t('workOrderEntry.suspendWorkReporting') }}
            </template>
            <Button
              type="link"
              :icon="
                h(Icon, {
                  icon: 'mdi-light:pause',
                  class: 'inline-block text-2xl',
                })
              "
              @click="show(row, 4)"
            />
          </Tooltip>
          <!-- 下线 -->
          <Tooltip>
            <template #title>{{ $t('workOrderEntry.downline') }}</template>
            <Button
              danger
              type="link"
              :icon="
                h(Icon, {
                  icon: 'mdi:cloud-download-outline',
                  class: 'inline-block text-2xl',
                })
              "
              @click="show(row, 3)"
            />
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <Drawer
      :title="title"
      v-model:open="downlineDrawer"
      placement="right"
      :width="800"
      :footer-style="{ textAlign: 'right' }"
      @close="close"
    >
      <span class="border-l-4 border-sky-500 pl-4 text-2xl font-black">
        {{ $t('workOrderEntry.workOrderInformation') }}
      </span>
      <Descriptions bordered :column="2" class="mb-4 mt-4">
        <!-- 工单编号 -->
        <DescriptionsItem :label="$t('workOrderEntry.workOrderNumber')">
          {{ editItem.worksheetCode }}
        </DescriptionsItem>
        <!-- 产品名称 -->
        <DescriptionsItem :label="$t('workOrderEntry.productName')">
          {{ editItem.productName }}
        </DescriptionsItem>
        <!-- 作业资源 -->
        <DescriptionsItem :label="$t('workOrderEntry.workArea')">
          {{ editItem.equipName }}
        </DescriptionsItem>
        <!-- 计划数量 -->
        <DescriptionsItem :label="$t('workOrderEntry.plannedQuantity')">
          {{ editItem.worksheetPlanNumber }}
        </DescriptionsItem>
        <!-- 工单状态 -->
        <DescriptionsItem :label="$t('workOrderEntry.workOrderStatus')">
          {{ editItem.sendStateName }}
        </DescriptionsItem>
      </Descriptions>

      <span
        class="border-l-4 border-sky-500 pl-4 text-2xl font-black"
        v-if="editItem.reports && editItem.reports.length > 0"
      >
        {{ $t('workOrderEntry.detailsOfProcessReporting') }}
      </span>
      <ReportForGrid
        v-if="editItem.reports && editItem.reports.length > 0"
        class="!h-auto"
      />
      <span class="border-l-4 border-sky-500 pl-4 text-2xl font-black">
        {{ $t('workOrderEntry.workReportingInformation') }}
      </span>
      <Form
        :model="formData"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        layout="inline"
        name="editMessageForm"
        ref="formRef"
      >
        <!-- 良品数 -->
        <FormItem
          :label="$t('workOrderEntry.numberOfGoodProducts')"
          :rules="{
            required: true,
            message: '该项为必填项',
            validator: valueValidator,
          }"
          name="qualityNumber"
          class="mb-4 mt-4 w-[40%]"
        >
          <InputNumber v-model:value="formData.qualityNumber" :min="0" />
        </FormItem>
        <!-- 不良数 -->
        <FormItem
          :label="$t('workOrderEntry.badNumber')"
          :rules="{
            required: true,
            message: '该项为必填项',
            validator: valueValidator,
          }"
          name="unqualityNumber"
          class="mb-4 mt-4 w-[40%]"
        >
          <InputNumber v-model:value="formData.unqualityNumber" :min="0" />
        </FormItem>
        <!-- 人时 -->
        <FormItem
          :label="$t('workOrderEntry.whenPeopleArePresent')"
          :rules="{
            required: true,
            message: '该项为必填项',
            validator: valueValidator,
          }"
          name="personTime"
          class="mb-4 mt-4 w-[40%]"
        >
          <InputNumber v-model:value="formData.personTime" :min="0" />
        </FormItem>
        <!-- 机时 -->
        <FormItem
          :label="$t('workOrderEntry.whenTheMachineIsAvailable')"
          :rules="{
            required: true,
            message: '该项为必填项',
            validator: valueValidator,
          }"
          name="equipTime"
          class="mb-4 mt-4 w-[40%]"
        >
          <InputNumber v-model:value="formData.equipTime" :min="0" />
        </FormItem>
      </Form>
      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="close">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="submit()">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped lang="scss"></style>
