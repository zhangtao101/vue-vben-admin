<script lang="ts" setup>
import { onMounted, ref } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import { $t } from '@vben/locales';
import { useAccessStore } from '@vben/stores';

import {
  Button,
  Cascader,
  CheckboxGroup,
  DatePicker,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  RadioGroup,
  Select,
  Space,
  Textarea,
  Upload,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  acceptanceInsert,
  acceptanceUpdate,
  confirmUpdate,
  implementationInsert,
  implementationUpdate,
  listSysPerson,
  listWordListByParentCode,
  queryOrganizationTree,
  rectificationInsert,
  rectificationUpdate,
} from '#/api';
import { flattenTree } from '#/util';

/**
 * 事件
 */
const emits = defineEmits(['close', 'showLog']);

// region 抽屉基本信息
/**
 * 表单对象
 */
const formState = ref<any>({});
const formRef = ref<any>();
/**
 * 状态
 */
const itemState = ref(1);
/**
 * 是否显示抽屉
 */
const isShow = ref(false);
/**
 * 严重程度
 */
const seriousProcedures = ref<any>([]);
/**
 * report编号
 */
const reportCode = ref<any>('');

/**
 * 打开抽屉
 * @param editItem 编辑项
 * @param state 状态
 */
function showDrawer(editItem: any, state: number, code: string) {
  isShow.value = true;
  formState.value = {
    ...editItem,
  };
  itemState.value = state;
  reportCode.value = code;

  switch (state) {
    case 1: {
      listWordListByParentCode('YZCD').then((data) => {
        seriousProcedures.value = [];
        data.forEach((item: any) => {
          seriousProcedures.value.push({
            label: item.wordName,
            value: item.wordName,
          });
        });
      });

      if (formState.value.responsibleDepart) {
        userChecked.value = [
          formState.value.responsibleDepart,
          formState.value.responsibleUser,
        ];
      }

      break;
    }
    case 2: {
      if (formState.value.rectificationUser) {
        userChecked.value = ['', formState.value.rectificationUser];
      }
      if (formState.value.rectificationDeadline) {
        formState.value.rectificationDeadline = dayjs(
          formState.value.rectificationDeadline,
        );
      }
      if (formState.value.inspectionDeadline) {
        formState.value.inspectionDeadline = dayjs(
          formState.value.inspectionDeadline,
        );
      }

      if (editItem.fileList && editItem.fileList.length > 0) {
        uploadFile.value = [];
        editItem.fileList.forEach((item: any) => {
          const regex = /[^/]+$/;
          const fileName = item ? item.match(regex)[0] : '';
          uploadFile.value.push({
            url: item,
            status: 'done',
            name: fileName,
            response: {
              data: item,
            },
          });
        });
      }

      break;
    }
    case 3: {
      if (formState.value.rectificationDate) {
        formState.value.rectificationDate = dayjs(
          formState.value.rectificationDate,
        );
      }
      if (
        editItem.rectificationFileList &&
        editItem.rectificationFileList.length > 0
      ) {
        uploadFile.value = [];
        editItem.rectificationFileList.forEach((item: any) => {
          const regex = /[^/]+$/;
          const fileName = item ? item.match(regex)[0] : '';
          uploadFile.value.push({
            url: item,
            status: 'done',
            name: fileName,
            response: {
              data: item,
            },
          });
        });
      }
      if (
        editItem.rectificationPhotoList &&
        editItem.rectificationPhotoList.length > 0
      ) {
        photoFiles.value = [];
        editItem.rectificationPhotoList.forEach((item: any) => {
          const regex = /[^/]+$/;
          const fileName = item ? item.match(regex)[0] : '';
          photoFiles.value.push({
            url: item,
            status: 'done',
            name: fileName,
            response: {
              data: item,
            },
          });
        });
      }

      break;
    }
    case 4: {
      if (formState.value.acceptanceTime) {
        formState.value.acceptanceTime = dayjs(formState.value.acceptanceTime);
      }
    }
    // No default
  }
}

/**
 * 关闭抽屉
 */
