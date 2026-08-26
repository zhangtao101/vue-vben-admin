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
  Input,
  message,
  Modal,
  Spin,
  Table,
  Tabs,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getPartTraceList,
  getSendCheckDetail,
  getTraceList,
} from '#/api/tracingModule/productTrace.service';
import { $t } from '#/locales';

import ProcessDetail from '../../util/component/tracingModule/ProcessDetail.vue';

// ========== 二维码输入 ==========
const inputQrcode = ref('');

// ========== 查询状态 ==========
const loading = ref(false);

// ========== 顶部产品信息 ==========
const hearList = ref<any>({});
const qrcodeList = ref<any[]>([]);
const materialList = ref<any[]>([]);
const showReturn = ref(false);

// ========== 表格数据状态 ==========
const hasTableData = ref(false);

// ========== 弹窗控制 ==========
const bomVisible = ref(false);
const pasteVisible = ref(false);
const detailVisible = ref(false);
const inspectionVisible = ref(false);
const detailTitle = ref('');
const detailRow = ref<any>(null);

// ========== 送检数据 ==========
const inspectionData = ref<any>({});
const inspectionDetailList = ref<any[]>([]);

// ========== 图片预览 ==========
const previewVisible = ref(false);
const previewUrl = ref('');

// ========== BOM 表格 ==========
const bomColumns: any[] = [
  { title: $t('tracingModule.productTrace.seq'), align: 'center', width: 60 },
  { title: $t('tracingModule.productTrace.isLowestLevel'), dataIndex: 'isLowestLevel', align: 'center', width: 80 },
  { title: $t('tracingModule.productTrace.orderNumber'), dataIndex: 'orderNumber', align: 'center', width: 80 },
  { title: $t('tracingModule.productTrace.parentCode'), dataIndex: 'parentCode', align: 'center', width: 120 },
  { title: $t('tracingModule.productTrace.materialCode'), dataIndex: 'materialCode', align: 'center', width: 120 },
  { title: $t('tracingModule.productTrace.materialName'), dataIndex: 'materialName', align: 'center', minWidth: 120 },
  { title: $t('tracingModule.productTrace.perDosage'), dataIndex: 'perDosage', align: 'center', width: 100 },
  { title: $t('tracingModule.productTrace.perQuantity'), dataIndex: 'perQuantity', align: 'center', width: 100 },
  { title: $t('tracingModule.productTrace.singleDosage'), dataIndex: 'singleDosage', align: 'center', width: 100 },
  { title: $t('tracingModule.productTrace.unit'), dataIndex: 'unit', align: 'center', width: 80 },
  { title: $t('tracingModule.productTrace.materialDosage'), dataIndex: 'materialDosage', align: 'center', width: 100 },
  { title: $t('tracingModule.productTrace.auxiliaryDoage'), dataIndex: 'auxiliaryDoage', align: 'center', width: 100 },
  { title: $t('tracingModule.productTrace.auxiliaryUnit'), dataIndex: 'auxiliaryUnit', align: 'center', width: 100 },
  { title: $t('tracingModule.productTrace.bomDesage'), dataIndex: 'bomDesage', align: 'center', width: 100 },
];

// ========== 主表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 60, title: $t('tracingModule.productTrace.seq') },
    { field: 'opTime', title: $t('tracingModule.productTrace.time'), minWidth: 150 },
    { field: 'processName', title: $t('tracingModule.productTrace.processName'), minWidth: 120 },
    { field: 'processTypeName', title: $t('tracingModule.productTrace.processTypeName'), minWidth: 100 },
    { field: 'lineName', title: $t('tracingModule.productTrace.lineName'), minWidth: 120 },
    { field: 'equipName', title: $t('tracingModule.productTrace.equipName'), minWidth: 120 },
    { field: 'userName', title: $t('tracingModule.productTrace.userName'), minWidth: 100 },
    {
      field: 'state',
      title: $t('tracingModule.productTrace.state'),
      minWidth: 100,
      slots: { default: 'state' },
    },
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

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// ========== 搜索 ==========
function handleSearch() {
  const qr = inputQrcode.value.trim();
  if (!qr) {
    message.warning($t('tracingModule.productTrace.qrcodePlaceholder'));
    return;
  }

  loading.value = true;
  getTraceList({ qrcode: qr })
    .then((res: any) => {
      showReturn.value = true;
      hasTableData.value = true;
      hearList.value = res || {};
      nextTick(() => {
        gridApi.grid.reloadData(res?.routeList || []);
      });
      materialList.value = res?.materialList || [];
      qrcodeList.value = res?.qrcodeList || [];
    })
    .finally(() => {
      loading.value = false;
    });
}

