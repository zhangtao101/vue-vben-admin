<script setup lang="ts">
/**
 * [INPUT]: 依赖 vxe-table 适配器（VxeGridProps/useVbenVxeGrid）、#/api 的 EquipSelectItem 类型与 addLabelBatch/selectBom/selectPalletLabel 接口、@vben/locales 国际化、ant-design-vue 组件，以及 EquipmentSelectDrawer 设备选择抽屉。
 * [OUTPUT]: 对外提供 PackagingMaterialDrawer 物料加载/卸载抽屉组件（defineExpose({ open })）。
 * [POS]: 属于包装材料模块的物料加载/卸载业务组件，负责 BOM 展示、扫码加载、设备选择、加载确认与数量换算卸载。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-09-02 00:00:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { EquipSelectItem } from '#/api';

import { computed, reactive, ref } from 'vue';

import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { addLabelBatch, selectBom, selectPalletLabel } from '#/api';
import EquipmentSelectDrawer from '#/util/component/drawers/EquipmentSelectDrawer.vue';

defineOptions({
  name: 'PackagingMaterialDrawer',
});

const emit = defineEmits<{
  refresh: [];
}>();

// 内部可见性状态（defineExpose({ open }) 模式）
const show = ref(false);

// region 基本信息（抽屉顶部 Descriptions 展示）
/**
 * 生成基本信息默认值，字段名与后台返回保持一致。
 * @returns {object} 基本信息默认值对象，含计划日期、工单、产线、产品等字段。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function getDefaultBaseInfo() {
  return {
    planDateStart: '',
    workSheetCode: '',
    lineCode: '',
    lineName: '',
    productCode: '',
    productName: '',
    workSheetPlanNumber: undefined,
    subLineCode: '',
    subLineName: '',
    unit: '',
  };
}

// 基本信息：抽屉顶部 Descriptions 展示，字段名与后台返回保持一致
const baseInfo = reactive<any>(getDefaultBaseInfo());

// 查询条件：设备编码 + 扫码标签
const drawerQuery = reactive<any>({
  deviceCode: '',
  tagId: '',
});

/** 设备选择抽屉 ref */
const equipmentDrawerRef = ref();

/** 已选设备列表（打开抽屉时恢复选中状态） */
const selectedEquipments = ref<EquipSelectItem[]>([]);

