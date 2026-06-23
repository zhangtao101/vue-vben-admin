<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  Radio,
  RadioGroup,
  RangePicker,
  Select,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getErrorName,
  getExcelPathEnergyConsumption,
  getWorkstationName,
  viewTheDetailsOfEnergyConsumptionCollection,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      title: $t('page.common.serialNumber'),
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    { field: 'workSheetCode', title: $t('energyConsumption.energyConsumptionCollectionDetails.workSheetCode'), minWidth: 200 },
    { field: 'productCode', title: $t('energyConsumption.energyConsumptionCollectionDetails.productCode'), minWidth: 200 },
    { field: 'productName', title: $t('energyConsumption.energyConsumptionCollectionDetails.productName'), minWidth: 200 },
    { field: 'catchCode', title: $t('energyConsumption.energyConsumptionCollectionDetails.taskCatchCode'), minWidth: 250 },
    { field: 'workstationName', title: $t('energyConsumption.energyConsumptionCollectionDetails.workstationName'), minWidth: 250 },
    { field: 'type', title: $t('energyConsumption.energyConsumptionCollectionDetails.collectionMode'), minWidth: 200 },
    { field: 'energyEquipCode', title: $t('energyConsumption.energyConsumptionCollectionDetails.collectTheInstrumentNumber'), minWidth: 200 },
    {
      field: 'energyEquipName',
      title: $t('energyConsumption.energyConsumptionCollectionDetails.collectTheInstrumentName'),
      minWidth: 200,
    },
    {
      field: 'startTime',
      title: $t('energyConsumption.energyConsumptionCollectionDetails.collectionStartTime'),
      minWidth: 200,
    },
    {
      field: 'startValue',
      title: $t('energyConsumption.energyConsumptionCollectionDetails.startReadingCollection'),
      minWidth: 200,
    },
    {
      field: 'endTime',
      title: $t('energyConsumption.energyConsumptionCollectionDetails.collectionEndTime'),
      minWidth: 200,
    },
    {
      field: 'endValue',
      title: $t('energyConsumption.energyConsumptionCollectionDetails.readingAtTheEndOfCollection'),
      minWidth: 200,
    },
    {
      field: 'energyValue',
      title: $t('energyConsumption.energyConsumptionCollectionDetails.collectTheTotalEnergyConsumption'),
      minWidth: 200,
    },
    {
      field: 'catchUser',
      title: $t('energyConsumption.energyConsumptionCollectionDetails.catchUser'),
      minWidth: 200,
    },
    {
      field: 'errorName',
      title: $t('energyConsumption.energyConsumptionCollectionDetails.exceptionType'),
      minWidth: 200,
    },
    {
      field: 'opType',
      title: $t('energyConsumption.energyConsumptionCollectionDetails.operationType'),
      minWidth: 200,
      slots: {
        default: 'opType',
      },
    },
    {
      field: 'reason',
      title: $t('energyConsumption.energyConsumptionCollectionDetails.reason'),
      minWidth: 200,
    },
    {
      field: 'remark',
      title: $t('energyConsumption.energyConsumptionCollectionDetails.remark'),
      minWidth: 200,
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

/**
 * 获取物料类型的中文描述
 * @param state 物料类型编码编码
 */
function getMaterialTypeText(state: number) {
  switch (state) {
    case 1: {
      return $t('energyConsumption.energyConsumptionCollectionDetails.rawMaterial');
    }
    case 2: {
      return $t('energyConsumption.energyConsumptionCollectionDetails.brick');
    }
    default: {
      return $t('energyConsumption.energyConsumptionStatistics.undefinedType');
    }
  }
}

// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  searchTime: [] as any,
  worksheetCode: '',
  collectionType: '',
  errorName: '',
  opType: '',
  // 工作站名称
  workstationName: '',
});

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
    viewTheDetailsOfEnergyConsumptionCollection({
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
  });
}

// endregion

// region 工作站列表
const listOfWorkstations = ref<any>([]);

/**
 * 查询工作站列表
 */
