<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onBeforeUnmount, ref } from 'vue';

import { MdQrcodeScan } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Space,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { checkSmtFeed, feedingMaterials, listSmtFeed } from '#/api';
import useWebSocket from '#/util/websocket-util';

const props = defineProps({
  // 工步id
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心
  workstationCode: {
    type: String,
    default: '',
  },
});

// region MSD 等级配置
const msdLevelMap: Record<number, { color: string; text: string }> = {
  1: { color: 'yellow', text: '1级' },
  2: { color: 'blue', text: '2级' },
  3: { color: 'red', text: '3级' },
};

function getMsdLevel(row: any): { color: string; text: string } {
  const level = msdLevelMap[row.msdLevel];
  return level || { color: '', text: '' };
}

// endregion

// region 数据查询
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'worksheetCode',
      title: '工单号',
      minWidth: 150,
    },
    {
      field: 'materialCode',
      title: '料号',
      minWidth: 120,
    },
    {
      field: 'materialName',
      title: '物料名称',
      minWidth: 120,
    },
    {
      field: 'unit',
      title: '单位',
      width: 80,
    },
    {
      field: 'auxiliaryDoage',
      title: 'BOM总用量',
      width: 120,
    },
    {
      field: 'feedNumber',
      title: '投入量',
      width: 100,
    },
    {
      field: 'location',
      title: '料站号',
      width: 100,
    },
    {
      field: 'msdLevel',
      title: 'MSD等级',
      width: 100,
      slots: { default: 'msdLevel' },
    },
    {
      field: 'unit2',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 150,
      fixed: 'right',
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        return await queryData({
          pageNum: page?.currentPage || 1,
          pageSize: page?.pageSize || 10,
        });
      },
    },
    page: true,
  },
  scrollY: {
    enabled: true,
    gt: 30,
  },
  scrollX: {
    enabled: true,
    gt: 0,
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: any = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 查询贴片投料信息
 * 功能：获取当前工位的贴片投料数据并格式化表格数据
 * 流程：
 * 1. 构造包含工站、工单等参数的请求对象
 * 2. 调用贴片投料查询接口
 * 3. 转换 materialList 适配 vxe-table 格式
 */
function queryData(pageParams?: { pageNum: number; pageSize: number }) {
  return new Promise((resolve, reject) => {
    listSmtFeed({
      workstationCode: props.workstationCode,
      worksheetCode: props.worksheetCode,
      bindingId: props.bindingId,
      functionId: props.functionId,
      pageNum: pageParams?.pageNum || 1,
      pageSize: pageParams?.pageSize || 10,
    })
      .then(({ list, total }: any) => {
        resolve({
          total: total || 0,
          items: list || [],
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}
// endregion

// region 投料抽屉
const showDrawer = ref(false);
const verified = ref(false);
const editMessage = ref({} as any);
const editMessageForm = ref();
const editRules = ref({
  materialCode: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  labelCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  feedNumber: [{ message: '此项为必填项', required: true, trigger: 'change' }],
} as any);

/**
 * 打开贴片投料编辑抽屉
 * @param row - 当前操作的物料行数据
 */
function editRow(row: any) {
  showDrawer.value = true;
  verified.value = false;
  editMessage.value = {
    materialCode: row.materialCode,
    workstationCode: props.workstationCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
    location: row.location,
    unit: row.unit,
  };
}

/**
 * 标签编号回车事件：校验标签码并自动填充投入量
 */
function onLabelCodeEnter() {
  const { labelCode, materialCode } = editMessage.value;
  if (!labelCode || !materialCode) {
    message.warning('请先确认料号和标签编号');
    return;
  }
  checkSmtFeed({ labelCode, materialCode }).then(({ labelNumber }: any) => {
    editMessage.value.feedNumber = labelNumber;
    verified.value = true;
    message.success(`标签校验成功，投入量：${labelNumber}`);
  });
}

/**
 * 关闭投料编辑抽屉
 */
function onClose() {
  showDrawer.value = false;
  editMessage.value = {};
}

/**
 * 提交贴片投料表单数据
 * 流程：
 * 1. 执行表单字段校验
 * 2. 调用投料接口提交数据
 * 3. 成功后刷新表格数据并关闭抽屉
 */
function submit() {
  editMessageForm.value.validate().then(() => {
    feedingMaterials({
      materialCode: editMessage.value.materialCode,
      workstationCode: editMessage.value.workstationCode,
      worksheetCode: editMessage.value.worksheetCode,
      bindingId: editMessage.value.bindingId,
      functionId: editMessage.value.functionId,
      labelCode: editMessage.value.labelCode,
      feedNumber: editMessage.value.feedNumber,
    }).then(() => {
      message.success($t('common.successfulOperation'));
      gridApi.reload();
      onClose();
    });
  });
}

// endregion

// region websocket
const { close: websocketClose } = useWebSocket(readMessage, {
  workstationCode: props.workstationCode,
  equipCode: props.equipCode,
  worksheetCode: props.worksheetCode,
  bindingId: props.bindingId,
  functionId: props.functionId,
  webSocketType: 5,
});

function readMessage(message: string) {
  const data = JSON.parse(message);
  if (data) {
    gridApi.reload();
  }
}
// endregion

onBeforeUnmount(() => {
  websocketClose();
});
</script>

<template>
  <Grid>
    <template #toolbar-tools></template>
    <template #msdLevel="{ row }">
      <Tag v-if="getMsdLevel(row).color" :color="getMsdLevel(row).color">
        {{ getMsdLevel(row).text }}
      </Tag>
      <span v-else>-</span>
    </template>
    <template #action="{ row }">
      <!-- 扫码投料按钮 -->
      <Tooltip>
        <template #title>扫码投料</template>
        <Button
          :icon="h(MdQrcodeScan, { class: 'inline-block size-6' })"
          class="mr-4"
          type="link"
          @click="editRow(row)"
        />
      </Tooltip>
    </template>
  </Grid>
  <Drawer
    v-model:open="showDrawer"
    :footer-style="{ textAlign: 'right' }"
    :width="600"
    class="custom-class"
    placement="right"
    root-class-name="root-class-name"
    title="贴片投料"
    @close="onClose"
  >
    <Form
      :label-col="{ span: 6 }"
      :model="editMessage"
      ref="editMessageForm"
      :rules="editRules"
    >
      <!-- 物料编号 -->
      <FormItem label="料号" name="materialCode">
        <Input v-model:value="editMessage.materialCode" disabled />
      </FormItem>
      <!-- 料站号 -->
      <FormItem label="料站号" name="location">
        <Input v-model:value="editMessage.location" disabled />
      </FormItem>
      <!-- 标签编号 -->
      <FormItem label="标签编号" name="labelCode">
        <Input
          v-model:value="editMessage.labelCode"
          placeholder="扫描标签码"
          @press-enter="onLabelCodeEnter"
        />
      </FormItem>
      <!-- 投入量 -->
      <FormItem label="投入量" name="feedNumber">
        <InputNumber
          v-model:value="editMessage.feedNumber"
          :addon-after="editMessage.unit || ''"
        />
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <Button @click="onClose">
          {{ $t('common.cancel') }}
        </Button>
        <Button type="primary" :disabled="!verified" @click="submit">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped></style>
