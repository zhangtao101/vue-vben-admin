<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { IconifyIcon, MdiSearch } from '@vben/icons';

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
// eslint-disable-next-line n/no-extraneous-import
import { debounce } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  AddLineLossAnalysis,
  addLineLossAnalysisConfiguration,
  checkLineLossName,
  checkLineLossNumber,
  deleteLineLossAnalysis,
  getLineLossAnalysisList,
  selectLossEquipment,
  updateLineLoss,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import MeterSelection from '#/util/component/MeterSelection.vue';

// 路由信息
const route = useRoute();

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'lossNumber',
      title: '线损对象编号',
      minWidth: 150,
    },
    {
      field: 'lossName',
      title: '线损对象名称',
      minWidth: 150,
    },
    {
      field: 'remark',
      title: '描述',
      minWidth: 150,
    },
    {
      field: 'createUser',
      title: '创建人',
      minWidth: 150,
    },
    {
      field: 'createTime',
      title: '创建时间',
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
  lossNumber: [
    {
      message: '此项为必填项',
      required: true,
      trigger: 'change',
    },
    {
      trigger: 'change',
      validator: (_rule: any, value: any) => {
        return new Promise((resolve, reject) => {
          partitionIDAntiShake(value, resolve, reject);
        });
      },
    },
  ],
  lossName: [
    { message: '此项为必填项', required: true, trigger: 'change' },
    {
      trigger: 'change',
      validator: (_rule: any, value: any) => {
        return new Promise((resolve, reject) => {
          partitionNameAntiShake(value, resolve, reject);
        });
      },
    },
  ],
  partitionJC: [{ message: '此项为必填项', required: true, trigger: 'change' }],
});
/**
 * 用能分区ID防抖
 */
const partitionIDAntiShake = debounce(
  (value: string, resolve: any, reject: any) => {
    checkLineLossNumber({
      id: checkedRow.value?.id,
      lossNumber: value,
    }).then((res) => {
      if (res) {
        resolve();
      } else {
        reject(new Error('该用能分区ID已存在'));
      }
    });
  },
  500,
);
/**
 * 用能分区名称防抖
 */
