<script lang="ts" setup>
import type { Rule } from 'ant-design-vue/es/form';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
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
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams.value };
    if (params.workstationCode) {
      obtainTheListOfOutgoingWorkOrders({
        ...params, // 展开 queryParams.value 对象，包含所有查询参数。
        pageNum: page, // 当前页码。
        pageSize, // 每页显示的数据条数。
      })
        .then(({ total, list }) => {
          // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
          resolve({
            total,
            items: list,
          });
        })
        .catch((error) => {
          reject(error);
        });
    } else {
      resolve({
        total: 0,
        items: [],
      });
    }
  });
}

// endregion

// region 下线
// 下线抽屉是否显示
const downlineDrawer = ref(false);
// 是否为完工出站
const isCompleted = ref(false);
// 选中行数据
const editItem = ref<any>({});
// 编辑的form表单数据
const formData = ref({
  qualityNumber: 0,
  unqualityNumber: 0,
  personTime: 0,
  equipTime: 0,
});

/**
 * 显示下线抽屉
 * @param row 当前行数据
 * @param completed 是否为完工出站
 */
function show(row: any, completed: boolean) {
  isCompleted.value = completed;
  editItem.value = row;
  downlineDrawer.value = true;
}

/**
 * 关闭下线抽屉
 */
function close() {
  downlineDrawer.value = false;
  editItem.value = {};
  formData.value = {
    qualityNumber: 0,
    unqualityNumber: 0,
    personTime: 0,
    equipTime: 0,
  };
}

function valueValidator(_rule: Rule, value: number) {
  // 检查是否为数字
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return Promise.reject(new Error('该项必须是数字'));
  }
  return value >= 0
    ? Promise.resolve()
    : Promise.reject(new Error('该项为必填项'));
}

const formRef = ref();
function submit() {
  formRef.value.validate().then(() => {
    const params = {
      ...formData.value,
      opType: isCompleted.value ? 2 : 3,
      id: editItem.value.id,
    };
    reportToWorkAndLeaveTheStation(params).then(() => {
      message.success($t('common.successfulOperation'));
      close();
      gridApi.reload();
    });
  });
}
// endregion

// region 工作中心查询
const listOfProductionLines = ref<any>([]);

/**
 * 查询工作站列表
 */
function queryListOfProductionLines() {
  workstationListAcquisition().then((data) => {
    listOfProductionLines.value = [];
    data.forEach((item: any) => {
      listOfProductionLines.value.push({
        value: item.workstationCode,
        label: `${item.workstationName}__${item.workstationCode}`,
      });
    });
  });
}
const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
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
            class="mr-4 !w-full"
            @change="() => gridApi.reload()"
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
                h(IconifyIcon, {
                  icon: 'mdi:output',
                  class: 'inline-block text-2xl',
                })
              "
              @click="show(row, true)"
            />
          </Tooltip>
          <!-- 下线 -->
          <Tooltip>
            <template #title>{{ $t('workOrderEntry.downline') }}</template>
            <Button
              danger
              type="link"
              :icon="
                h(IconifyIcon, {
                  icon: 'mdi:cloud-download-outline',
                  class: 'inline-block text-2xl',
                })
              "
              @click="show(row, false)"
            />
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <Drawer
      :title="
        isCompleted
          ? $t('workOrderEntry.outbound')
          : $t('workOrderEntry.downline')
      "
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
