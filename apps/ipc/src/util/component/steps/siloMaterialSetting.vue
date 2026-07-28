<script setup lang="ts">
import { onMounted, ref } from 'vue';

import {
  Button,
  Form,
  message,
  Select,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { $t } from '#/locales';

/**
 * 工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
defineProps({
  functionId: { type: Number, default: 0 },
  bindingId: { type: Number, default: 0 },
  worksheetCode: { type: String, default: '' },
  equipCode: { type: String, default: '' },
  workstationCode: { type: String, default: '' },
});

// region 查询条件：设备组选择
const queryParams = ref<any>({
  group: undefined,
});

const groupOptions = [
  { label: $t('siloMaterialSetting.groupA'), value: 'G1' },
  { label: $t('siloMaterialSetting.groupB'), value: 'G2' },
];
// endregion

// region 设备代码列表（多选）
// 假数据：接口就绪后替换为接口返回
const fakeDevices: any[] = [
  {
    group: 'G1',
    equipCode: 'EQ-S01',
    equipName: '筒仓A',
    materialCode: 'M-001',
    materialName: '高筋面粉',
  },
  {
    group: 'G1',
    equipCode: 'EQ-S02',
    equipName: '筒仓B',
    materialCode: 'M-002',
    materialName: '低筋面粉',
  },
  {
    group: 'G1',
    equipCode: 'EQ-S03',
    equipName: '筒仓C',
    materialCode: 'M-003',
    materialName: '白砂糖',
  },
  {
    group: 'G2',
    equipCode: 'EQ-S04',
    equipName: '筒仓D',
    materialCode: 'M-004',
    materialName: '食盐',
  },
  {
    group: 'G2',
    equipCode: 'EQ-S05',
    equipName: '筒仓E',
    materialCode: 'M-005',
    materialName: '麦芽糊精',
  },
];

const deviceData = ref<any[]>([]);

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    {
      field: 'equipCode',
      title: $t('siloMaterialSetting.equipCode'),
      minWidth: 140,
    },
    {
      field: 'equipName',
      title: $t('siloMaterialSetting.equipName'),
      minWidth: 160,
    },
    {
      field: 'materialCode',
      title: $t('siloMaterialSetting.materialCode'),
      minWidth: 140,
    },
    {
      field: 'materialName',
      title: $t('siloMaterialSetting.materialName'),
      minWidth: 160,
    },
  ],
  data: deviceData.value,
  height: 360,
  stripe: true,
  checkboxConfig: { trigger: 'row', highlight: true, range: true },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const gridEvents: any = {
  checkboxChange: ({ records }: any) => {
    selectedRows.value = records;
  },
  checkboxAll: ({ records }: any) => {
    selectedRows.value = records;
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

const selectedRows = ref<any[]>([]);

function loadDevices() {
  const { group } = queryParams.value;
  deviceData.value = fakeDevices.filter((d) => !group || d.group === group);
  gridApi.grid.loadData([...deviceData.value]);
  selectedRows.value = [];
}

function handleQuery() {
  loadDevices();
}

function handleReset() {
  queryParams.value = { group: undefined };
  loadDevices();
}
// endregion

// region 保存
function handleSave() {
  if (selectedRows.value.length === 0) {
    message.warning($t('siloMaterialSetting.plsSelect'));
    return;
  }
  message.success($t('siloMaterialSetting.saveSuccess'));
}
// endregion

onMounted(() => {
  loadDevices();
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="text-lg font-bold">{{ $t('siloMaterialSetting.title') }}</div>

    <!-- 1. 查询条件 + 2. 设备代码列表 + 3. 保存 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <Form layout="inline" class="mb-3 flex-wrap items-end gap-2">
        <Form.Item :label="$t('siloMaterialSetting.group')">
          <Select
            v-model:value="queryParams.group"
            :options="groupOptions"
            :placeholder="$t('siloMaterialSetting.groupPlaceholder')"
            allow-clear
            style="width: 200px"
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" @click="handleQuery">
              {{ $t('common.query') }}
            </Button>
            <Button @click="handleReset">
              {{ $t('common.reset') }}
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <div class="mb-2 font-bold">{{ $t('siloMaterialSetting.deviceList') }}</div>
      <Grid>
        <template #toolbar-tools></template>
      </Grid>

      <div class="mt-3 flex justify-end">
        <Button type="primary" @click="handleSave">
          {{ $t('siloMaterialSetting.save') }}
        </Button>
      </div>
    </div>
  </div>
</template>
