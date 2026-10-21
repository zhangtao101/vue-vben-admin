<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { computed, h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
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
  Modal,
  RangePicker,
  Select,
  Space,
  Tag,
  Tooltip,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createLinehouseTask,
  deleteLinehouseTask,
  queryLinehouseTaskDetail,
  queryLinehouseTaskList,
  updateLinehouseTask,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import LabelSelectDrawer from '#/util/component/labelPrint/LabelSelectDrawer.vue';

// 路由信息
const route = useRoute();

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    {
      field: 'taskCode',
      title: $t('storeManagement.lineSideWarehouseTask.taskCode'),
      minWidth: 180,
    },
    {
      field: 'taskType',
      title: $t('storeManagement.lineSideWarehouseTask.taskType'),
      minWidth: 100,
      slots: { default: 'taskType' },
    },
    {
      field: 'fromCode',
      title: $t('storeManagement.lineSideWarehouseTask.formCode'),
      minWidth: 160,
    },
    {
      field: 'taskState',
      title: $t('storeManagement.lineSideWarehouseTask.taskState'),
      minWidth: 100,
      slots: { default: 'taskState' },
    },
    {
      field: 'createTime',
      title: $t('storeManagement.lineSideWarehouseTask.createTime'),
      minWidth: 160,
      formatter: ({ cellValue }: any) => formatTime(cellValue),
    },
    {
      field: 'modifyTime',
      title: $t('storeManagement.lineSideWarehouseTask.modifyTime'),
      minWidth: 160,
      formatter: ({ cellValue }: any) => formatTime(cellValue),
    },
    {
      field: 'taskOpUser',
      title: $t('storeManagement.lineSideWarehouseTask.taskOpUser'),
      minWidth: 120,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('baseInfo.action'),
      width: 180,
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  pagerConfig: {
    enabled: true,
    pageSize: 20,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          page: page?.currentPage,
          pageSize: page?.pageSize,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// endregion

// region 数据查询

// 查询参数
const queryParams = ref({
  // 任务单号
  taskCode: '',
  // 任务类型
  taskType: undefined as number | undefined,
  // 来源单号
  formCode: '',
  // 任务状态
  taskState: undefined as number | undefined,
  // 标签编号
  labelCode: '',
  // 物料编号
  materialCode: '',
  // 创建开始日期
  createTimeStart: '',
  // 创建结束日期
  createTimeEnd: '',
});

// 创建日期区间
const dateRange = ref<any>(undefined);

// 任务类型选项：-1 下架，1 上架
const taskTypeOptions = [
  { label: $t('storeManagement.lineSideWarehouseTask.taskTypeDown'), value: -1 },
  { label: $t('storeManagement.lineSideWarehouseTask.taskTypeUp'), value: 1 },
];

// 任务状态选项：-1 待领取，1 执行中，2 已完成
const taskStateOptions = [
  {
    label: $t('storeManagement.lineSideWarehouseTask.statePendingReceive'),
    value: -1,
  },
  { label: $t('storeManagement.lineSideWarehouseTask.stateRunning'), value: 1 },
  {
    label: $t('storeManagement.lineSideWarehouseTask.stateFinished'),
    value: 2,
  },
];

/**
 * 格式化时间，后端返回 ISO 时间，统一展示为 yyyy-MM-dd HH:mm:ss
 * @param {any} value 时间值
 * @returns {string} 格式化后的时间，空值时返回空字符串
 * @since 2026-10-21 10:00:00
 */
function formatTime(value: any) {
  if (!value) {
    return '';
  }
  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : String(value);
}

/**
 * 查询数据
 * @param {any} params 分页参数（page 当前页码，pageSize 每页条数）
 * @returns {Promise<any>} 表格数据 promise
 * @since 2026-10-21 10:00:00
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    queryLinehouseTaskList({
      ...queryParams.value,
      pageNum: page,
      pageSize,
    })
      .then((response: any) => {
        const data = response.data || response;
        resolve({
          total: data.total || 0,
          items: data.results || [],
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 创建日期区间变化
 * @param {any[]} dates 日期区间，[开始, 结束]
 * @since 2026-10-21 10:00:00
 */
function handleDateChange(dates: any[]) {
  queryParams.value.createTimeStart = dates?.[0] || '';
  queryParams.value.createTimeEnd = dates?.[1] || '';
}

/**
 * 重置查询条件
 * @since 2026-10-21 10:00:00
 */
function handleReset() {
  queryParams.value = {
    taskCode: '',
    taskType: undefined,
    formCode: '',
    taskState: undefined,
    labelCode: '',
    materialCode: '',
    createTimeStart: '',
    createTimeEnd: '',
  };
  dateRange.value = [];
  gridApi.reload();
}

// endregion

// region 查看

// 查看抽屉是否显示
const showViewDrawer = ref(false);
// 当前查看的任务
const viewData = ref<any>({});
// 明细数据
const detailList = ref<any[]>([]);

// 查看抽屉：任务类型文案
const viewTaskTypeText = computed(() =>
  viewData.value.taskType === 1
    ? $t('storeManagement.lineSideWarehouseTask.taskTypeUp')
    : $t('storeManagement.lineSideWarehouseTask.taskTypeDown'),
);

// 查看抽屉：任务状态文案
const viewTaskStateText = computed(() => {
  const state = viewData.value.taskState;
  if (state === 2) {
    return $t('storeManagement.lineSideWarehouseTask.stateFinished');
  }
  if (state === 1) {
    return $t('storeManagement.lineSideWarehouseTask.stateRunning');
  }
  return $t('storeManagement.lineSideWarehouseTask.statePendingReceive');
});

const detailGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    {
      field: 'labelCode',
      title: $t('storeManagement.lineSideWarehouseTask.labelCode'),
      minWidth: 150,
    },
    {
      field: 'materialCode',
      title: $t('storeManagement.lineSideWarehouseTask.materialCode'),
      minWidth: 140,
    },
    {
      field: 'materialName',
      title: $t('storeManagement.lineSideWarehouseTask.materialName'),
      minWidth: 180,
    },
    {
      field: 'todoNumber',
      title: $t('storeManagement.lineSideWarehouseTask.todoNumber'),
      minWidth: 100,
    },
    {
      field: 'finishNumber',
      title: $t('storeManagement.lineSideWarehouseTask.finishNumber'),
      minWidth: 100,
    },
    {
      field: 'state',
      title: $t('storeManagement.lineSideWarehouseTask.detailState'),
      minWidth: 100,
      slots: { default: 'detailState' },
    },
  ],
  height: 300,
  stripe: true,
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return { items: detailList.value, total: detailList.value.length };
      },
    },
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [DetailGrid, detailGridApi] = useVbenVxeGrid({
  gridOptions: detailGridOptions,
});

