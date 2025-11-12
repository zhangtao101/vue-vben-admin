<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, ref } from 'vue';

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
  message,
  Modal,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteQcItem,
  exportQcItem,
  insertQcItem,
  queryQcItem,
  queryQcItemList,
} from '#/api';
import QualityCheckDetail from '#/util/component/qualityCheckSet/qualityCheckDetail.vue';
import StandardItem from '#/util/component/qualityCheckSet/standardItem.vue';

// region 表格

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,

  rowConfig: {
    drag: true,
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'itemCode', title: '质检项编号', minWidth: 100 },
    { field: 'produceName', title: '所属工序', minWidth: 150 },
    { field: 'itemName', title: '质检项名称', minWidth: 100 },
    { field: 'specialCharacterName', title: '特殊特性名称', minWidth: 120 },
    { field: 'specialCharacterSymbol', title: '特殊特性符号', minWidth: 120 },
    { field: 'operateUserName', title: '操作人', minWidth: 80 },
    { field: 'operateTime', title: '操作时间', minWidth: 150 },
    {
      title: '操作',
      minWidth: 300,
      fixed: 'right',
      slots: {
        default: 'action',
      },
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
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
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: any = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

const queryParams = ref<any>({});
/**
 * queryData - 负责根据当前的查询参数、分页信息和日期范围，从后端服务查询数据。
 * 该函数会更新表格的加载状态，并在查询完成后更新数据列表和总条数。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 构建查询参数对象，包含所有查询参数、当前页码和每页显示的数据条数。
    const params = {
      ...queryParams.value,
      // 设置当前页码。
      pageNum: page,
      // 设置每页显示的数据条数。
      pageSize,
    };

    // 调用 queryQcItem 函数查询数据。
    queryQcItem(params)
      .then(({ total, results }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total,
          items: results,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// endregion

// region 抽屉基本操作
// 抽屉是否打开
const isOpen = ref(false);
// 送检表单设置详情
const details = ref<any>({});

/**
 * 打开抽屉
 * @param row 详情
 */
function openDrawer(row: any) {
  isOpen.value = true;
  details.value = {
    ...row,
  };
  queryParams.value = {
    formCode: details.value.formCode,
  };
}

function closeDrawer() {
  isOpen.value = false;
}
// endregion

// region 模板基本信息编辑 / 新增
// 表单对象
const editForm = ref();
// 模板基本信息编辑抽屉是否显示
const showDrawer = ref(false);
// 编辑的模板基本信息
const editMessage = ref<any>({});
// 编辑的模板基本信息验证规则
const editRules = ref({
  itemName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
} as any);

/**
 * 显示编辑抽屉
 */
function showEdit() {
  editMessage.value = {
    qcFormCode: queryParams.value.formCode,
  };
  showDrawer.value = true;
}

/**
 * 表单提交
 */
function submit() {
  editForm.value.validate().then(() => {
    const params = {
      ...editMessage.value,
    };
    insertQcItem(params).then(() => {
      message.success($t('common.successfulOperation'));
      close();
      gridApi.reload();
    });
  });
}

function close() {
  editMessage.value = {};
  showDrawer.value = false;
}
// endregion

// region 删除

/**
 * 处理工单删除操作
 * @param row - 当前要删除的工单行数据
 */
function delRow(row: any) {
  // 弹出确认对话框
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    // 取消操作回调
    onCancel() {
      message.warning('已取消删除!');
    },
    // 确认操作回调
    onOk() {
      // 调用删除接口
      deleteQcItem({
        qcItemCode: row.itemCode,
        qcFormCode: queryParams.value.formCode,
      }).then(() => {
        message.success($t('common.successfulOperation'));
        // 刷新表格数据
        gridApi.reload();
      });
    },
    title: '是否确认删除?',
  });
}
// endregion

// region 查询质检项
// 质检项列表
const listOfQualityInspectionItems = ref<any>([]);

/**
 * 查询质检项列表
 * @param value 工序名称
 */
function queryQualityInspectionList(value: string) {
  if (value) {
    queryQcItemList({
      ...queryParams.value,
      itemName: value,
    }).then((data) => {
      listOfQualityInspectionItems.value = data.map((item: any) => {
        return {
          label: `${item.itemName}__(${item.itemCode})`,
          value: item.id,
          ...item,
        };
      });
    });
  }
}

/**
 * 响应工序改变事件
 * @param _value
 * @param item
 */
function responseProcessChange(_value: any, item: any) {
  editMessage.value.itemName = item.itemName;
  editMessage.value.qcItemCode = item.itemCode;
  editMessage.value.produceName = item.produceName;
  editMessage.value.specialCharacterName = item.specialCharacterName;
  editMessage.value.specialCharacterSymbol = item.specialCharacterSymbol;
}

