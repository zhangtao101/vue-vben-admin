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
  Radio,
  RadioGroup,
  Row,
  Space,
  Switch,
  Table,
  Tooltip,
} from 'ant-design-vue';

import {
  addOrganization,
  delOrganization,
  queryOrganization,
  queryOrganizationTree,
  updateOrganization,
  viewOrganizationDetails,
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
    dataIndex: 'orgFullName',
    ellipsis: true,
    title: '组织全称',
    width: 170,
  },
  {
    dataIndex: 'orgType',
    ellipsis: true,
    title: '组织类型',
    width: 100,
  },
  {
    dataIndex: 'orgCode',
    ellipsis: true,
    title: '组织编码',
    width: 60,
  },
  {
    dataIndex: 'orgLevel',
    ellipsis: true,
    title: '组织等级',
    width: 60,
  },
  {
    dataIndex: 'isEnable',
    ellipsis: true,
    title: '是否可用',
    width: 100,
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
  x: 800,
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
      delOrganization(row.id)
        .then(() => {
          // 如果删除操作成功，显示操作成功的提示信息
          message.success($t('common.successfulOperation')); // 成功操作的提示信息（通过国际化处理）

          // 调用queryAllOrganizations函数，用于获取组织数据
          queryAllOrganizations();
          // 根据当前是否有选中的节点来判断具体的查询数据方法
          if (selectedKey.value) {
            // 调用queryDataByParCode函数, 用于获取组织数据
            queryDataByParCode();
          } else {
            // 调用queryData函数, 用于获取组织数据
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
  // 组织编码
  orgCode: '',
  // 组织全称
  orgFullName: '',
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
    // 调用queryDataByParCode函数, 用于获取组织数据
    queryDataByParCode();
  } else {
    // 调用queryData函数, 用于获取组织数据
    queryData();
  }
}

/**
 * 查询数据
 */
function queryData() {
  tableLoading.value = true;
  queryOrganization({
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
 * 根据父级组织编号查询数据
 */
function queryDataByParCode() {
  // 根据选中的菜单代码查询组织数据
  queryOrganization({
    orgParCode: selectedKey.value.orgCode, // 父级编码
    pageNum: paging.value.current, // 当前页码
    pageSize: paging.value.pageSize, // 每页显示的条数
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
 * 查询全部的组织树
 * 这个函数用于从服务器获取所有组织数据，并更新前端的树形数据结构。
 */
function queryAllOrganizations() {
  // 调用queryDictionaryTree API函数，获取菜单列表
  queryOrganizationTree().then((data) => {
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
  if (selected && node.orgLevel < 3) {
    // 更新选中的菜单代码
    selectedKey.value = node;
    // 显示表格加载状态
    tableLoading.value = true;
    // 重置分页到第一页
    paging.value.current = 1;
    // 根据选中的菜单代码查询组织数据
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
  email: [
    {
      trigger: 'change',
      validator: (_rule: Rule, value: string) => {
        if (!value) {
          return Promise.resolve();
        }
        const regex = /^[\w.-]+@[\d.a-z-]+\.[a-z]{2,6}$/i;
        return regex.test(value)
          ? Promise.resolve()
          : Promise.reject($t('ui.fallback.emailError'));
      },
    },
  ],
  fax: [
    {
      trigger: 'change',
      validator: (_rule: Rule, value: string) => {
        if (!value) {
          return Promise.resolve();
        }
        const regex = /^0\d{2,3}-?\d{7,8}(?:-\d{1,4})?$/;
        return regex.test(value)
          ? Promise.resolve()
          : Promise.reject($t('ui.fallback.faxError'));
      },
    },
  ],
  isEnable: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  orgCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  orgFullName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  orgLevel: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  orgParCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  orgType: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  tel: [
    {
      trigger: 'change',
      validator: (_rule: Rule, value: string) => {
        if (!value) {
          return Promise.resolve();
        }
        const regex = /^(?:0\d{2,3}-?)?\d{7,8}(?:-\d{1,4})?$/;
        return regex.test(value)
          ? Promise.resolve()
          : Promise.reject($t('ui.fallback.telError'));
      },
    },
  ],
});

/**
 * 显示编辑界面
 * @param {any} row - 当前行的数据对象，包含需要编辑的数据信息
 */
function showEdit(row: any) {
  // 调用函数获取组织详情
  viewOrganizationDetails(row.id)
    .then((data: any) => {
      // 如果获取详情成功，更新编辑信息并显示编辑抽屉
      editMessage.value = data; // 更新编辑信息
      showDrawer.value = true; // 显示编辑抽屉
    })
    .catch((error) => {
      // 如果获取详情失败，显示操作失败的提示信息
      message.error($t('common.operationFailure')); // 显示通用的错误提示信息（通过国际化处理）
      message.error(error.msg); // 显示从服务器返回的具体错误消息
    });
}

/**
 * 显示添加新记录的界面
 */
function showAdd() {
  // 设置新增记录的初始值
  editMessage.value = {
    // 设置组织级别为当前选中组织的级别加1
    orgLevel: selectedKey.value.orgLevel + 1,
    // 设置父级组织代码为当前选中组织的代码
    orgParCode: selectedKey.value.orgCode,
    // 设置父级组织全称
    orgParFullName: selectedKey.value.orgFullName,
  };
  // 显示添加抽屉
  showDrawer.value = true;
}

/**
 * 表单提交
 * 这个函数用于处理表单的提交逻辑。
 */
function editSubmit() {
  // 验证表单值，返回一个Promise对象
  editForm.value
    .validate()
    .then(() => {
      const params = {
        ...editMessage.value,
      };
      // 检查editMessage对象中是否存在code字段
      // 如果存在，则调用 updateOrganization 函数进行更新操作
      // 如果不存在，则调用 addOrganization 函数进行创建操作
      const ob = editMessage.value.id
        ? updateOrganization(params)
        : addOrganization(params);
      // 当操作成功时，关闭抽屉，查询所有菜单，并显示成功消息
      ob.then(() => {
        closeDrawer(); // 关闭抽屉
        // 调用queryAllOrganizations函数，用于获取组织数据
        queryAllOrganizations();
        // 根据当前是否有选中的节点来判断具体的查询数据方法
        if (selectedKey.value) {
          // 调用queryDataByParCode函数, 用于获取组织数据
          queryDataByParCode();
        } else {
          // 调用queryData函数, 用于获取组织数据
          queryData();
        }
        message.success($t('common.successfulOperation')); // 显示操作成功的提示信息
      }).catch((error) => {
        // 如果操作失败，则显示错误提示
        message.error($t('common.operationFailure')); // 显示操作失败的提示信息
        // 如果有具体的错误信息，则一并显示
        message.error(error.msg);
      });
    })
    .catch((error: any) => {
      console.error('error', error);
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
  // 调用queryAllOrganizations函数，用于获取组织数据
  queryAllOrganizations();
  // 调用queryData函数, 用于获取组织数据
  queryData();
});

// endregion
</script>

<template>
  <Page>
    <Space direction="vertical">
      <Card>
        <Form :model="queryParams" layout="inline">
          <!-- 组织全称 -->
          <FormItem
            :label="$t('system.baseOrganization.fullNameOfOrganization')"
            style="margin-bottom: 1em"
          >
            <Input v-model:value="queryParams.orgFullName" />
          </FormItem>

          <!-- 组织编码 -->
          <FormItem
            :label="$t('system.baseOrganization.tissueCoding')"
            style="margin-bottom: 1em"
          >
            <Input v-model:value="queryParams.orgCode" />
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
                title: 'orgFullName',
                key: 'orgCode',
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

                <!-- 状态 -->
                <template v-else-if="column.dataIndex === 'isEnable'">
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
        <!-- 组织全称 -->
        <FormItem
          :label="$t('system.baseOrganization.fullNameOfOrganization')"
          name="orgFullName"
        >
          <Input v-model:value="editMessage.orgFullName" />
        </FormItem>
        <!-- 组织简称 -->
        <FormItem
          :label="$t('system.baseOrganization.organizationAbbreviation')"
          name="orgShortName"
        >
          <Input v-model:value="editMessage.orgShortName" />
        </FormItem>
        <!-- 组织类型 -->
        <FormItem :label="$t('system.baseOrganization.tissueType')" name="orgType">
          <RadioGroup v-model:value="editMessage.orgType" name="orgType">
            <Radio value="公司">公司</Radio>
            <Radio value="部门">部门</Radio>
          </RadioGroup>
        </FormItem>
        <!-- 组织编码 -->
        <FormItem :label="$t('system.baseOrganization.tissueCoding')" name="orgCode">
          <Input v-model:value="editMessage.orgCode" />
        </FormItem>
        <!-- 上级组织 -->
        <FormItem
          :label="$t('system.baseOrganization.superiorOrganization')"
          name="orgParFullName"
        >
          <Input v-model:value="editMessage.orgParFullName" readonly />
        </FormItem>
        <!-- 组织等级 -->
        <FormItem
          :label="$t('system.baseOrganization.organizationalHierarchy')"
          name="orgLevel"
        >
          <Input v-model:value="editMessage.orgLevel" readonly />
        </FormItem>
        <!-- 负责人 -->
        <FormItem :label="$t('system.baseOrganization.personInCharge')" name="charge">
          <Input v-model:value="editMessage.charge" />
        </FormItem>
        <!-- 座机号码 -->
        <FormItem :label="$t('system.baseOrganization.landlineNumber')" name="tel">
          <Input v-model:value="editMessage.tel" />
        </FormItem>
        <!-- 联系地址 -->
        <FormItem :label="$t('system.baseOrganization.contactAddress')" name="address">
          <Input v-model:value="editMessage.address" />
        </FormItem>
        <!-- 传真 -->
        <FormItem :label="$t('system.baseOrganization.fax')" name="fax">
          <Input v-model:value="editMessage.fax" />
        </FormItem>
        <!-- 邮箱 -->
        <FormItem :label="$t('system.baseOrganization.email')" name="email">
          <Input v-model:value="editMessage.email" />
        </FormItem>
        <!-- 是否可用 -->
        <FormItem :label="$t('system.baseOrganization.status')" name="isEnable">
          <RadioGroup v-model:value="editMessage.isEnable" name="statusGroup">
            <Radio :value="1">启用</Radio>
            <Radio :value="0">停用</Radio>
          </RadioGroup>
        </FormItem>
        <!-- 描述 -->
        <FormItem
          :label="$t('system.baseOrganization.description')"
          name="discription"
        >
          <Input v-model:value="editMessage.discription" />
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
