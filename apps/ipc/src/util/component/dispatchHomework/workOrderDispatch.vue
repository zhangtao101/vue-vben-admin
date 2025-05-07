<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Button, Card, Form, FormItem, Input } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getLineProductCheck, searchProduceWorkSheetList } from '#/api';
import EquipmentResources from '#/util/component/equipmentResources.vue';

const props = defineProps({
  type: {
    type: Number,
    default: 1,
  },
});
// region 工作站查询信息

// 查询条件

const queryParams = ref<any>({
  planCode: '',
  workSheetCode: '',
  productName: '',
});

// endregion
// region 作业信息
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      type: 'radio',
      width: 50,
    },
    {
      field: 'planCode',
      title: '计划编号',
      minWidth: 200,
    },
    {
      field: 'workSheetCode',
      title: '工单编号',
      minWidth: 180,
    },
    {
      field: 'productCode',
      title: '产品编码',
      minWidth: 150,
    },
    {
      field: 'productName',
      title: '产品名称',
      minWidth: 150,
    },
    {
      field: 'produceWorkshop',
      title: '待派区域',
      minWidth: 120,
    },
    {
      field: 'customerName',
      title: '客户名称',
      minWidth: 120,
    },
    {
      field: 'workSheetPlanNumber',
      title: '工单计划数',
      minWidth: 120,
    },
    {
      field: 'planDateStart',
      title: '预计开始时间',
      minWidth: 120,
    },
    {
      field: '6',
      title: '预计结束时间',
      minWidth: 120,
    },
    {
      field: 'remark',
      title: '备注',
      minWidth: 120,
    },
  ],
  height: 400,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  radioConfig: {
    labelField: 'name',
    trigger: 'row',
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

// 当前选中表格行
const currentRow = ref<any>({});
// 表格事件
const gridEvents: any = {
  radioChange: ({ row }: any) => {
    currentRow.value = {
      ...row,
    };
    queryingDeviceInformation();
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// region 查询数据

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams.value };
    if (params.searchTime && params.searchTime.length === 2) {
      params.startTime = params.searchTime[0].format('YYYY-MM-DD');
      params.endTime = params.searchTime[1].format('YYYY-MM-DD');
      params.searchTime = undefined;
    }
    searchProduceWorkSheetList({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
      type: props.type,
    })
      .then(({ totalSize, list }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total: totalSize,
          items: list,
        });
      })
      .catch((error) => {
        reject(error);
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

// endregion

// region 资源指派
// 设备列表加载状态
const deviceListLoading = ref(false);
// 设备列表
const deviceList = ref<any>([]);
/**
 * 查询对应的设备信息
 */
function queryingDeviceInformation() {
  deviceListLoading.value = true;
  getLineProductCheck({
    worksheetCode: currentRow.value.id,
    type: currentRow.value.processType,
  })
    .then((data) => {
      deviceList.value = data;
    })
    .finally(() => {
      deviceListLoading.value = false;
    });
}

/**
 * 派工完成
 */
function completed() {
  gridApi.reload();
  deviceList.value = [];
  currentRow.value = {};
}

// endregion

// endregion
</script>

<template>
  <!-- region 工作站查询信息 -->
  <Card class="mb-5">
    <Form layout="inline" :model="queryParams">
      <!--计划编号 -->
      <FormItem :label="$t('dispatchHomework.planNumber')">
        <Input v-model:value="queryParams.planCode" />
      </FormItem>
      <!--工单编码 -->
      <FormItem :label="$t('dispatchHomework.workOrderCoding')">
        <Input v-model:value="queryParams.workSheetCode" />
      </FormItem>
      <!--产品名称 -->
      <FormItem :label="$t('dispatchHomework.productName')">
        <Input v-model:value="queryParams.productName" />
      </FormItem>
      <FormItem>
        <Button type="primary" @click="gridApi.reload()" class="mr-4">
          {{ $t('common.search') }}
        </Button>
        <Button @click="reload()">
          {{ $t('common.reset') }}
        </Button>
      </FormItem>
    </Form>
  </Card>
  <!-- endregion -->

  <!-- region 表格内容 -->
  <Card class="mb-5">
    <Grid>
      <template #toolbar-tools> </template>
    </Grid>
  </Card>
  <!-- endregion -->

  <!-- region 资源指派 -->
  <Card
    class="mb-5"
    :title="$t('dispatchHomework.resourceAssignment')"
    v-if="deviceList.length > 0"
  >
    <EquipmentResources
      :workstation-info="item"
      :work-order-id="`${currentRow.id}`"
      :is-active="currentRow.updateUsername === item.equipCode"
      v-for="item of deviceList"
      :key="item.equipCode"
      :show="true"
      @close="completed"
    />
  </Card>
  <!-- endregion -->
</template>

<style scoped></style>
