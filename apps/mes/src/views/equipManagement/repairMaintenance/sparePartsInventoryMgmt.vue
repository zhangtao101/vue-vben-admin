<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue、vxe-table 的组件，以及 getStockListPage、scrapSpare、searchBaseConfig API
 * [OUTPUT]: 对外提供备件库存管理页面组件
 * [POS]: 维修维护模块 的备件库存管理页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-20 15:23:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  SelectOption,
  Space,
  Textarea,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getStockListPage, scrapSpare, searchBaseConfig } from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import ScrapRecordDrawer from '#/util/component/repairMaintenance/ScrapRecordDrawer.vue';

// ========== 权限 ==========
const route = useRoute();
const author = ref<string[]>([]);

onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// ========== 查询参数 ==========
const queryParams = ref<any>({
  spareCode: undefined,
  spareName: undefined,
  spareType: undefined,
  equipmentGroup: undefined,
});

// ========== 下拉选项 ==========
const spareTypeOptions = ref<any[]>([]);

// 加载下拉选项
/**
 * 加载备件类型下拉选项。
 * @returns {void} 无返回值，通过 Promise 异步加载数据。
 * @since 2026-04-20 15:23:00
 */
function loadSpareTypeOptions() {
  searchBaseConfig({ configType: 'SPARE_TYPE' }).then((res: any[]) => {
    spareTypeOptions.value = (res || []).map((item: any) => ({
      label: item.configName,
      value: item.configCode,
    }));
  });
}

// ========== 格式化函数 ==========
/**
 * 根据备件类型编码获取对应的显示文本。
 * @param {string} spareType - 备件类型编码。
 * @returns {string} 备件类型显示文本，未找到时返回原始编码。
 * @since 2026-04-20 15:23:00
 */
function getSpareTypeText(spareType: string) {
  const option = spareTypeOptions.value.find(
    (item) => item.value === spareType,
  );
  return option ? option.label : spareType;
}

onMounted(() => {
  loadSpareTypeOptions();
});

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
      field: 'stockQuantity',
      title: $t('repair.spareInventory.stockQuantity'),
      minWidth: 100,
    },
    {
      field: 'unit',
      title: $t('repair.spareInventory.unit'),
      width: 80,
    },
    {
      field: 'action',
      title: $t('common.action'),
      width: 120,
      slots: { default: 'action' },
      fixed: 'right',
    },
  ],
  height: 500,
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
/**
 * 查询备件库存列表数据。
 * @param {object} page - 分页参数，包含 currentPage 和 pageSize。
 * @param {number} page.currentPage - 当前页码，默认1。
 * @param {number} page.pageSize - 每页条数，默认20。
 * @returns {Promise<{total: number, items: any[]}>} 返回包含总数和数据列表的 Promise。
 * @throws {Error} API 请求失败时抛出错误。
 * @since 2026-04-20 15:23:00
 */
