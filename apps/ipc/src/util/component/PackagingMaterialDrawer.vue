<script setup lang="ts">
import { reactive, ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  Input,
  message,
  Row,
  Select,
} from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';

defineOptions({
  name: 'PackagingMaterialDrawer',
});

const emit = defineEmits<{
  refresh: [];
}>();

// 内部可见性状态（defineExpose({ open }) 模式）
const show = ref(false);

// region 基本信息（抽屉顶部 Descriptions 展示）
function getDefaultBaseInfo() {
  return {
    instructionDate: '2026-07-21',
    workOrder: 'WO-20260721-001',
    lineCode: 'L01',
    productCode: 'P-001',
    productName: $t('packagingMaterialDrawer.productA'),
    instructionQty: 120,
    subLineCode: 'S1',
    subLineName: $t('packagingMaterialDrawer.subLine1'),
    unit: 'pcs',
  };
}

const baseInfo = reactive<any>(getDefaultBaseInfo());

const deviceCodeOptions = [
  { label: 'Packer-A', value: 'Packer-A' },
  { label: 'Wrapper-B', value: 'Wrapper-B' },
  { label: 'Labeler-A', value: 'Labeler-A' },
];

const drawerQuery = reactive<any>({
  deviceCode: undefined,
  tagId: '',
});
// endregion

// region BOM 列表（左）
const bomData = ref<any[]>([]);

const bomGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      field: 'materialName',
      title: $t('packagingMaterialDrawer.colMaterialName'),
      minWidth: 140,
    },
    {
      field: 'bomQty',
      title: $t('packagingMaterialDrawer.colBomQty'),
      minWidth: 120,
    },
    {
      field: 'requiredQty',
      title: $t('packagingMaterialDrawer.colRequiredQty'),
      minWidth: 120,
    },
    { field: 'unit', title: $t('packagingMaterialDrawer.colUnit'), minWidth: 80 },
  ],
  data: bomData.value,
  height: 320,
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [BomGrid, bomGridApi] = useVbenVxeGrid({ gridOptions: bomGridOptions });
// endregion

// region 加载列表（右，可多选）
const loadData = ref<any[]>([]);

const loadGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    {
      field: 'materialCode',
      title: $t('packagingMaterialDrawer.colMaterialCode'),
      minWidth: 140,
    },
    {
      field: 'materialName',
      title: $t('packagingMaterialDrawer.colMaterialName'),
      minWidth: 140,
    },
    {
      field: 'loadQty',
      title: $t('packagingMaterialDrawer.colLoadQty'),
      minWidth: 120,
    },
    { field: 'unit', title: $t('packagingMaterialDrawer.colUnit'), minWidth: 80 },
  ],
  data: loadData.value,
  height: 280,
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [LoadGrid, loadGridApi] = useVbenVxeGrid({ gridOptions: loadGridOptions });
// endregion

// region 演示数据（接口就绪后替换为真实返回）
function loadDemoData() {
  bomData.value = [
    {
      materialName: $t('packagingMaterialDrawer.matBox'),
      bomQty: 2000,
      requiredQty: 2000,
      unit: 'pcs',
    },
    {
      materialName: $t('packagingMaterialDrawer.matFilm'),
      bomQty: 500,
      requiredQty: 480,
      unit: 'roll',
    },
    {
      materialName: $t('packagingMaterialDrawer.matLabel'),
      bomQty: 3000,
      requiredQty: 3000,
      unit: 'roll',
    },
  ];
  bomGridApi.grid.loadData([...bomData.value]);

  loadData.value = [
    {
      materialCode: 'M-BOX',
      materialName: $t('packagingMaterialDrawer.matBox'),
      loadQty: 1000,
      unit: 'pcs',
    },
    {
      materialCode: 'M-FILM',
      materialName: $t('packagingMaterialDrawer.matFilm'),
      loadQty: 200,
      unit: 'roll',
    },
  ];
  loadGridApi.grid.loadData([...loadData.value]);
}
// endregion

// region open / 关闭时状态清理
function open(row?: any) {
  Object.assign(baseInfo, row?.baseInfo || getDefaultBaseInfo());
  show.value = true;
  loadDemoData();
}

