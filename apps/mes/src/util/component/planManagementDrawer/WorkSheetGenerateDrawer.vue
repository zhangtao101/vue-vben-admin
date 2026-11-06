<script lang="ts" setup>
/**
 * [INPUT]: 依赖 #/api (querySapWorkSheetList/querySubLineBySapWorkSheet/equipListByParentSubLineCode/
 *         generateWorkSheet)、#/util/component (materialSelection)、#/adapter/vxe-table (useVbenVxeGrid)、#/locales ($t)
 * [OUTPUT]: 对外提供 WorkSheetGenerateDrawer 抽屉组件，通过 defineExpose({ open }) 暴露 open(processType) 方法供父组件调用
 * [POS]: 属于 planManagement 包装工单管理页面的「工单生成」抽屉子组件，勾选 SAP 工单变更时按单别与勾选 ID 查询系统子产线
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-11-06 00:00:00
 */
import type { Rule } from 'ant-design-vue/es/form';

import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import {
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  RangePicker,
  Row,
  Select,
  Space,
} from 'ant-design-vue';
import dayjs from 'dayjs';
// eslint-disable-next-line n/no-extraneous-import
import { debounce } from 'lodash-es';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  equipListByParentSubLineCode,
  generateWorkSheet,
  querySapWorkSheetList,
  querySubLineBySapWorkSheet,
} from '#/api';
import { $t } from '#/locales';

import MaterialSelection from '../materialSelection.vue';
import DateCodeSelectDrawer from './DateCodeSelectDrawer.vue';

defineOptions({ name: 'WorkSheetGenerateDrawer' });

const emit = defineEmits<{
  refresh: [];
}>();

// region 状态管理
const show = ref(false);
const generateLoading = ref(false);
/** 单别（processType），由父组件通过 open 传入 */
const processType = ref<number>();

/** 仅该单别下该项为堆垛机，其余单别统一显示为设备 */
const STACKER_PROCESS_TYPE = 4;

/** 不显示批次印字编号且设备项非必填的单别（5蔬菜包装工单、6无重力搅拌工单） */
const NON_BATCH_PRINT_PROCESS_TYPES = [5, 6];

/** 当前单别下是否显示堆垛机 */
const isStackerProcess = computed(
  () => processType.value === STACKER_PROCESS_TYPE,
);

/** 当前单别下是否显示批次印字编号（5/6 单别不显示） */
const showBatchPrint = computed(
  () => !NON_BATCH_PRINT_PROCESS_TYPES.includes(processType.value as number),
);

/** 当前单别下批次印字编号是否必填（仅包装工单必填） */
const isBatchPrintRequired = computed(
  () => processType.value === STACKER_PROCESS_TYPE,
);

/** 当前单别下设备项是否必填（5/6 单别非必填） */
const isEquipRequired = computed(
  () => !NON_BATCH_PRINT_PROCESS_TYPES.includes(processType.value as number),
);

/** 当前单别下是否显示设备项（5 蔬菜包装、6 无重力搅拌不显示） */
const showEquip = computed(
  () => !NON_BATCH_PRINT_PROCESS_TYPES.includes(processType.value as number),
);

/** 产线设备项标签：堆垛机单别显示「堆垛机」，其余显示「设备」 */
const equipLabel = computed(() =>
  isStackerProcess.value
    ? $t('packingWorkOrderManage.stacker')
    : $t('packingWorkOrderManage.equipment'),
);

/** 产线设备项占位提示 */
const equipPlaceholder = computed(() =>
  isStackerProcess.value
    ? $t('packingWorkOrderManage.stackerPlaceholder')
    : $t('packingWorkOrderManage.equipmentPlaceholder'),
);

/** SAP 计划列表查询条件 */
const queryParams = ref<any>({
  produceDateRange: [],
  instructionSequenceCode: undefined,
  lineCode: undefined,
  planCode: undefined,
  productCode: undefined,
  sapOrderCode: undefined,
});

