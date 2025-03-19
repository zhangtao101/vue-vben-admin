// eslint-disable-next-line n/no-extraneous-import
import * as lodash from 'lodash-es';

/**
 * 将树形结构的节点展平为一维数组
 * @param node 树形结构中的一个节点，可能包含子节点
 * @param childrenKey 子节点属性的键名，指示子节点存储在哪个字段中
 * @returns 展平后的节点数组，包含所有子节点
 */
export function flattenTree(node: any, childrenKey: string) {
  return lodash.reduce(
    node[childrenKey],
    /**
     * 递归展平每个子节点，并将其加入结果数组中
     * @param result 当前累积的展平节点数组
     * @param child 当前处理的子节点
     * @returns 更新后的展平节点数组
     */
    (result, child) => {
      // 创建子节点的拷贝
      const flatChild = { ...child };
      // 删除子节点的指定子节点字段，避免在结果中嵌套
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete flatChild[childrenKey];
      // 将处理后的子节点推入结果数组
      result.push(flatChild);
      // 如果当前子节点还有子节点，递归调用 flattenTree 展平子节点
      if (child[childrenKey] && child[childrenKey].length > 0) {
        result = [...result, ...flattenTree(child, childrenKey)];
      }
      return result;
    },
    // 初始化展平结果数组
    [] as any[],
  );
}
