<script lang="ts" setup>
/**
 * [INPUT]: 依赖 codingTemplateUnionMaintenance.service.ts 提供的喷码模板 CRUD/预览/导出接口，
 *           以及 productGroupMaintenance.service.ts（经由 #/api）提供的产品组下拉查询；
 *           依赖 @vben 公共组件与 ant-design-vue 组件库。
 * [OUTPUT]: 对外提供喷码模板维护页面组件（codingTemplateUnionMaintenance.vue），
 *            包含左侧喷码列表（1/4）与右侧新增/编辑区域（3/4）。
 * [POS]: 属于基础信息（baseInfo）模块的喷码模板维护页面，关联产品组维护，供生产喷码配置使用。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-07-29 09:30:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Col,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Radio,
  RadioGroup,
  Row,
  Select,
  Space,
  Table,
  Textarea,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createPrintCodeTemplate,
  deletePrintCodeTemplate,
  exportPrintCodeTemplates,
  getPrintCodeParameters,
  getPrintCodeTemplateDetail,
  listPrintCodeTemplates,
  listProductGroupOptions,
  previewPrintCodeTemplates,
  updatePrintCodeTemplate,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 下拉选项

// 产品组下拉选项列表（label/value 结构）
const productGroupOptions = ref<any[]>([]);
// 产品组下拉远程搜索加载状态，用于展示加载态
const productGroupFetching = ref(false);
// 产品组搜索防抖定时器句柄
let productGroupSearchTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * 加载产品组下拉选项
 * @param {string} keyword - 产品组编码或名称关键字，用于远程搜索；为空时加载全部启用项。
 * @returns {void} 无返回值，结果写入 productGroupOptions。
 * @since 2026-07-29 09:30:00
 */
function loadProductGroupOptions(keyword = '') {
  productGroupFetching.value = true;
  listProductGroupOptions({ keyword })
    .then((data: any) => {
      productGroupOptions.value = (data ?? []).map((item: any) => ({
        label: `${item.productGroupCode} - ${item.productGroupName}`,
        value: item.productGroupCode,
        productGroupName: item.productGroupName,
      }));
    })
    .catch(() => {
      productGroupOptions.value = [];
    })
    .finally(() => {
      productGroupFetching.value = false;
    });
}

/**
 * 产品组远程搜索（防抖 300ms），避免输入过程中频繁请求。
 * @param {string} value - 用户输入的搜索关键字。
 * @returns {void} 无返回值。
 * @since 2026-07-29 09:30:00
 */
function handleProductGroupSearch(value: string) {
  if (productGroupSearchTimer) {
    clearTimeout(productGroupSearchTimer);
  }
  productGroupSearchTimer = setTimeout(() => {
    loadProductGroupOptions(value);
  }, 300);
}

// 内销/出口选项
const salesTypeOptions = [
  { value: 1, label: $t('baseInfo.domesticSale') },
  { value: 2, label: $t('baseInfo.exportSale') },
];

// endregion

// region 格式化

/**
 * 内销/出口类型转义展示
 * @param {number} cellValue - 销售类型值：1=内销，2=出口。
 * @returns {string} 对应的国际化文案；未知值返回空串。
 * @since 2026-07-29 09:30:00
 */
function formatSalesType(cellValue: number) {
  if (cellValue === 1) {
    return $t('baseInfo.domesticSale');
  }
  if (cellValue === 2) {
    return $t('baseInfo.exportSale');
  }
  return '';
}

// endregion

// region 表格配置

// 左侧喷码列表 VXE Grid 配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  rowConfig: {
    isCurrent: true,
    isHover: true,
  },
  columns: [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    { field: 'printCode', title: $t('baseInfo.printCode'), minWidth: 110 },
    { field: 'productGroupName', title: $t('baseInfo.productGroup'), minWidth: 120 },
    { field: 'printName', title: $t('baseInfo.printName'), minWidth: 120 },
    {
      field: 'salesType',
      title: $t('baseInfo.salesType'),
      width: 90,
      formatter: ({ cellValue }) => formatSalesType(cellValue),
    },
    {
      field: 'action',
      slots: { default: 'action' },
      title: $t('baseInfo.action'),
      width: 70,
      fixed: 'right',
    },
  ],
  height: 500,
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
  proxyConfig: {
    ajax: {
      query: ({ page }) => {
        return queryData({
          page: page?.currentPage ?? 1,
          pageSize: page?.pageSize ?? 10,
        });
      },
    },
  },
};