function queryTheWorkstationList() {
  getWorkstationName().then((list) => {
    listOfWorkstations.value = [];
    list.forEach((item: string) => {
      listOfWorkstations.value.push({
        label: item,
        value: item,
      });
    });
  });
}

// endregion

// region 异常类型列表
const listOfExceptionTypes = ref<any>([]);

/**
 * 查询异常类型列表
 */
function queryTheExceptionTypeList() {
  getErrorName().then((list) => {
    listOfExceptionTypes.value = [];
    list.forEach((item: string) => {
      listOfExceptionTypes.value.push({
        label: item,
        value: item,
      });
    });
  });
}

// endregion

// region 文件下载

function downloadTemplate() {
  const params: any = { ...queryParams.value };
  if (params.searchTime && params.searchTime.length === 2) {
    params.startTime = params.searchTime[0].format('YYYY-MM-DD');
    params.endTime = params.searchTime[1].format('YYYY-MM-DD');
    params.searchTime = undefined;
  }
  getExcelPathEnergyConsumption(params).then((data) => {
    window.open(data);
  });
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 初始化

onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });

  queryTheWorkstationList();
  queryTheExceptionTypeList();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 时间范围 -->
        <FormItem
          :label="$t('productionDaily.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.searchTime" />
        </FormItem>

        <!-- 工单号 -->
        <FormItem
          :label="$t('productionDaily.worksheetCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.worksheetCode" />
        </FormItem>

        <!-- 操作类型 -->
        <FormItem
          :label="
            $t(
              'energyConsumption.energyConsumptionCollectionDetails.operationType',
            )
          "
          style="margin-bottom: 1em"
        >
          <RadioGroup v-model:value="queryParams.collectionType">
            <Radio value="">
              {{
                $t('energyConsumption.energyConsumptionCollectionDetails.all')
              }}
            </Radio>
            <Radio :value="-1">
              {{
                $t(
                  'energyConsumption.energyConsumptionCollectionDetails.nonProductionReporting',
                )
              }}
            </Radio>
          </RadioGroup>
        </FormItem>

        <!-- 操作类型 -->
        <FormItem
          :label="
            $t(
              'energyConsumption.energyConsumptionCollectionDetails.operationType',
            )
          "
          style="margin-bottom: 1em"
        >
          <RadioGroup v-model:value="queryParams.opType">
            <Radio value="">
              {{
                $t('energyConsumption.energyConsumptionCollectionDetails.all')
              }}
            </Radio>
            <Radio :value="1">
              {{
                $t(
                  'energyConsumption.energyConsumptionCollectionDetails.normalCollection',
                )
              }}
            </Radio>
            <Radio :value="-1">
              {{
                $t(
                  'energyConsumption.energyConsumptionCollectionDetails.abnormalCollection',
                )
              }}
            </Radio>
          </RadioGroup>
        </FormItem>

        <!-- 异常类型 -->
        <FormItem
          :label="
            $t(
              'energyConsumption.energyConsumptionCollectionDetails.exceptionType',
            )
          "
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.errorName"
            show-search
            allow-clear
            :options="listOfExceptionTypes"
            class="!w-48"
          />
        </FormItem>

        <!-- 工作站名称 -->
        <FormItem
          :label="$t('productionDaily.workstationName')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.workstationName"
            show-search
            allow-clear
            :options="listOfWorkstations"
            class="!w-48"
          />
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
        <template #toolbar-tools>
          <!-- 导出按钮 -->
          <Button type="primary" @click="downloadTemplate()">
            {{ $t('common.export') }}
          </Button>
        </template>
        <template #materialType="{ row }">
          <span> {{ getMaterialTypeText(row.materialType) }} </span>
        </template>
        <template #opType="{ row }">
          <span>
            {{
              row.opType === '1'
                ? $t(
                    'energyConsumption.energyConsumptionCollectionDetails.normalCollection',
                  )
                : $t(
                    'energyConsumption.energyConsumptionCollectionDetails.abnormalCollection',
                  )
            }}
          </span>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
