<script setup lang="ts">
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  RadioGroup,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteQualityCheckForm,
  exportQualityCheckForm,
  insertQualityCheckForm,
  listWordListByParentCode,
  queryQualityCheckForm,
  queryQualityCheckFormById,
  updateQualityCheckForm,
} from '#/api';
import { queryAuth } from '#/util';
import FormQualityCheckItem from '#/util/component/qualityCheckSet/formQualityCheckItem.vue';

// region 表格配置与相关功能

/**
 * 表格配置项
 * 定义了质检表单表格的基本属性、列信息、数据源等配置
 */
const gridOptions: VxeGridProps<any> = {
  align: 'center', // 表格内容居中对齐
  border: true, // 显示表格边框
  columns: [
    // 定义表格列配置
    { title: '序号', type: 'seq', width: 50 },
    { field: 'workshopName', title: '所属车间', minWidth: 100 },
    { field: 'formCode', title: '质检表编号', minWidth: 150 },
    { field: 'formName', title: '质检表名称', minWidth: 120 },
    { field: 'version', title: '表版本号', minWidth: 80 },
    { field: 'formTypeName', title: '表类型', minWidth: 80 },
    { field: 'productReferenceName', title: '产品相关', minWidth: 80 },
    { field: 'operateTime', title: '操作时间', minWidth: 150 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 220,
    },
  ],
  height: 500, // 表格高度
  stripe: true, // 显示斑马纹
  sortConfig: {
    multiple: true, // 支持多列排序
  },
  proxyConfig: {
    // 数据代理配置
    ajax: {
      query: async ({ page }: any) => {
        return await queryData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  toolbarConfig: {
    // 工具栏配置
    custom: true, // 自定义工具栏
    refresh: true, // 显示刷新按钮
    zoom: true, // 显示缩放按钮
  },
};

// 表格事件配置
const gridEvents: VxeGridListeners<any> = {};

// 创建表格实例和API引用
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// endregion

// region 查询数据相关功能

// 查询参数对象，用于存储表格筛选条件
const queryParams = ref<any>({});

/**
 * 从服务器查询质检表单数据的函数
 * 用于发送查询请求，并在成功获取数据后更新组件的状态
 * @param {object} options - 查询选项
 * @param {number} options.page - 当前页码
 * @param {number} options.pageSize - 每页显示条数
 * @returns {Promise} - 返回查询结果的Promise对象
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 构建查询参数对象
    const params = {
      ...queryParams.value, // 展开所有查询参数
      pageNum: page, // 设置当前页码
      pageSize, // 设置每页显示的数据条数
    };

    // 调用API查询数据
    queryQualityCheckForm(params)
      .then(({ total, results }) => {
        resolve({
          total, // 总条数
          items: results, // 数据列表
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// endregion

// region 新增/编辑表单相关功能

// 表单引用，用于访问表单实例方法
const editForm = ref();
// 控制编辑抽屉的显示与隐藏
const showDrawer = ref(false);
// 存储编辑表单的数据
const editMessage = ref<any>({});
// 表单验证规则配置
const editRules = ref({
  workshop: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  formCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  formName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  version: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  formType: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  productReference: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  sendNumberEnable: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
} as any);

// 送检状态选项
const statusOptions = [
  { label: '启用', value: true },
  { label: '停用', value: false },
];

// 相关性状态选项
const correlationStatusOptions = [
  { label: '是', value: true },
  { label: '否', value: false },
];

// 表单类型列表
const formTypeList = [
  { value: '1', label: '首检' },
  { value: '2', label: '中检' },
  { value: '3', label: '末检' },
];

/**
 * 显示编辑抽屉
 * @param {object} item - 可选参数，如果提供则显示编辑模式，否则显示新增模式
 */
function showEdit(item?: any) {
  if (item) {
    // 编辑模式：根据ID查询详细数据
    queryQualityCheckFormById(item.id).then((data) => {
      editMessage.value = { ...data };
    });
  } else {
    // 新增模式：清空表单数据
    editMessage.value = {};
  }
  // 显示抽屉
  showDrawer.value = true;
}

/**
 * 表单提交处理函数
 * 执行表单验证并根据是否有ID来决定是新增还是更新操作
 */
function submit() {
  editForm.value.validate().then(() => {
    const params = { ...editMessage.value };
    // 根据是否存在ID来判断是更新还是新增操作
    const ob = params.id
      ? updateQualityCheckForm(params)
      : insertQualityCheckForm(params);
    ob.then(() => {
      message.success($t('common.successfulOperation'));
      close();
      // 提交成功后刷新表格
      gridApi.reload();
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

// region 查询责任车间相关功能

// 存储责任车间列表数据
const responseWorkshopList = ref<any>([]);

/**
 * 查询责任车间列表
 */
function queryResponseWorkshop() {
  listWordListByParentCode('WORKSHOP').then((data) => {
    responseWorkshopList.value = data.map((item: any) => {
      return {
        label: item.wordName,
        value: item.wordCode,
      };
    });
  });
}

// endregion

// region 导出功能

/**
 * 导出质检表单数据为文件
 */
function exportFile() {
  const params: any = { ...queryParams.value };
  exportQualityCheckForm(params).then((data) => {
    // 打开导出链接
    window.open(data);
  });
}

// endregion

// region 删除功能

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
      deleteQualityCheckForm(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        // 删除成功后刷新表格
        gridApi.reload();
      });
    },
    title: '是否确认删除?',
  });
}

// endregion

// region 查看质检项功能

// 质检项组件引用
const formQualityCheckItemRef = ref();

/**
 * 显示质检项抽屉
 * @param {object} item - 当前选中的质检表单数据行
 */
function displaysQualityItems(item: any) {
  formQualityCheckItemRef.value.openDrawer(item);
}

// endregion

// region 路由与权限相关

// 路由信息对象，用于获取当前页面路由信息
const route = useRoute();
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 组件初始化

// 组件挂载时执行的初始化操作
onMounted(() => {
  // 查询当前页面权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  // 查询责任车间列表
  queryResponseWorkshop();
});

// endregion
</script>

<template>
  <Page>
    <!-- 搜索区域 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 质检表编号搜索框 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckForm.code',
            )
          "
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.formCode" />
        </FormItem>
        <!-- 质检表名称搜索框 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckForm.name',
            )
          "
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.formName" />
        </FormItem>
        <!-- 所属车间下拉选择 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckForm.workshop',
            )
          "
          name="workshop"
        >
          <Select
            v-model:value="queryParams.workshop"
            :options="responseWorkshopList"
            class="!w-48"
            allow-clear
          />
        </FormItem>
        <!-- 搜索按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="() => gridApi.reload()"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格主体区域 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <!-- 新增按钮（根据权限显示） -->
          <Button
            type="primary"
            @click="showEdit()"
            class="mx-2"
            v-if="author.includes('新增')"
          >
            {{ $t('common.add') }}
          </Button>
          <!-- 导出按钮（根据权限显示） -->
          <Button
            type="primary"
            @click="exportFile()"
            v-if="author.includes('导出')"
          >
            {{ $t('common.export') }}
          </Button>
        </template>
        <!-- 表格操作列 -->
        <template #action="{ row }">
          <!-- 查看质检项按钮（根据权限显示） -->
          <Tooltip v-if="author.includes('查看质检项')">
            <template #title>
              {{
                $t(
                  'qualityModule.qualityCheck.qualityBaseSet.qualityCheckForm.view',
                )
              }}
            </template>
            <Button
              :icon="
                h(Icon, { icon: 'mdi:eye', class: 'inline-block text-2xl' })
              "
              class="mr-4"
              type="link"
              @click="displaysQualityItems(row)"
            />
          </Tooltip>
          <!-- 编辑按钮（根据权限显示） -->
          <Tooltip v-if="author.includes('编辑')">
            <template #title>{{ $t('common.edit') }}</template>
            <Button
              :icon="
                h(Icon, {
                  icon: 'mdi:edit-outline',
                  class: 'inline-block text-2xl',
                })
              "
              class="mr-4"
              type="link"
              @click="showEdit(row)"
            />
          </Tooltip>
          <!-- 删除按钮（根据权限显示） -->
          <Tooltip v-if="author.includes('删除')">
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
    </Card>

    <!-- 新增/编辑抽屉 -->
    <Drawer
      v-model:open="showDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="600"
      class="custom-class"
      placement="right"
      root-class-name="root-class-name"
      title="信息编辑"
    >
      <Form
        ref="editForm"
        :label-col="{ span: 8 }"
        :model="editMessage"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
        name="editMessageForm"
      >
        <!-- 所属车间 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckForm.workshop',
            )
          "
          name="workshop"
        >
          <Select
            v-model:value="editMessage.workshop"
            :options="responseWorkshopList"
          />
        </FormItem>
        <!-- 质检表编号 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckForm.code',
            )
          "
          name="formCode"
        >
          <Input
            v-model:value="editMessage.formCode"
            :disabled="!!editMessage.id"
          />
        </FormItem>
        <!-- 质检表名称 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckForm.name',
            )
          "
          name="formName"
        >
          <Input v-model:value="editMessage.formName" />
        </FormItem>
        <!-- 版本号 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckForm.version',
            )
          "
          name="version"
        >
          <Input v-model:value="editMessage.version" />
        </FormItem>
        <!-- 类型 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckForm.type',
            )
          "
          name="formType"
        >
          <Select
            v-model:value="editMessage.formType"
            :options="formTypeList"
          />
        </FormItem>
        <!-- 产品相关 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckForm.correlation',
            )
          "
          name="productReference"
        >
          <RadioGroup
            v-model:value="editMessage.productReference"
            :options="correlationStatusOptions"
          />
        </FormItem>
        <!-- 产品编码输入框（仅在产品相关为"是"时显示） -->
        <FormItem
          :wrapper-col="{ span: 16, offset: 8 }"
          v-if="editMessage.productReference"
        >
          <Input v-model:value="editMessage.productCode" />
        </FormItem>
        <!-- 送检数量选项 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckForm.sendCheck',
            )
          "
          name="sendNumberEnable"
        >
          <RadioGroup
            v-model:value="editMessage.sendNumberEnable"
            :options="statusOptions"
          />
        </FormItem>
      </Form>

      <!-- 抽屉底部按钮 -->
      <template #footer>
        <Space>
          <!-- 取消按钮 -->
          <Button @click="close">{{ $t('common.cancel') }}</Button>
          <!-- 确认按钮 -->
          <Button type="primary" @click="submit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>

    <!-- 质检项组件 -->
    <FormQualityCheckItem ref="formQualityCheckItemRef" />
  </Page>
</template>

<style scoped></style>
