<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MaterialSymbolsSearch, MingcuteEditLine } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Col,
  Collapse,
  CollapsePanel,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  RangePicker,
  Row,
  Space,
  Spin,
  Table,
  Tooltip,
} from 'ant-design-vue';

import {
  getByWorksheetCodeAndMaterialCode,
  getMenusWeb,
  listPlanMaterialByWorksheetCode,
  searchWorksheetNoWater,
  waterDelete,
  waterSave,
  waterUpdate,
} from '#/api';

// 路由信息
const route = useRoute();

// region 表格

const columns = ref([
  {
    dataIndex: 'step',
    ellipsis: true,
    title: '#',
    width: 60,
  },
  {
    dataIndex: 'workSheetCode',
    ellipsis: true,
    title: '工单号',
    width: 180,
  },
  {
    dataIndex: 'planDateStart',
    ellipsis: true,
    title: '计划时间',
    width: 120,
  },
  {
    dataIndex: 'planCode',
    ellipsis: true,
    title: '计划号',
    width: 180,
  },
  {
    dataIndex: 'lineName',
    ellipsis: true,
    title: '任务线别',
    width: 120,
  },
  {
    dataIndex: 'subProductName',
    ellipsis: true,
    title: '部件名称',
    width: 120,
  },
  {
    dataIndex: 'sideNo',
    ellipsis: true,
    title: '面号',
    width: 120,
  },
  {
    dataIndex: 'workSheetPlanNumber',
    ellipsis: true,
    title: '工单计划数',
    width: 120,
  },
  {
    dataIndex: 'workSheetFinishNumber',
    ellipsis: true,
    title: '工单完成数',
    width: 120,
  },
  {
    dataIndex: 'productName',
    ellipsis: true,
    title: '产品名称',
    width: 120,
  },
  {
    dataIndex: 'subPlanNumber',
    ellipsis: true,
    title: '部件计划数量',
    width: 120,
  },
  {
    dataIndex: 'productCode',
    ellipsis: true,
    title: '产品编号',
    width: 120,
  },
  {
    dataIndex: 'worksheetCodea',
    ellipsis: true,
    title: 'A工单号',
    width: 120,
  },
  {
    dataIndex: 'subProductCode',
    ellipsis: true,
    title: '部件编号',
    width: 120,
  },
  {
    dataIndex: 'subPlanCode',
    ellipsis: true,
    title: '部件计划号',
    width: 120,
  },
  {
    dataIndex: 'produceUnarrangedNumber',
    ellipsis: true,
    title: '生产未排数',
    width: 120,
  },
  {
    dataIndex: 'produceNotFinishNumber',
    ellipsis: true,
    title: '生产未完数',
    width: 120,
  },
  {
    dataIndex: 'produceWorkshop',
    ellipsis: true,
    title: '生产车间',
    width: 120,
  },
  {
    dataIndex: 'remark',
    ellipsis: true,
    title: '备注',
    width: 180,
  },
  {
    dataIndex: 'updateUsername',
    ellipsis: true,
    title: '操作人',
    width: 120,
  },
  {
    dataIndex: 'updateTime',
    ellipsis: true,
    title: '操作时间',
    width: 120,
  },
  {
    dataIndex: 'operation',
    ellipsis: true,
    fixed: 'right',
    title: '操作',
    width: 120,
  },
] as any[]);
// 表格滚动信息配置
const scroll = ref({
  scrollToFirstRowOnChange: true,
  x: 1500,
  y: 350,
});

// 表格数据
const data = ref([{}]);

// 分页信息
const paging = ref({
  current: 1,
  pageSize: 20,
  total: 200,
});
// 表格分页信息
const pagination = computed<any>(() => paging);

// 查询参数
const queryParams = ref<any>({});

// 表格加载状态
const tableLoading = ref(false);

/**
 * queryData - 负责根据当前的查询参数、分页信息和日期范围，从后端服务查询数据。
 * 该函数会更新表格的加载状态，并在查询完成后更新数据列表和总条数。
 */
