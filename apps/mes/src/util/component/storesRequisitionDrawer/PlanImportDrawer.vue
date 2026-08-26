<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Button, Card, Col, Drawer, FormItem, Input, Row, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { smtWorksheetSearch } from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'PlanImportDrawer',
});

const emit = defineEmits<{
  select: [row: any];
}>();

// 抽屉可见性（内部管理）
const show = ref(false);

// 查询参数
const queryParams = ref({
  workSheetCode: '',
  productCode: '',
  productName: '',
});

// 排序：1-正序，2-倒序
const isAsc = ref(1);

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 60 },
    { type: 'seq', width: 60, title: '序号' },
    {
      field: 'workSheetCode',
      minWidth: 150,
      title: $t('SMTmanagement.workOrderNumber'),
    },
    {
      field: 'productName',
      minWidth: 200,
      showOverflow: true,
      title: $t('SMTmanagement.productName'),
    },
    {
      field: 'productCode',
      minWidth: 100,
      title: $t('SMTmanagement.productNumber'),
    },
    {
      field: 'planDateStart',
      minWidth: 130,
      title: $t('SMTmanagement.plannedTime'),
    },
    {
      field: 'planDateStop',
      minWidth: 130,
      title: $t('SMTmanagement.planDateStop'),
    },
    {
      field: 'planCode',
      minWidth: 150,
      title: $t('SMTmanagement.planNumber'),
    },
    {
      field: 'lineName',
      minWidth: 110,
      title: $t('SMTmanagement.taskLine'),
    },
    {
      field: 'produceWorkshop',
      minWidth: 100,
      title: $t('SMTmanagement.produceWorkshop'),
    },
  ],
  height: 400,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  radioConfig: {
    trigger: 'row',
  },
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents: {}, gridOptions });

// ========== open 方法（暴露给父组件） ==========
function open() {
  show.value = true;
  const grid = (gridApi as any).grid;
  if (grid && grid.clearRadioRow) {
    grid.clearRadioRow();
  }
}

defineExpose({ open });

// ========== 数据查询 ==========
function queryData({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) {
  return new Promise((resolve) => {
    const params = {
      ...queryParams.value,
      pageNum,
      pageSize,
      isAsc: isAsc.value ? 1 : 2,
    };

    smtWorksheetSearch(params)
      .then((res: any) => {
        resolve({
          total: res.total || 0,
          items: res.list || res.results || [],
        });
      })
      .catch(() => {
        resolve({
          total: 0,
          items: [],
        });
      });
  });
}

// ========== 查询 ==========
function handleQuery() {
  gridApi.reload();
}

// ========== 重置 ==========
function handleReset() {
  queryParams.value = {
    workSheetCode: '',
    productCode: '',
    productName: '',
  };
  gridApi.reload();
}

// ========== 关闭抽屉 ==========
function handleClose() {

  queryParams.value = {
    workSheetCode: '',
    productCode: '',
    productName: '',
  };
  show.value = false;
}

// ========== 确认选择 ==========
function handleConfirm() {
  const grid = (gridApi as any).grid;
  const radioRecord = grid.getRadioRecord();
  if (!radioRecord) {
    return;
  }
  emit('select', radioRecord);
  handleClose();
}
</script>

<template>
  <Drawer
    v-model:open="show"
    title="计划导入"
    :width="900"
    :destroy-on-close="true"
    :footer-style="{ textAlign: 'right' }"
    @close="handleClose"
  >
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Row :gutter="16" align="middle">
        <Col :span="5">
          <FormItem label="工单号" class="!mb-0">
            <Input
              v-model:value="queryParams.workSheetCode"
              placeholder="请输入工单号"
              allow-clear
              @press-enter="handleQuery"
            />
          </FormItem>
        </Col>
        <Col :span="5">
          <FormItem label="产品编码" class="!mb-0">
            <Input
              v-model:value="queryParams.productCode"
              placeholder="请输入产品编码"
              allow-clear
              @press-enter="handleQuery"
            />
          </FormItem>
        </Col>
        <Col :span="5">
          <FormItem label="产品名称" class="!mb-0">
            <Input
              v-model:value="queryParams.productName"
              placeholder="请输入产品名称"
              allow-clear
              @press-enter="handleQuery"
            />
          </FormItem>
        </Col>
        <Col :span="4">
          <Space>
            <Button @click="handleReset">重置</Button>
            <Button type="primary" @click="handleQuery">查询</Button>
          </Space>
        </Col>
      </Row>
    </Card>

    <!-- 表格区域 -->
    <div>
      <Grid />
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <Space class="w-full justify-end">
        <Button @click="handleClose">
          {{ $t('common.cancel') }}
        </Button>
        <Button type="primary" @click="handleConfirm">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
