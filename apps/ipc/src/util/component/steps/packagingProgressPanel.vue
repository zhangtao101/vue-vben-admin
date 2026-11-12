<script setup lang="ts">
/**
 * [INPUT]: 依赖 vxe-table 适配器（VxeGridProps/useVbenVxeGrid）、#/api 的 searchWeightRecordList 接口、
 *          #/locales 国际化、ant-design-vue 组件、@iconify/vue (Icon)
 * [OUTPUT]: 对外提供 PackagingProgressPanel 包装工序面板子组件（工单信息表单、指标数、称重记录列表、
 *           喷码传输/材料加载/图像/开始/结束按钮），通过 defineExpose({ reload }) 暴露称重列表重载
 * [POS]: 属于 packagingProgress 包装工序步骤的子组件，左右两栏结构相同、仅数据不同；
 *        父组件持有面板数据与业务动作，本组件只负责展示与事件透出；
 *        panel 为父组件共享的响应式状态，本组件内直接读写其字段
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-11-09 00:00:00
 */
import type { PropType } from 'vue';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  CheckboxGroup,
  Col,
  Form,
  FormItem,
  Input,
  Row,
  Select,
  Textarea,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { searchWeightRecordList } from '#/api';
import { $t } from '#/locales';

const props = defineProps({
  /** 面板响应式状态（父组件 createPanel 创建，含 form/metrics/packTypes），与父组件共享 */
  panel: { type: Object as PropType<any>, required: true },
  /** 工单下拉选项（按本栏绑定的子产线查询） */
  workOrderOptions: {
    type: Array as PropType<{ label: string; state?: any; value: number }[]>,
    default: () => [],
  },
  /** 子产线下拉选项（左右两栏共用） */
  subLineOptions: {
    type: Array as PropType<{ label: string; value: string }[]>,
    default: () => [],
  },
  /** 包装类型多选选项（左右两栏共用） */
  packTypeOptions: {
    type: Array as PropType<{ label: string; value: number }[]>,
    default: () => [],
  },
  /** 开始作业请求中标记 */
  workStartLoading: { type: Boolean, default: false },
  /** 结束作业请求中标记 */
  workEndLoading: { type: Boolean, default: false },
  /** 是否拥有开始作业按钮权限 */
  canWorkStart: { type: Boolean, default: false },
  /** 是否拥有结束作业按钮权限 */
  canWorkEnd: { type: Boolean, default: false },
  /** 子产线下拉是否可切换（仅左栏开放选择，右栏只读回显） */
  subLineSelectable: { type: Boolean, default: false },
  /** 工单下拉是否可选择（右栏禁止自选，仅由左栏带出） */
  workOrderSelectable: { type: Boolean, default: true },
});

const emit = defineEmits([
  /** 工单选择变化，参数为选中的工单 id（清空时为 undefined） */
  'workOrderChange',
  /** 子产线切换（仅 subLineSelectable 时触发），参数为选中的子产线编码 */
  'subLineChange',
  /** 点击喷码传输按钮 */
  'transfer',
  /** 点击材料加载按钮 */
  'materialLoad',
  /** 点击图像按钮 */
  'sopImage',
  /** 点击开始作业按钮 */
  'workStart',
  /** 点击结束作业按钮 */
  'workEnd',
]);

/** 面板状态本地别名（同一响应式对象，避免模板直接书写 props 名） */
const panelState = computed(() => props.panel);

// 工单状态指示灯：state 为 2 时绿色，其余（含未选中/未开始）灰色
const WORK_ORDER_RUNNING_STATE = '2';

/**
 * 取面板工单的状态指示灯颜色类：state 为 2 显示绿色实心圆，否则灰色。
 * @returns {string} 圆点背景色类名（bg-green-500 / bg-gray-400）
 * @throws 不主动抛出异常。
 * @since 2026-11-09 00:00:00
 */
function getStateDotClass() {
  return String(props.panel?.form?.state) === WORK_ORDER_RUNNING_STATE
    ? 'bg-green-500'
    : 'bg-gray-400';
}

