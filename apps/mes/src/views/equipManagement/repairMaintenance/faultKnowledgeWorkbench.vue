<script lang="ts" setup>
/**
 * [INPUT]: 依赖 getFaultTree/getFaultTreeDetail/createFaultTree/updateFaultTree/deleteFaultTree API，
 *          createFaultStandard/updateFaultStandard/getFaultStandardById/deleteFaultStandard API，
 *          createEquipFaultManual/updateEquipFaultManual/getEquipFaultManualById/deleteEquipFaultManual API，
 *          queryAuth 权限，Ant Design Vue Tree/Modal/Drawer/Table/Descriptions 组件
 * [OUTPUT]: 故障知识工作台页面，左右两栏布局，左侧故障树，右侧基本信息+标准内容+维修措施
 * [POS]: 设备管理→维修维护→故障知识工作台，路由路径 views/equipManagement/repairMaintenance/faultKnowledgeWorkbench.vue
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-08-05 09:00:00
 */
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Dropdown,
  Form,
  FormItem,
  Input,
  Menu,
  MenuItem,
  message,
  Modal,
  Popconfirm,
  Radio,
  RadioGroup,
  Row,
  Space,
  Spin,
  Table,
  Textarea,
  Tooltip,
  Tree,
} from 'ant-design-vue';

import {
  createFaultTree,
  deleteFaultTree,
  getFaultTree,
  getFaultTreeDetail,
  updateFaultTree,
} from '#/api/equipManagement/equipmentFailure.service';
import {
  createEquipFaultManual,
  deleteEquipFaultManual,
  getEquipFaultManualById,
  updateEquipFaultManual,
} from '#/api/equipManagement/equipmentRepairAction.service';
import {
  createFaultStandard,
  deleteFaultStandard,
  getFaultStandardById,
  updateFaultStandard,
} from '#/api/equipManagement/faultKnowledgeWorkbench.service';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// ========== 树节点类型 ==========

interface FaultTreeNodeData {
  title: string;
  key: string;
  children?: FaultTreeNodeData[];
  rawData: Record<string, any>;
  nodeLevel: number; // 1=一级节点(parentId===0), 2=二级节点
}

// ========== 权限 ==========

const route = useRoute();
const author = ref<string[]>([]);
const addButton = ref(false);
const editButton = ref(false);
const delButton = ref(false);

watch(
  () => author.value,
  () => {
    addButton.value = author.value.includes('新增');
    editButton.value = author.value.includes('编辑');
    delButton.value = author.value.includes('删除');
  },
);

// ========== 左侧树 ==========

const treeData = ref<FaultTreeNodeData[]>([]);
const treeLoading = ref(false);
const selectedKeys = ref<string[]>([]);
const selectedNode = ref<FaultTreeNodeData | null>(null);

/**
 * 将 API 返回的故障树数据转换为 Ant Design Tree 组件格式。
 * 固定两级结构：一级 parentId===0，二级在其 children 中。
 * @param {any[]} data - API 返回的原始树数据数组。
 * @param {number} level - 当前节点层级，一级为 1。
 * @returns {FaultTreeNodeData[]} 转换后的树节点数组。
 * @since 2026-08-05 09:00:00
 */
function transformTreeData(data: any[], level = 1): FaultTreeNodeData[] {
  if (!data || !Array.isArray(data)) return [];

  return data.map((item: any) => {
    const node: FaultTreeNodeData = {
      title: item.faultName || '',
      key: `fault-${item.id}`,
      rawData: item,
      nodeLevel: level,
    };
    if (level === 1 && item.children && Array.isArray(item.children) && item.children.length > 0) {
      node.children = transformTreeData(item.children, 2);
    }
    return node;
  });
}

/**
 * 加载故障树数据。
 * @since 2026-08-05 09:00:00
 */
function loadTreeData() {
  treeLoading.value = true;
  getFaultTree()
    .then((res: any) => {
      treeData.value = transformTreeData(res || []);
    })
    .catch(() => {
      treeData.value = [];
    })
    .finally(() => {
      treeLoading.value = false;
    });
}

// ========== 树选择事件 ==========

const detailLoading = ref(false);
const detailData = ref<null | Record<string, any>>(null);
const standardList = ref<any[]>([]);
const manualList = ref<any[]>([]);

/**
 * 树节点选中事件，加载右侧详情。
 * @param {any} _keys - 选中的 key 数组。
 * @param {any} info - 选中节点信息。
 * @since 2026-08-05 09:00:00
 */
function onTreeSelect(_keys: any, info: any) {
  if (!_keys || _keys.length === 0) {
    selectedNode.value = null;
    selectedKeys.value = [];
    detailData.value = null;
    standardList.value = [];
    manualList.value = [];
    return;
  }

  selectedKeys.value = _keys;
  selectedNode.value = info.node?.dataRef || null;

  const rawId = selectedNode.value?.rawData?.id;
  if (!rawId) return;

  loadDetail(rawId);
}

/**
 * 加载故障节点详情（包含标准内容、维修措施）。
 * @param {number} id - 故障节点ID。
 * @since 2026-08-05 09:00:00
 */
function loadDetail(id: number) {
  detailLoading.value = true;
  getFaultTreeDetail(id)
    .then((res: any) => {
      detailData.value = res || {};
      standardList.value = res?.standards || [];
      manualList.value = res?.manuals || [];
    })
    .catch(() => {
      detailData.value = null;
      standardList.value = [];
      manualList.value = [];
    })
    .finally(() => {
      detailLoading.value = false;
    });
}

/**
 * 刷新当前选中节点的详情。
 * @since 2026-08-05 09:00:00
 */
