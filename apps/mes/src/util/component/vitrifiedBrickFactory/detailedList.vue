<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted } from 'vue';

import { Page } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { excelPathBHZInOutApproval, queryBHZMXStatistics } from '#/api';
import { $t } from '#/locales';

const props = defineProps({
  queryParams: {
    type: Object,
    default: () => ({}),
  },
});

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      title: '序号',
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    {
      field: 'worksheetCode',
      title: '工单号',
      minWidth: 200,
    },
    {
      field: 'lineName',
      title: '生产批号',
      minWidth: 200,
    },
    {
      field: 'productCode',
      title: '产品编码',
      minWidth: 200,
    },
    {
      field: 'flMaterialNumber',
      title: '粉料用量(T)',
      minWidth: 200,
    },
    {
      field: 'pressQuantity',
      title: '压制量(M2)',
      minWidth: 200,
    },
    {
      field: 'pressTon',
      title: '压制量(干坯重量)(T)',
      minWidth: 200,
    },
    {
      field: 'inYLQuantity',
      title: '进窑量 (M2)',
      minWidth: 200,
    },
    {
      field: 'inStorageQuantity',
      title: '入库量 (M2)',
      minWidth: 200,
    },
    {
      field: 'bf',
      title: '报废',
      minWidth: 200,
    },
    {
      field: 'cxTime',
      title: '成型时间',
      minWidth: 200,
    },
    {
      field: 'wgTrq',
      title: '卧干器燃气',
      minWidth: 200,
    },
    {
      field: 'dlValue',
      title: '电耗',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'injp',
      title: '入待抛砖库 JP',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'qps',
      title: '上砖前破碎',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'actualTon',
      title: '实际坯重',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'wgName',
      title: '卧干器名称',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'wf',
      title: '废粉',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'wgsmj',
      title: '卧干器水煤气',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'ylsmj',
      title: '窑炉水煤气',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'stopTime',
      title: '停机时间',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'sczc',
      title: '转产',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      title: '工艺停产',
      children: [
        {
          field: 'P',
          title: 'P',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'P1',
          title: '1',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'P2',
          title: '2',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'OA',
          title: 'OA',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'OB',
          title: 'OB',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: '入釉面砖库JY（M2）',
      children: [
        {
          field: 'P',
          title: 'P',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'P1',
          title: '1',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'P2',
          title: '2',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'OA',
          title: 'OA',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'OB',
          title: 'OB',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: '入待加工库JG（M2）',
      children: [
        {
          field: 'P',
          title: 'P',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'P1',
          title: '1',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'P2',
          title: '2',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'OA',
          title: 'OA',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'OB',
          title: 'OB',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: '入成品库JT（M2）',
      children: [
        {
          field: 'P',
          title: 'P',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'P1',
          title: '1',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'P2',
          title: '2',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'OA',
          title: 'OA',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'OB',
          title: 'OB',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: '入成品库JJ（M2）',
      children: [
        {
          field: 'P',
          title: 'P',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'P1',
          title: '1',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'P2',
          title: '2',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'OA',
          title: 'OA',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: 'OB',
          title: 'OB',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: '成型停机时间（小时）',
      children: [
        {
          field: '清仓清线',
          title: '清仓清线',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '更换模具',
          title: '更换模具',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '更换瓷辊',
          title: '更换瓷辊',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '对色',
          title: '对色',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '对色',
          title: '对色',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '设备',
          title: '设备',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '自身',
          title: '自身',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '混料',
          title: '混料',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '断料',
          title: '断料',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '其它',
          title: '其它',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: '烧成停机时间（小时）',
      children: [
        {
          field: '清仓清线',
          title: '清仓清线',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '更换模具',
          title: '更换模具',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '更换瓷辊',
          title: '更换瓷辊',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '大修、放假、让气、让电',
          title: '大修、放假、让气、让电',
          minWidth: 200,
          slots: { footer: 'footerData' },
        },
        {
          field: '无砖停机',
          title: '无砖停机',
          minWidth: 120,
          slots: { footer: 'footerData' },
        },
        {
          field: '新品试验',
          title: '新品试验',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '工艺对色',
          title: '工艺对色',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '粉制对色',
          title: '粉制对色',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '粉制混料及断料',
          title: '粉制混料及断料',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '自身',
          title: '自身',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '粉制故障',
          title: '粉制故障',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '成型故障',
          title: '成型故障',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '烧干故障',
          title: '烧干故障',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '窑炉故障',
          title: '窑炉故障',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '资材断料',
          title: '资材断料',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '模具及粉车维修',
          title: '模具及粉车维修',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
        {
          field: '其它',
          title: '其它',
          minWidth: 80,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      field: '上砖前破碎',
      title: '上砖前破碎',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '其他耗用坯体',
      title: '其他耗用坯体',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '实际坯重',
      title: '实际坯重',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '标准坯重',
      title: '标准坯重',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '备注',
      title: '备注',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '卧干器',
      title: '卧干器',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '废粉',
      title: '废粉',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '类别',
      title: '类别',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '二次烧',
      title: '二次烧',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '卧干器-水煤气',
      title: '卧干器-水煤气',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '窑炉-水煤气',
      title: '窑炉-水煤气',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '停机时间',
      title: '停机时间',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
  ],
  // footerData: [{ seq: '合计' }],
  // mergeFooterItems: [{ row: 0, col: 0, rowspan: 1, colspan: 4 }],
  height: 500,
  stripe: true,
  // showFooter: true,
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
 * 获取物料类型的中文描述
 * @param state 物料类型编码编码
 */
function getMaterialTypeText(state: number) {
  switch (state) {
    case 1: {
      return '原料';
    }
    case 2: {
      return '砖坯';
    }
    default: {
      return '未定义的类型';
    }
  }
}

// endregion

// region 查询数据
/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...props.queryParams };
    if (params.searchTime && params.searchTime.length === 2) {
      params.startTime = params.searchTime[0].format('YYYY-MM-DD');
      params.endTime = params.searchTime[1].format('YYYY-MM-DD');
      params.searchTime = undefined;
    }
    queryBHZMXStatistics({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ total, list }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
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

// endregion

// region 文件下载

function downloadTemplate() {
  const params: any = { ...props.queryParams };
  if (params.searchTime && params.searchTime.length === 2) {
    params.startTime = params.searchTime[0].format('YYYY-MM-DD');
    params.endTime = params.searchTime[1].format('YYYY-MM-DD');
    params.searchTime = undefined;
  }
  excelPathBHZInOutApproval(params).then((data) => {
    window.open(data);
  });
}

// endregion

// region 暴露方法

const reload = () => {
  gridApi.reload();
};

defineExpose({
  reload,
});

// endregion

// region 初始化

onMounted(() => {});

// endregion
</script>

<template>
  <Page>
    <!-- region 表格主体 -->
    <Grid>
      <template #toolbar-tools>
        <!-- 导出按钮 -->
        <Button type="primary" @click="downloadTemplate()">
          {{ $t('common.export') }}
        </Button>
      </template>
      <template #materialType="{ row }">
        <span> {{ getMaterialTypeText(row.materialType) }} </span>
      </template>
      <!--      <template #footerData="{ column }">
        <span> {{ collect[column.field] }} </span>
      </template>-->
    </Grid>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
