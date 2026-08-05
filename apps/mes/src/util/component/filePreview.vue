<script lang="ts" setup>
/**
 * [INPUT]: 接收文件 URL 字符串，使用 @vue-office 系列包进行在线预览
 * [OUTPUT]: 渲染文件预览或空状态占位
 * [POS]: 公共组件，位于 util/component/filePreview.vue
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-08-05 09:00:00
 */
import { computed } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import VueOfficeDocx from '@vue-office/docx';
import VueOfficeExcel from '@vue-office/excel';
import VueOfficePdf from '@vue-office/pdf';
import VueOfficePPtx from '@vue-office/pptx';

import '@vue-office/docx/lib/index.css';
import '@vue-office/excel/lib/index.css';

/**
 * 组件 Props 定义。
 */
interface FilePreviewProps {
  /** 文件 URL 路径 */
  url?: string;
  /** 空状态占位文本 */
  placeholder?: string;
}

const props = withDefaults(defineProps<FilePreviewProps>(), {
  url: '',
  placeholder: '文件预览区域',
});

/**
 * 根据文件 URL 后缀动态确定预览组件。
 * @returns 对应的 VueOffice 组件或 null
 * @since 2026-08-05 09:00:00
 */
const previewComp = computed(() => {
  const url = props.url;
  if (!url) return null;
  const suffix = url.split('.').pop()?.toLowerCase();
  switch (suffix) {
    case 'docx': {
      return VueOfficeDocx;
    }
    case 'pdf': {
      return VueOfficePdf;
    }
    case 'pptx': {
      return VueOfficePPtx;
    }
    case 'xlsx': {
      return VueOfficeExcel;
    }
    default: {
      return null;
    }
  }
});
</script>

<template>
  <div class="file-preview-wrapper" style="width: 100%; min-height: 300px; overflow: auto;">
    <component
      v-if="previewComp"
      :is="previewComp"
      :src="url"
      class="h-[600px]!"
    />
    <div
      v-else
      class="file-preview-placeholder rounded border border-dashed p-8 text-center"
      style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 300px;
        border-color: var(--ant-color-border);
        color: var(--ant-color-text-secondary);
      "
    >
      <Icon
        icon="mdi:file-document-outline"
        class="mb-2"
        style="font-size: 48px; color: var(--ant-color-text-disabled)"
      />
      <div>{{ placeholder }}</div>
    </div>
  </div>
</template>
