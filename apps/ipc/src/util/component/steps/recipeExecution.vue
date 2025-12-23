<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onBeforeUnmount, ref } from 'vue';

import { $t } from '@vben/locales';
import { useVbenVxeGrid } from '@vben/plugins/vxe-table';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
} from 'ant-design-vue';

import useWebSocket from '#/util/websocket-util';

/**
 * 定义组件的 props，用于接收父组件传递的数据
 */
const props = defineProps({
  // 工步id，用于标识具体的工步，默认为 0
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID，用于标识具体的工序，默认为 0
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号，用于标识具体的工单，默认为空字符串
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号，用于标识具体的设备，默认为空字符串
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心，用于标识具体的工作中心，默认为空字符串
  workstationCode: {
    type: String,
    default: '',
  },
  // 展示类型，用于控制页面展示的内容，默认为 0
  showTypeNumber: {
    type: Number,
    default: 0,
  },
});

/**
 * 获取标签的 class，用于统一标签的样式
 * @returns {string} 标签的 class 字符串
 */
function getLabelClass() {
  return 'mr-2 inline-block w-32 p-2 text-right text-xl font-black';
}

/**
 * 获取值的 class
 * @returns 值的 class 字符串
 */
function getValueClass(isResult?: number) {
  let css = '';
  switch (isResult) {
    case -1: {
      css = 'bg-red-400 text-white';
      break;
    }
    case 1: {
      css = 'bg-green-400 text-[#444]';
      break;
    }
  }
  return `align-middle inline-block border rounded-xl p-2 text-center text-xl font-black w-64 truncate ${css}`;
}

// region 表格信息
/**
 * 表格配置选项
 */
const gridOptions: VxeGridProps<any> = {
  // 表格内容居中对齐
  align: 'center',
  // 显示表格边框
  border: true,
  // 表格列配置
  columns: [
    {
      // 列标题
      title: '序号',
      // 列类型为序号列
      type: 'seq',
      // 列宽度
      width: 50,
    },
    {
      field: 'materialName',
      title: '物料名称',
      width: 150,
    },
    {
      field: 'plannedFeed',
      title: '进料量',
      // 列最小宽度
      minWidth: 80,
    },
    {
      field: 'actualFeed',
      title: '实际进料量',
      minWidth: 100,
    },
    {
      field: 'reactionTime',
      title: '反应时间',
      minWidth: 80,
    },
    {
      field: 'reactionTemperature',
      title: '反应温度',
      minWidth: 80,
    },
    {
      field: 'executionType',
      title: '执行类型',
      minWidth: 80,
    },
    {
      title: '操作',
      minWidth: 150,
      slots: {
        default: 'action',
      },
      fixed: 'right',
    },
  ],
  // 表格高度
  height: 300,
  // 显示斑马纹
  stripe: false,
  // 排序配置，支持多列排序
  sortConfig: {
    multiple: true,
  },
  // 代理配置，用于异步查询数据
  proxyConfig: {
    ajax: {
      query: async () => {
        return await queryTableData();
      },
    },
  },
  headerCellStyle: () => {
    const res: any = {
      fontSize: '16px',
      fontWeight: 'bold',
    };
    return res;
  },
  rowStyle: ({ row }) => {
    const res: any = {
      fontSize: '16px',
      fontWeight: 'bold',
    };
    if (row.executionStatus === '已执行') {
      res.backgroundColor = '#ff9800';
      res.color = '#fff';
    } else if (row.executionStatus === '待执行') {
      res.backgroundColor = '#6c6c6c';
      res.color = '#fff';
    } else {
      res.backgroundColor = '#35a843';
      res.color = '#fff';
    }
    return res;
  },
  // 工具栏配置
  toolbarConfig: {
    // 不显示自定义按钮
    custom: false,
    // 不显示导入按钮
    // import: true,
    // 不显示导出按钮
    // export: true,
    // 显示刷新按钮
    refresh: false,
    // 显示缩放按钮
    zoom: false,
  },
};
// 初始化 VxeGrid 组件和 API
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
// endregion

