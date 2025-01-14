<script lang="ts" setup>
import { computed, h, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import {
  MaterialSymbolsDeleteOutline,
  MaterialSymbolsSearch,
  MingcuteEditLine,
} from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  Switch,
  Table,
  Tooltip,
} from 'ant-design-vue';

import { getMenusWeb, listStations } from '#/api';

// 路由信息
const route = useRoute();

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
    dataIndex: 'staCode',
    ellipsis: true,
    title: '岗位编码',
    width: 120,
  },
  {
    dataIndex: 'staName',
    ellipsis: true,
    title: '岗位名称',
    width: 120,
  },
  {
    dataIndex: 'staType',
    ellipsis: true,
    title: '岗位类别',
    width: 120,
  },
  {
    dataIndex: 'staLevel',
    ellipsis: true,
    title: '岗位等级',
    width: 120,
  },
  {
    dataIndex: 'operation',
    ellipsis: true,
    fixed: 'right',
    title: '操作',
    width: 100,
  },
] as any[]);
// 表格滚动信息配置
const scroll = ref({
  scrollToFirstRowOnChange: true,
  x: 1500,
  y: 350,
});

// 表格数据
const data = ref();

// 分页信息
const paging = ref({
  current: 1,
  pageSize: 20,
  total: 200,
});
// 表格分页信息
const pagination = computed<any>(() => paging);

/**
 * 分页信息改变事件
 */
function paginationChange(page: any) {
  paging.value.current = page.current;
  paging.value.pageSize = page.pageSize;
  queryData();
}

// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 岗位编码
  staCode: '',
  // 岗位名称
  staName: '',
});

// 表格加载状态
const tableLoading = ref(false);

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData() {
  tableLoading.value = true;
  // 调用 listStations API函数，传递查询参数和分页信息
  listStations({
    ...queryParams.value, // 展开queryParams.value中的所有查询参数
    pageNum: paging.value.current, // 当前页码。
    pageSize: paging.value.pageSize, // 每页显示的数据条数。
  })
    .then(({ total, list }) => {
      // 成功获取数据后，更新数据列表和总条数
      data.value = list; // 更新数据列表
      paging.value.total = total; // 更新总条数
    })
    .finally(() => {
      tableLoading.value = false;
    });
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);
// 新增按钮是否显示
const addButton = ref(false);
// 编辑按钮是否显示
const editButton = ref(false);
// 删除按钮是否显示
const delButton = ref(false);

/**
 * 查询权限
 * 这个函数用于查询当前页面的权限设置，并将权限名称存储在响应式引用author中。
 */
function queryAuth() {
  // 调用getMenusWeb API函数，传递menuCode和type参数
  getMenusWeb({
    menuCode: route.meta.code as string, // 从路由元信息中获取menuCode，并确保其为字符串类型
    type: 'web', // 指定查询的类型为'web'
  }).then((data) => {
    // 检查返回的数据是否存在且不为空数组
    if (!data || data.length === 0) return;

    // 遍历返回的数据
    for (const item of data) {
      // 将每个权限项的buttonName添加到author数组中
      author.value.push(item.buttonName);
    }
  });
}

// 监听权限变化, 变更按钮的显示情况
watch(author.value, () => {
  // 当 author.value 包含 '新增' 时，设置 addButton.value 为 true，表示允许新增
  addButton.value = author.value.includes('新增');
  // 当 author.value 包含 '编辑' 时，设置 editButton.value 为 true，表示允许编辑
  editButton.value = author.value.includes('编辑');
  // 当 author.value 包含 '删除' 时，设置 delButton.value 为 true，表示允许删除
  delButton.value = author.value.includes('删除');
});

// endregion

// region 初始化

onMounted(() => {
  // 查询用户数据
  queryData();
  // 查询权限
  queryAuth();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 岗位编码 -->
        <FormItem
          :label="$t('basePosition.jobCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.staCode" />
        </FormItem>

        <!-- 岗位名称 -->
        <FormItem
          :label="$t('basePosition.jobName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.staName" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MaterialSymbolsSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="
              paging.current = 1;
              queryData();
            "
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->
    <!-- region 表格 -->
    <Card class="mb-8">
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
          <template v-if="column.dataIndex === 'state'">
            <div v-if="record.state === 3">已弃用</div>
            <div v-else>
              <Switch
                v-model:checked="record.state"
                :checked-value="1"
                :un-checked-value="2"
                checked-children="启用"
                un-checked-children="停用"
              />
            </div>
          </template>

          <template v-else-if="column.dataIndex === 'operation'">
            <!-- 编辑按钮 -->
            <Tooltip>
              <template #title>{{ $t('common.edit') }}</template>
              <Button
                :icon="h(MingcuteEditLine, { class: 'inline-block size-6' })"
                class="mr-4"
                type="link"
                @click="editRow(record)"
              />
            </Tooltip>

            <!-- 删除数据 -->
            <Tooltip>
              <template #title>{{ $t('common.delete') }}</template>
              <Button
                :icon="
                  h(MaterialSymbolsDeleteOutline, {
                    class: 'inline-block size-6',
                  })
                "
                danger
                type="link"
                @click="delRow(record)"
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
