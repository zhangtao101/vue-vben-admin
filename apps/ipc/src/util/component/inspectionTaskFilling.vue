<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';

import { MdiLightDelete } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  RadioGroup,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getAllQcFormByParam,
  getAllStandard,
  getAllStandardByCode,
  taskClear,
  taskStop,
} from '#/api';

/**
 * 定义组件接收的属性，用于传递质检任务的相关信息
 */
const props = defineProps({
  // 任务号，用于唯一标识一个质检任务
  recordCode: {
    type: String,
    default: '',
  },
  // 任务ID，用于唯一标识一个质检任务的数据库记录
  recordId: {
    type: Number,
    default: 0,
  },
  // 是否为启动状态，标识质检任务是否正在进行
  isStart: {
    type: Boolean,
    default: false,
  },
  // 不良产品数量，记录当前质检任务中的不良产品总数
  defectNumber: {
    type: Number,
    default: 0,
  },
  // 检验产品数量，记录当前质检任务中的检验产品总数
  checkNumber: {
    type: Number,
    default: 0,
  },
});

// 定义事件发射器，用于向父组件触发 'close' 事件
const emit = defineEmits(['close']);

// region 表格配置

/**
 * 质检数据表格的配置选项，用于定义表格的列、编辑行为、分页等信息
 */
const gridOptions: VxeGridProps<any> = {
  // 表格内容居中对齐
  align: 'center',
  // 显示表格边框
  border: true,
  // 表格列配置
  columns: [
    {
      // 序号列，自动生成行号
      title: '序号',
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    {
      // 产品SN码列，可编辑
      field: 'productSnCode',
      title: '产品SN码',
      minWidth: 150,
      editRender: {},
      slots: { edit: 'edit_productSnCode' },
    },
    {
      // 质检项编号列
      field: 'itemCode',
      title: '质检项编号',
      minWidth: 150,
    },
    {
      // 质检项名称列，可编辑，点击编辑时会弹出对话框选择质检项
      field: 'itemName',
      title: '质检项名称',
      minWidth: 200,
      editRender: {},
      slots: { edit: 'edit_itemName' },
    },
    {
      // 检验标准列
      field: 'judgeDescription',
      title: '检验标准',
      minWidth: 200,
    },
    {
      // 检验数量列，可编辑
      field: 'checkNumber',
      title: '检验数量',
      minWidth: 150,
      editRender: {},
      slots: { edit: 'edit_checkNumber' },
    },
    {
      // 不良数量列，可编辑
      field: 'unqualityNumber',
      title: '不良数量',
      minWidth: 150,
      editRender: {},
      slots: { edit: 'edit_unqualityNumber' },
    },
    {
      // 检验结果列，可编辑，显示和编辑时使用不同的插槽
      field: 'checkResult',
      title: '检验结果',
      minWidth: 220,
      editRender: {},
      slots: {
        default: 'checkResult',
        edit: 'edit_checkResult',
      },
    },
    {
      // 备注列，可编辑
      field: 'remark',
      title: '备注',
      minWidth: 150,
      editRender: {},
      slots: { edit: 'edit_remark' },
    },
    {
      // 操作列，固定在表格右侧，用于显示删除等操作按钮
      title: '操作',
      minWidth: 80,
      slots: {
        default: 'action',
      },
      fixed: 'right',
    },
  ],
  // 表格编辑配置
  editConfig: {
    // 点击单元格触发编辑
    trigger: 'click',
    // 单元格编辑模式
    mode: 'cell',
    /**
     * 编辑前的回调函数，用于在编辑质检项名称时弹出对话框
     * @param param - 包含列和行信息的对象
     * @returns {boolean} - 是否允许编辑
     */
    beforeEditMethod({ column: { title }, row }) {
      if (title === '质检项名称') {
        if (row.isEdit) {
          // 弹出质检项选择对话框
          showDialogBox(row);
        } else {
          return false;
        }
      }
      return true;
    },
  },
  // 表格高度
  height: 300,
  // 显示斑马纹
  stripe: true,
  // 排序配置，支持多列排序
  sortConfig: {
    multiple: true,
  },
  // 分页配置，禁用分页
  pagerConfig: {
    enabled: false,
  },
  // 代理配置，用于异步查询表格数据
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryData();
      },
    },
  },
  // 工具栏配置
  toolbarConfig: {
    // 显示自定义按钮
    custom: true,
    // 不显示导入按钮
    // import: true,
    // 不显示导出按钮
    // export: true,
    // 显示刷新按钮
    refresh: true,
    // 显示缩放按钮
    zoom: true,
  },
};

