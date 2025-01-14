import { reactive, toRefs } from 'vue';

import { getHiprintPrintTemplate } from '../utils/template-helper.js';

/**
 * vue3 组合式函数
 * 把一些逻辑抽离出来，方便复用
 * 返回 使用方 可用的方法和数据
 */
export function useZoom(key: any) {
  // 数据
  const state = reactive({
    scaleValue: 1,
    scaleMax: 5,
    scaleMin: 0.5,
  });
  // 获取 template
  const tp = () => {
    return getHiprintPrintTemplate(key);
  };
  // 方法
  const changeScale = (big: any) => {
    let scaleValue = state.scaleValue;
    if (big) {
      scaleValue += 0.1;
      if (scaleValue > state.scaleMax) scaleValue = 5;
    } else {
      scaleValue -= 0.1;
      if (scaleValue < state.scaleMin) scaleValue = 0.5;
    }
    if (tp()) {
      // scaleValue: 放大缩小值, false: 不保存(不传也一样), 如果传 true, 打印时也会放大
      tp().zoom(scaleValue);
      state.scaleValue = scaleValue;
    }
  };
  // 暴露给使用方
  return {
    ...toRefs(state),
    changeScale,
  };
}
