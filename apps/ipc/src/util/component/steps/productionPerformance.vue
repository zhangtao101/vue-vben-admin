<script setup lang="ts">
import { reactive, ref } from 'vue';

import {
  Button,
  Col,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { addFinishRecord, getWorkLot, queryFinishRecord, removeFinishRecords } from '#/api';
import { $t } from '#/locales';

/**
 * 工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
defineProps({
  functionId: { type: Number, default: 0 },
  bindingId: { type: Number, default: 0 },
  worksheetCode: { type: String, default: '' },
  equipCode: { type: String, default: '' },
  workstationCode: { type: String, default: '' },
});

// region 1. 查询条件
const queryForm = reactive<any>({
  workSheetCode: '',
});

function handleQuery() {
  productionGridApi.reload();
  lotGridApi.reload();
}

function handleReset() {
  queryForm.workSheetCode = '';
  productionGridApi.reload();
  lotGridApi.reload();
}
// endregion

// region 2.1 左侧：子工单列表（getWorkLot，无需分页）
const lotGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { field: 'lotCode', title: $t('productionPerformance.colLotCode'), minWidth: 200 },
    { field: 'productName', title: $t('productionPerformance.colProductName'), minWidth: 160 },
    { field: 'productCode', title: $t('productionPerformance.colProductCode'), minWidth: 100 },
    { field: 'equipCode', title: $t('productionPerformance.colEquipCode'), minWidth: 120 },
  ],
  height: 360,
  stripe: true,
  pagerConfig: { enabled: false },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
  proxyConfig: {
    ajax: {
      query: () => {
        if (!queryForm.workSheetCode) {
          return Promise.resolve({ items: [] });
        }
        return getWorkLot(queryForm.workSheetCode).then((res: any) => ({
          items: Array.isArray(res) ? res : [],
        }));
      },
    },
  },
};

const [LotGrid, lotGridApi] = useVbenVxeGrid({ gridOptions: lotGridOptions });
// endregion

// region 2.2 右侧：完工记录列表（queryFinishRecord 分页查询）
const productionGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    { field: 'lotCode', title: $t('productionPerformance.colLotCode'), minWidth: 140 },
    { field: 'quity', title: $t('productionPerformance.colQuity'), minWidth: 100 },
    { field: 'unit', title: $t('productionPerformance.colUnit'), minWidth: 80 },
    { field: 'createTime', title: $t('productionPerformance.colCreateTime'), minWidth: 180 },
    {
      field: 'workSheetCode',
      title: $t('productionPerformance.colWorkSheetCode'),
      minWidth: 140,
    },
  ],
  height: 360,
  stripe: true,
  checkboxConfig: { trigger: 'row' },
  pagerConfig: { enabled: true, pageSize: 20 },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
  proxyConfig: {
    ajax: {
      query: ({ page }: any) => {
        return queryFinishRecord({
          workSheetCode: queryForm.workSheetCode || undefined,
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        }).then((res: any) => ({
          total: res?.total || 0,
          items: res?.list || [],
        }));
      },
    },
  },
};

const [ProductionGrid, productionGridApi] = useVbenVxeGrid({
  gridOptions: productionGridOptions,
});
// endregion

// region 3.1 业绩生成（addFinishRecord 抽屉）
const drawerVisible = ref(false);
const genFormRef = ref<any>();
const genForm = reactive<any>({
  lotCode: '',
  quity: undefined,
  unit: '',
});

const genRules = {
  lotCode: [{ required: true, message: $t('productionPerformance.lotCodePlaceholder') }],
  quity: [{ required: true, message: $t('productionPerformance.quityPlaceholder') }],
  unit: [{ required: true, message: $t('productionPerformance.unitPlaceholder') }],
};

function handleGenPerformance() {
  if (!queryForm.workSheetCode) {
    message.warning($t('productionPerformance.workSheetCodePlaceholder'));
    return;
  }
  // 左侧子工单列表仅作展示，LOT 代码在抽屉内填写
  genForm.lotCode = '';
  genForm.quity = undefined;
  genForm.unit = '';
  drawerVisible.value = true;
}

function handleGenSubmit() {
  genFormRef.value.validate().then(() => {
    addFinishRecord({
      lotCode: genForm.lotCode,
      quity: genForm.quity,
      unit: genForm.unit,
      workSheetCode: queryForm.workSheetCode,
    }).then(() => {
      message.success($t('productionPerformance.genSuccess'));
      drawerVisible.value = false;
      productionGridApi.reload();
    });
  });
}

/** 关闭抽屉：重置所有状态 */
function handleGenClose() {
  drawerVisible.value = false;
  genForm.lotCode = '';
  genForm.quity = undefined;
  genForm.unit = '';
}
// endregion

// region 3.2 业绩取消（removeFinishRecords 批量删除，需先勾选右侧完工记录）
function handleCancelPerformance() {
  const rows: any[] = productionGridApi.grid.getCheckboxRecords();
  if (rows.length === 0) {
    message.warning($t('productionPerformance.plsSelectLot'));
    return;
  }
  Modal.confirm({
    cancelText: $t('common.cancel'),
    content: $t('productionPerformance.cancelConfirm'),
    okText: $t('common.confirm'),
    okType: 'danger',
    onOk: () => {
      const ids = rows.map((row: any) => String(row.id));
      return removeFinishRecords(ids).then(() => {
        message.success($t('productionPerformance.cancelSuccess'));
        productionGridApi.reload();
      });
    },
  });
}
// endregion
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="text-lg font-bold">{{ $t('productionPerformance.title') }}</div>

    <!-- 1. 查询条件 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <Form
        layout="inline"
        :model="queryForm"
        class="flex flex-wrap items-end gap-2"
      >
        <FormItem :label="$t('productionPerformance.workSheetCode')">
          <Input
            v-model:value="queryForm.workSheetCode"
            :placeholder="$t('productionPerformance.workSheetCodePlaceholder')"
            allow-clear
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
    </div>

    <!-- 2. 左右两个区域 -->
    <Row :gutter="16">
      <!-- 2.1 左侧：子工单列表 -->
      <Col :xs="24" :lg="12">
        <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
          <div class="mb-2 font-bold">{{ $t('productionPerformance.lotList') }}</div>
          <LotGrid>
            <template #toolbar-tools></template>
          </LotGrid>
        </div>
      </Col>
      <!-- 2.2 右侧：完工记录列表 -->
      <Col :xs="24" :lg="12">
        <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
          <div class="mb-2 font-bold">{{ $t('productionPerformance.productionList') }}</div>
          <ProductionGrid>
            <template #toolbar-tools></template>
          </ProductionGrid>
        </div>
      </Col>
    </Row>

    <!-- 3. 按钮：业绩生成 / 业绩取消 -->
    <div class="flex justify-end gap-2">
      <Button type="primary" @click="handleGenPerformance">
        {{ $t('productionPerformance.genPerformance') }}
      </Button>
      <Button danger @click="handleCancelPerformance">
        {{ $t('productionPerformance.cancelPerformance') }}
      </Button>
    </div>

    <!-- 4. 业绩生成抽屉 -->
    <Drawer
      v-model:open="drawerVisible"
      :title="$t('productionPerformance.genTitle')"
      :width="500"
      :destroy-on-close="true"
      :footer-style="{ textAlign: 'right' }"
      @close="handleGenClose"
    >
      <Form
        ref="genFormRef"
        :model="genForm"
        :rules="genRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <!-- 工单号：外部查询条件，只读展示 -->
        <FormItem :label="$t('productionPerformance.workSheetCode')" name="workSheetCode">
          <Input :value="queryForm.workSheetCode" disabled />
        </FormItem>
        <FormItem :label="$t('productionPerformance.lotCode')" name="lotCode">
          <Input
            v-model:value="genForm.lotCode"
            :placeholder="$t('productionPerformance.lotCodePlaceholder')"
          />
        </FormItem>
        <FormItem :label="$t('productionPerformance.quity')" name="quity">
          <InputNumber
            v-model:value="genForm.quity"
            :min="0"
            :placeholder="$t('productionPerformance.quityPlaceholder')"
            style="width: 100%"
          />
        </FormItem>
        <FormItem :label="$t('productionPerformance.unit')" name="unit">
          <Input
            v-model:value="genForm.unit"
            :placeholder="$t('productionPerformance.unitPlaceholder')"
          />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <Button @click="handleGenClose">{{ $t('common.cancel') }}</Button>
          <Button type="primary" @click="handleGenSubmit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </div>
</template>
