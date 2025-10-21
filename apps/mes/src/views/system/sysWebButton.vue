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
  DirectoryTree,
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
} from 'ant-design-vue';

import {
  deleteButton,
  getMenusWebList,
  insertWord,
  listButton,
  updateButton,
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
    width: 10,
  },
  {
    dataIndex: 'buttonName',
    ellipsis: true,
    title: '按钮名称',
    width: 40,
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
    width: 15,
  },
]);
// 表格滚动信息配置
const scroll = ref({
  scrollToFirstRowOnChange: true,
  x: 840,
  y: 500,
});

// 表格数据
const tableData = ref<any[]>([]);

// 当前选中的末级菜单key
const selectedKey = ref('');

/**
 * 删除表格中的一行数据
 * @param {any} row - 当前行的数据对象，包含需要删除的数据信息
 */
function delTableRow(row: any) {
  // 弹出确认框，询问用户是否确认删除该行数据
  Modal.confirm({
    // 取消按钮的文本
    cancelText: '取消',
    // 确认按钮的文本
    okText: '确认',
    // 确认按钮的类型（此处为危险操作，通常用于删除等不可逆操作）
    okType: 'danger',

    // 用户取消操作时触发的回调函数
    onCancel() {
      // 弹出警告提示，提示用户取消了删除操作
      message.warning('已取消删除!');
    },

    // 用户确认操作时触发的回调函数
    onOk() {
      // 调用删除按钮的操作，传递按钮的编码和类型参数
      deleteButton({
        // 当前行的按钮编码
        buttonCode: row.buttonCode,
        // 操作类型，指定为 web
        type: 'web',
      })
        .then(() => {
          // 如果删除操作成功，显示操作成功的提示信息
          message.success($t('common.successfulOperation')); // 成功操作的提示信息（通过国际化处理）

          // 重新查询按钮列表，更新界面
          queryButtonByMenuCode(selectedKey.value); // 使用当前选中的菜单编码查询按钮
        })
        .catch((error) => {
          // 如果删除操作失败，显示错误提示信息
          message.error($t('common.operationFailure')); // 操作失败的提示信息（通过国际化处理）

          // 显示具体的错误信息
          message.error(error.msg); // 显示从服务器返回的错误消息
        });
    },

    // 确认框的标题文本
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
    }
    // 使用flattenTree函数将树形数据展平
    flatteningNodeData.value = flattenTree(treeData.value[0], 'childrens');
  });
}

/**
 * 根据菜单代码查询按钮数据
 * @param {string} code - 菜单代码，用于查询对应的按钮数据
 */
function queryButtonByMenuCode(code: string) {
  // 调用列表按钮的接口，传递菜单代码和类型参数
  listButton({
    menuCode: code, // 菜单代码
    type: 'web', // 操作类型，指定为 web
  }).then((data) => {
    // 如果查询成功，将返回的数据赋值给表格数据
    tableData.value = data;
  });
}

/**
 * 处理树形控件选中事件
 * @param {any} _selectedKeys - 当前选中的节点键值
 * @param {object} info - 包含节点和选中状态的对象
 * @param {object} info.node - 当前操作的节点对象
 * @param {boolean} info.selected - 节点的选中状态
 */
function selectedTree(_selectedKeys: any, { node, selected }: any) {
  // 如果节点被选中且该节点没有子节点
  if (selected && node.childrens.length === 0) {
    // 更新选中的菜单代码
    selectedKey.value = node.code;
    // 根据选中的菜单代码查询按钮数据
    queryButtonByMenuCode(node.code);
  } else {
    // 如果节点未被选中或有子节点，则清空选中的菜单代码和表格数据
    selectedKey.value = '';
    tableData.value = [];
  }
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
        } else if (node.childrens && getParentKey(key, node.childrens)) {
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
  buttonName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  isEnable: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  url: [{ message: '此项为必填项', required: true, trigger: 'change' }],
});

/**
 * 显示编辑抽屉并加载当前行的数据
 * @param {any} row - 当前行的数据对象，包含需要编辑的数据信息
 */
function showEdit(row: any) {
  // 将当前行的数据赋值给编辑消息对象，以便在编辑抽屉中使用
  editMessage.value = {
    ...row, // 展开当前行的数据，复制所有属性到 editMessage.value
  };
  // 设置 showDrawer 的值为 true，显示编辑抽屉
  showDrawer.value = true;
}

/**
 * 表单提交
 * 这个函数用于处理表单的提交逻辑。
 */
function editSubmit() {
  // 验证表单值，返回一个Promise对象
  editForm.value.validate().then(() => {
    const params = {
      ...editMessage.value,
      menuCode: selectedKey.value,
      type: 'web',
      url: 'kaicom.cn',
    };
    // 检查editMessage对象中是否存在code字段
    // 如果存在，则调用updateArticleWeb函数进行更新操作
    // 如果不存在，则调用createArticleWeb函数进行创建操作
    const ob = editMessage.value.id ? updateButton(params) : insertWord(params);
    // 当操作成功时，关闭抽屉，查询所有菜单，并显示成功消息
    ob.then(() => {
      closeDrawer(); // 关闭抽屉
      queryButtonByMenuCode(selectedKey.value); // 重新查询当前菜单下的按钮
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
  // 调用queryAuth函数，用于获取用户权限信息
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
            placeholder="请输入关键字"
            style="margin-bottom: 8px"
          />

          <DirectoryTree
            v-model:expanded-keys="expandedKeys"
            v-model:selected-keys="selectedKeys"
            :auto-expand-parent="true"
            :field-names="{ children: 'childrens', title: 'name', key: 'code' }"
            :tree-data="treeData"
            @select="selectedTree"
          >
            <template #title="{ name }">
              <span v-if="name && name.includes(queryParams.name)">
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
          </DirectoryTree>
        </Card>
      </Col>
      <!-- endregion -->

      <!-- region 表格主体 -->
      <Col :lg="16" :md="15" :sm="15" :xl="18" :xs="18">
        <Card class="h-[80vh] overflow-y-auto">
          <div>
            <Button
              v-if="addButton"
              :disabled="!selectedKey"
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
                      @click="delTableRow(record)"
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
        <!-- 按钮名称 -->
        <FormItem :label="$t('system.sysButton.buttonName')" name="buttonName">
          <Input v-model:value="editMessage.buttonName" />
        </FormItem>
        <!-- 是否启用 -->
        <FormItem :label="$t('system.sysButton.isEnable')" name="isEnable">
          <RadioGroup v-model:value="editMessage.isEnable">
            <Radio :value="1">{{ $t('status.enable') }}</Radio>
            <Radio :value="0">{{ $t('status.forbidden') }}</Radio>
          </RadioGroup>
        </FormItem>
        <!-- 描述 -->
        <FormItem
          :label="$t('system.sysWebMenu.description')"
          name="discription"
        >
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
