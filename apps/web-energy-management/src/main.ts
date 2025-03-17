import { initPreferences } from '@vben/preferences';
import { unmountGlobalLoading } from '@vben/utils';

// eslint-disable-next-line n/no-extraneous-import
import { addCollection } from '@iconify/vue';

import { overridesPreferences } from './preferences';

/**
 * 应用初始化完成之后再进行页面加载渲染
 */
async function initApplication() {
  // region 加载图标

  // 动态导入 @iconify/json/json 下的所有图标集
  const iconCollections = import.meta.glob(
    '../node_modules/@iconify/json/json/*.json',
    {
      eager: true,
    },
  );

  // 遍历所有图标集并注册
  for (const path in iconCollections) {
    const collection: any = iconCollections[path];
    addCollection(collection.default);
  }

  // endregion

  // name用于指定项目唯一标识
  // 用于区分不同项目的偏好设置以及存储数据的key前缀以及其他一些需要隔离的数据
  const env = import.meta.env.PROD ? 'prod' : 'dev';
  const appVersion = import.meta.env.VITE_APP_VERSION;
  const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${appVersion}-${env}`;

  // app偏好设置初始化
  await initPreferences({
    namespace,
    overrides: overridesPreferences,
  });

  // 启动应用并挂载
  // vue应用主要逻辑及视图
  const { bootstrap } = await import('./bootstrap');
  await bootstrap(namespace);

  // 移除并销毁loading
  unmountGlobalLoading();
}

initApplication();
