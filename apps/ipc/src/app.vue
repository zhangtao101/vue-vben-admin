<script lang="ts" setup>
import { computed } from 'vue';

import { useAntdDesignTokens } from '@vben/hooks';
import { preferences, usePreferences } from '@vben/preferences';

import { App, ConfigProvider, theme } from 'ant-design-vue';

import { antdLocale } from '#/locales';

defineOptions({ name: 'App' });

const { isDark } = usePreferences();
const { tokens } = useAntdDesignTokens();

const tokenTheme = computed(() => {
  const algorithm = isDark.value
    ? [theme.darkAlgorithm]
    : [theme.defaultAlgorithm];

  // antd 紧凑模式算法
  if (preferences.app.compact) {
    algorithm.push(theme.compactAlgorithm);
  }

  return {
    algorithm,
    token: {
      ...tokens,
      // antd 基础字号直接使用全局 --font-size-base（偏好里的「字体大小」）
      fontSize: preferences.theme.fontSize || 16,
    },
  };
});
</script>

<template>
  <ConfigProvider :locale="antdLocale" :theme="tokenTheme">
    <App>
      <RouterView />
    </App>
  </ConfigProvider>
</template>
<style lang="scss">
/* 基于全局 --font-size-base 的字号工具类
 * 倍率沿用 Tailwind 默认字阶（视觉与原 text-* 类一致），
 * 但显式绑定变量，后续只需改倍率即可统一调档 */
.ipc-fs-xs {
  font-size: calc(var(--font-size-base) * 0.75);
  line-height: calc(var(--font-size-base) * 1);
}

.ipc-fs-sm {
  font-size: calc(var(--font-size-base) * 0.875);
  line-height: calc(var(--font-size-base) * 1.25);
}

.ipc-fs-base {
  font-size: var(--font-size-base);
  line-height: calc(var(--font-size-base) * 1.5);
}

.ipc-fs-lg {
  font-size: calc(var(--font-size-base) * 1.125);
  line-height: calc(var(--font-size-base) * 1.75);
}

.ipc-fs-xl {
  font-size: calc(var(--font-size-base) * 1.25);
  line-height: calc(var(--font-size-base) * 1.75);
}

.ipc-fs-2xl {
  font-size: calc(var(--font-size-base) * 1.5);
  line-height: calc(var(--font-size-base) * 2);
}

.ipc-fs-4xl {
  font-size: calc(var(--font-size-base) * 2.25);
  line-height: calc(var(--font-size-base) * 2.5);
}

/* VXE 表格行/表头行字号（通过 grid 的 row-class-name / header-row-class-name 绑定），
 * 表格内外字号统一跟随 --font-size-base */
.ipc-grid-row {
  font-size: var(--font-size-base);
  line-height: calc(var(--font-size-base) * 1.5);
}

.ipc-grid-header-row {
  font-size: calc(var(--font-size-base) * 1.2);
  line-height: calc(var(--font-size-base) * 1.5);
}

:root {
  .dark,
  .dark[data-theme='default'] {
    /* 搜索框 */
    --accent: 223deg 30.95% 19.35%;

    /* 搜索框内快捷键颜色 */
    --background: 213.13deg 46.21% 28.43%;

    /* header */
    --header: var(--background);
  }
}
</style>
