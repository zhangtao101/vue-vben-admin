/**
 * 预处理模板：将批量条码元素展开为多个独立元素
 * @param originalTemplate 原始模板
 * @param printData 打印数据
 * @returns 可直接使用的模板对象
 */
export function prepareBatchPrintTemplate(
  originalTemplate: string,
  printData: any,
) {
  const template = JSON.parse(originalTemplate);
  const elements = template.panels?.[0]?.printElements || [];

  // 查找批量条码元素
  const batchIndex = elements.findIndex(
    (el: any) =>
      el.printElementType.title === '批量条形码' &&
      printData[el.options?.field],
  );

  if (batchIndex === -1) return template; // 无需处理

  const batchEl = elements[batchIndex];
  const field = batchEl.options.field;
  const codes = printData[field];

  if (!Array.isArray(codes)) return template;

  // 移除原批量元素
  elements.splice(batchIndex, 1);

  // 动态生成独立条码元素
  const {
    options: { left, top, batchSpacing, batchItemWidth },
  } = batchEl;
  const spacing = batchSpacing || 15;
  const itemWidth = batchItemWidth || 120;

  codes.forEach((_code: any, i) => {
    elements.push({
      tid: 'defaultModule.barcode', // 使用标准条码类型
      type: 'text',
      options: {
        textType: 'barcode',
        width: itemWidth,
        height: 40,
        fontSize: 12,
        textAlign: 'center',
        showText: true,
        left: left + i * (itemWidth + spacing),
        top,
        testData: 'XS888888888',
      },
      printElementWidth: itemWidth,
      printElementHeight: 40,
      data: 'XS888888888',
    });
  });

  return template;
}
