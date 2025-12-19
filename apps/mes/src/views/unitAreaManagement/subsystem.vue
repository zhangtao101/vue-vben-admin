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
  Checkbox,
  CheckboxGroup,
  Col,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  RadioButton,
  RadioGroup,
  Row,
  Select,
  Space,
  Statistic,
  Tooltip,
  Upload,
} from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { debounce } from 'lodash-es';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addItemizedSystemList,
  checkSystemName,
  checkSystemNumber,
  deleteItemizedSystem,
  editorEquipment,
  getExcelPathItemizedSystemList,
  getItemizedSystemList,
  getItemizedSystemTemplate,
  selectEquipment,
  stopItemizedSystem,
  updateItemizedSystemList,
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
      field: 'systemNumber',
      title: '系统编号',
      minWidth: 150,
    },
    {
      field: 'systemName',
      title: '系统名称',
      minWidth: 150,
    },
    {
      field: 'systemType',
      title: '系统类型',
      minWidth: 150,
      slots: { default: 'systemType' },
    },
    {
      field: 'subarea',
      title: '所属单元分区',
      minWidth: 150,
    },
    {
      field: 'location',
      title: '安装位置',
      minWidth: 150,
    },
    {
      fixed: 'right',
      title: '运行状态',
      minWidth: 150,
      slots: { default: 'isUse' },
    },
    {
      field: 'equipmentCodes',
      title: '仪表',
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
  systemNumber: [
    {
      message: '此项为必填项',
      required: true,
      trigger: 'change',
    },
    {
      trigger: 'change',
      validator: (_rule: any, value: any) => {
        return new Promise((resolve, reject) => {
          systemNumberDetection(value, resolve, reject);
        });
      },
    },
  ],
  systemName: [
    { message: '此项为必填项', required: true, trigger: 'change' },
    {
      trigger: 'change',
      validator: (_rule: any, value: any) => {
        return new Promise((resolve, reject) => {
          systemNameDetection(value, resolve, reject);
        });
      },
    },
  ],
  subarea: [{ message: '此项为必填项', required: false, trigger: 'change' }],
  systemType: [{ message: '此项为必填项', required: true, trigger: 'change' }],
});

/**
 * 系统编号检测
 */
const systemNumberDetection = debounce(
  (value: string, resolve: any, reject: any) => {
    checkSystemNumber({
      id: checkedRow.value?.id,
      systemNumber: value,
    }).then((res) => {
      if (res) {
        resolve();
      } else {
        reject(new Error('该系统编号已存在'));
      }
    });
  },
  500,
);
/**
 * 34、系统名称检测
 */
