// src/composables/useTopoAnimation.ts
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { animateInit, getAnimate } from './anime';

export function useTopoAnimation(
  detail: any, // 对应原 props.detail
  editMode: boolean, // 对应原 props.editMode
) {
  const animateView = ref<any>(null);

  const animationInit = () => {
    if (!detail.componentShow?.includes('动画') || editMode) return;

    const domId = detail.identifier;
    // eslint-disable-next-line unicorn/prefer-query-selector
    const dom = document.getElementById(`${domId}`);
    if (!dom) return;

    /* --------- 下面完全复刻原逻辑 --------- */
    const duration = detail.dataAction?.duration
      ? detail.dataAction.duration * 1000
      : ({ 快: 500, 中: 1000, 慢: 1500 }[
          detail.dataAction?.rotationSpeed as string
        ] ?? 1000);

    const rotate = detail.dataBind?.xzAction ? [360] : [0];

    const scale = detail.dataBind?.ssAction ? [0.7, 1, 1.3, 1] : [1];

    const translates: any[] = [];
    if (detail.dataBind?.hdAction) {
      detail.dataAction.translateList?.forEach((t: any) =>
        translates.push(
          t.direction === '竖直'
            ? { translateY: -t.position }
            : { translateX: t.position },
        ),
      );
    }
    if (translates.length === 0) translates.push({ translateX: 0 });
    animateView.value = animateInit(
      dom,
      'block',
      rotate,
      scale,
      translates,
      duration,
      false,
      true,
    );
  };

  const play = () => animateView.value?.play();
  const pause = () => animateView.value?.pause();
  const hide = () =>
    getAnimate().set(document.querySelector(`#${detail.identifier}`), {
      display: 'none',
    });
  const show = () =>
    getAnimate().set(document.querySelector(`#${detail.identifier}`), {
      display: 'block',
    });

  onMounted(() => {
    setTimeout(() => {
      animationInit();
    }, 500);
  });

  onBeforeUnmount(() => {
    animateView.value?.pause();
    animateView.value = null;
  });

  return { animateView, play, pause, hide, show };
}
