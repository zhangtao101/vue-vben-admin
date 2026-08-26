<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { computed, nextTick, reactive, ref, watch } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Collapse,
  CollapsePanel,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Textarea,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteRegisterDetail,
  insertRegisterDetail,
  selectRegisterDetailList,
  updateRegisterDetail,
} from '#/api';
import { $t } from '#/locales';

defineOptions({ name: 'RegisterDetailDrawer' });

// 父组件传入的权限列表
const props = defineProps<{
  author: string[];
}>();

// ========== 枚举选项（与列表页保持一致） ==========

// 登记类型选项 1API接口 2mqtt 3数据库 4url连接
const registerTypeOptions = [
  { color: 'green', label: $t('functionRegisterManage.api'), value: 1 },
  { color: 'cyan', label: $t('functionRegisterManage.mqtt'), value: 2 },
  { color: 'blue', label: $t('functionRegisterManage.database'), value: 3 },
  { color: 'orange', label: $t('functionRegisterManage.urlConnect'), value: 4 },
];

// 权限标记选项 1无权限校验 2指定权限校验
const registerFlagOptions = [
  { color: 'green', label: $t('functionRegisterManage.noAuth'), value: 1 },
  { color: 'orange', label: $t('functionRegisterManage.specifiedAuth'), value: 2 },
];

// 触发方式选项 1主动调用 2实时监听 3轮询读取 4修改推送
const registerTriggerOptions = [
  { color: 'blue', label: $t('functionRegisterManage.activeCall'), value: 1 },
  { color: 'green', label: $t('functionRegisterManage.realTimeMonitor'), value: 2 },
  { color: 'orange', label: $t('functionRegisterManage.pollRead'), value: 3 },
  { color: 'purple', label: $t('functionRegisterManage.modifyPush'), value: 4 },
];

// ========== 各登记类型对应的明细字段配置 ==========
// type: input 普通输入框 / select 下拉选择 / textarea 多行文本（示例json字符串） / table 子表格（对象数组）
const FIELD_SCHEMA: Record<number, { columns: any[]; formFields: any[] }> = {
  // 1 API接口
  1: {
    columns: [
      { field: 'apiMethod', minWidth: 100 },
      { field: 'apiUrl', minWidth: 220 },
    ],
    formFields: [
      { key: 'apiMethod', label: 'apiMethod', required: true, type: 'input' },
      { key: 'apiUrl', label: 'apiUrl', required: true, type: 'input' },
      {
        key: 'paramList',
        label: 'paramList',
        tableColumns: [
          { key: 'paramType', label: 'paramType' },
          { key: 'paramDesc', label: 'paramDesc' },
          { key: 'paramCode', label: 'paramCode' },
          { key: 'paramName', label: 'paramName' },
        ],
        type: 'table',
      },
      { key: 'returnParamExample', label: 'returnParamExample', rows: 4, type: 'textarea' },
      {
        key: 'returnParamList',
        label: 'returnParamList',
        tableColumns: [
          { key: 'paramType', label: 'paramType' },
          { key: 'paramCode', label: 'paramCode' },
          { key: 'paramName', label: 'paramName' },
        ],
        type: 'table',
      },
      { key: 'paramExample', label: 'paramExample', rows: 4, type: 'textarea' },
    ],
  },
  // 2 mqtt
  2: {
    columns: [
      { field: 'topic', minWidth: 200 },
      { field: 'ip', minWidth: 120 },
    ],
    formFields: [
      { key: 'ip', label: 'ip', required: true, type: 'input' },
      { key: 'port', label: 'port', required: true, type: 'input' },
      { key: 'username', label: 'username', type: 'input' },
      { key: 'password', label: 'password', type: 'input' },
      { key: 'clientId', label: 'clientId', type: 'input' },
      { key: 'topic', label: 'topic', required: true, type: 'input' },
      {
        key: 'topicParamList',
        label: 'topicParamList',
        tableColumns: [
          { key: 'paramType', label: 'paramType' },
          { key: 'paramCode', label: 'paramCode' },
          { key: 'paramName', label: 'paramName' },
        ],
        type: 'table',
      },
      { key: 'paramExample', label: 'paramExample', rows: 4, type: 'textarea' },
    ],
  },
  // 3 数据库
  3: {
    columns: [
      { field: 'tableName', minWidth: 180 },
      { field: 'databaseName', minWidth: 160 },
    ],
    formFields: [
      {
        key: 'databaseType',
        label: 'databaseType',
        options: [
          { label: 'MySQL', value: 'mysql' },
          { label: 'Oracle', value: 'oracle' },
          { label: 'SqlServer', value: 'sqlserver' },
        ],
        required: true,
        type: 'select',
      },
      { key: 'ip', label: 'ip', required: true, type: 'input' },
      { key: 'port', label: 'port', required: true, type: 'input' },
      { key: 'databaseName', label: 'databaseName', required: true, type: 'input' },
      { key: 'username', label: 'username', type: 'input' },
      { key: 'password', label: 'password', type: 'input' },
      { key: 'tableName', label: 'tableName', required: true, type: 'input' },
      {
        key: 'tableColumnList',
        label: 'tableColumnList',
        tableColumns: [
          { key: 'column', label: 'column' },
          { key: 'property', label: 'property' },
          { key: 'comment', label: 'comment' },
          { key: 'type', label: 'type' },
        ],
        type: 'table',
      },
    ],
  },
  // 4 url连接
  4: {
    columns: [{ field: 'url', minWidth: 260 }],
    formFields: [{ key: 'url', label: 'url', required: true, type: 'input' }],
  },
};

