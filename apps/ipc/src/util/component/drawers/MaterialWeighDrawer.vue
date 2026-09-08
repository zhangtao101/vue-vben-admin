<script setup lang="ts">
import type { PropType } from 'vue';

import { computed, nextTick, ref } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Col,
  Drawer,
  Input,
  InputNumber,
  message,
  Radio,
  Row,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { addWeightRecord, selectMaterialWeight } from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'MaterialWeighDrawer',
});

const props = defineProps({
  /** 当前选中的工单（称重记录所属工单） */
  workSheet: { type: Object as PropType<any>, default: null },
});

/** 保存成功事件：通知父组件刷新称重记录列表 */
const emit = defineEmits<{
  success: [];
}>();

// region 抽屉状态与称重数据
/** 抽屉显隐 */
const show = ref(false);
/** 保存中标记 */
const submitting = ref(false);
/** 标签输入框实例 */
const labelIdRef = ref();
/** 扫码标签 */
const labelId = ref('');
/** 扫码标签解析出的材料编码（标签格式：材料编码|...） */
const scannedMaterialCode = ref('');
/** 当前匹配的材料 */
const currentMaterial = ref<any>(null);
/** 实际称重重量 */
const actualWt = ref<number>(0);
/** 称重方式（1 纸袋 2 散装） */
const packType = ref<number>(1);
/** 材料列表的包装类型过滤条件（undefined 表示查询全部，切换称重方式后更新） */
const queryPackType = ref<number | undefined>(undefined);
/** 个数（加减重量按钮的累加次数） */
const count = ref<number>(0);
// endregion

// region 实时称重显示
/** 计算进度条基准（上限/下限/标准/当前重量的最大值，留出余量） */
const displayMax = computed(() => {
  const upper = Number(currentMaterial.value?.upperProductWt) || 0;
  const lower = Number(currentMaterial.value?.lowerProductWt) || 0;
  const standard = Number(currentMaterial.value?.productWt) || 0;
  const maxVal = Math.max(upper, lower, standard, actualWt.value) * 1.2;
  return maxVal > 0 ? maxVal : 1;
});

/** 当前重量填充百分比 */
const fillPercent = computed(() => {
  const w = Number(actualWt.value) || 0;
  return Math.min(100, (w / displayMax.value) * 100);
});

/** 下限刻度百分比 */
const lowerPercent = computed(() => {
  const lower = Number(currentMaterial.value?.lowerProductWt) || 0;
  return Math.min(100, (lower / displayMax.value) * 100);
});

/** 上限刻度百分比 */
const upperPercent = computed(() => {
  const upper = Number(currentMaterial.value?.upperProductWt) || 0;
  return Math.min(100, (upper / displayMax.value) * 100);
});

/** 标准重量刻度百分比 */
const standardPercent = computed(() => {
  const standard = Number(currentMaterial.value?.productWt) || 0;
  return Math.min(100, (standard / displayMax.value) * 100);
});

/** 实时重量是否在上下限范围内 */
const inRange = computed(() => {
  const w = Number(actualWt.value) || 0;
  const upper = currentMaterial.value?.upperProductWt;
  const lower = currentMaterial.value?.lowerProductWt;
  const hasUpper = upper !== null && upper !== undefined && upper !== '';
  const hasLower = lower !== null && lower !== undefined && lower !== '';
  if (!hasUpper && !hasLower) return true;
  if (hasLower && w < Number(lower)) return false;
  if (hasUpper && w > Number(upper)) return false;
  return true;
});
// endregion

// region 抽屉内材料列表
/** 按当前工单查询材料列表（抽屉内部自行查询，不依赖外部传入查询方法） */
function queryMaterialList(): Promise<{ items: any[] }> {
  const ws = props.workSheet;
  if (!ws) return Promise.resolve({ items: [] });
  return selectMaterialWeight({
    workSheetId: ws.workWeekId,
    batch: ws.batch,
    lotId: ws.id,
    packType: queryPackType.value || 1,
  })
    .then((res) => ({ items: Array.isArray(res) ? res : [] }))
    .catch(() => {
      message.error($t('mixerMaterialWeigh.loadFailed'));
      return { items: [] };
    });
}

