<script lang="ts" setup>
import {
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
} from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useFullscreen } from '@vueuse/core';
import { message, Spin } from 'ant-design-vue';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';

import { useTopoStore } from '#/store';
import mqttTool from '#/util/mqttUtils';
import topoUtil from '#/util/topo/topo_utils';
import { useTopoComponents } from '#/util/topo/useTopoComponents';

const { query } = useRoute();

// region 查询数据
// 具体数据
const details = ref<any>({});
// 加载状态
const isLoading = ref(false);
const bindDevices = ref<any>([]);
/**
 * 查询数据
 */
function queryData() {
  const { scadaData, pageName, bindDeviceList }: any = {
    createBy: '1',
    createTime: '2025-10-20 17:04:37',
    updateBy: null,
    updateTime: '2025-11-25 10:27:40',
    remark: null,
    id: 1,
    guid: 'a657f7e4-0891-4b27-9313-27a29e9103e5',
    scadaData:
      '{"name":"--","layer":{"backColor":"","backgroundImage":"","widthHeightRatio":"","width":1920,"height":1080,"dragZoom":true},"components":[{"type":"flow-bar-dynamic","componentShow":["参数绑定","组件颜色","水流"],"action":[],"dataBind":{"serialNumber":"","identifier":"","modelValue":""},"dataAction":{"direction":"","paramJudge":"","paramJudgeData":"","direction01":"","paramJudge01":"","paramJudgeData01":""},"style":{"position":{"x":25,"y":86,"w":501,"h":208},"backColor":"rgba(0, 206, 209, 1)","zIndex":1,"transform":0,"transformType":"rotate(0deg)","foreColor":"rgba(47, 27, 27, 1)","lineHeight":10,"direction":"水平","animations":"反向","speed":"慢","lineWidth":15,"lineInterval":20,"lineType":"矩形","anchorPointNum":9,"spotPoints":[{"x":20,"y":20},{"x":50,"y":80,"startX":540,"startY":200,"temp":{"x":70,"y":20}},{"x":174,"y":130,"startX":679,"startY":239,"temp":{"x":120,"y":20}},{"x":170,"y":20},{"x":217,"y":102,"startX":794,"startY":317,"temp":{"x":220,"y":20}},{"x":310,"y":138,"startX":828,"startY":248,"temp":{"x":270,"y":20}},{"x":267,"y":49,"startX":798,"startY":240,"temp":{"x":320,"y":20}},{"x":366,"y":125,"startX":848,"startY":240,"temp":{"x":370,"y":20}},{"x":420,"y":20}],"visible":true,"borderWidth":0,"borderStyle":"solid","borderColor":"#ccccccff","temp":{"position":{"x":25,"y":86}}},"identifier":"4e836d4c-2852-1429-248c-63140b8a3325","name":"flow-bar-dynamic0"},{"type":"image","componentShow":["动画","单击","组件颜色","滤镜渲染","组件填充","参数绑定"],"action":[],"hdClassName":"","dataBind":{"action":"","productId":112,"serialNumber":"D4AD203F3A1C","identifier":"0","modelName":"漏水值","modelValue":"","redirectUrl":"","stateList":[],"unit":"度","type":1},"dataAction":{"serialNumber":"","identifier":"","modelName":"","paramJudge":"","paramJudgeData":"","rotationSpeed":"中","translateList":[]},"style":{"position":{"x":443,"y":83,"w":71,"h":58},"backColor":"rgba(255, 255, 255, 0)","foreColor":"","zIndex":1,"transform":0,"url":"/prod-api/profile/avatar/anniu (81).svg","transformType":"rotate(0deg)","isFilter":true,"visible":true,"borderWidth":0,"borderStyle":"solid","borderColor":"#ccccccff","temp":{"position":{"x":443,"y":84}}},"identifier":"4090d43e-a3d7-d710-732a-501dfa17fc27","name":"image1"},{"type":"text","componentShow":["参数绑定","单击","组件颜色","动画"],"action":[],"dataBind":{"djAction":false,"action":"","productId":"","serialNumber":"","identifier":"","modelName":"","modelValue":"","unit":"","redirectUrl":""},"dataAction":{"xyAction":false,"xzAction":false,"ssAction":false,"hdAction":false,"serialNumber":"","identifier":"","modelName":"","paramJudge":"","paramJudgeData":"","rotationSpeed":"中","translateList":[]},"style":{"position":{"x":218,"y":275,"w":60,"h":25},"backColor":"#fff","foreColor":"#000","zIndex":1,"transform":0,"transformType":"rotate(0deg)","textAlign":"center","fontSize":14,"fontFamily":"Arial","text":"0","visible":true,"borderWidth":0,"borderStyle":"solid","borderColor":"#ccccccff","temp":{"position":{"x":224,"y":278}}},"identifier":"cc144ee8-0f6e-9804-61b2-5279005f8fb8","name":"text2"},{"type":"image","componentShow":["动画","单击","组件颜色","滤镜渲染","组件填充","参数绑定"],"action":[],"hdClassName":"","dataBind":{"action":"","productId":"","serialNumber":"","identifier":"","modelName":"","modelValue":"","redirectUrl":"","stateList":[]},"dataAction":{"serialNumber":"","identifier":"","modelName":"","paramJudge":"","paramJudgeData":"","rotationSpeed":"中","translateList":[]},"style":{"position":{"x":107,"y":498,"w":169,"h":221},"backColor":"rgba(255, 255, 255, 0)","foreColor":"","zIndex":0,"transform":0,"url":"/prod-api/profile/avatar/chuxuguan (187).svg","transformType":"rotate(0deg)","isFilter":true,"visible":true,"borderWidth":0,"borderStyle":"solid","borderColor":"#ccccccff","temp":{"position":{"x":139,"y":166}}},"identifier":"92ac783f-96cd-6892-1987-dfae71fb5172","name":"image3"},{"type":"text","componentShow":["单击","组件颜色","动画"],"action":[],"dataBind":{"djAction":false,"action":"","productId":"","serialNumber":"","identifier":"","modelName":"","modelValue":"","redirectUrl":""},"dataAction":{"xyAction":false,"xzAction":false,"ssAction":false,"hdAction":false,"serialNumber":"","identifier":"","modelName":"","paramJudge":"","paramJudgeData":"","rotationSpeed":"中","translateList":[]},"style":{"position":{"x":156,"y":279,"w":51,"h":21},"backColor":"#ff000000","foreColor":"#000","zIndex":1,"transform":0,"transformType":"rotate(0deg)","waterBorderWidth":1,"waterBorderColor":"rgba(255, 255, 255, 0)","text":"Test","textAlign":"center","fontSize":14,"fontFamily":"Arial","visible":true,"borderWidth":0,"borderStyle":"solid","borderColor":"#ccccccff","temp":{"position":{"x":156,"y":279}}},"identifier":"9cff4366-cbf2-2ca4-e8af-8bf14ddf1b5e","name":"text4"},{"type":"chart-wrapper","componentShow":["自定义echarts"],"action":[],"dataBind":{"echartOption":"echartId-1","echartRun":1764037121441,"echartSecond":60,"echartData":""},"style":{"position":{"x":119,"y":763,"w":350,"h":250},"backColor":"rgba(255, 255, 255, 1)","foreColor":"#000","zIndex":1,"transform":0,"transformType":"rotate(0deg)","visible":true,"borderWidth":0,"borderStyle":"solid","borderColor":"#ccccccff","temp":{"position":{"x":119,"y":763}}},"identifier":"778eac69-70ca-587b-7054-76948a5a549a","name":"chart-wrapper7"},{"type":"order","componentShow":["轮播表"],"action":[],"dataBind":{},"style":{"position":{"x":950,"y":43,"w":568,"h":300},"zIndex":2,"transform":0,"transformType":"rotate(0deg)","rowNum":5,"header":["告警时间","告警名称","设备名称","告警级别","处理内容"],"foreColor":"#fff","headerBGC":"#00BAFF","oddRowBGC":"#003B51","evenRowBGC":"#0A2732","waitTime":2000,"headerHeight":35,"columnWidth":"60,160,110,110,100,160","align":["center"],"index":true,"carousel":"single","indexHeader":"序号","visible":true,"borderWidth":0,"borderStyle":"solid","borderColor":"#ccccccff","data":[],"temp":{"position":{"x":821,"y":70}},"opacity":0.8,"borderRadius":50,"boxShadowWidth":10,"boxShadowColor":"rgba(255, 0, 0, 1)"},"identifier":"d36afa79-3c7b-5cef-69f7-7ee068efd495","name":"order8"},{"type":"map","componentShow":[],"action":[],"dataBind":{},"style":{"position":{"x":514,"y":736,"w":1200,"h":600},"zIndex":1,"mapModel":"normal","transform":0,"transformType":"rotate(0deg)","visible":true,"borderWidth":0,"borderStyle":"solid","borderColor":"#ccccccff","temp":{"position":{"x":909,"y":796}}},"identifier":"b7d536ea-1197-a1c2-a4bb-ef1bbaf5c6f9","name":"map11"},{"type":"weather","componentShow":["天气","组件颜色"],"action":[],"dataBind":{"provinceCode":"","cityCode":"","districtCode":""},"weatherDetail":{"errcode":100,"errmsg":"v61接口测试次数已用完"},"style":{"position":{"x":418,"y":423,"w":461,"h":166},"backColor":"#fff","foreColor":"#000","fontFamily":"Arial","waterBorderWidth":1,"waterBorderColor":"rgba(255, 255, 255, 0)","borderRadius":10,"weatherModel":"完整模式","zIndex":1,"transform":0,"transformType":"rotate(0deg)","visible":true,"borderWidth":0,"borderStyle":"solid","borderColor":"#ccccccff","temp":{"position":{"x":470,"y":422}}},"identifier":"29cb0256-87c7-cfe4-f185-e99a57b876b8","name":"weather8"},{"type":"timer","componentShow":["组件颜色"],"action":[],"dataBind":{"sn":"","title":"","biz":""},"style":{"position":{"x":446,"y":305,"w":459,"h":70},"backColor":"rgba(255, 255, 255, 0)","foreColor":"#00CED1","zIndex":1,"transform":0,"transformType":"rotate(0deg)","textAlign":"center","fontSize":30,"fontFamily":"Arial","visible":true,"borderWidth":0,"borderStyle":"solid","borderColor":"#ccccccff","temp":{"position":{"x":455,"y":231}}},"identifier":"7304df47-e214-4404-a0bd-8708a37bb871","name":"timer9"}],"zIndexBottom":0}',
    serialNumbers: null,
    deviceName: null,
    isMainPage: null,
    pageName: '19999999999',
    pageResolution: '1920x1080',
    isShare: null,
    shareUrl: null,
    sharePass: null,
    pageImage:
      '/profile/upload/2025/11/25/file_1764037659492_20251125102739A008.png',
    tenantId: 1,
    tenantName: 'admin',
    delFlag: 0,
    base64: null,
    bindDeviceList: [
      {
        serialNumber: 'D4AD203F3A1C',
        deviceName: 'MODBUS网关设备',
        productId: 112,
      },
    ],
  };
  details.value = JSON.parse(scadaData);
  // 设置页面标题
  document.title = pageName;
  bindDevices.value = bindDeviceList;
  setTimeout(() => {
    mqttSubscribe(bindDeviceList);
  }, 500);

  if (window.screen.width < 1366) {
    pageZooming();
  } else {
    // 桌面端缩放处理
    // 从会话存储中恢复缩放值
    if (sessionStorage.getItem(`saveSf-${query.guid}`) !== 'undefined') {
      const zoom = loadSf();
      if (zoom < 30) {
        zoomValue.value = 100;
      } else if (zoom) {
        zoomValue.value = zoom;
      }
    }
    setTimeout(() => {
      initLeftTop();
    }, 500);
  }
}

