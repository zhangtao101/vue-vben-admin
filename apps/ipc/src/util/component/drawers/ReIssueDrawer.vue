<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue';

import { $t } from '@vben/locales';

import { SearchOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  RangePicker,
  Space,
  Tooltip,
} from 'ant-design-vue';

import {
  useVbenVxeGrid,
  type VxeGridListeners,
  type VxeGridProps,
} from '#/adapter/vxe-table';
import { selectIssue, selectMaterial } from '#/api';

defineOptions({ name: 'ReIssueDrawer' });

/** 抽屉显隐 */
const show = ref(false);

// region 查询条件
const queryParams = reactive({
  planDateRange: [] as any,
  startTime: undefined as string | undefined,
  endTime: undefined as string | undefined,
  lineCode: undefined as string | undefined,
  productCode: undefined as string | undefined,
  workSheetCode: undefined as string | undefined,
});

/** 查询参数格式化：拆出时间范围并剔除空值 */
function formatQueryParams() {
  const params: any = { ...queryParams };
  // 处理时间范围查询
  if (params.planDateRange && params.planDateRange.length === 2) {
    params.startTime = params.planDateRange[0];
    params.endTime = params.planDateRange[1];
  }
  delete params.planDateRange;
  // 剔除空值字段
  Object.keys(params).forEach((key) => {
    if (
      params[key] === undefined ||
      params[key] === '' ||
      params[key] === null
    ) {
      delete params[key];
    }
  });
  return params;
}
// endregion

// region 已发行托盘列表
const gridEvents: VxeGridListeners<any> = {
  checkboxChange: () => {},
};

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50, title: '', fixed: 'left' },
    {
      field: 'operation',
      title: $t('reIssue.operation'),
      width: 90,
      slots: { default: 'operation' },
      fixed: 'left',
    },
    { field: 'lotCode', title: $t('reIssue.lotCode'), minWidth: 120 },
    { field: 'palletLabel', title: $t('reIssue.palletLabel'), minWidth: 140 },
    { field: 'productCode', title: $t('reIssue.productCode'), minWidth: 120 },
    { field: 'productName', title: $t('reIssue.productName'), minWidth: 140 },
    { field: 'lineCode', title: $t('reIssue.lineCode'), minWidth: 100 },
    { field: 'planDate', title: $t('reIssue.planDate'), minWidth: 120 },
  ],
  height: 420,
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
  proxyConfig: {
    ajax: {
      query: queryGridList,
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/** 查询已发行的托盘列表 */
async function queryGridList({ page }: any) {
  const res = await selectIssue({
    ...formatQueryParams(),
    pageNum: page.currentPage,
    pageSize: page.pageSize,
  });
  return { total: res.total, items: res.list };
}

function handleQuery() {
  gridApi.reload();
}

function handleReset() {
  queryParams.planDateRange = [];
  queryParams.startTime = undefined;
  queryParams.endTime = undefined;
  queryParams.lineCode = undefined;
  queryParams.productCode = undefined;
  queryParams.workSheetCode = undefined;
  handleQuery();
}
// endregion

// region 详情：查询 lot 下对应托盘类型的材料
const detailVisible = ref(false);
/** 当前查看详情的行数据（用于顶部 Descriptions 展示） */
const detailRow = ref<any>({});

const detailGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  height: 320,
  stripe: true,
  columns: [
    { field: 'materialCode', title: $t('reIssue.materialCode'), minWidth: 140 },
    { field: 'materialName', title: $t('reIssue.materialName'), minWidth: 200 },
    { field: 'issueWt', title: $t('reIssue.issueWt'), minWidth: 120 },
    { field: 'unit', title: $t('reIssue.unit'), minWidth: 80 },
  ],
  pagerConfig: { enabled: false },
  proxyConfig: {
    ajax: {
      query: queryDetailList,
    },
  },
};

const [DetailGrid, detailGridApi] = useVbenVxeGrid({
  gridOptions: detailGridOptions,
});

/** 查询详情：lot 下对应托盘类型的材料 */
async function queryDetailList() {
  try {
    const res = await selectMaterial({
      lotId: detailRow.value.lotId,
      packType: detailRow.value.packType,
    });
    const items = Array.isArray(res) ? res : res?.list || [];
    return { total: items.length, items };
  } catch {
    message.error($t('reIssue.detailFailed'));
    return { total: 0, items: [] };
  }
}

/** 查看详情：打开抽屉并加载对应材料列表 */
function handleViewDetail(row: any) {
  detailRow.value = row;
  detailVisible.value = true;
  nextTick(() => {
    detailGridApi.reload();
  });
}
// endregion

// region 打开 / 关闭
function open() {
  show.value = true;
  nextTick(() => {
    gridApi.reload();
  });
}

/** 重新发行（功能预留，后续实现） */
function handleReIssue() {
  // TODO: 后续实现重新发行
}

function handleClose() {
  show.value = false;
  gridApi.grid?.clearCheckboxRow();
}

defineExpose({ open });
// endregion
</script>

<template>
  <Drawer
    v-model:open="show"
    :title="$t('reIssue.title')"
    placement="top"
    height="70%"
    :closable="false"
    :mask-closable="false"
  >
    <!-- 查询条件 -->
    <Form layout="inline" class="mb-3 flex-wrap items-end gap-2">
      <FormItem :label="$t('reIssue.planDate')">
        <RangePicker
          v-model:value="queryParams.planDateRange"
          value-format="YYYY-MM-DD"
        />
      </FormItem>
      <FormItem :label="$t('reIssue.lineCode')">
        <Input
          v-model:value="queryParams.lineCode"
          allow-clear
          class="w-40"
          @press-enter="handleQuery"
        />
      </FormItem>
      <FormItem :label="$t('reIssue.productCode')">
        <Input
          v-model:value="queryParams.productCode"
          allow-clear
          class="w-40"
          @press-enter="handleQuery"
        />
      </FormItem>
      <FormItem :label="$t('reIssue.workSheetCode')">
        <Input
          v-model:value="queryParams.workSheetCode"
          allow-clear
          class="w-40"
          @press-enter="handleQuery"
        />
      </FormItem>
      <FormItem>
        <Space>
          <Button type="primary" @click="handleQuery">
            {{ $t('common.query') }}
          </Button>
          <Button @click="handleReset">{{ $t('common.reset') }}</Button>
        </Space>
      </FormItem>
    </Form>

    <div>
      <!-- 已发行托盘列表 -->
      <Grid>
        <template #toolbar-tools></template>
        <template #operation="{ row }">
          <Tooltip :title="$t('reIssue.detail')">
            <Button type="link" size="small" @click="handleViewDetail(row)">
              <SearchOutlined />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex justify-end">
        <Space>
          <Button type="primary" @click="handleReIssue">
            {{ $t('reIssue.reIssue') }}
          </Button>
          <Button @click="handleClose">{{ $t('common.cancel') }}</Button>
        </Space>
      </div>
    </template>

    <!-- 材料详情 -->
    <Modal
      v-model:open="detailVisible"
      :title="$t('reIssue.materialList')"
      width="700"
      :footer="null"
      :mask-closable="false"
    >
      <Descriptions bordered :column="2" size="small" class="mb-4!">
        <DescriptionsItem :label="$t('reIssue.lotCode')">
          {{ detailRow.lotCode || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('reIssue.palletLabel')">
          {{ detailRow.palletLabel || '-' }}
        </DescriptionsItem>
      </Descriptions>
      <DetailGrid />
    </Modal>
  </Drawer>
</template>
