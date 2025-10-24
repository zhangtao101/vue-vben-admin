<script setup lang="ts">
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  message,
  RangePicker,
  Select,
  Textarea,
  Tooltip,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  listDataCatchDetail,
  listDataCatchEquip,
  listEquipCatchData,
  worksheetDatacatchBinding,
} from '#/api';

/**
 * 是否显示抽屉
 */
const showDrawer = ref(false);
/**
 * 编辑的项
 */
const editItem = ref<any>({});
/**
 * 显示抽屉
 * @param row
 */
function show(row: any) {
  editItem.value = row;
  showDrawer.value = true;
  queryDevices();
  setTimeout(() => {
    reload();
  }, 200);
}

/**
 * 关闭抽屉
 */
function close() {
  showDrawer.value = false;
  editItem.value = {};
}

// region 暴露方法，供父组件调用
defineExpose({
  show,
});
// endregion

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'worksheetCode', title: '工单号', minWidth: 180 },
    { field: 'equipCode', title: '设备号', minWidth: 100 },
    { field: 'address', title: '设备ID', minWidth: 100 },
    { field: 'startTime', title: '开始时间', minWidth: 150 },
    { field: 'endTime', title: '结束时间', minWidth: 150 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 150,
    },
  ],
  height: 500,
  showOverflow: true,
  showHeaderOverflow: true,
  showFooterOverflow: true,
  virtualYConfig: {
    enabled: true,
    gt: 0,
  },
  virtualXConfig: {
    enabled: true,
    gt: 0,
  },
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

function reload() {
  gridApi.reload();
}

function queryData(_data: any) {
  return new Promise((resolve, reject) => {
    listDataCatchDetail({
      worksheetCode: editItem.value.worksheetCode,
    })
      .then((data: any) => {
        // 将接口返回的数据适配到表格所需的格式
        resolve({
          total: data.length, // 总数据量
          items: data, // 当前页数据
        });
      })
      .catch((error: any) => {
        // 捕获接口调用错误并拒绝 Promise
        reject(error);
      });
  });
}

// endregion

// region 抽屉操作
// 表单引用
const formRef = ref<any>(null);
// 表单数据
const formState = ref<any>({});
// 提交状态
const submitLoading = ref(false);

/**
 * 提交绑定
 */
function submit() {
  formRef.value.validate().then(() => {
    submitLoading.value = true;
    const params = {
      ...formState.value,
    };
    if (params.dateTime && params.dateTime.length === 2) {
      params.startTime = params.dateTime[0].format('YYYY-MM-DD HH:mm:ss');
      params.endTime = params.dateTime[1].format('YYYY-MM-DD HH:mm:ss');
    }
    if (params.equipCodeAndAddress) {
      const arr = params.equipCodeAndAddress.split('&&');
      params.equipCode = arr[0];
      params.address = arr[1];
    }
    params.worksheetCode = editItem.value.worksheetCode;
    worksheetDatacatchBinding(params)
      .then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
        formRef.value.resetFields();
      })
      .finally(() => {
        submitLoading.value = false;
      });
  });
}

function edit(row: any) {
  const params = {
    ...row,
  };

  params.equipCodeAndAddress = `${row.equipCode}&&${row.address}`;
  params.dateTime = [dayjs(row.startTime), dayjs(row.endTime)];

  formState.value = params;
}

// 设备列表
const devices = ref<any>([]);

function queryDevices() {
  listDataCatchEquip({
    equipCode: editItem.value.workstationCode,
  }).then((data: any) => {
    devices.value = [];
    data.forEach((device: any) => {
      devices.value.push({
        label: device.equipmentName,
        value: `${device.equipmentCode}&&${device.id}`,
      });
    });
  });
}

// endregion

// region 显示参数绑定

const showDetails = ref(false);
const equipMessage = ref<any>({});

let Details: any = null;

function displayParameterBinding(row: any) {
  listEquipCatchData({
    bindingDetailId: row.id,
    pageNum: 1,
    pageSize: 20,
  }).then(({ paramNames, ...equip }: any) => {
    showDetails.value = true;
    equipMessage.value = equip;
    const columns: any = [{ title: '序号', type: 'seq', width: 50 }];
    paramNames.forEach((paramName: string) => {
      columns.push({
        field: paramName,
        title: paramName,
        minWidth: 120,
      });
    });
    // gridApi 为表格的方法
    [Details] = useVbenVxeGrid({
      gridOptions: {
        align: 'center',
        border: true,
        columns,
        height: 500,
        stripe: true,
        sortConfig: {
          multiple: true,
        },
        pagerConfig: {
          enabled: true,
        },
        proxyConfig: {
          ajax: {
            query: async ({ page }: any) => {
              return await queryDetailsTableData(
                {
                  page: page.currentPage,
                  pageSize: page.pageSize,
                },
                row.id,
              );
            },
          },
        },
      },
    });
  });
}