/**
 * 表格事件配置对象，用于处理表格的各种事件
 */
const gridEvents: any = {
  /**
   * 单选框状态改变时的事件处理函数
   * @param param - 包含选中行信息的对象
   */
  radioChange: ({ row }: any) => {
    message.info(`radioChange: ${row}`);
  },
};

// 初始化 VxeGrid 组件和 API
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// region 查询数据

/**
 * 查询质检标准数据
 * 该函数会根据任务编号从后端获取关联的质检标准信息，并将数据适配到表格所需的格式
 * @returns {Promise<{ total: number, items: any[] }>} - 包含总数据量和当前页数据的 Promise
 */
function queryData() {
  return new Promise((resolve, _reject) => {
    // 调用 API 接口获取质检标准数据
    getAllStandardByCode({
      recordCode: props.recordCode,
    })
      .then((data: any) => {
        // 为每条数据注入当前任务ID
        data.forEach((item: any) => {
          item.recordId = props.recordId;
        });
        // 将数据适配到表格所需的格式
        resolve({
          total: data.length,
          items: data,
        });
      })
      .catch((error: any) => {
        _reject(error);
      });
  });
}

// endregion

// endregion

// region 操作

/**
 * 新增质检数据行
 * 该函数会在表格中插入一个新的可编辑行，并初始化行数据的相关属性
 */
function addRow() {
  // 在表格中插入新行
  gridApi.grid.insert({
    isEdit: true, // 标记为可编辑状态
    recordId: props.recordId, // 关联当前任务ID
  });
}

/**
 * 删除质检数据行
 * 该函数会弹出确认对话框，确认后从表格中删除指定的行
 * @param row - 要删除的行数据对象
 */
function delRow(row: any) {
  // 弹出确认对话框
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      // 点击取消按钮，显示警告消息
      message.warning('已取消!');
    },
    onOk() {
      // 点击确认按钮，从表格中删除指定行
      gridApi.grid.remove(row);
      // 显示操作成功消息
      message.success($t('common.successfulOperation'));
    },
    title: '是否确认删除该条数据?',
  });
}

// 检验产品总数
const toatlCheckNumber = ref(0);
// 不良产品总数
const totalDefectNumber = ref(0);

/**
 * 暂停质检任务
 * 该函数会弹出确认对话框，确认后将当前表格中的质检数据提交到后端，并暂停任务
 */
function stop() {
  // 弹出确认对话框
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      // 点击取消按钮，显示警告消息
      message.warning('已取消!');
    },
    onOk() {
      // 调用 API 接口暂停任务
      taskStop({
        toatlCheckNumber: toatlCheckNumber.value,
        totalDefectNumber: totalDefectNumber.value,
        insertVms: gridApi.grid.getTableData().tableData,
      }).then(() => {
        // 显示操作成功消息
        message.success($t('common.successfulOperation'));
        // 触发 'close' 事件通知父组件
        emit('close');
      });
    },
    title: '是否确认暂停任务?',
  });
}

/**
 * 提交并完成质检任务
 * 该函数会先校验表格中的质检数据是否完整，若完整则弹出确认对话框，确认后将数据提交到后端完成任务
 */