/**
 * 打开设备选择抽屉，并传入已选设备用于恢复选中状态。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function handleOpenEquipmentSelect() {
  equipmentDrawerRef.value?.open(selectedEquipments.value, true);
}

/**
 * 设备选择回调：保存已选设备列表并回填设备编码。
 * @param {EquipSelectItem[]} rows - 设备选择抽屉返回的已选设备列表。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function handleEquipmentSelect(rows: EquipSelectItem[]) {
  selectedEquipments.value = rows || [];
  if (rows && rows.length > 0) {
    drawerQuery.deviceCode = rows[0]?.equipmentCode || '';
  }
}
// endregion

// region BOM 列表（左，数据来源接口 selectBom，参数 baseInfo.id）
// BOM 网格配置：材料/数量/需求/单位列，数据由 selectBom 接口按 lotId 查询
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
      field: 'quantity',
      title: $t('packagingMaterialDrawer.colBomQty'),
      minWidth: 120,
    },
    {
      field: 'productWt',
      title: $t('packagingMaterialDrawer.colRequiredQty'),
      minWidth: 120,
    },
    {
      field: 'unit',
      title: $t('packagingMaterialDrawer.colUnit'),
      minWidth: 80,
    },
  ],
  height: 320,
  proxyConfig: {
    ajax: {
      query: async () => {
        if (baseInfo.id === null || baseInfo.id === undefined) {
          return { total: 0, items: [] };
        }
        try {
          const res: any = await selectBom({ lotId: baseInfo.id });
          const list = Array.isArray(res) ? res : (res?.list ?? []);
          return { total: list.length, items: list };
        } catch {
          return { total: 0, items: [] };
        }
      },
    },
  },
  pagerConfig: {
    enabled: false,
  },
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [BomGrid, bomGridApi] = useVbenVxeGrid({ gridOptions: bomGridOptions });
// endregion

// region 加载列表（右，可多选）
// 已扫码加载的物料列表数据
const loadData = ref<any[]>([]);

// 加载列表网格配置：单选列 + 物料代码/名称/加载数量/单位，数量与单位列支持插槽自定义
const loadGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50, title: '' },
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
      field: 'actualWt',
      title: $t('packagingMaterialDrawer.colLoadQty'),
      minWidth: 120,
      slots: { default: 'load_actualWt' },
    },
    {
      field: 'unit',
      title: $t('packagingMaterialDrawer.colUnit'),
      minWidth: 80,
      slots: { default: 'load_unit' },
    },
  ],
  data: loadData.value,
  height: 280,
  stripe: true,
  radioConfig: {
    trigger: 'row',
  },
  pagerConfig: {
    enabled: false,
  },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [LoadGrid, loadGridApi] = useVbenVxeGrid({
  gridOptions: loadGridOptions,
});
// endregion

// region open / 关闭时状态清理
/**
 * 打开物料加载抽屉：透传外部行数据到基本信息，并刷新 BOM 与加载列表。
 * @param {object} [row] - 外部传入的工单/批次行数据，含 id 等非展示字段。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function open(row?: any) {
  // 透传外部表单全部字段（含 id 等非展示字段），未传字段用默认值兜底
  Object.assign(baseInfo, getDefaultBaseInfo(), row);
  show.value = true;
  setTimeout(() => {
    // BOM 列表按 baseInfo.id 请求接口
    bomGridApi.reload();
    loadGridApi.grid.reloadData([]);
  }, 100);
}

/**
 * 判断是否为特殊条目：scanLabel 包含 "|" 时支持行内编辑且不允许卸载。
 * @param {object} row - 加载列表行数据。
 * @returns {boolean} 是否为特殊条目。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function isSpecialMaterial(row: any) {
  return String(row?.scanLabel ?? '').includes('|');
}

/**
 * 卸载物料：校验已单选一行且非特殊条目后，打开卸载抽屉并回填换算比与当前数量。
 * @returns {void} 无返回值，校验不通过时弹出警告。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function handleUnload() {
  const row: any = loadGridApi.grid.getRadioRecord();
  if (!row) {
    message.warning($t('packagingMaterialDrawer.plsSelectRow'));
    return;
  }
  // 特殊条目（scanLabel 含 "|"）不允许卸载
  if (isSpecialMaterial(row)) {
    message.warning($t('packagingMaterialDrawer.cannotUnload'));
    return;
  }
  // 打开卸载抽屉，数据为当前单选行
  unloadRow.value = row;
  unloadForm.ratioM = 1;
  unloadForm.ratioEA = 1;
  unloadForm.currentWt = row.actualWt;
  unloadShow.value = true;
}

/**
 * 加载物料：校验设备与加载数据后调用批量保存接口，成功后刷新列表并关闭抽屉。
 * @returns {Promise<void>} 无返回值，成功后触发成功提示并关闭抽屉。
 * @throws 接口失败时由统一错误处理层提示，此处不额外捕获。
 * @since 2026-09-02 00:00:00
 */
async function handleLoad() {
  // 1. 判断设备是否选中
  if (!drawerQuery.deviceCode) {
    message.warning($t('packagingMaterialDrawer.plsSelectDevice'));
    return;
  }
  // 2. 获取表格中加载数量不为 0 的数据
  const rows = loadGridApi.grid
    .getTableData()
    .tableData.filter((row: any) => Number(row.actualWt) > 0);
  if (rows.length === 0) {
    message.warning($t('packagingMaterialDrawer.noLoadData'));
    return;
  }
  // 3. 包装数据并调用批量保存接口
  const params = rows.map((row: any) => ({
    actualWt: row.actualWt,
    lotId: baseInfo.id,
    materialCode: row.materialCode,
    materialName: row.materialName,
    scanLabel: row.scanLabel,
    unit: row.unit,
    palletLabel: drawerQuery.deviceCode,
  }));
  addLabelBatch(params).then(() => {
    message.success($t('packagingMaterialDrawer.loadSuccess'));
    emit('refresh');
    handleClose();
  });
}

