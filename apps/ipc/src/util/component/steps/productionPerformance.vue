<script setup lang="ts">
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, reactive, ref } from 'vue';

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
  Select,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addFinishRecord,
  getWorkLot,
  queryFinishRecord,
  removeFinishRecords,
  selectWorkSheet,
} from '#/api';
import { $t } from '#/locales';

/**
 * 工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
defineProps({
  functionId: { type: Number, default: 0 },
  workstationCode: { type: String, default: '' },
  /** 工序编号，由外部传入 */
  processCode: { type: String, default: '' },
});

// region 1. 查询条件
const queryForm = reactive<any>({
  workSheetCode: '',
});

/** 工单下拉选项（selectWorkSheet，包装工序 processType 固定为 4） */
const workSheetOptions = ref<{ label: string; value: string }[]>([]);

/** 加载工单下拉选项：仅按 processType=4 查询，页面加载时执行一次 */
function loadWorkSheetOptions() {
  return selectWorkSheet({ processType: 4 }).then((res: any) => {
    const list = res?.list ?? [];
    workSheetOptions.value = list
      .map((item: any) => item?.workSheetCode)
      .filter((code: any) => !!code)
      .map((code: string) => ({ label: code, value: code }));
  });
}

onMounted(() => {
  loadWorkSheetOptions();
});

function handleQuery() {
  // 重新查询时清空左侧选中，右侧未选中则不再请求数据
  selectedLot.value = null;
  productionGridApi.reload();
  lotGridApi.reload();
}

function handleReset() {
  queryForm.workSheetCode = '';
  // 重置时同样清空左侧选中
  selectedLot.value = null;
  productionGridApi.reload();
  lotGridApi.reload();
}
// endregion

// region 2.1 左侧：子工单列表（getWorkLot，无需分页）
/** 左侧单选中的子工单行，右侧完工记录按其 equipCode 查询 */
const selectedLot = ref<any>(null);

const lotGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50, radioConfig: { trigger: 'row' } } as any,
    {
      field: 'lotCode',
      title: $t('productionPerformance.colLotCode'),
      minWidth: 200,
    },
    {
      field: 'productName',
      title: $t('productionPerformance.colProductName'),
      minWidth: 160,
    },
    {
      field: 'productCode',
      title: $t('productionPerformance.colProductCode'),
      minWidth: 100,
    },
    {
      field: 'equipCode',
      title: $t('productionPerformance.colEquipCode'),
      minWidth: 120,
    },
  ],
  height: 360,
  stripe: true,
  pagerConfig: { enabled: false },
  radioConfig: { highlight: true, trigger: 'row' },
  rowConfig: { isHover: true },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
  proxyConfig: {
    ajax: {
      query: () => {
        // 左侧列表重新加载后原选中行失效，清空选中并同步刷新右侧
        selectedLot.value = null;
        productionGridApi.reload();
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

/** 表格事件：左侧单选子工单后，按其 equipCode 刷新右侧完工记录 */
const lotGridEvents: VxeGridListeners<any> = {
  radioChange: ({ row }: any) => {
    selectedLot.value = row ?? null;
    productionGridApi.reload();
  },
};

const [LotGrid, lotGridApi] = useVbenVxeGrid({
  gridEvents: lotGridEvents,
  gridOptions: lotGridOptions,
});
// endregion

// region 2.2 右侧：完工记录列表（queryFinishRecord 分页查询）
const productionGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    {
      field: 'lotCode',
      title: $t('productionPerformance.colLotCode'),
      minWidth: 140,
    },
    {
      field: 'quity',
      title: $t('productionPerformance.colQuity'),
      minWidth: 100,
    },
    { field: 'unit', title: $t('productionPerformance.colUnit'), minWidth: 80 },
    {
      field: 'createTime',
      title: $t('productionPerformance.colCreateTime'),
      minWidth: 180,
    },
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
        // 左侧未选中子工单时，右侧直接返回空列表
        if (!selectedLot.value) {
          return Promise.resolve({ items: [], total: 0 });
        }
        return queryFinishRecord({
          equipcode: selectedLot.value.equipCode || undefined,
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
  lotCode: [
    { required: true, message: $t('productionPerformance.lotCodePlaceholder') },
  ],
  quity: [
    { required: true, message: $t('productionPerformance.quityPlaceholder') },
  ],
  unit: [
    { required: true, message: $t('productionPerformance.unitPlaceholder') },
  ],
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
          <Select
            v-model:value="queryForm.workSheetCode"
            :options="workSheetOptions"
            :placeholder="$t('productionPerformance.workSheetCodePlaceholder')"
            allow-clear
            show-search
            option-filter-prop="label"
            class="w-56!"
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
          <div class="mb-2 font-bold">
            {{ $t('productionPerformance.lotList') }}
          </div>
          <LotGrid>
            <template #toolbar-tools></template>
          </LotGrid>
        </div>
      </Col>
      <!-- 2.2 右侧：完工记录列表 -->
      <Col :xs="24" :lg="12">
        <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
          <div class="mb-2 font-bold">
            {{ $t('productionPerformance.productionList') }}
          </div>
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
        <FormItem
          :label="$t('productionPerformance.workSheetCode')"
          name="workSheetCode"
        >
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
