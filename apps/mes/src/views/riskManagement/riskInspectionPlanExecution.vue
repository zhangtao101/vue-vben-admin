<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
import { useAccessStore } from '@vben/stores';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Cascader,
  DatePicker,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Image,
  ImagePreviewGroup,
  Input,
  message,
  Modal,
  Popconfirm,
  Radio,
  RadioGroup,
  Space,
  Textarea,
  Tooltip,
  Upload,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  assignedRisk,
  collectRisk,
  deleteTaskRisk,
  listRisk,
  listSysPerson,
  queryDetailsRisk,
  queryOrganizationTree,
  taskListEdRisk,
  taskListRisk,
  taskListWillRisk,
  updateRisk,
} from '#/api';
import { $t } from '#/locales';
import { flattenTree, queryAuth } from '#/util';

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'riskCode', title: '检查编号', minWidth: 150 },
    { field: 'planCheckTime', title: '计划检查时间', minWidth: 150 },
    { field: 'checkType', title: '检查类别', minWidth: 150 },
    { field: 'checkCriteria', title: '检查标准', minWidth: 150 },
    { field: 'checkUser', title: '检查人', minWidth: 150 },
    { field: 'area', title: '检查区域', minWidth: 150 },
    { field: 'areaCode', title: '检查项目', minWidth: 150 },
    {
      field: 'result',
      title: '结果',
      minWidth: 150,
      slots: { default: 'result' },
    },
    { field: 'remark', title: '备注', minWidth: 150 },
    { field: 'checkTime', title: '检查时间', minWidth: 150 },
    {
      field: 'isReport',
      title: '是否上报隐患',
      minWidth: 150,
      slots: { default: 'status' },
    },
    {
      field: 'state',
      title: '是否完成巡检',
      minWidth: 150,
      slots: { default: 'status' },
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 280,
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
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

// 查询参数
const queryParams = ref<any>({
  result: '',
});
// 查询类型
const queryType = ref<any>(1);
// 类型列表
const typeList = [
  {
    label: $t('hiddenDangerInspectionTask.all'),
    value: 1,
  },
  {
    label: $t('hiddenDangerInspectionTask.completedToday'),
    value: 2,
  },
  {
    label: $t('hiddenDangerInspectionTask.itIsNotFinishedToday'),
    value: 3,
  },
  {
    label: $t('hiddenDangerInspectionTask.unspecified'),
    value: 4,
  },
];
/**
 * 检查结果
 */
const checkTheResults = [
  {
    label: $t('hiddenDangerInspectionTask.all'),
    value: '',
  },
  {
    label: $t('hiddenDangerInspectionTask.thereAreHiddenDangers'),
    value: 1,
  },
  {
    label: $t('hiddenDangerInspectionTask.thereAreNoHiddenDangers'),
    value: 0,
  },
];
/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = {
      ...queryParams.value,
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    };
    let ob: any;
    switch (queryType.value) {
      case 1: {
        ob = listRisk(params);
        break;
      }
      case 2: {
        ob = taskListEdRisk(params);
        break;
      }
      case 3: {
        ob = taskListRisk(params);
        break;
      }
      case 4: {
        ob = taskListWillRisk(params);
        break;
      }
    }
    ob.then(({ total, list }: any) => {
      // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
      resolve({
        total,
        items: list,
      });
    }).catch((error: any) => {
      resolve({
        total: 0,
        items: [{ id: 1 }],
      });
      reject(error);
    });
  });
}

// endregion

// region 删除任务

function delItem(row: any) {
  deleteTaskRisk(row.id).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

// endregion

// region 领取任务

/**
 * 领取任务
 * @param row 任务详情
 */
function claimTheTask(row: any) {
  collectRisk({
    id: row.id,
  }).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

// endregion

// region 指派任务
// 指派的请求参数
const assignedParams = ref<any>({});
// 选中的用户
const userChecked = ref<any>([]);
// 是否显示指派任务的模态框
const showAssigned = ref(false);

/**
 * 指派任务提交
 */
function assignedSubmit() {
  assignedRisk(assignedParams.value).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
    assignedCancel();
  });
}

/**
 * 指派任务取消
 */
function assignedCancel() {
  showAssigned.value = false;
  userChecked.value = [];
  assignedParams.value = {};
}

/**
 * 打开指派任务的模态框
 * @param row 任务详情
 */
