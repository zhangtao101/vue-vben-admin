<script setup lang="ts">
/* -------------------------------------------  Imports  ------------------------------------------- */
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

import { queryDeviceBind } from '#/api';
import switchImage from '#/assets/topo-img/images/switch_128.png';
import { useTopoStore } from '#/store';
import topoUtil from '#/util/topo/topo_utils';

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{ detail: any; editMode?: boolean }>();

/* -------------------------------------------  Store & Route  ------------------------------------------- */
const topoStore = useTopoStore();
const route = useRoute();
const mqttData = computed(() => topoStore.mqttData as any);

/* -------------------------------------------  本地状态（只读父级，不赋值 props）  ------------------------------------------- */
const imageURL = ref(props.detail.style.url || switchImage);
const deviceTimer = ref<null | number>(null);

/* -------------------------------------------  样式对象（由 watchEffect 驱动）  ------------------------------------------- */
const filterClass = ref<any>({
  width: '100%',
  height: '100%',
  filter: '',
  position: 'absolute',
  animation: `${props.detail.hdClassName} 5s infinite`,
});

/* -------------------------------------------  工具：hex → feColorMatrix  ------------------------------------------- */
function hexTofeColorMatrix(hex: string): string {
  if (!hex) hex = '0000';
  hex = hex.replace('#', '');
  const RGB: number[] = [];
  const numberList = [
    1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
  ];
  for (let i = 0; i < hex.length; i += 2) {
    const firstDigit = Number.parseInt(hex[i]!, 16);
    const firstDigitPartial = firstDigit * 16;
    let RGBValue = Number.parseInt(hex[i + 1]!, 16) + firstDigitPartial;
    RGBValue = RGBValue / 255;
    RGB.push(Number(RGBValue.toFixed(2)));
  }
  numberList[0] = RGB[0] ?? 0;
  numberList[6] = RGB[1] ?? 0;
  numberList[12] = RGB[2] ?? 0;
  return numberList.join(' ');
}

/* -------------------------------------------  副作用：颜色 & 滤镜  ------------------------------------------- */
watchEffect(() => {
  const fc = props.detail.style.foreColor as string;
  const isFilter = props.detail.style.isFilter as boolean;

  if (!fc) {
    filterClass.value = { ...filterClass.value, marginLeft: '', filter: '' };
    return;
  }

  if (isFilter) {
    filterClass.value.marginLeft = '';
    filterClass.value.filter = `url(#${props.detail.identifier}_svg)`;
  } else {
    filterClass.value.marginLeft = '-10000px';
    filterClass.value.filter = `drop-shadow(5000px 0px ${fc})`;
  }
});

/* -------------------------------------------  副作用：图片地址  ------------------------------------------- */
watchEffect(() => {
  const url = props.detail.style.url as string;
  imageURL.value = url || switchImage;
});

/* -------------------------------------------  副作用：变量状态  ------------------------------------------- */
watchEffect(() => {
  const db = props.detail.dataBind as any;
  const da = props.detail.dataAction as any;

  if (
    db.identifier &&
    mqttData.value &&
    mqttData.value.serialNumber === db.serialNumber &&
    db.activeName === '变量状态'
  ) {
    const msg = (mqttData.value.message as any[]).find(
      (m) => m.id === db.identifier,
    );
    if (!msg) return;

    let val: any = msg.value;
    if (val === null) val = 0;

    (db.stateList as any[]).forEach((ele) => {
      const ok = topoUtil.judgeSize(ele.paramCondition, val, ele.paramData);
      if (db.controValue === '0开1关') {
        da.actualValue = val === 1 ? '关' : '开';
      } else if (db.controValue === '0关1开') {
        da.actualValue = val === 0 ? '关' : '开';
      }
      if (ok) {
        /* 只改本地副本 */
        imageURL.value = ele.imageUrl;
        filterClass.value.borderColor = ele.foreColor;
      }
    });
  }
});

/* -------------------------------------------  获取设备状态  ------------------------------------------- */
function getDeviceRealStatus(serialNumber: string) {
  queryDeviceBind({
    pageNum: 1,
    pageSize: 9999,
    serialNumber,
    scadaGuid: route.query.guid as string,
  })
    .then((res: any) => {
      if (res.code !== 200 || res.rows.length === 0) return;

      const status = res.rows[0].status;
      const db = props.detail.dataBind as any;

      if (!db.openImageUrl || !db.shutImageUrl) return;

      switch (status) {
        case 2: {
          imageURL.value = db.shutImageUrl;
          break;
        }
        case 3: {
          imageURL.value = db.openImageUrl;
          break;
        }
        case 4: {
          imageURL.value = db.warnImageUrl;
          break;
        }
      }
    })
    .catch(() => {});
}

/* -------------------------------------------  生命周期  ------------------------------------------- */
onMounted(() => {
  const db = props.detail.dataBind as any;
  if (db.activeName === '设备状态') {
    getDeviceRealStatus(db.serialNumber as string);
    deviceTimer.value = window.setInterval(
      () => getDeviceRealStatus(db.serialNumber as string),
      60_000,
    );
  }
});

onBeforeUnmount(() => {
  if (deviceTimer.value) clearInterval(deviceTimer.value);
});
</script>

<template>
  <div class="view-image-switch">
    <img
      :style="[filterClass]"
      :src="imageURL"
      @dragstart.prevent
      @dragover.prevent
      @drop.prevent
    />

    <svg id="svg">
      <defs>
        <filter :id="`${props.detail.identifier}_svg`">
          <feColorMatrix
            color-interpolation-filters="sRGB"
            type="matrix"
            :values="hexTofeColorMatrix(props.detail.style.foreColor as string)"
          />
        </filter>
      </defs>
    </svg>

    <!-- 纯触发用 -->
    <div v-show="false">{{ mqttData }}</div>
  </div>
</template>

<style lang="scss">
.view-image-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}
</style>
