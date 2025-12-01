/* anime.ts  –– 3.x 重构版 */
import anime from 'animejs';

/* ==========================================================
 * 1. 底层驱动（3.x 语法）
 * ========================================================== */
export function animate(
  targets: any,
  display?: any,
  rotate?: any,
  scale?: any,
  translates?: any,
  duration?: any,
  autoplay?: any,
  loop?: any,
): any {
  const conf: any = {
    targets,
    duration,
    autoplay: autoplay !== false,
    easing: 'easeOutExpo',
    loop,
    begin: (anim: any) => console.error('Animation started:', anim),
    complete: (anim: any) => console.error('Animation completed:', anim),
  };

  /* 显示 / 隐藏 */
  if (display === 'none') {
    conf.opacity = 0;
    // 3.x 没有 display 动画属性，用 complete 回调手动置 none
    conf.complete = (anim: any) => {
      (anim.animatables as any[]).forEach((item: any) => {
        (item.target as HTMLElement).style.display = 'none';
      });
      console.error('Animation completed:', anim);
    };
  } else if (display === 'block') {
    conf.opacity = 1;
    // 先保证元素是 block
    let els: any = [];
    if (typeof targets === 'string') {
      els = [...document.querySelectorAll(targets)];
    } else {
      els = targets instanceof Element ? [targets] : targets;
    }
    els.forEach((el: any) => {
      if (el instanceof HTMLElement) el.style.display = 'block';
    });
  } else {
    conf.opacity = 1;
  }

  /* 旋转 */
  if (rotate !== undefined) conf.rotate = rotate;

  /* 缩放 – 数组形式做关键帧 */
  if (scale !== undefined) {
    conf.scale = Array.isArray(scale) ? scale : scale;
  }

  /* 位移 */
  if (translates && translates.length > 0) {
    // translates = [{translateX:100},{translateX:0}]
    const xArr: number[] = [];
    const yArr: number[] = [];
    translates.forEach((f: any) => {
      xArr.push(f.translateX ?? 0);
      yArr.push(f.translateY ?? 0);
    });
    if (xArr.length > 0) conf.translateX = xArr;
    if (yArr.length > 0) conf.translateY = yArr;
  } else if (translates && typeof translates === 'object') {
    if (translates.translateX !== undefined)
      conf.translateX = translates.translateX;
    if (translates.translateY !== undefined)
      conf.translateY = translates.translateY;
  }

  return anime(conf);
}

/* ==========================================================
 * 2. 兼容旧入口
 * ========================================================== */
export function animateInit(
  targets: any,
  display: any,
  rotate: any,
  scale: any,
  translates: any,
  duration: any,
  autoplay: any,
  loop: any,
) {
  return animate(
    targets,
    display,
    rotate,
    scale,
    translates,
    duration,
    autoplay,
    loop,
  );
}

/* ==========================================================
 * 3. 快捷方法（全部 3.x 语法）
 * ========================================================== */
export function rotateAnimate(
  targets: any,
  duration: number = 1000,
  loop: boolean = false,
): any {
  return animate(
    targets,
    undefined,
    360,
    undefined,
    undefined,
    duration,
    true,
    loop,
  );
}

export function scaleAnimate(
  targets: any,
  duration: number = 1000,
  loop: boolean = false,
): any {
  return animate(
    targets,
    undefined,
    undefined,
    [1, 1.2, 1],
    undefined,
    duration,
    true,
    loop,
  );
}

export function translateAnimate(
  targets: any,
  translates: any,
  duration: number = 1000,
  loop: boolean = false,
): any {
  return animate(
    targets,
    undefined,
    undefined,
    undefined,
    translates,
    duration,
    true,
    loop,
  );
}

export function blinkAnimate(
  targets: any,
  duration: number = 1000,
  loop: boolean = false,
): any {
  return anime({
    targets,
    duration,
    loop,
    autoplay: true,
    easing: 'easeOutExpo',
    opacity: [1, 0.3, 1],
    scale: [1, 0.95, 1],
  });
}

export function slideInAnimate(
  targets: any,
  direction: 'bottom' | 'left' | 'right' | 'top' = 'left',
  duration: number = 1000,
  loop: boolean = false,
): any {
  const map = {
    left: { translateX: [-100, 0], opacity: [0, 1] },
    right: { translateX: [100, 0], opacity: [0, 1] },
    top: { translateY: [-100, 0], opacity: [0, 1] },
    bottom: { translateY: [100, 0], opacity: [0, 1] },
  };
  const d = map[direction] || map.left;
  // 先设 display:

  let els: any = [];
  if (typeof targets === 'string') {
    els = [...document.querySelectorAll(targets)];
  } else {
    els = targets instanceof Element ? [targets] : targets;
  }
  els.forEach((el: any) => {
    if (el instanceof HTMLElement) el.style.display = 'block';
  });
  return anime({
    targets,
    duration,
    loop,
    autoplay: true,
    easing: 'easeOutExpo',
    ...d,
  });
}

/* 停止并清空样式 */
export function removeAnimate(targets: any): void {
  anime.remove(targets);
  let els: any[] = [];
  if (typeof targets === 'string') {
    els = [...document.querySelectorAll(targets)];
  } else {
    els = targets instanceof Element ? [targets] : targets;
  }
  els.forEach((el) => {
    if (el instanceof HTMLElement) {
      el.style.transform = '';
      el.style.opacity = '';
    }
  });
}

/* 暴露原始 anime 实例，方便高级用法 */
export function getAnimate() {
  return anime;
}
