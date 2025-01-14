<script lang="ts" setup>
import type { Rule } from 'ant-design-vue/es/form';

import { computed, h, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import {
  MaterialSymbolsDeleteOutline,
  MaterialSymbolsSearch,
  MingcuteEditLine,
} from '@vben/icons';

import {
  Button,
  Card,
  Col,
  DirectoryTree,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  RadioGroup,
  Row,
  Segmented,
  Select,
  Space,
  Switch,
  Table,
  Textarea,
  Tooltip,
  TreeSelect,
} from 'ant-design-vue';

import {
  addSysPerson,
  delSysPerson,
  getMenusWeb,
  listSysPerson,
  listSysStation,
  queryOrganizationTree,
  querySysPersonDetails,
  updateSysPerson,
  workNumberCheck,
} from '#/api';
import { $t } from '#/locales';

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
    width: 40,
  },
  {
    dataIndex: 'perName',
    ellipsis: true,
    title: '姓名',
    width: 70,
  },
  {
    dataIndex: 'workNumber',
    ellipsis: true,
    title: '工号',
    width: 80,
  },
  {
    dataIndex: 'rfid',
    ellipsis: true,
    title: 'rfid号',
    width: 60,
  },
  {
    dataIndex: 'phoneNumber',
    ellipsis: true,
    title: '手机号码',
    width: 80,
  },
  {
    dataIndex: 'stationName',
    ellipsis: true,
    title: '岗位名称',
    width: 90,
  },
  {
    dataIndex: 'email',
    ellipsis: true,
    title: '邮箱',
    width: 60,
  },
  {
    dataIndex: 'isOnDuty',
    ellipsis: true,
    title: '是否在职',
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
      delSysPerson(row.id)
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
  // 姓名
  perName: '',
  // 岗位名称
  stationName: '',
  // 工号
  workNumber: '',
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
  listSysPerson({
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
  listSysPerson({
    orgCode: selectedKey.value.orgCode, // 父级编码
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

/**
 * 查询权限
 * 这个函数用于查询当前页面的权限设置，并将权限名称存储在响应式引用author中。
 */
function queryAuth() {
  // 调用getMenusWeb API函数，传递menuCode和type参数
  getMenusWeb({
    menuCode: route.meta.code as string, // 从路由元信息中获取menuCode，并确保其为字符串类型
    type: 'web', // 指定查询的类型为'web'
  }).then((data) => {
    // 检查返回的数据是否存在且不为空数组
    if (!data || data.length === 0) return;

    // 遍历返回的数据
    for (const item of data) {
      // 将每个权限项的buttonName添加到author数组中
      author.value.push(item.buttonName);
    }
  });
}

// 监听权限变化, 变更按钮的显示情况
watch(author.value, () => {
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
});

// endregion

// region 新增/ 编辑 抽屉
// 是否显示 新增/编辑 抽屉
const showDrawer = ref(false);
// 抽屉中的form表单数据
const editMessage = ref<any>({
  highestEducation: '小学',
});
// 抽屉冲的form表单对象
const editForm = ref();
// 教育等级列表
const educationList = reactive([
  '小学',
  '初中',
  '高中',
  '大专',
  '本科',
  '硕士',
  '博士',
]);

// form表单规则验证
const editRules = ref<any>({
  email: [
    {
      trigger: 'change',
      validator: (_rule: Rule, value: string) => {
        if (value) {
          const regex = /^[\w.-]+@[\d.a-z-]+\.[a-z]{2,6}$/i;
          return regex.test(value)
            ? Promise.resolve()
            : Promise.reject($t('fallback.emailError'));
        } else {
          return Promise.resolve();
        }
      },
    },
  ],
  idCard: [
    {
      trigger: 'change',
      validator: (_rule: Rule, value: string) => {
        if (value) {
          const regex =
            /^[1-9]\d{5}(?:18|19|20)?\d{2}(?:0[1-9]|1[0-2])(?:[0-2][1-9]|10|20|30|31)\d{3}[\dx]$/i;
          return regex.test(value)
            ? Promise.resolve()
            : Promise.reject($t('fallback.idCardError'));
        } else {
          return Promise.resolve();
        }
      },
    },
  ],
  isOnDuty: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  orgCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  perName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  phoneNumber: [
    {
      trigger: 'change',
      validator: (_rule: Rule, value: string) => {
        if (value) {
          const regex = /^1(?:[358]\d|4[579]|66|7[0135-8]|9[89])\d{8}$/;
          return regex.test(value)
            ? Promise.resolve()
            : Promise.reject($t('fallback.phoneNumberError'));
        } else {
          return Promise.resolve();
        }
      },
    },
  ],
  shortNumber: [
    {
      trigger: 'change',
      validator: (_rule: Rule, value: string) => {
        if (value) {
          const regex = /^[6-9]\d{2,5}$/;
          return regex.test(value)
            ? Promise.resolve()
            : Promise.reject($t('fallback.shortError'));
        } else {
          return Promise.resolve();
        }
      },
    },
  ],
  stationCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  teleNumber: [
    {
      trigger: 'change',
      validator: (_rule: Rule, value: string) => {
        if (value) {
          const regex = /^(?:0\d{2,3}-)?\d{7,8}$/;
          return regex.test(value)
            ? Promise.resolve()
            : Promise.reject($t('fallback.telError'));
        } else {
          return Promise.resolve();
        }
      },
    },
  ],
  workNumber: [
    { message: '此项为必填项', required: true, trigger: 'change' },
    {
      trigger: 'change',
      validator: (_rule: Rule, value: string) => {
        // 如果用户输入了工作编号（value不为空），则进行异步验证
        return value
          ? workNumberCheck(value).then((data) =>
              // 如果服务端返回的数据大于0，表示工作编号已存在，拒绝Promise并返回错误信息
              data > 0
                ? Promise.reject($t('fallback.workNumberError'))
                : // 否则，工作编号不存在或验证通过，解决Promise
                  Promise.resolve(''),
            )
          : // 如果用户没有输入工作编号（value为空），直接解决Promise，不进行验证
            Promise.resolve('');
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
  querySysPersonDetails(row.id)
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
    highestEducation: '小学',
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
        ? updateSysPerson(params)
        : addSysPerson(params);
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

// region 岗位

// 岗位列表
const stationList = ref<any[]>([]);

/**
 * 查询岗位信息的函数。
 * 该函数通过调用listSysStation方法，获取所有岗位信息，并将结果存储在stationList.value中。
 */
function queryStations() {
  // 调用listSysStation方法，请求第一页数据，每页显示9999条记录
  listSysStation({
    pageNum: 1, // 当前页码，从1开始
    pageSize: 9999, // 每页显示的记录数，这里设置为9999，意味着尽可能获取所有数据
  }).then(({ list }) => {
    // 当请求成功返回后，将返回的岗位列表赋值给stationList.value
    // 这里的stationList.value可能是指一个响应式变量，用于存储岗位信息列表
    stationList.value = list;
  });
}

/**
 * 过滤选项的函数。
 * 该函数根据输入的字符串和选项对象，检查选项的名称是否包含输入的字符串。
 * @param {string} input - 用户输入的字符串，用于过滤选项。
 * @param {any} option - 待过滤的选项对象，期望该对象有一个staName属性。
 * @returns {boolean} - 如果选项的名称包含输入的字符串，则返回true，否则返回false。
 */
function filterOption(input: string, option: any) {
  // 将输入字符串和选项的名称都转换为小写，以实现不区分大小写的比较
  return option.staName.toLowerCase().includes(input.toLowerCase());
}

// endregion

// region 初始化

// 当组件挂载到DOM上后，立即执行的函数
onMounted(() => {
  // 调用queryAuth函数，用于获取用户权限信息
  queryAuth();
  // 调用queryAllOrganizations函数，用于获取组织数据
  queryAllOrganizations();
  // 调用queryData函数, 用于获取用户数据
  queryData();
  // 调用queryStations函数, 用于获取岗位数据
  queryStations();
});

// endregion
</script>

<template>
  <Page>
    <Space direction="vertical">
      <Card>
        <Form :model="queryParams" layout="inline">
          <!-- 姓名 -->
          <FormItem :label="$t('baseStaff.name')" style="margin-bottom: 1em">
            <Input v-model:value="queryParams.perName" />
          </FormItem>
          <!-- 工号 -->
          <FormItem
            :label="$t('baseStaff.workNumber')"
            style="margin-bottom: 1em"
          >
            <Input v-model:value="queryParams.workNumber" />
          </FormItem>
          <!-- 岗位名称 -->
          <FormItem
            :label="$t('baseStaff.jobTitle')"
            style="margin-bottom: 1em"
          >
            <Input v-model:value="queryParams.stationName" />
          </FormItem>

          <FormItem style="margin-bottom: 1em">
            <Button
              :icon="h(MaterialSymbolsSearch, { class: 'inline-block mr-2' })"
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
                <template v-else-if="column.dataIndex === 'isOnDuty'">
                  <Switch
                    v-model:checked="record.isOnDuty"
                    :checked-children="$t('status.onTheJob')"
                    :checked-value="1"
                    :un-checked-children="$t('status.leavingJob')"
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
                          h(MingcuteEditLine, { class: 'inline-block size-6' })
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
                          h(MaterialSymbolsDeleteOutline, {
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
        <!-- 姓名 -->
        <FormItem :label="$t('baseStaff.name')" name="perName">
          <Input
            v-model:value="editMessage.perName"
            :disabled="!!editMessage.id"
          />
        </FormItem>
        <!-- 工号 -->
        <FormItem :label="$t('baseStaff.workNumber')" name="workNumber">
          <Input
            v-model:value="editMessage.workNumber"
            :disabled="!!editMessage.id"
          />
        </FormItem>
        <!-- rfid号 -->
        <FormItem :label="$t('baseStaff.rfid')" name="rfid">
          <Input v-model:value="editMessage.rfid" />
        </FormItem>
        <!-- 性别 -->
        <FormItem :label="$t('baseStaff.sex')" name="sex">
          <RadioGroup v-model:value="editMessage.sex">
            <Radio value="男">{{ $t('status.male') }}</Radio>
            <Radio value="女">{{ $t('status.female') }}</Radio>
          </RadioGroup>
        </FormItem>
        <!-- 手机号码 -->
        <FormItem :label="$t('baseStaff.phoneNumber')" name="phoneNumber">
          <Input v-model:value="editMessage.phoneNumber" />
        </FormItem>
        <!-- 座机号码 -->
        <FormItem :label="$t('baseStaff.landlineNumber')" name="teleNumber">
          <Input v-model:value="editMessage.teleNumber" />
        </FormItem>
        <!-- 手机短号 -->
        <FormItem :label="$t('baseStaff.shortNumber')" name="shortNumber">
          <Input v-model:value="editMessage.shortNumber" />
        </FormItem>
        <!-- 邮箱 -->
        <FormItem :label="$t('baseStaff.email')" name="email">
          <Input v-model:value="editMessage.email" />
        </FormItem>

        <!-- 员工类型 -->
        <FormItem :label="$t('baseStaff.employeeType')" name="employeeType">
          <RadioGroup v-model:value="editMessage.employeeType">
            <Radio value="正式员工">{{ $t('status.regularEmployee') }}</Radio>
            <Radio value="外包员工">{{ $t('status.outsourcedStaff') }}</Radio>
          </RadioGroup>
        </FormItem>
        <!-- 身份证号 -->
        <FormItem :label="$t('baseStaff.idCard')" name="idCard">
          <Input v-model:value="editMessage.idCard" />
        </FormItem>
        <!-- 身高 -->
        <FormItem :label="$t('baseStaff.height')" name="height">
          <InputNumber v-model:value="editMessage.height" />
          <span class="ml-4 align-top leading-8">CM</span>
        </FormItem>
        <!-- 年龄 -->
        <FormItem :label="$t('baseStaff.age')" name="age">
          <InputNumber v-model:value="editMessage.age" :max="99" :min="18" />
        </FormItem>
        <!-- 婚姻状况 -->
        <FormItem :label="$t('baseStaff.maritalStatus')" name="maritalStatus">
          <RadioGroup v-model:value="editMessage.maritalStatus">
            <Radio value="未婚">{{ $t('status.unmarried') }}</Radio>
            <Radio value="已婚">{{ $t('status.beMarried') }}</Radio>
          </RadioGroup>
        </FormItem>
        <!-- 健康状况 -->
        <FormItem :label="$t('baseStaff.healthStatus')" name="healthStatus">
          <RadioGroup v-model:value="editMessage.healthStatus">
            <Radio value="良好">{{ $t('status.good') }}</Radio>
            <Radio value="疾病">{{ $t('status.illness') }}</Radio>
          </RadioGroup>
        </FormItem>
        <!-- 政治面貌 -->
        <FormItem
          :label="$t('baseStaff.politicalOutlook')"
          name="politicalOutlook"
        >
          <RadioGroup v-model:value="editMessage.politicalOutlook">
            <Radio value="群众">{{ $t('status.mob') }}</Radio>
            <Radio value="团员">{{ $t('status.member') }}</Radio>
            <Radio value="党员">{{ $t('status.partyMember') }}</Radio>
          </RadioGroup>
        </FormItem>
        <!-- 最高学历 -->
        <FormItem
          :label="$t('baseStaff.highestEducation')"
          name="highestEducation"
        >
          <Segmented
            v-model:value="editMessage.highestEducation"
            :options="educationList"
          />
        </FormItem>
        <!-- 是否在职 -->
        <FormItem :label="$t('baseStaff.isOnDuty')" name="isOnDuty">
          <RadioGroup v-model:value="editMessage.isOnDuty">
            <Radio :value="1">{{ $t('status.yes') }}</Radio>
            <Radio :value="0">{{ $t('status.no') }}</Radio>
          </RadioGroup>
        </FormItem>
        <!-- 岗位名称 -->
        <FormItem :label="$t('baseStaff.jobTitle')" name="stationCode">
          <Select
            v-model:value="editMessage.stationCode"
            :field-names="{ label: 'staName', value: 'staCode' }"
            :filter-option="filterOption"
            :options="stationList"
            allow-clear
            placeholder="输入关键字进行查询"
            show-search
            style="width: 200px"
          />
        </FormItem>
        <!-- 所属组织 -->
        <FormItem
          :label="$t('baseStaff.affiliatedOrganization')"
          name="orgCode"
        >
          <!--treeData          -->
          <TreeSelect
            v-model:value="editMessage.orgCode"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            :field-names="{
              children: 'children',
              label: 'orgFullName',
              value: 'orgCode',
            }"
            :tree-data="treeData"
            allow-clear
            show-search
            style="width: 200px"
            tree-default-expand-all
            tree-node-filter-prop="label"
          />
        </FormItem>
        <!-- 人员描述 -->
        <FormItem :label="$t('baseStaff.description')" name="discription">
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
