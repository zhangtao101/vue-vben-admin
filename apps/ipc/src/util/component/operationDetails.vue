<script setup lang="ts">
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Row,
  Select,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  detailInTaskEnout, detailOutTaskEnout,
  formFinishEnout,
  getDetailByCodeEnout,
  getDetailInAreaCodeEnout,
  getDetailOutTaskEnout,
} from '#/api';

/**
 * 操作详情组件
 * 用于制造执行系统中的出入库操作详情管理和执行
 * 主要功能：
 * 1. 显示出入库单据的基本信息
 * 2. 展示单据的物料明细列表
 * 3. 支持手动执行入库和出库作业
 * 4. 动态显示不同操作类型的表单界面
 * 5. 支持储位编码的选择和物料信息展示
 * 业务场景：仓库管理员查看单据详情并执行实际的出入库操作
 */

// 定义组件事件，用于通知父组件关闭操作
const emit = defineEmits(['close']);
// region 明细表格配置

/**
 * 明细表格配置选项
 * 用于展示和编辑出入库单据的物料明细信息
 * 支持动态配置操作列，根据不同场景显示或隐藏操作按钮
 */
const addGridOptions: VxeGridProps<any> = {
  align: 'center', // 表格内容居中对齐
  border: true, // 显示表格边框
  columns: [
    { title: '序号', type: 'seq', width: 50 }, // 自动序号列
    { field: 'materialCode', title: '料号', minWidth: 150 }, // 物料的唯一编码
    { field: 'materialName', title: '物料名称', minWidth: 150 }, // 物料的描述性名称
    { field: 'materialDescriptionId', title: '物料特征', minWidth: 150 }, // 物料的特征标识
    { field: 'number', title: '数量', minWidth: 150 }, // 物料数量
    { field: 'unit', title: '单位', minWidth: 150 }, // 物料计量单位
    {
      field: 'detailState',
      title: '执行状态',
      minWidth: 150, // 物料明细的执行状态
      slots: { default: 'detailState' }, // 使用插槽自定义状态显示
    },
  ],
  pagerConfig: {
    enabled: false, // 明细表格数据量较小，不启用分页
  },
  height: 300, // 表格固定高度
  stripe: true, // 显示斑马纹效果，提高可读性
  sortConfig: {
    multiple: true, // 启用多列排序功能
  },
  toolbarConfig: {
    custom: true, // 允许自定义列显示
    refresh: false, // 禁用刷新按钮，避免数据冲突
    zoom: true, // 显示缩放按钮
  },
};

/**
 * 明细表格事件监听器
 * 当前未定义特定事件，保留扩展能力
 */
const addGridEvents: VxeGridListeners<any> = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

/**
 * 明细表格实例和API变量
 * 延迟初始化，在打开抽屉时根据配置创建
 */
let Grid: any;
let gridApi: any;

/**
 * 执行状态映射表
 * 将数字状态码转换为中文显示文本
 * -1: 待执行 - 尚未开始处理的物料
 * 1: 执行中 - 正在处理中的物料
 * 2: 已完成 - 处理完成的物料
 */
const detailStateMap: {
  [key: string]: string;
} = {
  '-1': '待执行',
  '1': '执行中',
  '2': '已完成',
};

// endregion

/**
 * 操作详情抽屉组件的显示状态
 * 控制整个抽屉的显示和隐藏
 */
const visible = ref(false);

/**
 * 操作详情数据对象
 * 存储当前选中的出入库单据的详细信息
 */
const details = ref();

/**
 * 打开操作详情抽屉
 * 根据参数动态配置表格列，并初始化数据查询
 * @param row 操作详情数据行，包含单据基本信息
 * @param showOptions 是否显示操作列，true显示操作按钮，false隐藏
 */
function openDrawer(row: any, showOptions = false) {
  // 根据showOptions参数动态配置表格列
  addGridOptions.columns = addGridOptions.columns?.filter(
    (item) => item.field !== 'action', // 先移除操作列
  );

  if (showOptions) {
    // 如果需要显示操作，则添加操作列
    addGridOptions.columns?.push({
      field: 'action',
      fixed: 'right', // 操作列固定在右侧
      slots: { default: 'action' }, // 使用插槽自定义操作按钮
      title: '操作',
      width: 220, // 操作列宽度
    });
  }

  // 延迟创建表格实例，确保配置生效
  [Grid, gridApi] = useVbenVxeGrid({
    gridEvents: addGridEvents,
    gridOptions: addGridOptions,
  });

  visible.value = true; // 显示抽屉
  details.value = row; // 设置单据详情数据
  queryDetails(row); // 查询物料明细
}