// endregion

// region 页面缩放(小屏幕/ 手机)
// 小屏幕用
const newZoom = ref(0.2);
const displacement = ref<any>({
  scale: 1, // 位移缩放比例
});
// 组态定时器
const ztTimer = ref<any>(null);

function pageZooming() {
  zoomValue.value = 100;
  // 计算屏幕适配比例
  const rate = window.screen.width / 1920;
  // 根据设备类型应用缩放
  if (is_andriod_ios().ios) {
    document.body.style.transform = `scale(${rate})`;
  } else {
    document.body.style.zoom = String(rate);
  }
  newZoom.value = rate;

  // 触摸开始事件 - 记录初始触摸点
  document.body.addEventListener('touchstart', (event: any) => {
    const touches = event.touches;
    const events = touches[0];
    const events2 = touches[1];
    // 记录第一个触摸点的坐标
    displacement.value.pageX = events.pageX;
    displacement.value.pageY = events.pageY;
    displacement.value.moveable = true;
    if (events2) {
      displacement.value.pageX2 = events2.pageX;
      displacement.value.pageY2 = events2.pageY;
    }
    displacement.value.originScale = displacement.value.scale || 1;
  });

  // 触摸移动事件 - 处理双指缩放
  document.addEventListener('touchmove', (event: any) => {
    if (!displacement.value.moveable) {
      return;
    }
    event.preventDefault();
    const touches = event.touches;
    const events = touches[0];
    const events2 = touches[1];

    // 处理双指缩放
    if (events2) {
      // 获取第二个触摸点坐标
      if (!displacement.value.pageX2) {
        displacement.value.pageX2 = events2.pageX;
      }
      if (!displacement.value.pageY2) {
        displacement.value.pageY2 = events2.pageY;
      }

      // 计算双指缩放比例
      const zoom =
        getDistance(
          {
            x: events.pageX,
            y: events.pageY,
          },
          {
            x: events2.pageX,
            y: events2.pageY,
          },
        ) /
        getDistance(
          {
            x: displacement.value.pageX,
            y: displacement.value.pageY,
          },
          {
            x: displacement.value.pageX2,
            y: displacement.value.pageY2,
          },
        );

      // 应用缩放效果，使用定时器实现限流防抖
      if (ztTimer.value) {
        clearTimeout(ztTimer.value);
      }
      ztTimer.value = setTimeout(() => {
        if (zoom > 1) {
          newZoom.value = newZoom.value + 0.1;
          if (newZoom.value > 0.8) {
            newZoom.value = 0.8;
          }
        } else {
          newZoom.value = newZoom.value - 0.1;
          if (newZoom.value < 0.2) {
            newZoom.value = 0.2;
          }
        }
        // 应用缩放变换
        if (is_andriod_ios().ios) {
          document.body.style.transform = `scale(${newZoom.value})`;
        } else {
          document.body.style.zoom = String(newZoom.value);
        }
      }, 100);
    }
  });
}