// ========== 明细列表 ==========

// 是否显示登记明细抽屉
const show = ref(false);
// 当前选中登记行（顶部基本信息 + registerId 来源）
const detailRow = ref<any>({});

// 根据登记类型动态生成的表格列
const detailColumns = computed(() => {
  const schema =
    FIELD_SCHEMA[detailRow.value.registerType] ?? { columns: [], formFields: [] };
  const columns: any[] = [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
  ];
  schema.columns.forEach((c: any) => {
    columns.push({
      field: c.field,
      minWidth: c.minWidth,
      showOverflow: true,
      title: $t(`registerDetail.${c.field}`),
    });
  });
  columns.push({
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: $t('page.common.action'),
    width: 250,
  });
  return columns;
});

// 明细表格配置
const gridOptions: VxeGridProps<any> = reactive({
  align: 'center',
  border: true,
  height: 380,
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryDetailData({
          page: page.currentPage,
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
});

const gridEvents: VxeGridListeners<any> = {};

const [DetailGrid, detailGridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 登记类型变化时动态更新表格列
watch(
  () => detailRow.value.registerType,
  () => {
    detailGridApi.setGridOptions({ columns: detailColumns.value });
  },
);

/**
 * 查询登记明细数据
 * 向服务器发送请求，根据登记信息ID获取明细详情列表，并更新前端的数据显示和分页信息。
 * @param page 页码
 * @param pageSize 每页展示条数
 */
function queryDetailData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    selectRegisterDetailList({
      registerId: detailRow.value.id,
      pageNum: page,
      pageSize,
    }).then(({ total, list }) => {
      // 将每条明细的 JSON 字符串解析为对象，解析结果平铺到行上供动态列展示
      const items = (list ?? []).map((item: any) => {
        const obj = parseDetailJson(item.registerDetailJson);
        return obj ? { ...item, ...obj } : item;
      });
      resolve({
        total,
        items,
      });
    });
  });
}

// ========== 明细新增 / 编辑 / 查看 ==========

// 是否显示明细新增/编辑/查看抽屉
const showEdit = ref(false);
// 当前模式：add 新增 / edit 编辑 / view 查看
const currentMode = ref<'add' | 'edit' | 'view'>('add');
// 当前编辑的明细行（新增时为 null）
const currentEditRow = ref<any>(null);
// 明细编辑表单对象
const editForm = ref();
// 明细表单数据（按登记类型动态生成）
const formData = ref<any>({});
// 当前登记类型对应的表单字段
const currentFields = computed(() => {
  const schema =
    FIELD_SCHEMA[detailRow.value.registerType] ?? { columns: [], formFields: [] };
  return schema.formFields;
});

// 表单规则（必填项）
const editRules = computed(() => {
  const rules: any = {};
  currentFields.value
    .filter((f: any) => f.required)
    .forEach((f: any) => {
      rules[f.key] = [
        { message: $t('page.common.requiredField'), required: true, trigger: 'change' },
      ];
    });
  return rules;
});

/**
 * 打开登记明细抽屉
 * @param row 当前选中登记行
 */
function open(row: any) {
  detailRow.value = row;
  show.value = true;
  // 等待抽屉内容渲染后刷新明细列表
  nextTick(() => {
    detailGridApi.query();
  });
}

/**
 * 关闭登记明细抽屉
 */
function close() {
  show.value = false;
  detailRow.value = {};
}