function queryData() {
  // 将表格加载状态设置为 true，表示开始加载数据。
  tableLoading.value = true;

  // 构建查询参数对象，包含所有查询参数、当前页码和每页显示的数据条数。
  const params = {
    // 展开 queryParams.value 对象，包含所有查询参数。
    ...queryParams.value,
    // 设置当前页码。
    pageNum: paging.value.current,
    // 设置每页显示的数据条数。
    pageSize: paging.value.pageSize,
  };

  // 如果存在计划日期范围，则格式化日期并从 params 中移除原始的 planDate。
  if (params.planDate) {
    // 格式化开始日期为 'YYYY-MM-DD' 格式。
    params.planDateStart = params.planDate[0].format('YYYY-MM-DD');
    // 格式化结束日期为 'YYYY-MM-DD' 格式。
    params.planDateEnd = params.planDate[1].format('YYYY-MM-DD');
    // 从 params 中移除原始的 planDate，避免发送不必要的数据。
    delete params.planDate;
  }

  // 调用 searchWorksheetNoWater 函数查询数据。
  searchWorksheetNoWater(params)
    .then(({ total, list }) => {
      // 更新数据列表。
      data.value = list;
      // 更新总条数。
      paging.value.total = total;
    })
    .finally(() => {
      // 无论查询成功与否，都将表格加载状态设置为 false，表示数据加载完成。
      tableLoading.value = false;
    });
}

/**
 * 处理分页变化的函数。
 * 当分页控件的当前页或每页显示条数发生变化时，这个函数会被调用以更新分页状态。
 *
 * @param {object} page - 包含分页信息的对象。
 */
function paginationChange(page: any) {
  /**
   * 更新当前页码。
   * 将传入的 page 对象中的 current 属性值赋给 paging.value.current。
   * 这表示用户选择了新的当前页码。
   */
  paging.value.current = page.current;

  /**
   * 更新每页显示条数。
   * 将传入的 page 对象中的 pageSize 属性值赋给 paging.value.pageSize。
   * 这表示用户选择了新的每页显示条数。
   */
  paging.value.pageSize = page.pageSize;

  queryData();
}

// endregion

// region 新增/编辑
// 编辑对象
const editItem = ref<any>({});
// 编辑抽屉是否显示
const editDrawer = ref(false);
// 表单对象
const formRef = ref();
// 表单数据
const formState = ref<any>([]);
// bom数据加载状态
const bomLoading = ref(false);
// 当前活跃的面板
const activeKey = ref(-1);

/**
 * showEdit - 显示编辑抽屉，并加载与给定工作表代码相关的物料清单（BOM）数据。
 * @param {object} row - 当前行的数据对象，包含工作表代码等信息。
 */
function showEdit(row: any) {
  // 设置编辑抽屉的显示状态为 true，以显示抽屉。
  editDrawer.value = true;

  // 将当前行的数据赋值给 editItem，以便在编辑抽屉中使用。
  editItem.value = row;

  // 将物料清单的加载状态设置为 true，表示开始加载 BOM 数据。
  bomLoading.value = true;

  // 调用 listPlanMaterialByWorksheetCode 函数，根据工作表代码查询 BOM 数据。
  listPlanMaterialByWorksheetCode({
    worksheetCode: row.workSheetCode,
  })
    .then((res) => {
      // 查询成功后，将返回的 BOM 数据赋值给 editItem 的 bom 属性。
      editItem.value.bom = res;
    })
    .finally(() => {
      // 无论查询成功与否，都将物料清单的加载状态设置为 false，表示 BOM 数据加载完成。
      bomLoading.value = false;
    });
}

/**
 * close - 关闭编辑抽屉，并重置编辑状态。
 * 此函数将编辑抽屉的显示状态设置为 false，清空编辑项的数据，并重置表单状态。
 */
