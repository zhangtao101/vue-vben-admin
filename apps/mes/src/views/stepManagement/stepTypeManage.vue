<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { computed, h, nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import {
  MdiEditOutline,
  MdiEyeOutline,
  MdiLightDelete,
  MdiListBoxOutline,
  MdiSearch,
} from '@vben/icons';

import {
  Button,
  Card,
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
  Switch,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteParam,
  deleteType,
  insertParam,
  insertType,
  listAllUseAttribute,
  selectParamList,
  selectTypeList,
  updateParam,
  updateType,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// 工步类型标记选项 1开始工步 2完结工步 3执行工步 4判断工步 5监听工步
const functionFlagOptions = [
  { label: $t('stepTypeManage.startStep'), value: 1 },
  { label: $t('stepTypeManage.finishStep'), value: 2 },
  { label: $t('stepTypeManage.executeStep'), value: 3 },
  { label: $t('stepTypeManage.judgeStep'), value: 4 },
  { label: $t('stepTypeManage.monitorStep'), value: 5 },
];

// 参数标记选项 1传入参数 2输出参数
const paramFlagOptions = [
  { label: $t('stepTypeManage.inputParam'), value: 1 },
  { label: $t('stepTypeManage.outputParam'), value: 2 },
];

// 参数类型选项 1整数 2高精度浮点数 3字符串 4json
const paramTypeOptions = [
  { label: $t('stepTypeManage.integer'), value: 1 },
  { label: $t('stepTypeManage.highPrecisionFloat'), value: 2 },
  { label: $t('stepTypeManage.string'), value: 3 },
  { label: $t('stepTypeManage.json'), value: 4 },
];

// 已启用的参数属性类别选项
const attributeOptions = ref<any[]>([]);

// 引用参数选项（当前工步类型下已配置的参数）
const paramUseOptions = ref<any[]>([]);

// 当前选中的工步类型
const checkedType = ref<any>({});

// region 工步类型列表

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    {
      field: 'functionType',
      title: $t('stepTypeManage.functionType'),
      minWidth: 120,
    },
    {
      field: 'functionTypeName',
      title: $t('stepTypeManage.functionTypeName'),
      minWidth: 150,
    },
    {
      field: 'functionFlag',
      slots: { default: 'functionFlag' },
      title: $t('stepTypeManage.functionFlag'),
      minWidth: 120,
    },
    {
      field: 'isUse',
      slots: { default: 'isUse' },
      title: $t('stepAttrCategoryMaintain.iseUse'),
      minWidth: 120,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('page.common.action'),
      width: 300,
    },
  ],
  height: 400,
  highlightCurrentRow: true,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryTypeData({
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

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/**
 * 查询工步类型数据
 * 向服务器发送请求，获取工步类型列表数据，并更新前端的数据显示和分页信息。
 * @param page 页码
 * @param pageSize 每页展示条数
 */
function queryTypeData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    selectTypeList({
      ...queryParams.value,
      pageNum: page,
      pageSize,
    }).then(({ total, list }) => {
      resolve({
        total,
        items: list,
      });
    });
  });
}

// endregion

// region 工步参数列表

// 是否显示工步参数明细抽屉
const showParamListDrawer = ref(false);

