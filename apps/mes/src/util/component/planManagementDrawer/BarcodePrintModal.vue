<script lang="ts" setup>
/**
 * [INPUT]: 依赖 jsbarcode
 * [OUTPUT]: 对外提供 BarcodePrintModal 弹窗组件，通过 defineExpose({ open }) 暴露 open 方法供父组件调用
 * [POS]: 属于 planManagement 模块的 SMT 条码打印预览弹窗子组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-06-18 10:43:00
 */
import { nextTick, ref } from 'vue';

import { Button, Modal, Space } from 'ant-design-vue';
import JsBarcode from 'jsbarcode';

defineOptions({ name: 'BarcodePrintModal' });

const show = ref(false);
const barCodeDetail = ref<any>({});
const nowDate = ref('');

// region 生成日期
function getNowDate() {
  const day = new Date();
  nowDate.value =
    `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
}
// endregion

// region 打印
function handlePrint() {
  window.print();
}
// endregion

// region 生成条码
function generateBarcode(code: string) {
  nextTick(() => {
    const el = document.querySelector('#svgcode');
    if (el) {
      try {
        JsBarcode('#svgcode', code, {
          width: 1.3,
          height: 30,
          displayValue: false,
          fontSize: 12,
          margin: 4,
        });
      } catch (error) {
        console.error('条码生成失败', error);
      }
    }
  });
}
// endregion

// region open 方法
function open(row: any) {
  barCodeDetail.value = { ...row };
  getNowDate();
  show.value = true;
  generateBarcode(row.workSheetCode);
}

defineExpose({ open });
// endregion
</script>

<template>
  <Modal
    v-model:open="show"
    title=""
    width="60%"
    :destroy-on-close="true"
    :footer="null"
    class="barcode-print-modal"
  >
    <Space style="margin-bottom: 12px">
      <Button @click="show = false">返回</Button>
      <Button type="primary" @click="handlePrint">打印</Button>
    </Space>

    <div id="printTest1">
      <div style="font-family: '宋体'; font-size: 22px; font-weight: 800; text-align: center; padding-bottom: 10px">
        SMT生产日计划
      </div>
      <span style="font-family: '宋体'; font-size: 16px">打印日期：{{ nowDate }}</span>

      <div style="text-align: center" class="JsBarcode">
        <svg id="svgcode"><div /></svg>
        <div>{{ barCodeDetail.workSheetCode }}</div>
      </div>

      <table class="print-table">
        <thead>
          <th>工单号</th>
          <th>计划时间</th>
          <th>产品编号</th>
          <th>产品名称</th>
          <th>任务线别</th>
          <th>部件编号</th>
          <th>部件名称</th>
          <th>部件计划号</th>
          <th>部件计划数量</th>
          <th>生产未排数</th>
          <th>生产未完数</th>
          <th>工单计划数</th>
          <th>工单完成数</th>
          <th>计划号</th>
          <th>生产车间</th>
          <th>备注</th>
        </thead>
        <tbody>
          <tr>
            <td>{{ barCodeDetail.workSheetCode }}</td>
            <td>{{ barCodeDetail.planDateStart }}</td>
            <td>{{ barCodeDetail.productCode }}</td>
            <td style="word-break: break-all">{{ barCodeDetail.productName }}</td>
            <td>{{ barCodeDetail.lineName }}</td>
            <td>{{ barCodeDetail.subProductCode }}</td>
            <td style="word-break: break-all">{{ barCodeDetail.subProductName }}</td>
            <td>{{ barCodeDetail.subPlanCode }}</td>
            <td>{{ barCodeDetail.subPlanNumber }}</td>
            <td>{{ barCodeDetail.produceUnarrangedNumber }}</td>
            <td>{{ barCodeDetail.produceNotFinishNumber }}</td>
            <td>{{ barCodeDetail.workSheetPlanNumber }}</td>
            <td>{{ barCodeDetail.workSheetFinishNumber }}</td>
            <td>{{ barCodeDetail.planCode }}</td>
            <td>{{ barCodeDetail.produceWorkshop }}</td>
            <td>{{ barCodeDetail.remark }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </Modal>
</template>

<style scoped>
.print-table {
  width: 99.5%;
  font-family: '宋体';
  border-collapse: collapse;
}

.print-table thead th {
  height: 40px;
  font-size: 13px;
  text-align: center;
  border: 1px solid black;
}

.print-table tbody tr {
  height: 40px;
  font-size: 13px;
  text-align: center;
  border: 1px solid black;
}

.print-table tbody td {
  font-size: 13px;
  text-align: center;
  border: 1px solid black;
}
</style>
