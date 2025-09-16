<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';
import { useAccessStore } from '@vben/stores';

import { PlusOutlined } from '@ant-design/icons-vue';
import {
  Descriptions,
  DescriptionsItem,
  Input,
  message,
  RadioGroup,
  Select,
  Spin,
  Textarea,
  Upload,
} from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { debounce } from 'lodash-es';

import {
  displayCache,
  fuzzyQueryOfEquipmentNumber,
  fuzzyQueryOfWorkOrderNumbers,
  queryErrorType,
} from '#/api';
import ScanTheCode from '#/util/component/scanTheCode.vue';

const props = defineProps({
  // 工步id
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心
  workstationCode: {
    type: String,
    default: '',
  },
  type: {
    type: Number,
    default: 1,
  },
  // 发起任务的位置
  place: {
    type: Number,
    default: 1,
  },
  // 产品编号
  productCode: {
    type: String,
    default: '',
  },
  // 产品名称
  productName: {
    type: String,
    default: '',
  },
});
const accessStore = useAccessStore();

const params = ref<any>({
  // 工单编号
  workorderCode: '',
  // 设备编号
  equipCode: '',
  // 产品名称
  product: '',
  // 物料编号
  materialCode: '',
  // 工序
  process: '',
  // 位置
  location: '',
  // 描述
  description: '',
  // 任务来源
  source: 1,
  exigency: 1,
  andonErrorType: 1,
});

// region 紧急程度
const degreeOfUrgency = ref([
  { label: '一般', value: 3 },
  { label: '急', value: 2 },
  { label: '紧急', value: 1 },
]);

// endregion
// region 异常类型
const exceptionType = ref([
  { label: '物料异常', value: 4 },
  { label: '设备异常', value: 3 },
  { label: '质量异常', value: 2 },
  { label: '生产异常', value: 1 },
]);

// endregion

// region 异常列表

// 处理方式
const errorTypes = ref<any>([]);
/**
 * 查询异常类型列表
 * 功能：获取系统中预定义的异常类型数据
 * 流程：
 * 1. 调用查询接口获取原始数据
 * 2. 将接口返回数据赋值给响应式变量
 *
 * 接口说明：
 * queryErrorType - 异常类型查询接口，无需参数
 * 返回数据结构为数组，包含 label/value 格式的选项
 *
 * 注意事项：
 * - 异常类型数据用于下拉选择组件选项
 * - 组件初始化时自动调用该函数
 * - 当前未包含错误处理逻辑，依赖接口返回正确数据结构
 */
function queryError() {
  queryErrorType().then((data: any) => {
    errorTypes.value = data;
  });
}

/**
 * 搜索框过滤方法
 * @param input 输入值
 * @param option 选项
 */
const filterOption = (input: string, option: any) => {
  return `${option.value}&&${option.label}`
    .toLowerCase()
    .includes(input.toLowerCase());
};
// endregion

// region 文件上传

// 文件上传列表
const uploadFile = ref<any>([]);

/**
 * 获取文件上传地址
 * 功能：动态生成文件上传接口URL
 *
 * 返回值说明：
 * 返回拼接后的完整上传路径，格式为：
 * `/ht/[环境变量VITE_GLOB_MES_MAIN]/andon/trigger/handle/upload`
 *
 * 环境变量说明：
 * VITE_GLOB_MES_MAIN - 主MES系统接口前缀，需在.env配置文件中定义
 *
 * 使用场景：
 * 用于异常图片上传组件的action属性配置
 *
 * 注意事项：
 * - 路径中的环境变量需确保在构建时已正确配置
 * - 实际接口需支持multipart/form-data格式上传
 */
function getUploadUrl() {
  return `/ht/${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/handle/upload`;
}

// endregion

// region 工单编号模糊查询
const listOfWorkOrderNumbers = ref<any>([]);
const fetching = ref(false);

/**
 * 模糊查询工单编号
 * 功能：根据输入值动态查询匹配的工单编号列表
 * 流程：
 * 1. 校验输入值有效性（非空校验）
 * 2. 设置加载状态为true
 * 3. 调用模糊查询接口获取匹配结果
 * 4. 更新工单编号列表数据
 * 5. 重置加载状态
 *
 * @param val - 用户输入的查询关键词
 *
 * 接口说明：
 * fuzzyQueryOfWorkOrderNumbers - 工单编号模糊查询接口，接收参数：
 *   - workSheetCode: 查询关键词
 *   - isAsc: 排序方式 (2表示降序)
 *   - pageNum: 固定第1页
 *   - pageSize: 固定每页200条
 *
 * 注意事项：
 * - 实际调用时通过防抖函数包装(500ms)
 * - 输入空值时不会触发查询
 * - 分页参数固定为查询最新/最相关结果
 * - 错误处理通过.finally确保加载状态重置
 */
