import { hiprint } from 'vue-plugin-hiprint';

const templateMap: any = {};

export function newHiprintPrintTemplate(key: any, options: any) {
  const template = new hiprint.PrintTemplate(options);
  templateMap[key] = template;
  return template;
}

export function getHiprintPrintTemplate(key: any) {
  return templateMap[key];
}