function completed() {
  // 需要校验的字段
  const keys = ['checkNumber', 'unqualityNumber', 'checkResult'];
  let ok = true;
  // 遍历表格中的每一行数据，校验必填字段
  gridApi.grid.getTableData().tableData.forEach((item: any) => {
    keys.forEach((key: any) => {
      if (!item[key] && item[key] !== 0) {
        ok = false;
      }
    });
  });
  if (ok) {
    // 数据校验通过，弹出确认对话框
    Modal.confirm({
      cancelText: '取消',
      okText: '确认',
      okType: 'danger',
      onCancel() {
        // 点击取消按钮，显示警告消息
        message.warning('已取消!');
      },
      onOk() {
        // 调用 API 接口完成任务
        taskClear({
          toatlCheckNumber: toatlCheckNumber.value,
          totalDefectNumber: totalDefectNumber.value,
          insertVms: gridApi.grid.getTableData().tableData,
        }).then(() => {
          // 显示操作成功消息
          message.success($t('common.successfulOperation'));
          // 触发 'close' 事件通知父组件
          emit('close');
        });
      },
      title: '是否确认完成任务?',
    });
  } else {
    // 数据校验未通过，显示错误消息
    message.error(`当前有数据未填写,请检查`);
  }
}

// endregion

// region 质检项查询

// 质检项列表数据
const qualityInspectionItems = ref<any>([]);
// 选中的质检项代码
const selectedQualityInspectionItems = ref<any>('');
// 质检项搜索关键字
const keyWordsOfQualityInspectionItems = ref('');
// 质检项映射表，用于通过质检项代码快速查找详细信息
const qualityInspectionItemsMap = ref<any>({});
// 控制质检项选择对话框的显示状态
const displayTheDialogBox = ref(false);
// 当前正在编辑的行数据
const editItem = ref<any>({});

/**
 * 打开质检项选择对话框
 * 该函数会将当前正在编辑的行数据保存到 `editItem` 中，并显示质检项选择对话框
 * @param row - 当前正在编辑的行数据对象
 */
function showDialogBox(row: any) {
  // 保存当前正在编辑的行数据
  editItem.value = row;
  // 显示质检项选择对话框
  displayTheDialogBox.value = true;
}

/**
 * 查询质检项数据
 * 该函数会从后端获取当前任务关联的质检项信息，并将数据格式化为下拉选择框所需的格式，同时建立映射表
 */
function queryOfQualityInspectionItems() {
  // 调用 API 接口获取质检项数据
  getAllStandard({
    recordCode: props.recordCode,
  }).then((data: any) => {
    data.forEach((item: any) => {
      // 将数据格式化为下拉选择框所需的格式
      qualityInspectionItems.value.push({
        label: `${item.itemName}(${item.itemCode})`,
        value: item.itemCode,
      });
      // 建立质检项映射表
      qualityInspectionItemsMap.value[item.itemCode] = {
        ...item,
      };
    });
  });
}

/**
 * 关闭质检项选择对话框
 * 该函数会清空搜索关键字和选中的质检项，并隐藏质检项选择对话框
 */
function theQualityInspectionItemsAreClosed() {
  // 清空搜索关键字
  keyWordsOfQualityInspectionItems.value = '';
  // 清空选中的质检项
  selectedQualityInspectionItems.value = '';
  // 隐藏质检项选择对话框
  displayTheDialogBox.value = false;
}

/**
 * 处理质检项选择变更事件
 * 该函数会根据选中的质检项代码从映射表中获取详细信息，并更新当前正在编辑的行数据，最后关闭对话框
 */
function handleChange() {
  const keys = ['itemCode', 'itemName', 'judgeDescription'];
  const obj =
    qualityInspectionItemsMap.value[selectedQualityInspectionItems.value];
  // 更新当前正在编辑的行数据
  keys.forEach((key: any) => {
    editItem.value[key] = obj[key];
  });
  // 关闭质检项选择对话框
  theQualityInspectionItemsAreClosed();
}

// endregion

// region 质检模板查询

// 质检模板列表数据
const qualityInspectionTemplate = ref<any>([]);
// 质检模板映射表，用于通过模板代码快速查找模板包含的质检项信息
const qualityInspectionTemplateMap = ref<any>([]);
// 选中的质检模板代码
const selectedQualityInspectionTemplate = ref<any>();
// 质检模板搜索关键字
const templateKeywords = ref('');
// 控制质检模板选择对话框的显示状态
const show = ref(false);