function close() {
  // 设置编辑抽屉的显示状态为 false，以隐藏抽屉。
  editDrawer.value = false;

  activeKey.value = -1;
  editItem.value.bom = undefined;
  // 清空编辑项的数据，将 editItem 重置为一个空对象。
  editItem.value = {};

  // 重置表单状态，将 formState 重置为一个空数组。
  // 这里假设 formState 是一个数组，用于存储表单的某种状态。
  formState.value = [];
}

/**
 * addLine - 在表单状态数组的指定索引位置添加一个新的空行。
 * @param {number} index - 需要添加空行的索引位置。
 */
function addLine(index: number) {
  // 检查 formState 数组在指定索引位置是否有值，如果没有，则初始化为空数组。
  if (!formState.value[index]) {
    formState.value[index] = [];
  }

  // 在指定索引位置的数组中添加一个新的空对象，代表一个新的空行。
  formState.value[index].push({});
}

/**
 * delLine - 删除表单状态数组中的一行，并根据该行是否具有唯一标识符（如 `id`）来决定操作。
 * @param {number} rowIndex - 需要删除的行的索引位置。
 * @param {number} index - 需要删除的行的索引位置。
 * @param {object} item - 需要删除的行的数据对象。
 */
function delLine(rowIndex: number, index: number, item: any) {
  // 弹出确认对话框，询问用户是否确定删除。
  Modal.confirm({
    // 当用户点击确认按钮时执行的函数。
    onOk() {
      // 如果该行具有唯一标识符 `id`，则发送删除请求。
      if (item.id) {
        item.loading = true;
        // 调用 waterDelete 函数，根据 `id` 删除对应的数据。
        waterDelete({
          id: item.id,
        })
          .then(() => {
            // 删除成功后，显示成功消息。
            message.success($t('common.successfulOperation'));
            // 重新查询湿度含量数据。
            queryMoistureContent(rowIndex);
          })
          .finally(() => {
            item.loading = false;
          });
      } else {
        // 如果该行没有 `id`，则直接从 formState 数组中移除。
        formState.value[rowIndex].splice(index, 1);
        // 显示成功消息。
        message.success($t('common.successfulOperation'));
      }
    },
    // 设置对话框标题为“确定删除吗？”
    title: '确定删除吗？',
  });
}

// 物料加载状态
const materialLoading = ref(false);

/**
 * queryMoistureContent - 根据给定的工作表代码和物料代码查询含水度数据，并更新表单状态。
 * @param {any} key - 用于访问 editItem.bom 中特定物料信息的键。
 */
function queryMoistureContent(key: any) {
  if (!key && key !== 0) return;
  // 将物料加载状态设置为 true，表示开始加载数据。
  materialLoading.value = true;

  // 调用 getByWorksheetCodeAndMaterialCode 函数，根据工作表代码和物料代码查询湿度含量数据。
  getByWorksheetCodeAndMaterialCode({
    materialCode: editItem.value.bom[key].materialCode, // 从 editItem.bom 中获取特定物料的代码。
    worksheetCode: editItem.value.workSheetCode, // 从 editItem 中获取工作表代码。
  })
    .then((res) => {
      // 遍历返回的结果，将水分含量数值乘以 100（如果需要的话，这个操作可能是为了转换单位）。
      res.forEach((item: any) => {
        item.waterNumber *= 100;
        item.waterNumber = item.waterNumber.toFixed(2);
      });
      // 更新 formState 中对应 key 的数据。
      formState.value[key] = res;
    })
    .finally(() => {
      // 无论查询成功与否，都将物料加载状态设置为 false，表示数据加载完成。
      materialLoading.value = false;
    });
}

/**
 * submit - 提交表单数据，根据数据是否已有 `id` 来决定是更新数据还是保存新数据。
 * @param {object} item - 当前要提交的表单项数据。
 * @param {number} index - 当前表单项在数组中的索引。
 */
