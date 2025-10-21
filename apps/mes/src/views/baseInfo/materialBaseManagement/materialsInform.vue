<script lang="ts" setup>
import type { TreeProps } from 'ant-design-vue';

import { computed, h, ref } from 'vue';

import { Page } from '@vben/common-ui';
import {
  MdiEditOutline,
  MdiEyeOutline,
  MdiLightDelete,
  MdiLightSettings,
  MdiSearch,
  MdiTrayUpload,
  MdiUpdate,
} from '@vben/icons';

import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  Row,
  Space,
  Switch,
  Table,
  TabPane,
  Tabs,
  Tooltip,
  Tree,
  UploadDragger,
} from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { difference } from 'lodash-es';

import { $t } from '#/locales';

// region 查询数据
// 查询参数
const queryParams = ref({
  // 材料编号
  materialCode: '',
  // 材料名称
  materialName: '',
});

// endregion

// region 表格操作

// 表格列名
const columns = ref([
  {
    dataIndex: 'step',
    ellipsis: true,
    title: '#',
    width: 60,
  },
  {
    dataIndex: 'isQualityTest',
    ellipsis: true,
    title: '质检',
    width: 80,
  },
  {
    dataIndex: 'isContract',
    ellipsis: true,
    title: '合同',
    width: 80,
  },
  {
    dataIndex: 'isHalf',
    ellipsis: true,
    title: '半成品',
    width: 80,
  },
  {
    dataIndex: 'isZeroStock',
    ellipsis: true,
    title: '零库存',
    width: 80,
  },
  {
    dataIndex: 'materialTypeCode',
    ellipsis: true,
    title: '材料类别',
    width: 120,
  },
  {
    dataIndex: 'materialCode',
    ellipsis: true,
    title: '材料编号',
    width: 120,
  },
  {
    dataIndex: 'materialDrawingCode',
    ellipsis: true,
    title: '材料图号',
    width: 120,
  },
  {
    dataIndex: 'materialName',
    ellipsis: true,
    title: '材料名称',
    width: 120,
  },
  {
    dataIndex: 'unit',
    ellipsis: true,
    title: '单位',
    width: 120,
  },
  {
    dataIndex: 'minPackNumber',
    ellipsis: true,
    title: '最小包装数',
    width: 120,
  },
  {
    dataIndex: 'safeLevel',
    ellipsis: true,
    title: '安全量',
    width: 120,
  },
  {
    dataIndex: 'operation',
    ellipsis: true,
    fixed: 'right',
    title: '操作',
    width: 220,
  },
] as any[]);
// 表格滚动信息配置
const scroll = ref({
  scrollToFirstRowOnChange: true,
  x: 1500,
  y: 350,
});

// 表格数据
const data = ref([
  {
    isContract: true,
    isHalf: false,
    isQualityTest: true,
    isZeroStock: true,
    materialCode: 'MC001',
    materialDrawingCode: 'MDC001',
    materialName: '材料一',
    materialTypeCode: 'MT001',
    minPackNumber: 3,
    safeLevel: 50,
    unit: '个',
  },
  {
    isContract: false,
    isHalf: true,
    isQualityTest: false,
    isZeroStock: false,
    materialCode: 'MC002',
    materialDrawingCode: 'MDC002',
    materialName: '材料二',
    materialTypeCode: 'MT002',
    minPackNumber: 1,
    safeLevel: 80,
    unit: '件',
  },
  {
    isContract: true,
    isHalf: true,
    isQualityTest: true,
    isZeroStock: true,
    materialCode: 'MC003',
    materialDrawingCode: 'MDC003',
    materialName: '材料三',
    materialTypeCode: 'MT003',
    minPackNumber: 5,
    safeLevel: 120,
    unit: '套',
  },
  {
    isContract: false,
    isHalf: false,
    isQualityTest: false,
    isZeroStock: false,
    materialCode: 'MC004',
    materialDrawingCode: 'MDC004',
    materialName: '材料四',
    materialTypeCode: 'MT004',
    minPackNumber: 8,
    safeLevel: 60,
    unit: '盒',
  },
  {
    isContract: true,
    isHalf: true,
    isQualityTest: true,
    isZeroStock: true,
    materialCode: 'MC005',
    materialDrawingCode: 'MDC005',
    materialName: '材料五',
    materialTypeCode: 'MT005',
    minPackNumber: 2,
    safeLevel: 100,
    unit: '组',
  },
]);

