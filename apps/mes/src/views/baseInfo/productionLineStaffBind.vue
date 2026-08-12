<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Col,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addStaffBinds,
  deleteStaffBinds,
  getLinesByGroup,
  getWorkerUserList,
  listProductionAreas,
  listStaffBinds,
  updateStaffBinds,
  updateStaffBindState,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

const route = useRoute();

const author = ref<string[]>([]);

// ========== 生产区 & 产线下拉数据 ==========

interface LineOption {
  label: string;
  value: string;
  id: number;
}

const areaList = ref<any[]>([]);
const lineOptionsMap = reactive<Record<string, LineOption[]>>({});
const lineIdMap = reactive<Record<string, number>>({});

/** 生产区下拉选项 */
const areaOptions = computed<{ label: string; value: string }[]>(() =>
  areaList.value.map((a: any) => ({
    label: `${a.lineGroupName} (${a.lineGroupCode})`,
    value: a.lineGroupCode,
  })),
);

/** 根据 groupCode 获取产线下拉选项 */
function getLineOptions(groupCode: string): { label: string; value: string }[] {
  return (lineOptionsMap[groupCode] || []).map((l) => ({
    label: `${l.label} (${l.value})`,
    value: l.value,
  }));
}

/** 加载所有生产区 */
function loadAreas(): Promise<void> {
  return listProductionAreas({ pageSize: 9999, pageNum: 1}).then((res: any) => {
    areaList.value = (res.list || res || []);
  });
}

/** 根据 groupCode 加载产线下拉选项 */
function loadLineOptions(groupCode: string): Promise<void> {
  const area = areaList.value.find((a: any) => a.lineGroupCode === groupCode);
  if (!area) return Promise.resolve();
  if (lineOptionsMap[groupCode]?.length) return Promise.resolve();

  return getLinesByGroup(area.id).then((res: any) => {
    const lines = (res.results || []).map((l: any) => ({
      label: l.lineName,
      value: l.lineCode,
      id: l.id,
    }));
    lineOptionsMap[groupCode] = lines;
    (lines as LineOption[]).forEach((l) => {
      lineIdMap[l.value] = l.id;
    });
  });
}

// ========== 左侧表格：人员名单 ==========

const leftTableData = ref<any[]>([]);
const allWorkerData = ref<any[]>([]);

const leftGridOptions: VxeGridProps = {
  columns: [
    { type: 'checkbox', width: 50 },
    { type: 'seq', title: $t('baseInfo.serialNumber'), width: 60 },
    { field: 'userCode', title: $t('baseInfo.userCode'), minWidth: 120 },
    { field: 'userName', title: $t('baseInfo.userName'), minWidth: 120 },
  ],
  checkboxConfig: { trigger: 'row' },
  pagerConfig: {
    enabled: false,
  },
  height: 400,
  scrollY: { enabled: true },
};

const [LeftGrid, leftGridApi] = useVbenVxeGrid({
  gridOptions: leftGridOptions,
});

/** 根据右侧表格数据刷新左侧表格（排除已绑定人员） */
function updateLeftTableData(): void {
  leftTableData.value = allWorkerData.value.filter(
    (w) => !allBoundCodes.value.has(w.userCode),
  );
  leftGridApi.setGridOptions({ data: leftTableData.value });
}

/** 加载左侧人员名单 */
function loadWorkerList(): void {
  getWorkerUserList().then((res: any) => {
    allWorkerData.value = res || [];
    updateLeftTableData();
  });
}

// ========== 右侧表格：已绑定作业者 ==========

/** 已绑定用户编码集合（用于过滤左表） */
const allBoundCodes = ref<Set<string>>(new Set());

/** 待提交：新增行的展示数据（带 _isNew 标记），保存时由此提取 API 参数 */
const pendingNewRows = ref<any[]>([]);

/** 待提交：修改的绑定项 key=id */
const pendingUpdateMap = reactive<Map<number, any>>(new Map());

/** 是否有待保存的变更 */
const hasChanges = computed(
  () => pendingNewRows.value.length > 0 || pendingUpdateMap.size > 0,
);

// ========== 右侧表格搜索条件 ==========

const rightSearchForm = reactive({
  userCode: '',
  lineGroupCode: '',
});

function handleSearch(): void {
  rightGridApi.reload();
}

function handleReset(): void {
  rightSearchForm.userCode = '';
  rightSearchForm.lineGroupCode = '';
  rightGridApi.reload();
}