function openAssigned(row: any) {
  assignedParams.value = {
    id: row.id,
  };
  showAssigned.value = true;
}

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
          value: item.orgCode,
          isLeaf: false,
        });
      });
    }
  });
}

// endregion

// region 用户查询

function userSearch(selectedOptions: any) {
  const targetOption = selectedOptions[selectedOptions.length - 1];
  targetOption.loading = true;

  listSysPerson({
    orgCode: targetOption.value,
    pageNum: 1, // 当前页码。
    pageSize: 25, // 每页显示的数据条数。
  })
    .then(({ list }) => {
      list.forEach((item: any) => {
        item.label = item.perName;
        item.value = item.perName;
      });
      targetOption.children = list;
    })
    .finally(() => {
      targetOption.loading = false;
    });
}

function userChange(_val: any, item: any) {
  if (item.length === 2) {
    const user = item[1];
    assignedParams.value.checkUser = user.perName;
    assignedParams.value.worknumber = user.workNumber;
  }
}

// endregion

// endregion

// region 显示详情 / 完成计划
// 是否为显示详情
const isShowDetails = ref(false);
// 是否显示
const openDetails = ref<any>(false);
// 详情
const details = ref<any>({});
// 详情加载中
const detailsLoading = ref(false);

/**
 * 显示详情
 * @param rowID 操作行id
 * @param isDetails 是否为详情
 */
function showDetails(rowID: any, isDetails = true) {
  openDetails.value = true;
  isShowDetails.value = isDetails;
  detailsLoading.value = true;
  queryDetailsRisk(rowID)
    .then((data) => {
      details.value = data;
      if (data.checkTime && !isShowDetails.value) {
        details.value.checkTime = dayjs(data.checkTime);
      }
      if (data.photoList) {
        uploadFile.value = [];
        data.photoList.forEach((item: any) => {
          uploadFile.value.push({
            url: item,
            status: 'done',
            response: {
              data: item,
            },
          });
        });
      }
    })
    .finally(() => {
      detailsLoading.value = false;
    });
}

/**
 * 详情抽屉关闭
 */
function detailsClose() {
  openDetails.value = false;
  isShowDetails.value = false;
  details.value = {};
  uploadFile.value = [];
}

// endregion

// region 文件上传
const accessStore = useAccessStore();
// 文件上传列表
const uploadFile = ref<any>([]);

function getUploadUrl() {
  return `/ht/${import.meta.env.VITE_GLOB_MES_MAIN}/accident/register/upload`;
}

const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');

async function handlePreview(file: any) {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value =
    file.name || file.url.slice(Math.max(0, file.url.lastIndexOf('/') + 1));
}

function handleCancel() {
  previewVisible.value = false;
  previewTitle.value = '';
}

function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', (error: any) => reject(error));
  });
}
// endregion

// region 完成任务

function submit() {
  const params: any = {
    ...details.value,
  };
  if (uploadFile.value.length === 0) {
    message.error('上传相关的图片!');
    return;
  }
  if (!params.checkTime) {
    message.error('请选择检查时间!');
    return;
  }
  if (!params.result && params.result !== 0) {
    message.error('请选择检查结果!');
    return;
  }
  if (!params.sign) {
    message.error('请输入区域条码!');
    return;
  }
  params.photoList = [];
  params.checkTime = params.checkTime.format('YYYY-MM-DD HH:mm:ss');
  uploadFile.value.forEach((item: any) => {
    params.photoList.push(item.response.data);
  });
  params.executionId = params.id;

  updateRisk(params).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
    detailsClose();
  });
}

// endregion

// region 权限查询