/**
 * 查询单据的物料明细信息
 * 根据单据编码获取对应的物料明细列表
 * @param row 单据行数据
 */
function queryDetails(row: any) {
  getDetailByCodeEnout({ formCode: row.formCode }).then((res) => {
    gridApi.grid.insert(res); // 将查询结果插入表格
  });
}

/**
 * 抽屉关闭事件处理
 * 清理作业状态并通知父组件
 */
function afterClose() {
  closeTheAssignment(); // 结束当前作业
  visible.value = false; // 隐藏抽屉
  emit('close'); // 通知父组件关闭事件
}

/**
 * 提交操作详情并完成整个单据
 * 调用表单完成接口，将单据状态标记为已完成
 */
function submit() {
  formFinishEnout({
    formCode: details.value.formCode, // 传入单据编码
  }).then(() => {
    message.success($t('common.successfulOperation')); // 显示成功提示
    afterClose(); // 关闭抽屉并清理状态
  });
}
// endregion

// region 手动作业功能

/**
 * 作业数据对象
 * 存储当前执行作业的物料信息和操作参数
 */
const jobData = ref<any>({});

/**
 * 储位编码列表
 * 用于入库或出库操作的储位选择下拉框
 */
const areaCodeList = ref<any>([]);

/**
 * 下拉框筛选函数
 * 用于储位编码的模糊搜索筛选
 * @param input 用户输入的筛选值
 * @param option 下拉框选项对象
 */
const filterOption = (input: string, option: any) => {
  return option.storageCode.toLowerCase().includes(input.toLowerCase());
};

/**
 * 开始手动作业
 * 根据单据类型（入库/出库）显示对应的操作界面
 * @param row 操作详情数据行
 */
function startTheAssignment(row: any) {
  jobData.value = { ...row }; // 复制行数据到作业对象

  // 根据单据的出入库类型显示不同的操作界面
  if (details.value.enterOut === 1) {
    // 入库单据：显示入库操作界面
    displaysTheInboundOperation.value = true;
    displaysTheOutboundOperation.value = false;
    queryInAreaCode(); // 查询入库储位编码
  } else {
    // 出库单据：显示出库操作界面
    displaysTheOutboundOperation.value = true;
    displaysTheInboundOperation.value = false;
    queryOutAreaCode(); // 查询出库储位编码
  }
}

/**
 * 结束作业操作
 * 隐藏所有操作界面，清空作业数据
 */
function closeTheAssignment() {
  displaysTheOutboundOperation.value = false; // 隐藏出库操作界面
  displaysTheInboundOperation.value = false; // 隐藏入库操作界面
  jobData.value = {}; // 清空作业数据
}

// region 入库操作功能

/**
 * 入库操作界面的显示状态控制
 */
const displaysTheInboundOperation = ref(false);

/**
 * 查询入库储位编码列表
 * 根据单据编码和物料编码查询可用的入库储位
 */
function queryInAreaCode() {
  getDetailInAreaCodeEnout({
    formCode: details.value.formCode, // 单据编码
    materialCode: jobData.value.materialCode, // 物料编码
  }).then((res) => {
    areaCodeList.value = res; // 设置储位选择列表
  });
}

/**
 * 入库操作提交
 * 构建入库操作参数并调用接口提交
 */
function inSubmit() {
  // 构建入库操作参数
  const params = {
    ...jobData.value, // 作业数据（箱码、储位等）
    formCode: details.value.formCode, // 单据编码
    opFuncationType: 2, // 操作类型：2表示入库
  };
  detailInTaskEnout(params).then(() => {
    message.success($t('common.successfulOperation')); // 显示成功提示
    closeTheAssignment(); // 结束作业操作
  });
}
/**
 * 出库操作提交
 * 构建入库操作参数并调用接口提交
 */
function outSubmit() {
  // 构建入库操作参数
  const params = {
    ...jobData.value, // 作业数据（箱码、储位等）
    formCode: details.value.formCode, // 单据编码
    opFuncationType: 2, // 操作类型：2表示入库
  };
  detailOutTaskEnout(params).then(() => {
    message.success($t('common.successfulOperation')); // 显示成功提示
    closeTheAssignment(); // 结束作业操作
  });
}

// endregion

// region 出库操作功能

/**
 * 出库操作界面的显示状态控制
 */
