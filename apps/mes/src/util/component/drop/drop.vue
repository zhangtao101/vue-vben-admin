<script lang="ts" setup>
import { nextTick, ref } from 'vue';

import { $t } from '@vben/locales';

import { Panel, useVueFlow, VueFlow } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';
import {
  Button,
  Form,
  FormItem,
  InputNumber,
  message,
  Modal,
  Radio,
  RadioGroup,
  Select,
} from 'ant-design-vue';

import { addParamTemp, getParamById, queryProcessParam } from '#/api';
import BasicTblae from '#/util/component/basicTblae.vue';
import ToolbarNode from '#/util/component/nodes/ToolbarNode.vue';
import OperationSettings from '#/util/component/workstepRecipeManagementMatch/operationSettings.vue';
import { useLayout } from '#/util/useLayout';

import DropzoneBackground from './DropzoneBackground.vue';
import Sidebar from './Sidebar.vue';
import useDragAndDrop from './useDnD';

const props = defineProps(['formula', 'matching', 'isRouter', 'isUpdate']);
const { addEdges, fitView, removeNodes, findNode } = useVueFlow();
const { layout } = useLayout();

const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop();

const nodes = ref([]);
const edges = ref([]);

// region 节点操作

/**
 * 删除节点
 * @param data
 */
function delNode(data: any) {
  removeNodes([data.id]);
  layoutGraph('LR');
}

/**
 * 添加动画效果
 * @param params
 */
function onConnect(params: any) {
  params.animated = true;
  addEdges([params]);
}

/**
 * 格式化布局
 * @param direction
 */
async function layoutGraph(direction: any) {
  nodes.value = layout(nodes.value, edges.value, direction);

  await nextTick(() => {
    fitView();
  });
}

function clear() {
  nodes.value = [];
  edges.value = [];
}

/**
 * 清除孤岛元素, 判断结构是否完整
 * @param endNodeId
 */
