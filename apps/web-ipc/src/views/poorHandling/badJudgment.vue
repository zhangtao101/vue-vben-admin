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
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams.value };
    getNotFinishDefectList({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ total, list }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total,
          items: list,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 重置查询条件
 */
function reload() {
  queryParams.value = {};
  gridApi.reload();
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
function queryBadData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = {
      ...queryParams.value,
      type: theSelectedOperation.value,
    };
    getDefectListByType({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ total, list }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total,
          items: list,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 不良确认提交
 */
function submissionOfAdverseConfirmation(row: any) {
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
      // 弹出警告提示，提示用户取消操作
      message.warning('已取消!');
    },

    // 用户确认操作时触发的回调函数
    onOk() {
      // 调用删除按钮的操作，传递按钮的编码和类型参数
      defectConfirm({
        id: row.id,
        type: theSelectedOperation.value,
      })
        .then(() => {
          // 如果删除操作成功，显示操作成功的提示信息
          message.success($t('common.successfulOperation')); // 成功操作的提示信息（通过国际化处理）

          gridApi.query();
          badGridApi.query();
        })
        .catch((error) => {
          // 如果删除操作失败，显示错误提示信息
          message.error($t('common.operationFailure')); // 操作失败的提示信息（通过国际化处理）

          // 显示具体的错误信息
          message.error(error.msg); // 显示从服务器返回的错误消息
        });
    },

    // 确认框的标题文本
    title: '是否确认提交数据?',
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
 * 显示操作
 * @param row
 */
function showDrawerFun(row: any) {
  showDrawer.value = true;
  editItem.value = {
    id: row.id,
    errorNumber: 0,
    defectNumber: 0,
    wasteNumber: 0,
    receiveNumber: 0,
  };
}

/**
 * 保存
 */
function submit() {
  editForm.value.validate().then(() => {
    judgement(editItem.value).then(() => {
      message.success($t('common.successfulOperation'));
      close();
      gridApi.reload();
      badGridApi.reload();
    });
  });
}

/**
 * 关闭抽屉
 */
function close() {
  showDrawer.value = false;
  editItem.value = {};
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
          <Input v-model:value="queryParams.productSnCode" />
        </FormItem>
        <!--工单号 -->
        <FormItem :label="$t('badJudgment.workOrderNumber')">
          <Input v-model:value="queryParams.worksheetCode" />
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
        <!-- 不良数量 -->
        <FormItem
          :label="$t('badJudgment.defectiveQuantity')"
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