function close() {
  isShow.value = false;
  formState.value = {};
  itemState.value = 1;
  uploadFile.value = [];
  photoFiles.value = [];
  userChecked.value = [];
}

/**
 * 获取标题
 */
function getTitle() {
  switch (itemState.value) {
    case 1: {
      return $t('hiddenDangerRectification.hiddenDangerIdentification');
    }
    case 2: {
      return $t('hiddenDangerRectification.rectificationOfHiddenDangers');
    }
    case 3: {
      return $t('hiddenDangerRectification.rectificationMeasures');
    }
    case 4: {
      return $t('hiddenDangerRectification.verificationPeriod');
    }
    default: {
      return '';
    }
  }
}
// endregion

// region 提交
// 原因列表
const sourceType = ref([
  {
    label: '人',
    value: '人',
  },
  {
    label: '物',
    value: '物',
  },
  {
    label: '环',
    value: '环',
  },
  {
    label: '管',
    value: '管',
  },
]);
// 加载状态
const submitLoading = ref(false);

function submit() {
  formRef.value.validate().then(() => {
    submitLoading.value = true;
    let ob: any;
    const params = {
      ...formState.value,
      reportCode: reportCode.value,
    };

    switch (itemState.value) {
      case 1: {
        ob = confirmUpdate(params);
        // ob = formState.value.id ? confirmUpdate(params) : confirmInsert(params);
        break;
      }
      case 2: {
        if (params.inspectionDeadline) {
          params.inspectionDeadline = params.inspectionDeadline.format(
            'YYYY-MM-DD HH:mm:ss',
          );
        }
        if (params.rectificationDeadline) {
          params.rectificationDeadline = params.rectificationDeadline.format(
            'YYYY-MM-DD HH:mm:ss',
          );
        }
        if (uploadFile.value) {
          params.fileList = [];
          uploadFile.value.forEach((item: any) => {
            params.fileList.push(item.response.data);
          });
        }
        ob = formState.value.id
          ? rectificationUpdate(params)
          : rectificationInsert(params);
        break;
      }
      case 3: {
        if (params.rectificationDate) {
          params.rectificationDate = params.rectificationDate.format(
            'YYYY-MM-DD HH:mm:ss',
          );
        }
        if (uploadFile.value) {
          params.rectificationFileList = [];
          uploadFile.value.forEach((item: any) => {
            params.rectificationFileList.push(item.response.data);
          });
        }
        if (photoFiles.value) {
          params.rectificationPhotoList = [];
          photoFiles.value.forEach((item: any) => {
            params.rectificationPhotoList.push(item.response.data);
          });
        }
        ob = formState.value.id
          ? implementationUpdate(params)
          : implementationInsert(params);
        break;
      }

      case 4: {
        if (params.acceptanceTime) {
          params.acceptanceTime = params.acceptanceTime.format(
            'YYYY-MM-DD HH:mm:ss',
          );
        }

        ob = ob = formState.value.id
          ? acceptanceUpdate(params)
          : acceptanceInsert(params);
      }
    }

    ob.then(() => {
      message.success($t('common.successfulOperation'));
      close();
      emits('close');
    }).finally(() => {
      submitLoading.value = false;
    });
  });
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
          value: item.orgCode,
          isLeaf: false,
        });
      });
    }
  });
}

// endregion

// region 用户查询
const userChecked = ref<any>([]);

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
    switch (itemState.value) {
      case 1: {
        formState.value.responsibleUser = item[1].perName;
        formState.value.responsibleDepart = item[0].label;
        return;
      }
      case 2: {
        formState.value.rectificationUser = item[1].perName;
        return;
      }
      case 3: {
        return $t('hiddenDangerRectification.rectificationMeasures');
      }
      case 4: {
        return $t('hiddenDangerRectification.verificationPeriod');
      }
      default: {
        return '';
      }
    }
  }
}

// endregion

// region 文件上传
const accessStore = useAccessStore();
// 文件上传列表
const uploadFile = ref<any>([]);
// 照片列表
const photoFiles = ref<any>([]);

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

// region 显示日志

/**
 * 显示日志
 */