function listOfWorkOrderNumbersSearch(val: string) {
  if (val) {
    fetching.value = true;
    fuzzyQueryOfWorkOrderNumbers({
      workSheetCode: val,
      isAsc: 2,
      pageNum: 1,
      pageSize: 200,
    })
      .then(({ results }: any) => {
        listOfWorkOrderNumbers.value = results;
      })
      .finally(() => {
        fetching.value = false;
      });
  }
}

/**
 * 防抖函数
 */
const listOfWorkOrderNumbersSearchThrottling = debounce(
  (value: string) => listOfWorkOrderNumbersSearch(value),
  500,
);

/**
 * 处理工单编号选择事件
 * 功能：同步工单关联的产品信息至表单
 * 流程：
 * 1. 从选中项获取产品名称和编码
 * 2. 更新表单的产品名称和物料编号字段
 *
 * @param _value - 选中的工单编号值（未使用）
 * @param _item - 选中项完整数据，包含工单关联产品信息
 *   - productName: 产品名称（来自接口返回字段）
 *   - productCode: 产品编码（作为物料编号使用）
 *
 * 数据来源：
 * 选项数据来自 fuzzyQueryOfWorkOrderNumbers 接口返回的工单列表
 *
 * 注意事项：
 * - 该函数由Select组件的@change事件触发
 * - 物料编号字段实际使用产品编码值
 * - 字段映射依赖接口数据结构，需与后端保持一致
 */
function workorderCodeChange(_value: any, _item: any) {
  params.value.product = _item.productName;
  params.value.materialCode = _item.productCode;
}

// endregion
// region 设备编号模糊查询
const listOfEquipmentNumbers = ref<any>([]);

/**
 * 设备编号模糊查询
 * 功能：根据输入值动态查询匹配的设备编号列表
 * 流程：
 * 1. 校验输入值有效性（非空校验）
 * 2. 设置加载状态为true
 * 3. 调用设备模糊查询接口获取结果
 * 4. 更新设备编号列表数据
 * 5. 重置加载状态
 *
 * @param val - 用户输入的设备编号关键词
 *
 * 接口说明：
 * fuzzyQueryOfEquipmentNumber - 设备编号模糊查询接口，接收参数：
 *   - equipmentCode: 设备编号关键词
 *   - pageNum: 固定第1页
 *   - pageSize: 固定每页200条
 *
 * 注意事项：
 * - 通过防抖函数包装调用(500ms)
 * - 空输入时不触发查询
 * - 分页参数固定确保返回最新数据
 * - 接口返回数据直接赋值到响应式列表
 * - 错误处理通过.finally保证状态重置
 */
function listOfEquipmentNumbersSearch(val: string) {
  if (val) {
    fetching.value = true;
    fuzzyQueryOfEquipmentNumber({
      equipmentCode: val,
      pageNum: 1,
      pageSize: 200,
    })
      .then((data: any) => {
        listOfEquipmentNumbers.value = data;
      })
      .finally(() => {
        fetching.value = false;
      });
  }
}

/**
 * 防抖函数
 */
const listOfEquipmentNumbersSearchThrottling = debounce(
  (value: string) => listOfEquipmentNumbersSearch(value),
  500,
);
// endregion
/**
 * 自动选择首条记录
 * 功能：在模糊查询结果中自动选择第一个选项提升用户体验
 * 流程：
 * 1. 根据类型判断要操作的列表数据
 * 2. 检查列表是否存在有效数据
 * 3. 存在数据时选取首条更新表单字段
 * 4. 无数据时延时递归尝试（最多3次）
 *
 * @param type - 选择类型：1-工单编号 2-设备编号
 * @param count - 当前递归次数（默认0，最大3）
 *
 * 使用场景：
 * 用户输入关键词后按回车时自动触发
 *
 * 注意事项：
 * - 递归机制确保接口异步返回数据后能正确选取
 * - 最大重试次数限制防止死循环
 * - 800ms延时为接口响应留出合理时间
 * - 仅作为辅助功能，不影响手动选择
 */
function choose(type: number, count: number = 0) {
  if (count <= 3) {
    switch (type) {
      case 1: {
        if (listOfWorkOrderNumbers.value.length > 0) {
          const item = listOfWorkOrderNumbers.value[0];
          params.value.workorderCode = item.workSheetCode;
          workorderCodeChange(item.workSheetCode, item);
        } else {
          setTimeout(() => {
            choose(type, count + 1);
          }, 800);
        }
        break;
      }
      case 2: {
        if (listOfEquipmentNumbers.value.length > 0) {
          const item = listOfEquipmentNumbers.value[0];
          params.value.equipCode = item.equipmentCode;
        } else {
          setTimeout(() => {
            choose(type, count + 1);
          }, 800);
        }
        break;
      }
    }
  }
}

