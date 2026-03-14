<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
import { $t, useI18n } from '@vben/locales';

import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  RadioButton,
  RadioGroup,
  Select,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addedBatteryRules,
  getThePowerRule,
  thePowerRuleIsTurnedOnAndOff,
} from '#/api';
import { queryAuth } from '#/util';

// region 表格配置
/**
 * 电量时段规则表格配置选项
 * 用于配置表格的列、分页、排序等属性
 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'month', title: '月份', minWidth: 150 },
    { field: 'startTime', title: '计算时间', minWidth: 150 },
    {
      field: 'type',
      title: '类型',
      minWidth: 150,
      slots: { default: 'typeText' },
    },
    {
      field: 'status',
      slots: { default: 'isUse' },
      title: '状态',
      minWidth: 150,
    },
    { field: 'createTime', title: '创建时间', minWidth: 150 },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryRuleList({
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

/**
 * 表格事件监听器
 */
const gridEvents: VxeGridListeners<any> = {};

/**
 * 初始化表格组件和API
 */
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 时间类型
 */
const typeOptions = [
  {
    label: $t('basic.electricityTimeSlotRule.peakHours'),
    value: 1,
  },
  {
    label: $t('basic.electricityTimeSlotRule.fengHours'),
    value: 2,
  },
  {
    label: $t('basic.electricityTimeSlotRule.usualTimes'),
    value: 3,
  },
  {
    label: $t('basic.electricityTimeSlotRule.valleyTime'),
    value: 4,
  },
];

function getTypeText(type: number) {
  // 1尖时段 2 峰时段 3 平时段 4 谷时段
  switch (type) {
    case 1: {
      return $t('basic.electricityTimeSlotRule.peakHours');
    }
    case 2: {
      return $t('basic.electricityTimeSlotRule.fengHours');
    }
    case 3: {
      return $t('basic.electricityTimeSlotRule.usualTimes');
    }
    case 4: {
      return $t('basic.electricityTimeSlotRule.valleyTime');
    }
  }
}

// endregion

// region 数据查询

// 查询参数
const queryParams = ref<any>({
  month: '',
  startTime: '',
  type: '',
});

/**
 * 查询电量时段规则列表数据
 * @param {object} params - 查询参数
 * @param {number} params.page - 当前页码
 * @param {number} params.pageSize - 每页数据条数
 * @returns {Promise} 返回包含分页数据的Promise对象
 */