/**
 * 计算两点之间的距离
 * 使用Math.hypot()方法计算参数的平方根
 * @param {object} start - 起点坐标 {x, y}
 * @param {object} stop - 终点坐标 {x, y}
 * @returns {number} 两点之间的距离
 */
function getDistance(start: any, stop: any) {
  return Math.hypot(stop.x - start.x, stop.y - start.y);
}
// endregion

// region 页面缩放(PC)
// 缩放值
const zoomValue = ref(100);
/**
 * 页面缩放
 * @param event 事件
 */
function mouseWheel(event: any) {
  if (!details.value.layer.dragZoom) {
    return;
  } else if (event.wheelDelta >= 120) {
    zoomValue.value += 10;
  } else if (event.wheelDelta <= -120) {
    zoomValue.value -= 10;
  }
  saveSf();
}

/**
 * 保存缩放值
 */
function saveSf() {
  sessionStorage.setItem(`saveSf-${query.guid}`, `${zoomValue.value}`);
}

/**
 * 加载缩放值
 */
function loadSf() {
  const zoomStr = sessionStorage.getItem(`saveSf-${query.guid}`);
  return zoomStr ? Number.parseInt(zoomStr, 10) : 100;
}

// endregion

// region 鼠标相关事件
// 鼠标操作类型
const mouseOperate = ref('default');
// 定位信息
const position = ref({
  x: 0,
  y: 0,
  l: 0,
  t: 0,
});