/** 工单生成表单校验规则（设备项提示随单别切换为堆垛机/设备） */
const generateFormRules = computed<Record<string, Rule[]>>(() => ({
  instructionDate: [
    {
      message: $t('packingWorkOrderManage.pleaseSelectInstructionDate'),
      required: true,
      trigger: 'change',
    },
  ],
  lineId: [
    {
      message: $t('packingWorkOrderManage.pleaseSelectLine'),
      required: true,
      trigger: 'change',
    },
  ],
  stackerId: [
    {
      message: isStackerProcess.value
        ? $t('packingWorkOrderManage.pleaseSelectStacker')
        : $t('packingWorkOrderManage.pleaseSelectEquipment'),
      required: isEquipRequired.value,
      trigger: 'change',
    },
  ],
  batchPrint: [
    {
      message: $t('packingWorkOrderManage.pleaseSelectBatchPrint'),
      required: isBatchPrintRequired.value,
      trigger: 'change',
    },
  ],
}));

/** 工单生成表单实例 */
const generateFormRef = ref();

/** 工单生成基本信息表单 */
const generateForm = ref<any>({
  batchPrint: '',
  instructionDate: undefined,
  lineCode: '',
  lineId: undefined,
  lineName: '',
  /** 产线回显文本，格式 lineCode(lineName) */
  linetitle: '',
  priority: 1,
  stackerId: undefined,
});

/**
 * 堆垛机下拉选项
 * 无初始值，产线确定后由 equipListByParentSubLineCode 按子产线编号加载
 */
const stackerOptions = ref<{ label: string; value: string }[]>([]);
/** 表格已勾选行 */
const selectedRows = ref<any[]>([]);
// endregion

// region 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: { highlight: true, reserve: true, trigger: 'row' },
  rowConfig: { keyField: 'id' },
  columns: [
    { type: 'checkbox', width: 50, fixed: 'left' },
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    {
      field: 'instructionDate',
      title: $t('packingWorkOrderManage.instructionDate'),
      minWidth: 130,
    },
    {
      field: 'instructionSequenceCode',
      title: $t('packingWorkOrderManage.instructionSequenceCode'),
      minWidth: 150,
    },
    {
      field: 'sapOrderCode',
      title: $t('packingWorkOrderManage.sapOrderCode'),
      minWidth: 140,
    },
    {
      field: 'planCode',
      title: $t('packingWorkOrderManage.planCode'),
      minWidth: 160,
    },
    {
      field: 'lineCode',
      title: $t('packingWorkOrderManage.lineCode'),
      minWidth: 120,
    },
    {
      field: 'productCode',
      title: $t('packingWorkOrderManage.productCode'),
      minWidth: 120,
    },
    {
      field: 'productName',
      title: $t('packingWorkOrderManage.productName'),
      minWidth: 160,
    },
    {
      field: 'instructionQty',
      title: $t('packingWorkOrderManage.instructionQty'),
      minWidth: 120,
    },
    { field: 'unit', title: $t('packingWorkOrderManage.unit'), minWidth: 80 },
    {
      field: 'salesPoNo',
      title: $t('packingWorkOrderManage.salesPoNo'),
      minWidth: 150,
    },
    {
      field: 'deliverPlaceName',
      title: $t('packingWorkOrderManage.deliverPlaceName'),
      minWidth: 130,
    },
    {
      field: 'batchNo',
      title: $t('packingWorkOrderManage.batchNo'),
      minWidth: 120,
    },
    {
      field: 'singlePackDateCode',
      title: $t('packingWorkOrderManage.singlePackDateCode'),
      minWidth: 150,
    },
    {
      field: 'multiPackDateCode',
      title: $t('packingWorkOrderManage.multiPackDateCode'),
      minWidth: 150,
    },
    {
      field: 'boxDateCode',
      title: $t('packingWorkOrderManage.boxDateCode'),
      minWidth: 150,
    },
    {
      field: 'deliverDate',
      title: $t('packingWorkOrderManage.deliverDate'),
      minWidth: 130,
    },
  ],
  height: 400,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
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
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {
  checkboxAll: () => {
    updateSelection();
  },
  checkboxChange: () => {
    updateSelection();
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });
// endregion