/**
 * 查询参数绑定详情
 * @param page
 * @param pageSize
 */
function queryDetailsTableData({ page, pageSize }: any, rowId: any) {
  return new Promise((resolve, reject) => {
    listEquipCatchData({
      bindingDetailId: rowId,
      pageSize,
      pageNum: page,
    })
      .then(({ dataList, total }: any) => {
        // 将接口返回的数据适配到表格所需的格式
        resolve({
          total, // 总数据量
          items: dataList, // 当前页数据
        });
      })
      .catch((error: any) => {
        // 捕获接口调用错误并拒绝 Promise
        reject(error);
      });
  });
}

function detailsClose() {
  showDetails.value = false;
}

// endregion
</script>

<template>
  <Drawer
    v-model:open="showDrawer"
    :footer-style="{ textAlign: 'right' }"
    width="600"
    placement="right"
    :title="$t('workOrderParams.parameterBinding')"
    @close="close"
  >
    <Form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 24 }"
    >
      <!-- 设备编号 -->
      <FormItem
        :rules="{
          required: true,
          message: '该项为必填项',
        }"
        name="equipCodeAndAddress"
        :label="$t('workOrderParams.equipmentNumber')"
      >
        <Select
          v-model:value="formState.equipCodeAndAddress"
          :options="devices"
          class="w-full"
        />
      </FormItem>
      <!-- 工单经过时间 -->
      <FormItem
        :rules="{
          required: true,
          message: '该项为必填项',
        }"
        name="dateTime"
        :label="$t('workOrderParams.theTimeElapsedForTheWorkOrder')"
      >
        <RangePicker
          v-model:value="formState.dateTime"
          :show-time="{ format: 'HH:mm' }"
        />
      </FormItem>
      <!-- 备注 -->
      <FormItem
        :rules="{
          required: false,
          message: '该项为必填项',
        }"
        name="remark"
        :label="$t('workOrderParams.remark')"
      >
        <Textarea v-model:value="formState.remark" />
      </FormItem>
      <FormItem :wrapper-col="{ offset: 6, span: 24 }">
        <Button
          type="primary"
          @click="submit"
          :loading="submitLoading"
          class="w-full"
        >
          {{ $t('common.submit') }}
        </Button>
      </FormItem>
    </Form>

    <Grid>
      <template #action="{ row }">
        <!-- 编辑 -->
        <Tooltip>
          <template #title>
            {{ $t('common.edit') }}
          </template>
          <Button type="link" @click="edit(row)">
            <Icon
              icon="mdi:square-edit-outline"
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </Tooltip>
        <!-- 查看 -->
        <Tooltip>
          <template #title>
            {{ $t('common.view') }}
          </template>
          <Button type="link" @click="displayParameterBinding(row)">
            <Icon icon="mdi:eye" class="inline-block align-middle text-2xl" />
          </Button>
        </Tooltip>
      </template>
    </Grid>
  </Drawer>

  <Drawer
    v-model:open="showDetails"
    :footer-style="{ textAlign: 'right' }"
    height="70%"
    placement="top"
    :title="`${$t('workOrderParams.parameterBinding')}___${equipMessage.equipName}(${equipMessage.equipCode})`"
    @close="detailsClose"
  >
    <Descriptions bordered class="mb-4">
      <DescriptionsItem :label="$t('workOrderParams.equipmentName')">
        {{ equipMessage.equipName }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('workOrderParams.equipmentCode')">
        {{ equipMessage.equipCode }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('workOrderParams.worksheetCode')">
        {{ editItem.worksheetCode }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('workOrderParams.workstationCode')">
        {{ editItem.workstationCode }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('workOrderParams.productCode')">
        {{ editItem.productCode }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('workOrderParams.productName')">
        {{ editItem.productName }}
      </DescriptionsItem>
    </Descriptions>
    <Details />
  </Drawer>
</template>

<style scoped></style>
