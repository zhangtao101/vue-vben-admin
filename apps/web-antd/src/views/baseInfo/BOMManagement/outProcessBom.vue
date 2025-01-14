<script lang="ts" setup>
import type { UploadChangeParam } from 'ant-design-vue';
import type { Key } from 'ant-design-vue/es/_util/type';

import { computed, h, ref } from 'vue';

import { Page } from '@vben/common-ui';
import {
  MaterialSymbolsDeleteOutline,
  MaterialSymbolsLightPrintOutline,
  MaterialSymbolsSearch,
  PhEyeLight,
} from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  TypographyTitle,
  Upload,
} from 'ant-design-vue';

// region 查询数据
// 查询参数
const queryParams = ref({
  // 产品编号
  productCode: '',
  // 产品名称
  productName: '',
});

// endregion

// region 表格操作

// 表格列名
const columns = ref([
  {
    dataIndex: 'step',
    ellipsis: true,
    title: '#',
    width: 60,
  },
  {
    dataIndex: 'materialCode',
    ellipsis: true,
    title: '料号',
    width: 120,
  },
  {
    dataIndex: 'typeName',
    ellipsis: true,
    title: '所属类型',
    width: 120,
  },
  {
    dataIndex: 'materialName',
    ellipsis: true,
    title: '物料名称',
    width: 120,
  },
  {
    dataIndex: 'specialLevelName',
    ellipsis: true,
    title: '品质等级',
    width: 120,
  },
  {
    dataIndex: 'createTime',
    ellipsis: true,
    title: '创建时间',
    width: 120,
  },
  {
    dataIndex: 'operation',
    ellipsis: true,
    fixed: 'right',
    title: '操作',
    width: 80,
  },
] as any[]);
// 表格滚动信息配置
const scroll = ref({
  scrollToFirstRowOnChange: true,
  x: 1500,
  y: 350,
});

// 表格数据
const data = ref([
  {
    createTime: '2023-04-01 10:00:00',
    key: 1,
    materialCode: 'M001',
    materialName: '物料一',
    specialLevelName: '高级',
    typeName: '类型A',
  },
  {
    createTime: '2023-04-02 12:30:00',
    key: 2,
    materialCode: 'M002',
    materialName: '物料二',
    specialLevelName: '中级',
    typeName: '类型B',
  },
  {
    createTime: '2023-04-03 09:15:00',
    key: 3,
    materialCode: 'M003',
    materialName: '物料三',
    specialLevelName: '初级',
    typeName: '类型C',
  },
  {
    createTime: '2023-04-04 15:45:00',
    key: 4,
    materialCode: 'M004',
    materialName: '物料四',
    specialLevelName: '高级',
    typeName: '类型A',
  },
  {
    createTime: '2023-04-05 11:00:00',
    key: 5,
    materialCode: 'M005',
    materialName: '物料五',
    specialLevelName: '中级',
    typeName: '类型B',
  },
]);

// 表格分页信息
const pagination = computed(() => ({
  current: 5,
  pageSize: 20,
  total: 200,
}));
// 表格加载状态
const tableLoading = ref(false);

/**
 * 分页信息改变事件
 */
function paginationChange(page: any) {
  pagination.value.current = page.current;
  pagination.value.pageSize = page.pageSize;
}

// 表格多选框选中的值
const state = ref<Key[]>([]);

/**
 * 表格多选框选中值改变事件
 * @param selectedRowKeys 选中的key列表
 */
function onSelectChange(selectedRowKeys: Key[]) {
  state.value = selectedRowKeys;
}

/**
 * 删除表格数据
 * @param _row 具体的行数据
 */
function delRow(_row: any) {}

// endregion

// region 查看详情

// 抽屉是否显示
const showDrawer = ref(false);

