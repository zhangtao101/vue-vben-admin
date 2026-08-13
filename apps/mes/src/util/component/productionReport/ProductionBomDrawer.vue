<script lang="ts" setup>
/**
 * 生产BOM新增/编辑/查看抽屉
 * 使用单个表单形式编辑，提交时通过 [] 包裹调用批量接口。
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { Button, Drawer, Form, FormItem, Input, message, Modal, Space, Textarea } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  insertProductBom,
  queryMaterialInfoList,
  updateProductBom
} from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'ProductionBomDrawer',
});

// Emits
const emit = defineEmits<{
  refresh: [];
}>();

// 内部状态
const show = ref(false);
const currentMode = ref<'create' | 'update' | 'view'>('create');

// 表单数据
const formData = ref<any>({
  code: '',
  planCode: '',
  parentCode: '',
  materialCode: '',
  materialName: '',
  materialDosage: '',
  measureError: '',
  perDosage: '',
  auxiliaryUnit: '',
  unit: '',
  remark: '',
});

// 表单校验规则：查看模式下清空，避免只读字段被校验
const rules = computed<Record<string, any>>(() => {
  if (currentMode.value === 'view') {
    return {};
  }
  return {
    materialCode: [{ required: true, message: $t('productionBom.requireMaterial') }],
  };
});

const formRef = ref<any>();

// ============ 物料选择弹窗 ============
const materialDialogVisible = ref(false);
const materialQuery = ref({
  pageNum: 1,
  pageSize: 10,
  materialCode: '',
  materialName: '',
});

const materialGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50 },
    { title: $t('productionBom.materialCode'), field: 'materialCode', minWidth: 120 },
    { title: $t('productionBom.materialName'), field: 'materialName', minWidth: 150 },
    { title: $t('productionBom.auxiliaryUnit'), field: 'auxiliaryUnit', minWidth: 120 },
    { title: $t('productionBom.unit'), field: 'unit', minWidth: 80 },
  ],
  radioConfig: { trigger: 'row' },
  height: 400,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: ({ page }) => {
        const params = {
          ...materialQuery.value,
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        };
        return queryMaterialInfoList(params).then((res: any) => {
          return {
            items: res.results || [],
            total: res.total || 0,
          };
        });
      },
    },
  },
  rowConfig: { keyField: 'materialCode' },
  showOverflow: 'tooltip',
  stripe: true,
};

const [MaterialGrid, materialGridApi] = useVbenVxeGrid({
  gridOptions: materialGridOptions,
});

// 根据传入行构建表单数据，新增时返回空对象
function buildFormData(row?: any) {
  if (!row?.id) {
    return {
      code: '',
      planCode: '',
      parentCode: '',
      materialCode: '',
      materialName: '',
      materialDosage: '',
      measureError: '',
      perDosage: '',
      auxiliaryUnit: '',
      unit: '',
      remark: '',
    };
  }
  return {
    id: row.id,
    code: row.code || '',
    planCode: row.planCode || '',
    parentCode: row.parentCode || '',
    materialCode: row.materialCode || '',
    materialName: row.materialName || '',
    materialDosage: row.materialDosage || '',
    measureError: row.measureError || '',
    perDosage: row.perDosage || '',
    auxiliaryUnit: row.auxiliaryUnit || '',
    unit: row.unit || '',
    remark: row.remark || '',
  };
}

function open(mode: 'create' | 'update' | 'view', row?: any) {
  currentMode.value = mode;
  show.value = true;
  formData.value = buildFormData(row);
}

defineExpose({ open });

// 打开物料选择弹窗
function handleOpenMaterialDialog() {
  materialQuery.value = {
    pageNum: 1,
    pageSize: 10,
    materialCode: '',
    materialName: '',
  };
  materialGridApi.reload();
  materialDialogVisible.value = true;
}

function handleConfirmMaterial() {
  const selectedRow = materialGridApi.grid?.getRadioRecord();
  if (!selectedRow) {
    message.warning($t('productionBom.requireMaterial'));
    return;
  }
  const m = selectedRow;
  formData.value.materialCode = m.materialCode;
  formData.value.materialName = m.materialName;
  formData.value.auxiliaryUnit = m.auxiliaryUnit;
  formData.value.unit = m.unit;
  materialDialogVisible.value = false;
}

function handleSubmit() {
  formRef.value
    .validate()
    .then(() => {
      const payload = { ...formData.value };
      // 单个形式编辑，提交时用 [] 包裹调用批量接口
      const api =
        currentMode.value === 'create' ? insertProductBom : updateProductBom;
      return api([payload]);
    })
    .then(() => {
      message.success(
        currentMode.value === 'create'
          ? $t('productionBom.addSuccess')
          : $t('productionBom.editSuccess'),
      );
      show.value = false;
      emit('refresh');
    })
    .catch(() => {
      message.warning($t('productionBom.operationFailed'));
    });
}

function handleClose() {
  show.value = false;
}
</script>

<template>
  <Drawer
    v-model:open="show"
    :title="
      currentMode === 'create'
        ? $t('productionBom.addTitle')
        : currentMode === 'update'
          ? $t('productionBom.editTitle')
          : $t('productionBom.viewTitle')
    "
    width="600"
    :destroy-on-close="true"
    :footer-style="{ textAlign: 'right' }"
  >
    <Form
      ref="formRef"
      :label-col="{ span: 6 }"
      :model="formData"
      :rules="rules"
      :wrapper-col="{ span: 18 }"
      autocomplete="off"
      layout="horizontal"
    >
      <FormItem :label="$t('productionBom.code')">
        <Input
          v-model:value="formData.code"
          :disabled="currentMode === 'view'"
          :maxlength="50"
        />
      </FormItem>
      <FormItem :label="$t('productionBom.planCode')">
        <Input
          v-model:value="formData.planCode"
          :placeholder="$t('productionBom.inputPlanCode')"
          :disabled="currentMode === 'view'"
          :maxlength="50"
        />
      </FormItem>
      <FormItem :label="$t('productionBom.parentCode')">
        <Input
          v-model:value="formData.parentCode"
          :placeholder="$t('productionBom.inputParentCode')"
          :disabled="currentMode === 'view'"
          :maxlength="50"
        />
      </FormItem>
      <FormItem :label="$t('productionBom.materialCode')" name="materialCode">
        <Space style="width: 100%">
          <Input
            v-model:value="formData.materialCode"
            :placeholder="$t('productionBom.inputMaterialCode')"
            disabled
            style="flex: 1"
          />
          <Button
            v-if="currentMode !== 'view'"
            type="primary"
            @click="handleOpenMaterialDialog"
          >
            {{ $t('productionBom.selectData') }}
          </Button>
        </Space>
      </FormItem>
      <FormItem :label="$t('productionBom.materialName')">
        <Input
          v-model:value="formData.materialName"
          :placeholder="$t('productionBom.inputMaterialName')"
          :disabled="currentMode === 'view'"
        />
      </FormItem>
      <FormItem :label="$t('productionBom.auxiliaryUnit')">
        <Input v-model:value="formData.auxiliaryUnit" disabled />
      </FormItem>
      <FormItem :label="$t('productionBom.unit')">
        <Input v-model:value="formData.unit" disabled />
      </FormItem>
      <FormItem :label="$t('productionBom.materialDosage')">
        <Input
          v-model:value="formData.materialDosage"
          :disabled="currentMode === 'view'"
          :maxlength="20"
        />
      </FormItem>
      <FormItem :label="$t('productionBom.perDosage')">
        <Input
          v-model:value="formData.perDosage"
          :disabled="currentMode === 'view'"
          :maxlength="20"
        />
      </FormItem>
      <FormItem :label="$t('productionBom.measureError')">
        <Input
          v-model:value="formData.measureError"
          :disabled="currentMode === 'view'"
          :maxlength="20"
        />
      </FormItem>
      <FormItem :label="$t('productionBom.remark')">
        <Textarea
          v-model:value="formData.remark"
          :rows="3"
          :disabled="currentMode === 'view'"
          :maxlength="200"
        />
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <Button @click="handleClose">{{ $t('productionBom.cancel') }}</Button>
        <Button
          v-if="currentMode !== 'view'"
          type="primary"
          @click="handleSubmit"
        >
          {{ $t('productionBom.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>

  <!-- 物料选择弹窗 -->
  <Modal
    v-model:open="materialDialogVisible"
    :title="$t('productionBom.selectData')"
    width="80%"
    :footer-style="{ textAlign: 'right' }"
    @cancel="materialDialogVisible = false"
  >
    <Space class="!mb-4">
      <Input
        v-model:value="materialQuery.materialCode"
        :placeholder="$t('productionBom.inputMaterialCode')"
        allow-clear
        @press-enter="materialGridApi.reload"
      />
      <Input
        v-model:value="materialQuery.materialName"
        :placeholder="$t('productionBom.inputMaterialName')"
        allow-clear
        @press-enter="materialGridApi.reload"
      />
      <Button type="primary" @click="materialGridApi.reload">
        {{ $t('productionBom.search') }}
      </Button>
    </Space>
    <MaterialGrid>
      <template #toolbar-tools></template>
    </MaterialGrid>
    <template #footer>
      <Space>
        <Button @click="materialDialogVisible = false">
          {{ $t('productionBom.cancel') }}
        </Button>
        <Button type="primary" @click="handleConfirmMaterial">
          {{ $t('productionBom.confirm') }}
        </Button>
      </Space>
    </template>
  </Modal>
</template>
