<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button, Col, Input, Row, Spin } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { listByCodeScan } from '#/api';
import ScanTheCode from '#/util/component/scanTheCode.vue';

const props = defineProps({
  // 工步id
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心
  workstationCode: {
    type: String,
    default: '',
  },
  // 展示类型
  showTypeNumber: {
    type: Number,
    default: 0,
  },
});

/**
 * 获取标签的class
 */
function getLabelClass() {
  return 'mr-4 inline-block w-48 p-2 text-right';
}

/**
 * 获取值的class
 */
function getValueClass() {
  return 'inline-block border p-2 text-center flex-1';
}
/**
 * 详情
 */
const details = ref<any>(undefined);
/**
 * 加载中
 */
const spinning = ref<any>(false);
/**
 * sn码
 */
const snCode = ref('');

/**
 * 查询资源验证状态
 * @function
 * @async
 * @description 获取当前工位的资源校验状态数据，包含以下流程：
 * 1. 开启加载状态指示
 * 2. 从组件props中获取上下文参数
 * 3. 调用资源验证状态查询接口
 * 4. 存储接口返回数据
 * 5. 始终关闭加载状态指示
 *
 * @throws {Error} 需要调用者补充异常处理逻辑
 *
 * @example
 * // 典型调用流程
 * try {
 *   await queryData();
 * } catch (error) {
 *   // 待补充的错误处理
 * }
 *
 * @see {@link listByCodeScan} 使用的API接口
 * @see {@link props} 参数来源：工步ID/工序ID/工单编号等上下文参数
 */
function queryData() {
  spinning.value = true;
  listByCodeScan({
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
  })
    .then((data) => {
      details.value = data;
    })
    .finally(() => {
      spinning.value = false;
    });
}

// region 作业信息
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      title: '序号',
      type: 'seq',
      field: 'seq',
      width: 50,
      visible: props.showTypeNumber === 35,
    },
    {
      title: '工位编号',
      field: 't',
      width: 100,
      visible: [32, 33].includes(props.showTypeNumber),
    },
    {
      field: '1',
      title: '单件SN',
      minWidth: 120,
    },
    {
      field: '2',
      title: '工单编号',
      minWidth: 120,
    },
    {
      field: '3',
      title: '产品名称',
      minWidth: 120,
    },
    {
      field: '4',
      title: '测试结果',
      minWidth: 120,
      visible: props.showTypeNumber === 32,
    },
  ],
  height: 400,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryTableData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  toolbarConfig: {
    custom: false,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};
// gridApi
const [Grid] = useVbenVxeGrid({ gridOptions });

// region 查询数据

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryTableData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params: any = {};
    if (params.searchTime && params.searchTime.length === 2) {
      params.startTime = params.searchTime[0].format('YYYY-MM-DD');
      params.endTime = params.searchTime[1].format('YYYY-MM-DD');
      params.searchTime = undefined;
    }
    resolve({
      total: page * pageSize,
      items: [{}, {}, {}],
    });
  });
}

// endregion

onMounted(() => {});
</script>

<template>
  <Spin :spinning="spinning">
    <Row>
      <Col :span="12" class="pt-10">
        <!-- region 单件SN码 -->
        <div class="mb-4 mr-8 flex">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.singlePieceSNCode') }}：
          </span>
          <span :class="getValueClass()" class="border-0">
            <Input v-model:value="snCode" class="w-[70%]" />
            <ScanTheCode
              @scan-the-code="
                (val) => {
                  snCode = val;
                  queryData();
                }
              "
            />
          </span>
          <Button
            type="link"
            :danger="details.checkResult === -1"
            v-if="details"
          >
            <IconifyIcon
              :icon="
                details.checkResult === -1
                  ? 'mdi:error-outline'
                  : 'mdi:success-circle-outline'
              "
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </div>
        <!-- endregion -->
        <!-- region 校验结果 -->
        <div class="mb-4 mr-8 flex">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.verificationResult') }}：
          </span>
          <span :class="getValueClass()">
            {{ details?.productName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion -->
        <!-- region 工位编号 -->
        <div class="mb-4 mr-8 flex" v-if="[32, 33].includes(showTypeNumber)">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.workstationNumber') }}：
          </span>
          <span :class="getValueClass()" class="border-0">
            <Input v-model:value="snCode" class="w-[70%]" />
            <ScanTheCode
              @scan-the-code="
                (val) => {
                  snCode = val;
                  queryData();
                }
              "
            />
          </span>
        </div>
        <!-- endregion -->
        <!-- region 测试结果 -->
        <div class="mb-4 mr-8 flex" v-if="showTypeNumber === 35">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.testResult') }}：
          </span>
          <span :class="getValueClass()">
            {{ details?.productName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion -->
        <!-- region 已生产数量 -->
        <div class="mb-4 mr-8 flex">
          <span :class="getLabelClass()">
            {{ $t('productionOperation.producedQuantity') }}：
          </span>
          <span :class="getValueClass()">
            {{ details?.productName || $t('productionOperation.none') }}
          </span>
        </div>
        <!-- endregion -->
      </Col>
      <Col :span="12">
        <Grid />
      </Col>
    </Row>
  </Spin>
</template>

<style scoped></style>