/** 抽屉内材料列表：与扫码标签匹配的行显示为黄色，已称重（称重重量有值）的行显示为绿色 */
const drawerGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      field: 'materialName',
      title: $t('mixerMaterialWeigh.materialName'),
      minWidth: 120,
    },
    {
      field: 'materialCode',
      title: $t('mixerMaterialWeigh.materialCode'),
      minWidth: 110,
    },
    {
      field: 'productWt',
      title: $t('mixerMaterialWeigh.weight'),
      minWidth: 100,
    },
    {
      field: 'upperProductWt',
      title: $t('mixerMaterialWeigh.upperProductWt'),
      minWidth: 100,
    },
    {
      field: 'lowerProductWt',
      title: $t('mixerMaterialWeigh.lowerProductWt'),
      minWidth: 100,
    },
    { field: 'unit', title: $t('mixerMaterialWeigh.unit'), minWidth: 80 },
    {
      field: 'actualWt',
      title: $t('mixerMaterialWeigh.actualWt'),
      minWidth: 100,
    },
  ],
  height: 450,
  stripe: false,
  // 与扫码标签材料编码匹配的行显示为黄色，已称重（称重重量有值）的行显示为绿色
  rowClassName: ({ row }: any) => {
    if (row.materialCode === scannedMaterialCode.value) return 'bg-yellow-500';
    return row.actualWt ? 'bg-green-500/15' : '';
  },
  // 材料列表仅展示查询结果，不需要分页与手动查询
  pagerConfig: { enabled: false },
  proxyConfig: {
    ajax: {
      query: queryMaterialList,
    },
  },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions: drawerGridOptions });
// endregion

/** 重置称重相关状态，回到初始状态 */
function resetWeighState() {
  labelId.value = '';
  scannedMaterialCode.value = '';
  currentMaterial.value = null;
  actualWt.value = 0;
  count.value = 0;
  packType.value = 1;
  queryPackType.value = undefined;
}

/** 切换称重方式后按新的包装类型重新查询材料列表 */
function handlePackTypeChange() {
  queryPackType.value = packType.value;
  // 包装类型变化后原扫码匹配的材料已不适用于当前列表，清空并需重新扫码
  currentMaterial.value = null;
  actualWt.value = 0;
  count.value = 0;
  gridApi.reload();
}

/** 打开抽屉：重置状态、加载材料列表并聚焦标签输入框 */
function open() {
  resetWeighState();
  show.value = true;
  nextTick(() => {
    // 通过 proxy 重新查询材料列表
    gridApi.reload();
    labelIdRef.value?.focus();
  });
}

/** 清空称重重量：将抽屉内材料列表的称重重量（actualWt）一栏全部清空 */
function handleClearWeighWeight() {
  const rows = gridApi.grid?.getTableData?.().fullData || [];
  rows.forEach((row: any) => {
    row.actualWt = undefined;
  });
  // 刷新表格显示（不触发重新查询，避免接口数据覆盖已清空的值）
}

/** 扫码/输入标签后：解析材料编码并匹配表格行，匹配的行显示为黄色并回填材料信息（不改变称重方式） */
function handleLabelInput() {
  const code = labelId.value.split('|')[0]?.trim() || '';
  // 从抽屉表格当前数据中按材料编码匹配（数据已通过接口加载）
  const rows = gridApi.grid?.getTableData?.().fullData || [];
  const matched = code
    ? rows.find((m: any) => m.materialCode === code)
    : undefined;
  if (matched) {
    // 该物料已存在称重重量（行 actualWt 有值），视为已添加过，不允许重复添加
    const existedWt = matched.actualWt;
    const hasExisted =
      existedWt !== null &&
      existedWt !== undefined &&
      existedWt !== '' &&
      Number(existedWt) > 0;
    if (hasExisted) {
      message.warning($t('mixerMaterialWeigh.duplicateMaterial'));
      labelId.value = '';
      return;
    }

    scannedMaterialCode.value = code;
    currentMaterial.value = matched;
    actualWt.value = 0;
    count.value = 0;
  } else {
    currentMaterial.value = null;
  }
  // 重新渲染表格以更新黄色高亮
  gridApi.grid?.commitProxy?.('query');
}

/** 抽屉重置：清空基本信息与实时称重信息，取消扫码高亮，回到初始状态 */
function handleDrawerReset() {
  resetWeighState();
  // 通过 proxy 重新查询数据以清除高亮状态
  gridApi.grid?.commitProxy?.('query');
}

/** 关闭抽屉：清空所有状态，回到初始状态 */
function handleClose() {
  show.value = false;
  submitting.value = false;
  resetWeighState();
}

/** 增加一个单位重量：个数 +1，称重重量 = 个数 × 单包重量 */
function handleAddUnit() {
  const unitWt = Number(currentMaterial.value?.materialWt) || 0;
  count.value += 1;
  actualWt.value = count.value * unitWt;
}

/** 减少一个单位重量：个数 -1，称重重量 = 个数 × 单包重量 */
function handleMinusUnit() {
  if (count.value <= 0) return;
  count.value -= 1;
  const unitWt = Number(currentMaterial.value?.materialWt) || 0;
  actualWt.value = count.value * unitWt;
}

