<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiEditOutline, MdiLightDelete, MdiSearch } from '@vben/icons';

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
  SelectOption,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addSubLineRel,
  deleteSubLineRel,
  listSubProductionLines,
  searchSubLineRel,
  updateSubLineRel,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

/** 制面工序：子产线下拉按该工序查询 */
const PROCESS_TYPE_NOODLE = 3;
/** 包装工序：子产线下拉按该工序查询 */
const PROCESS_TYPE_PACKAGE = 4;

// region 表格操作
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', title: $t('baseInfo.serialNumber'), width: 60 },
    {
      field: 'noodleSubLineCode',
      title: $t('baseInfo.noodleSubLineCode'),
      minWidth: 150,
    },
    {
      field: 'noodleSubLineName',
      title: $t('baseInfo.noodleSubLineName'),
      minWidth: 150,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('baseInfo.action'),
      minWidth: 120,
    },
  ],
  height: 500,
  stripe: true,
  pagerConfig: { enabled: true, pageSize: 20 },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
  proxyConfig: {
    ajax: {
      query: ({ page }) => {
        return searchSubLineRel({
          ...queryParams.value,
          pageNum: page?.currentPage,
          pageSize: page?.pageSize,
        }).then((response: any) => ({
          total: response?.total || 0,
          items: response?.list || [],
        }));
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// endregion

// region 查询条件
const queryParams = ref({
  noodleSubLineCode: undefined as string | undefined,
  noodleSubLineName: undefined as string | undefined,
});

// endregion

// region 字典数据
/** 制面产线下拉选项（工序 3） */
const noodleSubLineOptions = ref<any[]>([]);
/** 包装产线下拉选项（工序 4） */
const packageSubLineOptions = ref<any[]>([]);

// endregion

// region 抽屉内：包装产线多选表格（数据取自包装工序子产线）
const packageGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: { highlight: true, trigger: 'row' },
  columns: [
    { type: 'checkbox', width: 50 },
    { type: 'seq', title: $t('baseInfo.serialNumber'), width: 60 },
    {
      field: 'subLineCode',
      minWidth: 140,
      title: $t('baseInfo.subLineCode'),
    },
    {
      field: 'subLineName',
      minWidth: 140,
      title: $t('baseInfo.subLineName'),
    },
  ],
  height: 320,
  pagerConfig: { enabled: false },
  rowConfig: { isHover: true, keyField: 'id' },
  stripe: true,
  proxyConfig: {
    ajax: {
      query: () =>
        Promise.resolve({
          items: packageSubLineOptions.value,
          total: packageSubLineOptions.value.length,
        }),
    },
  },
};

/** 勾选变化：同步已选包装产线 id，供表单校验与提交使用 */
function handlePackageCheckChange() {
  const records = packageGridApi.grid?.getCheckboxRecords() || [];
  formData.value.packageSubLineIds = records.map((item: any) => item.id);
  formRef.value?.clearValidate(['packageSubLineIds']);
}

const packageGridEvents: VxeGridListeners<any> = {
  checkboxAll: handlePackageCheckChange,
  checkboxChange: handlePackageCheckChange,
};

const [PackageGrid, packageGridApi] = useVbenVxeGrid({
  gridEvents: packageGridEvents,
  gridOptions: packageGridOptions,
});

// endregion

// region 抽屉/弹框
const showEditDrawer = ref(false);
const editMode = ref(false);
const formRef = ref();

const formData = ref({
  noodleSubLineId: undefined as number | undefined,
  packageSubLineIds: [] as number[],
});

const rules: any = {
  noodleSubLineId: [
    {
      required: true,
      message: $t('baseInfo.selectNoodleSubLine'),
      trigger: 'change',
    },
  ],
  packageSubLineIds: [
    {
      required: true,
      message: $t('baseInfo.selectPackageSubLine'),
      trigger: 'change',
      type: 'array',
    },
  ],
};

// endregion

// region 权限
const author = ref<string[]>([]);

onMounted(() => {
  loadSubLineOptions();
  loadAuthor();
});

/**
 * 加载制面/包装产线下拉选项
 */
function loadSubLineOptions() {
  // 复用子产线查询接口，按工序分别取制面（3）与包装（4）子产线
  listSubProductionLines({ processType: PROCESS_TYPE_NOODLE }).then(
    (res: any) => {
      noodleSubLineOptions.value = res?.list || [];
    },
  );
  listSubProductionLines({ processType: PROCESS_TYPE_PACKAGE }).then(
    (res: any) => {
      packageSubLineOptions.value = res?.list || [];
    },
  );
}

/**
 * 加载权限
 */
function loadAuthor() {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
}

/**
 * 查询
 */
function handleSearch() {
  gridApi.reload();
}

/**
 * 重置
 */
function handleReset() {
  queryParams.value = {
    noodleSubLineCode: undefined,
    noodleSubLineName: undefined,
  };
  gridApi.reload();
}

/**
 * 初始化抽屉内包装产线表格：清空旧勾选后按传入 id 回显勾选
 * @param selectedIds 需要勾选的包装子产线 id
 */
function initPackageGrid(selectedIds: number[]) {
  nextTick(() => {
    packageGridApi.grid?.clearCheckboxRow();
    packageGridApi.reload().then(() => {
      // 数据加载完成后再恢复勾选，避免表格实例未就绪
      setTimeout(() => restorePackageSelection(selectedIds), 100);
    });
  });
}

/**
 * 恢复包装产线表格的勾选状态
 * @param selectedIds 需要勾选的包装子产线 id
 */
function restorePackageSelection(selectedIds: number[]) {
  const grid: any = packageGridApi.grid;
  if (!grid) return;
  const rows = (grid.getData() || []).filter((item: any) =>
    selectedIds.includes(item.id),
  );
  if (rows.length > 0) {
    grid.setCheckboxRow(rows, true);
  }
  // 以表格实际数据为准，剔除已不存在的 id
  formData.value.packageSubLineIds = (grid.getCheckboxRecords() || []).map(
    (item: any) => item.id,
  );
}

/**
 * 新增
 */
function handleAdd() {
  editMode.value = false;
  formData.value = {
    noodleSubLineId: undefined,
    packageSubLineIds: [],
  };
  showEditDrawer.value = true;
  formRef.value?.clearValidate();
  initPackageGrid([]);
}

/**
 * 编辑：制面产线不可修改，仅可调整包装产线
 */
function handleEdit(row: any) {
  editMode.value = true;
  const packageSubLineIds = (row.packageList || []).map((item: any) => item.id);
  formData.value = {
    noodleSubLineId: row.noodleSubLineId,
    packageSubLineIds,
  };
  showEditDrawer.value = true;
  formRef.value?.clearValidate();
  initPackageGrid(packageSubLineIds);
}

/**
 * 删除
 */
function handleDelete(row: any) {
  Modal.confirm({
    title: $t('baseInfo.confirmTitle'),
    content: $t('baseInfo.confirmContent'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    okType: 'danger',
    onOk() {
      deleteSubLineRel(row.noodleSubLineId).then(() => {
        message.success($t('baseInfo.deleteSuccess'));
        gridApi.reload();
      });
    },
  });
}

/**
 * 提交表单
 */
function handleSubmit() {
  formRef.value?.validate().then(() => {
    const params = {
      noodleSubLineId: formData.value.noodleSubLineId as number,
      packageSubLineIds: formData.value.packageSubLineIds,
    };
    const request = editMode.value
      ? updateSubLineRel(params)
      : addSubLineRel(params);
    request.then(() => {
      message.success(
        editMode.value
          ? $t('baseInfo.updateSuccess')
          : $t('baseInfo.createSuccess'),
      );
      handleClose();
      gridApi.reload();
    });
  });
}

/**
 * 关闭抽屉
 */
function handleClose() {
  showEditDrawer.value = false;
  formData.value = {
    noodleSubLineId: undefined,
    packageSubLineIds: [],
  };
  packageGridApi.grid?.clearCheckboxRow();
  formRef.value?.resetFields();
}
</script>

<template>
  <Page>
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem :label="$t('baseInfo.noodleSubLineCode')">
          <Input
            v-model:value="queryParams.noodleSubLineCode"
            allow-clear
            :placeholder="$t('baseInfo.inputNoodleSubLineCode')"
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem :label="$t('baseInfo.noodleSubLineName')">
          <Input
            v-model:value="queryParams.noodleSubLineName"
            allow-clear
            :placeholder="$t('baseInfo.inputNoodleSubLineName')"
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            @click="handleSearch"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
        <FormItem>
          <Button @click="handleReset">
            {{ $t('common.reset') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <Card>
      <Grid>
        <template #toolbar-tools>
          <Button
            v-if="author.includes('新增')"
            type="primary"
            @click="handleAdd"
          >
            {{ $t('common.add') }}
          </Button>
        </template>

        <template #action="{ row }">
          <Space :size="8">
            <Tooltip v-if="author.includes('编辑')">
              <template #title>
                {{ $t('common.edit') }}
              </template>
              <Button
                :icon="h(MdiEditOutline, { class: 'inline-block size-6' })"
                type="link"
                @click="handleEdit(row)"
              />
            </Tooltip>
            <Tooltip v-if="author.includes('删除')">
              <template #title>
                {{ $t('common.delete') }}
              </template>
              <Button
                :icon="h(MdiLightDelete, { class: 'inline-block size-6' })"
                danger
                type="link"
                @click="handleDelete(row)"
              />
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 新增/编辑抽屉 -->
    <Drawer
      v-model:open="showEditDrawer"
      :title="editMode ? $t('baseInfo.edit') : $t('baseInfo.add')"
      :width="720"
      :footer-style="{ textAlign: 'right' }"
    >
      <Form
        ref="formRef"
        :label-col="{ span: 6 }"
        :model="formData"
        :rules="rules"
        :wrapper-col="{ span: 18 }"
        autocomplete="off"
      >
        <!-- 制面产线：单选，仅新增时可选，编辑时锁定 -->
        <FormItem :label="$t('baseInfo.noodleSubLine')" name="noodleSubLineId">
          <Select
            v-model:value="formData.noodleSubLineId"
            :disabled="editMode"
            :placeholder="$t('baseInfo.selectNoodleSubLine')"
            allow-clear
            show-search
            option-filter-prop="label"
            style="width: 100%"
          >
            <SelectOption
              v-for="item in noodleSubLineOptions"
              :key="item.id"
              :label="`${item.subLineCode}(${item.subLineName})`"
              :value="item.id"
            >
              {{ `${item.subLineCode}(${item.subLineName})` }}
            </SelectOption>
          </Select>
        </FormItem>
        <!-- 包装产线：多选，在表格中勾选 -->
        <FormItem
          :label="$t('baseInfo.packageSubLine')"
          name="packageSubLineIds"
        >
          <PackageGrid>
            <template #toolbar-tools></template>
          </PackageGrid>
        </FormItem>
      </Form>
      <template #footer>
        <Space>
          <Button @click="handleClose">{{ $t('common.cancel') }}</Button>
          <Button type="primary" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>
