<script setup lang="ts">
import { onMounted } from 'vue';

import { Page } from '@vben/common-ui';

import {
  createUniver,
  defaultTheme,
  LocaleType,
  merge,
} from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import UniverPresetSheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN';

import { luckySheetDateil } from '#/api';

import '@univerjs/presets/lib/styles/preset-sheets-core.css';

function queryData() {
  luckySheetDateil().then((res) => {
    createWorkbook(res);
  });
}

function createWorkbook(data: any) {
  // univer,
  const { univerAPI } = createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: merge({}, UniverPresetSheetsCoreZhCN),
    },
    theme: defaultTheme,
    presets: [
      UniverSheetsCorePreset({
        container: 'test66',
      }),
    ],
  });
  try {
    univerAPI.createWorkbook({
      id: 'test',
      sheetOrder: ['sheet1'],
      name: 'test',
      appVersion: '3.0.0-alpha',
      locale: LocaleType.ZH_CN,
      styles: {
        GOAhZb: {
          n: {
            pattern: 'yyyy-mm-dd',
          },
        },
        'A-iqEg': {
          n: {
            pattern: 'yyyy/mm/dd',
          },
        },
        _yIXzW: {
          n: {
            pattern: 'yyyy-m-d am/pm h:mm',
          },
        },
        qLSh7Z: {
          n: {
            pattern: 'yyyy"年"MM"月"dd"日"',
          },
        },
      },
      sheets: {
        sheet1: {
          id: 'sheet1',
          cellData: data,
          name: '工作表1',
          rowCount: 1000,
          columnCount: 20,
          mergeData: [],
        },
      },
    });
  } catch (error) {
    console.error('创建工作簿时出错:', error);
  }
}
onMounted(() => {
  queryData();
});
</script>

<template>
  <Page>
    <div id="test66" class="h-[70vh]"></div>
  </Page>
</template>

<style scoped></style>
