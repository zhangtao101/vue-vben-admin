/**
 * [INPUT]: 依赖 vue-router（路由实例）、@vben/stores（useAccessStore / useUserStore）、
 *          @vben/utils（startProgress / stopProgress）、#/router/routes（accessRoutes / coreRouteNames）、
 *          #/store（useAuthStore）、./access（generateAccess）
 * [OUTPUT]: 对外提供 createRouterGuard 函数，用于在 Router 实例上注册全局前置/后置守卫
 * [POS]: 属于 router 模块的路由守卫层，负责通用守卫（进度条/页面加载状态）与权限守卫（登录校验/动态路由生成）的注册
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-06-24 15:02:00
 */

import type { Router } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { startProgress, stopProgress } from '@vben/utils';

import { accessRoutes, coreRouteNames } from '#/router/routes';
import { useAuthStore } from '#/store';

import { generateAccess } from './access';

/**
 * 注册通用路由守卫：页面加载状态跟踪与顶部进度条控制。
 * @param {Router} router - Vue Router 实例，由 createRouter 创建。
 * @returns {void} 无返回值，仅在 router 上注册 beforeEach / afterEach 钩子。
 * @throws 不抛出异常。
 * @since 2026-06-24 15:02:00
 */
function setupCommonGuard(router: Router): void {
  // 记录已经加载过的页面路径，用于跳过重复入场动画
  const loadedPaths = new Set<string>();

  router.beforeEach(async (to) => {
    to.meta.loaded = loadedPaths.has(to.path);

    // 页面加载进度条：仅首次进入某页面时启动
    if (!to.meta.loaded && preferences.transition.progress) {
      startProgress();
    }
    return true;
  });

  router.afterEach((to) => {
    // 标记当前页面为已加载，后续不再重复执行切换动画等效果
    loadedPaths.add(to.path);

    // 关闭页面加载进度条
    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/**
 * 根据当前用户的角色信息生成动态路由与菜单，并写入对应的 Pinia Store。
 * @param {Router} router - Vue Router 实例，用于注册动态路由。
 * @param {ReturnType<typeof useUserStore>} userStore - 用户 Store 实例，包含 userInfo、角色等状态。
 * @param {ReturnType<typeof useAuthStore>} authStore - 认证 Store 实例，提供 fetchUserInfo 等接口。
 * @param {ReturnType<typeof useAccessStore>} accessStore - 权限 Store 实例，用于写入生成的菜单与路由。
 * @returns {Promise<UserInfo>} 当前登录用户的完整信息（含 homePath、roles 等）。
 * @throws {Error} 当 fetchUserInfo 或 generateAccess 内部请求失败时抛出。
 * @since 2026-06-24 15:02:00
 */
async function generateDynamicRoutes(
  router: Router,
  userStore: ReturnType<typeof useUserStore>,
  authStore: ReturnType<typeof useAuthStore>,
  accessStore: ReturnType<typeof useAccessStore>,
) {
  // 获取用户信息：优先使用 Store 缓存，否则发起请求
  const userInfo = userStore.userInfo || (await authStore.fetchUserInfo());
  // 当前用户拥有的角色标识列表
  const userRoles = userInfo.roles ?? [];

  // 根据角色生成可访问的路由与菜单树
  const { accessibleMenus, accessibleRoutes } = await generateAccess({
    roles: userRoles,
    router,
    routes: accessRoutes,
  });

  // 将生成结果写入权限 Store
  accessStore.setAccessMenus(accessibleMenus);
  accessStore.setAccessRoutes(accessibleRoutes);
  accessStore.setIsAccessChecked(true);

  return userInfo;
}

/**
 * 注册权限访问守卫：登录状态校验、动态路由生成、跳转拦截。
 * @param {Router} router - Vue Router 实例。
 * @returns {void} 无返回值，仅在 router 上注册 beforeEach 钩子。
 * @throws 不直接抛出异常；内部异步操作失败时由 generateDynamicRoutes 向上抛出。
 * @since 2026-06-24 15:02:00
 */
function setupAccessGuard(router: Router): void {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();

    // 基本路由（coreRouteNames），这些路由不需要进入权限拦截
    if (coreRouteNames.includes(to.name as string)) {
      // 已登录用户访问登录页时，自动跳转到首页
      if (to.path === LOGIN_PATH && accessStore.accessToken) {
        return decodeURIComponent(
          (to.query?.redirect as string) ||
            userStore.userInfo?.homePath ||
            preferences.app.defaultHomePath,
        );
      }
      // 已登录但动态路由尚未生成时，先补齐路由再放行
      // （解决 homePath 为 '/' 等核心路由时菜单空白的问题）
      if (accessStore.accessToken && !accessStore.isAccessChecked) {
        await generateDynamicRoutes(router, userStore, authStore, accessStore);
      }
      return true;
    }

    // accessToken 不存在时的拦截
    if (!accessStore.accessToken) {
      // 明确声明忽略权限（meta.ignoreAccess）的页面，允许直接访问
      if (to.meta.ignoreAccess) {
        return true;
      }

      // 无访问权限，重定向到登录页，并携带当前路径作为 redirect 参数
      if (to.fullPath !== LOGIN_PATH) {
        return {
          path: LOGIN_PATH,
          // 默认首页不携带 redirect，避免登录后无意义跳转
          query:
            to.fullPath === preferences.app.defaultHomePath
              ? {}
              : { redirect: encodeURIComponent(to.fullPath) },
          replace: true,
        };
      }
      return to;
    }

    // 动态路由已生成过，直接放行
    if (accessStore.isAccessChecked) {
      return true;
    }

    // 首次进入非核心路由：生成动态路由表
    const userInfo = await generateDynamicRoutes(router, userStore, authStore, accessStore);
    // 计算重定向路径：优先使用登录前记录的 redirect，默认首页则使用用户的 homePath
    const redirectPath = (from.query.redirect ??
      (to.path === preferences.app.defaultHomePath
        ? userInfo.homePath || preferences.app.defaultHomePath
        : to.fullPath)) as string;

    return {
      ...router.resolve(decodeURIComponent(redirectPath)),
      replace: true,
    };
  });
}

/**
 * 创建路由守卫入口：依次注册通用守卫与权限访问守卫。
 * @param {Router} router - Vue Router 实例。
 * @returns {void} 无返回值。
 * @throws 不抛出异常。
 * @since 2026-06-24 15:02:00
 */
function createRouterGuard(router: Router): void {
  /** 通用守卫：进度条 / 页面加载状态 */
  setupCommonGuard(router);
  /** 权限访问守卫：登录校验 / 动态路由生成 */
  setupAccessGuard(router);
}

export { createRouterGuard };
