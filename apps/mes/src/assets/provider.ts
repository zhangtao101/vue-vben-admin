import { hiprint } from 'vue-plugin-hiprint';

export const provider = function () {
  const addElementTypes = function (context: any) {
    context.removePrintElementTypes('providerModule2');
    context.addPrintElementTypes('providerModule2', [
      new hiprint.PrintElementTypeGroup('表格/其他', [
        {
          tid: 'providerModule2.table',
          title: '订单数据',
          type: 'table',
          options: {
            field: 'table',
            fields: [
              { text: '名称', field: 'NAME' },
              { text: '数量', field: 'SL' },
              { text: '规格', field: 'GG' },
              { text: '条码', field: 'TM' },
              { text: '单价', field: 'DJ' },
              { text: '金额', field: 'JE' },
              { text: '备注', field: 'DETAIL' },
            ],
          },
          columns: [
            [
              { title: '名称', align: 'center', field: 'NAME', width: 100 },
              { title: '数量', align: 'center', field: 'SL', width: 100 },
              { title: '条码', align: 'center', field: 'TM', width: 100 },
              { title: '规格', align: 'center', field: 'GG', width: 100 },
              { title: '单价', align: 'center', field: 'DJ', width: 100 },
              { title: '金额', align: 'center', field: 'JE', width: 100 },
              { title: '备注', align: 'center', field: 'DETAIL', width: 100 },
            ],
          ],
          footerFormatter(
            _options: any,
            _rows: any,
            data: any,
            _currentPageGridRowsData: any,
          ) {
            if (data && data.totalCap) {
              return `<td style="padding:0 10px" colspan="100">${`应收金额大写: ${data.totalCap}`}</td>`;
            }
            return '<td style="padding:0 10px" colspan="100">应收金额大写: </td>';
          },
        },
        {
          tid: 'providerModule2.productionDayPlan',
          title: '生产日计划',
          type: 'table',
          options: {
            field: 'table',
            fields: [
              { text: '工单号', field: 'workSheetCode' },
              { text: '计划时间', field: 'planDateStart' },
              { text: '产品编号', field: 'productCode' },
              { text: '产品名称', field: 'productName' },
              { text: '任务线别', field: 'lineName' },
              { text: '部件编号', field: 'subProductCode' },
              { text: '部件名称', field: 'subProductName' },
              { text: '部件计划号', field: 'subPlanCode' },
              { text: '部件计划数量', field: 'subPlanNumber' },
              { text: '生产未排数', field: 'produceUnarrangedNumber' },
              { text: '生产未完数', field: 'produceNotFinishNumber' },
              { text: '工单计划数', field: 'workSheetPlanNumber' },
              { text: '工单完成数', field: 'workSheetFinishNumber' },
              { text: '计划号', field: 'planCode' },
              { text: '生产车间', field: 'produceWorkshop' },
              { text: '备注', field: 'remark' },
            ],
          },
          columns: [
            [
              {
                title: '工单号',
                field: 'workSheetCode',
                align: 'center',
                width: 100,
              },
              {
                title: '计划时间',
                field: 'planDateStart',
                align: 'center',
                width: 100,
              },
              {
                title: '产品编号',
                field: 'productCode',
                align: 'center',
                width: 100,
              },
              {
                title: '产品名称',
                field: 'productName',
                align: 'center',
                width: 100,
              },
              {
                title: '任务线别',
                field: 'lineName',
                align: 'center',
                width: 100,
              },
              {
                title: '部件编号',
                field: 'subProductCode',
                align: 'center',
                width: 100,
              },
              {
                title: '部件名称',
                field: 'subProductName',
                align: 'center',
                width: 100,
              },
              {
                title: '部件计划号',
                field: 'subPlanCode',
                align: 'center',
                width: 100,
              },
              {
                title: '部件计划数量',
                field: 'subPlanNumber',
                align: 'center',
                width: 100,
              },
              {
                title: '生产未排数',
                field: 'produceUnarrangedNumber',
                align: 'center',
                width: 100,
              },
              {
                title: '生产未完数',
                field: 'produceNotFinishNumber',
                align: 'center',
                width: 100,
              },
              {
                title: '工单计划数',
                field: 'workSheetPlanNumber',
                align: 'center',
                width: 100,
              },
              {
                title: '工单完成数',
                field: 'workSheetFinishNumber',
                align: 'center',
                width: 100,
              },
              {
                title: '计划号',
                field: 'planCode',
                align: 'center',
                width: 100,
              },
              {
                title: '生产车间',
                field: 'produceWorkshop',
                align: 'center',
                width: 100,
              },
              { title: '备注', field: 'remark', align: 'center', width: 100 },
            ],
          ],
        },
        {
          tid: 'providerModule2.customText',
          title: '文本',
          customText: '自定义文本',
          custom: true,
          type: 'text',
        },
        {
          tid: 'providerModule2.longText',
          title: '长文本',
          type: 'longText',
          options: {
            field: 'test.longText',
            width: 200,
            testData: '长文本分页/不分页测试',
          },
        },
        {
          tid: 'providerModule2.longText2',
          title: '长文本2',
          type: 'longText',
          options: {
            field: 'test.longText2',
            width: 200,
            testData: '长文本分页/不分页测试',
          },
        },
      ]),
      new hiprint.PrintElementTypeGroup('辅助', [
        {
          tid: 'providerModule2.hline',
          title: '横线',
          type: 'hline',
        },
        {
          tid: 'providerModule2.vline',
          title: '竖线',
          type: 'vline',
        },
        {
          tid: 'providerModule2.rect',
          title: '矩形',
          type: 'rect',
        },
        {
          tid: 'providerModule2.oval',
          title: '椭圆',
          type: 'oval',
        },
        {
          tid: 'providerModule2.image',
          title: '图片',
          type: 'image',
          options: {
            field: 'image',
            src: '',
          },
        },
        {
          tid: 'providerModule2.checkboxIcon',
          title: '勾选框',
          type: 'text',
          options: {
            field: 'checked',
            // 只显示图标，不显示标题文字
            hideTitle: true,
            testData: true,
            width: 16,
            height: 16,
            fontSize: 16,
            lineHeight: 16,
          },
          // 绑定值为 true 时显示已勾选图标，否则显示未勾选图标
          // hiprint 文本元素的 formatter 入参依次为：
          // (title, value, options, templateData, target)
          // 第一个参数是元素类型标题（这里是「勾选框」），第二个才是 options.field 绑定的值
          formatter: (_title: any, value: any) => {

            // 勾选框图标的 SVG 路径（取自 @iconify/json 的 mdi 图标集，内联避免打印时依赖网络）
            const CHECKBOX_ICON_PATHS = {
              // 未勾选：mdi:checkbox-blank-outline
              blank:
                'M19 3H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 2v14H5V5z',
              // 已勾选：mdi:checkbox-marked-outline
              marked:
                'M19 19H5V5h10V3H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8h-2m-11.09-.92L6.5 11.5L11 16L21 6l-1.41-1.42L11 13.17z',
            };

            /**
             * 生成勾选框图标 SVG
             * @param {boolean} checked 是否勾选
             * @returns {string} 可直接插入的 SVG 字符串
             * @since 2026-10-14 10:00:00
             */
            const buildCheckboxIcon = (checked: boolean) => {
              const path = checked
                ? CHECKBOX_ICON_PATHS.marked
                : CHECKBOX_ICON_PATHS.blank;
              return `<svg viewBox="0 0 24 24" width="100%" height="100%" style="display:block" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="${path}"/></svg>`;
            }
            const checked =
              value === true || value === 'true' || Number(value) === 1;
            return buildCheckboxIcon(checked);
          },
        },
      ]),
      new hiprint.PrintElementTypeGroup('自定义', [
        {
          tid: 'providerModule2.mudPreparationSheet',
          title: '泥浆制备单',
          type: 'table',
          options: {
            field: 'table',
            fields: [
              { text: '料号', field: 'materialCode' },
              { text: '物料名称', field: 'materialName' },
              { text: '批次号', field: 'batchCode' },
              { text: '含水率', field: 'waterNumber' },
              { text: '湿料投入量', field: 'standardNumber' },
              { text: '库位', field: 'warehouseCode' },
              { text: '储位', field: 'wrehouseAreaCode' },
              { text: '实际库位', field: 'sjWarehouseCode' },
            ],
          },
          columns: [
            [
              {
                title: '料号',
                align: 'center',
                field: 'materialCode',
                width: 100,
              },
              {
                title: '物料名称',
                field: 'materialName',
                align: 'center',
                width: 100,
              },
              {
                title: '批次号',
                field: 'batchCode',
                align: 'center',
                width: 100,
              },
              {
                title: '含水率',
                field: 'waterNumber',
                align: 'center',
                width: 100,
              },
              {
                title: '湿料投入量',
                field: 'standardNumber',
                align: 'center',
                width: 100,
              },
              {
                title: '库位',
                field: 'warehouseCode',
                align: 'center',
                width: 100,
              },
              {
                title: '储位',
                field: 'wrehouseAreaCode',
                align: 'center',
                width: 100,
              },
              {
                title: '实际库位',
                field: 'sjWarehouseCode',
                align: 'center',
                width: 100,
              },
            ],
          ],
          footerFormatter: (
            _options: any,
            _rows: any,
            _data: any,
            _currentPageGridRowsData: any,
          ) => {
            // 不需要了, 以后可能会要
            /* let li = '';
            if (data?.remark) {
              data.remark.forEach((item: any) => {
                li += `<li>${item}</li>`;
              });
            }

            return `<tr><td colspan="8" style="height: 5px;"></td></tr><tr>
                <td colspan="2">理论加水量</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>升</td>
                <td colspan="2">中控接单者签名</td>
                <td colspan="2" class="obliqueLine"></td>
            </tr>
            <tr>
                <td colspan="2">计划湿料加料总吨位</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>吨</td>
                <td colspan="2">实际加水量</td>
                <td class="text-right">升</td>
                <td class="text-center">球石高度</td>
            </tr>
            <tr>
                <td colspan="2">计划添加剂总量</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>公斤</td>
                <td colspan="2">实际添加剂总量</td>
                <td class="text-right">公斤</td>
                <td class="text-right">米</td>
            </tr>
            <tr>
                <td colspan="2">球磨时间</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>小时</td>
                <td colspan="2">复核人</td>
                <td colspan="2"></td>
            </tr>
            <tr>
                <td colspan="2">计算者</td>
                <td colspan="2"></td>
                <td colspan="2">球磨起始时间</td>
                <td colspan="2"></td>
            </tr>
            <tr>
                <td colspan="2">审核者</td>
                <td colspan="2"></td>
                <td colspan="3">关键原料加料品保确认人</td>
                <td ></td>
            </tr>
            <tr><td colspan="8" style="height: 5px;"></td></tr>
            <tr>
                <td colspan="2" rowspan="2">泥浆工艺标准</td>
                <td>配方</td>
                <td>生产品种</td>
                <td>流速</td>
                <td>比重</td>
                <td>筛余</td>
                <td>备注</td>
            </tr>
            <tr>
                <td>${data?.test1.value ?? ''}</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>${data?.test1.value ?? ''}</td>
            </tr>
            <tr>
                <td colspan="8">备注: ${data?.test1.value ?? ''}</td>
            </tr>
            <tr>
                <td colspan="1">备注</td>
                <td colspan="7">
                   <ol>
                     ${li}
                   </ol>
                </td>
            </tr>`;*/
          },
        },
        {
          tid: 'providerModule2.materialRequisition',
          title: '领料单',
          type: 'table',
          options: {
            field: 'materialRequisition',
            fields: [
              { text: '材料编码', field: 'materialCode' },
              { text: '材料名称', field: 'materialName' },
              { text: '批次', field: 'lot' },
              { text: '规格', field: '' },
              { text: '单位', field: 'unit' },
              { text: '领用量', field: 'receiveNumber' },
              { text: '储位', field: 'storageLocation' },
            ],
          },
          columns: [
            [
              {
                title: '材料编码',
                align: 'center',
                field: 'materialCode',
                width: 100,
              },
              {
                title: '材料名称',
                field: 'materialName',
                align: 'center',
                width: 100,
              },
              {
                title: '批次',
                field: 'lot',
                align: 'center',
                width: 100,
              },
              {
                title: '规格',
                field: '',
                align: 'center',
                width: 100,
              },
              {
                title: '单位',
                field: 'unit',
                align: 'center',
                width: 100,
              },
              {
                title: '领用量',
                field: 'receiveNumber',
                align: 'center',
                width: 100,
              },
              {
                title: '储位',
                field: 'storageLocation',
                align: 'center',
                width: 100,
              },
            ],
          ],
          footerFormatter: (
            _options: any,
            _rows: any,
            _data: any,
            _currentPageGridRowsData: any,
          ) => {
            // 不需要了, 以后可能会要
            /* let li = '';
            if (data?.remark) {
              data.remark.forEach((item: any) => {
                li += `<li>${item}</li>`;
              });
            }

            return `<tr><td colspan="8" style="height: 5px;"></td></tr><tr>
                <td colspan="2">理论加水量</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>升</td>
                <td colspan="2">中控接单者签名</td>
                <td colspan="2" class="obliqueLine"></td>
            </tr>
            <tr>
                <td colspan="2">计划湿料加料总吨位</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>吨</td>
                <td colspan="2">实际加水量</td>
                <td class="text-right">升</td>
                <td class="text-center">球石高度</td>
            </tr>
            <tr>
                <td colspan="2">计划添加剂总量</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>公斤</td>
                <td colspan="2">实际添加剂总量</td>
                <td class="text-right">公斤</td>
                <td class="text-right">米</td>
            </tr>
            <tr>
                <td colspan="2">球磨时间</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>小时</td>
                <td colspan="2">复核人</td>
                <td colspan="2"></td>
            </tr>
            <tr>
                <td colspan="2">计算者</td>
                <td colspan="2"></td>
                <td colspan="2">球磨起始时间</td>
                <td colspan="2"></td>
            </tr>
            <tr>
                <td colspan="2">审核者</td>
                <td colspan="2"></td>
                <td colspan="3">关键原料加料品保确认人</td>
                <td ></td>
            </tr>
            <tr><td colspan="8" style="height: 5px;"></td></tr>
            <tr>
                <td colspan="2" rowspan="2">泥浆工艺标准</td>
                <td>配方</td>
                <td>生产品种</td>
                <td>流速</td>
                <td>比重</td>
                <td>筛余</td>
                <td>备注</td>
            </tr>
            <tr>
                <td>${data?.test1.value ?? ''}</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>${data?.test1.value ?? ''}</td>
            </tr>
            <tr>
                <td colspan="8">备注: ${data?.test1.value ?? ''}</td>
            </tr>
            <tr>
                <td colspan="1">备注</td>
                <td colspan="7">
                   <ol>
                     ${li}
                   </ol>
                </td>
            </tr>`;*/
            return `<tr><td colspan="8" style="height: 5px;"></td></tr><tr>
                <td colspan="99" style="padding: 1em;">
                    <div style="margin-bottom: 1em;">备注:</div>
                    <div style="padding-left: 1em;float: right;">
                        <span>附加料原始记录表： </span>
                        <span>NO:</span>
                        <span style="border-bottom: 1px solid black;display: inline-block;width: 80px;"></span>
                        <span>NO:</span>
                        <span style="border-bottom: 1px solid black;display: inline-block;width: 80px;"></span>
                        <span>NO:</span>
                        <span style="border-bottom: 1px solid black;display: inline-block;width: 80px;"></span>
                        <span>NO:</span>
                        <span style="border-bottom: 1px solid black;display: inline-block;width: 80px;"></span>
                        <span>共</span>
                        <span style="border-bottom: 1px solid black;display: inline-block;width: 80px;"></span>
                        <span>张</span>
                    </div>
                </td>
            </tr>`;
          },
        },
        {
          tid: 'providerModule2.iqcItemResult',
          title: '检验项目明细',
          type: 'table',
          options: {
            field: 'itemResults',
            fields: [
              { text: '检验项目', field: 'itemCodeName' },
              { text: '检验结果', field: 'checkResult' },
              { text: '合格', field: 'judgeResult' },
              { text: 'N/A', field: 'na' },
              { text: '致命', field: 'status1' },
              { text: '严重', field: 'status2' },
              { text: '轻微', field: 'status3' },
            ],
          },
          columns: [
            [
              {
                title: '检验项目',
                align: 'center',
                field: 'itemCodeName',
                width: 140,
              },
              {
                title: '检验结果',
                align: 'center',
                field: 'checkResult',
                width: 140,
              },
              {
                title: '合格',
                align: 'center',
                field: 'judgeResult',
                width: 60,
                // 检验判定为 1（合格）时显示勾选图标，其余留空
                // 列级 formatter 会被 hiprint 序列化成字符串再 eval 执行，
                // 闭包会丢失，函数体内不能引用任何外部变量，必须自包含
                renderFormatter: (value: any) => {
                  if (Number(value) !== 1) {
                    return '';
                  }
                  return '<svg viewBox="0 0 24 24" width="16" height="16" style="display:block;margin:auto" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>';
                },
              },
              {
                title: 'N/A',
                align: 'center',
                field: 'na',
                width: 60,
              },
              {
                title: '致命',
                align: 'center',
                field: 'status1',
                width: 60,
                // 受损程度 flawResult 为 1（致命）时显示勾选图标，其余留空
                // 列级 formatter 会被 hiprint 序列化成字符串再 eval 执行，
                // 闭包会丢失，函数体内不能引用任何外部变量，必须自包含
                renderFormatter: (_value: any, row: any) => {
                  if (Number(row && row.flawResult) !== 1) {
                    return '';
                  }
                  return '<svg viewBox="0 0 24 24" width="16" height="16" style="display:block;margin:auto" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>';
                },
              },
              {
                title: '严重',
                align: 'center',
                field: 'status2',
                width: 60,
                // 受损程度 flawResult 为 2（严重）时显示勾选图标
                renderFormatter: (_value: any, row: any) => {
                  if (Number(row && row.flawResult) !== 2) {
                    return '';
                  }
                  return '<svg viewBox="0 0 24 24" width="16" height="16" style="display:block;margin:auto" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>';
                },
              },
              {
                title: '轻微',
                align: 'center',
                field: 'status3',
                width: 60,
                // 受损程度 flawResult 为 3（轻微）时显示勾选图标
                renderFormatter: (_value: any, row: any) => {
                  if (Number(row && row.flawResult) !== 3) {
                    return '';
                  }
                  return '<svg viewBox="0 0 24 24" width="16" height="16" style="display:block;margin:auto" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>';
                },
              },
            ],
          ],
        },
        {
          tid: 'providerModule2.semiFinishedProduct',
          title: '领料单(半成品)',
          type: 'table',
          options: {
            field: 'semiFinishedProduct',
          },
          columns: [
            [
              {
                title: '产品编码',
                align: 'center',
                colspan: 3,
              },
              {
                title: '批号',
                align: 'center',
                colspan: 6,
              },
              {
                title: '箱数',
                align: 'center',
                rowspan: 2,
              },
              {
                title: '片数',
                align: 'center',
                field: 'receiveNumber',
                rowspan: 2,
                width: 150,
              },
              {
                title: '平方数',
                align: 'center',
                rowspan: 2,
                width: 150,
              },
              {
                title: '库位',
                align: 'center',
                rowspan: 2,
                width: 150,
              },
              {
                title: '备注',
                align: 'center',
                rowspan: 2,
                width: 150,
              },
            ],
            [
              {
                title: '产品编码',
                align: 'center',
                field: 'materialCode',
                width: 150,
              },
              {
                title: '等级',
                align: 'center',
                field: 'lv',
                width: 150,
              },
              {
                title: '尺寸',
                align: 'center',
                field: '',
                width: 150,
              },
              {
                title: '批色号',
                align: 'center',
                field: '',
                width: 150,
              },
              {
                title: '窑号',
                align: 'center',
                field: '',
                width: 150,
              },
              {
                title: '降等原因',
                align: 'center',
                field: '',
                width: 150,
              },
              {
                title: '产地',
                field: '',
                align: 'center',
                width: 150,
              },
              {
                title: '年月',
                align: 'center',
                field: '',
                width: 150,
              },
              {
                title: '客定',
                align: 'center',
                field: '',
                width: 150,
              },
            ],
          ],
          footerFormatter: (
            _options: any,
            _rows: any,
            _data: any,
            _currentPageGridRowsData: any,
          ) => {
            // 不需要了, 以后可能会要
            /* let li = '';
            if (data?.remark) {
              data.remark.forEach((item: any) => {
                li += `<li>${item}</li>`;
              });
            }

            return `<tr><td colspan="8" style="height: 5px;"></td></tr><tr>
                <td colspan="2">理论加水量</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>升</td>
                <td colspan="2">中控接单者签名</td>
                <td colspan="2" class="obliqueLine"></td>
            </tr>
            <tr>
                <td colspan="2">计划湿料加料总吨位</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>吨</td>
                <td colspan="2">实际加水量</td>
                <td class="text-right">升</td>
                <td class="text-center">球石高度</td>
            </tr>
            <tr>
                <td colspan="2">计划添加剂总量</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>公斤</td>
                <td colspan="2">实际添加剂总量</td>
                <td class="text-right">公斤</td>
                <td class="text-right">米</td>
            </tr>
            <tr>
                <td colspan="2">球磨时间</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>小时</td>
                <td colspan="2">复核人</td>
                <td colspan="2"></td>
            </tr>
            <tr>
                <td colspan="2">计算者</td>
                <td colspan="2"></td>
                <td colspan="2">球磨起始时间</td>
                <td colspan="2"></td>
            </tr>
            <tr>
                <td colspan="2">审核者</td>
                <td colspan="2"></td>
                <td colspan="3">关键原料加料品保确认人</td>
                <td ></td>
            </tr>
            <tr><td colspan="8" style="height: 5px;"></td></tr>
            <tr>
                <td colspan="2" rowspan="2">泥浆工艺标准</td>
                <td>配方</td>
                <td>生产品种</td>
                <td>流速</td>
                <td>比重</td>
                <td>筛余</td>
                <td>备注</td>
            </tr>
            <tr>
                <td>${data?.test1.value ?? ''}</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>${data?.test1.value ?? ''}</td>
                <td>${data?.test1.value ?? ''}</td>
            </tr>
            <tr>
                <td colspan="8">备注: ${data?.test1.value ?? ''}</td>
            </tr>
            <tr>
                <td colspan="1">备注</td>
                <td colspan="7">
                   <ol>
                     ${li}
                   </ol>
                </td>
            </tr>`;*/
          },
        },
        {
          tid: 'providerModule2.materialReceiveList',
          title: '领料明细',
          type: 'table',
          options: {
            field: 'materialRequisition',
            // 表尾只在最后一页出现（分页时不会每页重复）
            tableFooterRepeat: 'last',
            fields: [
              { text: '材料货号', field: 'materialCode' },
              { text: '材料名称', field: 'materialName' },
              { text: '单位', field: 'unit' },
              { text: '实领数量', field: 'receiveNumber' },
              { text: '申领数量', field: 'applyNumber' },
              { text: '欠料数量', field: 'unclaimedQuantity' },
              { text: '库存数量', field: 'storeNumber' },
              { text: '待检数量', field: 'sumPackage' },
              { text: '待入数量', field: 'sumEnter' },
              { text: '待退数量', field: 'sumReject' },
              { text: '备注说明', field: 'remark' },
            ],
          },
          columns: [
            [
              {
                title: '材料货号',
                field: 'materialCode',
                align: 'center',
                width: 100,
              },
              {
                title: '材料名称',
                field: 'materialName',
                align: 'center',
                width: 140,
              },
              {
                title: '单位',
                field: 'unit',
                align: 'center',
                width: 40,
              },
              {
                title: '实领数量',
                field: 'receiveNumber',
                align: 'center',
                width: 40,
              },
              {
                title: '申领数量',
                field: 'applyNumber',
                align: 'center',
                width: 40,
              },
              {
                title: '欠料数量',
                field: 'unclaimedQuantity',
                align: 'center',
                width: 40,
              },
              {
                title: '库存数量',
                field: 'storeNumber',
                align: 'center',
                width: 40,
              },
              {
                title: '待检数量',
                field: 'sumPackage',
                align: 'center',
                width: 40,
              },
              {
                title: '待入数量',
                field: 'sumEnter',
                align: 'center',
                width: 40,
              },
              {
                title: '待退数量',
                field: 'sumReject',
                align: 'center',
                width: 40,
              },
              {
                title: '备注说明',
                field: 'remark',
                align: 'center',
                width: 60,
              },
            ],
          ],
          footerFormatter: (
            options: any,
            rows: any,
            data: any,
            currentPageGridRowsData: any,
          ) => {
            // 合计按全部行计算（分页时 currentPageGridRowsData 只有当前页的行）
            const list: any[] = Array.isArray(rows)
              ? rows
              : Array.isArray(data?.[options?.field])
                ? data[options.field]
                : Array.isArray(currentPageGridRowsData)
                  ? currentPageGridRowsData
                  : [];
            const sum = (field: string) =>
              list.reduce(
                (total, item) => total + (Number(item?.[field]) || 0),
                0,
              );
            const totalCell = (field: string) => {
              const value = Math.round(sum(field) * 10000) / 10000;
              if (field == 'receiveNumber' && value === 0) {
                return `<td style="padding:0 10px;text-align: center;"> </td>`;
              }
              return `<td style="padding:0 10px;text-align: center;">${value}</td>`;
            };

                // ${totalCell('receiveNumber')}
                // <td style="padding:0 10px;text-align: center;"> </td>
            return `<tr>
                <td style="padding:0 10px;text-align: center;" colspan="3">合计</td>
                ${totalCell('receiveNumber')}
                ${totalCell('applyNumber')}
                ${totalCell('unclaimedQuantity')}
                ${totalCell('storeNumber')}
                ${totalCell('sumPackage')}
                ${totalCell('sumEnter')}
                ${totalCell('sumReject')}
                <td style="padding:0 10px"></td>
            </tr>`;
          },
        },
        {
          tid: 'providerModule2.productList',
          title: '产品列表',
          type: 'table',
          options: {
            field: 'erpList',
            // 表尾只在最后一页出现（分页时不会每页重复）
            tableFooterRepeat: 'last',
            fields: [
              { text: '产品名称', field: 'productName' },
              { text: '计划号', field: 'planCode' },
              { text: '计划数量', field: 'planNumber' },
              { text: '领用套数', field: 'receiveNumber' },
            ],
          },
          columns: [
            [
              {
                title: '产品名称',
                field: 'productName',
                align: 'center',
                width: 180,
                tableSummaryAlign: 'center',
              },
              {
                title: '计划号',
                field: 'planCode',
                align: 'center',
                width: 140,
                tableSummaryAlign: 'center',
              },
              {
                title: '计划数量',
                field: 'planNumber',
                align: 'center',
                width: 100,
                tableSummaryAlign: 'center',
              },
              {
                title: '领用套数',
                field: 'receiveNumber',
                align: 'center',
                width: 100,
                tableSummaryAlign: 'center',
              },
            ],
          ],
          footerFormatter: (
            options: any,
            rows: any,
            data: any,
            currentPageGridRowsData: any,
          ) => {
            // 合计按全部行计算（分页时 currentPageGridRowsData 只有当前页的行）
            const list: any[] = Array.isArray(rows)
              ? rows
              : Array.isArray(data?.[options?.field])
                ? data[options.field]
                : Array.isArray(currentPageGridRowsData)
                  ? currentPageGridRowsData
                  : [];
            const sum = (field: string) =>
              list.reduce(
                (total, item) => total + (Number(item?.[field]) || 0),
                0,
              );
            const totalCell = (field: string) => {
              const value = Math.round(sum(field) * 10000) / 10000;
              return `<td style="padding:0 10px;text-align: center;">${value}</td>`;
            };
            return `<tr>
                <td style="padding:0 10px;text-align: center;">合计</td>
                <td style="padding:0 10px;text-align: center;"></td>
                ${totalCell('planNumber')}
                ${totalCell('receiveNumber')}
            </tr>`;
          },
        },
        {
          tid: 'providerModule1.barcode',
          title: '条形码',
          data: 'XS888888888',
          type: 'text',
          options: {
            field: 'barcode',
            testData: 'XS888888888',
            height: 32,
            fontSize: 12,
            lineHeight: 18,
            textAlign: 'right',
            textType: 'barcode',
          },
        },
        {
          tid: 'providerModule2.batchBarcodeTable',
          title: '批量条形码(表格)',
          type: 'table',
          options: {
            field: 'barcodeList', // 绑定您的数组字段
            tableStyle: 'border-collapse: collapse; border: none;', // 无边框
            tableBodyStyle: 'border: none;',
          },
          columns: [
            [
              {
                width: 140, // 每列宽度（px）
                height: 60, // 行高（px）
                field: 'barcode1',
                checked: true,
                columnId: 'barcode1',
                fixed: false,
                rowspan: 1,
                colspan: 1,
                align: 'center',
                tableTextType: 'barcode',
                tableQRCodeLevel: 0,
                tableSummaryTitle: true,
                tableSummary: '',
                showCodeTitle: true,
              },
              {
                width: 140, // 每列宽度（px）
                height: 60, // 行高（px）
                field: 'barcode2',
                checked: true,
                columnId: 'barcode2',
                fixed: false,
                rowspan: 1,
                colspan: 1,
                align: 'center',
                tableTextType: 'barcode',
                tableQRCodeLevel: 0,
                tableSummaryTitle: true,
                tableSummary: '',
                showCodeTitle: true,
              },
            ],
          ],
          tableBodyCellBorder: 'noBorder',
          tableBodyRowBorder: 'noBorder',
          tableBodyStyle: 'border: none;',
          tableBorder: 'noBorder',
          tableFooterBorder: 'noBorder',
          tableFooterCellBorder: 'noBorder',
          tableFooterRepeat: 'no',
          tableHeaderBorder: 'noBorder',
          tableHeaderRepeat: 'none',
          tableStyle: 'border-collapse: collapse; border: none;',
        },
        {
          tid: 'providerModule1.qrcode',
          title: '二维码',
          data: 'XS888888888',
          type: 'text',
          options: {
            field: 'qrcode',
            testData: 'XS888888888',
            height: 32,
            fontSize: 12,
            lineHeight: 18,
            textType: 'qrcode',
          },
        },
        {
          tid: 'providerModule1.dmCode',
          title: 'DM码',
          type: 'image',
          options: {
            field: 'dmCode',
          },
        },
      ]),
    ]);
  };
  return {
    addElementTypes,
  };
};

/**
 * 文本：defaultModule.text
 * 图片：defaultModule.image
 * 长文：defaultModule.longText
 * 表格：defaultModule.table
 * 空白表格：defaultModule.emptyTable
 * 自定义文本：defaultModule.customText
 * 横线：defaultModule.hline
 * 竖线：defaultModule.vline
 * 矩形：defaultModule.rect
 * 椭圆：defaultModule.oval
 * 条形码：defaultModule.barcode
 *  二维码：defaultModule.qrcode
 * 图片：providerModule2.image
 * 勾选框：providerModule2.checkboxIcon（绑定值为 true 显示勾选图标，否则显示未勾选图标）
 */
