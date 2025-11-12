<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, ref } from 'vue';

import { MdiSearch } from '@vben/icons';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  RadioGroup,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteQualityCheckStandard,
  exportQualityCheckItem,
  insertQualityCheckStandard,
  queryMeasureMethodList,
  queryQualityCheckItemStandard,
  queryQualityCheckStandardById,
  queryStandardProduct,
  updateQualityCheckStandard,
} from '#/api';

// region 表格

/**
 * 表格配置项
 * 定义了质检标准表格的列信息、高度、排序等配置
 */
const gridOptions: VxeGridProps<any> = {
  align: 'center', // 内容居中对齐
  border: true, // 显示表格边框

  rowConfig: {
    drag: true, // 允许行拖拽
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'standardTypeName', title: '标准类型', minWidth: 100 },
    { field: 'productCode', title: '产品编号', minWidth: 150 },
    { field: 'itemName', title: '质检项名称', minWidth: 200 },
    { field: 'measureMethodName', title: '测量方法', minWidth: 120 },
    { field: 'measureMethodTypeName', title: '测量类型', minWidth: 80 },
    { field: 'judgeDescription', title: '判定要求', minWidth: 150 },
    { field: 'numberTypeName', title: '数值类型', minWidth: 120 },
    { field: 'standardValue', title: '标准值', minWidth: 120 },
    { field: 'upperTolerance', title: '最大值', minWidth: 80 },
    { field: 'lowerTolerance', title: '最小值', minWidth: 150 },
    { field: 'unit', title: '单位', minWidth: 80 },
    { field: 'operateUserName', title: '操作人', minWidth: 150 },
    { field: 'operateTime', title: '操作时间', minWidth: 220 },
    {
      title: '操作',
      minWidth: 150,
      fixed: 'right',
      slots: {
        default: 'action',
      },
    },
  ],
  height: 500, // 表格高度
  stripe: true, // 启用斑马纹
  sortConfig: {
    multiple: true, // 允许多列排序
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        return await queryData({
          // 调用查询数据方法
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true, // 使用自定义工具栏
    refresh: true, // 显示刷新按钮
    zoom: true, // 显示缩放按钮
  },
};

/**
 * 表格事件配置
 */
const gridEvents: any = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

/**
 * 创建表格实例和API
 */
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 查询参数对象
 */
const queryParams = ref<any>({});

/**
 * 查询数据函数
 * 根据当前的查询参数、分页信息，从后端服务查询质检标准数据
 * @param {object} params - 查询参数对象
 * @param {number} params.page - 当前页码
 * @param {number} params.pageSize - 每页显示条数
 * @returns {Promise<object>} 返回包含总条数和数据列表的Promise对象
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 构建查询参数对象
    const params = {
      ...queryParams.value,
      pageNum: page, // 当前页码
      pageSize, // 每页显示条数
    };

    // 如果标准类型为-1（全部），则删除该参数
    if (params.standardType === -1) {
      delete params.standardType;
    }

    // 调用API查询数据
    queryQualityCheckItemStandard(params)
      .then(({ total, results }) => {
        // 成功时解析Promise，返回总条数和数据列表
        resolve({
          total,
          items: results,
        });
      })
      .catch((error) => {
        // 失败时拒绝Promise
        reject(error);
      });
  });
}

// endregion

// region 抽屉基本操作
/**
 * 抽屉是否打开的状态
 */
const isOpen = ref(false);

/**
 * 质检项详情数据
 */
const details = ref<any>({});

/**
 * 打开抽屉并加载质检项详情
 * @param {object} row - 质检项数据行
 */
function openDrawer(row: any) {
  isOpen.value = true; // 打开抽屉
  details.value = { ...row };
  queryParams.value = {
    itemCode: details.value.itemCode, // 设置查询条件为当前质检项的编号
  };
  queryTheListOfMeasurementMethods(); // 查询度量方法列表
}

/**
 * 关闭抽屉
 */
function closeDrawer() {
  isOpen.value = false;
}

// endregion

// region 模板基本信息编辑 / 新增
/**
 * 编辑表单引用
 */
const editForm = ref();

/**
 * 编辑抽屉是否显示的状态
 */
const showDrawer = ref(false);

/**
 * 编辑的质检标准信息
 */
const editMessage = ref<any>({});

/**
 * 编辑表单的验证规则
 */
const editRules = ref({
  standardType: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  productCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  measureMethodType: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  measureMethodName: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  judgeDescription: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  numberType: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  standardValue: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  upperTolerance: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  lowerTolerance: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
} as any);

/**
 * 标准类型列表
 */
const standardTypeList = [
  { label: '全部', value: -1 },
  { label: '通用', value: 1 },
  { label: '专用', value: 2 },
];

/**
 * 度量类型列表
 */
const metricType = [
  { value: 1, label: '数值型' },
  { value: 2, label: '判断型' },
  { value: 3, label: '文本型' },
  { value: 5, label: '录入型' },
];

/**
 * 数值类型列表
 */
const numberTypeList = [
  { value: 1, label: '单值' },
  { value: 2, label: '多值' },
];

/**
 * 显示编辑抽屉
 * @param {object} row - 可选，要编辑的数据行，不传则为新增模式
 */
function showEdit(row?: any) {
  if (row) {
    // 编辑模式，根据ID查询详细信息
    queryQualityCheckStandardById(row.id).then((data) => {
      editMessage.value = { ...data };
    });
  } else {
    // 新增模式，初始化表单数据
    editMessage.value = {
      qcItemCode: details.value.itemCode,
      qcItemName: details.value.itemName,
      detail: undefined,
    };
  }
  showDrawer.value = true;
}

/**
 * 表单提交函数
 * 根据是否存在ID来决定是新增还是更新操作
 */
function submit() {
  editForm.value.validate().then(() => {
    const params = { ...editMessage.value };

    // 如果没有itemCode，从details中获取
    if (!params.itemCode) {
      params.itemCode = details.value.itemCode;
    }

    // 关键代码：根据是否存在ID来决定调用新增API还是更新API
    // 如果params.id存在，调用updateQualityCheckStandard更新数据
    // 如果params.id不存在，调用insertQualityCheckStandard新增数据
    const ob = params.id
      ? updateQualityCheckStandard(params)
      : insertQualityCheckStandard(params);

    ob.then(() => {
      message.success($t('common.successfulOperation'));
      close(); // 关闭抽屉
      gridApi.reload(); // 刷新表格数据
    });
  });
}

/**
 * 关闭编辑抽屉并重置表单数据
 */
function close() {
  editMessage.value = {};
  showDrawer.value = false;
}

// endregion

// region 删除

/**
 * 处理删除操作
 * @param {object} row - 要删除的数据行
 */
function delRow(row: any) {
  // 弹出确认对话框
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消删除!');
    },
    onOk() {
      // 调用删除API
      deleteQualityCheckStandard(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload(); // 刷新表格数据
      });
    },
    title: '是否确认删除?',
  });
}

