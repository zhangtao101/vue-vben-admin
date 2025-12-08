<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  RadioGroup,
  Row,
  Space,
  Tooltip,
  TreeSelect,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteScadaEquipName,
  insertScadaEquipName,
  queryOrganizationTree,
  queryScadaEquipLedgerPage,
  queryScadaEquipNameCodeQuote,
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
    { field: 'equipmentCode', title: '设备编号', minWidth: 110 },
    { field: 'equipmentName', title: '设备名称', minWidth: 120 },
    { field: 'model', title: '型号', minWidth: 150 },
    { field: 'manufacturer', title: '生产厂家', minWidth: 100 },
    { field: 'manufacturingCode', title: '出厂编号', minWidth: 150 },
    { field: 'manufacturingDate', title: '出厂日期', minWidth: 100 },
    { field: 'supplier', title: '供应商', minWidth: 100 },
    { field: 'originalValue', title: '原值', minWidth: 150 },
    { field: 'installDate', title: '安装日期', minWidth: 100 },
    { field: 'useDepartmentName', title: '使用部门', minWidth: 150 },
    { field: 'lineType', title: '拉别', minWidth: 150 },
    { field: 'location', title: '存放位置', minWidth: 150 },
    { field: 'equipmentTypeName', title: '设备类别', minWidth: 150 },
    { field: 'assetsName', title: '资产状态', minWidth: 150 },
    { field: 'remark', title: '备注', minWidth: 100 },
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
const statusList = [
  {
    label: '全部',
    value: -1,
  },
  {
    label: '启用',
    value: 1,
  },
  {
    label: '停用',
    value: 2,
  },
];

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params = {
      ...queryParams.value, // 展开 queryParams.value 对象，包含所有查询参数。
    };
    queryScadaEquipLedgerPage(page, pageSize, params).then(
      ({ total, list }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total,
          items: list,
        });
      },
    );
  });
}

// endregion

// region 查询使用部门
// 部门列表
const listOfDepartments = ref<any>([]);

/**
 * 查询使用部门
 */
function queryTheUsageDepartment() {
  queryOrganizationTree().then((data) => {
    changeStatus(data);
    listOfDepartments.value = [data];
  });
}

/**
 * 递归处理部门树，设置 disabled 属性
 * @param org
 */
function changeStatus(org: any) {
  org.disabled = org.orgType === '公司';
  if (org.children && org.children.length > 0) {
    org.children.forEach((item: any) => {
      changeStatus(item);
    });
  }
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
  queryTheUsageDepartment();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 设备编号 -->
        <FormItem
          :label="$t('equip.equipmentNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.equipmentCode" />
        </FormItem>
        <!-- 设备名称 -->
        <FormItem :label="$t('equip.equipName')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.equipmentName" />
        </FormItem>
        <!-- 使用部门 -->
        <FormItem :label="$t('equip.useDepartment')" style="margin-bottom: 1em">
          <TreeSelect
            v-model:value="queryParams.useDepartmentName"
            show-search
            allow-clear
            class="!w-48"
            :dropdown-match-select-width="false"
            :tree-data="listOfDepartments"
            tree-node-filter-prop="orgFullName"
            :field-names="{
              children: 'children',
              label: 'orgFullName',
              value: 'orgCode',
            }"
          />
        </FormItem>
        <!-- 状态 -->
        <FormItem :label="$t('equip.assetStatus')" style="margin-bottom: 1em">
          <RadioGroup
            v-model:value="queryParams.assets"
            :options="statusList"
          />
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
      :width="800"
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
        <Row :gutter="8">
          <Col :span="8">
            <!-- 设备编号 -->
            <FormItem :label="$t('equip.equipmentNumber')" name="equipmentName">
              <Input
                v-model:value="checkedRow.equipmentName"
                :disabled="isShowDetails"
              />
            </FormItem>
          </Col>
          <Col :span="8">
            <!-- 设备名称 -->
            <FormItem :label="$t('equip.equipName')" name="equipmentName">
              <Input
                v-model:value="checkedRow.equipmentName"
                :disabled="isShowDetails"
              />
            </FormItem>
          </Col>
          <Col :span="8">
            <!-- 型号 -->
            <FormItem :label="$t('equip.model')" name="equipmentName">
              <Input
                v-model:value="checkedRow.equipmentName"
                :disabled="isShowDetails"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="8">
          <Col :span="8">
            <!-- 生产厂家 -->
            <FormItem
              :label="$t('equip.productionFactory')"
              name="equipmentName"
            >
              <Input
                v-model:value="checkedRow.equipmentName"
                :disabled="isShowDetails"
              />
            </FormItem>
          </Col>
          <Col :span="8">
            <!-- 出厂编号 -->
            <FormItem
              :label="$t('equip.productionNumber')"
              name="equipmentName"
            >
              <Input
                v-model:value="checkedRow.equipmentName"
                :disabled="isShowDetails"
              />
            </FormItem>
          </Col>
          <Col :span="8">
            <!-- 出厂日期 -->
            <FormItem
              :label="$t('equip.manufacturingDate')"
              name="equipmentName"
            >
              <Input
                v-model:value="checkedRow.equipmentName"
                :disabled="isShowDetails"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="8">
          <Col :span="8">
            <!-- 供应商 -->
            <FormItem :label="$t('equip.supplier')" name="equipmentName">
              <Input
                v-model:value="checkedRow.equipmentName"
                :disabled="isShowDetails"
              />
            </FormItem>
          </Col>
          <Col :span="8">
            <!-- 原值 -->
            <FormItem :label="$t('equip.originalValue')" name="equipmentName">
              <Input
                v-model:value="checkedRow.equipmentName"
                :disabled="isShowDetails"
              />
            </FormItem>
          </Col>
          <Col :span="8">
            <!-- 安装日期 -->
            <FormItem
              :label="$t('equip.installationDate')"
              name="equipmentName"
            >
              <Input
                v-model:value="checkedRow.equipmentName"
                :disabled="isShowDetails"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="8">
          <Col :span="8">
            <!-- 拉别 -->
            <FormItem :label="$t('equip.partitioning')" name="equipmentName">
              <Input
                v-model:value="checkedRow.equipmentName"
                :disabled="isShowDetails"
              />
            </FormItem>
          </Col>
          <Col :span="8">
            <!-- 存放位置 -->
            <FormItem :label="$t('equip.storageLocation')" name="equipmentName">
              <Input
                v-model:value="checkedRow.equipmentName"
                :disabled="isShowDetails"
              />
            </FormItem>
          </Col>
          <Col :span="8">
            <!-- 设备类别 -->
            <FormItem
              :label="$t('equip.equipmentCategory')"
              name="equipmentName"
            >
              <Input
                v-model:value="checkedRow.equipmentName"
                :disabled="isShowDetails"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="8">
          <Col :span="8">
            <!-- 资产状态 -->
            <FormItem :label="$t('equip.assetStatus')" name="equipmentName">
              <Input
                v-model:value="checkedRow.equipmentName"
                :disabled="isShowDetails"
              />
            </FormItem>
          </Col>
          <Col :span="8">
            <!-- 设备名称 -->
            <FormItem :label="$t('equip.equipName')" name="equipmentName">
              <Input
                v-model:value="checkedRow.equipmentName"
                :disabled="isShowDetails"
              />
            </FormItem>
          </Col>
          <Col :span="8">
            <!-- 设备名称 -->
            <FormItem :label="$t('equip.equipName')" name="equipmentName">
              <Input
                v-model:value="checkedRow.equipmentName"
                :disabled="isShowDetails"
              />
            </FormItem>
          </Col>
        </Row>
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
