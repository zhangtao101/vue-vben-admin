<script lang="ts" setup>
import type { TreeProps } from 'ant-design-vue';

/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue、vxe-table 的组件，以及 queryScadaEquipNamePage 等 API
 * [OUTPUT]: 对外提供设备名称维护页面组件
 * [POS]: 设备管理模块 的设备名称维护页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-20 15:33:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
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
  Tooltip,
  TreeSelect,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteScadaEquipName,
  getEquipNameTree,
  insertScadaEquipName,
  queryScadaEquipNameCodeQuote,
  queryScadaEquipNamePage,
  updateScadaEquipName,
} from '#/api';
import { $t } from '#/locales';
import { flattenTree, queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: $t('basic.laborHourEvaluation.sequence'), type: 'seq', width: 50 },
    { field: 'equipmentName', title: $t('equip.equipmentName'), minWidth: 120 },
    { field: 'equipmentNameCode', title: $t('equip.equipmentNameCode'), minWidth: 120 },
    { field: 'cTime', title: $t('equip.createdTime'), minWidth: 50 },
    { field: 'cUser', title: $t('equip.createdBy'), minWidth: 50 },
    { field: 'remark', title: $t('equip.remark'), minWidth: 80 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('equip.operation'),
      width: 220,
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// region 查看 / 编辑 / 新增 具体操作

// 当前选中的表格行
const checkedRow = ref<any>({});
// 是否显示编辑抽屉
const showEditDrawer = ref(false);
// 是否显示详情
const isShowDetails = ref(false);

// 抽屉冲的form表单对象
const editForm = ref();
// form表单规则验证
const editRules = ref<any>({
  equipmentName: [
    {
      message: $t('equip.requiredField'),
      required: true,
      trigger: 'change',
    },
  ],
  equipmentCode: [
    {
      message: $t('equip.requiredField'),
      required: true,
      trigger: 'change',
    },
  ],
  equipmentNameCode: [
    { message: $t('equip.requiredField'), required: true, trigger: 'change' },
  ],
});
/**
 * 显示是编辑抽屉
 * @param row 表格行数据
 */
function editRow(row?: any) {
  checkedRow.value = row
    ? {
        ...row,
        zoningId: row.zoningId * 1,
      }
    : {};
  showEditDrawer.value = true;
}

function showDetails(row: any) {
  editRow(row);
  isShowDetails.value = true;
}

/**
 * 删除数据
 * @param row
 */
function delRow(row: any) {
  Modal.confirm({
    cancelText: $t('common.cancel'),
    okText: $t('common.confirm'),
    okType: 'danger',
    onCancel() {
      message.warning($t('equip.cancelDelete'));
    },
    onOk() {
      queryScadaEquipNameCodeQuote({
        equipmentNameCode: row.equipmentNameCode,
      }).then((data: boolean) => {
        const delFun = () => {
          deleteScadaEquipName({ id: row.id }).then(() => {
            // 显示操作成功的提示信息
            message.success($t('common.successfulOperation'));
            gridApi.query();
          });
        };
        if (data) {
          Modal.confirm({
            cancelText: $t('common.cancel'),
            okText: $t('common.confirm'),
            okType: 'danger',
            onCancel() {
              message.warning($t('equip.cancelDelete'));
            },
            onOk() {
              delFun();
            },
            title: $t('equip.confirmDeleteReferenced'),
          });
        } else {
          delFun();
        }
      });
    },
    title: $t('equip.confirmDeleteRecord'),
  });
}

/**
 * 关闭编辑抽屉，重置表单状态
 * @returns {void} 无返回值
 * @since 2026-04-20 15:33:00
 */
function onClose() {
  checkedRow.value = {};
  showEditDrawer.value = false;
  isShowDetails.value = false;
}

/**
 * 表单提交校验，通过后新增或编辑设备名称数据
 * @returns {void} 无返回值，成功后关闭抽屉并刷新表格
 * @throws {Error} 表单校验失败时不提交
 * @since 2026-04-20 15:33:00
 */
function submit() {
  editForm.value.validate().then(() => {
    const ob = checkedRow.value.id
      ? updateScadaEquipName(checkedRow.value)
      : insertScadaEquipName(checkedRow.value);
    ob.then(() => {
      // 查询数据
      gridApi.query();
      message.success($t('common.successfulOperation'));
      onClose();
    });
  });
}

// endregion

// endregion

// region 查询数据
// 查询参数
const queryParams = ref<any>({});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params = {
      ...queryParams.value, // 展开 queryParams.value 对象，包含所有查询参数。
    };
    queryScadaEquipNamePage(page, pageSize, params).then(({ total, list }) => {
      // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
      resolve({
        total,
        items: list,
      });
    });
  });
}

