<script lang="ts" setup>
/**
 * [INPUT]: 依赖 #/api (getPrintCodeTemplateList/previewByPrintCode)、
 *          #/adapter/vxe-table (useVbenVxeGrid)、#/locales ($t)
 * [OUTPUT]: 对外提供 DateCodeSelectDrawer 抽屉组件，通过 defineExpose({ open }) 暴露 open 方法，
 *           选中喷码模板后通过 confirm 事件回传该行数据
 * [POS]: 属于 planManagement 包装工单管理「工单生成」抽屉的日期码选择子抽屉
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-09-24 10:00:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import {
  Button,
  Col,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Row,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getPrintCodeTemplateList, previewByPrintCode } from '#/api';
import { $t } from '#/locales';

defineOptions({ name: 'DateCodeSelectDrawer' });

const emit = defineEmits<{
  confirm: [row: any];
}>();

/** 销售类型：1=内销（内需），2=出口 */
const SALES_TYPE_DOMESTIC = 1;
const SALES_TYPE_EXPORT = 2;

// region 状态管理
const show = ref(false);
/** 查询条件：喷码编号、区分 */
const queryParams = ref<any>({ printCode: undefined, printName: undefined });
/** 当前选中的喷码模板行 */
const selectedRow = ref<any>(null);
/** 喷码预览内容 */
const previewList = ref<string[]>([]);
const previewLoading = ref(false);
// endregion

// region 表格配置
/**
 * 生成喷码模板表格配置（左右两栏仅 salesType 不同）
 * @param {number} salesType 销售类型：1=内销，2=出口
 * @returns {VxeGridProps<any>} 表格配置
 * @since 2026-09-24
 */
function createGridOptions(salesType: number): VxeGridProps<any> {
  return {
    align: 'center',
    border: true,
    columns: [
      { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
      { type: 'radio', width: 50 },
      {
        field: 'printCode',
        title: $t('packingWorkOrderManage.printCode'),
        minWidth: 140,
      },
      {
        field: 'printName',
        title: $t('packingWorkOrderManage.printName'),
        minWidth: 140,
      },
      {
        field: 'productGroupCode',
        title: $t('packingWorkOrderManage.productGroupCode'),
        minWidth: 140,
      },
    ],
    height: 500,
    pagerConfig: { enabled: true, pageSize: 20 },
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          return await queryData(
            { pageNum: page.currentPage, pageSize: page.pageSize },
            salesType,
          );
        },
      },
    },
    rowConfig: { keyField: 'id' },
    stripe: true,
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  };
}

const [ExportGrid, exportGridApi] = useVbenVxeGrid({
  gridEvents: {
    radioChange: () => {
      handleRadioChange('export');
    },
  } as VxeGridListeners<any>,
  gridOptions: createGridOptions(SALES_TYPE_EXPORT),
});

const [DomesticGrid, domesticGridApi] = useVbenVxeGrid({
  gridEvents: {
    radioChange: () => {
      handleRadioChange('domestic');
    },
  } as VxeGridListeners<any>,
  gridOptions: createGridOptions(SALES_TYPE_DOMESTIC),
});
// endregion

// region 数据查询与选择
/**
 * 分页查询喷码模板列表
 * @param {object} params 分页参数
 * @param {number} params.pageNum 页码
 * @param {number} params.pageSize 每页条数
 * @param {number} salesType 销售类型：1=内销，2=出口
 * @returns {Promise<{ items: any[]; total: number }>} 分页数据
 * @since 2026-09-24
 */
function queryData(
  { pageNum, pageSize }: { pageNum: number; pageSize: number },
  salesType: number,
) {
  return new Promise((resolve) => {
    getPrintCodeTemplateList({
      pageNum,
      pageSize,
      printCode: queryParams.value.printCode || undefined,
      printName: queryParams.value.printName || undefined,
      salesType,
    })
      .then((res: any) => {
        resolve({
          total: res?.total || res?.count || 0,
          items: res?.results || [],
        });
      })
      .catch(() => {
        resolve({ total: 0, items: [] });
      });
  });
}

/**
 * 单选变更：选中一侧时清空另一侧选中状态，并加载喷码预览
 * @param {'export' | 'domestic'} side 触发选中的表格：export=出口，domestic=内需
 * @since 2026-09-24
 */