function submit(item: any, index: number) {
  // 验证表单数据的有效性。
  formRef.value.validate().then(() => {
    // 构建提交参数对象，包含当前表单项数据和其他必要信息。
    const params = {
      ...item, // 展开 item 对象，包含表单项的所有数据。
      materialCode: editItem.value.bom[index].materialCode, // 从 editItem.bom 中获取特定物料的代码。
      materialName: editItem.value.bom[index].materialName, // 从 editItem.bom 中获取特定物料的名称。
      worksheetCode: editItem.value.workSheetCode, // 从 editItem 中获取工作表代码。
    };

    // 如果水分含量数值之前被乘以100（如在 queryMoistureContent 函数中），则在这里除以100以恢复原始数值。
    params.waterNumber /= 100;

    // 根据 item 是否有 id 来判断是更新操作还是保存操作。
    const ob = item.id ? waterUpdate(params) : waterSave(params);

    item.loading = true;
    // 提交表单数据。
    ob.then(() => {
      // 提交成功后，显示成功消息。
      message.success($t('common.successfulOperation'));
      // 重新查询湿度含量数据。
      queryMoistureContent(index);
      showEdit(editItem.value);
    }).finally(() => {
      item.loading = false;
    });
  });
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);
// 编辑按钮是否显示
const editButton = ref(false);

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
  // 当 author.value 包含 '编辑' 时，设置 editButton.value 为 true，表示允许编辑
  editButton.value = author.value.includes('编辑');
});

// endregion

onMounted(() => {
  queryAuth();
  queryData();
});
</script>

