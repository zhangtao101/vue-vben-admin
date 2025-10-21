<script lang="ts" setup>
import { computed, h, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiEditOutline, MdiLightDelete, MdiSearch } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  Space,
  Table,
  Tooltip,
} from 'ant-design-vue';

// region 查询数据
// 查询参数
const queryParams = ref({
  // 料号
  materialCode: '',
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
    materialCode: 'M001',
    materialName: '物料一',
    specialLevelName: '高级',
    typeName: '类型A',
  },
  {
    createTime: '2023-04-02 12:30:00',
    materialCode: 'M002',
    materialName: '物料二',
    specialLevelName: '中级',
    typeName: '类型B',
  },
  {
    createTime: '2023-04-03 09:15:00',
    materialCode: 'M003',
    materialName: '物料三',
    specialLevelName: '初级',
    typeName: '类型C',
  },
  {
    createTime: '2023-04-04 15:45:00',
    materialCode: 'M004',
    materialName: '物料四',
    specialLevelName: '高级',
    typeName: '类型A',
  },
  {
    createTime: '2023-04-05 11:00:00',
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

/**
 * 分页信息改变事件
 */
function paginationChange(page: any) {
  pagination.value.current = page.current;
  pagination.value.pageSize = page.pageSize;
}

// endregion

// region 新增 / 编辑

// 抽屉是否显示
const showDrawer = ref(false);
// 编辑对象数据
const editMessage = ref({} as any);
// 编辑对象表单验证规则
const editRules = ref({
  displayName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  ruleName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  typeName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
} as any);

// 关闭模态框
function onClose() {
  showDrawer.value = false;
}

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 料号 -->
        <FormItem
          :label="$t('basic.bomManagement.materialCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialCode" />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
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
      <div>
        <Button class="mb-4" type="primary" @click="showDrawer = true">
          {{ $t('common.add') }}
        </Button>
      </div>

      <Table
        :columns="columns"
        :data-source="data"
        :pagination="pagination"
        :scroll="scroll"
        bordered
        @change="paginationChange"
      >
        <template #bodyCell="{ column, index }">
          <template v-if="column.dataIndex === 'step'">
            <span>{{ index + 1 }}</span>
          </template>

          <template v-else-if="column.dataIndex === 'operation'">
            <Tooltip>
              <template #title>{{ $t('common.edit') }}</template>
              <Button
                :icon="h(MdiEditOutline, { class: 'inline-block size-6' })"
                class="mr-4"
                type="link"
              />
            </Tooltip>

            <Tooltip>
              <template #title>{{ $t('common.delete') }}</template>
              <Button
                :icon="
                  h(MdiLightDelete, {
                    class: 'inline-block size-6',
                  })
                "
                danger
                type="link"
              />
            </Tooltip>
          </template>
        </template>
      </Table>
    </Card>
    <!-- endregion -->

    <!-- region 新增/编辑 -->
    <Drawer
      v-model:open="showDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="600"
      class="custom-class"
      placement="right"
      root-class-name="root-class-name"
      title="信息编辑"
    >
      <Form
        :label-col="{ span: 8 }"
        :model="editMessage"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        name="editMessageForm"
      >
        <!-- 物料编号 -->
        <FormItem :label="$t('basic.bomManagement.materialCode')" name="ruleName">
          <Input v-model:value="editMessage.ruleName" />
        </FormItem>
        <!-- 物料名称 -->
        <FormItem :label="$t('basic.bomManagement.materialName')" name="typeCodeName">
          <Input v-model:value="editMessage.materialName" />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="onClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="onClose">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
