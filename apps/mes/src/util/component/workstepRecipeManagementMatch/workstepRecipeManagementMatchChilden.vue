<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { IconifyIcon } from '@vben/icons';

import {
  Button,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  message,
  Modal,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  bindStepQuery,
  deleteStepsFunction,
  insertOpFunctionSet,
  listOpFunctionType,
  updateOpFunctionSet,
  updateOpList,
} from '#/api';
import { $t } from '#/locales';
import OperationSettings from '#/util/component/workstepRecipeManagementMatch/operationSettings.vue';

// region 表格

const gridOptions: VxeGridProps<any> = {
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'functionTypeName',
      title: '工步类型',
      minWidth: 150,
      dragSort: true,
    },
    { field: 'equipTypeCode', title: '配方号', minWidth: 150 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 220,
    },
  ],
  data: [],
  rowConfig: {
    drag: true,
  },
  pagerConfig: {
    enabled: false,
  },
  sortConfig: {
    multiple: true,
  },
};
const gridEvents: any = {
  rowDragend: () => {
    sort();
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions, gridEvents });

/**
 * 查询表格数据
 */
function queryTableData() {
  bindStepQuery({
    equipCode: formula.value.equipCode,
    processCode: formula.value.processCode,
    functionType: formula.value.opType,
    workstationCode: formula.value.workstationCode,
    equipTypeCode: formula.value.formulaCode,
  }).then((data) => {
    gridApi.grid.reloadData(data);
  });
}

function sort() {
  const { tableData } = gridApi.grid.getTableData();
  const params: any[] = [];
  tableData.forEach((item: any, index: number) => {
    params.push({
      id: item.id,
      orderNo: index + 1,
    });
  });
  updateOpList(params).then(() => {
    message.success($t('common.successfulOperation'));
    queryTableData();
  });
}

/**
 * 删除工步
 * @param id
 */
function deleteStep(id: string) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消!');
    },

    onOk() {
      deleteStepsFunction(id).then(() => {
        message.success($t('common.successfulOperation'));
        queryTableData();
      });
    },
    title: '是否确认删除?',
  });
}

// endregion

// region 抽屉基本操作

// 抽屉是否显示
const visible = ref(false);
// 配方
const formula = ref<any>({});
// 同步信息
const matching = ref<any>({});

/**
 * 打开抽屉
 */
function openDrawer(formulaMessage: any, matchingMessage: any) {
  // 赋值配方
  formula.value = formulaMessage;
  // 赋值同步信息
  matching.value = matchingMessage;

  queryTableData();
  visible.value = true;
}

/**
 * 关闭抽屉
 */
function closeDrawer() {
  visible.value = false;
  gridApi.grid.reloadData([]);
}
// endregion

// region 绑定工步
// 绑定工步抽屉是否显示
const bindDrawer = ref(false);
// 编辑的对象
const editItem = ref<any>({});
// 表单对象
const editForm = ref<any>();
/**
 * 打开绑定工步抽屉
 */
function showBindDrawer(row: any = {}) {
  bindDrawer.value = true;
  editItem.value = row;
  queryWorkStepType();
}

/**
 * 关闭绑定工步抽屉
 */
function closeBindDrawer() {
  bindDrawer.value = false;
}

function bindSubmit() {
  editForm.value.validate().then(() => {
    const params = {
      ...editItem.value,
      equipTypeCode: formula.value.formulaCode,
      opDetailId: matching.value.id,
    };
    (params.id
      ? updateOpFunctionSet(params)
      : insertOpFunctionSet(params)
    ).then(() => {
      queryTableData();
      // 关闭抽屉
      closeBindDrawer();
    });
  });
}

// endregion

// region 运行设置

const operationSettingRef = ref();

/**
 * 打开运行设置抽屉
 * @param row 工步数据
 */
function openOperationSettings(row: any): void {
  /**
   *
   * // 配方
   * const formula = ref<any>({});
   * // 同步信息
   * const matching = ref<any>({});
   */
  operationSettingRef.value.open(
    formula.value,
    matching.value,
    row,
    gridApi.grid.getTableData().tableData,
  );
}

// endregion

// region 工步类型
// 工步类型选项
const options = ref<any>([]);

function queryWorkStepType() {
  listOpFunctionType().then((data) => {
    options.value = data;
  });
}
// endregion

