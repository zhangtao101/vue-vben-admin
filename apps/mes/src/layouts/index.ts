const BasicLayout = () => import('./basic.vue');
const AuthPageLayout = () => import('./auth.vue');

const IFrameView = () => import('@vben/layouts').then((m) => m.IFrameView);
const EmptyLayout = () => import('@vben/layouts').then((m) => m.EmptyLayout);

export { AuthPageLayout, BasicLayout, EmptyLayout, IFrameView };