/**
 * 重置鼠标操作状态
 */
function resetMouseOperate() {
  mouseOperate.value = 'default';
}
/**
 * 鼠标移动事件处理
 * 执行容器拖拽操作
 */
function mouseMove(e: any) {
  e.preventDefault();
  // 检查是否启用拖拽缩放
  if (!details.value.layer.dragZoom) {
    return;
  }
  const point = imageTofile.value!;
  if (mouseOperate.value === 'render-box') {
    // 获取当前鼠标位置
    const nx = e.clientX; // 随着缩放，这个值会变化
    const ny = e.clientY; // 随着缩放，这个值会变化

    // 计算新的容器位置
    const nl = nx - (position.value.x - position.value.l);
    const nt = ny - (position.value.y - position.value.t);
    // 更新容器位置
    point.style.left = `${nl}px`;
    point.style.top = `${nt}px`;

    // 保存位置到会话存储
    sessionStorage.setItem(`boxLeft-${query.guid}`, point.style.left);
    sessionStorage.setItem(`boxTop-${query.guid}`, point.style.top);
    e.stopImmediatePropagation();
  }
}
/**
 * 鼠标按下事件处理
 * 初始化拖拽操作
 */
function mouseDown(e: any) {
  e.stopPropagation();
  e.preventDefault();
  if (e.target.id === 'render-box') {
    const idDown: any = document.querySelector('#render-box')!;
    idDown.style.cursor = 'pointer';
    // 记录鼠标按下时的位置
    position.value = {
      x: e.clientX,
      y: e.clientY,
      l: idDown.offsetLeft,
      t: idDown.offsetTop,
    };
    // 设置操作状态
    mouseOperate.value = 'render-box';
  }
}
function mouseUp(e: any) {
  resetMouseOperate();
  if (e.target.id === 'render-box') {
    const idDoc: any = document.querySelector(`#${e.target.id}`)!;
    idDoc.style.cursor = 'default';
  }
}
// endregion

