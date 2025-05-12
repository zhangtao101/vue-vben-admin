<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Button, Card, Form, FormItem, Input, Spin } from 'ant-design-vue';

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
 * 这个函数用于：
 * 1. 构建包含时间查询参数的请求对象
 * 2. 调用生产工单列表接口获取分页数据
 * 3. 格式化返回数据适配vxe-table组件
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams.value };
    searchProduceWorkSheetList({
      ...params, // 合并所有查询条件
      pageNum: page, // 当前页码(从1开始)
      pageSize, // 每页数据条数
      type: props.type, // 组件传入的业务类型
    })
      .then(({ totalSize, list }) => {
        // 将接口返回数据转换为vxe-table要求的格式
        resolve({
          total: totalSize, // 总数据条数
          items: list, // 当前页数据列表
        });
      })
      .catch((error) => {
        reject(error); // 将错误传递给表格组件处理
      });
  });
}

/**
 * 重置查询条件
 * 1. 清空所有查询参数
 * 2. 触发表格数据重新加载
 * 3. 用于重置按钮点击后的清理操作
 */
function reload() {
  queryParams.value = {}; // 重置查询参数对象
  gridApi.reload(); // 调用表格API重新加载数据
}

// endregion

// region 资源指派
// 设备列表加载状态
const deviceListLoading = ref(false);
// 设备列表
const deviceList = ref<any>([]);
/**
 * 查询设备信息
 * @description
 * - 该函数用于根据当前选中的工单号和工艺类型查询设备信息。
 * - 在查询过程中，会显示加载状态，并在查询完成后更新设备列表。
 */
function queryingDeviceInformation() {
  // 设置加载状态为 true，表示正在查询设备信息
  deviceListLoading.value = true;

  // 调用 getLineProductCheck 函数查询设备信息
  // 传入当前选中的工单号（currentRow.value.id）和工艺类型（currentRow.value.processType）
  getLineProductCheck({
    worksheetCode: currentRow.value.id, // 当前选中的工单号
    type: currentRow.value.processType, // 当前选中的工艺类型
  })
    .then((data) => {
      // 查询成功后，将返回的设备信息存储到 deviceList 中
      deviceList.value = data;
    })
    .finally(() => {
      // 无论查询成功或失败，都设置加载状态为 false
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
  <Spin :spinning="deviceListLoading">
    <Card
      class="mb-5 min-h-40"
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
  </Spin>
  <!-- endregion -->
</template>

<style scoped></style>