// ========== 关联条码点击 ==========
function handleBarcodeClick(item: any) {
  loading.value = true;
  getPartTraceList({ qrcode: item.qrcode, productCode: item.productCode })
    .then((res: any) => {
      hearList.value = res || {};
      nextTick(() => {
        gridApi.grid.reloadData(res?.routeList || []);
      });
      materialList.value = res?.materialList || [];
      qrcodeList.value = res?.qrcodeList || [];
      showReturn.value = true;
      hasTableData.value = true;
    })
    .finally(() => {
      loading.value = false;
    });
}

// ========== 查看物料清单 ==========
function handleViewBom() {
  bomVisible.value = true;
}

// ========== 详情 ==========
function handleDetail(row: any) {
  const r = { ...row, time: row.opTime };

  const codeKeyMap: Record<string, string> = {
    'SMT-SY': 'tracingModule.productTrace.smtSy',
    'SMT-BZ': 'tracingModule.productTrace.smtBz',
    'SMT-AOI': 'tracingModule.productTrace.smtAoi',
    'SMT-TP': 'tracingModule.productTrace.smtTp',
    'SMT-QA': 'tracingModule.productTrace.smtQa',
    'SMT-HLH': 'tracingModule.productTrace.smtHlh',
    'DIP-AOI': 'tracingModule.productTrace.dipAoi',
    'DIP-BFH': 'tracingModule.productTrace.dipBfh',
    'DIP-BH': 'tracingModule.productTrace.dipBh',
    'DIP-QC': 'tracingModule.productTrace.dipQc',
    'DIP-ICT': 'tracingModule.productTrace.dipIct',
    'DIP-FCT': 'tracingModule.productTrace.dipFct',
    'DIP-BZ': 'tracingModule.productTrace.dipBz',
    'DIP-QA': 'tracingModule.productTrace.dipQa',
  };

  const nameKeyMap: Record<string, string> = {
    '插件': 'tracingModule.productTrace.plugin',
    '出货': 'tracingModule.productTrace.shipment',
  };

  const i18nKey =
    codeKeyMap[r.processCode] ||
    nameKeyMap[r.processName] ||
    'tracingModule.productTrace.detail';
  const title = $t(i18nKey);
  detailTitle.value = title;
  detailRow.value = r;

  if (r.processCode === 'SMT-TP') {
    pasteVisible.value = true;
  } else {
    detailVisible.value = true;
  }
}

// ========== 贴片页-物料条码点击 ==========
function _handlePasteMaterialClick(row: any) {
  inspectionVisible.value = true;
  getSendCheckDetail(row.sendFormId)
    .then((res: any) => {
      const detail = res || {};
      switch (detail.checkResult) {
        case 1: {
          detail.checkResultName = $t('tracingModule.productTrace.qualifyStatus');
          break;
        }
        case 2: {
          detail.checkResultName = $t('tracingModule.productTrace.failStatus');
          break;
        }
        case 3: {
          detail.checkResultName = $t('tracingModule.productTrace.concession');
          break;
        }
        case 4: {
          detail.checkResultName = $t('tracingModule.productTrace.urgentRelease');
          break;
        }
        // No default
      }
      inspectionData.value = detail;
      inspectionDetailList.value = detail.labelList || [];
    });
}

void _handlePasteMaterialClick;

// 状态颜色
function getStateColor(state: string) {
  if (state === '不良') return 'red';
  return 'green';
}
</script>

