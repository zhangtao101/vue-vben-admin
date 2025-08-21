<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { IconifyIcon, MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Image,
  Input,
  message,
  Modal,
  Radio,
  RadioButton,
  RadioGroup,
  Select,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  displayAllHiddenDangerHandlingInformation,
  displayHiddenDangerHandlingDetails,
  operationByReportCode,
  queryOrganizationTree,
  updateData,
} from '#/api';
import { $t } from '#/locales';
import { flattenTree, queryAuth } from '#/util';
import Rectification from '#/util/component/rectification.vue';
import RectificationLog from '#/util/component/rectificationLog.vue';

// 路由信息
const route = useRoute();

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'reportCode', title: '隐患编号', minWidth: 150 },
    { field: 'discoverer', title: '发现人', minWidth: 150 },
    { field: 'discoverTime', title: '发现时间', minWidth: 150 },
    { field: 'hazardType', title: '隐患种类', minWidth: 150 },
    { field: 'location', title: '区域', minWidth: 150 },
    { field: 'description', title: '描述', minWidth: 150 },
    { field: 'hazardSource', title: '隐患来源', minWidth: 150 },
    {
      field: 'level',
      title: '隐患等级',
      minWidth: 150,
      slots: { default: 'level' },
    },
    {
      field: 'state',
      title: '状态',
      minWidth: 150,
      slots: { default: 'status' },
    },
    {
      field: 'valid',
      fixed: 'right',
      slots: { default: 'valid' },
      title: '有效性',
      width: 150,
    },
    {
      align: 'left',
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 400,
    },
  ],
  height: 500,
  stripe: false,
  sortConfig: {
    multiple: true,
  },
  rowClassName({ row: { valid, level, state } }) {
    if (!valid) {
      return 'bg-gray-300';
    }
    if (state === 0) {
      return 'bg-green-500 text-white';
    }
    switch (level) {
      case 1: {
        return 'bg-yellow-300';
      }
      case 2: {
        return 'bg-yellow-500 text-white';
      }
      case 3: {
        return 'bg-red-300';
      }
      case 4: {
        return 'bg-red-500 text-white';
      }
    }
    return null;
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// region 查看详情

// 当前选中的表格行
const checkedRow = ref<any>({});
// 是否显示查看详情抽屉
const showViewDrawer = ref(false);

// 隐患整改历史记录
const logs = ref<any>([]);

/**
 * 查看行详情
 * @param row 表格行数据
 */
function viewRow(row: any) {
  showViewDrawer.value = true;
  displayHiddenDangerHandlingDetails(row.reportCode).then(
    ({ correction, ...details }) => {
      checkedRow.value = details;
      logs.value = correction;
    },
  );
}

// endregion

// endregion

// region 隐患操作
// 隐患整改抽屉是否处于加载状态
const showRectificationLoading = ref(false);

const rectificationRef = ref();

function showRectificationDrawer(row: any, state: number) {
  showRectificationLoading.value = true;
  operationByReportCode(row.reportCode)
    .then(({ confirm, rectification, implementation, acceptance }) => {
      let param: any;
      switch (state) {
        case 1: {
          param = confirm || {};
          break;
        }
        case 2: {
          param = rectification || {};
          break;
        }
        case 3: {
          param = implementation || {};
          break;
        }
        case 4: {
          param = acceptance || {};
          break;
        }
      }
      rectificationRef.value.open(param, state, row.reportCode);
    })
    .finally(() => {
      showRectificationLoading.value = false;
    });
}

// endregion

// region 有效性切换

function updateStatus(row: any) {
  updateData(row).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

// endregion

// region 等级变更
// 是否显示等级变更弹窗
const showLevelModal = ref(false);
// 等级变更表单对象
const editLevelItem = ref<any>({});

/**
 * 显示等级变更弹窗
 * @param row
 */
function showLevelChangeModal(row: any) {
  editLevelItem.value = {
    ...row,
  };
  showLevelModal.value = true;
}

function editLevelChange() {
  updateStatus(editLevelItem.value);
  showLevelModal.value = false;
}

// endregion

// region 查询数据

// 查询参数
const queryParams = ref({
  // 区域名称
  location: '',
  // 等级
  level: -1,
  // 状态
  state: -1,
});

/**
 * 等级列表
 */
const levelOptions = ref([
  {
    label: '全部',
    value: -1,
  },
  {
    label: '一般隐患',
    value: 1,
  },
  {
    label: '严重隐患',
    value: 2,
  },
  {
    label: '较大隐患',
    value: 3,
  },
  {
    label: '重大隐患',
    value: 4,
  },
]);
/**
 * 状态列表
 */
const statusOptions = ref([
  {
    label: '全部',
    value: -1,
  },
  {
    label: '已完成',
    value: 0,
  },
  {
    label: '隐患上报',
    value: 1,
  },
  {
    label: '问题已确认',
    value: 2,
  },
  {
    label: '已组织整改',
    value: 3,
  },
  {
    label: '已整改实施',
    value: 4,
  },
]);
/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = {
      ...queryParams.value, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    };
    if (params.level === -1) {
      params.level = undefined;
    }
    if (params.state === -1) {
      params.state = undefined;
    }
    /**
     * 调用 displayAllHiddenDangerHandlingInformation 函数，传入查询参数和分页信息。
     */
    displayAllHiddenDangerHandlingInformation(params)
      .then(({ total, list }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total,
          items: list,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 获取状态文本
 * @param status
 */
function getStatusText(status: number) {
  //  1隐患上报  2问题已确认  3已组织整改  4已整改实施
  switch (status) {
    case 0: {
      return '已完成';
    }
    case 1: {
      return '隐患上报';
    }
    case 2: {
      return '问题已确认';
    }
    case 3: {
      return '已组织整改';
    }
    case 4: {
      return '已整改实施';
    }
  }
  return '未定义的状态';
}

/**
 * 获取等级文本
 * @param level
 */
function getLevelText(level: number) {
  for (const item of levelOptions.value) {
    if (level === item.value) {
      return item.label;
    }
  }
}

// endregion

// region 组织查询
// 组织数据
const treeData = ref<any>([]);
/**
 * 查询全部的组织树
 * 这个函数用于从服务器获取所有组织数据，并更新前端的树形数据结构。
 */
function queryAllOrganizations() {
  // 调用queryDictionaryTree API函数，获取菜单列表
  queryOrganizationTree().then((data) => {
    // 检查返回的数据是否存在且长度大于0
    if (data) {
      const arr = flattenTree(
        {
          children: [data],
        },
        'children',
      );
      treeData.value = [];
      arr.forEach((item: any) => {
        treeData.value.push({
          label: item.orgFullName,
          value: item.orgFullName,
        });
      });
    }
  });
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 初始化

onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  queryAllOrganizations();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 区域名称 -->
        <FormItem
          :label="$t('regionManagement.regionalName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.location" />
        </FormItem>

        <!-- 问题等级 -->
        <FormItem
          :label="$t('hiddenDangerRectification.HiddenDangerLevel')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.level"
            :options="levelOptions"
            class="!w-48"
          />
        </FormItem>

        <!-- 状态 -->
        <FormItem
          :label="$t('hiddenDangerRectification.state')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.state"
            :options="statusOptions"
            class="!w-48"
          />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="() => gridApi.reload()"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 表格主体 -->
    <Card>
      <Grid>
        <!-- 状态 -->
        <template #status="{ row }">
          {{ getStatusText(row.state) }}
        </template>

        <!-- 等级 -->
        <template #level="{ row }">
          {{ getLevelText(row.level) }}
        </template>
        <template #valid="{ row }">
          <RadioGroup
            v-model:value="row.valid"
            @change="updateStatus(row)"
            :disabled="!author.includes('状态变更') || 0 === row.state"
          >
            <RadioButton :value="1">
              {{ $t('status.effective') }}
            </RadioButton>
            <RadioButton :value="0">
              {{ $t('status.invalid') }}
            </RadioButton>
          </RadioGroup>
        </template>
        <template #action="{ row }">
          <!-- 查看详情 -->
          <Tooltip :title="$t('common.view')">
            <Button type="link" @click="viewRow(row)">
              <IconifyIcon
                icon="mdi:eye-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 等级变更 -->
          <Tooltip :title="$t('common.levelChanges')" v-if="0 !== row.state">
            <Button
              type="link"
              @click="showLevelChangeModal(row)"
              :disabled="!row.valid"
            >
              <IconifyIcon
                icon="mdi:repeat-once"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 隐患确认 -->
          <Tooltip
            :title="$t('hiddenDangerRectification.hiddenDangerIdentification')"
            v-if="[1, 2, 3, 4].includes(row.state)"
          >
            <Button
              type="link"
              @click="showRectificationDrawer(row, 1)"
              :disabled="!row.valid"
              :loading="showRectificationLoading"
            >
              <IconifyIcon
                icon="carbon:checkmark-outline-warning"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 隐患整改 -->
          <Tooltip
            :title="
              $t('hiddenDangerRectification.rectificationOfHiddenDangers')
            "
            v-if="[2, 3, 4].includes(row.state)"
          >
            <Button
              type="link"
              @click="showRectificationDrawer(row, 2)"
              :disabled="!row.valid"
              :loading="showRectificationLoading"
            >
              <IconifyIcon
                icon="mdi:shield-sync-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 隐患整改实施 -->
          <Tooltip
            :title="
              $t(
                'hiddenDangerRectification.implementationOfHiddenDangerRectification',
              )
            "
            v-if="[3, 4].includes(row.state)"
          >
            <Button
              type="link"
              @click="showRectificationDrawer(row, 3)"
              :disabled="!row.valid"
              :loading="showRectificationLoading"
            >
              <IconifyIcon
                icon="mdi:shield-check-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 隐患整改验收 -->
          <Tooltip
            :title="
              $t(
                'hiddenDangerRectification.hiddenDangerRectificationAndAcceptance',
              )
            "
            v-if="[4].includes(row.state)"
          >
            <Button
              type="link"
              @click="showRectificationDrawer(row, 4)"
              :disabled="!row.valid"
              :loading="showRectificationLoading"
            >
              <IconifyIcon
                icon="mdi:checkbox-multiple-marked-circle-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- region 查看详情抽屉 -->
    <Drawer
      v-model:open="showViewDrawer"
      :footer-style="{ textAlign: 'right' }"
      :width="700"
      class="custom-class"
      placement="right"
      :title="$t('common.view')"
    >
      <Descriptions
        :column="2"
        bordered
        :title="
          $t('hiddenDangerRectification.detailsOfHiddenDangerRectification')
        "
      >
        <DescriptionsItem
          :label="$t('hiddenDangerRectification.HiddenDangerNumber')"
          :span="2"
        >
          {{
            checkedRow.reportCode ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('hiddenDangerRectification.HiddenDangerSource')"
          :span="2"
        >
          {{
            checkedRow.hazardSource ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('hiddenDangerRectification.HiddenDangerDescription')"
          :span="2"
        >
          {{
            checkedRow.description ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('hiddenDangerRectification.Location')">
          {{
            checkedRow.location ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('hiddenDangerRectification.DiscoveryTime')"
        >
          {{
            checkedRow.discoverTime ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('hiddenDangerRectification.HiddenDangerLevel')"
          :span="2"
        >
          {{
            checkedRow.level || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('hiddenDangerRectification.Photo')"
          :span="2"
        >
          <Image
            :src="item"
            v-for="(item, index) of checkedRow.photoList"
            :key="index"
            :width="120"
            :height="120"
          />
        </DescriptionsItem>
      </Descriptions>

      <!-- region 隐患确认 -->
      <Descriptions
        :column="2"
        bordered
        :title="$t('hiddenDangerRectification.hiddenDangerIdentification')"
        class="mt-4"
      >
        <!-- 隐患专业 -->
        <DescriptionsItem
          :label="$t('hiddenDangerRectification.HiddenDangerSpecialty')"
          :span="2"
        >
          {{
            checkedRow.hazardSpecialty ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 严重程度 -->
        <DescriptionsItem :label="$t('hiddenDangerRectification.Severity')">
          {{
            checkedRow.severityLevel ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 确认人 -->
        <DescriptionsItem :label="$t('hiddenDangerRectification.Confirmor')">
          {{
            checkedRow.confirmationUser ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 责任人 -->
        <DescriptionsItem
          :label="$t('hiddenDangerRectification.ResponsiblePerson')"
        >
          {{
            checkedRow.responsibleUser ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 责任部门 -->
        <DescriptionsItem
          :label="$t('hiddenDangerRectification.ResponsibleDepartment')"
        >
          {{
            checkedRow.responsibleDepart ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
      </Descriptions>
      <!-- endregion -->
      <RectificationLog :logs="logs" />
    </Drawer>
    <!-- endregion -->

    <!-- 移入确认对话框 -->
    <Modal
      v-model:open="showLevelModal"
      title="请选择隐患的等级!"
      @ok="editLevelChange"
    >
      <!-- 单选按钮组，用于选择工单移入模式 -->
      <RadioGroup v-model:value="editLevelItem.level">
        <template v-for="(item, index) of levelOptions">
          <Radio :value="item.value" v-if="index > 0" :key="index">
            {{ item.label }}
          </Radio>
        </template>
      </RadioGroup>
    </Modal>

    <Rectification
      ref="rectificationRef"
      @close="() => gridApi.reload()"
      @show-log="viewRow"
    />
  </Page>
</template>

<style scoped></style>