function refreshDetail() {
  const id = detailData.value?.id || selectedNode.value?.rawData?.id;
  if (id) {
    loadDetail(id);
  }
}

// ========== 故障节点模态框 ==========

const faultModalVisible = ref(false);
const faultModalTitle = ref('');
const faultModalMode = ref<'addRoot' | 'addSub' | 'edit'>('addRoot');
const faultFormData = ref({
  parentId: 0,
  faultName: '',
  faultCode: '',
  equipmentGroup: '',
  sortOrder: 1,
  faultDescription: '',
  solution: '',
  status: 1,
});

// ========== 表单验证 ==========

const faultFormRef = ref<any>();
const standardFormRef = ref<any>();
const manualFormRef = ref<any>();

const faultFormRules: Record<string, any[]> = {
  faultName: [{ required: true, message: $t('faultKnowledgeWorkbench.faultForm.faultNameRequired') }],
  faultCode: [{ required: true, message: $t('faultKnowledgeWorkbench.faultForm.faultCodeRequired') }],
};

const standardFormRules: Record<string, any[]> = {
  standardCode: [{ required: true, message: $t('faultKnowledgeWorkbench.standardContent.standardCodeRequired') }],
  standardName: [{ required: true, message: $t('faultKnowledgeWorkbench.standardContent.standardNameRequired') }],
  standardContent: [{ required: true, message: $t('faultKnowledgeWorkbench.standardContent.standardContentRequired') }],
};

const manualFormRules: Record<string, any[]> = {
  manualCode: [{ required: true, message: $t('faultKnowledgeWorkbench.repairMeasure.manualCodeRequired') }],
  manualName: [{ required: true, message: $t('faultKnowledgeWorkbench.repairMeasure.manualNameRequired') }],
  manualContent: [{ required: true, message: $t('faultKnowledgeWorkbench.repairMeasure.manualContentRequired') }],
};

/**
 * 打开新增根节点模态框。
 * @since 2026-08-05 09:00:00
 */
function openAddRoot() {
  faultModalMode.value = 'addRoot';
  faultModalTitle.value = $t('faultKnowledgeWorkbench.tree.addRootModalTitle');
  faultFormData.value = {
    parentId: 0,
    faultName: '',
    faultCode: '',
    equipmentGroup: '',
    sortOrder: 1,
    faultDescription: '',
    solution: '',
    status: 1,
  };
  faultModalVisible.value = true;
}

/**
 * 打开新增子级故障模态框。
 * @since 2026-08-05 09:00:00
 */
function openAddSub() {
  if (!selectedNode.value) {
    message.warning($t('faultKnowledgeWorkbench.common.selectNodeTip'));
    return;
  }
  faultModalMode.value = 'addSub';
  faultModalTitle.value = $t('faultKnowledgeWorkbench.tree.addChildModalTitle');
  faultFormData.value = {
    parentId: selectedNode.value.rawData.id,
    faultName: '',
    faultCode: '',
    equipmentGroup: '',
    sortOrder: 1,
    faultDescription: '',
    solution: '',
    status: 1,
  };
  faultModalVisible.value = true;
}

/**
 * 打开编辑故障节点模态框。
 * @since 2026-08-05 09:00:00
 */
function openEditFault() {
  const raw = selectedNode.value?.rawData || detailData.value;
  if (!raw?.id) {
    message.warning($t('faultKnowledgeWorkbench.common.selectNodeTip'));
    return;
  }
  faultModalMode.value = 'edit';
  faultModalTitle.value = $t('faultKnowledgeWorkbench.tree.editModalTitle');
  faultFormData.value = {
    parentId: raw.parentId || 0,
    faultName: raw.faultName || '',
    faultCode: raw.faultCode || '',
    equipmentGroup: raw.equipmentGroup || '',
    sortOrder: raw.sortOrder || 1,
    faultDescription: raw.faultDescription || '',
    solution: raw.solution || '',
    status: raw.status ?? 1,
  };
  faultModalVisible.value = true;
}

/**
 * 确认故障节点新增/编辑。
 * @since 2026-08-05 09:00:00
 */
function confirmFaultModal() {
  faultFormRef.value
    .validate()
    .then(() => {
      const params = { ...faultFormData.value };
      if (faultModalMode.value === 'addRoot') {
        params.parentId = 0;
      }

      const apiCall =
        faultModalMode.value === 'edit'
          ? updateFaultTree({ id: selectedNode.value?.rawData?.id || detailData.value?.id, ...params })
          : createFaultTree(params);

      const successMsg = faultModalMode.value === 'edit'
        ? $t('faultKnowledgeWorkbench.common.editSuccess')
        : $t('faultKnowledgeWorkbench.common.addSuccess');

      return apiCall.then(() => {
        message.success(successMsg);
        faultModalVisible.value = false;
        loadTreeData();
        if (faultModalMode.value === 'edit') {
          refreshDetail();
        }
      });
    })
    .catch(() => {});
}

/**
 * 删除故障节点确认。
 * @since 2026-08-05 09:00:00
 */
function handleDeleteFault() {
  const raw = selectedNode.value?.rawData || detailData.value;
  if (!raw?.id) {
    message.warning($t('faultKnowledgeWorkbench.common.selectNodeTip'));
    return;
  }
  Modal.confirm({
    title: $t('faultKnowledgeWorkbench.common.tip'),
    content: `${$t('faultKnowledgeWorkbench.tree.deleteConfirm')}「${raw.faultName}」`,
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    okType: 'danger',
    onOk: () => {
      return deleteFaultTree(raw.id)
        .then(() => {
          message.success($t('faultKnowledgeWorkbench.common.deleteSuccess'));
          selectedNode.value = null;
          selectedKeys.value = [];
          detailData.value = null;
          standardList.value = [];
          manualList.value = [];
          loadTreeData();
        })
        .catch(() => {
          throw undefined;
        });
    },
  });
}

