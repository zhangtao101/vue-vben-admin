<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Popconfirm,
  Space,
  Switch,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteFlowDefinitionDefinition,
  enableFlowDefinitionDefinition,
  getFlowDefinitionByIdDefinition,
  queryFlowDefinitionListDefinition,
  saveFlowDefinitionDefinition,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import DropLowCode from '#/util/component/dropLowCode/dropLowCode.vue';

// 路由信息
const route = useRoute();

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'name',
      title: $t('lowCode.lowCodeProcessConfig.name'),
      minWidth: 150,
    },
    {
      field: 'version',
      title: $t('lowCode.lowCodeProcessConfig.version'),
      width: 100,
    },
    {
      field: 'status',
      title: $t('common.status'),
      width: 100,
      slots: { default: 'status_default' },
    },
    {
      field: 'action',
      title: $t('common.action'),
      width: 150,
      slots: { default: 'action_default' },
      fixed: 'right',
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  pagerConfig: {
    enabled: false,
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
    refresh: true,
    zoom: true,
  },
};

const gridEvents: any = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// endregion

// region 查询数据
// 查询参数
const queryParams = ref<any>({});

/**
 * 查询数据
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams.value,
      pageNum: page,
      pageSize,
    };

    queryFlowDefinitionListDefinition(params)
      .then(({ total, list }: any) => {
        resolve({
          total,
          items: list,
        });
      })
      .catch((error) => {
        reject(error);
      });
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
    addButton.value = author.value.includes('新增');
    editButton.value = author.value.includes('编辑');
    delButton.value = author.value.includes('删除');
  },
);

// endregion

// region 抽屉状态

// 新增/编辑抽屉
const drawerVisible = ref(false);
const formData = ref<any>({});
const formRef = ref<any>();
// 当前操作类型：'create' 或 'edit'
const drawerType = ref<'create' | 'edit'>('create');

// 表单验证规则
const formRules = ref<any>({
  name: [{ message: '流程名称为必填项', required: true, trigger: 'change' }],
});

// 配置流程抽屉
const configDrawerVisible = ref(false);
const dropLowCodeRef = ref();

// endregion

// region 表格操作事件

// 状态切换
function handleStatusChange(row: any, checked: any) {
  const status = checked ? 1 : 2;
  enableFlowDefinitionDefinition(row.id, status).then(() => {
    gridApi.reload();
  });
}

// 打开新增抽屉
function handleAdd() {
  drawerType.value = 'create';
  formData.value = {};
  drawerVisible.value = true;
}

// 打开编辑抽屉
function handleEdit(row: any) {
  drawerType.value = 'edit';
  getFlowDefinitionByIdDefinition(row.id).then((res: any) => {
    formData.value = { ...res };
    drawerVisible.value = true;
  });
}

// 保存数据（新增/编辑）
function handleSave() {
  formRef.value
    ?.validate()
    .then(() => {
      saveFlowDefinitionDefinition(formData.value).then(() => {
        message.success($t('common.successfulOperation'));
        drawerVisible.value = false;
        gridApi.reload();
      });
    })
    .catch((error: any) => {
      console.error('表单验证失败:', error);
    });
}

// 关闭抽屉
function handleClose() {
  drawerVisible.value = false;
}

// 打开配置流程抽屉
function handleConfigFlow() {
  configDrawerVisible.value = true;
  // 设置流程图数据
  if (formData.value.nodes && formData.value.routes) {
    setTimeout(() => {
      dropLowCodeRef.value.setData(formData.value.routes, formData.value.nodes);
    }, 500);
  }
}

// 关闭配置流程抽屉
function handleConfigClose() {
  configDrawerVisible.value = false;
}

// 保存流程配置
function handleConfigSave() {
  // TODO: 实现保存流程配置的逻辑
  message.success($t('common.successfulOperation'));
  formData.value.flowDefinition = dropLowCodeRef.value.getData();
  /**
   * allPathsLeadToEnd: 是否合规
   * cleanedNodes: 清理后的节点
   * edges: 连接线
   */
  const { allPathsLeadToEnd, cleanedNodes, edges } =
    dropLowCodeRef.value.cleanAndCheckGraph();
  if (allPathsLeadToEnd && cleanedNodes.length > 0) {
    // edges.forEach((edge: any) => {
    //   edge.opDetailId = routerId.value;
    // });
    formData.value.nodes = cleanedNodes;
    formData.value.routes = edges;
    handleConfigClose();
  } else {
    message.error('请确保至少有一条完整的路线(开始 => xxx => 结束)!');
  }
}

// 删除数据
function handleDelete(row: any) {
  deleteFlowDefinitionDefinition(row.id).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

// endregion

// region 生命周期

onMounted(() => {
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
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <FormItem :label="$t('lowCode.processName')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.name" />
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

    <!-- region 表格主体 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <!-- 新增按钮 -->
          <Button v-if="addButton" type="primary" @click="handleAdd">
            {{ $t('common.add') }}
          </Button>
        </template>
        <template #status_default="{ row }">
          <span v-if="row.status === 0">{{
            $t('lowCode.lowCodeProcessConfig.draft')
          }}</span>
          <Switch
            v-else
            :checked="row.status === 1"
            @change="(checked) => handleStatusChange(row, checked)"
          />
        </template>
        <!-- 操作栏 -->
        <template #action_default="{ row }">
          <!-- 编辑 -->
          <Tooltip>
            <template #title>{{ $t('common.edit') }}</template>
            <Button type="link" @click="handleEdit(row)">
              <Icon
                icon="mdi:edit-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 删除 -->
          <Tooltip>
            <template #title>{{ $t('common.delete') }}</template>
            <Popconfirm
              :cancel-text="$t('common.cancel')"
              :ok-text="$t('common.confirm')"
              :title="$t('ui.widgets.deletionConfirmation')"
              @confirm="handleDelete(row)"
            >
              <Button danger type="link">
                <Icon
                  icon="mdi-light:delete"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Popconfirm>
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- 新增/编辑抽屉 -->
    <Drawer
      v-model:open="drawerVisible"
      :title="
        drawerType === 'create'
          ? $t('lowCode.lowCodeProcessConfig.addFlow')
          : $t('lowCode.lowCodeProcessConfig.editFlow')
      "
      width="400px"
      :footer-style="{ textAlign: 'right' }"
    >
      <Form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <FormItem label="流程名称" name="name">
          <Input
            v-model:value="formData.name"
            :placeholder="$t('lowCode.lowCodeProcessConfig.enterFlowName')"
          />
        </FormItem>
        <FormItem label="流程配置">
          <Button type="primary" @click="handleConfigFlow">
            {{ $t('lowCode.lowCodeProcessConfig.configFlow') }}
          </Button>
        </FormItem>
      </Form>
      <template #footer>
        <Space>
          <Button @click="handleClose">{{ $t('common.cancel') }}</Button>
          <Button type="primary" @click="handleSave">
            {{ $t('common.save') }}
          </Button>
        </Space>
      </template>
    </Drawer>

    <!-- 配置流程抽屉 -->
    <Drawer
      v-model:open="configDrawerVisible"
      :title="$t('lowCode.lowCodeProcessConfig.configFlow')"
      placement="top"
      height="80%"
      :mask-closable="false"
      :footer-style="{ textAlign: 'right' }"
    >
      <DropLowCode
        ref="dropLowCodeRef"
        :is-update="true"
        v-if="configDrawerVisible"
      />
      <template #footer>
        <Space>
          <Button @click="handleConfigClose">{{ $t('common.cancel') }}</Button>
          <Button type="primary" @click="handleConfigSave">
            {{ $t('common.save') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