/**
 * 查询并初始化表单数据
 * 功能：获取指定位置的缓存数据初始化表单
 * 流程：
 * 1. 调用缓存查询接口获取历史数据
 * 2. 处理接口返回数据：
 *   - 清除数据ID防止误操作
 *   - 转换图片路径为上传组件所需格式
 *   - 更新全局表单数据
 *
 * @param place - 数据位置标识（来自组件props）
 *
 * 接口说明：
 * displayCache - 缓存查询接口
 * 参数：{ place: number } 位置标识
 * 返回数据结构包含：
 *   - photo: 图片URL路径
 *   - 其他表单字段数据
 *
 * 注意事项：
 * - place参数通常对应页面不同区块（如1-呼叫区域，2-处理区域）
 * - 图片数据会转换为ant-design-vue Upload组件需要的格式
 * - id置空避免提交时携带旧ID导致错误
 */
function queryData(place: number) {
  displayCache({
    place,
  }).then((data: any) => {
    if (data) {
      data.id = undefined;
      if (data.photo) {
        uploadFile.value = [
          {
            uid: '-1',
            name: 'img.png',
            status: 'done',
            url: data.photo,
            response: {
              data: data.photo,
            },
          },
        ];
      }
      params.value = data;
    }
  });
}

// region 暴露方法

/**
 * 获取表单数据并校验
 * 功能：收集表单数据并执行必填项校验
 * 流程：
 * 1. 获取上传文件路径（取第一个文件的响应数据）
 * 2. 定义必填字段数组及其对应的国际化标签
 * 3. 遍历必填字段进行空值校验：
 *   - 发现空值时显示错误提示
 *   - 标记校验失败状态
 * 4. 校验失败时抛出异常，成功则返回表单数据
 *
 * 返回数据结构：
 * {
 *   ...表单字段,
 *   photo: 文件路径,
 *   place: 组件位置标识
 * }
 *
 * 注意事项：
 * - 必填字段顺序对应国际化提示顺序（设备编号->异常类型->具体问题）
 * - 上传文件处理仅取第一个文件的响应数据
 * - 错误提示使用$t实现国际化，依赖语言包对应键值
 * - 抛出异常会中断后续提交流程，需外层try/catch处理
 */
const getValue = () => {
  let filePath = '';
  if (uploadFile.value.length > 0) {
    filePath = uploadFile.value[0].response.data;
  }
  const requiredFields = ['equipCode', 'andonErrorType'];
  if (props.place !== 1) {
    requiredFields.push('andonErrorCode');
  }
  const requiredFieldsLabels = [
    'equipmentNumber',
    'exceptionType',
    'specificQuestions',
  ];
  let isError = false;
  for (let i = 0, size = requiredFields.length; i < size; i++) {
    if (!params.value[requiredFields[i] as string]) {
      message.error(
        `${$t('andon.pleaseCompleteTheRequiredFields')}--${$t(`andon.${requiredFieldsLabels[i]}`)}`,
      );
      isError = true;
    }
  }
  if (isError) {
    throw new Error($t('andon.pleaseCompleteTheRequiredFields'));
  } else {
    return {
      ...params.value,
      photo: filePath,
      place: props.place,
    };
  }
};

/**
 * 重置
 */
const reset = () => {
  params.value = {
    // 工单编号
    workorderCode: props.worksheetCode,
    // 设备编号
    equipCode: props.equipCode,
    // 产品名称
    product: props.productCode,
    // 物料编号
    materialCode: props.productName,
    // 工序
    process: '',
    // 位置
    location: '',
    // 描述
    handleData: '',
    // 任务来源
    source: 1,
    exigency: 1,
    andonErrorType: 1,
  };
  uploadFile.value = [];
};

defineExpose({
  getValue,
  reset,
});
// endregion

onMounted(() => {
  if (props.worksheetCode) {
    params.value.workorderCode = props.worksheetCode;
  }
  if (props.equipCode) {
    params.value.equipCode = props.equipCode;
  }
  if (props.productCode) {
    params.value.product = props.productCode;
  }
  if (props.productName) {
    params.value.materialCode = props.productName;
  }
  queryError();
  queryData(props.place);
});
</script>

