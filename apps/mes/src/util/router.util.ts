/**
 * 根据条件重新映射给定路由树结构的节
 * @param tree 要过滤的路由树结构的根节点数组。
 * @param mapper 用于map每个节点的条件。
 * @param options 作为子节点数组的可选属性名称。
 */
function mapRouterTree<T, V extends Record<string, any>>(
  tree: T[],
  mapper: (node: T) => V,
  options?: any,
): V[] {
  const { basicUrl, childProps } = options || {
    basicUrl: '/',
    childProps: 'children',
  };
  return tree.map((node) => {
    const mapperNode: Record<string, any> = mapper(node);
    mapperNode.path = basicUrl + mapperNode.path;
    if (mapperNode[childProps] && mapperNode[childProps].length > 0) {
      mapperNode.component = '';
      mapperNode[childProps] = mapRouterTree(mapperNode[childProps], mapper, {
        basicUrl: `${mapperNode.path}/`,
        childProps,
      });
    } else {
      mapperNode.component = basicUrl + mapperNode.name;
      mapperNode[childProps] = [];
    }
    return mapperNode as V;
  });
}

export { mapRouterTree };
