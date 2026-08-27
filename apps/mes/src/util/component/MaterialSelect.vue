<script lang="ts" setup>
/**
 * 子品项选择组件
 * 用于子品项（物料）选择：点击「选择」按钮打开物料弹窗，单选物料后确认，回传选中的物料信息。
 * 调用方监听 select 事件，回填 materialCode、materialName、auxiliaryUnit、unit 等字段。
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Button, Input, message, Modal, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { queryMaterialInfoList } from '#/api';
import { $t } from '#/locales';

// Props
interface Props {
  /** 是否禁用按钮 */
  disabled?: boolean;
}

defineOptions({
  name: 'MaterialSelect',
});

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

// Emits：选中物料后回传完整物料数据
const emit = defineEmits<{
  select: [material: any];
}>();

// 弹窗可见性
const dialogVisible = ref(false);

// 查询条件
const query = ref({
  pageNum: 1,
  pageSize: 10,
  materialCode: '',
  materialName: '',
});

// 物料表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50 },
    {
      title: $t('productionBom.materialCode'),
      field: 'materialCode',
      minWidth: 120,
    },
    {
      title: $t('productionBom.materialName'),
      field: 'materialName',
      minWidth: 150,
    },
    {
      title: $t('productionBom.auxiliaryUnit'),
      field: 'auxiliaryUnit',
      minWidth: 120,
    },
    { title: $t('productionBom.unit'), field: 'unit', minWidth: 80 },
  ],
  height: 400,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: ({ page }) => {
        const params = {
          ...query.value,
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        };
        return queryMaterialInfoList(params).then((res: any) => ({
          items: res.results || [],
          total: res.total || 0,
        }));
      },
    },
  },
  radioConfig: {
    highlight: true,
    trigger: 'row',
  },
  rowConfig: { keyField: 'materialCode' },
  showOverflow: 'tooltip',
  stripe: true,
};

const [MaterialGrid, materialGridApi] = useVbenVxeGrid({
  gridOptions,
});

// 打开弹窗
function handleOpen() {
  query.value = {
    pageNum: 1,
    pageSize: 10,
    materialCode: '',
    materialName: '',
  };
  materialGridApi.reload();
  dialogVisible.value = true;
}

// 确认选中物料
function handleConfirm() {
  const selectedRow = materialGridApi.grid?.getRadioRecord();
  if (!selectedRow) {
    message.warning($t('productionBom.requireMaterial'));
    return;
  }
  dialogVisible.value = false;
  emit('select', selectedRow);
}
</script>

<template>
  <Button type="primary" :disabled="props.disabled" @click="handleOpen">
    {{ $t('productionBom.select') }}
  </Button>

  <!-- 物料选择弹窗 -->
  <Modal
    v-model:open="dialogVisible"
    :title="$t('productionBom.selectData')"
    width="80%"
    :footer-style="{ textAlign: 'right' }"
    @cancel="dialogVisible = false"
  >
    <Space class="!mb-4">
      <Input
        v-model:value="query.materialCode"
        :placeholder="$t('productionBom.inputMaterialCode')"
        allow-clear
        @press-enter="materialGridApi.reload"
      />
      <Input
        v-model:value="query.materialName"
        :placeholder="$t('productionBom.inputMaterialName')"
        allow-clear
        @press-enter="materialGridApi.reload"
      />
      <Button type="primary" @click="materialGridApi.reload">
        {{ $t('productionBom.search') }}
      </Button>
    </Space>
    <MaterialGrid>
      <template #toolbar-tools></template>
    </MaterialGrid>
    <template #footer>
      <Space>
        <Button @click="dialogVisible = false">
          {{ $t('productionBom.cancel') }}
        </Button>
        <Button type="primary" @click="handleConfirm">
          {{ $t('productionBom.confirm') }}
        </Button>
      </Space>
    </template>
  </Modal>
</template>
