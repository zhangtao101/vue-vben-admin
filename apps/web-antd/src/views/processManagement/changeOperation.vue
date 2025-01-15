<script setup lang="ts">
import { computed, h, onMounted, ref, unref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MaterialSymbolsSearch, PhEyeLight } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Select,
  SelectOption,
  Space,
  Table,
} from 'ant-design-vue';

import { changeUse, queryChange, queryChangeDetail } from '#/api';
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
    dataIndex: 'changeCode',
    ellipsis: true,
    title: '变更任务编号',
    width: 120,
  },
  {
    dataIndex: 'changeTypeName',
    ellipsis: true,
    title: '变更类型',
    width: 120,
  },
  {
    dataIndex: 'changeBeforeVersion',
    ellipsis: true,
    title: '变更前版本',
    width: 120,
  },
  {
    dataIndex: 'changeAfterVersion',
    ellipsis: true,
    title: '变更后版本',
    width: 120,
  },
  {
    dataIndex: 'stateName',
    ellipsis: true,
    title: '变更任务状态',
    width: 120,
  },
  {
    dataIndex: 'changeTime',
    ellipsis: true,
    title: '变更时间',
    width: 120,
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
  x: 1500,
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
const queryParams = ref<any>({
  changeCode: '',
  changeType: '',
});

// 表格加载状态
const tableLoading = ref(false);

/**
 * 从服务器查询工作站数据的函数。
 * 这个函数用于发送查询请求，并在成功获取数据后更新组件的状态。
 */
function queryData() {
  tableLoading.value = true;
  /**
   * 调用 queryWorkstation 函数，传入查询参数和分页信息。
   * 查询参数包括 queryParams.value 中的所有属性，以及当前页码和每页大小。
   */
  queryChange({
    ...queryParams.value, // 展开 queryParams.value 对象，包含所有查询参数。
    pageNum: paging.value.current, // 当前页码。
    pageSize: paging.value.pageSize, // 每页显示的数据条数。
  })
    .then(({ total, list }) => {
      // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
      /**
       * 更新组件的状态。
       * 将查询到的数据列表赋值给 data.value，以便在组件中显示。
       */
      data.value = list;

      /**
       * 更新分页信息。
       * 将查询到的总条数赋值给 paging.value.total，以便正确显示分页控件。
       */
      paging.value.total = total;
    })
    .finally(() => {
      // 无论查询是否成功或失败，都将表格加载状态设置为 false。
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

// region 查看详情 / 变更
// 详情抽屉是否显示
const detailsVisible = ref(false);
// 详情数据
const editItem = ref<any>({});
// 变更详情表格列
const changeTableColumn = ref<any>();
// 工艺路线变更表格头
const changeOfProcessRoute = [
  {
    dataIndex: 'productCode',
    ellipsis: true,
    title: '绑定产品编号',
    width: 120,
  },
  {
    dataIndex: 'productName',
    ellipsis: true,
    title: '绑定产品名称',
    width: 120,
  },
];
// 工艺参数模板变更表格头
const processParameterTemplate = [
  {
    dataIndex: 'routeCode',
    ellipsis: true,
    title: '对应工艺路线编号',
    width: 180,
  },
  {
    dataIndex: 'routeName',
    ellipsis: true,
    title: '对应工艺路线名称',
    width: 180,
  },
];
const tableHeaders = [
  {
    dataIndex: 'useVersion',
    ellipsis: true,
    title: '更新后的版本号',
    width: 160,
  },
  {
    dataIndex: 'nowVersion',
    ellipsis: true,
    title: '当前对应使用的版本',
    width: 160,
  },
  {
    dataIndex: 'useStateName',
    ellipsis: true,
    title: '应用状态',
    width: 120,
  },
];
const detailsTableScroll = ref({
  scrollToFirstRowOnChange: true,
  x: 740,
  y: 350,
});
// 详情
const detailsTableData = ref<any>([]);
// 加载状态
const detailsTableDataLoading = ref(false);
// 选中的行
const selectedRow = ref<any>([]);

// 表格行选中配置
const rowSelection: any = computed(() => {
  return {
    onChange: (selectedRowKeys: any[], _selectedRows: any[]) => {
      selectedRow.value = selectedRowKeys;
    },
    selectedRowKeys: unref(selectedRow),
  };
});

/**
 * 显示详情
 * @param row 行数据
 */
function showDetails(row: any) {
  editItem.value = { ...row };
  detailsVisible.value = true;
  detailsTableDataLoading.value = true;
  changeTableColumn.value =
    editItem.value.changeType === 1
      ? [...processParameterTemplate, ...tableHeaders]
      : [...changeOfProcessRoute, ...tableHeaders];
  queryChangeDetail(editItem.value.id || 1)
    .then((d) => {
      d.forEach((item: any) => {
        item.key = item.id;
      });
      detailsTableData.value = d;
    })
    .finally(() => {
      detailsTableDataLoading.value = false;
    });
}

/**
 * 关闭抽屉
 */
function close() {
  editItem.value = {};
  detailsVisible.value = false;
  detailsTableData.value = [];
  selectedRow.value = [];
}

function submit() {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消变更!');
    },
    onOk() {
      if (selectedRow.value.length > 0) {
        changeUse({
          bindingIds: selectedRow.value,
          changeRecordId: editItem.value.id,
        })
          .then(() => {
            // 显示操作成功的提示信息
            message.success($t('common.successfulOperation'));
            queryData();
            close();
          })
          .catch((error) => {
            // 显示操作失败的提示信息
            message.error($t('common.operationFailure'));
            message.error(error.msg); // 显示操作失败的提示信息
          });
      } else {
        message.error('至少选择一条数据!');
      }
    },
    title: '是否确认变更?',
  });
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);
// 编辑按钮是否显示
const editButton = ref(false);

// 监听权限变化, 变更按钮的显示情况
watch(author.value, () => {
  // 当 author.value 包含 '编辑' 时，设置 editButton.value 为 true，表示允许编辑
  editButton.value = author.value.includes('变更');
});

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
        <!-- 变更任务编号 -->
        <FormItem
          :label="$t('changeOperation.changeOperationNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.changeCode" />
        </FormItem>
        <!-- 变更类型 -->
        <FormItem
          :label="$t('changeOperation.changeOperationType')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.changeType"
            style="width: 180px !important"
          >
            <SelectOption :value="1">工艺参数模板变更</SelectOption>
            <SelectOption :value="2">工艺路线变更</SelectOption>
          </Select>
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
            <!-- 查看按钮 -->
            <Tooltip>
              <template #title>{{ $t('common.view') }}</template>
              <Button
                :icon="h(PhEyeLight, { class: 'inline-block size-6' })"
                class="mr-4"
                type="link"
                @click="showDetails(record)"
              />
            </Tooltip>
          </template>
        </template>
      </Table>
    </Card>
    <!-- endregion -->

    <Drawer
      :footer-style="{ textAlign: 'right' }"
      :visible="detailsVisible"
      :width="800"
      title="详情"
      @close="close"
    >
      <Descriptions :column="2" bordered>
        <DescriptionsItem label="变更编号">
          {{ editItem.changeCode }}
        </DescriptionsItem>
        <DescriptionsItem label="变更类型">
          {{ editItem.changeTypeName }}
        </DescriptionsItem>
        <DescriptionsItem label="变更前版本">
          {{ editItem.changeBeforeVersion }}
        </DescriptionsItem>
        <DescriptionsItem label="当前版本">
          {{ editItem.changeAfterVersion }}
        </DescriptionsItem>
      </Descriptions>

      <Table
        :columns="changeTableColumn"
        :data-source="detailsTableData"
        :loading="detailsTableDataLoading"
        :pagination="false"
        :row-selection="rowSelection"
        :scroll="detailsTableScroll"
        bordered
        class="mt-8"
      />

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="close">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="submit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