// 详情数据
const details = ref<any>([]);
// 详情表格列名
const detailColumns = ref([
  {
    dataIndex: 'step',
    ellipsis: true,
    title: '#',
    width: 60,
  },
  {
    dataIndex: 'materialType',
    ellipsis: true,
    title: '规格型号',
    width: 120,
  },
  {
    dataIndex: 'packaging',
    ellipsis: true,
    title: '封装',
    width: 120,
  },
  {
    dataIndex: 'dosage',
    ellipsis: true,
    title: '用量',
    width: 120,
  },
  {
    dataIndex: 'location',
    ellipsis: true,
    title: '位置',
    width: 120,
  },
  {
    dataIndex: 'createTime',
    ellipsis: true,
    title: '创建时间',
    width: 120,
  },
  {
    dataIndex: 'remark',
    ellipsis: true,
    title: '备注',
    width: 80,
  },
  {
    dataIndex: 'remark1',
    ellipsis: true,
    title: '备注1',
    width: 80,
  },
  {
    dataIndex: 'remark2',
    ellipsis: true,
    title: '备注2',
    width: 80,
  },
] as any[]);

/**
 * 显示详情
 * @param _row 具体的行数据
 */
function showDetails(_row: any) {
  details.value = [
    {
      createTime: '2023-04-01 10:00:00',
      dosage: '用量1',
      location: '位置1',
      materialType: '规格型号1',
      packaging: '封装1',
      remark: '备注1',
      remark1: '备注1-1',
      remark2: '备注2-1',
    },
    {
      createTime: '2023-04-02 11:00:00',
      dosage: '用量2',
      location: '位置2',
      materialType: '规格型号2',
      packaging: '封装2',
      remark: '备注2',
      remark1: '备注2-1',
      remark2: '备注2-2',
    },
    {
      createTime: '2023-04-03 12:00:00',
      dosage: '用量3',
      location: '位置3',
      materialType: '规格型号3',
      packaging: '封装3',
      remark: '备注3',
      remark1: '备注3-1',
      remark2: '备注2-3',
    },
    {
      createTime: '2023-04-04 13:00:00',
      dosage: '用量4',
      location: '位置4',
      materialType: '规格型号4',
      packaging: '封装4',
      remark: '备注4',
      remark1: '备注4-1',
      remark2: '备注2-4',
    },
    {
      createTime: '2023-04-05 14:00:00',
      dosage: '用量5',
      location: '位置5',
      materialType: '规格型号5',
      packaging: '封装5',
      remark: '备注5',
      remark1: '备注5-1',
      remark2: '备注2-5',
    },
  ];
  showDrawer.value = true;
}

// endregion

// region 文件上传
// 文件列表
const fileList = ref([] as any);
// 文件上传的请求头信息
const headers = ref({
  authorization: 'authorization-text',
});

// 文件上传状态改变事件
function handleChange(info: UploadChangeParam) {
  if (info.file.status === 'done') {
    message.success(`${info.file.name} file uploaded successfully`);
  } else if (info.file.status === 'error') {
    message.error(`${info.file.name} file upload failed.`);
  }
}

// endregion

// region 打印
// 打印抽屉是否显示
const printShow = ref(false);
// 打印的具体数据
const printData = ref({
  product: { a: 1 },
} as any);
// 公司名称
const companyName = ref();

/**
 * 显示打印抽屉
 * @param row 具体的表格行数据
 */
function showPrint(row: any) {
  printShow.value = true;
  printData.value.product = row;
  companyName.value = import.meta.env.VITE_GLOB_COMPANY_NAME;
}

/**
 * 关闭打印抽屉
 */
