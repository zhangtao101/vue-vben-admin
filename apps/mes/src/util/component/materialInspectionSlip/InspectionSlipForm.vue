<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, nextTick, ref, watch } from 'vue';

import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Col,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Row,
  Select,
  Space,
  Tooltip,
  TreeSelect,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createInspectionSlip,
  fetchChooseTree,
  fetchInspectionSlipDetail,
  fetchMaterialWarehouseList,
  searchLabelList,
  updateInspectionSlip,
} from '#/api';

const props = defineProps<{
  row: any;
  status: 'create' | 'update';
  visible: boolean;
}>();

const emit = defineEmits<{
  success: [];
  'update:visible': [value: boolean];
}>();

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

const title = computed(() =>
  props.status === 'create' ? $t('common.add') : $t('common.edit'),
);

// 表单数据
const formData = ref<any>({
  formCode: '',
  sendDate: '',
  sendOrgName: '',
  sendOrgCode: '',
  sendUsername: '',
  logicalWarehouseCode: '',
  remark: '',
  labelIdList: [] as string[],
});

// 仓库列表
const warehouseList = ref<any[]>([]);

// 标签导入弹窗
const labelImportVisible = ref(false);

// 标签导入查询参数
const labelQueryParams = ref({
  labelCode: '',
  materialName: '',
  materialCode: '',
  batchCode: '',
  status: 1,
  check: false,
  page: 1,
  pageSize: 100_000,
});

// 选中的标签
const selectedLabels = ref<any[]>([]);

// 部门树数据
const deptTreeData = ref<any[]>([]);

// 标签导入表格列
const labelColumns: any[] = [
  { type: 'checkbox', width: 50 },
  {
    field: 'labelCode',
    title: $t('storeManagement.inspectionSlip.barCode'),
    minWidth: 120,
  },
  {
    field: 'recordCode',
    title: $t('storeManagement.inspectionSlip.recordCode'),
    minWidth: 120,
  },
  {
    field: 'recordDate',
    title: $t('storeManagement.inspectionSlip.recordDate'),
    width: 100,
  },
  {
    field: 'materialCode',
    title: $t('storeManagement.labelPrint.materialCode'),
    width: 120,
  },
  {
    field: 'materialName',
    title: $t('storeManagement.labelPrint.materialName'),
    minWidth: 150,
  },
  { field: 'unit', title: $t('storeManagement.labelPrint.unit'), width: 60 },
  {
    field: 'packageNumber',
    title: $t('storeManagement.labelPrint.packageNumber'),
    width: 80,
  },
  {
    field: 'purchasePlanCode',
    title: $t('storeManagement.labelPrint.purchasePlanCode'),
    width: 100,
  },
  {
    field: 'contractCode',
    title: $t('storeManagement.labelPrint.contractCode'),
    width: 120,
  },
  {
    field: 'formType',
    title: $t('storeManagement.labelPrint.formType'),
    width: 80,
  },
  {
    field: 'batchCode',
    title: $t('storeManagement.labelPrint.batchCode'),
    width: 120,
  },
  {
    field: 'remark',
    title: $t('storeManagement.labelPrint.remark'),
    width: 100,
  },
];

// 标签导入表格配置
const labelGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns: labelColumns,
  height: 400,
  data: [],
  showOverflow: 'tooltip',
  stripe: true,
};

const [LabelGrid, labelGridApi] = useVbenVxeGrid({
  gridOptions: labelGridOptions,
});