// region 渲染容器
// 渲染容器样式
const layerStyle = computed(() => {
  const styles = [];
  // 缩放
  styles.push(`transform: scale(${zoomValue.value / 100});`);
  // 背景颜色
  details.value.layer.backColor &&
    styles.push(`background-color: ${details.value.layer.backColor};`);
  // 背景图片
  details.value.layer.backgroundImage &&
    styles.push(
      `background-image: url(${details.value.layer.backgroundImage});`,
    );
  // 宽度
  details.value.layer.width > 0 &&
    styles.push(`width: ${details.value.layer.width}px;`);
  //  高度
  details.value.layer.height > 0 &&
    styles.push(`height: ${details.value.layer.height}px;`);
  styles.push('overflow:hidden;');
  imageTofile.value?.style.left &&
    styles.push(`left: ${imageTofile.value!.style.left};`);
  imageTofile.value?.style.top &&
    styles.push(`top: ${imageTofile.value!.style.top};`);
  return styles.join(' ');
});

const menus = shallowRef({
  menus: [
    {
      label: '图片生成',
      click: () => {
        generateImage();
      },
    },
    {
      label: '全屏展示',
      click: () => {
        toggle();
      },
    },
    {
      label: '重新加载',
      click: () => {
        reloadPage();
      },
    },
  ],
});
// region 图片生成
const imageTofile = ref<HTMLDivElement | null>(null);
// 图片生成
// 优化后的图片生成函数
async function generateImage() {
  if (!imageTofile.value) {
    console.warn('没有找到要截图的元素');
    return;
  }

  try {
    // 计算最佳缩放比例
    const scale = calculateOptimalScale(imageTofile.value);

    // 高清截图
    const canvas = await html2canvas(imageTofile.value, {
      backgroundColor: '#ffffff',
      scale,
      useCORS: true,
      allowTaint: false,
      logging: false, // 关闭控制台日志提升性能
      removeContainer: true, // 清理临时容器
      width: imageTofile.value.scrollWidth,
      height: imageTofile.value.scrollHeight,
      onclone: (_clonedDoc, element) => {
        // 截图前的优化处理
        optimizeElementForCapture(element);
      },
    });

    // 生成文件名（带时间戳）
    const timestamp = dayjs().format('YYYYMMDDHHmmss');
    const fileName = `image-${timestamp}.png`;

    // 下载图片
    downloadCanvasAsImage(canvas, fileName);
  } catch (error) {
    console.error('图片生成失败:', error);
    message.error($t('common.imageGenerationFailure'));
  }
}

// 计算最佳缩放比例
function calculateOptimalScale(element: any) {
  const baseScale = Math.max(2, window.devicePixelRatio || 1);
  const elementRect = element.getBoundingClientRect();

  // 根据元素大小动态调整缩放，防止内存溢出
  const elementArea = elementRect.width * elementRect.height;
  let optimalScale = baseScale;

  if (elementArea > 2_000_000) {
    // 大面积元素
    optimalScale = Math.min(2, baseScale);
  } else if (elementArea > 4_000_000) {
    // 超大面积元素
    optimalScale = 1.5;
  } else if (elementArea < 500_000) {
    // 小面积元素
    optimalScale = Math.min(3, baseScale);
  }

  // 限制最大缩放，防止性能问题
  return Math.min(optimalScale, 4);
}

