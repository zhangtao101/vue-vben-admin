<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

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
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteFormQualityCheckItem,
  exportQcItem,
  getProceByName,
  insertFormQualityCheckItem,
  queryFormQualityCheckItem,
  queryFormQualityCheckItemById,
  querySpecialCharacter,
  updateFormQualityCheckItem,
} from '#/api';
import { queryAuth } from '#/util';
import StandardItem from '#/util/component/qualityCheckSet/standardItem.vue';

// region 表格配置与相关功能

/**
 * 表格配置项
 * 定义了表格的基本属性、列信息、数据源等配置
 */
const gridOptions: VxeGridProps<any> = {
  align: 'center', // 表格内容居中对齐
  border: true, // 显示表格边框

  rowConfig: {
    drag: true, // 允许行拖拽排序
  },
  columns: [
    // 定义表格列配置
    { title: '序号', type: 'seq', width: 50 },
    { field: 'itemCode', title: '质检项编号', minWidth: 150 },
    { field: 'produceName', title: '所属工序', minWidth: 200 },
    { field: 'itemName', title: '质检项名称', minWidth: 200 },
    { field: 'specialCharacterName', title: '特殊特性名称', minWidth: 120 },
    { field: 'specialCharacterSymbol', title: '特殊特性符号', minWidth: 120 },
    { field: 'operateUserName', title: '操作人', minWidth: 80 },
    { field: 'operateTime', title: '操作时间', minWidth: 150 },
    {
      title: '操作',
      minWidth: 200,
      fixed: 'right',
      slots: {
        default: 'action',
      },
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
const gridEvents: any = {};

// 创建表格实例和API引用
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 查询参数对象，用于存储表格筛选条件
const queryParams = ref<any>({});

/**
 * 查询数据函数
 * 负责根据当前的查询参数、分页信息，从后端服务查询数据
 * @param {object} options - 查询选项
 * @param {number} options.page - 当前页码
 * @param {number} options.pageSize - 每页显示条数
 * @returns {Promise} - 返回查询结果的Promise对象
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 构建查询参数对象
    const params = {
      ...queryParams.value,
      pageNum: page, // 设置当前页码
      pageSize, // 设置每页显示的数据条数
    };

    // 调用API查询数据
    queryFormQualityCheckItem(params)
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
  itemName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
} as any);

/**
 * 显示编辑抽屉
 * @param {object} item - 可选参数，如果提供则显示编辑模式，否则显示新增模式
 */
function showEdit(item?: any) {
  if (item) {
    // 编辑模式：根据ID查询详细数据
    queryFormQualityCheckItemById(item.id).then((data) => {
      editMessage.value = {
        ...data,
      };
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
    const params = {
      ...editMessage.value,
    };
    // 根据是否存在ID来判断是更新还是新增操作
    const ob = params.id
      ? updateFormQualityCheckItem(params)
      : insertFormQualityCheckItem(params);
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
      deleteFormQualityCheckItem(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        // 删除成功后刷新表格
        gridApi.reload();
      });
    },
    title: '是否确认删除?',
  });
}

// endregion

// region 查询质检项相关功能

// 存储工序列表数据
const listOfQualityInspectionItems = ref<any>([]);

/**
 * 查询质检项列表
 * @param {string} value - 工序名称关键词
 */
function queryQualityInspectionList(value: string) {
  if (value) {
    // 根据工序名称查询工序列表
    getProceByName(value).then((data) => {
      listOfQualityInspectionItems.value = data.map((item: any) => {
        return {
          label: `${item.processName}(${item.processCode})`,
          value: item.processName,
          processCode: item.processCode,
        };
      });
    });
  }
}

/**
 * 响应工序选择变化事件
 * @param {*} _value - 选中的值（未使用）
 * @param {object} item - 选中的项对象
 */
function responseProcessChange(_value: any, item: any) {
  // 设置对应的工序代码
  editMessage.value.produceCode = item.processCode;
}

// endregion

// region 查看标准项功能

// 标准项组件引用
const standardItemRef = ref<any>();

/**
 * 打开标准项详情抽屉
 * @param {object} row - 当前选中的数据行
 */
function showStandardItem(row: any) {
  standardItemRef.value.openDrawer(row);
}

// endregion

// region 导出功能

/**
 * 导出质检项数据为文件
 */
function exportFile() {
  const params: any = { ...queryParams.value };
  exportQcItem(params).then((data) => {
    // 打开导出链接
    window.open(data);
  });
}

// endregion

// region 特殊特性查询功能

// 存储特殊特性列表
const listOfFeatures = ref<any>([]);

/**
 * 查询特殊特性列表
 */
function specialCharacteristicsQuery() {
  querySpecialCharacter({}).then(({ results }: any) => {
    listOfFeatures.value = results.map((item: any) => {
      return {
        label: item.specialCharacterName,
        value: item.specialCharacterName,
        specialCharacterSymbol: item.specialCharacterSymbol,
      };
    });
  });
}

/**
 * 特殊特性选择变化处理
 * @param {*} _v - 选中的值（未使用）
 * @param {object} item - 选中的特殊特性对象
 */
function listOfFeaturesChange(_v: any, item: any) {
  // 设置对应的特殊特性符号
  editMessage.value.specialCharacterSymbol = item.specialCharacterSymbol;
}

// endregion

// region 组件初始化

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
  // 初始化查询特殊特性列表
  specialCharacteristicsQuery();
});

