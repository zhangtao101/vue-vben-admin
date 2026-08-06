<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue、vxe-table 的组件
 * [OUTPUT]: 对外提供设备台账履历查看页面组件
 * [POS]: 设备管理模块 的设备台账履历查看页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-08-06 00:00:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  Select,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { queryLifecycleHistory } from '#/api';
import { $t } from '#/locales';

// ========== 查询参数 ==========
const queryParams = ref<any>({
  equipmentCode: '',
  eventType: undefined,
});

// ========== 事件类型下拉选项 ==========
const eventTypeOptions = [
  { label: '状态变更', value: 1 },
  { label: '位置变动', value: 2 },
  { label: '故障记录', value: 3 },
  { label: '维修记录', value: 4 },
  { label: '点检保养记录', value: 5 },
];

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 60, title: $t('equip.sequence') },
    {
      field: 'equipmentCode',
      title: $t('equip.equipmentNumber'),
      minWidth: 120,
    },
    {
      field: 'eventTypeName',
      title: $t('equip.equipmentAccountHistory.eventType'),
      minWidth: 120,
    },
    {
      field: 'beforeValue',
      title: $t('equip.equipmentAccountHistory.beforeValue'),
      minWidth: 140,
    },
    {
      field: 'afterValue',
      title: $t('equip.equipmentAccountHistory.afterValue'),
      minWidth: 140,
    },
    {
      field: 'sourceOrderNo',
      title: $t('equip.equipmentAccountHistory.sourceOrderNo'),
      minWidth: 140,
    },
    {
      field: 'sourceOrderTypeName',
      title: $t('equip.equipmentAccountHistory.sourceOrderTypeName'),
      minWidth: 120,
    },
    {
      field: 'occurTime',
      title: $t('equip.equipmentAccountHistory.occurTime'),
      minWidth: 160,
    },
    {
      field: 'operator',
      title: $t('equip.equipmentAccountHistory.operator'),
      minWidth: 100,
    },
    {
      field: 'remark',
      title: $t('equip.remark'),
      minWidth: 140,
    },
    {
      field: 'cTime',
      title: $t('equip.cTime'),
      minWidth: 160,
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
        const params: any = {
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        };
        if (queryParams.value.equipmentCode) {
          params.equipmentCode = queryParams.value.equipmentCode;
        }
        if (queryParams.value.eventType !== undefined) {
          params.eventType = queryParams.value.eventType;
        }

        return queryLifecycleHistory(params).then(
          ({ total, list }: any) => {
            return {
              total: total || 0,
              items: list || [],
            };
          },
        );
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

// ========== 重置 ==========
function handleReset() {
  queryParams.value = {
    equipmentCode: '',
    eventType: undefined,
  };
  gridApi.reload();
}
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 设备编号 -->
        <FormItem :label="$t('equip.equipmentNumber')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.equipmentCode"
            :placeholder="$t('equip.pleaseEnterEquipmentNumber')"
            allow-clear
            style="width: 220px"
          />
        </FormItem>

        <!-- 事件类型 -->
        <FormItem :label="$t('equip.equipmentAccountHistory.eventType')" style="margin-bottom: 1em">
          <Select
            v-model:value="queryParams.eventType"
            :placeholder="$t('equip.pleaseSelect')"
            allow-clear
            style="width: 200px"
            :options="eventTypeOptions"
          />
        </FormItem>

        <!-- 重置按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button @click="handleReset">
            {{ $t('equip.reset') }}
          </Button>
        </FormItem>

        <!-- 查询按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="gridApi.reload()">
            {{ $t('equip.query') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid>
        <template #toolbar-tools></template>
      </Grid>
    </Card>
  </Page>
</template>
