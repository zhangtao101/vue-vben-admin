<script setup lang="ts">
/**
 * 生产投料操作管理组件
 * 用于管理生产过程中的物料投料、补投料和杂收操作，包括：
 * 1. 物料BOM清单展示和管理
 * 2. 物料投料记录的新增和编辑
 * 3. 不同工位的特殊处理逻辑（制浆、制粉、制釉等）
 * 4. 干湿料换算和库存管理
 * 5. 异常审批和杂收处理
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Col,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getAuditByRecord,
  getBtlBomMaterialListByCode,
  getMaterialCodeByJjcl,
  getWarehouseByMaterialCode,
  getZFBomMaterialListByCode,
  smkCXFeedSave,
  smkFeedDBSave,
  smkFeedFXSave,
  smkFeedPGSave,
  smkFeedSave,
  smkFeedSYSave,
  smkFeedZFSave,
  smkFeedZs,
  smkFeedZSSave,
  smkFeedZYSave,
} from '#/api';

// region 组件基础状态管理
/**
 * 控制主抽屉组件的显示状态
 * 用于显示投料操作的主界面
 */
const showDrawer = ref(false);

/**
 * 当前编辑的工位/工单数据
 * 存储从父组件传入的工位信息，包含工位编码、工单号等
 */
const editItem = ref<any>({});

/**
 * 标识当前工位是否为辅助料工位
 * 用于区分主料和辅助料的不同处理逻辑
 */
const isAuxiliaryMaterials = ref(false);

/**
 * 显示投料管理抽屉
 * 初始化组件数据并开始投料操作流程
 * @param {object} row - 工位数据行对象，包含工位基本信息
 */
function show(row: any) {
  // 存储当前工位数据
  editItem.value = row;

  // 显示主操作抽屉
  showDrawer.value = true;

  // 判断是否为辅助料工位（通过工位编码判断）
  isAuxiliaryMaterials.value = !isSpecialWorkstation(
    ['ZJ', 'BC1'], // 辅助料工位编码前缀
    editItem.value.workstationCode,
  );

  // 延迟200ms执行数据加载，确保DOM渲染完成
  setTimeout(() => {
    reload(); // 重新加载BOM数据
    queryAuditByRecord(); // 查询审核状态
  }, 200);
}

/**
 * 关闭投料管理抽屉
 * 清空状态数据并隐藏界面
 */
function close() {
  showDrawer.value = false;
  btlRemark.value = ''; // 清空补料原因
  editItem.value = {}; // 清空工位数据
}

// region 组件方法暴露
/**
 * 暴露组件方法供父组件调用
 */
defineExpose({
  show, // 显示投料管理界面
});
// endregion

// region BOM数据表格管理
/**
 * VXE表格配置选项
 * 配置物料BOM清单的数据展示表格，显示当前工位所需的物料信息
 */
