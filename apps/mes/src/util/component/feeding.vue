<script setup lang="ts">
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

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
  getBomMaterialListByCode,
  getMaterialCodeByJjcl,
  getWarehouseByMaterialCode,
  getZFBomMaterialListByCode,
  pushAuditRecord,
  smkCXFeedSave,
  smkFeedCheck,
  smkFeedDBSave,
  smkFeedFXSave,
  smkFeedSave,
  smkFeedSYSave,
  smkFeedZFSave,
  smkFeedZs,
  smkFeedZSSave,
  smkFeedZYSave,
} from '#/api';

/**
 * 是否显示抽屉
 */
const showDrawer = ref(false);
/**
 * 编辑的项
 */
const editItem = ref<any>({});
/**
 * 是否是辅助料
 */
const isAuxiliaryMaterials = ref(false);
/**
 * 显示抽屉
 * @param row
 */
function show(row: any) {
  editItem.value = row;
  showDrawer.value = true;
  isAuxiliaryMaterials.value = !isSpecialWorkstation(
    ['ZJ', 'BC1'],
    editItem.value.workstationCode,
  );
  setTimeout(() => {
    reload();
    queryAuditByRecord();
  }, 200);
}

/**
 * 关闭抽屉
 */
function close() {
  showDrawer.value = false;
  btlRemark.value = '';
  editItem.value = {};
}

