<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, ref } from 'vue';

import { Page } from '@vben/common-ui';
// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Drawer,
  Empty,
  Form,
  FormItem,
  Input,
  Timeline,
  TimelineItem,
  Tooltip,
} from 'ant-design-vue';
import { JsonViewer } from 'vue3-json-viewer';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { listSnCodeHistory, listSnCodeOpLog } from '#/api';

import 'vue3-json-viewer/dist/vue3-json-viewer.css';

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
    },
    { field: 'produceWorkshopCode', title: '工位号', minWidth: 150 },
    {
      field: 'taskLine',
      title: '是否异常',
      minWidth: 150,
      slots: { default: 'taskLine' },
    },
    { field: 'processCode', title: '工序编号', minWidth: 150 },
    { field: 'processName', title: '工序名称', minWidth: 150 },
    { field: 'partName', title: '产品名称', minWidth: 150 },
    { field: 'partCode', title: '产品编号', minWidth: 150 },
    { field: 'partPlanCode', title: '工单号', minWidth: 150 },
    { field: 'qcCode', title: 'SN码', minWidth: 150 },
    { field: 'createTime', title: '创建时间', minWidth: 150 },
    { field: 'controlPointCode', title: '设备编号', minWidth: 150 },
    { field: 'controlPointName', title: '设备名称', minWidth: 150 },
    {
      field: 'circulationState',
      title: '执行状态',
      minWidth: 150,
      slots: { default: 'circulationState' },
    },
    { field: 'checkResultName', title: '检验结果', minWidth: 150 },
    { field: 'pushFlagName', title: '推送标记', minWidth: 150 },
    {
      title: '操作',
      minWidth: 200,
      slots: {
        default: 'action',
      },
      fixed: 'right',
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

const gridEvents: any = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });
// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 条码
  snCode: '',
  // 设备编号
  equipCode: '',
  // 工单号
  worksheetCode: '',
  // 工序编号
  processCode: '',
});

/**
 * 查询数据
 * 功能：获取出站工单列表数据并处理分页
 * 步骤：
 * 1. 合并查询参数
 * 2. 校验工作中心编号是否存在
 * 3. 存在时调用接口获取分页数据
 * 4. 处理接口返回数据适配前端表格
 * 5. 无工作中心时返回空数据集
 *
 * @param {object} params 分页参数
 * @param {number} params.page 当前页码
 * @param {number} params.pageSize 每页数据量
 * @returns {Promise} 返回处理后的分页数据Promise
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 合并查询参数
    const params: any = { ...queryParams.value };

    // 仅当工作中心编号存在时发起请求
    if (params.snCode) {
      listSnCodeHistory({
        ...params, // 保留原有查询条件
        pageNum: page, // 接口需要的页码参数
        pageSize, // 接口需要的每页数量
      })
        .then(({ total, list }) => {
          // 将接口数据转换为表格组件需要的格式
          resolve({
            total, // 总记录数
            items: list, // 当前页数据
          });
        })
        .catch((error) => {
          reject(error); // 错误处理
        });
    } else {
      // 无工作中心时返回空数据集
      resolve({
        total: 0,
        items: [],
      });
    }
  });
}

// endregion

// region 查看详情
// 详情
const details = ref<any>({});
// 是否显示
const showDetailsDrawer = ref(false);

/**
 * 显示详情
 * @param row
 */
function showDetails(row: any) {
  if (!row.paramDetail) return;
  showDetailsDrawer.value = true;
  details.value = JSON.parse(row.paramDetail);
}

// endregion

// region 查询日志
const logs = ref<any>([]);
const showLogs = ref<any>(false);
function queryLog(row: any) {
  listSnCodeOpLog(row).then((result: any) => {
    logs.value = result;
    showLogs.value = true;
  });
}

// endregion
</script>

<template>
  <Page id="page">
    <Card class="mb-4">
      <Form layout="inline" :model="queryParams">
        <!--条码 -->
        <FormItem
          :label="$t('barcodeInspection.barCode')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="snCode"
        >
          <Input v-model:value="queryParams.snCode" />
        </FormItem>
        <!--设备编号 -->
        <FormItem :label="$t('barcodeInspection.deviceNumber')">
          <Input v-model:value="queryParams.equipCode" />
        </FormItem>
        <!--工单编号 -->
        <FormItem :label="$t('workOrderEntry.workOrderNumber')">
          <Input v-model:value="queryParams.worksheetCode" />
        </FormItem>
        <!--工序编号 -->
        <FormItem :label="$t('barcodeInspection.processNumber')">
          <Input v-model:value="queryParams.processCode" />
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            @click="gridApi.reload()"
            class="mr-4"
            :disabled="!queryParams.snCode"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- region 表格内容 -->
    <Card class="mb-5">
      <Grid class="mt-4">
        <template #toolbar-tools> </template>
        <template #taskLine="{ row }">
          {{
            row.taskLine * 1 === -1
              ? $t('barcodeInspection.abnormal')
              : $t('barcodeInspection.normal')
          }}
        </template>
        <template #circulationState="{ row }">
          {{
            row.circulationState * 1 === 1
              ? $t('barcodeInspection.inAction')
              : $t('barcodeInspection.executionCompleted')
          }}
        </template>
        <template #action="{ row }">
          <!-- 查看 -->
          <Tooltip>
            <template #title>{{ $t('common.view') }}</template>
            <Button
              type="link"
              :icon="
                h(Icon, {
                  icon: 'mdi:eye',
                  class: 'inline-block text-2xl',
                })
              "
              @click="showDetails(row)"
              :disabled="!row.paramDetail"
            />
          </Tooltip>
          <!-- 查看日志 -->
          <Tooltip>
            <template #title>{{ $t('common.viewLog') }}</template>
            <Button
              type="link"
              :icon="
                h(Icon, {
                  icon: 'mdi:file-eye-outline',
                  class: 'inline-block text-2xl',
                })
              "
              @click="queryLog(row)"
            />
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
    <Drawer
      v-model:open="showDetailsDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="600"
      class="custom-class"
      placement="right"
      title="参数绑定明细"
    >
      <JsonViewer :value="details" copyable boxed sort theme="light" />
    </Drawer>
    <Drawer
      v-model:open="showLogs"
      :footer-style="{ textAlign: 'right' }"
      :width="700"
      class="custom-class"
      placement="right"
      title="日志查询"
    >
      <Timeline mode="alternate" v-if="logs && logs.length > 0">
        <TimelineItem v-for="(item, index) of logs" :key="index">
          <Card>
            <p>
              {{ item.createTime }}
            </p>
            <p>
              {{ item.logData }}
            </p>
          </Card>
        </TimelineItem>
      </Timeline>
      <Empty v-else />
    </Drawer>
  </Page>
</template>

<style scoped></style>