// endregion

// region 树形菜单操作

// 树搜索文本
const treeSearchText = ref('');
// 当前展开的节点
const expandedKeys = ref<string[]>([]);
// 树节点数据
const treeData = ref<any[]>([]);
// 展平后的树节点数据（用于搜索自动展开）
const flatteningNodeData = ref<any>([]);

/**
 * 查询设备类型树
 * @since 2026-08-03
 */
function queryTree() {
  getEquipNameTree().then((data) => {
    if (data && data.length > 0) {
      treeData.value = data;
    }
    flatteningNodeData.value = flattenTree(
      { children: treeData.value },
      'children',
    );
  });
}

/**
 * 获取树节点的父级 key
 * @param key 当前节点 key
 * @param tree 树形数据
 * @returns 父级 key，找不到则返回 undefined
 * @since 2026-08-03
 */
function getParentKey(
  key: string,
  tree: TreeProps['treeData'],
): string | undefined {
  if (!tree) return undefined;
  let parentKey: string | undefined;
  for (const node of tree) {
    if (
      node.children &&
      node.children.some((item: any) => item.equipmentNameCode === key)
    ) {
      return node.equipmentNameCode;
    }
    if (node.children) {
      parentKey = getParentKey(key, node.children);
      if (parentKey) return parentKey;
    }
  }
  return parentKey;
}

/**
 * 监听树搜索文本变化，自动展开匹配的节点
 * @since 2026-08-03
 */
watch(treeSearchText, () => {
  expandedKeys.value = treeSearchText.value ? flatteningNodeData.value
      .map((item: any) => {
        if (item.equipmentName?.includes(treeSearchText.value)) {
          return getParentKey(item.equipmentNameCode, treeData.value);
        }
        return null;
      })
      .filter(
        (item: any, i: number, self: any) =>
          item && self.indexOf(item) === i,
      ) : [];
});

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 初始化

onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  // 加载设备类型树
  queryTree();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 设备名称 -->
        <FormItem :label="$t('equip.equipName')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.equipmentName" />
        </FormItem>
        <!-- 设备名称编码 -->
        <FormItem :label="$t('equip.equipNameCode')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.equipmentNameCode" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="() => gridApi.reload()"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 树形菜单 + 表格主体 -->
    <Row :gutter="16">
      <!-- region 树形菜单 -->
      <Col :lg="6" :md="9" :sm="9" :xl="6" :xs="6">
        <Card class="h-[80vh] overflow-y-auto">
          <Input
            v-model:value="treeSearchText"
            :placeholder="$t('system.sysButton.enterKeyword')"
            style="margin-bottom: 8px"
          />
          <DirectoryTree
            v-model:expanded-keys="expandedKeys"
            :auto-expand-parent="false"
            :field-names="{
              children: 'children',
              title: 'equipmentName',
              key: 'equipmentNameCode',
            }"
            :tree-data="treeData"
          >
            <template #title="{ equipmentName }">
              <span v-if="equipmentName?.includes(treeSearchText)">
                {{
                  equipmentName.substring(
                    0,
                    equipmentName.indexOf(treeSearchText),
                  )
                }}
                <span style="color: #f50">{{ treeSearchText }}</span>
                {{
                  equipmentName.substring(
                    equipmentName.indexOf(treeSearchText) +
                      treeSearchText.length,
                  )
                }}
              </span>
              <span v-else>{{ equipmentName }}</span>
            </template>
          </DirectoryTree>
        </Card>
      </Col>
      <!-- endregion -->

      <!-- region 表格主体 -->
      <Col :lg="18" :md="15" :sm="15" :xl="18" :xs="18">
        <Card>
          <Grid>
            <template #toolbar-tools>
              <!-- 新增按钮 -->
              <Button
                v-if="author.includes('新增')"
                type="primary"
                @click="editRow()"
              >
                {{ $t('common.add') }}
              </Button>
            </template>
            <template #action="{ row }">
              <!-- 查看按钮 -->
              <Tooltip>
                <template #title>{{ $t('common.view') }}</template>
                <Button type="link" @click="showDetails(row)">
                  <Icon
                    icon="mdi:eye"
                    class="inline-block align-middle text-2xl"
                  />
                </Button>
              </Tooltip>
              <!-- 编辑按钮 -->
              <Tooltip v-if="author.includes('编辑')">
                <template #title>{{ $t('common.edit') }}</template>
                <Button type="link" @click="editRow(row)">
                  <Icon
                    icon="mdi:edit-outline"
                    class="inline-block align-middle text-2xl"
                  />
                </Button>
              </Tooltip>

              <!-- 删除数据 -->
              <Tooltip v-if="author.includes('删除')">
                <template #title>{{ $t('common.delete') }}</template>
                <Button type="link" @click="delRow(row)" danger>
                  <Icon
                    icon="mdi-light:delete"
                    class="inline-block align-middle text-2xl"
                  />
                </Button>
              </Tooltip>
            </template>
          </Grid>
        </Card>
      </Col>
      <!-- endregion -->
    </Row>
    <!-- endregion -->

    <!-- region 新增/编辑 抽屉 -->
    <Drawer
      v-model:open="showEditDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="400"
      class="custom-class"
      placement="right"
      :title="$t('equip.infoEdit')"
      @close="onClose"
    >
      <Form
        ref="editForm"
        :label-col="{ span: 8 }"
        :model="checkedRow"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
      >
        <!-- 设备名称 -->
        <FormItem :label="$t('equip.equipName')" name="equipmentName">
          <Input
            v-model:value="checkedRow.equipmentName"
            :disabled="isShowDetails"
          />
        </FormItem>
        <!-- 设备名称编号（后台生成，仅显示） -->
        <FormItem :label="$t('equip.equipNameCode')">
          <Input
            v-model:value="checkedRow.equipmentNameCode"
            disabled
          />
        </FormItem>
        <!-- 设备类型 -->
        <FormItem :label="$t('equip.equipmentType')" name="typeLevel">
          <TreeSelect
            v-model:value="checkedRow.typeLevel"
            :disabled="isShowDetails"
            :field-names="{
              children: 'children',
              label: 'equipmentName',
              value: 'id',
            }"
            :tree-data="treeData"
            allow-clear
            show-search
            tree-node-filter-prop="equipmentName"
          />
        </FormItem>
        <!-- 备注 -->
        <FormItem :label="$t('equip.remark')">
          <Input v-model:value="checkedRow.remark" :disabled="isShowDetails" />
        </FormItem>
        <!-- 创建人 -->
        <FormItem :label="$t('equip.createdBy')" v-if="isShowDetails">
          <Input v-model:value="checkedRow.cUser" disabled />
        </FormItem>
        <!-- 创建时间 -->
        <FormItem :label="$t('equip.createdTime')" v-if="isShowDetails">
          <Input v-model:value="checkedRow.cTime" disabled />
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
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