// ========== 右键菜单 ==========

/**
 * 树节点右键菜单点击事件。
 * 先选中右键的节点，再执行对应操作。
 * @param {string} treeKey - 树节点的 key。
 * @param {string} menuKey - 菜单项 key。
 * @since 2026-08-05 09:00:00
 */
function onContextMenuClick(treeKey: string, menuKey: string) {
  selectedKeys.value = [treeKey];
  findNode(treeData.value, treeKey);

  switch (menuKey) {
    case 'addSub': {
      openAddSub();
      break;
    }
    case 'delete': {
      handleDeleteFault();
      break;
    }
    case 'edit': {
      openEditFault();
      break;
    }
    // No default
  }
}

/**
 * 递归查找树节点，设置 selectedNode。
 * @param {FaultTreeNodeData[]} nodes - 当前层级的节点列表。
 * @param {string} key - 目标节点 key。
 * @since 2026-08-05 09:00:00
 */
function findNode(nodes: FaultTreeNodeData[], key: string): void {
  for (const node of nodes) {
    if (node.key === key) {
      selectedNode.value = node;
      // 加载详情
      if (node.rawData?.id) {
        loadDetail(node.rawData.id);
      }
      return;
    }
    if (node.children) {
      findNode(node.children, key);
    }
  }
}

// ========== 标准内容操作 ==========

const standardModalVisible = ref(false);
const standardModalTitle = ref('');
const standardModalMode = ref<'add' | 'edit' | 'view'>('add');
const standardFormData = ref({
  id: 0,
  faultTreeId: 0,
  standardCode: '',
  standardName: '',
  standardContent: '',
  status: 1,
});

/**
 * 打开新增标准内容模态框。
 * @since 2026-08-05 09:00:00
 */
function openAddStandard() {
  const faultId = detailData.value?.id || selectedNode.value?.rawData?.id;
  if (!faultId) {
    message.warning($t('faultKnowledgeWorkbench.common.selectNodeTip'));
    return;
  }
  standardModalMode.value = 'add';
  standardModalTitle.value = $t('faultKnowledgeWorkbench.standardContent.addModalTitle');
  standardFormData.value = {
    id: 0,
    faultTreeId: faultId,
    standardCode: '',
    standardName: '',
    standardContent: '',
    status: 1,
  };
  standardModalVisible.value = true;
}

/**
 * 打开编辑标准内容模态框。
 * @param {any} record - 标准内容记录。
 * @since 2026-08-05 09:00:00
 */
function openEditStandard(record: any) {
  standardModalMode.value = 'edit';
  standardModalTitle.value = $t('faultKnowledgeWorkbench.standardContent.editModalTitle');
  standardFormData.value = {
    id: record.id,
    faultTreeId: record.faultTreeId || detailData.value?.id || 0,
    standardCode: record.standardCode || '',
    standardName: record.standardName || '',
    standardContent: record.standardContent || '',
    status: record.status ?? 1,
  };
  standardModalVisible.value = true;
}

/**
 * 查看标准内容详情。
 * @param {any} record - 标准内容记录。
 * @since 2026-08-05 09:00:00
 */
function openViewStandard(record: any) {
  standardModalMode.value = 'view';
  standardModalTitle.value = $t('faultKnowledgeWorkbench.standardContent.viewModalTitle');
  getFaultStandardById(record.id)
    .then((res: any) => {
      standardFormData.value = {
        id: res.id,
        faultTreeId: res.faultTreeId || 0,
        standardCode: res.standardCode || '',
        standardName: res.standardName || '',
        standardContent: res.standardContent || '',
        status: res.status ?? 1,
      };
      standardModalVisible.value = true;
    })
    .catch(() => {});
}

/**
 * 确认标准内容新增/编辑。
 * @since 2026-08-05 09:00:00
 */
function confirmStandardModal() {
  standardFormRef.value
    .validate()
    .then(() => {
      const apiCall =
        standardModalMode.value === 'edit'
          ? updateFaultStandard({ ...standardFormData.value })
          : createFaultStandard({ ...standardFormData.value });

      const successMsg = standardModalMode.value === 'edit'
        ? $t('faultKnowledgeWorkbench.common.editSuccess')
        : $t('faultKnowledgeWorkbench.common.addSuccess');

      return apiCall.then(() => {
        message.success(successMsg);
        standardModalVisible.value = false;
        refreshDetail();
      });
    })
    .catch(() => {});
}

/**
 * 删除标准内容确认。
 * @param {any} record - 标准内容记录。
 * @since 2026-08-05 09:00:00
 */
function handleDeleteStandard(record: any) {
  Modal.confirm({
    title: $t('faultKnowledgeWorkbench.common.tip'),
    content: `${$t('faultKnowledgeWorkbench.standardContent.deleteConfirm')}「${record.standardName}」`,
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    okType: 'danger',
    onOk: () => {
      return deleteFaultStandard(record.id)
        .then(() => {
          message.success($t('faultKnowledgeWorkbench.common.deleteSuccess'));
          refreshDetail();
        })
        .catch(() => {
          throw undefined;
        });
    },
  });
}

// ========== 标准内容表格列 ==========

