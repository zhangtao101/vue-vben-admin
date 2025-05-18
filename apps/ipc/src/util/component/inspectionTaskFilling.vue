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

const props = defineProps({
  // 任务号
  recordCode: {
    type: String,
    default: '',
  },
  // 任务ID
  recordId: {
    type: Number,
    default: 0,
  },
  // 是否为启动状态
  isStart: {
    type: Boolean,
    default: false,
  },
  defectNumber: {
    type: Number,
    default: 0,
  },
  checkNumber: {
    type: Number,
    default: 0,
  },
});
// 事件
const emit = defineEmits(['close']);

// region 表格配置

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      title: '序号',
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    {
      field: 'productSnCode',
      title: '产品SN码',
      minWidth: 150,
      editRender: {},
      slots: { edit: 'edit_productSnCode' },
    },
    {
      field: 'itemCode',
      title: '质检项编号',
      minWidth: 150,
    },
    {
      field: 'itemName',
      title: '质检项名称',
      minWidth: 200,
      editRender: {},
      slots: { edit: 'edit_itemName' },
    },
    {
      field: 'judgeDescription',
      title: '检验标准',
      minWidth: 200,
    },
    {
      field: 'checkNumber',
      title: '检验数量',
      minWidth: 150,
      editRender: {},
      slots: { edit: 'edit_checkNumber' },
    },
    {
      field: 'unqualityNumber',
      title: '不良数量',
      minWidth: 150,
      editRender: {},
      slots: { edit: 'edit_unqualityNumber' },
    },
    {
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
      field: 'remark',
      title: '备注',
      minWidth: 150,
      editRender: {},
      slots: { edit: 'edit_remark' },
    },
    {
      title: '操作',
      minWidth: 80,
      slots: {
        default: 'action',
      },
      fixed: 'right',
    },
  ],
  editConfig: {
    trigger: 'click',
    mode: 'cell',
    beforeEditMethod({ column: { title }, row }) {
      if (title === '质检项名称') {
        if (row.isEdit) {
          showDialogBox(row);
        } else {
          return false;
        }
      }
      return true;
    },
  },
  height: 300,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryData();
      },
    },
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: any = {
  radioChange: ({ row }: any) => {
    message.info(`radioChange: ${row}`);
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// region 查询数据

/**
 * 查询质检标准数据
 * 功能：根据任务编号获取关联的质检标准信息
 * 流程：
 * 1. 调用质检标准查询接口获取原始数据
 * 2. 为每条数据附加当前任务ID
 * 3. 转换数据结构适配前端表格显示
 *
 * 接口说明：
 * getAllStandardByCode - 质检标准查询接口，接收参数：
 *   - recordCode: 当前质检任务编号（来自父组件 recordCode）
 *
 * 数据结构处理：
 * - 为每个质检标准附加 recordId 字段（当前任务ID）
 * - 返回 total 为数据总条数（未分页）
 * - items 为处理后的质检标准列表
 */
function queryData() {
  return new Promise((resolve, _reject) => {
    getAllStandardByCode({
      recordCode: props.recordCode,
    })
      .then((data: any) => {
        data.forEach((item: any) => {
          item.recordId = props.recordId; // 注入当前任务ID
        });
        resolve({
          total: data.length, // 总记录数
          items: data, // 处理后的质检标准数据
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
 * 功能：在表格中插入新的可编辑空行用于数据录入
 * 流程：
 * 1. 调用表格API插入新行
 * 2. 初始化行数据状态：
 *   - isEdit: 标记为可编辑状态
 *   - recordId: 关联当前质检任务ID
 *
 * 使用场景：当用户需要添加新的质检项数据时触发
 */
function addRow() {
  gridApi.grid.insert({
    isEdit: true, // 标记为新增编辑状态
    recordId: props.recordId, // 绑定当前任务ID
  });
}

/**
 * 删除质检数据行
 * 功能：从表格中移除指定行数据并进行二次确认
 * 流程：
 * 1. 弹出确认对话框进行风险提示
 * 2. 确认后调用表格API移除指定行
 * 3. 显示国际化操作结果提示
 *
 * @param row - 要删除的行数据对象
 *
 * 注意事项：
 * - 使用ant-design的Modal.confirm实现二次确认
 * - 实际数据删除需在接口成功后执行（当前为前端移除）
 * - 成功提示使用国际化处理的多语言文本
 */
function delRow(row: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消!');
    },
    onOk() {
      gridApi.grid.remove(row);
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
 * 功能：暂停当前进行中的质检任务并提交相关数据
 * 流程：
 * 1. 弹出确认对话框进行二次确认
 * 2. 确认后获取当前表格中所有质检数据
 * 3. 调用任务暂停接口提交数据
 * 4. 成功时：
 *   - 显示国际化成功提示
 *   - 通知父组件关闭当前界面
 *
 * 接口说明：
 * taskStop - 任务暂停接口，接收参数：
 *   - 当前表格中所有质检数据（tableData）
 *
 * 注意事项：
 * - 使用ant-design的Modal.confirm实现操作确认
 * - 提交数据包含当前表格所有行数据
 * - 成功操作后通过emit触发父组件更新
 */
function stop() {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消!');
    },
    onOk() {
      taskStop({
        toatlCheckNumber: toatlCheckNumber.value,
        totalDefectNumber: totalDefectNumber.value,
        insertVms: gridApi.grid.getTableData().tableData,
      }).then(() => {
        message.success($t('common.successfulOperation'));
        emit('close');
      });
    },
    title: '是否确认暂停任务?',
  });
}
/**
 * 提交并完成质检任务
 * 功能：验证并提交完整的质检数据以完成任务
 * 流程：
 * 1. 校验表格中所有质检项的必填字段：
 *   - 检验数量（允许0值）
 *   - 不良数量（允许0值）
 *   - 检验结果
 * 2. 全部数据合规时弹出确认对话框
 * 3. 确认后提交当前所有质检数据
 * 4. 成功时：
 *   - 显示国际化成功提示
 *   - 通知父组件关闭当前界面
 *
 * 接口说明：
 * taskClear - 任务完成接口，接收参数：
 *   - 当前表格中所有质检数据（tableData）
 *
 * 注意事项：
 * - 使用双重循环校验每行数据的完整性
 * - 允许数值型字段为0但不可为空
 * - 未通过校验时显示具体错误提示
 */
function completed() {
  // 需要校验的数据
  const keys = ['checkNumber', 'unqualityNumber', 'checkResult'];
  let ok = true;
  gridApi.grid.getTableData().tableData.forEach((item: any) => {
    keys.forEach((key: any) => {
      if (!item[key] && item[key] !== 0) {
        ok = false;
      }
    });
  });
  if (ok) {
    Modal.confirm({
      cancelText: '取消',
      okText: '确认',
      okType: 'danger',

      onCancel() {
        message.warning('已取消!');
      },

      onOk() {
        taskClear({
          toatlCheckNumber: toatlCheckNumber.value,
          totalDefectNumber: totalDefectNumber.value,
          insertVms: gridApi.grid.getTableData().tableData,
        }).then(() => {
          message.success($t('common.successfulOperation'));
          emit('close');
        });
      },
      title: '是否确认完成任务?',
    });
  } else {
    message.error(`当前有数据未填写,请检查`);
  }
}

// endregion

// region 质检项查询
// 定义一个响应式变量，用于存储质检项的列表数据
const qualityInspectionItems = ref<any>([]);
// 定义一个响应式变量，用于存储选中的质检项
const selectedQualityInspectionItems = ref<any>('');
// 关键字
const keyWordsOfQualityInspectionItems = ref('');
// 定义一个响应式变量，用于存储质检项的映射关系（通过质检项代码访问详细信息）
const qualityInspectionItemsMap = ref<any>({});
// 显示质检项对话框
const displayTheDialogBox = ref(false);
const editItem = ref<any>({});

/**
 * 打开质检项选择对话框
 * 功能：激活质检项选择界面并初始化编辑行数据
 * 流程：
 * 1. 保存当前编辑行数据至响应式对象
 * 2. 显示质检项选择对话框
 *
 * @param row - 当前要编辑的行数据对象
 *
 * 使用场景：当用户点击质检项名称列进行编辑时触发
 */
function showDialogBox(row: any) {
  editItem.value = row; // 存储当前编辑行数据
  displayTheDialogBox.value = true; // 激活对话框显示状态
}

/**
 * 查询质检项数据
 * 功能：获取当前任务关联的质检项并构建数据结构
 * 流程：
 * 1. 调用质检项查询接口获取原始数据
 * 2. 格式化数据为选择器需要的{label, value}格式
 * 3. 建立质检项代码与详细信息的映射关系
 *
 * 接口说明：
 * getAllStandard - 质检项查询接口，接收参数：
 *   - recordCode: 当前质检任务编号（来自父组件 props.recordCode）
 *
 * 数据结构处理：
 * - qualityInspectionItems: 用于下拉选择的选项集合
 * - qualityInspectionItemsMap: 键值对映射表，便于快速查找质检项详情
 */
function queryOfQualityInspectionItems() {
  getAllStandard({
    recordCode: props.recordCode,
  }).then((data: any) => {
    data.forEach((item: any) => {
      qualityInspectionItems.value.push({
        label: `${item.itemName}(${item.itemCode})`,
        value: item.itemCode,
      });
      qualityInspectionItemsMap.value[item.itemCode] = {
        ...item,
      };
    });
  });
}

/**
 * 关闭质检项选择对话框
 * 功能：重置质检项选择对话框状态并隐藏界面
 * 流程：
 * 1. 清空质检项搜索关键字
 * 2. 重置当前选中的质检项
 * 3. 隐藏质检项选择对话框
 *
 * 涉及状态变量：
 * - keyWordsOfQualityInspectionItems: 存储搜索关键词的响应式变量
 * - selectedQualityInspectionItems: 存储当前选中质检项的响应式变量
 * - displayTheDialogBox: 控制对话框显示状态的响应式变量
 */
function theQualityInspectionItemsAreClosed() {
  keyWordsOfQualityInspectionItems.value = '';
  selectedQualityInspectionItems.value = '';
  displayTheDialogBox.value = false;
}
/**
 * 处理质检项选择变更
 * 功能：将选中的质检项信息同步到当前编辑行
 * 流程：
 * 1. 从质检项映射表中获取选中项的完整数据
 * 2. 将关键字段(itemCode/itemName/judgeDescription)更新到编辑行
 * 3. 关闭质检项选择对话框
 *
 * 关键字段说明：
 * - itemCode: 质检项编码
 * - itemName: 质检项名称
 * - judgeDescription: 检验标准描述
 *
 * 实现逻辑：
 * - 通过选中的质检项代码从映射表获取完整对象
 * - 批量更新当前编辑行的指定字段
 */
function handleChange() {
  const keys = ['itemCode', 'itemName', 'judgeDescription'];
  const obj =
    qualityInspectionItemsMap.value[selectedQualityInspectionItems.value];
  keys.forEach((key: any) => {
    editItem.value[key] = obj[key];
  });
  theQualityInspectionItemsAreClosed();
}

// endregion

// region 质检模板查询
// 质检模板
const qualityInspectionTemplate = ref<any>([]);
// 质检模板映射
const qualityInspectionTemplateMap = ref<any>([]);
// 选中的质检模板
const selectedQualityInspectionTemplate = ref<any>();
// 模板关键字
const templateKeywords = ref('');
// 显示质检模板抽屉
const show = ref(false);

/**
 * 查询质检模板数据
 * 功能：获取当前任务关联的质检模板并构建数据结构
 * 流程：
 * 1. 调用质检模板查询接口获取原始数据
 * 2. 格式化数据为选择器需要的{label, value}格式
 * 3. 建立模板代码与模板详情的映射关系
 *
 * 接口说明：
 * getAllQcFormByParam - 质检模板查询接口，接收参数：
 *   - recordCode: 当前质检任务编号（来自父组件 props.recordCode）
 *
 * 数据结构处理：
 * - qualityInspectionTemplate: 存储模板选择器的选项集合
 * - qualityInspectionTemplateMap: 键值对映射表，键为模板编码，值为模板包含的质检项集合
 */
function queryOfQualityInspectionTemplates() {
  getAllQcFormByParam({
    recordCode: props.recordCode,
  }).then((data: any) => {
    data.forEach((item: any) => {
      qualityInspectionTemplate.value.push({
        label: `${item.formName}(${item.formCode})`,
        value: item.formCode,
      });
      qualityInspectionTemplateMap.value[item.formCode] = [
        ...item.detailItemDtos, // 存储模板包含的所有质检项
      ];
    });
  });
}

/**
 * 处理质检模板选择确认
 * 功能：应用选中的质检模板数据到当前表格
 * 流程：
 * 1. 弹出确认对话框进行二次确认
 * 2. 确认后加载选中模板对应的质检项数据
 * 3. 关闭模板选择界面
 * 4. 显示操作成功提示
 *
 * 接口说明：
 * gridApi.grid.loadData - 表格数据加载方法，接收参数：
 *   - 选中模板对应的质检项数组
 *
 * 数据结构说明：
 * - qualityInspectionTemplateMap: 存储模板编码与质检项数组的映射关系
 * - selectedQualityInspectionTemplate: 当前选中的模板编码
 *
 * 注意事项：
 * - 使用ant-design的Modal组件实现操作确认
 * - 实际业务中需确保模板数据已通过接口验证
 * - 成功提示使用国际化处理的多语言文本
 */
function templateChanged() {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消!');
    },
    onOk() {
      const arr =
        qualityInspectionTemplateMap.value[
          selectedQualityInspectionTemplate.value
        ] || [];
      arr.forEach((item: any) => {
        item.recordId = props.recordId;
      });
      gridApi.grid.loadData(arr);
      close();
      message.success($t('common.successfulOperation'));
    },
    title: '是否确认选中质检模板?',
  });
}

/**
 * 关闭质检模板选择对话框
 * 功能：重置模板选择界面状态并清空选中项
 * 流程：
 * 1. 隐藏质检模板选择对话框
 * 2. 清空当前选中的模板记录
 *
 * 涉及状态变量：
 * - show: 控制模板选择对话框显示状态的响应式变量
 * - selectedQualityInspectionTemplate: 存储当前选中模板编码的响应式变量
 */
function close() {
  show.value = false; // 关闭对话框显示
  selectedQualityInspectionTemplate.value = undefined; // 重置选中模板
}

// endregion

onMounted(() => {
  totalDefectNumber.value = props.defectNumber;
  toatlCheckNumber.value = props.checkNumber;
  queryOfQualityInspectionItems();
  queryOfQualityInspectionTemplates();
});
</script>

<template>
  <div>
    <Grid>
      <!--    toatlCheckNumber  检验产品总数
totalDefectNumber 不良产品总数  -->
      <template #toolbar-actions>
        <label class="mr-4">
          {{ $t('qualityInspection.inspectTheTotalNumberOfProducts') }}:
          <InputNumber
            v-model:value="toatlCheckNumber"
            class="ml-4 w-40"
            :min="0"
          />
        </label>
        <label>
          {{ $t('qualityInspection.theTotalNumberOfDefectiveProducts') }}:
          <InputNumber
            v-model:value="totalDefectNumber"
            class="ml-4 w-40"
            :min="0"
          />
        </label>
      </template>
      <template #toolbar-tools>
        <!-- 切换按钮 -->
        <Button type="primary" class="mr-4" @click="show = true">
          {{ $t('common.toggle') }}
        </Button>
        <!-- 切换按钮 -->
        <Button type="primary" class="mr-4" @click="addRow">
          {{ $t('common.add') }}
        </Button>
      </template>
      <template #action="{ row }">
        <!-- 删除数据 -->
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

      <!-- 产品SN码 -->
      <template #edit_productSnCode="{ row }">
        <Input v-model:value="row.productSnCode" />
      </template>
      <!-- 质检项名称 -->
      <template #edit_itemName="{ row }">
        {{ row.itemName }}
      </template>
      <!-- 检验数量 -->
      <template #edit_checkNumber="{ row }">
        <InputNumber v-model:value="row.checkNumber" />
      </template>
      <!-- 不良数量 -->
      <template #edit_unqualityNumber="{ row }">
        <InputNumber v-model:value="row.unqualityNumber" />
      </template>
      <!-- 检验结果 -->
      <template #checkResult="{ row }">
        {{
          row.checkResult === 1 ? '合格' : row.checkResult === 2 ? '不合格' : ''
        }}
      </template>
      <!-- 检验结果 -->
      <template #edit_checkResult="{ row }">
        <RadioGroup v-model:value="row.checkResult">
          <Radio :value="1">合格</Radio>
          <Radio :value="2">不合格</Radio>
        </RadioGroup>
      </template>
      <!-- 备注 -->
      <template #edit_remark="{ row }">
        <Input v-model:value="row.remark" />
      </template>
    </Grid>
    <!--  任务暂停 -->
    <Button type="primary" size="large" @click="stop()">
      {{ $t('common.taskSuspended') }}
    </Button>
    <!-- 任务完成 -->
    <Button
      type="primary"
      size="large"
      class="float-right"
      @click="completed()"
    >
      {{ $t('common.taskCompleted') }}
    </Button>
  </div>

  <!-- 质检项选择 -->
  <Modal
    :title="$t('qualityInspection.selectionOfQualityInspectionItems')"
    v-model:open="displayTheDialogBox"
    @cancel="theQualityInspectionItemsAreClosed"
    :footer="null"
  >
    <Input v-model:value="keyWordsOfQualityInspectionItems" />
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

  <!-- 质检模板选择 -->
  <Modal
    :title="$t('qualityInspection.selectionOfQualityInspectionTemplates')"
    v-model:open="show"
    @ok="templateChanged()"
    @cancel="close"
  >
    <Input v-model:value="templateKeywords" />
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

<style scoped></style>
