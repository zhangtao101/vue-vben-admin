<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { Button, Drawer, Input, Space } from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { debounce } from 'lodash-es';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
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

// region 初始化
// 抽屉是否显示
const drawerOpen = ref(false);
// 表格选中行
const selectedRow = ref<any[]>([]);

// endregion

// region 表格

const gridRef = ref();
// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'left',
  border: true,
  checkboxConfig: {
    checkField: 'isChecked',
    trigger: 'row',
    highlight: true,
    range: true,
  },
  columns: [
    {
      type: 'checkbox',
      width: 50,
    },
    {
      title: '设备编号',
      children: [
        {
          field: 'equipmentCode',
          minWidth: 200,
          filters: [{ data: '' }],
          filterMethod({ option, row, column }) {
            if (option.data) {
              return `${row[column.field]}`.includes(option.data);
            }
            return true;
          },
          slots: {
            header: 'codeHeader',
          },
        },
      ],
    },
    {
      title: '设备名称',
      children: [
        {
          field: 'equipmentName',
          minWidth: 200,
          filters: [{ data: '' }],
          filterMethod({ option, row, column }) {
            if (option.data) {
              return `${row[column.field]}`.includes(option.data);
            }
            return true;
          },
          slots: {
            header: 'nameHeader',
          },
        },
      ],
    },
  ],
  filterConfig: {
    showIcon: false,
  },
  height: '100%',
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryData();
      },
    },
  },
  scrollY: {
    enabled: true,
    gt: 0,
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/**
 * 查询设备列表的函数。
 * 该函数查询设备列表，并根据查询结果更新 equipList 数组。
 * @returns {Promise} - 包含设备列表的 Promise 对象。
 */
function queryData() {
  return new Promise((resolve, reject) => {
    // 调用 queryEquipList API 函数，传递查询参数和分页信息
    queryEquipList({
      pageNum: 1,
      pageSize: 9999,
    })
      .then(({ list }) => {
        const checkedList: any = []; // 存储已选中的设备
        const newList = list.filter((item: any) => {
          // 检查当前设备是否在默认选中的设备列表中
          item.isChecked = defaultProps.equipCodeList.includes(
            item.equipmentCode,
          );
          if (item.isChecked) {
            // 如果已选中，添加到 checkedList
            checkedList.push(item);
          }
          // 返回未选中的设备
          return !item.isChecked;
        });
        // 成功获取数据后，更新数据列表
        // 将已选中的设备放在前面，未选中的设备放在后面
        resolve({
          items: [...checkedList, ...newList],
        });
      })
      .catch((error) => {
        // 处理错误
        reject(error);
      });
  });
}

const confirmFilterEvent = debounce((option, clear = false) => {
  // 如果 clear 为 true，则清除所有过滤条件
  if (clear) {
    gridApi.grid.clearFilter();
  } else {
    // 否则，更新指定过滤选项的状态
    // !!option.data 用于将 option.data 转换为布尔值，表示该过滤选项是否有效
    gridApi.grid.updateFilterOptionStatus(option, !!option.data);
  }
  // 更新表格数据，以反映过滤条件的变化
  gridApi.grid.updateData();
});

// endregion

// region 操作

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
  // 清空表格
  gridApi.grid.clearData();

  /**
   * 使用 defaultEmits 发射一个名为 'update:isOpen' 的事件。
   * 这个事件用于通知父组件 `isOpen` 属性应该更新为 false。
   * 父组件可以监听这个事件，并根据需要更新其对应的 `isOpen` prop。
   *
   * @param {boolean} false - 发射事件时传递的值，表示 isOpen 应该设置为 false。
   */
  defaultEmits('update:isOpen', false);
}

const submitLoading = ref(false);
/**
 * 选择的设备列表完成,返回选择后的设备列表
 */
function submit() {
  submitLoading.value = true;
  // 清空筛选条件
  confirmFilterEvent({}, true);
  setTimeout(() => {
    // console.log(selectedRow.value);
    submitLoading.value = false;
    // 获取当前选中的行记录
    const checkedRow = gridApi.grid.getCheckboxRecords();
    // 初始化选中的设备列表
    selectedRow.value = [];
    // 遍历选中的行记录
    checkedRow.forEach((item) => {
      // 将每行的设备编码添加到选中的设备列表中
      selectedRow.value.push(item.equipmentCode);
    });
    defaultEmits('changed', selectedRow.value);
    close();
  }, 800);
}

// endregion

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
      selectedRow.value = []; // 设置选中行为空
      gridApi.query(); // 重新加载表格数据
    } else {
      close(); // 如果 val 为 false 或 defaultProps.parentId 不存在，调用 close 函数来关闭抽屉组件。
    }
  },
);
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
    <Grid ref="gridRef">
      <template #codeHeader="{ column }">
        <div v-for="(option, index) of column.filters" :key="index">
          <Input
            v-model:value="option.data"
            clearable
            @change="confirmFilterEvent(option)"
            style="width: 100%"
          />
        </div>
      </template>
      <template #nameHeader="{ column }">
        <div v-for="(option, index) of column.filters" :key="index">
          <Input
            v-model:value="option.data"
            clearable
            @change="confirmFilterEvent(option)"
            style="width: 100%"
          />
        </div>
      </template>
    </Grid>

    <template #footer>
      <Space>
        <!-- 取消 -->
        <Button @click="close">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认 -->
        <Button type="primary" @click="submit" :loading="submitLoading">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped></style>