<template>
  <Descriptions bordered :column="2">
    <!-- 工单编号 -->
    <DescriptionsItem :label="$t('andon.workOrderNumber')">
      <template v-if="type === 1">
        <div class="flex">
          <Select
            v-model:value="params.workorderCode"
            show-search
            placeholder="input search text"
            style="width: 200px"
            :default-active-first-option="false"
            :show-arrow="false"
            :filter-option="false"
            :field-names="{ label: 'workSheetCode', value: 'workSheetCode' }"
            :not-found-content="fetching ? undefined : null"
            :options="listOfWorkOrderNumbers"
            @search="listOfWorkOrderNumbersSearchThrottling"
            @change="workorderCodeChange"
            @keydown.enter="choose(1)"
            class="!w-full"
          >
            <template v-if="fetching" #notFoundContent>
              <Spin size="small" />
            </template>
          </Select>
          <ScanTheCode
            @scan-the-code="
              (val) => {
                params.workorderCode = val;
                listOfWorkOrderNumbersSearchThrottling(val);
                choose(1);
              }
            "
          />
        </div>
      </template>
      <template v-else>
        {{ params.workorderCode }}
      </template>
    </DescriptionsItem>
    <!-- 设备编号 -->
    <DescriptionsItem :label="$t('andon.equipmentNumber')" class="required">
      <!--      <template v-if="type === 1">

      </template>
      <template v-else>{{ params.equipCode }}</template>-->
      <div class="flex">
        <Select
          v-model:value="params.equipCode"
          show-search
          placeholder="input search text"
          style="width: 200px"
          :default-active-first-option="false"
          :show-arrow="false"
          :filter-option="false"
          :field-names="{ label: 'equipmentName', value: 'equipmentCode' }"
          :not-found-content="fetching ? undefined : null"
          :options="listOfEquipmentNumbers"
          @search="listOfEquipmentNumbersSearchThrottling"
          @keydown.enter="choose(2)"
          class="!w-full"
        >
          <template v-if="fetching" #notFoundContent>
            <Spin size="small" />
          </template>
        </Select>
        <ScanTheCode
          @scan-the-code="
            (val) => {
              params.equipCode = val;
              listOfEquipmentNumbersSearchThrottling(val);
              choose(2);
            }
          "
        />
      </div>
    </DescriptionsItem>
    <!-- 产品名称 -->
    <DescriptionsItem :label="$t('andon.productName')">
      <Input v-model:value="params.product" readonly />
    </DescriptionsItem>
    <!-- 物料编号 -->
    <DescriptionsItem :label="$t('andon.materialNumber')">
      <Input v-model:value="params.materialCode" readonly />
    </DescriptionsItem>
    <!-- 紧急程度 -->
    <DescriptionsItem :label="$t('andon.degreeOfUrgency')">
      <RadioGroup v-model:value="params.exigency" :options="degreeOfUrgency" />
    </DescriptionsItem>
    <!-- 位置 -->
    <DescriptionsItem :label="$t('andon.position')">
      <div class="flex">
        <Input
          v-model:value="params.location"
          :placeholder="$t('andon.inputPrompt')"
        />
        <ScanTheCode
          @scan-the-code="
            (val) => {
              params.location = val;
            }
          "
        />
      </div>
    </DescriptionsItem>
    <!-- 异常类型 -->
    <DescriptionsItem :label="$t('andon.exceptionType')" class="required">
      <Select
        v-model:value="params.andonErrorType"
        :options="exceptionType"
        class="min-w-32"
      />
    </DescriptionsItem>
    <!-- 具体问题 -->
    <DescriptionsItem
      :label="$t('andon.specificQuestions')"
      v-if="place !== 1"
      class="required"
    >
      <Select
        v-model:value="params.andonErrorCode"
        show-search
        style="width: 300px"
        :options="errorTypes"
        :filter-option="filterOption"
      />
    </DescriptionsItem>
    <!-- 异常图片 -->
    <DescriptionsItem :label="$t('andon.abnormalPicture')" v-if="place !== 1">
      <Upload
        v-model:file-list="uploadFile"
        :action="getUploadUrl()"
        list-type="picture-card"
        name="photo"
        :headers="{ Authorization: `${accessStore.accessToken}` }"
      >
        <div v-if="uploadFile.length === 0">
          <PlusOutlined />
          <div style="margin-top: 8px">Upload</div>
        </div>
      </Upload>
    </DescriptionsItem>
    <!-- 描述 -->
    <DescriptionsItem :label="$t('andon.description')">
      <Textarea v-model:value="params.handleData" :rows="4" />
    </DescriptionsItem>
  </Descriptions>
</template>

<style scoped>
:deep(.required) {
  &.ant-descriptions-item-label span {
    &::before {
      color: #f5222d;
      content: ' *';
    }
  }
}
</style>
