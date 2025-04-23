<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Progress,
  RadioGroup,
  Space,
  Textarea,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  anDengSEvaluation,
  evaluationListQuery,
  lampInstallationRecordQuery,
  queryRemark,
} from '#/api';
import { EVALUATION_STATUS } from '#/util';

const props = defineProps({
  process: {
    type: String,
    default: '',
  },
  state: {
    type: Number,
    default: -1,
  },
});

// region 表格

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      title: '序号',
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    {
      field: 'andon_code',
      title: '任务编号',
      minWidth: 120,
    },
    {
      field: 'workorder_code',
      title: '工单编号',
      minWidth: 120,
    },
    {
      field: 'process',
      title: '当前工序',
      minWidth: 120,
    },
    {
      field: 'equip_code',
      title: '关联设备',
      minWidth: 120,
    },
    {
      field: 'exigency',
      title: '紧急程度',
      minWidth: 120,
      slots: { default: 'exigency' },
    },
    {
      field: 'level',
      title: '当前层级',
      minWidth: 120,
      slots: { default: 'level' },
    },
    {
      field: 'level_reason',
      title: '升级类型',
      minWidth: 120,
    },
    {
      field: 'schedule',
      title: '处理进度',
      minWidth: 280,
      slots: { default: 'processingProgress' },
    },
    {
      field: 'andon_error_type',
      title: '异常类别',
      minWidth: 120,
      slots: { default: 'error' },
    },
    {
      field: 'processer',
      title: '操作人员',
      minWidth: 120,
    },
    {
      title: '操作',
      minWidth: 150,
      slots: {
        default: 'action',
      },
      fixed: 'right',
      visible: props.state === 3,
    },
  ],
  height: 200,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  pagerConfig: {
    enabled: false,
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

// gridApi
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// endregion

// region 格式化

/**
 * 获取紧急程度文本
 * @param type
 */
function getExigencyText(type: number) {
  switch (type) {
    case 1: {
      return '紧急';
    }
    case 2: {
      return '急';
    }
    case 3: {
      return '一般';
    }

    default: {
      return '未知';
    }
  }
}

/**
 * 阿拉伯数字转中文数字
 * @param num
 */
function getNumberText(num: number) {
  const chineseNumbers = [
    '零',
    '一',
    '二',
    '三',
    '四',
    '五',
    '六',
    '七',
    '八',
    '九',
  ];
  return chineseNumbers[num];
}
// cuow
const errorColums = ['生产异常', '质量异常', '设备异常', '物料异常', '误触'];

// endregion

// region 处理进度

/**
 * 处理进度文本
 */
const scheduleColumns = [
  '问题判定待签到',
  '问题判定处理中',
  '问题待领取',
  '问题已领取',
  '问题处理待签到',
  '问题处理处理中',
  '完成',
];
/**
 * 处理进度文本颜色列表
 */
const scheduleColors = [
  '#FFA07A',
  '#FFFF00',
  '#FFA07A',
  '#00BFFF',
  '#FFA07A',
  '#FFFF00',
  '#32CD32',
];

/**
 * 获取进度百分比
 * @param schedule 进度
 * @returns 进度百分比
 */
function getPercent(schedule: number) {
  return ((schedule || 0) / scheduleColumns.length) * 100;
}

// endregion

// region 查询数据

/**
 * 查询数据
 * @param page 页码
 * @param pageSize 每页条数
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    // lampInstallationRecordQuery
    resolve({
      total: page * pageSize,
      items: [{ schedule: 1 }, { schedule: 2 }],
    });
    const params = {
      pageNum: page,
      pageSize,
      process: props.process,
      state: props.state === 3 ? 3 : undefined,
    };
    if (props.state === 3) {
      evaluationListQuery(params).then((_data: any) => {
        // console.log(data);
      });
    } else {
      lampInstallationRecordQuery(params).then((_data: any) => {
        // console.log(data);
      });
    }
  });
}

/**
 * 查询备注
 * @param id
 */
function queryRemarksFun(id: string) {
  queryRemark(id).then((_remarks: any) => {
    // console.log(remarks);
  });

  Modal.info({
    title: 'This is a notification message',
    content: h('div', {}, [
      h('p', 'some messages...some messages...'),
      h('p', 'some messages...some messages...'),
    ]),
    onOk() {
      // console.log('ok');
    },
  });
}
// endregion

// region 安灯评价
// 是否显示安灯评价抽屉
const showViewDrawer = ref(false);
// 当前评价的安灯记录
const editItem = ref<any>({});
// form表单数据
const formState = ref<any>({});
// form表单
const formRef = ref();

/**
 * 显示安灯评价抽屉
 */
function showViewDrawerFun(row: any) {
  showViewDrawer.value = true;
  editItem.value = row;
}
/**
 * 关闭安灯评价抽屉
 */
function close() {
  showViewDrawer.value = false;
}

/**
 * 提交安灯评价抽屉
 */
function submit() {
  formRef.value.validate().then(() => {
    const params = {
      ...formState.value,
      andon_id: editItem.value.id,
    };
    anDengSEvaluation(params).then(() => {
      message.success($t('common.successfulOperation'));
      close();
      gridApi.reload();
    });
  });
}

/**
 * 获取表单占位符
 */
function getPlaceholder() {
  switch (formState.value.degree) {
    case 1: {
      return $t('andon.goodReview');
    }
    case 3: {
      return $t('andon.poorEvaluation');
    }
    default: {
      return $t('andon.ordinary');
    }
  }
}
// endregion
</script>

<template>
  <Grid>
    <template #exigency="{ row }">
      <span> {{ getExigencyText(row.exigency) }} </span>
    </template>
    <template #level="{ row }">
      <span> {{ getNumberText(row.level) }} </span>
    </template>
    <template #error="{ row }">
      <span> {{ errorColums[row.schedule - 1] || '未定义' }} </span>
    </template>
    <template #processingProgress="{ row }">
      <Progress
        :percent="getPercent(row.schedule)"
        :show-info="false"
        :stroke-color="scheduleColors[row.schedule - 1]"
        style="width: 120px"
        size="small"
      />
      {{ scheduleColumns[row.schedule - 1] || '未定义' }}
    </template>
    <template #action="{ row }">
      <!-- 安灯评价 -->
      <Tooltip>
        <template #title>{{ $t('andon.anDengSEvaluation') }}</template>
        <Button type="link" @click="showViewDrawerFun(row)">
          <IconifyIcon
            icon="mdi:account-edit-outline"
            class="inline-block align-middle text-2xl"
          />
        </Button>
      </Tooltip>
      <!-- 查看备注 -->
      <Tooltip>
        <template #title>{{ $t('andon.eye') }}</template>
        <Button type="link" @click="queryRemarksFun(row.id)">
          <IconifyIcon
            icon="mdi-light:eye"
            class="inline-block align-middle text-2xl"
          />
        </Button>
      </Tooltip>
    </template>
  </Grid>
  <Drawer
    v-model:open="showViewDrawer"
    :footer-style="{ textAlign: 'right' }"
    :width="600"
    class="custom-class"
    placement="right"
    title="查看详情"
  >
    <Form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <!-- 评价人员 -->
      <FormItem
        :label="$t('andon.evaluator')"
        :rules="[{ required: true, message: $t('andon.required') }]"
        style="margin-bottom: 1em"
        name="evaluatePeople"
      >
        <Input v-model:value="formState.evaluatePeople" />
      </FormItem>
      <!-- 评价结论 -->
      <FormItem
        :label="$t('andon.evaluationConclusion')"
        :rules="[{ required: true, message: $t('andon.required') }]"
        style="margin-bottom: 1em"
        name="degree"
      >
        <RadioGroup
          v-model:value="formState.degree"
          :options="EVALUATION_STATUS"
        />
      </FormItem>
      <!-- 备注 -->
      <FormItem
        :label="$t('andon.remarks')"
        :rules="[
          { required: formState.degree === 3, message: $t('andon.required') },
        ]"
        style="margin-bottom: 1em"
        name="remark"
      >
        <Textarea
          v-model:value="formState.remark"
          :placeholder="getPlaceholder()"
        />
      </FormItem>
    </Form>
    <template #footer>
      <Space>
        <!-- 取消 -->
        <Button @click="close">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 提交  -->
        <Button type="primary" @click="submit()">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped></style>