// 优化元素以获取更好截图效果
function optimizeElementForCapture(element: any) {
  // 临时应用优化样式
  const originalStyles = {
    fontSmooth: element.style.fontSmooth,
    imageRendering: element.style.imageRendering,
  };

  element.style.fontSmooth = 'antialiased';
  element.style.imageRendering = 'high-quality';
  element.style.webkitFontSmoothing = 'antialiased';

  // 处理图片元素
  const images = element.querySelectorAll('img');
  images.forEach((img: any) => {
    if (!img.complete) {
      // 给未加载完成的图片添加加载处理
      img.style.opacity = '0.99';
    }
  });

  // 恢复原始样式的函数（在截图完成后调用）
  return () => {
    element.style.fontSmooth = originalStyles.fontSmooth;
    element.style.imageRendering = originalStyles.imageRendering;
    element.style.webkitFontSmoothing = '';
  };
}

// 下载Canvas为图片
function downloadCanvasAsImage(canvas: any, fileName = 'image.png') {
  try {
    // 使用最高质量
    const dataUrl = canvas.toDataURL('image/png', 1);

    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;

    // 兼容性处理
    document.body.append(link);
    link.click();
    link.remove();

    // 释放内存
    setTimeout(() => {
      canvas.width = 0;
      canvas.height = 0;
    }, 1000);
  } catch (error) {
    console.error('下载失败:', error);
    throw error;
  }
}

// endregion

// region 全屏显示
const { toggle } = useFullscreen(document.documentElement);
// endregion

// region 重新加载

// 重新加载
function reloadPage() {
  location.reload();
}
// endregion

// endregion

// region 动态加载组件
function parseView(component: any) {
  return topoUtil.parseViewName(component);
}

const { components }: any = useTopoComponents();

function getComponent(component: any) {
  const componentName: any = parseView(component);
  if (!components.value[componentName]) {
    return null;
  }
  return defineAsyncComponent({
    loader: components.value[componentName],
    loadingComponent: {
      template: '<div>加载中...</div>',
    },
    errorComponent: {
      template: '<div>组件加载失败</div>',
    },
  });
}

// endregion

// region 初始化
const renderApp = ref();
/**
 * 初始化左侧顶部位置
 */
function initLeftTop() {
  const el = renderApp.value!;
  if (!el.style) {
    el.style = {};
  }
  if (!details.value.layer.dragZoom) {
    el.style.overflow = 'auto';
    return;
  }
  el.style.overflow = 'hidden';
  if (sessionStorage.getItem(`boxLeft-${query.guid}`) !== 'undefined') {
    const point: any = imageTofile.value!;
    if (point) {
      if (!point.style) {
        point.style = {};
      }
      point.style.left = sessionStorage.getItem(`boxLeft-${query.guid}`);
      point.style.top = sessionStorage.getItem(`boxTop-${query.guid}`);
    }
  }
}