/**
 * 查看任务详情
 * @param {any} row 当前行数据
 * @since 2026-10-21 10:00:00
 */
function handleView(row: any) {
  queryLinehouseTaskDetail(row.id).then((response: any) => {
    const data = response.data || response;
    viewData.value = data || {};
    detailList.value = data?.details || [];
    showViewDrawer.value = true;
    detailGridApi.reload();
  });
}

// endregion

// region 新增 / 编辑

// 编辑抽屉是否显示
const showEditDrawer = ref(false);
// 是否编辑（false 为新增）
const isEdit = ref(false);
// 表单数据
const formData = ref<any>({
  id: undefined,
  taskType: undefined,
  formCode: '',
  labels: [] as any[],
});
// 表单校验规则
const formRules = ref({
  taskType: [
    {
      message: $t('storeManagement.lineSideWarehouseTask.selectTaskType'),
      required: true,
      trigger: 'change',
    },
  ],
} as any);
// 表单对象
const formRef = ref();
// 标签选择抽屉
const labelSelectRef = ref();
// 当前正在选择标签的行下标
const activeLabelIndex = ref(0);

/**
 * 打开新增抽屉
 * @since 2026-10-21 10:00:00
 */
function handleAdd() {
  isEdit.value = false;
  formData.value = {
    id: undefined,
    taskType: undefined,
    formCode: '',
    labels: [{ labelCode: '', number: undefined, packageNumber: undefined }],
  };
  showEditDrawer.value = true;
  formRef.value?.clearValidate();
}

