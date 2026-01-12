declare module 'vue-plugin-hiprint';
declare module 'animejs';
declare module 'bwip-js';
declare module 'vue-baidu-map-3x';

declare module '*.vue' {
  import { DefineComponent } from 'vue';

  const component: DefineComponent<object, object, any>;
  export default component;
}