function queryRuleList({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 调用API获取电量时段规则列表
    getThePowerRule({
      pageNum: page, // 当前页码
      pageSize, // 每页数量
      ...queryParams.value,
    })
      .then(({ total, list }) => {
        // 返回表格所需的数据格式
        resolve({
          items: list, // 数据列表
          total, // 总数据条数
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// endregion

// region 规则编辑功能
/**
 * 规则编辑抽屉是否显示
 */
const showDrawer = ref(false);

/**
 * 规则编辑表单数据
 */
const ruleFormState = ref<any>({});

// region 表单验证规则
/**
 * 规则编辑表单验证规则
 * 定义各字段的必填项和验证规则
 */
const { locale } = useI18n();
const separator = locale.value === 'zh-CN' ? '、' : ', ';
const editRules: any = {
  month: [
    {
      required: true,
      message: $t('ui.formRules.required'),
      trigger: 'change',
    },
    {
      pattern: /^([1-9]|1[0-2])(,\s*([1-9]|1[0-2]))*$/,
      message: `请输入1-12的正整数${separator}多个月份请用英文逗号分隔`,
      trigger: 'blur',
    },
  ],
  type: [
    { required: true, message: $t('ui.formRules.required'), trigger: 'change' },
  ],
  startTime: [
    {
      required: true,
      message: $t('ui.formRules.required'),
      trigger: 'change',
    },
    {
      pattern: /^(\d|1\d|2[0-3])(,\s*(\d|1\d|2[0-3]))*$/,
      message: `请输入0-23的正整数${separator}多个时间请用英文逗号分隔`,
      trigger: 'blur',
    },
  ],
};
// endregion

/**
 * 规则编辑表单引用
 */
const ruleFormRef = ref<any>({});

/**
 * 打开规则编辑抽屉
 * @param {object} row - 行数据，编辑时传入，新增时为空
 */
function openRuleDrawer(row?: any) {
  ruleFormState.value = row ? { ...row } : {};
  showDrawer.value = true;
}

/**
 * 关闭规则编辑抽屉
 */
function closeRuleDrawer() {
  ruleFormState.value = {};
  showDrawer.value = false;
}

/**
 * 保存电量时段规则
 * 验证表单后调用接口保存数据
 */
function saveRule() {
  ruleFormRef.value.validate().then((valid: boolean) => {
    if (valid) {
      const params: any = {
        ...ruleFormState.value,
      };

      // 调用接口保存规则数据
      addedBatteryRules(params)
        .then(() => {
          message.success($t('common.successfulOperation'));
          closeRuleDrawer();
          gridApi.reload();
        })
        .catch(() => {
          message.error('保存失败');
        });
    }
  });
}

// endregion

// region 状态切换
/**
 * 切换规则状态
 * @param {object} row - 行数据，包含规则ID和状态信息
 */
function toggleRuleStatus(row: any) {
  const params = {
    ...row,
    isUse: row.isUse === 1 ? 2 : 1,
  };
  thePowerRuleIsTurnedOnAndOff(params)
    .then(() => {
      message.success($t('common.successfulOperation'));
    })
    .finally(() => {
      gridApi.reload();
    });
}

// endregion

// region 权限管理
/**
 * 当前用户权限列表
 */
const author = ref<string[]>([]);

/**
 * 路由信息
 */
const route = useRoute();

function queryAuthor() {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
}

// endregion

/**
 * 组件挂载后初始化
 */
onMounted(() => {
  queryAuthor();
});
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 月份 -->
        <FormItem
          :label="$t('basic.electricityTimeSlotRule.month')"
          style="margin-bottom: 1em"
          name="month"
        >
          <Input v-model:value="queryParams.month" class="w-full" />
        </FormItem>
        <!-- 计算时间 -->
        <FormItem
          :label="$t('basic.electricityTimeSlotRule.time')"
          style="margin-bottom: 1em"
          name="startTime"
        >
          <Input v-model:value="queryParams.startTime" class="w-full" />
        </FormItem>
        <!-- 类型 -->
        <FormItem
          :label="$t('basic.electricityTimeSlotRule.type')"
          style="margin-bottom: 1em"
          name="type"
        >
          <Select
            v-model:value="queryParams.type"
            :options="typeOptions"
            class="!w-48"
            allow-clear
          />
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
          <Button
            type="primary"
            @click="openRuleDrawer()"
            v-if="author.includes('新增')"
          >
            {{ $t('common.add') }}
          </Button>
        </template>

        <template #isUse="{ row }">
          <RadioGroup
            v-model:value="row.isUse"
            @change="toggleRuleStatus(row)"
            :disabled="!author.includes('状态变更')"
          >
            <RadioButton :value="1">
              {{ $t('status.enable') }}
            </RadioButton>
            <RadioButton :value="2">
              {{ $t('status.forbidden') }}
            </RadioButton>
          </RadioGroup>
        </template>

        <template #typeText="{ row }">
          {{ getTypeText(row.type) }}
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- region 规则编辑抽屉 -->
    <Drawer
      v-model:open="showDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="500"
      class="custom-class"
      placement="right"
      root-class-name="root-class-name"
      title="规则编辑"
    >
      <Form
        ref="ruleFormRef"
        :model="ruleFormState"
        :rules="editRules"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
      >
        <!-- 月份 -->
        <FormItem
          :label="$t('basic.electricityTimeSlotRule.month')"
          style="margin-bottom: 1em"
          name="month"
        >
          <Input v-model:value="ruleFormState.month" class="w-full" />
        </FormItem>
        <!-- 类型 -->
        <FormItem
          :label="$t('basic.electricityTimeSlotRule.type')"
          style="margin-bottom: 1em"
          name="type"
        >
          <Select
            v-model:value="ruleFormState.type"
            :options="typeOptions"
            class="!w-48"
          />
        </FormItem>
        <!-- 计算时间 -->
        <FormItem
          :label="$t('basic.electricityTimeSlotRule.time')"
          style="margin-bottom: 1em"
          name="startTime"
        >
          <Input v-model:value="ruleFormState.startTime" class="w-full" />
        </FormItem>
      </Form>
      <template #footer>
        <Space>
          <!-- 取消按钮 -->
          <Button @click="closeRuleDrawer">
            {{ $t('common.cancel') }}
          </Button>
          <!-- 确认按钮 -->
          <Button type="primary" @click="saveRule">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
