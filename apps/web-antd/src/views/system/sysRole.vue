<script lang="ts" setup>
import { computed, h, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import {
  MaterialSymbolsDeleteOutline,
  MaterialSymbolsSearch,
  MingcuteEditLine,
  PhEyeLight,
  SystemUiconsSettings,
} from '@vben/icons';

import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Radio,
  RadioGroup,
  Space,
  Switch,
  Table,
  Textarea,
  Tooltip,
  Tree,
} from 'ant-design-vue';

import {
  createRole,
  deleteRoleById,
  fetchPda,
  fetchWeb,
  getRoles,
  updateRole,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格操作

// 表格列名
const columns = ref([
  {
    dataIndex: 'step',
    ellipsis: true,
    title: '#',
    width: 20,
  },
  {
    dataIndex: 'roleCode',
    ellipsis: true,
    title: '角色编码',
    width: 60,
  },
  {
    dataIndex: 'roleName',
    ellipsis: true,
    title: '角色名称',
    width: 70,
  },
  {
    dataIndex: 'isEnable',
    ellipsis: true,
    title: '状态',
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
] as any[]);
// 表格滚动信息配置
const scroll = ref({
  scrollToFirstRowOnChange: true,
  x: 800,
  y: 350,
});

// 表格数据
const data = ref();

// 分页信息
const paging = ref({
  current: 1,
  pageSize: 20,
  total: 200,
});
// 表格分页信息
const pagination = computed<any>(() => paging);

/**
 * 分页信息改变事件
 */
function paginationChange(page: any) {
  paging.value.current = page.current;
  paging.value.pageSize = page.pageSize;

  queryData();
}

// region 查看

// 当前选中的表格行
const checkedRow = ref<any>({});
// 是否显示查看详情抽屉
const showViewDrawer = ref(false);
// 是否显示编辑抽屉
const showEditDrawer = ref(false);

// 抽屉冲的form表单对象
const editForm = ref();
// form表单规则验证
const editRules = ref<any>({
  isEnable: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  perName_workNumber: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  userName: [{ message: '此项为必填项', required: true, trigger: 'change' }],
});

/**
 * 查看行详情
 * @param row 表格行数据
 */
function viewRow(row: any) {
  checkedRow.value = row;
  showViewDrawer.value = true;
}

/**
 * 显示是编辑抽屉
 * @param row 表格行数据
 */
function editRow(row?: any) {
  checkedRow.value = row
    ? {
        ...row,
        perName_workNumber: `${row.perName}-${row.workNumber}`,
      }
    : {};
  showEditDrawer.value = true;
}

/**
 * 删除数据
 * @param row
 */
function delRow(row: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      message.warning('已取消删除!');
    },
    onOk() {
      deleteRoleById(row.id)
        .then(() => {
          // 显示操作成功的提示信息
          message.success($t('common.successfulOperation'));
          queryData();
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

// region web权限配置

// web权限配置抽屉是否显示
const webPermissionConfiguration = ref(false);
// web权限数据
const webPermission = ref<any[]>([{ childrens: [], code: '', name: 'root' }]);
// 选中的web权限列表
const selectedWebPermissionCodes = ref<string[]>([]);
// web权限加载情况
const webLoading = ref(false);

/**
 * 显示Web权限配置
 */
function showWebPermissionsConfiguration() {
  // 检查是否没有任何选中的Web权限代码
  if (selectedWebPermissionCodes.value.length === 0) {
    let code = ''; // 初始化变量code用于存储角色代码
    // 检查是否有选中的行，并且行数据中包含角色代码
    if (checkedRow.value && checkedRow.value.roleCode) {
      // 如果有角色代码，则调用查询Web权限的函数
      code = checkedRow.value.roleCode; // 获取角色代码
    }
    // 使用获取到的角色代码查询Web权限
    queryWebPermissions(code);
  } else {
    // 如果已经有选中的Web权限代码，则更新配置状态为true
    webPermissionConfiguration.value = true;
  }
}

/**
 * 查询Web权限
 * @param {string} roleCode - 角色代码，用于查询对应的Web权限
 */
function queryWebPermissions(roleCode: string = '') {
  webLoading.value = true;
  // 发起请求，获取Web权限数据
  fetchWeb({
    roleCode, // 传递角色代码
  })
    .then(({ codes, purviewDtos }) => {
      // 如果请求成功，更新Web权限数据和选中的权限代码
      webPermission.value[0].childrens = purviewDtos; // 更新Web权限数据
      selectedWebPermissionCodes.value = codes; // 更新选中的权限代码
      webPermissionConfiguration.value = true; // 显示web权限配置抽屉
    })
    .catch((error) => {
      // 如果请求失败，显示操作失败的提示信息
      message.error($t('common.operationFailure')); // 显示通用的错误提示信息（通过国际化处理）
      // 显示具体的错误信息
      message.error(error); // 显示从服务器返回的具体错误信息
    })
    .finally(() => {
      webLoading.value = false;
    });
}

// endregion

// region pda权限配置

// pda权限数据
const pdaPermission = ref<any[]>([{ childrens: [], code: '', name: 'root' }]);
// 选中的pda权限列表
const selectedPdaPermissionCodes = ref<string[]>([]);
// pda权限抽屉是否显示
const pdaPermissionConfiguration = ref(false);
// pda加载情况
const pdaLoading = ref(false);
/**
 * 显示PDA权限配置
 */
function showPdaPermissionsConfiguration() {
  // 检查是否没有任何选中的PDA权限代码
  if (selectedPdaPermissionCodes.value.length === 0) {
    let code = ''; // 初始化变量code用于存储角色代码
    // 检查是否有选中的行，并且行数据中包含角色代码
    if (checkedRow.value && checkedRow.value.roleCode) {
      // 如果有角色代码，则使用角色代码
      code = checkedRow.value.roleCode; // 获取角色代码
    }
    // 使用获取到的角色代码查询PDA权限
    queryPdaPermissions(code);
  } else {
    // 如果已经有选中的PDA权限代码，则更新配置状态为true
    pdaPermissionConfiguration.value = true;
  }
}

/**
 * 查询PDA权限
 * @param {string} roleCode - 角色代码，用于查询对应的PDA权限
 */
function queryPdaPermissions(roleCode: string) {
  pdaLoading.value = true;
  // 发起请求，获取PDA权限数据
  fetchPda({
    roleCode, // 传递角色代码
  })
    .then(({ codes, purviewDtos }) => {
      // 如果请求成功，更新PDA权限数据和选中的权限代码
      pdaPermission.value[0].childrens = purviewDtos; // 更新PDA权限数据
      selectedPdaPermissionCodes.value = codes; // 更新选中的权限代码
      pdaPermissionConfiguration.value = true; // 显示pda权限配置抽屉
    })
    .catch((error) => {
      // 如果请求失败，显示操作失败的提示信息
      message.error($t('common.operationFailure')); // 显示通用的错误提示信息（通过国际化处理）
      // 显示具体的错误信息
      message.error(error); // 显示从服务器返回的具体错误信息
    })
    .finally(() => {
      pdaLoading.value = false;
    });
}

// endregion

// region 新增/ 编辑

/**
 * 表单提交
 */
/**
 * 提交表单并处理响应
 */
function submit() {
  // 验证表单
  editForm.value.validate().then(() => {
    // 构建提交参数
    const params = {
      ...checkedRow.value, // 展开已选行的数据
      acode: [], // 初始化权限代码数组
      code: checkedRow.value.roleCode, // 角色代码
      name: checkedRow.value.roleName, // 角色名称
      pcode: selectedPdaPermissionCodes.value, // PDA权限代码
      wcode: selectedWebPermissionCodes.value, // Web权限代码
    };
    // 如果PDA权限代码数组的第一个元素是空字符串，则移除它
    if (params.pcode[0] === '') {
      params.pcode.shift();
    }
    // 如果Web权限代码数组的第一个元素是空字符串，则移除它
    if (params.wcode[0] === '') {
      params.wcode.shift();
    }
    // 根据是否有ID来决定是更新角色还是创建新角色
    const ob = checkedRow.value.id
      ? updateRole({ ...params, webStatus: true }) // 更新角色并设置webStatus为true
      : createRole({ ...params, webStatus: false }); // 创建角色并设置webStatus为false
    // 发起请求
    ob.then(() => {
      // 如果请求成功，查询用户数据
      queryData();
      // 显示成功提示信息
      message.success($t('common.successfulOperation'));
      // 关闭表单
      onClose();
    }).catch((error) => {
      // 如果请求失败，显示操作失败的提示信息
      message.error($t('common.operationFailure')); // 显示通用的错误提示信息
      // 显示具体的错误信息
      message.error(error); // 显示从服务器返回的具体错误信息
    });
  });
}

// endregion

/**
 * 关闭编辑抽屉
 */
function onClose() {
  checkedRow.value = {};
  showViewDrawer.value = false;
  showEditDrawer.value = false;
  selectedWebPermissionCodes.value = [];
  selectedPdaPermissionCodes.value = [];
}

// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 关联人员
  perName: '',
  // 用户名
  username: '',
});

// 表格加载状态
const tableLoading = ref(false);

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取角色列表数据，并更新前端的数据显示和分页信息。
 */
function queryData() {
  tableLoading.value = true;
  // 调用getRoles API函数，传递查询参数和分页信息
  getRoles({
    ...queryParams.value, // 展开queryParams.value中的所有查询参数
    pageNum: paging.value.current, // 当前页码
    pageSize: paging.value.pageSize, // 每页显示的数据条数
  })
    .then(({ total, list }) => {
      // 成功获取数据后，更新数据列表和总条数
      data.value = list; // 更新数据列表
      paging.value.total = total; // 更新总条数
    })
    .catch((error) => {
      // 如果请求失败，显示操作失败的提示信息
      message.error($t('common.operationFailure')); // 显示通用的错误提示信息
      // 显示具体的错误信息
      message.error(error); // 显示从服务器返回的具体错误信息
    })
    .finally(() => {
      tableLoading.value = false;
    });
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
  },
);

// endregion

// region 初始化

onMounted(() => {
  // 查询角色数据
  queryData();
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 用户名 -->
        <FormItem :label="$t('sysUser.username')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.username" />
        </FormItem>

        <!-- 关联人员 -->
        <FormItem :label="$t('sysUser.perName')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.perName" />
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
    <!-- endregion -->

    <!-- region 表格主体 -->
    <Card>
      <div>
        <!-- 新增按钮 -->
        <Button v-if="addButton" class="mb-4" type="primary" @click="editRow()">
          {{ $t('common.add') }}
        </Button>
      </div>

      <Table
        :columns="columns"
        :data-source="data"
        :loading="tableLoading"
        :pagination="pagination"
        :scroll="scroll"
        bordered
        @change="paginationChange"
      >
        <template #bodyCell="{ column, index, record }">
          <template v-if="column.dataIndex === 'step'">
            <span>{{ index + 1 }}</span>
          </template>
          <!-- 状态 -->
          <template v-if="column.dataIndex === 'isEnable'">
            <Switch
              v-model:checked="record.isEnable"
              :checked-children="$t('status.enable')"
              :checked-value="1"
              :un-checked-children="$t('status.forbidden')"
              disabled
            />
          </template>
          <!-- 显示角色名列表 -->
          <template v-if="column.dataIndex === 'roleNames'">
            <span>{{ record.roleNames.toString() }}</span>
          </template>

          <template v-else-if="column.dataIndex === 'operation'">
            <!-- 查看详情 -->
            <Tooltip>
              <template #title>{{ $t('common.view') }}</template>
              <Button
                :icon="h(PhEyeLight, { class: 'inline-block size-6' })"
                class="mr-4"
                type="link"
                @click="viewRow(record)"
              />
            </Tooltip>
            <!-- 编辑按钮 -->
            <Tooltip>
              <template #title>{{ $t('common.edit') }}</template>
              <Button
                v-if="editButton"
                :icon="h(MingcuteEditLine, { class: 'inline-block size-6' })"
                class="mr-4"
                type="link"
                @click="editRow(record)"
              />
            </Tooltip>

            <!-- 删除数据 -->
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
                @click="delRow(record)"
              />
            </Tooltip>
          </template>
        </template>
      </Table>
    </Card>
    <!-- endregion -->

    <!-- region 查看详情抽屉 -->
    <Drawer
      v-model:open="showViewDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="600"
      class="custom-class"
      placement="right"
      title="查看详情"
    >
      <Descriptions :column="2" bordered title="用户详情">
        <DescriptionsItem label="角色编码">
          {{ checkedRow.roleCode }}
        </DescriptionsItem>
        <DescriptionsItem label="角色名称">
          {{ checkedRow.roleName }}
        </DescriptionsItem>
        <DescriptionsItem :span="2" label="状态">
          {{ checkedRow.isEnable ? '启用' : '禁用' }}
        </DescriptionsItem>
        <DescriptionsItem :span="2" label="描述">
          {{ checkedRow.discription }}
        </DescriptionsItem>
      </Descriptions>
    </Drawer>
    <!-- endregion -->

    <!-- region 新增/编辑 抽屉 -->
    <Drawer
      v-model:open="showEditDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="400"
      class="custom-class"
      placement="right"
      title="信息编辑"
      @close="onClose"
    >
      <Form
        ref="editForm"
        :label-col="{ span: 8 }"
        :model="checkedRow"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        name="editMessageForm"
      >
        <!-- 角色编码 -->
        <FormItem :label="$t('sysRole.roleCode')" name="roleCode">
          <Input
            v-model:value="checkedRow.roleCode"
            disabled
            placeholder="自动生成"
          />
        </FormItem>
        <!-- 角色名称 -->
        <FormItem :label="$t('sysRole.roleName')" name="roleName">
          <Input v-model:value="checkedRow.roleName" />
        </FormItem>
        <!-- 状态 -->
        <FormItem :label="$t('sysRole.isEnable')" name="isEnable">
          <RadioGroup v-model:value="checkedRow.isEnable">
            <Radio :value="1">启用</Radio>
            <Radio :value="0">禁用</Radio>
          </RadioGroup>
        </FormItem>
        <!-- 用户描述 -->
        <FormItem :label="$t('sysRole.description')" name="discription">
          <Textarea v-model:value="checkedRow.discription" />
        </FormItem>
        <!-- web角色权限配置 -->
        <FormItem :label="$t('sysRole.webRolePermissions')">
          <!-- 权限配置按钮 -->
          <Button
            :icon="
              h(SystemUiconsSettings, {
                class: 'inline-block size-4 align-top mt-[3px]',
              })
            "
            :loading="webLoading"
            type="primary"
            @click="showWebPermissionsConfiguration"
          >
            {{ $t('sysRole.permissionConfiguration') }}
          </Button>
        </FormItem>
        <!-- pda权限角色配置 -->
        <FormItem :label="$t('sysRole.pdaRolePermissions')">
          <!-- 权限配置按钮 -->
          <Button
            :icon="
              h(SystemUiconsSettings, {
                class: 'inline-block size-4 align-top mt-[3px]',
              })
            "
            :loading="pdaLoading"
            type="primary"
            @click="showPdaPermissionsConfiguration"
          >
            {{ $t('sysRole.permissionConfiguration') }}
          </Button>
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="onClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="submit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
      <!-- region web权限配置 -->
      <Drawer
        v-model:open="webPermissionConfiguration"
        :footer-style="{ textAlign: 'right' }"
        :width="300"
        class="custom-class"
        placement="right"
        title="web权限配置"
      >
        <Tree
          v-model:checked-keys="selectedWebPermissionCodes"
          :auto-expand-parent="true"
          :field-names="{ children: 'childrens', title: 'name', key: 'code' }"
          :tree-data="webPermission"
          checkable
        />
      </Drawer>
      <!-- endregion -->

      <!-- region pda权限配置 -->
      <Drawer
        v-model:open="pdaPermissionConfiguration"
        :footer-style="{ textAlign: 'right' }"
        :width="300"
        class="custom-class"
        placement="right"
        title="pda权限配置"
      >
        <Tree
          v-model:checked-keys="selectedPdaPermissionCodes"
          :auto-expand-parent="true"
          :field-names="{ children: 'childrens', title: 'name', key: 'code' }"
          :tree-data="pdaPermission"
          checkable
        />
      </Drawer>
      <!-- endregion -->
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