function handleRadioChange(side: 'domestic' | 'export') {
  const currentApi = side === 'export' ? exportGridApi : domesticGridApi;
  const otherApi = side === 'export' ? domesticGridApi : exportGridApi;
  const row = currentApi.grid?.getRadioRecord();
  if (!row) {
    return;
  }
  otherApi.grid?.clearRadioRow();
  selectedRow.value = row;
  loadPreview(row.printCode);
}

/**
 * 加载喷码预览内容
 * @param {string} printCode 喷码编号
 * @since 2026-09-24
 */
function loadPreview(printCode?: string) {
  if (!printCode) {
    previewList.value = [];
    return;
  }
  previewLoading.value = true;
  previewByPrintCode(printCode)
    .then((res: any) => {
      previewList.value = Array.isArray(res) ? res : [];
    })
    .catch(() => {
      previewList.value = [];
    })
    .finally(() => {
      previewLoading.value = false;
    });
}

/**
 * 查询：刷新左右两栏列表
 * @since 2026-09-24
 */
function handleSearch() {
  exportGridApi.reload();
  domesticGridApi.reload();
}

/**
 * 重置查询条件
 * @since 2026-09-24
 */
function handleResetQuery() {
  queryParams.value = { printCode: undefined, printName: undefined };
  handleSearch();
}
// endregion

// region 打开与关闭
/**
 * 打开抽屉
 * @since 2026-09-24
 */
function open() {
  show.value = true;
}

/**
 * 确认选择，回传选中的喷码模板行
 * @since 2026-09-24
 */
function handleConfirm() {
  if (!selectedRow.value) {
    message.warning($t('packingWorkOrderManage.pleaseSelectDateCode'));
    return;
  }
  emit('confirm', selectedRow.value);
  handleClose();
}

/**
 * 关闭抽屉，清空所有状态
 * @since 2026-09-24
 */
function handleClose() {
  show.value = false;
  selectedRow.value = null;
  previewList.value = [];
  previewLoading.value = false;
  queryParams.value = { printCode: undefined, printName: undefined };
}

defineExpose({ open });
// endregion
</script>

<template>
  <Drawer
    v-model:open="show"
    :destroy-on-close="true"
    :footer-style="{ textAlign: 'right' }"
    :title="$t('packingWorkOrderManage.dateCodeInfo')"
    height="100%"
    placement="top"
    @close="handleClose"
  >
    <!-- 1. 查询区域 -->
    <Form :model="queryParams" class="!mb-2" layout="inline">
      <FormItem
        :label="$t('packingWorkOrderManage.printCode')"
        style="margin-bottom: 1em"
      >
        <Input
          v-model:value="queryParams.printCode"
          :placeholder="$t('packingWorkOrderManage.printCodePlaceholder')"
          style="width: 160px"
          allow-clear
        />
      </FormItem>

      <FormItem
        :label="$t('packingWorkOrderManage.printName')"
        style="margin-bottom: 1em"
      >
        <Input
          v-model:value="queryParams.printName"
          :placeholder="$t('packingWorkOrderManage.printNamePlaceholder')"
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

    <!-- 2. 左右两栏：出口日期码 / 内需日期码 -->
    <Row :gutter="16">
      <Col :span="12">
        <div class="!mb-2">
          {{ $t('packingWorkOrderManage.exportDateCodeList') }}
        </div>
        <ExportGrid>
          <template #toolbar-tools></template>
        </ExportGrid>
      </Col>
      <Col :span="12">
        <div class="!mb-2">
          {{ $t('packingWorkOrderManage.domesticDateCodeList') }}
        </div>
        <DomesticGrid>
          <template #toolbar-tools></template>
        </DomesticGrid>
      </Col>
    </Row>

    <!-- 3. 喷码预览 -->
    <div class="!mt-4">
      <div class="!mb-2">
        {{ $t('packingWorkOrderManage.previewTitle') }}
      </div>
      <Space v-if="previewLoading" size="small">
        {{ $t('packingWorkOrderManage.loading') }}
      </Space>
      <Space v-else direction="vertical" size="small">
        <div v-for="(item, index) in previewList" :key="index">
          {{ item }}
        </div>
      </Space>
    </div>

    <template #footer>
      <Space>
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
