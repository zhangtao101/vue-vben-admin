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
      ]),
      new hiprint.PrintElementTypeGroup('自定义', [
        {
          tid: 'providerModule2.mudPreparationSheet',
          title: '泥浆制备单',
          type: 'table',
          options: {
            field: 'table',
            fields: [
              { text: '新原料编号', field: 'NAME' },
              { text: '原料批号', field: 'SL' },
              { text: '原料代码', field: 'GG' },
              { text: '湿料计划加入量(KG)', field: 'TM' },
              { text: '原料含水率', field: 'DJ' },
              { text: '作业序号', field: 'JE' },
              { text: '原料库位', field: 'DETAIL' },
              { text: '实际加料量', field: 'DETAIL' },
            ],
          },
          columns: [
            [
              {
                title: '新原料编号',
                align: 'center',
                field: 'NAME',
                width: 100,
              },
              { title: '原料批号', align: 'center', field: 'SL', width: 100 },
              { title: '原料代码', align: 'center', field: 'TM', width: 100 },
              {
                title: '湿料计划加入量(KG)',
                align: 'center',
                field: 'GG',
                width: 100,
              },
              { title: '原料含水率', align: 'center', field: 'DJ', width: 100 },
              { title: '作业序号', align: 'center', field: 'JE', width: 100 },
              {
                title: '原料库位',
                align: 'center',
                field: 'DETAIL',
                width: 100,
              },
              {
                title: '实际加料量(KG)',
                align: 'center',
                field: 'DETAIL',
                width: 100,
              },
            ],
          ],
          footerFormatter: (
            _options: any,
            _rows: any,
            data: any,
            _currentPageGridRowsData: any,
          ) => {
            let li = '';
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
 */
