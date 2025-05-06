/**
 * 递归映射路由树配置
 * @param tree 原始路由配置树数组
 * @param mapper 节点映射函数，用于转换路由节点格式
 * @param options 配置选项 {
 *   basicUrl: 基础路径前缀，默认为'/',
 *   childProps: 子节点属性名，默认为'children'
 * }
 * @returns 处理后的路由配置数组
 */
function mapRouterTree<T, V extends Record<string, any>>(
  tree: T[],
  mapper: (node: T) => V,
  options?: any,
): V[] {
  // 解构配置参数，设置默认值
  const { basicUrl, childProps } = options || {
    basicUrl: '/',
    childProps: 'children',
  };

  return tree.map((node) => {
    // 转换当前节点格式
    const mapperNode: Record<string, any> = mapper(node);

    // 处理路径拼接
    mapperNode.path = basicUrl + mapperNode.path;

    // 特殊处理根布局组件
    mapperNode.component =
      basicUrl === '/' ? 'BasicLayout' : basicUrl + mapperNode.component;

    // 递归处理子节点
    if (mapperNode[childProps]) {
      mapperNode[childProps] = mapRouterTree(mapperNode[childProps], mapper, {
        basicUrl: `${mapperNode.path}/`, // 为子节点添加路径前缀
        childProps, // 保持子节点属性名一致
      });
    }

    return mapperNode as V;
  });
}

export { mapRouterTree };
