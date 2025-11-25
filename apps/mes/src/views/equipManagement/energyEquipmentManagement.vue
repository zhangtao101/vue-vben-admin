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
  InputNumber,
  message,
  Modal,
  RadioButton,
  RadioGroup,
  Select,
  Space,
  Statistic,
  Tooltip,
  Upload,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addTheMeter,
  batchOut,
  deleteTheMeter,
  editTheMeter,
  getTheMeterTemplate,
  selectFQList,
  selectYB,
  selectZXList,
  updateStat,
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
      field: 'equipmentCode',
      title: '仪表编号',
      minWidth: 150,
    },
    {
      field: 'equipmentName',
      title: '仪表名称',
      minWidth: 150,
    },
    {
      field: 'type',
      title: '仪表类型',
      minWidth: 150,
    },
    {
      field: 'model',
      title: '仪表型号',
      minWidth: 150,
    },
    {
      field: 'useDepartmentName',
      title: '所属单元分区',
      minWidth: 150,
    },
    {
      field: 'location',
      title: '安装位置',
      minWidth: 150,
    },
    {
      field: 'bl',
      title: '倍率（电表专属）',
      minWidth: 150,
      visible: true,
    },
    {
      title: '启用状态',
      fixed: 'right',
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
  equipmentCode: [
    {
      message: '此项为必填项',
      required: true,
      trigger: 'change',
    },
  ],
  equipmentName: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  zoningId: [{ message: '此项为必填项', required: true, trigger: 'change' }],
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
      deleteTheMeter({ id: row.id, equipmentCode: row.equipmentCode }).then(
        () => {
          // 显示操作成功的提示信息
          message.success($t('common.successfulOperation'));
          gridApi.query();
        },
      );
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
      ? editTheMeter(checkedRow.value)
      : addTheMeter(checkedRow.value);
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

// region 更新状态

function updateStatus(row: any) {
  updateStat({
    ids: [row.id],
    stat: row.stat,
  }).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

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
        value: item.id,
      });
    });
  });
}

function partitionChange(_val: any, item: any) {
  checkedRow.value.zoningName = item.label;
}

// endregion

// region 查询数据
// 查询参数
const queryParams = ref<any>({
  equipType: 1,
  stat: -1,
});

// 电表类型
const equipTypeOptions = ref([
  {
    label: '电表',
    value: 1,
  },
  {
    label: '水表',
    value: 2,
  },
  {
    label: '气表',
    value: 3,
  },
]);
// 状态列表
const statusOptions = ref([
  {
    label: '全部',
    value: -1,
  },
  {
    label: '启用',
    value: 1,
  },
  {
    label: '禁用',
    value: 0,
  },
]);

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params = {
      ...queryParams.value, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    };
    if (params.stat === -1) {
      delete params.stat;
    }
    selectYB(params).then(({ total, list }) => {
      // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
      resolve({
        total,
        items: list,
      });
    });

    querySum();
  });
}

// endregion

// region 模板下载

function downloadTemplate() {
  getTheMeterTemplate().then((data: string) => {
    window.open(data, '_blank');
  });
}

// endregion
// region 导出
/**
 * 导出
 */
function exportFile() {
  const params = {
    ...queryParams.value,
  };
  if (params.stat === -1) {
    delete params.stat;
  }
  batchOut(params).then((data: any) => {
    window.open(data, '_blank');
  });
}
// endregion

// region 文件上传
const accessStore = useAccessStore();
// 文件上传头信息
const headers = ref<any>({
  Authorization: accessStore.accessToken,
});
// 上传路径
const action = ref<string>(
  `/ht/${import.meta.env.VITE_GLOB_MES_ENERGY}/Zoning/equipment/batchInsert`,
);
// 文件列表
const fileList = ref<any>([]);

/**
 * 处理文件上传状态变化的函数。
 * @param info - 包含文件上传信息的对象。
 */