/**
 * 扫码查询物料：按标签调用接口，相同标签覆盖原记录，成功后清空扫码框便于连续扫码。
 * @returns {Promise<void>} 无返回值，查询失败时弹出错误提示。
 * @throws 接口失败时由统一错误处理层提示，此处仅弹出扫码失败提示。
 * @since 2026-09-02 00:00:00
 */
async function handleScan() {
  const label = drawerQuery.tagId?.trim();
  if (!label) {
    message.warning($t('packagingMaterialDrawer.scanEmpty'));
    return;
  }
  try {
    const res: any = await selectPalletLabel(label);
    if (!res) {
      message.error($t('packagingMaterialDrawer.scanFail'));
      return;
    }
    const row = {
      ...res,
      loadQty: res.actualWt ?? res.loadQty ?? 1,
    };
    // 根据 scanLabel 判重：已存在则覆盖原记录，否则追加
    const index = loadData.value.findIndex(
      (r) => r.scanLabel === row.scanLabel,
    );
    row.actualWtCopy = row.actualWt;
    if (index === -1) {
      loadData.value.push(row);
      message.success($t('packagingMaterialDrawer.scanSuccess'));
    } else {
      loadData.value.splice(index, 1, row);
      message.info($t('packagingMaterialDrawer.scanUpdated'));
    }
    loadGridApi.grid.loadData([...loadData.value]);
    // 清空扫码框，便于连续扫码
    drawerQuery.tagId = '';
  } catch {
    message.error($t('packagingMaterialDrawer.scanFail'));
  }
}

/**
 * 关闭物料加载抽屉：清空基本信息、查询条件与两个表格数据，并连带关闭卸载抽屉。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function handleClose() {
  // 关闭时清空所有状态，回到初始状态
  Object.assign(baseInfo, getDefaultBaseInfo());
  drawerQuery.deviceCode = '';
  drawerQuery.tagId = '';
  loadData.value = [];
  loadGridApi.grid?.reloadData([]);
  bomGridApi.grid?.reloadData([]);
  handleUnloadClose();

  show.value = false;
}

// region 卸载抽屉（展示单选行信息 + 换算比）
// 卸载抽屉可见性
const unloadShow = ref(false);
// 卸载抽屉当前选中行数据
const unloadRow = ref<any>(null);
// 卸载表单：换算比（M/EA）与当前加载数量
const unloadForm = reactive<any>({
  ratioM: 1,
  ratioEA: 1,
  currentWt: undefined,
});

/**
 * 将 EA 数量按换算比转换为 M 数量（ea * ratioM / ratioEA，四舍五入保留两位小数）。
 * @param {number} ea - EA 数量，可为空值。
 * @returns {number} 换算后的 M 数量；参数或换算比为 0 时返回 0。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function convertToM(ea: number | undefined) {
  const value = Number(ea ?? 0);
  const { ratioM, ratioEA } = unloadForm;
  if (!value || !ratioM || !ratioEA) {
    return 0;
  }
  return Math.round(value * (ratioM / ratioEA) * 100) / 100;
}

/** 换算前加载数量（M）：最大值 */
const preConvertMaxM = computed(() =>
  convertToM(unloadRow.value?.actualWtCopy),
);

/** 换算前加载数量（M）：当前值 */
const preConvertCurM = computed(() => convertToM(unloadForm.currentWt));

