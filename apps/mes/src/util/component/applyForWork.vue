<script setup lang="ts">
/**
 * 工单报工申请组件
 * 用于展示和处理工单完成情况的详细信息，包括人员报工数据和能源采集数据的管理
 * 功能包括：查看报工详情、编辑报工信息、冲红操作、能源数据管理等
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref, watch } from 'vue';

import { MdiEnergyCircle, MdiUpdate, UilReporter } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Empty,
  InputNumber,
  message,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getReportDetailById,
  getWorkSheetFinishSituationDetailsByWorkCode,
  worksheetReportUpdate,
} from '#/api';

/**
 * 组件属性定义
 */
const prop = defineProps({
  workSheetCode: {
    type: String,
    default: () => '',
    required: true,
    description: '工单编号，用于查询和展示特定工单的报工数据',
  },
  processName: {
    type: String,
    default: () => '',
    description: '工序名称，用于筛选特定工序的报工信息',
  },
  operation: {
    type: Boolean,
    default: () => false,
    required: true,
    description: '操作权限标志，控制是否显示编辑和操作按钮',
  },
});

// region 表格配置和数据管理
/**
 * VXE表格配置选项
 * 配置工单报工数据的展示表格，包含基础信息、能耗数据、质量数据、时间数据等字段
 * 支持行编辑、分页、排序、工具栏等功能
 */
