<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Form,
  FormItem,
  message,
  Modal,
  RadioButton,
  RadioGroup,
  Select,
  Space,
  Tooltip,
  Tree,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteFaultTree,
  getFaultTree,
  getFaultTreeList,
  searchBaseConfig,
} from '#/api/equipManagement/equipmentFailure.service';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import EquipmentFailureDrawer from '#/util/component/repairMaintenance/EquipmentFailureDrawer.vue';

// ========== 权限 ==========
const route = useRoute();
const author = ref<string[]>([]);

onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  // 加载树数据
  loadTreeData();
  // 加载故障等级选项
  loadFaultLevelOptions();
  // 加载设备组选项
  loadEquipmentGroupOptions();
});

// ========== 树数据 ==========
const treeData = ref<any[]>([]);

// ========== 加载树数据 ==========
function loadTreeData() {
  getFaultTree().then((res) => {
    // 转换数据格式以适配 Tree 组件
    treeData.value = res || [];
  });
}

// ========== 查询参数 ==========
const queryParams = ref<any>({
  faultLevelCode: undefined,
  equipmentGroup: undefined,
});

// ========== 故障等级选项 ==========
const faultLevelOptions = ref<any[]>([{ label: '全部', value: undefined }]);

// ========== 故障等级映射 ==========
const faultLevelMap = ref<Record<string, string>>({});

// ========== 加载故障等级选项 ==========
function loadFaultLevelOptions() {
  searchBaseConfig({ configType: 'FAULT_LEVEL' }).then((res) => {
    const options: any[] = [];
    const map: Record<string, string> = {};
    (res || []).forEach((item: any) => {
      options.push({
        label: item.configName,
        value: item.configCode,
      });
      map[item.configCode] = item.configName;
    });
    faultLevelOptions.value = [{ label: '全部', value: undefined }, ...options];
    faultLevelMap.value = map;
  });
}

// ========== 故障等级格式化 ==========
function formatFaultLevel(levelCode: string) {
  return faultLevelMap.value[levelCode] || levelCode || '-';
}

// ========== 设备组选项 ==========
const equipmentGroupOptions = ref<any[]>([]);

// ========== 加载设备组选项 ==========
function loadEquipmentGroupOptions() {
  searchBaseConfig({ configType: 'EQUIPMENT_GROUP' }).then((res) => {
    equipmentGroupOptions.value = (res || []).map((item: any) => ({
      label: item.configName,
      value: item.configCode,
    }));
  });
}

// ========== 抽屉控制 ==========
const drawerVisible = ref(false);
const currentRow = ref<any>(null);
const selectedParentId = ref<string | undefined>(undefined);
const selectedParentName = ref<string | undefined>(undefined);

function openDrawer(row?: any) {
  currentRow.value = row || null;
  drawerVisible.value = true;
}

function onDrawerSuccess() {
  gridApi.reload();
}

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: '序号' },
    {
      field: 'equipmentGroup',
      title: $t('repair.equipmentFailure.equipmentGroupCode'),
      minWidth: 120,
    },
    {
      field: 'faultCode',
      title: $t('repair.equipmentFailure.faultCode'),
      minWidth: 180,
    },
    {
      field: 'faultName',
      title: $t('repair.equipmentFailure.faultName'),
      minWidth: 150,
    },
    {
      field: 'faultLevelCode',
      title: $t('repair.repairBasicConfig.faultLevel'),
      minWidth: 100,
      formatter: ({ row }) => formatFaultLevel(row.faultLevelCode),
    },
    {
      field: 'faultDescription',
      title: $t('repair.equipmentFailure.faultDescription'),
      minWidth: 250,
    },
    {
      field: 'solution',
      title: $t('repair.equipmentFailure.solution'),
      minWidth: 200,
    },
    {
      field: 'sortOrder',
      title: $t('repair.repairBasicConfig.sortOrder'),
      minWidth: 80,
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
    getFaultTreeList(params)
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

// ========== 树节点选择 ==========
function onTreeSelect(_selectedKeys: any, { selected, node }: any) {
  queryParams.value.parentId = selected ? node.id : undefined;
  selectedParentId.value = selected ? node.id : undefined;
  selectedParentName.value = selected
    ? node.faultName || node.title
    : undefined;
  gridApi.reload();
}

// ========== 查询 ==========
function handleQuery() {
  gridApi.reload();
}

// ========== 重置 ==========
function handleReset() {
  queryParams.value = {
    faultLevelCode: undefined,
    parentId: undefined,
  };
  gridApi.reload();
}

// ========== 操作 ==========
// 新增
function handleAdd() {
  openDrawer();
}

// 编辑
function handleEdit(row: any) {
  openDrawer(row);
}

// 删除
function handleDelete(row: any) {
  Modal.confirm({
    title: $t('repair.equipmentFailure.confirmDelete'),
    content: `确定删除故障 "${row.faultName}" 吗？`,
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      deleteFaultTree(row.id).then(() => {
        message.success($t('common.successfulOperation'));
        gridApi.reload();
        loadTreeData();
      });
    },
  });
}
</script>

<template>
  <Page>
    <div class="flex gap-4">
      <!-- 左侧：设备组树 -->
      <Card class="w-[300px] flex-shrink-0">
        <Tree
          :tree-data="treeData"
          :show-icon="true"
          :field-names="{
            children: 'children',
            title: 'faultName',
          }"
          @select="onTreeSelect"
        />
      </Card>

      <!-- 右侧：条件 + 表格 -->
      <div class="flex-1 min-w-0 flex flex-col gap-4">
        <!-- 条件 Card -->
        <Card>
          <Form layout="inline" :model="queryParams">
            <FormItem :label="$t('repair.repairBasicConfig.faultLevel')">
              <RadioGroup
                v-if="faultLevelOptions.length <= 5"
                v-model:value="queryParams.faultLevelCode"
              >
                <RadioButton
                  v-for="item in faultLevelOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </RadioButton>
              </RadioGroup>
              <Select
                v-else
                v-model:value="queryParams.faultLevelCode"
                :options="faultLevelOptions"
                placeholder="请选择"
                allow-clear
                style="width: 200px"
              />
            </FormItem>
            <FormItem>
              <Space>
                <Button @click="handleReset">{{ $t('common.reset') }}</Button>
                <Button type="primary" @click="handleQuery">
                  <Icon icon="mdi:magnify" class="inline-block align-middle" />
                  {{ $t('common.search') }}
                </Button>
              </Space>
            </FormItem>
          </Form>
        </Card>

        <!-- 表格 Card -->
        <Card class="flex-1 min-h-0">
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
      </div>
    </div>

    <!-- 新增/编辑抽屉 -->
    <EquipmentFailureDrawer
      v-model:open="drawerVisible"
      :row="currentRow"
      :parent-id="selectedParentId"
      :parent-name="selectedParentName"
      :fault-level-options="faultLevelOptions"
      :equipment-group-options="equipmentGroupOptions"
      @success="onDrawerSuccess"
      @reload-tree="loadTreeData"
    />
  </Page>
</template>

<style scoped></style>