function cleanAndCheckGraph(endNodeId = 'end') {
  // 1. 删除孤岛节点
  const connectedNodeIds = new Set();
  edges.value.forEach((edge: any) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  const cleanedNodes = nodes.value.filter((node: any) =>
    connectedNodeIds.has(node.id),
  );

  // 2. 构建邻接表
  const adj = new Map();
  cleanedNodes.forEach((node: any) => adj.set(node.id, []));
  edges.value.forEach((edge: any) => {
    if (adj.has(edge.source)) {
      adj.get(edge.source).push(edge.target);
    }
  });

  const visited = new Map();

  function dfs(nodeId: string, seen = new Set()) {
    if (nodeId === endNodeId) return true;
    if (seen.has(nodeId)) return false;
    if (adj.get(nodeId).length === 0) return false;

    if (visited.has(nodeId)) return visited.get(nodeId);

    seen.add(nodeId);
    const result = adj
      .get(nodeId)
      .every((next: any) => dfs(next, new Set(seen)));
    visited.set(nodeId, result);
    return result;
  }

  // 所有没有入边的节点
  const targetIds = new Set(edges.value.map((e: any) => e.target));
  const sourceNodes = cleanedNodes.filter(
    (node: any) => !targetIds.has(node.id),
  );

  const allPathsValid = sourceNodes.every((node: any) => dfs(node.id));

  return {
    cleanedNodes,
    allPathsLeadToEnd: allPathsValid,
    edges: edges.value,
  };
}

// endregion

// region 运行设置

const operationSettingRef = ref();
// 是否显示流转时长模态框
const showTimeModal = ref(false);
// 当前正在编辑的时间
const editTime = ref(0);
// 当前正在编辑的id
const editId = ref();
/**
 * 打开运行设置抽屉
 * @param row 工步数据
 */
function openOperationSettings(row: any): void {
  if (props.isRouter) {
    const arr: any[] = nodes.value.filter((edge: any) => edge.id === row.elId);
    if (arr.length > 0) {
      showTimeModal.value = true;
      editTime.value = arr[0].data.turnTime;
      editId.value = row.elId;
    } else {
      message.error('没有找到具体的节点');
    }
    return;
  }
  const arr: any = [];
  // 1. 首先找到所有直接后续节点（即该节点作为source的边所指向的target节点）
  const directSuccessorIds = edges.value
    .filter((edge: any) => edge.source === row.elId)
    .map((edge: any) => edge.target);

  // 2. 通过节点ID找到对应的节点对象
  for (const nodeId of directSuccessorIds) {
    const node: any = findNode(nodeId);
    if (node) {
      if (node.data.type === 'end') {
        node.functionTypeName = '结束';
        node.data.functionTypeName = '结束';
      }
      if (!node.functionId) {
        message.warning($t('当前节点的后续节点暂未保存, 请先保存后再继续操作'));
        return;
      }
      arr.push(node);
    }
  }
  operationSettingRef.value.open(props.formula, props.matching, row, arr);
}

/**
 * 流转时长选择完毕
 */
function timeOk() {
  const arr: any[] = nodes.value.filter(
    (edge: any) => edge.id === editId.value,
  );
  if (arr.length > 0) {
    arr[0].data.turnTime = editTime.value;

    editTime.value = 0;
    editId.value = '';
    showTimeModal.value = false;
  }
}

// endregion

// region 工艺参数绑定
const showBindModal = ref(false);
// 绑定的对象
const bindItems = ref<any>([]);
// 绑定的基本信息
const basicItem = ref<any>({});
// form表单对象
const bindFormRef = ref();
// 模板类型
const modalType = [
  {
    label: '配置模板',
    value: 1,
  },
  {
    label: '采集模板',
    value: 2,
  },
  {
    label: '阈值模板',
    value: 3,
  },
];
function radioIsDisabled(item: any, type: any) {
  if (item.bindType === type) return false;
  let bool = false;
  bindItems.value.forEach((i: any) => {
    if (i.bindType === type) {
      bool = true;
    }
  });
  return bool;
}

/**
 * 打开绑定工艺参数弹窗
 */
function openBind(params: any) {
  showBindModal.value = true;
  const arr: any[] = nodes.value.filter((edge: any) => edge.id === params.elId);
  if (arr.length > 0) {
    basicItem.value = arr[0].data;
    getParamById({
      routeDetailId: basicItem.value.routeDetailId,
    }).then(async (res: any[]) => {
      // 将返回的数据转换为 bindItems 格式
      bindItems.value = res.map((item) => ({
        processName: basicItem.value.label,
        routeDetailId: basicItem.value.routeDetailId,
        bindType: item.tempType,
        seletedTempId: item.tempId,
        seletedTemp: {
          id: item.tempId,
          tempName: item.tempName,
          params: item.params,
        },
      }));

      // 为每个项查询对应的模板列表
      for (const item of bindItems.value) {
        try {
          const { results } = await queryProcessParam({
            tempType: item.bindType,
            processName: item.processName,
            pageSize: 99_999,
            pageNum: 1,
          });
          item.modalList = results;
        } catch (error) {
          console.error('查询模板列表失败:', error);
          item.modalList = [];
        }
      }
    });
  }
}

/**
 * 新增一行
 */
function addRow() {
  bindItems.value.push({
    processName: basicItem.value.label,
    routeDetailId: basicItem.value.routeDetailId,
  });
}

/**
 * 删除一行
 * @param index 要删除的行索引
 */
function deleteRow(index: number) {
  bindItems.value.splice(index, 1);
}

/**
 * 确认删除一行
 * @param index 要删除的行索引
 */
function confirmDelete(index: number) {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这条记录吗？',
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    onOk: () => {
      deleteRow(index);
    },
  });
}

/**
 * 关闭工艺参数绑定
 */
function bindClose() {
  basicItem.value = {};
  bindItems.value = [];
  showBindModal.value = false;
}

/**
 * 工艺参数绑定提交
 */