// 左侧喷码列表事件监听
const gridEvents: VxeGridListeners<any> = {
  /**
   * 单元格点击事件：点击数据行加载详情到右侧编辑区；点击操作列不触发
   * @param {{ row: any; column: any }} params - 行与列信息。
   * @returns {void} 无返回值。
   * @since 2026-07-29 09:30:00
   */
  cellClick({ row, column }) {
    // 点击操作列不触发详情加载
    if (column.field === 'action') {
      return;
    }
    loadDetail(row.id);
  },
};

// 左侧喷码列表组件实例与 Grid API（用于清除当前行高亮等）
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// endregion

// region 数据查询

// 查询参数
const queryParams = reactive({
  productGroupCode: undefined as string | undefined,
  printCode: '',
});

/**
 * 重置查询条件并刷新列表
 * @returns {void} 无返回值。
 * @since 2026-07-29 09:30:00
 */
function handleQueryReset() {
  queryParams.productGroupCode = undefined;
  queryParams.printCode = '';
  gridApi.reload();
}

/**
 * 查询喷码模板分页数据，供 VXE Grid proxy 调用
 * @param {{ page: number; pageSize: number }} param - 分页参数：当前页与每页条数。
 * @returns {Promise<{ total: number; items: any[] }>} 分页结果（总数与当前页数据）。
 * @throws {Error} 接口请求失败时 reject 错误。
 * @since 2026-07-29 09:30:00
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams };
    if (!params.productGroupCode) {
      delete params.productGroupCode;
    }
    params.pageNum = page;
    params.pageSize = pageSize;

    listPrintCodeTemplates(params)
      .then((data: any) => {
        resolve({
          total: data?.total ?? 0,
          items: data?.results ?? [],
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// endregion

// region 新增 / 编辑区域

// 是否为新增模式
const isAdd = ref(true);
// 当前编辑的模板ID
const currentId = ref<number | undefined>(undefined);
// 编辑数据
const editData = ref<any>({
  productGroupCode: undefined,
  productGroupName: '',
  printCode: '',
  printName: '',
  dateFormat: '',
  salesType: undefined,
  templateOne: '',
  templateTwo: '',
  templateThree: '',
  parameters: [],
});
// 预览结果
const previewResults = ref<string[]>([]);

// 参数表格列定义（序号/参数ID/参数名称/参数值可编辑）
const parameterColumns = [
  {
    title: $t('page.common.serialNumber'),
    dataIndex: 'sortOrder',
    width: 60,
    align: 'center' as const,
  },
  {
    title: $t('baseInfo.parameterId'),
    dataIndex: 'parameterId',
    width: 120,
  },
  {
    title: $t('baseInfo.parameterName'),
    dataIndex: 'parameterName',
    width: 100,
  },
  {
    title: $t('baseInfo.parameterValue'),
    dataIndex: 'value',
  },
];

/**
 * 切换到新增模式，清空表单并加载 7 条初始化参数
 * @returns {void} 无返回值。
 * @since 2026-07-29 09:30:00
 */
function handleAdd() {
  isAdd.value = true;
  currentId.value = undefined;
  previewResults.value = [];
  // 清除左侧表格选中高亮
  gridApi.grid.clearCurrentRow();
  editData.value = {
    productGroupCode: undefined,
    productGroupName: '',
    printCode: '',
    printName: '',
    dateFormat: '',
    salesType: undefined,
    templateOne: '',
    templateTwo: '',
    templateThree: '',
    parameters: [],
  };
  // 加载7条初始化参数
  getPrintCodeParameters({})
    .then((data: any) => {
      editData.value.parameters = data ?? [];
    })
    .catch(() => {
      editData.value.parameters = [];
    });
}