<template>
  <Page class="bg-background-deep">
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 工单号 -->
        <FormItem
          :label="$t('waterContentMaintenance.workSheetCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.workSheetCode" />
        </FormItem>
        <!-- 计划时间 -->
        <FormItem
          :label="$t('waterContentMaintenance.planDate')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.planDate" />
        </FormItem>
        <!-- 产品编号 -->
        <FormItem
          :label="$t('waterContentMaintenance.productCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productCode" />
        </FormItem>
        <!-- 产品名称 -->
        <FormItem
          :label="$t('waterContentMaintenance.productName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productName" />
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

          <template v-else-if="column.dataIndex === 'operation'">
            <!-- 查看按钮 -->
            <Tooltip v-if="editButton">
              <template #title>{{ $t('common.edit') }}</template>
              <Button
                :icon="h(MingcuteEditLine, { class: 'inline-block size-6' })"
                class="mr-4"
                type="link"
                @click="showEdit(record)"
              />
            </Tooltip>
          </template>
        </template>
      </Table>
    </Card>
    <!-- endregion -->
    <!-- region 编辑 -->
    <Drawer
      v-model:open="editDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="600"
      placement="right"
      title="投料"
      @close="close"
    >
      <Spin :spinning="bomLoading">
        <Form ref="formRef" :model="formState" layout="inline">
          <Space class="w-full" direction="vertical">
            <Collapse
              v-model:active-key="activeKey"
              accordion
              @change="queryMoistureContent"
            >
              <CollapsePanel v-for="(bom, i) of editItem.bom" :key="i">
                <template #header>
                  <div>
                    <span
                      :class="{
                        'bg-lime-400': bom.waterState === 1,
                        'bg-gray-400': bom.waterState === -1,
                      }"
                      class="inline-block h-6 w-6 rounded-full align-bottom"
                    ></span>
                    {{ `${bom.materialCode}-${bom.materialName}` }}
                  </div>
                </template>
                <!-- waterState -->
                <Spin :spinning="materialLoading">
                  <template v-for="(item, index) of formState[i]" :key="index">
                    <div class="mb-4 border border-cyan-400 p-3">
                      <Row class="w-full">
                        <Col :span="8" class="mb-2">
                          <!-- 含水率 -->
                          <FormItem
                            :label="$t('waterContentMaintenance.waterNumber')"
                            :name="[i, index, 'waterNumber']"
                            :rules="[
                              { required: true, message: '该项为必填项!' },
                            ]"
                          >
                            <InputNumber
                              v-model:value="item.waterNumber"
                              :max="99"
                              :min="0"
                              addon-after="%"
                              @change="
                                () => {
                                  if (formState[i].length === 1) {
                                    item.standardNumber = (
                                      ((bom.materialDosage || 0) /
                                        (1 - item.waterNumber / 100)) as number
                                    ).toFixed(0);
                                  }
                                }
                              "
                            />
                          </FormItem>
                        </Col>
                        <Col :span="8" class="mb-2">
                          <!-- 批次号 -->
                          <FormItem
                            :label="$t('waterContentMaintenance.batchCode')"
                            :name="[i, index, 'batchCode']"
                            :rules="[
                              { required: true, message: '该项为必填项!' },
                            ]"
                          >
                            <Input v-model:value="item.batchCode" />
                          </FormItem>
                        </Col>
                        <Col :span="8" class="mb-2">
                          <!-- 储位号 -->
                          <FormItem
                            :label="
                              $t('waterContentMaintenance.wrehouseAreaCode')
                            "
                            :name="[i, index, 'wrehouseAreaCode']"
                            :rules="[
                              { required: false, message: '该项为必填项!' },
                            ]"
                          >
                            <Input v-model:value="item.wrehouseAreaCode" />
                          </FormItem>
                        </Col>
                        <Col :span="8" class="mb-2">
                          <!-- 库位号 -->
                          <FormItem
                            :label="$t('waterContentMaintenance.warehouseCode')"
                            :name="[i, index, 'warehouseCode']"
                            :rules="[
                              { required: false, message: '该项为必填项!' },
                            ]"
                          >
                            <Input v-model:value="item.warehouseCode" />
                          </FormItem>
                        </Col>
                        <Col :span="8" class="mb-2">
                          <!-- 实际库位号 -->
                          <FormItem
                            :label="
                              $t(
                                'waterContentMaintenance.actualStorageLocation',
                              )
                            "
                            :name="[i, index, 'actualStorageLocation']"
                            :rules="[
                              { required: false, message: '该项为必填项!' },
                            ]"
                          >
                            <Input v-model:value="item.sjWarehouseCode" />
                          </FormItem>
                        </Col>
                        <Col :span="8" class="mb-2">
                          <!-- 湿料标准量 -->
                          <FormItem
                            :label="
                              $t(
                                'waterContentMaintenance.standardAmountOfWetMaterial',
                              )
                            "
                            :name="[i, index, 'standardNumber']"
                            :rules="[
                              { required: false, message: '该项为必填项!' },
                            ]"
                          >
                            <InputNumber
                              v-model:value="item.standardNumber"
                              :min="0"
                              addon-after="KG"
                            />
                          </FormItem>
                        </Col>
                        <Col :span="8" class="mb-2">
                          <!-- 干料标准量 -->
                          <FormItem
                            :label="
                              $t(
                                'waterContentMaintenance.standardAmountOfDryMaterial',
                              )
                            "
                          >
                            <InputNumber
                              v-model:value="bom.materialDosage"
                              :min="0"
                              addon-after="KG"
                              readonly
                            />
                          </FormItem>
                        </Col>
                      </Row>

                      <Row class="w-full">
                        <Col :span="11">
                          <Button
                            :loading="item.loading"
                            class="w-full"
                            type="primary"
                            @click="submit(item, i)"
                          >
                            保存
                          </Button>
                        </Col>
                        <Col :offset="2" :span="11">
                          <Button
                            :loading="item.loading"
                            class="w-full"
                            danger
                            type="primary"
                            @click="delLine(i, index, item)"
                          >
                            删除
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  </template>
                  <Button class="w-full" type="primary" @click="addLine(i)">
                    添加
                  </Button>
                </Spin>
              </CollapsePanel>
            </Collapse>
          </Space>
        </Form>
      </Spin>
    </Drawer>
  </Page>
</template>

<style scoped></style>
