<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import {
  MdiEditOutline,
  MdiHome,
  MdiLightSettings,
  MdiSuccess,
} from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  RadioButton,
  RadioGroup,
  Row,
  Space,
  Textarea,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  defectConfirm,
  getDefectListByType,
  getNotFinishDefectList,
  judgement,
} from '#/api';
import { router } from '#/router';
import ScanTheCode from '#/util/component/scanTheCode.vue';

// region 工作站查询信息

// endregion
// region 作业信息
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
      field: 'processCode',
      title: '所属工序',
      minWidth: 200,
    },
    {
      field: 'processName',
      title: '工序名称',
      minWidth: 200,
    },
    {
      field: 'equipName',
      title: '作业位置',
      minWidth: 200,
    },
    {
      field: 'productQrCode',
      title: '产品SN码',
      minWidth: 200,
    },
    {
      field: 'worksheetCode',
      title: '工单号',
      minWidth: 200,
    },
    {
      field: 'productCode',
      title: '产品编号',
      minWidth: 200,
    },
    {
      field: 'productName',
      title: '产品名称',
      minWidth: 200,
    },
    {
      field: 'defectNumber',
      title: '不良数量',
      minWidth: 200,
    },
    {
      field: 'operateTime',
      title: '操作时间',
      minWidth: 200,
    },
    {
      field: 'operateUserCode',
      title: '操作人',
      minWidth: 200,
    },
    {
      field: 'action',
      title: '操作',
      minWidth: 120,
      slots: { default: 'action' },
      fixed: 'right',
    },
  ],
  height: 300,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  radioConfig: {
    labelField: 'name',
    trigger: 'row',
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
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

// 表格事件
const gridEvents: any = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// region 查询数据

// 查询条件

const queryParams = ref<any>({
  productionLineId: '',
  processId: '',
});

/**
 * 查询未完成缺陷数据
 * 功能：获取未处理缺陷列表并处理分页逻辑
 * 步骤：
 * 1. 合并查询条件参数
 * 2. 调用未完成缺陷列表接口
 * 3. 转换接口数据为表格所需格式
 * 4. 处理接口异常情况
 *
 * @param {object} params 分页参数
 * @param {number} params.page 当前页码
 * @param {number} params.pageSize 每页数据量
 * @returns {Promise} 返回适配表格的分页数据
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 合并查询条件
    const params: any = { ...queryParams.value };

    // 调用未完成缺陷列表接口
    getNotFinishDefectList({
      ...params, // 保留所有查询条件
      pageNum: page, // 接口需要的当前页码参数
      pageSize, // 接口需要的每页数量参数
    })
      .then(({ total, list }) => {
        // 转换接口数据结构为表格组件需要的格式
        resolve({
          total, // 总记录数
          items: list, // 当前页数据列表
        });
      })
      .catch((error) => {
        reject(error); // 异常处理
      });
  });
}

/**
 * 重置查询条件并刷新表格
 * 功能：
 * 1. 清空当前查询参数
 * 2. 重新加载表格数据
 *
 * 操作流程：
 * 1. 将查询条件对象重置为空对象
 * 2. 调用表格API重新加载数据
 */
function reload() {
  queryParams.value = {}; // 重置所有查询条件
  gridApi.reload(); // 触发表格数据重新加载
}

// endregion

// endregion

// region 不良处理

// 操作事项列表
const listOfOperationItems = ref<any>([
  {
    label: '误判',
    value: 1,
  },
  {
    label: '返工',
    value: 2,
  },
  {
    label: '让步',
    value: 3,
  },
  {
    label: '报废',
    value: 4,
  },
]);
// 选中的操作事项
const theSelectedOperation = ref(1);

// region 不良表格配置
const poorTableConfiguration: VxeGridProps<any> = {
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
      field: 'processCode',
      title: '所属工序',
      minWidth: 200,
    },
    {
      field: 'processName',
      title: '工序名称',
      minWidth: 200,
    },
    {
      field: 'equipName',
      title: '作业位置',
      minWidth: 200,
    },
    {
      field: 'productQrCode',
      title: '产品SN码',
      minWidth: 200,
    },
    {
      field: 'worksheetCode',
      title: '工单号',
      minWidth: 200,
    },
    {
      field: 'productCode',
      title: '产品编号',
      minWidth: 200,
    },
    {
      field: 'productName',
      title: '产品名称',
      minWidth: 200,
    },
    {
      field: 'defectNumber',
      title: '不良数量',
      minWidth: 200,
    },
    {
      field: 'operateTime',
      title: '操作时间',
      minWidth: 200,
    },
    {
      field: 'operateUserCode',
      title: '操作人',
      minWidth: 200,
    },
    {
      field: 'action',
      title: '操作',
      minWidth: 120,
      slots: { default: 'action' },
      fixed: 'right',
    },
  ],
  height: 300,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  radioConfig: {
    labelField: 'name',
    trigger: 'row',
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryBadData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
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

const [BadGrid, badGridApi] = useVbenVxeGrid({
  gridOptions: poorTableConfiguration,
});

/**
 * 查询不良数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
/**
 * 查询特定类型的不良数据
 * 功能：根据当前选择的操作类型获取不良数据列表
 * 流程：
 * 1. 合并基础查询参数和当前操作类型
 * 2. 调用分页接口获取数据
 * 3. 转换接口数据结构适配表格组件
 *
 * 参数说明：
 * @param page 当前页码
 * @param pageSize 每页数据量
 *
 * 接口特性：
 * getDefectListByType - 根据操作类型(1-误判,2-返工等)获取对应不良数据
 */
function queryBadData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 合并查询条件（基础查询参数 + 当前操作类型）
    const params: any = {
      ...queryParams.value,
      type: theSelectedOperation.value, // 从操作类型选择器获取当前类型值
    };

    // 调用分页查询接口
    getDefectListByType({
      ...params, // 携带所有查询条件
      pageNum: page, // 接口页码参数
      pageSize, // 每页数据量参数
    })
      .then(({ total, list }) => {
        // 转换接口返回数据结构
        resolve({
          total, // 总记录数
          items: list, // 当前页数据列表
        });
      })
      .catch((error) => {
        reject(error); // 异常处理
      });
  });
}