// region 暴露方法

// 暴露 open 方法，供父组件调用
defineExpose({
  open: openDrawer,
});

// endregion
</script>

<template>
  <Drawer
    v-model:open="visible"
    height="80%"
    placement="top"
    :title="$t('common.match')"
    @close="closeDrawer()"
  >
    <!-- 基本信息 -->
    <Descriptions :column="5" bordered>
      <!-- 设备编号 -->
      <DescriptionsItem :label="$t('operationFormula.equipmentNumber')">
        {{ formula.equipCode }}
      </DescriptionsItem>
      <!-- 设备名称 -->
      <DescriptionsItem :label="$t('operationFormula.equipmentName')">
        {{ formula.equipName }}
      </DescriptionsItem>
      <!-- 工序名称 -->
      <DescriptionsItem :label="$t('operationFormula.processName')">
        {{ formula.processName }}
      </DescriptionsItem>
      <!-- 配方编号 -->
      <DescriptionsItem :label="$t('operationFormula.formulaNumber')">
        {{ formula.formulaCode }}
      </DescriptionsItem>
      <!-- 配方名称 -->
      <DescriptionsItem :label="$t('operationFormula.formulaName')">
        {{ formula.formulaName }}
      </DescriptionsItem>
      <!-- 版本号 -->
      <DescriptionsItem :label="$t('operationFormula.versionNumber')">
        {{ formula.version }}
      </DescriptionsItem>
      <!-- 工作站编号 -->
      <DescriptionsItem :label="$t('operationFormula.workstationNumber')">
        {{ matching.workstationCode }}
      </DescriptionsItem>
      <!-- 工作站名称 -->
      <DescriptionsItem :label="$t('operationFormula.workstationName')">
        {{ matching.workstationName }}
      </DescriptionsItem>
      <!-- 作业类型 -->
      <DescriptionsItem :label="$t('operationFormula.operationType')">
        {{ matching.opTypeName }}
      </DescriptionsItem>
    </Descriptions>
    <Button class="my-4" type="primary" @click="showBindDrawer()">
      {{ $t('common.add') }}
    </Button>
    <Grid>
      <template #action="{ row }">
        <!-- 编辑按钮 -->
        <Tooltip>
          <template #title>{{ $t('common.edit') }}</template>
          <Button type="link" @click="showBindDrawer(row)">
            <IconifyIcon
              icon="mdi:edit-outline"
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </Tooltip>
        <!-- 绑定按钮 -->
        <Tooltip>
          <template #title>{{ $t('operationFormula.runSetting') }}</template>
          <Button type="link" @click="openOperationSettings(row)">
            <IconifyIcon
              icon="mdi:settings-play-outline"
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </Tooltip>

        <!-- 删除数据 -->
        <Tooltip>
          <template #title>{{ $t('common.delete') }}</template>
          <Button danger type="link" @click="deleteStep(row.id)">
            <IconifyIcon
              icon="mdi-light:delete"
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </Tooltip>
      </template>
    </Grid>
  </Drawer>

  <Drawer
    v-model:open="bindDrawer"
    :width="400"
    placement="right"
    :title="$t('common.edit')"
    :footer-style="{ textAlign: 'right' }"
    @close="closeBindDrawer()"
  >
    <Form
      ref="editForm"
      :label-col="{ span: 8 }"
      :model="editItem"
      :wrapper-col="{ span: 16 }"
    >
      <!-- 工步类型 -->
      <FormItem
        :label="$t('operationFormula.workStepType')"
        :rules="[{ required: true, message: '该项为必填项' }]"
        name="functionType"
      >
        <Select
          v-model:value="editItem.functionType"
          :options="options"
          :field-names="{ label: 'functionTypeName', value: 'functionType' }"
        />
      </FormItem>
    </Form>

    <!-- 抽屉底部操作按钮 -->
    <template #footer>
      <!-- 按钮组，包含取消和确认按钮 -->
      <Space>
        <!-- 取消按钮，点击后关闭人员操作抽屉 -->
        <Button @click="closeBindDrawer">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认按钮，点击后提交人员操作信息 -->
        <Button type="primary" @click="bindSubmit()">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>

  <OperationSettings ref="operationSettingRef" />
</template>

<style scoped></style>
