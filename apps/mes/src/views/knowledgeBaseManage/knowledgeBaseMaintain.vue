<script lang="ts" setup>
/**
 * [INPUT]: 依赖 getCategoryTree/addCategory/updateCategory/deleteCategory API，queryAuth 权限，Ant Design Vue Tree/Modal 组件
 * [OUTPUT]: 知识库目录树维护页面，左右两栏布局，左侧树结构，右侧文件显示区域
 * [POS]: 知识库管理模块页面，路由路径对应 views/knowledgeBaseManage/knowledgeBaseMaintain.vue
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-08-04 09:00:00
 */
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

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
  Row,
  Select,
  Space,
  Spin,
  Textarea,
  Tree,
  Upload,
} from 'ant-design-vue';

import {
  addCategory,
  addManual,
  deleteCategory,
  deleteManual,
  editManual,
  getCategoryRoles,
  getCategoryTree,
  getRoleSelectInfo,
  updateCategory,
  updateCategoryRoles,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import FilePreview from '#/util/component/filePreview.vue';

// ========== 树节点类型 ==========

interface TreeNodeData {
  title: string;
  key: string;
  icon?: string;
  children?: TreeNodeData[];
  isLeaf?: boolean;
  nodeType: 'category' | 'manual';
  rawData: Record<string, any>;
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

// ========== 搜索 ==========

const keyword = ref('');

// ========== 树数据 ==========

const treeData = ref<TreeNodeData[]>([]);
const treeLoading = ref(false);
const selectedKeys = ref<string[]>([]);
const selectedNode = ref<null | TreeNodeData>(null);

/**
 * 将 API 返回的目录树数据转换为 Ant Design Tree 组件格式。
 * 目录节点包含子目录和手册作为 children，手册节点标记为 isLeaf。
 * @param {any[]} data - API 返回的原始树数据数组。
 * @returns {TreeNodeData[]} 转换后的树节点数组。
 * @since 2026-08-04 09:00:00
 */
function transformTreeData(data: any[]): TreeNodeData[] {
  if (!data || !Array.isArray(data)) return [];

  return data.map((category: any) => {
    const children: TreeNodeData[] = [];

    // 子目录
    if (category.children && Array.isArray(category.children)) {
      children.push(...transformTreeData(category.children));
    }

    // 手册文件作为叶子节点
    if (category.manuals && Array.isArray(category.manuals)) {
      category.manuals.forEach((manual: any) => {
        children.push({
          title: manual.manualName,
          key: `manual-${manual.id}`,
          isLeaf: true,
          nodeType: 'manual',
          rawData: manual,
        });
      });
    }

    return {
      title: category.categoryName,
      key: `category-${category.id}`,
      children: children.length > 0 ? children : undefined,
      isLeaf: children.length === 0,
      nodeType: 'category',
      rawData: category,
    };
  });
}

/**
 * 加载目录树数据。
 * @param {string} [kw] - 可选的关键词筛选。
 * @since 2026-08-04 09:00:00
 */
function loadTreeData(kw?: string) {
  treeLoading.value = true;
  return getCategoryTree({ keyword: kw || undefined })
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

/**
 * 树节点选中事件。
 * 目录节点：更新选中状态，显示操作按钮。
 * 手册节点：右侧显示文件详情。
 * @param {any} _keys - 选中的 key 数组。
 * @param {any} info - 选中节点信息，包含 node、dataRef 等。
 * @since 2026-08-04 09:00:00
 */
function onTreeSelect(_keys: any, info: any) {
  if (!_keys || _keys.length === 0) {
    selectedNode.value = null;
    selectedKeys.value = [];
    return;
  }

  selectedKeys.value = _keys;
  selectedNode.value = info.node?.dataRef || null;
}

// ========== 目录操作模态框 ==========

const modalVisible = ref(false);
const modalTitle = ref('');
const modalMode = ref<'addRoot' | 'addSub' | 'edit'>('addRoot');
const formData = ref({ categoryCode: '', categoryName: '' });

// ========== 手册模态框 ==========
const manualModalVisible = ref(false);
const manualModalTitle = ref('');
const manualModalMode = ref<'add' | 'edit'>('add');
const manualFormData = ref({
  manualCode: '',
  manualName: '',
  manualContent: '',
  attachmentUrl: '',
  remark: '',
});
const manualFormRef = ref<any>();

// 手册表单验证规则
const manualRules: Record<string, any> = {
  manualCode: [
    {
      required: true,
      message: $t('knowledgeBaseManage.manualCodeRequired'),
    },
  ],
  manualName: [
    {
      required: true,
      message: $t('knowledgeBaseManage.manualNameRequired'),
    },
  ],
};

// region 文件上传
const accessStore = useAccessStore();
// 手册附件上传列表
const manualUploadFile = ref<any>([]);

/**
 * 获取文件上传地址。
 * @returns 上传接口 URL
 * @since 2026-08-04 09:00:00
 */
function getUploadUrl() {
  return `/ht/${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/common/file/uploadFile`;
}

/**
 * 上传状态变更回调，成功后同步到 manualFormData.attachmentUrl。
 * @param info 上传文件信息
 * @since 2026-08-04 09:00:00
 */
function handleManualUploadChange(info: any) {
  switch (info.file.status) {
  case 'done': {
    const url = info.file.response?.data || '';
    manualFormData.value.attachmentUrl = url;

  break;
  }
  case 'error': {
    message.error($t('knowledgeBaseManage.uploadFailed'));

  break;
  }
  case 'removed': {
    manualFormData.value.attachmentUrl = '';

  break;
  }
  // No default
  }
}
// endregion

/**
 * 打开新增根目录模态框。
 * @since 2026-08-04 09:00:00
 */
function openAddRoot() {
  modalMode.value = 'addRoot';
  modalTitle.value = $t('knowledgeBaseManage.addRootCategory');
  formData.value = { categoryCode: '', categoryName: '' };
  modalVisible.value = true;
}

/**
 * 打开新增子目录模态框。
 * @since 2026-08-04 09:00:00
 */
function openAddSub() {
  if (!selectedNode.value) {
    message.warning($t('common.pleaseSelect'));
    return;
  }
  modalMode.value = 'addSub';
  modalTitle.value = $t('knowledgeBaseManage.addSubCategory');
  formData.value = { categoryCode: '', categoryName: '' };
  modalVisible.value = true;
}

/**
 * 打开编辑目录模态框。
 * @since 2026-08-04 09:00:00
 */
function openEdit() {
  if (!selectedNode.value) {
    message.warning($t('common.pleaseSelect'));
    return;
  }
  const raw = selectedNode.value.rawData;
  modalMode.value = 'edit';
  modalTitle.value = $t('knowledgeBaseManage.editCategory');
  formData.value = {
    categoryCode: raw.categoryCode || '',
    categoryName: raw.categoryName || '',
  };
  modalVisible.value = true;
}

/**
 * 确认新增或编辑目录。
 * @since 2026-08-04 09:00:00
 */
function confirmModal() {
  if (!formData.value.categoryName) {
    message.error($t('knowledgeBaseManage.categoryNameRequired'));
    return;
  }

  switch (modalMode.value) {
  case 'addRoot': {
    addCategory({
      categoryCode: formData.value.categoryCode,
      categoryName: formData.value.categoryName,
      parentId: 0,
    })
      .then(() => {
        message.success($t('knowledgeBaseManage.addSuccess'));
        modalVisible.value = false;
        loadTreeData(keyword.value);
      })
      .catch(() => {});

  break;
  }
  case 'addSub': {
    const parentId = selectedNode.value?.rawData.id;
    addCategory({
      categoryCode: formData.value.categoryCode,
      categoryName: formData.value.categoryName,
      parentId: parentId || 0,
    })
      .then(() => {
        message.success($t('knowledgeBaseManage.addSuccess'));
        modalVisible.value = false;
        loadTreeData(keyword.value);
      })
      .catch(() => {});

  break;
  }
  case 'edit': {
    const raw = selectedNode.value?.rawData;
    if (!raw) return;
    updateCategory({
      id: raw.id,
      categoryCode: formData.value.categoryCode,
      categoryName: formData.value.categoryName,
      parentId: raw.parentId,
    })
      .then(() => {
        message.success($t('knowledgeBaseManage.editSuccess'));
        modalVisible.value = false;
        loadTreeData(keyword.value);
      })
      .catch(() => {});

  break;
  }
  // No default
  }
}

/**
 * 删除目录确认。
 * @since 2026-08-04 09:00:00
 */
function handleDelete() {
  if (!selectedNode.value) {
    message.warning($t('common.pleaseSelect'));
    return;
  }
  const raw = selectedNode.value.rawData;
  Modal.confirm({
    title: $t('knowledgeBaseManage.deleteCategory'),
    content: $t('knowledgeBaseManage.deleteConfirm'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    okType: 'danger',
    onOk: () => {
      return deleteCategory(raw.id)
        .then(() => {
          message.success($t('knowledgeBaseManage.deleteSuccess'));
          selectedNode.value = null;
          selectedKeys.value = [];
          loadTreeData(keyword.value);
        })
        .catch(() => {
          throw undefined;
        });
    },
  });
}

// ========== 手册操作 ==========

/**
 * 打开新增手册模态框。
 * @since 2026-08-04 09:00:00
 */
function openAddManual() {
  manualModalMode.value = 'add';
  manualModalTitle.value = $t('knowledgeBaseManage.addManual');
  manualFormData.value = {
    manualCode: '',
    manualName: '',
    manualContent: '',
    attachmentUrl: '',
    remark: '',
  };
  manualUploadFile.value = [];
  manualModalVisible.value = true;
}

/**
 * 打开编辑手册模态框。
 * @since 2026-08-04 09:00:00
 */
function openEditManual() {
  const raw = selectedNode.value?.rawData;
  if (!raw) return;
  manualModalMode.value = 'edit';
  manualModalTitle.value = $t('knowledgeBaseManage.editManual');
  manualFormData.value = {
    manualCode: raw.manualCode || '',
    manualName: raw.manualName || '',
    manualContent: raw.manualContent || '',
    attachmentUrl: raw.attachmentUrl || '',
    remark: raw.remark || '',
  };
  manualUploadFile.value = [];
  if (raw.attachmentUrl) {
    const fileName = raw.attachmentUrl.match(/[^/]+$/)?.[0] || '';
    manualUploadFile.value.push({
      url: raw.attachmentUrl,
      status: 'done',
      name: fileName,
    });
  }
  manualModalVisible.value = true;
}

/**
 * 关闭手册抽屉并清空所有状态。
 * @since 2026-08-04 09:00:00
 */
function handleManualClose() {
  manualModalVisible.value = false;
  manualFormRef.value?.resetFields();
  manualModalMode.value = 'add';
  manualFormData.value = {
    manualCode: '',
    manualName: '',
    manualContent: '',
    attachmentUrl: '',
    remark: '',
  };
  manualUploadFile.value = [];
}

/**
 * 确认手册新增/编辑（表单验证后提交）。
 * @since 2026-08-04 09:00:00
 */
function confirmManualModal() {
  manualFormRef.value
    .validate()
    .then(() => {
      const raw = selectedNode.value?.rawData;
      const faultTreeId =
        manualModalMode.value === 'add'
          ? raw?.id || 0
          : raw?.faultTreeId || 0;

      const params = {
        manualCode: manualFormData.value.manualCode,
        manualName: manualFormData.value.manualName,
        manualContent: manualFormData.value.manualContent,
        attachmentUrl: manualFormData.value.attachmentUrl,
        remark: manualFormData.value.remark,
        faultTreeId,
      };

      const apiCall =
        manualModalMode.value === 'add'
          ? addManual(params)
          : editManual({ ...params, id: raw?.id });

      const successMsg =
        manualModalMode.value === 'add'
          ? $t('knowledgeBaseManage.addSuccess')
          : $t('knowledgeBaseManage.editSuccess');

      return apiCall.then(() => {
        message.success(successMsg);
        // 保存需要刷新的手册 key（仅当右侧面板当前正在显示该手册时）
        const isCurrentManual =
          manualModalMode.value === 'edit' &&
          selectedNode.value?.nodeType === 'manual' &&
          selectedNode.value?.rawData?.id === raw?.id;
        const refreshKey = isCurrentManual
          ? `manual-${raw?.id}`
          : null;
        handleManualClose();
        loadTreeData(keyword.value).then(() => {
          if (refreshKey) {
            findNode(treeData.value, refreshKey);
            selectedKeys.value = [refreshKey];
          }
        });
      });
    })
    .catch(() => {});
}

/**
 * 删除手册确认。
 * @since 2026-08-04 09:00:00
 */
function handleDeleteManual() {
  const raw = selectedNode.value?.rawData;
  if (!raw?.id) return;
  Modal.confirm({
    title: $t('common.prompt'),
    content: $t('knowledgeBaseManage.deleteManualConfirm'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    okType: 'danger',
    onOk: () => {
      return deleteManual(raw.id)
        .then(() => {
          message.success($t('knowledgeBaseManage.deleteSuccess'));
          selectedNode.value = null;
          selectedKeys.value = [];
          loadTreeData(keyword.value);
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
 * @param {string} menuKey - 菜单项 key（addSub/edit/delete）。
 * @since 2026-08-04 09:00:00
 */
function onContextMenuClick(treeKey: string, menuKey: string) {
  // 先选中节点
  selectedKeys.value = [treeKey];
  // 从 treeData 中找到对应节点
  findNode(treeData.value, treeKey);

  switch (menuKey) {
    case 'addManual': {
      openAddManual();
      break;
    }
    case 'addSub': {
      openAddSub();
      break;
    }
    case 'delete': {
      handleDelete();
      break;
    }
    case 'deleteManual': {
      handleDeleteManual();
      break;
    }
    case 'edit': {
      openEdit();
      break;
    }
    case 'editBoundRole': {
      openRoleModal('edit');
      break;
    }
    case 'editManual': {
      openEditManual();
      break;
    }
    case 'viewBoundRole': {
      openRoleModal('view');
      break;
    }
    // No default
  }
}

/**
 * 递归查找树节点，设置 selectedNode。
 * @param {TreeNodeData[]} nodes - 当前层级的节点列表。
 * @param {string} key - 目标节点 key。
 * @since 2026-08-04 09:00:00
 */
function findNode(nodes: TreeNodeData[], key: string): void {
  for (const node of nodes) {
    if (node.key === key) {
      selectedNode.value = node;
      return;
    }
    if (node.children) {
      findNode(node.children, key);
    }
  }
}

// ========== 角色绑定模态框 ==========

const roleModalVisible = ref(false);
const roleModalMode = ref<'edit' | 'view'>('edit');
const roleModalTitle = ref('');
const selectedRoleIds = ref<string[]>([]);
const roleOptions = ref<{ label: string; value: string }[]>([]);
const roleModalLoading = ref(false);
const roleSubmitLoading = ref(false);

/**
 * 获取角色下拉列表。
 * @since 2026-08-05 09:00:00
 */
function fetchRoleOptions() {
  roleModalLoading.value = true;
  getRoleSelectInfo()
    .then((res: any) => {
      roleOptions.value = (res || []).map((item: any) => ({
        label: item.roleName || item.name || '',
        value: item.roleCode || item.code || '',
      }));
    })
    .catch(() => {
      roleOptions.value = [];
    })
    .finally(() => {
      roleModalLoading.value = false;
    });
}

/**
 * 获取当前目录已绑定的角色列表。
 * @param {number} categoryId - 目录 ID
 * @since 2026-08-05 09:00:00
 */
function fetchCategoryRoles(categoryId: number) {
  getCategoryRoles(categoryId)
    .then((res: any) => {
      selectedRoleIds.value = Array.isArray(res) ? res : [];
    })
    .catch(() => {
      selectedRoleIds.value = [];
    });
}

/**
 * 打开角色绑定/查看模态框。
 * @param {'edit' | 'view'} mode - 编辑或查看模式
 * @since 2026-08-05 09:00:00
 */
function openRoleModal(mode: 'edit' | 'view') {
  const raw = selectedNode.value?.rawData;
  if (!raw?.id) return;
  roleModalMode.value = mode;
  roleModalTitle.value =
    mode === 'edit'
      ? $t('knowledgeBaseManage.editBoundRole')
      : $t('knowledgeBaseManage.viewBoundRole');
  selectedRoleIds.value = [];
  roleModalVisible.value = true;
  fetchRoleOptions();
  fetchCategoryRoles(raw.id);
}

/**
 * 确认绑定角色。
 * @since 2026-08-05 09:00:00
 */
function confirmRoleModal() {
  if (selectedRoleIds.value.length === 0) {
    message.error($t('knowledgeBaseManage.roleRequired'));
    return;
  }
  const raw = selectedNode.value?.rawData;
  if (!raw?.id) return;
  roleSubmitLoading.value = true;
  updateCategoryRoles({
    categoryId: raw.id,
    roleCodes: selectedRoleIds.value,
  })
    .then(() => {
      message.success($t('knowledgeBaseManage.roleSaveSuccess'));
      roleModalVisible.value = false;
    })
    .catch(() => {})
    .finally(() => {
      roleSubmitLoading.value = false;
    });
}

// ========== 搜索 ==========

/**
 * 搜索目录树。
 * @since 2026-08-04 09:00:00
 */
function handleSearch() {
  loadTreeData(keyword.value);
}

/**
 * 重置搜索。
 * @since 2026-08-04 09:00:00
 */
function handleReset() {
  keyword.value = '';
  loadTreeData();
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
      <!-- 左侧：目录树 -->
      <Col :span="6" style="display: flex; flex-direction: column; height: 100%;">
        <Card
          :title="$t('knowledgeBaseManage.directoryTree')"
          size="small"
          style="display: flex; flex-direction: column; overflow: hidden; flex: 1;"
        >
          <!-- 搜索栏 -->
          <div class="mb-3 flex items-center gap-2">
            <Input
              v-model:value="keyword"
              :placeholder="$t('knowledgeBaseManage.keywordPlaceholder')"
              allow-clear
              size="small"
              class="flex-1"
              @press-enter="handleSearch"
            />
            <Button size="small" type="primary" @click="handleSearch">
              <Icon icon="mdi:magnify" class="inline-block align-middle" />
            </Button>
            <Button size="small" @click="handleReset">
              <Icon icon="mdi:refresh" class="inline-block align-middle" />
            </Button>
          </div>

          <!-- 操作按钮 -->
          <div class="mb-2 flex flex-wrap gap-1">
            <Button
              v-if="addButton"
              size="small"
              type="primary"
              @click="openAddRoot"
            >
              <Icon icon="mdi:plus" class="inline-block align-middle" />
              {{ $t('knowledgeBaseManage.addRootCategory') }}
            </Button>
          </div>

          <!-- 树结构 -->
          <div class="flex-1 overflow-auto" style="min-height: 0;">
            <Spin :spinning="treeLoading">
              <Tree
                v-if="treeData.length > 0"
                :tree-data="treeData"
                :selected-keys="selectedKeys"
                :default-expand-all="false"
                block-node
                @select="onTreeSelect"
              >
                <template #title="{ key: treeKey, title, nodeType }">
                  <div class="flex items-center">
                    <div class="w-[20px] flex items-center mr-1">
                      <Icon
                        v-if="nodeType === 'category'"
                        icon="mdi:folder-outline"
                        class="inline-block align-middle text-yellow-600"
                        style="font-size: 16px;"
                      />
                      <Icon
                        v-else
                        icon="mdi:file-document-outline"
                        class="inline-block align-middle text-blue-600"
                        style="font-size: 16px;"
                      />
                    </div>
                    <div class="flex-1 flex items-center">
                      <Dropdown
                        :trigger="['contextmenu']"
                        :destroy-popup-on-hide="true"
                      >
                        <span
                          class="w-full inline-block"
                          :style="{
                            color: nodeType === 'manual'
                              ? 'var(--ant-color-primary)'
                              : 'inherit',
                            cursor: 'pointer',
                          }"
                        >
                          {{ title }}
                        </span>
                        <template #overlay>
                          <Menu @click="({ key: menuKey }: any) => onContextMenuClick(treeKey as string, menuKey as string)">
                            <!-- 目录节点菜单 -->
                            <template v-if="nodeType === 'category'">
                              <MenuItem v-if="addButton" key="addSub">
                                {{ $t('knowledgeBaseManage.addSubCategory') }}
                              </MenuItem>
                              <MenuItem v-if="editButton" key="edit">
                                {{ $t('knowledgeBaseManage.editCategory') }}
                              </MenuItem>
                              <MenuItem v-if="delButton" key="delete" danger>
                                {{ $t('knowledgeBaseManage.deleteCategory') }}
                              </MenuItem>
                              <MenuItem v-if="addButton" key="addManual">
                                {{ $t('knowledgeBaseManage.addManual') }}
                              </MenuItem>
                              <MenuItem key="viewBoundRole">
                                {{ $t('knowledgeBaseManage.viewBoundRole') }}
                              </MenuItem>
                              <MenuItem v-if="editButton" key="editBoundRole">
                                {{ $t('knowledgeBaseManage.editBoundRole') }}
                              </MenuItem>
                            </template>
                            <!-- 手册叶子节点菜单 -->
                            <template v-if="nodeType === 'manual'">
                              <MenuItem v-if="editButton" key="editManual">
                                {{ $t('knowledgeBaseManage.editManual') }}
                              </MenuItem>
                              <MenuItem v-if="delButton" key="deleteManual" danger>
                                {{ $t('knowledgeBaseManage.deleteManual') }}
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
                style="color: var(--ant-color-text-secondary);"
              >
                {{ $t('common.noData') }}
              </div>
            </Spin>
          </div>
        </Card>
      </Col>

      <!-- 右侧：文件内容显示 -->
      <Col :span="18" style="display: flex; flex-direction: column; height: 100%;">
        <Card
          :title="$t('knowledgeBaseManage.fileContent')"
          size="small"
          style="display: flex; flex-direction: column; overflow: hidden; flex: 1;"
        >
          <div class="flex-1 overflow-auto" style="min-height: 0;">
            <!-- 手册文件详情 -->
            <template v-if="selectedNode?.nodeType === 'manual'">
              <Descriptions :column="1" bordered size="small">
                <DescriptionsItem :label="$t('knowledgeBaseManage.manualCode')">
                  {{ selectedNode.rawData.manualCode || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.manualName')">
                  {{ selectedNode.rawData.manualName || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.manualContent')">
                  {{ selectedNode.rawData.manualContent || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.attachmentUrl')">
                  {{ selectedNode.rawData.attachmentUrl || '-' }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('knowledgeBaseManage.remark')">
                  {{ selectedNode.rawData.remark || '-' }}
                </DescriptionsItem>
              </Descriptions>
              <!-- 文件内容预览 -->
              <FilePreview
                class="mt-4"
                :url="selectedNode.rawData.attachmentUrl"
                :placeholder="$t('knowledgeBaseManage.fileContent')"
              />
            </template>

            <!-- 选中目录节点时提示 -->
            <template v-else-if="selectedNode?.nodeType === 'category'">
              <div
                class="flex flex-col items-center justify-center"
                style="height: 100%; color: var(--ant-color-text-secondary);"
              >
                <Icon
                  icon="mdi:folder-open-outline"
                  style="font-size: 64px; color: var(--ant-color-text-disabled);"
                  class="mb-3"
                />
                <div>
                  {{
                    $t('knowledgeBaseManage.selectFileTip')
                  }}
                </div>
              </div>
            </template>

            <!-- 未选择任何节点 -->
            <template v-else>
              <div
                class="flex flex-col items-center justify-center"
                style="height: 100%; color: var(--ant-color-text-secondary);"
              >
                <Icon
                  icon="mdi:file-search-outline"
                  style="font-size: 64px; color: var(--ant-color-text-disabled);"
                  class="mb-3"
                />
                <div>
                  {{
                    $t('knowledgeBaseManage.selectFileTip')
                  }}
                </div>
              </div>
            </template>
          </div>
        </Card>
      </Col>
    </Row>

    <!-- 新增/编辑目录模态框 -->
    <Modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :destroy-on-close="true"
      @ok="confirmModal"
    >
      <Form layout="vertical">
        <FormItem
          :label="$t('knowledgeBaseManage.parentCategory')"
          v-if="modalMode === 'addSub' || modalMode === 'edit'"
        >
          <Input
            :value="
              modalMode === 'addSub'
                ? selectedNode?.title || $t('knowledgeBaseManage.rootCategory')
                : $t('knowledgeBaseManage.rootCategory')
            "
            disabled
          />
        </FormItem>
        <FormItem :label="$t('knowledgeBaseManage.categoryCode')">
          <Input
            v-model:value="formData.categoryCode"
            disabled
          />
        </FormItem>
        <FormItem :label="$t('knowledgeBaseManage.categoryName')" required>
          <Input
            v-model:value="formData.categoryName"
            :placeholder="$t('knowledgeBaseManage.categoryNameRequired')"
          />
        </FormItem>
      </Form>
    </Modal>

    <!-- 绑定角色模态框 -->
    <Modal
      v-model:open="roleModalVisible"
      :title="roleModalTitle"
      :destroy-on-close="true"
    >
      <Spin :spinning="roleModalLoading">
        <Form layout="vertical">
          <FormItem
            :label="$t('knowledgeBaseManage.categoryName')"
          >
            <Input :value="selectedNode?.title" disabled />
          </FormItem>
          <FormItem
            :label="$t('knowledgeBaseManage.boundRole')"
            :required="roleModalMode === 'edit'"
          >
            <Select
              v-model:value="selectedRoleIds"
              :disabled="roleModalMode === 'view'"
              :options="roleOptions"
              :placeholder="$t('knowledgeBaseManage.roleRequired')"
              mode="multiple"
              style="width: 100%"
            />
          </FormItem>
        </Form>
      </Spin>

      <template #footer>
        <Space>
          <Button @click="roleModalVisible = false">
            {{ roleModalMode === 'view' ? $t('common.close') : $t('common.cancel') }}
          </Button>
          <Button
            v-if="roleModalMode === 'edit'"
            type="primary"
            :loading="roleSubmitLoading"
            @click="confirmRoleModal"
          >
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Modal>

    <!-- 新增/编辑手册抽屉 -->
    <Drawer
      v-model:open="manualModalVisible"
      :title="manualModalTitle"
      :destroy-on-close="true"
      width="600"
      :footer-style="{ textAlign: 'right' }"
      @close="handleManualClose"
    >
      <Form
        ref="manualFormRef"
        :model="manualFormData"
        :rules="manualRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <FormItem
          :label="$t('knowledgeBaseManage.manualCode')"
          name="manualCode"
        >
          <Input
            v-model:value="manualFormData.manualCode"
            :placeholder="$t('knowledgeBaseManage.manualCodeRequired')"
          />
        </FormItem>
        <FormItem
          :label="$t('knowledgeBaseManage.manualName')"
          name="manualName"
        >
          <Input
            v-model:value="manualFormData.manualName"
            :placeholder="$t('knowledgeBaseManage.manualNameRequired')"
          />
        </FormItem>
        <FormItem :label="$t('knowledgeBaseManage.manualContent')">
          <Textarea
            v-model:value="manualFormData.manualContent"
            :rows="4"
          />
        </FormItem>
        <FormItem :label="$t('knowledgeBaseManage.attachmentUrl')">
          <Upload
            v-model:file-list="manualUploadFile"
            :action="getUploadUrl()"
            :headers="{ Authorization: `${accessStore.accessToken}` }"
            :max-count="1"
            accept=".docx,.pdf,.pptx,.xlsx"
            list-type="picture"
            name="file"
            @change="handleManualUploadChange"
          >
            <Button type="primary">
              {{ $t('common.upload') }}
            </Button>
          </Upload>
        </FormItem>
        <FormItem :label="$t('knowledgeBaseManage.remark')">
          <Input
            v-model:value="manualFormData.remark"
          />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <Button @click="handleManualClose">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="primary" @click="confirmManualModal">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped>
:deep(.ant-card-body) {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
}

:deep(.ant-spin-nested-loading) {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
</style>