// 已选标签表格列
const selectedColumns: any[] = [
  { type: 'seq', title: '序号', width: 50 },
  {
    field: 'materialCode',
    title: $t('storeManagement.labelPrint.materialCode'),
    width: 120,
  },
  {
    field: 'materialName',
    title: $t('storeManagement.labelPrint.materialName'),
    minWidth: 150,
  },
  { field: 'unit', title: $t('storeManagement.labelPrint.unit'), width: 60 },
  {
    field: 'packageNumber',
    title: $t('storeManagement.labelPrint.packageNumber'),
    width: 80,
  },
  {
    field: 'sendNumber',
    title: $t('storeManagement.inspectionSlip.sendNumber'),
    width: 150,
  },
  {
    field: 'labelCode',
    title: $t('storeManagement.labelPrint.labelCode'),
    minWidth: 150,
  },
  {
    field: 'manufacturerName',
    title: $t('storeManagement.labelPrint.manufacturerName'),
    minWidth: 120,
  },
  {
    field: 'validDate',
    title: $t('storeManagement.labelPrint.validDate'),
    width: 100,
  },
  {
    field: 'batchCode',
    title: $t('storeManagement.labelPrint.batchCode'),
    width: 120,
  },
  {
    field: 'produceDate',
    title: $t('storeManagement.labelPrint.produceDate'),
    width: 100,
  },
  {
    field: 'formType',
    title: $t('storeManagement.labelPrint.formType'),
    width: 80,
  },
  {
    field: 'contractCode',
    title: $t('storeManagement.labelPrint.contractCode'),
    width: 120,
  },
  {
    field: 'purchasePlanCode',
    title: $t('storeManagement.labelPrint.purchasePlanCode'),
    width: 100,
  },
  {
    field: 'warehouseName',
    title: $t('storeManagement.inspectionSlip.warehouseName'),
    width: 100,
  },
  {
    field: 'wareLocationName',
    title: $t('storeManagement.inspectionSlip.wareLocationName'),
    width: 100,
  },
];

if (props.status === 'create') {
  selectedColumns.push({
    title: '操作',
    width: 80,
    slots: { default: 'action' },
  });
}

const selectedGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: selectedColumns,
  height: 300,
  showOverflow: 'tooltip',
  stripe: true,
  editConfig: {
    trigger: 'click',
    mode: 'cell',
  },
};

const [SelectedGrid, selectedGridApi] = useVbenVxeGrid({
  gridOptions: selectedGridOptions,
});

// 加载仓库列表
function loadWarehouseList() {
  fetchMaterialWarehouseList().then((res: any) => {
    warehouseList.value = res || [];
  });
}

// 加载部门树
function loadDeptTree() {
  fetchChooseTree().then((res: any) => {
    deptTreeData.value = res ? [res] : [];
  });
}

// 打开标签导入弹窗
function openLabelImport() {
  labelImportVisible.value = true;
  loadLabelList();
}

// 加载标签列表
function loadLabelList() {
  searchLabelList(labelQueryParams.value).then((res: any) => {
    labelGridApi.grid.reloadData(res?.results || []);
  });
}

// 标签导入查询
function handleLabelQuery() {
  loadLabelList();
}

// 确认导入标签
function confirmLabelImport() {
  const selected = labelGridApi.grid.getCheckboxRecords();
  selectedLabels.value = [...selectedLabels.value, ...selected];
  if (selectedGridApi.grid) {
    selectedGridApi.grid.reloadData(selectedLabels.value);
  }
  labelImportVisible.value = false;
}

// 删除已选标签
function removeLabel(_row: any, index: number) {
  selectedLabels.value.splice(index, 1);
  if (selectedGridApi.grid) {
    selectedGridApi.grid.reloadData(selectedLabels.value);
  }
}

// 部门选择变化
function handleDeptChange(value: string, _labelList: any[], extra: any) {
  formData.value.sendOrgCode = value;
  formData.value.sendOrgName = extra.triggerNode?.orgFullName || '';
}

// 保存
function handleSave() {
  // 从表格获取最新数据
  const tableData =
    selectedGridApi.grid?.getTableData?.()?.fullData || selectedLabels.value;

  const data = {
    ...formData.value,
    labelIdList: tableData.map((item: any) => item.id),
    labelList: tableData.map((item: any) => ({
      id: item.id,
      labelId: item.labelId || item.id,
      sendNumber: item.sendNumber,
    })),
  };

  if (props.status === 'create') {
    createInspectionSlip(data).then(() => {
      message.success($t('common.successfulOperation'));
      emit('success');
      visible.value = false;
    });
  } else {
    updateInspectionSlip(data).then(() => {
      message.success($t('common.successfulOperation'));
      emit('success');
      visible.value = false;
    });
  }
}

// 监听弹窗打开
watch(visible, (val) => {
  if (val) {
    loadWarehouseList();
    loadDeptTree();
    nextTick(() => {
      if (props.status === 'update' && props.row?.id) {
        fetchInspectionSlipDetail(props.row.id).then((res: any) => {
          formData.value = {
            ...res,
          };
          selectedLabels.value = res.labelList || [];
          if (selectedGridApi.grid) {
            selectedGridApi.grid.reloadData(selectedLabels.value);
          }
        });
      } else {
        formData.value = {
          formCode: '',
          sendDate: '',
          sendOrgName: '',
          sendOrgCode: '',
          sendUsername: '',
          logicalWarehouseCode: '',
          remark: '',
          labelIdList: [],
        };
        selectedLabels.value = [];
        if (selectedGridApi.grid) {
          selectedGridApi.grid.reloadData([]);
        }
      }
    });
  }
});
</script>