/**
 * 不良数据确认提交
 * 功能：执行不良处理确认操作并更新相关表格数据
 * 流程：
 * 1. 弹出二次确认对话框
 * 2. 确认后调用缺陷确认接口
 * 3. 成功时刷新主表和不良表数据
 * 4. 失败时显示错误详情
 *
 * @param row - 当前操作行数据，包含缺陷记录ID等关键信息
 */
function submissionOfAdverseConfirmation(row: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger', // 表示危险操作
    title: '是否确认提交数据?',

    onCancel() {
      // 取消操作处理
      message.warning('已取消!');
    },

    onOk() {
      // 确认操作处理
      defectConfirm({
        id: row.id, // 当前缺陷记录ID
        type: theSelectedOperation.value, // 当前选择的操作类型（1-误判等）
      })
        .then(() => {
          message.success($t('common.successfulOperation'));
          // 双表联刷新
          gridApi.query(); // 刷新主缺陷表
          badGridApi.query(); // 刷新不良处理表
        })
        .catch((error) => {
          message.error($t('common.operationFailure')); // 通用错误提示
          message.error(error.msg); // 显示接口返回的具体错误信息
        });
    },
  });
}

/**
 * 返工
 * @param row
 */
function rework(row: any) {
  router.push(`/poorHandling/rework/${row.id}`);
}
// endregion

// endregion

// region 操作
// 是否显示抽屉
const showDrawer = ref(false);
// 当前编辑对象
const editItem = ref<any>({});
// form表单对象
const editForm = ref();
// 编辑对象表单验证规则
const editRules = ref({
  errorNumber: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  defectNumber: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  wasteNumber: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  receiveNumber: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
} as any);

/**
 * 显示不良处理编辑抽屉
 * 功能：初始化编辑表单并打开抽屉组件
 *
 * @param row - 当前操作行数据，包含不良记录ID等关键信息
 * 操作流程：
 * 1. 打开右侧抽屉组件
 * 2. 初始化表单数据：
 *    - 绑定当前记录ID
 *    - 重置各数量字段为0
 */
function showDrawerFun(row: any) {
  showDrawer.value = true; // 控制抽屉组件显示
  editItem.value = {
    id: row.id, // 记录当前不良项ID
    errorNumber: 0, // 误判数量初始化
    defectNumber: 0, // 不良数量初始化
    wasteNumber: 0, // 报废数量初始化
    receiveNumber: 0, // 让步接收数量初始化
  };
}

/**
 * 提交不良判定结果
 * 功能：验证并提交表单数据，处理后续操作
 * 流程：
 * 1. 执行表单字段验证
 * 2. 调用判定结果提交接口
 * 3. 成功时：
 *    - 显示操作成功提示
 *    - 关闭编辑抽屉
 *    - 刷新主表格和不良处理表格数据
 * 4. 错误时由接口自动处理（未显式捕获）
 */
function submit() {
  editForm.value.validate().then(() => {
    // 调用判定接口提交表单数据
    judgement(editItem.value).then(() => {
      message.success($t('common.successfulOperation'));
      close(); // 关闭抽屉组件
      gridApi.reload(); // 刷新主缺陷表
      badGridApi.reload(); // 刷新不良处理表
    });
  });
}

/**
 * 关闭编辑抽屉并重置状态
 * 功能：
 * 1. 隐藏抽屉组件
 * 2. 清空当前编辑数据
 *
 * 操作流程：
 * 1. 将抽屉显示状态置为false
 * 2. 重置编辑对象为空状态
 */
