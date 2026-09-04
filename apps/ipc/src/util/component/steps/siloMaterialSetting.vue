<script setup lang="ts">
import { onMounted, ref } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import { Button, Card, message } from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { searchSilo, updateSilo } from '#/api';
import { $t } from '#/locales';

import MaterialSelectDrawer from '../drawers/MaterialSelectDrawer.vue';

/**
 * 工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
defineProps({
  functionId: { type: Number, default: 0 },
  workstationCode: { type: String, default: '' },
  /** 工序编号，由外部传入 */
  processCode: { type: String, default: '' },
});

// region 筒仓设备列表（分页查询）
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
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
      slots: { default: 'materialCode' },
    },
    {
      field: 'materialName',
      title: $t('siloMaterialSetting.materialName'),
      minWidth: 160,
    },
  ],
  height: 360,
  pagerConfig: { enabled: true, pageSize: 10 },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/**
 * 查询筒仓设备列表数据。
 * @param params 包含 pageNum 和 pageSize 的分页参数
 * @returns 返回包含总数和数据列表的 Promise
 * @since 2026-08-31
 */
function queryData({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) {
  return new Promise((resolve) => {
    searchSilo({ pageNum, pageSize })
      .then((res: any) => {
        const list = (res.list || []).map((item: any) => ({
          ...item,
          // 兼容后端字段名不一致：响应为 materiaCode，提交为 materialCode
          materialCode: item.materialCode ?? item.materiaCode,
        }));
        resolve({ total: res.total || 0, items: list });
      })
      .catch(() => {
        resolve({ total: 0, items: [] });
      });
  });
}

// endregion

// region 物料选择：点击表格内物料编号，弹出抽屉修改
const materialDrawerRef = ref();

/** 当前正在修改的筒仓设备行 */
const editingRow = ref<any>(null);

/**
 * 点击物料编号：打开物料选择抽屉。
 * @param row 当前行数据
 * @since 2026-08-31
 */
function handleMaterialClick(row: any) {
  editingRow.value = row;
  materialDrawerRef.value.open();
}

/**
 * 物料选择回调：将选中的物料提交到后端保存，成功后重新加载表格。
 * @param material 抽屉中选中的物料数据
 * @since 2026-08-31
 */
async function handleMaterialSelect(material: any) {
  const row = editingRow.value;
  if (!row) {
    return;
  }
  const payload = {
    equipCode: row.equipCode ?? '',
    equipName: row.equipName ?? '',
    id: row.id,
    materialCode: material.materialCode,
    materialName: material.materialName,
    purchaseDate: row.purchaseDate ?? '',
    type: row.type ?? '',
  };
  try {
    await updateSilo(payload);
    message.success($t('siloMaterialSetting.updateSuccess'));
    gridApi.reload();
  } catch {
    message.error($t('siloMaterialSetting.updateFailed'));
  }
}
// endregion

onMounted(() => {
  gridApi.reload();
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="text-lg font-bold">{{ $t('siloMaterialSetting.title') }}</div>

    <!-- 设备代码列表 -->
    <Card>
      <div class="mb-2 font-bold">
        {{ $t('siloMaterialSetting.deviceList') }}
      </div>
      <Grid>
        <template #toolbar-tools></template>
        <template #materialCode="{ row }">
          <Button type="link" class="px-1" @click="handleMaterialClick(row)">
            <Icon icon="mdi:pencil-outline" class="inline-block align-middle" />
            {{ row.materialCode || '-' }}
          </Button>
        </template>
      </Grid>
    </Card>

    <!-- 物料选择抽屉 -->
    <MaterialSelectDrawer
      ref="materialDrawerRef"
      @select="handleMaterialSelect"
    />
  </div>
</template>