const displaysTheOutboundOperation = ref(false);

/**
 * 查询出库储位编码列表
 * 根据单据编码和物料特征ID查询可用的出库储位
 */
function queryOutAreaCode() {
  getDetailOutTaskEnout({
    formCode: details.value.formCode, // 单据编码
    materialDescriptionId: jobData.value.materialDescriptionId, // 物料特征ID
  }).then((res) => {
    areaCodeList.value = res; // 设置储位选择列表
  });
}

/**
 * 出库箱码选择变化处理
 * 当用户选择不同的箱码时，更新相关的作业信息
 * @param _value 选择的箱码值（未使用）
 * @param item 选中的箱码对象
 */
function packingCodeChange(_value: any, item: any) {
  jobData.value.warehouseAreaCode = item.storageCode; // 设置储位编码
  jobData.value.a = item.stockQuality; // 设置库存质量
  jobData.value.unit = item.unit; // 设置单位
}
// endregion

// endregion

// region 组件方法暴露

/**
 * 暴露 openDrawer 方法给父组件调用
 * 父组件可以通过 ref.openDrawer() 来打开操作详情抽屉
 */
defineExpose({
  openDrawer,
});

// endregion
</script>

<!--
  操作详情组件模板
  包含单据基本信息展示、物料明细表格、入库操作界面、出库操作界面
  根据单据类型动态显示不同的操作界面
