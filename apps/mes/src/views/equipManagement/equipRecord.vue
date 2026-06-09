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
import { useAccessStore } from '@vben/stores';

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
  TreeSelect,
  Upload,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteFile,
  fetchFileList,
  insertFile,
  insertScadaEquipLedger,
  queryEquipmentByName,
  queryOrganizationTree,
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
  equipmentCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  equipmentNameCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  assets: [{ message: '此项为必填项', required: true, trigger: 'change' }],
});

// 设备名称远程搜索列表
const equipNameList = ref<any[]>([]);
// 设备类别选项
const equipmentTypeOptions = [
  { value: 1, label: '主要设备' },
  { value: 2, label: '辅助设备' },
];
// 资产状态选项
const assetsOptions = [
  { value: '1', label: '启用' },
  { value: '2', label: '停用' },
];

// 文件数据
const file1 = ref<any[]>([]); // 安装验收单
const file2 = ref<any[]>([]); // 其他附件
// Upload 组件用文件列表
const uploadFileList1 = ref<any[]>([]);
const uploadFileList2 = ref<any[]>([]);

// 文件上传 accessStore
const accessStore = useAccessStore();

function getUploadUrl() {
  return `/ht/${import.meta.env.VITE_GLOB_MES_FILE}/file/upload`;
}

/**
 * 关闭抽屉
 */
function onClose() {
  checkedRow.value = {};
  showEditDrawer.value = false;
  file1.value = [];
  file2.value = [];
  uploadFileList1.value = [];
  uploadFileList2.value = [];
  equipNameList.value = [];
}

/**
 * 新增
 */
function handleCreate() {
  checkedRow.value = {
    assets: '1',
  };
  file1.value = [];
  file2.value = [];
  uploadFileList1.value = [];
  uploadFileList2.value = [];
  equipNameList.value = [];
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
    checkedRow.value.assets = data.assets.toString();
    equipNameList.value = [{
      value: data.equipmentNameCode,
      label: data.equipmentName,
    }];
    getFileList(data.id);
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
    checkedRow.value.assets = data.assets ? data.assets.toString() : '';
    equipNameList.value = [{
      value: data.equipmentNameCode,
      label: data.equipmentName,
    }];
    getFileList(data.id);
  });
}

/**
 * 删除数据
 */
function delRow(_row: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消删除!');
    },
    onOk() {
      // 由于新版 API 暂无用引用校验，直接提示删除功能请使用接口
      message.info('删除功能暂未完成');
    },
    title: '是否确认删除该条数据?',
  });
}

/**
 * 表单提交
 */