const rightGridOptions: VxeGridProps = {
  columns: [
    { type: 'checkbox', width: 50 },
    { type: 'seq', title: $t('baseInfo.serialNumber'), width: 60 },
    { field: 'userCode', title: $t('baseInfo.userCode'), minWidth: 120 },
    { field: 'userName', title: $t('baseInfo.userName'), minWidth: 120 },
    {
      field: 'lineGroupCode',
      title: $t('baseInfo.lineGroupCode'),
      minWidth: 160,
      slots: { default: 'lineGroupCode_default' },
    },
    {
      field: 'lineCode',
      title: $t('baseInfo.lineCode'),
      minWidth: 140,
      slots: { default: 'lineCode_default' },
    },
    {
      field: 'state',
      title: $t('baseInfo.state'),
      width: 80,
      slots: { default: 'state_default' },
    },
  ],
  checkboxConfig: { trigger: 'row' },
  pagerConfig: {
    enabled: true,
    pageSize: 20,
  },
  height: 400,
  scrollY: { enabled: true },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        const { currentPage = 1, pageSize = 20 } = page;
        const res: any = await listStaffBinds({
          pageNum: currentPage,
          pageSize,
          userCode: rightSearchForm.userCode || undefined,
          lineGroupCode: rightSearchForm.lineGroupCode || undefined,
        });

        let items = (res.list || []).map((item: any) => ({
          ...item,
          _isNew: false,
        }));
        let total = res.total || 0;

        // 在首页展示本地新增的未保存项
        if (currentPage === 1 && pendingNewRows.value.length > 0) {
          items = [...pendingNewRows.value, ...items];
          total += pendingNewRows.value.length;
        }

        return { items, total, page: { total } };
      },
    },
  },
};

const [RightGrid, rightGridApi] = useVbenVxeGrid({
  gridOptions: rightGridOptions,
});

/** 从服务器刷新已绑定用户编码（用于左表过滤） */
function refreshAllBoundCodes(): void {
  listStaffBinds({ pageNum: 1, pageSize: 9999 }).then((res: any) => {
    allBoundCodes.value = new Set(
      (res.list || []).map((item: any) => item.userCode),
    );
    // 补上本地新增的待保存项
    pendingNewRows.value.forEach((r) => allBoundCodes.value.add(r.userCode));
    updateLeftTableData();
  });
}

// ========== 右侧表格：下拉编辑（仅本地更新，不调 API） ==========

/** 生产区下拉变更 */
function handleGroupChange(row: any, newGroupCode: string): void {
  row.lineGroupCode = newGroupCode;
  row.lineCode = '';
  row.lineName = '';

  const area = areaList.value.find(
    (a: any) => a.lineGroupCode === newGroupCode,
  );
  row.lineGroupName = area?.lineGroupName || '';

  // 加载产线选项
  loadLineOptions(newGroupCode);

  // 已有 id 的记录标记为待修改
  if (row.id && !row._isNew) {
    pendingUpdateMap.set(row.id, {
      id: row.id,
      lineId: 0,
      userCode: row.userCode,
      userId: row.userId || 0,
      userName: row.userName,
    });
  }
}

/** 产线下拉变更 */
function handleLineChange(row: any, newLineCode: string): void {
  row.lineCode = newLineCode;

  const options = getLineOptions(row.lineGroupCode);
  const found = options.find((o: any) => o.value === newLineCode);
  row.lineName = found?.label || '';

  // 已有 id 的记录标记为待修改
  if (row.id && !row._isNew) {
    pendingUpdateMap.set(row.id, {
      id: row.id,
      lineId: lineIdMap[newLineCode] || 0,
      userCode: row.userCode,
      userId: row.userId || 0,
      userName: row.userName,
    });
  }
}

// ========== 移动操作：左侧 => 右侧 ==========

function moveToRight(): void {
  const selectedRows = leftGridApi.grid?.getCheckboxRecords() || [];

  if (selectedRows.length === 0) {
    message.warning($t('baseInfo.pleaseSelectWorkers'));
    return;
  }

  // 过滤已存在于右侧表格的人员
  const newWorkers = selectedRows.filter(
    (w: any) => !allBoundCodes.value.has(w.userCode),
  );

  if (newWorkers.length === 0) {
    message.warning($t('baseInfo.workersAlreadyBound'));
    return;
  }

  // 创建新行加入 pendingNewRows（在首页展示），保留原表格所有字段
  const newRows = newWorkers.map((w: any) => ({
    ...w,
    lineGroupCode: '',
    lineGroupName: '',
    lineCode: '',
    lineName: '',
    state: null,
    _isNew: true,
  }));
  pendingNewRows.value.push(...newRows);

  // 更新左表过滤
  newWorkers.forEach((w: any) => allBoundCodes.value.add(w.userCode));
  updateLeftTableData();

  // 重新加载右表切换到首页显示新数据
  rightGridApi.grid.reloadData([
    ...newRows,
    ...rightGridApi.grid.getData()
  ]);

  // message.success($t('baseInfo.bindSuccess'));
}

