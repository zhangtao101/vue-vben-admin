<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiChevronDown, MdiChevronUp, MdiHome } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Col,
  Form,
  FormItem,
  Input,
  RadioButton,
  RadioGroup,
  Row,
  Select,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import OperationalMatters from '#/util/component/operationalMatters.vue';
import StepExecution from '#/util/component/stepExecution.vue';

// region 工作站查询信息
// 产线列表
const listOfProductionLines = ref([
  {
    label: 'XXX产线',
    value: '1',
  },
]);

// 工艺列表
const listOfProcesses = ref([
  {
    label: '分切',
    value: '1',
  },
]);

// 查询条件
const queryParams = ref({
  productionLineId: '',
  processId: '',
  test: 'a',
});

// endregion

// region 作业信息
// region 收缩
// 作业信息是否收缩
const jobInformationContraction = ref(false);

/**
 * 作业信息收缩展开
 */
function jobInformationContractionChange() {
  jobInformationContraction.value = !jobInformationContraction.value;
}
// endregion

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
      field: 'worksCenterCode',
      title: '工单编号',
      minWidth: 200,
    },
    {
      field: 'worksCenterName',
      title: '进站时间',
      minWidth: 200,
    },
    {
      field: 'day',
      title: '当前工序',
      minWidth: 200,
    },
    {
      field: 'cLass',
      title: '工单进度',
      minWidth: 200,
    },
    {
      field: '1',
      title: '工单状态',
      minWidth: 200,
    },
    {
      field: '2',
      title: '人员',
      minWidth: 200,
    },
    {
      field: '3',
      title: '工单操作',
      minWidth: 200,
    },
  ],
  height: 200,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  pagerConfig: {
    enabled: false,
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
};

// gridApi
const [Grid] = useVbenVxeGrid({ gridOptions });

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
      items: [{}, {}],
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

// endregion

// endregion

// region 工艺路线
// region 收缩
// 工艺路线是否收缩
const processShrinkage = ref(false);

/**
 * 作业信息收缩展开
 */
function processShrinkageChange() {
  processShrinkage.value = !processShrinkage.value;
}
// endregion
// 工艺路线列表
const processRouteList = ref([
  {
    label: '路线A',
    value: 1,
  },
  {
    label: '路线b',
    value: 2,
  },
  {
    label: '路线c',
    value: 3,
  },
  {
    label: '路线d',
    value: 4,
  },
]);
// 当前选中的工艺路线
const checkedProcess = ref(1);

/**
 * 工艺路线切换
 * @param value
 */
function processChange(value: number) {
  checkedProcess.value = value;
}
// endregion

// region 操作事项
// region 收缩
// 操作事项是否收缩
const operationEventShrinkage = ref(false);

/**
 * 作业信息收缩展开
 */
function operationEventShrinkageChange() {
  operationEventShrinkage.value = !operationEventShrinkage.value;
}
// endregion
// 选中的操作事项
const theSelectedOperation = ref<any>('1');

// endregion
</script>

