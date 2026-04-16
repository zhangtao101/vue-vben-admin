<script lang="ts" setup>
import { ref, watch } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  DatePicker,
  Descriptions,
  DescriptionsItem,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  SelectOption,
  Space,
  Table,
  TableColumn,
  Tag,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  createSpareOrder,
  getSpareOrderById,
  getSparePartList,
  updateSpareOrder,
} from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'SpareOrderDrawer',
});

const props = withDefaults(defineProps<Props>(), {
  open: false,
  row: null,
  mode: 'add',
});

// Emits
const emit = defineEmits<{
  success: [];
  'update:open': [value: boolean];
}>();

// Props
interface Props {
  open?: boolean;
  row?: any;
  mode?: 'add' | 'edit' | 'view';
}

// 抽屉可见性
const drawerVisible = ref(props.open);
const drawerLoading = ref(false);

watch(
  () => props.open,
  (val) => {
    drawerVisible.value = val;
    if (val) {
      initData();
    }
  },
);

watch(drawerVisible, (val) => {
  emit('update:open', val);
});

// ========== 表单数据 ==========
function getDefaultFormData() {
  return {
    orderName: '',
    orderType: '' as any,
    orderDate: '' as any,
    recipient: '',
  };
}

const formData = ref(getDefaultFormData());
const details = ref<any[]>([]);
const sparePartOptions = ref<any[]>([]);

// ========== 下拉选项 ==========
const orderTypeOptions = [
  { label: $t('repair.spareOrder.orderTypeIn'), value: 'IN' },
  { label: $t('repair.spareOrder.orderTypeOut'), value: 'OUT' },
];

// ========== 初始化数据 ==========
function initData() {
  loadSparePartOptions();
  if (props.mode === 'view' && props.row?.id) {
    loadOrderDetail(props.row.id);
  } else if (props.mode === 'edit' && props.row?.id) {
    loadOrderDetail(props.row.id);
  } else {
    formData.value = getDefaultFormData();
    details.value = [];
  }
}

// ========== 加载备件列表 ==========
function loadSparePartOptions() {
  getSparePartList().then((res: any[]) => {
    sparePartOptions.value = (res || []).map((item: any) => ({
      label: `${item.spareCode} - ${item.spareName}`,
      value: item.spareCode,
      spareName: item.spareName,
      spareModel: item.spareModel,
      equipmentGroup: item.equipmentGroup,
    }));
  });
}

// ========== 加载单据详情 ==========
function loadOrderDetail(id: number) {
  drawerLoading.value = true;
  getSpareOrderById(id)
    .then((data) => {
      formData.value = {
        ...data,
        orderDate: data.orderDate ? dayjs(data.orderDate) : '',
      };
      details.value = data.details || [];
    })
    .finally(() => {
      drawerLoading.value = false;
    });
}

// ========== 明细操作 ==========
function addDetail() {
  details.value.push({
    spareCode: undefined,
    spareName: '',
    spareModel: '',
    equipmentGroup: '',
    quantity: undefined,
  });
}

function removeDetail(index: number) {
  Modal.confirm({
    title: $t('repair.spareOrder.confirmDeleteDetail'),
    content: '确定要删除该明细吗？',
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      details.value.splice(index, 1);
    },
  });
}

function onSpareChange(index: number, spareCode: string) {
  const option = sparePartOptions.value.find(
    (item) => item.value === spareCode,
  );
  if (option) {
    details.value[index].spareName = option.spareName;
    details.value[index].spareModel = option.spareModel;
    details.value[index].equipmentGroup = option.equipmentGroup;
  }
}

// ========== 保存 ==========
function handleSave() {
  drawerLoading.value = true;
  const validDetails = details.value.filter((d) => d.spareCode && d.quantity);
  if (validDetails.length === 0) {
    message.warning('请至少添加一条明细');
    drawerLoading.value = false;
    return;
  }

  const params = {
    ...formData.value,
    orderDate: dayjs.isDayjs(formData.value.orderDate)
      ? formData.value.orderDate.format('YYYY-MM-DD')
      : formData.value.orderDate || '',
    details: validDetails.map((d: any) => ({
      spareCode: d.spareCode,
      quantity: d.quantity,
    })),
  };

  const promise =
    props.mode === 'add'
      ? createSpareOrder(params)
      : updateSpareOrder({ id: props.row.id, ...params });

  promise
    .then(() => {
      message.success($t('common.successfulOperation'));
      drawerVisible.value = false;
      emit('success');
    })
    .finally(() => {
      drawerLoading.value = false;
    });
}

// ========== 状态颜色映射 ==========
const orderTypeColorMap: Record<string, string> = {
  IN: 'success',
  OUT: 'processing',
};

// ========== 状态显示文本 ==========
function getOrderTypeText(type: string) {
  return type === 'IN'
    ? $t('repair.spareOrder.orderTypeIn')
    : $t('repair.spareOrder.orderTypeOut');
}

