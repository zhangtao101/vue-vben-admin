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
    layout: 'mixed-nav',
    defaultHomePath: '/workFlow/productionOperation',
  },
  sidebar: {
    autoActivateChild: true,
    collapsedShowTitle: true,
    fixedButton: false,
    width: 250,
  },
  theme: {
    mode: 'light',
    builtinType: 'custom',
    colorPrimary: 'hsl(179 90% 39%)',
    semiDarkHeader: true,
    radius: '0.75',
  },
  copyright: {
    companyName: '',
    companySiteLink: '/',
    date: '2026',
  },
  widget: {
    lockScreen: false,
    notification: false,
  },
});
