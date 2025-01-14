<script lang="ts" setup>
import { computed, h, ref } from 'vue';

import { Page } from '@vben/common-ui';
import {
  MaterialSymbolsDeleteOutline,
  MaterialSymbolsSearch,
  MingcuteEditLine,
} from '@vben/icons';

import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  Select,
  Space,
  Table,
  Tooltip,
} from 'ant-design-vue';

import { $t } from '#/locales';

// region 查询数据
// 查询参数
const queryParams = ref({
  // 展示方式
  ruleDisplayMode: '',
  // 规则名称
  ruleName: '',
  // 所属类型
  type: '',
});
// 类别列表
const typeList = [
  {
    label: '物料',
    value: '1',
  },
  {
    label: '产品',
    value: '2',
  },
  {
    label: 'pcb拼板',
    value: '3',
  },
  {
    label: 'pcb小板',
    value: '4',
  },
  {
    label: '模具',
    value: '5',
  },
  {
    label: '半成品',
    value: '6',
  },
  {
    label: '领料申请单',
    value: '7',
  },
  {
    label: '包装码',
    value: '8',
  },
];
// 展示方式列表
const displayModeList = [
  {
    label: '一维码',
    value: '2',
  },
  {
    label: '二维码',
    value: '1',
  },
];

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
    dataIndex: 'ruleName',
    ellipsis: true,
    title: '规则名',
    width: 120,
  },
  {
    dataIndex: 'typeName',
    ellipsis: true,
    title: '所属类型',
    width: 120,
  },
  {
    dataIndex: 'displayName',
    ellipsis: true,
    title: '展示方式',
    width: 120,
  },
  {
    dataIndex: 'typeCodeName',
    ellipsis: true,
    title: '类别选择',
    width: 120,
  },
  {
    dataIndex: 'morpCode',
    ellipsis: true,
    title: '物料/产品编号',
    width: 120,
  },
  {
    dataIndex: 'morpName',
    ellipsis: true,
    title: '物料/产品名称',
    width: 120,
  },
  {
    dataIndex: 'remarks',
    ellipsis: true,
    title: '备注',
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
    displayName: '展示方式Y1',
    morpCode: '物料编号001A',
    morpName: '产品名称B1C',
    remarks: '备注信息D1E',
    ruleName: '规则名A1',
    typeCodeName: '类别选择Z1',
    typeName: '类型X1',
  },
  {
    displayName: '展示方式Y2',
    morpCode: '物料编号002B',
    morpName: '产品名称B2D',
    remarks: '备注信息D2F',
    ruleName: '规则名A2',
    typeCodeName: '类别选择Z2',
    typeName: '类型X2',
  },
  {
    displayName: '展示方式Y3',
    morpCode: '物料编号003C',
    morpName: '产品名称B3E',
    remarks: '备注信息D3G',
    ruleName: '规则名A3',
    typeCodeName: '类别选择Z3',
    typeName: '类型X3',
  },
  {
    displayName: '展示方式Y4',
    morpCode: '物料编号004D',
    morpName: '产品名称B4F',
    remarks: '备注信息D4H',
    ruleName: '规则名A4',
    typeCodeName: '类别选择Z4',
    typeName: '类型X4',
  },
  {
    displayName: '展示方式Y5',
    morpCode: '物料编号005E',
    morpName: '产品名称B5G',
    remarks: '备注信息D5I',
    ruleName: '规则名A5',
    typeCodeName: '类别选择Z5',
    typeName: '类型X5',
  },
  {
    displayName: '展示方式Y6',
    morpCode: '物料编号006F',
    morpName: '产品名称B6H',
    remarks: '备注信息D6J',
    ruleName: '规则名A6',
    typeCodeName: '类别选择Z6',
    typeName: '类型X6',
  },
  {
    displayName: '展示方式Y7',
    morpCode: '物料编号007G',
    morpName: '产品名称B7I',
    remarks: '备注信息D7K',
    ruleName: '规则名A7',
    typeCodeName: '类别选择Z7',
    typeName: '类型X7',
  },
  {
    displayName: '展示方式Y8',
    morpCode: '物料编号008H',
    morpName: '产品名称B8J',
    remarks: '备注信息D8L',
    ruleName: '规则名A8',
    typeCodeName: '类别选择Z8',
    typeName: '类型X8',
  },
  {
    displayName: '展示方式Y9',
    morpCode: '物料编号009I',
    morpName: '产品名称B9K',
    remarks: '备注信息D9M',
    ruleName: '规则名A9',
    typeCodeName: '类别选择Z9',
    typeName: '类型X9',
  },
  {
    displayName: '展示方式Y10',
    morpCode: '物料编号010J',
    morpName: '产品名称B10L',
    remarks: '备注信息D10N',
    ruleName: '规则名A10',
    typeCodeName: '类别选择Z10',
    typeName: '类型X10',
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
        <!-- 规则名称 -->
        <FormItem
          :label="$t('page.barCodeManagement.ruleName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.ruleName" />
        </FormItem>

        <!-- 所属类型 -->
        <FormItem
          :label="$t('page.barCodeManagement.typeOfOwnership')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.type"
            :options="typeList"
            style="width: 200px"
          />
        </FormItem>
        <!-- 展示方式 -->
        <FormItem
          :label="$t('page.barCodeManagement.displayMode')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.ruleDisplayMode"
            :options="displayModeList"
            style="width: 200px"
          />
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
                :icon="h(MingcuteEditLine, { class: 'inline-block size-6' })"
                class="mr-4"
                type="link"
              />
            </Tooltip>

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
      style="color: red"
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
        <!-- 规则名称 -->
        <FormItem
          :label="$t('page.barCodeManagement.ruleName')"
          name="ruleName"
        >
          <Input v-model:value="editMessage.ruleName" />
        </FormItem>
        <!-- 所属类型 -->
        <FormItem
          :label="$t('page.barCodeManagement.typeOfOwnership')"
          name="typeName"
        >
          <Select
            v-model:value="editMessage.typeName"
            :options="typeList"
            style="width: 200px"
          />
        </FormItem>
        <!-- 展示方式 -->
        <FormItem
          :label="$t('page.barCodeManagement.displayMode')"
          name="displayName"
        >
          <Select
            v-model:value="editMessage.displayName"
            :options="displayModeList"
            style="width: 200px"
          />
        </FormItem>
        <!-- 类别选择 -->
        <FormItem
          :label="$t('page.barCodeManagement.categorySelection')"
          name="typeCodeName"
        >
          <Input v-model:value="editMessage.typeCodeName" />
        </FormItem>
        <!-- 物料/产品编码 -->
        <FormItem
          :label="$t('page.barCodeManagement.materialOrProductCode')"
          name="morpCode"
        >
          <Input v-model:value="editMessage.morpCode" />
        </FormItem>
        <!-- 物料/产品名称 -->
        <FormItem
          :label="$t('page.barCodeManagement.materialOrProductName')"
          name="morpName"
        >
          <Input v-model:value="editMessage.morpName" />
        </FormItem>
        <!-- 备注 -->
        <FormItem :label="$t('page.barCodeManagement.remark')" name="remarks">
          <Input v-model:value="editMessage.remarks" />
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