/**
 * 新增/编辑/查看明细
 * @param mode 操作模式
 * @param row 明细行数据，新增时为空
 */
function openEdit(mode: 'add' | 'edit' | 'view', row?: any) {
  currentMode.value = mode;
  currentEditRow.value = row ?? null;
  formData.value = row
    ? (parseDetailJson(row.registerDetailJson) ?? {})
    : initFormData();
  showEdit.value = true;
}

/**
 * 生成对应登记类型的空表单数据
 */
function initFormData() {
  const obj: any = {};
  currentFields.value.forEach((f: any) => {
    obj[f.key] = f.type === 'table' ? [] : '';
  });
  return obj;
}

/**
 * 子表格添加行
 * @param key 字段名
 * @param tableColumns 子表格列配置
 */
function addTableRow(key: string, tableColumns: any[]) {
  const row: any = {};
  tableColumns.forEach((col: any) => {
    row[col.key] = '';
  });
  formData.value[key].push(row);
}

/**
 * 生成子表格列配置
 * @param field 表单项配置
 */
function getTableColumns(field: any) {
  const columns: any[] = field.tableColumns.map((col: any) => ({
    align: 'center',
    dataIndex: col.key,
    key: col.key,
    title: $t(`registerDetail.${col.label}`),
  }));
  // 非查看模式追加操作列
  if (currentMode.value !== 'view') {
    columns.push({
      align: 'center',
      dataIndex: 'action',
      key: 'action',
      title: $t('common.action'),
      width: 110,
    });
  }
  return columns;
}

/**
 * 删除子表格中的一行记录（带二次确认）
 * @param key 字段 key
 * @param index 行索引
 */
function removeTableRow(key: string, index: number | string) {
  Modal.confirm({
    cancelText: $t('common.cancel'),
    content: $t('page.common.confirmDeletePrompt'),
    okText: $t('common.confirm'),
    okType: 'danger',
    onCancel() {
      message.warning($t('page.common.cancelDeletePrompt'));
    },
    onOk() {
      formData.value[key].splice(Number(index), 1);
      message.success($t('common.successfulOperation'));
    },
    title: $t('page.common.confirmDeleteTitle'),
  });
}

/**
 * 删除登记明细
 * @param row 明细表格行数据
 */
function delDetailRow(row: any) {
  Modal.confirm({
    cancelText: $t('common.cancel'),
    okText: $t('common.confirm'),
    okType: 'danger',
    onCancel() {
      message.warning($t('page.common.cancelDeletePrompt'));
    },
    onOk() {
      deleteRegisterDetail(row.id).then(() => {
        // 显示操作成功的提示信息
        message.success($t('common.successfulOperation'));
        detailGridApi.query();
      });
    },
    title: $t('page.common.confirmDeleteTitle'),
  });
}

/**
 * 关闭明细新增/编辑/查看抽屉
 */
function closeEdit() {
  showEdit.value = false;
  currentMode.value = 'add';
  currentEditRow.value = null;
  formData.value = {};
  editForm.value?.resetFields();
}

/**
 * 明细表单提交
 */
function submit() {
  editForm.value.validate().then(() => {
    // 将表单对象格式化为 JSON 字符串，格式化失败会提示并中断
    const json = stringifyDetailJson(formData.value);
    if (json === null) {
      return;
    }
    const params = { registerDetailJson: json, registerId: detailRow.value.id };
    const ob = currentEditRow.value?.id
      ? updateRegisterDetail({ ...params, id: currentEditRow.value.id })
      : insertRegisterDetail(params);
    ob.then(() => {
      // 刷新明细表格数据
      detailGridApi.query();
      message.success($t('common.successfulOperation'));
      closeEdit();
    });
  });
}

// ========== JSON 格式化工具 ==========

/**
 * 去掉 JSON 字符串中的注释（// 行注释 与 /* 块注释 /）
 * 通过状态机跳过字符串字面量，避免误删字符串内的 //（如 http://）
 * @param text 原始 JSON 字符串
 */
function stripJsonComments(text: string): string {
  let inString = false;
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inString) {
      if (ch === '\\' && next !== undefined) {
        result += ch + next;
        i++;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      result += ch;
    } else if (ch === '"') {
      inString = true;
      result += ch;
    } else if (ch === '/' && next === '/') {
      // 跳过行注释到行尾
      while (i < text.length && text[i] !== '\n') {
        i++;
      }
    } else if (ch === '/' && next === '*') {
      // 跳过块注释
      i += 2;
      while (i < text.length - 1 && !(text[i] === '*' && text[i + 1] === '/')) {
        i++;
      }
      i++;
    } else {
      result += ch;
    }
  }
  return result;
}

