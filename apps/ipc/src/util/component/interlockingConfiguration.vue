<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { $t } from '@vben/locales';
import { useVbenVxeGrid } from '@vben/plugins/vxe-table';

import {
  Button,
  Drawer,
  message,
  Radio,
  RadioGroup,
  Space,
} from 'ant-design-vue';

import { listEquipControl, updateEquipControl } from '#/api';

/**
 * 定义组件的 props，用于接收父组件传递的工作中心代码
 */
const props = defineProps({
  // 工作中心代码，用于标识不同的工作中心，默认为空字符串
  workstationCode: {
    type: String,
    default: '',
  },
});

/**
 * 表格配置选项，用于定义 VxeGrid 表格的各项属性
 */
const gridOptions: VxeGridProps<any> = {
  // 表格列配置
  columns: [
    // 序号列，宽度为 70
    { type: 'seq', width: 70 },
    // 工序编号列，显示工序的编号
    { field: 'processCode', title: '工序编号' },
    // 工序名称列，显示工序的名称
    { field: 'processName', title: '工序名称' },
    // 二维码校验列，使用自定义插槽渲染
    {
      title: '二维码校验',
      slots: {
        default: 'qrCodeVerification',
      },
    },
    // 设备联锁列，使用自定义插槽渲染
    {
      title: '设备联锁',
      slots: {
        default: 'equipmentInterlocking',
      },
    },
  ],
  // 表格数据，初始为空数组
  data: [],
  // 表格高度自动适应内容
  height: 'auto',
  // 分页配置，禁用分页
  pagerConfig: {
    enabled: false,
  },
  // 显示溢出内容的提示
  showOverflow: true,
};

// 初始化 VxeGrid 组件和 API
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/**
 * 提交联锁配置信息
 * 该函数用于获取表格中的数据，并将其与工作中心代码一起发送到后端进行更新。
 * 更新成功后，会显示成功消息并关闭抽屉。
 */
function submit() {
  // 从表格 API 中获取表格数据
  const { tableData } = gridApi.grid.getTableData();
  // 调用更新设备控制信息的 API
  updateEquipControl({
    // 传递工作中心代码
    workstationCode: props.workstationCode,
    // 传递表格中的详细数据
    detailVms: tableData,
  }).then(() => {
    // 若更新成功，显示成功消息
    message.success('操作成功');
    // 关闭抽屉并清空表格数据
    close();
  });
}

// region 暴露方法
// 控制抽屉是否显示的响应式变量
const show = ref(false);

/**
 * 打开联锁配置抽屉并加载数据
 * 该函数会将抽屉的显示状态设置为 true，然后调用 API 获取设备控制列表数据，
 * 并将获取到的数据加载到表格中。
 */
const open = () => {
  // 设置抽屉显示状态为 true，即打开抽屉
  show.value = true;
  // 调用 API 获取设备控制列表数据
  listEquipControl({
    // 传递工作中心代码作为请求参数
    workstationCode: props.workstationCode,
  }).then((data) => {
    // 将获取到的数据加载到表格中
    gridApi.grid.loadData(data);
  });
};

/**
 * 关闭联锁配置抽屉并清空表格数据
 * 该函数会调用表格 API 清空表格中的数据，然后将抽屉的显示状态设置为 false，以此关闭抽屉。
 */
function close() {
  // 调用表格 API 清空表格中的数据
  gridApi.grid.clearData();
  // 将抽屉的显示状态设置为 false，关闭抽屉
  show.value = false;
}

// 暴露 open 方法，供父组件调用
defineExpose({
  open,
});

// endregion
</script>

<template>
  <!-- 抽屉组件，用于显示联锁配置界面 -->
  <Drawer
    v-model:open="show"
    :height="400"
    placement="top"
    :footer-style="{ textAlign: 'right' }"
    :title="$t('productionOperation.interlockConfiguration')"
  >
    <!-- 渲染 VxeGrid 表格组件 -->
    <Grid>
      <!-- 二维码校验列的自定义插槽，显示单选框组用于控制二维码校验开关 -->
      <template #qrCodeVerification="{ row }">
        <!-- 单选框组，绑定到行数据的 snCodeControlFlag 字段 -->
        <RadioGroup v-model:value="row.snCodeControlFlag">
          <!-- 开启选项，值为 1 -->
          <Radio :value="1">{{ $t('common.open') }}</Radio>
          <!-- 关闭选项，值为 -1 -->
          <Radio :value="-1">
            {{ $t('common.close') }}
          </Radio>
        </RadioGroup>
      </template>
      <!-- 设备联锁列的自定义插槽，显示单选框组用于控制设备联锁开关 -->
      <template #equipmentInterlocking="{ row }">
        <!-- 单选框组，绑定到行数据的 equipControlFlag 字段，当二维码校验未开启时禁用 -->
        <RadioGroup
          v-model:value="row.equipControlFlag"
          :disabled="row.snCodeControlFlag !== 1"
        >
          <!-- 开启选项，值为 1 -->
          <Radio :value="1">{{ $t('common.open') }}</Radio>
          <!-- 关闭选项，值为 -1 -->
          <Radio :value="-1">{{ $t('common.close') }}</Radio>
        </RadioGroup>
      </template>
    </Grid>
    <!-- 抽屉底部的操作按钮区域 -->
    <template #footer>
      <!-- 按钮组，使用 Space 组件进行间距控制 -->
      <Space>
        <!-- 取消按钮，点击后调用 close 函数关闭抽屉 -->
        <Button @click="close()">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认按钮，点击后调用 submit 函数提交联锁配置信息 -->
        <Button type="primary" @click="submit()">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped>
/* 作用域样式，仅对当前组件生效 */
</style>
