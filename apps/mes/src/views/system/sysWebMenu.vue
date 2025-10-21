<script lang="ts" setup>
import type { TreeProps } from 'ant-design-vue';

import { h, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiEditOutline, MdiLightDelete } from '@vben/icons';

import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Radio,
  RadioGroup,
  Row,
  Space,
  Switch,
  Table,
  Textarea,
  Tooltip,
  Tree,
  TreeSelect,
} from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { difference } from 'lodash-es';
// eslint-disable-next-line n/no-extraneous-import
import Sortable from 'sortablejs';

import {
  changeOrderWeb,
  createArticleWeb,
  deleteBtnById,
  getMenusWebList,
  updateArticleWeb,
} from '#/api';
import { $t } from '#/locales';
import { flattenTree, queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格操作

// 表格列名
const columns = ref<any[]>([
  {
    dataIndex: 'step',
    ellipsis: true,
    resizable: true,
    rowDrag: true,
    title: '#',
    width: 20,
  },
  {
    dataIndex: 'name',
    ellipsis: true,
    title: '菜单名称',
    width: 40,
  },
  {
    dataIndex: 'url',
    ellipsis: true,
    title: 'url',
    width: 60,
  },
  {
    dataIndex: 'isEnable',
    ellipsis: true,
    title: '是否启用',
    width: 30,
  },
  {
    dataIndex: 'operation',
    ellipsis: true,
    fixed: 'right',
    title: '操作',
    width: 30,
  },
]);
// 表格滚动信息配置
const scroll = ref({
  scrollToFirstRowOnChange: true,
  x: 800,
  y: 450,
});

// 表格数据
const tableData = ref<any[]>([]);

/**
 * 设置表格数据
 * @param data
 */
function setTableData(data: any) {
  tableData.value = data;
}

/**
 * 表格拖拽排序
 * 这个函数用于实现表格行的拖拽排序功能。
 */
function rowDrop() {
  // 使用document.querySelector选择页面中的第一个具有'.ant-table-tbody'类的元素
  // 这个元素是Ant Design Vue中的表格tbody元素
  const tbody: any = document.querySelector('.ant-table-tbody');

  // 使用Sortable.js库创建一个拖拽排序实例
  // 这个实例允许用户通过拖拽来重新排序tbody中的行
  Sortable.create(tbody, {
    // 动画效果，拖拽结束后元素的移动动画时间，单位为毫秒
    animation: 150,
    // 拖拽时的占位符样式类名
    ghostClass: 'blue-background-class',
    // 当拖拽结束时触发的回调函数
    onEnd({ newIndex, oldIndex }: any) {
      // 从当前位置移除当前行数据
      const currRow = tableData.value.splice(oldIndex - 1, 1)[0];

      // 在新位置插入当前行数据
      tableData.value.splice(newIndex - 1, 0, currRow);
      // 调用changeSort函数来更新排序并保存新的顺序
      changeSort();
    },
  });
}

/**
 * 表格排序变更
 * 这个函数用于在表格行拖拽排序完成后，更新服务器上的菜单顺序。
 */
function changeSort() {
  // 创建一个空数组，用于存储菜单代码
  const menuCodes: any[] = [];

  // 遍历表格数据，收集每个菜单项的代码
  tableData.value.forEach((item: any) => {
    // 将菜单代码对象推入menuCodes数组
    menuCodes.push({
      menuCode: item.code,
    });
  });

  // 调用API函数changeOrderWeb，传入更新后的菜单代码数组
  changeOrderWeb(menuCodes)
    .then(() => {
      // 显示操作成功的提示信息
      message.success($t('common.successfulOperation'));
      // 重新查询所有菜单，以更新表格数据
      queryAllMenu();
    })
    .catch((error) => {
      // 显示操作失败的提示信息
      message.error($t('common.operationFailure'));
      // 显示具体的错误信息
      message.error(error);
    });
}

/**
 * 删除行
 * @param rowId 行id
 */
function delTableRow(rowId: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消删除!');
    },
    onOk() {
      deleteBtnById(rowId)
        .then(() => {
          // 显示操作成功的提示信息
          message.success($t('common.successfulOperation'));
          queryAllMenu();
        })
        .catch((error) => {
          // 显示操作失败的提示信息
          message.error($t('common.operationFailure'));
          message.error(error.msg); // 显示操作失败的提示信息
        });
    },
    title: '是否确认删除该条数据?',
  });
}

// endregion