// endregion

// region 查询度量方法列表

/**
 * 度量方法列表数据
 */
const listOfMeasurementMethods = ref<any[]>([]);

/**
 * 查询度量方法列表
 */
function queryTheListOfMeasurementMethods() {
  queryMeasureMethodList().then(({ results }) => {
    listOfMeasurementMethods.value = results.map((item: any) => ({
      label: item.measureMethodName,
      value: item.measureMethodName,
    }));
  });
}

// endregion

// region 查询质检标准产品

/**
 * 产品列表数据
 */
const productList = ref<any>([]);

/**
 * 根据产品编号查询产品信息
 * @param {string} value - 产品编号
 */
function queryProduct(value: string) {
  if (value) {
    queryStandardProduct({
      productCode: value,
    }).then((data) => {
      productList.value = data.map((item: any) => ({
        label: item,
        value: item,
      }));
    });
  }
}

// endregion

// region 导出

/**
 * 导出质检项数据
 */
function exportFile() {
  const params: any = { ...queryParams.value };
  exportQualityCheckItem(params).then((data) => {
    window.open(data); // 打开下载链接
  });
}

// endregion

// region 暴露方法

// 暴露openDrawer方法给父组件调用
defineExpose({
  openDrawer,
});

// endregion
</script>

<template>
  <!-- 质检标准列表抽屉组件 -->
  <Drawer
    v-model:open="isOpen"
    height="80%"
    placement="bottom"
    :title="
      $t('qualityModule.qualityCheck.qualityBaseSet.formQualityCheckItem.title')
    "
    @close="closeDrawer"
  >
    <!-- 质检项基本信息描述 -->
    <Descriptions
      :column="3"
      bordered
      :title="
        $t('qualityModule.qualityCheck.qualityBaseSet.standardItem.basic')
      "
    >
      <!-- 质检项编号 -->
      <DescriptionsItem
        :label="
          $t(
            'qualityModule.qualityCheck.qualityBaseSet.qualityCheckDetail.code',
          )
        "
      >
        {{ details.itemCode }}
      </DescriptionsItem>
      <!-- 质检项名称 -->
      <DescriptionsItem
        :label="
          $t(
            'qualityModule.qualityCheck.qualityBaseSet.qualityCheckDetail.name',
          )
        "
      >
        {{ details.itemName }}
      </DescriptionsItem>
      <!-- 所属工序 -->
      <DescriptionsItem
        :label="
          $t(
            'qualityModule.qualityCheck.qualityBaseSet.formQualityCheckItem.process',
          )
        "
      >
        {{ details.produceName }}
      </DescriptionsItem>
      <!-- 特殊特性名称 -->
      <DescriptionsItem
        :label="
          $t('qualityModule.qualityCheck.qualityBaseSet.specialMaintain.name')
        "
      >
        {{ details.specialCharacterName }}
      </DescriptionsItem>
      <!-- 特殊特性符号 -->
      <DescriptionsItem
        :label="
          $t('qualityModule.qualityCheck.qualityBaseSet.specialMaintain.symbol')
        "
      >
        {{ details.specialCharacterSymbol }}
      </DescriptionsItem>
    </Descriptions>

    <!-- 查询表单 -->
    <Form :model="queryParams" layout="inline" class="mt-4">
      <!-- 产品编号输入框 -->
      <FormItem
        :label="
          $t('qualityModule.qualityCheck.qualityBaseSet.standardItem.code')
        "
        style="margin-bottom: 1em"
      >
        <Input v-model:value="queryParams.productCode" />
      </FormItem>
      <!-- 标准类型选择器 -->
      <FormItem
        :label="
          $t('qualityModule.qualityCheck.qualityBaseSet.standardItem.type')
        "
        style="margin-bottom: 1em"
      >
        <RadioGroup
          v-model:value="queryParams.standardType"
          :options="standardTypeList"
        />
      </FormItem>
      <!-- 度量类型选择器 -->
      <FormItem
        :label="
          $t(
            'qualityModule.qualityCheck.qualityBaseSet.standardItem.metricType',
          )
        "
        style="margin-bottom: 1em"
      >
        <Select
          v-model:value="queryParams.measureMethodType"
          :options="metricType"
          class="!w-48"
          allow-clear
        />
      </FormItem>
      <!-- 度量方法选择器 -->
      <FormItem
        :label="
          $t(
            'qualityModule.qualityCheck.qualityBaseSet.standardItem.measureMethod',
          )
        "
        style="margin-bottom: 1em"
      >
        <Select
          v-model:value="queryParams.measureMethodName"
          :options="listOfMeasurementMethods"
          class="!w-48"
          allow-clear
        />
      </FormItem>

      <!-- 查询按钮 -->
      <FormItem style="margin-bottom: 1em">
        <Button
          :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
          type="primary"
          @click="
            () => {
              gridApi.reload();
            }
          "
        >
          {{ $t('common.search') }}
        </Button>
      </FormItem>
    </Form>

    <!-- 渲染质检标准表格组件 -->
    <Grid v-if="isOpen">
      <template #toolbar-tools>
        <!-- 新增按钮 -->
        <Button type="primary" @click="showEdit()" class="mx-2">
          {{ $t('common.add') }}
        </Button>
        <!-- 导出按钮 -->
        <Button type="primary" @click="exportFile()">
          {{ $t('common.export') }}
        </Button>
      </template>
      <template #action="{ row }">
        <!-- 编辑按钮 -->
        <Tooltip>
          <template #title>{{ $t('common.edit') }}</template>
          <Button class="mr-4" type="link" @click="showEdit(row)">
            <Icon
              icon="mdi:edit-outline"
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </Tooltip>
        <!-- 删除按钮 -->
        <Tooltip>
          <template #title>{{ $t('common.delete') }}</template>
          <Button type="link" @click="delRow(row)" danger class="px-1">
            <Icon
              icon="mdi:delete-forever-outline"
              class="inline-block align-middle text-2xl"
            />
          </Button>
        </Tooltip>
      </template>
    </Grid>
  </Drawer>

  <!-- 新增/编辑质检标准抽屉 -->
  <Drawer
    v-model:open="showDrawer"
    :footer-style="{ textAlign: 'right' }"
    :width="600"
    class="custom-class"
    placement="right"
    root-class-name="root-class-name"
    title="信息编辑"
  >
    <!-- 质检标准编辑表单 -->
    <Form
      ref="editForm"
      :label-col="{ span: 8 }"
      :model="editMessage"
      :rules="editRules"
      :wrapper-col="{ span: 16 }"
      name="editMessageForm"
    >
      <!-- 标准类型 -->
      <FormItem
        :label="
          $t('qualityModule.qualityCheck.qualityBaseSet.standardItem.type')
        "
        name="standardType"
      >
        <RadioGroup v-model:value="editMessage.standardType">
          <template v-for="item in standardTypeList" :key="item.value">
            <Radio
              :label="item.value"
              :value="item.value"
              v-if="item.value !== -1"
            >
              {{ item.label }}
            </Radio>
          </template>
        </RadioGroup>
      </FormItem>
      <!-- 质检项（当标准类型为专用时显示） -->
      <FormItem
        :label="
          $t(
            'qualityModule.qualityCheck.qualityBaseSet.formQualityCheckItem.name',
          )
        "
        name="productCode"
        v-if="editMessage.standardType === 2"
      >
        <Select
          v-model:value="editMessage.productCode"
          :options="productList"
          :placeholder="$t('ui.placeholder.input')"
          show-search
          :default-active-first-option="false"
          :show-arrow="false"
          :filter-option="false"
          :not-found-content="null"
          @search="queryProduct"
        />
      </FormItem>
      <!-- 度量类型 -->
      <FormItem
        :label="
          $t(
            'qualityModule.qualityCheck.qualityBaseSet.standardItem.metricType',
          )
        "
        name="measureMethodType"
      >
        <Select
          v-model:value="editMessage.measureMethodType"
          :options="metricType"
          class="!w-48"
          allow-clear
        />
      </FormItem>

      <!-- 度量方法 -->
      <FormItem
        :label="
          $t(
            'qualityModule.qualityCheck.qualityBaseSet.standardItem.measureMethod',
          )
        "
        name="measureMethodName"
      >
        <Select
          v-model:value="editMessage.measureMethodName"
          :options="listOfMeasurementMethods"
          class="!w-48"
          allow-clear
        />
      </FormItem>
      <!-- 判定描述 -->
      <FormItem
        :label="
          $t(
            'qualityModule.qualityCheck.qualityBaseSet.standardItem.judgeDescription',
          )
        "
        name="judgeDescription"
      >
        <Input v-model:value="editMessage.judgeDescription" />
      </FormItem>

      <!-- 当度量类型为数值型时显示的字段 -->
      <template v-if="editMessage.measureMethodType === 1">
        <!-- 数值类型 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.standardItem.numberType',
            )
          "
          name="numberType"
        >
          <RadioGroup
            v-model:value="editMessage.numberType"
            :options="numberTypeList"
            class="!w-48"
            allow-clear
          />
        </FormItem>
        <!-- 标准值 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.standardItem.standardValue',
            )
          "
          name="standardValue"
        >
          <InputNumber v-model:value="editMessage.standardValue" />
        </FormItem>
        <!-- 最大值 -->
        <FormItem
          :label="
            $t('qualityModule.qualityCheck.qualityBaseSet.standardItem.max')
          "
          name="numberType"
        >
          <InputNumber v-model:value="editMessage.upperTolerance" />
        </FormItem>
        <!-- 最小值 -->
        <FormItem
          :label="
            $t('qualityModule.qualityCheck.qualityBaseSet.standardItem.min')
          "
          name="lowerTolerance"
        >
          <InputNumber v-model:value="editMessage.lowerTolerance" />
        </FormItem>
        <!-- 单位 -->
        <FormItem
          :label="
            $t('qualityModule.qualityCheck.qualityBaseSet.standardItem.unit')
          "
          name="unit"
        >
          <Input v-model:value="editMessage.unit" />
        </FormItem>
      </template>
    </Form>

    <!-- 表单底部按钮 -->
    <template #footer>
      <Space>
        <!-- 取消按钮 -->
        <Button @click="close">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认按钮 -->
        <Button type="primary" @click="submit">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped></style>
