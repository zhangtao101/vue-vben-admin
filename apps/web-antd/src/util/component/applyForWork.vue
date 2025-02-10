<script setup lang="ts">
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref, watch } from 'vue';

import {
  GrommetIconsUpdate,
  HugeiconsRenewableEnergy,
  UilReporter,
} from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Empty,
  InputNumber,
  message,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getWorkSheetFinishSituationDetailsByWorkCode,
  worksheetReportUpdate,
} from '#/api';

const prop = defineProps({
  workSheetCode: {
    type: String,
    default: () => '',
    required: true,
  },
  operation: {
    type: Boolean,
    default: () => false,
    required: true,
  },
});

// region 表格
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  editConfig: {
    trigger: 'click',
    mode: 'row',
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'reportCode', title: '报工单号', minWidth: 300 },
    { field: 'processCode', title: '工序编号', minWidth: 150 },
    { field: 'processName', title: '报工工序', minWidth: 150 },
    {
      field: 'dlValue',
      title: '能耗电量',
      editRender: {},
      // slots: { edit: 'edit_dlValue' },
      minWidth: 150,
    },
    {
      field: 'trqValue',
      title: '能耗天然气',
      editRender: {},
      // slots: { edit: 'edit_trqValue' },
      minWidth: 150,
    },
    {
      field: 'jlqValue',
      title: '能耗焦炉气',
      editRender: {},
      // slots: { edit: 'edit_jlqValue' },
      minWidth: 150,
    },
    {
      field: 'smjValue',
      title: '能耗水煤浆',
      editRender: {},
      // slots: { edit: 'edit_smjValue' },
      minWidth: 150,
    },
    { field: 'reportTime', title: '报工时间', minWidth: 200 },
    { field: 'reportUser', title: '报工人', minWidth: 150 },
    { field: 'workstationCode', title: '工作站编号', minWidth: 150 },
    { field: 'workstationName', title: '工作站名称', minWidth: 150 },
    { field: 'defectCode', title: '缺陷代码', minWidth: 150 },
    { field: 'productCode', title: '产品编号', minWidth: 150 },
    { field: 'productName', title: '产品名称', minWidth: 150 },
    { field: 'reportNumber', title: '报工总数', minWidth: 150 },
    {
      field: 'qualityNumber',
      slots: { edit: 'edit_qualityNumber' },
      title: '良品数',
      minWidth: 150,
    },
    {
      field: 'unqualityNumber',
      slots: { edit: 'edit_unqualityNumber' },
      title: '废品数',
      minWidth: 150,
    },
    { field: 'waiteNumber', title: '等待处理数量', minWidth: 150 },
    {
      field: 'personTime',
      title: '人时',
      editRender: {},
      slots: { edit: 'edit_personTime' },
      minWidth: 150,
    },
    {
      field: 'equipTime',
      title: '机时',
      editRender: {},
      slots: { edit: 'edit_equipTime' },
      minWidth: 150,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 220,
    },
  ],
  height: 450,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return prop.workSheetCode
          ? await queryData({
              page: page.currentPage,
              pageSize: page.pageSize,
            })
          : Promise.resolve({
              total: 0,
              items: [],
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

// endregion

// region 查询数据

/**
 * 从服务器查询工作站数据的函数。
 * 这个函数用于发送查询请求，并在成功获取数据后更新组件的状态。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      workSheetCode: prop.workSheetCode, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    };
    /**
     * 调用 queryWorkstation 函数，传入查询参数和分页信息。
     * 查询参数包括 queryParams.value 中的所有属性，以及当前页码和每页大小。
     */
    getWorkSheetFinishSituationDetailsByWorkCode(params)
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

// region 冲红

/**
 * 冲红
 * @param row
 */
function flushRed(row: any) {
  row.loading = true;
  worksheetReportUpdate(row)
    .then(() => {
      message.success($t('common.successfulOperation')); // 成功操作的提示信息（通过国际化处理）
    })
    .finally(() => {
      row.loading = false;
    });
}

// endregion

// region 人员报工数据编辑
// 是否显示人员报工抽屉
const reportForWorkDrawer = ref(false);
// 当前编辑的人员报工信息
const editDetails = ref<any>([]);

/**
 * 显示人员报工数据抽屉
 * @param row
 */
function showReportForWorkDrawer(row: any) {
  reportForWorkDrawer.value = true;
  editDetails.value = row.details;
}

/**
 * 能源报工抽屉关闭时, 清空当前编辑信息
 */
function reportForWorkDrawerClose() {
  reportForWorkDrawer.value = false;
  editDetails.value = [];
}
// endregion

// region 能源采集数据编辑
// 是否显示能源采集抽屉
const energyHarvestingDrawer = ref(false);
// 当前编辑的能源采集信息
const editEnergyHarvesting = ref<any>([]);

/**
 * 显示能源采集数据抽屉
 * @param row
 */
function showEnergyHarvestingDrawer(row: any) {
  energyHarvestingDrawer.value = true;
  editEnergyHarvesting.value = row.energyCatchDetails;
}

/**
 * 能源报工抽屉关闭时, 清空当前编辑信息
 */
function reportenergyHarvestingDrawerClose() {
  reportForWorkDrawer.value = false;
  editEnergyHarvesting.value = [];
}

function getTypeText(type: number) {
  switch (type) {
    case 1: {
      return '电';
    }
    case 2: {
      return '天然气';
    }
    case 3: {
      return '水煤浆';
    }
    case 4: {
      return '焦炉';
    }
    default: {
      return '未定义的能源类型';
    }
  }
}
// endregion

watch(
  () => prop.workSheetCode,
  () => {
    gridApi.reload();
  },
);
onMounted(() => {});
</script>

<template>
  <!-- region 表格主体 -->
  <Card class="mt-4" v-if="workSheetCode">
    <Grid>
      <!-- 能耗电量 -->
      <template #edit_dlValue="{ row }">
        <InputNumber v-model:value="row.dlValue" :min="0" />
      </template>
      <!-- 能耗天然气 -->
      <template #edit_trqValue="{ row }">
        <InputNumber v-model:value="row.trqValue" :min="0" />
      </template>
      <!-- 能耗焦炉气 -->
      <template #edit_jlqValue="{ row }">
        <InputNumber v-model:value="row.jlqValue" :min="0" />
      </template>
      <!-- 能耗水煤浆 -->
      <template #edit_smjValue="{ row }">
        <InputNumber v-model:value="row.smjValue" :min="0" />
      </template>
      <!-- 人时 -->
      <template #edit_personTime="{ row }">
        <InputNumber v-model:value="row.personTime" :min="0" />
      </template>
      <!-- 机时 -->
      <template #edit_equipTime="{ row }">
        <InputNumber v-model:value="row.equipTime" :min="0" />
      </template>
      <!-- 良品数 -->
      <template #edit_qualityNumber="{ row }">
        <InputNumber
          v-model:value="row.qualityNumber"
          :min="0"
          @change="
            () => {
              row.reportNumber = row.qualityNumber + row.unqualityNumber;
            }
          "
        />
      </template>
      <!-- 废品数 -->
      <template #edit_unqualityNumber="{ row }">
        <InputNumber
          v-model:value="row.unqualityNumber"
          :min="0"
          @change="
            () => {
              row.reportNumber = row.qualityNumber + row.unqualityNumber;
            }
          "
        />
      </template>

      <template #action="{ row }">
        <!-- 冲红 -->
        <Tooltip>
          <template #title>
            {{ $t('common.flushRed') }}
          </template>
          <Button
            :icon="h(GrommetIconsUpdate, { class: 'inline-block size-6' })"
            :loading="row.loading"
            class="mr-4"
            type="link"
            @click="flushRed(row)"
            v-if="operation"
          />
        </Tooltip>

        <!-- 人员报工 -->
        <Tooltip>
          <template #title>
            {{ $t('common.personnelReport') }}
          </template>
          <Button
            :icon="h(UilReporter, { class: 'inline-block size-6' })"
            :loading="row.loading"
            class="mr-4"
            type="link"
            @click="showReportForWorkDrawer(row)"
            v-if="operation"
          />
        </Tooltip>
        <!-- 能源采集 -->
        <Tooltip>
          <template #title>
            {{ $t('common.energyHarvesting') }}
          </template>
          <Button
            :icon="
              h(HugeiconsRenewableEnergy, { class: 'inline-block size-6' })
            "
            :loading="row.loading"
            class="mr-4"
            type="link"
            @click="showEnergyHarvestingDrawer(row)"
            v-if="operation"
          />
        </Tooltip>
      </template>
    </Grid>
  </Card>
  <!-- endregion -->
  <!-- region 人员报工信息编辑 -->
  <Drawer
    v-model:open="reportForWorkDrawer"
    :footer-style="{ textAlign: 'right' }"
    :width="700"
    placement="right"
    title="人员报工信息编辑"
    @close="reportForWorkDrawerClose"
  >
    <div v-if="editDetails && editDetails.length > 0">
      <Descriptions bordered v-for="item of editDetails" :key="item.id">
        <DescriptionsItem label="报工总数">
          {{ item.reportNumber }}
        </DescriptionsItem>
        <DescriptionsItem label="良品数">
          <InputNumber
            v-model:value="item.qualityNumber"
            :min="0"
            @change="
              () => {
                item.reportNumber = item.qualityNumber + item.unqualityNumber;
              }
            "
          />
        </DescriptionsItem>
        <DescriptionsItem label="废品数">
          <InputNumber
            v-model:value="item.unqualityNumber"
            :min="0"
            @change="
              () => {
                item.reportNumber = item.qualityNumber + item.unqualityNumber;
              }
            "
          />
        </DescriptionsItem>
        <DescriptionsItem label="人时">
          <InputNumber v-model:value="item.personTime" :min="0" />
        </DescriptionsItem>
        <DescriptionsItem label="报工人">
          {{ item.reportPerson }}
        </DescriptionsItem>
      </Descriptions>
    </div>
    <Empty v-else description="暂无具体人员的报工数据" />
  </Drawer>
  <!-- endregion -->
  <!-- region 能源采集信息编辑 -->
  <Drawer
    v-model:open="energyHarvestingDrawer"
    :footer-style="{ textAlign: 'right' }"
    :width="720"
    placement="right"
    title="能源采集信息编辑"
    @close="reportenergyHarvestingDrawerClose"
  >
    <div v-if="editEnergyHarvesting && editEnergyHarvesting.length > 0">
      <Descriptions
        bordered
        v-for="item of editEnergyHarvesting"
        :column="2"
        :key="item.id"
        class="mb-8"
      >
        <DescriptionsItem label="能源类型">
          {{ getTypeText(item.energyType) }}
        </DescriptionsItem>
        <DescriptionsItem label="仪表编号">
          {{ item.energyEquipCode }}
        </DescriptionsItem>
        <DescriptionsItem label="仪表读数">
          <InputNumber v-model:value="item.energyValue" :min="0" />
        </DescriptionsItem>
        <DescriptionsItem label="异常说明">
          {{ item.errorName }}
        </DescriptionsItem>
        <DescriptionsItem label="工单号">
          {{ item.worksheetCode }}
        </DescriptionsItem>
        <DescriptionsItem label="采集任务号">
          {{ item.catchCode }}
        </DescriptionsItem>
        <DescriptionsItem label="采集人">
          {{ item.catchUser }}
        </DescriptionsItem>
        <DescriptionsItem label="采集时间">
          {{ item.catchTime }}
        </DescriptionsItem>
        <DescriptionsItem label="备注">
          {{ item.remark }}
        </DescriptionsItem>
      </Descriptions>
    </div>
    <Empty v-else description="暂无具体的能源采集数据" />
  </Drawer>
  <!-- endregion -->
</template>

<style scoped></style>
