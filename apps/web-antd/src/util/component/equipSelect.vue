<script setup lang="ts">
import { computed, ref, unref, watch } from 'vue';

import { $t } from '@vben/locales';

import { Button, Drawer, Input, Space, Table } from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { debounce } from 'lodash-es';

import { queryEquipList } from '#/api';

// 使用 defineProps 方法定义组件的属性
const defaultProps = defineProps({
  /**
   * 定义一个名为 equipCodeList 的 prop。
   * 这个 prop 表示设备编码列表，是一个数组类型的值。
   * 默认值为一个空数组，表示如果没有提供这个 prop，组件将使用空数组作为其值。
   *
   * @property {Array} equipCodeList - 设备编码列表。
   * @property {Array} equipCodeList.default - 提供一个默认值，当没有提供这个 prop 时使用。
   * @property {string} equipCodeList.type - 指定 prop 的类型为 Array，元素类型为 any。
   */
  equipCodeList: {
    default: () => [], // 提供一个默认值，当没有提供这个 prop 时使用空数组
    type: Array, // 指定 equipCodeList 的类型为 Array
  },
  /**
   * 定义一个名为 isOpen 的 prop。
   * 这个 prop 表示组件是否处于打开状态，是一个布尔类型的值。
   * 默认值为 false，表示如果没有提供这个 prop，组件将使用 false 作为其值。
   * 并且这是一个必需的 prop，组件在使用时必须提供这个 prop。
   *
   * @property {boolean} isOpen - 表示组件的打开状态。
   * @property {boolean} isOpen.default - 提供一个默认值，当没有提供这个 prop 时使用。
   * @property {boolean} isOpen.required - 标记为必传属性，组件在使用时必须提供这个 prop。
   * @property {string} isOpen.type - 指定 prop 的类型为 Boolean。
   */
  isOpen: {
    default: false, // 提供一个默认值，当没有提供这个 prop 时使用 false
    required: true, // 表示 isOpen 是一个必需的 prop
    type: Boolean, // 指定 isOpen 的类型为 Boolean
  },
  /**
   * 定义一个名为 isShowStatus 的 prop。
   * 这个 prop 表示是否显示状态，是一个布尔类型的值。
   * 默认值为 false，表示如果没有提供这个 prop，组件将使用 false 作为其值。
   *
   * @property {boolean} isShowStatus - 表示是否显示状态。
   * @property {boolean} isShowStatus.default - 提供一个默认值，当没有提供这个 prop 时使用。
   * @property {string} isShowStatus.type - 指定 prop 的类型为 Boolean。
   */
  isShowStatus: {
    default: () => false, // 提供一个默认值，当没有提供这个 prop 时使用 false
    type: Boolean, // 指定 isShowStatus 的类型为 Boolean
  },
});

const defaultEmits = defineEmits(['update:isOpen', 'changed']);

// region 查询设备列表及初始化
// 抽屉是否显示
const drawerOpen = ref(false);
// 加载状态
const loading = ref(false);

// 表格滚动信息配置
const scroll = ref({
  scrollToFirstRowOnChange: true,
  x: 600,
  y: 550,
});
// 表格列名
const columns = ref([
  {
    dataIndex: 'equipmentCode',
    ellipsis: true,
    title: '设备编号',
    width: 120,
  },
  {
    dataIndex: 'equipmentName',
    ellipsis: true,
    title: '设备名称',
    width: 120,
  },
]);
// 表格数据
const tableData = ref<any[]>([]);
// 表格数据备份
const tableData_block = ref<any[]>([]);
// 表格选中行
const selectedRow = ref<any[]>([]);

// 搜索的文本
const searchValue = ref('');
// 表格行选中配置
const rowSelection: any = computed(() => {
  return {
    getCheckboxProps: (record: any) => ({
      disabled: defaultProps.isShowStatus,
      name: record.name,
    }),
    onChange: (selectedRowKeys: any[], _selectedRows: any[]) => {
      if (searchValue.value) {
        selectedRow.value.push(...selectedRowKeys);
      } else {
        selectedRow.value = selectedRowKeys;
      }
      /* sortTableData();*/
    },
    selectedRowKeys: unref(selectedRow),
  };
});

/**
 * 排序表格数据的函数。
 */
