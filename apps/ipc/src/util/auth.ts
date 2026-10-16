import { getMenusWeb, listWorkButtonByRole } from '#/api';

/**
 * 查询权限
 * 这个函数用于查询当前页面的权限设置，并将权限名称存储在响应式引用author中。
 */
export function queryAuth(code: string) {
  return new Promise<string[]>((resolve) => {
    // 调用getMenusWeb API函数，传递menuCode和type参数
    getMenusWeb({
      menuCode: code, // 从路由元信息中获取menuCode，并确保其为字符串类型
      type: 'web', // 指定查询的类型为'web'
    }).then((data) => {
      const author: string[] = [];
      // 检查返回的数据是否存在且不为空数组
      if (!data || data.length === 0) return;

      // 遍历返回的数据
      for (const item of data) {
        // 将每个权限项的buttonName添加到author数组中
        author.push(item.buttonName);
      }
      resolve(author);
    });
  });
}

/**
 * 查询作业平台人员按钮权限
 * 该函数用于查询作业平台（JM 系列菜单）下当前用户拥有的按钮权限名称集合。
 * @param {string} menuCode - 菜单编码（如 JM_001）
 * @returns {Promise<string[]>} 按钮权限名称集合（如 开始/结束），查询失败或无权限时返回空数组
 * @since 2026-10-15
 */
export function queryWorkAuth(menuCode: string) {
  return new Promise<string[]>((resolve) => {
    listWorkButtonByRole({ menuCode })
      .then((data) => {
        // 接口失败或返回为空时按无权限处理
        if (!data || data.length === 0) {
          resolve([]);
          return;
        }
        resolve(
          data
            .map((item: any) => item?.buttonName)
            .filter((name: string) => !!name),
        );
      })
      .catch(() => {
        resolve([]);
      });
  });
}
