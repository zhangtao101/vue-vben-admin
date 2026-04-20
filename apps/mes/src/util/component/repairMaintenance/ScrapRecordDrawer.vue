<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { ref, watch } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getScrapRecordListPage, searchBaseConfig } from '#/api';
import { $t } from '#/locales';

// ========== Props & Emits ==========
const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
}>();

// ========== 查询参数 ==========
const queryParams = ref<any>({
  spareCode: undefined,
  spareName: undefined,
  scrapBy: undefined,
});

// 日期范围
const queryDateRange = ref<[any, any]>([undefined, undefined]);

// ========== 下拉选项 ==========
const spareTypeOptions = ref<any[]>([]);

// 加载备件类型选项
function loadSpareTypeOptions() {
  searchBaseConfig({ configType: 'SPARE_TYPE' }).then((res: any[]) => {
    spareTypeOptions.value = (res || []).map((item: any) => ({
      label: item.configName,
      value: item.configCode,
    }));
  });
}

// ========== 格式化函数 ==========
function getSpareTypeText(spareType: string) {
  const option = spareTypeOptions.value.find((item) => item.value === spareType);
  return option ? option.label : spareType;
}

// ========== 抽屉打开时加载数据 ==========
watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      loadSpareTypeOptions();
    }
  },
);

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    {
      field: 'spareCode',
      title: $t('repair.spareInventory.spareCode'),
      minWidth: 140,
    },
    {
      field: 'spareName',
      title: $t('repair.spareInventory.spareName'),
      minWidth: 160,
    },
    {
      field: 'spareModel',
      title: $t('repair.spareInventory.spareModel'),
      minWidth: 140,
    },
    {
      field: 'spareType',
      title: $t('repair.spareInventory.spareType'),
      minWidth: 120,
      slots: { default: 'spareType' },
    },
    {
      field: 'equipmentGroup',
      title: $t('repair.spareInventory.equipmentGroup'),
      minWidth: 120,
    },
    {
      field: 'storageArea',
      title: $t('repair.spareInventory.storageArea'),
      minWidth: 120,
    },
    {
      field: 'scrapQuantity',
      title: $t('repair.spareInventory.scrapQuantity'),
      minWidth: 100,
    },
    {
      field: 'scrapReason',
      title: $t('repair.spareInventory.scrapReason'),
      minWidth: 160,
    },
    {
      field: 'scrapBy',
      title: $t('repair.spareInventory.scrapBy'),
      minWidth: 120,
    },
    {
      field: 'scrapTime',
      title: $t('repair.spareInventory.scrapTime'),
      minWidth: 160,
    },
  ],
  height: 400,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData(page);
      },
    },
  },
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// ========== 数据查询 ==========
function queryData(page?: { currentPage: number; pageSize: number }) {
  return new Promise((resolve, reject) => {
    const params = {
      spareCode: queryParams.value.spareCode,
      spareName: queryParams.value.spareName,
      scrapBy: queryParams.value.scrapBy,
      pageNum: page?.currentPage || 1,
      pageSize: page?.pageSize || 20,
    };
    getScrapRecordListPage(params)
      .then((data: any) => {
        resolve({
          total: data.total || 0,
          items: data.results || data || [],
        });
      })
      .catch((error: any) => {
        reject(error);
      });
  });
}

// ========== 查询 ==========
function handleQuery() {
  gridApi.reload();
}

// ========== 重置 ==========
function handleReset() {
  queryParams.value = {
    spareCode: undefined,
    spareName: undefined,
    scrapBy: undefined,
  };
  queryDateRange.value = [undefined, undefined];
  gridApi.reload();
}
</script>

<template>
  <Drawer
    :open="props.open"
    :title="$t('repair.spareInventory.scrapRecord')"
    placement="top"
    :height="600"
    :destroy-on-close="true"
    @close="emit('update:open', false)"
  >
    <!-- 查询区域 -->
    <Form :model="queryParams" layout="inline">
      <!-- 备件编号 -->
      <FormItem :label="$t('repair.spareInventory.spareCode')" style="margin-bottom: 0">
        <Input
          v-model:value="queryParams.spareCode"
          :placeholder="`请输入${$t('repair.spareInventory.spareCode')}`"
          allow-clear
          style="width: 140px"
        />
      </FormItem>

      <!-- 备件名称 -->
      <FormItem :label="$t('repair.spareInventory.spareName')" style="margin-bottom: 0">
        <Input
          v-model:value="queryParams.spareName"
          :placeholder="`请输入${$t('repair.spareInventory.spareName')}`"
          allow-clear
          style="width: 140px"
        />
      </FormItem>

      <!-- 报废人 -->
      <FormItem :label="$t('repair.spareInventory.scrapBy')" style="margin-bottom: 0">
        <Input
          v-model:value="queryParams.scrapBy"
          :placeholder="`请输入${$t('repair.spareInventory.scrapBy')}`"
          allow-clear
          style="width: 140px"
        />
      </FormItem>

      <FormItem style="margin-bottom: 0">
        <Space>
          <Button @click="handleReset">{{ $t('common.reset') }}</Button>
          <Button type="primary" @click="handleQuery">
            <Icon icon="mdi:magnify" class="inline-block align-middle" />
            {{ $t('common.search') }}
          </Button>
        </Space>
      </FormItem>
    </Form>

    <div>
      <!-- 表格区域 -->
      <Grid class="!mt-4">
        <!-- 备件类型插槽 -->
        <template #spareType="{ row }">
          {{ getSpareTypeText(row.spareType) }}
        </template>
      </Grid>
    </div>
  </Drawer>
</template>

<style scoped></style>
