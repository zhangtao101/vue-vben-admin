<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Select,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteSubLineEquip,
  getUnbindedEquip,
  searchSubLineEquip,
  updateSubLineEquip,
} from '#/api';
import { $t } from '#/locales';

// region 查询参数
const queryParams = ref<any>({
  subLineCode: '',
  subLineName: '',
  lineCode: '',
});
// endregion

// region 设备下拉选项
const allEquipOptions = ref<any[]>([]);

/**
 * 初始化设备下拉选项（加载所有未绑定设备）
 */
function initEquipOptions() {
  getUnbindedEquip().then((res) => {
    const list = res || [];
    allEquipOptions.value = list.map((item: any) => ({
      label: `${item.equipmentNameCode}(${item.equipmentCode})`,
      value: item.id,
    }));
  });
}

/**
 * 获取当前行的可用选项（排除其他行已选中的设备）
 */
function getRowOptions(currentRow: any) {
  const tableData = gridApi.grid?.getTableData()?.fullData || [];
  const selectedIds = new Set(
    tableData
      .filter(
        (r: any) =>
          r.id !== currentRow.id &&
          r.equipCode !== null &&
          r.equipCode !== undefined &&
          r.equipCode !== '',
      )
      .map((r: any) => r.equipCode),
  );
  return allEquipOptions.value.filter((opt) => !selectedIds.has(opt.value));
}

/**
 * 下拉框本地过滤函数
 * @param input 用户输入的筛选值
 * @param option 下拉框选项对象
 */
const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};
// endregion

// region 变更追踪
const changedRowMap = ref<Map<number, any>>(new Map());

/**
 * 设备下拉变更，记录变动行
 */
function onEquipCodeChange(row: any) {
  changedRowMap.value.set(row.id, {
    id: row.id,
    equipId: row.equipCode,
  });
}
// endregion

// region 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: {
    reserve: true,
  },
  columns: [
    { type: 'checkbox', width: 50 },
    { type: 'seq', width: 50, title: $t('baseInfo.serialNumber') },
    {
      field: 'subLineCode',
      title: $t('baseInfo.subLineCode'),
      minWidth: 120,
    },
    {
      field: 'subLineName',
      title: $t('baseInfo.subLineName'),
      minWidth: 120,
    },
    {
      field: 'lineCode',
      title: $t('baseInfo.lineCode'),
      minWidth: 120,
    },
    {
      field: 'lineName',
      title: $t('baseInfo.lineName'),
      minWidth: 160,
    },
    {
      field: 'equipCode',
      title: $t('baseInfo.hangTray'),
      minWidth: 200,
      slots: { default: 'equipCode' },
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
        return queryData({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        });
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
// endregion

// region 数据查询
/**
 * 分页查询子产线托盘绑定关系
 */
function queryData({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) {
  return new Promise((resolve) => {
    const params = {
      ...queryParams.value,
      pageNum,
      pageSize,
    };
    searchSubLineEquip(params)
      .then((data) => {
        resolve({
          total: data.total || 0,
          items: data.list || [],
        });
      })
      .catch(() => {
        resolve({ total: 0, items: [] });
      });
  });
}
// endregion

// region 操作按钮
/**
 * 保存：仅提交有变动的行
 */
function handleSave() {
  if (changedRowMap.value.size === 0) {
    message.warning($t('baseInfo.noChangesToSave'));
    return;
  }
  const params = [...changedRowMap.value.values()];
  updateSubLineEquip(params)
    .then(() => {
      message.success($t('baseInfo.saveSuccess'));
      changedRowMap.value.clear();
      initEquipOptions();
      gridApi.reload();
    })
    .catch(() => {
      message.error($t('baseInfo.saveFailed'));
    });
}

/**
 * 解除绑定：基于选中的行批量解除
 */
function handleUnbind() {
  const selectedRows = gridApi.grid.getCheckboxRecords();
  if (!selectedRows || selectedRows.length === 0) {
    message.warning($t('baseInfo.pleaseSelectRecords'));
    return;
  }
  Modal.confirm({
    content: $t('baseInfo.confirmUnbind'),
    title: $t('baseInfo.confirmTitle'),
    onOk: () => {
      const ids = selectedRows.map((row: any) => row.id);
      deleteSubLineEquip(ids)
        .then(() => {
          message.success($t('baseInfo.unbindSuccess'));
          initEquipOptions();
          gridApi.reload();
        })
        .catch(() => {
          message.error($t('baseInfo.saveFailed'));
        });
    },
  });
}
// endregion

// region 重置
/**
 * 重置查询条件
 */
function handleReset() {
  queryParams.value = {
    subLineCode: '',
    subLineName: '',
    lineCode: '',
  };
  gridApi.reload();
}
// endregion

// 初始化：加载设备下拉选项
initEquipOptions();
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <FormItem
          :label="$t('baseInfo.subLineCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.subLineCode"
            :placeholder="$t('baseInfo.inputSubLineCode')"
            allow-clear
          />
        </FormItem>

        <FormItem
          :label="$t('baseInfo.subLineName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.subLineName"
            :placeholder="$t('baseInfo.inputSubLineName')"
            allow-clear
          />
        </FormItem>

        <FormItem
          :label="$t('baseInfo.lineCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.lineCode"
            :placeholder="$t('baseInfo.inputLineCode')"
            allow-clear
          />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button @click="handleReset">
            {{ $t('common.reset') }}
          </Button>
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="gridApi.reload()">
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid>
        <!-- 工具栏操作按钮 -->
        <template #toolbar-tools>
          <Button type="primary" class="mr-2" @click="handleSave">
            <Icon
              icon="mdi:content-save"
              class="inline-block align-middle text-lg"
            />
            {{ $t('baseInfo.save') }}
          </Button>
          <Button danger @click="handleUnbind">
            <Icon
              icon="mdi:link-variant-off"
              class="inline-block align-middle text-lg"
            />
            {{ $t('baseInfo.unbind') }}
          </Button>
        </template>

        <!-- 挂载托盘下拉选择 -->
        <template #equipCode="{ row }">
          <Select
            v-model:value="row.equipCode"
            show-search
            :filter-option="filterOption"
            :options="getRowOptions(row)"
            :placeholder="$t('baseInfo.selectHangTrayPlaceholder')"
            style="width: 100%"
            allow-clear
            @change="onEquipCodeChange(row)"
          />
        </template>
      </Grid>
    </Card>
  </Page>
</template>
