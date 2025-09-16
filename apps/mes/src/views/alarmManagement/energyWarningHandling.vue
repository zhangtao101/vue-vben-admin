<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { IconifyIcon, MdiSearch } from '@vben/icons';
import { useAccessStore } from '@vben/stores';

import {
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Image,
  Input,
  message,
  Modal,
  RadioGroup,
  RangePicker,
  Row,
  Select,
  Space,
  Statistic,
  Tooltip,
  Upload,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getAWarningMessageFromTheUser,
  getTheWarningType,
  handleWarningMessages,
  informationOnTheNumberOfTasksUsed,
  processingResults,
  startWorkingOnTheWarning,
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
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'equipmentCode',
      title: '仪表编码',
      minWidth: 150,
    },
    {
      field: 'equipmentName',
      title: '仪表名称',
      minWidth: 150,
    },
    {
      field: 'partitionName',
      title: '所属单元',
      minWidth: 150,
    },
    {
      field: 'location',
      title: '安装位置',
      minWidth: 150,
    },
    {
      field: 'status',
      title: '状态',
      minWidth: 150,
      slots: { default: 'status' },
    },
    {
      field: 'currentHandler',
      title: '当前处理人',
      minWidth: 150,
    },
    {
      field: 'createTime',
      title: '创建时间',
      minWidth: 150,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 220,
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
 * 获取状态的中文描述
 * @param status
 */
function getStatusText(status: number) {
  switch (status) {
    case 1: {
      return '未处理';
    }
    case 2: {
      return '处理中';
    }
    case 3: {
      return '已处理';
    }
    default: {
      return '未知';
    }
  }
}

// region 查看 / 编辑 / 新增 具体操作

// 当前选中的表格行
const checkedRow = ref<any>({});
// 是否显示查看详情抽屉
const showViewDrawer = ref(false);
// 是否显示编辑抽屉
const showEditDrawer = ref(false);

// 抽屉冲的form表单对象
const editForm = ref();
// form表单规则验证
const editRules = ref<any>({
  waringType: [
    {
      message: '此项为必填项',
      required: true,
      trigger: 'change',
    },
  ],
  handleType: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  direction: [{ message: '此项为必填项', required: true, trigger: 'change' }],
});
// 处理方式
const handleType = [
  {
    label: '直接处理',
    value: 1,
  },
  {
    label: '通知处理',
    value: 2,
  },
];

// 移交方式
const transferType = [
  {
    label: '上一级',
    value: 1,
  },
  {
    label: '下一级',
    value: -1,
  },
];

/**
 * 显示是编辑抽屉
 * @param row 表格行数据
 */
function editRow(row: any) {
  row.loading = true;
  startWorkingOnTheWarning({
    andonCode: row.andonCode,
  })
    .then(({ data, mes }) => {
      if (data) {
        checkedRow.value = {
          ...row,
        };
        showEditDrawer.value = true;
      } else {
        message.error(mes);
      }
    })
    .finally(() => {
      row.loading = false;
    });
}

/**
 * 关闭编辑抽屉
 */
function onClose() {
  checkedRow.value = {};
  showViewDrawer.value = false;
  showEditDrawer.value = false;
  fileList.value = [];
}

/**
 * 表单提交
 */
function submit() {
  editForm.value.validate().then(() => {
    const params = {
      ...checkedRow.value,
    };
    if (fileList.value && fileList.value.length > 0) {
      params.imageUrls = [];
      fileList.value.forEach((item: any) => {
        const {
          response: { code, data },
        } = item;
        if (code === 200) {
          params.imageUrls.push(data);
        }
      });
    }
    handleWarningMessages(params).then(() => {
      // 查询数据
      gridApi.query();
      message.success($t('common.successfulOperation'));
      onClose();
    });
  });
}

// endregion

// region 显示详情
const showDetailsDrawer = ref(false);
const details = ref<any>({});
function showDetails(row: any) {
  processingResults(row.andonCode).then((data) => {
    details.value = data;
    showDetailsDrawer.value = true;
  });
}
function detailsClose() {
  details.value = {};
  showDetailsDrawer.value = false;
}
// endregion

// endregion

// region 查询数据
// 查询参数
const queryParams = ref<any>({
  runningStatus: -1,
});
// 状态列表
const statusOptions = ref([
  {
    label: '全部',
    value: -1,
  },
  {
    label: '未处理',
    value: 1,
  },
  {
    label: '处理中',
    value: 2,
  },
  {
    label: '已处理',
    value: 3,
  },
]);

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params = {
      ...queryParams.value, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    };
    if (params.state === -1) {
      delete params.state;
    }
    if (params.searchTime && params.searchTime.length === 2) {
      params.startTime = params.searchTime[0].format('YYYY-MM-DD');
      params.endTime = params.searchTime[1].format('YYYY-MM-DD');
      delete params.searchTime;
    }
    getAWarningMessageFromTheUser(params).then(({ total, list }) => {
      // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
      resolve({
        total,
        items: list,
      });
    });
  });
}

// endregion