const gridOptions: VxeGridProps<any> = {
  align: 'center', // 表格内容居中对齐
  border: true, // 显示表格边框

  // 动态行样式：补投料行显示黄色背景
  rowClassName({ row: { zsflag } }) {
    return zsflag ? 'bg-yellow-500' : '';
  },

  columns: [
    { title: '序号', type: 'seq', width: 50 }, // 序号列
    { field: 'materialCode', title: '物料编号', minWidth: 120 }, // 物料唯一标识
    { field: 'materialName', title: '原料名称', minWidth: 200 }, // 物料描述名称
    { field: 'materialDosage', title: '干料标准量', minWidth: 150 }, // 标准用量
    { field: 'unit', title: '投入单位', minWidth: 150 }, // 计量单位
    { field: 'materialUseNumber', title: '已投入量', minWidth: 150 }, // 已投用量
    {
      field: '',
      title: '补投入量',
      minWidth: 150,
      slots: { default: 'feedingAmount' }, // 自定义补投料量显示插槽
    },
    {
      field: 'action',
      fixed: 'right', // 固定在表格右侧
      slots: { default: 'action' }, // 操作列插槽
      title: '操作',
      minWidth: 150,
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
        // 异步查询BOM数据
        return await queryData({
          page: page.currentPage,
          pageSize: page.pageSize,
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
 * 重新加载表格数据
 * 调用表格API的reload方法刷新数据
 */
function reload() {
  gridApi.reload();
}

/**
 * 标识当前是否为补投料状态
 * 用于控制界面按钮的显示和操作权限
 */
const zsTotalflagRef = ref(false);

/**
 * 查询BOM物料数据
 * 根据工位编码调用不同的API获取物料清单
 * @param {object} _data - 查询参数（当前未使用）
 * @returns {Promise} 返回包含物料列表的Promise对象
 */
function queryData(_data: any) {
  return new Promise((resolve, reject) => {
    // 根据工位编码判断调用哪个API
    // ZF开头的工位使用专用API，其他使用通用API
    const ob = editItem.value.workstationCode.includes('ZF')
      ? getZFBomMaterialListByCode(
          editItem.value.workstationCode, // 工位编码
          editItem.value.worksheetCode, // 工单编码
        )
      : getBtlBomMaterialListByCode(
          editItem.value.workstationCode, // 工位编码
          editItem.value.worksheetCode, // 工单编码
        );

    ob.then(({ zsTotalflag, list }: any) => {
      // 设置补投料状态标志
      zsTotalflagRef.value = zsTotalflag;

      // 将接口返回的数据适配到表格所需的格式
      resolve({
        total: list.length, // 总数据量
        items: list, // 当前页数据
      });
    }).catch((error: any) => {
      // 捕获接口调用错误并拒绝 Promise
      reject(error);
    });
  });
}

// endregion

// region 工具

// 干湿料计算工具函数
function calculateDryWeight(wetWeight: number, waterRate: number) {
  // 处理边界情况：含水率为0或未提供时，干料量等于湿料量
  if (!waterRate || waterRate === 0) return wetWeight;
  // 计算公式：干料量 = 湿料量 × (1 - 含水率)
  return (wetWeight * (1 - waterRate)).toFixed(3);
}

// 字符串解析工具函数（用于解析库位/批次字符串）
function parseCombinedString(combinedStr: string, delimiter = '&&') {
  if (!combinedStr) return [];
  const arr = combinedStr.split(delimiter);
  return arr;
}
// 工位名称判断工具函数
function isWorkstation(workstationName: string, keywords: string[]) {
  if (!workstationName) return false;
  return keywords.some((keyword: string) => workstationName.includes(keyword));
}

/**
 * 工位判断
 * @param keywords 工位列表
 */
function isSpecialWorkstation(keywords: string[], key?: string) {
  return isWorkstation(key ?? editItem.value.workstationName, keywords);
}

/**
 * 组合字符串解析处理函数
 * 解析并设置物料的库位、批次等信息到数据对象中
 * @param {string} value - 需要解析的组合字符串
 * @param {object} item - 目标数据对象
 * @param {boolean} isWarehouse - 是否为库位解析模式
 */
function handleCombinedStringChange(
  value: string,
  item: any,
  isWarehouse = false,
) {
  const arr = parseCombinedString(value);
  if (isWarehouse) {
    // 库位模式解析：库位编码&&库存质量&&储位&&批次
    item.warehouseCode = arr[0]; // 库位编码
    item.stockQuality = arr[1]; // 库存质量
    item.areaCode = arr[2] ?? undefined; // 储位
    item.batchCode = arr[3] ?? undefined; // 批次
  } else {
    // 普通模式解析：批次&&库位编码&&库存质量&&储位
    item.batchCode = arr[0]; // 批次
    item.warehouseCodeAndNumber = arr[1]; // 库位编码和编号
    item.warehouseCode = arr[1]; // 库位编码
    item.stockQuality = arr[2]; // 库存质量
    item.areaCode = arr[3]; // 储位
  }
}

/**
 * 干湿料计算函数
 * @param item
 */
function getDryCharge(item: any) {
  if (!item.feedNumber || !(item.waterNumber === 0 || item.waterNumber))
    return '0';
  return calculateDryWeight(item.feedNumber, item.waterNumber);
}
// endregion

// region 加料/投料操作管理
/**
 * 控制加料/投料对话框的显示状态
 */
const showFeed = ref(false);

/**
 * 当前编辑的加料/投料数据
 * 存储正在编辑的物料投料详细信息
 */
const editFeed = ref<any>({});

/**
 * 表单组件引用对象
 * 用于表单验证和重置操作
 */
const formRef = ref<any>();

/**
 * 投料表单数据列表
 * 存储多行投料数据的数组结构
 */
const formState = ref<any>();

/**
 * 标识当前操作是否为新增投料记录
 */
const isCreate = ref(false);

/**
 * 物料代码选项列表
 * 用于新增投料时的物料选择
 */
const materialCodeList = ref<any>([]);

/**
 * 显示加料/投料操作对话框
 * 初始化投料表单数据并根据不同工位类型进行特殊处理
 * @param {object} row - 可选的现有投料数据，编辑时传入
 */
function displayFeeding(row?: any) {
  showFeed.value = true;

  if (row) {
    // 编辑模式：设置现有数据
    isCreate.value = row.isCreate;
    editFeed.value = row;

    // 判断是否处于审核状态，使用相应的详情数据
    formState.value = editFeed.value.overtakingApproval
      ? editFeed.value.overclaimDetails
      : editFeed.value?.details || [];

    // 如果没有详情数据，根据工位类型初始化表单
    if (formState.value.length === 0) {
      if (
        isSpecialWorkstation([
          '制釉',
          '施釉',
          '效果釉',
          '打包',
          '制粉',
          '成型',
          '抛光',
        ])
      ) {
        // 特殊工位的表单初始化逻辑
        formState.value.push({
          unFeedNumber: 0, // 初始化补投料量
        });
        warehouseCodeList.value = [];

        // 处理批次代码数据
        editFeed.value.batchCodes?.forEach((item: any) => {
          item.labelFormmat = `${item.batchCode}(${item.areaCode})`;
          item.valueFormmat = `${item.batchCode}&&${item.warehouseCode}&&${item.stockQuality}&&${item.areaCode}`;
          warehouseCodeList.value.push({
            label: `${item.warehouseCode}(${item.stockQuality})__${item.remake ?? ''}`,
            value: `${item.warehouseCode}&&${item.stockQuality}&&${item.areaCode ?? ''}&&${item.batchCode ?? ''}`,
          });
        });
      } else {
        // 其他工位的表单初始化逻辑
        if (editFeed.value.batchCodes) {
          editFeed.value.batchCodes.forEach((item: any) => {
            const formitem: any = {
              waterNumber: item.waterNumber,
              waterNumber_black: (item.waterNumber * 100).toFixed(4),
              areaCode: item.areaCode,
              warehouseCode: item.warehouseCode,
              batchCode: item.batchCode,
              standardNumber: item.standardNumber,
              stockQuality: item.stockQuality,
              unFeedNumber: 0,
            };

            // 补投料特殊处理
            if (editFeed.value.zsflag) {
              formitem.feedNumber = item.stockQuality;
            }
            formState.value.push(formitem);
            warehouseCodeList.value.push({
              label: item.warehouseCode,
              value: `${item.warehouseCode}&&${item.stockQuality}`,
            });
          });
        } else {
          formState.value.push({
            unFeedNumber: 0,
          });
        }
      }
    }
  } else {
    // 新增模式：初始化空表单并加载物料列表
    isCreate.value = true;
    editFeed.value = {};
    formState.value = [
      {
        unFeedNumber: 0,
      },
    ];

    // 加载可用的物料代码列表
    getMaterialCodeByJjcl().then((data) => {
      materialCodeList.value = [];
      if (data && data.length > 0) {
        data.forEach((item: any) => {
          materialCodeList.value.push({
            label: item.materialName,
            value: item.materialCode,
            unit: item.unit,
          });
        });
      }
    });
  }
}

// region 库位查询
const warehouseCodeList = ref<any>([]);
/**
 * 查询库位(制粉)
 */
function queryLibraryLocation() {
  if (editFeed.value.materialCode) {
    warehouseCodeList.value = [];
    getWarehouseByMaterialCode(editFeed.value.materialCode).then((data) => {
      if (data && data.length > 0) {
        data.forEach((item: any) => {
          warehouseCodeList.value.push({
            label: `${item.warehouseCode}(${item.stockQuality})__${item.remake ?? ''}`,
            value: `${item.warehouseCode}&&${item.stockQuality}&&${item.areaCode ?? ''}&&${item.batchCode ?? ''}`,
          });
        });
      }
    });
  }
}

// endregion

/**
 * 获取干料总量
 */
function getDryChargeSum(row?: any) {
  return (type?: number) => {
    let sum = 0;
    const list = row ? row.details : formState.value;
    list?.forEach((item: any) => {
      if (type && item.feedNumber >= 0) {
        sum += item.feedNumber;
      } else if (item.feedNumber >= 0 && item.waterNumber >= 0) {
        sum += item.feedNumber * (1 - item.waterNumber);
      }
    });
    return sum.toFixed(6) ?? 0;
  };
}

/**
 * 删除
 * @param rowIndex
 */
function deleteFeed(rowIndex: number) {
  Modal.confirm({
    title: '确定删除吗？',
    onOk() {
      const tableData = gridApi.grid.getTableData().tableData;
      tableData.splice(rowIndex, 1);
      gridApi.grid.loadData(tableData);
    },
  });
}

// 提交状态
const checkLoading = ref(false);
// 备注
// const remark = ref('');
/**
 * 提交
 */
function feedingCheck() {
  formRef.value.validate().then(() => {
    if (isCreate.value) {
      editFeed.value.details = formState.value;
      editFeed.value.isCreate = true;
      const tableData = gridApi.grid.getTableData().tableData;
      tableData.unshift(editFeed.value);
      gridApi.grid.loadData(tableData);
      feedClose();
    } else {
      editFeed.value.details = getRawMaterialData();
      feedClose();
      /* if (isSpecialWorkstation(['成型'])) {
        editFeed.value.details = getRawMaterialData();
        feedClose();
        return;
      }
      const params: any = [];
      formState.value.forEach((item: any) => {
        if (isSpecialWorkstation(['制釉', '效果釉', '制粉', '施釉', '打包'])) {
          params.push({
            ...item,
            bindingId: editItem.value.feedBindingId,
            waterNumber: 0,
            equipCode: editItem.value.workstationCode,
            workSheetCode: editItem.value.worksheetCode,
            materialCode: editFeed.value.materialCode,
            warehouseCode:
              typeof item.warehouseCode === 'string'
                ? item.warehouseCode
                : item.warehouseCode[0],
          });
        } else if (item.feedNumber >= 0 && item.waterNumber >= 0) {
          params.push({
            ...item,
            waterNumber: item.waterNumber_black / 100,
            bindingId: editItem.value.feedBindingId,
            equipCode: editItem.value.workstationCode,
            workSheetCode: editItem.value.worksheetCode,
            materialCode: editFeed.value.materialCode,
            warehouseCode:
              typeof item.warehouseCode === 'string'
                ? item.warehouseCode
                : item.warehouseCode[0],
          });
        }
      });
      smkFeedCheck(params)
        .then((data) => {
          message.success($t('common.successfulOperation'));
          if (isSpecialWorkstation(['制浆'])) {
            data.forEach((_item: any, index: number) => {
              formState.value[index].unFeedNumber = _item.unFeedNumber;
              formState.value[index].feedMumber = _item.feedMumber;
            });
          }
          editFeed.value.details = getRawMaterialData();
          feedClose();
        })
        .catch((_error: any) => {
          if (_error.message.includes('使用量范围')) {
            Modal.confirm({
              title: '是否提交异常审批？',
              content: h(Input, {
                onChange: (val: any) => {
                  remark.value = val.target.value;
                },
              }),
              onOk() {
                params.forEach((item: any) => {
                  item.remark = remark.value;
                });
                submitOverclaim(params);
              },
            });
          }
        });*/
    }
  });
}

/**
 * 提交异常审批
 */
/*
function submitOverclaim(params: any) {
  pushAuditRecord(params).then((_data: any) => {
    // 设置超领详情, 备份不干扰源数据
    editItem.value.overclaimDetails = getRawMaterialData();
    queryAuditByRecord();
    feedClose();
  });
}
*/

/**
 * 关闭抽屉
 */
function feedClose() {
  showFeed.value = false;
  isCreate.value = false;
  editFeed.value = {};
}

/**
 * 添加一行
 */
function addFeedLine() {
  formState.value.push({
    unFeedNumber: 0,
  });
}

/**
 * 删除一行
 * @param index
 */
function delFeedLine(index: number) {
  Modal.confirm({
    title: '确定删除吗？',
    onOk() {
      formState.value.splice(index, 1);
    },
  });
}
/**
 * 获取并处理投料表单数据
 * 对表单数据进行最终处理，准备提交到后端
 * @returns {Array} 处理后的投料数据列表
 */
function getRawMaterialData() {
  const values = formState.value;
  values.forEach((item: any) => {
    // 确保含水率有默认值
    if (!item.waterNumber) {
      item.waterNumber = 0;
    }
    // 设置物料编码
    item.materialCode = editItem.value.materialCode;
    // 处理库位编码的格式
    item.warehouseCode =
      typeof item.warehouseCode === 'string'
        ? item.warehouseCode
        : item.warehouseCode[0];
    // 确保库位编码不为空
    item.warehouseCode = item.warehouseCode || '';
  });
  return values;
}
// endregion

// region 杂收/投料提交管理

/**
 * 杂收操作提交状态控制
 */
const miscellaneousIncomeLoading = ref(false);

/**
 * 投料提交状态控制
 */
const submitLoading = ref(false);

/**
 * 标识当前是否尚未进行杂收操作
 */
const miscellaneousIncome = ref(true);

/**
 * 补料原因备注信息
 */
const btlRemark = ref('');

/**
 * 提交投料或杂收操作
 * 根据操作类型和工位类型调用相应的API接口
 * @param {number} type - 操作类型：0=杂收，1=投料
 */
function submit(type: 0 | 1) {
  // 构造提交参数
  const params: any = {
    equipCode: editItem.value.workstationCode, // 工位编码
    workSheetCode: editItem.value.worksheetCode, // 工单编码
    feedDetailVMs: [] as any, // 投料详情列表
  };

  // 从表格数据中提取有效的投料详情
  gridApi.grid.getTableData().tableData.forEach((item: any) => {
    item.details?.forEach((detail: any) => {
      if (detail.feedNumber >= 0) {
        params.feedDetailVMs.push({
          ...detail,
          materialCode: item.materialCode, // 物料编码
        });
      }
    });
  });

  // 验证是否有有效的投料数据
  if (params.feedDetailVMs.length === 0) {
    message.error('请先添加物料');
    return;
  }

  let ob: any;

  if (type === 1) {
    // 投料操作处理
    params.btlRemark = btlRemark.value; // 补料原因
    params.feedBindingId = editItem.value.feedBindingId; // 绑定ID

    // 根据工位类型调用不同的API接口
    if (isSpecialWorkstation(['制浆'])) {
      ob = smkFeedSave(params);
    } else if (isSpecialWorkstation(['制粉'])) {
      ob = smkFeedZFSave(params);
    } else if (isSpecialWorkstation(['制色'])) {
      ob = smkFeedZSSave(params);
    } else if (isSpecialWorkstation(['制釉', '效果釉'])) {
      ob = smkFeedZYSave(params);
    } else if (isSpecialWorkstation(['施釉'])) {
      ob = smkFeedSYSave(params);
    } else if (isSpecialWorkstation(['打包'])) {
      ob = smkFeedDBSave(params);
    } else if (isSpecialWorkstation(['复选'])) {
      ob = smkFeedFXSave(params);
    } else if (isSpecialWorkstation(['成型'])) {
      ob = smkCXFeedSave(params);
    } else if (isSpecialWorkstation(['抛光'])) {
      ob = smkFeedPGSave(params);
    } else {
      message.warning('当前没有具体的接口, 请联系相关人员!');
      return;
    }
    submitLoading.value = true; // 设置投料提交状态
  } else {
    // 杂收操作处理
    ob = smkFeedZs(params);
    miscellaneousIncomeLoading.value = true; // 设置杂收提交状态
  }

  // 执行提交操作
  ob.then(() => {
    message.success($t('common.successfulOperation'));
    if (type === 1) {
      miscellaneousIncome.value = true;
      close(); // 关闭主抽屉
    } else {
      miscellaneousIncome.value = false;
      reload(); // 重新加载表格数据
    }
  }).finally(() => {
    // 清除所有提交状态
    submitLoading.value = false;
    miscellaneousIncomeLoading.value = false;
  });
}

// endregion

// region 审核

// 是否处于审核状态
const overclaimStatus = ref(false);
const queryTimeoutId = ref();
// 查询是否处于审核状态
function queryAuditByRecord() {
  getAuditByRecord({
    workstationCode: editItem.value.workstationCode,
    worksheetCode: editItem.value.worksheetCode,
  })
    .then((data: any) => {
      overclaimStatus.value = data === -1;
      if (!overclaimStatus.value) {
        const tableData = gridApi.grid.getTableData().tableData;
        tableData.forEach((item: any) => {
          if (data === 1 && item.overclaimDetails) {
            item.details = item.overclaimDetails;
          } else {
            item.overclaimDetails = undefined;
          }
        });
        gridApi.grid.reloadData(tableData);
      }
    })
    .finally(() => {
      clearTimeout(queryTimeoutId.value);
      if (overclaimStatus.value) {
        queryTimeoutId.value = setTimeout(() => {
          queryAuditByRecord();
        }, 1000 * 20);
      }
    });
}

// endregion
</script>

<template>
  <Drawer
    v-model:open="showDrawer"
    :footer-style="{ textAlign: 'right' }"
    height="80%"
    placement="top"
    :title="$t('supplementaryFeedingOperation.supplementaryFeeding')"
    @close="close"
  >
    <Grid class="mt-4">
      <template #toolbar-tools>
        <!-- 投料 -->
        <Button
          type="primary"
          @click="submit(1)"
          :loading="submitLoading"
          :disabled="
            zsTotalflagRef
              ? false
              : (isSpecialWorkstation(['制浆']) && miscellaneousIncome) ||
                overclaimStatus ||
                !btlRemark
          "
        >
          {{ $t('common.feeding') }}
        </Button>
        <Input
          class="ml-4 w-80"
          :addon-before="
            $t('supplementaryFeedingOperation.reasonsForReplenishingMaterials')
          "
          v-model:value="btlRemark"
        />
      </template>
      <template #toolbar-actions>
        <Space>
          <!-- 新增 -->
          <Button
            type="primary"
            v-if="isAuxiliaryMaterials"
            :disabled="overclaimStatus"
            @click="displayFeeding()"
          >
            {{ $t('common.add') }}
          </Button>
          <!-- 杂收 -->
          <Button
            type="primary"
            :disabled="
              !miscellaneousIncome || overclaimStatus || zsTotalflagRef
            "
            :loading="miscellaneousIncomeLoading"
            @click="submit(0)"
            v-if="!isAuxiliaryMaterials"
          >
            {{ $t('common.miscellaneousCollection') }}
          </Button>
        </Space>
      </template>
      <template #feedingAmount="{ row }">
        {{ getDryChargeSum(row)(1) }}
      </template>
      <template #supplementaryInputVolume="{ row }">
        {{ getDryChargeSum(row)(1) }}
      </template>
      <template #action="{ row, rowIndex }">
        <Space>
          <!-- 加料 -->
          <Tooltip>
            <template #title>
              {{ $t('supplementaryFeedingOperation.addMaterials') }}
            </template>
            <Button
              type="link"
              @click="displayFeeding(row)"
              :disabled="overclaimStatus"
            >
              <Icon
                icon="mdi:shape-add"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 删除 -->
          <Tooltip>
            <template #title>{{ $t('common.delete') }}</template>
            <Popconfirm
              :cancel-text="$t('common.cancel')"
              :ok-text="$t('common.confirm')"
              :title="$t('ui.widgets.deletionConfirmation')"
              @confirm="deleteFeed(rowIndex)"
            >
              <Button danger type="link" :disabled="overclaimStatus">
                <Icon
                  icon="mdi-light:delete"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      </template>
    </Grid>
  </Drawer>

  <Drawer
    v-model:open="showFeed"
    :footer-style="{ textAlign: 'right' }"
    width="600"
    placement="right"
    :title="$t('supplementaryFeedingOperation.feedingMaterials')"
    @close="feedClose"
  >
    <Form
      ref="formRef"
      layout="inline"
      :model="formState"
      :label-col="{ span: 24 }"
      :wrapper-col="{ span: 24 }"
    >
      <Row>
        <!-- 物料编号 -->
        <Col :span="isCreate ? 12 : 8">
          <FormItem :label="$t('supplementaryFeedingOperation.materialNumber')">
            <Select
              v-model:value="editFeed.materialCode"
              placeholder="输入编号进行查询"
              class="w-full"
              :filter-option="false"
              :options="materialCodeList"
              @change="
                (_val: any, _item: any) => {
                  editFeed.materialName = _item.label;
                  editFeed.unit = _item.unit;
                  queryLibraryLocation();
                }
              "
              v-if="isCreate"
            />
            <span class="inline-block w-full" v-else>
              {{ editFeed.materialCode }}
            </span>
          </FormItem>
        </Col>
        <!-- 物料名称 -->
        <Col :span="8" v-if="!isCreate">
          <FormItem :label="$t('supplementaryFeedingOperation.materialName')">
            <span class="inline-block w-full">{{ editFeed.materialName }}</span>
          </FormItem>
        </Col>
        <!-- 标准干料量/标准投入量 -->
        <Col :span="8" v-if="!isCreate">
          <FormItem
            :label="
              isSpecialWorkstation([
                '制釉',
                '施釉',
                '效果釉',
                '打包',
                '制粉',
                '成型',
                '抛光',
              ])
                ? $t(
                    'supplementaryFeedingOperation.standardDryMaterialQuantity',
                  )
                : $t('supplementaryFeedingOperation.standardInputQuantity')
            "
          >
            <span class="inline-block w-full">
              {{ editFeed.materialDosage }}
            </span>
          </FormItem>
        </Col>
        <!-- 当前投入湿料量 -->
        <Col
          :span="8"
          v-if="
            !isSpecialWorkstation([
              '制釉',
              '施釉',
              '效果釉',
              '打包',
              '制粉',
              '成型',
              '抛光',
            ])
          "
        >
          <FormItem
            :label="
              $t(
                'supplementaryFeedingOperation.theCurrentAmountOfWetMaterialInput',
              )
            "
          >
            <span class="inline-block w-full">
              {{ getDryChargeSum()(1) }}
            </span>
          </FormItem>
        </Col>
        <!-- 已投入干料量 -->
        <Col :span="8">
          <FormItem
            :label="
              $t(
                'supplementaryFeedingOperation.theAmountOfDryMaterialHasBeenInput',
              )
            "
          >
            <span class="inline-block w-full">
              {{ editFeed.materialUseNumber }}
            </span>
          </FormItem>
        </Col>
      </Row>
      <template v-for="(item, index) of formState" :key="index">
        <div class="mb-4 rounded-lg border-2 border-red-600 p-2">
          <Space direction="vertical">
            <Row
              v-if="
                !isSpecialWorkstation([
                  '制釉',
                  '施釉',
                  '效果釉',
                  '打包',
                  '制粉',
                  '成型',
                  '抛光',
                ])
              "
            >
              <!-- 物料批次 -->
              <Col :span="8">
                <FormItem
                  :label="$t('supplementaryFeedingOperation.batchOfMaterials')"
                  :name="[index, 'batchCode']"
                  :rules="[{ required: true, message: '该项为必填项!' }]"
                >
                  <Input
                    v-model:value="item.batchCode"
                    placeholder="物料批次"
                    v-if="
                      isCreate ||
                      isSpecialWorkstation(['ZJ'], editItem.workstationCode)
                    "
                  />
                  <Select
                    v-model:value="item.batchCode"
                    show-search
                    placeholder="请选择"
                    style="width: 160px"
                    :disabled="
                      !isSpecialWorkstation(['ZJ'], editItem.workstationCode)
                    "
                    :options="editItem.batchCodes"
                    :field-names="{ label: 'batchCode', value: 'batchCode' }"
                    @change="
                      (_v: any, _i: any) => {
                        item.waterNumber = _i.waterNumber;
                        item.waterNumber_black = (_i.waterNumber * 100).toFixed(
                          4,
                        );
                        item.areaCode = _i.areaCode;
                        item.warehouseCode = _i.warehouseCode;
                      }
                    "
                    v-else
                  />
                </FormItem>
              </Col>
              <!-- 含水率 -->
              <Col :span="8">
                <FormItem
                  :label="$t('supplementaryFeedingOperation.moistureContent')"
                >
                  <InputNumber
                    v-model:value="item.waterNumber_black"
                    class="w-full"
                    :min="0"
                    :max="100"
                    addon-after="%"
                    :placeholder="
                      $t('supplementaryFeedingOperation.moistureContent')
                    "
                    v-if="
                      isCreate ||
                      isSpecialWorkstation(['ZJ'], editItem.workstationCode)
                    "
                    @change="
                      () => {
                        item.waterNumber = item.waterNumber_black / 100;
                      }
                    "
                  />
                  <span
                    class="inline-block w-full"
                    v-else-if="item.waterNumber"
                  >
                    {{ (item.waterNumber * 100).toFixed(2) }}%
                  </span>
                  <span class="inline-block w-full" v-else>0</span>
                </FormItem>
              </Col>
              <!-- SAP储位 -->
              <Col :span="8">
                <FormItem
                  :label="
                    $t('supplementaryFeedingOperation.sapStorageLocation')
                  "
                >
                  <Input
                    v-model:value="item.areaCode"
                    :placeholder="
                      $t('supplementaryFeedingOperation.sapStorageLocation')
                    "
                    v-if="
                      isCreate ||
                      isSpecialWorkstation(['ZJ'], editItem.workstationCode)
                    "
                  />
                  <span class="inline-block w-full" v-else>
                    {{ item.areaCode }}
                  </span>
                </FormItem>
              </Col>
              <!-- SAP库位 -->
              <Col :span="8">
                <FormItem
                  :label="
                    $t('supplementaryFeedingOperation.sapWarehouseLocation')
                  "
                >
                  <Input
                    v-model:value="item.warehouseCode"
                    :placeholder="
                      $t('supplementaryFeedingOperation.sapWarehouseLocation')
                    "
                    v-if="
                      isCreate ||
                      isSpecialWorkstation(['ZJ'], editItem.workstationCode)
                    "
                  />
                  <span class="inline-block w-full" v-else>
                    {{ item.warehouseCode }}
                  </span>
                </FormItem>
              </Col>
              <!-- SAP库位 -->
              <Col :span="8" v-if="isSpecialWorkstation(['制浆'])">
                <FormItem
                  :label="
                    $t('supplementaryFeedingOperation.actualStorageLocation')
                  "
                >
                  <Input
                    v-model:value="item.sjWarehouseCode"
                    :placeholder="
                      $t('supplementaryFeedingOperation.actualStorageLocation')
                    "
                    v-if="
                      isCreate ||
                      isSpecialWorkstation(['ZJ'], editItem.workstationCode)
                    "
                  />
                  <span class="inline-block w-full" v-else>
                    {{ item.sjWarehouseCode }}
                  </span>
                </FormItem>
              </Col>
            </Row>

            <Row
              v-if="
                isSpecialWorkstation([
                  '制釉',
                  '施釉',
                  '效果釉',
                  '打包',
                  '制粉',
                  '成型',
                  '抛光',
                ])
              "
            >
              <!-- 物料批次 -->
              <Col :span="12" v-if="editFeed.materialTypeFlag">
                <FormItem
                  :label="$t('supplementaryFeedingOperation.batchOfMaterials')"
                  :name="[index, 'labelFormmat']"
                  :rules="[{ required: !isCreate, message: '该项为必填项!' }]"
                >
                  <Input v-model:value="item.batchCode" v-if="isCreate" />
                  <Select
                    v-model:value="item.labelFormmat"
                    show-search
                    placeholder="请选择"
                    style="width: 160px"
                    :disabled="editItem.materialTypeFlag"
                    :options="editFeed.batchCodes"
                    :field-names="{
                      label: 'labelFormmat',
                      value: 'valueFormmat',
                    }"
                    @change="
                      (_v: any) => {
                        handleCombinedStringChange(_v, item);
                      }
                    "
                    v-else
                  />
                </FormItem>
              </Col>
              <!-- 库位 -->
              <Col :span="16">
                <FormItem
                  :label="$t('supplementaryFeedingOperation.storageLocation')"
                  :name="[index, 'warehouseCode']"
                  :rules="[{ required: true, message: '该项为必填项!' }]"
                >
                  <Select
                    v-model:value="item.warehouseCodeAndNumber"
                    show-search
                    placeholder="请选择"
                    class="w-full"
                    :disabled="editFeed.materialTypeFlag"
                    :options="warehouseCodeList"
                    @change="
                      (_v: any) => {
                        handleCombinedStringChange(_v, item, true);
                      }
                    "
                  />
                </FormItem>
              </Col>
              <!-- 库存 -->
              <Col :span="8">
                <FormItem
                  :label="$t('supplementaryFeedingOperation.inventory')"
                >
                  <InputNumber
                    v-model:value="item.stockQuality"
                    :addon-after="editFeed.unit"
                    :min="0"
                    readonly
                  />
                </FormItem>
              </Col>
            </Row>

            <Row>
              <!-- 湿料标准投入量 -->
              <Col :span="8" v-if="isSpecialWorkstation(['制浆'])">
                <FormItem
                  :label="
                    $t(
                      'supplementaryFeedingOperation.standardInputAmountOfWetMaterial',
                    )
                  "
                >
                  <InputNumber
                    v-model:value="item.standardNumber"
                    :addon-after="editFeed.unit"
                    :min="0"
                    readonly
                  />
                </FormItem>
              </Col>
              <!-- 实际投入量 -->
              <Col :span="8">
                <FormItem
                  :label="$t('supplementaryFeedingOperation.actualInputVolume')"
                  :name="[index, 'feedNumber']"
                  :rules="[{ required: true, message: '该项为必填项!' }]"
                >
                  <InputNumber
                    v-model:value="item.feedNumber"
                    :addon-after="editFeed.unit"
                    :disabled="editItem.overtakingApproval"
                    :min="0"
                  />
                </FormItem>
              </Col>

              <!-- 实际干料量 -->
              <Col
                :span="8"
                v-if="
                  !isSpecialWorkstation([
                    '制釉',
                    '施釉',
                    '效果釉',
                    '打包',
                    '制粉',
                    '成型',
                    '抛光',
                  ])
                "
              >
                <FormItem
                  :label="
                    $t(
                      'supplementaryFeedingOperation.actualDryMaterialQuantity',
                    )
                  "
                >
                  {{ getDryCharge(item) }}
                </FormItem>
              </Col>

              <!-- 盘盈数量 -->
              <Col :span="8">
                <FormItem
                  :label="$t('supplementaryFeedingOperation.surplusQuantity')"
                  :name="[index, 'unFeedNumber']"
                  :rules="[{ required: true, message: '该项为必填项!' }]"
                >
                  <InputNumber
                    v-model:value="item.unFeedNumber"
                    :addon-after="editFeed.unit"
                    :disabled="editItem.overtakingApproval"
                    :min="0"
                  />
                </FormItem>
              </Col>

              <!-- 库存量 -->
              <Col :span="8">
                <FormItem
                  :label="$t('supplementaryFeedingOperation.inventoryLevel')"
                >
                  {{ item.stockQuality ?? 0 }}
                </FormItem>
              </Col>

              <!-- 批次号 -->
              <Col
                :span="8"
                v-if="isSpecialWorkstation(['制釉', '效果釉', '制粉', '成型'])"
              >
                <FormItem
                  :label="$t('supplementaryFeedingOperation.batchNumber')"
                >
                  {{ item.batchCode }}
                </FormItem>
              </Col>

              <!-- 储位 -->
              <Col
                :span="8"
                v-if="isSpecialWorkstation(['制釉', '效果釉', '制粉', '成型'])"
              >
                <FormItem :label="$t('supplementaryFeedingOperation.areaCode')">
                  {{ item.areaCode }}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col :offset="8" :span="8">
                <Button
                  type="primary"
                  class="w-full"
                  danger
                  @click="delFeedLine(index)"
                >
                  {{ $t('common.delete') }}
                </Button>
              </Col>
            </Row>
          </Space>
        </div>
      </template>
    </Form>
    <Button
      type="primary"
      class="w-full"
      @click="addFeedLine()"
      v-if="
        isCreate ||
        isSpecialWorkstation(['制釉', '效果釉', '制粉', '施釉', '成型', '抛光'])
      "
    >
      {{ $t('common.add') }}
    </Button>

    <template #footer>
      <Button @click="feedClose" class="mr-4">
        {{ $t('common.cancel') }}
      </Button>
      <Button
        type="primary"
        @click="feedingCheck"
        :disabled="editItem.overtakingApproval"
        :loading="checkLoading"
      >
        {{ $t('common.confirm') }}
      </Button>
    </template>
  </Drawer>
</template>

<style scoped></style>