// region 树形菜单操作

// 查询参数
const queryParams = ref({
  // 菜单名称
  name: '',
});

// 当前展开的节点
const expandedKeys = ref<string[]>([]);
// 当前选中的节点
const selectedKeys = ref<string[]>([]);
// 节点数据
const treeData = ref<any[]>([{ childrens: [], code: '', name: '根目录' }]);
// 展平后的节点数据
const flatteningNodeData = ref<any>([]);

/**
 * 查询全部的菜单树
 * 这个函数用于从服务器获取所有菜单数据，并更新前端的树形数据结构。
 */
function queryAllMenu() {
  // 调用getMenusWebList API函数，获取菜单列表
  getMenusWebList().then((data) => {
    // 检查返回的数据是否存在且长度大于0
    if (data && data.length > 0) {
      // 如果数据有效，更新treeData响应式引用中的第一个元素的childrens属性
      treeData.value[0].childrens = data;
      tableData.value = treeData.value[0].childrens;
    }
    // 使用flattenTree函数将树形数据展平
    flatteningNodeData.value = flattenTree(treeData.value[0], 'childrens');
  });
}

/**
 * 点选树菜单
 *
 * @param _selectedKeys 选中的key列表
 * @param selected 当前点击的节点是否选中
 * @param node 当前点击的节点
 */
function selectedTree(_selectedKeys: any, { node, selected }: any) {
  if (selected) {
    setTableData(node.childrens);
  }
}

/**
 * 同时只能有一个节点展开
 * 这个函数用于处理树形控件中节点展开状态的变化。
 * @param {any[]} keys - 当前所有展开节点的key数组
 * @param {{expanded: boolean, node: any}} params - 包含当前操作节点是否展开以及该节点信息的对象
 */
function handleExpand(keys: any[], { expanded, node }: any) {
  // 如果节点有父节点，则获取父节点的children作为tempKeys的数据源
  // 否则，使用treeData作为数据源
  // 确保在树的任何级别都能正确处理展开状态
  const tempKeys = (
    (node.parent ? node.parent.children : treeData.value) || []
  ).map(({ key }: any) => key);

  // 根据节点的展开状态更新expandedKeys响应式引用
  // 如果节点被展开（expanded为true）：
  //   - 从keys数组中移除所有tempKeys中的key
  //   - 将当前节点的key添加到数组中
  // 如果节点被折叠（expanded为false）：
  //   - 直接使用keys数组
  expandedKeys.value = expanded
    ? [...difference(keys, tempKeys), node.key]
    : keys;
}

/**
 * 获取父级的key
 * 这个函数递归地在树形数据结构中查找给定节点的父节点键值。
 * @param {number|string} key - 要查找的子节点的键值
 * @param {TreeProps['treeData']} tree - 树形数据结构
 * @return {number|string|undefined} - 返回找到的父节点的键值，如果没有找到则返回undefined
 */
function getParentKey(
  key: number | string,
  tree: TreeProps['treeData'],
): number | string | undefined {
  let parentKey; // 用于存储找到的父节点键值
  if (tree) {
    // 遍历树形数据结构中的每个元素
    for (const element of tree) {
      const node = element;
      // 检查当前节点是否有子节点
      if (node.childrens) {
        // 检查当前节点的子节点中是否有一个的id与给定的key匹配
        if (node.childrens.some((item: any) => item.code === key)) {
          parentKey = node.code; // 如果找到匹配的子节点，将当前节点的id设置为父节点键值
        } else if (getParentKey(key, node.childrens)) {
          // 如果当前节点的子节点中没有找到匹配的，递归地在子节点的子节点中查找
          parentKey = getParentKey(key, node.childrens); // 如果在子节点中找到匹配的，将找到的父节点键值赋给parentKey
        }
      }
    }
  }
  // 返回找到的父节点键值，如果没有找到则返回undefined
  return parentKey;
}

/**
 * 监听查询参数的变化
 * 当查询参数变化时，此函数会根据查询参数更新树形控件中展开的节点。
 */
