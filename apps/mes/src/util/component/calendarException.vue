<script setup lang="ts">
/**
 * 工厂日历异常规则管理组件
 * 用于管理和维护工厂日历的特殊工作日规则，包括：
 * 1. 日历视图展示和特殊日期标识
 * 2. 异常规则的增删改查操作
 * 3. 工作日/非工作日的特殊设置
 * 4. 日历图例说明和数据表格管理
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { $t } from '@vben/locales';
import { useVbenVxeGrid } from '@vben/plugins/vxe-table';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Calendar,
  Col,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  RadioGroup,
  RangePicker,
  Row,
  Space,
  Spin,
  Tooltip,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  addAdditionalRule,
  deleteAdditionalRule,
  getAdditionalRuleDetail,
  queryAdditionalRules,
  updateAdditionalRule,
} from '#/api';

// region 日历详情展示管理
// 控制详情抽屉的显示状态
const detailsDrawer = ref(false);
// 存储当前查看的日历详情数据
const details = ref<any>({});

/**
 * 显示日历详情
 * 打开详情抽屉并展示选中日历的详细信息和日历视图
 * @param {object} row - 日历数据行对象，包含日历基本信息
 */
function showDetails(row: any) {
  // 显示详情抽屉
  detailsDrawer.value = true;
  // 存储当前选中的日历详情数据，使用扩展运算符确保数据独立性
  details.value = {
    ...row,
  };
}

/**
 * 关闭详情抽屉
 * 清空详情数据并关闭日历视图显示
 */
function detailsClose() {
  // 隐藏日历组件
  showCalendar.value = false;
  // 隐藏详情抽屉
  detailsDrawer.value = false;
  // 清空详情数据
  details.value = {};
}

/**
 * 获取日历日期的样式类名
 * 根据日期的属性（是否为异常日期、是否为非工作日）返回对应的CSS类名
 * @param {object} time - dayjs日期对象
 * @returns {string} CSS类名字符串，用于控制日期的显示样式
 */
function getADayOff(time: any) {
  // 首先检查是否为异常日期（黄色背景）
  if (isException(time)) {
    return 'bg-yellow-500 text-white';
  }

  // 根据星期几判断是否为设定的非工作日（青色背景）
  // dayjs的day()方法：0=周日，1=周一，...，6=周六
  switch (time.day()) {
    case 0: {
      // 周日
      return details.value.sunday === 1 ? 'bg-cyan-500 text-white' : '';
    }
    case 1: {
      // 周一
      return details.value.monday === 1 ? 'bg-cyan-500 text-white' : '';
    }
    case 2: {
      // 周二
      return details.value.tuesday === 1 ? 'bg-cyan-500 text-white' : '';
    }
    case 3: {
      // 周三
      return details.value.wednesday === 1 ? 'bg-cyan-500 text-white' : '';
    }
    case 4: {
      // 周四
      return details.value.thursday === 1 ? 'bg-cyan-500 text-white' : '';
    }
    case 5: {
      // 周五
      return details.value.friday === 1 ? 'bg-cyan-500 text-white' : '';
    }
    case 6: {
      // 周六
      return details.value.saturday === 1 ? 'bg-cyan-500 text-white' : '';
    }
    default: {
      // 异常情况返回空字符串
      return '';
    }
  }
}

/**
 * 判断给定日期是否为异常日期
 * 通过检查当前日期是否在特殊规则（isWork=1）的时间范围内来确定
 * @param {object} time - dayjs日期对象，需要检查的日期
 * @returns {boolean} 如果是异常日期返回true，否则返回false
 */
function isException(time: any) {
  // 获取表格中的所有异常规则数据
  const arr = gridApi.grid?.getTableData().tableData || [];

  // 遍历所有异常规则，检查当前日期是否在规则时间范围内
  for (const item of arr) {
    // 只检查标记为工作日的规则（isWork=1表示设为工作日的异常）
    if (item.isWork === 1) {
      // 使用dayjs的isBetween方法检查日期是否在规则起止日期之间
      // '[]'表示包含起止日期，'day'表示按天比较
      const res = time.isBetween(
        dayjs(item.startDate, 'YYYY-MM-DD'), // 规则开始日期
        dayjs(item.endDate, 'YYYY-MM-DD'), // 规则结束日期
        'day', // 比较精度：天
        '[]', // 包含边界（[startDate, endDate]）
      );
      if (res) {
        return true; // 找到匹配的异常规则，返回true
      }
    }
  }
  return false; // 没有找到匹配的异常规则，返回false
}

// endregion

