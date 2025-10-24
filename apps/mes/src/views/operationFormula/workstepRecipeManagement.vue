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
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  RadioButton,
  RadioGroup,
  Select,
  Space,
  Spin,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteSteps,
  fuzzyQueryOfEquipmentNumber,
  getProceByName,
  insertEquipOpFormula,
  listEquipOpFormula,
  stepStateSwitching,
  updateEquipOpFormula,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import WorkstepRecipeManagementMatch from '#/util/component/workstepRecipeManagementMatch/workstepRecipeManagementMatch.vue';

// 路由信息
const route = useRoute();

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'formulaName', title: '配方名称', minWidth: 150 },
    { field: 'processCode', title: '工序编号', minWidth: 150 },
    { field: 'processName', title: '工序名称', minWidth: 150 },
    { field: 'equipCode', title: '设备编号', minWidth: 150 },
    { field: 'equipName', title: '设备名称', minWidth: 150 },
    { field: 'version', title: '版本号', minWidth: 150 },
    { field: 'createUser', title: '创建人', minWidth: 150 },
    { field: 'createTime', title: '创建时间', minWidth: 150 },
    {
      field: 'isUse',
      fixed: 'right',
      title: '状态',
      minWidth: 150,
      slots: { default: 'isUse' },
    },
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

// endregion

// region 查看 / 编辑 / 新增 具体操作

// 当前选中的表格行
const checkedRow = ref<any>({});
// 是否显示编辑抽屉
const showEditDrawer = ref(false);

// 抽屉冲的form表单对象
const editForm = ref();
// form表单规则验证
const editRules = ref<any>({
  formulaCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  formulaName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  equipCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  processCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  version: [{ message: '此项为必填项', required: true, trigger: 'change' }],
});

/**
 * 显示是编辑抽屉
 * @param row 表格行数据
 */