watch(queryParams.value, () => {
  // 如果查询参数中的名称（name）存在，则执行以下逻辑
  if (queryParams.value.name) {
    // 使用map方法遍历flatteningNodeData中的所有节点
    // 更新expandedKeys响应式引用，使其包含所有需要展开的节点的父节点键值
    expandedKeys.value = flatteningNodeData.value
      .map((item: any) => {
        // 检查当前节点的名称是否包含查询参数中的名称
        if (item.name.includes(queryParams.value.name)) {
          // 如果包含，调用getParentKey函数获取当前节点的父节点键值
          return getParentKey(item.code, treeData.value);
        }
        // 如果当前节点的名称不包含查询参数中的名称，则返回null
        return null;
      })
      // 使用filter方法过滤掉所有null值，并确保每个父节点键值只出现一次
      .filter(
        (item: any, i: any, self: any) => item && self.indexOf(item) === i,
      );
  }
});

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);
// 新增按钮是否显示
const addButton = ref(false);
// 编辑按钮是否显示
const editButton = ref(false);
// 删除按钮是否显示
const delButton = ref(false);

// 监听权限变化, 变更按钮的显示情况
watch(
  () => author.value,
  () => {
    // 当 author.value 包含 '新增' 时，设置 addButton.value 为 true，表示允许新增
    addButton.value = author.value.includes('新增');
    // 当 author.value 包含 '编辑' 时，设置 editButton.value 为 true，表示允许编辑
    editButton.value = author.value.includes('编辑');
    // 当 author.value 包含 '删除' 时，设置 delButton.value 为 true，表示允许删除
    delButton.value = author.value.includes('删除');
    // 如果有拖拽权限（即 author.value 包含 '拖拽完成'），则初始化拖拽功能
    if (author.value.includes('拖拽完成')) {
      // 调用 rowDrop 函数，用于处理行拖放的逻辑
      rowDrop();
    }
    // 如果没有删除和编辑权限，则移除表格列名数组中的最后一个元素
    if (!delButton.value && !editButton.value) {
      columns.value.pop();
    }
  },
);

// endregion

// region 新增/ 编辑 抽屉
// 是否显示 新增/编辑 抽屉
const showDrawer = ref(false);
// 抽屉中的form表单数据
const editMessage = ref<any>({});
// 抽屉冲的form表单对象
const editForm = ref();
// form表单规则验证
const editRules = ref<any>({
  isEnable: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  name: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  url: [{ message: '此项为必填项', required: true, trigger: 'change' }],
});

/**
 * 显示编辑抽屉
 * @param row
 */
function showEdit(row: any) {
  editMessage.value = {
    ...row,
    fCode: selectedKeys.value[0] ?? '',
  };
  showDrawer.value = true;
}

/**
 * 表单提交
 * 这个函数用于处理表单的提交逻辑。
 */
function editSubmit() {
  // 验证表单值，返回一个Promise对象
  editForm.value.validate().then(() => {
    // 如果表单中的fCode字段不存在，则将其设置为空字符串
    if (!editMessage.value.fCode) {
      editMessage.value.fCode = '';
    }
    // 检查editMessage对象中是否存在code字段
    // 如果存在，则调用updateArticleWeb函数进行更新操作
    // 如果不存在，则调用createArticleWeb函数进行创建操作
    const ob = editMessage.value.code
      ? updateArticleWeb(editMessage.value)
      : createArticleWeb(editMessage.value);
    // 当操作成功时，关闭抽屉，查询所有菜单，并显示成功消息
    ob.then(() => {
      closeDrawer(); // 关闭抽屉
      queryAllMenu(); // 重新查询所有菜单
      message.success($t('common.successfulOperation')); // 显示操作成功的提示信息
    }).catch((error) => {
      // 如果操作失败，则显示错误提示
      message.error($t('common.operationFailure')); // 显示操作失败的提示信息
      // 如果有具体的错误信息，则一并显示
      message.error(error.msg);
    });
  });
}

/**
 * 关闭抽屉
 */
function closeDrawer() {
  showDrawer.value = false;
  editMessage.value = {};
}

// endregion

// region 初始化

