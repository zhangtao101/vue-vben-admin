// composables/useTopoComponents.js
import { shallowRef } from 'vue';

export function useTopoComponents() {
  const components = shallowRef({
    // 基础控件
    'view-text': () => import('./control/ViewText.vue'),
    'view-3d-model': () => import('./control/View3DModel.vue'),
    'view-image': () => import('./control/ViewImage.vue'),
    'view-image-switch': () => import('./control/ViewImageSwitch.vue'),
    // Canvas 图形控件
    'view-circular': () => import('./control/canvas/ViewCircular.vue'),
    'view-line': () => import('./control/canvas/ViewLine.vue'),
    'view-line-arrow': () => import('./control/canvas/ViewLineArrow.vue'),
    'view-line-wave': () => import('./control/canvas/ViewLineWave.vue'),
    'view-bizier-curve-arrow': () =>
      import('./control/canvas/ViewBizierCurveArrow.vue'),
    'view-rect': () => import('./control/canvas/ViewRect.vue'),
    'view-triangle': () => import('./control/canvas/ViewTriangle.vue'),
    //
    // 图表控件
    'view-chart': () => import('./control/chart/ViewChart.vue'),
    'view-chart-pie': () => import('./control/chart/ViewChartPie.vue'),
    'view-chart-gauge': () => import('./control/chart/ViewChartGauge.vue'),
    'view-chart-water': () => import('./control/chart/ViewChartWater.vue'),
    'view-chart-temp': () => import('./control/chart/ViewChartTemp.vue'),
    'view-chart-map': () => import('./control/chart/ViewChartMap.vue'),
    'view-chart-wrapper': () => import('./control/chart/ViewChartWrapper.vue'),
    //
    // // SVG 控件
    'view-svg-image': () => import('./control/svg/ViewSvgImage.vue'),
    'view-svg-static': () => import('./control/svg/ViewSvgStatic.vue'),
    //
    // // 多媒体控件
    'view-video': () => import('./control/ViewVideo.vue'),
    'view-video-play': () => import('./control/ViewVideoPlay.vue'),
    'view-video-mp4': () => import('./control/ViewVideoMp4.vue'),
    //
    // // 功能控件
    'view-timer': () => import('./control/ViewTimer.vue'),
    'view-map': () => import('./control/ViewMap.vue'),
    'view-weather': () => import('./control/ViewWeather.vue'),
    'view-warn': () => import('./control/ViewWarn.vue'),
    'view-real-data': () => import('./control/ViewRealData.vue'),
    'view-history': () => import('./control/ViewHistory.vue'),
    'view-flow-bar': () => import('./control/ViewFlowBar.vue'),
    'view-flow-bar-dynamic': () => import('./control/ViewFlowBarDynamic.vue'),
    'view-knob-switch': () => import('./control/ViewKnobSwitch.vue'),
    'view-text-static': () => import('./control/ViewTextStatic.vue'),
    'view-panel': () => import('./control/ViewPanel.vue'),
    'view-order': () => import('./control/ViewOrder.vue'),
    'view-luck-draw': () => import('./control/ViewLuckDraw.vue'),
    // 'view-vr': () => import('./control/ViewVR.vue'),
    'view-component': () => import('./control/ViewComponent.vue'),
    //
    // // Three.js 相关
    // 'view-three-js': () => import('./control/three/ViewThreeJs.vue'),
    // 'view-relief-ball': () => import('./control/three/ViewReliefBall.vue'),
  });

  return { components };
}