function sortTableData() {
  setTimeout(() => {
    tableData.value.sort((a: any) => {
      return selectedRow.value.includes(a.key) ? -1 : 1;
    });
  }, 80);
}
/**
 * 查询设备列表的函数。
 * 这个函数用于查询设备列表，并根据查询结果更新 equipList 数组。
 */
function queryEquip() {
  loading.value = true;
  queryEquipList({
    pageNum: 1,
    pageSize: 9999,
  })
    .then(({ list }) => {
      for (const item of list) {
        item.key = item.equipmentCode;
      }
      tableData_block.value = list;
      tableData.value = list;
      tableData.value = [...tableData.value].sort((a) => {
        return selectedRow.value.includes(a.key) ? -1 : 1;
      });
    })
    .finally(() => {
      loading.value = false;
    });
}

/**
 * 搜索设备的函数。
 * 这个函数用于根据搜索的文本在设备列表中进行搜索，并更新表格数据。
 */
const searchEquip = debounce(() => {
  if (searchValue.value) {
    tableData.value = [];
    tableData_block.value.forEach((item) => {
      if (
        item.equipmentCode.includes(searchValue.value) ||
        item.equipmentName.includes(searchValue.value)
      ) {
        tableData.value.push(item);
      }
    });
    sortTableData();
  } else {
    tableData.value = tableData_block.value;
    sortTableData();
  }
}, 500);

/**
 * 关闭组件的函数。
 * 这个函数用于关闭组件，并通知父组件更新相关的状态。
 */
function close() {
  /**
   * 将 drawerOpen 的值设置为 false。
   * drawerOpen 可能是一个响应式变量，用于控制组件的显示状态。
   * 当设置为 false 时，组件会被隐藏。
   */
  drawerOpen.value = false;
  // 清空表格选中行
  selectedRow.value = [];
  // 清空查询文本
  searchValue.value = '';

  /**
   * 使用 defaultEmits 发射一个名为 'update:isOpen' 的事件。
   * 这个事件用于通知父组件 `isOpen` 属性应该更新为 false。
   * 父组件可以监听这个事件，并根据需要更新其对应的 `isOpen` prop。
   *
   * @param {boolean} false - 发射事件时传递的值，表示 isOpen 应该设置为 false。
   */
  defaultEmits('update:isOpen', false);
}

/**
 * 选择的设备列表完成,返回选择后的设备列表
 */
function submit() {
  defaultEmits('changed', selectedRow.value);
  close();
}

/**
 * 使用 Vue.js 的 watch 函数来观察 defaultProps.isOpen 的变化。
 * 当 isOpen 的值变化时，这个观察者会根据新的值来执行相应的操作。
 *
 * @param {Function} source - 一个返回需要观察的源的函数，这里是 defaultProps.isOpen。
 * @param {Function} callback - 当观察到的源变化时，会调用这个回调函数。
 */
watch(
  () => defaultProps.isOpen, // 观察的源是 defaultProps.isOpen。
  (val) => {
    // 回调函数接受一个参数 val，它是 defaultProps.isOpen 的新值。
    /**
     * 如果 val 为 true 且 defaultProps.parentId 存在，
     * 则执行以下操作：
     */
    if (val) {
      drawerOpen.value = true; // 将 drawerOpen 的值设置为 true，打开抽屉组件。
      queryEquip(); // 调用 queryProcessSetDetail 函数来查询流程设置详情。
      selectedRow.value = [];
      defaultProps.equipCodeList.forEach((item: any) => {
        selectedRow.value.push(item);
      });
      sortTableData();
    } else {
      close(); // 如果 val 为 false 或 defaultProps.parentId 不存在，调用 close 函数来关闭抽屉组件。
    }
  },
);

// endregion
</script>

<template>
  <Drawer
    v-model:open="drawerOpen"
    :footer-style="{ textAlign: 'right' }"
    :width="700"
    placement="right"
    title="设备选择"
    @close="close"
  >
    <Input
      v-model:value="searchValue"
      placeholder="输入关键字进行查询"
      @change="searchEquip"
    />
    <Table
      v-if="drawerOpen"
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="false"
      :row-selection="rowSelection"
      :scroll="scroll"
      bordered
    />

    <template #footer>
      <Space>
        <!-- 取消 -->
        <Button @click="close">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认 -->
        <Button type="primary" @click="submit">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped></style>