// 表格分页信息
const pagination = computed(() => ({
  current: 5,
  pageSize: 20,
  total: 200,
}));

/**
 * 分页信息改变事件
 */
function paginationChange(page: any) {
  pagination.value.current = page.current;
  pagination.value.pageSize = page.pageSize;
}

// endregion

// region 树形菜单操作
// 当前展开的节点
const expandedKeys = ref<string[]>([]);
// 当前选中的节点
const selectedKeys = ref<string[]>([]);
// 节点数据
const treeData = ref<TreeProps['treeData']>([{ key: '0', title: '全部' }]);

// 远程加载节点数据
function onLoadData(treeNode: any) {
  return new Promise<void>((resolve) => {
    if (treeNode.dataRef?.children) {
      resolve();
      return;
    }
    setTimeout(() => {
      treeNode.dataRef!.children = [
        { key: `${treeNode.eventKey}-0`, title: 'Child Node' },
        { key: `${treeNode.eventKey}-1`, title: 'Child Node' },
      ];
      treeData.value = [...treeData.value!];
      resolve();
    }, 1000);
  });
}

function handleExpand(keys: string[], { expanded, node }: any) {
  // node.parent add from 3.0.0-alpha.10
  const tempKeys = ((node.parent ? node.parent.children : treeData) || []).map(
    ({ key }: any) => key,
  );
  expandedKeys.value = expanded
    ? [...difference(keys, tempKeys), node.key]
    : keys;
}

// endregion

// region 新增 / 编辑

// 抽屉是否显示
const showEditDrawer = ref(false);
// 编辑对象数据
const editMessage = ref({} as any);
// 编辑对象表单验证规则
const editRules = ref({
  downSafe: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  materialCode: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  materialName: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  upSafe: [{ message: '此项为必填项', required: true, trigger: 'change' }],
} as any);

/**
 * 显示编辑抽屉
 * @param row
 */
function showEdit(row: any) {
  showEditDrawer.value = true;
  editMessage.value = row;
}

// 关闭模态框
function onClose() {
  showEditDrawer.value = false;
}

// endregion

// region 维护pas

// 抽屉是否显示
const showPasDrawer = ref(false);
// 编辑对象数据
const editPasMessage = ref({} as any);
// 编辑对象表单验证规则
const editPasRules = ref({
  downSafe: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  materialCode: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  materialName: [
    { message: '此项为必填项', required: true, trigger: 'change' },
  ],
  upSafe: [{ message: '此项为必填项', required: true, trigger: 'change' }],
} as any);
// 文件列表
const fileList = ref([]);

/**
 * 显示编辑抽屉
 * @param row
 */
function showPas(row: any) {
  showPasDrawer.value = true;
  editPasMessage.value = row;
}

// 关闭模态框
function PasClose() {
  showEditDrawer.value = false;
}

// endregion

// region 查看

// 抽屉是否显示
const showEyeDrawer = ref(false);
// 查看数据对象
const eyeMessage = ref({} as any);
// 当前活跃的标签页
const activeKey = ref('1');
// 查看详情表头配置
const eyeColumns = ref([
  {
    dataIndex: 'step',
    ellipsis: true,
    title: '#',
    width: 60,
  },
  {
    dataIndex: 'productCode',
    ellipsis: true,
    title: '产品编号',
    width: 120,
  },
  {
    dataIndex: 'productName',
    ellipsis: true,
    title: '产品名称',
    width: 120,
  },
  {
    dataIndex: 'useNumber',
    ellipsis: true,
    title: '使用材料数',
    width: 120,
  },
]);
// 表格滚动信息配置
const eyeScroll = ref({
  scrollToFirstRowOnChange: true,
  x: 1200,
  y: 350,
});
// 表格数据
const eyeData = ref([]);
// 产品描述
const remark = ref('123456');

