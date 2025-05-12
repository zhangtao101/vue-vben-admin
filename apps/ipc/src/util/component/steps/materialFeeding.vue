<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, ref } from 'vue';

import { CarbonTaskComplete, MdQrcodeScan } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  feedingComplete,
  feedingMaterials,
  materialFeedingInformationQuerySlitting,
} from '#/api';

const props = defineProps({
  // 工步id
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心
  workstationCode: {
    type: String,
    default: '',
  },
});

/**
 * 获取标签的class
 */
function getLabelClass() {
  return 'mr-4 inline-block w-48 border p-2 text-center';
}

/**
 * 获取值的class
 */
function getValueClass() {
  return 'inline-block w-48 border p-2 text-center';
}

// region 数据查询
// 查询条件
// const queryParams = ref<any>({});

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'materialCode',
      title: '物料编号',
      minWidth: 120,
    },
    {
      field: 'materialName',
      title: '物料名称',
      minWidth: 120,
    },
    { field: 'auxiliaryDoage', title: '目标重量(KG)', minWidth: 150 },
    { field: 'feedNumber', title: '当前累计投料(KG)', minWidth: 250 },
    { field: 'feedRate', title: '投料进度(%)', minWidth: 150 },
    {
      field: 'feedCheckFlag',
      title: '投料校验',
      minWidth: 150,
      slots: { default: 'feedCheckFlag' },
    },
    {
      field: 'isClear',
      title: '完成状态',
      minWidth: 150,
      slots: { default: 'isClear' },
    },
    {
      field: 'unit2',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 150,
      fixed: 'right',
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryData();
      },
    },
  },
  scrollY: {
    enabled: true,
    gt: 30,
  },
  scrollX: {
    enabled: true,
    gt: 0,
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: any = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

const details = ref<any>({});

/**
 * 查询物料投料信息
 * 功能：获取当前工位的物料投料数据并格式化表格数据
 * 流程：
 * 1. 构造包含工位、设备、工单等参数的请求对象
 * 2. 调用分切物料信息查询接口
 * 3. 分离返回数据中的明细列表和其他属性
 * 4. 转换接口数据适配vxe-table格式
 *
 * 接口参数说明：
 * materialFeedingInformationQuerySlitting - 分切物料信息查询接口
 * {
 *   workstationCode: 工作站编码,
 *   equipCode: 设备编码,
 *   worksheetCode: 工单编号,
 *   bindingId: 工序绑定ID,
 *   functionId: 工步ID,
 *   feedtype: 投料类型(固定值1)
 * }
 *
 * 返回数据处理：
 * - detailDtos: 物料明细列表（用于表格行数据）
 * - 其他属性: 存储到details响应式对象中
 *
 * 注意事项：
 * - 依赖props传入的工位/设备/工单等上下文参数
 * - feedtype参数固定为1表示分切类型
 * - 表格数据适配需返回{total, items}格式
 * - 使用Promise包装接口调用便于表格控件使用
 */
function queryData() {
  return new Promise((resolve, reject) => {
    materialFeedingInformationQuerySlitting({
      workstationCode: props.workstationCode,
      equipCode: props.equipCode,
      worksheetCode: props.worksheetCode,
      bindingId: props.bindingId,
      functionId: props.functionId,
      feedtype: 1,
    })
      .then(({ detailDtos, ...p }: any) => {
        details.value = p;
        resolve({
          total: detailDtos.length,
          items: detailDtos,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 获取投料校验状态文本
 * 功能：将数值型校验状态转换为可读文本
 *
 * @param row - 包含feedCheckFlag属性的行数据对象
 * @returns 对应中文状态文本
 *
 * 注意事项：
 * - 状态码映射关系：
 *   1 -> 通过
 *   2 -> 不通过
 *   3 -> 未检测
 * - 新增状态码时需要扩展case分支
 * - 当前未处理未定义状态码的返回值
 * - 用于表格feedCheckFlag列的显示
 */
function getFeedCheckFlagText(row: any) {
  switch (row.feedCheckFlag) {
    case 1: {
      return '通过';
    }
    case 2: {
      return '不通过';
    }
    case 3: {
      return '未检测';
    }
  }
}
/**
 * 获取投料完成状态文本
 * 功能：将数值型完成状态转换为可读文本
 *
 * @param row - 包含isClear属性的行数据对象
 * @returns 对应中文状态文本
 *
 * 注意事项：
 * - 状态码映射关系：
 *   1 -> 未完成
 *   2 -> 已完成
 * - 新增状态码时需要扩展case分支
 * - 当前未处理未定义状态码的返回值
 * - 用于表格isClear列的显示
 */
function getIsClearText(row: any) {
  switch (row.isClear) {
    case 1: {
      return '未完成';
    }
    case 2: {
      return '已完成';
    }
  }
}

// endregion

// region 投料
// 是否显示投料抽屉
const showDrawer = ref(false);
// 编辑对象数据
const editMessage = ref({} as any);
// 编辑对单数据
const editMessageForm = ref();
// 编辑对象表单验证规则
const editRules = ref({
  materialCode: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  feedNumber: [{ message: '此项为必填项', required: true, trigger: 'change' }],
} as any);

/**
 * 打开物料投料编辑抽屉
 * 功能：初始化投料表单并显示编辑界面
 *
 * @param row - 当前操作的物料行数据
 *
 * 接口参数结构：
 * {
 *   materialCode: 物料编号,
 *   workstationCode: 工作站编码,
 *   equipCode: 设备编码,
 *   worksheetCode: 工单编号,
 *   bindingId: 工序绑定ID,
 *   functionId: 工步ID
 * }
 *
 * 注意事项：
 * - 会更新全局状态showDrawer控制抽屉显隐
 * - 携带当前物料基础信息及上下文参数用于后续提交
 * - 需与Drawer组件配合使用
 */
function editRow(row: any) {
  showDrawer.value = true;
  editMessage.value = {
    materialCode: row.materialCode,
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
  };
}

/**
 * 关闭投料编辑抽屉
 * 功能：重置表单状态并隐藏编辑界面
 *
 * 注意事项：
 * - 会清空当前编辑的投料表单数据
 * - 会更新全局状态showDrawer控制抽屉显隐
 * - 与editRow函数构成开/关配对操作
 * - 通过响应式对象editMessage.value的置空实现表单重置
 */
function onClose() {
  showDrawer.value = false;
  editMessage.value = {};
}

/**
 * 提交投料表单数据
 * 功能：验证并提交物料投料信息
 * 流程：
 * 1. 执行表单字段校验
 * 2. 组装工作站、设备等上下文参数
 * 3. 调用投料接口提交数据
 * 4. 成功后刷新表格数据并关闭抽屉
 *
 * 接口参数结构：
 * feedingMaterials - 物料投料提交接口
 * {
 *   materialCode: 物料编号,
 *   workstationCode: 工作站编码,
 *   equipCode: 设备编码,
 *   worksheetCode: 工单编号,
 *   bindingId: 工序绑定ID,
 *   functionId: 工步ID,
 *   labelCode: 物料标签编号,
 *   feedNumber: 投入数量
 * }
 *
 * 注意事项：
 * - 必须通过Ant Design表单验证才能提交
 * - 提交成功后自动刷新表格最新数据
 * - 使用国际化机制处理成功提示信息
 * - 未处理接口异常情况，需补充错误处理逻辑
 */
function submit() {
  editMessageForm.value.validate().then(() => {
    feedingMaterials(editMessage.value).then(() => {
      message.success($t('common.successfulOperation'));
      gridApi.reload();
      onClose();
    });
  });
}

/**
 * 处理物料投料完成操作
 * 功能：确认并提交物料投料完成状态
 * 流程：
 * 1. 弹出确认对话框进行二次确认
 * 2. 用户确认后调用投料完成接口
 * 3. 成功后刷新表格数据并提示操作结果
 *
 * @param row - 包含物料编号等信息的行数据对象
 *
 * 接口参数结构：
 * feedingComplete - 物料投料完成接口
 * {
 *   materialCode: 物料编号,
 *   workstationCode: 工作站编码,
 *   equipCode: 设备编码,
 *   worksheetCode: 工单编号,
 *   bindingId: 工序绑定ID,
 *   functionId: 工步ID
 * }
 *
 * 注意事项：
 * - 使用Ant Design Modal组件进行危险操作确认
 * - 集成上下文参数确保接口调用完整性
 * - 操作成功后自动刷新表格最新状态
 * - 使用国际化机制处理成功提示信息
 * - 当前未处理接口异常情况，需补充错误处理逻辑
 */
function feedingCompleteFun(row: any) {
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
      // 弹出警告提示，提示用户取消了操作
      message.warning('已取消操作!');
    },

    // 用户确认操作时触发的回调函数
    onOk() {
      feedingComplete({
        materialCode: row.materialCode,
        workstationCode: props.workstationCode,
        equipCode: props.equipCode,
        worksheetCode: props.worksheetCode,
        bindingId: props.bindingId,
        functionId: props.functionId,
      }).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },

    // 确认框的标题文本
    title: '是否确认投料完成?',
  });
}
// endregion
</script>

<template>
  <div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 前工步执行状况 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.implementationStatus') }}
      </span>
      <span :class="getValueClass()">
        <!--        {{ obtainTheDeviceCleanStatus(3) }}-->
        {{ details?.lastFeedFlagName }}
      </span>
    </div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 当前设备投料模式 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.currentDeviceFeedingMode') }}
      </span>
      <!-- 手动 -->
      <span :class="getValueClass()">
        {{ details?.feedModelName }}
      </span>
    </div>
  </div>
  <Grid>
    <template #feedCheckFlag="{ row }">
      {{ getFeedCheckFlagText(row) }}
    </template>
    <template #isClear="{ row }">
      {{ getIsClearText(row) }}
    </template>
    <template #action="{ row }">
      <!-- 扫码按钮 -->
      <Tooltip>
        <template #title>
          {{ $t('common.scanTheCodeAndFeedTheMaterial') }}
        </template>
        <Button
          :icon="h(MdQrcodeScan, { class: 'inline-block size-6' })"
          class="mr-4"
          type="link"
          @click="editRow(row)"
          :disabled="row.isClear === 2"
        />
        <!--       -->
      </Tooltip>
      <!-- 完成按钮 -->
      <Tooltip>
        <template #title>{{ $t('common.feedingComplete') }}</template>
        <Button
          :icon="h(CarbonTaskComplete, { class: 'inline-block size-6' })"
          class="mr-4"
          type="link"
          @click="feedingCompleteFun(row)"
          :disabled="row.isClear === 2"
        />
      </Tooltip>
    </template>
  </Grid>
  <Drawer
    v-model:open="showDrawer"
    :footer-style="{ textAlign: 'right' }"
    :width="600"
    class="custom-class"
    placement="right"
    root-class-name="root-class-name"
    title="物料投料"
    @close="onClose"
  >
    <Form
      :label-col="{ span: 6 }"
      :model="editMessage"
      :rules="editRules"
      :wrapper-col="{ span: 18 }"
      autocomplete="off"
      ref="editMessageForm"
    >
      <!-- 物料编号 -->
      <FormItem
        :label="$t('productionOperation.materialNumber')"
        name="materialCode"
      >
        <Input v-model:value="editMessage.materialCode" disabled />
      </FormItem>
      <!-- 标签编号 -->
      <FormItem :label="$t('productionOperation.labelNumber')" name="ruleName">
        <Input v-model:value="editMessage.labelCode" />
      </FormItem>
      <!-- 投入量 -->
      <FormItem
        :label="$t('productionOperation.inputQuantity')"
        name="feedNumber"
      >
        <InputNumber v-model:value="editMessage.feedNumber" addon-after="KG" />
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <!-- 取消 -->
        <Button @click="onClose">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 打印 -->
        <Button type="primary" @click="submit">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped></style>