/**
 * 打开编辑抽屉
 * @param {any} row 当前行数据
 * @since 2026-10-21 10:00:00
 */
function handleEdit(row: any) {
  queryLinehouseTaskDetail(row.id).then((response: any) => {
    const data = response.data || response;
    isEdit.value = true;
    formData.value = {
      id: data?.id,
      taskType: data?.taskType,
      formCode: data?.fromCode || '',
      labels:
        (data?.details || []).map((item: any) => ({
          labelCode: item.labelCode,
          number: item.todoNumber,
          packageNumber: item.packageNumber,
        })) || [],
    };
    if (formData.value.labels.length === 0) {
      formData.value.labels = [
        { labelCode: '', number: undefined, packageNumber: undefined },
      ];
    }
    showEditDrawer.value = true;
    formRef.value?.clearValidate();
  });
}

/**
 * 新增一条标签行
 * @since 2026-10-21 10:00:00
 */
function addLabel() {
  formData.value.labels.push({
    labelCode: '',
    number: undefined,
    packageNumber: undefined,
  });
}

/**
 * 打开标签选择抽屉，按当前任务类型限定可选标签状态
 * @param {number} index 标签行下标
 * @since 2026-10-21 10:00:00
 */
function openLabelSelect(index: any) {
  activeLabelIndex.value = index;
  // 下架传 -1（查待入库标签），上架传 1（查已入库、已出库标签）
  const type = formData.value.taskType === -1 ? -1 : 1;
  labelSelectRef.value?.open(undefined, type);
}

/**
 * 标签选择回填：写入标签编号、标签数量，计划数量默认取标签数量
 * @param {any} row 选中的标签行
 * @since 2026-10-21 10:00:00
 */
function handleLabelSelected(row: any) {
  const label = formData.value.labels[activeLabelIndex.value];
  if (!label) {
    return;
  }
  label.labelCode = row.labelCode;
  label.packageNumber = row.packageNumber;
  label.number = row.packageNumber;
}

/**
 * 删除一条标签行
 * @param {number | string} index 行下标
 * @since 2026-10-21 10:00:00
 */
function removeLabel(index: number | string) {
  formData.value.labels.splice(Number(index), 1);
}

/**
 * 关闭编辑抽屉
 * @since 2026-10-21 10:00:00
 */
function onClose() {
  showEditDrawer.value = false;
}

/**
 * 提交表单（新增 / 修改）
 * 新增返回任务单号，修改返回 null，成功后重新查询列表
 * @since 2026-10-21 10:00:00
 */
function submitForm() {
  formRef.value?.validate().then(() => {
    const labels = (formData.value.labels || [])
      .filter((item: any) => item.labelCode)
      .map((item: any) => ({
        labelCode: item.labelCode,
        number: item.number,
      }));
    if (labels.length === 0) {
      message.warning(
        $t('storeManagement.lineSideWarehouseTask.pleaseAddLabel'),
      );
      return;
    }
    const params = {
      id: formData.value.id,
      taskType: formData.value.taskType,
      formCode: formData.value.formCode,
      labels,
    };
    const request = isEdit.value
      ? updateLinehouseTask(params)
      : createLinehouseTask({
          taskType: params.taskType,
          formCode: params.formCode,
          labels: params.labels,
        });
    request.then(() => {
      message.success(
        isEdit.value
          ? $t('storeManagement.lineSideWarehouseTask.updateSuccess')
          : $t('storeManagement.lineSideWarehouseTask.createSuccess'),
      );
      onClose();
      gridApi.reload();
    });
  });
}