function close() {
  showDrawer.value = false; // 关闭抽屉组件
  editItem.value = {}; // 清空当前编辑项数据
}
// endregion

onMounted(() => {});
</script>

<template>
  <Page>
    <!-- region 工作站查询信息 -->
    <Card class="mb-5">
      <Form layout="inline" :model="queryParams">
        <!--产品SN码 -->
        <FormItem :label="$t('badJudgment.sn')">
          <div class="flex">
            <Input v-model:value="queryParams.productSnCode" />
            <ScanTheCode
              @scan-the-code="
                (val) => {
                  queryParams.productSnCode = val;
                }
              "
            />
          </div>
        </FormItem>
        <!--工单号 -->
        <FormItem :label="$t('badJudgment.workOrderNumber')">
          <div class="flex">
            <Input v-model:value="queryParams.worksheetCode" />
            <ScanTheCode
              @scan-the-code="
                (val) => {
                  queryParams.worksheetCode = val;
                }
              "
            />
          </div>
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            @click="
              () => {
                gridApi.reload();
                badGridApi.reload();
              }
            "
            class="mr-4"
          >
            {{ $t('common.search') }}
          </Button>
          <Button @click="reload()">
            {{ $t('common.reset') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 表格内容 -->
    <Card class="mb-5">
      <Grid>
        <template #toolbar-tools> </template>
        <template #action="{ row }">
          <!-- 编辑按钮 ="{ row }" -->
          <Tooltip>
            <template #title>
              {{ $t('common.edit') }}
            </template>
            <Button
              :icon="h(MdiEditOutline, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="showDrawerFun(row)"
            />
            <!--        @click="editRow(row, true)"-->
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!--- region 处理  -->
    <Row class="mb-4">
      <Col :span="4">
        <span class="border-l-4 border-sky-500 pl-4 text-2xl font-black">
          {{ $t('badJudgment.poorHandling') }}
        </span>
      </Col>
      <Col :span="20">
        <RadioGroup
          v-model:value="theSelectedOperation"
          button-style="solid"
          class="float-right"
          @change="badGridApi.reload()"
        >
          <RadioButton
            :value="item.value"
            v-for="item of listOfOperationItems"
            :key="item.value"
          >
            <MdiHome class="inline-block text-xl" />
            {{ item.label }}
          </RadioButton>
        </RadioGroup>
      </Col>
    </Row>
    <!-- endregion -->

    <!-- region 不良处理 -->
    <Card class="mb-5">
      <BadGrid>
        <template #toolbar-tools> </template>
        <template #action="{ row }">
          <!-- 确认按钮 ="{ row }" -->
          <Tooltip v-if="[1, 3, 4].includes(theSelectedOperation)">
            <template #title>
              {{ $t('common.confirm') }}
            </template>
            <Button
              :icon="h(MdiSuccess, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="submissionOfAdverseConfirmation(row)"
            />
            <!--        @click="editRow(row, true)"-->
          </Tooltip>
          <!-- 编辑按钮 ="{ row }" -->
          <Tooltip v-if="[2].includes(theSelectedOperation)">
            <template #title>
              {{ $t('common.edit') }}
            </template>
            <Button
              :icon="h(MdiLightSettings, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="rework(row)"
            />
            <!--        @click="editRow(row, true)"-->
          </Tooltip>
        </template>
      </BadGrid>
    </Card>
    <!-- endregion -->

    <!-- region 不良处理 -->
    <Drawer
      v-model:open="showDrawer"
      :width="400"
      placement="right"
      :title="$t('badJudgment.poorOperation')"
      :footer-style="{ textAlign: 'right' }"
      @close="close"
    >
      <Form
        ref="editForm"
        :label-col="{ span: 8 }"
        :model="editItem"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
      >
        <!-- 误判数量 -->
        <FormItem
          :label="$t('badJudgment.misjudgedQuantity')"
          name="errorNumber"
        >
          <InputNumber v-model:value="editItem.errorNumber" :min="0" />
        </FormItem>
        <!-- 返工数量 -->
        <FormItem
          :label="$t('badJudgment.quantityOfRework')"
          name="defectNumber"
        >
          <InputNumber v-model:value="editItem.defectNumber" :min="0" />
        </FormItem>
        <!-- 报废数量 -->
        <FormItem :label="$t('badJudgment.scrapQuantity')" name="wasteNumber">
          <InputNumber v-model:value="editItem.wasteNumber" :min="0" />
        </FormItem>
        <!-- 让步接收数量 -->
        <FormItem
          :label="$t('badJudgment.concessionAcceptanceQuantity')"
          name="receiveNumber"
        >
          <InputNumber v-model:value="editItem.receiveNumber" :min="0" />
        </FormItem>
        <!-- 报废原因 -->
        <FormItem
          :label="$t('badJudgment.reasonsForScrapping')"
          name="description"
        >
          <Textarea v-model:value="editItem.description" :rows="4" />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="close">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="submit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
