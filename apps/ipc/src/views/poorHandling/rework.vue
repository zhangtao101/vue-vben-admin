<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useTabs } from '@vben/hooks';
import { MdiHome } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Col,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  RadioButton,
  RadioGroup,
  Row,
  Switch,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getReworkMaterialList,
  getReworkProceList,
  reowrkConfirm,
} from '#/api';

// 加料状态
const feedingStatus = ref(false);
// 是否开立返工工单
const reworkSheetFlag = ref(false);

// 操作事项列表
const listOfOperationItems = ref<any>([
  {
    label: $t('rework.theProcessesWithinTheTechnologicalRoute'),
    value: 1,
  },
  {
    label: $t('rework.processesOutsideTheTechnologicalRoute'),
    value: 2,
  },
]);
// 选中的操作事项
const theSelectedOperation = ref(1);

// region 作业信息
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      type: 'checkbox',
      field: 'planCode',
      width: 50,
    },
    {
      field: 'processCode',
      title: '工序编号',
      minWidth: 200,
    },
    {
      field: 'processName',
      title: '工序名称',
      minWidth: 200,
    },
    {
      field: 'remark',
      title: '备注',
      minWidth: 200,
    },
  ],
  height: 300,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  radioConfig: {
    labelField: 'name',
    trigger: 'row',
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryData();
      },
    },
  },
  pagerConfig: {
    enabled: false,
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

// 当前选中表格行
const currentRow = ref<any>([]);
// 表格事件
const gridEvents: any = {
  checkboxChange: ({ records }: any) => {
    currentRow.value = records;
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// region 查询数据
const route = useRoute();
// 查询条件
const id = ref(route.params.id || 999);

const queryParams = ref<any>({
  proceCode: '',
  proceName: '',
});

/**
 * 查询返工工序列表数据
 * 功能：根据查询条件获取返工工序分页数据
 * 流程：
 * 1. 合并基础查询参数（工序编号/名称）
 * 2. 添加业务参数：
 *   - 工序类型（工艺路线内/外）
 *   - 当前缺陷单ID
 * 3. 调用工序列表接口获取数据
 * 4. 转换接口数据结构适配前端表格
 *
 * 接口说明：
 * getReworkProceList - 返工工序查询接口，接收以下参数：
 *   - proceCode: 工序编号
 *   - proceName: 工序名称
 *   - type: 工序类型（1-工艺路线内，2-工艺路线外）
 *   - defectId: 关联的缺陷单ID
 */
function queryData() {
  return new Promise((resolve, reject) => {
    // 构造请求参数
    const params: any = {
      ...queryParams.value, // 基础查询条件
      type: theSelectedOperation.value, // 工序类型选择
      defectId: id.value, // 当前缺陷单ID
    };

    // 调用工序列表接口
    getReworkProceList(params)
      .then((data) => {
        // 转换接口响应数据格式
        resolve({
          total: data.length, // 总记录数（未分页）
          items: data, // 工序列表数据
        });
      })
      .catch((error) => {
        reject(error); // 异常传递
      });
  });
}

// region 投料 feedingMaterials

const feedingMaterials: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      field: 'materialCode',
      title: '物料编号',
      minWidth: 150,
    },
    {
      field: 'materialName',
      title: '物料名称',
      minWidth: 150,
    },
    {
      field: 'unit',
      title: '单位',
      minWidth: 120,
    },
    {
      field: 'auxiliaryDoage',
      title: '标准用量',
      minWidth: 150,
    },
    {
      field: 'singleDosage',
      title: '实际用量',
      minWidth: 150,
      slots: {
        default: 'singleDosage',
      },
    },
  ],
  height: 300,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  radioConfig: {
    labelField: 'name',
    trigger: 'row',
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryFmData();
      },
    },
  },
  pagerConfig: {
    enabled: false,
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const [FmGrid, fmGridApi] = useVbenVxeGrid({ gridOptions: feedingMaterials });

/**
 * 查询返工物料列表数据
 * 功能：根据缺陷单ID获取关联物料及用量信息
 * 流程：
 * 1. 构造请求参数（当前缺陷单ID）
 * 2. 调用物料列表接口获取数据
 * 3. 转换接口数据结构适配前端表格
 *
 * 接口说明：
 * getReworkMaterialList - 返工物料查询接口，接收参数：
 *   - defectId: 当前处理的缺陷单ID
 *
 * 数据结构：
 * - materialCode: 物料编号
 * - materialName: 物料名称
 * - unit: 计量单位
 * - auxiliaryDoage: 标准用量
 * - singleDosage: 实际用量（可编辑字段）
 */
function queryFmData() {
  return new Promise((resolve, reject) => {
    const params: any = {
      defectId: id.value, // 从路由参数中获取的缺陷单ID
    };

    getReworkMaterialList(params)
      .then((data) => {
        resolve({
          total: data.length, // 总记录数（未分页）
          items: data, // 物料列表数据
        });
      })
      .catch((error) => {
        reject(error); // 异常传递
      });
  });
}
// endregion

// region 提交
const { closeCurrentTab } = useTabs();

const submitLoading = ref(false);
/**
 * 提交返工确认数据
 * 功能：执行返工方案最终确认及数据提交
 * 流程：
 * 1. 弹出确认对话框进行二次确认
 * 2. 确认后组装提交参数：
 *   - 缺陷单ID
 *   - 加料状态标识（1需加料/2不需加料）
 *   - 选中的工序列表
 *   - 物料用量表格数据
 * 3. 调用确认接口提交数据
 * 4. 成功时：
 *   - 显示操作成功提示
 *   - 关闭当前标签页
 * 5. 无论成功失败都重置提交状态
 *
 * 接口说明：
 * reowrkConfirm - 返工确认接口，接收完整的返工方案数据
 */
function submit() {
  Modal.confirm({
    title: '确认提交',
    content: '确认提交？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      submitLoading.value = true; // 开启加载状态防止重复提交
      reowrkConfirm({
        defectId: id.value, // 当前处理的缺陷单ID
        isMaterialFlag: feedingStatus.value ? 1 : 2, // 转换加料开关为接口需要的标识
        reworkSheetFlag: reworkSheetFlag.value ? 1 : 2, // 转换加料开关为接口需要的标识
        proceList: currentRow.value, // 用户选择的工序列表
        planMaterialLists: fmGridApi.grid.getTableData().tableData, // 带实际用量的物料数据
      })
        .then(() => {
          message.success($t('common.successfulOperation'));
          closeCurrentTab(); // 关闭当前操作标签页
        })
        .finally(() => {
          submitLoading.value = false; // 重置提交状态
        });
    },
  });
}