-->
<template>
  <Drawer
    v-model:open="visible"
    :footer-style="{ textAlign: 'right' }"
    height="80%"
    placement="top"
    :title="$t('ioBillOperation.manualJobs')"
    @close="afterClose"
  >
    <!-- 单据基本信息展示区域 -->
    <Row>
      <!-- 单据编号 -->
      <Col :span="8">
        <span class="mr-4 text-xl">{{ $t('ioBillOperation.ioBillCode') }}</span>
        <span class="mr-4 text-xl">{{ details?.formCode || '-' }}</span>
      </Col>
      <!-- 单据类型 -->
      <Col :span="8">
        <span class="mr-4 text-xl">{{ $t('ioBillOperation.type') }}</span>
        <span class="mr-4 text-xl">{{ details?.enterOutName }}</span>
      </Col>
      <!-- 单据时间 -->
      <Col :span="8">
        <span class="mr-4 text-xl">{{ $t('ioBillOperation.time') }}</span>
        <span class="mr-4 text-xl">{{ details?.operateDate || '-' }}</span>
      </Col>
    </Row>

    <!-- 物料明细表格区域 -->
    <div v-if="Grid && visible">
      <Grid v-if="visible">
        <template #detailState="{ row }">
          <!-- 执行状态显示，使用映射表转换状态码 -->
          {{ detailStateMap[`${row.detailState}`] || '-' }}
        </template>
        <template #action="{ row }">
          <!-- 开始作业按钮，点击后显示对应的手动操作界面 -->
          <Button type="link" @click="startTheAssignment(row)">
            {{ $t('ioBillOperation.startJob') }}
          </Button>
        </template>
      </Grid>
    </div>
    <!-- 入库操作界面 -->
    <div v-if="displaysTheInboundOperation">
      <Card
        class="my-4 bg-green-200"
        :title="$t('ioBillOperation.performTaskLists')"
      >
        <Form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
          <Row :gutter="24">
            <Col :span="8">
              <!-- 箱码输入 -->
              <FormItem :label="$t('ioBillOperation.boxCode')">
                <Input v-model:value="jobData.packingCode" />
              </FormItem>
            </Col>
            <Col :span="8">
              <!-- 储位选择下拉框 -->
              <FormItem :label="$t('ioBillOperation.storagePosition')">
                <Select
                  v-model:value="jobData.warehouseAreaCode"
                  show-search
                  :field-names="{ label: 'storageName', value: 'storageCode' }"
                  :options="areaCodeList"
                  :filter-option="filterOption"
                />
              </FormItem>
            </Col>
          </Row>
          <Row :gutter="24">
            <Col :span="8">
              <!-- 料号显示（只读） -->
              <FormItem :label="$t('ioBillOperation.materialCode')">
                {{ jobData?.materialCode || '-' }}
              </FormItem>
            </Col>
            <Col :span="8">
              <!-- 物料名称显示（只读） -->
              <FormItem :label="$t('ioBillOperation.materialName')">
                {{ jobData?.materialName || '-' }}
              </FormItem>
            </Col>
            <Col :span="8">
              <!-- 物料特征显示（只读） -->
              <FormItem :label="$t('ioBillOperation.materialFeature')">
                {{ jobData?.materialDescription || '-' }}
              </FormItem>
            </Col>
          </Row>
          <Row :gutter="24">
            <Col :span="8">
              <!-- 数量显示（只读） -->
              <FormItem :label="$t('ioBillOperation.number')">
                {{ jobData?.number || '-' }}
              </FormItem>
            </Col>
            <Col :span="8">
              <!-- 单位显示（只读） -->
              <FormItem :label="$t('ioBillOperation.unit')">
                {{ jobData?.unit || '-' }}
              </FormItem>
            </Col>
          </Row>
          <Row :gutter="24">
            <Col :span="8" :offset="16">
              <!-- 操作按钮区域 -->
              <FormItem :wrapper-col="{ span: 24 }">
                <!-- 确认按钮，点击后提交入库操作 -->
                <Button type="primary" @click="inSubmit" class="my-4 w-full">
                  {{ $t('common.confirm') }}
                </Button>
                <!-- 取消按钮，点击后关闭入库操作界面 -->
                <Button @click="closeTheAssignment" class="w-full">
                  {{ $t('common.cancel') }}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
    <!-- 出库操作界面 -->
    <div v-if="displaysTheOutboundOperation">
      <Card
        class="my-4 bg-green-200"
        :title="$t('ioBillOperation.performTaskLists')"
      >
        <Form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
          <Row :gutter="24">
            <Col :span="8">
              <!-- 箱码选择下拉框（出库操作需要选择已有箱码） -->
              <FormItem :label="$t('ioBillOperation.boxCode')">
                <Input v-model:value="jobData.packingCode" />
                <Select
                  v-model:value="jobData.packingCode"
                  show-search
                  :field-names="{ label: 'labelCode', value: 'labelCode' }"
                  :options="areaCodeList"
                  :filter-option="filterOption"
                  @change="packingCodeChange"
                />
              </FormItem>
            </Col>
          </Row>
          <Row :gutter="24">
            <Col :span="8">
              <!-- 料号显示（只读） -->
              <FormItem :label="$t('ioBillOperation.materialCode')">
                {{ jobData?.materialCode || '-' }}
              </FormItem>
            </Col>
            <Col :span="8">
              <!-- 物料名称显示（只读） -->
              <FormItem :label="$t('ioBillOperation.materialName')">
                {{ jobData?.materialName || '-' }}
              </FormItem>
            </Col>
            <Col :span="8">
              <!-- 物料特征显示（只读） -->
              <FormItem :label="$t('ioBillOperation.materialFeature')">
                {{ jobData?.materialDescription || '-' }}
              </FormItem>
            </Col>
          </Row>
          <Row :gutter="24">
            <Col :span="8">
              <!-- 数量显示（只读） -->
              <FormItem :label="$t('ioBillOperation.number')">
                {{ jobData?.number || '-' }}
              </FormItem>
            </Col>
            <Col :span="8">
              <!-- 单位显示（只读） -->
              <FormItem :label="$t('ioBillOperation.unit')">
                {{ jobData?.unit || '-' }}
              </FormItem>
            </Col>
            <Col :span="8">
              <!-- 储位显示（只读） -->
              <FormItem :label="$t('ioBillOperation.storagePosition')">
                {{ jobData.warehouseAreaCode || '-' }}
              </FormItem>
            </Col>
          </Row>
          <Row :gutter="24">
            <Col :span="8" :offset="16">
              <!-- 操作按钮区域 -->
              <FormItem :wrapper-col="{ span: 24 }">
                <!-- 确认按钮，点击后提交出库操作 -->
                <Button type="primary" @click="outSubmit" class="my-4 w-full">
                  {{ $t('common.confirm') }}
                </Button>
                <!-- 取消按钮，点击后关闭出库操作界面 -->
                <Button @click="closeTheAssignment" class="w-full">
                  {{ $t('common.cancel') }}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
    <!-- 抽屉底部操作按钮区域 -->
    <template #footer>
      <!-- 按钮组，包含取消和确认按钮 -->
      <Space>
        <!-- 取消按钮，点击后关闭抽屉 -->
        <Button @click="afterClose">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认按钮，点击后完成整个单据 -->
        <Button type="primary" @click="submit">
          {{ $t('common.completed') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<!-- 组件样式：当前使用Tailwind CSS类进行样式控制，暂无自定义样式规则 -->
<style scoped></style>
