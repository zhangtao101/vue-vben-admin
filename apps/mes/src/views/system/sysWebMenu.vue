<script lang="ts" setup>
import type { TreeProps } from 'ant-design-vue';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiEditOutline, MdiLightDelete } from '@vben/icons';
import { $t } from '@vben/locales';

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
  Textarea,
  Tooltip,
  Tree,
  TreeSelect,
} from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { difference } from 'lodash-es';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  changeOrderWeb,
  createArticleWeb,
  deleteBtnById,
  getMenusWebList,
  updateArticleWeb,
} from '#/api';
import { flattenTree, queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格操作

// 表格数据
const tableData = ref<any[]>([]);

/**
 * VXE表格配置
 */
const gridOptions: VxeGridProps<any> = reactive({
  align: 'center',
  border: true,
  rowConfig: {
    drag: true,
  },
  columns: [
    { type: 'seq', title: '#', width: 60 },
    { field: 'name', title: '菜单名称', minWidth: 150, dragSort: false },
    { field: 'url', title: 'url', minWidth: 200 },
    {
      field: 'isEnable',
      title: '是否启用',
      width: 100,
      slots: { default: 'isEnable_default' },
    },
    {
      field: 'operation',
      title: '操作',
      width: 120,
      fixed: 'right',
      slots: { default: 'operation_default' },
    },
  ],
  data: [],
  pagerConfig: {
    enabled: false,
  },
  height: 450,
  stripe: true,
  scrollY: {
    enabled: true,
  },
});

const gridEvents: any = {
  rowDragend: () => {
    changeSort();
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions, gridEvents });

/**
 * 设置表格数据
 * @param data
 */
function setTableData(data: any) {
  tableData.value = data || [];
  gridApi.grid.reloadData(data || []);
}

/**
 * 表格排序变更
 */
function changeSort() {
  const menuCodes: any[] = [];
  const data = gridApi.grid.getTableData().tableData || [];
  data.forEach((item: any) => {
    menuCodes.push({
      menuCode: item.code,
    });
  });

  changeOrderWeb(menuCodes)
    .then(() => {
      message.success($t('common.successfulOperation'));
      queryAllMenu();
    })
    .catch((error) => {
      message.error($t('common.operationFailure'));
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
          message.success($t('common.successfulOperation'));
          queryAllMenu();
        })
        .catch((error) => {
          message.error($t('common.operationFailure'));
          message.error(error.msg);
        });
    },
    title: '是否确认删除该条数据?',
  });
}

// endregion

// region 树形菜单操作