// region 异常规则表格管理
/**
 * VXE表格配置选项
 * 配置工厂日历异常规则的数据展示表格，包含规则的基本信息和操作列
 * 支持分页、排序、工具栏等功能
 */
const gridOptions: VxeGridProps<any> = {
  align: 'center', // 表格内容居中对齐
  border: true, // 显示表格边框
  columns: [
    { title: '序号', type: 'seq', width: 50 }, // 序号列
    { field: 'ruleCode', title: '规则编号', minWidth: 150 }, // 规则唯一标识
    { field: 'ruleName', title: '规则名称', minWidth: 150 }, // 规则描述名称
    { field: 'startDate', title: '开始日期', minWidth: 150 }, // 规则生效开始日期
    { field: 'endDate', title: '结束日期', minWidth: 150 }, // 规则生效结束日期
    { field: 'uTime', title: '修改时间', minWidth: 150 }, // 规则最后修改时间
    { field: 'uName', title: '操作人', minWidth: 150 }, // 最后修改操作人员
    {
      field: 'action',
      fixed: 'right', // 固定在表格右侧
      slots: { default: 'action' }, // 操作列插槽
      title: '操作',
      minWidth: 220,
    },
  ],
  height: 500, // 表格固定高度
  stripe: true, // 斑马纹效果
  sortConfig: {
    multiple: true, // 支持多字段排序
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        // 异步查询异常规则数据
        return await queryData({
          page: page?.currentPage,
          pageSize: page?.pageSize,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true, // 支持自定义列显示
    // import: true, // 预留导入功能
    // export: true, // 预留导出功能
    refresh: true, // 刷新按钮
    zoom: true, // 缩放功能
  },
};

/**
 * 表格事件监听器配置
 * 处理表格的用户交互事件
 */
const gridEvents: VxeGridListeners<any> = {
  /* cellClick: ({ row }) => {
    // 单元格点击事件（示例代码，当前已注释）
    message.info(`cell-click: ${row.name}`);
  },*/
};

/**
 * 创建VXE表格实例
 * 使用useVbenVxeGrid钩子创建表格组件和API对象
 */
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 删除异常规则
 * 显示确认对话框，用户确认后调用删除接口删除指定的异常规则
 * @param {object} row - 表格行数据，包含要删除的异常规则信息
 */
function delRow(row: any) {
  Modal.confirm({
    cancelText: '取消',
    okText: '确认',
    okType: 'danger', // 危险操作，使用红色按钮
    onCancel() {
      // 用户取消删除时显示警告信息
      message.warning('已取消删除!');
    },
    onOk() {
      // 用户确认删除时执行删除操作
      deleteAdditionalRule({
        id: row.id, // 异常规则ID
      })
        .then(() => {
          // 删除成功时的处理
          message.success($t('common.successfulOperation')); // 显示成功提示
          gridApi.query(); // 重新查询表格数据
        })
        .catch((error) => {
          // 删除失败时的处理
          message.error($t('common.operationFailure')); // 显示通用错误提示
          message.error(error.msg); // 显示具体错误信息
        });
    },
    title: '是否确认删除该条数据?', // 确认对话框标题
  });
}

// endregion

// region 异常规则新增/编辑管理
// 表单引用对象，用于表单验证和重置
const form = ref();
// 控制新增/编辑对话框的显示状态
const showEditDialog = ref(false);
// 当前编辑的异常规则数据对象
const editItem = ref<any>({});
// 工作日类型选项配置
const workDayOptions = ref<any>([
  { label: $t('basic.factoryCalendar.workDay'), value: 2 }, // 工作日
  { label: $t('basic.factoryCalendar.nonWorkDay'), value: 1 }, // 非工作日
]);
// 表单验证规则配置
const editRules = ref<any>({
  staCode: [{ message: '此项为必填项', required: true, trigger: 'change' }],
  time: [{ message: '此项为必填项', required: true, trigger: 'change' }],
});
/**
 * 显示异常规则编辑对话框
 * 根据是否为新增操作，初始化编辑数据并显示对话框
 * @param {boolean} isCreate - 是否为新增操作，true为新增，false为编辑
 * @param {object} row - 编辑时传入的当前行数据对象（仅在isCreate=false时有效）
 */
function showEdit(isCreate: boolean, row?: any) {
  // 显示编辑对话框
  showEditDialog.value = true;

  if (isCreate) {
    // 新增操作：清空编辑数据
    editItem.value = {};
  } else {
    // 编辑操作：先清空编辑数据，然后查询规则详情
    editItem.value = {};
    getAdditionalRuleDetail({
      id: row.id, // 规则ID
    }).then((data: any) => {
      editItem.value = data;
      // 将日期字符串转换为dayjs对象数组，用于RangePicker组件显示
      editItem.value.time = [
        dayjs(editItem.value.startDate, 'YYYY-MM-DD'), // 开始日期
        dayjs(editItem.value.endDate, 'YYYY-MM-DD'), // 结束日期
      ];
    });
  }
}

/**
 * 关闭编辑对话框
 * 清空编辑数据并隐藏对话框
 */
function close() {
  showEditDialog.value = false;
  editItem.value = {};
}

// 表单提交加载状态控制
const submitLoading = ref(false);

/**
 * 提交异常规则表单数据
 * 执行表单验证，验证通过后根据是否包含ID决定是新增还是更新操作
 */
function submit() {
  /**
   * 使用Ant Design Vue表单的validate方法进行表单验证
   * 该方法返回Promise对象，验证通过时执行then中的逻辑
   */
  form.value.validate().then(() => {
    // 构造提交参数，包含编辑数据和关联的日历ID
    const params = {
      ...editItem.value,
      calendarId: details.value.id, // 关联的日历ID
    };

    // 处理日期范围数据：将数组格式转换为独立的开始和结束日期字符串
    if (params.time) {
      params.startDate = params.time[0].format('YYYY-MM-DD'); // 开始日期
      params.endDate = params.time[1].format('YYYY-MM-DD'); // 结束日期
      delete params.time; // 删除临时的时间数组属性
    }
    // 显示提交加载状态，防止重复提交
    submitLoading.value = true;

    // 根据是否存在ID决定调用新增还是更新接口
    const ob = editItem.value.id
      ? updateAdditionalRule(params) // 更新现有规则
      : addAdditionalRule(params); // 新增规则

    ob.then(() => {
      // 操作成功时的处理
      message.success($t('common.successfulOperation')); // 显示成功提示
      gridApi.query(); // 重新查询表格数据
      close(); // 关闭编辑对话框
    }).finally(() => {
      // 无论成功或失败，都要隐藏提交加载状态
      submitLoading.value = false;
    });
  });
}
// endregion

// region 异常规则数据查询
// 控制日历组件的显示状态，确保数据加载完成后再显示日历
const showCalendar = ref(false);

/**
 * 查询异常规则数据
 * 根据日历ID分页查询该日历下的所有异常规则数据
 * @param {object} params - 查询参数对象
 * @param {number} params.page - 当前页码
 * @param {number} params.pageSize - 每页显示的数据条数
 * @returns {Promise} 返回包含总数和数据列表的Promise对象
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 调用查询异常规则的API接口
    queryAdditionalRules({
      calendarId: details.value.id, // 关联的日历ID
      pageNum: page, // 当前页码
      pageSize, // 每页显示的数据条数
    })
      .then(({ total, list }) => {
        // 成功获取数据后，返回符合VXE表格要求的数据格式
        resolve({
          total, // 总记录数
          items: list, // 异常规则数据列表
        });
      })
      .catch((error) => {
        // 查询失败时拒绝Promise，传递错误信息
        reject(error);
      })
      .finally(() => {
        // 无论成功或失败，延迟500ms后显示日历组件
        // 确保表格数据加载完成后再显示日历视图，避免样式问题
        setTimeout(() => {
          showCalendar.value = true;
        }, 500);
      });
  });
}

// endregion

/**
 * 暴露 query 方法供父组件调用
 */
defineExpose({
  open: showDetails,
});
</script>

<template>
  <!-- region 日历详情展示抽屉 -->
  <!-- 全屏抽屉组件，用于展示日历详情和异常规则管理 -->
  <Drawer
    v-model:open="detailsDrawer"
    :footer-style="{ textAlign: 'right' }"
    height="100%"
    placement="top"
    title="信息详情"
    @close="detailsClose"
  >
    <!-- 日历基本信息展示区域 -->
    <!-- 日历名称显示项（只读） -->
    <FormItem
      :label="$t('basic.factoryCalendar.calendarName')"
      name="calendarName"
    >
      <Input v-model:value="details.calendarName" readonly />
    </FormItem>
    <!-- 所属组织显示项（只读） -->
    <FormItem
      :label="$t('basic.factoryCalendar.affiliation')"
      name="organizationName"
    >
      <Input v-model:value="details.organizationName" readonly />
    </FormItem>

    <!-- 日历视图和图例说明区域 -->
    <Row>
      <Col :span="4">
        <!-- 日历图例说明区域 -->
        <div>
          <!-- 图例标题 -->
          <span class="text-lg font-bold">
            {{ $t('basic.factoryCalendar.legend') }}
          </span>
          <!-- 非工作日图例（青色背景） -->
          <span
            class="m-4 block h-8 border bg-cyan-500 px-4 text-center leading-[200%] text-white"
          >
            {{ $t('basic.factoryCalendar.nonWorkDay') }}
          </span>
          <!-- 普通工作日图例（无背景色） -->
          <span class="m-4 block h-8 border px-4 text-center leading-[200%]">
            {{ $t('basic.factoryCalendar.workDay') }}
          </span>
          <!-- 异常日期图例（黄色背景） -->
          <span
            class="mx-4 block h-8 border bg-yellow-500 px-4 text-center leading-[200%] text-white"
          >
            {{ $t('basic.factoryCalendar.exception') }}
          </span>
        </div>
      </Col>
      <Col :span="20">
        <!-- 日历组件展示区域 -->
        <Spin :spinning="!showCalendar">
          <!-- 日历组件，显示当前月份的日期视图 -->
          <Calendar v-if="showCalendar">
            <!-- 自定义日期单元格渲染模板 -->
            <template #dateFullCellRender="{ current }">
              <div class="h-24 p-4">
                <!-- 日期数字显示，根据规则动态添加样式类 -->
                <span
                  class="inline-block h-8 w-8 rounded-full text-center leading-[200%]"
                  :class="getADayOff(current)"
                >
                  {{ current.date() }}
                </span>
              </div>
            </template>
          </Calendar>
        </Spin>
      </Col>
    </Row>

    <!-- 异常规则管理表格 -->
    <Grid v-if="detailsDrawer">
      <!-- 表格工具栏插槽：新增按钮 -->
      <template #toolbar-tools>
        <!-- 新增异常规则按钮 -->
        <Button type="primary" @click="showEdit(true)">
          {{ $t('common.add') }}
        </Button>
      </template>

      <!-- 表格操作列插槽：编辑和删除按钮 -->
      <template #action="{ row }">
        <!-- 编辑按钮 -->
        <Tooltip>
          <template #title>{{ $t('common.edit') }}</template>
          <Button class="mr-4" type="link" @click="showEdit(false, row)">
            <template #icon>
              <!-- 编辑图标 -->
              <Icon
                icon="mdi:edit-outline"
                class="inline-block align-middle text-2xl"
              />
            </template>
          </Button>
        </Tooltip>

        <!-- 删除按钮 -->
        <Tooltip>
          <template #title>{{ $t('common.delete') }}</template>
          <Button danger type="link" @click="delRow(row)">
            <template #icon>
              <!-- 删除图标 -->
              <Icon
                icon="mdi-light:delete"
                class="inline-block align-middle text-2xl"
              />
            </template>
          </Button>
        </Tooltip>
      </template>
    </Grid>
  </Drawer>

  <!-- region 异常规则新增/编辑抽屉 -->
  <!-- 右侧抽屉组件，用于新增或编辑异常规则 -->
  <Drawer
    v-model:open="showEditDialog"
    :footer-style="{ textAlign: 'right' }"
    :width="500"
    placement="right"
    title="信息编辑"
    @close="close"
  >
    <!-- 异常规则编辑表单 -->
    <Form
      :label-col="{ span: 8 }"
      :model="editItem"
      :rules="editRules"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
      name="editMessageForm"
      ref="form"
    >
      <!-- 规则编号字段（系统自动生成，只读） -->
      <FormItem :label="$t('basic.factoryCalendar.ruleCode')" name="ruleCode">
        <Input v-model:value="editItem.ruleCode" disabled />
      </FormItem>
      <!-- 特殊规则名称字段（用户输入） -->
      <FormItem :label="$t('basic.factoryCalendar.ruleName')" name="ruleName">
        <Input v-model:value="editItem.ruleName" />
      </FormItem>
      <!-- 特殊规则日期范围选择（开始日期-结束日期） -->
      <FormItem :label="$t('basic.factoryCalendar.time')" name="time">
        <RangePicker v-model:value="editItem.time" />
      </FormItem>
      <!-- 工作日类型选择（工作日/非工作日） -->
      <FormItem
        :label="$t('basic.factoryCalendar.workWeekSetting')"
        name="startDay"
      >
        <RadioGroup v-model:value="editItem.isWork" :options="workDayOptions" />
      </FormItem>
    </Form>

    <!-- 表单底部操作按钮区域 -->
    <template #footer>
      <Space>
        <!-- 取消按钮：关闭对话框，不保存数据 -->
        <Button @click="close">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认按钮：提交表单数据，显示加载状态 -->
        <Button type="primary" @click="submit" :loading="submitLoading">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
  <!-- endregion -->
</template>

<style scoped>
/*
 * 组件专属样式
 * 当前为空，如需要可以在此添加局部样式
 */
</style>
