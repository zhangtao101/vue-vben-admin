import { computed } from 'vue';

import { useTopoStore } from '#/store';
import topoUtil from '#/util/topo/topo_utils';

export function useCanvas() {
  const topoStore = useTopoStore();

  /* 颜色转换 */
  function hex2rgba(hex: string): string {
    // 颜色转换
    // hex格式如#ffffff
    const colorArr = [];
    for (let i = 1; i < 7; i += 2) {
      colorArr.push(Number.parseInt(`0x${hex.slice(i, i + 2)}`)); // 16进制值转10进制
    }
    const alpha = Number.parseInt(`0x${hex.slice(7, 9)}`) / 255; // 16进制值转10进制
    return `rgba(${colorArr.join(',')},${alpha})`;
  }

  /* 根据 MQTT 计算应显示的颜色（纯计算，不修改外部状态） */
  const foreColorFromMqtt = computed(() => (detail: any): string => {
    const bind = detail.dataBind;
    const mqtt = topoStore.mqttData;

    if (!bind.identifier || !mqtt || mqtt.serialNumber !== bind.serialNumber)
      return '';

    const msg = mqtt.message.find((m: any) => m.id === bind.identifier);
    if (!msg) return '';

    for (const s of bind.stateList) {
      if (topoUtil.judgeSize(s.paramCondition, msg.value, s.paramData))
        return s.foreColor;
    }
    return '';
  });

  /* 最终颜色（含转换） */
  function getForeColor(detail: any): string {
    const dynamic = foreColorFromMqtt.value(detail);
    const staticColor = detail.style.foreColor;
    const final = dynamic || staticColor || 'grey';
    return final.startsWith('#') ? hex2rgba(final) : final;
  }

  /* 凸多边形点击检测 */
  function inRange(x: number, y: number, points: [number, number][]): boolean {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const [xi, yi]: any = points[i];
      const [xj, yj]: any = points[j];
      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  return { getForeColor, inRange };
}
