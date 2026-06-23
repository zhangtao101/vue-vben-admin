<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue、dayjs、表单组件
 * [OUTPUT]: 对外提供报修申请页面组件，含设备信息填写、报修信息填写、图片上传、提交报修功能
 * [POS]: 维修维护模块 的报修入口页面，供用户提交设备维修申请
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-20 15:13:00
 */
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Radio,
  RadioGroup,
  Row,
  Space,
  Textarea,
  Upload,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { $t } from '#/locales';

// 图片上传地址
/** 故障图片上传接口地址 */
const uploadUrl = `/ht/${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/common/file/upload/maintenance-image`;

// 表单初始值
/** 表单数据初始值 */
const initFormData = {
  // 设备信息
  equipmentCode: '',
  equipmentName: '',
  equipmentType: '',
  workshop: '',
  // 报修信息
  repairType: undefined,
  relatedTask: undefined,
  faultTime: dayjs(),
  faultDescription: '',
  urgencyLevel: 'NORMAL',
  faultParts: '',
};

// 表单数据
/** 当前表单数据对象 */
const formData = ref<any>({ ...initFormData });

// 报修类型选项
/** 报修类型下拉/单选选项列表 */
const repairTypeOptions = [
  { value: 'RT_EMERGENCY_STOP', label: $t('repair.repairOrder.emergencyStop') },
  { value: 'RT_EMERGENCY_NONSTOP', label: $t('repair.repairOrder.emergencyNonstop') },
  { value: 'RT_PREVENTIVE', label: $t('repair.repairOrder.preventive') },
  { value: 'RT_INSPECTION', label: $t('repair.repairOrder.inspection') },
  { value: 'RT_ANDON', label: $t('repair.repairOrder.andon') },
  { value: 'RT_OTHER', label: $t('repair.repairOrder.other') },
];

// 紧急程度选项
/** 紧急程度下拉/单选选项列表 */
const urgencyOptions = [
  { value: 'NORMAL', label: $t('repair.repairOrder.normal') },
  { value: 'URGENT', label: $t('repair.repairOrder.urgent') },
  { value: 'CRITICAL', label: $t('repair.repairOrder.critical') },
];

// 提交加载状态
/** 提交按钮加载状态，防止重复提交 */
const submitLoading = ref(false);

// 图片上传相关
/** 已上传的图片列表 */
const imageList = ref<any[]>([]);
/** 图片预览弹窗显示状态 */
const previewVisible = ref(false);
/** 当前预览的图片地址 */
const previewImage = ref('');

/**
 * 处理图片预览。
 * @param {any} file - 要预览的文件对象。
 * @returns {void} 无返回值，打开预览弹窗。
 * @since 2026-04-20 15:13:00
 */
function handlePreview(file: any) {
  previewImage.value = file.url || file.response?.data?.url || '';
  previewVisible.value = true;
}

/**
 * 表单验证函数，校验必填项。
 * @returns {Promise<boolean>} 验证通过返回 true，否则返回 false。
 * @since 2026-04-20 15:13:00
 */
function validateForm(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!formData.value.equipmentCode) {
      message.error($t('repair.repairRequest.equipmentCodeRequired'));
      resolve(false);
      return;
    }
    if (!formData.value.repairType) {
      message.error($t('repair.repairRequest.repairTypeRequired'));
      resolve(false);
      return;
    }
    if (!formData.value.faultTime) {
      message.error($t('repair.repairRequest.faultTimeRequired'));
      resolve(false);
      return;
    }
    if (!formData.value.faultDescription) {
      message.error($t('repair.repairRequest.faultDescriptionRequired'));
      resolve(false);
      return;
    }
    if (!formData.value.urgencyLevel) {
      message.error($t('repair.repairRequest.urgentLevelRequired'));
      resolve(false);
      return;
    }

    const needRelatedTask = [
      'RT_PREVENTIVE',
      'RT_INSPECTION',
      'RT_MAINTENANCE',
    ];
    if (
      needRelatedTask.includes(formData.value.repairType) &&
      !formData.value.relatedTask
    ) {
      message.error($t('repair.repairRequest.linkedTaskRequired'));
      resolve(false);
      return;
    }

    resolve(true);
  });
}

/**
 * 处理提交报修表单。
 * @returns {void} 无返回值，验证通过后提交数据。
 * @since 2026-04-20 15:13:00
 */
function handleSubmit() {
  validateForm().then((isValid) => {
    if (!isValid) {
      return;
    }

    submitLoading.value = true;

    // 获取图片URL列表
    const imageUrls = imageList.value
      .filter((img) => img.response?.data?.url || img.url)
      .map((img) => img.response?.data?.url || img.url);

    const params = {
      equipmentCode: formData.value.equipmentCode,
      equipmentName: formData.value.equipmentName,
      equipmentType: formData.value.equipmentType,
      workshop: formData.value.workshop,
      repairType: formData.value.repairType,
      relatedTaskId: formData.value.relatedTask,
      faultTime: formData.value.faultTime.format('YYYY-MM-DD HH:mm:ss'),
      faultDescription: formData.value.faultDescription,
      urgencyLevel: formData.value.urgencyLevel,
      faultParts: formData.value.faultParts,
      faultImages: imageUrls,
    };

    console.warn('提交参数:', params);
    // TODO: 调用接口
    // submitRepairRequest(params).then(() => {...})

    message.success($t('repair.repairRequest.apiNotReady'));
    submitLoading.value = false;
  });
}