// 查询参数
const queryParams = ref({
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
 */
function queryAllMenu() {
  getMenusWebList().then((data) => {
    if (data && data.length > 0) {
      treeData.value[0].childrens = data;
      setTableData(treeData.value[0].childrens);
      if (selectedKeys.value.length > 0) {
        setTableData(getChildrenByKey(selectedKeys.value[0] || '', data));
      }
    }
    flatteningNodeData.value = flattenTree(treeData.value[0], 'childrens');
  });
}

/**
 * 点选树菜单
 */
function selectedTree(_selectedKeys: any, { node, selected }: any) {
  if (selected) {
    setTableData(node.childrens);
  }
}

/**
 * 同时只能有一个节点展开
 */
function handleExpand(keys: any[], { expanded, node }: any) {
  const tempKeys = (
    (node.parent ? node.parent.children : treeData.value) || []
  ).map(({ key }: any) => key);

  expandedKeys.value = expanded
    ? [...difference(keys, tempKeys), node.key]
    : keys;
}

/**
 * 获取父级的key
 */
function getParentKey(
  key: number | string,
  tree: TreeProps['treeData'],
): number | string | undefined {
  let parentKey;
  if (tree) {
    for (const element of tree) {
      const node = element;
      if (node.childrens) {
        if (node.childrens.some((item: any) => item.code === key)) {
          parentKey = node.code;
        } else if (getParentKey(key, node.childrens)) {
          parentKey = getParentKey(key, node.childrens);
        }
      }
    }
  }
  return parentKey;
}

/**
 * 根据节点的key获取子节点
 */
function getChildrenByKey(
  key: number | string,
  tree: TreeProps['treeData'],
): any {
  if (!tree) {
    return [];
  }

  for (const node of tree) {
    if (node.code === key) {
      return node.childrens || [];
    }
    if (node.childrens) {
      getChildrenByKey(key, node.childrens);
    }
  }

  return [];
}

/**
 * 监听查询参数的变化
 */
watch(queryParams.value, () => {
  if (queryParams.value.name) {
    expandedKeys.value = flatteningNodeData.value
      .map((item: any) => {
        if (item.name.includes(queryParams.value.name)) {
          return getParentKey(item.code, treeData.value);
        }
        return null;
      })
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
    addButton.value = author.value.includes('新增');
    editButton.value = author.value.includes('编辑');
    delButton.value = author.value.includes('删除');
    if (
      author.value.includes('拖拽完成') &&
      gridOptions.columns &&
      gridOptions.columns[1]
    ) {
      gridOptions.columns[1].dragSort = true;
      gridApi.grid.reloadColumn(gridOptions.columns as any);
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
 */
function editSubmit() {
  editForm.value.validate().then(() => {
    if (!editMessage.value.fCode) {
      editMessage.value.fCode = '';
    }
    const ob = editMessage.value.code
      ? updateArticleWeb(editMessage.value)
      : createArticleWeb(editMessage.value);
    ob.then(() => {
      closeDrawer();
      queryAllMenu();
      message.success($t('common.successfulOperation'));
    }).catch((error) => {
      message.error($t('common.operationFailure'));
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

onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  queryAllMenu();
});

// endregion
</script>

<template>
  <Page>
    <Row :gutter="16">
      <!-- 树形菜单 -->
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
          </Tree>
        </Card>
      </Col>

      <!-- 表格主体 -->
      <Col :lg="16" :md="15" :sm="15" :xl="18" :xs="18">
        <Card class="h-[80vh]">
          <div>
            <Button
              v-if="addButton"
              class="!mb-4"
              type="primary"
              @click="showDrawer = true"
            >
              {{ $t('common.add') }}
            </Button>
          </div>

          <Grid>
            <template #isEnable_default="{ row }">
              <Switch
                v-model:checked="row.isEnable"
                :checked-children="$t('status.enable')"
                :checked-value="1"
                :un-checked-children="$t('status.forbidden')"
                disabled
              />
            </template>
            <template #operation_default="{ row }">
              <Space>
                <Tooltip>
                  <template #title>{{ $t('common.edit') }}</template>
                  <Button
                    v-if="editButton"
                    :icon="h(MdiEditOutline, { class: 'inline-block size-6' })"
                    type="link"
                    @click="showEdit(row)"
                  />
                </Tooltip>

                <Tooltip>
                  <template #title>{{ $t('common.delete') }}</template>
                  <Button
                    v-if="delButton"
                    :icon="h(MdiLightDelete, { class: 'inline-block size-6' })"
                    danger
                    type="link"
                    @click="delTableRow(row.id)"
                  />
                </Tooltip>
              </Space>
            </template>
          </Grid>
        </Card>
      </Col>
    </Row>

    <!-- 编辑 -->
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
            tree-node-filter-prop="label"
          />
        </FormItem>
        <FormItem :label="$t('system.sysWebMenu.menuName')" name="name">
          <Input v-model:value="editMessage.name" />
        </FormItem>
        <FormItem :label="$t('system.sysWebMenu.url')" name="url">
          <Input v-model:value="editMessage.url" />
        </FormItem>
        <FormItem :label="$t('system.sysWebMenu.isEnable')" name="isEnable">
          <RadioGroup v-model:value="editMessage.isEnable">
            <Radio :value="1">{{ $t('status.enable') }}</Radio>
            <Radio :value="0">{{ $t('status.forbidden') }}</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem
          :label="$t('system.sysWebMenu.description')"
          name="discription"
        >
          <Textarea v-model:value="editMessage.discription" />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <Button @click="closeDrawer">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="primary" @click="editSubmit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
