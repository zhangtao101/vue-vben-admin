<script lang="ts" setup>
/**
 * [INPUT]: 依赖 #/api 的 getProductDefectList 获取缺陷列表、getDefectLocationList 获取不良位置、
 * saveDiscoveryDefect 保存不良记录，以及父组件传入的不良记录行与工单/工作站上下文
 * [OUTPUT]: 对外提供不良明细公共抽屉组件，展示不良记录主信息并可编辑保存其不良明细
 * [POS]: 工步执行公共抽屉，被 steps/selfinspection.vue 等工步组件引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-10-09 17:30:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, nextTick, ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Descriptions,
  DescriptionsItem,
  Drawer,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getDefectLocationList,
  getProductDefectList,
  saveDiscoveryDefect,
} from '#/api';

defineOptions({
  name: 'DefectDetailDrawer',
});

/**
 * 定义组件的 props，用于接收父组件传递的保存上下文
 */
const props = defineProps({
  // 工单编号，用于查询不良位置与保存时兜底，默认为空字符串
  worksheetCode: {
    type: String,
    default: '',
  },
  // 工作站编号，保存时兜底使用，默认为空字符串
  workstationCode: {
    type: String,
    default: '',
  },
  // 工序绑定ID，保存时兜底使用，默认为 0
  bindingId: {
    type: Number,
    default: 0,
  },
});

// 保存成功后通知父组件刷新列表
const emit = defineEmits<{
  refresh: [];
}>();

// region 状态
// 抽屉显示状态
const show = ref(false);
// 当前不良记录主信息
const recordInfo = ref<any>({});
// 不良品数量输入框的值，表格内明细数量不能大于该值
const defectNumberInput = ref<number | undefined>(undefined);
// 保存中状态
const submitting = ref(false);
// 保存成功后自动关闭抽屉的标识
const closeAfterSave = ref(false);
// endregion

// region 下拉数据
// 缺陷下拉选项
const defectOptions = ref<any[]>([]);
// 不良位置下拉选项
const locationOptions = ref<any[]>([]);

/**
 * 查询不良缺陷下拉选项
 * @returns {void} 无返回值，结果写入 defectOptions
 * @since 2026-10-09 17:30:00
 */
function queryDefectOptions() {
  getProductDefectList({ pageNum: 1, pageSize: 999 })
    .then((data: any) => {
      defectOptions.value = data?.results || [];
    })
    .catch(() => {
      defectOptions.value = [];
    });
}

/**
 * 查询不良位置下拉选项
 * @returns {void} 无返回值，结果写入 locationOptions
 * @since 2026-10-09 17:30:00
 */
function queryLocationOptions() {
  const worksheetCode = recordInfo.value?.worksheetCode || props.worksheetCode;
  if (!worksheetCode) {
    locationOptions.value = [];
    return;
  }
  getDefectLocationList({ worksheetCode, locationCode: '' })
    .then((data: any) => {
      locationOptions.value = data || [];
    })
    .catch(() => {
      locationOptions.value = [];
    });
}

/**
 * 缺陷下拉自定义搜索：支持按缺陷编号或缺陷名称模糊匹配
 * @param {string} input 输入的搜索关键字
 * @param {any} option 当前下拉选项
 * @returns {boolean} 匹配返回 true，否则返回 false
 * @since 2026-10-09 17:30:00
 */
function filterDefectOption(input: string, option: any) {
  const keyword = (input || '').toLowerCase();
  const code = `${option?.defectCode ?? ''}`.toLowerCase();
  const name = `${option?.defectName ?? ''}`.toLowerCase();
  return code.includes(keyword) || name.includes(keyword);
}

/**
 * 缺陷下拉展示选项，展示格式为 缺陷名称(缺陷编号)
 * @type {import('vue').ComputedRef<any[]>} 缺陷下拉选项
 * @since 2026-10-09 17:30:00
 */
const defectSelectOptions = computed<any[]>(() =>
  defectOptions.value.map((item: any) => ({
    ...item,
    label: `${item?.defectName ?? ''}(${item?.defectCode ?? ''})`,
    value: item?.defectCode,
  })),
);

