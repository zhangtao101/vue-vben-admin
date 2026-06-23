<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
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
  message,
  Modal,
  Select,
  Space,
  Spin,
  Textarea,
  Tooltip,
  Upload,
} from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { debounce } from 'lodash-es';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getFaultTreeList } from '#/api/equipManagement/equipmentFailure.service';
import {
  createEquipFaultManual,
  deleteEquipFaultManual,
  getEquipFaultManualById,
  listEquipFaultManualPage,
  updateEquipFaultManual,
} from '#/api/equipManagement/equipmentRepairAction.service';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// ========== 权限 ==========
const route = useRoute();
const author = ref<string[]>([]);

onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// ========== 查询参数 ==========
const queryParams = ref<any>({
  manualCode: '',
  manualName: '',
  faultTreeName: '',
});

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: $t('basic.laborHourEvaluation.sequence') },
    {
      field: 'manualCode',
      title: $t('repair.equipmentRepairAction.manualCode'),
      minWidth: 120,
    },
    {
      field: 'manualName',
      title: $t('repair.equipmentRepairAction.manualName'),
      minWidth: 150,
    },
    {
      field: 'faultTreeName',
      title: $t('repair.equipmentRepairAction.faultTreeName'),
      minWidth: 150,
    },
    {
      field: 'manualContent',
      title: $t('repair.equipmentRepairAction.manualContent'),
      minWidth: 250,
    },
    {
      field: 'remark',
      title: $t('repair.equipmentRepairAction.remark'),
      minWidth: 120,
    },
    {
      field: 'action',
      title: $t('common.action'),
      width: 120,
      slots: { default: 'action' },
      fixed: 'right',
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData(page);
      },
    },
  },
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// ========== 数据查询 ==========
function queryData(page?: { currentPage: number; pageSize: number }) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams.value,
      pageNum: page?.currentPage || 1,
      pageSize: page?.pageSize || 20,
    };
    listEquipFaultManualPage(params)
      .then((data) => {
        resolve({
          total: data.total || 0,
          items: data.results || data || [],
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 处理查询按钮点击。
 */
function handleQuery() {
  gridApi.reload();
}

/**
 * 处理重置按钮点击。
 */
function handleReset() {
  queryParams.value = {
    manualCode: '',
    manualName: '',
    faultTreeName: '',
  };
  gridApi.reload();
}

// ========== 导入 ==========
const accessStore = useAccessStore();
const importFile = ref<any>([]);

function getImportUrl() {
  return `/ht/${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/import/repair-measure`;
}

function handleImportChange(info: any) {
  const { file } = info;
  if (file.status === 'done') {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
    importFile.value = [];
  } else if (file.status === 'error') {
    message.error($t('common.operationFailure'));
  }
}

// ========== 抽屉控制 ==========
const drawerVisible = ref(false);
const dialogStatus = ref<'create' | 'update'>('create');
const currentRow = ref<any>({});
const drawerForm = ref();

// ========== 表单校验规则 ==========
const formRules = ref<any>({
  manualCode: [{ required: true, message: $t('repair.equipmentRepairAction.manualCodePlaceholder'), trigger: 'change' }],
  manualName: [{ required: true, message: $t('repair.equipmentRepairAction.manualNamePlaceholder'), trigger: 'change' }],
  faultTreeName: [{ required: true, message: $t('repair.equipmentRepairAction.faultTreeNameSearchPlaceholder'), trigger: 'change' }],
  manualContent: [{ required: true, message: $t('repair.equipmentRepairAction.manualContentPlaceholder'), trigger: 'change' }],
});

// ========== 故障现象远程搜索 ==========
const faultTreeOptions = ref<{ label: string; value: string }[]>([]);
const faultTreeLoading = ref(false);

const handleFaultTreeSearch = debounce((val: string) => {
  faultTreeLoading.value = true;
  getFaultTreeList({ keyword: val })
    .then((data: any) => {
      const list = data?.results || data || [];
      faultTreeOptions.value = list.map((item: any) => ({
        label: item.faultName || item.name || item.label,
        value: item.faultName || item.name || item.label,
      }));
    })
    .finally(() => {
      faultTreeLoading.value = false;
    });
}, 500);

/**
 * 打开新增抽屉。
 */
function handleAdd() {
  dialogStatus.value = 'create';
  currentRow.value = {
    manualCode: '',
    manualName: '',
    faultTreeName: '',
    manualContent: '',
    remark: '',
  };
  drawerVisible.value = true;
  handleFaultTreeSearch('');
}

/**
 * 打开编辑抽屉，先查询详情再展示。
 * @param row 行数据
 */
function handleEdit(row: any) {
  getEquipFaultManualById(row.id).then((data) => {
    dialogStatus.value = 'update';
    currentRow.value = data || {};
    drawerVisible.value = true;
    handleFaultTreeSearch('');
  });
}

/**
 * 处理删除按钮点击。
 * @param row 行数据
 */
function handleDelete(row: any) {
  Modal.confirm({
    title: $t('repair.equipmentRepairAction.confirmDelete'),
    content: $t('repair.equipmentRepairAction.deleteMessage', { name: row.manualName }),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      deleteEquipFaultManual(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
  });
}

/**
 * 抽屉关闭回调，重置表单。
 */
function onClose() {
  drawerForm.value?.resetFields();
  currentRow.value = {};
  drawerVisible.value = false;
}

/**
 * 抽屉提交回调。
 */
function handleSubmit() {
  drawerForm.value
    ?.validate()
    .then(() => {
      if (dialogStatus.value === 'create') {
        createEquipFaultManual(currentRow.value).then(() => {
          message.success($t('common.successfulOperation'));
          onClose();
          gridApi.reload();
        });
      } else {
        updateEquipFaultManual(currentRow.value).then(() => {
          message.success($t('common.successfulOperation'));
          onClose();
          gridApi.reload();
        });
      }
    })
    .catch(() => {
      // 表单校验不通过
    });
}
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 手册编码 -->
        <FormItem
          :label="$t('repair.equipmentRepairAction.manualCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.manualCode"
            :placeholder="$t('repair.equipmentRepairAction.manualCodePlaceholder')"
            allow-clear
          />
        </FormItem>
        <!-- 手册名称 -->
        <FormItem
          :label="$t('repair.equipmentRepairAction.manualName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.manualName"
            :placeholder="$t('repair.equipmentRepairAction.manualNamePlaceholder')"
            allow-clear
          />
        </FormItem>
        <!-- 故障现象名称 -->
        <FormItem
          :label="$t('repair.equipmentRepairAction.faultTreeName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.faultTreeName"
            :placeholder="$t('repair.equipmentRepairAction.faultTreeNamePlaceholder')"
            allow-clear
          />
        </FormItem>
        <!-- 操作按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Space>
            <Button @click="handleReset">
              {{ $t('common.reset') }}
            </Button>
            <Button type="primary" @click="handleQuery">
              <Icon icon="mdi:magnify" class="inline-block align-middle" />
              {{ $t('common.search') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <Button
            v-if="author.includes('新增')"
            type="primary"
            @click="handleAdd"
          >
            <Icon icon="mdi:plus" class="inline-block align-middle" />
            {{ $t('common.add') }}
          </Button>
          <Upload
            v-if="author.includes('新增')"
            v-model:file-list="importFile"
            name="files"
            accept=".xlsx,.xls"
            :multiple="false"
            :action="getImportUrl()"
            :headers="{ Authorization: `${accessStore.accessToken}` }"
            :show-upload-list="false"
            @change="handleImportChange"
            class="ml-4!"
          >
            <Button>
              <Icon
                icon="mdi:cloud-upload"
                class="inline-block align-middle text-xl text-[#5085ff]"
              />
              {{ $t('common.import') }}
            </Button>
          </Upload>
        </template>
        <template #action="{ row }">
          <Space>
            <Tooltip v-if="author.includes('编辑')">
              <template #title>{{ $t('common.edit') }}</template>
              <Button type="link" @click="handleEdit(row)" class="px-1">
                <Icon
                  icon="mdi:pencil-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="author.includes('删除')">
              <template #title>{{ $t('common.delete') }}</template>
              <Button
                type="link"
                danger
                @click="handleDelete(row)"
                class="px-1"
              >
                <Icon
                  icon="mdi:delete-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 新增/编辑抽屉 -->
    <Drawer
      v-model:open="drawerVisible"
      :title="
        dialogStatus === 'create'
          ? $t('repair.equipmentRepairAction.addTitle')
          : $t('repair.equipmentRepairAction.editTitle')
      "
      width="600"
      :destroy-on-close="true"
      :footer-style="{ textAlign: 'right' }"
    >
      <Form
        ref="drawerForm"
        :model="currentRow"
        :rules="formRules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
      >
        <FormItem :label="$t('repair.equipmentRepairAction.manualCode')" name="manualCode">
          <Input
            v-model:value="currentRow.manualCode"
            :placeholder="$t('repair.equipmentRepairAction.manualCodePlaceholder')"
          />
        </FormItem>
        <FormItem :label="$t('repair.equipmentRepairAction.manualName')" name="manualName">
          <Input
            v-model:value="currentRow.manualName"
            :placeholder="$t('repair.equipmentRepairAction.manualNamePlaceholder')"
          />
        </FormItem>
        <FormItem :label="$t('repair.equipmentRepairAction.faultTreeName')" name="faultTreeName">
          <Select
            v-model:value="currentRow.faultTreeName"
            :options="faultTreeOptions"
            :filter-option="false"
            :not-found-content="faultTreeLoading ? undefined : null"
            :default-active-first-option="false"
            show-search
            :placeholder="$t('repair.equipmentRepairAction.faultTreeNameSearchPlaceholder')"
            class="!w-full"
            @search="handleFaultTreeSearch"
          >
            <template v-if="faultTreeLoading" #notFoundContent>
              <Spin size="small" />
            </template>
          </Select>
        </FormItem>
        <FormItem :label="$t('repair.equipmentRepairAction.manualContent')" name="manualContent">
          <Textarea
            v-model:value="currentRow.manualContent"
            :placeholder="$t('repair.equipmentRepairAction.manualContentPlaceholder')"
            :rows="4"
          />
        </FormItem>
        <FormItem :label="$t('repair.equipmentRepairAction.remark')" name="remark">
          <Textarea
            v-model:value="currentRow.remark"
            :placeholder="$t('repair.equipmentRepairAction.remarkPlaceholder')"
            :rows="3"
          />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <Button @click="onClose">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="primary" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
