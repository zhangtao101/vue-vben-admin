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
 * 查询异常列表
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
  return option.label.toLowerCase().includes(input.toLowerCase());
};
// endregion

// region 文件上传

// 文件上传列表
const uploadFile = ref<any>([]);

function getUploadUrl() {
  return `/ht/${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/handle/upload`;
}

// endregion

// region 工单编号模糊查询
const listOfWorkOrderNumbers = ref<any>([]);
const fetching = ref(false);

/**
 * 模糊查询工单编号
 * @param val
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
 * 选择工单编号
 * @param _value 选中的值
 * @param _item  选中的项
 */
function workorderCodeChange(_value: any, _item: any) {
  params.value.product = _item.productName;
  params.value.materialCode = _item.productCode;
}
// endregion
// region 设备编号模糊查询
const listOfEquipmentNumbers = ref<any>([]);

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
 * 选择第一个
 * @param type 1: 工单编号 2: 设备编号
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
 * 查询数据
 * @param place
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

const getValue = () => {
  let filePath = '';
  if (uploadFile.value.length > 0) {
    filePath = uploadFile.value[0].response.data;
  }
  const requiredFields = ['equipCode', 'andonErrorType', 'andonErrorCode'];
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
      <Input
        v-model:value="params.location"
        :placeholder="$t('andon.inputPrompt')"
      />
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
