import { defineConfig } from '@vben/vite-config';

// add the following dependencies
import { AntDesignXVueResolver } from 'ant-design-x-vue/resolver';
import components from 'unplugin-vue-components/vite';
export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      plugins: [
        // add the following plugin
        components({
          resolvers: [AntDesignXVueResolver()]
        })
      ],
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // mock代理目标地址
            target: 'http://localhost:5320/api',
            ws: true,
          },
        },
      },
    },
  };
});
