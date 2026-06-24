<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { Modal, Spin, Table } from 'ant-design-vue';

import { getTraceDetail } from '#/api/tracingModule/productTrace.service';
import { $t } from '#/locales';

interface Props {
  row: any;
  title: string;
}

const props = defineProps<Props>();
const loading = ref(false);
const proceDetail = ref<any>([]);
const qcList = ref<any>([]);
const paramList = ref<any>([]);
const defectList = ref<any>([]);
const qcDetail = ref<any>([]);

const showParamList = computed(() => paramList.value && paramList.value.length > 0);
const showQcList = computed(() => qcList.value && qcList.value.length > 0);
const showQcDetail = computed(() => qcDetail.value && qcDetail.value.length > 0);
const showDefectList = computed(() => defectList.value && defectList.value.length > 0);
const showProceDetail = computed(() => proceDetail.value && proceDetail.value.length > 0);

// 图片预览
const previewVisible = ref(false);
const previewUrl = ref('');

function handleImagePreview(row: any) {
  if (row.measureMethodTypeName === '\u6587\u4EF6\u578B' && row.url) {
    previewUrl.value = row.url;
    previewVisible.value = true;
  }
}

function fetchData() {
  const row = props.row;
  if (!row) return;

  loading.value = true;
  const params = {
    detailId: row.detailId,
    productRouteId: row.productRouteId,
    productCode: row.productCode,
    qrCode: row.qrCode,
    lineId: row.lineId,
    lineName: row.lineName,
    processCode: row.processCode,
    time: row.time || row.opTime,
    processTypeName: row.processTypeName,
    experienceTime: row.experienceTime,
    equipmentCode: row.equipCode,
    equipmentName: row.equipName,
  };

  getTraceDetail(params)
    .then((res: any) => {
      proceDetail.value = res.proceDetail || [];
      paramList.value = res.paramList || [];
      qcList.value = res.qcList || [];
      defectList.value = res.discoveryDefectList || [];
      qcDetail.value = res.qcDetail || [];
    })
    .catch(() => {
      proceDetail.value = [];
      paramList.value = [];
      qcList.value = [];
      defectList.value = [];
      qcDetail.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
}

watch(() => props.row, () => {
  fetchData();
}, { immediate: true });
</script>

<template>
  <Spin :spinning="loading">
    <!-- 生产详情 -->
    <div v-if="showProceDetail" class="mb-4">
      <div v-for="(item, idx) in proceDetail" :key="idx" class="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
        <div class="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <span>
            <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.lineName') }}：</span>
            {{ item.lineName }}
          </span>
          <span>
            <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.productionTime') }}：</span>
            {{ item.time }}
          </span>
          <span>
            <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.equipCode') }}：</span>
            {{ item.equipCode }}
          </span>
          <span>
            <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.equipName') }}：</span>
            {{ item.equipName }}
          </span>
          <template v-if="item.workSheetCode">
            <span class="w-full block"></span>
            <span>
              <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.workSheetCode') }}：</span>
              {{ item.workSheetCode }}
            </span>
            <span>
              <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.planCode') }}：</span>
              {{ item.planCode }}
            </span>
          </template>
          <template v-if="item.steelnet">
            <span>
              <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.steelnet') }}：</span>
              {{ item.steelnet }}
            </span>
            <span>
              <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.steelnetTime') }}：</span>
              {{ item.steelnetTime }}
            </span>
          </template>
          <template v-if="item.packingTraceDTO">
            <span class="w-full block"></span>
            <span>
              <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.packingCode') }}：</span>
              {{ item.packingTraceDTO.packingCode }}
            </span>
            <span>
              <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.packingType') }}：</span>
              {{ item.packingTraceDTO.stateName }}
            </span>
            <span>
              <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.packingTime') }}：</span>
              {{ item.packingTraceDTO.opTime }}
            </span>
            <span>
              <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.packingUser') }}：</span>
              {{ item.packingTraceDTO.opUserName }}
            </span>
          </template>
        </div>
      </div>
    </div>

    <!-- 工艺参数一览 -->
    <div v-if="showParamList" class="mb-4">
      <h3 class="mb-2 font-semibold">{{ $t('tracingModule.productTrace.paramList') }}</h3>
      <Table
        :data-source="paramList"
        :columns="[
          { title: $t('tracingModule.productTrace.paramName'), dataIndex: 'paramName', width: 150 },
          { title: $t('tracingModule.productTrace.judgeRequirement'), dataIndex: 'judgeRequirement', width: 140 },
          { title: $t('tracingModule.productTrace.standardValue'), dataIndex: 'standardValue', width: 100 },
          { title: $t('tracingModule.productTrace.upperTolerance'), dataIndex: 'upperTolerance', width: 100 },
          { title: $t('tracingModule.productTrace.lowerTolerance'), dataIndex: 'lowerTolerance', width: 100 },
          { title: $t('tracingModule.productTrace.gatherValue'), dataIndex: 'gatherValue', width: 140 },
          { title: $t('tracingModule.productTrace.unit'), dataIndex: 'unit', width: 80 },
        ]"
        row-key="paramName"
        :pagination="false"
        size="small"
        bordered
      />
    </div>

    <!-- 质检详情一览 (完整表) -->
    <div v-if="showQcList" class="mb-4">
      <h3 class="mb-2 font-semibold">{{ $t('tracingModule.productTrace.qcDetail') }}</h3>
      <div v-for="(item, idx) in qcList" :key="idx">
        <div class="mb-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span>
            <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.qcFormCode') }}：</span>
            {{ item.qcFormCode }}
          </span>
          <span>
            <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.version') }}：</span>
            {{ item.version }}
          </span>
          <span>
            <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.recordCode') }}：</span>
            {{ item.recordCode }}
          </span>
          <span>
            <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.formName') }}：</span>
            {{ item.formName }}
          </span>
          <span>
            <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.formTypeName') }}：</span>
            {{ item.formTypeName }}
          </span>
          <span>
            <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.checkTime') }}：</span>
            {{ item.checkTime }}
          </span>
        </div>
        <Table
          :data-source="item.detailList"
          :columns="[
            { title: $t('tracingModule.productTrace.itemCode'), dataIndex: 'itemCode', width: 150 },
            { title: $t('tracingModule.productTrace.produceName'), dataIndex: 'produceName', width: 140 },
            { title: $t('tracingModule.productTrace.itemName'), dataIndex: 'itemName', width: 100 },
            { title: $t('tracingModule.productTrace.measureMethodName'), dataIndex: 'measureMethodName', width: 100 },
            { title: $t('tracingModule.productTrace.judgeDescription'), dataIndex: 'judgeDescription', width: 100 },
            { title: $t('tracingModule.productTrace.standardValue'), dataIndex: 'standardValue', width: 140 },
            { title: $t('tracingModule.productTrace.upperTolerance'), dataIndex: 'upperTolerance', width: 140 },
            { title: $t('tracingModule.productTrace.lowerTolerance'), dataIndex: 'lowerTolerance', width: 140 },
            { title: $t('tracingModule.productTrace.unit'), dataIndex: 'unit', width: 80 },
            { title: $t('tracingModule.productTrace.entryItem'), dataIndex: 'entryItem', width: 150 },
            { title: $t('tracingModule.productTrace.isQualifiedName'), dataIndex: 'isQualifiedName', width: 80 },
            { title: $t('tracingModule.productTrace.remark'), dataIndex: 'remark', width: 120 },
            { title: $t('tracingModule.productTrace.measureMethodTypeName'), dataIndex: 'measureMethodTypeName', width: 100 },
          ]"
          row-key="itemCode"
          :pagination="false"
          size="small"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'entryItem'">
              <a
                v-if="record.measureMethodTypeName === '\u6587\u4EF6\u578B'"
                class="cursor-pointer text-blue-500"
                @click="handleImagePreview(record)"
              >
                {{ record.entryItem }}
              </a>
              <span v-else>{{ record.entryItem }}</span>
            </template>
          </template>
        </Table>
        <div class="my-2"></div>
      </div>
    </div>

    <!-- QC判定信息 -->
    <div v-if="showQcDetail" class="mb-4">
      <h3 class="mb-2 font-semibold">{{ $t('tracingModule.productTrace.qcJudge') }}</h3>
      <div v-for="(item, idx) in qcDetail" :key="idx" class="mb-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span>
          <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.opTime') }}：</span>
          {{ item.opTime }}
        </span>
        <span>
          <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.opUserName') }}：</span>
          {{ item.opUserName }}
        </span>
        <span>
          <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.state') }}：</span>
          {{ item.state }}
        </span>
      </div>
    </div>

    <!-- 不良一览 -->
    <div v-if="showDefectList" class="mb-4">
      <h3 class="mb-2 font-semibold">{{ $t('tracingModule.productTrace.defectList') }}</h3>
      <div v-for="(item, idx) in defectList" :key="idx">
        <div class="mb-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span>
            <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.worksheetCode') }}：</span>
            {{ item.worksheetCode }}
          </span>
          <span>
            <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.lineName') }}：</span>
            {{ item.lineName }}
          </span>
          <span>
            <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('tracingModule.productTrace.defectNumber') }}：</span>
            {{ item.defectNumber }}
          </span>
        </div>
        <Table
          :data-source="item.detailList"
          :columns="[
            { title: $t('tracingModule.productTrace.defectCode'), dataIndex: 'defectCode', width: 150 },
            { title: $t('tracingModule.productTrace.defectName'), dataIndex: 'defectName', width: 140 },
            { title: $t('tracingModule.productTrace.defectNumber'), dataIndex: 'defectNumber', width: 100 },
            { title: $t('tracingModule.productTrace.location'), dataIndex: 'location', width: 100 },
          ]"
          row-key="defectCode"
          :pagination="false"
          size="small"
          bordered
        />
        <div class="my-2"></div>
      </div>
    </div>

    <!-- 图片预览 -->
    <Modal v-model:open="previewVisible" :title="$t('tracingModule.productTrace.preview')" :footer="null" width="700px">
      <img :src="previewUrl" style="width:100%;height:auto" />
    </Modal>
  </Spin>
</template>
