<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue、vxe-table 的组件
 * [OUTPUT]: 对外提供设备台账管理页面组件
 * [POS]: 设备管理模块 的设备台账管理页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-06-08 08:49:00
 */
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
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  RadioGroup,
  Row,
  Select,
  Space,
  Textarea,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  insertScadaEquipLedger,
  queryScadaEquipLedgerById,
  queryScadaEquipLedgerPage,
  updateScadaEquipLedger,
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
    { title: $t('equip.sequence'), type: 'seq', width: 50 },
    { field: 'equipmentCode', title: $t('equip.equipmentNumber'), minWidth: 110 },
    { field: 'equipmentNameCode', title: $t('equip.equipmentNameCode'), minWidth: 120 },
    { field: 'equipmentName', title: $t('equip.equipName'), minWidth: 120 },
    { field: 'equipmentTypeName', title: $t('equip.equipmentCategory'), minWidth: 120 },
    { field: 'manufacturer', title: $t('equip.manufacturer'), minWidth: 100 },
    { field: 'manufacturingCode', title: $t('equip.productionNumber'), minWidth: 120 },
    { field: 'manufacturingDate', title: $t('equip.manufacturingDate'), minWidth: 100 },
    { field: 'installDate', title: $t('equip.installationDate'), minWidth: 100 },
    { field: 'assets', title: $t('equip.assetStatus'), minWidth: 100, slots: { default: 'assets' } },
    { field: 'replaceCycle', title: $t('equip.replaceCycle'), minWidth: 100 },
    { field: 'actualUseHours', title: $t('equip.actualUseHours'), minWidth: 120 },
    { field: 'cTime', title: $t('equip.lastUsedDate'), minWidth: 120 },
    { field: 'remark', title: $t('equip.remark'), minWidth: 100 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('equip.operation'),
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
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// endregion

// region 查看 / 编辑 / 新增 操作

// 当前选中的表格行
const checkedRow = ref<any>({});
// 是否显示编辑抽屉
const showEditDrawer = ref(false);
// 抽屉状态：create/edit/detail
const dialogStatus = ref('create');

// 抽屉中的 form 表单对象
const editForm = ref();
// form 表单规则验证
const editRules = ref<any>({
  equipmentCode: [{ message: $t('equip.requiredField'), required: true, trigger: 'change' }],
  equipmentNameCode: [{ message: $t('equip.requiredField'), required: true, trigger: 'change' }],
});

// 设备类别选项
const equipmentTypeOptions = [
  { value: 1, label: $t('equip.primaryEquipment') },
  { value: 2, label: $t('equip.auxiliaryEquipment') },
];

/**
 * 关闭抽屉
 */
function onClose() {
  checkedRow.value = {};
  showEditDrawer.value = false;
}

/**
 * 新增
 */
function handleCreate() {
  checkedRow.value = {};
  dialogStatus.value = 'create';
  showEditDrawer.value = true;
}

/**
 * 编辑
 */
function handleUpdate(row: any) {
  dialogStatus.value = 'update';
  showEditDrawer.value = true;
  queryScadaEquipLedgerById({ id: row.id }).then((data: any) => {
    checkedRow.value = { ...data };
  });
}

/**
 * 查看详情
 */
function handleDetail(row: any) {
  dialogStatus.value = 'detail';
  showEditDrawer.value = true;
  queryScadaEquipLedgerById({ id: row.id }).then((data: any) => {
    checkedRow.value = { ...data };
  });
}

/**
 * 删除数据
 */
function delRow(_row: any) {
  Modal.confirm({
    cancelText: $t('common.cancel'),
    okText: $t('common.confirm'),
    okType: 'danger',
    onCancel() {
      message.warning($t('equip.cancelDelete'));
    },
    onOk() {
      // 由于新版 API 暂无用引用校验，直接提示删除功能请使用接口
      message.info($t('equip.deleteNotReady'));
    },
    title: $t('equip.confirmDeleteRecord'),
  });
}

/**
 * 表单提交
 */
function submit() {
  editForm.value.validate().then(() => {
    const data = { ...checkedRow.value };
    const ob = dialogStatus.value === 'update'
      ? updateScadaEquipLedger(data)
      : insertScadaEquipLedger(data);
    ob.then(() => {
      gridApi.reload();
      message.success($t('common.successfulOperation'));
      onClose();
    });
  });
}

// endregion

// region 查询数据

// 查询参数
const queryParams = ref<any>({});

// 资产状态列表
const statusList = [
  { label: $t('equip.all'), value:  undefined },
  { label: $t('equip.normal'), value: '1' },
  { label: $t('equip.deleted'), value: '2' },
];

/**
 * 查询数据
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve) => {
    const params = { ...queryParams.value };
    queryScadaEquipLedgerPage(page, pageSize, params).then(
      ({ total, list }: any) => {
        resolve({ total, items: list });
      },
    );
  });
}

// endregion

// region 权限查询

const author = ref<string[]>([]);

// endregion

// region 初始化

onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 设备编号 -->
        <FormItem
          :label="$t('equip.equipmentNumber')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.equipmentCode"
            :placeholder="$t('equip.pleaseEnterEquipmentNumber')"
            @keyup.enter="() => gridApi.reload()"
          />
        </FormItem>
        <!-- 设备名称 -->
        <FormItem :label="$t('equip.equipName')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.equipmentName"
            allow-clear
            class="!w-48"
            :placeholder="$t('equip.pleaseEnterEquipmentName')"
          />
        </FormItem>
        <!-- 使用部门 -->
        <FormItem :label="$t('equip.useDepartment')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.useDepartmentName"
            allow-clear
            class="!w-48"
            :placeholder="$t('equip.pleaseEnterUseDepartment')"
          />
        </FormItem>
        <!-- 资产状态 -->
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
            @click="handleCreate"
          >
            {{ $t('common.add') }}
          </Button>
        </template>
        <template #assets="{ row }">
          <span>{{ row.assets === 1 ? $t('equip.normal') : $t('equip.deleted') }}</span>
        </template>
        <template #action="{ row }">
          <!-- 查看按钮 -->
          <Tooltip>
            <template #title>{{ $t('common.view') }}</template>
            <Button type="link" @click="handleDetail(row)">
              <Icon icon="mdi:eye" class="inline-block align-middle text-2xl" />
            </Button>
          </Tooltip>
          <!-- 编辑按钮 -->
          <Tooltip v-if="author.includes('编辑')">
            <template #title>{{ $t('common.edit') }}</template>
            <Button type="link" @click="handleUpdate(row)">
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

    <!-- region 新增/编辑/查看 抽屉 -->
    <Drawer
      v-model:open="showEditDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="800"
      class="custom-class"
      placement="right"
      :title="dialogStatus === 'detail' ? $t('equip.view') : dialogStatus === 'update' ? $t('equip.edit') : $t('equip.add')"
      @close="onClose"
    >
      <Form
        v-if="dialogStatus !== 'detail'"
        ref="editForm"
        :label-col="{ span: 8 }"
        :model="checkedRow"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
      >
        <Row :gutter="8">
          <Col :span="12">
            <!-- 设备编号 -->
            <FormItem :label="$t('equip.equipmentNumber')" name="equipmentCode">
              <Input
                v-model:value="checkedRow.equipmentCode"
                :maxlength="20"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 设备名称 -->
            <FormItem :label="$t('equip.equipName')" name="equipmentNameCode">
              <Input
                v-model:value="checkedRow.equipmentNameCode"
                :maxlength="50"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="8">
          <Col :span="12">
            <!-- 生产厂家 -->
            <FormItem :label="$t('equip.productionFactory')" name="manufacturer">
              <Input
                v-model:value="checkedRow.manufacturer"
                :maxlength="30"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 出厂编号 -->
            <FormItem :label="$t('equip.productionNumber')" name="manufacturingCode">
              <Input
                v-model:value="checkedRow.manufacturingCode"
                :maxlength="20"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="8">
          <Col :span="12">
            <!-- 出厂日期 -->
            <FormItem :label="$t('equip.manufacturingDate')" name="manufacturingDate">
              <DatePicker
                v-model:value="checkedRow.manufacturingDate"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 安装日期 -->
            <FormItem :label="$t('equip.installationDate')" name="installDate">
              <DatePicker
                v-model:value="checkedRow.installDate"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="8">
          <Col :span="12">
            <!-- 设备类型 -->
            <FormItem :label="$t('equip.equipmentCategory')" name="equipmentType">
              <Select
                v-model:value="checkedRow.equipmentType"
                :options="equipmentTypeOptions"
                :placeholder="$t('equip.pleaseSelect')"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 更换周期 -->
            <FormItem :label="$t('equip.replaceCycle')" name="replaceCycle">
              <InputNumber
                v-model:value="checkedRow.replaceCycle"
                :maxlength="50"
                style="width: calc(100% - 46px); margin-right: 6px"
              />
              <span>{{ $t('equip.hours') }}</span>
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="8">
          <Col :span="12">
            <!-- 备注 -->
            <FormItem :label="$t('equip.remark')" name="remark">
              <Textarea
                v-model:value="checkedRow.remark"
                :autosize="{ minRows: 2, maxRows: 4 }"
                :maxlength="256"
              />
            </FormItem>
          </Col>
        </Row>
      </Form>
      <Descriptions
        v-else
        bordered
        :column="2"
        class="!mb-4"
      >
        <Descriptions.Item :label="$t('equip.equipmentNumber')">
          {{ checkedRow.equipmentCode }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('equip.equipName')">
          {{ checkedRow.equipmentName }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('equip.equipmentTypeCode')">
          {{ checkedRow.equipmentNameCode }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('equip.productionFactory')">
          {{ checkedRow.manufacturer }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('equip.productionNumber')">
          {{ checkedRow.manufacturingCode }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('equip.manufacturingDate')">
          {{ checkedRow.manufacturingDate }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('equip.installationDate')">
          {{ checkedRow.installDate }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('equip.equipmentCategory')">
          {{ equipmentTypeOptions.find(o => o.value === checkedRow.equipmentType)?.label || '' }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('equip.replaceCycle')">
          {{ checkedRow.replaceCycle }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('equip.remark')" :span="2">
          {{ checkedRow.remark }}
        </Descriptions.Item>
      </Descriptions>

      <template #footer>
        <Space>
          <Button @click="onClose">
            {{ $t('common.cancel') }}
          </Button>
          <Button
            v-if="dialogStatus !== 'detail'"
            type="primary"
            @click="submit"
          >
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
