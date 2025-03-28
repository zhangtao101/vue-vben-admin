import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    // accessMode: 'backend',
    name: import.meta.env.VITE_APP_TITLE,
    layout: 'sidebar-mixed-nav',
  },
  sidebar: {
    collapsed: true,
    extraCollapse: true,
  },
  theme: {
    mode: 'light',
    builtinType: 'custom',
    colorPrimary: 'hsl(179 90% 39%)',
    radius: '1',
  },
  copyright: {
    date: '2026',
  },
});
