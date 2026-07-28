import { ref } from 'vue';

import { defineStore } from 'pinia';

const STORAGE_KEY = 'ipc_current_section';

interface SectionInfo {
  sectionCode: string;
  sectionName: string;
}

function loadSection(): SectionInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as SectionInfo;
    }
  } catch {
    // 解析失败时忽略，返回空对象
  }
  return { sectionCode: '', sectionName: '' };
}

export const useSectionStore = defineStore('section', () => {
  const initial = loadSection();
  const sectionCode = ref(initial.sectionCode);
  const sectionName = ref(initial.sectionName);

  function setSection(code: string, name: string) {
    sectionCode.value = code;
    sectionName.value = name;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ sectionCode: code, sectionName: name }),
    );
  }

  function clearSection() {
    sectionCode.value = '';
    sectionName.value = '';
    localStorage.removeItem(STORAGE_KEY);
  }

  return { sectionCode, sectionName, setSection, clearSection };
});