// ========== 过滤选项 ==========
function filterOption(input: string, option: any) {
  return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
}
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :title="
      mode === 'view'
        ? $t('repair.spareOrder.detailTitle')
        : mode === 'edit'
          ? $t('repair.spareOrder.editTitle')
          : $t('repair.spareOrder.addTitle')
    "
    width="700"
    :destroy-on-close="true"
  >
    <div
      v-if="drawerLoading && mode === 'view'"
      class="flex justify-center py-8"
    >
      <Icon icon="mdi:loading" class="animate-spin text-3xl" />
    </div>
    <div v-else>
      <Form layout="vertical">
        <Descriptions :column="2" bordered size="small">
          <DescriptionsItem
            :label="$t('repair.spareOrder.orderName')"
            :span="2"
          >
            <Input
              v-if="mode !== 'view'"
              v-model:value="formData.orderName"
              :placeholder="`请输入${$t('repair.spareOrder.orderName')}`"
            />
            <span v-else>{{ formData.orderName }}</span>
          </DescriptionsItem>
          <DescriptionsItem :label="$t('repair.spareOrder.orderType')">
            <Select
              v-if="mode !== 'view'"
              v-model:value="formData.orderType"
              style="width: 100%"
            >
              <SelectOption
                v-for="item in orderTypeOptions"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </SelectOption>
            </Select>
            <Tag v-else :color="orderTypeColorMap[formData.orderType]">
              {{ getOrderTypeText(formData.orderType) }}
            </Tag>
          </DescriptionsItem>
          <DescriptionsItem :label="$t('repair.spareOrder.orderDate')">
            <DatePicker
              :disabled="mode === 'view'"
              v-model:value="formData.orderDate"
              format="YYYY-MM-DD"
              style="width: 100%"
            />
          </DescriptionsItem>
          <DescriptionsItem
            v-if="formData.orderType === 'OUT'"
            :label="$t('repair.spareOrder.recipient')"
            :span="2"
          >
            <Input
              v-if="mode !== 'view'"
              v-model:value="formData.recipient"
              :placeholder="`请输入${$t('repair.spareOrder.recipient')}`"
            />
            <span v-else>{{ formData.recipient }}</span>
          </DescriptionsItem>
        </Descriptions>
      </Form>

      <Divider>{{ $t('repair.spareOrder.details') }}</Divider>

      <!-- 明细表格 -->
      <Table :data-source="details" :pagination="false" size="small" bordered>
        <TableColumn
          :title="$t('repair.spareOrder.spareCode')"
          data-index="spareCode"
          width="180"
        >
          <template #default="{ index }">
            <Select
              v-if="mode !== 'view'"
              v-model:value="details[index].spareCode"
              show-search
              :filter-option="filterOption"
              class="w-24"
              :dropdown-match-select-width="false"
              @change="(val: any) => onSpareChange(index, val)"
            >
              <SelectOption
                v-for="item in sparePartOptions"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              >
                {{ item.label }}
              </SelectOption>
            </Select>
            <span v-else>{{ details[index].spareCode }}</span>
          </template>
        </TableColumn>
        <TableColumn
          :title="$t('repair.spareOrder.spareName')"
          data-index="spareName"
          width="120"
        />
        <TableColumn
          :title="$t('repair.spareOrder.spareModel')"
          data-index="spareModel"
          width="120"
        />
        <TableColumn
          :title="$t('repair.spareOrder.equipmentGroup')"
          data-index="equipmentGroup"
          width="120"
        />
        <TableColumn
          :title="$t('repair.spareOrder.quantity')"
          data-index="quantity"
          width="120"
        >
          <template #default="{ index }">
            <InputNumber
              v-if="mode !== 'view'"
              v-model:value="details[index].quantity"
              :min="1"
              :precision="0"
              style="width: 100%"
            />
            <span v-else>{{ details[index].quantity }}</span>
          </template>
        </TableColumn>
        <TableColumn
          v-if="mode !== 'view'"
          :title="$t('common.action')"
          width="80"
        >
          <template #default="{ index }">
            <Button
              type="link"
              danger
              size="small"
              @click="removeDetail(index)"
            >
              <Icon icon="mdi:delete-outline" />
            </Button>
          </template>
        </TableColumn>
      </Table>

      <Button
        v-if="mode !== 'view'"
        type="dashed"
        block
        class="mt-2"
        @click="addDetail"
      >
        <Icon icon="mdi:plus" class="inline-block align-middle" />
        添加明细
      </Button>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <Space>
          <Button @click="drawerVisible = false">
            {{ $t('common.cancel') }}
          </Button>
          <Button
            v-if="mode !== 'view'"
            type="primary"
            :loading="drawerLoading"
            @click="handleSave"
          >
            {{ $t('common.save') }}
          </Button>
        </Space>
      </div>
    </template>
  </Drawer>
</template>
