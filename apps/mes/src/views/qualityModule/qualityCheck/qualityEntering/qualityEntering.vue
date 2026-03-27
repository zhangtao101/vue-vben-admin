<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import { Button, Card, Space, Tooltip } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { fetchQcFormList } from '#/api';
import { queryAuth } from '#/util';
import QualityEnteringDrawer from '#/util/component/qualityEntering/QualityEnteringDrawer.vue';

// 权限
const route = useRoute();
const author = ref<string[]>([]);
const permissions = computed(() => ({
  view: author.value.includes('查看'),
}));

// 选中的表单
const currentForm = ref<any>(null);

// 抽屉状态
const drawerVisible = ref(false);

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    {
      field: 'formCode',
      title: $t('qualityModule.qualityCheck.qualityEntering.formCode'),
      width: 130,
    },
    {
      field: 'formName',
      title: $t('qualityModule.qualityCheck.qualityEntering.formName'),
      minWidth: 200,
    },
    {
      field: 'formTypeName',
      title: $t('qualityModule.qualityCheck.qualityEntering.formTypeName'),
      width: 120,
    },
    {
      field: 'productReferenceName',
      title: $t(
        'qualityModule.qualityCheck.qualityEntering.productReferenceName',
      ),
      width: 120,
    },
    {
      field: 'action',
      title: $t('common.operation'),
      width: 80,
      fixed: 'right',
      slots: { default: 'action' },
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 50,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  rowConfig: {
    keyField: 'id',
  },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [Grid] = useVbenVxeGrid({ gridOptions });

/**
 * 查询数据
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      pageNum: page,
      pageSize,
    };

    fetchQcFormList(params)
      .then(({ total, results }: any) => {
        resolve({
          total,
          items: results,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// 查看详情
function handleView(row: any) {
  currentForm.value = row;
  drawerVisible.value = true;
}

// 初始化
onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});
</script>

<template>
  <Page>
    <!-- 表格 -->
    <Card>
      <Grid>
        <template #action="{ row }">
          <Space>
            <Tooltip v-if="permissions.view">
              <template #title>{{ $t('common.view') }}</template>
              <Button type="link" class="px-1" @click="handleView(row)">
                <Icon
                  icon="mdi:eye-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 查看抽屉 -->
    <QualityEnteringDrawer
      v-model:visible="drawerVisible"
      :form-data="currentForm"
    />
  </Page>
</template>