// region 数据查询
/**
 * 组装 SAP 计划列表查询参数（含生产指示日期范围转换）
 * @param {number} pageNum 页码
 * @param {number} pageSize 每页条数
 * @returns {Record<string, any>} 接口入参
 * @since 2026-09-24
 */
function buildParams(pageNum: number, pageSize: number) {
  const [start, end] = queryParams.value.produceDateRange || [];
  return {
    pageNum,
    pageSize,
    instructionSequenceCode:
      queryParams.value.instructionSequenceCode || undefined,
    lineCode: queryParams.value.lineCode || undefined,
    planCode: queryParams.value.planCode || undefined,
    // 单别（processType）：由父组件打开抽屉时传入，用于区分不同单别的计划
    processType: processType.value,
    productCode: queryParams.value.productCode || undefined,
    produceDateEnd: end ? dayjs(end).format('YYYY-MM-DD') : undefined,
    produceDateStart: start ? dayjs(start).format('YYYY-MM-DD') : undefined,
    sapOrderCode: queryParams.value.sapOrderCode || undefined,
  };
}

/**
 * 查询 SAP 计划列表
 * @param {object} params 分页参数
 * @param {number} params.pageNum 页码
 * @param {number} params.pageSize 每页条数
 * @returns {Promise<{ items: any[]; total: number }>} 分页数据
 * @since 2026-09-24
 */
