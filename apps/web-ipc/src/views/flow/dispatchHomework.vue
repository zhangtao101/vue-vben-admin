<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  message,
  Segmented,
} from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { debounce } from 'lodash-es';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import EquipmentResources from '#/util/component/equipmentResources.vue';

// region 工作站查询信息

// 查询条件
const queryParams = ref<any>({
  productionLineId: '',
  processId: '',
});

// endregion

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
      field: '1',
      type: 'radio',
      title: '计划编号',
      minWidth: 200,
    },
    {
      field: '2',
      title: '工单编号',
      minWidth: 200,
    },
    {
      field: '3',
      title: '产品编码',
      minWidth: 200,
    },
    {
      field: '4',
      title: '客户名称',
      minWidth: 200,
    },
    {
      field: '5',
      title: '预计开始时间',
      minWidth: 200,
    },
    {
      field: '6',
      title: '预计结束时间',
      minWidth: 200,
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

const gridEvents: any = {
  radioChange: ({ row }) => {
    message.info(`radioChange: ${row}`);
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// region 查询数据
// 查询参数
const jobInformationQueryConditions = ref({
  // 查询时间
  searchTime: [] as any,
  // 产品编码
  productCode: '',
  // 产品批号
  lineName: '',
});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params: any = { ...jobInformationQueryConditions.value };
    if (params.searchTime && params.searchTime.length === 2) {
      params.startTime = params.searchTime[0].format('YYYY-MM-DD');
      params.endTime = params.searchTime[1].format('YYYY-MM-DD');
      params.searchTime = undefined;
    }
    resolve({
      total: page * pageSize,
      items: [{}],
    });
    /* queryYXStopDayMXStatistics({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ statisticsDtos: { total, list }, ...p }) => {
        collect.value = p;
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total,
          items: list,
        });
      })
      .catch((error) => {
        reject(error);
      });*/
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

// endregion

// region 页面下发导航
const bottomNavigation = reactive([
  '工单派工',
  '工单改派',
  '工单拆合并',
  '流程卡打印',
]);
// 选中的导航
const checkedBottomNavigation = ref(bottomNavigation[0]);

// endregion
const elementWidth = ref(0);
onMounted(() => {
  elementWidth.value =
    (document.querySelector('#page') as any)?.offsetWidth || 0;
  window.addEventListener(
    'resize',
    debounce(() => {
      elementWidth.value =
        (document.querySelector('#page') as any)?.offsetWidth || 0;
    }, 500),
  );
});
</script>

<template>
  <Page id="page">
    <!-- region 工作站查询信息 -->
    <Card class="mb-5">
      <Form layout="inline" :model="queryParams">
        <!--计划编号 -->
        <FormItem :label="$t('dispatchHomework.planNumber')">
          <Input />
        </FormItem>
        <!--工单编码 -->
        <FormItem :label="$t('dispatchHomework.workOrderCoding')">
          <Input />
        </FormItem>
        <!--产品名称 -->
        <FormItem :label="$t('dispatchHomework.productName')">
          <Input />
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
    <Card class="mb-5" :title="$t('dispatchHomework.resourceAssignment')">
      <EquipmentResources />
    </Card>
    <!-- endregion -->
    <Segmented
      v-model:value="checkedBottomNavigation"
      block
      size="large"
      :options="bottomNavigation"
      class="fixed bottom-2 w-full pr-8 shadow-2xl"
      :style="{ width: `${elementWidth}px` }"
    />
  </Page>
</template>

<style scoped lang="scss"></style>
