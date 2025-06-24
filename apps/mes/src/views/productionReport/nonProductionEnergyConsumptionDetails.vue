<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiEditOutline, MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Radio,
  RadioGroup,
  RangePicker,
  Tooltip,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  updateFSCEnergyConsumption,
  viewNonProductionEnergyConsumptionDetails,
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
      title: '序号',
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    { field: 'taskCode', title: '任务号', minWidth: 200 },
    {
      field: 'type',
      title: '采集模式',
      minWidth: 200,
      slots: {
        default: 'type',
      },
    },
    { field: 'energyEquipCode', title: '采集仪表编号', minWidth: 200 },
    {
      field: 'energyEquipName',
      title: '采集仪表名称',
      minWidth: 200,
    },
    {
      field: 'startTime',
      title: '采集开始时间',
      minWidth: 200,
    },
    {
      field: 'startValue',
      title: '采集开始读数',
      minWidth: 200,
    },
    {
      field: 'endTime',
      title: '采集结束时间',
      minWidth: 200,
    },
    {
      field: 'endValue',
      title: '采集结束读数',
      minWidth: 200,
    },
    {
      field: 'energyValue',
      title: '采集总能耗',
      minWidth: 200,
    },
    {
      field: 'catchUser',
      title: '采集人',
      minWidth: 200,
    },
    {
      field: 'action',
      title: '操作',
      minWidth: 100,
      fixed: 'right',
      slots: {
        default: 'action',
      },
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
function getTypeText(state: number) {
  switch (state * 1) {
    case 1: {
      return '天然气';
    }
    case 2: {
      return '电';
    }
    case 3: {
      return '水煤浆';
    }
    case 4: {
      return '焦炉气';
    }
    default: {
      return '未定义的类型';
    }
  }
}

// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 查询时间
  searchTime: [] as any,
  // 工单号
  worksheetCode: '',
  // 产品名称
  collectionType: '',
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
    viewNonProductionEnergyConsumptionDetails({
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

// region 编辑
// 是否显示抽屉
const show = ref(false);
// 当前编辑行
const editItem = ref<any>();
// 表单ref
const editForm = ref<any>();
// form表单规则验证
const editRules = ref<any>({
  energyEquipCode: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  type: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  collectionTime: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  startValue: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  endValue: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  energyValue: [{ message: '此项为必填项', required: true, trigger: 'change' }],
});

/**
 * 显示编辑抽屉
 * @param row
 */
function showDrawer(row: any) {
  editItem.value = { ...row };
  editItem.value.collectionTime =
    editItem.value.startTime || editItem.value.endTime
      ? [dayjs(editItem.value.startTime), dayjs(editItem.value.endTime)]
      : [];
  show.value = true;
}

/**
 * 关闭抽屉
 */
function close() {
  show.value = false;
  editItem.value = {};
}

// 提交状态
const submitLoading = ref(false);

/**
 * 提交
 */
function submit() {
  submitLoading.value = true;
  editForm.value.validate().then(() => {
    const params: any = {
      ...editItem.value,
    };
    if (params.collectionTime && params.collectionTime.length === 2) {
      params.startTime = params.collectionTime[0].format('YYYY-MM-DD');
      params.endTime = params.collectionTime[1].format('YYYY-MM-DD');
      params.collectionTime = undefined;
    }
    updateFSCEnergyConsumption(params)
      .then(() => {
        message.success($t('common.successfulOperation'));
        close();
        gridApi.reload();
      })
      .finally(() => {
        submitLoading.value = false;
      });
  });
}

// endregino

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
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 时间范围 -->
        <FormItem
          :label="$t('productionDaily.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.searchTime" />
        </FormItem>

        <!-- 设备编号 -->
        <FormItem
          :label="$t('energyConsumptionCollectionDetails.equipmentNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.worksheetCode" />
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
        <template #type="{ row }">
          <span> {{ getTypeText(row.type) }} </span>
        </template>
        <template #action="{ row }">
          <!-- 编辑按钮 ="{ row }" -->
          <Tooltip v-if="author.includes('编辑')">
            <template #title>
              {{ $t('common.edit') }}
            </template>
            <Button
              :icon="h(MdiEditOutline, { class: 'inline-block size-6' })"
              type="link"
              @click="showDrawer(row)"
            />
            <!--        @click="editRow(row, true)"-->
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
    <Drawer
      :title="$t('common.edit')"
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
        <!-- 采集仪表编号 -->
        <FormItem
          :label="
            $t('energyConsumptionCollectionDetails.collectTheInstrumentNumber')
          "
          name="energyEquipCode"
        >
          <Input v-model:value="editItem.energyEquipCode" />
        </FormItem>
        <!-- 采集模式 -->
        <FormItem
          :label="$t('energyConsumptionCollectionDetails.collectionMode')"
          name="type"
        >
          <RadioGroup v-model:value="editItem.type">
            <Radio value="1">
              {{ $t('energyConsumptionCollectionDetails.naturalGas') }}
            </Radio>
            <Radio value="2">
              {{ $t('energyConsumptionCollectionDetails.electricity') }}
            </Radio>
            <Radio value="3">
              {{ $t('energyConsumptionCollectionDetails.waterCoalSlurry') }}
            </Radio>
            <Radio value="4">
              {{ $t('energyConsumptionCollectionDetails.cokeOvenGas') }}
            </Radio>
          </RadioGroup>
        </FormItem>
        <!-- 采集时间 -->
        <FormItem
          :label="$t('energyConsumptionCollectionDetails.collectionTime')"
          name="collectionTime"
        >
          <RangePicker v-model:value="editItem.collectionTime" show-time />
        </FormItem>
        <!-- 采集开始读数 -->
        <FormItem
          :label="
            $t('energyConsumptionCollectionDetails.startReadingCollection')
          "
          name="startValue"
        >
          <InputNumber v-model:value="editItem.startValue" :min="0" />
        </FormItem>
        <!-- 采集结束读数 -->
        <FormItem
          :label="
            $t('energyConsumptionCollectionDetails.readingAtTheEndOfCollection')
          "
          name="endValue"
        >
          <InputNumber
            v-model:value="editItem.endValue"
            :min="editItem.startValue || 0"
          />
        </FormItem>
        <!-- 采集总能耗 -->
        <FormItem
          :label="
            $t(
              'energyConsumptionCollectionDetails.collectTheTotalEnergyConsumption',
            )
          "
          name="energyValue"
        >
          <InputNumber v-model:value="editItem.energyValue" />
        </FormItem>
      </Form>
      <!-- 定义抽屉的底部按钮 -->
      <template #footer>
        <!-- 取消按钮，点击后关闭作业站分配抽屉 -->
        <Button danger type="primary" @click="close" class="mr-4">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认分配按钮，点击后调用 submit 方法提交设备资源分配信息 -->
        <Button type="primary" @click="submit" :loading="submitLoading">
          {{ $t('common.confirm') }}
        </Button>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
