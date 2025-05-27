<script setup lang="ts">
import type { VxeGridProps } from '@vben/plugins/src/vxe-table/types';

import { ref } from 'vue';

import { $t } from '@vben/locales';
import { useVbenVxeGrid } from '@vben/plugins/vxe-table';

import {
  Button,
  Drawer,
  message,
  Radio,
  RadioGroup,
  Space,
} from 'ant-design-vue';

import { listEquipControl, updateEquipControl } from '#/api';

const props = defineProps({
  workstationCode: {
    type: String,
    default: '',
  },
});

const gridOptions: VxeGridProps<any> = {
  columns: [
    { type: 'seq', width: 70 },
    { field: 'processCode', title: '工序编号' },
    { field: 'processName', title: '工序名称' },
    {
      title: '二维码校验',
      slots: {
        default: 'qrCodeVerification',
      },
    },
    {
      title: '设备联锁',
      slots: {
        default: 'equipmentInterlocking',
      },
    },
  ],
  data: [],
  height: 'auto',
  pagerConfig: {
    enabled: false,
  },
  showOverflow: true,
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

function submit() {
  const { tableData } = gridApi.grid.getTableData();
  updateEquipControl({
    workstationCode: props.workstationCode,
    detailVms: tableData,
  }).then(() => {
    message.success('操作成功');
    close();
  });
}

// region 暴露方法
// 是否显示抽屉
const show = ref(false);

const open = () => {
  show.value = true;
  listEquipControl({
    workstationCode: props.workstationCode,
  }).then((data) => {
    gridApi.grid.loadData(data);
  });
};

function close() {
  gridApi.grid.clearData();
  show.value = false;
}

defineExpose({
  open,
});

// endregion
</script>

<template>
  <Drawer
    v-model:open="show"
    :height="400"
    placement="top"
    :footer-style="{ textAlign: 'right' }"
    :title="$t('productionOperation.interlockConfiguration')"
  >
    <Grid>
      <template #qrCodeVerification="{ row }">
        <RadioGroup v-model:value="row.snCodeControlFlag">
          <Radio :value="1">{{ $t('common.open') }}</Radio>
          <Radio :value="-1">
            {{ $t('common.close') }}
          </Radio>
        </RadioGroup>
      </template>
      <template #equipmentInterlocking="{ row }">
        <RadioGroup
          v-model:value="row.equipControlFlag"
          :disabled="row.snCodeControlFlag !== 1"
        >
          <Radio :value="1">{{ $t('common.open') }}</Radio>
          <Radio :value="-1">{{ $t('common.close') }}</Radio>
        </RadioGroup>
      </template>
    </Grid>
    <template #footer>
      <Space>
        <!-- 取消 -->
        <Button @click="close()">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认 -->
        <Button type="primary" @click="submit()">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped></style>
