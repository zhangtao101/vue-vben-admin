const BasicLayout = () => import('./basic.vue');
const AuthPageLayout = () => import('./auth.vue');
const EmptyLayout = () => import('./empty.vue');

const IFrameView = () => import('@vben/layouts').then((m) => m.IFrameView);

export { AuthPageLayout, BasicLayout, EmptyLayout, IFrameView };
