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
  Select,
  Space,
  TimeRangePicker,
  Tooltip,
} from 'ant-design-vue';
import dayjs from 'dayjs';
// eslint-disable-next-line n/no-extraneous-import
import { debounce } from 'lodash-es';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  checkClassName,
  checkClassNumber,
  deleteClassController,
  getClassControllerList,
  insertClassController,
  selectFQList,
  updateClassController,
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
    {
      field: 'classNumber',
      title: '班组编号',
      minWidth: 150,
    },
    {
      field: 'className',
      title: '班组名称',
      minWidth: 150,
    },
    {
      field: 'productionLine',
      title: '所属产线',
      minWidth: 150,
    },
    {
      field: 'systemName',
      title: '用能单元分区',
      minWidth: 150,
    },
    {
      field: 'startTime',
      title: '开始时间',
      minWidth: 150,
    },
    {
      field: 'endTime',
      title: '结束时间',
      minWidth: 150,
    },
    {
      field: 'remark',
      title: '备注',
      minWidth: 150,
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

// region 查看 / 编辑 / 新增 具体操作

// 当前选中的表格行
const checkedRow = ref<any>({});
// 是否显示查看详情抽屉
const showViewDrawer = ref(false);
// 是否显示编辑抽屉
const showEditDrawer = ref(false);

// 抽屉冲的form表单对象
const editForm = ref();
// form表单规则验证
const editRules = ref<any>({
  classNumber: [
    {
      message: '此项为必填项',
      required: true,
      trigger: 'change',
    },
    {
      trigger: 'change',
      validator: (_rule: any, value: any) => {
        return new Promise((resolve, reject) => {
          checkClassNumberShake(value, resolve, reject);
        });
      },
    },
  ],
  className: [
    { message: '此项为必填项', required: true, trigger: 'change' },
    {
      trigger: 'change',
      validator: (_rule: any, value: any) => {
        return new Promise((resolve, reject) => {
          checkClassNameShake(value, resolve, reject);
        });
      },
    },
  ],
  time: [{ message: '此项为必填项', required: true, trigger: 'change' }],
});
/**
 * 班组编号防抖
 */
const checkClassNumberShake = debounce(
  (value: string, resolve: any, reject: any) => {
    checkClassNumber({
      id: checkedRow.value?.id,
      classNumber: value,
    }).then((res) => {
      if (res) {
        resolve();
      } else {
        reject(new Error('该班组编号已存在'));
      }
    });
  },
  500,
);
/**
 * 班组名称防抖
 */
const checkClassNameShake = debounce(
  (value: string, resolve: any, reject: any) => {
    checkClassName({
      id: checkedRow.value?.id,
      className: value,
    }).then((res) => {
      if (res) {
        resolve();
      } else {
        reject(new Error('该班组名称已存在'));
      }
    });
  },
  500,
);
/**
 * 显示是编辑抽屉
 * @param row 表格行数据
 */
function editRow(row?: any) {
  checkedRow.value = row
    ? {
        ...row,
        time: [dayjs(row.startTime, 'HH:mm'), dayjs(row.endTime, 'HH:mm')],
      }
    : {};
  showEditDrawer.value = true;
  queryUnitPartitions();
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
      deleteClassController({
        id: row.id,
      }).then(() => {
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
  showViewDrawer.value = false;
  showEditDrawer.value = false;
}

/**
 * 表单提交
 */
function submit() {
  editForm.value.validate().then(() => {
    const params = {
      ...checkedRow.value,
    };
    if (params.time) {
      params.startTime = params.time[0].format('HH:mm');
      params.endTime = params.time[1].format('HH:mm');
    }
    const ob = params.id
      ? updateClassController(params)
      : insertClassController(params);
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

// region 单元分区

// 分区列表
const listOfUnitPartitions = ref<any>([]);

/**
 * 分区查询
 */
function queryUnitPartitions() {
  selectFQList().then((data) => {
    listOfUnitPartitions.value = [];
    data.forEach((item: any) => {
      listOfUnitPartitions.value.push({
        label: item.name,
        value: item.name,
      });
    });
  });
}

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
    /**
     * 调用 getClassControllerList 函数，传入查询参数和分页信息。
     * 查询参数包括 queryParams.value 中的所有属性，以及当前页码和每页大小。
     */
    getClassControllerList({
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
        <!-- 班组名称 -->
        <FormItem
          :label="$t('energyConsumptionAnalysis.teamName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.className" />
        </FormItem>
        <!-- 班组编号 -->
        <FormItem
          :label="$t('energyConsumptionAnalysis.teamNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.classNumber" />
        </FormItem>

        <!-- 分区名称 -->
        <FormItem
          :label="$t('unitAreaManagement.partitionName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.systemName" />
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
              type="link"
              @click="editRow(row)"
              v-if="author.includes('编辑')"
            >
              <Icon
                icon="mdi:edit-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>

          <!-- 删除数据 -->
          <Tooltip>
            <template #title>{{ $t('common.delete') }}</template>
            <Button
              type="link"
              @click="delRow(row)"
              v-if="author.includes('删除')"
              danger
            >
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
    >
      <Form
        ref="editForm"
        :label-col="{ span: 8 }"
        :model="checkedRow"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
      >
        <!-- 班组名称 -->
        <FormItem
          :label="$t('energyConsumptionAnalysis.teamName')"
          name="className"
        >
          <Input
            v-model:value="checkedRow.className"
            :disabled="checkedRow.id"
          />
        </FormItem>
        <!-- 班组编号 -->
        <FormItem
          :label="$t('energyConsumptionAnalysis.teamNumber')"
          name="classNumber"
        >
          <Input
            v-model:value="checkedRow.classNumber"
            :disabled="checkedRow.id"
          />
        </FormItem>
        <!-- 所属产线 -->
        <FormItem
          :label="$t('energyConsumptionAnalysis.productionLine')"
          name="productionLine"
        >
          <Input v-model:value="checkedRow.productionLine" />
        </FormItem>

        <!-- 单元分区 -->
        <FormItem :label="$t('equip.unitPartitioning')" name="systemName">
          <Select
            v-model:value="checkedRow.systemName"
            :options="listOfUnitPartitions"
          />
        </FormItem>
        <!-- 时间范围 -->
        <FormItem
          :label="$t('energyConsumptionAnalysis.timeFrame')"
          name="time"
        >
          <TimeRangePicker v-model:value="checkedRow.time" />
        </FormItem>
        <!-- 备注 -->
        <FormItem
          :label="$t('energyConsumptionAnalysis.remarks')"
          name="remark"
        >
          <Input v-model:value="checkedRow.remark" />
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
