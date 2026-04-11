<script lang="ts" setup>
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

// 图片上传地址
const uploadUrl = `/ht/${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/common/file/upload/maintenance-image`;

// 表单初始值
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
const formData = ref<any>({ ...initFormData });

// 报修类型选项
const repairTypeOptions = [
  { value: 'RT_EMERGENCY_STOP', label: '应急维修(停机)' },
  { value: 'RT_EMERGENCY_NONSTOP', label: '应急维修(非停机)' },
  { value: 'RT_PREVENTIVE', label: '预防性维护' },
  { value: 'RT_INSPECTION', label: '点巡检' },
  { value: 'RT_ANDON', label: '安灯呼叫' },
  { value: 'RT_OTHER', label: '其他工单' },
];

// 紧急程度选项
const urgencyOptions = [
  { value: 'NORMAL', label: '一般' },
  { value: 'URGENT', label: '紧急' },
  { value: 'CRITICAL', label: '特急' },
];

// 提交加载状态
const submitLoading = ref(false);

// 图片上传相关
const imageList = ref<any[]>([]);
const previewVisible = ref(false);
const previewImage = ref('');

function handlePreview(file: any) {
  previewImage.value = file.url || file.response?.data?.url || '';
  previewVisible.value = true;
}

// 表单验证
function validateForm(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!formData.value.equipmentCode) {
      message.error('请输入设备编码');
      resolve(false);
      return;
    }
    if (!formData.value.repairType) {
      message.error('请选择报修类型');
      resolve(false);
      return;
    }
    if (!formData.value.faultTime) {
      message.error('请选择故障时间');
      resolve(false);
      return;
    }
    if (!formData.value.faultDescription) {
      message.error('请输入故障描述');
      resolve(false);
      return;
    }
    if (!formData.value.urgencyLevel) {
      message.error('请选择紧急程度');
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
      message.error('请选择关联任务');
      resolve(false);
      return;
    }

    resolve(true);
  });
}

// 提交报修
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

    console.log('提交参数:', params);
    // TODO: 调用接口
    // submitRepairRequest(params).then(() => {...})

    message.success('接口待接入');
    submitLoading.value = false;
  });
}

// 重置表单
function handleReset() {
  Modal.confirm({
    title: '提示',
    content: '确定要重置表单吗？所有未保存的内容将丢失',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      formData.value = { ...initFormData };
      imageList.value = [];
    },
  });
}
</script>

<template>
  <Page>
    <Card title="报修申请">
      <Form layout="vertical">
        <!-- 设备信息 -->
        <Row :gutter="16">
          <Col :span="12">
            <FormItem label="设备编码" required>
              <Input
                v-model:value="formData.equipmentCode"
                placeholder="扫码或输入设备编码"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem label="设备名称">
              <Input
                :value="formData.equipmentName"
                disabled
                placeholder="自动带出"
              />
            </FormItem>
          </Col>
        </Row>

        <Row :gutter="16">
          <Col :span="12">
            <FormItem label="设备类型">
              <Input
                :value="formData.equipmentType"
                disabled
                placeholder="自动带出"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem label="所在车间">
              <Input
                :value="formData.workshop"
                disabled
                placeholder="自动带出"
              />
            </FormItem>
          </Col>
        </Row>

        <!-- 报修信息 -->
        <Row :gutter="16">
          <Col :span="24">
            <FormItem label="报修类型" required>
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
            <FormItem label="关联任务">
              <Input
                v-model:value="formData.relatedTask"
                placeholder="请先选择报修类型"
                disabled
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem label="故障时间" required>
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
            <FormItem label="紧急程度" required>
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
            <FormItem label="故障描述" required>
              <Textarea
                v-model:value="formData.faultDescription"
                placeholder="请详细描述故障现象"
                :rows="3"
              />
            </FormItem>
          </Col>
        </Row>

        <!-- 故障部位 -->
        <Row :gutter="16">
          <Col :span="24">
            <FormItem label="故障部位">
              <Textarea
                v-model:value="formData.faultParts"
                placeholder="请输入故障部位"
                :rows="2"
              />
            </FormItem>
          </Col>
        </Row>

        <!-- 故障图片 -->
        <Row :gutter="16">
          <Col :span="24">
            <FormItem label="故障图片">
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
                  <div class="mt-1">上传图片</div>
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
                重置
              </Button>
              <Button
                type="primary"
                size="large"
                :loading="submitLoading"
                @click="handleSubmit"
              >
                <Icon class="mr-1" icon="mdi:check" />
                提交报修
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </Card>
  </Page>
</template>

<style scoped>
::deep(.row-edit .vxe-body--row) {
  background-color: #fafafa;
}
</style>