/** 保存称重记录 */
function handleSubmit() {
  const ws = props.workSheet;
  const mat = currentMaterial.value;
  if (!ws) {
    message.warning($t('mixerMaterialWeigh.plsSelectWorkSheet'));
    return;
  }
  if (!labelId.value || !mat) {
    message.warning($t('mixerMaterialWeigh.plsInputLabel'));
    return;
  }
  // 范围校验：实时重量必须处于材料上下限之间，否则按超界方向给出对应提示
  const weight = Number(actualWt.value) || 0;
  const { upperProductWt: upper, lowerProductWt: lower } = mat;
  const hasLower = lower !== null && lower !== undefined && lower !== '';
  const hasUpper = upper !== null && upper !== undefined && upper !== '';
  if (hasLower && weight < Number(lower)) {
    message.warning($t('mixerMaterialWeigh.belowLowerLimit', { lower }));
    return;
  }
  if (hasUpper && weight > Number(upper)) {
    message.warning($t('mixerMaterialWeigh.aboveUpperLimit', { upper }));
    return;
  }
  submitting.value = true;
  addWeightRecord({
    actualWt: Number(actualWt.value) || 0,
    lotCode: ws.lotCode,
    lotId: ws.id,
    materialCode: mat.materialCode,
    materialName: mat.materialName,
    packType: packType.value,
    scanLabel: labelId.value,
    unit: mat.unit,
  })
    .then(() => {
      message.success($t('mixerMaterialWeigh.saveSuccess'));
      handleDrawerReset();
      // 通知父组件刷新称重记录列表
      emit('success');
    })
    .catch(() => {
      message.error($t('mixerMaterialWeigh.saveFailed'));
    })
    .finally(() => {
      submitting.value = false;
    });
}

defineExpose({ open });
</script>

