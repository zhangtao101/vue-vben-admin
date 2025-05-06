<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';

import { MdiEditOutline, MdiEyeOutline } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { processReporting, processReportingInformationQuery } from '#/api';

const props = defineProps({
  // 工步id
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心
  workstationCode: {
    type: String,
    default: '',
  },
});

/**
 * 获取标签的class
 */
function getLabelClass() {
  return 'mr-4 inline-block w-48 border p-2 text-center';
}

/**
 * 获取值的class
 */
function getValueClass() {
  return 'inline-block w-64 border p-2 text-center';
}

// region 数据查询
// 查询条件
// const queryParams = ref<any>({});

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'productSnCode',
      title: '产品SN',
      minWidth: 120,
    },
    {
      field: 'materialName',
      title: '产品名称',
      minWidth: 220,
    },
    { field: 'reportNumber', title: '重量(KG)', minWidth: 150 },
    { field: 'equipCode', title: '称重设备', minWidth: 250 },
    { field: 'reportUser', title: '报工人', minWidth: 250 },
    { field: 'reportTime', title: '报工时间', minWidth: 250 },
    { field: 'createTime', title: '创建时间', minWidth: 250 },
    {
      field: 'unit2',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 150,
    },
  ],
  minHeight: 300,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryData();
      },
    },
  },
  scrollY: {
    enabled: true,
    gt: 30,
  },
  scrollX: {
    enabled: true,
    gt: 0,
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

const details = ref<any>({});
/**
 * 查询物料列表
 */
function queryData() {
  return new Promise((resolve, _reject) => {
    processReportingInformationQuery({
      workstationCode: props.workstationCode,
      equipCode: props.equipCode,
      worksheetCode: props.worksheetCode,
      bindingId: props.bindingId,
      functionId: props.functionId,
    })
      .then(({ snList, ...p }: any) => {
        details.value = p;
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total: snList.length,
          items: snList,
        });
      })
      .catch(() => {
        resolve({
          total: 0,
          items: [],
        });
      });
  });
}

// region 编辑
// 显示抽屉
const show = ref<boolean>(false);
// 编辑对象
const editItem = ref<any>({});
// 编辑对象
const editForm = ref<any>();
// 是否只读
const isReadonly = ref(false);
// form表单规则验证
const editRules = ref<any>({
  isEnable: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  perName_workNumber: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  userName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
});

function showDrawer(row?: any, readonly?: boolean) {
  show.value = true;
  editItem.value = row
    ? { ...row }
    : {
        worksheetCode: details.value.currentJobId,
        materialCode: details.value.productName,
      };
  isReadonly.value = !!readonly;
}

/**
 * 关闭抽屉
 */
function close() {
  show.value = false;
  editItem.value = {};
  editForm.value?.ressetFields();
}

/**
 * 提交
 */
function submit() {
  editForm.value.validate().then(() => {
    const params = {
      ...editItem.value,
      bindingId: props.bindingId,
    };
    processReporting(params).then(() => {
      gridApi.reload();
      message.success($t('common.successfulOperation'));
      close();
    });
  });
}

// endregion

// endregion
onMounted(() => {
  gridApi.reload();
});
</script>

<template>
  <div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 工单编号 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.workOrderNumber') }}
      </span>
      <span :class="getValueClass()">
        {{ details.currentJobId }}
      </span>
    </div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 产品名称 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.productName') }}
      </span>
      <span :class="getValueClass()">
        {{ details.productName }}
      </span>
    </div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 累计数量 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.cumulativeQuantity') }}
      </span>
      <span :class="getValueClass()">
        {{ details.totalReportNumber || 0 }}
      </span>
    </div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 累计重量 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.accumulatedWeight') }}
      </span>
      <span :class="getValueClass()">
        {{ details.totalReportWeight || 0 }}
      </span>
    </div>
  </div>
  <Grid>
    <template #toolbar-tools>
      <!-- 新增按钮 -->
      <Button type="primary" @click="showDrawer()">
        {{ $t('common.add') }}
      </Button>
    </template>
    <template #action="{ row }">
      <!-- 编辑按钮 ="{ row }" -->
      <Tooltip>
        <template #title>
          {{ $t('common.edit') }}
        </template>
        <Button
          :icon="h(MdiEditOutline, { class: 'inline-block size-6' })"
          class="mr-4"
          type="link"
          @click="showDrawer(row)"
        />
        <!--        @click="editRow(row, true)"-->
      </Tooltip>
      <!-- 查看按钮 -->
      <Tooltip>
        <template #title>{{ $t('common.view') }}</template>
        <Button
          :icon="h(MdiEyeOutline, { class: 'inline-block size-6' })"
          class="mr-4"
          type="link"
          @click="showDrawer(row, true)"
        />
      </Tooltip>
    </template>
  </Grid>

  <Drawer
    :title="$t('andon.onLightCall')"
    v-model:open="show"
    placement="right"
    :width="500"
    :footer-style="{ textAlign: 'right' }"
    @close="close"
  >
    <Form
      ref="editForm"
      :label-col="{ span: 8 }"
      :model="editItem"
      :rules="editRules"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <!-- 工单号 -->
      <FormItem
        :label="$t('productionOperation.workOrderNumber')"
        name="worksheetCode"
      >
        <Input v-model:value="editItem.worksheetCode" disabled />
      </FormItem>
      <!-- 产品编号 -->
      <FormItem
        :label="$t('productionOperation.productNumber')"
        name="materialCode"
      >
        <Input v-model:value="editItem.materialCode" disabled />
      </FormItem>
      <!-- SN码 -->
      <FormItem :label="$t('productionOperation.snCode')" name="productSnCode">
        <Input v-model:value="editItem.productSnCode" :disabled="isReadonly" />
      </FormItem>
      <!-- 重量（报工数） -->
      <FormItem :label="$t('productionOperation.weight')" name="reportNumber">
        <Input v-model:value="editItem.reportNumber" :disabled="isReadonly" />
      </FormItem>
      <!-- 设备号（称量设备） -->
      <FormItem
        :label="$t('productionOperation.equipmentNumber')"
        name="equipCode"
      >
        <Input v-model:value="editItem.equipCode" :disabled="isReadonly" />
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <!-- 取消 -->
        <Button @click="close">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认  -->
        <Button type="primary" @click="submit()">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped></style>
