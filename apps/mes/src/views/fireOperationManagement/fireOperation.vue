<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { IconifyIcon, MdiLightDelete, MdiSearch } from '@vben/icons';

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
  Popconfirm,
  Radio,
  RadioGroup,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  applyDelete,
  applyList,
  applyUpdate,
  leaderUpdate,
  safeUpdate,
  updateApply,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'workshop',
      title: '动火车间',
      minWidth: 150,
    },
    {
      field: 'hotworkUser',
      title: '动火人',
      minWidth: 150,
    },
    {
      field: 'hotworkCode',
      title: '动火编号',
      minWidth: 150,
    },
    {
      field: 'department',
      title: '申请部门',
      minWidth: 150,
    },
    {
      field: 'departSupervisor',
      title: '申请部门责任人',
      minWidth: 150,
    },
    {
      field: 'location',
      title: '动火部位',
      minWidth: 150,
    },
    {
      field: 'level',
      title: '动火级别',
      minWidth: 150,
      slots: {
        default: 'level',
      },
    },
    {
      field: 'startTime',
      title: '开始时间',
      minWidth: 150,
    },
    {
      field: 'endTime',
      title: '结束时间',
      minWidth: 150,
    },
    {
      field: 'content',
      title: '动火内容',
      minWidth: 150,
    },
    {
      field: 'equipment',
      title: '动火设备',
      minWidth: 150,
    },
    {
      field: 'remark',
      title: '备注',
      minWidth: 150,
    },
    {
      field: 'certificateCode',
      title: '证书编号',
      minWidth: 150,
    },
    {
      field: 'guardian',
      title: '监护人姓名',
      minWidth: 150,
    },
    {
      field: 'siteSupervisor',
      title: '现场指挥',
      minWidth: 150,
    },
    {
      field: 'applicantDeptReview',
      title: '申请部门负责人审核',
      minWidth: 150,
      slots: {
        default: 'status',
      },
    },
    {
      field: 'applicantDeptTime',
      title: '申请部门审核时间',
      minWidth: 150,
    },
    {
      field: 'securityDeptReview',
      title: '安全部门审核',
      minWidth: 150,
      slots: {
        default: 'status',
      },
    },
    {
      field: 'securityDeptTime',
      title: '安全部门审核时间',
      minWidth: 150,
    },
    {
      field: 'companyLeaderReview',
      title: '公司分管领导审核',
      minWidth: 150,
      slots: {
        default: 'status',
      },
    },
    {
      field: 'companyLeaderTime',
      title: '公司分管领导审核时间',
      minWidth: 150,
    },
    {
      field: 'state',
      title: '状态',
      minWidth: 80,
      slots: { default: 'state' },
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 300,
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

const stateText = ref<any>({
  1: $t('fireOperation.wasDone'),
  0: $t('fireOperation.toBeContinued'),
});
// 查询参数
const queryParams = ref<any>({});
/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams.value };
    applyList({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
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

const levels: any = {
  1: '一级',
  2: '二级',
  3: '三级',
  4: '四级',
  5: '五级',
};

// endregion

// region 新增 / 编辑

// 是否显示编辑
const isShow = ref(false);
/**
 * 编辑对象
 */
const details = ref<any>({});

/**
 * 显示编辑
 * @param row 编辑对象 为空值表示新增
 */
function showDetails(row?: any) {
  isShow.value = true;
  details.value = row ? { ...row } : {};
}

/**
 * 关闭抽屉
 */
function close() {
  isShow.value = false;
  details.value = {};
}

// endregion

// region 审核
// 审核类型 1: 申请部门负责人审核 2: 安全部门审核 3: 公司分管领导审核
const type = ref(1);
// 审核结果 1: 通过 0: 不通过
const results = ref(1);
// 审核对象id
const reviewObjectsId = ref<any>();
// 审核抽屉是否显示
const isOpen = ref(false);
// 审核抽屉标题
const drawerTitle = ref('');

/**
 * 打开审核对话框
 * @param id 审核对象id
 * @param t 审核类型
 */
function showModal(id: any, t: number = 1) {
  reviewObjectsId.value = id;
  type.value = t;
  isOpen.value = true;
  results.value = 1;
  switch (type.value) {
    case 1: {
      drawerTitle.value = $t('fireOperation.thePersonInChargeReviews');
      break;
    }
    case 2: {
      drawerTitle.value = $t('fireOperation.safetyDepartmentReview');
      break;
    }
    case 3: {
      drawerTitle.value = $t(
        'fireOperation.theCompanyIsInChargeOfTheLeadershipReview',
      );
      break;
    }
  }
}

function theReviewIsComplete() {
  const params: any = {
    id: reviewObjectsId.value,
  };
  let ob: any;
  switch (type.value) {
    case 1: {
      params.applicantDeptReview = results.value;
      ob = applyUpdate(params);
      break;
    }
    case 2: {
      params.securityDeptReview = results.value;
      ob = safeUpdate(params);
      break;
    }
    case 3: {
      params.companyLeaderReview = results.value;
      ob = leaderUpdate(params);
      break;
    }
  }
  ob.then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
    isOpen.value = false;
  });
}