function editRow(row?: any) {
  checkedRow.value = row
    ? {
        ...row,
      }
    : {};
  if (row) {
    handleProcessSearch(row.processName);
    handleSearch(row.equipCode);
  }
  showEditDrawer.value = true;

  // 查询管理人员数据, 防止第一次点击时没有数据
  handleSearch('');
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
      deleteSteps(row.id).then(() => {
        // 显示操作成功的提示信息
        message.success($t('common.successfulOperation'));
        gridApi.query();
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
}

/**
 * 表单提交
 */
function submit() {
  editForm.value.validate().then(() => {
    const ob = checkedRow.value.id
      ? updateEquipOpFormula(checkedRow.value)
      : insertEquipOpFormula(checkedRow.value);
    ob.then(() => {
      // 查询用户数据
      gridApi.query();
      message.success($t('common.successfulOperation'));
      onClose();
    });
  });
}

// endregion

// region 设备数据查询及绑定操作
// 设备数据
const equipData = ref<any>([]);
// 定时器id
let equipTimeout: any = null;
const equipLoading = ref(false);
/**
 * 处理搜索操作
 * 当用户输入搜索值时，延迟触发搜索请求，以减少频繁的网络请求。
 * @param {string} value - 用户输入的搜索值
 */
function handleSearch(value: string) {
  // 如果之前有延迟搜索操作未完成，先清除
  if (equipTimeout) {
    clearTimeout(equipTimeout);
    equipTimeout = null;
  }
  // 定义一个立即执行的匿名函数，用于执行搜索请求
  const fake = () => {
    equipLoading.value = true;
    // 调用listSysPerson API函数，传递搜索参数
    fuzzyQueryOfEquipmentNumber({
      equipmentCode: value, // 用户输入的搜索值，通常用于按姓名搜索
    })
      .then((data) => {
        // 请求成功后，清空当前的搜索结果
        equipData.value = [];
        // 遍历返回的搜索结果列表
        for (const item of data) {
          // 将每个搜索结果格式化后添加到personnelData数组中
          equipData.value.push({
            label: `${item.equipmentName}(${item.equipmentCode})`, // 显示的标签
            value: `${item.equipmentCode}`, // 实际的值
          });
        }
      })
      .finally(() => {
        equipLoading.value = false;
      });
  };
  // 使用setTimeout延迟执行搜索请求，延迟时间为300毫秒
  equipTimeout = setTimeout(fake, 300);
}
// endregion

// region 工序数据查询及绑定操作
// 工序数据
const processData = ref<any>([]);
// 定时器id
let processTimeout: any = null;
const processLoading = ref(false);

/**
 * 处理搜索操作
 * 当用户输入搜索值时，延迟触发搜索请求，以减少频繁的网络请求。
 * @param {string} value - 用户输入的搜索值
 */
function handleProcessSearch(value: string) {
  // 如果之前有延迟搜索操作未完成，先清除
  if (processTimeout) {
    clearTimeout(processTimeout);
    processTimeout = null;
  }
  // 定义一个立即执行的匿名函数，用于执行搜索请求
  const fake = () => {
    if (!value) {
      return;
    }
    processLoading.value = true;
    // 调用listSysPerson API函数，传递搜索参数
    getProceByName(value)
      .then((data) => {
        // 请求成功后，清空当前的搜索结果
        processData.value = [];
        // 遍历返回的搜索结果列表
        for (const item of data) {
          // 将每个搜索结果格式化后添加到personnelData数组中
          processData.value.push({
            label: `${item.processName}`, // 显示的标签
            value: `${item.processCode}`, // 实际的值
          });
        }
      })
      .finally(() => {
        processLoading.value = false;
      });
  };
  // 使用setTimeout延迟执行搜索请求，延迟时间为300毫秒
  processTimeout = setTimeout(fake, 300);
}
// endregion

// region 匹配操作
// 匹配抽屉
const workstepRecipeManagementMatchRef = ref();

/**
 * 打开匹配抽屉
 * @param row 点击行
 */
function showMatchDrawer(row: any) {
  workstepRecipeManagementMatchRef.value.open(row);
}
// endregion

// region 状态切换
/**
 * 切换状态
 * @param row
 */
function updateStatus(row: any) {
  stepStateSwitching(row).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 关联人员
  perName: '',
  // 用户名
  userName: '',
});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    /**
     * 调用 listUser 函数，传入查询参数和分页信息。
     * 查询参数包括 queryParams.value 中的所有属性，以及当前页码和每页大小。
     */
    listEquipOpFormula({
      ...queryParams.value, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    }).then(({ total, list }) => {
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
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 工步名称 -->
        <FormItem
          :label="$t('stepManagementView.workStepName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.userName" />
        </FormItem>

        <!-- 所属工序 -->
        <FormItem
          :label="$t('stepManagementView.affiliatedProcess')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.perName" />
        </FormItem>

        <!-- 工步类型 -->
        <FormItem
          :label="$t('stepManagementView.workStepType')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.perName" />
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
            <template #title>{{ $t('common.edit') }}</template>
            <Button
              v-if="author.includes('编辑')"
              type="link"
              @click="editRow(row)"
            >
              <Icon
                icon="mdi:edit-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>

          <!-- 匹配 -->
          <Tooltip>
            <template #title>{{ $t('common.match') }}</template>
            <Button
              v-if="author.includes('匹配')"
              type="link"
              @click="showMatchDrawer(row)"
            >
              <Icon
                icon="mdi:priority-low"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>

          <!-- 删除数据 -->
          <Tooltip>
            <template #title>{{ $t('common.delete') }}</template>
            <Button
              v-if="author.includes('删除')"
              danger
              type="link"
              @click="delRow(row)"
            >
              <Icon
                icon="mdi-light:delete"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
        <template #isUse="{ row }">
          <RadioGroup
            v-model:value="row.isUse"
            @change="updateStatus(row)"
            :disabled="!author.includes('状态变更')"
          >
            <RadioButton :value="1">
              {{ $t('status.enable') }}
            </RadioButton>
            <RadioButton :value="-1">
              {{ $t('status.forbidden') }}
            </RadioButton>
          </RadioGroup>
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
    >
      <Form
        ref="editForm"
        :label-col="{ span: 8 }"
        :model="checkedRow"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        name="editMessageForm"
      >
        <!-- 配方编号 -->
        <FormItem
          :label="$t('operationFormula.formulaNumber')"
          name="formulaCode"
        >
          <Input v-model:value="checkedRow.formulaCode" />
        </FormItem>
        <!-- 配方名称 -->
        <FormItem
          :label="$t('operationFormula.formulaName')"
          name="formulaName"
        >
          <Input v-model:value="checkedRow.formulaName" />
        </FormItem>
        <!-- 设备名称 -->
        <FormItem
          :label="$t('operationFormula.equipmentName')"
          name="equipCode"
        >
          <Select
            v-model:value="checkedRow.equipCode"
            :default-active-first-option="false"
            :filter-option="false"
            :not-found-content="equipLoading ? undefined : null"
            :options="equipData"
            :show-arrow="false"
            placeholder="输入用户名进行查询"
            placement="bottomRight"
            show-search
            @search="handleSearch"
          >
            <template v-if="equipLoading" #notFoundContent>
              <Spin size="small" />
            </template>
          </Select>
        </FormItem>
        <!-- 工序名称 -->
        <FormItem
          :label="$t('operationFormula.processName')"
          name="processCode"
        >
          <Select
            v-model:value="checkedRow.processCode"
            :default-active-first-option="false"
            :filter-option="false"
            :options="processData"
            :show-arrow="false"
            :not-found-content="processLoading ? undefined : null"
            placeholder="输入工序名进行查询"
            placement="bottomRight"
            show-search
            @search="handleProcessSearch"
          >
            <template v-if="processLoading" #notFoundContent>
              <Spin size="small" />
            </template>
          </Select>
        </FormItem>
        <!-- 版本号 -->
        <FormItem :label="$t('operationFormula.versionNumber')" name="version">
          <Input v-model:value="checkedRow.version" />
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

    <WorkstepRecipeManagementMatch ref="workstepRecipeManagementMatchRef" />
  </Page>
</template>

<style scoped></style>
