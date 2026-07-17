<script lang="ts" setup>
import { ref } from 'vue';

import { useAccessStore } from '@vben/stores';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Space,
  Textarea,
  Upload,
} from 'ant-design-vue';
import { type Rule } from 'ant-design-vue/es/form';

import { updateProductBom } from '#/api';
import { $t } from '#/locales';

defineOptions({
  name: 'ProductBomEditDrawer',
});

const emit = defineEmits<{
  refresh: [];
}>();

const show = ref(false);
const submitting = ref(false);
const formRef = ref<any>();

function buildEmpty() {
  return {
    id: undefined,
    bomTypeCode: '',
    productCode: '',
    productName: '',
    imagePath: '',
    remark: '',
  };
}

function open(payload: any) {
  show.value = true;
  formData.value = { ...buildEmpty(), ...payload };
  // 回显已存在的产品图片
  imageFiles.value = payload?.imagePath
    ? [
        {
          uid: -1,
          url: payload.imagePath,
          status: 'done',
          name: payload.imagePath.match(/[^/]+$/)?.[0] || 'image',
        },
      ]
    : [];
}

defineExpose({ open });

const formData = ref<any>(buildEmpty());

const rules: Record<string, Rule[]> = {
  productCode: [{ required: true, message: $t('baseInfo.productCode') }],
  productName: [{ required: true, message: $t('baseInfo.productName') }],
};

// region 产品图片上传
const accessStore = useAccessStore();
const imageFiles = ref<any>([]);

function getUploadUrl() {
  return `/ht/${import.meta.env.VITE_GLOB_MES_MAIN}/iqc/uploadFile`;
}

const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');

function handleImageChange(info: any) {
  imageFiles.value = info.fileList;
  if (info.file.status === 'done') {
    const res = info.file.response;
    formData.value.imagePath = res?.data ?? res;
    message.success($t('common.successfulOperation'));
  } else if (info.file.status === 'error') {
    message.error(info.file.response?.message || $t('common.operationFailed'));
  }
}

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

function handleSubmit() {
  formRef.value
    .validate()
    .then(() => {
      submitting.value = true;
      updateProductBom(formData.value)
        .then(() => {
          message.success($t('common.successfulOperation'));
          show.value = false;
          emit('refresh');
        })
        .catch((error: any) => {
          message.error(error?.message || $t('common.operationFailed'));
        })
        .finally(() => {
          submitting.value = false;
        });
    })
    .catch(() => {});
}

function handleClose() {
  show.value = false;
  submitting.value = false;
  formRef.value?.clearValidate?.();
  formData.value = buildEmpty();
  imageFiles.value = [];
  previewVisible.value = false;
  previewTitle.value = '';
}
</script>

<template>
  <Drawer
    v-model:open="show"
    :title="$t('common.edit')"
    width="640"
    :destroy-on-close="true"
    :footer-style="{ textAlign: 'right' }"
    @close="handleClose"
  >
    <Form ref="formRef" :model="formData" :rules="rules" layout="vertical">
      <FormItem :label="$t('baseInfo.productCode')" name="productCode">
        <Input v-model:value="formData.productCode" disabled />
      </FormItem>
      <FormItem :label="$t('baseInfo.productName')" name="productName">
        <Input v-model:value="formData.productName" />
      </FormItem>
      <FormItem :label="$t('baseInfo.bomCategory')" name="bomTypeCode">
        <Input v-model:value="formData.bomTypeCode" />
      </FormItem>
      <FormItem :label="$t('baseInfo.productImage')" name="imagePath">
        <Upload
          v-model:file-list="imageFiles"
          list-type="picture-card"
          accept="image/*"
          name="file"
          :action="getUploadUrl()"
          :headers="{ Authorization: `${accessStore.accessToken}` }"
          @change="handleImageChange"
          @preview="handlePreview"
        >
          <div v-if="imageFiles.length === 0">
            <Icon
              icon="mdi:cloud-upload"
              class="inline-block align-middle text-4xl text-[#5085ff]"
            />
          </div>
        </Upload>
      </FormItem>
      <FormItem :label="$t('baseInfo.remarkDescription')" name="remark">
        <Textarea v-model:value="formData.remark" />
      </FormItem>
    </Form>

    <template #footer>
      <Space>
        <Button @click="handleClose">{{ $t('common.cancel') }}</Button>
        <Button type="primary" :loading="submitting" @click="handleSubmit">
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
