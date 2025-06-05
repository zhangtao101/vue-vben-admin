import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
  RouteRecordStringComponent,
} from '@vben/types';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';

import { message } from 'ant-design-vue';

import { getAllMenusApi } from '#/api';
import { BasicLayout, IFrameView } from '#/layouts';
import { $t } from '#/locales';
import { mapRouterTree } from '#/util';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  };

  return await generateAccessible(preferences.app.accessMode, {
    ...options,
    fetchMenuListAsync: async () => {
      message.loading({
        content: `${$t('common.loadingMenu')}...`,
        duration: 1.5,
      });
      // 后台返回的菜单列表
      const routesBlack = await getAllMenusApi();
      // 转换后的菜单列表
      const routes: RouteRecordStringComponent[] = mapRouterTree(
        routesBlack.menu,
        (node: any) => {
          const item: RouteRecordStringComponent = {
            component: '',
            meta: {
              code: node.code,
              // TODO 暂无图标, 意思意思
              icon: 'hugeicons:folder-management',
              title: node.title,
            },
            name: node.name,
            path: node.name,
            children: node.children,
          };
          return item;
        },
      );
      // 添加首页及个人信息页
      routes.push({
        component: 'BasicLayout',
        meta: {
          icon: 'lucide:layout-dashboard',
          order: -1,
          title: $t('page.dashboard.title'),
        },
        name: 'Dashboard',
        path: '/',
        children: [
          {
            name: 'Analytics',
            path: '/analytics',
            component: '/dashboard/analytics/index',
            meta: {
              affixTab: true,
              icon: 'lucide:area-chart',
              title: $t('page.dashboard.analytics'),
            },
          },
          {
            name: 'Workspace',
            path: '/workspace',
            component: '/dashboard/workspace/index',
            meta: {
              title: $t('page.dashboard.workspace'),
            },
          },
        ],
      });
      return routes;
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });
}

export { generateAccess };
