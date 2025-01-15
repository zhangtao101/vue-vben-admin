<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import {
  IconParkSolidError,
  MaterialSymbolsSearch,
  MdiSuccess,
} from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Table,
  Tooltip,
} from 'ant-design-vue';

import { auditMaterilCheck } from '#/api';
import { listWaitAudit } from '#/api/productionReport/productionFeedAudit.service';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格

const columns = ref([
  {
    dataIndex: 'step',
    ellipsis: true,
    title: '#',
    width: 60,
  },
  {
    dataIndex: 'checkCode',
    ellipsis: true,
    title: '物料投料校验异常编号',
    width: 180,
  },
  {
    dataIndex: 'worksheetCode',
    ellipsis: true,
    title: '工单号',
    width: 170,
  },
  {
    dataIndex: 'productName',
    ellipsis: true,
    title: '产品名称',
    width: 170,
  },
  {
    dataIndex: 'materialCode',
    ellipsis: true,
    title: '料号',
    width: 100,
  },
  {
    dataIndex: 'materialName',
    ellipsis: true,
    title: '物料名称',
    width: 220,
  },
  {
    dataIndex: 'useNumber',
    ellipsis: true,
    title: '投入量',
    width: 120,
  },
  {
    dataIndex: 'standardNumber',
    ellipsis: true,
    title: '标准用量上限',
    width: 120,
  },
  {
    dataIndex: 'createTime',
    ellipsis: true,
    title: '生成时间',
    width: 170,
  },
  {
    dataIndex: 'operation',
    ellipsis: true,
    fixed: 'right',
    title: '操作',
    width: 120,
  },
] as any[]);
// 表格滚动信息配置
const scroll = ref({
  scrollToFirstRowOnChange: true,
  x: 1600,
  y: 350,
});

// 表格数据
const data = ref([{}]);

// 分页信息
const paging = ref({
  current: 1,
  pageSize: 20,
  total: 200,
});
// 表格分页信息
const pagination = computed<any>(() => paging);

// 查询参数
const queryParams = ref<any>({});

// 表格加载状态
const tableLoading = ref(false);

/**
 * queryData - 负责根据当前的查询参数、分页信息和日期范围，从后端服务查询数据。
 * 该函数会更新表格的加载状态，并在查询完成后更新数据列表和总条数。
 */
function queryData() {
  // 将表格加载状态设置为 true，表示开始加载数据。
  tableLoading.value = true;

  // 构建查询参数对象，包含所有查询参数、当前页码和每页显示的数据条数。
  const params = {
    // 展开 queryParams.value 对象，包含所有查询参数。
    ...queryParams.value,
    // 设置当前页码。
    pageNum: paging.value.current,
    // 设置每页显示的数据条数。
    pageSize: paging.value.pageSize,
  };

  // 调用 listWaitAudit 函数查询数据。
  listWaitAudit(params)
    .then(({ total, list }) => {
      // 更新数据列表。
      data.value = list || [{ auditState: -1 }];
      // 更新总条数。
      paging.value.total = total;
    })
    .finally(() => {
      // 无论查询成功与否，都将表格加载状态设置为 false，表示数据加载完成。
      tableLoading.value = false;
    });
}

/**
 * 处理分页变化的函数。
 * 当分页控件的当前页或每页显示条数发生变化时，这个函数会被调用以更新分页状态。
 *
 * @param {object} page - 包含分页信息的对象。
 */
function paginationChange(page: any) {
  /**
   * 更新当前页码。
   * 将传入的 page 对象中的 current 属性值赋给 paging.value.current。
   * 这表示用户选择了新的当前页码。
   */
  paging.value.current = page.current;

  /**
   * 更新每页显示条数。
   * 将传入的 page 对象中的 pageSize 属性值赋给 paging.value.pageSize。
   * 这表示用户选择了新的每页显示条数。
   */
  paging.value.pageSize = page.pageSize;
  queryData();
}

// endregion

// region 审核

/**
 * 处理审核操作（通过或不通过）。
 * @param row 要处理的审核数据对象，包含需要审核的数据信息。
 * @param isPass 布尔值，指示是否通过审核。为 true 时表示通过审核，false 表示不通过审核。
 */
