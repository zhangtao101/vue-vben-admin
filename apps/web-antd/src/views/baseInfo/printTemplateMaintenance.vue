<script setup lang="ts">
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiEditOutline, MdiFileEditOutline, MdiSearch } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  RadioGroup,
  Space,
  Switch,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getAllPrintTemplate, savePrintTemplate } from '#/api';

// region 表格
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'printCode', title: '打印模板编号', minWidth: 150 },
    {
      field: 'printState',
      slots: { default: 'printState' },
      title: '打印状态',
      minWidth: 150,
    },
    {
      field: 'printType',
      slots: { default: 'printType' },
      title: '打印类型',
      minWidth: 150,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 220,
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryData();
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

/**
 * 根据打印状态码返回对应的文本描述。
 * @param state - 打印状态码（1: 启用, 2: 停用）。
 * @returns 打印状态的文本描述。
 */
function getPrintStateText(state: number): string {
  switch (state) {
    case 1: {
      return '启用'; // 状态码为 1 表示启用
    }
    case 2: {
      return '停用'; // 状态码为 2 表示停用
    }
    default: {
      return '未定义的状态'; // 其他状态码表示未定义的状态
    }
  }
}

/**
 * 根据打印类型码返回对应的文本描述。
 * @param state - 打印类型码（1: 含水率打印模板）。
 * @returns 打印类型的文本描述。
 */
function getPrintTypeText(state: number): string {
  switch (state) {
    case 1: {
      return '含水率打印模板'; // 类型码为 1 表示含水率打印模板
    }
    default: {
      return '未定义的打印类型'; // 其他类型码表示未定义的打印类型
    }
  }
}

// endregion

// region 查询数据

// 查询参数
const queryParams = ref<any>({
  workstationCode: '',
  workstationName: '',
});

/**
 * 从服务器查询工作站数据的函数。
 * 这个函数用于发送查询请求，并在成功获取数据后更新组件的状态。
 */
function queryData() {
  return new Promise((resolve, reject) => {
    /**
     * 调用 queryWorkstation 函数，传入查询参数和分页信息。
     * 查询参数包括 queryParams.value 中的所有属性，以及当前页码和每页大小。
     */
    getAllPrintTemplate()
      .then((data) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          items: data,
          total: data.length,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// endregion

// region 模板基本信息编辑 / 新增
// 表单对象
const editForm = ref();
// 模板基本信息编辑抽屉是否显示
const showDrawer = ref(false);
// 编辑的模板基本信息
const editMessage = ref<any>({});
// 编辑的模板基本信息验证规则
const editRules = ref({
  printCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  printState: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  printType: [{ message: '此项为必填项', required: true, trigger: 'change' }],
} as any);
// 打印状态
const statusOptions = [
  {
    label: '启用',
    value: 1,
  },
  {
    label: '停用',
    value: 2,
  },
];
// 打印模板
const printTemplateOptions = [
  {
    label: '含水率打印模板',
    value: 1,
  },
];

/**
 * 显示编辑抽屉
 * @param row
 */
function showEdit(row?: any) {
  editMessage.value = row
    ? { ...row }
    : {
        printState: 1,
        printType: 1,
      };
  showDrawer.value = true;
}

/**
 * 表单提交
 */
function submit() {
  editForm.value.validate().then(() => {
    if (!editMessage.value.printData) {
      editMessage.value.printData = '';
    }
    savePrintTemplate(editMessage.value).then(() => {
      message.success('操作成功!');
      close();
      gridApi.reload();
    });
  });
}

function close() {
  editMessage.value = {};
  showDrawer.value = false;
}
// endregion

// region 模板编辑

function showPrintTemplate(_row: any) {
  const prefix = import.meta.env.MODE === 'production' ? '/#' : '';
  // 弹出窗口，不显示工具栏和菜单栏
  window.open(
    `${prefix}/empty/printTemplate?printCode=${_row.printCode}`,
    '',
    'toolbar=no,menubar=no,resizable=yes,width=800,height=600',
  );
}

// endregion

onMounted(async () => {});
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 工作站编号 -->
        <FormItem
          :label="$t('workStationMaintenance.workStationNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.workstationCode" />
        </FormItem>
        <!-- 工作站名称 -->
        <FormItem
          :label="$t('workStationMaintenance.workstationName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.workstationName" />
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
          <Button type="primary" @click="showEdit()">
            {{ $t('common.add') }}
          </Button>
        </template>
        <template #printState="{ row }">
          {{ getPrintStateText(row.printState) }}
        </template>
        <template #printType="{ row }">
          {{ getPrintTypeText(row.printType) }}
        </template>
        <!-- 状态 -->
        <template #printEnable="{ row }">
          <Switch
            v-model:checked="row.isEnable"
            :checked-children="$t('status.enable')"
            :checked-value="1"
            :un-checked-children="$t('status.forbidden')"
            disabled
          />
        </template>
        <template #action="{ row }">
          <!-- 编辑按钮 -->
          <Tooltip>
            <template #title>
              {{ $t('common.edit') }}
            </template>
            <Button
              :icon="h(MdiEditOutline, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="showEdit(row)"
            />
          </Tooltip>
          <!-- 模板编辑按钮 -->
          <Tooltip>
            <template #title>
              {{ $t('common.templateEdit') }}
            </template>
            <Button
              :icon="h(MdiFileEditOutline, { class: 'inline-block size-6' })"
              class="mr-4"
              type="link"
              @click="showPrintTemplate(row)"
            />
          </Tooltip>

          <!-- 删除数据 -->
          <!--          <Tooltip>
            <template #title>{{ $t('common.delete') }}</template>
            <Button
              :icon="
                h(MaterialSymbolsDeleteOutline, {
                  class: 'inline-block size-6',
                })
              "
              danger
              type="link"
              @click="delWorkStationDetail(index)"
            />
          </Tooltip>-->
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- region 新增/编辑 -->
    <Drawer
      v-model:open="showDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="600"
      class="custom-class"
      placement="right"
      root-class-name="root-class-name"
      style="color: red"
      title="信息编辑"
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
        <!-- 打印模板编号 -->
        <FormItem
          :label="$t('printTemplate.printTemplateCode')"
          name="printCode"
        >
          <Input
            v-model:value="editMessage.printCode"
            :disabled="editMessage.id"
          />
        </FormItem>
        <!-- 打印模板编号 -->
        <FormItem :label="$t('printTemplate.printStatus')" name="printState">
          <RadioGroup
            v-model:value="editMessage.printState"
            :options="statusOptions"
          />
        </FormItem>
        <!-- 打印模板编号 -->
        <FormItem :label="$t('printTemplate.printType')" name="printType">
          <RadioGroup
            v-model:value="editMessage.printType"
            :options="printTemplateOptions"
          />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="close">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="submit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