/**
 * 确认卸载：更新加载列表中的加载数量；数量为 0 时从列表移除该行。
 * @returns {void} 无返回值，操作成功后触发成功提示。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function handleUnloadConfirm() {
  const row = unloadRow.value;
  if (!row) {
    return;
  }
  const wt = unloadForm.currentWt;
  if (wt === null || wt === undefined || wt === '') {
    message.warning($t('packagingMaterialDrawer.plsInputQty'));
    return;
  }
  const newWt = Number(wt);
  const index = loadData.value.findIndex(
    (r: any) => r.scanLabel === row.scanLabel,
  );
  if (newWt === 0) {
    // 数量为 0：真正卸载，从加载列表移除
    if (index !== -1) {
      loadData.value.splice(index, 1);
    }
    message.success($t('packagingMaterialDrawer.unloadSuccess'));
  } else if (index !== -1) {
    // 数量不为 0：仅更新加载数量
    loadData.value[index] = { ...loadData.value[index], actualWt: newWt };
    message.success($t('packagingMaterialDrawer.updateSuccess'));
  }
  loadGridApi.grid.loadData([...loadData.value]);
  handleUnloadClose();
}

/**
 * 关闭卸载抽屉并清空卸载相关状态（选中行、换算比、当前数量）。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-09-02 00:00:00
 */