const partitionNameAntiShake = debounce(
  (value: string, resolve: any, reject: any) => {
    checkLineLossName({
      id: checkedRow.value?.id,
      lossName: value,
    }).then((res) => {
      if (res) {
        resolve();
      } else {
        reject(new Error('该用能分区名称已存在'));
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
      }
    : {};
  showEditDrawer.value = true;
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
      deleteLineLossAnalysis(row.id).then(() => {
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
    const ob = checkedRow.value.id
      ? updateLineLoss(checkedRow.value)
      : AddLineLossAnalysis(checkedRow.value);
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
    /**
     * 调用 getLineLossAnalysisList 函数，传入查询参数和分页信息。
     * 查询参数包括 queryParams.value 中的所有属性，以及当前页码和每页大小。
     */
    getLineLossAnalysisList({
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

// region 线损配置
// 线损配置抽屉是否显示
const lineLossConfigurationDrawer = ref(false);
// 线损配置对象
const lineLossObject = ref<any>({});
const lineLossObjectForm = ref<any>();

/**
 * 线损配置抽屉显示
 * @param row
 */
function showLineLossConfigurationDrawer(row: any) {
  lineLossConfigurationDrawer.value = true;
  const arr = row.equipment
    ? JSON.parse(row.equipment)
    : {
        level: 1,
        key: uuidv4(),
        child: [],
      };
  lineLossObject.value = {
    id: row.id,
    lineLossEquipmentVM: arr,
  };
  queryEquipment();
}

/**
 * 电表待选项
 */
const equipmentOptions = ref<any>([]);

/**
 * 查询电表
 */
function queryEquipment() {
  selectLossEquipment().then((res) => {
    equipmentOptions.value = [];
    res.forEach((item: any) => {
      equipmentOptions.value.push({
        label: item.equipmentName,
        value: item.equipmentCode,
      });
    });
  });
}

/**
 * 电表变更
 */
function equipmentChange(parent: any) {
  return (_val: any, item: any) => {
    parent.equipmentName = item.label;
    parent.equipmentCode = item.value;
  };
}

/**
 * 添加子级电表
 * @param item
 */
function addAChild(item: any) {
  if (!item.child) {
    item.child = [];
  }
  item.child.push({
    equipmentCode: '',
    equipmentName: '',
    level: (item.level || 0) + 1,
    key: uuidv4(),
  });
}

/**
 * 根据key删除电表
 * @param targetKey 目标key
 * @param targetValue 目标value
 * @param obj 对象列表
 */
function removeByKeyValue(targetKey: string, targetValue: string, obj?: any) {
  if (!obj) {
    obj = lineLossObject.value.lineLossEquipmentVM;
  }
  if (Array.isArray(obj)) {
    // 如果是数组，遍历数组中的每个元素
    for (let i = obj.length - 1; i >= 0; i--) {
      const item = obj[i];
      if (item[targetKey] === targetValue) {
        // 如果当前元素的 key 等于目标值，删除该元素
        obj.splice(i, 1);
      } else {
        // 如果当前元素有 child 属性，递归处理 child
        if (item.child) {
          removeByKeyValue(targetKey, targetValue, item.child);
        }
      }
    }
  } else if (typeof obj === 'object' && obj !== null && obj.child) {
    // 如果是对象，检查是否有 child 属性
    removeByKeyValue(targetKey, targetValue, obj.child);
  }
}

/**
 *线损配置提交
 */
function lineLossConfiguration() {
  lineLossObjectForm.value.validate().then(() => {
    addLineLossAnalysisConfiguration(lineLossObject.value).then(() => {
      message.success($t('common.successfulOperation'));
      lineLossConfigurationIsTurnedOff();
      gridApi.reload();
    });
  });
}

/**
 * 线损配置抽屉关闭
 */
function lineLossConfigurationIsTurnedOff() {
  lineLossConfigurationDrawer.value = false;
  lineLossObject.value = {};
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
        <!-- 分区ID -->
        <FormItem
          :label="$t('unitAreaManagement.partitionID')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.partitionID" />
        </FormItem>

        <!-- 分区名称 -->
        <FormItem
          :label="$t('unitAreaManagement.partitionName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.partitionName" />
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
              <IconifyIcon
                icon="mdi:edit-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 线损配置 -->
          <Tooltip>
            <template #title>
              {{ $t('unitAreaManagement.lineLossConfiguration') }}
            </template>
            <Button
              type="link"
              @click="showLineLossConfigurationDrawer(row)"
              v-if="author.includes('线损配置')"
            >
              <IconifyIcon
                icon="mdi-light:settings"
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
              <IconifyIcon
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
        <!-- 线损对象编号 -->
        <FormItem
          :label="$t('unitAreaManagement.lineLossObjectNumber')"
          name="lossNumber"
        >
          <Input v-model:value="checkedRow.lossNumber" />
        </FormItem>
        <!-- 线损对象名称 -->
        <FormItem
          :label="$t('unitAreaManagement.lineLossObjectName')"
          name="lossName"
        >
          <Input v-model:value="checkedRow.lossName" />
        </FormItem>
        <!-- 描述 -->
        <FormItem :label="$t('unitAreaManagement.describe')" name="remark">
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

    <!-- region 线损配置 抽屉 -->
    <Drawer
      v-model:open="lineLossConfigurationDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="600"
      class="custom-class"
      placement="right"
      :title="$t('unitAreaManagement.lineLossConfiguration')"
    >
      <Form
        ref="lineLossObjectForm"
        :model="lineLossObject.lineLossEquipmentVM"
      >
        <!-- 电表编号 -->
        <!--        <FormItem
          :label="$t('unitAreaManagement.meterNumber')"
          name="equipmentCode"
          class="pl-4"
          :rules="{ required: true, message: '请选择电表编号' }"
        >
          <Select
            v-model:value="lineLossObject.lineLossEquipmentVM.equipmentCode"
            :options="equipmentOptions"
            @change="(val, item) => equipmentChange(-1)(val, item)"
            class="w-full"
          />
          <Button @click="addAChild(lineLossObject.lineLossEquipmentVM)">
            添加子级
          </Button>
        </FormItem>-->
        <MeterSelection
          :parent="lineLossObject.lineLossEquipmentVM"
          :equipment-options="equipmentOptions"
          :equipment-change="equipmentChange"
          :add-a-meter="addAChild"
          :remove-fun="removeByKeyValue"
        />
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="lineLossConfigurationIsTurnedOff">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="lineLossConfiguration">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
