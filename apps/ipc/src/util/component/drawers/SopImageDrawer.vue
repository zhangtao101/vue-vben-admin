<script setup lang="ts">
/**
 * [INPUT]: 依赖 vue、ant-design-vue（Button/Col/Drawer/Empty/Image/Row/Spin）、#/api 的 getSopImageByProductCode 接口、#/locales 国际化。
 * [OUTPUT]: 对外提供 SopImageDrawer SOP 图像预览抽屉组件，通过 open(productCode) 打开加载。
 * [POS]: 位于 util/component/drawers，供包装/投料等工序以 ref 方式调用，按产品编码展示 SOP 图片。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-10-08 00:00:00
 */
import { computed, ref } from 'vue';

import { Button, Col, Drawer, Empty, Image, Row, Spin } from 'ant-design-vue';

import { getSopImageByProductCode } from '#/api';
import { $t } from '#/locales';

defineOptions({ name: 'SopImageDrawer' });

/**
 * 外部传入的产品编码，open 未传参时使用该值
 */
const props = defineProps({
  productCode: { type: String, default: '' },
});

// ========== 抽屉控制 ==========
/** 抽屉可见性 */
const show = ref(false);
/** 加载状态 */
const loading = ref(false);
/** 当前查询的产品编码 */
const productCodeRef = ref('');
/** SOP 图片地址列表 */
const imageList = ref<string[]>([]);

/** 图片数量提示：无数据时展示空态 */
const hasImage = computed(() => imageList.value.length > 0);

/**
 * 打开 SOP 图像抽屉并加载图片
 * @param productCode 产品编码，省略时使用 props.productCode
 * @since 2026-10-08
 */
function open(productCode?: string) {
  productCodeRef.value = productCode || props.productCode;
  show.value = true;
  loadSopImages();
}

defineExpose({ open });

/**
 * 加载 SOP 图片列表
 * @since 2026-10-08
 */
function loadSopImages() {
  loading.value = true;
  getSopImageByProductCode({ productCode: productCodeRef.value })
    .then((data: any) => {
      const list = Array.isArray(data) ? data : [];
      imageList.value = list.filter((url: any) => !!url);
    })
    .catch(() => {
      imageList.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
}

/**
 * 关闭抽屉并清空数据，回到初始状态
 * @since 2026-10-08
 */
function handleClose() {
  show.value = false;
  imageList.value = [];
}
</script>

<template>
  <Drawer
    v-model:open="show"
    :title="$t('sopImage.title')"
    width="900"
    :destroy-on-close="true"
    :footer-style="{ textAlign: 'right' }"
    @close="handleClose"
  >
    <Spin :spinning="loading">
      <Empty
        v-if="!hasImage"
        :description="$t('sopImage.noData')"
        class="py-10"
      />
      <Row v-else :gutter="[16, 16]">
        <Col v-for="(url, index) in imageList" :key="index" :span="8">
          <Image :src="url" :alt="`SOP-${index + 1}`" class="w-full" />
        </Col>
      </Row>
    </Spin>

    <template #footer>
      <Button @click="handleClose">{{ $t('common.close') }}</Button>
    </template>
  </Drawer>
</template>
