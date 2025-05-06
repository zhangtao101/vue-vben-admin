<script lang="ts" setup>
import type { Rule } from 'ant-design-vue/es/form';

import { computed, h, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiEditOutline, MdiLightDelete, MdiSearch } from '@vben/icons';

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
  Row,
  Space,
  Table,
  Textarea,
  Tooltip,
} from 'ant-design-vue';

import {
  addDictionary,
  deleteDictionary,
  queryDictionary,
  queryDictionaryByCode,
  queryDictionaryTree,
  updateDictionary,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

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
    width: 30,
  },
  {
    dataIndex: 'wordName',
    ellipsis: true,
    title: '字典名称',
    width: 60,
  },
  {
    dataIndex: 'wordCode',
    ellipsis: true,
    title: '字典编号',
    width: 60,
  },
  {
    dataIndex: 'parName',
    ellipsis: true,
    title: '父级字典',
    width: 60,
  },
  {
    dataIndex: 'discription',
    ellipsis: true,
    title: '描述',
    width: 80,
  },
  {
    dataIndex: 'operation',
    ellipsis: true,
    fixed: 'right',
    title: '操作',
    width: 80,
  },
]);
// 表格滚动信息配置
const scroll = ref({
  scrollToFirstRowOnChange: true,
  x: 700,
  y: 320,
});

// 表格数据
const tableData = ref<any[]>([]);
// 表格加载状态
const tableLoading = ref(false);

