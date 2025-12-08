<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiEditOutline } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  InputNumber,
  message,
  RadioButton,
  RadioGroup,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getGasCarbonDioxideCalculationParameter,
  introductionOfGasCarbonDioxideCalculationParameter,
  useGasCarbonDioxideCalculationParameter,
} from '#/api';
import { queryAuth } from '#/util';

// region 表格
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'dwfr', title: '低单位发热量', minWidth: 150 },
    { field: 'dwrl', title: '单位热值含碳量', minWidth: 150 },
    { field: 'chl', title: '氧化率', minWidth: 150 },
    {
      field: 'status',
      slots: { default: 'isUse' },
      title: '状态',
      minWidth: 150,
    },
    { field: 'time', title: '创建时间', minWidth: 150 },
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

// endregion

// region 查询数据

/**
 * 从服务器查询工作站数据的函数。
 * 这个函数用于发送查询请求，并在成功获取数据后更新组件的状态。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    /**
     * 调用 queryWorkstation 函数，传入查询参数和分页信息。
     * 查询参数包括 queryParams.value 中的所有属性，以及当前页码和每页大小。
     */
    getGasCarbonDioxideCalculationParameter({
      pageNum: page, // 当前页码
      pageSize, // 每页数量
    })
      .then(({ total, list }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          items: list,
          total,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// endregion

// region 电网排放因子导入功能
// 模板基本信息编辑抽屉是否显示
const showDrawer = ref(false);
/**
 * 燃气二氧化碳计算参数导入表单数据
 */
const gasCarbonDioxideCalculationParameterImportFormState = ref<any>({});

/**
 * 燃气二氧化碳计算参数导入表单引用
 */
const gasCarbonDioxideCalculationParameterImportFormRef = ref<any>({});

/**
 * 显示编辑抽屉
 * @param row
 */
function showEdit(row?: any) {
  gasCarbonDioxideCalculationParameterImportFormState.value = row
    ? { ...row }
    : {};
  showDrawer.value = true;
}
function close() {
  gasCarbonDioxideCalculationParameterImportFormState.value = {};
  showDrawer.value = false;
}
/**
 * 提交电网排放因子导入表单
 * 验证表单后调用接口保存数据
 */
function handleGridEmissionFactorImportSubmit() {
  gasCarbonDioxideCalculationParameterImportFormRef.value
    .validate()
    .then((valid: boolean) => {
      if (valid) {
        const params: any = {
          ...gasCarbonDioxideCalculationParameterImportFormState.value,
        };

        // 调用接口保存数据
        introductionOfGasCarbonDioxideCalculationParameter(params).then(() => {
          message.success($t('common.successfulOperation'));
          close();
          gridApi.reload();
        });
      }
    });
}

// endregion

// region 状态切换
/**
 * 切换状态
 * @param row
 */
function updateStatus(row: any) {
  useGasCarbonDioxideCalculationParameter(row)
    .then(() => {
      message.success($t('common.successfulOperation'));
    })
    .finally(() => {
      gridApi.reload();
    });
}

// endregion

// region 权限
const author = ref<string[]>([]);
// 路由信息
const route = useRoute();

function queryAuthor() {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
}
// endregion

onMounted(() => {
  queryAuthor();
});
</script>

<template>
  <Page>
    <!-- region 表格主体 -->
    <Card>
      <Grid>
        <template #toolbar-tools>
          <!-- 新增按钮 -->
          <Button
            type="primary"
            @click="showEdit()"
            v-if="author.includes('新增')"
          >
            {{ $t('common.add') }}
          </Button>
        </template>

        <template #isUse="{ row }">
          <RadioGroup
            v-model:value="row.isUse"
            @change="updateStatus(row)"
            :disabled="!author.includes('状态变更')"
          >
            <RadioButton :value="1">
              {{ $t('status.enable') }}
            </RadioButton>
            <RadioButton :value="0">
              {{ $t('status.forbidden') }}
            </RadioButton>
          </RadioGroup>
        </template>
        <template #action="{ row }">
          <!-- 编辑按钮 -->
          <Tooltip v-if="author.includes('编辑')">
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
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- region 新增/编辑 -->
    <Drawer
      v-model:open="showDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="500"
      class="custom-class"
      placement="right"
      root-class-name="root-class-name"
      style="color: red"
      title="信息编辑"
    >
      <Form
        ref="gasCarbonDioxideCalculationParameterImportFormRef"
        :model="gasCarbonDioxideCalculationParameterImportFormState"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
      >
        <!-- 低位发热量 -->
        <FormItem
          :label="$t('energyConsumption.carbonEmissionAnalysis.lowHeatContent')"
          :rules="[{ required: true, message: $t('ui.formRules.required') }]"
          style="margin-bottom: 1em"
          name="dwfr"
        >
          <InputNumber
            v-model:value="
              gasCarbonDioxideCalculationParameterImportFormState.dwfr
            "
            class="w-full"
          />
        </FormItem>
        <!-- 单位热值含碳量 -->
        <FormItem
          :label="
            $t(
              'energyConsumption.carbonEmissionAnalysis.unitHeatContentCarbonDioxideContent',
            )
          "
          :rules="[{ required: true, message: $t('ui.formRules.required') }]"
          style="margin-bottom: 1em"
          name="dwrl"
        >
          <InputNumber
            v-model:value="
              gasCarbonDioxideCalculationParameterImportFormState.dwrl
            "
            class="w-full"
          />
        </FormItem>
        <!-- 碳氧化率 -->
        <FormItem
          :label="
            $t(
              'energyConsumption.carbonEmissionAnalysis.carbonDioxideOxidationRate',
            )
          "
          :rules="[{ required: true, message: $t('ui.formRules.required') }]"
          style="margin-bottom: 1em"
          name="chl"
        >
          <InputNumber
            v-model:value="
              gasCarbonDioxideCalculationParameterImportFormState.chl
            "
            class="w-full"
          />
        </FormItem>
        <!-- 月份 -->
        <!--        <FormItem
          :label="$t('energyConsumption.carbonEmissionAnalysis.month')"
          :rules="[{ required: true, message: $t('ui.formRules.required') }]"
          style="margin-bottom: 1em"
          name="time"
        >
          <DatePicker
            v-model:value="gridEmissionFactorImportFormState.time"
            picker="month"
          />
        </FormItem>-->
      </Form>
      <template #footer>
        <Space>
          <!-- 取消 -->
          <Button @click="close">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认 -->
          <Button type="primary" @click="handleGridEmissionFactorImportSubmit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
