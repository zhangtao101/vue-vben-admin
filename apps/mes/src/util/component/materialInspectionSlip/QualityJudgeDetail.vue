<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, ref, watch } from 'vue';

import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Input,
  Space,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { fetchInspectionSlipDetail } from '#/api';

const props = defineProps<{
  formId?: any;
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

// 送检信息
const inspectionInfo = ref<any>({});

// 质检详情列表
const judgeDetail = ref<any[]>([]);

// 获取质检结论文本和颜色
function getCheckResultInfo(result: number) {
  const resultMap: Record<number, { color: string; text: string }> = {
    1: {
      color: 'success',
      text: $t('storeManagement.inspectionSlip.qualified'),
    },
    2: {
      color: 'error',
      text: $t('storeManagement.inspectionSlip.unqualified'),
    },
    3: {
      color: 'warning',
      text: $t('storeManagement.inspectionSlip.concessionAccept'),
    },
    4: {
      color: 'processing',
      text: $t('storeManagement.inspectionSlip.emergencyRelease'),
    },
  };
  return resultMap[result] || { color: 'default', text: '' };
}

// 表格列
const columns: VxeGridProps<any>['columns'] = [
  {
    field: 'materialCode',
    title: $t('storeManagement.labelPrint.materialCode'),
    width: 120,
  },
  {
    field: 'materialName',
    title: $t('storeManagement.labelPrint.materialName'),
    minWidth: 150,
  },
  { field: 'unit', title: $t('storeManagement.labelPrint.unit'), width: 60 },
  {
    field: 'sendNumber',
    title: $t('storeManagement.inspectionSlip.sendNumber'),
    width: 100,
  },
  {
    field: 'labelCode',
    title: $t('storeManagement.labelPrint.labelCode'),
    width: 150,
  },
  {
    field: 'manufacturerName',
    title: $t('storeManagement.labelPrint.manufacturerName'),
    minWidth: 150,
  },
  {
    field: 'batchCode',
    title: $t('storeManagement.labelPrint.batchCode'),
    width: 120,
  },
  {
    field: 'qualifiedNumber',
    title: $t('storeManagement.inspectionSlip.qualifiedNumber'),
    width: 100,
    slots: { default: 'qualifiedNumber' },
  },
  {
    field: 'unqualifiedNumber',
    title: $t('storeManagement.inspectionSlip.unqualifiedNumber'),
    width: 100,
    slots: { default: 'unqualifiedNumber' },
  },
];

// 表格配置
const gridOptions: VxeGridProps<any> = {
  border: true,
  columns,
  height: 300,
  data: [],
  showOverflow: 'tooltip',
  pagerConfig: {
    enabled: false,
  },
  stripe: true,
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// 监听弹窗打开
watch(visible, (val) => {
  if (val && props.formId) {
    fetchInspectionSlipDetail(props.formId).then((res: any) => {
      const checkResultInfo = getCheckResultInfo(res.checkResult);
      inspectionInfo.value = {
        ...res,
        checkResultText: checkResultInfo.text,
        checkResultColor: checkResultInfo.color,
        unqualified: res.checkNumber - res.qualifiedNumber,
      };
      judgeDetail.value = res.labelList || [];
      if (gridApi.grid) {
        gridApi.grid.reloadData(judgeDetail.value);
      }
    });
  }
});
</script>

<template>
  <Drawer
    v-model:open="visible"
    :title="$t('storeManagement.inspectionSlip.qualityJudgeDetail')"
    :footer-style="{ textAlign: 'right' }"
    width="85%"
    class="quality-judge-drawer"
  >
    <!-- 送检信息 -->
    <Card class="!mb-6">
      <template #title>
        <div class="flex items-center">
          <Icon
            icon="mdi:file-document-outline"
            class="text-xl mr-2 text-blue-500"
          />
          <span>{{ $t('storeManagement.inspectionSlip.inspectionInfo') }}</span>
        </div>
      </template>
      <Form layout="inline" class="info-form">
        <FormItem
          :label="$t('storeManagement.labelPrint.formCode')"
          class="form-item-half"
        >
          <Input
            v-model:value="inspectionInfo.formCode"
            disabled
            class="custom-input"
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.inspectionSlip.sendDate')"
          class="form-item-half"
        >
          <Input
            v-model:value="inspectionInfo.sendDate"
            disabled
            class="custom-input"
          />
        </FormItem>
        <FormItem
          :label="$t('storeManagement.labelPrint.remark')"
          class="form-item-full"
        >
          <Input.TextArea
            v-model:value="inspectionInfo.remark"
            disabled
            :auto-size="{ minRows: 2, maxRows: 4 }"
            class="custom-input"
          />
        </FormItem>
      </Form>
    </Card>

    <!-- 质检信息 -->
    <Card class="!mb-6">
      <template #title>
        <div class="flex items-center">
          <Icon
            icon="mdi:clipboard-check-outline"
            class="text-xl mr-2 text-green-500"
          />
          <span>{{ $t('storeManagement.inspectionSlip.qualityInfo') }}</span>
        </div>
      </template>
      <Descriptions :column="3" bordered class="custom-descriptions">
        <DescriptionsItem
          :label="$t('storeManagement.inspectionSlip.checkResult')"
        >
          <Tag :color="inspectionInfo.checkResultColor" class="!m-0">
            {{ inspectionInfo.checkResultText }}
          </Tag>
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('storeManagement.inspectionSlip.judgeTime')"
        >
          <span class="text-gray-700">{{ inspectionInfo.judgeTime }}</span>
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('storeManagement.inspectionSlip.arrivalNumber')"
        >
          <span class="font-semibold text-blue-600">{{
            inspectionInfo.receiveNumber
          }}</span>
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('storeManagement.inspectionSlip.checkNumber')"
        >
          <span class="font-semibold text-blue-600">{{
            inspectionInfo.checkNumber
          }}</span>
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('storeManagement.inspectionSlip.qualifiedNumber')"
        >
          <span class="font-semibold" style="color: #52c41a">{{
            inspectionInfo.qualifiedNumber
          }}</span>
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('storeManagement.inspectionSlip.unqualifiedNumber')"
        >
          <span
            class="font-semibold"
            :style="{
              color: inspectionInfo.unqualified > 0 ? '#ff4d4f' : '#52c41a',
            }"
          >
            {{ inspectionInfo.unqualified }}
          </span>
        </DescriptionsItem>
      </Descriptions>
      <Form class="!mt-4">
        <FormItem
          :label="$t('storeManagement.inspectionSlip.checkRemark')"
          class="mb-0"
        >
          <Input.TextArea
            v-model:value="inspectionInfo.checkRemark"
            disabled
            :auto-size="{ minRows: 2, maxRows: 4 }"
            class="custom-input"
          />
        </FormItem>
      </Form>
    </Card>

    <!-- 质检详情 -->
    <Card>
      <template #title>
        <div class="flex items-center">
          <Icon icon="mdi:table-large" class="text-xl mr-2 text-purple-500" />
          <span>{{ $t('storeManagement.inspectionSlip.qualityDetail') }}</span>
        </div>
      </template>
      <Grid>
        <template #qualifiedNumber="{ row }">
          <span
            v-if="row.qualifiedNumber != null"
            style=" font-weight: bold;color: #52c41a"
          >
            {{ row.qualifiedNumber }}
          </span>
        </template>
        <template #unqualifiedNumber="{ row }">
          <span
            v-if="row.qualifiedNumber != null"
            :style="{
              color:
                row.sendNumber - row.qualifiedNumber > 0
                  ? '#ff4d4f'
                  : '#52c41a',
              fontWeight: 'bold',
            }"
          >
            {{ row.sendNumber - row.qualifiedNumber }}
          </span>
        </template>
      </Grid>
    </Card>

    <template #footer>
      <Space>
        <Button @click="visible = false">{{ $t('common.cancel') }}</Button>
        <Button type="primary" @click="visible = false">
{{
          $t('common.close')
        }}
</Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped>
.quality-judge-drawer :deep(.ant-drawer-body) {
  padding: 24px;
  overflow-y: auto;
}

.info-form {
  width: 100%;
}

.form-item-half {
  width: 49%;
  margin-right: 2%;
  margin-bottom: 16px;
}

.form-item-full {
  width: 100%;
  margin-bottom: 16px;
}

.custom-input {
  background-color: #fafafa;
}

.info-form :deep(.ant-form-item-label) {
  width: 100px;
  text-align: right;
}

.custom-descriptions :deep(.ant-descriptions-item-label) {
  font-weight: 500;
  background-color: #f5f5f5;
}
</style>