/**
 * 不良位置下拉自定义搜索：支持按位置编码模糊匹配
 * @param {string} input 输入的搜索关键字
 * @param {any} option 当前下拉选项
 * @returns {boolean} 匹配返回 true，否则返回 false
 * @since 2026-10-09 17:30:00
 */
function filterLocationOption(input: string, option: any) {
  const keyword = (input || '').toLowerCase();
  const locationCode = `${option?.locationCode ?? ''}`.toLowerCase();
  const key = `${option?.key ?? ''}`.toLowerCase();
  return locationCode.includes(keyword) || key.includes(keyword);
}

/**
 * 根据缺陷编号获取缺陷名称
 * @param {any} defectCode 缺陷编号
 * @returns {string} 缺陷名称，未匹配到时返回空字符串
 * @since 2026-10-09 17:30:00
 */
function getDefectName(defectCode: any) {
  const target = defectOptions.value.find(
    (item: any) => item.defectCode === defectCode,
  );
  return target?.defectName || '';
}

/**
 * 缺陷选择变化：同步缺陷名称到当前行
 * @param {any} value 缺陷编号
 * @param {any} row 当前明细行
 * @returns {void} 无返回值，直接修改行的 defectName
 * @since 2026-10-09 17:30:00
 */
function defectChange(value: any, row: any) {
  row.defectName = getDefectName(value);
}
// endregion

// region 表格配置
/**
 * 表格配置选项，用于定义 VxeGrid 表格的各项属性
 */
const gridOptions: VxeGridProps<any> = {
  // 表格内容居中对齐
  align: 'center',
  // 显示表格边框
  border: true,
  // 表格列配置：缺陷、不良位置、不良数量、操作
  columns: [
    {
      // 列标题
      title: $t('productionOperation.seq'),
      // 列类型为序号列
      type: 'seq',
      // 列字段名
      field: 'seq',
      // 列宽度
      width: 50,
    },
    {
      field: 'defectCode',
      minWidth: 200,
      slots: { default: 'defectCode' },
      title: $t('productionOperation.defectCode'),
    },
    {
      field: 'locations',
      minWidth: 220,
      slots: { default: 'location' },
      title: $t('productionOperation.defectLocation'),
    },
    {
      field: 'defectNumber',
      slots: { default: 'defectNumber' },
      title: $t('productionOperation.defectNumber'),
      width: 160,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('common.operation'),
      width: 100,
    },
  ],
  // 不分页，明细随主记录一次性返回
  pagerConfig: {
    enabled: false,
  },
  // 表格高度
  height: 400,
  // 显示斑马纹
  stripe: true,
  // 工具栏配置
  toolbarConfig: {
    // 显示自定义按钮
    custom: true,
    // 显示刷新按钮
    refresh: false,
    // 显示缩放按钮
    zoom: true,
  },
};

/**
 * 初始化 VxeGrid 组件和 API
 * @type {[typeof Grid, any]} - 包含 Grid 组件和 gridApi 的数组
 */
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
// endregion

// region 操作
/**
 * 新增一条不良明细行
 * 在表格中插入一行空明细，缺陷、位置、数量由用户填写
 * @returns {void} 无返回值，向表格插入一条新行
 * @since 2026-10-09 17:30:00
 */
function handleAdd() {
  gridApi.grid.insert({
    defectCode: undefined,
    defectName: '',
    defectNumber: undefined,
    locations: [],
  });
}

/**
 * 删除一条不良明细
 * 确认后从表格中移除该行
 * @param {any} row 当前明细行
 * @returns {void} 无返回值，移除后提示操作成功
 * @since 2026-10-09 17:30:00
 */
function handleDelete(row: any) {
  Modal.confirm({
    cancelText: $t('common.cancel'),
    okText: $t('common.confirm'),
    okType: 'danger',
    onOk() {
      gridApi.grid.remove(row);
      message.success($t('common.successfulOperation'));
    },
    title: $t('productionOperation.confirmDeleteDefectDetail'),
  });
}

/**
 * 保存不良记录
 * 校验明细完整性与数量上限后，合并主记录参数提交保存
 * @returns {void} 无返回值，保存成功后通知父组件刷新并关闭抽屉
 * @since 2026-10-09 17:30:00
 */