const systemNameDetection = debounce(
  (value: string, resolve: any, reject: any) => {
    checkSystemName({
      id: checkedRow.value?.id,
      systemName: value,
    }).then((res) => {
      if (res) {
        resolve();
      } else {
        reject(new Error('该系统名称已存在'));
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
    : {
        runningStatus: 1,
      };
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
      deleteItemizedSystem(row.id).then(() => {
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
      ? updateItemizedSystemList(checkedRow.value)
      : addItemizedSystemList(checkedRow.value);
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
  stopItemizedSystem({
    idList: [row.id],
    state: row.runningStatus,
  }).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

// endregion

// region 仪表
// 仪表列表
const meterList = ref<any>([]);
// 仪表选择抽屉是否显示
const meterDrawer = ref(false);
// 仪表关键字
const meterKey = ref<string>('');
/**
 * 查询仪表列表
 * @param type
 */
function queryTheMeter(type: string) {
  selectEquipment({
    equipmentCode: '',
    type,
  }).then((data) => {
    meterList.value = [];
    data.forEach((item: any) => {
      meterList.value.push({
        label: `${item.equipmentName}(${item.equipmentCode})`,
        value: item.equipmentCode,
      });
    });
  });
}

/**
 * 显示仪表选择抽屉
 * @param row
 */
function showMeterDrawer(row: any) {
  queryTheMeter(row.systemType);
  meterDrawer.value = true;
  checkedRow.value = {
    ...row,
    equipmentCode: row.equipmentCodes,
  };
}

/**
 * 配置分项仪表
 */
function meterSubmit() {
  editorEquipment(checkedRow.value).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.query();
    meterClose();
  });
}
/**
 * 关闭配置分项仪表抽屉
 */
function meterClose() {
  meterDrawer.value = false;
  checkedRow.value = {};
}

// region 全选
/**
 * 全选/取消全选
 */
function selectAll(check: boolean) {
  // 过滤出包含 meterKey.value 的仪表
  // eslint-disable-next-line array-callback-return
  const arr = meterList.value.map((item: any) => {
    if (item.label.includes(meterKey.value)) {
      return item.value;
    }
  });
  if (check) {
    checkedRow.value.equipmentCode.push(...arr);
    checkedRow.value.equipmentCode = [
      ...new Set(checkedRow.value.equipmentCode),
    ];
  } else {
    checkedRow.value.equipmentCode = checkedRow.value.equipmentCode.filter(
      (item: string) => !arr.includes(item),
    );
  }
}

// endregion

// endregion

// region 单元分区

// 分区列表
/*
const listOfUnitPartitions = ref<any>([]);

/!**
 * 分区查询
 *!/
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
*/

// endregion

// region 查询数据
// 查询参数
const queryParams = ref<any>({
  runningStatus: -1,
});
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
// 系统类型列表
const systemType = [
  {
    label: '电表',
    value: '1',
  },
  {
    label: '水表',
    value: '2',
  },
  {
    label: '气表',
    value: '3',
  },
  {
    label: '碳表',
    value: '5',
  },
];
// 系统类型映射表
const systemTypeMap = Object.fromEntries(
  systemType.map(({ value, label }) => [value, label]),
);

// 总数信息
const sum = ref<any>({
  count: 0,
  countRunningSate: 0,
  countStopSate: 0,
});

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
    if (params.runningStatus === -1) {
      delete params.runningStatus;
    }
    getItemizedSystemList(params).then(
      ({ list: { total, list }, ...details }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        sum.value = details;
        resolve({
          total,
          items: list,
        });
      },
    );
  });
}

// endregion

// region 模板下载

function downloadTemplate() {
  getItemizedSystemTemplate().then((data: string) => {
    window.open(data, '_blank');
  });
}

// endregion
// region 导出
/**
 * 导出
 */
function exportFile() {
  getExcelPathItemizedSystemList(queryParams.value).then((data: any) => {
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
  `/ht/${import.meta.env.VITE_GLOB_MES_ENERGY}/ItemizedSystem/upload`,
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
    const {
      response: { code, msg },
    } = info.file;
    if (code === 200) {
      // 重新查询数据，更新列表
      gridApi.reload();
      // 显示成功消息
      message.success('文件上传成功!');
    } else {
      // 显示错误消息
      message.error(msg);
    }
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

onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  // queryUnitPartitions();
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
        :value="sum.count"
        class="ml-4 mr-4 inline-block"
      >
        <template #prefix>
          <Icon icon="mdi:dots-grid" class="inline-block align-top text-4xl" />
        </template>
      </Statistic>
      <!-- 启用设备 -->
      <Statistic
        :title="$t('equip.Enabled')"
        :value="sum.countRunningSate"
        class="ml-4 mr-4 inline-block"
      >
        <template #prefix>
          <Icon icon="mdi:play" class="inline-block align-top text-4xl" />
        </template>
      </Statistic>
      <!-- 未启用设备 -->
      <Statistic
        :title="$t('equip.NotEnabled')"
        :value="sum.countStopSate"
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
        <!-- 系统编号 -->
        <FormItem :label="$t('equip.systemNumber')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.systemNumber" />
        </FormItem>

        <!-- 系统名称 -->
        <FormItem :label="$t('equip.systemName')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.systemName" />
        </FormItem>
        <!-- 系统类型 -->
        <FormItem :label="$t('equip.systemType')" style="margin-bottom: 1em">
          <Select
            allow-clear
            v-model:value="queryParams.systemType"
            :options="systemType"
            class="!w-48"
          />
        </FormItem>
        <!-- 设备状态 -->
        <FormItem
          :label="$t('equip.operationalStatus')"
          style="margin-bottom: 1em"
        >
          <RadioGroup
            v-model:value="queryParams.runningStatus"
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
        <template #systemType="{ row }">
          {{ systemTypeMap[row.systemType] || row.systemType }}
        </template>
        <template #isUse="{ row }">
          <RadioGroup
            v-model:value="row.runningStatus"
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
          <!-- 配置分项仪表 -->
          <Tooltip>
            <template #title>{{ $t('equip.configuration') }}</template>
            <Button
              type="link"
              @click="showMeterDrawer(row)"
              v-if="author.includes('编辑')"
            >
              <Icon
                icon="mdi:settings-outline"
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
      @close="onClose"
    >
      <Form
        ref="editForm"
        :label-col="{ span: 8 }"
        :model="checkedRow"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
      >
        <!-- 系统编号 -->
        <FormItem :label="$t('equip.systemNumber')" name="systemNumber">
          <Input v-model:value="checkedRow.systemNumber" />
        </FormItem>
        <!-- 系统名称 -->
        <FormItem :label="$t('equip.systemName')" name="systemName">
          <Input v-model:value="checkedRow.systemName" />
        </FormItem>
        <!-- 单元分区 -->
        <FormItem :label="$t('equip.unitPartitioning')" name="subarea">
          <Input v-model:value="checkedRow.subarea" />
        </FormItem>
        <!-- 安装地址 -->
        <FormItem :label="$t('equip.installationAddress')" name="location">
          <Input v-model:value="checkedRow.location" />
        </FormItem>
        <!-- 系统类型 -->
        <FormItem :label="$t('equip.systemType')" name="systemType">
          <Select v-model:value="checkedRow.systemType" :options="systemType" />
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

    <!-- region 仪表选择 抽屉 -->
    <Drawer
      v-model:open="meterDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="400"
      class="custom-class"
      placement="right"
      :title="$t('equip.configuration')"
      @close="meterClose"
    >
      <Input v-model:value="meterKey" placeholder="请输入仪表名称或编号" />
      <div>
        <Space class="my-4">
          <Button @click="selectAll(true)" type="primary">全选</Button>
          <Button @click="selectAll(false)" type="primary">全不选</Button>
        </Space>
      </div>
      <CheckboxGroup v-model:value="checkedRow.equipmentCode">
        <Row>
          <template v-for="item of meterList" :key="item.value">
            <Col :span="24" class="mt-4" v-show="item.label.includes(meterKey)">
              <Checkbox :value="item.value">
                {{ item.label }}
              </Checkbox>
            </Col>
          </template>
        </Row>
      </CheckboxGroup>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="meterClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="meterSubmit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