function getStatusText(status: number) {
  switch (status) {
    case 0: {
      return $t('common.noPass');
    }
    case 1: {
      return $t('common.pass');
    }
  }
}

// endregion

// region 删除

function delRow(row: any) {
  applyDelete(row.id).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

// endregion

// region 状态变更
// 是否显示状态变更抽屉
const statusModal = ref(false);
// 状态变更的对象
const statusItem = ref<any>({});

/**
 * 显示状态变更抽屉
 * @param row
 */
function showStatusChangeModal(row: any) {
  statusItem.value = row;
  statusModal.value = true;
}

/**
 * 变更
 */
function statusChange() {
  updateApply(statusItem.value).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
    statusModal.value = false;
    statusItem.value = {};
  });
}

/**
 * 任务关闭
 * @param row
 */
function taskClose(row: any) {
  const params = { ...row };
  params.end = 1;
  updateApply(params).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

// endregion

// region 权限查询

// 路由信息
const route = useRoute();
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

/**
 * 获取文件名称
 * @param filePath 文件路径
 */
function getFileName(filePath: string) {
  const regex = /[^/]+$/;
  return filePath ? filePath.match(regex)![0] : '';
}

// region 初始化

onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 动火车间 -->
        <FormItem
          :label="$t('fireOperation.LocomotiveRoom')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.workshop" />
        </FormItem>
        <!-- 动火人 -->
        <FormItem :label="$t('fireOperation.Firer')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.hotworkUser" />
        </FormItem>
        <!-- 部门负责人 -->
        <FormItem
          :label="$t('fireOperation.DepartmentLeader')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.departSupervisor" />
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
        <template #status="{ row, column }">
          {{ getStatusText(row[column.field]) }}
        </template>
        <template #state="{ row }">
          {{ stateText[row.state] }}
        </template>
        <template #level="{ row }">
          {{ levels[row.level * 1] }}
        </template>
        <template #action="{ row }">
          <!-- 查看详情 -->
          <Tooltip>
            <template #title>{{ $t('common.view') }}</template>
            <Button type="link" @click="showDetails(row)">
              <IconifyIcon
                icon="mdi:eye"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 负责人审核 -->
          <Tooltip
            v-if="
              author.includes('负责人审核') &&
              row.pass !== 1 &&
              row.applicantDeptReview !== 1
            "
          >
            <template #title>
              {{ $t('fireOperation.thePersonInChargeReviews') }}
            </template>
            <Button type="link" @click="showModal(row.id, 1)">
              <IconifyIcon
                icon="mdi:check"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 安全部门审核 -->
          <Tooltip
            v-if="
              author.includes('安全部门审核') &&
              row.pass !== 1 &&
              row.applicantDeptReview === 1 &&
              row.securityDeptReview !== 1
            "
          >
            <template #title>
              {{ $t('fireOperation.safetyDepartmentReview') }}
            </template>
            <Button type="link" @click="showModal(row.id, 2)">
              <IconifyIcon
                icon="mdi:checkbox-marked-circle-outline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 分管领导审核 -->
          <Tooltip
            v-if="
              author.includes('分管领导审核') &&
              row.pass !== 1 &&
              row.securityDeptReview === 1
            "
          >
            <template #title>
              {{
                $t('fireOperation.theCompanyIsInChargeOfTheLeadershipReview')
              }}
            </template>
            <Button type="link" @click="showModal(row.id, 3)">
              <IconifyIcon
                icon="mdi:check-underline"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 状态变更 -->
          <Tooltip
            v-if="
              author.includes('状态变更') &&
              row.pass === 1 &&
              ![0, 1].includes(row.state)
            "
          >
            <template #title>
              {{ $t('fireOperation.statusChange') }}
            </template>
            <Button type="link" @click="showStatusChangeModal(row)">
              <IconifyIcon
                icon="mdi:update"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
          <!-- 关闭任务 -->
          <Tooltip
            v-if="
              author.includes('关闭任务') &&
              (row.state === 1 || row.state === 0) &&
              row.end !== 1
            "
          >
            <template #title>
              {{ $t('common.close') }}
            </template>

            <Popconfirm
              :cancel-text="$t('common.cancel')"
              :ok-text="$t('common.confirm')"
              :title="$t('ui.widgets.confirmTheInformation')"
              @confirm="taskClose(row)"
            >
              <Button type="link">
                <IconifyIcon
                  icon="mdi:close-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Popconfirm>
          </Tooltip>

          <!-- 删除 -->
          <Tooltip v-if="author.includes('删除') && row.pass !== 1">
            <template #title>{{ $t('common.delete') }}</template>
            <Popconfirm
              :cancel-text="$t('common.cancel')"
              :ok-text="$t('common.confirm')"
              :title="$t('ui.widgets.deletionConfirmation')"
              @confirm="delRow(row)"
            >
              <Button
                :icon="
                  h(MdiLightDelete, {
                    class: 'inline-block size-6',
                  })
                "
                danger
                type="link"
              />
            </Popconfirm>
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->

    <Drawer
      v-model:open="isShow"
      :footer-style="{ textAlign: 'right' }"
      width="800"
      placement="right"
      :title="$t('common.edit')"
      @close="close"
    >
      <Descriptions :column="2" bordered>
        <!-- 动火车间 -->
        <DescriptionsItem :label="$t('fireOperation.LocomotiveRoom')">
          {{
            details.workshop || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 动火人 -->
        <DescriptionsItem :label="$t('fireOperation.Firer')">
          {{
            details.hotworkUser ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 部门负责人 -->
        <DescriptionsItem :label="$t('fireOperation.ReturnParameters')">
          {{
            details.departSupervisor ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 动火编号 -->
        <DescriptionsItem :label="$t('fireOperation.FireNumber')">
          {{
            details.hotworkCode ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 申请部门 -->
        <DescriptionsItem :label="$t('fireOperation.ApplyingDepartment')">
          {{
            details.department ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 申请部门责任人 -->
        <DescriptionsItem
          :label="$t('fireOperation.ResponsibleOfApplyingDepartment')"
        >
          {{
            details.departSupervisor ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 动火部位车间 -->
        <DescriptionsItem :label="$t('fireOperation.LocomotiveRoomOfFirer')">
          {{
            details.workshop || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 区域 -->
        <DescriptionsItem :label="$t('fireOperation.Region')">
          {{
            details.location || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 动火级别 -->
        <DescriptionsItem :label="$t('fireOperation.FireLevel')">
          {{
            levels[details.level] ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 动火设备 -->
        <DescriptionsItem :label="$t('fireOperation.FireEquipment')">
          {{
            details.equipment || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 动火内容 -->
        <DescriptionsItem :label="$t('fireOperation.FireContent')" :span="2">
          {{
            details.content || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 开始时间 -->
        <DescriptionsItem :label="$t('fireOperation.StartTime')" :span="2">
          {{
            details.startTime || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 结束时间 -->
        <DescriptionsItem :label="$t('fireOperation.EndTime')" :span="2">
          {{
            details.endTime || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 危险源识别 -->
        <DescriptionsItem
          :label="$t('fireOperation.HazardIdentification')"
          :span="2"
        >
          <template v-if="details.hazardsourceIdentificationList">
            <Tag
              v-for="(item, index) of details.hazardsourceIdentificationList"
              :key="index"
              color="#2db7f5"
            >
              {{ item }}
            </Tag>
          </template>
          <span v-else>
            {{ $t('hiddenDangerInspectionTask.notAtTheMoment') }}
          </span>
        </DescriptionsItem>
        <!-- 危险辨别 -->
        <DescriptionsItem
          :label="$t('fireOperation.RiskIdentification')"
          :span="2"
        >
          <template v-if="details.hazardIdentificationList">
            <Tag
              v-for="(item, index) of details.hazardIdentificationList"
              :key="index"
              color="#2db7f5"
            >
              {{ item }}
            </Tag>
          </template>
          <span v-else>
            {{ $t('hiddenDangerInspectionTask.notAtTheMoment') }}
          </span>
        </DescriptionsItem>
        <!-- 已确认安全措施的 id -->
        <DescriptionsItem
          :label="$t('fireOperation.ConfirmedSafetyMeasures')"
          :span="2"
        >
          <template v-if="details.safeIdList">
            <ol>
              <li v-for="(item, index) of details.safeIdList" :key="index">
                {{ item }}
              </li>
            </ol>
          </template>
          <span v-else>
            {{ $t('hiddenDangerInspectionTask.notAtTheMoment') }}
          </span>
        </DescriptionsItem>
        <!-- 备注 -->
        <DescriptionsItem :label="$t('fireOperation.Remarks')" :span="2">
          {{
            details.remark || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 监护人姓名 -->
        <DescriptionsItem :label="$t('fireOperation.SupervisorName')">
          {{
            details.guardian || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 现场指挥 -->
        <DescriptionsItem :label="$t('fireOperation.OnSiteCommand')" :span="2">
          {{
            details.siteSupervisor ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 文件资料 -->
        <DescriptionsItem
          :label="$t('fireOperation.UploadedPhotoOrFile')"
          :span="2"
        >
          <a
            v-for="(item, index) of details?.fileList"
            :key="index"
            :href="item"
            target="_blank"
            class="inline text-blue-500"
          >
            {{ getFileName(item) }}
          </a>
        </DescriptionsItem>
        <!-- 图片资料 -->
        <DescriptionsItem :label="$t('fireOperation.photoSource')" :span="2">
          <Image
            :src="item"
            v-for="(item, index) of details?.photoList"
            :key="index"
            :width="120"
            :height="120"
          />
        </DescriptionsItem>
        <!-- 申请部门负责人审核 -->
        <DescriptionsItem
          :label="$t('fireOperation.applicantDeptHeadApprovalResult')"
        >
          {{
            getStatusText(details.applicantDeptReview) ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 时间 -->
        <DescriptionsItem
          :label="$t('fireOperation.ApplyingDepartmentLeaderApprovalTime')"
        >
          {{
            details.applicantDeptTime ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 安全部门 -->
        <DescriptionsItem :label="$t('fireOperation.SafetyDepartment')">
          {{
            getStatusText(details.securityDeptReview) ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 时间 -->
        <DescriptionsItem :label="$t('fireOperation.safetyDeptApprovalTime')">
          {{
            details.securityDeptTime ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 公司分管领导 -->
        <DescriptionsItem
          :label="$t('fireOperation.companyDivisionLeaderApprovalResult')"
        >
          {{
            getStatusText(details.companyLeaderReview) ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 时间 -->
        <DescriptionsItem
          :label="$t('fireOperation.CompanyLeadershipApprovalTime')"
        >
          {{
            details.companyLeaderTime ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 当前状态 -->
        <DescriptionsItem :label="$t('fireOperation.currentStatus')">
          {{
            stateText[details.state] ||
            $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
        <!-- 当前状态 -->
        <DescriptionsItem
          :label="$t('fireOperation.unfinishedReason')"
          v-if="details.state === 0"
        >
          {{
            details.reason || $t('hiddenDangerInspectionTask.notAtTheMoment')
          }}
        </DescriptionsItem>
      </Descriptions>
    </Drawer>

    <!-- region 审核 -->
    <Modal v-model:open="isOpen" :title="drawerTitle" @ok="theReviewIsComplete">
      <div>
        <span>{{ $t('fireOperation.reviewResults') }}：</span>
        <RadioGroup v-model:value="results" class="inline-block">
          <Radio :value="1">{{ $t('common.pass') }}</Radio>
          <Radio :value="0">{{ $t('common.noPass') }}</Radio>
        </RadioGroup>
      </div>
    </Modal>
    <!-- endregion -->

    <!-- region 状态变更 -->
    <Modal
      v-model:open="statusModal"
      :title="$t('fireOperation.statusChange')"
      @ok="statusChange"
    >
      <div>
        <span class="mb-4 inline-block w-24">
          {{ $t('fireOperation.targetStatus') }}：
        </span>
        <RadioGroup v-model:value="statusItem.state" class="inline-block">
          <Radio :value="1">{{ $t('fireOperation.wasDone') }}</Radio>
          <Radio :value="0">{{ $t('fireOperation.toBeContinued') }}</Radio>
        </RadioGroup>
      </div>
      <div v-if="statusItem.state === 0">
        <span class="mb-4 inline-block w-24">
          {{ $t('fireOperation.unfinishedReason') }}：
        </span>
        <Input v-model:value="statusItem.reason" class="w-48" />
      </div>
    </Modal>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