function handleSave() {
  const tableData = gridApi.grid.getTableData().tableData as any[];
  if (tableData.length === 0) {
    message.warning($t('productionOperation.pleaseAddDefectDetail'));
    return;
  }
  const invalidRow = tableData.find(
    (item: any) =>
      !item.defectCode || !item.defectNumber || item.defectNumber <= 0,
  );
  if (invalidRow) {
    message.warning(
      invalidRow.defectCode
        ? $t('productionOperation.pleaseInputDefectNumber')
        : $t('productionOperation.pleaseSelectDefect'),
    );
    return;
  }
  // 明细不良数量不能大于不良品数量
  if (
    defectNumberInput.value !== undefined &&
    tableData.some(
      (item: any) => Number(item.defectNumber) > Number(defectNumberInput.value),
    )
  ) {
    message.warning(
      $t('productionOperation.detailNumberExceedTotal', {
        number: defectNumberInput.value,
      }),
    );
    return;
  }

  const clientCode =
    recordInfo.value?.interactionPointCode || props.workstationCode;
  submitting.value = true;
  const params: any = {
    bindingId: String(
      recordInfo.value?.interactionPointId ?? props.bindingId ?? '',
    ),
    clientCode,
    defectNumber: defectNumberInput.value ?? 0,
    detailList: tableData.map((item: any) => ({
      defectCode: item.defectCode,
      defectName: item.defectName || getDefectName(item.defectCode),
      defectNumber: item.defectNumber,
      interactionPointCode: clientCode,
      location: (item.locations || []).join(','),
    })),
    productCode: recordInfo.value?.productCode || '',
    productName: recordInfo.value?.productName || '',
    subProductCode: recordInfo.value?.subProductCode || '',
    subProductName: recordInfo.value?.subProductName || '',
    worksheetCode: recordInfo.value?.worksheetCode || props.worksheetCode,
  };
  // 已存在记录时携带记录ID
  if (recordInfo.value?.id) {
    params.id = recordInfo.value.id;
  }

  saveDiscoveryDefect(params)
    .then(() => {
      message.success($t('common.successfulOperation'));
      emit('refresh');
      if (closeAfterSave.value) {
        handleClose();
      } else {
        queryData();
      }
    })
    .finally(() => {
      submitting.value = false;
    });
}

/**
 * 关闭抽屉
 * 重置全部可变状态，避免再次打开时残留旧数据
 * @returns {void} 无返回值
 * @since 2026-10-09 17:30:00
 */
function handleClose() {
  show.value = false;
  recordInfo.value = {};
  defectNumberInput.value = undefined;
  submitting.value = false;
  closeAfterSave.value = false;
  gridApi.grid?.reloadData([]);
}
// endregion

// region 数据
/**
 * 格式化操作时间展示
 * @param {any} value 接口返回的时间值
 * @returns {string} 格式化为 YYYY-MM-DD HH:mm:ss，空值返回 '-'
 * @since 2026-10-09 18:00:00
 */
function formatTime(value: any) {
  if (!value) return '-';
  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : `${value}`;
}

/**
 * 加载当前记录的不良明细到表格
 * 明细行的不良位置由逗号字符串回显为多选数组
 * @returns {void} 无返回值，明细写入表格
 * @since 2026-10-09 17:30:00
 */
function queryData() {
  const details = (recordInfo.value?.detailList || []).map((item: any) => ({
    ...item,
    locations: item.location ? `${item.location}`.split(',') : [],
  }));
  // 抽屉内容在打开后才挂载，等待表格实例可用后再写入数据
  nextTick(() => {
    gridApi.grid?.reloadData(details);
  });
}

/**
 * 打开抽屉
 * @param {any} row 不良记录行数据，包含 detailList 明细
 * @param {boolean} closeOnSave 保存成功后是否自动关闭抽屉，默认 true
 * @returns {void} 无返回值
 * @since 2026-10-09 17:30:00
 */
