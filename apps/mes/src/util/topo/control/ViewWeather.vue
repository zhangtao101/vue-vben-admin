<script setup lang="ts">
/* -------------------------------------------  Imports  ------------------------------------------- */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import { Col, Row } from 'ant-design-vue';

import { requestClient } from '#/api/request';

// import { useTopoStore } from '#/store';

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{ detail: any; editMode?: boolean }>();

/* -------------------------------------------  Store  ------------------------------------------- */
// const topoStore = useTopoStore();

/* -------------------------------------------  天气图片映射  ------------------------------------------- */
const weatherImages: {
  [key: string]: any;
} = {
  qing: new URL('#/assets/topo-img/weather/qing.png', import.meta.url).href,
  xue: new URL('#/assets/topo-img/weather/xue.png', import.meta.url).href,
  shachen: new URL('#/assets/topo-img/weather/shachen.png', import.meta.url)
    .href,
  wu: new URL('#/assets/topo-img/weather/wu.png', import.meta.url).href,
  bingbao: new URL('#/assets/topo-img/weather/bingbao.png', import.meta.url)
    .href,
  yun: new URL('#/assets/topo-img/weather/yun.png', import.meta.url).href,
  yu: new URL('#/assets/topo-img/weather/yu.png', import.meta.url).href,
  yin: new URL('#/assets/topo-img/weather/yin.png', import.meta.url).href,
  lei: new URL('#/assets/topo-img/weather/lei.png', import.meta.url).href,
};

/* -------------------------------------------  获取天气  ------------------------------------------- */
const weatherDetail = ref<any>({});
function getWeather() {
  const districtCode = props.detail.dataBind.districtCode;
  if (!districtCode) return;
  requestClient
    .get('http://v1.yiketianqi.com/api', {
      params: {
        appid: '66858276',
        appsecret: '4Zxc5wuj',
        version: 'v61',
        unescape: 1,
        cityid: districtCode,
      },
    })
    .then((res) => {
      weatherDetail.value = res;
    })
    .catch((error) => {
      console.error('天气接口失败', error);
    });
}

/* -------------------------------------------  定时器  ------------------------------------------- */
let timer: null | number = null;

/* -------------------------------------------  生命周期  ------------------------------------------- */
onMounted(() => {
  getWeather();
  if (props.detail.dataBind.districtCode) {
    timer = window.setInterval(getWeather, 60_000 * 60);
  }
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

/* -------------------------------------------  计算：是否显示完整模式  ------------------------------------------- */
const isFullMode = computed(
  () => props.detail.style.weatherModel === '完整模式',
);

/* -------------------------------------------  计算：动态样式  ------------------------------------------- */
const wrapperStyle = computed(() => ({
  fontFamily: props.detail.style.fontFamily,
  color: props.detail.style.foreColor,
  width: `${props.detail.style.position.w}px`,
  height: `${props.detail.style.position.h}px`,
  fontWeight: '600',
  border: `${props.detail.style.waterBorderWidth}px solid`,
  borderRadius: `${props.detail.style.borderRadius}px`,
  borderColor: props.detail.style.waterBorderColor,
  padding: isFullMode.value ? '10px 20px' : '0',
}));

/* -------------------------------------------  工具：获取天气图片  ------------------------------------------- */
function getWeaImage(val: string): string {
  return weatherImages[val] || weatherImages.qing;
}
</script>

<template>
  <div :key="weatherDetail.city">
    <div v-if="isFullMode" :style="wrapperStyle">
      <div
        :style="{
          fontSize: `${detail.style.position.h / 13}px`,
          padding: '10px',
        }"
      >
        <i class="el-icon-place"></i>
        <span>{{ weatherDetail.city }}</span>
      </div>
      <Row :gutter="20">
        <Col style="width: auto">
          <img
            :src="getWeaImage(weatherDetail.wea_img)"
            :style="{
              width: `${detail.style.position.h / 2}px`,
              height: `${detail.style.position.h / 2}px`,
            }"
          />
        </Col>
        <Col style="width: auto">
          <div :style="{ fontSize: `${detail.style.position.h / 5}px` }">
            {{ weatherDetail.tem }}°C
          </div>
          <div :style="{ fontSize: `${detail.style.position.h / 13}px` }">
            {{ weatherDetail.wea }} {{ weatherDetail.win }}
            {{ weatherDetail.win_speed }}
          </div>
        </Col>
      </Row>
      <div :style="{ fontSize: `${detail.style.position.h / 13}px` }">
        <span>湿度：{{ weatherDetail.humidity }}</span>
        <span style=" margin-right: 10px;margin-left: 10px">|</span>
        <span>气压：{{ weatherDetail.pressure }}</span>
        <span style=" margin-right: 10px;margin-left: 10px">|</span>
        <span>
          空气质量：
          <span style="color: #ffb527">{{ weatherDetail.air_level }}</span>
        </span>
      </div>
    </div>
    <div v-else :style="wrapperStyle">
      <div
        :style="{
          fontSize: `${detail.style.position.h / 13}px`,
          padding: '10px',
        }"
      >
        <i class="el-icon-place"></i>
        <span>{{ weatherDetail.city }}</span>
      </div>
      <Row :gutter="20">
        <Col style="width: auto">
          <img
            :src="getWeaImage(weatherDetail.wea_img)"
            :style="{
              width: `${detail.style.position.h / 2}px`,
              height: `${detail.style.position.h / 2}px`,
            }"
          />
        </Col>
        <Col style="width: auto">
          <div :style="{ fontSize: `${detail.style.position.h / 5}px` }">
            {{ weatherDetail.tem }}°C
          </div>
          <div :style="{ fontSize: `${detail.style.position.h / 10}px` }">
            {{ weatherDetail.wea }}
          </div>
        </Col>
      </Row>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.weatherClass {
  border: 1px solid;
  border-color: #000;
  border-radius: 10px;
}
</style>