function queryData(page?: { currentPage: number; pageSize: number }) {
  return new Promise((resolve, reject) => {
    const params = {
      spareCode: queryParams.value.spareCode,
      spareName: queryParams.value.spareName,
      spareType: queryParams.value.spareType,
      equipmentGroup: queryParams.value.equipmentGroup,
      pageNum: page?.currentPage || 1,
      pageSize: page?.pageSize || 20,
    };
    getStockListPage(params)
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
/**
 * 执行查询操作，刷新表格数据。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:23:00
 */
function handleQuery() {
  gridApi.reload();
}

// ========== 重置 ==========
/**
 * 重置查询参数并刷新表格数据。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:23:00
 */
function handleReset() {
  queryParams.value = {
    spareCode: undefined,
    spareName: undefined,
    spareType: undefined,
    equipmentGroup: undefined,
  };
  gridApi.reload();
}

// ========== 抽屉控制 ==========
const scrapRecordDrawerVisible = ref(false);

/**
 * 打开报废记录抽屉。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:23:00
 */
function openScrapRecordDrawer() {
  scrapRecordDrawerVisible.value = true;
}

// ========== 报废 ==========
const scrapVisible = ref(false);
const scrapRow = ref<any>(null);
const scrapFormData = ref({
  scrapQuantity: 1,
  scrapReason: '',
});

/**
 * 打开报废弹窗。
 * @param {any} row - 当前行数据，包含备件信息。
 * @returns {void} 无返回值，库存不足时提示警告。
 * @since 2026-04-20 15:23:00
 */
function handleScrap(row: any) {
  if (!row.stockQuantity || row.stockQuantity <= 0) {
    message.warning($t('repair.spareInventory.noStockWarning'));
    return;
  }
  scrapRow.value = row;
  scrapFormData.value = {
    scrapQuantity: 1,
    scrapReason: '',
  };
  scrapVisible.value = true;
}

/**
 * 提交报废表单。
 * @returns {void} 无返回值，成功后关闭弹窗并刷新表格。
 * @throws {Error} 提交失败时提示错误信息。
 * @since 2026-04-20 15:23:00
 */
function submitScrap() {
  if (!scrapRow.value?.id) {
    return;
  }
  if (scrapFormData.value.scrapQuantity <= 0) {
    message.warning($t('repair.spareInventory.scrapQuantityWarning'));
    return;
  }
  scrapSpare({
    stockId: scrapRow.value.id,
    scrapQuantity: scrapFormData.value.scrapQuantity,
    scrapReason: scrapFormData.value.scrapReason,
  }).then(() => {
    message.success($t('common.successfulOperation'));
    scrapVisible.value = false;
    gridApi.reload();
  });
}
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 备件编号 -->
        <FormItem
          :label="$t('repair.spareInventory.spareCode')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.spareCode"
            :placeholder="`请输入${$t('repair.spareInventory.spareCode')}`"
            allow-clear
            style="width: 140px"
          />
        </FormItem>

        <!-- 备件名称 -->
        <FormItem
          :label="$t('repair.spareInventory.spareName')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.spareName"
            :placeholder="`请输入${$t('repair.spareInventory.spareName')}`"
            allow-clear
            style="width: 140px"
          />
        </FormItem>

        <!-- 备件类型 -->
        <FormItem
          :label="$t('repair.spareInventory.spareType')"
          style="margin-bottom: 0"
        >
          <Select
            v-model:value="queryParams.spareType"
            :placeholder="$t('repair.spareInventory.spareTypePlaceholder')"
            allow-clear
            show-search
            style="width: 140px"
          >
            <SelectOption
              v-for="item in spareTypeOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </SelectOption>
          </Select>
        </FormItem>

        <!-- 设备组 -->
        <FormItem
          :label="$t('repair.spareInventory.equipmentGroup')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.equipmentGroup"
            :placeholder="`请输入${$t('repair.spareInventory.equipmentGroup')}`"
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
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <Space>
            <Button type="primary" @click="openScrapRecordDrawer">
              <Icon
                icon="mdi:file-document-outline"
                class="inline-block align-middle"
              />
              {{ $t('repair.spareInventory.scrapRecord') }}
            </Button>
          </Space>
        </template>

        <!-- 备件类型插槽 -->
        <template #spareType="{ row }">
          {{ getSpareTypeText(row.spareType) }}
        </template>

        <!-- 操作插槽 -->
        <template #action="{ row }">
          <Space :size="0">
            <Tooltip v-if="author.includes('报废')">
              <template #title>
                {{ $t('repair.spareInventory.scrap') }}
              </template>
              <Button type="link" danger @click="handleScrap(row)">
                <Icon
                  icon="mdi:trash-can-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 报废弹窗 -->
    <Modal
      v-model:open="scrapVisible"
      :title="$t('repair.spareInventory.scrapTitle')"
      @ok="submitScrap"
      :ok-text="$t('common.confirm')"
      :cancel-text="$t('common.cancel')"
    >
      <Form :model="scrapFormData" v-if="scrapRow">
        <FormItem :label="$t('repair.spareInventory.spareCode')">
          <Input :value="scrapRow.spareCode" disabled />
        </FormItem>
        <FormItem :label="$t('repair.spareInventory.spareName')">
          <Input :value="scrapRow.spareName" disabled />
        </FormItem>
        <FormItem :label="$t('repair.spareInventory.currentStock')">
          <Input
            :value="`${scrapRow.stockQuantity || 0} ${scrapRow.unit || ''}`"
            disabled
          />
        </FormItem>
        <FormItem :label="$t('repair.spareInventory.scrapQuantity')">
          <InputNumber
            v-model:value="scrapFormData.scrapQuantity"
            :min="1"
            :max="scrapRow.stockQuantity || 1"
            style="width: 100%"
          />
        </FormItem>
        <FormItem :label="$t('repair.spareInventory.scrapReason')">
          <Textarea
            v-model:value="scrapFormData.scrapReason"
            :rows="3"
            :placeholder="$t('repair.spareInventory.scrapReasonPlaceholder')"
          />
        </FormItem>
      </Form>
    </Modal>

    <!-- 报废记录抽屉 -->
    <ScrapRecordDrawer v-model:open="scrapRecordDrawerVisible" />
  </Page>
</template>

<style scoped></style>