function queryData({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) {
  return new Promise((resolve) => {
    querySapWorkSheetList(buildParams(pageNum, pageSize))
      .then((res: any) => {
        resolve({
          total: res?.total || 0,
          items: res?.results || [],
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

/**
 * 查询 SAP 计划列表（点击查询按钮）
 * @since 2026-09-24
 */
function handleSearch() {
  gridApi.reload();
}

/**
 * 重置查询条件
 * @since 2026-09-24
 */
function handleResetQuery() {
  queryParams.value = {
    produceDateRange: [],
    instructionSequenceCode: undefined,
    lineCode: undefined,
    planCode: undefined,
    productCode: undefined,
    sapOrderCode: undefined,
  };
  gridApi.reload();
}
// endregion

// region 下拉数据加载
/**
 * 加载堆垛机下拉选项（无默认值，需先确定产线）
 * @param {string} subLineCode 子产线编号
 * @since 2026-09-24
 */
function loadStackerOptions(subLineCode?: string) {
  const options: { label: string; value: string }[] = [];
  if (!subLineCode) {
    stackerOptions.value = options;
    return;
  }
  equipListByParentSubLineCode({
    pageNum: 1,
    pageSize: 9999,
    parentSubLineCode: subLineCode,
  }).then((data: any) => {
    const list = data || [];
    list.forEach((item: any) => {
      if (item.equipCode) {
        options.push({ label: item.equipCode, value: item.equipCode });
      }
    });
    stackerOptions.value = options;
  });
}
// endregion

// region 品号选择
/** 物料（品号）选择抽屉显隐 */
const materialSelectVisible = ref(false);
/** 当前选中的物料 */
const selectedMaterial = ref<any>({});

/**
 * 打开物料（品号）选择抽屉
 * @since 2026-09-24
 */
function openMaterialSelect() {
  selectedMaterial.value = {};
  materialSelectVisible.value = true;
}

/**
 * 物料（品号）选择变更
 * @param {any} material 选中的物料行
 * @since 2026-09-24
 */
function handleMaterialChange(material: any) {
  selectedMaterial.value = material || {};
}

/**
 * 确认物料（品号）选择，回填品号并刷新列表
 * @since 2026-09-24
 */
function confirmMaterialSelect() {
  queryParams.value.productCode =
    selectedMaterial.value?.materialCode || undefined;
  closeMaterialSelect();
  gridApi.reload();
}

/**
 * 清空已选品号并刷新列表
 * @since 2026-09-24
 */
function clearProductCode() {
  queryParams.value.productCode = undefined;
  gridApi.reload();
}

/**
 * 关闭物料（品号）选择抽屉
 * @since 2026-09-24
 */
function closeMaterialSelect() {
  materialSelectVisible.value = false;
}
// endregion

// region 日期码选择
/** 日期码选择抽屉实例 */
const dateCodeSelectDrawerRef = ref();

/**
 * 打开日期码（喷码模板）选择抽屉
 * @since 2026-09-24
 */
function openDateCodeSelect() {
  dateCodeSelectDrawerRef.value?.open();
}

/**
 * 日期码选择确认，回填批次印字编号（喷码编号）
 * @param {any} row 选中的喷码模板行
 * @since 2026-09-24
 */
function handleDateCodeConfirm(row: any) {
  generateForm.value.batchPrint = row?.printCode || '';
}

/**
 * 清空已选批次印字编号
 * @since 2026-09-24
 */
function clearBatchPrint() {
  generateForm.value.batchPrint = '';
}
// endregion

// region 选中行与生成
/** 系统子产线查询请求中标记：防止频繁触发 */
const subLineLoading = ref(false);
/** 系统子产线查询防抖处理：勾选连续变更时只在停止 500ms 后查询一次 */
const querySelectedSubLinesDebounced = debounce(querySelectedSubLines, 500);

/**
 * 同步表格勾选行，并按勾选的 SAP 工单防抖查询系统子产线
 * @since 2026-09-24
 */
function updateSelection() {
  selectedRows.value = gridApi.grid?.getCheckboxRecords() || [];
  querySelectedSubLinesDebounced();
}

/**
 * 根据单别与勾选的 SAP 工单 ID 查询系统子产线，
 * 查询成功后直接回填产线信息（lineId/lineCode/lineName/linetitle）并加载堆垛机选项
 * @returns {void} 无返回值
 * @throws 接口失败时由统一错误处理层提示，此处不额外捕获。
 * @since 2026-11-06 00:00:00
 */
function querySelectedSubLines() {
  const ids = selectedRows.value.map((row: any) => row.id);
  // 未勾选数据时清空产线信息
  if (ids.length === 0) {
    resetLineInfo();
    return;
  }
  if (subLineLoading.value) {
    return;
  }
  subLineLoading.value = true;
  querySubLineBySapWorkSheet({ ids, processType: processType.value })
    .then((res: any) => {
      // res.results 为系统子产线对象（含 id/subLineCode/subLineName）
      const result = res?.results;
      if (result?.id) {
        generateForm.value.lineId = result.id;
        generateForm.value.lineCode = result.subLineCode ?? '';
        generateForm.value.lineName = result.subLineName ?? '';
        generateForm.value.linetitle = result.subLineName
          ? `${result.subLineCode}(${result.subLineName})`
          : (result.subLineCode ?? '');
        // 产线确定后按子产线编号加载堆垛机（设备）选项
        generateForm.value.stackerId = undefined;
        loadStackerOptions(result.subLineCode);
      } else {
        resetLineInfo();
      }
    })
    .finally(() => {
      subLineLoading.value = false;
    });
}

/**
 * 清空产线回填信息（未勾选或未匹配到系统子产线时）
 * @returns {void} 无返回值
 * @throws 不主动抛出异常
 * @since 2026-11-06 00:00:00
 */
function resetLineInfo() {
  generateForm.value.lineId = undefined;
  generateForm.value.lineCode = '';
  generateForm.value.lineName = '';
  generateForm.value.linetitle = '';
  generateForm.value.stackerId = undefined;
  stackerOptions.value = [];
}

/**
 * 生成工单：校验基本信息表单（产线/堆垛机/生产指示日期）后，使用勾选的 SAP 工单项次ID提交
 * @since 2026-09-24
 */
function handleGenerate() {
  if (selectedRows.value.length === 0) {
    message.warning($t('packingWorkOrderManage.selectSapRowsFirst'));
    return;
  }
  generateFormRef.value?.validate().then(() => {
    const data = {
      batchPrint: generateForm.value.batchPrint || '',
      ids: selectedRows.value.map((row: any) => row.id),
      instructionDate: generateForm.value.instructionDate,
      lineCode: generateForm.value.lineCode,
      lineId: generateForm.value.lineId,
      lineName: generateForm.value.lineName,
      priority: generateForm.value.priority || 1,
      processType: processType.value,
      // 蔬菜包装/无重力搅拌不显示设备项，提交时不下传
      stackerId: showEquip.value ? generateForm.value.stackerId : undefined,
    };

    generateLoading.value = true;
    generateWorkSheet(data)
      .then(() => {
        message.success($t('packingWorkOrderManage.generateSuccess'));
        selectedRows.value = [];
        gridApi.reload();
        // 刷新外部列表并关闭抽屉
        emit('refresh');
        handleClose();
      })
      .finally(() => {
        generateLoading.value = false;
      });
  });
}
// endregion

// region 打开与关闭
/**
 * 打开抽屉并初始化数据
 * 创建人由后台依据 token 获取，前端不再传参
 * @param {number} type 单别（processType），由父组件传入，用于产线查询与工单生成
 * @since 2026-09-24
 */
function open(type: number) {
  processType.value = type;
  show.value = true;
  gridApi.reload();
}

/**
 * 关闭抽屉，清空所有状态
 * @since 2026-09-24
 */
function handleClose() {
  show.value = false;
  generateLoading.value = false;
  selectedRows.value = [];
  stackerOptions.value = [];
  materialSelectVisible.value = false;
  processType.value = undefined;
  queryParams.value = {
    produceDateRange: [],
    instructionSequenceCode: undefined,
    lineCode: undefined,
    planCode: undefined,
    productCode: undefined,
    sapOrderCode: undefined,
  };
  generateForm.value = {
    batchPrint: '',
    instructionDate: undefined,
    lineCode: '',
    lineId: undefined,
    lineName: '',
    linetitle: '',
    priority: 1,
    stackerId: undefined,
  };
}

defineExpose({ open });
// endregion
</script>

<template>
  <Drawer
    v-model:open="show"
    :destroy-on-close="true"
    :title="$t('packingWorkOrderManage.generateDrawerTitle')"
    height="100%"
    placement="top"
    @close="handleClose"
    :footer-style="{ textAlign: 'right' }"
  >
    <!-- 1. 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" class="!mb-2" layout="inline">
        <FormItem
          :label="$t('packingWorkOrderManage.instructionDate')"
          style="margin-bottom: 1em"
        >
          <RangePicker
            v-model:value="queryParams.produceDateRange"
            :placeholder="[
              $t('packingWorkOrderManage.workDatePlaceholder'),
              $t('packingWorkOrderManage.workDatePlaceholder'),
            ]"
          />
        </FormItem>

        <FormItem
          :label="$t('packingWorkOrderManage.productCode')"
          style="margin-bottom: 1em"
        >
          <Space>
            <Input
              v-model:value="queryParams.productCode"
              style="width: 160px"
              readonly
            />
            <Button type="primary" @click="openMaterialSelect">
              {{ $t('packingWorkOrderManage.select') }}
            </Button>
            <Button @click="clearProductCode">
              {{ $t('common.clear') }}
            </Button>
          </Space>
        </FormItem>

        <FormItem
          :label="$t('packingWorkOrderManage.lineCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.lineCode"
            style="width: 160px"
            allow-clear
          />
        </FormItem>

        <FormItem
          :label="$t('packingWorkOrderManage.sapOrderCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.sapOrderCode"
            style="width: 160px"
            allow-clear
          />
        </FormItem>

        <FormItem
          :label="$t('packingWorkOrderManage.planCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.planCode"
            style="width: 160px"
            allow-clear
          />
        </FormItem>

        <FormItem
          :label="$t('packingWorkOrderManage.instructionSequenceCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.instructionSequenceCode"
            style="width: 160px"
            allow-clear
          />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Space>
            <Button @click="handleResetQuery">
              {{ $t('common.reset') }}
            </Button>
            <Button type="primary" @click="handleSearch">
              {{ $t('common.search') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>

    <!-- 2. 生产指示列表基本信息区域 -->
    <Card>
      <Form
        ref="generateFormRef"
        :model="generateForm"
        :rules="generateFormRules"
        class="!mb-2"
      >
        <Row :gutter="16" style="width: 100%">
          <Col :span="6">
            <FormItem
              :label="$t('packingWorkOrderManage.line')"
              name="lineId"
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              style="margin-bottom: 1em"
            >
              <!-- 产线：由勾选的 SAP 工单自动确定，只读回显 -->
              <Input
                v-model:value="generateForm.linetitle"
                disabled
                style="width: 100%"
              />
            </FormItem>
          </Col>

          <Col v-if="showEquip" :span="6">
            <FormItem
              :label="equipLabel"
              name="stackerId"
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              style="margin-bottom: 1em"
            >
              <Select
                v-model:value="generateForm.stackerId"
                :options="stackerOptions"
                :placeholder="equipPlaceholder"
                style="width: 100%"
                allow-clear
              />
            </FormItem>
          </Col>

          <Col :span="6">
            <FormItem
              :label="$t('packingWorkOrderManage.instructionDate')"
              name="instructionDate"
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              style="margin-bottom: 1em"
            >
              <DatePicker
                v-model:value="generateForm.instructionDate"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </FormItem>
          </Col>

          <Col :span="6">
            <FormItem
              :label="$t('packingWorkOrderManage.priority')"
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              style="margin-bottom: 1em"
            >
              <InputNumber
                v-model:value="generateForm.priority"
                :min="1"
                style="width: 100%"
              />
            </FormItem>
          </Col>

          <Col v-if="showBatchPrint" :span="6">
            <FormItem
              :label="$t('packingWorkOrderManage.batchPrint')"
              name="batchPrint"
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              style="margin-bottom: 1em"
            >
              <Space>
                <Input
                  v-model:value="generateForm.batchPrint"
                  style="width: 100%"
                  readonly
                />
                <Button type="primary" @click="openDateCodeSelect">
                  {{ $t('packingWorkOrderManage.select') }}
                </Button>
                <Button @click="clearBatchPrint">
                  {{ $t('common.clear') }}
                </Button>
              </Space>
            </FormItem>
          </Col>

          <Col :span="24" style="text-align: right">
            <Button
              :loading="generateLoading"
              type="primary"
              @click="handleGenerate"
            >
              {{ $t('packingWorkOrderManage.generate') }}
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>

    <!-- 3. 表格区域 -->
    <div>
      <Grid>
        <template #toolbar-tools></template>
      </Grid>
    </div>

    <template #footer>
      <Button @click="handleClose">
        {{ $t('common.cancel') }}
      </Button>
    </template>
  </Drawer>

  <!-- 4. 品号（物料）选择抽屉 -->
  <Drawer
    v-model:open="materialSelectVisible"
    :footer-style="{ textAlign: 'right' }"
    height="80%"
    placement="top"
    root-class-name="root-class-name"
    :title="$t('storesRequisition.selectMaterialTitle')"
  >
    <MaterialSelection
      v-if="materialSelectVisible"
      @changed="handleMaterialChange"
    />

    <template #footer>
      <Space>
        <Button @click="closeMaterialSelect">
          {{ $t('common.cancel') }}
        </Button>
        <Button type="primary" @click="confirmMaterialSelect">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>

  <!-- 5. 日期码选择抽屉 -->
  <DateCodeSelectDrawer
    ref="dateCodeSelectDrawerRef"
    @confirm="handleDateCodeConfirm"
  />
</template>