// endregion

// region 查看标准项
const standardItemRef = ref<any>();

function showStandardItem(row: any) {
  standardItemRef.value.openDrawer(row);
}
// endregion

// region 导出

function exportFile() {
  const params: any = { ...queryParams.value };
  exportQcItem(params).then((data) => {
    window.open(data);
  });
}

// endregion

// region 检验明细维护
const qualityCheckDetailRef = ref();

function showQualityCheckDetail(row: any) {
  qualityCheckDetailRef.value.openDrawer(row);
}
// endregion

// region 暴露方法

// 暴露 open 方法，供父组件调用
defineExpose({
  openDrawer,
});

// endregion
</script>

<template>
  <!-- 已派工单列表抽屉组件 -->
  <Drawer
    v-model:open="isOpen"
    height="80%"
    placement="top"
    :title="
      $t('qualityModule.qualityCheck.qualityBaseSet.formQualityCheckItem.title')
    "
    @close="closeDrawer"
  >
    <div>
      <Descriptions :column="3" bordered>
        <!-- 质检表编号 -->
        <DescriptionsItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckForm.code',
            )
          "
        >
          {{ details.formCode }}
        </DescriptionsItem>
        <!-- 质检表名称 -->
        <DescriptionsItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckForm.name',
            )
          "
        >
          {{ details.formName }}
        </DescriptionsItem>
        <!-- 类型 -->
        <DescriptionsItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckForm.type',
            )
          "
        >
          {{ details.formTypeName }}
        </DescriptionsItem>
        <!-- 产品相关 -->
        <DescriptionsItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckForm.correlation',
            )
          "
        >
          {{ details.productReferenceName }}
        </DescriptionsItem>
        <!-- 版本号 -->
        <DescriptionsItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.qualityCheckForm.version',
            )
          "
        >
          {{ details.version }}
        </DescriptionsItem>
      </Descriptions>
    </div>

    <!-- 渲染已派工单表格组件 -->
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
        <!-- 查看标准项 -->
        <Tooltip>
          <template #title>
            {{
              $t(
                'qualityModule.qualityCheck.qualityBaseSet.formQualityCheckItem.view',
              )
            }}
          </template>
          <Button
            :icon="
              h(Icon, {
                icon: 'mdi:eye',
                class: 'inline-block text-2xl',
              })
            "
            class="mr-4"
            type="link"
            @click="showStandardItem(row)"
          />
        </Tooltip>
        <!-- 检验标准维护按钮 -->
        <Tooltip>
          <template #title>
            {{
              $t(
                'qualityModule.qualityCheck.qualityBaseSet.formQualityCheckItem.maintenance',
              )
            }}
          </template>
          <Button
            :icon="
              h(Icon, {
                icon: 'mdi:settings-outline',
                class: 'inline-block text-2xl',
              })
            "
            class="mr-4"
            type="link"
            @click="showQualityCheckDetail(row)"
          />
        </Tooltip>
        <!-- 删除 -->
        <Tooltip>
          <template #title>
            {{ $t('common.delete') }}
          </template>
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

  <!-- region 新增/编辑 -->
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
      <!-- 质检表编号 -->
      <FormItem
        :label="
          $t('qualityModule.qualityCheck.qualityBaseSet.qualityCheckForm.code')
        "
        name="formCode"
      >
        <Input v-model:value="editMessage.qcFormCode" disabled />
      </FormItem>
      <!-- 质检项 -->
      <FormItem
        :label="
          $t(
            'qualityModule.qualityCheck.qualityBaseSet.formQualityCheckItem.name',
          )
        "
        name="itemName"
      >
        <Select
          v-model:value="editMessage.selectedId"
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
      <!-- 所属工序 -->
      <FormItem
        :label="
          $t(
            'qualityModule.qualityCheck.qualityBaseSet.formQualityCheckItem.process',
          )
        "
        name="produceName"
      >
        <Input v-model:value="editMessage.produceName" disabled />
      </FormItem>
      <!-- 特殊特性名称 -->
      <FormItem
        :label="
          $t('qualityModule.qualityCheck.qualityBaseSet.specialMaintain.name')
        "
        name="specialCharacterName"
      >
        <Input v-model:value="editMessage.specialCharacterName" disabled />
      </FormItem>
      <!-- 特殊特性符号 -->
      <FormItem
        :label="
          $t('qualityModule.qualityCheck.qualityBaseSet.specialMaintain.symbol')
        "
        name="specialCharacterSymbol"
      >
        <Input v-model:value="editMessage.specialCharacterSymbol" disabled />
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

  <QualityCheckDetail ref="qualityCheckDetailRef" />
  <StandardItem ref="standardItemRef" />
</template>

<style scoped></style>