/**
 * 查询质检模板数据
 * 该函数会从后端获取当前任务关联的质检模板信息，并将数据格式化为下拉选择框所需的格式，同时建立映射表
 */
function queryOfQualityInspectionTemplates() {
  // 调用 API 接口获取质检模板数据
  getAllQcFormByParam({
    recordCode: props.recordCode,
  }).then((data: any) => {
    data.forEach((item: any) => {
      // 将数据格式化为下拉选择框所需的格式
      qualityInspectionTemplate.value.push({
        label: `${item.formName}(${item.formCode})`,
        value: item.formCode,
      });
      // 建立质检模板映射表
      qualityInspectionTemplateMap.value[item.formCode] = [
        ...item.detailItemDtos,
      ];
    });
  });
}

/**
 * 处理质检模板选择确认事件
 * 该函数会弹出确认对话框，确认后将选中的质检模板中的质检项数据加载到表格中，并关闭对话框
 */
function templateChanged() {
  // 弹出确认对话框
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      // 点击取消按钮，显示警告消息
      message.warning('已取消!');
    },
    onOk() {
      // 获取选中的质检模板中的质检项数据
      const arr =
        qualityInspectionTemplateMap.value[
          selectedQualityInspectionTemplate.value
        ] || [];
      // 为每条数据注入当前任务ID
      arr.forEach((item: any) => {
        item.recordId = props.recordId;
      });
      // 将数据加载到表格中
      gridApi.grid.loadData(arr);
      // 关闭质检模板选择对话框
      close();
      // 显示操作成功消息
      message.success($t('common.successfulOperation'));
    },
    title: '是否确认选中质检模板?',
  });
}

/**
 * 关闭质检模板选择对话框
 * 该函数会隐藏质检模板选择对话框，并清空选中的质检模板代码
 */
function close() {
  // 隐藏质检模板选择对话框
  show.value = false;
  // 清空选中的质检模板代码
  selectedQualityInspectionTemplate.value = undefined;
}

// endregion

/**
 * 组件挂载后的生命周期钩子函数
 * 该函数会在组件挂载完成后初始化检验产品总数、不良产品总数，并查询质检项和质检模板数据
 */
onMounted(() => {
  // 初始化检验产品总数
  totalDefectNumber.value = props.defectNumber;
  // 初始化不良产品总数
  toatlCheckNumber.value = props.checkNumber;
  // 查询质检项数据
  queryOfQualityInspectionItems();
  // 查询质检模板数据
  queryOfQualityInspectionTemplates();
});
</script>

