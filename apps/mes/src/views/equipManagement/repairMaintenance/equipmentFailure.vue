<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue、vxe-table、repairMaintenance 相关 API
 * [OUTPUT]: 对外提供设备故障树管理页面组件，含树形结构、故障列表、新增/编辑/删除功能
 * [POS]: 维修维护模块 的主页面，属于设备故障管理入口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-20 15:10:00
 */
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
/** 当前路由实例，用于获取权限码 */
const route = useRoute();
/** 按钮权限列表，如 ['新增', '编辑', '删除'] */
const author = ref<string[]>([]);

/**
 * 组件挂载时执行初始化。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:10:00
 */
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
/** 故障树数据，用于左侧树形结构展示 */
const treeData = ref<any[]>([]);

/**
 * 加载故障树数据。
 * @returns {Promise<void>} 无返回值，数据直接赋值给 treeData。
 * @throws {Error} API 调用失败时抛出错误。
 * @since 2026-04-20 15:10:00
 */
function loadTreeData() {
  getFaultTree().then((res) => {
    // 转换数据格式以适配 Tree 组件
    treeData.value = res || [];
  });
}

// ========== 查询参数 ==========
/** 故障列表查询参数，包含故障等级编码和父节点ID */
const queryParams = ref<any>({
  faultLevelCode: undefined,
  equipmentGroup: undefined,
});

// ========== 故障等级选项 ==========
/** 故障等级下拉选项，首项为"全部" */
const faultLevelOptions = ref<any[]>([{ label: '全部', value: undefined }]);

// ========== 故障等级映射 ==========
/** 故障等级编码到名称的映射，用于表格格式化显示 */
const faultLevelMap = ref<Record<string, string>>({});

/**
 * 加载故障等级选项。
 * @returns {Promise<void>} 无返回值，数据直接赋值给 faultLevelOptions 和 faultLevelMap。
 * @throws {Error} API 调用失败时抛出错误。
 * @since 2026-04-20 15:10:00
 */
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

/**
 * 格式化故障等级显示文本。
 * @param {string} levelCode - 故障等级编码。
 * @returns {string} 故障等级名称，若未找到则返回编码或'-'。
 * @since 2026-04-20 15:10:00
 */
function formatFaultLevel(levelCode: string) {
  return faultLevelMap.value[levelCode] || levelCode || '-';
}

// ========== 设备组选项 ==========
/** 设备组下拉选项列表 */
const equipmentGroupOptions = ref<any[]>([]);

/**
 * 加载设备组选项。
 * @returns {Promise<void>} 无返回值，数据直接赋值给 equipmentGroupOptions。
 * @throws {Error} API 调用失败时抛出错误。
 * @since 2026-04-20 15:10:00
 */
function loadEquipmentGroupOptions() {
  searchBaseConfig({ configType: 'EQUIPMENT_GROUP' }).then((res) => {
    equipmentGroupOptions.value = (res || []).map((item: any) => ({
      label: item.configName,
      value: item.configCode,
    }));
  });
}

// ========== 抽屉控制 ==========
/** 新增/编辑抽屉显示状态 */
const drawerVisible = ref(false);
/** 当前操作的行数据，null 表示新增 */
const currentRow = ref<any>(null);
/** 选中父节点ID，用于新增时指定父节点 */
const selectedParentId = ref<string | undefined>(undefined);
/** 选中父节点名称，用于显示父节点路径 */
const selectedParentName = ref<string | undefined>(undefined);

/**
 * 打开新增/编辑抽屉。
 * @param {any} [row] - 可选，要编辑的行数据；不传则表示新增。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:10:00
 */
function openDrawer(row?: any) {
  currentRow.value = row || null;
  drawerVisible.value = true;
}

/**
 * 抽屉操作成功回调，刷新表格数据。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:10:00
 */
function onDrawerSuccess() {
  gridApi.reload();
}

// ========== 表格配置 ==========
/** VXE Grid 表格配置对象 */
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

/** VXE Grid 事件监听配置 */
const gridEvents: VxeGridListeners<any> = {};

/** VXE Grid 组件实例及 API */
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 查询故障列表数据。
 * @param {{ currentPage: number; pageSize: number }} [page] - 可选，分页参数。
 * @returns {Promise<{ total: number; items: any[] }>} 包含总数和数据列表的 Promise。
 * @throws {Error} API 调用失败时拒绝 Promise。
 * @since 2026-04-20 15:10:00
 */
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

/**
 * 处理树节点选择事件，切换父节点筛选条件并刷新表格。
 * @param {any} _selectedKeys - 选中的键数组（未使用）。
 * @param {{ selected: boolean; node: any }} info - 选择信息，包含是否选中和节点数据。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:10:00
 */
function onTreeSelect(_selectedKeys: any, { selected, node }: any) {
  queryParams.value.parentId = selected ? node.id : undefined;
  selectedParentId.value = selected ? node.id : undefined;
  selectedParentName.value = selected
    ? node.faultName || node.title
    : undefined;
  gridApi.reload();
}

/**
 * 处理查询按钮点击，刷新表格数据。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:10:00
 */
function handleQuery() {
  gridApi.reload();
}

/**
 * 处理重置按钮点击，清空查询条件并刷新表格。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:10:00
 */
function handleReset() {
  queryParams.value = {
    faultLevelCode: undefined,
    parentId: undefined,
  };
  gridApi.reload();
}

// ========== 操作 ==========
/**
 * 处理新增按钮点击，打开新增抽屉。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:10:00
 */
function handleAdd() {
  openDrawer();
}

/**
 * 处理编辑按钮点击，打开编辑抽屉。
 * @param {any} row - 要编辑的行数据。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:10:00
 */
function handleEdit(row: any) {
  openDrawer(row);
}

/**
 * 处理删除按钮点击，弹出确认框后执行删除。
 * @param {any} row - 要删除的行数据，需包含 id 和 faultName。
 * @returns {void} 无返回值，删除成功后显示提示并刷新数据。
 * @throws {Error} 删除操作被取消时不抛出错误。
 * @since 2026-04-20 15:10:00
 */
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