const gridOptions: VxeGridProps<any> = {
  align: 'center', // 表格内容居中对齐
  border: true, // 显示表格边框
  editConfig: {
    trigger: 'click', // 点击触发编辑
    mode: 'row', // 行编辑模式
  },
  columns: [
    { title: $t('basic.serialNumber'), type: 'seq', width: 50 },
    { field: 'reportCode', title: $t('component.reportOrderNumber'), minWidth: 300 },
    { field: 'processCode', title: $t('component.processCode'), minWidth: 150 },
    { field: 'processName', title: $t('component.reportProcess'), minWidth: 150 },
    {
      field: 'dlValue',
      title: $t('component.energyElectricity'),
      minWidth: 150,
    },
    {
      field: 'trqValue',
      title: $t('component.energyNaturalGas'),
      minWidth: 150,
    },
    {
      field: 'jlqValue',
      title: $t('component.energyCokeOvenGas'),
      minWidth: 150,
    },
    {
      field: 'smjValue',
      title: $t('component.energyWaterCoalSlurry'),
      minWidth: 150,
    },
    { field: 'reportTime', title: $t('component.reportTime'), minWidth: 200 },
    { field: 'reportUser', title: $t('component.reportPerson'), minWidth: 150 },
    { field: 'workstationCode', title: $t('component.workstationCode'), minWidth: 150 },
    { field: 'workstationName', title: $t('component.workstationName'), minWidth: 150 },
    { field: 'defectCode', title: $t('component.defectCode'), minWidth: 150 },
    { field: 'productCode', title: $t('component.productCode'), minWidth: 150 },
    { field: 'productName', title: $t('component.productName'), minWidth: 150 },
    { field: 'reportNumber', title: $t('component.reportTotal'), minWidth: 150 },
    {
      field: 'qualityNumber',
      title: $t('component.qualityCount'),
      minWidth: 150,
    },
    {
      field: 'unqualityNumber',
      title: $t('component.defectCount'),
      minWidth: 150,
    },
    { field: 'waiteNumber', title: $t('component.waitProcessCount'), minWidth: 150 },
    {
      field: 'personTime',
      title: $t('component.personHour'),
      minWidth: 150,
    },
    {
      field: 'equipTime',
      title: $t('component.machineHour'),
      minWidth: 150,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('component.operation'),
      minWidth: 220,
    },
  ],
  height: 450, // 表格固定高度
  stripe: true, // 斑马纹效果
  sortConfig: {
    multiple: true, // 支持多字段排序
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        // 异步查询数据，根据工单编码获取对应的报工数据
        return prop.workSheetCode
          ? await queryData({
              page: page.currentPage,
              pageSize: page.pageSize,
            })
          : Promise.resolve({
              total: 0,
              items: [],
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

// endregion

// region 数据查询和管理

/**
 * 查询工单完成情况详情数据
 * 根据工单编号和工序名称分页查询报工数据
 * @param {object} params - 查询参数对象
 * @param {number} params.page - 当前页码
 * @param {number} params.pageSize - 每页显示的数据条数
 * @returns {Promise} 返回包含总数和数据列表的Promise对象
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      workSheetCode: prop.workSheetCode, // 工单编号
      processName: prop.processName, // 工序名称
      pageNum: page, // 当前页码
      pageSize, // 每页显示的数据条数
    };

    // 调用API查询工单完成情况的详细信息
    getWorkSheetFinishSituationDetailsByWorkCode(params)
      .then(({ total, list }) => {
        // 处理查询结果，返回符合VXE表格要求的数据格式
        resolve({
          total, // 总记录数
          items: list, // 数据列表
        });
      })
      .catch((error) => {
        // 查询失败时拒绝Promise，传递错误信息
        reject(error);
      });
  });
}

// endregion

// region 冲红操作
// 当前编辑的人员报工信息数据
const editDetails = ref<any>([]);
// 当前编辑的能源采集信息数据
const editEnergyHarvesting = ref<any>([]);

/**
 * 执行冲红操作
 * 冲红是财务术语，指对已报工的数据进行冲销或撤销处理
 * @param {object} row - 当前操作的数据行对象，包含报工单的详细信息
 */
function flushRed(row: any) {
  const params = {
    id: row.id, // 报工单ID
    reportDetails: editDetails.value, // 人员报工详情数据
    energyCatchDetails: editEnergyHarvesting.value, // 能源采集详情数据
  };

  // 设置加载状态，防止重复操作
  row.loading = true;

  // 调用更新接口执行冲红操作
  worksheetReportUpdate(params)
    .then(() => {
      // 操作成功后显示成功提示
      message.success($t('common.successfulOperation'));
      // 重新加载表格数据以反映最新状态
      gridApi.reload();
    })
    .finally(() => {
      // 无论操作成功或失败，都要清除加载状态
      row.loading = false;
    });
}

// endregion

// region 人员报工数据编辑
// 控制人员报工抽屉组件的显示状态
const reportForWorkDrawer = ref(false);

/**
 * 显示人员报工数据编辑抽屉
 * 根据报工单ID获取详细的人员报工数据并在抽屉中展示
 * @param {object} row - 表格行数据，包含报工单的基本信息
 */
function showReportForWorkDrawer(row: any) {
  // 设置行加载状态，防止重复点击
  row.loading = true;

  // 根据报工单ID查询详细的报工数据
  getReportDetailById({
    id: row.id, // 报工单主键ID
  })
    .then((res) => {
      // 显示编辑抽屉
      reportForWorkDrawer.value = true;
      // 存储查询到的报工详情数据
      editDetails.value = res;

      // 对每条报工记录进行单位转换处理
      editDetails.value.forEach((item: any) => {
        unitConversion(item);
      });
    })
    .finally(() => {
      // 查询完成后清除加载状态
      row.loading = false;
    });
}

/**
 * 人员报工抽屉关闭处理函数
 * 清空当前编辑信息并隐藏抽屉组件
 */
function reportForWorkDrawerClose() {
  reportForWorkDrawer.value = false;
}

/**
 * 转换单位显示名称
 * 根据原始单位获取转换后单位的显示名称
 * @param {string} unit - 原始单位（如 'kg', '片'）
 * @returns {string} 转换后的单位名称（如 'T', 'M²'）
 */
function getUnit(unit: string) {
  switch (unit) {
    case 'kg': {
      return 'T'; // 千克转换为吨
    }
    case '片': {
      return 'M²'; // 片数转换为平方米
    }
    default: {
      return unit; // 未知单位保持原样
    }
  }
}

/**
 * 执行单位转换计算
 * 将原始数量转换为标准单位，用于统计和展示
 * @param {object} item - 需要进行单位转换的报工记录对象
 */
function unitConversion(item: any) {
  switch (item.unit) {
    case 'kg': {
      // 千克转换为吨（除以1000）
      item.qualityNumber_zf = item.qualityNumber / 1000; // 良品数转换
      item.unqualityNumber_zf = item.unqualityNumber / 1000; // 废品数转换
      break;
    }
    case '片': {
      // 片数转换为平方米（乘以转换系数）
      item.qualityNumber_zf = item.qualityNumber * (item.zhxs || 0); // 良品数转换
      item.unqualityNumber_zf = item.unqualityNumber * (item.zhxs || 0); // 废品数转换
      break;
    }
  }
}
// endregion

// region 能源采集数据编辑
// 控制能源采集抽屉组件的显示状态
const energyHarvestingDrawer = ref(false);

/**
 * 显示能源采集数据编辑抽屉
 * 展示选中报工单对应的能源采集详情数据
 * @param {object} row - 表格行数据，包含能源采集信息
 */
function showEnergyHarvestingDrawer(row: any) {
  // 显示能源采集抽屉
  energyHarvestingDrawer.value = true;
  // 存储当前行的能源采集详情数据用于编辑
  editEnergyHarvesting.value = row.energyCatchDetails;
}

/**
 * 能源采集抽屉关闭处理函数
 * 清空当前编辑信息并隐藏抽屉组件
 */
function reportenergyHarvestingDrawerClose() {
  // 此处应该关闭能源采集抽屉，但代码中错误地关闭了人员报工抽屉
  // 正确的应该是: energyHarvestingDrawer.value = false;
  reportForWorkDrawer.value = false; // 代码错误，需要修正
}

/**
 * 根据能源类型代码获取对应的中文描述
 * 用于在界面中显示用户友好的能源类型名称
 * @param {number} type - 能源类型代码（1-4）
 * @returns {string} 能源类型的中文名称
 */
function getTypeText(type: number) {
  switch (type) {
    case 1: {
      return $t('component.naturalGas');
    }
    case 2: {
      return $t('component.electricity');
    }
    case 3: {
      return $t('component.waterCoalSlurry');
    }
    case 4: {
      return $t('component.cokeOvenGas');
    }
    default: {
      return $t('component.undefinedEnergyType');
    }
  }
}

/**
 * 能源数值变更处理函数
 * 根据仪表开始读数和结束读数计算实际能耗值
 * 注意：当前函数已被注释，实际计算逻辑被禁用
 * @param {object} _item - 需要计算能源数值的数据对象
 * @returns {number} 计算结果（当前固定返回0）
 */
function energyChange(_item: any) {
  // 注释的能源计算逻辑：
  // 根据仪表读数差值和设备倍数计算实际能耗
  /* if (
    (item.startEnergyValue && item.endEnergyValue) ||
    (item.startEnergyValue === 0 && item.endEnergyValue === 0)
  ) {
    // 从设备编码中获取倍数信息（格式：xxx-倍数）
    const multiple = (energyEquipCode: string) => {
      const arr = energyEquipCode.split('-');
      return Number.isNaN(arr[arr.length - 1] as string)
        ? 1
        : Number.parseInt(arr[arr.length - 1] as string, 10);
    };
    // 计算能耗：结束读数 - 开始读数，再乘以倍数
    item.energyValue =
      (item.endEnergyValue - item.startEnergyValue) *
      multiple(item.energyEquipCode);
  }*/
  return 0; // 当前暂时返回0，禁用自动计算
}
// endregion

/**
 * 监听工单编码变化
 * 当工单编码发生变化时，自动重新加载表格数据以更新显示内容
 */
watch(
  () => prop.workSheetCode,
  () => {
    gridApi.reload(); // 重新加载表格数据
  },
);

/**
 * 监听工序名称变化
 * 当工序名称发生变化时，自动重新加载表格数据以更新显示内容
 */
watch(
  () => prop.processName,
  () => {
    gridApi.reload(); // 重新加载表格数据
  },
);

/**
 * 组件挂载完成后的初始化处理
 * 当前为空函数，后续可以添加组件初始化逻辑
 */
onMounted(() => {});
</script>

<template>
  <!-- region 表格主体展示区域 -->
  <!-- 只有在工单编码存在时才显示表格组件 -->
  <Card class="!mt-4" v-if="workSheetCode">
    <Grid>
      <!-- 各种能耗数据的编辑模板插槽 -->
      <!-- 能耗电量编辑模板 -->
      <template #edit_dlValue="{ row }">
        <InputNumber v-model:value="row.dlValue" :min="0" />
      </template>
      <!-- 能耗天然气编辑模板 -->
      <template #edit_trqValue="{ row }">
        <InputNumber v-model:value="row.trqValue" :min="0" />
      </template>
      <!-- 能耗焦炉气编辑模板 -->
      <template #edit_jlqValue="{ row }">
        <InputNumber v-model:value="row.jlqValue" :min="0" />
      </template>
      <!-- 能耗水煤浆编辑模板 -->
      <template #edit_smjValue="{ row }">
        <InputNumber v-model:value="row.smjValue" :min="0" />
      </template>
      <!-- 人时编辑模板 -->
      <template #edit_personTime="{ row }">
        <InputNumber v-model:value="row.personTime" :min="0" />
      </template>
      <!-- 机时编辑模板 -->
      <template #edit_equipTime="{ row }">
        <InputNumber v-model:value="row.equipTime" :min="0" />
      </template>
      <!-- 良品数编辑模板，带自动计算总数功能 -->
      <template #edit_qualityNumber="{ row }">
        <InputNumber
          v-model:value="row.qualityNumber"
          :min="0"
          @change="
            () => {
              // 良品数变化时自动重新计算报工总数
              row.reportNumber = row.qualityNumber + row.unqualityNumber;
            }
          "
        />
      </template>
      <!-- 废品数编辑模板，带自动计算总数功能 -->
      <template #edit_unqualityNumber="{ row }">
        <InputNumber
          v-model:value="row.unqualityNumber"
          :min="0"
          @change="
            () => {
              // 废品数变化时自动重新计算报工总数
              row.reportNumber = row.qualityNumber + row.unqualityNumber;
            }
          "
        />
      </template>

      <!-- 操作列模板，包含冲红、人员报工、能源采集三个操作按钮 -->
      <template #action="{ row }">
        <!-- 冲红操作按钮 -->
        <Tooltip>
          <template #title>
            {{ $t('common.flushRed') }}
          </template>
          <Button
            :icon="h(MdiUpdate, { class: 'inline-block size-6' })"
            :loading="row.loading"
            class="mr-4"
            type="link"
            @click="flushRed(row)"
            v-if="operation"
          />
        </Tooltip>

        <!-- 人员报工操作按钮 -->
        <Tooltip>
          <template #title>
            {{ $t('common.personnelReport') }}
          </template>
          <Button
            :icon="h(UilReporter, { class: 'inline-block size-6' })"
            :loading="row.loading"
            class="mr-4"
            type="link"
            @click="showReportForWorkDrawer(row)"
            v-if="operation"
          />
        </Tooltip>
        <!-- 能源采集操作按钮 -->
        <Tooltip>
          <template #title>
            {{ $t('common.energyHarvesting') }}
          </template>
          <Button
            :icon="h(MdiEnergyCircle, { class: 'inline-block size-6' })"
            :loading="row.loading"
            class="mr-4"
            type="link"
            @click="showEnergyHarvestingDrawer(row)"
            v-if="operation"
          />
        </Tooltip>
      </template>
    </Grid>
  </Card>
  <!-- endregion -->
  <!-- region 人员报工信息编辑抽屉 -->
  <!-- 右侧抽屉组件，用于编辑人员报工的详细信息 -->
  <Drawer
    v-model:open="reportForWorkDrawer"
    :footer-style="{ textAlign: 'right' }"
    :width="750"
    placement="right"
    :title="$t('component.reportInfoEdit')"
    @close="reportForWorkDrawerClose"
  >
    <!-- 有报工数据时显示详情编辑区域 -->
    <div v-if="editDetails && editDetails.length > 0">
      <!-- 遍历每个报工记录，显示详细信息 -->
      <div v-for="item of editDetails" :key="item.id" class="!mb-8">
        <!-- 报工基本信息描述列表 -->
        <Descriptions bordered :column="2" class="!mb-4">
          <DescriptionsItem :label="$t('component.reportTotal')" :span="2">
            {{ item.reportNumber }}
          </DescriptionsItem>
          <!-- 原始良品数编辑项 -->
          <DescriptionsItem :label="$t('component.qualityCount')">
            <InputNumber
              v-model:value="item.qualityNumber"
              :addon-after="item.unit"
              :min="0"
              @change="
                () => {
                  // 良品数变化时重新计算总数和单位转换
                  item.reportNumber = item.qualityNumber + item.unqualityNumber;
                  unitConversion(item);
                }
              "
            />
          </DescriptionsItem>
          <!-- 转换后的良品数显示（只读） -->
          <DescriptionsItem :label="$t('component.qualityCount')">
            <InputNumber
              v-model:value="item.qualityNumber_zf"
              :addon-after="getUnit(item.unit)"
              :min="0"
              readonly
            />
          </DescriptionsItem>

          <!-- 原始废品数编辑项 -->
          <DescriptionsItem :label="$t('component.defectCount')">
            <InputNumber
              v-model:value="item.unqualityNumber"
              :addon-after="item.unit"
              :min="0"
              @change="
                () => {
                  // 废品数变化时重新计算总数和单位转换
                  item.reportNumber = item.qualityNumber + item.unqualityNumber;
                  unitConversion(item);
                }
              "
            />
          </DescriptionsItem>
          <!-- 转换后的废品数显示（只读） -->
          <DescriptionsItem :label="$t('component.defectCount')">
            <InputNumber
              v-model:value="item.unqualityNumber_zf"
              :addon-after="getUnit(item.unit)"
              :min="0"
              readonly
            />
          </DescriptionsItem>
          <!-- 人时编辑项 -->
          <DescriptionsItem :label="$t('component.personHour')">
            <InputNumber
              v-model:value="item.personTime"
              :addon-after="$t('component.hour')"
              :min="0"
            />
          </DescriptionsItem>
          <!-- 机时编辑项 -->
          <DescriptionsItem :label="$t('component.machineHour')">
            <InputNumber
              v-model:value="item.equipTime"
              :addon-after="$t('component.hour')"
              :min="0"
            />
          </DescriptionsItem>
          <!-- 报工人信息（只读） -->
          <DescriptionsItem :label="$t('component.reportPerson')">
            {{ item.reportPerson }}
          </DescriptionsItem>
          <!-- 报工时间信息（只读） -->
          <DescriptionsItem :label="$t('component.reportTime')">
            {{ item.reportTime }}
          </DescriptionsItem>
        </Descriptions>

        <!-- 切换具体报工人员数据显示的按钮 -->
        <Button @click="item.editDetails = !item.editDetails">
          {{ item.editDetails ? $t('component.hide') : $t('component.edit') }}{{ $t('component.specificReportData') }}
        </Button>

        <!-- 具体报工人员数据展示区域 -->
        <!-- 注意：这里存在逻辑错误，应该用 v-if="item.editDetails" 而不是 v-if="!item.editDetails" -->
        <div v-if="!item.editDetails">
          <div v-if="editDetails && editDetails.length > 0">
            <!-- 遍历具体的报工人员数据 -->
            <Descriptions
              bordered
              class="!mb-4"
              v-for="i of item.editDetails"
              :column="2"
              :key="i.id"
            >
              <DescriptionsItem :label="$t('component.personnelId')">
                {{ i.reportPerson }}
              </DescriptionsItem>
              <DescriptionsItem :label="$t('component.reportTotal')">
                {{ i.reportNumber }}
              </DescriptionsItem>
              <DescriptionsItem :label="$t('component.qualityCount')">
                <InputNumber
                  v-model:value="i.qualityNumber"
                  :min="0"
                  @change="
                    () => {
                      // 具体人员良品数变化时重新计算总数
                      i.reportNumber = i.qualityNumber + i.unqualityNumber;
                    }
                  "
                />
              </DescriptionsItem>
              <DescriptionsItem :label="$t('component.defectCount')">
                <InputNumber
                  v-model:value="i.unqualityNumber"
                  :min="0"
                  @change="
                    () => {
                      // 具体人员废品数变化时重新计算总数
                      i.reportNumber = i.qualityNumber + i.unqualityNumber;
                    }
                  "
                />
              </DescriptionsItem>
              <DescriptionsItem :label="$t('component.personHour')">
                <InputNumber v-model:value="i.personTime" :min="0" />
              </DescriptionsItem>
            </Descriptions>
          </div>
        </div>
        <!-- 无具体人员报工数据时显示提示信息 -->
        <div v-else>
          <span>{{ $t('component.noReportData') }}</span>
        </div>
      </div>
    </div>
    <!-- 无报工数据时显示空状态 -->
    <Empty v-else :description="$t('component.noPersonReportData')" />
  </Drawer>
  <!-- endregion -->
  <!-- region 能源采集信息编辑抽屉 -->
  <!-- 右侧抽屉组件，用于编辑能源采集的详细信息 -->
  <Drawer
    v-model:open="energyHarvestingDrawer"
    :footer-style="{ textAlign: 'right' }"
    :width="720"
    placement="right"
    title="能源采集信息编辑"
    @close="reportenergyHarvestingDrawerClose"
  >
    <!-- 有能源采集数据时显示详情编辑区域 -->
    <div v-if="editEnergyHarvesting && editEnergyHarvesting.length > 0">
      <!-- 遍历每个能源采集记录，显示详细信息 -->
      <Descriptions
        bordered
        v-for="item of editEnergyHarvesting"
        :column="2"
        :key="item.id"
        class="!mb-8"
      >
        <!-- 能源类型显示 -->
        <DescriptionsItem :label="$t('component.energyType')">
          {{ getTypeText(item.energyType) }}
        </DescriptionsItem>
        <!-- 仪表编号显示 -->
        <DescriptionsItem :label="$t('component.meterCode')">
          {{ item.energyEquipCode }}
        </DescriptionsItem>
        <!-- 仪表读数编辑（当前已注释，可能不需要直接编辑） -->
        <!--        <DescriptionsItem label="仪表读数">
          <InputNumber v-model:value="item.energyValue" :min="0" />
        </DescriptionsItem>-->
        <!-- 仪表开始时间显示 -->
        <DescriptionsItem :label="$t('component.meterStartTime')">
          {{ item.energyStartTime }}
        </DescriptionsItem>
        <!-- 仪表开始读数编辑 -->
        <DescriptionsItem :label="$t('component.meterStartReading')">
          <InputNumber
            v-model:value="item.startEnergyValue"
            :min="0"
            @change="energyChange(item)"
          />
        </DescriptionsItem>
        <!-- 仪表结束时间显示 -->
        <DescriptionsItem :label="$t('component.meterEndTime')">
          {{ item.energyEndTime }}
        </DescriptionsItem>
        <!-- 仪表结束读数编辑 -->
        <DescriptionsItem :label="$t('component.meterEndReading')">
          <InputNumber
            v-model:value="item.endEnergyValue"
            :min="item.startEnergyValue || 0"
            :disabled="!(item.startEnergyValue || item.startEnergyValue === 0)"
            @change="energyChange(item)"
          />
        </DescriptionsItem>
        <!-- 能耗值编辑 -->
        <DescriptionsItem :label="$t('component.energyConsumption')">
          <InputNumber
            v-model:value="item.energyValue"
            :min="0"
            @change="energyChange(item)"
          />
        </DescriptionsItem>
        <!-- 异常说明显示 -->
        <DescriptionsItem :label="$t('component.exceptionDescription')">
          {{ item.errorName }}
        </DescriptionsItem>
        <!-- 关联工单号显示 -->
        <DescriptionsItem :label="$t('component.workOrderNumber')">
          {{ item.worksheetCode }}
        </DescriptionsItem>
        <!-- 采集任务号显示 -->
        <DescriptionsItem :label="$t('component.collectionTaskNo')">
          {{ item.catchCode }}
        </DescriptionsItem>
        <!-- 采集人员显示 -->
        <DescriptionsItem :label="$t('component.collector')">
          {{ item.catchUser }}
        </DescriptionsItem>
        <!-- 采集时间显示 -->
        <DescriptionsItem :label="$t('component.collectionTime')">
          {{ item.catchTime }}
        </DescriptionsItem>
        <!-- 备注信息显示 -->
        <DescriptionsItem :label="$t('component.remark')">
          {{ item.remark }}
        </DescriptionsItem>
      </Descriptions>
    </div>
    <!-- 无能源采集数据时显示空状态 -->
    <Empty v-else :description="$t('component.noEnergyCollectionData')" />
  </Drawer>
  <!-- endregion -->
</template>

<style scoped>
/*
 * 组件专属样式
 * 当前为空，如需要可以在此添加局部样式
 */
</style>
