<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
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
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteSpecialCharacter,
  insertSpecialCharacter,
  querySpecialCharacter,
  querySpecialCharacterById,
  updateSpecialCharacter,
} from '#/api';
import { queryAuth } from '#/util';

// region 表格

/**
 * 表格配置项
 * 定义表格的列、样式、工具栏等配置
 */
const gridOptions: VxeGridProps<any> = {
  align: 'center', // 表格内容居中对齐
  border: true, // 显示表格边框
  columns: [
    { title: '序号', type: 'seq', width: 50 }, // 序号列
    { field: 'specialCharacterName', title: '特殊特性名称', minWidth: 90 }, // 特殊特性名称列
    { field: 'specialCharacterSymbol', title: '特殊特性符号', minWidth: 90 }, // 特殊特性符号列
    { field: 'remark', title: '备注', minWidth: 100 }, // 备注列
    { field: 'operateTime', title: '操作时间', minWidth: 150 }, // 操作时间列
    { field: 'operateUserName', title: '操作人', minWidth: 80 }, // 操作人列
    {
      title: '操作',
      minWidth: 150,
      fixed: 'right',
      slots: {
        default: 'action', // 使用action插槽自定义操作列
      },
    },
  ],
  height: 500, // 表格高度
  stripe: true, // 斑马纹效果
  sortConfig: {
    multiple: true, // 支持多列排序
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
    custom: true, // 自定义工具栏
    refresh: true, // 显示刷新按钮
    zoom: true, // 显示缩放按钮
  },
};

/**
 * 表格事件处理
 */
const gridEvents: any = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

/**
 * 创建表格实例
 * Grid: 表格组件
 * gridApi: 表格API，用于操作表格
 */
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 查询参数
const queryParams = ref<any>({});

/**
 * queryData - 负责根据当前的查询参数、分页信息，从后端服务查询数据
 * @param {Object} param - 查询参数对象
 * @param {number} param.page - 当前页码
 * @param {number} param.pageSize - 每页显示条数
 * @returns {Promise} 返回包含总条数和数据列表的Promise
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 构建查询参数对象，包含所有查询参数、当前页码和每页显示的数据条数
    const params = {
      // 展开 queryParams.value 对象，包含所有查询参数
      ...queryParams.value,
      // 设置当前页码
      pageNum: page,
      // 设置每页显示的数据条数
      pageSize,
    };

    // 调用 querySpecialCharacter 函数查询数据
    querySpecialCharacter(params)
      .then(({ total, results }) => {
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

// region 新增/编辑 抽屉

// 编辑form表单引用
const editForm = ref();
// 编辑抽屉是否显示的状态
const showEditDrawer = ref(false);
// 编辑的对象数据
const editItem = ref<any>({});
// form表单规则验证
const editRules = ref<any>({
  specialCharacterName: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  specialCharacterSymbol: [
    { message: '此项为必填项', required: false, trigger: 'change' },
  ],
  remark: [{ message: '此项为必填项', required: true, trigger: 'change' }],
});

/**
 * 显示编辑抽屉
 * @param {Object} [item] - 要编辑的行数据，如果为空则为新增操作
 */
function showEditDrawerFn(item?: any) {
  if (item) {
    // 如果有传入item，则查询详情数据进行编辑
    querySpecialCharacterById(item.id).then((data) => {
      editItem.value = {
        ...data,
      };
    });
  } else {
    // 否则清空编辑对象，进行新增操作
    editItem.value = {};
  }
  showEditDrawer.value = true;
}

/**
 * 关闭编辑抽屉
 */
function closeEditDrawer() {
  editItem.value = {};
  showEditDrawer.value = false;
}

/**
 * 提交表单数据
 * 根据是否有id判断是新增还是编辑操作
 */
function submit() {
  editForm.value.validate().then(() => {
    const params = {
      ...editItem.value,
    };
    // 根据是否有id判断是更新还是新增操作
    const ob = params.id
      ? updateSpecialCharacter(params)
      : insertSpecialCharacter(params);
    ob.then(() => {
      closeEditDrawer();
      message.success($t('common.successfulOperation'));
      // 刷新表格数据
      gridApi.reload();
    });
  });
}

// endregion

// region 删除

/**
 * 处理删除操作
 * @param {Object} row - 当前要删除的行数据
 */
function delPhysicalWarehouse(row: any) {
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
      deleteSpecialCharacter(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        // 刷新表格数据
        gridApi.reload();
      });
    },
    title: '是否确认删除?',
  });
}

// endregion

// region 初始化
// 路由信息
const route = useRoute();
// 当前页面按钮权限列表
const author = ref<string[]>([]);

/**
 * 组件挂载时执行
 * 查询当前页面的权限信息
 */
onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// endregion
</script>

<template>
  <Page>
    <Card class="mb-8">
      <Grid>
        <template #toolbar-tools>
          <Button
            type="primary"
            @click="showEditDrawerFn()"
            class="mx-2"
            v-if="author.includes('新增')"
          >
            {{ $t('common.add') }}
          </Button>
        </template>
        <template #action="{ row }">
          <!-- 编辑按钮 -->
          <Tooltip v-if="author.includes('编辑')">
            <template #title>
              {{ $t('common.edit') }}
            </template>
            <Button type="link" @click="showEditDrawerFn(row)" class="px-1">
              <Icon
                icon="mdi:edit"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>

          <!-- 删除按钮 -->
          <Tooltip v-if="author.includes('删除')">
            <template #title>
              {{ $t('common.delete') }}
            </template>
            <Button
              type="link"
              @click="delPhysicalWarehouse(row)"
              danger
              class="px-1"
            >
              <Icon
                icon="mdi:delete-forever-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>

    <!-- 新增/编辑 抽屉 -->
    <Drawer
      v-model:open="showEditDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="600"
      placement="right"
      :title="$t('common.edit')"
      @close="closeEditDrawer()"
      class="z-auto"
    >
      <Form
        ref="editForm"
        :model="editItem"
        :rules="editRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <!-- 特殊特性名称 -->
        <FormItem
          :label="
            $t('qualityModule.qualityCheck.qualityBaseSet.specialMaintain.name')
          "
          name="specialCharacterName"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="editItem.specialCharacterName" />
        </FormItem>
        <!-- 特殊特性符号 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.specialMaintain.symbol',
            )
          "
          name="specialCharacterSymbol"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="editItem.specialCharacterSymbol" />
        </FormItem>
        <!-- 备注 -->
        <FormItem
          :label="
            $t(
              'qualityModule.qualityCheck.qualityBaseSet.specialMaintain.remark',
            )
          "
          name="remark"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="editItem.remark" />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消按钮 -->
          <Button @click="closeEditDrawer">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认按钮 -->
          <Button type="primary" @click="submit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
