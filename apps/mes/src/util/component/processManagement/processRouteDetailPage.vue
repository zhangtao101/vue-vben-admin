<script lang="ts" setup>
import { ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Descriptions,
  DescriptionsItem,
  Drawer,
  message,
  Space,
} from 'ant-design-vue';

import {
  getUserInfoApi,
  queryRouterDetails,
  routeFlowGetById,
  routeFlowSave,
} from '#/api';
import Drop from '#/util/component/drop/drop.vue';

// region 表格

// const queryParams = ref<any>({});
/**
 * queryData - 负责根据当前的查询参数、分页信息和日期范围，从后端服务查询数据。
 * 该函数会更新表格的加载状态，并在查询完成后更新数据列表和总条数。
 */
// function _queryData({ page, pageSize }: any) {
//   return new Promise((resolve, reject) => {
//     // 构建查询参数对象，包含所有查询参数、当前页码和每页显示的数据条数。
//     const params = {
//       ...queryParams.value,
//       routeId: routerId.value,
//       // 设置当前页码。
//       pageNum: page,
//       // 设置每页显示的数据条数。
//       pageSize,
//     };
//
//     // 调用 searchWorksheetNoWater 函数查询数据。
//     queryProcessRouteDetailList(params)
//       .then(({ total, list }) => {
//         // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
//         resolve({
//           total,
//           items: list,
//         });
//       })
//       .catch((error) => {
//         reject(error);
//       });
//   });
// }

// endregion

// region 抽屉基本操作
// 抽屉是否打开
const isOpen = ref(false);
// 工艺路线id
const routerId = ref('');
// 是否为编辑状态
const updateStatus = ref(false);

/**
 * 打开抽屉
 * @param id 工艺路线id
 * @param isUpdate 是否为更新操作
 */
function openDrawer(id: string, isUpdate: boolean) {
  isOpen.value = true;
  routerId.value = id;
  updateStatus.value = isUpdate;
  queryDetails(id);
  queryLoginUser();
}

function closeDrawer() {
  isOpen.value = false;
}
// endregion

// region 查询工艺路线详情
const details = ref<any>({});
/**
 * 查询工艺路线详情
 * @param id 工艺路线id
 */
function queryDetails(id: string) {
  queryRouterDetails(id).then((data) => {
    details.value = data;
    read();
  });
}

// endregion

// region 查询当前登录用户信息

const userMessage = ref<any>({});

function queryLoginUser() {
  getUserInfoApi().then((data: any) => {
    const { userName, perName } = data;
    userMessage.value = {
      userName,
      perName,
    };
  });
}

// endregion

// region 保存
const dropRef = ref();

/**
 * 保存路线
 */
function save() {
  /**
   * allPathsLeadToEnd: 是否合规
   * cleanedNodes: 清理后的节点
   * edges: 连接线
   */
  const { allPathsLeadToEnd, cleanedNodes, edges } =
    dropRef.value.cleanAndCheckGraph();
  if (allPathsLeadToEnd && cleanedNodes.length > 0) {
    edges.forEach((edge: any) => {
      edge.opDetailId = routerId.value;
    });
    const params = {
      routeId: routerId.value,
      routes: edges,
      nodes: cleanedNodes,
    };
    routeFlowSave(params).then(() => {
      message.success($t('common.successfulOperation'));
      dropRef.value.setData([], []);
      closeDrawer();
    });
  } else {
    message.error('请确保至少有一条完整的路线(开始 => xxx => 结束)!');
  }
}
// endregion

// region 读取
function read() {
  routeFlowGetById(details.value.id).then(({ nodes, routes }: any) => {
    dropRef.value.setData(routes, nodes);
  });
}
// endregion

// region 暴露方法

// 暴露 open 方法，供父组件调用
defineExpose({
  openDrawer,
});

// endregion
</script>

<template>
  <!-- 已派工单列表抽屉组件 -->
  <Drawer
    v-model:open="isOpen"
    height="80%"
    placement="top"
    :title="
      updateStatus
        ? $t('processManagement.processRoute.change')
        : $t('processManagement.processRoute.viewRouting')
    "
    :footer-style="{ textAlign: 'right' }"
    @close="closeDrawer"
  >
    <div>
      <Descriptions :column="4" bordered>
        <DescriptionsItem
          :label="$t('processManagement.processRoute.processRouteNumber')"
        >
          {{ details.routeCode }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('processManagement.processRoute.routeType')"
        >
          {{ details.routeTypeName }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('processManagement.processRoute.processRouteName')"
        >
          {{ details.routeName }}
        </DescriptionsItem>
      </Descriptions>
    </div>

    <Drop ref="dropRef" :formula="details" :is-router="true" v-if="isOpen" />

    <!-- 抽屉底部操作按钮 -->
    <template #footer>
      <!-- 按钮组，包含取消和确认按钮 -->
      <Space>
        <!-- 取消按钮，点击后关闭人员操作抽屉 -->
        <Button @click="closeDrawer()">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认按钮，点击后提交人员操作信息 -->
        <Button type="primary" @click="save()">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>

<style scoped></style>
