<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, ref } from 'vue';

import { CarbonTaskComplete, MdQrcodeScan } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  feedingComplete,
  feedingMaterials,
  materialFeedingInformationQuerySlitting,
} from '#/api';

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

/**
 * 获取标签的class
 */
function getLabelClass() {
  return 'mr-4 inline-block w-48 border p-2 text-center';
}

/**
 * 获取值的class
 */
function getValueClass() {
  return 'inline-block w-48 border p-2 text-center';
}

// region 数据查询
// 查询条件
// const queryParams = ref<any>({});

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'materialCode',
      title: '物料编号',
      minWidth: 120,
    },
    {
      field: 'materialName',
      title: '物料名称',
      minWidth: 120,
    },
    { field: 'auxiliaryDoage', title: '目标重量(KG)', minWidth: 150 },
    { field: 'feedNumber', title: '当前累计投料(KG)', minWidth: 250 },
    { field: 'feedRate', title: '投料进度(%)', minWidth: 150 },
    {
      field: 'feedCheckFlag',
      title: '投料校验',
      minWidth: 150,
      slots: { default: 'feedCheckFlag' },
    },
    {
      field: 'isClear',
      title: '完成状态',
      minWidth: 150,
      slots: { default: 'isClear' },
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
      query: async () => {
        return await queryData();
      },
    },
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
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: any = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

const details = ref<any>({});
/**
 * 查询物料列表
 */
function queryData() {
  return new Promise((resolve, reject) => {
    materialFeedingInformationQuerySlitting({
      workstationCode: props.workstationCode,
      equipCode: props.equipCode,
      worksheetCode: props.worksheetCode,
      bindingId: props.bindingId,
      functionId: props.functionId,
      feedtype: 1,
    })
      .then(({ detailDtos, ...p }: any) => {
        details.value = p;
        resolve({
          total: detailDtos.length,
          items: detailDtos,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getFeedCheckFlagText(row: any) {
  switch (row.feedCheckFlag) {
    case 1: {
      return '通过';
    }
    case 2: {
      return '不通过';
    }
    case 3: {
      return '未检测';
    }
  }
}
function getIsClearText(row: any) {
  switch (row.isClear) {
    case 1: {
      return '未完成';
    }
    case 2: {
      return '已完成';
    }
  }
}

// endregion

// region 投料
// 是否显示投料抽屉
const showDrawer = ref(false);
// 编辑对象数据
const editMessage = ref({} as any);
// 编辑对单数据
const editMessageForm = ref();
// 编辑对象表单验证规则
const editRules = ref({
  materialCode: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  feedNumber: [{ message: '此项为必填项', required: true, trigger: 'change' }],
} as any);

/**
 * 显示模态框
 * @param row
 */
function editRow(row: any) {
  showDrawer.value = true;
  editMessage.value = {
    materialCode: row.materialCode,
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
  };
}

/**
 * 关闭模态框
 */
function onClose() {
  showDrawer.value = false;
  editMessage.value = {};
}

/**
 * 提交
 */
function submit() {
  editMessageForm.value.validate().then(() => {
    feedingMaterials(editMessage.value).then(() => {
      message.success($t('common.successfulOperation'));
      gridApi.reload();
      onClose();
    });
  });
}
/**
 * 投料完成
 * @param row
 */
function feedingCompleteFun(row: any) {
  // 弹出确认框，询问用户是否确认删除该行数据
  Modal.confirm({
    // 取消按钮的文本
    cancelText: '取消',
    // 确认按钮的文本
    okText: '确认',
    // 确认按钮的类型（此处为危险操作，通常用于删除等不可逆操作）
    okType: 'danger',

    // 用户取消操作时触发的回调函数
    onCancel() {
      // 弹出警告提示，提示用户取消了操作
      message.warning('已取消操作!');
    },

    // 用户确认操作时触发的回调函数
    onOk() {
      feedingComplete({
        materialCode: row.materialCode,
        workstationCode: props.workstationCode,
        equipCode: props.equipCode,
        worksheetCode: props.worksheetCode,
        bindingId: props.bindingId,
        functionId: props.functionId,
      }).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },

    // 确认框的标题文本
    title: '是否确认投料完成?',
  });
}
// endregion
</script>

<template>
  <div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 前工步执行状况 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.implementationStatus') }}
      </span>
      <span :class="getValueClass()">
        <!--        {{ obtainTheDeviceCleanStatus(3) }}-->
        {{ details?.lastFeedFlagName }}
      </span>
    </div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 当前设备投料模式 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.currentDeviceFeedingMode') }}
      </span>
      <!-- 手动 -->
      <span :class="getValueClass()">
        {{ details?.feedModelName }}
      </span>
    </div>
  </div>
  <Grid>
    <template #feedCheckFlag="{ row }">
      {{ getFeedCheckFlagText(row) }}
    </template>
    <template #isClear="{ row }">
      {{ getIsClearText(row) }}
    </template>
    <template #action="{ row }">
      <!-- 扫码按钮 -->
      <Tooltip>
        <template #title>
          {{ $t('common.scanTheCodeAndFeedTheMaterial') }}
        </template>
        <Button
          :icon="h(MdQrcodeScan, { class: 'inline-block size-6' })"
          class="mr-4"
          type="link"
          @click="editRow(row)"
          :disabled="row.isClear === 2"
        />
        <!--       -->
      </Tooltip>
      <!-- 完成按钮 -->
      <Tooltip>
        <template #title>{{ $t('common.feedingComplete') }}</template>
        <Button
          :icon="h(CarbonTaskComplete, { class: 'inline-block size-6' })"
          class="mr-4"
          type="link"
          @click="feedingCompleteFun(row)"
          :disabled="row.isClear === 2"
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
    title="物料投料"
    @close="onClose"
  >
    <Form
      :label-col="{ span: 6 }"
      :model="editMessage"
      :rules="editRules"
      :wrapper-col="{ span: 18 }"
      autocomplete="off"
      ref="editMessageForm"
    >
      <!-- 物料编号 -->
      <FormItem
        :label="$t('productionOperation.materialNumber')"
        name="materialCode"
      >
        <Input v-model:value="editMessage.materialCode" disabled />
      </FormItem>
      <!-- 标签编号 -->
      <FormItem :label="$t('productionOperation.labelNumber')" name="ruleName">
        <Input v-model:value="editMessage.labelCode" />
      </FormItem>
      <!-- 投入量 -->
      <FormItem
        :label="$t('productionOperation.inputQuantity')"
        name="feedNumber"
      >
        <InputNumber v-model:value="editMessage.feedNumber" addon-after="KG" />
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <!-- 取消 -->
        <Button @click="onClose">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 打印 -->
        <Button type="primary" @click="submit">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped></style>
