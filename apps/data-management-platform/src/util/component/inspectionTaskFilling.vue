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
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData() {
  return new Promise((resolve, _reject) => {
    getAllStandardByCode({
      recordCode: props.recordCode,
    })
      .then((data: any) => {
        data.forEach((item: any) => {
          item.recordId = props.recordId;
        });
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
 * 新增行
 */
function addRow() {
  gridApi.grid.insert({
    isEdit: true,
    recordId: props.recordId,
  });
}

/**
 * 删除行
 * @param row
 */
function delRow(row: any) {
  // 弹出确认框，询问用户是否确认删除该行数据
  Modal.confirm({
    // 取消按钮的文本
    cancelText: '取消',
    // 确认按钮的文本
    okText: '确认',
    // 确认按钮的类型（此处为危险操作，通常用于删除等不可逆操作）
    okType: 'danger',

    // 用户取消操作时触发的回调函数
    onCancel() {
      // 弹出警告提示，提示用户取消了删除操作
      message.warning('已取消!');
    },

    // 用户确认操作时触发的回调函数
    onOk() {
      gridApi.grid.remove(row);
      message.success($t('common.successfulOperation'));
    },
    // 确认框的标题文本
    title: '是否确认删除该条数据?',
  });
}

/**
 * 暂停任务
 */
function stop() {
  // 弹出确认框，询问用户是否确认删除该行数据
  Modal.confirm({
    // 取消按钮的文本
    cancelText: '取消',
    // 确认按钮的文本
    okText: '确认',
    // 确认按钮的类型（此处为危险操作，通常用于删除等不可逆操作）
    okType: 'danger',

    // 用户取消操作时触发的回调函数
    onCancel() {
      // 弹出警告提示，提示用户取消了删除操作
      message.warning('已取消!');
    },

    // 用户确认操作时触发的回调函数
    onOk() {
      // 调用删除按钮的操作，传递按钮的编码和类型参数
      taskStop(gridApi.grid.getTableData().tableData).then(() => {
        // 如果删除操作成功，显示操作成功的提示信息
        message.success($t('common.successfulOperation')); // 成功操作的提示信息（通过国际化处理）
        emit('close');
      });
    },
    // 确认框的标题文本
    title: '是否确认暂停任务?',
  });
}
/**
 * 完成任务
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
    // 弹出确认框，询问用户是否确认删除该行数据
    Modal.confirm({
      // 取消按钮的文本
      cancelText: '取消',
      // 确认按钮的文本
      okText: '确认',
      // 确认按钮的类型（此处为危险操作，通常用于删除等不可逆操作）
      okType: 'danger',

      // 用户取消操作时触发的回调函数
      onCancel() {
        // 弹出警告提示，提示用户取消了删除操作
        message.warning('已取消!');
      },

      // 用户确认操作时触发的回调函数
      onOk() {
        // 调用删除按钮的操作，传递按钮的编码和类型参数
        taskClear(gridApi.grid.getTableData().tableData).then(() => {
          // 如果删除操作成功，显示操作成功的提示信息
          message.success($t('common.successfulOperation')); // 成功操作的提示信息（通过国际化处理）
          emit('close');
        });
      },
      // 确认框的标题文本
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

function showDialogBox(row: any) {
  editItem.value = row;
  displayTheDialogBox.value = true;
}

// 定义一个函数，用于查询质检项
function queryOfQualityInspectionItems() {
  // 调用 getAllStandard 函数，传入 recordCode 参数，获取质检项的标准数据
  getAllStandard({
    recordCode: props.recordCode, // 使用 props 中的 recordCode 作为查询条件
  }).then((data: any) => {
    // 遍历返回的质检项数据
    data.forEach((item: any) => {
      // 将每个质检项的名称和代码封装为一个对象，添加到 qualityInspectionItems 列表中
      qualityInspectionItems.value.push({
        label: `${item.itemName}(${item.itemCode})`, // 质检项名称
        value: item.itemCode, // 质检项代码
      });
      // 将质检项的详细信息存储到 qualityInspectionItemsMap 映射中，以质检项代码为键
      qualityInspectionItemsMap.value[item.itemCode] = {
        ...item, // 展开 item 对象，存储所有字段
      };
    });
  });
}

/**
 * 质检项对话框关闭
 */
function theQualityInspectionItemsAreClosed() {
  keyWordsOfQualityInspectionItems.value = '';
  selectedQualityInspectionItems.value = '';
  displayTheDialogBox.value = false;
}
/**
 * 改变值
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
 * 质检模板查询
 */
function queryOfQualityInspectionTemplates() {
  getAllQcFormByParam({
    recordCode: props.recordCode,
  }).then((data: any) => {
    // 遍历返回的质检项数据
    data.forEach((item: any) => {
      // 将每个质检项的名称和代码封装为一个对象，添加到 qualityInspectionItems 列表中
      qualityInspectionTemplate.value.push({
        label: `${item.formName}(${item.formCode})`,
        value: item.formCode,
      });
      qualityInspectionTemplateMap.value[item.formCode] = [
        ...item.detailItemDtos, // 存储所有字段
      ];
    });
  });
}

/**
 * 选中质检模板
 */
function templateChanged() {
  Modal.confirm({
    // 取消按钮的文本
    cancelText: '取消',
    // 确认按钮的文本
    okText: '确认',
    // 确认按钮的类型（此处为危险操作，通常用于删除等不可逆操作）
    okType: 'danger',
    // 用户取消操作时触发的回调函数
    onCancel() {
      // 弹出警告提示，提示用户取消了删除操作
      message.warning('已取消!');
    },
    onOk() {
      gridApi.grid.loadData(
        qualityInspectionTemplateMap.value[
          selectedQualityInspectionTemplate.value
        ] || [],
      );
      close();
      message.success($t('common.successfulOperation'));
    },
    // 确认框的标题文本
    title: '是否确认选中质检模板?',
  });
}

/**
 * 挂壁对话框
 */
function close() {
  show.value = false;
  selectedQualityInspectionTemplate.value = undefined;
}

// endregion

onMounted(() => {
  queryOfQualityInspectionItems();
  queryOfQualityInspectionTemplates();
});
</script>

<template>
  <div>
    <Grid>
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