const standardColumns = computed(() => [
  { title: $t('faultKnowledgeWorkbench.standardContent.standardCode'), dataIndex: 'standardCode', key: 'standardCode', width: 120 },
  { title: $t('faultKnowledgeWorkbench.standardContent.standardName'), dataIndex: 'standardName', key: 'standardName', ellipsis: true },
  { title: $t('faultKnowledgeWorkbench.standardContent.standardContent'), dataIndex: 'standardContent', key: 'standardContent', ellipsis: true },
  {
    title: $t('faultKnowledgeWorkbench.basicInfo.status'),
    dataIndex: 'status',
    key: 'status',
    width: 80,
    align: 'center' as const,
  },
  {
    title: $t('faultKnowledgeWorkbench.common.action'),
    key: 'action',
    width: 220,
    align: 'center' as const,
  },
]);

/**
 * 获取标准内容状态文本。
 * @param {number} status - 状态值。
 * @returns {string} 状态文本。
 * @since 2026-08-05 09:00:00
 */
function getStatusText(status: number): string {
  return status === 1
    ? $t('faultKnowledgeWorkbench.basicInfo.enabled')
    : $t('faultKnowledgeWorkbench.basicInfo.disabled');
}

// ========== 维修措施操作 ==========

const manualModalVisible = ref(false);
const manualModalTitle = ref('');
const manualModalMode = ref<'add' | 'edit' | 'view'>('add');
const manualFormData = ref({
  id: 0,
  faultTreeId: 0,
  manualCode: '',
  manualName: '',
  manualContent: '',
  status: 1,
});

/**
 * 打开新增维修措施模态框。
 * @since 2026-08-05 09:00:00
 */
function openAddManual() {
  const faultId = detailData.value?.id || selectedNode.value?.rawData?.id;
  if (!faultId) {
    message.warning($t('faultKnowledgeWorkbench.common.selectNodeTip'));
    return;
  }
  manualModalMode.value = 'add';
  manualModalTitle.value = $t('faultKnowledgeWorkbench.repairMeasure.addModalTitle');
  manualFormData.value = {
    id: 0,
    faultTreeId: faultId,
    manualCode: '',
    manualName: '',
    manualContent: '',
    status: 1,
  };
  manualModalVisible.value = true;
}

/**
 * 打开编辑维修措施模态框。
 * @param {any} record - 维修措施记录。
 * @since 2026-08-05 09:00:00
 */
function openEditManual(record: any) {
  manualModalMode.value = 'edit';
  manualModalTitle.value = $t('faultKnowledgeWorkbench.repairMeasure.editModalTitle');
  manualFormData.value = {
    id: record.id,
    faultTreeId: record.faultTreeId || detailData.value?.id || 0,
    manualCode: record.manualCode || '',
    manualName: record.manualName || '',
    manualContent: record.manualContent || '',
    status: record.status ?? 1,
  };
  manualModalVisible.value = true;
}

/**
 * 查看维修措施详情。
 * @param {any} record - 维修措施记录。
 * @since 2026-08-05 09:00:00
 */
function openViewManual(record: any) {
  manualModalMode.value = 'view';
  manualModalTitle.value = $t('faultKnowledgeWorkbench.repairMeasure.viewModalTitle');
  getEquipFaultManualById(record.id)
    .then((res: any) => {
      manualFormData.value = {
        id: res.id,
        faultTreeId: res.faultTreeId || 0,
        manualCode: res.manualCode || '',
        manualName: res.manualName || '',
        manualContent: res.manualContent || '',
        status: res.status ?? 1,
      };
      manualModalVisible.value = true;
    })
    .catch(() => {});
}

/**
 * 确认维修措施新增/编辑。
 * @since 2026-08-05 09:00:00
 */
function confirmManualModal() {
  manualFormRef.value
    .validate()
    .then(() => {
      const apiCall =
        manualModalMode.value === 'edit'
          ? updateEquipFaultManual({ ...manualFormData.value } as any)
          : createEquipFaultManual({ ...manualFormData.value } as any);

      const successMsg = manualModalMode.value === 'edit'
        ? $t('faultKnowledgeWorkbench.common.editSuccess')
        : $t('faultKnowledgeWorkbench.common.addSuccess');

      return apiCall.then(() => {
        message.success(successMsg);
        manualModalVisible.value = false;
        refreshDetail();
      });
    })
    .catch(() => {});
}

/**
 * 删除维修措施确认。
 * @param {any} record - 维修措施记录。
 * @since 2026-08-05 09:00:00
 */
function handleDeleteManual(record: any) {
  Modal.confirm({
    title: $t('common.prompt'),
    content: `${$t('faultKnowledgeWorkbench.repairMeasure.deleteConfirm')}「${record.manualName}」`,
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    okType: 'danger',
    onOk: () => {
      return deleteEquipFaultManual(record.id)
        .then(() => {
          message.success($t('faultKnowledgeWorkbench.common.deleteSuccess'));
          refreshDetail();
        })
        .catch(() => {
          throw undefined;
        });
    },
  });
}

// ========== 维修措施表格列 ==========

const manualColumns = computed(() => [
  { title: $t('faultKnowledgeWorkbench.repairMeasure.manualCode'), dataIndex: 'manualCode', key: 'manualCode', width: 120 },
  { title: $t('faultKnowledgeWorkbench.repairMeasure.manualName'), dataIndex: 'manualName', key: 'manualName', ellipsis: true },
  { title: $t('faultKnowledgeWorkbench.repairMeasure.manualContent'), dataIndex: 'manualContent', key: 'manualContent', ellipsis: true },
  {
    title: $t('faultKnowledgeWorkbench.basicInfo.status'),
    dataIndex: 'status',
    key: 'status',
    width: 80,
    align: 'center' as const,
  },
  {
    title: $t('faultKnowledgeWorkbench.common.action'),
    key: 'action',
    width: 220,
    align: 'center' as const,
  },
]);

