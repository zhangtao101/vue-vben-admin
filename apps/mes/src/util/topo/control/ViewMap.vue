<script setup lang="ts">
/* -------------------------------------------  Imports  ------------------------------------------- */
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';
import { BaiduMap, BmCityList, BmInfoWindow, BmMarker } from 'vue-baidu-map-3x';

import { Col, Row, Tag } from 'ant-design-vue';
// import { useRoute } from 'vue-router';

import { queryScadaAllDeviceShort } from '#/api';
import forbiddenImg from '#/assets/images/marker-forbidden.png';
import inactiveImg from '#/assets/images/marker-inactive.png';
import offlineImg from '#/assets/images/marker-offline.png';
import onlineImg from '#/assets/images/marker-online.png';
// import { useTopoStore } from '#/store';

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{ detail: any; editMode?: boolean }>();

/* -------------------------------------------  Store & Route  ------------------------------------------- */
// const topoStore = useTopoStore();
// const route = useRoute();

/* -------------------------------------------  地图状态  ------------------------------------------- */
const center = reactive({ lng: 116.406_05, lat: 39.915_879 });
const zoom = ref(10);
const points = ref<any[]>([]);
const currIndex = ref(-1);
let map: any = null;
const ak = import.meta.env.VITE_GLOB_BAI_DU_AK;

/* -------------------------------------------  图标映射  ------------------------------------------- */
const iconMap: Record<number, string> = {
  3: onlineImg,
  4: offlineImg,
  1: inactiveImg,
  2: forbiddenImg,
};

/* -------------------------------------------  计算：地图样式触发器  ------------------------------------------- */
const mapModel = computed(() => props.detail.style.mapModel as string);
watch(mapModel, (newVal) => {
  if (map && newVal !== 'normal') map.setMapStyle({ style: newVal });
});

/* -------------------------------------------  百度地图就绪回调  ------------------------------------------- */
// BMap
function ready({ mapInstance }: any) {
  map = mapInstance;
  if (mapModel.value !== 'normal') map.setMapStyle({ style: mapModel.value });
}

/* -------------------------------------------  获取设备列表  ------------------------------------------- */
function getList() {
  queryScadaAllDeviceShort().then((res: any) => {
    if (res.code !== 200) return;
    setZoom(res.rows);
    points.value = res.rows;
  });
}

/* -------------------------------------------  设置中心与缩放  ------------------------------------------- */
function setZoom(sdata: any[]) {
  if (sdata.length === 0) {
    center.lng = 103.388_611;
    center.lat = 35.563_611;
    zoom.value = 5;
    return;
  }

  let maxLng = sdata[0].longitude;
  let minLng = sdata[0].longitude;
  let maxLat = sdata[0].latitude;
  let minLat = sdata[0].latitude;

  sdata.forEach((d: any) => {
    if (d.longitude > maxLng) maxLng = d.longitude;
    if (d.longitude < minLng) minLng = d.longitude;
    if (d.latitude > maxLat) maxLat = d.latitude;
    if (d.latitude < minLat) minLat = d.latitude;
  });

  const cenLng = (Number.parseFloat(maxLng) + Number.parseFloat(minLng)) / 2;
  const cenLat = (Number.parseFloat(maxLat) + Number.parseFloat(minLat)) / 2;
  center.lng = cenLng;
  center.lat = cenLat;

  const averLng = rad(maxLng) - rad(minLng);
  const averLat = rad(maxLat) - rad(minLat);
  let s =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin(averLat / 2) ** 2 +
          Math.cos(rad(maxLat)) *
            Math.cos(rad(minLat)) *
            Math.sin(averLng / 2) ** 2,
      ),
    );
  s = s * 6378.137;
  s = Math.round(s * 10_000) / 10_000;

  const zoomTable = [
    50, 100, 200, 500, 1000, 2000, 5000, 10_000, 20_000, 25_000, 50_000,
    100_000, 200_000, 500_000, 1_000_000, 2_000_000,
  ];
  for (const [i, element] of zoomTable.entries()) {
    if (element - s > 0) {
      zoom.value = 8 - i + 3;
      break;
    }
  }
}

function rad(d: number): number {
  return (d * Math.PI) / 180;
}

/* -------------------------------------------  弹窗控制  ------------------------------------------- */
function clickHandler(key: number) {
  currIndex.value = key;
}
function infoWindowClose() {
  currIndex.value = -1;
}

/* -------------------------------------------  生命周期  ------------------------------------------- */
onMounted(() => {
  getList();
  const timer = window.setInterval(getList, 60_000);
  onBeforeUnmount(() => clearInterval(timer));
});
</script>

<template>
  <div>
    <BaiduMap
      id="mapContainer"
      :ak="ak"
      v="3.0"
      type="API"
      :center="center"
      :zoom="zoom"
      :scroll-wheel-zoom="true"
      :style="{
        width: `${detail.style.position.w}px`,
        height: `${detail.style.position.h}px`,
      }"
      @ready="ready"
    >
      <BmCityList anchor="BMAP_ANCHOR_TOP_LEFT" v-if="false" />
      <BmMarker
        v-for="item in points"
        :key="item.deviceId"
        :position="{ lng: item.longitude, lat: item.latitude }"
        :dragging="false"
        :icon="{ url: iconMap[item.status], size: { width: 40, height: 40 } }"
        @click="clickHandler(item.deviceId)"
      >
        <BmInfoWindow
          :show="item.deviceId === currIndex"
          :height="180"
          :width="230"
          @close="infoWindowClose"
        >
          <Row>
            <Col :span="24">
              <div class="grid-content bg-purple-dark proSize">
                <span>设备编号：</span>
                <span>{{ item.serialNumber }}</span>
              </div>
            </Col>
            <Col :span="24">
              <div class="grid-content bg-purple-dark proSize">
                <span>设备名称：</span>
                <span>{{ item.deviceName }}</span>
              </div>
            </Col>
            <Col :span="24">
              <div class="grid-content bg-purple-dark proSize">
                <span>所在地址：</span>
                <span>{{ item.networkAddress }}</span>
              </div>
            </Col>
            <Col :span="24">
              <div class="grid-content bg-purple-dark proSize">
                <span>设备状态：</span>
                <Tag v-if="item.status === 1" type="warning">未激活</Tag>
                <Tag v-else-if="item.status === 2" type="danger"> 禁用 </Tag>
                <Tag v-else-if="item.status === 3" type="success"> 在线 </Tag>
                <Tag v-else-if="item.status === 4" type="info">离线</Tag>
              </div>
            </Col>
          </Row>
        </BmInfoWindow>
      </BmMarker>
    </BaiduMap>

    <!-- 触发器 -->
    <div v-show="false">{{ mapModel }}</div>
  </div>
</template>

<style lang="scss">
.proSize {
  margin: 10px 0;
  font-size: 13px;
}
</style>