<template>
  <Drawer
    v-model:open="visible"
    :title="title"
    :footer-style="{ textAlign: 'right' }"
    width="80%"
  >
    <!-- 标签导入抽屉 -->
    <Drawer
      v-model:open="labelImportVisible"
      :title="$t('storeManagement.inspectionSlip.labelImport')"
      :footer-style="{ textAlign: 'right' }"
      width="70%"
    >
      <Form layout="inline" class="mb-4">
        <FormItem :label="$t('storeManagement.inspectionSlip.barCode')">
          <Input
            v-model:value="labelQueryParams.labelCode"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem :label="$t('storeManagement.inspectionSlip.materialName')">
          <Input
            v-model:value="labelQueryParams.materialName"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem :label="$t('storeManagement.inspectionSlip.materialCode')">
          <Input
            v-model:value="labelQueryParams.materialCode"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem :label="$t('storeManagement.labelPrint.batchCode')">
          <Input
            v-model:value="labelQueryParams.batchCode"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleLabelQuery">
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
      <LabelGrid />
      <template #footer>
        <Space>
          <Button @click="labelImportVisible = false">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="primary" @click="confirmLabelImport">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>

    <Form :model="formData" layout="vertical">
      <div class="mb-4">
        <Button
          v-if="status === 'create'"
          type="primary"
          @click="openLabelImport"
        >
          {{ $t('storeManagement.inspectionSlip.labelImport') }}
        </Button>
      </div>

      <Row :gutter="24">
        <Col :span="12">
          <FormItem :label="$t('storeManagement.labelPrint.formCode')">
            <Input v-model:value="formData.formCode" disabled />
          </FormItem>
        </Col>
        <Col :span="12">
          <FormItem :label="$t('storeManagement.inspectionSlip.sendDate')">
            <Input v-model:value="formData.sendDate" disabled />
          </FormItem>
        </Col>
      </Row>
      <Row :gutter="24">
        <Col :span="12">
          <FormItem :label="$t('storeManagement.inspectionSlip.sendOrgName')">
            <TreeSelect
              v-model:value="formData.sendOrgCode"
              :tree-data="deptTreeData"
              :field-names="{
                label: 'orgFullName',
                value: 'orgCode',
                children: 'children',
              }"
              tree-default-expand-all
              allow-clear
              placeholder=""
              @change="handleDeptChange"
            />
          </FormItem>
        </Col>
        <Col :span="12">
          <FormItem :label="$t('storeManagement.inspectionSlip.sendUsername')">
            <Input v-model:value="formData.sendUsername" disabled />
          </FormItem>
        </Col>
      </Row>
      <Row :gutter="24">
        <Col :span="12">
          <FormItem
            :label="$t('storeManagement.inspectionSlip.logicalWarehouse')"
          >
            <Select v-model:value="formData.logicalWarehouseCode">
              <Select.Option
                v-for="item in warehouseList"
                :key="item.warehouseCode"
                :value="item.warehouseCode"
              >
                {{ item.warehouseName }}
              </Select.Option>
            </Select>
          </FormItem>
        </Col>
        <Col :span="12">
          <FormItem :label="$t('storeManagement.labelPrint.remark')">
            <Input.TextArea v-model:value="formData.remark" :maxlength="100" />
          </FormItem>
        </Col>
      </Row>

      <SelectedGrid>
        <template #action="{ row: actionRow, $rowIndex }">
          <Tooltip>
            <template #title>{{ $t('common.delete') }}</template>
            <Button
              type="link"
              danger
              class="px-1"
              @click="removeLabel(actionRow, $rowIndex)"
            >
              <Icon
                icon="mdi:delete-forever-outline"
                class="inline-block align-middle text-xl"
              />
            </Button>
          </Tooltip>
        </template>
      </SelectedGrid>
    </Form>

    <template #footer>
      <Space>
        <Button @click="visible = false">{{ $t('common.cancel') }}</Button>
        <Button type="primary" @click="handleSave">
          {{ $t('common.save') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