// 路由信息
const route = useRoute();
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
        <!-- 任务状态 -->
        <FormItem
          :label="$t('hiddenDangerInspectionTask.status')"
          style="margin-bottom: 1em"
          class="w-full"
        >
          <RadioGroup
            :options="typeList"
            v-model:value="queryType"
            @change="gridApi.reload()"
          />
        </FormItem>
        <!-- 检查结果 -->
        <FormItem
          :label="$t('hiddenDangerInspectionTask.InspectionResult')"
          style="margin-bottom: 1em"
          v-if="queryType === 1"
        >
          <RadioGroup
            :options="checkTheResults"
            v-model:value="queryParams.result"
          />
        </FormItem>
        <!-- 检查人 -->
        <FormItem
          :label="$t('hiddenDangerInspectionTask.inspector')"
          style="margin-bottom: 1em"
          v-if="queryType === 1"
        >
          <Input v-model:value="queryParams.checkUser" />
        </FormItem>
        <!-- 巡检区域 -->
        <FormItem
          :label="$t('hiddenDangerInspectionTask.InspectionArea')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.area" />
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
        <template #result="{ row }">
          {{
            row.result === 0
              ? $t('hiddenDangerInspectionTask.thereAreNoHiddenDangers')
              : $t('hiddenDangerInspectionTask.thereAreHiddenDangers')
          }}
        </template>
        <template #status="{ row, column }">
          {{
            row[column.field] === 0
              ? $t('hiddenDangerInspectionTask.toBeContinued')
              : $t('hiddenDangerInspectionTask.wasDone')
          }}
        </template>
        <template #action="{ row }">
          <!-- 查看 -->
          <Tooltip>
            <template #title>{{ $t('common.view') }}</template>
            <Button type="link" @click="showDetails(row.id)">
              <Icon icon="mdi:eye" class="inline-block align-middle text-2xl" />
            </Button>
          </Tooltip>
          <template v-if="[3].includes(queryType)">
            <!-- 完成任务 -->
            <Tooltip v-if="author.includes('完成任务')">
              <template #title>{{ $t('common.taskCompleted') }}</template>
              <Button type="link" @click="showDetails(row.id, false)">
                <Icon
                  icon="mdi:calendar-task-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
          </template>

          <template v-if="[1, 4].includes(queryType)">
            <!-- 指派 -->
            <Tooltip v-if="!row.checkUser && author.includes('指派')">
              <template #title>{{ $t('common.assign') }}</template>
              <Button type="link" @click="openAssigned(row)">
                <Icon
                  icon="mdi:hand-coin-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <!-- 领取 -->
            <Tooltip v-if="!row.checkUser && author.includes('领取')">
              <template #title>{{ $t('common.receive') }}</template>
              <Popconfirm
                :cancel-text="$t('common.cancel')"
                :ok-text="$t('common.confirm')"
                :title="$t('ui.widgets.pickUpTips')"
                @confirm="claimTheTask(row)"
              >
                <Button type="link">
                  <Icon
                    icon="mdi:book-multiple-outline"
                    class="inline-block align-middle text-2xl"
                  />
                </Button>
              </Popconfirm>
            </Tooltip>
            <!-- 删除 -->
            <Tooltip v-if="row.state === 0 && author.includes('删除')">
              <template #title>{{ $t('common.delete') }}</template>
              <Popconfirm
                :cancel-text="$t('common.cancel')"
                :ok-text="$t('common.confirm')"
                :title="$t('ui.widgets.deletionConfirmation')"
                @confirm="delItem(row)"
              >
                <Button danger type="link">
                  <Icon
                    icon="mdi-light:delete"
                    class="inline-block align-middle text-2xl"
                  />
                </Button>
              </Popconfirm>
            </Tooltip>
          </template>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <!-- region 详情 / 完成任务 -->
    <Drawer
      v-model:open="openDetails"
      :footer-style="{ textAlign: 'right' }"
      width="850"
      placement="right"
      :title="isShowDetails ? $t('common.view') : $t('common.taskCompleted')"
      @close="detailsClose"
    >
      <Descriptions :column="2" bordered>
        <!-- 检查编号 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.checkTheNumber')"
        >
          {{
            details.riskCode || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 计划检查时间 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.PlannedInspectionDate')"
        >
          {{
            details.planCheckTime ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 检查类别 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.InspectionCategory')"
        >
          {{
            details.checkType || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 检查标准 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.InspectionStandard')"
        >
          {{
            details.checkCriteria ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 检查人 -->
        <DescriptionsItem :label="$t('hiddenDangerInspectionTask.checkUser')">
          {{
            details.checkUser || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 检查区域 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.InspectionArea')"
        >
          {{ details.area || $t('hiddenDangerInspectionTask.notAtTheMoment') }}
        </DescriptionsItem>
        <!-- 检查项目 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.InspectionItem')"
        >
          {{
            details.areaCode || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 检查结果 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.InspectionResult')"
        >
          <template v-if="isShowDetails">
            {{
              details.result === 1
                ? $t('hiddenDangerInspectionTask.thereAreHiddenDangers')
                : $t('hiddenDangerInspectionTask.thereAreNoHiddenDangers')
            }}
          </template>
          <RadioGroup v-model:value="details.result" v-else>
            <Radio :value="1">
              {{ $t('hiddenDangerInspectionTask.thereAreHiddenDangers') }}
            </Radio>
            <Radio :value="0">
              {{ $t('hiddenDangerInspectionTask.thereAreNoHiddenDangers') }}
            </Radio>
          </RadioGroup>
        </DescriptionsItem>
        <!-- 备注 -->
        <DescriptionsItem :label="$t('hiddenDangerInspectionTask.Remarks')">
          <template v-if="isShowDetails">
            {{
              details.remark || $t('hiddenDangerInspectionTask.notAtTheMoment')
            }}
          </template>
          <Textarea v-model:value="details.remark" v-else />
        </DescriptionsItem>
        <!-- 区域扫码 -->
        <DescriptionsItem
          :label="$t('riskManagement.AreaScan')"
          v-if="!isShowDetails"
        >
          <Input v-model:value="details.sign" />
        </DescriptionsItem>
        <!-- 检查时间 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.InspectionTime')"
        >
          <template v-if="isShowDetails">
            {{
              details.checkTime ||
              $t('hiddenDangerInspectionTask.notAtTheMoment')
            }}
          </template>
          <DatePicker show-time v-model:value="details.checkTime" v-else />
        </DescriptionsItem>
        <!-- 照片 -->
        <DescriptionsItem :label="$t('hiddenDangerInspectionTask.Photo')">
          <template v-if="isShowDetails">
            <template v-if="details.photoList && details.photoList.length > 0">
              <ImagePreviewGroup>
                <Image
                  :width="100"
                  :height="100"
                  :src="item"
                  v-for="(item, index) of details.photoList"
                  :key="index"
                />
              </ImagePreviewGroup>
            </template>
            <template v-else>
              {{ $t('hiddenDangerInspectionTask.notAtTheMoment') }}
            </template>
          </template>
          <Upload
            v-else
            v-model:file-list="uploadFile"
            name="file"
            list-type="picture-card"
            accept="image/*"
            :multiple="true"
            :action="getUploadUrl()"
            :headers="{ Authorization: `${accessStore.accessToken}` }"
            @preview="handlePreview"
          >
            <div>
              <Icon
                icon="mdi:cloud-upload"
                class="inline-block align-middle text-4xl text-[#5085ff]"
              />
            </div>
          </Upload>
        </DescriptionsItem>
        <!-- 是否上报隐患 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.ReportHiddenDanger')"
        >
          {{
            details.isReport === 1
              ? $t('hiddenDangerInspectionTask.wasDone')
              : $t('hiddenDangerInspectionTask.toBeContinued')
          }}
        </DescriptionsItem>
        <!-- 是否完成巡检 -->
        <DescriptionsItem
          :label="$t('hiddenDangerInspectionTask.inspectionStatus')"
        >
          {{
            details.state === 1
              ? $t('hiddenDangerInspectionTask.wasDone')
              : $t('hiddenDangerInspectionTask.toBeContinued')
          }}
        </DescriptionsItem>
      </Descriptions>

      <template #footer v-if="!isShowDetails">
        <Space>
          <!-- 取消 -->
          <Button>
            {{ $t('common.cancel') }}
          </Button>
          <!-- 提交  -->
          <Button type="primary" @click="submit">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>

    <!-- endregion -->

    <!-- region 指派 -->
    <Modal
      v-model:open="showAssigned"
      title="分配任务"
      @ok="assignedSubmit"
      @cancel="assignedCancel()"
      :ok-button-props="{
        disabled: !(userChecked && userChecked.length === 2),
      }"
    >
      <Cascader
        v-model:value="userChecked"
        :options="treeData"
        :load-data="userSearch"
        @change="userChange"
        change-on-select
        class="w-full"
      />
    </Modal>
    <!-- endregion -->

    <!-- region 图片预览 -->
    <Modal
      :open="previewVisible"
      :title="previewTitle"
      :footer="null"
      @cancel="handleCancel"
    >
      <img alt="example" style="width: 100%" :src="previewImage" />
    </Modal>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
