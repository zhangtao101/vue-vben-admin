<script lang="ts" setup>
/**
 * [INPUT]: 依赖 #/api (listSuppliers/getSupplierDetail)、#/adapter/vxe-table (useVbenVxeGrid)、
 *          #/locales ($t)、ant-design-vue 组件（Button/Card/Descriptions/DescriptionsItem/Drawer/Form/FormItem/Input/Space/Spin/Tag/Tooltip）、
 *          @iconify/vue (Icon)
 * [OUTPUT]: 对外提供 supplierManagement 供应商管理列表页面（条件分页查询、供应商详情查看）
 * [POS]: 属于 baseInfo 基础信息模块，按供应商编码/名称模糊查询供应商列表，支持查看供应商详情
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-11-07 00:00:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

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
  Spin,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getSupplierDetail, listSuppliers } from '#/api';
import { $t } from '#/locales';

// region 查询条件
const queryParams = ref({
  manufacturerCode: undefined as string | undefined,
  manufacturerName: undefined as string | undefined,
});

/**
 * 重置查询条件并刷新列表
 * @returns {void} 无返回值
 * @since 2026-11-07 00:00:00
 */
function handleReset() {
  queryParams.value = {
    manufacturerCode: undefined,
    manufacturerName: undefined,
  };
  gridApi.reload();
}
// endregion

// region 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', title: $t('baseInfo.serialNumber'), width: 60 },
    {
      field: 'manufacturerCode',
      title: $t('baseInfo.manufacturerCode'),
      minWidth: 150,
    },
    {
      field: 'manufacturerName',
      title: $t('baseInfo.manufacturerName'),
      minWidth: 200,
    },
    {
      field: 'sapPlantCode',
      title: $t('baseInfo.sapPlantCode'),
      minWidth: 130,
    },
    {
      field: 'nationCode',
      title: $t('baseInfo.nationCode'),
      minWidth: 100,
    },
    {
      field: 'isEffective',
      title: $t('baseInfo.isEffective'),
      minWidth: 100,
      slots: { default: 'isEffective' },
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('baseInfo.action'),
      width: 100,
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
  },
  proxyConfig: {
    ajax: {
      query: ({ page }) => {
        return listSuppliers({
          ...queryParams.value,
          pageNum: page?.currentPage,
          pageSize: page?.pageSize,
        }).then((response) => ({
          total: response.total || 0,
          items: response.results || [],
        }));
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

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
// endregion

// region 详情抽屉
const detailVisible = ref(false);
const detailLoading = ref(false);
const detailRow = ref<any>(null);

/**
 * 打开供应商详情抽屉并按供应商ID查询详情
 * @param {object} row 列表行数据（取 id 查询详情）
 * @returns {void} 无返回值
 * @throws 接口失败时由统一错误处理层提示，此处不额外捕获。
 * @since 2026-11-07 00:00:00
 */
function handleDetail(row: any) {
  detailVisible.value = true;
  detailLoading.value = true;
  detailRow.value = null;
  getSupplierDetail(row.id)
    .then((data) => {
      detailRow.value = data;
    })
    .finally(() => {
      detailLoading.value = false;
    });
}
// endregion
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="mb-4!">
      <Form :model="queryParams" layout="inline">
        <!-- 供应商编码 -->
        <FormItem
          :label="$t('baseInfo.manufacturerCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.manufacturerCode"
            :placeholder="$t('baseInfo.inputManufacturerCode')"
            allow-clear
            style="width: 200px"
          />
        </FormItem>

        <!-- 供应商名称 -->
        <FormItem
          :label="$t('baseInfo.manufacturerName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.manufacturerName"
            :placeholder="$t('baseInfo.inputManufacturerName')"
            allow-clear
            style="width: 200px"
          />
        </FormItem>

        <!-- 重置按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button @click="handleReset">{{ $t('common.reset') }}</Button>
        </FormItem>

        <!-- 查询按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="gridApi.reload()">
            <template #icon>
              <MdiSearch />
            </template>
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid>
        <template #toolbar-tools></template>

        <!-- 是否有效插槽 -->
        <template #isEffective="{ row }">
          <Tag :color="Number(row.isEffective) === 1 ? 'success' : 'default'">
            {{
              Number(row.isEffective) === 1
                ? $t('baseInfo.effective')
                : $t('baseInfo.invalid')
            }}
          </Tag>
        </template>

        <!-- 操作插槽 -->
        <template #action="{ row }">
          <Space>
            <Tooltip :title="$t('baseInfo.detail')">
              <Button type="link" class="px-1" @click="handleDetail(row)">
                <Icon
                  class="inline-block align-middle text-lg"
                  icon="mdi:eye-outline"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 详情抽屉 -->
    <Drawer
      v-model:open="detailVisible"
      :destroy-on-close="true"
      :title="$t('baseInfo.supplierDetail')"
      width="600"
      :footer-style="{ textAlign: 'right' }"
    >
      <Spin :spinning="detailLoading">
        <Descriptions v-if="detailRow" bordered :column="1" size="small">
          <DescriptionsItem :label="$t('baseInfo.manufacturerCode')">
            {{ detailRow.manufacturerCode }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('baseInfo.manufacturerName')">
            {{ detailRow.manufacturerName }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('baseInfo.sapPlantCode')">
            {{ detailRow.sapPlantCode ?? '' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('baseInfo.nationCode')">
            {{ detailRow.nationCode ?? '' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('baseInfo.isEffective')">
            <Tag :color="Number(detailRow.isEffective) === 1 ? 'success' : 'default'">
              {{
                Number(detailRow.isEffective) === 1
                  ? $t('baseInfo.effective')
                  : $t('baseInfo.invalid')
              }}
            </Tag>
          </DescriptionsItem>
        </Descriptions>
      </Spin>

      <template #footer>
        <Space>
          <Button @click="detailVisible = false">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="primary" @click="detailVisible = false">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>
