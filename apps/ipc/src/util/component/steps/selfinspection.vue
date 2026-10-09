<script setup lang="ts">
/**
 * [INPUT]: 依赖 #/api 的 getSelfInspectionStepInfo 获取自检工步内容、getDiscoveryDefectListByWorksheetCode 获取不良记录，
 * 依赖 drawer/DefectDetailDrawer.vue 查看与编辑不良明细
 * [OUTPUT]: 对外提供自检工步组件，包含工步详情展示、不良记录列表与不良明细抽屉入口
 * [POS]: 工步执行子组件，由 stepExecution.vue 渲染
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-10-09 17:30:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { Button, Descriptions, DescriptionsItem } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getDiscoveryDefectListByWorksheetCode,
  getSelfInspectionStepInfo,
} from '#/api';
import DefectDetailDrawer from '#/util/component/drawer/DefectDetailDrawer.vue';

/**
 * 定义组件的 props，用于接收父组件传递的数据
 */
const props = defineProps({
  // 工步id，用于标识具体的工步，默认为 0
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID，用于标识具体的工序，默认为 0
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号，用于标识具体的工单，默认为空字符串
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号，用于标识具体的设备，默认为空字符串
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心，用于标识具体的工作中心，默认为空字符串
  workstationCode: {
    type: String,
    default: '',
  },
});

// region 工步详情
// 自检工步内容：工单号、产品编号、产品名称、计划数、良品总数、不良品总数
const stepInfo = ref<any>({});

/**
 * 查询自检工步内容并写入详情展示数据
 * 工单编号为空时清空详情数据，不发起请求
 * @returns {void} 无返回值，结果写入 stepInfo
 * @since 2026-10-09 12:00:00
 */
function queryStepInfo() {
  if (!props.worksheetCode) {
    stepInfo.value = {};
    return;
  }
  getSelfInspectionStepInfo({
    bindingId: props.bindingId,
    functionId: props.functionId,
    worksheetCode: props.worksheetCode,
    workstationCode: props.workstationCode,
  })
    .then((data: any) => {
      stepInfo.value = data || {};
    })
    .catch(() => {
      stepInfo.value = {};
    });
}
// endregion

// region 表格配置
/**
 * 格式化操作时间展示
 * @param {any} value 接口返回的时间值
 * @returns {string} 格式化为 YYYY-MM-DD HH:mm:ss，空值返回 '-'
 * @since 2026-10-09 17:30:00
 */
function formatTime(value: any) {
  if (!value) return '-';
  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : `${value}`;
}

/**
 * 表格配置选项，用于定义 VxeGrid 表格的各项属性
 */
const gridOptions: VxeGridProps<any> = {
  // 表格内容居中对齐
  align: 'center',
  // 显示表格边框
  border: true,
  // 表格列配置：不良记录字段（不含 detailList），末列为查看详情操作
  columns: [
    {
      // 列标题
      title: $t('productionOperation.seq'),
      // 列类型为序号列
      type: 'seq',
      // 列字段名
      field: 'seq',
      // 列宽度
      width: 50,
    },
    {
      field: 'worksheetCode',
      minWidth: 140,
      title: $t('productionOperation.workOrderCode'),
    },
    {
      field: 'discoveryProcessCode',
      minWidth: 140,
      title: $t('productionOperation.discoveryProcessCode'),
    },
    {
      field: 'productCode',
      minWidth: 140,
      title: $t('productionOperation.productNumber'),
    },
    {
      field: 'productName',
      minWidth: 160,
      title: $t('productionOperation.productName'),
    },
    {
      field: 'subProductCode',
      minWidth: 140,
      title: $t('productionOperation.partNumber'),
    },
    {
      field: 'subProductName',
      minWidth: 160,
      title: $t('productionOperation.partName'),
    },
    {
      field: 'defectNumber',
      minWidth: 120,
      title: $t('productionOperation.totalDefectNumber'),
    },
    {
      field: 'operateTime',
      formatter: ({ cellValue }: any) => formatTime(cellValue),
      minWidth: 180,
      title: $t('productionOperation.operateTime'),
    },
    {
      field: 'interactionPointCode',
      minWidth: 140,
      title: $t('productionOperation.workstationCode'),
    },
    {
      field: 'interactionPointId',
      minWidth: 140,
      title: $t('productionOperation.stationBindingId'),
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('common.operation'),
      width: 120,
    },
  ],
  // 不分页，不良记录随工单一次性返回
  pagerConfig: {
    enabled: false,
  },
  // 代理配置，用于异步查询数据
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryData();
      },
    },
    page: false,
  },
  // 表格高度
  height: 400,
  // 显示斑马纹
  stripe: true,
  // 工具栏配置
  toolbarConfig: {
    // 显示自定义按钮
    custom: true,
    // 显示刷新按钮
    refresh: true,
    // 显示缩放按钮
    zoom: true,
  },
};