/**
 * 显示抽屉
 * @param row
 */
function showEye(row: any) {
  showEyeDrawer.value = true;
  eyeMessage.value = row;
}

/**
 * 关闭抽屉
 */
function eyeClose() {
  showEditDrawer.value = false;
}

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 材料编号 -->
        <FormItem
          :label="$t('basic.bomManagement.materialCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialCode" />
        </FormItem>
        <!-- 材料名称 -->
        <FormItem
          :label="$t('basic.bomManagement.materialName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialName" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 主要内容显示区域 -->

    <Row :gutter="16">
      <!-- region 树形菜单 -->
      <Col :lg="6" :md="8" :sm="4" :xl="4" :xs="10">
        <Card class="min-h-96">
          <Tree
            v-model:expanded-keys="expandedKeys"
            v-model:selected-keys="selectedKeys"
            :load-data="onLoadData"
            :tree-data="treeData"
            @expand="handleExpand"
          />
        </Card>
      </Col>
      <!-- endregion -->
      <!-- region 表格主体 -->
      <Col :lg="18" :md="16" :sm="20" :xl="20" :xs="14">
        <Card>
          <Table
            :columns="columns"
            :data-source="data"
            :pagination="pagination"
            :scroll="scroll"
            bordered
            @change="paginationChange"
          >
            <template #bodyCell="{ column, index, record }">
              <template v-if="column.dataIndex === 'step'">
                <span>{{ index + 1 }}</span>
              </template>
              <template
                v-else-if="
                  [
                    'isQualityTest',
                    'isContract',
                    'isHalf',
                    'isZeroStock',
                  ].includes(column.dataIndex as any)
                "
              >
                <Switch
                  v-model:checked="record[column.dataIndex as any]"
                  disabled
                />
              </template>

              <template v-else-if="column.dataIndex === 'operation'">
                <Space>
                  <!-- 编辑按钮 -->
                  <Tooltip>
                    <template #title>{{ $t('common.edit') }}</template>
                    <Button
                      :icon="
                        h(MdiEditOutline, { class: 'inline-block size-6' })
                      "
                      type="link"
                      @click="showEdit(record)"
                    />
                  </Tooltip>
                  <!-- 维护PAS按钮 -->
                  <Tooltip>
                    <template #title>
                      {{ $t('common.maintenancePAS') }}
                    </template>
                    <Button
                      :icon="
                        h(MdiLightSettings, {
                          class: 'inline-block size-6',
                        })
                      "
                      type="link"
                      @click="showPas(record)"
                    />
                  </Tooltip>
                  <!-- 更新物料标签描述按钮 -->
                  <Tooltip>
                    <template #title>
                      {{ $t('common.updatedMaterialLabelDescription') }}
                    </template>
                    <Button
                      :icon="
                        h(MdiUpdate, {
                          class: 'inline-block size-6',
                        })
                      "
                      type="link"
                    />
                  </Tooltip>
                  <!-- 查看按钮 -->
                  <Tooltip>
                    <template #title>{{ $t('common.view') }}</template>
                    <Button
                      :icon="h(MdiEyeOutline, { class: 'inline-block size-6' })"
                      type="link"
                      @click="showEye(record)"
                    />
                  </Tooltip>

                  <!-- 删除按钮 -->
                  <Tooltip>
                    <template #title>{{ $t('common.delete') }}</template>
                    <Button
                      :icon="
                        h(MdiLightDelete, {
                          class: 'inline-block size-6',
                        })
                      "
                      danger
                      type="link"
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

    <!-- region 编辑 -->
    <Drawer
      v-model:open="showEditDrawer"
      :footer-style="{ textAlign: 'right' }"
      :title="$t('common.edit')"
      :width="600"
      class="custom-class"
      placement="right"
      root-class-name="root-class-name"
      style="color: red"
    >
      <Form
        :label-col="{ span: 8 }"
        :model="editMessage"
        :rules="editRules"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        name="editMessageForm"
      >
        <!-- 材料编号 -->
        <FormItem :label="$t('basic.bomManagement.materialCode')" name="materialCode">
          <Input v-model:value="editMessage.materialCode" disabled />
        </FormItem>
        <!-- 材料名称 -->
        <FormItem :label="$t('basic.bomManagement.materialName')" name="materialName">
          <Input v-model:value="editMessage.materialName" disabled />
        </FormItem>
        <!-- 安全量上限 -->
        <FormItem
          :label="$t('basic.bomManagement.materialsInform.upSafe')"
          name="upSafe"
        >
          <InputNumber v-model:value="editMessage.upSafe" />
        </FormItem>
        <!-- 安全量下限 -->
        <FormItem
          :label="$t('basic.bomManagement.materialsInform.downSafe')"
          name="downSafe"
        >
          <InputNumber v-model:value="editMessage.downSafe" />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="onClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="onClose">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->

    <!-- region PAS维护 -->
    <Drawer
      v-model:open="showPasDrawer"
      :footer-style="{ textAlign: 'right' }"
      :title="$t('common.maintenancePAS')"
      :width="600"
      class="custom-class"
      placement="right"
      root-class-name="root-class-name"
    >
      <Form
        :label-col="{ span: 8 }"
        :model="editPasMessage"
        :rules="editPasRules"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        name="editMessageForm"
      >
        <!-- 材料编号 -->
        <FormItem :label="$t('basic.bomManagement.materialCode')" name="materialCode">
          <Input v-model:value="editMessage.materialCode" disabled />
        </FormItem>
        <!-- 材料名称 -->
        <FormItem :label="$t('basic.bomManagement.materialName')" name="materialName">
          <Input v-model:value="editMessage.materialName" disabled />
        </FormItem>
        <!-- 文件描述 -->
        <FormItem
          :label="$t('basic.bomManagement.materialsInform.pasDescribe')"
          name="pas_describe"
        >
          <Input v-model:value="editMessage.pas_describe" />
        </FormItem>
        <!-- 文件 -->
        <FormItem
          :label="$t('basic.bomManagement.materialsInform.files')"
          name="files"
        >
          <UploadDragger
            v-model:file-list="fileList"
            :multiple="true"
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            name="file"
          >
            <div class="flex justify-center">
              <MdiTrayUpload class="size-16" />
            </div>
            <p class="ant-upload-text">
              {{ $t('ui.widgets.file.tips') }}
            </p>
            <p class="ant-upload-hint">
              {{ $t('ui.widgets.file.tips1') }}
            </p>
          </UploadDragger>
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="PasClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="PasClose">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->

    <!-- region 查看详情 -->
    <Drawer
      v-model:open="showEyeDrawer"
      :footer-style="{ textAlign: 'right' }"
      :height="600"
      :title="$t('common.view')"
      class="custom-class"
      placement="top"
      root-class-name="root-class-name"
    >
      <Tabs v-model:active-key="activeKey">
        <TabPane
          key="1"
          :tab="$t('basic.bomManagement.materialsInform.productReference')"
        >
          <Table
            :columns="eyeColumns"
            :data-source="eyeData"
            :pagination="pagination"
            :scroll="eyeScroll"
            bordered
            @change="paginationChange"
          >
            <template #bodyCell="{ column, index }">
              <template v-if="column.dataIndex === 'step'">
                <span>{{ index + 1 }}</span>
              </template>
            </template>
          </Table>
        </TabPane>
        <TabPane
          key="3"
          :tab="$t('basic.bomManagement.materialsInform.productDescription')"
        >
          {{ remark }}
        </TabPane>
      </Tabs>
      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="eyeClose">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="eyeClose">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