// endregion
</script>

<template>
  <Page>
    <!-- 搜索区域 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 质检项编号 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckDetail.code',
            )
          "
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.itemCode" />
        </FormItem>
        <!-- 质检项名称 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckDetail.name',
            )
          "
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.itemName" />
        </FormItem>
        <!-- 所属工序 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.formQualityCheckItem.process',
            )
          "
          name="workshop"
        >
          <Input v-model:value="queryParams.produceName" />
        </FormItem>
        <!-- 特殊特性名称 -->
        <FormItem
          :label="
            $t('qualityModule.qualityCheck.qualityBaseSet.specialMaintain.name')
          "
        >
          <Select
            v-model:value="queryParams.specialCharacterName"
            :options="listOfFeatures"
            @change="listOfFeaturesChange"
            allow-clear
            class="!w-48"
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

    <Card>
      <!-- 质检项表格组件 -->
      <Grid>
        <template #toolbar-tools>
          <!-- 新增按钮 -->
          <Button
            type="primary"
            @click="showEdit()"
            class="mx-2"
            v-if="author.includes('新增')"
          >
            {{ $t('common.add') }}
          </Button>
          <!-- 导出按钮 -->
          <Button type="primary" @click="exportFile()">
            {{ $t('common.export') }}
          </Button>
        </template>
        <template #action="{ row }">
          <!-- 查看标准项按钮 -->
          <Tooltip v-if="author.includes('查看标准')">
            <template #title>
              {{
                $t(
                  'qualityModule.qualityCheck.qualityBaseSet.formQualityCheckItem.view',
                )
              }}
            </template>
            <Button
              :icon="
                h(Icon, { icon: 'mdi:eye', class: 'inline-block text-2xl' })
              "
              class="mr-4"
              type="link"
              @click="showStandardItem(row)"
            />
          </Tooltip>
          <!-- 编辑按钮 -->
          <Tooltip v-if="author.includes('编辑')">
            <template #title>{{ $t('common.edit') }}</template>
            <Button class="mr-4" type="link" @click="showEdit(row)">
              <Icon
                icon="mdi:edit-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 删除按钮 -->
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
        <!-- 质检项编号 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckDetail.code',
            )
          "
          name="formCode"
        >
          <Input
            v-model:value="editMessage.itemCode"
            :disabled="!!editMessage.id"
          />
        </FormItem>
        <!-- 质检项名称 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckDetail.name',
            )
          "
          name="formCode"
        >
          <Input v-model:value="editMessage.itemName" />
        </FormItem>
        <!-- 所属工序 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.formQualityCheckItem.process',
            )
          "
          name="produceName"
        >
          <Select
            v-model:value="editMessage.produceName"
            :options="listOfQualityInspectionItems"
            :placeholder="$t('ui.placeholder.input')"
            show-search
            :default-active-first-option="false"
            :show-arrow="false"
            :filter-option="false"
            :not-found-content="null"
            @search="queryQualityInspectionList"
            @change="responseProcessChange"
          />
        </FormItem>
        <!-- 特殊特性名称 -->
        <FormItem
          :label="
            $t('qualityModule.qualityCheck.qualityBaseSet.specialMaintain.name')
          "
          name="specialCharacterName"
        >
          <Select
            v-model:value="editMessage.specialCharacterName"
            :options="listOfFeatures"
            @change="listOfFeaturesChange"
          />
        </FormItem>
        <!-- 特殊特性符号 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.specialMaintain.symbol',
            )
          "
          name="specialCharacterSymbol"
        >
          <Input v-model:value="editMessage.specialCharacterSymbol" disabled />
        </FormItem>
      </Form>

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

    <!-- 查看标准组件 -->
    <StandardItem ref="standardItemRef" />
  </Page>
</template>

<style scoped></style>