// endregion

// region 删除

/**
 * 删除未执行的任务
 * @param {any} row 当前行数据
 * @since 2026-10-21 10:00:00
 */
function handleDelete(row: any) {
  Modal.confirm({
    title: $t('common.prompt'),
    content: $t('storeManagement.lineSideWarehouseTask.confirmDelete'),
    onOk: () => {
      deleteLinehouseTask(row.id).then(() => {
        message.success(
          $t('storeManagement.lineSideWarehouseTask.deleteSuccess'),
        );
        gridApi.reload();
      });
    },
  });
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);
// endregion

// region 初始化

onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 任务单号 -->
        <FormItem
          :label="$t('storeManagement.lineSideWarehouseTask.taskCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.taskCode" />
        </FormItem>
        <!-- 任务类型 -->
        <FormItem
          :label="$t('storeManagement.lineSideWarehouseTask.taskType')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.taskType"
            :options="taskTypeOptions"
            allow-clear
            style="min-width: 120px"
          />
        </FormItem>
        <!-- 来源单号 -->
        <FormItem
          :label="$t('storeManagement.lineSideWarehouseTask.formCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.formCode" />
        </FormItem>
        <!-- 任务状态 -->
        <FormItem
          :label="$t('storeManagement.lineSideWarehouseTask.taskState')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.taskState"
            :options="taskStateOptions"
            allow-clear
            style="min-width: 120px"
          />
        </FormItem>
        <!-- 标签编号 -->
        <FormItem
          :label="$t('storeManagement.lineSideWarehouseTask.labelCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.labelCode" />
        </FormItem>
        <!-- 物料编号 -->
        <FormItem
          :label="$t('storeManagement.lineSideWarehouseTask.materialCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialCode" />
        </FormItem>
        <!-- 创建日期 -->
        <FormItem
          :label="$t('storeManagement.lineSideWarehouseTask.createTimeRange')"
          style="margin-bottom: 1em"
        >
          <RangePicker
            v-model:value="dateRange"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Space>
            <Button
              :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
              type="primary"
              @click="gridApi.reload()"
            >
              {{ $t('common.search') }}
            </Button>
            <Button @click="handleReset">
              {{ $t('common.reset') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 表格主体 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <Button
            v-if="author.includes('新增')"
            type="primary"
            @click="handleAdd"
          >
            {{ $t('common.add') }}
          </Button>
        </template>
        <!-- 任务类型 -->
        <template #taskType="{ row }">
          <Tag :color="row.taskType === 1 ? 'blue' : 'orange'">
            {{
              row.taskType === 1
                ? $t('storeManagement.lineSideWarehouseTask.taskTypeUp')
                : $t('storeManagement.lineSideWarehouseTask.taskTypeDown')
            }}
          </Tag>
        </template>
        <!-- 任务状态 -->
        <template #taskState="{ row }">
          <Tag
            :color="
              row.taskState === 2
                ? 'success'
                : row.taskState === 1
                  ? 'processing'
                  : 'default'
            "
          >
            {{
              row.taskState === 2
                ? $t('storeManagement.lineSideWarehouseTask.stateFinished')
                : row.taskState === 1
                  ? $t('storeManagement.lineSideWarehouseTask.stateRunning')
                  : $t('storeManagement.lineSideWarehouseTask.statePendingReceive')
            }}
          </Tag>
        </template>
        <!-- 操作 -->
        <template #action="{ row }">
          <Space>
            <!-- 查看 -->
            <Tooltip>
              <template #title>{{ $t('common.view') }}</template>
              <Button
                :icon="
                  h(Icon, {
                    icon: 'mdi:eye',
                    class: 'inline-block size-6',
                  })
                "
                class="mx-1"
                type="link"
                @click="handleView(row)"
              />
            </Tooltip>

            <!-- 编辑 -->
            <Tooltip v-if="author.includes('编辑')">
              <template #title>{{ $t('common.edit') }}</template>
              <Button
                :icon="
                  h(Icon, {
                    icon: 'mdi:pencil-outline',
                    class: 'inline-block size-6',
                  })
                "
                class="mx-1"
                type="link"
                @click="handleEdit(row)"
              />
            </Tooltip>

            <!-- 删除 -->
            <Tooltip v-if="author.includes('删除')">
              <template #title>{{ $t('common.delete') }}</template>
              <Button
                :icon="
                  h(Icon, {
                    icon: 'mdi:delete-outline',
                    class: 'inline-block size-6',
                  })
                "
                class="mx-1"
                danger
                type="link"
                @click="handleDelete(row)"
              />
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- region 查看 -->
    <Drawer
      v-model:open="showViewDrawer"
      :footer-style="{ textAlign: 'right' }"
      :title="$t('common.view')"
      :width="900"
      placement="right"
    >
      <Descriptions :column="2" bordered size="small">
        <DescriptionsItem
          :label="$t('storeManagement.lineSideWarehouseTask.taskCode')"
        >
          {{ viewData.taskCode || '-' }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('storeManagement.lineSideWarehouseTask.taskType')"
        >
          {{ viewTaskTypeText }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('storeManagement.lineSideWarehouseTask.formCode')"
        >
          {{ viewData.fromCode || '-' }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('storeManagement.lineSideWarehouseTask.taskState')"
        >
          {{ viewTaskStateText }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('storeManagement.lineSideWarehouseTask.taskOpUser')"
        >
          {{ viewData.taskOpUser || '-' }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('storeManagement.lineSideWarehouseTask.createTime')"
        >
          {{ formatTime(viewData.createTime) || '-' }}
        </DescriptionsItem>
      </Descriptions>


      <div>
        <DetailGrid>
          <template #table-title>
            <!-- 标签明细 -->
            <div class="!mt-4 !mb-2 text-2xl">
              {{ $t('storeManagement.lineSideWarehouseTask.detailTitle') }}
            </div>
          </template>
          <template #toolbar-tools></template>
          <template #detailState="{ row }">
            <Tag
              :color="
                row.state === 2
                  ? 'success'
                  : row.state === 1
                    ? 'processing'
                    : 'default'
              "
            >
              {{
                row.state === 2
                  ? $t('storeManagement.lineSideWarehouseTask.stateFinished')
                  : row.state === 1
                    ? $t('storeManagement.lineSideWarehouseTask.stateRunning')
                    : $t('storeManagement.lineSideWarehouseTask.statePendingReceive')
              }}
            </Tag>
          </template>
        </DetailGrid>
      </div>

      <template #footer>
        <Space>
          <Button @click="showViewDrawer = false">
            {{ $t('common.close') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->

    <!-- region 新增 / 编辑 -->
    <Drawer
      v-model:open="showEditDrawer"
      :footer-style="{ textAlign: 'right' }"
      :title="isEdit ? $t('common.edit') : $t('common.add')"
      :width="700"
      placement="right"
    >
      <Form
        ref="formRef"
        :label-col="{ span: 6 }"
        :model="formData"
        :rules="formRules"
        :wrapper-col="{ span: 18 }"
        autocomplete="off"
      >
        <!-- 任务类型 -->
        <FormItem
          :label="$t('storeManagement.lineSideWarehouseTask.taskType')"
          name="taskType"
        >
          <Select
            v-model:value="formData.taskType"
            :options="taskTypeOptions"
            :placeholder="
              $t('storeManagement.lineSideWarehouseTask.selectTaskType')
            "
          />
        </FormItem>
        <!-- 来源单号 -->
        <FormItem
          :label="$t('storeManagement.lineSideWarehouseTask.formCode')"
          name="formCode"
        >
          <Input v-model:value="formData.formCode" />
        </FormItem>
      </Form>

      <!-- 标签清单 -->
      <div class="!mb-2">
        {{ $t('storeManagement.lineSideWarehouseTask.labelList') }}
      </div>
      <div class="label-list">
        <!-- 表头 -->
        <div class="label-list__head">
          <span>
            {{ $t('storeManagement.lineSideWarehouseTask.labelCode') }}
          </span>
          <span>{{ $t('storeManagement.lineSideWarehouseTask.packageNumber') }}</span>
          <span>{{ $t('storeManagement.lineSideWarehouseTask.todoNumber') }}</span>
          <span class="text-center">{{ $t('baseInfo.action') }}</span>
        </div>

        <!-- 标签行 -->
        <div
          v-for="(label, index) in formData.labels"
          :key="index"
          class="label-list__row"
        >
          <!-- 标签编号：由标签选择抽屉回填，不允许手动修改 -->
          <Input :value="label.labelCode" disabled placeholder="-" />
          <!-- 标签数量：仅显示，取所选标签的包装数量 -->
          <Input :value="label.packageNumber" disabled placeholder="-" />
          <!-- 计划数量：下架可改，上架取标签数量且只读 -->
          <InputNumber
            v-model:value="label.number"
            :disabled="formData.taskType !== -1"
            :min="0"
            class="w-full"
            :placeholder="
              $t('storeManagement.lineSideWarehouseTask.todoNumber')
            "
          />
          <Space :size="0">
            <Tooltip>
              <template #title>
                {{
                  formData.taskType
                    ? $t('storeManagement.labelPrint.selectLabelTitle')
                    : $t('storeManagement.lineSideWarehouseTask.selectTaskType')
                }}
              </template>
              <span>
                <Button
                  :disabled="!formData.taskType"
                  :icon="
                    h(Icon, {
                      icon: 'mdi:tag-search-outline',
                      class: 'inline-block size-5',
                    })
                  "
                  type="link"
                  @click="openLabelSelect(index)"
                />
              </span>
            </Tooltip>
            <Tooltip>
              <template #title>{{ $t('common.delete') }}</template>
              <Button
                :icon="
                  h(Icon, {
                    icon: 'mdi:delete-outline',
                    class: 'inline-block size-5',
                  })
                "
                danger
                type="text"
                @click="removeLabel(index)"
              />
            </Tooltip>
          </Space>
        </div>

        <!-- 空状态 -->
        <div v-if="formData.labels.length === 0" class="label-list__empty">
          {{ $t('storeManagement.lineSideWarehouseTask.pleaseAddLabel') }}
        </div>
      </div>

      <Button
        :icon="
          h(Icon, {
            icon: 'mdi:plus',
            class: 'inline-block size-5',
          })
        "
        block
        class="!mt-3 !mb-4"
        type="dashed"
        @click="addLabel"
      >
        {{ $t('storeManagement.lineSideWarehouseTask.addLabel') }}
      </Button>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="onClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="submitForm">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->

    <!-- 标签选择抽屉 -->
    <LabelSelectDrawer ref="labelSelectRef" @select="handleLabelSelected" />
  </Page>
</template>

<style scoped>
/* 标签清单：带表头的紧凑编辑列表，颜色取全局主题变量以适配暗色模式 */
.label-list {
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.label-list__head,
.label-list__row {
  display: grid;
  grid-template-columns: 1fr 110px 110px 76px;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
}

.label-list__head {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--accent));
}

.label-list__row + .label-list__row {
  border-top: 1px dashed hsl(var(--border));
}

.label-list__row:hover {
  background: hsl(var(--accent) / 60%);
}

.label-list__empty {
  padding: 16px 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  text-align: center;
}
</style>