// region 查询数据
const details = ref<any>({});
/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryTableData() {
  return new Promise((resolve, _reject) => {
    details.value = {
      orderInfo: {
        workOrderId: '202512220001',
        productId: '1119CSM-01',
        productName: '高性能聚合物CSM-01',
        recipeId: 'FYF-1119-01',
        recipeName: '1119-01反应釜标准合成配方',
      },
      feedStatus: {
        feedAmount: 150.5,
        unit: '千克',
        kettleTemperature: 180,
        tempUnit: '摄氏度',
      },
      recipeControl: {
        startRecipe: false,
        pauseRecipe: false,
        jumpToStep: 0,
      },
      deviceControl: {
        deviceParameters: {
          压力: '0.5 MPa',
          搅拌速度: '120 RPM',
          冷却水阀开度: '45%',
        },
        manualControl: {
          valveV101: '自动',
          pumpP201: '手动启动',
        },
      },
    };
    const arr = [
      {
        step: 1,
        materialName: '单体A-1',
        plannedFeed: 50,
        actualFeed: 50,
        reactionTime: 30,
        reactionTemperature: 60,
        executionType: '自动',
        executionStatus: '已执行',
      },
      {
        step: 2,
        materialName: '催化剂CT-01',
        plannedFeed: 1.5,
        actualFeed: 1.52,
        reactionTime: 5,
        reactionTemperature: 25,
        executionType: '自动',
        executionStatus: '已执行',
      },
      {
        step: 3,
        materialName: '稳定剂ST-10',
        plannedFeed: 0.8,
        actualFeed: null,
        reactionTime: 10,
        reactionTemperature: 60,
        executionType: '手动',
        executionStatus: '确认执行',
      },
      {
        step: 4,
        materialName: '升温阶段',
        plannedFeed: null,
        actualFeed: null,
        reactionTime: 120,
        reactionTemperature: 180,
        executionType: '自动',
        executionStatus: '待执行',
      },
      {
        step: 5,
        materialName: '单体B-2',
        plannedFeed: 30,
        actualFeed: null,
        reactionTime: 40,
        reactionTemperature: 180,
        executionType: '自动',
        executionStatus: '待执行',
      },
    ];
    resolve({
      total: arr.length,
      items: arr,
    });
    // 定义请求参数
    /* const params: any = {
      workstationCode: props.workstationCode,
      equipCode: props.equipCode,
      worksheetCode: props.worksheetCode,
      bindingId: props.bindingId,
      functionId: props.functionId,
    };
    // 调用 API 查询数据
    listHCByCodeScan(params)
      .then(({ stationList, ...d }) => {
        details.value = d;
        // 当有代码记录或工位列表时
        if (stationList) {
          // 根据展示类型返回不同的数据和总数
          resolve({
            total: stationList.length,
            items: stationList,
          });
        } else {
          // 没有数据时，返回总数为 0 和空数组
          resolve({
            total: 0,
            items: [{}],
          });
        }
      })
      .catch(() => {
        resolve({
          total: 0,
          items: [],
        });
      });*/
  });
}
// endregion

// region 手动执行

const isShow = ref(false);
const formState = ref<any>({
  select: '稳定剂ST-10',
  plannedFeed: 0.8,
  actualFeed: 0.9,
  status: 1,
});
/**
 * 物料选择
 */
const options = [
  {
    label: '稳定剂ST-10',
    value: '1',
  },
];
/**
 * 打开抽屉
 */
function openDrawer() {
  isShow.value = true;
}
/**
 * 关闭抽屉
 */
function closeDrawer() {
  isShow.value = false;
}
// endregion

// region 参数查看
const isShowDetails = ref(false);

function showDetails() {
  isShowDetails.value = true;
}

function closeDetails() {
  isShowDetails.value = false;
}

// endregion

