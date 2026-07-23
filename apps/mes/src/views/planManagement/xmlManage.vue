<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  message,
  Select,
  Space,
  TabPane,
  Tabs,
  Tag,
  Upload,
} from 'ant-design-vue';
import { storeToRefs } from 'pinia';
import { JsonViewer } from 'vue3-json-viewer';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getXmlImportDetail, getXmlImportRecords } from '#/api';
import { $t } from '#/locales';

import 'vue3-json-viewer/dist/vue3-json-viewer.css';

const accessStore = useAccessStore();
const { accessToken } = storeToRefs(accessStore);

const headers = ref<any>({
  Authorization: accessToken.value,
});

const action = ref<string>(
  `/ht/${import.meta.env.VITE_GLOB_MES_MAIN}/xmlImport/upload`,
);

const fileList = ref<any>([]);

// region 搜索参数
const queryParams = ref<any>({ fileType: undefined });

const fileTypeOptions = ref([
  { label: 'xmlManage.fileTypePPSImport', value: 'PPSImport' },
  { label: 'xmlManage.fileTypePPSExport', value: 'PPSExport' },
  { label: 'xmlManage.fileTypeFabImport', value: 'FabImport' },
]);
// endregion

// region 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      type: 'seq',
      title: $t('page.common.serialNumber'),
      width: 50,
      minWidth: 50,
    },
    {
      field: 'fileName',
      title: $t('xmlManage.fileName'),
      minWidth: 200,
      showOverflow: true,
    },
    {
      field: 'fileType',
      title: $t('xmlManage.fileType'),
      width: 120,
    },
    {
      field: 'importTime',
      title: $t('xmlManage.importTime'),
      width: 180,
    },
    {
      field: 'status',
      title: $t('xmlManage.status'),
      width: 80,
      slots: { default: 'status_default' },
    },
    {
      field: 'recordCount',
      title: $t('xmlManage.recordCount'),
      width: 100,
    },
    {
      field: 'errorMsg',
      title: $t('xmlManage.errorMsg'),
      minWidth: 200,
      showOverflow: true,
    },
    {
      title: $t('common.operation'),
      width: 100,
      fixed: 'right',
      slots: { default: 'action_default' },
    },
  ],
  height: 500,
  stripe: true,
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
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
// endregion

// region 查询数据
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    getXmlImportRecords({
      ...queryParams.value,
      pageNum: page,
      pageSize,
    })
      .then(({ total, list }) => {
        resolve({
          total,
          items: list,
        });
      })
      .catch((error: any) => {
        reject(error);
      });
  });
}

function handleSearch() {
  gridApi.reload();
}
// endregion

// region 明细抽屉
const detailVisible = ref(false);
const detailData = ref<any>({
  importRecord: {},
  workingSteps: [],
  workingStepResources: [],
  details: [],
});

function handleViewDetail(row: any) {
  getXmlImportDetail({ importId: row.id }).then((data: any) => {
      detailData.value = data;
      detailVisible.value = true;
  });
}

function handleCloseDrawer() {
  detailVisible.value = false;
}
// endregion

// region 文件上传
function handleChange(info: any) {
  if (info.file.status === 'done') {
    gridApi.reload();
    message.success($t('xmlManage.uploadSuccess'));
    fileList.value = [];
  } else if (info.file.status === 'error') {
    const errorMessage =
      info.file.response?.message || $t('xmlManage.uploadFailed');
    message.error(errorMessage);
    fileList.value = [];
  }
}
// endregion

onMounted(() => {
  gridApi.reload();
});
</script>

<template>
  <Page>
    <!-- region 搜索区域 -->
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem
          :label="$t('xmlManage.fileType')"
          name="fileType"
          class="!mb-0"
        >
          <Select
            v-model:value="queryParams.fileType"
            :placeholder="$t('xmlManage.fileTypePlaceholder')"
            :options="fileTypeOptions"
            allow-clear
            style="min-width: 180px"
            :field-names="{ label: 'label', value: 'value' }"
          />
        </FormItem>
        <FormItem class="!mb-0">
          <Space>
            <Button type="primary" @click="handleSearch">
              {{ $t('common.query') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 表格主体 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <Upload
              v-model:file-list="fileList"
              :action="action"
              :headers="headers"
              :show-upload-list="false"
              name="file"
              accept=".xml"
              @change="handleChange"
            >
              <Button type="default">
                {{ $t('xmlManage.uploadXml') }}
              </Button>
            </Upload>
        </template>
        <!-- 状态 -->
        <template #status_default="{ row }">
          <Tag v-if="row.status === 1" color="success">
            {{ $t('xmlManage.statusSuccess') }}
          </Tag>
          <Tag v-else color="error">
            {{ $t('xmlManage.statusFailed') }}
          </Tag>
        </template>
        <!-- 操作 -->
        <template #action_default="{ row }">
          <Button type="link" @click="handleViewDetail(row)">
            {{ $t('xmlManage.viewDetail') }}
          </Button>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- region 明细抽屉 -->
    <Drawer
      :open="detailVisible"
      :title="$t('xmlManage.detailTitle')"
      :width="960"
      @close="handleCloseDrawer"
    >
      <Tabs>
        <!-- 导入记录 -->
        <TabPane :tab="$t('xmlManage.importRecord')" key="record">
          <Card size="small" :bordered="false">
            <Descriptions bordered :column="2" size="small">
              <DescriptionsItem :label="$t('xmlManage.importId')">
                {{ detailData.importRecord.id }}
              </DescriptionsItem>
              <DescriptionsItem :label="$t('xmlManage.fileName')">
                {{ detailData.importRecord.fileName }}
              </DescriptionsItem>
              <DescriptionsItem :label="$t('xmlManage.fileType')">
                {{ detailData.importRecord.fileType }}
              </DescriptionsItem>
              <DescriptionsItem :label="$t('xmlManage.importTime')">
                {{ detailData.importRecord.importTime }}
              </DescriptionsItem>
              <DescriptionsItem :label="$t('xmlManage.recordCount')">
                {{ detailData.importRecord.recordCount }}
              </DescriptionsItem>
              <DescriptionsItem :label="$t('xmlManage.status')">
                <Tag
                  v-if="detailData.importRecord.status === 1"
                  color="success"
                >
                  {{ $t('xmlManage.statusSuccess') }}
                </Tag>
                <Tag v-else color="error">
                  {{ $t('xmlManage.statusFailed') }}
                </Tag>
              </DescriptionsItem>
              <DescriptionsItem
                v-if="detailData.importRecord.errorMsg"
                :label="$t('xmlManage.errorMsg')"
                :span="2"
              >
                {{ detailData.importRecord.errorMsg }}
              </DescriptionsItem>
            </Descriptions>
          </Card>
        </TabPane>

        <!-- 工序明细 -->
        <TabPane :tab="$t('xmlManage.workingSteps')" key="steps">
          <JsonViewer
            :value="detailData.workingSteps"
            copyable
            boxed
            sort
            theme="light"
          />
        </TabPane>

        <!-- 工序资源 -->
        <TabPane :tab="$t('xmlManage.workingStepResources')" key="resources">
          <JsonViewer
            :value="detailData.workingStepResources"
            copyable
            boxed
            sort
            theme="light"
          />
        </TabPane>

        <!-- 物料明细 -->
        <TabPane :tab="$t('xmlManage.details')" key="details">
          <JsonViewer
            :value="detailData.details"
            copyable
            boxed
            sort
            theme="light"
          />
        </TabPane>
      </Tabs>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
