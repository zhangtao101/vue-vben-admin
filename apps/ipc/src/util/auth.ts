import { getMenusWeb } from '#/api';

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