function bindSubmit() {
  bindFormRef.value.validate().then(() => {
    const params = [];

    // 遍历所有绑定的模板项
    for (const item of bindItems.value) {
      // 检查是否选择了模板
      if (!item.seletedTemp || !item.seletedTemp.params) {
        continue;
      }

      // 遍历模板中的所有参数
      for (const p of item.seletedTemp.params) {
        // 检查参数默认值是否已输入
        if (p.paramInitvalue) {
          params.push({
            routeDetailId: item.routeDetailId,
            tempRecordId: item.seletedTemp.id,
            paramName: p.paramName,
            paramType: p.paramType,
            paramInitvalue: p.paramInitvalue,
            paramThreshold: p.paramThreshold,
            description: p.description,
          });
        } else {
          message.error('请输入参数默认值!');
          return;
        }
      }
    }

    addParamTemp(params).then(() => {
      message.success($t('common.successfulOperation'));
      bindClose();
    });
  });
}

/**
 * 查询模板
 * @param item
 */
function queryParam(item: any) {
  queryProcessParam({
    tempType: item.bindType,
    processName: item.processName,
    pageSize: 99_999,
    pageNum: 1,
  }).then(({ results }: any) => {
    item.modalList = results;
    item.seletedTemp = {};
    item.seletedTempId = '';
    gridApi.reload(); // 刷新表格数据
  });
}

function tempChange(item: any) {
  return (_value: any, i: any) => {
    item.seletedTemp = i;
    gridApi.reload(); // 刷新表格数据
  };
}

// region 表格

/**
 * 表格列配置项
 * 定义用水量数据表格的显示列信息
 */
const columns: any = [
  { title: '序号', type: 'seq', width: 50 }, // 自动生成序号列
  { field: 'paramCode', title: '参数编号', minWidth: 150 },
  { field: 'paramName', title: '参数名称', minWidth: 150 },
  { field: 'paramType', title: '参数类型', minWidth: 150 },
  { field: 'description', title: '参数说明', minWidth: 150 },
  {
    field: 'paramInitvalue',
    title: '参数默认值',
    minWidth: 150,
    slots: { default: 'action' },
  },
  { field: 'paramThreshold', title: '阈值范围', minWidth: 150 },
];

/**
 * 表格API对象
 * 用于控制表格的重载、刷新等操作
 */
let gridApi: any;

/**
 * 加载表格数据
 * @param item
 */
function readTableData(item: any) {
  return () => {
    return Promise.resolve<any>({
      items: item.seletedTemp ? item.seletedTemp.params : [],
      total: 0,
    });
  };
}

// endregion

// endregion

// 暴露 open 方法，供父组件调用
defineExpose({
  getData: () => {
    return {
      routes: edges.value,
      details: nodes.value,
    };
  },
  setData: (routes: any, details: any) => {
    nodes.value = details.filter((edge: any) => {
      const item = {
        ...edge,
      };
      item.data.functionId = item.functionId;
      item.data.functionTypeName = item.functionTypeName;
      return item;
    });
    edges.value = routes;
  },
  cleanAndCheckGraph,
});
// endregion
</script>

