<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
import { useAccessStore } from '@vben/stores';

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
  deleteScadaEquipName,
  insertScadaEquipName,
  queryScadaEquipNameCodeQuote,
  queryScadaEquipNamePage,
  updateScadaEquipName,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'equipmentName', title: '设备名称', minWidth: 120 },
    { field: 'equipmentNameCode', title: '设备名称编码', minWidth: 120 },
    { field: 'cTime', title: '创建时间', minWidth: 50 },
    { field: 'cUser', title: '创建人', minWidth: 50 },
    { field: 'remark', title: '备注', minWidth: 80 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 220,
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
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

const gridEvents: VxeGridListeners<any> = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// region 查看 / 编辑 / 新增 具体操作

// 当前选中的表格行
const checkedRow = ref<any>({});
// 是否显示编辑抽屉
const showEditDrawer = ref(false);
// 是否显示详情
const isShowDetails = ref(false);

// 抽屉冲的form表单对象
const editForm = ref();
// form表单规则验证
const editRules = ref<any>({
  equipmentCode: [
    {
      message: '此项为必填项',
      required: true,
      trigger: 'change',
    },
  ],
  equipmentNameCode: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
});
/**
 * 显示是编辑抽屉
 * @param row 表格行数据
 */
function editRow(row?: any) {
  checkedRow.value = row
    ? {
        ...row,
        zoningId: row.zoningId * 1,
      }
    : {};
  showEditDrawer.value = true;
}

function showDetails(row: any) {
  editRow(row);
  isShowDetails.value = true;
}

/**
 * 删除数据
 * @param row
 */
function delRow(row: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消删除!');
    },
    onOk() {
      queryScadaEquipNameCodeQuote({
        equipmentNameCode: row.equipmentNameCode,
      }).then((data: boolean) => {
        const delFun = () => {
          deleteScadaEquipName({ id: row.id }).then(() => {
            // 显示操作成功的提示信息
            message.success($t('common.successfulOperation'));
            gridApi.query();
          });
        };
        if (data) {
          Modal.confirm({
            cancelText: '取消',
            okText: '确认',
            okType: 'danger',
            onCancel() {
              message.warning('已取消删除!');
            },
            onOk() {
              delFun();
            },
            title: '该数据已被引用，是否删除?',
          });
        } else {
          delFun();
        }
      });
    },
    title: '是否确认删除该条数据?',
  });
}

/**
 * 关闭编辑抽屉
 */
function onClose() {
  checkedRow.value = {};
  showEditDrawer.value = false;
  isShowDetails.value = false;
}

/**
 * 表单提交
 */
function submit() {
  editForm.value.validate().then(() => {
    const ob = checkedRow.value.id
      ? updateScadaEquipName(checkedRow.value)
      : insertScadaEquipName(checkedRow.value);
    ob.then(() => {
      // 查询数据
      gridApi.query();
      message.success($t('common.successfulOperation'));
      onClose();
    });
  });
}

// endregion

// endregion

// region 查询数据
// 查询参数
const queryParams = ref<any>({});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params = {
      ...queryParams.value, // 展开 queryParams.value 对象，包含所有查询参数。
    };
    queryScadaEquipNamePage(page, pageSize, params).then(({ total, list }) => {
      // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
      resolve({
        total,
        items: list,
      });
    });
  });
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 初始化

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
    <!-- region 搜索 -->
    <Card class="mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 设备名称 -->
        <FormItem :label="$t('equip.equipName')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.equipmentName" />
        </FormItem>
        <!-- 设备名称编码 -->
        <FormItem :label="$t('equip.equipNameCode')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.equipmentNameCode" />
        </FormItem>

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
    <!-- endregion -->

    <!-- region 表格主体 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <!-- 新增按钮 -->
          <Button
            v-if="author.includes('新增')"
            type="primary"
            @click="editRow()"
          >
            {{ $t('common.add') }}
          </Button>
        </template>
        <template #action="{ row }">
          <!-- 编辑按钮 -->
          <Tooltip>
            <template #title>{{ $t('common.view') }}</template>
            <Button type="link" @click="showDetails(row)">
              <Icon icon="mdi:eye" class="inline-block align-middle text-2xl" />
            </Button>
          </Tooltip>
          <!-- 编辑按钮 -->
          <Tooltip v-if="author.includes('编辑')">
            <template #title>{{ $t('common.edit') }}</template>
            <Button type="link" @click="editRow(row)">
              <Icon
                icon="mdi:edit-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>

          <!-- 删除数据 -->
          <Tooltip v-if="author.includes('删除')">
            <template #title>{{ $t('common.delete') }}</template>
            <Button type="link" @click="delRow(row)" danger>
              <Icon
                icon="mdi-light:delete"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- region 新增/编辑 抽屉 -->
    <Drawer
      v-model:open="showEditDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="400"
      class="custom-class"
      placement="right"
      title="信息编辑"
      @close="onClose"
    >
      <Form
        ref="editForm"
        :label-col="{ span: 8 }"
        :model="checkedRow"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
      >
        <!-- 设备名称 -->
        <FormItem :label="$t('equip.equipName')" name="equipmentName">
          <Input
            v-model:value="checkedRow.equipmentName"
            :disabled="isShowDetails"
          />
        </FormItem>
        <!-- 设备名称编号 -->
        <FormItem :label="$t('equip.equipNameCode')" name="equipmentNameCode">
          <Input
            v-model:value="checkedRow.equipmentNameCode"
            :disabled="checkedRow.id"
          />
        </FormItem>
        <!-- 备注 -->
        <FormItem :label="$t('equip.remark')">
          <Input v-model:value="checkedRow.remark" :disabled="isShowDetails" />
        </FormItem>
        <!-- 创建人 -->
        <FormItem :label="$t('equip.createdBy')" v-if="isShowDetails">
          <Input v-model:value="checkedRow.cUser" disabled />
        </FormItem>
        <!-- 创建时间 -->
        <FormItem :label="$t('equip.createdTime')" v-if="isShowDetails">
          <Input v-model:value="checkedRow.cTime" disabled />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="onClose">
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
