<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { IconifyIcon, MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
  Cascader,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  areaList,
  lecList,
  listSysPerson,
  listWordListByParentCode,
  queryOrganizationTree,
  sourceDelete,
  sourceInsert,
  sourceList,
  sourceUpdate,
} from '#/api';
import { $t } from '#/locales';
import { flattenTree, queryAuth } from '#/util';

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'riskType', title: '风险分类', minWidth: 120 },
    { field: 'area', title: '风险位置', minWidth: 120 },
    { field: 'riskName', title: '风险名称', minWidth: 120 },
    { field: 'description', title: '风险描述', minWidth: 120 },
    { field: 'hazardousFactors', title: '危险有害因素', minWidth: 120 },
    { field: 'potentialAccident', title: '可能导致事故', minWidth: 120 },
    {
      title: '固有风险评估',
      children: [
        { field: 'llevel', title: '事故发生的可能性(L)', minWidth: 180 },
        { field: 'l', title: '分值(L)', minWidth: 80 },
        {
          field: 'elevel',
          title: '暴露于危险环境的频繁程度(E)',
          minWidth: 190,
        },
        { field: 'e', title: '分值(E)', minWidth: 80 },
        { field: 'clevel', title: '发生事故产生的后果(C)', minWidth: 180 },
        { field: 'c', title: '分值(C)', minWidth: 80 },
        { field: 'd', title: 'D', minWidth: 80 },
      ],
    },
    { field: 'inherentRisk', title: '固有风险', minWidth: 80 },
    { field: 'escalationLevel', title: '升级', minWidth: 80 },
    { field: 'details', title: '操作修改详情', minWidth: 120 },
    { field: 'measures', title: '现有控制措施', minWidth: 120 },
    { field: 'responsibleDepartment', title: '责任部门', minWidth: 120 },
    { field: 'responsiblePerson', title: '责任人', minWidth: 120 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 150,
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

// 查询参数
const queryParams = ref<any>({});
/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams.value };
    sourceList({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ total, list }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total,
          items: list,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// endregion

// region 新增 / 编辑

// 是否显示编辑
const showEdit = ref(false);
/**
 * 新增/编辑表单引用
 */
const formRef = ref<any>();
/**
 * 编辑对象
 */
const editItem = ref<any>({});
/**
 * 提交加载中
 */
const submitLoading = ref(false);
/**
 * 提交
 */
function submit() {
  formRef.value.validate().then(() => {
    const ob = editItem.value.id
      ? sourceUpdate(editItem.value)
      : sourceInsert(editItem.value);
    submitLoading.value = true;
    ob.then(() => {
      message.success($t('common.successfulOperation'));
      gridApi.reload();
      editClose();
    }).finally(() => {
      submitLoading.value = false;
    });
  });
}

/**
 * 显示编辑
 * @param row 编辑对象 为空值表示新增
 */
function showEditFun(row?: any) {
  showEdit.value = true;
  editItem.value = row ? { ...row } : {};
}

/**
 * 关闭抽屉
 */
function editClose() {
  showEdit.value = false;
  editItem.value = {};
}

/**
 * 删除
 * @param row
 */
function delItem(row: any) {
  sourceDelete(row.id).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

// endregion

// region 权限查询

// 路由信息
const route = useRoute();
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 风险分类
// 风险分类
const riskTypeOptions = ref<any[]>([]);

/**
 * 风险类别查询
 */
function queryRiskType() {
  listWordListByParentCode('RISKTYPE').then((res) => {
    riskTypeOptions.value = [];
    res.forEach((item: any) => {
      riskTypeOptions.value.push({
        label: item.wordName,
        value: item.wordName,
      });
    });
  });
}
// endregion

// region 风险评估标准
const riskAssessmentCriteriaOptions = ref<any>({
  l: [],
  e: [],
  c: [],
});

function riskAssessmentCriteriaQuery() {
  riskAssessmentCriteriaOptions.value = {
    l: [],
    e: [],
    c: [],
  };
  lecList({
    pageNum: 1,
    pageSize: 99_999,
  }).then(({ list }) => {
    list.forEach((item: any) => {
      switch (item.dimension) {
        case '事故发生的可能性(L)': {
          riskAssessmentCriteriaOptions.value.l.push({
            label: item.level,
            value: item.level,
            score: item.score,
            type: 1,
          });
          break;
        }
        case '发生事故产生的后果(C)': {
          riskAssessmentCriteriaOptions.value.c.push({
            label: item.level,
            value: item.level,
            score: item.score,
            type: 2,
          });
          break;
        }
        case '暴露于危险环境的频繁程度(E)': {
          riskAssessmentCriteriaOptions.value.e.push({
            label: item.level,
            value: item.level,
            score: item.score,
            type: 3,
          });
          break;
        }
      }
    });
  });
}

function levelChange(_val: any, _item: any) {
  switch (_item.type) {
    case 1: {
      editItem.value.l = _item.score;
      break;
    }
    case 2: {
      editItem.value.c = _item.score;
      break;
    }
    case 3: {
      editItem.value.e = _item.score;
      break;
    }
  }
}

// endregion

// region 组织查询
// 组织数据
const treeData = ref<any>([]);
/**
 * 查询全部的组织树
 * 这个函数用于从服务器获取所有组织数据，并更新前端的树形数据结构。
 */
function queryAllOrganizations() {
  // 调用queryDictionaryTree API函数，获取菜单列表
  queryOrganizationTree().then((data) => {
    // 检查返回的数据是否存在且长度大于0
    if (data) {
      const arr = flattenTree(
        {
          children: [data],
        },
        'children',
      );
      treeData.value = [];
      arr.forEach((item: any) => {
        treeData.value.push({
          label: item.orgFullName,
          value: item.orgCode,
          isLeaf: false,
        });
      });
    }
  });
}

// endregion

// region 用户查询
// 选中的信息
const userChecked = ref<any>([]);

function userSearch(selectedOptions: any) {
  const targetOption = selectedOptions[selectedOptions.length - 1];
  targetOption.loading = true;

  listSysPerson({
    orgCode: targetOption.value,
    pageNum: 1, // 当前页码。
    pageSize: 25, // 每页显示的数据条数。
  })
    .then(({ list }) => {
      list.forEach((item: any) => {
        item.label = item.perName;
        item.value = item.perName;
      });
      targetOption.children = list;
    })
    .finally(() => {
      targetOption.loading = false;
    });
}

function userChange(_val: any, item: any) {
  if (item.length === 2) {
    editItem.value.responsibleDepartment = item[0].label;
    editItem.value.responsiblePerson = item[1].perName;
  }
}

// endregion

// region 区域类型

const areaOptions = ref<any[]>([
  {
    label: '1',
    value: 2,
  },
]);

/**
 * 查询巡检类型
 */
function queryArea() {
  areaList({
    pageNum: 1, // 当前页码。
    pageSize: 99_999, // 每页显示的数据条数。
  }).then(({ list }) => {
    areaOptions.value = [];
    list.forEach((item: any) => {
      areaOptions.value.push({
        label: item.areaName,
        value: item.areaName,
      });
    });
  });
}

// endregion

// region 初始化

onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  queryRiskType();
  riskAssessmentCriteriaQuery();
  queryAllOrganizations();
  queryArea();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 责任人 -->
        <FormItem
          :label="$t('riskManagement.ResponsiblePerson')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.responsiblePerson" />
        </FormItem>
        <!-- 区域 -->
        <FormItem
          :label="$t('riskManagement.RiskLocation')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.area" />
        </FormItem>
        <!-- 风险种类 -->
        <FormItem
          :label="$t('riskManagement.riskType')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.riskType" />
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
        <template #toolbar-actions>
          <Button
            type="primary"
            @click="showEditFun()"
            v-if="author.includes('新增')"
          >
            {{ $t('common.create') }}
          </Button>
        </template>

        <template #action="{ row }">
          <!-- 编辑 -->
          <Tooltip v-if="author.includes('编辑')">
            <template #title>{{ $t('common.edit') }}</template>
            <Button type="link" @click="showEditFun(row)">
              <IconifyIcon
                icon="mdi:edit-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 删除 -->
          <Tooltip v-if="author.includes('删除')">
            <template #title>{{ $t('common.delete') }}</template>
            <Popconfirm
              :cancel-text="$t('common.cancel')"
              :ok-text="$t('common.confirm')"
              :title="$t('ui.widgets.deletionConfirmation')"
              @confirm="delItem(row)"
            >
              <Button danger type="link">
                <IconifyIcon
                  icon="mdi-light:delete"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Popconfirm>
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <Drawer
      v-model:open="showEdit"
      :footer-style="{ textAlign: 'right' }"
      width="700"
      placement="right"
      :title="$t('common.edit')"
      @close="editClose"
    >
      <Form
        ref="formRef"
        :model="editItem"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
        <!-- 风险分类 -->
        <FormItem
          :label="$t('riskManagement.RiskCategory')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="riskType"
        >
          <Select
            v-model:value="editItem.riskType"
            :options="riskTypeOptions"
            allow-clear
            class="!w-full"
          />
        </FormItem>
        <!-- 风险位置 -->
        <FormItem
          :label="$t('riskManagement.RiskLocation')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="area"
        >
          <Select
            v-model:value="editItem.area"
            :options="areaOptions"
            allow-clear
            class="!w-full"
          />
        </FormItem>
        <!-- 风险名称 -->
        <FormItem
          :label="$t('riskManagement.RiskName')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="riskName"
        >
          <Input v-model:value="editItem.riskName" />
        </FormItem>
        <!-- 风险描述 -->
        <FormItem
          :label="$t('riskManagement.RiskDescription')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="description"
        >
          <Input v-model:value="editItem.description" />
        </FormItem>
        <!-- 危险有害因素 -->
        <FormItem
          :label="$t('riskManagement.HazardFactors')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="hazardousFactors"
        >
          <Input v-model:value="editItem.hazardousFactors" />
        </FormItem>
        <!-- 可能导致事故 -->
        <FormItem
          :label="$t('riskManagement.PotentialAccident')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="potentialAccident"
        >
          <Input v-model:value="editItem.potentialAccident" />
        </FormItem>

        <!-- 事故发生的可能性 -->
        <FormItem
          :label="$t('riskManagement.lLabel')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="llevel"
        >
          <Select
            v-model:value="editItem.llevel"
            :options="riskAssessmentCriteriaOptions.l"
            allow-clear
            class="!w-full"
            @change="levelChange"
          />
        </FormItem>
        <!-- 分值 -->
        <FormItem :label="$t('riskManagement.Score')">
          <InputNumber v-model:value="editItem.l" :min="0" readonly />
        </FormItem>
        <!-- 暴露于危险环境的频繁程度 -->
        <FormItem
          :label="$t('riskManagement.eLabel')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="elevel"
        >
          <Select
            v-model:value="editItem.elevel"
            :options="riskAssessmentCriteriaOptions.e"
            allow-clear
            class="!w-full"
            @change="levelChange"
          />
        </FormItem>
        <!-- 分值 -->
        <FormItem :label="$t('riskManagement.Score')">
          <InputNumber v-model:value="editItem.e" :min="0" readonly />
        </FormItem>
        <!-- 发生事故产生的后果 -->
        <FormItem
          :label="$t('riskManagement.cLabel')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="clevel"
        >
          <Select
            v-model:value="editItem.clevel"
            :options="riskAssessmentCriteriaOptions.c"
            allow-clear
            class="!w-full"
            @change="levelChange"
          />
        </FormItem>
        <!-- 分值 -->
        <FormItem :label="$t('riskManagement.Score')">
          <InputNumber v-model:value="editItem.c" :min="0" readonly />
        </FormItem>
        <!-- 固有风险 -->
        <FormItem
          :label="$t('riskManagement.InherentRisk')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="inherentRisk"
        >
          <Input v-model:value="editItem.inherentRisk" />
        </FormItem>
        <!-- 升级 -->
        <FormItem
          :label="$t('riskManagement.Upgrade')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="escalationLevel"
        >
          <Input v-model:value="editItem.escalationLevel" />
        </FormItem>
        <!-- 操作修改详情 -->
        <!--        <FormItem
          :label="$t('riskManagement.OperationDetails')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="details"
        >
          <Textarea v-model:value="editItem.details" />
        </FormItem>-->
        <!-- 现有控制措施 -->
        <FormItem
          :label="$t('riskManagement.ExistingControls')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="measures"
        >
          <Input v-model:value="editItem.measures" />
        </FormItem>
        <!-- 责任人 -->
        <FormItem
          :label="$t('riskManagement.ResponsiblePerson')"
          :rules="[{ required: true, message: '该项为必填项' }]"
          name="responsiblePerson"
        >
          <Cascader
            v-model:value="userChecked"
            :options="treeData"
            :load-data="userSearch"
            @change="userChange"
            change-on-select
            class="w-full"
          />
        </FormItem>
      </Form>
      <!-- 抽屉底部操作按钮 -->
      <template #footer>
        <!-- 按钮组，包含取消和确认按钮 -->
        <Space>
          <!-- 取消按钮，点击后关闭人员操作抽屉 -->
          <Button @click="editClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认按钮，点击后提交人员操作信息 -->
          <Button type="primary" @click="submit" :loading="submitLoading">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