// 参数表格配置
const paramGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    { field: 'paramCode', title: $t('stepTypeManage.paramCode'), minWidth: 120 },
    { field: 'paramName', title: $t('stepTypeManage.paramName'), minWidth: 150 },
    {
      field: 'paramTypeName',
      title: $t('stepTypeManage.paramType'),
      minWidth: 130,
      slots: { default: 'paramType' },
    },
    {
      field: 'paramAttributeName',
      title: $t('stepTypeManage.paramAttribute'),
      minWidth: 130,
    },
    {
      field: 'paramFlagName',
      title: $t('stepTypeManage.paramFlag'),
      minWidth: 110,
      slots: { default: 'paramFlag' },
    },
    {
      field: 'paramBinding',
      title: $t('stepTypeManage.paramBinding'),
      minWidth: 130,
    },
    { field: 'paramCron', title: $t('stepTypeManage.paramCron'), minWidth: 130 },
    { field: 'paramUseName', title: $t('stepTypeManage.paramUseId'), minWidth: 130 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'paramAction' },
      title: $t('page.common.action'),
      width: 120,
    },
  ],
  height: 400,
  stripe: true,
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryParamData({
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

const paramGridEvents: VxeGridListeners<any> = {};

const [ParamGrid, paramGridApi] = useVbenVxeGrid({
  gridEvents: paramGridEvents,
  gridOptions: paramGridOptions,
});

/**
 * 查询工步参数数据
 * 向服务器发送请求，获取当前工步类型的参数列表数据。
 * @param page 页码
 * @param pageSize 每页展示条数
 */
function queryParamData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    // 未选择工步类型时返回空数据
    if (!checkedType.value.functionType) {
      resolve({ total: 0, items: [] });
      return;
    }
    selectParamList({
      functionType: checkedType.value.functionType,
      pageNum: page,
      pageSize,
    }).then(({ total, list }) => {
      resolve({
        total,
        items: list,
      });
    });
  });
}

/**
 * 选中工步类型，打开参数明细抽屉并加载该类型的参数列表与引用参数选项
 * @param row 表格行数据
 */
function selectType(row: any) {
  checkedType.value = row;
  // 打开参数明细抽屉
  showParamListDrawer.value = true;
  // 加载引用参数下拉选项
  loadParamUseOptions();
  // 等待抽屉内容渲染后刷新参数列表
  nextTick(() => {
    paramGridApi.reload();
  });
}

/**
 * 加载当前工步类型的参数，作为引用参数下拉选项
 */
function loadParamUseOptions() {
  if (!checkedType.value.functionType) {
    paramUseOptions.value = [];
    return;
  }
  selectParamList({
    functionType: checkedType.value.functionType,
    pageNum: 1,
    pageSize: 100,
  }).then(({ list }) => {
    paramUseOptions.value = (list || []).map((item: any) => ({
      label: `${item.paramCode}-${item.paramName}`,
      value: item.id,
    }));
  });
}

/**
 * 加载已启用的参数属性类别，作为参数属性下拉选项
 */
function loadAttributeOptions() {
  listAllUseAttribute().then((res: any) => {
    const list = res?.list ?? (Array.isArray(res) ? res : []);
    attributeOptions.value = (list || []).map((item: any) => ({
      label: item.functionAttributeTypeName,
      value: item.functionAttributeType,
      attributeFlag: item.attributeFlag,
    }));
  });
}

/**
 * 根据参数属性编号获取对应的属性标记
 * @param attribute 参数属性编号
 * @returns 属性标记 1业务填报 2数采关联 3外部引用 4逻辑计算
 */
function getAttributeFlag(attribute: string) {
  return (
    attributeOptions.value.find(
      (item) => item.value === attribute,
    )?.attributeFlag ?? 0
  );
}

// endregion

// region 工步类型 新增/编辑/删除

// 当前查看的工步类型
const checkedViewType = ref<any>({});
// 是否显示工步类型查看详情抽屉
const showViewDrawer = ref(false);

// 当前编辑的工步类型
const checkedTypeRow = ref<any>({});
// 是否显示工步类型编辑抽屉
const showTypeDrawer = ref(false);