// ========== 基本信息查看模式标记 ==========

const basicInfoViewMode = ref(true);

/**
 * 关闭基本信息编辑模式（点取消时恢复）。
 * @since 2026-08-05 09:00:00
 */
function cancelBasicEdit() {
  basicInfoViewMode.value = true;
  // 恢复原始数据
  faultFormData.value = {
    parentId: detailData.value?.parentId || 0,
    faultName: detailData.value?.faultName || '',
    faultCode: detailData.value?.faultCode || '',
    equipmentGroup: detailData.value?.equipmentGroup || '',
    sortOrder: detailData.value?.sortOrder || 1,
    faultDescription: detailData.value?.faultDescription || '',
    solution: detailData.value?.solution || '',
    status: detailData.value?.status ?? 1,
  };
}

/**
 * 保存基本信息编辑。
 * @since 2026-08-05 09:00:00
 */
function saveBasicEdit() {
  if (!faultFormData.value.faultName) {
    message.error($t('faultKnowledgeWorkbench.faultForm.faultNameRequired'));
    return;
  }
  if (!faultFormData.value.faultCode) {
    message.error($t('faultKnowledgeWorkbench.faultForm.faultCodeRequired'));
    return;
  }

  const raw = detailData.value;
  if (!raw?.id) return;

  updateFaultTree({
    id: raw.id,
    ...faultFormData.value,
  })
    .then(() => {
      message.success($t('faultKnowledgeWorkbench.common.editSuccess'));
      basicInfoViewMode.value = true;
      refreshDetail();
      loadTreeData();
    })
    .catch(() => {});
}

/**
 * 进入基本信息编辑模式，填充表单。
 * @since 2026-08-05 09:00:00
 */
function enterBasicEdit() {
  const raw = detailData.value;
  if (!raw?.id) return;
  faultFormData.value = {
    parentId: raw.parentId || 0,
    faultName: raw.faultName || '',
    faultCode: raw.faultCode || '',
    equipmentGroup: raw.equipmentGroup || '',
    sortOrder: raw.sortOrder || 1,
    faultDescription: raw.faultDescription || '',
    solution: raw.solution || '',
    status: raw.status ?? 1,
  };
  basicInfoViewMode.value = false;
}

// ========== 初始化 ==========

onMounted(() => {
  queryAuth(route.meta.code as string).then((data: string[]) => {
    author.value = data;
  });
  loadTreeData();
});
</script>