<template>
  <Page>
    <!-- 输入区域 -->
    <Card class="!mb-4">
      <div class="flex items-center gap-3">
        <span class="whitespace-nowrap font-medium">{{ $t('tracingModule.productTrace.qrcodeInput') }}：</span>
        <Input
          v-model:value="inputQrcode"
          :placeholder="$t('tracingModule.productTrace.qrcodePlaceholder')"
          allow-clear
          class="w-80"
          @press-enter="handleSearch"
        >
          <template #prefix>
            <Icon icon="mdi:barcode-scan" class="text-gray-400 dark:text-gray-500" />
          </template>
        </Input>
        <Button type="primary" :loading="loading" @click="handleSearch">
          <Icon icon="mdi:magnify" class="mr-1" />
          {{ $t('tracingModule.productTrace.search') }}
        </Button>
      </div>
    </Card>

    <Spin :spinning="loading">
      <!-- 产品基本信息 -->
      <Card v-if="hearList.productName" :title="$t('tracingModule.productTrace.productInfo')" class="!mb-4">
        <Descriptions :column="3" bordered size="small">
          <Descriptions.Item :label="$t('tracingModule.productTrace.productName')">
            {{ hearList.productName }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('tracingModule.productTrace.planCode')">
            {{ hearList.planCode }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('tracingModule.productTrace.productCode')">
            {{ hearList.productCode }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('tracingModule.productTrace.customerName')">
            {{ hearList.customerName }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('tracingModule.productTrace.qrcode')">
            {{ hearList.qrcode }}
          </Descriptions.Item>
          <Descriptions.Item>
            <Button type="primary" size="small" @click="handleViewBom">
              {{ $t('tracingModule.productTrace.viewBom') }}
            </Button>
          </Descriptions.Item>
          <Descriptions.Item :label="$t('tracingModule.productTrace.relatedBarcode')" :span="2">
            <template v-if="qrcodeList.length > 0">
              <Tag
                v-for="(item, idx) in qrcodeList"
                :key="idx"
                color="blue"
                class="cursor-pointer"
                @click="handleBarcodeClick(item)"
              >
                {{ item.qrcode }}
              </Tag>
            </template>
            <span v-else>-</span>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <!-- 过程追溯表格 -->
      <Card v-if="hasTableData" :title="$t('tracingModule.productTrace.processTrace')">
        <Grid>
          <template #toolbar-tools></template>
          <template #state="{ row }">
            <Tag :color="getStateColor(row.state)">
              {{ row.state }}
            </Tag>
          </template>
          <template #action="{ row }">
            <Button type="link" size="small" @click="handleDetail(row)">
              {{ $t('tracingModule.productTrace.detail') }}
            </Button>
          </template>
        </Grid>
      </Card>
    </Spin>

    <!-- BOM物料清单弹窗 -->
    <Modal
      v-model:open="bomVisible"
      :title="$t('tracingModule.productTrace.viewBom')"
      width="900px"
      :footer="null"
      destroy-on-close
    >
      <Tabs default-active-key="first">
        <Tabs.TabPane key="first" :tab="$t('tracingModule.productTrace.designBom')">
          <Table
            :data-source="materialList"
            :columns="bomColumns"
            :pagination="false"
            size="small"
            bordered
            row-key="materialCode"
            :row-class-name="(_record: any, index: number) => (index % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-800')"
          >
            <template #bodyCell="{ column, index, record }">
              <template v-if="column.title === $t('tracingModule.productTrace.seq')">
                {{ index + 1 }}
              </template>
              <template v-else-if="column.dataIndex === 'isLowerestLevel'">
                <span v-if="record.isLowestLevel">✔</span>
              </template>
            </template>
          </Table>
        </Tabs.TabPane>
      </Tabs>
    </Modal>

    <!-- 贴片详情弹窗 -->
    <Drawer
      v-model:open="pasteVisible"
      :title="detailTitle"
      width="900px"
      destroy-on-close
      :footer-style="{ textAlign: 'right' }"
    >
      <template v-if="detailRow">
        <ProcessDetail
          v-if="detailRow.processCode"
          :row="detailRow"
          :title="detailTitle"
        />
      </template>
      <template #footer>
        <Button @click="pasteVisible = false">{{ $t('tracingModule.productTrace.close') }}</Button>
      </template>
    </Drawer>

    <!-- 通用工序详情弹窗 -->
    <Drawer
      v-model:open="detailVisible"
      :title="detailTitle"
      width="900px"
      destroy-on-close
      :footer-style="{ textAlign: 'right' }"
    >
      <template v-if="detailRow">
        <ProcessDetail
          :row="detailRow"
          :title="detailTitle"
        />
      </template>
      <template #footer>
        <Button @click="detailVisible = false">{{ $t('tracingModule.productTrace.close') }}</Button>
      </template>
    </Drawer>

    <!-- 送检详情弹窗 -->
    <Drawer
      v-model:open="inspectionVisible"
      :title="$t('tracingModule.productTrace.qcInspection')"
      width="900px"
      destroy-on-close
      :footer-style="{ textAlign: 'right' }"
    >
      <template v-if="inspectionData.formCode">
        <Descriptions :column="3" bordered size="small" class="!mb-4">
          <Descriptions.Item :label="$t('tracingModule.productTrace.sendCheckFormCode')">
            {{ inspectionData.formCode }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('tracingModule.productTrace.sendDate')">
            {{ inspectionData.sendDate }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('tracingModule.productTrace.sendRemark')" :span="1">
            {{ inspectionData.remark }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('tracingModule.productTrace.checkResult')">
            {{ inspectionData.checkResultName }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('tracingModule.productTrace.judgeTime')">
            {{ inspectionData.judgeTime }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('tracingModule.productTrace.receiveNumber')">
            {{ inspectionData.receiveNumber }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('tracingModule.productTrace.checkNumber')">
            {{ inspectionData.checkNumber }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('tracingModule.productTrace.qualifiedNumber')">
            {{ inspectionData.qualifiedNumber }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('tracingModule.productTrace.unqualified')">
            {{ inspectionData.checkNumber - inspectionData.qualifiedNumber || 0 }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('tracingModule.productTrace.checkRemark')" :span="3">
            {{ inspectionData.checkRemark }}
          </Descriptions.Item>
        </Descriptions>
        <Table
          :data-source="inspectionDetailList"
          :columns="[
            { title: $t('tracingModule.productTrace.materialCode'), dataIndex: 'materialCode', width: 120 },
            { title: $t('tracingModule.productTrace.materialName'), dataIndex: 'materialName', width: 200 },
            { title: $t('tracingModule.productTrace.unit'), dataIndex: 'unit', width: 80 },
            { title: $t('tracingModule.productTrace.sendNumber'), dataIndex: 'sendNumber', width: 100 },
            { title: $t('tracingModule.productTrace.labelCode'), dataIndex: 'labelCode', width: 120 },
            { title: $t('tracingModule.productTrace.manufacturerName'), dataIndex: 'manufacturerName', width: 150 },
            { title: $t('tracingModule.productTrace.batchCode'), dataIndex: 'batchCode', width: 120 },
            { title: $t('tracingModule.productTrace.qualifiedNumber'), dataIndex: 'qualifiedNumber', width: 100 },
            { title: $t('tracingModule.productTrace.unqualifiedNumber'), dataIndex: 'unqualifiedNumber', width: 100 },
          ]"
          :pagination="false"
          size="small"
          bordered
          row-key="materialCode"
        />
      </template>
      <template #footer>
        <Button @click="inspectionVisible = false">{{ $t('tracingModule.productTrace.close') }}</Button>
      </template>
    </Drawer>

    <!-- 图片预览 -->
    <Modal v-model:open="previewVisible" :title="$t('tracingModule.productTrace.preview')" :footer="null" width="700px">
      <img :src="previewUrl" style="width:100%;height:auto" />
    </Modal>
  </Page>
</template>
