<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { nextTick, ref } from 'vue';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Spin,
  Table,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getProductDetailByParam,
  getProductProceList,
} from '#/api/tracingModule/productFlowRecord.service';
import { $t } from '#/locales';

// ========== 二维码输入 ==========
const inputQrcode = ref('');

// ========== 状态控制 ==========
const loading = ref(false);
const mainShow = ref(false);
const hasTableData = ref(false);

// ========== 产品信息 ==========
const formData = ref<any>({});

// ========== 详情抽屉 ==========
const drawerVisible = ref(false);
const drawerTitle = ref('');
const detailLoading = ref(false);

// ========== 不良详情 ==========
const popData = ref<any>({});
const badDetailList = ref<any[]>([]);

// ========== 维修详情 ==========
const materialData = ref<any[]>([]);

// ========== 主表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 60, title: $t('tracingModule.productTrace.seq') },
    { field: 'transferTime', title: $t('tracingModule.productTrace.time'), minWidth: 150 },
    { field: 'qrcode', title: $t('tracingModule.productTrace.qrcode'), minWidth: 150 },
    { field: 'processCode', title: $t('tracingModule.productFlowRecord.processCode'), minWidth: 100 },
    { field: 'processName', title: $t('tracingModule.productTrace.processName'), minWidth: 120 },
    { field: 'equipCode', title: $t('tracingModule.productTrace.equipCode'), minWidth: 80 },
    { field: 'equipName', title: $t('tracingModule.productTrace.equipName'), minWidth: 150 },
    { field: 'lineName', title: $t('tracingModule.productTrace.lineName'), minWidth: 120 },
    { field: 'productState', title: $t('tracingModule.productFlowRecord.productState'), minWidth: 80 },
    { field: 'opUser', title: $t('tracingModule.productFlowRecord.opUser'), minWidth: 80 },
    {
      field: 'action',
      title: $t('tracingModule.productTrace.detail'),
      width: 100,
      slots: { default: 'action' },
    },
  ],
  height: 500,
  pagerConfig: { enabled: false },
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const gridEvents: any = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// ========== 查询 ==========
function handleSearch() {
  const qr = inputQrcode.value.trim();
  if (!qr) {
    message.warning($t('tracingModule.productTrace.qrcodePlaceholder'));
    return;
  }

  formData.value = {};
  loading.value = true;
  mainShow.value = true;
  hasTableData.value = false;

  getProductProceList({ qrcode: qr })
    .then((res: any) => {
      if (res) {
        formData.value = res;
        const list = res.turnList || [];
        nextTick(() => {
          gridApi.grid.reloadData(list);
        });
        hasTableData.value = list.length > 0;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

// ========== 重置 ==========
function handleReset() {
  inputQrcode.value = '';
  mainShow.value = false;
  hasTableData.value = false;
  formData.value = {};
  gridApi.grid.reloadData([]);
}

// ========== 查看详情 ==========
function handleDetail(row: any) {
  const productState = row.productState ?? '';
  const params = {
    qrcode: row.qrcode,
    processCode: row.processCode,
    processName: row.processName,
    time: row.transferTime,
    productState,
    equipCode: row.equipCode,
  };

  popData.value = {};
  badDetailList.value = [];
  materialData.value = [];
  detailLoading.value = true;

  getProductDetailByParam(params)
    .then((resData: any) => {
      if (!resData) return;

      if (productState === '不良' || productState === $t('tracingModule.productFlowRecord.defective')) {
        drawerTitle.value =
          row.processCode + '（' + row.processName + '）';
        popData.value = {
          ...resData.defectRecord,
          transferTime: row.transferTime,
          opUser: row.opUser,
          lineName: row.lineName,
        };
        badDetailList.value = resData.defectDetailList || [];
      } else if (row.processName === '维修') {
        drawerTitle.value = $t('tracingModule.productFlowRecord.repairDetail');
        popData.value = resData.repairRecord || {};
        materialData.value = resData.repairMaterialList || [];
      } else if (row.processName === '包装') {
        drawerTitle.value = $t('tracingModule.productFlowRecord.packingDetail');
        popData.value = resData.packingTraceDTO || {};
      }
      drawerVisible.value = true;
    })
    .finally(() => {
      detailLoading.value = false;
    });
}
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="{ inputQrcode }" layout="inline">
        <FormItem :label="$t('tracingModule.productTrace.qrcodeInput')" style="margin-bottom: 1em">
          <Input
            v-model:value="inputQrcode"
            :placeholder="$t('tracingModule.productFlowRecord.qrcodePlaceholder')"
            allow-clear
            style="width: 250px"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="handleSearch">
            <Icon icon="mdi:magnify" class="mr-1" />
            {{ $t('tracingModule.productTrace.search') }}
          </Button>
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button @click="handleReset">
            <Icon icon="mdi:refresh" class="mr-1" />
            {{ $t('common.reset') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 主内容区域 -->
    <Spin :spinning="loading">
      <template v-if="mainShow">
        <!-- 产品基本信息 -->
        <Card :title="$t('tracingModule.productTrace.productInfo')" class="!mb-4">
          <Descriptions :column="3" bordered size="small">
            <Descriptions.Item :label="$t('tracingModule.productTrace.productName')" :span="2">
              {{ formData.productName }}
            </Descriptions.Item>
            <Descriptions.Item :label="$t('tracingModule.productTrace.productCode')">
              {{ formData.productCode }}
            </Descriptions.Item>
            <Descriptions.Item :label="$t('tracingModule.productTrace.planCode')" :span="2">
              {{ formData.planCode }}
            </Descriptions.Item>
            <Descriptions.Item :label="$t('tracingModule.productTrace.customerName')">
              {{ formData.customerName }}
            </Descriptions.Item>
            <Descriptions.Item :label="$t('tracingModule.productTrace.qrcode')" :span="3">
              {{ formData.qrcode }}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <!-- 流转记录表格 -->
        <Card v-if="hasTableData" :title="$t('tracingModule.productTrace.processTrace')">
          <Grid>
            <template #toolbar-tools></template>
            <template #action="{ row }">
              <Button
                v-if="row.status === 1"
                type="link"
                size="small"
                @click="handleDetail(row)"
              >
                {{ $t('tracingModule.productTrace.detail') }}
              </Button>
            </template>
          </Grid>
        </Card>
      </template>
    </Spin>

    <!-- 详情抽屉 -->
    <Drawer
      v-model:open="drawerVisible"
      :title="drawerTitle"
      width="70%"
      destroy-on-close
      :footer-style="{ textAlign: 'right' }"
    >
      <Spin :spinning="detailLoading">
        <!-- 不良详情 -->
        <template v-if="badDetailList.length > 0">
          <!-- 质检详情一览 -->
          <Card :title="$t('tracingModule.productFlowRecord.qcOverview')" size="small" class="!mb-4">
            <Descriptions :column="2" bordered size="small">
              <Descriptions.Item :label="$t('tracingModule.productTrace.opTime')">
                {{ popData.transferTime }}
              </Descriptions.Item>
              <Descriptions.Item :label="$t('tracingModule.productTrace.opUserName')">
                {{ popData.opUser }}
              </Descriptions.Item>
              <Descriptions.Item :label="$t('tracingModule.productFlowRecord.judgmentResult')" :span="2">
                {{ $t('tracingModule.productFlowRecord.defective') }}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <!-- 不良一览 -->
          <Card :title="$t('tracingModule.productTrace.defectList')" size="small">
            <Descriptions :column="3" bordered size="small" class="!mb-4">
              <Descriptions.Item :label="$t('tracingModule.productTrace.workSheetCode')">
                {{ popData.worksheetCode }}
              </Descriptions.Item>
              <Descriptions.Item :label="$t('tracingModule.productTrace.lineName')">
                {{ popData.lineName }}
              </Descriptions.Item>
              <Descriptions.Item :label="$t('tracingModule.productTrace.defectNumber')">
                {{ popData.defectNumber }}
              </Descriptions.Item>
            </Descriptions>

            <p class="mb-2 pl-2 font-semibold">{{ $t('tracingModule.productTrace.defectList') }}:</p>
            <Table
              :data-source="badDetailList"
              :columns="[
                { title: $t('tracingModule.productTrace.defectCode'), dataIndex: 'defectCode', align: 'center', width: 120 },
                { title: $t('tracingModule.productTrace.defectName'), dataIndex: 'defectName', align: 'center', width: 150 },
                { title: $t('tracingModule.productTrace.defectNumber'), dataIndex: 'defectNumber', align: 'center', width: 100 },
                { title: $t('tracingModule.productTrace.location'), dataIndex: 'location', align: 'center', width: 150 },
              ]"
              :pagination="false"
              size="small"
              bordered
              row-key="defectCode"
            />
          </Card>
        </template>

        <!-- 维修详情 -->
        <template v-if="drawerTitle === $t('tracingModule.productFlowRecord.repairDetail')">
          <Card :title="$t('tracingModule.productFlowRecord.repairDetail')" size="small" class="!mb-4">
            <Descriptions :column="2" bordered size="small">
              <Descriptions.Item :label="$t('tracingModule.productTrace.qrcode')">
                {{ popData.qrCode }}
              </Descriptions.Item>
              <Descriptions.Item :label="$t('tracingModule.productFlowRecord.thisNumber')">
                {{ popData.number }}
              </Descriptions.Item>
              <Descriptions.Item :label="$t('tracingModule.productFlowRecord.repairTime')">
                {{ popData.createTime }}
              </Descriptions.Item>
              <Descriptions.Item :label="$t('tracingModule.productFlowRecord.repairUser')">
                {{ popData.repairUserName }}
              </Descriptions.Item>
              <Descriptions.Item :label="$t('tracingModule.productFlowRecord.repairResult')">
                {{ popData.repairStatus === 1 ? $t('tracingModule.productFlowRecord.qualifed') : $t('tracingModule.productFlowRecord.scrapped') }}
              </Descriptions.Item>
              <Descriptions.Item :label="$t('tracingModule.productTrace.defectCode')">
                {{ popData.defectCode }}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <!-- 使用物料清单 -->
          <Card :title="$t('tracingModule.productFlowRecord.materialListUse')" size="small">
            <Table
              :data-source="materialData"
              :columns="[
                { title: $t('tracingModule.productTrace.seq'), align: 'center', width: 60 },
                { title: $t('tracingModule.productTrace.materialCode'), dataIndex: 'materialCode', align: 'center', width: 120 },
                { title: $t('tracingModule.productTrace.materialName'), dataIndex: 'materialName', align: 'center', width: 180 },
                { title: $t('tracingModule.productFlowRecord.materialCount'), dataIndex: 'number', align: 'center', width: 100 },
              ]"
              :pagination="false"
              size="small"
              bordered
              row-key="materialCode"
            >
              <template #bodyCell="{ column, index }">
                <template v-if="column.title === $t('tracingModule.productTrace.seq')">
                  {{ index + 1 }}
                </template>
              </template>
            </Table>
          </Card>
        </template>

        <!-- 包装详情 -->
        <template v-if="drawerTitle === $t('tracingModule.productFlowRecord.packingDetail')">
          <Card :title="$t('tracingModule.productFlowRecord.packingDetail')" size="small">
            <Descriptions :column="2" bordered size="small">
              <Descriptions.Item :label="$t('tracingModule.productTrace.packingCode')">
                {{ popData.packingCode }}
              </Descriptions.Item>
              <Descriptions.Item :label="$t('tracingModule.productTrace.packingType')">
                {{ popData.stateName }}
              </Descriptions.Item>
              <Descriptions.Item :label="$t('tracingModule.productTrace.packingTime')">
                {{ popData.opTime }}
              </Descriptions.Item>
              <Descriptions.Item :label="$t('tracingModule.productTrace.packingUser')">
                {{ popData.opUserName }}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </template>
      </Spin>

      <template #footer>
        <Button @click="drawerVisible = false">{{ $t('tracingModule.productTrace.close') }}</Button>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