// 当前选中的节点
const selectedKey = ref<any>(undefined);

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
      deleteDictionary(row.wordCode)
        .then(() => {
          // 如果删除操作成功，显示操作成功的提示信息
          message.success($t('common.successfulOperation')); // 成功操作的提示信息（通过国际化处理）

          // 调用queryAllWord函数，用于获取字典数据
          queryAllWord();
          // 根据当前是否有选中的节点来判断具体的查询数据方法
          if (selectedKey.value) {
            // 调用queryDataByParCode函数, 用于获取字典数据
            queryDataByParCode();
          } else {
            // 调用queryData函数, 用于获取字典数据
            queryData();
          }
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

// region 数据查询

// 查询参数
const queryParams = ref({
  // 字典编号
  wordCode: '',
  // 字典名称
  wordName: '',
});

// 分页信息
const paging = ref({
  current: 1,
  pageSize: 20,
  total: 99,
});
// 表格分页信息
const pagination = computed<any>(() => paging);

/**
 * 分页信息改变事件
 */
function paginationChange(page: any) {
  paging.value.current = page.current;
  paging.value.pageSize = page.pageSize;
  // 根据当前是否有选中的节点来判断具体的查询数据方法
  if (selectedKey.value) {
    // 调用queryDataByParCode函数, 用于获取字典数据
    queryDataByParCode();
  } else {
    // 调用queryData函数, 用于获取字典数据
    queryData();
  }
}

/**
 * 查询数据
 */
function queryData() {
  tableLoading.value = true;
  queryDictionary({
    ...queryParams.value,
    pageNum: paging.value.current,
    pageSize: paging.value.pageSize,
  })
    .then(({ total, list }: any) => {
      // 如果查询成功，将返回的数据赋值给表格数据
      tableData.value = list;
      paging.value.total = total;
    })

    .finally(() => {
      tableLoading.value = false;
    });
}

/**
 * 根据父级字典编号查询数据
 */
function queryDataByParCode() {
  // 根据选中的菜单代码查询字典数据
  queryDictionaryByCode({
    pageNum: paging.value.current, // 当前页码
    pageSize: paging.value.pageSize, // 每页显示的条数
    parCode: selectedKey.value.wordCode, // 父级编码
  })
    .then(({ total, list }: any) => {
      // 如果查询成功，将返回的数据赋值给表格数据
      tableData.value = list;
      // 更新分页总数
      paging.value.total = total;
    })

    .finally(() => {
      // 无论成功或失败，都停止显示加载状态
      tableLoading.value = false;
    });
}

// endregion

// region 树形菜单操作

// 当前展开的节点
const expandedKeys = ref<string[]>([]);
// 当前选中的节点
const selectedKeys = ref<string[]>([]);
// 节点数据
const treeData = ref<any[]>([]);

/**
 * 查询全部的字典树
 * 这个函数用于从服务器获取所有字典数据，并更新前端的树形数据结构。
 */
function queryAllWord() {
  // 调用queryDictionaryTree API函数，获取菜单列表
  queryDictionaryTree().then((data) => {
    // 检查返回的数据是否存在且长度大于0
    if (data) {
      // 如果数据有效，更新treeData
      treeData.value = [data];
    }
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
  // 如果节点被选中且该节点有子节点
  if (selected && node.children.length > 0) {
    // 更新选中的菜单代码
    selectedKey.value = node;
    // 显示表格加载状态
    tableLoading.value = true;
    // 重置分页到第一页
    paging.value.current = 1;
    // 根据选中的菜单代码查询字典数据
    queryDataByParCode();
  } else {
    // 如果节点未被选中或没有子节点，则清空选中的菜单代码和表格数据
    selectedKey.value = undefined;
    tableData.value = [];
  }
}

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
  parName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  wordCode: [
    {
      required: true,
      trigger: 'change',
      validator: (_rule: Rule, value: string) => {
        const regex = /^[A-Z]+$/;
        if (value === '') {
          return Promise.reject(new Error('此项为必填项'));
        } else if (regex.test(value)) {
          return Promise.resolve();
        } else {
          return Promise.reject(new Error('该项是大写字母, 请确保格式正确!'));
        }
      },
    },
  ],
  wordName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
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
 * 显示新增抽屉
 */
function showAdd() {
  editMessage.value = {
    parCode: selectedKey.value.wordCode,
    parName: selectedKey.value.wordName,
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
    };
    // 检查editMessage对象中是否存在code字段
    // 如果存在，则调用updateDictionary函数进行更新操作
    // 如果不存在，则调用addDictionary函数进行创建操作
    const ob = editMessage.value.orderNumber
      ? updateDictionary({ ...params, oldWordCode: params.wordCode })
      : addDictionary(params);
    // 当操作成功时，关闭抽屉，查询所有菜单，并显示成功消息
    ob.then(() => {
      closeDrawer(); // 关闭抽屉
      // 调用queryAllWord函数，用于获取字典数据
      queryAllWord();
      // 根据当前是否有选中的节点来判断具体的查询数据方法
      if (selectedKey.value) {
        // 调用queryDataByParCode函数, 用于获取字典数据
        queryDataByParCode();
      } else {
        // 调用queryData函数, 用于获取字典数据
        queryData();
      }
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
  // 调用queryAllWord函数，用于获取字典数据
  queryAllWord();
  // 调用queryData函数, 用于获取字典数据
  queryData();
});

// endregion
</script>

<template>
  <Page>
    <Space direction="vertical">
      <Card>
        <Form :model="queryParams" layout="inline">
          <!-- 字典编号 -->
          <FormItem
            :label="$t('baseDictionary.wordCode')"
            style="margin-bottom: 1em"
          >
            <Input v-model:value="queryParams.wordCode" />
          </FormItem>

          <!-- 字典名称 -->
          <FormItem
            :label="$t('baseDictionary.wordName')"
            style="margin-bottom: 1em"
          >
            <Input v-model:value="queryParams.wordName" />
          </FormItem>

          <FormItem style="margin-bottom: 1em">
            <Button
              :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
              type="primary"
              @click="
                paging.current = 1;
                queryData();
              "
            >
              {{ $t('common.search') }}
            </Button>
          </FormItem>
        </Form>
      </Card>
      <!-- region 主要内容显示区域 -->
      <Row :gutter="16">
        <!-- region 树形菜单 -->
        <Col :lg="6" :md="9" :sm="9" :xl="6" :xs="6">
          <Card class="h-[60vh] overflow-y-auto">
            <DirectoryTree
              v-model:expanded-keys="expandedKeys"
              v-model:selected-keys="selectedKeys"
              :auto-expand-parent="true"
              :field-names="{
                children: 'children',
                title: 'wordName',
                key: 'wordCode',
              }"
              :tree-data="treeData"
              @select="selectedTree"
            />
          </Card>
        </Col>
        <!-- endregion -->

        <!-- region 表格主体 -->
        <Col :lg="16" :md="15" :sm="15" :xl="18" :xs="18">
          <Card class="h-[60vh] overflow-y-auto">
            <div>
              <Button
                v-if="addButton"
                :disabled="!selectedKey"
                class="mb-4"
                type="primary"
                @click="showAdd"
              >
                {{ $t('common.add') }}
              </Button>
            </div>

            <Table
              :columns="columns"
              :data-source="tableData"
              :loading="tableLoading"
              :pagination="pagination"
              :scroll="scroll"
              bordered
              row-key="id"
              @change="paginationChange"
            >
              <template #bodyCell="{ column, index, record }">
                <template v-if="column.dataIndex === 'step'">
                  <span>{{ index + 1 }}</span>
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
    </Space>

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
        <!-- 字典名称 -->
        <FormItem :label="$t('baseDictionary.wordName')" name="wordName">
          <Input v-model:value="editMessage.wordName" />
        </FormItem>
        <!-- 字典编号 -->
        <FormItem :label="$t('baseDictionary.wordCode')" name="wordCode">
          <Input
            v-model:value="editMessage.wordCode"
            :readonly="!!editMessage.orderNumber"
          />
        </FormItem>
        <!-- 父级字典名称 -->
        <FormItem :label="$t('baseDictionary.parentDictionary')" name="parName">
          <Input v-model:value="editMessage.parName" readonly />
        </FormItem>
        <!-- 描述 -->
        <FormItem :label="$t('sysWebMenu.description')" name="discription">
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