/**
 * 加载模板详情（切换到编辑模式）
 * @param {number} id - 喷码模板主键。
 * @returns {void} 无返回值；失败时提示错误。
 * @since 2026-07-29 09:30:00
 */
function loadDetail(id: number) {
  getPrintCodeTemplateDetail({ id })
    .then((data: any) => {
      isAdd.value = false;
      currentId.value = id;
      previewResults.value = [];
      editData.value = { ...data, parameters: data?.parameters ?? [] };
    })
    .catch((error) => {
      message.error(error?.msg || $t('common.operationFailure'));
    });
}

/**
 * 产品组选择变化，同步产品组名称
 * @param {any} value - 选中的产品组编码。
 * @returns {void} 无返回值。
 * @since 2026-07-29 09:30:00
 */
function handleProductGroupChange(value: any) {
  const option = productGroupOptions.value.find(
    (item: any) => item.value === value,
  );
  editData.value.productGroupName = option?.productGroupName ?? '';
}

/**
 * 重置编辑区域：编辑模式重新加载详情，新增模式清空表单
 * @returns {void} 无返回值。
 * @since 2026-07-29 09:30:00
 */
function handleFormReset() {
  if (isAdd.value || currentId.value === undefined) {
    handleAdd();
  } else {
    loadDetail(currentId.value);
  }
}

/**
 * 保存（新增/修改）喷码模板，提交前做必填校验
 * @returns {void} 无返回值；成功提示并刷新列表，失败提示错误。
 * @since 2026-07-29 09:30:00
 */
function handleSave() {
  if (!editData.value.productGroupCode) {
    message.warning($t('baseInfo.selectProductGroup'));
    return;
  }
  if (!editData.value.printCode) {
    message.warning($t('baseInfo.inputPrintCode'));
    return;
  }
  if (!editData.value.dateFormat) {
    message.warning($t('baseInfo.inputDateFormat'));
    return;
  }
  if (!editData.value.salesType) {
    message.warning($t('baseInfo.selectSalesType'));
    return;
  }

  const action = isAdd.value
    ? createPrintCodeTemplate(editData.value)
    : updatePrintCodeTemplate(editData.value);

  action
    .then((data: any) => {
      message.success(
        isAdd.value ? $t('baseInfo.createSuccess') : $t('baseInfo.modifySuccess'),
      );
      // 新增成功后切换为编辑模式
      if (data?.id) {
        isAdd.value = false;
        currentId.value = data.id;
        editData.value = { ...data, parameters: data?.parameters ?? [] };
      }
      gridApi.reload();
    })
    .catch((error) => {
      message.error(error?.msg || $t('common.operationFailure'));
    });
}

/**
 * 生成三个喷码预览结果
 * @returns {void} 无返回值；结果写入 previewResults。
 * @since 2026-07-29 09:30:00
 */
function handlePreview() {
  const params: any = {
    templateId: currentId.value,
    dateFormat: editData.value.dateFormat ?? '',
    templateOne: editData.value.templateOne ?? '',
    templateTwo: editData.value.templateTwo ?? '',
    templateThree: editData.value.templateThree ?? '',
    parameters: editData.value.parameters ?? [],
  };

  previewPrintCodeTemplates(params)
    .then((data: any) => {
      previewResults.value = data ?? [];
    })
    .catch((error) => {
      message.error(error?.msg || $t('common.operationFailure'));
    });
}

// endregion

// region 删除

/**
 * 删除喷码模板（带确认弹窗）
 * @param {any} row - 当前行数据，需包含 id。
 * @returns {void} 无返回值。
 * @since 2026-07-29 09:30:00
 */
function handleDelete(row: any) {
  Modal.confirm({
    title: $t('baseInfo.confirmTitle'),
    content: $t('baseInfo.confirmDelete'),
    onOk: () => {
      deletePrintCodeTemplate({ id: row.id })
        .then(() => {
          message.success($t('baseInfo.deleteSuccess'));
          // 删除的是当前编辑的模板时，重置编辑区域
          if (currentId.value === row.id) {
            handleAdd();
          }
          gridApi.reload();
        })
        .catch((error) => {
          message.error(error?.msg || $t('common.operationFailure'));
        });
    },
    onCancel: () => {
      message.info($t('baseInfo.cancelPrompt'));
    },
  });
}