function is_andriod_ios() {
  const u = navigator.userAgent;
  return {
    // 移动终端浏览器版本信息
    trident: u.includes('Trident'), // IE内核
    presto: u.includes('Presto'), // Opera内核
    webKit: u.includes('AppleWebKit'), // 苹果、谷歌内核
    gecko: u.includes('Gecko') && !u.includes('KHTML'), // 火狐内核
    mobile:
      /AppleWebKit.*Mobile/i.test(u) ||
      /MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(
        u,
      ), // 是否为移动终端
    ios: /\(i[^;]+;(?:; U;)? CPU.+Mac OS X/.test(u), // iOS终端
    android: u.includes('Android') || u.includes('Linux'), // Android终端或者UC浏览器
    iPhone: u.includes('iPhone') || u.includes('Mac'), // 是否为iPhone或者QQHD浏览器
    iPad: u.includes('iPad'), // 是否iPad
    webApp: !u.includes('Safari'), // 是否Web应用程序，没有头部与底部
  };
}

// endregion

// region mqtt
const store = useTopoStore();
/**
 * 连接MQTT消息服务器
 * 建立与MQTT服务器的连接，并设置消息回调
 */
function connectMqtt() {
  // 如果MQTT客户端未连接，则进行连接
  if (!mqttTool.client) {
    mqttTool.connect();
  }
  // 设置消息回调处理
  mqttCallback();
}

/* eslint-disable no-console */

/**
 * MQTT消息回调处理
 * 监听并处理接收到的MQTT消息
 */
function mqttCallback() {
  mqttTool.client.on('message', (topic: any, msg: any) => {
    console.log('收到MQTT消息:', topic, msg.toString());
    // 解析主题信息
    const topics = topic.split('/');
    const productId = topics[1];
    const deviceNum = topics[2];
    // 解析消息内容
    msg = JSON.parse(msg.toString());
    if (!msg) {
      return;
    }
    // 处理设备状态消息
    if (topics[3] === 'status') {
      console.log('接收到【设备状态】主题：', topic);
      console.log('接收到【设备状态】内容：', message);
    }
    // 处理服务回复消息
    if (topics[4] === 'reply') {
      message.success(msg);
    }
    // 处理物模型数据消息
    if (topic.endsWith('ws/service')) {
      console.log('接收到【物模型】主题：', topic);
      console.log('接收到【物模型】内容：', message);
      const data = {
        productId,
        serialNumber: deviceNum,
        message,
      };
      // 将数据存储到Vuex中
      store.setMqttData(data);
    }
  });
}
/* eslint-enable no-console */

/**
 * MQTT订阅主题
 * @param {Array} list - 设备列表
 */
function mqttSubscribe(list: any) {
  const topics = getSubscribeTopic(list);
  mqttTool.subscribe(topics);
}
/**
 * MQTT取消订阅主题
 * @param {Array} list - 设备列表
 */
function mqttUnSubscribe(list: any) {
  const topics = getSubscribeTopic(list);
  mqttTool.unsubscribe(topics);
}
/**
 * 获取订阅主题列表
 * @param {Array} list - 设备列表
 * @returns {Array} 返回主题数组
 */
function getSubscribeTopic(list: any) {
  const topics: any = [];
  if (list && list.length > 0) {
    list.forEach((item: any) => {
      // 设备状态上报主题
      const topicStatus = `/${item.productId}/${item.serialNumber}/status/post`;
      // 物模型服务主题
      const topicService = `/${item.productId}/${item.serialNumber}/ws/service`;
      // 设备监控主题
      const topicMonitor = `/${item.productId}/${item.serialNumber}/monitor/post`;
      // 服务回复主题
      const topicReply = `/${item.productId}/${item.serialNumber}/service/reply`;
      topics.push(topicStatus, topicService, topicMonitor, topicReply);
    });
  }
  return topics;
}

onUnmounted(() => {
  mqttUnSubscribe(bindDevices.value);
});
// endregion

onMounted(() => {
  queryData();
  connectMqtt();
});
</script>

<template>
  <Page class="bg-white p-0" content-class="p-0">
    <div
      id="render-app"
      ref="renderApp"
      class="h-screen w-screen"
      @mousewheel="mouseWheel"
    >
      <!-- 渲染容器 - 包含所有组态组件的主容器 -->
      <Spin :spinning="isLoading">
        <div
          v-if="details.layer"
          id="render-box"
          ref="imageTofile"
          class="bg-size-[100%] absolute overflow-auto bg-white bg-clip-padding bg-no-repeat bg-origin-padding"
          :style="layerStyle"
          v-menus:right="menus"
          @mousemove="mouseMove"
          @mousedown="mouseDown"
          @mouseup="mouseUp"
          @mouseenter="resetMouseOperate"
          @mouseleave="resetMouseOperate"
        >
          123
          <!-- 组件渲染循环 - 动态渲染配置中的所有组件 -->
          <div
            v-for="(component, index) in details.components"
            :key="index"
            v-memo="component.identifier"
            v-show="
              component.style.visible === undefined
                ? true
                : component.style.visible
            "
            :class="{
              'cursor-pointer': component.action.length > 0,
            }"
            :style="{
              left: `${component.style.position.x}px`,
              top: `${component.style.position.y}px`,
              width: `${component.style.position.w}px`,
              height: `${component.style.position.h}px`,
              backgroundColor:
                component.type === 'flow-bar' ||
                component.type === 'flow-bar-dynamic'
                  ? 'transparent'
                  : component.style.backColor,
              zIndex: component.style.zIndex,
              transform: component.style.transformType,
              opacity: component.style.opacity,
              'border-radius': `${component.style.borderRadius}px`,
              'box-shadow': `0 0 ${component.style.boxShadowWidth}px 0 ${
                component.style.boxShadowColor
              }`,
            }"
            class="absolute"
          >
            <!-- 动态组件 - 根据组件类型动态渲染具体的组件 -->
            <component :is="getComponent(component)" :detail="component" />
          </div>
        </div>
      </Spin>
    </div>
  </Page>
</template>

<style scoped lang="scss"></style>