function closePrint() {
  printShow.value = false;
}

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 产品编号 -->
        <FormItem
          :label="$t('outProcessBom.productCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productCode" />
        </FormItem>
        <!-- 产品名称 -->
        <FormItem
          :label="$t('outProcessBom.productName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productName" />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MaterialSymbolsSearch, { class: 'inline-block mr-2' })"
            type="primary"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 表格主体 -->
    <Card>
      <!-- region 操作按钮 -->
      <Space>
        <!-- 导入 -->
        <Upload
          v-model:file-list="fileList"
          :headers="headers"
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          name="file"
          @change="handleChange"
        >
          <Button class="mb-4" type="primary">
            {{ $t('common.import') }}
          </Button>
        </Upload>
        <!-- 导出 -->
        <Button class="mb-4" type="primary">
          {{ $t('common.export') }}
        </Button>
        <!-- 模板下载 -->
        <Button
          class="mb-4"
          href="/static/downLoad/外加工物料导入格式.xls"
          type="link"
        >
          {{ $t('common.templateDownload') }}
        </Button>
      </Space>
      <!-- endregion -->

      <Table
        :columns="columns"
        :data-source="data"
        :loading="tableLoading"
        :pagination="pagination"
        :row-selection="{
          selectedRowKeys: state,
          onChange: onSelectChange,
        }"
        :scroll="scroll"
        bordered
        @change="paginationChange"
      >
        <template #bodyCell="{ column, index, record }">
          <template v-if="column.dataIndex === 'step'">
            <span>{{ index + 1 }}</span>
          </template>

          <template v-else-if="column.dataIndex === 'operation'">
            <!-- 查看详情 -->
            <Tooltip>
              <template #title>{{ $t('common.view') }}</template>
              <Button
                :icon="h(PhEyeLight, { class: 'inline-block size-6' })"
                class="mr-2"
                type="link"
                @click="showDetails(record)"
              />
            </Tooltip>

            <!-- 打印 -->
            <Tooltip>
              <template #title>{{ $t('common.print') }}</template>
              <Button
                :icon="
                  h(MaterialSymbolsLightPrintOutline, {
                    class: 'inline-block size-6',
                  })
                "
                class="mr-2"
                type="link"
                @click="showPrint(record)"
              />
            </Tooltip>

            <!-- 删除 -->
            <Tooltip>
              <template #title>{{ $t('common.delete') }}</template>
              <Popconfirm
                :cancel-text="$t('common.cancel')"
                :ok-text="$t('common.confirm')"
                :title="$t('widgets.deletionConfirmation')"
                @confirm="delRow(record)"
              >
                <Button
                  :icon="
                    h(MaterialSymbolsDeleteOutline, {
                      class: 'inline-block size-6',
                    })
                  "
                  danger
                  type="link"
                />
              </Popconfirm>
            </Tooltip>
          </template>
        </template>
      </Table>
    </Card>
    <!-- endregion -->

    <!-- region 查看详情 -->
    <Drawer
      v-model:open="showDrawer"
      :footer-style="{ textAlign: 'right' }"
      :height="560"
      class="custom-class"
      placement="top"
      title="详情查看"
    >
      <TypographyTitle :level="3">产品引用</TypographyTitle>
      <Table
        :columns="detailColumns"
        :data-source="details"
        :scroll="scroll"
        bordered
      >
        <template #bodyCell="{ column, index }">
          <template v-if="column.dataIndex === 'step'">
            <span>{{ index + 1 }}</span>
          </template>
        </template>
      </Table>
    </Drawer>
    <!-- endregion -->

    <!-- region 打印 -->
    <Drawer
      v-model:open="printShow"
      :footer-style="{ textAlign: 'right' }"
      :height="560"
      class="custom-class"
      placement="top"
      title="打印"
    >
      <!-- region 打印区域 -->
      <div id="printDiv">
        <table class="w-full">
          <thead>
            <!-- 公司名称 -->
            <tr>
              <th class="border-collapse border border-black" colspan="10">
                <TypographyTitle :level="4" class="mt-2">
                  {{ companyName }}
                </TypographyTitle>
              </th>
            </tr>
            <!-- 产品信息 -->
            <tr v-if="printData.product">
              <th
                class="flex w-full border-collapse border border-black"
                colspan="10"
              >
                <div class="flex-1">
                  <label>产品 名称</label>
                  <span>{{ printData.product.productName }}</span>
                </div>
                <div class="flex-1">555</div>
                <div class="flex-1">555</div>
              </th>
            </tr>
            <tr v-if="printData.product">
              <th
                class="flex w-full border-collapse border border-black"
                colspan="10"
              >
                <div class="flex-1">555</div>
                <div class="flex-1">555</div>
                <div class="flex-1">555</div>
              </th>
            </tr>
          </thead>
        </table>
      </div>
      <!-- endregion -->

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="closePrint">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 打印 -->
          <Button type="primary" @click="closePrint">
            {{ $t('common.print') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