<template>
  <div class="mt-2 flex h-[80%]" @drop="onDrop">
    <Sidebar :is-router="isRouter" v-if="isUpdate" />

    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @connect="onConnect"
      class="flex-1"
    >
      <DropzoneBackground
        :style="{
          backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',
          transition: 'background-color 0.2s ease',
        }"
      >
        <p v-if="isDragOver">放置</p>
      </DropzoneBackground>

      <Panel class="process-panel" position="top-right" v-if="isUpdate">
        <div class="layout-panel">
          <button title="set horizontal layout" @click="layoutGraph('LR')">
            整理
          </button>
          <button title="set horizontal layout" @click="clear()">清空</button>
        </div>
      </Panel>
      <template #node-menu="p">
        <ToolbarNode
          :id="p.id"
          :data="p.data"
          @del-node="delNode"
          @update="openOperationSettings"
          @bind="openBind"
          :hide-options="!isUpdate"
        />
      </template>
      <MiniMap pannable zoomable />
    </VueFlow>

    <!-- 属性设置 -->
    <OperationSettings ref="operationSettingRef" />
    <!-- 流转时长设置 -->
    <Modal v-model:open="showTimeModal" title="流转时长设置" @ok="timeOk">
      <InputNumber v-model:value="editTime" addon-after="S" />
    </Modal>
    <!-- 工艺参数绑定 -->
    <Modal
      v-model:open="showBindModal"
      :title="`工艺参数绑定___${basicItem.label}`"
      @ok="bindSubmit"
      @cancel="bindClose"
      class="!w-[80vw]"
    >
      <div class="max-h-[60vh] overflow-y-auto">
        <!-- 工艺参数绑定表单：一个Form管理整个bindItems数组 -->
        <Form
          ref="bindFormRef"
          :model="{ bindItems }"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 20 }"
        >
          <div v-for="(item, index) of bindItems" :key="index">
            <!-- 模板类型 -->
            <FormItem
              :label="$t('processManagement.processRoute.type')"
              :rules="[{ required: true, message: '该项为必填项' }]"
              :name="['bindItems', index, 'bindType']"
            >
              <RadioGroup
                v-model:value="item.bindType"
                @change="queryParam(item)"
              >
                <Radio
                  v-for="i of modalType"
                  :key="i.value"
                  :value="i.value"
                  :disabled="radioIsDisabled(item, i.value)"
                >
                  {{ i.label }}
                </Radio>
              </RadioGroup>
            </FormItem>
            <!-- 模板 -->
            <FormItem
              :label="$t('processManagement.processRoute.modal')"
              :rules="[{ required: true, message: '该项为必填项' }]"
              :name="['bindItems', index, 'seletedTempId']"
            >
              <Select
                v-model:value="item.seletedTempId"
                :options="item.modalList"
                :field-names="{ label: 'tempName', value: 'id' }"
                @change="(value, i) => tempChange(item)(value, i)"
              />
            </FormItem>

            <BasicTblae
              :columns="columns"
              :query-data="readTableData(item)"
              :is-pages="false"
              :height="200"
              @initialization-complete="(args) => (gridApi = args)"
            >
              <template #action="{ row }">
                <InputNumber v-model:value="row.paramInitvalue" />
              </template>
            </BasicTblae>
            <div class="mb-4 flex justify-end">
              <Button danger size="small" @click="confirmDelete(Number(index))">
                {{ $t('common.delete') }}
              </Button>
            </div>
          </div>
        </Form>
        <Button
          class="w-full"
          type="primary"
          @click="addRow"
          v-if="bindItems.length < modalType.length"
        >
          {{ $t('common.add') }}
        </Button>
      </div>
    </Modal>
  </div>
</template>
<style lang="scss">
@import '@vue-flow/core/dist/style.css';

/* this contains the default theme, these are optional styles */
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/minimap/dist/style.css';
@import '@vue-flow/controls/dist/style.css';

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.vue-flow__node-toolbar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 8px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgb(0 0 0 / 50%);
}

.vue-flow__node-toolbar button.selected {
  background: #2563eb;
}

.vue-flow__node-toolbar button:hover {
  background: #2563eb;
}

.vue-flow__node-menu {
  padding: 16px 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgb(0 0 0 / 20%);
}

.vue-flow__node-menu.selected {
  box-shadow: 0 0 0 2px #2563eb;
}

.layout-flow {
  width: 100%;
  height: 100%;
  background-color: #1a192b;
}

.process-panel,
.layout-panel {
  display: flex;
  gap: 10px;
}

.process-panel {
  display: flex;
  flex-direction: column;
  padding: 10px;
  border-radius: 8px;
}

.process-panel button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 16px;
  color: white;
  cursor: pointer;
  background-color: #4a5568;
  border: none;
  border-radius: 8px;
  box-shadow: 0 0 10px rgb(0 0 0 / 50%);
}

.checkbox-panel {
  display: flex;
  gap: 10px;
  align-items: center;
}

.process-panel button:hover,
.layout-panel button:hover {
  background-color: #2563eb;
  transition: background-color 0.2s;
}

.process-panel label {
  font-size: 12px;
  color: white;
}

.stop-btn svg {
  display: none;
}

.stop-btn:hover svg {
  display: block;
}

.stop-btn:hover .spinner {
  display: none;
}

.spinner {
  width: 10px;
  height: 10px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

[data-id='start'],
[data-id='end'] {
  color: white;
  background-color: #4a5568;
  border-radius: 8px;
}

/* these are necessary styles for vue flow */
</style>
