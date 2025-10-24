<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, ref } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import { $t } from '@vben/locales';

import {
  Button,
  Drawer,
  Form,
  FormItem,
  message,
  Modal,
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
  place: {
    type: Number,
    default: undefined,
  },
});

// region 处理进度

/**
 * 处理进度文本
 */
const scheduleColumns = [
  '问题判定待签到',
  '问题处理签到',
  '问题判定处理中',
  '问题待领取',
  '问题已领取',
  '问题超时',
  '问题处理待签到',
  '问题处理处理中',
  '完成',
];
/**
 * 处理进度文本颜色列表
 */
const scheduleColors = [
  'bg-sky-500/25',
  'bg-sky-500/50',
  'bg-sky-500/75',
  'bg-sky-500/100',
  'bg-sky-500',
  'bg-pink-500',
  'bg-cyan-500/100',
  'bg-cyan-500',
  'bg-green-500',
];

// endregion
// region 表格

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  cellClassName({ row, column }) {
    if (column.field === 'schedule') {
      return scheduleColors[row.schedule - 1];
    }
    return null;
  },
  columns: [
    {
      title: '序号',
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    {
      field: 'andonCode',
      title: '任务编号',
      minWidth: 120,
    },
    {
      field: 'workorderCode',
      title: '工单编号',
      minWidth: 200,
    },
    {
      field: 'process',
      title: '当前工序',
      minWidth: 120,
    },
    {
      field: 'equipCode',
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
      field: 'levelReason',
      title: '升级类型',
      minWidth: 120,
    },
    {
      field: 'schedule',
      title: '处理进度',
      minWidth: 150,
      slots: { default: 'processingProgress' },
    },
    {
      field: 'andonErrorType',
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
  height: 300,
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
/**
 * 获取紧急程度文本描述
 * 功能：将数字类型的紧急程度代码转换为可读文本
 *
 * @param type - 紧急程度代码
 *              1: 紧急
 *              2: 急
 *              3: 一般
 * @returns 对应中文文本描述，未匹配时返回'未知'
 *
 * 注意事项：
 * - 代码与文本的映射关系需与后端保持一致
 * - 新增紧急程度类型时需要更新此方法
 * - 默认返回'未知'用于处理未定义类型值
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
 * 功能：将0-9的数字转换为中文数字表示
 *
 * @param num - 需要转换的数字(0-9)
 * @returns 对应的中文数字，超出范围返回undefined
 *
 * 注意事项：
 * - 仅支持0-9的数字转换
 * - 输入超出范围时返回数组越界值(undefined)
 * - 需要支持更大数字时应扩展转换逻辑
 * - 数组索引与阿拉伯数字直接对应(0->'零',1->'一')
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

// region 查询数据

/**
 * 查询安灯记录数据
 * 功能：根据组件状态查询评价列表或常规安灯记录
 * 流程：
 * 1. 构建分页参数和过滤条件
 * 2. 根据state/place参数判断查询类型：
 *   - 当state=3或place=3时查询评价列表
 *   - 其他情况查询常规安灯记录
 * 3. 转换接口返回数据适配表格分页格式
 *
 * @param page - 当前页码
 * @param pageSize - 每页数据量
 *
 * 接口说明：
 * - evaluationListQuery       评价列表查询接口
 * - lampInstallationRecordQuery 常规安灯记录查询接口
 * 公共参数：
 * {
 *   pageNum: 页码,
 *   pageSize: 每页数量,
 *   process: 当前工序
 * }
 *
 * 注意事项：
 * - state和place参数通过props传入组件
 * - 评价查询时固定state=3
 * - 返回数据需转换为{total, items}格式适配vxe-table
 * - 当前未处理接口异常情况，需补充错误处理逻辑
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params: any = {
      pageNum: page,
      pageSize,
      process: props.process,
      state: props.state === 3 || props.place === 3 ? 3 : undefined,
    };

    if (props.state === 3) {
      evaluationListQuery(params).then(({ total, list }: any) => {
        resolve({ total, items: list });
      });
    } else {
      lampInstallationRecordQuery(params).then(({ total, list }: any) => {
        resolve({ total, items: list });
      });
    }
  });
}

/**
 * 查询并展示备注详情
 * 功能：根据安灯记录ID获取备注信息并以模态框形式展示
 * 流程：
 * 1. 调用备注查询接口获取原始数据
 * 2. 将分号分隔的备注内容转换为段落数组
 * 3. 使用Modal组件展示格式化后的备注内容
 *
 * @param id - 安灯记录唯一标识
 *
 * 接口说明：
 * queryRemark - 备注信息查询接口
 * 返回数据格式：分号分隔的字符串（例："备注1;备注2;备注3"）
 *
 * 注意事项：
 * - 使用h函数动态生成段落元素
 * - 数据分割符为英文分号
 * - 模态框内容区域支持自动换行
 * - 当前未处理接口异常情况，需补充错误处理逻辑
 */
function queryRemarksFun(id: string) {
  queryRemark(id).then((data: any) => {
    const arr = data.split(';');
    const pArr: any[] = [];
    arr.forEach((item: any) => {
      pArr.push(h('p', item));
    });
    Modal.info({
      title: '处理结果查看',
      content: h('div', {}, pArr),
    });
  });
}
// endregion

// region 安灯评价
// 是否显示安灯评价抽屉
const showViewDrawer = ref(false);
// 当前评价的安灯记录
const editItem = ref<any>({});
// form表单数据
const formState = ref<any>({
  degree: 1,
});
// form表单
const formRef = ref();

/**
 * 打开安灯评价抽屉
 * 功能：初始化评价表单并显示评价界面
 *
 * @param row - 当前操作的安灯记录行数据
 *
 * 注意事项：
 * - 会更新全局状态showViewDrawer控制抽屉显隐
 * - 存储当前行数据用于后续评价提交
 * - 需与Drawer组件配合使用
 */
function showViewDrawerFun(row: any) {
  showViewDrawer.value = true;
  editItem.value = row;
}
/**
 * 关闭安灯评价抽屉
 * 功能：重置评价表单并隐藏抽屉组件
 *
 * 注意事项：
 * - 会重置评价表单至初始状态（好评选中）
 * - 会更新全局状态showViewDrawer控制抽屉显隐
 * - 与showViewDrawerFun函数构成开/关配对操作
 */
function close() {
  showViewDrawer.value = false;
  formState.value = {
    degree: 1,
  };
}

/**
 * 提交安灯评价
 * 功能：验证并提交评价表单数据
 * 流程：
 * 1. 执行表单验证
 * 2. 构建包含评价等级和安灯ID的请求参数
 * 3. 调用安灯评价接口提交数据
 * 4. 成功后刷新表格数据并关闭抽屉
 *
 * 接口说明：
 * anDengSEvaluation - 安灯评价提交接口
 * 参数结构：
 * {
 *   degree: 评价等级,
 *   remark: 评价备注,
 *   andonId: 安灯记录ID
 * }
 *
 * 注意事项：
 * - 必须先通过表单验证才能提交
 * - 使用国际化机制处理成功提示信息
 * - 提交成功后自动刷新表格数据
 * - 未处理接口异常情况，需补充错误处理逻辑
 */
function submit() {
  formRef.value.validate().then(() => {
    const params = {
      ...formState.value,
      andonId: editItem.value.id,
    };
    anDengSEvaluation(params).then(() => {
      message.success($t('common.successfulOperation'));
      close();
      gridApi.reload();
    });
  });
}

/**
 * 获取评价备注占位符文本
 * 功能：根据评价等级返回对应的国际化提示文本
 *
 * @returns 国际化后的占位符文本
 *
 * 注意事项：
 * - 依赖formState中degree字段值进行判断
 * - 评价等级与翻译键对应关系：
 *   1 -> 'andon.goodReview' (好评)
 *   3 -> 'andon.poorEvaluation' (差评)
 *   default -> 'andon.ordinary' (一般)
 * - 新增评价等级时需要扩展case条件
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
      {{ scheduleColumns[row.schedule - 1] || '未定义' }}
    </template>
    <template #action="{ row }">
      <!-- 安灯评价 -->
      <Tooltip>
        <template #title>{{ $t('andon.anDengSEvaluation') }}</template>
        <Button type="link" @click="showViewDrawerFun(row)">
          <Icon
            icon="mdi:account-edit-outline"
            class="inline-block align-middle text-2xl"
          />
        </Button>
      </Tooltip>
      <!-- 查看备注 -->
      <Tooltip>
        <template #title>{{ $t('andon.eye') }}</template>
        <Button type="link" @click="queryRemarksFun(row.id)">
          <Icon
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
    title="评价"
    @close="close"
  >
    <Form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
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