/**
 * 处理重置表单按钮点击，弹出确认框后重置表单数据。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:13:00
 */
function handleReset() {
  Modal.confirm({
    title: $t('common.prompt'),
    content: $t('repair.repairRequest.resetFormConfirm'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () => {
      formData.value = { ...initFormData };
      imageList.value = [];
    },
  });
}
</script>

<template>
  <Page>
    <Card :title="$t('repair.repairRequest.repairRequestTitle')">
      <Form layout="vertical">
        <!-- 设备信息 -->
        <Row :gutter="16">
          <Col :span="12">
            <FormItem :label="$t('repair.repairRequest.equipmentCode')" required>
              <Input
                v-model:value="formData.equipmentCode"
                :placeholder="$t('repair.repairRequest.scanOrEnterCode')"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem :label="$t('repair.repairTask.equipmentName')">
              <Input
                :value="formData.equipmentName"
                disabled
                :placeholder="$t('repair.repairRequest.autoFill')"
              />
            </FormItem>
          </Col>
        </Row>

        <Row :gutter="16">
          <Col :span="12">
            <FormItem :label="$t('repair.repairRequest.equipmentType')">
              <Input
                :value="formData.equipmentType"
                disabled
                :placeholder="$t('repair.repairRequest.autoFill')"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem :label="$t('repair.repairRequest.workshop')">
              <Input
                :value="formData.workshop"
                disabled
                :placeholder="$t('repair.repairRequest.autoFill')"
              />
            </FormItem>
          </Col>
        </Row>

        <!-- 报修信息 -->
        <Row :gutter="16">
          <Col :span="24">
            <FormItem :label="$t('repair.repairOrder.repairType')" required>
              <RadioGroup v-model:value="formData.repairType">
                <Space wrap>
                  <Radio
                    v-for="item in repairTypeOptions"
                    :key="item.value"
                    :value="item.value"
                  >
                    {{ item.label }}
                  </Radio>
                </Space>
              </RadioGroup>
            </FormItem>
          </Col>
        </Row>

        <Row :gutter="16">
          <Col :span="12">
            <FormItem :label="$t('repair.repairRequest.linkedTask')">
              <Input
                v-model:value="formData.relatedTask"
                :placeholder="$t('repair.repairRequest.linkedTaskPlaceholder')"
                disabled
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem :label="$t('repair.repairRequest.faultTime')" required>
              <DatePicker
                v-model:value="formData.faultTime"
                show-time
                format="YYYY-MM-DD HH:mm"
                style="width: 100%"
              />
            </FormItem>
          </Col>
        </Row>

        <Row :gutter="16">
          <Col :span="24">
            <FormItem :label="$t('repair.repairOrder.urgentLevel')" required>
              <RadioGroup v-model:value="formData.urgencyLevel">
                <Space>
                  <Radio
                    v-for="item in urgencyOptions"
                    :key="item.value"
                    :value="item.value"
                  >
                    {{ item.label }}
                  </Radio>
                </Space>
              </RadioGroup>
            </FormItem>
          </Col>
        </Row>

        <Row :gutter="16">
          <Col :span="24">
            <FormItem :label="$t('repair.repairRequest.faultDescription')" required>
              <Textarea
                v-model:value="formData.faultDescription"
                :placeholder="$t('repair.repairRequest.faultDescriptionPlaceholder')"
                :rows="3"
              />
            </FormItem>
          </Col>
        </Row>

        <!-- 故障部位 -->
        <Row :gutter="16">
          <Col :span="24">
            <FormItem :label="$t('repair.repairRequest.faultLocation')">
              <Textarea
                v-model:value="formData.faultParts"
                :placeholder="$t('repair.repairRequest.faultLocationPlaceholder')"
                :rows="2"
              />
            </FormItem>
          </Col>
        </Row>

        <!-- 故障图片 -->
        <Row :gutter="16">
          <Col :span="24">
            <FormItem :label="$t('repair.repairRequest.faultImage')">
              <Upload
                v-model:file-list="imageList"
                :action="uploadUrl"
                name="file"
                list-type="picture-card"
                :max-count="9"
                accept="image/*"
                @preview="handlePreview"
              >
                <div>
                  <Icon class="text-2xl" icon="mdi:image-plus-outline" />
                  <div class="mt-1">{{ $t('repair.repairRequest.uploadImage') }}</div>
                </div>
              </Upload>
              <Modal
                :open="previewVisible"
                :footer="null"
                @cancel="previewVisible = false"
              >
                <Image :src="previewImage" style="width: 100%" />
              </Modal>
            </FormItem>
          </Col>
        </Row>

        <!-- 操作按钮 -->
        <Row :gutter="16">
          <Col :span="24">
            <div class="flex justify-center gap-4">
              <Button size="large" @click="handleReset">
                <Icon class="mr-1" icon="mdi:refresh" />
                {{ $t('common.reset') }}
              </Button>
              <Button
                type="primary"
                size="large"
                :loading="submitLoading"
                @click="handleSubmit"
              >
                <Icon class="mr-1" icon="mdi:check" />
                {{ $t('repair.repairRequest.submitRepair') }}
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </Card>
  </Page>
</template>

<style scoped>
:deep(.row-edit .vxe-body--row) {
  background-color: #fafafa;
}
</style>