/**
 * 取工单指示灯颜色类：workState 为 2 显示绿色实心圆，否则灰色。
 * @returns {string} 圆点背景色类名（bg-green-500 / bg-gray-400）
 * @throws 不主动抛出异常。
 * @since 2026-11-09 00:00:00
 */
function getWorkStateDotClass() {
  return String(props.panel?.form?.workState) === WORK_ORDER_RUNNING_STATE
    ? 'bg-green-500'
    : 'bg-gray-400';
}

/**
 * 面板是否已选中工单：底部操作按钮需先选择工单才可点击。
 * @returns {boolean} 已选中工单返回 true，否则 false
 * @throws 不主动抛出异常。
 * @since 2026-11-09 00:00:00
 */
function isPanelReady() {
  return !!(props.panel?.form?.workOrder || props.panel?.form?.id);
}

// 指标卡片配置：key 与 panel.metrics 字段一一对应
const metricItems = [
  { key: 'instructionQty', title: $t('packagingProgress.instructionQty') },
  { key: 'productionQty', title: $t('packagingProgress.productionQty') },
  { key: 'stackQty', title: $t('packagingProgress.stackQty') },
  {
    key: 'subLineProductionQty',
    title: $t('packagingProgress.subLineProductionQty'),
  },
];

/** 喷码字段：第一个/第二个/第三个喷码 */
const inkjetItems = ['inkjetCodeA', 'inkjetCodeB', 'inkjetCodeC'];

// region 称重记录列表
/**
 * 包装类型筛选变化后重新加载称重记录列表（面板未选工单时不处理）。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-11-09 00:00:00
 */
function handlePackTypeChange() {
  if (!props.panel.form.id) {
    return;
  }
  gridApi.reload();
}

