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
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData() {
  return new Promise((resolve, reject) => {
    const params: any = {
      ...queryParams.value,
      type: theSelectedOperation.value,
      defectId: id.value,
    };
    getReworkProceList({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
    })
      .then((data) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total: data.length,
          items: data,
        });
      })
      .catch((error) => {
        reject(error);
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

function queryFmData() {
  return new Promise((resolve, reject) => {
    const params: any = {
      defectId: id.value,
    };
    getReworkMaterialList({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
    })
      .then((data) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total: data.length,
          items: data,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}
// endregion

// region 提交
const { closeCurrentTab } = useTabs();

const submitLoading = ref(false);
function submit() {
  Modal.confirm({
    title: '确认提交',
    content: '确认提交？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      submitLoading.value = true;
      reowrkConfirm({
        defectId: id.value,
        isMaterialFlag: feedingStatus.value ? 1 : 2,
        proceList: currentRow.value,
        planMaterialLists: fmGridApi.grid.getTableData().tableData,
      })
        .then(() => {
          message.success($t('common.successfulOperation'));
          closeCurrentTab();
          // router.go(-1);
        })
        .finally(() => {
          submitLoading.value = false;
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
        <span class="border-l-4 border-sky-500 pl-4 text-2xl font-black">
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

    <!--- region 返工工序  -->
    <Row class="mb-4 items-center">
      <Col :span="4">
        <span class="border-l-4 border-sky-500 pl-4 text-2xl font-black">
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