// region 总数信息
const sum = ref<any>({
  all: 0,
  wait: 0,
  finish: 0,
  month: 0,
  lastMonth: 0,
  lastYearMonth: 0,
  hb: 0,
  tb: 0,
});

function querySum() {
  informationOnTheNumberOfTasksUsed().then((data) => {
    sum.value = {
      ...data,
    };
  });
}

// endregion

// region 文件上传
const accessStore = useAccessStore();
// 文件上传头信息
const headers = ref<any>({
  Authorization: accessStore.accessToken,
});
// 上传路径
const action = ref<string>(
  `/ht/${import.meta.env.VITE_GLOB_MES_ENERGY}/simple/andon/upload`,
);
// 文件列表
const fileList = ref<any>([]);

const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');

async function handlePreview(file: any) {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value =
    file.name || file.url.slice(Math.max(0, file.url.lastIndexOf('/') + 1));
}

function handleCancel() {
  previewVisible.value = false;
  previewTitle.value = '';
}

function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', (error: any) => reject(error));
  });
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 警告类型

// 警告类型列表
const alarmTypeOptions = ref<any>([]);

/**
 * 查询警告类型
 */
function queryAlarmType() {
  getTheWarningType().then((data) => {
    alarmTypeOptions.value = [];
    data.forEach((item: any) => {
      alarmTypeOptions.value.push({
        label: item,
        value: item,
      });
    });
  });
}

/**
 * 筛选选项
 * @param input 输入值
 * @param option 选项
 * @returns 是否匹配
 */
const filterOption = (input: string, option: any) => {
  return `${option.value}&&${option.label}`
    .toLowerCase()
    .includes(input.toLowerCase());
};
// endregion

// region 初始化

onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  querySum();
  queryAlarmType();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 警告数量信息 -->
    <Row :gutter="24">
      <!-- region 警告总数 -->
      <Col :span="4">
        <Card>
          <Row>
            <Col :span="8" class="flex items-center justify-center">
              <svg class="icon-web" aria-hidden="true" font-size="30">
                <use xlink:href="#icon-Alert" />
              </svg>
            </Col>
            <Col :span="14">
              <Statistic
                :title="$t('alarmManagement.totalNumberOfWarnings')"
                :value="sum.all"
              />
            </Col>
          </Row>
        </Card>
      </Col>
      <!-- endregion -->
      <!-- region 待处理 -->
      <Col :span="4">
        <Card>
          <Row>
            <Col :span="8" class="flex items-center justify-center">
              <svg class="icon-web" aria-hidden="true" font-size="30">
                <use xlink:href="#icon-daichulishixiang" />
              </svg>
            </Col>
            <Col :span="14">
              <Statistic
                :title="$t('alarmManagement.pending')"
                :value="sum.wait"
              />
            </Col>
          </Row>
        </Card>
      </Col>
      <!-- endregion -->
      <!-- region 已处理 -->
      <Col :span="4">
        <Card>
          <Row>
            <Col :span="8" class="flex items-center justify-center">
              <svg class="icon-web" aria-hidden="true" font-size="30">
                <use xlink:href="#icon-yichuligaojing" />
              </svg>
            </Col>
            <Col :span="14">
              <Statistic
                :title="$t('alarmManagement.processed')"
                :value="sum.finish"
              />
            </Col>
          </Row>
        </Card>
      </Col>
      <!-- endregion -->
      <!-- region 本月预警总数 -->
      <Col :span="4">
        <Card>
          <Row>
            <Col :span="8" class="flex items-center justify-center">
              <svg class="icon-web" aria-hidden="true" font-size="30">
                <use xlink:href="#icon-yujing" />
              </svg>
            </Col>
            <Col :span="14">
              <Statistic
                :title="$t('alarmManagement.totalNumberOfWarningsThisMonth')"
                :value="sum.month"
              />
            </Col>
          </Row>
        </Card>
      </Col>
      <!-- endregion -->
      <!-- region 上月预警总数 -->
      <Col :span="4">
        <Card>
          <Statistic
            :title="$t('alarmManagement.totalNumberOfEarlyWarningsLastMonth')"
            :value="sum.lastMonth"
          >
            <template #suffix>
              <IconifyIcon
                icon="mdi:arrow-down-thin"
                class="inline-block align-middle text-2xl text-green-500"
                v-if="sum.hb >= 0"
              />
              <IconifyIcon
                icon="mdi:arrow-up-thin"
                class="inline-block align-middle text-2xl text-red-500"
                v-else
              />
              <span class="text-sm">
                {{ $t('alarmManagement.annulus') }}: {{ sum.hb }}%
              </span>
            </template>
          </Statistic>
        </Card>
      </Col>
      <!-- endregion -->
      <!-- region 上年预警总数 -->
      <Col :span="4">
        <Card>
          <Statistic
            :title="$t('alarmManagement.previousYearWarningTotal')"
            :value="sum.lastYearMonth"
          >
            <template #suffix>
              <IconifyIcon
                icon="mdi:arrow-down-thin"
                class="inline-block align-middle text-2xl text-green-500"
                v-if="sum.tb >= 0"
              />
              <IconifyIcon
                icon="mdi:arrow-up-thin"
                class="inline-block align-middle text-2xl text-red-500"
                v-else
              />
              <span class="text-sm">
                {{ $t('alarmManagement.comparisonOverTime') }}: {{ sum.tb }}%
              </span>
            </template>
          </Statistic>
        </Card>
      </Col>
      <!-- endregion -->
    </Row>
    <!-- endregion -->
    <!-- region 搜索 -->
    <Card class="mb-4 mt-4">
      <Form :model="queryParams" layout="inline">
        <!-- 仪表编号 -->
        <FormItem
          :label="$t('alarmManagement.meterNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.equipCode" />
        </FormItem>

        <!-- 仪表名称 -->
        <FormItem
          :label="$t('alarmManagement.meterName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.equipName" />
        </FormItem>

        <!-- 时间范围 -->
        <FormItem
          :label="$t('energyConsumptionStatistics.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.searchTime" />
        </FormItem>
        <!-- 处理状态 -->
        <FormItem
          :label="$t('alarmManagement.processingStatus')"
          style="margin-bottom: 1em"
        >
          <RadioGroup
            v-model:value="queryParams.state"
            :options="statusOptions"
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
        <template #status="{ row }">
          {{ getStatusText(row.status) }}
        </template>
        <template #action="{ row }">
          <!-- 查看 -->
          <Tooltip>
            <template #title>{{ $t('common.view') }}</template>
            <Button
              type="link"
              @click="showDetails(row)"
              :loading="row.loading"
              v-if="row.status === 3"
            >
              <IconifyIcon
                icon="mdi:eye"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 处理警告 -->
          <Tooltip>
            <template #title>
              {{ $t('alarmManagement.handlingWarnings') }}
            </template>
            <Button
              type="link"
              @click="editRow(row)"
              v-if="author.includes('编辑') && row.status !== 3"
              :loading="row.loading"
            >
              <IconifyIcon
                icon="mdi-light:check-circle"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- region 新增/编辑 抽屉 -->
    <Drawer
      v-model:open="showEditDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="400"
      class="custom-class"
      placement="right"
      title="信息编辑"
      @close="onClose"
    >
      <Form
        ref="editForm"
        :label-col="{ span: 8 }"
        :model="checkedRow"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
      >
        <!-- 警告类型 -->
        <FormItem :label="$t('alarmManagement.warningType')" name="waringType">
          <Select
            v-model:value="checkedRow.waringType"
            :options="alarmTypeOptions"
            show-search
            :filter-option="filterOption"
          />
        </FormItem>
        <!-- 处理描述 -->
        <FormItem
          :label="$t('alarmManagement.processingDescription')"
          name="reason"
        >
          <Input v-model:value="checkedRow.reason" />
        </FormItem>
        <!-- 处理方式 -->
        <FormItem :label="$t('alarmManagement.treatment')" name="handleType">
          <RadioGroup
            v-model:value="checkedRow.handleType"
            :options="handleType"
          />
        </FormItem>
        <!-- 移交方式 -->
        <FormItem
          :label="$t('alarmManagement.transferMethod')"
          name="direction"
          v-if="checkedRow.handleType === 2"
        >
          <RadioGroup
            v-model:value="checkedRow.direction"
            :options="transferType"
          />
        </FormItem>
        <!-- 移交方式 -->
        <FormItem :label="$t('alarmManagement.upload')">
          <Upload
            v-model:file-list="fileList"
            :action="action"
            :headers="headers"
            list-type="picture"
            name="photo"
            accept="image/*"
            @preview="handlePreview"
          >
            <Button> {{ $t('common.upload') }}</Button>
          </Upload>
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="onClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="submit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->
    <Drawer
      v-model:open="showDetailsDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="700"
      class="custom-class"
      placement="right"
      title="信息编辑"
      @close="detailsClose"
    >
      <Descriptions :column="2" bordered>
        <DescriptionsItem label="告警类型">
          {{ details.problemDesc }}
        </DescriptionsItem>
        <DescriptionsItem label="处理人">
          {{ details.handleUser }}
        </DescriptionsItem>
        <DescriptionsItem label="处理方式">
          {{ details.resultType }}
        </DescriptionsItem>
        <DescriptionsItem label="处理描述">
          {{ details.handleContent }}
        </DescriptionsItem>
        <DescriptionsItem label="现场图片">
          <template v-if="details.imageUrls">
            <Image
              :src="item"
              v-for="(item, index) of details.imageUrls"
              :key="index"
              :width="100"
            />
          </template>
        </DescriptionsItem>
        <DescriptionsItem label="处理时间">
          {{ details.handleTime }}
        </DescriptionsItem>
      </Descriptions>
    </Drawer>

    <!-- region 图片预览 -->
    <Modal
      :open="previewVisible"
      :title="previewTitle"
      :footer="null"
      @cancel="handleCancel"
    >
      <img alt="example" style="width: 100%" :src="previewImage" />
    </Modal>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