function submit() {
  editForm.value.validate().then(() => {
    const data = { ...checkedRow.value };
    // 附件信息
    if (file1.value.length > 0) {
      data.file1 = file1.value[0];
    }
    if (file2.value.length > 0) {
      data.file2 = file2.value[0];
    }
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

// region 文件上传

/**
 * 获取文件列表
 */
function getFileList(code: string) {
  file1.value = [];
  file2.value = [];
  uploadFileList1.value = [];
  uploadFileList2.value = [];
  // 安装验收单
  fetchFileList({
    moduleType: 1,
    attachmentCode: 'AZYSD',
    code,
  }).then((data: any) => {
    if (data && data.length > 0) {
      const latest = data[data.length - 1];
      file1.value = [latest];
      uploadFileList1.value = [{
        uid: latest.id,
        name: latest.fileName,
        status: 'done',
        url: latest.fileUrl || latest.filePath,
      }];
    }
  });
  // 其他附件
  fetchFileList({
    moduleType: 1,
    attachmentCode: 'QTFJ',
    code,
  }).then((data: any) => {
    if (data && data.length > 0) {
      const latest = data[data.length - 1];
      file2.value = [latest];
      uploadFileList2.value = [{
        uid: latest.id,
        name: latest.fileName,
        status: 'done',
        url: latest.fileUrl || latest.filePath,
      }];
    }
  });
}

/**
 * 安装验收单上传变更
 */
function handleFile1Change(info: any) {
  const { file } = info;
  if (file.status === 'done') {
    const resp = file.response || {};
    const fileData: any = {
      attachmentCode: 'AZYSD',
      code: checkedRow.value.id,
      moduleType: 1,
      fileName: file.name,
      filePath: resp.remoteFilename || resp.data?.remoteFilename,
      fileUrl: resp.fileUrl || resp.data?.fileUrl,
    };
    if (dialogStatus.value === 'update') {
      insertFile(fileData).then((id: any) => {
        fileData.id = id;
        file1.value = [fileData];
        uploadFileList1.value = [{
          uid: id,
          name: file.name,
          status: 'done',
          url: resp.fileUrl || resp.data?.fileUrl,
        }];
        message.success('上传成功');
      });
    } else {
      file1.value = [fileData];
      uploadFileList1.value = [{
        uid: -1,
        name: file.name,
        status: 'done',
      }];
      message.success('上传成功');
    }
  } else if (file.status === 'error') {
    message.error('上传失败');
  }
}

/**
 * 其他附件上传变更
 */
function handleFile2Change(info: any) {
  const { file } = info;
  if (file.status === 'done') {
    const resp = file.response || {};
    const fileData: any = {
      attachmentCode: 'QTFJ',
      code: checkedRow.value.id,
      moduleType: 1,
      fileName: file.name,
      filePath: resp.remoteFilename || resp.data?.remoteFilename,
      fileUrl: resp.fileUrl || resp.data?.fileUrl,
    };
    if (dialogStatus.value === 'update') {
      insertFile(fileData).then((id: any) => {
        fileData.id = id;
        file2.value = [fileData];
        uploadFileList2.value = [{
          uid: id,
          name: file.name,
          status: 'done',
          url: resp.fileUrl || resp.data?.fileUrl,
        }];
        message.success('上传成功');
      });
    } else {
      file2.value = [fileData];
      uploadFileList2.value = [{
        uid: -1,
        name: file.name,
        status: 'done',
      }];
      message.success('上传成功');
    }
  } else if (file.status === 'error') {
    message.error('上传失败');
  }
}

/**
 * 文件预览回调（点击文件名下载）
 */
function handleFile1Preview(file: any) {
  const item = file1.value.find((f: any) => f.fileName === file.name);
  if (item) fileDown(item);
}

function handleFile2Preview(file: any) {
  const item = file2.value.find((f: any) => f.fileName === file.name);
  if (item) fileDown(item);
}

/**
 * 文件移除回调
 */
function handleFile1Remove() {
  const item = file1.value[0];
  if (item && dialogStatus.value === 'update' && item.id) {
    deleteFile(item.id).then(() => {
      file1.value = [];
      message.success('删除成功!');
    });
  } else {
    file1.value = [];
  }
}

function handleFile2Remove() {
  const item = file2.value[0];
  if (item && dialogStatus.value === 'update' && item.id) {
    deleteFile(item.id).then(() => {
      file2.value = [];
      message.success('删除成功!');
    });
  } else {
    file2.value = [];
  }
}

/**
 * 文件下载
 */
function fileDown(row: any) {
  const url = row.fileUrl || row.filePath;
  if (url) {
    window.location.href = `${url}?attname=${row.fileName}`;
  }
}

// endregion

// region 设备名称远程搜索

/**
 * 远程搜索设备名称
 */
function getEquipName(query: string) {
  if (query) {
    queryEquipmentByName(query).then((data: any) => {
      equipNameList.value = (data || []).map((item: any) => ({
        value: item.code,
        label: item.name,
      }));
    });
  } else {
    equipNameList.value = [];
  }
}

/**
 * 设备名称下拉框获取焦点时清空列表
 */
function getFocus() {
  equipNameList.value = [];
}

/**
 * 选择设备名称后回填设备编码
 */
function handleEquipNameSelect(value: any) {
  const selected = equipNameList.value.find((item: any) => item.value === value);
  if (selected) {
    checkedRow.value.equipmentName = selected.label;
  }
}

// endregion

// region 查询数据

// 查询参数
const queryParams = ref<any>({});

// 资产状态列表
const statusList = [
  { label: '全部', value: '' },
  { label: '启用', value: '1' },
  { label: '停用', value: '2' },
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

// region 查询使用部门

// 部门列表
const listOfDepartments = ref<any>([]);

/**
 * 递归处理部门树，设置 disabled 属性（公司类型禁用）
 */
function changeStatus(org: any) {
  org.disabled = org.orgType === '公司';
  if (org.children && org.children.length > 0) {
    org.children.forEach((item: any) => {
      changeStatus(item);
    });
  }
}

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
 * 使用部门选择回调：将选中节点的 orgFullName 赋给 useDepartmentName
 */
function handleDepartmentSelect(_value: any, node: any) {
  checkedRow.value.useDepartmentName = node.orgFullName;
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
  queryTheUsageDepartment();
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
            placeholder="请输入设备编号"
            @keyup.enter="() => gridApi.reload()"
          />
        </FormItem>
        <!-- 设备名称 -->
        <FormItem :label="$t('equip.equipName')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.equipmentName"
            allow-clear
            class="!w-48"
            placeholder="请输入设备名称"
          />
        </FormItem>
        <!-- 使用部门 -->
        <FormItem :label="$t('equip.useDepartment')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.useDepartmentName"
            allow-clear
            class="!w-48"
            placeholder="请输入使用部门"
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
      :title="dialogStatus === 'detail' ? '查看' : dialogStatus === 'update' ? '编辑' : '新增'"
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
                :disabled="dialogStatus === 'detail'"
                :maxlength="20"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 设备名称 -->
            <FormItem :label="$t('equip.equipName')" name="equipmentNameCode">
              <Select
                v-model:value="checkedRow.equipmentNameCode"
                show-search
                :disabled="dialogStatus === 'detail'"
                placeholder="请输入设备名称"
                :filter-option="false"
                :options="equipNameList"
                @search="getEquipName"
                @focus="getFocus"
                @select="handleEquipNameSelect"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="8">
          <Col :span="12">
            <!-- 型号 -->
            <FormItem :label="$t('equip.model')" name="model">
              <Input
                v-model:value="checkedRow.model"
                :disabled="dialogStatus === 'detail'"
                :maxlength="20"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 生产厂家 -->
            <FormItem :label="$t('equip.productionFactory')" name="manufacturer">
              <Input
                v-model:value="checkedRow.manufacturer"
                :disabled="dialogStatus === 'detail'"
                :maxlength="30"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="8">
          <Col :span="12">
            <!-- 出厂编号 -->
            <FormItem :label="$t('equip.productionNumber')" name="manufacturingCode">
              <Input
                v-model:value="checkedRow.manufacturingCode"
                :disabled="dialogStatus === 'detail'"
                :maxlength="20"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 出厂日期 -->
            <FormItem :label="$t('equip.manufacturingDate')" name="manufacturingDate">
              <DatePicker
                v-model:value="checkedRow.manufacturingDate"
                :disabled="dialogStatus === 'detail'"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="8">
          <Col :span="12">
            <!-- 供应商 -->
            <FormItem :label="$t('equip.supplier')" name="supplier">
              <Input
                v-model:value="checkedRow.supplier"
                :disabled="dialogStatus === 'detail'"
                :maxlength="30"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 原值 -->
            <FormItem :label="$t('equip.originalValue')" name="originalValue">
              <InputNumber
                v-model:value="checkedRow.originalValue"
                :disabled="dialogStatus === 'detail'"
                style="width: 100%"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="8">
          <Col :span="12">
            <!-- 安装日期 -->
            <FormItem :label="$t('equip.installationDate')" name="installDate">
              <DatePicker
                v-model:value="checkedRow.installDate"
                :disabled="dialogStatus === 'detail'"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 使用部门 -->
            <FormItem :label="$t('equip.useDepartment')" name="useDepartmentName">
              <TreeSelect
                v-model:value="checkedRow.useDepartmentCode"
                show-search
                allow-clear
                :dropdown-match-select-width="false"
                :tree-data="listOfDepartments"
                tree-node-filter-prop="orgFullName"
                :field-names="{
                  children: 'children',
                  label: 'orgFullName',
                  value: 'orgCode',
                }"
                @select="handleDepartmentSelect"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="8">
          <Col :span="12">
            <!-- 拉别 -->
            <FormItem :label="$t('equip.partitioning')" name="lineType">
              <Input
                v-model:value="checkedRow.lineType"
                :disabled="dialogStatus === 'detail'"
                :maxlength="20"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 存放位置 -->
            <FormItem :label="$t('equip.storageLocation')" name="location">
              <Input
                v-model:value="checkedRow.location"
                :disabled="dialogStatus === 'detail'"
                :maxlength="20"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="8">
          <Col :span="12">
            <!-- 设备类别 -->
            <FormItem :label="$t('equip.equipmentCategory')" name="equipmentType">
              <Select
                v-model:value="checkedRow.equipmentType"
                :disabled="dialogStatus === 'detail'"
                :options="equipmentTypeOptions"
                placeholder="请选择"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <!-- 资产状态 -->
            <FormItem :label="$t('equip.assetStatus')" name="assets">
              <RadioGroup
                v-model:value="checkedRow.assets"
                :disabled="dialogStatus === 'detail'"
                :options="assetsOptions"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="8">
          <Col :span="12">
            <!-- 备注 -->
            <FormItem :label="$t('equip.remark')" name="remark">
              <Textarea
                v-model:value="checkedRow.remark"
                :disabled="dialogStatus === 'detail'"
                :autosize="{ minRows: 2, maxRows: 4 }"
                :maxlength="256"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem label="安装验收单:" name="file1">
              <Upload
                v-if="dialogStatus !== 'detail'"
                v-model:file-list="uploadFileList1"
                name="file"
                :multiple="false"
                :action="getUploadUrl()"
                :headers="{ Authorization: `${accessStore.accessToken}` }"
                @change="handleFile1Change"
                @preview="handleFile1Preview"
                @remove="handleFile1Remove"
              >
                <Button>
                  <Icon icon="mdi:cloud-upload" class="inline-block align-middle text-xl text-[#5085ff]" />
                  上传
                </Button>
              </Upload>
              <div v-else v-for="item in file1" :key="item.id">
                <span class="cursor-pointer text-blue-500" @click="fileDown(item)">{{ item.fileName }}</span>
              </div>
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="8">
          <Col :span="12">
            <FormItem label="其他附件:" name="file2">
              <Upload
                v-if="dialogStatus !== 'detail'"
                v-model:file-list="uploadFileList2"
                name="file"
                :multiple="false"
                :action="getUploadUrl()"
                :headers="{ Authorization: `${accessStore.accessToken}` }"
                @change="handleFile2Change"
                @preview="handleFile2Preview"
                @remove="handleFile2Remove"
              >
                <Button>
                  <Icon icon="mdi:cloud-upload" class="inline-block align-middle text-xl text-[#5085ff]" />
                  上传
                </Button>
              </Upload>
              <div v-else v-for="item in file2" :key="item.id">
                <span class="cursor-pointer text-blue-500" @click="fileDown(item)">{{ item.fileName }}</span>
              </div>
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
        <Descriptions.Item :label="$t('equip.model')">
          {{ checkedRow.model }}
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
        <Descriptions.Item :label="$t('equip.supplier')">
          {{ checkedRow.supplier }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('equip.originalValue')">
          {{ checkedRow.originalValue }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('equip.installationDate')">
          {{ checkedRow.installDate }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('equip.useDepartment')">
          {{ checkedRow.useDepartmentName }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('equip.partitioning')">
          {{ checkedRow.lineType }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('equip.storageLocation')">
          {{ checkedRow.location }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('equip.equipmentCategory')">
          {{ equipmentTypeOptions.find(o => o.value === checkedRow.equipmentType)?.label || '' }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('equip.assetStatus')">
          {{ assetsOptions.find(o => o.value === checkedRow.assets)?.label || '' }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('equip.remark')" :span="2">
          {{ checkedRow.remark }}
        </Descriptions.Item>
        <Descriptions.Item label="安装验收单" :span="2">
          <div v-for="item in file1" :key="item.id">
            <span class="cursor-pointer text-blue-500" @click="fileDown(item)">{{ item.fileName }}</span>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="其他附件" :span="2">
          <div v-for="item in file2" :key="item.id">
            <span class="cursor-pointer text-blue-500" @click="fileDown(item)">{{ item.fileName }}</span>
          </div>
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