// 抽屉中的form表单对象
const typeForm = ref();
// form表单规则验证
const typeRules = ref<any>({
  functionType: [
    { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
  ],
  functionTypeName: [
    { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
  ],
  functionFlag: [
    { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
  ],
});

/**
 * 查看工步类型详情
 * @param row 表格行数据
 */
function viewType(row: any) {
  checkedViewType.value = row;
  showViewDrawer.value = true;
}

/**
 * 显示工步类型编辑抽屉，无行数据时表示新增
 * @param row 表格行数据
 */
function editType(row?: any) {
  checkedTypeRow.value = row ? { ...row } : {};
  showTypeDrawer.value = true;
}

/**
 * 工步类型表单提交
 */
function submitType() {
  typeForm.value.validate().then(() => {
    const ob = checkedTypeRow.value.id
      ? updateType(checkedTypeRow.value)
      : insertType(checkedTypeRow.value);
    ob.then(() => {
      // 刷新表格数据
      gridApi.query();
      message.success($t('common.successfulOperation'));
      onTypeClose();
    });
  });
}

/**
 * 删除工步类型
 * @param row 表格行数据
 */
function delType(row: any) {
  Modal.confirm({
    cancelText: $t('common.cancel'),
    okText: $t('common.confirm'),
    okType: 'danger',
    onCancel() {
      message.warning($t('page.common.cancelDeletePrompt'));
    },
    onOk() {
      deleteType(row.id).then(() => {
        // 显示操作成功的提示信息
        message.success($t('common.successfulOperation'));
        gridApi.query();
      });
    },
    title: $t('page.common.confirmDeleteTitle'),
  });
}

/**
 * 关闭工步类型编辑抽屉
 */
function onTypeClose() {
  checkedTypeRow.value = {};
  showTypeDrawer.value = false;
}

/**
 * 修改工步类型启停用状态（表格中直接切换）
 * @param row 表格行数据
 * @param checked 切换后的状态值 1启用 -1停用
 */
function updateTypeIseUse(row: any, checked: number) {
  updateType({ id: row.id, isUse: checked })
    .then(() => {
      // 显示操作成功的提示信息
      message.success($t('common.successfulOperation'));
      gridApi.query();
    })
    .catch(() => {
      // 接口失败时回滚状态
      row.isUse = checked === 1 ? -1 : 1;
    });
}

// endregion

// region 工步参数 新增/编辑/删除

// 当前编辑的参数
const checkedParam = ref<any>({});
// 是否显示参数编辑抽屉
const showParamDrawer = ref(false);

// 抽屉中的form表单对象
const paramForm = ref();

// form表单规则验证（根据参数属性标记联动）
const paramRules = computed(() => {
  const rules: Record<string, any[]> = {
    paramCode: [
      { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
    ],
    paramName: [
      { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
    ],
    paramType: [
      { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
    ],
    paramFlag: [
      { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
    ],
    paramAttribute: [
      { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
    ],
  };
  // 参数属性对应的属性标记
  const flag = getAttributeFlag(checkedParam.value.paramAttribute);
  // 数采关联：参数关联点位不允许为空
  if (flag === 2) {
    rules.paramBinding = [
      { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
    ];
  }
  // 外部引用：引用参数不允许为空
  if (flag === 3) {
    rules.paramUseId = [
      { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
    ];
  }
  // 逻辑计算：参数表达式不允许为空
  if (flag === 4) {
    rules.paramCron = [
      { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
    ];
  }
  return rules;
});

/**
 * 显示参数编辑抽屉，无行数据时表示新增
 * @param row 表格行数据
 */
function editParam(row?: any) {
  checkedParam.value = row
    ? { ...row, paramUseId: row.paramUseId ?? undefined }
    : {
        functionType: checkedType.value.functionType,
        paramFlag: 1,
        paramType: 1,
      };
  showParamDrawer.value = true;
}

/**
 * 参数属性变更联动处理
 * 切换参数属性后，清空不再需要的联动字段
 * @param value 参数属性编号
 */
function handleAttributeChange(value: any) {
  const flag = getAttributeFlag(value);
  // 非数采关联时清空参数关联点位
  if (flag !== 2) {
    checkedParam.value.paramBinding = '';
  }
  // 非外部引用时清空引用参数
  if (flag !== 3) {
    checkedParam.value.paramUseId = undefined;
  }
  // 非逻辑计算时清空参数表达式
  if (flag !== 4) {
    checkedParam.value.paramCron = '';
  }
}

/**
 * 参数表单提交
 */
function submitParam() {
  paramForm.value.validate().then(() => {
    const ob = checkedParam.value.id
      ? updateParam(checkedParam.value)
      : insertParam(checkedParam.value);
    ob.then(() => {
      // 刷新参数表格数据
      paramGridApi.query();
      // 刷新引用参数下拉选项
      loadParamUseOptions();
      message.success($t('common.successfulOperation'));
      onParamClose();
    });
  });
}

/**
 * 删除工步参数
 * @param row 表格行数据
 */
function delParam(row: any) {
  Modal.confirm({
    cancelText: $t('common.cancel'),
    okText: $t('common.confirm'),
    okType: 'danger',
    onCancel() {
      message.warning($t('page.common.cancelDeletePrompt'));
    },
    onOk() {
      deleteParam(row.id).then(() => {
        // 显示操作成功的提示信息
        message.success($t('common.successfulOperation'));
        paramGridApi.query();
        loadParamUseOptions();
      });
    },
    title: $t('page.common.confirmDeleteTitle'),
  });
}

/**
 * 关闭参数编辑抽屉
 */
function onParamClose() {
  checkedParam.value = {};
  showParamDrawer.value = false;
}

// endregion

// region 查询数据

// 查询参数
const queryParams = ref({
  // 工步类型编号
  functionType: '',
  // 工步类型名称
  functionTypeName: '',
  // 工步类型标记
  functionFlag: undefined as number | undefined,
});

/**
 * 重置查询参数
 */
function handleReset() {
  queryParams.value = {
    functionType: '',
    functionTypeName: '',
    functionFlag: undefined,
  };
  gridApi.reload();
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
  // 加载参数属性下拉选项
  loadAttributeOptions();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 工步类型 搜索 -->
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 工步类型编号 -->
        <FormItem
          :label="$t('stepTypeManage.functionType')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.functionType"
            :placeholder="$t('stepTypeManage.placeholderInput')"
          />
        </FormItem>

        <!-- 工步类型名称 -->
        <FormItem
          :label="$t('stepTypeManage.functionTypeName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.functionTypeName"
            :placeholder="$t('stepTypeManage.placeholderInput')"
          />
        </FormItem>

        <!-- 工步类型标记 -->
        <FormItem
          :label="$t('stepTypeManage.functionFlag')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.functionFlag"
            :allow-clear="true"
            :options="functionFlagOptions"
            :placeholder="$t('stepTypeManage.placeholderSelect')"
            style="width: 160px"
          />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button @click="handleReset">
            {{ $t('common.reset') }}
          </Button>
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

    <!-- region 工步类型 表格主体 -->
    <Card class="!mb-8" :title="$t('stepTypeManage.typeInfo')">
      <Grid>
        <template #toolbar-tools>
          <!-- 新增按钮 -->
          <Button
            v-if="author.includes('新增')"
            type="primary"
            @click="editType()"
          >
            {{ $t('common.add') }}
          </Button>
        </template>
        <template #functionFlag="{ row }">
          <Tag color="processing">
            {{ row.functionFlagName }}
          </Tag>
        </template>
        <template #isUse="{ row }">
          <Switch
            v-model:checked="row.isUse"
            :checked-children="$t('common.enable')"
            :checked-value="1"
            :disabled="!author.includes('状态变更')"
            :un-checked-children="$t('common.stopUsing')"
            :un-checked-value="-1"
            @change="(checked: any) => updateTypeIseUse(row, checked)"
          />
        </template>
        <template #action="{ row }">
          <!-- 查看详情 -->
          <Tooltip>
            <template #title>{{ $t('common.view') }}</template>
            <Button
              :icon="h(MdiEyeOutline, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="viewType(row)"
            />
          </Tooltip>
          <!-- 参数明细按钮 -->
          <Tooltip>
            <template #title>{{ $t('stepTypeManage.paramList') }}</template>
            <Button
              v-if="author.includes('编辑')"
              :icon="h(MdiListBoxOutline, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="selectType(row)"
            />
          </Tooltip>
          <!-- 编辑按钮 -->
          <Tooltip>
            <template #title>{{ $t('common.edit') }}</template>
            <Button
              v-if="author.includes('编辑')"
              :icon="h(MdiEditOutline, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="editType(row)"
            />
          </Tooltip>

          <!-- 删除数据 -->
          <Tooltip>
            <template #title>{{ $t('common.delete') }}</template>
            <Button
              v-if="author.includes('删除')"
              :icon="
                h(MdiLightDelete, {
                  class: 'inline-block size-6',
                })
              "
              danger
              type="link"
              @click="delType(row)"
            />
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- region 工步参数 明细抽屉 -->
    <Drawer
      v-model:open="showParamListDrawer"
      :destroy-on-close="false"
      :footer-style="{ textAlign: 'right' }"
      :width="1100"
      class="custom-class"
      placement="right"
      :title="`${$t('stepTypeManage.paramInfo')}：${checkedType.functionType}-${checkedType.functionTypeName}`"
    >
      <!-- 当前选中工步类型基本信息 -->
      <Descriptions
        :column="2"
        bordered
        class="mb-3"
      >
        <DescriptionsItem :label="$t('stepTypeManage.functionType')">
          {{ checkedType.functionType }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('stepTypeManage.functionTypeName')">
          {{ checkedType.functionTypeName }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('stepTypeManage.functionFlag')">
          <Tag color="processing">
            {{ checkedType.functionFlagName }}
          </Tag>
        </DescriptionsItem>
        <DescriptionsItem :label="$t('stepAttrCategoryMaintain.iseUse')">
          <Tag :color="checkedType.isUse === 1 ? 'green' : 'red'">
            {{ checkedType.isUse === 1 ? $t('common.enable') : $t('common.stopUsing') }}
          </Tag>
        </DescriptionsItem>
      </Descriptions>
      <ParamGrid>
        <template #toolbar-tools>
          <!-- 新增参数按钮 -->
          <Button
            v-if="author.includes('新增')"
            type="primary"
            @click="editParam()"
          >
            {{ $t('stepTypeManage.addParamInfo') }}
          </Button>
        </template>
        <template #paramType="{ row }">
          <Tag color="green">
            {{ row.paramTypeName }}
          </Tag>
        </template>
        <template #paramFlag="{ row }">
          <Tag color="blue">
            {{ row.paramFlagName }}
          </Tag>
        </template>
        <template #paramAction="{ row }">
          <!-- 编辑参数 -->
          <Tooltip>
            <template #title>{{ $t('common.edit') }}</template>
            <Button
              v-if="author.includes('编辑')"
              :icon="h(MdiEditOutline, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="editParam(row)"
            />
          </Tooltip>

          <!-- 删除参数 -->
          <Tooltip>
            <template #title>{{ $t('common.delete') }}</template>
            <Button
              v-if="author.includes('删除')"
              :icon="
                h(MdiLightDelete, {
                  class: 'inline-block size-6',
                })
              "
              danger
              type="link"
              @click="delParam(row)"
            />
          </Tooltip>
        </template>
      </ParamGrid>
    </Drawer>
    <!-- endregion -->

    <!-- region 工步类型 查看详情抽屉 -->
    <Drawer
      v-model:open="showViewDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="600"
      class="custom-class"
      placement="right"
      :title="$t('stepTypeManage.typeInfo')"
    >
      <Descriptions
        :column="1"
        bordered
        :title="$t('stepTypeManage.typeInfo')"
      >
        <DescriptionsItem :label="$t('stepTypeManage.functionType')">
          {{ checkedViewType.functionType }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('stepTypeManage.functionTypeName')">
          {{ checkedViewType.functionTypeName }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('stepTypeManage.functionFlag')">
          <Tag color="processing">
            {{ checkedViewType.functionFlagName }}
          </Tag>
        </DescriptionsItem>
        <DescriptionsItem :label="$t('stepAttrCategoryMaintain.iseUse')">
          <Tag :color="checkedViewType.isUse === 1 ? 'green' : 'red'">
            {{ checkedViewType.isUse === 1 ? $t('common.enable') : $t('common.stopUsing') }}
          </Tag>
        </DescriptionsItem>
      </Descriptions>
    </Drawer>
    <!-- endregion -->

    <!-- region 工步类型 新增/编辑 抽屉 -->
    <Drawer
      v-model:open="showTypeDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="500"
      class="custom-class"
      placement="right"
      :title="checkedTypeRow.id ? $t('stepTypeManage.editTypeInfo') : $t('stepTypeManage.addTypeInfo')"
    >
      <Form
        ref="typeForm"
        :label-col="{ span: 6 }"
        :model="checkedTypeRow"
        :rules="typeRules"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        name="editTypeForm"
      >
        <!-- 工步类型编号 -->
        <FormItem
          :label="$t('stepTypeManage.functionType')"
          name="functionType"
        >
          <Input
            v-model:value="checkedTypeRow.functionType"
            :placeholder="$t('stepTypeManage.placeholderInput')"
          />
        </FormItem>
        <!-- 工步类型名称 -->
        <FormItem
          :label="$t('stepTypeManage.functionTypeName')"
          name="functionTypeName"
        >
          <Input
            v-model:value="checkedTypeRow.functionTypeName"
            :placeholder="$t('stepTypeManage.placeholderInput')"
          />
        </FormItem>
        <!-- 工步类型标记 -->
        <FormItem
          :label="$t('stepTypeManage.functionFlag')"
          name="functionFlag"
        >
          <Select
            v-model:value="checkedTypeRow.functionFlag"
            :options="functionFlagOptions"
            :placeholder="$t('stepTypeManage.placeholderSelect')"
          />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="onTypeClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="submitType">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->

    <!-- region 工步参数 新增/编辑 抽屉 -->
    <Drawer
      v-model:open="showParamDrawer"
      :footer-style="{ textAlign: 'right' }"
      :mask="false"
      :width="500"
      class="custom-class"
      placement="right"
      :title="checkedParam.id ? $t('stepTypeManage.editParamInfo') : $t('stepTypeManage.addParamInfo')"
    >
      <Form
        ref="paramForm"
        :label-col="{ span: 6 }"
        :model="checkedParam"
        :rules="paramRules"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        name="editParamForm"
      >
        <!-- 参数编号 -->
        <FormItem
          :label="$t('stepTypeManage.paramCode')"
          name="paramCode"
        >
          <Input
            v-model:value="checkedParam.paramCode"
            :placeholder="$t('stepTypeManage.placeholderInput')"
          />
        </FormItem>
        <!-- 参数名称 -->
        <FormItem
          :label="$t('stepTypeManage.paramName')"
          name="paramName"
        >
          <Input
            v-model:value="checkedParam.paramName"
            :placeholder="$t('stepTypeManage.placeholderInput')"
          />
        </FormItem>
        <!-- 参数类型 -->
        <FormItem
          :label="$t('stepTypeManage.paramType')"
          name="paramType"
        >
          <Select
            v-model:value="checkedParam.paramType"
            :options="paramTypeOptions"
            :placeholder="$t('stepTypeManage.placeholderSelect')"
          />
        </FormItem>
        <!-- 参数标记 -->
        <FormItem
          :label="$t('stepTypeManage.paramFlag')"
          name="paramFlag"
        >
          <Select
            v-model:value="checkedParam.paramFlag"
            :options="paramFlagOptions"
            :placeholder="$t('stepTypeManage.placeholderSelect')"
          />
        </FormItem>
        <!-- 参数属性 -->
        <FormItem
          :label="$t('stepTypeManage.paramAttribute')"
          name="paramAttribute"
        >
          <Select
            v-model:value="checkedParam.paramAttribute"
            :options="attributeOptions"
            :placeholder="$t('stepTypeManage.placeholderSelect')"
            @change="handleAttributeChange"
          />
        </FormItem>
        <!-- 参数关联点位（数采关联时必填） -->
        <FormItem
          :label="$t('stepTypeManage.paramBinding')"
          name="paramBinding"
        >
          <Input
            v-model:value="checkedParam.paramBinding"
            :placeholder="$t('stepTypeManage.placeholderInput')"
          />
        </FormItem>
        <!-- 参数表达式（逻辑计算时必填） -->
        <FormItem
          :label="$t('stepTypeManage.paramCron')"
          name="paramCron"
        >
          <Input
            v-model:value="checkedParam.paramCron"
            :placeholder="$t('stepTypeManage.placeholderInput')"
          />
        </FormItem>
        <!-- 引用参数（外部引用时必填） -->
        <FormItem
          :label="$t('stepTypeManage.paramUseId')"
          name="paramUseId"
        >
          <Select
            v-model:value="checkedParam.paramUseId"
            :allow-clear="true"
            :options="paramUseOptions"
            :placeholder="$t('stepTypeManage.placeholderSelect')"
          />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="onParamClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="submitParam">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