/**
 * 解析后台返回的明细 JSON 字符串（含注释），解析失败时提示用户
 * @param text 明细 JSON 字符串
 */
function parseDetailJson(text: string): any {
  try {
    return JSON.parse(stripJsonComments(text));
  } catch {
    message.error($t('registerDetail.jsonParseFailed'));
    return null;
  }
}

/**
 * 将明细表单对象序列化为 JSON 字符串，序列化失败时提示用户
 * @param obj 明细表单对象
 */
function stringifyDetailJson(obj: any): null | string {
  try {
    return JSON.stringify(obj);
  } catch {
    message.error($t('registerDetail.jsonStringifyFailed'));
    return null;
  }
}

// ========== 展示辅助 ==========

/**
 * 根据选项值获取对应文本
 * @param options 选项列表
 * @param value 选项值
 */
function optionText(options: any[], value: any) {
  return options.find((item) => item.value === value)?.label ?? '-';
}

/**
 * 根据选项值获取Tag颜色
 * @param options 选项列表
 * @param value 选项值
 */
function optionColor(options: any[], value: any) {
  return options.find((item) => item.value === value)?.color ?? 'default';
}

/**
 * 组装登记工步展示文本（编号-名称）
 * @param row 登记行数据
 */
function registerFunctionTypeText(row: any) {
  return row.functionTypeName
    ? `${row.registerFunctionType}-${row.functionTypeName}`
    : row.registerFunctionType;
}

defineExpose({ open });
</script>