function handleUnloadClose() {
  unloadShow.value = false;
  unloadRow.value = null;
  unloadForm.ratioM = 1;
  unloadForm.ratioEA = 1;
  unloadForm.currentWt = undefined;
}
// endregion

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
    :footer-style="{ textAlign: 'right' }"
  >
    <div class="flex flex-col gap-4">
      <!-- 1. 基本信息（每行 3 个） -->
      <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
        <Descriptions :column="{ xs: 1, md: 3 }" bordered>
          <DescriptionsItem
            :label="$t('packagingMaterialDrawer.infoInstructionDate')"
          >
            {{ baseInfo.planDateStart }}
          </DescriptionsItem>
          <DescriptionsItem
            :label="$t('packagingMaterialDrawer.infoWorkOrder')"
          >
            {{ baseInfo.workSheetCode }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('packagingMaterialDrawer.infoLineCode')">
            {{ baseInfo.lineCode }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('packagingMaterialDrawer.infoLineName')">
            {{ baseInfo.lineName }}
          </DescriptionsItem>
          <DescriptionsItem
            :label="$t('packagingMaterialDrawer.infoProductCode')"
          >
            {{ baseInfo.productCode }}
          </DescriptionsItem>
          <DescriptionsItem
            :label="$t('packagingMaterialDrawer.infoProductName')"
          >
            {{ baseInfo.productName }}
          </DescriptionsItem>
          <DescriptionsItem
            :label="$t('packagingMaterialDrawer.infoInstructionQty')"
          >
            {{ baseInfo.workSheetPlanNumber }}
          </DescriptionsItem>
          <DescriptionsItem
            :label="$t('packagingMaterialDrawer.infoSubLineCode')"
          >
            {{ baseInfo.subLineCode }}
          </DescriptionsItem>
          <DescriptionsItem
            :label="$t('packagingMaterialDrawer.infoSubLineName')"
          >
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
                    <div class="flex gap-2">
                      <Input
                        v-model:value="drawerQuery.deviceCode"
                        :placeholder="
                          $t('packagingMaterialDrawer.deviceCodePlaceholder')
                        "
                        disabled
                        allow-clear
                      />
                      <Button @click="handleOpenEquipmentSelect">
                        {{ $t('packagingMaterialDrawer.select') }}
                      </Button>
                    </div>
                  </Form.Item>
                </Col>
                <Col :xs="12" :sm="12">
                  <Form.Item :label="$t('packagingMaterialDrawer.tagId')">
                    <Input
                      v-model:value="drawerQuery.tagId"
                      :placeholder="
                        $t('packagingMaterialDrawer.tagIdPlaceholder')
                      "
                      allow-clear
                      @press-enter="handleScan"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <LoadGrid>
              <template #toolbar-tools></template>
              <!-- 加载数量：特殊条目可编辑，普通条目只读展示 -->
              <template #load_actualWt="{ row }">
                <InputNumber
                  v-if="isSpecialMaterial(row)"
                  v-model:value="row.actualWt"
                  :min="0"
                  :precision="2"
                  class="w-24"
                />
                <span v-else>{{ row.actualWt }}</span>
              </template>
              <!-- 单位：特殊条目可编辑，普通条目只读展示 -->
              <template #load_unit="{ row }">
                <Input
                  v-if="isSpecialMaterial(row)"
                  v-model:value="row.unit"
                  class="w-16"
                />
                <span v-else>{{ row.unit }}</span>
              </template>
            </LoadGrid>
          </div>
        </Col>
      </Row>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button @click="handleUnload">
          {{ $t('packagingMaterialDrawer.unload') }}
        </Button>
        <Button type="primary" @click="handleLoad">
          {{ $t('packagingMaterialDrawer.materialLoad') }}
        </Button>
        <Button @click="handleClose">
          {{ $t('packagingMaterialDrawer.close') }}
        </Button>
      </div>
    </template>
  </Drawer>

  <!-- 卸载抽屉：展示单选行信息与换算比 -->
  <Drawer
    v-model:open="unloadShow"
    :destroy-on-close="true"
    :title="$t('packagingMaterialDrawer.unload')"
    width="750"
    @close="handleUnloadClose"
    :footer-style="{ textAlign: 'right' }"
  >
    <Descriptions :column="2" bordered size="small">
      <!-- 第一行：材料LOTID + 换算比 -->
      <DescriptionsItem :label="$t('packagingMaterialDrawer.lotId')">
        {{ unloadRow?.scanLabel }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('packagingMaterialDrawer.convertRatio')">
        <div class="flex items-center gap-2">
          <InputNumber
            v-model:value="unloadForm.ratioM"
            :min="0"
            class="w-20"
            addon-after="M"
          />
          <Icon icon="mdi:arrow-right" class="text-base" />
          <InputNumber
            v-model:value="unloadForm.ratioEA"
            :min="0"
            class="w-20"
            addon-after="EA"
          />
        </div>
      </DescriptionsItem>

      <!-- 第二行：材料代码 占两格 -->
      <DescriptionsItem
        :label="$t('packagingMaterialDrawer.colMaterialCode')"
        :span="2"
      >
        {{ unloadRow?.materialCode }}__{{ unloadRow?.materialName }}
      </DescriptionsItem>

      <!-- 第三行：换算前加载数量 占两格，数值按换算比计算 -->
      <DescriptionsItem
        :label="$t('packagingMaterialDrawer.preConvertQty')"
        :span="2"
      >
        <div class="flex items-center gap-2">
          <InputNumber
            v-model:value="preConvertMaxM"
            disabled
            class="w-28"
            addon-after="M"
          />
          <Icon icon="mdi:arrow-right" class="text-base" />
          <InputNumber
            v-model:value="preConvertCurM"
            disabled
            class="w-28"
            addon-after="M"
          />
        </div>
      </DescriptionsItem>

      <!-- 第四行：加载数量 占两格，最大值为 actualWtCopy，当前为 actualWt -->
      <DescriptionsItem
        :label="$t('packagingMaterialDrawer.colLoadQty')"
        :span="2"
      >
        <div class="flex items-center gap-2">
          <InputNumber
            :value="unloadRow?.actualWtCopy"
            disabled
            class="w-28"
            addon-after="EA"
          />
          <Icon icon="mdi:arrow-right" class="text-base" />
          <InputNumber
            v-model:value="unloadForm.currentWt"
            class="w-28"
            addon-after="EA"
          />
        </div>
      </DescriptionsItem>
    </Descriptions>

    <template #footer>
      <Space>
        <Button @click="handleUnloadClose">
          {{ $t('packagingMaterialDrawer.cancel') }}
        </Button>
        <Button type="primary" @click="handleUnloadConfirm">
          {{ $t('packagingMaterialDrawer.confirmUnload') }}
        </Button>
      </Space>
    </template>
  </Drawer>

  <!-- 设备选择抽屉 -->
  <EquipmentSelectDrawer
    ref="equipmentDrawerRef"
    @select="handleEquipmentSelect"
  />
</template>
