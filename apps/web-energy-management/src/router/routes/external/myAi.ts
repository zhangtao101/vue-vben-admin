import type { RouteRecordRaw } from 'vue-router';

import { VBEN_LOGO_URL } from '@vben/constants';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: () => import('#/views/ai/myTest.vue'),
    meta: {
      icon: VBEN_LOGO_URL,
      title: $t('demos.vben.title'),
      ignoreAccess: true,
    },
    name: 'aiTest',
    path: '/aiTest',
  },
];

export default routes;