// 称重记录网格配置：按面板的 form.id / equipCode / packTypes 查询
const gridOptions: VxeGridProps<any> = {
  rowClassName: 'ipc-grid-row',
  headerRowClassName: 'ipc-grid-header-row',
  align: 'center',
  border: true,
  columns: [
    {
      field: 'materialName',
      title: $t('packagingProgress.colMaterialName'),
      minWidth: 160,
    },
    {
      field: 'actualWt',
      title: $t('packagingProgress.colLoadQty'),
      minWidth: 120,
    },
    { field: 'unit', title: $t('packagingProgress.colUnit'), minWidth: 90 },
    {
      field: 'palletLabel',
      title: $t('packagingProgress.colEquipmentName'),
      minWidth: 160,
    },
  ],
  height: 260,
  stripe: true,
  toolbarConfig: { custom: false, refresh: false, zoom: false },
  proxyConfig: {
    ajax: {
      query: () => {
        if (!panelState.value.form.id) {
          return Promise.resolve({ items: [], total: 0 });
        }
        const params: any = {
          workSheetId: panelState.value.form.id,
          equipCode: panelState.value.form.equipCode,
        };
        // 包装类型筛选：多选值转逗号分隔字符串（如 "3,4,5"），未选时不过滤
        const type = (panelState.value.packTypes ?? []).join(',');
        if (type) {
          params.type = type;
        }
        return searchWeightRecordList(params).then((res: any) => {
          const list = res?.list ?? res ?? [];
          return { items: list, total: list.length };
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/**
 * 重载本面板的称重记录列表（父组件通过 ref 调用）。
 * @returns {void} 无返回值。
 * @throws 不主动抛出异常。
 * @since 2026-11-09 00:00:00
 */
function reload() {
  gridApi.reload();
}
defineExpose({ reload });
// endregion
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 1. 工单信息表单 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <Form
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 20 }"
        :model="panelState.form"
      >
        <FormItem :label="$t('packagingProgress.subLine')" class="mb-2!">
          <div class="flex items-center gap-2">
            <Select
              v-model:value="panelState.form.subLine"
              :options="subLineOptions"
              :placeholder="$t('packagingProgress.subLinePlaceholder')"
              class="flex-1"
              :disabled="!subLineSelectable"
              @change="(val: any) => emit('subLineChange', val)"
            />
            <!-- 工单状态指示灯：state === 2 绿色，其余灰色 -->
            <span
              class="size-3 shrink-0 rounded-full"
              :class="getStateDotClass()"
            ></span>
          </div>
        </FormItem>
        <FormItem :label="$t('packagingProgress.workOrder')" class="mb-2!">
          <div class="flex items-center gap-2">
            <Select
              v-model:value="panelState.form.id"
              :options="workOrderOptions"
              :placeholder="$t('packagingProgress.workOrderPlaceholder')"
              allow-clear
              class="flex-1"
              :disabled="!workOrderSelectable"
              @change="(val: any) => emit('workOrderChange', val)"
            />
            <!-- 喷码传输：弹窗选择子产线/区域代码/是否初始化后提交 -->
            <Tooltip :title="$t('packagingProgress.inkjetTransfer')">
              <Button
                type="primary"
                shape="circle"
                class="shrink-0"
                @click="emit('transfer')"
              >
                <Icon
                  icon="mdi:transfer-right"
                  class="inline-block align-middle ipc-fs-lg"
                />
              </Button>
            </Tooltip>
            <!-- 工单状态指示灯：workState === 2 绿色，其余灰色 -->
            <span
              class="size-3 shrink-0 rounded-full"
              :class="getWorkStateDotClass()"
            ></span>
          </div>
        </FormItem>
        <FormItem :label="$t('packagingProgress.product')" class="mb-2!">
          <Input v-model:value="panelState.form.product" disabled />
        </FormItem>
        <FormItem :label="$t('packagingProgress.line')" class="mb-2!">
          <Input v-model:value="panelState.form.line" disabled />
        </FormItem>
        <FormItem
          :label="$t('packagingProgress.workOrderRemark')"
          class="mb-2!"
        >
          <Textarea
            v-model:value="panelState.form.remark"
            allow-clear
            disabled
          />
        </FormItem>
        <FormItem :label="$t('packagingProgress.printCode')" class="mb-2!">
          <Row :gutter="16">
            <Col
              v-for="key in inkjetItems"
              :key="key"
              :xs="8"
              :md="8"
              class="mb-3"
            >
              <div
                class="flex h-20 w-full items-center justify-center overflow-y-auto rounded-md border border-border bg-muted/40 px-2 py-4"
              >
                <div
                  class="w-full whitespace-pre-line text-center ipc-fs-sm text-foreground"
                >
                  {{ panelState.form[key] || '-' }}
                </div>
              </div>
            </Col>
          </Row>
        </FormItem>
      </Form>
    </div>

    <!-- 2. 指标数：标题在上、数字在下 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <Row :gutter="16">
        <Col
          v-for="item in metricItems"
          :key="item.key"
          :xs="12"
          :sm="12"
          :md="6"
          class="mb-3"
        >
          <div
            class="flex h-full flex-col items-center justify-center rounded-md border border-border bg-muted/40 py-4"
          >
            <div class="ipc-fs-sm text-muted-foreground">
              {{ item.title }}
            </div>
            <div class="mt-1 ipc-fs-2xl font-bold text-primary">
              {{ panelState.metrics[item.key] || 0 }}
            </div>
          </div>
        </Col>
      </Row>
    </div>

    <!-- 3. 加载材料列表 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <Grid>
        <template #toolbar-tools>
          <CheckboxGroup
            v-model:value="panelState.packTypes"
            :options="packTypeOptions"
            @change="handlePackTypeChange"
          />
        </template>
      </Grid>
    </div>

    <!-- 4. 右对齐按钮 -->
    <div class="flex justify-end gap-2">
      <Button :disabled="!isPanelReady()" @click="emit('materialLoad')">
        {{ $t('packagingProgress.materialLoad') }}
      </Button>
      <Button :disabled="!isPanelReady()" @click="emit('sopImage')">
        {{ $t('packagingProgress.image') }}
      </Button>
      <Button
        v-if="canWorkStart"
        type="primary"
        :disabled="!isPanelReady()"
        :loading="workStartLoading"
        @click="emit('workStart')"
      >
        {{ $t('packagingProgress.workStart') }}
      </Button>
      <Button
        v-if="canWorkEnd"
        type="primary"
        danger
        :disabled="!isPanelReady()"
        :loading="workEndLoading"
        @click="emit('workEnd')"
      >
        {{ $t('packagingProgress.workEnd') }}
      </Button>
    </div>
  </div>
</template>