function showLogs() {
  emits('showLog', {
    reportCode: reportCode.value,
  });
}

// endregion

// region 暴露方法

/**
 * 暴露 `displayPersonnelOperation` 方法，供父组件调用以显示人员操作抽屉
 */
defineExpose({
  open: showDrawer,
});

// endregion

onMounted(() => {
  queryAllOrganizations();
});
</script>

<template>
  <Drawer
    v-model:open="isShow"
    :footer-style="{ textAlign: 'right' }"
    :width="600"
    class="custom-class"
    placement="right"
    :title="getTitle()"
    @close="close"
  >
    <Form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
    >
      <template v-if="itemState === 1">
        <!-- 隐患专业 -->
        <FormItem
          :label="$t('hiddenDangerRectification.HiddenDangerSpecialty')"
          name="hazardSpecialty"
          :rules="[{ required: true, message: '请输入' }]"
        >
          <Input v-model:value="formState.hazardSpecialty" />
        </FormItem>
        <!-- 严重程度 -->
        <FormItem
          :label="$t('hiddenDangerRectification.Severity')"
          name="severityLevel"
          :rules="[{ required: true, message: '请输入' }]"
        >
          <Select
            v-model:value="formState.severityLevel"
            :options="seriousProcedures"
          />
        </FormItem>
        <!-- 责任人 -->
        <FormItem
          :label="$t('hiddenDangerRectification.ResponsiblePerson')"
          name="responsibleUser"
          :rules="[{ required: true, message: '请输入' }]"
        >
          <Cascader
            v-model:value="userChecked"
            :options="treeData"
            :load-data="userSearch"
            @change="userChange"
            change-on-select
            class="w-full"
          />
        </FormItem>
      </template>
      <!-- 隐患整改 -->
      <template v-if="itemState === 2">
        <!-- 原因分析 -->
        <FormItem
          :label="$t('hiddenDangerRectification.causeAnalysis')"
          name="sourceList"
          :rules="[{ required: true, message: '请输入' }]"
        >
          <CheckboxGroup
            v-model:value="formState.sourceList"
            :options="sourceType"
          />
        </FormItem>
        <!-- 备注 -->
        <FormItem
          :label="$t('hiddenDangerRectification.remark')"
          name="remark"
          :rules="[{ required: true, message: '请输入' }]"
        >
          <Input v-model:value="formState.remark" />
        </FormItem>
        <!-- 整改人 -->
        <FormItem
          :label="$t('hiddenDangerRectification.ResponsiblePerson')"
          name="rectificationUser"
          :rules="[{ required: true, message: '请输入' }]"
        >
          <Cascader
            v-model:value="userChecked"
            :options="treeData"
            :load-data="userSearch"
            @change="userChange"
            change-on-select
            class="w-full"
          />
        </FormItem>
        <!-- 整改措施  -->
        <FormItem
          :label="$t('hiddenDangerRectification.rectificationMeasures')"
          name="rectificationMeasure"
          :rules="[{ required: true, message: '请输入' }]"
        >
          <Input v-model:value="formState.rectificationMeasure" />
        </FormItem>
        <!-- 预计整改费用  -->
        <FormItem
          :label="$t('hiddenDangerRectification.estimatedRectificationCost')"
          name="rectificationCosts"
          :rules="[{ required: true, message: '请输入' }]"
        >
          <InputNumber
            v-model:value="formState.rectificationCosts"
            addon-after="元"
          />
        </FormItem>
        <!-- 整改期限  -->
        <FormItem
          :label="$t('hiddenDangerRectification.rectificationTerm')"
          name="rectificationDeadline"
          :rules="[{ required: true, message: '请输入' }]"
        >
          <DatePicker v-model:value="formState.rectificationDeadline" />
        </FormItem>
        <!-- 验证期限  -->
        <FormItem
          :label="$t('hiddenDangerRectification.verificationPeriod')"
          name="inspectionDeadline"
          :rules="[{ required: true, message: '请输入' }]"
        >
          <DatePicker v-model:value="formState.inspectionDeadline" />
        </FormItem>
        <!-- 整改方案附件   -->
        <FormItem
          :label="$t('hiddenDangerRectification.rectificationSchemeAttachment')"
        >
          <Upload
            v-model:file-list="uploadFile"
            name="file"
            :multiple="true"
            :action="getUploadUrl()"
            :headers="{ Authorization: `${accessStore.accessToken}` }"
          >
            <Button>
              <Icon
                icon="mdi:cloud-upload"
                class="inline-block align-middle text-xl text-[#5085ff]"
              />
              {{ $t('common.upload') }}
            </Button>
          </Upload>
        </FormItem>
      </template>

      <!-- 隐患整改实施 -->
      <template v-if="itemState === 3">
        <!-- 整改情况 -->
        <FormItem
          :label="$t('hiddenDangerRectification.rectificationSituation')"
          name="rectificationStatus"
          :rules="[{ required: true, message: '请输入' }]"
        >
          <Input v-model:value="formState.rectificationStatus" />
        </FormItem>
        <!-- 实际整改时间 -->
        <FormItem
          :label="$t('hiddenDangerRectification.actualRectificationDate')"
          name="rectificationDate"
          :rules="[{ required: true, message: '请输入' }]"
        >
          <DatePicker v-model:value="formState.rectificationDate" />
        </FormItem>
        <!-- 实际整改花费 -->
        <FormItem
          :label="$t('hiddenDangerRectification.actualRectificationCost')"
          name="rectificationAmount"
          :rules="[{ required: true, message: '请输入' }]"
        >
          <InputNumber
            v-model:value="formState.rectificationAmount"
            addon-after="元"
          />
        </FormItem>

        <!-- 整改后材料   -->
        <FormItem
          :label="$t('hiddenDangerRectification.rectificationAfterFile')"
        >
          <Upload
            v-model:file-list="uploadFile"
            name="file"
            :multiple="true"
            :action="getUploadUrl()"
            :headers="{ Authorization: `${accessStore.accessToken}` }"
          >
            <Button>
              <Icon
                icon="mdi:cloud-upload"
                class="inline-block align-middle text-xl text-[#5085ff]"
              />
              {{ $t('common.upload') }}
            </Button>
          </Upload>
        </FormItem>

        <!-- 整改后照片   -->
        <FormItem
          :label="$t('hiddenDangerRectification.rectificationAfterPhoto')"
        >
          <Upload
            v-model:file-list="photoFiles"
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
        </FormItem>
      </template>

      <!-- 验收 -->
      <template v-if="itemState === 4">
        <!-- 是否合格  -->
        <FormItem
          :label="$t('hiddenDangerRectification.results')"
          name="isQualified"
          :rules="[{ required: true, message: '请输入' }]"
        >
          <RadioGroup v-model:value="formState.isQualified">
            <Radio :value="1">
              {{ $t('hiddenDangerRectification.qualified') }}
            </Radio>
            <Radio :value="0">
              {{ $t('hiddenDangerRectification.notQualified') }}
            </Radio>
          </RadioGroup>
        </FormItem>
        <!-- 详情  -->
        <FormItem
          :label="$t('hiddenDangerRectification.details')"
          name="detail"
          :rules="[{ required: true, message: '请输入' }]"
        >
          <Textarea v-model:value="formState.detail" />
        </FormItem>
        <!-- 验收时间  -->
        <FormItem
          :label="$t('hiddenDangerRectification.acceptanceTime')"
          name="acceptanceTime"
          :rules="[{ required: true, message: '请输入' }]"
        >
          <DatePicker v-model:value="formState.acceptanceTime" />
        </FormItem>
      </template>

      <FormItem :wrapper-col="{ offset: 6, span: 18 }">
        <Button type="primary" @click="showLogs" class="w-full">
          {{ $t('hiddenDangerRectification.log') }}
        </Button>
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <!-- 取消 -->
        <Button @click="close">
          {{ $t('common.cancel') }}
        </Button>
        <!-- 确认 -->
        <Button type="primary" @click="submit()">
          {{ $t('common.confirm') }}
        </Button>
      </Space>
    </template>
  </Drawer>

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
</template>

<style scoped></style>
