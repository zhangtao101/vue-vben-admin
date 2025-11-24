<script setup lang="ts">
/* -------------------------------------------  Imports  ------------------------------------------- */
import {
  computed,
  createApp,
  defineComponent,
  nextTick,
  onMounted,
  ref,
} from 'vue';

import { queryComponentById } from '#/api';
import { useTopoStore } from '#/store';
import topoUtil from '#/util/topo/topo_utils';
import { useTopoAnimation } from '#/util/topo/useTopoAnimation';

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{ detail: any; editMode: boolean }>();

/* -------------------------------------------  Store  ------------------------------------------- */
const topoStore = useTopoStore();
const mqttData = computed(() => topoStore.mqttData as any);

/* -------------------------------------------  DOM  ------------------------------------------- */
const xcomp = ref<HTMLDivElement>();

/* -------------------------------------------  本地状态  ------------------------------------------- */
const data = ref<{
  componentScript: string;
  componentStyle: string;
  componentTemplate: string;
  id?: string;
}>({
  componentTemplate: '',
  componentStyle: '',
  componentScript: '',
});

/* -------------------------------------------  动画能力  ------------------------------------------- */
const { play, pause, show, hide } = useTopoAnimation(
  props.detail,
  props.editMode,
);

/* -------------------------------------------  计算：动画触发  ------------------------------------------- */
const animateChange = computed(() => {
  if (!mqttData.value) return;
  const db = props.detail.dataBind as any;
  const da = props.detail.dataAction as any;
  if (
    da.serialNumber &&
    da.identifier !== null &&
    da.paramJudge !== null &&
    da.paramJudgeData !== undefined &&
    mqttData.value.serialNumber === da.serialNumber
  ) {
    const msg = (mqttData.value.message as any[]).find(
      (m) => m.id === da.identifier,
    );
    if (msg) {
      const val = msg.value;
      const isGd = topoUtil.judgeSize(da.paramJudge, val, da.paramJudgeData);
      if (isGd) {
        if (db.xyAction) show();
        play();
      } else {
        if (db.xyAction) hide();
        pause();
      }
    }
  }
  return true;
});

/* -------------------------------------------  安全编译脚本（避免 new Function）  ------------------------------------------- */
function compileScript(code: string): any {
  if (!code.trim()) return {};
  // 仅支持返回一个普通对象；禁止访问全局
  const wrapped = `(function(){${code.replace(/export\s+default/, 'return')}})()`;
  try {
    // eslint-disable-next-line no-eval
    return eval(wrapped);
  } catch (error) {
    console.warn('[ViewComponent] 脚本编译失败:', error);
    return {};
  }
}

/* -------------------------------------------  加载自定义组件  ------------------------------------------- */
function loadData() {
  const tpl = data.value.componentTemplate;
  if (!tpl) return;

  /* 注入样式 */
  const styleCss = data.value.componentStyle;
  if (styleCss) {
    const style = document.createElement('style');
    style.innerHTML = styleCss;
    document.head.append(style);
  }

  /* 编译脚本 */
  const scriptObj = compileScript(data.value.componentScript);
  const componentDef = defineComponent({
    ...scriptObj,
    template: tpl,
  });

  /* 清空旧节点 */
  if (xcomp.value) xcomp.value.innerHTML = '';
  const newDiv = document.createElement('div');
  const id = `xcomp-${data.value.id || Math.random().toString(36).slice(2)}`;
  newDiv.id = id;
  xcomp.value!.append(newDiv);

  /* Vue3 挂载 */
  createApp(componentDef).mount(`#${id}`);
}

/* -------------------------------------------  获取组件数据  ------------------------------------------- */
function getComponentDataById(id: string) {
  queryComponentById(id).then((res: any) => {
    if (res.code === 200) {
      data.value = res.data;
      nextTick(loadData);
    }
  });
}

/* -------------------------------------------  生命周期  ------------------------------------------- */
onMounted(() => {
  const id = (props.detail.dataBind.componentId as string) ?? '';
  if (id) getComponentDataById(id);
});
</script>

<template>
  <div :id="detail.identifier" ref="xcomp" class="view-component">
    <div v-show="false">{{ animateChange }}</div>
  </div>
</template>

<style lang="scss">
.view-component {
  width: 100%;
  height: 100%;
  padding: 10px;
  overflow-y: auto;
}
</style>