// ========== 保存操作 ==========

/** 提交所有待保存的变更 */
function handleSave(): void {
  if (!hasChanges.value) {
    message.info($t('baseInfo.noChangesToSave'));
    return;
  }

  const tasks: Promise<any>[] = [];

  // 提交新增项（从 pendingNewRows 提取最新字段）
  if (pendingNewRows.value.length > 0) {
    const addParams = pendingNewRows.value
      .filter((r) => r._isNew)
      .map((r) => ({
        lineId: lineIdMap[r.lineCode] || 0,
        userCode: r.userCode,
        userId: r.userId || r.id || 0,
        userName: r.userName,
      }));
    tasks.push(addStaffBinds(addParams));
  }

  // 提交修改项
  if (pendingUpdateMap.size > 0) {
    const updateItems = [...pendingUpdateMap.values()];
    tasks.push(updateStaffBinds(updateItems));
  }

  Promise.all(tasks).then(() => {
    message.success($t('baseInfo.saveSuccess'));
    pendingNewRows.value = [];
    pendingUpdateMap.clear();
    refreshAllBoundCodes();
    rightGridApi.reload();
  });
}

// ========== 右侧工具栏操作 ==========

/** 获取右侧选中行 */
function getSelectedRightRows(): any[] {
  return rightGridApi.grid?.getCheckboxRecords() || [];
}

/** 启用 */
function handleEnable(): void {
  const rows = getSelectedRightRows();
  if (rows.length === 0) {
    message.warning($t('baseInfo.pleaseSelectRecords'));
    return;
  }
  // 过滤掉新增未保存的项（无 id）
  const ids = rows
    .filter((r: any) => r.id && !r._isNew)
    .map((r: any) => String(r.id));
  if (ids.length === 0) {
    message.warning($t('baseInfo.pleaseSelectRecords'));
    return;
  }
  updateStaffBindState({ ids, state: 1 }).then(() => {
    message.success($t('baseInfo.toggleEnableSuccess'));
    refreshAllBoundCodes();
    rightGridApi.reload();
  });
}

/** 禁用 */
function handleDisable(): void {
  const rows = getSelectedRightRows();
  if (rows.length === 0) {
    message.warning($t('baseInfo.pleaseSelectRecords'));
    return;
  }
  const ids = rows
    .filter((r: any) => r.id && !r._isNew)
    .map((r: any) => String(r.id));
  if (ids.length === 0) {
    message.warning($t('baseInfo.pleaseSelectRecords'));
    return;
  }
  updateStaffBindState({ ids, state: 0 }).then(() => {
    message.success($t('baseInfo.toggleEnableSuccess'));
    refreshAllBoundCodes();
    rightGridApi.reload();
  });
}

/** 解除绑定 */
function handleUnbind(): void {
  const rows = getSelectedRightRows();
  if (rows.length === 0) {
    message.warning($t('baseInfo.pleaseSelectRecords'));
    return;
  }

  const newItems = rows.filter((r: any) => r._isNew);
  const savedItems = rows.filter((r: any) => !r._isNew && r.id);

  if (newItems.length === 0 && savedItems.length === 0) return;

  Modal.confirm({
    title: $t('baseInfo.unbind'),
    content: $t('baseInfo.confirmUnbind'),
    onOk: () => {
      const tasks: Promise<any>[] = [];

      // 移除新增未保存的项
      if (newItems.length > 0) {
        const codes = new Set(newItems.map((r) => r.userCode));
        pendingNewRows.value = pendingNewRows.value.filter(
          (r) => !codes.has(r.userCode),
        );
        codes.forEach((c) => allBoundCodes.value.delete(c));
        updateLeftTableData();
      }

      // 删除已保存的项
      if (savedItems.length > 0) {
        const ids = savedItems.map((r) => r.id);
        savedItems.forEach((r) => pendingUpdateMap.delete(r.id));
        tasks.push(deleteStaffBinds({ ids: ids.join(',') }));
      }

      const reloadGrid = () => {
        refreshAllBoundCodes();
        rightGridApi.reload();
      };

      if (tasks.length > 0) {
        Promise.all(tasks).then(() => {
          message.success($t('baseInfo.unbindSuccess'));
          reloadGrid();
        });
      } else {
        message.success($t('baseInfo.unbindSuccess'));
        reloadGrid();
      }
    },
  });
}

