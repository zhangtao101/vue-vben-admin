<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref, watch } from 'vue';

import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteQcRecord,
  exportQcRecord,
  fetchRecordList,
  submitQcAudit,
} from '#/api';

import QualityItemsDrawer from './QualityItemsDrawer.vue';

// Props
interface Props {
  visible?: boolean;
  formData?: any;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

// 抽屉可见性
const drawerVisible = ref(false);

// 查询参数
const queryParams = ref<any>({
  recordCode: '',
  worksheetCode: '',
  productCode: '',
  productName: '',
  planCode: '',
  subProductCode: '',
  auditType: undefined,
  checkStartTime: '',
  checkEndTime: '',
});

const dateRange = ref<any>(null);

// 审核状态选项
const auditTypeOptions = [
  { value: 0, label: '编辑中' },
  { value: 1, label: '已提交' },
  { value: 2, label: '审核通过' },
  { value: 3, label: '审核不通过' },
];

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns: [
    {
      field: 'recordCode',
      title: $t('qualityModule.qualityCheck.qualityEntering.recordCode'),
      width: 120,
      sortable: true,
    },
    {
      field: 'productCode',
      title: $t('qualityModule.qualityCheck.qualityEntering.productCode'),
      width: 110,
    },
    {
      field: 'productName',
      title: $t('qualityModule.qualityCheck.qualityEntering.productName'),
      minWidth: 150,
      showOverflow: 'tooltip',
    },
    {
      field: 'planCode',
      title: $t('qualityModule.qualityCheck.qualityEntering.planCode'),
      width: 110,
    },
    {
      field: 'subProductCode',
      title: $t('qualityModule.qualityCheck.qualityEntering.subProductCode'),
      width: 110,
    },
    {
      field: 'worksheetCode',
      title: $t('qualityModule.qualityCheck.qualityEntering.worksheetCode'),
      width: 110,
    },
    {
      field: 'checkTime',
      title: $t('qualityModule.qualityCheck.qualityEntering.checkTime'),
      width: 160,
    },
    {
      field: 'judgeResult',
      title: $t('qualityModule.qualityCheck.qualityEntering.judgeResult'),
      width: 100,
    },
    {
      field: 'sendNumber',
      title: $t('qualityModule.qualityCheck.qualityEntering.sendNumber'),
      width: 100,
    },
    {
      field: 'preparationNumber',
      title: $t('qualityModule.qualityCheck.qualityEntering.preparationNumber'),
      width: 100,
    },
    {
      field: 'qualifiedNumber',
      title: $t('qualityModule.qualityCheck.qualityEntering.qualifiedNumber'),
      width: 130,
      slots: { default: 'qualifiedNumber' },
    },
    {
      field: 'recordStatus',
      title: $t('qualityModule.qualityCheck.qualityEntering.recordStatus'),
      width: 100,
      slots: { default: 'recordStatus' },
    },
    {
      field: 'auditType',
      title: $t('qualityModule.qualityCheck.qualityEntering.auditType'),
      width: 100,
      slots: { default: 'auditType' },
    },
    {
      field: 'operateUserName',
      title: $t('qualityModule.qualityCheck.qualityEntering.operateUserName'),
      width: 90,
    },
    {
      field: 'operateTime',
      title: $t('qualityModule.qualityCheck.qualityEntering.operateTime'),
      width: 160,
    },
    {
      field: 'dataAction',
      title: $t('qualityModule.qualityCheck.qualityEntering.dataAction'),
      width: 120,
      fixed: 'right',
      slots: { default: 'dataAction' },
    },
    {
      field: 'formAction',
      title: $t('qualityModule.qualityCheck.qualityEntering.formAction'),
      width: 240,
      fixed: 'right',
      slots: { default: 'formAction' },
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 50,
    pageSizes: [10, 20, 50, 100],
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
  rowConfig: {
    keyField: 'id',
  },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// 记录表单抽屉
const recordFormVisible = ref(false);
const recordFormStatus = ref<'create' | 'enter' | 'update' | 'view'>('create');
const currentRecord = ref<any>(null);

// 质检项表格抽屉
const itemsDrawerVisible = ref(false);
const itemsDrawerStatus = ref<'enter' | 'view'>('view');
const currentItemsRecord = ref<any>(null);

// 表单保存成功
function handleFormSuccess() {
  gridApi.reload();
}

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    drawerVisible.value = val;
    if (val && props.formData) {
      initDefaultDate();
    }
  },
);

// 监听drawerVisible变化
watch(drawerVisible, (val) => {
  emit('update:visible', val);
});

// 初始化默认日期（当月）
function initDefaultDate() {
  const now = dayjs();
  const startDate = now.startOf('month');
  const endDate = now.endOf('month');
  dateRange.value = [startDate, endDate];
  queryParams.value.checkStartTime = startDate.format('YYYY-MM-DD');
  queryParams.value.checkEndTime = endDate.format('YYYY-MM-DD');
}

/**
 * 查询数据
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    if (!props.formData) {
      resolve({ total: 0, items: [] });
      return;
    }

    const params = {
      ...queryParams.value,
      formCode: props.formData.formCode,
      pageNum: page,
      pageSize,
    };

    fetchRecordList(params)
      .then(({ total, results }: any) => {
        // 处理按钮权限
        const list = results.map((item: any) => {
          // 根据审核状态设置按钮禁用状态
          const isAudited = [1, 2, 3].includes(item.auditType);
          return {
            ...item,
            showEnter: !isAudited, // 录入
            showEdit: !isAudited, // 编辑
            showDelete: !isAudited, // 删除
            showSubmit: !isAudited, // 提交审核
          };
        });

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

// 日期范围变化
function handleDateChange(_dates: any, dateStrings: [string, string]) {
  if (dateStrings && dateStrings[0] && dateStrings[1]) {
    queryParams.value.checkStartTime = dateStrings[0];
    queryParams.value.checkEndTime = dateStrings[1];
  } else {
    queryParams.value.checkStartTime = '';
    queryParams.value.checkEndTime = '';
  }
}

// 查询
function handleQuery() {
  gridApi.reload();
}

// 新增
function handleAdd() {
  recordFormStatus.value = 'create';
  currentRecord.value = null;
  recordFormVisible.value = true;
}

// 导出
function handleExport() {
  const params = {
    ...queryParams.value,
    formCode: props.formData?.formCode,
  };
  exportQcRecord(params).then((res: any) => {
    if (res) {
      window.location.href = res;
      message.success($t('common.successfulOperation'));
    }
  });
}

// 查看
function handleView(row: any) {
  itemsDrawerStatus.value = 'view';
  currentItemsRecord.value = row;
  itemsDrawerVisible.value = true;
}

// 录入
function handleEnter(row: any) {
  itemsDrawerStatus.value = 'enter';
  currentItemsRecord.value = row;
  itemsDrawerVisible.value = true;
}

// 编辑
function handleEdit(row: any) {
  recordFormStatus.value = 'update';
  currentRecord.value = row;
  recordFormVisible.value = true;
}

// 删除
function handleDelete(row: any) {
  Modal.confirm({
    title: $t('common.prompt'),
    content: '该操作不可撤销，是否确认删除?',
    onOk: () => {
      deleteQcRecord(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
  });
}

// 提交审核
function handleSubmit(row: any) {
  Modal.confirm({
    title: $t('common.prompt'),
    content: '已录入完毕，并可提交审核么?',
    onOk: () => {
      submitQcAudit(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
  });
}

// 关闭
function handleClose() {
  drawerVisible.value = false;
}
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :title="
      formData?.formName ||
      $t('qualityModule.qualityCheck.qualityEntering.title')
    "
    width="90%"
    :footer-style="{ textAlign: 'right' }"
  >
    <!-- 搜索 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <FormItem
          :label="$t('qualityModule.qualityCheck.qualityEntering.dateRange')"
        >
          <DatePicker.RangePicker
            v-model:value="dateRange"
            style="width: 260px"
            @change="handleDateChange"
          />
        </FormItem>
        <FormItem
          :label="$t('qualityModule.qualityCheck.qualityEntering.recordCode')"
        >
          <Input
            v-model:value="queryParams.recordCode"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="
            $t('qualityModule.qualityCheck.qualityEntering.worksheetCode')
          "
        >
          <Input
            v-model:value="queryParams.worksheetCode"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('qualityModule.qualityCheck.qualityEntering.productCode')"
        >
          <Input
            v-model:value="queryParams.productCode"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('qualityModule.qualityCheck.qualityEntering.productName')"
        >
          <Input
            v-model:value="queryParams.productName"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('qualityModule.qualityCheck.qualityEntering.planCode')"
        >
          <Input
            v-model:value="queryParams.planCode"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="
            $t('qualityModule.qualityCheck.qualityEntering.subProductCode')
          "
        >
          <Input
            v-model:value="queryParams.subProductCode"
            :placeholder="$t('common.pleaseEnter')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('qualityModule.qualityCheck.qualityEntering.auditType')"
        >
          <Select
            v-model:value="queryParams.auditType"
            :placeholder="$t('common.pleaseSelect')"
            style="width: 150px"
            :options="auditTypeOptions"
            allow-clear
          />
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleQuery">
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <Space>
            <Button type="primary" @click="handleAdd">
              {{ $t('common.add') }}
            </Button>
            <Button type="primary" @click="handleExport">
              {{ $t('common.export') }}
            </Button>
          </Space>
        </template>
        <template #qualifiedNumber="{ row }">
          {{ row.qualifiedNumber || 0 }}/{{ row.disqualifiedNumber || 0 }}
        </template>
        <template #recordStatus="{ row }">
          <span v-if="row.recordStatus === 1">{{ row.recordStatusName }}</span>
          <span v-else-if="row.recordStatus === 2" style="color: #ff8c00">
            {{ row.recordStatusName }}
          </span>
        </template>
        <template #auditType="{ row }">
          <span v-if="row.auditType === 0">编辑中</span>
          <span v-else-if="row.auditType === 1">已提交</span>
          <span v-else-if="row.auditType === 2" style="color: #1e90ff">
            审核通过
          </span>
          <span v-else-if="row.auditType === 3" style="color: #ff4500">
            审核不通过
          </span>
        </template>
        <template #dataAction="{ row }">
          <Space>
            <Tooltip>
              <template #title>{{ $t('common.view') }}</template>
              <Button type="link" class="px-1" @click="handleView(row)">
                <Icon
                  icon="mdi:eye"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="row.showEnter">
              <template #title>
                {{ $t('qualityModule.qualityCheck.qualityEntering.enter') }}
              </template>

              <Button type="link" class="px-1" @click="handleEnter(row)">
                <Icon
                  icon="mdi:pencil"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
        <template #formAction="{ row }">
          <Space>
            <Tooltip v-if="row.showEdit">
              <template #title>{{ $t('common.edit') }}</template>
              <Button type="link" class="px-1" @click="handleEdit(row)">
                <Icon
                  icon="mdi:pencil"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="row.showDelete">
              <template #title>{{ $t('common.delete') }}</template>
              <Button
                type="link"
                class="px-1"
                style="color: #ff4d4f"
                @click="handleDelete(row)"
              >
                <Icon
                  icon="mdi:delete"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="row.showSubmit">
              <template #title>提交审核</template>
              <Button type="link" class="px-1" @click="handleSubmit(row)">
                <Icon
                  icon="mdi:check"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <template #footer>
      <Button @click="handleClose">
        {{ $t('common.close') }}
      </Button>
    </template>

    <!-- 质检项表格抽屉 -->
    <QualityItemsDrawer
      v-model:visible="itemsDrawerVisible"
      :status="itemsDrawerStatus"
      :record-data="currentItemsRecord"
      @success="handleFormSuccess"
    />
  </Drawer>
</template>
