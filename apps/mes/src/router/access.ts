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
      const routes: any[] = mapRouterTree(routesBlack.menu, (node: any) => {
        const item: RouteRecordStringComponent = {
          component: '',
          meta: {
            code: node.code,
            // TODO 暂无图标, 意思意思
            icon: 'hugeicons:folder-management',
            title: node.title,
          },
          // 防止name出现重复的(父级name 与 子级name重复)
          name:
            node.children && node.children.length > 0
              ? `${node.name}_${node.code}`
              : node.name,
          path: node.name,
          children: node.children,
        };
        return item;
      });
      // 添加首页及个人信息页
      routes.push({
        meta: {
          icon: 'lucide:layout-dashboard',
          order: -1,
          title: $t('page.dashboard.title'),
        },
        name: 'Dashboard',
        path: '/',
        children: [
          // 暂时注销分析页及工作台, 因为没有相应的接口
          // {
          //   name: 'Analytics',
          //   path: '/analytics',
          //   component: '/dashboard/analytics/index',
          //   meta: {
          //     affixTab: false,
          //     icon: 'lucide:area-chart',
          //     title: $t('page.dashboard.analytics'),
          //   },
          // },
          // {
          //   name: 'Workspace',
          //   path: '/workspace',
          //   component: '/dashboard/workspace/index',
          //   meta: {
          //     title: $t('page.dashboard.workspace'),
          //   },
          // },
          {
            name: 'Welcome',
            path: '/welcome',
            component: '/dashboard/welcome/index',
            meta: {
              affixTab: true,
              title: $t('page.dashboard.welcome'),
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