// ========== 生命周期 ==========

onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
    loadAreas().then(() => {
      loadWorkerList();
      refreshAllBoundCodes();
    });
  });
});
</script>

<template>
  <Page>
    <Row class="mb-4">
      <Col :span="18" :offset="6">
        <Card>
          <Form layout="inline" :model="rightSearchForm">
            <FormItem
              :label="$t('baseInfo.userCode')"
              style="margin-bottom: 1em"
            >
              <Input
                v-model:value="rightSearchForm.userCode"
                :placeholder="$t('baseInfo.userCode')"
                allow-clear
                style="width: 160px"
                @press-enter="handleSearch"
              />
            </FormItem>
            <FormItem
              :label="$t('baseInfo.lineGroupCode')"
              style="margin-bottom: 1em"
            >
              <Select
                v-model:value="rightSearchForm.lineGroupCode"
                :options="areaOptions"
                :placeholder="$t('baseInfo.lineGroupCode')"
                allow-clear
                show-search
                style="width: 180px"
              />
            </FormItem>
            <FormItem style="margin-bottom: 1em">
              <Button type="primary" @click="handleSearch">
                {{ $t('common.query') }}
              </Button>
              <Button @click="handleReset" style="margin-left: 1em">
                {{ $t('common.reset') }}
              </Button>
            </FormItem>
          </Form>
        </Card>
      </Col>
    </Row>
    <Row :gutter="8" align="middle">
      <!-- 左侧：人员名单 -->
      <Col :span="5">
        <Card :title="$t('baseInfo.workerList')" size="small">
          <LeftGrid />
        </Card>
      </Col>

      <!-- 中间：绑定按钮 -->
      <Col :span="1" style="display: flex; justify-content: center">
        <Button
          type="primary"
          shape="circle"
          @click="moveToRight"
        >
          <template #icon>
            <Icon icon="mdi:arrow-right-bold" class="text-2xl" />
          </template>
        </Button>
      </Col>

      <!-- 右侧：已绑定作业者列表 -->
      <Col :span="18">
        <Card :title="$t('baseInfo.boundWorkerList')" size="small">
          <RightGrid>
            <template #toolbar-tools>
              <Space :size="8">
                <Button
                  type="primary"
                  @click="handleSave"
                >
                  {{ $t('common.save') }}
                </Button>
                <Button
                  @click="handleEnable"
                >
                  {{ $t('baseInfo.enable') }}
                </Button>
                <Button
                  @click="handleDisable"
                >
                  {{ $t('baseInfo.disable') }}
                </Button>
                <Button
                  danger
                  @click="handleUnbind"
                >
                  {{ $t('baseInfo.unbind') }}
                </Button>
              </Space>
            </template>

            <!-- 生产区下拉编辑 -->
            <template #lineGroupCode_default="{ row }">
              <Select
                :value="row.lineGroupCode"
                :options="areaOptions"
                :placeholder="$t('baseInfo.selectPlaceholder')"
                size="small"
                style="width: 100%"
                show-search
                @change="(val: any) => handleGroupChange(row, val)"
              />
            </template>

            <!-- 产线下拉编辑 -->
            <template #lineCode_default="{ row }">
              <Select
                :value="row.lineCode"
                :options="getLineOptions(row.lineGroupCode)"
                :placeholder="$t('baseInfo.pleaseSelectAreaFirst')"
                size="small"
                style="width: 100%"
                :disabled="!row.lineGroupCode"
                show-search
                @change="(val: any) => handleLineChange(row, val)"
              />
            </template>

            <!-- 状态列 -->
            <template #state_default="{ row }">
              <span
                :style="{ color: row.state === 1 ? '#52c41a' : '#ff4d4f' }"
              >
                {{ row.state === 1 ? $t('baseInfo.enable') : $t('baseInfo.disable') }}
              </span>
            </template>
          </RightGrid>
        </Card>
      </Col>
    </Row>
  </Page>
</template>