function handleChange(info: any) {
  // 检查文件是否上传成功
  if (info.file.status === 'done') {
    // 重新查询数据，更新列表
    gridApi.reload();
    // 显示成功消息
    message.success('文件上传成功!');
  } else if (info.file.status === 'error') {
    // 获取错误信息，如果存在则显示，否则显示通用错误消息
    const errorMessage = info.file.response?.message || '文件上传失败';
    // 显示错误消息
    message.error(errorMessage);
  }
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 初始化
const sum = ref<any>({
  off: 0,
  on: 0,
  zx: 0,
});
function querySum() {
  selectZXList().then((data) => {
    sum.value = data;
  });
}

onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  queryUnitPartitions();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 设备数量信息 -->
    <Card class="mb-4">
      <!-- 设备总数 -->
      <Statistic
        :title="$t('equip.Total')"
        :value="sum.zx"
        class="ml-4 mr-4 inline-block"
      >
        <template #prefix>
          <Icon icon="mdi:dots-grid" class="inline-block align-top text-4xl" />
        </template>
      </Statistic>
      <!-- 启用设备 -->
      <Statistic
        :title="$t('equip.Enabled')"
        :value="sum.on"
        class="ml-4 mr-4 inline-block"
      >
        <template #prefix>
          <Icon icon="mdi:play" class="inline-block align-top text-4xl" />
        </template>
      </Statistic>
      <!-- 未启用设备 -->
      <Statistic
        :title="$t('equip.NotEnabled')"
        :value="sum.off"
        class="ml-4 mr-4 inline-block"
      >
        <template #prefix>
          <Icon icon="mdi:pause" class="inline-block align-top text-4xl" />
        </template>
      </Statistic>
    </Card>
    <!-- endregion -->
    <!-- region 搜索 -->
    <Card class="mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 电表类型 -->
        <FormItem :label="$t('equip.meterType')" style="margin-bottom: 1em">
          <RadioGroup
            v-model:value="queryParams.equipType"
            :options="equipTypeOptions"
          />
        </FormItem>
        <!-- 仪表编号 -->
        <FormItem
          :label="$t('equip.InstrumentNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.equipmentCode" />
        </FormItem>

        <!-- 仪表名称 -->
        <FormItem
          :label="$t('equip.InstrumentName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.equipmentName" />
        </FormItem>
        <!-- 设备状态 -->
        <FormItem :label="$t('equip.Status')" style="margin-bottom: 1em">
          <RadioGroup
            v-model:value="queryParams.stat"
            :options="statusOptions"
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
          <!-- 导出按钮 -->
          <Button
            v-if="author.includes('导出')"
            type="primary"
            @click="exportFile()"
            class="ml-4"
          >
            {{ $t('common.export') }}
          </Button>
          <!-- 模板下载按钮 -->
          <Button
            v-if="author.includes('导入')"
            type="primary"
            @click="downloadTemplate()"
            class="ml-4"
          >
            {{ $t('common.templateDownload') }}
          </Button>
          <!-- 导入按钮 -->
          <Upload
            v-if="author.includes('导入')"
            v-model:file-list="fileList"
            :action="action"
            :headers="headers"
            :show-upload-list="false"
            name="file"
            @change="handleChange"
            class="ml-4"
          >
            <Button type="primary">
              {{ $t('common.import') }}
            </Button>
          </Upload>
        </template>
        <template #isUse="{ row }">
          <RadioGroup
            v-model:value="row.stat"
            @change="updateStatus(row)"
            :disabled="!author.includes('状态变更')"
          >
            <RadioButton :value="1">
              {{ $t('status.enable') }}
            </RadioButton>
            <RadioButton :value="0">
              {{ $t('status.forbidden') }}
            </RadioButton>
          </RadioGroup>
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
        <!-- 仪表名称 -->
        <FormItem :label="$t('equip.InstrumentName')" name="equipmentName">
          <Input
            v-model:value="checkedRow.equipmentName"
            :disabled="checkedRow.id"
          />
        </FormItem>
        <!-- 仪表编号 -->
        <FormItem :label="$t('equip.InstrumentNumber')" name="equipmentCode">
          <Input
            v-model:value="checkedRow.equipmentCode"
            :disabled="checkedRow.id"
          />
        </FormItem>
        <!-- 单元分区 -->
        <FormItem :label="$t('equip.unitPartitioning')" name="zoningId">
          <Select
            v-model:value="checkedRow.zoningId"
            :options="listOfUnitPartitions"
            @change="partitionChange"
            :disabled="checkedRow.id"
          />
        </FormItem>
        <!-- 品牌型号 -->
        <FormItem :label="$t('equip.brandModel')" name="model">
          <Input v-model:value="checkedRow.model" />
        </FormItem>
        <!-- 安装地址 -->
        <FormItem :label="$t('equip.installationAddress')" name="location">
          <Input v-model:value="checkedRow.location" />
        </FormItem>
        <!-- 电表类型 -->
        <FormItem :label="$t('equip.meterType')" name="equiptype">
          <RadioGroup
            v-model:value="checkedRow.equipType"
            :options="equipTypeOptions"
          />
        </FormItem>
        <!-- 倍率 -->
        <FormItem
          :label="$t('equip.magnification')"
          name="bl"
          v-if="checkedRow.equipType === 1"
        >
          <InputNumber v-model:value="checkedRow.bl" :min="0" />
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
