import bwipjs from 'bwip-js';

export function createDmImage(code: string) {
  // 使用 bwip-js 生成 DM 码的 DataURL
  const canvas = document.createElement('canvas');
  bwipjs.toCanvas(canvas, {
    bcid: 'datamatrix', // 指定为 Data Matrix
    text: code, // 要编码的文本
    scale: 3, // 缩放
    includetext: true, // 不包含文本
  });

  // 将 canvas 绘制到打印上下文中
  const imgData = canvas.toDataURL('image/png');
  return imgData;
}