/**
 * 初始化 VxeGrid 组件和 API
 * @type {[typeof Grid, any]} - 包含 Grid 组件和 gridApi 的数组
 */
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
// endregion

// region 查询数据
/**
 * 查询当前工单的不良记录列表
 * 工单编号为空时直接返回空列表，不发起请求
 * @returns {Promise<{total: number, items: any[]}>} 返回 total（记录总数）与 items（不良记录列表）
 * @throws 当接口请求失败时，Promise 被 reject 原始错误
 * @since 2026-10-09 17:30:00
 */
function queryData() {
  return new Promise((resolve, reject) => {
    if (!props.worksheetCode) {
      resolve({
        total: 0,
        items: [],
      });
      return;
    }
    getDiscoveryDefectListByWorksheetCode(props.worksheetCode)
      .then((data: any) => {
        const list = data || [];
        resolve({
          total: list.length,
          items: list,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 重新加载工步详情与不良记录列表
 * @returns {void} 无返回值，刷新详情与列表
 * @since 2026-10-09 12:00:00
 */
function reload() {
  queryStepInfo();
  gridApi.reload();
}
// endregion

// region 操作
// 不良明细抽屉实例
const defectDetailDrawerRef = ref();

/**
 * 打开不良明细抽屉
 * 将当前不良记录（含 detailList）传入抽屉查看与编辑
 * @param {any} row 当前不良记录行
 * @returns {void} 无返回值
 * @since 2026-10-09 17:30:00
 */
function handleViewDetail(row: any) {
  defectDetailDrawerRef.value?.open(row);
}
// endregion

/**
 * 组件挂载后执行的钩子函数，会在组件挂载完成后加载详情与不良记录列表
 */
onMounted(() => {
  reload();
});
</script>

<template>
  <div>
    <!-- 工步详情：自检工步内容查询接口返回 -->
    <Descriptions
      :column="3"
      :title="$t('productionOperation.selfInspectionInfo')"
      bordered
      class="mb-4"
    >
      <DescriptionsItem :label="$t('productionOperation.workOrderCode')">
        {{ stepInfo.worksheetCode || '-' }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('productionOperation.productNumber')">
        {{ stepInfo.productCode || '-' }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('productionOperation.productName')">
        {{ stepInfo.productName || '-' }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('productionOperation.plannedQuantity')">
        {{ stepInfo.planNumber ?? '-' }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('productionOperation.quantityOfGoodProducts')">
        {{ stepInfo.finishNumber ?? '-' }}
      </DescriptionsItem>
      <DescriptionsItem
        :label="$t('productionOperation.quantityOfDefectiveProducts')"
      >
        {{ stepInfo.totalUnqualityNumber ?? '-' }}
      </DescriptionsItem>
    </Descriptions>

    <!-- 不良记录列表：展示记录字段（不含 detailList），明细在抽屉中查看 -->
    <Grid>
      <template #toolbar-tools></template>
      <template #action="{ row }">
        <!-- 查看详情：打开不良明细抽屉 -->
        <Button size="small" type="link" @click="handleViewDetail(row)">
          {{ $t('productionOperation.viewDetail') }}
        </Button>
      </template>
    </Grid>

    <!-- 不良明细抽屉：查看与编辑当前记录的 detailList -->
    <DefectDetailDrawer
      ref="defectDetailDrawerRef"
      :binding-id="bindingId"
      :worksheet-code="worksheetCode"
      :workstation-code="workstationCode"
      @refresh="reload"
    />
  </div>
</template>

<style scoped>
/* 作用域样式，仅对当前组件生效 */
</style>