// endregion

// region 导出

/**
 * 导出喷码列表为 Excel 文件（blob 下载）
 * @returns {void} 无返回值；失败时提示错误。
 * @since 2026-07-29 09:30:00
 */
function handleExport() {
  const params: any = { ...queryParams };
  if (!params.productGroupCode) {
    delete params.productGroupCode;
  }

  exportPrintCodeTemplates(params)
    .then((res: any) => {
      const blob = new Blob([res], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${$t('baseInfo.printCodeList')}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      message.error(error?.msg || $t('common.operationFailure'));
    });
}

// endregion

// region 权限查询

// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 初始化

onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  loadProductGroupOptions();
  // 默认进入新增模式并加载初始化参数
  handleAdd();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 查询区 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 产品组 -->
        <FormItem :label="$t('baseInfo.productGroup')" style="margin-bottom: 1em">
          <Select
            v-model:value="queryParams.productGroupCode"
            :options="productGroupOptions"
            :placeholder="$t('baseInfo.selectProductGroup')"
            allow-clear
            style="width: 240px"
          />
        </FormItem>
        <!-- 喷码号码 -->
        <FormItem :label="$t('baseInfo.printCode')" style="margin-bottom: 1em">
          <Input
            v-model:value="queryParams.printCode"
            :placeholder="$t('baseInfo.inputPrintCode')"
          />
        </FormItem>

        <FormItem>
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="() => gridApi.reload()"
          >
            {{ $t('common.search') }}
          </Button>
          <Button class="ml-2" @click="handleQueryReset">
            <template #icon>
              <Icon icon="mdi:refresh" />
            </template>
            {{ $t('common.reset') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <Row :gutter="16">
      <!-- region 表格区（1/4） -->
      <Col :span="6">
        <Card>
          <Grid>
            <template #toolbar-tools>
              <Button
                v-if="author.includes('新增')"
                type="primary"
                @click="handleAdd"
              >
                <template #icon>
                  <Icon icon="mdi:plus" />
                </template>
                {{ $t('common.add') }}
              </Button>
              <Button
                v-if="author.includes('导出')"
                class="ml-2"
                @click="handleExport"
              >
                <template #icon>
                  <Icon icon="mdi:export" />
                </template>
                {{ $t('common.export') }}
              </Button>
            </template>
            <template #action="{ row }">
              <!-- 删除按钮 -->
              <Tooltip v-if="author.includes('删除')">
                <template #title>
                  {{ $t('common.delete') }}
                </template>
                <Button type="link" @click.stop="handleDelete(row)" danger>
                  <Icon icon="mdi:delete-outline" class="inline-block size-6" />
                </Button>
              </Tooltip>
            </template>
          </Grid>
        </Card>
      </Col>
      <!-- endregion -->

      <!-- region 新增/编辑区（3/4） -->
      <Col :span="18">
        <Card :title="isAdd ? $t('baseInfo.add') : $t('baseInfo.edit')">
          <!-- 右上方重置/保存按钮 -->
          <template #extra>
            <Space>
              <Button @click="handleFormReset">
                <template #icon>
                  <Icon icon="mdi:refresh" />
                </template>
                {{ $t('common.reset') }}
              </Button>
              <Button
                v-if="author.includes(isAdd ? '新增' : '编辑')"
                type="primary"
                @click="handleSave"
              >
                <template #icon>
                  <Icon icon="mdi:content-save-outline" />
                </template>
                {{ $t('common.save') }}
              </Button>
            </Space>
          </template>

          <Form :model="editData" layout="vertical" autocomplete="off">
            <Row :gutter="16">
              <!-- 产品组 -->
              <Col :span="8">
                <FormItem :label="$t('baseInfo.productGroup')" required>
                  <Select
                    v-model:value="editData.productGroupCode"
                    :options="productGroupOptions"
                    :placeholder="$t('baseInfo.selectProductGroup')"
                    :disabled="!isAdd"
                    show-search
                    :filter-option="false"
                    :not-found-content="productGroupFetching ? undefined : null"
                    @change="handleProductGroupChange"
                    @search="handleProductGroupSearch"
                  />
                </FormItem>
              </Col>
              <!-- 喷码号码 -->
              <Col :span="8">
                <FormItem :label="$t('baseInfo.printCode')" required>
                  <Input
                    v-model:value="editData.printCode"
                    :placeholder="$t('baseInfo.inputPrintCode')"
                    :disabled="!isAdd"
                  />
                </FormItem>
              </Col>
              <!-- 喷码名称 -->
              <Col :span="8">
                <FormItem :label="$t('baseInfo.printName')">
                  <Input
                    v-model:value="editData.printName"
                    :placeholder="$t('baseInfo.inputPrintName')"
                  />
                </FormItem>
              </Col>
              <!-- 日期格式 -->
              <Col :span="8">
                <FormItem :label="$t('baseInfo.dateFormat')" required>
                  <Input
                    v-model:value="editData.dateFormat"
                    :placeholder="$t('baseInfo.inputDateFormat')"
                  />
                </FormItem>
              </Col>
              <!-- 内销/出口 -->
              <Col :span="8">
                <FormItem :label="$t('baseInfo.salesType')" required>
                  <RadioGroup v-model:value="editData.salesType">
                    <Radio
                      v-for="item in salesTypeOptions"
                      :key="item.value"
                      :value="item.value"
                    >
                      {{ item.label }}
                    </Radio>
                  </RadioGroup>
                </FormItem>
              </Col>
            </Row>

            <Row :gutter="16">
              <!-- 喷码模板1 -->
              <Col :span="8">
                <FormItem :label="$t('baseInfo.templateOne')">
                  <Textarea v-model:value="editData.templateOne" :rows="5" />
                </FormItem>
              </Col>
              <!-- 喷码模板2 -->
              <Col :span="8">
                <FormItem :label="$t('baseInfo.templateTwo')">
                  <Textarea v-model:value="editData.templateTwo" :rows="5" />
                </FormItem>
              </Col>
              <!-- 喷码模板3 -->
              <Col :span="8">
                <FormItem :label="$t('baseInfo.templateThree')">
                  <Textarea v-model:value="editData.templateThree" :rows="5" />
                </FormItem>
              </Col>
            </Row>

            <Row :gutter="16">
              <!-- 参数表格 -->
              <Col :span="6">
                <FormItem :label="$t('baseInfo.parameterName')">
                  <Table
                    :columns="parameterColumns"
                    :data-source="editData.parameters"
                    :pagination="false"
                    row-key="parameterId"
                    size="small"
                    bordered
                  >
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.dataIndex === 'value'">
                        <Input
                          v-model:value="record.value"
                          :placeholder="$t('baseInfo.inputPlaceholder')"
                        />
                      </template>
                    </template>
                  </Table>
                </FormItem>
              </Col>

              <!-- 预览 -->
              <Col :span="18">
                <FormItem :label="$t('baseInfo.previewResult')">
                  <Button @click="handlePreview">
                    <template #icon>
                      <Icon icon="mdi:eye-outline" />
                    </template>
                    {{ $t('baseInfo.preview') }}
                  </Button>
                  <Row v-if="previewResults.length > 0" :gutter="8" class="mt-2">
                    <Col
                      v-for="(item, index) in previewResults"
                      :key="index"
                      flex="1"
                    >
                      <div class="preview-line">
                        <p>
                          {{ item }}
                        </p>
                      </div>
                    </Col>
                  </Row>
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Card>
      </Col>
      <!-- endregion -->
    </Row>
  </Page>
</template>

<style scoped>
.preview-line {
  height: 200px;
  padding: 4px 8px;
  margin-bottom: 4px;
  font-family: monospace;
  word-break: break-all;
  white-space: pre-wrap;
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}
</style>
