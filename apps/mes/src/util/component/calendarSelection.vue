<script setup lang="ts">
/**
 * 工厂日历选择组件
 * 用于选择和展示工厂日历的详细信息，包括：
 * 1. 可选日历列表的展示和选择
 * 2. 选中日历的详细信息显示
 * 3. 每周工作日/休息日的配置展示
 * 4. 日历基本信息的描述性展示
 */
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  RadioGroup,
  Row,
} from 'ant-design-vue';

import { getWorkshopCalendars } from '#/api';

/**
 * 日历选项数据列表
 * 存储所有可用的工厂日历选项，用于RadioGroup组件的数据源
 * 每个选项包含日历的基本信息和工作日配置
 * 初始数据为示例数据，实际会通过API获取真实数据覆盖
 */
const options = ref<any>([
  {
    id: 1, // 日历ID
    label: 'test', // 显示标签
    value: 1, // 选项值
    calendarName: '6666', // 日历名称
    organizationCode: '', // 组织代码
    organizationName: '', // 组织名称
    monday: 2, // 周一状态（2=工作日，1=休息日）
    tuesday: 2, // 周二状态
    wednesday: 2, // 周三状态
    thursday: 2, // 周四状态
    friday: 1, // 周五状态
    saturday: 1, // 周六状态
    sunday: 1, // 周日状态
    cName: '', // 创建人姓名
    cTime: null, // 创建时间
    uName: '', // 更新人姓名
    uTime: null, // 更新时间
    startTime1: null, // 工作时段1开始时间
    endTime1: null, // 工作时段1结束时间
    startTime2: null, // 工作时段2开始时间
    endTime2: null, // 工作时段2结束时间
    startTime3: null, // 工作时段3开始时间
    endTime3: null, // 工作时段3结束时间
    startTime4: null, // 工作时段4开始时间
    endTime4: null, // 工作时段4结束时间
    startTime5: null, // 工作时段5开始时间
    endTime5: null, // 工作时段5结束时间
    startTime6: null, // 工作时段6开始时间
    endTime6: null, // 工作时段6结束时间
    dates: null, // 特殊日期数据
  },
]);

/**
 * 当前选中的日历ID
 * 使用v-model绑定到RadioGroup组件，响应式跟踪用户的选择
 */
const selectedValue = ref<any>('');

/**
 * 查询工厂日历数据
 * 从服务器获取所有可用的工厂日历数据，并格式化为RadioGroup所需的选项格式
 * 使用大分页参数(99_999)获取所有数据，避免分页处理
 */
function queryData() {
  getWorkshopCalendars({
    pageNum: 1, // 页码固定为1
    pageSize: 99_999, // 设置大页面大小以获取所有数据
  }).then(({ list }) => {
    // 检查是否获取到有效数据
    if (list && list.length > 0) {
      // 清空现有选项
      options.value = [];

      // 遍历API返回的日历数据
      list.forEach((item: any) => {
        // 将API数据转换为RadioGroup所需的选项格式
        options.value.push({
          ...item, // 保留原始数据
          label: item.calendarName, // 使用日历名称作为显示标签
          value: item.id, // 使用日历ID作为选项值
        });
      });
    }
  });
}

/**
 * 当前选中日历的详细信息
 * 存储用户选中的日历的完整数据，用于在右侧详情区域展示
 */
const details = ref<any>();

/**
 * 处理日历选择变化
 * 当用户选择不同的日历时，更新详情数据以显示新选中的日历信息
 * 通过遍历options数组找到匹配的日历项并复制到details中
 */
function change() {
  options.value.forEach((item: any) => {
    // 根据选中的ID查找对应的日历项
    if (item.id === selectedValue.value) {
      // 找到匹配项时，复制完整数据到详情对象
      details.value = {
        ...item, // 使用扩展运算符确保数据独立性
      };
    }
  });
}

/**
 * 获取工作日状态的文本描述
 * 将数字代码转换为用户友好的中文描述
 * @param {number} code - 工作日状态代码（1=休息日，2=工作日）
 * @returns {string} 对应的中文描述文本
 */
function getStatusText(code: number) {
  switch (code) {
    case 1: {
      // 休息日
      return $t('hiddenDangerInspectionPlan.restDays');
    }
    case 2: {
      // 工作日
      return $t('hiddenDangerInspectionPlan.workday');
    }
    default: {
      // 未知状态，返回空字符串
      return '';
    }
  }
}

// region 组件方法暴露
/**
 * 暴露组件方法给父组件调用
 * 提供获取当前选中日历详情的接口
 */
defineExpose({
  /**
   * 获取当前选中日历的详细信息
   * @returns {object} 选中日历的完整数据对象
   */
  getValue: () => {
    return details.value; // 返回当前选中的日历详情数据
  },
});

// endregion

/**
 * 组件挂载完成后的初始化处理
 * 在组件挂载到DOM后自动查询日历数据，初始化选项列表
 */
onMounted(() => {
  queryData();
});
</script>

<template>
  <!-- 日历选择和详情展示的主要布局区域 -->
  <Row :gutter="10">
    <!-- 左侧：日历选择区域 -->
    <Col :span="12">
      <Card class="h-full overflow-auto">
        <!-- 单选组件组，展示所有可用的日历选项 -->
        <RadioGroup
          v-model:value="selectedValue"
          :options="options"
          @change="change"
        />
      </Card>
    </Col>

    <!-- 右侧：日历详情展示区域 -->
    <Col :span="12">
      <Card class="h-full overflow-auto">
        <!-- 描述列表组件，展示选中日历的详细信息 -->
        <Descriptions bordered :column="1" v-if="details">
          <!-- 周一工作状态 -->
          <DescriptionsItem :label="$t('hiddenDangerInspectionPlan.monday')">
            {{ getStatusText(details.monday) }}
          </DescriptionsItem>
          <!-- 周二工作状态 -->
          <DescriptionsItem :label="$t('hiddenDangerInspectionPlan.tuesday')">
            {{ getStatusText(details.tuesday) }}
          </DescriptionsItem>
          <!-- 周三工作状态 -->
          <DescriptionsItem :label="$t('hiddenDangerInspectionPlan.wednesday')">
            {{ getStatusText(details.wednesday) }}
          </DescriptionsItem>
          <!-- 周四工作状态 -->
          <DescriptionsItem :label="$t('hiddenDangerInspectionPlan.thursday')">
            {{ getStatusText(details.thursday) }}
          </DescriptionsItem>
          <!-- 周五工作状态 -->
          <DescriptionsItem :label="$t('hiddenDangerInspectionPlan.friday')">
            {{ getStatusText(details.friday) }}
          </DescriptionsItem>
          <!-- 周六工作状态 -->
          <DescriptionsItem :label="$t('hiddenDangerInspectionPlan.saturday')">
            {{ getStatusText(details.saturday) }}
          </DescriptionsItem>
          <!-- 周日工作状态 -->
          <DescriptionsItem :label="$t('hiddenDangerInspectionPlan.sunday')">
            {{ getStatusText(details.sunday) }}
          </DescriptionsItem>
        </Descriptions>
      </Card>
    </Col>
  </Row>
</template>

<style scoped>
/*
 * 组件专属样式
 * 当前为空，如需要可以在此添加局部样式
 */
</style>