function handleAudit(row: any, isPass: boolean) {
  // 根据 isPass 的值设置对话框的标题和 audioFun 的状态码
  // 如果 isPass 为 true，表示审核通过，否则表示审核不通过
  const title = isPass ? '是否确认通过该条数据?' : '是否确认不通过该条数据?';
  const statusCode = isPass ? 1 : 2;

  // 调用 Modal.confirm 方法显示一个确认对话框，让用户确认是否执行审核操作
  Modal.confirm({
    /**
     * 设置取消按钮的文本为 '取消'。
     */
    cancelText: '取消',
    /**
     * 设置确认按钮的文本为 '确认'。
     */
    okText: '确认',
    /**
     * 设置确认按钮的类型为 'primary'，表示这是一个主要的操作。
     */
    okType: 'primary',
    /**
     * 定义确认操作的回调函数。
     * 如果用户点击确认按钮，调用 audioFun 函数处理审核逻辑。
     */
    onOk() {
      // 根据审核结果调用 audioFun 函数，传入 row.id 和状态码
      audioFun(row.id, statusCode, row);
    },
    /**
     * 设置对话框的标题，根据 isPass 的值显示不同的提示。
     */
    title,
  });
}

/**
 * 处理审核状态更新。
 * @param id 唯一标识符。
 * @param status 审核状态码，表示审核结果。
 * @param row 要处理的审核数据对象，包含需要审核的数据信息。
 */
function audioFun(id: number, status: number, row: any) {
  row.loading = true;
  /**
   * 调用 auditMaterilCheck 函数，发送审核状态更新请求。
   * @param {object} params 包含审核状态和ID的参数对象。
   */
  auditMaterilCheck({
    auditState: status, // 设置审核状态
    id, // 唯一标识符
  })
    .then(() => {
      /**
       * 请求成功后，显示成功消息提示。
       * 使用 $t 函数获取国际化的 'common.successfulOperation' 消息。
       */
      message.success($t('common.successfulOperation'));
      /**
       * 重新查询数据，以更新界面上的信息。
       */
      queryData();
    })
    .finally(() => {
      row.loading = false;
    });
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// 审核按钮是否显示
const examineButton = ref(false);

// 监听权限变化, 变更按钮的显示情况
watch(
  () => author.value,
  () => {
    // 当 author.value 包含 '审核' 时，设置 examineButton.value 为 true，表示允许审核
    examineButton.value = author.value.includes('审核');
  },
);

// endregion

onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  queryData();
});
</script>

<template>
  <Page class="bg-background-deep">
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 物料编号 -->
        <FormItem
          :label="$t('productionFeedAudit.materialCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialCode" />
        </FormItem>
        <!-- 物料名称 -->
        <FormItem
          :label="$t('productionFeedAudit.materialName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialName" />
        </FormItem>
        <!-- 产品名称 -->
        <FormItem
          :label="$t('productionFeedAudit.productName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productName" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MaterialSymbolsSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="queryData()"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 表格主体 -->
    <Card>
      <Table
        :columns="columns"
        :data-source="data"
        :loading="tableLoading"
        :pagination="pagination"
        :scroll="scroll"
        bordered
        @change="paginationChange"
      >
        <template #bodyCell="{ column, index, record }">
          <template v-if="column.dataIndex === 'step'">
            <span>{{ index + 1 }}</span>
          </template>

          <template v-else-if="column.dataIndex === 'operation'">
            <!-- 审核通过 -->
            <Tooltip v-if="record.auditState === -1 && examineButton">
              <template #title>{{ $t('common.pass') }}</template>
              <Button
                :icon="h(MdiSuccess, { class: 'inline-block size-6' })"
                :loading="record.loading"
                class="mr-4"
                type="link"
                @click="handleAudit(record, true)"
              />
            </Tooltip>

            <!-- 审核不通过 -->
            <Tooltip v-if="record.auditState === -1 && examineButton">
              <template #title>{{ $t('common.noPass') }}</template>
              <Button
                :icon="
                  h(IconParkSolidError, {
                    class: 'inline-block size-6 text-red-600',
                  })
                "
                :loading="record.loading"
                class="mr-4"
                type="link"
                @click="handleAudit(record, false)"
              />
            </Tooltip>
          </template>
        </template>
      </Table>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