// region 暴露方法，供父组件调用
defineExpose({
  show,
});
// endregion

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'materialCode', title: '物料编号', minWidth: 120 },
    { field: 'materialName', title: '原料名称', minWidth: 200 },
    { field: 'materialDosage', title: '干料标准量', minWidth: 150 },
    { field: 'unit', title: '单位', minWidth: 150 },
    { field: 'materialUseNumber', title: '已投入量', minWidth: 150 },
    {
      field: '',
      title: '加料量',
      minWidth: 150,
      slots: { default: 'feedingAmount' },
      visible: isSpecialWorkstation(['制釉', '施釉', '效果釉', '制粉', '成型']),
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 150,
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
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

const gridEvents: VxeGridListeners<any> = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

function reload() {
  gridApi.reload();
}

function queryData(_data: any) {
  return new Promise((resolve, reject) => {
    const ob = editItem.value.workstationCode.includes('ZF')
      ? getZFBomMaterialListByCode(
          editItem.value.workstationCode,
          editItem.value.worksheetCode,
        )
      : getBomMaterialListByCode(
          editItem.value.workstationCode,
          editItem.value.worksheetCode,
        );

    ob.then((data: any) => {
      // 将接口返回的数据适配到表格所需的格式
      resolve({
        total: data.length, // 总数据量
        items: data, // 当前页数据
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
  return (wetWeight * (1 - waterRate / 100)).toFixed(2);
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
 * 字符串解析函数
 */
function handleCombinedStringChange(
  value: string,
  item: any,
  isWarehouse = false,
) {
  const arr = parseCombinedString(value);
  if (isWarehouse) {
    item.warehouseCode = arr[0];
    item.stockQuality = arr[1];
    item.areaCode = arr[2] ?? undefined;
    item.batchCode = arr[3] ?? undefined;
  } else {
    item.batchCode = arr[0];
    item.warehouseCodeAndNumber = arr[1];
    item.warehouseCode = arr[1];
    item.stockQuality = arr[2];
    item.areaCode = arr[3];
  }
}

/**
 * 干湿料计算函数
 * @param item
 */
function getDryCharge(item: any) {
  if (!item.feedNumber || !item.waterNumber) return '0';
  return calculateDryWeight(item.feedNumber, item.waterNumber);
}
// endregion

// region 加料/投料
// 是否显示加料/投料
const showFeed = ref(false);
// 加料/投料数据
const editFeed = ref<any>({});
// 表单引用
const formRef = ref<any>();
// 表单数据
const formState = ref<any>();
// 是否为创建
const isCreate = ref(false);
// 物料列表
const materialCodeList = ref<any>([]);

/**
 * 显示加料/投料
 * @param row
 */
function displayFeeding(row?: any) {
  showFeed.value = true;

  if (row) {
    isCreate.value = row.isCreate;
    editFeed.value = row;
    // 判断是否处于审核状态
    formState.value = editFeed.value.overtakingApproval
      ? editFeed.value.overclaimDetails
      : editFeed.value?.details || [];

    if (formState.value.length === 0) {
      if (
        isSpecialWorkstation(['制釉', '施釉', '效果釉', '打包', '制粉', '成型'])
      ) {
        formState.value.push({
          unFeedNumber: 0,
        });
        warehouseCodeList.value = [];
        editFeed.value.batchCodes?.forEach((item: any) => {
          item.labelFormmat = `${item.batchCode}(${item.areaCode})`;
          item.valueFormmat = `${item.batchCode}&&${item.warehouseCode}&&${item.stockQuality}&&${item.areaCode}`;
          warehouseCodeList.value.push({
            label: `${item.warehouseCode}(${item.stockQuality})__${item.remake ?? ''}`,
            value: `${item.warehouseCode}&&${item.stockQuality}&&${item.areaCode ?? ''}&&${item.batchCode ?? ''}`,
          });
        });
      } else {
        if (editFeed.value.batchCodes) {
          editFeed.value.batchCodes.forEach((item: any) => {
            formState.value.push({
              waterNumber: item.waterNumber,
              waterNumber_black: (item.waterNumber * 100).toFixed(4),
              areaCode: item.areaCode,
              warehouseCode: item.warehouseCode,
              batchCode: item.batchCode,
              standardNumber: item.standardNumber,
              stockQuality: item.stockQuality,
              unFeedNumber: 0,
            });

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
    isCreate.value = true;
    editFeed.value = {};
    formState.value = [
      {
        unFeedNumber: 0,
      },
    ];
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
const remark = ref('');
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
      if (isSpecialWorkstation(['成型'])) {
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
        });
    }
  });
}

/**
 * 提交异常审批
 */
function submitOverclaim(params: any) {
  pushAuditRecord(params).then((_data: any) => {
    // 设置超领详情, 备份不干扰源数据
    editItem.value.overclaimDetails = getRawMaterialData();
    queryAuditByRecord();
    feedClose();
  });
}

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
 * 获取加料数据
 */
function getRawMaterialData() {
  const values = formState.value;
  values.forEach((item: any) => {
    if (!item.waterNumber) {
      item.waterNumber = 0;
    }
    item.materialCode = editItem.value.materialCode;
    item.warehouseCode =
      typeof item.warehouseCode === 'string'
        ? item.warehouseCode
        : item.warehouseCode[0];
    item.warehouseCode = item.warehouseCode || '';
  });
  return values;
}
// endregion

// region 杂收/ 提交

// 杂收提交状态
const miscellaneousIncomeLoading = ref(false);
// 提交状态
const submitLoading = ref(false);
// 是否尚未杂收
const miscellaneousIncome = ref(true);
// 补料原因
const btlRemark = ref('');

/**
 * 提交
 */
function submit(type: 0 | 1) {
  const params: any = {
    equipCode: editItem.value.workstationCode,
    workSheetCode: editItem.value.worksheetCode,
    feedDetailVMs: [] as any,
  };
  gridApi.grid.getTableData().tableData.forEach((item: any) => {
    item.details?.forEach((detail: any) => {
      if (detail.feedNumber >= 0) {
        params.feedDetailVMs.push({
          ...detail,
          materialCode: item.materialCode,
        });
      }
    });
  });
  if (params.feedDetailVMs.length === 0) {
    message.error('请先添加物料');
    return;
  }
  let ob: any;
  if (type === 1) {
    params.btlRemark = btlRemark.value;
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
    } else {
      message.warning('当前没有具体的接口, 请联系相关人员!');
      return;
    }
    submitLoading.value = true;
  } else {
    ob = smkFeedZs(params);
    miscellaneousIncomeLoading.value = true;
  }
  ob.then(() => {
    message.success($t('common.successfulOperation'));
    if (type === 1) {
      miscellaneousIncome.value = true;
      close();
    } else {
      miscellaneousIncome.value = false;
    }
  }).finally(() => {
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
            (isSpecialWorkstation(['制浆']) && miscellaneousIncome) ||
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
            :disabled="!miscellaneousIncome || overclaimStatus"
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
              <IconifyIcon
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
                <IconifyIcon
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
              {{ getDryChargeSum()() }}
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
        isSpecialWorkstation(['制釉', '效果釉', '制粉', '施釉', '成型'])
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
