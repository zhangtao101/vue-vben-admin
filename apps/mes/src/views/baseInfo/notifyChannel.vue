<script lang="ts" setup>
import type { Rule } from 'ant-design-vue/es/form';

import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { computed, h, ref } from 'vue';

import { Page } from '@vben/common-ui';

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
  Modal,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addNotifyChannel,
  deleteNotifyChannel,
  getNotifyChannelList,
  updateNotifyChannel,
} from '#/api';
import { $t } from '#/locales';

// ========== 查询参数 ==========
const queryParams = ref<any>({
  name: '',
  channelType: undefined,
  provider: '',
});

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: $t('baseInfo.serialNumber') },
    { field: 'name', title: $t('baseInfo.notifyChannelName'), minWidth: 150 },
    {
      field: 'channelType',
      title: $t('baseInfo.notifyChannelType'),
      minWidth: 120,
    },
    { field: 'provider', title: $t('baseInfo.notifyChannelProvider'), minWidth: 120 },
    {
      field: 'action',
      title: $t('baseInfo.action'),
      width: 160,
      slots: { default: 'action' },
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return queryData({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// ========== 数据查询 ==========
function queryData({ pageNum, pageSize }: { pageNum: number; pageSize: number }) {
  return new Promise((resolve) => {
    const params = {
      ...queryParams.value,
      pageNum,
      pageSize,
    };

    getNotifyChannelList(params)
      .then(({ total, list }) => {
        resolve({
          total: total || 0,
          items: list || [],
        });
      })
      .catch(() => {
        resolve({
          total: 0,
          items: [],
        });
      });
  });
}

// ========== 重置 ==========
function handleReset() {
  queryParams.value = {
    name: '',
    channelType: undefined,
    provider: '',
  };
  gridApi.reload();
}

// ========== 抽屉控制 ==========
const drawerVisible = ref(false);
const currentMode = ref<'add' | 'edit'>('add');
const currentRow = ref<any>(null);
const formRef = ref<any>();
const formData = ref<any>({
  name: '',
  channelType: undefined,
  provider: '',
  appId: '',
  appSecret: '',
});

// ========== 表单验证规则 ==========
const rules: Record<string, Rule[]> = {
  name: [{ required: true, message: $t('baseInfo.notifyChannelName') }],
  channelType: [
    { required: true, message: $t('baseInfo.notifyChannelSelectType') },
  ],
  provider: [
    { required: true, message: $t('baseInfo.notifyChannelProvider') },
  ],
  appId: [{ required: true, message: $t('baseInfo.appId') }],
  appSecret: [{ required: true, message: $t('baseInfo.appSecret') }],
};

/** 抽屉标题 */
const drawerTitle = computed<string>(() => {
  return currentMode.value === 'add'
    ? $t('common.add')
    : $t('common.edit');
});

/**
 * 新增渠道
 * @since 2026-08-03
 */
function handleAdd() {
  currentMode.value = 'add';
  currentRow.value = null;
  formData.value = {
    name: '',
    channelType: undefined,
    provider: '',
    appId: '',
    appSecret: '',
  };
  drawerVisible.value = true;
}

/**
 * 编辑渠道
 * @param row 当前行数据
 * @since 2026-08-03
 */
function handleEdit(row: any) {
  currentMode.value = 'edit';
  currentRow.value = row;
  let appId = '';
  let appSecret = '';
  if (row.configContent) {
    try {
      const parsed = JSON.parse(row.configContent);
      appId = parsed.appId || '';
      appSecret = parsed.appSecret || '';
    } catch {
      // 解析失败，使用空值
    }
  }
  formData.value = {
    name: row.name || '',
    channelType: row.channelType || undefined,
    provider: row.provider || '',
    appId,
    appSecret,
  };
  drawerVisible.value = true;
}

/**
 * 保存（新增/编辑）
 * @since 2026-08-03
 */
function handleSave() {
  formRef.value
    .validate()
    .then(() => {
      const api = currentRow.value ? updateNotifyChannel : addNotifyChannel;
      const configContent = JSON.stringify({
        appId: formData.value.appId,
        appSecret: formData.value.appSecret,
      });
      const params = currentRow.value
        ? {
            name: formData.value.name,
            channelType: formData.value.channelType,
            provider: formData.value.provider,
            configContent,
            id: currentRow.value.id,
          }
        : {
            name: formData.value.name,
            channelType: formData.value.channelType,
            provider: formData.value.provider,
            configContent,
          };

      api(params)
        .then(() => {
          message.success($t('baseInfo.saveSuccess'));
          handleClose();
          gridApi.reload();
        })
        .catch(() => {
          // 保存失败，不做关闭
        });
    })
    .catch(() => {
      // 验证失败
    });
}

/**
 * 关闭抽屉，清理状态
 * @since 2026-08-03
 */
function handleClose() {
  drawerVisible.value = false;
  currentMode.value = 'add';
  currentRow.value = null;
  formData.value = {
    name: '',
    channelType: undefined,
    provider: '',
    appId: '',
    appSecret: '',
  };
  // 清除表单验证状态
  formRef.value?.clearValidate();
}

/**
 * 删除渠道
 * @param row 当前行数据
 * @since 2026-08-03
 */
function handleDelete(row: any) {
  Modal.confirm({
    title: () => h('span', $t('common.prompt')),
    content: () => h('span', $t('baseInfo.notifyChannelDeleteConfirm')),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    okButtonProps: { danger: true },
    onOk() {
      return deleteNotifyChannel(row.id).then(() => {
        message.success($t('baseInfo.deleteSuccess'));
        gridApi.reload();
      });
    },
  });
}
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 通知名称 -->
        <FormItem
          :label="$t('baseInfo.notifyChannelName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.name"
            :placeholder="$t('baseInfo.notifyChannelName')"
            allow-clear
          />
        </FormItem>

        <!-- 发送渠道 -->
        <FormItem
          :label="$t('baseInfo.notifyChannelType')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.channelType"
            :placeholder="$t('baseInfo.notifyChannelSelectType')"
            allow-clear
          />
        </FormItem>

        <!-- 服务商 -->
        <FormItem
          :label="$t('baseInfo.notifyChannelProvider')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.provider"
            :placeholder="$t('baseInfo.notifyChannelProvider')"
            allow-clear
          />
        </FormItem>

        <!-- 重置按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button @click="handleReset">
            {{ $t('common.reset') }}
          </Button>
        </FormItem>

        <!-- 查询按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="gridApi.reload()">
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <Button type="primary" @click="handleAdd">
            <Icon icon="mdi:plus" class="inline-block align-middle text-lg" />
            {{ $t('common.add') }}
          </Button>
        </template>

        <!-- 操作插槽 -->
        <template #action="{ row }">
          <Space>
            <Tooltip>
              <template #title>{{ $t('common.edit') }}</template>
              <Button type="link" @click="handleEdit(row)" class="px-1">
                <Icon
                  icon="mdi:pencil-outline"
                  class="inline-block align-middle text-lg"
                />
              </Button>
            </Tooltip>
            <Tooltip>
              <template #title>{{ $t('common.delete') }}</template>
              <Button
                type="link"
                danger
                @click="handleDelete(row)"
                class="px-1"
              >
                <Icon
                  icon="mdi:delete-outline"
                  class="inline-block align-middle text-lg"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 新增/编辑抽屉 -->
    <Drawer
      v-model:open="drawerVisible"
      :title="drawerTitle"
      width="560"
      :destroy-on-close="true"
      :footer-style="{ textAlign: 'right' }"
      @close="handleClose"
    >
      <Form ref="formRef" :model="formData" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <!-- 通知名称 -->
        <FormItem
          :label="$t('baseInfo.notifyChannelName')"
          name="name"
        >
          <Input
            v-model:value="formData.name"
            :placeholder="$t('baseInfo.notifyChannelName')"
          />
        </FormItem>

        <!-- 发送渠道 -->
        <FormItem
          :label="$t('baseInfo.notifyChannelType')"
          name="channelType"
        >
          <Input
            v-model:value="formData.channelType"
            :placeholder="$t('baseInfo.notifyChannelSelectType')"
          />
        </FormItem>

        <!-- 服务商 -->
        <FormItem
          :label="$t('baseInfo.notifyChannelProvider')"
          name="provider"
        >
          <Input
            v-model:value="formData.provider"
            :placeholder="$t('baseInfo.notifyChannelProvider')"
          />
        </FormItem>

        <!-- appId -->
        <FormItem
          :label="$t('baseInfo.appId')"
          name="appId"
        >
          <Input
            v-model:value="formData.appId"
            :placeholder="$t('baseInfo.appId')"
          />
        </FormItem>

        <!-- appSecret -->
        <FormItem
          :label="$t('baseInfo.appSecret')"
          name="appSecret"
        >
          <Input
            v-model:value="formData.appSecret"
            :placeholder="$t('baseInfo.appSecret')"
          />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <Button @click="handleClose">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="primary" @click="handleSave">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>