function handleUnload() {
  const rows = loadGridApi.grid.getCheckboxRecords();
  if (rows.length === 0) {
    message.warning($t('packagingMaterialDrawer.plsSelectRow'));
    return;
  }
  const codes = new Set(rows.map((r: any) => r.materialCode));
  loadData.value = loadData.value.filter((r) => !codes.has(r.materialCode));
  loadGridApi.grid.loadData([...loadData.value]);
  message.success($t('packagingMaterialDrawer.unloadSuccess'));
  emit('refresh');
}

function handleLoad() {
  const rows = loadGridApi.grid.getCheckboxRecords();
  if (rows.length === 0) {
    message.warning($t('packagingMaterialDrawer.plsSelectRow'));
    return;
  }
  message.success($t('packagingMaterialDrawer.loadSuccess'));
  emit('refresh');
}

function handleClose() {
  show.value = false;
  // 关闭时清空所有状态，回到初始状态
  Object.assign(baseInfo, getDefaultBaseInfo());
  drawerQuery.deviceCode = undefined;
  drawerQuery.tagId = '';
  loadData.value = [];
  bomData.value = [];
  loadGridApi.grid?.clearData();
  bomGridApi.grid?.clearData();
}

defineExpose({ open });
// endregion
</script>

<template>
  <Drawer
    v-model:open="show"
    placement="top"
    height="88vh"
    :destroy-on-close="true"
    :title="$t('packagingMaterialDrawer.materialLoadDrawer')"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4">
      <!-- 1. 基本信息（每行 3 个） -->
      <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
        <Descriptions :column="{ xs: 1, md: 3 }" bordered>
          <DescriptionsItem :label="$t('packagingMaterialDrawer.infoInstructionDate')">
            {{ baseInfo.instructionDate }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('packagingMaterialDrawer.infoWorkOrder')">
            {{ baseInfo.workOrder }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('packagingMaterialDrawer.infoLineCode')">
            {{ baseInfo.lineCode }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('packagingMaterialDrawer.infoProductCode')">
            {{ baseInfo.productCode }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('packagingMaterialDrawer.infoProductName')">
            {{ baseInfo.productName }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('packagingMaterialDrawer.infoInstructionQty')">
            {{ baseInfo.instructionQty }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('packagingMaterialDrawer.infoSubLineCode')">
            {{ baseInfo.subLineCode }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('packagingMaterialDrawer.infoSubLineName')">
            {{ baseInfo.subLineName }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('packagingMaterialDrawer.infoUnit')">
            {{ baseInfo.unit }}
          </DescriptionsItem>
        </Descriptions>
      </div>

      <!-- 2. 左右布局：左 BOM 列表 / 右 加载列表 -->
      <Row :gutter="16">
        <Col :xs="24" :lg="12">
          <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
            <div class="mb-2 font-bold">
              {{ $t('packagingMaterialDrawer.bomList') }}
            </div>
            <BomGrid>
              <template #toolbar-tools></template>
            </BomGrid>
          </div>
        </Col>
        <Col :xs="24" :lg="12">
          <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
            <div class="mb-2 font-bold">
              {{ $t('packagingMaterialDrawer.loadList') }}
            </div>
            <Form layout="vertical" :model="drawerQuery" class="mb-2">
              <Row :gutter="12">
                <Col :xs="12" :sm="12">
                  <Form.Item :label="$t('packagingMaterialDrawer.deviceCode')">
                    <Select
                      v-model:value="drawerQuery.deviceCode"
                      :options="deviceCodeOptions"
                      :placeholder="$t('packagingMaterialDrawer.deviceCodePlaceholder')"
                      allow-clear
                    />
                  </Form.Item>
                </Col>
                <Col :xs="12" :sm="12">
                  <Form.Item :label="$t('packagingMaterialDrawer.tagId')">
                    <Input
                      v-model:value="drawerQuery.tagId"
                      :placeholder="$t('packagingMaterialDrawer.tagIdPlaceholder')"
                      allow-clear
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <LoadGrid>
              <template #toolbar-tools></template>
            </LoadGrid>
          </div>
        </Col>
      </Row>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button @click="handleUnload">{{ $t('packagingMaterialDrawer.unload') }}</Button>
        <Button type="primary" @click="handleLoad">
          {{ $t('packagingMaterialDrawer.materialLoad') }}
        </Button>
        <Button @click="handleClose">{{ $t('packagingMaterialDrawer.close') }}</Button>
      </div>
    </template>
  </Drawer>
</template>
