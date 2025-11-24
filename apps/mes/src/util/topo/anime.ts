import { animate } from 'animejs';

// 显隐、旋转、闪烁、滑动特效,display:block、none
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
  const anima = animate(targets, {
    display,
    rotate,
    scale,
    keyframes: translates ?? [],
    duration, // 动作执行时间
    autoplay, // 是否自动开启动作
    easing: 'linear',
    loop, // 动作是否开启循环
  });
  return anima;
}

// 获取当前特效的实例
export function getAnimate() {
  return animate;
}