<template>
  <Drawer
    v-model:open="show"
    :title="$t('mixerMaterialWeigh.weigh')"
    placement="top"
    height="100%"
    :closable="false"
    :mask-closable="false"
    :footer-style="{ textAlign: 'right' }"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4">
      <!-- 1. 基本信息 -->
      <div>
        <div class="mb-1 text-sm font-medium">
          {{ $t('mixerMaterialWeigh.labelId') }}
        </div>
        <Input
          ref="labelIdRef"
          v-model:value="labelId"
          :placeholder="$t('mixerMaterialWeigh.labelIdPlaceholder')"
          allow-clear
          @press-enter="handleLabelInput"
        />
        <Row :gutter="16" class="mt-3">
          <Col :xs="24" :md="18">
            <div class="mb-1 text-sm font-medium">
              {{ $t('mixerMaterialWeigh.materialCode') }}
            </div>
            <Space wrap align="center">
              <Input
                :value="currentMaterial?.materialCode || ''"
                class="!w-48"
                disabled
              />
              <span class="text-sm">
                {{ $t('mixerMaterialWeigh.materialName') }}：{{
                  currentMaterial?.materialName || '-'
                }}
              </span>
              <span
                class="rounded bg-primary px-2 py-1 text-base font-bold text-primary-foreground"
              >
                {{ $t('mixerMaterialWeigh.standardWeight') }}：{{
                  currentMaterial?.productWt
                }}
                {{ currentMaterial?.unit }}
              </span>
            </Space>
          </Col>
          <Col :xs="24" :md="6">
            <div class="mb-1 text-sm font-medium">
              {{ $t('mixerMaterialWeigh.actualWt') }}
            </div>
            <InputNumber
              v-model:value="actualWt"
              :min="0"
              :precision="1"
              style="width: 180px"
              :disabled="packType === 1"
            />
          </Col>
        </Row>
      </div>

      <!-- 2. 实时称重信息：进度条全宽，称重方式与单包重量/个数/加减按钮左右两栏 -->
      <div>
        <div class="mb-1 text-sm font-medium">
          {{ $t('mixerMaterialWeigh.realWeight') }}
        </div>
        <div class="relative h-10 w-full overflow-hidden rounded bg-muted">
          <div
            class="absolute left-0 top-0 h-full transition-all"
            :class="inRange ? 'bg-success' : 'bg-destructive'"
            :style="{ width: `${fillPercent}%` }"
          ></div>
          <div
            class="absolute top-0 h-full w-0.5 bg-foreground"
            :style="{ left: `${lowerPercent}%` }"
          ></div>
          <div
            class="absolute top-0 h-full w-0.5 bg-foreground"
            :style="{ left: `${upperPercent}%` }"
          ></div>
          <!-- 标准重量刻度线：蓝色竖线，与上下限刻度线同种表现方式 -->
          <div
            class="absolute top-0 h-full w-0.5 bg-blue-500"
            :style="{ left: `${standardPercent}%` }"
          ></div>
          <div
            class="absolute inset-0 flex items-center justify-center text-sm font-bold"
          >
            {{ actualWt }} {{ currentMaterial?.unit }}
          </div>
        </div>
        <div
          class="mt-1 flex items-center justify-between text-xs text-muted-foreground"
        >
          <span>
            {{ $t('mixerMaterialWeigh.lowerProductWt') }}：
            {{ currentMaterial?.lowerProductWt }}
          </span>
          <span class="inline-flex items-center gap-1">
            <span class="inline-block h-3 w-0.5 bg-blue-500"></span>
            {{ $t('mixerMaterialWeigh.standardWeight') }}：{{
              currentMaterial?.productWt ?? '-'
            }}
          </span>
          <span>
            {{ $t('mixerMaterialWeigh.upperProductWt') }}：
            {{ currentMaterial?.upperProductWt }}
          </span>
        </div>

        <!-- 称重方式 与 单包重量/个数/加减按钮 同一行左右两栏 -->
        <Row :gutter="16" class="mt-3">
          <Col :xs="24" :lg="12">
            <div class="mb-1 text-sm font-medium">
              {{ $t('mixerMaterialWeigh.packType') }}
            </div>
            <Radio.Group
              v-model:value="packType"
              @change="handlePackTypeChange"
            >
              <Radio :value="1">
                {{ $t('mixerMaterialWeigh.paperBag') }}
              </Radio>
              <Radio :value="2">{{ $t('mixerMaterialWeigh.loose') }}</Radio>
            </Radio.Group>
          </Col>
          <Col v-if="packType === 1" :xs="24" :lg="12">
            <div class="flex flex-wrap items-end gap-x-6 gap-y-2">
              <div>
                <div class="mb-1 text-sm text-muted-foreground">
                  {{ $t('mixerMaterialWeigh.unitWeight') }}
                </div>
                <div class="text-2xl font-bold text-primary">
                  {{ currentMaterial?.materialWt ?? '-' }}
                  {{ currentMaterial?.munit ?? '' }}
                </div>
              </div>
              <div>
                <div class="mb-1 text-sm text-muted-foreground">
                  {{ $t('mixerMaterialWeigh.count') }}
                </div>
                <div class="text-2xl font-bold">{{ count }}EA</div>
              </div>
              <div class="flex flex-wrap gap-2">
                <Button :disabled="!currentMaterial" @click="handleAddUnit">
                  +{{ currentMaterial?.materialWt }}
                  {{ currentMaterial?.munit }}
                </Button>
                <Button
                  :disabled="!currentMaterial || count <= 0"
                  @click="handleMinusUnit"
                >
                  -{{ currentMaterial?.materialWt }}
                  {{ currentMaterial?.munit }}
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <!-- 3. 材料列表（左 2：右 1）：左侧材料列表，右侧大图标操作按钮 -->
      <Row :gutter="16">
        <Col :xs="24" :lg="16">
          <div class="mb-1 text-sm font-medium">
            {{ $t('mixerMaterialWeigh.materialList') }}
          </div>
          <Grid>
            <template #toolbar-tools>
              <Button type="primary" @click="handleClearWeighWeight">
                {{ $t('mixerMaterialWeigh.clearWeighWeight') }}
              </Button>
            </template>
          </Grid>
        </Col>
        <Col :xs="24" :lg="8">
          <!-- 大图标操作按钮 -->
          <div
            class="flex h-full flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-3xl bg-muted/60 px-4 py-3"
          >
            <div class="flex flex-col items-center gap-2">
              <Button
                shape="circle"
                class="!h-28 !w-28 !border-0 !bg-amber-500 !text-white shadow-lg transition-all hover:-translate-y-0.5 hover:!bg-amber-400 hover:shadow-xl"
                @click="handleDrawerReset"
              >
                <Icon
                  icon="mdi:restart"
                  class="inline-block align-middle text-5xl"
                />
              </Button>
              <span
                class="text-base font-semibold leading-none text-foreground/80"
              >
                {{ $t('common.reset') }}
              </span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Button
                shape="circle"
                type="primary"
                class="!h-28 !w-28 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                :loading="submitting"
                @click="handleSubmit"
              >
                <Icon
                  icon="mdi:check"
                  class="inline-block align-middle text-5xl"
                />
              </Button>
              <span
                class="text-base font-semibold leading-none text-foreground/80"
              >
                {{ $t('common.save') }}
              </span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Button
                shape="circle"
                class="!h-28 !w-28 !border-0 !bg-red-600 !text-white shadow-lg transition-all hover:-translate-y-0.5 hover:!bg-red-500 hover:shadow-xl"
                @click="handleClose"
              >
                <Icon
                  icon="mdi:times"
                  class="inline-block align-middle text-5xl"
                />
              </Button>
              <span
                class="text-base font-semibold leading-none text-foreground/80"
              >
                {{ $t('common.close') }}
              </span>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  </Drawer>
</template>

<style scoped></style>