<template>
  <Page auto-content-height @contextmenu.prevent>
    <Row :gutter="16" class="h-full">
      <!-- 左侧：故障树 -->
      <Col :span="6" style="display: flex; flex-direction: column; height: 100%">
        <Card
          :title="$t('faultKnowledgeWorkbench.tree.faultTreeTitle')"
          size="small"
          style="display: flex; flex: 1; flex-direction: column; overflow: hidden"
        >
          <!-- 新增根节点按钮 -->
          <div class="mb-2 flex flex-wrap gap-1">
            <Button
              v-if="addButton"
              size="small"
              type="primary"
              @click="openAddRoot"
            >
              <Icon icon="mdi:plus" class="inline-block align-middle" />
              {{ $t('faultKnowledgeWorkbench.tree.addRoot') }}
            </Button>
          </div>

          <!-- 树结构 -->
          <div class="flex-1 overflow-auto" style="min-height: 0">
            <Spin :spinning="treeLoading">
              <Tree
                v-if="treeData.length > 0"
                :tree-data="treeData"
                :selected-keys="selectedKeys"
                :default-expand-all="false"
                block-node
                @select="onTreeSelect"
              >
                <template #title="{ key: treeKey, title, nodeLevel }">
                  <div class="flex items-center">
                    <div class="w-[20px] flex items-center mr-1">
                      <Icon
                        icon="mdi:alert-circle-outline"
                        class="inline-block align-middle"
                        :style="{ color: nodeLevel === 1 ? '#e74c3c' : '#f39c12', fontSize: '16px' }"
                      />
                    </div>
                    <div class="flex-1 flex items-center">
                      <Dropdown
                        :trigger="['contextmenu']"
                        :destroy-popup-on-hide="true"
                      >
                        <span
                          class="w-full inline-block"
                          style="cursor: pointer"
                        >
                          {{ title }}
                        </span>
                        <template #overlay>
                          <Menu @click="({ key: menuKey }: any) => onContextMenuClick(treeKey as string, menuKey as string)">
                            <!-- 一级节点菜单 -->
                            <template v-if="nodeLevel === 1">
                              <MenuItem v-if="addButton" key="addSub">
                                {{ $t('faultKnowledgeWorkbench.tree.addChild') }}
                              </MenuItem>
                              <MenuItem v-if="editButton" key="edit">
                                {{ $t('faultKnowledgeWorkbench.tree.edit') }}
                              </MenuItem>
                              <MenuItem v-if="delButton" key="delete" danger>
                                {{ $t('faultKnowledgeWorkbench.tree.delete') }}
                              </MenuItem>
                            </template>
                            <!-- 二级节点菜单 -->
                            <template v-if="nodeLevel === 2">
                              <MenuItem v-if="editButton" key="edit">
                                {{ $t('faultKnowledgeWorkbench.tree.edit') }}
                              </MenuItem>
                              <MenuItem v-if="delButton" key="delete" danger>
                                {{ $t('faultKnowledgeWorkbench.tree.delete') }}
                              </MenuItem>
                            </template>
                          </Menu>
                        </template>
                      </Dropdown>
                    </div>
                  </div>
                </template>
              </Tree>
              <div
                v-else-if="!treeLoading"
                class="flex items-center justify-center py-8"
                style="color: var(--ant-color-text-secondary)"
              >
                {{ $t('faultKnowledgeWorkbench.tree.noData') }}
              </div>
            </Spin>
          </div>
        </Card>
      </Col>

      <!-- 右侧：详情 -->
      <Col :span="18" style="display: flex; flex-direction: column; gap: 12px; height: 100%">
        <Spin :spinning="detailLoading">
          <!-- 无选择时提示 -->
          <div
            v-if="!detailData"
            style="display: flex; flex-direction: column; height: 100%"
          >
            <Card
              size="small"
              style="display: flex; flex-direction: column; overflow: hidden; flex: 1"
            >
              <div
                class="flex flex-col items-center justify-center"
                style="height: 100%; color: var(--ant-color-text-secondary)"
              >
                <Icon
                  icon="mdi:file-search-outline"
                  style="font-size: 64px; color: var(--ant-color-text-disabled)"
                  class="mb-3"
                />
                <div>{{ $t('faultKnowledgeWorkbench.common.selectNodeTip') }}</div>
              </div>
            </Card>
          </div>

          <!-- 有详情时展示 -->
          <template v-else>
            <!-- 3.1 基本信息 -->
            <Card size="small" :title="$t('faultKnowledgeWorkbench.basicInfo.title')">
              <template #extra>
                <template v-if="basicInfoViewMode">
                  <Button
                    v-if="editButton"
                    size="small"
                    type="link"
                    @click="enterBasicEdit"
                  >
                    {{ $t('faultKnowledgeWorkbench.basicInfo.edit') }}
                  </Button>
                </template>
                <template v-else>
                  <Space>
                    <Button size="small" @click="cancelBasicEdit">{{ $t('faultKnowledgeWorkbench.basicInfo.cancel') }}</Button>
                    <Button size="small" type="primary" @click="saveBasicEdit">{{ $t('faultKnowledgeWorkbench.basicInfo.save') }}</Button>
                  </Space>
                </template>
              </template>

              <!-- 查看模式 -->
              <Descriptions v-if="basicInfoViewMode" :column="2" bordered size="small">
                <DescriptionsItem :label="$t('faultKnowledgeWorkbench.basicInfo.faultName')">{{ detailData.faultName || '-' }}</DescriptionsItem>
                <DescriptionsItem :label="$t('faultKnowledgeWorkbench.basicInfo.faultCode')">{{ detailData.faultCode || '-' }}</DescriptionsItem>
                <DescriptionsItem :label="$t('faultKnowledgeWorkbench.basicInfo.status')" :span="2">{{ getStatusText(detailData.status) }}</DescriptionsItem>
                <!-- <DescriptionsItem :label="$t('faultKnowledgeWorkbench.basicInfo.parentName')">{{ detailData.parentId === 0 ? '-' : `ID: ${detailData.parentId}` }}</DescriptionsItem> -->
                <DescriptionsItem :label="$t('faultKnowledgeWorkbench.basicInfo.faultDescription')" :span="2">{{ detailData.faultDescription || '-' }}</DescriptionsItem>
                <DescriptionsItem :label="$t('faultKnowledgeWorkbench.basicInfo.solution')" :span="2">{{ detailData.solution || '-' }}</DescriptionsItem>
              </Descriptions>

              <!-- 编辑模式 -->
              <Form v-else layout="vertical">
                <Row :gutter="16">
                  <Col :span="12">
                    <FormItem :label="$t('faultKnowledgeWorkbench.basicInfo.faultName')" required>
                      <Input v-model:value="faultFormData.faultName" :placeholder="$t('faultKnowledgeWorkbench.faultForm.faultNamePlaceholder')" />
                    </FormItem>
                  </Col>
                  <Col :span="12">
                    <FormItem :label="$t('faultKnowledgeWorkbench.basicInfo.faultCode')" required>
                      <Input v-model:value="faultFormData.faultCode" :placeholder="$t('faultKnowledgeWorkbench.faultForm.faultCodePlaceholder')" />
                    </FormItem>
                  </Col>
                  <Col :span="12">
                    <FormItem :label="$t('faultKnowledgeWorkbench.basicInfo.status')">
                      <RadioGroup v-model:value="faultFormData.status">
                        <Radio :value="1">{{ $t('faultKnowledgeWorkbench.basicInfo.enabled') }}</Radio>
                        <Radio :value="2">{{ $t('faultKnowledgeWorkbench.basicInfo.disabled') }}</Radio>
                      </RadioGroup>
                    </FormItem>
                  </Col>
                  <Col :span="24">
                    <FormItem :label="$t('faultKnowledgeWorkbench.basicInfo.faultDescription')">
                      <Textarea v-model:value="faultFormData.faultDescription" :rows="3" :placeholder="$t('faultKnowledgeWorkbench.faultForm.faultDescriptionPlaceholder')" />
                    </FormItem>
                  </Col>
                  <Col :span="24">
                    <FormItem :label="$t('faultKnowledgeWorkbench.basicInfo.solution')">
                      <Textarea v-model:value="faultFormData.solution" :rows="3" :placeholder="$t('faultKnowledgeWorkbench.faultForm.solutionPlaceholder')" />
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </Card>

            <!-- 3.2 标准内容 -->
            <Card size="small" class="my-4!" :title="$t('faultKnowledgeWorkbench.standardContent.title')">
              <template #extra>
                <Button
                  v-if="addButton"
                  size="small"
                  type="primary"
                  @click="openAddStandard"
                >
                  {{ $t('faultKnowledgeWorkbench.standardContent.add') }}
                </Button>
              </template>
              <Table
                :columns="standardColumns"
                :data-source="standardList"
                :pagination="false"
                row-key="id"
                size="small"
                bordered
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    {{ getStatusText(record.status) }}
                  </template>
                  <template v-if="column.key === 'action'">
                    <Space size="small">
                      <Tooltip>
                        <template #title>{{ $t('faultKnowledgeWorkbench.standardContent.view') }}</template>
                        <Button type="link" @click="openViewStandard(record)" class="px-1">
                          <Icon icon="mdi:eye-outline" class="inline-block align-middle text-xl" />
                        </Button>
                      </Tooltip>
                      <Tooltip v-if="editButton">
                        <template #title>{{ $t('faultKnowledgeWorkbench.standardContent.edit') }}</template>
                        <Button type="link" @click="openEditStandard(record)" class="px-1">
                          <Icon icon="mdi:pencil-outline" class="inline-block align-middle text-xl" />
                        </Button>
                      </Tooltip>
                      <Popconfirm
                        v-if="delButton"
                        :title="$t('faultKnowledgeWorkbench.standardContent.deleteConfirm')"
                        :ok-text="$t('common.confirm')"
                        :cancel-text="$t('common.cancel')"
                        @confirm="handleDeleteStandard(record)"
                      >
                        <Tooltip>
                          <template #title>{{ $t('faultKnowledgeWorkbench.standardContent.delete') }}</template>
                          <Button type="link" class="px-1" style="color: #ff4d4f">
                            <Icon icon="mdi:delete-outline" class="inline-block align-middle text-xl" />
                          </Button>
                        </Tooltip>
                      </Popconfirm>
                    </Space>
                  </template>
                </template>
              </Table>
            </Card>

            <!-- 3.3 维修措施 -->
            <Card size="small" :title="$t('faultKnowledgeWorkbench.repairMeasure.title')">
              <template #extra>
                <Button
                  v-if="addButton"
                  size="small"
                  type="primary"
                  @click="openAddManual"
                >
                  {{ $t('faultKnowledgeWorkbench.repairMeasure.add') }}
                </Button>
              </template>
              <Table
                :columns="manualColumns"
                :data-source="manualList"
                :pagination="false"
                row-key="id"
                size="small"
                bordered
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    {{ getStatusText(record.status) }}
                  </template>
                  <template v-if="column.key === 'action'">
                    <Space size="small">
                      <Tooltip>
                        <template #title>{{ $t('faultKnowledgeWorkbench.repairMeasure.view') }}</template>
                        <Button type="link" @click="openViewManual(record)" class="px-1">
                          <Icon icon="mdi:eye-outline" class="inline-block align-middle text-xl" />
                        </Button>
                      </Tooltip>
                      <Tooltip v-if="editButton">
                        <template #title>{{ $t('faultKnowledgeWorkbench.repairMeasure.edit') }}</template>
                        <Button type="link" @click="openEditManual(record)" class="px-1">
                          <Icon icon="mdi:pencil-outline" class="inline-block align-middle text-xl" />
                        </Button>
                      </Tooltip>
                      <Popconfirm
                        v-if="delButton"
                        :title="$t('faultKnowledgeWorkbench.repairMeasure.deleteConfirm')"
                        :ok-text="$t('common.confirm')"
                        :cancel-text="$t('common.cancel')"
                        @confirm="handleDeleteManual(record)"
                      >
                        <Tooltip>
                          <template #title>{{ $t('faultKnowledgeWorkbench.repairMeasure.delete') }}</template>
                          <Button type="link" class="px-1" style="color: #ff4d4f">
                            <Icon icon="mdi:delete-outline" class="inline-block align-middle text-xl" />
                          </Button>
                        </Tooltip>
                      </Popconfirm>
                    </Space>
                  </template>
                </template>
              </Table>
            </Card>
          </template>
        </Spin>
      </Col>
    </Row>

    <!-- 故障节点抽屉（新增/编辑） -->
    <Drawer
      v-model:open="faultModalVisible"
      :title="faultModalTitle"
      :destroy-on-close="true"
      placement="right"
      :width="560"
    >
      <Form ref="faultFormRef" :model="faultFormData" :rules="faultFormRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <FormItem :label="$t('faultKnowledgeWorkbench.faultForm.faultName')" name="faultName">
          <Input v-model:value="faultFormData.faultName" :placeholder="$t('faultKnowledgeWorkbench.faultForm.faultNamePlaceholder')" />
        </FormItem>
        <FormItem :label="$t('faultKnowledgeWorkbench.faultForm.faultCode')" name="faultCode">
          <Input v-model:value="faultFormData.faultCode" :placeholder="$t('faultKnowledgeWorkbench.faultForm.faultCodePlaceholder')" />
        </FormItem>
        <FormItem :label="$t('faultKnowledgeWorkbench.faultForm.status')" name="status">
          <RadioGroup v-model:value="faultFormData.status">
            <Radio :value="1">{{ $t('faultKnowledgeWorkbench.basicInfo.enabled') }}</Radio>
            <Radio :value="2">{{ $t('faultKnowledgeWorkbench.basicInfo.disabled') }}</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem :label="$t('faultKnowledgeWorkbench.faultForm.faultDescription')" name="faultDescription">
          <Textarea v-model:value="faultFormData.faultDescription" :rows="3" :placeholder="$t('faultKnowledgeWorkbench.faultForm.faultDescriptionPlaceholder')" />
        </FormItem>
        <FormItem :label="$t('faultKnowledgeWorkbench.faultForm.solution')" name="solution">
          <Textarea v-model:value="faultFormData.solution" :rows="3" :placeholder="$t('faultKnowledgeWorkbench.faultForm.solutionPlaceholder')" />
        </FormItem>
      </Form>
      <template #footer>
        <div style="text-align: right">
          <Space>
            <Button @click="faultModalVisible = false">{{ $t('faultKnowledgeWorkbench.common.cancel') }}</Button>
            <Button type="primary" @click="confirmFaultModal">{{ $t('faultKnowledgeWorkbench.common.confirm') }}</Button>
          </Space>
        </div>
      </template>
    </Drawer>

    <!-- 标准内容抽屉（新增/编辑/查看） -->
    <Drawer
      v-model:open="standardModalVisible"
      :title="standardModalTitle"
      :destroy-on-close="true"
      placement="right"
      :width="560"
    >
      <Form ref="standardFormRef" :model="standardFormData" :rules="standardFormRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <FormItem :label="$t('faultKnowledgeWorkbench.standardContent.standardCode')" name="standardCode">
          <Input
            v-model:value="standardFormData.standardCode"
            :disabled="standardModalMode === 'view'"
            :placeholder="$t('faultKnowledgeWorkbench.standardContent.standardCodePlaceholder')"
          />
        </FormItem>
        <FormItem :label="$t('faultKnowledgeWorkbench.standardContent.standardName')" name="standardName">
          <Input
            v-model:value="standardFormData.standardName"
            :disabled="standardModalMode === 'view'"
            :placeholder="$t('faultKnowledgeWorkbench.standardContent.standardNamePlaceholder')"
          />
        </FormItem>
        <FormItem :label="$t('faultKnowledgeWorkbench.standardContent.standardContent')" name="standardContent">
          <Textarea
            v-model:value="standardFormData.standardContent"
            :disabled="standardModalMode === 'view'"
            :rows="4"
            :placeholder="$t('faultKnowledgeWorkbench.standardContent.standardContentPlaceholder')"
          />
        </FormItem>
        <FormItem :label="$t('faultKnowledgeWorkbench.basicInfo.status')" name="status">
          <RadioGroup
            v-model:value="standardFormData.status"
            :disabled="standardModalMode === 'view'"
          >
            <Radio :value="1">{{ $t('faultKnowledgeWorkbench.basicInfo.enabled') }}</Radio>
            <Radio :value="2">{{ $t('faultKnowledgeWorkbench.basicInfo.disabled') }}</Radio>
          </RadioGroup>
        </FormItem>
      </Form>
      <template #footer>
        <div style="text-align: right">
          <Space>
            <Button @click="standardModalVisible = false">{{ standardModalMode === 'view' ? $t('faultKnowledgeWorkbench.common.close') : $t('faultKnowledgeWorkbench.common.cancel') }}</Button>
            <Button v-if="standardModalMode !== 'view'" type="primary" @click="confirmStandardModal">{{ $t('faultKnowledgeWorkbench.common.confirm') }}</Button>
          </Space>
        </div>
      </template>
    </Drawer>

    <!-- 维修措施抽屉（新增/编辑/查看） -->
    <Drawer
      v-model:open="manualModalVisible"
      :title="manualModalTitle"
      :destroy-on-close="true"
      placement="right"
      :width="560"
    >
      <Form ref="manualFormRef" :model="manualFormData" :rules="manualFormRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <FormItem :label="$t('faultKnowledgeWorkbench.repairMeasure.manualCode')" name="manualCode">
          <Input
            v-model:value="manualFormData.manualCode"
            :disabled="manualModalMode === 'view'"
            :placeholder="$t('faultKnowledgeWorkbench.repairMeasure.manualCodePlaceholder')"
          />
        </FormItem>
        <FormItem :label="$t('faultKnowledgeWorkbench.repairMeasure.manualName')" name="manualName">
          <Input
            v-model:value="manualFormData.manualName"
            :disabled="manualModalMode === 'view'"
            :placeholder="$t('faultKnowledgeWorkbench.repairMeasure.manualNamePlaceholder')"
          />
        </FormItem>
        <FormItem :label="$t('faultKnowledgeWorkbench.repairMeasure.manualContent')" name="manualContent">
          <Textarea
            v-model:value="manualFormData.manualContent"
            :disabled="manualModalMode === 'view'"
            :rows="4"
            :placeholder="$t('faultKnowledgeWorkbench.repairMeasure.manualContentPlaceholder')"
          />
        </FormItem>
        <FormItem :label="$t('faultKnowledgeWorkbench.basicInfo.status')" name="status">
          <RadioGroup
            v-model:value="manualFormData.status"
            :disabled="manualModalMode === 'view'"
          >
            <Radio :value="1">{{ $t('faultKnowledgeWorkbench.basicInfo.enabled') }}</Radio>
            <Radio :value="2">{{ $t('faultKnowledgeWorkbench.basicInfo.disabled') }}</Radio>
          </RadioGroup>
        </FormItem>
      </Form>
      <template #footer>
        <div style="text-align: right">
          <Space>
            <Button @click="manualModalVisible = false">{{ manualModalMode === 'view' ? $t('faultKnowledgeWorkbench.common.close') : $t('faultKnowledgeWorkbench.common.cancel') }}</Button>
            <Button v-if="manualModalMode !== 'view'" type="primary" @click="confirmManualModal">{{ $t('faultKnowledgeWorkbench.common.confirm') }}</Button>
          </Space>
        </div>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped>
:deep(.ant-card-body) {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

:deep(.ant-spin-nested-loading) {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

:deep(.ant-table-body) {
  max-height: 300px;
  overflow-y: auto !important;
}
</style>