<template>
  <div>
    <!-- 渲染质检数据表格 -->
    <Grid>
      <!-- 表格工具栏操作区域，显示检验产品总数和不良产品总数输入框 -->
      <template #toolbar-actions>
        <label class="mr-4">
          <!-- 显示检验产品总数标签 -->
          {{ $t('qualityInspection.inspectTheTotalNumberOfProducts') }}:
          <!-- 检验产品总数输入框 -->
          <InputNumber
            v-model:value="toatlCheckNumber"
            class="ml-4 w-40"
            :min="0"
          />
        </label>
        <label>
          <!-- 显示不良产品总数标签 -->
          {{ $t('qualityInspection.theTotalNumberOfDefectiveProducts') }}:
          <!-- 不良产品总数输入框 -->
          <InputNumber
            v-model:value="totalDefectNumber"
            class="ml-4 w-40"
            :min="0"
          />
        </label>
      </template>
      <!-- 表格工具栏工具区域，显示切换和添加按钮 -->
      <template #toolbar-tools>
        <!-- 切换按钮，点击后显示质检模板选择对话框 -->
        <Button type="primary" class="mr-4" @click="show = true">
          {{ $t('common.toggle') }}
        </Button>
        <!-- 添加按钮，点击后在表格中添加新行 -->
        <Button type="primary" class="mr-4" @click="addRow">
          {{ $t('common.add') }}
        </Button>
      </template>
      <!-- 操作列插槽，显示删除按钮 -->
      <template #action="{ row }">
        <!-- 删除按钮，点击后弹出确认对话框并删除该行数据 -->
        <Tooltip>
          <template #title>{{ $t('common.delete') }}</template>
          <Button
            :icon="
              h(MdiLightDelete, {
                class: 'inline-block size-6',
              })
            "
            danger
            type="link"
            @click="delRow(row)"
          />
        </Tooltip>
      </template>

      <!-- 产品SN码编辑插槽，显示产品SN码输入框 -->
      <template #edit_productSnCode="{ row }">
        <Input v-model:value="row.productSnCode" />
      </template>
      <!-- 质检项名称编辑插槽，显示当前选中的质检项名称 -->
      <template #edit_itemName="{ row }">
        {{ row.itemName }}
      </template>
      <!-- 检验数量编辑插槽，显示检验数量输入框 -->
      <template #edit_checkNumber="{ row }">
        <InputNumber v-model:value="row.checkNumber" />
      </template>
      <!-- 不良数量编辑插槽，显示不良数量输入框 -->
      <template #edit_unqualityNumber="{ row }">
        <InputNumber v-model:value="row.unqualityNumber" />
      </template>
      <!-- 检验结果显示插槽，根据检验结果值显示合格或不合格 -->
      <template #checkResult="{ row }">
        {{
          row.checkResult === 1 ? '合格' : row.checkResult === 2 ? '不合格' : ''
        }}
      </template>
      <!-- 检验结果编辑插槽，显示单选框供用户选择合格或不合格 -->
      <template #edit_checkResult="{ row }">
        <RadioGroup v-model:value="row.checkResult">
          <Radio :value="1">合格</Radio>
          <Radio :value="2">不合格</Radio>
        </RadioGroup>
      </template>
      <!-- 备注编辑插槽，显示备注输入框 -->
      <template #edit_remark="{ row }">
        <Input v-model:value="row.remark" />
      </template>
    </Grid>
    <!-- 任务暂停按钮，点击后弹出确认对话框并暂停任务 -->
    <Button type="primary" size="large" @click="stop()">
      {{ $t('common.taskSuspended') }}
    </Button>
    <!-- 任务完成按钮，点击后校验数据并弹出确认对话框，确认后完成任务 -->
    <Button
      type="primary"
      size="large"
      class="float-right"
      @click="completed()"
    >
      {{ $t('common.taskCompleted') }}
    </Button>
  </div>

  <!-- 质检项选择对话框 -->
  <Modal
    :title="$t('qualityInspection.selectionOfQualityInspectionItems')"
    v-model:open="displayTheDialogBox"
    @cancel="theQualityInspectionItemsAreClosed"
    :footer="null"
  >
    <!-- 质检项搜索输入框 -->
    <Input v-model:value="keyWordsOfQualityInspectionItems" />
    <!-- 质检项单选框组，根据搜索关键字过滤显示 -->
    <RadioGroup
      v-model:value="selectedQualityInspectionItems"
      @change="handleChange"
    >
      <template v-for="item of qualityInspectionItems" :key="item.value">
        <Radio
          :value="item.value"
          class="block"
          v-if="item.label.includes(keyWordsOfQualityInspectionItems)"
        >
          {{ item.label }}
        </Radio>
      </template>
    </RadioGroup>
  </Modal>

  <!-- 质检模板选择对话框 -->
  <Modal
    :title="$t('qualityInspection.selectionOfQualityInspectionTemplates')"
    v-model:open="show"
    @ok="templateChanged()"
    @cancel="close"
  >
    <!-- 质检模板搜索输入框 -->
    <Input v-model:value="templateKeywords" />
    <!-- 质检模板单选框组，根据搜索关键字过滤显示 -->
    <RadioGroup v-model:value="selectedQualityInspectionTemplate">
      <template v-for="item of qualityInspectionTemplate" :key="item.value">
        <Radio
          :value="item.value"
          class="block"
          v-if="item.label.includes(templateKeywords)"
        >
          {{ item.label }}
        </Radio>
      </template>
    </RadioGroup>
  </Modal>
</template>

<style scoped>
/* 作用域样式，仅对当前组件生效 */
</style>