// region websocket
/**
 * 初始化 WebSocket 连接，并传入消息处理函数和配置参数
 */
const { close: websocketClose } = useWebSocket(readMessage, {
  workstationCode: props.workstationCode,
  equipCode: props.equipCode,
  worksheetCode: props.worksheetCode,
  bindingId: props.bindingId,
  functionId: props.functionId,
  webSocketType: 5,
});

/**
 * 处理 WebSocket 接收到的消息
 * 当接收到消息时，调用 queryData 函数重新查询资源验证状态
 */
function readMessage() {
  gridApi.reload();
}
// endregion

onBeforeUnmount(() => {
  websocketClose();
});
</script>

<template>
  <div>
    <Row>
      <Col :span="24">
        <div>
          <!-- region 工单号 -->
          <div class="mb-1 mr-4 inline-block">
            <span :class="getLabelClass()">
              <!--  {{ $t('productionOperation.producedQuantity') }}：-->
              工单号:
            </span>
            <span :class="getValueClass()">
              {{
                details?.orderInfo?.workOrderId ||
                $t('productionOperation.none')
              }}
            </span>
          </div>
          <!-- endregion -->
          <!-- region 产品编号 -->
          <div class="mb-1 mr-4 inline-block">
            <span :class="getLabelClass()">
              <!--  {{ $t('productionOperation.producedQuantity') }}：-->
              产品编号:
            </span>
            <span :class="getValueClass()">
              {{
                details?.orderInfo?.productId || $t('productionOperation.none')
              }}
            </span>
          </div>
          <!-- endregion -->
          <!-- region 产品名称 -->
          <div class="mb-1 mr-4 inline-block">
            <span :class="getLabelClass()">
              <!--  {{ $t('productionOperation.producedQuantity') }}：-->
              产品名称:
            </span>
            <span :class="getValueClass()">
              {{
                details?.orderInfo?.productName ||
                $t('productionOperation.none')
              }}
            </span>
          </div>
          <!-- endregion -->
          <!-- region 配方编号 -->
          <div class="mb-1 mr-4 inline-block">
            <span :class="getLabelClass()">
              <!--  {{ $t('productionOperation.producedQuantity') }}：-->
              配方编号:
            </span>
            <span :class="getValueClass()">
              {{
                details?.orderInfo?.recipeId || $t('productionOperation.none')
              }}
            </span>
          </div>
          <!-- endregion -->
          <!-- region 配方名称 -->
          <div class="mb-1 mr-4 inline-block">
            <span :class="getLabelClass()">
              <!--  {{ $t('productionOperation.producedQuantity') }}：-->
              配方名称:
            </span>
            <span :class="getValueClass()" class="!w-72">
              {{
                details?.orderInfo?.recipeName || $t('productionOperation.none')
              }}
            </span>
          </div>
          <!-- endregion -->
        </div>

        <div>
          <div class="text-right">
            <Button type="primary" class="m-2" @click="showDetails()">
              设备执行
            </Button>
            <Button type="primary" class="m-2">配方启动</Button>
            <Button type="primary" class="m-2 bg-red-400">配方暂停</Button>
          </div>
          <Grid>
            <template #action="{ row }">
              <template
                v-if="
                  row.executionStatus === '已执行' ||
                  row.executionType === '自动'
                "
              >
                {{ row.executionStatus }}
              </template>
              <template v-else>
                <Button type="link" @click="openDrawer">
                  <Icon
                    icon="mdi:play-circle-outline"
                    class="pointer inline-block text-xl text-white"
                  />
                </Button>
                <Button type="link">
                  <Icon
                    icon="mdi:skip-forward-outline"
                    class="pointer inline-block text-xl text-white"
                  />
                </Button>
              </template>
            </template>
          </Grid>
        </div>
      </Col>
      <!--      <Col :span="8">
        <Card class="mt-10" title="进料状态">
          <FormItem label="进料量">
            <InputNumber value="0.8" addon-after="KG" />
          </FormItem>
          <FormItem label="釜内温度">
            {{ details.feedStatus?.kettleTemperature }}
            {{ details.feedStatus?.tempUnit }}
          </FormItem>
          <FormItem label="设备参数">
            <div class="mt-4 rounded-sm bg-yellow-200 p-4">
              <FormItem label="压力">
                {{ details.deviceControl?.deviceParameters.压力 }}
                <Icon
                  icon="mdi:arrow-collapse-down"
                  class="pointer inline-block text-xl text-green-400"
                  @click="openParameterIssue"
                />
              </FormItem>
              <FormItem label="搅拌速度">
                {{ details.deviceControl?.deviceParameters.搅拌速度 }}
                <Icon
                  icon="mdi:arrow-collapse-down"
                  class="pointer inline-block text-xl text-green-400"
                  @click="openParameterIssue"
                />
              </FormItem>
              <FormItem label="冷却水阀开度">
                {{ details.deviceControl?.deviceParameters.冷却水阀开度 }}
                <Icon
                  icon="mdi:arrow-collapse-down"
                  class="pointer inline-block text-xl text-green-400"
                  @click="openParameterIssue"
                />
              </FormItem>
            </div>
          </FormItem>
        </Card>
      </Col>-->
    </Row>
    <Drawer
      v-model:open="isShow"
      :footer-style="{ textAlign: 'right' }"
      :width="600"
      placement="right"
      title="手动执行"
      @close="closeDrawer"
    >
      <Form :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <FormItem label="调节阀">
          <Space>
            <Button type="primary">手动开阀</Button>
            <Button type="primary">手动关阀</Button>
          </Space>
        </FormItem>
        <FormItem label="物料">
          <Select v-model:value="formState.select" :options="options" />
        </FormItem>
        <FormItem label="设定进料量">
          <InputNumber v-model:value="formState.plannedFeed" addon-after="KG" />
        </FormItem>
        <FormItem label="实际进料量">
          <InputNumber v-model:value="formState.actualFeed" addon-after="KG" />
        </FormItem>
        <FormItem label="加料前槽重">
          <InputNumber :value="20" addon-after="KG" />
        </FormItem>
        <FormItem label="进料状态"> 进料中 <Spin /> </FormItem>
        <FormItem :wrapper-col="{ span: 20, offset: 4 }">
          <Space>
            <Button type="primary">加料</Button>
            <Button type="primary">加料完成</Button>
            <Button type="primary" class="bg-yellow-500">暂停</Button>
          </Space>
        </FormItem>
      </Form>
    </Drawer>
    <Drawer
      v-model:open="isShowDetails"
      :footer-style="{ textAlign: 'right' }"
      :width="600"
      placement="right"
      title="设备执行"
      @close="closeDetails"
    >
      <Descriptions title="工艺参数" bordered :column="2">
        <DescriptionsItem label="釜内温度">
          {{ details.feedStatus?.kettleTemperature }}
          {{ details.feedStatus?.tempUnit }}
        </DescriptionsItem>
        <DescriptionsItem label="压力">
          {{ details.deviceControl?.deviceParameters.压力 }}
        </DescriptionsItem>
        <DescriptionsItem label="搅拌速度">
          {{ details.deviceControl?.deviceParameters.搅拌速度 }}
        </DescriptionsItem>
        <DescriptionsItem label="冷却水阀开度">
          {{ details.deviceControl?.deviceParameters.冷却水阀开度 }}
        </DescriptionsItem>
      </Descriptions>

      <Descriptions title="设备控制" bordered :column="2" class="mt-4">
        <DescriptionsItem label="搅拌机控制" :span="2">
          <Space>
            <Button type="primary">启动</Button>
            <Button type="primary" class="bg-yellow-500">停止</Button>
          </Space>
          <Input value="0.0" class="ml-4 w-24" />
        </DescriptionsItem>
      </Descriptions>
    </Drawer>
  </div>
</template>

<style scoped></style>