// region
</script>

<template>
  <Page>
    <!--- region 物料处理  -->
    <Row class="mb-4 items-center">
      <Col :span="4">
        <span class="border-l-4 border-sky-500 pl-4 text-xl font-black">
          {{ $t('rework.materialHandling') }}
        </span>
      </Col>
      <Col :span="20">
        <Switch
          v-model:checked="feedingStatus"
          :checked-children="$t('rework.addMaterials')"
          :un-checked-children="$t('rework.noMaterialsAdded')"
        />
      </Col>
    </Row>
    <!-- endregion -->
    <!--- region 是否开立返工工单  -->
    <Row class="mb-4 items-center">
      <Col :span="4">
        <span class="border-l-4 border-sky-500 pl-4 text-xl font-black">
          {{ $t('rework.openingTitle') }}
        </span>
      </Col>
      <Col :span="20">
        <Switch
          v-model:checked="reworkSheetFlag"
          :checked-children="$t('rework.open')"
          :un-checked-children="$t('rework.notToOpen')"
        />
      </Col>
    </Row>
    <!-- endregion -->

    <!--- region 返工工序  -->
    <Row class="mb-4 items-center">
      <Col :span="4">
        <span class="border-l-4 border-sky-500 pl-4 text-xl font-black">
          {{ $t('rework.reworkProcess') }}
        </span>
      </Col>
      <Col :span="20">
        <RadioGroup
          v-model:value="theSelectedOperation"
          button-style="solid"
          @change="
            () => {
              gridApi.reload();
            }
          "
        >
          <RadioButton
            :value="item.value"
            v-for="item of listOfOperationItems"
            :key="item.value"
          >
            <MdiHome class="inline-block text-xl" />
            {{ item.label }}
          </RadioButton>
        </RadioGroup>
      </Col>
    </Row>
    <!-- endregion -->

    <!-- region 工序 -->
    <Card class="mb-5">
      <Form layout="inline" :model="queryParams">
        <!--产品SN码 -->
        <FormItem :label="$t('rework.processNumber')">
          <Input v-model:value="queryParams.proceCode" />
        </FormItem>
        <!--工单号 -->
        <FormItem :label="$t('rework.processName')">
          <Input v-model:value="queryParams.proceName" />
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            @click="
              () => {
                gridApi.reload();
              }
            "
            class="mr-4"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>

      <Grid />
    </Card>
    <!-- endregion -->

    <!-- region 投料 -->

    <Row class="mb-4 items-center">
      <Col :span="4">
        <span class="border-l-4 border-sky-500 pl-4 text-2xl font-black">
          {{ $t('rework.feedingMaterials') }}
        </span>
      </Col>
    </Row>
    <Card>
      <FmGrid>
        <template #singleDosage="{ row }">
          <InputNumber
            v-model:value="row.singleDosage"
            class="w-full"
            :min="0"
          />
        </template>
      </FmGrid>
      <div class="float-right">
        <!-- 确认 -->
        <Button
          type="primary"
          @click="submit"
          :loading="submitLoading"
          :disabled="currentRow.length === 0"
          class="mr-4 mt-4 w-48"
        >
          {{ $t('common.confirm') }}
        </Button>
      </div>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
