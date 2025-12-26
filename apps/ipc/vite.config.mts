import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // mock代理目标地址
            target: 'http://localhost:5320/api',
            ws: true,
          },
          '/ht/kettlestest/LuckySheetDateil': {
            changeOrigin: true,
            rewrite: (path) =>
              path.replace(/^\/ht\/kettlestest\/LuckySheetDateil/, ''),
            // 代理目标地址
            // target: 'https://v507z46671.yicp.fun',
            // target: 'https://l507466s71.vicp.fun',
            // target: 'http://540qgmj80458.vicp.fun',
            // target: 'http://540qgmj80458.vicp.fun',
            // target: 'http://27yw1bk43730.vicp.fun',
            // target: 'http:/192.168.0.215:8050',
            // target: 'http:/192.168.31.196:8050',
            // target: 'http://271z43k730.zicp.vip',
            // target: 'http://192.168.7.131:8050',
            // target: 'http://192.168.199.205:8050',
            // target: 'http://192.168.31.58:8050',
            target: 'http://192.168.0.215:8185/LuckySheetDateil',
            // target: 'http://271z43k730.zicp.vip',
          },
          '/ht': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/ht/, ''),
            // 代理目标地址
            // target: 'https://v507z46671.yicp.fun',
            // target: 'https://l507466s71.vicp.fun',
            // target: 'http://540qgmj80458.vicp.fun',
            // target: 'http://540qgmj80458.vicp.fun',
            // target: 'http://27yw1bk43730.vicp.fun',
            // target: 'http:/192.168.0.215:8050',
            // target: 'http:/192.168.31.196:8050',
            // target: 'http://271z43k730.zicp.vip',
            // target: 'http://192.168.7.131:8050',
            // target: 'http://192.168.199.205:8050',
            // target: 'http://192.168.31.58:8050',
            // target: 'http://192.168.0.60:8060',
            target: 'http://192.168.0.102:8060',
            // target: 'http://271z43k730.zicp.vip',
          },
        },
      },
    },
    build: {
      assetsInlineLimit: 4096, // 小于 4KB 的图标转为 base64
    },
  };
});