async function open(row: any, closeOnSave = true) {
  recordInfo.value = row || {};
  closeAfterSave.value = closeOnSave;
  defectNumberInput.value =
    row?.defectNumber === undefined || row?.defectNumber === null
      ? undefined
      : Number(row.defectNumber);
  show.value = true;
  if (defectOptions.value.length === 0) {
    queryDefectOptions();
  }
  queryLocationOptions();
  queryData();
}

defineExpose({ open });
// endregion
</script>

<template>
  <Drawer
    v-model:open="show"
    :destroy-on-close="true"
    :footer-style="{ textAlign: 'right' }"
    :title="$t('productionOperation.defectDetail')"
    width="900"
    @close="handleClose"
  >
    <!-- 不良记录主信息：展示记录除 detailList 外的全部字段 -->
    <Descriptions :column="3" bordered class="mb-4" size="small">
      <DescriptionsItem :label="$t('productionOperation.recordId')">
        {{ recordInfo.id ?? '-' }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('productionOperation.workOrderCode')">
        {{ recordInfo.worksheetCode || '-' }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('productionOperation.discoveryProcessCode')">
        {{ recordInfo.discoveryProcessCode || '-' }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('productionOperation.productNumber')">
        {{ recordInfo.productCode || '-' }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('productionOperation.productName')">
        {{ recordInfo.productName || '-' }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('productionOperation.partNumber')">
        {{ recordInfo.subProductCode || '-' }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('productionOperation.partName')">
        {{ recordInfo.subProductName || '-' }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('productionOperation.totalDefectNumber')">
        {{ recordInfo.defectNumber ?? '-' }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('productionOperation.operateTime')">
        {{ formatTime(recordInfo.operateTime) }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('productionOperation.workstationCode')">
        {{ recordInfo.interactionPointCode || '-' }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('productionOperation.stationBindingId')">
        {{ recordInfo.interactionPointId ?? '-' }}
      </DescriptionsItem>
    </Descriptions>

    <!-- 不良明细：可编辑表格，数据为主记录的 detailList -->
     <div>
       <Grid>
          <template #toolbar-actions>
            <span class="mr-2">
              {{ $t('productionOperation.quantityOfDefectiveProducts') }}
            </span>
            <InputNumber
              v-model:value="defectNumberInput"
              :min="0"
              :placeholder="$t('productionOperation.pleaseInputDefectNumber')"
              style="width: 160px"
            />
          </template>
          <template #toolbar-tools>
            <Button type="primary" @click="handleAdd">
              {{ $t('common.add') }}
            </Button>
          </template>
          <!-- 缺陷下拉：单选，选中后同步缺陷名称 -->
          <template #defectCode="{ row }">
            <Select
              v-model:value="row.defectCode"
              :filter-option="filterDefectOption"
              :options="defectSelectOptions"
              :placeholder="$t('productionOperation.pleaseSelectDefect')"
              allow-clear
              class="w-full"
              show-search
              @change="(value: any) => defectChange(value, row)"
            />
          </template>
          <!-- 不良位置下拉：多选，提交时以逗号拼接 -->
          <template #location="{ row }">
            <Select
              v-model:value="row.locations"
              :field-names="{ label: 'locationCode', value: 'key' }"
              :filter-option="filterLocationOption"
              :max-tag-count="10"
              :options="locationOptions"
              :placeholder="$t('productionOperation.pleaseSelectLocation')"
              allow-clear
              class="w-full"
              mode="multiple"
              show-search
            />
          </template>
          <!-- 不良数量：不能大于不良品数量 -->
          <template #defectNumber="{ row }">
            <InputNumber
              v-model:value="row.defectNumber"
              :max="defectNumberInput"
              :min="0"
              class="w-full"
            />
          </template>
          <template #action="{ row }">
            <Button danger size="small" type="link" @click="handleDelete(row)">
              {{ $t('common.delete') }}
            </Button>
          </template>
        </Grid>
     </div>

    <template #footer>
      <Space>
        <Button @click="handleClose">{{ $t('common.cancel') }}</Button>
        <Button :loading="submitting" type="primary" @click="handleSave">
          {{ $t('common.save') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped>
/* 作用域样式，仅对当前组件生效 */
</style>