<template>
  <div>
  <Drawer
    v-model:open="show"
    :height="500"
    class="custom-class"
    placement="top"
    :title="`${$t('registerDetail.registerDetail')}：${detailRow.registerCode}`"
    @close="close"
  >
    <!-- 当前选中登记信息基本信息 -->
    <Descriptions :column="4" bordered class="mb-3">
      <DescriptionsItem :label="$t('functionRegisterManage.registerCode')">
        {{ detailRow.registerCode }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('functionRegisterManage.registerType')">
        <Tag :color="optionColor(registerTypeOptions, detailRow.registerType)">
          {{ optionText(registerTypeOptions, detailRow.registerType) }}
        </Tag>
      </DescriptionsItem>
      <DescriptionsItem :label="$t('functionRegisterManage.registerFunctionType')">
        {{ registerFunctionTypeText(detailRow) }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('functionRegisterManage.registerFlag')">
        <Tag :color="optionColor(registerFlagOptions, detailRow.registerFlag)">
          {{ optionText(registerFlagOptions, detailRow.registerFlag) }}
        </Tag>
      </DescriptionsItem>
      <DescriptionsItem :label="$t('functionRegisterManage.registerTrigger')">
        <Tag :color="optionColor(registerTriggerOptions, detailRow.registerTrigger)">
          {{ optionText(registerTriggerOptions, detailRow.registerTrigger) }}
        </Tag>
      </DescriptionsItem>
      <DescriptionsItem :label="$t('functionRegisterManage.registerUser')">
        {{ detailRow.registerUser }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('functionRegisterManage.isUse')">
        <Tag :color="detailRow.isUse === 1 ? 'green' : 'red'">
          {{ detailRow.isUse === 1 ? $t('common.enable') : $t('common.stopUsing') }}
        </Tag>
      </DescriptionsItem>
      <DescriptionsItem :label="$t('functionRegisterManage.registerTime')">
        {{ detailRow.registerTime }}
      </DescriptionsItem>
    </Descriptions>

    <DetailGrid>
      <template #toolbar-tools>
        <!-- 新增明细按钮 -->
        <Button
          v-if="props.author.includes('新增')"
          type="primary"
          @click="openEdit('add')"
        >
          {{ $t('registerDetail.addDetailInfo') }}
        </Button>
      </template>
      <template #action="{ row }">
        <!-- 查看明细 -->
        <Tooltip>
          <template #title>{{ $t('common.view') }}</template>
          <Button
            class="mr-4"
            type="link"
            @click="openEdit('view', row)"
          >
            <Icon icon="mdi:eye-outline" class="inline-block align-middle text-2xl" />
          </Button>
        </Tooltip>

        <!-- 编辑明细 -->
        <Tooltip>
          <template #title>{{ $t('common.edit') }}</template>
          <Button
            v-if="props.author.includes('编辑')"
            class="mr-4"
            type="link"
            @click="openEdit('edit', row)"
          >
            <Icon icon="mdi:edit-outline" class="inline-block align-middle text-2xl" />
          </Button>
        </Tooltip>

        <!-- 删除明细 -->
        <Tooltip>
          <template #title>{{ $t('common.delete') }}</template>
          <Button
            v-if="props.author.includes('删除')"
            danger
            type="link"
            @click="delDetailRow(row)"
          >
            <Icon icon="mdi-light:delete" class="inline-block align-middle text-2xl" />
          </Button>
        </Tooltip>
      </template>
    </DetailGrid>
  </Drawer>

  <!-- 明细新增 / 编辑 / 查看 抽屉 -->
    <Drawer
      v-model:open="showEdit"
      :footer-style="{ textAlign: 'right' }"
      :width="800"
      class="custom-class"
      placement="right"
      :title="
        currentMode === 'view'
          ? $t('registerDetail.viewDetailInfo')
          : currentMode === 'edit'
            ? $t('registerDetail.editDetailInfo')
            : $t('registerDetail.addDetailInfo')
      "
    >
      <Form
        ref="editForm"
        :label-col="{ span: 5 }"
        :model="formData"
        :rules="editRules"
        :wrapper-col="{ span: 17 }"
        autocomplete="off"
        name="detailEditMessageForm"
      >
        <template v-for="field in currentFields" :key="field.key">
          <!-- 普通输入框 -->
          <FormItem
            v-if="field.type === 'input'"
            :label="$t(`registerDetail.${field.label}`)"
            :name="field.key"
          >
            <Input
              v-model:value="formData[field.key]"
              :disabled="currentMode === 'view'"
              :placeholder="$t('functionRegisterManage.placeholderInput')"
            />
          </FormItem>

          <!-- 下拉选择 -->
          <FormItem
            v-else-if="field.type === 'select'"
            :label="$t(`registerDetail.${field.label}`)"
            :name="field.key"
          >
            <Select
              v-model:value="formData[field.key]"
              :disabled="currentMode === 'view'"
              :options="field.options"
            />
          </FormItem>

          <!-- 多行文本（示例json字符串） -->
          <FormItem
            v-else-if="field.type === 'textarea'"
            :label="$t(`registerDetail.${field.label}`)"
            :name="field.key"
          >
            <Textarea
              v-model:value="formData[field.key]"
              :disabled="currentMode === 'view'"
              :placeholder="$t('functionRegisterManage.placeholderInput')"
              :rows="field.rows"
            />
          </FormItem>

          <!-- 子表格（对象数组） -->
          <FormItem
            v-else-if="field.type === 'table'"
            :label="$t(`registerDetail.${field.label}`)"
          >
            <Collapse ghost :default-active-key="['table']">
              <CollapsePanel
                key="table"
                :header="`${$t(`registerDetail.${field.label}`)} (${(formData[field.key] || []).length})`"
              >
                <Table
                  :columns="getTableColumns(field)"
                  :data-source="formData[field.key] || []"
                  :pagination="false"
                  :row-key="(_record: any, index?: number) => String(index)"
                  bordered
                  class="mb-3"
                  size="small"
                >
                  <template #bodyCell="{ column, record, index }">
                    <!-- 操作列：删除行 -->
                    <template v-if="column.dataIndex === 'action'">
                      <Button
                        danger
                        type="link"
                        @click="removeTableRow(field.key, index)"
                      >
                        <Icon
                          icon="mdi-light:delete"
                          class="inline-block align-middle text-2xl"
                        />
                      </Button>
                    </template>
                    <!-- 编辑模式：单元格内输入框 -->
                    <template v-else-if="currentMode !== 'view'">
                      <Input
                        v-model:value="record[column.dataIndex as string]"
                        class="text-center"
                        size="small"
                        :placeholder="String(column.title)"
                      />
                    </template>
                    <!-- 查看模式：纯文本展示 -->
                    <template v-else>
                      {{ record[column.dataIndex as string] }}
                    </template>
                  </template>
                </Table>
                <Button
                  v-if="currentMode !== 'view'"
                  block
                  type="dashed"
                  @click="addTableRow(field.key, field.tableColumns)"
                >
                  <Icon
                    icon="mdi:plus"
                    class="inline-block align-middle text-2xl"
                  />
                  {{ $t('registerDetail.addRow') }}
                </Button>
              </CollapsePanel>
            </Collapse>
          </FormItem>
        </template>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="closeEdit">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button
            v-if="currentMode !== 'view'"
            type="primary"
            @click="submit"
          >
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </div>
</template>