<template>
  <Page>
    <!-- region 工作站查询信息 -->
    <Row class="mb-4">
      <Col :span="23" class="flex">
        <span class="border-l-4 border-sky-500 pl-4 text-2xl font-black">
          {{ $t('productionOperation.homeworkStation') }}
        </span>

        <div class="w-4/5 pl-4">
          <Select
            :model:value="queryParams.productionLineId"
            :options="listOfProductionLines"
            class="mr-4 !w-64"
          />
          <Select
            :model:value="queryParams.processId"
            :options="listOfProcesses"
            class="!w-64"
          />

          <RadioGroup
            v-model:value="queryParams.test"
            button-style="solid"
            class="float-right"
          >
            <RadioButton value="a">Hangzhou</RadioButton>
            <RadioButton value="1">1</RadioButton>
            <RadioButton value="2">2</RadioButton>
          </RadioGroup>
        </div>
      </Col>
    </Row>
    <hr class="mb-4" />
    <!-- endregion -->

    <!--- region 作业信息 -->
    <Row class="mb-4">
      <Col :span="23" class="flex">
        <span class="border-l-4 border-sky-500 pl-4 text-2xl font-black">
          {{ $t('productionOperation.jobInformation') }}
        </span>
        <Form layout="inline" :model="queryParams" class="w-4/5 pl-4">
          <!-- 工单编号 -->
          <FormItem :label="$t('productionOperation.workOrderNumber')">
            <Select
              :model:value="queryParams.productionLineId"
              :options="listOfProductionLines"
              class="mr-4 !w-64"
            />
          </FormItem>
          <!-- 产品名称 -->
          <FormItem :label="$t('productionOperation.productName')">
            <Input />
          </FormItem>
        </Form>
      </Col>
      <Col :span="1">
        <MdiChevronDown
          class="float-right inline-block cursor-pointer text-2xl"
          v-if="jobInformationContraction"
          @click="jobInformationContractionChange"
        />
        <MdiChevronUp
          class="float-right inline-block cursor-pointer text-2xl"
          v-else
          @click="jobInformationContractionChange"
        />
      </Col>
    </Row>
    <Card class="mb-5" v-if="!jobInformationContraction">
      <Grid>
        <template #toolbar-tools> </template>
      </Grid>
    </Card>
    <hr class="mb-4" />
    <!--- endregion -->

    <!--- region 工艺路线 -->
    <Row class="mb-4">
      <Col :span="23" class="flex">
        <span class="border-l-4 border-sky-500 pl-4 text-2xl font-black">
          {{ $t('productionOperation.processRoute') }}
        </span>
        <Form layout="inline" :model="queryParams" class="w-4/5 pl-4">
          <!-- 工单编号 -->
          <FormItem :label="$t('productionOperation.workOrderNumber')">
            <Input />
          </FormItem>
          <!-- 产品名称 -->
          <FormItem :label="$t('productionOperation.productName')">
            <Input />
          </FormItem>
        </Form>
      </Col>
      <Col :span="1">
        <MdiChevronDown
          class="float-right inline-block cursor-pointer text-2xl"
          v-if="jobInformationContraction"
          @click="processShrinkageChange"
        />
        <MdiChevronUp
          class="float-right inline-block cursor-pointer text-2xl"
          v-else
          @click="processShrinkageChange"
        />
      </Col>
    </Row>
    <Card class="mb-5" v-if="processShrinkage">
      <div class="mt-5">
        <Button
          v-for="item of processRouteList"
          :type="item.value !== checkedProcess ? 'default' : 'primary'"
          size="large"
          class="mr-4 w-32"
          :key="item.value"
          @click="processChange(item.value)"
        >
          {{ item.label }}
        </Button>
      </div>
    </Card>
    <hr class="mb-4" />
    <!--- endregion -->

    <!--- region 操作事项  -->
    <Row class="mb-4">
      <Col :span="23" class="flex">
        <span class="mr-4 border-l-4 border-sky-500 pl-4 text-2xl font-black">
          {{ $t('productionOperation.operationalMatters') }}
        </span>

        <RadioGroup
          v-model:value="theSelectedOperation"
          button-style="solid"
          class="float-right"
        >
          <RadioButton value="1">
            <MdiHome class="inline-block" />
            工序操作
          </RadioButton>
          <RadioButton value="2">
            <MdiHome class="inline-block" />
            质量检验
          </RadioButton>
          <RadioButton value="3">
            <MdiHome class="inline-block" />
            SOP查看
          </RadioButton>
          <RadioButton value="4">
            <MdiHome class="inline-block" />
            安灯
          </RadioButton>
        </RadioGroup>
      </Col>
      <Col :span="1">
        <MdiChevronDown
          class="float-right inline-block cursor-pointer text-2xl"
          v-if="operationEventShrinkage"
          @click="operationEventShrinkageChange"
        />
        <MdiChevronUp
          class="float-right inline-block cursor-pointer text-2xl"
          v-else
          @click="operationEventShrinkageChange"
        />
      </Col>
    </Row>
    <Card v-if="!operationEventShrinkage" class="mb-5">
      <template v-if="theSelectedOperation === '1'">
        <OperationalMatters />
      </template>
      <template v-if="theSelectedOperation === '2'"> 1 </template>
      <template v-if="theSelectedOperation === '3'"> 2 </template>
      <template v-if="theSelectedOperation === '4'"> 3 </template>
    </Card>
    <hr class="mb-4" />
    <!--- endregion -->

    <!--- region 工步执行  -->
    <Row class="mb-4">
      <Col :span="4">
        <span class="border-l-4 border-sky-500 pl-4 text-2xl font-black">
          {{ $t('productionOperation.workStepExecution') }}
        </span>
      </Col>
      <Col :span="1" :offset="19">
        <MdiChevronDown
          class="float-right inline-block cursor-pointer text-2xl"
          v-if="operationEventShrinkage"
          @click="operationEventShrinkageChange"
        />
        <MdiChevronUp
          class="float-right inline-block cursor-pointer text-2xl"
          v-else
          @click="operationEventShrinkageChange"
        />
      </Col>
    </Row>
    <Card class="mb-5 min-h-72">
      <StepExecution />
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped lang="scss">
:deep(.ant-tabs-tab) {
  font-size: 18px;
}
</style>
