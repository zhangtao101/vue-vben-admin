<script lang="ts" setup>
import type { TreeProps } from 'ant-design-vue';

/**
 * 物料选择对话框组件
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { Button, Checkbox, Col, Form, FormItem, Input, message, Modal, Row, Tree } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  fetchMaterialList,
  fetchMaterialTree,
  fetchToReceivePlanList,
} from '#/api';

// Props
const props = defineProps<{
  open: boolean;
}>();

// Emits
const emit = defineEmits<{
  confirm: [material: any];
  'update:open': [value: boolean];
}>();

// 物料树数据
const materialTreeData = ref<any[]>([]);
const materialSelection = ref<any>({});

// 查询参数
const queryParams = reactive({
  typeCode: undefined as string | undefined,
  type: undefined as string | undefined,
  materialCode: undefined as string | undefined,
  materialName: undefined as string | undefined,
  pageNum: 1,
  pageSize: 10,
});

// 表格列配置
const gridColumns: any[] = [
  { type: 'radio', width: 60 },
  {
    field: 'isQualityTest',
    title: $t('storeManagement.labelPrint.qualityTest'),
    width: 60,
    slots: { default: 'isQualityTest' },
  },
  {
    field: 'isHalf',
    title: $t('storeManagement.labelPrint.semiFinished'),
    width: 70,
    slots: { default: 'isHalf' },
  },
  {
    field: 'materialCode',
    title: $t('storeManagement.labelPrint.materialCode'),
    width: 120,
  },
  {
    field: 'materialName',
    title: $t('storeManagement.labelPrint.materialName'),
    minWidth: 200,
    showOverflow: 'tooltip',
  },
  {
    field: 'unit',
    title: $t('storeManagement.labelPrint.unit'),
    width: 80,
  },
];

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: gridColumns,
  height: 300,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryMaterialList({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  stripe: true,
};

// 表格事件
const gridEvents = {
  radioChange: ({ row }: any) => {
    materialSelection.value = row || {};
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 监听打开状态
watch(
  () => props.open,
  (val) => {
    if (val) {
      // 重置选择状态
      materialSelection.value = {};
      // 重置查询参数
      queryParams.typeCode = undefined;
      queryParams.type = undefined;
      queryParams.materialCode = undefined;
      queryParams.materialName = undefined;
      queryParams.pageNum = 1;
      // 加载物料树
      loadMaterialTree();
      // 加载物料列表
      gridApi.reload();
    }
  },
);

/**
 * 加载物料类型树
 */
function loadMaterialTree() {
  fetchMaterialTree({})
    .then((data: any) => {
      materialTreeData.value = data ? [data] : [];
    })
    .catch((error: any) => {
      message.error(
        error.message || $t('storeManagement.labelPrint.getDetailFailed'),
      );
    });
}

/**
 * 点击物料树节点
 */
const handleTreeNodeClick: TreeProps['onSelect'] = (_selectedKeys, info) => {
  queryParams.typeCode = info.node.typeCode;
  queryParams.type = info.node.type;
  gridApi.reload();
};

/**
 * 查询物料列表
 */
function queryMaterialList({ page, pageSize }: any) {
  return new Promise((resolve) => {
    fetchMaterialList({
      ...queryParams,
      pageNum: page,
      pageSize,
    }).then(({ total, results }: any) => {
      resolve({
        total,
        items: results || [],
      });
    });
  });
}

/**
 * 物料查询
 */
function handleQuery() {
  gridApi.reload();
}

/**
 * 确定选择物料
 */
function handleOk() {
  const selectedRow = gridApi.grid.getRadioRecord();
  if (!selectedRow?.materialCode) {
    message.warning($t('storeManagement.labelPrint.pleaseSelectMaterial'));
    return;
  }

  fetchToReceivePlanList(selectedRow.materialCode).then((msg: any) => {
    if (msg) message.info(msg);
  });

  emit('confirm', selectedRow);
  handleClose();
}

/**
 * 关闭对话框
 */
function handleClose() {
  emit('update:open', false);
}
</script>

<template>
  <Modal
    :open="open"
    :title="$t('storeManagement.labelPrint.chooseMaterial')"
    width="980px"
    @ok="handleOk"
    @cancel="handleClose"
  >
    <Row>
      <Col :span="6">
        <Tree
          :tree-data="materialTreeData"
          :field-names="{
            children: 'children',
            title: 'typeName',
            key: 'typeCode',
          }"
          @select="handleTreeNodeClick"
        />
      </Col>
      <Col :span="18">
        <Form layout="inline" class="mb-4">
          <FormItem :label="$t('storeManagement.labelPrint.materialName')">
            <Input
              v-model:value="queryParams.materialName"
              :placeholder="
                $t('common.pleaseEnter') +
                $t('storeManagement.labelPrint.materialName')
              "
              style="width: 150px"
            />
          </FormItem>
          <FormItem :label="$t('storeManagement.labelPrint.materialCode')">
            <Input
              v-model:value="queryParams.materialCode"
              :placeholder="
                $t('common.pleaseEnter') +
                $t('storeManagement.labelPrint.materialCode')
              "
              style="width: 150px"
            />
          </FormItem>
          <FormItem>
            <Button type="primary" @click="handleQuery">
{{
              $t('common.search')
            }}
</Button>
          </FormItem>
        </Form>

        <Grid>
          <template #isQualityTest="{ row }">
            <Checkbox v-model:checked="row.isQualityTest" disabled />
          </template>
          <template #isHalf="{ row }">
            <Checkbox v-model:checked="row.isHalf" disabled />
          </template>
        </Grid>
      </Col>
    </Row>
  </Modal>
</template>