// 当组件挂载到DOM上后，立即执行的函数
onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  // 调用queryAllMenu函数，用于获取菜单数据
  queryAllMenu();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 主要内容显示区域 -->
    <Row :gutter="16">
      <!-- region 树形菜单 -->
      <Col :lg="6" :md="9" :sm="9" :xl="6" :xs="6">
        <Card class="h-[80vh] overflow-y-auto">
          <Input
            v-model:value="queryParams.name"
            placeholder="Search"
            style="margin-bottom: 8px"
          />

          <Tree
            v-model:selected-keys="selectedKeys"
            :auto-expand-parent="true"
            :expanded-keys="expandedKeys"
            :field-names="{ children: 'childrens', title: 'name', key: 'code' }"
            :tree-data="treeData"
            @expand="handleExpand"
            @select="selectedTree"
          >
            <template #title="{ name }">
              <span v-if="name && name.indexOf(queryParams.name) > -1">
                {{ name.substring(0, name.indexOf(queryParams.name)) }}
                <span style="color: #f50">{{ queryParams.name }}</span>
                {{
                  name.substring(
                    name.indexOf(queryParams.name) + queryParams.name.length,
                  )
                }}
              </span>
              <span v-else>{{ name }}</span>
            </template>
          </Tree>
        </Card>
      </Col>
      <!-- endregion -->

      <!-- region 表格主体 -->
      <Col :lg="16" :md="15" :sm="15" :xl="18" :xs="18">
        <Card class="h-[80vh]">
          <div>
            <Button
              v-if="addButton"
              class="mb-4"
              type="primary"
              @click="showDrawer = true"
            >
              {{ $t('common.add') }}
            </Button>
          </div>

          <Table
            :columns="columns"
            :data-source="tableData"
            :pagination="false"
            :scroll="scroll"
            bordered
            row-key="id"
          >
            <template #bodyCell="{ column, index, record }">
              <template v-if="column.dataIndex === 'step'">
                <span>{{ index + 1 }}</span>
              </template>
              <template v-else-if="'isEnable' === column.dataIndex">
                <Switch
                  v-model:checked="record.isEnable"
                  :checked-children="$t('status.enable')"
                  :checked-value="1"
                  :un-checked-children="$t('status.forbidden')"
                  disabled
                />
              </template>

              <template v-else-if="column.dataIndex === 'operation'">
                <Space>
                  <!-- 编辑按钮 -->
                  <Tooltip>
                    <template #title>{{ $t('common.edit') }}</template>
                    <Button
                      v-if="editButton"
                      :icon="
                        h(MdiEditOutline, { class: 'inline-block size-6' })
                      "
                      type="link"
                      @click="showEdit(record)"
                    />
                  </Tooltip>

                  <!-- 删除按钮 -->
                  <Tooltip>
                    <template #title>{{ $t('common.delete') }}</template>
                    <Button
                      v-if="delButton"
                      :icon="
                        h(MdiLightDelete, {
                          class: 'inline-block size-6',
                        })
                      "
                      danger
                      type="link"
                      @click="delTableRow(record.id)"
                    />
                  </Tooltip>
                </Space>
              </template>
            </template>
          </Table>
        </Card>
      </Col>
      <!-- endregion -->
    </Row>

    <!-- endregion -->

    <!-- region 编辑 -->
    <Drawer
      v-model:open="showDrawer"
      :footer-style="{ textAlign: 'right' }"
      :title="$t('common.edit')"
      :width="600"
      class="custom-class"
      placement="right"
      root-class-name="root-class-name"
      style="color: red"
      @close="closeDrawer"
    >
      <Form
        ref="editForm"
        :label-col="{ span: 8 }"
        :model="editMessage"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        name="editMessageForm"
      >
        <!-- 上级菜单 -->
        <FormItem :label="$t('system.sysWebMenu.parentMenu')" name="fCode">
          <TreeSelect
            v-model:value="editMessage.fCode"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            :field-names="{
              children: 'childrens',
              label: 'name',
              value: 'code',
            }"
            :tree-data="treeData"
            allow-clear
            placeholder="Please select"
            show-search
            style="width: 100%"
            tree-default-expand-all
            tree-node-filter-prop="label"
          />
        </FormItem>
        <!-- 菜单名称 -->
        <FormItem :label="$t('system.sysWebMenu.menuName')" name="name">
          <Input v-model:value="editMessage.name" />
        </FormItem>
        <!-- url" -->
        <FormItem :label="$t('system.sysWebMenu.url')" name="url">
          <Input v-model:value="editMessage.url" />
        </FormItem>
        <!-- 是否启用 -->
        <FormItem :label="$t('system.sysWebMenu.isEnable')" name="isEnable">
          <RadioGroup v-model:value="editMessage.isEnable">
            <Radio :value="1">{{ $t('status.enable') }}</Radio>
            <Radio :value="0">{{ $t('status.forbidden') }}</Radio>
          </RadioGroup>
        </FormItem>
        <!-- 描述 -->
        <FormItem :label="$t('system.sysWebMenu.description')" name="discription">
          <Textarea v-model:value="editMessage.discription" />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="closeDrawer">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="editSubmit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
